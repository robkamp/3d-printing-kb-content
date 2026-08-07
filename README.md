# 3D printing knowledge base — content

The knowledge itself: notes on filament, printers, slicing and finishing,
written as plain Markdown.

This repository holds **only the content and the rules it has to follow**. The
website that publishes it lives elsewhere. You do not need to look at that, or
know anything about web development, to add or fix an entry here.

## Contributing

Corrections and new entries are welcome — see
[CONTRIBUTING.md](CONTRIBUTING.md). The short version:

1. Add or edit a `.md` file under `content/<category>/`.
2. Open a pull request.
3. A check runs automatically and tells you, in plain language, if anything is
   wrong.

You do not need to run anything locally. If the check goes red, it names the
file and what to fix.

## How an entry is put together

Every entry is a Markdown file with a block of settings at the top:

```markdown
---
title: Filament settings and where to find them
description: Which numbers actually matter for a new spool.
category: materials
type: reference
date: "2026-08-07"
tags: [filament, temperature]
difficulty: beginner
---

## The settings that matter

Ordinary Markdown from here down.
```

| Field         | Required | Notes                                                      |
| ------------- | -------- | ---------------------------------------------------------- |
| `title`       | yes      | Shown as the page heading                                  |
| `description` | yes      | Used on cards and as the page summary                      |
| `category`    | yes      | `materials`, `hardware`, `slicing`, `post-processing`      |
| `type`        | yes      | `reference` (what things are) or `workflow` (how to do it) |
| `date`        | yes      | ISO date **in quotes**, e.g. `"2026-08-07"`                |
| `updated`     | no       | Same format, when an entry is revised                      |
| `tags`        | no       | Defaults to none                                           |
| `difficulty`  | no       | `beginner`, `intermediate`, `advanced`                     |
| `draft`       | no       | `true` keeps it here but off the site                      |
| `sources`     | no       | `label` + full `url`, so advice can be traced              |

**The folder has to match the category.** An entry with `category: materials`
lives in `content/materials/`. The check enforces it, because a mismatch would
otherwise quietly misfile the entry.

**The filename becomes the web address.** `content/materials/foo-bar.md`
becomes `/kb/materials/foo-bar`, so use lowercase words separated by hyphens.

## What you can write

Plain Markdown plus [GitHub Flavored
Markdown](https://github.github.com/gfm/): tables, task lists, footnotes and
strikethrough all work, and render the same here as on the site.

GitHub's alert boxes work too, and are worth using for anything that could
damage a printer or waste an afternoon:

```markdown
> [!WARNING]
> Never exceed your hotend's rated maximum to chase a manufacturer's figure.

> [!TIP]
> If everything looks wrong at every temperature, the filament is probably damp.
```

`[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` and `[!CAUTION]` are all
available.

**No HTML, and no JSX or React components.** Entries are plain Markdown by
design: raw HTML is escaped rather than rendered, and an `.mdx` file is
rejected outright. This is what keeps entries readable, reviewable and safe
regardless of who wrote them.

## Images

Put images beside the entry that uses them and link relatively. A photograph
of the actual failure is usually worth more than a paragraph describing it.

## Checking your work locally (optional)

Not required — the pull request check does this for you. If you want the same
answer faster:

```bash
npm install
npm run validate
```

## Structure

```
content/<category>/*.md   the entries
schema/taxonomy.ts        the categories, types and difficulty levels
schema/frontmatter.ts     what the settings block must contain
scripts/validate.ts       the check that runs on every pull request
```

`schema/` is the **contract**. It lives here, next to the content, so this
repository can check itself — rather than a contributor finding out from a
build they cannot see.

## Licence

Content is [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/);
the code that validates it is MIT. See [LICENSE](LICENSE) — both are stated
explicitly, because one licence file over two kinds of material is ambiguous
exactly when it matters.
