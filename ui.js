import { t } from './i18n.js';

export function renderControls(root, state, onChange) {
  root.innerHTML = [
    slider('entropy', 'controls.entropy', 'controls.entropyValue', state.entropy, 0, 0.3, 0.001, `${(state.entropy * 100).toFixed(1)}%`),
    slider('phonon', 'controls.phonon', 'controls.phononValue', state.phonon, 0, 1, 0.005, state.phonon.toFixed(3)),
    slider('syntropic', 'controls.syntropic', 'controls.syntropicValue', state.syntropic, 0, 2, 0.01, `${(state.syntropic * 100).toFixed(1)}%`),
    slider('torsion', 'controls.torsion', 'controls.torsionValue', state.torsion, 0, 2, 0.01, `${(state.torsion * 100).toFixed(1)}%`),
  ].join('');
  root.querySelectorAll('input[type="range"]').forEach((input) => input.addEventListener('input', (event) => {
    const target = event.target;
    const key = target.dataset.key;
    onChange(key, Number(target.value));
    const output = root.querySelector(`[data-output="${key}"]`);
    if (output) output.textContent = formatValue(key, Number(target.value));
  }));
}

function slider(key, labelKey, valueKey, value, min, max, step, display) {
  return `<label class="control-card" for="${key}">
    <span class="control-top"><span class="control-label">${t(labelKey)}</span><output data-output="${key}">${display}</output></span>
    <input id="${key}" data-key="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${t(labelKey)}">
    <span class="control-scale"><span>${min}</span><span>${max}</span></span>
  </label>`;
}

function formatValue(key, value) {
  if (key === 'entropy') return `${(value * 100).toFixed(1)}%`;
  if (key === 'phonon') return value.toFixed(3);
  return `${(value * 100).toFixed(1)}%`;
}

export function updateHud(status, paused) {
  const statusNode = document.querySelector('[data-status]');
  const pauseButton = document.querySelector('[data-action="pause"]');
  if (statusNode) statusNode.textContent = t(status === 'ready' ? (paused ? 'status.paused' : 'status.locked') : `status.${status}`);
  if (pauseButton) {
    pauseButton.textContent = t(paused ? 'actions.resume' : 'actions.pause');
    pauseButton.setAttribute('aria-label', t(paused ? 'actions.resume' : 'actions.pause'));
    pauseButton.setAttribute('aria-pressed', String(paused));
  }
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
    node.setAttribute('aria-label', t(node.dataset.i18nAriaLabel));
  });
}
