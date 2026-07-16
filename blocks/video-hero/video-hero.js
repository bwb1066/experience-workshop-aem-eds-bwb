import heroInit from '../hero/hero.js';

/*
 * Video hero — a hero whose background is an autoplaying muted looping video.
 * Authored like a hero with an mp4 link in the background row. Reuses the hero
 * block for layout/foreground, then (since the base only builds a video when a
 * poster image is present) turns a bare mp4 link into a background video.
 */
export default async function init(el) {
  el.classList.add('hero');
  await heroInit(el);

  const bg = el.querySelector('.hero-background');
  const vidLink = bg?.querySelector('a[href*=".mp4"]');
  if (!vidLink || bg.querySelector('video')) return;

  const video = document.createElement('video');
  video.src = vidLink.href;
  video.loop = true;
  video.muted = true;
  video.autoplay = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'auto');
  (vidLink.closest('p') || vidLink).replaceWith(video);
  video.play().catch(() => { /* autoplay may be blocked until interaction */ });
}
