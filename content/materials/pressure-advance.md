---
title: Pressure advance, and why it belongs to the filament
description: What pressure advance corrects, what it cannot correct, and why it has to be measured again for every spool.
category: materials
type: reference
date: "2026-08-08"
tags:
  - pressure-advance
  - calibration
  - filament
difficulty: intermediate
sources:
  - label: Klipper — Pressure Advance
    url: https://www.klipper3d.org/Pressure_Advance.html
    checked: "2026-08-08"
  - label: Ellis' Print Tuning Guide — Pressure Advance / Linear Advance
    url: https://ellis3dp.com/Print-Tuning-Guide/articles/pressure_linear_advance/introduction.html
    checked: "2026-08-08"
  - label: Bambu Lab Wiki — Flow Dynamics calibration
    url: https://wiki.bambulab.com/en/software/bambu-studio/calibration_pa
    checked: "2026-08-08"
  - label: OrcaSlicer Wiki — Calibration guide
    url: https://github.com/OrcaSlicer/OrcaSlicer/wiki/calibration_guide
    checked: "2026-08-08"
---

The extruder pushes filament; the nozzle resists. Pressure takes a moment to
build when the toolhead accelerates, and a moment to fall when it slows.
Pressure advance is the firmware compensating for that lag in advance.

Everyone's firmware calls it something different, which makes it harder to
search for than it should be:

| Firmware               | Name              |
| ---------------------- | ----------------- |
| Klipper                | Pressure Advance  |
| Marlin                 | Linear Advance    |
| Bambu Lab / Bambu Studio | Flow Dynamics (`K` value) |

## What it corrects

Without it, two things go wrong at every change of speed.[^lag]

- **Accelerating out of a corner** — pressure has not built yet, so the line
  starts thin.
- **Decelerating into one** — pressure is still there with nowhere to go, so
  plastic keeps coming and the corner bulges.

The faster the printer moves, the worse both get. A machine that looks fine at
40 mm/s can look poor at 300 mm/s for this reason alone.

[^lag]:
    Klipper's documentation describes the same mechanism from the other
    direction: pressure advance also reduces ooze during non-extruding moves,
    because the pressure is deliberately dropped before the move begins.

## What it does not correct

> [!IMPORTANT]
> Pressure advance changes **where** material is placed, never **how much** is
> placed. It cannot fix over- or under-extrusion — that is flow rate, and it is
> a separate calibration.

Concretely, it does not change the total filament used, the toolhead's path, or
how long the print takes. If a part comes out consistently too thin or too
thick, tuning pressure advance will not help and will waste an afternoon.

## Why it is a filament setting

It is not one number per printer. It moves with the material, which is why it
is filed here rather than under hardware. Expect to re-measure when any of
these change:[^varies]

- filament brand, and sometimes pigment within a brand
- nozzle diameter
- a large change in hotend temperature
- hotend, extruder, or the length of a Bowden tube
- whether input shaping is enabled

Different **colours** of the same filament usually need little or no
adjustment. Different **materials** always do.

[^varies]:
    The list is Ellis' — the Klipper documentation gives a shorter version of
    the same warning, noting values vary by manufacturer, pigmentation,
    extruder and nozzle.

## Typical values

> [!NOTE]
> These are Klipper's units. Marlin's `K` factor and Bambu's Flow Dynamics
> value are the same idea on a different scale — do not copy a number between
> firmwares.

Klipper describes the usual range as **0.05 to 1.0**, with the top of that
range reached essentially only by Bowden setups. A direct drive extruder
lands far nearer the bottom.

When calibrating with Klipper's tuning tower, the step per layer is normally
**0.005** for direct drive and **0.020** for a long Bowden — the Bowden number
is larger because the range being searched is larger.

> [!WARNING]
> A pressure advance value set far too high can make the extruder skip during
> ordinary acceleration. If the extruder starts clicking after a change, suspect
> the value before suspecting the hardware.

## Measuring it

Two shapes of test, and the choice matters less than doing either one properly:

- **Pattern method** — prints lines at stepped values; the correct one has an
  even width from end to end. Ellis recommends this one.
- **Tower method** — one object, value stepped by layer; you measure the height
  at which corners look best and convert it back to a value.

Bambu machines can also calibrate automatically, with a caveat worth knowing:
on the H2D, X1 and A1 the automatic pass is per-print and **is not saved** to
the filament profile, while a manual calibration is stored on the printer. The
P1 series is manual only.

Whichever route, do it on filament that is already dry and already flowing
correctly. Where this sits in the wider order is covered in
[calibrating a new filament](/kb/materials/filament-calibration).
