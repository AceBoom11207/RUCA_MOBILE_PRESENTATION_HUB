# RUCA OS September product demonstration

This standalone public demo preserves the desktop product's current HTML, visual hierarchy, mechanical instruments, animated environment, Command Districts, Media Deck, Diagnostics, and Control Workshop. Its presentation derives from source base `3ce2807` with the September 7–9 visual refinements, verified against the running desktop on September 10, 2026.

All sensor values, weather, music metadata, device state, and command results are illustrative. No user machine readings, private media account, credentials, filesystem paths, or location data are included. The demo does not launch applications, run hardware tests, stream music, or change operating-system settings. Theme adjustments affect this browser demonstration only.

## Entry points

- `#home`: six mechanical instruments and System Heart, with Everyday, Creative Load, and Sensor Unavailable scenarios.
- `#play`: 39 example commands in the existing district navigation.
- `#media`: the current Media Deck, with local sample playback controls, queue, search, playlists, saved music, and artist/album views.
- `#diagnostics`: sample sensor domains, evidence, and the existing Machine Health Timeline.
- `#live`: fixed illustrative weather; other information feeds explicitly unavailable.
- `#control`: browser-only appearance and interaction settings. External source credentials and location forms are omitted.

## Data boundary

`js/public-demo-data.js` handles all legacy request paths in memory. `fetch` does not make network requests. The page also declares `connect-src 'none'` and `form-action 'none'`. The Spotify-named modules are small local interface adapters for the retained Media Deck; they contain no Spotify SDK, OAuth flow, tokens, or API calls. All necessary scripts, styles, images, and cosmic transition media are served from this directory.

## Validation

Browser checks covered navigation, fresh `#home` and `#media` links, simulated play/pause and next track, sample catalog search, diagnostic rendering, missing-sensor behavior, Control sections, and reachable navigation/library controls at 390 CSS pixels. No console errors or warnings occurred in that run. Screenshots in `assets/evidence/` are captures of this running public demonstration at desktop size, not installed desktop telemetry evidence.

## Assets

RUCA visual code, logo, and cosmic media are carried from the RUCA project. `assets/demo-album.svg` is demonstration artwork with fictional music metadata. Babylon.js 9.19.0 is distributed under Apache 2.0; the original license is retained in `vendor/babylonjs-9.19.0/LICENSE.md`.
