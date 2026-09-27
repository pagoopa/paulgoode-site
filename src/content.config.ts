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
      gumroadUrl: z.url().optional(),
      sold: z.boolean().default(false),
    }),
});

export const collections = { blog, products };
