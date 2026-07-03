import { Hono } from "hono";

import { createAuth } from "../lib/auth";
import type { WorkerEnv } from "../lib/worker-env";

import { bindWorkerEnv } from "./worker/bind-env";
import llmRoutes from "./worker/routes/llm";
import savesRoutes from "./worker/routes/saves";

const SPA_PREFIXES = ["/play", "/about", "/privacy"];

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

api.onError((err, c) => {
  console.error(`[error] ${c.req.method} ${c.req.path}:`, err.message, err.stack);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      try {
        return await api.fetch(request, env, ctx);
      } catch (err) {
        console.error(`[error] fetch ${url.pathname}:`, err instanceof Error ? err.message : err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) {
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
};