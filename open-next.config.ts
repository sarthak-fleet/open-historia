import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  buildCommand: "pnpm build",
  edgeFunctionHandlerPath:
    "@opennextjs/cloudflare/overrides/edge-function-handler/fetch-proxy.ts",
});
