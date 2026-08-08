/**
 * Validates every entry in `content/` against the contract in `schema/`.
 *
 * Run: npm run validate
 *
 * This is the whole point of the content contract living in this repository.
 * A contributor gets a clear ✗ on their own pull request, naming the file and
 * the fix, instead of a build failure in a repository they cannot see.
 *
 * The checking logic is separated from the file reading so it can be tested
 * against fixtures without touching the filesystem — see validate.test.ts.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";

import matter from "gray-matter";

import { frontmatterSchema } from "../schema/frontmatter.js";

export const CONTENT_DIRECTORY = "content";

export type Problem = {
  file: string;
  message: string;
};

export type EntryFile = {
  /** Path relative to the repository root, e.g. "content/materials/foo.md". */
  path: string;
  raw: string;
};

/**
 * Entries must be plain Markdown. The site compiles them with no MDX/JSX step
 * at all, so an `.mdx` file would never render — and because the site's
 * collection only matches `.md`, it would be skipped in silence. A file that
 * produces no page and no error is the worst outcome available, so it is an
 * error here.
 */
export function checkNoMdx(paths: string[]): Problem[] {
  return paths
    .filter((path) => path.endsWith(".mdx"))
    .map((path) => ({
      file: path,
      message:
        "Entries must be plain Markdown (.md), not MDX. Rename this file to " +
        ".md — the site has no JSX step, so an .mdx entry never renders.",
    }));
}

/**
 * The folder an entry lives in and its `category` frontmatter are two ways of
 * saying the same thing, so they can drift apart. Checked rather than trusted.
 */
export function checkCategoryMatchesFolder(
  path: string,
  category: string,
): Problem[] {
  const segments = path.split("/");
  const folder = segments.at(-2);

  if (folder === category) {
    return [];
  }

  // A file sitting directly in content/ has `content` as its parent, not
  // undefined — so both cases have to be handled or the message reads
  // `the file is in "content"`, which sounds like a folder that exists.
  const where =
    folder === undefined || folder === CONTENT_DIRECTORY
      ? "the content root"
      : `"${folder}"`;

  return [
    {
      file: path,
      message:
        `Frontmatter says category "${category}" but the file is in ` +
        `${where}. Either move it to content/${category}/ or correct the ` +
        `frontmatter — they have to agree.`,
    },
  ];
}

/**
 * `series` and `step` have to arrive together.
 *
 * Enforced here rather than in the schema because the site calls
 * `frontmatterSchema.extend()`, which only exists on a plain object schema — a
 * `.refine()` would turn it into an effects schema and break the site build.
 */
export function checkSeriesPairing(
  path: string,
  series: string | undefined,
  step: number | undefined,
): Problem[] {
  if (series !== undefined && step === undefined) {
    return [
      {
        file: path,
        message:
          `series is "${series}" but there is no step, so the entry cannot be ` +
          `placed in the sequence. Add a step, counting from 1.`,
      },
    ];
  }

  if (step !== undefined && series === undefined) {
    return [
      {
        file: path,
        message:
          `step is ${step} but there is no series, so there is nothing for it ` +
          `to be a step of. Add a series, or remove the step.`,
      },
    ];
  }

  return [];
}

/**
 * Two entries claiming the same position in the same sequence.
 *
 * An error rather than a silent tie-break. The site has to order them somehow,
 * so a duplicate step does not look broken — it quietly puts a step in the
 * wrong place, on a page whose entire purpose is being in the right order.
 */
export function checkNoDuplicateSteps(
  entries: Array<{ path: string; series?: string; step?: number }>,
): Problem[] {
  const seen = new Map<string, string>();
  const problems: Problem[] = [];

  for (const entry of entries) {
    if (entry.series === undefined || entry.step === undefined) continue;

    const key = `${entry.series}#${entry.step}`;
    const first = seen.get(key);

    if (first === undefined) {
      seen.set(key, entry.path);
      continue;
    }

    problems.push({
      file: entry.path,
      message:
        `step ${entry.step} of "${entry.series}" is already taken by ` +
        `${first}. Every step in a series has to be unique — renumber one of ` +
        `them.`,
    });
  }

  return problems;
}

/** Frontmatter needed for the cross-entry checks, when it parsed cleanly. */
function seriesOf(
  file: EntryFile,
): { path: string; series?: string; step?: number } | undefined {
  try {
    const parsed = frontmatterSchema.safeParse(matter(file.raw).data);
    if (!parsed.success) return undefined;
    return {
      path: file.path,
      series: parsed.data.series,
      step: parsed.data.step,
    };
  } catch {
    return undefined;
  }
}

export function checkEntry(file: EntryFile): Problem[] {
  let data: unknown;

  try {
    ({ data } = matter(file.raw));
  } catch (error) {
    return [
      {
        file: file.path,
        message:
          `The frontmatter block could not be parsed as YAML: ` +
          `${error instanceof Error ? error.message : String(error)}. ` +
          `Check that it starts and ends with --- and that every value with a ` +
          `colon in it is quoted.`,
      },
    ];
  }

  const result = frontmatterSchema.safeParse(data);

  if (!result.success) {
    return result.error.issues.map((issue) => ({
      file: file.path,
      message: issue.path.length
        ? `${issue.path.join(".")}: ${issue.message}`
        : issue.message,
    }));
  }

  return [
    ...checkCategoryMatchesFolder(file.path, result.data.category),
    ...checkSeriesPairing(file.path, result.data.series, result.data.step),
  ];
}

export function checkAll(files: EntryFile[], allPaths: string[]): Problem[] {
  return [
    ...checkNoMdx(allPaths),
    ...files.flatMap((file) => checkEntry(file)),
    // Cross-entry, so it cannot live in checkEntry: a duplicate step is only
    // visible when the whole set is in view.
    ...checkNoDuplicateSteps(
      files
        .map((file) => seriesOf(file))
        .filter((entry) => entry !== undefined),
    ),
  ];
}

function listContentFiles(root: string): string[] {
  return readdirSync(join(root, CONTENT_DIRECTORY), {
    recursive: true,
    withFileTypes: true,
  })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      // Normalised to forward slashes so paths read the same in output and in
      // the folder/category check, on any platform.
      relative(root, join(entry.parentPath, entry.name)).split(sep).join("/"),
    );
}

function main(): number {
  const root = process.cwd();
  const allPaths = listContentFiles(root);
  const markdownPaths = allPaths.filter((path) => path.endsWith(".md"));

  const files: EntryFile[] = markdownPaths.map((path) => ({
    path,
    raw: readFileSync(join(root, path), "utf8"),
  }));

  const problems = checkAll(files, allPaths);

  if (problems.length === 0) {
    console.log(`✓ ${files.length} entries, no problems found.`);
    return 0;
  }

  console.error(
    `✗ ${problems.length} problem${problems.length === 1 ? "" : "s"} found:\n`,
  );

  for (const problem of problems) {
    console.error(`  ${problem.file}`);
    console.error(`    ${problem.message}\n`);
  }

  console.error(
    "Nothing is broken on the site — this check runs before anything is\n" +
      "published. Fix the entries above and push again.\n",
  );

  return 1;
}

// Only run when invoked directly, so the tests can import the checks without
// the script executing and calling process.exit() out from under them.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exit(main());
}
