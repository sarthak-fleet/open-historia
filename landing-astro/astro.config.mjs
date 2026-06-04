// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Mirrors the fleet reference Astro setup (see linkchat/landing-astro and
// sarthakagrawal.pages.dev). Pure static output, CSS inlined into the
// HTML so the LCP path is one round-trip: HTML → fonts → paint.
//
// Lightning CSS replaces the default PostCSS pipeline as both
// transformer and minifier (fleet web-stack standard, VoidZero / Vite
// ecosystem). See ../../AGENTS.md → "Fleet web stack standard".
//
// `site:` points at the workers.dev origin because open-historia does
// not have a custom domain yet. Post-cutover this becomes the canonical
// host that Pages serves `/` from.
export default defineConfig({
  site: 'https://open-historia.sarthakagrawal927.workers.dev',
  output: 'static',
  trailingSlash: 'never',
  // Emit `about.html` rather than `about/index.html` — no 308 redirect
  // on every link. Same as sarthakagrawal.pages.dev.
  build: {
    format: 'file',
    inlineStylesheets: 'always',
  },
  integrations: [sitemap()],
  vite: {
    css: { transformer: 'lightningcss' },
    build: { cssMinify: 'lightningcss' },
  },
});
