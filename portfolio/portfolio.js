// The portfolio is the default entrance; explicit saved demo routes keep working.
(() => {
  'use strict';
  const location = window.location;
  const legacyDemoHashes = new Set([
    '#home', '#play', '#live', '#live-world', '#diagnostics', '#control'
  ]);
  if (location.pathname === '/' && legacyDemoHashes.has(location.hash.toLowerCase())) {
    // Preserve the query and hash, and avoid inserting an extra Back-button stop.
    location.replace('/index.html' + location.search + location.hash);
    return;
  }

  // Keep the portfolio and resume fresh for returning visitors.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js', { updateViaCache: 'none' })
        .then(registration => registration.update())
        .catch(() => { /* Offline support is optional; navigation does not depend on it. */ });
    });
  }
})();
