// .us contact page stays live until the user requests restoration.
// .co keeps the verified production snapshot.

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const isRU = url.hostname === 'kenius.us' || url.hostname === 'www.kenius.us';
  const isTemporaryHost = isRU || url.hostname === 'codex-ilsan-one-day.kenius.pages.dev';
  const path = url.pathname;

  if (isTemporaryHost) {
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

  return next();
}
