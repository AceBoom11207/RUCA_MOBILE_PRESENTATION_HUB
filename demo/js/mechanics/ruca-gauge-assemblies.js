(function rucaGaugeAssembliesModule(global){
  'use strict';

  const model=global.RUCA_MECHANICAL_MODEL;
  const core=global.RUCA_DRIVETRAIN_CORE;
  if(!model || !core) throw new Error('RUCA mechanical model and drivetrain core must load before gauge assemblies');

  const VERSION='C002.0.0';
  const registry=new model.MechanicalAssetRegistry();

  registry.defineMany([
    {id:'RUCA_COMPONENT_BASE',type:'component',kind:'component',abstract:true,polymorphic:true,metadata:{library:'RUCA_INDUSTRIES'}},
    {id:'RUCA_GEAR_BASE',type:'gear',kind:'gear',abstract:true,extendsAssetId:'RUCA_COMPONENT_BASE',geometry:{module:1.3,pressureAngle:20}},
    {id:'RUCA_FINE_GEAR_BASE',type:'gear',kind:'gear',abstract:true,extendsAssetId:'RUCA_GEAR_BASE',geometry:{module:1,pressureAngle:20}},
    {id:'RUCA_BRIDGE_BASE',type:'bridge',kind:'bridge',abstract:true,extendsAssetId:'RUCA_COMPONENT_BASE',structuralRole:'pivot and bearing support'},
    {id:'RUCA_BEARING_BASE',type:'bearing',kind:'bearing',abstract:true,extendsAssetId:'RUCA_COMPONENT_BASE',structuralRole:'locates a rotating shaft'},
    {id:'RUCA_SHAFT_BASE',type:'shaft',kind:'shaft',abstract:true,extendsAssetId:'RUCA_COMPONENT_BASE',structuralRole:'carries torque on a fixed axis'},
    {id:'RUCA_BALANCE_BASE',type:'balance-wheel',kind:'balance-wheel',abstract:true,extendsAssetId:'RUCA_COMPONENT_BASE'},
    {id:'RUCA_FASTENER_BASE',type:'fastener',kind:'fastener',abstract:true,extendsAssetId:'RUCA_COMPONENT_BASE',structuralRole:'retains fixed components'},

    {id:'RUCA_GEAR_10T',type:'gear',kind:'gear',extendsAssetId:'RUCA_GEAR_BASE',material:'RM_STEEL_POLISHED',surfaceFinish:'lapped face with cut flanks',geometry:{teeth:10,pitchDiameter:13,rootDiameter:9.75,outsideDiameter:15.6,toothDepth:2.925,thickness:2.2,hub:{diameter:6.4,height:2.8},bore:2.2,shaftSeat:'keyed round',chamfer:.42,frontChamfer:.42,rearChamfer:.28,edgeRadius:.16}},
    {id:'RUCA_GEAR_12T',type:'gear',kind:'gear',extendsAssetId:'RUCA_GEAR_BASE',material:'RM_BRASS',surfaceFinish:'radially brushed face with hob-cut teeth',geometry:{teeth:12,pitchDiameter:15.6,rootDiameter:12.35,outsideDiameter:18.2,toothDepth:2.925,thickness:2.35,hub:{diameter:7.2,height:3},bore:2.4,shaftSeat:'keyed round',chamfer:.44,frontChamfer:.44,rearChamfer:.30,edgeRadius:.17}},
    {id:'RUCA_GEAR_13T',type:'gear',kind:'gear',extendsAssetId:'RUCA_GEAR_BASE',material:'RM_BRASS',surfaceFinish:'radially brushed face with hob-cut teeth',geometry:{teeth:13,pitchDiameter:16.9,rootDiameter:13.65,outsideDiameter:19.5,toothDepth:2.925,thickness:2.35,hub:{diameter:7.4,height:3},bore:2.4,shaftSeat:'keyed round',chamfer:.44,frontChamfer:.44,rearChamfer:.30,edgeRadius:.17}},
    {id:'RUCA_GEAR_14T',type:'gear',kind:'gear',extendsAssetId:'RUCA_GEAR_BASE',material:'RM_STEEL_POLISHED',surfaceFinish:'lapped face with cut flanks',geometry:{teeth:14,pitchDiameter:18.2,rootDiameter:14.95,outsideDiameter:20.8,toothDepth:2.925,thickness:2.3,hub:{diameter:7.6,height:3},bore:2.4,shaftSeat:'keyed round',chamfer:.45,frontChamfer:.45,rearChamfer:.30,edgeRadius:.18}},
    {id:'RUCA_GEAR_16T',type:'gear',kind:'gear',extendsAssetId:'RUCA_GEAR_BASE',material:'RM_BRASS',surfaceFinish:'radially brushed face with hob-cut teeth',geometry:{teeth:16,pitchDiameter:20.8,rootDiameter:17.55,outsideDiameter:23.4,toothDepth:2.925,thickness:2.45,hub:{diameter:8,height:3.1},bore:2.5,shaftSeat:'keyed round',chamfer:.46,frontChamfer:.46,rearChamfer:.31,edgeRadius:.18}},
    {id:'RUCA_GEAR_18T',type:'gear',kind:'gear',extendsAssetId:'RUCA_GEAR_BASE',material:'RM_STEEL_POLISHED',surfaceFinish:'lapped face with cut flanks',geometry:{teeth:18,pitchDiameter:23.4,rootDiameter:20.15,outsideDiameter:26,toothDepth:2.925,thickness:2.5,hub:{diameter:8.6,height:3.2},bore:2.6,shaftSeat:'keyed round',chamfer:.48,frontChamfer:.48,rearChamfer:.32,edgeRadius:.19}},
    {id:'RUCA_GEAR_19T',type:'gear',kind:'gear',extendsAssetId:'RUCA_GEAR_BASE',material:'RM_TITANIUM',surfaceFinish:'bead-blasted face with polished teeth',geometry:{teeth:19,pitchDiameter:24.7,rootDiameter:21.45,outsideDiameter:27.3,toothDepth:2.925,thickness:2.55,hub:{diameter:8.8,height:3.2},bore:2.6,shaftSeat:'keyed round',chamfer:.48,frontChamfer:.48,rearChamfer:.32,edgeRadius:.19}},
    {id:'RUCA_GEAR_20T',type:'gear',kind:'gear',extendsAssetId:'RUCA_GEAR_BASE',material:'RM_BLACK_OXIDE',surfaceFinish:'black-oxide face with polished flanks',geometry:{teeth:20,pitchDiameter:26,rootDiameter:22.75,outsideDiameter:28.6,toothDepth:2.925,thickness:2.6,hub:{diameter:9,height:3.3},bore:2.7,shaftSeat:'keyed round',chamfer:.49,frontChamfer:.49,rearChamfer:.33,edgeRadius:.19}},
    {id:'RUCA_GEAR_24T',type:'gear',kind:'gear',extendsAssetId:'RUCA_GEAR_BASE',material:'RM_BRASS',surfaceFinish:'radially brushed face with hob-cut teeth',geometry:{teeth:24,pitchDiameter:31.2,rootDiameter:27.95,outsideDiameter:33.8,toothDepth:2.925,thickness:2.7,hub:{diameter:9.8,height:3.4},bore:2.8,shaftSeat:'keyed round',chamfer:.52,frontChamfer:.52,rearChamfer:.35,edgeRadius:.20}},
    {id:'RUCA_GEAR_25T',type:'gear',kind:'gear',extendsAssetId:'RUCA_GEAR_BASE',material:'RM_STEEL_BRUSHED',surfaceFinish:'directional satin face with cut teeth',geometry:{teeth:25,pitchDiameter:32.5,rootDiameter:29.25,outsideDiameter:35.1,toothDepth:2.925,thickness:2.75,hub:{diameter:10,height:3.5},bore:2.9,shaftSeat:'keyed round',chamfer:.53,frontChamfer:.53,rearChamfer:.35,edgeRadius:.20}},
    {id:'RUCA_GEAR_28T',type:'gear',kind:'gear',extendsAssetId:'RUCA_GEAR_BASE',material:'RM_TITANIUM',surfaceFinish:'bead-blasted face with polished teeth',geometry:{teeth:28,pitchDiameter:36.4,rootDiameter:33.15,outsideDiameter:39,toothDepth:2.925,thickness:2.8,hub:{diameter:10.6,height:3.6},bore:3,shaftSeat:'keyed round',chamfer:.55,frontChamfer:.55,rearChamfer:.36,edgeRadius:.21}},
    {id:'RUCA_GEAR_30T',type:'gear',kind:'gear',extendsAssetId:'RUCA_GEAR_BASE',material:'RM_TITANIUM',surfaceFinish:'bead-blasted face with polished teeth',geometry:{teeth:30,pitchDiameter:39,rootDiameter:35.75,outsideDiameter:41.6,toothDepth:2.925,thickness:2.9,hub:{diameter:11,height:3.7},bore:3.1,shaftSeat:'keyed round',chamfer:.57,frontChamfer:.57,rearChamfer:.38,edgeRadius:.21}},
    {id:'RUCA_GEAR_32T',type:'gear',kind:'gear',extendsAssetId:'RUCA_GEAR_BASE',material:'RM_TITANIUM',surfaceFinish:'bead-blasted face with polished teeth',geometry:{teeth:32,pitchDiameter:41.6,rootDiameter:38.35,outsideDiameter:44.2,toothDepth:2.925,thickness:3,hub:{diameter:11.4,height:3.8},bore:3.2,shaftSeat:'keyed round',chamfer:.58,frontChamfer:.58,rearChamfer:.39,edgeRadius:.22}},
    {id:'RUCA_GEAR_36T',type:'gear',kind:'gear',extendsAssetId:'RUCA_GEAR_BASE',material:'RM_STEEL_BRUSHED',surfaceFinish:'directional satin face with cut teeth',geometry:{teeth:36,pitchDiameter:46.8,rootDiameter:43.55,outsideDiameter:49.4,toothDepth:2.925,thickness:3.1,hub:{diameter:12,height:4},bore:3.4,shaftSeat:'keyed round',chamfer:.62,frontChamfer:.62,rearChamfer:.41,edgeRadius:.23}},
    {id:'RUCA_PINION_SMALL',type:'gear',kind:'pinion',extendsAssetId:'RUCA_FINE_GEAR_BASE',material:'RM_STEEL_POLISHED',surfaceFinish:'lapped fine-pitch pinion',geometry:{teeth:10,pitchDiameter:10,rootDiameter:7.5,outsideDiameter:12,toothDepth:2.25,thickness:2.1,hub:{diameter:5.4,height:2.7},bore:1.8,shaftSeat:'pressed round',chamfer:.34,frontChamfer:.34,rearChamfer:.23,edgeRadius:.13}},
    {id:'RUCA_GEAR_FINE_18T',type:'gear',kind:'gear',extendsAssetId:'RUCA_FINE_GEAR_BASE',material:'RM_BRASS',surfaceFinish:'fine radial-brushed brass',geometry:{teeth:18,pitchDiameter:18,rootDiameter:15.5,outsideDiameter:20,toothDepth:2.25,thickness:2.3,hub:{diameter:7.2,height:2.9},bore:2.1,shaftSeat:'pressed round',chamfer:.38,frontChamfer:.38,rearChamfer:.25,edgeRadius:.15}},
    {id:'RUCA_PINION_MEDIUM',type:'gear',kind:'pinion',extendsAssetId:'RUCA_FINE_GEAR_BASE',material:'RM_TITANIUM',surfaceFinish:'bead-blasted fine-pitch pinion',geometry:{teeth:14,pitchDiameter:14,rootDiameter:11.5,outsideDiameter:16,toothDepth:2.25,thickness:2.2,hub:{diameter:6.3,height:2.8},bore:2,shaftSeat:'pressed round',chamfer:.36,frontChamfer:.36,rearChamfer:.24,edgeRadius:.14}},
    {id:'RUCA_ESCAPE_WHEEL',type:'gear',kind:'escape-gear',extendsAssetId:'RUCA_FINE_GEAR_BASE',material:'RM_STEEL_POLISHED',surfaceFinish:'lapped escape teeth',geometry:{teeth:15,pitchDiameter:15,rootDiameter:12.5,outsideDiameter:17,toothDepth:2.25,thickness:1.8,hub:{diameter:5.8,height:2.4},bore:1.8,shaftSeat:'pressed round',chamfer:.32,frontChamfer:.32,rearChamfer:.22,edgeRadius:.12}},

    {id:'RUCA_BALANCE_WHEEL',type:'balance-wheel',kind:'balance-wheel',extendsAssetId:'RUCA_BALANCE_BASE',material:'RM_STEEL_BRUSHED',surfaceFinish:'fine circular brush',geometry:{diameter:32,rimWidth:3.2,spokes:8,thickness:2.1,hub:{diameter:6.2,height:2.8},bore:1.8,chamfer:.38,edgeRadius:.16}},
    {id:'RUCA_MAIN_SHAFT',type:'shaft',kind:'shaft',extendsAssetId:'RUCA_SHAFT_BASE',material:'RM_STEEL_POLISHED',surfaceFinish:'centerless-ground and lapped',geometry:{diameter:2.4,length:8,shoulderDiameter:3.6,thickness:8,chamfer:.24,edgeRadius:.10}},
    {id:'RUCA_AUX_SHAFT',type:'shaft',kind:'shaft',extendsAssetId:'RUCA_SHAFT_BASE',material:'RM_STEEL_POLISHED',surfaceFinish:'centerless-ground',geometry:{diameter:2,length:7,shoulderDiameter:3.1,thickness:7,chamfer:.20,edgeRadius:.09}},
    {id:'RUCA_BRIDGE_SMALL',type:'bridge',kind:'bridge',extendsAssetId:'RUCA_BRIDGE_BASE',material:'RM_BLACK_OXIDE',surfaceFinish:'black-oxide micro bead blast',structuralRole:'pivot and bearing support',geometry:{width:4.8,length:34,thickness:2.8,pivotCount:2,bearingSeats:2,shoulderRadius:3.8,structuralRole:'pivot and bearing support',chamfer:.42,edgeRadius:.18}},
    {id:'RUCA_BRIDGE_LARGE',type:'bridge',kind:'bridge',extendsAssetId:'RUCA_BRIDGE_BASE',material:'RM_TITANIUM',surfaceFinish:'bead-blasted titanium with polished bevel',structuralRole:'multi-pivot bearing support',geometry:{width:5.4,length:48,thickness:3.2,pivotCount:3,bearingSeats:3,shoulderRadius:4.2,structuralRole:'multi-pivot bearing support',chamfer:.48,edgeRadius:.20}},
    {id:'RUCA_JEWEL',type:'bearing',kind:'jewel-bearing',extendsAssetId:'RUCA_BEARING_BASE',material:'RM_RUBY_JEWEL',surfaceFinish:'faceted and optically polished',geometry:{diameter:4.8,bore:1.1,seatDiameter:6.4,thickness:1.8,chamfer:.20,edgeRadius:.08}},
    {id:'RUCA_THRUST_WASHER',type:'component',kind:'thrust-washer',extendsAssetId:'RUCA_COMPONENT_BASE',material:'RM_STEEL_BRUSHED',surfaceFinish:'precision ground',structuralRole:'controls axial endplay',geometry:{outsideDiameter:5.8,insideDiameter:2.2,thickness:.7,chamfer:.12,edgeRadius:.06}},
    {id:'RUCA_RETAINER',type:'component',kind:'retainer',extendsAssetId:'RUCA_COMPONENT_BASE',material:'RM_BLACK_OXIDE',surfaceFinish:'black-oxide spring steel',structuralRole:'retains shaft hardware',geometry:{outsideDiameter:4.8,insideDiameter:2,thickness:.65,chamfer:.10,edgeRadius:.05}},
    {id:'RUCA_FASTENER',type:'fastener',kind:'fastener',extendsAssetId:'RUCA_FASTENER_BASE',material:'RM_STEEL_POLISHED',surfaceFinish:'lapped countersunk head',geometry:{headDiameter:5.8,shaftDiameter:2.2,seatDiameter:6.8,thickness:2.4,chamfer:.30,edgeRadius:.12}},
    {id:'RUCA_BULKHEAD_COUPLER',type:'component',kind:'bulkhead-coupler',extendsAssetId:'RUCA_COMPONENT_BASE',material:'RM_CONDUIT_STEEL',surfaceFinish:'longitudinally brushed compression fitting',structuralRole:'clamps the conduit shell inside the System Heart bulkhead',geometry:{width:22,height:20,thickness:4,insertionDepth:12,collarWidth:5,dielectricSocket:{width:16,height:8,inset:3},fastenerSeats:2,chamfer:.55,edgeRadius:.22}}
  ]);

  registry.define({
    id:'HOME_GAUGE_ASSEMBLY',
    type:'assembly',
    kind:'gauge-drivetrain',
    abstract:true,
    motionAuthority:'HOME_GAUGE_MASTER_MOTION',
    pressureAngle:20,
    renderer:'PASS59_PHYSICAL_MATERIAL_LIBRARY',
    metadata:{
      runtimeOwner:'RUCA_SHARED_DRIVETRAIN_RUNTIME',
      motionType:'continuous-rotary',
      hierarchy:'Assembly > support > bearing > shaft > gear',
      independentMotionOwners:0
    }
  });

  function trainNodes(metricKey,trainIndex,train,shaftAssetId){
    const prefix=`${metricKey}-${train.channel}-${trainIndex}`;
    const bridgeId=`${prefix}-bridge`;
    const gearRoles=['driver','reduction','output'];
    const nodes=[
      {id:bridgeId,assetId:train.bridge,parentId:null,motionRole:'fixed-support',fixed:true},
      {id:`${prefix}-fastener`,assetId:'RUCA_FASTENER',parentId:bridgeId,motionRole:'fixed-retainer',fixed:true}
    ];
    const supportLinks=[
      {id:`${bridgeId}-retains-${prefix}-fastener`,type:'retains',parentId:bridgeId,childId:`${prefix}-fastener`}
    ];
    const gearNodeIds=[];
    const shaftNodeIds=[];
    train.components.forEach((assetId,index)=>{
      const bearingId=`${prefix}-${gearRoles[index]}-bearing`;
      const shaftId=`${prefix}-${gearRoles[index]}-shaft`;
      const gearId=`${prefix}-${gearRoles[index]}`;
      const washerId=`${prefix}-${gearRoles[index]}-washer`;
      const retainerId=`${prefix}-${gearRoles[index]}-retainer`;
      nodes.push(
        {id:bearingId,assetId:'RUCA_JEWEL',parentId:bridgeId,motionRole:'fixed-bearing',fixed:true},
        {id:shaftId,assetId:shaftAssetId,parentId:bearingId,motionRole:'driven-shaft'},
        {id:gearId,assetId,parentId:shaftId,motionRole:gearRoles[index]},
        {id:washerId,assetId:'RUCA_THRUST_WASHER',parentId:shaftId,motionRole:'fixed-axial-control',fixed:true},
        {id:retainerId,assetId:'RUCA_RETAINER',parentId:shaftId,motionRole:'fixed-retainer',fixed:true}
      );
      supportLinks.push(
        {id:`${bridgeId}-supports-${bearingId}`,type:'supports',parentId:bridgeId,childId:bearingId},
        {id:`${bearingId}-locates-${shaftId}`,type:'locates',parentId:bearingId,childId:shaftId},
        {id:`${shaftId}-carries-${gearId}`,type:'carries',parentId:shaftId,childId:gearId},
        {id:`${shaftId}-retains-${washerId}`,type:'retains',parentId:shaftId,childId:washerId},
        {id:`${shaftId}-retains-${retainerId}`,type:'retains',parentId:shaftId,childId:retainerId}
      );
      gearNodeIds.push(gearId);
      shaftNodeIds.push(shaftId);
    });
    return {prefix,bridgeId,nodes,supportLinks,gearNodeIds,shaftNodeIds};
  }

  const renderManifests={};

  const INSTRUMENT_FAMILY_AUTHORITY=model.freeze({
    id:'RUCA_SEVEN_INSTRUMENT_FAMILY',
    construction:'SKELETONIZED_FUNCTIONAL_ANALOG',
    housing:'machined-circular-recessed',
    face:'calibrated-analog-over-supported-movement',
    layerOrder:['deep','movement','face','indicator','readout','glass'],
    layers:{
      deep:['blackened-structural-plate','recessed-shadow','bearing-seats','shaft-seats'],
      movement:['supported-bridge','jewel-bearing','shaft','pivot','hub','meshed-drive','regulator'],
      face:['metric-specific-scale','major-graduations','minor-graduations','operating-zones'],
      indicator:['physical-needle-or-metric-specific-indicator'],
      readout:['recessed-integrated-live-aperture'],
      glass:['smoked-glass','restrained-reflection','subtle-red-edge-illumination']
    },
    supportChain:['bridge','bearing','shaft','pivot','hub','driven-component'],
    supportRelationships:[
      'bridge-supports-bearing',
      'bearing-locates-shaft',
      'shaft-establishes-pivot',
      'shaft-carries-hub',
      'hub-carries-driven-component'
    ],
    materials:{
      structuralPlate:'RM_BLACK_OXIDE',
      machinedSteel:'RM_STEEL_BRUSHED',
      polishedSteel:'RM_STEEL_POLISHED',
      warmAccent:'RM_BRASS',
      jewelBearing:'RM_RUBY_JEWEL',
      glass:'smoked-glass'
    },
    illumination:{primary:'restrained-red',metalResponse:'warm-specular',constantGlow:false},
    readout:{mount:'recessed-integrated',floating:false,shape:'instrument-aperture'},
    motion:{
      authority:'HOME_GAUGE_MASTER_MOTION',
      source:'telemetry-derived',
      synchronized:true,
      independentDecorativeMotion:false,
      idle:'settled-mechanical-rest'
    },
    quality:{
      distanceRead:['label','major-scale','indicator','live-value','state'],
      closeRead:['bridges','jewel-bearings','shafts','pivots','hubs','material-texture','synchronized-movement'],
      prohibit:['wireframe','flat-vector-diagram','clip-art-gear','floating-decorative-gear','prototype-circle','cloned-internals','repeated-bottom-heavy-layout','floating-rectangular-readout']
    }
  });

  function instrumentDescriptor(options){
    const primaryIndicator=options.indicator || null;
    const indicators=options.indicators || (primaryIndicator ? [primaryIndicator] : []);
    return {
      identity:{
        id:options.identityId,
        label:options.label,
        title:options.title,
        function:options.function
      },
      metric:{
        kind:options.metricKind,
        telemetryKeys:[...options.telemetryKeys],
        primaryTelemetryKey:options.primaryTelemetryKey || options.telemetryKeys[0],
        unit:options.unit,
        truthPolicy:'telemetry-only-no-fabrication',
        unavailableState:'checking'
      },
      scale:{...options.scale},
      ...(primaryIndicator ? {indicator:{...primaryIndicator}} : {}),
      indicators:indicators.map(indicator=>({...indicator})),
      readout:{
        mount:'recessed-integrated',
        floating:false,
        shape:'instrument-aperture',
        label:options.readoutLabel,
        channels:options.readoutChannels.map(channel=>({...channel}))
      },
      architecture:{
        id:options.architectureId,
        type:options.architectureType,
        layout:options.layout,
        signature:options.signature,
        dominantElement:options.dominantElement,
        elements:[...options.elements],
        cloneOf:null
      },
      regulator:options.regulator ? {...options.regulator} : null,
      layers:{
        order:['deep','movement','face','indicator','readout','glass'],
        deep:['blackened-structural-plate','recessed-shadow','bearing-seats','shaft-seats'],
        movement:[...options.movementLayer],
        face:[...options.faceLayer],
        indicator:indicators.map(indicator=>indicator.type),
        readout:['recessed-integrated-live-aperture'],
        glass:['smoked-glass','restrained-reflection','subtle-red-edge-illumination']
      },
      supports:{
        chain:['bridge','bearing','shaft','pivot','hub','driven-component'],
        bridgeAssetId:options.bridgeAssetId,
        shaftAssetId:options.shaftAssetId,
        bearingAssetId:'RUCA_JEWEL',
        pivot:'jewel-seated-supported-axis',
        hub:'integral-machined-hub',
        relationships:[
          'bridge-supports-bearing',
          'bearing-locates-shaft',
          'shaft-establishes-pivot',
          'shaft-carries-hub',
          options.mechanicalRelationship
        ]
      },
      motion:{
        authority:'HOME_GAUGE_MASTER_MOTION',
        source:'telemetry-derived',
        telemetryKeys:[...options.motionTelemetryKeys],
        relationship:options.mechanicalRelationship,
        cadence:options.cadence,
        smoothing:'damped-mechanical-response',
        synchronized:true,
        independentDecorativeMotion:false
      },
      materials:{...INSTRUMENT_FAMILY_AUTHORITY.materials},
      quality:{
        family:'RUCA_SEVEN_INSTRUMENT_FAMILY',
        distanceRead:['label','major-scale','indicator','live-value','state'],
        closeRead:['bridges','jewel-bearings','shafts','pivots','hubs','material-texture','synchronized-movement'],
        uniqueArchitecture:true,
        bottomHeavyRepeat:false,
        floatingDecorativeGears:false,
        floatingRectangularReadout:false,
        wireframe:false,
        clipArt:false
      }
    };
  }

  function createGaugeAssembly(metricKey,configuration){
    const nodes=[];
    const driveLinks=[];
    const supportLinks=[];
    const inputs=[];
    const outputs=[];
    const poseTrains=[];
    const firstDriverByChannel={};

    configuration.trains.forEach((train,index)=>{
      const built=trainNodes(metricKey,index,train,configuration.shaft);
      nodes.push(...built.nodes);
      supportLinks.push(...built.supportLinks);
      const channel=train.channel || 'primary';
      const phaseDegrees=Number(train.phase || 0)*360;
      inputs.push({
        id:`${metricKey}-${channel}-input`,
        channel,
        nodeId:built.gearNodeIds[0],
        ratio:Number(train.driveScale ?? configuration.driveScale),
        phaseDegrees,
        motionSource:'HOME_GAUGE_MASTER_MOTION'
      });
      for(let linkIndex=0;linkIndex<built.gearNodeIds.length-1;linkIndex+=1){
        const meshAxisDegrees=Number(train.meshAngles[linkIndex])*180/Math.PI;
        driveLinks.push({
          id:`${built.prefix}-mesh-${linkIndex+1}`,
          channel,
          type:'external-mesh',
          parentId:built.gearNodeIds[linkIndex],
          childId:built.gearNodeIds[linkIndex+1],
          meshAxisDegrees,
          installationDatum:train.installationDatum || configuration.installationDatum || 'preserve-render-pose'
        });
      }
      built.gearNodeIds.forEach((gearId,gearIndex)=>{
        driveLinks.push({
          id:`${built.prefix}-${gearIndex}-shaft-coupling`,
          channel,
          type:'rigid-shaft',
          parentId:gearId,
          childId:built.shaftNodeIds[gearIndex]
        });
      });
      outputs.push({
        id:`${metricKey}-${channel}-output`,
        channel,
        nodeId:built.gearNodeIds[built.gearNodeIds.length-1],
        mode:'derived'
      });
      firstDriverByChannel[channel]=built.gearNodeIds[0];
      poseTrains.push({
        channel,
        components:[...train.components],
        gearNodeIds:[...built.gearNodeIds],
        origin:[...train.origin],
        meshAngles:[...train.meshAngles],
        cadenceFactor:Number(train.cadenceFactor ?? 1),
        phase:Number(train.phase || 0),
        bridge:train.bridge
      });
    });

    if(configuration.balance){
      const channel=configuration.balance.channel || configuration.trains[0].channel || 'primary';
      const bridgeId=`${metricKey}-balance-bridge`;
      const bearingId=`${metricKey}-balance-bearing`;
      const shaftId=`${metricKey}-balance-shaft`;
      const balanceId=`${metricKey}-balance-wheel`;
      const fastenerId=`${metricKey}-balance-fastener`;
      const washerId=`${metricKey}-balance-washer`;
      const retainerId=`${metricKey}-balance-retainer`;
      nodes.push(
        {id:bridgeId,assetId:configuration.bridge,parentId:null,motionRole:'fixed-regulator-support',fixed:true},
        {id:fastenerId,assetId:'RUCA_FASTENER',parentId:bridgeId,motionRole:'fixed-retainer',fixed:true},
        {id:bearingId,assetId:'RUCA_JEWEL',parentId:bridgeId,motionRole:'fixed-bearing',fixed:true},
        {id:shaftId,assetId:configuration.shaft,parentId:bearingId,motionRole:'oscillating-shaft'},
        {id:balanceId,assetId:'RUCA_BALANCE_WHEEL',parentId:shaftId,motionRole:'regulator'},
        {id:washerId,assetId:'RUCA_THRUST_WASHER',parentId:shaftId,motionRole:'fixed-axial-control',fixed:true},
        {id:retainerId,assetId:'RUCA_RETAINER',parentId:shaftId,motionRole:'fixed-retainer',fixed:true}
      );
      supportLinks.push(
        {id:`${bridgeId}-retains-${fastenerId}`,type:'retains',parentId:bridgeId,childId:fastenerId},
        {id:`${bridgeId}-supports-${bearingId}`,type:'supports',parentId:bridgeId,childId:bearingId},
        {id:`${bearingId}-locates-${shaftId}`,type:'locates',parentId:bearingId,childId:shaftId},
        {id:`${shaftId}-carries-${balanceId}`,type:'carries',parentId:shaftId,childId:balanceId},
        {id:`${shaftId}-retains-${washerId}`,type:'retains',parentId:shaftId,childId:washerId},
        {id:`${shaftId}-retains-${retainerId}`,type:'retains',parentId:shaftId,childId:retainerId}
      );
      driveLinks.push({
        id:`${metricKey}-${channel}-regulator-coupling`,
        channel,
        type:'shared-oscillator',
        parentId:firstDriverByChannel[channel],
        childId:balanceId,
        coupling:configuration.balance.coupling
      });
      driveLinks.push({
        id:`${metricKey}-${channel}-balance-shaft-coupling`,
        channel,
        type:'rigid-shaft',
        parentId:balanceId,
        childId:shaftId
      });
    }

    registry.define({
      id:`HOME_${metricKey.toUpperCase()}_GAUGE_ASSEMBLY`,
      type:'assembly',
      kind:'gauge-drivetrain',
      extendsAssetId:'HOME_GAUGE_ASSEMBLY',
      metricKey,
      role:configuration.role,
      inputs,
      nodes,
      driveLinks,
      supportLinks,
      outputs,
      metadata:{
        displayRole:configuration.role,
        balanceProfile:configuration.balanceProfile || {base:4.5,gain:.035},
        instrument:configuration.instrument ? {...configuration.instrument} : null
      }
    });
    renderManifests[metricKey]={
      driveScale:Number(configuration.driveScale),
      motionModel:'RUCA_SHARED_DRIVETRAIN_RUNTIME',
      outputIndicatorMode:configuration.outputIndicatorMode || 'derived',
      ...(configuration.composition ? {composition:{...configuration.composition}} : {}),
      ...(configuration.instrument ? {instrument:{...configuration.instrument}} : {}),
      balance:configuration.balance ? {...configuration.balance} : null,
      components:{
        balance:'RUCA_BALANCE_WHEEL',
        bearing:'RUCA_JEWEL',
        fastener:'RUCA_FASTENER',
        washer:'RUCA_THRUST_WASHER',
        retainer:'RUCA_RETAINER'
      },
      trains:poseTrains
    };
  }

  const GAUGE_CONFIGURATIONS=Object.freeze({
    cpu:{
      role:'direct-drive-reduction-output',driveScale:1,shaft:'RUCA_MAIN_SHAFT',bridge:'RUCA_BRIDGE_LARGE',installationDatum:'axis-locked',
      trains:[{channel:'primary',components:['RUCA_GEAR_12T','RUCA_GEAR_25T','RUCA_GEAR_19T'],origin:[.28,.72],meshAngles:[-.38,.35],phase:.12,bridge:'RUCA_BRIDGE_LARGE'}],
      balance:null,balanceProfile:{base:0,gain:0},
      composition:{id:'CPU_PRIMARY_COMPUTE_POWERTRAIN',type:'compute-powertrain',emphasis:'flagship-skeletonized-reduction',indicator:'physical-utilization-needle'},
      instrument:instrumentDescriptor({
        identityId:'CPU_PRIMARY_COMPUTE_POWERTRAIN',label:'CPU',title:'PRIMARY COMPUTE POWERTRAIN',function:'processor-utilization',
        metricKind:'utilization-percent',telemetryKeys:['cpuLoad'],primaryTelemetryKey:'cpuLoad',unit:'%',
        scale:{kind:'calibrated-perimeter',min:0,max:100,unit:'%',startAngleDegrees:-132,endAngleDegrees:132,majorStep:20,minorStep:5,landmarks:[0,20,40,60,80,100],zones:[{id:'nominal',from:0,to:74},{id:'high',from:75,to:89},{id:'critical',from:90,to:100}]},
        indicator:{id:'cpu-load-needle',type:'physical-needle',channel:'primary',telemetryKey:'cpuLoad',direction:'clockwise',pivot:'primary-output-hub',angleRangeDegrees:[-132,132]},
        readoutLabel:'LOAD',readoutChannels:[{id:'load',telemetryKey:'cpuLoad',format:'integer-percent'}],
        architectureId:'CPU_FLAGSHIP_SKELETONIZED_REDUCTION',architectureType:'direct-reduction-powertrain',layout:'lower-reduction-train-with-upper-supported-balance-regulator',signature:'dense-flagship-reduction-with-open-supported-bridge',dominantElement:'three-stage-reduction-train-and-balance-regulator',
        elements:['drive-wheel','center-reduction-wheel','output-wheel','supported-bridge','ruby-output-pivot','needle-output-shaft'],
        regulator:{type:'escapement-regulator',role:'powertrain-cadence-reference',telemetryCoupling:'cpuLoad'},
        movementLayer:['three-stage-reduction-train','supported-bridge','three-jewel-bearings','three-shafts','three-machined-hubs','escapement-regulator'],faceLayer:['0-100-utilization-scale','major-minor-graduations','high-load-zone'],
        bridgeAssetId:'RUCA_BRIDGE_LARGE',shaftAssetId:'RUCA_MAIN_SHAFT',motionTelemetryKeys:['cpuLoad'],mechanicalRelationship:'cpu-load-drives-output-needle-and-meshed-reduction-train',cadence:'flagship-responsive'
      })
    },
    gpu:{
      role:'transmission-carrier',driveScale:.40,shaft:'RUCA_MAIN_SHAFT',bridge:'RUCA_BRIDGE_LARGE',
      trains:[{channel:'primary',components:['RUCA_GEAR_14T','RUCA_GEAR_16T','RUCA_GEAR_28T'],origin:[.24,.60],meshAngles:[-.70,-.20],phase:.34,bridge:'RUCA_BRIDGE_LARGE'}],
      balance:{channel:'primary',x:.72,y:.55,radius:.10,coupling:13},
      composition:{id:'GPU_ASYMMETRIC_POWER_DELIVERY',type:'power-delivery',emphasis:'right',railCount:3,zoneCount:12,indicator:'offset-power-sweep'},
      instrument:instrumentDescriptor({
        identityId:'GPU_HIGH_OUTPUT_ACCELERATOR',label:'GPU',title:'HIGH-OUTPUT ACCELERATOR',function:'graphics-output-utilization',
        metricKind:'output-percent',telemetryKeys:['gpuLoad'],primaryTelemetryKey:'gpuLoad',unit:'%',
        scale:{kind:'offset-power-perimeter',min:0,max:100,unit:'%',startAngleDegrees:-145,endAngleDegrees:118,majorStep:20,minorStep:5,landmarks:[0,20,40,60,80,100],zones:[{id:'nominal',from:0,to:69},{id:'power',from:70,to:89},{id:'critical',from:90,to:100}]},
        indicator:{id:'gpu-output-needle',type:'physical-needle',channel:'primary',telemetryKey:'gpuLoad',direction:'clockwise',pivot:'offset-output-hub',angleRangeDegrees:[-145,118]},
        readoutLabel:'OUTPUT',readoutChannels:[{id:'output',telemetryKey:'gpuLoad',format:'integer-percent'}],
        architectureId:'GPU_ASYMMETRIC_POWER_DELIVERY',architectureType:'high-output-transmission',layout:'right-biased-asymmetric-power-rails',signature:'one-heavy-output-wheel-with-offset-regulator-and-bridge',dominantElement:'large-output-gear',
        elements:['three-power-rails','large-output-gear','two-driven-regulator-gears','offset-bridge','visible-output-shaft','ruby-bearings','balance-regulator'],
        regulator:{type:'offset-balance-regulator',role:'high-output-cadence-control',telemetryCoupling:'gpuLoad'},
        movementLayer:['heavy-three-stage-power-train','offset-supported-bridge','three-jewel-bearings','output-shaft','balance-regulator'],faceLayer:['0-100-output-scale','major-minor-graduations','high-output-power-zone'],
        bridgeAssetId:'RUCA_BRIDGE_LARGE',shaftAssetId:'RUCA_MAIN_SHAFT',motionTelemetryKeys:['gpuLoad'],mechanicalRelationship:'gpu-output-drives-needle-power-rails-and-heavy-meshed-transmission',cadence:'high-output-responsive'
      })
    },
    ram:{
      role:'capacity-index-drive',driveScale:.24,shaft:'RUCA_AUX_SHAFT',bridge:'RUCA_BRIDGE_SMALL',
      trains:[{channel:'primary',components:['RUCA_GEAR_13T','RUCA_GEAR_24T','RUCA_GEAR_20T'],origin:[.24,.58],meshAngles:[-.75,-.12],phase:.08,bridge:'RUCA_BRIDGE_SMALL'}],
      balance:{channel:'primary',x:.70,y:.50,radius:.075,coupling:12},
      composition:{id:'RAM_CAPACITY_BANK',type:'memory-bank',emphasis:'stacked-cells',bankCount:8,indicator:'controlled-capacity-sweep'},
      instrument:instrumentDescriptor({
        identityId:'RAM_MEMORY_BANK_CAPACITY_INDEX',label:'RAM',title:'MEMORY BANK / CAPACITY INDEX',function:'memory-used-percent',
        metricKind:'used-capacity-percent',telemetryKeys:['ramLoad','ramUsed','ramTotal'],primaryTelemetryKey:'ramLoad',unit:'%',
        scale:{kind:'capacity-index',min:0,max:100,unit:'%',startAngleDegrees:-133,endAngleDegrees:133,majorStep:25,minorStep:5,landmarks:[0,25,50,75,100],zones:[{id:'reserve',from:0,to:49},{id:'used',from:50,to:84},{id:'pressure',from:85,to:100}]},
        indicator:{id:'ram-capacity-index',type:'indexed-capacity-pointer',channel:'primary',telemetryKey:'ramLoad',direction:'clockwise',pivot:'capacity-index-hub',angleRangeDegrees:[-133,133]},
        readoutLabel:'USED',readoutChannels:[{id:'used-percent',telemetryKey:'ramLoad',format:'integer-percent'}],
        architectureId:'RAM_CAPACITY_BANK',architectureType:'indexed-memory-bank',layout:'paired-vertical-banks-with-central-reserve-band',signature:'stacked-memory-cells-with-quieter-indexing-drive',dominantElement:'paired-memory-bank-array',
        elements:['eight-memory-cells','paired-bank-rails','reserve-used-band','index-wheel','small-regulator','supported-index-shaft'],
        regulator:{type:'compact-index-regulator',role:'quiet-capacity-index-control',telemetryCoupling:'ramLoad'},
        movementLayer:['quiet-three-stage-index-drive','small-supported-bridge','three-jewel-bearings','index-shaft','compact-regulator'],faceLayer:['0-100-used-scale','25-50-75-100-landmarks','reserve-used-band'],
        bridgeAssetId:'RUCA_BRIDGE_SMALL',shaftAssetId:'RUCA_AUX_SHAFT',motionTelemetryKeys:['ramLoad'],mechanicalRelationship:'ram-used-percent-advances-index-pointer-banks-and-reduction-train',cadence:'quiet-deliberate'
      })
    },
    storage:{
      role:'reserve-index-drive',driveScale:-.36,shaft:'RUCA_AUX_SHAFT',bridge:'RUCA_BRIDGE_LARGE',
      trains:[{channel:'primary',components:['RUCA_GEAR_12T','RUCA_GEAR_32T','RUCA_GEAR_18T'],origin:[.31,.76],meshAngles:[-.18,-.66],phase:.20,bridge:'RUCA_BRIDGE_LARGE'}],
      balance:{channel:'primary',x:.28,y:.53,radius:.092,coupling:11},
      composition:{id:'STORAGE_RESERVE_DRIVE',type:'drive-reserve',emphasis:'platter-and-head',platterCount:3,indicator:'telemetry-read-head'},
      instrument:instrumentDescriptor({
        identityId:'STORAGE_RESERVE_DRIVE_READ_HEAD',label:'STORAGE',title:'RESERVE DRIVE / READ HEAD',function:'free-storage-capacity',
        metricKind:'free-capacity-absolute',telemetryKeys:['storageFree','storageUsed'],primaryTelemetryKey:'storageFree',unit:'GB/TB',
        scale:{kind:'telemetry-capacity-reserve',min:0,maxMode:'telemetry-capacity-or-canonical',canonicalMaxGB:2048,unit:'GB/TB',unitPolicy:'GB-below-1024-TB-at-or-above-1024',startAngleDegrees:-118,endAngleDegrees:118,majorLandmarks:[{valueGB:0,label:'0'},{valueGB:512,label:'512GB'},{valueGB:1024,label:'1TB'},{valueGB:1536,label:'1.5TB'},{valueGB:2048,label:'2TB'}],minorStepGB:128,zones:[{id:'low-reserve',fromPercent:0,toPercent:19},{id:'working-reserve',fromPercent:20,toPercent:74},{id:'high-reserve',fromPercent:75,toPercent:100}]},
        indicator:{id:'storage-read-head',type:'physical-read-head-actuator',channel:'primary',telemetryKey:'storageFree',direction:'reserve-outward',pivot:'actuator-jewel-pivot',angleRangeDegrees:[-58,24]},
        readoutLabel:'FREE',readoutChannels:[{id:'free-capacity',telemetryKey:'storageFree',format:'adaptive-gb-tb'}],
        architectureId:'STORAGE_RESERVE_DRIVE',architectureType:'platter-read-head-reserve',layout:'left-platter-stack-with-right-supported-actuator',signature:'dominant-platter-drum-and-telemetry-read-head',dominantElement:'three-layer-platter-drum',
        elements:['three-layer-platter','platter-hub','actuator-arm','read-head','supported-actuator-pivot','reserve-band','reduction-gear'],
        regulator:{type:'actuator-damping-regulator',role:'read-head-position-control',telemetryCoupling:'storageFree'},
        movementLayer:['platter-drum','supported-actuator-bridge','actuator-shaft','jewel-pivot','reduction-train'],faceLayer:['actual-gb-tb-capacity-scale','reserve-graduations','low-reserve-zone'],
        bridgeAssetId:'RUCA_BRIDGE_LARGE',shaftAssetId:'RUCA_AUX_SHAFT',motionTelemetryKeys:['storageFree','storageUsed'],mechanicalRelationship:'free-capacity-positions-read-head-and-drives-reserve-reduction-train',cadence:'slow-reserve-tracking'
      })
    },
    network:{
      role:'download-upload-gears',driveScale:.36,shaft:'RUCA_AUX_SHAFT',bridge:'RUCA_BRIDGE_SMALL',
      trains:[
        {channel:'download',components:['RUCA_PINION_SMALL','RUCA_GEAR_FINE_18T','RUCA_PINION_MEDIUM'],origin:[.22,.63],meshAngles:[-.76,-.22],phase:.04,bridge:'RUCA_BRIDGE_SMALL'},
        {channel:'upload',driveScale:.36,cadenceFactor:15/14,components:['RUCA_PINION_SMALL','RUCA_GEAR_FINE_18T','RUCA_PINION_MEDIUM'],origin:[.78,.63],meshAngles:[-2.38,-2.92],phase:.36,bridge:'RUCA_BRIDGE_SMALL'}
      ],
      balance:{channel:'download',x:.50,y:.54,radius:.080,coupling:13},
      composition:{id:'NETWORK_BIDIRECTIONAL_TRAFFIC',type:'dual-traffic',emphasis:'paired-channels',channels:['download','upload'],indicator:'opposed-signal-sweeps'},
      instrument:instrumentDescriptor({
        identityId:'NETWORK_BIDIRECTIONAL_SIGNAL_TRANSMISSION',label:'NETWORK',title:'BIDIRECTIONAL SIGNAL TRANSMISSION',function:'independent-download-upload-throughput',
        metricKind:'dual-throughput',telemetryKeys:['networkDown','networkUp'],primaryTelemetryKey:'networkDown',unit:'Mbps',
        scale:{kind:'dual-independent-channel',channels:[{id:'download',min:0,max:1000,unit:'Mbps',startAngleDegrees:-148,endAngleDegrees:-32,direction:'clockwise',majorStep:250,minorStep:50},{id:'upload',min:0,max:100,unit:'Mbps',startAngleDegrees:-32,endAngleDegrees:-148,direction:'counter-clockwise',majorStep:25,minorStep:5}],sharedOrigin:false},
        indicators:[{id:'network-download-indicator',type:'physical-channel-needle',channel:'download',telemetryKey:'networkDown',direction:'clockwise',pivot:'download-output-hub',angleRangeDegrees:[-148,-32]},{id:'network-upload-indicator',type:'physical-channel-needle',channel:'upload',telemetryKey:'networkUp',direction:'counter-clockwise',pivot:'upload-output-hub',angleRangeDegrees:[-32,-148]}],
        readoutLabel:'DL / UL',readoutChannels:[{id:'download',telemetryKey:'networkDown',format:'adaptive-throughput'},{id:'upload',telemetryKey:'networkUp',format:'adaptive-throughput'}],
        architectureId:'NETWORK_BIDIRECTIONAL_TRAFFIC',architectureType:'dual-channel-signal-transmission',layout:'bilateral-inbound-outbound-with-central-transfer-regulator',signature:'independent-opposed-channels-meeting-at-central-transfer',dominantElement:'central-transfer-regulator',
        elements:['download-rail','upload-rail','download-indicator','upload-indicator','two-supported-trains','central-transfer-regulator','independent-channel-hubs'],
        regulator:{type:'central-transfer-regulator',role:'bidirectional-channel-cadence-control',telemetryCoupling:'networkDown-networkUp'},
        movementLayer:['download-meshed-train','upload-meshed-train','two-supported-bridges','six-jewel-bearings','central-regulator'],faceLayer:['independent-download-scale','independent-upload-scale','directional-channel-graduations'],
        bridgeAssetId:'RUCA_BRIDGE_SMALL',shaftAssetId:'RUCA_AUX_SHAFT',motionTelemetryKeys:['networkDown','networkUp'],mechanicalRelationship:'download-and-upload-telemetry-drive-independent-opposed-trains-and-indicators',cadence:'independent-traffic-responsive'
      })
    },
    thermal:{
      role:'temperature-regulator',driveScale:.22,shaft:'RUCA_AUX_SHAFT',bridge:'RUCA_BRIDGE_LARGE',
      trains:[{channel:'primary',components:['RUCA_GEAR_10T','RUCA_GEAR_24T','RUCA_GEAR_30T'],origin:[.72,.60],meshAngles:[-2.75,-2.15],phase:.27,bridge:'RUCA_BRIDGE_LARGE'}],
      balance:{channel:'primary',x:.31,y:.57,radius:.088,coupling:10},balanceProfile:{base:4,gain:.04},
      composition:{id:'THERMAL_OPERATING_ENVELOPE',type:'thermal-envelope',emphasis:'calibrated-danger-band',zones:['low','nominal','hot','critical'],indicator:'mechanical-temperature-needle'},
      instrument:instrumentDescriptor({
        identityId:'THERMAL_OPERATING_ENVELOPE',label:'THERMAL',title:'THERMAL OPERATING ENVELOPE',function:'system-temperature-celsius',
        metricKind:'temperature-celsius',telemetryKeys:['cpuTemp','gpuTemp'],primaryTelemetryKey:'cpuTemp',unit:'°C',
        scale:{kind:'calibrated-celsius-envelope',min:20,max:100,unit:'°C',startAngleDegrees:-137,endAngleDegrees:137,majorStep:10,minorStep:2,landmarks:[20,30,40,50,60,70,80,90,100],zones:[{id:'low',from:20,to:39},{id:'nominal',from:40,to:69},{id:'hot',from:70,to:84},{id:'critical',from:85,to:100}]},
        indicator:{id:'thermal-temperature-needle',type:'physical-temperature-needle',channel:'primary',telemetryKey:'cpuTemp-or-gpuTemp',direction:'clockwise',pivot:'thermal-regulator-hub',angleRangeDegrees:[-137,137]},
        readoutLabel:'TEMP',readoutChannels:[{id:'temperature',telemetryKey:'cpuTemp-or-gpuTemp',format:'integer-celsius'}],
        architectureId:'THERMAL_REGULATED_ENVELOPE',architectureType:'temperature-regulator',layout:'radial-temperature-envelope-with-midline-coil-regulator',signature:'classroom-analog-temperature-face-over-supported-regulator',dominantElement:'large-physical-temperature-needle',
        elements:['celsius-graduations','four-thermal-zones','temperature-needle','thermal-output-shaft','supported-pivot','balance-regulator','reduction-train'],
        regulator:{type:'thermal-balance-regulator',role:'temperature-cadence-control',telemetryCoupling:'cpuTemp-or-gpuTemp'},
        movementLayer:['temperature-reduction-train','supported-regulator-bridge','three-jewel-bearings','needle-shaft','balance-regulator'],faceLayer:['20-100-celsius-scale','ten-degree-major-graduations','two-degree-minor-graduations','four-operating-zones'],
        bridgeAssetId:'RUCA_BRIDGE_LARGE',shaftAssetId:'RUCA_AUX_SHAFT',motionTelemetryKeys:['cpuTemp','gpuTemp'],mechanicalRelationship:'live-celsius-telemetry-positions-needle-and-regulates-meshed-temperature-train',cadence:'measured-thermal-response'
      })
    }
  });

  Object.entries(GAUGE_CONFIGURATIONS).forEach(([metricKey,configuration])=>createGaugeAssembly(metricKey,configuration));

  const assemblyIds=Object.freeze(Object.fromEntries(
    Object.keys(GAUGE_CONFIGURATIONS).map(key=>[key,`HOME_${key.toUpperCase()}_GAUGE_ASSEMBLY`])
  ));
  const runtime=new core.DrivetrainRuntime(registry);
  const compiled=runtime.compileMany(Object.values(assemblyIds));
  const validation=runtime.validator.validateAll(Object.values(assemblyIds));
  if(!validation.valid){
    throw new Error(`RUCA gauge assembly validation failed: ${validation.errors.map(error=>error.message).join('; ')}`);
  }
  registry.seal?.();
  const components=Object.freeze(Object.fromEntries(
    registry.ids({includeAbstract:false})
      .filter(id=>registry.resolveDefinition(id).type!=='assembly')
      .map(id=>[id,registry.resolve(id)])
  ));
  const assemblies=Object.freeze(Object.fromEntries(
    Object.entries(assemblyIds).map(([key,id])=>[key,registry.resolve(id)])
  ));

  const gaugeRenderManifests=model.freeze({
    pressureAngle:20,
    renderer:'PASS59_PHYSICAL_MATERIAL_LIBRARY',
    familyAuthority:INSTRUMENT_FAMILY_AUTHORITY,
    ...renderManifests
  });

  global.RUCA_MECHANICAL_ASSET_REGISTRY=registry;
  global.RUCA_MECHANICAL_COMPONENTS=components;
  global.RUCA_GAUGE_ASSEMBLIES=assemblies;
  global.RUCA_GAUGE_RENDER_MANIFESTS=gaugeRenderManifests;
  global.RUCA_COMPILED_GAUGE_DRIVETRAINS=compiled;
  global.RUCA_MECHANICAL_RUNTIME=Object.freeze({
    version:VERSION,
    owner:'RUCA_SHARED_DRIVETRAIN_RUNTIME',
    registry,
    runtime,
    validator:runtime.validator,
    assemblyIds,
    assemblies,
    compiled,
    validation,
    getAssembly(key){ return assemblies[key] || null; },
    getCompiled(key){ return compiled[key] || null; }
  });
})(typeof window!=='undefined' ? window : globalThis);
