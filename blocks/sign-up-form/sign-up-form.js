/*
 * Sign-up form block.
 *
 * Author it as a table named `sign-up-form` where each row is
 *   <field key> | <placeholder>
 * e.g.
 *   email | Enter Your Email Address
 *   zip   | Enter Your Zip Code
 * The block renders one input per row (type inferred from the key) plus a
 * submit button. Put a heading and any legal copy as normal content around it.
 */
export default function decorate(block) {
  const form = document.createElement('form');
  form.className = 'sign-up-form-fields';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = (cells[0]?.textContent || '').trim().toLowerCase();
    if (!key) return;
    const placeholder = (cells[1]?.textContent || '').trim();
    const input = document.createElement('input');
    input.type = key.includes('email') ? 'email' : 'text';
    input.name = key;
    input.placeholder = placeholder || key;
    input.setAttribute('aria-label', placeholder || key);
    form.append(input);
  });

  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = 'Get Updates';
  form.append(button);

  // Concept stub — a real endpoint can be wired here later.
  form.addEventListener('submit', (e) => e.preventDefault());

  block.replaceChildren(form);
}
