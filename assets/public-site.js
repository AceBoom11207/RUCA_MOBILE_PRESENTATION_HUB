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
    { id: "cpu", label: "CPU", base: 43, amplitude: 4, phase: 0, unit: "%", hardware: "RYZEN 9 5900X", detail: "Processor demand remains below the simulated session ceiling." },
    { id: "gpu", label: "GPU", base: 34, amplitude: 5, phase: 2, unit: "%", hardware: "ASUS RTX 4070 TI SUPER", detail: "Graphics headroom is available for the selected command profile." },
    { id: "ram", label: "RAM", base: 30, amplitude: 3, phase: 4, unit: "%", hardware: "CORSAIR 128GB DDR4", detail: "Memory pressure is stable with room for another foreground task." },
    { id: "storage", label: "STORAGE", base: 91, amplitude: 1, phase: 1, unit: "%", hardware: "SAMSUNG STORAGE", detail: "The local fixture models free capacity; no device is being read." },
    { id: "network", label: "NETWORK", base: 62, amplitude: 6, phase: 3, unit: "%", hardware: "SPECTRUM / NIGHTHAWK X2", detail: "A deterministic throughput fixture is ready for command handoff examples." },
    { id: "thermal", label: "THERMAL", base: 48, amplitude: 3, phase: 5, unit: "°C", hardware: "BE QUIET! COOLING", detail: "The example thermal state remains inside the quiet-cooling band." }
  ];

  const COMMAND_DISTRICTS = [
    { id: "games", label: "GAMES", descriptor: "MISSION LIBRARIES", commands: [
      { label: "Steam", code: "STM", role: "Game library", readiness: "READY" },
      { label: "Xbox", code: "XBX", role: "Game service", readiness: "READY" },
      { label: "Call of Duty", code: "COD", role: "Mission profile", readiness: "PROFILE READY" },
      { label: "Epic Games", code: "EPG", role: "Game library", readiness: "READY" },
      { label: "Battle.net", code: "BTL", role: "Game library", readiness: "READY" },
      { label: "EA", code: "EAP", role: "Game library", readiness: "READY" }
    ] },
    { id: "media", label: "MEDIA", descriptor: "SOUND + SCREEN", commands: [
      { label: "Spotify", code: "SPT", role: "Music portal", readiness: "READY" },
      { label: "YouTube", code: "YTB", role: "Video portal", readiness: "READY" },
      { label: "Discord", code: "DSC", role: "Voice stack", readiness: "MUTED" },
      { label: "Netflix", code: "NFX", role: "Video portal", readiness: "READY" },
      { label: "Plex", code: "PLX", role: "Media library", readiness: "READY" },
      { label: "Twitch", code: "TWT", role: "Live portal", readiness: "READY" },
      { label: "Prime Video", code: "PRM", role: "Video portal", readiness: "READY" }
    ] },
    { id: "creative", label: "CREATIVE", descriptor: "DESIGN + PRODUCTION", commands: [
      { label: "Figma", code: "FIG", role: "Design studio", readiness: "READY" },
      { label: "Adobe", code: "ADB", role: "Creative suite", readiness: "READY" },
      { label: "VS Code", code: "VSC", role: "Development module", readiness: "READY" },
      { label: "Blender", code: "BLD", role: "3D studio", readiness: "READY" },
      { label: "Canva", code: "CNV", role: "Design portal", readiness: "READY" },
      { label: "Obsidian", code: "OBS", role: "Knowledge studio", readiness: "READY" }
    ] },
    { id: "ai", label: "AI", descriptor: "INTELLIGENCE TOOLS", commands: [
      { label: "ChatGPT", code: "GPT", role: "Reasoning workspace", readiness: "SAFE PREVIEW" },
      { label: "Copilot", code: "COP", role: "Work assistant", readiness: "SAFE PREVIEW" }
    ] },
    { id: "browser", label: "BROWSER", descriptor: "WEB DESTINATIONS", commands: [
      { label: "Chrome", code: "CHR", role: "Primary browser", readiness: "READY" }
    ] },
    { id: "system", label: "SYSTEM", descriptor: "LOCAL AUTHORITY", commands: [
      { label: "Files", code: "FIL", role: "File system portal", readiness: "DISABLED HERE" },
      { label: "Task Manager", code: "TSK", role: "Process overview", readiness: "DISABLED HERE" },
      { label: "Settings", code: "SET", role: "System control", readiness: "DISABLED HERE" },
      { label: "Terminal", code: "TRM", role: "Command portal", readiness: "DISABLED HERE" },
      { label: "PowerShell", code: "PWS", role: "Command portal", readiness: "DISABLED HERE" },
      { label: "Performance", code: "PRF", role: "System overview", readiness: "DISABLED HERE" },
      { label: "Documents", code: "DOC", role: "Folder portal", readiness: "DISABLED HERE" },
      { label: "Downloads", code: "DWN", role: "Folder portal", readiness: "DISABLED HERE" },
      { label: "Calculator", code: "CAL", role: "Utility", readiness: "DISABLED HERE" },
      { label: "Notepad", code: "NTP", role: "Utility", readiness: "DISABLED HERE" },
      { label: "Snipping Tool", code: "SNP", role: "Capture utility", readiness: "DISABLED HERE" },
      { label: "Photos", code: "PHT", role: "Media utility", readiness: "DISABLED HERE" },
      { label: "Mail", code: "MAL", role: "Communication portal", readiness: "DISABLED HERE" },
      { label: "Calendar", code: "CLD", role: "Planning portal", readiness: "DISABLED HERE" },
      { label: "Weather", code: "WTH", role: "Information portal", readiness: "DISABLED HERE" },
      { label: "Clock", code: "CLK", role: "Utility", readiness: "DISABLED HERE" },
      { label: "Control Panel", code: "CTL", role: "System portal", readiness: "DISABLED HERE" }
    ] }
  ];

  const LIVE_LANES = [
    {
      id: "weather", label: "WEATHER", kicker: "LOCAL ATMOSPHERE MODEL", title: "LOCAL CONDITIONS",
      summary: "Kiamsha Lake, New York // Open-Meteo-shaped local fixture with no external request.", visual: "49°", visualLabel: "CLOUDY",
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

  const CONTROL_DEFAULTS = { preset: "ruca", glow: 62, motion: 42, density: 64, glass: 72, depth: 64, brightness: 82, accent: "#e7a266" };
  const PRESETS = {
    ruca: { label: "BLACK / GOLD", descriptor: "RUCA", glow: 62, motion: 42, density: 64, glass: 72, depth: 64, brightness: 82, accent: "#e7a266" },
    lounge: { label: "LOUNGE MODE", descriptor: "3DIXON", glow: 48, motion: 28, density: 58, glass: 78, depth: 72, brightness: 70, accent: "#c88655" },
    blood: { label: "BLOOD RED", descriptor: "ALERT", glow: 72, motion: 58, density: 60, glass: 58, depth: 70, brightness: 82, accent: "#ff493d" },
    neon: { label: "NEON YELLOW", descriptor: "HIGH VIS", glow: 80, motion: 48, density: 62, glass: 56, depth: 64, brightness: 90, accent: "#f4ef55" },
    ice: { label: "ICE BLUE", descriptor: "COOLANT", glow: 58, motion: 46, density: 56, glass: 64, depth: 66, brightness: 78, accent: "#62c8ff" },
    emerald: { label: "EMERALD", descriptor: "FIELD", glow: 54, motion: 36, density: 60, glass: 68, depth: 62, brightness: 76, accent: "#4fe0a3" },
    violet: { label: "VIOLET", descriptor: "DEEP", glow: 68, motion: 40, density: 58, glass: 72, depth: 74, brightness: 74, accent: "#a77bff" },
    founder: { label: "FOUNDER MODE", descriptor: "ACE", glow: 74, motion: 52, density: 62, glass: 70, depth: 78, brightness: 84, accent: "#ff8a5b" }
  };

  const shell = document.getElementById("appShell");
  const surface = document.getElementById("worldSurface");
  const announcer = document.getElementById("routeAnnouncer");
  const focusReadout = document.getElementById("focusReadout");
  const aboutDialog = document.getElementById("aboutDialog");
  const aboutOpen = document.getElementById("aboutOpen");
  const audioState = document.getElementById("audioState");
  const footerVolume = document.getElementById("footerVolume");
  const volumeOutput = document.getElementById("volumeOutput");
  const startedAt = Date.now();

  const state = {
    route: normalizeRoute(window.location.hash),
    homeGauge: "cpu",
    telemetryTick: 0,
    telemetry: GAUGE_DEFINITIONS.map((item) => ({ ...item, percent: item.base })),
    playFilter: "all",
    playDistrict: 0,
    playCommand: 0,
    handoff: "Select a command to inspect its public handoff state.",
    liveLane: 0,
    diagnostic: "ready",
    audio: false,
    volume: 25,
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
    if (gauge.id === "storage") return `${243 + (gauge.percent - 91) * 2}GB FREE`;
    if (gauge.id === "network") {
      const down = (0.4 + (gauge.percent - 56) * 0.02).toFixed(1);
      const up = (0.8 + (gauge.percent - 56) * 0.03).toFixed(1);
      return `DL ${down} / UL ${up}`;
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
    document.getElementById("globalReadiness").textContent = readinessScore() >= 94 ? "SYSTEM NOMINAL" : "SYSTEM ADVISORY";
    document.getElementById("globalCpu").textContent = `DIAGNOSTICS ${readinessScore() >= 94 ? "READY" : "ADVISORY"}`;
    document.getElementById("globalThermal").textContent = `THERMAL ${thermal.percent}°C`;
    const storage = document.getElementById("globalStorage");
    if (storage) storage.textContent = gaugeDisplay(state.telemetry.find((item) => item.id === "storage"));
  }

  function updateClock() {
    const now = new Date();
    const clock = document.getElementById("clockDisplay");
    const date = document.getElementById("dateDisplay");
    const uptime = document.getElementById("uptimeDisplay");
    if (clock) clock.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (date) date.textContent = now.toLocaleDateString([], { weekday: "long", month: "short", day: "2-digit", year: "numeric" }).toUpperCase();
    if (uptime) {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const days = Math.floor(elapsed / 86400);
      const hours = Math.floor((elapsed % 86400) / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;
      uptime.textContent = `${days}D ${String(hours).padStart(2, "0")}H ${String(minutes).padStart(2, "0")}M ${String(seconds).padStart(2, "0")}S`;
    }
  }

  function syncAudioUI() {
    audioState.setAttribute("aria-pressed", String(state.audio));
    audioState.textContent = state.audio ? "AUDIO ON" : "MUTE";
    const workshopToggle = surface.querySelector('[data-action="toggle-audio"]');
    if (workshopToggle) workshopToggle.textContent = state.audio ? "MUTE AUDIO" : "ENABLE UI CUES";
  }

  function toggleAudio() {
    state.audio = !state.audio;
    syncAudioUI();
  }

  function setVolume(next) {
    state.volume = clamp(Number(next), 0, 100);
    footerVolume.value = String(state.volume);
    volumeOutput.value = String(state.volume);
    volumeOutput.textContent = String(state.volume);
  }

  function gaugeMarkup(gauge) {
    const selected = state.homeGauge === gauge.id;
    return `
      <button class="complication comp-${gauge.id}${selected ? " is-selected" : ""}" type="button" data-gauge="${gauge.id}" data-focus aria-pressed="${selected}" aria-label="${gauge.label}, ${gaugeDisplay(gauge)}. Show detail.">
        <span class="meter-arc" data-gauge-offset="${100 - gauge.percent}" aria-hidden="true"></span>
        <span class="tick-ring" aria-hidden="true"></span>
        <span class="gauge-copy"><small>${gauge.label}</small><strong data-gauge-value="${gauge.id}">${gaugeDisplay(gauge)}</strong><em>${gauge.hardware}</em></span>
      </button>`;
  }

  function renderHome() {
    const selected = state.telemetry.find((item) => item.id === state.homeGauge) || state.telemetry[0];
    const score = readinessScore();
    return `
      <section class="world world-home" aria-labelledby="homeTitle">
        <header class="home-heading">
          <p class="eyebrow">WELCOME HOME</p>
          <h1 id="homeTitle">SYSTEM NOMINAL</h1>
          <p>PUBLIC SYSTEM // BROWSER-LOCAL</p>
        </header>
        <div class="chronograph-system">
          <span class="chrono-ring ring-a" aria-hidden="true"></span><span class="chrono-ring ring-b" aria-hidden="true"></span><span class="chrono-ring ring-c" aria-hidden="true"></span>
          <div class="bridge-lines" aria-hidden="true"><span class="cpu-line"></span><span class="gpu-line"></span><span class="ram-line"></span><span class="storage-line"></span><span class="network-line"></span><span class="thermal-line"></span></div>
          <nav class="core-nav-beacons" aria-label="System Heart destination beacons">
            <button type="button" class="beacon-home" data-route="home" data-focus><span>HOME</span><strong>READY</strong></button>
            <button type="button" class="beacon-play" data-route="play" data-focus><span>PLAY</span><strong>COMMAND DECK</strong></button>
            <button type="button" class="beacon-live" data-route="live-world" data-focus><span>LIVE WORLD</span><strong>OBSERVATION</strong></button>
            <button type="button" class="beacon-diagnostics" data-route="diagnostics" data-focus><span>DIAGNOSTICS</span><strong>ADVISOR</strong></button>
            <button type="button" class="beacon-control" data-route="control" data-focus><span>CONTROL</span><strong>AUTHORITY</strong></button>
          </nav>
          ${state.telemetry.map(gaugeMarkup).join("")}
          <button class="system-heart" type="button" data-action="heart" data-focus aria-label="System Heart, readiness ${score} percent, mission ready">
            <span class="heart-bearing-ring" aria-hidden="true"></span><span class="heart-inner-ring" aria-hidden="true"></span>
            <span class="heart-core"><small>RUCA</small><em>SYSTEM HEART</em><strong data-heart-score>${score}%</strong><b>NOMINAL</b></span>
          </button>
        </div>
        <div class="home-caption" aria-live="polite">
          <strong>Engineering is the luxury.</strong>
          <p data-home-detail-copy>${selected.detail}</p>
          <div><span data-home-detail-label>${selected.label}</span><b data-home-detail-value>${gaugeDisplay(selected)}</b></div>
        </div>
      </section>`;
  }

  function updateHomeTelemetry() {
    state.telemetry.forEach((gauge) => {
      const button = surface.querySelector(`[data-gauge="${gauge.id}"]`);
      if (!button) return;
      const progress = button.querySelector(".meter-arc");
      const value = button.querySelector(`[data-gauge-value="${gauge.id}"]`);
      if (progress) progress.style.setProperty("--gauge-offset", String(100 - gauge.percent));
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
    const compactOrbit = window.matchMedia("(max-width: 720px)").matches;
    const allCommands = COMMAND_DISTRICTS.flatMap((group, districtIndex) => group.commands.map((item, commandIndex) => ({ item, districtIndex, commandIndex })));
    const nodes = allCommands.map(({ item, districtIndex, commandIndex }, index) => {
      const angle = -90 + index * (360 / allCommands.length);
      const radians = angle * (Math.PI / 180);
      const radius = 33 + (index % 3) * 5;
      const x = 50 + Math.cos(radians) * radius;
      const y = 48 + Math.sin(radians) * (radius * 0.7);
      const selected = districtIndex === state.playDistrict && commandIndex === state.playCommand;
      const groupId = COMMAND_DISTRICTS[districtIndex].id;
      let inDistrict = state.playFilter === "all" || state.playFilter === groupId || (state.playFilter === "favorites" && index % 5 === 0) || (state.playFilter === "recent" && index < 4);
      if (compactOrbit && state.playFilter === "all") inDistrict = districtIndex === state.playDistrict;
      return `<button type="button" class="command-node${selected ? " is-selected" : ""}${inDistrict ? " is-district" : " is-filtered-out"}" data-node-x="${x}" data-node-y="${y}" data-command="${commandIndex}" data-command-district="${districtIndex}" data-focus aria-pressed="${selected}" aria-label="Select ${item.label}, ${item.role}"><span>${item.code}</span><strong>${item.label}</strong><small>${item.readiness}</small></button>`;
    }).join("");

    return `
      <section class="world world-play" aria-labelledby="playTitle">
        <header class="mode-header">
          <p class="eyebrow">PLAY + APPS // ONE COMMAND WORLD</p>
          <h1 id="playTitle">COMMAND DISTRICTS</h1>
          <p>Enter a district, select a launch node, and let the center wheel assume command without leaving PLAY.</p>
        </header>
        <div class="district-rail" role="group" aria-label="Command districts">
          <button type="button" data-play-filter="all" data-focus aria-pressed="${state.playFilter === "all"}"><strong>ALL</strong><small>${allCommands.length}</small></button>
          <button type="button" data-play-filter="favorites" data-focus aria-pressed="${state.playFilter === "favorites"}"><strong>FAVORITES</strong><small>8</small></button>
          <button type="button" data-play-filter="recent" data-focus aria-pressed="${state.playFilter === "recent"}"><strong>RECENT</strong><small>4</small></button>
          ${COMMAND_DISTRICTS.map((item, index) => `<button type="button" data-district="${index}" data-focus aria-pressed="${state.playFilter === item.id}"><strong>${item.label} DISTRICT</strong><small>${item.commands.length}</small></button>`).join("")}
        </div>
        <div class="command-environment">
          <span class="command-orbit-ring orbit-ring-inner" aria-hidden="true"></span><span class="command-orbit-ring orbit-ring-middle" aria-hidden="true"></span><span class="command-orbit-ring orbit-ring-outer" aria-hidden="true"></span>
          ${nodes}
          <button class="command-center" type="button" data-action="safe-handoff" data-focus aria-label="Confirm safe public handoff for ${command.label}">
            <small>FAVORITE PORT</small><span>${command.code}</span><strong>${command.label}</strong><em>${command.role}</em><b>OPEN COMMAND</b>
          </button>
          <div class="command-orbit-readout"><span>${district.label} DISTRICT</span><strong>${String(state.playCommand + 1).padStart(2, "0")} / ${String(district.commands.length).padStart(2, "0")}</strong><small>${allCommands.length} DEMO COMMANDS // LOCAL SAFE HANDOFF</small></div>
        </div>
        <aside class="readiness-panel" role="status" aria-live="polite">
          <h2>LAUNCH READINESS</h2>
          <div class="status-grid">
            <div><span>GPU READINESS</span><strong>SEE DIAGNOSTICS</strong></div><div><span>VRAM</span><strong>SOURCE CHECK</strong></div><div><span>NETWORK LATENCY</span><strong>UNWIRED</strong></div>
            <div><span>CONTROLLER</span><strong>READY</strong></div><div><span>AUDIO</span><strong>MUTED DEFAULT</strong></div><div><span>STORAGE</span><strong>SEE HOME</strong></div>
          </div>
          <p>${state.handoff}</p>
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
        <header class="mode-header live-mode-header">
          <p class="eyebrow">RUCA INTELLIGENCE</p>
          <h1 id="liveTitle">LIVE WORLD CONCIERGE</h1>
          <p>Verified-looking conditions, signals and declared source status from one deterministic observation deck.</p>
        </header>
        <div class="live-layout">
          <nav class="lane-selector" aria-label="Live World lanes">
            <span>CONCIERGE</span>
            ${LIVE_LANES.map((item, index) => `<button type="button" data-lane="${index}" data-focus aria-current="${index === state.liveLane ? "true" : "false"}"><strong>${item.label}</strong><small>${item.source}</small></button>`).join("")}
          </nav>
          <article class="lane-stage">
            <header class="lane-heading"><p class="eyebrow">CONCIERGE // ${lane.label}</p><h2>${lane.title}</h2><small>${lane.sourceDetail}</small></header>
            <div class="briefing-main">
              <div class="lane-visual"><strong>${lane.visual}</strong><span>${lane.visualLabel}</span><p>${lane.summary}</p></div>
              <dl class="signal-grid">${lane.stats.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd><small>DEMO FIXTURE</small></div>`).join("")}</dl>
            </div>
            <div class="live-chart">${sparkline(lane.points, "lane-chart")}</div>
            <div class="forecast-strip">${lane.points.slice(0, 5).map((value, index) => `<div><span>DAY ${index + 1}</span><strong>${value}</strong><small>SIMULATED</small></div>`).join("")}</div>
            <footer class="lane-source"><span>${lane.source}</span><strong>${lane.sourceDetail}</strong><small>NO EXTERNAL REQUEST</small></footer>
          </article>
        </div>
      </section>`;
  }

  function renderDiagnostics() {
    const diagnostic = DIAGNOSTIC_STATES[state.diagnostic];
    return `
      <section class="world world-diagnostics severity-${state.diagnostic}" aria-labelledby="diagnosticsTitle">
        <div class="diag-shell">
          <aside class="sensor-groups">
            <p class="eyebrow">SENSOR GROUPS</p><h1 id="diagnosticsTitle">DIAGNOSTICS</h1>
            <div class="diagnostic-state-selector" role="group" aria-label="Simulated diagnostic states">
              ${Object.entries(DIAGNOSTIC_STATES).map(([id, item]) => `<button type="button" data-diagnostic="${id}" data-focus aria-pressed="${id === state.diagnostic}"><span>${item.short}</span><strong>${item.affected}</strong><small>${item.label}</small></button>`).join("")}
            </div>
            <div class="sensor-menu" aria-hidden="true"><span>CPU</span><span>RAM</span><span>THERMALS</span><span>STORAGE</span><span>NETWORK</span></div>
            <button class="scan-control" type="button" data-diagnostic="ready" data-focus>REFRESH TELEMETRY</button>
          </aside>
          <section class="rapid-lab" aria-labelledby="traceTitle">
            <header class="lab-topline">
              <div><p class="eyebrow">RUCA RAPID PC LAB</p><h2 id="traceTitle">${diagnostic.affected} STATUS</h2><strong>${diagnostic.label}</strong><p>${diagnostic.meaning}</p></div>
              <div class="health-core-mini" data-score="${diagnostic.score}"><small>SYSTEM HEALTH</small><strong>${diagnostic.score}%</strong><span>${diagnostic.short}</span></div>
            </header>
            <nav class="diagnostics-view-tabs" aria-label="Diagnostics views"><button type="button" data-focus aria-current="page">OVERVIEW</button><button type="button" data-focus>MACHINE HEALTH TIMELINE</button></nav>
            <div class="diag-overview-row"><div><span>SEVERITY</span><strong>${diagnostic.severity}</strong></div><div><span>LIVE READING</span><strong>${diagnostic.sensors[0][1]}</strong></div><div><span>LAST SCAN</span><strong>JUST NOW</strong></div></div>
            <section class="chart-panel"><header><h3>LIVE SIGNAL TRACE</h3><span>% // 9 SAMPLES</span></header>${sparkline(diagnostic.points, "diagnostic-chart")}</section>
            <div class="sensor-grid">${diagnostic.sensors.map(([label, value, status]) => `<div><span>${label}</span><strong>${value}</strong><small>${status}</small></div>`).join("")}</div>
          </section>
          <aside class="guardian-console" aria-live="polite">
            <p class="eyebrow">GUARDIAN CONSOLE</p><h2>TRIAGE</h2>
            <dl>
              <div><dt>WHAT HAPPENED</dt><dd>${diagnostic.meaning}</dd></div>
              <div><dt>WHY IT MATTERS</dt><dd>${diagnostic.matters}</dd></div>
              <div><dt>CHECK FIRST</dt><dd>${diagnostic.check}</dd></div>
              <div><dt>NEXT ACTION</dt><dd>${diagnostic.action}</dd></div>
            </dl>
            <div class="guardian-alert"><strong>${diagnostic.label}</strong><small>${diagnostic.affected} // SIMULATED</small></div>
          </aside>
        </div>
      </section>`;
  }

  function controlRange(id, label, owner) {
    const value = state.settings[id];
    return `<label class="control-range"><span><strong>${label}</strong><small>${owner}</small></span><input type="range" min="0" max="100" step="1" value="${value}" data-control="${id}" data-focus><output for="control-${id}" data-control-output="${id}">${value}</output></label>`;
  }

  function renderControl() {
    const activePreset = PRESETS[state.settings.preset];
    return `
      <section class="world world-control" aria-labelledby="controlTitle">
        <header class="mode-header control-mode-header">
          <p class="eyebrow">COMMAND AUTHORITY</p>
          <h1 id="controlTitle">CONTROL WORKSHOP</h1>
          <p>One command surface for RUCA's appearance, atmosphere, input and local simulation state.</p>
        </header>
        <div class="control-layout">
          <aside class="preset-console">
            <div class="profile-reactor"><span>ACTIVE PROFILE</span><strong>${activePreset ? activePreset.label : "CUSTOM COMMAND"}</strong><small>Local UI command state</small></div>
            <div class="preset-list" role="group" aria-label="Visual presets">
              ${Object.entries(PRESETS).map(([id, preset]) => `<button type="button" data-preset="${id}" data-focus aria-pressed="${state.settings.preset === id}"><span data-swatch="${preset.accent}"></span><strong>${preset.label}</strong><small>${preset.descriptor}</small></button>`).join("")}
            </div>
            <div class="control-actions"><button type="button" data-focus>APPLY COMMAND</button><button class="reset-control" type="button" data-action="reset-controls" data-focus>RESET DEFAULT</button></div>
          </aside>
          <section class="control-cards">
            <div class="control-status-strip"><div><span>PROFILE</span><strong>${activePreset ? activePreset.label : "CUSTOM"}</strong><small>Theme applies locally</small></div><div><span>BRIDGE</span><strong>SIMULATION ONLY</strong><small>No device controls</small></div><div><span>MOTION</span><strong>${state.settings.motion > 55 ? "EXPRESSIVE" : "RESTRAINED"}</strong><small>Reduced motion supported</small></div><div><span>STARS</span><strong>CUSTOM FIELD</strong><small>Passive shell atmosphere</small></div></div>
            <details class="control-section" open><summary><span>COMMAND CONTROLS</span><strong>Volume, brightness, power and settings</strong></summary><div class="command-control-grid">${controlRange("glow", "GLOW", "REACTOR / GAUGES")}${controlRange("brightness", "COCKPIT BRIGHTNESS", "WHOLE SHELL")}<button type="button" data-action="toggle-audio" data-focus>${state.audio ? "MUTE AUDIO" : "ENABLE UI CUES"}</button><button type="button" data-focus>POWER STANDBY</button><div class="command-state"><span>COMMAND STATE</span><strong>READY</strong><small>Local cockpit controls are online.</small></div></div></details>
            <details class="control-section"><summary><span>GLOBAL THEME</span><strong>RUCA environment color bus</strong></summary><div class="control-section-body"><label class="accent-control"><span><strong>ACCENT</strong><small>CUSTOMIZABLE UI COLOR</small></span><input type="color" value="${state.settings.accent}" data-control="accent" data-focus aria-label="RUCA accent color"><output data-control-output="accent">${state.settings.accent.toUpperCase()}</output></label>${controlRange("density", "DENSITY", "INFORMATION SPACING")}</div></details>
            <details class="control-section"><summary><span>REACTOR / GAUGES</span><strong>Glow and gauge response</strong></summary><div class="control-section-body">${controlRange("motion", "MOTION", "ANIMATION BUDGET")}${controlRange("depth", "DEPTH", "BACKGROUND LAYERS")}</div></details>
            <details class="control-section"><summary><span>PANELS / GLASS</span><strong>Material intensity</strong></summary><div class="control-section-body">${controlRange("glass", "GLASS", "PANEL MATERIAL")}</div></details>
          </section>
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
      const nav = document.querySelector(".world-nav");
      const active = nav && nav.querySelector(`[data-route="${state.route}"]`);
      surface.scrollTop = 0;
      if (nav && active && nav.scrollWidth > nav.clientWidth + 2) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
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
    state.playFilter = COMMAND_DISTRICTS[state.playDistrict].id;
    state.playCommand = 0;
    state.handoff = `District changed to ${COMMAND_DISTRICTS[state.playDistrict].label}. Select a command to inspect its safe handoff.`;
    renderActiveWorld({ focusSelector: `[data-district="${state.playDistrict}"]` });
  }

  function selectPlayFilter(filter) {
    if (!["all", "favorites", "recent"].includes(filter)) return;
    state.playFilter = filter;
    state.handoff = `${filter.toUpperCase()} command view selected. Every handoff remains browser-local and simulated.`;
    renderActiveWorld({ focusSelector: `[data-play-filter="${filter}"]` });
  }

  function selectCommand(index, districtIndex) {
    if (Number.isFinite(districtIndex)) state.playDistrict = clamp(districtIndex, 0, COMMAND_DISTRICTS.length - 1);
    const district = COMMAND_DISTRICTS[state.playDistrict];
    state.playCommand = clamp(index, 0, district.commands.length - 1);
    const command = district.commands[state.playCommand];
    state.handoff = `${command.label} selected. Native execution is disabled in the public simulation.`;
    renderActiveWorld({ focusSelector: `[data-command-district="${state.playDistrict}"][data-command="${state.playCommand}"]` });
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
    const playFilter = event.target.closest("[data-play-filter]");
    if (playFilter) return selectPlayFilter(playFilter.dataset.playFilter);
    const command = event.target.closest("[data-command]");
    if (command) return selectCommand(Number(command.dataset.command), Number(command.dataset.commandDistrict));
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
    if (action.dataset.action === "toggle-audio") toggleAudio();
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

  audioState.addEventListener("click", toggleAudio);
  footerVolume.addEventListener("input", () => setVolume(footerVolume.value));
  document.getElementById("volumeDown").addEventListener("click", () => setVolume(state.volume - 5));
  document.getElementById("volumeUp").addEventListener("click", () => setVolume(state.volume + 5));

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js", { scope: "/" }).then((registration) => registration.update()).catch(() => {});
    });
  }

  applySettings();
  updateGlobalStatus();
  updateClock();
  syncAudioUI();
  setVolume(state.volume);
  renderActiveWorld();
  if (!window.location.hash) history.replaceState(null, "", "#home");
  restoreRouteViewport();
  window.setInterval(telemetryStep, 2800);
  window.setInterval(updateClock, 1000);
  registerServiceWorker();
})();
