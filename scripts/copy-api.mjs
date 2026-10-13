import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const source = fileURLToPath(new URL('../data/exports/api/', import.meta.url));
const target = fileURLToPath(new URL('../dist/api/', import.meta.url));
if (!existsSync(source)) throw new Error('Missing committed API exports');
cpSync(source, target, { recursive: true });
const githubPages = process.env.GITHUB_ACTIONS === 'true' && !process.env.VERCEL;
const base = process.env.BASE_PATH || (githubPages
  ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || 'open-source-ai-radar'}/` : '/');
const site = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : githubPages ? `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io` : 'http://localhost:4321');
const notFound = new URL('../dist/404.html', import.meta.url);
writeFileSync(notFound, readFileSync(notFound, 'utf8').replaceAll('/open-source-ai-radar/', base));
writeFileSync(new URL('../dist/robots.txt', import.meta.url), `User-agent: *\nAllow: /\n\nSitemap: ${new URL(`${base}sitemap-index.xml`, site).href}\n`);
console.log('Copied committed API exports into dist/api');
