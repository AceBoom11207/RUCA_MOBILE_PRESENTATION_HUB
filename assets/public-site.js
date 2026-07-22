(function () {
  "use strict";

  const menu = document.querySelector(".mobile-menu");

  if (menu) {
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) menu.removeAttribute("open");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") menu.removeAttribute("open");
    });
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js", { scope: "/" })
        .then((registration) => registration.update())
        .catch(() => {
          // The product story remains fully usable when offline support is unavailable.
        });
    });
  }
})();
