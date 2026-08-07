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
