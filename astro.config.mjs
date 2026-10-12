// @ts-check

import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import { remarkVideo } from "./src/plugins/remark-video.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://makeventures.ca",
  output: "server",
  adapter: cloudflare(),
  markdown: {
    remarkPlugins: [remarkVideo],
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/_emdash/"),
    }),
    react(),
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
    }),
  ],
});
