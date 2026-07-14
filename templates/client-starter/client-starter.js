/*
 * Optional per-client JS. Loaded automatically in the lazy phase when a page
 * sets `template: <client>` (wired in scripts/lazy.js). Delete this file if the
 * client's concept is CSS-only — the loader treats a missing module as a no-op.
 *
 * Use it for client-specific interactivity that isn't worth a reusable block:
 * scroll effects, a bespoke nav toggle, injecting a prospect logo, etc. Keep
 * DOM queries scoped to the client's page so nothing else is affected.
 */
export default function init() {
  // Example: mark the page ready for client-specific CSS transitions.
  document.body.classList.add('client-starter-ready');
}
