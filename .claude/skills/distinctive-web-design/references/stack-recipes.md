# Stack Recipes

Pick the recipe by project type, not by habit. Each recipe lists the default stack, the design layers, and the thresholds that should change the plan.

## Decision table

| Project | Default stack | Why |
|---|---|---|
| Marketing / landing / portfolio | Astro (content-heavy) or Next.js (interactive) + Tailwind v4 | Astro ships zero JS by default → easy 100/100 Lighthouse; Next when React interactivity dominates |
| SMB service-business client site | Astro theme or a reusable starter + tokens.json | Speed to ship, rebrand-by-token-edit, local SEO |
| App with auth/billing/portal | Makerkit or Supastarter boilerplate | Multi-tenancy, RBAC, billing are solved problems — don't hand-roll |
| Quick demo / single-file artifact | One HTML file or one React component + CDN/Tailwind | No build step; render → screenshot → iterate immediately |

## Recipe A — Marketing site (the showcase build)

- **Structure:** Astro or Next.js + Tailwind v4 + shadcn/ui for interactive parts.
- **Wow layer:** one or two orchestrated moments from Aceternity/Magic UI-class components — the hero and at most one feature moment. Stacked effects everywhere reads as a template.
- **Motion:** Motion for micro-interactions; GSAP + Lenis if the direction calls for scroll choreography.
- **Identity:** custom OKLCH palette from the brand seed; a Fontshare/Geist-tier type pairing (see assets file); mesh gradient or noise atmosphere if the direction warrants.
- **Process:** brief like a creative director with a named direction + 2–3 reference screenshots; build section-by-section with the screenshot loop on.

## Recipe B — SMB / client site system (repeatable delivery)

- Start from an Astro theme (Themefisher/Cosmic/Lexington class) or your own starter template.
- Build a section library once: hero, services grid, testimonials, pricing, contact (Web3Forms/Formspree), FAQ, local-SEO schema (LocalBusiness JSON-LD).
- Keep tokens in `tokens.json` (DTCG) or a single CSS custom-properties file → each client rebrand is a palette/type swap, not a redesign.
- Client portals/dashboards: layer in Tremor.
- Deploy Vercel/Netlify/Cloudflare Pages; analytics via Plausible (privacy story sells well to SMBs); run Lighthouse + axe before handoff.
- **Threshold:** producing many near-identical sites → invest in the token + section-library system now. Every project bespoke → lean on the brief + references instead.

## Recipe C — App with auth/billing

- **Threshold:** the moment a project needs accounts + payments, graduate from a template to **Makerkit** or **Supastarter** (both ship Claude-Code-optimized agent rules) rather than hand-rolling auth/billing/tenancy.
- Design system still applies: replace the boilerplate's default theme with the Phase 2 tokens immediately, or the product ships looking like every other Makerkit app.
- Data-heavy screens: Tremor or restyled shadcn charts/tables.

## Recipe D — Single-file demo / artifact

- One HTML file (Tailwind via CDN or inline CSS custom properties) or one self-contained React component.
- Even here: no ban-list defaults, tokens as CSS variables at the top of the file, one signature element. Constraints don't excuse genericness — they concentrate it.
- The visual loop still applies and is *easiest* here: write file → screenshot script → look → fix.

## Thresholds that change any plan

- **Mobile Lighthouse < ~90** → cut 3D/heavy animation first; consider Astro's zero-JS rendering for that project.
- **Client needs CMS editing** → Astro + Keystatic/content collections, or a headless CMS; avoid hardcoding copy the client will want to touch.
- **Hard deadline measured in hours** → template + token swap + one custom hero beats bespoke everything. Distinctiveness budget goes entirely to the hero and type.
- **Heavy legacy/enterprise constraints** → Bootstrap/MUI are acceptable, but restyle tokens aggressively; both are instantly recognizable in default form.
