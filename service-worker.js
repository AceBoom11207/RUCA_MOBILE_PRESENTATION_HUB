const CACHE_NAME = "ruca-os-public-portfolio-alignment-20260909";
const CORE_ASSETS = [
  "/", "/index.html",
  "/css/ruca.css?v=20260722-source-clone-r14",
  "/js/ruca-public-fixtures.js?v=20260722-source-clone-r14",
  "/js/ruca-source-shell.js?v=20260722-source-clone-r14",
  "/js/ruca-public-demo.js?v=20260722-source-clone-r14",
  "/assets/RucaLogo.png", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png",
  "/assets/realms/weather.png", "/assets/realms/news.png", "/assets/realms/sports.png", "/assets/realms/signal.png", "/assets/realms/celestial.png",
  "/assets/news/news-1.jpg", "/assets/news/news-2.jpg", "/assets/news/news-3.jpg", "/assets/news/news-4.jpg", "/assets/news/news-5.jpg",
  "/portfolio/", "/portfolio/ruca-os/", "/portfolio/ruca-mobile/",
  "/portfolio/la-cosa-nostra/", "/portfolio/gourmet-glatt/",
  "/portfolio/portfolio.css?v=portfolio-alignment-20260909",
  "/portfolio/portfolio.js?v=portfolio-alignment-20260909",
  "/resume/Anthony_Moncion_Interaction_Designer_Public_Resume.pdf"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME && /^ruca/i.test(key)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("message", event => { if (event.data === "SKIP_WAITING") self.skipWaiting(); });
async function store(request, response) {
  if (!response || !response.ok || response.type !== "basic") return response;
  try { const cache = await caches.open(CACHE_NAME); await cache.put(request, response.clone()); } catch (_) { /* Storage is optional. */ }
  return response;
}
async function networkFirst(request) {
  try { return await store(request, await fetch(request, { cache: "no-store" })); }
  catch (_) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    // Never replace a missing portfolio or resume with the unrelated product demo.
    return new Response("This page is not available offline. Reconnect to load the current version.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  return cached || store(request, await fetch(request));
}
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const networkDestinations = new Set(["document", "style", "script", "worker"]);
  // Resume downloads must never remain on an old cache-first version.
  if (url.pathname.startsWith("/resume/") || request.mode === "navigate" || networkDestinations.has(request.destination)) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});
