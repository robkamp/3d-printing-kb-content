---
title: Filament settings and where to find them
description: Which numbers actually matter for a new spool, and the order to trust your sources in when they disagree.
category: materials
type: reference
date: "2026-08-07"
updated: "2026-08-07"
tags:
  - filament
  - temperature
  - profiles
difficulty: beginner
draft: false
sources:
  - label: Prusa Knowledge Base
    url: https://help.prusa3d.com/
  - label: Bambu Lab Wiki
    url: https://wiki.bambulab.com/
---

> Placeholder entry — exists to prove the content pipeline works end to end.
> Replace the body with real notes.

## The settings that matter

For most FDM filament, four numbers do the majority of the work:

- **Nozzle temperature** — usually given as a range, not a single value
- **Bed temperature**
- **Flow / extrusion multiplier**
- **Maximum volumetric speed** — the one most often left at a default that
  quietly limits print speed

Typical starting points for the common materials, to be confirmed against the
spool rather than trusted outright:

| Material | Nozzle    | Bed      | Enclosure  |
| -------- | --------- | -------- | ---------- |
| PLA      | 200–220 ℃ | 55–60 ℃  | Not needed |
| PETG     | 230–250 ℃ | 70–85 ℃  | Helps      |
| ASA/ABS  | 240–260 ℃ | 95–110 ℃ | Required   |

~~Never print PETG without a bed adhesion strategy~~ — that turned out to be
overstated; a clean bed and the right first-layer height is usually enough.

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
