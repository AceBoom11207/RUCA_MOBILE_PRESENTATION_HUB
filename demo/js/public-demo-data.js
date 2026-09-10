/* Public demo boundary. This module is the only data owner: no network calls,
   credentials, OS commands, geolocation, or private machine snapshots. */
(() => {
  'use strict';
  // The current desktop's visible presentation settings, captured September 10.
  // Only visual preferences are carried over; all data below is invented demo data.
  try {
    if(localStorage.getItem('rucaSeptemberDemoPresentation')!=='1'){
      localStorage.setItem('rucaTheme',JSON.stringify({preset:'default',font:'"Roboto Condensed", "Segoe UI", Arial, sans-serif',depth:64,glow:100,glass:72,motion:100,density:100,homeViewMode:'standard',homeScale:91,starBrightness:100,starDensity:100,starBreath:100,starDrift:100}));
      localStorage.setItem('rucaCockpitBrightness','100');
      localStorage.setItem('rucaSeptemberDemoPresentation','1');
    }
  } catch (_) {}
  let scenario = 0;
  const labels = ['EVERYDAY', 'CREATIVE LOAD', 'SENSOR UNAVAILABLE'];
  const values = [
    {cpu:24,gpu:18,ram:32,temp:48,heart:94},
    {cpu:72,gpu:84,ram:61,temp:76,heart:82},
    {cpu:24,gpu:18,ram:32,temp:null,heart:null}
  ];
  function notice(message){
    const el=document.getElementById('demoNotice');
    if(!el)return;
    el.textContent=message;el.hidden=false;
    clearTimeout(notice.timer);notice.timer=setTimeout(()=>el.hidden=true,5500);
  }
  function telemetry(){
    const v=values[scenario];
    return {timestamp:new Date().toISOString(),source:'SIMULATED DATA',status:'PARTIAL',state:scenario===2?'UNAVAILABLE':'DEMO',heart:v.heart,live:true,
      cpu:{load:v.cpu,temp:v.temp},gpu:{load:v.gpu,temp:v.temp===null?null:v.temp-4,vramUsedMb:4096,vramTotalMb:16384,power:120},
      ram:{load:v.ram,used:v.ram*1.28,total:128},storage:{health:null,free:1200,usedPercent:40},network:{down:12,up:2,ping:18}};
  }
  function inventory(){
    const v=values[scenario];
    const rows=[['CPU','Total CPU Usage',v.cpu,'%'],['CPU','CPU Package Temperature',v.temp,'°C'],['CPU','Core Clock',4200,'MHz'],['GPU','Total GPU Usage',v.gpu,'%'],['GPU','GPU Temperature',v.temp===null?null:v.temp-4,'°C'],['GPU','GPU Power',120,'W'],['RAM','Physical Memory Load',v.ram,'%'],['THERMALS','CPU Package Temperature',v.temp,'°C'],['FANS','System Fan',1100,'RPM'],['STORAGE','Free Capacity',1200,'GB'],['SMART','Drive Health',null,'%'],['NETWORK','Download Rate',12,'Mbps'],['NETWORK','Upload Rate',2,'Mbps'],['POWER','CPU Package Power',64,'W']];
    return {schema_version:'RUCA_PUBLIC_SAMPLE_V1',state:'ACTIVE',source:'SIMULATED DATA',timestamp:new Date().toISOString(),reason:'Illustrative sensor inventory; no hardware connected.',readings:rows.map(([domain,label,current,unit],i)=>({id:'demo-'+i,domain,label,current,unit,minimum:current,maximum:current,average:current,available:current!==null,state:current===null?'NOT EXPOSED':'ACTIVE',hardware_group:domain+' // SAMPLE',hardware_group_id:'sample-'+domain,source:'SIMULATED DATA'}))};
  }
  const weather={state:'DEMO',source_status:'DEMO',confidence:'ILLUSTRATIVE',source:'SAMPLE WEATHER',provider:'Illustrative sample',timestamp:'2026-09-10T12:00:00Z',current:{temperature_2m:75,apparent_temperature:77,weather_code:2,is_day:1,relative_humidity_2m:54,wind_speed_10m:12,wind_direction_10m:225,time:'2026-09-10T12:00'},daily:{time:['2026-09-10','2026-09-11','2026-09-12','2026-09-13','2026-09-14'],temperature_2m_max:[79,81,75,73,77],temperature_2m_min:[64,66,63,61,64],weather_code:[2,1,3,61,1],sunrise:['2026-09-10T06:30'],sunset:['2026-09-10T19:15']},hourly:{time:['2026-09-10T12:00','2026-09-10T13:00','2026-09-10T14:00','2026-09-10T15:00'],temperature_2m:[75,77,79,77],weather_code:[2,2,1,1],precipitation_probability:[5,5,0,0]}};
  async function request(input,options={}){
    const target = new URL(typeof input==='string'?input:input.url,document.baseURI);
    const path=target.pathname;
    let data;
    if(path==='/telemetry')data=telemetry();
    else if(path==='/telemetry/inventory')data=inventory();
    else if(path==='/commands/registry'||path.endsWith('/PASS19_PLAY_COMMAND_REGISTRY.json'))data={commands:window.RUCA_DEMO_COMMANDS};
    else if(path==='/commands/launch'){
      notice('Command preview — public demos do not launch applications or change your computer.');
      data={ok:false,status:'DEMO',state:'DEMO',message:'Command preview only. No application was launched.',error:'Public demonstration only.'};
    }else if(path==='/live/weather')data=structuredClone(weather);
    else if(path.startsWith('/live/'))data={state:'UNAVAILABLE',source_status:'UNAVAILABLE',source:'PUBLIC DEMO',reason:'This information feed is not connected in the public demonstration.',message:'Live information is unavailable in this demonstration.',items:[],quotes:[],events:[],games:[]};
    else if(path==='/sources/status')data={state:'DEMO',sources:[],message:'External sources are disabled in this demonstration.'};
    else if(path==='/benchmarks/suites')data={suites:[],categories:[],message:'Benchmarks require a connected desktop. This demo does not run hardware tests.'};
    else data={ok:false,state:'UNAVAILABLE',status:'UNAVAILABLE',error:'This connected action is unavailable in the public demo.',sources:[],items:[]};
    return new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
  }
  // All legacy front-end request paths terminate in memory here.
  window.fetch=request;
  window.open=()=>{notice('External launch is unavailable in this public demonstration.');return null;};
  window.RUCA_PUBLIC_DEMO=Object.freeze({notice,telemetry,inventory,get scenario(){return labels[scenario];},nextScenario(){scenario=(scenario+1)%values.length;document.getElementById('demoScenario').textContent='SCENARIO: '+labels[scenario];notice('Showing '+labels[scenario].toLowerCase()+' — simulated data.');}});
})();
