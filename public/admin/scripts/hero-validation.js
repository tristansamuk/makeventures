// preSave event listener that blocks Save when a pending heroImage upload
// fails our constraints (format, file size). Only validates uploads that
// haven't been committed yet — already-saved hero images are skipped. All
// thresholds and matching error-message values come from HERO_LIMITS in
// constants.js.

(() => {
  const { HERO_LIMITS, formatBytes } = window.AdminHelpers;

  function resolveHeroImageUrl(entry) {
    const heroPath = entry.getIn(["data", "heroImage"]);
    if (!heroPath) return null;

    const mediaFiles = entry.get("mediaFiles");
    if (!mediaFiles || !mediaFiles.size) return null;

    // heroPath is post-relative; mediaFile.path is repo-relative — match by basename.
    const heroName = heroPath.split("/").pop();
    const pending = mediaFiles.find(
      (f) => (f.get("path") || "").split("/").pop() === heroName,
    );
    if (!pending || !pending.get("url")) return null;

    return { path: heroPath, url: pending.get("url") };
  }

  function loadImageBlob(url) {
    return fetch(url).then((response) => {
      if (!response.ok)
        throw new Error("Could not fetch hero image for validation.");
      return response.blob();
    });
  }

  CMS.registerEventListener({
    name: "preSave",
    handler: async (event) => {
      const resolved = resolveHeroImageUrl(event.entry);
      if (!resolved) return;

      const blob = await loadImageBlob(resolved.url);

      const errors = [];
      const path = resolved.path.toLowerCase();
      const hasAllowedExt = HERO_LIMITS.allowedExtensions.some((ext) =>
        path.endsWith(ext),
      );
      if (!hasAllowedExt) {
        errors.push("Hero image must be a JPG/JPEG.");
      }
      if (blob.size > HERO_LIMITS.maxBytes) {
        errors.push(
          `Hero image is ${formatBytes(blob.size)}. Maximum is ${formatBytes(HERO_LIMITS.maxBytes)}. Please compress and re-upload.`,
        );
      }

      if (errors.length) {
        throw new Error(errors.join("\n"));
      }
    },
  });
})();
