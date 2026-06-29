# DESIGN.md — Kenius (v2 · "Dark Signal")

A `DESIGN.md` for the Kenius brand, in the format popularised by
[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md).
The system is built to *avoid* the generic "AI-slop" look — no Inter, no
blue→purple gradients, no pure-black flat fills, no uniform-radius card grids.

> **Implementation note.** v2 is shipped as an **override layer appended at the
> end of `assets/css/styles.css`** (search "KENIUS v2"). The original warm
> "v1" system is preserved above it as the base — to revert, delete the v2
> block. Class names are stable, so the whole site re-skins from tokens.

---

## 1. Visual Theme & Atmosphere
Dark, technical, and quietly premium — a precision instrument, not a hype reel.
Deep zinc canvas, a single electric-citron accent that behaves like a *signal*
on an oscilloscope, faint film grain and a masked grid for depth. Calm,
high-contrast, confident.
- Mood: nocturnal, exact, engineered, alive-but-restrained.
- Atmosphere comes from luminance + texture (grain, radial glow, grid), never
  from decorative color.

## 2. Color Palette & Roles
Neutral zinc, one accent, one sparse support.

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#0C0C0E` | page canvas (tinted near-black, never `#000`) |
| `--surface` | `#161618` | cards / panels (elevated) |
| `--surface-2` | `#1B1B1E` | raised surface |
| `--ink-700` | `#232327` | nested panel rows |
| `--text` | `#ECECEE` | primary text |
| `--text-muted` | `#8C8C94` | muted text |
| `--line` | `rgba(255,255,255,.09)` | hairline borders |
| `--accent` (`--amber-500`) | `#C8F751` | **electric citron** — action/link/status only |
| `--amber-400` | `#D7FB6E` | accent on darker bands |
| `--accent-ink` | `#0C0C0E` | text on citron |
| `--pine-300` | `#79D9C6` | cool-teal secondary — sparingly (status, "good") |

**Rules:** the accent only ever signals function (action, link, live status,
emphasis word). Everything else is neutral. Alternate `.band--ink` sections drop
to a deeper well (`#08080A`) with hairlines for rhythm.

## 3. Typography Rules
Geometric display + clean grotesque + mono. Deliberately **not Inter**.
- **Display:** `Clash Display` (Fontshare). 600 for `h1/h2`, 500 for `h3/h4`,
  tight tracking (`-0.025em`). No italic — emphasis is **weight + citron color**,
  never synthetic slant.
- **Body / UI:** `General Sans` (Fontshare), 400–600.
- **Mono / labels:** `JetBrains Mono` — eyebrows, tags, stat labels, diagram
  text; uppercase, letter-spaced.
- Fluid scale via `clamp()`; `text-wrap: balance` on headings.

## 4. Component Stylings
- **Buttons:** crisp 11px radius. Primary = citron fill + near-black text + a
  1px citron ring that blooms to a soft glow on hover. Ghost = subtle white
  border → citron on hover. Ink = off-white fill (a light button on dark).
- **Cards:** `--surface` + 1px hairline, 16px radius; hover lifts `-4px` and the
  border goes citron.
- **Eyebrow/tag:** mono, citron, with a short leading rule / citron wash.
- **Diagrams (Relay / orbit / sector flow):** elevated dark panels, warm-radial
  → citron glow, animated amber→citron pulses (`stroke-dashoffset`, spinning
  rings, traveling comets).
- **FAQ:** plus-icon accordion, single-open, height-animated.

## 5. Layout Principles
Centered 1180px container (760px for reading blocks); fluid `clamp()` section
rhythm; alternating dark bands; asymmetric `1.05/0.95` splits; varied column
spans; an intentionally varied spacing scale.

## 6. Depth & Elevation
One shadow recipe scaled by level (deep, soft, near-black). Resting elements sit
flat with a hairline; only interactive/floating elements lift. A global film-grain
overlay (`soft-light`, ~4.5% opacity) and a citron-glow token (`--glow`) give the
premium, non-flat feel. Depth = luminance steps, not heavy shadow.

## 7. Do's and Don'ts
**Do:** one accent that means something; pair a geometric display with a clean
grotesque; specific, opinionated copy; grain + glow + grid for atmosphere; ease
all motion; honor `prefers-reduced-motion`.
**Don't:** ❌ Inter/Roboto · ❌ blue→purple gradients · ❌ pure black/white flat
fills · ❌ uniform-16px card grids · ❌ centered-hero + 3-cards template · ❌
vague hype · ❌ stock "team at laptops" photos.

## 8. Responsive Behavior
Mobile-first; nav → animated burger/drawer under 920px; grids 1→2→3/4/6; fluid
type/spacing; touch targets ≥44px; degrades without JS; motion removed under
`prefers-reduced-motion`.

## 9. Agent Prompt Guide
> Build a page for **Kenius**, an AI consultancy. Aesthetic: **dark, technical,
> premium** — deep zinc canvas `#0C0C0E` (never pure black), a single **electric
> citron** accent `#C8F751` used only for action/link/status/emphasis, one sparse
> cool-teal `#79D9C6`. **Type:** Clash Display (display, weight+color emphasis, no
> italic) + General Sans (body) + JetBrains Mono (labels). **Atmosphere:** film
> grain, a citron radial glow, a faint masked grid; one deep layered shadow + a
> citron glow on primary actions. **Avoid:** Inter, blue/purple gradients, pure
> black/white, uniform radii, the centered-hero-+-3-cards template, hype copy,
> stock photos. Prefer custom animated SVG diagrams and specific numbers. Respect
> reduced-motion, keyboard nav, AA contrast.
