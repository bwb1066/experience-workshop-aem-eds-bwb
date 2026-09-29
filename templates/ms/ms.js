/*
 * MissionSquare template JS (lazy phase, /ms/ pages only).
 * Builds the phone-only top bar: logo (appears once the hero scrolls away) and a
 * hamburger that opens a month menu grouped by quarter. Menu links are #<month>
 * deep links, which the campaign-calendar block opens in its dialog.
 * Hidden at >= 900px by templates/ms/ms.css.
 */

function buildMenu(calendar) {
  const menu = document.createElement('nav');
  menu.className = 'ms-menu';
  menu.id = 'ms-menu';
  menu.setAttribute('aria-label', 'Campaign months');
  menu.hidden = true;

  calendar.querySelectorAll('.cc-quarter').forEach((quarter) => {
    const heading = document.createElement('h2');
    heading.innerHTML = `${quarter.querySelector('.cc-q')?.textContent ?? ''}
      <small>${quarter.querySelector('.cc-q-range')?.textContent ?? ''}</small>`;
    const list = document.createElement('ul');
    quarter.querySelectorAll('.cc-tile[data-path]').forEach((tile) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${tile.id}`;
      a.innerHTML = '<strong></strong><span></span>';
      a.querySelector('strong').textContent = tile.querySelector('.cc-month')?.textContent ?? '';
      a.querySelector('span').textContent = tile.querySelector('.cc-title')?.textContent ?? '';
      li.append(a);
      list.append(li);
    });
    menu.append(heading, list);
  });

  const cta = document.querySelector('.toolkit-footer a.btn');
  if (cta) {
    const wrap = document.createElement('p');
    wrap.className = 'ms-menu-cta';
    const link = cta.cloneNode(true);
    link.removeAttribute('class');
    wrap.append(link);
    menu.append(wrap);
  }
  return menu;
}

/** MissionSquare favicon, co-located with this template (from missionsquare.com). */
function setFavicon() {
  const { href } = new URL('./favicon.ico', import.meta.url);
  document.head.querySelectorAll('link[rel~="icon"]').forEach((l) => l.remove());
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/x-icon';
  link.href = href;
  document.head.append(link);
}

/* ---------- Employer Resource Center (/ms/erc/…) ---------- */

const VIDEO_PATH = /\/fragments\/.+\/videos\//;

/** Open /…/videos/<slug> fragment links in a Vimeo player dialog. */
function initVideoDialog() {
  let dialog;
  const build = () => {
    dialog = document.createElement('dialog');
    dialog.className = 'ms-video-dialog';
    dialog.innerHTML = `<div class="ms-video-head"><h2></h2>
      <button type="button" class="ms-video-close" aria-label="Close video">&times;</button></div>
      <div class="ms-video-frame"></div>`;
    dialog.querySelector('.ms-video-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => dialog.querySelector('.ms-video-frame').replaceChildren());
    document.body.append(dialog);
  };

  document.addEventListener('click', async (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a || !VIDEO_PATH.test(a.pathname) || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    if (!dialog) build();
    const title = dialog.querySelector('h2');
    const frame = dialog.querySelector('.ms-video-frame');
    title.textContent = a.querySelector('.erc-guide-label')?.textContent || a.textContent.trim();
    frame.replaceChildren();
    dialog.showModal();
    try {
      const resp = await fetch(a.pathname);
      if (!resp.ok) throw new Error(resp.status);
      const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
      const src = [...doc.querySelectorAll('main a[href]')].map((l) => l.href).find((h) => /vimeo\.com/.test(h));
      if (!src) throw new Error('no video');
      title.textContent = doc.querySelector('main h1, main h2, main h3')?.textContent.trim() || title.textContent;
      const url = new URL(src);
      url.searchParams.set('autoplay', '1');
      url.searchParams.set('dnt', '1');
      const iframe = document.createElement('iframe');
      iframe.src = url.href;
      iframe.title = title.textContent;
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      frame.replaceChildren(iframe);
    } catch {
      frame.innerHTML = '<p class="ms-video-error">Sorry, this video could not be loaded.</p>';
    }
  });
}

function initErc() {
  const sidebar = document.querySelector('main > .erc-sidebar');
  if (!sidebar || sidebar.dataset.ready) return;
  sidebar.dataset.ready = 'true';
  const content = sidebar.querySelector('.default-content') || sidebar;

  // Logo goes back to MissionSquare, as in the original
  const logo = content.querySelector(':scope > p > picture');
  if (logo && !logo.closest('a')) {
    const a = document.createElement('a');
    a.href = 'https://www.missionsq.org/';
    a.setAttribute('aria-label', 'MissionSquare home');
    logo.replaceWith(a);
    a.append(logo);
  }

  // Current topic
  const here = window.location.pathname.replace(/\/$/, '');
  content.querySelectorAll('li a[href]').forEach((a) => {
    if (a.pathname.replace(/\/$/, '') === here) {
      a.setAttribute('aria-current', 'page');
      a.closest('li').classList.add('is-active');
    }
  });

  // Phones: collapse the sidebar behind a menu button
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'ms-burger erc-menu-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.innerHTML = '<span></span>';
  toggle.addEventListener('click', () => {
    const open = !sidebar.classList.contains('is-open');
    sidebar.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  sidebar.prepend(toggle);
}

export default function init() {
  setFavicon();
  initVideoDialog();
  initErc();
  const calendar = document.querySelector('.campaign-calendar');
  if (!calendar || document.querySelector('.ms-bar')) return;

  const bar = document.createElement('div');
  bar.className = 'ms-bar';

  const heroLogo = document.querySelector('.toolkit-hero .hero-background a, .toolkit-hero .hero-background picture');
  if (heroLogo) {
    const logo = heroLogo.cloneNode(true);
    logo.classList.add('ms-bar-logo');
    logo.setAttribute('aria-hidden', 'true');
    logo.tabIndex = -1;
    logo.querySelector('img')?.setAttribute('loading', 'lazy');
    bar.append(logo);
  }

  const burger = document.createElement('button');
  burger.type = 'button';
  burger.className = 'ms-burger';
  burger.setAttribute('aria-label', 'Open menu');
  burger.setAttribute('aria-controls', 'ms-menu');
  burger.setAttribute('aria-expanded', 'false');
  burger.innerHTML = '<span></span>';
  bar.append(burger);

  const menu = buildMenu(calendar);
  document.body.append(bar, menu);

  const setOpen = (open) => {
    menu.hidden = !open;
    bar.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) menu.querySelector('a')?.focus();
  };

  burger.addEventListener('click', () => setOpen(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      burger.focus();
    }
  });
  window.matchMedia('(width >= 900px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });

  // Solid bar + logo once the hero has scrolled out of view
  const hero = document.querySelector('.toolkit-hero');
  if (hero) {
    new IntersectionObserver(([entry]) => {
      bar.classList.toggle('is-scrolled', !entry.isIntersecting);
    }, { rootMargin: '-60px 0px 0px 0px' }).observe(hero);
  }
}
