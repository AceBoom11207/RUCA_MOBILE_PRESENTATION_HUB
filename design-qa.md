# RUCA public source-clone design QA

## Comparison target

- Source visual truth: `C:\Users\amonc\OneDrive\Pictures\Screenshots 1\Screenshot 2026-07-18 233525.png` through `Screenshot 2026-07-18 234500.png`
- Source markup truth: `C:\Users\amonc\.codex\attachments\89437eae-d7d8-4108-bbab-3f8833d395d1\pasted-text.txt`
- Implementation: `http://127.0.0.1:4173/index.html?qa=final-r7`
- Primary implementation captures: `C:\Users\amonc\Documents\Codex\2026-07-22\la-cosa-nostra-ruca-ai-plugin\work\qa\demo-home-r6-final.png`, `demo-play-r6-final.png`, `demo-live-weather-r6-final.png`, `demo-diagnostics-r6-final.png`, and `demo-control-r6-final.png`
- Full LIVE comparison: `C:\Users\amonc\Documents\Codex\2026-07-22\la-cosa-nostra-ruca-ai-plugin\work\qa\compare-live-all-r4b.png`
- HOME comparison: `C:\Users\amonc\Documents\Codex\2026-07-22\la-cosa-nostra-ruca-ai-plugin\work\qa\compare-home-r3b.png`
- PLAY comparison: `C:\Users\amonc\Documents\Codex\2026-07-22\la-cosa-nostra-ruca-ai-plugin\work\qa\compare-play-r2.png`, followed by the corrected `demo-play-r6-final.png`

## Normalization

- Source pixels: 2048 x 1152.
- Implementation pixels: 2048 x 1152.
- CSS viewport: 2048 x 1152.
- Density: equal-size desktop captures; no density conversion was required.
- States: HOME, PLAY, LIVE WORLD Weather, World Briefing, Game Day, Signal Intelligence, Celestial Observatory, CPU Diagnostics, and Control Workshop.
- Additional responsive checks: 1024 x 768 and 390 x 844.

## Findings

- No actionable P0, P1, or P2 mismatch remains.
- P3 intentional content deviation: public-demo copy, timestamps, news subjects, and machine readings differ from the private/local RUCA runtime. The layout, crop strategy, hierarchy, and source visual system remain intact; the substituted content is explicitly deterministic and browser-local.
- P3 intentional current-source deviation: Diagnostics technical workspaces and Control atmosphere groups use the current source's progressive-disclosure controls. They are functional and preserve the source markup rather than forcing the older screenshot state open.

## Required fidelity surfaces

- Fonts and typography: the canonical RUCA stylesheet and hierarchy are used. Desktop title scale, small-label spacing, navigation weight, and dense data typography match the source family. No broken wrapping or truncation remains in the primary deck.
- Spacing and layout rhythm: desktop header is 62 px, footer is 50 px, and HOME/PLAY/LIVE/Diagnostics/Control region boundaries match the 2048 x 1152 captures. LIVE uses the 114 px rail and source stage proportions. Control uses the 280 px command rail and aligned main deck.
- Colors and tokens: the canonical customizable RUCA theme variables remain active. The validation target used the red profile, while all theme presets, custom color inputs, density, glass, motion, and brightness controls remain functional.
- Image quality and asset fidelity: the original RUCA logo and five realm backdrops are local assets. Realm imagery is rendered through the source layout and crop rules; no placeholder boxes or CSS-drawn replacement imagery was introduced.
- Copy and content: app-specific labels, world names, command districts, sensor names, and control labels are preserved. Runtime-only claims are replaced with truthful public-demo labels.
- Icons: the canonical source icon resolver populates all 39 PLAY nodes and navigation controls. Focus, selected, favorite, and status treatments render in the source style.
- Responsiveness and accessibility: desktop, tablet, and mobile produced zero document-level horizontal overflow. All five primary navigation controls remained unique and operable. Buttons, tabs, details, form labels, focus states, and reduced-motion hooks remain semantic.

## Focused evidence

- PLAY node visibility and geometry were inspected at individual-node level after the full-view comparison. The focused crop `C:\Users\amonc\Documents\Codex\2026-07-22\la-cosa-nostra-ruca-ai-plugin\work\qa\play-node-crop.png` exposed the initial missing orbit render; the final pass verified 39 of 39 nodes with measured orbit coordinates.
- HOME geometry was measured directly: 380 x 380 system heart, 62 px header, and 50 px footer at the target viewport.
- Diagnostics focused checks verified 11 visible sensor groups, five triage blocks, exclusive technical workspaces, and the separate Machine Health Timeline state.

## Comparison history

1. Initial source import: HOME shell structure was correct, but HOME radial geometry and PLAY orbit positions were missing. Fixed by restoring the canonical measured geometry, then compared again at 2048 x 1152.
2. PLAY comparison: nodes existed in the DOM but were initially overlapped at the center and then appeared oversized. Fixed route-triggered layout refresh, 42 px desktop nodes, 220 px command core, and source ring spacing. Post-fix evidence: `demo-play-r6-final.png` with 39/39 positioned nodes.
3. LIVE comparison: the first pass used a rail that was 30 px too wide and an over-tall mode header. Fixed the source rail to 114 px, the gap to 9 px, the header to 67 px, hid the non-reference Market lane, and removed duplicate source-state copy. Post-fix evidence: `compare-live-all-r4b.png`.
4. Diagnostics comparison: the severity/live cards collided and the sensor list collapsed to one column. Fixed the three-column evidence strip, two-column sensor grid, and full declared sensor visibility. Post-fix evidence: 11 visible groups with zero horizontal overflow.
5. Control comparison: the command rail was too wide and the header overlapped the status strip. Fixed the 280 px rail, 12 px gap, compact title metrics, and 132 px command dial. The footer was normalized to 50 px across all worlds.

## Interaction and runtime checks

- Primary navigation: HOME, PLAY, LIVE WORLD, DIAGNOSTICS, and CONTROL.
- PLAY: 39 commands, district filtering, selection, favorite state, and safe no-launch feedback.
- LIVE WORLD: five realm lanes and their image-led decks.
- Diagnostics: sensor selection, refresh, technical-detail toggle, Live Evidence, Sensor Map, Benchmark, Raw Inventory, and Machine Health Timeline.
- Control: preset preview, apply, reset, sliders, details panels, and simulated power/settings controls.
- Console: zero errors and zero warnings in the final local run.
- Static checks: all three JavaScript files passed `node --check`; manifest and Vercel configuration parsed as JSON; private endpoint scan was clean.

## Follow-up polish

- None required for handoff. Public content can be refreshed later without changing the RUCA shell.

final result: passed
