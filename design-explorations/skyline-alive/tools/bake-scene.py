#!/usr/bin/env python3
"""Bake the scene layers that let the Skyline paintings move.

From the four live paintings (identical composition) this writes:
  alive-scene.png  R = depth (sky 0 ... foreground trees 255, softened)
                   G = sky mask (255 above the mountain ridge)
                   B = foreground-tree weight (softened), for wind sway
  alive-sky.png    16 x 12 lookup: rows 0-7 are the painted sky gradient
                   (frame f: row 2f = left side, 2f+1 = right side; x = top -> ridge),
                   rows 8-11 hold each frame's cloud colours (x 0..2 = light, body, shade)

Run from the repo root:  python3 design-explorations/skyline-alive/tools/bake-scene.py
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, '..', 'assets', 'img')
W, H = 1305, 816
FILES = [('night', 'sky-night-4.webp'), ('dawn', 'sky-dawn-4.webp'), ('day', 'sky-day-4.webp'), ('sunset', 'sky-sunset-3.webp')]
frames = [np.asarray(Image.open(os.path.join(IMG, f)).convert('RGB').resize((W, H), Image.LANCZOS)).astype(np.float32) / 255 for _, f in FILES]

# ridge traced by eye, then refined: the lowest point that looks like open sky in all four paintings
EYE = [(0, 255), (80, 228), (140, 265), (180, 255), (220, 270), (290, 252), (340, 280), (395, 268),
       (480, 266), (560, 298), (620, 296), (700, 298), (760, 318), (830, 311), (900, 333), (990, 333),
       (1060, 358), (1120, 360), (1200, 373), (1305, 383)]
xs = np.arange(W)
eye = np.interp(xs, [p[0] for p in EYE], [p[1] for p in EYE])
clear = np.arange(H)[:, None] < (eye[None, :] - 12)
wR = np.clip((xs / W - 0.3) / 0.6, 0, 1)
wR = wR * wR * (3 - 2 * wR)


def row_model(a):
    """per-row sky colour on the left and right halves, from clearly-open sky"""
    L = np.zeros((H, 3), np.float32)
    R = np.zeros((H, 3), np.float32)
    lastL = lastR = None
    for y in range(H):
        cl, cr = clear[y, :W // 2], clear[y, W // 2:]
        if cl.sum() > 20:
            lastL = np.median(a[y, :W // 2][cl], 0)
        if cr.sum() > 20:
            lastR = np.median(a[y, W // 2:][cr], 0)
        L[y] = lastL if lastL is not None else 0
        R[y] = lastR if lastR is not None else (lastL if lastL is not None else 0)
    return L, R


agree = np.ones((H, W), bool)
models = []
for a in frames:
    L, R = row_model(a)
    M = L[:, None, :] * (1 - wR[None, :, None]) + R[:, None, :] * wR[None, :, None]
    models.append(M)
    agree &= np.abs(a - M).max(-1) < 0.10
agree = ndi.binary_opening(agree, iterations=1)
ridge = np.zeros(W)
for x in range(W):
    y = int(min(H - 3, eye[x] + 70))
    while y > 2 and not (agree[y, x] and agree[y - 1, x] and agree[y - 2, x]):
        y -= 1
    ridge[x] = y + 1
ridge = ndi.median_filter(np.clip(ndi.median_filter(ridge, 5), eye - 14, eye + 45), 3)
yy, xx = np.mgrid[0:H, 0:W]
sky = yy < ridge[None, :]

# foreground trees: foliage masses that touch the bottom or side edges
day = frames[2]
r, g, b = day[..., 0], day[..., 1], day[..., 2]
fol = ((g > r + 0.04) & (g >= b - 0.02) & (yy > 470)) | ((day.max(-1) < 0.28) & (yy > 520) & (g >= r))
P = 6
fp = ndi.binary_fill_holes(ndi.binary_closing(np.pad(fol, P, mode='edge'), iterations=3))
fol = fp[P:-P, P:-P]
lab, n = ndi.label(fol)
edge = set(np.unique(lab[H - 1, :]).tolist()) | set(np.unique(lab[520:, 0]).tolist()) | set(np.unique(lab[560:, W - 1]).tolist())
keep = np.zeros(n + 1, bool)
for l in edge:
    if l:
        keep[l] = True
trees = keep[lab]
for x0, y0, x1, y1 in [(355, 500, 885, 668), (985, 518, 1258, 648), (880, 570, 1000, 735)]:
    trees[y0:y1, x0:x1] = False
tp = ndi.binary_opening(np.pad(trees, P, mode='edge'), iterations=2)
trees = tp[P:-P, P:-P]

# depth: far ridge -> city -> square, foreground trees nearest; softened so parallax warps, never tears
base = np.clip((yy - ridge[None, :]) / (760 - ridge[None, :]), 0, 1)
depth = np.where(sky, 0.0, 0.1 + 0.55 * base)
depth = np.where(trees, 1.0, depth)
depth = ndi.gaussian_filter(depth, 5)
treew = ndi.gaussian_filter(trees.astype(np.float32), 3)

scene = np.dstack([depth * 255, sky * 255.0, treew * 255]).clip(0, 255).astype(np.uint8)
Image.fromarray(scene).save(os.path.join(IMG, 'alive-scene.png'), optimize=True)

# sky gradient lookup, sampled by height as a fraction of the ridge
lut = np.zeros((12, 16, 3), np.float32)
for f, a in enumerate(frames):
    M = models[f]
    for side, sel in ((0, xs < W / 3), (1, xs > 2 * W / 3)):
        for i in range(16):
            fr = i / 15.0
            pts = []
            for x in np.where(sel)[0][::2]:
                y = int(min(fr * (ridge[x] - 3), ridge[x] - 3))
                c = a[y, x]
                if np.abs(c - M[y, x]).max() < 0.08:   # skip cloud pixels
                    pts.append(c)
            lut[2 * f + side, i] = np.median(np.array(pts), 0) if pts else lut[2 * f + side, i - 1]
# cloud colours (light tops, body, shaded undersides), sampled from the painted clouds
# of each frame and pushed slightly apart so the drawn clouds read at pixel size
CLOUDS = [
    [(58, 88, 148), (26, 44, 86), (15, 26, 56)],        # night: moonlit rims on dark banks
    [(236, 158, 150), (150, 118, 160), (94, 82, 128)],  # dawn: pink tops, lavender body
    [(255, 255, 255), (240, 246, 253), (186, 208, 238)],# day: white tops, blue shade
    [(255, 182, 122), (224, 138, 134), (166, 106, 138)],# sunset: orange tops, mauve body
]
for f in range(4):
    for j in range(3):
        lut[8 + f, j] = np.array(CLOUDS[f][j], np.float32) / 255
Image.fromarray((lut * 255 + 0.5).clip(0, 255).astype(np.uint8)).save(os.path.join(IMG, 'alive-sky.png'))

# the ridge for the shader: a compact polyline (x, y) every 29 px
pts = [(int(x), int(round(ridge[x]))) for x in list(range(0, W, 29)) + [W - 1]]
print('ridge polyline (%d points):' % len(pts))
print(', '.join('%d,%d' % p for p in pts))
print('trees %.1f%% of the frame' % (100 * trees.mean()))
