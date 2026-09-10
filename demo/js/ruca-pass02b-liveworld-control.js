
/* RUCA PASS02B // In-place logic layer
   Keeps PASS02 shell. Adds topbar icons, real Live World lanes, safer telemetry formatting, and Control customization. */
(function(){
  const qs = (s,root=document)=>root.querySelector(s);
  const qsa = (s,root=document)=>Array.from(root.querySelectorAll(s));
  const root = document.documentElement;
  const DEFAULT_WEATHER = {name:'NEW YORK // SAMPLE', lat:40.7128, lon:-74.0060};
  const HOME_TELEMETRY_EMPTY = {
    cpu: 'CHECKING',
    gpu: 'CHECKING',
    ram: 'CHECKING',
    therm: 'CHECKING',
    storage: 'CHECKING',
    network: 'CHECKING',
    networkDown: 'CHECKING',
    networkUp: 'CHECKING'
  };
  const LOUNGE_PROFILE_ID = 'RUCA_DEMO_LOUNGE';
  const TELEMETRY_OWNER_ID = 'ruca-pass02b-liveworld-control.js';
  const LOCAL_BRIDGE_ORIGIN = '';
  const TELEMETRY_ENDPOINT = `${LOCAL_BRIDGE_ORIGIN}/telemetry`;
  const TELEMETRY_INVENTORY_ENDPOINT = `${LOCAL_BRIDGE_ORIGIN}/telemetry/inventory`;
  const TELEMETRY_STALE_AFTER_MS = 10000;
  const INVENTORY_REFRESH_MS = 6000;
  const DIGITAL_NAV_INITIAL_DELAY_MS = 200;
  const DIGITAL_NAV_REPEAT_INTERVAL_MS = 70;
  const DIGITAL_NAV_KEYBOARD_DEDUPE_MS = 110;
  const CUSTOM_THEME_PROFILE_STORAGE_KEY = 'rucaCustomThemeProfilesV1';
  const ACTIVE_THEME_PROFILE_STORAGE_KEY = 'rucaActiveThemeProfileSlot';
  const CUSTOM_THEME_PROFILE_SLOT_COUNT = 4;
  const LIVE_WORLD_REALMS = [
    {key:'weather', label:'WEATHER'},
    {key:'market', label:'MARKET'},
    {key:'news', label:'WORLD BRIEFING'},
    {key:'sports', label:'GAME DAY'},
    {key:'celestial', label:'CELESTIAL OBSERVATORY'}
  ];
  const LIVE_REFRESH_MIN_SECONDS = 180;
  const LIVE_REFRESH_MAX_SECONDS = 900;
  const LIVE_REFRESH_DEFAULT_SECONDS = 300;
  const state = {
    theme:null,
    weather:null,
    weatherPlace:null,
    markets:null,
    news:null,
    sports:null,
    tech:null,
    signal:null,
    celestial:null,
    sources:null,
    lastLane:'weather',
    sportsLeague:'ALL',
    laneRequestId:0,
    liveRefresh:{
      seconds:LIVE_REFRESH_DEFAULT_SECONDS,
      minimum:LIVE_REFRESH_MIN_SECONDS,
      maximum:LIVE_REFRESH_MAX_SECONDS,
      timerId:0,
      owner:'ruca_local_bridge.py',
      lastReason:'boot'
    },
    homeTelemetry:{...HOME_TELEMETRY_EMPTY},
    telemetryWrite:false,
    telemetryGuard:false,
    telemetryOnline:false,
    telemetryStatus:'CHECKING',
    telemetryError:null,
    telemetryRequest:null,
    normalizedTelemetry:null,
    normalizedInventory:null,
    inventoryError:null,
    inventoryRefreshAt:0,
    inventoryRequest:null,
    inventorySelection:{domain:'CPU', deviceId:'', sensorId:''},
    monitorTrace:{series:{}, order:[], maxSamples:48, maxSensors:12},
    benchmark:{registry:null, selectedCategory:'QUICK ASSESSMENT', activeJob:null, loading:false, lastTerminalKey:''},
    diagnosticKey:'CPU',
    diagnosticOwnerInstalled:false,
    lastTelemetry:null,
    loungeDetailOpen:false,
    controller:{
      enabled:false,
      pollId:0,
      lastMove:0,
      focusMarkQueued:false,
      lastHoverCue:0,
      lastButtons:{},
      gamepadName:'',
      focusStrength:70,
      cursorX:0,
      cursorY:0,
      cursorReady:false,
      cursorEl:null,
      cursorTarget:null,
      analogActive:false,
      emergencyHoldStarted:0,
      emergencyHoldTriggered:false,
      digitalRepeat:{
        key:'',
        startedAt:0,
        nextAt:0,
        lastActionAt:0,
        lastDirection:'',
        blockedUntilRelease:false,
        resetReason:'boot'
      }
    },
    audio:{
      ctx:null,
      master:null,
      enabled:false,
      blocked:false,
      error:'',
      volume:25,
      lastCue:'none'
    },
    command:{
      brightness:62,
      preDimBrightness:62,
      dimNight:false,
      standby:false,
      lastStatus:'READY',
      searchItems:[],
      searchMatches:[],
      keyboardPage:'lower',
      keyboardVisible:true,
      launchPending:false
    },
    activation:{
      synthetic:false,
      source:'',
      lastTarget:null,
      lastResult:null,
      lastAt:0
    },
    recovery:{
      monitorEnabled:true,
      eventId:0,
      token:'',
      pollId:0,
      polling:false,
      globalSupported:false,
      guideSupported:false,
      pendingPower:'',
      pendingPowerTimer:0,
      lastStatus:null
    }
  };
  let editorialCarouselTimer = 0;
  let themeAuthorityRevision = 0;
  let lastStarfieldConfigSignature = '';

  function requestSemanticPulse(type, detail={}){
    window.dispatchEvent(new CustomEvent('ruca:semantic-pulse-request', {
      detail:Object.freeze({type, ...detail})
    }));
  }

  const CONTROLLER_INTERACTIVE_SELECTOR = 'button,a,input,select,textarea,summary,[tabindex]:not([tabindex="-1"]),.launch-node,.app-card,.command-wheel-action,.portal-card,.lane-action,.bottom-card,.source-action,.sensor-tab,.bench-tab,.ruca-card,.command-node,.command-search-result,.core-return-anchor';

  const PASS13_STAR_PRESETS = {
    warm: {starName:'Warm Gold', starPreset:'warm', starColor:'#f5d98f', starBrightness:62, starDensity:64, starBreath:34, starDrift:28},
    blood: {starName:'Blood Red', starPreset:'blood', starColor:'#ff3030', starBrightness:68, starDensity:60, starBreath:42, starDrift:24},
    ice: {starName:'Ice Blue', starPreset:'ice', starColor:'#61b7ff', starBrightness:58, starDensity:70, starBreath:28, starDrift:20},
    emerald: {starName:'Emerald', starPreset:'emerald', starColor:'#47e6a4', starBrightness:56, starDensity:74, starBreath:30, starDrift:22},
    violet: {starName:'Violet', starPreset:'violet', starColor:'#b88cff', starBrightness:60, starDensity:66, starBreath:36, starDrift:26},
    founder: {starName:'Founder Custom', starPreset:'founder', starColor:'#ffffff', starBrightness:72, starDensity:62, starBreath:26, starDrift:18}
  };

  const HOME_VIEW_PRESETS = Object.freeze({
    desk:82,
    standard:91,
    couch:100
  });

  const PASS50_THEME_TOKENS = Object.freeze({
    primary:{css:'--ruca-theme-primary', control:'rucaPalettePrimary', group:'accents'},
    secondary:{css:'--ruca-theme-secondary', control:'rucaPaletteSecondary', group:'accents'},
    tertiary:{css:'--ruca-theme-tertiary', control:'rucaPaletteTertiary', group:'accents'},
    background:{css:'--ruca-theme-background', control:'rucaPaletteBackground', group:'environment'},
    housing:{css:'--ruca-theme-housing', control:'rucaPaletteHousing', group:'materials'},
    bezel:{css:'--ruca-theme-bezel', control:'rucaPaletteBezel', group:'materials'},
    screws:{css:'--ruca-theme-screws', control:'rucaPaletteScrews', group:'materials'},
    mechanicalMetal:{css:'--ruca-theme-mechanical-metal', control:'rucaPaletteMechanicalMetal', group:'materials'},
    gears:{css:'--ruca-theme-gears', control:'rucaPaletteGears', group:'materials'},
    jewels:{css:'--ruca-theme-jewels', control:'rucaPaletteJewels', group:'materials'},
    glassTint:{css:'--ruca-theme-glass-tint', control:'rucaPaletteGlassTint', group:'materials'},
    telemetryTrace:{css:'--ruca-theme-telemetry-trace', control:'rucaPaletteTelemetryTrace', group:'instruments'},
    needles:{css:'--ruca-theme-needles', control:'rucaPaletteNeedles', group:'instruments'},
    rails:{css:'--ruca-theme-rails', control:'rucaPaletteRails', group:'instruments'},
    conduitPackets:{css:'--ruca-theme-conduit-packets', control:'rucaPaletteConduitPackets', group:'energy'},
    stars:{css:'--ruca-theme-stars', control:'rucaPaletteStars', group:'environment'},
    particles:{css:'--ruca-theme-particles', control:'rucaPaletteParticles', group:'environment'},
    aura:{css:'--ruca-theme-aura', control:'rucaPaletteAura', group:'environment'},
    glow:{css:'--ruca-theme-glow', control:'rucaPaletteGlow', group:'energy'},
    primaryText:{css:'--ruca-theme-primary-text', control:'rucaPalettePrimaryText', group:'typography'},
    secondaryText:{css:'--ruca-theme-secondary-text', control:'rucaPaletteSecondaryText', group:'typography'},
    mutedText:{css:'--ruca-theme-muted-text', control:'rucaPaletteMutedText', group:'typography'},
    warning:{css:'--ruca-theme-warning', control:'rucaPaletteWarning', group:'states'},
    critical:{css:'--ruca-theme-critical', control:'rucaPaletteCritical', group:'states'},
    success:{css:'--ruca-theme-success', control:'rucaPaletteSuccess', group:'states'}
  });

  const PASS50_THEME_GROUPS = Object.freeze({
    accents:Object.freeze(['primary','secondary','tertiary']),
    materials:Object.freeze(['housing','bezel','screws','mechanicalMetal','gears','jewels','glassTint']),
    instruments:Object.freeze(['telemetryTrace','needles','rails']),
    energy:Object.freeze(['conduitPackets','glow']),
    environment:Object.freeze(['background','stars','particles','aura']),
    typography:Object.freeze(['primaryText','secondaryText','mutedText']),
    states:Object.freeze(['warning','critical','success'])
  });

  const PASS50_ENGINE_DEFAULT_PALETTE = Object.freeze({
    primary:'#ff0000',
    secondary:'#ff0000',
    tertiary:'#ffffff',
    background:'#030405',
    housing:'#111518',
    bezel:'#8a9397',
    screws:'#7f888c',
    mechanicalMetal:'#c6ced1',
    gears:'#c6ced1',
    jewels:'#d71d2d',
    glassTint:'#020507',
    telemetryTrace:'#ff0000',
    needles:'#ff0000',
    rails:'#ff0000',
    conduitPackets:'#ff0000',
    stars:'#ff0000',
    particles:'#f5d98f',
    aura:'#ff0000',
    glow:'#ff0000',
    primaryText:'#e8eced',
    secondaryText:'#a7a6a0',
    mutedText:'#bcc5c8',
    warning:'#ffb957',
    critical:'#f05b4f',
    success:'#47e6a4'
  });

  /*
   * Surface colors are derived outputs, never palette authorities. Each recipe
   * starts from one of the 25 semantic tokens so the approved default can keep
   * its exact machined-metal tonal steps while a manual edit still recolors the
   * entire material family through the one PASS50 renderer.
   */
  const PASS50_SURFACE_RECIPES = Object.freeze({
    '--ruca-surface-background-deep':['background',-1,-1,-1],
    '--ruca-surface-body-background':['background',-1,0,-1],
    '--ruca-surface-primary-98':['primary',-5,0,0],
    '--ruca-surface-shell-blue':['particles',-148,-34,112],
    '--ruca-surface-shell-dark-a':['background',-2,-1,1],
    '--ruca-surface-shell-dark-b':['background',0,2,5],
    '--ruca-surface-shell-dark-c':['background',-2,-2,-1],
    '--ruca-surface-brand-glow':['glow',-44,22,22],
    '--ruca-surface-glass-panel':['glassTint',10,9,11,.64],
    '--ruca-surface-text-inherited':['primaryText',5,4,4],
    '--ruca-surface-nav-active':['primaryText',23,5,-8],
    '--ruca-surface-text-ticks':['primaryText',-5,-4,-4,.42],
    '--ruca-surface-text-scale':['primaryText',-4,-4,-4,.42],
    '--ruca-surface-text-heart-state':['primaryText',-6,-5,-5,.74],
    '--ruca-surface-heart-border':['bezel',-12,-14,-15],
    '--ruca-surface-heart-glass-border':['mechanicalMetal',12,12,11,.18],
    '--ruca-surface-heart-fastener-border':['screws',-2,-3,-4],
    '--ruca-surface-heart-fastener-highlight':['screws',88,84,81],
    '--ruca-surface-heart-fastener-mid':['screws',-31,-33,-34],
    '--ruca-surface-heart-fastener-dark':['screws',-110,-116,-118],
    '--ruca-surface-heart-metal-1':['housing',-7,-8,-9],
    '--ruca-surface-heart-metal-2':['housing',87,91,92],
    '--ruca-surface-heart-metal-3':['housing',-9,-11,-12],
    '--ruca-surface-heart-metal-4':['housing',45,48,49],
    '--ruca-surface-heart-metal-5':['housing',-10,-12,-13],
    '--ruca-surface-heart-metal-6':['housing',99,103,104],
    '--ruca-surface-heart-metal-7':['housing',48,51,52],
    '--ruca-surface-heart-metal-8':['housing',74,78,79],
    '--ruca-surface-heart-inner-metal':['housing',-7,-9,-10],
    '--ruca-surface-heart-glass-1':['glassTint',5,5,6],
    '--ruca-surface-heart-glass-2':['glassTint',35,38,40],
    '--ruca-surface-heart-glass-3':['glassTint',0,-1,-1],
    '--ruca-surface-heart-glass-4':['glassTint',66,70,72],
    '--ruca-surface-heart-glass-5':['glassTint',4,4,4],
    '--ruca-surface-heart-glass-6':['glassTint',30,33,35],
    '--ruca-surface-heart-glass-7':['glassTint',-1,-3,-4],
    '--ruca-surface-heart-ring-outer':['bezel',5,3,1],
    '--ruca-surface-heart-ring-inner':['bezel',27,24,22],
    '--ruca-surface-heart-aperture-border':['bezel',1,-2,-3],
    '--ruca-surface-heart-mount-border':['bezel',2,0,-2],
    '--ruca-surface-heart-inner-ticks':['primaryText',-7,-6,-6,.50],
    '--ruca-surface-heart-label':['primaryText',-4,-5,-5],
    '--ruca-surface-heart-mount-dark':['background',2,2,2],
    '--ruca-surface-housing-blue-down':['housing',0,0,-1],
    '--ruca-surface-gauge-border':['bezel',-22,-22,-22],
    '--ruca-surface-gauge-bezel-border':['housing',20,23,23],
    '--ruca-surface-gauge-bezel-common':['housing',15,18,19],
    '--ruca-surface-port-highlight':['mechanicalMetal',-12,-10,-10,.34],
    '--ruca-surface-port-dark':['background',1,2,2],
    '--ruca-surface-port-edge':['mechanicalMetal',-38,-36,-35,.30],
    '--ruca-surface-ring-anchor':['bezel',-33,-34,-34],
    '--ruca-surface-ring-metal-a':['housing',35,37,37],
    '--ruca-surface-ring-metal-b':['housing',59,63,64],
    '--ruca-surface-secondary-border':['bezel',-3,-2,-2,.62],
    '--ruca-surface-glass-border':['mechanicalMetal',-7,-5,-5,.22],
    '--ruca-surface-cpu-metal-4':['housing',74,79,80],
    '--ruca-surface-cpu-metal-6':['housing',30,32,32],
    '--ruca-surface-cpu-metal-7':['housing',-9,-10,-11],
    '--ruca-surface-cpu-metal-8':['housing',65,70,71],
    '--ruca-surface-cpu-ring-2':['housing',34,37,38],
    '--ruca-surface-screw-border':['screws',37,37,36],
    '--ruca-surface-screw-cap':['screws',92,88,86],
    '--ruca-surface-screw-common-highlight':['screws',100,95,92],
    '--ruca-surface-screw-common-dark':['screws',-111,-117,-119],
    '--ruca-surface-screw-highlight':['screws',111,105,102],
    '--ruca-surface-screw-mid':['screws',-8,-8,-8],
    '--ruca-surface-screw-dark':['screws',-104,-109,-111],
    '--ruca-surface-bridge-border':['mechanicalMetal',-7,-6,-6,.52],
    '--ruca-surface-bridge-highlight':['mechanicalMetal',-17,-16,-16,.58],
    '--ruca-surface-balance-spokes':['mechanicalMetal',-19,-18,-18,.58],
    '--ruca-surface-carrier-spokes':['mechanicalMetal',-17,-16,-16,.48],
    '--ruca-surface-gear-anchor':['gears',-86,-85,-84],
    '--ruca-surface-gear-dark':['gears',-175,-178,-178],
    '--ruca-surface-balance-anchor':['mechanicalMetal',-85,-84,-83],
    '--ruca-surface-carrier-anchor':['mechanicalMetal',-93,-92,-91],
    '--ruca-surface-index-anchor':['gears',-106,-105,-104],
    '--ruca-surface-cpu-bridge-border':['mechanicalMetal',-21,-19,-19,.46],
    '--ruca-surface-cpu-bridge-1':['housing',0,1,1],
    '--ruca-surface-cpu-bridge-2':['housing',44,48,49],
    '--ruca-surface-cpu-bridge-3':['housing',4,6,6],
    '--ruca-surface-cpu-bridge-4':['housing',35,39,40],
    '--ruca-surface-cpu-bridge-5':['housing',-6,-6,-7],
    '--ruca-surface-cpu-bridge-reflection':['mechanicalMetal',19,18,17,.13],
    '--ruca-surface-cpu-gear-border':['gears',-24,-21,-20,.72],
    '--ruca-surface-cpu-gear-highlight':['gears',19,17,16],
    '--ruca-surface-cpu-gear-hub':['gears',-152,-152,-151],
    '--ruca-surface-cpu-gear-inner':['gears',-177,-179,-179],
    '--ruca-surface-cpu-gear-tooth':['gears',-35,-33,-32],
    '--ruca-surface-cpu-gear-tooth-dark':['gears',-166,-167,-167],
    '--ruca-surface-cpu-balance-border':['mechanicalMetal',-11,-9,-9,.72],
    '--ruca-surface-cpu-balance-spokes':['mechanicalMetal',-5,-3,-3,.62],
    '--ruca-surface-cpu-shaft-border':['mechanicalMetal',-21,-19,-19,.58],
    '--ruca-surface-shaft-key':['background',2,3,3],
    '--ruca-surface-shaft-a':['mechanicalMetal',-58,-56,-55],
    '--ruca-surface-shaft-b':['mechanicalMetal',-161,-162,-161],
    '--ruca-surface-shaft-c':['mechanicalMetal',-15,-14,-14],
    '--ruca-surface-shaft-d':['mechanicalMetal',-175,-177,-177],
    '--ruca-surface-shaft-e':['mechanicalMetal',-75,-73,-72],
    '--ruca-surface-shaft-f':['mechanicalMetal',-156,-157,-157],
    '--ruca-surface-jewel-border':['jewels',40,166,154,.46],
    '--ruca-surface-jewel-highlight':['jewels',40,184,171],
    '--ruca-surface-jewel-dark':['jewels',-118,-25,-32],
    '--ruca-surface-jewel-deep':['jewels',-192,-28,-41],
    '--ruca-surface-cpu-jewel-border':['jewels',20,139,128,.56],
    '--ruca-surface-cpu-jewel-highlight':['jewels',40,198,184],
    '--ruca-surface-cpu-jewel-base':['jewels',-18,4,1],
    '--ruca-surface-cpu-jewel-dark':['jewels',-127,-24,-33],
    '--ruca-surface-cpu-jewel-deep':['jewels',-196,-28,-42],
    '--ruca-surface-cpu-jewel-seat':['background',3,4,4],
    '--ruca-surface-needle-base':['housing',10,11,10],
    '--ruca-surface-hub-highlight':['mechanicalMetal',33,29,27],
    '--ruca-surface-hub-mid':['mechanicalMetal',-101,-101,-101],
    '--ruca-surface-hub-dark':['housing',-1,-1,-2],
    '--ruca-surface-warning-instrument':['warning',0,-9,-87],
    '--ruca-surface-critical-instrument':['critical',-28,-91,-79],
    '--ruca-surface-success-instrument':['success',6,-76,-49],
    '--ruca-surface-label-anchor':['bezel',5,6,5],
    '--ruca-surface-network-upload':['telemetryTrace',0,70,70],
    '--ruca-surface-conduit-glass':['mechanicalMetal',-18,-16,-16,.18],
    '--ruca-surface-conduit-border':['bezel',-53,-54,-54],
    '--ruca-surface-pivot-border':['bezel',-24,-25,-26],
    '--ruca-surface-metal-1':['housing',-10,-12,-14],
    '--ruca-surface-metal-2':['housing',58,62,63],
    '--ruca-surface-metal-3':['housing',-6,-7,-8],
    '--ruca-surface-metal-4':['housing',79,84,85],
    '--ruca-surface-metal-5':['housing',-8,-9,-10],
    '--ruca-surface-metal-6':['housing',49,52,53],
    '--ruca-surface-metal-7':['housing',-7,-8,-9],
    '--ruca-surface-metal-8':['housing',71,75,76],
    '--ruca-surface-conduit-metal-2':['housing',26,27,27],
    '--ruca-surface-conduit-metal-3':['housing',-8,-10,-11],
    '--ruca-surface-conduit-metal-4':['housing',31,32,32]
  });

  function paletteFromAccents(primary, secondary, tertiary, overrides={}){
    return Object.freeze({
      ...PASS50_ENGINE_DEFAULT_PALETTE,
      primary,
      secondary,
      tertiary,
      telemetryTrace:primary,
      needles:primary,
      rails:primary,
      conduitPackets:primary,
      stars:primary,
      particles:secondary,
      aura:primary,
      glow:primary,
      primaryText:tertiary,
      ...overrides
    });
  }

  const PASS50_PRESET_PALETTES = Object.freeze({
    default:PASS50_ENGINE_DEFAULT_PALETTE,
    lounge:paletteFromAccents('#d6b36b','#f5d98f','#fff8e8',{stars:'#f5d98f', particles:'#61b7ff', aura:'#d6b36b', glow:'#d6b36b'}),
    red:paletteFromAccents('#ff3030','#ff8a5c','#fff1ed',{stars:'#ff3030', particles:'#ff8a5c', aura:'#ff3030', glow:'#ff3030'}),
    neon:paletteFromAccents('#d8ff2f','#fff46a','#f7ffe2',{stars:'#fff46a', particles:'#d8ff2f', aura:'#fff46a', glow:'#d8ff2f'}),
    night:paletteFromAccents('#6f8cff','#a8bbff','#dce6ff',{stars:'#61b7ff', particles:'#a8bbff', aura:'#6f8cff', glow:'#6f8cff'}),
    diagnostics:paletteFromAccents('#47e6a4','#b9ffd9','#eafff5',{stars:'#47e6a4', particles:'#b9ffd9', aura:'#47e6a4', glow:'#47e6a4'}),
    violet:paletteFromAccents('#9b6cff','#d7b8ff','#f4edff',{stars:'#b88cff', particles:'#d7b8ff', aura:'#9b6cff', glow:'#9b6cff'}),
    founder:paletteFromAccents('#d6b36b','#f5d98f','#fff8e8',{stars:'#ffffff', particles:'#f5d98f', aura:'#d6b36b', glow:'#d6b36b'})
  });

  const PASS50_PALETTE_PROVIDERS = Object.freeze({
    system:Object.freeze({
      label:'System',
      palettes:Object.freeze({
        default:PASS50_PRESET_PALETTES.default,
        neon:PASS50_PRESET_PALETTES.neon,
        diagnostics:PASS50_PRESET_PALETTES.diagnostics
      })
    }),
    automotive:Object.freeze({
      label:'Automotive',
      palettes:Object.freeze({
        red:PASS50_PRESET_PALETTES.red,
        night:PASS50_PRESET_PALETTES.night
      })
    }),
    luxury:Object.freeze({
      label:'Luxury',
      palettes:Object.freeze({
        lounge:PASS50_PRESET_PALETTES.lounge,
        violet:PASS50_PRESET_PALETTES.violet,
        founder:PASS50_PRESET_PALETTES.founder
      })
    }),
    sports:Object.freeze({
      label:'Sports',
      source:'PASS14_TEAM_REALMS',
      palette:paletteFromAccents('#00338d','#c60c30','#ffffff')
    }),
    future:Object.freeze({
      label:'Future provider',
      contract:'Supply a presetPalette to resolvePaletteLayers.',
      palette:PASS50_PRESET_PALETTES.default
    })
  });

  const PASS12_THEME_PRESETS = {
    default: {name:'RUCA Approved Red', palette:PASS50_PRESET_PALETTES.default, provider:'system', gold:'#ff0000', gold2:'#ff0000', text:'#fa0000', font:'"Segoe UI", Inter, Roboto, Arial, sans-serif', depth:64, glow:56, glass:72, motion:42, density:64, reducedMotion:false, homeViewMode:'desk', homeScale:HOME_VIEW_PRESETS.desk, ...PASS13_STAR_PRESETS.blood},
    lounge: {name:'DEMO Lounge', palette:PASS50_PRESET_PALETTES.lounge, provider:'luxury', gold:'#d6b36b', gold2:'#f5d98f', text:'#fff8e8', font:'"Roboto Condensed", "Segoe UI", Arial, sans-serif', depth:48, glow:28, glass:42, motion:18, density:42, reducedMotion:false, ...PASS13_STAR_PRESETS.warm, starName:'Lounge Gold', starBrightness:36, starDensity:32, starBreath:12, starDrift:14},
    red: {name:'Blood Red', palette:PASS50_PRESET_PALETTES.red, provider:'automotive', gold:'#ff3030', gold2:'#ff8a5c', text:'#fff1ed', font:'"Segoe UI", Inter, Roboto, Arial, sans-serif', depth:72, glow:74, glass:66, motion:38, density:58, reducedMotion:false, ...PASS13_STAR_PRESETS.blood},
    neon: {name:'Neon Yellow', palette:PASS50_PRESET_PALETTES.neon, provider:'system', gold:'#d8ff2f', gold2:'#fff46a', text:'#f7ffe2', font:'"Segoe UI", Inter, Roboto, Arial, sans-serif', depth:68, glow:80, glass:62, motion:44, density:54, reducedMotion:false, ...PASS13_STAR_PRESETS.warm, starColor:'#fff46a', starBrightness:74},
    night: {name:'Ice Blue', palette:PASS50_PRESET_PALETTES.night, provider:'automotive', gold:'#6f8cff', gold2:'#a8bbff', text:'#dce6ff', font:'Inter, "Segoe UI", Arial, sans-serif', depth:42, glow:28, glass:52, motion:22, density:70, reducedMotion:false, ...PASS13_STAR_PRESETS.ice},
    diagnostics: {name:'Emerald', palette:PASS50_PRESET_PALETTES.diagnostics, provider:'system', gold:'#47e6a4', gold2:'#b9ffd9', text:'#eafff5', font:'"Roboto Condensed", "Segoe UI", Arial, sans-serif', depth:58, glow:50, glass:60, motion:30, density:78, reducedMotion:false, ...PASS13_STAR_PRESETS.emerald},
    violet: {name:'Violet', palette:PASS50_PRESET_PALETTES.violet, provider:'luxury', gold:'#9b6cff', gold2:'#d7b8ff', text:'#f4edff', font:'"Roboto Condensed", "Segoe UI", Arial, sans-serif', depth:66, glow:62, glass:68, motion:34, density:70, reducedMotion:false, ...PASS13_STAR_PRESETS.violet},
    founder: {name:'Black / Gold', palette:PASS50_PRESET_PALETTES.founder, provider:'luxury', gold:'#d6b36b', gold2:'#f5d98f', text:'#fff8e8', font:'"Segoe UI", Inter, Roboto, Arial, sans-serif', depth:76, glow:68, glass:74, motion:36, density:60, reducedMotion:false, ...PASS13_STAR_PRESETS.founder}
  };

  const PASS14_TEAM_REALMS = {
    NBA: {
      Knicks: team('NBA','Knicks','NYK','#f58426','#006bb6','#bec0c2'),
      Lakers: team('NBA','Lakers','LAL','#552583','#fdb927','#ffffff'),
      Celtics: team('NBA','Celtics','BOS','#007a33','#ba9653','#ffffff')
    },
    MLB: {
      Mets: team('MLB','Mets','NYM','#ff5910','#002d72','#ffffff'),
      Yankees: team('MLB','Yankees','NYY','#0c2340','#c4ced4','#ffffff'),
      Dodgers: team('MLB','Dodgers','LAD','#005a9c','#ef3e42','#ffffff')
    },
    NFL: {
      Bills: team('NFL','Bills','BUF','#00338d','#c60c30','#ffffff'),
      Cardinals: team('NFL','Cardinals','ARI','#97233f','#000000','#ffb612'),
      Giants: team('NFL','Giants','NYG','#0b2265','#a71930','#ffffff')
    },
    NHL: {
      Rangers: team('NHL','Rangers','NYR','#0038a8','#ce1126','#ffffff'),
      Predators: team('NHL','Predators','NSH','#ffb81c','#041e42','#ffffff'),
      Islanders: team('NHL','Islanders','NYI','#00539b','#f47d30','#ffffff')
    }
  };

  function team(league, name, initials, primary, secondary, highlight){
    return {
      league, name, initials, primary, secondary, highlight,
      presets: {
        home: teamPreset('Home', primary, secondary, highlight, 68, 70, 34, 24),
        away: teamPreset('Away', highlight, primary, secondary, 58, 60, 24, 18),
        alternate: teamPreset('Alternate', secondary, primary, highlight, 72, 66, 38, 28),
        arena: teamPreset('Arena', primary, highlight, secondary, 76, 78, 46, 34),
        victory: teamPreset('Victory Pulse', highlight, primary, secondary, 88, 84, 62, 42)
      }
    };
  }

  function teamPreset(label, primary, secondary, highlight, brightness, density, breath, drift){
    return {
      label,
      palette:paletteFromAccents(primary, secondary, highlight, {
        stars:primary,
        particles:secondary,
        aura:primary,
        glow:primary,
        primaryText:highlight
      }),
      gold: primary,
      gold2: highlight,
      text: '#fff8ea',
      starColor: primary,
      starColor2: secondary,
      starBrightness: brightness,
      starDensity: density,
      starBreath: breath,
      starDrift: drift,
      glow: Math.min(88, brightness),
      glass: 68,
      motion: Math.min(58, drift + 14),
      density: Math.min(84, density)
    };
  }

  const codeMap = {
    0:'Clear',1:'Mostly clear',2:'Partly cloudy',3:'Cloudy',45:'Fog',48:'Rime fog',
    51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',
    71:'Light snow',73:'Snow',75:'Heavy snow',80:'Rain showers',81:'Showers',82:'Heavy showers',
    95:'Thunderstorm',96:'Storm / hail',99:'Storm / heavy hail'
  };

  function weatherKind(code, isDay=1){
    const value = Number(code);
    let kind = 'cloud';
    if(value === 0) kind = Number(isDay) === 0 ? 'clear-night' : 'clear-day';
    else if([1,2].includes(value)) kind = 'partly';
    else if([45,48].includes(value)) kind = 'fog';
    else if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(value)) kind = 'rain';
    else if([71,73,75,77,85,86].includes(value)) kind = 'snow';
    else if([95,96,99].includes(value)) kind = 'storm';
    return kind;
  }

  function weatherMark(code, label, isDay=1){
    const kind = weatherKind(code, isDay);
    const symbols = {
      'clear-day':'<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"></path>',
      'clear-night':'<path d="M19.2 15.6A7.7 7.7 0 0 1 8.4 4.8 8.2 8.2 0 1 0 19.2 15.6Z"></path><path d="M17.8 4.2v2.6M16.5 5.5h2.6"></path>',
      partly:'<path d="M8 5.2A4.2 4.2 0 0 1 15.2 8"></path><path d="M5.3 16.8h12.1a3.6 3.6 0 0 0 .2-7.2 5.2 5.2 0 0 0-9.8 1.8 2.8 2.8 0 0 0-2.5 5.4Z"></path>',
      cloud:'<path d="M5.3 17h12.1a3.6 3.6 0 0 0 .2-7.2 5.2 5.2 0 0 0-9.8 1.8A2.8 2.8 0 0 0 5.3 17Z"></path>',
      fog:'<path d="M5.3 13.5h12.1a3.6 3.6 0 0 0 .2-7.2 5.2 5.2 0 0 0-9.8 1.8 2.8 2.8 0 0 0-2.5 5.4Z"></path><path d="M4 17h13M7 20h13"></path>',
      rain:'<path d="M5.3 13.8h12.1a3.6 3.6 0 0 0 .2-7.2 5.2 5.2 0 0 0-9.8 1.8 2.8 2.8 0 0 0-2.5 5.4Z"></path><path d="m8 17-1 3M12 17l-1 3M16 17l-1 3"></path>',
      snow:'<path d="M5.3 13.8h12.1a3.6 3.6 0 0 0 .2-7.2 5.2 5.2 0 0 0-9.8 1.8 2.8 2.8 0 0 0-2.5 5.4Z"></path><path d="M8 18h.01M12 20h.01M16 18h.01"></path>',
      storm:'<path d="M5.3 13.8h12.1a3.6 3.6 0 0 0 .2-7.2 5.2 5.2 0 0 0-9.8 1.8 2.8 2.8 0 0 0-2.5 5.4Z"></path><path d="m13 15-3 4h3l-2 3"></path>'
    };
    return `<div class="ruca-weather-mark" data-weather-kind="${kind}"><svg viewBox="0 0 24 24" aria-hidden="true">${symbols[kind]}</svg><span>${escapeHtml(label)}</span></div>`;
  }

  function formatWeatherClock(value){
    const match = String(value || '').match(/T(\d{2}):(\d{2})/);
    if(!match) return '';
    const hour = Number(match[1]);
    if(!Number.isFinite(hour)) return '';
    const suffix = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${match[2]} ${suffix}`;
  }

  function formatWeatherFreshness(value){
    let timestamp = value;
    if(typeof timestamp === 'number' && timestamp < 1000000000000) timestamp *= 1000;
    const parsed = new Date(timestamp || '').getTime();
    if(!Number.isFinite(parsed)) return '';
    const minutes = Math.max(0, Math.round((Date.now() - parsed) / 60000));
    if(minutes < 1) return 'Updated now';
    if(minutes === 1) return 'Updated 1 minute ago';
    if(minutes < 60) return `Updated ${minutes} minutes ago`;
    const hours = Math.round(minutes / 60);
    return `Updated ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  function weatherHourlyValue(data, field, currentTime){
    const hourly = data?.hourly || {};
    const times = Array.isArray(hourly.time) ? hourly.time : [];
    const values = Array.isArray(hourly[field]) ? hourly[field] : [];
    if(!times.length || !values.length) return null;
    let index = currentTime ? times.indexOf(currentTime) : -1;
    if(index < 0 && currentTime) index = times.findIndex(time=>String(time) >= String(currentTime));
    if(index < 0) index = 0;
    return safeNum(values[index]);
  }

  function windCompass(value){
    const degrees = safeNum(value);
    if(degrees === null) return '';
    const points = ['N','NE','E','SE','S','SW','W','NW'];
    return points[Math.round((((degrees % 360) + 360) % 360) / 45) % points.length];
  }

  function boot(){
    document.body.classList.add('ruca-pass02b');
    ensureNavSvgIcons();
    installLiveWorldOverride();
    installTelemetryPolish();
    installControlCustomizer();
    installControlSliders();
    installSourceActionHandlers();
    installSourceManagement();
    installCommandDrawerActions();
    installCommandSearch();
    installCanonicalActivation();
    installPass17C1HomeGeometry();
    installRucaAudioHooks();
    installPass17C2CFooter();
    installPass16CommandControls();
    installAtmosphereEngine();
    installControllerFocusMode();
    installPass17AControllerRecovery();
    installPass16MotionFeedback();
    installPass16FPatternTranslation();
    installPass16GWorldViewportGuard();
    installRuntimeProfile();
    refreshRightRail();
    setInterval(()=>{
      refreshTelemetry();
      if((document.body.dataset.world || 'home') === 'diagnostics') refreshInventory();
      refreshRightRail();
    }, 2500);
    installLiveWorldRefreshPolicy();
    console.info('RUCA September demo: canonical visual owners with simulated data.');
  }

  function ensureNavSvgIcons(){
    qsa('.world-nav .nav-btn').forEach(btn=>{
      if(btn.querySelector('.nav-btn .nav-ico')) return;
      const label = (btn.dataset.page || btn.textContent || 'WORLD').toUpperCase();
      btn.innerHTML = `<span class="nav-ico" aria-hidden="true"></span><span class="nav-label">${label}</span>`;
    });
  }

  function safeNum(v){
    if(v === null || v === undefined) return null;
    if(typeof v === 'string'){
      const text = v.trim();
      if(!text || /^N\/?A/i.test(text) || /^BRIDGE$/i.test(text) || /^SRC REQ/i.test(text) || /^SOURCE REQUIRED/i.test(text)) return null;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  function setText(sel, value){
    const el = qs(sel);
    if(el) el.textContent = value;
  }
  function firstNumber(...values){
    for(const value of values){
      const n = safeNum(value);
      if(n !== null) return n;
      if(typeof value === 'string'){
        const match = value.match(/-?\d+(\.\d+)?/);
        if(match) return Number(match[0]);
      }
    }
    return null;
  }

  function telemetryPath(payload, path){
    return path.split('.').reduce((value, key)=>value && typeof value === 'object' ? value[key] : undefined, payload);
  }

  function telemetryNumber(payload, ...paths){
    for(const path of paths){
      const number = firstNumber(telemetryPath(payload, path));
      if(number !== null) return number;
    }
    return null;
  }

  function emptyTelemetry(status='DATA UNAVAILABLE', reason='No usable telemetry payload was supplied.'){
    return {
      status,
      reason,
      source:'SIMULATED DATA',
      timestamp:null,
      timestampMs:null,
      ageMs:null,
      stale:false,
      live:false,
      machineState:status,
      heart:null,
      raw:null,
      fields:{
        cpuLoad:null,
        cpuTemp:null,
        gpuLoad:null,
        gpuTemp:null,
        ramLoad:null,
        ramUsed:null,
        ramTotal:null,
        storageHealth:null,
        storageFree:null,
        storageUsed:null,
        networkDown:null,
        networkUp:null,
        networkPing:null,
        gpuVramUsed:null,
        gpuVramTotal:null,
        gpuPower:null
      }
    };
  }

  function normalizeTelemetry(payload, now=Date.now()){
    if(!payload || typeof payload !== 'object' || Array.isArray(payload)){
      return emptyTelemetry('DATA UNAVAILABLE', 'The bridge returned a null or non-object payload.');
    }

    const declaredStatus = String(payload.status || payload.sensor_status || '').trim().toUpperCase();
    if(payload.live === false || declaredStatus === 'SCHEMA_ONLY'){
      return emptyTelemetry('DATA UNAVAILABLE', 'The payload is explicitly marked non-live.');
    }

    const timestamp = typeof payload.timestamp === 'string' ? payload.timestamp : null;
    const parsedTimestamp = timestamp ? Date.parse(timestamp) : NaN;
    if(!Number.isFinite(parsedTimestamp)){
      return emptyTelemetry('DATA UNAVAILABLE', 'The bridge payload does not contain a valid timestamp.');
    }

    const normalized = emptyTelemetry();
    normalized.raw = payload;
    normalized.source = String(payload.source || 'SIMULATED DATA').trim() || 'SIMULATED DATA';
    normalized.timestamp = timestamp;
    normalized.timestampMs = parsedTimestamp;
    normalized.ageMs = Math.max(0, now - parsedTimestamp);
    normalized.stale = normalized.ageMs > TELEMETRY_STALE_AFTER_MS;
    normalized.machineState = String(payload.state || declaredStatus || 'PARTIAL').trim().toUpperCase();
    normalized.heart = telemetryNumber(payload, 'heart');
    normalized.fields = {
      cpuLoad:telemetryNumber(payload, 'cpu.load', 'cpu_load'),
      cpuTemp:telemetryNumber(payload, 'cpu.temp', 'cpu_package_temp'),
      gpuLoad:telemetryNumber(payload, 'gpu.load', 'gpu_load'),
      gpuTemp:telemetryNumber(payload, 'gpu.temp', 'gpu_temp'),
      ramLoad:telemetryNumber(payload, 'ram.load', 'ram_load'),
      ramUsed:telemetryNumber(payload, 'ram.used', 'ram_used_gb'),
      ramTotal:telemetryNumber(payload, 'ram.total', 'ram_total_gb'),
      storageHealth:telemetryNumber(payload, 'storage.health', 'storage_health'),
      storageFree:telemetryNumber(payload, 'storage.free', 'storage_free_gb'),
      storageUsed:telemetryNumber(payload, 'storage.usedPercent', 'storage_used_percent'),
      networkDown:telemetryNumber(payload, 'network.down', 'network_down_mbps'),
      networkUp:telemetryNumber(payload, 'network.up', 'network_up_mbps'),
      networkPing:telemetryNumber(payload, 'network.ping', 'network_ping_ms'),
      gpuVramUsed:telemetryNumber(payload, 'gpu.vramUsedMb', 'gpu_vram_used_mb'),
      gpuVramTotal:telemetryNumber(payload, 'gpu.vramTotalMb', 'gpu_vram_total_mb'),
      gpuPower:telemetryNumber(payload, 'gpu.power', 'gpu_power_w')
    };

    const available = Object.values(normalized.fields).filter(value=>value !== null).length;
    if(!available){
      normalized.status = 'DATA UNAVAILABLE';
      normalized.machineState = 'DATA UNAVAILABLE';
      normalized.reason = 'The bridge responded, but no supported sensor fields were exposed.';
    }else if(normalized.stale){
      normalized.status = 'STALE DATA';
      normalized.machineState = 'STALE DATA';
      normalized.reason = `The last bridge sample is older than ${TELEMETRY_STALE_AFTER_MS / 1000} seconds.`;
    }else{
      const expected = Object.keys(normalized.fields).length;
      normalized.status = available === expected && declaredStatus !== 'PARTIAL' ? 'LIVE' : 'PARTIAL';
      normalized.reason = normalized.status === 'LIVE'
        ? 'All supported telemetry fields are fresh.'
        : `${available} of ${expected} supported telemetry fields are exposed.`;
      normalized.live = true;
      normalized.reason = 'Deterministic demonstration values; no machine telemetry is connected.';
    }
    return normalized;
  }

  function writeHomeTelemetry(values){
    state.telemetryWrite = true;
    setText('#homeCPU', values.cpu);
    setText('#homeGPU', values.gpu);
    setText('#homeRAM', values.ram);
    setText('#homeThermal', values.therm);
    setText('#homeStorage', values.storage);
    const networkRoot=qs('#homeNetwork');
    const networkDown=qs('#homeNetworkDown');
    const networkUp=qs('#homeNetworkUp');
    if(networkRoot && networkDown && networkUp){
      networkDown.textContent=values.networkDown;
      networkUp.textContent=values.networkUp;
      networkRoot.setAttribute('aria-label',values.network);
    }else{
      setText('#homeNetwork', values.network);
    }
    setText('.comp-network .gauge-unit', 'Mbps');
    requestAnimationFrame(()=>{ state.telemetryWrite = false; });
  }

  function writeTelemetryContext(telemetry){
    const fresh = telemetry.status === 'LIVE' || telemetry.status === 'PARTIAL';
    const assessed = fresh && telemetry.heart !== null;
    const thermal = telemetry.fields.cpuTemp !== null ? telemetry.fields.cpuTemp : telemetry.fields.gpuTemp;
    const storage = telemetry.fields.storageHealth !== null
      ? `${Math.round(telemetry.fields.storageHealth)}% HEALTH`
      : telemetry.fields.storageFree !== null
        ? `${Math.round(telemetry.fields.storageFree)}GB FREE`
        : 'SENSOR NOT EXPOSED';
    const systemState = assessed ? telemetry.machineState : telemetry.status;

    setText('#homeMissionState', systemState);
    setText('#homeTelemetrySummary', fresh
      ? `Fresh telemetry is reporting from ${telemetry.source}. Missing sensors remain explicitly unavailable.`
      : `${telemetry.status}. Command routes remain available while telemetry reconnects.`);
    setText('#ribbonSystemState', assessed ? `SYSTEM ${telemetry.machineState}` : telemetry.status);
    setText('#ribbonSystemDetail', assessed
      ? 'Assessment uses only currently exposed sensor fields.'
      : telemetry.reason);
    setText('#ribbonBridgeState', fresh || telemetry.status === 'STALE DATA' ? 'DEMO DATA' : telemetry.status);
    setText('#ribbonBridgeDetail', telemetry.timestamp ? `Last sample ${telemetry.timestamp}` : TELEMETRY_ENDPOINT);
    setText('#ribbonThermalState', telemetry.status === 'STALE DATA' ? 'STALE DATA' : thermal === null ? 'SENSOR NOT EXPOSED' : `THERMAL ${telemetryNumberLabel(thermal, '°C')}`);
    setText('#ribbonThermalDetail', thermal === null ? 'No thermal reading was returned.' : 'Current exposed package or GPU temperature.');
    setText('#ribbonStorageState', telemetry.status === 'STALE DATA' ? 'STALE DATA' : storage);
    setText('#ribbonStorageDetail', telemetry.fields.storageHealth === null ? 'Health is not inferred from free capacity.' : 'Health value returned by the canonical bridge.');
    setText('#ribbonDiagnosticState', telemetry.status === 'PARTIAL' ? 'DIAGNOSTICS PARTIAL' : `DIAGNOSTICS ${telemetry.status}`);
    setText('#ribbonDiagnosticDetail', telemetry.reason);
  }

  function renderHomeTelemetryPresentation(telemetry){
    writeHomeTelemetry(state.homeTelemetry);
    writeTelemetryContext(telemetry);
    const heartIsCurrent = telemetry.heart !== null && !telemetry.stale && telemetry.status !== 'DATA UNAVAILABLE';
    const heart = qs('#homeChronograph .system-heart');
    if(heart) heart.dataset.systemState = heartIsCurrent
      ? String(telemetry.machineState || 'PARTIAL').toLowerCase()
      : String(telemetry.status || 'unavailable').toLowerCase().replace(/\s+/g, '-');
    setText('#heartScore', heartIsCurrent ? `${Math.round(telemetry.heart)}%` : '--');
    setText('#heartState', heartIsCurrent ? telemetry.machineState : telemetry.status);
    refreshRightRail();
  }

  function renderActiveTelemetryPresentation(telemetry, error=null){
    const world = document.body.dataset.world || 'home';
    if(world === 'home') renderHomeTelemetryPresentation(telemetry);
    if(world === 'diagnostics') renderTelemetryDiagnostics(telemetry, error);
  }

  async function fetchJson(url, ms=6500){
    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(), ms);
    try{
      const res = await fetch(url, {cache:'no-store', signal:ctrl.signal});
      if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await res.json();
    } finally { clearTimeout(timer); }
  }

  async function postJson(url, payload={}, ms=6500){
    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(), ms);
    try{
      const res = await fetch(url, {
        method:'POST',
        cache:'no-store',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload),
        signal:ctrl.signal
      });
      let data = null;
      try{ data = await res.json(); }catch(parseError){ data = {error:'Bridge returned non-JSON benchmark data.'}; }
      if(!res.ok) throw new Error(data?.error || `${res.status} ${res.statusText}`);
      return data;
    } finally { clearTimeout(timer); }
  }

  async function refreshTelemetry(){
    if(state.telemetryRequest) return state.telemetryRequest;
    state.telemetryRequest = (async()=>{
      try{
        const data = await fetchJson(TELEMETRY_ENDPOINT, 3500);
        return applyTelemetry(data);
      }catch(err){
        const malformed = err instanceof SyntaxError || /json|unexpected token/i.test(String(err?.message || ''));
        return applyTelemetryUnavailable(err, malformed ? 'DATA UNAVAILABLE' : 'BRIDGE OFFLINE');
      }finally{
        state.telemetryRequest = null;
      }
    })();
    return state.telemetryRequest;
  }

  async function refreshInventory(force=false){
    const now = Date.now();
    if(!force && state.normalizedInventory && now < state.inventoryRefreshAt) return state.normalizedInventory;
    if(state.inventoryRequest) return state.inventoryRequest;
    const engine = window.RUCADiagnosticsEngine;
    if(!engine){
      state.inventoryError = new Error('PASS26C diagnostics engine is unavailable.');
      return null;
    }
    state.inventoryRequest = (async()=>{
      try{
        const payload = await fetchJson(TELEMETRY_INVENTORY_ENDPOINT, 5000);
        state.normalizedInventory = engine.normalizeInventory(payload);
        state.inventoryError = null;
        state.inventoryRefreshAt = Date.now() + INVENTORY_REFRESH_MS;
      }catch(error){
        state.inventoryError = error;
        state.normalizedInventory = engine.normalizeInventory(null);
        state.normalizedInventory.reason = error?.name === 'AbortError'
          ? 'The HWiNFO inventory request timed out.'
          : `The HWiNFO inventory endpoint is unavailable: ${error?.message || 'unknown error'}.`;
        state.inventoryRefreshAt = Date.now() + 2000;
      }finally{
        state.inventoryRequest = null;
      }
      document.dispatchEvent(new CustomEvent('ruca:inventory-updated', {
        detail:{inventory:state.normalizedInventory}
      }));
      if((document.body.dataset.world || 'home') === 'diagnostics') renderTelemetryDiagnostics(state.normalizedTelemetry, state.inventoryError);
      return state.normalizedInventory;
    })();
    return state.inventoryRequest;
  }

  function applyTelemetry(data){
    const normalized = normalizeTelemetry(data);
    state.telemetryOnline = normalized.status !== 'DATA UNAVAILABLE';
    state.telemetryStatus = normalized.status;
    state.telemetryError = null;
    state.normalizedTelemetry = normalized;
    state.lastTelemetry = normalized;
    state.homeTelemetry = homeTelemetryFrom(normalized);
    renderActiveTelemetryPresentation(normalized);
    window.dispatchEvent(new CustomEvent('ruca:telemetry-updated', {
      detail:Object.freeze({telemetry:normalized, raw:normalized.raw, status:normalized.status})
    }));
    return normalized;
  }

  function isLoungeRuntime(){
    return document.body.classList.contains('ruca-3dixon-lounge') || document.body.dataset.rucaRuntimeProfile === LOUNGE_PROFILE_ID;
  }

  function applyTelemetryUnavailable(error, status='BRIDGE OFFLINE'){
    const normalized = emptyTelemetry(status, error?.name === 'AbortError'
      ? 'The canonical bridge did not respond before the request timed out.'
      : String(error?.message || 'The canonical bridge is unavailable.'));
    state.telemetryOnline = false;
    state.telemetryStatus = status;
    state.telemetryError = error || null;
    state.normalizedTelemetry = normalized;
    state.lastTelemetry = normalized;
    state.homeTelemetry = homeTelemetryFrom(normalized);
    renderActiveTelemetryPresentation(normalized, error);
    window.dispatchEvent(new CustomEvent('ruca:telemetry-updated', {
      detail:Object.freeze({telemetry:normalized, raw:null, status:normalized.status})
    }));
    return normalized;
  }

  function telemetryNumberLabel(value, unit=''){
    if(value === null) return 'SENSOR NOT EXPOSED';
    const precision = Math.abs(value) < 10 && !Number.isInteger(value) ? 1 : 0;
    const number = Number(value).toLocaleString([], {minimumFractionDigits:precision, maximumFractionDigits:1});
    return unit === '°C' ? `${number}°C` : unit ? `${number}${unit}` : number;
  }

  function homeTelemetryFrom(normalized){
    if(['CHECKING','BRIDGE OFFLINE','DATA UNAVAILABLE','STALE DATA'].includes(normalized.status)){
      return Object.fromEntries(Object.keys(HOME_TELEMETRY_EMPTY).map(key=>[key, normalized.status]));
    }
    const fields = normalized.fields;
    const thermal = fields.cpuTemp !== null ? fields.cpuTemp : fields.gpuTemp;
    const storage = fields.storageFree !== null
      ? `${fields.storageFree >= 1024 ? (fields.storageFree / 1024).toFixed(1) + 'TB' : Math.round(fields.storageFree) + 'GB'} FREE`
      : 'SENSOR NOT EXPOSED';
    const networkValue = value=>Math.abs(value) < 10 ? value.toFixed(1) : String(Math.round(value));
    const networkChannel = value=>value === null ? '--' : networkValue(value);
    const network = fields.networkDown === null && fields.networkUp === null
      ? 'SENSOR NOT EXPOSED'
      : `DL ${fields.networkDown === null ? '--' : networkValue(fields.networkDown)} / UL ${fields.networkUp === null ? '--' : networkValue(fields.networkUp)} Mbps`;
    return {
      cpu:telemetryNumberLabel(fields.cpuLoad, '%'),
      gpu:telemetryNumberLabel(fields.gpuLoad, '%'),
      ram:telemetryNumberLabel(fields.ramLoad, '%'),
      therm:telemetryNumberLabel(thermal, '°C'),
      storage,
      network,
      networkDown:networkChannel(fields.networkDown),
      networkUp:networkChannel(fields.networkUp)
    };
  }

  function diagnosticRowsFor(key, telemetry){
    const groups = {
      ScoreMap:[
        ['SYSTEM HEART','heart','%',100],
        ['CPU LOAD','cpuLoad','%',100],
        ['GPU LOAD','gpuLoad','%',100],
        ['RAM LOAD','ramLoad','%',100],
        ['STORAGE USED','storageUsed','%',100],
        ['NETWORK DOWN','networkDown',' Mbps',1000],
        ['CPU PACKAGE','cpuTemp','°C',100],
        ['GPU CORE','gpuTemp','°C',100]
      ],
      CPU:[['CPU LOAD','cpuLoad','%',100],['PACKAGE TEMP','cpuTemp','°C',100]],
      GPU:[['GPU LOAD','gpuLoad','%',100],['CORE TEMP','gpuTemp','°C',100],['VRAM USED','gpuVramUsed',' MB',telemetry.fields.gpuVramTotal || 16384],['VRAM TOTAL','gpuVramTotal',' MB',telemetry.fields.gpuVramTotal || 16384],['GPU POWER','gpuPower',' W',350]],
      RAM:[['RAM LOAD','ramLoad','%',100],['RAM USED','ramUsed',' GB',telemetry.fields.ramTotal || 128],['RAM TOTAL','ramTotal',' GB',telemetry.fields.ramTotal || 128]],
      Storage:[['FREE SPACE','storageFree',' GB',2048],['USED CAPACITY','storageUsed','%',100],['DRIVE HEALTH','storageHealth','%',100]],
      Network:[['DOWNLOAD','networkDown',' Mbps',1000],['UPLOAD','networkUp',' Mbps',100],['PING','networkPing',' ms',100]],
      Thermals:[['CPU PACKAGE','cpuTemp','°C',100],['GPU CORE','gpuTemp','°C',100]],
      Fans:[['FAN SENSORS',null,'',1]],
      Power:[['GPU POWER','gpuPower',' W',350]],
      Motherboard:[['MOTHERBOARD SENSORS',null,'',1]],
      SensorBus:[
        ['BRIDGE STATUS',null,'',1,telemetry.status],
        ['SAMPLE AGE',null,'',1,telemetry.ageMs === null ? 'DATA UNAVAILABLE' : `${(telemetry.ageMs / 1000).toFixed(1)}s`],
        ['EXPOSED FIELDS',null,'',1,`${Object.values(telemetry.fields).filter(value=>value !== null).length} / ${Object.keys(telemetry.fields).length}`]
      ]
    };
    return (groups[key] || groups.ScoreMap).map(([label,field,unit,max,valueText])=>({
      label,
      field,
      unit,
      max,
      value:field === 'heart' ? telemetry.heart : field ? telemetry.fields[field] : null,
      valueText:valueText || null
    }));
  }

  function diagnosticRowState(row, telemetry){
    if(telemetry.status === 'BRIDGE OFFLINE' || telemetry.status === 'DATA UNAVAILABLE') return telemetry.status;
    if(telemetry.status === 'STALE DATA') return row.value !== null || row.valueText ? 'STALE DATA' : 'SENSOR NOT EXPOSED';
    if(row.valueText) return telemetry.status === 'LIVE' ? 'LIVE' : 'PARTIAL';
    return row.value === null ? 'SENSOR NOT EXPOSED' : 'LIVE';
  }

  function diagnosticRowValue(row, telemetry){
    if(row.valueText) return row.valueText;
    if(row.value !== null) return telemetryNumberLabel(row.value, row.unit);
    if(telemetry.status === 'BRIDGE OFFLINE' || telemetry.status === 'DATA UNAVAILABLE') return telemetry.status;
    return 'SENSOR NOT EXPOSED';
  }

  function inventoryDomainForKey(key){
    const aliases = {
      Storage:'STORAGE',
      Network:'NETWORK',
      Thermals:'THERMALS',
      Fans:'FANS',
      Pumps:'PUMPS',
      Power:'POWER',
      Motherboard:'MOTHERBOARD',
      Cooling:'COOLING',
      Buses:'BUSES',
      External:'SUPPORTED EXTERNAL DEVICES',
      Windows:'WINDOWS PERFORMANCE COUNTERS',
      Unclassified:'UNCLASSIFIED'
    };
    const value = aliases[key] || String(key || '').toUpperCase();
    return window.RUCADiagnosticsEngine?.DOMAIN_ORDER.includes(value) ? value : '';
  }

  function inventoryStateClass(value){
    if(value === 'NOMINAL' || value === 'ACTIVE') return 'ok';
    if(value === 'ELEVATED' || value === 'LIMITED' || value === 'STALE') return 'warn';
    return 'crit';
  }

  function inventoryAgeLabel(seconds){
    const value = safeNum(seconds);
    return value === null ? 'AGE UNKNOWN' : `${value.toFixed(1)}s OLD`;
  }

  const DIAGNOSTIC_GROUP_PRESENTATION = Object.freeze({
    ScoreMap:{
      visual:'coverage',
      visualTitle:'INVENTORY COVERAGE'
    },
    SensorBus:{
      visual:'coverage',
      visualTitle:'SOURCE COVERAGE'
    },
    CPU:{
      visual:'trace',
      visualTitle:'PROCESSOR RESPONSE',
      devicePatterns:[/\bCPU\b/i],
      headlinePatterns:[/total cpu usage/i,/cpu package/i,/core usage/i],
      context:[
        ['PACKAGE TEMP',[/cpu \(tctl\/tdie\)/i,/cpu package temperature/i,/package temp/i]],
        ['PACKAGE POWER',[/cpu package power/i,/package power/i]],
        ['EFFECTIVE CLOCK',[/average effective clock/i,/core effective clock/i]],
        ['LIMIT FLAG',[/thermal throttling/i,/power limit exceeded/i,/performance limit/i,/prochot/i]]
      ]
    },
    GPU:{
      visual:'lanes',
      visualTitle:'GRAPHICS LOAD',
      devicePatterns:[/\bdGPU\b/i,/\bGPU\b/i],
      headlinePatterns:[/gpu core load/i,/gpu usage/i,/gpu temperature/i],
      context:[
        ['CORE TEMP',[/gpu temperature/i,/gpu core temp/i]],
        ['BOARD POWER',[/gpu power/i,/total graphics power/i]],
        ['MEMORY',[/gpu memory usage/i,/gpu memory allocated/i]],
        ['CORE CLOCK',[/gpu effective clock/i,/gpu clock \(measured\)/i,/gpu clock/i]]
      ]
    },
    RAM:{
      visual:'composition',
      visualTitle:'MEMORY COMPOSITION',
      devicePatterns:[/^system:/i,/memory timings/i],
      headlinePatterns:[/physical memory load/i,/physical memory used/i],
      context:[
        ['USED',[/physical memory used/i]],
        ['AVAILABLE',[/physical memory available/i]],
        ['MEMORY CLOCK',[/^memory clock$/i]],
        ['COMMAND RATE',[/command rate/i]]
      ]
    },
    Thermals:{
      visual:'thermal',
      visualTitle:'THERMAL RANGE',
      devicePatterns:[/CPU.*Enhanced/i,/\bdGPU\b/i,/drive:/i],
      headlinePatterns:[/cpu \(tctl\/tdie\)/i,/gpu temperature/i,/drive temperature/i],
      context:[
        ['CPU PACKAGE',[/cpu \(tctl\/tdie\)/i,/cpu die \(average\)/i]],
        ['GPU CORE',[/gpu temperature/i,/gpu core temp/i]],
        ['GPU HOTSPOT',[/gpu hot ?spot/i,/gpu junction/i]],
        ['PRIMARY DRIVE',[/drive temperature/i,/drive temp/i]]
      ]
    },
    Storage:{
      visual:'lanes',
      visualTitle:'DRIVE ACTIVITY',
      devicePatterns:[/^drive:/i],
      headlinePatterns:[/^total activity$/i,/^write activity$/i,/^read activity$/i],
      context:[
        ['TOTAL ACTIVITY',[/^total activity$/i]],
        ['READ RATE',[/^read rate$/i]],
        ['WRITE RATE',[/^write rate$/i]],
        ['DRIVE TEMP',[/drive temperature/i,/drive temp/i]]
      ]
    },
    Network:{
      visual:'lanes',
      visualTitle:'NETWORK FLOW',
      devicePatterns:[/^network:/i,/ethernet/i,/wi-?fi/i],
      headlinePatterns:[/current dl rate/i,/current up rate/i,/total dl/i],
      context:[
        ['DOWNLOAD',[/current dl rate/i,/download rate/i]],
        ['UPLOAD',[/current up rate/i,/upload rate/i]],
        ['TOTAL DOWN',[/^total dl$/i]],
        ['TOTAL UP',[/^total up$/i]]
      ]
    }
  });

  function diagnosticPresentation(key){
    return DIAGNOSTIC_GROUP_PRESENTATION[key] || {
      visual:'trace',
      visualTitle:`${String(key || 'SENSOR').toUpperCase()} SIGNAL`,
      devicePatterns:[],
      headlinePatterns:[],
      context:[]
    };
  }

  function firstMatchingReading(readings=[], patterns=[], excluded=new Set()){
    for(const pattern of patterns){
      const match = readings.find(reading=>
        !excluded.has(reading.id) &&
        safeNum(reading.current) !== null &&
        pattern.test(String(reading?.label || ''))
      );
      if(match) return match;
    }
    return null;
  }

  function shortHardwareName(value){
    const name = String(value || 'CANONICAL SOURCE').replace(/\(\[SERIAL REDACTED\]\)/ig, '').trim();
    if(name.length <= 44) return name;
    return `${name.slice(0,41).trim()}…`;
  }

  function setDiagnosticPresentation(key){
    const page = qs('#page-diagnostics');
    const presentation = diagnosticPresentation(key);
    if(page){
      page.dataset.diagnosticGroup = String(key || 'ScoreMap').toLowerCase();
      page.dataset.diagnosticVisual = presentation.visual;
    }
    setText('#diagVisualTitle', presentation.visualTitle);
    const chart = qs('#sensorChart');
    if(chart) chart.setAttribute('aria-label', `${presentation.visualTitle.toLowerCase()} for ${String(key || 'system').toLowerCase()} diagnostics`);
    return presentation;
  }

  function renderDiagnosticContext(inventory, key, context){
    const container = qs('#diagnosticContext');
    if(!container) return;
    const engine = window.RUCADiagnosticsEngine;
    if(key === 'ScoreMap' || key === 'SensorBus'){
      const rows = [
        ['READINGS',inventory.counts.readings,'CANONICAL INVENTORY'],
        ['AVAILABLE',inventory.counts.available,'FINITE CURRENT VALUES'],
        ['HARDWARE',inventory.counts.hardwareGroups,'EXPOSED GROUPS'],
        ['STALE',inventory.counts.stale,'RETAINED EXPLICITLY']
      ];
      container.innerHTML = rows.map(([label,value,note])=>`<div class="diagnostic-context-metric"><span>${escapeHtml(label)}</span><b>${escapeHtml(String(value))}</b><small>${escapeHtml(note)}</small></div>`).join('');
      return;
    }
    const presentation = diagnosticPresentation(key);
    const readings = (key === 'Storage' || key === 'Network')
      ? (context.device?.readings || [])
      : (inventory.readings || context.domain?.readings || context.device?.readings || []);
    const used = new Set(context.reading?.id ? [context.reading.id] : []);
    const rows = [];
    for(const [label,patterns] of presentation.context || []){
      const reading = firstMatchingReading(readings, patterns, used);
      if(!reading) continue;
      used.add(reading.id);
      rows.push({
        label,
        value:engine.formatValue(reading.current,reading.unit),
        source:shortHardwareName(reading.hardware_group),
        state:reading.interpretation?.state || reading.state || 'ACTIVE'
      });
    }
    if(!rows.length && context.reading){
      rows.push({
        label:'CURRENT',
        value:engine.formatValue(context.reading.current,context.reading.unit),
        source:shortHardwareName(context.reading.hardware_group),
        state:context.reading.interpretation?.state || context.reading.state || 'ACTIVE'
      });
    }
    container.innerHTML = rows.slice(0,4).map(row=>`<div class="diagnostic-context-metric" data-state="${escapeAttr(String(row.state).toLowerCase())}"><span>${escapeHtml(row.label)}</span><b>${escapeHtml(row.value)}</b><small>${escapeHtml(row.source)}</small></div>`).join('');
  }

  function renderTelemetryDiagnosticContext(rows, telemetry){
    const container = qs('#diagnosticContext');
    if(!container) return;
    const available = rows.filter(row=>row.value !== null || row.valueText).slice(0,4);
    container.innerHTML = available.map(row=>`<div class="diagnostic-context-metric"><span>${escapeHtml(row.label)}</span><b>${escapeHtml(diagnosticRowValue(row,telemetry))}</b><small>${escapeHtml(String(telemetry.source || 'CANONICAL BRIDGE').toUpperCase())}</small></div>`).join('');
  }

  function inventorySelectedContext(inventory, key){
    const domainName = inventoryDomainForKey(key);
    if(!domainName) return {domainName:'', domain:null, device:null, reading:null};
    const domain = inventory.domainMap?.[domainName] || null;
    if(!domain || !domain.devices.length) return {domainName, domain, device:null, reading:null};
    const presentation = diagnosticPresentation(key);
    const explicitDevice = key === 'Network'
      ? domain.devices.find(item=>String(item.name || '').toUpperCase().startsWith('NETWORK:'))
      : key === 'Storage'
        ? domain.devices.find(item=>String(item.name || '').toUpperCase().startsWith('DRIVE:'))
        : null;
    let device = domain.devices.find(item=>item.id === state.inventorySelection.deviceId) ||
      explicitDevice ||
      domain.devices.find(item=>presentation.devicePatterns?.some(pattern=>pattern.test(item.name))) ||
      domain.devices[0];
    let reading = device.readings.find(item=>item.id === state.inventorySelection.sensorId) ||
      firstMatchingReading(device.readings,presentation.headlinePatterns || []) ||
      device.headline ||
      device.readings[0] ||
      null;
    state.inventorySelection = {domain:domainName, deviceId:device.id, sensorId:reading?.id || ''};
    return {domainName, domain, device, reading};
  }

  function monitorTraceSamples(reading, sourceTimestamp){
    if(!reading?.id || safeNum(reading.current) === null) return [];
    const trace = state.monitorTrace;
    let bucket = trace.series[reading.id];
    if(!bucket){
      while(trace.order.length >= trace.maxSensors){
        const expired = trace.order.shift();
        delete trace.series[expired];
      }
      bucket = trace.series[reading.id] = {samples:[]};
      trace.order.push(reading.id);
    }else{
      trace.order = trace.order.filter(id=>id !== reading.id);
      trace.order.push(reading.id);
    }
    const parsedTimestamp = Date.parse(sourceTimestamp || '');
    const capturedAt = Number.isFinite(parsedTimestamp) ? parsedTimestamp : Date.now();
    const last = bucket.samples[bucket.samples.length - 1];
    if(!last || last.timestamp !== capturedAt){
      bucket.samples.push({timestamp:capturedAt, value:Number(reading.current)});
      if(bucket.samples.length > trace.maxSamples) bucket.samples.splice(0, bucket.samples.length - trace.maxSamples);
    }
    return bucket.samples;
  }

  function renderInventoryCoverage(svg, inventory, make){
    const engine = window.RUCADiagnosticsEngine;
    const domains = engine.DOMAIN_ORDER
      .map(name=>({name,count:inventory.domainMap?.[name]?.count || 0}))
      .filter(item=>item.count > 0)
      .sort((a,b)=>b.count - a.count)
      .slice(0,6);
    if(!domains.length){
      svg.appendChild(make('text', {x:320,y:108,'text-anchor':'middle',class:'ruca-trace-empty'}, 'INVENTORY NOT EXPOSED'));
      return;
    }
    const peak = Math.max(...domains.map(item=>item.count), 1);
    domains.forEach((item,index)=>{
      const y = 22 + index * 28;
      const width = Math.max(4, (item.count / peak) * 374);
      svg.appendChild(make('text', {x:16,y:y+12,class:'ruca-trace-label'}, item.name.slice(0,20)));
      svg.appendChild(make('line', {x1:174,y1:y+7,x2:548,y2:y+7,class:'ruca-trace-rail'}));
      svg.appendChild(make('line', {x1:174,y1:y+7,x2:174+width,y2:y+7,class:'ruca-trace-coverage'}));
      svg.appendChild(make('text', {x:622,y:y+12,'text-anchor':'end',class:'ruca-trace-value'}, String(item.count)));
    });
    svg.appendChild(make('text', {x:16,y:201,class:'ruca-trace-caption'}, `${inventory.counts.readings} READINGS // ${inventory.counts.hardwareGroups} HARDWARE GROUPS // COVERAGE ONLY`));
    setText('#chartUnit', 'INVENTORY COVERAGE');
  }

  function renderMemoryComposition(svg, readings, make, sourceTimestamp){
    const used = firstMatchingReading(readings,[/physical memory used/i]);
    const available = firstMatchingReading(readings,[/physical memory available/i]);
    if(!used || !available) return false;
    const usedValue = safeNum(used.current);
    const availableValue = safeNum(available.current);
    const total = (usedValue || 0) + (availableValue || 0);
    if(!total) return false;
    const ratio = Math.max(0,Math.min(1,usedValue / total));
    const renderKey = `memory:${sourceTimestamp}:${usedValue}:${availableValue}`;
    if(svg.dataset.rucaRenderKey === renderKey) return true;
    svg.dataset.rucaRenderKey = renderKey;
    svg.replaceChildren();
    svg.appendChild(make('text',{x:20,y:38,class:'ruca-composition-kicker'},'PHYSICAL MEMORY'));
    svg.appendChild(make('text',{x:20,y:78,class:'ruca-composition-primary'},`${Math.round(ratio * 100)}%`));
    svg.appendChild(make('text',{x:132,y:77,class:'ruca-composition-caption'},'IN USE'));
    svg.appendChild(make('line',{x1:22,y1:116,x2:618,y2:116,class:'ruca-composition-rail'}));
    svg.appendChild(make('line',{x1:22,y1:116,x2:22+(596*ratio),y2:116,class:'ruca-composition-used'}));
    svg.appendChild(make('text',{x:22,y:158,class:'ruca-composition-label'},`USED  ${window.RUCADiagnosticsEngine.formatValue(usedValue,used.unit)}`));
    svg.appendChild(make('text',{x:618,y:158,'text-anchor':'end',class:'ruca-composition-label'},`AVAILABLE  ${window.RUCADiagnosticsEngine.formatValue(availableValue,available.unit)}`));
    svg.appendChild(make('text',{x:22,y:198,class:'ruca-trace-caption'},'CURRENT COMPOSITION // READ-ONLY OBSERVATION'));
    setText('#chartUnit',window.RUCADiagnosticsEngine.formatValue(total,used.unit));
    return true;
  }

  function renderThermalRanges(svg, readings, make, sourceTimestamp){
    const candidates = readings.filter(reading=>
      safeNum(reading.current) !== null &&
      (/^°[CF]$/i.test(String(reading.unit || '')) || /temperature|hot ?spot|junction|\btemp\b/i.test(reading.label))
    ).slice(0,5);
    if(!candidates.length) return false;
    const allValues = candidates.flatMap(reading=>[reading.minimum,reading.current,reading.maximum].map(safeNum).filter(value=>value !== null));
    let low = Math.min(...allValues);
    let high = Math.max(...allValues);
    if(low === high){ low -= 1; high += 1; }
    const renderKey = `thermal:${sourceTimestamp}:${candidates.map(item=>`${item.id}:${item.current}`).join('|')}`;
    if(svg.dataset.rucaRenderKey === renderKey) return true;
    svg.dataset.rucaRenderKey = renderKey;
    svg.replaceChildren();
    const xAt = value=>190 + ((value-low)/(high-low))*390;
    candidates.forEach((reading,index)=>{
      const y = 28 + index * 35;
      const minimum = safeNum(reading.minimum) ?? safeNum(reading.current);
      const maximum = safeNum(reading.maximum) ?? safeNum(reading.current);
      const current = safeNum(reading.current);
      svg.appendChild(make('text',{x:16,y:y+5,class:'ruca-range-label'},String(reading.label).slice(0,22)));
      svg.appendChild(make('line',{x1:xAt(minimum),y1:y,x2:xAt(maximum),y2:y,class:'ruca-range-rail'}));
      svg.appendChild(make('circle',{cx:xAt(current),cy:y,r:5,class:'ruca-range-current'}));
      svg.appendChild(make('text',{x:624,y:y+5,'text-anchor':'end',class:'ruca-range-value'},window.RUCADiagnosticsEngine.formatValue(current,reading.unit)));
    });
    svg.appendChild(make('text',{x:16,y:202,class:'ruca-trace-caption'},`${window.RUCADiagnosticsEngine.formatValue(low,candidates[0].unit)} — ${window.RUCADiagnosticsEngine.formatValue(high,candidates[0].unit)} OBSERVED RANGE // NO DEVICE LIMIT INFERRED`));
    setText('#chartUnit',`${candidates.length} TEMPERATURE CHANNEL${candidates.length === 1 ? '' : 'S'}`);
    return true;
  }

  function renderActivityLanes(svg, readings, make, sourceTimestamp, key){
    const patterns = key === 'Network'
      ? [/current dl rate/i,/current up rate/i,/^total dl$/i,/^total up$/i]
      : key === 'GPU'
        ? [/gpu core load/i,/gpu memory usage/i,/gpu video engine load/i,/gpu power/i]
        : [/^total activity$/i,/^read activity$/i,/^write activity$/i,/^read rate$/i,/^write rate$/i];
    const candidates = [];
    const used = new Set();
    patterns.forEach(pattern=>{
      const reading = firstMatchingReading(readings,[pattern],used);
      if(reading){
        used.add(reading.id);
        candidates.push(reading);
      }
    });
    if(!candidates.length) return false;
    const renderKey = `lanes:${key}:${sourceTimestamp}:${candidates.map(item=>`${item.id}:${item.current}`).join('|')}`;
    if(svg.dataset.rucaRenderKey === renderKey) return true;
    svg.dataset.rucaRenderKey = renderKey;
    svg.replaceChildren();
    candidates.slice(0,5).forEach((reading,index)=>{
      const y = 25 + index * 37;
      const current = safeNum(reading.current) || 0;
      const observedMax = Math.max(safeNum(reading.maximum) || 0,safeNum(reading.average) || 0,current,1);
      const ratio = Math.max(0,Math.min(1,current/observedMax));
      svg.appendChild(make('text',{x:16,y:y+5,class:'ruca-lane-label'},String(reading.label).slice(0,24)));
      svg.appendChild(make('line',{x1:190,y1:y,x2:538,y2:y,class:'ruca-lane-rail'}));
      svg.appendChild(make('line',{x1:190,y1:y,x2:190+(348*ratio),y2:y,class:'ruca-lane-value'}));
      svg.appendChild(make('text',{x:624,y:y+5,'text-anchor':'end',class:'ruca-range-value'},window.RUCADiagnosticsEngine.formatValue(current,reading.unit)));
    });
    const caption = key === 'Network' ? 'LINK ACTIVITY' : key === 'GPU' ? 'GRAPHICS ACTIVITY' : 'DRIVE ACTIVITY';
    svg.appendChild(make('text',{x:16,y:202,class:'ruca-trace-caption'},`${caption} // CURRENT VALUE AGAINST OBSERVED MAXIMUM`));
    setText('#chartUnit',key === 'Network' ? 'BIDIRECTIONAL FLOW' : key === 'GPU' ? 'LIVE ENGINE LOAD' : 'READ / WRITE FLOW');
    return true;
  }

  function renderInventoryGroupVisual(svg, readings, make, sourceTimestamp, key){
    if(key === 'RAM') return renderMemoryComposition(svg,readings,make,sourceTimestamp);
    if(key === 'Thermals') return renderThermalRanges(svg,readings,make,sourceTimestamp);
    if(key === 'GPU' || key === 'Storage' || key === 'Network') return renderActivityLanes(svg,readings,make,sourceTimestamp,key);
    return false;
  }

  function renderInventoryChart(readings, selectedId, sourceTimestamp='', inventory=null){
    const svg = qs('#sensorChart');
    if(!svg || (document.body.dataset.world || 'home') !== 'diagnostics') return;
    const engine = window.RUCADiagnosticsEngine;
    const make = (name, attrs={}, text='')=>{
      const node = document.createElementNS('http://www.w3.org/2000/svg', name);
      Object.entries(attrs).forEach(([attribute,value])=>node.setAttribute(attribute, String(value)));
      if(text) node.textContent = text;
      return node;
    };
    if(inventory){
      const renderKey = `coverage:${inventory.timestamp || ''}:${inventory.counts.readings}:${inventory.counts.available}`;
      setText('#chartUnit', 'INVENTORY COVERAGE');
      if(svg.dataset.rucaRenderKey === renderKey) return;
      svg.dataset.rucaRenderKey = renderKey;
      svg.replaceChildren();
      renderInventoryCoverage(svg, inventory, make);
      return;
    }
    const activeKey = state.diagnosticKey || document.body.dataset.rucaDiagnostic || 'CPU';
    if(renderInventoryGroupVisual(svg,readings,make,sourceTimestamp,activeKey)) return;
    const reading = readings.find(item=>item.id === selectedId && item.current !== null) || null;
    if(!reading){
      const renderKey = `unavailable:${selectedId || 'none'}:${sourceTimestamp || ''}`;
      if(svg.dataset.rucaRenderKey === renderKey) return;
      svg.dataset.rucaRenderKey = renderKey;
      svg.replaceChildren();
      svg.appendChild(make('text', {x:320,y:104,'text-anchor':'middle',class:'ruca-trace-empty'}, 'SELECTED SENSOR NOT EXPOSED'));
      svg.appendChild(make('text', {x:320,y:128,'text-anchor':'middle',class:'ruca-trace-caption'}, 'NO VALUE IS BEING INFERRED'));
      return;
    }
    const samples = monitorTraceSamples(reading, sourceTimestamp);
    const renderKey = `trace:${reading.id}:${sourceTimestamp || ''}:${samples.length}:${reading.current}`;
    const traceUnit = `${reading.unit || 'UNITLESS'} // ${samples.length} SAMPLE${samples.length === 1 ? '' : 'S'}`;
    setText('#chartUnit', traceUnit);
    if(svg.dataset.rucaRenderKey === renderKey) return;
    svg.dataset.rucaRenderKey = renderKey;
    svg.replaceChildren();
    const references = [safeNum(reading.minimum), safeNum(reading.average), safeNum(reading.maximum)].filter(value=>value !== null);
    const values = samples.map(sample=>sample.value).concat(references);
    let low = Math.min(...values);
    let high = Math.max(...values);
    if(high === low){
      const padding = Math.max(Math.abs(high) * .05, 1);
      low -= padding;
      high += padding;
    }else{
      const padding = (high - low) * .08;
      low -= padding;
      high += padding;
    }
    const left = 48;
    const top = 18;
    const width = 568;
    const height = 146;
    const xAt = index=>left + (samples.length <= 1 ? width : (index / (samples.length - 1)) * width);
    const yAt = value=>top + height - ((value - low) / (high - low)) * height;
    for(let index=0; index<=6; index+=1){
      const x = left + (index / 6) * width;
      svg.appendChild(make('line', {x1:x,y1:top,x2:x,y2:top+height,class:'ruca-trace-grid'}));
    }
    for(let index=0; index<=4; index+=1){
      const y = top + (index / 4) * height;
      svg.appendChild(make('line', {x1:left,y1:y,x2:left+width,y2:y,class:'ruca-trace-grid'}));
    }
    const referenceRows = [
      ['MIN',safeNum(reading.minimum)],
      ['AVG',safeNum(reading.average)],
      ['MAX',safeNum(reading.maximum)]
    ].filter(([,value])=>value !== null);
    referenceRows.forEach(([label,value])=>{
      const y = yAt(value);
      svg.appendChild(make('line', {x1:left,y1:y,x2:left+width,y2:y,class:`ruca-trace-reference ruca-trace-reference-${label.toLowerCase()}`}));
      svg.appendChild(make('text', {x:left+4,y:Math.max(11,y-4),class:'ruca-trace-reference-label'}, `${label} ${engine.formatValue(value,reading.unit)}`));
    });
    const points = samples.map((sample,index)=>`${xAt(index).toFixed(2)},${yAt(sample.value).toFixed(2)}`);
    if(points.length > 1){
      const linePath = `M ${points.join(' L ')}`;
      const areaPath = `${linePath} L ${xAt(samples.length-1).toFixed(2)},${(top+height).toFixed(2)} L ${xAt(0).toFixed(2)},${(top+height).toFixed(2)} Z`;
      svg.appendChild(make('path', {d:areaPath,class:'ruca-trace-area'}));
      svg.appendChild(make('path', {d:linePath,class:'ruca-trace-line'}));
    }
    const currentX = xAt(samples.length - 1);
    const currentY = yAt(samples[samples.length - 1].value);
    svg.appendChild(make('circle', {cx:currentX,cy:currentY,r:5,class:'ruca-trace-point'}));
    svg.appendChild(make('text', {x:616,y:194,'text-anchor':'end',class:'ruca-trace-current'}, engine.formatValue(reading.current,reading.unit)));
    const duration = samples.length > 1 ? Math.max(0, Math.round((samples[samples.length-1].timestamp - samples[0].timestamp) / 1000)) : 0;
    svg.appendChild(make('text', {x:16,y:201,class:'ruca-trace-caption'}, samples.length > 1 ? `${samples.length} SAMPLE READINGS // ${duration}s WINDOW // PASSIVE MONITOR` : 'SAMPLE TRACE // FIRST OBSERVATION'));
    setText('#chartUnit', traceUnit);
  }

  function renderInventoryOverview(inventory, key){
    const engine = window.RUCADiagnosticsEngine;
    setDiagnosticPresentation(key);
    const isBus = key === 'SensorBus';
    const stateValue = inventory.state;
    const readingCount = inventory.counts.readings;
    const behavior = readingCount ? (isBus ? 'INVENTORY BUS EXPOSED' : 'READINGS EXPOSED') : stateValue;
    const reason = readingCount
      ? `${readingCount} readings from ${inventory.counts.hardwareGroups} hardware groups; ${inventory.counts.available} have finite current values.`
      : inventory.reason;
    setText('#diagTitle', isBus ? 'SENSOR BUS' : 'SYSTEM INVENTORY');
    setText('#diagBehavior', behavior);
    setText('#diagSummary', reason);
    setText('#diagHealth', readingCount ? String(readingCount) : '--');
    setText('#diagState', stateValue);
    setText('#scanStatus', stateValue);
    setText('#diagConfidence', `${inventory.counts.available} / ${readingCount} AVAILABLE`);
    setText('#diagSeverity', stateValue);
    setText('#diagLive', readingCount ? `${readingCount} READINGS` : 'NOT EXPOSED');
    setText('#diagThreshold', 'EVIDENCE ONLY');
    setText('#lastScan', inventory.timestamp ? new Date(inventory.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'}) : '--');
    setText('#chartUnit', inventoryAgeLabel(inventory.freshnessSeconds));

    const rows = [
      ['READINGS',readingCount,'Dynamic inventory'],
      ['HARDWARE GROUPS',inventory.counts.hardwareGroups,'HWiNFO groups'],
      ['AVAILABLE',inventory.counts.available,'Finite current values'],
      ['STALE',inventory.counts.stale,'Source freshness state'],
      ['UNKNOWN',inventory.counts.unknown,'No finite or mapped state'],
      ['UNCLASSIFIED',inventory.counts.unclassified,'Preserved vendor-specific readings']
    ];
    const table = qs('#metricsTable');
    if(table) table.innerHTML = `<div class="metric-row inventory-summary-row"><span>Inventory</span><span>Count</span><span>Evidence</span><span>Freshness</span><span>State</span></div>` + rows.map(([label,value,note])=>`<div class="metric-row inventory-summary-row"><b>${escapeHtml(label)}</b><b>${escapeHtml(String(value))}</b><span>${escapeHtml(note)}</span><span>${escapeHtml(inventoryAgeLabel(inventory.freshnessSeconds))}</span><b class="${inventoryStateClass(stateValue)}">${escapeHtml(stateValue)}</b></div>`).join('');
    const tree = qs('#sensorTree');
    if(tree) tree.innerHTML = `<div class="inventory-domain-grid">${engine.DOMAIN_ORDER.map(domainName=>{
      const domain = inventory.domainMap[domainName];
      return `<button type="button" class="inventory-domain-node" data-inventory-domain="${escapeAttr(domainName)}"><span>${escapeHtml(domainName)}</span><b>${domain?.count || 0}</b><small>${domain?.devices?.length || 0} DEVICE${domain?.devices?.length === 1 ? '' : 'S'}</small></button>`;
    }).join('')}</div>`;
    const deep = qs('#deepGrid');
    if(deep) deep.innerHTML = [
      ['SOURCE',inventory.source,'Read-only HWiNFO shared memory'],
      ['SCHEMA',inventory.sourceSchemaVersion || 'UNKNOWN','PASS26C normalized in browser'],
      ['DUPLICATE IDS',String(inventory.duplicateIds?.composite_readings_affected || 0),'Canonical suffixing preserves every reading'],
      ['TRUTH RULE','NO INFERENCE','Safety, health, cause, and throttling require direct evidence']
    ].map(([label,value,note])=>`<div class="deep-card"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b><small>${escapeHtml(note)}</small></div>`).join('');
    setText('#triWhat', reason);
    setText('#triWhy', 'The inventory count describes exposure only; it is not a machine-health score.');
    setText('#triCheck', `${inventory.counts.stale} stale and ${inventory.counts.unknown} unknown readings are retained explicitly.`);
    setText('#triNext', stateValue === 'STALE' ? 'Refresh HWiNFO before interpreting readings.' : 'Choose a domain, device, then sensor for evidence detail.');
    setText('#triRisk', 'RUCA does not infer safety, health, cause, or throttling from inventory coverage.');
    const alerts = qs('#alertRail');
    if(alerts) alerts.innerHTML = `<div class="alert-pill ${inventoryStateClass(stateValue) === 'ok' ? '' : 'warn'}"><b>${escapeHtml(stateValue)}</b><small>${escapeHtml(inventory.reason)}</small></div>`;
    renderDiagnosticContext(inventory,key,{domain:null,device:null,reading:null});
    renderInventoryChart([], '', inventory.timestamp, inventory);
  }

  function renderInventoryDiagnostics(inventory, error=null){
    const engine = window.RUCADiagnosticsEngine;
    const key = state.diagnosticKey || document.body.dataset.rucaDiagnostic || 'CPU';
    if(!engine || !inventory) return false;
    setDiagnosticPresentation(key);
    if(key === 'ScoreMap' || key === 'SensorBus'){
      renderInventoryOverview(inventory, key);
      return true;
    }

    const context = inventorySelectedContext(inventory, key);
    const {domainName, domain, device, reading} = context;
    const sourceState = inventory.state === 'STALE' ? 'STALE' : 'NOT EXPOSED';
    const interpreted = reading?.interpretation || {
      state:sourceState,
      behavior:sourceState,
      reason:domainName ? `No ${domainName} reading is currently exposed.` : inventory.reason,
      action:sourceState === 'STALE' ? 'Refresh HWiNFO before using this value.' : 'Expose a matching sensor in HWiNFO if required.'
    };
    const currentValue = reading ? engine.formatValue(reading.current, reading.unit) : 'NOT EXPOSED';
    const updated = inventory.timestamp
      ? new Date(inventory.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})
      : '--';
    setText('#diagTitle', reading?.label || `${domainName || key.toUpperCase()} STATUS`);
    setText('#diagBehavior', interpreted.behavior);
    setText('#diagSummary', interpreted.reason);
    setText('#diagHealth', reading ? currentValue : '--');
    setText('#diagState', interpreted.state);
    setText('#scanStatus', inventory.state);
    setText('#diagConfidence', `${domain?.availableCount || 0} / ${domain?.count || 0} AVAILABLE`);
    setText('#diagSeverity', interpreted.state);
    setText('#diagLive', `${domain?.availableCount || 0} / ${domain?.count || 0} SAMPLE`);
    setText('#diagThreshold', reading ? 'OBSERVED RANGE' : 'NOT EXPOSED');
    setText('#lastScan', updated);
    setText('#chartUnit', reading?.unit || interpreted.state);

    const deviceReadings = device?.readings || [];
    const table = qs('#metricsTable');
    if(table){
      table.innerHTML = `<div class="metric-row inventory-metric-row"><span>Sensor</span><span>Current</span><span>Minimum</span><span>Maximum / Average</span><span>State</span></div>` + (deviceReadings.length ? deviceReadings.map(item=>{
        const active = item.id === reading?.id ? ' is-selected' : '';
        return `<button type="button" class="metric-row inventory-metric-row${active}" data-inventory-sensor="${escapeAttr(item.id)}"><span><b>${escapeHtml(item.label)}</b><small>${escapeHtml(item.unit || 'UNIT NOT EXPOSED')} // ${escapeHtml(item.reading_id || 'ID UNKNOWN')}</small></span><b>${escapeHtml(engine.formatValue(item.current,item.unit))}</b><span>${escapeHtml(engine.formatValue(item.minimum,item.unit))}</span><span>${escapeHtml(engine.formatValue(item.maximum,item.unit))} / ${escapeHtml(engine.formatValue(item.average,item.unit))}</span><b class="${inventoryStateClass(item.interpretation.state)}">${escapeHtml(item.interpretation.state)}</b></button>`;
      }).join('') : `<div class="inventory-empty-state"><b>NOT EXPOSED</b><small>No reading is assigned to this domain.</small></div>`);
    }

    const tree = qs('#sensorTree');
    if(tree){
      tree.innerHTML = `<div class="inventory-breadcrumb"><b>${escapeHtml(domainName || 'UNKNOWN')}</b><span>\u2192</span><b>${escapeHtml(device?.name || 'NO DEVICE')}</b><span>\u2192</span><b>${escapeHtml(reading?.label || 'NO SENSOR')}</b></div><div class="inventory-device-list">${(domain?.devices || []).map(item=>`<button type="button" class="inventory-device-node${item.id === device?.id ? ' is-selected' : ''}" data-inventory-device="${escapeAttr(item.id)}"><span>${escapeHtml(item.name)}</span><b>${item.readings.length}</b><small>${escapeHtml(item.headline?.interpretation?.state || 'NOT EXPOSED')}</small></button>`).join('') || '<div class="inventory-empty-state"><b>NOT EXPOSED</b><small>No hardware device maps to this domain.</small></div>'}</div><div class="inventory-sensor-list">${deviceReadings.map(item=>`<button type="button" class="inventory-sensor-node${item.id === reading?.id ? ' is-selected' : ''}" data-inventory-sensor="${escapeAttr(item.id)}"><span>${escapeHtml(item.label)}</span><b>${escapeHtml(engine.formatValue(item.current,item.unit))}</b><small>${escapeHtml(item.interpretation.state)}</small></button>`).join('')}</div>`;
    }

    const deep = qs('#deepGrid');
    if(deep){
      const details = reading ? [
        ['HARDWARE GROUP',reading.hardware_group,reading.hardware_group_id],
        ['SENSOR IDS',reading.sensor_id || 'UNKNOWN',`Reading ${reading.reading_id || 'UNKNOWN'} // ${reading.id}`],
        ['AVAILABILITY',reading.availability,`${inventoryAgeLabel(reading.freshness_seconds)} // ${reading.source}`],
        ['CURRENT',engine.formatValue(reading.current,reading.unit),`Min ${engine.formatValue(reading.minimum,reading.unit)} // Max ${engine.formatValue(reading.maximum,reading.unit)} // Avg ${engine.formatValue(reading.average,reading.unit)}`],
        ['INTERPRETATION',interpreted.state,interpreted.reason],
        ['ACTION',interpreted.action,'Evidence-based only']
      ] : [['DOMAIN',domainName || 'UNKNOWN','No matching reading exposed'],['STATE',interpreted.state,interpreted.reason]];
      deep.innerHTML = details.map(([label,value,note])=>`<div class="deep-card"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b><small>${escapeHtml(note)}</small></div>`).join('');
    }

    setText('#triWhat', `${interpreted.behavior}. ${interpreted.reason}`);
    setText('#triWhy', reading ? `This statement uses the current value from ${reading.hardware_group}.` : 'No current sensor value is exposed for this domain.');
    setText('#triCheck', reading ? `Compare minimum, maximum, and average for reading ID ${reading.reading_id || 'UNKNOWN'}.` : 'Confirm HWiNFO exposes a matching reading and refresh the inventory.');
    setText('#triNext', interpreted.action);
    setText('#triRisk', 'No safety, health, causality, or throttling claim is made without a directly exposed sensor flag.');
    const alerts = qs('#alertRail');
    if(alerts) alerts.innerHTML = `<div class="alert-pill ${inventoryStateClass(interpreted.state) === 'ok' ? '' : 'warn'}"><b>${escapeHtml(interpreted.state)}</b><small>${escapeHtml(interpreted.reason)}</small></div>`;
    renderDiagnosticContext(inventory,key,context);
    renderInventoryChart(deviceReadings, reading?.id || '', inventory.timestamp);
    return true;
  }

  function renderTelemetryDiagnostics(telemetry=state.normalizedTelemetry || emptyTelemetry('CHECKING'), error=null){
    if(state.normalizedInventory && renderInventoryDiagnostics(state.normalizedInventory, error)) return;
    const key = state.diagnosticKey || document.body.dataset.rucaDiagnostic || 'CPU';
    setDiagnosticPresentation(key);
    const rows = diagnosticRowsFor(key, telemetry);
    const liveRows = rows.filter(row=>diagnosticRowState(row, telemetry) === 'LIVE');
    const missingRows = rows.filter(row=>diagnosticRowState(row, telemetry) === 'SENSOR NOT EXPOSED');
    const source = telemetry.source.toUpperCase();
    const updated = telemetry.timestampMs
      ? new Date(telemetry.timestampMs).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})
      : '--';
    const currentHeart = telemetry.heart !== null && telemetry.status !== 'STALE DATA' && telemetry.status !== 'DATA UNAVAILABLE' && telemetry.status !== 'BRIDGE OFFLINE';
    const title = key === 'ScoreMap' ? 'SYSTEM STATUS' : key === 'SensorBus' ? 'SENSOR BUS' : `${key.toUpperCase()} STATUS`;
    const summary = telemetry.status === 'BRIDGE OFFLINE'
      ? 'The canonical bridge is offline. RUCA is not substituting estimated values.'
      : telemetry.status === 'DATA UNAVAILABLE'
        ? `The bridge response cannot be used as machine truth. ${telemetry.reason}`
        : telemetry.status === 'STALE DATA'
          ? `The last ${source} sample is stale. Values remain visible only as historical context.`
          : `Fresh machine telemetry from ${source}. Unexposed sensors remain explicitly unavailable.`;

    setText('#diagTitle', title);
    setText('#diagSummary', summary);
    setText('#diagHealth', currentHeart ? String(Math.round(telemetry.heart)) : '--');
    setText('#diagState', currentHeart ? telemetry.machineState : telemetry.status);
    setText('#scanStatus', telemetry.status);
    setText('#diagConfidence', `${liveRows.length} / ${rows.length} SAMPLE`);
    setText('#diagSeverity', currentHeart ? telemetry.machineState : 'NOT ASSESSED');
    setText('#diagLive', liveRows.length ? `${liveRows.length} CHANNEL${liveRows.length === 1 ? '' : 'S'}` : 'DATA UNAVAILABLE');
    setText('#diagThreshold', 'SOURCE-DRIVEN');
    setText('#lastScan', updated);
    setText('#chartUnit', telemetry.status);

    const table = qs('#metricsTable');
    if(table){
      table.innerHTML = `<div class="metric-row"><span>Metric</span><span>Current</span><span>Source</span><span>Updated</span><span>State</span></div>` + rows.map(row=>{
        const status = diagnosticRowState(row, telemetry);
        const statusClass = status === 'LIVE' ? 'ok' : status === 'STALE DATA' ? 'warn' : 'crit';
        return `<div class="metric-row"><b>${escapeHtml(row.label)}</b><b>${escapeHtml(diagnosticRowValue(row, telemetry))}</b><span>${escapeHtml(source)}</span><span>${escapeHtml(updated)}</span><b class="${statusClass}">${escapeHtml(status)}</b></div>`;
      }).join('');
    }

    const tree = qs('#sensorTree');
    if(tree){
      tree.innerHTML = rows.map(row=>{
        const status = diagnosticRowState(row, telemetry);
        return `<div class="sensor-node"><b>${escapeHtml(row.label)}</b><small>${escapeHtml(diagnosticRowValue(row, telemetry))}</small><small class="node-status">${escapeHtml(status)} // ${escapeHtml(source)}</small></div>`;
      }).join('');
    }

    const exposedCount = Object.values(telemetry.fields).filter(value=>value !== null).length;
    const totalCount = Object.keys(telemetry.fields).length;
    const deep = qs('#deepGrid');
    if(deep){
      deep.innerHTML = [
        ['TRUTH RULE','NO SYNTHETIC VALUES','Missing readings never become zero.'],
        ['SOURCE',source,TELEMETRY_ENDPOINT],
        ['FRESHNESS',telemetry.status,telemetry.ageMs === null ? 'No valid sample time.' : `${(telemetry.ageMs / 1000).toFixed(1)} seconds old.`],
        ['COVERAGE',`${exposedCount} / ${totalCount}`,missingRows.length ? 'Some selected sensors are not exposed.' : 'Selected sensors are reporting.']
      ].map(([label,value,note])=>`<div class="deep-card"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b><small>${escapeHtml(note)}</small></div>`).join('');
    }

    setText('#triWhat', telemetry.status === 'LIVE' || telemetry.status === 'PARTIAL'
      ? `${liveRows.length} of ${rows.length} selected channels are fresh from the canonical bridge.`
      : summary);
    setText('#triWhy', 'RUCA bases machine guidance only on fresh fields returned by the canonical local bridge.');
    setText('#triCheck', missingRows.length
      ? `Not exposed: ${missingRows.map(row=>row.label).join(', ')}.`
      : telemetry.status === 'BRIDGE OFFLINE'
        ? 'This demonstration uses local sample values; a hardware source is not connected.'
        : telemetry.reason);
    setText('#triNext', telemetry.status === 'BRIDGE OFFLINE'
      ? 'Leave RUCA open for automatic recovery or refresh telemetry.'
      : telemetry.status === 'STALE DATA'
        ? 'Confirm the bridge is updating, then refresh telemetry.'
        : 'Continue monitoring the channels currently exposed.');
    setText('#triRisk', currentHeart
      ? (telemetry.machineState === 'ALERT' ? 'The bridge reports an alert from available real sensors.' : 'No additional risk is inferred beyond available fresh sensors.')
      : `Assessment unavailable${error?.name === 'AbortError' ? ' because the bridge timed out' : ''}.`);

    const alerts = qs('#alertRail');
    if(alerts){
      const warning = telemetry.status !== 'LIVE' && telemetry.status !== 'PARTIAL';
      alerts.innerHTML = `<div class="alert-pill ${warning ? 'warn' : ''}"><b>${warning ? telemetry.status : 'GUARDIAN'}</b><small>${escapeHtml(telemetry.reason)}</small></div>`;
    }
    renderTelemetryDiagnosticContext(rows,telemetry);
    renderTelemetryChart(telemetry, rows);
  }

  function renderTelemetryChart(telemetry, rows){
    const svg = qs('#sensorChart');
    if(!svg) return;
    svg.replaceChildren();
    const metrics = rows.filter(row=>row.value !== null).slice(0,5);
    const make = (name, attrs={}, text='')=>{
      const node = document.createElementNS('http://www.w3.org/2000/svg', name);
      Object.entries(attrs).forEach(([key,value])=>node.setAttribute(key, String(value)));
      if(text) node.textContent = text;
      return node;
    };
    if(!metrics.length){
      svg.appendChild(make('text', {x:320,y:110,'text-anchor':'middle',fill:'currentColor','font-size':22}, telemetry.status));
      return;
    }
    metrics.forEach((row, index)=>{
      const y = 20 + index * 38;
      const ratio = Math.max(0, Math.min(1, row.value / Math.max(1, row.max || row.value)));
      svg.appendChild(make('text', {x:12,y:y+17,fill:'currentColor','font-size':15}, row.label));
      svg.appendChild(make('rect', {x:100,y,width:500,height:18,rx:9,fill:'rgba(255,255,255,.08)'}));
      svg.appendChild(make('rect', {x:100,y,width:Math.max(2,ratio * 500),height:18,rx:9,fill:'var(--gold)'}));
      svg.appendChild(make('text', {x:626,y:y+15,'text-anchor':'end',fill:'currentColor','font-size':14}, diagnosticRowValue(row, telemetry)));
    });
  }

  function refreshRightRail(){
    if((document.body.dataset.world || 'home') !== 'home') return;
    if(state.weather?.current){
      const c = state.weather.current;
      const tempNow = safeNum(c.temperature_2m);
      if(tempNow !== null) setRailCard('weather', `${Math.round(tempNow)}°F`, `${codeMap[c.weather_code] || 'Live weather'} / local`);
    }
    if(state.markets?.items?.length || state.markets?.symbols?.length){
      const m = (state.markets.symbols || state.markets.items || [])[0] || {};
      const label = m.price !== undefined && m.price !== null ? `${Number(m.price).toFixed(2)}` : (m.close || 'LIVE');
      setRailCard('market', `${m.symbol || 'MARKET'} ${label}`, state.markets.state === 'STALE' ? 'Stale cache available' : 'Bridge market feed live');
    }
    if(state.news?.items?.length){
      setRailCard('news', 'LIVE', `${state.news.items.length} news cards available`);
    }
    if(state.sports?.gamesToday?.length || state.sports?.nextGames?.length){
      const count = (state.sports.gamesToday?.length || 0) + (state.sports.nextGames?.length || 0);
      setRailCard('sports', state.sports.state || 'LIVE', `${count} scoreboard events available`);
    }else if(state.sports?.state){
      setRailCard('sports', state.sports.state, state.sports.last_error || 'Sports source has action state');
    }
    if(state.tech?.items?.length){
      setRailCard('tech', 'LIVE', `${state.tech.items.length} tech cards available`);
    }
  }

  function setRailCard(lane, title, detail){
    const card = qs(`.world-card[data-lane-jump="${lane}"]`);
    if(!card) return;
    const titleEl = card.querySelector('b');
    const detailEl = card.querySelector('small');
    if(titleEl) titleEl.textContent = title;
    if(detailEl) detailEl.textContent = detail;
  }

  function configureLiveWorldNavigation(){
    const buttons = qsa('#page-live .lane-btn');
    LIVE_WORLD_REALMS.forEach((realm, index)=>{
      const button = buttons[index];
      if(!button) return;
      button.dataset.lane = realm.key;
      button.dataset.sourceState = 'NOT QUERIED';
      button.textContent = realm.label;
      button.classList.toggle('active', index === 0);
      button.setAttribute('aria-controls', 'laneStage');
      button.setAttribute('aria-label', `${realm.label} // NOT QUERIED`);
    });
  }

  function clampLiveRefreshSeconds(value, minimum=LIVE_REFRESH_MIN_SECONDS, maximum=LIVE_REFRESH_MAX_SECONDS){
    const parsed = Number(value);
    const safe = Number.isFinite(parsed) ? Math.round(parsed) : LIVE_REFRESH_DEFAULT_SECONDS;
    return Math.max(minimum, Math.min(maximum, safe));
  }

  function installLiveWorldRefreshPolicy(){
    const saved = readSourceControls();
    setLiveWorldRefreshPolicy({refresh_seconds:saved.refreshSeconds}, 'local-preference');
  }

  function setLiveWorldRefreshPolicy(policy={}, reason='bridge'){
    const minimum = clampLiveRefreshSeconds(policy.minimum_seconds ?? LIVE_REFRESH_MIN_SECONDS, 60, LIVE_REFRESH_MAX_SECONDS);
    const maximum = clampLiveRefreshSeconds(policy.maximum_seconds ?? LIVE_REFRESH_MAX_SECONDS, minimum, 3600);
    const seconds = clampLiveRefreshSeconds(policy.refresh_seconds ?? policy.seconds, minimum, maximum);
    const previousSeconds = state.liveRefresh.seconds;
    state.liveRefresh.minimum = minimum;
    state.liveRefresh.maximum = maximum;
    state.liveRefresh.seconds = seconds;
    state.liveRefresh.owner = policy.owner || state.liveRefresh.owner || 'ruca_local_bridge.py';
    state.liveRefresh.lastReason = reason;
    const stored = readSourceControls();
    localStorage.setItem('rucaSourceControls', JSON.stringify({...stored, refreshSeconds:seconds}));
    const control = qs('#rucaRefreshInterval');
    if(control && [...control.options].some(option=>Number(option.value) === seconds)) control.value = String(seconds);
    if(previousSeconds !== seconds || !state.liveRefresh.timerId || reason === 'control-save'){
      scheduleLiveWorldRefresh(`policy:${reason}`);
    }else{
      publishLiveWorldRefreshPolicy(`policy-confirmed:${reason}`);
    }
  }

  function publishLiveWorldRefreshPolicy(reason){
    const policy = {
      owner:state.liveRefresh.owner,
      activeLane:state.lastLane,
      refreshSeconds:state.liveRefresh.seconds,
      minimumSeconds:state.liveRefresh.minimum,
      maximumSeconds:state.liveRefresh.maximum,
      timerOwners:state.liveRefresh.timerId ? 1 : 0,
      lastReason:reason
    };
    document.documentElement.dataset.rucaLiveRefreshPolicy = JSON.stringify(policy);
    if(Object.isExtensible(window)) window.RUCA_LIVE_REFRESH_POLICY = policy;
  }

  function scheduleLiveWorldRefresh(reason='lane-active'){
    if(state.liveRefresh.timerId) clearTimeout(state.liveRefresh.timerId);
    state.liveRefresh.timerId = 0;
    state.liveRefresh.lastReason = reason;
    if((document.body.dataset.world || 'home') !== 'live'){
      publishLiveWorldRefreshPolicy(`suspended:${reason}`);
      return;
    }
    state.liveRefresh.timerId = window.setTimeout(async ()=>{
      state.liveRefresh.timerId = 0;
      if((document.body.dataset.world || 'home') === 'live'){
        const lane = state.lastLane;
        const token = beginLaneRequest(lane);
        await refreshLaneData(lane, true, token);
      }
      scheduleLiveWorldRefresh('scheduled');
    }, state.liveRefresh.seconds * 1000);
    publishLiveWorldRefreshPolicy(reason);
  }

  function installLiveWorldOverride(){
    configureLiveWorldNavigation();
    function setLiveWorldLane(key){
      if(LIVE_WORLD_REALMS.some(realm=>realm.key === key)){
        if(key !== 'news') stopEditorialCarousel();
        state.lastLane = key;
        qsa('.lane-btn').forEach(b=>b.classList.toggle('active', b.dataset.lane === key));
        syncPass16FLiveLane(key);
        if((document.body.dataset.world || 'home') !== 'live'){
          scheduleLiveWorldRefresh('lane-selected-off-world');
          return;
        }
        scheduleLiveWorldRefresh('lane-change');
        const token = beginLaneRequest(key);
        const cached = cachedLaneData(key);
        if(cached){
          renderLiveWorld(key, cached, sourceStateForLane(key, cached), token);
          return;
        }
        renderLiveWorld(key, loadingLaneCards(key), {
          phase:'loading',
          state:'UNAVAILABLE',
          subtitle:'Verifying source state',
          provider:'RUCA local bridge'
        }, token);
        refreshLaneData(key, false, token);
        return;
      }
    }
    window.setLiveWorldLane = setLiveWorldLane;
    window.RUCA_PASS02B_setLane = setLiveWorldLane;
    window.setLane = setLiveWorldLane;
    window.renderLiveWorld = renderLiveWorld;
    qsa('.lane-btn').forEach(btn=>{
      if(btn.dataset.liveWorldBound === 'true') return;
      btn.dataset.liveWorldBound = 'true';
      btn.addEventListener('click',()=>setLiveWorldLane(btn.dataset.lane));
    });
    if(qs('#page-live.active')) setLiveWorldLane('weather');
  }

  function installPass16FPatternTranslation(){
    if(document.body.dataset.pass16fPatternReady === 'true') return;
    document.body.dataset.pass16fPatternReady = 'true';
    bindPass16FPlayOrbit();
    document.addEventListener('ruca:play-registry-ready', bindPass16FPlayOrbit, {once:true});

    syncPass16FLiveLane(state.lastLane || 'weather');
    const syncLiveOnArrival = mutations=>{
      if(mutations?.length) resetControllerDigitalRepeat('route-change', true);
      const world = document.body.dataset.world || 'home';
      if(world === 'play') layoutPass16FPlayOrbit();
      if(world === 'control') refreshSourcesStatus();
      if(world !== 'live'){
        scheduleLiveWorldRefresh('world-exit');
        stopEditorialCarousel();
        return;
      }
      refreshSourcesStatus();
      const activeLane = qs('#page-live .lane-btn.active')?.dataset.lane || state.lastLane || 'weather';
      if(!qs('#rucaLiveGrid .ruca-observation-console')){
        window.RUCA_PASS02B_setLane(activeLane);
      }else{
        syncPass16FLiveLane(activeLane);
        scheduleLiveWorldRefresh('world-entry');
        const carousel = qs('#rucaLiveGrid .editorial-carousel');
        if(activeLane === 'news' && carousel) startEditorialCarousel(carousel);
      }
    };
    new MutationObserver(syncLiveOnArrival).observe(document.body, {attributes:true, attributeFilter:['data-world']});
    syncLiveOnArrival();
    window.RUCA_PASS16F = {
      rotatePlayRail: rotatePass16FPlayRail,
      setPlayRail: index=>setPass16FPlayRail(index, {source:'api', focus:true}),
      selectedPlayIndex: ()=>pass16FSelectedIndex(),
      layoutPlayOrbit: layoutPass16FPlayOrbit
    };
  }

  function bindPass16FPlayOrbit(){
    const orbit = qs('#page-play .launcher-orbit');
    const nodes = pass16FAllPlayNodes();
    if(orbit && nodes.length && orbit.dataset.pass19OrbitBound !== 'true'){
      orbit.dataset.pass19OrbitBound = 'true';
      orbit.setAttribute('role', 'listbox');
      orbit.setAttribute('aria-label', 'RUCA Play orbital command rail');
      nodes.forEach((node, index)=>{
        node.dataset.pass16fIndex = String(index);
        node.setAttribute('role', 'option');
        node.setAttribute('aria-label', `${pass16FNodeLabel(node)} launch port`);
      });
      layoutPass16FPlayOrbit();
      orbit.addEventListener('wheel', event=>{
        if((document.body.dataset.world || 'home') !== 'play') return;
        const axis = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
        if(!axis) return;
        event.preventDefault();
        rotatePass16FPlayRail(axis > 0 ? 1 : -1, 'wheel');
      }, {passive:false});
      orbit.addEventListener('pointerdown', event=>{
        const node = event.target.closest?.('.launch-node');
        if(!node || !orbit.contains(node)) return;
        setPass16FPlayRail(Number(node.dataset.pass16fIndex || 0), {source:'pointer'});
      }, {capture:true});
      orbit.addEventListener('focusin', event=>{
        const node = event.target.closest?.('.integrated-app-node');
        if(!node || !orbit.contains(node)) return;
        setPass16FPlayRail(Number(node.dataset.pass16fIndex || 0), {source:'focus'});
      });
      if(typeof ResizeObserver === 'function'){
        const observer = new ResizeObserver(()=>layoutPass16FPlayOrbit());
        observer.observe(orbit);
        orbit.pass16fResizeObserver = observer;
      }else{
        window.addEventListener('resize', layoutPass16FPlayOrbit, {passive:true});
      }
      document.addEventListener('ruca:play-orbit-change', event=>{
        const visibleNodes = pass16FPlayNodes();
        const preferred = event.detail?.preferredAppId || '';
        const preferredIndex = visibleNodes.findIndex(node=>node.dataset.appId === preferred);
        orbit.dataset.selectedIndex = String(preferredIndex >= 0 ? preferredIndex : 0);
        if(!visibleNodes.length){
          setPass16FPlayRail(0,{source:'collection-empty'});
          return;
        }
        layoutPass16FPlayOrbit();
      });
    }
  }

  function pass16FAllPlayNodes(){
    return qsa('#page-play .integrated-app-node');
  }

  function pass16FPlayNodes(){
    return pass16FAllPlayNodes().filter(node=>!node.hidden);
  }

  function pass16FNodeLabel(node){
    if(node?.dataset?.app) return node.dataset.app;
    const clone = node.cloneNode(true);
    clone.querySelectorAll('small,svg').forEach(el=>el.remove());
    return (clone.textContent || node.textContent || 'Launch').trim().replace(/\s+/g, ' ');
  }

  function pass16FNodeState(node){
    if(node?.dataset?.status) return node.dataset.status;
    return (node.querySelector('small')?.textContent || 'ready').trim().replace(/\s+/g, ' ');
  }

  function pass16FSelectedIndex(){
    const nodes = pass16FPlayNodes();
    const orbit = qs('#page-play .launcher-orbit');
    if(!nodes.length) return 0;
    const fromData = Number(orbit?.dataset.selectedIndex);
    if(Number.isFinite(fromData)) return ((fromData % nodes.length) + nodes.length) % nodes.length;
    const active = nodes.findIndex(node=>node.classList.contains('is-primary'));
    return active >= 0 ? active : 0;
  }

  function clampPass16F(value,min,max){
    return Math.max(min,Math.min(max,value));
  }

  function layoutPass16FPlayOrbit(){
    if((document.body.dataset.world || 'home') !== 'play') return;
    const orbit = qs('#page-play .launcher-orbit');
    const nodes = pass16FPlayNodes();
    if(!orbit || !nodes.length) return;
    const w = orbit.clientWidth;
    const h = orbit.clientHeight;
    if(w < 1 || h < 1) return;
    const compactDock = w < 520;
    const layoutMode = compactDock ? 'compact' : 'radial';
    orbit.dataset.orbitMode = layoutMode;
    const layoutSignature = `${layoutMode}:${Math.round(w * 2) / 2}:${Math.round(h * 2) / 2}:${nodes.map(node=>node.dataset.appId || node.dataset.app || '').join(',')}`;
    if(orbit.dataset.layoutSignature === layoutSignature){
      setPass16FPlayRail(pass16FSelectedIndex(), {source:'layout-cache'});
      return;
    }
    orbit.dataset.layoutSignature = layoutSignature;
    if(compactDock){
      orbit.style.setProperty('--command-node-size',`${clampPass16F(w * .105, 34, 38).toFixed(3)}px`);
      orbit.style.setProperty('--command-core-size',`${clampPass16F(w * .42, 136, 148).toFixed(3)}px`);
      orbit.dataset.minimumNodeClearance = 'compact-dock';
      setPass16FPlayRail(pass16FSelectedIndex(), {source:'compact-layout'});
      return;
    }
    const narrow = w < 720;
    const nodeSize = narrow
      ? clampPass16F(w * .115, 36, 46)
      : clampPass16F(Math.min(w * .038, h * .105), 42, 62);
    const coreSize = narrow
      ? clampPass16F(Math.min(w * .48, h * .24), 150, 190)
      : clampPass16F(Math.min(w * .18, h * .40), 184, 284);
    const compactHeight = h < 460;
    const maxRx = Math.max(nodeSize, w / 2 - Math.max(nodeSize * .72, narrow ? 68 : 86) - 18);
    const maxRy = Math.max(nodeSize, h / 2 - nodeSize * .7 - (compactHeight ? 18 : 34));
    const minimumRing = coreSize / 2 + nodeSize / 2 + (compactHeight ? 12 : 26);
    let counts;
    let rings;
    if(nodes.length <= 8){
      counts = [nodes.length];
      rings = [{
        rx:Math.min(maxRx,Math.max(minimumRing,maxRx * .62)),
        ry:Math.min(maxRy,Math.max(minimumRing,maxRy * .72))
      }];
    }else if(nodes.length <= 18){
      const innerCount = Math.ceil(nodes.length * .45);
      counts = [innerCount,nodes.length - innerCount];
      rings = [
        {rx:Math.min(maxRx,Math.max(minimumRing,maxRx * .48)),ry:Math.min(maxRy,Math.max(minimumRing,maxRy * .62))},
        {rx:Math.min(maxRx,Math.max(minimumRing,maxRx * .84)),ry:Math.min(maxRy,Math.max(minimumRing,maxRy * .90))}
      ];
    }else if(narrow){
      counts = [6,8,10,Math.max(1,nodes.length - 24)];
      rings = [
        {rx:Math.min(maxRx,Math.max(minimumRing,maxRx * .68)),ry:Math.min(maxRy,Math.max(minimumRing,maxRy * .34))},
        {rx:Math.min(maxRx,Math.max(minimumRing,maxRx * .84)),ry:Math.min(maxRy,Math.max(minimumRing,maxRy * .56))},
        {rx:maxRx,ry:Math.min(maxRy,Math.max(minimumRing,maxRy * .77))},
        {rx:maxRx,ry:maxRy}
      ];
    }else{
      counts = [8,12,Math.max(1,nodes.length - 20)];
      rings = [
        {rx:Math.min(maxRx,Math.max(minimumRing,maxRx * .34)),ry:Math.min(maxRy,Math.max(minimumRing,maxRy * .55))},
        {rx:Math.min(maxRx,Math.max(minimumRing,maxRx * .64)),ry:Math.min(maxRy,Math.max(minimumRing,maxRy * .78))},
        {rx:maxRx * .96,ry:maxRy}
      ];
    }
    orbit.style.setProperty('--command-node-size',`${nodeSize.toFixed(3)}px`);
    orbit.style.setProperty('--command-core-size',`${coreSize.toFixed(3)}px`);
    let cursor = 0;
    const placed = [];
    counts.forEach((count,ringIndex)=>{
      const ring = rings[Math.min(ringIndex,rings.length - 1)];
      const actual = Math.min(count,nodes.length - cursor);
      if(actual <= 0) return;
      const step = Math.PI * 2 / Math.max(1,actual);
      let bestOffset = 0;
      let bestClearance = -Infinity;
      const candidateCount = actual === 1 ? 1 : 72;
      for(let candidate=0;candidate<candidateCount;candidate+=1){
        const offset = step * candidate / candidateCount;
        const proposed = [];
        for(let slot=0;slot<actual;slot+=1){
          const angle = -Math.PI / 2 + step * slot + offset;
          proposed.push({x:Math.cos(angle) * ring.rx,y:Math.sin(angle) * ring.ry});
        }
        let clearance = Infinity;
        proposed.forEach((point,pointIndex)=>{
          placed.forEach(other=>{ clearance = Math.min(clearance,Math.hypot(point.x-other.x,point.y-other.y)); });
          for(let previous=0;previous<pointIndex;previous+=1){
            clearance = Math.min(clearance,Math.hypot(point.x-proposed[previous].x,point.y-proposed[previous].y));
          }
        });
        if(clearance > bestClearance){
          bestClearance = clearance;
          bestOffset = offset;
        }
      }
      for(let slot=0;slot<actual;slot+=1){
        const node = nodes[cursor + slot];
        const angle = -Math.PI / 2 + step * slot + bestOffset;
        const x = Math.cos(angle) * ring.rx;
        const y = Math.sin(angle) * ring.ry;
        node.style.setProperty('--orbit-x',`${x.toFixed(3)}px`);
        node.style.setProperty('--orbit-y',`${y.toFixed(3)}px`);
        node.dataset.orbitX = x.toFixed(3);
        node.dataset.orbitY = y.toFixed(3);
        node.dataset.orbitRing = String(ringIndex + 1);
        node.dataset.orbitHemisphere = y > 12 ? 'bottom' : 'top';
        placed.push({x,y});
      }
      cursor += actual;
    });
    let minimumCenterDistance = Infinity;
    for(let left=0;left<placed.length;left+=1){
      for(let right=left+1;right<placed.length;right+=1){
        minimumCenterDistance = Math.min(minimumCenterDistance,Math.hypot(placed[left].x-placed[right].x,placed[left].y-placed[right].y));
      }
    }
    const selectedScaleClearance = Number.isFinite(minimumCenterDistance) ? (minimumCenterDistance - 4) / 1.17 : nodeSize;
    const fittedNodeSize = Math.max(narrow ? 22 : 32,Math.min(nodeSize,selectedScaleClearance));
    orbit.style.setProperty('--command-node-size',`${fittedNodeSize.toFixed(3)}px`);
    orbit.dataset.minimumNodeClearance = Number.isFinite(minimumCenterDistance) ? minimumCenterDistance.toFixed(3) : '';
    setPass16FPlayRail(pass16FSelectedIndex(), {source:'layout'});
  }

  function setPass16FPlayRail(index=0, options={}){
    const orbit = qs('#page-play .launcher-orbit');
    const nodes = pass16FPlayNodes();
    if(!orbit) return;
    const core = qs('#page-play .launch-core');
    if(!nodes.length){
      orbit.dataset.selectedIndex = '0';
      if(core){
        core.disabled = true;
        core.dataset.app = '';
        core.dataset.appId = '';
        core.dataset.status = '';
      }
      if(qs('#commandWheelKicker')) qs('#commandWheelKicker').textContent = 'COLLECTION EMPTY';
      if(qs('#commandWheelIcon')) qs('#commandWheelIcon').innerHTML = '';
      if(qs('#commandWheelTitle')) qs('#commandWheelTitle').textContent = 'NO COMMANDS';
      if(qs('#commandWheelRole')) qs('#commandWheelRole').textContent = 'Choose another collection';
      if(qs('#commandWheelState')) qs('#commandWheelState').textContent = 'IDLE';
      if(qs('#commandWheelPosition')) qs('#commandWheelPosition').textContent = '0 / 0';
      const emptyLink = qs('#commandSelectionLink');
      if(emptyLink) emptyLink.style.setProperty('--selection-link-length','0px');
      document.dispatchEvent(new CustomEvent('ruca:play-selection-change',{detail:{appId:''}}));
      return;
    }
    const selected = ((Math.round(Number(index) || 0) % nodes.length) + nodes.length) % nodes.length;
    orbit.dataset.selectedIndex = String(selected);
    nodes.forEach((node, nodeIndex)=>{
      let rel = (nodeIndex - selected + nodes.length) % nodes.length;
      if(rel > nodes.length / 2) rel -= nodes.length;
      node.dataset.orbitSlot = rel === 0 ? 'selected' : 'orbital';
      node.classList.toggle('is-primary', rel === 0);
      node.classList.toggle('is-neighbor', Math.abs(rel) === 1);
      node.classList.toggle('is-receded', false);
      node.setAttribute('aria-selected', rel === 0 ? 'true' : 'false');
      node.setAttribute('aria-current', rel === 0 ? 'true' : 'false');
    });
    const selectedNode = nodes[selected];
    if(core && selectedNode){
      const appIcon = selectedNode.querySelector('.ruca-app-icon');
      const favorite = selectedNode.dataset.favorite === 'true';
      core.disabled = false;
      if(qs('#commandWheelKicker')) qs('#commandWheelKicker').textContent = favorite ? 'FAVORITE PORT' : 'SELECTED PORT';
      if(qs('#commandWheelIcon')) qs('#commandWheelIcon').innerHTML = appIcon ? appIcon.outerHTML : '';
      if(qs('#commandWheelTitle')) qs('#commandWheelTitle').textContent = pass16FNodeLabel(selectedNode);
      if(qs('#commandWheelRole')) qs('#commandWheelRole').textContent = selectedNode.dataset.role || 'Command module';
      if(qs('#commandWheelState')) qs('#commandWheelState').textContent = pass16FNodeState(selectedNode);
      core.dataset.app = selectedNode.dataset.app || '';
      core.dataset.appId = selectedNode.dataset.appId || '';
      core.dataset.status = selectedNode.dataset.status || '';
      core.setAttribute('aria-label',`Open selected ${pass16FNodeLabel(selectedNode)} command`);
      core.classList.remove('is-command-active');
      void core.offsetWidth;
      core.classList.add('is-command-active');
    }
    const district = qs('#commandWheelCategory');
    const position = qs('#commandWheelPosition');
    if(district) district.textContent = (selectedNode?.dataset.district || 'COMMAND').toUpperCase();
    if(position) position.textContent = `${selected + 1} / ${nodes.length}`;
    const link = qs('#commandSelectionLink');
    if(link && selectedNode){
      const x = Number(selectedNode.dataset.orbitX || 0);
      const y = Number(selectedNode.dataset.orbitY || 0);
      link.style.setProperty('--selection-link-length',`${Math.hypot(x,y).toFixed(3)}px`);
      link.style.setProperty('--selection-link-angle',`${(Math.atan2(y,x) * 180 / Math.PI).toFixed(3)}deg`);
    }
    document.dispatchEvent(new CustomEvent('ruca:play-selection-change',{detail:{appId:selectedNode.dataset.appId || '',index:selected,count:nodes.length}}));
    if(options.focus && selectedNode) focusElement(selectedNode);
  }

  function rotatePass16FPlayRail(delta=1, source='input'){
    const nodes = pass16FPlayNodes();
    if(!nodes.length) return false;
    setPass16FPlayRail(pass16FSelectedIndex() + delta, {source, focus:source !== 'init'});
    window.RUCA_AUDIO?.cue('focus');
    return true;
  }

  function handlePass16FPlayDirection(direction, source='keyboard'){
    if((document.body.dataset.world || 'home') !== 'play') return false;
    if(direction !== 'left' && direction !== 'right') return false;
    if(document.activeElement?.matches?.('.command-filter-btn,.command-favorite-toggle')) return false;
    return rotatePass16FPlayRail(direction === 'right' ? 1 : -1, source);
  }

  function syncPass16FLiveLane(key){
    const live = qs('#page-live .live-grid');
    const switcher = qs('#page-live .lane-switcher');
    if(live){
      live.dataset.activeLane = key;
      live.dataset.world = key;
    }
    if(switcher) switcher.dataset.activeLane = key;
    qsa('#page-live .lane-btn').forEach(btn=>{
      const active = btn.dataset.lane === key;
      btn.dataset.laneState = active ? 'active' : 'standby';
      btn.classList.toggle('is-primary-observation', active);
      btn.classList.toggle('is-signal-fragment', !active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function laneTitle(key){
    return ({weather:'LOCAL CONDITIONS', news:'WORLD BRIEFING', sports:'GAME DAY', signal:'SIGNAL INTELLIGENCE', celestial:'CELESTIAL OBSERVATORY', market:'MARKET PULSE', tech:'TECHNOLOGY SIGNALS'})[key] || key.toUpperCase();
  }
  function laneName(key){
    return ({weather:'Weather', news:'World Briefing', sports:'Game Day', signal:'Signal Intelligence', celestial:'Celestial Observatory', market:'Markets', tech:'Tech'})[key] || key;
  }

  function canonicalRealmStatus(value){
    const text = String(value || '').trim().toUpperCase().replace(/\s+/g, '_');
    const aliases = {
      BRIDGE_UNAVAILABLE:'OFFLINE',
      SOURCE_REQUIRED:'UNAVAILABLE',
      RETRYING:'OFFLINE',
      ERROR:'OFFLINE',
      UNKNOWN:'UNAVAILABLE'
    };
    const status = aliases[text] || text;
    return ['LIVE','PARTIAL','STALE','OFFLINE','UNAVAILABLE','ENTERTAINMENT','DEMO'].includes(status) ? status : 'UNAVAILABLE';
  }

  function sourceFreshnessLabel(data={}){
    if(data.state==='DEMO') return 'Fixed illustrative sample';
    const seconds = safeNum(data.freshness ?? data.cache_age_seconds);
    if(seconds !== null) return seconds < 60 ? `${Math.round(seconds)}s source age` : `${Math.round(seconds / 60)}m source age`;
    return formatWeatherFreshness(data.last_updated || data.updated || data.timestamp) || 'Source timestamp unavailable';
  }

  function sourceContractState(data={}, fallbackProvider='RUCA local bridge'){
    const status = canonicalRealmStatus(data.status || data.state || data.source_status);
    return {
      state:status,
      status,
      provider:data.provider || data.source || fallbackProvider,
      freshness:sourceFreshnessLabel(data),
      confidence:data.confidence || ({LIVE:'HIGH',PARTIAL:'LIMITED',STALE:'STALE',OFFLINE:'NONE',UNAVAILABLE:'NONE',ENTERTAINMENT:'UNVERIFIED'})[status],
      lastUpdated:data.last_updated || data.updated || data.timestamp || null,
      fallbackState:data.fallback_state || (status === 'STALE' ? 'LAST_GOOD_CACHE' : 'NONE')
    };
  }

  function beginLaneRequest(key){
    state.laneRequestId += 1;
    return {id: state.laneRequestId, lane: key};
  }

  function isCurrentLaneRequest(token){
    return !!token && token.id === state.laneRequestId && token.lane === state.lastLane;
  }

  function shouldRenderLane(lane, token){
    if((document.body.dataset.world || 'home') !== 'live') return false;
    if(state.lastLane !== lane) return false;
    if(token && !isCurrentLaneRequest(token)) return false;
    return true;
  }

  function cachedLaneData(lane){
    return lane === 'market' ? state.markets : state[lane];
  }

  function sourceStateForLane(lane, data){
    if(lane === 'weather') return weatherSourceState(data, state.weatherPlace || DEFAULT_WEATHER);
    const contract = sourceContractState(data || {});
    const status = contract.state;
    const provider = contract.provider;
    const freshness = contract.freshness;
    if(lane === 'market'){
      const count = filterLaneItems('market', data?.items || data?.symbols || []).length;
      return {...contract, subtitle:`${count} verified market signals // real quotes only`, provider, freshness};
    }
    if(lane === 'news' || lane === 'tech'){
      const count = filterLaneItems(lane, data?.items || []).length;
      const identity = lane === 'news' ? 'editorial wire' : 'technology signal wire';
      return {...contract, subtitle:`${count} verified stories // ${identity}`, provider, freshness};
    }
    if(lane === 'sports'){
      const count = [...(data?.gamesToday || []), ...(data?.nextGames || [])].length;
      return {...contract, subtitle:`${count} verified events // ${state.sportsLeague} observation`, provider, freshness};
    }
    if(lane === 'signal'){
      const marketCount = filterLaneItems('market', data?.markets?.items || data?.markets?.symbols || []).length;
      const techCount = filterLaneItems('tech', data?.tech?.items || []).length;
      const worldCount = filterLaneItems('news', data?.world?.items || []).length;
      const correlationCount = Array.isArray(data?.correlations) ? data.correlations.length : 0;
      return {...contract, subtitle:`${marketCount} market // ${techCount} technology // ${worldCount} world // ${correlationCount} correlations`, provider, freshness};
    }
    if(lane === 'celestial'){
      return {...contract, subtitle:'Scientific solar and lunar observation // entertainment isolated', provider, freshness};
    }
    return {...contract, subtitle:'Verified source state', provider, freshness};
  }

  function laneItemAllowed(lane, item){
    if(!item || typeof item !== 'object') return true;
    const explicitLane = String(item.lane || item.category || '').trim().toLowerCase();
    if(explicitLane){
      let canonical = sourceIdFromLane(explicitLane);
      if(/market|stock|finance|quote/.test(explicitLane)) canonical = 'markets';
      if(/tech|technology|hardware|software|ai/.test(explicitLane)) canonical = 'tech';
      if(/sport|score|nba|nfl|mlb|nhl/.test(explicitLane)) canonical = 'sports';
      if(/news|headline/.test(explicitLane)) canonical = 'news';
      if(/weather|forecast/.test(explicitLane)) canonical = 'weather';
      if(['weather','markets','news','sports','tech'].includes(canonical) && canonical !== sourceIdFromLane(lane)) return false;
    }
    const hay = `${item.provider || ''} ${item.source || ''} ${item.title || ''} ${item.summary || ''} ${item.url || ''}`.toLowerCase();
    if(lane === 'tech' && /(espn|scoreboard|alpha vantage|global_quote|yahoo finance|nba|nfl|mlb|nhl)/.test(hay) && !/(technology|tech|hacker|software|hardware|ai|bbc)/.test(hay)) return false;
    if(lane === 'sports' && /(alpha vantage|global_quote|yahoo finance|nasdaq|nyse|stock|quote|market)/.test(hay)) return false;
    if(lane === 'market' && /(espn|scoreboard|bbc technology|bbc news|hacker news)/.test(hay)) return false;
    if(lane === 'news' && /(espn scoreboard|alpha vantage|global_quote|yahoo finance)/.test(hay)) return false;
    return true;
  }

  function filterLaneItems(lane, items){
    return (Array.isArray(items) ? items : []).filter(item=>laneItemAllowed(lane, item));
  }

  function syncLaneSourceState(lane, value){
    const sourceState = cleanText(value || 'NOT QUERIED', 32).toUpperCase();
    const button = qs(`#page-live .lane-btn[data-lane="${lane}"]`);
    if(!button) return;
    button.dataset.sourceState = sourceState;
    button.setAttribute('aria-label', `${laneName(lane)} // ${sourceState}`);
  }

  function mountLiveWorldRoot(key){
    const stage = qs('#laneStage');
    if(!stage) return null;
    stage.dataset.lane = key;
    stage.innerHTML = `
      <section class="live-world-render-root" data-world="${escapeHtml(key)}" data-phase="loading" data-condition="neutral">
        <div class="world-backdrop" aria-hidden="true"><span class="world-atmosphere-layer"></span><span class="world-particle-field"></span></div>
        <header class="ruca-live-header ruca-observation-header">
          <div><span class="tiny-label">CONCIERGE // ${key.toUpperCase()}</span><h3>${laneTitle(key)}</h3><small id="rucaLiveSubtitle">Verifying source state</small></div>
        </header>
        <main class="world-stage-content"><div class="ruca-live-grid" id="rucaLiveGrid"></div></main>
        <div class="world-source-status" role="status">
          <span id="rucaLiveSourceLabel">RUCA LOCAL BRIDGE</span>
          <b id="rucaLiveStatus">UNAVAILABLE</b>
          <small id="rucaLiveFreshness">Checking now</small>
          <div class="world-source-contract" aria-label="Source contract">
            <span>CONFIDENCE <b id="rucaLiveConfidence">NONE</b></span>
            <span>LAST UPDATED <b id="rucaLiveUpdated">PENDING</b></span>
            <span>FALLBACK <b id="rucaLiveFallback">NONE</b></span>
          </div>
        </div>
      </section>`;
    return stage.firstElementChild;
  }

  function renderLiveWorld(lane, normalizedData, sourceState={}, token){
    if(!shouldRenderLane(lane, token)) return;
    const renderStarted = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const stage = qs('#laneStage');
    if(!stage) return;
    let world = stage.firstElementChild;
    if(!world || !world.classList.contains('live-world-render-root') || world.dataset.world !== lane){
      world = mountLiveWorldRoot(lane);
    }
    if(!world) return;
    const phase = sourceState.phase || 'ready';
    const statusText = canonicalRealmStatus(sourceState.state || sourceState.status);
    world.dataset.phase = phase;
    world.dataset.condition = sourceState.condition || 'neutral';
    world.dataset.sourceStatus = statusText;
    const subtitle = qs('#rucaLiveSubtitle', world);
    const status = qs('#rucaLiveStatus', world);
    const provider = qs('#rucaLiveSourceLabel', world);
    const freshness = qs('#rucaLiveFreshness', world);
    const confidence = qs('#rucaLiveConfidence', world);
    const updated = qs('#rucaLiveUpdated', world);
    const fallback = qs('#rucaLiveFallback', world);
    if(subtitle) subtitle.textContent = sourceState.subtitle || 'Verified source state';
    if(status) status.textContent = statusText;
    if(provider) provider.textContent = cleanText(sourceState.provider || 'RUCA local bridge', 58).toUpperCase();
    if(freshness) freshness.textContent = sourceState.freshness || (phase === 'loading' ? 'Checking now' : 'Source state verified');
    if(confidence) confidence.textContent = cleanText(sourceState.confidence || 'NONE', 24).toUpperCase();
    if(updated) updated.textContent = sourceState.lastUpdated ? formatTime(sourceState.lastUpdated) : (phase === 'loading' ? 'PENDING' : 'UNAVAILABLE');
    if(fallback) fallback.textContent = cleanText(sourceState.fallbackState || 'NONE', 32).toUpperCase();
    syncLaneSourceState(lane, phase === 'loading' ? 'CHECKING' : statusText);

    if(lane === 'weather'){
      if(phase === 'loading') renderWeatherPending(world);
      else if(Array.isArray(normalizedData)) renderWeatherActionState(world, normalizedData, sourceState);
      else renderWeatherWorld(normalizedData || {}, sourceState, token, world);
    }else if(phase === 'loading'){
      renderRealmPending(world, lane);
    }else if(Array.isArray(normalizedData)){
      renderRealmActionState(world, lane, normalizedData, sourceState);
    }else if(lane === 'market'){
      renderMarketWorld(normalizedData || {}, sourceState, token, world);
    }else if(lane === 'news' || lane === 'tech'){
      renderEditorialWorld(lane, normalizedData || {}, sourceState, token, world);
    }else if(lane === 'sports'){
      renderSportsWorld(normalizedData || {}, sourceState, token, world);
    }else if(lane === 'signal'){
      renderSignalWorld(normalizedData || {}, sourceState, token, world);
    }else if(lane === 'celestial'){
      renderCelestialWorld(normalizedData || {}, sourceState, token, world);
    }
    const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - renderStarted;
    const prior = window.RUCA_PASS17E_METRICS || window.RUCA_PASS17D_METRICS || {};
    const metrics = {
      renderCount:(prior.renderCount || 0) + 1,
      renderTotalMs:(prior.renderTotalMs || 0) + elapsed,
      maxRenderMs:Math.max(prior.maxRenderMs || 0, elapsed),
      lastRenderMs:elapsed,
      lastLane:lane,
      rootCount:qsa('#laneStage > .live-world-render-root').length
    };
    window.RUCA_PASS17E_METRICS = metrics;
    window.RUCA_PASS17D_METRICS = metrics;
    world.dataset.renderMs = elapsed.toFixed(3);
    world.dataset.renderCount = String(metrics.renderCount);
  }

  function renderWeatherPending(world){
    const grid = qs('#rucaLiveGrid', world);
    if(!grid) return;
    grid.innerHTML = `
      <section class="weather-state-panel" data-state="UNAVAILABLE">
        <span>LOCAL CONDITIONS</span>
        <h4>Connecting to the weather source</h4>
        <p>RUCA is waiting for the bridge to report a real condition. No temperature or forecast is shown until the source answers.</p>
      </section>`;
  }

  function renderWeatherActionState(world, cards, sourceState={}){
    const grid = qs('#rucaLiveGrid', world);
    if(!grid) return;
    const primary = normalizeCard('weather', (cards || [])[0] || {}, {status:sourceState.state || 'OFFLINE'});
    const actions = Array.isArray(primary.actions) ? primary.actions : [];
    grid.innerHTML = `
      <section class="weather-state-panel" data-state="${escapeAttr(primary.status)}">
        <span>WEATHER SOURCE</span>
        <h4>${escapeHtml(primary.title || 'Weather source unavailable')}</h4>
        <p>${escapeHtml(primary.summary || 'The weather source did not return data.')}</p>
        ${actions.length ? `<div class="ruca-card-actions">${actions.map(action=>`<button type="button" data-source-${escapeAttr(action.type || 'retry')}="${escapeAttr(sourceIdFromLane(action.source || 'weather'))}">${escapeHtml(action.label || 'Action')}</button>`).join('')}</div>` : ''}
      </section>`;
  }

  function loadingLaneCards(key, sourceId=sourceIdFromLane(key)){
    const lane = laneName(key);
    const actions = [
      {label:'Retry', type:'retry', source:sourceId},
      {label:'Configure Source', type:'configure', source:sourceId},
      {label:'View Last Good Cache', type:'cache', source:sourceId}
    ];
    return [
      normalizeCard(key, {
        title: `${lane} source check`,
        source: 'RUCA local bridge',
        time: 'Now',
        summary: 'Checking the source bus. The lane stays compact while the bridge reports live, stale, or unavailable state.',
        status: 'UNAVAILABLE',
        actions
      }),
      normalizeCard(key, {
        title: 'Source contract',
        source: 'Truth state',
        time: 'Waiting',
        summary: 'Unavailable data will stay marked as unavailable. RUCA will not fill the lane with invented values.',
        status: 'LOCKED'
      }),
      normalizeCard(key, {
        title: 'Action path',
        source: 'Control',
        time: 'Ready',
        summary: 'Retry, configure source, or inspect last-good cache without leaving the Live World lane.',
        status: 'READY',
        actions
      })
    ];
  }

  async function refreshLaneData(key, quiet, token=beginLaneRequest(key)){
    try{
      if(key === 'weather') return await loadWeatherLane(quiet, token);
      if(key === 'market') return await loadMarketLane(token);
      if(key === 'news') return await loadNewsLane(token);
      if(key === 'sports') return await loadSportsLane(token);
      if(key === 'signal') return await loadSignalLane(token);
      if(key === 'celestial') return await loadCelestialLane(token);
    }catch(err){
      if(!shouldRenderLane(key, token)) return;
      const status = qs('#rucaLiveStatus');
      if(status) status.textContent = 'OFFLINE';
      renderLaneError(key, err, token);
    }
  }

  function getPosition(){ return Promise.resolve(DEFAULT_WEATHER); }

  async function loadWeatherLane(quiet, token){
    const place = await getPosition();
    const data = await fetchJson(`/live/weather?lat=${encodeURIComponent(place.lat)}&lon=${encodeURIComponent(place.lon)}`, 8000);
    state.weather = data;
    state.weatherPlace = place;
    if(!shouldRenderLane('weather', token)) return;
    renderLiveWorld('weather', data, weatherSourceState(data, place), token);
    refreshRightRail();
  }

  function weatherSourceState(data, place){
    const current = data?.current || {};
    const contract = sourceContractState(data || {}, 'SAMPLE WEATHER');
    return {
      ...contract,
      subtitle:`${place.name} // illustrative weather conditions`,
      condition:weatherKind(current.weather_code, current.is_day),
      place
    };
  }

  function renderWeatherWorld(data, sourceState, token, world){
    if(!shouldRenderLane('weather', token)) return;
    const grid = qs('#rucaLiveGrid', world); if(!grid) return;
    const c = data.current || {};
    const daily = data.daily || {};
    const laneState = data.state || data.source_status || 'LIVE';
    const tempNow = safeNum(c.temperature_2m);
    const feels = safeNum(c.apparent_temperature);
    const wind = safeNum(c.wind_speed_10m);
    const windDirection = windCompass(c.wind_direction_10m);
    const windGust = safeNum(c.wind_gusts_10m);
    const humidity = safeNum(c.relative_humidity_2m);
    const precip = safeNum(c.precipitation);
    const precipProbability = weatherHourlyValue(data, 'precipitation_probability', c.time);
    const cloudCover = safeNum(c.cloud_cover);
    const condition = codeMap[c.weather_code] || 'Current condition';
    const conditionKind = weatherKind(c.weather_code, c.is_day);
    world.dataset.condition = conditionKind;

    const forecastData = Array.isArray(data.forecast5) && data.forecast5.length
      ? data.forecast5.slice(0,5)
      : (daily.time || []).slice(0,5).map((date,index)=>({
          date,
          high:daily.temperature_2m_max?.[index],
          low:daily.temperature_2m_min?.[index],
          precipitationProbability:daily.precipitation_probability_max?.[index],
          weatherCode:daily.weather_code?.[index],
          sunrise:daily.sunrise?.[index],
          sunset:daily.sunset?.[index]
        }));
    if(tempNow === null && !forecastData.length){
      renderWeatherActionState(world, sourceActionCards('weather', data, 'Open-Meteo did not return current conditions or forecast data.'), sourceState);
      return;
    }

    const today = forecastData[0] || {};
    const high = safeNum(today.high);
    const low = safeNum(today.low);
    const place = sourceState.place?.name || data.location?.name || 'Saved location';
    const localTime = formatWeatherClock(c.time);
    const timeZone = cleanText(data.timezone_abbreviation || '', 12);
    const heroSummary = [];
    if(feels !== null) heroSummary.push(`Feels like ${Math.round(feels)}°`);
    if(precipProbability !== null) heroSummary.push(`${Math.round(precipProbability)}% precipitation chance`);
    if(wind !== null) heroSummary.push(`${Math.round(wind)} MPH${windDirection ? ' ' + windDirection : ''} wind`);

    const metrics = [];
    if(humidity !== null) metrics.push(['Humidity', `${Math.round(humidity)}%`, 'Relative humidity']);
    if(wind !== null) metrics.push(['Wind', `${Math.round(wind)} MPH${windDirection ? ' ' + windDirection : ''}`, 'Current 10m wind']);
    if(precipProbability !== null) metrics.push(['Precipitation', `${Math.round(precipProbability)}%`, 'Current hourly probability']);
    if(precip !== null) metrics.push(['Current precip', `${precip.toFixed(2)} IN`, 'Reported now']);
    if(cloudCover !== null) metrics.push(['Cloud cover', `${Math.round(cloudCover)}%`, 'Current sky coverage']);

    const secondary = [];
    const sunrise = formatWeatherClock(today.sunrise || daily.sunrise?.[0]);
    const sunset = formatWeatherClock(today.sunset || daily.sunset?.[0]);
    if(sunrise) secondary.push(['Sunrise', sunrise]);
    if(sunset) secondary.push(['Sunset', sunset]);
    if(windGust !== null) secondary.push(['Wind gust', `${Math.round(windGust)} MPH`]);
    const freshness = formatWeatherFreshness(data.updated || data.timestamp);
    if(freshness) secondary.push(['Source freshness', freshness.replace(/^Updated\s*/i, '')]);

    const forecast = forecastData.map((item,index)=>{
      const date = item.date || daily.time?.[index] || '';
      const itemHigh = safeNum(item.high);
      const itemLow = safeNum(item.low);
      const itemPop = safeNum(item.precipitationProbability);
      const itemCode = item.weatherCode;
      const itemCondition = codeMap[itemCode] || 'Forecast';
      const day = date ? new Date(`${date}T12:00:00`).toLocaleDateString([], {weekday:'short'}) : `Day ${index + 1}`;
      const range = [itemHigh === null ? '' : `${Math.round(itemHigh)}°`, itemLow === null ? '' : `${Math.round(itemLow)}°`].filter(Boolean).join(' / ');
      return `<article class="weather-forecast-item">
        <span class="weather-forecast-day">${escapeHtml(day)}</span>
        ${weatherMark(itemCode, itemCondition, 1)}
        ${range ? `<strong>${escapeHtml(range)}</strong>` : ''}
        <small>${itemPop === null ? escapeHtml(itemCondition) : `${Math.round(itemPop)}% precipitation`}</small>
      </article>`;
    }).join('');

    grid.innerHTML = `
      <section class="weather-world" data-lane="weather" data-source-state="${escapeAttr(laneState)}">
        <section class="world-hero weather-world-hero">
          <div class="weather-location-line">
            <span>LOCAL CONDITIONS</span>
            <strong>${escapeHtml(place)}</strong>
            ${localTime ? `<time>${escapeHtml(localTime)}${timeZone ? ` ${escapeHtml(timeZone)}` : ''}</time>` : ''}
          </div>
          <div class="weather-hero-reading">
            <div class="weather-temperature">${tempNow === null ? '' : `<strong>${Math.round(tempNow)}</strong><span>°F</span>`}</div>
            ${weatherMark(c.weather_code, condition, c.is_day)}
          </div>
          <p>${escapeHtml(heroSummary.join(' // ') || condition)}</p>
          ${(high !== null || low !== null) ? `<div class="weather-high-low">${high === null ? '' : `<span>HIGH <b>${Math.round(high)}°</b></span>`}${low === null ? '' : `<span>LOW <b>${Math.round(low)}°</b></span>`}</div>` : ''}
        </section>

        <section class="world-intelligence" aria-label="Weather intelligence">
          ${metrics.length ? `<div class="world-primary">${metrics.map(metric=>`<article class="weather-readout"><span>${escapeHtml(metric[0])}</span><strong>${escapeHtml(metric[1])}</strong><small>${escapeHtml(metric[2])}</small></article>`).join('')}</div>` : ''}
          ${secondary.length ? `<div class="world-secondary">${secondary.map(metric=>`<div class="weather-secondary-row"><span>${escapeHtml(metric[0])}</span><b>${escapeHtml(metric[1])}</b></div>`).join('')}</div>` : ''}
        </section>

        ${forecast ? `<section class="world-ribbon weather-forecast-ribbon"><header><span>FORECAST</span><small>Sample // five-day outlook</small></header><div class="weather-forecast-track">${forecast}</div></section>` : ''}
      </section>`;
  }

  async function loadMarketLane(token){
    const data = await fetchJson('/live/markets', 8000);
    state.markets = data;
    if(!shouldRenderLane('market', token)) return;
    renderLiveWorld('market', data, sourceStateForLane('market', data), token);
    refreshRightRail();
  }

  async function loadNewsLane(token){
    const data = await fetchJson('/live/news', 9000);
    state.news = data;
    if(!shouldRenderLane('news', token)) return;
    renderFeed('news', 'NEWS SIGNAL', data.items || [], data.provider || data.source || 'RSS bridge', data, token);
    refreshRightRail();
  }
  async function loadTechLane(token){
    const data = await fetchJson('/live/tech', 9000);
    state.tech = data;
    if(!shouldRenderLane('tech', token)) return;
    renderFeed('tech', 'TECH RADAR', data.items || [], data.provider || data.source || 'HN bridge', data, token);
    refreshRightRail();
  }

  function aggregateRealmStatus(...values){
    const statuses = values.map(canonicalRealmStatus);
    if(statuses.length && statuses.every(status=>status === 'LIVE')) return 'LIVE';
    if(statuses.some(status=>status === 'LIVE' || status === 'PARTIAL')) return 'PARTIAL';
    if(statuses.some(status=>status === 'STALE')) return 'STALE';
    if(statuses.some(status=>status === 'OFFLINE')) return 'OFFLINE';
    return 'UNAVAILABLE';
  }

  function latestSourceTimestamp(...values){
    const candidates = values
      .map(value=>value?.last_updated || value?.updated || value?.timestamp)
      .filter(Boolean)
      .map(value=>({value, time:new Date(value).getTime()}))
      .filter(item=>Number.isFinite(item.time))
      .sort((a,b)=>b.time-a.time);
    return candidates[0]?.value || null;
  }

  function combineSignalData(markets={}, tech={}, world={}){
    const marketContract = sourceContractState(markets, 'Markets source');
    const techContract = sourceContractState(tech, 'Technology source');
    const worldContract = sourceContractState(world, 'World source');
    const fusion = window.RUCASignalIntelligence?.fuseSignalData({markets, technology:tech, world}) || {channels:{}, correlations:[], evidence_labels:['POSSIBLE DRIVER','RELATED SIGNAL','CORRELATION OBSERVED','CAUSE NOT VERIFIED'], cause_verified:false};
    const status = aggregateRealmStatus(marketContract.state, techContract.state, worldContract.state);
    const lastUpdated = latestSourceTimestamp(markets, tech, world);
    const freshnessValues = [markets.freshness, markets.cache_age_seconds, tech.freshness, tech.cache_age_seconds, world.freshness, world.cache_age_seconds]
      .map(value=>safeNum(value))
      .filter(value=>value !== null);
    return {
      schema_version:'RUCA_PASS26C_SIGNAL_INTELLIGENCE_V1',
      status,
      state:status,
      source_status:status,
      source:`${marketContract.provider} // ${techContract.provider} // ${worldContract.provider}`,
      provider:`${marketContract.provider} // ${techContract.provider} // ${worldContract.provider}`,
      freshness:freshnessValues.length ? Math.max(...freshnessValues) : null,
      confidence:status === 'LIVE' ? 'HIGH' : status === 'PARTIAL' ? 'LIMITED' : status === 'STALE' ? 'STALE' : 'NONE',
      last_updated:lastUpdated,
      updated:lastUpdated,
      fallback_state:[marketContract.fallbackState, techContract.fallbackState, worldContract.fallbackState].includes('LAST_GOOD_CACHE') ? 'LAST_GOOD_CACHE' : 'NONE',
      markets,
      tech,
      world,
      channels:fusion.channels,
      correlations:fusion.correlations,
      evidence_labels:fusion.evidence_labels,
      cause_verified:false
    };
  }

  async function loadSignalLane(token){
    const [marketResult, techResult, worldResult] = await Promise.allSettled([
      fetchJson('/live/markets', 9000),
      fetchJson('/live/tech', 9000),
      fetchJson('/live/news', 9000)
    ]);
    const markets = marketResult.status === 'fulfilled' ? marketResult.value : {
      status:'OFFLINE', state:'OFFLINE', provider:'Markets source', source:'Markets source',
      last_error:marketResult.reason?.message || 'Markets source unavailable', items:[], symbols:[], fallback_state:'NONE'
    };
    const tech = techResult.status === 'fulfilled' ? techResult.value : {
      status:'OFFLINE', state:'OFFLINE', provider:'Technology source', source:'Technology source',
      last_error:techResult.reason?.message || 'Technology source unavailable', items:[], fallback_state:'NONE'
    };
    const world = worldResult.status === 'fulfilled' ? worldResult.value : {
      status:'OFFLINE', state:'OFFLINE', provider:'World source', source:'World source',
      last_error:worldResult.reason?.message || 'World source unavailable', items:[], fallback_state:'NONE'
    };
    state.markets = markets;
    state.tech = tech;
    state.news = world;
    state.signal = combineSignalData(markets, tech, world);
    if(!shouldRenderLane('signal', token)) return;
    renderLiveWorld('signal', state.signal, sourceStateForLane('signal', state.signal), token);
    refreshRightRail();
  }

  async function loadCelestialLane(token){
    const place = await getPosition();
    const data = await fetchJson(`/live/celestial?lat=${encodeURIComponent(place.lat)}&lon=${encodeURIComponent(place.lon)}`, 8000);
    data.location = {...(data.location || {}), name:place.name};
    state.celestial = data;
    if(!shouldRenderLane('celestial', token)) return;
    renderLiveWorld('celestial', data, sourceStateForLane('celestial', data), token);
  }
  function renderFeed(lane, subtitleText, items, source, data={}, token){
    if(!shouldRenderLane(lane, token)) return;
    const laneItems = filterLaneItems(lane, items);
    const contract = sourceContractState(data, source);
    const laneState = canonicalRealmStatus(data.status || data.state || data.source_status || (items.length ? 'LIVE' : 'OFFLINE'));
    const normalized = {...data, source, provider:source, state:laneState, items:laneItems.slice(0,8)};
    if(!laneItems.length){
      renderLiveWorld(lane, sourceActionCards(lane, normalized, items.length ? 'Wrong-lane feed residue was rejected.' : 'No feed items returned by the bridge.'), {
        ...contract,
        state:laneState,
        subtitle:`${subtitleText} // ${source}`,
        provider:source,
        freshness:formatWeatherFreshness(data.updated || data.timestamp) || 'Source state verified'
      }, token);
      return;
    }
    renderLiveWorld(lane, normalized, {
      ...contract,
      state:laneState,
      subtitle:`${subtitleText} // ${source}`,
      provider:source,
      freshness:formatWeatherFreshness(data.updated || data.timestamp) || 'Source state verified'
    }, token);
  }

  async function loadSportsLane(token){
    const data = await fetchJson('/live/sports', 9000);
    state.sports = data;
    if(!shouldRenderLane('sports', token)) return;
    renderSportsLane(data, token);
    refreshRightRail();
  }

  function renderSportsLane(data={}, token){
    if(!shouldRenderLane('sports', token)) return;
    const games = [...(data.gamesToday || []), ...(data.nextGames || [])];
    if(!games.length){
      renderLiveWorld('sports', sourceActionCards('sports', data, 'Sports source unreachable. Retry source, change provider, or keep team atmosphere only.'), sourceStateForLane('sports', data), token);
      return;
    }
    renderLiveWorld('sports', data, sourceStateForLane('sports', data), token);
  }

  function renderLaneError(lane, err, token){
    if(!shouldRenderLane(lane, token)) return;
    const message = err?.message || String(err || 'Source unavailable');
    renderLiveWorld(lane, sourceActionCards(lane, {source:'RUCA local bridge', source_status:'OFFLINE', error:message}, `Live lane could not update: ${message}. Source is offline or unavailable.`), {
      phase:'error',
      state:'OFFLINE',
      subtitle:`${laneName(lane)} source could not update`,
      provider:'RUCA local bridge',
      freshness:'No successful response in this request',
      confidence:'NONE',
      lastUpdated:null,
      fallbackState:'NONE'
    }, token);
  }

  function sourceActionCards(lane, data={}, fallback='Source did not return data.'){
    const source = data.provider || data.source || `${laneName(lane)} source`;
    const status = canonicalRealmStatus(data.status || data.state || data.source_status);
    const last = data.last_success || data.updated || 'No successful fetch recorded';
    const why = data.last_error || data.error || fallback;
    const sourceId = sourceIdFromLane(lane);
    const actions = [
      {label:'Retry', type:'retry', source:sourceId},
      {label:'Configure Source', type:'configure', source:sourceId},
      {label:'View Last Good Cache', type:'cache', source:sourceId}
    ];
    if(sourceId === 'weather') actions.push({label:'Set Location', type:'location', source:sourceId});
    if(sourceId === 'markets' || sourceId === 'sports') actions.push({label:'Set API Key', type:'key', source:sourceId});
    return [
      normalizeCard(lane, {title:`${laneName(lane)} source unavailable`, source, time:'Now', summary:`${why} Last success: ${last}.`, status, actions}),
      normalizeCard(lane, {title:'Ace action path', source:'Source management', time:'Control', summary:'Retry now, configure provider/API/location, or inspect last-good cache age. Nothing is guessed.', status:'ACTION REQUIRED', actions}),
      normalizeCard(lane, {title:'Truth rule', source:'RUCA source contract', time:'Always', summary:'RUCA will show stale cached data only when it is marked STALE. It will not invent scores, prices, weather, injuries, odds, or standings.', status:'LOCKED'})
    ];
  }

  function normalizeCard(lane, item={}, defaults={}){
    const url = normalizeUrl(item.url || item.link || item.href || (isUrl(item.source) ? item.source : ''));
    const source = cleanText(item.source && !isUrl(item.source) ? item.source : defaults.source || item.by || hostFromUrl(url) || laneName(lane), 70);
    const summary = cleanText(item.summary || item.description || item.snippet || item.subtext || defaults.summary || item.name || item.by || 'No summary provided by source.', 220);
    return {
      lane,
      title: cleanText(item.title || item.symbol || defaults.title || laneName(lane), 96),
      source,
      time: formatTime(item.time || item.published || item.pubDate || item.timestamp || defaults.time || ''),
      summary,
      image: normalizeUrl(item.image || item.image_url || item.thumbnail || defaults.image || ''),
      url,
      status: cleanText(item.status || defaults.status || 'LIVE', 36),
      actions: Array.isArray(item.actions) ? item.actions : (Array.isArray(defaults.actions) ? defaults.actions : [])
    };
  }

  function renderRealmPending(world, lane){
    const grid = qs('#rucaLiveGrid', world);
    if(!grid) return;
    grid.innerHTML = `
      <section class="realm-state-panel" data-state="UNAVAILABLE" data-lane="${escapeAttr(lane)}">
        <span>${escapeHtml(laneName(lane).toUpperCase())} OBSERVATION WINDOW</span>
        <h4>Connecting to the verified source</h4>
        <p>RUCA is waiting for the bridge to return real ${escapeHtml(laneName(lane).toLowerCase())} intelligence. Nothing is rendered from placeholder data.</p>
      </section>`;
  }

  function renderRealmActionState(world, lane, cards, sourceState={}){
    const grid = qs('#rucaLiveGrid', world);
    if(!grid) return;
    const card = normalizeCard(lane, (cards || [])[0] || {}, {status:sourceState.state || 'OFFLINE'});
    const actions = Array.isArray(card.actions) ? card.actions : [];
    grid.innerHTML = `
      <section class="realm-state-panel" data-state="${escapeAttr(card.status)}" data-lane="${escapeAttr(lane)}">
        <span>${escapeHtml(laneName(lane).toUpperCase())} SOURCE</span>
        <h4>${escapeHtml(card.title || `${laneName(lane)} source unavailable`)}</h4>
        <p>${escapeHtml(card.summary || 'The source did not return verified data.')}</p>
        ${actions.length ? `<div class="ruca-card-actions">${actions.map(action=>`<button type="button" data-source-${escapeAttr(action.type || 'retry')}="${escapeAttr(sourceIdFromLane(action.source || lane))}">${escapeHtml(action.label || 'Action')}</button>`).join('')}</div>` : ''}
      </section>`;
  }

  function formatMarketPrice(value){
    const number = safeNum(value);
    if(number === null) return 'NOT SUPPLIED';
    return number.toLocaleString([], {minimumFractionDigits:2, maximumFractionDigits:2});
  }

  function marketChange(item){
    return safeNum(item?.changePercent ?? item?.change_percent);
  }

  function marketChangeLabel(item){
    const change = marketChange(item);
    return change === null ? 'CHANGE NOT SUPPLIED' : `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  }

  function marketDirection(item){
    const change = marketChange(item);
    return change === null ? 'flat' : change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  }

  function marketQuoteLink(item, className, label){
    const href = normalizeUrl(item?.url);
    const tag = href ? 'a' : 'article';
    const attrs = href ? ` href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"` : '';
    const symbol = String(item?.symbol || '').toUpperCase();
    const macroLabels = {TLT:'BONDS // TLT',UUP:'DOLLAR // UUP',GLD:'GOLD // GLD',USO:'OIL // USO','BTC-USD':'BTC','ETH-USD':'ETH'};
    const displayLabel = label || macroLabels[symbol] || symbol || 'MARKET';
    return `<${tag}${attrs} class="${className}" data-direction="${marketDirection(item)}">
      <span>${escapeHtml(displayLabel)}</span>
      <strong>${escapeHtml(formatMarketPrice(item?.price ?? item?.close))}</strong>
      <b>${escapeHtml(marketChangeLabel(item))}</b>
    </${tag}>`;
  }

  function renderMarketWorld(data={}, sourceState={}, token, world){
    if(!shouldRenderLane('market', token)) return;
    const grid = qs('#rucaLiveGrid', world || document);
    if(!grid) return;
    const items = filterLaneItems('market', data.items || data.symbols || []);
    if(!items.length){
      renderRealmActionState(world, 'market', sourceActionCards('market', data, 'Market source did not return quote rows. Prices are not being guessed.'), sourceState);
      return;
    }

    const bySymbol = new Map(items.map(item=>[String(item.symbol || '').toUpperCase(), item]));
    const broad = ['DIA','QQQ','SPY'].map(symbol=>bySymbol.get(symbol)).filter(Boolean);
    const broadChanges = broad.map(marketChange).filter(value=>value !== null);
    const advancing = broadChanges.filter(value=>value > 0).length;
    const declining = broadChanges.filter(value=>value < 0).length;
    const tone = !broadChanges.length ? 'SOURCE PARTIAL' : advancing >= 2 ? 'RISK APPETITE FIRM' : declining >= 2 ? 'DEFENSIVE PRESSURE' : 'MIXED SESSION';
    const toneDetail = broadChanges.length
      ? `${advancing} of ${broadChanges.length} broad-market proxies advancing. Derived from DIA, QQQ, and SPY only.`
      : 'Broad-market movement was not supplied by the current response.';
    const vix = bySymbol.get('VIX');
    const updated = formatTime(data.updated || data.timestamp);
    const benchmarks = [
      ['DIA','DOW','DIA proxy'],
      ['QQQ','NASDAQ','QQQ proxy'],
      ['SPY','S&P 500','SPY proxy'],
      ['IWM','RUSSELL 2000','Not supplied by source']
    ];
    const sorted = items.filter(item=>marketChange(item) !== null).sort((a,b)=>Math.abs(marketChange(b)) - Math.abs(marketChange(a)));
    const gainers = [...items].filter(item=>marketChange(item) > 0).sort((a,b)=>marketChange(b)-marketChange(a)).slice(0,2);
    const losers = [...items].filter(item=>marketChange(item) < 0).sort((a,b)=>marketChange(a)-marketChange(b)).slice(0,2);
    const watchlist = (data.watchlist?.length ? data.watchlist : items.filter(item=>!['DIA','QQQ','SPY','VIX','BTC-USD','ETH-USD'].includes(item.symbol))).slice(0,6);
    const headlines = Array.isArray(data.news) ? data.news.filter(Boolean).slice(0,2) : [];

    grid.innerHTML = `
      <section class="realm-world market-world" data-lane="market" data-source-state="${escapeAttr(sourceState.state || data.state || 'LIVE')}">
        <div class="realm-main market-main">
          <section class="world-hero realm-hero market-world-hero">
            <div class="realm-identity-line"><span>MARKET OBSERVATORY</span><time>${escapeHtml(updated)}</time></div>
            <div class="market-tone"><small>TRACKED MARKET CONDITION</small><h4>${escapeHtml(tone)}</h4></div>
            <p>${escapeHtml(toneDetail)}</p>
            <div class="market-hero-pulse">
              <div><span>CORE ADVANCING</span><strong>${advancing}/${broadChanges.length || 0}</strong></div>
              <div><span>VOLATILITY</span><strong>${vix ? formatMarketPrice(vix.price ?? vix.close) : 'NOT SUPPLIED'}</strong><b data-direction="${marketDirection(vix)}">${vix ? marketChangeLabel(vix) : ''}</b></div>
              <div><span>SOURCE MODE</span><strong>${escapeHtml(data.state || data.source_status || 'LIVE')}</strong></div>
            </div>
          </section>

          <section class="world-intelligence realm-intelligence market-intelligence" aria-label="Market intelligence">
            <header class="realm-section-heading"><span>PRIMARY INTELLIGENCE</span><small>Real movement // proxy labels explicit</small></header>
            <div class="market-index-grid">
              ${benchmarks.map(([symbol,label,note])=>{
                const item = bySymbol.get(symbol);
                if(!item) return `<article class="market-index-readout is-unavailable"><span>${escapeHtml(label)}</span><strong>NOT SUPPLIED</strong><small>${escapeHtml(note)}</small></article>`;
                const href = normalizeUrl(item.url);
                return `<${href ? 'a' : 'article'}${href ? ` href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"` : ''} class="market-index-readout" data-direction="${marketDirection(item)}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(formatMarketPrice(item.price ?? item.close))}</strong><b>${escapeHtml(marketChangeLabel(item))}</b><small>${escapeHtml(note)}</small></${href ? 'a' : 'article'}>`;
              }).join('')}
            </div>
            <div class="market-secondary-grid">
              <section class="market-signal-column"><header>TOP MOVERS</header>${sorted.slice(0,3).map(item=>marketQuoteLink(item,'market-signal-row')).join('')}</section>
              <section class="market-signal-column"><header>GAINERS / LOSERS</header>${[...gainers,...losers].map(item=>marketQuoteLink(item,'market-signal-row')).join('')}</section>
              <section class="market-signal-column"><header>WATCHLIST</header>${watchlist.slice(0,4).map(item=>marketQuoteLink(item,'market-signal-row')).join('')}</section>
              <section class="market-headline-column"><header>MARKET HEADLINES</header>${headlines.length ? headlines.map(item=>`<a href="${escapeHtml(normalizeUrl(item.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(cleanText(item.title,72))}</a>`).join('') : '<p>Headline wire is not supplied by the current market source.</p>'}</section>
            </div>
          </section>
        </div>
        <section class="world-ribbon realm-ticker-ribbon" aria-label="Market ticker">
          <header><span>MARKET TICKER</span><small>${escapeHtml(data.state === 'STALE' ? 'Last-good cache // STALE' : 'Verified quote bus')}</small></header>
          <div class="realm-ribbon-track market-ticker-track">${items.map(item=>marketQuoteLink(item,'market-ticker-item')).join('')}</div>
        </section>
      </section>`;
  }

  function editorialStoryLink(card, className, includeSummary=true){
    const href = normalizeUrl(card.url);
    const tag = href ? 'a' : 'article';
    const attrs = href ? ` href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"` : '';
    const image = card.image ? ` style="--realm-hero-image:url('${escapeAttr(card.image)}')" data-has-image="true"` : ' data-has-image="false"';
    return `<${tag}${attrs} class="${className}"${image}>
      <div class="editorial-story-copy"><div class="editorial-meta"><span>${escapeHtml(card.source)}</span><time>${escapeHtml(card.time)}</time></div><h4>${escapeHtml(card.title)}</h4>${includeSummary ? `<p>${escapeHtml(cleanText(card.summary,180))}</p>` : ''}</div>
    </${tag}>`;
  }

  function stopEditorialCarousel(){
    if(editorialCarouselTimer){
      window.clearInterval(editorialCarouselTimer);
      editorialCarouselTimer = 0;
    }
  }

  function showEditorialCarouselSlide(carousel, requestedIndex){
    if(!carousel) return;
    const slides = qsa('.editorial-carousel-slide', carousel);
    if(!slides.length) return;
    const index = ((Number(requestedIndex) % slides.length) + slides.length) % slides.length;
    carousel.dataset.index = String(index);
    slides.forEach((slide, slideIndex)=>{
      const active = slideIndex === index;
      slide.hidden = !active;
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    const counter = qs('[data-editorial-carousel-counter]', carousel);
    if(counter) counter.textContent = `${index + 1} / ${slides.length}`;
  }

  function startEditorialCarousel(carousel){
    stopEditorialCarousel();
    const slides = qsa('.editorial-carousel-slide', carousel);
    if(slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    editorialCarouselTimer = window.setInterval(()=>{
      if((document.body.dataset.world || 'home') !== 'live' || state.lastLane !== 'news' || !carousel.isConnected){
        stopEditorialCarousel();
        return;
      }
      showEditorialCarouselSlide(carousel, Number(carousel.dataset.index || 0) + 1);
    }, 9000);
  }

  function moveEditorialCarousel(control){
    const carousel = control?.closest?.('.editorial-carousel');
    if(!carousel) return;
    const direction = control.dataset.editorialCarousel === 'previous' ? -1 : 1;
    showEditorialCarouselSlide(carousel, Number(carousel.dataset.index || 0) + direction);
    startEditorialCarousel(carousel);
  }

  function techTopicFor(card, topic){
    const hay = `${card.title} ${card.summary}`.toLowerCase();
    const rules = {
      'AI':/\bai\b|artificial intelligence|openai|machine learning|model/,
      'HARDWARE':/hardware|chip|semiconductor|device|phone|computer|console|apple/,
      'SOFTWARE':/software|app|platform|facebook|instagram|game|operating system/,
      'CYBERSECURITY':/cyber|security|hack|scam|fraud|privacy|data breach/,
      'SPACE':/space|nasa|rocket|satellite|orbit|moon|mars/,
      'RESEARCH':/research|study|scientist|laboratory|university/,
      'DEVELOPER RELEASES':/developer|release|launch|update|version|code|github/,
      'COMPANY SIGNALS':/company|business|shares|stock|earnings|revenue|acquisition|microsoft|apple|google|meta|nvidia|amd|amazon/
    };
    return rules[topic]?.test(hay);
  }

  function renderEditorialWorld(lane, data={}, sourceState={}, token, world){
    if(!shouldRenderLane(lane, token)) return;
    const grid = qs('#rucaLiveGrid', world || document);
    if(!grid) return;
    const cards = filterLaneItems(lane, data.items || []).slice(0,8).map(item=>normalizeCard(lane, item, {source:data.provider || data.source, status:data.state || 'LIVE'}));
    if(!cards.length){
      renderRealmActionState(world, lane, sourceActionCards(lane, data, 'No verified stories were returned by the source.'), sourceState);
      return;
    }
    const hero = cards[0];
    const supporting = cards.slice(1,5);
    const updated = formatTime(data.updated || data.timestamp);
    const isTech = lane === 'tech';
    const topicNames = ['AI','HARDWARE','SOFTWARE','CYBERSECURITY','SPACE','RESEARCH','DEVELOPER RELEASES'];

    if(!isTech){
      grid.innerHTML = `
        <section class="realm-world editorial-world news-world" data-lane="${escapeAttr(lane)}" data-source-state="${escapeAttr(sourceState.state || data.state || 'LIVE')}">
          <section class="editorial-carousel" data-index="0" aria-label="World Briefing stories" aria-roledescription="carousel">
            <header class="editorial-carousel-header">
              <div><span>WORLD BRIEFING</span><small>${escapeHtml(data.provider || data.source || 'Verified source')}</small></div>
              <time>${escapeHtml(updated)}</time>
            </header>
            <div class="editorial-carousel-stage">
              ${cards.map((card,index)=>`<div class="editorial-carousel-slide"${index ? ' hidden aria-hidden="true"' : ' aria-hidden="false"'}>${editorialStoryLink(card,'editorial-carousel-story',true)}</div>`).join('')}
            </div>
            <footer class="editorial-carousel-controls">
              <button type="button" data-editorial-carousel="previous" aria-label="Previous World Briefing story">PREVIOUS</button>
              <span data-editorial-carousel-counter>1 / ${cards.length}</span>
              <button type="button" data-editorial-carousel="next" aria-label="Next World Briefing story">NEXT</button>
            </footer>
          </section>
        </section>`;
      startEditorialCarousel(qs('.editorial-carousel', grid));
      return;
    }

    grid.innerHTML = `
      <section class="realm-world editorial-world ${isTech ? 'tech-world' : 'news-world'}" data-lane="${escapeAttr(lane)}" data-source-state="${escapeAttr(sourceState.state || data.state || 'LIVE')}">
        <div class="realm-main editorial-main">
          <section class="world-hero realm-hero editorial-world-hero">
            <div class="realm-identity-line"><span>${isTech ? 'SIGNAL INTELLIGENCE' : 'EDITORIAL OBSERVATION'}</span><time>${escapeHtml(updated)}</time></div>
            ${editorialStoryLink(hero,'editorial-hero-story',true)}
          </section>

          <section class="world-intelligence realm-intelligence editorial-intelligence" aria-label="${isTech ? 'Technology signal intelligence' : 'News supporting stories'}">
            <header class="realm-section-heading"><span>${isTech ? 'ACTIVE SIGNALS' : 'SUPPORTING STORIES'}</span><small>${isTech ? 'Topic routing from verified headlines' : 'BBC News editorial wire'}</small></header>
            ${isTech ? `<div class="tech-topic-matrix">${topicNames.map(topic=>{
              const match = cards.find(card=>techTopicFor(card, topic));
              return match ? `<a class="tech-topic-row" href="${escapeHtml(normalizeUrl(match.url))}" target="_blank" rel="noopener noreferrer"><span>${topic}</span><b>${escapeHtml(cleanText(match.title,72))}</b><small>${escapeHtml(match.time)}</small></a>` : `<article class="tech-topic-row is-unavailable"><span>${topic}</span><b>NO VERIFIED SIGNAL</b><small>Current feed</small></article>`;
            }).join('')}</div>` : `<div class="editorial-support-list">${supporting.map(card=>editorialStoryLink(card,'editorial-support-story',true)).join('')}</div>`}
          </section>
        </div>
        <section class="world-ribbon realm-ticker-ribbon editorial-timeline-ribbon" aria-label="${isTech ? 'Technology signal timeline' : 'News timeline'}">
          <header><span>${isTech ? 'SIGNAL TIMELINE' : 'STORY TIMELINE'}</span><small>${escapeHtml(data.provider || data.source || 'Verified source')}</small></header>
          <div class="realm-ribbon-track editorial-timeline-track">${cards.map(card=>editorialStoryLink(card,'editorial-timeline-item',false)).join('')}</div>
        </section>
      </section>`;
  }

  function renderSignalWorld(data={}, sourceState={}, token, world){
    if(!shouldRenderLane('signal', token)) return;
    const grid = qs('#rucaLiveGrid', world || document);
    if(!grid) return;
    const markets = data.markets || {};
    const tech = data.tech || {};
    const worldData = data.world || {};
    const marketItems = filterLaneItems('market', markets.items || markets.symbols || []);
    const techCards = filterLaneItems('tech', tech.items || []).slice(0,8).map(item=>normalizeCard('tech', item, {source:tech.provider || tech.source, status:tech.status || tech.state || 'LIVE'}));
    const worldCards = filterLaneItems('news', worldData.items || []).slice(0,8).map(item=>normalizeCard('news', item, {source:worldData.provider || worldData.source, status:worldData.status || worldData.state || 'LIVE'}));
    const correlations = Array.isArray(data.correlations) ? data.correlations : [];
    if(!marketItems.length && !techCards.length && !worldCards.length){
      grid.innerHTML = `
        <section class="realm-state-panel signal-source-state" data-state="${escapeAttr(sourceState.state || 'OFFLINE')}" data-lane="signal">
          <span>SIGNAL INTELLIGENCE SOURCES</span>
          <h4>No verified Market, Technology, or World signals are available</h4>
          <p>Market: ${escapeHtml(markets.last_error || 'No current response')}. Technology: ${escapeHtml(tech.last_error || 'No current response')}. World: ${escapeHtml(worldData.last_error || 'No current response')}.</p>
          <div class="ruca-card-actions"><button type="button" data-source-retry="markets">RETRY MARKET</button><button type="button" data-source-retry="tech">RETRY TECHNOLOGY</button><button type="button" data-source-retry="news">RETRY WORLD</button><button type="button" data-source-configure="markets">CONFIGURE SOURCES</button></div>
        </section>`;
      return;
    }

    const changes = marketItems.map(marketChange).filter(value=>value !== null);
    const average = changes.length ? changes.reduce((sum,value)=>sum+value,0) / changes.length : null;
    const marketTone = average === null ? 'MOVEMENT NOT SUPPLIED' : average > 0.15 ? 'ADVANCING' : average < -0.15 ? 'DECLINING' : 'MIXED';
    const marketPulse = ['DIA','QQQ','SPY'].map(symbol=>marketItems.find(item=>String(item.symbol || '').toUpperCase() === symbol)).filter(Boolean);
    const pulseItems = (marketPulse.length ? marketPulse : marketItems).slice(0,4);
    const topics = ['AI','HARDWARE','CYBERSECURITY','COMPANY SIGNALS'];
    const updated = formatTime(data.last_updated || data.updated);
    const marketState = canonicalRealmStatus(markets.status || markets.state || markets.source_status);
    const techState = canonicalRealmStatus(tech.status || tech.state || tech.source_status);
    const worldState = canonicalRealmStatus(worldData.status || worldData.state || worldData.source_status);

    grid.innerHTML = `
      <section class="realm-world signal-world" data-lane="signal" data-source-state="${escapeAttr(sourceState.state || data.state || 'PARTIAL')}">
        <div class="realm-main signal-main">
          <section class="world-hero realm-hero signal-world-hero">
            <div class="realm-identity-line"><span>SIGNAL INTELLIGENCE</span><time>${escapeHtml(updated)}</time></div>
            <div class="signal-market-tone"><span>MARKET PULSE</span><h4>${escapeHtml(marketTone)}</h4>${average === null ? '<p>Verified movement was not supplied.</p>' : `<p>${average >= 0 ? '+' : ''}${average.toFixed(2)}% average across returned signals</p>`}</div>
            <div class="signal-market-pulse">${pulseItems.length ? pulseItems.map(item=>marketQuoteLink(item,'signal-market-readout')).join('') : '<article class="signal-unavailable"><span>MARKETS</span><strong>UNAVAILABLE</strong><small>No verified quotes returned</small></article>'}</div>
            <div class="signal-source-split"><span>MARKET <b>${escapeHtml(marketState)}</b></span><span>TECHNOLOGY <b>${escapeHtml(techState)}</b></span><span>WORLD <b>${escapeHtml(worldState)}</b></span><span>CORRELATIONS <b>${correlations.length ? 'OBSERVED' : 'NOT OBSERVED'}</b></span></div>
          </section>

          <section class="world-intelligence realm-intelligence signal-intelligence" aria-label="Market, Technology, World, and Correlations">
            <header class="realm-section-heading"><span>FUSION CHANNELS</span><small>Verified inputs // inference labels explicit</small></header>
            <div class="signal-fusion-grid">
              <section class="signal-channel-panel" data-signal-channel="technology">
                <header><span>TECHNOLOGY</span><small>${escapeHtml(techState)}</small></header>
                <div class="signal-topic-matrix">${topics.map(topic=>{
                  const match = techCards.find(card=>techTopicFor(card, topic));
                  return match ? editorialStoryLink(match,'signal-topic-row',true) : `<article class="signal-topic-row is-unavailable"><div class="editorial-story-copy"><div class="editorial-meta"><span>${escapeHtml(topic)}</span><time>NOW</time></div><h4>NO VERIFIED SIGNAL</h4><p>The current technology source did not return a matching headline.</p></div></article>`;
                }).join('')}</div>
              </section>
              <section class="signal-channel-panel" data-signal-channel="world">
                <header><span>WORLD</span><small>${escapeHtml(worldState)}</small></header>
                <div class="signal-world-list">${worldCards.length ? worldCards.slice(0,4).map(card=>editorialStoryLink(card,'signal-world-row',true)).join('') : '<article class="signal-topic-row is-unavailable"><div class="editorial-story-copy"><h4>NO VERIFIED WORLD SIGNAL</h4><p>The current world source returned no headline.</p></div></article>'}</div>
              </section>
              <section class="signal-channel-panel signal-correlation-panel" data-signal-channel="correlations">
                <header><span>CORRELATIONS</span><small>CAUSE NOT VERIFIED</small></header>
                <div class="signal-correlation-list">${correlations.length ? correlations.map(item=>`<article class="signal-correlation-row"><div class="signal-evidence-labels"><b>${escapeHtml(item.evidence_label || 'RELATED SIGNAL')}</b><b>${escapeHtml(item.relationship_label || 'CORRELATION OBSERVED')}</b><b>CAUSE NOT VERIFIED</b></div><h4>${escapeHtml(item.symbol || 'MARKET')} // ${escapeHtml(item.headline || 'Verified headline')}</h4><p>${escapeHtml(item.statement || 'Signals share the current observation window.')}</p><small>${escapeHtml(item.reason || 'Causality was not established.')}</small></article>`).join('') : '<article class="signal-correlation-row is-unavailable"><div class="signal-evidence-labels"><b>RELATED SIGNAL</b><b>CAUSE NOT VERIFIED</b></div><h4>NO CORRELATION OBSERVED</h4><p>The available inputs do not support a labeled relationship.</p></article>'}</div>
              </section>
            </div>
          </section>
        </div>
        <section class="world-ribbon realm-ticker-ribbon signal-ribbon" aria-label="Signal ribbon">
          <header><span>MARKET + TECHNOLOGY + WORLD</span><small>${escapeHtml(sourceState.state || data.state || 'PARTIAL')} // CAUSE NOT VERIFIED</small></header>
          <div class="realm-ribbon-track signal-ribbon-track">${marketItems.slice(0,8).map(item=>marketQuoteLink(item,'market-ticker-item')).join('')}${techCards.slice(0,4).map(card=>editorialStoryLink(card,'editorial-timeline-item',false)).join('')}${worldCards.slice(0,4).map(card=>editorialStoryLink(card,'editorial-timeline-item',false)).join('')}</div>
        </section>
      </section>`;
  }

  function renderCelestialWorld(data={}, sourceState={}, token, world){
    if(!shouldRenderLane('celestial', token)) return;
    const grid = qs('#rucaLiveGrid', world || document);
    if(!grid) return;
    const science = data.scientific || {};
    const moon = science.moon || {};
    if(!moon.phase){
      renderRealmActionState(world, 'celestial', sourceActionCards('celestial', data, 'Celestial calculations did not return a scientific payload.'), sourceState);
      return;
    }
    const twilight = science.twilight || {};
    const entertainment = data.entertainment || {};
    const location = data.location || {};
    const metrics = [
      ['Sunrise', science.sunrise ? formatTime(science.sunrise) : 'NOT AVAILABLE'],
      ['Sunset', science.sunset ? formatTime(science.sunset) : 'NOT AVAILABLE'],
      ['Civil dawn', twilight.civil_dawn ? formatTime(twilight.civil_dawn) : 'NOT AVAILABLE'],
      ['Civil dusk', twilight.civil_dusk ? formatTime(twilight.civil_dusk) : 'NOT AVAILABLE']
    ];
    grid.innerHTML = `
      <section class="realm-world celestial-world" data-lane="celestial" data-source-state="${escapeAttr(sourceState.state || data.state || 'LIVE')}">
        <div class="realm-main celestial-main">
          <section class="world-hero realm-hero celestial-world-hero">
            <div class="realm-identity-line"><span>CELESTIAL OBSERVATORY</span><time>${escapeHtml(formatTime(data.last_updated || data.updated))}</time></div>
            <div class="celestial-moon-readout"><span>MOON PHASE</span><h4>${escapeHtml(moon.phase)}</h4><strong>${escapeHtml(moon.illumination_percent)}%</strong><p>Current calculated illumination // lunar age ${escapeHtml(moon.age_days)} days</p></div>
            <div class="celestial-location"><span>OBSERVATION POINT</span><b>${escapeHtml(location.name || 'Saved location')}</b><small>${escapeHtml(location.lat)} / ${escapeHtml(location.lon)}</small></div>
          </section>
          <section class="world-intelligence realm-intelligence celestial-intelligence" aria-label="Scientific celestial intelligence">
            <header class="realm-section-heading"><span>SCIENTIFIC</span><small>${escapeHtml(science.source || 'Deterministic calculations')} // ${escapeHtml(science.confidence || 'CALCULATED')}</small></header>
            <div class="celestial-metric-grid">${metrics.map(metric=>`<article><span>${escapeHtml(metric[0])}</span><strong>${escapeHtml(metric[1])}</strong></article>`).join('')}</div>
            <div class="celestial-state-band"><span>LIGHT STATE</span><b>${escapeHtml(science.daylight_state || 'UNAVAILABLE')}</b><small>Solar position calculated for the saved observation point.</small></div>
          </section>
        </div>
        <section class="world-ribbon celestial-entertainment" data-status="${escapeAttr(entertainment.status || 'ENTERTAINMENT')}">
          <header><span>ENTERTAINMENT</span><small>SEPARATE FROM SCIENTIFIC OBSERVATION</small></header>
          <div><strong>${escapeHtml(entertainment.title || 'ENTERTAINMENT CONTENT UNAVAILABLE')}</strong><p>No horoscope content is generated or presented as verified, predictive, scientific, or factual.</p><small>${escapeHtml(entertainment.source || 'No configured legal entertainment source')}</small></div>
        </section>
      </section>`;
  }

  function sportsGameKey(game){
    return `${game?.league || ''}|${game?.awayTeam || ''}|${game?.homeTeam || ''}|${game?.startTime || ''}`;
  }

  function sportsScoreAvailable(game){
    return game?.awayScore !== null && game?.awayScore !== undefined && game?.homeScore !== null && game?.homeScore !== undefined;
  }

  function sportsGameLink(game, className){
    const href = normalizeUrl(game?.url);
    const tag = href ? 'a' : 'article';
    const attrs = href ? ` href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"` : '';
    const status = cleanText(game?.detail || game?.status || 'scheduled', 32);
    return `<${tag}${attrs} class="${className}" data-game-state="${escapeAttr(game?.status || 'scheduled')}">
      <span>${escapeHtml(game?.league || 'SPORTS')}</span>
      <div class="sports-team-line"><b>${escapeHtml(game?.awayTeam || 'Away')}</b><strong>${sportsScoreAvailable(game) ? escapeHtml(game.awayScore) : ''}</strong></div>
      <div class="sports-team-line"><b>${escapeHtml(game?.homeTeam || 'Home')}</b><strong>${sportsScoreAvailable(game) ? escapeHtml(game.homeScore) : ''}</strong></div>
      <small>${escapeHtml(status)} // ${escapeHtml(formatTime(game?.startTime))}</small>
    </${tag}>`;
  }

  function renderSportsWorld(data={}, sourceState={}, token, world){
    if(!shouldRenderLane('sports', token)) return;
    const grid = qs('#rucaLiveGrid', world || document);
    if(!grid) return;
    const seen = new Set();
    const allGames = [...(data.gamesToday || []), ...(data.nextGames || [])].filter(game=>{
      const key = sportsGameKey(game);
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if(!allGames.length){
      renderRealmActionState(world, 'sports', sourceActionCards('sports', data, 'Sports source did not return verified games.'), sourceState);
      return;
    }
    const leagues = ['ALL','NBA','NFL','MLB','NHL'];
    const selected = leagues.includes(state.sportsLeague) ? state.sportsLeague : 'ALL';
    const filtered = selected === 'ALL' ? allGames : allGames.filter(game=>String(game.league).toUpperCase() === selected);
    const hero = filtered.find(game=>game.status === 'live') || filtered.find(game=>game.status === 'scheduled') || filtered[0] || allGames[0];
    const activeGames = filtered.filter(game=>game.status === 'live');
    const upcoming = filtered.filter(game=>game.status === 'scheduled');
    const scored = filtered.filter(sportsScoreAvailable);
    const activeTeam = readTeamAtmosphere();
    const favorites = (data.favoriteTeams || []).filter(team=>['NBA','NFL','MLB','NHL'].includes(String(team.league || '').toUpperCase())).slice(0,4);
    const updated = formatTime(data.updated || data.timestamp);

    grid.innerHTML = `
      <section class="realm-world sports-world" data-lane="sports" data-source-state="${escapeAttr(sourceState.state || data.state || 'LIVE')}">
        <div class="realm-main sports-main">
          <section class="world-hero realm-hero sports-world-hero">
            <div class="realm-identity-line"><span>GAME DAY OBSERVATION</span><time>${escapeHtml(updated)}</time></div>
            <div class="sports-hero-league"><span>${escapeHtml(hero.league || 'SPORTS')}</span><b>${escapeHtml(hero.detail || hero.status || 'scheduled')}</b></div>
            <div class="sports-hero-matchup">
              <div><span>AWAY</span><strong>${escapeHtml(hero.awayTeam || 'Away')}</strong><b>${sportsScoreAvailable(hero) ? escapeHtml(hero.awayScore) : ''}</b></div>
              <i>AT</i>
              <div><span>HOME</span><strong>${escapeHtml(hero.homeTeam || 'Home')}</strong><b>${sportsScoreAvailable(hero) ? escapeHtml(hero.homeScore) : ''}</b></div>
            </div>
            <p>${escapeHtml(hero.detail || formatTime(hero.startTime))}${hero.clock && hero.clock !== '0:00' ? ` // ${escapeHtml(hero.clock)}` : ''}${hero.period ? ` // PERIOD ${escapeHtml(hero.period)}` : ''}</p>
            ${normalizeUrl(hero.url) ? `<a class="realm-primary-action" href="${escapeHtml(normalizeUrl(hero.url))}" target="_blank" rel="noopener noreferrer">OPEN GAME CENTER</a>` : ''}
          </section>

          <section class="world-intelligence realm-intelligence sports-intelligence" aria-label="Sports intelligence">
            <div class="sports-league-selector" role="group" aria-label="League selector">${leagues.map(league=>`<button type="button" data-sports-league="${league}" aria-pressed="${league === selected ? 'true' : 'false'}">${league}<small>${league === 'ALL' ? allGames.length : allGames.filter(game=>String(game.league).toUpperCase() === league).length}</small></button>`).join('')}</div>
            <div class="sports-intelligence-grid">
              <section class="sports-scoreboard"><header><span>${activeGames.length ? 'LIVE SCORES' : 'LATEST SCORES'}</span><small>${selected}</small></header>${(activeGames.length ? activeGames : scored).slice(0,6).map(game=>sportsGameLink(game,'sports-score-row')).join('') || '<p>No scored events in this league response.</p>'}</section>
              <section class="sports-context-deck">
                <div class="sports-context-row"><span>UPCOMING</span><b>${upcoming.length}</b><small>verified events</small></div>
                <div class="sports-context-row"><span>STANDINGS</span><b>NOT SUPPLIED</b><small>current scoreboard source</small></div>
                <div class="sports-context-row"><span>FAVORITE REALM</span><b>${escapeHtml(activeTeam?.team || 'NOT SET')}</b><small>${escapeHtml(activeTeam?.league || 'Control atmosphere')}</small></div>
                <div class="sports-favorites"><span>VERIFIED FAVORITES</span>${favorites.length ? favorites.map(team=>`<div>${team.logo ? `<img src="${escapeHtml(normalizeUrl(team.logo))}" alt="" />` : ''}<b>${escapeHtml(team.name)}</b><small>${escapeHtml(team.league)}</small></div>`).join('') : '<p>No matching favorite metadata in this response.</p>'}</div>
                <div class="sports-upcoming-list"><span>NEXT GAMES</span>${upcoming.slice(0,4).map(game=>`<div><b>${escapeHtml(game.awayTeam || 'Away')} @ ${escapeHtml(game.homeTeam || 'Home')}</b><small>${escapeHtml(formatTime(game.startTime))}</small></div>`).join('') || '<p>No upcoming events in this league response.</p>'}</div>
              </section>
            </div>
          </section>
        </div>
        <section class="world-ribbon realm-ticker-ribbon sports-schedule-ribbon" aria-label="Sports schedule">
          <header><span>SCHEDULE RIBBON</span><small>${escapeHtml(selected)} // real ESPN events</small></header>
          <div class="realm-ribbon-track sports-schedule-track">${filtered.slice(0,14).map(game=>sportsGameLink(game,'sports-schedule-item')).join('')}</div>
        </section>
      </section>`;
  }

  function sourceIdFromLane(lane){
    if(lane === 'market' || lane === 'signal') return 'markets';
    return lane;
  }

  function laneFromSourceId(source){
    if(source === 'markets' || source === 'tech') return 'signal';
    return source;
  }

  function renderPreviewCard(card){
    return `<article class="ruca-world-preview-card" data-lane="${escapeHtml(card.lane)}">
      <span>${escapeHtml(card.lane)}</span>
      <b>${escapeHtml(card.title)}</b>
      <small>${escapeHtml(card.status)} // ${escapeHtml(card.time || 'Now')}</small>
    </article>`;
  }

  function cleanText(value, max=180){
    const text = String(value ?? '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if(text.length <= max) return text;
    return text.slice(0, Math.max(0, max - 3)).trimEnd() + '...';
  }

  function normalizeUrl(value){
    const text = String(value || '').trim();
    return /^https?:\/\//i.test(text) ? text : '';
  }

  function isUrl(value){
    return /^https?:\/\//i.test(String(value || '').trim());
  }

  function hostFromUrl(url){
    try{
      return url ? new URL(url).hostname.replace(/^www\./,'') : '';
    }catch(err){
      return '';
    }
  }

  function formatTime(value){
    if(value === null || value === undefined || value === '') return 'Now';
    if(typeof value === 'number') return new Date(value * 1000).toLocaleString([], {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
    const raw = String(value);
    const date = new Date(raw);
    if(!Number.isNaN(date.getTime())) return date.toLocaleString([], {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
    return cleanText(raw, 32) || 'Now';
  }

  function escapeAttr(s){return String(s ?? '').replace(/['"\\]/g,'');}
  function escapeHtml(s){return String(s ?? '').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));}

  function installSourceActionHandlers(){
    if(document.body.dataset.pass15SourceActions === 'true') return;
    document.body.dataset.pass15SourceActions = 'true';
    document.addEventListener('click', event=>{
      const retry = event.target.closest('[data-source-retry]');
      const configure = event.target.closest('[data-source-configure]');
      const test = event.target.closest('[data-source-test]');
      const clear = event.target.closest('[data-source-clear-cache]');
      const cache = event.target.closest('[data-source-cache]');
      const location = event.target.closest('[data-source-location]');
      const key = event.target.closest('[data-source-key]');
      const sportsLeague = event.target.closest('[data-sports-league]');
      const editorialCarousel = event.target.closest('[data-editorial-carousel]');
      const audioTest = event.target.closest('[data-audio-test]');
      const drawerAction = event.target.closest('[data-drawer-action]');
      const save = event.target.closest('#rucaSaveSourceConfig');
      if(editorialCarousel){
        event.preventDefault();
        moveEditorialCarousel(editorialCarousel);
      }else if(sportsLeague){
        event.preventDefault();
        const league = String(sportsLeague.dataset.sportsLeague || 'ALL').toUpperCase();
        state.sportsLeague = ['ALL','NBA','NFL','MLB','NHL'].includes(league) ? league : 'ALL';
        if(state.lastLane === 'sports' && state.sports){
          const token = beginLaneRequest('sports');
          renderLiveWorld('sports', state.sports, sourceStateForLane('sports', state.sports), token);
          qs(`[data-sports-league="${state.sportsLeague}"]`)?.focus();
        }
      }else if(retry){
        event.preventDefault();
        retrySource(retry.dataset.sourceRetry);
      }else if(configure){
        event.preventDefault();
        openSourceManagement(configure.dataset.sourceConfigure);
      }else if(cache){
        event.preventDefault();
        openSourceManagement(cache.dataset.sourceCache);
        const output = qs('#rucaSourceTestOutput');
        if(output) output.textContent = `Cache view requested for ${sourceIdFromLane(cache.dataset.sourceCache)}. Status cards show current cache age and last success.`;
      }else if(location){
        event.preventDefault();
        openLocationControls();
      }else if(key){
        event.preventDefault();
        openKeyControls(key.dataset.sourceKey);
      }else if(test){
        event.preventDefault();
        testSource(test.dataset.sourceTest, test);
      }else if(clear){
        event.preventDefault();
        clearSourceCache();
      }else if(audioTest){
        event.preventDefault();
        window.RUCA_AUDIO?.cue(audioTest.dataset.audioTest || 'confirm');
      }else if(drawerAction){
        event.preventDefault();
        runDrawerAction(drawerAction);
      }else if(save){
        event.preventDefault();
        saveSourceConfig();
      }
    });
  }

  function installSourceManagement(){
    hydrateSourceControls();
    const refreshWhenRelevant = ()=>{
      const world = document.body.dataset.world || 'home';
      if(world === 'live' || world === 'control') refreshSourcesStatus();
    };
    refreshWhenRelevant();
    setInterval(refreshWhenRelevant, 60 * 1000);
  }

  function hydrateSourceControls(){
    const saved = readSourceControls();
    if(qs('#rucaSportsProvider')) qs('#rucaSportsProvider').value = saved.sportsProvider;
    if(qs('#rucaMarketProvider')) qs('#rucaMarketProvider').value = saved.marketProvider;
    if(qs('#rucaRefreshInterval')) qs('#rucaRefreshInterval').value = String(saved.refreshSeconds);
  }

  function readSourceControls(){
    try{
      const stored = JSON.parse(localStorage.getItem('rucaSourceControls') || '{}') || {};
      return {
        sportsProvider: stored.sportsProvider || 'ESPN scoreboard',
        marketProvider: stored.marketProvider || 'Auto',
        refreshSeconds: clampLiveRefreshSeconds(stored.refreshSeconds || LIVE_REFRESH_DEFAULT_SECONDS)
      };
    }catch(err){
      return {sportsProvider:'ESPN scoreboard', marketProvider:'Auto', refreshSeconds:LIVE_REFRESH_DEFAULT_SECONDS};
    }
  }

  async function saveSourceConfig(){
    const output = qs('#rucaSourceTestOutput');
    const payload = {
      sportsProvider: qs('#rucaSportsProvider')?.value || 'ESPN scoreboard',
      marketProvider: qs('#rucaMarketProvider')?.value || 'Auto',
      refreshSeconds: Number(qs('#rucaRefreshInterval')?.value || 300),
      alphaKey: qs('#rucaAlphaKey')?.value || '',
      theSportsDbKey: qs('#rucaSportsDbKey')?.value || ''
    };
    localStorage.setItem('rucaSourceControls', JSON.stringify({
      sportsProvider: payload.sportsProvider,
      marketProvider: payload.marketProvider,
      refreshSeconds: payload.refreshSeconds
    }));
    try{
      const res = await fetch('/sources/config', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      });
      const json = await res.json();
      if(output) output.textContent = `Saved source config: ${json.state || 'OK'}`;
      if(qs('#rucaAlphaKey')) qs('#rucaAlphaKey').value = '';
      if(qs('#rucaSportsDbKey')) qs('#rucaSportsDbKey').value = '';
      window.RUCA_AUDIO?.cue('confirm');
      if(json.refresh_policy) setLiveWorldRefreshPolicy(json.refresh_policy, 'control-save');
      refreshSourcesStatus();
    }catch(err){
      if(output) output.textContent = `Source config save unavailable: ${err.message || err}`;
      window.RUCA_AUDIO?.cue('error');
    }
  }

  async function refreshSourcesStatus(){
    const world = document.body.dataset.world || 'home';
    if(world !== 'live' && world !== 'control') return state.sources;
    const grid = qs('#rucaSourceStatusGrid');
    try{
      const data = await fetchJson('/sources/status', 7000);
      state.sources = data;
      if(data.refresh_policy) setLiveWorldRefreshPolicy(data.refresh_policy, 'bridge-status');
      const sources = data.sources || [];
      if(grid) grid.innerHTML = sources.map(source=>renderSourceStatusCard(source)).join('');
    }catch(err){
      if(grid) grid.innerHTML = `<article class="source-status-card source-status-error"><span>SOURCE REGISTRY</span><b>BRIDGE UNAVAILABLE</b><small>${escapeHtml(err.message || String(err))}</small><p>Retry any source or configure providers/API keys from this panel.</p><button type="button" data-source-test="weather">RETRY WEATHER</button><button type="button" data-source-configure="weather">CONFIGURE SOURCE</button></article>`;
    }
  }

  function renderSourceStatusCard(source){
    const status = source.last_status || 'UNTESTED';
    const last = source.last_success || 'No success recorded';
    const err = source.last_error || 'No current error';
    const age = source.freshness_seconds === null || source.freshness_seconds === undefined ? 'No cache' : `${Math.round(Number(source.freshness_seconds))}s cache`;
    return `<article class="source-status-card" data-status="${escapeHtml(status)}">
      <span>${escapeHtml(source.id || 'source')}</span>
      <b>${escapeHtml(status)}</b>
      <small>${escapeHtml(source.provider || 'Provider unknown')}</small>
      <em>${escapeHtml(age)} // ${escapeHtml(last)}</em>
      <p>${escapeHtml(err)}</p>
      <button type="button" data-source-test="${escapeAttr(source.id)}">TEST</button>
    </article>`;
  }

  async function retrySource(sourceId){
    const id = sourceIdFromLane(sourceId);
    const lane = laneFromSourceId(id);
    window.RUCA_AUDIO?.cue('source-retry');
    await testSource(id);
    if(LIVE_WORLD_REALMS.some(realm=>realm.key === lane) && state.lastLane === lane){
      await refreshLaneData(lane, false, beginLaneRequest(lane));
    }
  }

  async function testSource(sourceId, button){
    const id = sourceIdFromLane(sourceId);
    const output = qs('#rucaSourceTestOutput');
    if(button) button.disabled = true;
    if(output) output.textContent = `Testing ${id} source...`;
    try{
      const data = await fetchJson(`/sources/test?source=${encodeURIComponent(id)}`, 15000);
      if(output) output.textContent = `${id}: ${data.state || 'UNKNOWN'} // ${data.provider || 'provider unknown'} // ${data.elapsed_ms || 0}ms`;
      window.RUCA_AUDIO?.cue('confirm');
      refreshSourcesStatus();
      return data;
    }catch(err){
      if(output) output.textContent = `${id}: BRIDGE UNAVAILABLE // ${err.message || err}`;
      window.RUCA_AUDIO?.cue('error');
      throw err;
    }finally{
      if(button) button.disabled = false;
    }
  }

  async function clearSourceCache(){
    const output = qs('#rucaSourceTestOutput');
    try{
      const data = await fetchJson('/sources/clear-cache', 7000);
      if(output) output.textContent = `Cleared cache: ${(data.cleared || []).join(', ') || 'nothing cached'}`;
      window.RUCA_AUDIO?.cue('confirm');
      refreshSourcesStatus();
    }catch(err){
      if(output) output.textContent = `Clear cache failed: ${err.message || err}`;
      window.RUCA_AUDIO?.cue('error');
    }
  }

  function openSourceManagement(sourceId){
    qs('.nav-btn[data-page="control"]')?.click();
    setTimeout(()=>{
      const panel = qs('#rucaSourceManagement');
      if(panel){
        panel.open = true;
        panel.scrollIntoView({block:'center', behavior:'smooth'});
      }
      const testButton = qs(`[data-source-test="${escapeAttr(sourceIdFromLane(sourceId))}"]`);
      testButton?.focus();
    }, 100);
  }

  function openLocationControls(){
    qs('.nav-btn[data-page="control"]')?.click();
    setTimeout(()=>{
      const panel = qs('#rucaSourceManagement');
      const locationPanel = qs('#rucaWeatherName')?.closest('.atmo-section');
      if(panel) panel.open = true;
      if(locationPanel) locationPanel.open = true;
      const target = qs('#rucaWeatherLat') || qs('#rucaWeatherName');
      if(target){
        target.scrollIntoView({block:'center', behavior:'smooth'});
        target.focus();
      }
      window.RUCA_AUDIO?.cue('confirm');
    }, 100);
  }

  function openKeyControls(sourceId){
    qs('.nav-btn[data-page="control"]')?.click();
    setTimeout(()=>{
      const panel = qs('#rucaSourceManagement');
      if(panel){
        panel.open = true;
        panel.scrollIntoView({block:'center', behavior:'smooth'});
      }
      const id = sourceIdFromLane(sourceId);
      const target = id === 'sports' ? qs('#rucaSportsDbKey') : qs('#rucaAlphaKey');
      target?.focus();
      window.RUCA_AUDIO?.cue('confirm');
    }, 100);
  }

  function installCommandDrawerActions(){
    if(document.body.dataset.pass15bDrawerActions === 'true') return;
    document.body.dataset.pass15bDrawerActions = 'true';
    document.addEventListener('click', event=>{
      const launchTarget = event.target.closest('.app-card,.launch-node,.app-orbit-node,.command-wheel-action');
      if(!launchTarget) return;
      setTimeout(()=>augmentDrawerForCommand(launchTarget), 40);
    });
  }

  function augmentDrawerForCommand(target){
    const drawer = qs('#detailDrawer');
    const content = qs('#drawerContent');
    if(!drawer || !content || drawer.getAttribute('aria-hidden') === 'true') return;
    content.querySelector('.pass15b-drawer-actions')?.remove();
    const status = target.dataset.status || (target.textContent.match(/READY|STAGED/i)?.[0]) || '';
    const commandText = [...content.querySelectorAll('.drawer-line')].map(line=>line.textContent).join(' ');
    const isReady = /READY/i.test(status) || /Launch StateREADY/i.test(commandText) || /StateREADY/i.test(commandText);
    const command = extractDrawerValue('Path / Protocol') || extractDrawerValue('Command') || '';
    const hasWebFallback = /web app/i.test(commandText) || /netflix|youtube|hulu|prime|paramount/i.test(target.textContent || '');
    const actions = isReady
      ? `<button type="button" data-drawer-action="launch-protocol" data-command="${escapeAttr(command)}">VERIFY LAUNCH</button>${hasWebFallback ? '<button type="button" data-drawer-action="web-fallback">WEB FALLBACK</button>' : ''}`
      : `<button type="button" data-drawer-action="configure-path">CONFIGURE PATH</button>${hasWebFallback ? '<button type="button" data-drawer-action="web-fallback">WEB FALLBACK</button>' : ''}`;
    content.insertAdjacentHTML('beforeend', `
      <div class="pass15b-drawer-actions">
        <span>COMMAND ACTIONS</span>
        <div>${actions}<button type="button" data-drawer-action="configure-path">SOURCE SETUP</button></div>
        <small id="drawerActionStatus">${isReady ? 'Ready state detected. Launch remains deliberate.' : 'Missing or staged path detected. Setup required.'}</small>
      </div>`);
  }

  function extractDrawerValue(label){
    const line = qsa('#drawerContent .drawer-line').find(row => (row.querySelector('span')?.textContent || '').trim() === label);
    return line?.querySelector('b')?.textContent || '';
  }

  function runDrawerAction(button){
    const action = button.dataset.drawerAction;
    const command = button.dataset.command || '';
    const title = qs('#drawerTitle')?.textContent || 'Command';
    const output = qs('#drawerActionStatus');
    const write = (message, cue='confirm')=>{
      if(output) output.textContent = message;
      window.RUCA_AUDIO?.cue(cue);
    };
    if(action === 'configure-path'){
      qs('.nav-btn[data-page="control"]')?.click();
      setTimeout(()=>openSourceManagement('apps'), 80);
      write(`${title}: configure path requested. Control is open for command setup.`, 'confirm');
      return;
    }
    if(action === 'web-fallback'){
      write(`${title}: web fallback is available. Launch only occurs from a deliberate app command.`, 'confirm');
      return;
    }
    if(action === 'launch-protocol'){
      if(!command || /needs|staged|labs bridge/i.test(command)){
        write(`${title}: source/path required before launch.`, 'error');
        return;
      }
      if(/^(steam:|spotify:|ms-settings:|https?:)/i.test(command)){
        write(`${title}: verified protocol available. Pressing launch would hand off to ${command}.`, 'confirm');
        return;
      }
      write(`${title}: local executable launch requires the RUCA launcher bridge.`, 'error');
      return;
    }
    write(`${title}: command acknowledged.`, 'activate');
  }

  function benchmarkStateLabel(value){
    return String(value || 'UNKNOWN').replace(/_/g, ' ');
  }

  function benchmarkTerminalKey(job){
    const terminalStates = new Set(['COMPLETE','COMPLETED','SUCCEEDED','FINISHED']);
    const terminalState = String(job?.state || '').trim().toUpperCase();
    if(!terminalStates.has(terminalState)) return '';
    return `${job?.id || job?.suite_id || 'benchmark'}:${terminalState}`;
  }

  function renderBenchmarkJob(job){
    const results = qs('#benchmarkResults');
    const cancel = qs('#cancelBenchmark');
    state.benchmark.activeJob = job || null;
    if(cancel) cancel.disabled = !job?.cancelable;
    if(!job){
      setText('#benchmarkStatus', 'NOT CONFIGURED');
      if(results) results.innerHTML = '<div class="bench-result"><span>BENCHMARK FRAMEWORK</span><b>NOT CONFIGURED</b><small>No benchmark workload has been executed.</small></div>';
      return;
    }
    const status = benchmarkStateLabel(job.state);
    const interpretation = job.result?.interpretation || {};
    const telemetry = job.evidence?.telemetry_reference || {};
    setText('#benchmarkStatus', status);
    if(results){
      results.innerHTML = `
        <div class="bench-result benchmark-job-result">
          <span>${escapeHtml(job.suite_label || job.suite_id || 'BENCHMARK JOB')}</span>
          <b>${escapeHtml(status)}</b>
          <small>${escapeHtml(interpretation.reason || 'No interpretation was returned.')}</small>
        </div>
        <div class="bench-result benchmark-job-result"><span>WORKLOAD</span><b>${job.workload_executed ? 'EXECUTED' : 'NOT EXECUTED'}</b><small>${escapeHtml(job.engine || 'No engine configured')}</small></div>
        <div class="bench-result benchmark-job-result"><span>SCORE</span><b>${job.result?.score === null || job.result?.score === undefined ? 'NOT PRODUCED' : escapeHtml(String(job.result.score))}</b><small>${job.result?.measurements?.length || 0} measurements captured</small></div>
        <div class="bench-result benchmark-job-result"><span>EVIDENCE</span><b>${escapeHtml(telemetry.state || 'UNKNOWN')}</b><small>${escapeHtml(String(telemetry.reading_count ?? 0))} telemetry readings referenced // cause not verified</small></div>`;
    }
    const terminalKey = benchmarkTerminalKey(job);
    if(terminalKey && terminalKey !== state.benchmark.lastTerminalKey){
      state.benchmark.lastTerminalKey = terminalKey;
      requestSemanticPulse('benchmark-complete', {
        target:'#benchmarkResults',
        message:`${job.suite_label || job.suite_id || 'Benchmark'} results committed.`
      });
    }
  }

  function renderBenchmarkRegistry(){
    const registry = state.benchmark.registry;
    const categories = Array.isArray(registry?.categories) ? registry.categories : [];
    const tabs = qs('#benchmarkCategories');
    const grid = qs('#benchmarkGrid');
    if(!categories.length){
      if(tabs) tabs.replaceChildren();
      if(grid) grid.innerHTML = '<div class="inventory-empty-state"><b>NOT CONFIGURED</b><small>Benchmark registry is unavailable.</small></div>';
      return;
    }
    if(!categories.some(category=>category.label === state.benchmark.selectedCategory)) state.benchmark.selectedCategory = categories[0].label;
    if(tabs){
      tabs.innerHTML = categories.map(category=>`<button type="button" class="benchmark-category-btn${category.label === state.benchmark.selectedCategory ? ' is-selected' : ''}" data-benchmark-category="${escapeAttr(category.label)}">${escapeHtml(category.label)}</button>`).join('');
    }
    const category = categories.find(item=>item.label === state.benchmark.selectedCategory) || categories[0];
    if(grid){
      grid.innerHTML = category.suites.map(suite=>`<button type="button" class="bench-btn benchmark-suite-btn" data-benchmark-suite="${escapeAttr(suite.id)}" data-benchmark-state="${escapeAttr(suite.execution_state)}"><span>${escapeHtml(suite.label)}</span><small>${escapeHtml(benchmarkStateLabel(suite.execution_state))}</small></button>`).join('');
    }
    setText('#benchmarkStatus', 'FRAMEWORK READY');
  }

  async function loadBenchmarkRegistry(force=false){
    if(state.benchmark.loading) return state.benchmark.registry;
    if(state.benchmark.registry && !force) return state.benchmark.registry;
    state.benchmark.loading = true;
    setText('#benchmarkStatus', 'LOADING REGISTRY');
    try{
      state.benchmark.registry = await fetchJson('/benchmarks/suites', 5000);
      renderBenchmarkRegistry();
    }catch(error){
      state.benchmark.registry = null;
      setText('#benchmarkStatus', 'NOT CONFIGURED');
      const results = qs('#benchmarkResults');
      if(results) results.innerHTML = `<div class="bench-result"><span>BENCHMARK REGISTRY</span><b>NOT CONFIGURED</b><small>${escapeHtml(error?.message || 'Registry endpoint unavailable.')}</small></div>`;
    }finally{
      state.benchmark.loading = false;
    }
    return state.benchmark.registry;
  }

  async function requestBenchmarkJob(suiteId){
    if(suiteId === 'full'){
      setText('#benchmarkStatus', 'NOT CONFIGURED');
      const results = qs('#benchmarkResults');
      if(results) results.innerHTML = '<div class="bench-result"><span>FULL SUITE</span><b>NOT CONFIGURED</b><small>Automatic full-suite execution is disabled in PASS26C. Choose one registered contract to review its engine state.</small></div>';
      return null;
    }
    setText('#benchmarkStatus', 'CREATING JOB');
    requestSemanticPulse('command-ack', {
      target:`[data-benchmark-suite="${CSS.escape(String(suiteId || ''))}"]`,
      command:'benchmark-start',
      message:'Benchmark request acknowledged.'
    });
    try{
      const job = await postJson('/benchmarks/jobs', {suite_id:suiteId}, 5000);
      renderBenchmarkJob(job);
      return job;
    }catch(error){
      setText('#benchmarkStatus', 'UNKNOWN');
      const results = qs('#benchmarkResults');
      if(results) results.innerHTML = `<div class="bench-result"><span>${escapeHtml(String(suiteId || 'BENCHMARK').toUpperCase())}</span><b>UNKNOWN</b><small>${escapeHtml(error?.message || 'Job creation failed.')}</small></div>`;
      return null;
    }
  }

  async function cancelBenchmarkJob(){
    const job = state.benchmark.activeJob;
    if(!job?.id || !job.cancelable) return false;
    setText('#benchmarkStatus', 'CANCEL REQUESTED');
    try{
      const response = await postJson(`/benchmarks/jobs/${encodeURIComponent(job.id)}/cancel`, {}, 5000);
      renderBenchmarkJob(response.job);
      return response.cancel_accepted === true;
    }catch(error){
      setText('#benchmarkStatus', 'UNKNOWN');
      return false;
    }
  }

  function installDiagnosticsTelemetryOwner(){
    if(state.diagnosticOwnerInstalled) return;
    state.diagnosticOwnerInstalled = true;
    state.diagnosticKey = document.body.dataset.rucaDiagnostic || 'CPU';

    document.addEventListener('ruca:diagnostic-select', event=>{
      const key = String(event.detail?.key || 'CPU');
      state.diagnosticKey = key;
      document.body.dataset.rucaDiagnostic = key;
      setDiagnosticPresentation(key);
      state.inventorySelection = {domain:inventoryDomainForKey(key), deviceId:'', sensorId:''};
      renderTelemetryDiagnostics();
      if(!state.normalizedInventory) refreshInventory(true);
    });

    const scan = qs('#runScan');
    if(scan && !scan.dataset.telemetryOwner){
      scan.dataset.telemetryOwner = TELEMETRY_OWNER_ID;
      scan.addEventListener('click', async()=>{
        scan.disabled = true;
        scan.textContent = 'REFRESHING';
        try{
          await Promise.all([refreshTelemetry(), refreshInventory(true)]);
        }finally{
          scan.disabled = false;
          scan.textContent = 'REFRESH TELEMETRY';
        }
      });
    }

    const diagnosticsPage = qs('#page-diagnostics');
    const diagnosticsDetailToggle = qs('#rucaDiagnosticsDetailToggle');
    if(diagnosticsPage && diagnosticsDetailToggle && !diagnosticsDetailToggle.dataset.detailOwner){
      diagnosticsDetailToggle.dataset.detailOwner = TELEMETRY_OWNER_ID;
      const diagnosticsWorkspace = qs('#rucaDiagnosticsWorkspace');
      const diagnosticsWorkspaceTabs = qsa('[data-diagnostics-workspace]');
      const diagnosticsMetrics = qs('#rucaDiagnosticsMetrics');
      const diagnosticsTechnical = qs('#rucaDiagnosticsTechnical');
      const sensorMapPanel = qs('#rucaSensorMapPanel');
      const benchmarkPanel = qs('#rucaBenchmarkPanel');
      const deepGrid = qs('#deepGrid');
      const setDiagnosticsWorkspace = (view, detailOpen=diagnosticsPage.classList.contains('diagnostics-detail-open'))=>{
        const selected = ['source','map','benchmark','raw'].includes(view) ? view : 'source';
        diagnosticsPage.dataset.diagnosticsWorkspace = selected;
        diagnosticsWorkspaceTabs.forEach(button=>{
          const active = button.dataset.diagnosticsWorkspace === selected;
          button.classList.toggle('active', active);
          button.setAttribute('aria-selected', active ? 'true' : 'false');
          button.tabIndex = active ? 0 : -1;
        });
        if(diagnosticsWorkspace) diagnosticsWorkspace.hidden = !detailOpen;
        if(diagnosticsMetrics) diagnosticsMetrics.hidden = !detailOpen || selected !== 'source';
        if(diagnosticsTechnical) diagnosticsTechnical.hidden = !detailOpen || !['map','benchmark'].includes(selected);
        if(sensorMapPanel) sensorMapPanel.hidden = !detailOpen || selected !== 'map';
        if(benchmarkPanel) benchmarkPanel.hidden = !detailOpen || selected !== 'benchmark';
        if(deepGrid) deepGrid.hidden = !detailOpen || selected !== 'raw';
        if(detailOpen && selected === 'benchmark') loadBenchmarkRegistry();
        markFocusableControls();
        window.RUCA_HOME_GEOMETRY?.refresh?.();
      };
      const setDiagnosticsDetailOpen = open=>{
        diagnosticsPage.classList.toggle('diagnostics-detail-open', open);
        diagnosticsDetailToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        diagnosticsDetailToggle.textContent = open ? 'HIDE TECHNICAL DETAIL' : 'SHOW TECHNICAL DETAIL';
        setDiagnosticsWorkspace(open ? (diagnosticsPage.dataset.diagnosticsWorkspace || 'source') : 'source', open);
      };
      diagnosticsWorkspace?.addEventListener('click', event=>{
        const button = event.target.closest('[data-diagnostics-workspace]');
        if(!button) return;
        setDiagnosticsWorkspace(button.dataset.diagnosticsWorkspace, true);
        window.RUCA_AUDIO?.cue('select');
      });
      diagnosticsDetailToggle.addEventListener('click', ()=>{
        const open = !diagnosticsPage.classList.contains('diagnostics-detail-open');
        setDiagnosticsDetailOpen(open);
        window.RUCA_AUDIO?.cue(open ? 'drawer-open' : 'drawer-close');
      });
      setDiagnosticsDetailOpen(false);
    }

    document.addEventListener('ruca:diagnostic-benchmark', event=>{
      const requested = String(event.detail?.benchmark || 'full');
      const aliases = {cpu:'cpu-multi-core',gpu:'gpu-raster',memory:'memory-bandwidth',storage:'storage-latency',network:'network-lan-latency',thermal:'quick-thermal-response'};
      requestBenchmarkJob(aliases[requested] || requested);
    });

    qs('#benchmarkCategories')?.addEventListener('click', event=>{
      const button = event.target.closest('[data-benchmark-category]');
      if(!button) return;
      state.benchmark.selectedCategory = button.dataset.benchmarkCategory;
      renderBenchmarkRegistry();
    });
    qs('#benchmarkGrid')?.addEventListener('click', event=>{
      const button = event.target.closest('[data-benchmark-suite]');
      if(!button) return;
      event.preventDefault();
      event.stopPropagation();
      requestBenchmarkJob(button.dataset.benchmarkSuite);
    }, true);
    qs('#cancelBenchmark')?.addEventListener('click', cancelBenchmarkJob);

    const selectInventoryTarget = event=>{
      const domainButton = event.target.closest('[data-inventory-domain]');
      if(domainButton){
        const domain = domainButton.dataset.inventoryDomain;
        const button = qsa('.sensor-btn').find(item=>inventoryDomainForKey(item.dataset.sensor) === domain);
        if(button) button.click();
        return;
      }
      const deviceButton = event.target.closest('[data-inventory-device]');
      if(deviceButton){
        state.inventorySelection.deviceId = deviceButton.dataset.inventoryDevice;
        state.inventorySelection.sensorId = '';
        renderTelemetryDiagnostics();
        return;
      }
      const sensorButton = event.target.closest('[data-inventory-sensor]');
      if(sensorButton){
        state.inventorySelection.sensorId = sensorButton.dataset.inventorySensor;
        renderTelemetryDiagnostics();
      }
    };
    qs('#sensorTree')?.addEventListener('click', selectInventoryTarget);
    qs('#metricsTable')?.addEventListener('click', selectInventoryTarget);

    document.addEventListener('ruca:diagnostic-export', ()=>{
      const telemetry = state.normalizedTelemetry || emptyTelemetry('DATA UNAVAILABLE');
      const report = {
        schema:'RUCA_PASS24B_TRUTHFUL_TELEMETRY_REPORT',
        live:telemetry.live,
        status:telemetry.status,
        source:telemetry.source,
        timestamp:telemetry.timestamp,
        exported:new Date().toISOString(),
        state:telemetry.machineState,
        heart:telemetry.heart,
        fields:telemetry.fields,
        inventory:state.normalizedInventory,
        machine_health_timeline:window.RUCAMachineHealthTimeline?.exportSnapshot?.() || null,
        benchmark_job:state.benchmark.activeJob
      };
      const blob = new Blob([JSON.stringify(report, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RUCA_TRUTHFUL_TELEMETRY_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 0);
    });
  }

  function installTelemetryPolish(){
    document.body.dataset.rucaTelemetryOwner = TELEMETRY_OWNER_ID;
    document.body.dataset.rucaTelemetryEndpoint = TELEMETRY_ENDPOINT;
    installDiagnosticsTelemetryOwner();
    const checking = emptyTelemetry('CHECKING', 'Waiting for the canonical bridge.');
    state.normalizedTelemetry = checking;
    state.lastTelemetry = checking;
    renderActiveTelemetryPresentation(checking);
    installHomeTelemetryOwnershipGuard();
    document.addEventListener('ruca:continuity-change', event=>{
      if(event.detail?.type !== 'route-changed') return;
      renderActiveTelemetryPresentation(state.normalizedTelemetry || checking, state.telemetryError);
    });
    refreshTelemetry();
    refreshInventory(true);
    if(!window.RUCA_TELEMETRY_OWNER){
      window.RUCA_TELEMETRY_OWNER = Object.freeze({
        id:TELEMETRY_OWNER_ID,
        endpoint:TELEMETRY_ENDPOINT,
        inventoryEndpoint:TELEMETRY_INVENTORY_ENDPOINT,
        normalize:payload=>normalizeTelemetry(payload),
        normalizeInventory:payload=>window.RUCADiagnosticsEngine?.normalizeInventory(payload),
        refresh:()=>Promise.all([refreshTelemetry(), refreshInventory(true)]),
        snapshot:()=>state.normalizedTelemetry,
        inventorySnapshot:()=>state.normalizedInventory
      });
    }
  }

  function installHomeTelemetryOwnershipGuard(){
    if(state.telemetryGuard) return;
    state.telemetryGuard = true;
    const targets = ['#homeCPU','#homeGPU','#homeRAM','#homeThermal','#homeStorage','#homeNetwork','#homeNetworkDown','#homeNetworkUp']
      .map(sel=>qs(sel))
      .filter(Boolean);
    if(!targets.length || typeof MutationObserver !== 'function') return;
    const observer = new MutationObserver(()=>{
      if((document.body.dataset.world || 'home') !== 'home') return;
      if(state.telemetryWrite) return;
      writeHomeTelemetry(state.homeTelemetry);
    });
    targets.forEach(el=>observer.observe(el, {childList:true, characterData:true, subtree:true}));
  }

  function installControlCustomizer(){
    if(!qs('#rucaCustomizer')) return;
    hydrateControlCustomizer();
  }

  function hydrateControlCustomizer(){
    loadTheme();
    installCustomThemeProfileControls();
    installControlRealmNavigation();
    qsa('.theme-preset[data-ruca-preset]').forEach(btn=>btn.addEventListener('click',()=>setThemePreset(btn.dataset.rucaPreset)));
    qsa('.star-preset[data-ruca-star-preset]').forEach(btn=>btn.addEventListener('click',()=>setStarPreset(btn.dataset.rucaStarPreset)));
    qsa('[data-ruca-theme-token]').forEach(input=>input.addEventListener('input', applyPaletteTokenOverride));
    qsa('[data-ruca-theme-group]').forEach(input=>input.addEventListener('input', applyPaletteGroupOverride));
    qsa('[data-ruca-reset-token]').forEach(button=>button.addEventListener('click', resetPaletteToken));
    qsa('[data-ruca-reset-group]').forEach(button=>button.addEventListener('click', resetPaletteGroup));
    qs('#rucaPaletteMode')?.addEventListener('change', setPaletteMode);
    ['rucaFontPick','rucaDepthSlider','rucaGlowSlider','rucaGlassSlider','rucaMotionSlider','rucaStarBrightness','rucaStarDensity','rucaStarBreath','rucaStarDrift'].forEach(id=>{
      qs('#'+id)?.addEventListener('input', saveTheme);
    });
    qs('#rucaHomeViewMode')?.addEventListener('change', applySelectedHomeViewMode);
    qs('#rucaHomeScale')?.addEventListener('input', applyCustomHomeScale);
    qs('#rucaReducedMotion')?.addEventListener('change', saveTheme);
    qs('#rucaApplyTheme')?.addEventListener('click', saveTheme);
    qs('#rucaResetTheme')?.addEventListener('click', resetTheme);
    qs('#rucaApplyLocation')?.addEventListener('click', saveLocation);
    if(document.body.dataset.rucaThemeStorageReady !== 'true'){
      document.body.dataset.rucaThemeStorageReady = 'true';
      window.addEventListener('storage', event=>{
        if(event.key !== 'rucaTheme') return;
        let next = {};
        try{ next = JSON.parse(event.newValue || '{}') || {}; }catch(err){ next = {}; }
        applyTheme(normalizeTheme(next), true);
      });
    }
    window.RUCA_THEME_ENGINE = Object.freeze({
      tokens:PASS50_THEME_TOKENS,
      groups:PASS50_THEME_GROUPS,
      providers:PASS50_PALETTE_PROVIDERS,
      defaults:PASS50_ENGINE_DEFAULT_PALETTE,
      resolve:(theme={}, temporaryState={})=>resolvePaletteLayers(theme, temporaryState),
      preview:(temporaryState={})=>applyTheme(state.theme || normalizeTheme({}), false, temporaryState),
      clearPreview:()=>applyTheme(state.theme || normalizeTheme({}), false),
      snapshot:()=>state.theme ? JSON.parse(JSON.stringify(state.theme)) : null
    });
  }

  function installControlRealmNavigation(){
    const tabs = qsa('#page-control .control-realm-tab[data-control-realm]');
    if(!tabs.length) return;
    tabs.forEach(tab=>{
      if(tab.dataset.rucaRealmReady === 'true') return;
      tab.dataset.rucaRealmReady = 'true';
      tab.addEventListener('click', ()=>setControlRealm(tab.dataset.controlRealm, false));
    });
    setControlRealm('environment', false);
    window.RUCA_CONTROL_REALMS = Object.freeze({
      set:realm=>setControlRealm(realm, false),
      current:()=>document.body.dataset.rucaControlRealm || 'environment'
    });
  }

  function setControlRealm(requestedRealm, focusContent=false){
    const allowed = ['environment','audio','display','input','system','profile'];
    const realm = allowed.includes(requestedRealm) ? requestedRealm : 'environment';
    const tabs = qsa('#page-control .control-realm-tab[data-control-realm]');
    const core = qs('#page-control .control-core[data-control-realm-panel="profile"]');
    const cards = qs('#page-control .control-cards');
    const categoryPanels = qsa('#page-control .control-cards [data-control-realm-panel]');

    tabs.forEach(tab=>{
      const active = tab.dataset.controlRealm === realm;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
    });

    const profileActive = realm === 'profile';
    if(core){
      core.hidden = !profileActive;
      core.setAttribute('aria-hidden', profileActive ? 'false' : 'true');
    }
    if(cards){
      cards.hidden = profileActive;
      cards.setAttribute('aria-hidden', profileActive ? 'true' : 'false');
    }
    categoryPanels.forEach(panel=>{
      const visible = !profileActive && panel.dataset.controlRealmPanel === realm;
      panel.hidden = !visible;
      panel.setAttribute('aria-hidden', visible ? 'false' : 'true');
      if(panel instanceof HTMLDetailsElement) panel.open = false;
    });

    document.body.dataset.rucaControlRealm = realm;
    if(focusContent){
      const target = profileActive
        ? core?.querySelector('button,select,input')
        : cards?.querySelector('[data-control-realm-panel]:not([hidden]) summary');
      target?.focus({preventScroll:true});
    }
    markFocusableControls();
    return realm;
  }

  function installCustomThemeProfileControls(){
    const slotSelect = qs('#rucaCustomProfileSlot');
    if(!slotSelect || slotSelect.dataset.rucaProfileReady === 'true') return;
    slotSelect.dataset.rucaProfileReady = 'true';
    const activeSlot = Number(String(document.body.dataset.rucaPreset || '').match(/^custom-(\d+)$/)?.[1] || 0);
    if(activeSlot >= 1 && activeSlot <= CUSTOM_THEME_PROFILE_SLOT_COUNT) slotSelect.value = String(activeSlot);
    slotSelect.addEventListener('change', ()=>syncCustomThemeProfileControls());
    qs('#rucaSaveCustomProfile')?.addEventListener('click', saveSelectedCustomThemeProfile);
    qs('#rucaLoadCustomProfile')?.addEventListener('click', loadSelectedCustomThemeProfile);
    qs('#rucaClearCustomProfile')?.addEventListener('click', clearSelectedCustomThemeProfile);
    syncCustomThemeProfileControls();
  }

  function installAtmosphereEngine(){
    if(document.body.dataset.pass14AtmosphereReady === 'true') return;
    document.body.dataset.pass14AtmosphereReady = 'true';
    populateSportsRealms();
    installAudioControls();
    installControllerControls();
    const stored = readTeamAtmosphere();
    if(stored?.league && stored?.team && stored?.preset){
      setSportsControls(stored.league, stored.team, stored.preset);
      updateTeamPreview(stored);
    }else{
      setSportsControls('NBA', 'Knicks', 'home');
      updateTeamPreview(teamPayload('NBA', 'Knicks', 'home'));
    }
    window.RUCA_PASS14_applyTeamAtmosphere = (league='NBA', name='Knicks', preset='home') => {
      setSportsControls(league, name, preset);
      return applySelectedTeamAtmosphere();
    };
  }

  function populateSportsRealms(){
    const leagueSelect = qs('#rucaLeagueSelect');
    const teamSelect = qs('#rucaTeamSelect');
    const presetSelect = qs('#rucaTeamPresetSelect');
    if(!leagueSelect || !teamSelect || !presetSelect) return;
    leagueSelect.innerHTML = Object.keys(PASS14_TEAM_REALMS).map(league=>`<option value="${escapeHtml(league)}">${escapeHtml(league)}</option>`).join('');
    leagueSelect.addEventListener('change', ()=>{
      fillTeamSelect(leagueSelect.value);
      updateTeamPreview(teamPayload(leagueSelect.value, teamSelect.value, presetSelect.value));
    });
    teamSelect.addEventListener('change', ()=>updateTeamPreview(teamPayload(leagueSelect.value, teamSelect.value, presetSelect.value)));
    presetSelect.addEventListener('change', ()=>updateTeamPreview(teamPayload(leagueSelect.value, teamSelect.value, presetSelect.value)));
    qs('#rucaApplyTeamAtmosphere')?.addEventListener('click', applySelectedTeamAtmosphere);
    fillTeamSelect(leagueSelect.value || 'NBA');
  }

  function fillTeamSelect(league){
    const teamSelect = qs('#rucaTeamSelect');
    if(!teamSelect) return;
    const teams = PASS14_TEAM_REALMS[league] || PASS14_TEAM_REALMS.NBA;
    teamSelect.innerHTML = Object.keys(teams).map(name=>`<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('');
  }

  function setSportsControls(league, name, preset){
    const leagueSelect = qs('#rucaLeagueSelect');
    const teamSelect = qs('#rucaTeamSelect');
    const presetSelect = qs('#rucaTeamPresetSelect');
    if(leagueSelect) leagueSelect.value = PASS14_TEAM_REALMS[league] ? league : 'NBA';
    fillTeamSelect(leagueSelect?.value || league || 'NBA');
    if(teamSelect){
      const selectedLeague = leagueSelect?.value || league || 'NBA';
      teamSelect.value = PASS14_TEAM_REALMS[selectedLeague]?.[name] ? name : Object.keys(PASS14_TEAM_REALMS[selectedLeague] || PASS14_TEAM_REALMS.NBA)[0];
    }
    if(presetSelect) presetSelect.value = preset || 'home';
  }

  function applySelectedTeamAtmosphere(){
    const league = qs('#rucaLeagueSelect')?.value || 'NBA';
    const name = qs('#rucaTeamSelect')?.value || 'Knicks';
    const preset = qs('#rucaTeamPresetSelect')?.value || 'home';
    const payload = teamPayload(league, name, preset);
    if(!payload) return null;
    localStorage.setItem('rucaTeamAtmosphere', JSON.stringify(payload));
    const presetId = `sports-${payload.slug}-${preset}`;
    const theme = normalizeTheme({
      ...readThemeControls(),
      preset:'team',
      starPreset:`team-${payload.slug}-${preset}`,
      name:`${payload.team} ${payload.presetLabel}`,
      paletteState:{
        mode:'preset',
        preset:presetId,
        provider:'sports',
        presetPalette:payload.theme.palette,
        groupOverrides:{},
        tokenOverrides:{}
      },
      teamLeague: payload.league,
      teamName: payload.team,
      teamSlug: payload.slug,
      teamInitials: payload.initials,
      teamPrimary: payload.primary,
      teamSecondary: payload.secondary,
      teamHighlight: payload.highlight
    });
    localStorage.removeItem(ACTIVE_THEME_PROFILE_STORAGE_KEY);
    localStorage.setItem('rucaTheme', JSON.stringify(theme));
    applyTheme(theme, true);
    updateTeamPreview(payload);
    if((document.body.dataset.world || 'home') === 'live' && state.lastLane === 'sports') renderSportsLane(state.sports || {});
    setRailCard('sports', payload.team, `${payload.presetLabel} atmosphere // source active when bridge answers`);
    window.RUCA_AUDIO?.cue('theme-apply');
    return payload;
  }

  function teamPayload(league, name, preset='home'){
    const teamData = PASS14_TEAM_REALMS[league]?.[name];
    if(!teamData) return null;
    const key = teamData.presets[preset] ? preset : 'home';
    const theme = teamData.presets[key];
    return {
      league,
      team: name,
      initials: teamData.initials,
      primary: teamData.primary,
      secondary: teamData.secondary,
      highlight: teamData.highlight,
      preset:key,
      presetLabel:theme.label,
      slug: slugify(`${league}-${name}`),
      theme
    };
  }

  function updateTeamPreview(payload){
    if(!payload) return;
    const badge = qs('#rucaTeamPreviewBadge');
    const name = qs('#rucaTeamPreviewName');
    const colors = qs('#rucaTeamPreviewColors');
    const swatches = qs('#rucaTeamPreviewSwatches');
    if(badge){
      badge.textContent = payload.initials;
      badge.style.setProperty('--team-primary', payload.primary);
      badge.style.setProperty('--team-secondary', payload.secondary);
    }
    if(name) name.textContent = `${payload.league} // ${payload.team} // ${payload.presetLabel}`;
    if(colors) colors.textContent = `${payload.primary} / ${payload.secondary} / ${payload.highlight}`;
    if(swatches){
      swatches.innerHTML = [payload.primary, payload.secondary, payload.highlight].map(color=>`<span style="--swatch:${escapeHtml(color)}"></span>`).join('');
    }
  }

  function readTeamAtmosphere(){
    try{
      const stored = JSON.parse(localStorage.getItem('rucaTeamAtmosphere') || '{}') || {};
      if(stored.league && stored.team && stored.preset) return stored;
    }catch(err){}
    return null;
  }

  function slugify(value){
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') || 'team';
  }

  function installAudioControls(){
    const enabled = qs('#rucaAudioEnabled');
    const volume = qs('#rucaCommandVolume');
    const stored = readAudioSettings();
    if(enabled) enabled.checked = !!stored.enabled;
    if(volume) volume.value = String(stored.volume);
    applyAudioSettings(stored);
    enabled?.addEventListener('change', ()=>{
      const cfg = readAudioSettings();
      const nextVolume = enabled.checked && Number(volume?.value || 0) <= 0
        ? cfg.lastNonzeroVolume
        : Number(volume?.value ?? cfg.volume);
      applyAudioSettings({...cfg, enabled:enabled.checked, volume:nextVolume});
      window.RUCA_AUDIO?.cue(enabled.checked ? 'confirm' : 'muted', {force:enabled.checked});
    });
    volume?.addEventListener('input', ()=>{
      const row = volume.closest('.slider-row');
      const readout = row?.querySelector('b');
      if(readout) readout.textContent = volume.value;
      applyAudioSettings({enabled:!!enabled?.checked, volume:Number(volume.value || stored.volume)});
    });
  }

  function installPass17C2CFooter(){
    if(document.body.dataset.pass17c2cFooter === 'true') return;
    document.body.dataset.pass17c2cFooter = 'true';
    const uptime = qs('#uptime');
    const homeAudioToggle = qs('#rucaHomeAudioToggle');
    let startedAt = Date.now();
    try{
      const stored = Number(sessionStorage.getItem('rucaCommandShellStartedAt'));
      if(Number.isFinite(stored) && stored > 0 && stored <= Date.now()) startedAt = stored;
      else sessionStorage.setItem('rucaCommandShellStartedAt', String(startedAt));
    }catch(err){}

    const renderUptime = ()=>{
      if(!uptime) return;
      const total = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
      const days = Math.floor(total / 86400);
      const hours = Math.floor((total % 86400) / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const seconds = total % 60;
      uptime.textContent = `${days}D ${String(hours).padStart(2,'0')}H ${String(minutes).padStart(2,'0')}M ${String(seconds).padStart(2,'0')}S`;
      uptime.dataset.uptimeSeconds = String(total);
    };

    renderUptime();
    if(window.RUCA_PASS17C2C_UPTIME_TIMER) clearInterval(window.RUCA_PASS17C2C_UPTIME_TIMER);
    window.RUCA_PASS17C2C_UPTIME_TIMER = window.setInterval(renderUptime, 1000);

    homeAudioToggle?.addEventListener('click', ()=>{
      const cfg = readAudioSettings();
      const nextEnabled = !cfg.enabled;
      const next = {
        ...cfg,
        enabled:nextEnabled,
        volume:nextEnabled && cfg.volume <= 0 ? cfg.lastNonzeroVolume : cfg.volume
      };
      applyAudioSettings(next);
      window.RUCA_AUDIO?.cue(next.enabled ? 'confirm' : 'muted', {force:next.enabled});
      requestSemanticPulse('command-ack', {
        target:'#rucaHomeAudioToggle',
        command:'audio-toggle',
        message:next.enabled ? 'RUCA audio enabled.' : 'RUCA audio muted.'
      });
    });

    syncAudioControls(readAudioSettings());
  }

  function readAudioSettings(){
    try{
      const stored = JSON.parse(localStorage.getItem('rucaAudioSettings') || '{}') || {};
      const volume = Math.max(0, Math.min(100, Number(stored.volume ?? 25)));
      const lastNonzeroVolume = Math.max(1, Math.min(100, Number(stored.lastNonzeroVolume ?? (volume > 0 ? volume : 25))));
      return {enabled:stored.enabled === true, volume, lastNonzeroVolume};
    }catch(err){
      return {enabled:false, volume:25, lastNonzeroVolume:25};
    }
  }

  function applyAudioSettings(settings){
    const previous = readAudioSettings();
    const volume = Math.max(0, Math.min(100, Number(settings.volume ?? previous.volume)));
    const lastNonzeroVolume = volume > 0
      ? volume
      : Math.max(1, Math.min(100, Number(settings.lastNonzeroVolume ?? previous.lastNonzeroVolume)));
    const cfg = {enabled:settings.enabled === true, volume, lastNonzeroVolume};
    localStorage.setItem('rucaAudioSettings', JSON.stringify(cfg));
    state.audio.enabled = cfg.enabled;
    state.audio.volume = cfg.volume;
    syncAudioControls(cfg);
    if(window.RUCA_AUDIO){
      window.RUCA_AUDIO.setVolume(cfg.volume);
      window.RUCA_AUDIO.setMuted(!cfg.enabled);
    }
    document.documentElement.dataset.rucaAudioHooks = cfg.enabled ? 'enabled' : 'muted';
    document.body.classList.toggle('ruca-audio-muted', !cfg.enabled || cfg.volume <= 0);
    root.style.setProperty('--ruca-audio-volume', `${cfg.volume}%`);
    updateAudioReadout();
  }

  function syncAudioControls(cfg=readAudioSettings()){
    const commandVolume = qs('#rucaCommandVolume');
    const enabled = qs('#rucaAudioEnabled');
    [commandVolume].forEach(input=>{
      if(!input) return;
      input.value = String(cfg.volume);
      const readout = input.closest('.slider-row')?.querySelector('b');
      if(readout) readout.textContent = String(cfg.volume);
    });
    if(enabled) enabled.checked = !!cfg.enabled;
    const mute = qs('#rucaMuteButton');
    if(mute){
      mute.textContent = cfg.enabled ? 'MUTE AUDIO' : 'AUDIO MUTED';
      mute.setAttribute('aria-pressed', cfg.enabled ? 'false' : 'true');
    }
    const homeAudioToggle = qs('#rucaHomeAudioToggle');
    if(homeAudioToggle){
      homeAudioToggle.classList.toggle('is-muted', !cfg.enabled);
      homeAudioToggle.setAttribute('aria-pressed', cfg.enabled ? 'false' : 'true');
      homeAudioToggle.setAttribute('aria-label', cfg.enabled ? 'Mute RUCA audio' : 'Enable RUCA audio');
      homeAudioToggle.title = cfg.enabled ? 'Mute RUCA audio' : 'Enable RUCA audio';
    }
  }

  function installPass16CommandControls(){
    if(document.body.dataset.pass16CommandReady === 'true') return;
    document.body.dataset.pass16CommandReady = 'true';
    const commandVolume = qs('#rucaCommandVolume');
    const mute = qs('#rucaMuteButton');
    const brightness = qs('#rucaBrightnessSlider');
    const dimNight = qs('#rucaDimNight');
    const power = qs('#rucaPowerButton');
    const settings = qs('#rucaSettingsButton');

    applyAudioSettings(readAudioSettings());
    applyCockpitBrightness(Number(localStorage.getItem('rucaCockpitBrightness') || brightness?.value || 62), true);
    applyCockpitStandby(localStorage.getItem('rucaCockpitStandby') === 'true', true);
    applyDimNight(localStorage.getItem('rucaLoungeDimNight') === 'true', true, false);

    commandVolume?.addEventListener('input', ()=>{
      const cfg = readAudioSettings();
      const next = {enabled:cfg.enabled, volume:Number(commandVolume.value || cfg.volume)};
      applyAudioSettings(next);
      writeCommandStatus('VOLUME SET', `RUCA cue volume set to ${next.volume}%.`);
    });

    mute?.addEventListener('click', ()=>{
      const cfg = readAudioSettings();
      const nextEnabled = !cfg.enabled;
      const next = {
        ...cfg,
        enabled:nextEnabled,
        volume:nextEnabled && cfg.volume <= 0 ? cfg.lastNonzeroVolume : cfg.volume
      };
      applyAudioSettings(next);
      writeCommandStatus(next.enabled ? 'AUDIO ENABLED' : 'AUDIO MUTED', next.enabled ? 'RUCA sound cues are active after user input.' : 'RUCA sound cues are muted.');
      window.RUCA_AUDIO?.cue(next.enabled ? 'confirm' : 'muted', {force:next.enabled});
    });

    brightness?.addEventListener('input', ()=>{
      applyCockpitBrightness(Number(brightness.value || 62));
      writeCommandStatus('BRIGHTNESS SET', `Cockpit brightness set to ${brightness.value}.`);
    });

    dimNight?.addEventListener('change', ()=>{
      applyDimNight(dimNight.checked);
      writeCommandStatus(dimNight.checked ? 'DIM NIGHT' : 'DISPLAY RESTORED', dimNight.checked ? 'Lounge illumination reduced for night viewing.' : 'Cockpit brightness restored.');
    });

    power?.addEventListener('click', ()=>{
      applyCockpitStandby(!state.command.standby);
      window.RUCA_AUDIO?.cue(state.command.standby ? 'drawer-close' : 'confirm', {force:!state.command.standby});
    });

    settings?.addEventListener('click', ()=>{
      writeCommandStatus('SETTINGS HANDOFF', 'Windows settings handoff requested. Browser may ask for permission.');
      window.RUCA_AUDIO?.cue('confirm');
      try{
        window.RUCA_PUBLIC_DEMO.notice('Settings preview — this demo does not change your operating system.');
      }catch(err){
        writeCommandStatus('SETTINGS BLOCKED', err.message || 'Settings handoff was blocked by the browser.');
      }
    });
  }

  function applyCockpitBrightness(value, quiet=false, persist=true){
    const level = Math.max(20, Math.min(100, Number(value || 62)));
    state.command.brightness = level;
    if(persist) localStorage.setItem('rucaCockpitBrightness', String(level));
    root.style.setProperty('--ruca-brightness-level', String(level));
    root.style.setProperty('--ruca-brightness-filter', (0.88 + level * 0.0032).toFixed(3));
    const input = qs('#rucaBrightnessSlider');
    if(input){
      input.value = String(level);
      syncRangeProgress(input);
      const readout = input.closest('.slider-row')?.querySelector('b');
      if(readout) readout.textContent = String(level);
    }
    if(!quiet) window.RUCA_AUDIO?.cue('focus');
  }

  function applyDimNight(enabled, quiet=false, persist=true){
    const next = !!enabled;
    if(next && !state.command.dimNight) state.command.preDimBrightness = state.command.brightness;
    state.command.dimNight = next;
    document.body.classList.toggle('ruca-dim-night', next);
    document.documentElement.dataset.rucaDimNight = next ? 'on' : 'off';
    const toggle = qs('#rucaDimNight');
    if(toggle) toggle.checked = next;
    if(persist) localStorage.setItem('rucaLoungeDimNight', next ? 'true' : 'false');
    if(next){
      const dimLevel = Number(document.body.dataset.rucaDimBrightness || 34);
      applyCockpitBrightness(dimLevel, true, persist);
    }else if(!quiet){
      applyCockpitBrightness(state.command.preDimBrightness || 62, true, persist);
    }
    if(!quiet) window.RUCA_AUDIO?.cue(next ? 'drawer-close' : 'confirm');
  }

  function applyCockpitStandby(enabled, quiet=false){
    state.command.standby = !!enabled;
    localStorage.setItem('rucaCockpitStandby', enabled ? 'true' : 'false');
    document.body.classList.toggle('ruca-standby', !!enabled);
    const power = qs('#rucaPowerButton');
    if(power){
      power.textContent = enabled ? 'RESUME POWER' : 'POWER STANDBY';
      power.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    }
    if(enabled){
      applyAudioSettings({...readAudioSettings(), enabled:false});
      writeCommandStatus('STANDBY', 'Local cockpit standby is active. Telemetry and routes remain untouched.');
    }else{
      writeCommandStatus('READY', 'Local cockpit controls are online.');
    }
    if(!quiet) markFocusableControls();
  }

  function writeCommandStatus(title, detail){
    state.command.lastStatus = title || 'READY';
    const stateEl = qs('#rucaCommandControlState');
    const detailEl = qs('#rucaCommandControlReadout');
    if(stateEl) stateEl.textContent = state.command.lastStatus;
    if(detailEl) detailEl.textContent = detail || 'Local cockpit controls are online.';
  }

  function installControllerControls(){
    const toggle = qs('#rucaControllerMode');
    const strength = qs('#rucaFocusStrength');
    const test = qs('#rucaTestFocus');
    const storedControllerMode = localStorage.getItem('rucaControllerMode');
    const enabled = storedControllerMode === null ? true : storedControllerMode === 'true';
    const storedStrength = Math.max(1, Math.min(100, Number(localStorage.getItem('rucaFocusStrength') || 70)));
    if(toggle) toggle.checked = enabled;
    if(strength){
      strength.value = String(storedStrength);
      strength.closest('.slider-row')?.querySelector('b') && (strength.closest('.slider-row').querySelector('b').textContent = String(storedStrength));
      state.controller.focusStrength = storedStrength;
    }
    setControllerMode(enabled);
    toggle?.addEventListener('change', ()=>{
      localStorage.setItem('rucaControllerMode', toggle.checked ? 'true' : 'false');
      setControllerMode(toggle.checked);
      window.RUCA_AUDIO?.cue(toggle.checked ? 'confirm' : 'drawer-close');
    });
    strength?.addEventListener('input', ()=>{
      const value = Math.max(1, Math.min(100, Number(strength.value || 70)));
      state.controller.focusStrength = value;
      localStorage.setItem('rucaFocusStrength', String(value));
      const readout = strength.closest('.slider-row')?.querySelector('b');
      if(readout) readout.textContent = String(value);
      root.style.setProperty('--ruca-focus-strength', String(value));
      updateControllerReadout();
    });
    test?.addEventListener('click', ()=>{
      if(!state.controller.enabled){
        if(toggle) toggle.checked = true;
        localStorage.setItem('rucaControllerMode', 'true');
        setControllerMode(true);
      }
      focusFirstMeaningful();
      window.RUCA_AUDIO?.cue('confirm');
    });
  }

  function setControllerMode(enabled){
    state.controller.enabled = !!enabled;
    document.body.classList.toggle('controller-mode', !!enabled);
    document.documentElement.dataset.rucaControllerMode = enabled ? 'enabled' : 'off';
    root.style.setProperty('--ruca-focus-strength', String(state.controller.focusStrength || 70));
    if(enabled){
      markFocusableControls();
      ensureAnalogCursor();
      focusFirstMeaningful();
      startGamepadLoop();
    }else{
      if(state.recovery.monitorEnabled) startGamepadLoop();
      else stopGamepadLoop();
      qsa('.ruca-controller-focus').forEach(el=>el.classList.remove('ruca-controller-focus'));
      setAnalogHover(null);
      if(state.controller.cursorEl) state.controller.cursorEl.classList.remove('is-active');
    }
    updateControllerReadout();
  }

  function activeMediaDeckController(){
    const adapter = window.RUCA_MEDIA_DECK_CONTROLLER;
    if(!adapter || typeof adapter.isActive !== 'function' || !adapter.isActive()) return null;
    return adapter;
  }

  function handleMediaDeckDirection(direction, options={}){
    const adapter = activeMediaDeckController();
    if(!adapter || typeof adapter.handleDirection !== 'function') return false;
    return adapter.handleDirection(direction, options) === true;
  }

  function handleMediaDeckButton(name, options={}){
    const adapter = activeMediaDeckController();
    if(!adapter || typeof adapter.handleButton !== 'function') return false;
    return adapter.handleButton(name, options) === true;
  }

  function installControllerFocusMode(){
    if(document.body.dataset.pass14FocusReady === 'true') return;
    document.body.dataset.pass14FocusReady = 'true';
    markFocusableControls();
    document.addEventListener('focusin', event=>{
      qsa('.ruca-controller-focus').forEach(el=>el.classList.remove('ruca-controller-focus'));
      const target = event.target.closest?.('.gamepad-focusable,button,a,input,select,textarea,summary,[tabindex]');
      if(target){
        if(!isRoomFocusable(target)){
          event.preventDefault?.();
          target.blur?.();
          window.setTimeout(()=>focusFirstMeaningful(), 0);
          return;
        }
        target.classList.add('ruca-controller-focus');
        window.RUCA_CONTINUITY?.rememberFocus?.(target, document.body.dataset.world || 'home');
        if(state.controller.enabled && target.closest('#detailDrawer.open,#rucaCommandSearch')) target.scrollIntoView({block:'nearest', inline:'nearest', behavior:'smooth'});
        window.RUCA_AUDIO?.cue('focus');
      }
    });
    document.addEventListener('pointerover', event=>{
      const target = event.target.closest?.('.gamepad-focusable,button,a,[data-source-retry],[data-source-configure]');
      if(target && state.audio.enabled){
        const now = Date.now();
        if(now - state.controller.lastHoverCue > 140){
          state.controller.lastHoverCue = now;
          window.RUCA_AUDIO?.cue('hover');
        }
      }
    }, {capture:true});
    document.addEventListener('click', event=>{
      if(event.target.closest?.('.nav-btn,.core-return-anchor,.lane-btn,.world-card,.sensor-btn,.bench-btn,.scan-btn,.app-card,.app-orbit-node,.launch-node,.command-filter-btn,.command-favorite-toggle,.theme-preset,.star-preset,.ruca-restore-btn,.ruca-card-actions button,.source-test-row button,.source-status-card button')){
        markFocusableControls();
      }
    }, {capture:true});
    document.addEventListener('keydown', event=>{
      if(event.defaultPrevented) return;
      const key = event.key;
      const active = document.activeElement;
      const inTextField = active && active.matches?.('textarea,select,input:not([type="range"]):not([type="button"]):not([type="checkbox"]):not([type="radio"])');
      if((event.ctrlKey || event.metaKey) && event.code === 'Space'){
        event.preventDefault();
        openCommandSearch();
        return;
      }
      const controllerBackKey = (key === 'b' || key === 'B') && !inTextField && !isCommandSearchOpen();
      if(controllerBackKey){
        event.preventDefault();
        setAnalogHover(null);
        if(handleMediaDeckButton('b', {source:'keyboard'})) return;
        if(window.RUCA_CONTINUITY?.back) window.RUCA_CONTINUITY.back({source:'keyboard-b'});
        else if(!closeTopLayer()) focusFirstMeaningful();
        return;
      }
      if((key === 'y' || key === 'Y') && !inTextField && handleMediaDeckButton('y', {source:'keyboard'})){
        event.preventDefault();
        return;
      }
      if(!document.body.classList.contains('controller-mode')) return;
      if(inTextField) return;
      const directionMap = {ArrowRight:'right', d:'right', D:'right', ArrowDown:'down', s:'down', S:'down', ArrowLeft:'left', a:'left', A:'left', ArrowUp:'up', w:'up', W:'up'};
      if(directionMap[key]){
        event.preventDefault();
        if(isDuplicateGamepadNavigationKey(directionMap[key])) return;
        if(handleMediaDeckDirection(directionMap[key], {heldMs:0, source:'keyboard'})) return;
        if(handlePass16FPlayDirection(directionMap[key], 'keyboard')) return;
        moveFocus(directionMap[key]);
      }
      if((key === 'Enter' || key === ' ') && active && active.matches('.gamepad-focusable,[tabindex="0"]')){
        event.preventDefault();
        if(handleMediaDeckButton('a', {source:'keyboard'})) return;
        activateFocusedTarget(active, 'keyboard');
      }
    });
    document.addEventListener('ruca:continuity-focus-request', event=>{
      if(event.detail?.restored) return;
      focusFirstMeaningful(event.detail?.world || document.body.dataset.world || 'home');
    });
    document.addEventListener('ruca:continuity-change', event=>{
      const type = String(event.detail?.type || '');
      if(type.startsWith('transition-') || type === 'route-changed') resetControllerDigitalRepeat(type, true);
    });
    window.addEventListener('gamepadconnected', event=>{
      state.controller.gamepadName = event.gamepad?.id || 'Gamepad connected';
      updateControllerReadout();
    });
    window.addEventListener('gamepaddisconnected', ()=>{
      resetControllerDigitalRepeat('controller-disconnect', true);
      state.controller.gamepadName = '';
      state.controller.analogActive = false;
      setAnalogHover(null);
      if(state.controller.cursorEl) state.controller.cursorEl.classList.remove('is-active');
      updateControllerReadout();
    });
    window.addEventListener('blur', ()=>resetControllerDigitalRepeat('window-blur', true));
  }

  function markFocusableControls(){
    const managed = new Set([
      ...qsa('button,a,input,select,textarea,summary,[tabindex]'),
        ...qsa('.nav-btn,.core-return-anchor,.lane-btn,.world-card,.sensor-btn,.bench-btn,.scan-btn,.app-card,.app-orbit-node,.launch-node,.theme-preset,.star-preset,.ruca-restore-btn,.ruca-command-button,.ruca-card-actions button,.source-test-row button,.source-status-card button,.audio-test-grid button,.pass15b-drawer-actions button,.command-search-result,#page-control input,#page-control select,summary')
    ]);
    managed.forEach(el=>{
      if(el.closest('#rucaCosmicContinuum')){
        el.classList.remove('gamepad-focusable','ruca-controller-focus','ruca-analog-hover');
        if(el.getAttribute('tabindex') !== '-1') el.setAttribute('tabindex','-1');
        return;
      }
      if(!el.classList.contains('gamepad-focusable')) el.classList.add('gamepad-focusable');
      if(el.dataset.rucaViewportManaged !== 'true') el.dataset.rucaViewportManaged = 'true';
      ensureActionContract(el);
      const tabIndex = isRoomFocusable(el) ? '0' : '-1';
      if(el.getAttribute('tabindex') !== tabIndex) el.setAttribute('tabindex', tabIndex);
    });
  }

  function focusableControls(){
    markFocusableControls();
    return qsa('button,a,input,select,textarea,summary,[tabindex="0"]')
      .filter(el=>isRoomFocusable(el));
  }

  function installPass16GWorldViewportGuard(){
    if(document.body.dataset.pass16gViewportReady === 'true') return;
    document.body.dataset.pass16gViewportReady = 'true';
    let pending = 0;
    const mutationRequiresRefresh = mutations=>mutations.some(mutation=>{
      if(mutation.type === 'attributes'){
        if(mutation.attributeName === 'data-world' && mutation.target === document.body) return true;
        if(mutation.attributeName === 'aria-hidden') return true;
        if(mutation.attributeName === 'class'){
          return mutation.target.matches?.('.page,#detailDrawer,#rucaCommandSearch,#rucaRecoveryOverlay');
        }
        return false;
      }
      if(mutation.type !== 'childList') return false;
      return [...mutation.addedNodes,...mutation.removedNodes].some(node=>{
        if(node.nodeType !== Node.ELEMENT_NODE) return false;
        return node.matches?.(CONTROLLER_INTERACTIVE_SELECTOR)
          || !!node.querySelector?.(CONTROLLER_INTERACTIVE_SELECTOR);
      });
    });
    const refresh = mutations=>{
      if(Array.isArray(mutations) && !mutationRequiresRefresh(mutations)) return;
      if(pending) return;
      pending = requestAnimationFrame(()=>{
        pending = 0;
        markFocusableControls();
        const active = document.activeElement;
        if(active && active !== document.body && !isRoomFocusable(active)) focusFirstMeaningful();
      });
    };
    new MutationObserver(refresh).observe(document.body, {
      attributes:true,
      attributeFilter:['class','data-world','aria-hidden'],
      childList:true,
      subtree:true
    });
    window.addEventListener('resize', refresh, {passive:true});
    window.addEventListener('scroll', refresh, {passive:true});
    qsa('.stage,.page,.live-grid,.diag-shell,.control-layout,.ruca-live-grid,.control-cards,.rapid-lab').forEach(el=>{
      el.addEventListener('scroll', refresh, {passive:true});
    });
    refresh();
  }

  function isRoomFocusable(el){
    if(!el || el.disabled) return false;
    const openRecovery = qs('#rucaRecoveryOverlay[aria-hidden="false"]');
    if(openRecovery && !el.closest('#rucaRecoveryOverlay')) return false;
    const openSearch = qs('#rucaCommandSearch[aria-hidden="false"]');
    if(openSearch && !el.closest('#rucaCommandSearch')) return false;
    const openDrawer = qs('#detailDrawer.open[aria-hidden="false"]');
    if(openDrawer && !el.closest('#detailDrawer')) return false;
    const recovery = el.closest('#rucaRecoveryOverlay');
    if(recovery && recovery.getAttribute('aria-hidden') !== 'false') return false;
    const drawer = el.closest('#detailDrawer');
    if(drawer && (!drawer.classList.contains('open') || drawer.getAttribute('aria-hidden') === 'true')) return false;
    const search = el.closest('#rucaCommandSearch');
    if(search && search.getAttribute('aria-hidden') !== 'false') return false;
    if(el.closest('.world-nav') && !el.closest('.top-shell')) return false;
    const page = el.closest('.page');
    if(page && !page.classList.contains('active')) return false;
    const style = getComputedStyle(el);
    if(style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) return false;
    const rect = el.getBoundingClientRect();
    if(rect.width <= 0 || rect.height <= 0) return false;
    const timelineGroup = el.matches?.('[data-machine-group]') && el.closest('#machineTimelineList');
    if(!timelineGroup && (rect.bottom <= 0 || rect.top >= window.innerHeight || rect.right <= 0 || rect.left >= window.innerWidth)) return false;
    if(!timelineGroup && isClippedByRoomAncestor(el, rect)) return false;
    const room = page || el.closest('.top-shell,.intelligence-ribbon,.live-rail,.machine-footer,.core-return-anchor,.detail-drawer,.ruca-command-search,.ruca-recovery-overlay');
    if(room && !timelineGroup){
      const roomRect = room.getBoundingClientRect();
      if(rect.bottom < roomRect.top - 1 || rect.top > roomRect.bottom + 1 || rect.right < roomRect.left - 1 || rect.left > roomRect.right + 1) return false;
    }
    return true;
  }

  function isClippedByRoomAncestor(el, rect){
    let parent = el.parentElement;
    while(parent && parent !== document.body && parent !== document.documentElement){
      const style = getComputedStyle(parent);
      const clipsX = /(hidden|clip|auto|scroll)/.test(style.overflowX || style.overflow);
      const clipsY = /(hidden|clip|auto|scroll)/.test(style.overflowY || style.overflow);
      if(clipsX || clipsY){
        const parentRect = parent.getBoundingClientRect();
        if(clipsX && (rect.right > parentRect.right + 1 || rect.left < parentRect.left - 1)) return true;
        if(clipsY && (rect.bottom > parentRect.bottom + 1 || rect.top < parentRect.top - 1)) return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }

  function moveFocus(direction){
    const focusables = focusableControls();
    if(!focusables.length) return;
    const current = focusables.includes(document.activeElement) ? document.activeElement : null;
    if(!current){
      focusElement(focusables[0]);
      return;
    }
    const currentRect = current.getBoundingClientRect();
    const cx = currentRect.left + currentRect.width / 2;
    const cy = currentRect.top + currentRect.height / 2;
    const vectors = {right:[1,0], left:[-1,0], down:[0,1], up:[0,-1]};
    const [vx, vy] = vectors[direction] || [1,0];
    let best = null;
    let bestScore = Infinity;
    for(const el of focusables){
      if(el === current) continue;
      const rect = el.getBoundingClientRect();
      const ex = rect.left + rect.width / 2;
      const ey = rect.top + rect.height / 2;
      const dx = ex - cx;
      const dy = ey - cy;
      const forward = dx * vx + dy * vy;
      if(forward <= 4) continue;
      const sideways = Math.abs(dx * vy - dy * vx);
      const score = forward + sideways * 2.35;
      if(score < bestScore){
        best = el;
        bestScore = score;
      }
    }
    if(!best){
      const index = focusables.indexOf(current);
      const delta = (direction === 'left' || direction === 'up') ? -1 : 1;
      best = focusables[(index + delta + focusables.length) % focusables.length];
    }
    focusElement(best);
    window.RUCA_AUDIO?.cue('focus');
  }

  function focusElement(el){
    if(!el) return;
    if(!isRoomFocusable(el)){
      const fallback = focusableControls()[0];
      if(fallback && fallback !== el) focusElement(fallback);
      return;
    }
    el.focus({preventScroll:true});
    if(el.closest('#detailDrawer.open,#rucaCommandSearch,#machineTimelineList')){
      const behavior = document.body.classList.contains('motion-low') ? 'auto' : 'smooth';
      el.scrollIntoView({block:'nearest', inline:'nearest', behavior});
    }
    qsa('.ruca-controller-focus').forEach(node=>node.classList.remove('ruca-controller-focus'));
    el.classList.add('ruca-controller-focus');
    syncAnalogCursorWithFocus(el);
  }

  function activationTarget(el){
    if(!el) return null;
    if(el.nodeType === Node.TEXT_NODE) el = el.parentElement;
    return el?.closest?.(CONTROLLER_INTERACTIVE_SELECTOR) || null;
  }

  function actionContractFor(target){
    if(!target) return {valid:false, action:'none', reason:'No focused target.'};
    if(target.disabled || target.getAttribute('aria-disabled') === 'true'){
      return {valid:false, action:target.dataset.rucaAction || 'disabled', reason:target.title || target.dataset.disabledReason || 'This command is unavailable.'};
    }
    const explicit = target.dataset.rucaAction;
    if(explicit) return {valid:true, action:explicit, reason:target.dataset.rucaActionContract || explicit};
    if(target.matches('input,select,textarea')) return {valid:true, action:'input-control', reason:'Native RUCA input control'};
    if(target.tagName === 'SUMMARY') return {valid:true, action:'toggle-section', reason:'Toggle RUCA section'};
    if(target.matches('a[href]')) return {valid:true, action:'native-link', reason:'Verified link handoff'};
    if(target.matches('button,[role="button"],[tabindex="0"]')) return {valid:true, action:'native-control', reason:target.dataset.rucaActionContract || 'Existing RUCA control handler'};
    return {valid:false, action:'none', reason:'Focused element has no action contract.'};
  }

  function ensureActionContract(target){
    if(!target || target.dataset.rucaActionContract) return;
    let contract = '';
    if(target.matches('.nav-btn')) contract = `Route to ${(target.dataset.page || 'RUCA world').toUpperCase()}`;
    else if(target.matches('.core-return-anchor')) contract = 'Return to RUCA HOME';
    else if(target.matches('.complication')) contract = `Open ${target.dataset.component || 'system'} Diagnostics`;
    else if(target.matches('.lane-btn,[data-lane-jump]')) contract = `Open Live World ${(target.dataset.lane || target.dataset.laneJump || 'lane').toUpperCase()}`;
    else if(target.matches('.sensor-btn')) contract = `Open ${target.dataset.sensor || 'sensor'} diagnostic group`;
    else if(target.matches('.bench-btn,[data-bench]')) contract = `Run ${target.dataset.bench || 'selected'} benchmark action`;
    else if(target.matches('.theme-preset')) contract = 'Apply selected RUCA theme';
    else if(target.matches('input,select,textarea')) contract = 'Adjust RUCA-owned input';
    else if(target.tagName === 'SUMMARY') contract = 'Toggle RUCA control section';
    else if(target.matches('button,a,[role="button"],[tabindex="0"]')) contract = 'Existing RUCA control handler';
    if(contract) target.dataset.rucaActionContract = contract;
  }

  function writeActivationStatus(target, title, detail=''){
    state.activation.lastResult = {title, detail, at:Date.now()};
    const drawerStatus = qs('#pass19LaunchStatus');
    if(drawerStatus && (target?.closest?.('#detailDrawer') || target?.dataset?.commandId)){
      drawerStatus.textContent = detail ? `${title} // ${detail}` : title;
      drawerStatus.dataset.state = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return;
    }
    const searchHint = qs('.ruca-command-search[aria-hidden="false"] .ruca-command-search-hint');
    if(searchHint && target?.closest?.('#rucaCommandSearch')){
      searchHint.textContent = detail ? `${title} // ${detail}` : title;
      return;
    }
    writeCommandStatus(title, detail || 'RUCA command acknowledged.');
  }

  function installCanonicalActivation(){
    if(document.body.dataset.pass19ActivationReady === 'true') return;
    document.body.dataset.pass19ActivationReady = 'true';
    document.addEventListener('click', event=>{
      const target = activationTarget(event.target);
      if(!target) return;
      const inputSource = state.activation.synthetic
        ? state.activation.source
        : event.pointerType === 'touch' ? 'touch' : 'mouse';
      if(state.activation.synthetic){
        activateFocusedTarget(target, inputSource, {nativeEvent:true, dispatchExplicit:false});
        return;
      }
      if(target.dataset.rucaAction){
        event.preventDefault();
        event.stopImmediatePropagation();
        activateFocusedTarget(target, inputSource, {nativeEvent:true, dispatchExplicit:true});
        return;
      }
      activateFocusedTarget(target, inputSource, {nativeEvent:true, dispatchExplicit:false});
    }, {capture:true});
    window.activateFocusedTarget = activateFocusedTarget;
    window.RUCA_PASS19_ACTIVATION = Object.freeze({
      activate:activateFocusedTarget,
      contract:actionContractFor,
      last:()=>state.activation.lastResult
    });
  }

  async function activateFocusedTarget(target=document.activeElement, inputSource='keyboard', options={}){
    target = activationTarget(target) || target;
    const contract = actionContractFor(target);
    if(!contract.valid){
      writeActivationStatus(target, 'COMMAND UNAVAILABLE', contract.reason);
      window.RUCA_AUDIO?.cue('error');
      return false;
    }
    state.activation.lastTarget = target;
    state.activation.lastAt = Date.now();
    target.dataset.rucaLastInput = inputSource;
    if(target.matches?.('button,a,summary,[tabindex],input,select,textarea') && isRoomFocusable(target)) focusElement(target);
    if(target.dataset.rucaAction && (options.dispatchExplicit || !options.nativeEvent)){
      const result = await dispatchExplicitActivation(target, inputSource);
      window.RUCA_AUDIO?.cue(result ? 'activate' : 'error');
      return result;
    }
    if(options.nativeEvent){
      state.activation.lastResult = {title:'ACTIVATED', detail:contract.reason, source:inputSource, at:Date.now()};
      return true;
    }
    state.activation.synthetic = true;
    state.activation.source = inputSource;
    try{
      if(typeof target.click !== 'function') throw new Error('Target does not expose a native activation method.');
      target.click();
      state.activation.lastResult = {title:'ACTIVATED', detail:contract.reason, source:inputSource, at:Date.now()};
      window.RUCA_AUDIO?.cue('activate');
      return true;
    }catch(error){
      writeActivationStatus(target, 'ACTIVATION FAILED', error.message || 'The target rejected activation.');
      window.RUCA_AUDIO?.cue('error');
      return false;
    }finally{
      state.activation.synthetic = false;
      state.activation.source = '';
    }
  }

  async function dispatchExplicitActivation(target, inputSource){
    const action = target.dataset.rucaAction;
    if(action === 'play-detail'){
      const appId = target.dataset.appId || qs('#commandWheelAction')?.dataset.appId;
      const command = window.RUCA_PLAY_COMMANDS?.getById?.(appId);
      if(!command){
        writeActivationStatus(target, 'COMMAND UNAVAILABLE', 'The authoritative PLAY registry has not resolved this target.');
        return false;
      }
      window.RUCA_PLAY_COMMANDS.open(command);
      markFocusableControls();
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        focusElement(qs('#detailDrawer .pass19-command-action') || qs('#closeDrawer'));
      }));
      return true;
    }
    if(action === 'play-launch') return launchPlayCommand(target, inputSource);
    if(action === 'command-search-result') return activateCommandSearchResult(target, inputSource);
    if(action === 'virtual-key') return handleVirtualKey(target.dataset.virtualKey || '', inputSource);
    if(action === 'search-close'){
      closeCommandSearch();
      return true;
    }
    writeActivationStatus(target, 'ACTION CONTRACT ERROR', `Unknown action: ${action}`);
    return false;
  }

  function recoveryStatusUrl(){
    const profile = document.body.dataset.rucaRuntimeProfile === LOUNGE_PROFILE_ID ? LOUNGE_PROFILE_ID : 'default';
    const active = document.visibilityState === 'visible' ? '1' : '0';
    return `/recovery/status?profile=${encodeURIComponent(profile)}&active=${active}`;
  }

  async function commandLaunchToken(){
    if(state.recovery.token) return state.recovery.token;
    const response = await fetch(recoveryStatusUrl(), {cache:'no-store'});
    if(!response.ok) throw new Error('The trusted local bridge did not provide a launch token.');
    const data = await response.json();
    state.recovery.token = data.token || '';
    if(!state.recovery.token) throw new Error('The trusted local bridge launch token is unavailable.');
    return state.recovery.token;
  }

  async function launchPlayCommand(button, inputSource='keyboard'){
    if(state.command.launchPending) return false;
    const commandId = button?.dataset?.commandId;
    const targetMode = button?.dataset?.commandTarget || 'primary';
    const command = window.RUCA_PLAY_COMMANDS?.getById?.(commandId);
    if(!command){
      writeActivationStatus(button, 'COMMAND UNAVAILABLE', 'The authoritative registry did not resolve this command.');
      return false;
    }
    const target = targetMode === 'fallback' ? command.fallbackTarget : command.primaryTarget;
    window.RUCA_CONTINUITY?.captureLaunchOrigin?.({
      commandId,
      commandName:command.name,
      targetMode,
      inputSource
    });
    if(String(command.id || commandId).toLowerCase() === 'spotify'){
      if(typeof window.rucaSpotifyProofBoot !== 'function'){
        console.error('[RUCA/Spotify] proof runtime unavailable');
        writeActivationStatus(button, 'SPOTIFY UNAVAILABLE', 'The Spotify proof runtime has not initialized.');
        return false;
      }
      writeActivationStatus(button, 'SPOTIFY AUTH', 'Opening the RUCA Spotify PKCE and Connect flow.');
      try{
        await window.rucaSpotifyProofBoot();
        writeActivationStatus(button, 'SPOTIFY CONNECT', 'RUCA OS Spotify device initialization requested.');
        return true;
      }catch(error){
        writeActivationStatus(button, 'SPOTIFY FAILED', error.message || 'Spotify initialization failed.');
        return false;
      }
    }
    if(target?.kind === 'internal_route'){
      closeCommandSearch();
      qs('#closeDrawer')?.click();
      window.RUCA_CORE_NAV?.route?.(target.value);
      writeActivationStatus(button, 'INTERNAL ROUTE', target.display || target.value);
      window.RUCA_CONTINUITY?.markLaunchResult?.({status:'INTERNAL_ROUTE', outcome:target.value, detail:target.display || target.value});
      return true;
    }
    state.command.launchPending = true;
    button?.setAttribute?.('aria-busy','true');
    writeActivationStatus(button, 'LAUNCHING', `${command.name} via ${command.launch_method}`);
    try{
      const token = await commandLaunchToken();
      const response = await fetch('/commands/launch', {
        method:'POST',
        headers:{'Content-Type':'application/json','X-RUCA-Recovery-Token':token},
        body:JSON.stringify({id:commandId,target:targetMode})
      });
      const result = await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(result.error || `${response.status} ${response.statusText}`);
      const observed = result.result === 'PROCESS_STARTED'
        ? `PROCESS STARTED${result.pid ? ` // PID ${result.pid}` : ''}`
        : result.result === 'INTERNAL_ROUTE' ? 'INTERNAL ROUTE' : 'OS HANDOFF SENT';
      writeActivationStatus(button, observed, `${command.name} // ${inputSource}`);
      window.RUCA_CONTINUITY?.markLaunchResult?.({
        status:String(result.result || 'HANDOFF_SENT'),
        outcome:observed,
        pid:result.pid,
        detail:`${command.name} // ${inputSource}`
      });
      window.RUCA_AUDIO?.cue('confirm');
      return true;
    }catch(error){
      writeActivationStatus(button, 'LAUNCH FAILED', error.message || command.failure_state || 'The launch target rejected the handoff.');
      window.RUCA_CONTINUITY?.markLaunchResult?.({status:'FAILED', outcome:'LAUNCH FAILED', detail:error.message || command.failure_state || 'Launch rejected'});
      window.RUCA_AUDIO?.cue('error');
      return false;
    }finally{
      state.command.launchPending = false;
      button?.removeAttribute?.('aria-busy');
    }
  }

  function restoreActivationFocus(){
    resetControllerDigitalRepeat('window-focus', true);
    if(isCommandSearchOpen()){
      const target = state.command.keyboardVisible
        ? qsa('.ruca-virtual-key').find(isRoomFocusable)
        : qsa('.command-search-result').find(isRoomFocusable);
      focusElement(target || qs('#rucaCommandSearchInput'));
      return;
    }
    if(isRecoveryOpen()){
      focusElement(qsa('#rucaRecoveryOverlay button').find(isRoomFocusable));
      return;
    }
    const target = state.activation.lastTarget;
    if(target?.isConnected && isRoomFocusable(target)) focusElement(target);
    else focusFirstMeaningful();
  }

  function focusFirstMeaningful(world=document.body.dataset.world){
    const drawer = qs('#detailDrawer.open[aria-hidden="false"]');
    if(drawer){
      focusElement(qsa('button,a,input,select,textarea,[tabindex="0"]', drawer).find(isRoomFocusable));
      return;
    }
    const recovery = qs('#rucaRecoveryOverlay[aria-hidden="false"]');
    if(recovery){
      focusElement(qsa('button', recovery).find(isRoomFocusable));
      return;
    }
    const selectors = {
        home: '#page-home .complication, .live-rail .world-card',
      play: '#page-play .integrated-app-node.is-primary, #page-play .integrated-app-node, #page-play .launch-core, #page-play .metric-card',
      live: '#page-live .lane-btn.active, #page-live .lane-btn, #rucaLiveGrid .ruca-world-feed-card',
      apps: '#page-play .integrated-app-node.is-primary, #page-play .integrated-app-node, #page-play .launch-core',
      diagnostics: '#rucaLoungeDetailsToggle, #rucaDiagnosticsDetailToggle, .diagnostics-workspace-tabs button.active, .diagnostics-workspace-tabs button, #page-diagnostics .sensor-btn.active, #page-diagnostics .sensor-btn, #runScan, #page-diagnostics .bench-btn',
      control: '#page-control .theme-preset.active, #page-control .theme-preset, #page-control input, #page-control select, #page-control button'
    };
    const candidates = qsa(selectors[world] || 'button,a,input,select,textarea').filter(el=>focusableControls().includes(el));
    focusElement(candidates[0] || focusableControls()[0]);
  }

  function closeTopLayer(){
    if(window.RUCA_CONTINUITY?.closeTopOverlay){
      return window.RUCA_CONTINUITY.closeTopOverlay({restoreFocus:true, reason:'top-layer-back'});
    }
    const recovery = qs('#rucaRecoveryOverlay');
    if(recovery && recovery.getAttribute('aria-hidden') === 'false'){
      closeRecoveryOverlay();
      return true;
    }
    const search = qs('#rucaCommandSearch');
    if(search && search.getAttribute('aria-hidden') === 'false'){
      closeCommandSearch();
      return true;
    }
    const drawer = qs('#detailDrawer');
    if(drawer && drawer.getAttribute('aria-hidden') === 'false'){
      qs('#closeDrawer')?.click();
      return true;
    }
    return false;
  }

  function coreTravelDelay(extra=80){
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if(reduced) return 0;
    const travel = Number(window.RUCA_CORE_NAV?.travelMs || 680);
    return travel + extra;
  }

  const VIRTUAL_KEYBOARD_PAGES = Object.freeze({
    lower:'abcdefghijklmnopqrstuvwxyz'.split(''),
    upper:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    numbers:'1234567890'.split(''),
    symbols:['@','#','$','%','&','*','(',')','-','_','+','=','/','\\',':',';','.',',','?','!','\'', '"']
  });
  const VIRTUAL_KEYBOARD_PAGE_ORDER = Object.freeze(['lower','upper','numbers','symbols']);

  function isCommandSearchOpen(){
    return qs('#rucaCommandSearch')?.getAttribute('aria-hidden') === 'false';
  }

  function virtualKeyButton(value, label=value, className=''){
    return `<button type="button" class="ruca-virtual-key ${className}" data-ruca-action="virtual-key" data-ruca-action-contract="Enter ${escapeHtml(label)} into RUCA Command Search" data-virtual-key="${escapeHtml(value)}">${escapeHtml(label)}</button>`;
  }

  function renderVirtualKeyboard(page=state.command.keyboardPage, focus=false){
    const keyboard = qs('#rucaVirtualKeyboard');
    const keys = qs('#rucaVirtualKeyboardKeys');
    if(!keyboard || !keys) return;
    const normalized = VIRTUAL_KEYBOARD_PAGES[page] ? page : 'lower';
    state.command.keyboardPage = normalized;
    keyboard.dataset.keyboardPage = normalized;
    keyboard.hidden = !state.command.keyboardVisible;
    const label = qs('#rucaKeyboardPageLabel');
    if(label) label.textContent = normalized.toUpperCase();
    const characters = VIRTUAL_KEYBOARD_PAGES[normalized].map(value=>virtualKeyButton(value)).join('');
    keys.innerHTML = `${characters}
      ${virtualKeyButton('SPACE','SPACE','is-wide')}
      ${virtualKeyButton('BACKSPACE','BACKSPACE','is-wide')}
      ${virtualKeyButton('CLEAR','CLEAR')}
      ${virtualKeyButton('SHIFT',normalized === 'upper' ? 'LOWER' : 'SHIFT')}
      ${virtualKeyButton('NUMBERS','123')}
      ${virtualKeyButton('SYMBOLS','#+=')}
      ${virtualKeyButton('ENTER','SEARCH','is-command')}
      ${virtualKeyButton('CLOSE','CLOSE','is-command')}`;
    markFocusableControls();
    if(focus) requestAnimationFrame(()=>focusElement(qsa('.ruca-virtual-key', keyboard).find(isRoomFocusable)));
  }

  function setCommandSearchValue(value){
    const input = qs('#rucaCommandSearchInput');
    if(!input) return;
    input.value = String(value ?? '');
    renderCommandSearch(input.value);
  }

  function handleVirtualKey(value, inputSource='gamepad'){
    const input = qs('#rucaCommandSearchInput');
    if(!input || !isCommandSearchOpen()) return false;
    const current = input.value || '';
    if(value === 'SPACE') setCommandSearchValue(`${current} `);
    else if(value === 'BACKSPACE') setCommandSearchValue(Array.from(current).slice(0,-1).join(''));
    else if(value === 'CLEAR') setCommandSearchValue('');
    else if(value === 'SHIFT') renderVirtualKeyboard(state.command.keyboardPage === 'upper' ? 'lower' : 'upper', true);
    else if(value === 'NUMBERS') renderVirtualKeyboard('numbers', true);
    else if(value === 'SYMBOLS') renderVirtualKeyboard('symbols', true);
    else if(value === 'ENTER') return executeSelectedSearchResult(inputSource);
    else if(value === 'CLOSE'){
      closeCommandSearch();
      return true;
    }else if(value.length === 1){
      setCommandSearchValue(`${current}${value}`);
    }else{
      return false;
    }
    window.RUCA_AUDIO?.cue('click');
    return true;
  }

  function cycleVirtualKeyboardPage(delta){
    const current = VIRTUAL_KEYBOARD_PAGE_ORDER.indexOf(state.command.keyboardPage);
    const next = VIRTUAL_KEYBOARD_PAGE_ORDER[(Math.max(0,current) + delta + VIRTUAL_KEYBOARD_PAGE_ORDER.length) % VIRTUAL_KEYBOARD_PAGE_ORDER.length];
    renderVirtualKeyboard(next, true);
  }

  function toggleVirtualKeyboard(){
    state.command.keyboardVisible = !state.command.keyboardVisible;
    const keyboard = qs('#rucaVirtualKeyboard');
    if(keyboard) keyboard.hidden = !state.command.keyboardVisible;
    markFocusableControls();
    if(state.command.keyboardVisible){
      renderVirtualKeyboard(state.command.keyboardPage, true);
    }else{
      focusElement(qsa('.command-search-result').find(isRoomFocusable) || qs('#rucaCommandSearchInput'));
    }
  }

  function executeSelectedSearchResult(inputSource='keyboard'){
    const selected = qs('.command-search-result.ruca-controller-focus') ||
      (document.activeElement?.matches?.('.command-search-result') ? document.activeElement : null) ||
      qs('.command-search-result');
    if(!selected){
      writeActivationStatus(qs('#rucaCommandSearchInput'), 'NO SEARCH RESULT', 'Type another command name.');
      window.RUCA_AUDIO?.cue('error');
      return false;
    }
    activateFocusedTarget(selected, inputSource);
    return true;
  }

  function installCommandSearch(){
    if(document.body.dataset.pass16bSearchReady === 'true') return;
    const overlay = qs('#rucaCommandSearch');
    const input = qs('#rucaCommandSearchInput');
    const results = qs('#rucaCommandSearchResults');
    if(!overlay || !input || !results) return;
    document.body.dataset.pass16bSearchReady = 'true';
    window.RUCA_CONTINUITY?.registerOverlay?.({
      id:'command-search',
      priority:20,
      isOpen:isCommandSearchOpen,
      close:closeCommandSearch
    });
    input.addEventListener('input', ()=>renderCommandSearch(input.value));
    input.addEventListener('keydown', event=>{
      if(event.key === 'Escape'){
        event.preventDefault();
        event.stopPropagation();
        window.RUCA_CONTINUITY?.back?.({source:'keyboard-escape'});
        return;
      }
      if(event.key === 'Enter'){
        event.preventDefault();
        const selected = results.querySelector('.command-search-result:focus') || results.querySelector('.command-search-result');
        activateCommandSearchResult(selected);
        return;
      }
      if(event.key === 'ArrowDown' || event.key === 'ArrowUp'){
        event.preventDefault();
        const buttons = qsa('.command-search-result', results);
        if(!buttons.length) return;
        const current = buttons.indexOf(document.activeElement);
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        const next = buttons[(Math.max(0, current) + delta + buttons.length) % buttons.length];
        next.focus({preventScroll:true});
      }
    });
    overlay.addEventListener('keydown', event=>{
      if(event.target === input || event.ctrlKey || event.metaKey || event.altKey) return;
      if(event.key === 'Escape'){
        event.preventDefault();
        event.stopPropagation();
        window.RUCA_CONTINUITY?.back?.({source:'keyboard-escape'});
        return;
      }
      if(event.key === 'Backspace'){
        event.preventDefault();
        event.stopPropagation();
        handleVirtualKey('BACKSPACE','keyboard');
        return;
      }
      if(event.key.length === 1){
        event.preventDefault();
        event.stopPropagation();
        setCommandSearchValue(`${input.value || ''}${event.key}`);
      }
    });
    overlay.addEventListener('pointerdown', event=>{
      if(event.target === overlay) closeCommandSearch();
    });
    window.RUCA_PASS16B_openCommandSearch = openCommandSearch;
    window.RUCA_PASS16B_closeCommandSearch = closeCommandSearch;
  }

  function openCommandSearch(seed=''){
    const overlay = qs('#rucaCommandSearch');
    const input = qs('#rucaCommandSearchInput');
    if(!overlay || !input) return;
    let returnTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if(isRecoveryOpen()){
      const handoff = window.RUCA_CONTINUITY?.dismissOverlay?.('recovery', {restoreFocus:false, reason:'command-search-open'});
      if(handoff?.returnTarget instanceof HTMLElement) returnTarget = handoff.returnTarget;
    }
    const drawer = qs('#detailDrawer');
    if(drawer?.getAttribute('aria-hidden') === 'false'){
      const handoff = window.RUCA_CONTINUITY?.dismissOverlay?.('drawer', {restoreFocus:false, reason:'command-search-open'});
      if(handoff?.returnTarget instanceof HTMLElement) returnTarget = handoff.returnTarget;
    }
    state.command.keyboardVisible = true;
    state.command.keyboardPage = 'lower';
    resetControllerDigitalRepeat('search-open', true);
    overlay.removeAttribute('inert');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('ruca-command-search-open');
    window.RUCA_CONTINUITY?.openOverlay?.('command-search', {returnTarget});
    input.value = seed || '';
    renderCommandSearch(input.value);
    renderVirtualKeyboard('lower', true);
    window.RUCA_AUDIO?.cue('drawer-open');
  }

  function closeCommandSearch(options={}){
    const overlay = qs('#rucaCommandSearch');
    if(!overlay) return;
    if(overlay.getAttribute('aria-hidden') !== 'false'){
      overlay.setAttribute('inert','');
      return false;
    }
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('inert','');
    document.body.classList.remove('ruca-command-search-open');
    resetControllerDigitalRepeat('search-close', true);
    window.RUCA_CONTINUITY?.overlayClosed?.('command-search', {
      restoreFocus:options?.restoreFocus !== false,
      reason:options?.reason || 'command-search-close'
    });
    window.RUCA_AUDIO?.cue('drawer-close');
    return true;
  }

  function commandSearchItems(){
    const items = [];
    const pushElement = (el, type, label, stateText='READY', extra={})=>{
      if(!el || !label) return;
      const pageEl = el.closest('.page');
      const page = pageEl?.id?.replace('page-', '') || el.dataset.page || '';
      items.push({type, label, state:stateText, page, element:el, ...extra});
    };
    qsa('.world-nav .nav-btn').forEach(el=>pushElement(el, 'World', (el.dataset.page || el.textContent || '').replace(/-/g, ' ').toUpperCase(), 'OPEN'));
    qsa('.app-card[data-app]').forEach(el=>pushElement(el, 'App', el.dataset.app, el.dataset.status || 'NOT INSTALLED', {commandId:el.dataset.appId}));
    qsa('.launch-node:not(.app-card),.app-orbit-node').forEach(el=>pushElement(el, 'Port', compactLabel(el), 'COMMAND PORT'));
    qsa('.lane-btn[data-lane],.world-card[data-lane-jump]').forEach(el=>pushElement(el, 'Live World', (el.dataset.lane || el.dataset.laneJump || '').toUpperCase(), 'OPEN LANE'));
    qsa('.sensor-btn[data-sensor]').forEach(el=>pushElement(el, 'Diagnostics', `Diagnostics / ${el.dataset.sensor}`, 'SENSOR'));
    [
      ['Settings', '#rucaSettingsButton', 'Command', 'HANDOFF'],
      ['Mute Audio', '#rucaMuteButton', 'Control', 'LOCAL'],
      ['Volume Control', '#rucaCommandVolume', 'Control', 'LOCAL'],
      ['Cockpit Brightness', '#rucaBrightnessSlider', 'Control', 'LOCAL'],
      ['Controller Recovery System', '#rucaTestRecovery', 'Command', 'SAFETY'],
      ['Motion Intensity', '#rucaMotionSlider', 'Control', 'LOCAL'],
      ['Starfield Brightness', '#rucaStarBrightness', 'Atmosphere', 'CANVAS'],
      ['Starfield Density', '#rucaStarDensity', 'Atmosphere', 'CANVAS'],
      ['Retry Weather Source', '[data-source-test="weather"]', 'Source', 'RETRY'],
      ['Retry Markets Source', '[data-source-test="markets"]', 'Source', 'RETRY'],
      ['Retry Sports Source', '[data-source-test="sports"]', 'Source', 'RETRY']
    ].forEach(([label, selector, type, stateText])=>pushElement(qs(selector), type, label, stateText));
    state.command.searchItems = items;
    return items;
  }

  function compactLabel(el){
    const clone = el.cloneNode(true);
    qsa('svg,img', clone).forEach(node=>node.remove());
    return (clone.textContent || 'Command').replace(/\s+/g, ' ').trim();
  }

  function renderCommandSearch(query=''){
    const results = qs('#rucaCommandSearchResults');
    if(!results) return;
    const needle = query.trim().toLowerCase();
    const items = commandSearchItems();
    const matches = items
      .filter(item=>!needle || `${item.type} ${item.label} ${item.state}`.toLowerCase().includes(needle))
      .slice(0, 12);
    state.command.searchMatches = matches;
    if(!matches.length){
      results.innerHTML = '<div class="command-search-empty">No command match. Try apps, games, folders, settings, weather, markets, diagnostics.</div>';
      return;
    }
    results.innerHTML = matches.map((item, index)=>`
      <button type="button" class="command-search-result" data-ruca-action="command-search-result" data-ruca-action-contract="Activate selected Command Search result" data-command-index="${index}" role="option">
        <span>${escapeHtml(item.type)}</span>
        <b>${escapeHtml(item.label)}</b>
        <small>${escapeHtml(item.state)}</small>
      </button>`).join('');
    markFocusableControls();
  }

  async function activateCommandSearchResult(button, inputSource='keyboard'){
    const index = Number(button?.dataset?.commandIndex || 0);
    const item = state.command.searchMatches?.[index];
    if(!item) return false;
    if(item.commandId){
      const command = window.RUCA_PLAY_COMMANDS?.getById?.(item.commandId);
      if(!command){
        writeActivationStatus(button, 'COMMAND UNAVAILABLE', 'The PLAY registry has not resolved this result.');
        return false;
      }
      if(command.primaryAvailable || command.fallbackAvailable){
        button.dataset.commandId = command.id;
        button.dataset.commandTarget = command.primaryAvailable ? 'primary' : 'fallback';
        const launched = await launchPlayCommand(button, inputSource);
        if(launched) closeCommandSearch();
        return launched;
      }
      closeCommandSearch();
      window.RUCA_CORE_NAV?.route?.('play');
      window.setTimeout(()=>window.RUCA_PLAY_COMMANDS?.open?.(command), coreTravelDelay());
      return true;
    }
    const trigger = ()=>{
      if(item.element?.matches?.('input,select,textarea')) focusElement(item.element);
      else activateFocusedTarget(item.element, inputSource);
    };
    closeCommandSearch();
    if(item.page && document.body.dataset.world !== item.page){
      if(window.RUCA_CORE_NAV?.route){
        window.RUCA_CORE_NAV.route(item.page);
      }else{
        qs(`.world-nav .nav-btn[data-page="${item.page}"]`)?.click();
      }
      if(!item.element?.matches?.('.world-nav .nav-btn')){
        window.setTimeout(trigger, coreTravelDelay());
      }
    }else{
      trigger();
    }
    window.RUCA_AUDIO?.cue('confirm');
    return true;
  }

  function installPass17AControllerRecovery(){
    if(document.body.dataset.pass17aRecoveryReady === 'true') return;
    const overlay = qs('#rucaRecoveryOverlay');
    if(!overlay) return;
    document.body.dataset.pass17aRecoveryReady = 'true';
    window.RUCA_CONTINUITY?.registerOverlay?.({
      id:'recovery',
      priority:30,
      isOpen:isRecoveryOpen,
      close:closeRecoveryOverlay
    });

    qs('#rucaRecoveryClose')?.addEventListener('click', closeRecoveryOverlay);
    qs('#rucaTestRecovery')?.addEventListener('click', ()=>openRecoveryOverlay('control-test'));
    overlay.addEventListener('pointerdown', event=>{
      if(event.target === overlay) closeRecoveryOverlay();
    });
    overlay.addEventListener('click', event=>{
      const action = event.target.closest('[data-recovery-action]');
      if(action) handleRecoveryAction(action);
      const power = event.target.closest('[data-recovery-power]');
      if(power) armRecoveryPowerAction(power);
    });

    state.recovery.monitorEnabled = true;
    startGamepadLoop();
    pollRecoveryStatus(true);
    state.recovery.pollId = window.setInterval(()=>pollRecoveryStatus(), 1500);
    window.addEventListener('focus', ()=>{
      pollRecoveryStatus(true);
      restoreActivationFocus();
    });
    document.addEventListener('visibilitychange', ()=>{
      if(document.visibilityState !== 'visible') resetControllerDigitalRepeat('document-hidden', true);
      if(document.visibilityState === 'visible') pollRecoveryStatus(true);
    });

    window.RUCA_RECOVERY = {
      open:()=>openRecoveryOverlay('api'),
      close:closeRecoveryOverlay,
      status:()=>state.recovery.lastStatus,
      availability:()=>window.RUCA_CONTINUITY?.snapshot?.().recovery || null,
      moveCursorTo:(x,y)=>{
        state.controller.cursorX = Math.max(0, Math.min(window.innerWidth, Number(x) || 0));
        state.controller.cursorY = Math.max(0, Math.min(window.innerHeight, Number(y) || 0));
        state.controller.analogActive = true;
        paintAnalogCursor();
        updateAnalogHover();
      },
      activate:activateAnalogTarget
    };
  }

  function isRecoveryOpen(){
    return qs('#rucaRecoveryOverlay')?.getAttribute('aria-hidden') === 'false';
  }

  async function pollRecoveryStatus(force=false){
    if(state.recovery.polling && !force) return;
    state.recovery.polling = true;
    try{
      const response = await fetch(recoveryStatusUrl(), {cache:'no-store'});
      if(!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const data = await response.json();
      state.recovery.lastStatus = data;
      if(data.token) state.recovery.token = data.token;
      state.recovery.globalSupported = data.capture_supported === true;
      state.recovery.guideSupported = data.guide_supported === true;
      const availability = data.capture_supported === true
        ? (data.controller_connected === true ? 'GLOBAL_READY' : 'GLOBAL_ARMED')
        : 'IN_RUCA_ONLY';
      window.RUCA_CONTINUITY?.setRecoveryAvailability?.({
        availability,
        bridgeReachable:true,
        captureSupported:data.capture_supported === true,
        controllerConnected:data.controller_connected === true,
        guideSupported:data.guide_supported === true,
        detail:data.last_error || data.provider || 'Canonical recovery bridge responded.'
      });
      updateRecoveryReadouts(data);

      const nextEvent = Number(data.event_id || 0);
      const eventAge = data.last_trigger_at ? Math.abs(Date.now() - Date.parse(data.last_trigger_at)) : Infinity;
      const shouldRecover = nextEvent > state.recovery.eventId || (!state.recovery.eventId && nextEvent > 0 && eventAge < 12000);
      state.recovery.eventId = Math.max(state.recovery.eventId, nextEvent);
      if(shouldRecover){
        const source = String(data.last_trigger_source || 'global-controller');
        if(source.toUpperCase() === 'GUIDE') handleReceivedGuideRecovery(source);
        else openRecoveryOverlay(source);
      }
    }catch(err){
      state.recovery.globalSupported = false;
      window.RUCA_CONTINUITY?.setRecoveryAvailability?.({
        availability:'UNAVAILABLE',
        bridgeReachable:false,
        captureSupported:false,
        controllerConnected:false,
        guideSupported:false,
        detail:err.message || 'Canonical recovery bridge unavailable.'
      });
      updateRecoveryReadouts({capture_supported:false, error:err.message || 'Bridge unavailable'});
    }finally{
      state.recovery.polling = false;
    }
  }

  function updateRecoveryReadouts(data={}){
    const connected = data.controller_connected === true;
    const supported = data.capture_supported === true;
    const title = supported ? (connected ? 'GLOBAL CAPTURE READY' : 'GLOBAL CAPTURE ARMED') : 'IN-RUCA ONLY';
    const detail = supported
      ? `${data.provider || 'Windows XInput'} // Hold Start + Back for two seconds${data.guide_supported ? ' or hold Guide/Home' : ''}. Windows overlay suppression is not claimed.`
      : `Browser recovery remains available. ${data.error || 'The local bridge has not confirmed Windows-level capture.'}`;
    const controlTitle = qs('#rucaRecoveryBridgeReadout');
    const controlDetail = qs('#rucaRecoveryBridgeDetail');
    if(controlTitle) controlTitle.textContent = title;
    if(controlDetail) controlDetail.textContent = detail;
    if(!isRecoveryOpen()) writeRecoveryStatus(title, detail);
  }

  function routeRecoveryHome(){
    if((document.body.dataset.world || 'home') === 'home') return;
    if(window.RUCA_CORE_NAV?.route){
      window.RUCA_CORE_NAV.route('home', {replace:true, instant:true, source:'recovery'});
    }else{
      qs('.world-nav .nav-btn[data-page="home"]')?.click();
    }
  }

  function handleReceivedGuideRecovery(source='GUIDE'){
    resetControllerDigitalRepeat('guide-recovery', true);
    window.RUCA_CONTINUITY?.dismissOverlay?.('command-search', {restoreFocus:false, reason:'guide-recovery'});
    window.RUCA_CONTINUITY?.dismissOverlay?.('drawer', {restoreFocus:false, reason:'guide-recovery'});
    window.RUCA_CONTINUITY?.dismissOverlay?.('recovery', {restoreFocus:false, reason:'guide-recovery'});
    routeRecoveryHome();
    document.body.dataset.rucaLastGuideRecovery = new Date().toISOString();
    document.body.dataset.rucaGuideRecoverySource = String(source || 'GUIDE').toUpperCase();
    window.requestAnimationFrame(()=>window.RUCA_CONTINUITY?.requestFocus?.('home', 'guide-recovery'));
    writeRecoveryStatus('HOME RESTORED', 'RUCA overlays closed, HOME restored, and focus requested. Windows overlay suppression is not claimed.');
    window.RUCA_AUDIO?.cue('confirm');
    return true;
  }

  function openRecoveryOverlay(source='controller'){
    const overlay = qs('#rucaRecoveryOverlay');
    if(!overlay) return;
    resetControllerDigitalRepeat('recovery-open', true);
    const alreadyOpen = isRecoveryOpen();
    let returnTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const searchHandoff = window.RUCA_CONTINUITY?.dismissOverlay?.('command-search', {restoreFocus:false, reason:'recovery-open'});
    if(searchHandoff?.returnTarget instanceof HTMLElement) returnTarget = searchHandoff.returnTarget;
    const drawer = qs('#detailDrawer');
    if(drawer?.getAttribute('aria-hidden') === 'false'){
      const drawerHandoff = window.RUCA_CONTINUITY?.dismissOverlay?.('drawer', {restoreFocus:false, reason:'recovery-open'});
      if(drawerHandoff?.returnTarget instanceof HTMLElement) returnTarget = drawerHandoff.returnTarget;
    }
    routeRecoveryHome();

    if(!state.controller.enabled){
      const toggle = qs('#rucaControllerMode');
      if(toggle) toggle.checked = true;
      localStorage.setItem('rucaControllerMode', 'true');
      setControllerMode(true);
    }
    overlay.removeAttribute('inert');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('ruca-recovery-open');
    window.RUCA_CONTINUITY?.openOverlay?.('recovery', {returnTarget});
    state.controller.analogActive = true;
    ensureAnalogCursor();
    paintAnalogCursor();
    resetRecoveryPowerActions();
    writeRecoveryStatus('RECOVERY READY', `${String(source).replace(/-/g, ' ').toUpperCase()} // Controller mouse mode is active.`);
    markFocusableControls();
    requestAnimationFrame(()=>focusElement(qsa('.ruca-recovery-action', overlay).find(isRoomFocusable)));
    if(!alreadyOpen) window.RUCA_AUDIO?.cue('drawer-open');
  }

  function closeRecoveryOverlay(options={}){
    const overlay = qs('#rucaRecoveryOverlay');
    if(!overlay || overlay.getAttribute('aria-hidden') !== 'false') return false;
    resetControllerDigitalRepeat('recovery-close', true);
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('inert','');
    document.body.classList.remove('ruca-recovery-open');
    resetRecoveryPowerActions();
    setAnalogHover(null);
    markFocusableControls();
    window.RUCA_CONTINUITY?.overlayClosed?.('recovery', {
      restoreFocus:options?.restoreFocus !== false,
      reason:options?.reason || 'recovery-close'
    });
    window.RUCA_AUDIO?.cue('drawer-close');
    return true;
  }

  function writeRecoveryStatus(title, detail){
    const status = qs('#rucaRecoveryStatus');
    const copy = qs('#rucaRecoveryDetail');
    if(status) status.textContent = title || 'READY';
    if(copy) copy.textContent = detail || 'Controller recovery is ready.';
  }

  function handleRecoveryAction(button){
    const action = button?.dataset?.recoveryAction;
    if(!action) return;
    if(action === 'return-home'){
      routeRecoveryHome();
      writeRecoveryStatus('HOME RESTORED', 'RUCA HOME owns focus again.');
      window.setTimeout(closeRecoveryOverlay, 180);
      return;
    }
    if(action === 'command-search'){
      closeRecoveryOverlay();
      window.setTimeout(()=>openCommandSearch(), 80);
      return;
    }
    if(action === 'mouse-mode'){
      if(!state.controller.enabled) setControllerMode(true);
      const hasGamepad = !!state.controller.gamepadName;
      state.controller.analogActive = hasGamepad;
      paintAnalogCursor();
      writeRecoveryStatus(
        hasGamepad ? 'CONTROLLER MOUSE READY' : 'CONTROLLER MOUSE ARMED',
        hasGamepad
          ? 'Left stick moves the cursor. A activates. B returns.'
          : 'No gamepad is connected. Keyboard and D-pad recovery remain available while RUCA waits for a controller.'
      );
      return;
    }
    dispatchRecoveryAction(action, {direction:Number(button.dataset.direction || 1)});
  }

  function armRecoveryPowerAction(button){
    const action = button?.dataset?.recoveryPower;
    if(!action) return;
    if(state.recovery.pendingPower === action){
      dispatchRecoveryAction(action, {confirm:`CONFIRM_${action.toUpperCase()}`});
      resetRecoveryPowerActions();
      return;
    }
    resetRecoveryPowerActions();
    state.recovery.pendingPower = action;
    button.classList.add('is-armed');
    button.textContent = `CONFIRM ${action.toUpperCase()}`;
    writeRecoveryStatus('POWER CONFIRMATION ARMED', `Select CONFIRM ${action.toUpperCase()} again within eight seconds.`);
    window.RUCA_AUDIO?.cue('error');
    state.recovery.pendingPowerTimer = window.setTimeout(resetRecoveryPowerActions, 8000);
  }

  function resetRecoveryPowerActions(){
    window.clearTimeout(state.recovery.pendingPowerTimer);
    state.recovery.pendingPowerTimer = 0;
    state.recovery.pendingPower = '';
    qsa('[data-recovery-power]').forEach(button=>{
      button.classList.remove('is-armed');
      button.textContent = button.dataset.label || button.dataset.recoveryPower?.toUpperCase() || 'POWER';
    });
  }

  async function dispatchRecoveryAction(action, extra={}){
    try{
      if(!state.recovery.token) await pollRecoveryStatus(true);
      if(!state.recovery.token) throw new Error('Recovery bridge token unavailable.');
      writeRecoveryStatus('COMMAND SENT', `${String(action).replace(/-/g, ' ').toUpperCase()} requested.`);
      const response = await fetch('/recovery/action', {
        method:'POST',
        cache:'no-store',
        headers:{
          'Content-Type':'application/json',
          'X-RUCA-Recovery-Token':state.recovery.token
        },
        body:JSON.stringify({action, ...extra})
      });
      const data = await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(data.error || `${response.status} ${response.statusText}`);
      writeRecoveryStatus('COMMAND ACCEPTED', data.message || `${String(action).replace(/-/g, ' ')} accepted by the local bridge.`);
      window.RUCA_AUDIO?.cue('confirm');
      return data;
    }catch(err){
      writeRecoveryStatus('COMMAND BLOCKED', err.message || 'The local bridge rejected this recovery action.');
      window.RUCA_AUDIO?.cue('error');
      return null;
    }
  }

  function updateLocalEmergencyHold(held, source, now){
    if(!held){
      state.controller.emergencyHoldStarted = 0;
      state.controller.emergencyHoldTriggered = false;
      return false;
    }
    if(!state.controller.emergencyHoldStarted) state.controller.emergencyHoldStarted = now;
    const elapsed = now - state.controller.emergencyHoldStarted;
    if(!state.controller.emergencyHoldTriggered && elapsed >= 2000){
      state.controller.emergencyHoldTriggered = true;
      if(source === 'guide-button') handleReceivedGuideRecovery(source);
      else openRecoveryOverlay(source);
    }else if(!isRecoveryOpen()){
      const remaining = Math.max(0, 2 - elapsed / 1000).toFixed(1);
      writeRecoveryStatus('RECOVERY HOLD', `${remaining}s until RUCA recovery opens.`);
    }
    return true;
  }

  function scrollRecoveryWithTriggers(leftValue, rightValue){
    if(!isRecoveryOpen()) return false;
    const delta = applyDeadzone((Number(rightValue) || 0) - (Number(leftValue) || 0), .08);
    if(!delta) return false;
    const consoleEl = qs('.ruca-recovery-console');
    if(consoleEl) consoleEl.scrollTop += delta * 34;
    return true;
  }

  function ensureAnalogCursor(){
    if(state.controller.cursorEl && document.body.contains(state.controller.cursorEl)) return state.controller.cursorEl;
    const cursor = document.createElement('div');
    cursor.className = 'ruca-analog-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);
    state.controller.cursorEl = cursor;
    if(!state.controller.cursorReady){
      state.controller.cursorX = Math.round(window.innerWidth / 2);
      state.controller.cursorY = Math.round(window.innerHeight / 2);
      state.controller.cursorReady = true;
    }
    paintAnalogCursor();
    return cursor;
  }

  function paintAnalogCursor(){
    const cursor = state.controller.cursorEl || ensureAnalogCursor();
    cursor.style.setProperty('--ruca-cursor-x', `${Math.round(state.controller.cursorX)}px`);
    cursor.style.setProperty('--ruca-cursor-y', `${Math.round(state.controller.cursorY)}px`);
    cursor.classList.toggle('is-active', !!(state.controller.enabled && state.controller.analogActive));
  }

  function syncAnalogCursorWithFocus(target){
    if(!state.controller.enabled || !target || !isRoomFocusable(target)) return;
    const rect = target.getBoundingClientRect();
    state.controller.cursorX = Math.max(0, Math.min(window.innerWidth, rect.left + rect.width / 2));
    state.controller.cursorY = Math.max(0, Math.min(window.innerHeight, rect.top + rect.height / 2));
    state.controller.cursorReady = true;
    state.controller.cursorTarget?.classList.remove('ruca-analog-hover');
    state.controller.cursorTarget = target;
    target.classList.add('ruca-analog-hover');
    paintAnalogCursor();
  }

  function applyDeadzone(value, zone=.18){
    const n = Math.abs(value) < zone ? 0 : value;
    if(!n) return 0;
    const sign = n < 0 ? -1 : 1;
    return sign * Math.min(1, (Math.abs(n) - zone) / (1 - zone));
  }

  function moveAnalogCursor(rawX, rawY){
    const dx = applyDeadzone(rawX);
    const dy = applyDeadzone(rawY);
    if(!dx && !dy){
      paintAnalogCursor();
      return false;
    }
    state.controller.analogActive = true;
    const magnitude = Math.min(1, Math.hypot(dx, dy));
    const speed = 7.5 + (state.controller.focusStrength || 70) * .16 + magnitude * 12;
    state.controller.cursorX = Math.max(0, Math.min(window.innerWidth, state.controller.cursorX + dx * speed));
    state.controller.cursorY = Math.max(0, Math.min(window.innerHeight, state.controller.cursorY + dy * speed));
    paintAnalogCursor();
    updateAnalogHover();
    return true;
  }

  function scrollWithRightStick(rawY){
    const dy = applyDeadzone(rawY, .22);
    if(!dy) return false;
    const activeScroll = qs('.page.active .lane-stage, .page.active .rapid-lab, .page.active .control-cards, .page.active .app-grid, .page.active .readiness-panel');
    const target = activeScroll && activeScroll.scrollHeight > activeScroll.clientHeight + 8 ? activeScroll : window;
    const amount = dy * (16 + Math.abs(dy) * 34);
    if(target === window){
      window.scrollBy({top: amount, behavior: 'auto'});
    }else{
      target.scrollTop += amount;
    }
    return true;
  }

  function analogTargetAtCursor(){
    const el = document.elementFromPoint(state.controller.cursorX, state.controller.cursorY);
    const target = el?.closest?.(CONTROLLER_INTERACTIVE_SELECTOR);
    if(!target) return null;
    const rect = target.getBoundingClientRect();
    const style = getComputedStyle(target);
    const hiddenDrawer = target.closest('#detailDrawer[aria-hidden="true"]');
    if(target.disabled || hiddenDrawer || rect.width <= 0 || rect.height <= 0 || style.visibility === 'hidden' || style.display === 'none') return null;
    return target;
  }

  function setAnalogHover(target){
    if(state.controller.cursorTarget === target) return;
    state.controller.cursorTarget?.classList.remove('ruca-analog-hover');
    state.controller.cursorTarget = target || null;
    if(target){
      target.classList.add('ruca-analog-hover');
      if(typeof target.focus === 'function'){
        try{ target.focus({preventScroll:true}); }catch(err){ target.focus(); }
      }
      qsa('.ruca-controller-focus').forEach(node=>node.classList.remove('ruca-controller-focus'));
      target.classList.add('ruca-controller-focus');
      const now = Date.now();
      if(now - state.controller.lastHoverCue > 140){
        state.controller.lastHoverCue = now;
        window.RUCA_AUDIO?.cue('hover');
      }
    }
  }

  function updateAnalogHover(){
    setAnalogHover(analogTargetAtCursor());
  }

  function activateAnalogTarget(){
    const active = document.activeElement;
    const target = active?.matches?.(CONTROLLER_INTERACTIVE_SELECTOR) && isRoomFocusable(active)
      ? active
      : state.controller.cursorTarget;
    if(target && target.matches?.(CONTROLLER_INTERACTIVE_SELECTOR)){
      activateFocusedTarget(target, 'gamepad');
    }else{
      activateFocusedTarget(document.activeElement, 'gamepad');
    }
  }

  function startGamepadLoop(){
    if(state.controller.pollId) return;
    state.controller.pollId = window.setInterval(pollGamepad, 33);
  }

  function stopGamepadLoop(){
    if(state.controller.pollId) window.clearInterval(state.controller.pollId);
    state.controller.pollId = 0;
    resetControllerDigitalRepeat('controller-loop-stop', true);
  }

  function resetControllerDigitalRepeat(reason='release', blockUntilRelease=false){
    const repeat = state.controller.digitalRepeat;
    repeat.key = '';
    repeat.startedAt = 0;
    repeat.nextAt = 0;
    repeat.resetReason = reason;
    repeat.blockedUntilRelease = !!blockUntilRelease;
    if(reason !== 'release'){
      repeat.lastActionAt = 0;
      repeat.lastDirection = '';
    }
  }

  function digitalDpadDirection(dpad={}){
    if(dpad.right) return 'right';
    if(dpad.left) return 'left';
    if(dpad.down) return 'down';
    if(dpad.up) return 'up';
    return '';
  }

  function digitalShoulderKey(buttons=[]){
    const lb = buttons[4]?.pressed === true;
    const rb = buttons[5]?.pressed === true;
    if(lb === rb) return '';
    return rb ? 'rb' : 'lb';
  }

  function runControllerDigitalNavigation(key, direction, now, action){
    const repeat = state.controller.digitalRepeat;
    if(!key || typeof action !== 'function'){
      resetControllerDigitalRepeat('release');
      return false;
    }
    if(repeat.blockedUntilRelease) return false;
    if(repeat.key !== key){
      repeat.key = key;
      repeat.startedAt = now;
      repeat.nextAt = now + DIGITAL_NAV_INITIAL_DELAY_MS;
      action();
      repeat.lastActionAt = now;
      repeat.lastDirection = direction;
      return true;
    }
    if(now < repeat.nextAt) return false;
    action();
    repeat.lastActionAt = now;
    repeat.lastDirection = direction;
    do{
      repeat.nextAt += DIGITAL_NAV_REPEAT_INTERVAL_MS;
    }while(repeat.nextAt <= now);
    return true;
  }

  function currentPhysicalDigitalDirection(){
    if(!navigator.getGamepads) return '';
    const pad = Array.from(navigator.getGamepads()).find(Boolean);
    if(!pad) return '';
    const buttons = pad.buttons || [];
    const dpad = {
      up:buttons[12]?.pressed,
      down:buttons[13]?.pressed,
      left:buttons[14]?.pressed,
      right:buttons[15]?.pressed
    };
    const direction = digitalDpadDirection(dpad);
    if(direction) return direction;
    if(isRecoveryOpen()) return '';
    const shoulder = digitalShoulderKey(buttons);
    return shoulder === 'rb' ? 'right' : shoulder === 'lb' ? 'left' : '';
  }

  function isDuplicateGamepadNavigationKey(direction){
    const repeat = state.controller.digitalRepeat;
    const now = performance.now();
    if(currentPhysicalDigitalDirection() === direction) return true;
    return repeat.lastDirection === direction && now - repeat.lastActionAt <= DIGITAL_NAV_KEYBOARD_DEDUPE_MS;
  }

  function analogNavigationDirection(rawX, rawY, threshold=.62){
    const x = Math.abs(rawX) >= threshold ? rawX : 0;
    const y = Math.abs(rawY) >= threshold ? rawY : 0;
    if(!x && !y) return '';
    if(Math.abs(x) >= Math.abs(y)) return x > 0 ? 'right' : 'left';
    return y > 0 ? 'down' : 'up';
  }

  function handleCommandSearchGamepad(buttons, axes, dpad, now){
    state.controller.analogActive = false;
    paintAnalogCursor();
    const digital = digitalDpadDirection(dpad);
    const analog = analogNavigationDirection(axes[0] || 0, axes[1] || 0);
    const direction = digital || analog;
    runControllerDigitalNavigation(direction ? `search-${direction}` : '', direction, now, direction ? ()=>moveFocus(direction) : null);
    handleGamepadButton('a', buttons[0]?.pressed, ()=>activateFocusedTarget(document.activeElement, 'gamepad'));
    handleGamepadButton('b', buttons[1]?.pressed, ()=>window.RUCA_CONTINUITY?.back?.({source:'controller-b'}));
    handleGamepadButton('x', buttons[2]?.pressed, ()=>{
      if(!window.RUCAMachineHealthTimeline?.controllerAction?.('acknowledge')) handleVirtualKey('CLEAR','gamepad');
    });
    handleGamepadButton('y', buttons[3]?.pressed, ()=>{
      if(!window.RUCAMachineHealthTimeline?.controllerAction?.('evidence')) toggleVirtualKeyboard();
    });
    handleGamepadButton('lb', buttons[4]?.pressed, ()=>cycleVirtualKeyboardPage(-1));
    handleGamepadButton('rb', buttons[5]?.pressed, ()=>cycleVirtualKeyboardPage(1));
    handleGamepadButton('back', buttons[8]?.pressed, closeCommandSearch);
    handleGamepadButton('start', buttons[9]?.pressed, ()=>executeSelectedSearchResult('gamepad'));
  }

  function pollGamepad(){
    if(!navigator.getGamepads) return;
    const pad = Array.from(navigator.getGamepads()).find(Boolean);
    const nextName = pad?.id || '';
    if(state.controller.gamepadName !== nextName){
      state.controller.gamepadName = nextName;
      updateControllerReadout();
    }
    if(!pad){
      resetControllerDigitalRepeat('controller-disconnect', true);
      state.controller.analogActive = false;
      updateLocalEmergencyHold(false, 'controller', performance.now());
      setAnalogHover(null);
      if(state.controller.cursorEl) state.controller.cursorEl.classList.remove('is-active');
      return;
    }
    const now = performance.now();
    const axes = pad.axes || [];
    const buttons = pad.buttons || [];
    const leftX = axes[0] || 0;
    const leftY = axes[1] || 0;
    const rightY = axes[3] || axes[5] || 0;
    const dpad = {up:buttons[12]?.pressed, down:buttons[13]?.pressed, left:buttons[14]?.pressed, right:buttons[15]?.pressed};
    const browserOwnsInput = document.hasFocus() || isRecoveryOpen() || isCommandSearchOpen();
    if(!browserOwnsInput){
      resetControllerDigitalRepeat('window-unfocused', true);
      updateLocalEmergencyHold(false, 'controller', now);
      return;
    }
    const guideHeld = buttons[16]?.pressed === true;
    const startBackHeld = buttons[8]?.pressed === true && buttons[9]?.pressed === true;
    const emergencyHeld = guideHeld || startBackHeld;
    if(updateLocalEmergencyHold(emergencyHeld, guideHeld ? 'guide-button' : 'start-back', now)){
      state.controller.lastButtons.start = true;
      state.controller.lastButtons.back = true;
      state.controller.lastButtons.guide = true;
      return;
    }
    state.controller.lastButtons.guide = false;
    if(!state.controller.enabled) return;
    if(window.RUCA_WORLD_TRAVEL?.isLocked?.()){
      const cancelPressed = buttons[1]?.pressed === true;
      const cancelWasPressed = state.controller.lastButtons.b === true;
      resetControllerDigitalRepeat('world-travel-lock', true);
      state.controller.analogActive = false;
      setAnalogHover(null);
      state.controller.lastButtons.a = buttons[0]?.pressed === true;
      state.controller.lastButtons.b = cancelPressed;
      state.controller.lastButtons.x = buttons[2]?.pressed === true;
      state.controller.lastButtons.y = buttons[3]?.pressed === true;
      state.controller.lastButtons.lb = buttons[4]?.pressed === true;
      state.controller.lastButtons.rb = buttons[5]?.pressed === true;
      state.controller.lastButtons.back = buttons[8]?.pressed === true;
      state.controller.lastButtons.start = buttons[9]?.pressed === true;
      if(cancelPressed && !cancelWasPressed){
        window.RUCA_WORLD_TRAVEL.cancel('controller-b');
        window.RUCA_AUDIO?.cue?.('drawer-close');
      }
      return;
    }

    if(isCommandSearchOpen()){
      handleCommandSearchGamepad(buttons, axes, dpad, now);
      return;
    }

    ensureAnalogCursor();
    moveAnalogCursor(leftX, leftY);
    if(isRecoveryOpen()){
      scrollRecoveryWithTriggers(buttons[6]?.value, buttons[7]?.value);
      handleGamepadButton('a', buttons[0]?.pressed, ()=>activateAnalogTarget());
      handleGamepadButton('b', buttons[1]?.pressed, ()=>window.RUCA_CONTINUITY?.back?.({source:'controller-b'}));
      handleGamepadButton('y', buttons[3]?.pressed, ()=>{
        closeRecoveryOverlay();
        window.setTimeout(()=>openCommandSearch(), 80);
      });
      handleGamepadButton('lb', buttons[4]?.pressed, ()=>dispatchRecoveryAction('switch-window', {direction:-1}));
      handleGamepadButton('rb', buttons[5]?.pressed, ()=>dispatchRecoveryAction('switch-window', {direction:1}));
      handleGamepadButton('back', buttons[8]?.pressed, ()=>closeRecoveryOverlay());
      handleGamepadButton('start', buttons[9]?.pressed, ()=>activateAnalogTarget());
      return;
    }

    scrollWithRightStick(rightY);
    const direction = digitalDpadDirection(dpad);
    const shoulder = digitalShoulderKey(buttons);
    const mediaDeckActive = !!activeMediaDeckController();
    let digitalKey = '';
    let digitalDirection = '';
    let digitalAction = null;
    if(direction){
      digitalKey = `dpad-${direction}`;
      digitalDirection = direction;
      digitalAction = ()=>{
        const repeat = state.controller.digitalRepeat;
        const heldMs = repeat.startedAt ? Math.max(0, now - repeat.startedAt) : 0;
        if(handleMediaDeckDirection(direction, {heldMs, source:'gamepad'})) return;
        if(!handlePass16FPlayDirection(direction, 'controller')) moveFocus(direction);
      };
    }else if(shoulder && !mediaDeckActive){
      digitalKey = shoulder;
      digitalDirection = shoulder === 'rb' ? 'right' : 'left';
      digitalAction = ()=>{
        if(!handlePass16FPlayDirection(digitalDirection, 'controller')) switchNavPage(shoulder === 'rb' ? 1 : -1);
      };
    }
    if(!mediaDeckActive){
      state.controller.lastButtons.lb = buttons[4]?.pressed === true;
      state.controller.lastButtons.rb = buttons[5]?.pressed === true;
    }
    runControllerDigitalNavigation(digitalKey, digitalDirection, now, digitalAction);
    if(mediaDeckActive){
      handleGamepadButton('lb', buttons[4]?.pressed, ()=>{
        if(handleMediaDeckButton('lb', {source:'gamepad'})) return;
        if(!handlePass16FPlayDirection('left', 'controller')) switchNavPage(-1);
      });
      handleGamepadButton('rb', buttons[5]?.pressed, ()=>{
        if(handleMediaDeckButton('rb', {source:'gamepad'})) return;
        if(!handlePass16FPlayDirection('right', 'controller')) switchNavPage(1);
      });
    }
    handleGamepadButton('a', buttons[0]?.pressed, ()=>{
      if(!handleMediaDeckButton('a', {source:'gamepad'})) activateAnalogTarget();
    });
    handleGamepadButton('b', buttons[1]?.pressed, ()=>{
      setAnalogHover(null);
      if(handleMediaDeckButton('b', {source:'gamepad'})) return;
      if(window.RUCA_CONTINUITY?.back) window.RUCA_CONTINUITY.back({source:'controller-b'});
      else if(!closeTopLayer()) focusFirstMeaningful();
    });
    handleGamepadButton('x', buttons[2]?.pressed, ()=>window.RUCAMachineHealthTimeline?.controllerAction?.('acknowledge'));
    handleGamepadButton('y', buttons[3]?.pressed, ()=>{
      if(handleMediaDeckButton('y', {source:'gamepad'})) return;
      if(!window.RUCAMachineHealthTimeline?.controllerAction?.('evidence')) openCommandSearch();
    });
    handleGamepadButton('start', buttons[9]?.pressed, ()=>{
      if((document.body.dataset.world || 'home') !== 'home'){
        window.RUCA_CORE_NAV?.route?.('home', {replace:true, source:'controller-start'});
      }else{
        window.RUCA_CORE_NAV?.arm?.();
      }
    });
  }

  function handleGamepadButton(name, pressed, action){
    const was = !!state.controller.lastButtons[name];
    state.controller.lastButtons[name] = !!pressed;
    if(pressed && !was){
      action();
      window.RUCA_AUDIO?.cue(name === 'b' ? 'drawer-close' : 'activate');
    }
  }

  function switchNavPage(delta){
    const navs = qsa('.world-nav .nav-btn');
    const current = navs.findIndex(btn=>btn.classList.contains('active'));
    if(current < 0 || !navs.length) return;
    const next = navs[(current + delta + navs.length) % navs.length];
    if(window.RUCA_CORE_NAV?.route){
      window.RUCA_CORE_NAV.route(next.dataset.page, {source:'controller-shoulder'});
    }else{
      next.click();
    }
  }

  function updateControllerReadout(){
    const readout = qs('#rucaControllerReadout');
    const gamepad = qs('#rucaGamepadReadout');
    const strength = state.controller.focusStrength || 70;
    const hasPad = !!state.controller.gamepadName;
    if(readout) readout.textContent = state.controller.enabled ? (hasPad ? 'ANALOG CURSOR READY' : 'NO GAMEPAD') : 'KEYBOARD ONLY';
    if(gamepad) gamepad.textContent = hasPad
      ? `${state.controller.gamepadName} // Start + Back recovery // left stick cursor // Y search // D-pad focus // strength ${strength}`
      : (state.controller.enabled ? 'No gamepad detected. Keyboard/WASD focus active; global recovery is reported separately.' : `Focus strength ${strength} // emergency combo monitor armed`);
  }

  function installPass16MotionFeedback(){
    if(document.body.dataset.pass16MotionReady === 'true') return;
    document.body.dataset.pass16MotionReady = 'true';
    const interactiveSelector = '.nav-btn,.core-return-anchor,.lane-btn,.world-card,.sensor-btn,.bench-btn,.scan-btn,.app-card,.app-orbit-node,.launch-node,.command-wheel-action,.command-filter-btn,.command-favorite-toggle,.theme-preset,.star-preset,.ruca-restore-btn,.ruca-command-button,.ruca-world-feed-card,.source-test-row button,.source-status-card button,summary';

    document.addEventListener('pointerdown', event=>{
      const target = event.target.closest?.(interactiveSelector);
      if(target) oneShotClass(target, 'ruca-confirm-pulse', 520);
    }, {capture:true});

    document.addEventListener('focusin', event=>{
      const target = event.target.closest?.('.gamepad-focusable,button,a,input,select,textarea,summary,[tabindex]');
      if(target) oneShotClass(target, 'ruca-focus-rise', 420);
    }, {capture:true});

    document.addEventListener('click', event=>{
      const route = event.target.closest?.('.nav-btn,.lane-btn,.world-card[data-page]');
      if(route) oneShotClass(document.body, 'ruca-page-motion', 460);
      const warning = event.target.closest?.('[data-source-retry],[data-source-configure],.source-status-card button');
      if(warning) oneShotClass(warning, 'ruca-warning-pulse', 620);
    }, {capture:true});
  }

  function oneShotClass(el, className, fallbackMs=500){
    if(!el || el.classList.contains(className)) return;
    el.classList.add(className);
    const cleanup = () => el.classList.remove(className);
    el.addEventListener('animationend', cleanup, {once:true});
    window.setTimeout(cleanup, fallbackMs);
  }

  function installControlSliders(){
    qsa('#page-control .slider-row input[type="range"]').forEach(slider=>{
      if(slider.dataset.pass18PreviewReady === 'true') return;
      slider.dataset.pass18PreviewReady = 'true';
      syncRangeProgress(slider);
      slider.addEventListener('input',()=>{
        const row = slider.closest('.slider-row');
        const label = (row?.querySelector('span')?.textContent || row?.textContent || '').toLowerCase();
        const val = Number(slider.value || 50);
        syncRangeProgress(slider);
        const readout = row?.querySelector('b');
        if(readout) readout.textContent = slider.id === 'rucaHomeScale' ? `${val}%` : String(val);
        if(label.includes('cockpit brightness')) applyCockpitBrightness(val, true);
      });
    });
  }

  function syncRangeProgress(slider){
    if(!slider) return;
    const min = Number(slider.min || 0);
    const max = Number(slider.max || 100);
    const value = Number(slider.value || min);
    const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;
    slider.style.setProperty('--range-progress', `${Math.max(0, Math.min(100, progress)).toFixed(2)}%`);
    slider.setAttribute('aria-valuenow', String(value));
  }

  function syncCoreMotionBudget(value){
    const level = Math.max(0, Math.min(100, Number(value) || 0));
    const motionOwner = qs('#homeChronograph');
    if(!motionOwner) return;
    const machineCycle = Math.max(1800, Math.min(3000, Math.round(2400 - (level - 42) * 10)));
    motionOwner.style.setProperty('--machine-cycle', `${machineCycle}ms`);
    motionOwner.style.setProperty('--machine-half-cycle', `${Math.round(machineCycle / 2)}ms`);
  }

  function installPass17C1HomeGeometry(){
    const board = qs('#homeChronograph');
    if(!board || board.dataset.pass17c1Geometry === 'true') return;
    board.dataset.pass17c1Geometry = 'true';
    let frame = 0;
    let lastModel = null;

    const refresh = ()=>{
      if((document.body.dataset.world || 'home') !== 'home') return;
      if(frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(()=>{
        frame = 0;
        const width = board.clientWidth;
        const height = board.clientHeight;
        if(width < 1 || height < 1) return;
        lastModel = computePass17C1HomeGeometry(width, height, window.innerWidth, window.innerHeight);
        applyPass17C1HomeGeometry(board, lastModel);
        document.documentElement.dataset.rucaHomeGeometry = 'ready';
      });
    };
    const setGuide = enabled=>{
      board.dataset.geometryGuide = enabled ? 'true' : 'false';
      return board.dataset.geometryGuide;
    };

    const geometryApi = {
      compute:computePass17C1HomeGeometry,
      refresh,
      setGuide,
      get model(){ return lastModel ? JSON.parse(JSON.stringify(lastModel)) : null; }
    };
    window.RUCA_HOME_GEOMETRY = geometryApi;

    if(typeof ResizeObserver === 'function'){
      const observer = new ResizeObserver(refresh);
      observer.observe(board);
      geometryApi.observer = observer;
    }else{
      window.addEventListener('resize', refresh, {passive:true});
    }
    document.addEventListener('ruca:continuity-change', event=>{
      if(event.detail?.type === 'route-changed' && event.detail?.to === 'home') refresh();
    });
    if(document.fonts?.ready) document.fonts.ready.then(refresh).catch(()=>{});
    setGuide(new URLSearchParams(window.location.search).get('geometry') === '1');
    refresh();
  }

  function computePass17C1HomeGeometry(width, height, viewportWidth=window.innerWidth, viewportHeight=window.innerHeight){
    const w = Math.max(1, Number(width) || 1);
    const h = Math.max(1, Number(height) || 1);
    const vw = Math.max(1, Number(viewportWidth) || w);
    const vh = Math.max(1, Number(viewportHeight) || h);
    const stacked = vw < 820 || w < 760;
    const mode = stacked ? 'stacked' : (h < 470 || vh < 850 || w < 1100 ? 'compact' : 'full');

    if(stacked){
      const coreDiameter = clampHomeGeometry(Math.min(w * .44, 240), 180, 240);
      const gaugeDiameter = clampHomeGeometry(Math.min((w - 54) / 2, 164), 124, 164);
      const navWidth = clampHomeGeometry((w - 44) / 2, 126, 158);
      const navHeight = 48;
      const coreRadius = coreDiameter / 2;
      const gaugeRadius = gaugeDiameter / 2;
      const core = {x:w / 2, y:coreRadius + 72};
      const navX = Math.max(navWidth / 2 + 14, w * .25);
      const navRightX = w - navX;
      const navUpperY = core.y + coreRadius + 62;
      const navLowerY = navUpperY + navHeight + 18;
      const rowOne = navLowerY + navHeight / 2 + gaugeRadius + 62;
      const rowStep = gaugeDiameter + 30;
      const gaugeLeftX = Math.max(gaugeRadius + 18, w * .25);
      const gaugeRightX = w - gaugeLeftX;
      const requiredHeight = rowOne + rowStep * 2 + gaugeRadius + 34;
      const gauges = {
        cpu:{x:gaugeLeftX - core.x, y:rowOne - core.y},
        storage:{x:gaugeRightX - core.x, y:rowOne - core.y},
        gpu:{x:gaugeLeftX - core.x, y:rowOne + rowStep - core.y},
        network:{x:gaugeRightX - core.x, y:rowOne + rowStep - core.y},
        ram:{x:gaugeLeftX - core.x, y:rowOne + rowStep * 2 - core.y},
        thermal:{x:gaugeRightX - core.x, y:rowOne + rowStep * 2 - core.y}
      };
      const navigation = {
        home:{x:0, y:-(core.y - navHeight / 2 - 12)},
        play:{x:navX - core.x, y:navUpperY - core.y},
        live:{x:navRightX - core.x, y:navUpperY - core.y},
        diagnostics:{x:navX - core.x, y:navLowerY - core.y},
        control:{x:navRightX - core.x, y:navLowerY - core.y}
      };
      return finalizeHomeGeometry({
        mode,w,h,core,coreDiameter,gaugeDiameter,navWidth,navHeight,
        orbitX:Math.abs(gauges.gpu.x),orbitY:rowStep,
        navOrbit:Math.hypot(navigation.play.x,navigation.play.y),
        gauges,navigation,requiredHeight
      });
    }

    const compact = mode === 'compact';
    const coreDiameter = compact
      ? clampHomeGeometry(Math.min(w * .22, h * .49), 160, 245)
      : clampHomeGeometry(Math.min(w * .27, h * .675), 340, 459);
    const gaugeDiameter = compact
      ? clampHomeGeometry(Math.min(w * .12, h * .32), 88, 128)
      : clampHomeGeometry(Math.min(w * .13, h * .35), 150, 220);
    const navWidth = compact ? 146 : 180;
    const navHeight = compact ? 52 : 62;
    const coreRadius = coreDiameter / 2;
    const gaugeRadius = gaugeDiameter / 2;
    const core = {x:w / 2, y:h / 2};
    const availableX = Math.max(0, w / 2 - gaugeRadius - 14);
    const availableY = Math.max(0, h / 2 - gaugeRadius - 10);
    // HOME composition calibration: desktop satellites orbit ten percent farther
    // from the fixed Heart.  Their positions and conduit lengths remain derived
    // from this one shared geometry model; compact and stacked modes stay intact.
    const compositionOrbitScale = compact ? 1 : 1.16;
    const orbitX = Math.min(w * (compact ? .36 : .375) * compositionOrbitScale, availableX, compact ? 580 : 835);
    const orbitY = Math.min(h * (compact ? .42 : .44) * compositionOrbitScale, availableY / (compact ? .82 : .78));
    const upperX = orbitX * (compact ? .70 : .72);
    const upperY = orbitY * (compact ? .82 : .78);
    const gauges = {
      cpu:{x:-upperX,y:-upperY},
      storage:{x:upperX,y:-upperY},
      gpu:{x:-orbitX,y:0},
      network:{x:orbitX,y:0},
      ram:{x:-upperX,y:upperY},
      thermal:{x:upperX,y:upperY}
    };
    let navX;
    let navY;
    let navOrbit;
    if(compact){
      navX = Math.min(coreRadius + navWidth / 2 - 24, w / 2 - navWidth / 2 - 8);
      navY = Math.min(coreRadius + navHeight / 2 + 8, h / 2 - navHeight / 2 - 8);
      navOrbit = Math.hypot(navX,navY);
    }else{
      const upperGaugeAngle = Math.atan2(-upperY,-upperX);
      const navAngle = (upperGaugeAngle - Math.PI / 2) / 2;
      const desiredRadius = coreRadius + navWidth / 2 + 58;
      const maxRadiusX = (w / 2 - navWidth / 2 - 8) / Math.max(.01,Math.abs(Math.cos(navAngle)));
      const maxRadiusY = (h / 2 - navHeight / 2 - 8) / Math.max(.01,Math.abs(Math.sin(navAngle)));
      navOrbit = Math.min(desiredRadius,maxRadiusX,maxRadiusY);
      navX = Math.abs(Math.cos(navAngle) * navOrbit);
      navY = Math.abs(Math.sin(navAngle) * navOrbit);
    }
    const homeRadius = Math.min(coreRadius + navHeight / 2 + (compact ? 30 : 42), h / 2 - navHeight / 2 - 8);
    const navigation = {
      home:{x:0,y:-homeRadius},
      play:{x:-navX,y:-navY},
      live:{x:navX,y:-navY},
      diagnostics:{x:-navX,y:navY},
      control:{x:navX,y:navY}
    };
    return finalizeHomeGeometry({
      mode,w,h,core,coreDiameter,gaugeDiameter,navWidth,navHeight,
      orbitX,orbitY,navOrbit,
      gauges,navigation,requiredHeight:h
    });
  }

  function finalizeHomeGeometry(model){
    const coreRadius = model.coreDiameter / 2;
    const gaugeRadius = model.gaugeDiameter / 2;
    const maxRing = Math.max(model.coreDiameter + 16, Math.min(model.w - 18, model.h - 18));
    model.coreRadius = coreRadius;
    model.gaugeRadius = gaugeRadius;
    model.conduitStartRadius = coreRadius;
    model.conduitEndRadius = gaugeRadius;
    model.rings = {
      inner:Math.min(model.coreDiameter + 46, maxRing),
      middle:Math.min(model.coreDiameter + 112, maxRing),
      outer:Math.min(model.coreDiameter + 206, maxRing)
    };
    model.conduits = {};
    Object.entries(model.gauges).forEach(([name,point])=>{
      model.conduits[name] = {
        angle:Math.atan2(point.y, point.x) * 180 / Math.PI,
        length:Math.hypot(point.x, point.y)
      };
    });
    return model;
  }

  function applyPass17C1HomeGeometry(board, model){
    const px = value=>`${Number(value).toFixed(3)}px`;
    const write = (name,value)=>board.style.setProperty(name,value);
    board.dataset.homeGeometryMode = model.mode;
    write('--home-core-x',px(model.core.x));
    write('--home-core-y',px(model.core.y));
    write('--home-core-radius',px(model.coreRadius));
    write('--home-core-diameter',px(model.coreDiameter));
    write('--home-gauge-radius',px(model.gaugeRadius));
    write('--home-gauge-diameter',px(model.gaugeDiameter));
    write('--home-gauge-orbit-radius-x',px(model.orbitX));
    write('--home-gauge-orbit-radius-y',px(model.orbitY));
    write('--home-nav-orbit-radius',px(model.navOrbit));
    write('--home-nav-width',px(model.navWidth));
    write('--home-nav-height',px(model.navHeight));
    write('--home-conduit-start-radius',px(model.conduitStartRadius));
    write('--home-conduit-end-radius',px(model.conduitEndRadius));
    write('--home-ring-inner',px(model.rings.inner));
    write('--home-ring-middle',px(model.rings.middle));
    write('--home-ring-outer',px(model.rings.outer));
    write('--home-board-required-height',px(model.requiredHeight));

    Object.entries(model.gauges).forEach(([name,point])=>{
      const gauge = qs(`.comp-${name}`, board);
      if(!gauge) return;
      const conduit = model.conduits[name];
      const portAngle = conduit ? ((conduit.angle + 360) % 360) - 180 : 0;
      gauge.style.setProperty('--home-node-x',px(model.core.x + point.x));
      gauge.style.setProperty('--home-node-y',px(model.core.y + point.y));
      gauge.style.setProperty('--gauge-port-angle',`${portAngle.toFixed(6)}deg`);
      gauge.dataset.homeCenterX = (model.core.x + point.x).toFixed(3);
      gauge.dataset.homeCenterY = (model.core.y + point.y).toFixed(3);
      gauge.dataset.gaugePortAngle = portAngle.toFixed(6);
    });

    Object.entries(model.navigation).forEach(([name,point])=>{
      const beacon = qs(`.core-beacon-${name}`, board);
      if(!beacon) return;
      const distance = Math.hypot(point.x,point.y);
      const angleToCore = Math.atan2(-point.y,-point.x) * 180 / Math.PI;
      beacon.style.setProperty('--home-node-x',px(model.core.x + point.x));
      beacon.style.setProperty('--home-node-y',px(model.core.y + point.y));
      beacon.style.setProperty('--home-beacon-angle',`${angleToCore.toFixed(6)}deg`);
      beacon.style.setProperty('--home-beacon-length',px(distance));
      beacon.dataset.homeCenterX = (model.core.x + point.x).toFixed(3);
      beacon.dataset.homeCenterY = (model.core.y + point.y).toFixed(3);
      beacon.dataset.angleToCore = angleToCore.toFixed(6);
      beacon.dataset.distanceToCore = distance.toFixed(3);
    });

    Object.entries(model.conduits).forEach(([name,conduit])=>{
      const line = qs(`.${name}-line`, board);
      if(!line) return;
      line.style.setProperty('--home-conduit-angle',`${conduit.angle.toFixed(6)}deg`);
      line.style.setProperty('--home-conduit-length',px(conduit.length));
      line.dataset.angleDeg = conduit.angle.toFixed(6);
      line.dataset.length = conduit.length.toFixed(3);
    });
  }

  function clampHomeGeometry(value,min,max){
    return Math.max(min,Math.min(max,value));
  }

  function installRucaAudioHooks(){
    if(window.RUCA_AUDIO?.installed) return;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    const cueMap = {
      hover:{freq:420, end:520, type:'triangle', duration:.038, gain:.18},
      focus:{freq:360, end:440, type:'sine', duration:.045, gain:.14},
      activate:{freq:210, end:380, type:'triangle', duration:.065, gain:.22},
      click:{freq:250, end:460, type:'triangle', duration:.055, gain:.20},
      confirm:{freq:520, end:760, type:'triangle', duration:.12, gain:.20},
      error:{freq:160, end:92, type:'sawtooth', duration:.15, gain:.16},
      muted:{freq:180, end:135, type:'sine', duration:.075, gain:.12},
      'drawer-open':{freq:310, end:560, type:'triangle', duration:.09, gain:.18},
      'drawer-close':{freq:290, end:150, type:'triangle', duration:.085, gain:.16},
      'theme-apply':{freq:620, end:920, type:'triangle', duration:.14, gain:.19},
      'source-retry':{freq:430, end:610, type:'square', duration:.085, gain:.13},
      'world-change':{freq:280, end:480, type:'triangle', duration:.07, gain:.16},
      'lane-change':{freq:340, end:510, type:'triangle', duration:.06, gain:.15},
      'sensor-focus':{freq:500, end:410, type:'sine', duration:.05, gain:.12},
      'scan-command':{freq:210, end:650, type:'triangle', duration:.12, gain:.18}
    };
    const audioState = {
      installed:true,
      muted:true,
      volume:state.audio.volume || 25,
      setMuted(value){
        this.muted = value !== false;
        state.audio.enabled = !this.muted;
        updateAudioReadout();
      },
      setVolume(value){
        const level = Math.max(0, Math.min(100, Number(value ?? 25)));
        this.volume = level;
        state.audio.volume = level;
        if(state.audio.master) state.audio.master.gain.value = masterGain(level);
        updateAudioReadout();
      },
      async ensure(){
        if(!AudioContextCtor){
          state.audio.error = 'Web Audio unavailable';
          updateAudioReadout();
          throw new Error(state.audio.error);
        }
        if(!state.audio.ctx){
          state.audio.ctx = new AudioContextCtor();
          state.audio.master = state.audio.ctx.createGain();
          state.audio.master.gain.value = masterGain(this.volume);
          state.audio.master.connect(state.audio.ctx.destination);
        }
        if(state.audio.ctx.state === 'suspended') await state.audio.ctx.resume();
        state.audio.blocked = state.audio.ctx.state !== 'running';
        state.audio.error = state.audio.blocked ? `AudioContext ${state.audio.ctx.state}` : '';
        updateAudioReadout();
        return state.audio.ctx;
      },
      cue(name, options={}){
        const cueName = name || 'click';
        const stamped = `${cueName} @ ${new Date().toLocaleTimeString([], {hour:'numeric', minute:'2-digit', second:'2-digit'})}`;
        state.audio.lastCue = stamped;
        document.documentElement.dataset.rucaLastAudioCue = cueName;
        if(typeof CustomEvent === 'function'){
          document.dispatchEvent(new CustomEvent('ruca:audio-cue', {detail:{name:cueName, muted:this.muted}}));
        }
        updateAudioReadout();
        if(this.muted && !options.force) return;
        this.ensure()
          .then(ctx=>playSynthCue(ctx, cueName, options))
          .catch(err=>{
            state.audio.error = err.message || String(err);
            updateAudioReadout();
          });
      }
    };
    window.RUCA_AUDIO = audioState;
    document.documentElement.dataset.rucaAudioHooks = 'muted';
    updateAudioReadout();
    document.addEventListener('click', event=>{
      const target = event.target.closest('.nav-btn,.lane-btn,.world-card,.sensor-btn,.bench-btn,.scan-btn,.app-card,.app-orbit-node,.launch-node,.command-wheel-action,.command-filter-btn,.command-favorite-toggle,#closeDrawer');
      if(!target) return;
      let cue = 'click';
      if(target.matches('.nav-btn')) cue = 'world-change';
      else if(target.matches('.lane-btn,.world-card')) cue = 'lane-change';
      else if(target.matches('.sensor-btn')) cue = 'sensor-focus';
      else if(target.matches('.scan-btn,.bench-btn')) cue = 'scan-command';
      else if(target.matches('#closeDrawer')) cue = 'drawer-close';
      audioState.cue(cue);
    }, {capture:true});

    function masterGain(volume){
      return (Math.max(0, Math.min(100, Number(volume || 0))) / 100) * .18;
    }

    function playSynthCue(ctx, name, options={}){
      const base = cueMap[name] || cueMap.click;
      const soft = document.body.classList.contains('motion-low') || qs('#rucaReducedMotion')?.checked;
      const duration = Math.max(.025, base.duration * (soft ? .72 : 1));
      const gainLevel = base.gain * (soft ? .55 : 1) * (options.force ? 1.12 : 1);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const now = ctx.currentTime;
      osc.type = base.type || 'triangle';
      osc.frequency.setValueAtTime(base.freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, base.end || base.freq), now + duration);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(720, now + duration);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(.0002, gainLevel), now + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(state.audio.master || ctx.destination);
      osc.start(now);
      osc.stop(now + duration + .02);
    }
  }

  function updateAudioReadout(){
    const readout = qs('#rucaAudioReadout');
    const last = qs('#rucaAudioLastCue');
    let label = state.audio.enabled ? 'ENABLED' : 'MUTED';
    if(state.audio.error) label = 'ERROR';
    else if(state.audio.blocked) label = 'BLOCKED';
    if(readout) readout.textContent = label;
    if(last) last.textContent = `Last cue: ${state.audio.lastCue || 'none'}`;
    document.documentElement.dataset.rucaAudioState = label.toLowerCase();
    syncAudioControls({enabled:state.audio.enabled, volume:state.audio.volume});
  }

  async function installRuntimeProfile(){
    const runtime = window.RUCA_RUNTIME_PROFILE;
    if(!runtime || runtime.id !== LOUNGE_PROFILE_ID || document.body.dataset.rucaLoungeReady) return;
    document.body.dataset.rucaLoungeReady = 'loading';
    const profile = await runtime.ready || {};
    const theme = normalizeTheme({
      ...PASS12_THEME_PRESETS.lounge,
      ...(profile.theme || {}),
      preset:'lounge',
      name:profile.label || PASS12_THEME_PRESETS.lounge.name
    });
    document.body.classList.add('ruca-3dixon-lounge');
    document.body.dataset.rucaRuntimeProfile = LOUNGE_PROFILE_ID;
    document.body.dataset.rucaDimBrightness = String(profile.display?.dimNightBrightness || 34);
    document.title = 'RUCA OS // DEMO Lounge';
    applyTheme(theme, true);

    const requestedBrightness = Number(profile.display?.brightness || 52);
    if(state.command.dimNight) applyDimNight(true, true, false);
    else applyCockpitBrightness(requestedBrightness, true, false);

    const focusStrength = Math.max(1, Math.min(100, Number(profile.controller?.focusStrength || 88)));
    state.controller.focusStrength = focusStrength;
    const focusInput = qs('#rucaFocusStrength');
    if(focusInput){
      focusInput.value = String(focusStrength);
      syncRangeProgress(focusInput);
      const readout = focusInput.closest('.slider-row')?.querySelector('b');
      if(readout) readout.textContent = String(focusStrength);
    }
    const controllerToggle = qs('#rucaControllerMode');
    if(controllerToggle) controllerToggle.checked = profile.controller?.enabled !== false;
    setControllerMode(profile.controller?.enabled !== false);

    const machineName = qs('.machine-name');
    if(machineName) machineName.textContent = profile.machineLabel || '3DEMO WORKSTATION';
    const caption = qs('.home-caption-copy span');
    if(caption) caption.textContent = 'Lounge profile active. Real telemetry and command routes remain inside the canonical RUCA shell.';
    const footerName = qs('.profile-chip span');
    const footerMode = qs('.profile-chip small');
    if(footerName) footerName.textContent = 'DEMO';
    if(footerMode) footerMode.textContent = 'Lounge Mode';

    qsa('.world-nav .nav-btn').forEach(button=>{
      if(button.dataset.loungeFocusReady) return;
      button.dataset.loungeFocusReady = 'true';
      button.addEventListener('click', ()=>focusElement(button));
    });

    const recovery = qs('#rucaLoungeRecovery');
    if(recovery && !recovery.dataset.loungeReady){
      recovery.dataset.loungeReady = 'true';
      recovery.addEventListener('click', ()=>window.RUCA_RECOVERY?.open?.());
    }
    const detailToggle = qs('#rucaLoungeDetailsToggle');
    if(detailToggle && !detailToggle.dataset.loungeReady){
      detailToggle.dataset.loungeReady = 'true';
      detailToggle.addEventListener('click', ()=>{
        state.loungeDetailOpen = !state.loungeDetailOpen;
        document.body.classList.toggle('lounge-details-open', state.loungeDetailOpen);
        detailToggle.setAttribute('aria-expanded', state.loungeDetailOpen ? 'true' : 'false');
        detailToggle.textContent = state.loungeDetailOpen ? 'HIDE LIVE DETAIL' : 'SHOW LIVE DETAIL';
        if(state.loungeDetailOpen) renderTelemetryDiagnostics(state.normalizedTelemetry || emptyTelemetry('CHECKING'));
        window.RUCA_AUDIO?.cue(state.loungeDetailOpen ? 'drawer-open' : 'drawer-close');
      });
    }

    const defaultFilter = profile.play?.defaultFilter || 'games-district';
    const activateDefaultFilter = ()=>window.RUCA_PLAY_COMMANDS?.filter?.(defaultFilter);
    activateDefaultFilter();
    document.addEventListener('ruca:play-registry-ready', activateDefaultFilter, {once:true});

    setControlRealm('environment', false);
    qs('#page-control .motion-control-section')?.setAttribute('open','');
    renderTelemetryDiagnostics(state.normalizedTelemetry || emptyTelemetry('CHECKING'));
    window.RUCA_HOME_GEOMETRY?.refresh?.();
    markFocusableControls();
    document.body.dataset.rucaLoungeReady = 'true';
  }

  function validThemeColor(value, fallback=''){
    const requested = String(value || '').trim().toLowerCase();
    if(/^#[0-9a-f]{6}$/.test(requested)) return requested;
    if(/^#[0-9a-f]{3}$/.test(requested)){
      return `#${requested.slice(1).split('').map(part=>part + part).join('')}`;
    }
    return fallback;
  }

  function deriveThemeSurfaceColor(color, redOffset=0, greenOffset=0, blueOffset=0, alpha=1){
    const normalized = validThemeColor(color, '#000000');
    const channel = start=>Number.parseInt(normalized.slice(start, start + 2), 16);
    const clamp = value=>Math.max(0, Math.min(255, Math.round(value)));
    const red = clamp(channel(1) + Number(redOffset || 0));
    const green = clamp(channel(3) + Number(greenOffset || 0));
    const blue = clamp(channel(5) + Number(blueOffset || 0));
    if(Number(alpha) < 1) return `rgba(${red},${green},${blue},${Number(alpha)})`;
    return `#${[red,green,blue].map(value=>value.toString(16).padStart(2,'0')).join('')}`;
  }

  function sanitizePalettePatch(patch={}){
    const source = patch && typeof patch === 'object' && !Array.isArray(patch) ? patch : {};
    return Object.fromEntries(Object.keys(PASS50_THEME_TOKENS).flatMap(token=>{
      const color = validThemeColor(source[token]);
      return color ? [[token, color]] : [];
    }));
  }

  function paletteProviderForPreset(preset){
    const requested = String(preset || '');
    for(const [provider, definition] of Object.entries(PASS50_PALETTE_PROVIDERS)){
      if(definition?.palettes && Object.prototype.hasOwnProperty.call(definition.palettes, requested)) return provider;
    }
    return null;
  }

  function legacyPalettePatch(theme={}){
    const primary = validThemeColor(theme.gold);
    const secondary = validThemeColor(theme.gold2);
    const gauge = validThemeColor(theme.gaugeColor, primary);
    const patch = {
      primary,
      secondary,
      tertiary:validThemeColor(theme.tertiary),
      background:validThemeColor(theme.background),
      housing:validThemeColor(theme.housing),
      bezel:validThemeColor(theme.bezel),
      screws:validThemeColor(theme.screws),
      mechanicalMetal:validThemeColor(theme.mechanicalMetal),
      gears:validThemeColor(theme.gears),
      jewels:validThemeColor(theme.jewels),
      glassTint:validThemeColor(theme.glassTint),
      telemetryTrace:gauge,
      needles:validThemeColor(theme.needles, gauge),
      rails:validThemeColor(theme.rails, primary),
      conduitPackets:validThemeColor(theme.conduitPackets, primary),
      stars:validThemeColor(theme.starColor, primary),
      particles:validThemeColor(theme.starColor2, secondary),
      aura:validThemeColor(theme.starBreathColor, primary),
      glow:validThemeColor(theme.glowColor, primary),
      primaryText:validThemeColor(theme.primaryText),
      secondaryText:validThemeColor(theme.textSecondary),
      mutedText:validThemeColor(theme.mutedText),
      warning:validThemeColor(theme.warning),
      critical:validThemeColor(theme.critical),
      success:validThemeColor(theme.success)
    };
    return sanitizePalettePatch(patch);
  }

  function resolvePaletteLayers(theme=null, temporaryState=null){
    const source = theme && typeof theme === 'object' && !Array.isArray(theme) ? theme : {};
    const interactionState = temporaryState && typeof temporaryState === 'object' && !Array.isArray(temporaryState)
      ? temporaryState
      : {};
    const suppliedState = source.paletteState && typeof source.paletteState === 'object' && !Array.isArray(source.paletteState)
      ? source.paletteState
      : null;
    const sourceKeys = Object.keys(source);
    const legacyPreset = String(source.preset || '');
    let preset = suppliedState
      ? (suppliedState.preset == null ? null : String(suppliedState.preset))
      : (Object.prototype.hasOwnProperty.call(PASS50_PRESET_PALETTES, legacyPreset) ? legacyPreset : null);
    if(!suppliedState && sourceKeys.length === 0) preset = 'default';
    let provider = suppliedState
      ? (suppliedState.provider == null ? null : String(suppliedState.provider))
      : paletteProviderForPreset(preset);
    let presetPalette = preset && PASS50_PRESET_PALETTES[preset]
      ? sanitizePalettePatch(PASS50_PRESET_PALETTES[preset])
      : sanitizePalettePatch(suppliedState?.presetPalette);
    if(!suppliedState && legacyPreset === 'team' && source.teamPrimary){
      preset = `sports-${source.teamSlug || 'team'}`;
      provider = 'sports';
      presetPalette = sanitizePalettePatch(paletteFromAccents(
        validThemeColor(source.teamPrimary, PASS50_ENGINE_DEFAULT_PALETTE.primary),
        validThemeColor(source.teamSecondary, PASS50_ENGINE_DEFAULT_PALETTE.secondary),
        validThemeColor(source.teamHighlight, PASS50_ENGINE_DEFAULT_PALETTE.tertiary)
      ));
    }

    const groupOverrides = {};
    const requestedGroups = suppliedState?.groupOverrides && typeof suppliedState.groupOverrides === 'object'
      ? suppliedState.groupOverrides
      : {};
    for(const group of Object.keys(PASS50_THEME_GROUPS)){
      const color = validThemeColor(requestedGroups[group]);
      if(color) groupOverrides[group] = color;
    }

    let tokenOverrides = sanitizePalettePatch(suppliedState?.tokenOverrides);
    if(!suppliedState){
      const migrated = {
        ...sanitizePalettePatch(source.palette),
        ...legacyPalettePatch(source)
      };
      const inherited = {...PASS50_ENGINE_DEFAULT_PALETTE, ...presetPalette};
      tokenOverrides = Object.fromEntries(Object.entries(migrated).filter(([token,color])=>
        !preset || validThemeColor(inherited[token]) !== color
      ));
    }

    const palette = {
      ...PASS50_ENGINE_DEFAULT_PALETTE,
      ...presetPalette
    };
    for(const [group,color] of Object.entries(groupOverrides)){
      for(const token of PASS50_THEME_GROUPS[group]) palette[token] = color;
    }
    Object.assign(palette, tokenOverrides);
    Object.assign(palette, sanitizePalettePatch(interactionState?.palette || interactionState));

    const hasOverrides = Object.keys(groupOverrides).length > 0 || Object.keys(tokenOverrides).length > 0;
    const requestedMode = String(suppliedState?.mode || '').toLowerCase();
    let mode = preset || provider || Object.keys(presetPalette).length ? (hasOverrides ? 'derived' : 'preset') : 'custom';
    if(requestedMode === 'custom' && !preset && !provider) mode = 'custom';

    return {
      palette:sanitizePalettePatch(palette),
      paletteState:{
        mode,
        preset:preset || null,
        provider:provider || null,
        presetPalette,
        groupOverrides,
        tokenOverrides
      }
    };
  }

  function normalizeTheme(theme={}){
    const base = PASS12_THEME_PRESETS.default;
    const merged = {...base, ...theme};
    const resolved = resolvePaletteLayers(theme);
    const palette = resolved.palette;
    const requestedMode = String(merged.homeViewMode || 'desk').toLowerCase();
    const homeViewMode = Object.prototype.hasOwnProperty.call(HOME_VIEW_PRESETS, requestedMode) || requestedMode === 'custom'
      ? requestedMode
      : 'desk';
    const requestedScale = Number(merged.homeScale);
    const homeScale = Math.max(70, Math.min(100, Number.isFinite(requestedScale) ? requestedScale : HOME_VIEW_PRESETS.desk));
    const selectedPreset = resolved.paletteState.preset && PASS12_THEME_PRESETS[resolved.paletteState.preset];
    return {
      ...merged,
      preset:theme.preset || resolved.paletteState.preset || 'custom',
      name:theme.name || selectedPreset?.name || merged.name || 'Custom Command',
      palette,
      paletteState:resolved.paletteState,
      gold:palette.primary,
      gold2:palette.secondary,
      text:palette.primary,
      textSecondary:palette.secondaryText,
      textValue:palette.telemetryTrace,
      navText:palette.primary,
      gaugeColor:palette.telemetryTrace,
      glowColor:palette.glow,
      starColor:palette.stars,
      starColor2:palette.particles,
      starBreathColor:palette.aura,
      homeViewMode,
      homeScale
    };
  }

  function loadTheme(){
    let stored = {};
    try{ stored = JSON.parse(localStorage.getItem('rucaTheme') || '{}') || {}; }catch(err){ stored = {}; }
    const activeSlot = Number(localStorage.getItem(ACTIVE_THEME_PROFILE_STORAGE_KEY) || 0);
    const bank = readCustomThemeProfileBank();
    const savedProfile = activeSlot >= 1 && activeSlot <= CUSTOM_THEME_PROFILE_SLOT_COUNT
      ? bank.slots[String(activeSlot)]
      : null;
    const restored = savedProfile
      ? {...(savedProfile.theme || savedProfile), preset:`custom-${activeSlot}`, name:profileDisplayName(activeSlot, savedProfile), customSlot:activeSlot}
      : stored;
    applyTheme(normalizeTheme(restored), true);
    if(qs('#rucaWeatherLat')) qs('#rucaWeatherLat').value = localStorage.getItem('rucaWeatherLat') || '';
    if(qs('#rucaWeatherLon')) qs('#rucaWeatherLon').value = localStorage.getItem('rucaWeatherLon') || '';
    if(qs('#rucaWeatherName')) qs('#rucaWeatherName').value = localStorage.getItem('rucaWeatherName') || '';
  }

  function readThemeControls(){
    const current = state.theme || normalizeTheme({});
    return normalizeTheme({
      ...current,
      font: qs('#rucaFontPick')?.value || current.font || PASS12_THEME_PRESETS.default.font,
      homeViewMode: qs('#rucaHomeViewMode')?.value || 'desk',
      homeScale: Number(qs('#rucaHomeScale')?.value || HOME_VIEW_PRESETS.desk),
      depth: Number(qs('#rucaDepthSlider')?.value || PASS12_THEME_PRESETS.default.depth),
      glow: Number(qs('#rucaGlowSlider')?.value || PASS12_THEME_PRESETS.default.glow),
      glass: Number(qs('#rucaGlassSlider')?.value || PASS12_THEME_PRESETS.default.glass),
      motion: Number(qs('#rucaMotionSlider')?.value || PASS12_THEME_PRESETS.default.motion),
      density: Number(qs('#rucaStarDensity')?.value || PASS12_THEME_PRESETS.default.density),
      reducedMotion: !!qs('#rucaReducedMotion')?.checked,
      starPreset: document.body.dataset.rucaStarPreset || 'custom',
      starName: current.starName || 'Custom Starfield',
      starBrightness: Number(qs('#rucaStarBrightness')?.value || PASS12_THEME_PRESETS.default.starBrightness),
      starDensity: Number(qs('#rucaStarDensity')?.value || PASS12_THEME_PRESETS.default.starDensity),
      starBreath: Number(qs('#rucaStarBreath')?.value || PASS12_THEME_PRESETS.default.starBreath),
      starDrift: Number(qs('#rucaStarDrift')?.value || PASS12_THEME_PRESETS.default.starDrift)
    });
  }

  function applyTheme(theme, updateControls=true, temporaryState=null){
    const interactionState = temporaryState || {};
    const resolved = resolvePaletteLayers(theme, interactionState);
    const normalized = normalizeTheme({...theme, paletteState:resolved.paletteState});
    const cfg = {
      ...normalized,
      palette:resolved.palette,
      gold:resolved.palette.primary,
      gold2:resolved.palette.secondary,
      text:resolved.palette.primary,
      textSecondary:resolved.palette.secondaryText,
      textValue:resolved.palette.telemetryTrace,
      navText:resolved.palette.primary,
      gaugeColor:resolved.palette.telemetryTrace,
      glowColor:resolved.palette.glow,
      starColor:resolved.palette.stars,
      starColor2:resolved.palette.particles,
      starBreathColor:resolved.palette.aura
    };
    const temporaryPalette = sanitizePalettePatch(interactionState?.palette || interactionState);
    if(!Object.keys(temporaryPalette).length) state.theme = cfg;
    for(const [token,definition] of Object.entries(PASS50_THEME_TOKENS)){
      root.style.setProperty(definition.css, cfg.palette[token]);
    }
    for(const [property,[token,redOffset,greenOffset,blueOffset,alpha=1]] of Object.entries(PASS50_SURFACE_RECIPES)){
      root.style.setProperty(property, deriveThemeSurfaceColor(
        cfg.palette[token],
        redOffset,
        greenOffset,
        blueOffset,
        alpha
      ));
    }
    root.style.setProperty('--gold', cfg.palette.primary);
    root.style.setProperty('--gold2', cfg.palette.secondary);
    root.style.setProperty('--white', 'var(--ruca-surface-primary-98)');
    root.style.setProperty('--muted', cfg.palette.secondaryText);
    root.style.setProperty('--green', cfg.palette.success);
    root.style.setProperty('--red', cfg.palette.critical);
    root.style.setProperty('--amber', cfg.palette.warning);
    root.style.setProperty('--ruca-text-value', cfg.palette.telemetryTrace);
    root.style.setProperty('--ruca-nav-text', cfg.palette.primaryText);
    root.style.setProperty('--ruca-nav-active', cfg.palette.primary);
    root.style.setProperty('--ruca-live-font', cfg.font);
    root.style.setProperty('--ruca-bg-depth', String(cfg.depth));
    root.style.setProperty('--ruca-motion-level', String(cfg.motion));
    syncCoreMotionBudget(cfg.motion);
    root.style.setProperty('--ruca-density-level', String(cfg.density));
    root.style.setProperty('--ruca-glow-level', String(cfg.glow));
    root.style.setProperty('--ruca-glass-level', String(cfg.glass));
    root.style.setProperty('--ruca-gauge-accent', cfg.palette.telemetryTrace);
    root.style.setProperty('--ruca-glow-color', cfg.palette.glow);
    root.style.setProperty('--ruca-gauge-glow-size', `${8 + cfg.glow * .18}px`);
    root.style.setProperty('--ruca-gauge-glow-blur', `${2 + cfg.glow * .07}px`);
    root.style.setProperty('--ruca-home-scale', (cfg.homeScale / 100).toFixed(3));
    root.style.setProperty('--ruca-preview-depth-alpha', (0.08 + cfg.depth * 0.0036).toFixed(3));
    root.style.setProperty('--ruca-preview-shade-alpha', (0.18 + cfg.depth * 0.0048).toFixed(3));
    root.style.setProperty('--ruca-preview-glow-size', `${18 + cfg.glow * 1.1}px`);
    root.style.setProperty('--ruca-preview-glow-alpha', (0.08 + cfg.glow * 0.0042).toFixed(3));
    root.style.setProperty('--ruca-preview-glass-alpha', (0.04 + cfg.glass * 0.0036).toFixed(3));
    root.style.setProperty('--ruca-star-color', cfg.palette.stars);
    root.style.setProperty('--ruca-star-breath-color', cfg.palette.aura);
    root.style.setProperty('--ruca-star-secondary', cfg.palette.particles);
    root.style.setProperty('--ruca-star-brightness', String(cfg.starBrightness));
    root.style.setProperty('--ruca-star-density', String(cfg.starDensity));
    root.style.setProperty('--ruca-star-breath', String(cfg.starBreath));
    root.style.setProperty('--ruca-star-drift', String(cfg.starDrift));
    root.style.setProperty('--ruca-live-blur', `${10 + (cfg.glass/100)*18}px`);
    root.style.setProperty('--ruca-live-glow', `0 0 ${14 + cfg.glow*.55}px color-mix(in srgb, ${cfg.palette.glow} ${Math.min(95, 22 + cfg.glow)}%, transparent), inset 0 0 ${14 + cfg.glow*.25}px color-mix(in srgb, ${cfg.palette.tertiary} 2.8%, transparent)`);
    root.style.setProperty('--ruca-team-primary', cfg.palette.primary);
    root.style.setProperty('--ruca-team-secondary', cfg.palette.secondary);
    root.style.setProperty('--ruca-team-highlight', cfg.palette.tertiary);
    document.body.dataset.rucaPreset = cfg.preset || 'custom';
    document.body.dataset.rucaPalettePreset = cfg.paletteState.preset || '';
    document.body.dataset.rucaPaletteMode = cfg.paletteState.mode;
    document.body.dataset.rucaPaletteProvider = cfg.paletteState.provider || '';
    document.body.dataset.rucaStarPreset = cfg.starPreset || 'custom';
    document.body.dataset.rucaHomeView = cfg.homeViewMode;
    document.body.dataset.rucaTeam = cfg.teamSlug || '';
    document.body.dataset.rucaLeague = cfg.teamLeague || '';
    document.body.classList.toggle('motion-low', cfg.reducedMotion || cfg.motion < 10);
    if(updateControls) updateThemeControls(cfg);
    updateThemeReadouts(cfg);
    themeAuthorityRevision += 1;
    document.dispatchEvent(new CustomEvent('ruca:theme-changed', {detail:{
      palette:{...cfg.palette},
      revision:themeAuthorityRevision,
      temporary:Object.keys(temporaryPalette).length > 0
    }}));
    const starfieldDetail = {
      starColor: cfg.palette.stars,
      starBreathColor: cfg.palette.aura,
      starColor2: cfg.palette.particles,
      starBrightness: cfg.starBrightness,
      starDensity: cfg.starDensity,
      starBreath: cfg.starBreath,
      starDrift: cfg.starDrift,
      motion: cfg.motion,
      uiDensity: cfg.density,
      depth: cfg.depth,
      reducedMotion: cfg.reducedMotion
    };
    const starfieldConfigSignature = JSON.stringify(starfieldDetail);
    if(starfieldConfigSignature !== lastStarfieldConfigSignature){
      lastStarfieldConfigSignature = starfieldConfigSignature;
      document.dispatchEvent(new CustomEvent('ruca:starfield-config', {detail:starfieldDetail}));
    }
  }

  function updateThemeControls(cfg){
    for(const [token,definition] of Object.entries(PASS50_THEME_TOKENS)){
      const input = qs(`#${definition.control}`);
      if(input) input.value = cfg.palette[token];
      const reset = qs(`[data-ruca-reset-token="${token}"]`);
      if(reset) reset.disabled = !Object.prototype.hasOwnProperty.call(cfg.paletteState.tokenOverrides, token);
    }
    for(const [group,tokens] of Object.entries(PASS50_THEME_GROUPS)){
      const input = qs(`[data-ruca-theme-group="${group}"]`);
      if(input) input.value = cfg.paletteState.groupOverrides[group] || cfg.palette[tokens[0]];
      const reset = qs(`[data-ruca-reset-group="${group}"]`);
      if(reset) reset.disabled = !Object.prototype.hasOwnProperty.call(cfg.paletteState.groupOverrides, group);
    }
    if(qs('#rucaPaletteMode')) qs('#rucaPaletteMode').value = cfg.paletteState.mode;
    const inheritance = qs('#rucaPaletteInheritance');
    if(inheritance){
      const provider = cfg.paletteState.provider ? cfg.paletteState.provider.toUpperCase() : 'ENGINE DEFAULT';
      const preset = cfg.paletteState.preset ? String(cfg.paletteState.preset).toUpperCase() : 'NO PRESET';
      const groupCount = Object.keys(cfg.paletteState.groupOverrides).length;
      const tokenCount = Object.keys(cfg.paletteState.tokenOverrides).length;
      inheritance.textContent = `${provider} → ${preset} → ${groupCount} GROUP → ${tokenCount} TOKEN → INTERACTION`;
    }
    if(qs('#rucaFontPick')) qs('#rucaFontPick').value = cfg.font;
    if(qs('#rucaHomeViewMode')) qs('#rucaHomeViewMode').value = cfg.homeViewMode;
    if(qs('#rucaHomeScale')){
      qs('#rucaHomeScale').value = String(cfg.homeScale);
      syncRangeProgress(qs('#rucaHomeScale'));
      const readout = qs('#rucaHomeScale').closest('.slider-row')?.querySelector('b');
      if(readout) readout.textContent = `${Math.round(cfg.homeScale)}%`;
    }
    [['rucaDepthSlider','depth'],['rucaGlowSlider','glow'],['rucaGlassSlider','glass'],['rucaMotionSlider','motion'],['rucaStarBrightness','starBrightness'],['rucaStarDensity','starDensity'],['rucaStarBreath','starBreath'],['rucaStarDrift','starDrift']].forEach(([id,key])=>{
      const input = qs('#'+id);
      if(!input) return;
      input.value = cfg[key];
      syncRangeProgress(input);
      const row = input.closest('.slider-row');
      const readout = row?.querySelector('b');
      if(readout) readout.textContent = String(cfg[key]);
    });
    if(qs('#rucaReducedMotion')) qs('#rucaReducedMotion').checked = !!cfg.reducedMotion;
    qsa('.theme-preset[data-ruca-preset]').forEach(btn=>btn.classList.toggle('active', btn.dataset.rucaPreset === cfg.paletteState.preset));
    qsa('.star-preset[data-ruca-star-preset]').forEach(btn=>btn.classList.toggle('active', btn.dataset.rucaStarPreset === cfg.starPreset));
  }

  function mutablePaletteState(cfg=readThemeControls()){
    const source = cfg?.paletteState || resolvePaletteLayers(cfg || {}).paletteState;
    return {
      mode:source.mode,
      preset:source.preset,
      provider:source.provider,
      presetPalette:{...source.presetPalette},
      groupOverrides:{...source.groupOverrides},
      tokenOverrides:{...source.tokenOverrides}
    };
  }

  function commitPaletteState(paletteState, message='CURRENT PALETTE AUTO-SAVED.'){
    const current = readThemeControls();
    state.theme = normalizeTheme({...current, paletteState});
    saveTheme();
    syncCustomThemeProfileControls(message);
  }

  function applyPaletteTokenOverride(event){
    const token = event.currentTarget?.dataset?.rucaThemeToken;
    if(!PASS50_THEME_TOKENS[token]) return;
    const color = validThemeColor(event.currentTarget.value);
    if(!color) return;
    const paletteState = mutablePaletteState();
    paletteState.tokenOverrides[token] = color;
    commitPaletteState(paletteState, `${token.toUpperCase()} OVERRIDE ACTIVE.`);
  }

  function resetPaletteToken(event){
    if(!event.currentTarget?.dataset) return;
    const token = event.currentTarget.dataset.rucaResetToken;
    if(!PASS50_THEME_TOKENS[token]) return;
    const paletteState = mutablePaletteState();
    delete paletteState.tokenOverrides[token];
    commitPaletteState(paletteState, `${token.toUpperCase()} RESTORED TO ITS INHERITED VALUE.`);
  }

  function applyPaletteGroupOverride(event){
    const group = event.currentTarget?.dataset?.rucaThemeGroup;
    if(!PASS50_THEME_GROUPS[group]) return;
    const color = validThemeColor(event.currentTarget.value);
    if(!color) return;
    const paletteState = mutablePaletteState();
    paletteState.groupOverrides[group] = color;
    commitPaletteState(paletteState, `${group.toUpperCase()} GROUP OVERRIDE ACTIVE.`);
  }

  function resetPaletteGroup(event){
    const group = event.currentTarget?.dataset?.rucaResetGroup;
    if(!PASS50_THEME_GROUPS[group]) return;
    const paletteState = mutablePaletteState();
    delete paletteState.groupOverrides[group];
    commitPaletteState(paletteState, `${group.toUpperCase()} GROUP RESTORED TO ITS INHERITED VALUES.`);
  }

  function setPaletteMode(event){
    const requested = String(event.currentTarget?.value || 'preset').toLowerCase();
    const current = readThemeControls();
    const previous = mutablePaletteState(current);
    let paletteState;
    if(requested === 'custom'){
      paletteState = {
        mode:'custom',
        preset:null,
        provider:null,
        presetPalette:{},
        groupOverrides:{},
        tokenOverrides:{...current.palette}
      };
    }else if(requested === 'preset'){
      const preset = previous.preset || 'default';
      const presetPalette = Object.keys(previous.presetPalette).length
        ? previous.presetPalette
        : sanitizePalettePatch(PASS50_PRESET_PALETTES[preset] || PASS50_PRESET_PALETTES.default);
      paletteState = {
        mode:'preset',
        preset,
        provider:previous.provider || paletteProviderForPreset(preset) || 'system',
        presetPalette,
        groupOverrides:{},
        tokenOverrides:{}
      };
    }else{
      const preset = previous.preset || 'default';
      paletteState = {
        ...previous,
        mode:'derived',
        preset,
        provider:previous.provider || paletteProviderForPreset(preset) || 'system',
        presetPalette:Object.keys(previous.presetPalette).length
          ? previous.presetPalette
          : sanitizePalettePatch(PASS50_PRESET_PALETTES[preset] || PASS50_PRESET_PALETTES.default)
      };
    }
    commitPaletteState(paletteState, `${requested.toUpperCase()} PALETTE MODE ACTIVE.`);
  }

  function updateThemeReadouts(cfg){
    const active = qs('#rucaActivePreset');
    if(active) active.textContent = (cfg.name || 'Custom Command').toUpperCase();
    const profile = qs('#rucaProfileReadout');
    if(profile) profile.textContent = cfg.name || 'Custom Command';
    const motion = qs('#rucaMotionReadout');
    if(motion) motion.textContent = cfg.reducedMotion || cfg.motion < 10 ? 'Minimal' : cfg.motion < 40 ? 'Restrained' : 'Balanced';
    const stars = qs('#rucaStarReadout');
    if(stars) stars.textContent = cfg.starName || 'Custom Starfield';
  }

  function emptyCustomThemeProfileBank(){
    return {version:1, slots:{}};
  }

  function readCustomThemeProfileBank(){
    try{
      const parsed = JSON.parse(localStorage.getItem(CUSTOM_THEME_PROFILE_STORAGE_KEY) || 'null');
      if(!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return emptyCustomThemeProfileBank();
      const sourceSlots = parsed.slots && typeof parsed.slots === 'object' && !Array.isArray(parsed.slots) ? parsed.slots : {};
      const slots = {};
      for(let slot=1; slot<=CUSTOM_THEME_PROFILE_SLOT_COUNT; slot+=1){
        const candidate = sourceSlots[String(slot)];
        if(candidate && typeof candidate === 'object' && !Array.isArray(candidate)) slots[String(slot)] = candidate;
      }
      return {version:1, slots};
    }catch(err){
      return emptyCustomThemeProfileBank();
    }
  }

  function writeCustomThemeProfileBank(bank){
    localStorage.setItem(CUSTOM_THEME_PROFILE_STORAGE_KEY, JSON.stringify({
      version:1,
      slots:bank?.slots && typeof bank.slots === 'object' ? bank.slots : {}
    }));
  }

  function selectedCustomThemeProfileSlot(){
    const slot = Number(qs('#rucaCustomProfileSlot')?.value || 1);
    return Math.min(CUSTOM_THEME_PROFILE_SLOT_COUNT, Math.max(1, Number.isFinite(slot) ? slot : 1));
  }

  function customThemeProfileLabel(slot){
    return `CUSTOM ${slot}`;
  }

  function profileDisplayName(slot, profile=null){
    const name = String(profile?.name || '').trim().slice(0, 32);
    return name || customThemeProfileLabel(slot);
  }

  function syncCustomThemeProfileControls(message=''){
    const slotSelect = qs('#rucaCustomProfileSlot');
    if(!slotSelect) return;
    const bank = readCustomThemeProfileBank();
    qsa('#rucaCustomProfileSlot option').forEach(option=>{
      const slot = Number(option.value);
      const profile = bank.slots[String(slot)];
      option.textContent = profile ? `${profileDisplayName(slot, profile)} // SAVED` : `${customThemeProfileLabel(slot)} // EMPTY`;
    });
    const selectedSlot = selectedCustomThemeProfileSlot();
    const selectedProfile = bank.slots[String(selectedSlot)];
    const saved = !!selectedProfile;
    const nameInput = qs('#rucaCustomProfileName');
    if(nameInput && document.activeElement !== nameInput) nameInput.value = selectedProfile?.name || '';
    const load = qs('#rucaLoadCustomProfile');
    const clear = qs('#rucaClearCustomProfile');
    if(load) load.disabled = !saved;
    if(clear) clear.disabled = !saved;
    const status = qs('#rucaCustomProfileStatus');
    if(status) status.textContent = message || `${profileDisplayName(selectedSlot, selectedProfile)} IS ${saved ? 'SAVED' : 'EMPTY'}.`;
  }

  function captureCurrentProfile(slot, name){
    return {
      version:2,
      name:profileDisplayName(slot, {name}),
      savedAt:new Date().toISOString(),
      theme:normalizeTheme({...readThemeControls(), preset:`custom-${slot}`, name:profileDisplayName(slot, {name}), customSlot:slot}),
      settings:{
        team:readTeamAtmosphere(),
        audio:readAudioSettings(),
        cockpit:{
          brightness:Number(localStorage.getItem('rucaCockpitBrightness') || qs('#rucaBrightnessSlider')?.value || 62),
          dimNight:localStorage.getItem('rucaLoungeDimNight') === 'true',
          standby:localStorage.getItem('rucaCockpitStandby') === 'true'
        },
        input:{
          controllerMode:localStorage.getItem('rucaControllerMode') !== 'false',
          focusStrength:Math.max(1, Math.min(100, Number(localStorage.getItem('rucaFocusStrength') || qs('#rucaFocusStrength')?.value || 70)))
        },
        source:readSourceControls(),
        location:{
          lat:localStorage.getItem('rucaWeatherLat') || '',
          lon:localStorage.getItem('rucaWeatherLon') || '',
          name:localStorage.getItem('rucaWeatherName') || ''
        }
      }
    };
  }

  function restoreProfileSettings(profile){
    const settings = profile?.settings || {};
    const location = settings.location || {};
    const source = settings.source || {};
    const input = settings.input || {};
    const cockpit = settings.cockpit || {};
    if(settings.team?.league && settings.team?.team && settings.team?.preset){
      localStorage.setItem('rucaTeamAtmosphere', JSON.stringify(settings.team));
      setSportsControls(settings.team.league, settings.team.team, settings.team.preset);
      updateTeamPreview(settings.team);
    }
    if(source.sportsProvider || source.marketProvider || source.refreshSeconds){
      localStorage.setItem('rucaSourceControls', JSON.stringify({
        sportsProvider:source.sportsProvider || 'ESPN scoreboard',
        marketProvider:source.marketProvider || 'Auto',
        refreshSeconds:Number(source.refreshSeconds || LIVE_REFRESH_DEFAULT_SECONDS)
      }));
      hydrateSourceControls();
    }
    [['rucaWeatherLat', location.lat], ['rucaWeatherLon', location.lon], ['rucaWeatherName', location.name]].forEach(([key,value])=>{
      if(value) localStorage.setItem(key, String(value)); else localStorage.removeItem(key);
      const control = qs('#' + key);
      if(control) control.value = value || '';
    });
    localStorage.setItem('rucaControllerMode', input.controllerMode === false ? 'false' : 'true');
    localStorage.setItem('rucaFocusStrength', String(Math.max(1, Math.min(100, Number(input.focusStrength || 70)))));
    state.controller.focusStrength = Number(localStorage.getItem('rucaFocusStrength'));
    const focus = qs('#rucaFocusStrength');
    if(focus){
      focus.value = String(state.controller.focusStrength);
      const readout = focus.closest('.slider-row')?.querySelector('b');
      if(readout) readout.textContent = String(state.controller.focusStrength);
    }
    const controllerToggle = qs('#rucaControllerMode');
    if(controllerToggle) controllerToggle.checked = input.controllerMode !== false;
    setControllerMode(input.controllerMode !== false);
    applyAudioSettings(settings.audio || readAudioSettings());
    applyCockpitBrightness(Number(cockpit.brightness || 62), true);
    applyDimNight(cockpit.dimNight === true, true);
    applyCockpitStandby(cockpit.standby === true, true);
  }

  function saveSelectedCustomThemeProfile(){
    const slot = selectedCustomThemeProfileSlot();
    const name = qs('#rucaCustomProfileName')?.value || '';
    const profile = captureCurrentProfile(slot, name);
    const label = profile.name;
    const bank = readCustomThemeProfileBank();
    bank.slots[String(slot)] = profile;
    writeCustomThemeProfileBank(bank);
    localStorage.setItem(ACTIVE_THEME_PROFILE_STORAGE_KEY, String(slot));
    localStorage.setItem('rucaTheme', JSON.stringify(profile.theme));
    applyTheme(profile.theme, true);
    syncCustomThemeProfileControls(`${label.toUpperCase()} SAVED WITH CURRENT SETTINGS.`);
    window.RUCA_AUDIO?.cue('theme-apply');
  }

  function loadSelectedCustomThemeProfile(){
    const slot = selectedCustomThemeProfileSlot();
    const label = customThemeProfileLabel(slot);
    const bank = readCustomThemeProfileBank();
    const stored = bank.slots[String(slot)];
    if(!stored){
      syncCustomThemeProfileControls(`${label} IS EMPTY. SAVE THE CURRENT SETTINGS FIRST.`);
      return;
    }
    const profile = stored.theme
      ? normalizeTheme({...stored.theme, preset:`custom-${slot}`, name:profileDisplayName(slot, stored), customSlot:slot})
      : normalizeTheme({...stored, preset:`custom-${slot}`, name:profileDisplayName(slot, stored), customSlot:slot});
    localStorage.setItem(ACTIVE_THEME_PROFILE_STORAGE_KEY, String(slot));
    localStorage.setItem('rucaTheme', JSON.stringify(profile));
    applyTheme(profile, true);
    if(stored.settings) restoreProfileSettings(stored);
    syncCustomThemeProfileControls(`${profileDisplayName(slot, stored).toUpperCase()} LOADED WITH SAVED SETTINGS.`);
    window.RUCA_AUDIO?.cue('theme-apply');
    requestSemanticPulse('command-ack', {
      target:'#rucaLoadCustomProfile',
      command:'profile-load',
      message:`${label} loaded.`
    });
  }

  function clearSelectedCustomThemeProfile(){
    const slot = selectedCustomThemeProfileSlot();
    const label = customThemeProfileLabel(slot);
    const bank = readCustomThemeProfileBank();
    if(!bank.slots[String(slot)]){
      syncCustomThemeProfileControls(`${label} IS ALREADY EMPTY.`);
      return;
    }
    delete bank.slots[String(slot)];
    writeCustomThemeProfileBank(bank);
    if(Number(localStorage.getItem(ACTIVE_THEME_PROFILE_STORAGE_KEY) || 0) === slot){
      localStorage.removeItem(ACTIVE_THEME_PROFILE_STORAGE_KEY);
    }
    if(document.body.dataset.rucaPreset === `custom-${slot}`){
      const current = normalizeTheme({...readThemeControls(), preset:'custom', name:'Unsaved Custom', customSlot:null});
      localStorage.setItem('rucaTheme', JSON.stringify(current));
      applyTheme(current, true);
      syncCustomThemeProfileControls(`${label} CLEARED. THE CURRENT APPEARANCE REMAINS ACTIVE BUT UNSAVED.`);
    }else{
      syncCustomThemeProfileControls(`${label} CLEARED.`);
    }
    window.RUCA_AUDIO?.cue('theme-apply');
  }

  function saveTheme(event){
    const activeSlot = Number(String(document.body.dataset.rucaPreset || '').match(/^custom-(\d+)$/)?.[1] || 0);
    const isSavedSlot = activeSlot >= 1 && activeSlot <= CUSTOM_THEME_PROFILE_SLOT_COUNT;
    const current = readThemeControls();
    const paletteState = current.paletteState;
    const builtInPreset = paletteState.mode === 'preset' && paletteState.preset && PASS12_THEME_PRESETS[paletteState.preset]
      ? paletteState.preset
      : null;
    const outerPreset = isSavedSlot
      ? `custom-${activeSlot}`
      : builtInPreset || (paletteState.mode === 'preset' && paletteState.provider === 'sports' ? 'team' : 'custom');
    const theme = normalizeTheme({
      ...current,
      preset:outerPreset,
      name:isSavedSlot
        ? customThemeProfileLabel(activeSlot)
        : builtInPreset
          ? PASS12_THEME_PRESETS[builtInPreset].name
          : current.name || 'Unsaved Custom',
      customSlot:isSavedSlot ? activeSlot : null
    });
    localStorage.setItem('rucaTheme', JSON.stringify(theme));
    if(isSavedSlot){
      const bank = readCustomThemeProfileBank();
      const existing = bank.slots[String(activeSlot)] || {};
      bank.slots[String(activeSlot)] = existing.settings
        ? {...existing, theme, name:profileDisplayName(activeSlot, existing), savedAt:new Date().toISOString()}
        : {...theme, savedAt:new Date().toISOString()};
      writeCustomThemeProfileBank(bank);
      localStorage.setItem(ACTIVE_THEME_PROFILE_STORAGE_KEY, String(activeSlot));
    }else{
      localStorage.removeItem(ACTIVE_THEME_PROFILE_STORAGE_KEY);
    }
    applyTheme(theme, true);
    syncCustomThemeProfileControls(isSavedSlot ? `${customThemeProfileLabel(activeSlot)} UPDATED AND SAVED.` : 'CURRENT SETTINGS AUTO-SAVED. SAVE TO A SLOT TO KEEP A NAMED PROFILE.');
    if(event?.type === 'click') window.RUCA_AUDIO?.cue('theme-apply');
  }

  function applySelectedHomeViewMode(){
    const mode = String(qs('#rucaHomeViewMode')?.value || 'desk');
    const scale = HOME_VIEW_PRESETS[mode];
    const slider = qs('#rucaHomeScale');
    if(slider && Number.isFinite(scale)) slider.value = String(scale);
    saveTheme();
    window.RUCA_HOME_GEOMETRY?.refresh?.();
    requestSemanticPulse('command-ack', {
      target:'#rucaHomeViewMode',
      command:'display-mode',
      message:`Home viewing distance set to ${mode}.`
    });
  }

  function applyCustomHomeScale(){
    const slider = qs('#rucaHomeScale');
    const modeSelect = qs('#rucaHomeViewMode');
    if(!slider || !modeSelect) return;
    const value = Number(slider.value);
    const match = Object.entries(HOME_VIEW_PRESETS).find(([,scale])=>scale === value);
    modeSelect.value = match?.[0] || 'custom';
    saveTheme();
    window.RUCA_HOME_GEOMETRY?.refresh?.();
    requestSemanticPulse('command-ack', {
      target:'#rucaHomeScale',
      command:'display-scale',
      message:`Home scale set to ${Math.round(value)} percent.`
    });
  }

  function setThemePreset(name){
    const key = PASS50_PRESET_PALETTES[name] ? name : 'default';
    const current = readThemeControls();
    const preset = normalizeTheme({
      ...current,
      preset:key,
      name:PASS12_THEME_PRESETS[key]?.name || 'Theme Preset',
      paletteState:{
        mode:'preset',
        preset:key,
        provider:paletteProviderForPreset(key) || 'system',
        presetPalette:sanitizePalettePatch(PASS50_PRESET_PALETTES[key]),
        groupOverrides:{},
        tokenOverrides:{}
      }
    });
    localStorage.removeItem(ACTIVE_THEME_PROFILE_STORAGE_KEY);
    localStorage.setItem('rucaTheme', JSON.stringify(preset));
    applyTheme(preset, true);
    syncCustomThemeProfileControls(`${(preset.name || 'THEME').toUpperCase()} IS ACTIVE. SAVED CUSTOM SLOTS ARE UNCHANGED.`);
    window.RUCA_AUDIO?.cue('theme-apply');
  }

  function setStarPreset(name){
    const preset = PASS13_STAR_PRESETS[name || 'warm'] || PASS13_STAR_PRESETS.warm;
    const current = readThemeControls();
    const paletteState = mutablePaletteState(current);
    paletteState.tokenOverrides.stars = validThemeColor(preset.starColor, current.palette.stars);
    paletteState.tokenOverrides.particles = validThemeColor(preset.starColor2, preset.starColor);
    paletteState.tokenOverrides.aura = validThemeColor(preset.starBreathColor, preset.starColor);
    const theme = normalizeTheme({
      ...current,
      ...preset,
      paletteState,
      preset:'custom',
      name:'Unsaved Custom',
      customSlot:null
    });
    localStorage.removeItem(ACTIVE_THEME_PROFILE_STORAGE_KEY);
    localStorage.setItem('rucaTheme', JSON.stringify(theme));
    applyTheme(theme, true);
    syncCustomThemeProfileControls('CURRENT SETTINGS ARE UNSAVED. CHOOSE A SLOT AND PRESS SAVE.');
    window.RUCA_AUDIO?.cue('theme-apply');
  }

  function resetTheme(){
    const current = readThemeControls();
    localStorage.removeItem(ACTIVE_THEME_PROFILE_STORAGE_KEY);
    localStorage.removeItem('rucaTeamAtmosphere');
    const preset = normalizeTheme({
      ...current,
      preset:'default',
      name:PASS12_THEME_PRESETS.default.name,
      teamLeague:'',
      teamName:'',
      teamSlug:'',
      teamInitials:'',
      teamPrimary:'',
      teamSecondary:'',
      teamHighlight:'',
      paletteState:{
        mode:'preset',
        preset:'default',
        provider:'system',
        presetPalette:sanitizePalettePatch(PASS50_PRESET_PALETTES.default),
        groupOverrides:{},
        tokenOverrides:{}
      }
    });
    localStorage.setItem('rucaTheme', JSON.stringify(preset));
    applyTheme(preset, true);
    syncCustomThemeProfileControls('DEFAULT RESTORED. SAVED CUSTOM SLOTS ARE UNCHANGED.');
    setSportsControls('NBA', 'Knicks', 'home');
    updateTeamPreview(teamPayload('NBA', 'Knicks', 'home'));
    window.RUCA_AUDIO?.cue('theme-apply');
  }

  function saveLocation(){
    const lat = qs('#rucaWeatherLat')?.value.trim();
    const lon = qs('#rucaWeatherLon')?.value.trim();
    const name = qs('#rucaWeatherName')?.value.trim();
    if(lat && lon){ localStorage.setItem('rucaWeatherLat', lat); localStorage.setItem('rucaWeatherLon', lon); }
    if(name) localStorage.setItem('rucaWeatherName', name);
    if(!lat && !lon){ localStorage.removeItem('rucaWeatherLat'); localStorage.removeItem('rucaWeatherLon'); }
    if(state.lastLane === 'weather') window.RUCA_PASS02B_setLane('weather');
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
