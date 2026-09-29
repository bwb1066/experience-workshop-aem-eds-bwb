/*
 * Campaign Calendar
 *
 * Authoring (one row per month):
 * | Campaign Calendar |          |                          |                         |
 * | Q1                | <icon>   | **January** / Campaign   | /fragments/.../january  |
 *
 * Rows sharing a quarter label are grouped. Each month becomes a tile that
 * opens its fragment in a shared <dialog>. Fragments load on demand (and are
 * prefetched on hover/focus); scripts.js adds #_dnb to these links so ak.js
 * does not inline all twelve up front. A month is deep-linkable as #<month>.
 */
import { loadFragment } from '../fragment/fragment.js';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

const ICONS = {
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

const toSlug = (text) => text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const shortMonth = (name) => (MONTHS.includes(name) ? name.slice(0, 3) : name);

function parseRow(row) {
  const [qCell, iconCell, textCell, linkCell] = row.children;
  const lines = [...(textCell?.querySelectorAll('p') ?? [])].map((p) => p.textContent.trim());
  const month = textCell?.querySelector('strong')?.textContent.trim() || lines[0] || '';
  const title = lines.find((line) => line && line !== month) || '';
  const link = linkCell?.querySelector('a');
  return {
    quarter: qCell?.textContent.trim() || '',
    picture: iconCell?.querySelector('picture'),
    month,
    title,
    slug: toSlug(month),
    path: link ? new URL(link.href).pathname : '',
  };
}

function buildTile(item) {
  const tile = document.createElement(item.path ? 'button' : 'div');
  tile.className = 'cc-tile';
  tile.id = item.slug;
  if (item.path) {
    tile.type = 'button';
    tile.dataset.path = item.path;
    tile.setAttribute('aria-haspopup', 'dialog');
  }
  const icon = document.createElement('span');
  icon.className = 'cc-icon';
  if (item.picture) {
    item.picture.querySelector('img')?.setAttribute('alt', '');
    icon.append(item.picture);
  }
  const month = document.createElement('span');
  month.className = 'cc-month';
  month.textContent = item.month;
  const title = document.createElement('span');
  title.className = 'cc-title';
  title.textContent = item.title;
  tile.append(icon, month, title);
  return tile;
}

function buildQuarter(label, items) {
  const quarter = document.createElement('section');
  quarter.className = 'cc-quarter';
  const id = `cc-${toSlug(label)}`;
  quarter.setAttribute('aria-labelledby', id);

  const first = items[0].month;
  const last = items[items.length - 1].month;
  const heading = document.createElement('h2');
  heading.className = 'cc-quarter-label';
  heading.id = id;
  heading.innerHTML = `<span class="cc-q">${label}</span>
    <span class="cc-q-range">${shortMonth(first)} – ${shortMonth(last)}</span>`;

  const list = document.createElement('ul');
  list.className = 'cc-months';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.append(buildTile(item));
    list.append(li);
  });
  quarter.append(heading, list);
  return quarter;
}

/** Tag resource links so the template can give each an icon. */
function decorateResources(fragment) {
  fragment.querySelectorAll('li > a').forEach((a) => {
    const text = a.textContent.toLowerCase();
    let type = 'document';
    if (/outlook|email/.test(text)) type = 'email';
    else if (/newsletter/.test(text)) type = 'newsletter';
    a.closest('li').classList.add('cc-resource', `cc-resource-${type}`);
    if (!a.hostname.endsWith(window.location.hostname)) a.target = '_blank';
  });
  // "Email Coming Soon" style placeholders (image cell without an image)
  fragment.querySelectorAll('.columns .col-2').forEach((col) => {
    if (!col.querySelector('picture, img')) col.classList.add('cc-placeholder');
  });
}

function createDialog() {
  const dialog = document.createElement('dialog');
  dialog.className = 'cc-dialog';
  dialog.innerHTML = `
    <div class="cc-dialog-inner">
      <button type="button" class="cc-close" aria-label="Close">${ICONS.close}</button>
      <div class="cc-dialog-body" tabindex="-1"></div>
      <nav class="cc-dialog-nav" aria-label="Campaign months">
        <button type="button" class="cc-prev">${ICONS.prev}<span></span></button>
        <button type="button" class="cc-next"><span></span>${ICONS.next}</button>
      </nav>
    </div>`;
  document.body.append(dialog);
  return dialog;
}

export default async function init(el) {
  const items = [...el.children].map(parseRow).filter((item) => item.month);

  // Group consecutive rows by quarter label (keeps authored order)
  const groups = [];
  items.forEach((item) => {
    const current = groups[groups.length - 1];
    if (current && current.label === item.quarter) current.items.push(item);
    else groups.push({ label: item.quarter, items: [item] });
  });
  el.replaceChildren(...groups.map(({ label, items: qItems }) => buildQuarter(label, qItems)));

  const linked = items.filter((item) => item.path);
  if (!linked.length) return;

  const cache = new Map();
  const getFragment = (path) => {
    if (!cache.has(path)) {
      cache.set(path, loadFragment(path).then((frag) => {
        decorateResources(frag);
        return frag;
      }).catch(() => {
        cache.delete(path);
        return null;
      }));
    }
    return cache.get(path);
  };

  const dialog = createDialog();
  const body = dialog.querySelector('.cc-dialog-body');
  const prev = dialog.querySelector('.cc-prev');
  const next = dialog.querySelector('.cc-next');
  let currentIdx = -1;
  let opener = null;

  const setNav = (btn, item) => {
    btn.hidden = !item;
    if (!item) return;
    btn.querySelector('span').textContent = item.month;
    btn.setAttribute('aria-label', `${btn === prev ? 'Previous' : 'Next'}: ${item.month}, ${item.title}`);
  };

  async function show(idx) {
    const item = linked[idx];
    if (!item) return;
    currentIdx = idx;
    dialog.setAttribute('aria-label', `${item.month}: ${item.title}`);
    setNav(prev, linked[idx - 1]);
    setNav(next, linked[idx + 1]);
    if (!dialog.open) dialog.showModal();
    body.classList.add('is-loading');
    history.replaceState(null, '', `#${item.slug}`);

    const frag = await getFragment(item.path);
    if (currentIdx !== idx) return; // user moved on while this loaded
    body.classList.remove('is-loading');
    if (frag) {
      body.replaceChildren(frag);
    } else {
      body.innerHTML = `<p class="cc-error">Sorry, the ${item.month} campaign details could not be loaded.</p>`;
    }
    body.scrollTop = 0;
    body.focus({ preventScroll: true });
    // Warm the neighbours so prev/next feel instant
    [linked[idx - 1], linked[idx + 1]].forEach((n) => n && getFragment(n.path));
  }

  const openBySlug = (slug) => {
    const idx = linked.findIndex((item) => item.slug === slug);
    if (idx > -1) show(idx);
    return idx > -1;
  };

  el.addEventListener('click', (e) => {
    const tile = e.target.closest('.cc-tile[data-path]');
    if (!tile) return;
    opener = tile;
    openBySlug(tile.id);
  });

  const prefetch = (e) => {
    const tile = e.target.closest?.('.cc-tile[data-path]');
    if (tile) getFragment(tile.dataset.path);
  };
  el.addEventListener('pointerover', prefetch);
  el.addEventListener('focusin', prefetch);

  prev.addEventListener('click', () => show(currentIdx - 1));
  next.addEventListener('click', () => show(currentIdx + 1));
  dialog.querySelector('.cc-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && !prev.hidden) show(currentIdx - 1);
    if (e.key === 'ArrowRight' && !next.hidden) show(currentIdx + 1);
  });
  dialog.addEventListener('close', () => {
    currentIdx = -1;
    history.replaceState(null, '', window.location.pathname + window.location.search);
    const returnTo = opener?.isConnected ? opener : null;
    opener = null;
    returnTo?.focus();
  });

  // Deep links (#may) — also used by the mobile menu in templates/ms/ms.js
  window.addEventListener('hashchange', () => openBySlug(window.location.hash.slice(1)));
  const initial = window.location.hash.slice(1);
  if (initial) openBySlug(initial);
}
