(function rucaDrivetrainRuntimeModule(global){
  'use strict';

  const model=global.RUCA_MECHANICAL_MODEL;
  if(!model) throw new Error('RUCA Mechanical Model must load before the drivetrain runtime');

  const VERSION='C001.0.0';
  const OWNER='RUCA_SHARED_DRIVETRAIN_RUNTIME';
  const EPSILON=1e-7;
  const DRIVE_TYPES=new Set(['external-mesh','rigid-shaft','shared-oscillator']);
  const ROTATING_TYPES=new Set(['gear','shaft','balance-wheel']);
  const FIXED_TYPES=new Set(['bridge','bearing','fastener','component']);
  const SUPPORT_TYPES=new Set(['supports','locates','carries','retains']);
  const PHASE_POLICIES=new Set(['axis-locked','preserve-render-pose']);
  const FORBIDDEN_EXECUTION_KEYS=new RegExp(
    '^(?:animation|animationName|animationDuration|durationMs|timer|interval|raf|poll|f'+'etch|callback|update|derive|evaluate|clock|timestamp)$',
    'i'
  );
  const ASSEMBLY_KEYS=new Set([
    'id','type','kind','abstract','extendsAssetId','metricKey','role','motionAuthority',
    'pressureAngle','renderer','inputs','nodes','driveLinks','supportLinks','outputs',
    'pose','metadata'
  ]);
  const INPUT_KEYS=new Set(['id','channel','nodeId','ratio','phaseDegrees','motionSource']);
  const NODE_KEYS=new Set(['id','assetId','parentId','motionRole','fixed']);
  const DRIVE_LINK_KEYS=new Set([
    'id','channel','type','parentId','childId','meshAxisDegrees','childAngleOffsetDegrees',
    'installationDatum','phasePolicy','installationPolicy','coupling','phaseDegrees','fixed'
  ]);
  const SUPPORT_LINK_KEYS=new Set(['id','type','parentId','childId']);
  const OUTPUT_KEYS=new Set(['id','channel','nodeId','mode']);
  const MOUNT_KEYS=new Set(['meshAxesDegreesByLink','centersByNode','pitchScale']);
  const EVALUATION_KEYS=new Set(['inputs']);
  const CHANNEL_INPUT_KEYS=new Set([
    'angleDegrees','angularVelocityDegreesPerSecond','regulatorAmplitudeDegrees'
  ]);

  const radians=degrees=>Number(degrees)*Math.PI/180;
  const isRecord=value=>value!==null && typeof value==='object' && !Array.isArray(value);

  function normalizeSignedDegrees(value){
    const normalized=((Number(value)+180)%360+360)%360-180;
    return Object.is(normalized,-0) ? 0 : normalized;
  }

  function deriveMeshedChildAngle(parentAngleDegrees,parentTeeth,childTeeth,meshAxisDegrees){
    return (
      180
      -(parentTeeth*(parentAngleDegrees-meshAxisDegrees))
      +(childTeeth*(meshAxisDegrees+180))
    )/childTeeth;
  }

  function preserveRenderPoseDatum(parentTeeth,childTeeth,meshAxisDegrees){
    return -(meshAxisDegrees*((parentTeeth/childTeeth)+1)+180);
  }

  function pushError(errors,code,message,details={}){
    errors.push({code,severity:'error',...details,message});
  }

  function validateKeys(value,allowed,path,errors,code='MANIFEST_KEY'){
    if(!isRecord(value)){
      pushError(errors,code,`${path} must be an object`,{path});
      return;
    }
    Object.keys(value).forEach(key=>{
      if(!allowed.has(key)) pushError(errors,code,`${path} cannot declare ${key}`,{path:`${path}.${key}`});
    });
  }

  function scanForExecutableConfiguration(value,path='$',errors=[]){
    if(typeof value==='function'){
      pushError(errors,'EXECUTABLE_MANIFEST',`Executable value is forbidden at ${path}`,{path});
      return errors;
    }
    if(Array.isArray(value)){
      value.forEach((entry,index)=>scanForExecutableConfiguration(entry,`${path}[${index}]`,errors));
      return errors;
    }
    if(value && typeof value==='object'){
      Object.keys(value).forEach(key=>{
        if(FORBIDDEN_EXECUTION_KEYS.test(key)){
          pushError(errors,'LOCAL_RUNTIME_OWNER',`Gauge manifests cannot own ${key}`,{path:`${path}.${key}`});
        }
        scanForExecutableConfiguration(value[key],`${path}.${key}`,errors);
      });
    }
    return errors;
  }

  function supportPairIsValid(type,parentAsset,childAsset){
    if(type==='supports') return parentAsset?.type==='bridge' && childAsset?.type==='bearing';
    if(type==='locates') return parentAsset?.type==='bearing' && childAsset?.type==='shaft';
    if(type==='carries'){
      return parentAsset?.type==='shaft' && (childAsset?.type==='gear' || childAsset?.type==='balance-wheel');
    }
    if(type==='retains'){
      return (
        (parentAsset?.type==='bridge' && (childAsset?.type==='fastener' || childAsset?.type==='component'))
        || (parentAsset?.type==='shaft' && childAsset?.type==='component')
      );
    }
    return false;
  }

  function mapEntries(value,label){
    if(value===undefined || value===null) return [];
    if(value instanceof Map) return [...value.entries()];
    if(!isRecord(value)) throw new TypeError(`${label} must be an object or Map`);
    return Object.entries(value);
  }

  function finiteNumber(value,label){
    const number=Number(value);
    if(!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
    return number;
  }

  function phasePolicy(link){
    const explicit=link.installationDatum || link.phasePolicy || link.installationPolicy;
    if(explicit) return explicit;
    if(model.own(link,'childAngleOffsetDegrees')){
      return Math.abs(Number(link.childAngleOffsetDegrees) || 0)>EPSILON
        ? 'preserve-render-pose'
        : 'axis-locked';
    }
    return 'axis-locked';
  }

  class MechanicalValidationEngine{
    constructor(registry){
      this.registry=registry;
    }

    validateAssembly(assemblyOrId){
      const errors=[];
      let assembly;
      let resolvedAssembly;
      try{
        assembly=typeof assemblyOrId==='string' ? this.registry.resolve(assemblyOrId) : assemblyOrId;
        resolvedAssembly=this.registry.resolveDefinition(assembly.id);
      }catch(error){
        return model.freeze({
          valid:false,
          assemblyId:String(assemblyOrId),
          errors:[{code:'ASSEMBLY_RESOLUTION',severity:'error',message:error.message}]
        });
      }
      if(!(assembly instanceof model.Assembly)){
        pushError(errors,'ASSEMBLY_TYPE',`${assembly?.id || 'unknown'} is not an Assembly`);
        return model.freeze({valid:false,assemblyId:assembly?.id || '',errors});
      }

      validateKeys(resolvedAssembly,ASSEMBLY_KEYS,assembly.id,errors);
      scanForExecutableConfiguration(resolvedAssembly,assembly.id,errors);
      if(assembly.motionAuthority!=='HOME_GAUGE_MASTER_MOTION'){
        pushError(errors,'MOTION_AUTHORITY',`${assembly.id} must inherit HOME_GAUGE_MASTER_MOTION`,{assemblyId:assembly.id});
      }
      const nodes=new Map();
      const assets=new Map();
      assembly.nodes.forEach((node,index)=>{
        validateKeys(node,NODE_KEYS,`${assembly.id}.nodes[${index}]`,errors,'NODE_MANIFEST_KEY');
        if(!node.id || nodes.has(node.id)){
          pushError(errors,'DUPLICATE_NODE',`Duplicate or empty node id: ${node.id || '(empty)'}`,{nodeId:node.id || ''});
          return;
        }
        nodes.set(node.id,node);
        try{
          const asset=this.registry.resolve(node.assetId);
          const assetDefinition=this.registry.resolveDefinition(node.assetId);
          scanForExecutableConfiguration(assetDefinition,`${assembly.id}.assets.${node.assetId}`,errors);
          if(asset instanceof model.Assembly){
            pushError(errors,'NODE_ASSET_TYPE',`${node.assetId} is an assembly, not a component`,{nodeId:node.id});
          }else{
            assets.set(node.id,asset);
            if(ROTATING_TYPES.has(asset.type) && node.fixed===true){
              pushError(errors,'ROTATING_NODE_FIXED',`${node.id} is rotating hardware and cannot be fixed`,{nodeId:node.id});
            }
            if(FIXED_TYPES.has(asset.type) && node.fixed!==true){
              pushError(errors,'FIXED_NODE_FLAG',`${node.id} must be declared fixed`,{nodeId:node.id});
            }
            if(asset.type==='gear'){
              const teeth=Number(asset.teeth);
              const moduleSize=Number(asset.module);
              const pitchDiameter=Number(asset.geometry.pitchDiameter);
              if(!Number.isInteger(teeth) || teeth<=0){
                pushError(errors,'GEAR_TEETH',`${node.assetId} requires a positive integer tooth count`,{nodeId:node.id});
              }
              if(!Number.isFinite(moduleSize) || moduleSize<=0){
                pushError(errors,'GEAR_MODULE',`${node.assetId} requires a positive module`,{nodeId:node.id});
              }
              if(Number.isFinite(pitchDiameter) && Math.abs(pitchDiameter-(teeth*moduleSize))>EPSILON){
                pushError(errors,'GEAR_PITCH_DIAMETER',`${node.assetId} pitch diameter does not equal teeth x module`,{nodeId:node.id});
              }
            }
          }
        }catch(error){
          pushError(errors,'MISSING_ASSET',error.message,{nodeId:node.id,assetId:node.assetId});
        }
      });

      assembly.nodes.forEach(node=>{
        if(node.parentId && !nodes.has(node.parentId)){
          pushError(errors,'MISSING_PARENT',`${node.id} references missing parent ${node.parentId}`,{nodeId:node.id,parentId:node.parentId});
        }
      });
      const hierarchyState=new Map();
      const visitHierarchy=nodeId=>{
        const state=hierarchyState.get(nodeId) || 0;
        if(state===1){
          pushError(errors,'HIERARCHY_CYCLE',`Parent/child hierarchy cycle reaches ${nodeId}`,{nodeId});
          return;
        }
        if(state===2) return;
        hierarchyState.set(nodeId,1);
        const parentId=nodes.get(nodeId)?.parentId;
        if(parentId && nodes.has(parentId)) visitHierarchy(parentId);
        hierarchyState.set(nodeId,2);
      };
      nodes.forEach((_node,id)=>visitHierarchy(id));

      const inputByChannel=new Map();
      const inputIds=new Set();
      assembly.inputs.forEach((input,index)=>{
        validateKeys(input,INPUT_KEYS,`${assembly.id}.inputs[${index}]`,errors,'INPUT_MANIFEST_KEY');
        const channel=input.channel || input.id;
        if(!input.id || inputIds.has(input.id)){
          pushError(errors,'INPUT_ID',`Duplicate or empty input id: ${input.id || '(empty)'}`,{inputId:input.id || ''});
        }
        inputIds.add(input.id);
        if(!channel || inputByChannel.has(channel)){
          pushError(errors,'INPUT_ROOT',`Channel ${channel || '(empty)'} must have one declared root`,{channel:channel || ''});
          return;
        }
        if(!nodes.has(input.nodeId)){
          pushError(errors,'INPUT_NODE',`Input ${channel} references missing node ${input.nodeId}`,{channel,nodeId:input.nodeId});
        }else if(!ROTATING_TYPES.has(assets.get(input.nodeId)?.type)){
          pushError(errors,'INPUT_COMPONENT_TYPE',`Input ${channel} must drive rotating hardware`,{channel,nodeId:input.nodeId});
        }
        if(!Number.isFinite(Number(input.ratio)) || Number(input.ratio)===0){
          pushError(errors,'INPUT_RATIO',`Input ${channel} requires a finite non-zero ratio`,{channel});
        }
        if(model.own(input,'phaseDegrees') && !Number.isFinite(Number(input.phaseDegrees))){
          pushError(errors,'INPUT_PHASE',`Input ${channel} phase must be finite`,{channel});
        }
        if(input.motionSource && input.motionSource!==assembly.motionAuthority){
          pushError(errors,'INPUT_MOTION_SOURCE',`Input ${channel} declares a second motion source`,{channel});
        }
        inputByChannel.set(channel,input);
      });

      const incomingByNode=new Map();
      const incomingByChannel=new Map();
      const linksByChannel=new Map();
      const allLinkIds=new Set();
      assembly.driveLinks.forEach((link,index)=>{
        validateKeys(link,DRIVE_LINK_KEYS,`${assembly.id}.driveLinks[${index}]`,errors,'DRIVE_MANIFEST_KEY');
        const channel=link.channel || 'primary';
        if(!link.id || allLinkIds.has(link.id)){
          pushError(errors,'DRIVE_LINK_ID',`Duplicate or empty drive-link id: ${link.id || '(empty)'}`,{linkId:link.id || ''});
        }
        allLinkIds.add(link.id);
        if(!inputByChannel.has(channel)){
          pushError(errors,'UNDECLARED_DRIVE_CHANNEL',`Drive channel ${channel} has no declared input root`,{channel,linkId:link.id});
        }
        if(!DRIVE_TYPES.has(link.type)){
          pushError(errors,'DRIVE_LINK_TYPE',`Unsupported drive-link type ${link.type}`,{linkId:link.id});
        }
        if(link.fixed===true){
          pushError(errors,'FIXED_DRIVE_LINK',`Drive link ${link.id} cannot be fixed`,{linkId:link.id});
        }
        if(!nodes.has(link.parentId) || !nodes.has(link.childId)){
          pushError(errors,'DRIVE_LINK_NODE',`Drive link ${link.id} references an unknown node`,{linkId:link.id});
          return;
        }
        const parentAsset=assets.get(link.parentId);
        const childAsset=assets.get(link.childId);
        if(!ROTATING_TYPES.has(parentAsset?.type)){
          pushError(errors,'FIXED_DRIVE_PARENT',`${link.parentId} cannot transmit torque`,{linkId:link.id});
        }
        if(!ROTATING_TYPES.has(childAsset?.type)){
          pushError(errors,'FIXED_DRIVE_CHILD',`${link.childId} cannot receive torque`,{linkId:link.id});
        }
        if(link.type==='external-mesh'){
          if(parentAsset?.type!=='gear' || childAsset?.type!=='gear'){
            pushError(errors,'MESH_COMPONENT_TYPE','External meshes require Gear assets at both ends',{linkId:link.id});
          }else{
            if(Math.abs(parentAsset.module-childAsset.module)>EPSILON){
              pushError(errors,'MESH_MODULE',`Gear modules differ at ${link.id}`,{linkId:link.id});
            }
            const parentPressure=Number(parentAsset.geometry.pressureAngle ?? assembly.pressureAngle);
            const childPressure=Number(childAsset.geometry.pressureAngle ?? assembly.pressureAngle);
            if(!Number.isFinite(parentPressure) || !Number.isFinite(childPressure) || Math.abs(parentPressure-childPressure)>EPSILON){
              pushError(errors,'MESH_PRESSURE_ANGLE',`Gear pressure angles differ at ${link.id}`,{linkId:link.id});
            }
          }
          const policy=phasePolicy(link);
          if(!PHASE_POLICIES.has(policy)){
            pushError(errors,'MESH_PHASE_POLICY',`Unsupported phase policy ${policy}`,{linkId:link.id});
          }
          const declaredPolicies=['installationDatum','phasePolicy','installationPolicy']
            .filter(key=>model.own(link,key));
          declaredPolicies.forEach(key=>{
            if(!PHASE_POLICIES.has(link[key])){
              pushError(errors,'MESH_PHASE_POLICY',`Unsupported ${key} ${link[key]}`,{linkId:link.id});
            }
          });
          if(new Set(declaredPolicies.map(key=>link[key])).size>1){
            pushError(errors,'MESH_PHASE_POLICY_CONFLICT',`${link.id} declares conflicting installation datum policies`,{linkId:link.id});
          }
          for(const key of ['meshAxisDegrees','childAngleOffsetDegrees']){
            if(model.own(link,key) && !Number.isFinite(Number(link[key]))){
              pushError(errors,'MESH_INSTALLATION_VALUE',`${link.id} ${key} must be finite`,{linkId:link.id});
            }
          }
        }
        if(link.type==='shared-oscillator'){
          if(childAsset?.type!=='balance-wheel'){
            pushError(errors,'OSCILLATOR_COMPONENT_TYPE',`${link.id} must terminate at a BalanceWheel`,{linkId:link.id});
          }
          if(!Number.isFinite(Number(link.coupling)) || Number(link.coupling)<=0){
            pushError(errors,'OSCILLATOR_COUPLING',`${link.id} requires a positive coupling`,{linkId:link.id});
          }
        }
        if(!linksByChannel.has(channel)) linksByChannel.set(channel,[]);
        linksByChannel.get(channel).push(link);
        const incomingKey=`${channel}:${link.childId}`;
        if(incomingByChannel.has(incomingKey)){
          pushError(errors,'MULTIPLE_DRIVE_PARENTS',`${link.childId} has multiple drive parents in ${channel}`,{linkId:link.id,nodeId:link.childId});
        }
        incomingByChannel.set(incomingKey,link.parentId);
        if(incomingByNode.has(link.childId)){
          pushError(errors,'CROSS_CHANNEL_DRIVE_PARENT',`${link.childId} is driven more than once`,{linkId:link.id,nodeId:link.childId});
        }
        incomingByNode.set(link.childId,{channel,parentId:link.parentId});
      });

      const outputIds=new Set();
      const outputsByChannel=new Map();
      assembly.outputs.forEach((output,index)=>{
        validateKeys(output,OUTPUT_KEYS,`${assembly.id}.outputs[${index}]`,errors,'OUTPUT_MANIFEST_KEY');
        const channel=output.channel || 'primary';
        if(!output.id || outputIds.has(output.id)){
          pushError(errors,'OUTPUT_ID',`Duplicate or empty output id: ${output.id || '(empty)'}`,{outputId:output.id || ''});
        }
        outputIds.add(output.id);
        if(!inputByChannel.has(channel)){
          pushError(errors,'UNDECLARED_OUTPUT_CHANNEL',`Output channel ${channel} has no declared input`,{channel});
        }
        if((output.mode || 'derived')!=='derived'){
          pushError(errors,'RUNTIME_OUTPUT_OWNERSHIP',`Output ${output.id} must be drivetrain-derived`,{channel,nodeId:output.nodeId});
        }
        if(!outputsByChannel.has(channel)) outputsByChannel.set(channel,[]);
        outputsByChannel.get(channel).push(output);
      });

      const reachabilityByChannel={};
      inputByChannel.forEach((input,channel)=>{
        const links=linksByChannel.get(channel) || [];
        if(incomingByChannel.has(`${channel}:${input.nodeId}`)){
          pushError(errors,'DRIVEN_INPUT_ROOT',`Input root ${input.nodeId} is driven by another node`,{channel,nodeId:input.nodeId});
        }
        const channelOutputs=outputsByChannel.get(channel) || [];
        if(channelOutputs.length!==1){
          pushError(errors,'OUTPUT_COUNT',`Channel ${channel} requires exactly one output`,{channel});
        }
        const children=new Map();
        links.forEach(link=>{
          if(!children.has(link.parentId)) children.set(link.parentId,[]);
          children.get(link.parentId).push(link);
        });
        const visiting=new Set();
        const visited=new Set();
        const walk=nodeId=>{
          if(visiting.has(nodeId)){
            pushError(errors,'DRIVE_CYCLE',`Drive graph cycle reaches ${nodeId}`,{channel,nodeId});
            return;
          }
          if(visited.has(nodeId)) return;
          visiting.add(nodeId);
          (children.get(nodeId) || []).forEach(link=>walk(link.childId));
          visiting.delete(nodeId);
          visited.add(nodeId);
        };
        walk(input.nodeId);
        reachabilityByChannel[channel]=[...visited];
        links.forEach(link=>{
          if(!visited.has(link.parentId) || !visited.has(link.childId)){
            pushError(errors,'ORPHAN_DRIVE_NODE',`Drive link ${link.id} is unreachable from ${input.nodeId}`,{channel,linkId:link.id});
          }
        });
        channelOutputs.forEach(output=>{
          if(!nodes.has(output.nodeId)){
            pushError(errors,'OUTPUT_NODE','Output references a missing node',{channel,nodeId:output.nodeId});
          }else if(!visited.has(output.nodeId)){
            pushError(errors,'OUTPUT_UNREACHABLE',`Output ${output.nodeId} is not driven from ${input.nodeId}`,{channel,nodeId:output.nodeId});
          }
        });
      });

      const supportIncoming=new Map();
      assembly.supportLinks.forEach((link,index)=>{
        validateKeys(link,SUPPORT_LINK_KEYS,`${assembly.id}.supportLinks[${index}]`,errors,'SUPPORT_MANIFEST_KEY');
        if(!link.id || allLinkIds.has(link.id)){
          pushError(errors,'SUPPORT_LINK_ID',`Duplicate or empty support-link id: ${link.id || '(empty)'}`,{linkId:link.id || ''});
        }
        allLinkIds.add(link.id);
        if(!SUPPORT_TYPES.has(link.type)){
          pushError(errors,'SUPPORT_LINK_TYPE',`Unsupported support-link type ${link.type}`,{linkId:link.id});
        }
        if(!nodes.has(link.parentId) || !nodes.has(link.childId)){
          pushError(errors,'SUPPORT_LINK_NODE',`Support link ${link.id} references an unknown node`,{linkId:link.id});
          return;
        }
        if(!supportPairIsValid(link.type,assets.get(link.parentId),assets.get(link.childId))){
          pushError(errors,'SUPPORT_COMPONENT_TYPE',`${link.type} cannot connect ${assets.get(link.parentId)?.type} to ${assets.get(link.childId)?.type}`,{linkId:link.id});
        }
        if(nodes.get(link.childId).parentId!==link.parentId){
          pushError(errors,'SUPPORT_HIERARCHY_MISMATCH',`${link.id} disagrees with ${link.childId}.parentId`,{linkId:link.id,nodeId:link.childId});
        }
        if(supportIncoming.has(link.childId)){
          pushError(errors,'MULTIPLE_SUPPORT_PARENTS',`${link.childId} has multiple structural parents`,{linkId:link.id,nodeId:link.childId});
        }
        supportIncoming.set(link.childId,link.parentId);
      });
      nodes.forEach((node,nodeId)=>{
        const asset=assets.get(nodeId);
        if(node.parentId && !supportIncoming.has(nodeId)){
          pushError(errors,'MISSING_SUPPORT_LINK',`${nodeId} has a structural parent but no support link`,{nodeId,parentId:node.parentId});
        }
        if(!node.parentId && asset && asset.type!=='bridge'){
          pushError(errors,'SUPPORT_ROOT_TYPE',`${nodeId} is a structural root but is not a Bridge`,{nodeId});
        }
        if(!asset || !ROTATING_TYPES.has(asset.type)) return;
        const channels=Object.entries(reachabilityByChannel)
          .filter(([_channel,ids])=>ids.includes(nodeId))
          .map(([channel])=>channel);
        if(channels.length===0){
          pushError(errors,'UNDRIVEN_MOVING_NODE',`Moving node ${nodeId} has no declared driver`,{nodeId});
        }else if(channels.length>1){
          pushError(errors,'CROSS_CHANNEL_MOVING_NODE',`Moving node ${nodeId} belongs to multiple channels`,{nodeId});
        }
      });

      return model.freeze({
        valid:errors.length===0,
        assemblyId:assembly.id,
        metricKey:assembly.metricKey,
        nodeCount:nodes.size,
        driveLinkCount:assembly.driveLinks.length,
        supportLinkCount:assembly.supportLinks.length,
        channels:[...inputByChannel.keys()],
        reachabilityByChannel,
        errors
      });
    }

    validateAll(assemblyIds=[]){
      const inheritance=this.registry.validateInheritance();
      const assemblies=assemblyIds.map(id=>this.validateAssembly(id));
      const errors=[...inheritance.errors,...assemblies.flatMap(result=>result.errors)];
      return model.freeze({valid:errors.length===0,inheritance,assemblies,errors});
    }

    validatePose(compiled,pose){
      const errors=[];
      if(pose.assemblyId!==compiled.assembly.id){
        pushError(errors,'POSE_ASSEMBLY','Pose belongs to a different assembly');
      }
      pose.channels.forEach(channel=>{
        const stages=new Map(channel.stages.map(stage=>[stage.nodeId,stage]));
        channel.stages.forEach(stage=>{
          if(!Number.isFinite(stage.angleDegrees) || !Number.isFinite(stage.angularVelocityDegreesPerSecond)){
            pushError(errors,'NON_FINITE_POSE',`Non-finite pose at ${stage.nodeId}`,{channel:channel.channel,nodeId:stage.nodeId});
          }
        });
        channel.contacts.forEach(contact=>{
          if(Math.abs(contact.phaseResidualDegrees)>EPSILON){
            pushError(errors,'CONTACT_PHASE',`Contact phase error ${contact.phaseResidualDegrees}`,{channel:channel.channel,linkId:contact.linkId});
          }
        });
        if(channel.output){
          const stage=stages.get(channel.output.nodeId);
          if(!stage || Math.abs(stage.angleDegrees-channel.output.angleDegrees)>EPSILON){
            pushError(errors,'OUTPUT_NOT_DERIVED',`Output ${channel.output.nodeId} is not stage-derived`,{channel:channel.channel,nodeId:channel.output.nodeId});
          }
        }
        const stopped=channel.stages.every(stage=>Math.abs(stage.angularVelocityDegreesPerSecond)<1e-9);
        if(stopped!==channel.stopped){
          pushError(errors,'STOP_STATE',`Stopped state is inconsistent for ${channel.channel}`,{channel:channel.channel});
        }
      });
      return model.freeze({valid:errors.length===0,errors});
    }
  }

  class DrivetrainRuntime{
    constructor(registry){
      this.registry=registry;
      this.validator=new MechanicalValidationEngine(registry);
      this.compiled=new Map();
    }

    compile(assemblyOrId){
      const assembly=typeof assemblyOrId==='string' ? this.registry.resolve(assemblyOrId) : assemblyOrId;
      if(this.compiled.has(assembly.id)) return this.compiled.get(assembly.id);
      const validation=this.validator.validateAssembly(assembly);
      if(!validation.valid){
        throw new Error(`Invalid mechanical assembly ${assembly.id}: ${validation.errors.map(error=>error.message).join('; ')}`);
      }
      const nodes=new Map(assembly.nodes.map(node=>[node.id,node]));
      const assets=new Map(assembly.nodes.map(node=>[node.id,this.registry.resolve(node.assetId)]));
      const inputByChannel=new Map(assembly.inputs.map(input=>[input.channel || input.id,input]));
      const outputByChannel=new Map(assembly.outputs.map(output=>[output.channel || 'primary',output]));
      const linksByChannel=new Map();
      assembly.driveLinks.forEach(link=>{
        const channel=link.channel || 'primary';
        if(!linksByChannel.has(channel)) linksByChannel.set(channel,[]);
        linksByChannel.get(channel).push(link);
      });
      const orderedByChannel=new Map();
      inputByChannel.forEach((input,channel)=>{
        const pending=[...(linksByChannel.get(channel) || [])];
        const visited=new Set([input.nodeId]);
        const ordered=[];
        while(pending.length){
          const index=pending.findIndex(link=>visited.has(link.parentId));
          if(index<0) break;
          const [link]=pending.splice(index,1);
          ordered.push(link);
          visited.add(link.childId);
        }
        if(pending.length){
          throw new Error(`Unable to compile complete drive order for ${assembly.id}/${channel}`);
        }
        orderedByChannel.set(channel,ordered);
      });

      const installations=new Map();
      let compiled;
      const mount=(installationId,options={})=>{
        if(typeof installationId!=='string' || !installationId.trim()){
          throw new TypeError(`${assembly.id} installation requires a stable id`);
        }
        validateKeysOrThrow(options,MOUNT_KEYS,`${assembly.id}.mount(${installationId})`);
        const pitchScale=options.pitchScale===undefined
          ? null
          : finiteNumber(options.pitchScale,`${installationId}.pitchScale`);
        if(pitchScale!==null && pitchScale<=0) throw new RangeError(`${installationId}.pitchScale must be positive`);

        const centers=new Map(mapEntries(options.centersByNode,'centersByNode').map(([nodeId,center])=>{
          if(!nodes.has(nodeId)) throw new Error(`${installationId} references unknown center node ${nodeId}`);
          if(!isRecord(center)) throw new TypeError(`${installationId}.${nodeId} center must be an object`);
          const normalized={x:finiteNumber(center.x,`${nodeId}.x`),y:finiteNumber(center.y,`${nodeId}.y`)};
          if(model.own(center,'z')) normalized.z=finiteNumber(center.z,`${nodeId}.z`);
          return [nodeId,model.freeze(normalized)];
        }));
        const suppliedAxes=new Map(mapEntries(options.meshAxesDegreesByLink,'meshAxesDegreesByLink').map(([linkId,axis])=>[
          linkId,
          finiteNumber(axis,`${linkId}.meshAxisDegrees`)
        ]));
        suppliedAxes.forEach((_axis,linkId)=>{
          const link=assembly.driveLinks.find(candidate=>candidate.id===linkId);
          if(!link || link.type!=='external-mesh'){
            throw new Error(`${installationId} references unknown external mesh ${linkId}`);
          }
        });

        const installedLinks=new Map();
        assembly.driveLinks.filter(link=>link.type==='external-mesh').forEach(link=>{
          const parentCenter=centers.get(link.parentId);
          const childCenter=centers.get(link.childId);
          const centerAxis=parentCenter && childCenter
            ? Math.atan2(childCenter.y-parentCenter.y,childCenter.x-parentCenter.x)*180/Math.PI
            : null;
          const suppliedAxis=suppliedAxes.has(link.id) ? suppliedAxes.get(link.id) : null;
          if(centerAxis!==null && suppliedAxis!==null && Math.abs(normalizeSignedDegrees(centerAxis-suppliedAxis))>EPSILON){
            throw new Error(`${installationId}/${link.id} supplied axis disagrees with component centers`);
          }
          const manifestAxis=model.own(link,'meshAxisDegrees')
            ? finiteNumber(link.meshAxisDegrees,`${link.id}.meshAxisDegrees`)
            : null;
          const meshAxisDegrees=centerAxis ?? suppliedAxis ?? manifestAxis;
          if(meshAxisDegrees===null){
            throw new Error(`${installationId}/${link.id} requires a sealed mesh axis`);
          }
          const parentAsset=assets.get(link.parentId);
          const childAsset=assets.get(link.childId);
          if(parentCenter && childCenter && pitchScale!==null){
            const actual=Math.hypot(childCenter.x-parentCenter.x,childCenter.y-parentCenter.y);
            const expected=(parentAsset.teeth+childAsset.teeth)*parentAsset.module*.5*pitchScale;
            const tolerance=Math.max(EPSILON,expected*1e-6);
            if(Math.abs(actual-expected)>tolerance){
              throw new Error(`${installationId}/${link.id} center distance ${actual} does not match pitch distance ${expected}`);
            }
          }
          const policy=phasePolicy(link);
          if(!PHASE_POLICIES.has(policy)) throw new Error(`${installationId}/${link.id} has invalid phase policy ${policy}`);
          const datumDegrees=policy==='preserve-render-pose'
            ? preserveRenderPoseDatum(parentAsset.teeth,childAsset.teeth,meshAxisDegrees)
            : 0;
          if(model.own(link,'childAngleOffsetDegrees')){
            const declared=finiteNumber(link.childAngleOffsetDegrees,`${link.id}.childAngleOffsetDegrees`);
            if(Math.abs(normalizeSignedDegrees(declared-datumDegrees))>EPSILON){
              throw new Error(`${installationId}/${link.id} declared datum disagrees with ${policy} installation`);
            }
          }
          installedLinks.set(link.id,model.freeze({
            linkId:link.id,
            meshAxisDegrees,
            phasePolicy:policy,
            childAngleOffsetDegrees:datumDegrees,
            contactDatumDegrees:childAsset.teeth*datumDegrees
          }));
        });

        const signature=JSON.stringify({
          pitchScale,
          centers:[...centers.entries()].sort(([a],[b])=>a.localeCompare(b)),
          links:[...installedLinks.values()].sort((a,b)=>a.linkId.localeCompare(b.linkId))
        });
        if(installations.has(installationId)){
          const existing=installations.get(installationId);
          if(existing.signature!==signature){
            throw new Error(`Mechanical installation ${installationId} is already sealed with a different pose`);
          }
          return existing;
        }

        const evaluate=payload=>{
          validateKeysOrThrow(payload,EVALUATION_KEYS,`${assembly.id}.${installationId}.evaluate`);
          const inputPayload=payload.inputs;
          if(!isRecord(inputPayload)) throw new TypeError(`${assembly.id}.${installationId}.evaluate requires inputs`);
          const suppliedChannels=Object.keys(inputPayload);
          const declaredChannels=[...inputByChannel.keys()];
          declaredChannels.forEach(channel=>{
            if(!model.own(inputPayload,channel)) throw new Error(`Missing drivetrain input channel ${channel}`);
          });
          suppliedChannels.forEach(channel=>{
            if(!inputByChannel.has(channel)) throw new Error(`Undeclared drivetrain input channel ${channel}`);
          });

          const channels=[];
          inputByChannel.forEach((input,channel)=>{
            const source=inputPayload[channel];
            validateKeysOrThrow(source,CHANNEL_INPUT_KEYS,`${assembly.id}.${installationId}.inputs.${channel}`);
            if(!model.own(source,'angleDegrees') || !model.own(source,'angularVelocityDegreesPerSecond')){
              throw new Error(`Input ${channel} requires angleDegrees and angularVelocityDegreesPerSecond`);
            }
            const masterAngleDegrees=finiteNumber(source.angleDegrees,`${channel}.angleDegrees`);
            const masterDegreesPerSecond=finiteNumber(source.angularVelocityDegreesPerSecond,`${channel}.angularVelocityDegreesPerSecond`);
            const regulatorAmplitudeDegrees=model.own(source,'regulatorAmplitudeDegrees')
              ? finiteNumber(source.regulatorAmplitudeDegrees,`${channel}.regulatorAmplitudeDegrees`)
              : 0;
            const inputRatio=Number(input.ratio);
            const rootAngle=masterAngleDegrees*inputRatio+(Number(input.phaseDegrees) || 0);
            const rootVelocity=masterDegreesPerSecond*inputRatio;
            const stageByNode=new Map();
            const rootAsset=assets.get(input.nodeId);
            stageByNode.set(input.nodeId,{
              nodeId:input.nodeId,
              assetId:rootAsset.id,
              role:nodes.get(input.nodeId).motionRole || 'drive',
              kind:rootAsset.kind,
              teeth:rootAsset.teeth || null,
              angleDegrees:rootAngle,
              angularVelocityDegreesPerSecond:rootVelocity,
              ratioToMaster:inputRatio,
              drivenBy:input.motionSource || assembly.motionAuthority,
              linkage:'input'
            });
            const contacts=[];
            (orderedByChannel.get(channel) || []).forEach(link=>{
              const parent=stageByNode.get(link.parentId);
              const parentAsset=assets.get(link.parentId);
              const childAsset=assets.get(link.childId);
              let angleDegrees=parent.angleDegrees;
              let angularVelocityDegreesPerSecond=parent.angularVelocityDegreesPerSecond;
              let ratioToMaster=parent.ratioToMaster;
              if(link.type==='external-mesh'){
                const installationLink=installedLinks.get(link.id);
                angleDegrees=deriveMeshedChildAngle(
                  parent.angleDegrees,
                  parentAsset.teeth,
                  childAsset.teeth,
                  installationLink.meshAxisDegrees
                )+installationLink.childAngleOffsetDegrees;
                angularVelocityDegreesPerSecond=-(parent.angularVelocityDegreesPerSecond*parentAsset.teeth/childAsset.teeth);
                ratioToMaster=-(parent.ratioToMaster*parentAsset.teeth/childAsset.teeth);
                const residual=normalizeSignedDegrees(
                  parentAsset.teeth*(parent.angleDegrees-installationLink.meshAxisDegrees)
                  +childAsset.teeth*(angleDegrees-(installationLink.meshAxisDegrees+180))
                  -180
                  -installationLink.contactDatumDegrees
                );
                contacts.push({
                  linkId:link.id,
                  pair:`${parentAsset.teeth}:${childAsset.teeth}`,
                  parent:link.parentId,
                  child:link.childId,
                  meshAxisDegrees:installationLink.meshAxisDegrees,
                  phasePolicy:installationLink.phasePolicy,
                  childAngleOffsetDegrees:installationLink.childAngleOffsetDegrees,
                  phaseResidualDegrees:residual
                });
              }else if(link.type==='shared-oscillator'){
                const coupling=Number(link.coupling);
                const oscillatorPhase=masterAngleDegrees*inputRatio*coupling+(Number(link.phaseDegrees) || 0);
                angleDegrees=Math.sin(radians(oscillatorPhase))*regulatorAmplitudeDegrees;
                angularVelocityDegreesPerSecond=Math.cos(radians(oscillatorPhase))
                  *masterDegreesPerSecond*inputRatio*coupling*radians(regulatorAmplitudeDegrees);
                ratioToMaster=0;
              }
              if(!Number.isFinite(angleDegrees) || !Number.isFinite(angularVelocityDegreesPerSecond)){
                throw new Error(`Non-finite drivetrain pose at ${assembly.id}/${link.childId}`);
              }
              stageByNode.set(link.childId,{
                nodeId:link.childId,
                assetId:childAsset.id,
                role:nodes.get(link.childId).motionRole || 'transfer',
                kind:childAsset.kind,
                teeth:childAsset.teeth || null,
                angleDegrees,
                angularVelocityDegreesPerSecond,
                ratioToMaster,
                drivenBy:link.parentId,
                linkage:link.type
              });
            });
            const output=outputByChannel.get(channel);
            const outputStage=stageByNode.get(output.nodeId);
            const stageValues=[...stageByNode.values()];
            channels.push({
              channel,
              input:{
                nodeId:input.nodeId,
                masterAngleDegrees,
                masterDegreesPerSecond,
                inputRatio
              },
              stages:stageValues,
              contacts,
              output:{...outputStage,mode:'derived'},
              stopped:stageValues.every(stage=>Math.abs(stage.angularVelocityDegreesPerSecond)<1e-9)
            });
          });
          const pose=model.freeze({
            runtimeOwner:OWNER,
            runtimeVersion:VERSION,
            installationId,
            assemblyId:assembly.id,
            metricKey:assembly.metricKey,
            motionType:assembly.metadata.motionType || 'continuous-rotary',
            masterSource:assembly.motionAuthority,
            channels,
            maximumContactPhaseErrorDegrees:Math.max(0,...channels.flatMap(channel=>channel.contacts.map(contact=>Math.abs(contact.phaseResidualDegrees)))),
            independentMotionOwners:0,
            stopped:channels.every(channel=>channel.stopped)
          });
          const poseValidation=this.validator.validatePose(compiled,pose);
          if(!poseValidation.valid){
            throw new Error(
              `Invalid mechanical pose ${assembly.id}/${installationId}: ${poseValidation.errors.map(error=>error.message).join('; ')}`
            );
          }
          return pose;
        };

        const installation=model.freeze({
          id:installationId,
          owner:OWNER,
          assemblyId:assembly.id,
          signature,
          pitchScale,
          centersByNode:model.freeze(Object.fromEntries(centers)),
          meshAxesDegreesByLink:model.freeze(Object.fromEntries(
            [...installedLinks].map(([linkId,value])=>[linkId,value.meshAxisDegrees])
          )),
          installationDatumsByLink:model.freeze(Object.fromEntries(
            [...installedLinks].map(([linkId,value])=>[linkId,value])
          )),
          evaluate
        });
        installations.set(installationId,installation);
        return installation;
      };

      compiled=model.freeze({
        version:VERSION,
        owner:OWNER,
        assembly,
        validation,
        node(nodeId){ return nodes.get(nodeId) || null; },
        asset(nodeId){ return assets.get(nodeId) || null; },
        channelNames(){ return [...inputByChannel.keys()]; },
        mount,
        getInstallation(installationId){ return installations.get(installationId) || null; },
        installationIds(){ return [...installations.keys()]; }
      });
      this.compiled.set(assembly.id,compiled);
      return compiled;
    }

    compileMany(assemblyIds=[]){
      return model.freeze(Object.fromEntries(assemblyIds.map(id=>{
        const compiled=this.compile(id);
        return [compiled.assembly.metricKey || id,compiled];
      })));
    }
  }

  function validateKeysOrThrow(value,allowed,path){
    if(!isRecord(value)) throw new TypeError(`${path} must be an object`);
    const unknown=Object.keys(value).filter(key=>!allowed.has(key));
    if(unknown.length) throw new Error(`${path} cannot declare ${unknown.join(', ')}`);
  }

  global.RUCA_DRIVETRAIN_CORE=model.freeze({
    version:VERSION,
    owner:OWNER,
    MechanicalValidationEngine,
    DrivetrainRuntime,
    normalizeSignedDegrees,
    deriveMeshedChildAngle,
    preserveRenderPoseDatum,
    scanForExecutableConfiguration
  });
})(typeof window!=='undefined' ? window : globalThis);
