# Security Audit -- open-historia
**Date**: 2026-03-28 | **Status**: Paused

## Secrets in Git History
No secrets found in git history. `.env*` is gitignored and `.env.local` was never committed.

## Credentials on Disk
`.env.local` contains live credentials (Turso auth token, Better Auth secret, SaasMaker API key).
These are not committed but exist on disk -- rotate if machine is shared or compromised.

## Deployment
`.vercel/` directory present -- project was deployed to Vercel at some point.
No wrangler.toml, netlify.toml, or firebase.json found.

## Code Security
- **Wide-open CORS**: `server/index.mjs:222` uses `app.use(cors())` with no origin restriction.
- **No dangerouslySetInnerHTML** usage found -- good.
- **No hardcoded secrets** in source code. All credentials accessed via `process.env`.
- Skills scripts reference `${OPENAI_API_KEY}` env var (not hardcoded).

## Action Items
- [ ] Restrict CORS in `server/index.mjs` to specific origins instead of `cors()`
- [ ] Rotate Turso auth token and Better Auth secret (exposed in local `.env.local`)
- [ ] Verify Vercel deployment is deactivated if project is paused
- [ ] Add Google OAuth credentials to `.env.local` or confirm they were never provisioned
