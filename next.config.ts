import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  ],
};

export default nextConfig;
