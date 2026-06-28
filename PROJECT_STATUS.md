# open-historia — PROJECT STATUS

Last updated: 2026-06-28

## Why/What

**Thesis:** AI-powered grand strategy game — players issue natural-language commands; AI adjudicates outcomes, nation behavior, diplomacy, and emergent historical narratives. Single-player campaign loop is the focus.

**In scope:** Vite + React SPA game, Hono worker API, MapLibre 3-tier map, diplomacy engine, order queue, timeline rewind, AI advisor, 20+ scenario presets, optional cloud saves (Turso + Google auth), Astro marketing landing at `/`, Story Rooms local prototype.

**Out / parked:** Multiplayer, marketplace scenarios, Story Rooms cloud persistence, generic collaborative writing unless it strengthens the game.

## Dependencies

### External

- **Deploy:** Cloudflare Workers (Hono worker + Vite static assets).
- **Map:** MapLibre GL JS + Natural Earth / world-atlas TopoJSON.
- **DB:** Turso (libSQL) + Drizzle — cloud saves.
- **Auth:** better-auth + Google OAuth (optional).
- **AI:** free-ai-gateway chokepoint; Anthropic, OpenAI, Gemini, DeepSeek; in-memory rate limiting on AI routes (`lib/rate-limit.ts`).
- **Offline saves:** Browser localStorage works without auth. Cloud saves require Turso + Google OAuth env vars.
- **Repository:** github.com/sarthak-fleet/open-historia.

### Internal fleet

- **Landing overlay:** `landing-astro/` overlaid at `/` via `scripts/overlay-astro-landing.mjs`.
- **@saas-maker/feedback:** widget integration.

### Stack & commands

| Layer | Technology |
| --- | --- |
| Frontend | Vite 8 + React 19 SPA (`app.html`); React Compiler via babel plugin |
| Game routes | `/play`, `/play/:id`, `/story-room`, `/about`, `/privacy` |
| Map | MapLibre GL JS + Natural Earth / world-atlas TopoJSON |
| Worker | Hono on Cloudflare Workers — `src/worker.ts` + `src/worker/routes/*` |
| DB | Turso (libSQL) + Drizzle — cloud saves |
| Auth | better-auth + Google OAuth (optional) |
| AI | free-ai-gateway chokepoint |
| Landing | `landing-astro/` overlaid at `/` |
| Tests | Vitest unit; Playwright e2e (desktop + mobile) |

```bash
pnpm install
pnpm dev                    # wrangler dev + vite concurrently
pnpm dev:fe | pnpm dev:worker
pnpm build | pnpm cf:build  # vite build + Astro landing overlay
pnpm validate:env:deploy && pnpm deploy
pnpm lint | pnpm typecheck | pnpm test | pnpm test:e2e | pnpm test:e2e:mobile
pnpm db:generate | db:migrate | db:push | db:studio
pnpm format | pnpm check    # biome
```

```
Browser → Cloudflare Worker
  ├─ /api/auth/*     better-auth handler
  ├─ /api/saves/*    Turso CRUD + upload
  ├─ /api/turn       execute commands (LLM proxy)
  ├─ /api/chat       diplomacy chat
  ├─ /api/advisor    strategic advice
  └─ ASSETS          Vite build + landing index.html + SPA fallback for /play/*
```

**De-OpenNext migration complete:** Vite SPA + Hono worker replaces prior OpenNext stack. README and `AGENTS.md` stack/deploy/structure sections were realigned to the Vite + Hono reality (2026-06-23); `package.json` scripts remain authoritative on commands.

## Timeline

- **Stack migration:** De-OpenNext complete — Vite SPA + Hono worker is current production path.
- **Story Rooms v0.1:** local prototype at `/story-room` — no shared database with core strategy saves.
- **README/AGENTS drift fixed (2026-06-23):** stack, deploy, and repo-structure sections now describe the Vite SPA + Hono worker stack.

## Products

| Product | Route / surface | Role |
| --- | --- | --- |
| Grand strategy game | `/play`, `/play/:id` | Natural-language orders, map, diplomacy, timeline |
| Story Rooms | `/story-room` | Local collaborative canon prototype (v0.1) |
| Marketing landing | `/` | Astro overlay with WWII sample timeline + CTA |
| Cloud saves | `/api/saves/*` | Turso persistence with optional Google auth |
| Local saves | Browser localStorage | Works without authentication |

## Features (shipped)

### Core game systems

- **AI Game Master:** Multiple providers, 5 difficulty levels, era-aware narrative, dynamic events.
- **Interactive map:** 3-tier LOD (country → region → province); click-to-select; relation borders (war/hostile/allied styling); themes (classic, cyberpunk, parchment, blueprint).
- **Diplomacy engine:** Direct chat with AI leaders; relationship tracking (neutral, friendly, allied, hostile, war, vassal).
- **Order queue:** Queue multiple commands; advance time to execute.
- **Timeline rewind:** Review past turns; branch alternate timelines.
- **AI advisor:** Military/diplomatic/economic advice on demand.
- **20+ presets:** Historical (WWII, Cold War, Fall of Rome, …), modern, alternate history, fictional scenarios — see `lib/presets.ts`.

### Persistence & auth

- Turso persistence for cloud saves; Drizzle schema + migrations.
- better-auth Google login; save CRUD + upload endpoints in worker.
- Local-only saves without authentication.

### Story Rooms (v0.1 prototype)

- Isolated local demo at `/story-room` — voted collaborative canon, branch archive, fixture AI co-author suggestions.
- No shared database with core strategy saves.

### Landing & activation

- Astro landing at `/` with WWII sample timeline from `ww2-1939` preset + "Start exploring" CTA in `PresetBrowser`.

### Quality

- React Compiler enabled.
- Vitest + Playwright coverage; mobile e2e project.
- Biome format/check in CI scripts.
- Rate limiting on AI routes via in-memory sliding-window limiter (`lib/rate-limit.ts`).

## Todo / Planned / Deferred / Blocked

### Planned

1. Tighten end-to-end campaign loop — natural-language orders, map state, timeline, and AI adjudication in one coherent turn cycle.
2. Decide whether Story Rooms graduates into main game or stays local experiment.
3. Improve diplomacy and nation behavior — inspectable, explainable turn consequences.
4. Revisit CORS audit residuals before production expansion.

### Deferred

- Generic collaborative writing/editor scope unless it directly strengthens the game.
- Paid multiplayer, marketplace scenarios, community publishing — behind stable single-player loop.
- Story Rooms database persistence, API-backed AI, cloud saves.
- Real-time multiplayer.

### Blocked

- AI providers require internet; local dev AI bridge (`lib/local-ai.ts`, `LOCAL_AI_URL`) for dev mode only.
- API cost varies by provider ($0.10–$0.50/hr typical on GPT-4 class models) — user-supplied keys.
- Deploy: push to `main` triggers GitHub Actions; PRs get preview workers.
- Env validation: `pnpm validate:env:deploy` before production deploy.
- `AGENTS.md` — comprehensive file map and prompt system for AI agents.
