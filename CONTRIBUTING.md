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
  lists: `scale-0100`, `neutral-050`, `font-size-012`. Pad new ones the same way.
- **There is no light/dark mode.** The header and footer are dark because they
  use the Inverse tokens (`surface-inverse`, `text-inverse`, `border-inverse`,
  `text-inverse-muted`) and the Inverse Nav links. Use those
  on any dark surface.

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

The home page is the journal. It shows the 5 newest posts as cards, the newest as a
wide lead card and the rest in two columns, with "Older posts" leading to
`/blog/page/2` and onward. A post lives at `/blog/<post>`. Change `POSTS_PER_PAGE` in
`src/lib/blog.ts` to show more or fewer (5 fills the grid; 3 or 7 would leave a gap).

Every post needs a `category` (art, design, spirit, life or studio) and can
have up to five `tags`, written in the frontmatter like this:

```
category: art
tags: [thumbnails, ghost-boy]
```

Tags are lowercase words, joined by hyphens when there is more than one.
`npm run build` flags a missing or unknown category and a badly written tag.
Each category and tag gets its own page, and `/tags` lists them all.

Each card shows the post's `description` as its summary (or the start of the post
if there isn't one). Add a `thumbnail` for the card image: a landscape 16:10 image
exported at 748 × 468, with a path relative to the post, like `thumbnail: ./cover.jpg`.
Without one the card shows a grey box.

## Writing a post: what you can use

Posts are Markdown, and these are all styled to match the Components / Prose board
in `design/site.pen`:

- Headings `##` to `####`, **bold**, *italic*, links, bulleted and numbered lists.
- `> a quote` is a blockquote (a pink bar). End it with `<cite>Name, source</cite>`
  on the same line for a citation.
- Inline `code`, fenced code blocks (with a language after the backticks), `---` for a
  horizontal rule, tables, images (`![alt](./image.jpg)`) and footnotes (`[^1]`).
- A few things need a little HTML, which Markdown allows:
  - **Pull quote:** `<blockquote class="pull-quote">Big line<cite>Who</cite></blockquote>`
  - **Callout:** `<aside class="callout"><span class="callout__tag">Note</span><p>Text</p></aside>`
  - **Images and galleries:** every image in a post opens in a lightbox when clicked, with
    previous and next buttons through all the images in the post. Nothing needs adding.
    To show several images together as a grid, wrap them in a `<div class="gallery">` with a
    blank line inside it above and below the images; they show three across (two on tablets,
    one on phones), all the same size, and open in the same lightbox. An image inside a
    link is left alone.
  - **Video:** `<div class="video-embed"><iframe src="…" title="…" allowfullscreen></iframe></div>`
    then `<p class="video-embed__caption">Caption</p>`

## The sidebar

Every page has the sidebar (about, categories, tags, newsletter) except the 404 page.
It sits beside the content on desktop and below it on smaller screens.

- **Hide it on a page:** add `sidebar: false` to that page's front matter (a post, a
  series, a series entry, a project, or a page in `src/content/pages/`).
- **Hide some sections:** add `sidebarHide: [tags, newsletter]`. The sections are `about`,
  `categories`, `tags` and `newsletter`. If you hide them all, the sidebar goes away.
- **Automatic:** a section that links to the page you're on is left out, so `/about` has no
  About section and `/newsletter` has no Newsletter section.
- **In code:** `Layout` takes `sidebar` and `sidebarHide` props. The 404 page passes
  `sidebar={false}`.
- **In Pencil:** the Sidebar component's sections can be switched off on an instance (see
  the About and Newsletter boards).

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

## Projects

- **A project:** `src/content/projects/<project>.md` holds `title`, `summary`
  (one or two sentences for the card), and `type` (series, personal,
  case-study, art, music, or resource). The body is the project's own page at
  `/projects/<project>`. The file name is its URL.
- **A series project:** set `type: series` and `series:` to the series file
  name (see Series above). It has no page or body of its own: the card links
  to the series landing page, `/series/<series>`. Its `title` and `summary`
  are the card's copy. Other types must not set `series:`.
- **Optional:** `featured: true` shows one project large above the grid (the
  first by `order` if several are marked), `order` (lowest first; the rest
  follow by title), `draft: true` (shows locally only), and `thumbnail`
  (16:10, exported at 720 × 450, like a series entry).
- **The filter** on `/projects` has one chip per type, and the choice is kept
  in the address (`/projects?type=art`). To add a type, add it to
  `projectType` and `projectTypes` in `src/lib/labels.ts` and to the Filter
  bar in `design/site.pen`.

## The shop

The shop lives on Big Cartel at https://shop.paulgoode.com, not in this
repo. The "Shop" links in the header and footer point there.
Add and price pieces in Big Cartel.

## Favicons and app icons

The site's icons come from the "Favicon Examples" board in `design/site.pen` and live in
`public/`: `favicon.svg` and `favicon.ico` (16, 32 and 48px) for browser tabs,
`apple-touch-icon.png` (180px) for iOS, and `icon-192.png`, `icon-512.png` and
`icon-maskable-512.png` (the mark smaller, so Android can crop it) listed in
`site.webmanifest`. They are exported from the board's frames; to change them, edit the
board, export again and replace the files. The tab and theme colour is `#121c21`.
