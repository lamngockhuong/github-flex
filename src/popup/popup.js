import { getSettings, saveSetting } from "../shared/storage.js";

const SETTING_KEYS = [
  "wideLayout",
  "tableExpand",
  "imageLightbox",
  "gifPicker",
  "sidebarToggle",
];

/** Apply i18n translations to elements with data-i18n attribute */
function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const message = chrome.i18n.getMessage(key);
    if (message) el.textContent = message;
  });
}

async function init() {
  applyI18n();
  const settings = await getSettings();

  for (const key of SETTING_KEYS) {
    const checkbox = document.getElementById(key);
    if (!checkbox) continue;

    checkbox.checked = settings[key];
    checkbox.addEventListener("change", async (e) => {
      await saveSetting(key, e.target.checked);
    });
  }

  // Set version from manifest
  const version = chrome.runtime.getManifest().version;
  const versionEl = document.getElementById("app-version");
  if (versionEl) {
    versionEl.textContent = `v${version}`;
  }
}

init();
