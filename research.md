# Research: Remove image upload restrictions in Decap CMS admin (keep file size only)

## Goal

Currently, hero image uploads in Decap CMS are restricted by:
1. File format (must be `.jpg`/`.jpeg`)
2. Minimum dimensions (1920×900)
3. Minimum aspect ratio (1.5×, i.e. landscape only)
4. Max file size (800 KB)

Task: remove restrictions 1–3, keep only the file size limit (#4).

## Where the restrictions live

### 1. `public/admin/scripts/constants.js`

Defines the thresholds consumed by the validator:

```js
window.AdminHelpers.HERO_LIMITS = {
  minWidth: 1920,
  minHeight: 900,
  minAspectRatio: 1.5,
  maxBytes: 800 * 1024,
  allowedExtensions: ['.jpg', '.jpeg'],
};
```

To keep only file size, this object would reduce to just `maxBytes` (and `minWidth`/`minHeight`/`minAspectRatio`/`allowedExtensions` removed, or the object simplified to a single constant).

### 2. `public/admin/scripts/hero-validation.js`

Registers a `preSave` CMS event listener that validates any pending (not-yet-committed) `heroImage` upload before allowing save. Full logic:

```js
CMS.registerEventListener({
  name: 'preSave',
  handler: async (event) => {
    const resolved = await resolveHeroImageUrl(event.entry);
    if (!resolved) return;

    const [dims, blob] = await Promise.all([
      loadImageDimensions(resolved.url),
      loadImageBlob(resolved.url),
    ]);

    const errors = [];
    const path = resolved.path.toLowerCase();
    const hasAllowedExt = HERO_LIMITS.allowedExtensions.some((ext) =>
      path.endsWith(ext),
    );
    if (!hasAllowedExt) {
      errors.push('Hero image must be a JPG/JPEG.');
    }
    if (
      dims.width < HERO_LIMITS.minWidth ||
      dims.height < HERO_LIMITS.minHeight
    ) {
      errors.push(
        `Hero image is ${dims.width}×${dims.height}. Minimum is ${HERO_LIMITS.minWidth}×${HERO_LIMITS.minHeight}.`,
      );
    }
    if (dims.width / dims.height < HERO_LIMITS.minAspectRatio) {
      errors.push(
        `Hero image (${dims.width}×${dims.height}) is too tall. Use a landscape image. width must be at least ${HERO_LIMITS.minAspectRatio}× height.`,
      );
    }
    if (blob.size > HERO_LIMITS.maxBytes) {
      errors.push(
        `Hero image is ${formatBytes(blob.size)}. Maximum is ${formatBytes(HERO_LIMITS.maxBytes)}. Please compress and re-upload.`,
      );
    }

    if (errors.length) {
      throw new Error(errors.join('\n'));
    }
  },
});
```

Things to note for the implementation plan:
- `loadImageDimensions(url)` (loads an `Image()` to read `naturalWidth`/`naturalHeight`) is **only** used for the format/dimension/aspect-ratio checks. If those checks are removed, this function and the corresponding `Promise.all` branch become dead code and can be deleted along with `dims`.
- `loadImageBlob(url)` (fetches the blob to read `.size`) is still needed for the file-size check and must be kept.
- `resolveHeroImageUrl(entry)` (finds the pending upload's blob URL by matching basename against `mediaFiles`) is unrelated to which checks run — keep as-is, it's just how the validator finds the file to check.
- **Collection-agnostic by design**: the listener is registered once globally (`CMS.registerEventListener`) and looks at `entry.getIn(['data', 'heroImage'])` with no collection-name check. It fires for any entry with a `heroImage` field — both `blog` and `projects` collections — so a single edit to this file fixes both. No per-collection logic exists to special-case.
- The handler currently does `Promise.all([loadImageDimensions(resolved.url), loadImageBlob(resolved.url)])` — this needs to become a single `loadImageBlob` call once dimension loading is removed.

### 3. `public/admin/config.yml`

Both the `blog` and `projects` collections have a `heroImage` field with a hint describing the restrictions:

```yaml
- {
    label: 'Hero Image',
    name: 'heroImage',
    widget: 'image',
    required: true,
    hint: 'Landscape JPG, at least 1920×900, max 800 KB. Compress with Squoosh (https://squoosh.app) before uploading.',
  }
```

This hint text appears twice (once per collection, lines ~24-29 for blog, ~75-80 for projects) and should be updated to reflect only the file-size limit, e.g. something like `'Max 800 KB. Compress with Squoosh (https://squoosh.app) before uploading.'`. Per CLAUDE.md, `public/admin/config.yml` field definitions should stay mirrored with the Zod schema in `content.config.ts`, but the schema (`heroImage: image()`) has no format/dimension constraints of its own — those are CMS-only — so no schema change is needed there.

### 4. `public/admin/index.html`

The load-order comment references the validator generically and doesn't need to change:

```html
<!--
  Decap CMS admin entry. Load order matters:
    1. decap-cms.js (UMD) defines the globals: CMS, createClass, h
    2. constants.js + utils.js seed window.AdminHelpers
    3. remaining scripts register preview templates, the video editor
       component, and the preSave hero-image validator
-->
```

No changes needed here — script load order and registration are unaffected by which checks the validator performs.

### 5. `public/admin/scripts/utils.js`

`formatBytes(bytes)` is used only by the file-size error message — keep, no changes needed.

## Astro-side schema (`src/content.config.ts`)

```ts
heroImage: image(),
```

This is Astro's built-in image schema helper — it validates that the referenced file is a real, processable image (resolvable by `sharp`), but imposes no format/dimension/aspect-ratio/size constraints itself. No changes needed here; this confirms format/dimension restrictions are purely a Decap CMS-side, custom-built validation (not derived from Astro requirements).

## Summary of changes needed

1. **`public/admin/scripts/constants.js`**: Remove `minWidth`, `minHeight`, `minAspectRatio`, `allowedExtensions` from `HERO_LIMITS`; keep only `maxBytes`.
2. **`public/admin/scripts/hero-validation.js`**:
   - Remove the `loadImageDimensions` function (no longer used).
   - Remove the format check (`hasAllowedExt` / `allowedExtensions`), the min-dimension check, and the aspect-ratio check from the `preSave` handler.
   - Simplify `Promise.all([loadImageDimensions(...), loadImageBlob(...)])` to a single `await loadImageBlob(resolved.url)` call.
   - Keep the file-size check (`blob.size > HERO_LIMITS.maxBytes`) and its error message.
3. **`public/admin/config.yml`**: Update the `hint` text on both `heroImage` fields (blog and projects collections) to only mention the file-size limit, dropping the "Landscape JPG, at least 1920×900" portion.
4. No changes needed to `src/content.config.ts`, `public/admin/index.html`, or `public/admin/scripts/utils.js`.

## Verification plan

- Per CLAUDE.md: run `pnpm build` after changes to verify the site compiles cleanly.
- Manually test in `/admin/` (or via `pnpm dev`) by attempting to upload a small non-JPG, low-res, or portrait-oriented image and confirming it's now accepted, while an oversized file (>800 KB) is still rejected with the existing error message.
