# GIC-WEBSITE-ANALYSIS.md — reverse-engineering generalintelligencecompany.com's day/night hero

> Research notes from reverse-engineering the stack behind generalintelligencecompany.com,
> plus a full write-up (with working code) of the time-of-day hero image system it uses,
> a real bug found in the first attempt to recreate it smoothly, and the fix.
>
> Status: **RESEARCH** — no changes to the Kenius site itself. Two standalone interactive
> demos were built and published as Claude Artifacts (linked below); nothing from them is
> wired into this repo.
> Written 2026-07-02. Branch of record: `claude/gic-website-analysis-rv3a8d`.

---

## TL;DR

- generalintelligencecompany.com runs **Next.js (App Router / RSC) on Vercel**, styled with
  **Tailwind**, self-hosted variable fonts via `next/font` (Geist Mono + PP Mondwest + a
  custom licensed sans), `next/image` serving AVIF with blur-up placeholders, and ships
  **GSAP** + **Lottie** for motion. No CMS signature found — content looks hardcoded into
  the React tree.
- Its "day/night" hero isn't animated at all. It's **four static illustrations swapped
  based on the visitor's clock** (hardcoded to America/New_York), resolved **once, server-side,
  per page load** — not a crossfade, not even a CSS transition. The footer image *is* wired
  to a live 60-second clock check, but snaps instantly with no transition class either.
- Built two interactive reconstructions of "what a genuinely smooth version would look
  like": four images stacked in a box, opacity driven by a continuous function of the clock
  instead of a hard bucket check.
- The first version of that function had a real, findable bug: a **fixed 6-hour blend
  radius** applied to keyframes that aren't evenly spaced. That silently produced a
  5.5-hour "stuck" plateau across the widest gap (night → day) and a muddy 3-way overlap
  across the narrowest one (sunset → twilight). Fixed by switching to **sequential
  neighbor interpolation with smoothstep easing**, which scales the transition to each
  gap's own width instead of a fixed radius.

---

## 1. Stack fingerprint

Pulled from response headers, the shipped HTML/CSS, and the Next.js JS chunks (fetched
and grepped directly, not guessed):

- **Framework/host:** Next.js App Router with React Server Components, deployed on Vercel.
  Confirmed by `x-powered-by: Next.js`, `server: Vercel`, and a
  `vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch` header that only RSC streaming
  sets. Chunk names (`app/layout-*.js`, `app/page-*.js`, `main-app-*.js`) match Next's build
  output.
- **Styling:** Tailwind CSS, JIT-compiled — arbitrary-value bracket syntax throughout
  (`duration-[250ms]`, `ease-[cubic-bezier(...)]`), plus the literal `tailwind` license
  banner shipped in the CSS bundle.
- **Fonts:** all self-hosted via `next/font` (preloaded woff2, metric-matched fallback
  faces, no Google Fonts CDN calls) — **Geist Mono** (Vercel's own), **PP Mondwest**
  (Pangram Pangram Foundry's glitchy display face, used for headings), and a proprietary
  variable-weight sans (internal var name `af`, weight 100–900).
- **Images:** real photography/illustration through `next/image` — AVIF with full
  responsive `srcset`, LQIP blur-up placeholders (base64 micro-thumbnail wrapped in an
  inline SVG Gaussian-blur filter). Small UI icons are hand-authored inline `<svg>`, not
  an icon font.
- **Motion:** **GSAP** is bundled (with references to its `Observer` plugin) for
  JS-driven interactions; **Lottie** (`lottie-react`, canvas renderer) powers one small
  vector animation inside a mock "notification" UI card. Everything else — button hover
  arrows, the mobile menu hamburger morph — is plain CSS/Tailwind `@keyframes` +
  `group-hover`. No video, no WebGL/Three.js, no `<canvas>` actually rendered in the DOM.
- **No CMS detected** (no Sanity/Contentful strings anywhere in the bundle) — content
  reads as hardcoded straight into the components.

## 2. The day/night hero: how it actually works

The hero, an "about" section image, and the footer image each ship in four time-of-day
variants (`hero-{1..4}.avif`, `about-{1..4}.avif`, `footer-{2,3,4}.png`). A shared
`TimeProvider` computes an hour bucket from **New York time specifically**, regardless of
the visitor's own timezone:

```js
let hour = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"})).getHours();
// bucket: 6-9 → 1 (dawn), 9-16 → 2 (day), 16-18 → 3 (dusk), else → 4 (night)
```

Two things are worth knowing if you're expecting an animated transition:

- **The hero never updates client-side.** Its bucket (`serverImageIndex`) is computed on
  the server at request time and baked straight into the initial HTML. The only
  `useEffect` on the hero component is a background prefetch of the other three variants
  via `<link rel="prefetch">` — quietly warming the cache for next time, not animating
  anything. You only ever see a different hero by reloading the page at a different hour.
- **The footer *is* reactive** — the shared `TimeProvider` re-checks the clock every 60
  seconds (cached to `localStorage` for 5 minutes) and the footer component re-renders
  its `<Image src>` on a bucket change. But there's no `opacity`/`transition` class on
  it, so it's a plain instant swap, not a crossfade.

So the whole effect is closer to "pick the right static frame at render time" than any
kind of animated day cycle. No GIF, no video, no canvas sky simulation.

## 3. Building an actually-smooth version

### 3.1 The naive approach — and the bug in it

The obvious fix is: stack all four images in one box, and instead of a hard bucket
check, give each image a *weight* based on how close the clock is to that image's peak
hour, then write the (normalized) weight straight to `opacity`. First pass used a
symmetric falloff from each peak:

```js
function weightsAt(hour) {
  const raw = FRAMES.map(f => {
    const d = circularDist(hour, f.at);
    return d >= 6 ? 0 : (Math.cos(d / 6 * Math.PI) + 1) / 2; // fixed 6h radius
  });
  const total = raw.reduce((a, b) => a + b, 0);
  return FRAMES.map((f, i) => ({ id: f.id, weight: raw[i] / total }));
}
```

This looks reasonable and mostly works — but it silently breaks once the keyframes
aren't evenly spaced, which they weren't (day 12:30, sunset 18:00, twilight 19:30, night
1:00 — gaps of 5.5h, 1.5h, 5.5h, 11.5h). A fixed 6-hour radius against an 11.5-hour gap
means each end's influence runs out well before it reaches the other: from roughly 7am to
12:30pm, **only night or only day ever has nonzero raw weight**, so normalizing pins that
one image at 100% opacity for 5+ hours of nothing happening, then the entire "transition"
gets crammed into the last half-hour before day's radius kicks in — a snap disguised as a
fade. Meanwhile the 1.5-hour sunset→twilight gap is *narrower* than the 12-hour window,
so up to three images overlap there at once, reading as muddy rather than a clean
two-image dissolve.

### 3.2 The fix — sequential neighbor blend, smoothstep-eased

Instead of a fixed radius, find the two keyframes either side of the current hour and
ease **only** between those two, scaled to that pair's own gap:

```js
const ORDER = FRAMES.slice().sort((a, b) => a.at - b.at);
const ease = t => t * t * (3 - 2 * t); // smoothstep

function weightsAt(hour) {
  const h = ((hour % 24) + 24) % 24;
  let seg;
  for (let i = 0; i < ORDER.length; i++) {
    const a = ORDER[i], b = ORDER[(i + 1) % ORDER.length];
    const bAt = b.at <= a.at ? b.at + 24 : b.at;
    const hh = h < a.at ? h + 24 : h;
    if (hh >= a.at && hh <= bAt) { seg = { a, b, t: (hh - a.at) / (bAt - a.at) }; break; }
  }
  const s = ease(seg.t);
  return ORDER.map(f => ({
    id: f.id,
    weight: f.id === seg.a.id ? 1 - s : f.id === seg.b.id ? s : 0,
  }));
}
```

This guarantees exactly two images are ever blending (never zero, never three-plus), and
every transition is full-width and identically shaped — eased in, eased out — whether its
gap is 90 minutes or 11.5 hours. Verified numerically before shipping it (weights always
sum to 1; the old dead zone at the night→day midpoint now sits at a clean 50/50 instead
of pinned at 100%):

```
hour   weights
 0     night:0.91 twilight:0.09
 1     night:1.00
 6.75  night:0.50 day:0.50      ← previously stuck at night:1.00
12.5   day:1.00
18     sunset:1.00
19.5   twilight:1.00
```

## 4. Demos

Both are self-contained interactive pages (drag a slider or hit play; includes a live
chart of each layer's opacity across the 24h cycle). Published as Claude Artifacts,
default-private to this account:

- **Central Park reconstruction** — GIC's actual four hero images, same technique:
  https://claude.ai/code/artifact/1a9a67a5-04e1-43fc-b8f3-577c11e26aed
- **Skyline reconstruction** — rebuilt with a different four-image set (day / sunset /
  twilight / night), same underlying code:
  https://claude.ai/code/artifact/ffba2b3a-13c6-4a0f-a288-b61a8c8ae8bb

## 5. If this ever comes up for kenius.us

Nothing here is wired into the Kenius site and nothing about `DESIGN.md`'s "Atelier"
system calls for a time-of-day hero. Flagging only for the record: the sequential
neighbor-blend technique in §3.2 is generic (works with any number of ordered keyframes,
any images) and could be dropped into a Kenius page later without importing anything —
it's ~25 lines of vanilla JS plus stacked `<img>`/`<Image>` layers. Not proposing it now;
just noting it's cheap if the idea ever fits a future direction.
