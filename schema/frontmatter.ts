/**
 * The frontmatter contract for every knowledge base entry.
 *
 * Lives here, beside the content it describes, so this repository can check
 * its own entries. The site repository imports this rather than keeping a
 * second copy — two copies of a contract disagree eventually, and the
 * disagreement shows up as a confusing build failure rather than an obvious
 * conflict.
 *
 * Error messages are written for someone who is not a developer and may be
 * making their first pull request. "Invalid enum value" is technically
 * accurate and useless; saying which values are allowed is not.
 */
// `z` is Zod's conventional import alias — the builders below read as
// z.string(), z.enum(), z.array(). Kept as `z` because every Zod doc and
// example is written that way.
import { z } from "zod";

import { CATEGORIES, DIFFICULTY_LEVELS, ENTRY_TYPES } from "./taxonomy.js";

const list = (values: readonly string[]) => values.join(", ");

export const frontmatterSchema = z.object({
  title: z.string().min(1, "title is required — it becomes the page heading"),
  description: z
    .string()
    .min(
      1,
      "description is required — it is used on cards and as the meta description",
    ),
  category: z.enum(CATEGORIES, {
    message: `category must be one of: ${list(CATEGORIES)}`,
  }),
  type: z.enum(ENTRY_TYPES, {
    message: `type must be one of: ${list(ENTRY_TYPES)}`,
  }),
  /** Publication date, ISO `YYYY-MM-DD`. Sorts correctly as a plain string. */
  date: z.iso.date('date must be an ISO date in quotes, e.g. "2026-08-07"'),
  /** Set when an entry is revised — printers and firmware move on. */
  updated: z.iso
    .date('updated must be an ISO date in quotes, e.g. "2026-08-07"')
    .optional(),
  tags: z.array(z.string().min(1)).default([]),
  difficulty: z
    .enum(DIFFICULTY_LEVELS, {
      message: `difficulty must be one of: ${list(DIFFICULTY_LEVELS)}`,
    })
    .optional(),
  /** Draft entries stay in the repository but generate no page on the site. */
  draft: z.boolean().default(false),
  /** Provenance, so advice can be traced back rather than taken on faith. */
  sources: z
    .array(
      z.object({
        label: z.string().min(1, "each source needs a label"),
        url: z.url("each source needs a full URL, starting with https://"),
      }),
    )
    .optional(),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
