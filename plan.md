# Plan: Remove image upload restrictions in Decap CMS admin (keep file size only)

Source: `research.md`. Each step is small and scoped to one file. **Stop after each step and wait for human confirmation before proceeding to the next.**

---

## Step 1 — Trim `HERO_LIMITS` in `public/admin/scripts/constants.js`

Remove `minWidth`, `minHeight`, `minAspectRatio`, and `allowedExtensions`. Keep only `maxBytes`.

```js
window.AdminHelpers.HERO_LIMITS = {
  maxBytes: 800 * 1024,
};
```

Update the file's leading comment if it references the removed thresholds.

**Stop. Wait for confirmation.**

---

## Step 2 — Simplify `public/admin/scripts/hero-validation.js`

- Delete the `loadImageDimensions` function (no longer used by any check).
- In the `preSave` handler, replace `const [dims, blob] = await Promise.all([loadImageDimensions(resolved.url), loadImageBlob(resolved.url)]);` with `const blob = await loadImageBlob(resolved.url);`.
- Remove the format check (`hasAllowedExt` / `allowedExtensions`), the min-dimension check, and the aspect-ratio check.
- Keep the file-size check (`blob.size > HERO_LIMITS.maxBytes`) and its error message unchanged.
- Update the file's leading comment (currently says "format, dimensions, aspect ratio, file size") to reflect that only file size is validated.

**Stop. Wait for confirmation.**

---

## Step 3 — Update hint text in `public/admin/config.yml`

Update the `hint` on the `heroImage` field for **both** the `blog` and `projects` collections (currently identical text in each), from:

```
Landscape JPG, at least 1920×900, max 800 KB. Compress with Squoosh (https://squoosh.app) before uploading.
```

to:

```
Max 800 KB. Compress with Squoosh (https://squoosh.app) before uploading.
```

**Stop. Wait for confirmation.**

---

## Step 4 — Verify build

Run `pnpm build` to confirm the site compiles cleanly (per CLAUDE.md, this is required after changes). No source files outside the admin scripts/config were touched, so this is a sanity check, not expected to surface issues.

**Stop. Wait for confirmation.**

---

## Step 5 — Manual verification in CMS

Run `pnpm dev`, open `/admin/`, and on a blog post (or project) entry:

1. Upload a small non-JPG image (e.g. PNG), low-res, and/or portrait-oriented — confirm it's now **accepted** (no validation error).
2. Upload an oversized image (>800 KB) — confirm it's still **rejected** with the existing "Maximum is 800 KB" error message.
3. Confirm this behavior holds for both the `blog` and `projects` collections (the validator is collection-agnostic per `research.md`, so one fix should cover both — verify directly rather than assuming).

**Stop. Wait for confirmation that verification passed before considering the task complete.**
