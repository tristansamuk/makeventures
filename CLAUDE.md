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

**Key integrations:** `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`, `sharp` (image optimization), `decap-cms-app` (Git-based CMS at `/admin/`)

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

| Route              | File                                 | Notes                                                                                       |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------- |
| `/`                | `src/pages/index.astro`              | Hero (SVG logo, typewriter eyebrow, stat bar), featured projects, topic strip, recent posts |
| `/blog`            | `src/pages/blog/index.astro`         | Featured post card + 2-column post grid                                                     |
| `/blog/[slug]`     | `src/pages/blog/[...slug].astro`     | Individual post via `BlogPost.astro` layout                                                 |
| `/blog/tags/[tag]` | `src/pages/blog/tags/[tag].astro`    | Posts filtered by tag                                                                       |
| `/projects`        | `src/pages/projects/index.astro`     | Featured project card + 3-column project grid with status badges and stats                  |
| `/projects/[slug]` | `src/pages/projects/[...slug].astro` | Individual project via `ProjectPost.astro` layout                                           |
| `/about`           | `src/pages/about.astro`              | About page                                                                                  |
| `/404`             | `src/pages/404.astro`                | Custom 404 page                                                                             |

## Components

| Component             | Props                                                        | Purpose                                                                                                                |
| --------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `BaseHead.astro`      | `title`, `description`, `image?`                             | `<head>` meta/OG tags, theme detection script, Google Fonts, Netlify Identity widget                                   |
| `Header.astro`        | —                                                            | Sticky nav with blur backdrop, site title, nav links (blog, projects, about), dark/light toggle, mobile hamburger menu |
| `HeaderLink.astro`    | `href`, HTML anchor attrs                                    | Nav link with underline active state                                                                                   |
| `Footer.astro`        | —                                                            | Copyright year (auto), mono social links (github, vimeo, linkedin), Netlify Identity login redirect                    |
| `TagList.astro`       | `tags: string[]`                                             | Renders clickable `#tag` pill links to `/blog/tags/[tag]/`                                                             |
| `PostCard.astro`      | `post: CollectionEntry<'blog'>`                              | Blog post card (`<li>`) used in the grid on `/blog` and tag archive pages                                              |
| `ProjectCard.astro`   | `project: CollectionEntry<'projects'>`, `style?: string`     | Project card (`<li>`) with image, status badge, title, description, optional featuredStat                              |
| `StatusBadge.astro`   | `status: 'completed' \| 'in-progress' \| 'paused'`, `class?` | Styled status badge with three visual variants                                                                         |
| `FormattedDate.astro` | `date: Date`                                                 | Formats a `Date` as "MMM d, yyyy"                                                                                      |
| `Hero.astro`          | —                                                            | Homepage hero: SVG logo, typewriter eyebrow, stat bar                                                                  |
| `YouTube.astro`       | `id: string`, `title?`                                       | Responsive 16:9 iframe embed via `youtube-nocookie.com`, lazy loaded                                                   |

## Design System

**Fonts (loaded via Google Fonts in `BaseHead.astro`):**

- `--font-display`: Righteous — headings, hero title, site name
- `--font-body`: Inter — body text
- `--font-mono`: JetBrains Mono — labels, dates, tags, nav links, code

**Color palette (CSS custom properties in `src/styles/global.css`):**

- Light mode: white background (`#FFFFFF`), zinc surface (`#F4F4F5`), black accent (`#09090B`)
- Dark mode: near-black background (`#09090B`), dark zinc surface (`#18181B`), white accent (`#FAFAFA`)
- Dark mode activates via `[data-theme="dark"]` on `<html>`, persisted in `localStorage`
- `@media (prefers-color-scheme: dark)` respected for users with no stored preference
- Shadows are defined for light mode only; they are not shown in dark mode

**Design tokens:**

- Spacing: `--sp-1` (4px) through `--sp-24` (96px)
- Font sizes: `--fs-xs` (12px) through `--fs-5xl` (64px)
- Layout: `--container` (1152px), `--prose` (736px), `--nav-height` (56px)
- Radii: `--radius-sm` (2px), `--radius-md` (4px), `--radius-lg` (8px), `--radius-pill` (9999px)
- Transitions: `--ease` (200ms ease), `--ease-slow` (400ms ease)

**Key design decisions:**

- Theme transitions handled by temporarily adding `.theme-transitioning` class to `<html>` on toggle, removed after 400ms
- Drop cap on first paragraph of prose via `.prose > p:first-of-type::first-letter` (4.5em, font-body, float left)
- `pre` code blocks have a decorative "● ● ●" header via `::before`
- All spacing via `--sp-*` tokens, font sizes via `--fs-*` tokens (defined in `global.css`)
- Responsive breakpoints: 720px (blog layout) and 768px (global typography scale-down)
- Animations: `fadeUp` (0.6s, cubic-bezier) used for staggered post entry on homepage; respects `prefers-reduced-motion`

**Hero (`src/components/Hero.astro`, used by `src/pages/index.astro`):**

- SVG logo loaded from `src/assets/mv-logo.svg` and inlined
- Eyebrow label has a typewriter effect (starts 800ms after page load, 45ms/char)
- Blinking cursor via `.hero-label.typing::after { content: '▍' }`
- Stat bar shows post count, topic count, and founding year
- Featured projects section shows 3 projects by slug (configured via `FEATURED_PROJECT_IDS` in `index.astro`) using `ProjectCard`
- Topics strip renders all unique tags as pill links below the CTA

## Decap CMS

A Git-based headless CMS served from `public/admin/`. Accessible at `/admin/` on the deployed site.

**Backend:** Netlify Git Gateway — commits directly to the `main` branch. Auth via Netlify Identity (widget loaded in `BaseHead.astro`, login redirect in `Footer.astro`).

**Configuration:** `public/admin/config.yml` defines two collections (`blog`, `projects`) with fields that mirror the Zod schemas in `content.config.ts`. When updating content schemas, keep both files in sync.

**Key files:**

- `public/admin/config.yml` — collection definitions, backend settings, media folder config
- `public/admin/index.html` — CMS entry point with custom React preview templates for both collections and a video embed editor component
- `public/admin/preview.css` — preview styles matching the site's design tokens and fonts

**Media:** Images uploaded via the CMS go to `src/assets/` (configured via `media_folder` / `public_folder` in `config.yml`).

**Editorial workflow:** Currently disabled. Posts publish directly to `main` on save.

## Video embeds

A custom remark plugin (`src/plugins/remark-video.mjs`) converts shortcodes in Markdown into responsive iframe embeds. Supports YouTube and Vimeo URLs.

**Syntax:** `{{< video "https://youtube.com/watch?v=abc123" "Optional title" >}}`

The Decap CMS video editor widget (defined in `public/admin/index.html`) produces this same shortcode format, so videos added through the CMS work automatically.

## Tags

Tags are `string[]` in post frontmatter. The `TagList` component renders them as pill links.

## Commits

Commit messages must be 10 words or fewer. Keep them in the imperative mood (e.g. "Add image preview to recent posts").

## Pull requests

The repo has a template at `.github/pull_request_template.md` with three sections: Issue, Summary, Changes. PR descriptions should be concise and high-level — use bullet points of 5–10 words maximum.
