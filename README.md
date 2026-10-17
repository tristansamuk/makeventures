# Makeventures

A personal maker blog covering IoT, home labs, videography, and coding. Built with [Astro](https://astro.build/) and [EmDash](https://docs.emdashcms.com/), a CMS that runs inside the Astro app. Pages are rendered on the server when requested, with zero client-side JavaScript by default.

## Deployments

| Branch    | Cloudflare Worker      | URL                                                     |
| --------- | ---------------------- | ------------------------------------------------------- |
| `main`    | `makeventures`         | [makeventures.ca](https://makeventures.ca) — production |
| `staging` | `makeventures-staging` | The Worker's `workers.dev` address — preview            |

Each environment has its own database and media bucket, so content published on staging never appears in production.

## Stack

- **Framework:** Astro 6, server output (pages render on request; `/about` and `/404` are pre-built)
- **CMS:** [EmDash](https://docs.emdashcms.com/) — admin at `/_emdash/admin`, content stored in a database
- **Content:** blog posts and projects are EmDash collections, defined in `.emdash/seed.json`
- **Styling:** Custom CSS design system with dark mode support
- **Hosting:** [Cloudflare Workers](https://developers.cloudflare.com/workers/) — a D1 database holds the content and an R2 bucket holds uploaded images; both auto-deploy on push to `main` and `staging`

## What's in the repo

```
src/
├── pages/              # Each file becomes a URL route
│   ├── index.astro             → /
│   ├── about.astro             → /about
│   ├── blog/
│   │   ├── index.astro         → /blog
│   │   ├── [...slug].astro     → /blog/post-title
│   │   └── tags/[tag].astro    → /blog/tags/tag-name
│   └── projects/
│       ├── index.astro         → /projects
│       └── [...slug].astro     → /projects/project-slug
├── lib/
│   └── content.ts      # Fetches posts, projects and tags from EmDash
├── components/         # Reusable UI pieces (header, footer, post cards, etc.)
│   └── portable-text/  # Site-styled renderers for code and video blocks
├── layouts/            # Page templates (BlogPost.astro, ProjectPost.astro)
├── live.config.ts      # Connects Astro to EmDash
├── worker.ts           # Cloudflare Worker entry point
└── styles/             # Global CSS, design tokens, theme variables
.emdash/
└── seed.json           # EmDash content model: collections, fields, tags
wrangler.jsonc          # Cloudflare Worker config: database, media bucket, environments
```

## Feature development flow

1. **Open an issue** — add a new issue in GitHub Issues describing the feature or bug
2. **Branch** — create a new branch off `main`
3. **Develop** — make changes and preview locally with `pnpm dev`
4. **Staging** — merge to `staging` to preview on the staging Worker
5. **PR** — open a pull request against `main`
6. **Review & merge** — review, approve, and merge to ship to production

## Local setup

You'll need **Node.js** and **pnpm** installed before you start.

### 1. Install Node.js

The project requires Node.js version 22.16.0 or higher.

**On macOS — recommended via [Homebrew](https://brew.sh):**

If you don't have Homebrew yet, install it first:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then install Node.js and pnpm together:

```bash
brew install node pnpm
```

Skip ahead to step 2 to verify, then continue from step 3.

**Other platforms — via [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager):**

```bash
# Install nvm (paste this in your terminal)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Restart your terminal, then install the required Node version
nvm install 22
nvm use 22
```

Or download an installer directly from [nodejs.org](https://nodejs.org).

### 2. Install pnpm

pnpm is the package manager this project uses (similar to npm, but faster). Skip this if you installed it via Homebrew above.

```bash
npm install -g pnpm
```

Verify both tools are ready:

```bash
node --version   # should print v22.16 or higher
pnpm --version
```

### 3. Clone the repo and install dependencies

```bash
git clone https://github.com/tristansamuk/makeventures.git
cd makeventures
pnpm install
```

`pnpm install` reads `package.json` and downloads all the project's dependencies into `node_modules/`. This only needs to be done once (and again if dependencies change).

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser. The server hot-reloads on save — changes to `.astro` and `.css` files appear instantly without refreshing.

The dev server runs a local copy of the Cloudflare database and media bucket in `.wrangler/`, which starts empty. To get going:

1. Open [http://localhost:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin](http://localhost:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin) to set up the local site and sign in as a dev admin without a passkey. This shortcut only works on localhost.
2. Add content in the admin. Delete `.wrangler/state/` to start over with an empty site.

### Other commands

```bash
pnpm build    # Compile the full site to ./dist/ (run this before opening a PR)
pnpm preview  # Serve the compiled ./dist/ locally to test the production build
```

Always run `pnpm build` before opening a PR to catch any compile errors.

## Adding content

All content is managed in the **EmDash admin** at [makeventures.ca/_emdash/admin](https://makeventures.ca/_emdash/admin). Published changes appear on the site immediately; there is no build or deploy step.

Sign in with a passkey or with GitHub. GitHub sign-in only works for an existing admin user whose email matches a verified email on the GitHub account; to give someone access, add them as a user in the admin first.

### Blog post

1. Select **Posts** from the sidebar, then **Add New**.
2. Fill in the required fields:
   - **Title** — the post headline
   - **Description** — a short summary shown in cards and meta tags
   - **Hero Image** — upload or pick from the media library
   - **Publish Date** — the date shown on the post; posts are sorted by it
   - **Author**
3. Optionally set **Updated Date** and pick **Tags** in the sidebar.
4. Write the post in the **Content** editor. Type `/` for blocks such as images, tables, code and video embeds (YouTube or Vimeo links).
5. Set the slug under **URL & language**; the post lives at `/blog/<slug>/`.
6. Click **Publish**.

### Project page

1. Select **Projects** from the sidebar, then **Add New**.
2. Fill in the required fields: **Title**, **Description**, **Hero Image** and **Publish Date**.
3. Optionally set **Status** (`completed`, `in-progress` or `paused`; defaults to `in-progress`), **Completed Date**, **Nav Title** and **Featured Stat**.
4. Write the project body in the **Content** editor and set the slug; the project lives at `/projects/<slug>/`.
5. Click **Publish**.

The homepage features the three most recent projects. To pin specific ones instead, a developer adds their slugs to the `FEATURED_PROJECT_IDS` array in `src/pages/index.astro`.
