"use strict";

const CACHE_PREFIX = "ruca-mobile-demo-";
const CACHE_NAME = "ruca-mobile-demo-v1-20260721-public-contact-r4";
const CORE_ASSETS = [
  "./index.html",
  "./manifest.webmanifest",
  "./assets/demo.css?v=pass22-r1",
  "./assets/demo.js?v=pass22-r2",
  "./assets/showroom-actions.js?v=privacy-r3",
  "./assets/ruca-logo.png",
  "./data/demo-data.js?v=pass22-r1",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./portfolio/",
  "./portfolio/index.html",
  "./portfolio/portfolio.css?v=portfolio-r2",
  "./portfolio/PORTFOLIO_CASE_STUDY.md",
  "./portfolio/RESUME_PROJECT_ENTRY.md",
  "./portfolio/assets/ruca-public-hero.svg",
  "./portfolio/assets/02-play-command-districts.jpg",
  "./portfolio/assets/03-live-world-concierge.png",
  "./portfolio/assets/04-diagnostics-guardian-public.svg",
  "./portfolio/assets/05-control-workshop.png",
  "./portfolio/assets/anthony-moncion-ruca-social-card.png",
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
  const insideDemoScope = requestUrl.origin === scopeUrl.origin && requestUrl.pathname.startsWith(scopeUrl.pathname);
  if (!insideDemoScope) return;

  if (request.mode === "navigate") {
    const portfolioUrl = new URL("./portfolio/", scopeUrl);
    const demoUrl = new URL("./index.html", scopeUrl);
    const fallback = requestUrl.pathname === demoUrl.pathname
      ? "./index.html"
      : "./portfolio/index.html";
    event.respondWith(
      fetch(request)
        .then((response) => response.ok ? response : Promise.reject(new Error("navigation unavailable")))
        .catch(() => caches.match(request).then((cached) => cached || caches.match(fallback)))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (!response || !response.ok || response.type !== "basic") return response;
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return response;
    }))
  );
});
