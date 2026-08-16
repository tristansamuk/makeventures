// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { remarkVideo } from "./src/plugins/remark-video.mjs";
import react from "@astrojs/react";
import emdash, { local } from "emdash/astro";
import { sqlite } from "emdash/db";

// https://astro.build/config
export default defineConfig({
  site: "https://makeventures.netlify.app",
  markdown: {
    remarkPlugins: [remarkVideo],
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/admin/"),
    }),
    react(),
    emdash({
      database: sqlite({ url: "file:./data.db" }),
      storage: local({
        directory: "./uploads",
        baseUrl: "/_emdash/api/media/file",
      }),
    }),
  ],
});
