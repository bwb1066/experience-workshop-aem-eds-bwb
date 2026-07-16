/*
 * 4 Square Promos — a 2x2 grid of image tiles, each with an overlaid heading,
 * subhead, and one or more outlined CTA buttons. Authored as a 2x2 table where
 * each cell is: a bold heading, a plain subhead, one or more bold CTAs, and an
 * image (last). The image becomes the tile background; the text overlays it.
 *
 * Authored as "4-square-promos"; ak.js normalizes the leading digit so the
 * block name/class is "four-square-promos" (hence this folder's name).
 */

export default function decorate(block) {
  // Flatten the 2x2 table (block > row > cell) into a grid of promo tiles.
  const cells = [...block.querySelectorAll(':scope > div > div')];

  const promos = cells.map((cell) => {
    const promo = document.createElement('div');
    promo.className = 'promo';

    const media = document.createElement('div');
    media.className = 'promo-media';
    const pic = cell.querySelector('picture');
    if (pic) media.append(pic.closest('picture') || pic);

    const content = document.createElement('div');
    content.className = 'promo-content';
    const ctas = document.createElement('div');
    ctas.className = 'promo-ctas';

    let hasTitle = false;
    [...cell.querySelectorAll(':scope > p')].forEach((p) => {
      if (p.querySelector('picture, img')) return; // handled as media
      const text = p.textContent.trim();
      if (!text) return;
      const strong = p.querySelector('strong');
      const link = p.querySelector('a');
      if (strong && !hasTitle) {
        const title = document.createElement('h3');
        title.className = 'promo-title';
        title.textContent = text;
        content.append(title);
        hasTitle = true;
      } else if (strong) {
        const btn = document.createElement(link ? 'a' : 'span');
        btn.className = 'promo-btn';
        if (link) btn.href = link.getAttribute('href');
        btn.textContent = text;
        ctas.append(btn);
      } else {
        const sub = document.createElement('p');
        sub.className = 'promo-sub';
        sub.textContent = text;
        content.append(sub);
      }
    });

    if (ctas.children.length) content.append(ctas);
    promo.append(media, content);
    return promo;
  });

  block.textContent = '';
  promos.forEach((p) => block.append(p));
}
