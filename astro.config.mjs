import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL || 'https://ocean-remodeling.example';
export default defineConfig({
  site,
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
  vite: { build: { chunkSizeWarningLimit: 650 } }
});
