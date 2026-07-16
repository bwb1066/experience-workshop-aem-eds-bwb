import { loadArea, setConfig, getMetadata, loadStyle } from './ak.js';

/**
 * Folder-derived client template (workshop container — see CLIENTS.md). Pages
 * under /<client>/ automatically get templates/<client>/<client>.css + the
 * body class <client>-template, so authors never need `template` metadata. An
 * explicit `template` metadata still wins (handled by ak.js loadTemplate).
 */
function loadClientTemplate() {
  if (getMetadata('template')) return;
  const [client] = window.location.pathname.split('/').filter(Boolean);
  if (!client) return;
  const { href } = new URL(`../templates/${client}/${client}.css`, import.meta.url);
  document.body.classList.add('has-template');
  loadStyle(href).then(() => {
    document.body.classList.add(`${client}-template`);
    document.body.classList.remove('has-template');
  });
}

const hostnames = ['authorkit.dev'];

const locales = {
  '': { lang: 'en' },
  '/de': { lang: 'de' },
  '/es': { lang: 'es' },
  '/fr': { lang: 'fr' },
  '/hi': { lang: 'hi' },
  '/ja': { lang: 'ja' },
  '/zh': { lang: 'zh' },
};

const linkBlocks = [
  { fragment: '/fragments/' },
  { schedule: '/schedules/' },
  { youtube: 'https://www.youtube' },
];

// Blocks with self-managed styles
const components = ['fragment', 'schedule'];

// How to decorate an area before loading it
const decorateArea = ({ area = document }) => {
  const eagerLoad = (parent, selector) => {
    const img = parent.querySelector(selector);
    if (!img) return;
    img.removeAttribute('loading');
    img.fetchPriority = 'high';
  };

  eagerLoad(area, 'img');
};

export async function loadPage() {
  setConfig({ hostnames, locales, linkBlocks, components, decorateArea });
  loadClientTemplate();
  await loadArea();
}
await loadPage();

(function da() {
  const { searchParams } = new URL(window.location.href);
  const hasPreview = searchParams.has('dapreview');
  if (hasPreview) import('../tools/da/da.js').then((mod) => mod.default(loadPage));
  const hasQE = searchParams.has('quick-edit');
  if (hasQE) import('../tools/quick-edit/quick-edit.js').then((mod) => mod.default());
}());
