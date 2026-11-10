// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { postImages } from './src/lib/post-images.mjs';

export default defineConfig({
  site: 'https://www.paulgoode.com',
  // Post images get a srcset, so a phone doesn't download the full-size file.
  // Components that set their own widths keep them.
  image: { layout: 'constrained' },
  // Markdown images: the first loads right away, and each gets a `sizes` that
  // matches the post column or gallery grid (src/lib/post-images.mjs).
  markdown: { processor: satteri({ hastPlugins: [postImages()] }) },
  // /sitemap-index.xml lists every page (the 404 page is left out).
  // Left out of the sitemap while the Projects link is hidden.
  integrations: [sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/projects') })],
  // The journal is the home page now.
  redirects: { '/blog': '/' },
});
