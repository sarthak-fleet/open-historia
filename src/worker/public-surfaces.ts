import {
  createAgentCatalog,
  htmlPathFromMarkdown,
  isPrivateGameplayPath,
  markdownPathFor,
  prefersMarkdown,
  privateGameplayMetadata,
  publicRouteForPath,
  renderLlmsFullTxt,
  renderLlmsTxt,
  renderPrivateGameplayFallbackHtml,
  renderRobotsTxt,
  renderRouteFallbackHtml,
  renderRouteMarkdown,
  renderSitemapXml,
  routeMetadata,
  SITE_NAME,
  SITE_ORIGIN,
  structuredDataForRoute,
} from '../../public-route-contract.mjs';

type PublicRoute = NonNullable<ReturnType<typeof publicRouteForPath>>;

const CACHE_CONTROL = 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600';

export function handlePublicDiscovery(request: Request): Response | null {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;

  const url = new URL(request.url);
  const path = url.pathname || '/';
  const origin = url.origin;
  const body = (content: string) => (request.method === 'HEAD' ? null : content);

  if (path === '/robots.txt') {
    return textResponse(body(renderRobotsTxt(origin)), 'text/plain');
  }
  if (path === '/sitemap.xml') {
    return textResponse(body(renderSitemapXml(origin)), 'application/xml');
  }
  if (path === '/llms.txt') {
    return textResponse(body(renderLlmsTxt(origin)), 'text/plain');
  }
  if (path === '/llms-full.txt') {
    return textResponse(body(renderLlmsFullTxt(origin)), 'text/plain');
  }
  if (path === '/api/ai') {
    return jsonResponse(request.method === 'HEAD' ? null : createAgentCatalog(origin));
  }

  const explicitMarkdown = path.endsWith('.md');
  const htmlPath = explicitMarkdown ? htmlPathFromMarkdown(path) : path;
  const route = publicRouteForPath(htmlPath);

  if (explicitMarkdown) {
    if (!route) {
      return markdownError(request.method, 'No public Markdown document exists for this route.');
    }
    return markdownResponse(request.method, route, renderRouteMarkdown(route, origin));
  }

  if (route && prefersMarkdown(request.headers.get('accept'))) {
    return markdownResponse(request.method, route, renderRouteMarkdown(route, origin));
  }

  return null;
}

export function addPublicDocumentHeaders(response: Response, route: PublicRoute): Response {
  const withHeaders = new Response(response.body, response);
  withHeaders.headers.set(
    'Link',
    `<${markdownPathFor(route.path)}>; rel="alternate"; type="text/markdown"`
  );
  withHeaders.headers.append('Vary', 'Accept');
  return withHeaders;
}

export function transformPublicSpaDocument(response: Response, route: PublicRoute): Response {
  const metadata = routeMetadata(route, SITE_ORIGIN);
  const structuredData = structuredDataForRoute(route, SITE_ORIGIN);
  if (!metadata || !structuredData) return response;

  const transformed = new HTMLRewriter()
    .on('title', new InnerContent(metadata.title))
    .on('meta[name="description"]', new Attribute('content', metadata.description))
    .on('meta[name="robots"]', new Attribute('content', metadata.robots))
    .on('link[rel="canonical"]', new Attribute('href', metadata.canonical))
    .on('link[rel="alternate"][type="text/markdown"]', new Attribute('href', metadata.markdown))
    .on('meta[property="og:type"]', new Attribute('content', 'website'))
    .on('meta[property="og:site_name"]', new Attribute('content', SITE_NAME))
    .on('meta[property="og:url"]', new Attribute('content', metadata.canonical))
    .on('meta[property="og:title"]', new Attribute('content', metadata.title))
    .on('meta[property="og:description"]', new Attribute('content', metadata.description))
    .on('meta[property="og:image"]', new Attribute('content', metadata.image))
    .on('meta[name="twitter:card"]', new Attribute('content', 'summary_large_image'))
    .on('meta[name="twitter:title"]', new Attribute('content', metadata.title))
    .on('meta[name="twitter:description"]', new Attribute('content', metadata.description))
    .on('meta[name="twitter:image"]', new Attribute('content', metadata.image))
    .on('script[type="application/ld+json"]', new InnerContent(safeJson(structuredData), true))
    .on('#root', new InnerContent(renderRouteFallbackHtml(route, SITE_ORIGIN), true))
    .transform(response);

  return addPublicDocumentHeaders(transformed, route);
}

export function transformPrivateGameplayDocument(response: Response): Response {
  const metadata = privateGameplayMetadata(SITE_ORIGIN);
  const transformed = new HTMLRewriter()
    .on('title', new InnerContent(metadata.title))
    .on('meta[name="description"]', new Attribute('content', metadata.description))
    .on('meta[name="robots"]', new Attribute('content', metadata.robots))
    .on('link[rel="canonical"]', new Attribute('href', metadata.canonical))
    .on('link[rel="alternate"][type="text/markdown"]', new RemoveElement())
    .on('meta[property="og:url"]', new Attribute('content', metadata.canonical))
    .on('meta[property="og:title"]', new Attribute('content', metadata.title))
    .on('meta[property="og:description"]', new Attribute('content', metadata.description))
    .on('meta[property="og:image"]', new Attribute('content', metadata.image))
    .on('meta[name="twitter:title"]', new Attribute('content', metadata.title))
    .on('meta[name="twitter:description"]', new Attribute('content', metadata.description))
    .on('meta[name="twitter:image"]', new Attribute('content', metadata.image))
    .on('script[type="application/ld+json"]', new RemoveElement())
    .on('#root', new InnerContent(renderPrivateGameplayFallbackHtml(), true))
    .transform(response);
  const withHeaders = new Response(transformed.body, transformed);
  withHeaders.headers.set('X-Robots-Tag', metadata.robots);
  return withHeaders;
}

export function routeDocumentKind(pathname: string) {
  const route = publicRouteForPath(pathname);
  if (route) return { kind: 'public' as const, route };
  if (isPrivateGameplayPath(pathname)) {
    return { kind: 'private-gameplay' as const };
  }
  return { kind: 'unavailable' as const };
}

class Attribute {
  constructor(
    private readonly name: string,
    private readonly value: string
  ) {}

  element(element: Element) {
    element.setAttribute(this.name, this.value);
  }
}

class InnerContent {
  constructor(
    private readonly content: string,
    private readonly html = false
  ) {}

  element(element: Element) {
    element.setInnerContent(this.content, { html: this.html });
  }
}

class RemoveElement {
  element(element: Element) {
    element.remove();
  }
}

function markdownResponse(method: string, route: PublicRoute, markdown: string | null) {
  if (!markdown) {
    return markdownError(method, 'The public route has no source-backed Markdown.');
  }
  return new Response(method === 'HEAD' ? null : markdown, {
    status: 200,
    headers: {
      'Cache-Control': CACHE_CONTROL,
      'Content-Location': markdownPathFor(route.path),
      'Content-Type': 'text/markdown; charset=utf-8',
      Link: `<${route.path}>; rel="canonical"; type="text/html"`,
      Vary: 'Accept',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function markdownError(method: string, detail: string) {
  const markdown = `# Not found\n\n${detail}\n`;
  return new Response(method === 'HEAD' ? null : markdown, {
    status: 404,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function textResponse(body: string | null, contentType: string) {
  return new Response(body, {
    status: 200,
    headers: {
      'Cache-Control': CACHE_CONTROL,
      'Content-Type': `${contentType}; charset=utf-8`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function jsonResponse(data: unknown) {
  return new Response(data === null ? null : `${JSON.stringify(data, null, 2)}\n`, {
    status: 200,
    headers: {
      'Cache-Control': CACHE_CONTROL,
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function safeJson(value: unknown) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}
