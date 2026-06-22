# Kenius — AI agency website

A complete, hand-built marketing site for **Kenius** (kenius.us) — an AI
studio that builds *AI agents & AI coworkers* (chat,
voice/ASR-TTS, back-office automation, copilots, integrations) for
small-to-mid-sized businesses, explained in plain English for non-technical
buyers.

It's a static site: hand-written HTML, **one** CSS file of design tokens +
components, and a little vanilla JavaScript. **No framework, no build step,
no dependencies** — open it in a browser and it works.

> ⚠️ **Heads up:** the brand is set to **Kenius** (kenius.us), but the client
> names, logos, testimonials, metrics and case studies are still *illustrative
> placeholders*. Replace them with real content before you promote the site
> (see **Make it yours** below).

---

## Run it

It's just files. From inside the repo folder:

```bash
./serve.sh          # → http://localhost:8000/
./serve.sh 9000     # or pick a port
```

`serve.sh` always serves from its own folder (so it works from any
directory) and falls back across `python3` / `python` / `npx serve`.

Prefer to do it by hand? Any static server works — just run it **from this
repo folder**, not your home directory:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
# or
npx serve .
```

You can also double-click `index.html`, though a local server is better so
the relative paths and fonts behave.

> The `favicon.ico` / `apple-touch-icon.png` 404s some browsers log are
> harmless automatic probes — the tab icon is an inline SVG and already
> works. To silence them, drop a `favicon.ico` and `apple-touch-icon.png`
> in this folder.

## Deploy to Cloudflare Pages (kenius.us)

The domain is already on Cloudflare, so Pages is the easiest host — DNS for
the custom domain is wired up automatically.

**Option A — connect the GitHub repo (auto-deploys on every push):**

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → pick `Ilsan2002/consulting`.
2. **Production branch:** the branch this site lives on (or `main` if merged).
3. **Build settings:** Framework preset **None**, Build command **(empty)**,
   Build output directory **`/`**. → **Save and Deploy**.
4. After it builds, open **Custom domains** → **Set up a domain** → add
   `kenius.us` and `www.kenius.us`. Cloudflare adds the DNS records for you.

**Option B — Wrangler CLI from your laptop:**

```bash
npx wrangler login
npx wrangler pages deploy . --project-name kenius
# then attach kenius.us under the project's Custom domains
```

No build step either way — it's plain static files. The `_headers` file sets
caching and basic security headers automatically on Pages.

> Other static hosts (Netlify, Vercel, GitHub Pages) work too — just point
> them at the repo with no build command and output directory `/`.

## Structure

```
.
├── index.html        # Home — hero, capabilities, AI crew, live demo, cases, FAQ
├── services.html     # "What we build" — the six offerings + engagement models
├── work.html         # Case studies (illustrative)
├── about.html        # Studio story, values, team
├── contact.html      # Contact form + "what happens next"
├── DESIGN.md         # The design system (see "Design notes")
└── assets/
    ├── css/styles.css # All styling — tokens at the top, components below
    └── js/main.js     # Nav, scroll-reveal, FAQ, counters, the demo widget
```

## Make it yours

Everything is designed to be edited by hand.

1. **Rename the brand.** Find-and-replace `Kenius` across the `.html`
   files and `DESIGN.md`. Swap the wordmark (it's an inline SVG star in the
   header/footer) and the favicon (an inline data-URI SVG in each `<head>`).
2. **Recolor.** Edit the CSS custom properties at the top of
   `assets/css/styles.css` (`:root`). The whole site re-skins from those
   tokens — change `--amber-500` to move the accent, or the `--paper-*` /
   `--ink-*` scales to change the warmth.
3. **Re-type.** Fonts load from Google Fonts in each `<head>`
   (Fraunces + Hanken Grotesk + Space Mono) and map to `--font-display`,
   `--font-sans`, `--font-mono`. Strong system fallbacks are set, so it still
   looks fine offline.
4. **Replace the content.** Update the copy, the case studies in
   `work.html`, the logos in the home-page strip, the team in `about.html`,
   and the testimonials. Keep the numbers *specific* and real.
5. **Wire up the form.** `contact.html` posts to a placeholder
   `formspree.io/f/your-form-id`. Swap the `action` for your own Formspree
   endpoint, email handler, or CRM webhook.

## Design notes

The look is deliberately *not* the default "AI-slop" aesthetic. Decisions and
sources are documented in **[`DESIGN.md`](./DESIGN.md)**, which follows the
`DESIGN.md` format from
[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)
(the design resource this was built against).

Key choices, and the thinking behind them:

- **No blue→purple gradients, no Inter, no pure black, no uniform 16px-radius
  cards** — these are the tells of generic AI-generated sites.
- **Warm paper + warm ink + a single amber accent** used *semantically*
  (actions, links, live status), with one muted pine green for tiny data
  accents. Dark sections get depth from luminance, not glow.
- **Fraunces (display serif) + Hanken Grotesk (body) + Space Mono (labels)**
  — a characterful pairing instead of a single neutral sans.
- **Custom SVG over stock art** — the hero "Relay" agent-orchestration
  diagram and the interactive chat/voice/back-office demo are hand-built and
  on-message, not decorative filler.
- **Plain-language, specific copy** aimed at non-technical owners, with an
  honest, slightly opinionated voice.

References that informed the design direction:

- VoltAgent — *awesome-design-md* — <https://github.com/VoltAgent/awesome-design-md>
- 925 Studios — *AI-slop web design: spotting & fixing generic sites* — <https://www.925studios.co/blog/ai-slop-web-design-guide>
- Recursion — *UI color trends 2026* — <https://recursion.software/blog/ui-color-trends-2026>
- MaxiBestOf — *Fraunces font pairings* — <https://maxibestof.one/typefaces/fraunces>

## Accessibility & performance

- Semantic landmarks, skip-link, `aria-current`, labelled tabs/accordion.
- Keyboard-operable nav, demo tabs (arrow keys) and FAQ.
- `prefers-reduced-motion` removes all animation; everything degrades without JS.
- No images to download (all art is SVG/CSS); fonts are the only external request.
