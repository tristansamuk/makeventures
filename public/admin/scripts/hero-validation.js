(() => {
  const { HERO_LIMITS, formatBytes } = window.AdminHelpers;

  function resolveHeroImageUrl(entry) {
    const heroPath = entry.getIn(['data', 'heroImage']);
    if (!heroPath) return null;

    const mediaFiles = entry.get('mediaFiles');
    if (!mediaFiles || !mediaFiles.size) return null;

    // heroPath is post-relative; mediaFile.path is repo-relative — match by basename.
    const heroName = heroPath.split('/').pop();
    const pending = mediaFiles.find(
      (f) => (f.get('path') || '').split('/').pop() === heroName,
    );
    if (!pending || !pending.get('url')) return null;

    return { path: heroPath, url: pending.get('url') };
  }

  function loadImageDimensions(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () =>
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () =>
        reject(new Error('Could not load hero image for validation.'));
      img.src = url;
    });
  }

  function loadImageBlob(url) {
    return fetch(url).then((response) => {
      if (!response.ok)
        throw new Error('Could not fetch hero image for validation.');
      return response.blob();
    });
  }

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
})();
