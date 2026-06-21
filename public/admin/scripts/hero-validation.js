// preSave event listener that blocks Save when a pending heroImage upload
// fails our constraints (format, decodability, file size). Only validates
// uploads that haven't been committed yet — already-saved hero images are
// skipped. All thresholds and matching error-message values come from
// HERO_LIMITS in constants.js.

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

  function hasAllowedExtension(path) {
    const lowerPath = path.toLowerCase();
    return HERO_LIMITS.allowedExtensions.some((ext) => lowerPath.endsWith(ext));
  }

  function loadImageBlob(url) {
    return fetch(url).then((response) => {
      if (!response.ok)
        throw new Error("Could not fetch hero image for validation.");
      return response.blob();
    });
  }

  // Confirms the bytes are a real, decodable image — catches a corrupted
  // upload or a non-image file that was merely renamed to .jpg, which the
  // extension check alone can't detect.
  function isDecodableImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  CMS.registerEventListener({
    name: "preSave",
    handler: async (event) => {
      const resolved = resolveHeroImageUrl(event.entry);
      if (!resolved) return;

      if (!hasAllowedExtension(resolved.path)) {
        throw new Error("Hero image must be a JPG/JPEG.");
      }

      const [blob, decodable] = await Promise.all([
        loadImageBlob(resolved.url),
        isDecodableImage(resolved.url),
      ]);

      if (!decodable) {
        throw new Error("Hero image could not be read as a valid image.");
      }
      if (blob.size > HERO_LIMITS.maxBytes) {
        throw new Error(
          `Hero image is ${formatBytes(blob.size)}. Maximum is ${formatBytes(HERO_LIMITS.maxBytes)}. Please compress and re-upload.`,
        );
      }
    },
  });
})();
