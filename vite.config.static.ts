// Static build config for hosting on any static host (Hostinger, Netlify, S3, etc.)
// Usage: bun run build:static
// Outputs a pure client-side SPA to ./dist that you can upload anywhere.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Skip Nitro worker output — we want plain static files, not a Cloudflare Worker.
  nitro: false,
  tanstackStart: {
    // Enable SPA mode: TanStack Start emits a static HTML shell + client bundle
    // that hydrates entirely in the browser (no SSR at runtime).
    spa: {
      enabled: true,
    },
    // Prerender the shell so we get a real index.html at the output root.
    prerender: {
      enabled: true,
      crawlLinks: false,
      routes: ["/"],
    },
  },
});