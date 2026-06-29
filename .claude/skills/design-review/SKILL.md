---
name: design-review
description: Use to audit an existing web page or component for "AI-slop" tells and accessibility/quality issues — an adversarial pass that scores the design and returns concrete fixes. Trigger on "review the design", "does this look generic/AI-made", "make this less templated", "design QA", or after generating any UI when you want a critical second look. Complements web-aesthetics (creation vs. compliance).
---

# Design Review — catch the slop and the a11y gaps

Run this as a critical pass over rendered output. Where possible, **render the page in a headless browser and look at the screenshot** (desktop + mobile) — review what ships, not the source.

## A. Slop tells (flag each, propose a fix)
- **Typography:** Inter/Roboto/system-only? No display face? Body and headings the same family? → introduce a distinctive display pairing + a real type scale.
- **Color:** blue→purple gradient identity? default Tailwind indigo/blue? accent that's purely decorative? → custom OKLCH ramp, one accent used semantically.
- **Background:** flat pure white or pure black? → tinted near-black/off-white + atmosphere (grain, mesh/radial glow, faint grid).
- **Layout:** centered hero + exactly three icon cards? everything 50/50? identical card grid with no hierarchy? → asymmetric splits, varied spans, a clear focal point.
- **Radius/spacing:** uniform 16px radius everywhere? one padding value throughout? → intentional variation by component role.
- **Shadows:** one `shadow-md` on everything? → a single recipe scaled by elevation; resting elements flat with a border.
- **Motion:** decorative animation with no purpose? snap (no easing)? none at all? → eased, purposeful micro-interactions; reduced-motion fallback.
- **Markers/copy:** 01/02/03 on non-sequential content? "Build the future", "best-in-class", hedging ("may help")? → remove or make specific and opinionated.
- **Imagery:** stock "team at laptops"? over-smooth AI art? placeholder lorem? → custom SVG/diagrams, real screenshots, specific copy.

## B. Craft checks
- Is there ONE clear focal point per section, or does everything compete?
- Type hierarchy legible at a glance (size/weight/color doing distinct jobs)?
- Is the accent earning its place every time it appears?
- Optical alignment and consistent rhythm (a real spacing scale, not random)?
- Does it hold up on mobile (stacking, tap targets ≥44px, no overflow)?

## C. Accessibility / quality (hard gates)
- Text contrast ≥ AA (4.5:1 body, 3:1 large/UI); accent-on-dark and text-on-accent both checked.
- Semantic landmarks (`header/nav/main/footer`), one `h1`, ordered headings, skip link.
- Keyboard operable (focus-visible rings, tabs/accordions/menus reachable), labelled controls.
- `prefers-reduced-motion` removes animation; content survives with JS disabled.
- No layout shift from late fonts/images; images sized/lazy.

## Output format
For each finding: **what** (the tell) · **where** (selector/section) · **why it reads generic or fails** · **the fix** (concrete, code-level). End with a 1–5 "distinctiveness" score and the single highest-leverage change. Be adversarial — assume it looks generic until proven otherwise.
