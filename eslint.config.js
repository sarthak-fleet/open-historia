import nextConfig from "eslint-config-next";

export default [
  { ignores: ["dist", ".next", "build", ".wrangler", "node_modules", "out", ".open-next"] },
  ...nextConfig,
];
