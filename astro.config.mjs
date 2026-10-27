// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.paulgoode.com',
  // The journal is the home page now.
  redirects: { '/blog': '/' },
});
