(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const startedAt = Date.now() - 48 * 60 * 1000;
  const laneTitles = {
    weather: ["WEATHER", "LOCAL CONDITIONS", "LOCAL FALLBACK // deterministic conditions"],
    news: ["WORLD BRIEFING", "WORLD BRIEFING", "8 public demo stories // editorial wire"],
    sports: ["GAME DAY", "GAME DAY", "40 demo events // all observation"],
    signal: ["SIGNAL INTELLIGENCE", "SIGNAL INTELLIGENCE", "12 market signals // 8 technology signals"],
    celestial: ["CELESTIAL OBSERVATORY", "CELESTIAL OBSERVATORY", "Scientific solar and lunar observation // entertainment isolated"]
  };

  const diagnosticStates = {
    ScoreMap: { label: "Score", title: "SYSTEM STATUS", live: "100", unit: "SCORE", points: [95, 96, 97, 97, 98, 99, 99, 100], summary: "The public machine fixture reports a nominal whole-system example." },
    CPU: { label: "CPU", title: "CPU STATUS", live: "38%", unit: "%", points: [28, 31, 34, 37, 41, 39, 38, 38], summary: "Deterministic CPU activity demonstrates the RUCA evidence layout without reading this device." },
    GPU: { label: "GPU", title: "GPU STATUS", live: "24%", unit: "%", points: [19, 22, 28, 26, 24, 27, 25, 24], summary: "A stable graphics fixture leaves visible headroom for the selected command profile." },
    RAM: { label: "RAM", title: "RAM STATUS", live: "16%", unit: "%", points: [14, 15, 15, 16, 17, 17, 16, 16], summary: "The memory fixture remains steady with comfortable foreground-task headroom." },
    Storage: { label: "Storage", title: "STORAGE STATUS", live: "329GB FREE", unit: "GB", points: [76, 76, 75, 75, 74, 74, 73, 73], summary: "Free-capacity values are declared demo data and do not inspect local disks." },
    Network: { label: "Network", title: "NETWORK STATUS", live: "DL 0.1 / UL 5.7", unit: "MBPS", points: [21, 27, 25, 32, 28, 31, 29, 30], summary: "A deterministic throughput sample demonstrates the network evidence lane." },
    Thermals: { label: "Thermals", title: "THERMAL STATUS", live: "47°C", unit: "°C", points: [43, 44, 45, 46, 46, 47, 47, 47], summary: "The thermal example remains inside the quiet-cooling operating band." },
    Fans: { label: "Fans", title: "FAN STATUS", live: "920 RPM", unit: "RPM", points: [860, 890, 910, 930, 925, 918, 921, 920], summary: "Fan speed is a browser-local example with no controller or sensor access." },
    Power: { label: "Power", title: "POWER STATUS", live: "286W", unit: "W", points: [240, 258, 271, 282, 293, 288, 284, 286], summary: "The power envelope is a declared simulation and cannot control the computer." },
    Motherboard: { label: "Motherboard", title: "MOTHERBOARD STATUS", live: "NOMINAL", unit: "STATE", points: [92, 93, 94, 95, 96, 96, 97, 97], summary: "The board foundation state demonstrates the diagnostics hierarchy." },
    SensorBus: { label: "Bus", title: "SENSOR BUS", live: "DEMO", unit: "STATE", points: [100, 100, 100, 100, 100, 100, 100, 100], summary: "All displayed readings come from the deterministic public fixture owner." }
  };

  const palettes = {
    default: { name: "BLACK / GOLD", accent: "#d6b36b", bright: "#f5d98f", text: "#f7f1e6" },
    lounge: { name: "LOUNGE MODE", accent: "#c88655", bright: "#f0c996", text: "#f7eee4" },
    red: { name: "BLOOD RED", accent: "#ff1018", bright: "#ff3b3f", text: "#f5f1ed" },
    neon: { name: "NEON YELLOW", accent: "#e9ef32", bright: "#ffff87", text: "#fbffe8" },
    night: { name: "ICE BLUE", accent: "#42bff5", bright: "#9be7ff", text: "#eefaff" },
    diagnostics: { name: "EMERALD", accent: "#47e6a4", bright: "#b9ffd9", text: "#eafff5" },
    violet: { name: "VIOLET", accent: "#9a6cff", bright: "#d2bdff", text: "#f7f0ff" },
    founder: { name: "FOUNDER MODE", accent: "#ff6c45", bright: "#ffb16f", text: "#fff2e8" }
  };

  function text(selector, value) {
    const node = $(selector);
    if (node) node.textContent = value;
  }

  function formatClock(date = new Date()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(date = new Date()) {
    return date.toLocaleDateString([], { weekday: "long", month: "short", day: "2-digit", year: "numeric" }).toUpperCase();
  }

  function updateClock() {
    const now = new Date();
    text("#clock", formatClock(now));
    text("#dateLine", formatDate(now));
    const elapsed = Math.max(0, Date.now() - startedAt);
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    text("#uptime", `0D ${String(hours).padStart(2, "0")}H ${String(minutes).padStart(2, "0")}M ${String(seconds).padStart(2, "0")}S`);
  }

  function setGauge(selector, progress) {
    const gauge = $(selector);
    if (!gauge) return;
    gauge.style.setProperty("--gauge-progress", String(progress));
    gauge.style.setProperty("--gauge-angle", `${-132 + progress * 2.64}deg`);
  }

  function clampHomeGeometry(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function finalizeHomeGeometry(model) {
    const coreRadius = model.coreDiameter / 2;
    const gaugeRadius = model.gaugeDiameter / 2;
    const maxRing = Math.max(model.coreDiameter + 16, Math.min(model.w - 18, model.h - 18));
    model.coreRadius = coreRadius;
    model.gaugeRadius = gaugeRadius;
    model.conduitStartRadius = coreRadius;
    model.conduitEndRadius = gaugeRadius;
    model.rings = {
      inner: Math.min(model.coreDiameter + 46, maxRing),
      middle: Math.min(model.coreDiameter + 112, maxRing),
      outer: Math.min(model.coreDiameter + 206, maxRing)
    };
    model.conduits = {};
    Object.entries(model.gauges).forEach(([name, point]) => {
      model.conduits[name] = {
        angle: Math.atan2(point.y, point.x) * 180 / Math.PI,
        length: Math.hypot(point.x, point.y)
      };
    });
    return model;
  }

  function computeHomeGeometry(width, height, viewportWidth = window.innerWidth, viewportHeight = window.innerHeight) {
    const w = Math.max(1, Number(width) || 1);
    const h = Math.max(1, Number(height) || 1);
    const vw = Math.max(1, Number(viewportWidth) || w);
    const vh = Math.max(1, Number(viewportHeight) || h);
    const stacked = vw < 820 || w < 760;
    const mode = stacked ? "stacked" : (h < 470 || vh < 850 || w < 1100 ? "compact" : "full");

    if (stacked) {
      const coreDiameter = clampHomeGeometry(Math.min(w * .44, 240), 180, 240);
      const gaugeDiameter = clampHomeGeometry(Math.min((w - 54) / 2, 164), 124, 164);
      const navWidth = clampHomeGeometry((w - 44) / 2, 126, 158);
      const navHeight = 48;
      const coreRadius = coreDiameter / 2;
      const gaugeRadius = gaugeDiameter / 2;
      const core = { x: w / 2, y: coreRadius + 72 };
      const navX = Math.max(navWidth / 2 + 14, w * .25);
      const navRightX = w - navX;
      const navUpperY = core.y + coreRadius + 62;
      const navLowerY = navUpperY + navHeight + 18;
      const rowOne = navLowerY + navHeight / 2 + gaugeRadius + 62;
      const rowStep = gaugeDiameter + 30;
      const gaugeLeftX = Math.max(gaugeRadius + 18, w * .25);
      const gaugeRightX = w - gaugeLeftX;
      const requiredHeight = rowOne + rowStep * 2 + gaugeRadius + 34;
      return finalizeHomeGeometry({
        mode, w, h, core, coreDiameter, gaugeDiameter, navWidth, navHeight,
        orbitX: Math.abs(gaugeLeftX - core.x), orbitY: rowStep,
        navOrbit: Math.hypot(navX - core.x, navUpperY - core.y),
        gauges: {
          cpu: { x: gaugeLeftX - core.x, y: rowOne - core.y },
          storage: { x: gaugeRightX - core.x, y: rowOne - core.y },
          gpu: { x: gaugeLeftX - core.x, y: rowOne + rowStep - core.y },
          network: { x: gaugeRightX - core.x, y: rowOne + rowStep - core.y },
          ram: { x: gaugeLeftX - core.x, y: rowOne + rowStep * 2 - core.y },
          thermal: { x: gaugeRightX - core.x, y: rowOne + rowStep * 2 - core.y }
        },
        navigation: {
          home: { x: 0, y: -(core.y - navHeight / 2 - 12) },
          play: { x: navX - core.x, y: navUpperY - core.y },
          live: { x: navRightX - core.x, y: navUpperY - core.y },
          diagnostics: { x: navX - core.x, y: navLowerY - core.y },
          control: { x: navRightX - core.x, y: navLowerY - core.y }
        },
        requiredHeight
      });
    }

    const compact = mode === "compact";
    const coreDiameter = compact
      ? clampHomeGeometry(Math.min(w * .22, h * .49), 160, 245)
      : clampHomeGeometry(Math.min(w * .27, h * .675), 360, 380);
    const gaugeDiameter = compact
      ? clampHomeGeometry(Math.min(w * .12, h * .32), 88, 128)
      : 150;
    const navWidth = compact ? 118 : 148;
    const navHeight = compact ? 44 : 52;
    const coreRadius = coreDiameter / 2;
    const gaugeRadius = gaugeDiameter / 2;
    const core = { x: w / 2, y: h / 2 };
    const availableX = Math.max(0, w / 2 - gaugeRadius - 14);
    const availableY = Math.max(0, h / 2 - gaugeRadius - 10);
    const orbitX = Math.min(w * (compact ? .36 : .30), availableX, compact ? 580 : 540);
    const orbitY = compact
      ? Math.min(h * .42, availableY)
      : Math.min(h * .34, availableY, 320);
    const upperX = orbitX * (compact ? .70 : .72);
    const upperY = orbitY * (compact ? .82 : .78);
    const gauges = {
      cpu: { x: -upperX, y: -upperY }, storage: { x: upperX, y: -upperY },
      gpu: { x: -orbitX, y: 0 }, network: { x: orbitX, y: 0 },
      ram: { x: -upperX, y: upperY }, thermal: { x: upperX, y: upperY }
    };
    let navX;
    let navY;
    let navOrbit;
    if (compact) {
      navX = Math.min(coreRadius + navWidth / 2 + 18, w / 2 - navWidth / 2 - 8);
      navY = Math.min(coreRadius + navHeight / 2 + 8, h / 2 - navHeight / 2 - 8);
      navOrbit = Math.hypot(navX, navY);
    } else {
      const upperGaugeAngle = Math.atan2(-upperY, -upperX);
      const navAngle = (upperGaugeAngle - Math.PI / 2) / 2;
      const desiredRadius = coreRadius + navWidth / 2 + 58;
      const maxRadiusX = (w / 2 - navWidth / 2 - 8) / Math.max(.01, Math.abs(Math.cos(navAngle)));
      const maxRadiusY = (h / 2 - navHeight / 2 - 8) / Math.max(.01, Math.abs(Math.sin(navAngle)));
      navOrbit = Math.min(desiredRadius, maxRadiusX, maxRadiusY);
      navX = Math.abs(Math.cos(navAngle) * navOrbit);
      navY = Math.abs(Math.sin(navAngle) * navOrbit);
    }
    const homeRadius = Math.min(coreRadius + navHeight / 2 + (compact ? 30 : 42), h / 2 - navHeight / 2 - 8);
    return finalizeHomeGeometry({
      mode, w, h, core, coreDiameter, gaugeDiameter, navWidth, navHeight, orbitX, orbitY, navOrbit,
      gauges,
      navigation: {
        home: { x: 0, y: -homeRadius }, play: { x: -navX, y: -navY },
        live: { x: navX, y: -navY }, diagnostics: { x: -navX, y: navY }, control: { x: navX, y: navY }
      },
      requiredHeight: h
    });
  }

  function applyHomeGeometry(board, model) {
    const px = value => `${Number(value).toFixed(3)}px`;
    const write = (name, value) => board.style.setProperty(name, value);
    board.dataset.homeGeometryMode = model.mode;
    write("--home-core-x", px(model.core.x));
    write("--home-core-y", px(model.core.y));
    write("--home-core-radius", px(model.coreRadius));
    write("--home-core-diameter", px(model.coreDiameter));
    write("--home-gauge-radius", px(model.gaugeRadius));
    write("--home-gauge-diameter", px(model.gaugeDiameter));
    write("--home-gauge-orbit-radius-x", px(model.orbitX));
    write("--home-gauge-orbit-radius-y", px(model.orbitY));
    write("--home-nav-orbit-radius", px(model.navOrbit));
    write("--home-nav-width", px(model.navWidth));
    write("--home-nav-height", px(model.navHeight));
    write("--home-conduit-start-radius", px(model.conduitStartRadius));
    write("--home-conduit-end-radius", px(model.conduitEndRadius));
    write("--home-ring-inner", px(model.rings.inner));
    write("--home-ring-middle", px(model.rings.middle));
    write("--home-ring-outer", px(model.rings.outer));
    write("--home-board-required-height", px(model.requiredHeight));
    Object.entries(model.gauges).forEach(([name, point]) => {
      const gauge = $(`.comp-${name}`, board);
      gauge?.style.setProperty("--home-node-x", px(model.core.x + point.x));
      gauge?.style.setProperty("--home-node-y", px(model.core.y + point.y));
    });
    Object.entries(model.navigation).forEach(([name, point]) => {
      const beacon = $(`.core-beacon-${name}`, board);
      if (!beacon) return;
      const distance = Math.hypot(point.x, point.y);
      const angleToCore = Math.atan2(-point.y, -point.x) * 180 / Math.PI;
      beacon.style.setProperty("--home-node-x", px(model.core.x + point.x));
      beacon.style.setProperty("--home-node-y", px(model.core.y + point.y));
      beacon.style.setProperty("--home-beacon-angle", `${angleToCore.toFixed(6)}deg`);
      beacon.style.setProperty("--home-beacon-length", px(distance));
    });
    Object.entries(model.conduits).forEach(([name, conduit]) => {
      const line = $(`.${name}-line`, board);
      line?.style.setProperty("--home-conduit-angle", `${conduit.angle.toFixed(6)}deg`);
      line?.style.setProperty("--home-conduit-length", px(conduit.length));
    });
  }

  function installHomeGeometry() {
    const board = $("#homeChronograph");
    if (!board) return;
    let frame = 0;
    const refresh = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (board.clientWidth < 1 || board.clientHeight < 1) return;
        board.dataset.homeGeometryInput = `${board.clientWidth}x${board.clientHeight}`;
        applyHomeGeometry(board, computeHomeGeometry(board.clientWidth, board.clientHeight));
      });
    };
    board.__rucaRefreshHomeGeometry = refresh;
    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(refresh);
      observer.observe(board);
      if (board.parentElement) observer.observe(board.parentElement);
      board.__rucaHomeGeometryObserver = observer;
    }
    window.addEventListener("resize", refresh, { passive: true });
    window.addEventListener("load", refresh, { once: true });
    refresh();
    requestAnimationFrame(() => requestAnimationFrame(refresh));
    [120, 360, 900].forEach(delay => window.setTimeout(refresh, delay));
  }

  function playNodes() {
    return $$("#page-play .integrated-app-node").filter(node => !node.hidden);
  }

  function selectPlayNode(index = 0) {
    const orbit = $("#page-play .launcher-orbit");
    const nodes = playNodes();
    if (!orbit || !nodes.length) return;
    const selected = ((Math.round(Number(index) || 0) % nodes.length) + nodes.length) % nodes.length;
    orbit.dataset.selectedIndex = String(selected);
    nodes.forEach((node, nodeIndex) => {
      const active = nodeIndex === selected;
      node.dataset.orbitSlot = active ? "selected" : "orbital";
      node.classList.toggle("is-primary", active);
      node.classList.toggle("is-neighbor", Math.abs(nodeIndex - selected) === 1);
      node.setAttribute("aria-selected", active ? "true" : "false");
      node.setAttribute("aria-current", active ? "true" : "false");
    });
    const node = nodes[selected];
    const core = $("#commandWheelAction");
    if (core && node) {
      const icon = $(".ruca-app-icon", node);
      text("#commandWheelKicker", node.dataset.favorite === "true" ? "FAVORITE PORT" : "SELECTED PORT");
      const iconSlot = $("#commandWheelIcon");
      if (iconSlot) iconSlot.innerHTML = icon ? icon.outerHTML : "";
      text("#commandWheelTitle", node.dataset.app || "COMMAND");
      text("#commandWheelRole", node.dataset.role || "Command module");
      text("#commandWheelState", node.dataset.status || "READY");
      text("#commandWheelCategory", (node.dataset.district || "COMMAND").toUpperCase());
      text("#commandWheelPosition", `${selected + 1} / ${nodes.length}`);
      core.dataset.app = node.dataset.app || "";
      core.dataset.appId = node.dataset.appId || "";
      core.dataset.status = node.dataset.status || "";
    }
    const link = $("#commandSelectionLink");
    if (link && node) {
      const x = Number(node.dataset.orbitX || 0);
      const y = Number(node.dataset.orbitY || 0);
      link.style.setProperty("--selection-link-length", `${Math.hypot(x, y).toFixed(3)}px`);
      link.style.setProperty("--selection-link-angle", `${(Math.atan2(y, x) * 180 / Math.PI).toFixed(3)}deg`);
    }
  }

  function layoutPlayOrbit() {
    const orbit = $("#page-play .launcher-orbit");
    const nodes = playNodes();
    if (!orbit || !nodes.length) return;
    const w = Math.max(1, orbit.clientWidth);
    const h = Math.max(1, orbit.clientHeight);
    if (w < 520) {
      orbit.dataset.orbitMode = "compact";
      orbit.style.setProperty("--command-node-size", `${clampHomeGeometry(w * .105, 34, 38).toFixed(3)}px`);
      orbit.style.setProperty("--command-core-size", `${clampHomeGeometry(w * .42, 136, 148).toFixed(3)}px`);
      selectPlayNode(0);
      return;
    }
    orbit.dataset.orbitMode = "radial";
    const narrow = w < 720;
    const nodeSize = narrow ? clampHomeGeometry(w * .115, 36, 46) : w >= 1300 ? 42 : clampHomeGeometry(Math.min(w * .038, h * .105), 42, 62);
    const coreSize = narrow ? clampHomeGeometry(Math.min(w * .48, h * .24), 150, 190) : w >= 1300 ? 220 : clampHomeGeometry(Math.min(w * .18, h * .40), 184, 284);
    const compactHeight = h < 460;
    const maxRx = Math.max(nodeSize, w / 2 - Math.max(nodeSize * .72, narrow ? 68 : 86) - 18);
    const maxRy = Math.max(nodeSize, h / 2 - nodeSize * .7 - (compactHeight ? 18 : 34));
    const minimumRing = coreSize / 2 + nodeSize / 2 + (compactHeight ? 12 : 26);
    let counts;
    let rings;
    if (nodes.length <= 8) {
      counts = [nodes.length];
      rings = [{ rx: Math.min(maxRx, Math.max(minimumRing, maxRx * .62)), ry: Math.min(maxRy, Math.max(minimumRing, maxRy * .72)) }];
    } else if (nodes.length <= 18) {
      const innerCount = Math.ceil(nodes.length * .45);
      counts = [innerCount, nodes.length - innerCount];
      rings = [
        { rx: Math.min(maxRx, Math.max(minimumRing, maxRx * .48)), ry: Math.min(maxRy, Math.max(minimumRing, maxRy * .62)) },
        { rx: Math.min(maxRx, Math.max(minimumRing, maxRx * .84)), ry: Math.min(maxRy, Math.max(minimumRing, maxRy * .90)) }
      ];
    } else if (narrow) {
      counts = [6, 8, 10, Math.max(1, nodes.length - 24)];
      rings = [
        { rx: Math.min(maxRx, Math.max(minimumRing, maxRx * .68)), ry: Math.min(maxRy, Math.max(minimumRing, maxRy * .34)) },
        { rx: Math.min(maxRx, Math.max(minimumRing, maxRx * .84)), ry: Math.min(maxRy, Math.max(minimumRing, maxRy * .56)) },
        { rx: maxRx, ry: Math.min(maxRy, Math.max(minimumRing, maxRy * .77)) },
        { rx: maxRx, ry: maxRy }
      ];
    } else {
      counts = [8, 12, Math.max(1, nodes.length - 20)];
      rings = [
        { rx: Math.min(maxRx, Math.max(minimumRing, maxRx * .34)), ry: Math.min(maxRy, Math.max(minimumRing, maxRy * .55)) },
        { rx: Math.min(maxRx, Math.max(minimumRing, maxRx * .64)), ry: Math.min(maxRy, Math.max(minimumRing, maxRy * .78)) },
        { rx: maxRx * .96, ry: maxRy }
      ];
    }
    orbit.style.setProperty("--command-node-size", `${nodeSize.toFixed(3)}px`);
    orbit.style.setProperty("--command-core-size", `${coreSize.toFixed(3)}px`);
    let cursor = 0;
    const placed = [];
    counts.forEach((count, ringIndex) => {
      const ring = rings[Math.min(ringIndex, rings.length - 1)];
      const actual = Math.min(count, nodes.length - cursor);
      if (actual <= 0) return;
      const step = Math.PI * 2 / Math.max(1, actual);
      let bestOffset = 0;
      let bestClearance = -Infinity;
      const candidateCount = actual === 1 ? 1 : 72;
      for (let candidate = 0; candidate < candidateCount; candidate += 1) {
        const offset = step * candidate / candidateCount;
        const proposed = [];
        for (let slot = 0; slot < actual; slot += 1) {
          const angle = -Math.PI / 2 + step * slot + offset;
          proposed.push({ x: Math.cos(angle) * ring.rx, y: Math.sin(angle) * ring.ry });
        }
        let clearance = Infinity;
        proposed.forEach((point, pointIndex) => {
          placed.forEach(other => { clearance = Math.min(clearance, Math.hypot(point.x - other.x, point.y - other.y)); });
          for (let previous = 0; previous < pointIndex; previous += 1) clearance = Math.min(clearance, Math.hypot(point.x - proposed[previous].x, point.y - proposed[previous].y));
        });
        if (clearance > bestClearance) { bestClearance = clearance; bestOffset = offset; }
      }
      for (let slot = 0; slot < actual; slot += 1) {
        const node = nodes[cursor + slot];
        const angle = -Math.PI / 2 + step * slot + bestOffset;
        const x = Math.cos(angle) * ring.rx;
        const y = Math.sin(angle) * ring.ry;
        node.style.setProperty("--orbit-x", `${x.toFixed(3)}px`);
        node.style.setProperty("--orbit-y", `${y.toFixed(3)}px`);
        node.dataset.orbitX = x.toFixed(3);
        node.dataset.orbitY = y.toFixed(3);
        node.dataset.orbitRing = String(ringIndex + 1);
        placed.push({ x, y });
      }
      cursor += actual;
    });
    let minimumCenterDistance = Infinity;
    for (let left = 0; left < placed.length; left += 1) {
      for (let right = left + 1; right < placed.length; right += 1) minimumCenterDistance = Math.min(minimumCenterDistance, Math.hypot(placed[left].x - placed[right].x, placed[left].y - placed[right].y));
    }
    const fittedNodeSize = Math.max(narrow ? 22 : 32, Math.min(nodeSize, (minimumCenterDistance - 4) / 1.17));
    orbit.style.setProperty("--command-node-size", `${fittedNodeSize.toFixed(3)}px`);
    selectPlayNode(0);
  }

  function installPlayGeometry() {
    const orbit = $("#page-play .launcher-orbit");
    if (!orbit) return;
    let frame = 0;
    const refresh = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = 0;
        layoutPlayOrbit();
      });
    };
    document.addEventListener("ruca:play-registry-ready", refresh);
    document.addEventListener("ruca:play-orbit-change", refresh);
    document.addEventListener("ruca:continuity-change", event => {
      if (event.detail?.type === "route-changed" && event.detail?.to === "play") {
        refresh();
        window.setTimeout(refresh, 90);
      }
    });
    orbit.addEventListener("pointerdown", event => {
      const node = event.target.closest(".integrated-app-node");
      const nodes = playNodes();
      const index = nodes.indexOf(node);
      if (index >= 0) selectPlayNode(index);
    }, { capture: true });
    if (typeof ResizeObserver === "function") new ResizeObserver(refresh).observe(orbit);
    if (typeof MutationObserver === "function") {
      new MutationObserver(() => {
        if (document.body.dataset.world === "play") refresh();
      }).observe(document.body, { attributes: true, attributeFilter: ["data-world"] });
    }
    window.addEventListener("resize", refresh, { passive: true });
    window.setTimeout(refresh, 0);
    window.setTimeout(refresh, 120);
  }

  function hydrateHome() {
    text("#homeMissionState", "NOMINAL");
    text("#heartScore", "100%");
    text("#heartState", "NOMINAL");
    text("#homeCPU", "59%");
    text("#homeGPU", "24%");
    text("#homeRAM", "16%");
    text("#homeStorage", "329GB FREE");
    text("#homeNetwork", "DL 0.1 / UL 5.7");
    text("#homeThermal", "47°C");
    text("#ribbonSystemState", "SYSTEM NOMINAL");
    text("#ribbonSystemDetail", "Assessment uses declared public demo fields.");
    text("#ribbonBridgeState", "PUBLIC DEMO READY");
    text("#ribbonBridgeDetail", "Deterministic browser-local fixture");
    text("#ribbonThermalState", "THERMAL 47°C");
    text("#ribbonThermalDetail", "Current example package temperature.");
    text("#ribbonStorageState", "329GB FREE");
    text("#ribbonStorageDetail", "Capacity is a declared public fixture.");
    text("#ribbonDiagnosticState", "DIAGNOSTICS DEMO");
    text("#ribbonDiagnosticDetail", "11 of 11 public example groups are available.");
    setGauge(".comp-cpu", 59);
    setGauge(".comp-gpu", 24);
    setGauge(".comp-ram", 16);
    setGauge(".comp-storage", 72);
    setGauge(".comp-network", 31);
    setGauge(".comp-thermal", 47);
  }

  function safeImage(index) {
    return `/assets/news/news-${index}.jpg`;
  }

  function story(className, index, source, title, summary = "") {
    return `<article class="${className}" style="--realm-hero-image:url('${safeImage(index)}')" data-has-image="true"><div class="editorial-story-copy"><div class="editorial-meta"><span>${source}</span><time>DEMO EDITION</time></div><h4>${title}</h4>${summary ? `<p>${summary}</p>` : ""}</div></article>`;
  }

  function sourceFooter(label, confidence = "HIGH") {
    return `<div class="world-source-status" role="status"><span>${label}</span><b>DEMO</b><small>Deterministic public fixture</small><div class="world-source-contract"><span>CONFIDENCE <b>${confidence}</b></span><span>LAST UPDATED <b>THIS SESSION</b></span><span>FALLBACK <b>NONE</b></span></div></div>`;
  }

  function liveRoot(lane, content) {
    const meta = laneTitles[lane];
    return `<section class="live-world-render-root" data-world="${lane}" data-phase="ready" data-condition="neutral"><div class="world-backdrop" aria-hidden="true"><span class="world-atmosphere-layer"></span><span class="world-particle-field"></span></div><header class="ruca-live-header ruca-observation-header"><div><span class="tiny-label">CONCIERGE // ${lane.toUpperCase()}</span><h3>${meta[1]}</h3><small>${meta[2]}</small></div></header><main class="world-stage-content"><div class="ruca-live-grid">${content}</div></main>${sourceFooter("RUCA PUBLIC DEMO DATA")}</section>`;
  }

  function weatherView() {
    const forecasts = [
      ["SAT", "Heavy drizzle", "74° / 59°", "75% precipitation"],
      ["SUN", "Drizzle", "69° / 57°", "25% precipitation"],
      ["MON", "Cloudy", "75° / 51°", "0% precipitation"],
      ["TUE", "Thunderstorm", "73° / 55°", "84% precipitation"],
      ["WED", "Rain showers", "73° / 57°", "84% precipitation"]
    ];
    return `<section class="weather-world" data-lane="weather" data-source-state="DEMO"><section class="world-hero weather-world-hero"><div class="weather-location-line"><span>LOCAL CONDITIONS</span><strong>PUBLIC DEMO</strong><time>THIS SESSION</time></div><div class="weather-hero-reading"><div class="weather-temperature"><strong>67</strong><span>°F</span></div><div class="ruca-weather-mark" data-weather-kind="cloud"><span>Cloudy</span></div></div><p>Feels like 70° // 23% precipitation chance // 7 MPH SW wind</p><div class="weather-high-low"><span>HIGH <b>74°</b></span><span>LOW <b>59°</b></span></div></section><section class="world-intelligence"><div class="world-primary"><article class="weather-readout"><span>Humidity</span><strong>93%</strong><small>Relative humidity</small></article><article class="weather-readout"><span>Wind</span><strong>7 MPH SW</strong><small>Current wind</small></article><article class="weather-readout"><span>Precipitation</span><strong>23%</strong><small>Current hourly probability</small></article><article class="weather-readout"><span>Current precip</span><strong>0.00 IN</strong><small>Reported now</small></article><article class="weather-readout"><span>Cloud cover</span><strong>85%</strong><small>Current sky coverage</small></article></div><div class="world-secondary"><div class="weather-secondary-row"><span>Sunrise</span><b>5:40 AM</b></div><div class="weather-secondary-row"><span>Sunset</span><b>8:29 PM</b></div><div class="weather-secondary-row"><span>Wind gust</span><b>12 MPH</b></div><div class="weather-secondary-row"><span>Source freshness</span><b>DEMO SESSION</b></div></div></section><section class="world-ribbon weather-forecast-ribbon"><header><span>FORECAST</span><small>Public fixture // five-day outlook</small></header><div class="weather-forecast-track">${forecasts.map(([day, condition, range, chance]) => `<article class="weather-forecast-item"><span class="weather-forecast-day">${day}</span><div class="ruca-weather-mark" data-weather-kind="cloud"><span>${condition}</span></div><strong>${range}</strong><small>${chance}</small></article>`).join("")}</div></section></section>`;
  }

  function newsView() {
    const stories = [
      [1, "RUCA DEMO DESK", "The public RUCA demo now uses the operating system's actual interface", "The source shell, full stylesheet, imagery, and interaction density are preserved while private runtime access is removed."],
      [2, "RUCA DEMO DESK", "Controller-first navigation keeps all five worlds one action away", "The original focus hierarchy remains visible throughout the safe browser simulation."],
      [3, "RUCA DEMO DESK", "Diagnostics separates evidence from interpretation", "Every example reading is labeled as deterministic public demo data."],
      [4, "RUCA DEMO DESK", "Control Workshop keeps the environment customizable", "Color, brightness, density, motion, depth, and glass remain adjustable."],
      [5, "RUCA DEMO DESK", "No native command or private endpoint exists in the public build", "PLAY handoffs remain visible simulations inside the page."]
    ];
    return `<section class="realm-world editorial-world news-world" data-lane="news" data-source-state="DEMO"><div class="realm-main editorial-main"><section class="world-hero realm-hero editorial-world-hero"><div class="realm-identity-line"><span>EDITORIAL OBSERVATION</span><time>DEMO EDITION</time></div>${story("editorial-hero-story", ...stories[0])}</section><section class="world-intelligence realm-intelligence editorial-intelligence"><header class="realm-section-heading"><span>SUPPORTING STORIES</span><small>RUCA public demo desk</small></header><div class="editorial-support-list">${stories.slice(1).map(item => story("editorial-support-story", ...item)).join("")}</div></section></div><section class="world-ribbon realm-ticker-ribbon editorial-timeline-ribbon"><header><span>STORY TIMELINE</span><small>RUCA DEMO DESK</small></header><div class="realm-ribbon-track editorial-timeline-track">${stories.map(item => story("editorial-timeline-item", ...item.slice(0, 3))).join("")}</div></section></section>`;
  }

  const games = [
    ["MLB", "Pittsburgh Pirates", "3", "Cleveland Guardians", "3", "BOT 8TH"],
    ["MLB", "San Francisco Giants", "3", "Seattle Mariners", "0", "TOP 10TH"],
    ["MLB", "Washington Nationals", "0", "Athletics", "6", "FINAL"],
    ["MLB", "Detroit Tigers", "6", "Los Angeles Angels", "0", "FINAL"],
    ["NFL", "New England Patriots", "", "Seattle Seahawks", "", "UPCOMING"],
    ["NBA", "New York Knicks", "", "Boston Celtics", "", "UPCOMING"]
  ];

  function gameCard(game, className) {
    return `<article class="${className}" data-game-state="demo"><span>${game[0]}</span><div class="sports-team-line"><b>${game[1]}</b><strong>${game[2]}</strong></div><div class="sports-team-line"><b>${game[3]}</b><strong>${game[4]}</strong></div><small>${game[5]} // DEMO</small></article>`;
  }

  function sportsView() {
    return `<section class="realm-world sports-world" data-lane="sports" data-source-state="DEMO"><div class="realm-main sports-main"><section class="world-hero realm-hero sports-world-hero"><div class="realm-identity-line"><span>GAME DAY OBSERVATION</span><time>DEMO SESSION</time></div><div class="sports-hero-league"><span>MLB</span><b>BOT 8TH</b></div><div class="sports-hero-matchup"><div><span>AWAY</span><strong>Pittsburgh Pirates</strong><b>3</b></div><i>AT</i><div><span>HOME</span><strong>Cleveland Guardians</strong><b>3</b></div></div><p>BOT 8TH // PERIOD 8</p><button class="realm-primary-action" type="button">OPEN GAME CENTER</button></section><section class="world-intelligence realm-intelligence sports-intelligence"><div class="sports-league-selector" role="group"><button type="button" aria-pressed="true">ALL<small>40</small></button><button type="button">NBA<small>1</small></button><button type="button">NFL<small>16</small></button><button type="button">MLB<small>16</small></button><button type="button">NHL<small>7</small></button></div><div class="sports-intelligence-grid"><section class="sports-scoreboard"><header><span>LIVE SCORES</span><small>ALL</small></header>${games.slice(0, 4).map(game => gameCard(game, "sports-score-row")).join("")}</section><section class="sports-context-deck"><div class="sports-context-row"><span>UPCOMING</span><b>23</b><small>demo events</small></div><div class="sports-context-row"><span>STANDINGS</span><b>NOT SUPPLIED</b><small>public fixture</small></div><div class="sports-context-row"><span>FAVORITE REALM</span><b>NOT SET</b><small>Control atmosphere</small></div><div class="sports-upcoming-list"><span>NEXT GAMES</span>${games.slice(4).map(game => `<div><b>${game[1]} @ ${game[3]}</b><small>DEMO SCHEDULE</small></div>`).join("")}</div></section></div></section></div><section class="world-ribbon realm-ticker-ribbon sports-schedule-ribbon"><header><span>SCHEDULE RIBBON</span><small>ALL // public demo events</small></header><div class="realm-ribbon-track sports-schedule-track">${games.map(game => gameCard(game, "sports-schedule-item")).join("")}</div></section></section>`;
  }

  const markets = [["SPY", "743.29", "-0.99%"], ["DIA", "520.81", "-0.74%"], ["QQQ", "695.33", "-1.50%"], ["VIX", "18.77", "+12.19%"], ["AAPL", "333.74", "+0.14%"], ["MSFT", "393.82", "-1.81%"], ["NVDA", "202.81", "-2.21%"], ["AMD", "495.76", "-1.03%"]];

  function quote(item, className) {
    return `<article class="${className}" data-direction="${item[2].startsWith("+") ? "up" : "down"}"><span>${item[0]}</span><strong>${item[1]}</strong><b>${item[2]}</b></article>`;
  }

  function signalView() {
    return `<section class="realm-world signal-world" data-lane="signal" data-source-state="DEMO"><div class="realm-main signal-main"><section class="world-hero realm-hero signal-world-hero"><div class="realm-identity-line"><span>SIGNAL INTELLIGENCE</span><time>DEMO SESSION</time></div><div class="signal-market-tone"><span>MARKET PULSE</span><h4>MIXED</h4><p>-0.08% average across returned demo signals</p></div><div class="signal-market-pulse">${markets.slice(0, 3).map(item => quote(item, "signal-market-readout")).join("")}</div><div class="signal-source-split"><span>MARKET <b>DEMO</b></span><span>TECHNOLOGY <b>DEMO</b></span><span>WORLD <b>DEMO</b></span><span>CORRELATIONS <b>NOT INFERRED</b></span></div></section><section class="world-intelligence realm-intelligence signal-intelligence"><header class="realm-section-heading"><span>ACTIVE SIGNAL CHANNELS</span><small>PUBLIC DEMO INTELLIGENCE</small></header><div class="signal-fusion-grid"><section class="signal-channel-panel" data-signal-channel="technology"><header><span>TECHNOLOGY</span><small>DEMO</small></header><div class="signal-topic-matrix"><article class="signal-topic-row"><div class="editorial-story-copy"><div class="editorial-meta"><span>AI</span><time>NOW</time></div><h4>Public simulation preserves the current RUCA visual system</h4><p>The private runtime has been replaced without replacing the interface.</p></div></article><article class="signal-topic-row"><div class="editorial-story-copy"><div class="editorial-meta"><span>HARDWARE</span><time>NOW</time></div><h4>NO VERIFIED DEVICE SIGNAL</h4><p>The public build cannot inspect this computer.</p></div></article></div></section><section class="signal-channel-panel" data-signal-channel="world"><header><span>WORLD</span><small>DEMO</small></header><div class="signal-world-list"><article class="signal-topic-row"><div class="editorial-story-copy"><h4>Interface fidelity is the active signal</h4><p>All visible content is deterministic and browser-local.</p></div></article></div></section><section class="signal-channel-panel signal-correlation-panel" data-signal-channel="correlations"><header><span>CORRELATIONS</span><small>CAUSE NOT VERIFIED</small></header><div class="signal-correlation-list"><article class="signal-correlation-row"><div class="signal-evidence-labels"><b>RELATED SIGNAL</b><b>CAUSE NOT VERIFIED</b></div><h4>RUCA // PUBLIC DEMO</h4><p>The selected inputs share this observation window.</p></article></div></section></div></section></div><section class="world-ribbon realm-ticker-ribbon signal-ribbon"><header><span>MARKET + TECHNOLOGY + WORLD</span><small>DEMO // CAUSE NOT VERIFIED</small></header><div class="realm-ribbon-track signal-ribbon-track">${markets.map(item => quote(item, "market-ticker-item")).join("")}</div></section></section>`;
  }

  function celestialView() {
    const metrics = [["Sunrise", "Jul 23, 5:41 AM"], ["Sunset", "Jul 22, 8:27 PM"], ["Civil dawn", "Jul 23, 5:08 AM"], ["Civil dusk", "Jul 22, 9:00 PM"]];
    return `<section class="realm-world celestial-world" data-lane="celestial" data-source-state="DEMO"><div class="realm-main celestial-main"><section class="world-hero realm-hero celestial-world-hero"><div class="realm-identity-line"><span>CELESTIAL OBSERVATORY</span><time>DEMO SESSION</time></div><div class="celestial-moon-readout"><span>MOON PHASE</span><h4>Waxing Crescent</h4><strong>19.9%</strong><p>Calculated demonstration // lunar age 4.34 days</p></div><div class="celestial-location"><span>OBSERVATION POINT</span><b>PUBLIC DEMO LOCATION</b><small>DECLARED FIXTURE</small></div></section><section class="world-intelligence realm-intelligence celestial-intelligence"><header class="realm-section-heading"><span>SCIENTIFIC</span><small>DETERMINISTIC CALCULATIONS // DEMO</small></header><div class="celestial-metric-grid">${metrics.map(item => `<article><span>${item[0]}</span><strong>${item[1]}</strong></article>`).join("")}</div><div class="celestial-state-band"><span>LIGHT STATE</span><b>NIGHT</b><small>Solar position is calculated for the public demo fixture.</small></div></section></div><section class="world-ribbon celestial-entertainment" data-status="UNAVAILABLE"><header><span>ENTERTAINMENT</span><small>SEPARATE FROM SCIENTIFIC OBSERVATION</small></header><div><strong>ENTERTAINMENT CONTENT UNAVAILABLE</strong><p>No horoscope content is generated or presented as verified, predictive, scientific, or factual.</p><small>No configured entertainment source</small></div></section></section>`;
  }

  const liveViews = { weather: weatherView, news: newsView, sports: sportsView, signal: signalView, celestial: celestialView };

  function renderLane(lane) {
    const safeLane = liveViews[lane] ? lane : "weather";
    const stage = $("#laneStage");
    if (!stage) return;
    stage.dataset.lane = safeLane;
    stage.innerHTML = liveRoot(safeLane, liveViews[safeLane]());
    $$("#page-live .lane-btn").forEach(button => {
      const active = button.dataset.lane === safeLane;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function initializeLiveWorld() {
    const labels = { weather: ["WEATHER", "LIVE"], news: ["WORLD", "BRIEFING"], sports: ["GAME DAY", "LIVE"], signal: ["SIGNAL", "INTELLIGENCE"], celestial: ["CELESTIAL", "OBSERVATORY"] };
    $$("#page-live .lane-btn").forEach(button => {
      if (button.dataset.lane === "market") {
        button.hidden = true;
        return;
      }
      const parts = labels[button.dataset.lane];
      if (parts) button.innerHTML = `${parts[0]}<small>${parts[1]}</small>`;
      button.addEventListener("click", () => renderLane(button.dataset.lane));
    });
    renderLane("weather");
  }

  function renderTrace(points) {
    const chart = $("#sensorChart");
    if (!chart) return;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = Math.max(1, max - min);
    const coordinates = points.map((value, index) => `${20 + index * (600 / Math.max(1, points.length - 1))},${180 - ((value - min) / range) * 140}`).join(" ");
    chart.innerHTML = `<defs><linearGradient id="demoTrace" x1="0" x2="1"><stop offset="0" stop-color="var(--gold)"/><stop offset="1" stop-color="var(--gold2)"/></linearGradient></defs><g opacity=".24" stroke="var(--gold)" stroke-width="1">${[35, 75, 115, 155].map(y => `<line x1="10" y1="${y}" x2="630" y2="${y}"/>`).join("")}</g><polyline fill="none" stroke="url(#demoTrace)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" points="${coordinates}"/>`;
  }

  function renderDiagnostics(key = "CPU") {
    const state = diagnosticStates[key] || diagnosticStates.CPU;
    text("#diagTitle", state.title);
    text("#diagBehavior", "PUBLIC DEMO EVIDENCE");
    text("#diagSummary", state.summary);
    text("#diagHealth", "100");
    text("#diagState", "NOMINAL");
    text("#scanStatus", "DEMO");
    text("#diagConfidence", "11 FIXTURE GROUPS");
    text("#diagSeverity", "NOMINAL");
    text("#diagLive", state.live);
    text("#diagThreshold", "SOURCE-DRIVEN");
    text("#lastScan", formatClock());
    text("#chartUnit", state.unit);
    text("#triWhat", `${state.label} is displaying deterministic public demo evidence.`);
    text("#triWhy", "The layout demonstrates how RUCA separates evidence, interpretation, and action.");
    text("#triCheck", `Review the ${state.label} trace and declared DEMO source state.`);
    text("#triNext", "Select another sensor group or open technical detail.");
    text("#triRisk", "No machine risk is inferred from this public simulation.");
    renderTrace(state.points);
    const metrics = [[state.label.toUpperCase(), state.live, "PUBLIC FIXTURE", "THIS SESSION", "DEMO"], ["SOURCE STATE", "AVAILABLE", "BROWSER LOCAL", "THIS SESSION", "NOMINAL"]];
    $("#metricsTable").innerHTML = `<div class="metric-row"><span>Metric</span><span>Current</span><span>Source</span><span>Updated</span><span>State</span></div>${metrics.map(row => `<button class="metric-row" type="button">${row.map((item, index) => index === 4 ? `<b class="ok">${item}</b>` : index === 0 ? `<b>${item}</b>` : `<span>${item}</span>`).join("")}</button>`).join("")}`;
    $("#sensorTree").innerHTML = metrics.map(row => `<button class="sensor-node" type="button"><b>${row[0]}</b><small>${row[1]}</small><small class="node-status">DEMO / PUBLIC FIXTURE</small></button>`).join("");
    $("#deepGrid").innerHTML = `<div class="deep-card"><span>TRUTH RULE</span><b>DECLARED DEMO DATA</b><small>No device is inspected.</small></div><div class="deep-card"><span>SOURCE</span><b>BROWSER LOCAL</b><small>Deterministic fixture owner.</small></div><div class="deep-card"><span>FRESHNESS</span><b>THIS SESSION</b><small>Generated on interaction.</small></div><div class="deep-card"><span>COVERAGE</span><b>11 / 11</b><small>Public example groups.</small></div>`;
    $("#alertRail").innerHTML = `<div class="alert-pill"><b>GUARDIAN</b><small>${state.label} example is nominal. Public demo only.</small></div>`;
    $$("#sensorButtons .sensor-btn").forEach(button => button.classList.toggle("active", button.dataset.sensor === key));
  }

  function initializeDiagnostics() {
    const order = Object.keys(diagnosticStates);
    const container = $("#sensorButtons");
    if (container) container.innerHTML = order.map(key => `<button class="sensor-btn${key === "CPU" ? " active" : ""}" data-sensor="${key}" type="button">${diagnosticStates[key].label}</button>`).join("");
    $$("#sensorButtons .sensor-btn").forEach(button => button.style.setProperty("display", "block", "important"));
    container?.addEventListener("click", event => {
      const button = event.target.closest("[data-sensor]");
      if (button) renderDiagnostics(button.dataset.sensor);
    });
    $("#runScan")?.addEventListener("click", () => {
      text("#scanStatus", "SCANNING");
      window.setTimeout(() => renderDiagnostics($("#sensorButtons .sensor-btn.active")?.dataset.sensor || "CPU"), 420);
    });
    const detailToggle = $("#rucaDiagnosticsDetailToggle");
    detailToggle?.addEventListener("click", () => {
      const page = $("#page-diagnostics");
      const open = !page.classList.contains("diagnostics-detail-open");
      page.classList.toggle("diagnostics-detail-open", open);
      detailToggle.setAttribute("aria-expanded", String(open));
      detailToggle.textContent = open ? "HIDE TECHNICAL DETAIL" : "SHOW TECHNICAL DETAIL";
      $("#rucaDiagnosticsWorkspace").hidden = !open;
      $("#rucaDiagnosticsMetrics").hidden = !open;
      $("#rucaDiagnosticsTechnical").hidden = true;
      $("#deepGrid").hidden = true;
    });
    $("#rucaDiagnosticsWorkspace")?.addEventListener("click", event => {
      const button = event.target.closest("[data-diagnostics-workspace]");
      if (!button) return;
      const view = button.dataset.diagnosticsWorkspace;
      $$("[data-diagnostics-workspace]").forEach(item => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });
      $("#rucaDiagnosticsMetrics").hidden = view !== "source";
      $("#rucaDiagnosticsTechnical").hidden = !["map", "benchmark"].includes(view);
      $("#rucaSensorMapPanel").hidden = view !== "map";
      $("#rucaBenchmarkPanel").hidden = view !== "benchmark";
      $("#deepGrid").hidden = view !== "raw";
    });
    $$("[data-diagnostics-view]").forEach(button => button.addEventListener("click", () => {
      const timeline = button.dataset.diagnosticsView === "timeline";
      $$("[data-diagnostics-view]").forEach(item => item.classList.toggle("active", item === button));
      $("#diagnosticsTimelineView").hidden = !timeline;
      $("#diagnosticsEvidenceView").hidden = timeline;
      if (timeline) renderTimeline();
    }));
    $$(".bench-btn, #runFullBenchmark, #exportReport").forEach(button => button.addEventListener("click", () => {
      $("#benchmarkResults").innerHTML = `<div class="bench-result"><span>PUBLIC DEMO</span><b>SIMULATED</b><small>No benchmark executed.</small></div>`;
    }));
    renderDiagnostics("CPU");
  }

  function renderTimeline() {
    const events = [["00:01", "CPU", "NOMINAL", "Public demo session began"], ["00:08", "THERMAL", "ACTIVE", "Fixture stabilized at 47°C"], ["00:16", "PLAY", "NOMINAL", "Command district became ready"]];
    $("#machineTimelineList").innerHTML = events.map(item => `<button class="machine-event" type="button"><time>${item[0]}</time><span class="machine-event-state" data-state="${item[2]}">${item[2]}</span><strong>${item[1]}</strong><small>${item[3]}</small><em>DEMO</em></button>`).join("");
    $("#machineEvidenceInspector").innerHTML = `<div class="machine-evidence-state"><b>PUBLIC DEMO EVIDENCE</b><strong>Deterministic session reconstruction</strong><small>Nothing was read from this device.</small></div><div class="machine-evidence-row"><span>OWNER</span><b>RUCA PUBLIC FIXTURE</b></div><div class="machine-evidence-row"><span>STATE</span><b>NOMINAL</b></div>`;
    text("#machineTimelineCount", `${events.length} SESSION EVENTS`);
  }

  function applyPalette(key) {
    const palette = palettes[key] || palettes.default;
    const root = document.documentElement;
    root.style.setProperty("--gold", palette.accent);
    root.style.setProperty("--gold2", palette.bright);
    root.style.setProperty("--gold3", palette.accent);
    root.style.setProperty("--white", palette.text);
    root.style.setProperty("--line", `${palette.accent}55`);
    root.style.setProperty("--line2", `${palette.accent}25`);
    root.style.setProperty("--ruca-star-color", palette.bright);
    text("#rucaActivePreset", palette.name);
    text("#rucaProfileReadout", palette.name === "BLACK / GOLD" ? "Mission Ready" : "Custom Command");
    if ($("#rucaAccentPick")) $("#rucaAccentPick").value = palette.accent;
    if ($("#rucaGoldPick")) $("#rucaGoldPick").value = palette.bright;
    if ($("#rucaTextPick")) $("#rucaTextPick").value = palette.text;
    $$(".theme-preset").forEach(button => button.classList.toggle("active", button.dataset.rucaPreset === key));
  }

  function initializeControl() {
    let selectedPalette = "red";
    applyPalette(selectedPalette);
    $$(".theme-preset").forEach(button => button.addEventListener("click", () => {
      selectedPalette = button.dataset.rucaPreset;
      applyPalette(selectedPalette);
      text("#rucaCommandControlState", "PROFILE PREVIEW");
      text("#rucaCommandControlReadout", `${button.querySelector("b")?.textContent || "Theme"} is active in this browser.`);
    }));
    $("#rucaApplyTheme")?.addEventListener("click", () => {
      const root = document.documentElement;
      root.style.setProperty("--gold", $("#rucaAccentPick").value);
      root.style.setProperty("--gold2", $("#rucaGoldPick").value);
      root.style.setProperty("--white", $("#rucaTextPick").value);
      root.style.setProperty("--font", $("#rucaFontPick").value);
      selectedPalette = "custom";
      $$(".theme-preset").forEach(item => item.classList.remove("active"));
      text("#rucaActivePreset", "CUSTOM COMMAND");
      text("#rucaActiveProfileFoot", "local UI command state");
      text("#rucaProfileReadout", "Custom Command");
      text("#rucaCommandControlState", "COMMAND APPLIED");
      text("#rucaCommandControlReadout", "The public interface profile was updated locally.");
    });
    $("#rucaResetTheme")?.addEventListener("click", () => {
      selectedPalette = "default";
      applyPalette("default");
      text("#rucaCommandControlState", "DEFAULT RESTORED");
    });
    const syncRangeFill = input => {
      const min = Number(input.min || 0);
      const max = Number(input.max || 100);
      const value = Math.min(max, Math.max(min, Number(input.value || min)));
      const percentage = max === min ? 0 : ((value - min) / (max - min)) * 100;
      input.style.setProperty("--range-progress", `${percentage.toFixed(2)}%`);
      input.setAttribute("aria-valuenow", String(value));
    };
    $$("input[type='range']").forEach(input => {
      syncRangeFill(input);
      input.addEventListener("input", () => syncRangeFill(input));
      input.addEventListener("change", () => syncRangeFill(input));
    });
    $$(".slider-row input[type='range']").forEach(input => {
      const output = input.parentElement.querySelector("b");
      const update = () => {
        if (output) output.textContent = input.value;
        syncRangeFill(input);
        if (input.id === "rucaBrightnessSlider") document.documentElement.style.setProperty("--ruca-brightness-filter", String(0.45 + Number(input.value) / 80));
        if (input.id === "rucaGlowSlider") document.documentElement.style.setProperty("--ruca-preview-glow-size", `${20 + Number(input.value)}px`);
        if (input.id === "rucaDensitySlider") document.documentElement.style.setProperty("--ruca-density-level", input.value);
        if (input.id === "rucaDepthSlider") document.documentElement.style.setProperty("--ruca-bg-depth", input.value);
        if (input.id === "rucaGlassSlider") document.documentElement.style.setProperty("--ruca-preview-glass-alpha", String(Number(input.value) / 240));
        if (input.id === "rucaMotionSlider") document.documentElement.style.setProperty("--ruca-motion-level", input.value);
      };
      input.addEventListener("input", update);
      update();
    });
    const volumeInputs = [$("#rucaCommandVolume"), $("#rucaAudioVolume"), $("#rucaFooterVolume")].filter(Boolean);
    volumeInputs.forEach(input => input.addEventListener("input", () => {
      volumeInputs.forEach(other => {
        if (other !== input) other.value = input.value;
        syncRangeFill(other);
        const output = other.closest(".slider-row")?.querySelector("b");
        if (output) output.textContent = other.value;
      });
      text("#rucaFooterVolumeValue", input.value);
      document.documentElement.style.setProperty("--ruca-audio-volume", `${input.value}%`);
    }));
    $("#rucaMuteButton")?.addEventListener("click", event => {
      const pressed = event.currentTarget.getAttribute("aria-pressed") === "true";
      event.currentTarget.setAttribute("aria-pressed", String(!pressed));
      event.currentTarget.textContent = pressed ? "ENABLE UI CUES" : "MUTE AUDIO";
      text("#rucaAudioReadout", pressed ? "READY" : "MUTED");
    });
    $("#rucaPowerButton")?.addEventListener("click", () => {
      text("#rucaCommandControlState", "STANDBY SIMULATED");
      text("#rucaCommandControlReadout", "No operating-system power action was sent.");
    });
    $("#rucaSettingsButton")?.addEventListener("click", () => $(".global-theme-section")?.setAttribute("open", ""));
    $$("[data-source-test]").forEach(button => button.addEventListener("click", () => {
      text("#rucaSourceTestOutput", `${button.dataset.sourceTest.toUpperCase()} // PUBLIC DEMO FIXTURE READY // NO EXTERNAL REQUEST`);
    }));
    $("#rucaSaveSourceConfig")?.addEventListener("click", () => text("#rucaSourceTestOutput", "PUBLIC DEMO // source settings were not transmitted or stored"));
    $("#rucaControllerMode")?.addEventListener("change", event => text("#rucaControllerReadout", event.currentTarget.checked ? "COUCH MODE READY" : "KEYBOARD ONLY"));
    $("#rucaTestFocus")?.addEventListener("click", () => $(".world-nav .nav-btn.active")?.focus());
    $("#rucaTestRecovery")?.addEventListener("click", openRecovery);
  }

  function openRecovery() {
    const overlay = $("#rucaRecoveryOverlay");
    overlay?.removeAttribute("inert");
    overlay?.setAttribute("aria-hidden", "false");
    overlay?.classList.add("open");
  }

  function closeRecovery() {
    const overlay = $("#rucaRecoveryOverlay");
    overlay?.setAttribute("aria-hidden", "true");
    overlay?.setAttribute("inert", "");
    overlay?.classList.remove("open");
  }

  function initializeRecovery() {
    $("#rucaRecoveryClose")?.addEventListener("click", closeRecovery);
    $("#rucaRecoveryOverlay")?.addEventListener("click", event => {
      const action = event.target.closest("[data-recovery-action], [data-recovery-power]");
      if (!action) return;
      if (action.dataset.recoveryAction === "return-home") {
        closeRecovery();
        $("[data-page='home']")?.click();
        return;
      }
      text("#rucaRecoveryStatus", "SIMULATED");
      text("#rucaRecoveryDetail", "This public demo never sends native commands or power actions.");
    });
  }

  function initializeNavigation() {
    const routeMap = { home: "home", play: "play", "live-world": "live", live: "live", diagnostics: "diagnostics", control: "control" };
    const syncHash = page => history.replaceState(history.state, "", `#${page === "live" ? "live-world" : page}`);
    $$("[data-page]").forEach(button => button.addEventListener("click", () => syncHash(button.dataset.page)));
    const requested = routeMap[location.hash.replace(/^#/, "")] || "home";
    if (requested !== "home") window.setTimeout(() => $(".world-nav [data-page='" + requested + "']")?.click(), 0);
    $("#coreReturnAnchor")?.addEventListener("click", () => syncHash("home"));
  }

  function initializeSafeCommandFeedback() {
    document.addEventListener("click", event => {
      const command = event.target.closest(".integrated-app-node, #commandWheelAction");
      if (!command) return;
      window.setTimeout(() => {
        const status = $("#pass19LaunchStatus");
        if (status) status.textContent = "PUBLIC DEMO // NOTHING LAUNCHED";
      }, 0);
    });
  }

  function initialize() {
    hydrateHome();
    installHomeGeometry();
    installPlayGeometry();
    initializeLiveWorld();
    initializeDiagnostics();
    initializeControl();
    initializeRecovery();
    initializeNavigation();
    initializeSafeCommandFeedback();
    updateClock();
    window.setInterval(updateClock, 1000);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  }

  initialize();
})();
