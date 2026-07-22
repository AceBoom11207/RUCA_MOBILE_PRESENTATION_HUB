# RUCA Interactive Product Tour Validation

## Required routes

- `/`
- `/index.html#home`
- `/index.html#play`
- `/index.html#live-world`
- `/index.html#diagnostics`
- `/index.html#control`
- `/portfolio/`
- `/resume/Anthony_Moncion_Interaction_Designer_Public_Resume.pdf`

## Static checks

- Validate `index.html` and `portfolio/index.html` as HTML5.
- Run JavaScript syntax checks for `assets/public-site.js` and `service-worker.js`.
- Resolve every local `href`, `src`, manifest icon, and service-worker asset.
- Confirm the manifest and Vercel configuration parse as JSON.
- Confirm no public HTML, CSS, JavaScript, JSON, or manifest exposes a private endpoint, IP address, credential, file path, telemetry API, or executable native action.
- Confirm prohibited legacy interface wording does not appear in the visible tour or case-study UI.

## Browser checks

Desktop:

- 1920 × 1080
- 2560 × 1440
- 1366 × 768

Mobile:

- 390 × 844
- 412 × 915

At every size, confirm:

- HOME opens at the top of the page with the actual red cockpit capture as the dominant surface.
- The opening, five world tabs, complete product stage, and boundary fit one 1920 × 1080 viewport.
- No horizontal overflow hides content.
- Product captures preserve the 16:9 source ratio.
- On mobile, world tabs scroll horizontally and evidence controls meet a 44px target height.

## Interaction and accessibility checks

- Every world tab updates the image, world readout, route hash, active state, and evidence markers.
- Direct loading of each supported hash selects the correct world.
- Every numbered evidence marker updates the focus frame, evidence title, description, pressed state, and count.
- PREV and NEXT wrap through the active world's evidence.
- Left/Right arrows move among worlds from the tablist or product stage.
- Home/End move to the first and last world from the tablist.
- Bracket keys move among evidence when the product stage is focused.
- Focus remains visible on tabs, evidence markers, controls, and public links.
- The skip link reaches the product stage.
- `prefers-reduced-motion: reduce` removes nonessential transitions.
- The browser console remains clear during the full interaction pass.

## Truth and security checks

- The persistent state reads `GUIDED PRODUCT TOUR / CAPTURED PRODUCT STATES / NO WORKSTATION CONNECTION`.
- PLAY interaction never launches or claims it can launch software.
- The public diagnostics hook reports `connectedToDevice: false` and `nativeExecutionRoutes: 0`.
- CSP retains `connect-src 'none'`.
- Source inspection finds no fetch, WebSocket, localhost, loopback, bridge endpoint, native IPC, executable path, credential, or private workstation file.

## Cache behavior

`service-worker.js` uses network-first delivery for documents, styles, scripts, and workers. The cache version is `ruca-public-v3-20260722-guided-tour-r2`; activation removes older public and legacy cache families.

## Final visual question

Would someone who saw the public experience believe it represents the same product as the real RUCA HOME screen?

The corrected build is accepted only when the source reference and implementation pass the same-viewport side-by-side review.
