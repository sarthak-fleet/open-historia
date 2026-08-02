import type { DbEnv } from "./db";

export type WorkerEnv = {
  DB: DbEnv["DB"];
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_BASE_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  AI_GATEWAY_API_KEY?: string;
  FREE_AI_API_KEY?: string;
  FREE_AI_GATEWAY_URL?: string;
  LOCAL_AI_URL?: string;
  CLI_BRIDGE_URL?: string;
  NODE_ENV?: string;
  ASSETS: Fetcher;
};
