---
title: Calibrating a new filament
description: A repeatable order to dial in an unfamiliar spool, changing one variable at a time.
category: materials
type: workflow
date: "2026-08-07"
updated: "2026-08-08"
tags:
  - filament
  - calibration
difficulty: intermediate
sources:
  - label: OrcaSlicer Wiki — Calibration guide
    url: https://github.com/OrcaSlicer/OrcaSlicer/wiki/calibration_guide
    checked: "2026-08-08"
  - label: Ellis' Print Tuning Guide — Tuning
    url: https://ellis3dp.com/Print-Tuning-Guide/articles/index_tuning.html
    checked: "2026-08-08"
  - label: OrcaSlicer Wiki — Max volumetric speed calibration
    url: https://www.orcaslicer.com/wiki/calibration/volumetric_speed_calib
    checked: "2026-08-08"
  - label: Klipper — Pressure Advance
    url: https://www.klipper3d.org/Pressure_Advance.html
    checked: "2026-08-08"
---

The point of a fixed order is that each step depends on the ones before it.
Tuning retraction before flow means re-tuning retraction once flow changes.

> [!NOTE]
> Work through these in order. Each step assumes the previous one is already
> correct — tuning retraction on wet filament measures the moisture, not the
> retraction.

Before starting:

- [x] Filament is dry, or has just come off the spool sealed
- [x] Bed is level and the first layer is known-good
- [ ] Nozzle diameter in the slicer matches the one actually fitted[^nozzle]
- [ ] The extruder itself is calibrated[^esteps]

[^nozzle]:
    Easy to miss after a nozzle swap, and it invalidates every flow
    measurement that follows.

[^esteps]:
    E-steps, or rotation distance in Klipper, are a property of the machine and
    are set once. They sit underneath everything here: if they are wrong, flow
    rate gets tuned to hide the error, and then every new material behaves
    differently for no visible reason. Never use flow to fix bad e-steps.

## 1. Dry the filament first

Everything downstream is measuring the wrong thing if the filament is wet.
Symptoms are popping or hissing while printing, visible steam, and stringing
that no retraction setting fixes.

## 2. Temperature tower

Print a tower that steps nozzle temperature across the manufacturer's published
range. Pick the lowest temperature that still gives clean layer adhesion —
snapping the tower by hand tells you more than looking at it does.

## 3. Flow / extrusion multiplier

Print a single-wall cube, measure the wall with calipers, and compare against
the expected extrusion width. Adjust flow so the measurement matches.

For a 0.4 mm nozzle set to a 0.45 mm extrusion width, expect to land between
**0.43 and 0.47 mm**.

> [!TIP]
> Slicers also offer a visual version of this test, where you pick the tile with
> the smoothest top surface. It is quicker, and the common complaint about it is
> that every tile looks identical. Calipers are the tie-breaker.

## 4. Pressure advance

Corners bulge and the line after a corner starts thin, because pressure in the
nozzle lags the extruder. Pressure advance compensates for that lag.

It only redistributes material — it cannot fix a part that is uniformly over-
or under-extruded, which is why it comes after flow rather than before. What it
is, the value ranges to expect, and the caveats are in
[pressure advance, and why it belongs to the filament](/kb/materials/pressure-advance).

> [!NOTE]
> Sources disagree about where this step belongs. Ellis' guide tunes pressure
> advance **before** the extrusion multiplier; OrcaSlicer's own guide puts
> maximum volumetric speed second and flow rate fourth. The order here changes
> one variable at a time and settles how much material is laid down before
> settling where it goes.

## 5. Retraction

Only now. Retraction distance and speed both trade stringing against the risk of
under-extrusion at the start of the next perimeter.

Sensible starting ranges depend far more on the extruder than on the filament —
roughly **0.5–2 mm** for direct drive against **4–8 mm** for Bowden, because a
Bowden tube absorbs much of the movement before it reaches the nozzle.

## 6. Maximum volumetric speed

The ceiling on how fast the hotend can actually melt this material. Worth
finding once, because it is what actually caps print speed on a fast printer —
not the speed numbers in the profile.

Step the test from **5 mm³/s to 20 mm³/s** and watch for where quality falls
apart. Then back the result off by **10–20%**: the point where defects appear is
the limit, not the setting.

## Record the result

Save the outcome as a named material profile in your slicer. An uncaptured
calibration has to be redone. What each of these values means is covered in
[filament settings and where to find them](/kb/materials/filament-settings).
