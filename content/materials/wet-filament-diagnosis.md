---
title: Is this filament wet?
description: The symptoms that mean moisture, the ones that mean something else, and how to tell them apart before you spend a day drying.
category: materials
type: reference
date: "2026-08-08"
tags:
  - filament
  - moisture
  - troubleshooting
difficulty: beginner
reviewBy: "2027-08-08"
sources:
  - label: Polymaker Wiki — Wet filament
    url: https://wiki.polymaker.com/printing-tips/common-printing-issues/wet-filament
    checked: "2026-08-08"
  - label: Bambu Lab Wiki — Drying function (AMS 2 Pro and AMS HT)
    url: https://wiki.bambulab.com/en/ams-2-pro/manual/drying-function
    checked: "2026-08-08"
---

Almost every common filament is hygroscopic: it pulls water out of the air and
holds it. In the hotend that water flashes to steam inside the melt, and the
steam is what you end up looking at.

Worth diagnosing rather than assuming, because drying a spool costs the better
part of a day and fixes nothing if moisture was not the problem.

## Listen first

The most reliable symptom is not visual.

> [!TIP]
> Put your ear near the hotend during a print. **Popping, hissing, crackling or
> sizzling** is water boiling as it leaves the nozzle. Dry filament is quiet.

If you can hear it, you have your answer and can stop looking. Sometimes visible
steam comes off the nozzle too, which is the same evidence.

## What it looks like

| Symptom                              | Why moisture causes it                          |
| ------------------------------------ | ----------------------------------------------- |
| Fine stringing and wisps everywhere  | Steam disrupts the melt; pressure is inconsistent |
| Craters, pits, small foamy patches   | Bubbles reaching the surface and bursting       |
| Rough, dull, uneven surface finish   | Extrusion varying moment to moment              |
| Weak layers, parts snapping easily   | Steam voids interrupting layer bonding          |
| Extrusion that varies with nothing changed | Water content varying along the strand    |

PETG shows it more visibly than most, so it is a useful canary if you have a
spool of it in the same cupboard.

## Telling it apart from the lookalikes

This is the part worth slowing down on, because two of these symptoms have
common non-moisture causes.

**Stringing** is the ambiguous one. Under-tuned retraction strings too, and so
does printing too hot.

> [!NOTE]
> The distinguishing test: stringing that **no retraction setting improves**,
> and that appears alongside any of the audible symptoms, is moisture.
> Stringing that responds to retraction changes was never a moisture problem.

**Brittleness** is the other. Filament that snaps when you bend it may be wet,
but PLA also goes brittle with age and UV exposure, and that is not reversible
by drying. Age and storage history tell you which.

**Under-extrusion** is more often a partial clog, a worn nozzle, or a
mis-tensioned extruder. Moisture makes extrusion *inconsistent* rather than
uniformly low — if it is steadily low, look at the hardware.

## How fast it happens

Fast enough that "it was fine last week" is not evidence.

In a humid room, filament left in open air can take on meaningful water within
hours. Nylon is the extreme: roughly **half an hour** of open-air exposure in a
humid room is enough to show in a print.

A sealed spool that has been sitting in a cupboard for a year is a reasonable
suspect too. Being unopened helps, but desiccant in the original bag has a
finite capacity and a year is a long time.

## If the answer is yes

Drying temperatures, times, and the ways to ruin a spool while doing it are in
[drying filament](/kb/materials/drying-filament).

Do it before anything else in
[calibrating a new filament](/kb/materials/filament-calibration) — a
temperature tower printed on wet filament measures the water, not the
temperature.
