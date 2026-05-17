const APP_PATH = '/wcptvs/claudenowtries/';
const CONNECT_HTML = APP_PATH + 'connect.html';

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Serve connect.html for any same-origin /connect/ path, with COEP:unsafe-none
  if (url.pathname.includes('/connect/')) {
    event.respondWith(
      fetch(CONNECT_HTML).then((res) => {
        const h = new Headers(res.headers);
        h.set('Cross-Origin-Opener-Policy', 'same-origin');
        h.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
        h.set('Content-Type', 'text/html');
        return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
      })
    );
    return;
  }

  // All other same-origin requests: inject COOP+COEP
  event.respondWith(
    fetch(event.request).then((res) => {
      const h = new Headers(res.headers);
      h.set('Cross-Origin-Opener-Policy', 'same-origin');
      h.set('Cross-Origin-Embedder-Policy', 'require-corp');
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
    })
  );
});
