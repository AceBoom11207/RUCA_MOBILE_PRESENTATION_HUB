(function () {
  "use strict";

  const PUBLIC_HUB_ORIGIN = "https://ruca-mobile-presentation-hub.vercel.app";
  let statusTimer = 0;

  function resolveShareUrl(target) {
    const resolved = new URL(target.dataset.shareTarget || ".", document.baseURI);

    if (window.location.hostname.endsWith(".vercel.app")) {
      return new URL(
        `${resolved.pathname}${resolved.search}${resolved.hash}`,
        PUBLIC_HUB_ORIGIN
      ).toString();
    }

    return resolved.toString();
  }

  function setStatus(message) {
    const status = document.getElementById("showroomActionStatus");
    if (!status) return;
    window.clearTimeout(statusTimer);
    status.textContent = message;
    statusTimer = window.setTimeout(() => {
      if (status.isConnected) status.textContent = "";
    }, 3200);
  }

  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    if (!copied) throw new Error("Copy is unavailable in this browser.");
  }

  async function shareHub(target) {
    const url = resolveShareUrl(target);
    if (navigator.share) {
      try {
        await navigator.share({
          title: "RUCA Mobile Presentation Hub",
          text: "Explore the RUCA product demo, portfolio, and resume.",
          url
        });
        setStatus("PRESENTATION HUB SHARED");
        return;
      } catch (error) {
        if (error && error.name === "AbortError") {
          setStatus("SHARE CLOSED");
          return;
        }
      }
    }

    await copyText(url);
    setStatus("LINK COPIED");
  }

  async function handleAction(event) {
    const target = event.target.closest("[data-showroom-action]");
    if (!target) return;
    event.preventDefault();

    try {
      if (target.dataset.showroomAction === "share") {
        await shareHub(target);
      } else if (target.dataset.showroomAction === "copy") {
        await copyText(resolveShareUrl(target));
        setStatus("LINK COPIED");
      }
    } catch (_) {
      setStatus("ACTION UNAVAILABLE");
    }
  }

  document.addEventListener("click", handleAction);
})();
