---
title: Retraction settings, and why the numbers vary so much
description: Direct drive against Bowden, why published figures disagree by a factor of eight, and what makes the difference.
category: hardware
type: reference
date: "2026-08-08"
tags:
  - retraction
  - stringing
  - extruder
difficulty: intermediate
reviewBy: "2027-08-08"
sources:
  - label: Ellis' Print Tuning Guide — Retraction
    url: https://ellis3dp.com/Print-Tuning-Guide/articles/retraction.html
    checked: "2026-08-08"
  - label: Klipper — Pressure Advance
    url: https://www.klipper3d.org/Pressure_Advance.html
    checked: "2026-08-08"
---

Retraction pulls filament back when the nozzle travels, so pressure in the
melt drops and the nozzle stops oozing. Two numbers control it: how far, and
how fast.

Published starting values disagree wildly — the same "recommended Bowden
distance" appears as 1 mm in one guide and 8 mm in another. That is not
carelessness, and understanding why is more useful than picking a number.

## The mechanical part: where the movement goes

In a **direct drive** extruder the gears sit centimetres from the melt zone.
Retract 1 mm and roughly 1 mm happens at the nozzle.

In a **Bowden** setup the filament travels down a PTFE tube. Filament
compresses, the tube flexes, and there is clearance in the fittings. Much of a
5 mm retraction is absorbed by that slack before anything happens at the
nozzle — so Bowden needs a larger commanded distance to achieve the same
result.

That accounts for Bowden numbers being larger. It does not account for the
factor of eight.

## The part that actually explains the disagreement

> [!IMPORTANT]
> Pressure advance substantially reduces how much retraction is needed,
> especially on Bowden. Guides written for a tuned machine publish small
> numbers; guides written for an untuned one publish large ones. They are
> describing different printers.

Which is why the ranges look irreconcilable:

| Source                                    | Direct drive     | Bowden           |
| ----------------------------------------- | ---------------- | ---------------- |
| Ellis, assuming pressure advance is tuned | 0.5 mm, under 1 mm | 1 mm            |
| General guidance, no such assumption      | 0.5–2 mm         | 4–8 mm           |

Both are honest. If you have tuned
[pressure advance](/kb/materials/pressure-advance), start low — the large
numbers will over-retract. If you have not, expect to need the larger ones,
and consider tuning pressure advance first instead.

Speed is less contested: around **35 mm/s** is a reasonable starting point for
either arrangement.

## Why more is not safer

Over-retraction has its own failure modes, and they are worse than stringing
because they look like something else.

- **Heat creep and clogs** — repeatedly pulling molten filament up into the
  cold zone lets it solidify where the path narrows. The print fails much
  later, and looks like a jam rather than a settings problem.
- **Gaps at the start of perimeters** — the pressure removed has to be rebuilt
  before plastic arrives, leaving the first millimetre thin.
- **Filament grinding** — enough retractions in one spot chew a flat into the
  filament, after which the extruder cannot grip it.

> [!WARNING]
> Stringing that no retraction setting improves is usually **wet filament**,
> not under-retraction. Increasing distance to chase it is how printers end up
> with heat creep clogs and a stringing problem they still have. Check
> [is this filament wet?](/kb/materials/wet-filament-diagnosis) first.

## Testing it

Print a retraction tower — a model with two or more towers separated by a gap,
so every layer forces a travel move — stepping the distance up the object.

Then a judgement worth knowing: **pick a value one or two steps above where
stringing disappears**, not the exact threshold. Filament varies spool to
spool, and the margin costs nothing.

Retract as little as achieves a clean result. The goal is the smallest number
that works, not the largest that seems safe.

## What will not be fixed

Some materials string regardless. PETG is the usual example — it can leave
fine wisps at any sane setting, and the remedy is a heat gun or a quick pass
with a lighter after the print, not another evening of tuning.

Where retraction sits relative to everything else is in
[calibrating a new filament](/kb/materials/filament-calibration).
