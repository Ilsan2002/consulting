# DESIGN.md — Kenius

A `DESIGN.md` for the Kenius brand, in the format popularised by
[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md).
Drop this into a project (or hand it to a coding agent) to generate UI that
matches the site. The whole system is intentionally built to *avoid* the
generic "AI-slop" look — no blue→purple gradients, no Inter, no uniform
16px-radius card soup.

---

## 1. Visual Theme & Atmosphere

Warm, editorial, and quietly confident — closer to a craft studio than a
SaaS dashboard. The name refers to *north light*: the clean, even daylight
painters build by. The atmosphere should feel **calm, legible and honest**,
not futuristic or hyped.

- Mood words: warm, grounded, precise, unhurried, human.
- Paper-and-ink base with a single amber accent that behaves like a shaft
  of light, used only where it means something (actions, emphasis, status).
- Generous whitespace; a strong type hierarchy carries the page rather than
  decoration.

## 2. Color Palette & Roles

Neutrals are **warm** (paper & ink), not cool greys. One accent only.

| Token | Hex | Role |
|---|---|---|
| `--paper-0` | `#FBF8F2` | page background (light) |
| `--paper-50` | `#F5F0E6` | raised surface / wash |
| `--paper-200` | `#E2D8C5` | hairline borders on light |
| `--ink-900` | `#16130D` | text on light · dark-band background |
| `--ink-800` | `#201C14` | dark surface |
| `--ink-500` | `#6F6553` | muted body text on light |
| `--amber-500` | `#E5862F` | **primary accent** (buttons, status) |
| `--amber-600` | `#CF7327` | accent on light (links, hover) |
| `--amber-400` | `#F0A155` | accent on dark bands |
| `--accent-ink` | `#2A1404` | text that sits on amber |
| `--pine-600` | `#2F6E60` | support / "positive" — used sparingly only |

**Rules**
- Accent communicates *function*, never decoration. If a colour isn't
  signalling an action, a link, or live status, it's a neutral.
- Pine green appears only in tiny doses (a status dot, one data motif).
- Dark sections use `--ink-900` (a warm near-black), never `#000`. Depth
  comes from **luminance steps**, not coloured glows.

## 3. Typography Rules

A characterful serif for display, a clean grotesque for body, a mono for
metadata. Deliberately **not Inter**.

- **Display:** `Fraunces` (variable, optical sizing). Weights 400–520.
  Used for all `h1`–`h4`, pull-quotes, and big stat numbers. Tight tracking
  (`-0.02em`). Occasional *italic* accent word in amber for warmth.
- **Body / UI:** `Hanken Grotesk`. Weights 400–700. Line-height ~1.6.
- **Mono / labels:** `Space Mono`. Used for eyebrows, tags, stat labels,
  timestamps, and the "Relay" diagram — uppercase, letter-spaced `.08–.16em`.
- Fluid type via `clamp()`; `text-wrap: balance` on headings, `pretty` on leads.

## 4. Component Stylings

- **Buttons:** pill (`999px`). Primary = amber fill + dark ink text.
  Ink = near-black fill. Ghost = 1px border. Hover lifts `-2px` + soft
  shadow; arrow icon nudges right. Always eased, never snaps.
- **Cards:** `--r-lg` (22px) for content cards, varied per context (chips
  10px, tags 6px, media 32px) — radius is *intentionally* not uniform.
  1px warm border + `--surface-2` fill; hover lifts and deepens the border.
- **Eyebrow/kicker:** mono, uppercase, amber, with a short leading rule.
- **Tags/pills:** mono micro-labels; amber-wash for emphasis, neutral wash
  for tools.
- **Relay diagram & demo widget:** dark panels with a warm radial wash,
  thin connector strokes, and a single amber "flow" pulse animated via
  `stroke-dashoffset`.
- **FAQ:** plus-icon accordion, single-open, height-animated.

## 5. Layout Principles

- Centered container, `max-width: 1180px` (`760px` for reading-width blocks).
- Section rhythm via `clamp()` padding (`~3.5rem`→`7rem`); alternate
  light/dark **bands** for chapters.
- Asymmetric splits (`1.05fr / 0.95fr`), not 50/50, to avoid the template feel.
- Feature grids use **varied column spans** at wide breakpoints so the grid
  doesn't read as identical boxes.
- Spacing scale is varied on purpose (`6, 12, 20, 32, 48, 72, 112px`).

## 6. Depth & Elevation

One shadow recipe, scaled by level (`--shadow-1/2/3`) — warm-tinted, low
opacity, layered (a tight contact shadow + a soft ambient one). Elevation is
earned: resting cards sit flat with a border; only interactive/hovered or
floating elements (CTA, demo, Relay) lift. On dark bands, depth is luminance
(`--ink-900 → 800 → 700`), not heavier shadow.

## 7. Do's and Don'ts

**Do**
- Keep one accent and make it mean something.
- Pair a display serif with a grotesque body.
- Use real, specific copy ("62% of tickets auto-resolved"), opinions, plain English.
- Vary radii and spacing with intent; animate with easing + `prefers-reduced-motion`.

**Don't**
- ❌ Blue→purple gradients, neon glow, or pure-black backgrounds.
- ❌ Inter / system-font-only with no display face.
- ❌ Uniform 16px radius on everything; identical 3-icon-card hero template.
- ❌ Vague hype ("Build the future", "best-in-class", "cutting-edge").
- ❌ Stock photos of diverse teams at laptops; AI-smooth illustrations.

## 8. Responsive Behavior

- Mobile-first. Nav collapses to an animated burger → drawer under 920px.
- Grids step 1 → 2 → 3/4/6 columns; column spans only apply at the widest
  breakpoint.
- Type, spacing and section padding scale fluidly with `clamp()`.
- Touch targets ≥ 44px; demo tabs scroll horizontally on small screens.
- Everything degrades without JS; motion is removed under
  `prefers-reduced-motion`.

## 9. Agent Prompt Guide

> Build a marketing page for **Kenius**, an AI studio that builds "AI
> agents & AI coworkers" for small-to-mid-sized businesses. Tone: warm,
> plain-English, no hype, gently opinionated. **Palette:** warm paper
> `#FBF8F2`, warm ink `#16130D`, single amber accent `#E5862F` used only for
> actions/links/status; one muted pine `#2F6E60` for tiny data accents.
> **Type:** Fraunces (display serif) + Hanken Grotesk (body) + Space Mono
> (labels). **Layout:** asymmetric splits, alternating light/dark bands,
> varied radii (pill buttons, 22px cards, 6px tags), one layered warm shadow.
> **Avoid:** blue/purple gradients, Inter, pure black, uniform 16px radius,
> generic 3-card hero, vague superlatives, stock photography. Prefer custom
> SVG diagrams (an agent-orchestration "Relay" graph) and real, specific
> numbers. Respect `prefers-reduced-motion`, keyboard nav, and AA contrast.
