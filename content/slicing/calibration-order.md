---
title: Why calibration has an order, and why the guides disagree about it
description: Each step assumes the ones before it are right. Which is why a wrong order produces numbers that look precise and are not.
category: slicing
type: reference
date: "2026-08-08"
tags:
  - calibration
  - slicing
  - order
difficulty: intermediate
reviewBy: "2027-02-08"
sources:
  - label: OrcaSlicer Wiki — Calibration guide
    url: https://github.com/OrcaSlicer/OrcaSlicer/wiki/calibration_guide
    checked: "2026-08-08"
  - label: Ellis' Print Tuning Guide — Tuning
    url: https://ellis3dp.com/Print-Tuning-Guide/articles/index_tuning.html
    checked: "2026-08-08"
  - label: Bambu Lab Wiki — Calibration
    url: https://wiki.bambulab.com/en/bambu-studio/Calibration
    checked: "2026-08-08"
---

Every calibration step measures something while assuming everything before it
is already correct. Get the order wrong and the measurement still succeeds —
it just measures the earlier mistake as well, and reports a number that looks
precise.

That is the failure worth understanding, because nothing warns you about it.
A flow rate tuned on a mis-calibrated extruder is a real number, repeatable,
and wrong.

## The dependencies that actually exist

These are the ones where order is not a matter of taste:

| This step            | Assumes                          | Or else                                            |
| -------------------- | -------------------------------- | -------------------------------------------------- |
| Anything at all      | Temperature is stable            | Every result drifts with the heater                |
| Flow rate            | The extruder delivers what is asked | The extruder's error is baked into the flow number |
| Pressure advance     | Bulk flow is already correct     | You tune placement while the amount is still wrong |
| Retraction           | Temperature is settled           | Retraction is tuned against the wrong viscosity    |
| Anything dimensional | The first layer is good          | You chase squish as if it were shrinkage           |

The common shape: a **mechanical** property underneath a **material**
property underneath a **placement** property. [E-steps](/kb/hardware/extruder-calibration) belong to the machine
and are set once; flow belongs to the spool; pressure advance belongs to the
spool and moves with speed.

> [!IMPORTANT]
> Moisture sits above all of it. A wet spool makes every measurement below
> unreliable, which is why drying is step zero rather than step one. See
> [is this filament wet?](/kb/materials/wet-filament-diagnosis).

## Where the guides disagree

They agree on the dependencies above and disagree about everything else. Three
current, credible orders:

| Guide                | Order                                                                       |
| -------------------- | --------------------------------------------------------------------------- |
| Ellis' Print Tuning Guide | E-steps → first layer → **pressure advance → flow** → cooling → retraction |
| OrcaSlicer wiki      | Temperature → **max volumetric speed** → pressure advance → flow → retraction |
| Common third-party guides | Temperature → **flow → pressure advance** → retraction → max volumetric speed |

The live disagreement is **pressure advance against flow**. Ellis tunes
pressure advance first; most others tune flow first.

Both defend themselves, and neither is careless:

- **Flow first** — pressure advance only redistributes material. Settling how
  much plastic is laid down before deciding where it goes means the second
  measurement is not chasing the first.
- **Pressure advance first** — an untuned pressure advance distorts the very
  extrusions you measure to judge flow, particularly at corners and line ends.
  Removing that distortion first makes the flow measurement cleaner.

> [!TIP]
> If you use the single-wall, calipers-based flow method, the case for flow
> first is stronger: a long straight wall printed in vase mode has almost no
> accelerations for pressure advance to affect. The two approaches converge
> once the test avoids the thing they disagree about.

## Why max volumetric speed moves around

OrcaSlicer puts it second; others put it last. This one is not really a
disagreement about dependency, it is about what the test is for.

Measured early, it is a **ceiling** — the flow the hotend can sustain, so
later tests do not accidentally run above it and measure under-extrusion
instead of what they meant to. Measured late, it is a **result** — the number
that caps print speed once everything else is right.

Either works. Measuring it early and re-checking it at the end is better than
either, and costs one extra print.

## What to actually do

Pick one order and finish it. The cost of a slightly suboptimal order is small
and the cost of switching halfway is a set of numbers none of which can be
trusted.

The order this knowledge base uses, and the reasoning for it, is in
[calibrating a new filament](/kb/materials/filament-calibration).

> [!NOTE]
> Automatic calibration does not remove the ordering problem, it hides it.
> Machines that calibrate flow dynamics on the fly still assume the extruder
> and the temperature underneath are correct — and on some models the result
> is per-print and never saved, so it is not calibration so much as
> compensation.
