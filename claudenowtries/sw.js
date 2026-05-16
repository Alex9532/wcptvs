self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only inject headers on same-origin requests. Cross-origin fetches
  // (fonts, CDN modules, etc.) return opaque responses with status 0,
  // which can't be reconstructed — so we let them pass through untouched.
  if (url.origin !== self.location.origin) {
    return;
  }

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
});
