## ADDED Requirements

### Requirement: Canonical public HTML inventory
The system SHALL define exactly `/`, `/play`, `/about`, and `/privacy` as
canonical public HTML routes in one shared route contract.

#### Scenario: Enumerate the public corpus
- **WHEN** sitemap, catalog, metadata, or Markdown output is generated
- **THEN** all four surfaces SHALL be derived from the same route descriptors

### Requirement: Private gameplay and API exclusion
The system MUST exclude state-bearing campaign routes, saves, auth, APIs, and
archived experiments from public indexing.

#### Scenario: Campaign identifier is requested
- **WHEN** a crawler requests `/play/:id`
- **THEN** the HTML SHALL be marked `noindex` and canonicalized to `/play`
- **THEN** no sitemap, catalog, or Markdown entry SHALL expose that identifier

#### Scenario: Non-public route is inspected
- **WHEN** a route under `/api/`, `/story-room`, or another reserved path is
  evaluated for public discovery
- **THEN** it SHALL not be accepted as a canonical public HTML document

### Requirement: Source-backed route Markdown
Every canonical public HTML route SHALL have substantive Markdown generated
from its route descriptor and available through both a stable `.md` alternate
and `Accept: text/markdown`.

#### Scenario: Explicit Markdown alternate
- **WHEN** a client requests `/about.md`
- **THEN** it SHALL receive a successful `text/markdown` response describing
  the public About surface

#### Scenario: Markdown content negotiation
- **WHEN** a client requests `/play` with Markdown preferred over HTML
- **THEN** it SHALL receive the same source-backed public Play document

### Requirement: Discovery surface parity
Robots, sitemap, `/api/ai`, `llms.txt`, and `llms-full.txt` SHALL agree on the
owned origin and public route boundary.

#### Scenario: Sitemap is generated
- **WHEN** a crawler reads `/sitemap.xml`
- **THEN** it SHALL contain exactly the four canonical public HTML URLs and no
  machine, API, save, or private gameplay route

#### Scenario: Agent catalog is generated
- **WHEN** a crawler reads `/api/ai`
- **THEN** it SHALL list exactly four same-origin HTML surfaces
- **THEN** every catalog surface SHALL have a readable same-origin Markdown
  target present in the sitemap

### Requirement: Route-correct HTML metadata
Each canonical public HTML response SHALL include a self-canonical URL,
route-specific title and description, Open Graph and Twitter fields,
structured data, one primary heading, and crawlable explanatory content.

#### Scenario: SPA content route is fetched without JavaScript
- **WHEN** `/about`, `/privacy`, or `/play` is fetched as HTML
- **THEN** the response SHALL expose the matching route metadata and
  server-visible fallback content before hydration

#### Scenario: Landing metadata is built
- **WHEN** Astro builds `/`
- **THEN** its canonical, description, social metadata, and structured data
  SHALL derive from the home route descriptor

### Requirement: Coverage parity tests
Automated tests SHALL fail when route inventory, sitemap, catalog, Markdown,
metadata, or private-route exclusion drift apart.

#### Scenario: Route truth changes
- **WHEN** a public route is added, removed, or renamed without updating all
  derived outputs
- **THEN** the parity test suite SHALL report the mismatch
