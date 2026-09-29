/*
 * ERC Guides — one row per guide: | <link> | optional badge (e.g. "New!") |
 * Links to /…/videos/… fragments are videos (templates/ms/ms.js opens them in
 * a player dialog); everything else is a downloadable guide.
 */
export default function init(el) {
  const list = document.createElement('ul');
  list.className = 'erc-guides-list';

  [...el.children].forEach((row) => {
    const a = row.querySelector('a');
    if (!a) return;
    const badge = row.children[1]?.textContent.trim();
    const isVideo = /\/videos\//.test(a.pathname);

    a.className = `erc-guide erc-guide-${isVideo ? 'video' : 'document'}`;
    const label = document.createElement('span');
    label.className = 'erc-guide-label';
    label.textContent = a.textContent.trim();
    const icon = document.createElement('span');
    icon.className = 'erc-guide-icon';
    icon.setAttribute('aria-hidden', 'true');
    a.replaceChildren(icon, label);
    if (badge) {
      const b = document.createElement('span');
      b.className = 'erc-guide-badge';
      b.textContent = badge;
      a.append(b);
    }
    if (!isVideo && a.hostname !== window.location.hostname) {
      a.target = '_blank';
      a.rel = 'noopener';
    }

    const li = document.createElement('li');
    li.append(a);
    list.append(li);
  });

  el.replaceChildren(list);
}
