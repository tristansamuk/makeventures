# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server at localhost:4321
pnpm build      # Build production site to ./dist/
pnpm preview    # Preview production build locally
```

Requires Node >= 22.12.0. No test runner is configured.

## Architecture

This is an **Astro 6** static site (SSG) — all routes are pre-built at build time, zero client-side JS by default.

**Key integrations:** `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`, `sharp` (image optimization)

**Routing model:**
- `src/pages/` — file-based routing; `.astro` files become HTML pages
- `src/pages/blog/[...slug].astro` — dynamic routes generated from content collections
- Auto-generated `/rss.xml` and `/sitemap-index.xml`

**Content Collections:**
- Blog posts live in `src/content/blog/` as `.md` or `.mdx` files
- Schema defined in `src/content.config.ts` (Zod): `title`, `description`, `pubDate` (required); `updatedDate`, `heroImage` (optional)
- Access posts via `getCollection('blog')` from `astro:content`

**Component model:**
- All UI is `.astro` components (server-rendered, no hydration by default)
- Shared layouts in `src/layouts/` — `BlogPost.astro` wraps all blog post pages
- Site-wide constants (`SITE_TITLE`, `SITE_DESCRIPTION`) in `src/consts.ts`

**Styling:** Single global stylesheet at `src/styles/global.css` — Bear Blog-inspired, 720px breakpoint, Atkinson web font.

**Site URL** is set in `astro.config.mjs` — update from `https://example.com` before deploying.
