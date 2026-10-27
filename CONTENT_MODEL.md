# Content Model: Journal, Series, Projects

> Source of truth for how paulgoode.com organizes content. Read this before building or changing anything in `src/content/`, routes, or components. Last updated Oct 26, 2026.

Everything I publish is a journal post, a piece in a series, or a project. The journal is for writing. A series is a body of work I pursue over time, and a series with real signals may leave the nest as a project.

Notes, the loose-update layer in an earlier version of this model, were dropped on Oct 26, 2026. Nothing here depends on them.

## At a glance

```
JOURNAL   standalone posts at /blog

SERIES ──(gate)──▶ PROJECTS

Gate: two of three signals: audience, objective, infrastructure
```

## Journal

A journal post is a piece of writing: a title, a date, a body, and optionally images. It stands alone and isn't tied to a series. A post about a series can link to it from the body.

| Field | What it holds |
| --- | --- |
| Title | The post's title |
| Description | One line for search and previews (optional) |
| Published | Date |
| Updated | Date of the last edit (optional) |
| Draft | Hidden from the live site while true |
| Sidebar image | A portrait image beside the post, with alt text (optional) |

The journal page shows 3 posts at a time, newest first, with Newer / Older links.

## Series

A series is a body of work I've decided to pursue: a mini publication that lives on my site, can have its own identity, and hasn't left the nest. It may start with one entry and no promise of a second. A series starts when I can write its premise in one sentence.

| Field | What it holds |
| --- | --- |
| Title | The series name |
| Premise | One line: "an excuse to…" |
| The question | What I'm pursuing and don't know yet |
| Domains | Art, Design, Spirit, Life, Studio (one or more) |
| Status | Exploring · Active · Resting · Complete · Promoted |
| Container | What done looks like: a set of 10, a little book, a wall, a show |
| Identity | Name, mark, palette |
| Entries | The series' own pieces, in order (their own collection) |
| Started | Date |

**Statuses.** *Exploring* means it's chosen but still finding its shape. *Active* means I'm working on it now. *Resting* means paused on purpose, which is not a failure. *Complete* means the container is full. *Promoted* means it became a project, and its page links there.

On Substack, each series becomes a Section, so subscribers can follow just that series.

## Projects

A project is a series that needs its own home: its own site, objective, and possibly events, a store, or a business model. It may run once, once a year, or continuously.

**Promotion from series:** at least two of these are true:

- **Audience signal:** hearts, people asking for more, sales, invitations
- **Objective beyond making:** sell, gather people, teach, raise support
- **Needs infrastructure the site can't hold:** events, checkout, its own list or community

On paulgoode.com, each project is a card and a short page with these fields: name, one-line objective, status (Planning, Live, Seasonal, Archived), domains, external link, and **origin**, the series it grew from. The page shows that as a "grew from the series ___" line.

Pagoopaloops already qualifies as a project: it has its own home on TikTok and YouTube.

## Current candidates

| Idea | Domains | Draft premise ("an excuse to…") | Evidence so far | Status |
| --- | --- | --- | --- | --- |
| Junk Drawer Journey | Spirit, Art | (to write) | 2022 San Antonio deliverance story with its illustration; mocked up in Astro | Series: Active — first series |
| Ghost Man / Ghost Boy | Art, Spirit | …draw the weight of this life and leaving it behind | Ghost Man studies, Ghost Boy thumbnails, reader asks for more | Series: Active |
| Desert Dreams | Art | …revisit long empty roads and roadside mysteries | 58 thumbnails, Sep 13 | Series: Exploring |
| Control Panels | Art, Design | …build the consoles I played with as a kid, scaled to door size | 2-up Sharpie concepts, wireframe notebooks | Idea |
| Design Notes | Design | …say what design is for, one belief at a time | August "Design…" notes, five mini books | Series: Exploring, container = a little book |
| Origins | Life, Art | …trace where my images come from | Mom, Dad, art school, 2003–2006 archive | Idea |
| Scripture illustrations | Spirit | …illustrate the verses I keep returning to | Mystical Union group, 2019 Psalms piece | Idea |
| Pagoopaloops | Art | …pair visuals with my own music | Its own channel | Project: Live |

Reserved names (no series yet): friendler-usey, doodle-blaster, single-eye-twilight, ego-upload, town-city-ville. Each has to earn its way to a series.

## Where each layer lives

paulgoode.com is the home of record and holds all three layers. Substack is for reach and email. Projects live on their own sites.

| Layer | paulgoode.com | Substack | Elsewhere |
| --- | --- | --- | --- |
| Journal | `/blog` | Newsletter posts | |
| Series | A page per series with its entries | Posts, one Section per series | Little books, prints |
| Projects | A card and a short page with its origin, linking out | Announcement posts | The project's own site, events, store |

Canonical URLs point to paulgoode.com so the archive stays mine.

## Build guidelines for the Astro agent

The sections above define the model; this one says how to build it. Before scaffolding, check the current Astro docs for the content collections API, since its details change between versions.

### Principles

1. **Markdown is the source of truth.** Content lives in `src/content/`. No CMS in v1.
2. **Derive, never duplicate.** A series' entries, its container progress, and a project's origin trail are computed at build time from references, never typed by hand.
3. **Validate at build.** The schema rejects an unknown domain, a missing alt text, or an entry pointing at a series that doesn't exist.
4. **Visual direction is still open.** Keep design tokens in one file so the look can change without touching templates.

### Folder structure

```
src/content/
  blog/       hello-world.md
  series/     ghost-man.md
  entries/    ghost-man/01-the-weight/index.md
  projects/   pagoopaloops.md
  pages/      home.md
src/content.config.ts
src/pages/    blog/, series/, projects/
```

### Content collections schema

```ts
import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const domain = z.enum(['art', 'design', 'spirit', 'life', 'studio']);

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    sidebarImage: z.object({ src: image(), alt: z.string() }).optional(),
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
    origin: reference('series').optional(),  // the series it grew from
    cover: image().optional(),
    started: z.coerce.date().optional(),
  }),
});

export const collections = { blog, series, entries, projects };
```

Add one build-time check in `src/lib/`: a series with `status: 'promoted'` must have `promotedTo`, and that project's `origin` must point back to it.

### Routes

| Route | Shows | Filters |
| --- | --- | --- |
| `/` | Latest journal posts, active series, live projects | none |
| `/blog`, `/blog/page/[n]` | Journal posts, newest first, paginated (3 per page) | none |
| `/blog/[slug]` | One post | none |
| `/series` | Series grid | domain, status |
| `/series/[slug]` | Premise, question, status, container progress, entries | none |
| `/series/[slug]/[entry]` | One entry. This URL already exists and stays | none |
| `/projects` | Project cards | domain, status |
| `/projects/[slug]` | Objective, status, origin, link out | none |
| `/rss.xml`, `/series/[slug]/rss.xml` | Feeds for the journal and for each series | none |

Filters work without JavaScript: domain and status filters are static pages first, and client-side filtering is an enhancement with filters in URL query params so they're shareable.

### Components

- `SeriesCard`, `EntryCard`, `ProjectCard`, `StatusBadge`
- `FilterBar`: domain and status, reading and writing URL params
- `ContainerProgress`: progress toward a series' container, such as "7 of 10"
- `OriginTrail`: series → project

### Substack sync (later)

The repo does not deploy the site yet, so this waits. When it does, a scheduled job copies newsletter posts from the RSS feed (`https://www.paulgoode.com/feed`) into the repo and opens a pull request for review. A post in a series' Substack Section becomes an `entries` file; other posts are handled case by case. Keep all of its logic in one module (`scripts/sync/`), fail loudly on an unexpected response, never overwrite a file that was edited on the site, and skip posts already in the repo (`substackUrl` is the dedupe key).

### Studio editor (later)

A local-only editing front end at `/studio`. It runs in Astro dev mode and is never built into the public site.

1. **Series editor:** a form to create or edit a series (every schema field) that writes `src/content/series/<slug>.md`.
2. **Entries:** add an entry to a series with the next `number` filled in.
3. **Writes:** a dev-only API endpoint writes Markdown files and validates against the content schema before saving. Changes reach the live site through git, like any other edit.

As an alternative to building from scratch, start from a git-based editor such as Keystatic.

### Out of scope for v1

Comments, accounts, a CMS, full-text search, and syncing newsletter posts (see above). `substackUrl` records each cross-post.

## Decisions log

- Domains are Art, Design, Spirit, Life, Studio.
- Series entries are their own collection (`entries`).
- Notes were dropped on Oct 26, 2026. The journal stays at `/blog`, and the nav item is "Blog". There are no threads or `/notes` routes.
- The journal shows 3 posts per page.
- Series entries keep a year, a location, a hero image with a caption, and a 16:10 thumbnail. The thumbnail is `cover`. Entry URLs stay `/series/<series>/<entry>`.
- Domain filters are static pages. They apply to series and projects.
- New components are designed in Pencil before they are coded.
- Older "excuse to…" ideas are reserved names; no series or entries until one earns it.
- First official series: Junk Drawer Journey.
