let fallbackCatalog = {};

export async function initTranslations() {
  if (window.miniappI18n) return;
  try {
    const response = await fetch('./locales/en.json', { cache: 'no-store' });
    if (response.ok) fallbackCatalog = await response.json();
  } catch {
    // The authored HTML remains readable if the catalog cannot be loaded.
  }
}

export function t(key, values = {}) {
  const value = window.miniappI18n?.t(key, values) ?? getValue(fallbackCatalog, key) ?? key;
  return Object.entries(values).reduce(
    (text, [name, replacement]) => text.replaceAll(`{${name}}`, String(replacement)),
    value,
  );
}

function getValue(source, key) {
  return key.split('.').reduce((current, part) => current?.[part], source);
}
