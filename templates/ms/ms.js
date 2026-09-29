/*
 * MissionSquare template JS (lazy phase, /ms/ pages only).
 * Builds the phone-only top bar: logo (appears once the hero scrolls away) and a
 * hamburger that opens a month menu grouped by quarter. Menu links are #<month>
 * deep links, which the campaign-calendar block opens in its dialog.
 * Hidden at >= 900px by templates/ms/ms.css.
 */

function buildMenu(calendar) {
  const menu = document.createElement('nav');
  menu.className = 'ms-menu';
  menu.id = 'ms-menu';
  menu.setAttribute('aria-label', 'Campaign months');
  menu.hidden = true;

  calendar.querySelectorAll('.cc-quarter').forEach((quarter) => {
    const heading = document.createElement('h2');
    heading.innerHTML = `${quarter.querySelector('.cc-q')?.textContent ?? ''}
      <small>${quarter.querySelector('.cc-q-range')?.textContent ?? ''}</small>`;
    const list = document.createElement('ul');
    quarter.querySelectorAll('.cc-tile[data-path]').forEach((tile) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${tile.id}`;
      a.innerHTML = '<strong></strong><span></span>';
      a.querySelector('strong').textContent = tile.querySelector('.cc-month')?.textContent ?? '';
      a.querySelector('span').textContent = tile.querySelector('.cc-title')?.textContent ?? '';
      li.append(a);
      list.append(li);
    });
    menu.append(heading, list);
  });

  const cta = document.querySelector('.toolkit-footer a.btn');
  if (cta) {
    const wrap = document.createElement('p');
    wrap.className = 'ms-menu-cta';
    const link = cta.cloneNode(true);
    link.removeAttribute('class');
    wrap.append(link);
    menu.append(wrap);
  }
  return menu;
}

/** MissionSquare favicon, co-located with this template (from missionsquare.com). */
function setFavicon() {
  const { href } = new URL('./favicon.ico', import.meta.url);
  document.head.querySelectorAll('link[rel~="icon"]').forEach((l) => l.remove());
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/x-icon';
  link.href = href;
  document.head.append(link);
}

export default function init() {
  setFavicon();
  const calendar = document.querySelector('.campaign-calendar');
  if (!calendar || document.querySelector('.ms-bar')) return;

  const bar = document.createElement('div');
  bar.className = 'ms-bar';

  const heroLogo = document.querySelector('.toolkit-hero .hero-background a, .toolkit-hero .hero-background picture');
  if (heroLogo) {
    const logo = heroLogo.cloneNode(true);
    logo.classList.add('ms-bar-logo');
    logo.setAttribute('aria-hidden', 'true');
    logo.tabIndex = -1;
    logo.querySelector('img')?.setAttribute('loading', 'lazy');
    bar.append(logo);
  }

  const burger = document.createElement('button');
  burger.type = 'button';
  burger.className = 'ms-burger';
  burger.setAttribute('aria-label', 'Open menu');
  burger.setAttribute('aria-controls', 'ms-menu');
  burger.setAttribute('aria-expanded', 'false');
  burger.innerHTML = '<span></span>';
  bar.append(burger);

  const menu = buildMenu(calendar);
  document.body.append(bar, menu);

  const setOpen = (open) => {
    menu.hidden = !open;
    bar.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) menu.querySelector('a')?.focus();
  };

  burger.addEventListener('click', () => setOpen(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      burger.focus();
    }
  });
  window.matchMedia('(width >= 900px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });

  // Solid bar + logo once the hero has scrolled out of view
  const hero = document.querySelector('.toolkit-hero');
  if (hero) {
    new IntersectionObserver(([entry]) => {
      bar.classList.toggle('is-scrolled', !entry.isIntersecting);
    }, { rootMargin: '-60px 0px 0px 0px' }).observe(hero);
  }
}
