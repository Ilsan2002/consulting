# Kenius — working notes for Claude

Marketing site for **Kenius** (kenius.us), an AI consultancy. Static: hand-written
HTML + one tokenized CSS file (`assets/css/lux.css`) + vanilla JS (`assets/js/lux.js`).
**No framework, no build step.** Hosted on Cloudflare Pages, auto-deploys from `main`.

## Design
- The current visual system is **"Atelier"** (luxury-minimal, editorial): warm **bone**
  canvas, warm near-black **ink**, a single muted **bronze** accent used for function only,
  **Bodoni Moda (didone, true italics) + General Sans**, depth from type/space/hairlines —
  not colour or shadow. Full spec in [`DESIGN.md`](./DESIGN.md). All pages link
  **`assets/css/lux.css`**; tokens live in its `:root` block (OKLCH with hex fallback) and
  in [`tokens.json`](./tokens.json) — edit there to re-skin.
- Two earlier systems remain in `styles.css` for reference (warm-paper "v1" + dark "Dark
  Signal" v2) but are **no longer linked by any page**.
- Before any design work, read the **`web-aesthetics`** skill (`.claude/skills/`). When a
  page is done, run the **`design-review`** skill over it. Both encode our anti-"AI-slop"
  rules.
- House bans (non-negotiable): no Inter/Roboto, no blue→purple gradients, no pure black/white
  flat fills, no uniform-radius card grids, no centered-hero-+-3-cards template, no vague hype
  copy, no stock "team at laptops" photos. One accent, used for function only.
- Everything must respect `prefers-reduced-motion`, be keyboard-operable, degrade without JS,
  and hit AA contrast.

## Content
- Tone: warm, plain-English, no hype, gently opinionated. Consultancy, **not** a product.
- Client names, logos, testimonials and metrics are **illustrative placeholders** — keep them
  clearly swappable.

## Workflow
- Keep class names stable so the token layer can re-skin the whole site at once.
- Verify visually before declaring done: render with Playwright/headless Chromium, screenshot
  desktop **and** mobile, look at it critically.
- Commit small, descriptive steps; `main` is production (pushing it deploys).
- Local preview: `./serve.sh` (→ http://localhost:8000). Deploy: handled by Cloudflare on push.
