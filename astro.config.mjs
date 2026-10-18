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
  // Astro only resizes images whose URL is on this allow-list. EmDash serves
  // media from each environment's own origin, so list every place the site
  // runs. The production workers.dev entry is only needed until makeventures.ca
  // points at Cloudflare.
  image: {
    remotePatterns: [
      "makeventures.ca",
      "makeventures-staging.tsamuk.workers.dev",
      "makeventures.tsamuk.workers.dev",
    ].map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/_emdash/api/media/file/**",
    })),
  },
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
