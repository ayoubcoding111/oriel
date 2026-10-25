// Dev-only harness: every pose, finish and dial, plus sliders for the layer states. /src/three/lab.html
import '@fontsource/instrument-serif/400.css';
import '@fontsource-variable/hanken-grotesk/wght.css';
import '@fontsource/dm-mono/400.css';
import { createStage } from './stage.js';
import { POSES } from './poses.js';

const params = new URLSearchParams(location.search);
const panel = document.querySelector('[data-panel]');
const stage = createStage({ canvas: document.getElementById('stage'), tier: params.get('tier') ?? 'high', time: params.has('fixed') ? 'fixed' : 'live' });
window.stage = stage;

const button = (label, onClick) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.addEventListener('click', onClick);
  panel.append(b);
  return b;
};

const poseButtons = Object.keys(POSES).map((name) =>
  button(name, () => {
    stage.setPose(POSES[name], { immediate: params.has('instant') });
    poseButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.textContent === name)));
    history.replaceState(null, '', `?${new URLSearchParams({ ...Object.fromEntries(params), pose: name })}`);
  }),
);
for (const finish of ['steel', 'rosegold', 'ceramic']) button(finish, () => stage.setConfig({ finish }));
for (const dial of ['midnight', 'ivory', 'malachite']) button(dial, () => stage.setConfig({ dial }));

for (const key of ['explode', 'movement', 'strap', 'size']) {
  const label = document.createElement('label');
  label.textContent = key;
  const input = document.createElement('input');
  input.type = 'range';
  input.min = 0;
  input.max = key === 'size' ? 2.5 : 1;
  input.step = 0.01;
  input.addEventListener('input', () => stage.setPose({ [key]: Number(input.value) }));
  label.append(input);
  panel.append(label);
}

await stage.ready;
const initial = params.get('pose') ?? 'hero';
stage.setPose(POSES[initial], { immediate: true });
if (params.get('finish') || params.get('dial')) stage.setConfig({ finish: params.get('finish') ?? undefined, dial: params.get('dial') ?? undefined }, { immediate: true });
if (params.has('hide')) panel.hidden = true;
document.documentElement.dataset.ready = 'true';
