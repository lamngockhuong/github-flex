import { getSettings } from "../shared/storage.js";
import { gifPicker } from "./features/gif-picker.js";
import { imageLightbox } from "./features/image-lightbox.js";
import { sidebarToggle } from "./features/sidebar-toggle.js";
import { tableExpand } from "./features/table-expand.js";
import { wideLayout } from "./features/wide-layout.js";

const features = {
  wideLayout,
  tableExpand,
  imageLightbox,
  gifPicker,
  sidebarToggle,
};

// URL patterns where certain features should be excluded
const PROJECT_BOARD_PATTERN = /\/(orgs|users)\/[^/]+\/projects\//;
const FEATURE_EXCLUSIONS = {
  wideLayout: [PROJECT_BOARD_PATTERN],
  sidebarToggle: [PROJECT_BOARD_PATTERN],
};

function shouldEnableFeature(key) {
  const patterns = FEATURE_EXCLUSIONS[key];
  if (!patterns) return true;
  return !patterns.some((p) => p.test(location.pathname));
}

async function init() {
  try {
    const settings = await getSettings();

    // Initialize each enabled feature
    for (const [key, feature] of Object.entries(features)) {
      if (settings[key] && feature?.enable && shouldEnableFeature(key)) {
        feature.enable();
      }
    }

    // Listen for setting changes from popup
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "sync") return;

      const settingsChange = changes.settings?.newValue;
      if (!settingsChange) return;

      for (const [key, feature] of Object.entries(features)) {
        if (!feature) continue;
        const enabled = settingsChange[key];
        if (enabled !== undefined) {
          enabled && shouldEnableFeature(key)
            ? feature.enable()
            : feature.disable();
        }
      }
    });

    console.log("[GitHub Flex] Initialized");
  } catch (error) {
    console.error("[GitHub Flex] Failed to initialize:", error);
  }
}

// Run when DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
