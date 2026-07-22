# RUCA Public Simulation Validation

## Root architecture

- PASS — HOME is rendered from real HTML buttons and OS-style instrument components. The root world surface contains zero screenshot images.
- PASS — The persistent three-part header, intelligence ribbon, machine footer, Core HOME return control, and all five world layouts were rebuilt against current live RUCA OS captures.
- PASS — One application state owner controls routes, fixtures, focus, diagnostics, commands, live lanes, presets, and local persistence.
- PASS — The five required hashes render without full-page application navigation.
- PASS — The screenshot-tour hotspot layer, numbered evidence markers, focus frame, and PREV/NEXT narration were removed from the root implementation.

## World interaction

- PASS — HOME renders six gauges, a breathing System Heart, slowly changing deterministic values, score updates, and focusable detail.
- PASS — PLAY renders the current nine-filter, 39-command district field, spatial nodes, selected-center ownership, and a no-native-execution handoff message.
- PASS — LIVE WORLD switches six local lanes and updates title, source state, primary visual, trace, and supporting metrics.
- PASS — DIAGNOSTICS switches Mission Ready, Advisory, and Critical Example states and updates score, severity, affected system, trace, sensors, explanation, first check, and next action.
- PASS — CONTROL exposes the current eight-profile workshop and live sliders; state persists in browser storage; reset restores the RUCA Black / Gold default.

## Input and accessibility

- PASS — Semantic links, buttons, range controls, color control, headings, regions, labels, and status announcements are present.
- PASS — Directional arrow focus was exercised; focus moved spatially with a visible outline.
- PASS — Home returned to HOME; Q/E world cycling and Escape focus recovery were exercised.
- PASS — Mobile pointer activation selected a command at the 412x915 viewport.
- PASS — Visible interactive targets measured at least 40px in both axes in the automated viewport checks; primary touch controls are styled to 44px or larger where practical.
- PASS — Reduced-motion emulation matched the media query, reduced animation duration to a single near-zero iteration, and preserved visible content.

## Responsive matrix

Checked at 2560x1440, 1920x1080, 1366x768, 1280x720, 412x915, and 390x844 across HOME, PLAY, LIVE WORLD, DIAGNOSTICS, and CONTROL.

- PASS — zero page-level horizontal overflow
- PASS — zero zero-size world controls
- PASS — zero screenshot images inside the root world surface
- PASS — mobile route changes restore the top of the new world
- PASS — the active mobile world tab scrolls fully into view
- PASS — mobile System Heart and headings do not overlap

## Safety boundary

- PASS — connect-src none blocks application data connections.
- PASS — no localhost, private endpoint, credential, token, native command, process execution, bridge client, or device-control code exists in the root application.
- PASS — every data-bearing surface is labeled simulated, local, deterministic, cached, or stale in context.
- PASS — PLAY explicitly reports that native execution is disabled and that nothing was launched.
- PASS — the quiet footer and About panel state the public/private boundary.

## Cache behavior

- PASS — cache name changed to ruca-os-public-v2-20260722.
- PASS — activation deletes every cache except the current version, covering old demo, recruiter, brochure, and guided-tour cache families.
- PASS — documents, styles, scripts, and workers use network-first fetch behavior.
- PASS — Vercel headers prevent root HTML and service-worker staleness and require CSS/JS revalidation.

## Static checks

- PASS — assets/public-site.js passes node --check with the bundled Node runtime.
- PASS — service-worker.js passes node --check with the bundled Node runtime.
- PASS — manifest.webmanifest and vercel.json parse as JSON.
- PASS — browser console warning/error capture returned no entries during local interaction tests.

Production deployment and live-route receipts are recorded in the release handoff because their IDs are deployment-specific.
