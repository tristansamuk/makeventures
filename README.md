# Makeventures

A personal maker blog covering IoT, home labs, videography, and coding. Built with [Astro](https://astro.build/) — a static site generator that pre-builds all pages at deploy time with zero client-side JavaScript by default.

## Deployments

| Branch    | URL                                                                                      |
| --------- | ---------------------------------------------------------------------------------------- |
| `main`    | [makeventures.netlify.app](https://makeventures.netlify.app) — production                |
| `staging` | [staging--makeventures.netlify.app](https://staging--makeventures.netlify.app) — preview |

## Stack

- **Framework:** Astro 6 (static site generation — all pages pre-built, no server needed)
- **Content:** Blog posts written in Markdown/MDX, stored in `src/content/blog/`
- **Styling:** Custom CSS design system with dark mode support
- **Deployment:** Netlify (auto-deploys on push to `main` and `staging`)
- **CMS:** Keystatic (planned — see `keystatic-cms-plan.md`)

## What's in the repo

```
src/
├── pages/          # Each file becomes a URL route
│   ├── index.astro         → /
│   ├── about.astro         → /about
│   └── blog/
│       ├── index.astro     → /blog
│       ├── [...slug].astro → /blog/post-title
│       └── tags/[tag].astro → /blog/tags/tag-name
├── content/blog/   # Blog posts as .md / .mdx files
├── components/     # Reusable UI pieces (header, footer, post cards, etc.)
├── layouts/        # Page templates (BlogPost.astro wraps all posts)
└── styles/         # Global CSS, design tokens, theme variables
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

## Writing a blog post

Create a new `.mdx` file in `src/content/blog/`. The filename becomes the URL slug (e.g. `my-new-post.mdx` → `/blog/my-new-post`).

Each post requires a frontmatter block at the top:

```mdx
---
title: 'My Post Title'
description: 'A short summary shown in cards and meta tags.'
pubDate: 2026-03-22
tags: ['iot', 'home-lab']
author: 'Tristan Samuk'
heroImage: './hero.jpg' # optional
---

Your content here...
```
