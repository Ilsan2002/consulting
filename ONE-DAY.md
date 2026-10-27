# Temporary contact page

Branch: `codex/ilsan-one-day` in `Ilsan2002/consulting`.

The Russian page shows **Илсан Кенжебаев** and the requested placeholder phone
**+996 123 123 123**. The number is plain text. No biography, form, analytics,
external fonts, or scripts are included.

## Build and preview

```sh
npm run build
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. The build uses Node.js built-ins and needs no
dependency installation. Deploy **`dist/`**, which contains only the temporary
page, a matching 404 page, robots.txt and Cloudflare headers. The remaining
consultancy files in the repository are excluded. The original Astro development
scripts describe the retained original site; use the commands above for this page.

## One-day deployment and return

This branch prepares the page. Creating it does not change the production domain
or arrange an automatic return.

1. In Cloudflare, identify the Pages project serving `kenius.us` and record its
   current production deployment. Check whether `kenius.co` shares that project
   before replacing production, so the English domain is not changed accidentally.
2. Use this branch, build command `npm run build`, output directory `dist`.
   Review a preview deployment before promoting it to the intended domain.
3. After the agreed one-day window, roll back to the recorded production
   deployment. No merge into the original branch or DNS change is required.

The page has `noindex` metadata, and the deployment sends `no-store` headers to
avoid retaining this short-lived version in caches.

## Design

Purpose: a temporary personal contact page for visitors to the domain.
Direction: a quiet typographic calling card with a warm paper background,
an oversized serif name, a thin divider and a readable phone number. The deliberate
choice is generous empty space. No animation or decorative imagery is needed.

The branch starts from `dbd7cd2b6b7e8ecdd854851ee3511c7445a1bc5d`
(`claude/loving-ramanujan-5q2cjk`). Its original code remains in Git history.

## Verification — 28 October 2026

The build passed. Headless Chrome was checked at 1440, 390 and 320 pixel widths:
the Cyrillic name and phone are correct, there is no horizontal overflow, and the
page works with JavaScript disabled. Desktop and mobile screenshots were visually
reviewed. Axe reported zero accessibility violations. The output contains exactly
the four intended files.

Design review: no findings for this deliberately minimal contact page; hierarchy,
spacing, contrast and small-screen fit checked. Distinctiveness: 3/5. The restrained
serif name is the focal point; adding decoration would work against the requested
near-blank page.
