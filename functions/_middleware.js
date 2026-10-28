// Temporary .us replacement; .co keeps the verified production snapshot.
// 29 October 2026, 01:20 Asia/Bishkek. Original Russian routes resume at expiry.
const TEMPORARY_UNTIL = Date.parse('2026-10-28T19:20:00Z');

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const isRU = url.hostname === 'kenius.us' || url.hostname === 'www.kenius.us';
  const isTemporaryHost = isRU || url.hostname === 'codex-ilsan-one-day.kenius.pages.dev';
  const path = url.pathname;

  if (isTemporaryHost && Date.now() < TEMPORARY_UNTIL) {
    const headers = {
      'Cache-Control': 'no-store',
      'X-Robots-Tag': isRU ? 'index, follow' : 'noindex, nofollow',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    };
    if (path === '/robots.txt') {
      const rules = isRU
        ? 'User-agent: *\nAllow: /\nSitemap: https://kenius.us/sitemap.xml\n'
        : 'User-agent: *\nDisallow: /\n';
      return new Response(request.method === 'HEAD' ? null : rules, {
        headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
    if (path === '/sitemap.xml') {
      const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
        + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        + '<url><loc>https://kenius.us/</loc><lastmod>2026-10-28</lastmod></url>'
        + '</urlset>\n';
      return new Response(request.method === 'HEAD' ? null : sitemap, {
        headers: { ...headers, 'Content-Type': 'application/xml; charset=utf-8' },
      });
    }
    url.pathname = '/_temporary/';
    url.search = '';
    const page = await env.ASSETS.fetch(new Request(url, request));
    const response = new Response(page.body, page);
    for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
    return response;
  }

  // The original production hostname router, restored automatically at expiry.
  if (path.startsWith('/assets/') || /\.[a-z0-9]+$/i.test(path)) return next();
  if (isRU) {
    if (path === '/ru' || path.startsWith('/ru/')) {
      const clean = path.replace(/^\/ru/, '') || '/';
      return Response.redirect(url.origin + clean + url.search, 301);
    }
    url.pathname = '/ru' + path;
    return env.ASSETS.fetch(new Request(url, request));
  }
  return next();
}
