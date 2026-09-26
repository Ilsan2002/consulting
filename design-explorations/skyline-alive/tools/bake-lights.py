#!/usr/bin/env python3
"""Bake the "alive" layers for the Skyline hero from the live night painting.

Finds every small light in sky-night-4 (windows, street lamps, stars), then writes:
  alive-night-off.webp  the night painting with those lights painted out
  alive-lights.png      the lights on their own (night minus night-off), additive
  alive-meta.png        R = random id per light, G = kind: 255 star, 128 window,
                        64 floodlit architecture, 192 street/park lamp

Run from the repo root:  python3 design-explorations/skyline-alive/tools/bake-lights.py
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, '..', 'assets', 'img')
night = np.asarray(Image.open(os.path.join(IMG, 'sky-night-4.webp')).convert('RGB')).astype(np.float32) / 255.0
H, W, _ = night.shape
L = night @ np.array([0.2126, 0.7152, 0.0722], np.float32)

# small lights: bright, and much brighter than their neighbourhood
bg = ndi.median_filter(L, size=13)
top = L - bg
bright = (top > 0.10) & (L > 0.30)
yy, xx = np.mgrid[0:H, 0:W]

# the mountain ridge, traced by eye on the composition (identical in all four paintings)
RIDGE = [(0, 255), (80, 228), (140, 265), (180, 255), (220, 270), (290, 252), (340, 280), (395, 268),
         (480, 266), (560, 298), (620, 296), (700, 298), (760, 318), (830, 311), (900, 333), (990, 333),
         (1060, 358), (1120, 360), (1200, 373), (1305, 383)]
ridge = np.interp(np.arange(W), [p[0] for p in RIDGE], [p[1] for p in RIDGE])

# stars: tiny specks on dark, smooth sky, well above the ridge (not moonlit cloud rims)
blobs, nb = ndi.label(bright, structure=np.ones((3, 3)))
sizes = ndi.sum(np.ones_like(L), blobs, index=np.arange(1, nb + 1))
small = np.concatenate([[False], sizes <= 6])[blobs]
gy, gx = np.gradient(ndi.uniform_filter(bg, 5))
flat = np.hypot(gx, gy) < 0.006
stars = bright & small & (bg < 0.26) & flat & (yy < ridge[None, :] - 8)

# city: windows in the skyline, floodlit architecture, lamps in the square and park
BUILDINGS = [(355, 500, 885, 668), (985, 518, 1258, 648)]   # x0, y0, x1, y1 (image px)
in_bld = np.zeros((H, W), bool)
for x0, y0, x1, y1 in BUILDINGS:
    in_bld[y0:y1, x0:x1] = True
city = bright & (yy > H * 0.505)
windows = city & ~in_bld & (yy < H * 0.70)
arch = city & in_bld
lamps = city & ~in_bld & (yy >= H * 0.70)

KIND = np.zeros((H, W), np.uint8)
for m, k in ((windows, 128), (arch, 64), (lamps, 192), (stars, 255)):
    grown = ndi.binary_dilation(m, iterations=1) & (KIND == 0)
    KIND[grown] = k
mask = KIND > 0

# paint the lights out with the local median colour (never brighter than the original)
off = night.copy()
for c in range(3):
    med = ndi.median_filter(night[:, :, c], size=13)
    off[:, :, c] = np.where(mask, np.minimum(med, night[:, :, c]), night[:, :, c])
layer = night - off

# one random id per light blob
lab, n = ndi.label(mask, structure=np.ones((3, 3)))
rng = np.random.default_rng(7)
ids = np.concatenate([[0], rng.integers(1, 256, n)]).astype(np.uint8)
meta = np.zeros((H, W, 3), np.uint8)
meta[:, :, 0] = ids[lab]
meta[:, :, 1] = KIND

Image.fromarray((off * 255 + 0.5).astype(np.uint8)).save(os.path.join(IMG, 'alive-night-off.webp'), quality=90, method=6)
Image.fromarray((layer * 255 + 0.5).astype(np.uint8)).save(os.path.join(IMG, 'alive-lights.png'), optimize=True)
Image.fromarray(meta).save(os.path.join(IMG, 'alive-meta.png'), optimize=True)
print('size %dx%d  %d light blobs; px: stars %d, windows %d, architecture %d, lamps %d' % (W, H, n, (KIND == 255).sum(), (KIND == 128).sum(), (KIND == 64).sum(), (KIND == 192).sum()))
