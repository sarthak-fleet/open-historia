## Why

Open Historia exposes four public HTML surfaces, but its sitemap, production
domain, agent catalog, Markdown, and SPA metadata disagree. Search and agent
crawlers therefore see an obsolete-domain sitemap, a missing `/api/ai`, and
generic empty HTML shells for every non-home route.

## What Changes

- Define one canonical contract for `/`, `/play`, `/about`, and `/privacy`.
- Keep `/play/:id`, save/auth/API routes, and archived Story Rooms outside the
  public HTML and Markdown boundary.
- Generate robots, the HTML-only sitemap, agent catalog, LLM indexes, and
  substantive route Markdown from the contract.
- Serve `.md` alternates and `Accept: text/markdown` for every public route.
- Add route-correct canonical, description, Open Graph, Twitter, structured
  data, and crawlable fallback content to the SPA shells.
- Add parity tests across route truth, sitemap, catalog, Markdown, and private
  exclusions.

## Capabilities

### New Capabilities

- `public-route-coverage`: Defines Open Historia's complete public HTML,
  metadata, sitemap, and agent-readable route contract.

### Modified Capabilities

None.

## Impact

The change affects the Worker routing boundary, SPA and Astro document
metadata, generated public discovery files, unit tests, and
`PROJECT_STATUS.md`. It adds no production dependencies and does not change
gameplay, saves, authentication, database schemas, secrets, or deployment.
