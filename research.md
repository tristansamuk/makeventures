# Design System Research: Luxury Tech / Scandinavian Minimalism Theme

This document provides resources, references, and concrete implementation guidance for rethinking the makeventures design system. The new aesthetic: **clean, mostly black and white, polished, Apple-meets-Scandinavian**. Think: Dieter Rams, Arc Browser, Linear, Vercel, Bang & Olufsen, Teenage Engineering. Restrained, precise, high-craft.

---

## Aesthetic References

### Brand / Product References
- **Apple.com** — negative space mastery, SF Pro display at extreme scale, hairline borders, no color except black/white/grey
- **Linear.app** — dark-first, near-monochrome, tight typography, subtle gradients only on UI chrome
- **Vercel.com** — dark hero sections, full-bleed white space, system-level hierarchy without relying on color
- **Arc Browser** — generous whitespace, geometric precision, type that feels structural not decorative
- **Teenage Engineering** — raw, industrial Scandinavian feel; monospace dominance, utilitarian grid
- **Braun / Dieter Rams** — "less but better" — every element has a reason, nothing decorative
- **Bang & Olufsen** — luxury through restraint; black, white, silver; materials implied by spacing
- **Framer.com** — editorial type hierarchy, stark contrast, the "editorial tech blog" archetype

### Editorial References
- **N+1 Magazine** — sharp typographic grid, no imagery dependency
- **Works That Work** — magazine design applied to a website; monospace dates, clean columns
- **Stripe Press** — ultra-refined serif + grotesque pairing, meticulous spacing

---

## Font Direction

### Current Fonts (to replace)
- Display: `Bricolage Grotesque` — expressive, variable, editorial (keep or replace?)
- Body: `Figtree` — friendly geometric sans
- Mono: `JetBrains Mono` — code-first, technical

### Recommended New Stack

**Option A — Editorial Grotesque (most Apple-adjacent)**
- Display: `Inter` (variable, `wght` 100–900) — the de facto precision sans
- Body: `Inter` — same family, unified and clean
- Mono: `JetBrains Mono` or `IBM Plex Mono` — keep as accent/label font

**Option B — Scandinavian Type Pairing**
- Display: `Geist` (Vercel's open-source sans) — built for precision UIs at editorial scale
- Body: `Geist` — unified system
- Mono: `Geist Mono` — same family, fully cohesive

**Option C — Luxury Editorial**
- Display: `DM Sans` (Google Fonts, geometric, refined) for headings
- Body: `DM Sans` — clean body
- Mono: `DM Mono` — same design family, available via Google Fonts

**Option D — High-contrast Scandinavian**
- Display: `Outfit` or `Space Grotesk` — structured, precise
- Body: `Literata` or `Source Serif 4` — serif body for warmth inside stark shell
- Mono: `IBM Plex Mono` — IBM's Scandinavian-influenced mono

### Google Fonts URLs
```
// Inter
https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap

// Geist — not on Google Fonts; self-host from vercel/geist-font on GitHub
// https://github.com/vercel/geist-font

// DM Sans + DM Mono (Google Fonts)
https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700&family=DM+Mono:wght@400;500&display=swap

// IBM Plex Sans + IBM Plex Mono (Google Fonts)
https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap
```

---

## Color Palette Direction

### Philosophy
- Abandon warm cream/amber entirely
- Light mode: true white or near-white (`#FFFFFF` or `#FAFAFA`), not warm
- Dark mode: true near-black (`#09090B` zinc-950 style), not warm-tinted
- Accent: **no teal/cyan** — replace with either pure black (light mode) or pure white (dark mode) as the accent, OR a single restrained accent (charcoal, graphite, or a very desaturated cool grey)
- Borders: hairline, low-contrast — 1px `rgba(0,0,0,0.08)` in light mode
- "Color" only appears in code blocks (syntax highlighting), images, and tags if used

### Proposed Token Values

```css
/* Light mode — paper white */
--color-bg:            #FFFFFF;
--color-surface:       #F4F4F5;   /* zinc-100 */
--color-border:        rgba(0, 0, 0, 0.08);
--color-border-subtle: rgba(0, 0, 0, 0.05);
--color-ink:           #09090B;   /* zinc-950 */
--color-ink-muted:     #71717A;   /* zinc-500 */
--color-accent:        #09090B;   /* black as accent — links, hover states */
--color-accent-hover:  #3F3F46;   /* zinc-700 */
--color-accent-subtle: #F4F4F5;   /* zinc-100 */
--color-code-bg:       #F4F4F5;
--color-pre-bg:        #09090B;

/* Dark mode — true dark */
--color-bg:            #09090B;   /* zinc-950 */
--color-surface:       #18181B;   /* zinc-900 */
--color-border:        rgba(255, 255, 255, 0.08);
--color-border-subtle: rgba(255, 255, 255, 0.05);
--color-ink:           #FAFAFA;   /* zinc-50 */
--color-ink-muted:     #A1A1AA;   /* zinc-400 */
--color-accent:        #FAFAFA;   /* white as accent */
--color-accent-hover:  #D4D4D8;   /* zinc-300 */
--color-accent-subtle: #27272A;   /* zinc-800 */
--color-code-bg:       #18181B;
--color-pre-bg:        #000000;
```

### Reference: Tailwind Zinc Scale (B&W foundation)
```
zinc-50:  #FAFAFA  — near-white background
zinc-100: #F4F4F5  — surface / card background
zinc-200: #E4E4E7  — borders
zinc-300: #D4D4D8  — muted borders
zinc-400: #A1A1AA  — muted text (light mode unusable, dark mode muted)
zinc-500: #71717A  — muted text
zinc-600: #52525B
zinc-700: #3F3F46
zinc-800: #27272A  — dark surface
zinc-900: #18181B  — dark card
zinc-950: #09090B  — near-black background
```

---

## Typography System Changes

### Current Issues
- `Bricolage Grotesque` at `font-weight: 800` is expressive/editorial — not minimal/austere
- The warm amber drop cap (`color: var(--color-accent)`) on prose is decorative — should be removed or muted
- Letter spacing on mono labels (`0.1em`) reads as "styled" — reduce to `0.04–0.06em` for crisper feel

### Recommended Typography Rules

**Headings:**
- `font-weight: 500` or `600` max (not 800) — heavy weight reads as loud; Apple uses medium/semibold
- `letter-spacing: -0.02em` to `-0.04em` — tight tracking = precision, luxury
- `line-height: 1.1` for display sizes

**Body:**
- `font-size: 1rem` (16px) — Apple standard
- `line-height: 1.6` — slightly tighter than current 1.75/1.8
- `font-weight: 400` — no bold body text except when semantically needed

**Mono labels (dates, tags, nav):**
- Drop `text-transform: uppercase` or use very sparingly
- `letter-spacing: 0.02em` max
- `font-size: 0.75rem` for micro-labels

**Drop cap (`.prose > p:first-of-type::first-letter`):**
- Either remove entirely, or use `color: inherit` (black/white) — no accent color

---

## Shape / Radius Changes

### Current
```css
--radius-sm: 3px;
--radius-md: 6px;
--radius-lg: 12px;
```

### Direction
- **Buttons: `border-radius: 9999px`** (pill/oval) — explicit client requirement; all `<button>` and `<a class="cta-button">` elements must use fully rounded ends
- Add a dedicated token: `--radius-pill: 9999px` for all button and tag pill use cases
- Cards/structural elements: keep subtle rounding — `--radius-sm: 2px`, `--radius-md: 4px`, `--radius-lg: 8px`
- Image corners: sharp (0px) for editorial feel
- The contrast between pill-shaped interactive elements and sharp-cornered structural elements (cards, code blocks, dividers) reinforces the Scandinavian hierarchy: soft where you touch, hard where you read

---

## Shadow Changes

### Current
Warm-tinted colored shadows that add depth and warmth.

### Direction
Remove shadows almost entirely. Instead:
- Structural separation via hairline borders only
- If shadows needed: pure neutral, very subtle
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.08);
```
- In dark mode: borders do the work, no shadows needed

---

## Noise Texture

### Current
`body::before` applies SVG `feTurbulence` grain at `opacity: 0.035` — a warm analog feel.

### Direction
- **Remove entirely** for clean digital feel, OR
- Reduce to `opacity: 0.015` — nearly imperceptible, just kills the flat-screen look
- Apple, Linear, Vercel: no noise texture

---

## Component-Specific Notes

### `src/components/Header.astro`
- `backdrop-filter: blur(12px)` + semi-transparent `background-color` → frosted glass sticky nav (Apple-standard)
  ```css
  background-color: rgba(255, 255, 255, 0.8); /* light */
  background-color: rgba(9, 9, 11, 0.8);      /* dark */
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  ```
- Site title: reduce to `font-weight: 500`, no hover color change (or very subtle)
- Nav links: `font-family: var(--font-body)` instead of mono — cleaner, Apple-style
- Theme toggle: consider removing border entirely; just icon; `opacity: 0.4` → `opacity: 1` on hover

### `src/components/PostCard.astro`
- Remove `transform: translateY(-2px)` on hover — Apple doesn't lift cards
- Remove `border-color: var(--color-accent)` on hover (no color flash)
- Keep image scale hover effect (`scale(1.04)`) — subtle and keeps interactivity
- Date: use `color: var(--color-ink-muted)` not accent — dates shouldn't be highlighted
- Card border: `1px solid var(--color-border)` with the new hairline value

### `src/components/Footer.astro`
- Current: already minimal — mostly keep as-is
- Social link color: `--color-ink-muted` with `--color-ink` on hover (not accent)

### `src/pages/index.astro` — Hero
- Hero eyebrow label: `text-transform: none` — all-caps kills the quiet luxury feel
- Hero stats (`postCount`, `allTags.length`): stat numbers should NOT use accent color — use `var(--color-ink)` or slightly bolder ink
- CTA button: pill-shaped (`border-radius: var(--radius-pill)`), flat until hover
  ```css
  /* Minimal pill CTA */
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
- `fadeUp` animation: reduce `translateY` from `20px` to `8px` — subtle entry, not dramatic

### `src/styles/global.css` — Prose
- Drop cap: remove accent color; use `color: var(--color-ink)` if keeping the effect
- Blockquote border: `--color-border` not `--color-accent` (no color accent)
- `code` background: use new `--color-surface` value (subtle, not warm)

---

## Files to Modify

| File | What Changes |
|------|-------------|
| `src/styles/global.css` | All color tokens, font stack, radius, shadow, noise texture, drop cap |
| `src/components/BaseHead.astro` | Google Fonts URL (new font family) |
| `src/components/Header.astro` | Frosted glass nav, nav font, toggle styling |
| `src/components/PostCard.astro` | Hover behavior, date color, border style |
| `src/components/Footer.astro` | Link hover color |
| `src/components/HeaderLink.astro` | Active/hover state color |
| `src/components/TagList.astro` | Tag pill color (no accent) |
| `src/pages/index.astro` | Hero label casing, stat colors, CTA button, animation easing |
| `src/layouts/BlogPost.astro` | Check for any warm-color references |

---

## Implementation Order (Suggested for Agent)

1. **Fonts first** — update `BaseHead.astro` Google Fonts URL, update `--font-*` tokens in `global.css`
2. **Color tokens** — replace entire `:root` and `[data-theme="dark"]` blocks in `global.css`
3. **Remove noise** — delete or reduce `body::before` grain
4. **Typography rules** — heading weights, tracking, drop cap color
5. **Shadows + radius** — update token values
6. **Header** — frosted glass, font/color updates
7. **PostCard** — hover behavior, date color
8. **Hero page** — CTA button, stat colors, label casing
9. **Global elements** — blockquote, code, links
10. **Build check** — `pnpm build` to verify no compilation errors

---

## Key Design Principles to Enforce

1. **No color as decoration** — color only carries meaning (error states, external link indicators). Otherwise, black and white.
2. **Borders over shadows** — structural separation is 1px lines, not elevation/depth
3. **Weight over size** — use font weight variation (`300`/`400`/`500`/`600`) instead of large size jumps to create hierarchy
4. **Nothing shouts** — no uppercase everywhere, no heavy accents, no dramatic hover effects
5. **Negative space is a design element** — increase `--sp-*` usage rather than filling space
6. **Consistency over expressiveness** — Bricolage Grotesque's variable optical sizing was expressive; the new font should feel neutral and precise

---

## What NOT to Do

- Don't introduce color gradients
- Don't add box shadows to interactive elements to show depth
- Don't use `font-weight: 800` anywhere in the UI
- Don't use `text-transform: uppercase` on body-level text (fine for 2–3 char labels max)
- Don't use any teal, cyan, amber, or warm-tinted colors
- Don't add decorative SVG illustrations or icons
- Don't change the site's structural layout — only visual/stylistic tokens and micro-interactions
