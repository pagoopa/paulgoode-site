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

## Design workflow: Figma and Pencil

Each tool owns one layer of the design, and changes flow one way:
Figma → `design/site.pen` → the Astro code.

| Layer | Owned by | Examples |
| --- | --- | --- |
| The design system | Figma ("PG Library" file) | Colors, type, spacing, base components, style guide |
| Everything built from it | Pencil (`design/site.pen`) and the code | Pages, layouts, flows, Astro components |

**The rule:** changing the system? Start in Figma. Changing a page? Start in
Pencil. Page work never goes back to Figma.

### Which agent does what

| | Figma | `site.pen` | Code |
| --- | --- | --- | --- |
| Claude Code (terminal) | ✅ | ✅ | ✅ |
| The agent inside Pencil | ❌ | ✅ | ✅ |

- **Anything that starts in Figma goes to Claude Code.** It reads Figma,
  updates `site.pen` and the code in one pass, and commits.
- **Anything that stays in Pencil can go to either agent.** Use Pencil's agent
  when you're already working on the canvas.
- **Pencil's agent doesn't need Figma.** It pulls from GitHub and finds the
  updated variables and components in `site.pen`.
- **Don't change system values (colors, fonts, sizes) in Pencil.** The next
  Figma sync overwrites them. Change them in Figma, then sync.

### The loop

1. Change a component or variable in Figma.
2. Ask Claude Code to "sync from Figma" (see Design tokens below).
3. Pull in Pencil and build pages with the updated pieces.

Both agents push to this repo, so **always pull before starting work.**

### Figma code layers

Figma's code layers (in beta) are for prototyping and reviewing interactions
on the canvas. Don't connect them to this repo or let them push here. When a
prototype is settled, Claude Code brings it in through the normal loop.

## Design tokens

Colors, fonts and sizes start in Figma and reach the site in three steps:

1. **Figma → snapshot.** Claude Code runs `scripts/figma-export.js` inside
   Figma and saves the result as `design/figma-variables.json`.
2. **Snapshot → `site.pen`.** `npm run figma:pen` reports what's added, changed
   or missing in `design/site.pen`, and `npm run figma:pen -- --json` prints
   the changes ready to apply.
3. **`site.pen` → CSS.** `scripts/sync-tokens.mjs` copies the variables into
   `src/styles/tokens.css`. This runs automatically before `npm run dev` and
   `npm run build`; run `npm run tokens` to sync manually.

Don't edit `tokens.css` by hand, because the next sync overwrites it.

## Editing site copy

The words on the site live in Markdown files under `src/content/`:

| Folder | What it holds |
| --- | --- |
| `src/content/pages/` | Home, About, Contact and Projects (`home.md`, `about.md`, `contact.md`, `projects.md`) |
| `src/content/blog/` | Journal posts |

The block between the `---` lines at the top (the frontmatter) holds the
heading, eyebrow, buttons and so on. Everything below it is the body text.
Leave a blank line between paragraphs. `npm run build` flags a missing or
misspelled field.

## Journal posts

The journal page shows each post in full. To show only the start, put
`<!-- more -->` on its own line, with a blank line above and below it.
Everything above the line shows on the journal page, followed by a "Read
more" link to the full post.

## The shop

The shop lives on Big Cartel at https://shop.paulgoode.com, not in this
repo. The "Shop" links in the header, footer and home page point there.
Add and price pieces in Big Cartel.
