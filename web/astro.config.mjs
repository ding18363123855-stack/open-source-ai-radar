// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const githubPages = process.env.GITHUB_ACTIONS === 'true' && !process.env.VERCEL;
const defaultSite = githubPages
  ? `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io`
  : 'http://localhost:4321';
const defaultBase = githubPages
  ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || 'open-source-ai-radar'}/`
  : '/';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : defaultSite),
  base: process.env.BASE_PATH || defaultBase,
  output: 'static',
  outDir: '../dist',
  integrations: [
    sitemap({
      filter: (path) => !path.includes('/api/'),
    }),
  ],
});
