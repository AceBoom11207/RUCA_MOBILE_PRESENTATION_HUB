/* Deterministic local Media Deck service. Fictional music metadata, no audio. */
const artist={id:'demo-artist',name:'RUCA Demo Collection',type:'artist',uri:'demo:artist:ruca',images:[{url:'assets/demo-album.svg'}]};
const album={id:'demo-album',name:'Cosmic Continuum',type:'album',uri:'demo:album:continuum',artists:[artist],images:[{url:'assets/demo-album.svg'}],release_date:'2026-09-10'};
const tracks=['Cosmic Continuum','Orbital Motion','Signal / Return','Night Current','Stellar Drift'].map((name,i)=>({id:'demo-track-'+i,name,type:'track',uri:'demo:track:'+i,duration_ms:210000+i*15000,artists:[artist],album}));
const playlist={id:'demo-playlist',name:'RUCA // After Hours',type:'playlist',uri:'demo:playlist:ruca',images:album.images,owner:{display_name:'Demonstration collection'},tracks:{total:tracks.length}};
const device={id:'demo-device',name:'RUCA Demo Player — no audio',type:'Computer',is_active:true,volume_percent:45};
let index=0,queue=tracks.slice(1),saved=new Set([tracks[0].uri]);
let state={paused:true,position:48000,shuffle:false,repeat_mode:'off',device,source:'public-demo',track_window:{current_track:tracks[0]},context:{uri:playlist.uri}};
const copy=()=>structuredClone(state);
function emit(){window.dispatchEvent(new CustomEvent('ruca:spotify:state',{detail:copy()}));return copy();}
function changeTrack(i){index=(i+tracks.length)%tracks.length;state.track_window.current_track=tracks[index];state.position=0;return emit();}
export const rucaSpotifyGetDeviceId=()=>device.id;
export const rucaSpotifyGetActiveDevice=()=>({...device});
export const rucaSpotifyIsRateLimited=()=>false;
export const rucaSpotifyGetRateLimitState=()=>({active:false,retryAfterMs:0});
export const rucaSpotifyActivateElement=()=>{};
export const rucaSpotifySyncNow=async()=>emit();
export const rucaSpotifyNext=async()=>changeTrack(index+1);
export const rucaSpotifyPrevious=async()=>changeTrack(index-1);
export const rucaSpotifyPause=async()=>{state.paused=true;return emit();};
export const rucaSpotifyPlay=async()=>{state.paused=false;window.RUCA_PUBLIC_DEMO.notice('Playback controls are simulated. No music is streamed.');return emit();};
export const rucaSpotifySeek=async position=>{state.position=Math.max(0,Math.min(state.track_window.current_track.duration_ms,Number(position)||0));return emit();};
export const rucaSpotifyVolume=async value=>{device.volume_percent=Number(value)||0;return emit();};
export const rucaSpotifyGetQueue=async()=>({currently_playing:state.track_window.current_track,queue:queue.slice()});
export const rucaSpotifyFetchDevices=async()=>({devices:[{...device}]});
export const rucaSpotifyGetCurrentUserPlaylists=async()=>({items:[playlist],total:1});
export const rucaSpotifyGetPlaylist=async()=>playlist;
export const rucaSpotifyGetPlaylistItems=async()=>({items:tracks.map(track=>({track})),total:tracks.length});
export const rucaSpotifyGetRecentlyPlayed=async()=>({items:tracks.slice(0,3).map(track=>({track,played_at:'2026-09-10T12:00:00Z'}))});
export const rucaSpotifyGetSavedTracks=async()=>({items:tracks.filter(t=>saved.has(t.uri)).map(track=>({track})),total:saved.size});
export const rucaSpotifyCheckSavedItems=async uris=>uris.map(uri=>saved.has(uri));
export const rucaSpotifySaveItems=async uris=>{uris.forEach(uri=>saved.add(uri));};
export const rucaSpotifyRemoveItems=async uris=>{uris.forEach(uri=>saved.delete(uri));};
export const rucaSpotifyAddToQueue=async uri=>{const track=tracks.find(t=>t.uri===uri);if(track)queue.push(track);return {ok:true};};
export const rucaSpotifyPlayUris=async(uris=[],contextUri,deviceId,offset)=>{let uri=typeof offset==='string'?offset:offset?.uri||uris[0];let next=tracks.findIndex(t=>t.uri===uri);state.paused=false;state.context={uri:contextUri||playlist.uri};return changeTrack(next<0?0:next);};
export const rucaSpotifyGetAlbum=async()=>({...album,tracks:{items:tracks}});
export const rucaSpotifyGetArtist=async()=>artist;
export const rucaSpotifyGetArtistAlbums=async()=>({items:[album]});
export const rucaSpotifyShuffle=async value=>{state.shuffle=Boolean(value);return emit();};
export const rucaSpotifyRepeat=async value=>{state.repeat_mode=value;return emit();};
export const rucaSpotifyTransferToDevice=async()=>({verified:true,activeDevice:{...device}});
export async function rucaSpotifySearch(query){const q=String(query).toLowerCase();return {tracks:{items:tracks.filter(t=>(t.name+' '+artist.name).toLowerCase().includes(q))},artists:{items:artist.name.toLowerCase().includes(q)?[artist]:[]},albums:{items:album.name.toLowerCase().includes(q)?[album]:[]},playlists:{items:playlist.name.toLowerCase().includes(q)?[playlist]:[]}};}
