// Early injection script - runs at document_start to prevent FOUC
// Note: STORAGE_KEY duplicated from constants.js (cannot import in isolated content script)

const STORAGE_KEY = "settings";
const DISABLED_CLASS = "ghflex-wide-layout-disabled";

// Default: wideLayout is ON (matches SETTINGS_DEFAULTS.wideLayout = true)
// Only add disabled class if user explicitly turned it off
chrome.storage.sync.get(STORAGE_KEY, (result) => {
  if (chrome.runtime.lastError) return;
  const settings = result[STORAGE_KEY];
  if (settings?.wideLayout === false) {
    document.documentElement.classList.add(DISABLED_CLASS);
  }
});
