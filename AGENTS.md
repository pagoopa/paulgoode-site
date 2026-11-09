# Working on paulgoode.com (notes for the next agent)

Paul Goode's personal site: an Astro 7 site, with its design in a Pencil file, `design/site.pen`.
It is live at https://www.paulgoode.com on Cloudflare, which deploys from `main` on GitHub
(`pagoopa/paulgoode-site`). Read `CONTRIBUTING.md` (how content, pages, motion, icons and titles
work) and `CONTENT_MODEL.md` first.

## How Paul likes to work

- **Design first, then code.** New UI or motion is designed on the Pencil canvas (a board, or a
  storyboard for motion) and shown to Paul. Then it is built. Paul is a designer and new to the
  GitHub workflow.
- **One small PR per change**, and the agent runs the whole flow: branch, commit, push,
  `gh pr create`, `gh pr merge N --merge --delete-branch`, then back on `main` and pulled. Paul
  authorised this. Only Pencil's save is his: the agent tools can't save `site.pen`, so ask for ⌘S.
- **Before committing `site.pen`**, compare the saved file with `git show HEAD:design/site.pen`
  node by node (top-level `children` by id: added / removed / changed). Expect only the boards you
  touched. `json.dumps(data, indent=2, ensure_ascii=False)` with no trailing newline reproduces
  Pencil's file exactly.
- **Replies: short and decisive.** Say what you did, the link, and the one thing he must do. Make
  git decisions yourself. Ask only when work could be lost.
- **Never commit `design/image-1.png`** (a scrapped texture idea) or the other agent-created
  scratch files. `git add -A . ':!design/image-1.png'` is the usual form.
- **Motion:** he likes motion on page elements (card hover and reveal, the newsletter entrance,
  header and footer decorations, the reading squiggle, the menu window). He rejected a card-to-post
  page transition, so don't change how navigation looks. Always honour `prefers-reduced-motion`.

## Practical notes

- Tools: put `/opt/homebrew/bin` on PATH for `npm`, `npx` and `gh`. Dev server: `npm run dev --
  --port 4321`. After switching branches it serves stale CSS: `npx astro dev stop; pkill -f "astro
  dev"` and start it again. `npm run build` runs `astro check` too (keep it at 0 errors).
- Design tokens in `src/styles/tokens.css` are generated from `site.pen` by
  `scripts/sync-tokens.mjs` (runs before dev and build). Don't edit them by hand.
- Pencil `execute` quirks: some variable names get cut off (`tag...`, `id`, destructuring in
  `for...of`), so use plain names and indexed loops; fix a failed call with `edits` and the
  `editId`. Pencil doesn't reload the file after a git pull: if `site.pen` changed on disk, have
  Paul reopen it before editing, or his next save overwrites the pull.
- Testing motion in the browser pane: step animations with `document.getAnimations()` (pause, set
  `currentTime`), force hover with the DevTools `CSS.forcePseudoState`, and test widths with
  `Emulation.setDeviceMetricsOverride` (clear it afterwards). A real mouse hover isn't reliable.
- How things are built (see the files): card motion is shared in `src/styles/global.css`
  (`.card-motion`) and `src/components/CardReveal.astro`; `Layout.astro` sets the `js` and
  `decor-intro` (first load of a visit) flags; page titles come from `src/lib/title.ts`; the
  lightbox is `src/components/Lightbox.astro`; icons are in `public/`.

## State when this was written (2026-11-08)

Everything above is merged and live. Loose ends, none urgent:

- The canvas still holds scrapped concept boards (Texture, Borders, Header links, Blog cards,
  and the Note/Notes boards for a removed feature). Paul was never asked to clear them.
- No sample post uses a `thumbnail` or a `<div class="gallery">` yet, so the image zoom, fade
  and gallery have only been tried with temporary content.
- On phones the third newsletter card animates while still below the screen.
- The sample series entry is not in the production build (probably marked draft).
- Another agent worked in this folder after the last PR from this one (PR #88, the Big Cartel
  shop catalog). Check `git status` and `git log` before starting, and ask Paul about any
  uncommitted change to `design/site.pen` before touching it.
