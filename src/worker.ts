import { Hono } from "hono";

import { createAuth } from "../lib/auth";
import type { WorkerEnv } from "../lib/worker-env";

import { bindWorkerEnv } from "./worker/bind-env";
import llmRoutes from "./worker/routes/llm";
import savesRoutes from "./worker/routes/saves";
import { withTiming } from "../lib/timing";

const SPA_PREFIXES = ["/play", "/about", "/privacy", "/story-room"];

function isSpaRoute(pathname: string) {
  return SPA_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

const api = new Hono<{ Bindings: WorkerEnv }>();

api.use("*", async (c, next) => {
  bindWorkerEnv(c.env);
  await next();
});

api.on(["GET", "POST"], "/api/auth/*", (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

api.route("/api/saves", savesRoutes);
api.route("/api", llmRoutes);

export default {
  fetch: withTiming(
    async (request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> => {
      const url = new URL(request.url);

      if (url.pathname.startsWith("/api/")) {
        return api.fetch(request, env, ctx);
      }

      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        // Long-cache static JSON map assets (TopoJSON, province data) at the edge
        // and in the browser. These files are content-addressed by URL and change
        // only on deploy, so aggressive caching is safe and avoids re-fetching
        // multi-MB geography payloads on every navigation.
        if (url.pathname.endsWith(".json")) {
          const headers = new Headers(assetResponse.headers);
          headers.set(
            "Cache-Control",
            "public, max-age=86400, s-maxage=604800",
          );
          return new Response(assetResponse.body, {
            status: assetResponse.status,
            statusText: assetResponse.statusText,
            headers,
          });
        }
        return assetResponse;
      }

      if (isSpaRoute(url.pathname)) {
        const spaRequest = new Request(new URL("/app.html", url), request);
        return env.ASSETS.fetch(spaRequest);
      }

      if (url.pathname === "/") {
        return env.ASSETS.fetch(new Request(new URL("/index.html", url), request));
      }

      return assetResponse;
    },
  ),
};