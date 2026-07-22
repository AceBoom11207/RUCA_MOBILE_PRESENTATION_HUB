// RUCA OS // Canonical Working Build PASS01
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

const RUCA_LOUNGE_PROFILE_ID = 'RUCA_3DIXON_LOUNGE';
const RUCA_CONTINUITY_PROFILE_KEY = 'rucaContinuityRuntimeProfile';
const RUCA_RUNTIME_PARAMS = new URLSearchParams(window.location.search);
const RUCA_REQUESTED_PROFILE_ID = RUCA_RUNTIME_PARAMS.get('profile') || '';
const RUCA_RECOVERY_BOOT = RUCA_RUNTIME_PARAMS.get('recovery') === '1';
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
    ready:Promise.resolve(null)
  });
}

const system = {
  name: 'Dixon-Hoirtuot',
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
    deep:[['Adapter','Public demo','Fixture mapped'],['Source','Browser local','Deterministic sample'],['Stream State','Stable','No disconnect'],['Game Latency','Unavailable','No device access'],['Packet Risk','Unavailable','No network probe'],['Router Check','Not available','Public simulation']],
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
  const current = window.history.state;
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
  if(activeTransition){
    continuityState.navigation.transition = null;
    continuityEmit('transition-interrupted', {reason, from:activeTransition.from, to:activeTransition.to});
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
    return true;
  }
  const returningHome = target === 'home' && current !== 'home';
  const travelMs = options.instant || reducedFlightMotion() ? 0 : (options.travelMs ?? PASS16E_TRAVEL_MS);
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
  document.body.dataset.flightTarget = target;
  document.body.dataset.flightDirection = returningHome ? 'return' : 'outbound';
  document.body.dataset.continuityTransition = 'travel';
  document.body.classList.add('core-transitioning', 'flight-spooling', returningHome ? 'flight-returning' : 'flight-diving', `core-pending-${target}`);
  const selected = coreBeacons.find(b => b.dataset.coreRoute === target);
  selected?.classList.add('is-selected');
  continuityEmit('transition-started', {from:current, to:target, source:options.source || 'route'});
  window.RUCA_AUDIO?.cue?.('confirm');
  coreTransitionTimer = window.setTimeout(() => {
    if(coreTransitionSequence !== transitionId || continuityState.navigation.transition?.id !== transitionId) return;
    nav(target, options);
    document.body.classList.remove('core-transitioning', 'flight-spooling', 'flight-diving', 'flight-returning', `core-pending-${target}`);
    document.body.classList.add('core-arriving', 'flight-arriving');
    document.body.dataset.continuityTransition = 'settle';
    continuityState.navigation.transition = {...continuityState.navigation.transition, phase:'settle'};
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
    }, reducedFlightMotion() ? 0 : PASS16E_SETTLE_MS);
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
syncCoreBeacons(document.body.dataset.world || 'home');
window.addEventListener('popstate', continuityHandleShellPopstate);
continuityInitializeShellHistory();

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
let currentCommandFilter = 'all';
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
    ? {label:`LAUNCH ${item.name.toUpperCase()}`, action:'play-launch', commandId:item.id, target:'primary'}
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
    'Production Rule': 'The bridge accepts this allowlisted command ID only. No browser-supplied path or shell command is accepted.',
    'Next Action': item.action
  }, item.primaryAvailable
    ? 'The registered launch target is available. RUCA reports process creation or OS handoff truthfully.'
    : 'The primary application is unavailable. Any alternate action below is a separately verified destination.',
  {kind:'play-command', commandId:item.id, actions});
}

$('#commandFavoriteToggle')?.addEventListener('click', event=>updateFavoriteState(event.currentTarget.dataset.appId));
$$('.command-filter-btn').forEach(button=>button.addEventListener('click',()=>applyCommandOrbitFilter(button.dataset.commandFilter)));
document.addEventListener('ruca:play-selection-change',event=>syncCommandFavoriteToggle(event.detail?.appId || ''));

async function loadPlayCommandRegistry(){
  const payload = window.RUCA_PUBLIC_COMMAND_REGISTRY;
  if(!Array.isArray(payload?.commands) || payload.commands.length !== 39) throw new Error('PASS19 registry did not provide exactly 39 commands.');
  appRegistry = payload.commands.map(hydratePlayCommand);
  appRegistryById = new Map(appRegistry.map(app=>[app.id,app]));
  appRegistryByName = new Map(appRegistry.map(app=>[app.name,app]));
  const defaultFavoriteIds = appRegistry.filter(app=>app.favorite).map(app=>app.id);
  favoriteAppIds = new Set(readPlayList(PLAY_FAVORITES_KEY, defaultFavoriteIds));
  recentAppIds = readPlayList(PLAY_RECENTS_KEY, ['steam','spotify','figma','chrome']);
  if(appsGrid) appsGrid.innerHTML = appRegistry.map(renderAppCard).join('');
  const commandCore = $('#commandWheelAction');
  if(commandCore){
    commandCore.dataset.rucaAction = 'play-detail';
    commandCore.dataset.rucaActionContract = 'Open selected PLAY command detail';
  }
  syncFilterCounts();
  applyCommandOrbitFilter('all',{preferredAppId:appRegistry[0]?.id});
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
  console.error('RUCA public command registry failed to load.', error);
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
$('.system-heart').addEventListener('click', armCoreBeacons);

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
  const canvas = document.getElementById('rucaStarfield');
  if(!canvas || !canvas.getContext) return;
  const owner = 'PASS18_CANONICAL_STARFIELD_ENGINE';
  const frameInterval = 1000 / 30;
  if(canvas.dataset.environmentOwner) return;
  canvas.dataset.environmentOwner = owner;
  const ctx = canvas.getContext('2d', { alpha: true });
  if(!ctx) return;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const body = document.body;
  const layers = [
    {id:'far', share:.46, speed:.012, radius:[.48,.92], alpha:[.36,.66], parallax:.68},
    {id:'mid', share:.36, speed:.028, radius:[.72,1.38], alpha:[.48,.78], parallax:1},
    {id:'near', share:.18, speed:.058, radius:[1.05,2.20], alpha:[.65,.96], parallax:1.28}
  ];
  const worldProfiles = {
    home:        {density:1.18, speed:1.05, haze:.15, centerX:.50, centerY:.47},
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
  let targetEnvironment = readEnvironment();
  let environment = {...targetEnvironment};

  function clamp(value, min, max){
    const n = Number(value);
    if(!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function cssValue(name, fallback){
    const value = getComputedStyle(root).getPropertyValue(name).trim();
    return value || fallback;
  }

  function storedTheme(){
    try{
      return JSON.parse(localStorage.getItem('rucaTheme') || '{}') || {};
    }catch(err){
      return {};
    }
  }

  function readStarConfig(override={}){
    const stored = storedTheme();
    return {
      color: override.starColor || stored.starColor || cssValue('--ruca-star-color', '#f5d98f'),
      color2: override.starColor2 || stored.starColor2 || cssValue('--ruca-star-secondary', '#61b7ff'),
      brightness: clamp(override.starBrightness ?? stored.starBrightness ?? cssValue('--ruca-star-brightness', 78), 0, 100),
      density: clamp(override.starDensity ?? stored.starDensity ?? cssValue('--ruca-star-density', 82), 0, 100),
      breath: clamp(override.starBreath ?? stored.starBreath ?? cssValue('--ruca-star-breath', 28), 0, 100),
      drift: clamp(override.starDrift ?? stored.starDrift ?? cssValue('--ruca-star-drift', 24), 0, 100),
      motion: clamp(override.motion ?? stored.motion ?? cssValue('--ruca-motion-level', 42), 0, 100),
      uiDensity: clamp(override.uiDensity ?? stored.density ?? cssValue('--ruca-density-level', 64), 0, 100),
      depth: clamp(override.depth ?? stored.depth ?? cssValue('--ruca-bg-depth', 64), 0, 100),
      reducedMotion: override.reducedMotion ?? stored.reducedMotion ?? false
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

  function randomBetween(range){
    return range[0] + Math.random() * (range[1] - range[0]);
  }

  function resetStar(star, atHorizon=false){
    star.x = (Math.random() * 2 - 1) * 1.06;
    star.y = (Math.random() * 2 - 1) * 1.06;
    star.z = atHorizon ? 1.02 + Math.random() * .18 : .30 + Math.random() * .90;
    star.radius = randomBetween(star.layer.radius);
    star.alpha = randomBetween(star.layer.alpha);
    star.phase = Math.random() * Math.PI * 2;
    star.previousX = NaN;
    star.previousY = NaN;
  }

  function buildStarPool(){
    const area = Math.max(1, width * height);
    const count = Math.min(720, Math.max(240, Math.round(area / 3300)));
    starPool = Array.from({length:count}, (_, index) => {
      const layer = layerForRoll(Math.random());
      const star = {
        layer,
        tone:index % 17 === 0 ? 'white' : index % 7 === 0 ? 'cool' : 'accent',
        glint:index % 59 === 0
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

  function desiredStarCount(){
    const areaBase = Math.max(80, Math.round((width * height) / 7000));
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
    buildStarPool();
    syncEnvironment(performance.now(), true);
    draw(performance.now(), 0);
  }

  function drawAmbient(now, reduced){
    const brightness = starConfig.brightness / 100;
    const depth = starConfig.depth / 100;
    const pulse = reduced ? 1 : 1 + Math.sin(now * .000075) * (.015 + starConfig.breath / 2500);
    const hazeAlpha = environment.haze * (.34 + brightness * .82) * (.55 + depth * .9) * pulse;
    const radius = Math.max(width, height) * .78;
    const centerX = width * environment.centerX;
    const centerY = height * environment.centerY;
    const core = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    core.addColorStop(0, `rgba(${starColor.r},${starColor.g},${starColor.b},${(hazeAlpha * .72).toFixed(4)})`);
    core.addColorStop(.36, `rgba(${starColor2.r},${starColor2.g},${starColor2.b},${(hazeAlpha * .24).toFixed(4)})`);
    core.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, width, height);

    const rim = ctx.createRadialGradient(width * .18, height * .20, 0, width * .18, height * .20, radius * .52);
    rim.addColorStop(0, `rgba(${starColor2.r},${starColor2.g},${starColor2.b},${(hazeAlpha * .16).toFixed(4)})`);
    rim.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rim;
    ctx.fillRect(0, 0, width, height);
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
    drawAmbient(now, reduced);
    const activeCount = desiredStarCount();
    const depthAmount = starConfig.depth / 100;
    const focal = Math.min(width, height) * (.52 + depthAmount * .16);
    const centerX = width * environment.centerX;
    const centerY = height * environment.centerY;
    const brightness = starConfig.brightness / 100;
    const breathAmount = reduced ? 0 : starConfig.breath / 100;
    const driftAmount = reduced ? 0 : starConfig.drift / 100;
    const motionAmount = reduced ? 0 : starConfig.motion / 100;
    const accelerationPulse = reduced
      ? 1
      : 1 + Math.sin(now * .0014) * (.08 + motionAmount * .12) + Math.sin(now * .00033) * .04;
    const motionScalar = reduced
      ? 0
      : (.65 + driftAmount * .8) * (.70 + motionAmount * .9) * accelerationPulse * environment.speed;
    for(let index = 0; index < activeCount; index += 1){
      const star = starPool[index];
      if(deltaSeconds > 0 && !reduced){
        star.z -= star.layer.speed * motionScalar * deltaSeconds;
      }
      const projectedX = centerX + (star.x / star.z) * focal * star.layer.parallax;
      const projectedY = centerY + (star.y / star.z) * focal * star.layer.parallax;
      if(star.z < .16 || projectedX < -40 || projectedX > width + 40 || projectedY < -40 || projectedY > height + 40){
        resetStar(star, true);
        continue;
      }
      const breath = breathAmount ? 1 + Math.sin(now * .00055 + star.phase) * (.012 + breathAmount * .045) : 1;
      const alpha = Math.max(.015, Math.min(.86, star.alpha * (.05 + brightness * .95) * breath));
      const radius = star.radius * (.68 + (1 - Math.min(1, star.z)) * .82);
      if(star.layer.id !== 'far' && !reduced){
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
      ctx.beginPath();
      ctx.fillStyle = star.tone === 'accent'
        ? `rgba(${starColor.r},${starColor.g},${starColor.b},${alpha})`
        : star.tone === 'cool'
          ? `rgba(${starColor2.r},${starColor2.g},${starColor2.b},${alpha * .58})`
          : `rgba(255,255,255,${alpha * .74})`;
      ctx.arc(projectedX, projectedY, radius, 0, Math.PI * 2);
      ctx.fill();
      if(star.glint && alpha > .34){
        ctx.fillRect(projectedX - radius * 2.2, projectedY, radius * 4.4, .34);
        ctx.fillRect(projectedX, projectedY - radius * 2, .34, radius * 4);
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
  window.addEventListener('storage', event => {
    if(event.key === 'rucaTheme'){
      stop();
      applyStarConfig();
    }
  });

  if(motionQuery.addEventListener){
    motionQuery.addEventListener('change', () => {
      stop();
      starConfig = readStarConfig();
      lastCanvasStateSync = 0;
      draw(performance.now(), 0);
      start();
    });
  }

  window.RUCA_STARFIELD_ENGINE = Object.freeze({
    owner,
    version:'18.0.0',
    layers:layers.map(layer=>layer.id),
    pause:stop,
    resume:start,
    refresh(){
      starConfig = readStarConfig();
      syncEnvironment(performance.now(), true);
      draw(performance.now(), 0);
      start();
    },
    getState(){
      return {
        owner,
        version:'18.0.0',
        canvasCount:document.querySelectorAll('#rucaStarfield').length,
        loopOwners:1,
        targetFps:30,
        running:!!raf,
        reducedMotion:isReduced(),
        environment:targetEnvironment.key,
        environmentChanges,
        layers:layers.map(layer=>layer.id),
        poolSize:starPool.length,
        activeStars:desiredStarCount(),
        frameCount,
        averageDrawMs:frameCount ? totalDrawMs / frameCount : 0,
        lastDrawMs,
        maxDrawMs,
        width,
        height,
        dpr
      };
    }
  });
  resize();
  start();
}

initRucaStarfield();
