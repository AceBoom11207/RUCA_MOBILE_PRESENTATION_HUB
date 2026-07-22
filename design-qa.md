# RUCA Command Core Design QA

## Visual standard

The public root now uses the private RUCA OS as its visual reference without using private runtime code or captures as the interface:

- deep black environment
- disciplined Blood Red illumination
- gunmetal instrument framing
- central System Heart
- six Swiss-watch-inspired gauges
- visible energy conduits
- persistent command shell and status ribbon
- large couch-distance headings and selected states
- layered physical depth without rainbow cyberpunk noise

The separate portfolio retains real-product captures as case-study evidence. The root simulation renders its own HTML/CSS/SVG interface and loads only the RUCA identity image.

## Responsive evidence

| Viewport | Worlds checked | Horizontal overflow | Zero-size controls | Root screenshots |
|---|---:|---:|---:|---:|
| 2560x1440 | 5 | 0 | 0 | 0 |
| 1920x1080 | 5 | 0 | 0 | 0 |
| 1366x768 | 5 | 0 | 0 | 0 |
| 1280x800 | 5 | 0 | 0 | 0 |
| 412x915 | 5 | 0 | 0 | 0 |
| 390x844 | 5 | 0 | 0 | 0 |

Mobile-specific visual inspection confirmed:

- current-world navigation centers the active tab
- route changes restore the page to the new world heading
- System Heart breathing does not translate over the heading
- HOME becomes a two-column instrument surface with the Heart first
- PLAY preserves a spatial command center instead of becoming a generic card grid
- Live World lanes and district selectors scroll inside bounded rails without creating page overflow
- CONTROL becomes a stacked workshop with readable preset ownership and 44px input targets

## Motion and focus

Motion is limited to world entry, gauge sweep, System Heart breathing, conduit energy, selected command emphasis, and trace drawing. prefers-reduced-motion reduces animation to a completed near-zero transition and removes animated conduit dashes.

Visible focus uses a high-contrast warm outline. Arrow navigation chooses the nearest valid control in the requested direction. Focus recovers after route changes and Escape returns to the active world navigation control.
