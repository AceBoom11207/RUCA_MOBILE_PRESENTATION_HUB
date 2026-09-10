(function rucaCpuBabylonChamberModule(global){
  'use strict';

  const VERSION='C001.0.0';
  const mechanicalRuntime=global.RUCA_MECHANICAL_RUNTIME;
  const compiledDrivetrain=mechanicalRuntime?.getCompiled?.('cpu');
  const cpuAssembly=mechanicalRuntime?.getAssembly?.('cpu');
  const cpuRenderManifest=global.RUCA_GAUGE_RENDER_MANIFESTS?.cpu;
  if(!compiledDrivetrain || !cpuAssembly || !cpuRenderManifest){
    throw new Error('CPU renderer requires the shared RUCA drivetrain runtime');
  }
  const cpuTrain=cpuRenderManifest.trains[0];
  const CPU_GEAR_NODE_IDS=Object.freeze([...cpuTrain.gearNodeIds]);
  const CPU_GEAR_ASSETS=Object.freeze(CPU_GEAR_NODE_IDS.map(nodeId=>compiledDrivetrain.asset(nodeId)));
  const TOOTH_COUNTS=Object.freeze(CPU_GEAR_ASSETS.map(asset=>asset.teeth));
  const WORLD_UNITS_PER_MODULE=.05;
  const GEAR_MODULE=CPU_GEAR_ASSETS[0].module*WORLD_UNITS_PER_MODULE;
  const CPU_MESH_LINKS=Object.freeze(cpuAssembly.driveLinks.filter(link=>(
    link.channel==='primary' && link.type==='external-mesh'
  )));
  const BASE_CAMERA_FOV=.60;
  const CHAMBER_EXPANSION=1.25;
  const PASS63_LAYOUT=Object.freeze({
    cameraFov:2*Math.atan(CHAMBER_EXPANSION*Math.tan(BASE_CAMERA_FOV*.5)),
    dominantCenter:Object.freeze({x:-.99,y:-.81,z:.10}),
    inputAngle:125*Math.PI/180,
    outputAngle:-20*Math.PI/180,
    bridgeZ:.32,
    bridgeBossZ:.31,
    bridgeDepth:.075
  });
  const CPU_FLAGSHIP_REGULATOR=Object.freeze({
    center:Object.freeze({x:-.92,y:.78,z:.06}),
    radius:.70,
    yokeZ:.30,
    yokeDepth:.085,
    minimumAmplitudeDegrees:5.5,
    maximumAmplitudeDegrees:12.5
  });
  const runtime={
    state:'idle',
    backend:'pending',
    reason:'',
    canvas:null,
    gauge:null,
    engine:null,
    scene:null,
    camera:null,
    materialLibrary:null,
    gearNodes:[],
    gearCenters:[],
    pitchRadii:[],
    meshAxesDegrees:[],
    drivetrainInstallation:null,
    lastTransmission:null,
    activityLight:null,
    resizeObserver:null,
    lastWidth:0,
    lastHeight:0,
    geometryDirty:true,
    geometryReady:false,
    frameCount:0,
    totalDrawMs:0,
    maxDrawMs:0,
    lastDrawMs:0,
    lastRenderAt:0,
    lastPhase:0,
    lastDegreesPerSecond:0,
    lastTelemetryLevel:0,
    lastActivity:0,
    regulatorNode:null,
    regulatorLever:null,
    regulatorSpring:null,
    lastRegulatorAngle:0,
    themeRevision:-1,
    renderErrors:0,
    paused:false,
    initialization:null,
    fallbackReason:'',
    proofMount:null
  };

  function clamp(value,minimum=0,maximum=1){
    return Math.max(minimum,Math.min(maximum,Number(value) || 0));
  }

  function degToRad(value){
    return Number(value || 0)*Math.PI/180;
  }

  function cpuGaugeIsActive(){
    return document.visibilityState==='visible'
      && document.body?.dataset?.world==='home'
      && runtime.gauge?.isConnected===true;
  }

  function publish(){
    if(!runtime.canvas) return;
    const engineState=global.RUCA_BABYLON_ENGINE?.getState?.() || {};
    runtime.backend=engineState.backend || runtime.backend;
    runtime.canvas.dataset.renderer='PASS62_CPU_REAL_WORLD_MATERIALS';
    runtime.canvas.dataset.rendererVersion=VERSION;
    runtime.canvas.dataset.compositionPass='PASS63_CPU_MECHANICAL_LAYOUT';
    runtime.canvas.dataset.chamberExpansion=CHAMBER_EXPANSION.toFixed(2);
    runtime.canvas.dataset.renderState=runtime.state;
    runtime.canvas.dataset.renderBackend=runtime.backend;
    runtime.canvas.dataset.fallbackReason=runtime.fallbackReason || 'none';
    runtime.canvas.dataset.motionAuthority='HOME_GAUGE_MASTER_MOTION';
    runtime.canvas.dataset.engineCount=String(engineState.engineCount || 0);
    runtime.canvas.dataset.sceneCount=String(engineState.sceneCount || 0);
    runtime.canvas.dataset.renderLoopOwners='0';
    runtime.canvas.dataset.independentMotionOwners='0';
    runtime.canvas.dataset.transmissionModel=cpuAssembly.id;
    runtime.canvas.dataset.transmissionMotion=cpuAssembly.metadata.motionType;
    runtime.canvas.dataset.transmissionSource=cpuAssembly.motionAuthority;
    runtime.canvas.dataset.transmissionRuntime=compiledDrivetrain.owner;
    runtime.canvas.dataset.transmissionChain=CPU_GEAR_NODE_IDS
      .map(nodeId=>compiledDrivetrain.node(nodeId).motionRole)
      .join('>');
    runtime.canvas.dataset.driverInputRatio=Number(cpuAssembly.inputs[0].ratio).toFixed(3);
    runtime.canvas.dataset.gearToothSets=TOOTH_COUNTS.join(':');
    runtime.canvas.dataset.meshPairs='2';
    runtime.canvas.dataset.pointerPolicy='none';
    runtime.canvas.dataset.flagshipArchitecture='SUPPORTED_BALANCE_REGULATOR_YOKE';
    runtime.canvas.dataset.regulatorMotionAuthority='HOME_GAUGE_MASTER_MOTION';
    runtime.canvas.dataset.regulatorTelemetrySource='cpuLoad';
    runtime.canvas.dataset.regulatorAngleDegrees=runtime.lastRegulatorAngle.toFixed(4);
    runtime.canvas.dataset.themeAuthority='CSS_CUSTOM_PROPERTIES';
    runtime.canvas.dataset.frameCount=String(runtime.frameCount);
    runtime.canvas.dataset.lastDrawMs=runtime.lastDrawMs.toFixed(3);
    runtime.canvas.dataset.averageDrawMs=(runtime.totalDrawMs/Math.max(1,runtime.frameCount)).toFixed(3);
    runtime.canvas.dataset.maxDrawMs=runtime.maxDrawMs.toFixed(3);
    if(runtime.lastTransmission){
      const channel=runtime.lastTransmission.channels[0];
      const stages=CPU_GEAR_NODE_IDS.map(nodeId=>channel.stages.find(stage=>stage.nodeId===nodeId));
      runtime.canvas.dataset.gearAngles=stages
        .map(stage=>stage.angleDegrees.toFixed(4))
        .join(':');
      runtime.canvas.dataset.gearAngularVelocities=stages
        .map(stage=>stage.angularVelocityDegreesPerSecond.toFixed(4))
        .join(':');
      runtime.canvas.dataset.contactPhaseMaxError=runtime.lastTransmission
        .maximumContactPhaseErrorDegrees
        .toFixed(8);
      runtime.canvas.dataset.masterStopped=String(runtime.lastTransmission.stopped);
    }
    runtime.gauge.dataset.cpuMechanicalRenderer=runtime.state==='ready'
      && runtime.geometryReady
      && runtime.canvas.classList.contains('is-ready')
      ? 'PASS62_CPU_REAL_WORLD_MATERIALS'
      : 'PASS59_PHYSICAL_MATERIAL_LIBRARY';
    runtime.gauge.dataset.cpuMechanicalBackend=runtime.backend;
    const sharedChassisSurface=runtime.gauge.querySelector('[data-mechanical-key="cpu"]');
    if(sharedChassisSurface) sharedChassisSurface.hidden=false;
  }

  function fallback(reason,error=null){
    runtime.state='fallback';
    runtime.fallbackReason=String(reason || 'fallback');
    runtime.reason=error ? String(error.message || error) : runtime.fallbackReason;
    runtime.canvas?.classList.remove('is-ready');
    runtime.canvas?.setAttribute('hidden','');
    global.RUCA_BABYLON_ENGINE?.setFallback?.(runtime.fallbackReason,error);
    runtime.scene=null;
    runtime.engine=null;
    runtime.camera=null;
    runtime.materialLibrary=null;
    runtime.gearNodes=[];
    runtime.drivetrainInstallation=null;
    runtime.regulatorNode=null;
    runtime.regulatorLever=null;
    runtime.regulatorSpring=null;
    runtime.lastRegulatorAngle=0;
    runtime.geometryDirty=true;
    runtime.geometryReady=false;
    runtime.lastWidth=0;
    runtime.lastHeight=0;
    publish();
    return false;
  }

  function createGearBody(B,scene,name,teeth,moduleSize,thickness,material){
    const pitchRadius=teeth*moduleSize*.5;
    const outerRadius=pitchRadius+moduleSize;
    const rootRadius=Math.max(moduleSize*2.5,pitchRadius-moduleSize*1.18);
    const innerRadius=Math.max(moduleSize*2.15,rootRadius*.57);
    const chamfer=Math.min(thickness*.24,moduleSize*.32);
    const segments=teeth*8;
    const ringProfiles=[
      {z:-thickness*.5,radiusInset:moduleSize*.12},
      {z:-thickness*.5+chamfer,radiusInset:0},
      {z:thickness*.5-chamfer,radiusInset:0},
      {z:thickness*.5,radiusInset:moduleSize*.12}
    ];
    const positions=[];
    const indices=[];
    const uvs=[];
    const outerIndex=[];
    const innerIndex=[];
    const radialAt=index=>{
      const step=index%8;
      if(step===0 || step===7) return rootRadius;
      if(step===1 || step===6) return (rootRadius+outerRadius)*.5;
      return outerRadius;
    };
    for(let layer=0;layer<ringProfiles.length;layer+=1){
      outerIndex[layer]=[];
      innerIndex[layer]=[];
      const profile=ringProfiles[layer];
      for(let index=0;index<segments;index+=1){
        const angle=index*Math.PI*2/segments;
        const toothRadius=Math.max(rootRadius,radialAt(index)-profile.radiusInset);
        outerIndex[layer].push(positions.length/3);
        positions.push(Math.cos(angle)*toothRadius,Math.sin(angle)*toothRadius,profile.z);
        uvs.push(index/segments,layer/(ringProfiles.length-1));
        innerIndex[layer].push(positions.length/3);
        positions.push(Math.cos(angle)*innerRadius,Math.sin(angle)*innerRadius,profile.z);
        // Radial V separation gives the face a usable directional shading basis.
        uvs.push(index/segments,1+layer/(ringProfiles.length-1));
      }
    }
    const next=index=>(index+1)%segments;
    for(let layer=0;layer<ringProfiles.length-1;layer+=1){
      for(let index=0;index<segments;index+=1){
        const n=next(index);
        indices.push(
          outerIndex[layer][index],outerIndex[layer+1][index],outerIndex[layer+1][n],
          outerIndex[layer][index],outerIndex[layer+1][n],outerIndex[layer][n],
          innerIndex[layer][index],innerIndex[layer+1][n],innerIndex[layer+1][index],
          innerIndex[layer][index],innerIndex[layer][n],innerIndex[layer+1][n]
        );
      }
    }
    for(const layer of [0,ringProfiles.length-1]){
      const front=layer===ringProfiles.length-1;
      for(let index=0;index<segments;index+=1){
        const n=next(index);
        if(front){
          indices.push(
            outerIndex[layer][index],outerIndex[layer][n],innerIndex[layer][n],
            outerIndex[layer][index],innerIndex[layer][n],innerIndex[layer][index]
          );
        }else{
          indices.push(
            outerIndex[layer][index],innerIndex[layer][n],outerIndex[layer][n],
            outerIndex[layer][index],innerIndex[layer][index],innerIndex[layer][n]
          );
        }
      }
    }
    const normals=[];
    B.VertexData.ComputeNormals(positions,indices,normals);
    const mesh=new B.Mesh(name,scene);
    const vertexData=new B.VertexData();
    vertexData.positions=positions;
    vertexData.indices=indices;
    vertexData.normals=normals;
    vertexData.uvs=uvs;
    vertexData.applyToMesh(mesh,true);
    mesh.convertToFlatShadedMesh();
    mesh.material=material;
    mesh.receiveShadows=true;
    return {mesh,pitchRadius,outerRadius,innerRadius};
  }

  function createChamferedBar(B,scene,name,start,end,width,depth,z,material){
    const length=Math.hypot(end.x-start.x,end.y-start.y);
    const chamfer=Math.min(width*.24,length*.035);
    const halfLength=length*.5;
    const halfWidth=width*.5;
    const points=[
      [-halfLength+chamfer,-halfWidth],
      [halfLength-chamfer,-halfWidth],
      [halfLength,-halfWidth+chamfer],
      [halfLength,halfWidth-chamfer],
      [halfLength-chamfer,halfWidth],
      [-halfLength+chamfer,halfWidth],
      [-halfLength,halfWidth-chamfer],
      [-halfLength,-halfWidth+chamfer]
    ];
    const positions=[];
    const indices=[];
    const zBack=z+depth*.5;
    const zFront=z-depth*.5;
    for(const plane of [zBack,zFront]){
      for(const point of points) positions.push(point[0],point[1],plane);
    }
    for(let index=1;index<points.length-1;index+=1){
      indices.push(0,index,index+1);
      indices.push(points.length,points.length+index+1,points.length+index);
    }
    for(let index=0;index<points.length;index+=1){
      const next=(index+1)%points.length;
      indices.push(index,next,points.length+next,index,points.length+next,points.length+index);
    }
    const normals=[];
    const uvs=[];
    for(let index=0;index<positions.length;index+=3){
      const localZ=positions[index+2]-z;
      // Longitudinal brushing on the face; depth keeps side/chamfer UVs valid.
      uvs.push(
        (positions[index]+localZ*.5)/length+.5,
        (positions[index+1]+localZ*.25)/width+.5
      );
    }
    B.VertexData.ComputeNormals(positions,indices,normals);
    const mesh=new B.Mesh(name,scene);
    const vertexData=new B.VertexData();
    vertexData.positions=positions;
    vertexData.indices=indices;
    vertexData.normals=normals;
    vertexData.uvs=uvs;
    vertexData.applyToMesh(mesh,true);
    mesh.position.x=(start.x+end.x)*.5;
    mesh.position.y=(start.y+end.y)*.5;
    mesh.rotation.z=Math.atan2(end.y-start.y,end.x-start.x);
    mesh.material=material;
    mesh.receiveShadows=true;
    return mesh;
  }

  function createSpoke(B,scene,name,radius,width,depth,angle,material,parent){
    const spoke=B.MeshBuilder.CreateBox(name,{width:radius,height:width,depth},scene);
    spoke.position.x=Math.cos(angle)*radius*.5;
    spoke.position.y=Math.sin(angle)*radius*.5;
    spoke.rotation.z=angle;
    spoke.material=material;
    spoke.parent=parent;
    return spoke;
  }

  function buildGearAssembly(B,scene,definition,material,shadowGenerator){
    const node=new B.TransformNode(`${definition.name}-drive`,scene);
    node.position.set(definition.x,definition.y,definition.z);
    const body=createGearBody(
      B,
      scene,
      `${definition.name}-toothed-ring`,
      definition.teeth,
      GEAR_MODULE,
      definition.thickness,
      material
    );
    const parts=[body.mesh];
    const hub=B.MeshBuilder.CreateCylinder(`${definition.name}-machined-hub`,{
      diameter:Math.max(.24,body.pitchRadius*.40),
      height:definition.thickness*1.20,
      tessellation:64
    },scene);
    hub.rotation.x=Math.PI*.5;
    hub.material=material;
    parts.push(hub);
    const spokeCount=definition.teeth>20 ? 6 : 5;
    for(let index=0;index<spokeCount;index+=1){
      const angle=index*Math.PI*2/spokeCount;
      const spoke=createSpoke(
        B,
        scene,
        `${definition.name}-spoke-${index+1}`,
        body.innerRadius*.93,
        Math.max(.055,GEAR_MODULE*.88),
        definition.thickness*.78,
        angle,
        material,
        null
      );
      parts.push(spoke);
    }
    const assembly=B.Mesh.MergeMeshes(parts,true,true,undefined,false,true) || body.mesh;
    assembly.name=`${definition.name}-machined-assembly`;
    assembly.material=material;
    assembly.parent=node;
    shadowGenerator?.addShadowCaster?.(assembly);
    return {node,mesh:assembly,pitchRadius:body.pitchRadius,outerRadius:body.outerRadius,teeth:definition.teeth};
  }

  function createShaftAssembly(B,scene,name,center,materials,shadowGenerator,withJewel){
    const shaft=B.MeshBuilder.CreateCylinder(`${name}-polished-shaft`,{
      diameter:.115,
      height:.70,
      tessellation:48
    },scene);
    shaft.rotation.x=Math.PI*.5;
    shaft.position.set(center.x,center.y,.04);
    shaft.material=materials.polishedSteel;

    const shoulder=B.MeshBuilder.CreateCylinder(`${name}-shaft-shoulder`,{
      diameter:.24,
      height:.075,
      tessellation:64
    },scene);
    shoulder.rotation.x=Math.PI*.5;
    shoulder.position.set(center.x,center.y,-.315);
    shoulder.material=materials.polishedSteel;
    const support=B.Mesh.MergeMeshes([shaft,shoulder],true,true,undefined,false,true) || shaft;
    support.name=`${name}-polished-shaft-assembly`;
    support.material=materials.polishedSteel;
    shadowGenerator?.addShadowCaster?.(support);

    if(withJewel){
      const seat=B.MeshBuilder.CreateTorus(`${name}-jewel-seat`,{
        diameter:.30,
        thickness:.055,
        tessellation:72
      },scene);
      seat.rotation.x=Math.PI*.5;
      seat.position.set(center.x,center.y,-.37);
      seat.material=materials.blackOxide;
      const jewel=B.MeshBuilder.CreateSphere(`${name}-ruby-bearing`,{
        diameter:.155,
        segments:48
      },scene);
      jewel.scaling.z=.48;
      jewel.position.set(center.x,center.y,-.415);
      jewel.material=materials.ruby;
      shadowGenerator?.addShadowCaster?.(seat);
      shadowGenerator?.addShadowCaster?.(jewel);
      return {support,seat,jewel};
    }
    return {support};
  }

  function createFastener(B,scene,name,x,y,materials,shadowGenerator){
    const recess=B.MeshBuilder.CreateCylinder(`${name}-recess`,{
      diameter:.33,
      height:.045,
      tessellation:48
    },scene);
    recess.rotation.x=Math.PI*.5;
    recess.position.set(x,y,.34);
    recess.material=materials.blackOxide;
    const head=B.MeshBuilder.CreateCylinder(`${name}-black-oxide-head`,{
      diameter:.25,
      height:.085,
      tessellation:48
    },scene);
    head.rotation.x=Math.PI*.5;
    head.position.set(x,y,.285);
    head.material=materials.screwSteel;
    const slotA=B.MeshBuilder.CreateBox(`${name}-slot-a`,{width:.14,height:.025,depth:.012},scene);
    slotA.position.set(x,y,.235);
    slotA.rotation.z=Math.PI*.25;
    slotA.material=materials.blackOxide;
    const slotB=slotA.clone(`${name}-slot-b`);
    slotB.rotation.z=-Math.PI*.25;
    const recessedHardware=B.Mesh.MergeMeshes([recess,slotA,slotB],true,true,undefined,false,true) || recess;
    recessedHardware.name=`${name}-recessed-hardware`;
    recessedHardware.material=materials.blackOxide;
    shadowGenerator?.addShadowCaster?.(head);
    return {recessedHardware,head};
  }

  function createFlagshipRegulator(B,scene,materials,shadowGenerator,outputCenter){
    const configuration=CPU_FLAGSHIP_REGULATOR;
    const center={...configuration.center};
    const supportAnchors=[
      {x:-1.78,y:1.47},
      {x:.08,y:1.53}
    ];

    const supportParts=supportAnchors.map((anchor,index)=>createChamferedBar(
      B,
      scene,
      `cpu-regulator-yoke-arm-${index+1}`,
      anchor,
      center,
      .14,
      configuration.yokeDepth,
      configuration.yokeZ,
      materials.polishedSteel
    ));
    supportParts.push(createChamferedBar(
      B,
      scene,
      'cpu-regulator-yoke-crossbrace',
      supportAnchors[0],
      supportAnchors[1],
      .078,
      configuration.yokeDepth*.78,
      configuration.yokeZ+.008,
      materials.polishedSteel
    ));
    const supportYoke=B.Mesh.MergeMeshes(supportParts,true,true,undefined,false,true) || supportParts[0];
    supportYoke.name='cpu-flagship-supported-regulator-yoke';
    supportYoke.material=materials.polishedSteel;
    supportYoke.receiveShadows=true;
    shadowGenerator?.addShadowCaster?.(supportYoke);

    supportAnchors.forEach((anchor,index)=>{
      createFastener(
        B,
        scene,
        `cpu-regulator-yoke-anchor-${index+1}`,
        anchor.x,
        anchor.y,
        materials,
        shadowGenerator
      );
    });

    const bearingSeat=B.MeshBuilder.CreateCylinder('cpu-regulator-bearing-seat',{
      diameter:.40,
      height:.105,
      tessellation:72
    },scene);
    bearingSeat.rotation.x=Math.PI*.5;
    bearingSeat.position.set(center.x,center.y,.265);
    bearingSeat.material=materials.blackOxide;
    bearingSeat.receiveShadows=true;

    const shockSetting=B.MeshBuilder.CreateTorus('cpu-regulator-shock-setting',{
      diameter:.335,
      thickness:.048,
      tessellation:72
    },scene);
    shockSetting.rotation.x=Math.PI*.5;
    shockSetting.position.set(center.x,center.y,.195);
    shockSetting.material=materials.polishedSteel;
    shadowGenerator?.addShadowCaster?.(bearingSeat);
    shadowGenerator?.addShadowCaster?.(shockSetting);

    const wheel=new B.TransformNode('cpu-telemetry-balance-regulator',scene);
    wheel.position.set(center.x,center.y,center.z);

    const outerRim=B.MeshBuilder.CreateTorus('cpu-regulator-balanced-rim',{
      diameter:configuration.radius*2,
      thickness:.120,
      tessellation:96
    },scene);
    outerRim.rotation.x=Math.PI*.5;
    outerRim.material=materials.brass;
    outerRim.parent=wheel;

    const innerRim=B.MeshBuilder.CreateTorus('cpu-regulator-inner-timing-ring',{
      diameter:configuration.radius*1.48,
      thickness:.045,
      tessellation:96
    },scene);
    innerRim.rotation.x=Math.PI*.5;
    innerRim.position.z=-.025;
    innerRim.material=materials.polishedSteel;
    innerRim.parent=wheel;

    for(let index=0;index<4;index+=1){
      const angle=index*Math.PI*.5;
      const spoke=createSpoke(
        B,
        scene,
        `cpu-regulator-skeleton-spoke-${index+1}`,
        configuration.radius*.88,
        .074,
        .072,
        angle,
        index%2===0 ? materials.polishedSteel : materials.brass,
        wheel
      );
      spoke.position.z=-.012;
      shadowGenerator?.addShadowCaster?.(spoke);
    }

    const hub=B.MeshBuilder.CreateCylinder('cpu-regulator-machined-hub',{
      diameter:.25,
      height:.17,
      tessellation:64
    },scene);
    hub.rotation.x=Math.PI*.5;
    hub.position.z=-.035;
    hub.material=materials.brass;
    hub.parent=wheel;

    const jewel=B.MeshBuilder.CreateSphere('cpu-regulator-visible-ruby-pivot',{
      diameter:.145,
      segments:48
    },scene);
    jewel.scaling.z=.46;
    jewel.position.z=-.155;
    jewel.material=materials.ruby;
    jewel.parent=wheel;

    for(let index=0;index<6;index+=1){
      const angle=index*Math.PI/3;
      const timingWeight=B.MeshBuilder.CreateCylinder(`cpu-regulator-timing-weight-${index+1}`,{
        diameter:.072,
        height:.105,
        tessellation:32
      },scene);
      timingWeight.rotation.x=Math.PI*.5;
      timingWeight.position.set(
        Math.cos(angle)*configuration.radius*.78,
        Math.sin(angle)*configuration.radius*.78,
        -.045
      );
      timingWeight.material=index%2===0 ? materials.brass : materials.screwSteel;
      timingWeight.parent=wheel;
      shadowGenerator?.addShadowCaster?.(timingWeight);
    }

    const springPath=[];
    const springSegments=88;
    for(let index=0;index<=springSegments;index+=1){
      const progress=index/springSegments;
      const angle=progress*Math.PI*5.6;
      const radius=.085+progress*.33;
      springPath.push(new B.Vector3(
        Math.cos(angle)*radius,
        Math.sin(angle)*radius,
        -.105
      ));
    }
    const spring=B.MeshBuilder.CreateTube('cpu-regulator-hairspring',{
      path:springPath,
      radius:.014,
      tessellation:8,
      cap:B.Mesh.CAP_ALL
    },scene);
    spring.material=materials.brass;
    spring.parent=wheel;

    const leverPivot={x:-.14,y:.14,z:.035};
    const lever=new B.TransformNode('cpu-regulator-coupling-lever',scene);
    lever.position.set(leverPivot.x,leverPivot.y,leverPivot.z);
    const outputVector={x:outputCenter.x-leverPivot.x,y:outputCenter.y-leverPivot.y};
    const regulatorVector={x:center.x-leverPivot.x,y:center.y-leverPivot.y};
    const leverParts=[
      createChamferedBar(B,scene,'cpu-regulator-output-link',{x:0,y:0},outputVector,.09,.068,0,materials.polishedSteel),
      createChamferedBar(B,scene,'cpu-regulator-fork-link',{x:0,y:0},regulatorVector,.105,.068,0,materials.brushedSteel)
    ];
    leverParts.forEach(part=>{
      part.parent=lever;
      shadowGenerator?.addShadowCaster?.(part);
    });

    const leverBearing=B.MeshBuilder.CreateCylinder('cpu-regulator-lever-bearing',{
      diameter:.24,
      height:.16,
      tessellation:56
    },scene);
    leverBearing.rotation.x=Math.PI*.5;
    leverBearing.position.set(leverPivot.x,leverPivot.y,-.015);
    leverBearing.material=materials.polishedSteel;
    const leverJewel=B.MeshBuilder.CreateSphere('cpu-regulator-lever-ruby-pivot',{
      diameter:.105,
      segments:40
    },scene);
    leverJewel.scaling.z=.45;
    leverJewel.position.set(leverPivot.x,leverPivot.y,-.115);
    leverJewel.material=materials.ruby;

    [outerRim,innerRim,hub,jewel,spring,leverBearing,leverJewel].forEach(mesh=>{
      shadowGenerator?.addShadowCaster?.(mesh);
    });
    return {wheel,lever,spring,center,supportAnchors};
  }

  function buildScene(engine,theme){
    const B=global.BABYLON;
    const scene=new B.Scene(engine);
    scene.clearColor=new B.Color4(0,0,0,0);
    scene.useRightHandedSystem=false;
    scene.skipPointerMovePicking=true;
    scene.autoClear=true;
    scene.autoClearDepthAndStencil=true;
    scene.imageProcessingConfiguration.toneMappingEnabled=true;
    scene.imageProcessingConfiguration.toneMappingType=B.ImageProcessingConfiguration.TONEMAPPING_ACES;
    scene.imageProcessingConfiguration.exposure=.88;
    scene.imageProcessingConfiguration.contrast=1.08;

    const camera=new B.FreeCamera('ruca-cpu-optical-camera',new B.Vector3(0,.14,-7.7),scene);
    camera.setTarget(new B.Vector3(0,-.06,.16));
    camera.fov=PASS63_LAYOUT.cameraFov;
    camera.minZ=.1;
    camera.maxZ=20;
    camera.inputs.clear();
    scene.activeCamera=camera;
    runtime.camera=camera;

    const materialLibrary=global.RUCA_BABYLON_MATERIAL_LIBRARY.build(scene,theme);
    runtime.materialLibrary=materialLibrary;
    const materials=materialLibrary.materials;

    const ambient=new B.HemisphericLight('ruca-cpu-ambient',new B.Vector3(-.15,-.35,-1),scene);
    ambient.intensity=.42;
    ambient.diffuse=new B.Color3(.55,.61,.65);
    ambient.groundColor=new B.Color3(.015,.018,.021);

    const key=new B.DirectionalLight('ruca-cpu-machining-key',new B.Vector3(.42,-.62,1),scene);
    key.position=new B.Vector3(-3.4,4.2,-4.8);
    key.intensity=1.65;
    key.diffuse=new B.Color3(.78,.86,.95);

    const rim=new B.PointLight('ruca-cpu-warm-rim',new B.Vector3(3.2,-2.4,-3.1),scene);
    rim.diffuse=new B.Color3(1,.38,.12);
    rim.intensity=1.85;
    rim.range=8;
    runtime.activityLight=rim;

    const regulatorKey=new B.PointLight('ruca-cpu-regulator-key',new B.Vector3(-.82,1.30,-2.35),scene);
    regulatorKey.diffuse=new B.Color3(.92,.84,.72);
    regulatorKey.intensity=2.25;
    regulatorKey.range=5.4;

    let shadowGenerator=null;
    try{
      shadowGenerator=new B.ShadowGenerator(1024,key);
      shadowGenerator.usePercentageCloserFiltering=true;
      shadowGenerator.filteringQuality=B.ShadowGenerator.QUALITY_MEDIUM;
      shadowGenerator.bias=.00045;
      shadowGenerator.normalBias=.012;
    }catch(_error){
      shadowGenerator=null;
    }

    const plateRecess=B.MeshBuilder.CreateTorus('cpu-baseplate-machined-recess',{
      diameter:4.57,
      thickness:.055,
      tessellation:128
    },scene);
    plateRecess.rotation.x=Math.PI*.5;
    plateRecess.position.z=.37;
    plateRecess.material=materials.brushedSteel;
    plateRecess.receiveShadows=true;

    const lowerTrack=B.MeshBuilder.CreateTorus('cpu-lower-polished-track',{
      diameter:3.80,
      thickness:.026,
      tessellation:128
    },scene);
    lowerTrack.rotation.x=Math.PI*.5;
    lowerTrack.position.z=.35;
    lowerTrack.material=materials.polishedSteel;

    [
      ['cpu-fastener-nw',-1.78,1.58],
      ['cpu-fastener-ne',1.78,1.58],
      ['cpu-fastener-sw',-1.78,-1.58],
      ['cpu-fastener-se',1.78,-1.58]
    ].forEach(entry=>createFastener(B,scene,entry[0],entry[1],entry[2],materials,shadowGenerator));

    const pitchRadii=TOOTH_COUNTS.map(teeth=>teeth*GEAR_MODULE*.5);
    const firstDistance=pitchRadii[0]+pitchRadii[1];
    const secondDistance=pitchRadii[1]+pitchRadii[2];
    const dominantCenter={...PASS63_LAYOUT.dominantCenter};
    const centers=[
      {
        x:dominantCenter.x+Math.cos(PASS63_LAYOUT.inputAngle)*firstDistance,
        y:dominantCenter.y+Math.sin(PASS63_LAYOUT.inputAngle)*firstDistance,
        z:dominantCenter.z
      },
      dominantCenter,
      {
        x:dominantCenter.x+Math.cos(PASS63_LAYOUT.outputAngle)*secondDistance,
        y:dominantCenter.y+Math.sin(PASS63_LAYOUT.outputAngle)*secondDistance,
        z:dominantCenter.z
      }
    ];
    runtime.pitchRadii=pitchRadii;
    runtime.gearCenters=centers.map(center=>({...center}));
    runtime.meshAxesDegrees=centers.slice(1).map((center,index)=>(
      Math.atan2(center.y-centers[index].y,center.x-centers[index].x)*180/Math.PI
    ));
    runtime.drivetrainInstallation=compiledDrivetrain.mount('cpu-babylon-pass63',{
      meshAxesDegreesByLink:Object.fromEntries(CPU_MESH_LINKS.map((link,index)=>[
        link.id,
        runtime.meshAxesDegrees[index]
      ])),
      centersByNode:Object.fromEntries(CPU_GEAR_NODE_IDS.map((nodeId,index)=>[
        nodeId,
        {x:centers[index].x,y:centers[index].y}
      ])),
      pitchScale:WORLD_UNITS_PER_MODULE
    });

    const gearMaterials=[materials.brass,materials.gearSteel,materials.gearTitanium];
    runtime.gearNodes=TOOTH_COUNTS.map((teeth,index)=>buildGearAssembly(B,scene,{
      name:`cpu-gear-${teeth}t`,
      teeth,
      x:centers[index].x,
      y:centers[index].y,
      z:centers[index].z,
      thickness:index===1 ? .34 : .29
    },gearMaterials[index],shadowGenerator));

    createShaftAssembly(B,scene,'cpu-driver',centers[0],materials,shadowGenerator,true);
    createShaftAssembly(B,scene,'cpu-intermediate',centers[1],materials,shadowGenerator,false);
    createShaftAssembly(B,scene,'cpu-output',centers[2],materials,shadowGenerator,true);

    const bridgeWaypoint={x:centers[1].x,y:centers[1].y};
    const driverArm=createChamferedBar(
      B,
      scene,
      'cpu-bridge-driver-arm',
      centers[0],
      bridgeWaypoint,
      .11,
      PASS63_LAYOUT.bridgeDepth,
      PASS63_LAYOUT.bridgeZ,
      materials.titanium
    );
    const outputArm=createChamferedBar(
      B,
      scene,
      'cpu-bridge-output-arm',
      bridgeWaypoint,
      centers[2],
      .11,
      PASS63_LAYOUT.bridgeDepth,
      PASS63_LAYOUT.bridgeZ,
      materials.titanium
    );
    const bridgeBoss=B.MeshBuilder.CreateCylinder('cpu-bridge-center-boss',{
      diameter:.30,
      height:.075,
      tessellation:64
    },scene);
    bridgeBoss.rotation.x=Math.PI*.5;
    bridgeBoss.position.set(bridgeWaypoint.x,bridgeWaypoint.y,PASS63_LAYOUT.bridgeBossZ);
    bridgeBoss.material=materials.blackOxide;
    const bridgeSlotA=B.MeshBuilder.CreateBox('cpu-bridge-boss-slot-a',{width:.17,height:.024,depth:.014},scene);
    bridgeSlotA.position.set(
      bridgeWaypoint.x,
      bridgeWaypoint.y,
      PASS63_LAYOUT.bridgeBossZ-PASS63_LAYOUT.bridgeDepth*.58
    );
    bridgeSlotA.rotation.z=Math.PI*.25;
    bridgeSlotA.material=materials.blackOxide;
    const bridgeSlotB=bridgeSlotA.clone('cpu-bridge-boss-slot-b');
    bridgeSlotB.rotation.z=-Math.PI*.25;
    const bridgeAssembly=B.Mesh.MergeMeshes([driverArm,outputArm],true,true,undefined,false,true) || driverArm;
    bridgeAssembly.name='cpu-structural-pivot-bridge';
    bridgeAssembly.material=materials.titanium;
    shadowGenerator?.addShadowCaster?.(bridgeAssembly);
    shadowGenerator?.addShadowCaster?.(bridgeBoss);

    const regulator=createFlagshipRegulator(B,scene,materials,shadowGenerator,centers[2]);
    runtime.regulatorNode=regulator.wheel;
    runtime.regulatorLever=regulator.lever;
    runtime.regulatorSpring=regulator.spring;

    return scene;
  }

  function backendMeshPlacementDiagnostics(){
    const errors=[];
    for(let index=0;index<runtime.gearCenters.length-1;index+=1){
      const a=runtime.gearCenters[index];
      const b=runtime.gearCenters[index+1];
      const actual=Math.hypot(b.x-a.x,b.y-a.y);
      const expected=runtime.pitchRadii[index]+runtime.pitchRadii[index+1];
      errors.push({pair:`${TOOTH_COUNTS[index]}:${TOOTH_COUNTS[index+1]}`,actual,expected,error:Math.abs(actual-expected)});
    }
    return errors;
  }

  function reconcileGeometry(force=false){
    if(!runtime.canvas || !runtime.engine){
      runtime.geometryDirty=true;
      runtime.geometryReady=false;
      return false;
    }
    const width=runtime.canvas.clientWidth;
    const height=runtime.canvas.clientHeight;
    if(width<=0 || height<=0){
      runtime.geometryDirty=true;
      runtime.geometryReady=false;
      return false;
    }
    const renderWidth=runtime.engine.getRenderWidth?.() || 0;
    const renderHeight=runtime.engine.getRenderHeight?.() || 0;
    const cssAspect=width/height;
    const renderAspect=renderHeight>0 ? renderWidth/renderHeight : 0;
    const sizeChanged=width!==runtime.lastWidth || height!==runtime.lastHeight;
    const aspectMismatch=renderAspect<=0 || Math.abs(renderAspect-cssAspect)>.001;
    if(force || runtime.geometryDirty || sizeChanged || aspectMismatch){
      global.RUCA_BABYLON_ENGINE?.resize?.();
      runtime.scene?.markAllMaterialsAsDirty?.(global.BABYLON.Material.AllDirtyFlag);
    }
    runtime.lastWidth=width;
    runtime.lastHeight=height;
    const nextRenderWidth=runtime.engine.getRenderWidth?.() || 0;
    const nextRenderHeight=runtime.engine.getRenderHeight?.() || 0;
    const nextRenderAspect=nextRenderHeight>0 ? nextRenderWidth/nextRenderHeight : 0;
    runtime.geometryReady=nextRenderAspect>0 && Math.abs(nextRenderAspect-cssAspect)<=.001;
    runtime.geometryDirty=!runtime.geometryReady;
    return runtime.geometryReady;
  }

  function promoteReadyCanvas(){
    if(!runtime.geometryReady || !runtime.canvas || runtime.canvas.classList.contains('is-ready')) return false;
    runtime.canvas.classList.add('is-ready');
    publish();
    return true;
  }

  function installResizeObserver(){
    if(!global.ResizeObserver || runtime.resizeObserver || !runtime.canvas) return;
    runtime.resizeObserver=new ResizeObserver(()=>{
      runtime.geometryDirty=true;
      if(!cpuGaugeIsActive()) return;
      if(reconcileGeometry()) promoteReadyCanvas();
    });
    runtime.resizeObserver.observe(runtime.canvas);
  }

  async function initialize(){
    if(runtime.initialization) return runtime.initialization;
    runtime.canvas=document.querySelector('#homeChronograph .comp-cpu .ruca-mechanical-canvas');
    runtime.gauge=document.querySelector('#homeChronograph .comp-cpu');
    if(!runtime.canvas || !runtime.gauge){
      runtime.state='fallback';
      runtime.fallbackReason='cpu-canvas-missing';
      return false;
    }
    runtime.state='initializing';
    publish();
    runtime.initialization=(async()=>{
      const engine=await global.RUCA_BABYLON_ENGINE?.initialize?.(runtime.canvas);
      if(!engine) return fallback(global.RUCA_BABYLON_ENGINE?.getState?.().reason || 'engine-unavailable');
      try{
        runtime.engine=engine;
        runtime.canvas=engine.getRenderingCanvas?.() || runtime.canvas;
        runtime.scene=buildScene(engine,null);
        global.RUCA_BABYLON_ENGINE.bindScene(runtime.scene);
        runtime.backend=global.RUCA_BABYLON_ENGINE.getState().backend;
        runtime.state='ready';
        runtime.fallbackReason='';
        runtime.canvas.hidden=false;
        runtime.geometryDirty=true;
        installResizeObserver();
        if(cpuGaugeIsActive() && reconcileGeometry(true)) promoteReadyCanvas();
        publish();
        return true;
      }catch(error){
        return fallback('scene-initialization-failed',error);
      }
    })();
    return runtime.initialization;
  }

  function applyGearAngles(phaseDegrees,degreesPerSecond=0){
    if(runtime.gearNodes.length!==TOOTH_COUNTS.length || !runtime.drivetrainInstallation) return;
    const transmission=runtime.drivetrainInstallation.evaluate({
      inputs:{
        primary:{
          angleDegrees:phaseDegrees,
          angularVelocityDegreesPerSecond:degreesPerSecond,
          regulatorAmplitudeDegrees:0
        }
      }
    });
    runtime.lastTransmission=transmission;
    const channel=transmission.channels.find(candidate=>candidate.channel==='primary');
    const stageByNode=new Map(channel.stages.map(stage=>[stage.nodeId,stage]));
    runtime.gearNodes.forEach((gear,index)=>{
      gear.node.rotation.z=degToRad(stageByNode.get(CPU_GEAR_NODE_IDS[index]).angleDegrees);
    });
  }

  function applyRegulatorMotion(phaseDegrees,telemetryLevel=0){
    if(!runtime.regulatorNode) return;
    const load=clamp((Number(telemetryLevel) || 0)/100);
    const wave=Math.sin(degToRad((Number(phaseDegrees) || 0)*2.4));
    const amplitude=CPU_FLAGSHIP_REGULATOR.minimumAmplitudeDegrees
      +(CPU_FLAGSHIP_REGULATOR.maximumAmplitudeDegrees-CPU_FLAGSHIP_REGULATOR.minimumAmplitudeDegrees)*load;
    const angle=wave*amplitude;
    runtime.regulatorNode.rotation.z=degToRad(angle);
    if(runtime.regulatorLever) runtime.regulatorLever.rotation.z=degToRad(-angle*.22);
    if(runtime.regulatorSpring){
      const breathing=1+Math.abs(wave)*(.009+load*.009);
      runtime.regulatorSpring.scaling.set(breathing,breathing,1);
    }
    runtime.lastRegulatorAngle=angle;
  }

  function renderFrame(payload={}){
    if(runtime.state!=='ready' || !runtime.scene || !runtime.engine) return {active:false,drawMs:0};
    if(!cpuGaugeIsActive()){
      runtime.paused=true;
      publish();
      return {active:true,drawMs:0,paused:true};
    }
    if(runtime.geometryDirty && !reconcileGeometry()){
      runtime.paused=true;
      publish();
      return {active:true,drawMs:0,paused:true};
    }
    promoteReadyCanvas();
    const timestamp=Number(payload.timestamp) || global.performance.now();
    if(payload.reduced && timestamp-runtime.lastRenderAt<500){
      runtime.paused=true;
      return {active:true,drawMs:0,paused:true};
    }
    runtime.paused=false;
    runtime.lastRenderAt=timestamp;
    if(payload.theme && payload.themeRevision!==runtime.themeRevision){
      runtime.themeRevision=payload.themeRevision;
      runtime.materialLibrary?.update?.(payload.theme,payload.themeRevision);
    }
    applyGearAngles(payload.phase,payload.degreesPerSecond);
    applyRegulatorMotion(payload.phase,payload.telemetryLevel);
    const speedActivity=clamp(Math.abs(Number(payload.degreesPerSecond) || 0)/190);
    const telemetryActivity=clamp((Number(payload.telemetryLevel) || 0)/100);
    const activity=clamp(speedActivity*.70+telemetryActivity*.30);
    runtime.lastPhase=Number(payload.phase) || 0;
    runtime.lastDegreesPerSecond=Number(payload.degreesPerSecond) || 0;
    runtime.lastTelemetryLevel=Number(payload.telemetryLevel) || 0;
    runtime.lastActivity=activity;
    if(runtime.activityLight) runtime.activityLight.intensity=1.25+activity*1.35;
    runtime.materialLibrary?.setActivity?.(activity);
    const started=global.performance.now();
    let frameBegun=false;
    try{
      runtime.engine.beginFrame();
      frameBegun=true;
      runtime.scene.render(false);
      runtime.engine.endFrame();
      frameBegun=false;
    }catch(error){
      if(frameBegun){
        try{ runtime.engine.endFrame(); }catch(_endFrameError){ /* fallback below */ }
      }
      runtime.renderErrors+=1;
      fallback('render-failed',error);
      return {active:false,drawMs:0,error:String(error?.message || error)};
    }
    const elapsed=global.performance.now()-started;
    runtime.frameCount+=1;
    runtime.totalDrawMs+=elapsed;
    runtime.lastDrawMs=elapsed;
    runtime.maxDrawMs=Math.max(runtime.maxDrawMs,elapsed);
    if(runtime.frameCount%30===0) publish();
    return {active:true,drawMs:elapsed,paused:false};
  }

  function isActive(){
    const engineState=global.RUCA_BABYLON_ENGINE?.getState?.() || {};
    if(runtime.state==='ready' && engineState.state==='ready' && cpuGaugeIsActive() && runtime.geometryDirty){
      if(reconcileGeometry()) promoteReadyCanvas();
    }
    const active=runtime.state==='ready'
      && engineState.state==='ready'
      && engineState.backend!=='canvas2d'
      && runtime.geometryReady
      && runtime.canvas?.classList.contains('is-ready')===true;
    if(!active && engineState.state==='fallback' && runtime.canvas?.classList.contains('is-ready')){
      runtime.state='fallback';
      runtime.backend='canvas2d';
      runtime.fallbackReason=engineState.reason || 'engine-fallback';
      runtime.canvas.classList.remove('is-ready');
      runtime.canvas.hidden=true;
      runtime.scene=null;
      runtime.engine=null;
      runtime.camera=null;
      runtime.materialLibrary=null;
      runtime.gearNodes=[];
      runtime.drivetrainInstallation=null;
      runtime.regulatorNode=null;
      runtime.regulatorLever=null;
      runtime.regulatorSpring=null;
      runtime.lastRegulatorAngle=0;
      publish();
    }
    return active;
  }

  function forceFallback(reason='manual-fallback'){
    return fallback(reason);
  }

  function simulateContextLoss(){
    const extension=runtime.engine?._gl?.getExtension?.('WEBGL_lose_context');
    if(!extension) return false;
    extension.loseContext();
    return true;
  }

  async function captureNative(size=1024,phaseDegrees=null){
    if(runtime.state!=='ready' || !runtime.engine || !runtime.scene || !runtime.camera){
      throw new Error('PASS60 native capture requires an active Babylon scene');
    }
    const target=Math.max(256,Math.min(2048,Math.round(Number(size) || 1024)));
    if(Number.isFinite(Number(phaseDegrees))){
      applyGearAngles(Number(phaseDegrees),runtime.lastDegreesPerSecond);
    }
    return global.BABYLON.Tools.CreateScreenshotUsingRenderTargetAsync(
      runtime.engine,
      runtime.camera,
      {width:target,height:target},
      'image/png',
      4,
      true
    );
  }

  function beginNativeProof(size=1024,phaseDegrees=null){
    if(runtime.state!=='ready' || !runtime.engine || !runtime.canvas) return false;
    if(runtime.proofMount) return true;
    const target=Math.max(512,Math.min(1440,Math.round(Number(size) || 1024)));
    runtime.proofMount={
      parent:runtime.canvas.parentNode,
      nextSibling:runtime.canvas.nextSibling,
      style:runtime.canvas.getAttribute('style')
    };
    document.body.append(runtime.canvas);
    Object.assign(runtime.canvas.style,{
      position:'fixed',
      inset:'0 auto auto 0',
      width:`${target}px`,
      height:`${target}px`,
      zIndex:'2147483646',
      opacity:'1',
      display:'block',
      background:'#030405',
      borderRadius:'0',
      transform:'none'
    });
    if(Number.isFinite(Number(phaseDegrees))){
      applyGearAngles(Number(phaseDegrees),runtime.lastDegreesPerSecond);
    }
    global.RUCA_BABYLON_ENGINE?.resize?.();
    runtime.engine.beginFrame();
    runtime.scene.render(false);
    runtime.engine.endFrame();
    publish();
    return true;
  }

  function endNativeProof(){
    if(!runtime.proofMount || !runtime.canvas) return false;
    const mount=runtime.proofMount;
    if(mount.nextSibling?.parentNode===mount.parent) mount.parent.insertBefore(runtime.canvas,mount.nextSibling);
    else mount.parent.append(runtime.canvas);
    if(mount.style===null) runtime.canvas.removeAttribute('style');
    else runtime.canvas.setAttribute('style',mount.style);
    runtime.proofMount=null;
    global.RUCA_BABYLON_ENGINE?.resize?.();
    publish();
    return true;
  }

  function getState(){
    const engineState=global.RUCA_BABYLON_ENGINE?.getState?.() || {};
    const meshPairs=backendMeshPlacementDiagnostics();
    return {
      version:VERSION,
      state:runtime.state,
      backend:runtime.backend,
      reason:runtime.reason || runtime.fallbackReason,
      engineCount:engineState.engineCount || 0,
      sceneCount:engineState.sceneCount || 0,
      renderLoopOwners:0,
      independentMotionOwners:0,
      masterMotionOwner:'HOME_GAUGE_MASTER_MOTION',
      compositionPass:'PASS63_CPU_MECHANICAL_LAYOUT',
      kinematicsPass:'C001_SHARED_DRIVETRAIN_RUNTIME',
      transmissionGraph:{
        assemblyId:cpuAssembly.id,
        runtimeOwner:compiledDrivetrain.owner,
        input:cpuAssembly.inputs[0],
        driveLinks:cpuAssembly.driveLinks,
        output:cpuAssembly.outputs[0]
      },
      drivetrainValidation:compiledDrivetrain.validation,
      transmission:runtime.lastTransmission,
      chamberExpansion:CHAMBER_EXPANSION,
      baseCameraFov:BASE_CAMERA_FOV,
      cameraFov:PASS63_LAYOUT.cameraFov,
      bridgePlane:{
        z:PASS63_LAYOUT.bridgeZ,
        depth:PASS63_LAYOUT.bridgeDepth,
        bossZ:PASS63_LAYOUT.bridgeBossZ
      },
      frameCount:runtime.frameCount,
      averageDrawMs:runtime.totalDrawMs/Math.max(1,runtime.frameCount),
      maxDrawMs:runtime.maxDrawMs,
      lastDrawMs:runtime.lastDrawMs,
      lastPhase:runtime.lastPhase,
      lastDegreesPerSecond:runtime.lastDegreesPerSecond,
      lastTelemetryLevel:runtime.lastTelemetryLevel,
      lastActivity:runtime.lastActivity,
      flagshipArchitecture:'SUPPORTED_BALANCE_REGULATOR_YOKE',
      regulator:{
        motionAuthority:'HOME_GAUGE_MASTER_MOTION',
        telemetrySource:'cpuLoad',
        center:{...CPU_FLAGSHIP_REGULATOR.center},
        radius:CPU_FLAGSHIP_REGULATOR.radius,
        angleDegrees:runtime.lastRegulatorAngle,
        amplitudeRangeDegrees:[
          CPU_FLAGSHIP_REGULATOR.minimumAmplitudeDegrees,
          CPU_FLAGSHIP_REGULATOR.maximumAmplitudeDegrees
        ],
        supported:runtime.regulatorNode!==null && runtime.regulatorLever!==null
      },
      gearCount:runtime.gearNodes.length,
      toothCounts:[...TOOTH_COUNTS],
      meshPairs,
      maximumMeshError:Math.max(0,...meshPairs.map(pair=>pair.error)),
      materials:runtime.materialLibrary?.getState?.() || null,
      materialAssignments:runtime.scene?.meshes
        ?.filter(mesh=>mesh.material)
        .map(mesh=>({
          mesh:mesh.name,
          material:mesh.material.name,
          vertices:mesh.getTotalVertices?.() || 0,
          indices:mesh.getTotalIndices?.() || 0
        }))
        .sort((a,b)=>a.mesh.localeCompare(b.mesh)) || [],
      paused:runtime.paused,
      reducedMotion:global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true
        || document.body?.classList.contains('motion-low'),
      canvasSize:runtime.canvas ? {
        cssWidth:runtime.canvas.clientWidth,
        cssHeight:runtime.canvas.clientHeight,
        renderWidth:runtime.engine?.getRenderWidth?.() || 0,
        renderHeight:runtime.engine?.getRenderHeight?.() || 0
      } : null,
      fallbackVisible:runtime.canvas?.hidden===true || runtime.state==='fallback',
      renderErrors:runtime.renderErrors
      ,
      meshCount:runtime.scene?.meshes?.length || 0,
      materialCount:runtime.scene?.materials?.length || 0,
      activeMeshes:runtime.scene?.getActiveMeshes?.().length || 0,
      drawCalls:null, // Not instrumented; active mesh count is not draw submissions.
      totalVertices:runtime.scene?.getTotalVertices?.() || 0,
      gpuFrameMs:null // Not instrumented; CPU render submission time is not GPU time.
    };
  }

  const publicRenderer=Object.freeze({
    version:VERSION,
    initialize,
    renderFrame,
    isActive,
    forceFallback,
    simulateContextLoss,
    captureNative,
    beginNativeProof,
    endNativeProof,
    getState
  });
  global.RUCA_BABYLON_CPU_RENDERER=publicRenderer;
  global.RUCA_CPU_MECHANICAL_RENDERER=publicRenderer;

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>initialize(),{once:true});
  }else{
    initialize();
  }
})(window);
