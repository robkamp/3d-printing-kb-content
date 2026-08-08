---
title: Filament settings and where to find them
description: Which numbers actually matter for a new spool, and the order to trust your sources in when they disagree.
category: materials
type: reference
date: "2026-08-07"
updated: "2026-08-08"
tags:
  - filament
  - temperature
  - profiles
difficulty: beginner
draft: false
reviewBy: "2027-08-08"
sources:
  - label: Prusa Knowledge Base — Filament material guide
    url: https://help.prusa3d.com/filament-material-guide
    checked: "2026-08-08"
  - label: Bambu Lab Wiki — ABS / ASA / PC usage guide
    url: https://wiki.bambulab.com/en/filament/abs_asa_pc
---

## The settings that matter

For most FDM filament, four numbers do the majority of the work:

- **Nozzle temperature** — usually given as a range, not a single value
- **Bed temperature**
- **Flow / extrusion multiplier**
- **Maximum volumetric speed** — the one most often left at a default that
  quietly limits print speed

Two numbers per material, and they are not the same number. The **envelope**
is what the manufacturer says the material tolerates; the **starting point** is
where to actually begin. Prusa's published envelopes, with a narrower practical
range beside them:[^prusa]

| Material | Envelope (nozzle) | Start at | Envelope (bed) | Enclosure   |
| -------- | ----------------- | -------- | -------------- | ----------- |
| PLA      | 185–235 ℃         | ~210 ℃   | 50–60 ℃        | Not needed  |
| PETG     | 215–270 ℃         | ~240 ℃   | 70–90 ℃        | Helps       |
| ASA      | 220–275 ℃         | ~250 ℃   | 90–110 ℃       | See below   |
| ABS      | 230–255 ℃         | ~245 ℃   | 95–110 ℃       | See below   |

[^prusa]:
    Envelopes are Prusa's filament material guide, checked 2026-08-08. The
    starting points are not theirs — they are the middle of each range, which
    is where a temperature tower normally lands for a generic spool of that
    material. Treat them as a place to begin the tower, not an answer.

**ASA and ABS are not interchangeable**, which is worth saying because they are
usually printed on the same profile. ASA tolerates a wider nozzle range and
wants a slightly cooler bed than ABS.

> [!NOTE]
> Sources disagree about whether an enclosure is **required** for ASA and ABS.
> Prusa lists it as recommended; most community guidance treats it as
> mandatory, and Bambu notes outright that large ABS or ASA parts warp and
> crack on their open-frame machines. The disagreement is really about part
> size — a small ASA bracket prints fine in open air, and a large one does not.

## Where to find them, in order of trust

1. **The spool label.** Nearly every manufacturer prints a recommended nozzle
   and bed range directly on the spool or its packaging.
2. **The manufacturer's technical data sheet.** More detail than the label,
   including the properties that matter for functional parts.
3. **The slicer's bundled material profile.** Convenient, but it is a generic
   profile for a material _class_, not for the specific spool in your hands.
4. **Community profiles.** Useful, frequently untraceable. Treat as a starting
   point to test, not as an answer.

When these disagree, prefer the manufacturer's own figure for the specific
filament, then confirm it by testing rather than assuming.

## Why a range, not a number

> [!WARNING]
> Never exceed your hotend's rated maximum to chase a manufacturer's figure.
> A standard PTFE-lined hotend degrades above roughly 240 °C, and the lining
> gives off fumes as it does. Filaments that ask for more — polycarbonate,
> some nylons — need an all-metal hotend, not a hotter setting.

> [!TIP]
> If layer adhesion and stringing both look wrong at every temperature in the
> range, the filament is usually damp rather than mis-tuned. Dry it before
> spending an evening on a temperature tower.

A published range like `200–220 °C` is not indecision. Hotter generally means
better layer adhesion and worse overhang and stringing behaviour; cooler is the
reverse. The right value within the range depends on your printer, the part,
and how fast you are printing it — which is what
[calibrating a new filament](/kb/materials/filament-calibration) is for.
