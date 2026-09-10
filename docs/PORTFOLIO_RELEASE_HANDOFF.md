# Portfolio alignment: remaining release work

## Scope and baseline

Existing repository: `AceBoom11207/RUCA_MOBILE_PRESENTATION_HUB`.
Reviewed baseline: `aa83c8fdf4369b66614438069ee933217b7cfaac`.
Review date: September 9, 2026, America/New_York.

This change is a proposed entrance correction in the existing project, not a new site or a product rebuild. It does not authorize application submission. Keep concurrent work and all private product sources intact.

## What is already online

The connected Vercel fetch returned HTTP 200 for the portfolio landing and its four case studies: `/portfolio/`, `/portfolio/ruca-os/`, `/portfolio/ruca-mobile/`, `/portfolio/la-cosa-nostra/`, and `/portfolio/gourmet-glatt/`. The landing presents Anthony C. Moncion with Work, About, Resume, and Contact navigation. Its four project entries and biography distinguish independent product work from paid employment.

These were response and HTML inspections, not a fresh browser-visual or installed-device test. The existing public resume project-entry source is corrected. The public PDF exists in the repository; its live downloaded bytes still need comparison with the approved application document. Do not report the entire application as ready based on HTTP status alone.

## Proposed entrance behavior

| Existing address | Expected behavior after deployment |
| --- | --- |
| `/` | Personal portfolio, not the desktop application interface |
| `/portfolio/` | Same portfolio and existing canonical application link |
| `/portfolio/ruca-os/` | Desktop case study |
| `/portfolio/ruca-mobile/` | Native Android companion case study |
| `/portfolio/la-cosa-nostra/` | Workflow project |
| `/portfolio/gourmet-glatt/` | Service-design proposal |
| `/index.html#home` and other explicit demo hashes | Existing desktop simulation, unchanged |
| `/#home`, `/#play`, `/#live`, `/#live-world`, `/#diagnostics`, `/#control` | Forward to the explicit existing demo path while retaining query and hash |
| `/resume/Anthony_Moncion_Interaction_Designer_Public_Resume.pdf` | Existing corrected resume address, unchanged |

The exact root rewrite does not rename the domain, move the demo, introduce a new framework, or replace the private runtime. The worker cache namespace changes for this entry migration. Existing network-first resume handling and the offline missing-page response are preserved.

## Evidence still required before the application release

### RUCA OS: current product, not only current copy

The desktop case study retains `assets/product/ruca-home-runtime.png` and `ruca-diagnostics-runtime.png`. Their blob hashes are unchanged from the earlier public snapshot. The root demo source still declares `RUCA_PUBLIC_SOURCE_CLONE_R14`. That is not evidence that the demonstration matches the current desktop product.

Use the current accepted local desktop runtime to capture HOME, the media interaction, and a useful diagnostics state. Record the actual build or commit associated with each capture. Preserve the accepted navigation and visuals. Update the public simulation only by reconciling its existing presentation owners with current accepted source. Never copy a private telemetry bridge, token, endpoint configuration, or native command execution path to the public deployment. A simulation may use labeled fixtures; it must not claim current product parity until compared with the actual product.

### Native Android companion: prove the current app

The published mobile case study contains no app screenshot or recording. The inspected Android source includes five destinations and a six-slot HOME implementation. This establishes code presence, not successful behavior on an installed device.

The provided Android archive contains July-dated screenshot entries alongside September source. Do not relabel those images as September runtime proof. Its asset-provenance note expressly covers packaging, not build, installation, or final acceptance.

Capture the accepted installed APK on the target device: HOME with the current ports, MEDIA, and one missing-data or disconnected state. Record package version, build/checkpoint, device, and capture date. Reconcile claims with those results. Do not call implemented behavior merely a future idea, and do not call a design direction fully validated without proof.

The available Figma MEDIA frame is `vo2DuY25t0yN7O9VxjcWjc`, node `53:520`. Use it only as clearly captioned design evidence when relevant. Save any exported render as a stable project asset; do not publish an expiring asset URL or label a Figma frame as an APK screenshot. Preserve the selected mobile direction rather than creating a new concept.

### Supporting projects: show the work behind the summaries

The La Cosa Nostra and Gourmet Glatt pages are currently prose-only. Add a relevant capture from each existing artifact, plus a supporting artifact link only when safe and actually available. For La Cosa Nostra, show ownership, review state, or the mission workflow, without implying live providers or commercial clients from sample data. For Gourmet Glatt, show the approved fulfillment or exception-handling flow from the existing proposal. Keep its independent, not-deployed status. Do not publish private contacts, real customer data, fabricated outcomes, or raw project archives.

## Copy and link consistency

Keep the same four product names, personal identity, and independent-project role across the homepage, case studies, metadata, resume, and downloads. The portfolio is about Anthony; the project pages explain the work; simulations illustrate only their declared product and snapshot. Link labels must distinguish `View portfolio`, `Read case study`, and `Open desktop simulation`.

Inspect the two existing reviewer anchors in the desktop demo `index.html`: their `/portfolio/` destination is now a portfolio hub, so the old `VIEW CASE STUDY` wording should be reconciled in the existing HTML owner. This branch deliberately leaves demo HTML untouched to avoid colliding with a current-product refresh.

Retain the corrected unpaid-project language. Do not reintroduce employer claims, invented tenure, paid clients, completed research, unmeasured impact, or a finished education credential.

## Validation and handoff

The included Node test suite passed 24 configuration and JavaScript-routing checks. It is not proof of Vercel routing, browser layout, real hardware behavior, or service-worker migration. Run `node --test qa/portfolio-entry.test.mjs` from the repository root.

Before merging or promoting, review the diff against concurrent work. Test the branch preview at desktop, tablet, and phone sizes. Open the bare domain, all four case studies, explicit demo links, legacy root hashes, Back navigation, and the PDF. Check a returning browser with an older worker as well as a clean session; confirm that neither portfolio nor resume becomes the application shell offline. Download the actual PDF from each resume entry point and compare text, destination links, and the intended canonical bytes. Check image loads, visible captions, keyboard focus, console errors, and no private-network requests.

Publish only the reconciled existing project, then repeat these checks against the actual public alias. Report the deployed commit, tested URLs, capture/build provenance, resume result, and any remaining limitation. No claim of completion until the current products and public presentation agree.
