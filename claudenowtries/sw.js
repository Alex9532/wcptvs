self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Serve connect.html for any /connect/* path so WebContainer's
  // browser-connect flow works on GitHub Pages (no server-side redirects).
  if (url.pathname.startsWith('/webcontainer/connect/') || url.pathname.includes('/webcontainer/connect/')) {
    event.respondWith(
      fetch('/wcptvs/claudenowtries/connect.html').then((response) => {
        const headers = new Headers(response.headers);
        headers.set('Cross-Origin-Opener-Policy', 'same-origin');
        headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
        headers.set('Content-Type', 'text/html');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      })
    );
    return;
  }

  if (url.origin === self.location.origin) {
    // Same-origin: inject COOP + COEP so the page stays cross-origin isolated
    event.respondWith(
      fetch(event.request).then((response) => {
        const headers = new Headers(response.headers);
        headers.set('Cross-Origin-Opener-Policy', 'same-origin');
        headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      })
    );
  } else {
    // Cross-origin: add Cross-Origin-Resource-Policy so COEP doesn't block it.
    // Without this, any cross-origin fetch (GitHub Releases, npm registry, etc.)
    // is blocked by the browser because require-corp is active.
    event.respondWith(
      fetch(event.request, { credentials: 'omit' }).then((response) => {
        // Only reconstruct if we got a real response (not opaque status 0)
        if (!response.ok && response.type === 'opaque') return response;
        const headers = new Headers(response.headers);
        headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }).catch(() => fetch(event.request))
    );
  }
});
