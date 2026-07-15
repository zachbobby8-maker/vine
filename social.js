import { t } from './i18n.js';

export function renderSocialPanel(root) {
  root.innerHTML = `
    <div class="section-heading"><span class="eyebrow">${t('social.eyebrow')}</span><span class="signal-dot" aria-hidden="true"></span></div>
    <div class="social-grid">
      ${link('🪐', 'social.portfolio', 'superme.ai/bzachs', 'https://superme.ai/bzachs')}
      ${link('𝕏', 'social.x', '@topologyflux', 'https://x.com/topologyflux')}
      ${link('✎', 'social.medium', '@zachbobby8', 'https://medium.com/@zachbobby8')}
    </div>
    <a class="essay-card" href="https://medium.com/@zachbobby8/the-holographic-chiasm-658aa2e2305e" target="_blank" rel="noopener noreferrer">
      <span class="essay-kicker">★ ${t('social.featured')}</span>
      <strong>${t('social.essayTitle')}</strong>
      <span class="essay-arrow" aria-hidden="true">↗</span>
    </a>`;
}

function link(icon, labelKey, handle, href) {
  return `<a class="social-link" href="${href}" target="_blank" rel="noopener noreferrer"><span><b aria-hidden="true">${icon}</b><span>${t(labelKey)}</span></span><small>${handle}</small></a>`;
}