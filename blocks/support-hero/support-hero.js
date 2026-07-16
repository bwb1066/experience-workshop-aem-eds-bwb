/*
 * Support Hero — a row of quiet "support" cards, each an icon + heading, a short
 * description, and a "Learn More" link. Authored as nested `card (quiet, center)`
 * block tables inside this block; nested block tables aren't auto-decorated, so
 * we read each table's content row and build the card here.
 */

export default function decorate(block) {
  const tables = [...block.querySelectorAll('table')];

  const grid = document.createElement('div');
  grid.className = 'sh-grid';

  tables.forEach((table) => {
    const rows = [...table.querySelectorAll('tr')];
    const content = rows[rows.length - 1]?.querySelector('td');
    if (!content) return;

    const card = document.createElement('div');
    card.className = 'sh-card';

    const icon = content.querySelector('picture, img');
    const strong = content.querySelector('strong');
    const link = content.querySelector('a');
    const paras = [...content.querySelectorAll(':scope > p')];
    const descP = paras.find((p) => p.textContent.trim()
      && !p.querySelector('strong, picture, img, a'));

    const head = document.createElement('div');
    head.className = 'sh-head';
    if (icon) head.append(icon.closest('picture') || icon);
    if (strong) {
      const title = document.createElement('span');
      title.className = 'sh-title';
      title.textContent = strong.textContent.trim();
      head.append(title);
    }
    card.append(head);

    if (descP) {
      const desc = document.createElement('p');
      desc.className = 'sh-desc';
      desc.textContent = descP.textContent.trim();
      card.append(desc);
    }
    if (link) {
      const more = document.createElement('a');
      more.className = 'sh-link';
      more.href = link.getAttribute('href');
      more.textContent = link.textContent.trim();
      card.append(more);
    }

    grid.append(card);
  });

  block.textContent = '';
  block.append(grid);
}
