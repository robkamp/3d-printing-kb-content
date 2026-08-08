/**
 * Tests for the source freshness sweep.
 *
 * Same reasoning as the validator's tests, and the same failure mode to guard
 * against: a sweep that reports "nothing due" every week is indistinguishable
 * from one that works, right up until the moment somebody relies on it.
 *
 * So the cases that must report something are covered as carefully as the ones
 * that must stay quiet. `today` is injected everywhere rather than read from
 * the clock — a test whose result changes tomorrow is not a test.
 */
import { describe as group, expect, it, vi } from "vitest";

import {
  assess,
  daysBetween,
  describe,
  isRot,
  issueBody,
  needsAttention,
  probe,
  type EntrySummary,
} from "./check-source-freshness.js";

const TODAY = "2026-08-08";

const entry = (over: Partial<EntrySummary> = {}): EntrySummary => ({
  path: "content/materials/example.md",
  title: "Example",
  sources: [
    { label: "Klipper", url: "https://example.com", checked: "2026-08-08" },
  ],
  reviewBy: "2027-02-08",
  ...over,
});

group("counting days", () => {
  it("counts forward", () => {
    expect(daysBetween("2026-08-08", "2026-08-18")).toBe(10);
  });

  it("counts backward as negative", () => {
    expect(daysBetween("2026-08-08", "2026-07-29")).toBe(-10);
  });

  it("is zero for the same day", () => {
    expect(daysBetween("2026-08-08", "2026-08-08")).toBe(0);
  });

  it("crosses a month boundary correctly", () => {
    expect(daysBetween("2026-08-30", "2026-09-02")).toBe(3);
  });

  it("does not depend on the local timezone", () => {
    // Both parsed as UTC, so a runner in UTC+13 gets the same answer.
    expect(daysBetween("2026-01-01", "2026-12-31")).toBe(364);
  });
});

group("deciding what needs attention", () => {
  it("leaves an entry alone when its review is far off", () => {
    const [result] = assess([entry()], TODAY);
    expect(result.verdict).toBe("current");
  });

  it("flags an entry whose reviewBy has passed", () => {
    const [result] = assess([entry({ reviewBy: "2026-07-01" })], TODAY);
    expect(result.verdict).toBe("due");
    expect(result.daysUntilReview).toBeLessThan(0);
  });

  it("flags an entry due within the lookahead, before the date arrives", () => {
    const [result] = assess([entry({ reviewBy: "2026-08-15" })], TODAY);
    expect(result.verdict).toBe("due");
  });

  it("does not flag one just outside the lookahead", () => {
    const [result] = assess([entry({ reviewBy: "2026-08-30" })], TODAY);
    expect(result.verdict).toBe("current");
  });

  it("flags an entry that cites sources but sets no reviewBy", () => {
    const [result] = assess([entry({ reviewBy: undefined })], TODAY);
    expect(result.verdict).toBe("unscheduled");
  });

  it("ignores an entry with no sources at all", () => {
    expect(assess([entry({ sources: [] })], TODAY)).toHaveLength(0);
  });

  it("names sources that carry no checked date", () => {
    const [result] = assess(
      [
        entry({
          sources: [
            { label: "Dated", url: "https://a.example", checked: "2026-08-08" },
            { label: "Undated", url: "https://b.example" },
          ],
        }),
      ],
      TODAY,
    );
    expect(result.undatedSources).toEqual(["Undated"]);
  });

  it("reports the oldest checked date, since that is the weakest link", () => {
    const [result] = assess(
      [
        entry({
          sources: [
            {
              label: "Recent",
              url: "https://a.example",
              checked: "2026-08-08",
            },
            { label: "Older", url: "https://b.example", checked: "2025-01-01" },
          ],
        }),
      ],
      TODAY,
    );
    expect(result.oldestChecked).toBe("2025-01-01");
  });
});

group("ordering", () => {
  it("puts the most overdue first", () => {
    const results = needsAttention(
      assess(
        [
          entry({ path: "a.md", reviewBy: "2026-08-01" }),
          entry({ path: "b.md", reviewBy: "2026-01-01" }),
        ],
        TODAY,
      ),
    );
    expect(results.map((r) => r.path)).toEqual(["b.md", "a.md"]);
  });

  it("excludes entries that are current", () => {
    const results = needsAttention(
      assess([entry({ reviewBy: "2030-01-01" })], TODAY),
    );
    expect(results).toEqual([]);
  });
});

group("wording", () => {
  it("says how overdue, in whole days", () => {
    const [result] = assess([entry({ reviewBy: "2026-08-01" })], TODAY);
    expect(describe(result)).toBe("overdue by 7 days");
  });

  it("uses the singular for one day", () => {
    const [result] = assess([entry({ reviewBy: "2026-08-07" })], TODAY);
    expect(describe(result)).toBe("overdue by 1 day");
  });

  it("says due today rather than in 0 days", () => {
    const [result] = assess([entry({ reviewBy: TODAY })], TODAY);
    expect(describe(result)).toBe("due today");
  });

  it("explains an unscheduled entry rather than showing a date", () => {
    const [result] = assess([entry({ reviewBy: undefined })], TODAY);
    expect(describe(result)).toContain("never come up for review");
  });
});

group("the issue body", () => {
  const due = () =>
    needsAttention(assess([entry({ reviewBy: "2026-08-01" })], TODAY));

  it("is empty when nothing needs attention, so no issue gets opened", () => {
    expect(issueBody([], [], TODAY)).toBe("");
  });

  it("is NOT empty when something is due", () => {
    expect(issueBody(due(), [], TODAY)).not.toBe("");
  });

  it("names the file and how overdue it is", () => {
    const body = issueBody(due(), [], TODAY);
    expect(body).toContain("content/materials/example.md");
    expect(body).toContain("overdue by 7 days");
  });

  it("says what to do about it, not just what is wrong", () => {
    expect(issueBody(due(), [], TODAY)).toContain("reviewBy");
  });

  it("makes clear the site is not broken", () => {
    expect(issueBody(due(), [], TODAY)).toContain(
      "not a report of anything being broken",
    );
  });

  it("lists rotted links when there are any", () => {
    const body = issueBody(
      [],
      [
        {
          url: "https://gone.example",
          label: "Gone",
          status: 404,
          rotted: true,
        },
      ],
      TODAY,
    );
    expect(body).toContain("Gone");
    expect(body).toContain("404");
  });

  it("opens an issue for rot even when no entry is due", () => {
    const body = issueBody(
      [],
      [
        {
          url: "https://gone.example",
          label: "Gone",
          status: 410,
          rotted: true,
        },
      ],
      TODAY,
    );
    expect(body).not.toBe("");
  });
});

group("link probing", () => {
  it("treats 404 and 410 as genuine rot", () => {
    expect(isRot(404)).toBe(true);
    expect(isRot(410)).toBe(true);
  });

  it("does NOT treat a bot block as rot", () => {
    // Observed live on bambulab.com (402) and other doc sites (403) — calling
    // these rot would fill the issue with false alarms.
    for (const status of [401, 402, 403, 429]) {
      expect(isRot(status)).toBe(false);
    }
  });

  it("does not treat an unreachable host as rot", () => {
    expect(isRot("unreachable")).toBe(false);
  });

  it("reports a live link as fine", async () => {
    const fake = vi.fn().mockResolvedValue({ status: 200 } as Response);
    const result = await probe(
      { label: "x", url: "https://example.com" },
      fake as unknown as typeof fetch,
    );
    expect(result).toMatchObject({ status: 200, rotted: false });
  });

  it("falls back to GET when HEAD is rejected", async () => {
    const fake = vi
      .fn()
      .mockResolvedValueOnce({ status: 405 } as Response)
      .mockResolvedValueOnce({ status: 200 } as Response);
    const result = await probe(
      { label: "x", url: "https://example.com" },
      fake as unknown as typeof fetch,
    );
    expect(fake).toHaveBeenCalledTimes(2);
    expect(result.status).toBe(200);
  });

  it("reports a thrown network error without calling it rot", async () => {
    const fake = vi.fn().mockRejectedValue(new Error("ENOTFOUND"));
    const result = await probe(
      { label: "x", url: "https://example.com" },
      fake as unknown as typeof fetch,
    );
    expect(result).toMatchObject({ status: "unreachable", rotted: false });
  });
});
