// Refresh previously installed RUCA caches through the same registered worker URL.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        if (registration.active?.scriptURL === `${location.origin}/service-worker.js`) registration.update();
      }
    }).catch(() => {});
  });
}
