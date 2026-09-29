/*
 * ERC Tabs — one row per tab: | Label | /ms/fragments/erc/<page>/<tab> |
 * ak.js inlines each fragment into its row before this runs, so the second
 * cell is the panel. The first row is selected by default.
 */
let uid = 0;

export default function init(el) {
  const rows = [...el.children].filter((row) => row.children.length >= 2);
  if (!rows.length) return;
  uid += 1;

  const list = document.createElement('div');
  list.className = 'erc-tabs-list';
  list.setAttribute('role', 'tablist');
  const panels = document.createElement('div');
  panels.className = 'erc-tabs-panels';

  const tabs = rows.map((row, idx) => {
    const [labelCell, content] = row.children;
    const id = `erc-tab-${uid}-${idx}`;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'erc-tab';
    tab.id = id;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `${id}-panel`);
    tab.textContent = labelCell.textContent.trim();

    const panel = document.createElement('div');
    panel.className = 'erc-tab-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', id);
    panel.tabIndex = 0;
    // A fragment that failed to load leaves its bare link behind — hide that.
    const unresolved = content.children.length === 1 && content.querySelector(':scope > a, :scope > p > a:only-child');
    if (!unresolved) panel.append(...content.childNodes);

    list.append(tab);
    panels.append(panel);
    return { tab, panel };
  });

  const select = (idx, focus = false) => {
    tabs.forEach(({ tab, panel }, i) => {
      const on = i === idx;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      panel.hidden = !on;
    });
    if (focus) tabs[idx].tab.focus();
  };

  list.addEventListener('click', (e) => {
    const idx = tabs.findIndex(({ tab }) => tab === e.target.closest('.erc-tab'));
    if (idx > -1) select(idx);
  });
  list.addEventListener('keydown', (e) => {
    const cur = tabs.findIndex(({ tab }) => tab === document.activeElement);
    const last = tabs.length - 1;
    const next = {
      ArrowRight: cur + 1 > last ? 0 : cur + 1,
      ArrowLeft: cur - 1 < 0 ? last : cur - 1,
      Home: 0,
      End: last,
    }[e.key];
    if (next === undefined || cur < 0) return;
    e.preventDefault();
    select(next, true);
  });

  el.style.setProperty('--erc-tab-count', tabs.length);
  el.replaceChildren(list, panels);
  select(0);
}
