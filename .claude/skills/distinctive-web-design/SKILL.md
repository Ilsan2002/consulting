---
name: distinctive-web-design
description: End-to-end workflow and curated toolbox for designing and building distinctive, production-quality websites that don't look AI-generated. Use this whenever the user wants to build, redesign, restyle, or visually polish any website, landing page, marketing site, portfolio, or client site; asks to make a site look "better", "premium", "modern", "custom", or "less generic/AI"; asks which component library, template, font, color palette, icon set, or animation library to use (shadcn, Aceternity, Magic UI, Tailwind, GSAP, Lenis, Astro themes, etc.); or wants a screenshot-driven visual iteration loop, design tokens, or a pre-launch design QA pass. Complements the frontend-design skill — that one supplies aesthetic judgment; this one supplies the process, tool selection, and quality gates.
---

# Distinctive Web Design

A process skill for producing websites with a committed visual identity — not the statistical average of the web. The core problem it fights is **distributional convergence**: without direction, models sample from the high-probability center of web design (Inter font, indigo/purple gradients, white cards with shadow-md, numbered feature grids). Every phase below exists to push output away from that center *on purpose*, and to verify visually that it worked.

**If the `frontend-design` skill is available in your environment, read it before starting.** It covers aesthetic judgment (direction, typography-as-personality, signature elements, restraint). This skill wraps that judgment in a production process: environment setup → brief → design system → stack selection → visual build loop → QA. Don't duplicate its advice; apply it.

## Phase 0 — Set up the environment (once per project)

Adapt to where you're running:

**In Claude Code (or any MCP-capable agent):**
- Confirm the `frontend-design` skill/plugin is installed (`anthropics/claude-code` marketplace). Suggest the Vercel `web-design-guidelines` skill for an accessibility/quality audit pass.
- Add **Playwright MCP** (visual feedback) and **shadcn MCP** (live component registry — prevents hallucinated props) if the user agrees: `claude mcp add playwright npx @playwright/mcp@latest`; shadcn via `{"command":"npx","args":["shadcn@latest","mcp"]}` in `.mcp.json`.
- Check for a project `CLAUDE.md`. If the user builds sites repeatedly, propose a short house-style section: banned defaults, palette derivation rule, brand-assets rule, screenshot workflow. Keep it terse — it's a living document, not a manifesto.

**In a sandboxed container (Claude.ai, Cowork):**
- No MCPs needed. Use the bundled `scripts/screenshot.mjs` for the visual loop (see Phase 4). Install once per session: `npm i playwright && npx playwright install chromium --with-deps` (fall back to `--only-shell` if system deps fail).
- Pull component patterns directly from library docs/source instead of the shadcn MCP.

**Always:**
- Look for a `brand_assets/` folder (or ask if one exists). A logo in the folder gets used. A defined palette means those exact values get used — never invent brand colors that contradict provided ones.
- If redesigning an existing site, capture its current content first (fetch the URL or read the files). Content is reusable; visual identity is what's being replaced.

## Phase 1 — Write the brief like a creative director

Never start coding from "make a landing page." Produce (or elicit) a brief with these fields, then get user sign-off if anything major was assumed:

1. **Subject + audience + the page's single job.** One sentence each. If the user's request doesn't pin these down, pin them yourself and state your choice.
2. **A named aesthetic direction** — e.g. brutalist, editorial, luxury-minimal, retro-futuristic, warm analog, technical/blueprint, playful maximalist. Naming it forces commitment; "clean and modern" is not a direction.
3. **2–3 concrete references** when available. Ask the user for screenshots, or name reference sites and describe *why* they work (hierarchy, spacing, motion) — analysis transfers better than imitation. Anthropic's cookbook strategy worth applying verbatim: reference inspirations **by name** (an IDE theme, a magazine tradition, a cultural aesthetic) "without being prescriptive enough to clone them" — name it, don't clone it. Match references to sections, not whole pages: clone a header approach, a pricing layout, a footer treatment separately.
4. **Palette seed** — one brand color everything derives from (Phase 2).
5. **Type direction** — the personality the display face must carry.
6. **Motion intent** — where the one orchestrated moment lives, and what stays still.

**The ban list (state it explicitly in the brief):** Inter/Roboto as display faces; default Tailwind indigo/blue/purple palette values; flat `shadow-md` cards on white; numbered 01/02/03 feature markers unless content is genuinely sequential; purple-to-blue gradients on dark; scattered micro-animations everywhere; **second-order defaults** — Geist, Space Grotesk, Instrument Serif as the whole voice (they've become AI reflexes too); one font family doing the entire page; vague hype headlines ("Build the future of work"); motion tells (bounce/elastic easing on UI, animating width/height, image scale-on-hover). Naming anti-patterns measurably improves output — "avoid Inter and Roboto" and "use atmospheric backgrounds instead of solid colors" are documented immediate levers.

## Phase 2 — Build the design system before the pages

Small token system first; pages consume tokens only. This is what makes the design cohere and makes client rebrands an edit-once operation.

- **Color:** derive a full ramp from the brand seed in **OKLCH** (perceptually uniform, P3-ready). Two tiers: reference ramps (e.g. `blue-1..12`) → semantic tokens (`bg-surface`, `text-primary`, `accent`). Components touch only the semantic tier. Tools and pre-designed scales: see *Color, tokens & theming* in `references/resources.md`.
- **Typography:** a characterful display face + complementary body face, never the ban-list defaults. Pairing principle (from Anthropic's cookbook): **high contrast is interesting** — display + monospace, serif + geometric sans; use weight extremes (100/200 against 800/900) and size jumps of 3×+. Mood→font shortlists and sources: see *Typography* in `references/assets-and-licensing.md`. Set a deliberate type scale — for minimal directions, precision in type and spacing IS the design.
- **Spacing:** one modular scale, applied consistently. Inconsistent section padding is a top "AI-built" tell.
- **Texture & atmosphere:** decide now whether the direction calls for mesh gradients, noise/grain, patterns, or flat color. Generators that export straight to CSS/SVG: see *Backgrounds & texture* in `references/assets-and-licensing.md`.
- **Motion budget:** one signature orchestrated moment (hero load sequence, scroll narrative) + quiet functional transitions. Everything else static. Extra animation reads as AI-generated.

If the project will be cloned per-client, store tokens in a `tokens.json` (DTCG format) or CSS custom properties file so a rebrand is a single-file edit.

## Phase 3 — Choose the stack and components deliberately

Read `references/stack-recipes.md` and pick the recipe matching the project type (marketing site, SMB client site, app with auth/billing, single-file demo). Summary of the default logic:

- **Structure:** shadcn/ui (React/Next) or semantic HTML + Tailwind (Astro/static) — you own the code, no lock-in.
- **One or two "wow" moments:** Aceternity/Magic UI-class components for the hero or a feature moment — not everywhere. A page of stacked premium effects reads as a template.
- **Motion:** Motion (Framer Motion) for React micro-interactions; GSAP + Lenis for scroll choreography and smooth scroll when the direction calls for it.
- **Never** pick a library because it's familiar; pick it because the brief's direction needs what it does. The full catalog with costs, licenses, and best-for notes is in `references/resources.md`.

## Phase 4 — Build section-by-section with a visual feedback loop

Claude designs dramatically better when it can see its own output. Never hand back a page you haven't looked at.

1. Build one section at a time (hero → proof → features → CTA → footer), deriving every color/type decision from the Phase 2 tokens.
2. After each section (or at minimum after each page), render and screenshot at three viewports. With Playwright MCP: navigate + `browser_snapshot`/screenshot. In a container: run the bundled script —
   ```bash
   node scripts/screenshot.mjs <url-or-html-file> <output-dir>
   ```
   It captures desktop (1440px), tablet (768px), and mobile (390px) full-page screenshots and dumps console errors. **Look at the images.** A picture is worth a thousand tokens of guessing.
3. Self-critique against the brief: does the hero state a thesis? Does the type carry personality? Is spacing consistent? Is the signature element the *one* memorable thing? Would this design appear for any similar prompt? If yes — revise that part and say what changed.
4. Fix console errors and visual bugs before moving on. Broken sections compound.
5. **Loop discipline:** iterate ONE design dimension at a time (typography, then color, then motion). "Silence equals defaults" — when output regresses to a generic pattern, treat it as a **missing spec entry** and harden the tokens/brief (pill buttons appeared → add `border-radius: 0` to the system; Inter appeared → make the font `<link>`/`@font-face` explicit), don't just re-prompt. Corrected the same issue twice → restart the section with a sharper brief instead of patching a third time. Spend disproportionate time on the hero, pricing, and empty states; move fast elsewhere.

## Phase 5 — QA and ship

Run before calling anything done:

- **Performance:** Lighthouse (CLI or PageSpeed Insights). Mobile score below ~90 → cut heavy 3D/animation or move to zero-JS-by-default rendering (Astro) for that project.
- **Accessibility:** axe or WAVE pass; visible keyboard focus; color contrast on the actual palette; `prefers-reduced-motion` respected on every animation.
- **Fonts actually loaded:** naming a font without loading the file/weights silently falls back to a system font — the most common way a "distinctive" build ships looking default. Verify with `document.fonts.check('16px "Face"')` or by reading the letterforms in the screenshot.
- **Automated slop scan:** `npx impeccable detect` — ~41 deterministic rules for AI-generated tells (plus an opt-in LLM critique pass). Run it; fix what it flags or justify why not.
- **Responsive:** re-run the screenshot loop at all three viewports on final pages.
- **Licensing:** verify every font, icon set, illustration, and photo license for commercial use (rules of thumb in `references/assets-and-licensing.md` — e.g. Storyset needs attribution, stock photos don't guarantee model releases, GSAP is free-to-use but not open-source).
- **Plumbing:** forms, analytics, and deployment options are cataloged in *Supporting tools* in `references/resources.md`.

## Anti-slop final checklist

Scan the finished product for these tells; any hit means revise:

- Inter/Roboto anywhere prominent, or a system-default type feel
- Default Tailwind indigo-500/blue-600, or purple gradient on white/dark
- Uniform white cards + `shadow-md` + identical border-radius as the only structural device
- 01/02/03 numbered features where order carries no meaning
- Lucide icons used with zero customization in a design meant to feel premium (fine for dashboards; generic for brand sites)
- Emoji as section bullets; centered-everything layouts; animation on every element
- A hero that is "big number + small label + gradient accent" without justification
- Identical section padding rhythm with no compositional variation
- A vague hype headline ("Build the future of work") where a specific claim should be
- One font family doing the whole page (no display/body contrast) — or Geist/Space Grotesk/Instrument Serif carrying it alone (second-order defaults)
- Motion tells: bounce/elastic easing on UI elements, width/height animation (jank), image scale-on-hover as the only idea
- Testimonial carousel + three-column footer link wall as the default page ending

## Reference files

Load only what the current phase needs:

- `references/resources.md` — the full toolkit catalog: Claude Code design setup, component libraries by stack, animation/3D, color & tokens, templates & boilerplates, inspiration sources, deployment/forms/analytics/QA tools, complementary AI builders. Has a table of contents.
- `references/stack-recipes.md` — decision table + four concrete recipes (marketing site, SMB client site, SaaS/portal, single-file demo) with thresholds that change the plan.
- `references/assets-and-licensing.md` — fonts, icons, illustrations, photos/AI image generation, background & texture generators, and the licensing rules of thumb.
- `scripts/screenshot.mjs` — multi-viewport screenshot + console-error capture for the visual loop.

Prices, free tiers, and version numbers in the references are point-in-time (mid-2026); re-verify anything that gates a purchase or a license decision.
