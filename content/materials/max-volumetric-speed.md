---
title: Finding maximum volumetric speed
description: The real ceiling on print speed is how fast the hotend can melt plastic, not the speed numbers in the profile.
category: materials
type: workflow
date: "2026-08-08"
tags:
  - filament
  - calibration
  - speed
difficulty: intermediate
reviewBy: "2027-02-08"
sources:
  - label: OrcaSlicer Wiki — Max volumetric speed calibration
    url: https://www.orcaslicer.com/wiki/calibration/volumetric_speed_calib
    checked: "2026-08-08"
  - label: Ellis' Print Tuning Guide — Determining maximum volumetric flow rate
    url: https://ellis3dp.com/Print-Tuning-Guide/articles/determining_max_volumetric_flow_rate.html
    checked: "2026-08-08"
---

Print speed is set in mm/s, which is convenient and slightly misleading. What
the hotend actually cares about is **volume per second** — and that is what
runs out first.

```
volumetric flow (mm³/s) = print speed (mm/s) × line width (mm) × layer height (mm)
```

Rearranged, it tells you the speed a given flow ceiling actually permits:

```
print speed = max volumetric speed / (line width × layer height)
```

Which is why the same 20 mm³/s hotend prints a 0.2 mm layer twice as fast as a
0.4 mm one, and why raising the speed slider on a thick-layer print achieves
nothing at all.

## What the limit actually is

> [!IMPORTANT]
> The extruder can push filament faster than the hotend can melt it. That is
> the whole problem. Past the limit the motor keeps turning, the plastic does
> not keep up, and you get under-extrusion rather than an error.

So the ceiling is set by heat, not by torque. It moves with:

- **the hotend** — roughly 11 mm³/s for an E3D V6, around 24 mm³/s for a
  Dragon HF
- **temperature** — hotter melts faster, within the material's range
- **nozzle material** — hardened steel conducts worse and lowers it; tungsten
  carbide raises it
- **the material itself** — this is why it is calibrated per filament

As a rough frame: standard hotends land around **10–15 mm³/s**, high-flow
designs reach **30–60 mm³/s**.

## Method 1 — the slicer test

In OrcaSlicer, **Calibration → Max Volumetric Speed**. It prints an object
whose flow rises steadily with height.

- Start **5 mm³/s**, end **20 mm³/s**, step **0.5** — the defaults, and a
  sensible sweep unless you already know roughly where your hotend sits.
- Print it, then find the height where the surface degrades: dull patches,
  gaps, visible under-extrusion.
- Measure that height and convert:

```
max volumetric speed = 5 + (height in mm × 0.5)
```

That formula is tied to the start and step above — change those and the
arithmetic changes with them.

## Method 2 — extruding into the air

No printing, and it isolates the hotend from everything else.

1. Heat to your normal printing temperature for the material.
2. Mark **100 mm** of filament above the extruder.
3. Command a 100 mm extrusion at a set speed, and measure what actually went
   in.
4. Repeat, raising the speed, until less than 100 mm is consumed.
5. Convert the last good speed: for **1.75 mm** filament,
   `volumetric flow = speed (mm/s) × 2.4`.

The multiplier is the cross-section of the filament, so it is specific to
1.75 mm — 2.85 mm filament uses a different one.

## Back off from whatever you measured

> [!WARNING]
> The point where defects appear is the limit, not the setting. Use
> **10–20% below** it.

Two reasons, and they compound. A synthetic test extrudes into open air or
onto a flat surface, while a real print presses fresh plastic against the
previous layer, which needs more pressure for the same result. And the number
falls as the nozzle wears and as ambient temperature drops.

Ellis frames the choice as conservative against aggressive: stop at the point
where extrusion is still exactly what was asked for, or push past it and
accept 2–3% under-extrusion on infill where nobody will see it. For visible
surfaces, take the conservative one.

## Where to put it

Into the **filament** profile, as the max volumetric speed. Once it is set,
the slicer clamps speed against it automatically, which means layer height,
line width and nozzle changes stop being able to outrun the hotend without
anyone noticing.

That is the real value of measuring it: not a faster print, but a speed slider
that stops lying.
