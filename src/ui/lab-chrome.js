// Dev-only harness for the UI chrome components (open /src/ui/lab-chrome.html on the dev server).
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/hanken-grotesk/wght.css';
import '@fontsource/dm-mono/400.css';
import '../styles/tokens.css';
import '../styles/base.css';
// The partials directly: components.css is just their two @imports.
import '../styles/ui-chrome.css';
import '../styles/ui-commerce.css';

import { initSmoothScroll } from '../core/motion.js';
import { initButtons, setButtonLabel } from './buttons.js';
import { initCursor } from './cursor.js';
import { initNav } from './nav.js';
import { initChapterDial } from './chapter-dial.js';
import { initFooterReveal } from './footer.js';
import { initNewsletter } from './newsletter.js';
import { toast } from './toast.js';

/** Enough of the cart contract for the nav: count, open, subscribe. */
function createMockCart() {
  let count = 0;
  const subs = new Set();
  const emit = () => subs.forEach((cb) => cb());
  return {
    add() {
      count += 1;
      emit();
    },
    remove() {
      count = Math.max(0, count - 1);
      emit();
    },
    count: () => count,
    open: () => toast(count ? `The bag would open with ${count} ${count === 1 ? 'piece' : 'pieces'}.` : 'The bag would open, empty.'),
    subscribe(cb) {
      subs.add(cb);
      return () => subs.delete(cb);
    },
  };
}

const cart = createMockCart();
const smooth = initSmoothScroll();
const destroyers = [
  smooth.destroy,
  initButtons(),
  initCursor(),
  initNav({ cart }),
  initChapterDial(),
  initFooterReveal(),
  initNewsletter(),
];

const TOASTS = {
  neutral: 'Édition Minuit added to your bag.',
  success: 'Reserved. Piece 041 of 300 is held for you.',
  error: 'That piece was just reserved. Try another dial.',
};

document.addEventListener('click', (e) => {
  const el = e.target instanceof Element ? e.target : null;
  const trigger = el?.closest('[data-lab-toast]');
  if (trigger) toast(TOASTS[trigger.dataset.labToast], { tone: trigger.dataset.labToast });
  if (el?.closest('[data-lab-add]')) cart.add();
  if (el?.closest('[data-lab-remove]')) cart.remove();

  const swap = el?.closest('[data-lab-swap]');
  if (swap) setButtonLabel(swap, swap.textContent.includes('Swapped') ? 'Swap my label' : 'Swapped');

  const modal = document.getElementById('lab-modal');
  if (el?.closest('[data-lab-modal]')) {
    modal.showModal();
    setTimeout(() => toast('Shown above the open dialog.', { tone: 'success' }), 300);
  }
  if (el?.closest('[data-lab-modal-toast]')) toast('Still on top of the dialog.');
  if (el?.closest('[data-lab-modal-close]')) modal.close();
});

// Exposed for console checks during development.
window.__lab = { cart, toast, destroy: () => destroyers.forEach((fn) => fn()) };
