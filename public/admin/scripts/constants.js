// Validation threshold for hero image uploads. Sourced by hero-validation.js
// for both the check and the matching user-facing error message, so the
// value can't drift between the rule and the message.

window.AdminHelpers = window.AdminHelpers || {};

window.AdminHelpers.HERO_LIMITS = {
  maxBytes: 800 * 1024,
};
