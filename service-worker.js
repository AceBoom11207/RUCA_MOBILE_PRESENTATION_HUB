"use strict";

const CACHE_PREFIXES = ["ruca-mobile-demo-", "ruca-public-"];
const CACHE_NAME = "ruca-public-v3-20260722-guided-tour-r2";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/assets/ruca-public.css?v=20260722-tour-r2",
  "/assets/public-site.js?v=20260722-tour-r2",
  "/assets/ruca-logo.png",
  "/assets/product/ruca-home-runtime.png",
  "/assets/product/ruca-play-runtime.png",
  "/assets/product/ruca-live-world-runtime.png",
  "/assets/product/ruca-diagnostics-runtime.png",
  "/assets/product/ruca-control-runtime.png",
  "/icons/icon-192.png",
  "/portfolio/",
  "/portfolio/index.html",
  "/portfolio/portfolio.css?v=portfolio-red-r4",
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
      .then((keys) => Promise.all(
        keys
          .filter((key) => CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function cacheResponse(request, response) {
  if (!response || !response.ok || response.type !== "basic") return response;
  const copy = response.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  return response;
}

async function networkFirst(request) {
  try {
    return cacheResponse(request, await fetch(request));
  } catch (_) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") return caches.match("/index.html");
    throw _;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  return cacheResponse(request, await fetch(request));
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  const networkFirstDestinations = new Set(["document", "style", "script", "worker"]);
  if (request.mode === "navigate" || networkFirstDestinations.has(request.destination)) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
