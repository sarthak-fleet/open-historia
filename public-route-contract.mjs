export const SITE_ORIGIN = 'https://historia.aliveville.com';
export const SITE_NAME = 'Open Historia';
export const SOCIAL_IMAGE_PATH = '/og.png';

export const PUBLIC_ROUTES = Object.freeze([
  {
    id: 'home',
    path: '/',
    owner: 'astro',
    title: 'Open Historia — AI Grand Strategy Game',
    description:
      'Command a civilization in plain English while an AI Game Master adjudicates diplomacy, territory, events, and alternate history on a living world map.',
    eyebrow: 'Open-source AI grand strategy',
    heading: 'Rewrite history with your own orders.',
    changeFrequency: 'weekly',
    priority: 1,
    schemaType: 'WebApplication',
    intro:
      'Open Historia is a single-player grand-strategy game where natural-language decisions become changes on a living map. Choose a historical, modern, alternate, or fictional scenario, lead a nation, and tell the Game Master what you want to do.',
    sections: [
      {
        heading: 'Command through language',
        paragraphs: [
          'Instead of navigating a fixed build queue, you issue orders in plain English. Raise an army, negotiate an alliance, fund a rebellion, reform an economy, or attempt a plan the interface never anticipated. The AI acts as the rules engine and explains what succeeds, what fails, and why.',
          'Each turn follows a strict response contract. The Game Master returns narrative, map updates, new events, diplomatic changes, and a compressed story-so-far. Open Historia validates that structure before it changes the campaign, keeping an open-ended game inspectable.',
        ],
      },
      {
        heading: 'A world that responds',
        paragraphs: [
          'The MapLibre world map moves between countries, regions, and detailed states as you zoom. Territory ownership and diplomatic borders change with the campaign. Direct conversations with other nations can create alliances, hostility, war, or vassal relationships.',
          'A timeline records the consequences of every turn. Rewind to an earlier snapshot, branch a different decision, and compare the alternate histories that follow. The point is not to reproduce one correct past, but to make cause and effect visible.',
        ],
      },
      {
        heading: 'Play without surrendering control',
        paragraphs: [
          'Guest play and local saves work without an account. Optional Google sign-in enables cloud saves. Players choose the AI provider used for adjudication, including supported hosted providers or a local OpenAI-compatible endpoint during development.',
          'Open Historia is open source and intentionally single-player. It is a research prototype for a coherent AI strategy loop, not a hidden hard-math simulation or a multiplayer marketplace. The public pages describe the product; campaign identifiers and saved state remain outside search and agent indexes.',
        ],
      },
    ],
    links: [
      { label: 'Start a campaign', href: '/play' },
      { label: 'How Open Historia works', href: '/about' },
      { label: 'Privacy', href: '/privacy' },
      {
        label: 'Source repository',
        href: 'https://github.com/sarthakagrawal927/open-historia',
      },
    ],
  },
  {
    id: 'play',
    path: '/play',
    owner: 'spa',
    title: 'Play Open Historia — AI Grand Strategy',
    description:
      'Start a public Open Historia campaign, choose a scenario and nation, issue natural-language orders, and watch the AI-adjudicated world respond.',
    eyebrow: 'Public game entry',
    heading: 'Start an AI grand-strategy campaign.',
    changeFrequency: 'weekly',
    priority: 0.9,
    schemaType: 'VideoGame',
    intro:
      "The Play surface is the public entry to Open Historia's single-player campaign loop. It lets you choose a scenario, nation, AI provider, and difficulty before the map, command terminal, diplomacy, advisor, and timeline become your campaign workspace.",
    sections: [
      {
        heading: 'Choose the history you want to enter',
        paragraphs: [
          'Preset scenarios cover historical eras such as the Second World War, the Cold War, and the fall of empires, alongside modern, alternate-history, and fictional starting points. You can also shape a custom scenario instead of accepting a preset premise.',
          'After selecting the civilization you control, you choose an AI provider and difficulty profile. Difficulty changes how the Game Master interprets risk, opposition, and generosity rather than hiding a fixed numerical bonus behind the interface.',
        ],
      },
      {
        heading: 'Issue orders and inspect consequences',
        paragraphs: [
          'Commands are written in ordinary language and can be queued before time advances. The Game Master adjudicates the batch against the current map, relationships, prior events, and running campaign summary. Returned updates are parsed and validated before they reach the client state.',
          'Consequences appear across the same workspace: territorial changes on the map, new entries in the timeline, diplomatic shifts, and an explanation in the terminal. The advisor can suggest military, diplomatic, or economic options without taking control away from the player.',
        ],
      },
      {
        heading: 'Save locally or sign in for cloud saves',
        paragraphs: [
          'A guest can play and retain local saves in the browser without creating an account. Optional sign-in enables cloud save management. Saved campaigns are user state, so their identifiers and contents are deliberately excluded from the public sitemap, agent catalog, and Markdown endpoints.',
          "The canonical public route is `/play`. A route such as `/play/:id` may resume a particular campaign, but it is marked noindex and canonicalized back to this public entry. Crawlers receive an explanation of the game template, never a player's private orders or state.",
        ],
      },
      {
        heading: 'What the game does not claim',
        paragraphs: [
          'Open Historia is not a deterministic military simulator. The AI is the rules engine, operating through a strict JSON contract, and its decisions can still be surprising or imperfect. The interface is designed to make those decisions readable and reversible.',
          'The current product is a single-player research prototype. Archived Story Rooms, multiplayer, scenario marketplaces, and community publishing are not part of this public game surface. The focus is one coherent loop from natural-language intent to inspectable world change.',
        ],
      },
    ],
    links: [
      { label: 'About the game loop', href: '/about' },
      { label: 'Read the privacy boundary', href: '/privacy' },
      { label: 'Return to Open Historia', href: '/' },
    ],
  },
  {
    id: 'about',
    path: '/about',
    owner: 'spa',
    title: 'About Open Historia — How the AI Game Works',
    description:
      'Learn how Open Historia turns natural-language strategy into validated map, diplomacy, event, and timeline updates across branching campaigns.',
    eyebrow: 'How the simulation works',
    heading: 'Steer history, one order at a time.',
    changeFrequency: 'monthly',
    priority: 0.7,
    schemaType: 'AboutPage',
    intro:
      'Open Historia is an open-source AI grand-strategy experiment. A player commands a civilization in plain English while a large-language-model Game Master adjudicates the turn and returns structured changes to a live map, diplomatic network, and branching timeline.',
    sections: [
      {
        heading: 'The campaign loop',
        paragraphs: [
          'A campaign begins with a scenario, a player nation, an AI provider, and a difficulty profile. The player queues strategic orders and advances time. Those orders can concern armies, alliances, internal reform, covert action, economics, or any other plan that can be described clearly.',
          'The server sends the relevant campaign context to the selected model. The response must match a strict JSON shape containing narrative, state updates, new events, relationship changes, and an updated story-so-far. Invalid responses are rejected rather than applied blindly.',
        ],
      },
      {
        heading: 'The map, diplomacy, and timeline',
        paragraphs: [
          "The MapLibre map uses multiple levels of geographic detail so campaigns can move from global strategy to regional consequences. Province ownership and relationship borders visualize the Game Master's decisions instead of leaving the result trapped in prose.",
          'Diplomacy threads preserve conversations with other nations and track whether relations are neutral, friendly, allied, hostile, at war, or vassalized. Timeline snapshots let the player rewind to an earlier turn and branch an alternate history without erasing the path already explored.',
        ],
      },
      {
        heading: 'AI provider and data boundaries',
        paragraphs: [
          'Players choose among supported hosted providers or, in development, a local compatible endpoint. The campaign state required to adjudicate a turn is sent to that selected provider. Provider behavior and privacy terms therefore matter and are described before play.',
          'Guest campaigns can remain local to the browser. Optional authentication enables cloud saves through the server. Save records, campaign identifiers, commands, and generated state are private gameplay data and are never treated as public content for search or agent discovery.',
        ],
      },
      {
        heading: 'Research scope',
        paragraphs: [
          'The product asks whether an AI can serve as an expressive but inspectable strategy rules engine. The strict response contract, visible state changes, timeline, and rewind tools are all safeguards around that experiment rather than attempts to hide model uncertainty.',
          'Open Historia is currently single-player and paused as a maintained research prototype. Story Rooms was archived because its collaborative writing and canon-voting concept diverged from the strategy loop. Multiplayer, marketplaces, and generic writing tools remain out of scope.',
        ],
      },
    ],
    links: [
      { label: 'Play Open Historia', href: '/play' },
      { label: 'Privacy and data handling', href: '/privacy' },
      {
        label: 'Inspect the source',
        href: 'https://github.com/sarthakagrawal927/open-historia',
      },
    ],
  },
  {
    id: 'privacy',
    path: '/privacy',
    owner: 'spa',
    title: 'Open Historia Privacy and Campaign Data',
    description:
      'Understand local and cloud saves, Google sign-in, AI-provider requests, optional stored API keys, analytics, and deletion in Open Historia.',
    eyebrow: 'Privacy and data handling',
    heading: 'Your campaigns are not public content.',
    changeFrequency: 'yearly',
    priority: 0.4,
    schemaType: 'WebPage',
    intro:
      'Open Historia separates public product documentation from private gameplay. The public site explains how the game works, while campaign identifiers, saved states, command history, provider credentials, and account records stay outside search indexes and agent-readable catalogs.',
    sections: [
      {
        heading: 'Guest play and local saves',
        paragraphs: [
          'You can begin a campaign without signing in. Local saves are stored by the browser on the device where you play, so they do not become server-side public pages. Clearing browser storage or changing devices can remove access to those local records.',
          'A local save contains the game information needed to restore a campaign, including ownership, command history, and the running story context used by the simulation. Open Historia does not publish that content, create sitemap routes for it, or expose it through Markdown negotiation.',
        ],
      },
      {
        heading: 'Accounts and cloud saves',
        paragraphs: [
          'Google sign-in is optional and is used to associate cloud saves with an account. The authentication system can store the account identifier, name, email address, and avatar supplied through OAuth. Cloud save records are handled by the authenticated save API.',
          'Save routes require the appropriate user context and are explicitly disallowed for crawlers. A campaign resume URL may contain an identifier, but it is marked noindex and canonicalized to the general Play page so the identifier never becomes part of the public corpus.',
        ],
      },
      {
        heading: 'AI providers and credentials',
        paragraphs: [
          "When you advance a turn, the campaign context needed for adjudication is sent to the AI provider selected in setup. That payload can include current world state, recent commands and logs, events, diplomacy, and the compressed story-so-far. The selected provider's privacy policy applies.",
          'If a player chooses to store an API key through the supported settings flow, the server stores an encrypted copy for that account. Provider keys are operational credentials, not public profile data, and are never included in the sitemap, agent catalog, or public Markdown.',
        ],
      },
      {
        heading: 'Analytics, deletion, and scope',
        paragraphs: [
          'The product does not use third-party advertising or remarketing to publish player behavior. Operational monitoring can measure whether the application works, but saved campaigns and commands are not shared as public content or sold as an audience.',
          'Players can delete individual saves through the product and can revoke the Google OAuth grant through their account controls. This page describes the current prototype boundary; provider retention, browser storage, and account revocation can have their own separate rules.',
        ],
      },
    ],
    links: [
      { label: 'Return to Open Historia', href: '/' },
      { label: 'Read how the game works', href: '/about' },
      { label: 'Open the public game entry', href: '/play' },
    ],
  },
]);

const ROUTE_BY_PATH = new Map(PUBLIC_ROUTES.map((route) => [route.path, route]));

export const ROBOTS_ALLOW = Object.freeze([
  '/',
  '/about',
  '/play',
  '/privacy',
  '/api/ai',
  '/llms.txt',
  '/llms-full.txt',
  '/index.md',
]);

export const ROBOTS_DISALLOW = Object.freeze(['/api/', '/play/', '/story-room']);

export function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/';
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return withLeadingSlash.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
}

export function publicRouteForPath(pathname) {
  return ROUTE_BY_PATH.get(normalizePath(pathname)) ?? null;
}

export function isPrivateGameplayPath(pathname) {
  return normalizePath(pathname).startsWith('/play/');
}

export function markdownPathFor(pathname) {
  const path = normalizePath(pathname);
  return path === '/' ? '/index.md' : `${path}.md`;
}

export function htmlPathFromMarkdown(pathname) {
  const path = normalizePath(pathname);
  if (path === '/index.md') return '/';
  return path.endsWith('.md') ? normalizePath(path.slice(0, -3)) : path;
}

export function absoluteUrl(pathname, origin = SITE_ORIGIN) {
  return new URL(pathname, `${origin.replace(/\/+$/, '')}/`).toString();
}

export function routeMetadata(routeOrPath, origin = SITE_ORIGIN) {
  const route = typeof routeOrPath === 'string' ? publicRouteForPath(routeOrPath) : routeOrPath;
  if (!route) return null;
  const canonical = absoluteUrl(route.path, origin);
  return {
    ...route,
    canonical,
    image: absoluteUrl(SOCIAL_IMAGE_PATH, origin),
    markdown: absoluteUrl(markdownPathFor(route.path), origin),
    robots: 'index,follow',
  };
}

export function privateGameplayMetadata(origin = SITE_ORIGIN) {
  return {
    title: 'Private campaign — Open Historia',
    description:
      'This campaign route can contain private saved-game state and is not available for public indexing.',
    canonical: absoluteUrl('/play', origin),
    image: absoluteUrl(SOCIAL_IMAGE_PATH, origin),
    markdown: null,
    robots: 'noindex,nofollow,noarchive',
  };
}

export function structuredDataForRoute(routeOrPath, origin = SITE_ORIGIN) {
  const route = typeof routeOrPath === 'string' ? publicRouteForPath(routeOrPath) : routeOrPath;
  if (!route) return null;
  const url = absoluteUrl(route.path, origin);
  const base = {
    '@context': 'https://schema.org',
    '@type': route.schemaType,
    name: route.title,
    description: route.description,
    url,
    image: absoluteUrl(SOCIAL_IMAGE_PATH, origin),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: absoluteUrl('/', origin),
    },
  };
  if (route.id === 'home') {
    return {
      ...base,
      applicationCategory: 'GameApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    };
  }
  if (route.id === 'play') {
    return {
      ...base,
      genre: ['Grand strategy', 'Historical simulation'],
      gamePlatform: 'Web Browser',
      playMode: 'SinglePlayer',
      isAccessibleForFree: true,
    };
  }
  return base;
}

export function renderRouteMarkdown(routeOrPath, origin = SITE_ORIGIN) {
  const route = typeof routeOrPath === 'string' ? publicRouteForPath(routeOrPath) : routeOrPath;
  if (!route) return null;
  const sections = route.sections
    .map((section) => {
      const paragraphs = section.paragraphs.join('\n\n');
      const items = section.items?.length
        ? `\n\n${section.items.map((item) => `- ${item}`).join('\n')}`
        : '';
      return `## ${section.heading}\n\n${paragraphs}${items}`;
    })
    .join('\n\n');
  const links = route.links
    .map((link) => `- [${link.label}](${absoluteUrl(link.href, origin)})`)
    .join('\n');
  return `# ${route.heading}\n\n> Canonical source: ${absoluteUrl(
    route.path,
    origin
  )}\n\n${route.description}\n\n${route.intro}\n\n${sections}\n\n## Continue\n\n${links}\n`;
}

export function renderRouteFallbackHtml(routeOrPath, origin = SITE_ORIGIN) {
  const route = typeof routeOrPath === 'string' ? publicRouteForPath(routeOrPath) : routeOrPath;
  if (!route) return '';
  const sections = route.sections
    .map((section) => {
      const paragraphs = section.paragraphs
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join('');
      const items = section.items?.length
        ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
        : '';
      return `<section><h2>${escapeHtml(section.heading)}</h2>${paragraphs}${items}</section>`;
    })
    .join('');
  const links = route.links
    .map(
      (link) =>
        `<li><a href="${escapeHtml(
          absoluteUrl(link.href, origin)
        )}">${escapeHtml(link.label)}</a></li>`
    )
    .join('');
  return `<main id="route-static-fallback" data-public-route="${escapeHtml(
    route.id
  )}"><header><p class="route-eyebrow">${escapeHtml(
    route.eyebrow
  )}</p><h1>${escapeHtml(route.heading)}</h1><p>${escapeHtml(
    route.intro
  )}</p></header>${sections}<nav aria-label="Public Open Historia pages"><h2>Continue</h2><ul>${links}</ul></nav></main>`;
}

export function renderPrivateGameplayFallbackHtml() {
  return '<main id="route-static-fallback" data-public-route="private-campaign"><h1>Private campaign</h1><p>This route can identify a saved Open Historia campaign. Its state, commands, and history are not public content. Open the general Play page to start or resume through the application.</p><p><a href="/play">Go to the public Play page</a></p></main>';
}

export function renderSitemapXml(origin = SITE_ORIGIN) {
  const entries = PUBLIC_ROUTES.map(
    (route) => `  <url>
    <loc>${escapeXml(absoluteUrl(route.path, origin))}</loc>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

export function renderRobotsTxt(origin = SITE_ORIGIN) {
  return [
    'User-agent: *',
    ...ROBOTS_ALLOW.map((path) => `Allow: ${path}`),
    ...ROBOTS_DISALLOW.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${absoluteUrl('/sitemap.xml', origin)}`,
    '',
  ].join('\n');
}

export function createAgentCatalog(origin = SITE_ORIGIN) {
  return {
    name: SITE_NAME,
    version: '1',
    url: absoluteUrl('/', origin).replace(/\/$/, ''),
    llms: absoluteUrl('/llms.txt', origin),
    llmsFull: absoluteUrl('/llms-full.txt', origin),
    sitemap: absoluteUrl('/sitemap.xml', origin),
    robots: absoluteUrl('/robots.txt', origin),
    markdown: { suffix: '.md', negotiation: true },
    surfaces: PUBLIC_ROUTES.map((route) => ({
      id: route.id,
      url: absoluteUrl(route.path, origin),
      md: absoluteUrl(markdownPathFor(route.path), origin),
      kind: route.owner === 'astro' ? 'static' : 'application',
      description: route.description,
    })),
    auth: {
      public: true,
      notes:
        'Saved campaigns, campaign identifiers, auth, APIs, and archived Story Rooms are not public indexed documents.',
    },
  };
}

export function renderLlmsTxt(origin = SITE_ORIGIN) {
  const productLinks = PUBLIC_ROUTES.map(
    (route) => `- [${route.heading}](${absoluteUrl(route.path, origin)}): ${route.description}`
  ).join('\n');
  return `# Open Historia

> Open-source AI grand strategy where natural-language orders become validated changes to a living map, diplomacy network, and branching timeline.

## Public product

${productLinks}

## Agent-readable surfaces

- [Full product brief](${absoluteUrl('/llms-full.txt', origin)})
- [Agent catalog](${absoluteUrl('/api/ai', origin)})
- [HTML sitemap](${absoluteUrl('/sitemap.xml', origin)})

Every URL in the sitemap has a substantive same-origin Markdown alternate and supports \`Accept: text/markdown\`.

## Privacy boundary

Saved campaigns, \`/play/:id\`, auth, APIs, player commands, and archived Story Rooms are excluded from public discovery.
`;
}

export function renderLlmsFullTxt(origin = SITE_ORIGIN) {
  const routeDocuments = PUBLIC_ROUTES.map((route) => renderRouteMarkdown(route, origin)).join(
    '\n\n---\n\n'
  );
  return `# Open Historia — full public brief

Open Historia is an open-source single-player grand-strategy research prototype. It uses an AI Game Master as an expressive rules engine while strict response validation, visible state changes, a timeline, and rewind controls make the results inspectable.

## Public corpus

The canonical HTML corpus contains exactly four routes: \`/\`, \`/play\`, \`/about\`, and \`/privacy\`. The sitemap, catalog, metadata, and Markdown below derive from one route contract.

## Explicit exclusions

- \`/play/:id\` can identify private campaign state and is noindex.
- \`/api/saves/*\` and \`/api/auth/*\` are private operational routes.
- Other APIs are not HTML documents.
- \`/story-room\` is an archived experiment and is not routed or indexed.

${routeDocuments.trimEnd()}
`;
}

export function prefersMarkdown(acceptHeader) {
  if (!acceptHeader) return false;
  const markdownQuality = mediaQuality(acceptHeader, 'text/markdown', false);
  const htmlQuality = mediaQuality(acceptHeader, 'text/html');
  return markdownQuality > 0 && markdownQuality >= htmlQuality;
}

function mediaQuality(header, target, includeWildcards = true) {
  let quality = 0;
  for (const part of header.toLowerCase().split(',')) {
    const [mediaRange, ...params] = part.trim().split(';');
    const matchesWildcard = includeWildcards && (mediaRange === 'text/*' || mediaRange === '*/*');
    if (mediaRange !== target && !matchesWildcard) {
      continue;
    }
    const qualityParam = params.find((param) => param.trim().startsWith('q='));
    const parsed = qualityParam ? Number.parseFloat(qualityParam.trim().slice(2)) : 1;
    if (Number.isFinite(parsed)) quality = Math.max(quality, parsed);
  }
  return quality;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeXml(value) {
  return escapeHtml(value);
}
