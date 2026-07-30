import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  createAgentCatalog,
  htmlPathFromMarkdown,
  isPrivateGameplayPath,
  markdownPathFor,
  prefersMarkdown,
  privateGameplayMetadata,
  PUBLIC_ROUTES,
  publicRouteForPath,
  renderLlmsFullTxt,
  renderLlmsTxt,
  renderRobotsTxt,
  renderRouteFallbackHtml,
  renderRouteMarkdown,
  renderSitemapXml,
  routeMetadata,
  SITE_ORIGIN,
  structuredDataForRoute,
} from '../../public-route-contract.mjs';
import { handlePublicDiscovery, routeDocumentKind } from '../../src/worker/public-surfaces';

const PUBLIC_PATHS = ['/', '/play', '/about', '/privacy'];

describe('public route contract', () => {
  it('defines exactly four canonical public HTML routes', () => {
    expect(PUBLIC_ROUTES.map((route) => route.path)).toEqual(PUBLIC_PATHS);
    expect(new Set(PUBLIC_PATHS).size).toBe(PUBLIC_PATHS.length);
  });

  it('rejects private gameplay, APIs, auth, and archived experiments', () => {
    for (const pathname of [
      '/play/campaign-123',
      '/play/campaign-123/turn/4',
      '/api/saves',
      '/api/saves/campaign-123',
      '/api/auth/session',
      '/api/turn',
      '/story-room',
    ]) {
      expect(publicRouteForPath(pathname), pathname).toBeNull();
      expect(routeDocumentKind(pathname).kind, pathname).not.toBe('public');
    }
    expect(isPrivateGameplayPath('/play/campaign-123')).toBe(true);
    expect(isPrivateGameplayPath('/play')).toBe(false);
  });

  it('maps every public route to a stable Markdown alternate', () => {
    for (const pathname of PUBLIC_PATHS) {
      const markdownPath = markdownPathFor(pathname);
      expect(htmlPathFromMarkdown(markdownPath)).toBe(pathname);
    }
    expect(markdownPathFor('/')).toBe('/index.md');
    expect(markdownPathFor('/play')).toBe('/play.md');
  });

  it('renders substantive Markdown and fallback HTML for every route', () => {
    for (const route of PUBLIC_ROUTES) {
      const markdown = renderRouteMarkdown(route);
      const fallback = renderRouteFallbackHtml(route);
      expect(wordCount(markdown), route.path).toBeGreaterThan(300);
      expect(wordCount(stripTags(fallback)), route.path).toBeGreaterThan(300);
      expect(fallback.match(/<h1\b/g), route.path).toHaveLength(1);
      expect(fallback.match(/<h2\b/g)?.length ?? 0, route.path).toBeGreaterThan(1);
    }
  });

  it('keeps sitemap and catalog coverage identical and same-origin', () => {
    const sitemap = renderSitemapXml();
    const catalog = createAgentCatalog();
    expect(catalog.surfaces).toHaveLength(4);

    for (const surface of catalog.surfaces) {
      expect(surface.url.startsWith(SITE_ORIGIN)).toBe(true);
      expect(surface.md.startsWith(SITE_ORIGIN)).toBe(true);
      expect(sitemap).toContain(`<loc>${surface.url}</loc>`);
    }
    expect(sitemap).not.toMatch(/api|story-room|play\/[^<]+/);
  });

  it('provides complete route metadata and structured data', () => {
    for (const route of PUBLIC_ROUTES) {
      const metadata = routeMetadata(route);
      const structuredData = structuredDataForRoute(route);
      expect(metadata?.canonical).toBe(new URL(route.path, `${SITE_ORIGIN}/`).toString());
      expect(metadata?.description.length).toBeGreaterThanOrEqual(70);
      expect(metadata?.description.length).toBeLessThanOrEqual(160);
      expect(metadata?.image).toBe(`${SITE_ORIGIN}/og.png`);
      expect(metadata?.robots).toBe('index,follow');
      expect(structuredData?.url).toBe(metadata?.canonical);
      expect(structuredData?.description).toBe(metadata?.description);
    }
  });

  it('marks campaign identifiers noindex and canonicalizes them to Play', () => {
    const metadata = privateGameplayMetadata();
    expect(metadata.robots).toContain('noindex');
    expect(metadata.canonical).toBe(`${SITE_ORIGIN}/play`);
    expect(metadata.markdown).toBeNull();
  });

  it('generates complete agent indexes and crawler rules', () => {
    const robots = renderRobotsTxt();
    const llms = renderLlmsTxt();
    const llmsFull = renderLlmsFullTxt();

    expect(robots).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`);
    expect(robots).toContain('Disallow: /play/');
    expect(robots).toContain('Disallow: /api/');
    expect(llms).toContain('Every URL in the sitemap');
    expect(llmsFull).toContain('exactly four routes');
    for (const route of PUBLIC_ROUTES) {
      expect(llmsFull).toContain(route.heading);
    }
  });

  it('negotiates Markdown only when it is preferred', () => {
    expect(prefersMarkdown('text/markdown')).toBe(true);
    expect(prefersMarkdown('text/markdown, text/html;q=0.8')).toBe(true);
    expect(prefersMarkdown('text/html, text/markdown;q=0.5')).toBe(false);
    expect(prefersMarkdown('text/html,application/xhtml+xml,*/*;q=0.8')).toBe(false);
    expect(prefersMarkdown('*/*')).toBe(false);
    expect(prefersMarkdown('text/*')).toBe(false);
  });
});

describe('Worker discovery boundary', () => {
  it('serves the current-origin catalog and sitemap', async () => {
    const catalogResponse = handlePublicDiscovery(new Request('http://localhost:8787/api/ai'));
    const sitemapResponse = handlePublicDiscovery(new Request('http://localhost:8787/sitemap.xml'));
    expect(catalogResponse?.status).toBe(200);
    expect(sitemapResponse?.status).toBe(200);

    const catalog = await catalogResponse?.json();
    expect(catalog.url).toBe('http://localhost:8787');
    expect(catalog.surfaces).toHaveLength(4);
    expect(await sitemapResponse?.text()).toContain('<loc>http://localhost:8787/play</loc>');
  });

  it('serves explicit and negotiated route Markdown', async () => {
    const explicit = handlePublicDiscovery(new Request('https://historia.aliveville.com/about.md'));
    const negotiated = handlePublicDiscovery(
      new Request('https://historia.aliveville.com/play', {
        headers: { Accept: 'text/markdown, text/html;q=0.8' },
      })
    );

    expect(explicit?.status).toBe(200);
    expect(explicit?.headers.get('content-type')).toContain('text/markdown');
    expect(explicit?.headers.get('content-location')).toBe('/about.md');
    expect(await explicit?.text()).toContain('Steer history');
    expect(negotiated?.status).toBe(200);
    expect(await negotiated?.text()).toContain('Start an AI grand-strategy');
  });

  it('returns Markdown 404 without exposing a private campaign', async () => {
    const response = handlePublicDiscovery(
      new Request('https://historia.aliveville.com/play/private-campaign.md')
    );
    expect(response?.status).toBe(404);
    expect(await response?.text()).not.toContain('private-campaign.md');
  });
});

describe('generated file parity', () => {
  it('keeps checked-in public files equal to contract output', async () => {
    const expected = new Map([
      ['robots.txt', renderRobotsTxt()],
      ['sitemap.xml', renderSitemapXml()],
      ['llms.txt', renderLlmsTxt()],
      ['llms-full.txt', renderLlmsFullTxt()],
      ['api-ai.json', `${JSON.stringify(createAgentCatalog(), null, 2)}\n`],
      ...PUBLIC_ROUTES.map(
        (route) =>
          [markdownPathFor(route.path).replace(/^\//, ''), renderRouteMarkdown(route)] as const
      ),
    ]);

    for (const [relative, content] of expected) {
      expect(await readFile(resolve('public', relative), 'utf8'), relative).toBe(content);
    }
  });

  it('keeps the generated SPA shell on the public Play contract', async () => {
    const appHtml = await readFile(resolve('app.html'), 'utf8');
    const metadata = routeMetadata('/play');
    expect(appHtml).toContain(`<title>${metadata?.title}</title>`);
    expect(appHtml).toContain(`href="${metadata?.canonical}"`);
    expect(appHtml).toContain(`content="${metadata?.description}"`);
    expect(appHtml).toContain('<script type="application/ld+json">');
    expect(appHtml).toContain('data-public-route="play"');
  });
});

function wordCount(value: string | null) {
  return (value ?? '').trim().split(/\s+/).filter(Boolean).length;
}

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, ' ');
}
