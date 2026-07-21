window.RUCA_DEMO_MODE = true;

window.RUCA_DEMO_DATA = Object.freeze({
  identity: {
    product: "RUCA",
    line: "Welcome Home.",
    mode: "DEMO MODE",
    host: "RUCA Demo Host"
  },
  home: {
    score: 96,
    state: "MISSION READY",
    summary: "All demonstration systems are inside their healthy operating range.",
    gauges: [
      { id: "cpu", label: "CPU", value: "31%", numeric: 31, detail: "Responsive headroom" },
      { id: "gpu", label: "GPU", value: "44%", numeric: 44, detail: "Graphics ready" },
      { id: "ram", label: "RAM", value: "48%", numeric: 48, detail: "Memory stable" },
      { id: "storage", label: "STORAGE", value: "91%", numeric: 91, detail: "Health index" },
      { id: "network", label: "NETWORK", value: "284 / 21", numeric: 62, detail: "Mbps down / up" },
      { id: "thermal", label: "THERMAL", value: "53\u00b0C", numeric: 53, detail: "Cooling normal" }
    ]
  },
  play: {
    districts: [
      {
        id: "games",
        label: "Games District",
        icon: "gamepad",
        description: "Libraries and mission launchers.",
        commands: [
          { id: "steam", label: "Steam", role: "Game library", status: "DEMO READY" },
          { id: "xbox", label: "Xbox", role: "Game service", status: "DEMO READY" },
          { id: "call-of-duty", label: "Call of Duty", role: "Mission preview", status: "DEMO READY" }
        ]
      },
      {
        id: "media",
        label: "Media District",
        icon: "media",
        description: "Music, video, and voice handoffs.",
        commands: [
          { id: "spotify", label: "Spotify", role: "Music portal", status: "DEMO READY" },
          { id: "netflix", label: "Netflix", role: "Streaming portal", status: "DEMO READY" },
          { id: "discord", label: "Discord", role: "Voice stack", status: "DEMO READY" }
        ]
      },
      {
        id: "creative",
        label: "Creative District",
        icon: "creative",
        description: "Design and production workspaces.",
        commands: [
          { id: "figma", label: "Figma", role: "Design studio", status: "DEMO READY" },
          { id: "adobe-express", label: "Adobe Express", role: "Creative quick tools", status: "DEMO READY" },
          { id: "vs-code", label: "VS Code", role: "Development module", status: "DEMO READY" }
        ]
      },
      {
        id: "system",
        label: "System District",
        icon: "system",
        description: "Safe previews of system utilities.",
        commands: [
          { id: "explorer", label: "File Explorer", role: "File system preview", status: "DEMO ONLY" },
          { id: "task-manager", label: "Task Manager", role: "Process overview", status: "DEMO ONLY" },
          { id: "settings", label: "Settings", role: "Control preview", status: "DEMO ONLY" }
        ]
      }
    ]
  },
  live: {
    weather: {
      label: "WEATHER",
      location: "Demo Harbor",
      temperature: "72\u00b0",
      condition: "Clear evening",
      feels: "Feels like 71\u00b0",
      wind: "8 mph",
      humidity: "46%",
      sunrise: "6:12 AM",
      sunset: "8:41 PM",
      forecast: [
        { day: "MON", high: 76, low: 61, state: "CLEAR" },
        { day: "TUE", high: 79, low: 64, state: "CLOUDS" },
        { day: "WED", high: 74, low: 60, state: "RAIN" },
        { day: "THU", high: 77, low: 62, state: "CLEAR" },
        { day: "FRI", high: 81, low: 66, state: "CLEAR" }
      ]
    },
    markets: {
      label: "MARKETS",
      condition: "Demo session steady",
      indices: [
        { symbol: "S&P", value: "5,482.10", change: "+0.42%", points: [20, 24, 23, 31, 29, 36, 39] },
        { symbol: "NASDAQ", value: "17,862.23", change: "+0.68%", points: [18, 22, 29, 27, 35, 42, 46] },
        { symbol: "DOW", value: "39,308.00", change: "-0.06%", points: [37, 34, 35, 31, 33, 29, 30] }
      ],
      movers: [
        { symbol: "NVDA", move: "+2.4%", tone: "up" },
        { symbol: "AMD", move: "+1.1%", tone: "up" },
        { symbol: "TSLA", move: "-0.8%", tone: "down" }
      ]
    },
    news: {
      label: "NEWS",
      hero: {
        source: "RUCA Demo Desk",
        time: "12 MIN",
        title: "Console simplicity and PC power converge in a new command environment",
        summary: "A product demonstration explores how telemetry, launch controls, intelligence feeds, and diagnostics can feel like one coherent place."
      },
      stories: [
        { source: "Demo Signal", time: "25 MIN", title: "Handheld interfaces move toward contextual command layers" },
        { source: "Demo Brief", time: "41 MIN", title: "Performance overlays become calmer and more useful" },
        { source: "Demo Wire", time: "1 HR", title: "Accessibility remains central to couch-first interaction" }
      ]
    },
    sports: {
      label: "SPORTS",
      hero: { league: "NBA", away: "NORTH", home: "SOUTH", awayScore: 101, homeScore: 104, state: "FINAL" },
      games: [
        { league: "NFL", away: "CITY", home: "COAST", time: "SUN 1:00 PM" },
        { league: "MLB", away: "HARBOR", home: "METRO", time: "7:10 PM" },
        { league: "NHL", away: "ICE", home: "FIRE", time: "TUE 8:00 PM" }
      ]
    },
    tech: {
      label: "TECH",
      hero: {
        signal: "HARDWARE",
        title: "New cooling designs prioritize acoustic comfort under sustained load",
        summary: "The demonstration signal looks at quieter thermal systems and clearer health guidance for everyday users."
      },
      signals: [
        { category: "AI", title: "Local assistants gain better privacy controls" },
        { category: "SOFTWARE", title: "Game launchers test unified library views" },
        { category: "SPACE", title: "Compact sensors improve mission telemetry" },
        { category: "DEV", title: "Offline-first apps receive renewed attention" }
      ]
    }
  },
  diagnostics: {
    ready: {
      severity: "SAFE",
      score: 96,
      affected: "Whole system",
      meaning: "The demonstration machine is operating inside its expected range.",
      matters: "Stable temperatures and available headroom support a smooth session.",
      check: "Nothing requires immediate attention.",
      action: "Continue using the system normally."
    },
    advisory: {
      severity: "WATCH",
      score: 78,
      affected: "Memory",
      meaning: "Memory use is elevated in this educational example.",
      matters: "Demanding games may have less room for background applications.",
      check: "Review open apps before starting a large game.",
      action: "Close unused apps if performance begins to feel inconsistent."
    },
    sensors: [
      { label: "CPU load", ready: "31%", advisory: "52%" },
      { label: "GPU load", ready: "44%", advisory: "61%" },
      { label: "Memory", ready: "48%", advisory: "86%" },
      { label: "Storage health", ready: "91%", advisory: "91%" },
      { label: "Thermal", ready: "53\u00b0C", advisory: "67\u00b0C" },
      { label: "Fan policy", ready: "NORMAL", advisory: "ACTIVE" }
    ]
  },
  controls: {
    defaults: {
      glow: 62,
      motion: 48,
      density: 56,
      glass: 58,
      depth: 64,
      brightness: 72,
      accent: "#d6b36b"
    },
    presets: [
      { id: "gold", label: "Warm Gold", accent: "#d6b36b" },
      { id: "red", label: "Red Alert", accent: "#f05b4f" },
      { id: "cyan", label: "Flight Cyan", accent: "#61b7ff" }
    ]
  }
});
