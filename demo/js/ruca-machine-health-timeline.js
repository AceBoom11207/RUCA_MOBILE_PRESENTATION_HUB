(function installRucaMachineHealthTimeline(root, factory){
  const api = factory(root);
  if(typeof module === 'object' && module.exports) module.exports = api;
  if(root) root.RUCAMachineHealthTimeline = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createTimeline(root){
  'use strict';

  const SCHEMA = 'RUCA_PASS27B_MACHINE_HEALTH_TIMELINE_V2';
  const LEGACY_SCHEMA = 'RUCA_PASS27A_MACHINE_HEALTH_TIMELINE_V1';
  const ACKNOWLEDGEMENT_SCHEMA = 'RUCA_PASS27B_ACKNOWLEDGEMENT_REPORT_V2';
  const SESSION_KEY = 'ruca.pass27b.timeline';
  const LEGACY_SESSION_KEY = 'ruca.pass27a.timeline';
  const MAX_EVENTS = 240;
  const MAX_ACKNOWLEDGEMENT_REPORTS = 20;
  const CORRELATION_WINDOW_MS = 10000;
  const ALLOWED_STATES = Object.freeze(['NOMINAL','ACTIVE','ELEVATED','LIMITED','THROTTLED','STALE','NOT EXPOSED','UNKNOWN']);
  const CONDITION_STATES = new Set(['ELEVATED','LIMITED','THROTTLED','STALE','NOT EXPOSED','UNKNOWN']);
  const RECOVERY_STATES = new Set(['NOMINAL','ACTIVE']);
  const STATE_PRIORITY = Object.freeze(['THROTTLED','ELEVATED','LIMITED','STALE','UNKNOWN','NOT EXPOSED','ACTIVE','NOMINAL']);
  const VALUE_CHANGE_MINIMUM = Object.freeze({
    TEMPERATURE:5,
    USAGE:20,
    POWER:25,
    FAN:400,
    CLOCK:500
  });

  function finite(value){
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function nowIso(clock=Date.now){
    return new Date(clock()).toISOString();
  }

  function normalizeState(value, reading={}){
    if(reading.stale === true) return 'STALE';
    const state = String(value || '').trim().toUpperCase().replace(/_/g,' ');
    if(reading.available === false && !['STALE','LIMITED','UNKNOWN'].includes(state)) return 'NOT EXPOSED';
    return ALLOWED_STATES.includes(state) ? state : 'UNKNOWN';
  }

  function readingState(reading={}){
    return normalizeState(reading.state || reading.interpretation?.state,reading);
  }

  function isConditionState(value){
    return CONDITION_STATES.has(normalizeState(value));
  }

  function classification(reading={}){
    if(reading.available === false || reading.current === null) return 'UNAVAILABLE';
    if(reading.calculated === true || /calculated|derived/i.test(String(reading.source_class || ''))) return 'CALCULATED';
    if(/reported|vendor/i.test(String(reading.source_class || ''))) return 'REPORTED';
    return 'MEASURED';
  }

  function confidence(reading={}){
    if(reading.stale || readingState(reading) === 'STALE') return 'LOW';
    if(reading.available === false || reading.current === null) return 'UNKNOWN';
    return classification(reading) === 'CALCULATED' ? 'MEDIUM' : 'HIGH';
  }

  function eventId(sequence, timestamp){
    return `ruca-event-${String(sequence).padStart(5,'0')}-${String(timestamp).replace(/[^0-9]/g,'').slice(0,14)}`;
  }

  function acknowledgementId(sequence, timestamp){
    return `ruca-ack-${String(sequence).padStart(4,'0')}-${String(timestamp).replace(/[^0-9]/g,'').slice(0,14)}`;
  }

  function groupId(sequence, timestamp){
    return `ruca-group-${String(sequence).padStart(5,'0')}-${String(timestamp).replace(/[^0-9]/g,'').slice(0,14)}`;
  }

  function tally(items, selector, fallback='UNCLASSIFIED'){
    const counts = new Map();
    for(const item of items){
      const selected = typeof selector === 'function' ? selector(item) : item?.[selector];
      const key = String(selected || fallback).trim() || fallback;
      counts.set(key,(counts.get(key) || 0) + 1);
    }
    return Object.fromEntries([...counts.entries()].sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0])));
  }

  function makeEvent(input, sequence, clock=Date.now){
    const timestamp = input.timestamp || nowIso(clock);
    const state = normalizeState(input.state);
    const acknowledgementRequired = typeof input.acknowledgementRequired === 'boolean'
      ? input.acknowledgementRequired
      : isConditionState(state) && String(input.kind || '').toUpperCase() !== 'RECOVERY';
    const resolvedAt = input.resolvedAt || null;
    const lifecycle = String(input.lifecycle || (resolvedAt ? 'RESOLVED' : acknowledgementRequired ? 'OPEN' : 'OBSERVATION')).toUpperCase();
    return {
      schema:SCHEMA,
      id:input.id || eventId(sequence,timestamp),
      sequence,
      timestamp,
      lastObservedAt:input.lastObservedAt || timestamp,
      observationCount:Math.max(1,Number(input.observationCount)||1),
      kind:String(input.kind || 'OBSERVATION').toUpperCase(),
      state,
      title:String(input.title || 'Machine evidence changed'),
      summary:String(input.summary || ''),
      readingId:String(input.readingId || ''),
      hardwareId:String(input.hardwareId || ''),
      hardwareName:String(input.hardwareName || ''),
      source:String(input.source || 'HWiNFO shared memory'),
      sourceClass:String(input.sourceClass || 'MEASURED').toUpperCase(),
      freshnessSeconds:finite(input.freshnessSeconds),
      samplingCadenceMs:finite(input.samplingCadenceMs),
      current:finite(input.current),
      previous:finite(input.previous),
      latestCurrent:finite(input.latestCurrent ?? input.current),
      unit:String(input.unit || ''),
      confidence:String(input.confidence || 'UNKNOWN').toUpperCase(),
      consequence:String(input.consequence || 'No consequence established.'),
      acknowledgementRequired,
      acknowledgedAt:input.acknowledgedAt || null,
      acknowledgementBatchId:input.acknowledgementBatchId || null,
      resolvedAt,
      resolvedEventId:input.resolvedEventId || null,
      resolution:input.resolution ? {...input.resolution} : null,
      stateTransitions:Array.isArray(input.stateTransitions) ? input.stateTransitions.map(item=>({...item})) : [],
      lifecycle
    };
  }

  function migrateEvent(input={}, fallbackSequence, clock=Date.now){
    const state = normalizeState(input.state);
    const legacyObservation = input.kind === 'VALUE_CHANGE' && RECOVERY_STATES.has(state);
    const acknowledgementRequired = legacyObservation
      ? false
      : typeof input.acknowledgementRequired === 'boolean'
      ? input.acknowledgementRequired
      : isConditionState(state) && input.lifecycle !== 'RESOLVED';
    const lifecycle = legacyObservation
      ? 'OBSERVATION'
      : input.resolvedAt || input.lifecycle === 'RESOLVED'
      ? 'RESOLVED'
      : input.acknowledgedAt || input.lifecycle === 'ACKNOWLEDGED'
        ? 'ACKNOWLEDGED'
        : acknowledgementRequired ? 'OPEN' : 'OBSERVATION';
    return makeEvent({...input,state,acknowledgementRequired,lifecycle},Number(input.sequence)||fallbackSequence,clock);
  }

  function meaningfulChange(previous, reading){
    if(!previous) return null;
    const beforeState = normalizeState(previous.state,previous);
    const afterState = readingState(reading);
    if(beforeState !== afterState){
      if(afterState === 'STALE') return {kind:'STALE',beforeState,afterState};
      if(afterState === 'NOT EXPOSED') return {kind:'AVAILABILITY_CHANGE',beforeState,afterState};
      if(isConditionState(afterState)) return {kind:'CONDITION',beforeState,afterState};
      if(isConditionState(beforeState) && RECOVERY_STATES.has(afterState)) return {kind:'RECOVERY',beforeState,afterState};
      return {kind:'STATE_CHANGE',beforeState,afterState};
    }
    const before = finite(previous.current);
    const after = finite(reading.current);
    if(before === null || after === null) return before === after ? null : {kind:'AVAILABILITY_CHANGE',beforeState,afterState};
    const readingType = String(reading.reading_type || '').toUpperCase();
    const threshold = VALUE_CHANGE_MINIMUM[readingType] ?? (reading.unit === '%' ? 20 : null);
    if(threshold === null || Math.abs(after-before) < threshold) return null;
    return {kind:'VALUE_CHANGE',delta:after-before,beforeState,afterState};
  }

  function highestPriorityState(events){
    for(const state of STATE_PRIORITY){
      if(events.some(event=>normalizeState(event.state)===state)) return state;
    }
    return 'UNKNOWN';
  }

  function finalizeGroup(events, windowMs=CORRELATION_WINDOW_MS){
    const ordered=[...events].sort((a,b)=>Date.parse(a.timestamp)-Date.parse(b.timestamp) || a.sequence-b.sequence);
    const first=ordered[0];
    const last=ordered[ordered.length-1];
    const readingIds=[...new Set(ordered.map(event=>event.readingId).filter(Boolean))];
    const hardwareGroups=[...new Set(ordered.map(event=>event.hardwareName || event.hardwareId).filter(Boolean))];
    const unresolvedReview=ordered.filter(event=>event.acknowledgementRequired && event.lifecycle !== 'RESOLVED');
    const unacknowledged=unresolvedReview.filter(event=>!event.acknowledgedAt && event.lifecycle !== 'ACKNOWLEDGED');
    const correlationObserved=readingIds.length > 1 && ordered.length > 1;
    const elapsed=Math.max(0,Date.parse(last.timestamp)-Date.parse(first.timestamp));
    const autoResolved=ordered.filter(event=>event.resolution?.method === 'DIRECT_SENSOR_STATE').length;
    let lifecycle='OBSERVATION';
    if(unacknowledged.length) lifecycle='OPEN';
    else if(unresolvedReview.length) lifecycle='ACKNOWLEDGED';
    else if(ordered.some(event=>event.lifecycle === 'RESOLVED' || event.kind === 'RECOVERY')) lifecycle='RESOLVED';
    const newest=ordered[ordered.length-1];
    return {
      schema:SCHEMA,
      id:groupId(first.sequence,first.timestamp),
      timestamp:newest.timestamp,
      startedAt:first.timestamp,
      endedAt:last.timestamp,
      windowMs:Math.min(windowMs,elapsed),
      eventCount:ordered.length,
      observationCount:ordered.reduce((sum,event)=>sum+(Number(event.observationCount)||1),0),
      memberIds:ordered.map(event=>event.id),
      readingIds,
      hardwareGroups,
      events:ordered,
      state:highestPriorityState(unresolvedReview.length ? unresolvedReview : ordered),
      lifecycle,
      acknowledgementRequiredEventCount:unresolvedReview.length,
      unacknowledgedEventCount:unacknowledged.length,
      informationalEventCount:ordered.filter(event=>!event.acknowledgementRequired && event.lifecycle !== 'RESOLVED').length,
      autoResolvedEventCount:autoResolved,
      correlationLabel:correlationObserved ? 'CORRELATION OBSERVED' : 'DIRECT READING',
      causalityLabel:'CAUSE NOT VERIFIED',
      title:newest.title,
      summary:correlationObserved
        ? `${readingIds.length} readings changed within ${(elapsed/1000).toFixed(1)} seconds. Cause not verified.`
        : newest.summary,
      consequence:'No shared cause or consequence established from this group alone.'
    };
  }

  function buildCorrelationGroups(events=[], windowMs=CORRELATION_WINDOW_MS){
    const ordered=[...events].sort((a,b)=>Date.parse(a.timestamp)-Date.parse(b.timestamp) || a.sequence-b.sequence);
    const buckets=[];
    let bucket=[];
    let bucketStart=0;
    for(const event of ordered){
      const timestamp=Date.parse(event.timestamp);
      if(!bucket.length || !Number.isFinite(timestamp) || timestamp-bucketStart<=windowMs){
        if(!bucket.length) bucketStart=Number.isFinite(timestamp)?timestamp:0;
        bucket.push(event);
      }else{
        buckets.push(finalizeGroup(bucket,windowMs));
        bucket=[event];
        bucketStart=Number.isFinite(timestamp)?timestamp:0;
      }
    }
    if(bucket.length) buckets.push(finalizeGroup(bucket,windowMs));
    return buckets.reverse();
  }

  class Recorder{
    constructor(options={}){
      this.clock = options.clock || Date.now;
      this.storage = options.storage || null;
      this.maxEvents = options.maxEvents || MAX_EVENTS;
      this.correlationWindowMs = options.correlationWindowMs || CORRELATION_WINDOW_MS;
      this.events = [];
      this.acknowledgementReports = [];
      this.readings = new Map();
      this.sequence = 0;
      this.acknowledgementSequence = 0;
      this.restore();
    }

    restore(){
      if(!this.storage) return;
      try{
        const current=this.storage.getItem(SESSION_KEY);
        const legacy=this.storage.getItem(LEGACY_SESSION_KEY);
        const saved=JSON.parse(current || legacy || 'null');
        if(!saved || ![SCHEMA,LEGACY_SCHEMA].includes(saved.schema) || !Array.isArray(saved.events)) return;
        this.events=saved.events.map((event,index)=>migrateEvent(event,index+1,this.clock));
        this.enforceRetention();
        this.sequence=this.events.reduce((max,event)=>Math.max(max,Number(event.sequence)||0),0);
        this.acknowledgementReports=Array.isArray(saved.acknowledgement_reports)
          ? saved.acknowledgement_reports.slice(0,MAX_ACKNOWLEDGEMENT_REPORTS).map(report=>({...report}))
          : [];
        this.acknowledgementSequence=this.acknowledgementReports.reduce((max,report)=>Math.max(max,Number(report.sequence)||0),0);
        if(!current) this.persist();
      }catch(_error){ /* A corrupt session must never block Diagnostics. */ }
    }

    persist(){
      if(!this.storage) return;
      try{ this.storage.setItem(SESSION_KEY, JSON.stringify(this.snapshot())); }catch(_error){ /* storage is optional */ }
    }

    push(input, persist=true){
      const event=makeEvent(input,++this.sequence,this.clock);
      this.events.unshift(event);
      this.enforceRetention();
      if(persist) this.persist();
      return event;
    }

    enforceRetention(){
      if(this.events.length<=this.maxEvents) return;
      const protectedConditions=this.events.filter(event=>event.acknowledgementRequired && event.lifecycle!=='RESOLVED');
      const protectedIds=new Set(protectedConditions.map(event=>event.id));
      const remainingBudget=Math.max(0,this.maxEvents-protectedConditions.length);
      const rotatingEvidence=this.events.filter(event=>!protectedIds.has(event.id)).slice(0,remainingBudget);
      this.events=[...protectedConditions,...rotatingEvidence]
        .sort((a,b)=>Date.parse(b.timestamp)-Date.parse(a.timestamp) || b.sequence-a.sequence);
    }

    groups(){
      return buildCorrelationGroups(this.events,this.correlationWindowMs);
    }

    findOpenCondition(readingId){
      return this.events.find(event=>event.readingId===readingId && event.acknowledgementRequired && event.lifecycle!=='RESOLVED');
    }

    resolveWithEvidence(id, evidence={}, persist=true){
      const event=this.events.find(item=>item.id===id);
      const currentState=normalizeState(evidence.currentState,evidence);
      if(!event || event.lifecycle==='RESOLVED') return false;
      if(evidence.method!=='DIRECT_SENSOR_STATE' || !event.readingId || evidence.readingId!==event.readingId) return false;
      if(!RECOVERY_STATES.has(currentState) || evidence.available===false || evidence.stale===true) return false;
      const observedAt=evidence.observedAt || nowIso(this.clock);
      event.resolution={
        method:'DIRECT_SENSOR_STATE',
        readingId:event.readingId,
        previousState:normalizeState(event.state),
        currentState,
        observedAt,
        source:String(evidence.source || event.source),
        sourceClass:String(evidence.sourceClass || event.sourceClass).toUpperCase(),
        freshnessSeconds:finite(evidence.freshnessSeconds),
        current:finite(evidence.current),
        unit:String(evidence.unit || event.unit),
        statement:`The same reading returned to ${currentState} with current exposed evidence.`
      };
      event.resolvedAt=observedAt;
      event.lifecycle='RESOLVED';
      if(persist) this.persist();
      return true;
    }

    resolve(id, evidence){
      return this.resolveWithEvidence(id,evidence);
    }

    coalesceCondition(event, reading, state, timestamp){
      const priorState=event.state;
      event.lastObservedAt=timestamp;
      event.latestCurrent=finite(reading.current);
      event.freshnessSeconds=finite(reading.freshness_seconds);
      event.confidence=confidence(reading);
      event.observationCount=(Number(event.observationCount)||1)+1;
      if(priorState!==state){
        event.stateTransitions.push({from:priorState,to:state,timestamp});
        event.state=state;
        event.title=`${reading.label || 'Sensor'} condition changed`;
        event.summary=`${priorState} to ${state}; the same reading remains unresolved.`;
      }
      return event;
    }

    ingest(inventory={}){
      const readings=Array.isArray(inventory.readings) ? inventory.readings : [];
      const emitted=[];
      let changed=false;
      for(const reading of readings){
        const id=String(reading.id || '');
        if(!id) continue;
        const state=readingState(reading);
        const before=this.readings.get(id);
        const change=meaningfulChange(before,reading);
        const timestamp=reading.timestamp || nowIso(this.clock);
        if(!before){
          const restoredCondition=this.findOpenCondition(id);
          if(restoredCondition && RECOVERY_STATES.has(state) && reading.available!==false && reading.stale!==true){
            const source=reading.source || inventory.source;
            const sourceClass=classification(reading);
            const freshnessSeconds=reading.freshness_seconds ?? inventory.freshnessSeconds;
            const current=finite(reading.current);
            const unit=String(reading.unit || '');
            const resolutionEvidence={
              method:'DIRECT_SENSOR_STATE',readingId:id,currentState:state,observedAt:timestamp,
              source,sourceClass,freshnessSeconds,current,unit,available:true,stale:false
            };
            if(this.resolveWithEvidence(restoredCondition.id,resolutionEvidence,false)){
              emitted.push(this.push({
                state,readingId:id,hardwareId:reading.hardware_group_id,hardwareName:reading.hardware_group,
                source,sourceClass,freshnessSeconds,samplingCadenceMs:inventory.sampling_cadence_ms || null,
                current,previous:null,unit,confidence:confidence(reading),timestamp,
                kind:'RECOVERY',title:`${reading.label || 'Sensor'} returned to ${state}`,
                summary:`First fresh inventory evidence resolved restored condition ${restoredCondition.id}.`,
                consequence:'No consequence established from this evidence alone.',
                acknowledgementRequired:false,lifecycle:'RESOLVED',resolvedAt:timestamp,
                resolvedEventId:restoredCondition.id,resolution:restoredCondition.resolution
              },false));
              changed=true;
            }
          }
        }
        if(change){
          const current=finite(reading.current);
          const prior=finite(before?.current);
          const unit=String(reading.unit || '');
          const common={
            state,
            readingId:id,
            hardwareId:reading.hardware_group_id,
            hardwareName:reading.hardware_group,
            source:reading.source || inventory.source,
            sourceClass:classification(reading),
            freshnessSeconds:reading.freshness_seconds ?? inventory.freshnessSeconds,
            samplingCadenceMs:inventory.sampling_cadence_ms || null,
            current,
            previous:prior,
            unit,
            confidence:confidence(reading),
            timestamp,
            consequence:'No consequence established from this evidence alone.'
          };
          if(isConditionState(state)){
            const existing=this.findOpenCondition(id);
            if(existing){
              this.coalesceCondition(existing,reading,state,timestamp);
              changed=true;
            }else{
              emitted.push(this.push({
                ...common,
                kind:change.kind === 'VALUE_CHANGE' ? 'CONDITION' : change.kind,
                title:`${reading.label || 'Sensor'} entered ${state}`,
                summary:`${change.beforeState || 'UNKNOWN'} to ${state}; operator review is required.`,
                acknowledgementRequired:true,
                lifecycle:'OPEN'
              },false));
              changed=true;
            }
          }else if(change.kind==='RECOVERY' || (before && isConditionState(before.state) && RECOVERY_STATES.has(state))){
            const condition=this.findOpenCondition(id);
            const resolutionEvidence={
              method:'DIRECT_SENSOR_STATE',readingId:id,currentState:state,observedAt:timestamp,
              source:common.source,sourceClass:common.sourceClass,freshnessSeconds:common.freshnessSeconds,
              current,unit,available:reading.available !== false,stale:reading.stale === true
            };
            if(condition && this.resolveWithEvidence(condition.id,resolutionEvidence,false)){
              emitted.push(this.push({
                ...common,
                kind:'RECOVERY',
                title:`${reading.label || 'Sensor'} returned to ${state}`,
                summary:`Direct evidence from the same reading resolved ${condition.id}.`,
                acknowledgementRequired:false,
                lifecycle:'RESOLVED',
                resolvedAt:timestamp,
                resolvedEventId:condition.id,
                resolution:condition.resolution
              },false));
            }else{
              emitted.push(this.push({
                ...common,
                kind:'OBSERVATION',
                title:`${reading.label || 'Sensor'} changed state`,
                summary:`${change.beforeState || 'UNKNOWN'} to ${state}; no prior session condition was available to resolve.`,
                acknowledgementRequired:false,
                lifecycle:'OBSERVATION'
              },false));
            }
            changed=true;
          }else{
            emitted.push(this.push({
              ...common,
              kind:'OBSERVATION',
              title:`${reading.label || 'Sensor'} changed`,
              summary:change.kind === 'VALUE_CHANGE'
                ? `${prior}${unit} to ${current}${unit}; thresholded session observation.`
                : `${change.beforeState || 'UNKNOWN'} to ${state}; no review condition was established.`,
              acknowledgementRequired:false,
              lifecycle:'OBSERVATION'
            },false));
            changed=true;
          }
        }
        this.readings.set(id,{
          current:finite(reading.current),state,available:reading.available !== false,stale:reading.stale === true,
          label:reading.label || '',hardwareName:reading.hardware_group || ''
        });
      }
      if(changed) this.persist();
      return emitted;
    }

    acknowledge(id){
      const event=this.events.find(item=>item.id===id);
      if(!event || !event.acknowledgementRequired || event.resolvedAt || event.acknowledgedAt) return false;
      event.acknowledgedAt=nowIso(this.clock);
      event.lifecycle='ACKNOWLEDGED';
      this.persist();
      return true;
    }

    acknowledgementReport(targetGroups, scope){
      const timestamp=nowIso(this.clock);
      const groups=targetGroups || this.groups();
      const targetIds=new Set(groups.flatMap(group=>group.memberIds));
      const targetEvents=this.events.filter(event=>targetIds.has(event.id));
      const reviewable=targetEvents.filter(event=>event.acknowledgementRequired && event.lifecycle!=='RESOLVED');
      const eligible=reviewable.filter(event=>!event.acknowledgedAt && event.lifecycle!=='ACKNOWLEDGED');
      const alreadyAcknowledged=reviewable.filter(event=>event.acknowledgedAt || event.lifecycle==='ACKNOWLEDGED');
      const resolvedUntouched=targetEvents.filter(event=>event.lifecycle==='RESOLVED');
      const informationalNotRequired=targetEvents.filter(event=>!event.acknowledgementRequired && event.lifecycle!=='RESOLVED');
      const autoResolvedUntouched=resolvedUntouched.filter(event=>event.resolution?.method==='DIRECT_SENSOR_STATE');
      const sequence=++this.acknowledgementSequence;
      const id=acknowledgementId(sequence,timestamp);
      for(const event of eligible){
        event.acknowledgedAt=timestamp;
        event.lifecycle='ACKNOWLEDGED';
        event.acknowledgementBatchId=id;
      }
      const groupsAcknowledged=groups.filter(group=>group.events.some(event=>eligible.includes(event)));
      const report={
        schema:ACKNOWLEDGEMENT_SCHEMA,
        id,sequence,timestamp,scope,
        sessionEventCount:this.events.length,
        sessionGroupCount:this.groups().length,
        reviewGroupsInspected:groups.filter(group=>group.acknowledgementRequiredEventCount>0).length,
        groupsAcknowledgedNow:groupsAcknowledged.length,
        unresolvedReviewed:reviewable.length,
        acknowledgedNow:eligible.length,
        alreadyAcknowledged:alreadyAcknowledged.length,
        resolvedUntouched:resolvedUntouched.length,
        informationalNotRequired:informationalNotRequired.length,
        autoResolvedUntouched:autoResolvedUntouched.length,
        breakdown:{
          kinds:tally(eligible,'kind','UNKNOWN EVENT TYPE'),
          states:tally(eligible,'state','UNKNOWN STATE'),
          hardwareGroups:tally(eligible,event=>event.hardwareName || event.hardwareId,'UNCLASSIFIED HARDWARE')
        },
        groupIds:groupsAcknowledged.map(group=>group.id),
        eventIds:eligible.map(event=>event.id),
        statement:'Acknowledgement records operator review only. It did not resolve a condition, change hardware state, or verify a cause.'
      };
      this.acknowledgementReports.unshift(report);
      this.acknowledgementReports=this.acknowledgementReports.slice(0,MAX_ACKNOWLEDGEMENT_REPORTS);
      this.persist();
      return this.cloneReport(report);
    }

    acknowledgeAll(){
      return this.acknowledgementReport(this.groups(),'ALL_REVIEW_GROUPS');
    }

    acknowledgeGroup(id){
      const group=this.groups().find(item=>item.id===id);
      if(!group) return null;
      return this.acknowledgementReport([group],'SELECTED_REVIEW_GROUP');
    }

    cloneReport(report){
      return {
        ...report,
        breakdown:{
          kinds:{...report.breakdown.kinds},
          states:{...report.breakdown.states},
          hardwareGroups:{...report.breakdown.hardwareGroups}
        },
        groupIds:[...(report.groupIds || [])],
        eventIds:[...(report.eventIds || [])]
      };
    }

    snapshot(){
      const groups=this.groups();
      return {
        schema:SCHEMA,
        exported:nowIso(this.clock),
        count:this.events.length,
        group_count:groups.length,
        events:this.events.map(event=>({
          ...event,
          resolution:event.resolution ? {...event.resolution} : null,
          stateTransitions:event.stateTransitions.map(item=>({...item}))
        })),
        groups:groups.map(group=>({
          ...group,
          events:undefined,
          memberIds:[...group.memberIds],readingIds:[...group.readingIds],hardwareGroups:[...group.hardwareGroups]
        })),
        acknowledgement_report_count:this.acknowledgementReports.length,
        acknowledgement_reports:this.acknowledgementReports.map(report=>this.cloneReport(report))
      };
    }
  }

  const recorder=new Recorder({storage:root?.sessionStorage || null});
  let selectedGroupId='';
  let filter='ALL';

  function escape(value){
    return String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  function visibleGroups(){
    const groups=recorder.groups();
    if(filter==='REVIEW') return groups.filter(group=>group.lifecycle==='OPEN' || group.lifecycle==='ACKNOWLEDGED');
    if(filter==='OBSERVATIONS') return groups.filter(group=>group.lifecycle==='OBSERVATION');
    if(filter==='RESOLVED') return groups.filter(group=>group.lifecycle==='RESOLVED');
    return groups;
  }

  function breakdownHtml(title, breakdown={}){
    const rows=Object.entries(breakdown);
    return `<div class="machine-ack-breakdown"><span>${escape(title)}</span>${rows.length
      ? rows.map(([label,count])=>`<div><b>${escape(label)}</b><strong>${escape(count)}</strong></div>`).join('')
      : '<small>NO EVENTS ACKNOWLEDGED</small>'}</div>`;
  }

  function renderAcknowledgementReport(){
    const panel=root?.document?.querySelector('#machineAcknowledgementReport');
    if(!panel) return;
    const report=recorder.acknowledgementReports[0];
    if(!report){
      panel.hidden=true;
      panel.innerHTML='';
      return;
    }
    panel.hidden=false;
    panel.innerHTML=`<header><div><span>ACKNOWLEDGEMENT RECEIPT</span><b>${escape(report.id)}</b></div><time>${escape(new Date(report.timestamp).toLocaleString())}</time></header>
      <div class="machine-ack-summary">
        <div><span>GROUPS ACKNOWLEDGED</span><b>${escape(report.groupsAcknowledgedNow ?? 0)}</b></div>
        <div><span>EVENTS ACKNOWLEDGED</span><b>${escape(report.acknowledgedNow)}</b></div>
        <div><span>ALREADY ACKNOWLEDGED</span><b>${escape(report.alreadyAcknowledged)}</b></div>
        <div><span>RESOLVED UNTOUCHED</span><b>${escape(report.resolvedUntouched)}</b></div>
        <div><span>NO ACK REQUIRED</span><b>${escape(report.informationalNotRequired ?? 0)}</b></div>
      </div>
      <div class="machine-ack-breakdowns">${breakdownHtml('EVENT TYPES REVIEWED',report.breakdown.kinds)}${breakdownHtml('STATES REVIEWED',report.breakdown.states)}${breakdownHtml('HARDWARE GROUPS REVIEWED',report.breakdown.hardwareGroups)}</div>
      <p>${escape(report.statement)}</p>`;
  }

  function groupTitle(group){
    if(group.correlationLabel==='CORRELATION OBSERVED') return `${group.readingIds.length} related readings changed`;
    return group.title;
  }

  function render(){
    if(!root?.document) return;
    const list=root.document.querySelector('#machineTimelineList');
    const inspector=root.document.querySelector('#machineEvidenceInspector');
    const count=root.document.querySelector('#machineTimelineCount');
    const acknowledgeAll=root.document.querySelector('#acknowledgeAllMachineEvents');
    if(!list || !inspector) return;
    const focusWasGroupAction=root.document.activeElement?.id==='acknowledgeMachineGroup';
    const focusedGroupId=root.document.activeElement?.closest?.('[data-machine-group]')?.dataset?.machineGroup || (focusWasGroupAction ? selectedGroupId : '');
    const allGroups=recorder.groups();
    const groups=visibleGroups();
    const pendingGroups=allGroups.filter(group=>group.unacknowledgedEventCount>0);
    const pendingEvents=pendingGroups.reduce((sum,group)=>sum+group.unacknowledgedEventCount,0);
    if(count) count.textContent=`${recorder.events.length} EVENTS // ${allGroups.length} GROUPS // ${pendingGroups.length} NEED REVIEW`;
    if(acknowledgeAll){
      acknowledgeAll.disabled=pendingEvents===0;
      acknowledgeAll.textContent=pendingGroups.length ? `ACKNOWLEDGE ALL ${pendingGroups.length} GROUP${pendingGroups.length===1?'':'S'}` : 'NO GROUPS NEED REVIEW';
    }
    renderAcknowledgementReport();
    if(!groups.length){
      list.innerHTML='<div class="machine-timeline-empty"><b>QUIET REVIEW QUEUE</b><span>No groups match this view. Routine operation remains in the evidence record without demanding acknowledgement.</span></div>';
      inspector.innerHTML='<b>NO GROUP SELECTED</b><span>Choose a grouped timeline entry when evidence becomes available.</span>';
      return;
    }
    if(!groups.some(group=>group.id===selectedGroupId)) selectedGroupId=groups[0].id;
    list.innerHTML=groups.map(group=>`<button type="button" class="machine-event machine-event-group gamepad-focusable${group.id===selectedGroupId?' is-selected':''}" data-machine-group="${escape(group.id)}" aria-label="${escape(`${group.observationCount} observations, ${group.state}, ${group.lifecycle}, ${group.correlationLabel}`)}">
      <time>${escape(new Date(group.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'}))}</time>
      <span class="machine-group-marker"><b>${escape(group.observationCount)} OBSERVATION${group.observationCount===1?'':'S'}</b><small>${escape(group.correlationLabel)}</small></span>
      <span class="machine-group-body"><strong>${escape(groupTitle(group))}</strong><small>${escape(group.summary)}</small><i>${escape(group.causalityLabel)}</i></span>
      <em data-state="${escape(group.state)}">${escape(group.state)}<small>${escape(group.lifecycle)}</small></em>
    </button>`).join('');
    const group=groups.find(item=>item.id===selectedGroupId) || groups[0];
    const sources=[...new Set(group.events.map(event=>event.source).filter(Boolean))];
    const directResolutions=group.events.filter(event=>event.resolution?.method==='DIRECT_SENSOR_STATE');
    const resolutionEvidence=directResolutions.length ? `${directResolutions.length} DIRECT SENSOR STATE RECORD${directResolutions.length===1?'':'S'}` : 'NO DIRECT RESOLUTION EVIDENCE';
    inspector.innerHTML=`<div class="machine-evidence-state"><b>${escape(group.correlationLabel)} / ${escape(group.lifecycle)}</b><strong>${escape(groupTitle(group))}</strong><small>${escape(group.causalityLabel)}</small></div>${[
      ['SOURCE',sources.join(' + ') || 'NOT EXPOSED'],
      ['MEMBERS',`${group.observationCount} observations / ${group.eventCount} stored events / ${group.readingIds.length} readings`],
      ['WINDOW',`${(group.windowMs/1000).toFixed(1)} seconds`],
      ['HARDWARE',group.hardwareGroups.join(' + ') || 'NOT EXPOSED'],
      ['STATE',group.state],
      ['CORRELATION',group.correlationLabel],
      ['CAUSALITY',group.causalityLabel],
      ['RESOLUTION',resolutionEvidence],
      ['CONSEQUENCE',group.consequence]
    ].map(([label,value])=>`<div class="machine-evidence-row"><span>${escape(label)}</span><b>${escape(value)}</b></div>`).join('')}
      <button type="button" id="acknowledgeMachineGroup" class="scan-btn small-scan" ${group.unacknowledgedEventCount===0?'disabled':''}>${group.unacknowledgedEventCount ? `ACKNOWLEDGE GROUP (${group.unacknowledgedEventCount})` : group.lifecycle==='RESOLVED'?'RESOLVED BY DIRECT EVIDENCE':'NO ACKNOWLEDGEMENT REQUIRED'}</button>`;
    if(focusedGroupId){
      const restoredFocus=list.querySelector(`[data-machine-group="${root.CSS?.escape ? root.CSS.escape(focusedGroupId) : focusedGroupId}"]`);
      if(restoredFocus){
        restoredFocus.focus({preventScroll:true});
        restoredFocus.scrollIntoView({block:'nearest',inline:'nearest'});
      }
    }
  }

  function ingestInventory(inventory){
    const emitted=recorder.ingest(inventory);
    if(emitted.length){
      const newestGroup=recorder.groups().find(group=>group.memberIds.includes(emitted[0].id));
      if(newestGroup) selectedGroupId=newestGroup.id;
    }
    if(root?.document?.body?.dataset?.world === 'diagnostics') render();
    return emitted;
  }

  function controllerAction(action){
    if(root?.document?.body?.dataset?.world !== 'diagnostics') return false;
    const timeline=root.document.querySelector('#diagnosticsTimelineView');
    if(!timeline || timeline.hidden) return false;
    if(action==='acknowledge'){
      const focusedGroup=root.document.activeElement?.closest?.('[data-machine-group]');
      if(focusedGroup?.dataset?.machineGroup) selectedGroupId=focusedGroup.dataset.machineGroup;
      if(selectedGroupId) recorder.acknowledgeGroup(selectedGroupId);
      render();
      return true;
    }
    if(action==='evidence'){
      root.document.querySelector('#machineEvidenceInspector')?.scrollIntoView({block:'nearest'});
      return true;
    }
    return false;
  }

  function bind(){
    if(!root?.document) return;
    root.document.addEventListener('ruca:inventory-updated',event=>ingestInventory(event.detail?.inventory || {}));
    root.document.addEventListener('ruca:continuity-change',event=>{
      if(event.detail?.type === 'route-changed' && event.detail?.to === 'diagnostics') render();
    });
    root.document.addEventListener('click',event=>{
      const tab=event.target.closest?.('[data-diagnostics-view]');
      if(tab){
        const view=tab.dataset.diagnosticsView;
        root.document.querySelectorAll('[data-diagnostics-view]').forEach(item=>item.classList.toggle('active',item===tab));
        const timeline=root.document.querySelector('#diagnosticsTimelineView');
        const legacy=root.document.querySelector('#diagnosticsEvidenceView');
        if(timeline) timeline.hidden=view!=='timeline';
        if(legacy) legacy.hidden=view==='timeline';
        if(view==='timeline') render();
      }
      const row=event.target.closest?.('[data-machine-group]');
      if(row){selectedGroupId=row.dataset.machineGroup;render();}
      const filterButton=event.target.closest?.('[data-machine-filter]');
      if(filterButton){
        filter=filterButton.dataset.machineFilter;
        root.document.querySelectorAll('[data-machine-filter]').forEach(item=>item.classList.toggle('active',item===filterButton));
        render();
      }
      if(event.target.closest?.('#acknowledgeMachineGroup')){if(selectedGroupId) recorder.acknowledgeGroup(selectedGroupId);render();}
      if(event.target.closest?.('#acknowledgeAllMachineEvents')){recorder.acknowledgeAll();render();}
    });
  }

  if(root?.document){
    if(root.document.readyState==='loading') root.document.addEventListener('DOMContentLoaded',bind,{once:true});
    else bind();
  }

  return Object.freeze({
    SCHEMA,ACKNOWLEDGEMENT_SCHEMA,ALLOWED_STATES,CONDITION_STATES,RECOVERY_STATES,CORRELATION_WINDOW_MS,
    Recorder,classification,confidence,normalizeState,isConditionState,meaningfulChange,makeEvent,buildCorrelationGroups,
    ingestInventory,controllerAction,exportSnapshot:()=>recorder.snapshot(),render
  });
});
