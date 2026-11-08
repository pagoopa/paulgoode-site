// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.paulgoode.com',
  // /sitemap-index.xml lists every page (the 404 page is left out).
  integrations: [sitemap()],
  // The journal is the home page now.
  redirects: { '/blog': '/' },
});
