import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

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

// The series themselves: one file per series in src/content/series-info/.
// The file name is the series id and its URL: junk-drawer-journey.md → /series/junk-drawer-journey.
const seriesInfo = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/series-info' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
  }),
});

// Series entries: one piece of artwork in a numbered series, with a write-up.
// Each entry is a folder with an index.md and its image.
const series = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/series' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      pubDate: z.coerce.date(),
      draft: z.boolean().default(false),
      // The series this entry belongs to: the id of a file in src/content/series-info/.
      series: reference('seriesInfo'),
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

export const collections = { blog, seriesInfo, series, pages };
