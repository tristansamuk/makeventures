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
- `src/pages/projects/[...slug].astro` — dynamic routes for individual projects
- Auto-generated `/rss.xml` and `/sitemap-index.xml`

**Content Collections:**

- Blog posts live in `src/content/blog/` as `.md` or `.mdx` files
- Projects live in `src/content/projects/` as `.md` or `.mdx` files
- Schema defined in `src/content.config.ts` using Astro's glob loader and Zod
- Blog required fields: `title`, `description`, `pubDate`
- Blog optional fields: `updatedDate`, `heroImage`, `tags` (string[]), `author`
- Project required fields: `title`, `description`
- Project optional fields: `navTitle`, `heroImage`, `status` (`'completed' | 'in-progress' | 'paused'`), `completedDate`, `featuredStat`
- Access via `getCollection('blog')` or `getCollection('projects')` from `astro:content`

**Component model:**

- All UI is `.astro` components — server-rendered, no hydration by default
- `src/layouts/BlogPost.astro` — wraps all individual blog post pages
- `src/layouts/ProjectPost.astro` — wraps all individual project pages
- `src/components/` — shared UI components (see below)
- Site-wide constants (`SITE_TITLE`, `SITE_DESCRIPTION`) in `src/consts.ts`

## Pages

| Route              | File                                 | Notes                                                                                                          |
| ------------------ | ------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `/`                | `src/pages/index.astro`              | Hero with full-width fitting title, typewriter eyebrow, stat bar, featured projects, topic strip, recent posts |
| `/blog`            | `src/pages/blog/index.astro`         | Featured post card + 2-column post grid                                                                        |
| `/blog/[slug]`     | `src/pages/blog/[...slug].astro`     | Individual post via `BlogPost.astro` layout                                                                    |
| `/blog/tags/[tag]` | `src/pages/blog/tags/[tag].astro`    | Posts filtered by tag                                                                                          |
| `/projects`        | `src/pages/projects/index.astro`     | Featured project card + 3-column project grid with status badges and stats                                     |
| `/projects/[slug]` | `src/pages/projects/[...slug].astro` | Individual project via `ProjectPost.astro` layout                                                              |
| `/about`           | `src/pages/about.astro`              | About page                                                                                                     |
| `/404`             | `src/pages/404.astro`                | Custom 404 page                                                                                                |

## Components

| Component             | Props                                                        | Purpose                                                                                                                |
| --------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `BaseHead.astro`      | `title`, `description`, `image?`                             | `<head>` meta/OG tags, theme detection script, Google Fonts                                                            |
| `Header.astro`        | —                                                            | Sticky nav with blur backdrop, site title, nav links (blog, projects, about), dark/light toggle, mobile hamburger menu |
| `HeaderLink.astro`    | `href`, HTML anchor attrs                                    | Nav link with underline active state                                                                                   |
| `Footer.astro`        | —                                                            | Copyright year (auto), lowercase mono social links (github, vimeo, linkedin)                                           |
| `TagList.astro`       | `tags: string[]`                                             | Renders clickable `#tag` pill links to `/blog/tags/[tag]/`                                                             |
| `PostCard.astro`      | `post: CollectionEntry<'blog'>`                              | Blog post card (`<li>`) used in the grid on `/blog` and tag archive pages                                              |
| `ProjectCard.astro`   | `project: CollectionEntry<'projects'>`, `style?: string`     | Project card (`<li>`) with image, status badge, title, description, optional featuredStat                              |
| `StatusBadge.astro`   | `status: 'completed' \| 'in-progress' \| 'paused'`, `class?` | Styled status badge with three visual variants                                                                         |
| `FormattedDate.astro` | `date: Date`                                                 | Formats a `Date` as "MMM d, yyyy"                                                                                      |
| `YouTube.astro`       | `id: string`, `title?`                                       | Responsive 16:9 iframe embed via `youtube-nocookie.com`, lazy loaded                                                   |

## Design System

**Fonts (loaded via Google Fonts in `BaseHead.astro`):**

- `--font-display`: Inter — headings, hero title, site name
- `--font-body`: Inter — body text
- `--font-mono`: JetBrains Mono — labels, dates, tags, nav links, code

**Color palette (CSS custom properties in `src/styles/global.css`):**

- Light mode: white background (`#FFFFFF`), zinc surface (`#F4F4F5`), black accent (`#09090B`)
- Dark mode: near-black background (`#09090B`), dark zinc surface (`#18181B`), white accent (`#FAFAFA`)
- Dark mode activates via `[data-theme="dark"]` on `<html>`, persisted in `localStorage`
- `@media (prefers-color-scheme: dark)` respected for users with no stored preference
- Shadows are defined for light mode only; they are not shown in dark mode

**Design tokens:**

- Spacing: `--sp-1` (0.25rem) through `--sp-24` (6rem)
- Font sizes: `--fs-xs` (0.6875rem) through `--fs-5xl` (4rem)
- Layout: `--container` (72rem), `--prose` (46rem), `--nav-height` (3.5rem)
- Radii: `--radius-sm` (2px), `--radius-md` (4px), `--radius-lg` (8px), `--radius-pill` (9999px)
- Transitions: `--ease` (200ms ease), `--ease-slow` (380ms ease)

**Key design decisions:**

- Theme transitions handled by temporarily adding `.theme-transitioning` class to `<html>` on toggle, removed after 400ms
- Drop cap on first paragraph of prose via `.prose > p:first-of-type::first-letter` (4.5em, font-display, float left)
- `pre` code blocks have a decorative "● ● ●" header via `::before`
- All spacing via `--sp-*` tokens, font sizes via `--fs-*` tokens (defined in `global.css`)
- Responsive breakpoints: 720px (blog layout) and 768px (global typography scale-down)
- Animations: `fadeUp` (0.6s, cubic-bezier) used for staggered post entry on homepage; respects `prefers-reduced-motion`

**Hero (`src/pages/index.astro`):**

- Title "Make-ventures" fills the full container width via a JS binary search (`fitTitle()`) that runs on load and resize
- Eyebrow label has a typewriter effect (starts 800ms after page load, 45ms/char)
- Blinking cursor via `.hero-label.typing::after { content: '▍' }`
- Stat bar shows post count, topic count, and founding year
- Featured projects section shows 3 hardcoded projects by slug using `ProjectCard`
- Topics strip renders all unique tags as pill links below the CTA

## Tags

Tags are `string[]` in post frontmatter. The `TagList` component renders them as pill links.
