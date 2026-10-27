# Working in this repo

A short guide to the Git and GitHub workflow for this project.

## The basic loop

1. **Start from an up-to-date `main`.**
   ```sh
   git checkout main
   git pull
   ```
2. **Create a branch for one piece of work.**
   ```sh
   git checkout -b short-descriptive-name
   ```
3. **Make changes and commit in small steps** with clear messages.
   ```sh
   git status          # see what changed
   git diff            # review uncommitted changes before committing
   git add -A
   git commit -m "Describe what changed and why"
   ```
4. **Push the branch.**
   ```sh
   git push -u origin short-descriptive-name
   ```
5. **Open a pull request (PR) into `main`** on GitHub, then merge it there.
6. **Update your local `main`** (merging on GitHub doesn't change your computer).
   ```sh
   git checkout main
   git pull
   ```
7. **Delete the branch.** Use the "Delete branch" button GitHub shows after
   merging, and locally run `git branch -d short-descriptive-name`.

## Checklist before opening a PR

- [ ] The branch started from `main`, not from another feature branch.
- [ ] The PR page says **into `main`** at the top (the base branch).
- [ ] `git diff main` shows only changes you meant to make.
- [ ] `npm run build` passes.
- [ ] The PR does one thing, and the title says what.

## Habits that avoid problems

- **Branch from `main`, not from another feature branch.** If PR B is based on
  branch A's PR, merging B only folds it into A. It never reaches `main` unless
  A is merged afterward. (This happened with PRs #5 and #6.)
- **One branch per task.** Merge it before starting the next.
- **Keep PRs small.** They're easier to review and to undo.
- **Merge often.** `design/site.pen` is a large file, and merge conflicts in it
  are painful. Short-lived branches keep conflicts rare.

## Useful commands

| Command | What it does |
| --- | --- |
| `git status` | Shows changed files and the current branch |
| `git log --oneline -10` | Shows the last 10 commits |
| `git diff` | Shows uncommitted changes |
| `git branch -vv` | Lists branches and whether each is ahead or behind its remote |
| `git fetch --prune` | Updates remote info and drops references to deleted remote branches |

## Good to know

- A commit exists only on your machine until you **push** it.
- Committed work is very hard to lose. If something looks wrong, stop and ask
  before running `git reset`, `--force`, or `git branch -D`.

## Design workflow: Pencil

`design/site.pen` is the source of truth for the design: the variables
(colors, type, spacing), the components and the pages. Changes flow one way:
Pencil → the Astro code.

| Layer | Owned by | Examples |
| --- | --- | --- |
| The design system | Pencil (`design/site.pen`) | Variables, components, style guide boards |
| Pages and flows | Pencil (`design/site.pen`) | Page boards, interaction boards |
| Content | The code | Copy, nav labels, which pages exist, behaviour |

**The rule:** design changes start in Pencil, and the code is updated to match
in the same PR. Content changes start in the code, and the canvas is updated
to match.

### Working in Pencil

- **New components start in Pencil.** Make them reusable components and use
  instances on the page boards.
- **Some things Pencil can't show**, like text that ends in "…" when it's too
  long, or all-caps text. Write the rule in the node's context note so the code
  can apply it (for example `text-overflow: ellipsis`, `text-transform:
  uppercase`).
- **Numbered variables are zero-padded** so they sort in order in Pencil's
  lists: `scale-0025` … `scale-2000`, `neutral-050` … `neutral-950`,
  `font-size-012`, `font-line-height-016`. Pad new ones the same way.
- **Light and dark** describe a component's own background. Set the mode on
  the instance; in code, `data-theme="dark"` does the same.

### Keeping the canvas and the repo in step

Both Claude Code (terminal) and the agent inside Pencil can change
`site.pen` and the code, and both push to this repo.

1. **Pull before starting work.**
2. **If a pull changed `site.pen`, close it in Pencil without saving and
   reopen it.** Pencil keeps the old copy open, and saving it would undo the
   changes you pulled.
3. **Save in Pencil (⌘S) before committing.** Canvas edits only reach the file
   when you save.

### Figma

Figma's "PG Library" file is no longer kept in sync. Don't sync from it: that
would overwrite work done in Pencil. The Figma scripts
(`scripts/figma-export.js`, `scripts/figma-to-pen.mjs`, `npm run figma:pen`)
are kept for later. Once Figma code layers can push and pull through GitHub,
we'll revisit this workflow. Until then, don't connect Figma to this repo.

## Design tokens

Colors, fonts and sizes are variables in `design/site.pen`.
`scripts/sync-tokens.mjs` copies them into `src/styles/tokens.css`. This
runs automatically before `npm run dev` and `npm run build`; run
`npm run tokens` to sync manually. Save `site.pen` in Pencil first.

Don't edit `tokens.css` by hand, because the next sync overwrites it.

## Where this is going

`CONTENT_MODEL.md` is the target for the journal, series, and projects. The
sections below describe the site as it works today. When they disagree, the
content model wins, and the code catches up in small pull requests.

A few decisions are already settled. Notes were dropped, and the journal is the
home page: `/blog` redirects to `/`, and the nav item is "Blog". Series entries keep their year,
location, captioned hero image, and 16:10 thumbnail (the content model's
cover), at `/series/<series>/<entry>`. New components are designed in Pencil
before they are coded. This repo does not deploy the site yet, so the
Substack sync waits.

## Editing site copy

The words on the site live in Markdown files under `src/content/`:

| Folder | What it holds |
| --- | --- |
| `src/content/pages/` | About, Contact and Projects (`about.md`, `contact.md`, `projects.md`) |
| `src/content/blog/` | Journal posts, which make up the home page |

The block between the `---` lines at the top (the frontmatter) holds the
heading, eyebrow, buttons and so on. Everything below it is the body text.
Leave a blank line between paragraphs. `npm run build` flags a missing or
misspelled field.

## Journal posts

The home page is the journal. It shows the 3 newest posts, with "Older posts"
leading to `/blog/page/2` and onward. A post lives at `/blog/<post>`. Change `POSTS_PER_PAGE` in `src/lib/blog.ts`
to show more or fewer.

The home page shows each post in full. To show only the start, put
`<!-- more -->` on its own line, with a blank line above and below it.
Everything above the line shows on the home page, followed by a "Read
more" link to the full post.

## Series

A series is a numbered set of artwork, like "Junk Drawer Journey".

- **The series:** `src/content/series/<series>.md` holds its title and
  description, plus `domains` (one or more of art, design, spirit, life,
  studio) and `status` (exploring, active, resting, complete, or promoted).
  Optional: `premise` (one line, "an excuse to…"), `question`, `started`,
  and `container`. The series page shows `status` as a tag beside
  the eyebrow. The file name is its URL:
  `junk-drawer-journey.md` → `/series/junk-drawer-journey`.
- **An entry:** a folder in `src/content/entries/` with an `index.md` and the
  artwork. Set `series:` to the series file name, plus `number`, `year`,
  `location`, `image` (with `alt` and an optional `caption`), `title`,
  `description` and `pubDate`. It shows at `/series/<series>/<entry folder>`.
- **Artwork size:** export it 1044px wide (twice the 522px it shows at), any
  height. JPG at high quality keeps it small; PNG for flat line art. Astro
  makes the smaller versions. Keep full-size masters outside the repo.
- **Thumbnail (optional):** the card image on the series page. Export it 720 ×
  450 (16:10) and add `thumbnail: ./thumbnail.jpg`. Without one, the card
  uses the artwork, cropped from the top.
- The series page lists every entry in number order and features the newest.
- `draft: true` keeps an entry off the live site; it still shows locally.

## The shop

The shop lives on Big Cartel at https://shop.paulgoode.com, not in this
repo. The "Shop" links in the header and footer point there.
Add and price pieces in Big Cartel.
