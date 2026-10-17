# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server at localhost:4321
pnpm build      # Build production site to ./dist/
pnpm preview    # Preview production build locally
```

Requires Node >= 22.16.0. No test runner is configured. Always run `pnpm build` after making changes to verify the site compiles cleanly before finishing a task.

## Architecture

This is an **Astro 6** site with `output: "server"`, deployed to **Cloudflare Workers** via `@astrojs/cloudflare` (pinned to 13.x; 14.x needs Astro 7). Content lives in **EmDash**: a D1 database (binding `DB`) and an R2 bucket for media (binding `MEDIA`), configured in `astro.config.mjs` and `wrangler.jsonc`. Pages that show content render on each request, so a publish in the admin appears immediately; pages are still zero client-side JS by default. When adding a page that reads EmDash content, do **not** add `export const prerender = true;` — a prerendered page only contains what was in the database at build time. Fully static pages may prerender.

`/about` is prerendered. `/404` renders on request because content routes rewrite to it (`Astro.rewrite('/404')`), and Astro cannot rewrite an on-demand route to a prerendered one.

**Environments:** `wrangler.jsonc` defines production (`makeventures`) and `env.staging` (`makeventures-staging`), each with its own database and bucket. The environment is chosen at **build** time: build staging with `CLOUDFLARE_ENV=staging pnpm build`.

**Key integrations:**: `@astrojs/sitemap`, `@astrojs/rss`, `@astrojs/react` (needed by the EmDash admin), `@astrojs/cloudflare` (adapter), `emdash` + `@emdash-cms/cloudflare` (CMS), `sharp` (build-time images for prerendered pages)

**Routing model:**

- `src/pages/` — file-based routing; `.astro` files become HTML pages
- `src/pages/blog/[...slug].astro` — dynamic routes for individual blog posts
- `src/pages/blog/tags/[tag].astro` — dynamic tag archive pages (one per tag)
- `src/pages/projects/[...slug].astro` — dynamic routes for individual projects
- `/rss.xml` — built on request from EmDash posts
- `/sitemap-index.xml` (`@astrojs/sitemap`, fixed pages only) and `/sitemap.xml` (EmDash, every published post and project)
- `/_emdash/*` — EmDash admin, API and media routes

**Content (EmDash):**

- Collections and fields are defined in `.emdash/seed.json`, which EmDash applies to a new database on first request. `emdash-env.d.ts` holds the generated types (regenerated on dev server start).
- `posts` (served at `/blog/<slug>/`): `title`, `description`, `featured_image`, `pub_date`, `author` (required); `updated_date`, `content` (Portable Text). Tags use EmDash's built-in `tag` taxonomy.
- `projects` (served at `/projects/<slug>/`): `title`, `description`, `featured_image`, `pub_date` (required); `nav_title`, `project_status` (`completed` | `in-progress` | `paused`; `status` is reserved by EmDash), `completed_date`, `featured_stat`, `content`.
- Pages never query EmDash directly. Use the helpers in `src/lib/content.ts` — `getPosts({ tag? })`, `getPost(slug)`, `getProjects()`, `getProject(slug)`, `getTag(slug)`, `mediaUrl(image)` — which return the `BlogPost`, `Project` and `Tag` types the components take.
- Post and project bodies render through `src/components/Body.astro`, which wraps EmDash's `PortableText` and swaps in `src/components/portable-text/` renderers for code and video blocks so they match the site's styles.
- Images from EmDash render with `Image` from `emdash/ui` (`image={...}`), not `astro:assets`.

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
| `BaseHead.astro`      | `title`, `description`, `image?` (asset or URL)              | `<head>` meta/OG tags, theme detection script, Google Fonts                                                            |
| `Header.astro`        | —                                                            | Sticky nav with blur backdrop, site title, nav links (blog, projects, about), dark/light toggle, mobile hamburger menu |
| `HeaderLink.astro`    | `href`, HTML anchor attrs                                    | Nav link with underline active state                                                                                   |
| `Footer.astro`        | —                                                            | Copyright year (auto), mono social links (github, vimeo, linkedin)                                                     |
| `TagList.astro`       | `tags: Tag[]`                                                | Renders clickable `#tag` pill links to `/blog/tags/[slug]/`                                                            |
| `PostCard.astro`      | `post: BlogPost`                                             | Blog post card (`<li>`) used in the grid on `/blog` and tag archive pages                                              |
| `PostRow.astro`       | `post: BlogPost`                                             | Blog post row (`<li>`) with thumbnail, date, title, description; used in the recent posts list on the homepage         |
| `ProjectCard.astro`   | `project: Project`                                           | Project card (`<li>`) with image, status badge, title, description, optional featuredStat                              |
| `StatusBadge.astro`   | `status: 'completed' \| 'in-progress' \| 'paused'`, `class?` | Styled status badge with three visual variants                                                                         |
| `FormattedDate.astro` | `date: Date`                                                 | Formats a `Date` as "MMM d, yyyy"                                                                                      |
| `Hero.astro`          | —                                                            | Homepage hero: SVG logo, typewriter eyebrow, stat bar                                                                  |
| `HomeSection.astro`   | `title`, `href`, `linkLabel`, `layout: 'grid' \| 'list'`     | Wraps a homepage section (header with title + view-all link, then a `<ul>`); children passed via slot                  |
| `YouTube.astro`       | `id: string`, `title?`                                       | Responsive 16:9 iframe embed via `youtube-nocookie.com`, lazy loaded                                                   |
| `Body.astro`          | `value: Body`                                                | Renders a post or project body (Portable Text) with the site's code and video renderers                                |

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
- Featured projects section shows the 3 most recent projects using `ProjectCard`; pin specific ones by slug via `FEATURED_PROJECT_IDS` in `index.astro`
- Topics strip renders all unique tags as pill links below the CTA

## Admin CMS

EmDash admin at `/_emdash/admin`. Sign-in is by passkey or GitHub (`authProviders: [github()]` in `astro.config.mjs`; credentials in the `EMDASH_OAUTH_GITHUB_CLIENT_ID` / `EMDASH_OAUTH_GITHUB_CLIENT_SECRET` Worker secrets). GitHub sign-in only matches existing users by verified email; it does not let new people sign up.

Locally, the dev server keeps its database and media in `.wrangler/state/`. `/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin` sets up the site and signs in as a dev admin without a passkey (localhost only).

## Video embeds

Paste a YouTube or Vimeo link as an embed block in the editor. `src/components/portable-text/VideoEmbed.astro` renders it as a responsive iframe (`.video-embed` in `global.css`); other URLs fall back to a plain link.

## Tags

Tags are terms in EmDash's `tag` taxonomy, each with a `slug` and `label`. Tag pages live at `/blog/tags/<slug>/`; mixed-case legacy URLs (e.g. `/blog/tags/AI/`) redirect to the lowercase slug.

## Commits

Commit messages must be 10 words or fewer. Keep them in the imperative mood (e.g. "Add image preview to recent posts").

## Pull requests

The repo has a template at `.github/pull_request_template.md` with three sections: Issue, Summary, Changes. PR descriptions should be concise and high-level — use bullet points of 5–10 words maximum.
