---
title: Making parts come out the right size
description: Two different errors get called "inaccuracy", they need opposite fixes, and measuring the wrong feature will send you after the wrong one.
category: materials
type: workflow
date: "2026-08-08"
tags:
  - accuracy
  - tolerance
  - shrinkage
difficulty: advanced
reviewBy: "2027-08-08"
sources:
  - label: OrcaSlicer Wiki — Filament tolerance calibration
    url: https://www.orcaslicer.com/wiki/calibration/tolerance_calib
    checked: "2026-08-08"
  - label: Bambu Lab Wiki — X-Y hole and contour compensation
    url: https://wiki.bambulab.com/en/software/bambu-studio/xy-hole-contour-compensation
---

A part that does not fit is failing in one of two ways, and they are not the
same problem.

| Error         | Looks like                                        | Fixed with              |
| ------------- | ------------------------------------------------- | ----------------------- |
| **Scale**     | Error grows with size. 100 mm is out by 0.5 mm; 10 mm is out by 0.05 mm | Shrinkage compensation, a percentage |
| **Offset**    | Error is the same at every size. Every hole is 0.2 mm small, whether 5 mm or 50 mm | Hole/contour compensation, a distance |

> [!IMPORTANT]
> Measure **one small feature and one large one**. If the error is
> proportional it is scale; if it is constant it is offset. Applying a
> percentage to an offset error fixes the size you tested and breaks every
> other size — which is why this distinction comes before any adjustment.

## Offset: holes come out undersized

Nearly universal, and it has a physical cause. Printing a curve, the nozzle
drags material slightly toward the inside of the arc, so a hole ends up a
little smaller than drawn. Outside contours are affected too, less so.

Two separate settings, because the two features need different corrections:

- **X-Y hole compensation** — internal features
- **X-Y contour compensation** — external outlines

### Halve your measurement

> [!WARNING]
> The compensation is a **radial** offset; a hole measurement is a
> **diameter**. A hole 0.5 mm too small needs **+0.25 mm**, not +0.5 mm.
> Entering the diameter error is the most common mistake here, and it
> overshoots by exactly double.

## Scale: shrinkage

Plastic contracts as it cools, so the part is slightly smaller than the model.
This one is proportional, and it is a property of the material.

| Material class    | Examples                | Behaviour                                    |
| ----------------- | ----------------------- | -------------------------------------------- |
| **Amorphous**     | PLA, PETG, ASA, PC      | Low and predictable — they do not crystallise |
| **Semi-crystalline** | Nylon, PP            | Higher and more variable — crystallisation depends on cooling rate |

Which is why a nylon part can measure differently between a fast print and a
slow one of the same file, and a PLA part generally does not.

Compensate by scaling above 100% in the slicer's shrinkage setting, and save
it to the **filament** profile — it belongs to the material.

## Do this first, or measure a lie

> [!CAUTION]
> **Elephant's foot** — the first layers squashed wider by first-layer
> pressure — contaminates any measurement taken near the bottom of a part. It
> is neither scale nor offset, and compensating for it as though it were
> either will throw off everything above it.

So before measuring anything:

- [x] First layer height is dialled in and not over-squished
- [x] Flow rate is calibrated — see
      [calibrating flow rate](/kb/materials/flow-rate-calibration)
- [x] The extruder is calibrated — see
      [calibrating the extruder](/kb/hardware/extruder-calibration)
- [ ] Measure **above** the bottom few layers, never across them

Over-extrusion inflates every external dimension and shrinks every hole, which
looks exactly like an offset error. Fix the cause rather than compensating for
it, or the compensation becomes wrong the moment flow is corrected.

## The procedure

1. Print a tolerance test — OrcaSlicer ships one with hexagonal holes stepped
   at 0.0, 0.05, 0.1, 0.2, 0.3 and 0.4 mm, plus a matching tester to try in
   them.
2. Measure with calipers, above the bottom layers, several readings averaged.
3. Compare small against large features to decide **scale or offset**.
4. Apply one correction only, then reprint and re-measure.
5. Repeat until it converges.

Change one thing at a time. Two compensations applied together cannot be told
apart afterwards, and you will not know which one did the work.

> [!TIP]
> For parts that must fit each other, designed clearance usually beats chasing
> the last 0.05 mm in calibration. A 0.2 mm gap in the model is more robust
> than a printer tuned to be exact at one temperature with one spool.
