(function () {
  "use strict";

  const textReplacements = new Map([
    ["DEMO MODE", "PUBLIC PREVIEW"],
    ["LOCAL FIXTURES", "PRIVACY-SAFE SAMPLE DATA"],
    ["OFFLINE CHECKING", "PREVIEW LOADING"],
    ["OFFLINE READY", "OFFLINE-CAPABLE"],
    ["OFFLINE ACTIVE", "OFFLINE PREVIEW ACTIVE"],
    ["COMMAND CENTER // LOCAL DEMO", "COMMAND CENTER // PUBLIC PRODUCT PREVIEW"],
    ["DEMO SAMPLE", "PRODUCT PREVIEW"],
    ["PORTABLE SHOWROOM", "CASE STUDY ACCESS"],
    ["DEPLOYMENT BAY // SAFE PREVIEWS", "PLAY // COMMAND DISTRICTS"],
    ["Select a destination. Every action remains inside this demonstration.", "Select a destination to preview how RUCA organizes fragmented PC launch paths into clear command districts."],
    ["DEMO COMMAND REGISTRY // NO NATIVE TARGETS", "PUBLIC COMMAND REGISTRY // PRIVACY-SAFE PREVIEW"],
    ["LIVE WORLD // CACHED DEMONSTRATION", "LIVE WORLD // INFORMATION ARCHITECTURE PREVIEW"],
    ["Five deterministic realms, always available without a network.", "Five sample realms demonstrate how weather, markets, news, sports, and technology can share one consistent observation layer."],
    ["DEMO WEATHER FIXTURE", "SAMPLE WEATHER STATE"],
    ["DEMO MARKET FIXTURE", "SAMPLE MARKET STATE"],
    ["DEMO NEWS FIXTURE", "SAMPLE NEWS STATE"],
    ["DEMO SPORTS FIXTURE", "SAMPLE SPORTS STATE"],
    ["DEMO TECH FIXTURE", "SAMPLE TECH STATE"],
    ["GUARDIAN LAB // EDUCATIONAL DEMO", "GUARDIAN DIAGNOSTICS // PRODUCT PREVIEW"],
    ["Switch between two labeled demonstration states to see how Guardian explains machine health.", "Switch between sample states to see how RUCA translates machine health into meaning, risk, and next action."],
    ["DEMO STATE", "SAMPLE SYSTEM STATE"],
    ["COMMAND AUTHORITY // LOCAL ONLY", "CONTROL // PRIVACY-SAFE PREVIEW"],
    ["Every control previews immediately and persists only in this browser.", "These controls demonstrate how RUCA treats settings as a guided workshop instead of a dump of disconnected toggles."],
    ["Mobile demo controls", "Public preview controls"],
    ["No bridge, host, or system authority", "No private bridge, host commands, or live workstation access"],
    ["DEMO SAFE", "PRIVACY-SAFE"],
    ["SAVE LOCALLY", "SAVE PREVIEW"],
    ["RESET DEMO", "RESET PREVIEW"],
    ["COMMAND SEARCH // DEMO", "COMMAND SEARCH // PUBLIC PREVIEW"],
    ["SAFE COMMAND PREVIEW", "PRIVACY-SAFE COMMAND PREVIEW"],
    ["RUN DEMO SEQUENCE", "RUN PREVIEW SEQUENCE"],
    ["DEMO READY", "PREVIEW READY"],
    ["DEMO ONLY", "PREVIEW ONLY"]
  ]);

  const worldMessages = {
    home: {
      title: "What this first screen should prove",
      body: "RUCA uses one System Heart to communicate readiness, machine state, and the path into the rest of the experience before asking users to make decisions."
    },
    play: {
      title: "What PLAY demonstrates",
      body: "Games, media, creative tools, and system utilities are grouped into command districts so the user does not have to hunt across Windows, launchers, folders, and utilities."
    },
    live: {
      title: "What LIVE WORLD demonstrates",
      body: "External information becomes one observation layer with consistent navigation, state language, and hierarchy instead of scattered feeds competing for attention."
    },
    diagnostics: {
      title: "What HEALTH demonstrates",
      body: "Guardian diagnostics turn machine readings into plain-language meaning, risk, first checks, and next actions instead of making the user interpret raw sensor noise alone."
    },
    control: {
      title: "What CONTROL demonstrates",
      body: "Settings are treated as a guided workshop with immediate feedback, clear scope, and privacy-safe boundaries rather than a pile of unrelated toggles."
    }
  };

  let queued = false;

  function queueApply() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      applyRecruiterMode();
    });
  }

  function replaceExactText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const original = node.nodeValue;
      const trimmed = original.trim();
      if (!trimmed) return;

      if (textReplacements.has(trimmed)) {
        node.nodeValue = original.replace(trimmed, textReplacements.get(trimmed));
        return;
      }

      let next = original;
      textReplacements.forEach((replacement, target) => {
        next = next.replaceAll(target, replacement);
      });
      if (next !== original) node.nodeValue = next;
    });
  }

  function ensureIntro(surface) {
    if (!surface || document.body.dataset.route !== "home") return;
    if (surface.querySelector(".recruiter-intro")) return;

    const anchor = surface.querySelector(".home-reactor-stage");
    if (!anchor) return;

    const intro = document.createElement("section");
    intro.className = "recruiter-intro";
    intro.setAttribute("aria-label", "RUCA public preview explanation");
    intro.innerHTML = `
      <div>
        <span class="preview-kicker">Interactive product preview</span>
        <h2>Console clarity for PC power users.</h2>
        <p>RUCA Command Core is a controller-first operating environment concept for PC users. This public build demonstrates the product architecture, state language, navigation model, and privacy-safe interaction patterns without exposing the private desktop runtime.</p>
        <div class="preview-pill-row" aria-label="Preview boundaries">
          <span class="preview-pill">Case-study artifact</span>
          <span class="preview-pill">Privacy-safe shell</span>
          <span class="preview-pill">Sample data only</span>
        </div>
      </div>
      <ul class="preview-proof-list" aria-label="What to notice">
        <li><b>System-state storytelling</b><small>Readiness, risk, and next action are surfaced before complexity.</small></li>
        <li><b>Controller-aware navigation</b><small>The interface is organized as worlds and districts, not scattered utility pages.</small></li>
        <li><b>Guided diagnostics</b><small>Machine health is translated into plain-language guidance.</small></li>
      </ul>`;
    anchor.parentNode.insertBefore(intro, anchor);
  }

  function ensureWorldCallout(surface) {
    if (!surface) return;
    const route = document.body.dataset.route || "home";
    const message = worldMessages[route];
    if (!message) return;

    const world = surface.querySelector(".world");
    if (!world || world.querySelector(".what-this-proves")) return;

    const header = world.querySelector(".world-header");
    if (!header) return;

    const callout = document.createElement("aside");
    callout.className = "what-this-proves";
    callout.setAttribute("aria-label", message.title);
    callout.innerHTML = `<span>Reviewer cue</span><strong>${message.title}</strong><p>${message.body}</p>`;
    header.insertAdjacentElement("afterend", callout);
  }

  function patchCommandDialog() {
    const notice = document.getElementById("commandNotice");
    if (!notice || !notice.textContent.trim()) return;
    if (!notice.textContent.includes("PUBLIC PREVIEW") && !notice.textContent.includes("DEMO MODE")) return;
    notice.textContent = "PUBLIC PREVIEW - In the private desktop runtime, this command can hand off to RUCA host actions. This public build does not open apps, files, URLs, or native processes.";
  }

  function patchRail() {
    const badge = document.querySelector(".truth-rail .demo-badge");
    if (badge) badge.textContent = "PUBLIC PREVIEW";
    const connection = document.getElementById("connectionState");
    if (connection) connection.textContent = "PRIVACY-SAFE SAMPLE DATA";
    const offline = document.getElementById("offlineState");
    if (offline && /OFFLINE|CHECKING|INSTALL/.test(offline.textContent)) offline.textContent = "OFFLINE-CAPABLE";
  }

  function applyRecruiterMode() {
    const surface = document.getElementById("appSurface");
    replaceExactText(document.body);
    patchRail();
    ensureIntro(surface);
    ensureWorldCallout(surface);
    patchCommandDialog();
  }

  document.addEventListener("click", () => window.setTimeout(queueApply, 0), true);
  window.addEventListener("hashchange", queueApply);
  window.addEventListener("online", queueApply);
  window.addEventListener("offline", queueApply);

  const observer = new MutationObserver(queueApply);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", queueApply, { once: true });
  } else {
    queueApply();
  }
})();
