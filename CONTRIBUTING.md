# Contributing

Corrections, additions and "this is wrong and here is why" are all welcome.
You do not need to be a developer, and you do not need to run anything.

## Fixing something small

Use GitHub's own editor:

1. Open the entry you want to change.
2. Click the pencil icon.
3. Make the change and describe it briefly.
4. Choose **Create a new branch and start a pull request**.

A check runs automatically. If something is wrong it says which file and what
to fix, in plain language.

## Adding a new entry

1. Work out the **category** — `materials`, `hardware`, `slicing` or
   `post-processing` — and put the file in that folder. The folder and the
   `category` setting have to match.
2. Work out the **type**. `reference` is what something _is_
   ("filament settings and where to find them"). `workflow` is how to _do_
   something ("calibrating a new filament"). The same subject can have both.
3. Name the file in lowercase with hyphens. It becomes the web address.
4. Copy the settings block from any existing entry and edit it. Required:
   `title`, `description`, `category`, `type`, `date`. The date needs quotes.
5. Open a pull request.

Not finished? Set `draft: true`. It stays here, visible to others, but no page
is generated. Unfinished-but-visible beats hidden-until-perfect — someone else
may know the bit you are missing.

## What makes a good entry

- **Say where a number came from.** "Prusa's data sheet says 240 °C" is worth
  far more than "use 240 °C". Use the `sources` field for anything you did not
  work out yourself.
- **Prefer ranges and reasons to single values.** Printers differ. Explaining
  what moving within a range trades away helps more than a number that happens
  to work on your machine.
- **Flag anything that can cause damage** with `> [!WARNING]`.
- **Uncertainty is fine, stated.** "This works for me on a Bambu P1S, unclear
  whether it generalises" is genuinely useful. Confident-sounding guesses are
  not.
- **Corrections are contributions.** If an entry is wrong, saying so with a
  reason is as valuable as writing a new one.

## What the check looks at

- Every required setting is present and the right shape
- `category`, `type` and `difficulty` are values that actually exist
- The folder matches the category
- The file is `.md` — `.mdx` is rejected, since the site has no JSX step and
  would skip it in silence

It does not check whether the advice is _correct_. That is what review is for.

## Style

- Plain Markdown and [GFM](https://github.github.com/gfm/): tables, task
  lists, footnotes, strikethrough
- GitHub alerts (`> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`,
  `[!CAUTION]`) render as callouts on the site
- No raw HTML — it is escaped, not rendered
- Headings start at `##`; the title comes from the settings block
- One sentence per idea beats one paragraph per section

## Licence

By opening a pull request you offer your contribution under the licence that
applies to the files you changed: **CC BY-SA 4.0** for content, **MIT** for
code. Inbound equals outbound; there is nothing separate to sign.

In practice: what you write here stays free for others to use and build on,
with credit, and derivatives stay open on the same terms.
