import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { domain, projectType, seriesStatus, tag } from './lib/labels';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    // Exactly one of art, design, spirit, life, studio.
    category: domain,
    // Up to five, like ghost-boy.
    tags: z.array(tag).max(5).default([]),
  }),
});

// The series themselves: one file per series in src/content/series/.
// The file name is the series id and its URL: junk-drawer-journey.md → /series/junk-drawer-journey.
const series = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/series' }),
  schema: z.object({
    title: z.string(),
    // Landing intro. The premise is the one-line reason; this is the text the page shows today.
    description: z.string(),
    // "An excuse to…". Optional until the sentence is written.
    premise: z.string().optional(),
    question: z.string().optional(),
    domains: z.array(domain).min(1),
    status: seriesStatus,
    container: z.object({ kind: z.string(), target: z.number().int().positive().optional() }).optional(),
    started: z.coerce.date().optional(),
    // cover, identity, substackSection, and promotedTo wait until something uses them.
  }),
});

// Series entries: one piece of artwork in a numbered series, with a write-up.
// Each entry is a folder in src/content/entries/ with an index.md and its image.
const entries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/entries' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      pubDate: z.coerce.date(),
      draft: z.boolean().default(false),
      // The series this entry belongs to: the id of a file in src/content/series/.
      series: reference('series'),
      // Shown with three digits: 1 → "001".
      number: z.union([z.number().int(), z.string()]).transform((n) => String(n).padStart(3, '0')),
      year: z.number().int(),
      location: z.string(),
      // Hero image at the top of the page. Path is relative to the .md file.
      image: z.object({ src: image(), alt: z.string(), caption: z.string().optional() }),
      // Card image on the series page: 16:10 landscape, exported at 720 × 450.
      // Optional; without it the card uses the artwork, cropped from the top.
      thumbnail: image().optional(),
    }),
});

// Projects: one file per project in src/content/projects/. The file name is its id and its URL:
// uplifting-ink.md → /projects/uplifting-ink. The body is the project's own page.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // One or two sentences, shown on the card and under the title on the project's page.
      summary: z.string(),
      // Sets the filter chip and the card eyebrow.
      type: projectType,
      // For type: series, the series this project is: the id of a file in src/content/series/.
      // The card links to that series' landing page instead of a page of its own.
      series: reference('series').optional(),
      // The one project shown large above the grid. If several are marked, the first by order.
      featured: z.boolean().default(false),
      // Lowest first. Without it a project goes after the numbered ones, by title.
      order: z.number().int().optional(),
      draft: z.boolean().default(false),
      // Card image: 16:10 landscape, exported at 720 × 450. Optional.
      thumbnail: image().optional(),
    })
    .refine((project) => (project.type === 'series') === Boolean(project.series), {
      message: 'A series project needs `series:`, and other types must not have it.',
    }),
});

// Copy for the one-off pages (home, about, contact, projects). The file name is the page id.
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    eyebrow: z.string().optional(),
    heading: z.string(),
    actions: z
      .array(
        z.object({
          label: z.string(),
          href: z.string(),
          style: z.enum(['solid', 'outline']).default('outline'),
        }),
      )
      .default([]),
    // Short statements shown as cards (the newsletter page's "what you get"). Optional.
    highlights: z.array(z.string()).default([]),
    // A small line under the page's content. Optional.
    note: z.string().optional(),
  }),
});

export const collections = { blog, series, entries, projects, pages };
