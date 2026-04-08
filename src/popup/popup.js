import { getSettings, saveSetting } from "../shared/storage.js";

const SETTING_KEYS = [
  "wideLayout",
  "tableExpand",
  "imageLightbox",
  "gifPicker",
  "sidebarToggle",
];

async function init() {
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
