// Keep the public portfolio and its resume synchronized for returning visitors.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { updateViaCache: 'none' })
      .then(registration => registration.update())
      .catch(() => { /* The portfolio remains fully usable without offline caching. */ });
  });
}
