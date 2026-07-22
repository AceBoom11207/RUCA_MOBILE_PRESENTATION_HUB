# RUCA Command Core — Public Product Experience

This repository powers the existing public RUCA product URL:

- `https://ruca-mobile-presentation-hub.vercel.app/`
- `https://ruca-mobile-presentation-hub.vercel.app/index.html#home`
- `https://ruca-mobile-presentation-hub.vercel.app/portfolio/`
- `https://ruca-mobile-presentation-hub.vercel.app/resume/Anthony_Moncion_Interaction_Designer_Public_Resume.pdf`

## Purpose

The site presents the real RUCA product design and interaction architecture to recruiters and collaborators. It does not recreate the complete operating environment or connect to the private workstation.

The complete local runtime remains responsible for telemetry, native commands, device behavior, files, credentials, and local services. The public site contains only static product captures, product copy, the case study, and the public resume.

## Experience

- Opening: the real RUCA HOME composition and the missing PC arrival ritual
- Product thesis: console confidence with PC authority
- System worlds: HOME, PLAY, LIVE WORLD, DIAGNOSTICS, and CONTROL
- Design language: gauges, conduits, System Heart, intelligence ribbon, command shell, cockpit depth, readability, and controller focus
- Product boundary: a quiet, explicit separation between public proof and private authority
- Case study and public resume

## Structure

```text
index.html                         Public product experience
assets/ruca-public.css             Public visual system
assets/public-site.js              Navigation and service-worker registration
assets/product/                    Static captures from the real local runtime
portfolio/index.html               Product design case study
portfolio/portfolio.css            Case-study visual system
resume/                            Public resume PDF
service-worker.js                  Versioned offline cache
vercel.json                        Existing Vercel route, cache, and security headers
```

## Security boundary

The public build includes no workstation endpoint, bridge URL, IP address, credential, private file path, telemetry API, analytics tracker, or executable native action. The screenshots are static evidence only.

## Local validation

Serve the repository root with any static server and test the same paths used in production. The validation record in `docs/VALIDATION.md` lists the required desktop, mobile, keyboard, reduced-motion, console, asset, privacy, and route checks.
