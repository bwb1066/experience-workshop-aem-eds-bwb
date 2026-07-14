/*
 * Brand chat loader for the client workshop container.
 *
 * A page opts into the Brand Concierge chat widget purely through metadata —
 * no per-client code required. Set `concierge-site` (the brand's site_key) and
 * the widget boots itself in the lazy phase, loaded live from its GitHub Pages
 * deployment so every client always gets the latest widget.
 *
 * Page metadata:
 *   concierge-site           brand_configs site_key (REQUIRED to enable chat)
 *   concierge-url            Supabase project URL      (default below)
 *   concierge-key            Supabase anon key         (default below)
 *   concierge-trigger        "false" to hide the corner bubble (default show)
 *   concierge-trigger-style  "bubble" | "tab"          (default "bubble")
 *   concierge-trigger-label  optional label next to the bubble
 */
import { getMetadata } from './ak.js';

// Defaults point at the shared Brand Concierge project. The anon key is a
// public client key (safe to ship); a page can override via `concierge-key`.
const DEFAULTS = {
  url: 'https://cyjquwhkmzyedkwuaffc.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5anF1d2hrbXp5ZWRrd3VhZmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjY4MjcsImV4cCI6MjA5MDY0MjgyN30.GkMBLXBZr9u34m4uI6ZR-2ZniLZD3RkjropjQw058k4',
  widget: 'https://bwb1066.github.io/brand-concierge/widget/brand-concierge.js',
};

export default async function loadBrandChat() {
  const siteKey = getMetadata('concierge-site');
  if (!siteKey) return; // chat is opt-in per page

  const options = {
    supabaseUrl: getMetadata('concierge-url') || DEFAULTS.url,
    anonKey: getMetadata('concierge-key') || DEFAULTS.key,
    siteKey,
    showTrigger: getMetadata('concierge-trigger') !== 'false',
    triggerStyle: getMetadata('concierge-trigger-style') || 'bubble',
    triggerLabel: getMetadata('concierge-trigger-label') || '',
  };

  try {
    const mod = await import(DEFAULTS.widget);
    mod.init(options);
  } catch (ex) {
    // Non-fatal: a chat failure must never break the client's homepage.
    // eslint-disable-next-line no-console
    console.warn('[brand-chat] failed to load widget:', ex);
  }
}
