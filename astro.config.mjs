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
  // The Decap CMS admin used to live at /admin; send old bookmarks to EmDash's.
  redirects: {
    "/admin": "/_emdash/admin",
  },
  // Astro only resizes images whose URL is on this allow-list. EmDash serves
  // media from each environment's own origin, so list every place the site runs.
  image: {
    remotePatterns: ["makeventures.ca", "makeventures-staging.tsamuk.workers.dev"].map((hostname) => ({
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
