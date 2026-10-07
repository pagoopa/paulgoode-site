import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      price: z.number(),
      size: z.string(),
      medium: z.string(),
      signature: z.boolean().default(false),
      // Optional subject tags for the shop filters (e.g. pattern, landscape, creature).
      tags: z.array(z.string()).default([]),
      order: z.number(),
      images: z.array(z.object({ src: image(), alt: z.string() })).min(1),
      // Stripe Payment Link (https://buy.stripe.com/...). Turns on the Buy button.
      paymentLink: z.url().optional(),
      sold: z.boolean().default(false),
    }),
});

// Copy for the one-off pages (home, about, contact). The file name is the page id.
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

export const collections = { blog, products, pages };
