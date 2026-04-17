// Default settings for GitHub Flex extension
export const SETTINGS_DEFAULTS = {
  wideLayout: true,
  tableExpand: true,
  imageLightbox: true,
  gifPicker: true,
  sidebarToggle: true,
  editHistory: false,
};

// Chrome storage keys
export const STORAGE_KEYS = {
  SETTINGS: "settings",
};

// Feature style IDs (for dynamically injected CSS)
// Note: wide-layout CSS is injected via manifest, not here
export const STYLE_IDS = {
  TABLE_EXPAND: "ghflex-table-expand-styles",
  GIF_PICKER: "ghflex-gif-picker-styles",
  SIDEBAR_TOGGLE: "ghflex-sidebar-toggle-styles",
  EDIT_HISTORY: "ghflex-edit-history-styles",
};

// Sidebar toggle storage key (localStorage for per-page state)
export const SIDEBAR_TOGGLE_STORAGE_KEY = "ghflex-sidebar-hidden";

// Table expand storage prefix
export const TABLE_EXPAND_STORAGE_PREFIX = "ghflex-table-expand";

// GIF picker API
export const GIF_API_URL = "https://github-gifs.aldilaff6545.workers.dev";
export const GIF_DEBOUNCE_DELAY = 300;

// Service worker message actions
export const MESSAGE_ACTIONS = {
  FETCH_IMAGE: "fetchImage",
  FETCH_GIFS: "fetchGifs",
};

// GitHub toolbar selector (shared between toolbar detection strategies)
export const TOOLBAR_SELECTOR = '.toolbar, [role="toolbar"], markdown-toolbar';

// External links for context menu and popup
export const EXT_LINKS = {
  website: "https://github-flex.khuong.dev",
  github: "https://github.com/lamngockhuong/github-flex",
  issues: "https://github.com/lamngockhuong/github-flex/issues",
  changelog:
    "https://github.com/lamngockhuong/github-flex/blob/main/CHANGELOG.md",
};

// Context menu items (single source of truth)
export const CONTEXT_MENU_ITEMS = [
  { key: "website", title: "Website" },
  { key: "github", title: "GitHub" },
  { key: "issues", title: "Report Issue" },
  { key: "changelog", title: "Changelog" },
];
