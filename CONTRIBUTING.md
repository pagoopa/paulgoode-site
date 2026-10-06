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
- **Merge often.** `design/shop.pen` is a large file, and merge conflicts in it
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

## Design tokens

Colors, fonts and sizes live in `design/shop.pen` and are copied into
`src/styles/tokens.css` by `scripts/sync-tokens.mjs`. This runs automatically
before `npm run dev` and `npm run build`; run `npm run tokens` to sync manually.
Don't edit `tokens.css` by hand, because the next sync overwrites it.
