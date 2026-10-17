// @ts-check

import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import { github } from "emdash/auth/providers/github";

// https://astro.build/config
export default defineConfig({
  site: "https://makeventures.ca",
  output: "server",
  adapter: cloudflare(),
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/_emdash/"),
    }),
    react(),
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
      authProviders: [github()],
    }),
  ],
});
