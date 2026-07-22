(function () {
  "use strict";

  const replacements = new Map([
    ["COMMAND CENTER // LOCAL DEMO", "COMMAND CENTER // PUBLIC PRODUCT PREVIEW"],
    ["All demonstration systems are inside their healthy operating range. No workstation telemetry is read or exposed.", "This privacy-safe product state demonstrates how RUCA communicates readiness without exposing private workstation telemetry."],
    ["PORTABLE SHOWROOM", "PRODUCT STORY"],
    ["The product and the work behind it.", "The system, the decisions, and the work behind them."],
    ["Explore the RUCA case study and privacy-safe public resume without leaving this installed app.", "Explore the full case study and application resume behind this public product preview."],
    ["DEPLOYMENT BAY // SAFE PREVIEWS", "PLAY // COMMAND DISTRICTS"],
    ["Select a destination. Every action remains inside this demonstration.", "RUCA organizes fragmented PC launch paths into one consistent command language."],
    ["LIVE WORLD // CACHED DEMONSTRATION", "LIVE WORLD // ONE OBSERVATION LAYER"],
    ["Five deterministic realms, always available without a network.", "Weather, markets, news, sports, and technology share one hierarchy instead of competing for attention across separate apps."],
    ["GUARDIAN LAB // EDUCATIONAL DEMO", "DIAGNOSTICS // GUARDIAN"],
    ["Switch between two labeled demonstration states to see how Guardian explains machine health.", "Guardian translates system readings into severity, meaning, first checks, and next action before exposing raw detail."],
    ["COMMAND AUTHORITY // LOCAL ONLY", "CONTROL // WORKSHOP"],
    ["Every control previews immediately and persists only in this browser.", "Every control changes something visible in this public preview and remains scoped to this browser."],
    ["Mobile demo controls", "Preview controls"],
    ["No bridge, host, or system authority", "Public build: no private bridge, host commands, or workstation access"],
    ["SAVE LOCALLY", "SAVE PREVIEW"],
    ["RESET DEMO", "RESET PREVIEW"],
    ["DEMO READY", "AVAILABLE"],
    ["DEMO ONLY", "PREVIEW"],
    ["DEMO SAFE", "PUBLIC BUILD"],
    ["DEMO STATE", "SYSTEM STATE"],
    ["DEMO WEATHER FIXTURE", "WEATHER"],
    ["DEMO MARKET FIXTURE", "MARKETS"],
    ["DEMO NEWS FIXTURE", "NEWS"],
    ["DEMO SPORTS FIXTURE", "SPORTS"],
    ["DEMO TECH FIXTURE", "TECH"],
    ["DEMO COMMAND REGISTRY // NO NATIVE TARGETS", "ONE COMMAND REGISTRY // PUBLIC PREVIEW"],
    ["COMMAND SEARCH // DEMO", "COMMAND SEARCH"],
    ["SAFE COMMAND PREVIEW", "COMMAND HANDOFF PREVIEW"],
    ["RUN DEMO SEQUENCE", "PREVIEW HANDOFF"],
    ["DEMO MODE - This command would launch", "In the private RUCA runtime, this command can launch"],
    ["DEMO SEQUENCE // Preparing", "HANDOFF PREVIEW // Preparing"],
    ["DEMO COMPLETE // Safe handoff preview confirmed. Nothing was launched.", "HANDOFF PREVIEW COMPLETE // The public build does not open native applications."],
    ["DEMO THEME APPLIED", "THEME APPLIED"],
    ["DEMO SETTINGS SAVED ON THIS DEVICE", "PREVIEW SETTINGS SAVED ON THIS DEVICE"],
    ["DEMO SETTINGS RESET", "PREVIEW SETTINGS RESET"]
  ]);

  const routeIntent = {
    play: {
      kicker: "Why this world exists",
      title: "The user should choose an intention, not remember which launcher owns it.",
      body: "PLAY groups games, media, creative tools, and system actions into durable command districts. The product absorbs the fragmentation instead of asking the user to memorize it."
    },
    live: {
      kicker: "Why this world exists",
      title: "Information should arrive like a concierge, not a pile of competing feeds.",
      body: "LIVE WORLD gives weather, markets, news, sports, and technology one shared navigation model, one hierarchy, and explicit states when information is unavailable."
    },
    diagnostics: {
      kicker: "Why this world exists",
      title: "Telemetry is not guidance until the machine explains what it means.",
      body: "Guardian leads with meaning, risk, reassurance, and next action. Experienced users can still drill into raw readings, but nobody is forced to interpret a wall of sensor noise alone."
    },
    control: {
      kicker: "Why this world exists",
      title: "A setting earns its place only when it changes something the user can see or feel.",
      body: "CONTROL is a workshop, not a storage closet for toggles. Appearance, motion, input, and source behavior stay grouped by consequence and scope."
    }
  };

  let queued = false;

  function queueApply() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      applyPublicReviewMode();
    });
  }

  function replaceText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const original = node.nodeValue;
      const trimmed = original.trim();
      if (!trimmed) return;

      if (replacements.has(trimmed)) {
        node.nodeValue = original.replace(trimmed, replacements.get(trimmed));
        return;
      }

      let next = original;
      replacements.forEach((replacement, target) => {
        next = next.replaceAll(target, replacement);
      });
      if (next !== original) node.nodeValue = next;
    });
  }

  function removeScaffolding() {
    document.querySelectorAll(".truth-rail, .fixture-label, .command-status").forEach((element) => {
      element.setAttribute("aria-hidden", "true");
    });
  }

  function ensureHomeIntro(surface) {
    if (!surface || document.body.dataset.route !== "home") return;
    if (surface.querySelector(".product-intro")) return;

    const home = surface.querySelector(".home-world");
    const readiness = surface.querySelector(".home-readiness");
    if (!home || !readiness) return;

    const intro = document.createElement("section");
    intro.className = "product-intro";
    intro.setAttribute("aria-label", "RUCA product concept");
    intro.innerHTML = `
      <div class="product-intro-copy">
        <span class="preview-kicker">The missing arrival ritual</span>
        <h2>The PC gained power and lost the feeling of coming home.</h2>
        <p>RUCA restores the confidence of a console startup without hiding the truth of the PC underneath. One welcome. One readiness state. One controller-first path into play, information, diagnostics, and control.</p>
      </div>
      <div class="product-intro-aside" aria-label="Product commitments">
        <div><strong>Immediate orientation</strong><span>The user knows where they are and whether the machine is ready.</span></div>
        <div><strong>Progressive complexity</strong><span>Meaning comes first. Raw system depth remains available underneath.</span></div>
        <div><strong>Truthful boundaries</strong><span>This public build uses sample states and never exposes private workstation access.</span></div>
      </div>`;

    home.insertBefore(intro, readiness);
  }

  function ensureRouteIntent(surface) {
    if (!surface) return;
    const route = document.body.dataset.route || "home";
    const content = routeIntent[route];
    if (!content) return;

    const world = surface.querySelector(".world");
    const header = world && world.querySelector(".world-header");
    if (!world || !header || world.querySelector(".route-intent")) return;

    const intent = document.createElement("section");
    intent.className = "route-intent";
    intent.innerHTML = `<span class="preview-kicker">${content.kicker}</span><strong>${content.title}</strong><p>${content.body}</p>`;
    header.insertAdjacentElement("afterend", intent);
  }

  function patchCommandDialog() {
    const notice = document.getElementById("commandNotice");
    if (!notice || !notice.textContent.trim()) return;
    notice.textContent = "In the private RUCA runtime, this command can hand off to native workstation actions. This public product preview does not open apps, files, URLs, or system processes.";
  }

  function applyPublicReviewMode() {
    const surface = document.getElementById("appSurface");
    replaceText(document.body);
    removeScaffolding();
    ensureHomeIntro(surface);
    ensureRouteIntent(surface);
    patchCommandDialog();
  }

  document.addEventListener("click", () => setTimeout(queueApply, 0), true);
  window.addEventListener("hashchange", queueApply);

  const observer = new MutationObserver(queueApply);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", queueApply, { once: true });
  } else {
    queueApply();
  }
})();