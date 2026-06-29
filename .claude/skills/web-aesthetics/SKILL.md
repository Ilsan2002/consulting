---
name: web-aesthetics
description: Use when designing or redesigning any website, landing page, marketing site, or web UI and you want a distinctive, high-craft result instead of the generic "AI default." Establishes an opinionated aesthetic direction BEFORE coding, bans the slop defaults (Inter, blue→purple gradients, uniform radii, centered-hero-+-3-cards), and drives a see-and-iterate loop. Trigger on "design a site", "redesign", "make it look good/premium/distinctive", "landing page", "hero section".
---

# Web Aesthetics — build sites that don't look AI-generated

## Why most AI design looks the same
Models sample the high-probability center of their training data: the choices that work everywhere and offend no one. That center *is* the slop — Inter/Roboto, blue-to-purple gradients on a white background, a centered hero over three icon cards, uniform 16px radii, one generic shadow. Avoiding it is a steering problem: **commit to a specific direction and name the things you will not do.**

## The method (do this in order)

### 1. Commit to a direction BEFORE writing code
Write a one-paragraph design brief: **purpose · audience · one named aesthetic** (e.g. brutalist, editorial, luxury-minimal, retro-terminal, warm-craft, dark-technical) **· the one risk you're taking.** Then sanity-check it: *if any part reads like the default you'd produce for any similar site, change that part and say why.* The hero is a thesis statement, not a headline + button.

### 2. Pick the four things that actually create distinctiveness
Most people skip these — they're exactly where character lives, and they all map cleanly to code:
- **Type** — a real pairing, never Inter/Roboto alone. Display face carries personality (Fontshare: Clash Display, General Sans, Satoshi, Cabinet Grotesk; or Geist, Bricolage Grotesque, Instrument Serif, Fraunces). Body face is readable. Mono for labels/metadata. Use a variable font + a deliberate type scale (`clamp()`).
- **Color** — author in **OKLCH**, build a custom ramp, never default Tailwind indigo/blue. Two-tier: reference ramps → semantic tokens; components consume only semantic tokens (rebrands become one edit). One primary accent used *for function* (action/link/status), a neutral scale, at most one sparse secondary. In 2025–26 plain blue is invisible — pick something ownable.
- **Motion** — purposeful and eased, never decorative. Scroll choreography (GSAP ScrollTrigger + Lenis) or simple `IntersectionObserver` reveals. Extra animation reads as "AI-generated"; restraint reads as designed. Always honor `prefers-reduced-motion`.
- **Texture/depth** — atmospheric backgrounds beat flat fills: subtle film grain/noise, a mesh or radial glow, a faint grid. One layered shadow recipe, scaled by elevation. Dark mode: never pure `#000` — a tinted near-black, depth via luminance steps.

### 3. Brief like a creative director, not a ticket
Feed **concrete references, not adjectives**: 2–3 screenshots from Godly / Land-book / Mobbin / Refero, brand assets in a folder, exact palette + type. Match a *section* at a time (header, hero, body, footer), and analyze *why* a reference works (hierarchy, spacing, rhythm) rather than copying it.

### 4. State the negative constraints explicitly
Telling the model what NOT to do removes the defaults it would otherwise fill in. Standard ban-list:
- ❌ Inter / Roboto / system-font-only with no display face
- ❌ blue→purple (or any) gradient as the whole identity; default Tailwind palette
- ❌ pure-black or pure-white flat backgrounds; one generic `shadow-md` everywhere
- ❌ uniform 16px radius on everything; identical centered-hero + 3-feature-card template
- ❌ numbered 01/02/03 markers unless the content is genuinely a sequence
- ❌ vague hype ("Build the future", "best-in-class"); hedging copy
- ❌ stock photos of diverse teams at laptops; over-smooth AI illustrations

### 5. Close the loop — design by seeing
Don't one-shot. Render → screenshot → read it critically → fix → re-render. Use a headless browser (Playwright/Puppeteer) to capture desktop + mobile, check the console, and verify the change actually looks right before declaring done. If you can't see it, you're guessing.

## Workflow defaults
- **Stack for distinctive marketing:** shadcn/ui (shell/forms) + Aceternity/Magic UI (one or two orchestrated moments) + custom OKLCH tokens + Fontshare/Geist type + Motion/GSAP/Lenis. For zero-JS content sites, Astro. For a no-build site, hand-written HTML + one tokenized CSS file beats a framework for control and ownership.
- **Tokens:** keep a `tokens.json` (DTCG / Style Dictionary) or a `:root` token block so a rebrand is an edit-once palette/type swap.
- **Finish in code you own** — use v0/Lovable/Bolt to spin variants fast, but land production in real, owned files.

## Self-check before shipping
1. Could this be mistaken for any other AI-generated site? If yes, push one axis (type, color, motion, or texture) further.
2. Is the accent doing a *job* everywhere it appears, or just decorating?
3. Did you verify it rendered (desktop + mobile), not just that it compiled?
4. Reduced-motion, keyboard nav, and AA contrast all handled?
