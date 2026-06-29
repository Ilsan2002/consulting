# DESIGN.md — Kenius · "Atelier"

A `DESIGN.md` for the Kenius brand, in the format popularised by
[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md).
The system is built to *avoid* the generic "AI-slop" look — no Inter, no
blue→purple gradients, no pure-black flat fills, no uniform-radius card grids,
no centered-hero-+-3-cards template.

> **Implementation note.** "Atelier" is the **current, shipped** design system.
> It lives in its own stylesheet, [`assets/css/lux.css`](./assets/css/lux.css),
> with behaviour in [`assets/js/lux.js`](./assets/js/lux.js). Every page
> (`index`, `services`, `work`, `about`, `contact`) links it. Colour tokens are
> authored in **OKLCH** with hex fallbacks (`@supports (color: oklch(…))`); the
> machine-readable source of truth is [`tokens.json`](./tokens.json) (DTCG
> format). Class names are stable, so the whole site re-skins from the `:root`
> token block. Two earlier systems (warm-paper "v1" and dark "Dark Signal" v2)
> remain in `styles.css` for reference but are no longer linked by any page.

---

## 1. Visual Theme & Atmosphere
Quiet, editorial, expensive — a printed monograph, not a SaaS landing page.
A warm **bone** canvas, near-black **ink**, and a single muted **bronze** accent
used only for function. The drama comes from *typography and space*: a didone
display face with true italics, generous margins, hairline rules, and one
full-bleed dark interlude for contrast. Calm, confident, unhurried.
- Mood: gallery wall, letterpress, slow luxury, considered restraint.
- Atmosphere comes from **type scale, whitespace and rhythm** — never from
  decorative colour, gradients, or busy ornament.

## 2. Color Palette & Roles
Warm neutrals, one accent. Authored OKLCH, hex shown for reference.

| Token | Hex | OKLCH | Role |
|---|---|---|---|
| `--paper` | `#EFEDE7` | `94.6% .008 91.5` | page canvas (warm bone, never `#fff`) |
| `--paper-2` | `#E6E4DC` | `91.8% .011 95.2` | subtle raised band |
| `--ink` | `#1A1A17` | `21.7% .006 106.9` | primary text (warm near-black, never `#000`) |
| `--ink-soft` | `#45433C` | `38.3% .012 93.8` | secondary text |
| `--muted` | `#565248` | `43.9% .017 88.8` | captions / meta (AA: 6.65:1 on paper) |
| `--line` | ink @ 18% | — | hairline rules |
| `--accent` | `#6E5326` | `46.1% .071 78.2` | **bronze** — links, marks, indices only (AA: 6.13:1) |
| `--dark` | `#131210` | `18.3% .004 84.6` | full-bleed interlude canvas |
| `--dark-paper` | `#1B1A16` | `21.7% .008 95.4` | raised rows on dark |
| `--dark-text` | `#ECE8DE` | `93.1% .014 88.7` | text on dark |
| `--dark-muted` | `#9C988B` | `67.9% .019 92.8` | muted text on dark (AA: 6.04:1) |

**Rules:** the bronze accent only ever signals function — a link, a highlighted
("marked") word in a headline, a section index number. Everything else is the
ink/muted neutral ramp. Exactly **one** dark interlude per page provides
contrast and rhythm; it is not repeated.

## 3. Typography Rules
A didone display paired with a clean grotesque. Deliberately **not Inter**, and
emphasis is **true italic**, never a synthetic slant.
- **Display:** `Bodoni Moda` (Google Fonts), optical-size axis, 400–600.
  Hero/`h1`/`h2` set large with tight leading; the emphasis word is set in its
  **real italic** and coloured bronze (`.it`, `.mark`).
- **Body / UI:** `General Sans` (Fontshare), 300–600.
- **Captions / meta (`.cap`):** General Sans, uppercase, letter-spaced, small,
  in `--muted` — used for eyebrows, labels, indices.
- Fluid scale via `clamp()` (`--t-hero`, `--t-h2`, `--t-h3`, `--t-lead`, `--cap`);
  `text-wrap: balance` on display headings; pull-quotes widened so they never
  collapse to one-word-per-line.

## 4. Component Stylings
Editorial, not "carded". Almost nothing has a box.
- **Indexes (`.idx`, `.list`, `.detail`):** numbered rows (`01`–`06`, `/01`…)
  separated by hairline rules — a table of contents, not a grid of cards. A row
  is `number · title · description · ↗`, with a draw-in underline on hover.
- **Links (`.tlink`):** inline, with an underline that *draws in* from the left
  on hover/focus; bronze variant for emphasis.
- **Buttons (`.btn-lux`):** ink fill, paper text, no radius flourish; hover
  inverts toward bronze. Used sparingly (the contact form).
- **Forms:** underline-only fields (no boxes), serif input text, label above;
  honeypot + in-page success state; AJAX to Web3Forms.
- **Dark interlude (`.dark`):** one full-bleed near-black section per page with a
  big italic statement and a short numbered list of steps.
- **FAQ:** native `<details>` — open/close with no JS dependency.
- **Pull-quote (`.quote`):** large didone, balanced wrapping, attributed in caps.

## 5. Layout Principles
A single readable measure, lots of air. Container `≈72rem` with a narrower
reading width for prose; asymmetric two-column `.split` (label column + content);
fluid `clamp()` section rhythm; left-aligned, ragged-right text; section eyebrows
are words ("Why now"), **not** decorative numbers. No uniform card grid anywhere.

## 6. Depth & Elevation
Almost flat by design. Depth is **hairlines and whitespace**, not shadow. The
only tonal "elevation" is the one dark interlude and the subtle `--paper-2` band.
No drop-shadows on text blocks, no glows. The richness is in the paper colour and
the type, like good print.

## 7. Do's and Don'ts
**Do:** one bronze accent that always means something; pair a didone display with
a clean grotesque; use **true italics** for emphasis; lead with whitespace and
hairlines; specific, plain-English, gently-opinionated copy; ease all motion and
honour `prefers-reduced-motion`; hit AA (4.5:1 text / 3:1 large).
**Don't:** ❌ Inter/Roboto · ❌ blue→purple gradients · ❌ pure black/white flat
fills · ❌ synthetic-oblique italics · ❌ uniform-radius card grids · ❌
centered-hero + 3-cards template · ❌ decorative section numbers · ❌ vague hype ·
❌ stock "team at laptops" photos.

## 8. Responsive Behavior
Mobile-first; nav collapses to a full-screen overlay under 900px (burger button,
`aria-expanded`); two-column `.split`/`.detail` grids fold to one column; fluid
type/spacing via `clamp()`; touch targets ≥44px; the site **degrades without JS**
(reveals fall back to fully visible via `<noscript>`); all motion removed under
`prefers-reduced-motion`.

## 9. Agent Prompt Guide
> Build a page for **Kenius**, an AI consultancy. Aesthetic: **quiet editorial
> luxury** — a warm **bone** canvas `#EFEDE7` (never pure white), warm near-black
> **ink** `#1A1A17` (never pure black), a single muted **bronze** accent `#6E5326`
> used only for links, an emphasised italic word in a headline, and section index
> numbers. **Type:** `Bodoni Moda` didone for display with **true italics** for
> emphasis (never synthetic slant) + `General Sans` for body + letter-spaced caps
> for labels/indices. **Layout:** editorial — numbered hairline-ruled indexes
> instead of cards, asymmetric label/content splits, generous whitespace, one
> full-bleed dark interlude per page. **Atmosphere from type and space, not
> colour or shadow** — almost flat, hairline rules only. **Avoid:** Inter,
> blue/purple gradients, pure black/white, synthetic italics, uniform-radius card
> grids, the centered-hero-+-3-cards template, decorative section numbers, hype
> copy, stock photos. Respect reduced-motion, keyboard nav, AA contrast; degrade
> without JS.
