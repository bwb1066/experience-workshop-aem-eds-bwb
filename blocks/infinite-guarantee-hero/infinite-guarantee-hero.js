/*
 * Infinite Guarantee Hero — a dark banner: a logo, a heading, a short bullet
 * list, and a CTA on the left, with a photo filling the right. Authored as a
 * single row of three cells: [ logo image | text | photo ].
 */

export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;
  const cells = [...row.children];
  const [logo, text, photo] = cells;

  if (logo) logo.classList.add('ig-logo');
  if (photo) photo.classList.add('ig-photo');

  if (text) {
    text.classList.add('ig-text');
    const heading = text.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) heading.classList.add('ig-title');

    const paras = [...text.querySelectorAll(':scope > p')];
    const moreP = paras.find((p) => /learn\s*more/i.test(p.textContent));
    paras.forEach((p) => {
      if (p === moreP) return;
      p.classList.add('ig-bullet');
    });

    if (moreP) {
      const link = moreP.querySelector('a');
      const more = document.createElement(link ? 'a' : 'span');
      more.className = 'ig-more';
      if (link) more.href = link.getAttribute('href');
      more.textContent = moreP.textContent.trim();
      moreP.replaceWith(more);
    }
  }
}
