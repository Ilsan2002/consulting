/* Hostname language router for Kenius.
   kenius.us (+ www) -> Russian site, served transparently from /ru/*.
   Everything else (kenius.co, preview *.pages.dev) -> English at the root.
   Shared assets (/assets/*) and any file with an extension pass through on
   every host, so both languages share one set of CSS/JS/images/fonts.
   The Russian pages live physically at /ru/* and stay directly reachable
   (e.g. on a preview URL) for review. */
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const host = (request.headers.get('host') || '').toLowerCase();
  const path = url.pathname;

  // assets + real files: identical on every host
  if (path.startsWith('/assets/') || /\.[a-z0-9]+$/i.test(path)) {
    return next();
  }

  const isRU = host === 'kenius.us' || host === 'www.kenius.us';

  if (isRU) {
    // On the Russian host the /ru prefix is internal — keep URLs clean.
    if (path === '/ru' || path.startsWith('/ru/')) {
      const clean = path.replace(/^\/ru/, '') || '/';
      return Response.redirect(url.origin + clean + url.search, 301);
    }
    // Serve the Russian document for this route (ASSETS resolves clean URLs).
    const ru = new URL(url);
    ru.pathname = '/ru' + path; // "/" -> "/ru/", "/services" -> "/ru/services"
    return env.ASSETS.fetch(new Request(ru, request));
  }

  // English host / previews: serve as-is. /ru/* remains reachable for review.
  return next();
}
