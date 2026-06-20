import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

export type DbEnv = {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN?: string;
};

export function createDb(env: DbEnv) {
  const url = env.TURSO_DATABASE_URL;
  const httpUrl = url.replace(/^libsql:\/\//, "https://");
  const client = createClient({
    url: httpUrl,
    authToken: env.TURSO_AUTH_TOKEN,
  });
  return drizzle(client, { schema });
}

export type AppDb = ReturnType<typeof createDb>;