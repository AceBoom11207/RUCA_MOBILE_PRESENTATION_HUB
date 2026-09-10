(function rucaMechanicalModelModule(global){
  'use strict';

  const VERSION='C001.0.0';
  const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
  const isRecord=value=>value!==null && typeof value==='object' && !Array.isArray(value);
  const REGISTRY_STATE=new WeakMap();

  function clone(value){
    if(Array.isArray(value)) return value.map(clone);
    if(isRecord(value)) return Object.keys(value).reduce((copy,key)=>{
      copy[key]=clone(value[key]);
      return copy;
    },{});
    return value;
  }

  function merge(parent,child){
    if(Array.isArray(child)) return child.map(clone);
    if(!isRecord(child)) return clone(child);
    const output=isRecord(parent) ? clone(parent) : {};
    Object.keys(child).forEach(key=>{
      output[key]=isRecord(child[key]) && isRecord(output[key])
        ? merge(output[key],child[key])
        : clone(child[key]);
    });
    return output;
  }

  function freeze(value,seen=new WeakSet()){
    if(!value || typeof value!=='object' || seen.has(value)) return value;
    seen.add(value);
    Object.getOwnPropertyNames(value).forEach(key=>freeze(value[key],seen));
    return Object.freeze(value);
  }

  function assertTypedDefinition(definition,expectedType){
    if(own(definition,'type') && definition.type!==expectedType){
      throw new TypeError(`${definition.id || expectedType} must be constructed as ${expectedType}, not ${definition.type}`);
    }
  }

  function assertPositiveGeometry(component,keys=[]){
    keys.forEach(key=>{
      if(!own(component.geometry,key)) return;
      const value=component.geometry[key];
      if(!Number.isFinite(value) || value<=0){
        throw new TypeError(`${component.id} requires positive geometry.${key}`);
      }
    });
  }

  function assertPositiveIntegerGeometry(component,keys=[]){
    keys.forEach(key=>{
      if(!own(component.geometry,key)) return;
      const value=component.geometry[key];
      if(!Number.isInteger(value) || value<=0){
        throw new TypeError(`${component.id} requires positive integer geometry.${key}`);
      }
    });
  }

  function assertNonNegativeGeometry(component,keys=[]){
    keys.forEach(key=>{
      if(!own(component.geometry,key)) return;
      const value=component.geometry[key];
      if(!Number.isFinite(value) || value<0){
        throw new TypeError(`${component.id} requires non-negative geometry.${key}`);
      }
    });
  }

  function registryState(registry){
    const state=REGISTRY_STATE.get(registry);
    if(!state) throw new TypeError('Invalid MechanicalAssetRegistry receiver');
    return state;
  }

  class MechanicalComponent{
    constructor(definition={},options={}){
      if(!definition.id || typeof definition.id!=='string'){
        throw new TypeError('MechanicalComponent requires a stable string id');
      }
      this.id=definition.id;
      this.type=definition.type || 'component';
      this.kind=definition.kind || 'component';
      this.material=definition.material || null;
      this.surfaceFinish=definition.surfaceFinish || '';
      this.structuralRole=definition.structuralRole || '';
      this.geometry=freeze(clone(definition.geometry || {}));
      this.metadata=freeze(clone(definition.metadata || {}));
      this.extendsAssetId=definition.extendsAssetId || null;
      if(options.deferFreeze!==true) freeze(this);
    }
  }

  class Gear extends MechanicalComponent{
    constructor(definition={}){
      assertTypedDefinition(definition,'gear');
      super({...definition,type:'gear',kind:definition.kind || 'gear'});
      if(!Number.isInteger(this.geometry.teeth) || this.geometry.teeth<=0){
        throw new TypeError(`${this.id} requires a positive integer tooth count`);
      }
      if(!Number.isFinite(this.geometry.module) || this.geometry.module<=0){
        throw new TypeError(`${this.id} requires a positive gear module`);
      }
      assertPositiveGeometry(this,['pitchDiameter','rootDiameter','outsideDiameter','toothDepth','thickness','bore']);
      assertNonNegativeGeometry(this,['chamfer','frontChamfer','rearChamfer','edgeRadius']);
      if(Number.isFinite(this.geometry.pitchDiameter)){
        const expectedPitchDiameter=this.geometry.teeth*this.geometry.module;
        const tolerance=Math.max(1e-9,Math.abs(expectedPitchDiameter)*1e-9);
        if(Math.abs(this.geometry.pitchDiameter-expectedPitchDiameter)>tolerance){
          throw new TypeError(`${this.id} requires pitchDiameter equal to teeth * module`);
        }
      }
      if(
        Number.isFinite(this.geometry.rootDiameter)
        && Number.isFinite(this.geometry.pitchDiameter)
        && this.geometry.rootDiameter>=this.geometry.pitchDiameter
      ){
        throw new TypeError(`${this.id} requires rootDiameter below pitchDiameter`);
      }
      if(
        Number.isFinite(this.geometry.pitchDiameter)
        && Number.isFinite(this.geometry.outsideDiameter)
        && this.geometry.outsideDiameter<=this.geometry.pitchDiameter
      ){
        throw new TypeError(`${this.id} requires outsideDiameter above pitchDiameter`);
      }
    }
    get teeth(){ return this.geometry.teeth; }
    get module(){ return this.geometry.module; }
  }

  class Bridge extends MechanicalComponent{
    constructor(definition={}){
      assertTypedDefinition(definition,'bridge');
      super({...definition,type:'bridge',kind:definition.kind || 'bridge'});
      assertPositiveGeometry(this,['width','length','thickness']);
      assertNonNegativeGeometry(this,['shoulderRadius','chamfer','edgeRadius']);
      assertPositiveIntegerGeometry(this,['pivotCount','bearingSeats']);
    }
  }

  class Bearing extends MechanicalComponent{
    constructor(definition={}){
      assertTypedDefinition(definition,'bearing');
      super({...definition,type:'bearing',kind:definition.kind || 'bearing'});
      assertPositiveGeometry(this,['diameter','bore','seatDiameter','thickness']);
      assertNonNegativeGeometry(this,['chamfer','edgeRadius']);
      if(
        Number.isFinite(this.geometry.bore)
        && Number.isFinite(this.geometry.diameter)
        && this.geometry.bore>=this.geometry.diameter
      ){
        throw new TypeError(`${this.id} requires bore below diameter`);
      }
      if(
        Number.isFinite(this.geometry.seatDiameter)
        && Number.isFinite(this.geometry.diameter)
        && this.geometry.seatDiameter<this.geometry.diameter
      ){
        throw new TypeError(`${this.id} requires seatDiameter at least diameter`);
      }
    }
  }

  class Shaft extends MechanicalComponent{
    constructor(definition={}){
      assertTypedDefinition(definition,'shaft');
      super({...definition,type:'shaft',kind:definition.kind || 'shaft'});
      assertPositiveGeometry(this,['diameter','length','shoulderDiameter','thickness']);
      assertNonNegativeGeometry(this,['chamfer','edgeRadius']);
      if(
        Number.isFinite(this.geometry.shoulderDiameter)
        && Number.isFinite(this.geometry.diameter)
        && this.geometry.shoulderDiameter<this.geometry.diameter
      ){
        throw new TypeError(`${this.id} requires shoulderDiameter at least diameter`);
      }
    }
  }

  class BalanceWheel extends MechanicalComponent{
    constructor(definition={}){
      assertTypedDefinition(definition,'balance-wheel');
      super({...definition,type:'balance-wheel',kind:definition.kind || 'balance-wheel'});
      assertPositiveGeometry(this,['diameter','rimWidth','thickness','bore']);
      assertNonNegativeGeometry(this,['chamfer','edgeRadius']);
      if(own(this.geometry,'spokes') && (!Number.isInteger(this.geometry.spokes) || this.geometry.spokes<=0)){
        throw new TypeError(`${this.id} requires a positive integer geometry.spokes`);
      }
      if(
        Number.isFinite(this.geometry.rimWidth)
        && Number.isFinite(this.geometry.diameter)
        && this.geometry.rimWidth*2>=this.geometry.diameter
      ){
        throw new TypeError(`${this.id} requires rimWidth below its radius`);
      }
    }
  }

  class Fastener extends MechanicalComponent{
    constructor(definition={}){
      assertTypedDefinition(definition,'fastener');
      super({...definition,type:'fastener',kind:definition.kind || 'fastener'});
      assertPositiveGeometry(this,['headDiameter','shaftDiameter','seatDiameter','thickness']);
      assertNonNegativeGeometry(this,['chamfer','edgeRadius']);
      if(
        Number.isFinite(this.geometry.headDiameter)
        && Number.isFinite(this.geometry.shaftDiameter)
        && this.geometry.headDiameter<this.geometry.shaftDiameter
      ){
        throw new TypeError(`${this.id} requires headDiameter at least shaftDiameter`);
      }
      if(
        Number.isFinite(this.geometry.seatDiameter)
        && Number.isFinite(this.geometry.shaftDiameter)
        && this.geometry.seatDiameter<this.geometry.shaftDiameter
      ){
        throw new TypeError(`${this.id} requires seatDiameter at least shaftDiameter`);
      }
    }
  }

  class Assembly extends MechanicalComponent{
    constructor(definition={},registry){
      if(!definition.id || typeof definition.id!=='string'){
        throw new TypeError('Assembly requires a stable string id');
      }
      super({...definition,type:'assembly',kind:definition.kind || 'assembly'},{deferFreeze:true});
      this.metricKey=definition.metricKey || '';
      this.role=definition.role || '';
      this.motionAuthority=definition.motionAuthority || '';
      this.pressureAngle=Number(definition.pressureAngle) || 20;
      this.inputs=freeze(clone(definition.inputs || []));
      this.nodes=freeze(clone(definition.nodes || []));
      this.driveLinks=freeze(clone(definition.driveLinks || []));
      this.supportLinks=freeze(clone(definition.supportLinks || []));
      this.outputs=freeze(clone(definition.outputs || []));
      this.metadata=freeze(clone(definition.metadata || {}));
      this.extendsAssetId=definition.extendsAssetId || null;
      this.registry=registry || null;
      const children=new Map();
      this.nodes.forEach(node=>{
        const parentId=node.parentId || null;
        if(!children.has(parentId)) children.set(parentId,[]);
        children.get(parentId).push(node.id);
      });
      this.rootNodeIds=freeze([...(children.get(null) || [])]);
      this.childrenByParent=freeze(Object.fromEntries(
        [...children.entries()].map(([key,value])=>[key===null ? '$root' : key,[...value]])
      ));
      freeze(this);
    }
    component(nodeOrId){
      if(!this.registry) return null;
      const node=typeof nodeOrId==='string'
        ? this.nodes.find(candidate=>candidate.id===nodeOrId)
        : nodeOrId;
      return node ? this.registry.resolve(node.assetId) : null;
    }
    childrenOf(parentId=null){
      const ids=this.childrenByParent[parentId===null ? '$root' : parentId] || [];
      return ids.map(id=>this.nodes.find(node=>node.id===id));
    }
  }

  const CONSTRUCTORS=Object.freeze({
    component:MechanicalComponent,
    gear:Gear,
    bridge:Bridge,
    bearing:Bearing,
    shaft:Shaft,
    'balance-wheel':BalanceWheel,
    fastener:Fastener,
    assembly:Assembly
  });

  class MechanicalAssetRegistry{
    constructor(){
      REGISTRY_STATE.set(this,{
        definitions:new Map(),
        resolvedDefinitions:new Map(),
        instances:new Map(),
        sealed:false
      });
    }
    get sealed(){
      return registryState(this).sealed;
    }
    define(definition){
      const state=registryState(this);
      if(state.sealed) throw new Error('MechanicalAssetRegistry is sealed');
      if(!definition || typeof definition.id!=='string' || !definition.id.trim()){
        throw new TypeError('Mechanical asset definition requires an id');
      }
      if(state.definitions.has(definition.id)){
        throw new Error(`Duplicate mechanical asset id: ${definition.id}`);
      }
      const copy=clone(definition);
      if(own(copy,'type') && (!copy.type || typeof copy.type!=='string')){
        throw new TypeError(`${copy.id} requires a non-empty string type`);
      }
      state.definitions.set(copy.id,freeze(copy));
      return this;
    }
    defineMany(definitions=[]){
      definitions.forEach(definition=>this.define(definition));
      return this;
    }
    resolveDefinition(id,ancestry=[]){
      const state=registryState(this);
      if(state.resolvedDefinitions.has(id)) return state.resolvedDefinitions.get(id);
      const definition=state.definitions.get(id);
      if(!definition) throw new Error(`Unknown mechanical asset: ${id}`);
      if(ancestry.includes(id)){
        throw new Error(`Mechanical asset inheritance cycle: ${[...ancestry,id].join(' -> ')}`);
      }
      let resolved=clone(definition);
      if(definition.extendsAssetId){
        const parent=this.resolveDefinition(definition.extendsAssetId,[...ancestry,id]);
        const parentType=parent.type || 'component';
        const childType=own(definition,'type') ? definition.type : parentType;
        const compatible=childType===parentType
          || (parent.abstract===true && parent.polymorphic===true);
        if(!compatible){
          throw new Error(`${id} cannot inherit ${parentType} asset ${definition.extendsAssetId} as ${childType}`);
        }
        resolved=merge(parent,definition);
        resolved.id=definition.id;
        resolved.type=childType;
        resolved.kind=own(definition,'kind')
          ? definition.kind
          : (childType!==parentType ? childType : (parent.kind || childType));
        resolved.extendsAssetId=definition.extendsAssetId;
        resolved.abstract=definition.abstract===true;
      }else{
        resolved.type=definition.type || 'component';
        resolved.kind=definition.kind || resolved.type;
        resolved.abstract=definition.abstract===true;
      }
      if(!CONSTRUCTORS[resolved.type]){
        throw new TypeError(`${id} declares unsupported mechanical asset type ${resolved.type}`);
      }
      const frozen=freeze(resolved);
      state.resolvedDefinitions.set(id,frozen);
      return frozen;
    }
    resolve(id){
      const state=registryState(this);
      if(state.instances.has(id)) return state.instances.get(id);
      const definition=this.resolveDefinition(id);
      if(definition.abstract===true){
        throw new Error(`Cannot instantiate abstract mechanical asset: ${id}`);
      }
      const Constructor=CONSTRUCTORS[definition.type];
      const instance=definition.type==='assembly'
        ? new Constructor(definition,this)
        : new Constructor(definition);
      state.instances.set(id,instance);
      return instance;
    }
    ids({includeAbstract=false,type=null}={}){
      const state=registryState(this);
      return [...state.definitions.keys()].filter(id=>{
        const definition=this.resolveDefinition(id);
        if(!includeAbstract && definition.abstract===true) return false;
        return !type || definition.type===type;
      });
    }
    toObject(options={}){
      return freeze(Object.fromEntries(this.ids(options).map(id=>[id,this.resolve(id)])));
    }
    inheritanceChain(id){
      const state=registryState(this);
      const chain=[];
      const visited=new Set();
      let current=state.definitions.get(id);
      if(!current) throw new Error(`Unknown mechanical asset: ${id}`);
      while(current){
        if(visited.has(current.id)){
          throw new Error(`Mechanical asset inheritance cycle: ${[...chain,current.id].join(' -> ')}`);
        }
        visited.add(current.id);
        chain.push(current.id);
        if(!current.extendsAssetId) break;
        const parent=state.definitions.get(current.extendsAssetId);
        if(!parent){
          throw new Error(`Unknown mechanical asset: ${current.extendsAssetId} referenced by ${current.id}`);
        }
        current=parent;
      }
      return freeze(chain);
    }
    validateInheritance(){
      const state=registryState(this);
      const errors=[];
      state.definitions.forEach((definition,id)=>{
        try{ this.resolveDefinition(id); }
        catch(error){ errors.push({code:'ASSET_INHERITANCE',assetId:id,message:error.message}); }
      });
      return freeze({valid:errors.length===0,errors});
    }
    seal(){
      const state=registryState(this);
      if(state.sealed) return this;
      const validation=this.validateInheritance();
      if(!validation.valid){
        throw new Error(`Cannot seal invalid mechanical asset registry: ${validation.errors.map(error=>error.message).join('; ')}`);
      }
      state.sealed=true;
      return this;
    }
  }

  global.RUCA_MECHANICAL_MODEL=freeze({
    version:VERSION,
    MechanicalComponent,
    Gear,
    Bridge,
    Bearing,
    Shaft,
    BalanceWheel,
    Fastener,
    Assembly,
    MechanicalAssetRegistry,
    clone,
    merge,
    freeze,
    own
  });
})(typeof window!=='undefined' ? window : globalThis);
