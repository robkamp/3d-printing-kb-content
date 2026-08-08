---
title: Something looks wrong — start here
description: Find the page you need by what you are actually seeing, rather than by what it turns out to be called.
category: materials
type: reference
date: "2026-08-08"
tags:
  - troubleshooting
  - symptoms
difficulty: beginner
---

Almost nobody arrives at a knowledge base knowing which page they want. You
have a print in front of you that went wrong, and the name of the problem is
the thing you are missing.

So this page is indexed by **what you can see, hear or measure** — not by what
it is called once you know.

> [!TIP]
> If nothing has ever been calibrated on this printer, work through
> [calibrating a new filament](/kb/materials/filament-calibration) instead of
> chasing one symptom. Most of the entries below assume the steps before them
> are already right.

## Listen first

The quickest test costs nothing and rules out the most common cause.

| What you hear                                | Almost certainly                                                  |
| -------------------------------------------- | ----------------------------------------------------------------- |
| Popping, hissing, crackling near the nozzle  | Moisture — see [is this filament wet?](/kb/materials/wet-filament-diagnosis) |
| Clicking or a skipping extruder              | Over-retraction, a clog, or pressure advance set far too high     |
| Nothing unusual                              | Carry on down the page                                            |

## What the print looks like

| What you see                                          | Most likely cause                       | Read                                                                       |
| ------------------------------------------------------ | ---------------------------------------- | -------------------------------------------------------------------------- |
| Fine strings between parts, **no** retraction setting helps | Wet filament                        | [is this filament wet?](/kb/materials/wet-filament-diagnosis)              |
| Strings that **do** get better when you change retraction | Retraction not tuned                  | [retraction settings](/kb/hardware/retraction-settings)                    |
| Craters, pits, a foamy surface                        | Steam escaping from wet filament        | [is this filament wet?](/kb/materials/wet-filament-diagnosis)              |
| Corners bulge outwards                                 | Pressure advance too low                 | [pressure advance](/kb/materials/pressure-advance)                         |
| A thin, starved line just **after** a corner            | Pressure advance too high                | [pressure advance](/kb/materials/pressure-advance)                         |
| Walls consistently too thick or too thin               | Flow rate                                | [calibrating flow rate](/kb/materials/flow-rate-calibration)               |
| Gaps between the lines on a top surface                | Under-extrusion — flow, or too fast      | [calibrating flow rate](/kb/materials/flow-rate-calibration)               |
| Quality falls apart only when printing **fast**         | Past the hotend's melt limit             | [finding maximum volumetric speed](/kb/materials/max-volumetric-speed)     |
| Layers snap apart easily                               | Too cold, or wet filament                | [filament settings](/kb/materials/filament-settings)                       |
| Parts are the wrong size, or holes are too small       | Shrinkage or offset — they differ        | [making parts come out the right size](/kb/materials/dimensional-accuracy) |
| Every material behaves differently for no clear reason | The extruder itself is out               | [calibrating the extruder](/kb/hardware/extruder-calibration)              |

## Two that look alike and are not

> [!IMPORTANT]
> **Stringing** is the one people chase in the wrong direction. If turning
> retraction up does nothing, it was never a retraction problem — it is
> moisture, and more retraction will eventually give you a heat-creep clog on
> top of the stringing you still have.

> [!NOTE]
> **Brittle filament** that snaps as you feed it may be wet, but PLA also goes
> brittle with age and UV exposure. That kind is not reversible by drying, so
> check how old the spool is before spending a day on it.

## Nothing above matches

Two questions worth asking before going further afield:

- **Did this printer ever work?** A machine that has never printed well has a
  setup problem, not a tuning problem — bed levelling and first layer come
  before anything on this page.
- **Did something change?** A new spool, a new nozzle, a firmware update or a
  colder room are all enough on their own. The most recent change is the first
  suspect.

## Not written up yet

Honest gaps, so you know to look elsewhere rather than assume this page covers
everything:

- first layer not sticking
- warping and corners lifting off the bed
- clogs and heat creep as a subject in their own right
- layer shifting

If you solve one of these, that is exactly the kind of entry this knowledge
base is short of.
