// Retire historical demo caches so returning visitors receive the current release.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => /^ruca/i.test(key)).map(key => caches.delete(key)));
    await self.clients.claim();
    await self.registration.unregister();
  })());
});
