# Keystatic CMS Implementation Plan

## Overview

Add Keystatic CMS with GitHub OAuth authentication to Makeventures. Keystatic reads and writes directly to `src/content/blog/`, keeping all existing posts and the content schema untouched. The admin UI lives at `/keystatic` and is protected by GitHub OAuth in production. Local dev requires no login.

## Prerequisites (complete before implementing)

- [ ] Site deployed to Netlify and live at a public URL
- [ ] GitHub OAuth App created (github.com → Settings → Developer settings → OAuth Apps)
  - Homepage URL: `https://yoursite.netlify.app`
  - Callback URL: `https://yoursite.netlify.app/api/keystatic/github/oauth/callback`
- [ ] Three environment variables set in Netlify:
  - `KEYSTATIC_GITHUB_CLIENT_ID`
  - `KEYSTATIC_GITHUB_CLIENT_SECRET`
  - `KEYSTATIC_SECRET` (any random string — generate with `openssl rand -hex 32`)

## Implementation Steps

### 1. Install packages

```bash
pnpm add @keystatic/core @keystatic/astro
```

Also install the Netlify adapter:

```bash
pnpm add @astrojs/netlify
```

### 2. Switch to hybrid rendering in `astro.config.mjs`

```js
import keystatic from '@keystatic/astro';
import netlify from '@astrojs/netlify';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'hybrid',
  adapter: netlify(),
  site: 'https://yoursite.netlify.app',
  integrations: [mdx(), sitemap(), keystatic()],
});
```

`output: 'hybrid'` keeps all existing pages static — only the `/keystatic` admin routes become server-rendered.

### 3. Create `keystatic.config.ts` in the project root

Maps to the existing content schema (`title`, `description`, `pubDate`, `tags`, `heroImage`, `author`) and configures a markdown editor for the post body.

```ts
import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: 'your-github-username/makeventures',
  },
  collections: {
    blog: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        pubDate: fields.date({ label: 'Publish Date' }),
        updatedDate: fields.date({ label: 'Updated Date' }),
        author: fields.text({ label: 'Author' }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.fields.value.value ?? 'Tag',
        }),
        heroImage: fields.image({
          label: 'Hero Image',
          directory: 'src/assets/blog',
          publicPath: '../../assets/blog/',
        }),
        content: fields.markdoc({
          label: 'Content',
          extension: 'md',
        }),
      },
    }),
  },
});
```

### 4. Add admin routes

**`src/pages/keystatic/[...params].astro`**

```astro
---
export const prerender = false;
---
```

(Keystatic's Astro integration handles the rest automatically via the integration hook.)

**`src/pages/api/keystatic/[...params].ts`**

```ts
export const prerender = false;
```

(Same — Keystatic injects the handler via the integration.)

### 5. Local development

```bash
pnpm dev
```

Navigate to `http://localhost:4321/keystatic` — no login required locally. Keystatic will use local file storage in dev mode automatically when `KEYSTATIC_GITHUB_CLIENT_ID` is not set.

### 6. Deploy

Push to GitHub → Netlify auto-deploys. Navigate to `https://yoursite.netlify.app/keystatic`, log in with GitHub, and the CMS is live.

## Notes

- New posts created in Keystatic are committed directly to the repo as `.md` files, identical to hand-written posts
- If a custom domain is added later, update the GitHub OAuth App callback URL to match
- The `KEYSTATIC_SECRET` env var must also be set locally (in a `.env` file) if you want to test the full GitHub OAuth flow locally — add `KEYSTATIC_SECRET=any-string` to `.env`
