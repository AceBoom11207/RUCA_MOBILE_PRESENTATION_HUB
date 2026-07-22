# RUCA Command Core — Interactive Public Product Tour

This repository powers the existing public RUCA URL:

- `https://ruca-mobile-presentation-hub.vercel.app/`
- `https://ruca-mobile-presentation-hub.vercel.app/index.html#home`
- `https://ruca-mobile-presentation-hub.vercel.app/portfolio/`
- `https://ruca-mobile-presentation-hub.vercel.app/resume/Anthony_Moncion_Interaction_Designer_Public_Resume.pdf`

## Purpose

The root experience is a working five-world guided tour of RUCA. Visitors can switch among HOME, PLAY, LIVE WORLD, DIAGNOSTICS, and CONTROL, then select illuminated evidence directly on each real product capture. World selection updates the route hash, works with pointer or keyboard input, and keeps the actual RUCA interface—not an explanatory brochure—as the primary surface.

The tour does not recreate the private operating environment. It cannot read workstation telemetry, launch software, change settings, or reach local services.

## Experience

- Five interactive world tabs with direct hash routes
- Real red RUCA runtime captures for every world
- Selectable on-image evidence and a visible focus frame
- Concise world and feature readouts tied to visible product elements
- Arrow-key world navigation and bracket-key evidence navigation
- Persistent links to the case study, public resume, and contact route
- Responsive desktop and mobile layouts with reduced-motion support

## Structure

```text
index.html                         Interactive product-tour shell
assets/ruca-public.css             Red cockpit visual system and responsive layout
assets/public-site.js              Five-world routing, evidence selection, and keyboard input
assets/product/                    Captures from the real private RUCA runtime
portfolio/index.html               Product design case study
portfolio/portfolio.css            Case-study visual system
resume/                            Public resume PDF
service-worker.js                  Versioned network-first application cache
vercel.json                        Existing Vercel route, cache, and security headers
```

## Security boundary

The public bundle includes no workstation endpoint, bridge URL, IP address, credential, private file path, telemetry API, analytics tracker, or executable native action. Product values visible inside the screenshots are captured evidence only; the public JavaScript contains no device connection or native execution route.

## Local validation

Serve the repository root as a static site and test the same paths used in production. The validation record in `docs/VALIDATION.md` covers desktop, mobile, world routing, evidence selection, keyboard operation, reduced motion, console output, asset resolution, privacy, and route integrity.
