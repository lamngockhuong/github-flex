// Default settings for GitHub Flex extension
export const SETTINGS_DEFAULTS = {
  wideLayout: true,
  tableExpand: true,
  imageLightbox: true,
  gifPicker: true,
  zenMode: true,
};

// Chrome storage keys
export const STORAGE_KEYS = {
  SETTINGS: "settings",
};

// Feature style IDs
export const STYLE_IDS = {
  WIDE_LAYOUT: "ghflex-wide-layout-styles",
  TABLE_EXPAND: "ghflex-table-expand-styles",
  GIF_PICKER: "ghflex-gif-picker-styles",
  ZEN_MODE: "ghflex-zen-mode-styles",
};

// Zen mode storage key (localStorage for per-page state)
export const ZEN_MODE_STORAGE_KEY = "ghflex-zen-hidden";

// Table expand storage prefix
export const TABLE_EXPAND_STORAGE_PREFIX = "ghflex-table-expand";

// GIF picker API
export const GIF_API_URL = "https://github-gifs.aldilaff6545.workers.dev";
export const GIF_DEBOUNCE_DELAY = 300;
