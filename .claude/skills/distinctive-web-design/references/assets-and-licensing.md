# Assets & Licensing

Fonts, icons, illustrations, images, and texture generators — with the license notes that keep client work safe.

## Typography

The single biggest anti-slop lever. Avoid Inter/Roboto as display faces — they are the statistical center of AI output. **Second-order warning (2026):** Geist, Space Grotesk, and Instrument Serif have themselves become AI reflexes — fine as one voice in a deliberate pairing, a tell when carrying a page alone. Reach further.

**Mood → font shortlists** (from Anthropic's Frontend Aesthetics Cookbook — embed in briefs verbatim):
- *Code aesthetic:* JetBrains Mono, Fira Code, Space Grotesk
- *Editorial:* Playfair Display, Crimson Pro, Fraunces
- *Startup:* Clash Display, Satoshi, Cabinet Grotesk
- *Technical:* IBM Plex family, Source Sans 3
- *Distinctive:* Bricolage Grotesque, Obviously, Newsreader

Pairing principle: **high contrast is interesting** — display + monospace, serif + geometric sans; weight extremes (100/200 vs 800/900); size jumps of 3×+.

- **Fontshare** (Indian Type Foundry) — free for commercial use; variable fonts; 59 curated pairs. Distinctive picks: Satoshi, General Sans, Clash Display, Cabinet Grotesk, Switzer, Zodiak, Supreme.
- **Pangram Pangram** — free tier includes Editorial New and Neue Montreal; a step off the beaten path.
- **Geist / Geist Mono** (Vercel), **Mona Sans** (GitHub, variable, 3 axes) — solid, free, but now common; use inside a pairing, not alone.
- **Google Fonts non-defaults** — Fraunces, Bricolage Grotesque, Instrument Serif/Sans, Plus Jakarta Sans, Syne, Hanken Grotesk. Reliable hosting, but the popular ones are becoming the *new* defaults; pair unexpectedly.
- **Pairing tools:** Fontpair, Typewolf, Figma's pairing library. Prefer variable fonts + a deliberate type scale (weights/widths chosen, not defaulted).
- **Loading gotcha:** naming a font without actually loading the file/weights silently falls back to system — always ship the `@font-face`/`<link>` and verify in the rendered screenshot.

## Icons

- **Phosphor** — free, MIT. 9,000+ icons, six weights including duotone — the best distinctive-yet-consistent choice for brand sites.
- **Lucide** — free, MIT. Clean, excellent API — but it is *everywhere* in AI output; in premium brand work, customize stroke/size or choose differently. Fine for dashboards/apps.
- **Tabler** — free, MIT. 5,900+; great for dashboards.
- **Heroicons** (Tailwind team), **Radix Icons** — clean minimal sets.
- **Iconify** — 200,000+ icons across all sets through one API; best coverage for agentic workflows.
- **Simple Icons** — brand logos ("works with Google, Stripe" rows).

## Illustrations (check license per asset)

- **unDraw** — free commercial, no attribution, recolorable to the brand color. The de facto default (which means: recolor and crop, don't use stock poses verbatim).
- **Open Peeps / Humaaans** — CC0; hand-drawn / modular people.
- **Glaze / ManyPixels** — free alternatives (ManyPixels: isometric).
- **Blush / DrawKit** — freemium mix-and-match; DrawKit includes some free Lottie.
- **Storyset** — free **with attribution** (unless Premium); animatable.

Rule of thumb: unDraw/Humaaans/Open Peeps = free commercial no attribution; Storyset needs credit.

## Photos & AI image generation

- **Unsplash / Pexels / Pixabay** — free, but none guarantee model/property releases. For recognizable people, brands, or buildings in commercial client work, get releases or avoid.
- **AI hero generation:** Midjourney (paid, most artistic), Google Imagen/Gemini image models (free tier + cheap API, strong in-image text), Ideogram (freemium, best text-in-image), **Recraft** (freemium — outputs real **SVG** vectors, ideal for code workflows), FLUX (open-source + API, best for programmatic pipelines), Adobe Firefly (freemium, "commercially safe" training data + indemnification — the safe default for risk-averse clients).

## Backgrounds, gradients & texture

All of these export SVG/PNG/CSS that pastes straight into a build:

- **Mesh gradients:** Learn UI Design Mesh Gradient Generator (+ built-in noise, Figma/SVG export), MagicPattern, Colorffy, ColorFlow (WebGL: film grain, progressive blur, chromatic aberration), CSS Hero Mesher.
- **Noise/grain:** built into the mesh tools (overlay/soft-light blends). Kills banding, adds the "premium depth" flat colors lack — use at low opacity.
- **SVG shapes & patterns:** Haikei (waves/blobs/stacks/low-poly layers), Hero Patterns (tileable), Get Waves (section dividers), Shape Divider App (animated dividers), Blobmaker (organic blobs), BGJar, Doodad, MagicPattern (30+ generators), Cool Backgrounds.
- **Glassmorphism:** `backdrop-filter` + a contrast check (dopelycolors Glassmorphism Optimizer) so frosted navbars stay legible.
- **Bento grids:** shipped by Aceternity and Magic UI; a dominant layout pattern — use when content genuinely groups into mixed-size tiles, not as default decoration.

## Licensing rules of thumb (client-work safety)

1. **GSAP** — free for commercial use since v3.13, but free-to-use ≠ open-source: no decompiling or building competing animation products.
2. **Storyset** — attribution required on the free tier.
3. **Stock photos** — no model/property release guarantees; treat recognizable subjects as unlicensed for commercial use.
4. **Premium component libraries** (Aceternity All-Access, Tailwind Plus) — check seat/project terms before reusing across multiple client projects.
5. **Fonts** — Fontshare and OFL fonts are commercial-safe; for anything else, read the license before embedding in client deliverables.
6. When in doubt on an AI-generated image for a paying client, Adobe Firefly's indemnification is the conservative pick.
