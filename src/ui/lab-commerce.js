// Dev-only harness for the commerce components (open /src/ui/lab-commerce.html on the dev server).
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/hanken-grotesk/wght.css';
import '@fontsource/dm-mono/400.css';
import '../styles/tokens.css';
import '../styles/base.css';
// The partials directly: components.css' relative @imports currently fail in the dev server (reported).
import '../styles/ui-chrome.css';
import '../styles/ui-commerce.css';

import { gsap, initSmoothScroll } from '../core/motion.js';
import { FINISHES, formatPrice } from '../data/catalog.js';
import { createPreloader } from './preloader.js';
import { initPageTransitions } from './transition.js';
import { initCart } from './cart.js';
import { initHoldButtons } from './hold.js';
import { createOdometer } from './odometer.js';
import { createConfigurator } from './configurator.js';
import { toast } from './toast.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const root = document.documentElement;
const page = new URLSearchParams(location.search).get('page') === '2' ? 2 : 1;

const smooth = initSmoothScroll();
const cart = initCart();
const transitions = initPageTransitions();
const destroyHold = initHoldButtons();
const preloaderTemplate = $('[data-preloader]')?.cloneNode(true);

window.__lab = { gsap, cart, transitions, destroyHold, smooth };

/* Page 01 / 02 for the transition test */
const other = $('[data-lab-other]');
$('[data-lab-page]').textContent = `Lab · 0${page}`;
if (page === 2) {
  other.href = './lab-commerce.html';
  other.textContent = 'Back to lab page 01';
  $('h1').innerHTML = 'Second <em>page.</em>';
}

/* Preloader with fake progress that mimics the stage loading in uneven steps */
async function runPreloader({ short }) {
  if (!$('[data-preloader]') && preloaderTemplate) document.body.prepend(preloaderTemplate.cloneNode(true));
  const preloader = createPreloader({ short });
  smooth.lenis?.stop();
  const steps = short ? [0.4, 0.9] : [0.12, 0.3, 0.34, 0.62, 0.7, 0.88, 0.95];
  for (const p of steps) {
    await new Promise((r) => setTimeout(r, 120 + Math.random() * 260));
    preloader.setProgress(p);
  }
  preloader.setProgress(1);
  await preloader.finish();
  smooth.lenis?.start();
  console.info('[lab] preloader.finish() resolved (iris starting)');
}

$$('[data-lab-preload]').forEach((button) =>
  button.addEventListener('click', () => runPreloader({ short: button.dataset.labPreload === 'short' })),
);

/* Bag */
const bagLog = $('[data-lab-bag-log]');
const logBag = (items) => {
  bagLog.textContent = `${items.length} line(s), ${cart.count()} piece(s), subtotal ${formatPrice(cart.subtotal())}: ${items
    .map((i) => `${i.id}×${i.qty}`)
    .join(', ')}`;
};
cart.subscribe(logBag);
logBag(cart.items());

$$('[data-lab-add]').forEach((button) =>
  button.addEventListener('click', () => {
    const [finish, dial] = button.dataset.labAdd.split(',');
    const item = cart.add({ finish, dial });
    toast(`Added to your bag (qty ${item?.qty}).`, { tone: 'success' });
  }),
);
$$('[data-lab-reserve]').forEach((button) =>
  button.addEventListener('click', () => {
    const [finish, dial] = button.dataset.labReserve.split(',');
    cart.add({ finish, dial, reserved: true, number: 147 });
    cart.open();
  }),
);
$$('[data-bag-open]').forEach((button) => button.addEventListener('click', () => cart.open()));
$('[data-lab-clear]').addEventListener('click', () => cart.items().forEach((item) => cart.remove(item.id)));

/* Hold */
const holdLog = $('[data-lab-hold-log]');
document.addEventListener('hold:complete', (event) => {
  holdLog.textContent = `hold:complete from ${event.target.className} at ${new Date().toLocaleTimeString()}`;
  cart.add({ finish: 'ceramic', dial: 'malachite', reserved: true, number: 147 });
});

/* Odometers */
const odometers = {
  big: createOdometer($('[data-lab-odo="big"]'), { value: 212, from: 0 }),
  price: createOdometer($('[data-lab-odo="price"]'), { value: 8400, format: formatPrice }),
  mono: createOdometer($('[data-lab-odo="mono"]'), {
    value: 28800,
    format: (v) => `${new Intl.NumberFormat('en-IE').format(v)} vph`,
  }),
};
window.__lab.odometers = odometers;
setTimeout(() => odometers.big.set(212), 600);

let priceIndex = 0;
$$('[data-lab-odo-set]').forEach((button) =>
  button.addEventListener('click', () => {
    const raw = button.dataset.labOdoSet;
    const value = raw === 'random' ? Math.floor(Math.random() * 30000) : Number(raw);
    odometers.big.set(value);
    odometers.mono.set(value);
    priceIndex = (priceIndex + 1) % FINISHES.length;
    odometers.price.set(raw === 'random' ? value * 10 : FINISHES[priceIndex].price);
  }),
);

/* Configurators: the wide panel, and a clone in a narrow panel to show the stacked layout */
const configLog = $('[data-lab-config-log]');
const form = $('[data-configurator]');
const narrowForm = form.cloneNode(true);
narrowForm.removeAttribute('aria-describedby');
narrowForm.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
narrowForm.setAttribute('aria-label', 'Configure (narrow layout)');
$('[data-lab-narrow-host]').append(narrowForm);

const onSubmit = (configurator) => (event) => {
  event.preventDefault();
  cart.add({ ...configurator.get() });
  cart.open();
};
const wide = createConfigurator(form, {
  onChange: (config) => {
    configLog.textContent = `onChange ${JSON.stringify(config)}`;
  },
});
const narrow = createConfigurator(narrowForm, {
  initial: { finish: 'rosegold', dial: 'ivory' },
  onChange: (config) => {
    configLog.textContent = `narrow onChange ${JSON.stringify(config)}`;
  },
});
form.addEventListener('submit', onSubmit(wide));
narrowForm.addEventListener('submit', onSubmit(narrow));
window.__lab.configurators = { wide, narrow };

$$('[data-lab-config-set]').forEach((button) =>
  button.addEventListener('click', () => {
    const [finish, dial, silent] = button.dataset.labConfigSet.split(',');
    wide.set({ finish, dial }, { silent: silent === 'silent' });
    if (silent) configLog.textContent = `set silently to ${finish} · ${dial} (no onChange)`;
  }),
);

/* Boot: reveal the curtain when arriving from the other lab page, else run the preloader. */
if (root.classList.contains('is-arriving')) {
  $('[data-preloader]')?.remove();
  transitions.reveal().then(() => console.info('[lab] reveal() resolved'));
} else {
  runPreloader({ short: root.classList.contains('is-returning') });
}
try {
  sessionStorage.setItem('oriel:visited', '1');
} catch {}
