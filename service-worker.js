const CACHE_NAME = "ruca-os-public-source-clone-r10-20260722";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/css/ruca.css?v=20260722-source-clone-r10",
  "/js/ruca-public-fixtures.js?v=20260722-source-clone-r10",
  "/js/ruca-source-shell.js?v=20260722-source-clone-r10",
  "/js/ruca-public-demo.js?v=20260722-source-clone-r10",
  "/assets/RucaLogo.png",
  "/assets/realms/weather.png",
  "/assets/realms/news.png",
  "/assets/realms/sports.png",
  "/assets/realms/signal.png",
  "/assets/realms/celestial.png",
  "/assets/news/news-1.jpg",
  "/assets/news/news-2.jpg",
  "/assets/news/news-3.jpg",
  "/assets/news/news-4.jpg",
  "/assets/news/news-5.jpg",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/portfolio/",
  "/resume/Anthony_Moncion_Interaction_Designer_Public_Resume.pdf"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function store(request, response) {
  if (!response || !response.ok || response.type !== "basic") return response;
  const copy = response.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  return response;
}

async function networkFirst(request) {
  try {
    return store(request, await fetch(request, { cache: "no-store" }));
  } catch (error) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === "navigate") return caches.match("/index.html");
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;
  return store(request, await fetch(request));
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const networkFirstDestinations = new Set(["document", "style", "script", "worker"]);
  if (request.mode === "navigate" || networkFirstDestinations.has(request.destination)) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
