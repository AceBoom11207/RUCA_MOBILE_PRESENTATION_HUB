(() => {
  const disclosure='Simulated data. This public product demo does not connect to hardware, launch applications, or stream music.';
  document.getElementById('demoScenario').addEventListener('click',()=>window.RUCA_PUBLIC_DEMO.nextScenario());
  document.querySelectorAll('input[type=password]').forEach(input=>{input.disabled=true;input.placeholder='Not used in public demo';});
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){document.documentElement.dataset.reducedMotion='true';}
  function applyRoute(){
    const page=location.hash.slice(1).split('?')[0];
    if(page==='media'){
      window.RUCA_CORE_NAV?.route('play',{instant:true,replace:true,source:'public-demo-link'});
      document.querySelector('[data-command-filter="media-district"]')?.click();
      window.RUCA_MEDIA_DECK?.open();
    }else if(['home','play','live','diagnostics','control'].includes(page))window.RUCA_CORE_NAV?.route(page,{instant:true,replace:true,source:'public-demo-link'});
  }
  window.addEventListener('load',()=>{applyRoute();document.body.setAttribute('aria-description',disclosure);});
  window.addEventListener('hashchange',applyRoute);
  document.querySelectorAll('.world-nav [data-page]').forEach(button=>button.addEventListener('click',()=>history.replaceState(history.state,'','#'+button.dataset.page)));
  document.querySelectorAll('[data-command-filter]').forEach(button=>button.addEventListener('click',()=>history.replaceState(history.state,'',button.dataset.commandFilter==='media-district'?'#media':'#play')));
  // Source-level hardware names are reference configuration labels only.
  document.querySelectorAll('.gauge-caption').forEach(node=>node.title='Example configuration — simulated readings');
})();
