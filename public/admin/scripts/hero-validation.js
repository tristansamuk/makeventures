// preSave event listener that blocks Save when a pending heroImage upload
// exceeds our file-size limit. Only validates uploads that haven't been
// committed yet — already-saved hero images are skipped. The threshold and
// matching error-message value come from HERO_LIMITS in constants.js.

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
    return pending ? pending.get('url') : null;
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
      const url = resolveHeroImageUrl(event.entry);
      if (!url) return;

      const blob = await loadImageBlob(url);

      if (blob.size > HERO_LIMITS.maxBytes) {
        throw new Error(
          `Hero image is ${formatBytes(blob.size)}. Maximum is ${formatBytes(HERO_LIMITS.maxBytes)}. Please compress and re-upload.`,
        );
      }
    },
  });
})();
