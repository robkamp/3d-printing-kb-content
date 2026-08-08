---
title: Calibrating flow rate
description: The visual method, the calipers method, and why the second one exists.
category: materials
type: workflow
date: "2026-08-08"
tags:
  - filament
  - calibration
  - flow
difficulty: intermediate
series: filament-calibration
step: 4
reviewBy: "2027-02-08"
sources:
  - label: OrcaSlicer Wiki — Flow rate calibration
    url: https://github.com/OrcaSlicer/OrcaSlicer/wiki/flow_ratio_calib
    checked: "2026-08-08"
  - label: Obico — Objective flow rate calibration in OrcaSlicer
    url: https://www.obico.io/blog/orcaslicer-objective-flow-rate-calibration/
    checked: "2026-08-08"
  - label: Ellis' Print Tuning Guide — Extrusion multiplier
    url: https://ellis3dp.com/Print-Tuning-Guide/articles/index_tuning.html
    checked: "2026-08-08"
---

Flow rate — extrusion multiplier, flow ratio, the same thing under three names
— is how much plastic actually comes out relative to how much the slicer asked
for. It absorbs the differences between spools: die swell, pigment,
real filament diameter, how much a material shrinks as it cools.

> [!IMPORTANT]
> It does **not** absorb a mis-calibrated extruder. E-steps are mechanical and
> belong to the machine; flow is per-spool. Tuning flow to hide an e-steps
> error means every future material is wrong in a different direction, and
> nothing will tell you why.

Before starting: the filament is dry, the temperature is settled, and the
first layer is known-good. Why that order is in
[why calibration has an order](/kb/slicing/calibration-order).

## Method 1 — the visual test

Slicers ship this one, and it is genuinely fast.

1. Print the flow test — in OrcaSlicer, **Calibration → Flow Rate → Pass 1**.
   It prints a row of flat tiles at stepped flow values.
2. Pick the tile whose top surface is smoothest: no gaps between the lines
   (under-extrusion) and no ridges where lines are pushed into each other
   (over-extrusion).
3. Run **Pass 2**, which reprints a narrow range around your choice in finer
   steps, and pick again.

The universal complaint is that every tile looks identical. That is not a
failure of attention — differences of a few percent are genuinely hard to see,
and a mechanical problem elsewhere can flatten the differences further.

> [!TIP]
> Look across the tile at a shallow angle under a single light source rather
> than straight down under a room light. Ridges cast shadows; gaps do not.

## Method 2 — the calipers test

Slower, repeatable, and independent of your eyesight. This is the one to use
if the tiles look the same, or if the part has to fit something.

Print a single-wall cube with the slicer set so that the wall is exactly one
extrusion wide:

- **Walls / perimeters:** 1
- **Top layers:** 0
- **Infill:** 0%
- **Line width:** equal to the nozzle diameter
- **Vase / spiral mode:** on
- **Flow:** whatever it is now — you will correct from it

Then measure with calipers:

- three points per wall, on all four walls
- toward the middle of each wall, **not** at corners
- avoid the first and last layers

Average the twelve readings. Corners and the first layer are excluded because
both are systematically thicker for reasons that have nothing to do with flow.

## Working out the new number

```
new flow = (target wall thickness / measured average) × current flow
```

Worked example — target 0.40 mm, measured 0.42 mm, current flow 1.0:

```
(0.40 / 0.42) × 1.0 = 0.952
```

Re-print and re-measure. Repeat until the measurement is within about **3%**
of target. Two rounds is normal; more than three usually means something other
than flow is wrong.

For the common case of a 0.4 mm nozzle at a 0.45 mm extrusion width, a
correctly tuned wall lands between **0.43 and 0.47 mm**.

## When the number looks wrong

A result far from 1.0 is a symptom, not a setting to accept.

| Flow lands near | Suspect                                                   |
| --------------- | --------------------------------------------------------- |
| Below ~0.90     | Over-extrusion elsewhere: e-steps, or a nozzle worn oversize |
| Above ~1.10     | Under-extrusion: partial clog, extruder slipping, or too cold |

Most filaments land within roughly 0.95–1.05 of each other on a healthy
machine. A spool that needs 0.85 is telling you about the printer.

## Record it

Save it to the **filament** profile, not the printer profile — it belongs to
the spool. Then carry on to
[pressure advance](/kb/materials/pressure-advance), which assumes this number
is already right.
