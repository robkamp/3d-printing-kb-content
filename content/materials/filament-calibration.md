---
title: Calibrating a new filament
description: A repeatable order to dial in an unfamiliar spool, changing one variable at a time.
category: materials
type: workflow
date: "2026-08-07"
tags:
  - filament
  - calibration
difficulty: intermediate
---

> Placeholder entry — exists to prove the content pipeline works end to end.
> Replace the body with real notes.

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

[^nozzle]:
    Easy to miss after a nozzle swap, and it invalidates every flow
    measurement that follows.

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

## 4. Retraction

Only now. Retraction distance and speed both trade stringing against the risk of
under-extrusion at the start of the next perimeter.

## 5. Maximum volumetric speed

The ceiling on how fast the hotend can actually melt this material. Worth
finding once, because it is what actually caps print speed on a fast printer —
not the speed numbers in the profile.

## Record the result

Save the outcome as a named material profile in your slicer. An uncaptured
calibration has to be redone. What each of these values means is covered in
[filament settings and where to find them](/kb/materials/filament-settings).
