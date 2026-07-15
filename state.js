export const DEFAULT_STATE = {
  entropy: 0.106,
  phonon: 0.42,
  syntropic: 0.65,
  torsion: 0.75,
  paused: false,
  theme: 'black',
};

const STORAGE_KEY = 'braid-mesh-settings';

export async function loadState(storage = window.miniappsAI?.storage) {
  if (!storage) return { ...DEFAULT_STATE };
  try {
    const raw = await storage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const saved = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...saved,
      entropy: clamp(Number(saved.entropy), 0, 0.3, DEFAULT_STATE.entropy),
      phonon: clamp(Number(saved.phonon), 0, 1, DEFAULT_STATE.phonon),
      syntropic: clamp(Number(saved.syntropic), 0, 2, DEFAULT_STATE.syntropic),
      torsion: clamp(Number(saved.torsion), 0, 2, DEFAULT_STATE.torsion),
      paused: Boolean(saved.paused),
      theme: saved.theme === 'white' ? 'white' : 'black',
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export async function saveState(state, storage = window.miniappsAI?.storage) {
  if (!storage) return;
  try {
    await storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Settings remain usable for the current session if persistence is unavailable.
  }
}

function clamp(value, min, max, fallback) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}