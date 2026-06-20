# Project Status

Last updated: 2026-06-20

## Current Scope

Open Historia is an AI-powered grand strategy game where players issue natural-language commands and AI adjudicates outcomes, nation behavior, diplomacy, and emergent historical narratives.

## Done

- **De-OpenNext migration complete:** Vite + React 19 SPA (`app.html`) + Hono worker (`src/worker.ts`) on Cloudflare Workers. Astro landing overlays `/`; game at `/play` and `/play/:id`.
- Turso/Drizzle persistence, better-auth Google login, and LLM proxy routes (`/api/turn`, `/api/chat`, `/api/advisor`) live in the Hono worker.
- Core game surfaces: AI Game Master, MapLibre world map, diplomacy engine, order queue, timeline rewind, AI advisor, scenario presets.
- Story Rooms local-only v0.1 prototype at `/story-room`.
- React Compiler re-enabled via Vite (`babel-plugin-react-compiler`).

## Planned Next

1. Connect natural-language orders, map state, timeline state, and AI adjudication into a tighter end-to-end campaign loop.
2. Decide whether Story Rooms graduates into the main game loop or remains a local experiment.
3. Improve diplomacy and nation behavior so turns produce inspectable, explainable consequences.
4. Revisit audit residuals around CORS before production expansion.

## Deferred / Parked

- Generic collaborative writing/editor scope is deferred unless it directly strengthens Open Historia.
- Paid multiplayer, marketplace scenarios, and broad community publishing are parked behind a stable single-player loop.
- Story Rooms database persistence, API-backed AI, and cloud saves are deferred.