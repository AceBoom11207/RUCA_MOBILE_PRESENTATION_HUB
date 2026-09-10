import {rucaSpotifyIsAuthed} from './ruca-spotify-auth.js';
import {rucaSpotifyProofBoot,rucaSpotifyProofTransfer} from './ruca-spotify-proof.js';
import {
  rucaSpotifyGetDeviceId,
  rucaSpotifyGetActiveDevice,
  rucaSpotifyIsRateLimited,
  rucaSpotifyGetRateLimitState,
  rucaSpotifyActivateElement,
  rucaSpotifyNext,
  rucaSpotifyPause,
  rucaSpotifyPlay,
  rucaSpotifyPrevious,
  rucaSpotifySeek,
  rucaSpotifyVolume,
  rucaSpotifyGetQueue,
  rucaSpotifyFetchDevices,
  rucaSpotifySyncNow,
  rucaSpotifySearch,
  rucaSpotifyGetCurrentUserPlaylists,
  rucaSpotifyGetPlaylist,
  rucaSpotifyGetPlaylistItems,
  rucaSpotifyGetRecentlyPlayed,
  rucaSpotifyGetSavedTracks,
  rucaSpotifyCheckSavedItems,
  rucaSpotifySaveItems,
  rucaSpotifyRemoveItems,
  rucaSpotifyAddToQueue,
  rucaSpotifyPlayUris,
  rucaSpotifyGetAlbum,
  rucaSpotifyGetArtist,
  rucaSpotifyGetArtistAlbums,
  rucaSpotifyShuffle,
  rucaSpotifyRepeat,
  rucaSpotifyTransferToDevice
} from './ruca-spotify-player.js';

const deck=document.getElementById('rucaMediaDeck');
const playPage=document.getElementById('page-play');
if(!deck || !playPage) throw new Error('RUCA_MEDIA_DECK requires the PLAY Media Deck markup.');

const byId=id=>document.getElementById(id);
const nodes={
  art:byId('rucaMediaArt'),
  artFallback:byId('rucaMediaArtFallback'),
  artAction:byId('rucaMediaAlbumArtAction'),
  connection:byId('rucaMediaConnectionState'),
  device:byId('rucaMediaDeviceState'),
  title:byId('rucaMediaCoreTitle'),
  artist:byId('rucaMediaArtist'),
  album:byId('rucaMediaAlbum'),
  seek:byId('rucaMediaSeek'),
  elapsed:byId('rucaMediaElapsed'),
  duration:byId('rucaMediaDuration'),
  previous:byId('rucaMediaPrevious'),
  playPause:byId('rucaMediaPlayPause'),
  next:byId('rucaMediaNext'),
  shuffle:byId('rucaMediaShuffle'),
  repeat:byId('rucaMediaRepeat'),
  like:byId('rucaMediaLike'),
  dislike:byId('rucaMediaDislike'),
  volume:byId('rucaMediaVolume'),
  volumeValue:byId('rucaMediaVolumeValue'),
  queueTitle:byId('rucaMediaQueueTitle'),
  queueList:byId('rucaMediaQueueList'),
  connect:byId('rucaMediaConnect'),
  tickerState:byId('rucaMediaTickerState'),
  tickerDetail:byId('rucaMediaTickerDetail'),
  nowSurface:byId('rucaMediaNowSurface'),
  browseSurface:byId('rucaMediaBrowseSurface'),
  browseTitle:byId('rucaMediaBrowseTitle'),
  browseMeta:byId('rucaMediaBrowseMeta'),
  browseList:byId('rucaMediaBrowseList'),
  searchForm:byId('rucaMediaSearchForm'),
  searchInput:byId('rucaMediaSearchInput'),
  searchSubmit:document.querySelector('#rucaMediaSearchForm button[type="submit"]'),
  searchCategories:byId('rucaMediaSearchCategories')
};

const missingNodes=Object.entries(nodes).filter(([,node])=>!node).map(([name])=>name);
if(missingNodes.length) throw new Error('RUCA_MEDIA_DECK markup is missing: '+missingNodes.join(', '));

const RUCA_MEDIA_PREFERENCE_KEY='ruca_media_preferences_v1';
const RUCA_QUEUE_REFRESH_MS=15000;
const SEARCH_TYPES=['track','artist','album','playlist'];
const REPEAT_SEQUENCE=['off','context','track'];

let latestState=null;
let latestDevices=[];
let ownershipVerified=false;
let booting=false;
let route={view:'now-playing',data:null};
let routeHistory=[];
let queueTracks=[];
const entityStore=new Map();
let queueInFlight=null;
let queueLastRefresh=0;
let lastTrackKey='';
let currentTrackSaved=null;
let savedCheckGeneration=0;
let searchTypes=new Set(SEARCH_TYPES);
let searchTimer=0;
let searchGeneration=0;
let controllerSeekPreview=null;

function loadPreferences(){
  try{
    const value=JSON.parse(localStorage.getItem(RUCA_MEDIA_PREFERENCE_KEY)||'{}');
    return {
      version:1,
      disliked:value && typeof value.disliked==='object' ? value.disliked : {}
    };
  }catch{
    return {version:1,disliked:{}};
  }
}

let preferences=loadPreferences();

function persistPreferences(){
  localStorage.setItem(RUCA_MEDIA_PREFERENCE_KEY,JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent('ruca:media:preferences',{detail:{dislikedCount:Object.keys(preferences.disliked).length}}));
}

function trackPreferenceKey(track){
  return track?.uri || (track?.id ? 'spotify:track:'+track.id : '');
}

function isDisliked(track){
  const key=typeof track==='string' ? track : trackPreferenceKey(track);
  return Boolean(key && preferences.disliked[key]);
}

function setDisliked(track,disliked){
  const key=trackPreferenceKey(track);
  if(!key) return false;
  if(disliked){
    preferences.disliked[key]={
      trackId:track.id || '',
      uri:track.uri || key,
      name:track.name || 'UNKNOWN TRACK',
      artist:trackArtists(track),
      markedAt:new Date().toISOString()
    };
  }else{
    delete preferences.disliked[key];
  }
  persistPreferences();
  return disliked;
}

window.RUCA_MEDIA_PREFERENCES=Object.freeze({
  owner:'RUCA_MEDIA_PREFERENCES',
  isDisliked,
  setDisliked,
  get count(){return Object.keys(preferences.disliked).length;},
  get entries(){return Object.values(preferences.disliked).map(entry=>({...entry}));}
});

const wait=milliseconds=>new Promise(resolve=>window.setTimeout(resolve,milliseconds));

function durationLabel(milliseconds){
  const seconds=Math.max(0,Math.floor((Number(milliseconds)||0)/1000));
  return String(Math.floor(seconds/60))+':'+String(seconds%60).padStart(2,'0');
}

function currentTrack(){
  return latestState?.track_window?.current_track || null;
}

function currentTrackKey(){
  const track=currentTrack();
  return track?.id || track?.uri || '';
}

function trackArtists(track){
  if(Array.isArray(track?.artists)){
    const names=track.artists.map(artist=>typeof artist==='string' ? artist : artist?.name).filter(Boolean);
    if(names.length) return names.join(', ');
  }
  return typeof track?.artists==='string' && track.artists ? track.artists : 'ARTIST DATA UNAVAILABLE';
}

function trackAlbum(track){
  if(typeof track?.album==='string') return track.album || 'ALBUM DATA UNAVAILABLE';
  return track?.album?.name || 'ALBUM DATA UNAVAILABLE';
}

function mediaImage(item){
  return item?.album?.images?.[0]?.url || item?.images?.[0]?.url || item?.art || '';
}

function itemUri(item){
  return item?.uri || '';
}

function stateDevice(){
  const active=rucaSpotifyGetActiveDevice();
  if(active?.id) return active;
  const state=latestState?.device;
  if(!state?.id) return null;
  return {
    id:state.id,
    name:state.name || 'UNKNOWN DEVICE',
    type:state.type || '',
    isActive:state.is_active!==false,
    volumePercent:state.volume_percent ?? state.volumePercent
  };
}

function setServiceState(connection,detail){
  nodes.connection.textContent=connection;
  nodes.tickerState.textContent=connection.replace('DEMO // ','');
  if(detail) nodes.tickerDetail.textContent=detail;
}

function setAuxiliaryState(scope,error){
  const message=error?.message || 'Spotify did not expose this auxiliary state.';
  nodes.tickerDetail.textContent=scope+' // '+message;
}

function renderRateLimitState(){
  const rateLimit=rucaSpotifyGetRateLimitState();
  if(!rateLimit.limited) return false;
  const detail=rateLimit.retryKnown
    ? 'Spotify API requests suspended until the verified Retry-After window clears.'
    : 'Spotify did not expose its Retry-After window to RUCA; automatic API requests are suspended.';
  setServiceState('DEMO // RATE LIMITED',detail);
  return true;
}

function setIdle(title,detail,connection='DEMO // STANDBY'){
  nodes.title.textContent=title;
  nodes.artist.textContent=detail;
  nodes.album.textContent='ALBUM // DATA UNAVAILABLE';
  setServiceState(connection,detail);
}

function renderArtwork(track){
  const image=mediaImage(track);
  if(!image){
    nodes.art.removeAttribute('src');
    nodes.art.classList.remove('is-loaded');
    nodes.art.hidden=true;
    nodes.artFallback.hidden=false;
    return;
  }
  if(nodes.art.src!==image){
    nodes.art.classList.remove('is-loaded');
    nodes.art.src=image;
  }
  nodes.art.alt='Album artwork for '+(track?.name || 'current Spotify track');
  nodes.art.hidden=false;
  nodes.artFallback.hidden=true;
  if(nodes.art.complete && nodes.art.naturalWidth) nodes.art.classList.add('is-loaded');
}

function stateDisallows(action){
  return Boolean(latestState?.actions?.disallows?.[action] || latestState?.disallows?.[action]);
}

function setAvailability(node,enabled,reason=''){
  node.disabled=!enabled;
  node.setAttribute('aria-disabled',enabled ? 'false' : 'true');
  if(reason) node.title=reason;
  else node.removeAttribute('title');
}

function bindCurrentEntityAction(node,track,entityId,kind){
  const enabled=Boolean(track && entityId);
  setAvailability(node,enabled,enabled ? '' : 'Verified Spotify identity is unavailable for this destination.');
  if(!enabled){
    delete node.dataset.mediaId;
    delete node.dataset.mediaUri;
    delete node.dataset.mediaType;
    return;
  }
  node.dataset.mediaId=track.id || '';
  node.dataset.mediaUri=track.uri || '';
  node.dataset.mediaType='track';
  const entityName=kind==='artist' ? trackArtists(track) : trackAlbum(track);
  node.setAttribute('aria-label','Open '+entityName+' '+kind+' detail in RUCA');
}

function renderCurrentEntityActions(track){
  const albumId=track?.album?.id || '';
  const artistId=track?.artists?.find?.(artist=>artist?.id)?.id || '';
  bindCurrentEntityAction(nodes.artAction,track,albumId,'album');
  bindCurrentEntityAction(nodes.album,track,albumId,'album');
  bindCurrentEntityAction(nodes.artist,track,artistId,'artist');
}

function controlCapabilities(){
  const active=stateDevice();
  const authenticated=rucaSpotifyIsAuthed();
  const activePlayback=Boolean(authenticated && active?.id && currentTrack());
  const paused=Boolean(latestState?.paused);
  const resumableOnRuca=Boolean(authenticated && rucaSpotifyGetDeviceId() && paused && currentTrack()?.uri);
  const musicTrack=currentTrack()?.type==='track';
  const restartCurrent=musicTrack && (Number(latestState?.position)||0)>3000;
  return {
    previous:activePlayback && (restartCurrent ? !stateDisallows('seeking') : !stateDisallows('skipping_prev')),
    playPause:(activePlayback || resumableOnRuca) && !stateDisallows(paused ? 'resuming' : 'pausing'),
    next:activePlayback && !stateDisallows('skipping_next'),
    seek:activePlayback && !stateDisallows('seeking') && Number(currentTrack()?.duration_ms)>0,
    volume:Boolean(authenticated && rucaSpotifyGetDeviceId()),
    shuffle:activePlayback && !stateDisallows('toggling_shuffle'),
    repeat:activePlayback,
    like:Boolean(authenticated && currentTrack()?.uri),
    dislike:Boolean(currentTrack()?.uri),
    search:authenticated
  };
}

function controlsEnabled(){
  const capability=controlCapabilities();
  const focused=document.activeElement;
  setAvailability(nodes.previous,capability.previous,stateDisallows('skipping_prev') ? 'Spotify has disabled previous-track control for this playback context.' : '');
  setAvailability(nodes.playPause,capability.playPause,stateDisallows(latestState?.paused ? 'resuming' : 'pausing') ? 'Spotify has disabled this playback state change.' : '');
  setAvailability(nodes.next,capability.next,stateDisallows('skipping_next') ? 'Spotify has disabled next-track control for this playback context.' : '');
  setAvailability(nodes.seek,capability.seek,stateDisallows('seeking') ? 'Spotify has disabled seeking for this playback context.' : '');
  setAvailability(nodes.volume,capability.volume);
  setAvailability(nodes.shuffle,capability.shuffle,stateDisallows('toggling_shuffle') ? 'Spotify has disabled shuffle for this playback context.' : '');
  const repeatMode=latestState?.repeat_mode || 'off';
  const repeatDisallow=repeatMode==='track' ? 'toggling_repeat_track' : 'toggling_repeat_context';
  setAvailability(nodes.repeat,capability.repeat && !stateDisallows(repeatDisallow),stateDisallows(repeatDisallow) ? 'Spotify has disabled repeat for this playback context.' : '');
  setAvailability(nodes.like,capability.like);
  setAvailability(nodes.dislike,capability.dislike);
  setAvailability(nodes.searchInput,capability.search);
  setAvailability(nodes.searchSubmit,capability.search);
  if(focused?.disabled){
    const recovery=[nodes.playPause,nodes.connect,...deck.querySelectorAll('[data-ruca-media-view]')].find(node=>node && !node.disabled && !node.hidden);
    recovery?.focus({preventScroll:true});
  }
  return capability;
}

function syncConnectControl(){
  const rucaDeviceId=rucaSpotifyGetDeviceId();
  const active=stateDevice();
  ownershipVerified=Boolean(rucaDeviceId && active?.id===rucaDeviceId);
  if(ownershipVerified){
    nodes.connect.textContent='DEMO PLAYER READY';
    nodes.connect.disabled=true;
  }else if(booting){
    nodes.connect.textContent='CONNECTING RUCA DEVICE';
    nodes.connect.disabled=true;
  }else if(rucaSpotifyIsAuthed() && rucaDeviceId){
    nodes.connect.textContent='TRANSFER TO RUCA OS';
    nodes.connect.disabled=false;
  }else if(rucaSpotifyIsAuthed()){
    nodes.connect.textContent='INITIALIZE RUCA PLAYER';
    nodes.connect.disabled=false;
  }else{
    nodes.connect.textContent='CONNECT SPOTIFY';
    nodes.connect.disabled=false;
  }
}

function updateRangeProgress(input){
  const min=Number(input.min)||0;
  const max=Number(input.max)||1;
  const value=Number(input.value)||0;
  const progress=Math.max(0,Math.min(100,((value-min)/(max-min||1))*100));
  input.style.setProperty('--ruca-range-progress',progress+'%');
}

function renderTrackActions(track){
  const disliked=isDisliked(track);
  nodes.like.classList.toggle('is-active',currentTrackSaved===true);
  nodes.like.setAttribute('aria-pressed',currentTrackSaved===true ? 'true' : 'false');
  nodes.like.textContent=currentTrackSaved===true ? '♥ LIKED' : '♡ LIKE';
  nodes.dislike.classList.toggle('is-active',disliked);
  nodes.dislike.setAttribute('aria-pressed',disliked ? 'true' : 'false');
  nodes.dislike.textContent=disliked ? '⌄ DISLIKED // RUCA' : '⌄ DISLIKE';
}

function render(){
  const track=currentTrack();
  const active=stateDevice();
  const rucaDeviceId=rucaSpotifyGetDeviceId();
  controlsEnabled();
  syncConnectControl();

  if(active?.id){
    const owner=rucaDeviceId && active.id===rucaDeviceId ? 'DEMO PLAYER' : 'EXTERNAL ACTIVE';
    nodes.device.textContent='DEVICE // '+owner+' // '+active.name+' // '+active.id.slice(0,8);
    const volume=Number(active.volumePercent);
    if(Number.isFinite(volume)){
      nodes.volume.value=String(Math.max(0,Math.min(100,Math.round(volume))));
      nodes.volumeValue.textContent=nodes.volume.value+'%';
      updateRangeProgress(nodes.volume);
    }
  }else if(rucaDeviceId){
    nodes.device.textContent='DEVICE // RUCA READY // OWNERSHIP NOT VERIFIED';
  }else{
    nodes.device.textContent='DEVICE // NOT CONNECTED';
  }

  if(!track){
    nodes.seek.value='0';
    nodes.elapsed.textContent='0:00';
    nodes.duration.textContent='--:--';
    nodes.playPause.textContent='▶';
    nodes.shuffle.classList.remove('is-active');
    nodes.repeat.classList.remove('is-active');
    currentTrackSaved=null;
    renderTrackActions(null);
    renderArtwork(null);
    renderCurrentEntityActions(null);
    updateRangeProgress(nodes.seek);
    if(rucaSpotifyIsAuthed()) setIdle('SPOTIFY AUTHENTICATED','No active Spotify playback state is currently available.','DEMO // READY');
    renderRateLimitState();
    return;
  }

  const position=Math.max(0,controllerSeekPreview===null ? Number(latestState?.position)||0 : controllerSeekPreview);
  const duration=Math.max(0,Number(track.duration_ms ?? track.duration)||0);
  const paused=Boolean(latestState?.paused);
  const artist=trackArtists(track);
  const album=trackAlbum(track);

  deck.dataset.trackId=track.id || '';
  deck.dataset.trackUri=track.uri || '';
  nodes.title.textContent=track.name || 'TRACK DATA UNAVAILABLE';
  nodes.artist.textContent=artist;
  nodes.album.textContent='ALBUM // '+album;
  setServiceState(paused ? 'DEMO // PAUSED' : 'DEMO // PLAYING',nodes.title.textContent+' // '+artist);
  nodes.seek.max=String(Math.max(1,duration));
  nodes.seek.value=String(Math.min(position,Math.max(1,duration)));
  nodes.elapsed.textContent=durationLabel(position);
  nodes.duration.textContent=durationLabel(duration);
  nodes.playPause.textContent=paused ? '▶' : 'Ⅱ';
  nodes.playPause.setAttribute('aria-label',paused ? 'Play track' : 'Pause track');
  nodes.shuffle.classList.toggle('is-active',Boolean(latestState?.shuffle));
  nodes.shuffle.setAttribute('aria-pressed',latestState?.shuffle ? 'true' : 'false');
  nodes.repeat.classList.toggle('is-active',(latestState?.repeat_mode||'off')!=='off');
  nodes.repeat.dataset.repeatMode=latestState?.repeat_mode || 'off';
  nodes.repeat.setAttribute('aria-label','Repeat mode '+(latestState?.repeat_mode || 'off'));
  nodes.repeat.textContent='REPEAT // '+String(latestState?.repeat_mode || 'off').toUpperCase();
  updateRangeProgress(nodes.seek);
  renderTrackActions(track);
  renderArtwork(track);
  renderCurrentEntityActions(track);
  renderRateLimitState();
}

async function refreshUntil(predicate,initialState=null){
  let state=initialState;
  for(let attempt=0;attempt<7;attempt+=1){
    if(state && predicate(state)) return state;
    await wait(400);
    state=await rucaSpotifySyncNow(true);
    if(!state && rucaSpotifyIsRateLimited()){
      const error=new Error('Spotify rate limited state confirmation; the command result remains pending verification.');
      error.code='SPOTIFY_RATE_LIMITED';
      throw error;
    }
  }
  return null;
}

async function runControl(label,capability,operation,confirmation){
  if(!controlCapabilities()[capability]){
    setServiceState('DEMO // CONTROL UNAVAILABLE','The current Spotify state does not support this specific control.');
    return null;
  }
  setServiceState('DEMO // '+label,'Command sent; waiting for verified playback state.');
  try{
    const result=await operation();
    const confirmed=confirmation ? await refreshUntil(confirmation,result) : result;
    if(confirmation && !confirmed) throw new Error('Spotify did not confirm the requested state change.');
    if(confirmed) latestState=confirmed;
    render();
    return confirmed;
  }catch(error){
    console.error('[RUCA/Media Deck] '+label+' control failed:',error);
    setServiceState(error?.code==='SPOTIFY_RATE_LIMITED' ? 'DEMO // RATE LIMITED' : 'DEMO // CONTROL ERROR',error.message || 'The service did not confirm this control action.');
    return null;
  }
}

async function resolveRucaPlaybackDevice(){
  if(!rucaSpotifyIsAuthed()) throw new Error('Spotify authorization is unavailable.');
  let deviceId=rucaSpotifyGetDeviceId();
  if(deviceId) return deviceId;
  let bootError=null;
  try{
    await rucaSpotifyProofBoot();
  }catch(error){
    bootError=error;
  }
  deviceId=rucaSpotifyGetDeviceId();
  if(deviceId) return deviceId;
  if(bootError) throw bootError;
  throw new Error('RUCA OS playback device is not ready.');
}

async function runPlaybackIntent(label,operation,confirmation){
  rucaSpotifyActivateElement();
  setServiceState('DEMO // '+label,'Activating the RUCA OS device for the requested playback.');
  try{
    const deviceId=await resolveRucaPlaybackDevice();
    const result=await operation(deviceId);
    const confirmed=confirmation ? await refreshUntil(state=>confirmation(state,deviceId),result) : result;
    if(confirmation && !confirmed) throw new Error('Spotify did not confirm playback on the RUCA OS device.');
    if(confirmed) latestState=confirmed;
    ownershipVerified=Boolean(stateDevice()?.id===deviceId);
    render();
    return confirmed;
  }catch(error){
    console.error('[RUCA/Media Deck] '+label+' playback intent failed:',error);
    setServiceState(error?.code==='SPOTIFY_RATE_LIMITED' ? 'DEMO // RATE LIMITED' : 'DEMO // PLAYBACK UNAVAILABLE',error.message || 'Spotify did not activate the requested playback on RUCA OS.');
    return null;
  }
}

async function performPrevious(){
  const beforeTrack=currentTrackKey();
  const beforePosition=Number(latestState?.position)||0;
  if(currentTrack()?.type==='track' && beforePosition>3000 && !stateDisallows('seeking')){
    return runControl('RESTART TRACK','previous',()=>rucaSpotifySeek(0),state=>{
      const track=state?.track_window?.current_track;
      return Boolean((track?.id||track?.uri||'')===beforeTrack && (Number(state?.position)||0)<3000);
    });
  }
  const result=await runControl('PREVIOUS','previous',rucaSpotifyPrevious,state=>{
    const track=state?.track_window?.current_track;
    return Boolean((track?.id||track?.uri||'')!==beforeTrack || (Number(state?.position)||0)<Math.max(1000,beforePosition-1000));
  });
  if(result) refreshQueue(true);
  return result;
}

async function performNext(){
  const beforeTrack=currentTrackKey();
  const result=await runControl('NEXT','next',rucaSpotifyNext,state=>{
    const track=state?.track_window?.current_track;
    return Boolean(track && (track.id||track.uri||'')!==beforeTrack);
  });
  if(result) refreshQueue(true);
  return result;
}

function performPlayPause(){
  const shouldPlay=Boolean(latestState?.paused);
  if(shouldPlay && rucaSpotifyIsAuthed()){
    return runPlaybackIntent('PLAY',deviceId=>rucaSpotifyPlay(deviceId),(state,deviceId)=>Boolean(state?.device?.id===deviceId && state.paused===false));
  }
  return runControl(shouldPlay ? 'PLAY' : 'PAUSE','playPause',shouldPlay ? rucaSpotifyPlay : rucaSpotifyPause,state=>Boolean(state) && Boolean(state.paused)!==shouldPlay);
}

function performSeek(target){
  const duration=Number(currentTrack()?.duration_ms)||0;
  const bounded=Math.max(0,Math.min(duration||target,Math.round(Number(target)||0)));
  controllerSeekPreview=null;
  return runControl('SEEK','seek',()=>rucaSpotifySeek(bounded),state=>Math.abs((Number(state?.position)||0)-bounded)<3500);
}

function performVolume(target){
  const bounded=Math.max(0,Math.min(100,Math.round(Number(target)||0)));
  return runControl('VOLUME','volume',()=>rucaSpotifyVolume(bounded/100),state=>{
    const volume=Number(state?.device?.volume_percent ?? state?.device?.volumePercent ?? rucaSpotifyGetActiveDevice()?.volumePercent);
    return Number.isFinite(volume) && Math.abs(volume-bounded)<=2;
  }).then(result=>{
    if(result) nodes.volumeValue.textContent=bounded+'%';
    else render();
    return result;
  });
}

function performShuffle(){
  const target=!Boolean(latestState?.shuffle);
  return runControl(target ? 'SHUFFLE ON' : 'SHUFFLE OFF','shuffle',()=>rucaSpotifyShuffle(target),state=>Boolean(state) && Boolean(state.shuffle)===target);
}

function performRepeat(){
  const current=latestState?.repeat_mode || 'off';
  const next=REPEAT_SEQUENCE[(REPEAT_SEQUENCE.indexOf(current)+1)%REPEAT_SEQUENCE.length];
  return runControl('REPEAT '+next.toUpperCase(),'repeat',()=>rucaSpotifyRepeat(next),state=>Boolean(state) && state.repeat_mode===next);
}

function element(tag,className,text){
  const node=document.createElement(tag);
  if(className) node.className=className;
  if(text!==undefined) node.textContent=text;
  return node;
}

function emptyNode(node){
  while(node.firstChild) node.firstChild.remove();
}

function mediaEntity(raw){
  return raw?.item || raw?.track || raw || null;
}

function rowSubtitle(item,kind,meta){
  if(meta) return meta;
  if(kind==='track') return trackArtists(item)+' // '+durationLabel(item?.duration_ms);
  if(kind==='album') return (item?.artists ? trackArtists(item) : 'ALBUM')+' // '+(item?.release_date || 'DATE UNAVAILABLE');
  if(kind==='artist') return 'ARTIST // SAMPLE CATALOG';
  if(kind==='playlist'){
    const owner=item?.owner?.display_name || item?.owner?.id || 'OWNER UNAVAILABLE';
    const total=item?.items?.total ?? item?.tracks?.total;
    return owner+(Number.isFinite(Number(total)) ? ' // '+total+' ITEMS' : '');
  }
  return kind.toUpperCase();
}

function appendImage(parent,item,alt){
  const wrap=element('span','ruca-media-row-art');
  const url=mediaImage(item);
  if(url){
    const img=element('img');
    img.src=url;
    img.alt=alt || '';
    wrap.appendChild(img);
  }else{
    wrap.appendChild(element('span','ruca-media-row-art-fallback','RUCA'));
  }
  parent.appendChild(wrap);
}

function actionButton(label,action,item,extra={}){
  const button=element('button','ruca-media-row-action gamepad-focusable',label);
  button.type='button';
  button.dataset.mediaAction=action;
  if(item?.id) button.dataset.mediaId=item.id;
  if(item?.uri) button.dataset.mediaUri=item.uri;
  if(item?.type) button.dataset.mediaType=item.type;
  Object.entries(extra).forEach(([key,value])=>{button.dataset[key]=String(value);});
  return button;
}

function createMediaRow(item,index,{kind=item?.type||'track',meta='',actions=[],primaryAction='',contextUri='',offsetUri=''}={}){
  if(item?.id) entityStore.set('id:'+item.id,item);
  if(item?.uri) entityStore.set('uri:'+item.uri,item);
  const row=element('article','ruca-media-row gamepad-focusable');
  row.tabIndex=0;
  row.dataset.rucaMediaRow='true';
  row.dataset.mediaKind=kind;
  if(item?.id) row.dataset.mediaId=item.id;
  if(item?.uri) row.dataset.mediaUri=item.uri;
  if(primaryAction) row.dataset.mediaPrimaryAction=primaryAction;
  if(contextUri) row.dataset.mediaContextUri=contextUri;
  if(offsetUri) row.dataset.mediaOffsetUri=offsetUri;
  row.appendChild(element('span','ruca-media-row-index',String(index+1).padStart(2,'0')));
  appendImage(row,item,(item?.name || kind)+' artwork');
  const copy=element('span','ruca-media-row-copy');
  copy.appendChild(element('strong','',item?.name || 'UNTITLED SPOTIFY ITEM'));
  copy.appendChild(element('small','',rowSubtitle(item,kind,meta)));
  row.appendChild(copy);
  if(actions.length){
    const actionRail=element('span','ruca-media-row-actions');
    actions.forEach(action=>actionRail.appendChild(actionButton(action.label,action.action,item,action.extra||{})));
    row.appendChild(actionRail);
  }
  return row;
}

function setBrowseHeader(title,meta){
  nodes.browseTitle.textContent=title;
  nodes.browseMeta.textContent=meta || '';
}

function setBrowseBusy(title,meta){
  entityStore.clear();
  setBrowseHeader(title,meta);
  emptyNode(nodes.browseList);
  const state=element('p','ruca-media-browse-state',meta || 'REQUESTING VERIFIED SPOTIFY STATE');
  state.setAttribute('role','status');
  nodes.browseList.appendChild(state);
}

function setBrowseError(title,error){
  setBrowseHeader(title,'SERVICE RESPONSE UNAVAILABLE');
  emptyNode(nodes.browseList);
  nodes.browseList.appendChild(element('p','ruca-media-browse-state is-error',error?.message || 'Spotify did not expose this surface.'));
  setServiceState('DEMO // SERVICE ERROR',error?.message || 'Spotify did not expose this surface.');
}

function setBrowseEmpty(title,meta){
  setBrowseHeader(title,meta);
  emptyNode(nodes.browseList);
  nodes.browseList.appendChild(element('p','ruca-media-browse-state','NO ACCOUNT ITEMS RETURNED'));
}

function setSurfaceVisibility(view){
  const now=view==='now-playing';
  nodes.nowSurface.hidden=!now;
  nodes.browseSurface.hidden=now;
  nodes.searchForm.hidden=view!=='search';
  deck.querySelectorAll('[data-ruca-media-view]').forEach(button=>{
    const service=serviceViewFor(view);
    const active=button.dataset.rucaMediaView===service;
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-current',active ? 'page' : 'false');
  });
}

function serviceViewFor(view){
  if(view==='playlist-detail') return 'playlists';
  if(view==='album-detail' || view==='artist-detail') return route.data?.parentView || 'search';
  return view;
}

function renderSearchCategories(){
  emptyNode(nodes.searchCategories);
  SEARCH_TYPES.forEach(type=>{
    const button=element('button','ruca-media-search-category gamepad-focusable',type.toUpperCase());
    button.type='button';
    button.dataset.mediaAction='toggle-search-type';
    button.dataset.searchType=type;
    button.classList.toggle('is-active',searchTypes.has(type));
    button.setAttribute('aria-pressed',searchTypes.has(type) ? 'true' : 'false');
    nodes.searchCategories.appendChild(button);
  });
}

function filteredRucaItems(items){
  const visible=[];
  let suppressed=0;
  items.forEach(item=>{
    const entity=mediaEntity(item);
    if(isDisliked(entity)) suppressed+=1;
    else visible.push(item);
  });
  return {visible,suppressed};
}

async function refreshCurrentSavedStatus(track){
  const generation=++savedCheckGeneration;
  const uri=trackPreferenceKey(track);
  currentTrackSaved=null;
  renderTrackActions(track);
  if(!uri || !rucaSpotifyIsAuthed()) return;
  try{
    const states=await rucaSpotifyCheckSavedItems([uri]);
    if(generation!==savedCheckGeneration || currentTrackKey()!==(track.id||track.uri||'')) return;
    currentTrackSaved=Boolean(states?.[0]);
    renderTrackActions(track);
  }catch(error){
    if(generation!==savedCheckGeneration) return;
    currentTrackSaved=null;
    renderTrackActions(track);
    setAuxiliaryState('LIBRARY STATUS UNAVAILABLE',error);
  }
}

async function toggleSaved(item,button=null){
  const uri=trackPreferenceKey(item);
  if(!uri) return false;
  try{
    const states=await rucaSpotifyCheckSavedItems([uri]);
    const currentlySaved=Boolean(states?.[0]);
    if(currentlySaved) await rucaSpotifyRemoveItems([uri]);
    else await rucaSpotifySaveItems([uri]);
    const verified=Boolean((await rucaSpotifyCheckSavedItems([uri]))?.[0]);
    if(verified===currentlySaved) throw new Error('Spotify did not confirm the requested library change.');
    if(currentTrackKey()===(item.id||item.uri||'')) currentTrackSaved=verified;
    if(button){
      button.classList.toggle('is-active',verified);
      button.textContent=verified ? 'LIKED' : 'LIKE';
    }
    renderTrackActions(currentTrack());
    setServiceState(verified ? 'DEMO // SAVED' : 'DEMO // REMOVED','Spotify library state verified for '+(item.name || 'the selected track')+'.');
    return verified;
  }catch(error){
    setServiceState('DEMO // LIBRARY ERROR',error.message || 'Spotify did not confirm the library action.');
    return false;
  }
}

async function refreshQueue(force=false){
  if(!rucaSpotifyIsAuthed()) return null;
  if(queueInFlight) return queueInFlight;
  if(!force && Date.now()-queueLastRefresh<RUCA_QUEUE_REFRESH_MS) return queueTracks;
  queueInFlight=(async()=>{
    try{
      const payload=await rucaSpotifyGetQueue();
      queueTracks=(payload?.queue || []).filter(Boolean).slice(0,5);
      queueLastRefresh=Date.now();
      renderQueue();
      return queueTracks;
    }catch(error){
      emptyNode(nodes.queueList);
      nodes.queueList.appendChild(element('p','ruca-media-queue-state','QUEUE UNAVAILABLE // '+(error.message || 'Spotify did not expose queue state.')));
      return null;
    }finally{
      queueInFlight=null;
    }
  })();
  return queueInFlight;
}

function renderQueue(){
  emptyNode(nodes.queueList);
  if(!queueTracks.length){
    nodes.queueList.appendChild(element('p','ruca-media-queue-state','QUEUE // EMPTY OR NO ACTIVE PLAYBACK'));
    return;
  }
  queueTracks.forEach((track,index)=>{
    const row=createMediaRow(track,index,{
      kind:'track',
      primaryAction:'play-track',
      actions:index===0 ? [{label:'PLAY NOW',action:'play-track'}] : []
    });
    row.classList.toggle('is-immediate',index===0);
    nodes.queueList.appendChild(row);
  });
}

function appendSection(title,items,renderer){
  if(!items.length) return;
  const section=element('section','ruca-media-browse-section');
  section.appendChild(element('h4','',title));
  const list=element('div','ruca-media-browse-section-list');
  items.forEach((item,index)=>list.appendChild(renderer(item,index)));
  section.appendChild(list);
  nodes.browseList.appendChild(section);
}

function searchRow(item,index,kind){
  if(kind==='track'){
    return createMediaRow(item,index,{
      kind,
      primaryAction:'play-track',
      actions:[
        {label:'PLAY NOW',action:'play-track'},
        {label:'ADD QUEUE',action:'add-queue'},
        {label:'LIKE',action:'toggle-like'},
        {label:'ALBUM',action:'open-album',extra:{mediaParentView:'search'}},
        {label:'ARTIST',action:'open-artist',extra:{mediaParentView:'search'}}
      ]
    });
  }
  if(kind==='album'){
    return createMediaRow(item,index,{
      kind,
      primaryAction:'open-album',
      actions:[
        {label:'OPEN',action:'open-album',extra:{mediaParentView:'search'}},
        {label:'PLAY',action:'play-context'}
      ]
    });
  }
  if(kind==='artist'){
    return createMediaRow(item,index,{
      kind,
      primaryAction:'open-artist',
      actions:[{label:'OPEN ARTIST',action:'open-artist',extra:{mediaParentView:'search'}}]
    });
  }
  return createMediaRow(item,index,{
    kind:'playlist',
    primaryAction:'open-playlist',
    actions:[
      {label:'OPEN',action:'open-playlist'},
      {label:'PLAY',action:'play-context'}
    ]
  });
}

async function runSearch(){
  const query=nodes.searchInput.value.trim();
  const generation=++searchGeneration;
  if(query.length<2){
    setBrowseHeader('SEARCH // SAMPLE CATALOG','TRACKS // ARTISTS // ALBUMS // PLAYLISTS');
    emptyNode(nodes.browseList);
    nodes.browseList.appendChild(element('p','ruca-media-browse-state','TYPE TWO OR MORE CHARACTERS TO SEARCH THE SAMPLE COLLECTION'));
    return;
  }
  const types=[...searchTypes];
  if(!types.length) return;
  setBrowseBusy('SEARCH // '+query.toUpperCase(),'REQUESTING '+types.map(type=>type.toUpperCase()).join(' // '));
  try{
    const payload=await rucaSpotifySearch(query,{types,limit:8});
    if(generation!==searchGeneration) return;
    setBrowseHeader('SEARCH // '+query.toUpperCase(),'FICTIONAL SAMPLE CATALOG RESULTS');
    emptyNode(nodes.browseList);
    appendSection('TRACKS',(payload?.tracks?.items || []).filter(Boolean), (item,index)=>searchRow(item,index,'track'));
    appendSection('ARTISTS',(payload?.artists?.items || []).filter(Boolean), (item,index)=>searchRow(item,index,'artist'));
    appendSection('ALBUMS',(payload?.albums?.items || []).filter(Boolean), (item,index)=>searchRow(item,index,'album'));
    appendSection('PLAYLISTS',(payload?.playlists?.items || []).filter(Boolean), (item,index)=>searchRow(item,index,'playlist'));
    if(!nodes.browseList.children.length) nodes.browseList.appendChild(element('p','ruca-media-browse-state','NO CATALOG RESULTS RETURNED'));
  }catch(error){
    if(generation===searchGeneration) setBrowseError('SEARCH // SAMPLE CATALOG',error);
  }
}

function renderYourMusic(){
  entityStore.clear();
  setBrowseHeader('YOUR MUSIC','FICTIONAL DEMONSTRATION COLLECTION');
  emptyNode(nodes.browseList);
  const surfaces=[
    {view:'playlists',title:'PLAYLISTS',meta:'SAMPLE PLAYLISTS'},
    {view:'saved-music',title:'SAVED MUSIC',meta:'TRACKS SAVED WITHIN THIS DEMO'},
    {view:'recently-played',title:'RECENTLY PLAYED',meta:'SAMPLE PLAYBACK HISTORY'}
  ];
  surfaces.forEach((surface,index)=>{
    const item={id:surface.view,uri:'',type:'surface',name:surface.title};
    const row=createMediaRow(item,index,{kind:'surface',meta:surface.meta,primaryAction:'open-view'});
    row.dataset.mediaViewTarget=surface.view;
    nodes.browseList.appendChild(row);
  });
}

async function loadPlaylists(){
  setBrowseBusy('PLAYLISTS','REQUESTING CURRENT USER PLAYLISTS');
  try{
    const payload=await rucaSpotifyGetCurrentUserPlaylists({limit:30,offset:0});
    const items=(payload?.items || []).filter(Boolean);
    if(!items.length){setBrowseEmpty('PLAYLISTS','NO OWNED OR FOLLOWED PLAYLISTS RETURNED');return;}
    setBrowseHeader('PLAYLISTS',items.length+' OF '+(payload.total ?? items.length)+' SAMPLE PLAYLISTS');
    emptyNode(nodes.browseList);
    items.forEach((playlist,index)=>nodes.browseList.appendChild(createMediaRow(playlist,index,{
      kind:'playlist',
      primaryAction:'open-playlist',
      actions:[
        {label:'OPEN',action:'open-playlist'},
        {label:'PLAY',action:'play-context'}
      ]
    })));
  }catch(error){
    setBrowseError('PLAYLISTS',error);
  }
}

async function openPlaylist(id,parentView='playlists'){
  if(!id) return;
  setBrowseBusy('PLAYLIST DETAIL','REQUESTING VERIFIED PLAYLIST ITEMS');
  try{
    const [playlist,itemsPayload]=await Promise.all([
      rucaSpotifyGetPlaylist(id),
      rucaSpotifyGetPlaylistItems(id,{limit:50,offset:0,all:true})
    ]);
    const tracks=(itemsPayload?.items || []).map(mediaEntity).filter(Boolean);
    const owner=playlist?.owner?.display_name || playlist?.owner?.id || 'OWNER UNAVAILABLE';
    setBrowseHeader(playlist?.name || 'PLAYLIST DETAIL',owner+' // '+(itemsPayload?.total ?? tracks.length)+' ITEMS');
    emptyNode(nodes.browseList);
    if(!tracks.length){
      nodes.browseList.appendChild(element('p','ruca-media-browse-state','PLAYLIST CONTAINS NO AVAILABLE TRACK ITEMS'));
      return;
    }
    tracks.forEach((track,index)=>nodes.browseList.appendChild(createMediaRow(track,index,{
      kind:'track',
      primaryAction:'play-track',
      contextUri:playlist?.uri || `spotify:playlist:${id}`,
      offsetUri:track?.uri || '',
      actions:[
        {label:'PLAY',action:'play-track'},
        {label:'QUEUE',action:'add-queue'},
        {label:'LIKE',action:'toggle-like'},
        {label:'ALBUM',action:'open-album',extra:{mediaParentView:'playlist-detail'}},
        {label:'ARTIST',action:'open-artist',extra:{mediaParentView:'playlist-detail'}}
      ]
    })));
    route.data={id,parentView,playlist};
  }catch(error){
    setBrowseError('PLAYLIST DETAIL',error);
  }
}

async function loadRecent(){
  setBrowseBusy('RECENTLY PLAYED','LOADING SAMPLE HISTORY');
  try{
    const payload=await rucaSpotifyGetRecentlyPlayed({limit:30});
    const result=filteredRucaItems((payload?.items || []).filter(Boolean));
    if(!result.visible.length){setBrowseEmpty('RECENTLY PLAYED',result.suppressed ? result.suppressed+' ITEMS LOCALLY SUPPRESSED BY RUCA' : 'NO HISTORY RETURNED');return;}
    setBrowseHeader('RECENTLY PLAYED',result.visible.length+' TRACKS // '+result.suppressed+' LOCALLY SUPPRESSED');
    emptyNode(nodes.browseList);
    result.visible.forEach((entry,index)=>{
      const track=mediaEntity(entry);
      const playedAt=entry?.played_at ? new Date(entry.played_at).toLocaleString() : '';
      nodes.browseList.appendChild(createMediaRow(track,index,{
        kind:'track',
        meta:trackArtists(track)+(playedAt ? ' // '+playedAt : ''),
        primaryAction:'play-track',
        actions:[
          {label:'PLAY',action:'play-track'},
          {label:'QUEUE',action:'add-queue'},
          {label:'LIKE',action:'toggle-like'}
        ]
      }));
    });
  }catch(error){
    setBrowseError('RECENTLY PLAYED',error);
  }
}

async function loadSaved(){
  setBrowseBusy('SAVED MUSIC','REQUESTING SPOTIFY LIBRARY STATE');
  try{
    const payload=await rucaSpotifyGetSavedTracks({limit:30,offset:0});
    const result=filteredRucaItems((payload?.items || []).filter(Boolean));
    if(!result.visible.length){setBrowseEmpty('SAVED MUSIC',result.suppressed ? result.suppressed+' ITEMS LOCALLY SUPPRESSED BY RUCA' : 'NO SAVED TRACKS RETURNED');return;}
    setBrowseHeader('SAVED MUSIC',result.visible.length+' OF '+(payload.total ?? result.visible.length)+' SAVED TRACKS // '+result.suppressed+' SUPPRESSED');
    emptyNode(nodes.browseList);
    result.visible.forEach((entry,index)=>{
      const track=mediaEntity(entry);
      nodes.browseList.appendChild(createMediaRow(track,index,{
        kind:'track',
        primaryAction:'play-track',
        actions:[
          {label:'PLAY',action:'play-track'},
          {label:'QUEUE',action:'add-queue'},
          {label:'REMOVE',action:'toggle-like'}
        ]
      }));
    });
  }catch(error){
    setBrowseError('SAVED MUSIC',error);
  }
}

async function loadDevices(){
  setBrowseBusy('DEVICES','REQUESTING SIMULATED OUTPUTS');
  try{
    const payload=await rucaSpotifyFetchDevices();
    latestDevices=(payload?.devices || []).filter(Boolean);
    if(!latestDevices.length){setBrowseEmpty('DEVICES','NO SPOTIFY CONNECT DEVICES RETURNED');return;}
    const rucaDeviceId=rucaSpotifyGetDeviceId();
    setBrowseHeader('DEVICES',latestDevices.length+' SIMULATED OUTPUTS');
    emptyNode(nodes.browseList);
    latestDevices.forEach((device,index)=>{
      const item={
        id:device.id,
        uri:'',
        type:'device',
        name:device.name || 'UNKNOWN DEVICE',
        images:[]
      };
      let role='SIMULATED OUTPUT';
      if(device.id===rucaDeviceId) role='RUCA PLAYBACK DEVICE';
      else if(device.type==='Computer') role='SYSTEM COMPUTER OUTPUT';
      if(device.is_active) role+=' // ACTIVE';
      const row=createMediaRow(item,index,{
        kind:'device',
        meta:role+' // '+(device.type || 'UNKNOWN TYPE')+' // '+(device.volume_percent ?? '--')+'%',
        primaryAction:'transfer-device',
        actions:[{label:device.is_active ? 'ACTIVE' : 'TRANSFER',action:'transfer-device'}]
      });
      row.dataset.mediaDeviceId=device.id || '';
      row.classList.toggle('is-active-device',Boolean(device.is_active));
      nodes.browseList.appendChild(row);
    });
  }catch(error){
    setBrowseError('DEVICES',error);
  }
}

async function openAlbum(id,parentView='search'){
  if(!id) return;
  setBrowseBusy('ALBUM DETAIL','REQUESTING SPOTIFY ALBUM TRACKS');
  try{
    const album=await rucaSpotifyGetAlbum(id);
    const tracks=(album?.tracks?.items || album?.items || []).filter(Boolean).map(track=>({...track,album:{id:album.id,name:album.name,images:album.images,external_urls:album.external_urls}}));
    setBrowseHeader(album?.name || 'ALBUM DETAIL',trackArtists(album)+' // '+(album?.release_date || 'DATE UNAVAILABLE')+' // '+tracks.length+' TRACKS');
    emptyNode(nodes.browseList);
    if(!tracks.length){
      nodes.browseList.appendChild(element('p','ruca-media-browse-state','NO AVAILABLE ALBUM TRACKS RETURNED'));
      return;
    }
    tracks.forEach((track,index)=>nodes.browseList.appendChild(createMediaRow(track,index,{
      kind:'track',
      primaryAction:'play-track',
      contextUri:album?.uri || `spotify:album:${id}`,
      offsetUri:track?.uri || '',
      actions:[
        {label:'PLAY',action:'play-track'},
        {label:'QUEUE',action:'add-queue'},
        {label:'LIKE',action:'toggle-like'}
      ]
    })));
    route.data={id,parentView,album};
  }catch(error){
    setBrowseError('ALBUM DETAIL',error);
  }
}

async function openArtist(id,parentView='search'){
  if(!id) return;
  setBrowseBusy('ARTIST DETAIL','REQUESTING SPOTIFY ARTIST MUSIC');
  try{
    const [artist,albumsPayload]=await Promise.all([
      rucaSpotifyGetArtist(id),
      rucaSpotifyGetArtistAlbums(id,{limit:50,offset:0,all:true})
    ]);
    const albums=(albumsPayload?.items || []).filter(Boolean);
    setBrowseHeader(artist?.name || 'ARTIST DETAIL',albums.length+' AVAILABLE RELEASES');
    emptyNode(nodes.browseList);
    if(!albums.length){
      nodes.browseList.appendChild(element('p','ruca-media-browse-state','NO AVAILABLE ARTIST RELEASES RETURNED'));
      return;
    }
    albums.forEach((album,index)=>nodes.browseList.appendChild(createMediaRow(album,index,{
      kind:'album',
      primaryAction:'open-album',
      actions:[
        {label:'OPEN',action:'open-album',extra:{mediaParentView:'artist-detail'}},
        {label:'PLAY',action:'play-context'}
      ]
    })));
    route.data={id,parentView,artist};
  }catch(error){
    setBrowseError('ARTIST DETAIL',error);
  }
}

async function renderRoute(){
  const view=route.view;
  setSurfaceVisibility(view);
  if(view==='now-playing'){
    render();
    refreshQueue();
    return;
  }
  if(view==='search'){
    renderSearchCategories();
    await runSearch();
    return;
  }
  if(view==='your-music'){renderYourMusic();return;}
  if(view==='playlists'){await loadPlaylists();return;}
  if(view==='playlist-detail'){await openPlaylist(route.data?.id,route.data?.parentView);return;}
  if(view==='recently-played'){await loadRecent();return;}
  if(view==='saved-music'){await loadSaved();return;}
  if(view==='devices'){await loadDevices();return;}
  if(view==='album-detail'){await openAlbum(route.data?.id,route.data?.parentView);return;}
  if(view==='artist-detail'){await openArtist(route.data?.id,route.data?.parentView);return;}
}

async function navigate(view,data=null,{push=true,focus=false}={}){
  if(push && (route.view!==view || JSON.stringify(route.data)!==JSON.stringify(data))) routeHistory.push({...route});
  route={view,data};
  await renderRoute();
  if(focus){
    window.setTimeout(()=>{
      const target=view==='search' ? nodes.searchInput : nodes.browseList.querySelector('.ruca-media-row, button, input');
      target?.focus();
    },0);
  }
}

async function goBack(){
  if(routeHistory.length){
    route=routeHistory.pop();
    await renderRoute();
    return true;
  }
  if(route.view!=='now-playing'){
    route={view:'now-playing',data:null};
    await renderRoute();
    return true;
  }
  return false;
}

function entityFromAction(target){
  const row=target.closest('.ruca-media-row');
  const id=target.dataset.mediaId || row?.dataset.mediaId || '';
  const uri=target.dataset.mediaUri || row?.dataset.mediaUri || '';
  const kind=target.dataset.mediaType || row?.dataset.mediaKind || 'track';
  const contextUri=target.dataset.mediaContextUri || row?.dataset.mediaContextUri || '';
  const offsetUri=target.dataset.mediaOffsetUri || row?.dataset.mediaOffsetUri || '';
  return {row,id,uri,kind,contextUri,offsetUri};
}

function findEntity(uri,id){
  const stored=(uri && entityStore.get('uri:'+uri)) || (id && entityStore.get('id:'+id));
  if(stored) return stored;
  const candidates=[currentTrack(),...queueTracks];
  const found=candidates.find(item=>item && ((uri && item.uri===uri) || (id && item.id===id)));
  if(found) return found;
  return {id,uri,type:uri ? uri.split(':')[1] : 'track',name:'SELECTED SPOTIFY ITEM',artists:[]};
}

async function handleMediaAction(target){
  const action=target.dataset.mediaAction;
  const entity=entityFromAction(target);
  const item=findEntity(entity.uri,entity.id);
  if(action==='toggle-search-type'){
    const type=target.dataset.searchType;
    if(searchTypes.has(type) && searchTypes.size>1) searchTypes.delete(type);
    else searchTypes.add(type);
    renderSearchCategories();
    runSearch();
    return;
  }
  if(action==='open-view'){
    const view=target.dataset.mediaViewTarget || entity.row?.dataset.mediaViewTarget;
    if(view) await navigate(view,null,{push:true,focus:true});
    return;
  }
  if(action==='play-track'){
    if(!entity.uri) return;
    const contextual=Boolean(entity.contextUri && entity.offsetUri);
    await runPlaybackIntent('PLAY NOW',deviceId=>contextual
      ? rucaSpotifyPlayUris([],entity.contextUri,deviceId,entity.offsetUri)
      : rucaSpotifyPlayUris([entity.uri],'',deviceId),(state,deviceId)=>Boolean(
        state?.device?.id===deviceId &&
        state?.track_window?.current_track?.uri===entity.uri &&
        (!contextual || state?.context?.uri===entity.contextUri)
      ));
    refreshQueue(true);
    return;
  }
  if(action==='add-queue'){
    if(!entity.uri) return;
    try{
      await rucaSpotifyAddToQueue(entity.uri);
      setServiceState('DEMO // QUEUED','Added '+(item.name || 'the selected track')+' to the active Spotify queue.');
      await refreshQueue(true);
    }catch(error){
      setServiceState('DEMO // QUEUE ERROR',error.message || 'Spotify did not confirm the queue action.');
    }
    return;
  }
  if(action==='toggle-like'){
    await toggleSaved(item,target);
    return;
  }
  if(action==='open-playlist'){
    await navigate('playlist-detail',{id:entity.id,parentView:serviceViewFor(route.view)},{push:true,focus:true});
    return;
  }
  if(action==='open-album'){
    let id=entity.id;
    if(entity.kind==='track') id=item?.album?.id || target.dataset.mediaAlbumId || '';
    const parentView=target.dataset.mediaParentView || route.view;
    await navigate('album-detail',{id,parentView},{push:true,focus:true});
    return;
  }
  if(action==='open-artist'){
    let id=entity.id;
    if(entity.kind==='track') id=item?.artists?.[0]?.id || target.dataset.mediaArtistId || '';
    const parentView=target.dataset.mediaParentView || route.view;
    await navigate('artist-detail',{id,parentView},{push:true,focus:true});
    return;
  }
  if(action==='play-context'){
    if(!entity.uri) return;
    await runPlaybackIntent('PLAY CONTEXT',deviceId=>rucaSpotifyPlayUris([],entity.uri,deviceId),(state,deviceId)=>Boolean(state?.device?.id===deviceId && state?.context?.uri===entity.uri));
    refreshQueue(true);
    return;
  }
  if(action==='transfer-device'){
    const deviceId=target.dataset.mediaDeviceId || entity.row?.dataset.mediaDeviceId || entity.id;
    if(!deviceId) return;
    try{
      const ownership=await rucaSpotifyTransferToDevice(deviceId,true);
      ownershipVerified=Boolean(ownership?.verified && deviceId===rucaSpotifyGetDeviceId());
      setServiceState('DEMO // DEVICE TRANSFERRED','Active playback output verified on '+(ownership?.activeDevice?.name || deviceId)+'.');
      await loadDevices();
      render();
    }catch(error){
      setServiceState('DEMO // DEVICE ERROR',error.message || 'Spotify did not confirm the selected playback device.');
    }
  }
}

function setDeckActive(active){
  deck.hidden=!active;
  playPage.dataset.mediaDeckActive=active ? 'true' : 'false';
  if(!active) return;
  sessionStorage.setItem('ruca_play_filter','media-district');
  if(rucaSpotifyIsAuthed()){
    if(!latestState) setIdle('SPOTIFY AUTHENTICATED','Synchronizing the active Spotify playback state.','DEMO // SYNCING');
    rucaSpotifySyncNow(true).then(state=>{
      if(state){
        latestState=state;
        render();
        refreshQueue(true);
      }
    });
  }else{
    setIdle('SERVICE AWAITS AUTHENTICATION','Select CONNECT SPOTIFY to begin verified service authentication.');
  }
  render();
}

async function connectSpotify(){
  rucaSpotifyActivateElement();
  if(booting) return;
  booting=true;
  syncConnectControl();
  setServiceState('DEMO // CONNECTING','RUCA is requesting authentication, device creation, transfer, and ownership verification.');
  try{
    const boot=await rucaSpotifyProofBoot();
    if(!rucaSpotifyIsAuthed()) return;
    let ownership=boot?.ownership || null;
    const active=rucaSpotifyGetActiveDevice();
    if(!ownership?.verified || !active?.id || active.id!==rucaSpotifyGetDeviceId()) ownership=await rucaSpotifyProofTransfer();
    ownershipVerified=Boolean(ownership?.verified);
    if(!ownershipVerified) throw new Error('Spotify did not verify RUCA OS as the active playback device.');
    const state=await rucaSpotifySyncNow(true);
    if(state) latestState=state;
    setServiceState('DEMO // DEMO PLAYER READY','Playback ownership is verified on RUCA OS.');
    refreshCurrentSavedStatus(currentTrack());
    refreshQueue(true);
  }catch(error){
    ownershipVerified=false;
    setServiceState('DEMO // CONNECTION ERROR',error.message || 'The service did not confirm usable playback ownership.');
  }finally{
    booting=false;
    render();
  }
}

function controllerSeekStep(heldMs){
  const held=Math.max(0,Number(heldMs)||0);
  if(held>=2600) return 30000;
  if(held>=1500) return 15000;
  if(held>=700) return 10000;
  return 5000;
}

function commitControllerSeek(){
  if(controllerSeekPreview===null) return Promise.resolve(null);
  const target=controllerSeekPreview;
  controllerSeekPreview=null;
  return performSeek(target);
}

function previewControllerSeek(direction,heldMs){
  if(!controlCapabilities().seek) return false;
  const duration=Number(currentTrack()?.duration_ms)||0;
  const current=controllerSeekPreview===null ? Number(latestState?.position)||0 : controllerSeekPreview;
  const delta=controllerSeekStep(heldMs)*(direction==='left' ? -1 : 1);
  controllerSeekPreview=Math.max(0,Math.min(duration||current+delta,current+delta));
  render();
  return true;
}

function focusMediaRow(direction){
  const scope=document.activeElement?.closest('#rucaMediaBrowseList, #rucaMediaQueueList');
  if(!scope) return false;
  const rows=[...scope.querySelectorAll('.ruca-media-row:not([hidden])')];
  if(!rows.length) return false;
  const activeRow=document.activeElement?.closest('.ruca-media-row');
  let index=Math.max(0,rows.indexOf(activeRow));
  index=Math.max(0,Math.min(rows.length-1,index+(direction==='down' ? 1 : -1)));
  rows[index].focus({preventScroll:true});
  rows[index].scrollIntoView({block:'nearest',behavior:'smooth'});
  return true;
}

function activateFocusedMediaElement(){
  const active=document.activeElement;
  if(active===nodes.seek){
    commitControllerSeek();
    return true;
  }
  if(active?.matches?.('button,a,input:not([type="range"]),select,textarea,summary')){
    active.click();
    return true;
  }
  const row=active?.closest('.ruca-media-row');
  if(row){
    const action=row.dataset.mediaPrimaryAction;
    if(!action) return false;
    const target=row.querySelector('[data-media-action="'+action+'"]');
    if(target) target.click();
    else{
      const proxy=element('button');
      proxy.dataset.mediaAction=action;
      if(row.dataset.mediaId) proxy.dataset.mediaId=row.dataset.mediaId;
      if(row.dataset.mediaUri) proxy.dataset.mediaUri=row.dataset.mediaUri;
      if(row.dataset.mediaViewTarget) proxy.dataset.mediaViewTarget=row.dataset.mediaViewTarget;
      row.appendChild(proxy);
      proxy.click();
      proxy.remove();
    }
    return true;
  }
  return false;
}

function controllerHandleDirection(direction,context={}){
  if(!controllerIsActive()) return false;
  if((direction==='left' || direction==='right') && document.activeElement===nodes.seek){
    return previewControllerSeek(direction,context.heldMs);
  }
  if(direction==='up' || direction==='down') return focusMediaRow(direction);
  return false;
}

function controllerHandleButton(button){
  if(!controllerIsActive()) return false;
  const normalized=String(button||'').toUpperCase();
  if(normalized==='LB'){if(nodes.previous.disabled) return false;performPrevious();return true;}
  if(normalized==='RB'){if(nodes.next.disabled) return false;performNext();return true;}
  if(normalized==='Y'){
    routeHistory=[];
    navigate('search',null,{push:false,focus:true});
    return true;
  }
  if(normalized==='B'){
    if(document.activeElement===nodes.seek){
      controllerSeekPreview=null;
      render();
      nodes.playPause.focus();
      return true;
    }
    if(route.view!=='now-playing' || routeHistory.length){
      goBack();
      return true;
    }
    return false;
  }
  if(normalized==='A') return activateFocusedMediaElement();
  return false;
}

function controllerIsActive(){
  return !deck.hidden && playPage.classList.contains('active');
}

nodes.art.addEventListener('load',()=>nodes.art.classList.add('is-loaded'));
nodes.art.addEventListener('error',()=>renderArtwork(null));
nodes.connect.addEventListener('click',connectSpotify);
nodes.previous.addEventListener('click',performPrevious);
nodes.next.addEventListener('click',performNext);
nodes.playPause.addEventListener('click',performPlayPause);
nodes.shuffle.addEventListener('click',performShuffle);
nodes.repeat.addEventListener('click',performRepeat);
nodes.like.addEventListener('click',()=>{const track=currentTrack();if(track) toggleSaved(track,nodes.like);});
nodes.dislike.addEventListener('click',()=>{
  const track=currentTrack();
  if(!track) return;
  const disliked=setDisliked(track,!isDisliked(track));
  renderTrackActions(track);
  setServiceState(disliked ? 'RUCA // TRACK SUPPRESSED' : 'RUCA // SUPPRESSION REMOVED',(track.name || 'Track')+' preference stored by RUCA only; no Spotify dislike state was claimed.');
});
nodes.seek.addEventListener('input',()=>{
  controllerSeekPreview=Number(nodes.seek.value)||0;
  nodes.elapsed.textContent=durationLabel(controllerSeekPreview);
  updateRangeProgress(nodes.seek);
});
nodes.seek.addEventListener('change',()=>{
  const target=Number(nodes.seek.value)||0;
  controllerSeekPreview=null;
  performSeek(target);
});
nodes.volume.addEventListener('input',()=>{
  nodes.volumeValue.textContent=Math.round(Number(nodes.volume.value)||0)+'%';
  updateRangeProgress(nodes.volume);
});
nodes.volume.addEventListener('change',()=>performVolume(nodes.volume.value));
nodes.searchForm.addEventListener('submit',event=>{
  event.preventDefault();
  window.clearTimeout(searchTimer);
  runSearch();
});
nodes.searchInput.addEventListener('input',()=>{
  window.clearTimeout(searchTimer);
  searchTimer=window.setTimeout(runSearch,320);
});
deck.addEventListener('click',event=>{
  const service=event.target.closest('[data-ruca-media-view]');
  if(service){
    routeHistory=[];
    navigate(service.dataset.rucaMediaView,null,{push:false,focus:service.dataset.rucaMediaView!=='now-playing'});
    return;
  }
  const action=event.target.closest('[data-media-action]');
  if(action) handleMediaAction(action);
});

window.addEventListener('ruca:spotify:state',event=>{
  latestState=event.detail || null;
  const track=currentTrack();
  const key=currentTrackKey();
  if(key!==lastTrackKey){
    lastTrackKey=key;
    controllerSeekPreview=null;
    refreshCurrentSavedStatus(track);
    refreshQueue(true);
    if(route.view==='devices') loadDevices();
  }else{
    refreshQueue(false);
  }
  render();
});
window.addEventListener('ruca:spotify:devices',event=>{
  latestDevices=event.detail?.devices || latestDevices;
  const active=event.detail?.activeDevice;
  const sdkOwnsCurrentState=latestState?.source==='web-playback-sdk' && latestState?.device?.id===event.detail?.rucaDeviceId;
  if(latestState && (active || !sdkOwnsCurrentState)) latestState={...latestState,device:active || null};
  ownershipVerified=Boolean(active?.id && active.id===event.detail?.rucaDeviceId);
  if(route.view==='devices') loadDevices();
  render();
});
window.addEventListener('ruca:spotify:device-ownership',event=>{
  ownershipVerified=Boolean(event.detail?.verified);
  setServiceState(ownershipVerified ? 'DEMO // DEMO PLAYER READY' : 'DEMO // OWNERSHIP UNVERIFIED',ownershipVerified ? 'Spotify confirmed RUCA OS as the active playback device.' : 'Spotify did not confirm RUCA OS as the active playback device.');
  render();
});
window.addEventListener('ruca:spotify:transfer',event=>{
  ownershipVerified=Boolean(event.detail?.verified);
  render();
});
window.addEventListener('ruca:spotify:device-ready',()=>{
  setServiceState('DEMO // DEVICE READY','RUCA OS is available; active playback ownership is being verified.');
  render();
});
window.addEventListener('ruca:spotify:device-offline',()=>{
  ownershipVerified=false;
  if(latestState) latestState={...latestState,device:null};
  setServiceState('DEMO // DEVICE OFFLINE','The RUCA playback device is not currently available.');
  render();
});
window.addEventListener('ruca:spotify:error',event=>{
  const type=event.detail?.type || '';
  if(['initialization_error','authentication_error','account_error','playback_error'].includes(type)){
    ownershipVerified=false;
    setServiceState('DEMO // SERVICE ERROR',event.detail?.message || 'The service returned an unverified error.');
    render();
  }else{
    setAuxiliaryState('SPOTIFY AUXILIARY ERROR',new Error(event.detail?.message || 'The service returned an auxiliary error.'));
  }
});
window.addEventListener('ruca:spotify:rate-limit',event=>{
  if(event.detail?.retryKnown===false){
    nodes.tickerDetail.textContent='Spotify service rate limited // Retry-After window unavailable to RUCA // automatic API requests suspended.';
    return;
  }
  const seconds=Math.max(1,Math.ceil((Number(event.detail?.retryAt)-Date.now())/1000));
  nodes.tickerDetail.textContent='Spotify service rate limited // retry after '+seconds+' seconds.';
});
window.addEventListener('ruca:spotify:sync-error',event=>{
  setServiceState('DEMO // SYNC DEGRADED',event.detail?.message || 'Playback state synchronization is temporarily unavailable.');
});
window.addEventListener('ruca:spotify:auth-error',event=>{
  setServiceState('DEMO // AUTH ERROR',event.detail?.message || event.detail?.error || 'Spotify authorization is unavailable.');
  render();
});
document.addEventListener('ruca:play-orbit-change',event=>setDeckActive(event.detail?.filter==='media-district'));

renderSearchCategories();
renderQueue();
render();

const restoreMediaDeck=sessionStorage.getItem('ruca_spotify_return_to')==='media-deck' || sessionStorage.getItem('ruca_play_filter')==='media-district';
if(restoreMediaDeck){
  sessionStorage.removeItem('ruca_spotify_return_to');
  window.RUCA_CORE_NAV?.route?.('play',{replace:true,instant:true,source:'spotify-return'});
  const restoreFilter=()=>window.RUCA_PLAY_COMMANDS?.filter?.('media-district');
  if(window.RUCA_PLAY_COMMANDS?.count>0) restoreFilter();
  else document.addEventListener('ruca:play-registry-ready',restoreFilter,{once:true});
}

window.RUCA_MEDIA_DECK_CONTROLLER=Object.freeze({
  owner:'RUCA_MEDIA_DECK_CONTROLLER_ADAPTER',
  isActive:controllerIsActive,
  handleDirection:controllerHandleDirection,
  handleButton:controllerHandleButton
});

window.RUCA_MEDIA_DECK=Object.freeze({
  owner:'RUCA_MEDIA_DECK',
  spotifyOwner:'RUCA_SPOTIFY_PLAYER',
  preferenceOwner:'RUCA_MEDIA_PREFERENCES',
  open:()=>setDeckActive(true),
  close:()=>setDeckActive(false),
  sync:()=>rucaSpotifySyncNow(true),
  navigate:(view,data)=>navigate(view,data,{push:true,focus:true}),
  refreshQueue:()=>refreshQueue(true),
  get active(){return !deck.hidden;},
  get view(){return route.view;},
  get state(){return latestState;},
  get queue(){return queueTracks.slice();},
  get deviceOwnership(){return ownershipVerified;},
  get diagnostics(){
    return {
      owner:'RUCA_MEDIA_DECK',
      spotifyOwner:'RUCA_SPOTIFY_PLAYER',
      controllerOwner:'RUCA_PASS02B_LIVEWORLD_CONTROL',
      controllerAdapter:'RUCA_MEDIA_DECK_CONTROLLER_ADAPTER',
      preferenceOwner:'RUCA_MEDIA_PREFERENCES',
      active:!deck.hidden,
      view:route.view,
      queueCount:queueTracks.length,
      dislikedCount:Object.keys(preferences.disliked).length,
      savedCurrent:currentTrackSaved,
      rucaDeviceId:rucaSpotifyGetDeviceId() || '',
      activeDeviceId:stateDevice()?.id || '',
      ownershipVerified
    };
  }
});
