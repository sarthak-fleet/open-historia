import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { createDb, type DbEnv } from "./db";
import * as schema from "./db/schema";

export type AuthEnv = DbEnv & {
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_BASE_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  NODE_ENV?: string;
};

export function createAuth(env: AuthEnv) {
  const canUseLocalAuthSecret =
    env.NODE_ENV !== "production" ||
    process.env.npm_lifecycle_event === "build";

  const authSecret =
    env.BETTER_AUTH_SECRET?.trim() ||
    (canUseLocalAuthSecret ? "open-historia-local-development-secret-32-chars" : undefined);
  const googleClientId = env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = env.GOOGLE_CLIENT_SECRET?.trim();

  const db = createDb(env);

  return betterAuth({
    baseURL:
      env.BETTER_AUTH_URL ||
      env.BETTER_AUTH_BASE_URL ||
      "http://localhost:5173",
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
      expiresIn: 60 * 60 * 24 * 30,
    },
    rateLimit: {
      enabled: false,
    },
  });
}