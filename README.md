# Anthony Moncion portfolio and RUCA public demonstration

This repository contains the existing public portfolio and the separate RUCA desktop browser simulation, hosted at `ruca-mobile-presentation-hub.vercel.app`.

## Branch status

The entry-routing change in this branch is a draft, not a claim that production has been updated. Its baseline is `aa83c8fdf4369b66614438069ee933217b7cfaac`. See `docs/PORTFOLIO_RELEASE_HANDOFF.md` for the current evidence gaps and deployment checks.

## Clear destinations

- `/portfolio/`: Anthony C. Moncion's portfolio, with four separate project case studies.
- `/portfolio/ruca-os/`: desktop RUCA OS.
- `/portfolio/ruca-mobile/`: native Android Mobile Companion, not the desktop browser simulation.
- `/portfolio/la-cosa-nostra/`: independent workflow project.
- `/portfolio/gourmet-glatt/`: independent service-design proposal.
- `/index.html#home`: existing desktop public simulation. Its code and product assets are unchanged in this patch.
- `/resume/Anthony_Moncion_Interaction_Designer_Public_Resume.pdf`: the existing public resume address.

The proposed Vercel configuration serves the portfolio at `/` as well, without changing the existing domain or explicit demo paths. Known older root demo hashes are forwarded to `/index.html` with their original query and hash.

## Public boundary

The public browser demonstration is a separate snapshot using demonstration data. It is not a native APK, a live view of the reader's computer, or access to the private Windows environment. Do not add private bridges, credentials, native command paths, or workstation configuration. Current-product parity requires fresh evidence; a new portfolio paragraph does not establish it.

Independent project work is distinct from professional employment. Keep project roles, status, names, and resume links consistent.

## Files and local checks

`portfolio/` owns the personal presentation. `index.html`, `css/`, and `js/` retain the existing desktop simulation. `vercel.json` owns hosted entry routing and headers. `service-worker.js` owns versioned offline storage and network-first resume requests.

Serve the repository with an existing static HTTP server to inspect `/portfolio/` and `/index.html#home`. A plain static server does not apply Vercel rewrites; root routing still needs a deployment-preview test.

Run `node --test qa/portfolio-entry.test.mjs` for configuration and routing-unit checks. These do not replace browser, device, or deployment verification.
