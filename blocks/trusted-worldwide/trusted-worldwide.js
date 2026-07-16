/*
 * Trusted Worldwide — a showcase where selecting a tab on the right swaps the
 * large "stage" image on the left and expands that tab's detail. Authored as a
 * table where each row is two cells:
 *   [ big stage image | info ]
 * and `info` is: leading title text, then a thumbnail image, a caption, and a
 * "read more" link. Fields may be split across paragraphs or run together with
 * <br>, so we locate the thumbnail image and slice around it rather than
 * assuming a fixed paragraph layout.
 */

/** Trimmed text content of everything before `stop` within `container`. */
function textBefore(container, stop) {
  const range = document.createRange();
  range.setStart(container, 0);
  range.setEndBefore(stop);
  return range.cloneContents().textContent.replace(/\s+/g, ' ').trim();
}

/** Trimmed text content of everything after `start` within `container`. */
function textAfter(container, start) {
  if (!container.lastChild) return '';
  const range = document.createRange();
  range.setStartAfter(start);
  range.setEndAfter(container.lastChild);
  return range.cloneContents().textContent.replace(/\s+/g, ' ').trim();
}

export default function decorate(block) {
  const rows = [...block.children];

  const stage = document.createElement('div');
  stage.className = 'tw-stage';

  // Horizontal tab bar across the top of the right column.
  const tabbar = document.createElement('div');
  tabbar.className = 'tw-tabs';
  tabbar.setAttribute('role', 'tablist');

  // Detail area below the tabs — shows the active tab's image, caption + link.
  const details = document.createElement('div');
  details.className = 'tw-details';

  const panels = [];
  const detailEls = [];
  const heads = [];

  const select = (i) => {
    panels.forEach((p, j) => p.classList.toggle('is-active', j === i));
    detailEls.forEach((d, j) => d.classList.toggle('is-active', j === i));
    heads.forEach((h, j) => {
      h.classList.toggle('is-active', j === i);
      h.setAttribute('aria-selected', String(j === i));
    });
  };

  rows.forEach((row, i) => {
    const [imgCell, infoCell] = row.children;

    // Left stage image for this tab.
    const panel = document.createElement('div');
    panel.className = 'tw-panel';
    const big = imgCell && (imgCell.querySelector('picture') || imgCell.querySelector('img'));
    if (big) panel.append(big);
    stage.append(panel);
    panels.push(panel);

    const thumb = infoCell && infoCell.querySelector('picture, img');
    let title = '';
    if (thumb) title = textBefore(infoCell, thumb);
    else if (infoCell) title = infoCell.textContent.trim();

    // Tab head (title).
    const head = document.createElement('button');
    head.className = 'tw-tab-head';
    head.type = 'button';
    head.setAttribute('role', 'tab');
    head.textContent = title;
    tabbar.append(head);
    heads.push(head);

    // Detail: thumbnail image, caption, read-more button.
    const detail = document.createElement('div');
    detail.className = 'tw-detail';
    if (thumb) {
      const pic = thumb.closest('picture') || thumb;
      // "read more" is the last paragraph/link that says so; pull it out first.
      const parts = infoCell ? [...infoCell.querySelectorAll('p, a')] : [];
      const moreEl = parts.reverse().find((el) => /read\s*more/i.test(el.textContent));
      let caption = textAfter(infoCell, pic);
      if (moreEl) caption = caption.replace(moreEl.textContent.replace(/\s+/g, ' ').trim(), '').trim();

      detail.append(pic);
      if (caption) {
        const cap = document.createElement('p');
        cap.className = 'tw-caption';
        cap.textContent = caption;
        detail.append(cap);
      }
      if (moreEl) {
        const link = moreEl.matches('a') ? moreEl : moreEl.querySelector('a');
        const more = document.createElement(link ? 'a' : 'span');
        more.className = 'tw-more';
        if (link) more.href = link.getAttribute('href');
        more.textContent = moreEl.textContent.trim();
        detail.append(more);
      }
    }
    details.append(detail);
    detailEls.push(detail);

    head.addEventListener('click', () => select(i));
  });

  block.textContent = '';
  const right = document.createElement('div');
  right.className = 'tw-right';
  right.append(tabbar, details);
  const layout = document.createElement('div');
  layout.className = 'tw-layout';
  layout.append(stage, right);
  block.append(layout);

  select(0);
}
