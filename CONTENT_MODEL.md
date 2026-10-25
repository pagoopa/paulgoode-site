# Content Model: Notes, Series, Projects

> Source of truth for how paulgoode.com organizes content. Read this before building or changing anything in `src/content/`, routes, or components. Last updated Oct 25, 2026.

Everything I make starts as a note, matures into a series, and may leave the nest as a project; promotion rules decide when something moves up, so concepts emerge from the work instead of being invented up front.

## At a glance

```
NOTES ──(gate 1)──▶ SERIES ──(gate 2)──▶ PROJECTS
  ▲                    │
  └── progress on a series is logged as notes

Gate 1: a thread nears 10 notes AND fits a one-line premise
Gate 2: two of three signals: audience, objective, infrastructure
```

Series is the working layer. Notes feed it, and only a series with real signals graduates to a project.

## Notes

A note is any loose update or observation: an image or several, a short video, a link with a line of writing, a progress shot, a thought. Notes are cheap and frequent, and nothing is too small. Each one gets three kinds of label, and no more.

| Label | Values | Rule | Purpose |
| --- | --- | --- | --- |
| Domain | Art · Design · Spirit · Life · Studio | Exactly one | Forces a choice; the main filter |
| Format | image · sketch · video · link · writing · process | One, mostly obvious | Lets visitors browse by medium |
| Threads | Free tags, e.g. ghost-man, desert, control-panels, customer-truth, fear, origins | Zero to three | Seeds of future series; tracked, not filed |

**Life** covers family, origins, and everyday reflection. **Studio** covers the workspace, materials, setup, and how I work.

A note can also belong to one series. Updates about a series (branding decisions, process shots) are notes tagged to it, so the series page fills itself.

Threads are the engine of the system. Keep their names short, reuse them on purpose, and merge duplicates during the monthly synthesis.

## Series

A series is a thread I've decided to pursue: a mini publication that lives on my site, can have its own identity, and hasn't left the nest. It may start with one entry and no promise of a second.

**Promotion from notes:** a thread reaches about 10 notes, the same "Make 10" rule I already use, *and* I can write its premise in one sentence.

| Field | What it holds |
| --- | --- |
| Title | The series name |
| Premise | One line: "an excuse to…" |
| The question | What I'm pursuing and don't know yet |
| Domains | Art, Design, Spirit, Life, Studio (one or more) |
| Status | Exploring · Active · Resting · Complete · Promoted |
| Container | What done looks like: a set of 10, a little book, a wall, a show |
| Identity | Name, mark, palette (decisions logged as notes) |
| Entries | The series' own pieces, in order (their own collection) |
| Linked notes | Pulled in automatically by series or thread |
| Started | Date |

**Statuses.** *Exploring* means it's promoted but still finding its shape. *Active* means I'm working on it now. *Resting* means paused on purpose, which is not a failure. *Complete* means the container is full. *Promoted* means it became a project, and its page links there.

On Substack, each series becomes a Section, so subscribers can follow just that series.

## Projects

A project is a series that needs its own home: its own site, objective, and possibly events, a store, or a business model. It may run once, once a year, or continuously.

**Promotion from series:** at least two of these are true:

- **Audience signal:** hearts, people asking for more, sales, invitations
- **Objective beyond making:** sell, gather people, teach, raise support
- **Needs infrastructure the site can't hold:** events, checkout, its own list or community

On paulgoode.com, each project is a card and a short page with these fields: name, one-line objective, status (Planning, Live, Seasonal, Archived), domains, external link, and **lineage**. Lineage is the line "grew from the series ___, which grew from these notes." It makes the path visible and is the clearest proof of "drawing is thinking."

Pagoopaloops already qualifies as a project: it has its own home on TikTok and YouTube.

## Monthly synthesis

I see concepts easily for others and rarely for myself, so I don't invent them top-down. Once a month I treat my own notes like client research and synthesize them bottom-up.

1. Pull the month's notes and count them by thread.
2. Affinity-map them: merge duplicate threads, name the clusters, and notice motifs that recur without a tag.
3. For any thread near 10 notes, try writing its premise as "an excuse to…". If it fits in one sentence, promote it to a series.
4. Check each active series: still Active, now Resting, or Complete? Is there any audience signal toward becoming a project?
5. Write one short post or note about what changed. This is the "dream out loud" step.

A concept is simply **a thread + a premise + a count**.

## Current candidates

| Thread | Domains | Draft premise ("an excuse to…") | Evidence so far | Status |
| --- | --- | --- | --- | --- |
| Junk Drawer Journey | Spirit, Art | (to write) | 2022 San Antonio deliverance story with its illustration; mocked up in Astro | Series: Active — first series |
| Ghost Man / Ghost Boy | Art, Spirit | …draw the weight of this life and leaving it behind | Ghost Man studies, Ghost Boy thumbnails, reader asks for more | Series: Active |
| Desert Dreams | Art | …revisit long empty roads and roadside mysteries | 58 thumbnails, Sep 13 | Series: Exploring |
| Control Panels | Art, Design | …build the consoles I played with as a kid, scaled to door size | 2-up Sharpie concepts, wireframe notebooks | Thread: needs about 10 |
| Design Notes | Design | …say what design is for, one belief at a time | August "Design…" notes, five mini books | Series: Exploring, container = a little book |
| Origins | Life, Art | …trace where my images come from | Mom, Dad, art school, 2003–2006 archive notes | Thread |
| Scripture illustrations | Spirit | …illustrate the verses I keep returning to | Mystical Union group, 2019 Psalms piece | Thread |
| Pagoopaloops | Art | …pair visuals with my own music | Its own channel | Project: Live |

Reserved thread names (no series yet): friendler-usey, doodle-blaster, single-eye-twilight, ego-upload, town-city-ville. Each has to earn its way up the same ladder.

## Where each layer lives

paulgoode.com is the home of record and holds all three layers. Substack is for reach and email. Projects live on their own sites.

| Layer | paulgoode.com | Substack | Elsewhere |
| --- | --- | --- | --- |
| Notes | Garden stream, filterable | Notes (written here first, synced nightly) | TikTok / Instagram cross-posts |
| Series | A page per series with its entries and linked notes | Posts, one Section per series | Little books, prints |
| Projects | A card and a short page with lineage, linking out | Announcement posts | The project's own site, events, store |

Canonical URLs point to paulgoode.com so the archive stays mine.

## Build guidelines for the Astro agent

The sections above define the model; this one says how to build it. Before scaffolding, check the current Astro docs for the content collections API, since its details change between versions.

### Principles

1. **Markdown is the source of truth.** Content lives in `src/content/`. No CMS in v1.
2. **Derive, never duplicate.** Thread counts, a series' linked notes, and a project's lineage are computed at build time from references, never typed by hand.
3. **Validate at build.** The schema rejects an unknown domain, a missing alt text, or a note pointing at a series that doesn't exist.
4. **Filters work without JavaScript.** Static pages for each domain and thread come first; client-side filtering is an enhancement with filters in URL query params so they're shareable.
5. **Visual direction is still open.** Keep design tokens in one file so the look can change without touching templates.

### Folder structure

```
src/content/
  notes/      2026-10-24-cloud-mucous.md
  series/     ghost-man.md
  entries/    ghost-man/01-the-weight.md
  projects/   pagoopaloops.md
src/content.config.ts
src/lib/      threads.ts, lineage.ts
src/pages/    notes/, threads/, series/, projects/
```

### Content collections schema

```ts
import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const domain = z.enum(['art', 'design', 'spirit', 'life', 'studio']);
const thread = z.string().regex(/^[a-z0-9-]+$/); // kebab-case

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: ({ image }) => z.object({
    title: z.string().optional(),            // many notes have none
    date: z.coerce.date(),
    domain: domain.optional(),               // exactly one; required unless draft (add a .refine)
    substackId: z.string().optional(),       // set by the Substack sync; dedupe key
    format: z.enum(['image', 'sketch', 'video', 'link', 'writing', 'process']),
    threads: z.array(thread).max(3).default([]),
    series: reference('series').optional(),  // a process note about a series
    images: z.array(z.object({ src: image(), alt: z.string().min(1) })).default([]),
    video: z.string().url().optional(),
    link: z.object({ url: z.string().url(), label: z.string().optional() }).optional(),
    substackUrl: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

const series = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './src/content/series' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    premise: z.string(),                     // "an excuse to…"
    question: z.string(),
    domains: z.array(domain).min(1),
    status: z.enum(['exploring', 'active', 'resting', 'complete', 'promoted']),
    container: z.object({ kind: z.string(), target: z.number().optional() }).optional(), // e.g. { kind: 'set', target: 10 }
    threads: z.array(thread).default([]),    // notes on these threads also link here
    started: z.coerce.date(),
    cover: image().optional(),
    identity: z.object({ mark: image().optional(), palette: z.array(z.string()).optional() }).optional(),
    substackSection: z.string().url().optional(),
    promotedTo: reference('projects').optional(),
  }),
});

// A series' own pieces: longer form, titled, in order. One entry ≈ one Substack post.
const entries = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/entries' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    series: reference('series'),             // required
    number: z.number().int().positive(),     // order within the series; unique per series
    date: z.coerce.date(),
    summary: z.string().optional(),
    year: z.number().int().optional(),
    location: z.string().optional(),
    // Hero image. The series pages already use this, with an optional caption.
    image: z.object({ src: image(), alt: z.string().min(1), caption: z.string().optional() }).optional(),
    // 16:10 card image. This is the cover. Without it, the card uses the hero.
    cover: image().optional(),
    images: z.array(z.object({ src: image(), alt: z.string().min(1) })).default([]),
    substackUrl: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    objective: z.string(),
    status: z.enum(['planning', 'live', 'seasonal', 'archived']),
    domains: z.array(domain).min(1),
    url: z.string().url(),                   // the link out
    origin: reference('series').optional(),  // drives the lineage trail
    cover: image().optional(),
    started: z.coerce.date().optional(),
  }),
});

export const collections = { notes, series, entries, projects };
```

Add one build-time check in `src/lib/`: a series with `status: 'promoted'` must have `promotedTo`, and that project's `origin` must point back to it.

### Routes

| Route | Shows | Filters |
| --- | --- | --- |
| `/` | Latest notes, active series, live projects | none |
| `/notes` | Note stream, newest first, paginated (5 per page) | format, thread |
| `/notes/domain/[domain]` | Notes in one domain. A static page, so it works without JavaScript | format, thread |
| `/notes/[slug]` | One note, with its series and threads linked | none |
| `/threads/[thread]` | All notes on a thread, plus count toward 10 | domain |
| `/series` | Series grid | domain, status |
| `/series/[slug]` | Premise, question, status, container progress, entries, then process notes | none |
| `/series/[slug]/[entry]` | One entry. This URL already exists and stays | none |
| `/blog`, `/blog/*` | Redirect to the matching `/notes` URL | none |
| `/projects` | Project cards | domain, status |
| `/projects/[slug]` | Objective, status, lineage trail, link out | none |
| `/rss.xml`, `/series/[slug]/rss.xml` | Feeds for all notes and for each series | none |

### Components

- `NoteCard`: renders each format (single image, gallery, video, link, text-only)
- `SeriesCard`, `EntryCard`, `ProjectCard`, `StatusBadge`
- `ThreadChip`: links to `/threads/[thread]`
- `FilterBar`: domain, format, thread, and status, reading and writing URL params
- `ProgressToTen`: thread or container progress, such as "7 of 10"
- `LineageTrail`: notes → series → project

### Substack sync (phase 1: notes)

Notes are written on Substack first. A scheduled job copies them, with their images, into the repo and opens a pull request for review.

1. **Schedule:** a GitHub Action that runs nightly, plus a manual trigger.
2. **Fetch:** `https://substack.com/api/v1/reader/feed/profile/21109950?types[]=note`, paging with `nextCursor` until it reaches a note already in the repo. This endpoint is unofficial, so keep all of its logic in one module (`scripts/sync/substack-notes.ts`). On an unexpected response, fail loudly and write nothing.
3. **Map each note:** use the comment id as `substackId` (the dedupe key). Map `date`, the body as Markdown, and `substackUrl`. Image attachments are downloaded to `src/content/notes/_media/`, with HEIC converted to JPEG. Link attachments go to `link`, and video to `video`.
4. **Tags written in the note:** trailing hashtags are parsed and removed from the body. `#art #design #spirit #life #studio` set the domain; `#series-<slug>` sets the series; any other hashtag becomes a thread (max 3).
5. **Missing tags:** a note with no domain is written with `draft: true`, and the notes schema requires `domain` only when `draft` is false. Images get placeholder alt text marked `TODO`.
6. **Output:** one branch and a pull request titled "Substack notes sync: N new", listing every note that needs a domain, threads, or alt text. Merging publishes the notes once the site is deployed. This repo does not deploy yet, so this job waits until it does.
7. **Safe to rerun:** skip notes whose `substackId` already exists, and never overwrite a note that was edited on the site.

**Phase 2, once notes work:** sync newsletter posts from the RSS feed (`https://www.paulgoode.com/feed`). A post in a series' Substack Section becomes an `entries` file; other posts are handled case by case.

### Studio editor (phase 2)

This is a local-only editing front end at `/studio`. It runs in Astro dev mode and is never built into the public site.

1. **Threads dashboard:** every thread with its note count and progress toward 10, newest activity first. Each thread links to its notes, and threads near 10 are flagged as series candidates.
2. **Needs review:** synced notes with `draft: true`, a missing domain, or `TODO` alt text, with inline fields to fix them.
3. **Series editor:** a form to create or edit a series (every schema field) that writes `src/content/series/<slug>.md`. A "Promote thread" button prefills the form from a thread and its notes.
4. **Entries:** add an entry to a series with the next `number` filled in.
5. **Writes:** a dev-only API endpoint writes Markdown files and validates against the content schema before saving. Changes reach the live site through git (commit and push), like any other edit.

As an alternative to building from scratch, start from a git-based editor such as Keystatic for the forms, and build only the threads dashboard by hand.

### Out of scope for v1

Comments, accounts, a CMS, full-text search, and syncing newsletter posts (phase 2, above). `substackUrl` records each cross-post.

## Decisions log

- Domains are Art, Design, Spirit, Life, Studio.
- Series entries are their own collection (`entries`).
- Notes replace the journal. `/blog` redirects to `/notes`, and the 5-per-page pagination carries over.
- A note's format chooses its layout. A format can gain its own layout later, when a real note needs a different one. There is no second collection for special notes.
- Series entries keep a year, a location, a hero image with a caption, and a 16:10 thumbnail. The thumbnail is `cover`. Entry URLs stay `/series/<series>/<entry>`.
- Domain filters are static pages at `/notes/domain/<domain>`. Threads live at `/threads/<thread>`.
- Notes are written on Substack first and synced nightly (notes now, posts later). The repo does not deploy the site yet, so that sync waits until a merge publishes it.
- New components are designed in Pencil before they are coded.
- Older "excuse to…" ideas are reserved as thread names; no series or entries until a thread earns it.
- First official series: Junk Drawer Journey.
