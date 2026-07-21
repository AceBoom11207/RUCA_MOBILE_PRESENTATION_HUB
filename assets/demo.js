(function () {
"use strict";

// The public root belongs to Anthony's recruiter-facing portfolio. Keep the
// interactive RUCA prototype on its explicit /index.html route, including for
// visitors whose browsers still have an older demo service worker installed.
if (window.location.pathname === "/" || window.location.pathname === "") {
  window.location.replace("/portfolio/");
}

  const data = window.RUCA_DEMO_DATA;
  if (window.RUCA_DEMO_MODE !== true || !data) {
    throw new Error("RUCA Mobile Demo requires its explicit local demo-data layer.");
  }

  const root = document.documentElement;
  const body = document.body;
  const surface = document.getElementById("appSurface");
  const toast = document.getElementById("toast");
  const commandDialog = document.getElementById("commandDialog");
  const searchDialog = document.getElementById("searchDialog");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const virtualKeyboard = document.getElementById("virtualKeyboard");
  const installButton = document.getElementById("installButton");
  const offlineState = document.getElementById("offlineState");
  const connectionState = document.getElementById("connectionState");
  const canvas = document.getElementById("starfield");
  const context = canvas.getContext("2d", { alpha: true });
  const storageKey = "ruca-mobile-demo-controls-v1";
  const routeOrder = ["home", "play", "live", "diagnostics", "control"];
  const controlKeys = ["glow", "motion", "density", "glass", "depth", "brightness", "accent"];
  const defaultControls = data.controls.defaults;
  const metrics = {
    routeTransitions: 0,
    animationOwners: 1,
    nativeExecutionAttempts: 0,
    networkCalls: 0,
    renderOwner: "RUCA_MOBILE_DEMO",
    lastRenderedRoute: "home"
  };

  let deferredInstallPrompt = null;
  let toastTimer = 0;
  let sequenceTimer = 0;
  let frameId = 0;
  let lastFrameTime = 0;
  let resizeTimer = 0;
  let stars = [];
  let width = 0;
  let height = 0;
  let pixelRatio = 1;

  const state = {
    route: "home",
    district: "games",
    realm: "weather",
    diagnosticMode: "ready",
    selectedCommand: null,
    controls: loadControls()
  };
  const initialHash = window.location.hash.slice(1).toLowerCase();
  if (routeOrder.includes(initialHash)) state.route = initialHash;

  function loadControls() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!saved || typeof saved !== "object") return { ...defaultControls };
      return controlKeys.reduce((next, key) => {
        next[key] = Object.prototype.hasOwnProperty.call(saved, key) ? saved[key] : defaultControls[key];
        return next;
      }, {});
    } catch (_) {
      return { ...defaultControls };
    }
  }

  function saveControls() {
    localStorage.setItem(storageKey, JSON.stringify(state.controls));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function applyControls() {
    const numeric = ["glow", "motion", "density", "glass", "depth", "brightness"];
    numeric.forEach((key) => {
      state.controls[key] = clamp(Number(state.controls[key]) || 0, 0, 100);
      root.style.setProperty(`--${key}`, String(state.controls[key] / 100));
    });
    root.style.setProperty("--accent", state.controls.accent);
    root.style.setProperty("--bright", mixWithWhite(state.controls.accent, 0.38));
    const rgb = hexToRgb(state.controls.accent);
    root.style.setProperty("--accent-rgb", `${rgb.r} ${rgb.g} ${rgb.b}`);
    root.style.setProperty("--depth-alpha", String(0.018 + state.controls.depth * 0.00105));
    root.style.setProperty("--haze-alpha", String(0.025 + state.controls.depth * 0.00125));
    root.style.setProperty("--glow-sm", `${2 + state.controls.glow * 0.1}px`);
    root.style.setProperty("--glow-md", `${8 + state.controls.glow * 0.3}px`);
    root.style.setProperty("--glow-lg", `${18 + state.controls.glow * 0.7}px`);
    root.style.setProperty("--glass-blur", `${2 + state.controls.glass * 0.16}px`);
    root.style.setProperty("--motion-slow", `${120 - state.controls.motion * 1.1}s`);
    root.style.setProperty("--motion-medium", `${8 - state.controls.motion * 0.07}s`);
    root.style.setProperty("--motion-bearing", `${95 - state.controls.motion * 0.82}s`);
    if (surface.querySelector(".control-bank")) updateControlReadouts();
  }

  function hexToRgb(hex) {
    const clean = String(hex).replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(clean)) return { r: 214, g: 179, b: 107 };
    const value = parseInt(clean, 16);
    return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
  }

  function mixWithWhite(hex, amount) {
    const clean = String(hex).replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(clean)) return "#f5d98f";
    const value = parseInt(clean, 16);
    const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
    const mixed = channels.map((channel) => Math.round(channel + (255 - channel) * amount));
    return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2300);
  }

  function setRoute(route, options) {
    if (!routeOrder.includes(route)) return;
    state.route = route;
    metrics.routeTransitions += 1;
    metrics.lastRenderedRoute = route;
    body.dataset.route = route;
    if (!options || options.history !== false) history.replaceState(null, "", `#${route}`);
    document.querySelectorAll(".bottom-nav [data-route]").forEach((button) => {
      const active = button.dataset.route === route;
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    renderRoute();
    if (!options || options.focus !== false) surface.focus({ preventScroll: true });
  }

  function renderRoute() {
    const renderers = {
      home: renderHome,
      play: renderPlay,
      live: renderLive,
      diagnostics: renderDiagnostics,
      control: renderControl
    };
    surface.innerHTML = renderers[state.route]();
    surface.scrollTop = 0;
    applyControls();
  }

  function renderHome() {
    const gaugeClass = {
      cpu: "gauge-cpu",
      gpu: "gauge-gpu",
      ram: "gauge-ram",
      storage: "gauge-storage",
      network: "gauge-network",
      thermal: "gauge-thermal"
    };
    const gauges = data.home.gauges.map((gauge) => `
      <div class="machine-gauge ${gaugeClass[gauge.id]}">
        <button type="button" data-route="diagnostics" data-testid="home-gauge-${gauge.id}" aria-label="Open demonstration diagnostics for ${escapeHtml(gauge.label)}">
          <span>${escapeHtml(gauge.label)}</span>
          <strong>${escapeHtml(gauge.value)}</strong>
          <small>${escapeHtml(gauge.detail)}</small>
        </button>
      </div>`).join("");

    const paths = [
      "M84 100 L136 198", "M84 260 L104 260", "M84 420 L136 322",
      "M316 100 L264 198", "M316 260 L296 260", "M316 420 L264 322"
    ].map((d) => `<path class="conduit-rail" d="${d}"></path><path class="conduit-current" d="${d}"></path>`).join("");

    return `
      <section class="world home-world" data-testid="world-home">
        <div class="home-readiness">
          <div>
            <span class="eyebrow">COMMAND CENTER // LOCAL DEMO</span>
            <h1>WELCOME HOME</h1>
          </div>
          <div class="readiness-score"><strong>${data.home.score}</strong><span>${escapeHtml(data.home.state)}</span></div>
        </div>
        <div class="home-reactor-stage" aria-label="RUCA demonstration system heart and machine gauges">
          <svg class="conduit-map" viewBox="0 0 400 520" preserveAspectRatio="none" aria-hidden="true">${paths}</svg>
          <div class="system-heart" data-testid="system-heart">
            <div class="heart-content">
              <span>SYSTEM HEART</span>
              <strong>${data.home.score}%</strong>
              <small>${escapeHtml(data.home.state)}</small>
            </div>
          </div>
          ${gauges}
        </div>
        <div class="mission-rail">
          <b>DEMO SAMPLE</b>
          <p>${escapeHtml(data.home.summary)} No workstation telemetry is read or exposed.</p>
        </div>
        <section class="portable-showroom" aria-labelledby="showroomTitle">
          <div>
            <span class="eyebrow">PORTABLE SHOWROOM</span>
            <h2 id="showroomTitle">The product and the work behind it.</h2>
            <p>Explore the RUCA case study and privacy-safe public resume without leaving this installed app.</p>
          </div>
          <div class="showroom-destinations">
            <a href="portfolio/index.html">
              <span>PORTFOLIO</span>
              <small>Product case study</small>
            </a>
            <a href="resume/Anthony_Moncion_Google_Maps_Interaction_Designer_Resume.pdf" target="_blank" rel="noopener">
              <span>VIEW RESUME</span>
              <small>Open public PDF</small>
            </a>
            <a href="resume/Anthony_Moncion_Google_Maps_Interaction_Designer_Resume.pdf" download="Anthony_Moncion_Google_Maps_Interaction_Designer_Resume.pdf">
              <span>DOWNLOAD</span>
              <small>Save public resume</small>
            </a>
            <button type="button" data-showroom-action="share" data-share-target=".">
              <span>SHARE</span>
              <small>Send presentation hub</small>
            </button>
            <button type="button" data-showroom-action="copy" data-share-target=".">
              <span>COPY LINK</span>
              <small>Copy public hub URL</small>
            </button>
          </div>
          <p class="showroom-action-status" id="showroomActionStatus" role="status" aria-live="polite"></p>
        </section>
      </section>`;
  }

  function renderPlay() {
    const district = data.play.districts.find((item) => item.id === state.district) || data.play.districts[0];
    const switcher = data.play.districts.map((item) => `
      <button type="button" data-district="${item.id}" class="${item.id === district.id ? "active" : ""}" aria-pressed="${item.id === district.id}">${escapeHtml(item.label.replace(" District", ""))}</button>`).join("");
    const commands = district.commands.map((command) => `
      <button type="button" class="command-module" data-command="${command.id}" data-testid="play-command-${command.id}">
        <span class="command-icon" aria-hidden="true">${escapeHtml(command.label.slice(0, 2).toUpperCase())}</span>
        <span class="command-copy"><strong>${escapeHtml(command.label)}</strong><small>${escapeHtml(command.role)}</small></span>
        <span class="command-status">${escapeHtml(command.status)}</span>
      </button>`).join("");

    return `
      <section class="world" data-testid="world-play">
        <header class="world-header">
          <span class="eyebrow">DEPLOYMENT BAY // SAFE PREVIEWS</span>
          <h1>Command districts</h1>
          <p>Select a destination. Every action remains inside this demonstration.</p>
        </header>
        <nav class="district-switcher" aria-label="Command districts">${switcher}</nav>
        <section class="district-focus">
          <div class="district-focus-head">
            <div class="district-emblem" aria-hidden="true">${escapeHtml(district.label.slice(0, 1))}</div>
            <div><h2>${escapeHtml(district.label)}</h2><p>${escapeHtml(district.description)}</p></div>
          </div>
          <div class="command-array">${commands}</div>
        </section>
        <span class="fixture-label">DEMO COMMAND REGISTRY // NO NATIVE TARGETS</span>
      </section>`;
  }

  function renderLive() {
    const realms = ["weather", "markets", "news", "sports", "tech"];
    const switcher = realms.map((realm) => `
      <button type="button" data-realm="${realm}" class="${realm === state.realm ? "active" : ""}" aria-pressed="${realm === state.realm}">${realm.toUpperCase()}</button>`).join("");
    const realmRenderers = {
      weather: renderWeather,
      markets: renderMarkets,
      news: renderNews,
      sports: renderSports,
      tech: renderTech
    };
    return `
      <section class="world" data-testid="world-live">
        <header class="world-header">
          <span class="eyebrow">LIVE WORLD // CACHED DEMONSTRATION</span>
          <h1>Observation windows</h1>
          <p>Five deterministic realms, always available without a network.</p>
        </header>
        <nav class="realm-switcher" aria-label="Live World realms">${switcher}</nav>
        <div class="live-stage" data-testid="live-realm-${state.realm}">${realmRenderers[state.realm]()}</div>
      </section>`;
  }

  function renderWeather() {
    const weather = data.live.weather;
    const forecast = weather.forecast.map((day) => `
      <div class="forecast-day"><span>${day.day}</span><b>${day.high}\u00b0 / ${day.low}\u00b0</b><small>${day.state}</small></div>`).join("");
    return `
      <section class="weather-environment" aria-label="Weather demonstration">
        <div class="weather-now">
          <span class="fixture-label">DEMO WEATHER FIXTURE</span>
          <div class="weather-location">${escapeHtml(weather.location)}</div>
          <div class="weather-temp">${escapeHtml(weather.temperature)}</div>
          <div class="weather-condition">${escapeHtml(weather.condition)}</div>
          <div class="weather-feels">${escapeHtml(weather.feels)}</div>
        </div>
        <div class="weather-metrics">
          <div class="weather-metric"><span>WIND</span><b>${weather.wind}</b></div>
          <div class="weather-metric"><span>HUMIDITY</span><b>${weather.humidity}</b></div>
          <div class="weather-metric"><span>SUNRISE</span><b>${weather.sunrise}</b></div>
          <div class="weather-metric"><span>SUNSET</span><b>${weather.sunset}</b></div>
        </div>
        <div class="forecast-strip">${forecast}</div>
      </section>`;
  }

  function sparkline(points) {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const span = Math.max(1, max - min);
    const plot = points.map((point, index) => {
      const x = (index / (points.length - 1)) * 120;
      const y = 36 - ((point - min) / span) * 28;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    return `<svg class="sparkline" viewBox="0 0 120 42" preserveAspectRatio="none" aria-hidden="true"><polyline points="${plot}"></polyline></svg>`;
  }

  function renderMarkets() {
    const markets = data.live.markets;
    const indices = markets.indices.map((index) => `
      <div class="market-row">
        <strong>${index.symbol}</strong>
        ${sparkline(index.points)}
        <div class="market-value"><b>${index.value}</b><span class="${index.change.startsWith("-") ? "down" : ""}">${index.change}</span></div>
      </div>`).join("");
    const movers = markets.movers.map((mover) => `<div class="mover ${mover.tone}"><b>${mover.symbol}</b><span>${mover.move}</span></div>`).join("");
    return `
      <section class="market-hero"><span class="fixture-label">DEMO MARKET FIXTURE</span><div class="market-condition">SESSION CONDITION</div><h2>${escapeHtml(markets.condition)}</h2></section>
      <div class="market-indices">${indices}</div>
      <div class="mover-strip" aria-label="Demonstration top movers">${movers}</div>`;
  }

  function renderNews() {
    const news = data.live.news;
    const stories = news.stories.map((story) => `
      <article class="timeline-story"><span>${escapeHtml(story.source)} // ${escapeHtml(story.time)}</span><h3>${escapeHtml(story.title)}</h3></article>`).join("");
    return `
      <article class="news-hero">
        <span class="fixture-label">DEMO NEWS FIXTURE</span>
        <div class="news-source">${escapeHtml(news.hero.source)} // ${escapeHtml(news.hero.time)}</div>
        <h2>${escapeHtml(news.hero.title)}</h2>
        <p>${escapeHtml(news.hero.summary)}</p>
      </article>
      <div class="story-timeline">${stories}</div>`;
  }

  function renderSports() {
    const sports = data.live.sports;
    const games = sports.games.map((game) => `
      <div class="schedule-game"><span>${game.league}</span><b>${escapeHtml(game.away)} at ${escapeHtml(game.home)}</b><time>${escapeHtml(game.time)}</time></div>`).join("");
    return `
      <section class="sports-hero">
        <div class="matchup">
          <span class="fixture-label">DEMO SPORTS FIXTURE</span>
          <div class="sports-league">${sports.hero.league} // ${sports.hero.state}</div>
          <div class="matchup-score">
            <div><span class="team-code">${sports.hero.away}</span><strong class="team-score">${sports.hero.awayScore}</strong></div>
            <span class="versus">AT</span>
            <div><span class="team-code">${sports.hero.home}</span><strong class="team-score">${sports.hero.homeScore}</strong></div>
          </div>
        </div>
      </section>
      <div class="schedule-ribbon">${games}</div>`;
  }

  function renderTech() {
    const tech = data.live.tech;
    const signals = tech.signals.map((signal) => `
      <article class="tech-signal-row"><span>${escapeHtml(signal.category)}</span><h3>${escapeHtml(signal.title)}</h3></article>`).join("");
    return `
      <article class="tech-hero">
        <span class="fixture-label">DEMO TECH FIXTURE</span>
        <div class="tech-signal">${escapeHtml(tech.hero.signal)} SIGNAL</div>
        <h2>${escapeHtml(tech.hero.title)}</h2>
        <p>${escapeHtml(tech.hero.summary)}</p>
      </article>
      <div class="signal-list">${signals}</div>`;
  }

  function renderDiagnostics() {
    const diagnostic = data.diagnostics[state.diagnosticMode];
    const sensors = data.diagnostics.sensors.map((sensor) => `
      <div class="sensor-row"><span>${escapeHtml(sensor.label)}</span><b>${escapeHtml(sensor[state.diagnosticMode])}</b></div>`).join("");
    return `
      <section class="world" data-testid="world-diagnostics">
        <header class="world-header">
          <span class="eyebrow">GUARDIAN LAB // EDUCATIONAL DEMO</span>
          <h1>RUCA has your back</h1>
          <p>Switch between two labeled demonstration states to see how Guardian explains machine health.</p>
        </header>
        <div class="segmented-control diagnostic-mode" aria-label="Diagnostic demonstration state">
          <button type="button" data-diagnostic="ready" class="${state.diagnosticMode === "ready" ? "active" : ""}" aria-pressed="${state.diagnosticMode === "ready"}">MISSION READY</button>
          <button type="button" data-diagnostic="advisory" class="${state.diagnosticMode === "advisory" ? "active" : ""}" aria-pressed="${state.diagnosticMode === "advisory"}">ADVISORY EXAMPLE</button>
        </div>
        <section class="advisor-stage">
          <div class="health-ring"><div><strong>${diagnostic.score}</strong><span>${diagnostic.severity}</span></div></div>
          <div class="advisor-copy"><span class="fixture-label">DEMO STATE</span><h2>${escapeHtml(diagnostic.affected)}</h2><p>${escapeHtml(diagnostic.meaning)}</p></div>
        </section>
        <div class="guardian-grid">
          <div class="guardian-field"><span>WHAT IT MEANS</span><p>${escapeHtml(diagnostic.meaning)}</p></div>
          <div class="guardian-field"><span>WHY IT MATTERS</span><p>${escapeHtml(diagnostic.matters)}</p></div>
          <div class="guardian-field"><span>CHECK FIRST</span><p>${escapeHtml(diagnostic.check)}</p></div>
          <div class="guardian-field"><span>NEXT ACTION</span><p>${escapeHtml(diagnostic.action)}</p></div>
        </div>
        <div class="sensor-readouts">${sensors}</div>
      </section>`;
  }

  function renderControl() {
    const presets = data.controls.presets.map((preset) => `
      <button type="button" data-preset="${preset.id}" data-accent="${preset.accent}"><span class="swatch-dot" style="--swatch:${preset.accent}"></span>${escapeHtml(preset.label)}</button>`).join("");
    const controls = [
      ["glow", "Glow intensity", "Reactor and focus illumination"],
      ["motion", "Motion intensity", "Starfield and conduit speed"],
      ["density", "Star density", "Visible environmental particles"],
      ["glass", "Glass intensity", "Instrument translucency"],
      ["depth", "Background depth", "Atmospheric separation"],
      ["brightness", "Brightness", "Cockpit luminance"]
    ].map(([key, label, description]) => `
      <div class="control-row">
        <div><label for="control-${key}">${label}</label><small>${description}</small></div>
        <div class="range-wrap">
          <input id="control-${key}" data-control="${key}" type="range" min="0" max="100" value="${state.controls[key]}" style="--fill:${state.controls[key]}%">
          <output class="control-value" id="output-${key}" for="control-${key}">${state.controls[key]}</output>
        </div>
      </div>`).join("");

    return `
      <section class="world" data-testid="world-control">
        <header class="world-header">
          <span class="eyebrow">COMMAND AUTHORITY // LOCAL ONLY</span>
          <h1>Tune the atmosphere</h1>
          <p>Every control previews immediately and persists only in this browser.</p>
        </header>
        <div class="control-status"><div><b>Mobile demo controls</b><span>No bridge, host, or system authority</span></div><span class="fixture-label">DEMO SAFE</span></div>
        <div class="preset-swatches" aria-label="Theme presets">${presets}</div>
        <div class="color-row"><label for="accentColor">Custom accent <input id="accentColor" data-color-control="accent" type="color" value="${escapeHtml(state.controls.accent)}"></label></div>
        <div class="control-bank">${controls}</div>
        <div class="control-actions">
          <button type="button" class="primary-action" data-control-action="save">SAVE LOCALLY</button>
          <button type="button" class="secondary-action" data-control-action="reset">RESET DEMO</button>
        </div>
      </section>`;
  }

  function findCommand(id) {
    for (const district of data.play.districts) {
      const command = district.commands.find((item) => item.id === id);
      if (command) return { ...command, district: district.label };
    }
    return null;
  }

  function openCommand(id) {
    const command = findCommand(id);
    if (!command) return;
    state.selectedCommand = command;
    document.getElementById("commandTitle").textContent = command.label;
    document.getElementById("commandRole").textContent = `${command.district} // ${command.role}`;
    document.getElementById("commandNotice").textContent = `DEMO MODE - This command would launch ${command.label} on the RUCA host system. No application, URL, file, or native process will be opened here.`;
    document.getElementById("sequenceStatus").textContent = "";
    if (!commandDialog.open) commandDialog.showModal();
  }

  function simulateLaunch() {
    if (!state.selectedCommand) return;
    clearTimeout(sequenceTimer);
    const status = document.getElementById("sequenceStatus");
    status.textContent = `DEMO SEQUENCE // Preparing ${state.selectedCommand.label} preview...`;
    sequenceTimer = window.setTimeout(() => {
      status.textContent = "DEMO COMPLETE // Safe handoff preview confirmed. Nothing was launched.";
    }, 520);
  }

  function closeDialog(id) {
    const dialog = document.getElementById(id);
    if (dialog && dialog.open) dialog.close();
  }

  function openSearch() {
    renderSearchResults();
    if (!searchDialog.open) searchDialog.showModal();
    searchInput.focus();
  }

  function buildSearchIndex() {
    const routes = [
      { type: "route", id: "home", label: "HOME", detail: "Command Center" },
      { type: "route", id: "play", label: "PLAY", detail: "Command districts" },
      { type: "route", id: "live", label: "LIVE WORLD", detail: "Observation windows" },
      { type: "route", id: "diagnostics", label: "DIAGNOSTICS", detail: "Guardian Lab" },
      { type: "route", id: "control", label: "CONTROL", detail: "Atmosphere controls" }
    ];
    const showroom = [
      { type: "showroom", id: "portfolio", label: "PORTFOLIO", detail: "RUCA product case study" },
      { type: "showroom", id: "resume", label: "RESUME", detail: "Project entry and certification" }
    ];
    const realms = ["weather", "markets", "news", "sports", "tech"].map((realm) => ({
      type: "realm",
      id: realm,
      label: realm.toUpperCase(),
      detail: "Live World realm"
    }));
    const commands = data.play.districts.flatMap((district) => district.commands.map((command) => ({
      type: "command",
      id: command.id,
      label: command.label,
      detail: `${district.label} // ${command.role}`
    })));
    return routes.concat(showroom, realms, commands);
  }

  const searchIndex = buildSearchIndex();

  function renderSearchResults() {
    const query = searchInput.value.trim().toLowerCase();
    const matches = searchIndex.filter((item) => !query || `${item.label} ${item.detail}`.toLowerCase().includes(query)).slice(0, 6);
    searchResults.innerHTML = matches.length ? matches.map((item) => `
      <button type="button" class="search-result" data-search-type="${item.type}" data-search-id="${item.id}">
        <span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.detail)}</small></span>
        <span>${item.type === "command" ? "PREVIEW" : "ENTER"}</span>
      </button>`).join("") : `<div class="guardian-field"><span>NO MATCH</span><p>Try a world name or demonstration command.</p></div>`;
  }

  function buildVirtualKeyboard() {
    const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
    virtualKeyboard.innerHTML = rows.flatMap((row) => row.split("").map((key) => `<button type="button" data-key="${key}">${key}</button>`)).join("") +
      `<button type="button" class="key-wide" data-key="BACK">BACK</button><button type="button" class="key-space" data-key="SPACE">SPACE</button><button type="button" class="key-wide" data-key="CLEAR">CLEAR</button>`;
  }

  function handleVirtualKey(key) {
    if (key === "BACK") searchInput.value = searchInput.value.slice(0, -1);
    else if (key === "SPACE") searchInput.value += " ";
    else if (key === "CLEAR") searchInput.value = "";
    else searchInput.value += key.toLowerCase();
    renderSearchResults();
    searchInput.focus();
  }

  function updateControlReadouts() {
    document.querySelectorAll("[data-control]").forEach((input) => {
      const key = input.dataset.control;
      input.value = state.controls[key];
      input.style.setProperty("--fill", `${state.controls[key]}%`);
      const output = document.getElementById(`output-${key}`);
      if (output) output.value = state.controls[key];
    });
    const accent = document.getElementById("accentColor");
    if (accent) accent.value = state.controls.accent;
  }

  function handleClick(event) {
    const target = event.target.closest("button");
    if (!target) return;

    if (target.dataset.route) {
      setRoute(target.dataset.route);
      return;
    }
    if (target.dataset.district) {
      state.district = target.dataset.district;
      renderRoute();
      return;
    }
    if (target.dataset.realm) {
      state.realm = target.dataset.realm;
      renderRoute();
      return;
    }
    if (target.dataset.diagnostic) {
      state.diagnosticMode = target.dataset.diagnostic;
      renderRoute();
      return;
    }
    if (target.dataset.command) {
      openCommand(target.dataset.command);
      return;
    }
    if (target.dataset.closeDialog) {
      closeDialog(target.dataset.closeDialog);
      return;
    }
    if (target.dataset.key) {
      handleVirtualKey(target.dataset.key);
      return;
    }
    if (target.dataset.searchType) {
      if (target.dataset.searchType === "route") {
        closeDialog("searchDialog");
        setRoute(target.dataset.searchId);
      } else if (target.dataset.searchType === "showroom") {
        closeDialog("searchDialog");
        window.location.assign(target.dataset.searchId === "resume" ? "portfolio/index.html#resume" : "portfolio/index.html");
      } else if (target.dataset.searchType === "realm") {
        state.realm = target.dataset.searchId;
        closeDialog("searchDialog");
        setRoute("live");
      } else {
        closeDialog("searchDialog");
        openCommand(target.dataset.searchId);
      }
      return;
    }
    if (target.dataset.preset) {
      state.controls.accent = target.dataset.accent;
      applyControls();
      saveControls();
      showToast(`${target.textContent.trim()} DEMO THEME APPLIED`);
      return;
    }
    if (target.dataset.controlAction === "save") {
      saveControls();
      showToast("DEMO SETTINGS SAVED ON THIS DEVICE");
      return;
    }
    if (target.dataset.controlAction === "reset") {
      state.controls = { ...defaultControls };
      applyControls();
      saveControls();
      renderRoute();
      showToast("DEMO SETTINGS RESET");
      return;
    }
    if (target.id === "searchOpen") {
      openSearch();
      return;
    }
    if (target.id === "simulateLaunch") {
      simulateLaunch();
    }
  }

  function handleInput(event) {
    const target = event.target;
    if (target === searchInput) {
      renderSearchResults();
      return;
    }
    if (target.matches("[data-control]")) {
      const key = target.dataset.control;
      state.controls[key] = Number(target.value);
      target.style.setProperty("--fill", `${target.value}%`);
      const output = document.getElementById(`output-${key}`);
      if (output) output.value = target.value;
      applyControls();
      saveControls();
      if (key === "density") createStars();
      return;
    }
    if (target.matches("[data-color-control='accent']")) {
      state.controls.accent = target.value;
      applyControls();
      saveControls();
    }
  }

  function updateOfflineState() {
    if (!navigator.onLine) {
      offlineState.textContent = "OFFLINE ACTIVE";
      offlineState.classList.add("ready");
      connectionState.textContent = "LOCAL FIXTURES";
    } else if (offlineState.dataset.cached === "true") {
      offlineState.textContent = "OFFLINE READY";
      offlineState.classList.add("ready");
    } else {
      offlineState.textContent = "OFFLINE CHECKING";
      offlineState.classList.remove("ready");
    }
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      offlineState.textContent = "OFFLINE UNSUPPORTED";
      return;
    }
    try {
      await navigator.serviceWorker.register("service-worker.js", { scope: "./" });
      await navigator.serviceWorker.ready;
      offlineState.dataset.cached = "true";
      updateOfflineState();
    } catch (_) {
      offlineState.textContent = "INSTALL CONTEXT REQUIRED";
    }
  }

  function resizeCanvas() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createStars();
  }

  function createStars() {
    const count = Math.round(32 + (state.controls.density / 100) * 58);
    stars = Array.from({ length: count }, (_, index) => ({
      x: pseudo(index * 11.17) * width - width / 2,
      y: pseudo(index * 7.31 + 4) * height - height / 2,
      z: 0.16 + pseudo(index * 3.91 + 8) * 0.84,
      size: 0.45 + pseudo(index * 5.73 + 3) * 1.25,
      tone: index % 7 === 0 ? "accent" : index % 11 === 0 ? "blue" : "white"
    }));
  }

  function pseudo(seed) {
    return Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
  }

  function starColor(tone, alpha) {
    if (tone === "accent") return `rgba(245,217,143,${alpha})`;
    if (tone === "blue") return `rgba(97,183,255,${alpha})`;
    return `rgba(247,241,230,${alpha})`;
  }

  function renderStars(timestamp) {
    if (document.hidden) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elapsed = lastFrameTime ? Math.min(34, timestamp - lastFrameTime) : 16;
    lastFrameTime = timestamp;
    context.clearRect(0, 0, width, height);
    const centerX = width / 2;
    const centerY = height * 0.46;
    const speed = reduceMotion ? 0 : (0.000024 + (state.controls.motion / 100) * 0.000055) * elapsed;

    stars.forEach((star, index) => {
      star.z -= speed * (0.65 + (index % 5) * 0.08);
      if (star.z < 0.045) {
        star.z = 1;
        star.x = pseudo(index * 17.1 + timestamp * 0.0001) * width - width / 2;
        star.y = pseudo(index * 9.7 + 1) * height - height / 2;
      }
      const scale = 1 / Math.max(0.08, star.z);
      const x = centerX + star.x * scale * 0.42;
      const y = centerY + star.y * scale * 0.42;
      if (x < -8 || x > width + 8 || y < -8 || y > height + 8) {
        star.z = 1;
        return;
      }
      const radius = Math.min(2.4, star.size * scale * 0.42);
      const alpha = clamp((1 - star.z) * 0.78 + 0.18, 0.18, 0.9) * (0.45 + state.controls.brightness / 180);
      context.beginPath();
      context.fillStyle = starColor(star.tone, alpha);
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    });

    if (!reduceMotion) frameId = requestAnimationFrame(renderStars);
  }

  function startStarfield() {
    cancelAnimationFrame(frameId);
    lastFrameTime = 0;
    frameId = requestAnimationFrame(renderStars);
  }

  function handleVisibility() {
    cancelAnimationFrame(frameId);
    frameId = 0;
    if (!document.hidden) startStarfield();
  }

  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resizeCanvas, 120);
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    installButton.hidden = true;
    showToast("RUCA MOBILE DEMO INSTALLED");
  });

  document.addEventListener("click", handleClick);
  document.addEventListener("input", handleInput);
  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("online", updateOfflineState);
  window.addEventListener("offline", updateOfflineState);
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.slice(1).toLowerCase();
    if (routeOrder.includes(hash)) setRoute(hash, { history: false });
    if (hash === "search") openSearch();
  });

  searchDialog.addEventListener("close", () => {
    searchInput.value = "";
    renderSearchResults();
  });

  window.__RUCA_DEMO_DIAGNOSTICS__ = function () {
    return Object.freeze({
      ...metrics,
      mode: window.RUCA_DEMO_MODE,
      route: state.route,
      realm: state.realm,
      district: state.district,
      diagnosticMode: state.diagnosticMode,
      particleCount: stars.length,
      surfaceChildren: surface.childElementCount,
      totalElements: document.querySelectorAll("*").length,
      serviceWorkerControlled: Boolean(navigator.serviceWorker && navigator.serviceWorker.controller)
    });
  };

  applyControls();
  buildVirtualKeyboard();
  renderSearchResults();
  setRoute(state.route, { focus: false, history: initialHash !== "search" });
  resizeCanvas();
  startStarfield();
  updateOfflineState();
  registerServiceWorker();
  if (initialHash === "search") window.setTimeout(openSearch, 0);
})();
