(function () {
  "use strict";

  const ROUTES = ["home", "play", "live-world", "diagnostics", "control"];
  const ROUTE_META = {
    home: { label: "HOME", question: "AM I READY?" },
    play: { label: "PLAY", question: "WHAT DO I WANT TO LAUNCH?" },
    "live-world": { label: "LIVE WORLD", question: "WHAT IS HAPPENING?" },
    diagnostics: { label: "DIAGNOSTICS", question: "AM I SAFE?" },
    control: { label: "CONTROL", question: "HOW SHOULD RUCA BEHAVE?" }
  };

  const GAUGE_DEFINITIONS = [
    { id: "cpu", label: "CPU", base: 31, amplitude: 4, phase: 0, unit: "%", detail: "Processor demand remains below the simulated session ceiling.", range: "24–38% expected" },
    { id: "gpu", label: "GPU", base: 44, amplitude: 5, phase: 2, unit: "%", detail: "Graphics headroom is available for the selected command profile.", range: "36–52% expected" },
    { id: "ram", label: "RAM", base: 48, amplitude: 3, phase: 4, unit: "%", detail: "Memory pressure is stable with room for another foreground task.", range: "43–54% expected" },
    { id: "storage", label: "STORAGE", base: 91, amplitude: 1, phase: 1, unit: "%", detail: "The local fixture models a healthy storage state; no device is being read.", range: "90–93% health index" },
    { id: "network", label: "NETWORK", base: 62, amplitude: 6, phase: 3, unit: "%", detail: "A deterministic throughput fixture is ready for command handoff examples.", range: "simulated 240–310 Mbps" },
    { id: "thermal", label: "THERMAL", base: 53, amplitude: 3, phase: 5, unit: "°C", detail: "The example thermal state remains inside the quiet-cooling band.", range: "48–58°C expected" }
  ];

  const COMMAND_DISTRICTS = [
    { id: "games", label: "GAMES", descriptor: "MISSION LIBRARIES", commands: [
      { label: "Steam", code: "STM", role: "Game library", readiness: "READY" },
      { label: "Xbox", code: "XBX", role: "Game service", readiness: "READY" },
      { label: "Call of Duty", code: "COD", role: "Mission profile", readiness: "PROFILE READY" }
    ] },
    { id: "media", label: "MEDIA", descriptor: "SOUND + SCREEN", commands: [
      { label: "Spotify", code: "SPT", role: "Music portal", readiness: "READY" },
      { label: "YouTube", code: "YTB", role: "Video portal", readiness: "READY" },
      { label: "Discord", code: "DSC", role: "Voice stack", readiness: "MUTED" }
    ] },
    { id: "creative", label: "CREATIVE", descriptor: "DESIGN + PRODUCTION", commands: [
      { label: "Figma", code: "FIG", role: "Design studio", readiness: "READY" },
      { label: "Adobe", code: "ADB", role: "Creative suite", readiness: "READY" },
      { label: "VS Code", code: "VSC", role: "Development module", readiness: "READY" }
    ] },
    { id: "ai", label: "AI", descriptor: "INTELLIGENCE TOOLS", commands: [
      { label: "ChatGPT", code: "GPT", role: "Reasoning workspace", readiness: "SAFE PREVIEW" },
      { label: "Copilot", code: "COP", role: "Work assistant", readiness: "SAFE PREVIEW" },
      { label: "Perplexity", code: "PPL", role: "Research portal", readiness: "SAFE PREVIEW" }
    ] },
    { id: "browser", label: "BROWSER", descriptor: "WEB DESTINATIONS", commands: [
      { label: "Chrome", code: "CHR", role: "Primary browser", readiness: "READY" },
      { label: "Edge", code: "EDG", role: "Work browser", readiness: "READY" },
      { label: "Firefox", code: "FOX", role: "Alternate browser", readiness: "READY" }
    ] },
    { id: "system", label: "SYSTEM", descriptor: "LOCAL AUTHORITY", commands: [
      { label: "Files", code: "FIL", role: "File system portal", readiness: "DISABLED HERE" },
      { label: "Task Manager", code: "TSK", role: "Process overview", readiness: "DISABLED HERE" },
      { label: "Settings", code: "SET", role: "System control", readiness: "DISABLED HERE" }
    ] }
  ];

  const LIVE_LANES = [
    {
      id: "weather", label: "WEATHER", kicker: "LOCAL ATMOSPHERE MODEL", title: "CLEAR RUNWAY INTO THE EVENING.",
      summary: "Northstar Harbor holds a calm temperature band with a light simulated crosswind.", visual: "72°", visualLabel: "CLEAR",
      source: "SIMULATED", sourceDetail: "LOCAL WEATHER FIXTURE", points: [48, 52, 55, 59, 61, 58, 54],
      stats: [["FEELS", "71°"], ["WIND", "8 MPH"], ["HUMIDITY", "46%"], ["SUNSET", "20:41"]]
    },
    {
      id: "news", label: "NEWS", kicker: "RUCA DEMO DESK", title: "INTERFACES ARE LEARNING TO EXPLAIN LESS.",
      summary: "A local editorial fixture explores how spatial hierarchy can replace layers of onboarding copy.", visual: "01", visualLabel: "PRIMARY STORY",
      source: "CACHED", sourceDetail: "CURATED LOCAL EDITION", points: [32, 41, 38, 52, 48, 62, 68],
      stats: [["DESIGN", "CALM SYSTEMS"], ["INPUT", "CONTROLLER-FIRST"], ["PROOF", "VISIBLE STATE"], ["EDITION", "LOCAL"]]
    },
    {
      id: "markets", label: "MARKETS", kicker: "DETERMINISTIC MARKET MODEL", title: "SIMULATED SESSION HOLDS A NARROW GAIN.",
      summary: "The RUCA 500 fixture moves through a repeatable seven-point sequence without contacting a market feed.", visual: "+0.42%", visualLabel: "RUCA 500",
      source: "SIMULATED", sourceDetail: "NOT FINANCIAL DATA", points: [28, 32, 30, 38, 44, 42, 51],
      stats: [["RUCA 500", "5,482"], ["CORE TECH", "+0.68%"], ["INDUSTRIAL", "−0.06%"], ["SESSION", "STEADY"]]
    },
    {
      id: "sports", label: "SPORTS", kicker: "GAME DAY FIXTURE", title: "SOUTH CLOSES THE FOURTH WITH CONTROL.",
      summary: "A fictional final score demonstrates the hierarchy of a game-day environment without a sports service.", visual: "104", visualLabel: "SOUTH // FINAL",
      source: "SIMULATED", sourceDetail: "FICTIONAL MATCH", points: [24, 31, 35, 42, 47, 55, 63],
      stats: [["NORTH", "101"], ["SOUTH", "104"], ["PERIOD", "FINAL"], ["MARGIN", "+3"]]
    },
    {
      id: "technology", label: "TECHNOLOGY", kicker: "SIGNAL INTELLIGENCE", title: "QUIETER COOLING BECOMES A DESIGN FEATURE.",
      summary: "The local signal brief prioritizes acoustic comfort, visible health, and recoverable controls.", visual: "A-17", visualLabel: "HARDWARE SIGNAL",
      source: "STALE", sourceDetail: "LOCAL BRIEF // AGE DECLARED", points: [45, 48, 44, 51, 58, 61, 60],
      stats: [["THERMALS", "QUIET"], ["CONTROL", "VISIBLE"], ["RISK", "LOW"], ["SOURCE", "LOCAL"]]
    },
    {
      id: "celestial", label: "CELESTIAL", kicker: "CELESTIAL OBSERVATORY", title: "ORBITAL WINDOW OPENS ABOVE NORTHSTAR.",
      summary: "A deterministic sky model demonstrates the observatory lane; no location or astronomy service is queried.", visual: "03", visualLabel: "OBJECTS VISIBLE",
      source: "SIMULATED", sourceDetail: "FIXED SKY MODEL", points: [62, 57, 52, 48, 44, 40, 36],
      stats: [["MOON", "WAXING"], ["VISIBILITY", "GOOD"], ["CLOUD", "12%"], ["WINDOW", "42 MIN"]]
    }
  ];

  const DIAGNOSTIC_STATES = {
    ready: {
      label: "MISSION READY", short: "READY", severity: "SAFE", score: 96, affected: "WHOLE SYSTEM",
      meaning: "All simulated machine groups are operating inside the expected mission profile.",
      matters: "Stable thermal, memory, and storage examples leave headroom for a foreground command.",
      check: "No immediate check is required. Review the trace if you want the underlying evidence.",
      action: "Continue normally and keep Guardian in passive observation.",
      points: [38, 41, 39, 43, 46, 44, 47, 45, 48],
      sensors: [["CPU LOAD", "31%", "NOMINAL"], ["GPU LOAD", "44%", "NOMINAL"], ["MEMORY", "48%", "STABLE"], ["THERMAL", "53°C", "QUIET"]]
    },
    advisory: {
      label: "ADVISORY", short: "WATCH", severity: "ADVISORY", score: 78, affected: "MEMORY",
      meaning: "The memory fixture has crossed the preferred comfort band for a game launch.",
      matters: "A demanding command would have less space for background applications and capture tools.",
      check: "Review the highest-memory background task before beginning a large session.",
      action: "Close an unused application, then confirm that the trace returns below 80%.",
      points: [52, 58, 63, 68, 74, 82, 86, 83, 78],
      sensors: [["CPU LOAD", "52%", "ACTIVE"], ["GPU LOAD", "61%", "ACTIVE"], ["MEMORY", "86%", "WATCH"], ["THERMAL", "67°C", "ELEVATED"]]
    },
    critical: {
      label: "CRITICAL EXAMPLE", short: "ACT", severity: "CRITICAL", score: 42, affected: "THERMAL",
      meaning: "The thermal fixture has entered a sustained high-temperature example state.",
      matters: "Extended operation at this example threshold could reduce performance and component margin.",
      check: "Confirm airflow is unobstructed and the cooling profile is responding.",
      action: "Stop the demanding session, allow temperatures to fall, then inspect cooling before resuming.",
      points: [61, 66, 72, 79, 86, 92, 94, 91, 88],
      sensors: [["CPU LOAD", "88%", "HIGH"], ["GPU LOAD", "91%", "HIGH"], ["MEMORY", "82%", "WATCH"], ["THERMAL", "92°C", "CRITICAL"]]
    }
  };

  const CONTROL_DEFAULTS = { preset: "blood", glow: 72, motion: 58, density: 60, glass: 58, depth: 70, brightness: 82, accent: "#ff493d" };
  const PRESETS = {
    blood: { label: "BLOOD RED", descriptor: "RUCA SIGNATURE", glow: 72, motion: 58, density: 60, glass: 58, depth: 70, brightness: 82, accent: "#ff493d" },
    gunmetal: { label: "GUNMETAL", descriptor: "FOCUS PROFILE", glow: 38, motion: 38, density: 52, glass: 72, depth: 55, brightness: 72, accent: "#c9d0d5" },
    ice: { label: "ICE BLUE", descriptor: "COOLANT PROFILE", glow: 58, motion: 46, density: 56, glass: 64, depth: 66, brightness: 78, accent: "#62c8ff" }
  };

  const shell = document.getElementById("appShell");
  const surface = document.getElementById("worldSurface");
  const announcer = document.getElementById("routeAnnouncer");
  const focusReadout = document.getElementById("focusReadout");
  const aboutDialog = document.getElementById("aboutDialog");
  const aboutOpen = document.getElementById("aboutOpen");
  const audioState = document.getElementById("audioState");

  const state = {
    route: normalizeRoute(window.location.hash),
    homeGauge: "cpu",
    telemetryTick: 0,
    telemetry: GAUGE_DEFINITIONS.map((item) => ({ ...item, percent: item.base })),
    playDistrict: 0,
    playCommand: 0,
    handoff: "Select a command to inspect its public handoff state.",
    liveLane: 0,
    diagnostic: "ready",
    audio: false,
    settings: loadSettings()
  };

  function normalizeRoute(value) {
    const candidate = String(value || "").replace(/^#/, "").toLowerCase();
    const aliases = { live: "live-world", world: "live-world", health: "diagnostics" };
    const normalized = aliases[candidate] || candidate;
    return ROUTES.includes(normalized) ? normalized : "home";
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem("ruca-public-controls-v1") || "null");
      if (!saved || typeof saved !== "object") return { ...CONTROL_DEFAULTS };
      const next = { ...CONTROL_DEFAULTS };
      Object.keys(next).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(saved, key)) next[key] = saved[key];
      });
      return next;
    } catch (_) {
      return { ...CONTROL_DEFAULTS };
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem("ruca-public-controls-v1", JSON.stringify(state.settings));
    } catch (_) {
      // The simulation remains fully usable when browser storage is unavailable.
    }
  }

  function applySettings() {
    const settings = state.settings;
    shell.style.setProperty("--accent", settings.accent);
    shell.style.setProperty("--glow-strength", String(settings.glow / 100));
    shell.style.setProperty("--glass-strength", String(settings.glass / 100));
    shell.style.setProperty("--depth-strength", String(settings.depth / 100));
    shell.style.setProperty("--ui-brightness", String(0.62 + settings.brightness / 250));
    shell.style.setProperty("--density-scale", String(1.22 - settings.density / 250));
    shell.style.setProperty("--motion-duration", `${clamp(16 - settings.motion / 8, 3.5, 16)}s`);
    shell.dataset.visualPreset = settings.preset;
  }

  function gaugeDisplay(gauge) {
    if (gauge.id === "network") {
      const down = 260 + Math.round((gauge.percent - 56) * 4.2);
      const up = 18 + Math.round((gauge.percent - 56) * 0.45);
      return `${down} / ${up}`;
    }
    return `${gauge.percent}${gauge.unit}`;
  }

  function readinessScore() {
    const thermal = state.telemetry.find((item) => item.id === "thermal").percent;
    const ram = state.telemetry.find((item) => item.id === "ram").percent;
    return clamp(Math.round(99 - Math.max(0, thermal - 50) * 0.4 - Math.max(0, ram - 45) * 0.18), 90, 99);
  }

  function telemetryStep() {
    state.telemetryTick += 1;
    state.telemetry.forEach((item) => {
      const wave = Math.sin((state.telemetryTick + item.phase) * 0.72);
      item.percent = Math.round(item.base + wave * item.amplitude);
    });
    updateGlobalStatus();
    if (state.route === "home") updateHomeTelemetry();
  }

  function updateGlobalStatus() {
    const cpu = state.telemetry.find((item) => item.id === "cpu");
    const thermal = state.telemetry.find((item) => item.id === "thermal");
    document.getElementById("globalReadiness").textContent = readinessScore() >= 94 ? "MISSION READY" : "ADVISORY";
    document.getElementById("globalCpu").textContent = `CPU ${cpu.percent}%`;
    document.getElementById("globalThermal").textContent = `THERMAL ${thermal.percent}°C`;
  }

  function gaugeMarkup(gauge) {
    const selected = state.homeGauge === gauge.id;
    return `
      <button class="watch-gauge gauge-${gauge.id}${selected ? " is-selected" : ""}" type="button" data-gauge="${gauge.id}" data-focus aria-pressed="${selected}" aria-label="${gauge.label}, ${gaugeDisplay(gauge)}. Show detail.">
        <span class="gauge-bezel" aria-hidden="true"></span>
        <svg class="gauge-svg" viewBox="0 0 120 120" aria-hidden="true">
          <circle class="gauge-track" cx="60" cy="60" r="48" pathLength="100"></circle>
          <circle class="gauge-progress" cx="60" cy="60" r="48" pathLength="100" data-gauge-offset="${100 - gauge.percent}"></circle>
          <circle class="gauge-inner" cx="60" cy="60" r="38"></circle>
        </svg>
        <span class="gauge-copy"><small>${gauge.label}</small><strong data-gauge-value="${gauge.id}">${gaugeDisplay(gauge)}</strong><em>${gauge.range}</em></span>
      </button>`;
  }

  function renderHome() {
    const selected = state.telemetry.find((item) => item.id === state.homeGauge) || state.telemetry[0];
    const score = readinessScore();
    return `
      <section class="world world-home" aria-labelledby="homeTitle">
        <header class="world-heading compact-heading">
          <div><p class="eyebrow">HOME // ARRIVAL AND READINESS</p><h1 id="homeTitle">WELCOME HOME.</h1></div>
          <p class="world-question">AM I READY?</p>
        </header>
        <div class="home-orbit">
          <svg class="conduit-map" viewBox="0 0 1000 650" preserveAspectRatio="none" aria-hidden="true">
            <defs><filter id="conduitGlow"><feGaussianBlur stdDeviation="3" result="blur"></feGaussianBlur><feMerge><feMergeNode in="blur"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter></defs>
            <g filter="url(#conduitGlow)"><path d="M500 325 L235 145"></path><path d="M500 325 L765 145"></path><path d="M500 325 L175 325"></path><path d="M500 325 L825 325"></path><path d="M500 325 L235 510"></path><path d="M500 325 L765 510"></path></g>
          </svg>
          ${state.telemetry.map(gaugeMarkup).join("")}
          <button class="system-heart" type="button" data-action="heart" data-focus aria-label="System Heart, readiness ${score} percent, mission ready">
            <span class="heart-rings" aria-hidden="true"></span>
            <span class="heart-core"><small>SYSTEM HEART</small><strong data-heart-score>${score}%</strong><em>MISSION READY</em></span>
          </button>
        </div>
        <div class="home-detail instrument-panel" aria-live="polite">
          <div><span>SELECTED SIGNAL</span><strong data-home-detail-label>${selected.label}</strong></div>
          <p data-home-detail-copy>${selected.detail}</p>
          <div class="detail-metric"><strong data-home-detail-value>${gaugeDisplay(selected)}</strong><span>${selected.range}</span></div>
        </div>
      </section>`;
  }

  function updateHomeTelemetry() {
    state.telemetry.forEach((gauge) => {
      const button = surface.querySelector(`[data-gauge="${gauge.id}"]`);
      if (!button) return;
      const progress = button.querySelector(".gauge-progress");
      const value = button.querySelector(`[data-gauge-value="${gauge.id}"]`);
      progress.style.setProperty("--gauge-offset", String(100 - gauge.percent));
      value.textContent = gaugeDisplay(gauge);
      button.setAttribute("aria-label", `${gauge.label}, ${gaugeDisplay(gauge)}. Show detail.`);
    });
    const heartScore = surface.querySelector("[data-heart-score]");
    if (heartScore) heartScore.textContent = `${readinessScore()}%`;
    const heart = surface.querySelector(".system-heart");
    if (heart) heart.setAttribute("aria-label", `System Heart, readiness ${readinessScore()} percent, mission ready`);
    const selected = state.telemetry.find((item) => item.id === state.homeGauge);
    if (selected) {
      const detailValue = surface.querySelector("[data-home-detail-value]");
      if (detailValue) detailValue.textContent = gaugeDisplay(selected);
    }
  }

  function renderPlay() {
    const district = COMMAND_DISTRICTS[state.playDistrict];
    const command = district.commands[state.playCommand];
    const count = district.commands.length;
    const nodes = district.commands.map((item, index) => {
      const angle = -90 + index * (360 / count);
      const radians = angle * (Math.PI / 180);
      const x = 50 + Math.cos(radians) * 39;
      const y = 50 + Math.sin(radians) * 34;
      const selected = index === state.playCommand;
      return `<button type="button" class="command-node${selected ? " is-selected" : ""}" data-node-x="${x}" data-node-y="${y}" data-command="${index}" data-focus aria-pressed="${selected}" aria-label="Select ${item.label}, ${item.role}"><span>${item.code}</span><strong>${item.label}</strong><small>${item.readiness}</small></button>`;
    }).join("");

    return `
      <section class="world world-play" aria-labelledby="playTitle">
        <header class="world-heading">
          <div><p class="eyebrow">PLAY // ONE COMMAND WORLD</p><h1 id="playTitle">COMMAND DISTRICTS.</h1><p>Choose a district. Let one command own the center.</p></div>
          <p class="world-question">WHAT DO I WANT TO LAUNCH?</p>
        </header>
        <div class="district-rail" role="group" aria-label="Command districts">
          ${COMMAND_DISTRICTS.map((item, index) => `<button type="button" data-district="${index}" data-focus aria-pressed="${index === state.playDistrict}"><strong>${item.label}</strong><small>${item.descriptor}</small></button>`).join("")}
        </div>
        <div class="command-environment">
          <div class="orbit-lines" aria-hidden="true"><span></span><span></span><span></span></div>
          ${nodes}
          <button class="command-center" type="button" data-action="safe-handoff" data-focus aria-label="Confirm safe public handoff for ${command.label}">
            <small>${district.label} DISTRICT</small><span>${command.code}</span><strong>${command.label}</strong><em>${command.role}</em><b>SELECT COMMAND</b>
          </button>
        </div>
        <div class="handoff-readout instrument-panel" role="status" aria-live="polite">
          <div><span>COMMAND REGISTRY</span><strong>${district.label} // ${String(state.playCommand + 1).padStart(2, "0")}</strong></div>
          <p>${state.handoff}</p>
          <div class="detail-metric"><strong>${command.readiness}</strong><span>PUBLIC HANDOFF</span></div>
        </div>
      </section>`;
  }

  function sparkline(points, className) {
    const width = 600;
    const height = 180;
    const min = Math.min(...points) - 5;
    const max = Math.max(...points) + 5;
    const coordinates = points.map((value, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((value - min) / (max - min)) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    return `<svg class="${className}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true"><g class="chart-grid"><path d="M0 45 H600 M0 90 H600 M0 135 H600"></path><path d="M100 0 V180 M200 0 V180 M300 0 V180 M400 0 V180 M500 0 V180"></path></g><polyline points="${coordinates}"></polyline><circle cx="600" cy="${coordinates.split(" ").pop().split(",")[1]}" r="7"></circle></svg>`;
  }

  function renderLiveWorld() {
    const lane = LIVE_LANES[state.liveLane];
    return `
      <section class="world world-live" data-lane="${lane.id}" aria-labelledby="liveTitle">
        <header class="world-heading">
          <div><p class="eyebrow">RUCA INTELLIGENCE // OBSERVATION DECK</p><h1 id="liveTitle">LIVE WORLD.</h1><p>One primary signal. Supporting context stays secondary.</p></div>
          <p class="world-question">WHAT IS HAPPENING?</p>
        </header>
        <div class="live-layout">
          <nav class="lane-selector" aria-label="Live World lanes">
            ${LIVE_LANES.map((item, index) => `<button type="button" data-lane="${index}" data-focus aria-current="${index === state.liveLane ? "true" : "false"}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${item.label}</strong><small>${item.source}</small></button>`).join("")}
          </nav>
          <article class="primary-briefing">
            <div class="briefing-sky" aria-hidden="true"><span></span><span></span><span></span></div>
            <div class="briefing-head"><p class="eyebrow">${lane.kicker}</p><div class="source-state source-${lane.source.toLowerCase()}"><span>${lane.source}</span><small>${lane.sourceDetail}</small></div></div>
            <div class="briefing-main">
              <div><h2>${lane.title}</h2><p>${lane.summary}</p></div>
              <div class="lane-visual"><strong>${lane.visual}</strong><span>${lane.visualLabel}</span></div>
            </div>
            ${sparkline(lane.points, "lane-chart")}
            <dl class="signal-strip">${lane.stats.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl>
          </article>
        </div>
      </section>`;
  }

  function renderDiagnostics() {
    const diagnostic = DIAGNOSTIC_STATES[state.diagnostic];
    return `
      <section class="world world-diagnostics severity-${state.diagnostic}" aria-labelledby="diagnosticsTitle">
        <header class="world-heading">
          <div><p class="eyebrow">DIAGNOSTICS // GUARDIAN SYSTEM</p><h1 id="diagnosticsTitle">MEANING BEFORE MEASUREMENT.</h1><p>Change the machine state and watch the whole triage environment respond.</p></div>
          <p class="world-question">AM I SAFE?</p>
        </header>
        <div class="diagnostic-state-selector" role="group" aria-label="Simulated diagnostic states">
          ${Object.entries(DIAGNOSTIC_STATES).map(([id, item]) => `<button type="button" data-diagnostic="${id}" data-focus aria-pressed="${id === state.diagnostic}"><span>${item.short}</span><strong>${item.label}</strong><small>${item.affected}</small></button>`).join("")}
        </div>
        <div class="diagnostic-layout">
          <section class="trace-console instrument-panel" aria-labelledby="traceTitle">
            <div class="trace-summary"><div><span>SIMULATED SYSTEM HEALTH</span><strong id="traceTitle">${diagnostic.affected}</strong></div><div class="score-ring" data-score="${diagnostic.score}"><strong>${diagnostic.score}</strong><small>HEALTH</small></div></div>
            <div class="severity-bar"><span>SEVERITY</span><strong>${diagnostic.severity}</strong><small>${diagnostic.label}</small></div>
            ${sparkline(diagnostic.points, "diagnostic-chart")}
            <div class="sensor-grid">${diagnostic.sensors.map(([label, value, status]) => `<div><span>${label}</span><strong>${value}</strong><small>${status}</small></div>`).join("")}</div>
          </section>
          <aside class="guardian-console" aria-live="polite">
            <p class="eyebrow">GUARDIAN // ${diagnostic.severity}</p><h2>TRIAGE</h2>
            <dl>
              <div><dt>WHAT IT MEANS</dt><dd>${diagnostic.meaning}</dd></div>
              <div><dt>WHY IT MATTERS</dt><dd>${diagnostic.matters}</dd></div>
              <div><dt>FIRST CHECK</dt><dd>${diagnostic.check}</dd></div>
              <div><dt>NEXT ACTION</dt><dd>${diagnostic.action}</dd></div>
            </dl>
          </aside>
        </div>
      </section>`;
  }

  function controlRange(id, label, owner) {
    const value = state.settings[id];
    return `<label class="control-range"><span><strong>${label}</strong><small>${owner}</small></span><input type="range" min="0" max="100" step="1" value="${value}" data-control="${id}" data-focus><output for="control-${id}" data-control-output="${id}">${value}</output></label>`;
  }

  function renderControl() {
    return `
      <section class="world world-control" aria-labelledby="controlTitle">
        <header class="world-heading">
          <div><p class="eyebrow">CONTROL // COMMAND AUTHORITY</p><h1 id="controlTitle">CONTROL WORKSHOP.</h1><p>Every adjustment changes this simulation immediately and stays in this browser.</p></div>
          <p class="world-question">HOW SHOULD RUCA BEHAVE?</p>
        </header>
        <div class="control-layout">
          <aside class="preset-console">
            <div class="profile-reactor"><span>ACTIVE PROFILE</span><strong>${PRESETS[state.settings.preset] ? PRESETS[state.settings.preset].label : "CUSTOM"}</strong><small>${PRESETS[state.settings.preset] ? PRESETS[state.settings.preset].descriptor : "LOCAL COMMAND"}</small></div>
            <div class="preset-list" role="group" aria-label="Visual presets">
              ${Object.entries(PRESETS).map(([id, preset]) => `<button type="button" data-preset="${id}" data-focus aria-pressed="${state.settings.preset === id}"><span data-swatch="${preset.accent}"></span><strong>${preset.label}</strong><small>${preset.descriptor}</small></button>`).join("")}
            </div>
            <button class="reset-control" type="button" data-action="reset-controls" data-focus>RESET BLOOD RED</button>
          </aside>
          <div class="control-groups">
            <section class="control-group"><header><div><span>01</span><h2>ATMOSPHERE</h2></div><p>Illumination and cockpit visibility.</p></header>${controlRange("glow", "GLOW", "REACTOR / GAUGES")}${controlRange("brightness", "BRIGHTNESS", "WHOLE COCKPIT")}<label class="accent-control"><span><strong>ACCENT</strong><small>RUCA COLOR BUS</small></span><input type="color" value="${state.settings.accent}" data-control="accent" data-focus aria-label="RUCA accent color"><output data-control-output="accent">${state.settings.accent.toUpperCase()}</output></label></section>
            <section class="control-group"><header><div><span>02</span><h2>MATERIAL</h2></div><p>Panel glass and physical separation.</p></header>${controlRange("glass", "GLASS", "PANEL MATERIAL")}${controlRange("depth", "DEPTH", "GUNMETAL LAYERS")}${controlRange("density", "DENSITY", "INFORMATION SPACING")}</section>
            <section class="control-group"><header><div><span>03</span><h2>BEHAVIOR</h2></div><p>Deliberate motion across the active world.</p></header>${controlRange("motion", "MOTION", "ANIMATION BUDGET")}<div class="behavior-proof"><span class="proof-orbit" aria-hidden="true"></span><div><strong>LIVE CONSEQUENCE</strong><p>Focus rings, conduits, the System Heart, transitions, and environment traces use this command state.</p></div></div></section>
          </div>
        </div>
      </section>`;
  }

  function renderActiveWorld(options) {
    shell.dataset.world = state.route;
    surface.dataset.world = state.route;
    const renderers = { home: renderHome, play: renderPlay, "live-world": renderLiveWorld, diagnostics: renderDiagnostics, control: renderControl };
    surface.innerHTML = renderers[state.route]();
    hydrateDynamicStyles();
    document.querySelectorAll("[data-route]").forEach((control) => {
      const active = control.dataset.route === state.route;
      if (control.tagName === "BUTTON") {
        if (active) control.setAttribute("aria-current", "page");
        else control.removeAttribute("aria-current");
      }
    });
    const meta = ROUTE_META[state.route];
    document.title = `RUCA ${meta.label} | Public Product Simulation`;
    announcer.textContent = `${meta.label}. ${meta.question}`;
    focusReadout.textContent = meta.label;
    shell.dataset.severity = state.route === "diagnostics" ? state.diagnostic : "ready";
    if (options && options.focusSelector) focusAfterRender(options.focusSelector);
  }

  function hydrateDynamicStyles() {
    surface.querySelectorAll("[data-gauge-offset]").forEach((element) => {
      element.style.setProperty("--gauge-offset", element.dataset.gaugeOffset);
    });
    surface.querySelectorAll("[data-node-x][data-node-y]").forEach((element) => {
      element.style.setProperty("--node-x", `${element.dataset.nodeX}%`);
      element.style.setProperty("--node-y", `${element.dataset.nodeY}%`);
    });
    surface.querySelectorAll("[data-score]").forEach((element) => {
      element.style.setProperty("--score", element.dataset.score);
    });
    surface.querySelectorAll("[data-swatch]").forEach((element) => {
      element.style.setProperty("--swatch", element.dataset.swatch);
    });
    const handoffControl = surface.querySelector('[data-action="safe-handoff"]');
    if (handoffControl) {
      handoffControl.addEventListener("click", (event) => {
        event.stopPropagation();
        safeHandoff();
      });
    }
  }

  function setRoute(route, options) {
    state.route = normalizeRoute(route);
    const nextHash = `#${state.route}`;
    if (window.location.hash !== nextHash) history.pushState(null, "", nextHash);
    renderActiveWorld(options || {});
    restoreRouteViewport();
  }

  function restoreRouteViewport() {
    requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? "auto" : "smooth" });
      const nav = document.querySelector(".world-nav");
      const active = nav && nav.querySelector(`[data-route="${state.route}"]`);
      if (nav && active) {
        const left = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
        nav.scrollTo({ left, behavior: reducedMotion ? "auto" : "smooth" });
      }
    });
  }

  function focusAfterRender(selector) {
    requestAnimationFrame(() => {
      const target = surface.querySelector(selector) || surface.querySelector("[data-focus]") || surface;
      target.focus({ preventScroll: true });
    });
  }

  function selectGauge(id) {
    state.homeGauge = id;
    renderActiveWorld({ focusSelector: `[data-gauge="${id}"]` });
  }

  function selectDistrict(index) {
    state.playDistrict = clamp(index, 0, COMMAND_DISTRICTS.length - 1);
    state.playCommand = 0;
    state.handoff = `District changed to ${COMMAND_DISTRICTS[state.playDistrict].label}. Select a command to inspect its safe handoff.`;
    renderActiveWorld({ focusSelector: `[data-district="${state.playDistrict}"]` });
  }

  function selectCommand(index) {
    const district = COMMAND_DISTRICTS[state.playDistrict];
    state.playCommand = clamp(index, 0, district.commands.length - 1);
    const command = district.commands[state.playCommand];
    state.handoff = `${command.label} selected. Native execution is disabled in the public simulation.`;
    renderActiveWorld({ focusSelector: `[data-command="${state.playCommand}"]` });
  }

  function safeHandoff() {
    const command = COMMAND_DISTRICTS[state.playDistrict].commands[state.playCommand];
    state.handoff = `${command.label} handoff simulated. Nothing launched, no device was contacted, and no private endpoint exists.`;
    renderActiveWorld({ focusSelector: "[data-action=\"safe-handoff\"]" });
  }

  function selectLane(index) {
    state.liveLane = clamp(index, 0, LIVE_LANES.length - 1);
    renderActiveWorld({ focusSelector: `[data-lane="${state.liveLane}"]` });
  }

  function selectDiagnostic(id) {
    if (!DIAGNOSTIC_STATES[id]) return;
    state.diagnostic = id;
    shell.dataset.severity = id;
    renderActiveWorld({ focusSelector: `[data-diagnostic="${id}"]` });
  }

  function applyPreset(id) {
    const preset = PRESETS[id];
    if (!preset) return;
    state.settings = { ...state.settings, ...preset, preset: id };
    applySettings();
    saveSettings();
    renderActiveWorld({ focusSelector: `[data-preset="${id}"]` });
  }

  function resetControls() {
    state.settings = { ...CONTROL_DEFAULTS };
    applySettings();
    saveSettings();
    renderActiveWorld({ focusSelector: "[data-action=\"reset-controls\"]" });
  }

  function updateControl(input) {
    const key = input.dataset.control;
    if (!Object.prototype.hasOwnProperty.call(state.settings, key)) return;
    state.settings[key] = key === "accent" ? input.value : Number(input.value);
    state.settings.preset = Object.entries(PRESETS).find(([, preset]) => ["glow", "motion", "density", "glass", "depth", "brightness", "accent"].every((name) => preset[name] === state.settings[name]))?.[0] || "custom";
    const output = surface.querySelector(`[data-control-output="${key}"]`);
    if (output) output.textContent = key === "accent" ? input.value.toUpperCase() : input.value;
    applySettings();
    saveSettings();
    const profile = surface.querySelector(".profile-reactor strong");
    if (profile) profile.textContent = state.settings.preset === "custom" ? "CUSTOM" : PRESETS[state.settings.preset].label;
  }

  function cycleRoute(delta) {
    const current = ROUTES.indexOf(state.route);
    const next = (current + delta + ROUTES.length) % ROUTES.length;
    setRoute(ROUTES[next], { focusSelector: "[data-focus]" });
  }

  function visibleFocusables() {
    return Array.from(document.querySelectorAll("[data-focus]:not([disabled])")).filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== "hidden";
    });
  }

  function moveDirectionalFocus(direction) {
    const controls = visibleFocusables();
    if (!controls.length) return;
    const active = document.activeElement;
    if (!controls.includes(active)) {
      controls[0].focus({ preventScroll: true });
      return;
    }
    const origin = active.getBoundingClientRect();
    const ox = origin.left + origin.width / 2;
    const oy = origin.top + origin.height / 2;
    const candidates = controls.filter((candidate) => candidate !== active).map((candidate) => {
      const rect = candidate.getBoundingClientRect();
      const dx = rect.left + rect.width / 2 - ox;
      const dy = rect.top + rect.height / 2 - oy;
      const valid = direction === "left" ? dx < -4 : direction === "right" ? dx > 4 : direction === "up" ? dy < -4 : dy > 4;
      if (!valid) return null;
      const primary = direction === "left" || direction === "right" ? Math.abs(dx) : Math.abs(dy);
      const cross = direction === "left" || direction === "right" ? Math.abs(dy) : Math.abs(dx);
      return { candidate, score: primary + cross * 1.9 };
    }).filter(Boolean).sort((a, b) => a.score - b.score);
    if (candidates[0]) {
      candidates[0].candidate.focus({ preventScroll: true });
      candidates[0].candidate.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    }
  }

  document.addEventListener("click", (event) => {
    const routeControl = event.target.closest("[data-route]");
    if (routeControl) {
      event.preventDefault();
      setRoute(routeControl.dataset.route);
      return;
    }
    const gauge = event.target.closest("[data-gauge]");
    if (gauge) return selectGauge(gauge.dataset.gauge);
    const district = event.target.closest("[data-district]");
    if (district) return selectDistrict(Number(district.dataset.district));
    const command = event.target.closest("[data-command]");
    if (command) return selectCommand(Number(command.dataset.command));
    const lane = event.target.closest("[data-lane]");
    if (lane) return selectLane(Number(lane.dataset.lane));
    const diagnostic = event.target.closest("[data-diagnostic]");
    if (diagnostic) return selectDiagnostic(diagnostic.dataset.diagnostic);
    const preset = event.target.closest(".preset-list [data-preset]");
    if (preset) return applyPreset(preset.dataset.preset);
    const action = event.target.closest("[data-action]");
    if (!action) return;
    if (action.dataset.action === "safe-handoff") safeHandoff();
    if (action.dataset.action === "reset-controls") resetControls();
    if (action.dataset.action === "heart") selectGauge(state.homeGauge);
  });

  surface.addEventListener("input", (event) => {
    if (event.target.matches("[data-control]")) updateControl(event.target);
  });

  document.addEventListener("focusin", (event) => {
    const target = event.target.closest && event.target.closest("[data-focus]");
    if (!target) return;
    const label = target.getAttribute("aria-label") || target.querySelector("strong")?.textContent || target.textContent;
    focusReadout.textContent = String(label || ROUTE_META[state.route].label).trim().replace(/\s+/g, " ").slice(0, 42);
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isRange = target instanceof HTMLInputElement && ["range", "color", "text", "search"].includes(target.type);
    if (event.key === "Escape") {
      if (aboutDialog.open) {
        event.preventDefault();
        aboutDialog.close();
        aboutOpen.focus({ preventScroll: true });
      } else {
        const routeButton = document.querySelector(`.world-nav [data-route="${state.route}"]`);
        if (routeButton) routeButton.focus({ preventScroll: true });
      }
      return;
    }
    if (!isRange && event.key === "Home") {
      event.preventDefault();
      setRoute("home", { focusSelector: "[data-focus]" });
      return;
    }
    if (!isRange && ["]", "PageDown", "e", "E"].includes(event.key)) {
      event.preventDefault();
      cycleRoute(1);
      return;
    }
    if (!isRange && ["[", "PageUp", "q", "Q"].includes(event.key)) {
      event.preventDefault();
      cycleRoute(-1);
      return;
    }
    if (!isRange && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      moveDirectionalFocus(event.key.replace("Arrow", "").toLowerCase());
    }
  });

  window.addEventListener("hashchange", () => {
    const route = normalizeRoute(window.location.hash);
    if (route !== state.route) {
      state.route = route;
      renderActiveWorld({ focusSelector: "[data-focus]" });
      restoreRouteViewport();
    }
  });

  aboutOpen.addEventListener("click", () => {
    aboutDialog.showModal();
    document.getElementById("aboutClose").focus({ preventScroll: true });
  });
  document.getElementById("aboutClose").addEventListener("click", () => aboutDialog.close());
  document.getElementById("aboutDone").addEventListener("click", () => aboutDialog.close());
  aboutDialog.addEventListener("close", () => aboutOpen.focus({ preventScroll: true }));

  audioState.addEventListener("click", () => {
    state.audio = !state.audio;
    audioState.setAttribute("aria-pressed", String(state.audio));
    audioState.querySelector("strong").textContent = state.audio ? "UI CUES ON" : "MUTED";
  });

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js", { scope: "/" }).then((registration) => registration.update()).catch(() => {});
    });
  }

  applySettings();
  updateGlobalStatus();
  renderActiveWorld();
  if (!window.location.hash) history.replaceState(null, "", "#home");
  restoreRouteViewport();
  window.setInterval(telemetryStep, 2800);
  registerServiceWorker();
})();
