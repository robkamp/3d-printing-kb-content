/**
 * The two axes every knowledge base entry is filed on.
 *
 * `category` is the *subject* an entry is about; `type` is the *kind* of entry
 * it is. Keeping them separate is what lets "filament settings and where to
 * find them" (materials + reference) and "how to calibrate a new filament"
 * (materials + workflow) live under the same subject without one taxonomy
 * having to absorb the other.
 *
 * This file is the **content contract**, and it lives here rather than in the
 * site repository on purpose. It is what lets this repository validate its own
 * entries: a contributor gets told their `category` is wrong by CI on their own
 * pull request, rather than by a build they cannot run in a repository they
 * cannot see.
 *
 * What deliberately is NOT here: how a category is *titled* or *described* in
 * the interface. That is presentation, it lives in the site repository, and a
 * contributor has no reason to care about it.
 *
 * Adding a category means adding it here, creating `content/<category>/`, and
 * adding the matching label in the site repository. The site's labels are an
 * exhaustive `Record`, so TypeScript there will point at what is missing.
 */

export const CATEGORIES = [
  "materials",
  "hardware",
  "slicing",
  "post-processing",
] as const;

export const ENTRY_TYPES = ["reference", "workflow"] as const;

export const DIFFICULTY_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

/**
 * Ordered sequences an entry can belong to — a **third** axis, independent of
 * both the ones above.
 *
 * Some entries are steps in a procedure that must be followed in order, and
 * neither existing axis can say so. `category` cannot: the steps deliberately
 * span subjects, since calibrating an extruder is hardware and pressure
 * advance is materials. Forcing them into one category to express a sequence
 * would break the subject axis in order to fix the ordering one. `type` cannot
 * either — it only says whether an entry is reference or workflow.
 *
 * So a series is orthogonal to both, for exactly the reason `category` and
 * `type` are orthogonal to each other: an entry keeps its subject and its kind
 * and *additionally* says where it falls in a sequence.
 *
 * Deliberately a closed list rather than a free string. Two entries spelling
 * the same series differently would silently produce two half-sequences with
 * nothing to report it.
 */
export const SERIES = ["filament-calibration"] as const;

export type Category = (typeof CATEGORIES)[number];
export type EntryType = (typeof ENTRY_TYPES)[number];
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];
export type Series = (typeof SERIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function isSeries(value: string): value is Series {
  return (SERIES as readonly string[]).includes(value);
}
