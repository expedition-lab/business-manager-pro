// --- sw.js (replace everything with this) ---
const CACHE_NAME = 'bmp-v2';               // <-- bump version to bust old cache
const PRECACHE_URLS = ['/offline.html'];   // don't pre-cache "/" to avoid stale index

// Install: cache only the offline page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Fetch:
// - For navigations (page loads), try NETWORK FIRST so new index.html shows immediately.
// - For other requests, try CACHE FIRST then network.
// - On failure (offline), show offline.html for navigations.
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Optionally cache static assets
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Skip caching third-party SDKs or opaque responses if you want
          if (req.url.startsWith(self.location.origin)) {
            cache.put(req, resClone);
          }
        });
        return res;
      });
    })
  );
});
