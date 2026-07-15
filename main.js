import { createRenderer } from './renderer.js';
import { DEFAULT_STATE, loadState, saveState } from './state.js';
import { applyTranslations, renderControls, updateHud } from './ui.js';
import { renderSocialPanel } from './social.js';
import { initTranslations, t } from './i18n.js';

let state = { ...DEFAULT_STATE };
let renderer;
let saveTimer;

function applyTheme(theme) {
  const selected = theme === 'white' ? 'white' : 'black';
  document.documentElement.dataset.theme = selected;
  const toggle = document.querySelector('[data-action="theme"]');
  if (toggle) {
    toggle.setAttribute('aria-pressed', String(selected === 'white'));
    toggle.setAttribute('aria-label', t(selected === 'white' ? 'theme.switchToBlack' : 'theme.switchToWhite'));
    const label = toggle.querySelector('[data-theme-text]');
    if (label) label.textContent = t(selected === 'white' ? 'theme.black' : 'theme.white');
  }
}

function setState(key, value) {
  state = { ...state, [key]: value };
  if (key === 'theme') applyTheme(state.theme);
  updateHud('ready', state.paused);
  const entropyHud = document.getElementById('entropyHud');
  if (entropyHud) entropyHud.textContent = `${(state.entropy * 100).toFixed(1)}%`;
  if (renderer && key === 'paused') renderer.setPaused(value);
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => saveState(state), 350);
}

function bindActions() {
  document.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
    state = { ...DEFAULT_STATE };
    renderControls(document.getElementById('controls'), state, setState);
    applyTheme(state.theme);
    updateHud('ready', state.paused);
    document.getElementById('entropyHud').textContent = '10.6%';
    renderer?.setPaused(false);
    saveState(state);
  });
  document.querySelector('[data-action="pause"]')?.addEventListener('click', () => setState('paused', !state.paused));
  document.querySelector('[data-action="theme"]')?.addEventListener('click', () => {
    setState('theme', state.theme === 'white' ? 'black' : 'white');
  });
}

async function boot() {
  await initTranslations();
  applyTranslations();
  renderSocialPanel(document.getElementById('socialPanel'));
  state = await loadState();
  applyTheme(state.theme);
  renderControls(document.getElementById('controls'), state, setState);
  const canvas = document.getElementById('meshCanvas');
  renderer = createRenderer(canvas, () => state, (status) => {
    updateHud(status, state.paused);
    if (status === 'unsupported' || status === 'error') document.querySelector('.unsupported').hidden = false;
  });
  renderer.start();
  bindActions();
  updateHud('ready', state.paused);
  document.title = t('app.title');
}

document.addEventListener('DOMContentLoaded', boot);
