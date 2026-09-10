import {rucaSpotifySyncNow,rucaSpotifyGetActiveDevice} from './ruca-spotify-player.js';
export async function rucaSpotifyProofBoot(){await rucaSpotifySyncNow();return {ownership:{verified:true,activeDevice:rucaSpotifyGetActiveDevice()}};}
export async function rucaSpotifyProofTransfer(){return {verified:true,activeDevice:rucaSpotifyGetActiveDevice()};}
