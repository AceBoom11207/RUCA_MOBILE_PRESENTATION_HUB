# RUCA OS Public Simulation

This repository serves the working public RUCA product simulation at:

- https://ruca-mobile-presentation-hub.vercel.app/
- https://ruca-mobile-presentation-hub.vercel.app/index.html#home

The root is a self-contained browser application, not a screenshot tour. Its shell and five world layouts mirror the current RUCA OS while using semantic HTML, CSS/SVG instrumentation, one JavaScript state owner, deterministic local fixtures, browser-only settings persistence, and no external data dependency.

## Five interactive worlds

- **HOME** — six animated gauges, visible energy conduits, a breathing System Heart, a responsive readiness score, and focusable signal detail.
- **PLAY** — the current nine-filter, 39-command district field with spatial nodes, selected-center ownership, and explicit safe handoff feedback. No command can execute.
- **LIVE WORLD** — Weather, News, Markets, Sports, Technology, and Celestial lanes. Each visibly changes the primary briefing and declares its local source state.
- **DIAGNOSTICS** — Mission Ready, Advisory, and Critical Example states with coordinated score, severity, sensor trace, Guardian explanation, first check, and next action.
- **CONTROL** — the current eight-profile workshop plus live glow, motion, density, glass, depth, brightness, and accent controls. Settings persist in the current browser and can be reset.

## Input model

- Mouse or pointer: select any visible control.
- Touch-sized controls: primary targets are 44px or larger at the tested mobile breakpoints.
- Arrow keys: move visible focus spatially.
- Enter or Space: activate the focused control.
- Escape: close About or return focus to the current world navigation control.
- Home: return to HOME.
- Q / E, [ / ], or Page Up / Page Down: cycle worlds.

Reduced-motion preferences remove looping motion while preserving the complete interface and state feedback.

## Public safety boundary

The root app has no telemetry reader, bridge client, native command path, private endpoint, credential access, filesystem API, device-control API, or external content/data request. Content Security Policy sets connect-src to none. All values, traces, stories, scores, commands, and environment states are deterministic local fixtures.

The real-product captures under assets/product remain available only as visual evidence inside the separate /portfolio/ case study. The root simulation does not load those files.

## Routes

- /
- /index.html
- /index.html#home
- /index.html#play
- /index.html#live-world
- /index.html#diagnostics
- /index.html#control
- /portfolio/
- /resume/Anthony_Moncion_Interaction_Designer_Public_Resume.pdf

## Architecture

- index.html — persistent semantic shell, navigation, status ribbon, footer, and boundary panel.
- assets/public-site.js — canonical application state, route rendering, deterministic fixtures, focus manager, control persistence, and service-worker registration.
- assets/ruca-public.css — current RUCA OS shell geometry, customizable theme tokens, gauges, conduits, spatial command environment, responsive layouts, and reduced-motion treatment.
- service-worker.js — versioned cache, full legacy-cache removal on activation, network-first HTML/CSS/JavaScript, and offline fallback.
- portfolio/ — separate recruiter case study and visual evidence.
- resume/ — public resume artifact.

## Local run

Serve the repository root with any static HTTP server, then open /index.html#home. The app requires no package install, build step, API key, environment variable, or localhost service in production.
