# REBUILD.md — Kenius v3 · codename **"Ledger"**

> The full, line-level plan for rebuilding kenius.us from the current hand-written
> static site ("Atelier", v2) into an Astro-based site designed **around** the live
> ops-ledger concept — instead of bolting that concept onto a luxury template.
>
> Status: **PLAN — approved direction, not yet started.**
> Production (`kenius.us`) is untouched until Phase 1 ships to a preview and is signed off.
> Written 2026-07-01. Branch of record: `claude/loving-ramanujan-5q2cjk`.

---

## 0. TL;DR

- **Keep:** the entire visual language we built (bone/ink/bronze OKLCH tokens, Bodoni Moda ×
  General Sans × IBM Plex Mono, hairline editorial layout, one dark interlude, GSAP + Lenis,
  Web3Forms, axe/Lighthouse CI, all five skills in `.claude/skills/`).
- **Change the engine:** 5 copy-pasted HTML files → **Astro 5** components + one content layer.
  Same output (fast static HTML), but every site-wide change becomes 1 edit instead of 5,
  and industries/services/steps live in **one data file** that drives every surface.
- **Change the concept's depth:** the ledger stops being a hero garnish and becomes the
  **design language of the whole site** — every section speaks it (spec in §9).
- **Fix on the way:** 4 real bugs found during planning (§17.0) + self-hosted fonts, OG images,
  JSON-LD, view transitions, per-industry landing pages (Phase 3).
- **Not doing:** React/Next/shadcn/Aceternity/Tailwind (the glowing-component look is the #1
  AI-site cliché and fights our distinctiveness), 3D/WebGL, CMS, dark mode.

---

## 1. Why rebuild — evidence from v2

1. **The strongest brand asset arrived last.** The `frontend-design` skill's audit was blunt:
   bone + didone + bronze executes well but reads as the "warm-serif luxury" AI-default
   *concept*; swap the copy and it could be a wine importer. The live ops ledger
   ("advise like a human, run like a system, 24/7") is the only element that could **only**
   be Kenius. v3 designs outward from it.
2. **The 5-file tax is real and measured.** This session alone: adding the motion scripts = 5
   edits; footer heading fix = 5 edits; the mobile `.idx-row` bug shipped because a layout
   change had to be re-validated on every page by hand. One `Layout.astro` ends the class.
3. **Content is triplicated.** Industries live in `index.html` (index rows), `work.html`
   (detail sections), and `lux.js` (ledger pool). Adding freight took 3 synchronized edits.
   One `industries.ts` ends that too.
4. **Planning verification found live bugs** (all still on prod today — see §17.0):
   homepage nav has **no About link**; all six `services.html#…` anchors from the homepage
   are **broken** (no ids exist); favicon still uses pre-AA bronze `#8A6A3C`; 60 KB of dead
   legacy `styles.css`/`main.js` uploads with every deploy.

## 2. Goals / non-goals

**Goals**
- G1. One source of truth for every repeated structure (nav, footer, industries, services, steps, FAQ, team, ledger pool).
- G2. The ledger concept carried through 100% of pages (spec §9) without breaking the editorial restraint.
- G3. Visual parity-or-better on day one; zero regression on the axe/AA gates; Lighthouse ≥ 95 perf.
- G4. Exact URL + anchor parity with prod (§16) — no broken links, no redirect chains.
- G5. Room to grow: per-industry landing pages, case studies, notes — added by writing a data/markdown file, not HTML.

**Non-goals**
- N1. No UI framework (React/Vue/Svelte). Islands are vanilla TS.
- N2. No component library (shadcn/Aceternity/Magic UI) — wrong aesthetic, wrong stack.
- N3. No CMS, no auth, no dark mode, no i18n (revisit only with a real client need).
- N4. No copy rewrite beyond the line-level edits in §17 — v2 copy already carries the voice.

## 3. Architecture

### 3.1 Stack
| Layer | Choice | Why |
|---|---|---|
| Generator | **Astro 5.x**, `output: 'static'`, `build.format: 'file'` | Emits `services.html` etc. — byte-compatible URL shape with today's Cloudflare clean-URL setup (§16). Zero JS by default. |
| Language | `.astro` templates + **vanilla TypeScript** islands | No framework runtime; islands compile to plain script. |
| Styling | **Hand-written CSS carried over from `lux.css`**, split into layered files; design tokens stay authored in OKLCH w/ hex fallback | Preserves craft + the "stable class names re-skin the site" rule in CLAUDE.md. No Tailwind. |
| Motion | `gsap` + `lenis` from **npm** (bundled, tree-shaken) instead of `assets/js/vendor/*.js` | Kills 131 KB of vendored files; single import site; same behavior. |
| Fonts | **Self-hosted** woff2 subsets in `public/fonts/` (§5.3) | Removes Google/Fontshare runtime dependency (which already failed once through a proxy), faster LCP, stable CLS. |
| Forms | Web3Forms (unchanged key, unchanged AJAX flow) | Works today. |
| Deploy | `npm run build` → `wrangler pages deploy dist` (same project `kenius`, same preview-branch flow) | Keeps the exact promote-when-approved workflow used all session. |
| CI | Same `quality.yml`, plus a build step; audits run against `dist/` (§15) | Gates stay hard. |

### 3.2 Kept / dropped / new
- **Kept verbatim:** tokens (§5.1), type stack + optical-sizing/tabular-nums rules, `.reveal`
  IntersectionObserver pattern, Lenis config (duration 1.05, expo-out), dark-interlude parallax,
  metric-rise triggers, honeypot + `#form-success` flow, `_headers` security block,
  `.claude/skills/*` (all four), `tokens.json` (DTCG), README's local-preview philosophy.
- **Dropped:** `assets/css/styles.css` + `assets/js/main.js` (52 KB + 8 KB dead v1/v2 code),
  `assets/js/vendor/` (npm now), `serve.sh` (replaced by `astro dev`), `.nojekyll` (GH-Pages
  artifact, meaningless on CF), duplicated `<head>` blocks ×5.
- **New:** `Layout.astro`, content layer (`src/data/*`), Ledger island, view transitions,
  OG-image generation, JSON-LD, sitemap, 404 page, per-industry pages (Phase 3).

## 4. Repository structure (target)

```
consulting/
├─ astro.config.mjs              # static output, build.format:'file', sitemap integration
├─ package.json                  # astro, gsap, lenis, @astrojs/sitemap; scripts: dev/build/preview/audit
├─ tsconfig.json
├─ tokens.json                   # unchanged role: DTCG source of truth (adds mono + accent-dark ✓ already)
├─ REBUILD.md                    # this file
├─ DESIGN.md                     # updated: system v3 "Ledger" (§17.9)
├─ CLAUDE.md                     # updated: build step now exists (§17.8)
├─ README.md                     # updated: dev/build/deploy commands
├─ .github/workflows/quality.yml # + build step, audits dist/ (§15)
├─ ci/
│  ├─ a11y.mjs                   # now audits dist/*.html (§15)
│  └─ lighthouserc.json          # staticDistDir: ./dist
├─ public/
│  ├─ _headers                   # rewritten caching (§14.2)
│  ├─ favicon.svg                # single file, NEW accent #6E5326 (bug fix §17.0-B3)
│  ├─ fonts/                     # bodoni-moda-var.woff2, bodoni-moda-var-italic.woff2,
│  │                             # general-sans-var.woff2, plex-mono-400.woff2, plex-mono-500.woff2
│  └─ og/                        # generated social cards (Phase 2)
└─ src/
   ├─ styles/
   │  ├─ tokens.css              # :root hex + @supports OKLCH block (verbatim from lux.css §5.1)
   │  ├─ base.css                # reset, body, selection, focus, skip, scroll-margin, color-scheme
   │  ├─ type.css                # serif/cap/lead/mono voices, tlink, mark
   │  ├─ components.css          # hdr/nav/overlay/idx/detail/list/dark/steps/work/quote/faq/form/cx/foot/ledger
   │  └─ motion.css              # .reveal, keyframes, lenis classes, reduced-motion block
   ├─ data/
   │  ├─ industries.ts           # ★ single source: 6 industries (§6.1)
   │  ├─ services.ts             # 6 services + slugs → fixes broken anchors (§6.2)
   │  ├─ steps.ts                # engagement timeline w/ real durations (§6.3)
   │  ├─ ledger.ts               # seed rows + live pool, derived from industries (§6.4)
   │  ├─ faq.ts / team.ts / work.ts  # FAQ, team, selected-work metrics (§6.5)
   │  └─ site.ts                 # name, email, nav, socials, disclaimer strings
   ├─ components/
   │  ├─ Layout.astro            # <head> (meta/OG/JSON-LD/fonts), Header, Footer, scripts
   │  ├─ Header.astro / MobileOverlay.astro / Footer.astro
   │  ├─ Ledger.astro            # hero ledger; island hydrates the live feed
   │  ├─ IndexRow.astro          # .idx-row (fixes the mobile grid once, everywhere)
   │  ├─ Detail.astro            # .detail industry/service row
   │  ├─ DarkInterlude.astro     # the one dark band w/ parallax hook
   │  ├─ Steps.astro / WorkRow.astro / Quote.astro / Faq.astro
   │  ├─ ContactForm.astro       # island: AJAX + ledger-style success (§9.5)
   │  └─ StatusLine.astro        # footer "all agents operational · 24/7" (§9.6)
   ├─ scripts/
   │  ├─ core.ts                 # nav stuck, overlay, reveals, year — ≈ lux.js, minus form/ledger
   │  ├─ ledger.ts               # live feed island (pool imported from data — no duplication)
   │  ├─ form.ts                 # contact island
   │  └─ motion.ts               # Lenis + GSAP moments; dynamic-imported, reduced-motion gated
   └─ pages/
      ├─ index.astro
      ├─ services.astro
      ├─ work.astro
      ├─ about.astro
      ├─ contact.astro
      ├─ 404.astro               # NEW (§9.7)
      └─ industries/[slug].astro # Phase 3: 6 generated landing pages (§18.3)
```

## 5. Design system (v3 = v2 + the third voice, formalized)

### 5.1 Tokens — carried verbatim, two additions already made in v2
Copied 1:1 from `lux.css` into `src/styles/tokens.css` (hex `:root` + `@supports (color: oklch())` block) and mirrored in `tokens.json`:

| Token | Value (hex / OKLCH) | Role |
|---|---|---|
| `--paper` | `#EFEDE7` / `oklch(94.6% .008 91.5)` | bone canvas |
| `--paper-2` | `#E6E4DC` / `oklch(91.8% .011 95.2)` | recessed surfaces |
| `--ink` | `#1A1A17` / `oklch(21.7% .006 106.9)` | display text |
| `--ink-soft` | `#45433C` / `oklch(38.3% .012 93.8)` | body |
| `--muted` | `#565248` / `oklch(43.9% .017 88.8)` | captions (AA 6.65:1) |
| `--accent` | `#6E5326` / `oklch(46.1% .071 78.2)` | bronze on light (AA 6.13:1) |
| `--accent-dark` | `#C9A063` / `oklch(73% .092 76.4)` | bronze on dark (AA 7.75:1) |
| `--dark` / `--dark-paper` | `#131210` / `#1B1A16` | interlude |
| `--dark-text` / `--dark-muted` | `#ECE8DE` / `#9C988B` | text on dark |
| `--line` / `--line-soft` / `--dark-line` | ink @ .18/.10 · dark-text @ .16 | hairlines |

**tokens.json addition (1 line):** `typography.mono: "IBM Plex Mono"` (the third voice is currently only in CSS).

### 5.2 Type — the three voices (this is the system's thesis)
| Voice | Face | Where | Rules |
|---|---|---|---|
| **Human** | Bodoni Moda (var, opsz 6–96) | display/H1–H3, quotes, big mail | wght 400 display (v2 polish), true italics only, `font-optical-sizing:auto`, tracking −.022em hero / −.014em rest, leading .98–1.03 |
| **Interface** | General Sans (var) | body, UI, `.cap` labels | 300–600; caps at `--cap` size, .22em tracking |
| **Machine** | IBM Plex Mono 400/500 | ledger, status verbs, timestamps, tags, footer status, 404 | `.8–.82rem`, `tabular-nums`; **bronze is reserved for outcomes/status**, muted for metadata |
| Numerals | — | metrics | `lining-nums tabular-nums` everywhere data aligns |

### 5.3 Fonts — self-hosted (replaces two runtime CDNs)
- Files (latin subsets, woff2): `bodoni-moda-var.woff2` (~45 KB), `bodoni-moda-var-italic.woff2` (~40 KB), `general-sans-var.woff2` (~35 KB), `plex-mono-400/500.woff2` (~2 × 15 KB). Budget ≤ 150 KB total.
- `@font-face` with `font-display: swap` + `size-adjust`ed local fallbacks (Georgia / Helvetica / Menlo) to pin CLS ≈ 0.
- `<link rel="preload" as="font">` for Bodoni roman + General Sans only (the above-the-fold pair).
- Deletes 4 `<link>`s + 3 preconnects from every head; removes the observed proxy/CDN failure mode.

### 5.4 Layout & spacing — unchanged
Container 1320px; `--pad clamp(1.25rem,5vw,4rem)`; section rhythm `clamp(4.5rem,9vw,11rem)`; the `.split`/.`detail` asymmetric grids; hairlines not shadows; radius 0 (inputs) / 3px (button) — **decision §20-D2: flatten button to 0 for full consistency (my rec: yes).**

### 5.5 Motion tokens — unchanged + one addition
`--ease: cubic-bezier(.22,.7,.3,1)`; reveal 1s/22px; ledger enter .5s/−6px; **new:** `--vt-fade: 180ms` for view transitions (§10.3).

## 6. Content model — the single source of truth (`src/data/`)

### 6.1 `industries.ts` ★ (drives: homepage index rows · work.html sections · ledger pool · Phase-3 landing pages · sitemap)
```ts
export type Industry = {
  slug: string;            // anchor + Phase-3 URL: /industries/{slug}
  num: string;             // "/01"…"/06"
  name: string;            // "Property management"
  short: string;           // homepage index row description
  headline: string;        // work.html H2
  pain: string;            // work.html lead
  builds: string[];        // 3 checklist items
  outcome: string;         // outcome cap line
  log: LedgerLine[];       // this industry's ledger moments (feeds pool + §9.2 per-section line)
};
```
Content = v2 copy migrated verbatim (property, real-estate, law, accounting, home-services, freight) with each industry's **canonical log line** attached:

| slug | canonical log line |
|---|---|
| `property` | `02:14 · “no heat — unit 4B” → triaged EMERGENCY · dispatched` |
| `real-estate` | `18:22 · portal lead · 3BR, pre-approved → qualified · tour booked` |
| `law` | `03:51 · after-hours injury call → conflict-checked · consult booked` |
| `accounting` | `06:39 · “still need my W-2?” → docs collected` |
| `home-services` | `23:58 · missed call · furnace out → called back · tech en route` |
| `freight` | `04:12 · “where’s my load #LT-4471?” → ETA sent` |

### 6.2 `services.ts` (drives: services.html sections · homepage services index · **fixes the six broken anchors**)
Slugs pinned to what the homepage already links to (so old URLs deep-link correctly forever):
`consulting`, `agents`, `voice`, `automation`, `copilots`, `integrations`.
Fields: `num, slug, kicker?, title, lead, checks[]`. Copy migrated verbatim from v2.

### 6.3 `steps.ts` — numbers that mean something (replaces decorative 01–04)
| tag (mono) | title | detail |
|---|---|---|
| `WK 0` | Assess | 30-min call + workflow walkthrough; we find where AI pays off — and where it doesn't. |
| `WK 1–2` | Prototype | A working slice on your real data — not a slide. |
| `WK 4–8` | Build | The pilot, fixed fee, on a calendar you can hold us to. |
| `HANDOVER` | Run — or hand over | We operate and tune it, or your team takes the keys. No lock-in. |
(Weeks sourced from existing services copy: "one to two weeks" assessment, "four to eight weeks" pilot — now the structure *encodes* it.)

### 6.4 `ledger.ts`
- `seed`: the 5 overnight rows currently hard-coded in `index.html` (§17.1-L12).
- `pool`: **derived** — `industries.flatMap(i => i.log)` + the 8 generic moments from `lux.js`. One place; the feed automatically gains lines when an industry is added.
- Feed constants: `TICK_MS 3400`, `START_DELAY 3200`, `MAX_ROWS 5`, virtual clock +1–6 min/tick — unchanged from the approved v2 behavior (pause on `document.hidden`, off under reduced-motion).

### 6.5 `faq.ts`, `team.ts`, `work.ts`, `site.ts`
Verbatim migrations of: 4 FAQ items; 4 team members + illustrative disclaimer; 3 selected-work rows with metrics (38%/1,900 · 62%/<2m · 9×/99.2%); site strings (name, `hello@kenius.us`, nav model §8.0, footer strings, the swappable-placeholder disclaimer).

## 7. Component inventory (what each replaces)

| Component | Replaces (v2) | Props / notes |
|---|---|---|
| `Layout.astro` | 5 duplicated `<head>`s + header + overlay + footer + script tags | `{ title, description, path, ogImage? }`; injects JSON-LD (§11.3), fonts, `<ClientRouter/>` (§10.3) |
| `Header.astro` | `.hdr` ×5 | unified nav (§8.0), `aria-current` computed from `path` |
| `MobileOverlay.astro` | `.overlay` ×5 | same links as header — single definition kills drift |
| `Ledger.astro` + `scripts/ledger.ts` | hero ledger HTML + feed code in `lux.js` | props `{ variant: 'hero' \| 'line' }` — `'line'` renders one canonical row (used per-industry §9.2) |
| `IndexRow.astro` | `.idx-row` markup ×12 | `{ num, title, desc, href, italicWord? }`; the mobile grid fix lives in exactly one place now |
| `Detail.astro` | `.detail` ×12 (6 services + 6 industries) | `{ num, kicker, title, lead, checks[], outcome?, id }` — **emits `id` → fixes services anchors** |
| `DarkInterlude.astro` | 4 dark sections | slot-based; includes the parallax `data-` hook |
| `Steps.astro` | `.steps` (index) + "Three ways to start" (services) | consumes `steps.ts`; mono `WK` tags in `--accent-dark` |
| `WorkRow.astro` / `Quote.astro` / `Faq.astro` | index sections | verbatim styles; FAQ stays native `<details>` |
| `ContactForm.astro` + `scripts/form.ts` | contact form + `lux.js` handler | success state re-skinned as first log entry (§9.5); honeypot, novalidate, error fallback unchanged |
| `StatusLine.astro` | — (new) | footer status line (§9.6) |

## 8. Page specs

### 8.0 Global (all pages)
- **Nav model (fixes the About gap):** `Services · Work · About · Contact` + `Book a call ↗` on every page including home. "Approach" leaves the nav (stays as an on-page section + footer Index link). Homepage nav switches from in-page anchors to real pages — subpage behavior is already this.
- Head: canonical URL, `og:image` (§11.2), JSON-LD, self-hosted fonts, single `favicon.svg`.
- Footer: adds `StatusLine`; Index column = Services/Work/About/Home (+ Approach anchor on home); Contact column unchanged; disclaimer unchanged.

### 8.1 `index.astro`
Section order unchanged: hero+ledger → manifesto → services index → dark approach → industries index → selected work → quote → FAQ → contact → footer. Changes:
1. Hero — unchanged (thesis + live ledger, exactly the approved preview).
2. Services index — rows from `services.ts`; hrefs `services.html#<slug>` now resolve (bug fix).
3. Dark "We advise first / Then we build" — steps from `steps.ts`: mono `WK 0/1–2/4–8/HANDOVER` tags replace decorative 01–04.
4. Industries index — 6 rows from `industries.ts`; **each row's third cell becomes its canonical log line in mono** (replaces the prose description — the row itself now speaks ledger; prose moves to a `title=`-free plain sentence beneath on mobile if wrap testing demands, decision §20-D3).
5. Selected work — unchanged (rows from `work.ts`, tabular metrics).
6. Quote/FAQ/contact — unchanged.

### 8.2 `services.astro`
- 6 × `Detail` from `services.ts` **with ids** — the six inbound links work for the first time.
- Dark section: "Three ways to start" re-tagged with mono `/ START HERE · / MOST POPULAR · / ONGOING` in `--accent-dark` (visual now, same copy) and durations bolded to echo `steps.ts`.
- CTA section unchanged.

### 8.3 `work.astro`
- Hero unchanged.
- 6 × `Detail` from `industries.ts`, and **each section opens with its canonical `Ledger variant='line'` row** above the H2 — the "structure is information" move (§9.2).
- Dark "Same playbook, your industry" — unchanged copy; list of adjacent verticals stays.

### 8.4 `about.astro`
- Hero + "Why we exist" unchanged.
- Dark "What we believe" — the 6 numbered `ln` spans (01–06) become mono tags; copy unchanged.
- Team + CTA unchanged (still clearly-swappable placeholders).

### 8.5 `contact.astro`
- Form fields/flow unchanged (name, company, email, area select w/ custom caret, message, honeypot).
- **Success state becomes the user's own log (§9.5).**
- Aside (`.cx`) unchanged; "What happens next" 01/02/03 → mono timestamps `+0h · +1 day · +1 wk` (encodes the promise, not decoration).

### 8.6 `404.astro` — new
Bone canvas, didone `Log line not found.`, one mono row: `--:-- · this page → not in the index · <a>back to home</a>`. Header/footer standard. (Cloudflare Pages serves `404.html` automatically.)

## 9. The ledger language — global treatments
1. **Hero (home):** live feed — approved, unchanged.
2. **Work sections:** one canonical static log line per industry above each H2 — mono, muted, bronze outcome; no animation (one live surface per site is the restraint rule).
3. **Approach/steps:** mono `WK` tags = real durations.
4. **Homepage industries index:** third cell = the industry's log line (mono).
5. **Contact success:** replaces the plain thank-you:
   ```
   ● ENQUIRY LOGGED
   00:00 · your message → received
   next  · a real person reads it → reply within one business day
   ```
   (H2 "Thanks — message received." stays for a11y/heading order; the log renders beneath it.)
6. **Footer (all pages):** `● all agents operational · 24/7` — mono, muted, static dot (no fake uptime claims beyond the illustrative disclaimer already in the footer).
7. **404:** §8.6.
8. **Hard restraint rules:** ledger text ≥ AA (muted 6.65:1 / accent-dark on dark 7.75:1); only the hero animates; everything mono is content-true (times, tags, outcomes) — never decoration.

## 10. Motion spec
1. **Lenis** — unchanged config; anchor glide with −72px header offset; `lenis` classes in `motion.css`.
2. **GSAP** — unchanged moments: hero H1 rise; dark-interlude y-parallax (±26px, scrub); metric rises. Loaded via `motion.ts` **dynamic import** so core JS stays tiny; skipped entirely under reduced-motion (verified pattern from v2).
3. **View transitions (new):** Astro `<ClientRouter/>`; header/footer `transition:persist`; content cross-fade 180ms `--ease`; explicitly disabled under `prefers-reduced-motion` (belt-and-braces beyond Astro's default).
4. **Ledger feed:** rules in §6.4; `.enter` animation only under `no-preference`.
5. **Reduced-motion matrix (CI-checked):** reveals visible · no Lenis · no GSAP · no feed ticks · no view transitions · static scroll-cue — identical to v2 behavior.

## 11. SEO & meta
1. Per-page `<title>`/description — migrated verbatim from v2 heads.
2. **OG/Twitter cards (new):** 1200×630 generated at build (satori or a Playwright snap of an OG template) — bone canvas, didone page title, one mono ledger line, wordmark. `public/og/{page}.png`.
3. **JSON-LD (new):** `ProfessionalService` (name, url, email, `areaServed`, `knowsAbout`: the 6 industries) on home; `FAQPage` on the FAQ section; `BreadcrumbList` on subpages.
4. `@astrojs/sitemap` + `robots.txt` (new).
5. Canonicals absolute to `https://kenius.us`.
6. Phase 3: `/industries/{slug}` landing pages target "AI agents for {industry}" queries — content assembled 100% from `industries.ts` + shared components.

## 12. Performance budget (CI-warned via Lighthouse)
| Asset | Budget | Notes |
|---|---|---|
| HTML/page | ≤ 30 KB | |
| CSS (single bundle) | ≤ 26 KB | v2 lux.css is 23.8 KB — headroom for ledger styles |
| Core JS (`core.ts`+islands) | ≤ 8 KB | |
| Motion chunk (gsap+ScrollTrigger+lenis) | ≤ 75 KB gz, **deferred** | dynamic import after load; v2 ships 131 KB unminified-by-us |
| Fonts | ≤ 150 KB total, 2 preloaded | |
| Images | 0 raster on pages (unchanged) | OG images excluded (not render-path) |
| LCP (hero H1) | < 1.5 s mid-tier mobile | fonts self-hosted + preloaded |

## 13. Accessibility gates (all carried, some strengthened)
- axe: **0 violations, full ruleset, all pages incl. 404** — hard CI gate, settled-state method (§15).
- Contrast: tokens table §5.1 all AA; focus ring `--accent` on light / `--accent-dark` in `.dark` (v2 fix carried).
- Ledger semantics: `role="group"` + label, `<ol>`, `<time>`; **feed additions are visual-only — no `aria-live`** (a marketing feed must not spam screen readers; explicit decision).
- Landmarks/skip/heading order — carried; `Detail.astro` guarantees one `h2` per section.
- Keyboard: overlay focus behavior, `details` FAQ, visible `:focus-visible` everywhere — carried.
- Reduced-motion matrix §10.5. Curly-quote/apostrophe rule and `scroll-margin-top` — carried into components.

## 14. Build & deploy
### 14.1 Commands
`npm run dev` (localhost:4321) · `npm run build` → `dist/` · `npm run audit` (build + ci/a11y against dist) · deploy: `wrangler pages deploy dist --project-name=kenius --branch=<motion|main>` — **same preview→promote flow as this whole session.**
### 14.2 `public/_headers` (rewritten)
```
/_astro/*        Cache-Control: public, max-age=31536000, immutable   # hashed filenames
/fonts/*         Cache-Control: public, max-age=31536000, immutable
/og/*            Cache-Control: public, max-age=604800
/*               Cache-Control: public, max-age=0, must-revalidate    # HTML always fresh
                 + existing security headers (nosniff, referrer, frame, permissions)
```
Ends the stale-cache problem **permanently** (hashed assets bust themselves) while restoring long caching we had to give up in v2.
### 14.3 Redirects
None needed — `build.format:'file'` keeps `/{page}` URL shape identical. `public/_redirects` reserved for Phase 3 if slugs ever move.

## 15. CI (`quality.yml` diff)
- Both jobs gain: `npm ci` + `npm run build`.
- `ci/a11y.mjs`: page list gains `404`; navigates `file://…/dist/{page}.html`; same settled-state style-tag + reduced-motion method; still the **hard** gate.
- `lighthouserc.json`: `staticDistDir: "./dist"`; same thresholds (a11y 1.0 warn-as-error stays via axe being the hard gate).
- New quick job: `linkcheck` — crawls `dist/` for broken internal hrefs/anchors (**would have caught the services-anchor bug**; ~20-line script).

## 16. Parity & migration checklist (verified against prod during planning)
- URLs: `/`, `/services`, `/work`, `/about`, `/contact` — identical (build.format:'file' + CF clean URLs). NEW: `/404.html`, Phase 3 `/industries/*`.
- Anchors preserved: index `#services #industries #work #approach #contact`; work `#property #real-estate #law #accounting #home-services #freight`; contact `#form`. **NEW-working:** services `#consulting #agents #voice #automation #copilots #integrations`.
- Web3Forms key, subject, from_name — unchanged. `hello@kenius.us` unchanged everywhere.
- `robots`/sitemap are additive; no URL is removed or renamed ⇒ zero SEO loss risk.
- Rollback: previous Pages deployment one `wrangler pages deploy` away (same as today); git history untouched.

## 17. THE EXHAUSTIVE CHANGE LIST — every file, every notable line

### 17.0 Bugs found while writing this plan (fix regardless of rebuild; all live on prod today)
- **B1 · index.html:29–34** — primary nav is `#services / #work / #approach / #contact`: **About is unreachable from the homepage** (also absent from the mobile overlay, lines 43–47, and the footer Index column, 295–299). → v3 unified nav §8.0. *(Hotfix option for v2: swap `#approach` → `about.html`.)*
- **B2 · index.html services index (lines ~99–160)** — all six links (`services.html#consulting|#agents|#voice|#automation|#copilots|#integrations`) point at **ids that don't exist** in services.html (verified: only `#main`, `#overlay`). → v3 `Detail.astro` emits ids (§6.2). *(Hotfix option: add 6 `id=` attrs to services.html.)*
- **B3 · all 5 heads** — favicon data-URI still `fill='%238A6A3C'` (pre-AA bronze; accent has been `#6E5326` since the a11y pass). → one `public/favicon.svg` with `#6E5326`.
- **B4 · deploy payload** — `assets/css/styles.css` (52 KB) + `assets/js/main.js` (8 KB) are referenced by nothing but upload on every deploy. → deleted (git history preserves them; DESIGN.md note updated §17.9).

### 17.1 `index.html` (318 lines) → `src/pages/index.astro` + components/data
- L1–17 head → `Layout.astro` props `{title:"Kenius — We find where AI belongs. Then we build it.", description:(verbatim), path:"/"}`; two font `<link>`s + three preconnects **deleted** (self-hosted §5.3); favicon line deleted (public asset, new hex); **adds** og:image/canonical/JSON-LD.
- L19 skip link → `Layout` (verbatim).
- L20–38 header → `<Header/>`; nav hrefs per §8.0 (`services.html`,`work.html`,`about.html`,`contact.html`); `Book a call ↗` unchanged.
- L41–49 overlay → `<MobileOverlay/>` — same §8.0 links (About added — part of B1).
- L53–74 hero → kept verbatim inside `index.astro` (kicker, availability dot, H1 with `.it mark` "belongs.", lead, actions, scroll-cue).
- L~75–95 ledger block → `<Ledger variant="hero"/>`; the 5 hard-coded `<li>` seed rows move to `ledger.ts.seed` (identical strings, curly quotes preserved).
- L76 `<hr class="wrap rule reveal">` → kept.
- L79–88 manifesto → verbatim.
- L90–168 services index → `services.data` × `<IndexRow/>`; hrefs unchanged **but now resolve** (B2); the `.it` italic words (`consulting`, `voice AI`) become `italicWord` props.
- L156–210 dark approach → `<DarkInterlude>` + `<Steps/>`; **section id `approach` kept**; step labels `01–04` → `WK 0 / WK 1–2 / WK 4–8 / HANDOVER` (§6.3); copy of the 4 step bodies migrated verbatim.
- L170–204 industries index → `industries.data` × `<IndexRow/>`; **desc cell → canonical mono log line** (§8.1-4); hrefs `work.html#{slug}` unchanged.
- L212–260 selected work → `work.ts` × `<WorkRow/>`; metrics verbatim (38% · 1,900 · 62% · <2m · 9× · 99.2%) with `tabular-nums` (v2 rule carried).
- L~262–275 quote → `<Quote/>` (Priya Menon, verbatim incl. curly quotes).
- L~277–291 FAQ → `<Faq/>` from `faq.ts` (4 items verbatim; native `details`).
- L293–307 contact section (id `contact`) → verbatim; `big-mail` unchanged.
- L308–318 footer + scripts → `<Footer/>` (+`StatusLine`); the 5 `<script>` tags → Astro-bundled `core.ts` + dynamic `motion.ts` (vendor tags deleted).

### 17.2 `services.html` (182 lines) → `src/pages/services.astro`
- Head/header/overlay/footer → `Layout` (same as 17.1; page title/description verbatim).
- L41–47 page-hero → verbatim (`breadcrumb`, H1 "…build what fits.", lead).
- L49–123 six `.detail` blocks → `services.ts` × `<Detail/>` — copy verbatim; **each gains `id={slug}`** (fixes B2); the `01 START HERE` kicker (only on the first) becomes `kicker` prop.
- L125–147 dark "Three ways to start" → `<DarkInterlude>` + list from `steps.ts`-adjacent data; `.ln` tags (`/ Start here` etc.) — mono + `--accent-dark` (already tokenized in v2), durations emphasized.
- L149–155 CTA → verbatim.

### 17.3 `work.html` (169 lines) → `src/pages/work.astro`
- Boilerplate → `Layout` (title/desc updated to mention six industries incl. freight — one line).
- L41–47 hero → verbatim.
- L49–~132 six `.detail` industry blocks → `industries.ts` × `<Detail/>`; ids kept (`property`… `freight`); copy verbatim; **each gains `<Ledger variant="line"/>` above its H2** (§9.2).
- Dark "Same playbook, your industry" → verbatim (component-wrapped).

### 17.4 `about.html` (123 lines) → `src/pages/about.astro`
- Boilerplate → `Layout`; hero + "Why we exist" verbatim.
- L59–71 dark "What we believe" → data-driven list; `ln` 01–06 → mono tags (copy verbatim; inline `style="color:var(--accent-dark)"` ×6 and `border-color` inline styles ×7 move into `components.css` — **13 inline styles deleted**).
- L73–96 team + CTA → `team.ts` × verbatim markup; illustrative-team cap line kept.

### 17.5 `contact.html` (130 lines) → `src/pages/contact.astro`
- Boilerplate → `Layout`; hero verbatim.
- Form L52–78 → `<ContactForm/>`: identical fields, hidden inputs (access_key `c8d5…c331`, subject, from_name), honeypot, novalidate, placeholders (curly-quote versions), custom select caret.
- L79–82 `#form-success` → ledger-style success (§9.5) — H2 line kept, body re-skinned.
- Aside `.cx` verbatim; "What happens next" 01/02/03 → `+0h / +1 day / +1 wk` mono tags (§8.5).
- Footer "Wired for Web3Forms" note → verbatim.

### 17.6 `assets/css/lux.css` (~470 lines) → `src/styles/{tokens,base,type,components,motion}.css`
Split, not rewritten — every rule ports verbatim except:
- `:root` gains `--vt-fade: 180ms` (1 line).
- `.btn-lux` `border-radius: 3px` → `0` **if D2 approved** (1 line).
- `.idx-row` mobile-fix block (v2) ports into `IndexRow` styles — now exists once.
- `.ledger-rows .dom` column widths gain a `freight`-length check (8ch → 9ch; 1 line).
- New: `.ledger--line` (§9.2), `.status-line`, `.log-success` (§9.5), 404 styles (~40 new lines total).
- Deleted: nothing else. Class names stay stable per CLAUDE.md.

### 17.7 `assets/js/*` → `src/scripts/*`
- `lux.js` L1–47 (year/hdr/overlay/reveals/resize) → `core.ts` verbatim logic, typed.
- `lux.js` L48–67 form handler → `form.ts` (island) — logic unchanged, success-render swapped (§9.5).
- `lux.js` L70–115 ledger feed → `ledger.ts` (island) — logic unchanged; `POOL` deleted, imported from `data/ledger.ts` (kills duplication).
- `motion.js` → `motion.ts` — logic unchanged; imports from npm; wrapped in `matchMedia` gate + dynamic import.
- `assets/js/vendor/{gsap,ScrollTrigger,lenis}.min.js` → **deleted** (npm: `gsap@^3.13`, `lenis@^1.1`).

### 17.8 `CLAUDE.md` — 4 line-level edits
- "hand-written HTML + one tokenized CSS file + vanilla JS. **No framework, no build step.**" → "Astro 5 static site — components + a content layer (`src/data/`), hand-written token CSS, vanilla-TS islands. `npm run build` → `dist/`. No UI framework."
- Local preview line: `./serve.sh` → `npm run dev`.
- Deploy line: add `npm run build && wrangler pages deploy dist`.
- Design section: system name → 'Atelier v3 · "Ledger"'; add the three-voices rule + "mono = content-true, bronze = outcomes-only" bans.

### 17.9 `DESIGN.md` — additive update
New §"The third voice & the ledger" (mono rules, restraint rules §9.8); implementation note → Astro paths; §2 palette table gains `--accent-dark` row (it's referenced but missing from the table today — 1 line); note that v1/v2 `styles.css` is deleted from the tree and lives in git history (tag `v2-atelier-final`).

### 17.10 Deletions
`assets/css/styles.css` · `assets/js/main.js` · `assets/js/vendor/` (3 files) · `serve.sh` · `.nojekyll` · per-page favicon data-URIs ×5 · Google/Fontshare `<link>`s ×5 pages · duplicated header/overlay/footer blocks ×5 → **≈ 1,400 duplicated/dead lines removed** against ~600 added (components + data + this plan's new features).

### 17.11 Unchanged on purpose
Web3Forms key/flow · all body copy not listed above · `tokens.json` role · `.claude/skills/` (×4) · axe settled-state methodology · preview→promote deploy discipline · illustrative-placeholder disclaimers.

## 18. Phase plan

### Phase 1 — Parity on the new engine (1 session)
Scaffold Astro → port styles (§17.6) → `Layout/Header/Footer/Overlay` → data files (§6) → 5 pages + 404 → islands (`core/ledger/form/motion`) → self-hosted fonts → `_headers` → CI update → **fix B1–B4 as a side effect of the architecture**.
**Accept when:** visual diff vs current preview ≈ 0 (screenshot pass, desktop+mobile, all pages) · axe 0 · linkcheck 0 (proves B2 fixed) · Lighthouse ≥ 95 perf · deployed to `motion` preview alias.

### Phase 2 — The concept (1 session)
Per-industry ledger lines on work + homepage index cells (§9.2/8.1-4) · `WK` timeline (§6.3) · contact log-success (§9.5) · footer status line · 404 polish · view transitions · OG images + JSON-LD + sitemap.
**Accept when:** design-review skill re-run scores the "could this be a wine shop?" test as *no* · axe still 0 · you sign off the preview.

### Phase 3 — Growth (optional, later)
`/industries/[slug]` landing pages (6, generated) · case studies as before/after logs · analytics enable · promote to `kenius.us` · restore long-cache (already automatic via hashed assets).

## 19. Risks & mitigations
| Risk | Mitigation |
|---|---|
| Rebuild regresses something subtle | Parity phase is *pure port* — concept changes only land in Phase 2; screenshot-diff gate both phases |
| Astro upgrade churn | Pin versions; site is static output — worst case, `dist/` from the last good build still deploys |
| View transitions jank on low-end | 180ms fade only; persist header; reduced-motion kill-switch; can ship Phase 2 without it |
| Font subsetting misses a glyph (curly quotes, →, ●) | Subset spec explicitly includes `“”‘’—–→↗●·×` + latin; CI page render catches tofu |
| Solo-maintainer bus factor | This file + updated CLAUDE.md/README are the onboarding docs |

## 20. Open decisions (answer before/during Phase 1)
- **D1** — Homepage nav: adopt unified `Services · Work · About · Contact` (**my rec — fixes B1**) or keep in-page anchors and only add About?
- **D2** — `.btn-lux` radius 3px → 0 for full flatness? (**my rec: 0**)
- **D3** — Homepage industries index: mono log line *replaces* the prose cell (**my rec**) or renders beneath it?
- **D4** — OG image generator: build-time satori (fast, code-only) vs Playwright screenshot of an HTML template (pixel-perfect fonts; **my rec**)?
- **D5** — Tag `v2-atelier-final` before Phase 1 lands? (**my rec: yes — one command, free rollback anchor**)

---

*End of plan. Approval to start = "Phase 1 go".*
