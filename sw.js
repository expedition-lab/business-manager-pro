self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('bmp-v1').then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/offline.html'
    ]))
  );
});
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => caches.match('/offline.html'));
    })
  );
});