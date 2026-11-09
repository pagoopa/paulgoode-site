// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.paulgoode.com',
  // /sitemap-index.xml lists every page (the 404 page is left out).
  // Left out of the sitemap while the Projects link is hidden.
  integrations: [sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/projects') })],
  // The journal is the home page now.
  redirects: { '/blog': '/' },
});
