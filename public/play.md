# Start an AI grand-strategy campaign.

> Canonical source: https://historia.aliveville.com/play

Start a public Open Historia campaign, choose a scenario and nation, issue natural-language orders, and watch the AI-adjudicated world respond.

The Play surface is the public entry to Open Historia's single-player campaign loop. It lets you choose a scenario, nation, AI provider, and difficulty before the map, command terminal, diplomacy, advisor, and timeline become your campaign workspace.

## Choose the history you want to enter

Preset scenarios cover historical eras such as the Second World War, the Cold War, and the fall of empires, alongside modern, alternate-history, and fictional starting points. You can also shape a custom scenario instead of accepting a preset premise.

After selecting the civilization you control, you choose an AI provider and difficulty profile. Difficulty changes how the Game Master interprets risk, opposition, and generosity rather than hiding a fixed numerical bonus behind the interface.

## Issue orders and inspect consequences

Commands are written in ordinary language and can be queued before time advances. The Game Master adjudicates the batch against the current map, relationships, prior events, and running campaign summary. Returned updates are parsed and validated before they reach the client state.

Consequences appear across the same workspace: territorial changes on the map, new entries in the timeline, diplomatic shifts, and an explanation in the terminal. The advisor can suggest military, diplomatic, or economic options without taking control away from the player.

## Save locally or sign in for cloud saves

A guest can play and retain local saves in the browser without creating an account. Optional sign-in enables cloud save management. Saved campaigns are user state, so their identifiers and contents are deliberately excluded from the public sitemap, agent catalog, and Markdown endpoints.

The canonical public route is `/play`. A route such as `/play/:id` may resume a particular campaign, but it is marked noindex and canonicalized back to this public entry. Crawlers receive an explanation of the game template, never a player's private orders or state.

## What the game does not claim

Open Historia is not a deterministic military simulator. The AI is the rules engine, operating through a strict JSON contract, and its decisions can still be surprising or imperfect. The interface is designed to make those decisions readable and reversible.

The current product is a single-player research prototype. Archived Story Rooms, multiplayer, scenario marketplaces, and community publishing are not part of this public game surface. The focus is one coherent loop from natural-language intent to inspectable world change.

## Continue

- [About the game loop](https://historia.aliveville.com/about)
- [Read the privacy boundary](https://historia.aliveville.com/privacy)
- [Return to Open Historia](https://historia.aliveville.com/)
