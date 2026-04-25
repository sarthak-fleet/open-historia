import { drizzle } from "drizzle-orm/libsql";
import { createClient, type Client } from "@libsql/client/web";
import * as schema from "./schema";

let _client: Client | null = null;

function getClient(): Client {
  if (!_client) {
    const url = process.env.TURSO_DATABASE_URL!;
    // Convert libsql:// → https:// for fetch-based HTTP client (Cloudflare Workers compatible)
    const httpUrl = url.replace(/^libsql:\/\//, "https://");
    _client = createClient({
      url: httpUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    const instance = drizzle(getClient(), { schema });
    return Reflect.get(instance, prop, receiver);
  },
});
