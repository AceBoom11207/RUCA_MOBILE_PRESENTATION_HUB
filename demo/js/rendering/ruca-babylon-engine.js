(function rucaBabylonEngineModule(global){
  'use strict';

  const VERSION='60.0.0';
  const VENDOR_VERSION='9.19.0';
  const VENDOR_URL=`vendor/babylonjs-${VENDOR_VERSION}/babylon.js`;
  const BACKEND_QUERY='rucaBabylon';
  const runtime={
    version:VERSION,
    vendorVersion:VENDOR_VERSION,
    backend:'pending',
    state:'idle',
    reason:'',
    engine:null,
    scene:null,
    canvas:null,
    initialization:null,
    vendorPromise:null,
    errors:[],
    contextLossCount:0,
    resizeCount:0,
    disposed:false
  };

  function queryMode(){
    try{
      const params=new URLSearchParams(global.location.search);
      const direct=params.get(BACKEND_QUERY);
      if(direct) return direct;
      if(params.get('rucaDebug')!=='renderer') return 'auto';
      const failure=params.get('fail');
      if(failure==='module') return 'fail-module';
      if(failure==='webgpu') return 'fail-webgpu';
      if(failure==='webgl2') return 'fail-webgl';
      return params.get('backend') || 'auto';
    }catch(_error){
      return 'auto';
    }
  }

  function publish(canvas=runtime.canvas){
    const root=document.documentElement;
    root.dataset.rucaMechanicalBackend=runtime.backend;
    root.dataset.rucaMechanicalBackendState=runtime.state;
    root.dataset.rucaMechanicalBackendReason=runtime.reason || 'none';
    if(canvas){
      canvas.dataset.babylonBackend=runtime.backend;
      canvas.dataset.babylonState=runtime.state;
      canvas.dataset.babylonReason=runtime.reason || 'none';
      canvas.dataset.babylonVersion=VENDOR_VERSION;
    }
  }

  function recordFailure(stage,error){
    const message=String(error?.message || error || 'unknown failure');
    runtime.errors.push({stage,message,time:new Date().toISOString()});
    runtime.reason=`${stage}:${message}`;
    global.console?.info?.(`[RUCA PASS60] ${stage} unavailable; retaining PASS59 fallback.`,message);
  }

  function releaseEngineResources(){
    const scene=runtime.scene;
    const engine=runtime.engine;
    runtime.scene=null;
    runtime.engine=null;
    try{ scene?.dispose?.(); }catch(_sceneDisposeError){ /* fallback must remain available */ }
    try{ engine?.dispose?.(); }catch(_engineDisposeError){ /* fallback must remain available */ }
  }

  function setFallback(reason,error=null){
    releaseEngineResources();
    runtime.backend='canvas2d';
    runtime.state='fallback';
    runtime.reason=String(reason || 'fallback');
    if(error) recordFailure(runtime.reason,error);
    publish();
    return null;
  }

  function loadVendor(){
    if(global.BABYLON) return Promise.resolve(global.BABYLON);
    if(runtime.vendorPromise) return runtime.vendorPromise;
    const mode=queryMode();
    runtime.vendorPromise=new Promise((resolve,reject)=>{
      if(mode==='fail-module'){
        reject(new Error('simulated Babylon module failure'));
        return;
      }
      const existing=document.querySelector('script[data-ruca-babylon-runtime]');
      if(existing){
        existing.addEventListener('load',()=>global.BABYLON ? resolve(global.BABYLON) : reject(new Error('Babylon global missing after load')),{once:true});
        existing.addEventListener('error',()=>reject(new Error('Babylon vendor script failed to load')),{once:true});
        return;
      }
      const script=document.createElement('script');
      script.src=VENDOR_URL;
      script.async=true;
      script.dataset.rucaBabylonRuntime=VENDOR_VERSION;
      script.addEventListener('load',()=>global.BABYLON ? resolve(global.BABYLON) : reject(new Error('Babylon global missing after load')),{once:true});
      script.addEventListener('error',()=>reject(new Error('Babylon vendor script failed to load')),{once:true});
      document.head.append(script);
    });
    return runtime.vendorPromise;
  }

  async function webGPUIsSupported(B){
    if(!global.navigator?.gpu || !B.WebGPUEngine) return false;
    try{
      const support=typeof B.WebGPUEngine.IsSupportedAsync==='function'
        ? B.WebGPUEngine.IsSupportedAsync()
        : B.WebGPUEngine.IsSupportedAsync;
      return Boolean(await support);
    }catch(_error){
      return false;
    }
  }

  async function createWebGPUEngine(B,canvas,mode){
    if(mode==='fail-webgpu') throw new Error('simulated WebGPU initialization failure');
    if(!await webGPUIsSupported(B)) throw new Error('WebGPU is unavailable in this browser');
    let engine=null;
    try{
      engine=new B.WebGPUEngine(canvas,{
        antialias:true,
        adaptToDeviceRatio:false,
        powerPreference:'high-performance',
        audioEngine:false,
        doNotHandleContextLost:false,
        premultipliedAlpha:true,
        useExactSrgbConversions:true,
        canvasTabIndex:-1
      });
      await engine.initAsync();
      return engine;
    }catch(error){
      engine?.dispose?.();
      throw error;
    }
  }

  function createWebGL2Engine(B,canvas,mode){
    if(mode==='fail-webgl') throw new Error('simulated WebGL2 initialization failure');
    const engine=new B.Engine(canvas,true,{
      preserveDrawingBuffer:false,
      stencil:true,
      premultipliedAlpha:true,
      antialias:true,
      disableWebGL2Support:false,
      doNotHandleContextLost:false,
      powerPreference:'high-performance'
    },false);
    if(Number(engine.webGLVersion || 0)<2){
      engine.dispose();
      throw new Error('WebGL2 context unavailable');
    }
    return engine;
  }

  function configureEngine(engine){
    const dpr=Math.min(Math.max(global.devicePixelRatio || 1,1),2);
    const qualityScale=2;
    engine.renderEvenInBackground=false;
    engine.setHardwareScalingLevel(1/(dpr*qualityScale));
    engine.resize();
    const canvas=engine.getRenderingCanvas?.();
    canvas?.removeAttribute?.('tabindex');
    canvas?.classList?.remove?.('gamepad-focusable','ruca-controller-focus');
  }

  function replaceCanvasForWebGL(current){
    const replacement=current.cloneNode(false);
    replacement.hidden=current.hidden;
    current.replaceWith(replacement);
    runtime.canvas=replacement;
    publish(replacement);
    return replacement;
  }

  function attachContextLifecycle(engine,canvas){
    const contextLost=event=>{
      event?.preventDefault?.();
      if(runtime.state==='fallback' && runtime.reason==='graphics-context-lost') return;
      runtime.contextLossCount+=1;
      setFallback('graphics-context-lost');
    };
    canvas.addEventListener('webglcontextlost',contextLost,false);
    engine.onContextLostObservable?.add?.(()=>contextLost());
    engine.onContextRestoredObservable?.add?.(()=>{
      runtime.reason='graphics-context-restored-refresh-required';
      publish(canvas);
    });
  }

  async function initialize(canvas){
    if(runtime.initialization) return runtime.initialization;
    runtime.canvas=canvas;
    runtime.state='loading';
    runtime.reason='';
    publish(canvas);
    runtime.initialization=(async()=>{
      const mode=queryMode();
      if(mode==='fallback') return setFallback('forced-fallback');
      let B;
      try{
        B=await loadVendor();
      }catch(error){
        return setFallback('module-load-failed',error);
      }
      if(mode==='fail-init') return setFallback('simulated-init-failure');

      let engine=null;
      let webGPUAttempted=false;
      if(mode!=='webgl2' && mode!=='fail-webgl'){
        webGPUAttempted=true;
        try{
          engine=await createWebGPUEngine(B,canvas,mode);
          runtime.backend='webgpu';
        }catch(error){
          recordFailure('webgpu',error);
        }
      }
      if(!engine){
        const webGLCanvas=webGPUAttempted ? replaceCanvasForWebGL(canvas) : canvas;
        try{
          engine=createWebGL2Engine(B,webGLCanvas,mode);
          runtime.backend='webgl2';
        }catch(error){
          return setFallback('webgl2-init-failed',error);
        }
      }

      runtime.engine=engine;
      runtime.state='ready';
      runtime.reason=runtime.backend==='webgl2' && runtime.errors.some(entry=>entry.stage==='webgpu')
        ? 'webgpu-unavailable-webgl2-active'
        : 'active';
      runtime.disposed=false;
      configureEngine(engine);
      attachContextLifecycle(engine,runtime.canvas);
      publish(runtime.canvas);
      return engine;
    })();
    return runtime.initialization;
  }

  function bindScene(scene){
    if(runtime.scene && runtime.scene!==scene) throw new Error('PASS60 permits one Babylon scene only');
    runtime.scene=scene;
    publish();
  }

  function resize(){
    if(!runtime.engine || runtime.state!=='ready') return false;
    configureEngine(runtime.engine);
    runtime.resizeCount+=1;
    publish();
    return true;
  }

  function dispose(reason='disposed'){
    if(runtime.disposed) return;
    runtime.disposed=true;
    releaseEngineResources();
    runtime.state='disposed';
    runtime.reason=reason;
    publish();
  }

  function getState(){
    return {
      version:runtime.version,
      vendorVersion:runtime.vendorVersion,
      backend:runtime.backend,
      state:runtime.state,
      reason:runtime.reason,
      engineCount:runtime.engine ? 1 : 0,
      sceneCount:runtime.scene ? 1 : 0,
      renderLoopOwners:0,
      contextLossCount:runtime.contextLossCount,
      resizeCount:runtime.resizeCount,
      errors:runtime.errors.map(entry=>({...entry}))
    };
  }

  global.addEventListener('pagehide',()=>dispose('pagehide'),{once:true});

  global.RUCA_BABYLON_ENGINE=Object.freeze({
    version:VERSION,
    vendorVersion:VENDOR_VERSION,
    vendorUrl:VENDOR_URL,
    initialize,
    bindScene,
    resize,
    dispose,
    getState,
    setFallback
  });
})(window);
