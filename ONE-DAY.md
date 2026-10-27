# One-day contact page for kenius.us

Branch: `codex/ilsan-one-day` in `Ilsan2002/consulting`.

The temporary Russian page shows **Илсан Кенжебаев** and the requested placeholder
phone **+996 123 123 123**. It contains no biography, form, analytics, external fonts
or scripts. The number is plain text.

## Build

```sh
npm run build
```

The build uses Node.js built-ins and needs no dependency installation. `dist/`
contains the verified original production snapshot plus `/_temporary/index.html`.
The Pages Function in `functions/_middleware.js` switches only `kenius.us` and
`www.kenius.us` to the temporary page. `kenius.co` and `www.kenius.co` retain the
English site because all four domains share the `kenius` Pages project.

For a local static preview, run `python3 -m http.server 8000 --directory dist`
and open http://localhost:8000/_temporary/. Production hostname routing requires
Pages Functions. The retained Astro dev scripts describe the earlier site.

## Automatic return

The temporary hostname rule expires at **29 October 2026, 01:20 Asia/Bishkek**
(`2026-10-28T19:20:00Z`). At and after that instant, the Function serves the original
Russian pages using the original hostname router. This runs on each request, so
no computer, reminder or scheduled deployment needs to be running at expiry.
Temporary responses use `Cache-Control: no-store` and `X-Robots-Tag: noindex,
nofollow, noarchive`. English responses retain the original behavior.

## Deployment and immediate rollback

Cloudflare account: `f11c71907365440b1cc6e8165c9d18f7`.
Pages project: `kenius`. Its production branch setting is `main`.
Original production deployment: `81564274-30cf-42c0-90c0-bd07e98c7e65`.
Original immutable URL: https://81564274.kenius.pages.dev.

Preview:

```sh
npx wrangler pages deploy dist --project-name kenius --branch codex/ilsan-one-day
```

Production promotion uses the exact built branch contents while supplying
`--branch main` to Wrangler. This selects the Pages production environment;
it does not merge, push or modify the GitHub `main` branch.

To return early, use Cloudflare Pages > kenius > Deployments > the recorded original
production deployment > Rollback to this deployment. Do not delete that deployment.
The expiry changes site behavior automatically even without an early rollback.

## Verification — 28 October 2026

The original snapshot's five English pages matched live visible text, and the
checked CSS, JavaScript and Cyrillic font matched live bytes. The contact page
passed desktop, 390px and 320px rendering checks with JavaScript disabled; desktop
and mobile screenshots were visually reviewed. Axe reported zero accessibility
violations. Hostname checks covered .us, www, .co and preview hosts. Time simulation
confirmed the original Russian homepage and routes resume exactly at expiry.

## Design

A quiet typographic calling card: warm paper background, oversized serif name,
thin divider and a readable phone number. Generous empty space is deliberate.
Design review found no issues with hierarchy, spacing, contrast or mobile fit;
distinctiveness 3/5. Decoration would work against the requested near-blank page.

The branch starts from `dbd7cd2b6b7e8ecdd854851ee3511c7445a1bc5d`
(`claude/loving-ramanujan-5q2cjk`). Original code remains in Git history.
