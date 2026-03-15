# Makeventures

A personal maker blog covering IoT, home labs, videography, and coding. Built with Astro 6.

## Stack

- **Framework:** Astro 6 (static site generation)
- **Content:** Markdown/MDX with Astro content collections
- **Styling:** Custom design system — Bricolage Grotesque + Figtree + JetBrains Mono, warm cream palette with teal accents, dark mode
- **Deployment:** Netlify (planned)
- **CMS:** Keystatic (planned — see `keystatic-cms-plan.md`)

## Features

- Blog with tag-based archive pages
- Featured post card, responsive post grid
- YouTube embed component (`<YouTube id="..." />`)
- Astro image optimization for all inline images
- Light/dark theme toggle with smooth transitions
- RSS feed and sitemap

## Commands

```bash
pnpm dev      # Dev server at localhost:4321
pnpm build    # Build to ./dist/
pnpm preview  # Preview production build
```

Requires Node >= 22.12.0.
