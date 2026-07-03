# Kenius — working notes for Claude

Marketing site for **Kenius** (kenius.us), an AI consultancy. Static: hand-written
HTML + one tokenized CSS file (`assets/css/styles.css`) + vanilla JS. **No framework,
no build step.** Hosted on Cloudflare Pages, auto-deploys from `main`.

## Design
- The visual system is **"Dark Signal"** (v2): deep zinc canvas, single **electric-citron**
  accent, **Clash Display + General Sans + JetBrains Mono**, film-grain + glow atmosphere.
  Full spec in [`DESIGN.md`](./DESIGN.md). The v2 re-theme is an **override layer appended
  at the end of `styles.css`** — edit tokens there to re-skin.
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
