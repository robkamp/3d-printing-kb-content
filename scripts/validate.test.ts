/**
 * Tests for the entry validation.
 *
 * These matter more than usual. This check is the only thing standing between
 * a contributor's mistake and a broken site build they cannot see, and it is
 * the reason the content contract lives in this repository at all. A validator
 * that quietly passes everything looks identical to one that works.
 *
 * So both directions are covered: a valid entry must pass, and each individual
 * way of getting it wrong must be caught. The second is the one that rots — a
 * schema change can silently stop enforcing a field while every "valid" test
 * still passes.
 */
import { describe, expect, it } from "vitest";

import {
  checkAll,
  checkEntry,
  checkInternalLinks,
  checkNoDuplicateSteps,
  checkNoMdx,
  type EntryFile,
} from "./validate.js";

const VALID = `---
title: Filament settings and where to find them
description: Which numbers matter for a new spool.
category: materials
type: reference
date: "2026-08-07"
tags:
  - filament
difficulty: beginner
draft: false
sources:
  - label: Prusa Knowledge Base
    url: https://help.prusa3d.com/
---

Body text.
`;

const entry = (
  raw: string,
  path = "content/materials/filament-settings.md",
): EntryFile => ({
  path,
  raw,
});

/** Replace one frontmatter line, to vary a single field at a time. */
const withLine = (from: string, to: string) => VALID.replace(from, to);

describe("a valid entry", () => {
  it("passes with no problems", () => {
    expect(checkEntry(entry(VALID))).toEqual([]);
  });

  it("passes without the optional fields", () => {
    const minimal = `---
title: Minimal
description: Only the required fields.
category: hardware
type: workflow
date: "2026-08-07"
---

Body.
`;
    expect(checkEntry(entry(minimal, "content/hardware/minimal.md"))).toEqual(
      [],
    );
  });
});

describe("required fields", () => {
  it.each([
    ["title", "title: Filament settings and where to find them"],
    ["description", "description: Which numbers matter for a new spool."],
    ["category", "category: materials"],
    ["type", "type: reference"],
    ["date", 'date: "2026-08-07"'],
  ])("rejects a missing %s", (field, line) => {
    const problems = checkEntry(entry(VALID.replace(line + "\n", "")));
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.map((p) => p.message).join(" ")).toContain(field);
  });
});

describe("values outside the taxonomy", () => {
  it("rejects an unknown category and lists the allowed ones", () => {
    const problems = checkEntry(
      entry(withLine("category: materials", "category: filament")),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0].message).toContain("materials");
    expect(problems[0].message).toContain("post-processing");
  });

  it("rejects an unknown type", () => {
    const problems = checkEntry(
      entry(withLine("type: reference", "type: guide")),
    );
    expect(problems[0].message).toContain("reference");
  });

  it("rejects an unknown difficulty", () => {
    const problems = checkEntry(
      entry(withLine("difficulty: beginner", "difficulty: expert")),
    );
    expect(problems[0].message).toContain("intermediate");
  });
});

describe("field formats", () => {
  it("rejects a non-ISO date", () => {
    const problems = checkEntry(
      entry(withLine('date: "2026-08-07"', "date: 7 August 2026")),
    );
    expect(problems.length).toBeGreaterThan(0);
  });

  it("rejects a source without a full URL", () => {
    const problems = checkEntry(
      entry(
        withLine(
          "    url: https://help.prusa3d.com/",
          "    url: help.prusa3d.com",
        ),
      ),
    );
    expect(problems[0].message).toContain("URL");
  });

  it("rejects a source without a label", () => {
    const problems = checkEntry(
      entry(withLine("  - label: Prusa Knowledge Base", "  - url2: x")),
    );
    expect(problems.length).toBeGreaterThan(0);
  });

  it("accepts a source with no checked date, since it is optional", () => {
    expect(checkEntry(entry(VALID))).toEqual([]);
  });

  it("accepts a source carrying a checked date", () => {
    const problems = checkEntry(
      entry(
        withLine(
          "    url: https://help.prusa3d.com/",
          '    url: https://help.prusa3d.com/\n    checked: "2026-08-08"',
        ),
      ),
    );
    expect(problems).toEqual([]);
  });

  it("accepts an entry carrying a reviewBy date", () => {
    const problems = checkEntry(
      entry(withLine("draft: false", 'draft: false\nreviewBy: "2027-02-08"')),
    );
    expect(problems).toEqual([]);
  });

  it("rejects a reviewBy that is not an ISO date", () => {
    const problems = checkEntry(
      entry(withLine("draft: false", "draft: false\nreviewBy: February 2027")),
    );
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0].message).toContain("reviewBy");
  });

  it("rejects a checked date that is not an ISO date", () => {
    const problems = checkEntry(
      entry(
        withLine(
          "    url: https://help.prusa3d.com/",
          "    url: https://help.prusa3d.com/\n    checked: 8 August 2026",
        ),
      ),
    );
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0].message).toContain("checked");
  });
});

describe("videos", () => {
  const withVideos = (lines: string) =>
    entry(withLine("draft: false", `draft: false\n${lines}`));

  it("accepts a video with a label and a URL", () => {
    expect(
      checkEntry(
        withVideos(
          "videos:\n  - label: Flow kalibreren\n    url: https://www.youtube.com/watch?v=abc",
        ),
      ),
    ).toEqual([]);
  });

  it("accepts a video carrying a checked date", () => {
    expect(
      checkEntry(
        withVideos(
          'videos:\n  - label: Flow kalibreren\n    url: https://youtu.be/abc\n    checked: "2026-08-08"',
        ),
      ),
    ).toEqual([]);
  });

  it("rejects a video with no label", () => {
    const problems = checkEntry(
      withVideos("videos:\n  - url: https://youtu.be/abc"),
    );
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0].message).toContain("label");
  });

  it("rejects a video without a full URL", () => {
    const problems = checkEntry(
      withVideos("videos:\n  - label: Flow\n    url: youtu.be/abc"),
    );
    expect(problems[0].message).toContain("URL");
  });

  it("accepts an entry with no videos at all, since it is optional", () => {
    expect(checkEntry(entry(VALID))).toEqual([]);
  });
});

describe("series and step", () => {
  const withSeries = (lines: string) =>
    entry(withLine("draft: false", `draft: false\n${lines}`));

  it("accepts an entry with both", () => {
    expect(
      checkEntry(withSeries("series: filament-calibration\nstep: 3")),
    ).toEqual([]);
  });

  it("accepts an entry with neither, since both are optional", () => {
    expect(checkEntry(entry(VALID))).toEqual([]);
  });

  it("rejects a series with no step — it cannot be placed", () => {
    const problems = checkEntry(withSeries("series: filament-calibration"));
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0].message).toContain("no step");
  });

  it("rejects a step with no series — nothing to be a step of", () => {
    const problems = checkEntry(withSeries("step: 3"));
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0].message).toContain("no series");
  });

  it("rejects an unknown series and lists the allowed ones", () => {
    const problems = checkEntry(withSeries("series: made-up\nstep: 1"));
    expect(problems[0].message).toContain("filament-calibration");
  });

  it("rejects step zero, since steps count from 1", () => {
    const problems = checkEntry(
      withSeries("series: filament-calibration\nstep: 0"),
    );
    expect(problems.length).toBeGreaterThan(0);
  });

  it("rejects a fractional step", () => {
    const problems = checkEntry(
      withSeries("series: filament-calibration\nstep: 1.5"),
    );
    expect(problems.length).toBeGreaterThan(0);
  });
});

describe("two entries cannot claim the same step", () => {
  const at = (path: string, step: number) => ({
    path,
    series: "filament-calibration",
    step,
  });

  it("passes when every step is unique", () => {
    expect(checkNoDuplicateSteps([at("a.md", 1), at("b.md", 2)])).toEqual([]);
  });

  it("reports a collision, naming both files", () => {
    const problems = checkNoDuplicateSteps([at("a.md", 1), at("b.md", 1)]);
    expect(problems).toHaveLength(1);
    expect(problems[0].file).toBe("b.md");
    expect(problems[0].message).toContain("a.md");
  });

  it("allows the same step number in different series", () => {
    expect(
      checkNoDuplicateSteps([
        { path: "a.md", series: "filament-calibration", step: 1 },
        { path: "b.md", series: "something-else", step: 1 },
      ]),
    ).toEqual([]);
  });

  it("ignores entries that are not in a series", () => {
    expect(checkNoDuplicateSteps([{ path: "a.md" }, { path: "b.md" }])).toEqual(
      [],
    );
  });
});

describe("the folder and the category have to agree", () => {
  it("rejects an entry filed under the wrong folder", () => {
    const problems = checkEntry(
      entry(VALID, "content/hardware/filament-settings.md"),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0].message).toContain("content/materials/");
  });

  it("rejects an entry loose in the content root", () => {
    const problems = checkEntry(entry(VALID, "content/filament-settings.md"));
    expect(problems).toHaveLength(1);
    expect(problems[0].message).toContain("content root");
  });
});

describe("internal links have to point at an entry that exists", () => {
  const withBody = (path: string, body: string): EntryFile => ({
    path,
    raw: VALID.replace("Body text.", body),
  });

  const real = withBody("content/materials/filament-settings.md", "Body text.");

  it("accepts a link to an entry that is there", () => {
    expect(
      checkInternalLinks([
        real,
        withBody(
          "content/hardware/printer-settings.md",
          "See [settings](/kb/materials/filament-settings).",
        ),
      ]),
    ).toEqual([]);
  });

  // The failure this exists for: renaming a file quietly 404s every link to it.
  it("catches a link to an entry that is not there", () => {
    const problems = checkInternalLinks([
      withBody(
        "content/materials/filament-settings.md",
        "See [gone](/kb/materials/renamed-away).",
      ),
    ]);
    expect(problems).toHaveLength(1);
    expect(problems[0].message).toContain("/kb/materials/renamed-away");
  });

  // The one a human misses, because the page it names really does exist.
  it("catches the right slug filed under the wrong category", () => {
    expect(
      checkInternalLinks([
        real,
        withBody(
          "content/hardware/printer-settings.md",
          "[wrong folder](/kb/hardware/filament-settings)",
        ),
      ]),
    ).toHaveLength(1);
  });

  it("reports the line number, so it can be found", () => {
    const problems = checkInternalLinks([
      withBody(
        "content/materials/filament-settings.md",
        "one\n\ntwo\n\n[bad](/kb/materials/nope)",
      ),
    ]);
    expect(problems[0].message).toMatch(/line \d+/);
  });

  it("flags every bad link, not just the first", () => {
    expect(
      checkInternalLinks([
        withBody(
          "content/materials/filament-settings.md",
          "[a](/kb/materials/nope-one) and [b](/kb/materials/nope-two)",
        ),
      ]),
    ).toHaveLength(2);
  });

  it("leaves external links alone", () => {
    expect(
      checkInternalLinks([
        withBody(
          "content/materials/filament-settings.md",
          "[Prusa](https://help.prusa3d.com/kb/materials/whatever)",
        ),
      ]),
    ).toEqual([]);
  });

  it("runs as part of checkAll", () => {
    const problems = checkAll(
      [
        withBody(
          "content/materials/filament-settings.md",
          "[bad](/kb/materials/nope)",
        ),
      ],
      ["content/materials/filament-settings.md"],
    );
    expect(problems.length).toBeGreaterThan(0);
  });
});

describe("MDX is rejected outright", () => {
  it("flags an .mdx file", () => {
    const problems = checkNoMdx(["content/materials/thing.mdx"]);
    expect(problems).toHaveLength(1);
    expect(problems[0].message).toContain(".md");
  });

  it("leaves .md files alone", () => {
    expect(checkNoMdx(["content/materials/thing.md"])).toEqual([]);
  });

  // The site skips .mdx silently, so this must be caught here or nowhere.
  it("flags .mdx even when every .md entry is valid", () => {
    const problems = checkAll(
      [entry(VALID)],
      ["content/materials/filament-settings.md", "content/materials/oops.mdx"],
    );
    expect(problems).toHaveLength(1);
    expect(problems[0].file).toBe("content/materials/oops.mdx");
  });
});

describe("malformed frontmatter", () => {
  it("reports a parse failure without crashing", () => {
    const broken = `---
title: "unterminated
category: materials
---

Body.
`;
    const problems = checkEntry(entry(broken));
    expect(problems.length).toBeGreaterThan(0);
  });

  it("rejects a file with no frontmatter at all", () => {
    const problems = checkEntry(entry("Just a body, no frontmatter.\n"));
    expect(problems.length).toBeGreaterThan(0);
  });
});
