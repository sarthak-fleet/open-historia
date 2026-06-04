# Project Status

Last updated: 2026-06-04

## Current Scope

Open Historia is an AI-powered grand strategy game where players issue natural-language commands and AI adjudicates outcomes, nation behavior, diplomacy, and emergent historical narratives.

## Done

- The app is built on Next.js/React and deploys to Cloudflare Workers through OpenNext.
- Turso/Drizzle persistence, better-auth Google login, AI provider integration, and local/cloud saves are documented.
- Core game surfaces include an AI Game Master, MapLibre world map, diplomacy engine, order queue, timeline rewind, AI advisor, and scenario presets.
- Story Rooms has a local-only v0.1 prototype at `/story-room` with submit, vote, canon growth, branch archive replay/revive, and fixture AI co-author suggestions.
- Story Rooms is currently positioned as an Open Historia mode, not a separate generic editor.
- Security audit notes and residual operational risks are documented in `AUDIT.md`.

## Planned Next

1. Connect natural-language orders, map state, timeline state, and AI adjudication into a tighter end-to-end campaign loop.
2. Decide whether Story Rooms graduates into the main game loop as collaborative historiography or remains a local experiment.
3. Improve diplomacy and nation behavior so turns produce inspectable, explainable consequences.
4. Revisit audit residuals around CORS and old deployment targets before production expansion.

## Deferred / Parked

- Generic collaborative writing/editor scope is deferred unless it directly strengthens Open Historia.
- Paid multiplayer, marketplace scenarios, and broad community publishing are parked behind a stable single-player loop.
- Story Rooms database persistence, API-backed AI, and cloud saves are deferred.
