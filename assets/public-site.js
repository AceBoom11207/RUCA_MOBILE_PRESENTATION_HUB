(function () {
  "use strict";

  const worlds = {
    home: {
      hash: "home",
      index: "01",
      label: "HOME",
      title: "WELCOME HOME.",
      question: "AM I READY?",
      capture: "HOME // ARRIVAL AND READINESS",
      image: "/assets/product/ruca-home-runtime.png",
      alt: "RUCA HOME centered on a large System Heart connected to six machine gauges",
      summary: "The System Heart turns machine state into one immediate readiness signal while the visible instruments preserve the truth underneath.",
      features: [
        { title: "SYSTEM HEART", description: "One dominant center carries the emotional and informational weight of HOME.", marker: [50, 55], frame: [39, 35, 22, 43] },
        { title: "SWISS-WATCH GAUGES", description: "Concentric rings, restrained ticks, and physical depth make each machine signal feel instrument-grade.", marker: [25, 41], frame: [18, 29, 17, 22] },
        { title: "ENERGY CONDUITS", description: "Six illuminated paths make the System Heart the unmistakable source of readiness.", marker: [36, 56], frame: [27, 50, 18, 11] },
        { title: "INTELLIGENCE RIBBON", description: "Top-level conditions stay visible above the active world without competing with it.", marker: [50, 13], frame: [1.5, 8, 97, 9] },
        { title: "COMMAND SHELL", description: "Persistent status and audio control anchor every route to the same machine.", marker: [50, 95], frame: [1, 92, 98, 7] },
        { title: "LAYERED COCKPIT", description: "Black glass, gunmetal framing, disciplined red light, and distance-readable type create machine presence without rainbow noise.", marker: [51, 25], frame: [16, 16, 68, 67] }
      ]
    },
    play: {
      hash: "play",
      index: "02",
      label: "PLAY",
      title: "COMMAND DISTRICTS.",
      question: "WHAT DO I LAUNCH?",
      capture: "PLAY // COMMAND REGISTRY",
      image: "/assets/product/ruca-play-runtime.png",
      alt: "RUCA PLAY with command districts, a spatial registry, and a selected center command",
      summary: "PLAY replaces scattered launchers with one spatial destination model. This tour demonstrates selection and hierarchy only; it cannot launch software.",
      features: [
        { title: "COMMAND DISTRICTS", description: "Commands are grouped by user intent, so the user chooses a destination before choosing a tool.", marker: [17, 49], frame: [3, 24, 27, 51] },
        { title: "SELECTED CENTER", description: "One command owns the visual center, current focus, and supporting information at a time.", marker: [50, 55], frame: [39, 37, 22, 35] },
        { title: "SPATIAL REGISTRY", description: "The orbital registry preserves neighboring options without turning the screen into a grid of launcher tiles.", marker: [66, 55], frame: [31, 20, 47, 64] },
        { title: "VISIBLE FOCUS", description: "Illumination, position, and scale make the current selection recoverable at couch distance.", marker: [50, 30], frame: [43, 24, 15, 13] }
      ]
    },
    live: {
      hash: "live-world",
      index: "03",
      label: "LIVE WORLD",
      title: "WORLD BRIEFING.",
      question: "WHAT IS HAPPENING?",
      capture: "LIVE WORLD // OBSERVATION ENVIRONMENT",
      image: "/assets/product/ruca-live-world-runtime.png",
      alt: "RUCA Live World briefing with a primary story, supporting stories, and source-state labels",
      summary: "LIVE WORLD gives weather, news, markets, sports, technology, and celestial information one calm observation hierarchy.",
      features: [
        { title: "PRIMARY BRIEFING", description: "One dominant briefing establishes what matters now before supporting information asks for attention.", marker: [50, 48], frame: [31, 25, 38, 43] },
        { title: "OBSERVATION LANES", description: "Distinct lanes keep different information types inside one world instead of scattering them across apps.", marker: [18, 50], frame: [2, 21, 26, 61] },
        { title: "SOURCE STATE", description: "Source and freshness language belongs beside the information it qualifies, never buried in a disclaimer.", marker: [51, 19], frame: [38, 13, 25, 13] },
        { title: "SUPPORTING SIGNALS", description: "Secondary stories remain visible, but their scale and contrast keep the primary briefing in command.", marker: [79, 53], frame: [71, 24, 26, 58] }
      ]
    },
    diagnostics: {
      hash: "diagnostics",
      index: "04",
      label: "DIAGNOSTICS",
      title: "GUARDIAN SYSTEM.",
      question: "AM I SAFE?",
      capture: "DIAGNOSTICS // MEANING BEFORE MEASUREMENT",
      image: "/assets/product/ruca-diagnostics-runtime.png",
      alt: "RUCA Diagnostics with Guardian guidance, a signal trace, severity, and next-action information",
      summary: "Guardian translates a machine signal into severity, meaning, first check, reassurance, and next action before exposing deeper detail.",
      features: [
        { title: "GUARDIAN TRIAGE", description: "The first readout answers what the signal means and what the user should do next.", marker: [51, 51], frame: [37, 31, 28, 42] },
        { title: "SIGNAL TRACE", description: "The visible trace preserves the underlying evidence and threshold context for deeper inspection.", marker: [24, 59], frame: [4, 35, 33, 43] },
        { title: "SEVERITY LANGUAGE", description: "Status uses plain language and disciplined emphasis instead of turning every variance into an alarm.", marker: [50, 22], frame: [39, 14, 23, 15] },
        { title: "FIRST CHECK / NEXT ACTION", description: "Diagnosis is structured as a recoverable sequence: understand, check, act, then inspect detail.", marker: [77, 59], frame: [65, 35, 31, 43] }
      ]
    },
    control: {
      hash: "control",
      index: "05",
      label: "CONTROL",
      title: "COMMAND WORKSHOP.",
      question: "HOW SHOULD IT BEHAVE?",
      capture: "CONTROL // COORDINATED SYSTEM AUTHORITY",
      image: "/assets/product/ruca-control-runtime.png",
      alt: "RUCA Control Workshop with the Blood Red profile and coordinated control groups",
      summary: "CONTROL organizes atmosphere, appearance, input, audio, sources, and device behavior as a workshop with visible consequences.",
      features: [
        { title: "ENVIRONMENT PROFILE", description: "A named profile coordinates the product atmosphere instead of exposing unrelated cosmetic toggles.", marker: [50, 28], frame: [39, 17, 22, 20] },
        { title: "CONTROL GROUPS", description: "Settings are grouped by the part of the experience they own, preserving a clear responsibility model.", marker: [24, 55], frame: [3, 32, 35, 48] },
        { title: "VISIBLE CONSEQUENCE", description: "The workshop pairs each adjustment with the surface it affects so change never feels detached from outcome.", marker: [52, 58], frame: [39, 39, 25, 39] },
        { title: "AUTHORITY BOUNDARY", description: "Public controls shown here are product evidence only. This tour cannot change device or workstation state.", marker: [78, 56], frame: [66, 32, 31, 48] }
      ]
    }
  };

  const worldOrder = Object.keys(worlds);
  const aliases = { live: "live", "live-world": "live", world: "live", health: "diagnostics" };
  const state = { world: "home", feature: 0 };

  const shell = document.querySelector(".experience-shell");
  const stage = document.getElementById("product-stage");
  const image = document.getElementById("world-image");
  const hotspotLayer = document.getElementById("hotspot-layer");
  const focusFrame = document.getElementById("focus-frame");
  const captureLabel = document.getElementById("capture-label");
  const briefIndex = document.getElementById("brief-index");
  const worldTitle = document.getElementById("world-title");
  const worldSummary = document.getElementById("world-summary");
  const featureCount = document.getElementById("feature-count");
  const featureTitle = document.getElementById("feature-title");
  const featureDescription = document.getElementById("feature-description");
  const previousFeature = document.getElementById("feature-prev");
  const nextFeature = document.getElementById("feature-next");
  const tabs = Array.from(document.querySelectorAll(".world-tab"));

  function normalizeWorld(value) {
    const key = String(value || "").replace(/^#/, "").toLowerCase();
    if (worlds[key]) return key;
    return aliases[key] || "home";
  }

  function setHash(world) {
    const nextHash = `#${worlds[world].hash}`;
    if (window.location.hash !== nextHash) history.replaceState(null, "", nextHash);
  }

  function setFrame(frame) {
    const [left, top, width, height] = frame;
    focusFrame.style.left = `${left}%`;
    focusFrame.style.top = `${top}%`;
    focusFrame.style.width = `${width}%`;
    focusFrame.style.height = `${height}%`;
  }

  function renderFeature(options) {
    const world = worlds[state.world];
    const feature = world.features[state.feature];
    const total = String(world.features.length).padStart(2, "0");
    const current = String(state.feature + 1).padStart(2, "0");

    featureCount.textContent = `${current} / ${total}`;
    featureTitle.textContent = feature.title;
    featureDescription.textContent = feature.description;
    setFrame(feature.frame);

    hotspotLayer.querySelectorAll(".hotspot").forEach((button, index) => {
      const selected = index === state.feature;
      button.setAttribute("aria-pressed", String(selected));
      button.setAttribute("aria-label", `${selected ? "Selected: " : "Show "}${world.features[index].title}`);
    });

    if (options && options.focusHotspot) {
      const active = hotspotLayer.querySelector(`[data-feature="${state.feature}"]`);
      if (active) active.focus({ preventScroll: true });
    }
  }

  function renderHotspots() {
    hotspotLayer.replaceChildren();
    worlds[state.world].features.forEach((feature, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "hotspot";
      button.dataset.feature = String(index);
      button.style.left = `${feature.marker[0]}%`;
      button.style.top = `${feature.marker[1]}%`;
      button.textContent = String(index + 1).padStart(2, "0");
      button.addEventListener("click", () => {
        state.feature = index;
        renderFeature();
      });
      hotspotLayer.appendChild(button);
    });
  }

  function renderWorld(options) {
    const world = worlds[state.world];
    shell.dataset.activeWorld = state.world;
    stage.setAttribute("aria-labelledby", `tab-${state.world}`);
    image.src = world.image;
    image.alt = world.alt;
    captureLabel.textContent = world.capture;
    briefIndex.textContent = `WORLD ${world.index} // ${world.label} // ${world.question}`;
    worldTitle.textContent = world.title;
    worldSummary.textContent = world.summary;

    tabs.forEach((tab) => {
      const active = tab.dataset.world === state.world;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    renderHotspots();
    renderFeature();
    setHash(state.world);

    if (options && options.focusTab) {
      const activeTab = document.getElementById(`tab-${state.world}`);
      activeTab.focus({ preventScroll: true });
      activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }

  function setWorld(world, options) {
    state.world = normalizeWorld(world);
    state.feature = 0;
    renderWorld(options);
  }

  function stepWorld(delta, focusTab) {
    const current = worldOrder.indexOf(state.world);
    const next = (current + delta + worldOrder.length) % worldOrder.length;
    setWorld(worldOrder[next], { focusTab: Boolean(focusTab) });
  }

  function stepFeature(delta, focusHotspot) {
    const features = worlds[state.world].features;
    state.feature = (state.feature + delta + features.length) % features.length;
    renderFeature({ focusHotspot: Boolean(focusHotspot) });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setWorld(tab.dataset.world));
    tab.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepWorld(-1, true);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        stepWorld(1, true);
      } else if (event.key === "Home") {
        event.preventDefault();
        setWorld(worldOrder[0], { focusTab: true });
      } else if (event.key === "End") {
        event.preventDefault();
        setWorld(worldOrder[worldOrder.length - 1], { focusTab: true });
      }
    });
  });

  previousFeature.addEventListener("click", () => stepFeature(-1));
  nextFeature.addEventListener("click", () => stepFeature(1));

  stage.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepWorld(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      stepWorld(1);
    } else if (event.key === "[") {
      event.preventDefault();
      stepFeature(-1, true);
    } else if (event.key === "]") {
      event.preventDefault();
      stepFeature(1, true);
    }
  });

  window.addEventListener("hashchange", () => {
    const nextWorld = normalizeWorld(window.location.hash);
    if (nextWorld !== state.world) setWorld(nextWorld);
  });

  image.addEventListener("error", () => {
    stage.classList.add("capture-error");
    worldSummary.textContent = "This captured product state could not be loaded. Use the world tabs to continue the guided tour.";
  });

  const initialWorld = normalizeWorld(window.location.hash);
  setWorld(initialWorld);

  window.__RUCA_PUBLIC_DIAGNOSTICS__ = function () {
    return {
      activeWorld: state.world,
      activeFeature: state.feature,
      worldCount: worldOrder.length,
      hotspotCount: hotspotLayer.querySelectorAll(".hotspot").length,
      connectedToDevice: false,
      nativeExecutionRoutes: 0
    };
  };

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js", { scope: "/" })
        .then((registration) => registration.update())
        .catch(() => {
          // The guided tour remains usable when offline support is unavailable.
        });
    });
  }
})();
