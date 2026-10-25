import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { domain, seriesStatus, thread } from './lib/labels';

const noteFormat = z.enum(['image', 'sketch', 'video', 'link', 'writing', 'process']);

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      draft: z.boolean().default(false),
      // Portrait image beside the entry (above it on mobile). Path is relative to the .md file.
      sidebarImage: z.object({ src: image(), alt: z.string() }).optional(),
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
    threads: z.array(thread).default([]),
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
  }),
});

// Notes: loose updates. Sample files live in src/content/notes/.
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().optional(),
      date: z.coerce.date(),
      domain: domain.optional(),
      format: noteFormat,
      threads: z.array(thread).max(3).default([]),
      series: reference('series').optional(),
      images: z.array(z.object({ src: image(), alt: z.string().min(1) })).default([]),
      video: z.string().url().optional(),
      link: z.object({ url: z.string().url(), label: z.string().optional() }).optional(),
      substackUrl: z.string().url().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog, series, entries, pages, notes };
