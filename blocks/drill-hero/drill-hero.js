/*
 * Drill Hero — a full-bleed promo image that links out. The image is a
 * self-contained graphic; authored as a single cell with an image and a link,
 * so we make the whole image a link to that href (no overlaid button).
 */

export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block.querySelector(':scope > div');
  const pic = cell && cell.querySelector('picture, img');
  const link = cell && cell.querySelector('a');
  const href = link && link.getAttribute('href');

  block.textContent = '';

  const media = pic ? (pic.closest('picture') || pic) : null;
  if (href) {
    const a = document.createElement('a');
    a.className = 'dh-link';
    a.href = href;
    if (link.title) a.title = link.title;
    if (media) a.append(media);
    block.append(a);
  } else if (media) {
    block.append(media);
  }
}
