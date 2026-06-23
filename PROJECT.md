# PROJECT.md — Kenius

The full picture of this project: the **business** the site portrays, the
**website** itself, and where things **stand**. Written to travel with the
code so a collaborator (or future you) can pick it up cold.

- **Run & deploy:** see [`README.md`](./README.md)
- **Design system:** see [`DESIGN.md`](./DESIGN.md)
- **Live:** <https://kenius.us>

---

## The business: Kenius

### What it is

Kenius (kenius.us) is an **AI consultancy + custom development studio** for
small-to-mid-sized businesses. The through-line: *"We find where AI actually
fits — then build it."*

It's deliberately framed as a **consultancy, not a product company** — advise
first, then build a bespoke solution and hand it over. No platform to buy, no
lock-in; the client owns what we build.

### Brand & voice

- **Name** plays on "Kenzhebaev." The mark is a small **amber north star**
  (an inline SVG, also the favicon).
- **Voice** is warm, plain-English, gently opinionated, and anti-hype — it
  will even *say "don't" when AI isn't the answer.*

### What it sells (services)

Strategy leads; custom build follows. Detailed on `services.html`.

1. **AI strategy & consulting** — the lead. Assess workflows → ranked
   opportunities → a costed roadmap.
2. **Custom AI agents & automation**
3. **Conversational & voice AI** — chat + phone (LLM + speech-to-text +
   text-to-speech).
4. **Document & process automation**
5. **Custom copilots & knowledge** — trained on the client's own data.
6. **Integration & data engineering**

### How clients engage

Three ways to start (`services.html`), most begin at the top:

1. **Assessment & roadmap** — fixed-fee entry.
2. **Build a pilot** — fixed-fee, one use case.
3. **Build, run & support** — or embed with their team.

### Who it targets (industry "playbooks")

Five named playbooks on `work.html`, each with **pain → what we'd build →
outcome**:

- Property management
- Real estate brokerages
- Law firms
- Accounting / CPA firms
- Home-services trades (HVAC / plumbing / roofing)

Plus a "we adapt" list: clinics, restaurants, e-commerce, salons/fitness,
auto, insurance, recruiting.

### Selling points

Strategy-first · custom (not off-the-shelf) · fixed-fee pilots · your data
stays yours · human-in-the-loop · works with the tools you already use ·
everything logged & reversible · built to hand over.

> ⚠️ **Placeholders:** all client names, logos, testimonials and metrics are
> **illustrative**. They show the *kind* of work and must be swapped for real
> ones before the site is marketed hard.

---

## The website

A static marketing site — **5 pages**, hand-built, no framework or build step.

| Page | File | What's on it |
|---|---|---|
| **Home** | `index.html` | Hero with an animated "example build" diagram · trust pills · "why now" · 6 service cards (consulting-led) · example-builds band · **interactive demo** (chat / phone / back-office tabs) · 4-step process · recent-outcome cards · "find your industry" grid → playbooks · "a consultancy, not a vendor" · stats · testimonials · FAQ · CTA |
| **Services** | `services.html` | The 6 services in depth + the 3 engagement models |
| **Work** | `work.html` | 5 industry playbooks, each with a custom **animated flow visual** (request flows in → AI → outcomes out; amber pulses travel the pipes) |
| **About** | `about.html` | Story · six values · team (placeholder people) |
| **Contact** | `contact.html` | Working form · "what happens next" · contact details |

### Design system

Intentionally *not* "AI slop." Fully documented in [`DESIGN.md`](./DESIGN.md);
in brief:

- **Color** — warm paper `#FBF8F2` + warm near-black ink `#16130D` + **one
  amber accent** `#E5862F` (actions/links/status only) + one muted pine green
  for tiny data bits. No blue/purple gradients, no pure black.
- **Type** — Fraunces (display serif) + Hanken Grotesk (body) + Space Mono
  (labels). Deliberately *not* Inter.
- **Custom visuals only** — no stock photos. The hero diagram, the demo
  widget, and the per-industry flow animations are all hand-built SVG/CSS.
- **Motion & a11y** — subtle eased motion; respects `prefers-reduced-motion`;
  works without JS; semantic, keyboard-accessible, AA-minded contrast.

### Tech & hosting

- **Static site** — hand-written HTML, one CSS token file
  (`assets/css/styles.css`), and vanilla JS (`assets/js/main.js`). **No
  framework, no build step, zero dependencies.**
- **Repo** — `Ilsan2002/consulting`: `main` (production) + a working branch,
  full commit history.
- **Hosting** — **Cloudflare Pages**, **auto-deploys from `main`** on every
  push. Live on **kenius.us** + www, proxied through Cloudflare, HTTPS
  automatic. The `_headers` file sets caching + basic security headers.
- **Contact form** — [Web3Forms](https://web3forms.com) (free) with AJAX
  submit, an in-line success panel, and a spam honeypot.
- **Extras** — `serve.sh` (local preview), `README.md` (run/deploy/customize),
  `_headers`.

---

## Status & open items

- ✅ **Live** at <https://kenius.us> — versioned, deployed, rollback-able.
- ⏳ **Test the contact form** from a phone/laptop to confirm submissions land
  in the destination inbox (couldn't be tested from the build server's IP).
- ⏳ *(Optional)* set up **hello@kenius.us forwarding** to your personal inbox
  via Cloudflare Email Routing (needs the dashboard wizard + the verify-email
  click).
- ⏳ Swap the **illustrative names / logos / metrics** for real ones once you
  have them (see the placeholder warning above).
- 🔒 **Security:** if the **Cloudflare API token** created during setup is
  still valid and not set to expire, **delete or roll it** (My Profile → API
  Tokens) now that setup is done.
