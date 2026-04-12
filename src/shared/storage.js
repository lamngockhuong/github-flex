import browser from "webextension-polyfill";
import { SETTINGS_DEFAULTS, STORAGE_KEYS } from "./constants.js";

// Settings cache to avoid repeated storage reads
let settingsCache = null;

// Invalidate cache when settings change in another context (e.g., popup)
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes[STORAGE_KEYS.SETTINGS]) {
    settingsCache = null;
  }
});

// Get settings with defaults merged (cached, invalidated on change)
export async function getSettings() {
  if (settingsCache) return settingsCache;
  const result = await browser.storage.sync.get(STORAGE_KEYS.SETTINGS);
  settingsCache = { ...SETTINGS_DEFAULTS, ...result[STORAGE_KEYS.SETTINGS] };
  return settingsCache;
}

// Save settings to sync storage
export async function saveSettings(settings) {
  settingsCache = null;
  await browser.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: settings });
}

// Save single setting
export async function saveSetting(key, value) {
  const settings = await getSettings();
  settings[key] = value;
  await saveSettings(settings);
}
