#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
  createAgentCatalog,
  markdownPathFor,
  PUBLIC_ROUTES,
  renderLlmsFullTxt,
  renderLlmsTxt,
  renderRobotsTxt,
  renderRouteFallbackHtml,
  renderRouteMarkdown,
  renderSitemapXml,
  routeMetadata,
  SITE_ORIGIN,
  SITE_NAME,
  structuredDataForRoute,
} from '../public-route-contract.mjs';

const root = resolve('.');
const publicDir = resolve(root, 'public');
const appHtmlPath = resolve(root, 'app.html');
const appRoute = PUBLIC_ROUTES.find((route) => route.id === 'play');

if (!appRoute) throw new Error('Public Play route is missing from the contract.');

const outputs = new Map([
  ['robots.txt', renderRobotsTxt()],
  ['sitemap.xml', renderSitemapXml()],
  ['llms.txt', renderLlmsTxt()],
  ['llms-full.txt', renderLlmsFullTxt()],
  ['api-ai.json', `${JSON.stringify(createAgentCatalog(), null, 2)}\n`],
]);

for (const route of PUBLIC_ROUTES) {
  const relative = markdownPathFor(route.path).replace(/^\//, '');
  outputs.set(relative, renderRouteMarkdown(route));
}

for (const [relative, content] of outputs) {
  await writeFile(resolve(publicDir, relative), content, 'utf8');
}

const appHtml = await readFile(appHtmlPath, 'utf8');
const generatedHead = renderHead(appRoute);
const generatedFallback = renderRouteFallbackHtml(appRoute, SITE_ORIGIN);
const nextAppHtml = replaceBlock(
  replaceBlock(
    appHtml,
    '<!-- PUBLIC_ROUTE_HEAD:START -->',
    '<!-- PUBLIC_ROUTE_HEAD:END -->',
    generatedHead
  ),
  '<!-- PUBLIC_ROUTE_FALLBACK:START -->',
  '<!-- PUBLIC_ROUTE_FALLBACK:END -->',
  generatedFallback
);
await writeFile(appHtmlPath, nextAppHtml, 'utf8');

console.log(
  `[public-surfaces] generated ${outputs.size} discovery files and the default SPA shell from ${PUBLIC_ROUTES.length} public routes`
);

function renderHead(route) {
  const metadata = routeMetadata(route);
  const structuredData = structuredDataForRoute(route);
  if (!metadata || !structuredData) {
    throw new Error(`Unable to render metadata for ${route.path}`);
  }
  return `<title>${escapeHtml(metadata.title)}</title>
    <meta name="description" content="${escapeHtml(metadata.description)}" />
    <meta name="robots" content="${metadata.robots}" />
    <link rel="canonical" href="${metadata.canonical}" />
    <link rel="alternate" type="text/markdown" href="${metadata.markdown}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:url" content="${metadata.canonical}" />
    <meta property="og:title" content="${escapeHtml(metadata.title)}" />
    <meta property="og:description" content="${escapeHtml(metadata.description)}" />
    <meta property="og:image" content="${metadata.image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(metadata.title)}" />
    <meta name="twitter:description" content="${escapeHtml(metadata.description)}" />
    <meta name="twitter:image" content="${metadata.image}" />
    <script type="application/ld+json">${safeJson(structuredData)}</script>`;
}

function replaceBlock(source, start, end, replacement) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(`Missing generated block markers: ${start} / ${end}`);
  }
  const contentStart = startIndex + start.length;
  return `${source.slice(0, contentStart)}\n    ${replacement}\n    ${source.slice(endIndex)}`;
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
