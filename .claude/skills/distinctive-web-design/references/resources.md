# Toolkit Catalog

The full resource catalog. Prices, tiers, star counts, and version notes are point-in-time (mid-2026) — re-verify before purchase or license-sensitive decisions.

## Table of contents

1. [Claude Code design environment](#1-claude-code-design-environment)
2. [Component libraries by stack](#2-component-libraries-by-stack)
3. [Animation & motion](#3-animation--motion)
4. [3D / WebGL](#4-3d--webgl)
5. [Color, tokens & theming](#5-color-tokens--theming)
6. [Templates & boilerplates](#6-templates--boilerplates)
7. [Inspiration sources & how to use them](#7-inspiration-sources--how-to-use-them)
8. [Supporting tools: deploy, forms, analytics, images, QA](#8-supporting-tools)
9. [Complementary AI builders](#9-complementary-ai-builders)
10. [GitHub repos & awesome lists](#10-github-repos--awesome-lists)

---

## 1. Claude Code design environment

- **frontend-design skill** (free, Anthropic; `anthropics/claude-code` → plugins, also `anthropics/skills`). Forces a committed aesthetic direction before code; the single highest-leverage install. Skills are an open standard — works in Claude Code, Cursor, Codex CLI, Gemini CLI.
- **Vercel web-design-guidelines skill** (free; `vercel-labs/agent-skills`). Encodes Vercel's UI/UX + WCAG standards as an audit pass; fetches fresh guidelines remotely per review. Compliance layer — complements frontend-design's creativity layer.
- **Playwright MCP** (free, Microsoft; `npx @playwright/mcp@latest`). Drives real Chromium via the accessibility tree — token-efficient and deterministic. ~2 dozen tools (`browser_navigate`, `browser_snapshot`, `browser_click`...). The companion `@playwright/cli` cut token use ~4x by writing snapshots to disk.
- **shadcn MCP** (free, official; `{"command":"npx","args":["shadcn@latest","mcp"]}` in `.mcp.json`). Live registry access to shadcn + namespaced third-party registries ("add a login form"). Stops hallucinated props and stale patterns.
- **21st.dev Magic MCP** (freemium, API key; `npx @21st-dev/magic@latest`). "/ui …" generates a component into the project. Fast first drafts of a section.
- **Figma MCP** (subscription; token-based open-source alternatives exist). Pulls design specs into context. The high-end loop: Figma MCP (specs) → Claude Code (interpretation) → Playwright MCP (validation).
- **Chrome DevTools MCP** (free). Live Chrome control for inspection/perf debugging.
- **Context7 MCP** — injects up-to-date, version-specific library docs into context; prevents stale API patterns.
- **CLAUDE.md patterns that consistently work:** a `brand_assets/` rule (assets in the folder get used; defined palettes are law); explicit bans ("default Tailwind palette is off the table; build from a brand color", "flat shadow-md is not an option"); a Screenshot Workflow section; hooks for deterministic actions (lint/format after edits). Treat it as a living document. Reference-cloning works better on sections than full pages.
- **design-reviewer subagent:** define one in `.claude/agents/` (project-scoped, version-controlled) that screenshots via Playwright and checks output against the design brief/tokens; runs in its own context and returns only a summary. Parallel review agents measurably beat a single pass (~75% actionable suggestions vs <50% in one practitioner's testing).
- **Community anti-slop packages:** `impeccable` (impeccable.style — `npx impeccable detect`, ~41 deterministic AI-tell rules + opt-in LLM critique); UI/UX Pro Max (67 styles / 50 pairings / trend data); calm-design (50+ blocked patterns, Linear/Vercel-class references); bencium UX skills; rohitg00/awesome-claude-design (DESIGN.md prompts by aesthetic family).
- Many practitioners now prefer **skills** (`.claude/skills/`, readable text) over MCP servers (black boxes) for reusable design knowledge.

## 2. Component libraries by stack

### React / Next.js

- **shadcn/ui** — free, open-source. Copy-paste ownership (Radix/Base UI primitives + Tailwind); the default foundation. App shells, forms, tables, nav. Visual Builder added Feb 2026; Base UI available as primitive layer. Pairs with the shadcn MCP.
- **Aceternity UI** — 200+ free components; All-Access one-time ~$199–249. Framer Motion + Tailwind. High-impact marketing heroes, bento grids, 3D cards, spotlight/beam effects. Defined the "premium developer-tool" look — which means it's now recognizable; customize.
- **Magic UI** — 150+ free (MIT), some premium templates. Animation/micro-interaction focused; cleaner light+dark defaults than Aceternity.
- **HeroUI** (ex-NextUI) — free. Tailwind + React Aria, RSC-ready, dark mode built in. Clean app UIs.
- **Origin UI / Cult UI / Skiper UI / ReUI / MynaUI** — free + pro tiers; all extend shadcn. Cult UI adds AI-SDK patterns; Skiper ships "un-common" components; MynaUI is design-system-first with a matched Figma library.
- **Tremor** — free, open-source. React + Tailwind charts/dashboards. Data-heavy SMB dashboards and client portals.
- **Mantine** — free. 120+ components, 70+ hooks, strong theming, no Tailwind required.
- **Chakra UI v3** — free. Prop-based styling, strong WCAG/ARIA.
- **Material UI** — free core + paid MUI X. Enterprise breadth, complex CRUD/data grids. Instantly recognizable — restyle heavily for brand work.
- **Radix UI / Base UI / React Aria / Ark UI** — free headless primitives. Radix maintenance slowed post-WorkOS acquisition; **Base UI** (by MUI engineers) is the actively-maintained recommendation.
- **Park UI** — free; Ark UI + Panda CSS, multi-framework.
- **Block marketplaces:** 21st.dev; shadcn.io (6,000+ blocks, MCP, Pro ~$19/mo); Shadcnblocks; Tailark.

### Tailwind-based

- **Tailwind Plus** (ex-Tailwind UI) — paid, by the Tailwind team. Highest-quality marketing/commerce/app components + templates.
- **daisyUI** — free. Semantic class names, 20+ themes, automatic dark mode; the most popular Tailwind component library. Fast theming; pairs well with AI generation.
- **Flowbite / Preline** — free + pro. Broad component coverage.
- **HyperUI / Meraki UI / Float UI / Sailboat UI / Kokonut UI** — free copy-paste collections.
- **Headless UI** — free, Tailwind team. Unstyled accessible primitives.

### Plain HTML/CSS

- **Modern CSS baseline (2025+):** nesting, `:has()`, container queries, subgrid, `light-dark()`, OKLCH, same-document View Transitions, and **scroll-driven animations** (`animation-timeline: scroll()`/`view()`) are all Baseline — for simple scroll effects reach for native CSS before adding GSAP; it's GPU-accelerated and zero-JS.
- **Tailwind CSS v4** — free; stable since Jan 2025. Ground-up rewrite: CSS-first config via `@theme` (no tailwind.config.js), **OKLCH default palette**, native container queries, `@starting-style`; ~5x faster builds (vendor benchmark). The styling layer AI handles most naturally.
- **Pico CSS** — free, ~10KB, classless (styles semantic HTML automatically, auto dark mode). Docs, prototypes, content sites.
- **Open Props** — free. Design tokens as CSS custom properties (color, spacing, type, gradients, shadows, easings). Token-based theming without a framework.
- **Bulma** — free. Flexbox, no JS; v1.0 added CSS variables + dark mode.
- **Bootstrap** — free. Reliable but "everyone can spot it" without customization; rapid enterprise prototyping/legacy.
- **UnoCSS** — free. On-demand atomic CSS engine, faster than Tailwind JIT.

### Astro

Astro excels for SMB marketing/content sites: content collections, zero JS shipped by default, islands for interactivity, easy 100/100 Lighthouse.

- Theme sources: **astro.build/themes** (official), **Themefisher** (free + premium; law firm / business / agency themes — directly SMB-relevant), **Cosmic Themes**, **Lexington Themes**, **Colorlib**, **Astroship** (free starter), HTMLrev galleries. Many ship Tailwind v4 + shadcn + Keystatic CMS + OKLCH theming.

## 3. Animation & motion

- **Motion** (ex-Framer Motion; Motion One merged in) — free, open-source. The default React animation library: declarative, layout animations, AnimatePresence, gestures.
- **GSAP** — **100% free since v3.13 (May 2025)**, including all formerly Club-only plugins (SplitText, MorphSVG, DrawSVG, ScrollSmoother, ScrollTrigger) after Webflow's acquisition. Free-to-use, *not* open-source (no decompiling/competing products). The powerhouse for timelines, scroll-driven sequences, SVG morphing; `useGSAP` hook for React cleanup.
- **Lenis** (darkroom.engineering) — free, <4KB. Industry-default smooth scroll; one line to init; syncs with ScrollTrigger and WebGL. The GSAP ScrollTrigger + Lenis combo is the canonical award-site scroll stack.
- **Anime.js** — free. Lightweight general-purpose.
- **AutoAnimate** (FormKit) — free. One-ref drop-in for list/layout transitions — the easiest possible animation.
- **Lottie / Rive** — free + paid. Lottie plays After Effects JSON; Rive has smaller files + interactive state machines.

## 4. 3D / WebGL

- **Three.js** — free. The WebGL standard.
- **React Three Fiber + drei** — free. Declarative Three.js; the standard for 3D heroes in React.
- **Spline** — freemium. No-code 3D scenes, embeddable; fastest path to a 3D hero without shader code.

Reserve 3D for premium projects with a performance budget; it's the first thing to cut when mobile Lighthouse drops below ~90.

## 5. Color, tokens & theming

- **OKLCH-first authoring** is current best practice: perceptually uniform, P3-ready, ~85%+ browser support (postcss-oklab-function for fallbacks). Author ramps in OKLCH, export sRGB HEX fallbacks.
- **Two-tier token model:** reference ramps (`blue-1..12`) → semantic tokens (`bg-surface`, `accent`); components consume only semantic. Makes rebrands edit-once.
- **DTCG Design Tokens spec** — first stable version (2025.10, Oct 2025, W3C community group): vendor-neutral JSON with OKLCH/P3 support. The interchange standard connecting Figma Variables, Tokens Studio, Style Dictionary.
- **Style Dictionary** — free. Build-time token transformer: one source → CSS variables, SCSS, iOS/Android; OKLCH→HEX at export.
- **Radix Colors** — free. 25 accents + grays; designed 12-step scales where each step maps to a UI role; automatic light/dark + high-contrast. Don't pick colors blind.
- **Realtime Colors** — free. Live-preview a palette on a real page layout before committing.
- **tweakcn** (tweakcn.com) — open-source visual theme editor for shadcn/ui: sliders + live preview, OKLCH/HSL export for Tailwind v3/v4, built-in contrast checks, 50+ presets, AI theme-from-image (Pro). The fastest escape from default shadcn grays.
- **Other tooling:** oklch.com (picker), Coolors (fast generation), Huemint (AI palettes), ColorUI (DTCG/OKLCH token export), Open Props (token system), shadcn theming (CSS custom properties + Visual Builder, OKLCH support).

Typography, icons, illustrations, photos, and background generators: see `assets-and-licensing.md`.

## 6. Templates & boilerplates

### SaaS / app boilerplates (when auth + billing enters the picture)

- **Makerkit** (~$299–349) — B2B: multi-tenancy, RBAC, team billing; Next.js/Remix + Supabase; ships **AGENTS.md/MCP + agent rules optimized for Claude Code**.
- **Supastarter** (€349 or from ~$49/mo) — B2B multi-tenancy, i18n, Nuxt option; also ships AI-agent guidelines.
- **ShipFast** (~$199) — fastest indie launch (Stripe + auth + email); solo/consumer SaaS; no multi-tenancy.
- **ixartz/SaaS-Boilerplate** (free + paid) — Clerk + Drizzle + multi-tenancy.
- **Vercel SaaS Starter** (free, official) — Next.js + Postgres + Stripe + NextAuth.
- **T3 Stack / OpenSaaS** (free) — clean full-stack TS / open-source full SaaS.
- **Precedent** (free, Steven Tey) — not a full kit; mine it for polished Next.js + Framer Motion interaction patterns.

### Marketing / service-business sites

- **Astro themes** (Themefisher, Cosmic, Lexington, Colorlib, Astroship) — rebrand + ship fast for SMB clients.
- **Cruip** — free + paid Next.js/HTML/Tailwind marketing templates.
- **Tailwind Plus templates**, **Tailwind Awesome** marketplace, **HTMLrev** (free), **Vercel template gallery** (free).

## 7. Inspiration sources & how to use them

- **Mobbin** (freemium; Pro ~$25/mo) — largest library of real shipped mobile+web UI; filter by component/flow; Figma plugin. Use for UX patterns.
- **Refero** (~$8–14/mo) — 112,000+ real web/SaaS screens searchable by page type/component; the web-equivalent of Mobbin.
- **Godly** (free) — tightly curated award-tier landing/interactive inspiration.
- **Awwwards** (free + pro) — cutting-edge experimental.
- **Land-book / One Page Love / Lapa Ninja** — landing galleries, filterable by industry ("show me HVAC company sites").
- **SaaS Landing Page / SaaSFrame / Landingfolio** — SaaS-specific; Landingfolio has copy-paste components.
- **Siteinspire** (best filtering), **Httpster** (typography-driven minimal), **Curated.design**, **Dribbble/Behance** (visual mood only — concepts, not shipped work).

**Method:** match source to task (Mobbin/Refero → UX patterns; Land-book/Lapa → landing layouts; Godly/Awwwards → ambition ceiling). Capture screenshots, drop them in the project, and match a *section* at a time — analyzing *why* it works (hierarchy, spacing, motion) rather than copying pixels.

## 8. Supporting tools

- **Deployment:** Cloudflare Pages (free: **unlimited bandwidth**, ~500 builds/mo — the static-site default), Netlify (free tier permits commercial use; built-in Forms; moved to credit-based billing late 2025), Vercel (best Next.js DX, but **Hobby is non-commercial — client work requires Pro ~$20/user/mo**). All deploy from GitHub in minutes.
- **Forms (static/marketing):** Web3Forms (free ~**250 submissions/mo**, no account, hCaptcha; Pro ~$12/mo for 10k + files/webhooks), Formspree (free 50/mo; React lib; confirm current paid tiers on their pricing page), Basin (~100/mo free), Formspark (250 lifetime free), Netlify Forms (~100/mo free, Netlify-only lock-in), Tally (free no-code). Code-first: **React Hook Form + Zod** (free, MIT) — the natural React/Next.js fit.
- **Analytics:** Plausible (no free cloud tier — trial then ~$9/mo, or self-host free under AGPL; cookieless, EU-hosted, no consent banner — good for SMB client trust), Fathom (~$15/mo), Vercel Web Analytics (free ~50k events/mo on Hobby), PostHog (free to 1M events; replay + flags), GA4 (free; needs consent banner), Cloudflare Web Analytics (free, cookieless, one dashboard toggle on CF-hosted sites).
- **Image optimization:** Squoosh web app (the `@squoosh/lib` Node package is deprecated), sharp (Node pipelines; powers next/image), SVGO CLI + SVGOMG GUI, next/image.
- **Quality gates:** Lighthouse (CLI/CI-friendly), PageSpeed Insights (real CrUX data), axe DevTools (industry-standard a11y engine), WAVE (visual a11y). Wire Lighthouse into CI and script the audits.

## 9. Complementary AI builders

- **v0** (Vercel) — best React/Next UI generation, Design Mode, Figma import; free tier. Use for individual components/section variants.
- **Lovable** — full-stack scaffolds (Supabase, auth, deploy), GitHub sync; from ~$25/mo. Use for whole-app starts.
- **Bolt.new** — fastest WebContainer prototyping, multi-framework. Quick PoCs.
- **Claude Design** (claude.ai/design) — Anthropic's visual prototyping canvas; hands off cleanly to Claude Code for production. Caveats: defaults to the same slop without a DESIGN.md brief, has its own fast-burning usage meter, and can't host/auth/take payments — treat as a concepting surface, not a delivery pipeline.
- The agency-tested pipeline: **v0 for components → Lovable for the app scaffold → Claude Code for production finish** (security, performance, code ownership). Claude Code has the highest ceiling — full filesystem/Git/MCP access is where distinctive, owned code gets finished.

## 10. GitHub repos & awesome lists

- **anthropics/claude-code** — official; frontend-design plugin lives here.
- **anthropics/skills** — official skills repo (frontend-design, skill-creator, brand styling).
- **hesreallyhim/awesome-claude-code** (~44k stars) — the hub for slash-commands, CLAUDE.md files, hooks, workflows.
- **VoltAgent/awesome-claude-code-subagents** — 100+ specialized subagents (react-architect etc.).
- **rohitg00/awesome-claude-code-toolkit** — agents, skills, MCP configs.
- **birobirobiro/awesome-shadcn-ui**, **bytefer/awesome-shadcn-ui** — curated shadcn extensions, blocks, registries.
- **awesome-tailwindcss**, **awesome-react-components**, **darkroomengineering/lenis**.
