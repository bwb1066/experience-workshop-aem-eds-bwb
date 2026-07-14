import ENV from './utils/env.js';
import { getMetadata } from './ak.js';

// Load a client template's optional JS. Templates are per-client (see CLIENTS.md);
// `loadTemplate` in ak.js loads templates/<name>/<name>.css, but not JS, so we
// import the matching module here when present. Missing module = no-op.
function loadTemplateScript() {
  const template = getMetadata('template');
  if (!template) return;
  const name = template.replaceAll(' ', '-').toLowerCase();
  import(`../templates/${name}/${name}.js`)
    .then((mod) => { if (mod.default) mod.default(); })
    .catch(() => { /* this client's template has no JS — fine */ });
}

async function loadSidekick() {
  const getSk = () => document.querySelector('aem-sidekick');

  const sk = getSk() || await new Promise((resolve) => {
    document.addEventListener('sidekick-ready', () => resolve(getSk()));
  });
  if (sk) import('../tools/sidekick/sidekick.js').then((mod) => mod.default(sk));
}

(function loadLazy() {
  import('./utils/lazyhash.js');
  import('./utils/favicon.js');
  import('./utils/footer.js').then(({ default: footer }) => footer());

  // Client workshop container add-ons (metadata-driven, opt-in per page)
  loadTemplateScript();
  import('./brand-chat.js').then(({ default: loadBrandChat }) => loadBrandChat());

  // Author facing tools
  if (ENV !== 'prod') {
    import('../tools/scheduler/scheduler.js');
    loadSidekick();
  }
}());
