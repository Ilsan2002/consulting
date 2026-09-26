# Overnight — design exploration

A night-mode redesign of the Kenius site, built around one idea: **the work sorts
itself while you sleep.** The whole site shares a single GPU particle field. Each
section asks it for a shape that explains that section, and the particles travel
between shapes as you scroll.

Not linked from production. Every page is `noindex`.

## Brief

- **Purpose:** get owners and operators to book the 30-minute call by *showing* what
  "AI quietly running the routine" looks like, not claiming it.
- **Audience:** owners and operators of small and mid-sized businesses (property,
  freight, law, accounting, trades, real estate). They're wary of hype.
- **Aesthetic:** dark and technical, like an instrument panel at night. A tinted
  near-black canvas, Geist Light for display, Geist Mono for timestamps and labels,
  and the pixel wordmark carried over from the live site.
- **The risk:** there are no images and no icons. Every visual is the same particle
  field, re-formed into a diagram: triage lanes, a timeline, a strategy map,
  plan → act → a person approves, voice ripples, a stack of documents with one
  exception, a knowledge globe, your systems connected, a horizon, and a 24-hour ring
  with the real "now".
- **Colour has a job.** Green means live, handled, or the primary action. Amber
  appears only for "flagged for a person". Nothing else is coloured.

## Pages

| EN | RU |
| --- | --- |
| `index.html` | `ru/index.html` |
| `services.html` | `ru/services.html` |
| `work.html` (playbooks) | `ru/work.html` |
| `about.html` | `ru/about.html` |
| `contact.html` | `ru/contact.html` |
| `404.html` | — |

All copy comes from the live site (`production-live-snapshot/`), in both languages.
The contact form posts to the same Web3Forms endpoint and keeps the honeypot,
inline success state and error fallback. The agent log uses the visitor's real
local clock and the same illustrative entries and disclaimer as the live site.

## How it works

- `assets/overnight-gl.js` is a raw WebGL2 engine with no dependencies. Particle
  positions live in float textures and are simulated in a fragment shader. They
  spring toward the active formation with some turbulence and a soft wake around
  the mouse, then render as additive points with depth of field. Post-processing is
  bloom, ACES tone mapping, the night sky and film grain. Desktop runs 65k
  particles and small screens run 24k. Resolution adapts to hold frame rate.
- `assets/overnight.js` handles the scenes. Any element with `data-form="…"` names a
  formation and contains a `.stage` box. Each frame the camera fits that formation
  into the box, so the visuals sit in the layout and scroll with it. It also runs
  the pinned services list, labels anchored to points in the formations, the agent
  log, the menu and the form.
- `assets/overnight.css` puts every token (OKLCH, with hex fallbacks) in `:root`.
  Components use only those tokens.

## Fallbacks

- **`prefers-reduced-motion`:** formations appear static, with no morphing, drift,
  log rotation or reveals.
- **No WebGL2, no JS, or a lost GPU context:** a static night background. The
  stages collapse, the services list un-pins, and all content remains.

## Preview

```sh
./serve.sh            # from the repo root
open http://localhost:8000/design-explorations/overnight/
```

Useful query flags: `?reduced` forces reduced motion, `?nogl` shows the fallback,
`?dpr=1` pins the render resolution.

## QA

- axe-core (WCAG 2.1 A/AA and best-practice) reports no violations on all 11 pages,
  at desktop (1440×900, reduced motion) and mobile (390×844).
- Screenshots were checked at desktop and mobile sizes, including RU, reduced
  motion, no-WebGL and a 375×667 phone.
