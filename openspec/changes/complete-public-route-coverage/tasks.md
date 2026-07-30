## 1. Canonical Route Contract

- [x] 1.1 Add the portable four-route contract, reserved/private boundaries,
  Markdown renderers, metadata, structured data, sitemap, and catalog helpers.
- [x] 1.2 Generate checked-in robots, sitemap, LLM indexes, route Markdown,
  and catalog files from the contract.

## 2. Worker and HTML Integration

- [x] 2.1 Serve dynamic discovery responses, explicit Markdown alternates, and
  Markdown content negotiation at the Worker boundary.
- [x] 2.2 Transform SPA HTML with route-correct metadata, structured data, and
  crawlable fallback content.
- [x] 2.3 Mark `/play/:id` state-bearing routes `noindex`, canonicalize them to
  `/play`, and keep APIs and Story Rooms excluded.
- [x] 2.4 Derive Astro landing metadata and structured data from the contract.

## 3. Verification and Product Truth

- [x] 3.1 Add parity tests for exact route coverage, private exclusions,
  sitemap/catalog agreement, substantive Markdown, and metadata.
- [x] 3.2 Run format/lint, typecheck, unit tests, production build, strict
  OpenSpec validation, and final diff checks.
- [x] 3.3 Run and record local SEO and Fleet agent-readiness audits.
- [x] 3.4 Update only `PROJECT_STATUS.md` with the completed public discovery
  contract and current owned domain.
