// Validation thresholds for hero image uploads. Sourced by hero-validation.js
// for both the checks and the matching user-facing error messages, so values
// can't drift between the rule and the message.

window.AdminHelpers = window.AdminHelpers || {};

window.AdminHelpers.HERO_LIMITS = {
  maxBytes: 800 * 1024,
  allowedExtensions: [".jpg", ".jpeg"],
};
