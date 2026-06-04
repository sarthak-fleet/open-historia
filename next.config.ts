import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit .next/standalone so Beasties' post-build inline-critical-css.mjs
  // can modify the same HTML that OpenNext's --skipNextBuild consumes.
  output: "standalone",
  // React Compiler conflicts with webpack mode (required for Cloudflare Workers build)
  reactCompiler: false,
  images: { unoptimized: true },
  serverExternalPackages: [
    "@libsql/client",
    "@libsql/core",
    "@libsql/hrana-client",
    "@libsql/isomorphic-ws",
    "drizzle-orm",
    "better-auth",
  ],
  headers: async () => [
    {
      source: "/:path*.json",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      // CF Edge wouldn't cache `/` with revalidate alone (s-maxage only)
      // — adding max-age and CDN-Cache-Control via the route config makes
      // OpenNext emit them, which is what CF actually honors for HTML.
      source: "/",
      headers: [
        {
          key: "Cache-Control",
          value:
            "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        },
        {
          key: "CDN-Cache-Control",
          value: "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      ],
    },
  ],
};

export default nextConfig;
