/*
 * SIG SAUER template JS. Loaded in the lazy phase (scripts/lazy.js) only when a
 * page sets `template: sig-sauer`, so this runs on Sig pages only.
 */
export default function init() {
  // Point the favicon at SIG's icon (co-located with this template). Resolved
  // against the module URL so it works on any branch/origin. Overrides the
  // container default without affecting other clients.
  const { href } = new URL('./favicon.png', import.meta.url);
  document.head.querySelectorAll('link[rel~="icon"]').forEach((l) => l.remove());
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = href;
  document.head.appendChild(link);
}
