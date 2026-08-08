---
title: Drying filament
description: How to dry a spool without deforming it, and why the published temperatures disagree with each other.
category: materials
type: workflow
date: "2026-08-08"
tags:
  - filament
  - drying
  - moisture
difficulty: beginner
sources:
  - label: Bambu Lab Wiki — Drying function (AMS 2 Pro and AMS HT)
    url: https://wiki.bambulab.com/en/ams-2-pro/manual/drying-function
    checked: "2026-08-08"
  - label: Polymaker Wiki — Wet filament
    url: https://wiki.polymaker.com/printing-tips/common-printing-issues/wet-filament
    checked: "2026-08-08"
  - label: Prusa Knowledge Base
    url: https://help.prusa3d.com/
    checked: "2026-08-08"
---

Drying is the first step of calibrating a spool, because every measurement
after it is otherwise measuring the water. It is also the step most likely to
destroy the spool if done carelessly.

## The temperature that matters is not the filament's

> [!CAUTION]
> PLA's glass transition is around **60 °C**. Dry it above that and the strands
> fuse to each other on the spool and the spool itself goes oval — which ruins
> the whole roll, not just the outer layer. Stay near 45–50 °C.

The same logic applies to every material: the ceiling is the point where the
plastic softens, and you want to sit comfortably below it, not just underneath
it. Heat only has to excite the water, not the plastic.

## Temperatures and times

> [!IMPORTANT]
> Published figures genuinely disagree, and this table takes the **lower,
> safer** end where they do. Treat your filament's own data sheet as
> authoritative over any general table, including this one.

| Material   | Temperature  | Time      | Note                                   |
| ---------- | ------------ | --------- | -------------------------------------- |
| PLA        | 45 °C        | 6 h       | Bambu's dryer picks 45 °C automatically |
| PETG       | 55–65 °C     | 6 h       | See the disagreement below             |
| ABS / ASA  | 70 °C        | 4 h       | Ventilate — see the warning            |
| TPU        | 55–70 °C     | 8 h       | Wide spread between sources            |
| PA (nylon) | 75–80 °C     | 8–16 h    | The most hygroscopic common material   |
| PVA        | Lower than the above | — | Softens early; check the spec       |

The **PETG** figure is the clearest disagreement: Bambu's dryer sets 55 °C
automatically and Prusa's guidance is in the same region, while most
general-purpose drying charts print 65 °C. Both work. The lower number is
slower and cannot deform the spool; the higher one is faster and leaves less
margin. Start low.

**PA** ranges from 75 °C to 95 °C across sources depending on whether the
advice is aimed at a consumer dryer or an industrial one. Bambu's own figure
for PA is 75 °C for 8 hours.

## Know your dryer's ceiling

Hardware limits bite before material limits do.

- The **AMS 2 Pro** tops out at **65 °C**, and only reaches that when the room
  is at 25 °C or warmer — in a cold workshop it will quietly fall short.
- The **AMS HT** reaches **85 °C**, which is what makes nylon practical.

A dryer that cannot reach the temperature a material needs will run for eight
hours and achieve very little. That is worth checking before blaming the
filament.

> [!WARNING]
> ABS, ASA and nylon off-gas when heated. Dry them somewhere ventilated, not in
> a closed room you are sitting in.

## Getting the heat in evenly

A spool is a poor conductor and the heat reaches the outside first. Bambu's
guidance for their own dryer is to feed the filament out of the unit and rotate
the spool about **30° every 5 minutes**, which is tedious but noticeably more
even than leaving it still.

Failing that, longer at a lower temperature beats shorter at a higher one.

## Some materials need drying while they print

Nylon, PVA, TPU and PETG re-absorb moisture fast enough that in a humid room
they can be wet again before a long print finishes. Nylon is the extreme case —
it can pick up enough water in half an hour of open air to show in the print.

For those, a heated dry box that feeds the printer directly is the fix, not a
dry-then-print cycle.

## Storing it afterwards

Drying is undone by leaving the spool out. Airtight boxes or vacuum bags with
desiccant, and keep the desiccant fresh — silica gel that has already absorbed
its fill is just a bag of beads.

Whether a spool actually needs drying in the first place is covered in
[is this filament wet?](/kb/materials/wet-filament-diagnosis).
