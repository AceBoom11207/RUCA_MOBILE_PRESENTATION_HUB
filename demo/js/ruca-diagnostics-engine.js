(function installRucaDiagnosticsEngine(root, factory){
  const api = factory();
  if(typeof module === 'object' && module.exports) module.exports = api;
  if(root) root.RUCADiagnosticsEngine = Object.freeze(api);
})(typeof globalThis !== 'undefined' ? globalThis : this, function createRucaDiagnosticsEngine(){
  'use strict';

  const APPROVED_STATES = Object.freeze([
    'NOMINAL',
    'ACTIVE',
    'ELEVATED',
    'LIMITED',
    'THROTTLED',
    'STALE',
    'NOT EXPOSED',
    'UNKNOWN'
  ]);
  const APPROVED_STATE_SET = new Set(APPROVED_STATES);
  const DOMAIN_ORDER = Object.freeze([
    'CPU',
    'GPU',
    'RAM',
    'MOTHERBOARD',
    'VRM',
    'THERMALS',
    'FANS',
    'PUMPS',
    'POWER',
    'STORAGE',
    'SMART',
    'NETWORK',
    'PCIe',
    'BUSES',
    'COOLING',
    'WINDOWS PERFORMANCE COUNTERS',
    'SUPPORTED EXTERNAL DEVICES',
    'UNCLASSIFIED'
  ]);

  function finite(value){
    if(value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function cleanUnit(value){
    return String(value || '')
      .replace(/\u00c2\u00b0/g, '\u00b0')
      .replace(/\u00e2\u201e\u0192|\u00e2\u201e\u2039/g, '\u00b0')
      .trim();
  }

  function approvedState(value, fallback='UNKNOWN'){
    const normalized = String(value || '').trim().toUpperCase().replace(/_/g, ' ');
    return APPROVED_STATE_SET.has(normalized) ? normalized : fallback;
  }

  function formatValue(value, unit=''){
    const number = finite(value);
    if(number === null) return 'NOT EXPOSED';
    const normalizedUnit = cleanUnit(unit);
    const magnitude = Math.abs(number);
    const maximumFractionDigits = magnitude >= 100 ? 0 : magnitude >= 10 ? 1 : 2;
    const rendered = number.toLocaleString('en-US', {maximumFractionDigits});
    if(!normalizedUnit) return rendered;
    if(normalizedUnit.startsWith('\u00b0') || normalizedUnit === '%' || normalizedUnit.startsWith('/')) return `${rendered}${normalizedUnit}`;
    return `${rendered} ${normalizedUnit}`;
  }

  function evidenceAction(state){
    if(state === 'STALE') return 'Refresh the HWiNFO source before using this value.';
    if(state === 'NOT EXPOSED') return 'Expose the sensor in HWiNFO if this channel is required.';
    if(state === 'UNKNOWN') return 'Verify the source value and hardware-group mapping.';
    if(state === 'THROTTLED' || state === 'LIMITED') return 'Inspect the directly exposed limit indicators before taking action.';
    if(state === 'ELEVATED') return 'Compare the current, average, and maximum from the same sensor.';
    return 'Continue observation; no action is inferred from this reading alone.';
  }

  function interpretation(state, behavior, reason){
    const finalState = approvedState(state);
    return {state:finalState, behavior, reason, action:evidenceAction(finalState)};
  }

  function interpretReading(reading={}){
    const label = String(reading.label || 'Unlabeled reading').trim();
    const unit = cleanUnit(reading.unit);
    const current = finite(reading.current);
    const sourceState = approvedState(reading.state, current === null ? 'UNKNOWN' : 'ACTIVE');
    const freshness = finite(reading.freshness_seconds);
    const valueLabel = formatValue(current, unit);
    const haystack = `${label} ${reading.reading_type || ''}`.toLowerCase();

    if(reading.stale === true || sourceState === 'STALE'){
      const age = freshness === null ? 'an unknown age' : `${freshness.toFixed(1)} seconds old`;
      return interpretation('STALE', 'STALE SAMPLE', `${label} is ${age}.`);
    }
    if(reading.available === false || current === null){
      const state = sourceState === 'NOT EXPOSED' ? 'NOT EXPOSED' : 'UNKNOWN';
      return interpretation(state, state === 'NOT EXPOSED' ? 'NOT EXPOSED' : 'VALUE UNKNOWN', `${label} has no finite current value.`);
    }

    const throttleSignal = /throttl|thermal limit/.test(haystack);
    const limitSignal = /performance limit|power limit|current limit|voltage limit|limit reason|perf cap/.test(haystack);
    if(throttleSignal || limitSignal){
      const asserted = current > 0;
      if(asserted && throttleSignal) return interpretation('THROTTLED', 'THROTTLE FLAG ASSERTED', `${label} reports ${valueLabel}.`);
      if(asserted) return interpretation('LIMITED', 'LIMIT FLAG ASSERTED', `${label} reports ${valueLabel}.`);
      return interpretation('NOMINAL', 'FLAG NOT ASSERTED', `${label} reports ${valueLabel}.`);
    }

    const percentUsage = unit === '%' && /usage|utilization|load|activity|occupancy|used/.test(haystack);
    if(percentUsage){
      if(current >= 90) return interpretation('ELEVATED', 'HIGH ACTIVITY', `${label} is ${valueLabel}; the RUCA observation band begins at 90%.`);
      if(current >= 25) return interpretation('ACTIVE', 'ACTIVE LOAD', `${label} is currently ${valueLabel}.`);
      return interpretation('NOMINAL', 'LIGHT ACTIVITY', `${label} is currently ${valueLabel}.`);
    }

    const temperature = String(reading.reading_type || '').toUpperCase() === 'TEMPERATURE' || /^\u00b0[CF]$/i.test(unit) || /temperature|hot ?spot|junction temp|\btemp\b/.test(haystack);
    if(temperature){
      if((unit.toUpperCase() === '\u00b0C' || !unit) && current >= 85){
        return interpretation('ELEVATED', 'HIGH TEMPERATURE READING', `${label} is ${valueLabel}; the RUCA observation band begins at 85\u00b0C, not a device limit.`);
      }
      return interpretation('ACTIVE', 'TEMPERATURE REPORTED', `${label} is currently ${valueLabel}; no device limit is inferred.`);
    }

    const rotation = String(reading.reading_type || '').toUpperCase() === 'FAN' || unit.toUpperCase() === 'RPM' || /\bfan\b|\bpump\b/.test(haystack);
    if(rotation){
      if(current === 0) return interpretation('UNKNOWN', 'ZERO-RPM READING', `${label} reports 0 RPM; stopped hardware and zero-RPM mode cannot be distinguished here.`);
      return interpretation('ACTIVE', 'ROTATION REPORTED', `${label} is currently ${valueLabel}.`);
    }

    if(/remaining life|remaining lifetime/.test(haystack) && unit === '%'){
      if(current <= 10) return interpretation('ELEVATED', 'LOW REMAINING-LIFE READING', `${label} reports ${valueLabel}.`);
      return interpretation('ACTIVE', 'LIFE READING EXPOSED', `${label} reports ${valueLabel}; RUCA does not convert it into a health claim.`);
    }
    if(/drive failure|critical warning|media errors?/.test(haystack) && current > 0){
      return interpretation('ELEVATED', 'DEVICE FLAG ASSERTED', `${label} reports ${valueLabel}.`);
    }

    if(sourceState === 'THROTTLED' || sourceState === 'LIMITED' || sourceState === 'ELEVATED'){
      return interpretation(sourceState, `${sourceState} READING`, `${label} reports ${valueLabel}.`);
    }
    return interpretation('ACTIVE', 'SAMPLE READING', `${label} reports ${valueLabel}.`);
  }

  function priorityForHeadline(reading){
    const label = String(reading.label || '').toLowerCase();
    const interpreted = reading.interpretation || interpretReading(reading);
    if(interpreted.state === 'THROTTLED') return 120;
    if(interpreted.state === 'LIMITED') return 110;
    if(/total (cpu|gpu) usage|memory load|physical memory load|core load|utilization/.test(label)) return 100;
    if(/package temperature|gpu temperature|hot ?spot|junction/.test(label)) return 90;
    if(/remaining life|critical warning|drive failure/.test(label)) return 80;
    if(/power|clock|fan|pump/.test(label)) return 60;
    return reading.current === null ? 0 : 20;
  }

  function pickHeadline(readings=[]){
    return [...readings].sort((left,right)=>priorityForHeadline(right)-priorityForHeadline(left))[0] || null;
  }

  function normalizeInventory(payload, now=Date.now()){
    if(!payload || typeof payload !== 'object' || Array.isArray(payload)){
      return {
        schemaVersion:'RUCA_PASS26C_DIAGNOSTICS_NORMALIZED_V1',
        state:'UNKNOWN',
        status:'UNKNOWN',
        reason:'The inventory payload is not an object.',
        live:false,
        source:'HWiNFO shared memory',
        timestamp:null,
        capturedAt:new Date(now).toISOString(),
        freshnessSeconds:null,
        readings:[],
        hardwareGroups:[],
        domains:[],
        domainMap:{},
        counts:{readings:0, available:0, stale:0, unknown:0, unclassified:0, hardwareGroups:0}
      };
    }

    const source = String(payload.source || 'HWiNFO shared memory');
    const timestamp = typeof payload.timestamp === 'string' ? payload.timestamp : null;
    const timestampMs = timestamp ? Date.parse(timestamp) : NaN;
    const computedFreshness = Number.isFinite(timestampMs) ? Math.max(0, (now - timestampMs) / 1000) : null;
    const declaredFreshness = finite(payload.freshness_seconds);
    const freshnessSeconds = computedFreshness === null ? declaredFreshness : Math.max(computedFreshness, declaredFreshness || 0);
    const staleAfter = finite(payload.stale_after_seconds) || 10;
    const sourceStale = approvedState(payload.state || payload.status) === 'STALE' || (freshnessSeconds !== null && freshnessSeconds > staleAfter);
    const rawReadings = Array.isArray(payload.readings) ? payload.readings : [];
    const readingIds = new Set();
    const readings = rawReadings.map((raw,index)=>{
      let id = String(raw?.id || `unidentified:${index}`);
      if(readingIds.has(id)){
        let ordinal = 2;
        while(readingIds.has(`${id}:ui-dup${ordinal}`)) ordinal += 1;
        id = `${id}:ui-dup${ordinal}`;
      }
      readingIds.add(id);
      const current = finite(raw?.current);
      const available = raw?.available !== false && current !== null;
      const state = sourceStale
        ? 'STALE'
        : approvedState(raw?.state, available ? 'ACTIVE' : 'UNKNOWN');
      const reading = {
        ...raw,
        id,
        label:String(raw?.label || `Unlabeled reading ${index + 1}`),
        unit:cleanUnit(raw?.unit),
        domain:DOMAIN_ORDER.includes(raw?.domain) ? raw.domain : 'UNCLASSIFIED',
        hardware_group:String(raw?.hardware_group || 'UNKNOWN HARDWARE GROUP'),
        hardware_group_id:String(raw?.hardware_group_id || `unknown-group:${raw?.hardware_group_index ?? index}`),
        source:String(raw?.source || source),
        current,
        minimum:finite(raw?.minimum),
        maximum:finite(raw?.maximum),
        average:finite(raw?.average),
        available,
        availability:available ? 'AVAILABLE' : String(raw?.availability || 'UNAVAILABLE').toUpperCase(),
        stale:sourceStale || raw?.stale === true,
        freshness_seconds:freshnessSeconds,
        state
      };
      reading.interpretation = interpretReading(reading);
      reading.state = reading.interpretation.state;
      return reading;
    });

    const domainMap = {};
    for(const domain of DOMAIN_ORDER){
      domainMap[domain] = {name:domain, count:0, availableCount:0, staleCount:0, devices:[], deviceMap:{}, readings:[], headline:null};
    }
    for(const reading of readings){
      const domain = domainMap[reading.domain] || domainMap.UNCLASSIFIED;
      domain.readings.push(reading);
      domain.count += 1;
      if(reading.available) domain.availableCount += 1;
      if(reading.state === 'STALE') domain.staleCount += 1;
      if(!domain.deviceMap[reading.hardware_group_id]){
        const device = {id:reading.hardware_group_id, name:reading.hardware_group, readings:[], headline:null};
        domain.deviceMap[reading.hardware_group_id] = device;
        domain.devices.push(device);
      }
      domain.deviceMap[reading.hardware_group_id].readings.push(reading);
    }
    for(const domain of Object.values(domainMap)){
      domain.headline = pickHeadline(domain.readings);
      for(const device of domain.devices) device.headline = pickHeadline(device.readings);
    }

    const hardwareGroups = Array.isArray(payload.hardware_groups) ? payload.hardware_groups.map(group=>({...group})) : [];
    const declaredState = approvedState(payload.state || payload.status, rawReadings.length ? 'ACTIVE' : 'NOT EXPOSED');
    const state = sourceStale ? 'STALE' : declaredState;
    return {
      schemaVersion:'RUCA_PASS26C_DIAGNOSTICS_NORMALIZED_V1',
      sourceSchemaVersion:String(payload.schema_version || ''),
      state,
      status:state,
      reason:String(payload.reason || (readings.length ? 'HWiNFO inventory exposed.' : 'No HWiNFO readings are exposed.')),
      live:state === 'ACTIVE' || state === 'LIMITED',
      source,
      timestamp,
      capturedAt:payload.captured_at || new Date(now).toISOString(),
      freshnessSeconds,
      staleAfterSeconds:staleAfter,
      readings,
      hardwareGroups,
      domains:DOMAIN_ORDER.map(name=>domainMap[name]),
      domainMap,
      duplicateIds:{...(payload.duplicate_ids || {})},
      counts:{
        readings:readings.length,
        available:readings.filter(reading=>reading.available).length,
        stale:readings.filter(reading=>reading.state === 'STALE').length,
        unknown:readings.filter(reading=>reading.state === 'UNKNOWN').length,
        unclassified:domainMap.UNCLASSIFIED.count,
        hardwareGroups:Number(payload.hardware_group_count ?? hardwareGroups.length)
      }
    };
  }

  return {
    APPROVED_STATES,
    DOMAIN_ORDER,
    approvedState,
    formatValue,
    interpretReading,
    normalizeInventory,
    pickHeadline
  };
});
