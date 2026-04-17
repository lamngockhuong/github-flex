# Codebase Summary

## Overview

GitHub Flex is a cross-browser Manifest V3 extension (Chrome & Firefox) enhancing GitHub's interface with 6 productivity features. Built with vanilla JavaScript, one runtime dependency (`diff` for word-level diffing), ~3000 LOC total.

## Project Statistics

- **Total Files:** ~20 source files
- **Total LOC:** ~3000 lines
- **Languages:** JavaScript (ES Modules), CSS, HTML
- **Bundle Output:** 3 entry points (early-inject, content script, popup)
- **External Services:** 1 (GIF API proxy)
- **Runtime Dependencies:** 1 (`diff` library for word-level diff computation)

## Directory Structure

```
github-flex/
├── src/
│   ├── background/
│   │   └── service-worker.js          # Extension lifecycle, context menu, image proxy (110 LOC)
│   ├── content/
│   │   ├── main.js                    # Feature initialization (70 LOC)
│   │   ├── early-inject.js            # FOUC prevention (document_start) (17 LOC)
│   │   ├── features/
│   │   │   ├── wide-layout.js         # Full viewport width (20 LOC)
│   │   │   ├── table-expand.js        # Expandable tables (227 LOC)
│   │   │   ├── image-lightbox.js      # Image zoom overlay (318 LOC)
│   │   │   ├── gif-picker.js          # GIF search modal (656 LOC)
│   │   │   ├── sidebar-toggle.js      # Sidebar toggle with Alt+M (335 LOC)
│   │   │   ├── edit-history.js        # Edit history main controller (108 LOC)
│   │   │   ├── edit-history-ui.js     # Enhanced diff overlay UI (349 LOC)
│   │   │   ├── edit-history-diff.js   # Word-level diff computation (42 LOC)
│   │   │   ├── edit-history-parser.js # GitHub dialog DOM parser (93 LOC)
│   │   │   └── edit-history-markdown.js # Safe markdown-to-DOM renderer (298 LOC)
│   │   └── styles/
│   │       ├── wide-layout.css
│   │       ├── table-expand.css
│   │       ├── image-lightbox.css
│   │       ├── gif-picker.css
│   │       ├── sidebar-toggle.css
│   │       └── edit-history.css       # Enhanced diff viewer styles (435 LOC)
│   ├── popup/
│   │   ├── popup.html                 # Settings UI
│   │   ├── popup.css                  # Popup styles
│   │   └── popup.js                   # Toggle handlers (43 LOC)
│   └── shared/
│       ├── constants.js               # Settings defaults, keys, external links (57 LOC)
│       ├── storage.js                 # chrome.storage wrapper (33 LOC)
│       ├── dom.js                     # Safe DOM utilities for Firefox compliance (18 LOC)
│       └── icons.js                   # SVG icon strings (21 LOC)
├── scripts/
│   └── build.js                       # esbuild bundler (93 LOC)
├── _locales/
│   ├── en/messages.json               # i18n strings (English - default)
│   ├── ja/messages.json               # i18n strings (Japanese)
│   └── vi/messages.json               # i18n strings (Vietnamese)
├── icons/                             # Extension icons (16/48/128px)
├── manifest.json                      # Chrome extension config
├── website/                           # Landing page (Astro)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.astro           # Navigation with i18n
│   │   │   ├── Footer.astro           # CTA + links
│   │   │   ├── LandingPage.astro      # Main sections
│   │   │   ├── ThemeToggle.astro      # Dark/light mode
│   │   │   ├── LanguageSwitcher.astro # EN/JA/VI switcher
│   │   │   └── BackToTop.astro        # Scroll button
│   │   ├── i18n/
│   │   │   ├── index.ts               # i18n exports
│   │   │   ├── translations.ts        # EN/JA/VI strings
│   │   │   └── utils.ts               # useTranslations helper
│   │   ├── layouts/
│   │   │   └── BaseLayout.astro       # HTML wrapper
│   │   ├── pages/
│   │   │   ├── index.astro            # English (default)
│   │   │   ├── ja/index.astro         # Japanese
│   │   │   └── vi/index.astro         # Vietnamese
│   │   ├── styles/
│   │   │   └── global.css             # Tailwind + theme vars
│   │   └── constants.ts               # Store URLs, GitHub URL
│   ├── public/                        # Static assets (logos, screenshots)
│   ├── astro.config.mjs               # Astro + Tailwind config
│   └── package.json                   # Website dependencies
├── package.json
├── biome.json                         # Linter config
└── vitest.config.js                   # Test config
```

## Core Components

### Entry Points

#### 1. Early Inject Script (`src/content/early-inject.js`)

- **When:** Runs at `document_start` (before DOM renders)
- **What:** Prevents FOUC by applying wide-layout CSS state immediately
- **Flow:**

  ```
  Check chrome.storage → if wideLayout=false, add disabled class → CSS respects class
  ```

#### 2. Content Script (`src/content/main.js`)

- **When:** Runs at `document_idle` on github.com/_and gist.github.com/_
- **What:** Loads settings from chrome.storage, enables features, listens for setting changes
- **Flow:**

  ```
  init() → getSettings() → enable each feature → listen for chrome.storage changes
  ```

#### 3. Popup (`src/popup/popup.js`)

- **When:** User clicks extension icon
- **What:** Loads current settings, binds checkbox toggles (6 features), saves to chrome.storage.sync
- **Flow:**

  ```
  DOM ready → load settings → render checkboxes → listen for changes → save to storage
  ```

#### 4. Service Worker (`src/background/service-worker.js`)

- **When:** Extension install/update AND on message from content script
- **Install/Update:** Logs extension lifecycle events, creates context menus
- **Context Menu:** Adds quick links (Website, GitHub, Report Issue, Changelog) to extension icon right-click menu
- **GIF API Proxy:** Intercepts FETCH_GIFS messages, proxies requests to Cloudflare Worker (Firefox CSP bypass)
- **Image Proxy:** Intercepts FETCH_IMAGE messages, fetches GIF images, encodes as base64
  - Validates URLs (only giphy.com/giphycdn.com allowed)
  - Returns base64-encoded image data to bypass GitHub CSP
  - Handles fetch errors gracefully

### Feature Architecture

All features follow this interface:

```javascript
export const featureName = {
  enabled: false, // Current state
  observer: null, // Optional MutationObserver reference

  enable() {
    // 1. Inject CSS via chrome.runtime.getURL()
    // 2. Add event listeners
    // 3. Setup MutationObserver for SPA navigation
    // 4. Process existing DOM elements
    // 5. Set enabled = true
  },

  disable() {
    // 1. Remove CSS
    // 2. Remove event listeners
    // 3. Disconnect observer
    // 4. Clean up DOM modifications
    // 5. Set enabled = false
  },
};
```

### Feature Implementations

#### Wide Layout (`wide-layout.js` + `early-inject.js`)

- **Pattern:** CSS injected via manifest at document_start (FOUC prevention)
- **Mechanism:** Opt-out selector `html:not(.ghflex-wide-layout-disabled)`
- **Style:** Overrides GitHub's `.container-xl` max-width
- **State:** Class toggle only (no internal state)

#### Table Expand (`table-expand.js`)

- **Pattern:** Wrapper injection + button controls
- **Mechanism:**
  1. Wraps each `.markdown-body table` in `.ghflex-table-wrapper`
  2. Adds expand/fullscreen buttons
  3. Stores state in localStorage with key `pathname:table-{index}`
  4. MutationObserver detects new tables on SPA navigation
- **State:** `{ expandedState: {}, fullscreenTable: null }`
- **Events:** Click (toggle), Esc (exit fullscreen)

#### Image Lightbox (`image-lightbox.js`)

- **Pattern:** Overlay creation + event delegation
- **Mechanism:**
  1. Click handler on `.markdown-body img` creates fullscreen overlay
  2. Wheel zoom (scale transform, 0.1x-10x range)
  3. Drag pan when zoomed (translate transform)
  4. Click overlay to close
- **State:** `{ currentImage: null, scale: 1, position: {x, y}, isDragging: false }`
- **Events:** Click (open/close), wheel (zoom), mousedown/move/up (pan)

#### GIF Picker (`gif-picker.js`)

- **Pattern:** Modal dialog + Service Worker proxy + API integration
- **Mechanism:**
  1. Detects comment toolbars (form, React containers, DOM walk)
  2. Button click opens modal with search input
  3. Debounced search (300ms) to Cloudflare Worker API
  4. Service worker proxies GIF images via base64 (CSP bypass)
  5. Click GIF inserts markdown at cursor: `![alt](url)`
  6. Vietnamese normalization: Regex-based diacritic mapping
- **State:** `{ currentTextarea: null, renderGeneration: 0, blobUrls: Set }`
- **Security:** Service worker URL validation, content script validation, markdown escaping
- **API:** `GET https://github-gifs.aldilaff6545.workers.dev/?q={query}`
- **Proxy:** Service worker fetches images, encodes base64, content script creates blob URLs

#### Sidebar Toggle (`sidebar-toggle.js`)

- **Pattern:** Class toggle + keyboard shortcut
- **Mechanism:**
  1. Adds toggle button to repository navigation
  2. Alt+M shortcut toggles `.ghflex-sidebar-hidden` class
  3. State stored in localStorage: `ghflex-zen-hidden` (true/false)
  4. CSS hides `.Layout-sidebar` when class active
- **State:** `{ button: null, boundToggle: null }`
- **Events:** Click (toggle), keydown (Alt+M)

#### Edit History (`edit-history.js` + 4 submodules)

- **Pattern:** MutationObserver + dialog detection + overlay creation
- **Mechanism:**
  1. MutationObserver detects GitHub's edit history dialog opening
  2. Widens native modal to 90vw (max 1400px) for better readability
  3. Injects "Split View" button into dialog header
  4. Parses diff data from GitHub's native DOM (added/removed/changed lines)
  5. Opens enhanced overlay with three view modes: Split, Unified, Preview
  6. Word-level diffing via `diff` library (computeWordDiff)
  7. Preview mode renders markdown with diff highlighting
- **Submodules:**
  - `edit-history-parser.js` (93 LOC): Finds dialog, extracts diff data and metadata (author, avatar, timestamp)
  - `edit-history-ui.js` (349 LOC): Overlay panel with header, toggle group, side-by-side/unified/preview views, synced scrolling, footer stats
  - `edit-history-diff.js` (42 LOC): Word-level diff computation, side-by-side/unified segment builders, stats (+/- word counts)
  - `edit-history-markdown.js` (298 LOC): XSS-safe markdown-to-DOM renderer (headers, lists, tables, code blocks, blockquotes, inline formatting)
- **State:** `{ enabled, observer, pollTimer }`
- **Events:** MutationObserver (dialog detection), click (button, overlay), keydown (Esc to close)
- **Default:** Disabled (opt-in via settings)
- **Security:** No innerHTML with user data; markdown renderer creates DOM elements directly

### Shared Utilities

#### `shared/constants.js`

Centralized configuration:

```javascript
SETTINGS_DEFAULTS = {
  wideLayout: true,
  tableExpand: true,
  imageLightbox: true,
  gifPicker: true,
  sidebarToggle: true,
  editHistory: false,
};

STORAGE_KEYS = { SETTINGS: "settings" };

STYLE_IDS = {
  TABLE_EXPAND: "ghflex-table-expand-styles",
  GIF_PICKER: "ghflex-gif-picker-styles",
  SIDEBAR_TOGGLE: "ghflex-sidebar-toggle-styles",
  EDIT_HISTORY: "ghflex-edit-history-styles",
};

GIF_API_URL = "https://github-gifs.aldilaff6545.workers.dev";
GIF_DEBOUNCE_DELAY = 300;

// Service worker message actions
MESSAGE_ACTIONS = {
  FETCH_IMAGE: "fetchImage",
  FETCH_GIFS: "fetchGifs",
};

// Toolbar detection selector
TOOLBAR_SELECTOR = '.toolbar, [role="toolbar"], markdown-toolbar';

// External links for context menu and popup
EXT_LINKS = {
  website: "https://github-flex.khuong.dev",
  github: "https://github.com/lamngockhuong/github-flex",
  issues: "https://github.com/lamngockhuong/github-flex/issues",
  changelog: "https://github.com/lamngockhuong/github-flex/blob/main/CHANGELOG.md",
};

// Context menu items
CONTEXT_MENU_ITEMS = [
  { key: "website", title: "Website" },
  { key: "github", title: "GitHub" },
  { key: "issues", title: "Report Issue" },
  { key: "changelog", title: "Changelog" },
];
```

#### `shared/storage.js`

chrome.storage.sync wrapper with caching:

```javascript
let cachedSettings = null;

export async function getSettings() {
  if (cachedSettings) return cachedSettings;
  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  cachedSettings = { ...SETTINGS_DEFAULTS, ...result.settings };
  return cachedSettings;
}

export async function saveSettings(settings) {
  cachedSettings = settings;
  await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: settings });
}
```

#### `shared/icons.js`

SVG icon strings exported as constants:

- `lock` - Lock icon (table collapsed state)
- `unlock` - Unlock icon (table expanded state)
- `hideSidebar` / `showSidebar` - Panel icons (sidebar toggle)
- `fullscreen` / `exitFullscreen` - Square frame icons (table fullscreen)
- `close` - X icon (edit history overlay close)

#### `shared/dom.js`

Safe DOM utilities to avoid innerHTML (flagged by Firefox add-on linter):

```javascript
const parser = new DOMParser();
const cache = new Map();

// Parse trusted HTML string and set as element content.
// Caches parsed results for repeated strings (e.g. icon toggles).
// Use only with static/hardcoded HTML - never with external data.
export function setTrustedHTML(element, html) {
  let template = cache.get(html);
  if (!template) {
    template = parser.parseFromString(html, "text/html").body;
    cache.set(html, template);
  }
  element.replaceChildren(...template.cloneNode(true).childNodes);
}
```

### Build System

#### `scripts/build.js`

Custom esbuild wrapper with watch mode:

**Entry Points:**

- `src/content/main.js` → `dist/content/main.js`
- `src/popup/popup.js` → `dist/popup/popup.js`

**Static Files:**

- Copies: popup.html, popup.css, service-worker.js, styles/_, icons/_, \_locales/\*
- Modifies manifest.json to update paths for dist/

**Watch Mode:**

- `--watch` flag enables file watcher
- Debounced rebuild (100ms delay)
- Watches: src/\*\*, scripts/build.js, manifest.json

**Config:**

```javascript
{
  bundle: true,
  format: "iife",
  target: "chrome88",
  minify: true (production) | false (watch)
}
```

## Data Flow

### Settings Persistence

```
User clicks checkbox in popup
  → popup.js saveSettings()
  → chrome.storage.sync.set()
  → chrome.storage.onChanged event
  → content/main.js listener
  → feature.enable() or feature.disable()
```

### Feature State Persistence

**chrome.storage.sync (global settings):**

- Wide Layout: on/off (default: on)
- Table Expand: on/off (default: on)
- Image Lightbox: on/off (default: on)
- GIF Picker: on/off (default: on)
- Sidebar Toggle: on/off (default: on)
- Edit History: on/off (default: off)

**localStorage (per-page state):**

- Table Expand: `ghflex-table-expand-state` → `{ "pathname:table-0": true, ... }`
- Sidebar Toggle: `ghflex-sidebar-hidden` → `true` | `false`

### GitHub SPA Navigation

GitHub is a single-page app. Features use MutationObserver to detect route changes:

```javascript
this.observer = new MutationObserver(() => {
  clearTimeout(this.processTimeout);
  this.processTimeout = setTimeout(() => this.processTables(), 100);
});

this.observer.observe(document.body, {
  childList: true,
  subtree: true,
});
```

Debouncing (100-300ms) prevents excessive processing during DOM mutations.

## API Integration

### GIF Search API

**Endpoint:** `https://github-gifs.aldilaff6545.workers.dev`
**Method:** GET
**Query Param:** `search={query}`
**Response:**

```json
{
  "data": [
    {
      "id": "giphy-id",
      "title": "GIF title",
      "images": {
        "fixed_height": {
          "url": "https://media.giphy.com/media/{id}/200.gif"
        }
      }
    }
  ]
}
```

**Error Handling:**

- Network failure: Show "Failed to load GIFs" message
- Empty results: Show "No GIFs found"
- Invalid response: Console error, silent failure

**Vietnamese Text Normalization:**

```javascript
// Convert unaccented → accented Vietnamese
"tieng viet" → "tiếng việt"
"ha noi" → "hà nội"
```

**URL Validation:**

```javascript
function isValidGifUrl(url) {
  try {
    const parsed = new URL(url);
    return ["giphy.com", "media.giphy.com"].includes(parsed.hostname);
  } catch {
    return false;
  }
}
```

**Markdown Sanitization:**

```javascript
function escapeMarkdown(text) {
  return text.replace(/[[\]()]/g, "\\$&");
}

// Output: ![Escaped Title](validated-url)
```

## Testing Strategy

### Test Framework

- **Runner:** Vitest 4.1.3
- **Coverage:** @vitest/coverage-v8
- **Config:** `vitest.config.js`

### Test Scope

- Storage utilities (getSettings, saveSettings)
- GIF picker URL validation and markdown generation
- Table expand state persistence
- Image lightbox zoom calculations

### Test Commands

```bash
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:coverage     # Generate coverage report
```

### Current Coverage

- Not yet implemented (v1.0 documentation phase)
- Target: >80% coverage for critical paths

## Code Quality

### Linting

- **Tool:** Biome 2.4.10
- **Config:** `biome.json`
- **Rules:** Default Biome rules
- **Commands:**

  ```bash
  pnpm lint          # Check only
  pnpm lint:fix      # Auto-fix
  pnpm format        # Format only
  ```

### Style Conventions

- **Indentation:** 2 spaces
- **Quotes:** Double quotes for strings
- **Semicolons:** Required
- **Line Length:** 100 characters (soft limit)
- **Naming:**
  - Variables/functions: camelCase
  - Constants: UPPER_SNAKE_CASE
  - CSS classes: kebab-case with `ghflex-` prefix

## Chrome Extension Architecture

### Manifest V3 Structure

```
Service Worker (background)
  ↓ (manages extension lifecycle)

Content Scripts (per tab)
  ↓ (injects into github.com pages)

Popup (user settings)
  ↓ (updates chrome.storage)

chrome.storage.sync
  ↓ (persists across devices)

Content Scripts receive onChanged event
  ↓ (toggle features dynamically)
```

### Permissions

```json
{
  "permissions": ["storage"],
  "host_permissions": ["https://github.com/*", "https://gist.github.com/*"]
}
```

**Rationale:**

- `storage`: Required for chrome.storage.sync API
- `host_permissions`: Limit to GitHub domains only

### Content Security Policy

Default Manifest V3 CSP (no overrides needed):

- No eval()
- No inline scripts
- All resources via chrome.runtime.getURL() or bundled

### Web Accessible Resources

```json
{
  "resources": ["src/content/styles/*.css"],
  "matches": ["https://github.com/*", "https://gist.github.com/*"]
}
```

CSS files loaded via:

```javascript
chrome.runtime.getURL("content/styles/feature.css");
```

## Performance Characteristics

### Bundle Sizes

- content/main.js: ~15KB minified
- popup/popup.js: ~3KB minified
- CSS (total): ~8KB uncompressed
- Total extension: ~50KB

### Runtime Performance

- Initialization: <100ms
- Feature toggle: <50ms
- MutationObserver overhead: <5% CPU on active pages
- Memory footprint: ~3-5MB per tab

### Optimizations

- Debounced DOM processing (100-300ms)
- Cached settings (avoid repeated chrome.storage reads)
- Lazy CSS injection (only when feature enabled)
- Event delegation (single listener for multiple elements)

## Development Workflow

### Setup

```bash
git clone https://github.com/lamngockhuong/github-flex.git
cd github-flex
pnpm install
```

### Build

```bash
pnpm build       # Production build
pnpm dev         # Watch mode (auto-rebuild)
```

### Load Extension

1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select `dist/` folder

### Hot Reload

- CSS changes: Reload GitHub page
- JS changes: Reload extension at chrome://extensions/
- Manifest changes: Reload extension

### Debug

- Content script: GitHub page DevTools console
- Popup: Right-click extension icon → Inspect popup
- Service worker: chrome://extensions/ → Inspect service worker

## External Dependencies

### Runtime

- **diff** (word-level diff computation for Edit History feature)

### Development

```json
{
  "@biomejs/biome": "2.4.10", // Linter + formatter
  "@vitest/coverage-v8": "^4.1.3", // Test coverage
  "esbuild": "0.28.0", // Bundler
  "vitest": "^4.1.3" // Test runner
}
```

### System Requirements

- Node.js 18+
- pnpm 10.33.0+
- Chrome 88+ or Firefox 112+

## Security Considerations

### Input Validation

- GIF URLs: Whitelist giphy.com domains only
- Markdown output: Escape brackets/parentheses
- Search queries: Debounced to prevent abuse

### Data Privacy

- No analytics or tracking
- No data sent to third parties (except GIF search)
- Settings stored locally via chrome.storage.sync
- No external script loading

### Content Security

- All scripts bundled at build time
- CSS loaded via chrome.runtime.getURL (trusted source)
- No eval() or Function() constructor
- No innerHTML with user input

### Permissions Justification

| Permission       | Purpose                       | Scope                            |
| ---------------- | ----------------------------- | -------------------------------- |
| storage          | Save user settings            | chrome.storage.sync API          |
| contextMenus     | Quick links on extension icon | Extension action context menu    |
| host_permissions | Inject content scripts        | github.com, gist.github.com only |

## Known Limitations

1. **GitHub Enterprise:** Not supported (host_permissions limited to public GitHub)
2. **Mobile GitHub:** Not tested (Chrome desktop only)
3. **GitHub Updates:** May break if GitHub changes DOM structure
4. **Offline Mode:** GIF picker requires network, other features work offline
5. **Browser Support:** Chrome 88+ and Firefox 112+ (Manifest V3, no Safari)

## Future Enhancement Areas

1. **Keyboard Shortcuts:** Configurable hotkeys for features
2. **Settings Sync:** Import/export configuration
3. **Theme Support:** Dark mode color adjustments
4. **More Locales:** Expand language support (currently English, Japanese, and Vietnamese)
5. **Performance:** Intersection Observer for lazy feature activation
6. **Accessibility:** ARIA labels, keyboard navigation for modals

## Troubleshooting

### Extension Not Loading

- Check manifest.json syntax
- Verify dist/ folder exists
- Reload extension at chrome://extensions/

### Features Not Working

- Check console for errors
- Verify settings enabled in popup
- Reload GitHub page
- Clear chrome.storage: `chrome.storage.sync.clear()`

### GIF Picker Failures

- Check network tab for API errors
- Verify API endpoint reachable: <https://github-gifs.aldilaff6545.workers.dev/?search=cat>
- Cloudflare Worker may have rate limits

### Build Failures

- Node version: `node --version` (should be 18+)
- Clean rebuild: `rm -rf dist/ && pnpm build`
- Check esbuild errors in console

## Code Ownership

| Component      | Primary File(s)       | LOC | Complexity                             |
| -------------- | --------------------- | --- | -------------------------------------- |
| Edit History   | edit-history*.js (×5) | 890 | High (diff, markdown, overlay, parser) |
| GIF Picker     | gif-picker.js         | 656 | High (API, state, sanitization)        |
| Sidebar Toggle | sidebar-toggle.js     | 335 | Medium (keyboard, persistence)         |
| Image Lightbox | image-lightbox.js     | 318 | Medium (transforms, events)            |
| Table Expand   | table-expand.js       | 227 | Medium (state, observer)               |
| Build System   | build.js              | 178 | Medium (esbuild, multi-browser)        |
| Service Worker | service-worker.js     | 110 | Medium (context menu, image proxy)     |
| Main Entry     | main.js               | 70  | Low (initialization logic)             |
| Constants      | constants.js          | 57  | Low (static config, external links)    |
| Popup          | popup.js              | 43  | Low (checkbox handlers)                |
| Storage        | storage.js            | 33  | Low (wrapper functions)                |
| Icons          | icons.js              | 21  | Low (SVG strings)                      |
| Wide Layout    | wide-layout.js        | 20  | Low (CSS-only)                         |
| DOM Utils      | dom.js                | 18  | Low (Firefox compliance)               |
| Early Inject   | early-inject.js       | 17  | Low (FOUC prevention)                  |

Most complex feature: **Edit History** (word-level diff, markdown rendering, multi-view overlay, DOM parsing)
Second most complex: **GIF Picker** (API integration, Vietnamese normalization, security validation)
Simplest feature: **Wide Layout** (pure CSS)
