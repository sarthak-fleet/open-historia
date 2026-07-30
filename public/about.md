# Steer history, one order at a time.

> Canonical source: https://historia.aliveville.com/about

Learn how Open Historia turns natural-language strategy into validated map, diplomacy, event, and timeline updates across branching campaigns.

Open Historia is an open-source AI grand-strategy experiment. A player commands a civilization in plain English while a large-language-model Game Master adjudicates the turn and returns structured changes to a live map, diplomatic network, and branching timeline.

## The campaign loop

A campaign begins with a scenario, a player nation, an AI provider, and a difficulty profile. The player queues strategic orders and advances time. Those orders can concern armies, alliances, internal reform, covert action, economics, or any other plan that can be described clearly.

The server sends the relevant campaign context to the selected model. The response must match a strict JSON shape containing narrative, state updates, new events, relationship changes, and an updated story-so-far. Invalid responses are rejected rather than applied blindly.

## The map, diplomacy, and timeline

The MapLibre map uses multiple levels of geographic detail so campaigns can move from global strategy to regional consequences. Province ownership and relationship borders visualize the Game Master's decisions instead of leaving the result trapped in prose.

Diplomacy threads preserve conversations with other nations and track whether relations are neutral, friendly, allied, hostile, at war, or vassalized. Timeline snapshots let the player rewind to an earlier turn and branch an alternate history without erasing the path already explored.

## AI provider and data boundaries

Players choose among supported hosted providers or, in development, a local compatible endpoint. The campaign state required to adjudicate a turn is sent to that selected provider. Provider behavior and privacy terms therefore matter and are described before play.

Guest campaigns can remain local to the browser. Optional authentication enables cloud saves through the server. Save records, campaign identifiers, commands, and generated state are private gameplay data and are never treated as public content for search or agent discovery.

## Research scope

The product asks whether an AI can serve as an expressive but inspectable strategy rules engine. The strict response contract, visible state changes, timeline, and rewind tools are all safeguards around that experiment rather than attempts to hide model uncertainty.

Open Historia is currently single-player and paused as a maintained research prototype. Story Rooms was archived because its collaborative writing and canon-voting concept diverged from the strategy loop. Multiplayer, marketplaces, and generic writing tools remain out of scope.

## Continue

- [Play Open Historia](https://historia.aliveville.com/play)
- [Privacy and data handling](https://historia.aliveville.com/privacy)
- [Inspect the source](https://github.com/sarthakagrawal927/open-historia)
