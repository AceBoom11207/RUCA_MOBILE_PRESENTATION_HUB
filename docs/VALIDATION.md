# RUCA Public Experience Validation

## Required routes

- `/`
- `/index.html#home`
- `/portfolio/`
- `/resume/Anthony_Moncion_Interaction_Designer_Public_Resume.pdf`

## Static checks

- Validate `index.html` and `portfolio/index.html` as HTML5.
- Run JavaScript syntax checks for `assets/public-site.js` and `service-worker.js`.
- Resolve every local `href`, `src`, manifest icon, and service-worker asset.
- Confirm the manifest and Vercel configuration parse as JSON.
- Confirm no public HTML, CSS, JavaScript, JSON, or manifest exposes a private endpoint, IP address, credential, file path, telemetry API, or executable native action.
- Confirm removed legacy interface language does not appear in the visible product or portfolio UI.

## Browser checks

Desktop:

- 1920 × 1080
- 2560 × 1440
- 1366 × 768

Mobile:

- 390 × 844
- 412 × 915

At every size, confirm:

- The opening immediately reads as the same red cockpit product shown in the RUCA HOME source image.
- The System Heart remains the visual center of the product image.
- Heading and action text do not collide with the captured runtime.
- No horizontal overflow hides content.
- Each system-world image preserves its aspect ratio and remains legible.
- The mobile menu opens, closes, and exposes the same destinations as desktop navigation.

## Interaction and accessibility checks

- Tab through every link and the mobile-menu summary.
- Confirm focus is visible against black and red surfaces.
- Confirm the skip link moves focus to the product experience.
- Confirm the three opening actions reach the system, case study, and public resume.
- Emulate `prefers-reduced-motion: reduce` and confirm image breathing and smooth scrolling are disabled.
- Check for browser console errors on the public experience and portfolio.
- Confirm meaningful images have useful alternative text and decorative images are ignored.

## Cache behavior

`service-worker.js` uses network-first delivery for documents, styles, scripts, and workers. The cache version is `ruca-public-v2-20260722-red-cockpit-r1`; activation removes older public and legacy cache families.

## Final visual question

Would someone who saw the public opening believe it represents the same product as the real RUCA HOME screen?

The build is not accepted until the answer is yes.
