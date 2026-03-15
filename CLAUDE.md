# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server at localhost:4321
pnpm build      # Build production site to ./dist/
pnpm preview    # Preview production build locally
```

Requires Node >= 22.12.0. No test runner is configured. Always run `pnpm build` after making changes to verify the site compiles cleanly before finishing a task.

## Architecture

This is an **Astro 6** static site (SSG) — all routes are pre-built at build time, zero client-side JS by default.

**Key integrations:** `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`, `sharp` (image optimization)

**Routing model:**
- `src/pages/` — file-based routing; `.astro` files become HTML pages
- `src/pages/blog/[...slug].astro` — dynamic routes for individual blog posts
- `src/pages/blog/tags/[tag].astro` — dynamic tag archive pages (one per tag)
- Auto-generated `/rss.xml` and `/sitemap-index.xml`

**Content Collections:**
- Blog posts live in `src/content/blog/` as `.md` or `.mdx` files
- Schema defined in `src/content.config.ts` using Astro's glob loader and Zod
- Required fields: `title`, `description`, `pubDate`
- Optional fields: `updatedDate`, `heroImage`, `tags` (string[]), `author`
- Access posts via `getCollection('blog')` from `astro:content`

**Component model:**
- All UI is `.astro` components — server-rendered, no hydration by default
- `src/layouts/BlogPost.astro` — wraps all individual blog post pages
- `src/components/` — shared UI components (see below)
- Site-wide constants (`SITE_TITLE`, `SITE_DESCRIPTION`) in `src/consts.ts`

## Pages

| Route | File | Notes |
|-------|------|-------|
| `/` | `src/pages/index.astro` | Hero with full-width fitting title, typewriter eyebrow, stat bar, recent posts |
| `/blog` | `src/pages/blog/index.astro` | Featured post card + 2-column post grid |
| `/blog/[slug]` | `src/pages/blog/[...slug].astro` | Individual post via `BlogPost.astro` layout |
| `/blog/tags/[tag]` | `src/pages/blog/tags/[tag].astro` | Posts filtered by tag |
| `/about` | `src/pages/about.astro` | About page |
| `/404` | `src/pages/404.astro` | Custom 404 page |

## Components

| Component | Purpose |
|-----------|---------|
| `BaseHead.astro` | `<head>` meta tags + Google Fonts (`Bricolage Grotesque`, `Figtree`, `JetBrains Mono`) |
| `Header.astro` | Sticky nav with site title, nav links, dark/light theme toggle |
| `HeaderLink.astro` | Nav link with underline active state |
| `Footer.astro` | Minimal footer with lowercase mono social links (github, vimeo, linkedin) |
| `TagList.astro` | Renders clickable `#tag` pill links to `/blog/tags/[tag]/` |
| `PostCard.astro` | Blog post card (`<li>`) used in the grid on `/blog` and tag archive pages |
| `FormattedDate.astro` | Formats a `Date` object for display |

## Design System

**Fonts (loaded via Google Fonts in `BaseHead.astro`):**
- `--font-display`: Bricolage Grotesque — headings, hero title, site name
- `--font-body`: Figtree — body text
- `--font-mono`: JetBrains Mono — labels, dates, tags, nav links, code

**Color palette (CSS custom properties in `src/styles/global.css`):**
- Light mode: warm cream background (`#FAF8F4`), teal accent (`#0E7490`)
- Dark mode: near-black background (`#100E0B`), cyan accent (`#22D3EE`)
- Dark mode activates via `[data-theme="dark"]` on `<html>`, persisted in `localStorage`
- `@media (prefers-color-scheme: dark)` respected for users with no stored preference

**Key design decisions:**
- Noise texture overlay on `body::before` (SVG `feTurbulence`, `position: absolute`, `opacity: 0.035`)
- Theme transitions handled by temporarily adding `.theme-transitioning` class to `<html>` on toggle, removed after 400ms
- Drop cap on first paragraph of prose via `.prose > p:first-of-type::first-letter`
- All spacing via `--sp-*` tokens, font sizes via `--fs-*` tokens (defined in `global.css`)
- 720px breakpoint for mobile, 768px in global styles

**Hero (`src/pages/index.astro`):**
- Title "Make-/ventures" fills the full container width via a JS binary search (`fitTitle()`) that runs on load and resize
- Eyebrow label has a typewriter effect (starts 800ms after page load, 45ms/char)
- Blinking cursor via `.hero-label.typing::after { content: '▍' }`

## Tags

Tags are `string[]` in post frontmatter. The `TagList` component renders them as pill links.

**Critical:** Card links use `card-link::after { position: absolute; inset: 0 }` to make the entire card clickable. Tags inside cards must have `position: relative; z-index: 1` to remain clickable above this overlay — this is already handled inside `TagList.astro`. Do not remove these properties.

## Planned: Keystatic CMS

A Keystatic CMS integration is planned but not yet implemented. See `keystatic-cms-plan.md` in the root for the full implementation plan. Prerequisites (Netlify deployment + GitHub OAuth App) must be completed first.

When implementing:
- Switch `astro.config.mjs` to `output: 'hybrid'` with `@astrojs/netlify` adapter
- Keystatic admin lives at `/keystatic`, protected by GitHub OAuth in production
- Local dev skips auth entirely
- Required env vars: `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`
