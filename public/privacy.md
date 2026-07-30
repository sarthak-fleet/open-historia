# Your campaigns are not public content.

> Canonical source: https://historia.aliveville.com/privacy

Understand local and cloud saves, Google sign-in, AI-provider requests, optional stored API keys, analytics, and deletion in Open Historia.

Open Historia separates public product documentation from private gameplay. The public site explains how the game works, while campaign identifiers, saved states, command history, provider credentials, and account records stay outside search indexes and agent-readable catalogs.

## Guest play and local saves

You can begin a campaign without signing in. Local saves are stored by the browser on the device where you play, so they do not become server-side public pages. Clearing browser storage or changing devices can remove access to those local records.

A local save contains the game information needed to restore a campaign, including ownership, command history, and the running story context used by the simulation. Open Historia does not publish that content, create sitemap routes for it, or expose it through Markdown negotiation.

## Accounts and cloud saves

Google sign-in is optional and is used to associate cloud saves with an account. The authentication system can store the account identifier, name, email address, and avatar supplied through OAuth. Cloud save records are handled by the authenticated save API.

Save routes require the appropriate user context and are explicitly disallowed for crawlers. A campaign resume URL may contain an identifier, but it is marked noindex and canonicalized to the general Play page so the identifier never becomes part of the public corpus.

## AI providers and credentials

When you advance a turn, the campaign context needed for adjudication is sent to the AI provider selected in setup. That payload can include current world state, recent commands and logs, events, diplomacy, and the compressed story-so-far. The selected provider's privacy policy applies.

If a player chooses to store an API key through the supported settings flow, the server stores an encrypted copy for that account. Provider keys are operational credentials, not public profile data, and are never included in the sitemap, agent catalog, or public Markdown.

## Analytics, deletion, and scope

The product does not use third-party advertising or remarketing to publish player behavior. Operational monitoring can measure whether the application works, but saved campaigns and commands are not shared as public content or sold as an audience.

Players can delete individual saves through the product and can revoke the Google OAuth grant through their account controls. This page describes the current prototype boundary; provider retention, browser storage, and account revocation can have their own separate rules.

## Continue

- [Return to Open Historia](https://historia.aliveville.com/)
- [Read how the game works](https://historia.aliveville.com/about)
- [Open the public game entry](https://historia.aliveville.com/play)
