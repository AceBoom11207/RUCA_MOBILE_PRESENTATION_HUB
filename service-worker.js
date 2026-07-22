"use strict";

const CACHE_PREFIX = "ruca-mobile-demo-";
const CACHE_NAME = "ruca-mobile-demo-v1-20260722-product-showcase-r1";
const CORE_ASSETS = [
  "./index.html",
  "./assets/product-showcase.css?v=showcase-r1",
  "./assets/ruca-logo.png",
  "./icons/icon-192.png",
  "./portfolio/",
  "./portfolio/index.html",
  "./portfolio/portfolio.css?v=portfolio-r3",
  "./portfolio/assets/ruca-public-hero.svg",
  "./portfolio/assets/02-play-command-districts.jpg",
  "./portfolio/assets/03-live-world-concierge.png",
  "./portfolio/assets/04-diagnostics-guardian-public.svg",
  "./portfolio/assets/05-control-workshop.png",
  "./resume/Anthony_Moncion_Interaction_Designer_Public_Resume.pdf"
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
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const requestUrl = new URL(request.url);
  const scopeUrl = new URL(self.registration.scope);
  if (requestUrl.origin !== scopeUrl.origin || !requestUrl.pathname.startsWith(scopeUrl.pathname)) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || !response.ok || response.type !== "basic") return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html")))
  );
});