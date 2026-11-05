# Kenius — Bishkek website

Production: https://kenius.co/

The production website is published by Cloudflare Pages from the
`codex/kenius-bishkek` branch of `Ilsan2002/consulting`.

## Automatic deployment

Edit files in `bishkek-site/dist/`, commit, and push to `codex/kenius-bishkek`.
Cloudflare then publishes the new commit automatically.

Cloudflare Pages settings:
- Project: `kenius-bishkek`
- Repository: `Ilsan2002/consulting`
- Production branch: `codex/kenius-bishkek`
- Root directory: `bishkek-site`
- Framework preset: None
- Build command: empty
- Output directory: `dist`

No dependencies or build step are needed. All fonts and artwork are included.

The existing `kenius` Cloudflare project continues to serve `kenius.us`.
The ChatGPT Sites URL is a separate publication and does not follow GitHub.

## Preview

From this folder:

```sh
python3 -m http.server 8127 --directory dist
```

This export preserves the burgundy Bishkek design and Russian copy published
in ChatGPT Sites from source commit `8aff0d653d1044ec14acaaec3a0993e962cbc439`.
