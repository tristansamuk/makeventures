# Makeventures

A personal maker blog covering IoT, home labs, videography, and coding. Built with [Astro](https://astro.build/) — a static site generator that pre-builds all pages at deploy time with zero client-side JavaScript by default.

## Deployments

| Branch    | URL                                                                                      |
| --------- | ---------------------------------------------------------------------------------------- |
| `main`    | [makeventures.netlify.app](https://makeventures.netlify.app) — production                |
| `staging` | [staging--makeventures.netlify.app](https://staging--makeventures.netlify.app) — preview |

## Stack

- **Framework:** Astro 6 (static site generation — all pages pre-built, no server needed)
- **Content:** Markdown/MDX files in `src/content/blog/` (posts) and `src/content/projects/` (projects)
- **Styling:** Custom CSS design system with dark mode support
- **CMS:** [Decap CMS](https://decapcms.org/) — Git-based headless CMS at `/admin/`
- **Deployment:** Netlify (auto-deploys on push to `main` and `staging`)

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
├── content/
│   ├── blog/           # Blog posts as .md / .mdx files
│   └── projects/       # Project pages as .md / .mdx files
├── components/         # Reusable UI pieces (header, footer, post cards, etc.)
├── layouts/            # Page templates (BlogPost.astro, ProjectPost.astro)
└── styles/             # Global CSS, design tokens, theme variables
public/
└── admin/              # Decap CMS admin panel
    ├── config.yml      # Collection definitions, backend config
    ├── index.html      # CMS entry point with custom preview templates
    └── preview.css     # Preview styling to match site design
```

## Feature development flow

1. **Open an issue** — add a new issue in GitHub Issues describing the feature or bug
2. **Branch** — create a new branch off `main`
3. **Develop** — make changes and preview locally with `pnpm dev`
4. **Staging** — merge to `staging` to preview on [staging--makeventures.netlify.app](https://staging--makeventures.netlify.app)
5. **PR** — open a pull request against `main`
6. **Review & merge** — review, approve, and merge to ship to production

## Local setup

You'll need **Node.js** and **pnpm** installed before you start.

### 1. Install Node.js

The project requires Node.js version 22.12.0 or higher.

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
node --version   # should print v22.x.x or higher
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

Open [http://localhost:4321](http://localhost:4321) in your browser. The server hot-reloads on save — changes to `.astro`, `.md`, and `.css` files appear instantly without refreshing.

### Other commands

```bash
pnpm build    # Compile the full site to ./dist/ (run this before opening a PR)
pnpm preview  # Serve the compiled ./dist/ locally to test the production build
```

Always run `pnpm build` before opening a PR to catch any compile errors.

## Adding content

All content is managed through **Decap CMS** at [makeventures.netlify.app/admin/](https://makeventures.netlify.app/admin/).

### Blog post

1. Go to `/admin/` and log in with Netlify Identity.
2. Select **Blog** from the sidebar, then click **New Blog**.
3. Fill in the required fields:
   - **Title** — the post headline
   - **Description** — a short summary shown in cards and meta tags
   - **Publish Date** — when the post should be dated
4. Optionally set:
   - **Hero Image** — landscape JPG, at least 1920×1080 (compress with [Squoosh](https://squoosh.app) before uploading)
   - **Tags** — add tags one at a time (e.g. `iot`, `home-lab`)
   - **Author** — defaults to Igor Samuk if left blank
5. Write the post body in the Markdown editor. Use the live preview panel to check formatting.
6. Click **Publish** — the CMS commits the file to `main` and triggers a Netlify deploy automatically.

### Project page

1. Go to `/admin/` and log in with Netlify Identity.
2. Select **Projects** from the sidebar, then click **New Projects**.
3. Fill in the required fields:
   - **Title** — the project name
   - **Description** — a short summary shown in cards and meta tags
4. Optionally set:
   - **Status** — `completed`, `in-progress`, or `paused` (defaults to `in-progress`)
   - **Completed Date** — when the project was finished
   - **Hero Image** — landscape JPG, at least 1920×1080 (compress with [Squoosh](https://squoosh.app) before uploading)
5. Write the project body in the Markdown editor.
6. Click **Publish** to commit and deploy.

To feature a project on the homepage, a developer needs to add its slug to the `FEATURED_PROJECT_IDS` array in `src/pages/index.astro`.
