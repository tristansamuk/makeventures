# Implementation Plan: Design System Refresh

**Aesthetic goal:** Clean, mostly black and white, polished — Apple-meets-Scandinavian. Restrained, precise, high-craft. References: Linear, Vercel, Arc Browser, Teenage Engineering, Dieter Rams.

**Scope:** Visual tokens and micro-interactions only. No layout or structural changes.

**Font:** Inter (variable, Google Fonts) for display and body; JetBrains Mono retained for code/labels.

---

## Step 1 — Fonts

**File:** `src/components/BaseHead.astro`

- Replace the existing Google Fonts `<link>` with the Inter URL:
  ```
  https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap
  ```
- Update `--font-display`, `--font-body`, `--font-mono` tokens in `src/styles/global.css`:

**File:** `src/styles/global.css`

```css
--font-display: 'Inter', sans-serif;
--font-body:    'Inter', sans-serif;
--font-mono:    'JetBrains Mono', monospace;
```

**Verify:** Run `pnpm dev` and check that the new fonts render correctly across headings, body, nav, and code elements.

> **PAUSE — Human approval required before continuing to Step 2.**
> Review the font rendering in the browser. Confirm the new font family looks correct and you're happy to proceed.

---

## Step 2 — Color Tokens

**File:** `src/styles/global.css`

Replace the entire `:root` and `[data-theme="dark"]` color token blocks with the new zinc-based palette:

```css
/* Light mode */
:root {
  --color-bg:            #FFFFFF;
  --color-surface:       #F4F4F5;
  --color-border:        rgba(0, 0, 0, 0.08);
  --color-border-subtle: rgba(0, 0, 0, 0.05);
  --color-ink:           #09090B;
  --color-ink-muted:     #71717A;
  --color-accent:        #09090B;
  --color-accent-hover:  #3F3F46;
  --color-accent-subtle: #F4F4F5;
  --color-code-bg:       #F4F4F5;
  --color-pre-bg:        #09090B;
}

/* Dark mode */
[data-theme="dark"] {
  --color-bg:            #09090B;
  --color-surface:       #18181B;
  --color-border:        rgba(255, 255, 255, 0.08);
  --color-border-subtle: rgba(255, 255, 255, 0.05);
  --color-ink:           #FAFAFA;
  --color-ink-muted:     #A1A1AA;
  --color-accent:        #FAFAFA;
  --color-accent-hover:  #D4D4D8;
  --color-accent-subtle: #27272A;
  --color-code-bg:       #18181B;
  --color-pre-bg:        #000000;
}
```

Also update the `@media (prefers-color-scheme: dark)` block to match the dark mode values above.

Remove any remaining teal (`#0E7490`), cyan (`#22D3EE`), amber, or warm-cream (`#FAF8F4`, `#100E0B`) color references anywhere in `global.css`.

**Verify:** Run `pnpm dev`. Toggle light/dark mode. Confirm the warm cream and teal are fully gone.

> **PAUSE — Human approval required before continuing to Step 3.**
> Check both light and dark mode across all pages. Confirm the new palette reads correctly before proceeding.

---

## Step 3 — Remove Noise Texture

**File:** `src/styles/global.css`

Find the `body::before` rule that applies the SVG `feTurbulence` grain texture. Either:
- **Remove it entirely** (cleanest; matches Apple/Linear/Vercel), or
- Reduce `opacity` from `0.035` to `0.015` (nearly imperceptible, just kills the flat-screen look)

The research recommends full removal for the target aesthetic. Confirm your preference.

**Verify:** Visually confirm `body::before` is no longer visible (or is imperceptible).

> **PAUSE — Human approval required before continuing to Step 4.**
> Confirm whether you prefer full removal or reduced opacity, and verify the result looks clean.

---

## Step 4 — Typography Rules

**File:** `src/styles/global.css`

Apply the following changes throughout the stylesheet:

**Headings:**
- `font-weight: 500` or `600` max (remove any `800` weights)
- `letter-spacing: -0.02em` to `-0.04em` (tight tracking = precision)
- `line-height: 1.1` at display sizes

**Body:**
- `line-height: 1.6` (down from current 1.75–1.8)
- `font-weight: 400`

**Mono labels (dates, tags, nav):**
- Remove `text-transform: uppercase` or limit to 2–3 char abbreviations
- `letter-spacing: 0.02em` max (down from current `0.1em`)
- `font-size: 0.75rem` for micro-labels

**Drop cap (`.prose > p:first-of-type::first-letter`):**
- Change `color` to `var(--color-ink)` — remove the accent color from the drop cap
- Alternatively, remove the drop cap rule entirely if it reads as too decorative

**Verify:** Run `pnpm dev`. Read through a blog post. Check heading weight and tracking feel precise and quiet, not loud.

> **PAUSE — Human approval required before continuing to Step 5.**
> Review typography on the homepage, a blog post, and the blog index. Confirm the type hierarchy feels right.

---

## Step 5 — Shadows and Radius Tokens

**File:** `src/styles/global.css`

**Replace radius tokens:**
```css
--radius-pill: 9999px;   /* new — for buttons and tag pills */
--radius-sm:   2px;
--radius-md:   4px;
--radius-lg:   8px;
```

**Replace shadow tokens:**
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.08);
```

Remove all warm-tinted or colored shadow values. In dark mode, remove shadows entirely — borders do the structural work.

Image `border-radius` should be set to `0` (sharp corners, editorial feel).

**Verify:** Run `pnpm dev`. Check that cards, tags, and buttons have updated corner rounding.

> **PAUSE — Human approval required before continuing to Step 6.**
> Confirm the radius and shadow updates look correct.

---

## Step 6 — Header

**File:** `src/components/Header.astro`

- **Frosted glass nav:** Update the sticky header's `background-color` to semi-transparent and add `backdrop-filter`:
  ```css
  /* light mode */
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);

  /* dark mode */
  background-color: rgba(9, 9, 11, 0.8);
  ```
- **Site title:** Reduce to `font-weight: 500`. Remove or tone down the hover color change.
- **Nav links:** Change `font-family` from `var(--font-mono)` to `var(--font-body)` — cleaner, Apple-style.
- **Theme toggle:** Remove the border. Set base `opacity: 0.4`, hover `opacity: 1`. No color change on hover.
- **HeaderLink active/hover state:** Use `var(--color-ink)` for the active underline — no accent color.

**File:** `src/components/HeaderLink.astro`

- Update the active and hover underline color to `var(--color-ink)` (not `--color-accent` if it references teal).

**Verify:** Run `pnpm dev`. Scroll down the page to trigger the sticky nav. Confirm the frosted glass effect works. Toggle theme.

> **PAUSE — Human approval required before continuing to Step 7.**
> Confirm the header looks and behaves correctly in both light and dark mode.

---

## Step 7 — PostCard

**File:** `src/components/PostCard.astro`

- **Remove** `transform: translateY(-2px)` on hover (no card lift)
- **Remove** `border-color: var(--color-accent)` on hover (no color flash on hover)
- **Keep** image scale hover (`scale(1.04)`) — subtle, maintains interactivity
- Date color: change to `var(--color-ink-muted)` (not accent)
- Card border: `1px solid var(--color-border)` using the new hairline token
- Apply `--radius-pill` to any tag pills inside the card

**Verify:** Run `pnpm dev`. Hover over several post cards. Confirm no lift, no color flash, only the subtle image scale.

> **PAUSE — Human approval required before continuing to Step 8.**
> Confirm post cards look and hover correctly.

---

## Step 8 — Hero Page

**File:** `src/pages/index.astro`

- **Eyebrow label:** Remove `text-transform: uppercase` — lowercase reads as quieter, more refined
- **Stat numbers** (`postCount`, tag count): Change color to `var(--color-ink)` — not accent color
- **CTA button:** Apply pill shape and flat minimal style:
  ```css
  padding: var(--sp-3) var(--sp-6);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-ink);
  /* hover: */
  background: var(--color-ink);
  color: var(--color-bg);
  border-color: var(--color-ink);
  ```
- **`fadeUp` animation:** Reduce `translateY` from `20px` to `8px` — subtle entry, not dramatic

**Verify:** Run `pnpm dev`. Review the hero: check the label casing, stat colors, CTA button pill shape, and fade-in animation feel.

> **PAUSE — Human approval required before continuing to Step 9.**
> Confirm the hero page looks correct and the CTA button pill shape is working.

---

## Step 9 — Global Prose, Footer, Tags

**File:** `src/styles/global.css` — Prose styles

- Blockquote left border: change to `var(--color-border)` (not `--color-accent`)
- Inline `code` background: `var(--color-surface)` (not warm)
- Links in prose: use `var(--color-ink)` with underline; on hover use `var(--color-ink-muted)` — no teal

**File:** `src/components/Footer.astro`

- Social link color: `var(--color-ink-muted)` at rest, `var(--color-ink)` on hover (no accent color)

**File:** `src/components/TagList.astro`

- Tag pill background: `var(--color-surface)` or `var(--color-accent-subtle)`
- Tag pill text: `var(--color-ink-muted)` or `var(--color-ink)`
- Tag pill border: `1px solid var(--color-border)`
- Apply `border-radius: var(--radius-pill)`
- No accent color on tags

**File:** `src/layouts/BlogPost.astro`

- Audit for any remaining warm-color or teal/cyan references and update to new tokens

**Verify:** Run `pnpm dev`. Read a blog post end-to-end. Check blockquotes, code blocks, footer links, and tag pills.

> **PAUSE — Human approval required before continuing to Step 10.**
> Confirm all global prose, footer, and tag elements are visually consistent with the new system.

---

## Step 10 — Final Build Check

Run the production build to verify there are no compilation errors:

```bash
pnpm build
```

Review the build output for warnings or errors. If the build passes cleanly, do a final review of the site in `pnpm preview` across:

- [ ] Homepage (hero, stats, CTA, recent posts)
- [ ] Blog index (featured card + grid)
- [ ] Individual blog post (prose, drop cap, blockquotes, code blocks)
- [ ] Tag archive page
- [ ] About page
- [ ] 404 page
- [ ] Light mode and dark mode for all of the above
- [ ] Mobile (720px breakpoint)

**Done.** The design system refresh is complete.

---

## Key Constraints (Do Not Violate)

1. No color as decoration — black and white only; color only carries meaning
2. Borders over shadows for structural separation
3. No `font-weight: 800` anywhere in the UI
4. No `text-transform: uppercase` on body-level text
5. No teal, cyan, amber, or warm-tinted colors
6. No decorative SVG illustrations or icons
7. No layout or structural changes — visual tokens and micro-interactions only
8. Buttons must use `border-radius: var(--radius-pill)` (9999px) — explicit requirement
