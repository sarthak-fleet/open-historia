# agents.md — open-historia

## Shared Fleet Standard

Also read and follow the shared fleet-level agent standard at `../AGENTS.md`. Treat this repository as owned product code: protect production stability, keep changes scoped, verify work, and record durable follow-up tasks when something remains incomplete or blocked.

## Purpose
AI grand-strategy history game — players issue natural language commands to control civilizations; LLM acts as game master returning strict JSON state updates.

## Stack
- Framework: Next.js 16 (App Router, React 19, React Compiler ON)
- Language: TypeScript (strict)
- Styling: Tailwind CSS v4 (dark/monospace; amber = actions, emerald = success, rose = war)
- Map: MapLibre GL JS (WebGL) via `react-map-gl/maplibre` — 3-tier hierarchical LOD
- DB: Turso (libSQL) + Drizzle ORM
- Auth: better-auth (Google OAuth + Drizzle adapter)
- AI: Anthropic, OpenAI, Google Gemini, DeepSeek, local (multi-provider)
- Testing: None configured
- Deploy: Vercel
- Package manager: pnpm

## Repo structure
```
app/
  page.tsx             # Main game orchestrator (~1,144 lines) — all core state
  [id]/page.tsx        # Game session by ID
  layout.tsx           # Root layout + better-auth session provider
  api/
    turn/route.ts      # Game Master: processes commands via AI → strict JSON updates
    chat/route.ts      # Bilateral diplomacy AI chat
    advisor/route.ts   # Strategic advisor AI
    saves/             # Cloud save CRUD
    auth/[...all]/     # better-auth dynamic handler
components/
  MapView.tsx          # MapLibre GL JS renderer — 3-tier LOD, hit-testing (~1,150 lines)
  CommandTerminal.tsx  # Terminal-style command input + history
  DiplomacyChat.tsx    # Multi-threaded nation chat UI
  Timeline.tsx         # Timeline with rewind + alternate history branching
  Advisor.tsx          # Strategic advisor panel
  GameSetup.tsx        # Scenario/nation/provider/difficulty config
  PresetBrowser.tsx    # 20+ preset scenario gallery
  SavedGamesList.tsx   # Cloud save browser
hooks/
  useGameState.ts      # Central game state
  useTurnProcessing.ts # POSTs command to /api/turn, handles JSON response
  useTimeline.ts       # Timeline snapshots
lib/
  ai-prompts.ts        # All LLM prompt templates (strict JSON contract)
  types.ts             # Province, Player, GameState, GameEvent, ChatThread
  world-loader.ts      # TopoJSON loading, province neighbor computation
  presets.ts           # 20+ scenario presets (historical/modern/alternate/fictional)
  auth.ts              # better-auth server config
  auth-client.ts       # better-auth browser client
  db/
    schema.ts          # Drizzle schema (users, sessions, saves)
    index.ts           # Turso libSQL client
  rate-limit.ts        # IP-based rate limiting for AI routes
  crypto.ts            # API key encryption helpers
server/
  index.mjs            # Express (port 3001) — local AI bridge, started by pnpm dev
public/
  world-50m.json       # TopoJSON world (mid-res, primary)
  world-110m.json      # TopoJSON world (low-res)
  provinces-combined.json
  admin1-detail.json   # Admin1-level detail (lazy-loaded at zoom >= 5)
scripts/
  build-provinces-map.mjs
```

## Key commands
```bash
pnpm dev          # Express local-AI server (:3001) + Next.js concurrently
pnpm build        # next build
pnpm start        # next start
pnpm lint         # eslint

# Database
pnpm db:generate  # drizzle-kit generate (migration files)
pnpm db:push      # drizzle-kit push (apply schema to Turso)
pnpm db:studio    # drizzle-kit studio
```

## Architecture notes
- **React Compiler ON** — do NOT add manual `useMemo`/`useCallback`.
- **AI as game engine**: AI returns strict JSON — `{ message, updates[], newEvents[], relationChanges[], updatedStorySoFar }`. Always validate AI JSON before applying. Contract defined in `lib/ai-prompts.ts`.
- **`storySoFar` pattern**: each turn, AI compresses full history into a running summary to keep token count constant. Only last 8 logs + last 5 events sent as detailed context.
- **Difficulty as AI personality**: `DIFFICULTY_PROFILES` change AI behavior instructions (not numeric stats).
- **Map 3-tier LOD**: Countries (zoom 0–3.5) → Regions/provinces (2.5–6.5) → States/admin1 (5.5+). Admin1 lazy-loaded at zoom 5. Use `queryRenderedFeatures` for hit-testing. Import `MapGL` (not `Map`) from `react-map-gl/maplibre` — avoids shadowing `globalThis.Map`.
- **Auth**: better-auth (not NextAuth). Client: `lib/auth-client.ts`. Server: `lib/auth.ts`. Google OAuth only.
- **Save format**: only `provinceOwners` (id + ownerId) serialized — survives TopoJSON ID changes.
- **Province name matching**: AI may return fuzzy names — `findProvince()` tries exact → suffix-stripped → parent country name.
- **`page.tsx` (~1,144 lines) and `MapView.tsx` (~1,150 lines)** are large files — be careful with edits.
- Env vars: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

<!-- FLEET-GUIDANCE:START -->

## Fleet Guidance

### Adding Tasks
- Add durable work items in SaaS Maker Cockpit Tasks when the task affects product behavior, deployment, user feedback, or fleet maintenance.
- Include the project slug, a concise title, acceptance criteria, priority/status, and links to relevant code, issues, traces, or dashboards.
- If task discovery starts locally in an editor or agent session, mirror the durable next step back into SaaS Maker before handoff.

### Using SaaS Maker
- Treat SaaS Maker as the system of record for project metadata, feedback, tasks, analytics, testimonials, changelog, and fleet visibility.
- Prefer API-first workflows through `fnd api`, the SDK, or widgets instead of one-off scripts when interacting with SaaS Maker features.
- Keep this agent file aligned with the project record when operating rules, integrations, or deployment conventions change.

### Free AI First
- Prefer free/local AI paths for routine development and analysis: the `free-ai` gateway, local models, provider free tiers, and cached context.
- Escalate to paid models only when complexity, correctness risk, or missing capability justifies the cost.
- Note any paid-AI use in the task or handoff when it materially affects cost, reproducibility, or future maintenance.

<!-- FLEET-GUIDANCE:END -->

## Active context
