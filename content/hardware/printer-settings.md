---
title: Printer settings and where to find them
description: Which settings belong to the machine rather than the filament, and why that distinction matters.
category: hardware
type: reference
date: "2026-08-07"
---

> Placeholder entry — exists to prove the content pipeline works end to end.
> Replace the body with real notes. This entry deliberately sets no optional
> frontmatter, so the schema defaults (`tags: []`, `draft: false`) are exercised.

## Machine settings vs. material settings

A setting belongs to the **printer** if it stays correct when you swap
filament, and to the **material** if it does not.

Machine settings, roughly:

- Bed size, shape and origin
- Nozzle diameter
- Kinematics and maximum acceleration / jerk
- Input shaping and pressure advance calibration
- Z-offset / first layer height

Material settings change per spool — see
[filament settings and where to find them](/kb/materials/filament-settings).

## Where they live

Machine settings are split across two places, which is the usual source of
confusion:

- **Printer firmware** — held on the printer itself, survives a slicer
  reinstall, and is what the machine actually obeys.
- **Slicer printer profile** — the slicer's model of your machine. It has to
  agree with the firmware, but nothing enforces that.

When a value appears to be ignored, the usual cause is that firmware is
overriding what the slicer sent, or the two disagree about nozzle diameter.
