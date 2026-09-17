const CACHE = 'rutin-clean-v2-v43.12.3';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(key => key.startsWith('rutin-') && key !== CACHE)
          .map(key => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      try {
        return await fetch(event.request, { cache: 'no-store' });
      } catch (error) {
        const cached = await caches.match(event.request);

        if (cached) return cached;

        return new Response(
          'RUTİN şu anda ağ bağlantısına ulaşamıyor. İnternet bağlantısını kontrol edip tekrar deneyin.',
          {
            status: 503,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8'
            }
          }
        );
      }
    })()
  );
});
