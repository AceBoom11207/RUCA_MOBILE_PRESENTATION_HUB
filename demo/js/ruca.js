// RUCA OS // Canonical Working Build PASS01
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

const RUCA_LOUNGE_PROFILE_ID = 'RUCA_DEMO_LOUNGE';
const RUCA_CONTINUITY_PROFILE_KEY = 'rucaContinuityRuntimeProfile';
const RUCA_RUNTIME_PARAMS = new URLSearchParams(window.location.search);
const RUCA_REQUESTED_PROFILE_ID = '';
const RUCA_RECOVERY_BOOT = false;
let RUCA_SAVED_PROFILE_ID = '';
try{
  RUCA_SAVED_PROFILE_ID = localStorage.getItem(RUCA_CONTINUITY_PROFILE_KEY) || '';
}catch(error){
  RUCA_SAVED_PROFILE_ID = '';
}
const RUCA_RUNTIME_PROFILE_ID = RUCA_REQUESTED_PROFILE_ID === RUCA_LOUNGE_PROFILE_ID
  ? RUCA_LOUNGE_PROFILE_ID
  : (RUCA_RECOVERY_BOOT && RUCA_SAVED_PROFILE_ID === RUCA_LOUNGE_PROFILE_ID ? RUCA_LOUNGE_PROFILE_ID : '');
try{
  if(RUCA_RUNTIME_PROFILE_ID === RUCA_LOUNGE_PROFILE_ID){
    localStorage.setItem(RUCA_CONTINUITY_PROFILE_KEY, RUCA_LOUNGE_PROFILE_ID);
  }else if(!RUCA_RECOVERY_BOOT){
    localStorage.removeItem(RUCA_CONTINUITY_PROFILE_KEY);
  }
}catch(error){
  // Storage can be unavailable in hardened browser profiles; the URL remains authoritative.
}
if(RUCA_RECOVERY_BOOT && RUCA_RUNTIME_PROFILE_ID && !RUCA_REQUESTED_PROFILE_ID){
  const recoveredUrl = new URL(window.location.href);
  recoveredUrl.searchParams.set('profile', RUCA_RUNTIME_PROFILE_ID);
  window.history.replaceState(window.history.state, '', recoveredUrl);
}
if(RUCA_RUNTIME_PROFILE_ID === RUCA_LOUNGE_PROFILE_ID){
  document.body.classList.add('ruca-3dixon-lounge');
  document.body.dataset.rucaRuntimeProfile = RUCA_LOUNGE_PROFILE_ID;
  const profileUrl = new URL(`config/${RUCA_LOUNGE_PROFILE_ID}.json`, document.baseURI).href;
  window.RUCA_RUNTIME_PROFILE = Object.freeze({
    id:RUCA_LOUNGE_PROFILE_ID,
    url:profileUrl,
    ready:fetch(profileUrl, {cache:'no-store'})
      .then(response=>{
        if(!response.ok) throw new Error(`Profile ${response.status}`);
        return response.json();
      })
      .catch(()=>null)
  });
}

const system = {
  name: 'Demo workstation',
  cpu: 'AMD Ryzen 9 5900X',
  gpu: 'ASUS NVIDIA GeForce RTX 4070 Ti SUPER 16GB',
  ram: 'Corsair Vengeance 128GB DDR4-3600',
  board: 'MSI MAG B550 Tomahawk MAX WiFi',
  psu: 'Corsair RM750x',
  cooler: 'be quiet! Dark Rock Pro 5',
  storage: 'Samsung 990 Pro 2TB + Samsung 990 Pro 2TB',
  case: 'Corsair 4000D Airflow',
  fans: 'be quiet! Light Wings x3 + Corsair RS120 ARGB x3'
};

/* PASS24B: retained only as inert historical schema during this reversible pass.
   No runtime path may read this object or present its values as machine truth. */
const PASS24B_QUARANTINED_DIAGNOSTICS = Object.freeze({
  ScoreMap: {
    title:'HEART REACTOR SCORE MAP', severity:'SAFE', confidence:'96%', live:'100', threshold:'80', unit:'score',
    summary:'Score is driven by CPU, GPU, RAM, storage, network, thermals, power, fans, and sensor confidence.',
    metrics:[['CPU Risk','0','0','12','20','ok'],['GPU Risk','0','0','10','20','ok'],['Thermal Risk','7','0','55','70','ok'],['Storage Risk','0','0','2','10','ok'],['Network Risk','0','0','0','10','ok']],
    deep:[['Formula','100 - risks','CPU/GPU/thermal/storage/network'],['Score Source','Telemetry Bridge','HWiNFO + fallback'],['Confidence','96%','No fake values'],['State','Mission Ready','No critical alerts']],
    triage:['System health is strong.','RUCA is trimming mainly for normal thermal presence, not failure pressure.','Confirm bridge is live and sensor labels are mapped.','No repair action required. Continue monitoring.','Low risk unless missing telemetry persists under load.'],
    alerts:[['safe','Guardian','No critical system issue detected.']]
  },
  CPU: {
    title:'CPU DIAGNOSTICS', severity:'SAFE', confidence:'97%', live:'62°C', threshold:'85°C', unit:'°C',
    summary:'Package thermals, per-core clocks, voltage, PPT power, boost behavior, process influence, and throttle state.',
    metrics:[['Package Temp','62°C','39°C','74°C','85°C','ok'],['CPU Load','31%','4%','76%','90%','ok'],['Core Clock','4.65GHz','3.7','4.9','5.0','ok'],['Vcore','1.24V','0.91','1.39','1.45','ok'],['PPT Power','91W','22W','137W','142W','ok'],['Throttle State','No','No','No','Any','ok']],
    deep:[['Processor','Ryzen 9 5900X','12 cores / 24 threads'],['Thermal Headroom','23°C','Before warning'],['Cooler','Dark Rock Pro 5','Air tower stable'],['Process Influence','Normal','No runaway load'],['Boost Behavior','Healthy','Clock ramp responsive'],['Fan Response','1280 RPM','CPU fan active']],
    triage:['CPU package is operating within nominal range.','Stable CPU thermals preserve boost behavior and prevent noise spikes.','Check fan ramp and dust if package rises above 85°C.','No action required. Continue monitoring.','Low. Watch sustained all-core loads only.'],
    alerts:[['safe','CPU Thermal','Package temperature is nominal.'],['safe','Clock Behavior','Boost behavior appears stable.']]
  },
  GPU: {
    title:'GPU DIAGNOSTICS', severity:'SAFE', confidence:'95%', live:'68°C', threshold:'83°C', unit:'°C',
    summary:'Core load, hotspot, VRAM usage, memory junction, fan RPM, power draw, driver lane, and render latency.',
    metrics:[['Core Temp','68°C','36°C','76°C','83°C','ok'],['Hotspot','79°C','41°C','91°C','95°C','ok'],['GPU Load','44%','0%','98%','98%','ok'],['VRAM','7.2GB','0.8','11.6','15.0','ok'],['Power Draw','212W','34W','284W','285W','ok'],['Fan RPM','1160','0','1720','2200','ok']],
    deep:[['Adapter','RTX 4070 Ti SUPER','16GB VRAM'],['Driver State','Ready','No warning'],['Render Latency','12ms','Low'],['VRAM Headroom','8.8GB','Available'],['Memory Junction','76°C','Safe'],['PCIe Link','Gen4','Expected']],
    triage:['GPU is active and within the safe thermal envelope.','Hotspot and VRAM behavior protect frame stability during gaming.','Check case airflow if hotspot delta grows above 25°C.','No action required. Maintain driver update schedule.','Low to moderate only during long high-load sessions.'],
    alerts:[['safe','GPU Thermal','GPU temperature is inside threshold.'],['safe','VRAM','Memory headroom available.']]
  },
  RAM: {
    title:'MEMORY DIAGNOSTICS', severity:'SAFE', confidence:'98%', live:'37GB', threshold:'110GB', unit:'GB',
    summary:'Memory pressure, commit usage, cache behavior, paging, speed lane, and stability confidence.',
    metrics:[['Used','37GB','18GB','64GB','110GB','ok'],['Free','91GB','64GB','110GB','16GB','ok'],['Pressure','Low','Low','Medium','High','ok'],['Speed','3600MHz','3600','3600','3600','ok'],['Commit','42GB','22GB','78GB','120GB','ok'],['Paging','Minimal','None','Low','High','ok']],
    deep:[['Kit','Corsair Vengeance','128GB total'],['DIMM Layout','32GB x4','All slots populated'],['Workload','Creator/Gaming','Headroom strong'],['Cache','Healthy','No purge pressure'],['Stability','Nominal','No memory warning'],['Upgrade Need','None','Ridiculous amount of RAM, naturally']],
    triage:['Memory pressure is low for this system.','Large memory headroom prevents swap behavior and improves multitasking stability.','Check individual processes only if usage jumps unexpectedly.','No action required.','Low. Current RAM capacity is hilariously prepared.'],
    alerts:[['safe','Memory Pool','128GB memory bank has strong headroom.']]
  },
  Storage: {
    title:'STORAGE DIAGNOSTICS', severity:'SAFE', confidence:'96%', live:'98%', threshold:'85%', unit:'health',
    summary:'NVMe health, temperature, free capacity, read/write activity, SMART lane, and sustained performance pressure.',
    metrics:[['C: Health','98%','98','100','85','ok'],['D: Health','99%','99','100','85','ok'],['C: Temp','43°C','31°C','57°C','70°C','ok'],['D: Temp','41°C','29°C','55°C','70°C','ok'],['Free Space','2.8TB','1.6','3.1','0.4','ok'],['Write Load','Low','0','Medium','High','ok']],
    deep:[['Drive 1','Samsung 990 Pro 2TB','Heatsink'],['Drive 2','Samsung 990 Pro 2TB','No heatsink'],['Bus','PCIe Gen4','Expected'],['SMART','Clean','No flagged attributes'],['Thermal Throttle','No','Headroom available'],['Backup Cue','Recommended','Weekly image']],
    triage:['Storage health is strong and temperatures are controlled.','NVMe thermal behavior matters for sustained installs, game loads, and project work.','Check firmware and backups during maintenance.','No repair action required.','Low if backups exist; medium if backups are ignored like a human tradition.'],
    alerts:[['safe','NVMe Health','SMART lane clean.'],['warn','Backup','Weekly backup recommended.']]
  },
  Network: {
    title:'NETWORK DIAGNOSTICS', severity:'SAFE', confidence:'93%', live:'12ms', threshold:'50ms', unit:'ms',
    summary:'Latency, throughput, packet loss, local bridge state, source confidence, and online readiness.',
    metrics:[['Ping','12ms','8','22','50','ok'],['Download','842Mb','90','940','100','ok'],['Upload','42Mb','10','74','10','ok'],['Loss','0%','0','0','1','ok'],['Bridge','Live','Live','Live','Live','ok'],['DNS','Ready','Ready','Ready','Fail','ok']],
    deep:[['Adapter','Ethernet/Wi-Fi','Source mapped'],['Demo source','LOCAL SAMPLE','Simulated readings'],['Stream State','Stable','No disconnect'],['Game Latency','Low','Ready'],['Packet Risk','None','No loss'],['Router Check','Not needed','Only if loss appears']],
    triage:['Network is stable and low latency.','Network quality supports gaming, media, and live feed updates.','Check router only if packet loss or latency spikes appear.','No action required.','Low. Current lane is clean.'],
    alerts:[['safe','Network Lane','No packet loss detected.']]
  },
  Thermals: {
    title:'THERMAL DIAGNOSTICS', severity:'SAFE', confidence:'96%', live:'62°C', threshold:'85°C', unit:'°C',
    summary:'CPU/GPU/case thermal envelope, cooling response, fan behavior, and heat-risk interpretation.',
    metrics:[['CPU Pkg','62°C','39','74','85','ok'],['GPU Core','68°C','36','76','83','ok'],['Case Avg','31°C','25','39','45','ok'],['NVMe Peak','57°C','29','57','70','ok'],['Headroom','Good','Good','Good','Poor','ok'],['Cooling State','Optimal','Optimal','Stable','Warning','ok']],
    deep:[['Cooler','Dark Rock Pro 5','CPU tower'],['Case','Corsair 4000D Airflow','Air path clear'],['Fan Set','6 case fans','Mixed Corsair/be quiet!'],['Dust Cue','Monitor','Maintenance item'],['Acoustic State','Low','Normal'],['Thermal Mode','Balanced','No rescue needed']],
    triage:['Thermal envelope is safe across the machine.','Good thermal behavior protects boost clocks and component lifespan.','Check dust filters and fan curves during maintenance.','No action required.','Low. Thermal state is healthy.'],
    alerts:[['safe','Thermal Envelope','System temperatures are stable.']]
  },
  Fans: {
    title:'FAN DIAGNOSTICS', severity:'SAFE', confidence:'88%', live:'1280RPM', threshold:'0RPM', unit:'RPM',
    summary:'Fan RPM, ramp behavior, zero-RPM states, curve logic, and source confidence.',
    metrics:[['CPU Fan','1280','720','1560','300','ok'],['Case Avg','920','640','1440','300','ok'],['GPU Fan','1160','0','1720','300','ok'],['Pump/Fan','N/A','N/A','N/A','N/A','ok'],['Curve','Auto','Auto','Auto','Manual','ok'],['Source','Partial','Partial','Live','Full','warn']],
    deep:[['CPU Cooling','Active','RPM present'],['Case Fans','Active','Source labels pending'],['GPU Fan','Auto','May idle at 0 RPM'],['Lighting Fans','Installed','be quiet + Corsair'],['Confidence','88%','Needs label cleanup'],['Action','Map sensors','Production task']],
    triage:['Fan behavior appears normal but source mapping can be improved.','Correct fan labels matter for repair confidence and alert accuracy.','Map each fan label from HWiNFO shared memory.','No emergency. Add sensor naming cleanup to build queue.','Low now; medium if fan labels stay ambiguous during a real failure.'],
    alerts:[['warn','Sensor Mapping','Fan labels require cleanup for production confidence.']]
  },
  Power: {
    title:'POWER DIAGNOSTICS', severity:'SAFE', confidence:'91%', live:'386W', threshold:'650W', unit:'W',
    summary:'Power draw, PSU headroom, CPU/GPU power lanes, voltage stability, and transient risk.',
    metrics:[['CPU PPT','91W','22','137','142','ok'],['GPU Power','212W','34','284','285','ok'],['System Est.','386W','122','512','650','ok'],['PSU','RM750x','750W','750W','750W','ok'],['Headroom','Good','Good','Good','Low','ok'],['Voltage Risk','Low','Low','Medium','High','ok']],
    deep:[['PSU','Corsair RM750x','750W'],['CPU Lane','Stable','PPT normal'],['GPU Lane','Stable','No spike issue'],['Transient Risk','Low','Within headroom'],['Cable Check','Recommended','During maintenance'],['Efficiency','Good','Normal load band']],
    triage:['Power draw is within expected envelope.','PSU headroom protects against instability under gaming load.','Check PCIe cables if shutdowns or GPU resets occur.','No action required.','Low. Current power delivery looks stable.'],
    alerts:[['safe','Power Delivery','PSU headroom available.']]
  },
  Motherboard: {
    title:'MOTHERBOARD DIAGNOSTICS', severity:'SAFE', confidence:'90%', live:'B550', threshold:'N/A', unit:'board',
    summary:'Board sensor lane, BIOS status, chipset temperature, PCIe link, USB state, and hardware foundation.',
    metrics:[['Board','B550','MAG','MAX','N/A','ok'],['Chipset','41°C','34','52','75','ok'],['BIOS','Latest','Known','Known','Outdated','ok'],['PCIe','Gen4','Gen4','Gen4','Gen4','ok'],['USB','Ready','Ready','Ready','Fail','ok'],['Sensor Bus','Live','Live','Live','Lost','ok']],
    deep:[['Motherboard','MSI MAG B550 Tomahawk MAX WiFi','Foundation'],['Chipset Temp','41°C','Safe'],['PCIe GPU Link','Gen4','Expected'],['NVMe Slots','2 occupied','990 Pro x2'],['USB State','Ready','No issue'],['BIOS','Check schedule','Maintenance']],
    triage:['Motherboard foundation is stable.','Board stability ties every subsystem together.','Check BIOS/chipset drivers during planned maintenance only.','No action required.','Low. Board state is stable.'],
    alerts:[['safe','Board State','Motherboard telemetry stable.']]
  },
  SensorBus: {
    title:'SENSOR BUS', severity:'SAFE', confidence:'94%', live:'LIVE', threshold:'LOCK', unit:'state',
    summary:'HWiNFO bridge, source confidence, missing fields, stale values, telemetry lock, and fallback honesty.',
    metrics:[['Bridge','Live','Live','Live','Lost','ok'],['Readings','264','220','425','50','ok'],['Stale Values','0','0','3','10','ok'],['Missing','3','0','12','20','ok'],['Confidence','94%','88','98','75','ok'],['Fallback','Off','Off','On','On','ok']],
    deep:[['Source','HWiNFO Shared Memory','Primary'],['Telemetry JSON','Ready','Optional fallback'],['Truth Rule','No fake values','Canon'],['Stale Detection','Enabled','Future hook'],['Label Map','Partial','Needs final names'],['Bridge State','Online','Demo mode fallback']],
    triage:['Sensor bus is online with high confidence.','RUCA depends on honest telemetry before making recommendations.','Check bridge first if any diagnostic field becomes unavailable.','Maintain fallback labels and never fabricate missing values.','Low now; high if telemetry goes stale while alerts are suppressed.'],
    alerts:[['safe','Sensor Bus','Bridge lane available.'],['warn','Label Map','Some labels still need production naming.']]
  }
});

const pages = $$('.page');
const navButtons = $$('[data-page]');
const coreBeacons = $$('.core-nav-beacon');
const coreReturnAnchor = $('#coreReturnAnchor');
const worldTravelLayer = $('#rucaWorldTravel');
const worldTravelDestination = $('#rucaTravelDestination');
const semanticPulseLayer = $('#rucaSemanticPulseLayer');
const semanticPulseStatus = $('#rucaSemanticPulseStatus');
const semanticPulseHeart = $('#homeChronograph .system-heart');
const semanticPulseBoard = $('#homeChronograph');
const RUCA_CONTINUITY_OWNER = 'js/ruca.js';
const RUCA_CONTINUITY_VERSION = '25A.1';
const RUCA_CONTINUITY_STATE_KEY = 'rucaContinuityState.v1';
const RUCA_SHELL_HISTORY_OWNER = 'RUCA_CONTINUITY_HISTORY';
const RUCA_SHELL_HISTORY_VERSION = '25A.H1';
const RUCA_SHELL_HISTORY_GUARD = 'GUARD';
const RUCA_SHELL_HISTORY_WORLD = 'WORLD';
const continuityOverlayRegistry = new Map();
const continuityFocusByWorld = new Map();
const continuityState = {
  owner:RUCA_CONTINUITY_OWNER,
  version:RUCA_CONTINUITY_VERSION,
  profile:{
    id:RUCA_RUNTIME_PROFILE_ID || 'default',
    lounge:RUCA_RUNTIME_PROFILE_ID === RUCA_LOUNGE_PROFILE_ID,
    recoveryBoot:RUCA_RECOVERY_BOOT
  },
  navigation:{
    world:document.body.dataset.world || 'home',
    history:[],
    transition:null
  },
  overlays:[],
  launch:{
    status:'IDLE',
    origin:null,
    result:null,
    updatedAt:null
  },
  recovery:{
    availability:'CHECKING',
    bridgeReachable:null,
    captureSupported:null,
    controllerConnected:null,
    guideSupported:null,
    detail:'Waiting for the canonical recovery bridge.',
    updatedAt:null
  }
};
const worldHistory = continuityState.navigation.history;
let coreTransitionTimer = 0;
let coreArrivalTimer = 0;
let coreTransitionSequence = 0;
let continuityShellHistorySequence = 0;
const PASS16E_TRAVEL_MS = 680;
const PASS16E_SETTLE_MS = 260;
const PASS31A_REDUCED_TRAVEL_MS = 140;
const PASS31A_REDUCED_SETTLE_MS = 90;
const RUCA_WORLD_TRAVEL_VERSION = '31A.1';
const RUCA_WORLD_DESTINATIONS = Object.freeze({
  home:Object.freeze({label:'HOME', accent:'#d6b36b', x:'0%', y:'-5%', angle:'90deg'}),
  play:Object.freeze({label:'PLAY', accent:'#ef3443', x:'-5%', y:'-2%', angle:'76deg'}),
  live:Object.freeze({label:'LIVE WORLD', accent:'#61b7ff', x:'5%', y:'-2%', angle:'104deg'}),
  diagnostics:Object.freeze({label:'DIAGNOSTICS', accent:'#7ce6dc', x:'-4%', y:'4%', angle:'66deg'}),
  control:Object.freeze({label:'CONTROL', accent:'#ff4a3d', x:'4%', y:'4%', angle:'114deg'})
});
const worldTravelCompletionHandlers = new Set();
let worldTravelAudioHook = null;
const worldTravelState = {
  locked:false,
  id:0,
  from:'home',
  to:'home',
  phase:'idle',
  reducedMotion:false,
  completion:null
};
const RUCA_SEMANTIC_PULSE_VERSION = '31D.1';
const RUCA_SEMANTIC_PULSE_TYPES = Object.freeze([
  'system-ready',
  'world-departure',
  'world-arrival',
  'telemetry-warning',
  'telemetry-critical',
  'state-recovery',
  'command-ack',
  'benchmark-complete'
]);
const semanticPulseState = {
  sequence:0,
  activeType:'',
  readyFired:false,
  gaugeStates:new Map(),
  criticalCooldown:new Map(),
  lastEvent:null
};

function semanticPulseReducedMotion(){
  return reducedFlightMotion() || document.body.classList.contains('motion-low');
}

function semanticPulseGaugeKey(value){
  const key = String(value || '').toLowerCase().replace(/[^a-z0-9]/g,'');
  const aliases = {
    cpu:'cpu',
    processor:'cpu',
    gpu:'gpu',
    graphics:'gpu',
    ram:'ram',
    memory:'ram',
    storage:'storage',
    disk:'storage',
    drive:'storage',
    network:'network',
    networking:'network',
    thermal:'thermal',
    thermals:'thermal',
    temperature:'thermal',
    cooling:'thermal'
  };
  return aliases[key] || '';
}

function semanticPulseStateName(value){
  const source = value && typeof value === 'object'
    ? value.state ?? value.status ?? value.severity ?? value.level
    : value;
  const key = String(source || '').trim().toLowerCase().replace(/[_\s]+/g,'-');
  if(['warning','warn','amber','degraded'].includes(key)) return 'warning';
  if(['critical','danger','red','failure','failed'].includes(key)) return 'critical';
  if(['normal','nominal','healthy','safe','ok','live','recovered'].includes(key)) return 'normal';
  return '';
}

function semanticPulseExplicitGaugeStates(detail={}){
  const raw = detail.raw || detail.telemetry?.raw || detail.normalized?.raw || null;
  if(!raw || typeof raw !== 'object') return new Map();
  const sources = [
    raw.gauge_states,
    raw.metric_states,
    raw.field_states,
    raw.component_states,
    raw.sensor_states
  ].filter(source=>source && typeof source === 'object' && !Array.isArray(source));
  const result = new Map();
  sources.forEach(source=>{
    Object.entries(source).forEach(([name,value])=>{
      const gauge = semanticPulseGaugeKey(name);
      const state = semanticPulseStateName(value);
      if(gauge && state) result.set(gauge, state);
    });
  });
  return result;
}

function semanticPulseColor(type, detail={}){
  if(detail.accent) return String(detail.accent);
  if(type === 'telemetry-warning') return 'var(--warn,var(--amber))';
  if(type === 'telemetry-critical') return 'var(--danger,var(--red))';
  if(type === 'state-recovery') return 'var(--safe,var(--green))';
  if(type === 'world-arrival' || type === 'world-departure'){
    return RUCA_WORLD_DESTINATIONS[detail.destination]?.accent || 'var(--ruca-gauge-accent,var(--gold))';
  }
  return 'var(--ruca-gauge-accent,var(--gold))';
}

function semanticPulseTargets(detail={}){
  const gauge = semanticPulseGaugeKey(detail.gauge || detail.component);
  return {
    gauge,
    gaugeElement:gauge ? $(`#homeChronograph .comp-${gauge}`) : null,
    conduit:gauge ? $(`#homeChronograph .${gauge}-line`) : null,
    beacon:detail.destination ? $(`.core-nav-beacon[data-core-route="${CSS.escape(String(detail.destination))}"]`) : null,
    command:detail.target ? $(String(detail.target)) : null
  };
}

function semanticPulseClear(){
  const classes = [
    'ruca-semantic-pulse-active',
    ...RUCA_SEMANTIC_PULSE_TYPES.map(type=>`ruca-semantic-pulse-${type}`)
  ];
  document.body.classList.remove(...classes);
  semanticPulseBoard?.classList.remove(...classes, 'is-reduced');
  semanticPulseLayer?.classList.remove('is-active');
  semanticPulseHeart?.classList.remove('semantic-heart-pulse');
  worldTravelLayer?.classList.remove('semantic-world-arrival');
  $$('.semantic-gauge-pulse, .semantic-conduit-pulse, .semantic-destination-pulse, .semantic-command-pulse, .semantic-benchmark-sweep')
    .forEach(element=>element.classList.remove(
      'semantic-gauge-pulse',
      'semantic-conduit-pulse',
      'semantic-destination-pulse',
      'semantic-command-pulse',
      'semantic-benchmark-sweep'
    ));
  delete document.body.dataset.rucaSemanticPulse;
  delete document.body.dataset.rucaSemanticGauge;
  semanticPulseState.activeType = '';
}

function semanticPulseStatusMessage(type, detail={}){
  if(detail.message) return String(detail.message);
  const gauge = semanticPulseGaugeKey(detail.gauge || detail.component);
  const label = gauge ? gauge.toUpperCase() : '';
  const messages = {
    'system-ready':'System ready.',
    'world-departure':`Departing for ${RUCA_WORLD_DESTINATIONS[detail.destination]?.label || 'destination'}.`,
    'world-arrival':`Arrived at ${RUCA_WORLD_DESTINATIONS[detail.destination]?.label || 'destination'}.`,
    'telemetry-warning':`${label} telemetry warning.`,
    'telemetry-critical':`${label} telemetry critical.`,
    'state-recovery':`${label} telemetry recovered.`,
    'command-ack':'Command acknowledged.',
    'benchmark-complete':'Benchmark results committed.'
  };
  return messages[type] || '';
}

function semanticPulseEmit(type, detail={}){
  if(!RUCA_SEMANTIC_PULSE_TYPES.includes(type) || !semanticPulseBoard) return null;
  const now = Date.now();
  const targets = semanticPulseTargets(detail);
  if(type === 'telemetry-critical'){
    const last = semanticPulseState.criticalCooldown.get(targets.gauge) || 0;
    if(now - last < 1800) return null;
    semanticPulseState.criticalCooldown.set(targets.gauge, now);
  }

  semanticPulseClear();
  semanticPulseState.sequence += 1;
  semanticPulseState.activeType = type;
  semanticPulseState.lastEvent = Object.freeze({
    id:semanticPulseState.sequence,
    type,
    at:new Date(now).toISOString(),
    gauge:targets.gauge || null,
    destination:detail.destination || null,
    reducedMotion:semanticPulseReducedMotion()
  });

  document.body.dataset.rucaSemanticPulse = type;
  if(targets.gauge) document.body.dataset.rucaSemanticGauge = targets.gauge;
  document.body.classList.add('ruca-semantic-pulse-active', `ruca-semantic-pulse-${type}`);
  semanticPulseBoard.classList.add('ruca-semantic-pulse-active', `ruca-semantic-pulse-${type}`);
  semanticPulseBoard.classList.toggle('is-reduced', semanticPulseReducedMotion());
  semanticPulseBoard.style.setProperty('--ruca-semantic-accent', semanticPulseColor(type, detail));
  semanticPulseLayer?.classList.add('is-active');

  if(['system-ready','world-departure','world-arrival','telemetry-critical','state-recovery','benchmark-complete'].includes(type)){
    semanticPulseHeart?.classList.add('semantic-heart-pulse');
  }
  if(targets.gaugeElement) targets.gaugeElement.classList.add('semantic-gauge-pulse');
  if(targets.conduit) targets.conduit.classList.add('semantic-conduit-pulse');
  if(targets.beacon) targets.beacon.classList.add('semantic-destination-pulse');
  if(targets.command) targets.command.classList.add('semantic-command-pulse');
  if(type === 'benchmark-complete'){
    $$('#homeChronograph .ruca-gauge').forEach(gauge=>gauge.classList.add('semantic-benchmark-sweep'));
  }
  if(type === 'world-arrival') worldTravelLayer?.classList.add('semantic-world-arrival');

  const message = semanticPulseStatusMessage(type, detail);
  if(semanticPulseStatus && message) semanticPulseStatus.textContent = message;

  const cleanupOwner = type === 'world-arrival'
    ? worldTravelLayer
    : (type === 'command-ack' && targets.command ? targets.command : semanticPulseBoard);
  const pulseId = semanticPulseState.sequence;
  const terminalAnimation = {
    'system-ready':'ruca31dReadyRing',
    'world-departure':'ruca31dDepartureHeart',
    'world-arrival':'ruca31dWorldArrival',
    'telemetry-warning':'ruca31dWarningGauge',
    'telemetry-critical':'ruca31dCriticalHeart',
    'state-recovery':'ruca31dRecoveryRing',
    'command-ack':'ruca31dCommandAck',
    'benchmark-complete':'ruca31dBenchmarkHeart'
  }[type];
  const reducedTerminalAnimation = semanticPulseReducedMotion()
    ? (type === 'world-arrival'
        ? 'ruca31dReducedSurface'
        : (['system-ready','state-recovery'].includes(type) ? 'ruca31dReducedPulse' : terminalAnimation))
    : terminalAnimation;
  const cleanupHandler = event=>{
    if(event.animationName !== reducedTerminalAnimation) return;
    cleanupOwner?.removeEventListener('animationend', cleanupHandler);
    if(semanticPulseState.sequence === pulseId) semanticPulseClear();
  };
  cleanupOwner?.addEventListener('animationend', cleanupHandler);

  window.dispatchEvent(new CustomEvent('ruca:semantic-pulse', {
    detail:Object.freeze({...semanticPulseState.lastEvent, message})
  }));
  return semanticPulseState.lastEvent;
}

function semanticPulseTelemetry(detail={}){
  if((document.body.dataset.world || 'home') !== 'home') return;
  const telemetry = detail.telemetry || detail.normalized || detail;
  const fresh = telemetry?.live === true && ['LIVE','PARTIAL'].includes(String(telemetry.status || '').toUpperCase());
  if(fresh && !semanticPulseState.readyFired && (document.body.dataset.world || 'home') === 'home'){
    semanticPulseState.readyFired = true;
    semanticPulseEmit('system-ready', {message:'Demo ready. Simulated sensor values are active.'});
  }
  semanticPulseExplicitGaugeStates({telemetry}).forEach((next,gauge)=>{
    const previous = semanticPulseState.gaugeStates.get(gauge);
    semanticPulseState.gaugeStates.set(gauge, next);
    if(next === previous) return;
    if(next === 'warning') semanticPulseEmit('telemetry-warning', {gauge});
    else if(next === 'critical') semanticPulseEmit('telemetry-critical', {gauge});
    else if(next === 'normal' && ['warning','critical'].includes(previous)){
      semanticPulseEmit('state-recovery', {gauge});
    }
  });
}

window.addEventListener('ruca:telemetry-updated', event=>semanticPulseTelemetry(event.detail || {}));

/* HOME gauge motion consumes the canonical telemetry event above.  It deliberately
   does not fetch, score, or schedule telemetry: the diagnostics bridge remains the
   sole owner of those responsibilities. */
const homeGaugeMotionState = new Map();
const homeConduitSignalTimers = new Map();
const HOME_GAUGE_MECHANICAL_KEYS = Object.freeze(['cpu','gpu','ram','storage','network','thermal']);
/* Rendered clockwise order, beginning at the upper-right SEND conduit.  This
   reuses the existing telemetry cadence and packet CSS; it adds no loop. */
const HOME_CONDUIT_CIRCULATION_ORDER = Object.freeze(['storage','network','thermal','ram','gpu','cpu']);
const homeConduitCirculationState = {index:0, sequence:0};
const RUCA_MATERIAL_LIBRARY = Object.freeze({
  RM_STEEL_BRUSHED:Object.freeze({
    id:'RM_STEEL_BRUSHED',
    baseColor:'#747d82',
    themeChannel:'mechanical',
    themeInfluence:.42,
    surfaceFinish:'directional satin brush',
    roughness:.38,
    metallicResponse:.96,
    edgeResponse:.72,
    directionalBrushing:.90,
    anisotropy:.90,
    chamferResponse:.76,
    contactShadow:.82,
    reflectionIntensity:.42
  }),
  RM_STEEL_POLISHED:Object.freeze({
    id:'RM_STEEL_POLISHED',
    baseColor:'#aeb7bc',
    themeChannel:'mechanical',
    themeInfluence:.34,
    surfaceFinish:'lapped mirror steel',
    roughness:.12,
    metallicResponse:.98,
    edgeResponse:.94,
    directionalBrushing:.12,
    anisotropy:.14,
    chamferResponse:.96,
    contactShadow:.76,
    reflectionIntensity:.82
  }),
  RM_TITANIUM:Object.freeze({
    id:'RM_TITANIUM',
    baseColor:'#555f66',
    themeChannel:'bezel',
    themeInfluence:.28,
    surfaceFinish:'bead-blasted titanium',
    roughness:.47,
    metallicResponse:.92,
    edgeResponse:.64,
    directionalBrushing:.34,
    anisotropy:.36,
    chamferResponse:.68,
    contactShadow:.88,
    reflectionIntensity:.31
  }),
  RM_BRASS:Object.freeze({
    id:'RM_BRASS',
    baseColor:'#8d6d32',
    themeChannel:'gears',
    themeInfluence:.18,
    surfaceFinish:'fine radial-brushed brass',
    roughness:.31,
    metallicResponse:.91,
    edgeResponse:.78,
    directionalBrushing:.72,
    anisotropy:.74,
    chamferResponse:.83,
    contactShadow:.80,
    reflectionIntensity:.49
  }),
  RM_BLACK_OXIDE:Object.freeze({
    id:'RM_BLACK_OXIDE',
    baseColor:'#24292c',
    themeChannel:'housing',
    themeInfluence:.46,
    surfaceFinish:'black-oxide micro bead blast',
    roughness:.58,
    metallicResponse:.84,
    edgeResponse:.43,
    directionalBrushing:.16,
    anisotropy:.18,
    chamferResponse:.51,
    contactShadow:.94,
    reflectionIntensity:.19
  }),
  RM_RUBY_JEWEL:Object.freeze({
    id:'RM_RUBY_JEWEL',
    baseColor:'#8f1026',
    themeChannel:'jewels',
    themeInfluence:.62,
    surfaceFinish:'faceted synthetic ruby',
    roughness:.06,
    metallicResponse:.02,
    edgeResponse:.92,
    directionalBrushing:.00,
    anisotropy:.00,
    chamferResponse:.88,
    contactShadow:.62,
    reflectionIntensity:.90
  }),
  RM_SMOKED_SAPPHIRE:Object.freeze({
    id:'RM_SMOKED_SAPPHIRE',
    baseColor:'#111b22',
    themeChannel:'glass',
    themeInfluence:.62,
    surfaceFinish:'smoked optical sapphire',
    roughness:.04,
    metallicResponse:.00,
    edgeResponse:.86,
    directionalBrushing:.00,
    anisotropy:.00,
    chamferResponse:.91,
    contactShadow:.48,
    reflectionIntensity:.78
  }),
  RM_DIELECTRIC:Object.freeze({
    id:'RM_DIELECTRIC',
    baseColor:'#20272b',
    themeChannel:'glass',
    themeInfluence:.45,
    surfaceFinish:'machined dielectric liner',
    roughness:.24,
    metallicResponse:.00,
    edgeResponse:.48,
    directionalBrushing:.08,
    anisotropy:.06,
    chamferResponse:.52,
    contactShadow:.72,
    reflectionIntensity:.34
  }),
  RM_CONDUIT_STEEL:Object.freeze({
    id:'RM_CONDUIT_STEEL',
    baseColor:'#3f484d',
    themeChannel:'bezel',
    themeInfluence:.38,
    surfaceFinish:'longitudinally brushed conduit steel',
    roughness:.35,
    metallicResponse:.94,
    edgeResponse:.74,
    directionalBrushing:.95,
    anisotropy:.96,
    chamferResponse:.79,
    contactShadow:.89,
    reflectionIntensity:.40
  })
});
const RUCA_MECHANICAL_COMPONENT_LIBRARY=window.RUCA_MECHANICAL_COMPONENTS;
function homeGaugeInstallConduitComponents(){
  const board=$('#homeChronograph');
  const themeSource=board?.querySelector('.complication');
  if(!board || !themeSource) return;
  const component=RUCA_MECHANICAL_COMPONENT_LIBRARY.RUCA_BULKHEAD_COUPLER;
  const response=homeGaugeResolveMaterial(component.material,homeGaugeTheme(themeSource));
  const material=response.material;
  board.style.setProperty('--rm-conduit-base',homeGaugeColor(response.base));
  board.style.setProperty('--rm-conduit-highlight',homeGaugeColor(response.highlight));
  board.style.setProperty('--rm-conduit-shadow',homeGaugeColor(response.shadow));
  board.style.setProperty('--rm-conduit-edge-response',`${Math.round(material.edgeResponse*100)}%`);
  board.style.setProperty('--rm-conduit-brush-response',`${Math.round(material.directionalBrushing*100)}%`);
  board.style.setProperty('--rm-conduit-contact-shadow',`${Math.round(material.contactShadow*100)}%`);
  board.style.setProperty('--rm-conduit-reflection',`${Math.round(material.reflectionIntensity*100)}%`);
  board.querySelectorAll('[data-conduit-termination="mechanical-coupler"] .pivot-node').forEach(node=>{
    node.dataset.rucaComponent=component.id;
    node.dataset.rucaMaterial=material.id;
    node.dataset.structuralRole=component.structuralRole;
    node.dataset.couplerPart='compression-collar';
  });
  board.querySelectorAll('.heart-mount').forEach(node=>{
    node.dataset.rucaComponent=component.id;
    node.dataset.rucaMaterial=material.id;
    node.dataset.structuralRole=component.structuralRole;
    node.dataset.couplerPart='bulkhead-flange';
  });
  board.querySelectorAll('.bridge-line').forEach((conduit,index)=>{
    ['c','d','e'].forEach(packetId=>{
      if(conduit.querySelector(`.energy-packet.packet-${packetId}`)) return;
      const packet=document.createElement('span');
      packet.className=`energy-packet packet-${packetId}`;
      conduit.insertBefore(packet,conduit.querySelector('.pivot-node'));
    });
    conduit.style.setProperty('--conduit-phase-bias',`${(-index*.18).toFixed(2)}s`);
  });
}
const HOME_GAUGE_RENDER_MANIFESTS=window.RUCA_GAUGE_RENDER_MANIFESTS;
const homeGaugeReducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)') || null;
const homeGaugeMechanicalAuthority = {
  owner:'HOME_GAUGE_MASTER_MOTION',
  states:new Map(),
  lastTimestamp:null,
  frameRequest:0,
  frameCount:0,
  totalDrawMs:0,
  maxDrawMs:0,
  themeRevision:0
};
const HOME_GAUGE_BEZEL_PHASE_OFFSETS = Object.freeze({
  cpu:0,
  gpu:60,
  ram:120,
  thermal:180,
  network:240,
  storage:300
});
const homeGaugeGearProfileCache = new Map();

function homeGaugeClamp(value, minimum=0, maximum=1){
  return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}

function homeGaugeParseColor(value, fallback={r:128,g:132,b:134}){
  const text = String(value || '').trim();
  const hex = text.replace('#','');
  if(/^[0-9a-f]{3}$/i.test(hex)){
    return {
      r:parseInt(hex[0] + hex[0],16),
      g:parseInt(hex[1] + hex[1],16),
      b:parseInt(hex[2] + hex[2],16)
    };
  }
  if(/^[0-9a-f]{6}$/i.test(hex)){
    return {
      r:parseInt(hex.slice(0,2),16),
      g:parseInt(hex.slice(2,4),16),
      b:parseInt(hex.slice(4,6),16)
    };
  }
  const rgb = text.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  return rgb ? {r:Number(rgb[1]),g:Number(rgb[2]),b:Number(rgb[3])} : fallback;
}

function homeGaugeMixColor(a,b,amount){
  const mix = homeGaugeClamp(amount);
  return {
    r:Math.round(a.r + (b.r - a.r) * mix),
    g:Math.round(a.g + (b.g - a.g) * mix),
    b:Math.round(a.b + (b.b - a.b) * mix)
  };
}

function homeGaugeColor(color,alpha=1){
  return `rgba(${Math.round(color.r)},${Math.round(color.g)},${Math.round(color.b)},${homeGaugeClamp(alpha).toFixed(4)})`;
}

function homeGaugeTheme(gauge){
  const style = getComputedStyle(document.documentElement);
  const read = (name,fallback) => homeGaugeParseColor(style.getPropertyValue(name),fallback);
  const background = read('--ruca-theme-background',{r:3,g:4,b:5});
  const housing = read('--ruca-theme-housing',{r:17,g:21,b:24});
  const bezel = read('--ruca-theme-bezel',{r:138,g:147,b:151});
  const mechanical = read('--ruca-theme-mechanical-metal',{r:198,g:206,b:209});
  return {
    background,
    housing,
    bezel,
    screws:read('--ruca-theme-screws',bezel),
    mechanical,
    gears:read('--ruca-theme-gears',mechanical),
    jewels:read('--ruca-theme-jewels',{r:215,g:29,b:45}),
    accent:read('--ruca-theme-primary',{r:255,g:0,b:0}),
    glass:read('--ruca-theme-glass-tint',{r:2,g:5,b:7}),
    text:read('--ruca-theme-tertiary',{r:255,g:255,b:255}),
    screwStyle:getComputedStyle(gauge).getPropertyValue('--instrument-screw-style').trim() || 'cross'
  };
}

function homeGaugeResolveMechanicalComponent(componentId){
  const component=RUCA_MECHANICAL_COMPONENT_LIBRARY[componentId];
  if(!component) throw new Error(`Unknown RUCA mechanical component: ${componentId}`);
  return component;
}

function homeGaugeResolveMaterial(materialId,theme){
  const material=RUCA_MATERIAL_LIBRARY[materialId];
  if(!material) throw new Error(`Unknown RUCA physical material: ${materialId}`);
  const materialColor=homeGaugeParseColor(material.baseColor,theme.mechanical);
  const semanticColor=theme[material.themeChannel] || theme.mechanical;
  const base=homeGaugeMixColor(materialColor,semanticColor,material.themeInfluence);
  const highlight=homeGaugeMixColor(
    base,
    theme.text,
    .10+(material.edgeResponse*.38)+(material.reflectionIntensity*.18)
  );
  const shadow=homeGaugeMixColor(
    base,
    theme.background,
    .42+(material.roughness*.38)
  );
  return Object.freeze({material,base,highlight,shadow});
}

function homeGaugePhysicalScale(size){
  return size*.0065;
}

function homeGaugeAnnulusPath(cx,cy,outerRadius,innerRadius,start=0,end=Math.PI * 2){
  const path = new Path2D();
  path.arc(cx,cy,outerRadius,start,end);
  path.arc(cx,cy,innerRadius,end,start,true);
  path.closePath();
  return path;
}

function homeGaugeDrawMachinedAnnulus(ctx,cx,cy,outerRadius,innerRadius,base,highlight,roughness=.28,segments=96,anisotropy=.72,metalness=.88){
  const lightAngle = -Math.PI * .34;
  const step = (Math.PI * 2) / segments;
  for(let index=0;index<segments;index+=1){
    const start = index * step;
    const end = start + step + .002;
    const center = (start + end) * .5;
    const directional = Math.max(-1,Math.min(1,Math.cos(center - lightAngle)))*anisotropy;
    const micro = Math.sin(index * 2.399963) * roughness;
    const fresnel = Math.pow(1-Math.abs(Math.cos(center-lightAngle)),5)*.035;
    const specular = ((.26 + directional * .23 + micro * .08)*metalness)+fresnel;
    const response = homeGaugeClamp(specular,0,.72);
    ctx.fillStyle = homeGaugeColor(homeGaugeMixColor(base,highlight,response),1);
    ctx.fill(homeGaugeAnnulusPath(cx,cy,outerRadius,innerRadius,start,end));
  }
  ctx.strokeStyle = homeGaugeColor(homeGaugeMixColor(highlight,{r:255,g:255,b:255},.18),.42);
  ctx.lineWidth = .65;
  ctx.beginPath();
  ctx.arc(cx,cy,outerRadius-.35,0,Math.PI*2);
  ctx.stroke();
  ctx.strokeStyle = homeGaugeColor(homeGaugeMixColor(base,{r:0,g:0,b:0},.78),.86);
  ctx.beginPath();
  ctx.arc(cx,cy,innerRadius+.45,0,Math.PI*2);
  ctx.stroke();
  for(let line=0;line<18;line+=1){
    const radius = innerRadius + 1 + ((outerRadius-innerRadius-2) * line / 17);
    ctx.strokeStyle = homeGaugeColor(line%3 ? highlight : base,line%3 ? .025 : .045);
    ctx.lineWidth = .38;
    ctx.beginPath();
    ctx.arc(cx,cy,radius,0,Math.PI*2);
    ctx.stroke();
  }
}

function homeGaugeInvolutePoint(baseRadius,t){
  return {
    x:baseRadius * (Math.cos(t) + t * Math.sin(t)),
    y:baseRadius * (Math.sin(t) - t * Math.cos(t))
  };
}

function homeGaugeInvoluteProfile(teeth,modulePx,pressureAngle=20){
  const cacheKey = `${teeth}:${modulePx.toFixed(4)}:${pressureAngle}`;
  const cached = homeGaugeGearProfileCache.get(cacheKey);
  if(cached) return cached;
  const pitchRadius = modulePx * teeth * .5;
  const outsideRadius = pitchRadius + modulePx;
  const rootRadius = Math.max(modulePx*2,pitchRadius - modulePx*1.25);
  const baseRadius = pitchRadius * Math.cos(pressureAngle * Math.PI / 180);
  const startRadius = Math.max(rootRadius,baseRadius);
  const tStart = Math.sqrt(Math.max(0,(startRadius/baseRadius)**2 - 1));
  const tOutside = Math.sqrt(Math.max(0,(outsideRadius/baseRadius)**2 - 1));
  const tPitch = Math.sqrt(Math.max(0,(pitchRadius/baseRadius)**2 - 1));
  const pitchPolar = tPitch - Math.atan(tPitch);
  const halfToothAngle = (Math.PI / (2 * teeth)) * .92;
  const flankRotation = halfToothAngle - pitchPolar;
  const toothAngle = Math.PI * 2 / teeth;
  const path = new Path2D();
  let started = false;
  for(let tooth=0;tooth<teeth;tooth+=1){
    const centerAngle = tooth * toothAngle;
    const leftRootAngle = centerAngle - toothAngle*.48;
    const leftRoot = {x:Math.cos(leftRootAngle)*rootRadius,y:Math.sin(leftRootAngle)*rootRadius};
    if(!started){
      path.moveTo(leftRoot.x,leftRoot.y);
      started = true;
    }else{
      path.lineTo(leftRoot.x,leftRoot.y);
    }
    for(let sample=0;sample<=5;sample+=1){
      const t = tStart + (tOutside-tStart) * sample/5;
      const point = homeGaugeInvolutePoint(baseRadius,t);
      const rawAngle = Math.atan2(point.y,point.x);
      const radius = Math.hypot(point.x,point.y);
      const angle = centerAngle - (rawAngle + flankRotation);
      path.lineTo(Math.cos(angle)*radius,Math.sin(angle)*radius);
    }
    for(let sample=1;sample<=3;sample+=1){
      const angle = centerAngle - halfToothAngle + (halfToothAngle*2) * sample/3;
      path.lineTo(Math.cos(angle)*outsideRadius,Math.sin(angle)*outsideRadius);
    }
    for(let sample=5;sample>=0;sample-=1){
      const t = tStart + (tOutside-tStart) * sample/5;
      const point = homeGaugeInvolutePoint(baseRadius,t);
      const rawAngle = Math.atan2(point.y,point.x);
      const radius = Math.hypot(point.x,point.y);
      const angle = centerAngle + (rawAngle + flankRotation);
      path.lineTo(Math.cos(angle)*radius,Math.sin(angle)*radius);
    }
    const rightRootAngle = centerAngle + toothAngle*.48;
    path.lineTo(Math.cos(rightRootAngle)*rootRadius,Math.sin(rightRootAngle)*rootRadius);
  }
  path.closePath();
  const profile = Object.freeze({
    path,
    pitchRadius,
    pitchDiameter:pitchRadius*2,
    outsideRadius,
    outsideDiameter:outsideRadius*2,
    rootRadius,
    rootDiameter:rootRadius*2,
    baseRadius,
    module:modulePx,
    teeth,
    pressureAngle,
    frontChamfer:modulePx*.38,
    rearChamfer:modulePx*.26
  });
  homeGaugeGearProfileCache.set(cacheKey,profile);
  return profile;
}

function homeGaugeWheelPath(profile,innerRadius){
  const wheel = new Path2D(profile.path);
  wheel.arc(0,0,innerRadius,0,Math.PI*2);
  return wheel;
}

function homeGaugeSpokePath(innerRadius,outerRadius,innerWidth,outerWidth,angle){
  const normalX=-Math.sin(angle);
  const normalY=Math.cos(angle);
  const directionX=Math.cos(angle);
  const directionY=Math.sin(angle);
  const path=new Path2D();
  path.moveTo(
    directionX*innerRadius+normalX*innerWidth,
    directionY*innerRadius+normalY*innerWidth
  );
  path.lineTo(
    directionX*outerRadius+normalX*outerWidth,
    directionY*outerRadius+normalY*outerWidth
  );
  path.lineTo(
    directionX*outerRadius-normalX*outerWidth,
    directionY*outerRadius-normalY*outerWidth
  );
  path.lineTo(
    directionX*innerRadius-normalX*innerWidth,
    directionY*innerRadius-normalY*innerWidth
  );
  path.closePath();
  return path;
}

function homeGaugeRenderGearComponent(ctx,gear,angle,theme,size){
  const profile=gear.profile;
  const component=gear.component;
  const geometry=component.geometry;
  const scale=homeGaugePhysicalScale(size);
  const materialResponse=homeGaugeResolveMaterial(component.material,theme);
  const material=materialResponse.material;
  const metal=materialResponse.base;
  const dark=materialResponse.shadow;
  const bright=materialResponse.highlight;
  const thickness=Math.max(2,geometry.thickness*scale);
  const hubRadius=Math.max(profile.module*2.05,geometry.hub.diameter*.5*scale);
  const boreRadius=Math.max(.8,geometry.bore*.5*scale);
  const innerRim=Math.max(hubRadius*1.42,profile.rootRadius*.57);
  const wheel=homeGaugeWheelPath(profile,innerRim);
  const spokes=gear.teeth>=28 ? 6 : 5;
  const spokeInner=hubRadius*.74;
  const spokeOuter=innerRim*1.04;
  const drawSpokes=(fillStyle,offset=0)=>{
    ctx.fillStyle=fillStyle;
    for(let spoke=0;spoke<spokes;spoke+=1){
      const spokePath=homeGaugeSpokePath(
        spokeInner,
        spokeOuter,
        Math.max(.8,hubRadius*.16),
        Math.max(1.15,profile.module*.72),
        spoke*Math.PI*2/spokes
      );
      if(offset){
        ctx.save();
        ctx.translate(0,offset);
        ctx.fill(spokePath);
        ctx.restore();
      }else{
        ctx.fill(spokePath);
      }
    }
  };

  ctx.save();
  ctx.translate(gear.x,gear.y);
  ctx.rotate(angle);
  ctx.save();
  ctx.translate(profile.module*.62,thickness+profile.module*.58);
  ctx.fillStyle=homeGaugeColor({r:0,g:0,b:0},.76+material.contactShadow*.18);
  ctx.shadowColor=homeGaugeColor({r:0,g:0,b:0},.94);
  ctx.shadowBlur=Math.max(1.8,profile.module*1.8);
  ctx.fill(wheel,'evenodd');
  drawSpokes(ctx.fillStyle);
  ctx.beginPath();
  ctx.arc(0,0,hubRadius,0,Math.PI*2);
  ctx.fill();
  ctx.restore();

  const sideLayers=Math.max(3,Math.ceil(thickness));
  for(let layer=sideLayers;layer>=1;layer-=1){
    const offset=thickness*layer/sideLayers;
    const layerResponse=.08+(layer/sideLayers)*.12;
    ctx.save();
    ctx.translate(0,offset);
    ctx.fillStyle=homeGaugeColor(homeGaugeMixColor(dark,metal,layerResponse),.99);
    ctx.fill(wheel,'evenodd');
    drawSpokes(ctx.fillStyle);
    ctx.beginPath();
    ctx.arc(0,0,hubRadius,0,Math.PI*2);
    ctx.fill();
    ctx.strokeStyle=homeGaugeColor(homeGaugeMixColor(dark,{r:0,g:0,b:0},.58),.94);
    ctx.lineWidth=Math.max(.55,geometry.rearChamfer*scale);
    ctx.stroke(profile.path);
    ctx.restore();
  }

  ctx.fillStyle=homeGaugeColor(metal,.995);
  ctx.fill(wheel,'evenodd');
  drawSpokes(homeGaugeColor(homeGaugeMixColor(metal,bright,.10),.995));
  ctx.beginPath();
  ctx.arc(0,0,hubRadius,0,Math.PI*2);
  ctx.fillStyle=homeGaugeColor(homeGaugeMixColor(metal,dark,.08),.995);
  ctx.fill();

  ctx.save();
  ctx.clip(wheel,'evenodd');
  const sectorCount=Math.max(16,Math.ceil(gear.teeth*.72));
  const keyLight=-Math.PI*.34-angle;
  for(let sector=0;sector<sectorCount;sector+=1){
    const start=sector*Math.PI*2/sectorCount;
    const end=start+Math.PI*2/sectorCount+.002;
    const directional=Math.max(0,Math.cos(start-keyLight));
    const brushed=Math.sin(sector*2.399963)*material.directionalBrushing*.035;
    const response=homeGaugeClamp(
      .03+(directional*material.reflectionIntensity*.38)+brushed,
      0,
      .54
    );
    ctx.fillStyle=homeGaugeColor(homeGaugeMixColor(metal,bright,response),.52);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.arc(0,0,profile.outsideRadius+1,start,end);
    ctx.closePath();
    ctx.fill();
  }
  const machiningLines=material.directionalBrushing>.4 ? 7 : 4;
  for(let line=0;line<machiningLines;line+=1){
    const radius=innerRim+(profile.rootRadius-innerRim)*(line+1)/(machiningLines+1);
    ctx.strokeStyle=homeGaugeColor(bright,.035+(material.directionalBrushing*.025));
    ctx.lineWidth=.32;
    ctx.beginPath();
    ctx.arc(0,0,radius,0,Math.PI*2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.strokeStyle=homeGaugeColor(dark,.90);
  ctx.lineWidth=Math.max(.72,geometry.chamfer*scale*1.7);
  ctx.stroke(profile.path);
  ctx.strokeStyle=homeGaugeColor(bright,.48+(material.chamferResponse*.34));
  ctx.lineWidth=Math.max(.42,geometry.frontChamfer*scale*.72);
  ctx.stroke(profile.path);
  ctx.strokeStyle=homeGaugeColor(dark,.72);
  ctx.lineWidth=Math.max(.5,profile.module*.46);
  ctx.beginPath();
  ctx.arc(0,0,profile.rootRadius,0,Math.PI*2);
  ctx.stroke();
  ctx.strokeStyle=homeGaugeColor(bright,.20);
  ctx.lineWidth=.42;
  ctx.beginPath();
  ctx.arc(0,0,innerRim+.28,0,Math.PI*2);
  ctx.stroke();

  for(let spoke=0;spoke<spokes;spoke+=1){
    const a=spoke*Math.PI*2/spokes;
    const spokePath=homeGaugeSpokePath(
      spokeInner,
      spokeOuter,
      Math.max(.8,hubRadius*.16),
      Math.max(1.15,profile.module*.72),
      a
    );
    ctx.strokeStyle=homeGaugeColor(dark,.78);
    ctx.lineWidth=Math.max(.52,geometry.edgeRadius*scale*1.6);
    ctx.stroke(spokePath);
    ctx.strokeStyle=homeGaugeColor(bright,.24);
    ctx.lineWidth=.36;
    ctx.stroke(spokePath);
  }

  homeGaugeDrawMachinedAnnulus(
    ctx,
    0,
    0,
    hubRadius,
    boreRadius,
    homeGaugeMixColor(metal,dark,.32),
    bright,
    material.roughness,
    28,
    material.anisotropy,
    material.metallicResponse
  );
  ctx.fillStyle=homeGaugeColor(theme.background,.98);
  ctx.beginPath();
  ctx.arc(0,0,boreRadius,0,Math.PI*2);
  ctx.fill();
  ctx.strokeStyle=homeGaugeColor(dark,.96);
  ctx.lineWidth=Math.max(.55,geometry.edgeRadius*scale*2);
  ctx.stroke();

  const shaft=homeGaugeResolveMechanicalComponent(gear.index===0?'RUCA_MAIN_SHAFT':'RUCA_AUX_SHAFT');
  const shaftMaterial=homeGaugeResolveMaterial(shaft.material,theme);
  const shaftRadius=Math.max(.65,shaft.geometry.diameter*.5*scale);
  ctx.fillStyle=homeGaugeColor(shaftMaterial.base,.99);
  ctx.beginPath();
  ctx.arc(0,0,shaftRadius,0,Math.PI*2);
  ctx.fill();
  ctx.strokeStyle=homeGaugeColor(shaftMaterial.highlight,.76);
  ctx.lineWidth=.45;
  ctx.stroke();
  ctx.fillStyle=homeGaugeColor(shaftMaterial.shadow,.95);
  ctx.fillRect(0,-Math.max(.3,shaftRadius*.24),Math.max(.8,shaftRadius*.78),Math.max(.6,shaftRadius*.48));
  ctx.restore();
}

function homeGaugeRenderJewel(ctx,x,y,radius,theme,componentId='RUCA_JEWEL'){
  const component=homeGaugeResolveMechanicalComponent(componentId);
  const jewelResponse=homeGaugeResolveMaterial(component.material,theme);
  const seatResponse=homeGaugeResolveMaterial('RM_STEEL_BRUSHED',theme);
  const dark=jewelResponse.shadow;
  ctx.save();
  ctx.shadowColor=homeGaugeColor({r:0,g:0,b:0},.86);
  ctx.shadowBlur=Math.max(1.2,radius*.55);
  ctx.shadowOffsetY=Math.max(.6,radius*.24);
  ctx.fillStyle=homeGaugeColor(seatResponse.shadow,1);
  ctx.beginPath();
  ctx.arc(x,y,radius+2.1,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle=homeGaugeColor(seatResponse.highlight,.38);
  ctx.lineWidth=.7;
  ctx.stroke();
  for(let facet=0;facet<12;facet+=1){
    const start=facet*Math.PI*2/12;
    const response=.16+Math.max(0,Math.cos(start+Math.PI*.28))*.54;
    ctx.fillStyle=homeGaugeColor(homeGaugeMixColor(dark,jewelResponse.highlight,response),.98);
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.arc(x,y,radius,start,start+Math.PI*2/12+.01);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle=homeGaugeColor(jewelResponse.highlight,.66);
  ctx.beginPath();
  ctx.arc(x-radius*.24,y-radius*.28,Math.max(.42,radius*.15),0,Math.PI*2);
  ctx.fill();
  ctx.fillStyle=homeGaugeColor(jewelResponse.shadow,.94);
  ctx.beginPath();
  ctx.arc(x,y,Math.max(.42,radius*.20),0,Math.PI*2);
  ctx.fill();
}

function homeGaugeRenderPivotBridge(ctx,gearCenters,component,theme,size,layer='plate'){
  if(!gearCenters.length) return;
  const geometry=component.geometry;
  const bridgeMaterial=homeGaugeResolveMaterial(component.material,theme);
  const contactShadow=bridgeMaterial.material.contactShadow;
  const scale=homeGaugePhysicalScale(size);
  const width=Math.max(3.4,geometry.width*scale);
  const first=gearCenters[0];
  const last=gearCenters[gearCenters.length-1];
  const axisX=last.x-first.x;
  const axisY=last.y-first.y;
  const axisLength=Math.max(1,Math.hypot(axisX,axisY));
  const normalX=-axisY/axisLength;
  const normalY=axisX/axisLength;
  const offset=Math.min(size*.026,width*1.05);
  const bridgePoints=gearCenters.map((center,index)=>({
    x:center.x+normalX*offset*(index===0||index===gearCenters.length-1 ? .74 : 1),
    y:center.y+normalY*offset*(index===0||index===gearCenters.length-1 ? .74 : 1)
  }));

  if(layer==='plate'){
    const traceBridge=()=>{
      ctx.beginPath();
      ctx.moveTo(bridgePoints[0].x,bridgePoints[0].y);
      for(let index=1;index<bridgePoints.length;index+=1){
        ctx.lineTo(bridgePoints[index].x,bridgePoints[index].y);
      }
    };
    ctx.save();
    ctx.lineCap='round';
    ctx.lineJoin='round';
    traceBridge();
    ctx.strokeStyle=homeGaugeColor({r:0,g:0,b:0},.62+(contactShadow*.30));
    ctx.lineWidth=width+3;
    ctx.shadowColor=homeGaugeColor({r:0,g:0,b:0},.92);
    ctx.shadowBlur=Math.max(1.5,geometry.thickness*scale);
    ctx.shadowOffsetY=Math.max(.8,geometry.thickness*scale*.46);
    ctx.stroke();
    ctx.shadowBlur=0;
    traceBridge();
    ctx.strokeStyle=homeGaugeColor(bridgeMaterial.shadow,.99);
    ctx.lineWidth=width+1;
    ctx.stroke();
    traceBridge();
    ctx.strokeStyle=homeGaugeColor(bridgeMaterial.base,.99);
    ctx.lineWidth=width;
    ctx.stroke();
    ctx.translate(-normalX*width*.22,-normalY*width*.22);
    traceBridge();
    ctx.strokeStyle=homeGaugeColor(bridgeMaterial.highlight,.42+(bridgeMaterial.material.edgeResponse*.24));
    ctx.lineWidth=Math.max(.46,geometry.chamfer*scale);
    ctx.stroke();
    ctx.restore();
    for(let index=0;index<gearCenters.length;index+=1){
      const pivot=gearCenters[index];
      const bridgePoint=bridgePoints[index];
      ctx.save();
      ctx.lineCap='round';
      ctx.strokeStyle=homeGaugeColor({r:0,g:0,b:0},.72);
      ctx.lineWidth=width+2;
      ctx.beginPath();
      ctx.moveTo(pivot.x,pivot.y);
      ctx.lineTo(bridgePoint.x,bridgePoint.y);
      ctx.stroke();
      ctx.strokeStyle=homeGaugeColor(bridgeMaterial.base,.98);
      ctx.lineWidth=width;
      ctx.stroke();
      ctx.strokeStyle=homeGaugeColor(bridgeMaterial.highlight,.32);
      ctx.lineWidth=.48;
      ctx.stroke();
      ctx.restore();
    }
    return;
  }

  const pivotCount=Math.min(gearCenters.length,Math.max(2,geometry.pivotCount));
  const pivotIndices=pivotCount>=gearCenters.length
    ? gearCenters.map((_,index)=>index)
    : [0,gearCenters.length-1];
  pivotIndices.forEach((pivotIndex,index)=>{
    const pivot=gearCenters[pivotIndex];
    const seatRadius=Math.max(2.7,geometry.shoulderRadius*scale);
    homeGaugeDrawMachinedAnnulus(
      ctx,
      pivot.x,
      pivot.y,
      seatRadius,
      seatRadius*.47,
      bridgeMaterial.shadow,
      bridgeMaterial.highlight,
      bridgeMaterial.material.roughness,
      32,
      bridgeMaterial.material.anisotropy,
      bridgeMaterial.material.metallicResponse
    );
    if(index===0||index===pivotIndices.length-1){
      homeGaugeRenderJewel(ctx,pivot.x,pivot.y,Math.max(1.7,size*.0105),theme);
    }
  });
}

function homeGaugeRenderBalanceWheel(ctx,balance,angle,theme,size,driver,componentId='RUCA_BALANCE_WHEEL'){
  const component=homeGaugeResolveMechanicalComponent(componentId);
  const wheelMaterial=homeGaugeResolveMaterial(component.material,theme);
  const x=balance.x*size;
  const y=balance.y*size;
  const radius=balance.radius*size;
  const metal=wheelMaterial.base;
  const bright=wheelMaterial.highlight;
  const dark=wheelMaterial.shadow;
  ctx.save();
  ctx.shadowColor=homeGaugeColor({r:0,g:0,b:0},.88);
  ctx.shadowBlur=Math.max(1.5,size*.008);
  ctx.shadowOffsetY=Math.max(.8,size*.005);
  ctx.fillStyle=homeGaugeColor({r:0,g:0,b:0},.70);
  ctx.beginPath();
  ctx.arc(x,y+Math.max(1.2,size*.009),radius,0,Math.PI*2);
  ctx.fill();
  ctx.shadowBlur=0;
  ctx.translate(x,y);
  ctx.rotate(angle);
  homeGaugeDrawMachinedAnnulus(
    ctx,
    0,
    0,
    radius,
    radius*.78,
    metal,
    bright,
    wheelMaterial.material.roughness,
    56,
    wheelMaterial.material.anisotropy,
    wheelMaterial.material.metallicResponse
  );
  for(let spoke=0;spoke<component.geometry.spokes;spoke+=1){
    const a=spoke*Math.PI*2/component.geometry.spokes;
    const spokePath=homeGaugeSpokePath(radius*.18,radius*.80,radius*.035,radius*.055,a);
    ctx.fillStyle=homeGaugeColor(homeGaugeMixColor(metal,bright,.12),.96);
    ctx.fill(spokePath);
    ctx.strokeStyle=homeGaugeColor(dark,.72);
    ctx.lineWidth=.45;
    ctx.stroke(spokePath);
    ctx.strokeStyle=homeGaugeColor(bright,.26);
    ctx.lineWidth=.3;
    ctx.stroke(spokePath);
  }
  ctx.restore();
  ctx.strokeStyle=homeGaugeColor(homeGaugeMixColor(theme.mechanical,theme.text,.18),.60);
  ctx.lineWidth=Math.max(.45,size*.0028);
  ctx.beginPath();
  for(let sample=0;sample<=64;sample+=1){
    const t=sample/64*Math.PI*7.2;
    const r=radius*(.10+.028*t);
    const px=x+Math.cos(t+angle*.35)*r;
    const py=y+Math.sin(t+angle*.35)*r;
    if(sample===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
  }
  ctx.stroke();
  homeGaugeRenderJewel(ctx,x,y,Math.max(2.1,size*.014),theme);
  const palletX=x+(driver.x-x)*.44;
  const palletY=y+(driver.y-y)*.44;
  ctx.save();
  ctx.translate(palletX,palletY);
  ctx.rotate(Math.atan2(driver.y-y,driver.x-x)+angle*.08);
  ctx.strokeStyle=homeGaugeColor(homeGaugeMixColor(theme.mechanical,theme.housing,.32),.92);
  ctx.lineWidth=Math.max(1.4,size*.009);
  ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(-size*.032,0);
  ctx.lineTo(size*.032,0);
  ctx.stroke();
  ctx.fillStyle=homeGaugeColor(theme.jewels,.86);
  ctx.fillRect(-size*.035,-size*.012,size*.010,size*.024);
  ctx.fillRect(size*.025,-size*.012,size*.010,size*.024);
  ctx.restore();
}

function homeGaugeTrainGeometry(spec,train,size){
  const components=train.components.map(homeGaugeResolveMechanicalComponent);
  const profiles=components.map(component=>homeGaugeInvoluteProfile(
    component.geometry.teeth,
    component.geometry.module*homeGaugePhysicalScale(size),
    HOME_GAUGE_RENDER_MANIFESTS.pressureAngle
  ));
  const gears=[{
    x:train.origin[0]*size,
    y:train.origin[1]*size,
    teeth:components[0].geometry.teeth,
    profile:profiles[0],
    component:components[0],
    index:0
  }];
  for(let index=1;index<profiles.length;index+=1){
    const previous=gears[index-1];
    const distance=previous.profile.pitchRadius+profiles[index].pitchRadius;
    const direction=train.meshAngles[index-1];
    gears.push({
      x:previous.x+Math.cos(direction)*distance,
      y:previous.y+Math.sin(direction)*distance,
      teeth:components[index].geometry.teeth,
      profile:profiles[index],
      component:components[index],
      index
    });
  }
  return gears;
}

function homeGaugeEvaluateAssemblyPose(state,spec,size){
  const compiled=window.RUCA_MECHANICAL_RUNTIME.getCompiled(state.key);
  if(!compiled) throw new Error(`Missing compiled drivetrain for ${state.key}`);
  const inputs={};
  spec.trains.forEach(train=>{
    const upload=train.channel==='upload';
    inputs[train.channel]={
      angleDegrees:upload ? state.uploadPhase : state.phase,
      angularVelocityDegreesPerSecond:upload
        ? state.uploadDegreesPerSecond
        : state.currentDegreesPerSecond,
      regulatorAmplitudeDegrees:state.regulatorAmplitude
    };
  });
  if(!state.drivetrainInstallation){
    const meshAxesDegreesByLink={};
    spec.trains.forEach(train=>{
      const meshLinks=compiled.assembly.driveLinks.filter(link=>(
        (link.channel || 'primary')===train.channel && link.type==='external-mesh'
      ));
      meshLinks.forEach((link,index)=>{
        meshAxesDegreesByLink[link.id]=Number(train.meshAngles[index])*180/Math.PI;
      });
    });
    state.drivetrainInstallation=compiled.mount('canvas-renderer',{meshAxesDegreesByLink});
  }
  return state.drivetrainInstallation.evaluate({inputs});
}

function homeGaugeDrawTrain(ctx,state,spec,train,size,theme,mechanicalPose){
  const components=train.components.map(homeGaugeResolveMechanicalComponent);
  const materials=components.map(component=>homeGaugeResolveMaterial(component.material,theme));
  const gears=homeGaugeTrainGeometry(spec,train,size);
  const channelPose=mechanicalPose.channels.find(channel=>channel.channel===train.channel);
  const stageByNode=new Map(channelPose.stages.map(stage=>[stage.nodeId,stage]));
  const angles=train.gearNodeIds.map(nodeId=>stageByNode.get(nodeId).angleDegrees*Math.PI/180);
  for(let index=0;index<gears.length;index+=1){
    homeGaugeRenderGearComponent(ctx,gears[index],angles[index],theme,size);
  }
  const driver=gears[0];
  const output=gears[gears.length-1];
  ctx.save();
  ctx.translate(output.x,output.y);
  ctx.rotate(channelPose.output.angleDegrees*Math.PI/180);
  ctx.strokeStyle=homeGaugeColor(theme.accent,.56);
  ctx.lineWidth=Math.max(.8,size*.004);
  ctx.beginPath();
  ctx.moveTo(output.profile.rootRadius*.24,0);
  ctx.lineTo(output.profile.rootRadius*.62,0);
  ctx.stroke();
  ctx.restore();
  return {gears,angles,components,materials,channelPose};
}

function homeGaugeBuildStaticSurface(state,size,dpr,theme){
  const surface=state.staticSurface || document.createElement('canvas');
  const fixedSurface=state.fixedSurface || document.createElement('canvas');
  surface.width=Math.round(size*dpr);
  surface.height=Math.round(size*dpr);
  fixedSurface.width=Math.round(size*dpr);
  fixedSurface.height=Math.round(size*dpr);
  const ctx=surface.getContext('2d',{alpha:true});
  const fixedCtx=fixedSurface.getContext('2d',{alpha:true});
  ctx.setTransform(dpr,0,0,dpr,0,0);
  fixedCtx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,size,size);
  fixedCtx.clearRect(0,0,size,size);
  const center=size*.5;
  const outer=size*.494;
  homeGaugeDrawMachinedAnnulus(ctx,center,center,outer,size*.432,homeGaugeMixColor(theme.housing,theme.background,.28),theme.bezel,.32,128);
  homeGaugeDrawMachinedAnnulus(ctx,center,center,size*.427,size*.397,homeGaugeMixColor(theme.housing,theme.background,.48),homeGaugeMixColor(theme.bezel,theme.housing,.54),.21,112);
  homeGaugeDrawMachinedAnnulus(ctx,center,center,size*.394,size*.372,homeGaugeMixColor(theme.background,theme.housing,.16),homeGaugeMixColor(theme.bezel,theme.text,.14),.13,96);
  ctx.strokeStyle=homeGaugeColor(homeGaugeMixColor(theme.bezel,theme.text,.16),.25);
  ctx.lineWidth=.8;
  ctx.stroke();
  const portAngle=Number.parseFloat(state.gauge.dataset.gaugePortAngle);
  if(Number.isFinite(portAngle)){
    const angle=portAngle*Math.PI/180;
    const x=center+Math.cos(angle)*size*.438;
    const y=center+Math.sin(angle)*size*.438;
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.fillStyle=homeGaugeColor(homeGaugeMixColor(theme.housing,theme.background,.66),1);
    ctx.fillRect(-size*.017,-size*.045,size*.034,size*.09);
    ctx.strokeStyle=homeGaugeColor(theme.bezel,.42);
    ctx.lineWidth=.7;
    ctx.strokeRect(-size*.017,-size*.045,size*.034,size*.09);
    ctx.restore();
  }
  const spec=HOME_GAUGE_RENDER_MANIFESTS[state.key];
  if(spec){
    ctx.save();
    fixedCtx.save();
    for(const renderContext of [ctx,fixedCtx]){
      renderContext.beginPath();
      renderContext.arc(size*.5,size*.5,size*.367,0,Math.PI*2);
      renderContext.clip();
    }
    spec.trains.forEach(train=>{
      const gears=homeGaugeTrainGeometry(spec,train,size);
      const bridgeComponent=homeGaugeResolveMechanicalComponent(train.bridge);
      homeGaugeRenderPivotBridge(ctx,gears,bridgeComponent,theme,size,'plate');
      homeGaugeRenderPivotBridge(fixedCtx,gears,bridgeComponent,theme,size,'bearingSeats');
    });
    ctx.restore();
    fixedCtx.restore();
  }
  state.staticSurface=surface;
  state.fixedSurface=fixedSurface;
  state.theme=theme;
  state.staticRevision=homeGaugeMechanicalAuthority.themeRevision;
}

function homeGaugePrepareRenderer(state){
  const canvas=state.canvas || state.gauge.querySelector('.instrument-render-surface');
  if(!canvas?.getContext) return false;
  state.canvas=canvas;
  state.ctx=state.ctx || canvas.getContext('2d',{alpha:true,desynchronized:true});
  if(!state.ctx) return false;
  const size=Math.max(1,canvas.clientWidth||state.gauge.clientWidth||1);
  const dpr=Math.min(Math.max(window.devicePixelRatio||1,1.25),2);
  const target=Math.round(size*dpr);
  if(canvas.width!==target || canvas.height!==target){
    canvas.width=target;
    canvas.height=target;
    state.size=size;
    state.dpr=dpr;
    state.staticRevision=-1;
  }
  if(state.staticRevision!==homeGaugeMechanicalAuthority.themeRevision){
    homeGaugeBuildStaticSurface(state,size,dpr,homeGaugeTheme(state.gauge));
  }
  canvas.dataset.renderer='PASS59_PHYSICAL_MATERIAL_LIBRARY';
  canvas.dataset.motionAuthority=homeGaugeMechanicalAuthority.owner;
  canvas.dataset.pressureAngle=String(HOME_GAUGE_RENDER_MANIFESTS.pressureAngle);
  canvas.dataset.renderScale=dpr.toFixed(2);
  return true;
}

function homeGaugeDrawRecessEnergy(state){
  const strength=state.internalEnergyStrength || 0;
  if(strength<=0) return;
  // Electric Slide: a staggered three-step chase, then darkness. This is a
  // derivative of HOME's existing phase, never a second clock or random flicker.
  const offset=HOME_GAUGE_BEZEL_PHASE_OFFSETS[state.key] || 0;
  const phase=(4*(state.bezelEnergyPhase-offset)+offset)/360;
  const beat=((phase%1)+1)%1;
  const windows=[[0,.26],[.34,.22],[.66,.24]];
  const step=windows.findIndex(([start,duration])=>beat>=start && beat<start+duration);
  if(step<0) return;
  const progress=(beat-windows[step][0])/windows[step][1];
  // Reuse the current mechanism bitmap as the occluder. Repeated destination-out
  // suppresses light beneath translucent metal without changing that metal.
  const surface=state.recessSurface || document.createElement('canvas');
  if(surface.width!==state.canvas.width || surface.height!==state.canvas.height){
    surface.width=state.canvas.width;
    surface.height=state.canvas.height;
  }
  state.recessSurface=surface;
  const ctx=surface.getContext('2d',{alpha:true});
  const size=surface.width;
  ctx.clearRect(0,0,size,size);
  ctx.globalCompositeOperation='source-over';
  if(state.recessPathSize!==size){
    const spec=HOME_GAUGE_RENDER_MANIFESTS[state.key];
    const gears=spec.trains.flatMap(train=>homeGaugeTrainGeometry(spec,train,size));
    // Open paths follow existing gear-edge geometry, not new luminous rings.
    const direction=(offset/60)%2===0 ? 1 : -1;
    state.recessPaths=gears.map(gear=>Array.from({length:17},(_,point)=>{
      const along=direction>0 ? point/16 : 1-point/16;
      const inward=Math.atan2(size*.5-gear.y,size*.5-gear.x);
      const angle=inward+(-.44+along*.88)*Math.PI;
      const radius=gear.profile.outsideRadius+size*(.022+(point%3===1?.004:0));
      return {x:gear.x+Math.cos(angle)*radius,y:gear.y+Math.sin(angle)*radius};
    }));
    state.recessPathSize=size;
  }
  const route=state.recessPaths[(step+Math.floor(((phase%4)+4)%4))%state.recessPaths.length];
  // Travel the existing path, hold its readable end, then fade in place. The
  // bright head must not overshoot and leave only a dim tail for most of a beat.
  const head=(route.length-1)*Math.min(1,progress/.7);
  const tail=head-12;
  const envelope=Math.min(1,progress/.07,(1-progress)/.12)*strength;
  ctx.save();
  ctx.beginPath();
  ctx.arc(size*.5,size*.5,size*.345,0,Math.PI*2);
  ctx.clip();
  ctx.lineCap='round';
  ctx.lineJoin='round';
  const hot=homeGaugeMixColor(state.theme.accent,state.theme.text,.97);
  for(let segment=0;segment<route.length-1;segment+=1){
    const from=Math.max(segment,tail),to=Math.min(segment+1,head);
    if(to<=from) continue;
    const a=route[segment],b=route[segment+1];
    const mix=t=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
    const p=mix(from-segment),q=mix(to-segment);
    const intensity=envelope*(.4+.6*Math.min(1,Math.max(0,(to-tail)/12)));
    ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);
    ctx.lineWidth=Math.max(2,size*.036);
    ctx.strokeStyle=homeGaugeColor(state.theme.accent,intensity*.68);
    ctx.stroke();
    ctx.lineWidth=Math.max(1,size*.020);
    ctx.strokeStyle=homeGaugeColor(hot,intensity);
    ctx.stroke();
    // A second hairline folds alongside the current, suggesting a tiny curtain
    // without filling the cavity. Both strands are occluded by the same bitmap.
    const fold=Math.sin(progress*Math.PI*2+segment*.65)*size*.012;
    ctx.beginPath();ctx.moveTo(p.x+fold,p.y-size*.033);
    ctx.lineTo(q.x+fold*.7,q.y-size*.033);
    ctx.lineWidth=Math.max(.7,size*.011);
    ctx.strokeStyle=homeGaugeColor(homeGaugeMixColor(state.theme.accent,hot,.34),intensity*.9);
    ctx.stroke();
    // One short supported fork on the syncopated middle step, not a lightning cloud.
    if(step===1 && segment===8 && progress>.4 && progress<.68){
      ctx.beginPath();ctx.moveTo(q.x,q.y);
      ctx.lineTo(q.x-size*.019,q.y-size*.026);
      ctx.strokeStyle=homeGaugeColor(hot,intensity*.65);
      ctx.stroke();
    }
  }
  ctx.restore();
  ctx.globalAlpha=1;
  ctx.globalCompositeOperation='destination-out';
  for(let layer=0;layer<4;layer+=1) ctx.drawImage(state.canvas,0,0);
  ctx.globalCompositeOperation='source-over';
  state.ctx.save();
  state.ctx.setTransform(1,0,0,1,0,0);
  state.ctx.globalCompositeOperation='destination-over';
  state.ctx.drawImage(surface,0,0);
  state.ctx.restore();
}

function homeGaugeRenderTransmissionCanvas2D(state,chassisOnly=false){
  if(!homeGaugePrepareRenderer(state)) return 0;
  const started=performance.now();
  const ctx=state.ctx;
  const size=state.size;
  const dpr=state.dpr;
  const spec=HOME_GAUGE_RENDER_MANIFESTS[state.key];
  const theme=state.theme || homeGaugeTheme(state.gauge);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,size,size);
  if(chassisOnly){
    // CPU reuses this same surface beneath Babylon: preserve only the already
    // visible housing edge, never a second set of fallback gears or bridges.
    ctx.save();
    ctx.beginPath();ctx.rect(0,0,size,size);
    ctx.arc(size*.5,size*.5,size*.4875,0,Math.PI*2,true);
    ctx.clip('evenodd');
    ctx.drawImage(state.staticSurface,0,0,size,size);
    ctx.restore();
    homeGaugeDrawRecessEnergy(state);
    // Admit the aperture only after the fallback bitmap has been cleared.
    state.canvas.dataset.cpuSurface='chassis-energy';
    const elapsed=performance.now()-started;
    state.lastDrawMs=elapsed;
    return elapsed;
  }
  if(state.key==='cpu') delete state.canvas.dataset.cpuSurface;
  ctx.drawImage(state.staticSurface,0,0,size,size);
  ctx.save();
  ctx.beginPath();
  ctx.arc(size*.5,size*.5,size*.367,0,Math.PI*2);
  ctx.clip();
  const visibility=homeGaugeClamp(.76+(state.telemetryLevel||0)*.0011,.76,.87);
  ctx.globalAlpha=visibility;
  const mechanicalPose=homeGaugeEvaluateAssemblyPose(state,spec,size);
  state.mechanicalPose=mechanicalPose;
  const trainResults=spec.trains.map(train=>homeGaugeDrawTrain(ctx,state,spec,train,size,theme,mechanicalPose));
  const driver=trainResults[0]?.gears[0];
  if(driver && spec.balance){
    const balanceStage=mechanicalPose.channels
      .flatMap(channel=>channel.stages)
      .find(stage=>stage.role==='regulator');
    homeGaugeRenderBalanceWheel(
      ctx,
      spec.balance,
      (balanceStage?.angleDegrees || 0)*Math.PI/180,
      theme,
      size,
      driver,
      spec.components.balance
    );
  }
  if(state.fixedSurface){
    ctx.drawImage(state.fixedSurface,0,0,size,size);
  }
  ctx.restore();
  homeGaugeDrawRecessEnergy(state);
  state.canvas.dataset.trainCount=String(spec.trains.length);
  state.canvas.dataset.toothSets=spec.trains.map(train=>train.components
    .map(componentId=>homeGaugeResolveMechanicalComponent(componentId).geometry.teeth)
    .join(':')).join('|');
  state.canvas.dataset.componentAssemblies=spec.trains.map(train=>train.components.join(':')).join('|');
  state.canvas.dataset.materialAssemblies=spec.trains.map(train=>train.components
    .map(componentId=>homeGaugeResolveMechanicalComponent(componentId).material)
    .join(':')).join('|');
  state.canvas.dataset.driverPhase=state.phase.toFixed(4);
  state.canvas.dataset.driverDegreesPerSecond=state.currentDegreesPerSecond.toFixed(4);
  state.canvas.dataset.uploadPhase=state.uploadPhase.toFixed(4);
  state.canvas.dataset.uploadDegreesPerSecond=state.uploadDegreesPerSecond.toFixed(4);
  state.canvas.dataset.telemetryLevel=state.telemetryLevel.toFixed(3);
  state.canvas.dataset.meshConstraint='opposite-direction-tooth-ratio';
  state.canvas.dataset.transmissionModel=mechanicalPose.assemblyId;
  state.canvas.dataset.transmissionMotion=mechanicalPose.motionType;
  state.canvas.dataset.transmissionSource=mechanicalPose.masterSource;
  state.canvas.dataset.independentMotionOwners=String(mechanicalPose.independentMotionOwners);
  state.canvas.dataset.contactPhaseMaxError=mechanicalPose.maximumContactPhaseErrorDegrees.toFixed(8);
  state.canvas.dataset.gearAngles=spec.trains.map((train,index)=>train.gearNodeIds
    .map(nodeId=>trainResults[index].channelPose.stages.find(stage=>stage.nodeId===nodeId).angleDegrees.toFixed(4))
    .join(':')).join('|');
  state.canvas.dataset.gearAngularVelocities=spec.trains.map((train,index)=>train.gearNodeIds
    .map(nodeId=>trainResults[index].channelPose.stages.find(stage=>stage.nodeId===nodeId).angularVelocityDegreesPerSecond.toFixed(4))
    .join(':')).join('|');
  state.canvas.dataset.fixedParts='bridge,jewels,bearings,shafts,washers,retainers,screws,mounts';
  state.canvas.dataset.frame=String(homeGaugeMechanicalAuthority.frameCount);
  const elapsed=performance.now()-started;
  state.lastDrawMs=elapsed;
  state.canvas.dataset.lastDrawMs=elapsed.toFixed(3);
  return elapsed;
}

function homeGaugeRenderTransmission(state){
  if(homeGaugeMechanicalShouldRun()){
    const live=state.live || state.downloadLive || state.uploadLive;
    state.internalEnergyStrength=live && !homeGaugeMechanicalMotionReduced() ? 1 : 0;
  }
  const gpuRenderer=state.key==='cpu' ? window.RUCA_BABYLON_CPU_RENDERER : null;
  if(gpuRenderer?.isActive?.()){
    const chassisDrawMs=homeGaugeRenderTransmissionCanvas2D(state,true);
    if(state.gpuThemeRevision!==homeGaugeMechanicalAuthority.themeRevision){
      state.gpuTheme=homeGaugeTheme(state.gauge);
      state.gpuThemeRevision=homeGaugeMechanicalAuthority.themeRevision;
    }
    const result=gpuRenderer.renderFrame({
      phase:state.phase,
      degreesPerSecond:state.currentDegreesPerSecond,
      telemetryLevel:state.telemetryLevel,
      reduced:homeGaugeMechanicalMotionReduced(),
      theme:state.gpuTheme,
      themeRevision:state.gpuThemeRevision,
      timestamp:performance.now()
    });
    if(result?.active) return (Number(result.drawMs) || 0)+chassisDrawMs;
  }
  return homeGaugeRenderTransmissionCanvas2D(state);
}

function homeGaugeRendererInvalidate(){
  homeGaugeMechanicalAuthority.themeRevision+=1;
  homeGaugeMechanicalAuthority.states.forEach(state=>{state.staticRevision=-1;});
}

document.addEventListener('ruca:theme-changed',homeGaugeRendererInvalidate);
function homeGaugeMotionValue(value, minimum=0, maximum=100){
  const number = Number(value);
  if(!Number.isFinite(number) || maximum <= minimum) return null;
  return Math.max(0, Math.min(100, ((number - minimum) / (maximum - minimum)) * 100));
}
function homeGaugeCalibration(gauge){
  const style = getComputedStyle(gauge);
  const start = Number.parseFloat(style.getPropertyValue('--gauge-start'));
  const sweep = Number.parseFloat(style.getPropertyValue('--gauge-sweep-total'));
  return Number.isFinite(start) && Number.isFinite(sweep) && sweep > 0 ? {start,sweep} : null;
}
function homeCssTimeMs(value, fallback){
  const text = String(value || '').trim();
  const number = Number.parseFloat(text);
  if(!Number.isFinite(number)) return fallback;
  return number * (text.endsWith('ms') ? 1 : 1000);
}
function homeGaugeMechanicalBaseMs(gauge){
  return homeCssTimeMs(
    getComputedStyle(gauge).getPropertyValue('--gauge-mechanical-base-speed'),
    2760
  );
}
function homeGaugeReferenceFactor(telemetryLevel){
  const level = Math.max(0, Math.min(100, Number(telemetryLevel) || 0));
  return 4.2 - (.0126 * level);
}
function homeGaugeMechanicalState(key, gauge){
  let state = homeGaugeMechanicalAuthority.states.get(key);
  if(state){
    state.gauge = gauge;
    return state;
  }
  const assembly=window.RUCA_MECHANICAL_RUNTIME.getAssembly(key);
  const drivetrain=window.RUCA_MECHANICAL_RUNTIME.getCompiled(key);
  if(!assembly || !drivetrain) throw new Error(`No shared mechanical assembly registered for ${key}`);
  state = {
    key,
    gauge,
    assembly,
    drivetrain,
    canvas:gauge.querySelector('.instrument-render-surface'),
    live:false,
    downloadLive:false,
    uploadLive:false,
    targetFactor:4.2,
    uploadTargetFactor:4.5,
    currentDegreesPerSecond:0,
    speedVelocity:0,
    uploadDegreesPerSecond:0,
    uploadSpeedVelocity:0,
    phase:0,
    uploadPhase:0,
    bezelEnergyPhase:HOME_GAUGE_BEZEL_PHASE_OFFSETS[key] || 0,
    regulatorAmplitude:0,
    regulatorAmplitudeTarget:0,
    drivetrainInstallation:null,
    telemetryLevel:0,
    gpuTheme:null,
    gpuThemeRevision:-1,
    staticRevision:-1,
    lastDrawMs:0
  };
  homeGaugeMechanicalAuthority.states.set(key, state);
  gauge.dataset.mechanicalAuthority = homeGaugeMechanicalAuthority.owner;
  gauge.dataset.mechanicalRuntime = drivetrain.owner;
  gauge.dataset.mechanicalAssembly = assembly.id;
  gauge.dataset.mechanicalConstructor = assembly.constructor.name;
  return state;
}
function homeGaugeMechanicalKey(gauge){
  return HOME_GAUGE_MECHANICAL_KEYS.find(key=>gauge?.classList.contains(`comp-${key}`)) || '';
}
function homeGaugeMechanicalSetUnavailable(gauge){
  const key = homeGaugeMechanicalKey(gauge);
  if(!key) return;
  const state = homeGaugeMechanicalState(key, gauge);
  state.live = false;
  state.downloadLive = false;
  state.uploadLive = false;
}
function homeGaugeMechanicalSetMetric(key, gauge, telemetryLevel, _gaugeAngle){
  const state = homeGaugeMechanicalState(key, gauge);
  state.live = true;
  state.targetFactor = homeGaugeReferenceFactor(telemetryLevel);
  state.telemetryLevel = telemetryLevel;
  const balanceProfile=state.assembly.metadata.balanceProfile;
  state.regulatorAmplitudeTarget=balanceProfile.base+(balanceProfile.gain*telemetryLevel);
}
function homeGaugeMechanicalSetNetwork(gauge, downloadLevel, uploadLevel){
  const state = homeGaugeMechanicalState('network', gauge);
  state.downloadLive = Number.isFinite(downloadLevel);
  state.uploadLive = Number.isFinite(uploadLevel);
  state.live = state.downloadLive || state.uploadLive;
  if(state.downloadLive) state.targetFactor = homeGaugeReferenceFactor(downloadLevel);
  if(state.uploadLive){
    const uploadTrain=HOME_GAUGE_RENDER_MANIFESTS.network.trains.find(train=>train.channel==='upload');
    state.uploadTargetFactor=homeGaugeReferenceFactor(uploadLevel)*Number(uploadTrain?.cadenceFactor || 1);
  }
  const activity = Math.max(
    state.downloadLive ? downloadLevel : 0,
    state.uploadLive ? uploadLevel : 0
  );
  state.telemetryLevel = activity;
  const balanceProfile=state.assembly.metadata.balanceProfile;
  state.regulatorAmplitudeTarget=balanceProfile.base+(balanceProfile.gain*activity);
}
function homeGaugeMechanicalMotionReduced(){
  return document.body.classList.contains('motion-low') || homeGaugeReducedMotionQuery?.matches === true;
}
function homeGaugeMechanicalShouldRun(){
  return document.visibilityState === 'visible'
    && (document.body.dataset.world || 'home') === 'home';
}
function homeGaugeMechanicalFrame(timestamp){
  if(!homeGaugeMechanicalShouldRun()){
    homeGaugeMechanicalAuthority.frameRequest = 0;
    homeGaugeMechanicalAuthority.lastTimestamp = null;
    return;
  }
  const previousTimestamp = homeGaugeMechanicalAuthority.lastTimestamp;
  homeGaugeMechanicalAuthority.lastTimestamp = timestamp;
  const elapsed = previousTimestamp === null
    ? 0
    : Math.max(0, Math.min(32, timestamp - previousTimestamp));
  const reduced=homeGaugeMechanicalMotionReduced();
  let frameDrawMs=0;
  if(!reduced && elapsed > 0){
    const board = $('#homeChronograph');
    const boardStyle = getComputedStyle(board);
    const baseMs = homeGaugeMechanicalBaseMs(board);
    const dampingRatio = Math.max(.72,Number.parseFloat(boardStyle.getPropertyValue('--gauge-mechanical-damping-ratio')) || .96);
    const naturalFrequency = Math.max(4,Number.parseFloat(boardStyle.getPropertyValue('--gauge-mechanical-natural-frequency')) || 9);
    const deltaSeconds=elapsed/1000;
    homeGaugeMechanicalAuthority.states.forEach(state=>{
      const gauge = state.gauge;
      if(!gauge?.isConnected) return;
      const primaryChannel=state.assembly.inputs[0]?.channel || 'primary';
      const primaryLive=primaryChannel==='download' ? state.downloadLive : state.live;
      const uploadDeclared=state.assembly.inputs.some(input=>input.channel==='upload');
      const targetDegreesPerSecond = primaryLive
        ? 360000 / (baseMs * state.targetFactor)
        : 0;
      const uploadTargetDegreesPerSecond = uploadDeclared && state.uploadLive
        ? 360000 / (baseMs * state.uploadTargetFactor)
        : 0;
      const acceleration=(naturalFrequency**2)*(targetDegreesPerSecond-state.currentDegreesPerSecond)
        -(2*dampingRatio*naturalFrequency*state.speedVelocity);
      const uploadAcceleration=(naturalFrequency**2)*(uploadTargetDegreesPerSecond-state.uploadDegreesPerSecond)
        -(2*dampingRatio*naturalFrequency*state.uploadSpeedVelocity);
      state.speedVelocity+=acceleration*deltaSeconds;
      state.uploadSpeedVelocity+=uploadAcceleration*deltaSeconds;
      state.currentDegreesPerSecond+=state.speedVelocity*deltaSeconds;
      state.uploadDegreesPerSecond+=state.uploadSpeedVelocity*deltaSeconds;
      state.phase=(state.phase+state.currentDegreesPerSecond*deltaSeconds)%360000;
      state.uploadPhase=(state.uploadPhase+state.uploadDegreesPerSecond*deltaSeconds)%360000;
      const bezelVelocity=8+(Math.max(0,Math.min(100,state.telemetryLevel))*0.08);
      state.bezelEnergyPhase=(state.bezelEnergyPhase+(bezelVelocity*deltaSeconds))%360;
      gauge.style.setProperty('--bezel-energy-phase',`${state.bezelEnergyPhase.toFixed(2)}deg`);
      gauge.style.setProperty('--bezel-energy-strength',(.56+(Math.max(0,Math.min(100,state.telemetryLevel))*.0014)).toFixed(3));
      const response=1-Math.exp(-naturalFrequency*deltaSeconds);
      state.regulatorAmplitude+=(state.regulatorAmplitudeTarget-state.regulatorAmplitude)*response;

      frameDrawMs+=homeGaugeRenderTransmission(state);
    });
  }else{
    homeGaugeMechanicalAuthority.states.forEach(state=>{
      state.gauge?.style.setProperty('--bezel-energy-phase',`${state.bezelEnergyPhase.toFixed(2)}deg`);
      state.gauge?.style.setProperty('--bezel-energy-strength',(.56+(Math.max(0,Math.min(100,state.telemetryLevel))*.0014)).toFixed(3));
      frameDrawMs+=homeGaugeRenderTransmission(state);
    });
  }
  const board=$('#homeChronograph');
  const heart=$('#homeChronograph .system-heart');
  const masterPhaseState=homeGaugeMechanicalAuthority.states.get('cpu');
  if(heart?.dataset.instrumentAvailability==='live' && masterPhaseState){
    heart.style.setProperty('--bezel-energy-phase',`${masterPhaseState.bezelEnergyPhase.toFixed(2)}deg`);
  }
  if(heart){
    const engagementKey=heart.dataset.heartEngagement;
    const activeConduit=engagementKey ? $(`#homeChronograph .${engagementKey}-line`) : null;
    const startedAt=Date.parse(activeConduit?.dataset.circulationStartedAt || '');
    const transferWindowMs=activeConduit
      ? homeCssTimeMs(getComputedStyle(activeConduit).getPropertyValue('--conduit-event-cycle'),3600)
      : 3600;
    const transferElapsed=Number.isFinite(startedAt)
      ? Math.max(0,Date.now()-startedAt)
      : transferWindowMs;
    if(activeConduit && transferElapsed < transferWindowMs){
      const progress=Math.max(0,Math.min(1,transferElapsed/transferWindowMs));
      const receiving=activeConduit.dataset.telemetryPulseDirection==='receive';
      // Travel reaches its endpoint independently of the emissive response tail.
      const travelProgress=receiving ? Math.min(1,progress/.8) : progress;
      const response=receiving
        ? (progress < .8 ? progress / .8 : (1-progress) / .2)
        : 1-progress;
      heart.style.setProperty('--heart-transfer-progress',travelProgress.toFixed(3));
      heart.style.setProperty('--heart-interface-response',response.toFixed(3));
    }else{
      heart.style.setProperty('--heart-transfer-progress','1');
      heart.style.setProperty('--heart-interface-response','0');
      if(activeConduit && transferElapsed >= transferWindowMs){
        delete heart.dataset.heartEngagement;
      }
    }
  }
  homeGaugeMechanicalAuthority.frameCount+=1;
  homeGaugeMechanicalAuthority.totalDrawMs+=frameDrawMs;
  homeGaugeMechanicalAuthority.maxDrawMs=Math.max(homeGaugeMechanicalAuthority.maxDrawMs,frameDrawMs);
  if(homeGaugeMechanicalAuthority.frameCount%60===0){
    const board=$('#homeChronograph');
    if(board){
      board.dataset.mechanicalAverageDrawMs=(homeGaugeMechanicalAuthority.totalDrawMs/homeGaugeMechanicalAuthority.frameCount).toFixed(3);
      board.dataset.mechanicalMaxDrawMs=homeGaugeMechanicalAuthority.maxDrawMs.toFixed(3);
      board.dataset.mechanicalFrameCount=String(homeGaugeMechanicalAuthority.frameCount);
    }
  }
  homeGaugeMechanicalAuthority.frameRequest = window.requestAnimationFrame(homeGaugeMechanicalFrame);
}
function homeGaugeMechanicalAuthorityStop(){
  if(homeGaugeMechanicalAuthority.frameRequest){
    window.cancelAnimationFrame(homeGaugeMechanicalAuthority.frameRequest);
  }
  homeGaugeMechanicalAuthority.frameRequest = 0;
  homeGaugeMechanicalAuthority.lastTimestamp = null;
  const board=$('#homeChronograph');
  if(board) board.dataset.mechanicalLifecycle='suspended';
}
function homeGaugeMechanicalAuthorityStart(){
  if(!homeGaugeMechanicalShouldRun()){
    homeGaugeMechanicalAuthorityStop();
    return;
  }
  if(homeGaugeMechanicalAuthority.frameRequest) return;
  HOME_GAUGE_MECHANICAL_KEYS.forEach(key=>{
    const gauge = $(`#homeChronograph .comp-${key}`);
    if(gauge){
      const state=homeGaugeMechanicalState(key,gauge);
      homeGaugePrepareRenderer(state);
      homeGaugeRenderTransmission(state);
    }
  });
  document.documentElement.dataset.homeGaugeMotionOwner=homeGaugeMechanicalAuthority.owner;
  const board=$('#homeChronograph');
  if(board){
    board.dataset.mechanicalRenderer=HOME_GAUGE_RENDER_MANIFESTS.renderer;
    board.dataset.mechanicalRuntime=window.RUCA_MECHANICAL_RUNTIME.owner;
    board.dataset.mechanicalRuntimeVersion=window.RUCA_MECHANICAL_RUNTIME.version;
    board.dataset.mechanicalValidation=window.RUCA_MECHANICAL_RUNTIME.validation.valid ? 'passed' : 'failed';
    board.dataset.mechanicalSurfaceCount=String(HOME_GAUGE_MECHANICAL_KEYS.length);
    board.dataset.mechanicalDamping='critical';
    board.dataset.mechanicalGpuPilot='PASS60_BABYLON_CPU_CHAMBER';
    board.dataset.mechanicalLifecycle='active';
  }
  homeGaugeMechanicalAuthority.lastTimestamp = null;
  const telemetry=window.RUCA_TELEMETRY_OWNER?.snapshot?.();
  if(telemetry){
    semanticPulseTelemetry({telemetry});
    homeGaugeMotionFromTelemetry({telemetry},{circulate:false});
  }
  homeGaugeMechanicalAuthority.frameRequest = window.requestAnimationFrame(homeGaugeMechanicalFrame);
}
function homeGaugeMechanicalUpdate(key, gauge, telemetryLevel, gaugeAngle){
  gauge.dataset.mechanicalMetric = key;
  gauge.dataset.mechanicalRole=window.RUCA_MECHANICAL_RUNTIME.getAssembly(key).role;
  homeGaugeMechanicalSetMetric(key, gauge, telemetryLevel, gaugeAngle);
  const mechanismVisibility = .76 + (telemetryLevel * .0011);
  gauge.style.setProperty('--mechanical-visibility', mechanismVisibility.toFixed(3));
  gauge.style.setProperty('--mechanical-glass-reveal', (.08 + (telemetryLevel * .0012)).toFixed(3));
}
function homeNetworkMechanicalUpdate(gauge, downloadLevel, uploadLevel){
  if(!gauge) return;
  const calibration = homeGaugeCalibration(gauge);
  const downloadLive = downloadLevel !== null;
  const uploadLive = uploadLevel !== null;
  const activeLevels = [downloadLevel,uploadLevel].filter(Number.isFinite);
  const activity = activeLevels.length ? Math.max(...activeLevels) : 0;

  gauge.dataset.mechanicalMetric = 'network-dual-channel';
  gauge.dataset.mechanicalRole = window.RUCA_MECHANICAL_RUNTIME.getAssembly('network').role;
  gauge.dataset.mechanicalDownload = downloadLive ? 'live' : 'unavailable';
  gauge.dataset.mechanicalUpload = uploadLive ? 'live' : 'unavailable';
  gauge.dataset.gaugeAvailability = downloadLive || uploadLive ? 'live' : 'unavailable';
  if(downloadLive){
    if(calibration){
      gauge.style.setProperty('--network-download-deg', `${((downloadLevel / 100) * calibration.sweep).toFixed(2)}deg`);
    }
  }
  if(uploadLive){
    if(calibration){
      gauge.style.setProperty('--network-upload-deg', `${((uploadLevel / 100) * calibration.sweep).toFixed(2)}deg`);
    }
  }
  homeGaugeMechanicalSetNetwork(gauge, downloadLevel, uploadLevel);
  gauge.style.setProperty('--mechanical-visibility', (.76 + (activity * .0011)).toFixed(3));
  gauge.style.setProperty('--mechanical-glass-reveal', (.08 + (activity * .0012)).toFixed(3));
}
function homeGaugeOperatingZone(key, rawValue, normalized){
  const raw = Number(rawValue);
  if(!Number.isFinite(raw)) return 'unknown';
  if(key === 'thermal') return raw >= 90 ? 'critical' : raw >= 75 ? 'warning' : 'normal';
  if(key === 'storage') return normalized <= 10 ? 'critical' : normalized <= 20 ? 'warning' : 'normal';
  if(['cpu','gpu','ram'].includes(key)) return raw >= 92 ? 'critical' : raw >= 82 ? 'warning' : 'normal';
  return 'normal';
}
function homeGaugeMotionUpdate(key, rawValue, minimum, maximum, options={}){
  const gauge = $(`#homeChronograph .comp-${key}`);
  if(!gauge) return;
  const next = homeGaugeMotionValue(rawValue, minimum, maximum);
  if(next === null){
    gauge.dataset.gaugeAvailability = 'unavailable';
    homeGaugeMechanicalSetUnavailable(gauge);
    return;
  }
  gauge.dataset.gaugeAvailability = 'live';
  const calibration = homeGaugeCalibration(gauge);
  if(!calibration){
    gauge.dataset.gaugeAvailability = 'unavailable';
    homeGaugeMechanicalSetUnavailable(gauge);
    return;
  }
  const activeSweep = (next / 100) * calibration.sweep;
  const gaugeAngle = calibration.start + activeSweep;
  gauge.style.setProperty('--gauge-progress', next.toFixed(2));
  gauge.style.setProperty('--gauge-sweep-deg', `${activeSweep.toFixed(2)}deg`);
  gauge.style.setProperty('--gauge-angle', `${gaugeAngle.toFixed(2)}deg`);
  gauge.dataset.gaugeZone = homeGaugeOperatingZone(key, rawValue, next);
  if(key === 'network'){
    gauge.style.setProperty('--network-download-deg', `${activeSweep.toFixed(2)}deg`);
  }
  if(options.scale) gauge.dataset.gaugeScale = options.scale;
  if(options.mechanics !== false) homeGaugeMechanicalUpdate(key, gauge, next, gaugeAngle);
  homeGaugeMotionState.set(key, next);
  return next;
}
function homeHeartKineticFromTelemetry(telemetry){
  const heart=$('#homeChronograph .system-heart');
  if(!heart) return;
  const score=Number(telemetry?.heart);
  const live=(telemetry?.status==='LIVE' || telemetry?.status==='PARTIAL') && Number.isFinite(score);
  heart.dataset.instrumentAvailability=live ? 'live' : 'unavailable';
  heart.dataset.kineticAuthority='HOME_TELEMETRY_HEART_KINETICS';
  if(!live) return;
  const level=homeGaugeClamp(score/100);
  heart.style.setProperty('--heart-kinetic-level',level.toFixed(3));
  heart.style.setProperty('--heart-ring-outer-cycle',`${(22-(level*3)).toFixed(2)}s`);
  heart.style.setProperty('--heart-ring-inner-cycle',`${(31-(level*4)).toFixed(2)}s`);
  heart.style.setProperty('--heart-transmission-cycle',`${(43-(level*5)).toFixed(2)}s`);
  heart.style.setProperty('--heart-regulator-cycle',`${(82-(level*8)).toFixed(2)}s`);
  heart.style.setProperty('--heart-aperture-cycle',`${(2.65-(level*.45)).toFixed(2)}s`);
  heart.style.setProperty('--heart-energy-strength',(.56+(level*.10)).toFixed(3));
  heart.style.setProperty('--heart-core-strength',(.86+(level*.14)).toFixed(3));
  heart.style.setProperty('--heart-core-halo',(.48+(level*.16)).toFixed(3));
  heart.style.setProperty('--heart-aperture-depth',(.978+(level*.008)).toFixed(3));
  heart.dataset.kineticTelemetryScore=score.toFixed(2);
}
const HOME_HEART_INTERFACE_ANGLES=Object.freeze({
  storage:-37.5,
  network:0,
  thermal:37.5,
  ram:142.5,
  gpu:180,
  cpu:217.5
});
function homeConduitCirculationAdvance(){
  const heart=$('#homeChronograph .system-heart');
  const currentEngagement=heart?.dataset.heartEngagement;
  const currentConduit=currentEngagement ? $(`#homeChronograph .${currentEngagement}-line`) : null;
  if(currentConduit){
    const currentStartedAt=Date.parse(currentConduit.dataset.circulationStartedAt || '');
    const currentCycleMs=homeCssTimeMs(getComputedStyle(currentConduit).getPropertyValue('--conduit-event-cycle'),3600);
    if(Number.isFinite(currentStartedAt) && Date.now()-currentStartedAt < currentCycleMs) return;
  }
  const index=homeConduitCirculationState.index;
  const key=HOME_CONDUIT_CIRCULATION_ORDER[index];
  const direction=index % 2 === 0 ? 'send' : 'receive';
  const conduit=$(`#homeChronograph .${key}-line`);
  if(!conduit) return;
  homeConduitCirculationState.sequence += 1;
  const startedAt=new Date().toISOString();
  HOME_CONDUIT_CIRCULATION_ORDER.forEach((laneKey,laneIndex)=>{
    const lane=$(`#homeChronograph .${laneKey}-line`);
    if(!lane) return;
    lane.dataset.telemetryPulseDirection=laneIndex % 2 === 0 ? 'send' : 'receive';
    lane.dataset.circulationIndex=String(laneIndex);
    lane.dataset.circulationSequence=String(homeConduitCirculationState.sequence);
    lane.dataset.circulationStartedAt=startedAt;
    lane.classList.add('conduit-signal');
  });
  homeConduitCirculationState.index=(index+1)%HOME_CONDUIT_CIRCULATION_ORDER.length;
  if(heart){
    heart.dataset.heartEngagement=key;
    heart.style.setProperty('--heart-interface-angle',`${HOME_HEART_INTERFACE_ANGLES[key]}deg`);
    heart.style.setProperty('--heart-transfer-progress','0');
    heart.style.setProperty('--heart-interface-response',direction==='send' ? '1' : '0');
  }
  const board=$('#homeChronograph');
  if(board){
    board.dataset.conduitCirculationOwner='HOME_TELEMETRY_CIRCULATION';
    board.dataset.conduitCirculationIndex=String(index);
    board.dataset.conduitCirculationKey=key;
    board.dataset.conduitCirculationDirection=direction;
    board.dataset.conduitCirculationSequence=String(homeConduitCirculationState.sequence);
  }
}
function homeGaugeMotionFromTelemetry(detail={}, {circulate=true}={}){
  if((document.body.dataset.world || 'home') !== 'home') return;
  const telemetry = detail.telemetry || detail.normalized || detail;
  const fields = telemetry?.fields || {};
  const current = telemetry?.status === 'LIVE' || telemetry?.status === 'PARTIAL';
  homeHeartKineticFromTelemetry(telemetry);
  if(!current){
    document.querySelectorAll('#homeChronograph .bridge-line.conduit-signal').forEach(conduit=>conduit.classList.remove('conduit-signal'));
    const heart=$('#homeChronograph .system-heart');
    if(heart){
      delete heart.dataset.heartEngagement;
      heart.style.setProperty('--heart-transfer-progress','1');
      heart.style.setProperty('--heart-interface-response','0');
    }
    document.querySelectorAll('#homeChronograph .complication').forEach(gauge=>{
      gauge.dataset.gaugeAvailability = 'unavailable';
      homeGaugeMechanicalSetUnavailable(gauge);
      if(gauge.classList.contains('comp-network')){
        gauge.dataset.mechanicalDownload = 'unavailable';
        gauge.dataset.mechanicalUpload = 'unavailable';
      }
    });
    return;
  }
  homeGaugeMotionUpdate('cpu', fields.cpuLoad, 0, 100, {threshold:.45});
  homeGaugeMotionUpdate('gpu', fields.gpuLoad, 0, 100, {threshold:.45});
  homeGaugeMotionUpdate('ram', fields.ramLoad, 0, 100, {threshold:.45});
  /* Thermal uses a real Celsius operating range solely to position its needle;
     the displayed temperature and the diagnostic score remain untouched. */
  const thermal = fields.cpuTemp ?? fields.gpuTemp;
  homeGaugeMotionUpdate('thermal', thermal, 20, 100, {scale:'celsius', threshold:.35});
  /* Storage and network retain their own units.  These are reserve / traffic arcs,
     not percentages displayed to the user. */
  const storageReserve = Number.isFinite(Number(fields.storageUsed)) ? 100 - Number(fields.storageUsed) : null;
  homeGaugeMotionUpdate('storage', storageReserve, 0, 100, {scale:'reserve', threshold:.45});
  const download = homeGaugeMotionUpdate('network', fields.networkDown, 0, 1000, {
    scale:'traffic',
    threshold:1.5,
    mechanics:false
  });
  const network = $(`#homeChronograph .comp-network`);
  const upload = homeGaugeMotionValue(fields.networkUp, 0, 100);
  homeNetworkMechanicalUpdate(network, Number.isFinite(download) ? download : null, upload);
  if(circulate) homeConduitCirculationAdvance();
}
window.addEventListener('ruca:telemetry-updated', event=>homeGaugeMotionFromTelemetry(event.detail || {}));
homeGaugeInstallConduitComponents();
document.addEventListener('ruca:theme-changed',homeGaugeInstallConduitComponents);
homeGaugeMechanicalAuthorityStart();
document.addEventListener('visibilitychange',()=>{
  if(homeGaugeMechanicalShouldRun()) homeGaugeMechanicalAuthorityStart();
  else homeGaugeMechanicalAuthorityStop();
});
window.RUCA_PHYSICAL_MATERIAL_LIBRARY=RUCA_MATERIAL_LIBRARY;
window.RUCA_MECHANICAL_COMPONENT_LIBRARY=RUCA_MECHANICAL_COMPONENT_LIBRARY;
window.RUCA_HOME_MECHANICAL_RENDERER=Object.freeze({
  owner:homeGaugeMechanicalAuthority.owner,
  runtimeOwner:window.RUCA_MECHANICAL_RUNTIME.owner,
  renderer:HOME_GAUGE_RENDER_MANIFESTS.renderer,
  version:'C001.0.0',
  pressureAngle:HOME_GAUGE_RENDER_MANIFESTS.pressureAngle,
  getState(){
    const frames=Math.max(1,homeGaugeMechanicalAuthority.frameCount);
    return {
      owner:homeGaugeMechanicalAuthority.owner,
      runtimeOwner:window.RUCA_MECHANICAL_RUNTIME.owner,
      renderer:HOME_GAUGE_RENDER_MANIFESTS.renderer,
      version:'C001.0.0',
      objectModelVersion:window.RUCA_MECHANICAL_MODEL.version,
      validation:window.RUCA_MECHANICAL_RUNTIME.validation,
      opticalPilot:'PASS60_BABYLON_CPU_CHAMBER',
      opticalPilotVersion:'60.0.0',
      opticalPilotState:window.RUCA_BABYLON_CPU_RENDERER?.getState?.() || null,
      surfaces:document.querySelectorAll('#homeChronograph .instrument-render-surface').length,
      frameOwners:homeGaugeMechanicalAuthority.frameRequest ? 1 : 0,
      frameCount:homeGaugeMechanicalAuthority.frameCount,
      averageDrawMs:homeGaugeMechanicalAuthority.totalDrawMs/frames,
      maxDrawMs:homeGaugeMechanicalAuthority.maxDrawMs,
      pressureAngle:HOME_GAUGE_RENDER_MANIFESTS.pressureAngle,
      trains:HOME_GAUGE_MECHANICAL_KEYS.map(key=>({
        key,
        assemblyId:window.RUCA_MECHANICAL_RUNTIME.getAssembly(key).id,
        assemblyConstructor:window.RUCA_MECHANICAL_RUNTIME.getAssembly(key).constructor.name,
        inheritanceChain:window.RUCA_MECHANICAL_RUNTIME.registry
          .inheritanceChain(window.RUCA_MECHANICAL_RUNTIME.getAssembly(key).id),
        runtimeOwner:window.RUCA_MECHANICAL_RUNTIME.getCompiled(key).owner,
        channels:HOME_GAUGE_RENDER_MANIFESTS[key].trains.map(train=>train.channel),
        components:HOME_GAUGE_RENDER_MANIFESTS[key].trains.map(train=>[...train.components]),
        teeth:HOME_GAUGE_RENDER_MANIFESTS[key].trains.map(train=>train.components.map(
          componentId=>homeGaugeResolveMechanicalComponent(componentId).geometry.teeth
        )),
        live:homeGaugeMechanicalAuthority.states.get(key)?.live===true
      }))
    };
  }
});
window.addEventListener('ruca:semantic-pulse-request', event=>{
  const detail = event.detail || {};
  semanticPulseEmit(String(detail.type || ''), detail);
});

function continuityTimestamp(){
  return new Date().toISOString();
}

function continuitySnapshot(){
  return {
    owner:continuityState.owner,
    version:continuityState.version,
    profile:{...continuityState.profile},
    navigation:{
      world:continuityState.navigation.world,
      history:[...continuityState.navigation.history],
      transition:continuityState.navigation.transition ? {...continuityState.navigation.transition} : null
    },
    overlays:continuityState.overlays.map(entry=>({
      id:entry.id,
      priority:entry.priority,
      originWorld:entry.originWorld,
      openedAt:entry.openedAt
    })),
    launch:{
      status:continuityState.launch.status,
      origin:continuityState.launch.origin ? {...continuityState.launch.origin} : null,
      result:continuityState.launch.result ? {...continuityState.launch.result} : null,
      updatedAt:continuityState.launch.updatedAt
    },
    recovery:{...continuityState.recovery}
  };
}

function continuitySyncDomState(){
  document.body.dataset.rucaContinuityProfile = continuityState.profile.id;
  document.body.dataset.rucaContinuityWorld = continuityState.navigation.world;
  document.body.dataset.rucaContinuityOverlayStack = continuityState.overlays.map(entry=>entry.id).join(',');
  document.body.dataset.rucaContinuityLaunchStatus = String(continuityState.launch.status || 'IDLE').toLowerCase();
  if(continuityState.launch.origin){
    document.body.dataset.rucaContinuityLaunchOriginWorld = continuityState.launch.origin.world || '';
    document.body.dataset.rucaContinuityLaunchCommand = continuityState.launch.origin.commandId || '';
  }else{
    delete document.body.dataset.rucaContinuityLaunchOriginWorld;
    delete document.body.dataset.rucaContinuityLaunchCommand;
  }
}

function continuityPersist(){
  try{
    localStorage.setItem(RUCA_CONTINUITY_STATE_KEY, JSON.stringify({
      version:continuityState.version,
      profileId:continuityState.profile.id,
      launch:continuitySnapshot().launch
    }));
  }catch(error){
    // Continuity remains active in memory when browser storage is unavailable.
  }
}

function continuityRestorePersistedLaunch(){
  try{
    const saved = JSON.parse(localStorage.getItem(RUCA_CONTINUITY_STATE_KEY) || 'null');
    if(!saved || saved.version !== RUCA_CONTINUITY_VERSION || !saved.launch) return;
    continuityState.launch = {
      status:String(saved.launch.status || 'IDLE'),
      origin:saved.launch.origin && typeof saved.launch.origin === 'object' ? {...saved.launch.origin} : null,
      result:saved.launch.result && typeof saved.launch.result === 'object' ? {...saved.launch.result} : null,
      updatedAt:saved.launch.updatedAt || null
    };
  }catch(error){
    // Invalid previous state is ignored rather than promoted into live continuity.
  }
}

function continuityEmit(type, detail={}){
  const snapshot = continuitySnapshot();
  document.dispatchEvent(new CustomEvent('ruca:continuity-change', {detail:{type, ...detail, state:snapshot}}));
  return snapshot;
}

function continuitySelectorFor(target){
  if(!(target instanceof HTMLElement)) return '';
  if(target.id) return `#${String(target.id).replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1')}`;
  const attributes = ['data-app-id','data-command-id','data-page','data-core-route','data-lane','data-command-filter','data-component','data-sensor','data-ruca-action'];
  for(const name of attributes){
    const value = target.getAttribute(name);
    if(value) return `[${name}="${String(value).replace(/\\/g,'\\\\').replace(/"/g,'\\"')}"]`;
  }
  return '';
}

function continuityWorldExists(world){
  return pages.some(page=>page.id === `page-${world}`);
}

function continuityShellHistoryUrl(){
  const url = new URL(window.location.href);
  if(continuityState.profile.lounge) url.searchParams.set('profile', continuityState.profile.id);
  return `${url.pathname}${url.search}${url.hash}`;
}

function continuityShellHistoryState(world='home', kind=RUCA_SHELL_HISTORY_WORLD, focusSelector=''){
  const safeWorld = continuityWorldExists(world) ? world : 'home';
  continuityShellHistorySequence += 1;
  return {
    rucaShell:true,
    owner:RUCA_SHELL_HISTORY_OWNER,
    version:RUCA_SHELL_HISTORY_VERSION,
    kind,
    world:safeWorld,
    profileId:continuityState.profile.id,
    focusSelector:String(focusSelector || ''),
    entryId:`${Date.now().toString(36)}-${continuityShellHistorySequence.toString(36)}`,
    updatedAt:continuityTimestamp()
  };
}

function continuityShellHistoryStateValid(state){
  return Boolean(
    state &&
    state.rucaShell === true &&
    state.owner === RUCA_SHELL_HISTORY_OWNER &&
    state.version === RUCA_SHELL_HISTORY_VERSION &&
    (state.kind === RUCA_SHELL_HISTORY_WORLD || state.kind === RUCA_SHELL_HISTORY_GUARD) &&
    continuityWorldExists(state.world) &&
    String(state.profileId || 'default') === continuityState.profile.id
  );
}

function continuitySyncShellHistoryDom(state=window.history.state){
  if(!continuityShellHistoryStateValid(state)){
    document.body.dataset.rucaShellHistoryState = 'repairing';
    delete document.body.dataset.rucaShellHistoryKind;
    delete document.body.dataset.rucaShellHistoryWorld;
    return;
  }
  document.body.dataset.rucaShellHistoryOwner = RUCA_SHELL_HISTORY_OWNER;
  document.body.dataset.rucaShellHistoryVersion = RUCA_SHELL_HISTORY_VERSION;
  document.body.dataset.rucaShellHistoryState = 'owned';
  document.body.dataset.rucaShellHistoryKind = state.kind.toLowerCase();
  document.body.dataset.rucaShellHistoryWorld = state.world;
}

function continuityWriteShellHistory(mode, state){
  try{
    if(mode === 'push') window.history.pushState(state, '', continuityShellHistoryUrl());
    else window.history.replaceState(state, '', continuityShellHistoryUrl());
    continuitySyncShellHistoryDom(state);
    return true;
  }catch(error){
    document.body.dataset.rucaShellHistoryState = 'unavailable';
    return false;
  }
}

function continuitySavedFocusSelector(world=document.body.dataset.world || 'home'){
  const saved = continuityFocusByWorld.get(world);
  if(saved?.selector) return saved.selector;
  const active = document.activeElement;
  if(!(active instanceof HTMLElement)) return '';
  const page = active.closest('.page');
  return page?.id === `page-${world}` ? continuitySelectorFor(active) : '';
}

function continuitySyncCurrentShellFocus(world, selector){
  const current = window.history.state;
  if(!continuityShellHistoryStateValid(current) || current.kind !== RUCA_SHELL_HISTORY_WORLD || current.world !== world) return false;
  const nextSelector = String(selector || '');
  if(current.focusSelector === nextSelector) return true;
  return continuityWriteShellHistory('replace', {...current, focusSelector:nextSelector, updatedAt:continuityTimestamp()});
}

function continuityCaptureCurrentShellFocus(world=document.body.dataset.world || 'home'){
  const selector = continuitySavedFocusSelector(world);
  return continuitySyncCurrentShellFocus(world, selector);
}

function continuityCommitShellHistory(world, options={}){
  const mode = options.shellHistoryMode || (options.replace ? 'replace' : 'push');
  if(mode === 'none') return true;
  const focusSelector = String(options.shellFocusSelector || continuitySavedFocusSelector(world) || '');
  const next = continuityShellHistoryState(world, RUCA_SHELL_HISTORY_WORLD, focusSelector);
  const current = window.history.state;
  const duplicate = continuityShellHistoryStateValid(current) && current.kind === RUCA_SHELL_HISTORY_WORLD && current.world === world;
  return continuityWriteShellHistory(mode === 'replace' || duplicate ? 'replace' : 'push', next);
}

function continuityWorldAnchor(world=document.body.dataset.world || 'home'){
  const page = document.querySelector(`#page-${world}.active`);
  const selector = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';
  const pageTarget = page ? [...page.querySelectorAll(selector)].find(continuityCanRestoreTarget) : null;
  if(pageTarget) return pageTarget;
  const coreTarget = coreBeacons.find(beacon=>beacon.dataset.coreRoute === world && continuityCanRestoreTarget(beacon));
  if(coreTarget) return coreTarget;
  return navButtons.find(button=>button.dataset.page === world && continuityCanRestoreTarget(button)) || null;
}

function continuityFocusSelectorTarget(world, selector){
  if(!selector) return false;
  let target = null;
  try{ target = document.querySelector(selector); }catch(error){ target = null; }
  if(!continuityCanRestoreTarget(target)) return false;
  const page = target.closest('.page');
  if(page && page.id !== `page-${world}`) return false;
  try{ target.focus({preventScroll:true}); }catch(error){ target.focus?.(); }
  return document.activeElement === target;
}

function continuityRepairShellHome(reason='history-repair'){
  const guard = continuityShellHistoryState('home', RUCA_SHELL_HISTORY_GUARD, '');
  continuityWriteShellHistory('replace', guard);
  continuityWriteShellHistory('push', continuityShellHistoryState('home', RUCA_SHELL_HISTORY_WORLD, ''));
  routeThroughCore('home', {
    replace:true,
    instant:true,
    source:reason,
    shellHistoryMode:'none',
    shellFocusSelector:''
  });
  continuityRequestFocus('home', reason, '');
}

function continuityHandleShellPopstate(event){
  clearCoreTransition('browser-popstate');
  const state = event.state;
  if(!continuityShellHistoryStateValid(state) || state.kind === RUCA_SHELL_HISTORY_GUARD){
    continuityRepairShellHome(state?.kind === RUCA_SHELL_HISTORY_GUARD ? 'browser-history-guard' : 'browser-history-malformed');
    return;
  }
  continuitySyncShellHistoryDom(state);
  routeThroughCore(state.world, {
    replace:true,
    instant:true,
    source:'browser-popstate',
    shellHistoryMode:'none',
    shellFocusSelector:state.focusSelector || ''
  });
}

function continuityInitializeShellHistory(){
  const current = location.hash ? null : window.history.state;
  if(continuityShellHistoryStateValid(current) && current.kind === RUCA_SHELL_HISTORY_WORLD){
    continuitySyncShellHistoryDom(current);
    window.setTimeout(()=>{
      routeThroughCore(current.world, {
        replace:true,
        instant:true,
        source:'browser-refresh',
        shellHistoryMode:'none',
        shellFocusSelector:current.focusSelector || ''
      });
    }, 0);
    return;
  }
  continuityRepairShellHome('browser-history-bootstrap');
}

function continuityRememberFocus(target=document.activeElement, world=document.body.dataset.world || 'home'){
  if(!(target instanceof HTMLElement) || !target.isConnected) return false;
  if(target.closest('#detailDrawer,#rucaCommandSearch,#rucaRecoveryOverlay')) return false;
  const page = target.closest('.page');
  if(!page || page.id !== `page-${world}`) return false;
  const selector = continuitySelectorFor(target);
  continuityFocusByWorld.set(world, {target, selector});
  continuitySyncCurrentShellFocus(world, selector);
  return true;
}

function continuityRestoreFocus(world=document.body.dataset.world || 'home'){
  const saved = continuityFocusByWorld.get(world);
  let target = saved?.target;
  if((!target || !target.isConnected) && saved?.selector){
    try{ target = document.querySelector(saved.selector); }catch(error){ target = null; }
  }
  if(!(target instanceof HTMLElement) || target.hasAttribute('disabled') || target.closest('[aria-hidden="true"],[inert]')) return false;
  const page = target.closest('.page');
  if(page && !page.classList.contains('active')) return false;
  try{ target.focus({preventScroll:true}); }catch(error){ target.focus?.(); }
  return document.activeElement === target;
}

function continuityRequestFocus(world=document.body.dataset.world || 'home', reason='navigation', preferredSelector=''){
  window.requestAnimationFrame(()=>{
    if(continuityState.overlays.length){
      document.dispatchEvent(new CustomEvent('ruca:continuity-focus-request', {detail:{world, reason, restored:true, blockedByOverlay:true}}));
      return;
    }
    let restored = continuityFocusSelectorTarget(world, preferredSelector) || continuityRestoreFocus(world);
    if(!restored){
      const anchor = continuityWorldAnchor(world);
      if(anchor){
        try{ anchor.focus({preventScroll:true}); }catch(error){ anchor.focus?.(); }
        restored = document.activeElement === anchor;
      }
    }
    document.dispatchEvent(new CustomEvent('ruca:continuity-focus-request', {detail:{world, reason, restored}}));
  });
}

function continuityRegisterOverlay(definition={}){
  const id = String(definition.id || '').trim();
  if(!id || typeof definition.close !== 'function') return false;
  continuityOverlayRegistry.set(id, {
    id,
    priority:Number(definition.priority || 0),
    close:definition.close,
    isOpen:typeof definition.isOpen === 'function' ? definition.isOpen : ()=>continuityState.overlays.some(entry=>entry.id === id)
  });
  return true;
}

function continuityOverlayOpened(id, options={}){
  const definition = continuityOverlayRegistry.get(id);
  if(!definition) return false;
  const existing = continuityState.overlays.find(entry=>entry.id === id);
  const returnTarget = existing?.returnTarget || (options.returnTarget instanceof HTMLElement ? options.returnTarget : document.activeElement instanceof HTMLElement ? document.activeElement : null);
  const entry = {
    id,
    priority:definition.priority,
    returnTarget,
    originWorld:existing?.originWorld || document.body.dataset.world || 'home',
    openedAt:existing?.openedAt || continuityTimestamp()
  };
  continuityState.overlays = continuityState.overlays.filter(item=>item.id !== id);
  continuityState.overlays.push(entry);
  continuityState.overlays.sort((a,b)=>a.priority - b.priority);
  continuitySyncDomState();
  continuityEmit('overlay-opened', {overlay:id});
  return true;
}

function continuityCanRestoreTarget(target){
  if(!(target instanceof HTMLElement) || !target.isConnected) return false;
  if(target.closest('[inert],[aria-hidden="true"]')) return false;
  if(target.getClientRects().length === 0) return false;
  const page = target.closest('.page');
  if(page && !page.classList.contains('active')) return false;
  const style = window.getComputedStyle(target);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

function continuityOverlayClosed(id, options={}){
  const entry = continuityState.overlays.find(item=>item.id === id) || null;
  continuityState.overlays = continuityState.overlays.filter(item=>item.id !== id);
  continuitySyncDomState();
  continuityEmit('overlay-closed', {overlay:id, reason:options.reason || 'dismissed'});
  if(options.restoreFocus === false) return entry;
  window.requestAnimationFrame(()=>{
    const returnTarget = entry?.returnTarget;
    if(continuityCanRestoreTarget(returnTarget)){
      try{ returnTarget.focus({preventScroll:true}); }catch(error){ returnTarget.focus?.(); }
      return;
    }
    continuityRequestFocus(document.body.dataset.world || 'home', `overlay-${id}-closed`);
  });
  return entry;
}

function continuityDismissOverlay(id, options={}){
  const definition = continuityOverlayRegistry.get(id);
  if(!definition) return false;
  const trackedEntry = continuityState.overlays.find(entry=>entry.id === id) || null;
  const tracked = !!trackedEntry;
  if(!tracked && !definition.isOpen()) return false;
  definition.close(options);
  if(continuityState.overlays.some(entry=>entry.id === id)) continuityOverlayClosed(id, options);
  return trackedEntry || true;
}

function continuityCloseTopOverlay(options={}){
  const active = [...continuityOverlayRegistry.values()]
    .filter(definition=>definition.isOpen() || continuityState.overlays.some(entry=>entry.id === definition.id))
    .sort((a,b)=>b.priority - a.priority);
  if(!active.length) return false;
  return continuityDismissOverlay(active[0].id, options);
}

function continuityCaptureLaunchOrigin(origin={}){
  const world = document.body.dataset.world || 'home';
  continuityRememberFocus(document.activeElement, world);
  continuityState.launch = {
    status:'PREPARING',
    origin:{
      world,
      commandId:String(origin.commandId || ''),
      commandName:String(origin.commandName || ''),
      targetMode:String(origin.targetMode || 'primary'),
      inputSource:String(origin.inputSource || 'unknown'),
      focusSelector:continuitySelectorFor(document.activeElement),
      profileId:continuityState.profile.id,
      capturedAt:continuityTimestamp()
    },
    result:null,
    updatedAt:continuityTimestamp()
  };
  continuitySyncDomState();
  continuityPersist();
  return continuityEmit('launch-origin-captured', {commandId:continuityState.launch.origin.commandId});
}

function continuityMarkLaunchResult(result={}){
  continuityState.launch.status = String(result.status || 'UNKNOWN');
  continuityState.launch.result = {
    outcome:String(result.outcome || ''),
    pid:Number.isFinite(Number(result.pid)) ? Number(result.pid) : null,
    detail:String(result.detail || ''),
    observedAt:continuityTimestamp()
  };
  continuityState.launch.updatedAt = continuityTimestamp();
  continuitySyncDomState();
  continuityPersist();
  return continuityEmit('launch-result', {status:continuityState.launch.status});
}

function continuitySetRecoveryAvailability(recovery={}){
  const allowed = new Set(['CHECKING','GLOBAL_READY','GLOBAL_ARMED','IN_RUCA_ONLY','UNAVAILABLE']);
  const availability = allowed.has(recovery.availability) ? recovery.availability : 'UNAVAILABLE';
  continuityState.recovery = {
    availability,
    bridgeReachable:recovery.bridgeReachable === true,
    captureSupported:recovery.captureSupported === true,
    controllerConnected:recovery.controllerConnected === true,
    guideSupported:recovery.guideSupported === true,
    detail:String(recovery.detail || ''),
    updatedAt:continuityTimestamp()
  };
  document.body.dataset.rucaRecoveryAvailability = availability.toLowerCase().replace(/_/g,'-');
  return continuityEmit('recovery-availability', {availability});
}

continuityRestorePersistedLaunch();
document.body.dataset.rucaContinuityOwner = RUCA_CONTINUITY_OWNER;
document.body.dataset.rucaContinuityVersion = RUCA_CONTINUITY_VERSION;
continuitySyncDomState();

function reducedFlightMotion(){
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
}

function syncCoreBeacons(page){
  coreBeacons.forEach(b => {
    const active = b.dataset.coreRoute === page;
    b.classList.toggle('active', active);
    b.setAttribute('aria-current', active ? 'page' : 'false');
  });
  document.body.classList.toggle('core-return-available', page !== 'home');
}

function worldTravelSnapshot(){
  return Object.freeze({
    version:RUCA_WORLD_TRAVEL_VERSION,
    locked:worldTravelState.locked,
    id:worldTravelState.id,
    from:worldTravelState.from,
    to:worldTravelState.to,
    phase:worldTravelState.phase,
    reducedMotion:worldTravelState.reducedMotion
  });
}

function worldTravelDetail(extra={}){
  return Object.freeze({
    id:worldTravelState.id,
    from:worldTravelState.from,
    to:worldTravelState.to,
    phase:worldTravelState.phase,
    reducedMotion:worldTravelState.reducedMotion,
    ...extra
  });
}

function worldTravelAudio(phase){
  const detail = worldTravelDetail({audioPhase:phase});
  try{
    worldTravelAudioHook?.(detail);
  }catch(error){
    console.warn('RUCA world-travel audio hook failed.', error);
  }
  window.dispatchEvent(new CustomEvent('ruca:world-travel-audio', {detail}));
}

function worldTravelSetPhase(phase){
  worldTravelState.phase = phase;
  if(worldTravelLayer) worldTravelLayer.dataset.state = phase;
  document.body.dataset.worldTravelPhase = phase;
}

function worldTravelPrepare(id, from, to, options={}){
  const destination = RUCA_WORLD_DESTINATIONS[to] || RUCA_WORLD_DESTINATIONS.home;
  worldTravelState.locked = true;
  worldTravelState.id = id;
  worldTravelState.from = from;
  worldTravelState.to = to;
  worldTravelState.reducedMotion = reducedFlightMotion();
  worldTravelState.completion = typeof options.onComplete === 'function' ? options.onComplete : null;
  document.body.classList.add('ruca-world-travel-active', 'ruca-input-locked');
  document.body.dataset.worldTravelTarget = to;
  document.body.dataset.worldTravelMotion = worldTravelState.reducedMotion ? 'reduced' : 'full';
  document.body.style.setProperty('--ruca-travel-accent', destination.accent);
  document.body.style.setProperty('--ruca-travel-x', destination.x);
  document.body.style.setProperty('--ruca-travel-y', destination.y);
  document.body.style.setProperty('--ruca-travel-angle', destination.angle);
  if(worldTravelDestination) worldTravelDestination.textContent = destination.label;
  worldTravelSetPhase('depart');
  semanticPulseEmit('world-departure', {
    destination:to,
    accent:destination.accent,
    message:`Departure acknowledged for ${destination.label}.`
  });
  worldTravelAudio('depart');
}

function worldTravelRelease(reason='completed'){
  const detail = worldTravelDetail({reason});
  const completion = worldTravelState.completion;
  worldTravelState.locked = false;
  worldTravelState.phase = 'idle';
  worldTravelState.completion = null;
  document.body.classList.remove('ruca-world-travel-active', 'ruca-input-locked');
  delete document.body.dataset.worldTravelTarget;
  delete document.body.dataset.worldTravelMotion;
  delete document.body.dataset.worldTravelPhase;
  document.body.style.removeProperty('--ruca-travel-accent');
  document.body.style.removeProperty('--ruca-travel-x');
  document.body.style.removeProperty('--ruca-travel-y');
  document.body.style.removeProperty('--ruca-travel-angle');
  if(worldTravelLayer) worldTravelLayer.dataset.state = 'idle';
  if(worldTravelDestination) worldTravelDestination.textContent = '';
  return {detail, completion};
}

function worldTravelComplete(){
  const destination = RUCA_WORLD_DESTINATIONS[worldTravelState.to] || RUCA_WORLD_DESTINATIONS.home;
  semanticPulseEmit('world-arrival', {
    destination:worldTravelState.to,
    accent:destination.accent,
    message:`Arrival confirmed at ${destination.label}.`
  });
  worldTravelAudio('arrived');
  const {detail, completion} = worldTravelRelease('completed');
  try{
    completion?.(detail);
  }catch(error){
    console.warn('RUCA world-travel completion callback failed.', error);
  }
  worldTravelCompletionHandlers.forEach(handler=>{
    try{
      handler(detail);
    }catch(error){
      console.warn('RUCA world-travel completion subscriber failed.', error);
    }
  });
  window.dispatchEvent(new CustomEvent('ruca:world-travel-complete', {detail}));
}

function clearCoreTransition(reason='interrupted'){
  const activeTransition = continuityState.navigation.transition;
  coreTransitionSequence += 1;
  window.clearTimeout(coreTransitionTimer);
  window.clearTimeout(coreArrivalTimer);
  coreTransitionTimer = 0;
  coreArrivalTimer = 0;
  document.body.classList.remove('core-transitioning', 'core-arriving', 'flight-spooling', 'flight-diving', 'flight-arriving', 'flight-returning');
  [...document.body.classList].filter(name => name.startsWith('core-pending-')).forEach(name => document.body.classList.remove(name));
  delete document.body.dataset.flightTarget;
  delete document.body.dataset.flightDirection;
  delete document.body.dataset.continuityTransition;
  coreBeacons.forEach(b => b.classList.remove('is-selected'));
  const releasedTravel = worldTravelRelease(reason);
  if(activeTransition){
    continuityState.navigation.transition = null;
    continuityEmit('transition-interrupted', {reason, from:activeTransition.from, to:activeTransition.to});
    window.dispatchEvent(new CustomEvent('ruca:world-travel-cancelled', {
      detail:{...releasedTravel.detail, from:activeTransition.from, to:activeTransition.to}
    }));
  }
  return activeTransition;
}

function nav(page, options={}){
  if(!page || !pages.some(candidate=>candidate.id === `page-${page}`)) return false;
  const current = document.body.dataset.world || 'home';
  if(current && current !== page && !options.replace){
    worldHistory.push(current);
    while(worldHistory.length > 12) worldHistory.shift();
  }
  document.body.dataset.world = page;
  continuityState.navigation.world = page;
  continuitySyncDomState();
  pages.forEach(p => p.classList.toggle('active', p.id === `page-${page}`));
  if(page === 'home') homeGaugeMechanicalAuthorityStart();
  else homeGaugeMechanicalAuthorityStop();
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.page === page));
  syncCoreBeacons(page);
  continuityCommitShellHistory(page, options);
  if(page !== 'live') $$('.lane-btn').forEach((b,i)=>b.classList.toggle('active',i===0));
  continuityDismissOverlay('drawer', {restoreFocus:false, reason:'route-change'});
  continuityEmit('route-changed', {from:current, to:page, source:options.source || 'route'});
  continuityRequestFocus(page, options.focusReason || 'route-settled', options.shellFocusSelector || '');
  return true;
}

function routeThroughCore(page, options={}){
  if(!page) return false;
  const target = String(page) === 'apps' ? 'play' : String(page);
  if(!pages.some(candidate=>candidate.id === `page-${target}`)) return false;
  const current = document.body.dataset.world || 'home';
  if(options.shellHistoryMode !== 'none') continuityCaptureCurrentShellFocus(current);
  if(target === current && !continuityState.navigation.transition){
    continuityCommitShellHistory(current, {...options, shellHistoryMode:options.shellHistoryMode || 'replace'});
    continuityRequestFocus(current, 'route-current', options.shellFocusSelector || '');
    if(typeof options.onComplete === 'function'){
      options.onComplete(Object.freeze({from:current, to:current, phase:'complete', instant:true}));
    }
    return true;
  }
  if(options.instant){
    clearCoreTransition('instant-route');
    const routed = nav(target, options);
    if(routed && typeof options.onComplete === 'function'){
      options.onComplete(Object.freeze({from:current, to:target, phase:'complete', instant:true}));
    }
    return routed;
  }
  const returningHome = target === 'home' && current !== 'home';
  const reducedMotion = reducedFlightMotion();
  const travelMs = reducedMotion ? PASS31A_REDUCED_TRAVEL_MS : (options.travelMs ?? PASS16E_TRAVEL_MS);
  const settleMs = reducedMotion ? PASS31A_REDUCED_SETTLE_MS : (options.settleMs ?? PASS16E_SETTLE_MS);
  continuityRememberFocus(document.activeElement, current);
  clearCoreTransition('superseded');
  const transitionId = coreTransitionSequence;
  continuityState.navigation.transition = {
    id:transitionId,
    from:current,
    to:target,
    phase:'travel',
    source:String(options.source || 'route'),
    startedAt:continuityTimestamp()
  };
  worldTravelPrepare(transitionId, current, target, options);
  document.body.dataset.flightTarget = target;
  document.body.dataset.flightDirection = returningHome ? 'return' : 'outbound';
  document.body.dataset.continuityTransition = 'travel';
  document.body.classList.add('core-transitioning', 'flight-spooling', returningHome ? 'flight-returning' : 'flight-diving', `core-pending-${target}`);
  const selected = coreBeacons.find(b => b.dataset.coreRoute === target);
  selected?.classList.add('is-selected');
  continuityEmit('transition-started', {from:current, to:target, source:options.source || 'route', travelMs, settleMs, reducedMotion});
  window.RUCA_AUDIO?.cue?.('confirm');
  coreTransitionTimer = window.setTimeout(() => {
    if(coreTransitionSequence !== transitionId || continuityState.navigation.transition?.id !== transitionId) return;
    nav(target, options);
    document.body.classList.remove('core-transitioning', 'flight-spooling', 'flight-diving', 'flight-returning', `core-pending-${target}`);
    document.body.classList.add('core-arriving', 'flight-arriving');
    document.body.dataset.continuityTransition = 'settle';
    continuityState.navigation.transition = {...continuityState.navigation.transition, phase:'settle'};
    worldTravelSetPhase('arrive');
    worldTravelAudio('handoff');
    continuityEmit('transition-settling', {from:current, to:target});
    coreBeacons.forEach(b => b.classList.remove('is-selected'));
    coreArrivalTimer = window.setTimeout(() => {
      if(coreTransitionSequence !== transitionId || continuityState.navigation.transition?.id !== transitionId) return;
      document.body.classList.remove('core-arriving', 'flight-arriving');
      delete document.body.dataset.flightTarget;
      delete document.body.dataset.flightDirection;
      delete document.body.dataset.continuityTransition;
      continuityState.navigation.transition = null;
      continuityEmit('transition-completed', {from:current, to:target});
      worldTravelComplete();
    }, settleMs);
  }, travelMs);
  return true;
}

function returnThroughCore(options={}){
  const current = document.body.dataset.world || 'home';
  const last = worldHistory.pop();
  return routeThroughCore(last && last !== current ? last : 'home', {replace:true, source:options.source || 'back'});
}

function interruptCoreTransition(reason='user-interrupt'){
  if(!continuityState.navigation.transition) return false;
  clearCoreTransition(reason);
  continuityRequestFocus(document.body.dataset.world || 'home', reason);
  return true;
}

function continuityBack(options={}){
  const source = String(options.source || 'back');
  if(continuityCloseTopOverlay({restoreFocus:true, reason:source})){
    continuityEmit('back-resolved', {source, action:'overlay'});
    return true;
  }
  const transition = continuityState.navigation.transition;
  if(transition?.phase === 'travel'){
    interruptCoreTransition(`${source}-transition`);
    continuityEmit('back-resolved', {source, action:'transition-interrupted'});
    return true;
  }
  if(transition?.phase === 'settle') clearCoreTransition(`${source}-settle-interrupted`);
  const world = document.body.dataset.world || 'home';
  if(world !== 'home'){
    const routed = returnThroughCore({source});
    continuityEmit('back-resolved', {source, action:'route'});
    return routed;
  }
  continuityRequestFocus('home', `${source}-home`);
  continuityEmit('back-resolved', {source, action:'focus-home'});
  return true;
}

function armCoreBeacons(){
  document.body.classList.add('core-beacons-armed');
  const active = coreBeacons.find(b => b.dataset.coreRoute === (document.body.dataset.world || 'home')) || coreBeacons[0];
  active?.focus?.({preventScroll:true});
  window.RUCA_AUDIO?.cue?.('drawer-open');
}

navButtons.forEach(b => b.addEventListener('click', () => {
  routeThroughCore(b.dataset.page, {source:'navigation'});
  if(b.dataset.laneJump){ window.setTimeout(() => setLane(b.dataset.laneJump), reducedFlightMotion() ? 0 : PASS16E_TRAVEL_MS + 80); }
}));

coreBeacons.forEach(b => b.addEventListener('click', () => routeThroughCore(b.dataset.coreRoute, {source:'core-beacon'})));
coreReturnAnchor?.addEventListener('click', () => routeThroughCore('home', {replace:true, source:'core-return'}));
window.RUCA_CONTINUITY = Object.freeze({
  owner:RUCA_CONTINUITY_OWNER,
  version:RUCA_CONTINUITY_VERSION,
  snapshot:continuitySnapshot,
  rememberFocus:continuityRememberFocus,
  restoreFocus:continuityRestoreFocus,
  requestFocus:continuityRequestFocus,
  registerOverlay:continuityRegisterOverlay,
  openOverlay:continuityOverlayOpened,
  overlayClosed:continuityOverlayClosed,
  dismissOverlay:continuityDismissOverlay,
  closeTopOverlay:continuityCloseTopOverlay,
  back:continuityBack,
  interrupt:interruptCoreTransition,
  captureLaunchOrigin:continuityCaptureLaunchOrigin,
  markLaunchResult:continuityMarkLaunchResult,
  setRecoveryAvailability:continuitySetRecoveryAvailability
});
window.RUCA_CORE_NAV = {
  route:routeThroughCore,
  home:()=>routeThroughCore('home', {replace:true, source:'home-command'}),
  back:continuityBack,
  interrupt:interruptCoreTransition,
  arm:armCoreBeacons,
  travelMs:PASS16E_TRAVEL_MS
};
window.RUCA_WORLD_TRAVEL = Object.freeze({
  version:RUCA_WORLD_TRAVEL_VERSION,
  destinations:RUCA_WORLD_DESTINATIONS,
  route:routeThroughCore,
  cancel:(reason='world-travel-cancel')=>interruptCoreTransition(reason),
  isLocked:()=>worldTravelState.locked,
  snapshot:worldTravelSnapshot,
  onComplete(handler){
    if(typeof handler !== 'function') return ()=>{};
    worldTravelCompletionHandlers.add(handler);
    return ()=>worldTravelCompletionHandlers.delete(handler);
  },
  setAudioHook(handler){
    worldTravelAudioHook = typeof handler === 'function' ? handler : null;
    return worldTravelAudioHook !== null;
  }
});
window.RUCA_SEMANTIC_PULSES = Object.freeze({
  version:RUCA_SEMANTIC_PULSE_VERSION,
  types:RUCA_SEMANTIC_PULSE_TYPES,
  emit:(type, detail={})=>semanticPulseEmit(type, detail),
  snapshot:()=>Object.freeze({
    version:RUCA_SEMANTIC_PULSE_VERSION,
    activeType:semanticPulseState.activeType,
    readyFired:semanticPulseState.readyFired,
    lastEvent:semanticPulseState.lastEvent,
    gaugeStates:Object.freeze(Object.fromEntries(semanticPulseState.gaugeStates))
  })
});
syncCoreBeacons(document.body.dataset.world || 'home');
window.addEventListener('popstate', continuityHandleShellPopstate);
continuityInitializeShellHistory();

document.addEventListener('click', event => {
  if(!worldTravelState.locked) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);

document.addEventListener('keydown', event => {
  if(!worldTravelState.locked) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if(event.key === 'Escape') interruptCoreTransition('keyboard-escape');
}, true);

document.addEventListener('keydown', e => {
  if(e.key !== 'Escape' || e.defaultPrevented) return;
  e.preventDefault();
  continuityBack({source:'keyboard-escape'});
});

function updateClock(){
  const d = new Date();
  $('#clock').textContent = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  $('#dateLine').textContent = d.toLocaleDateString([], {weekday:'long', month:'short', day:'numeric', year:'numeric'});
}
setInterval(updateClock, 1000); updateClock();

const sensorButtons = $('#sensorButtons');
const sensorOrder = ['ScoreMap','CPU','GPU','RAM','Motherboard','VRM','Thermals','Fans','Pumps','Power','Storage','SMART','Network','PCIe','Buses','Cooling','Windows','External','Unclassified','SensorBus'];
const sensorLabels = Object.freeze({ScoreMap:'OVERVIEW',Motherboard:'BOARD',Thermals:'THERMALS',Windows:'WINDOWS COUNTERS',External:'EXTERNAL DEVICES',Unclassified:'UNCLASSIFIED',SensorBus:'SENSOR BUS'});
sensorButtons.innerHTML = sensorOrder.map((key,i)=>`<button class="sensor-btn ${i===1?'active':''}" data-sensor="${key}">${sensorLabels[key] || key.toUpperCase()}</button>`).join('');
sensorButtons.addEventListener('click', e => {
  const btn = e.target.closest('[data-sensor]');
  if(!btn) return;
  $$('.sensor-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  requestDiagnosticSelection(btn.dataset.sensor);
});

function requestDiagnosticSelection(key){
  const selected = sensorOrder.includes(key) ? key : 'ScoreMap';
  document.body.dataset.rucaDiagnostic = selected;
  document.dispatchEvent(new CustomEvent('ruca:diagnostic-select', {detail:{key:selected}}));
}

requestDiagnosticSelection('CPU');

const PLAY_DISTRICT_ORDER = Object.freeze(['Games District','Browser District','Media District','Creative District','AI District','System District']);
const PLAY_FAVORITES_KEY = 'rucaPlayFavorites';
const PLAY_RECENTS_KEY = 'rucaPlayRecents';

const APP_ICON_SVGS = Object.freeze({
  steam:'<circle cx="22" cy="10" r="5"/><circle cx="10" cy="22" r="4"/><path d="m13 20 6-7m-7 12 7 3 7-4"/>',
  xbox:'<circle cx="16" cy="16" r="13"/><path d="M8 8c4 1 6 4 8 8 2-4 4-7 8-8M9 24c2-5 4-8 7-8s5 3 7 8"/>',
  target:'<circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="5"/><path d="M16 2v7m0 14v7M2 16h7m14 0h7"/>',
  gamepad:'<path d="M8 12h16l4 10c1 4-3 6-6 3l-3-3h-6l-3 3c-3 3-7 1-6-3l4-10Z"/><path d="M10 16v6m-3-3h6m9-2h.01m3 3h.01"/>',
  chrome:'<circle cx="16" cy="16" r="13"/><circle cx="16" cy="16" r="5"/><path d="M16 3v8m0 0h12M12 20l-6 6"/>',
  spotify:'<circle cx="16" cy="16" r="13"/><path d="M8 12c6-2 13-1 17 2M9 17c5-2 11-1 15 2M10 22c4-1 8-1 12 1"/>',
  discord:'<path d="M9 10c5-3 9-3 14 0l3 12c-4 3-6 4-9 4l-1-2-1 2c-3 0-5-1-9-4l3-12Z"/><circle cx="12" cy="17" r="1.5"/><circle cx="20" cy="17" r="1.5"/>',
  youtube:'<rect x="4" y="8" width="24" height="16" rx="5"/><path d="m14 13 7 3-7 4Z"/>',
  stream:'<rect x="5" y="5" width="22" height="22" rx="6"/><path d="m13 11 8 5-8 5Z"/><path d="M8 27h16"/>',
  plex:'<path d="M11 5h8l7 11-7 11h-8l7-11-7-11Z"/>',
  code:'<path d="m12 8-7 8 7 8m8-16 7 8-7 8M18 5l-4 22"/>',
  cursor:'<path d="M7 4v23l6-7 5 8 4-2-5-8h9L7 4Z"/>',
  figma:'<path d="M11 3h5v10h-5a5 5 0 0 1 0-10Zm5 0h5a5 5 0 0 1 0 10h-5V3Zm0 10h5a5 5 0 1 1-5 5v-5Zm-5 0h5v10h-5a5 5 0 1 1 0-10Zm0 10h5v3a5 5 0 1 1-5-3Z"/>',
  layers:'<path d="m16 4 12 7-12 7L4 11l12-7Z"/><path d="m6 17 10 6 10-6M6 23l10 6 10-6"/>',
  spark:'<path d="m16 3 2.5 8.5L27 14l-8.5 2.5L16 25l-2.5-8.5L5 14l8.5-2.5L16 3Z"/><path d="m26 3 .8 3.2L30 7l-3.2.8L26 11l-.8-3.2L22 7l3.2-.8L26 3Z"/>',
  github:'<circle cx="16" cy="16" r="13"/><path d="M11 25v-4c-4 1-4-2-6-3m16 7v-4c0-3-1-4-2-5 3 0 6-2 6-7 0-2-1-4-2-5 0-1 0-2 1-3-4 0-6 2-8 3-2-1-4-3-8-3 0 1 1 2 1 3-1 1-2 3-2 5 0 5 3 7 6 7-1 1-2 2-2 5v4"/>',
  blocks:'<path d="M5 5h9v9H5V5Zm13 0h9v5h-9V5Zm0 9h9v13h-9V14ZM5 18h9v9H5v-9Z"/>',
  obs:'<circle cx="16" cy="16" r="13"/><path d="M16 8a7 7 0 0 1 6 3l-5 2a4 4 0 0 0-5 2L9 11a8 8 0 0 1 7-3Zm6 4a7 7 0 0 1 0 7l-4-4a4 4 0 0 0-4-3l2-4a8 8 0 0 1 6 4ZM11 23a7 7 0 0 1-3-6l5 1a4 4 0 0 0 5 2l1 5a8 8 0 0 1-8-2Z"/>',
  folder:'<path d="M3 8h10l3 3h13v16H3V8Z"/><path d="M3 13h26"/>',
  download:'<path d="M3 9h10l3 3h13v15H3V9Z"/><path d="M16 14v9m-4-4 4 4 4-4"/>',
  document:'<path d="M8 3h11l6 6v20H8V3Z"/><path d="M19 3v7h6M12 16h9m-9 5h9"/>',
  video:'<rect x="4" y="7" width="24" height="19" rx="3"/><path d="m14 12 8 5-8 5Z"/>',
  music:'<path d="M13 24V8l13-3v15"/><circle cx="9" cy="24" r="4"/><circle cx="22" cy="20" r="4"/>',
  image:'<rect x="4" y="5" width="24" height="22" rx="3"/><circle cx="12" cy="12" r="3"/><path d="m6 24 7-7 5 5 3-3 5 5"/>',
  terminal:'<rect x="3" y="5" width="26" height="22" rx="3"/><path d="m8 11 5 5-5 5m8 1h8"/>',
  tasks:'<path d="M5 7h22v19H5V7Z"/><path d="M10 21v-5m6 5V11m6 10v-8"/>',
  calculator:'<rect x="7" y="3" width="18" height="26" rx="3"/><path d="M10 7h12v5H10V7Zm1 10h2m5 0h2m-9 6h2m5 0h2"/>',
  settings:'<circle cx="16" cy="16" r="4"/><path d="m16 3 2 4 4 1 4-2 2 4-3 3 1 4 3 3-2 4-4-1-3 2-3-3-4 1-2-4 3-3-1-4-3-3 2-4 4 1 3-2Z"/>',
  chip:'<rect x="8" y="8" width="16" height="16" rx="2"/><path d="M12 12h8v8h-8v-8ZM4 11h4m-4 6h4m-4 6h4m16-12h4m-4 6h4m-4 6h4M11 4v4m6-4v4m6-4v4M11 24v4m6-4v4m6-4v4"/>',
  sliders:'<path d="M5 8h22M5 16h22M5 24h22"/><circle cx="12" cy="8" r="3"/><circle cx="21" cy="16" r="3"/><circle cx="15" cy="24" r="3"/>',
  gauge:'<path d="M5 24a12 12 0 0 1 22 0"/><path d="m16 21 7-8"/><circle cx="16" cy="22" r="2"/>',
  lighting:'<circle cx="16" cy="14" r="7"/><path d="M12 22h8m-7 4h6M16 2v3M4 14H1m30 0h-3M6 5l3 3m17-3-3 3"/>',
  motherboard:'<rect x="5" y="5" width="22" height="22" rx="2"/><rect x="9" y="9" width="9" height="9"/><path d="M21 9h3m-3 4h3m-3 4h3M9 22h15"/>',
  nvidia:'<path d="M3 16c5-7 13-10 22-6 2 1 4 3 5 6-5-5-13-6-19-1 3-2 8-2 11 1-3 4-8 5-12 3-3-2-5-3-7-3Z"/><circle cx="16" cy="16" r="3"/>'
});

function resolveAppIcon(iconKey){
  const body = APP_ICON_SVGS[iconKey] || APP_ICON_SVGS.chip;
  return `<svg class="ruca-app-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false" data-icon="${iconKey}">${body}</svg>`;
}

let appRegistry = [];
let appRegistryById = new Map();
let appRegistryByName = new Map();
const districtSlug = district=>district.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

function iconKeyFromSource(source){
  const parts = String(source || '').split(':');
  return parts[parts.length - 1] || 'chip';
}

function hydratePlayCommand(command){
  const primary = command.primary_target || null;
  const fallback = command.fallback_target || null;
  const status = command.availability || command.failure_state || 'NOT INSTALLED';
  return Object.freeze({
    ...command,
    name:command.label,
    command:command.primary_display || primary?.display || command.fallback_display || fallback?.display || 'No registered target',
    status,
    icon:iconKeyFromSource(command.icon_source),
    action:command.primary_available
      ? `Launch through ${command.launch_method}.`
      : command.fallback_available
        ? `Primary application is unavailable. ${command.fallback_display || 'A verified fallback is available.'}`
        : (command.failure_state || 'No verified target is available.'),
    primaryAvailable:Boolean(command.primary_available),
    fallbackAvailable:Boolean(command.fallback_available),
    primaryTarget:primary,
    fallbackTarget:fallback
  });
}

function readPlayList(key, fallback=[]){
  try{
    const raw = localStorage.getItem(key);
    if(raw === null) return [...fallback];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(id=>appRegistryById.has(id)) : [...fallback];
  }catch(err){
    return [...fallback];
  }
}

function savePlayList(key, values){
  try{ localStorage.setItem(key, JSON.stringify(values)); }catch(err){}
}

let favoriteAppIds = new Set();
let recentAppIds = [];
let currentCommandFilter = 'games-district';
const appsGrid = $('#appsGrid');

function appStateClass(status){
  if(status === 'READY') return 'ready';
  if(status === 'WEB ONLY' || status === 'INTERNAL ROUTE') return 'source-check';
  if(status === 'PERMISSION BLOCKED' || status === 'LAUNCH FAILED') return 'bridge-required';
  return 'staged';
}

function renderAppCard(app,index){
  const favorite = favoriteAppIds.has(app.id);
  return `<button class="app-card command-module launch-node integrated-app-node" data-ruca-action="play-detail" data-ruca-action-contract="Open ${app.name} command detail" data-app="${app.name}" data-app-id="${app.id}" data-status="${app.status}" data-district="${app.district}" data-district-slug="${districtSlug(app.district)}" data-role="${app.role}" data-app-index="${index}" data-favorite="${favorite}" tabindex="0" aria-label="Select ${app.name} in ${app.district}, ${app.status}"><span class="app-icon-slot">${resolveAppIcon(app.icon)}</span><span class="app-favorite-mark" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="m12 2.8 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.4 6.3-.9Z" /></svg></span><span class="orbit-node-label">${app.name}</span><span class="orbit-node-state ${appStateClass(app.status)}">${app.status}</span></button>`;
}

function syncFilterCounts(){
  const counts = {all:appRegistry.length,favorites:favoriteAppIds.size,recent:recentAppIds.length};
  PLAY_DISTRICT_ORDER.forEach(district=>{
    counts[districtSlug(district)] = appRegistry.filter(app=>app.district === district).length;
  });
  $$('[data-filter-count]').forEach(node=>{
    node.textContent = String(counts[node.dataset.filterCount] ?? 0);
  });
}

function visibleAppsForFilter(filter){
  if(filter === 'favorites') return appRegistry.filter(app=>favoriteAppIds.has(app.id));
  if(filter === 'recent') return recentAppIds.map(id=>appRegistryById.get(id)).filter(Boolean);
  const district = PLAY_DISTRICT_ORDER.find(name=>districtSlug(name) === filter);
  return district ? appRegistry.filter(app=>app.district === district) : [...appRegistry];
}

function syncCommandFavoriteToggle(appId){
  const toggle = $('#commandFavoriteToggle');
  if(!toggle) return;
  const app = appRegistryById.get(appId);
  const favorite = Boolean(app && favoriteAppIds.has(app.id));
  toggle.disabled = !app;
  toggle.dataset.appId = app?.id || '';
  toggle.classList.toggle('is-favorite', favorite);
  toggle.setAttribute('aria-pressed', favorite ? 'true' : 'false');
  toggle.setAttribute('aria-label', app ? `${favorite ? 'Remove' : 'Add'} ${app.name} ${favorite ? 'from' : 'to'} favorites` : 'No selected command');
}

function applyCommandOrbitFilter(filter='all', options={}){
  if(!appsGrid) return;
  const normalized = ['all','favorites','recent',...PLAY_DISTRICT_ORDER.map(districtSlug)].includes(filter) ? filter : 'all';
  currentCommandFilter = normalized;
  const visibleApps = visibleAppsForFilter(normalized);
  const visibleIds = new Set(visibleApps.map(app=>app.id));
  const allNodes = [...appsGrid.querySelectorAll('.integrated-app-node')];
  const nodesById = new Map(allNodes.map(node=>[node.dataset.appId,node]));
  const orderedIds = normalized === 'recent' ? recentAppIds : appRegistry.map(app=>app.id);
  orderedIds.forEach(id=>{
    const node = nodesById.get(id);
    if(node) appsGrid.appendChild(node);
  });
  allNodes.forEach(node=>{ node.hidden = !visibleIds.has(node.dataset.appId); });
  $$('.command-filter-btn').forEach(button=>{
    const active = button.dataset.commandFilter === normalized;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  const empty = $('#commandOrbitEmpty');
  if(empty){
    empty.hidden = visibleApps.length > 0;
    const title = empty.querySelector('b');
    const detail = empty.querySelector('small');
    if(title) title.textContent = normalized === 'recent' ? 'NO RECENT COMMANDS YET' : 'NO FAVORITES IN THIS DISTRICT';
    if(detail) detail.textContent = normalized === 'recent' ? 'Open a command to place it here.' : 'Select a command in ALL, then use the star control.';
  }
  const collection = $('#commandWheelCollection');
  if(collection) collection.textContent = `${visibleApps.length} OF ${appRegistry.length} COMMANDS // ${normalized.replace(/-/g,' ').toUpperCase()}`;
  const preferredAppId = options.preferredAppId && visibleIds.has(options.preferredAppId) ? options.preferredAppId : visibleApps[0]?.id || '';
  document.dispatchEvent(new CustomEvent('ruca:play-orbit-change',{detail:{filter:normalized,count:visibleApps.length,preferredAppId}}));
}

function rememberRecentApp(app){
  if(!app) return;
  recentAppIds = [app.id,...recentAppIds.filter(id=>id !== app.id)].slice(0,12);
  savePlayList(PLAY_RECENTS_KEY,recentAppIds);
  syncFilterCounts();
  if(currentCommandFilter === 'recent') applyCommandOrbitFilter('recent',{preferredAppId:app.id});
}

function updateFavoriteState(appId){
  const app = appRegistryById.get(appId);
  if(!app) return;
  if(favoriteAppIds.has(app.id)) favoriteAppIds.delete(app.id);
  else favoriteAppIds.add(app.id);
  savePlayList(PLAY_FAVORITES_KEY,[...favoriteAppIds]);
  const node = appsGrid?.querySelector(`[data-app-id="${app.id}"]`);
  if(node) node.dataset.favorite = favoriteAppIds.has(app.id) ? 'true' : 'false';
  syncFilterCounts();
  syncCommandFavoriteToggle(app.id);
  if(currentCommandFilter === 'favorites') applyCommandOrbitFilter('favorites',{preferredAppId:favoriteAppIds.has(app.id) ? app.id : ''});
  window.RUCA_AUDIO?.cue?.(favoriteAppIds.has(app.id) ? 'confirm' : 'click');
}

function openAppCommand(item){
  if(!item) return;
  rememberRecentApp(item);
  const primaryAction = item.primaryAvailable
    ? {label:`PREVIEW ${item.name.toUpperCase()}`, action:'play-launch', commandId:item.id, target:'primary'}
    : {label:item.status, disabled:true, explanation:item.failure_state || 'No registered primary target is available.'};
  const actions = [primaryAction];
  if(item.fallbackAvailable){
    const fallbackKind = item.fallbackTarget?.kind;
    actions.push({
      label:fallbackKind === 'web_url' ? 'OPEN VERIFIED WEB FALLBACK' : fallbackKind === 'internal_route' ? 'OPEN RUCA DESTINATION' : 'OPEN INSTALL / FALLBACK SOURCE',
      action:'play-launch',
      commandId:item.id,
      target:'fallback'
    });
  }
  openDrawer(item.name, {
    Function: item.role,
    District: item.district,
    'Launch State': item.status,
    'Primary Target': item.primary_display || item.command,
    'Fallback Target': item.fallback_display || 'NONE',
    'Resolution Method': item.launch_method,
    'Favorite': favoriteAppIds.has(item.id) ? 'YES' : 'NO',
    'Production Rule': 'Public demo: command previews stay inside this page and never launch applications.',
    'Next Action': item.action
  }, item.primaryAvailable
    ? 'Explore this command preview. Desktop launch actions are disabled in the public demonstration.'
    : 'The primary application is unavailable. Any alternate action below is a separately verified destination.',
  {kind:'play-command', commandId:item.id, actions});
}

$('#commandFavoriteToggle')?.addEventListener('click', event=>updateFavoriteState(event.currentTarget.dataset.appId));
$$('.command-filter-btn').forEach(button=>button.addEventListener('click',()=>applyCommandOrbitFilter(button.dataset.commandFilter)));
document.addEventListener('ruca:play-selection-change',event=>syncCommandFavoriteToggle(event.detail?.appId || ''));

async function loadPlayCommandRegistry(){
  let payload = null;
  try{
    const response = await fetch('/commands/registry', {cache:'no-store'});
    if(!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    payload = await response.json();
  }catch(error){
    const response = await fetch('PASS19_PLAY_COMMAND_REGISTRY.json', {cache:'no-store'});
    if(!response.ok) throw error;
    payload = await response.json();
    payload.commands = (payload.commands || []).map(command=>({
      ...command,
      availability:'BRIDGE UNAVAILABLE',
      primary_available:false,
      fallback_available:false,
      primary_display:command.primary_target?.display || '',
      fallback_display:command.fallback_target?.display || ''
    }));
  }
  if(!Array.isArray(payload?.commands) || payload.commands.length !== 39) throw new Error('PASS19 registry did not provide exactly 39 commands.');
  appRegistry = payload.commands.map(hydratePlayCommand);
  appRegistryById = new Map(appRegistry.map(app=>[app.id,app]));
  appRegistryByName = new Map(appRegistry.map(app=>[app.name,app]));
  const defaultFavoriteIds = appRegistry.filter(app=>app.favorite).map(app=>app.id);
  favoriteAppIds = new Set(readPlayList(PLAY_FAVORITES_KEY, defaultFavoriteIds));
  recentAppIds = readPlayList(PLAY_RECENTS_KEY);
  if(appsGrid) appsGrid.innerHTML = appRegistry.map(renderAppCard).join('');
  const commandCore = $('#commandWheelAction');
  if(commandCore){
    commandCore.dataset.rucaAction = 'play-detail';
    commandCore.dataset.rucaActionContract = 'Open selected PLAY command detail';
  }
  syncFilterCounts();
  const initialDistrict = 'games-district';
  const initialApp = visibleAppsForFilter(initialDistrict)[0] || appRegistry[0];
  applyCommandOrbitFilter(initialDistrict,{preferredAppId:initialApp?.id});
  syncCommandFavoriteToggle(appRegistry[0]?.id);
  document.dispatchEvent(new CustomEvent('ruca:play-registry-ready',{detail:{count:appRegistry.length}}));
}

const playCommandApi = {
  get registry(){ return appRegistry; },
  icon:resolveAppIcon,
  getById:id=>appRegistryById.get(id) || null,
  getByName:name=>appRegistryByName.get(name) || null,
  filter:filter=>applyCommandOrbitFilter(filter),
  favorites:()=>[...favoriteAppIds],
  recents:()=>[...recentAppIds],
  toggleFavorite:updateFavoriteState,
  open:openAppCommand,
  get count(){ return appRegistry.length; }
};
window.RUCA_PLAY_COMMANDS = Object.freeze(playCommandApi);
loadPlayCommandRegistry().catch(error=>{
  console.error('RUCA PASS19 command registry failed to load.', error);
  if(appsGrid) appsGrid.innerHTML = '<div class="command-orbit-empty"><b>COMMAND REGISTRY UNAVAILABLE</b><small>The bridge did not provide the authoritative 39-command registry.</small></div>';
});

$$('.complication').forEach(btn => btn.addEventListener('click', () => {
  const key = btn.dataset.component;
  routeThroughCore('diagnostics');
  const sensorKey = key === 'Thermals' ? 'Thermals' : key;
  const sensorBtn = $(`[data-sensor="${sensorKey}"]`);
  if(sensorBtn){ $$('.sensor-btn').forEach(b=>b.classList.remove('active')); sensorBtn.classList.add('active'); }
  requestDiagnosticSelection(sensorKey);
}));
  function escapeDrawerText(value){
  return String(value ?? '').replace(/[&<>"']/g, char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function openDrawer(title, lines, note, options={}){
  const returnTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  $('#drawerTitle').textContent = title;
  const actionMarkup = (options.actions || []).map(action=>{
    if(action.disabled){
      return `<div class="pass19-command-disabled"><b>${escapeDrawerText(action.label)}</b><small>${escapeDrawerText(action.explanation || 'This destination is unavailable.')}</small></div>`;
    }
    return `<button type="button" class="pass19-command-action" data-ruca-action="${escapeDrawerText(action.action)}" data-ruca-action-contract="Launch allowlisted PLAY command" data-command-id="${escapeDrawerText(action.commandId)}" data-command-target="${escapeDrawerText(action.target || 'primary')}">${escapeDrawerText(action.label)}</button>`;
  }).join('');
  $('#drawerContent').innerHTML = Object.entries(lines).map(([k,v])=>`<div class="drawer-line"><span>${escapeDrawerText(k)}</span><b>${escapeDrawerText(v)}</b></div>`).join('') + `<p class="drawer-note">${escapeDrawerText(note||'')}</p>${actionMarkup}<div id="pass19LaunchStatus" class="pass19-launch-status" role="status" aria-live="polite">READY FOR COMMAND</div>`;
  $('#detailDrawer').classList.add('open');
  $('#detailDrawer').removeAttribute('inert');
  $('#detailDrawer').setAttribute('aria-hidden','false');
  continuityOverlayOpened('drawer', {returnTarget});
  const focusDrawerCommand = ()=>{
    if($('#detailDrawer').getAttribute('aria-hidden') !== 'false') return;
    $('#detailDrawer .pass19-command-action, #closeDrawer')?.focus?.({preventScroll:true});
  };
  requestAnimationFrame(focusDrawerCommand);
  window.setTimeout(focusDrawerCommand, 80);
}
function closeDrawer(options={}){
  $('#detailDrawer').classList.remove('open');
  $('#detailDrawer').setAttribute('aria-hidden','true');
  $('#detailDrawer').setAttribute('inert','');
  continuityOverlayClosed('drawer', {
    restoreFocus:options?.restoreFocus !== false,
    reason:options?.reason || 'drawer-close'
  });
  return true;
}
$('#closeDrawer').addEventListener('click', closeDrawer);
continuityRegisterOverlay({
  id:'drawer',
  priority:10,
  isOpen:()=>$('#detailDrawer')?.getAttribute('aria-hidden') === 'false',
  close:closeDrawer
});

/* Telemetry ownership stays with ruca-pass02b-liveworld-control.js.
   This file must not synthesize or independently overwrite machine state. */

/* PASS24B: Diagnostics interactions request work from the canonical telemetry
   owner. This script no longer produces or writes machine readings. */
function dispatchDiagnosticAction(action, detail={}){
  document.dispatchEvent(new CustomEvent(`ruca:diagnostic-${action}`, {detail}));
}

function runBench(which){
  dispatchDiagnosticAction('benchmark', {benchmark:String(which || '')});
}

function runFullBenchmarkSuite(){
  dispatchDiagnosticAction('benchmark', {benchmark:'full'});
}

function exportDiagnosticsReport(){
  dispatchDiagnosticAction('export');
}

document.querySelectorAll('.bench-btn').forEach(btn=>btn.addEventListener('click',()=>runBench(btn.dataset.bench)));
document.getElementById('runFullBenchmark')?.addEventListener('click', runFullBenchmarkSuite);
document.getElementById('exportReport')?.addEventListener('click', exportDiagnosticsReport);

function initRucaStarfield(){
  // RUCA // persistent galaxy authority
  // World re-entry must resume the existing composition, not regenerate it.
  if (window.__RUCA_GALAXY_STARFIELD_INITIALIZED__) {
    return;
  }
  window.__RUCA_GALAXY_STARFIELD_INITIALIZED__ = true;
  const canvas = document.getElementById('rucaStarfield');
  if(!canvas || !canvas.getContext) return;
  const owner = 'PASS18_CANONICAL_STARFIELD_ENGINE';
  const frameInterval = 1000 / 30;
  if(canvas.dataset.environmentOwner) return;
  canvas.dataset.environmentOwner = owner;
  const ctx = canvas.getContext('2d', { alpha: true });
  if(!ctx) return;
  const gasSurface = document.createElement('canvas');
  const gasCtx = gasSurface.getContext('2d', { alpha: true });
  const gasCacheScale = .42;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const body = document.body;
  const layers = [
    {id:'far', share:.58, speed:.004, radius:[.16,.48], alpha:[.10,.32], parallax:.28, breath:.10},
    {id:'mid', share:.32, speed:.024, radius:[.52,1.22], alpha:[.34,.72], parallax:.88, breath:.48},
    {id:'near', share:.10, speed:.086, radius:[1.28,2.90], alpha:[.68,1], parallax:1.62, breath:1}
  ];
  const magnitudeClasses = [
    {id:'A', share:.010, radius:1.72, luminance:1, halo:.48},
    {id:'B', share:.090, radius:1.18, luminance:.80, halo:.20},
    {id:'C', share:.340, radius:.72, luminance:.52, halo:.06},
    {id:'D', share:.560, radius:.38, luminance:.25, halo:0}
  ];
  const stellarAssociations = [
    {x:-.58,y:-.22,spread:.24,cores:[[-.12,.06,.36],[.18,-.08,.24],[.05,.17,.18]]},
    {x:.46,y:-.48,spread:.20,cores:[[-.16,.04,.28],[.12,.10,.22],[.02,-.14,.16]]},
    {x:.62,y:.34,spread:.27,cores:[[-.18,-.10,.34],[.14,.02,.27],[-.02,.18,.20]]},
    {x:-.30,y:.58,spread:.22,cores:[[-.10,-.11,.30],[.16,.04,.22],[-.04,.16,.17]]}
  ];
  const particleProfiles = {
    dust:{mass:.18, velocity:.18, drag:.72, opacity:.18, lifetime:[18,32], clusterBias:.74},
    debris:{mass:.72, velocity:.26, drag:.48, opacity:.24, lifetime:[14,24], clusterBias:.36},
    plasma:{mass:.08, velocity:.22, drag:.58, opacity:.20, lifetime:[12,20], clusterBias:.62},
    ion:{mass:.04, velocity:.16, drag:.80, opacity:.15, lifetime:[20,36], clusterBias:.84}
  };
  const volumetricDensityModel = Object.freeze({
    name:'PASS58_FBM_BEER_LAMBERT',
    depthSlices:4,
    octaves:5,
    extinction:1.72,
    scattering:.28,
    emission:.12
  });
  const worldProfiles = {
    home:        {density:2.08, speed:1.05, haze:.72, centerX:.50, centerY:.47},
    play:        {density:1.18, speed:1.20, haze:.12, centerX:.50, centerY:.46},
    live:        {density:.90, speed:.72, haze:.09, centerX:.50, centerY:.44},
    diagnostics: {density:.96, speed:.90, haze:.09, centerX:.50, centerY:.46},
    control:     {density:1.02, speed:.84, haze:.10, centerX:.50, centerY:.46}
  };
  const liveProfiles = {
    weather:{density:.94, speed:.68, haze:.12},
    market:{density:.78, speed:.58, haze:.07},
    news:{density:.74, speed:.52, haze:.06},
    sports:{density:.90, speed:.82, haze:.09},
    tech:{density:1.02, speed:.76, haze:.10}
  };
  const conditionProfiles = {
    'clear-night':{density:1.18, speed:.86, haze:.08},
    'clear-day':{density:.66, speed:.60, haze:.15},
    partly:{density:.80, speed:.62, haze:.16},
    cloud:{density:.58, speed:.50, haze:.20},
    rain:{density:.48, speed:.56, haze:.22},
    storm:{density:.40, speed:.70, haze:.25},
    snow:{density:.68, speed:.46, haze:.20},
    fog:{density:.34, speed:.34, haze:.28},
    neutral:{density:1, speed:1, haze:.10}
  };
  let width = 0;
  let height = 0;
  let dpr = 1;
  let starPool = [];
  let densityField = new Uint8Array(0);
  let densityWidth = 0;
  let densityHeight = 0;
  let raf = 0;
  let lastFrame = 0;
  let lastEnvironmentRead = 0;
  let lastCanvasStateSync = 0;
  let frameCount = 0;
  let totalDrawMs = 0;
  let lastDrawMs = 0;
  let maxDrawMs = 0;
  let environmentChanges = 0;
  let starConfig = readStarConfig();
  let starColor = hexToRgb(starConfig.color);
  let starColor2 = hexToRgb(starConfig.color2);
  let starBreathColor = hexToRgb(starConfig.breathColor);
  let physicalStarPalette = null;
  let targetEnvironment = readEnvironment();
  let environment = {...targetEnvironment};
  // PASS18 remains the astronomical owner. The approved continuum is a bounded
  // two-slot video pipeline controlled from this owner, never a second canvas.
  const cosmicContinuumOwner = 'RUCA_COSMIC_CONTINUUM';
  const cosmicContinuumClips = Object.freeze([
    {id:'U01-U02',src:'assets/cosmic-continuum/U01-U02-fracture-consumption.mp4'},
    {id:'U02-U03',src:'assets/cosmic-continuum/U02-U03-stellar-nucleation.mp4'},
    {id:'U03-U04',src:'assets/cosmic-continuum/U03-U04-molecular-dark-invasion.mp4'},
    {id:'U04-U05',src:'assets/cosmic-continuum/U04-U05-gravitational-fold.mp4'},
    {id:'U05-U01',src:'assets/cosmic-continuum/U05-U01-particle-reconstruction.mp4'}
  ]);
  const cosmicContinuum = {root:null,slots:[],activeSlot:0,clipIndex:0,started:false,reduced:false,active:false};

  function clamp(value, min, max){
    const n = Number(value);
    if(!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function cssValue(name, fallback){
    const value = getComputedStyle(root).getPropertyValue(name).trim();
    return value || fallback;
  }

  function readStarConfig(override={}){
    return {
      color: override.starColor || cssValue('--ruca-theme-stars', '#ff0000'),
      color2: override.starColor2 || cssValue('--ruca-theme-particles', '#ff0000'),
      breathColor: override.starBreathColor || cssValue('--ruca-theme-aura', '#fa0000'),
      brightness: clamp(override.starBrightness ?? cssValue('--ruca-star-brightness', 78), 0, 100),
      density: clamp(override.starDensity ?? cssValue('--ruca-star-density', 82), 0, 100),
      breath: clamp(override.starBreath ?? cssValue('--ruca-star-breath', 28), 0, 100),
      drift: clamp(override.starDrift ?? cssValue('--ruca-star-drift', 24), 0, 100),
      motion: clamp(override.motion ?? cssValue('--ruca-motion-level', 42), 0, 100),
      uiDensity: clamp(override.uiDensity ?? cssValue('--ruca-density-level', 64), 0, 100),
      depth: clamp(override.depth ?? cssValue('--ruca-bg-depth', 64), 0, 100),
      reducedMotion: override.reducedMotion ?? false
    };
  }

  function hexToRgb(value){
    const fallback = {r:245, g:217, b:143};
    const text = String(value || '').trim().replace('#','');
    if(/^[0-9a-f]{3}$/i.test(text)){
      return {
        r: parseInt(text[0] + text[0], 16),
        g: parseInt(text[1] + text[1], 16),
        b: parseInt(text[2] + text[2], 16)
      };
    }
    if(/^[0-9a-f]{6}$/i.test(text)){
      return {
        r: parseInt(text.slice(0,2), 16),
        g: parseInt(text.slice(2,4), 16),
        b: parseInt(text.slice(4,6), 16)
      };
    }
    return fallback;
  }

  function applyStarConfig(override={}){
    starConfig = readStarConfig(override);
    starColor = hexToRgb(starConfig.color);
    starColor2 = hexToRgb(starConfig.color2);
    starBreathColor = hexToRgb(starConfig.breathColor);
    syncPhysicalStarPalette();
    lastCanvasStateSync = 0;
    syncEnvironment(performance.now(), true);
    if(!starPool.length) buildStarPool();
    draw(performance.now(), 0);
    start();
  }

  function layerForRoll(roll){
    if(roll < layers[0].share) return layers[0];
    if(roll < layers[0].share + layers[1].share) return layers[1];
    return layers[2];
  }

  function magnitudeForRoll(roll){
    let threshold = 0;
    for(const magnitude of magnitudeClasses){
      threshold += magnitude.share;
      if(roll <= threshold) return magnitude;
    }
    return magnitudeClasses[magnitudeClasses.length - 1];
  }

  function randomBetween(range, unit){
    return range[0] + unit * (range[1] - range[0]);
  }

  function starRandom(star){
    star.rngState = (Math.imul(star.rngState, 1664525) + 1013904223) >>> 0;
    return star.rngState / 4294967296;
  }

  function gaussianOffset(star){
    const u = Math.max(.0001, starRandom(star));
    const v = Math.max(.0001, starRandom(star));
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * v);
  }

  function hashNoise(x,y,seed=0){
    let value=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(seed,1442695041))|0;
    value=Math.imul(value^(value>>>13),1274126177);
    return ((value^(value>>>16))>>>0)/4294967295;
  }

  function smoothNoise(x,y,seed=0){
    const x0=Math.floor(x);
    const y0=Math.floor(y);
    const tx=x-x0;
    const ty=y-y0;
    const sx=tx*tx*(3-2*tx);
    const sy=ty*ty*(3-2*ty);
    const a=hashNoise(x0,y0,seed);
    const b=hashNoise(x0+1,y0,seed);
    const c=hashNoise(x0,y0+1,seed);
    const d=hashNoise(x0+1,y0+1,seed);
    return (a+(b-a)*sx)+((c+(d-c)*sx)-(a+(b-a)*sx))*sy;
  }

  function fractalDensity(x,y,seed=0){
    let amplitude=.54;
    let frequency=1;
    let total=0;
    let normalization=0;
    for(let octave=0;octave<volumetricDensityModel.octaves;octave+=1){
      total+=smoothNoise(x*frequency,y*frequency,seed+octave*31)*amplitude;
      normalization+=amplitude;
      amplitude*=.51;
      frequency*=2.03;
    }
    return total/normalization;
  }

  function blackbodyRgb(kelvin){
    const temperature=clamp(kelvin,1800,12000)/100;
    let red;
    let green;
    let blue;
    if(temperature<=66){
      red=255;
      green=99.4708025861*Math.log(temperature)-161.1195681661;
      blue=temperature<=19 ? 0 : 138.5177312231*Math.log(temperature-10)-305.0447927307;
    }else{
      red=329.698727446*Math.pow(temperature-60,-.1332047592);
      green=288.1221695283*Math.pow(temperature-60,-.0755148492);
      blue=255;
    }
    return {r:clamp(red,0,255),g:clamp(green,0,255),b:clamp(blue,0,255)};
  }

  function resetStar(star, atHorizon=false){
    const profile = star.particleType ? particleProfiles[star.particleType] : null;
    const clusterBias = profile?.clusterBias ?? (star.layer.id === 'far' ? .18 : star.layer.id === 'mid' ? .34 : .48);
    if(starRandom(star) < clusterBias){
      const association = stellarAssociations[Math.floor(starRandom(star) * stellarAssociations.length)];
      const core = association.cores[Math.floor(starRandom(star) * association.cores.length)];
      const localSpread=association.spread*core[2];
      star.x = Math.max(-1.06, Math.min(1.06, association.x+core[0]+gaussianOffset(star)*localSpread));
      star.y = Math.max(-1.06, Math.min(1.06, association.y+core[1]+gaussianOffset(star)*localSpread));
    }else{
      star.x = (starRandom(star) * 2 - 1) * 1.06;
      star.y = (starRandom(star) * 2 - 1) * 1.06;
    }
    const depthRange = star.layer.id === 'far'
      ? (atHorizon ? [1.36,1.72] : [.92,1.72])
      : star.layer.id === 'mid'
        ? (atHorizon ? [1.16,1.44] : [.52,1.34])
        : (atHorizon ? [1.02,1.22] : [.20,.92]);
    star.z = randomBetween(depthRange, starRandom(star));
    star.radius = randomBetween(star.layer.radius, starRandom(star)) * star.magnitude.radius;
    star.alpha = randomBetween(star.layer.alpha, starRandom(star)) * star.magnitude.luminance;
    star.phase = starRandom(star) * Math.PI * 2;
    star.life = profile ? randomBetween(profile.lifetime, starRandom(star)) : Infinity;
    star.orientation=starRandom(star)*Math.PI*2;
    star.spin=(starRandom(star)*2-1)*(.08+(profile?.velocity||.1)*.18);
    if(profile){
      const vertices=5+Math.floor(starRandom(star)*4);
      star.massProfile=Array.from({length:vertices},()=>.72+starRandom(star)*.44);
    }
    star.previousX = NaN;
    star.previousY = NaN;
  }

  function buildStarPool(){
    const area = Math.max(1, width * height);
    const count = Math.min(4600, Math.max(1200, Math.round(area / 560)));
    let poolState = (0x52554341 ^ Math.imul(width, 73856093) ^ Math.imul(height, 19349663)) >>> 0;
    let particleCount = 0;
    let glintCount = 0;
    const poolRandom = () => {
      poolState = (Math.imul(poolState, 1664525) + 1013904223) >>> 0;
      return poolState / 4294967296;
    };
    starPool = Array.from({length:count}, (_, index) => {
      const layer = layerForRoll(poolRandom());
      let particleType = '';
      if(particleCount < 48 && poolRandom() < .065){
        const particleRoll = poolRandom();
        particleType = particleRoll < .58
          ? 'dust'
          : particleRoll < .76
            ? 'ion'
            : particleRoll < .92
              ? 'plasma'
              : 'debris';
        particleCount += 1;
      }
      const magnitude = magnitudeForRoll(poolRandom());
      const temperatureRoll = poolRandom();
      const temperatureKelvin = temperatureRoll < .22
        ? 2800+poolRandom()*1800
        : temperatureRoll < .80
          ? 4800+poolRandom()*2200
          : 7200+poolRandom()*3600;
      const glint = magnitude.id === 'A' && glintCount < 6;
      if(glint) glintCount += 1;
      const star = {
        layer,
        magnitude,
        temperatureKelvin,
        particleType,
        glint,
        rngState:(poolState ^ Math.imul(index + 1, 2654435761)) >>> 0
      };
      resetStar(star, false);
      return star;
    });
  }

  function readEnvironment(){
    const world = body.dataset.world || 'home';
    const base = worldProfiles[world] || worldProfiles.home;
    let density = base.density;
    let speed = base.speed;
    let haze = base.haze;
    let key = world;
    if(world === 'live'){
      const liveRoot = document.querySelector('#laneStage > .live-world-render-root');
      const lane = liveRoot?.dataset.world || document.querySelector('#laneStage')?.dataset.lane || 'weather';
      const condition = liveRoot?.dataset.condition || 'neutral';
      const laneProfile = liveProfiles[lane] || liveProfiles.weather;
      density *= laneProfile.density;
      speed *= laneProfile.speed;
      haze = Math.max(haze, laneProfile.haze);
      key = `live:${lane}`;
      if(lane === 'weather'){
        const conditionProfile = conditionProfiles[condition] || conditionProfiles.neutral;
        density *= conditionProfile.density;
        speed *= conditionProfile.speed;
        haze = Math.max(haze, conditionProfile.haze);
        key += `:${condition}`;
      }
    }
    return {key, density, speed, haze, centerX:base.centerX, centerY:base.centerY};
  }

  function syncEnvironment(now, force=false){
    if(!force && now - lastEnvironmentRead < 420) return;
    lastEnvironmentRead = now;
    const next = readEnvironment();
    if(next.key !== targetEnvironment.key) environmentChanges += 1;
    targetEnvironment = next;
  }

  function isReduced(){
    return motionQuery.matches || starConfig.reducedMotion === true;
  }

  function setCosmicClip(slotIndex, clipIndex){
    const slot=cosmicContinuum.slots[slotIndex];
    const clip=cosmicContinuumClips[clipIndex];
    if(!slot || slot.dataset.clipId===clip.id) return;
    slot.pause();
    slot.removeAttribute('src');
    slot.src=clip.src;
    slot.dataset.clipId=clip.id;
    slot.load();
  }

  function showCosmicSlot(slotIndex){
    cosmicContinuum.activeSlot=slotIndex;
    cosmicContinuum.slots.forEach((slot,index)=>slot.classList.toggle('is-active',index===slotIndex));
    const current=cosmicContinuumClips[cosmicContinuum.clipIndex];
    cosmicContinuum.root.dataset.clip=current.id;
    cosmicContinuum.root.dataset.nextClip=cosmicContinuumClips[(cosmicContinuum.clipIndex+1)%cosmicContinuumClips.length].id;
  }

  function advanceCosmicContinuum(){
    if(!cosmicContinuum.active || cosmicContinuum.reduced) return;
    const retiring=cosmicContinuum.activeSlot;
    const incoming=(retiring+1)%2;
    cosmicContinuum.clipIndex=(cosmicContinuum.clipIndex+1)%cosmicContinuumClips.length;
    showCosmicSlot(incoming);
    const incomingVideo=cosmicContinuum.slots[incoming];
    incomingVideo.currentTime=0;
    incomingVideo.play().catch(()=>{});
    setCosmicClip(retiring,(cosmicContinuum.clipIndex+1)%cosmicContinuumClips.length);
  }

  function ensureCosmicContinuum(){
    if(cosmicContinuum.root) return;
    const root=document.createElement('div');
    root.id='rucaCosmicContinuum';
    root.dataset.owner=cosmicContinuumOwner;
    root.dataset.videoSlots='2';
    root.setAttribute('aria-hidden','true');
    for(let index=0;index<2;index+=1){
      const video=document.createElement('video');
      video.className='ruca-cosmic-continuum-video';
      video.muted=true;
      video.defaultMuted=true;
      video.playsInline=true;
      video.preload='auto';
      video.tabIndex=-1;
      video.addEventListener('ended',()=>{if(index===cosmicContinuum.activeSlot) advanceCosmicContinuum();});
      root.appendChild(video);
      cosmicContinuum.slots.push(video);
    }
    canvas.insertAdjacentElement('afterend',root);
    cosmicContinuum.root=root;
    setCosmicClip(0,0);
    setCosmicClip(1,1);
    showCosmicSlot(0);
  }

  function syncCosmicContinuum(reduced){
    const playDeck=document.querySelector('#page-play[data-media-deck-active="true"]');
    const active=targetEnvironment.key==='play' && !!playDeck;
    ensureCosmicContinuum();
    cosmicContinuum.active=active;
    cosmicContinuum.reduced=reduced;
    cosmicContinuum.root.hidden=!active;
    cosmicContinuum.root.dataset.active=active ? '1' : '0';
    cosmicContinuum.root.dataset.reduced=reduced ? '1' : '0';
    if(!active){
      cosmicContinuum.slots.forEach(slot=>slot.pause());
      return;
    }
    if(reduced){
      cosmicContinuum.slots.forEach(slot=>slot.pause());
      return;
    }
    const current=cosmicContinuum.slots[cosmicContinuum.activeSlot];
    if(current.readyState>=2 && current.paused) current.play().catch(()=>{});
  }

  function desiredStarCount(){
    const homeGalaxy = targetEnvironment.key === 'home';
    const areaBase = Math.max(80, Math.round((width * height) / (homeGalaxy ? 1180 : 7000)));
    const effectiveDensity = starConfig.density * .55 + starConfig.uiDensity * .45;
    const userDensity = .55 + (effectiveDensity / 100) * 1.15;
    return Math.min(starPool.length, Math.max(64, Math.round(areaBase * userDensity * environment.density)));
  }

  function resize(){
    const dprCap = document.body.classList.contains('ruca-3dixon-lounge') ? 1 : 1.5;
    dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    width = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
    height = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rebuildGasSurface();
    buildStarPool();
    syncEnvironment(performance.now(), true);
    draw(performance.now(), 0);
  }

  function syncPhysicalStarPalette(){
    const textColor = hexToRgb(cssValue('--ruca-theme-primary-text', starConfig.color));
    const warningColor = hexToRgb(cssValue('--ruca-theme-warning', starConfig.color));
    const mixColor = (a,b,weight) => ({
      r:Math.round(a.r * (1 - weight) + b.r * weight),
      g:Math.round(a.g * (1 - weight) + b.g * weight),
      b:Math.round(a.b * (1 - weight) + b.b * weight)
    });
    // The explicit Stars token is the authority. Text and warning colors only
    // provide restrained temperature variance; they must not wash the selected
    // star color back toward the general UI palette.
    const neutral = mixColor(starColor, textColor, .18);
    const coolBase = mixColor(starColor, textColor, .24);
    physicalStarPalette = {
      warm:mixColor(neutral, warningColor, .18),
      neutral,
      cool:{
        r:Math.round(coolBase.r * .88),
        g:Math.round(coolBase.g * .96),
        b:Math.min(255, Math.round(coolBase.b * 1.06))
      }
    };
    if(width && height) rebuildGasSurface();
  }

  function physicalStarColor(star){
    const physical=blackbodyRgb(star.temperatureKelvin);
    const themeBias=star.temperatureKelvin < 4700
      ? physicalStarPalette?.warm || starColor
      : star.temperatureKelvin > 7100
        ? physicalStarPalette?.cool || starColor
        : physicalStarPalette?.neutral || starColor;
    const themeInfluence=star.layer.id === 'far' ? .08 : star.layer.id === 'mid' ? .24 : .46;
    return {
      r:Math.round(physical.r*(1-themeInfluence)+themeBias.r*themeInfluence),
      g:Math.round(physical.g*(1-themeInfluence)+themeBias.g*themeInfluence),
      b:Math.round(physical.b*(1-themeInfluence)+themeBias.b*themeInfluence)
    };
  }

  function rebuildGasSurface(){
  // RUCA // persistent gas topology
  // Preserve the original nebular composition across world navigation.
  if (
    window.__RUCA_GALAXY_GAS_INITIALIZED__ &&
    !window.__RUCA_GALAXY_FORCE_RESIZE_REBUILD__
  ) {
    return;
  }
  window.__RUCA_GALAXY_GAS_INITIALIZED__ = true;
    if(!gasCtx || !width || !height) return;
    const cacheWidth = Math.max(1, Math.ceil(width * gasCacheScale));
    const cacheHeight = Math.max(1, Math.ceil(height * gasCacheScale));
    gasSurface.width = cacheWidth;
    gasSurface.height = cacheHeight;
    densityWidth=cacheWidth;
    densityHeight=cacheHeight;
    densityField=new Uint8Array(cacheWidth*cacheHeight);
    const image=gasCtx.createImageData(cacheWidth,cacheHeight);
    const homeGalaxy=body.dataset.world === 'home';
    /* HOME keeps its cooler environmental depth independent from the red
       instrument palette, so the foreground retains clear thermal contrast. */
    const colorA=homeGalaxy ? {r:72,g:76,b:176} : starBreathColor;
    const colorB=homeGalaxy ? {r:64,g:132,b:224} : starColor2;
    const colorC=homeGalaxy ? {r:220,g:232,b:255} : starColor;
    for(let y=0;y<cacheHeight;y+=1){
      const v=y/Math.max(1,cacheHeight-1);
      for(let x=0;x<cacheWidth;x+=1){
        const u=x/Math.max(1,cacheWidth-1);
        const warpX=(fractalDensity(u*2.1+7.3,v*2.1-4.7,11)-.5)*.42;
        const warpY=(fractalDensity(u*2.1-3.8,v*2.1+9.2,29)-.5)*.42;
        let density=0;
        for(let slice=0;slice<volumetricDensityModel.depthSlices;slice+=1){
          const sliceScale=1.10+slice*.63;
          const layer=fractalDensity((u+warpX)*sliceScale*2.4,(v+warpY)*sliceScale*2.4,47+slice*43);
          const filament=Math.abs(fractalDensity((u-warpY)*4.2,(v+warpX)*4.2,101+slice*17)-.5)*2;
          density+=Math.max(0,layer-.46)*(1-filament*.38)/(1+slice*.34);
        }
        const radialFalloff=homeGalaxy
          ? Math.exp(-Math.pow(Math.hypot((u-.5)*.88,(v-.49)*.76),2.35))
          : homeGaugeClamp(1-Math.hypot((u-.5)*1.20,(v-.49)*1.08),0,1);
        if(homeGalaxy){
          const axis=(u-.5)*.92+(v-.47)*.38;
          const cross=(v-.47)*.92-(u-.5)*.38;
          const broadMass=Math.exp(-Math.pow(cross/.30,2))*Math.exp(-Math.pow(axis/.92,2));
          const cloudFragments=fractalDensity(axis*4.2+13,cross*10.4-17,173);
          const armFilaments=fractalDensity(axis*8.8-7,cross*21.6+11,211);
          const dustNoise=fractalDensity(axis*5.8-31,cross*18.2+19,241);
          const centralDust=Math.exp(-Math.pow((cross+(dustNoise-.5)*.055)/.050,2));
          const brokenClouds=Math.max(0,cloudFragments-.43)*1.72+Math.max(0,armFilaments-.51)*.92;
          const bandDensity=Math.max(0,broadMass*(.035+brokenClouds-centralDust*(.42+dustNoise*.34)));
          density=homeGaugeClamp(density*.10*radialFalloff+bandDensity*radialFalloff*1.62,0,1);
        }else{
          density=homeGaugeClamp(density*.53*radialFalloff,0,1);
        }
        const transmittance=Math.exp(-density*volumetricDensityModel.extinction);
        const scattering=(1-transmittance)*(homeGalaxy ? .54 : volumetricDensityModel.scattering);
        const emission=density*density*(homeGalaxy ? .34 : volumetricDensityModel.emission);
        const mixX=homeGaugeClamp(.18+u*.46+warpX*.12,0,1);
        const mixY=homeGaugeClamp(.16+v*.38+warpY*.12,0,1);
        let r=(colorA.r*(1-mixX)+colorB.r*mixX)*(1-mixY)+colorC.r*mixY;
        let g=(colorA.g*(1-mixX)+colorB.g*mixX)*(1-mixY)+colorC.g*mixY;
        let b=(colorA.b*(1-mixX)+colorB.b*mixX)*(1-mixY)+colorC.b*mixY;
        if(homeGalaxy){
          const chroma=fractalDensity(u*7.6+41,v*7.6-23,307);
          const violet=Math.max(0,chroma-.52)*1.65;
          const cobalt=Math.max(0,.56-chroma)*1.28;
          r=Math.min(255,r+violet*76-cobalt*14);
          g=Math.min(255,g+Math.max(0,chroma-.70)*28+cobalt*16);
          b=Math.min(255,b+violet*48+cobalt*62);
        }
        const index=(y*cacheWidth+x);
        const pixel=index*4;
        densityField[index]=Math.round(density*255);
        let pixelR=Math.round(r*(.28+scattering+emission*.42));
        let pixelG=Math.round(g*(.30+scattering+emission*.78));
        let pixelB=Math.round(b*(.34+scattering+emission*1.26));
        let pixelAlpha=homeGaugeClamp(scattering+emission,0,homeGalaxy ? .78 : .36);
        if(homeGalaxy){
          let hash=(Math.imul(x+1,374761393)^Math.imul(y+1,668265263))>>>0;
          hash=Math.imul(hash^(hash>>>13),1274126177)>>>0;
          const stellarHash=(hash^(hash>>>16))>>>0;
          const stellarRoll=stellarHash/4294967296;
          const stellarThreshold=.9988-Math.pow(density,1.18)*.105;
          if(stellarRoll>stellarThreshold){
            const hot=stellarRoll>.99972;
            const temperature=((stellarHash>>>8)&255)/255;
            pixelR=hot ? 255 : Math.round(164+temperature*72);
            pixelG=hot ? 255 : Math.round(194+temperature*52);
            pixelB=255;
            pixelAlpha=Math.max(pixelAlpha,hot ? .98 : .68+temperature*.24);
          }
        }
        image.data[pixel]=pixelR;
        image.data[pixel+1]=pixelG;
        image.data[pixel+2]=pixelB;
        image.data[pixel+3]=Math.round(pixelAlpha*255);
      }
    }
    gasCtx.setTransform(1,0,0,1,0,0);
    gasCtx.clearRect(0,0,cacheWidth,cacheHeight);
    gasCtx.putImageData(image,0,0);
    canvas.dataset.densityModel=volumetricDensityModel.name;
    canvas.dataset.densitySlices=String(volumetricDensityModel.depthSlices);
    canvas.dataset.densityOctaves=String(volumetricDensityModel.octaves);
  }

  function sampleGasDensity(x,y){
    if(!densityField.length || !width || !height) return 0;
    const ix=Math.max(0,Math.min(densityWidth-1,Math.floor((x/width)*densityWidth)));
    const iy=Math.max(0,Math.min(densityHeight-1,Math.floor((y/height)*densityHeight)));
    return densityField[iy*densityWidth+ix]/255;
  }

  function drawAmbient(now, reduced){
    const brightness = starConfig.brightness / 100;
    const depth = starConfig.depth / 100;
    const pulse = reduced ? 1 : 1 + Math.sin(now * .000075) * (.015 + starConfig.breath / 2500);
    const homeAmbientBoost = body.dataset.world === 'home' ? 1.74 : 1;
    const hazeAlpha = environment.haze * (.34 + brightness * .82) * (.55 + depth * .9) * pulse * homeAmbientBoost;
    const turbulence = reduced ? 0 : 1;
    const driftX = Math.sin(now * .000018 + .2) * width * .018 * turbulence;
    const driftY = Math.cos(now * .000014 + .34) * height * .014 * turbulence;
    const volumeScale = 1 + Math.sin(now * .000011 + .2) * .035 * turbulence;
    const volumeAngle = Math.sin(now * .000006 + .2) * .025 * turbulence;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = Math.min(.92, hazeAlpha);
    ctx.translate(
      width * environment.centerX + driftX,
      height * environment.centerY + driftY
    );
    ctx.rotate(volumeAngle);
    ctx.scale(volumeScale, volumeScale);
    ctx.drawImage(gasSurface, -width * .5, -height * .5, width, height);
    ctx.restore();
  }

  function draw(now, deltaSeconds=0){
    const drawStarted = performance.now();
    syncEnvironment(now);
    const blend = deltaSeconds > 0 ? Math.min(1, deltaSeconds * 1.8) : 1;
    environment.density += (targetEnvironment.density - environment.density) * blend;
    environment.speed += (targetEnvironment.speed - environment.speed) * blend;
    environment.haze += (targetEnvironment.haze - environment.haze) * blend;
    environment.centerX += (targetEnvironment.centerX - environment.centerX) * blend;
    environment.centerY += (targetEnvironment.centerY - environment.centerY) * blend;
    ctx.clearRect(0, 0, width, height);
    const reduced = isReduced();
    syncCosmicContinuum(reduced);
    drawAmbient(now, reduced);
    const activeCount = desiredStarCount();
    const depthAmount = starConfig.depth / 100;
    const focal = Math.min(width, height) * (.52 + depthAmount * .16);
    const centerX = width * environment.centerX;
    const centerY = height * environment.centerY;
    const brightness = starConfig.brightness / 100;
    const homeGalaxy = targetEnvironment.key === 'home';
    const breathAmount = reduced ? 0 : starConfig.breath / 100;
    const driftAmount = reduced ? 0 : starConfig.drift / 100;
    const motionAmount = reduced ? 0 : starConfig.motion / 100;
    const accelerationPulse = reduced
      ? 1
      : 1 + Math.sin(now * .0014) * (.08 + motionAmount * .12) + Math.sin(now * .00033) * .04;
    const motionScalar = reduced
      ? 0
      : (.65 + driftAmount * .8) * (.70 + motionAmount * .9) * accelerationPulse * environment.speed;
    const travelActive = body.classList.contains('ruca-world-travel-active');
    let brightHaloBudget = Math.min(6, Math.max(2, Math.round(activeCount / 80)));
    let particleBudget = Math.min(48, Math.max(6, Math.round(activeCount * .045)));
    for(let index = 0; index < activeCount; index += 1){
      const star = starPool[index];
      const particleProfile = star.particleType ? particleProfiles[star.particleType] : null;
      if(deltaSeconds > 0 && !reduced){
        const velocity = particleProfile
          ? particleProfile.velocity / (1 + particleProfile.drag)
          : 1;
        star.z -= star.layer.speed * motionScalar * velocity * deltaSeconds;
        if(particleProfile) star.life -= deltaSeconds;
      }
      let projectedX = centerX + (star.x / star.z) * focal * star.layer.parallax;
      let projectedY = centerY + (star.y / star.z) * focal * star.layer.parallax;
      if(star.z < .16 || star.life <= 0 || projectedX < -40 || projectedX > width + 40 || projectedY < -40 || projectedY > height + 40){
        resetStar(star, true);
        continue;
      }
      const breath = breathAmount ? 1 + Math.sin(now * .00055 + star.phase) * (.006 + breathAmount * .060 * star.layer.breath) : 1;
      const gasDensity=sampleGasDensity(projectedX,projectedY);
      const gasTransmission=Math.exp(-gasDensity*volumetricDensityModel.extinction);
      /* HOME resolves the band through stellar density: bright cloud regions
         accumulate fine stars while extinction gaps remain genuinely sparse. */
      const stellarFieldWeight=homeGalaxy ? .06+Math.pow(gasDensity,.72)*3.7 : gasTransmission;
      const alpha = Math.max(.004, Math.min(.98, star.alpha * (.015 + brightness * 1.65) * breath * stellarFieldWeight));
      const radius = star.radius * (.68 + (1 - Math.min(1, star.z)) * .82) * (.72 + brightness * .68);
      if(particleProfile){
        if(particleBudget <= 0) continue;
        particleBudget -= 1;
        const particleColor = star.particleType === 'plasma' ? starBreathColor : starColor2;
        const particleAlpha = alpha * particleProfile.opacity;
        ctx.save();
        ctx.translate(projectedX, projectedY);
        star.orientation+=star.spin*deltaSeconds;
        ctx.rotate(star.orientation);
        ctx.beginPath();
        const vertices=star.massProfile?.length||6;
        for(let vertex=0;vertex<vertices;vertex+=1){
          const angle=vertex*Math.PI*2/vertices;
          const massRadius=radius*(.78+particleProfile.mass*.44)*(star.massProfile?.[vertex]||1);
          const px=Math.cos(angle)*massRadius;
          const py=Math.sin(angle)*massRadius*(.46+particleProfile.mass*.18);
          if(vertex===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(${particleColor.r},${particleColor.g},${particleColor.b},${particleAlpha.toFixed(4)})`;
        ctx.fill();
        ctx.strokeStyle=`rgba(${Math.min(255,particleColor.r+42)},${Math.min(255,particleColor.g+42)},${Math.min(255,particleColor.b+42)},${(particleAlpha*.34).toFixed(4)})`;
        ctx.lineWidth=.45;
        ctx.stroke();
        ctx.restore();
        star.previousX = projectedX;
        star.previousY = projectedY;
        continue;
      }
      if(travelActive && star.layer.id !== 'far' && !reduced){
        const radialX = projectedX - centerX;
        const radialY = projectedY - centerY;
        const trailScale = (star.layer.id === 'near' ? .010 : .0035) * accelerationPulse * (.82 + motionAmount * .45);
        ctx.beginPath();
        ctx.moveTo(projectedX - radialX * trailScale, projectedY - radialY * trailScale);
        ctx.lineTo(projectedX, projectedY);
        ctx.strokeStyle = `rgba(${starColor.r},${starColor.g},${starColor.b},${(alpha * (star.layer.id === 'near' ? .34 : .14)).toFixed(4)})`;
        ctx.lineWidth = .42 + radius * .24;
        ctx.stroke();
      }
      const physicalColor = physicalStarColor(star);
      if(homeGalaxy){
        physicalColor.r=Math.round(physicalColor.r*.46+184*.54);
        physicalColor.g=Math.round(physicalColor.g*.56+211*.44);
        physicalColor.b=Math.round(physicalColor.b*.62+255*.38);
      }
      const renderHalo = brightHaloBudget > 0 && star.magnitude.halo >= .20 && alpha > .24;
      if(renderHalo){
        brightHaloBudget -= 1;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${physicalColor.r},${physicalColor.g},${physicalColor.b},${(alpha * star.magnitude.halo * .18).toFixed(4)})`;
        ctx.arc(projectedX, projectedY, radius * (2.2 + star.magnitude.halo), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.fillStyle = `rgba(${physicalColor.r},${physicalColor.g},${physicalColor.b},${alpha})`;
      ctx.arc(projectedX, projectedY, radius, 0, Math.PI * 2);
      ctx.fill();
      if(star.glint && renderHalo && alpha > .34){
        ctx.strokeStyle=`rgba(${physicalColor.r},${physicalColor.g},${physicalColor.b},${(alpha*.16).toFixed(4)})`;
        ctx.lineWidth=.45;
        ctx.beginPath();
        ctx.arc(projectedX,projectedY,radius*2.8,0,Math.PI*2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(projectedX-radius*3.8,projectedY);
        ctx.lineTo(projectedX+radius*3.8,projectedY);
        ctx.moveTo(projectedX,projectedY-radius*3.8);
        ctx.lineTo(projectedX,projectedY+radius*3.8);
        ctx.stroke();
      }
      star.previousX = projectedX;
      star.previousY = projectedY;
    }
    frameCount += 1;
    lastDrawMs = performance.now() - drawStarted;
    totalDrawMs += lastDrawMs;
    maxDrawMs = Math.max(maxDrawMs, lastDrawMs);
    if(now - lastCanvasStateSync >= 500 || !canvas.dataset.frameCount){
      lastCanvasStateSync = now;
      canvas.dataset.environment = targetEnvironment.key;
      canvas.dataset.activeStars = String(activeCount);
      canvas.dataset.layers = String(layers.length);
      canvas.dataset.magnitudeClasses = String(magnitudeClasses.length);
      canvas.dataset.stellarAssociations = String(stellarAssociations.length);
      canvas.dataset.particleProfiles = String(Object.keys(particleProfiles).length);
      canvas.dataset.particleGeometry = 'irregular-mass-profiles';
      canvas.dataset.gasExtinction = String(volumetricDensityModel.extinction);
      canvas.dataset.gasCache = `${gasSurface.width}x${gasSurface.height}`;
      canvas.dataset.motion = reduced ? 'reduced' : 'active';
      canvas.dataset.loopOwners = '1';
      canvas.dataset.targetFps = '30';
      canvas.dataset.frameCount = String(frameCount);
      canvas.dataset.averageDrawMs = (frameCount ? totalDrawMs / frameCount : 0).toFixed(3);
      canvas.dataset.maxDrawMs = maxDrawMs.toFixed(3);
      canvas.dataset.acceleration = accelerationPulse.toFixed(3);
      canvas.dataset.depth = starConfig.depth.toFixed(0);
      canvas.dataset.motionLevel = starConfig.motion.toFixed(0);
      canvas.dataset.uiDensity = starConfig.uiDensity.toFixed(0);
      canvas.dataset.starDensity = starConfig.density.toFixed(0);
      canvas.dataset.brightness = starConfig.brightness.toFixed(0);
      canvas.dataset.velocity = motionScalar.toFixed(3);
      canvas.dataset.cosmicOwner = cosmicContinuumOwner;
      canvas.dataset.cosmicActive = cosmicContinuum.active ? '1' : '0';
      canvas.dataset.cosmicReduced = cosmicContinuum.reduced ? '1' : '0';
      canvas.dataset.cosmicMode = 'approved-mp4-two-slot';
      canvas.dataset.cosmicClip = cosmicContinuum.root?.dataset.clip || 'U01-U02';
      canvas.dataset.cosmicNextClip = cosmicContinuum.root?.dataset.nextClip || 'U02-U03';
    }
  }

  function loop(now){
    raf = 0;
    if(document.hidden) return;
    if(isReduced()){
      draw(now || performance.now(), 0);
      return;
    }
    if(lastFrame && now - lastFrame < frameInterval){
      raf = requestAnimationFrame(loop);
      return;
    }
    const deltaSeconds = lastFrame ? Math.min(50, now - lastFrame) / 1000 : 0;
    lastFrame = now;
    draw(now, deltaSeconds);
    raf = requestAnimationFrame(loop);
  }

  function start(){
    if(raf || document.hidden) return;
    if(isReduced()){
      lastFrame = 0;
      canvas.dataset.running = '0';
      draw(performance.now(), 0);
      return;
    }
    lastFrame = 0;
    canvas.dataset.running = '1';
    raf = requestAnimationFrame(loop);
  }

  function stop(){
    if(raf) cancelAnimationFrame(raf);
    raf = 0;
    canvas.dataset.running = '0';
  }

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if(document.hidden) stop();
    else {
      syncEnvironment(performance.now(), true);
      start();
    }
  });
  document.addEventListener('ruca:starfield-config', event => {
    stop();
    applyStarConfig(event.detail || {});
  });

  if(motionQuery.addEventListener){
    motionQuery.addEventListener('change', () => {
      stop();
      starConfig = readStarConfig();
      starColor = hexToRgb(starConfig.color);
      starColor2 = hexToRgb(starConfig.color2);
      starBreathColor = hexToRgb(starConfig.breathColor);
      syncPhysicalStarPalette();
      lastCanvasStateSync = 0;
      draw(performance.now(), 0);
      start();
    });
  }

  window.RUCA_STARFIELD_ENGINE = Object.freeze({
    owner,
    cosmicOwner:cosmicContinuumOwner,
    renderer:'PASS58_PHYSICAL_ENVIRONMENT',
    version:'58.0.0',
    layers:layers.map(layer=>layer.id),
    pause:stop,
    resume:start,
    refresh(){
      starConfig = readStarConfig();
      starColor = hexToRgb(starConfig.color);
      starColor2 = hexToRgb(starConfig.color2);
      starBreathColor = hexToRgb(starConfig.breathColor);
      syncPhysicalStarPalette();
      syncEnvironment(performance.now(), true);
      draw(performance.now(), 0);
      start();
    },
    getState(){
      return {
        owner,
        renderer:'PASS58_PHYSICAL_ENVIRONMENT',
        version:'58.0.0',
        canvasCount:document.querySelectorAll('#rucaStarfield').length,
        loopOwners:1,
        targetFps:30,
        running:!!raf,
        reducedMotion:isReduced(),
        environment:targetEnvironment.key,
        environmentChanges,
        layers:layers.map(layer=>layer.id),
        stellarAssociations:stellarAssociations.length,
        magnitudeClasses:magnitudeClasses.length,
        densityModel:volumetricDensityModel.name,
        depthSlices:volumetricDensityModel.depthSlices,
        extinction:volumetricDensityModel.extinction,
        particleGeometry:'irregular-mass-profiles',
        poolSize:starPool.length,
        activeStars:desiredStarCount(),
        frameCount,
        averageDrawMs:frameCount ? totalDrawMs / frameCount : 0,
        lastDrawMs,
        maxDrawMs,
        width,
        height,
        dpr,
        cosmicContinuum:{
          owner:cosmicContinuumOwner,
          active:!!cosmicContinuum?.active,
          reduced:!!cosmicContinuum?.reduced,
          mode:'approved-mp4-two-slot',
          videoSlots:cosmicContinuum.slots.length,
          clip:cosmicContinuum.root?.dataset.clip || 'U01-U02',
          nextClip:cosmicContinuum.root?.dataset.nextClip || 'U02-U03'
        }
      };
    }
  });
  syncPhysicalStarPalette();
  resize();
  start();
}

initRucaStarfield();
