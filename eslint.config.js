import nextConfig from "eslint-config-next";

export default [
  { ignores: ["dist", "landing-astro", ".next", "build", ".wrangler", "node_modules", "out", ".open-next"] },
  ...nextConfig,
];
