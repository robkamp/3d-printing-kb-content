---
title: Calibrating the extruder
description: The one calibration that belongs to the machine rather than the spool, and the one every other measurement sits on top of.
category: hardware
type: workflow
date: "2026-08-08"
tags:
  - extruder
  - calibration
  - e-steps
difficulty: intermediate
series: filament-calibration
step: 3
reviewBy: "2027-08-08"
sources:
  - label: Ellis' Print Tuning Guide — Extruder calibration
    url: https://ellis3dp.com/Print-Tuning-Guide/articles/extruder_calibration.html
    checked: "2026-08-08"
  - label: Klipper — Rotation distance
    url: https://www.klipper3d.org/Rotation_Distance.html
    checked: "2026-08-08"
---

Ask the printer for 100 mm of filament and it should pull in 100 mm. E-steps —
`rotation_distance` in Klipper — is the number that makes that true.

It is a property of the **machine**: the motor, the gear ratio, the hobbed
wheel. Set it once, then leave it until the hardware changes.

> [!IMPORTANT]
> Everything else in filament calibration assumes this is right. Flow rate
> tuned on a mis-calibrated extruder absorbs the error, and then every future
> spool is wrong by a different amount with nothing to indicate why. This is
> the reason it sits at the bottom of
> [why calibration has an order](/kb/slicing/calibration-order).

## Before you start

- Heat the hotend to the material's normal printing temperature. Cold
  extrusion is possible with the nozzle removed, but hot is more
  representative.
- **Klipper only:** raise `max_extrude_only_distance` to just over your test
  length — 101 for a 100 mm test — or the command is refused.
- Release any filament sensor or runout guard that would interrupt a long
  extrude.

## The measurement

1. Mark the filament **120 mm** above the extruder inlet, with tape or a fine
   marker.
2. Extrude **100 mm slowly**. Speed matters here — Ellis specifies **1 mm/s**,
   which is `G1 E100 F60`. Fast extrusion measures the hotend's flow limit
   rather than the extruder's accuracy.
3. Measure from the inlet to your mark again. **20 mm** means it was exact.
4. Actual extruded = 120 − (what you measured).

So if 21 mm remains, it moved 99 mm rather than 100.

> [!TIP]
> Klipper's own documentation uses a shorter version — mark at 70 mm, extrude
> 50 mm with `G1 E50 F60`. Same method, less filament. Use whichever, but keep
> the number you asked for and the number you divide by consistent.

## The arithmetic, and the trap in it

The two firmwares divide in opposite directions. This catches people, because
the numbers look similar and a wrong one still prints.

| Firmware              | Formula                                              |
| --------------------- | ---------------------------------------------------- |
| Marlin, RepRapFirmware | `new e-steps = current × (100 / actual)`             |
| Klipper               | `new rotation_distance = current × (actual / 100)`   |

> [!WARNING]
> They are inverses of each other. E-steps say *steps per mm*, so under-
> extrusion means you need **more**. `rotation_distance` says *mm per
> revolution*, so under-extrusion means you need **less**. Applying Marlin's
> formula to a Klipper config moves the value the wrong way, and the second
> test will look worse than the first.

Worked, for 99 mm actual:

```
Marlin   new = 93.0 × (100 / 99)  = 93.94
Klipper  new = 22.678 × (99 / 100) = 22.451
```

Klipper's documentation asks for three decimal places.

## Saving it

- **Marlin:** `M92 E93.94`, then `M500` to persist. Without `M500` it is lost
  at the next power cycle.
- **Klipper:** edit `rotation_distance` in `printer.cfg`, save, restart.

Converting an existing Marlin figure rather than measuring:

```
rotation_distance = full_steps_per_rotation × microsteps / steps_per_mm
```

Usually 200 full steps and 16 microsteps.

## Repeat it

Measure again after changing it. Klipper's guidance is to repeat whenever the
result is off by more than 2 mm; in practice, keep going until two runs agree.

Readings that scatter between runs are not a calibration problem. That is
slipping, a partial clog, or grip pressure — and no number will fix it.

## When to redo this

Only when the hardware changes: a new extruder, different gears, a new hobbed
wheel, or a stepper swap. It does not move with filament.

That is the whole distinction — this belongs to the printer, and
[flow rate](/kb/materials/flow-rate-calibration) belongs to the spool. Using
one to correct the other is the mistake this entry exists to prevent.
