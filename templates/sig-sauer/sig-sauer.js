/*
 * SIG SAUER template JS. Loaded in the lazy phase (scripts/lazy.js) only when a
 * page sets `template: sig-sauer`, so this runs on Sig pages only.
 */

// Compact inline icons (feather-style, currentColor).
const ICONS = {
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  pin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  announce: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>',
  cart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>',
  user: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="8" r="4"/></svg>',
  menu: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  close: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
};

/** Resolve once the selector appears (header loads async, post-LCP). */
function whenReady(selector, timeout = 6000) {
  return new Promise((resolve) => {
    const found = document.querySelector(selector);
    if (found) {
      resolve(found);
      return;
    }
    const obs = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        obs.disconnect();
        resolve(el);
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      obs.disconnect();
      resolve(document.querySelector(selector));
    }, timeout);
  });
}

/** Inject the SIG right-side utilities (search + icons) into the header actions cell. */
async function injectUtils() {
  const content = await whenReady('header .header-content');
  if (!content || content.querySelector('.sig-utils')) return;

  const utils = document.createElement('div');
  utils.className = 'sig-utils';
  utils.innerHTML = `
    <form class="sig-search" role="search">
      <input type="search" placeholder="Search Site" aria-label="Search site">
      <button type="submit" aria-label="Search">${ICONS.search}</button>
    </form>
    <a class="sig-icon" href="/sig-sauer/dealers" aria-label="Find a store">${ICONS.pin}</a>
    <a class="sig-icon" href="/sig-sauer/news" aria-label="Announcements">${ICONS.announce}</a>
    <a class="sig-icon" href="/sig-sauer/cart" aria-label="Cart">${ICONS.cart}</a>
    <a class="sig-icon" href="/sig-sauer/account" aria-label="Account">${ICONS.user}</a>
  `;
  utils.querySelector('.sig-search').addEventListener('submit', (e) => e.preventDefault());
  content.append(utils);
}

/** Inject the mobile hamburger. SIG's nav fragment has no `/tools/widgets/toggle`
 *  link, so the base header never builds a toggle — add one and drive the base
 *  `is-mobile-open` state ourselves. Hidden on desktop via CSS. */
async function injectHamburger() {
  const content = await whenReady('header .header-content');
  const header = content && content.closest('header');
  if (!header || header.querySelector('.sig-hamburger')) return;

  const btn = document.createElement('button');
  btn.className = 'sig-hamburger';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = ICONS.menu;

  btn.addEventListener('click', () => {
    const open = header.classList.toggle('is-mobile-open');
    btn.setAttribute('aria-expanded', String(open));
    btn.innerHTML = open ? ICONS.close : ICONS.menu;
  });

  // Tapping a top-level category toggles its accordion (base handler), but
  // tapping a real link inside a submenu should close the whole menu.
  header.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && header.classList.contains('is-mobile-open') && !link.closest('.main-nav-link')) {
      header.classList.remove('is-mobile-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = ICONS.menu;
    }
  });

  header.append(btn);
}

/** Recolor the brand logo image to a solid color via a CSS mask, so it can be
 *  forced white and hover the theme yellow (a plain filter can't hit an exact
 *  hex). No-op for text/wordmark brands (no image). */
async function recolorLogo() {
  const brand = await whenReady('header .brand-section');
  const img = brand && brand.querySelector('img');
  if (!img) return;
  const src = img.currentSrc || img.src;
  const ratio = img.naturalWidth && img.naturalHeight
    ? img.naturalWidth / img.naturalHeight
    : 4;
  const logo = document.createElement('span');
  logo.className = 'sig-logo';
  logo.style.width = `${Math.round(34 * ratio)}px`;
  logo.style.webkitMaskImage = `url("${src}")`;
  logo.style.maskImage = `url("${src}")`;
  (img.closest('picture') || img).replaceWith(logo);
}

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

  injectUtils();
  injectHamburger();
  recolorLogo();
}
