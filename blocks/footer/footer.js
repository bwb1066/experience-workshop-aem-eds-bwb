import { getConfig, getMetadata } from '../../scripts/ak.js';
import { loadFirstFragment, clientSegment } from '../fragment/fragment.js';

const FOOTER_PATH = '/fragments/nav/footer';

/**
 * loads and decorates the footer
 * @param {Element} el The footer element
 */
export default async function init(el) {
  const { locale } = getConfig();
  // Resolve the footer fragment: explicit `footer-content` metadata override,
  // then the per-client fragment (/<client>/nav/footer), then the shared default.
  const explicit = getMetadata('footer-content');
  const client = clientSegment();
  const candidates = [
    explicit && `${locale.prefix}${explicit}`,
    client && `${locale.prefix}/${client}/nav/footer`,
    `${locale.prefix}${FOOTER_PATH}`,
  ];
  try {
    const fragment = await loadFirstFragment(candidates);
    fragment.classList.add('footer-content');

    const sections = [...fragment.querySelectorAll('.section')];

    const copyright = sections.pop();
    if (copyright) copyright.classList.add('section-copyright');

    const legal = sections.pop();
    if (legal) legal.classList.add('section-legal');

    el.append(fragment);
  } catch (e) {
    throw Error(e);
  }
}
