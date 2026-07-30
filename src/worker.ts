import { Hono } from 'hono';

import { createAuth } from '../lib/auth';
import type { WorkerEnv } from '../lib/worker-env';

import { bindWorkerEnv } from './worker/bind-env';
import {
  addPublicDocumentHeaders,
  handlePublicDiscovery,
  routeDocumentKind,
  transformPrivateGameplayDocument,
  transformPublicSpaDocument,
} from './worker/public-surfaces';
import llmRoutes from './worker/routes/llm';
import savesRoutes from './worker/routes/saves';

function isSpaRoute(pathname: string) {
  return (
    pathname === '/play' ||
    pathname.startsWith('/play/') ||
    pathname === '/about' ||
    pathname === '/privacy'
  );
}

const api = new Hono<{ Bindings: WorkerEnv }>();

api.use('*', async (c, next) => {
  bindWorkerEnv(c.env);
  await next();
});

api.on(['GET', 'POST'], '/api/auth/*', (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

api.route('/api/saves', savesRoutes);
api.route('/api', llmRoutes);

api.onError((err, c) => {
  console.error(`[error] ${c.req.method} ${c.req.path}:`, err.message, err.stack);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    const publicDiscovery = handlePublicDiscovery(request);
    if (publicDiscovery) return publicDiscovery;

    if (url.pathname.startsWith('/api/')) {
      try {
        return await api.fetch(request, env, ctx);
      } catch (err) {
        console.error(`[error] fetch ${url.pathname}:`, err instanceof Error ? err.message : err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (isSpaRoute(url.pathname)) {
      const spaRequest = new Request(new URL('/app', url), request);
      const spaResponse = await env.ASSETS.fetch(spaRequest);
      const document = routeDocumentKind(url.pathname);
      if (document.kind === 'public') {
        return transformPublicSpaDocument(spaResponse, document.route);
      }
      if (document.kind === 'private-gameplay') {
        return transformPrivateGameplayDocument(spaResponse);
      }
      return spaResponse;
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) {
      const route = routeDocumentKind(url.pathname);
      return route.kind === 'public'
        ? addPublicDocumentHeaders(assetResponse, route.route)
        : assetResponse;
    }

    if (url.pathname === '/') {
      return env.ASSETS.fetch(new Request(new URL('/index.html', url), request));
    }

    return assetResponse;
  },
};
