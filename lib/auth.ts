import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

const canUseLocalAuthSecret =
  process.env.NODE_ENV !== "production" ||
  process.env.npm_lifecycle_event === "build" ||
  process.env.NEXT_PHASE === "phase-production-build";

const authSecret =
  process.env.BETTER_AUTH_SECRET?.trim() ||
  (canUseLocalAuthSecret ? "open-historia-local-development-secret-32-chars" : undefined);
const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.BETTER_AUTH_BASE_URL || "http://localhost:3000",
  secret: authSecret,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  socialProviders:
    googleClientId && googleClientSecret
      ? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
      : {},
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  },
  rateLimit: {
    enabled: false,
  },
});
