/**
 * Reports which entries are due to have their sources re-read.
 *
 * Run: npm run sweep
 *      npm run sweep -- --json
 *      npm run sweep -- --probe-links      (adds a network check for link rot)
 *
 * Why this exists
 * ---------------
 * An entry cites sources so its advice can be traced rather than taken on
 * faith. That only stays true if somebody occasionally re-reads them. Slicer
 * defaults change, wikis get restructured, a manufacturer revises a drying
 * temperature — and none of that produces any signal in this repository. The
 * entry goes on looking exactly as authoritative as the day it was written.
 *
 * So this turns "is any of this out of date" from something someone has to
 * remember to wonder about into something a schedule answers, in the same
 * spirit as the site repository's blocked-upgrades check.
 *
 * What it can and cannot tell you
 * -------------------------------
 * It cannot tell you whether an entry is still *correct*. Nothing automated
 * can. What it can tell you is:
 *
 *   due       - `reviewBy` has passed, so a human should re-read the sources
 *   unscheduled - the entry cites sources but sets no `reviewBy`, so it would
 *               never come up for review at all
 *   undated   - individual sources carry no `checked` date, so there is no
 *               record of anyone having read them
 *
 * Being clear about that boundary is the point. A check that claimed to
 * verify correctness and actually verified nothing would be worse than no
 * check, because it would be believed.
 *
 * Exit code is 0 whether or not anything is due. Entries coming up for review
 * is the normal state, not a failure. Exit 1 is reserved for the check itself
 * being broken — unreadable content, a malformed entry — because a check that
 * silently stops working is worse than one that is loudly absent.
 *
 * Written in TypeScript rather than Python, unlike its counterpart in the site
 * repository, so it can import `schema/frontmatter.ts` directly. A second
 * frontmatter parser here would be a second copy of the contract, and two
 * copies of a contract disagree eventually.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";

import matter from "gray-matter";

import { frontmatterSchema } from "../schema/frontmatter.js";

import { CONTENT_DIRECTORY } from "./validate.js";

/** How far ahead to look, so review lands before the date rather than after. */
export const DEFAULT_LOOKAHEAD_DAYS = 14;

export type SourceRef = {
  label: string;
  url: string;
  checked?: string;
};

export type EntrySummary = {
  path: string;
  title: string;
  reviewBy?: string;
  sources: SourceRef[];
  /** Videos the entry names. Dated like sources, and probed like them. */
  videos: SourceRef[];
  /** External links in the prose, which rot exactly as readily. */
  bodyLinks: SourceRef[];
};

/**
 * Every external link an entry contains, wherever it lives.
 *
 * Deduplicated by URL, because an entry citing a page and also linking to it in
 * a sentence should be one request and one finding, not two.
 *
 * Internal `/kb/…` links are deliberately absent: those are checked by
 * `npm run validate` on every pull request, where they belong. They need no
 * network, and a broken one is a 404 the moment it publishes rather than
 * something to discover a month later.
 */
export function externalLinksOf(entry: EntrySummary): SourceRef[] {
  const seen = new Map<string, SourceRef>();

  for (const link of [...entry.sources, ...entry.videos, ...entry.bodyLinks]) {
    if (!seen.has(link.url)) seen.set(link.url, link);
  }

  return [...seen.values()];
}

/**
 * Links in the Markdown body, as opposed to the frontmatter.
 *
 * Matches `[text](url)` and bare autolinks. Trailing punctuation is trimmed
 * because a sentence ending "see https://example.com." would otherwise be
 * probed with the full stop attached and reported as dead.
 */
export function bodyLinksIn(markdown: string): SourceRef[] {
  const found: SourceRef[] = [];

  for (const match of markdown.matchAll(
    /\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,
  )) {
    found.push({ label: match[1] || match[2], url: match[2] });
  }

  for (const match of markdown.matchAll(/<(https?:\/\/[^>\s]+)>/g)) {
    found.push({ label: match[1], url: match[1] });
  }

  return found.map((link) => ({
    ...link,
    url: link.url.replace(/[.,;:!?]+$/, ""),
  }));
}

export type Verdict = "due" | "unscheduled" | "current";

export type Assessment = {
  path: string;
  title: string;
  verdict: Verdict;
  reviewBy?: string;
  /** Negative when already overdue. */
  daysUntilReview?: number;
  /** Labels of sources with no `checked` date. */
  undatedSources: string[];
  /** Oldest `checked` date across this entry's sources, if any are dated. */
  oldestChecked?: string;
};

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Whole days from `from` to `to`, both ISO `YYYY-MM-DD`.
 *
 * Parsed as UTC deliberately. Using local time would make the result depend on
 * the runner's timezone, so a sweep could report a different answer in CI than
 * on the machine it was written on.
 */
export function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      MILLISECONDS_PER_DAY,
  );
}

/**
 * Decide what each entry needs, as of `today`.
 *
 * `today` is a parameter rather than read from the clock so the tests are
 * deterministic — a sweep whose result depends on the day it runs cannot be
 * tested, only observed.
 */
export function assess(
  entries: EntrySummary[],
  today: string,
  lookaheadDays: number = DEFAULT_LOOKAHEAD_DAYS,
): Assessment[] {
  return (
    entries
      // An entry citing nothing has nothing to sweep. That is not a fault —
      // plenty of entries are a maintainer's own experience — so it is silently
      // out of scope rather than reported as a problem.
      .filter((entry) => entry.sources.length > 0)
      .map((entry) => {
        const undatedSources = entry.sources
          .filter((source) => !source.checked)
          .map((source) => source.label);

        const dated = entry.sources
          .map((source) => source.checked)
          .filter((checked): checked is string => Boolean(checked))
          .sort();

        const base = {
          path: entry.path,
          title: entry.title,
          undatedSources,
          oldestChecked: dated[0],
        };

        if (!entry.reviewBy) {
          return { ...base, verdict: "unscheduled" as const };
        }

        const daysUntilReview = daysBetween(today, entry.reviewBy);

        return {
          ...base,
          reviewBy: entry.reviewBy,
          daysUntilReview,
          verdict:
            daysUntilReview <= lookaheadDays
              ? ("due" as const)
              : ("current" as const),
        };
      })
  );
}

/** Entries needing a human, most overdue first. */
export function needsAttention(assessments: Assessment[]): Assessment[] {
  return assessments
    .filter((a) => a.verdict !== "current")
    .sort((a, b) => (a.daysUntilReview ?? 0) - (b.daysUntilReview ?? 0));
}

// --- Link probing -----------------------------------------------------------

export type LinkResult = {
  url: string;
  label: string;
  status: number | "unreachable";
  /** True only for statuses that really mean the page is gone. */
  rotted: boolean;
};

/**
 * Statuses that mean the page is genuinely gone, as opposed to the request
 * being turned away.
 *
 * 401/402/403/429 are deliberately NOT here. Wikis and documentation sites
 * routinely block unattended requests, and both bambulab.com and prusa3d.com
 * were observed doing exactly that while these entries were being written.
 * Treating a bot block as link rot would fill the issue with false alarms, and
 * a check that cries wolf gets ignored, which costs more than it gives.
 */
const ROT_STATUSES = new Set([404, 410]);

export function isRot(status: number | "unreachable"): boolean {
  return status !== "unreachable" && ROT_STATUSES.has(status);
}

export async function probe(
  source: SourceRef,
  fetchImpl: typeof fetch = fetch,
): Promise<LinkResult> {
  try {
    // HEAD first because it is cheap; some servers reject it, so fall back.
    let response = await fetchImpl(source.url, {
      method: "HEAD",
      redirect: "follow",
    });
    if (response.status === 405 || response.status === 501) {
      response = await fetchImpl(source.url, {
        method: "GET",
        redirect: "follow",
      });
    }
    return {
      url: source.url,
      label: source.label,
      status: response.status,
      rotted: isRot(response.status),
    };
  } catch {
    // A network failure is not evidence about the link. Reported, never rot.
    return {
      url: source.url,
      label: source.label,
      status: "unreachable",
      rotted: false,
    };
  }
}

// --- Reading the entries ----------------------------------------------------

function markdownPaths(root: string, directory: string): string[] {
  const absolute = join(root, directory);
  return readdirSync(absolute, { recursive: true, withFileTypes: true })
    .filter((item) => item.isFile() && item.name.endsWith(".md"))
    .map((item) =>
      relative(root, join(item.parentPath ?? absolute, item.name))
        .split(sep)
        .join("/"),
    );
}

export function readEntries(root: string): EntrySummary[] {
  return markdownPaths(root, CONTENT_DIRECTORY).map((path) => {
    const file = matter(readFileSync(join(root, path), "utf8"));
    const parsed = frontmatterSchema.safeParse(file.data);
    if (!parsed.success) {
      // `npm run validate` is what reports bad entries, with a good message.
      // Failing loudly here keeps this from quietly sweeping a subset.
      throw new Error(
        `${path} does not satisfy the entry contract — run \`npm run validate\``,
      );
    }
    return {
      path,
      title: parsed.data.title,
      reviewBy: parsed.data.reviewBy,
      sources: parsed.data.sources ?? [],
      videos: parsed.data.videos ?? [],
      bodyLinks: bodyLinksIn(file.content),
    };
  });
}

// --- Reporting --------------------------------------------------------------

export function describe(assessment: Assessment): string {
  if (assessment.verdict === "unscheduled") {
    return "has no reviewBy set, so it would never come up for review";
  }
  const days = assessment.daysUntilReview ?? 0;
  if (days < 0)
    return `overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
  if (days === 0) return "due today";
  return `due in ${days} day${days === 1 ? "" : "s"}`;
}

/**
 * The body of the issue the scheduled sweep opens.
 *
 * Empty string when nothing needs attention, so the workflow has a single
 * unambiguous signal for "do not open an issue" rather than having to
 * interpret a report.
 *
 * It says what to do, not just what is wrong. An issue that reports a date has
 * passed and leaves the reader to work out the remedy tends to get closed
 * rather than acted on.
 */
export function issueBody(
  attention: Assessment[],
  rotted: LinkResult[],
  on: string,
): string {
  if (attention.length === 0 && rotted.length === 0) return "";

  const lines = [
    `Swept on ${on}. This is a reminder to re-read sources, not a report of anything being broken — the site is fine either way.`,
    "",
  ];

  if (attention.length > 0) {
    lines.push("## Entries to re-read", "");
    for (const item of attention) {
      lines.push(
        `### \`${item.path}\``,
        "",
        `**${item.title}** — ${describe(item)}.`,
        "",
      );
      if (item.oldestChecked) {
        lines.push(`Oldest source last checked \`${item.oldestChecked}\`.`, "");
      }
      if (item.undatedSources.length > 0) {
        lines.push(
          `No \`checked\` date on: ${item.undatedSources.map((s) => `_${s}_`).join(", ")}.`,
          "",
        );
      }
    }
    lines.push(
      "For each: open the sources, confirm the entry still matches them, then update the `checked` dates and push `reviewBy` forward. If a source has changed, the fix is an edit to the entry, not just a new date.",
      "",
    );
  }

  if (rotted.length > 0) {
    lines.push(
      "## Links that appear gone",
      "",
      "These returned 404 or 410. Statuses that usually mean a bot block (401/402/403/429) are deliberately excluded, so these are worth actually looking at.",
      "",
    );
    for (const link of rotted) {
      lines.push(`- \`${link.status}\` [${link.label}](${link.url})`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function main(argv: string[]): Promise<number> {
  const asJson = argv.includes("--json");
  const asIssueBody = argv.includes("--issue-body");
  // The issue is the only place link rot would surface, so probing is implied.
  const probeLinks = argv.includes("--probe-links") || asIssueBody;
  const root = join(import.meta.dirname, "..");

  const entries = readEntries(root);
  const assessments = assess(entries, today());
  const attention = needsAttention(assessments);

  const links: LinkResult[] = [];
  if (probeLinks) {
    for (const entry of entries) {
      for (const link of externalLinksOf(entry)) {
        links.push(await probe(link));
      }
    }
  }
  const rotted = links.filter((link) => link.rotted);

  if (asIssueBody) {
    // Prints nothing at all when there is nothing to say, so the workflow can
    // test for an empty file rather than parse a report.
    process.stdout.write(issueBody(attention, rotted, today()));
    return 0;
  }

  if (asJson) {
    console.log(
      JSON.stringify(
        { checkedOn: today(), assessments, links, rotted },
        undefined,
        2,
      ),
    );
    return 0;
  }

  if (attention.length === 0) {
    console.log(
      `✓ ${assessments.length} entries with sources, none due for review.`,
    );
  } else {
    for (const item of attention) {
      console.log(`[${item.path}] ${describe(item)}`);
      console.log(`    ${item.title}`);
      if (item.undatedSources.length > 0) {
        console.log(`    undated sources: ${item.undatedSources.join(", ")}`);
      }
    }
    console.log(
      `\n${attention.length} of ${assessments.length} entries need a look.`,
    );
  }

  if (probeLinks) {
    console.log(
      `\nProbed ${links.length} source links; ${rotted.length} look genuinely gone.`,
    );
    for (const link of rotted) {
      console.log(`  ${link.status}  ${link.label} — ${link.url}`);
    }
    const turnedAway = links.filter(
      (link) =>
        !link.rotted && (link.status === "unreachable" || link.status >= 400),
    );
    if (turnedAway.length > 0) {
      console.log(
        `  (${turnedAway.length} more returned an error that usually means a bot block, not rot — not reported as rotted.)`,
      );
    }
  }

  // Due entries are the normal state, so they are not a failure. Only the
  // check being broken is, and that path throws rather than returning.
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error: unknown) => {
      console.error(`✗ the freshness check itself failed: ${String(error)}`);
      process.exit(1);
    },
  );
}
