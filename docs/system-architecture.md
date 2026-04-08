# System Architecture

## High-Level Overview

GitHub Flex is a Chrome Manifest V3 extension that enhances GitHub's interface through DOM manipulation and CSS injection. No backend services, no GitHub API integration—pure client-side enhancement.

```
┌─────────────────────────────────────────────────────────┐
│                    Chrome Browser                       │
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │              github.com (SPA)                      │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │         Content Script (main.js)             │  │ │
│  │  │  ┌────────────────────────────────────────┐  │  │ │
│  │  │  │ Feature Modules (5 independent units)  │  │  │ │
│  │  │  │  • Wide Layout                         │  │  │ │
│  │  │  │  • Table Expand                        │  │  │ │
│  │  │  │  • Image Lightbox                      │  │  │ │
│  │  │  │  • GIF Picker                          │  │  │ │
│  │  │  │  • Zen Mode                            │  │  │ │
│  │  │  └────────────────────────────────────────┘  │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Popup UI  │  │   Storage    │  │ Service Worker  │  │
│  │ (settings) │◄─┤chrome.storage├──┤  (lifecycle)    │  │
│  └────────────┘  │    .sync     │  └─────────────────┘  │
│                  └──────────────┘                       │
└─────────────────────────────────────────────────────────┘
                           │
                           │ GIF Search (HTTPS)
                           ▼
              ┌────────────────────────┐
              │  Cloudflare Worker     │
              │ (GIF API Proxy)        │
              └────────────────────────┘
```

## Component Architecture

### 1. Extension Components

#### Service Worker (Background)
```
src/background/service-worker.js (13 LOC)
├── Purpose: Extension lifecycle management
├── Runs: On extension install/update
├── Capabilities:
│   ├── Listen to chrome.runtime events
│   ├── No DOM access
│   └── 30-second execution limit
└── Current Usage: Minimal (logs install events)
```

**Why minimal?** Manifest V3 service workers are event-driven, not long-running. All feature logic lives in content scripts for direct DOM access.

#### Content Script (Injected)
```
src/content/main.js (55 LOC)
├── Injection: document_idle on github.com/* and gist.github.com/*
├── Responsibilities:
│   ├── Load settings from chrome.storage.sync
│   ├── Initialize enabled features
│   ├── Listen for setting changes
│   └── Toggle features dynamically (no reload required)
└── Lifetime: Per-tab (destroyed on navigation away from GitHub)
```

**Execution Flow:**
1. GitHub page loads
2. Chrome injects main.js at document_idle
3. main.js fetches settings
4. Calls `feature.enable()` for each enabled feature
5. Listens for chrome.storage.onChanged events

#### Popup UI (User Settings)
```
src/popup/popup.{html,css,js} (26 LOC JS)
├── Trigger: User clicks extension icon
├── UI: 5 checkboxes (one per feature)
├── Flow:
│   ├── Load current settings on open
│   ├── Bind checkbox change handlers
│   ├── Save to chrome.storage.sync on toggle
│   └── Content script receives onChanged event
└── Lifetime: Destroyed when popup closes
```

**Why separate from content script?** Popup runs in isolated context—can't directly access GitHub page. Settings flow through chrome.storage API.

### 2. Feature Modules

Each feature is a self-contained module with zero cross-dependencies.

#### Module Interface
```javascript
{
  enabled: boolean,         // Current activation state
  observer: MutationObserver | null,  // DOM change watcher
  // ... feature-specific state

  enable(): void,          // Activate feature
  disable(): void,         // Deactivate and cleanup

  // Private helpers (not exposed)
  _injectStyles(): void,
  _setupObserver(): void,
  _cleanup(): void,
}
```

#### Dependency Graph
```
main.js
  ├─► wideLayout      ─┐
  ├─► tableExpand     ─┤
  ├─► imageLightbox   ─┼─► shared/storage.js
  ├─► gifPicker       ─┤    shared/constants.js
  └─► zenMode         ─┘    shared/icons.js

(No horizontal dependencies between features)
```

### 3. Data Storage Architecture

#### Chrome Storage Sync (Global Settings)
```
chrome.storage.sync
└── "settings" (object)
    ├── wideLayout: true
    ├── tableExpand: true
    ├── imageLightbox: true
    ├── gifPicker: true
    └── zenMode: true
```

**Characteristics:**
- Syncs across devices (Chrome signed-in users)
- 100KB quota (we use ~0.1KB)
- Async API (Promise-based)
- Cached in `shared/storage.js` to avoid repeated reads

**Access Pattern:**
```
Popup writes → chrome.storage.sync.set()
                        ↓
            chrome.storage.onChanged event
                        ↓
            Content script receives change
                        ↓
            Calls feature.enable() or disable()
```

#### LocalStorage (Per-Page State)
```
localStorage (per-origin, github.com)
├── "ghflex-zen-hidden": "true"
└── "ghflex-table-expand-state": '{"pathname:table-0": true, ...}'
```

**Characteristics:**
- Per-page ephemeral state (doesn't sync)
- Synchronous API
- Survives page reload, not browser restart
- Used for UI state that shouldn't persist globally

**Why not chrome.storage?** Zen mode and table expand states are contextual to specific pages—no need to sync across devices.

## Feature Deep Dives

### Wide Layout

**Architecture:** Pure CSS override

```
User enables in popup
        ↓
chrome.storage.sync updated
        ↓
Content script receives change
        ↓
wideLayout.enable()
        ├─► Adds class to <html>: "ghflex-wide-layout"
        └─► Injects CSS: chrome.runtime.getURL("styles/wide-layout.css")
                ↓
        CSS overrides GitHub's .container-xl max-width
                ↓
        Content expands to full viewport
```

**No JavaScript Logic:** Everything happens in CSS. Feature module only manages injection/removal.

### Table Expand

**Architecture:** DOM wrapper + state persistence

```
Feature enabled
        ↓
processTables() runs
        ├─► Queries: .markdown-body table
        ├─► Wraps each in: .ghflex-table-wrapper
        ├─► Injects buttons: expand + fullscreen
        └─► Restores state from localStorage
                ↓
User clicks expand button
        ↓
toggleExpand(table, index)
        ├─► Toggles class: .ghflex-table-expanded
        ├─► Saves state: localStorage[pathname:table-{index}] = true
        └─► Button icon updates
                ↓
User clicks fullscreen
        ↓
enterFullscreen(table)
        ├─► Creates overlay: position: fixed, z-index: 9999
        ├─► Clones table into overlay
        ├─► Adds Esc key listener
        └─► Stores reference: this.fullscreenTable
                ↓
GitHub SPA navigation (e.g., file → another file)
        ↓
MutationObserver fires
        ↓
Debounced processTables() runs (100ms delay)
        ├─► Detects new tables
        ├─► Wraps and injects buttons
        └─► Restores state for new URL
```

**State Key Pattern:** `pathname:table-index`
- Example: `/user/repo/blob/main/README.md:table-0`
- Ensures state isolation per-page

**Why Debounce?** GitHub's SPA triggers hundreds of mutations during navigation. Debouncing prevents excessive processing.

### Image Lightbox

**Architecture:** Event delegation + transform-based zoom

```
Feature enabled
        ↓
Sets up click listener on document.body (delegation)
        ↓
User clicks .markdown-body img
        ↓
handleClick(event)
        ├─► Creates overlay: position: fixed, backdrop
        ├─► Clones image into overlay
        └─► Sets up interaction handlers:
                ├─► Wheel: zoom (scale transform)
                ├─► Mousedown → Mousemove: pan (translate transform)
                └─► Click overlay: close
                        ↓
User scrolls wheel
        ↓
handleWheel(event)
        ├─► Calculates delta: event.deltaY
        ├─► Updates scale: current * (1 ± 0.1)
        ├─► Clamps: 0.1 ≤ scale ≤ 10
        └─► Applies transform: `scale(${scale})`
                ↓
User drags (when zoomed)
        ↓
handleMouseMove(event)
        ├─► Calculates delta: currentPos - startPos
        ├─► Updates position: {x, y} += delta
        └─► Applies transform: `translate(${x}px, ${y}px) scale(${scale})`
                ↓
User clicks overlay background
        ↓
closeLightbox()
        ├─► Removes overlay from DOM
        ├─► Removes event listeners
        └─► Resets state: {scale: 1, position: {x: 0, y: 0}}
```

**Why Transforms?** GPU-accelerated, no reflow. Better performance than changing width/height.

### GIF Picker

**Architecture:** Modal UI + API integration + text processing

```
Feature enabled
        ↓
Observes DOM for comment toolbars
        ↓
Detects: .js-toolbar-group (GitHub's comment toolbar)
        ↓
Injects GIF button before existing buttons
        ↓
User clicks GIF button
        ↓
openModal(textarea)
        ├─► Stores reference: this.currentTextarea = textarea
        ├─► Creates modal:
        │       ├─► Search input
        │       ├─► Results grid
        │       └─► Close button
        ├─► Positions near toolbar
        └─► Focuses search input
                ↓
User types search query
        ↓
handleSearchInput(event)
        ├─► Normalizes Vietnamese: "tieng viet" → "tiếng việt"
        ├─► Debounces (300ms delay)
        └─► Calls searchGifs(normalizedQuery)
                ↓
searchGifs(query)
        ├─► Fetches: GET ${GIF_API_URL}?search=${query}
        ├─► Parses JSON response
        └─► Calls renderResults(gifs)
                ↓
renderResults(gifs)
        ├─► Clears previous results
        ├─► Creates img elements for each GIF
        └─► Adds click handler: insertGif(gifData)
                ↓
User clicks a GIF
        ↓
insertGif(gifData)
        ├─► Validates URL: isValidGifUrl(gifData.url)
        ├─► Escapes title: escapeMarkdown(gifData.title)
        ├─► Generates markdown: `![${title}](${url})`
        ├─► Inserts at cursor position in textarea
        ├─► Triggers input event (for GitHub's auto-preview)
        └─► Closes modal
```

**Vietnamese Normalization:**
```javascript
const vietnameseMap = {
  "tieng viet": "tiếng việt",
  "ha noi": "hà nội",
  "viet nam": "việt nam",
  // ... 50+ mappings
};

function normalizeVietnamese(text) {
  let normalized = text.toLowerCase();
  for (const [unaccented, accented] of Object.entries(vietnameseMap)) {
    normalized = normalized.replace(unaccented, accented);
  }
  return normalized;
}
```

**Security Validation:**
```javascript
function isValidGifUrl(url) {
  try {
    const parsed = new URL(url);
    const allowedHosts = ["giphy.com", "media.giphy.com", "media0.giphy.com",
                          "media1.giphy.com", "media2.giphy.com", "media3.giphy.com",
                          "media4.giphy.com"];
    return allowedHosts.some(host =>
      parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

function escapeMarkdown(text) {
  return text.replace(/[[\]()]/g, "\\$&");
}
```

**Why Cloudflare Worker?**
- Hides Giphy API key (not exposed in extension source)
- Enables rate limiting (prevents abuse)
- Single point of control for API changes

### Zen Mode

**Architecture:** Keyboard shortcut + localStorage persistence

```
Feature enabled
        ↓
Detects repository sidebar: .Layout-sidebar
        ↓
Injects toggle button in navigation
        ↓
Sets up keyboard listener: Alt+M
        ↓
Loads state from localStorage: "ghflex-zen-hidden"
        ↓
If state === "true", applies .ghflex-sidebar-hidden to body
        ↓
User presses Alt+M (or clicks button)
        ↓
toggle()
        ├─► Toggles class: body.classList.toggle("ghflex-sidebar-hidden")
        ├─► Saves state: localStorage["ghflex-zen-hidden"] = isHidden
        └─► Updates button icon
                ↓
CSS hides sidebar:
        .ghflex-sidebar-hidden .Layout-sidebar {
          display: none !important;
        }
        ↓
GitHub SPA navigation (e.g., Code → Issues → Code)
        ↓
MutationObserver fires
        ↓
Checks if sidebar exists on new page
        ├─► If yes: restore state from localStorage
        └─► If no: do nothing (page has no sidebar)
```

**State Persistence:**
```javascript
// Save
localStorage.setItem("ghflex-zen-hidden", String(isHidden));

// Load
const stored = localStorage.getItem("ghflex-zen-hidden");
const isHidden = stored === "true";
```

**Why String Conversion?** localStorage only stores strings. Boolean `true` must be explicitly compared as string `"true"`.

## Communication Patterns

### Popup ↔ Content Script

**No Direct Messaging:** Uses chrome.storage as message bus

```
┌──────────┐                  ┌──────────────────┐                  ┌────────────────┐
│  Popup   │                  │ chrome.storage   │                  │ Content Script │
│          │                  │      .sync       │                  │                │
│  User    │──set(settings)──►│                  │──onChanged event►│  Receives      │
│  toggles │                  │  {settings: {}}  │                  │  new settings  │
│  feature │                  │                  │                  │                │
│          │◄─get(settings)───│                  │                  │                │
│  On open │                  │                  │                  │                │
└──────────┘                  └──────────────────┘                  └────────────────┘
```

**Why Not chrome.runtime.sendMessage?**
- chrome.storage provides built-in persistence
- onChanged event broadcasts to all tabs automatically
- No need to maintain active message ports

### Feature ↔ Shared Utilities

**Unidirectional Import:** Features import from shared, never the reverse

```
shared/storage.js
    ↑
    │ import { getSettings }
    │
main.js
    ↑
    │ import { wideLayout }
    │
wideLayout.js (imports nothing)
```

**Why No Circular Dependencies?**
- Easier to reason about data flow
- Prevents initialization order issues
- Simplifies testing (mock shared utilities)

### Content Script ↔ GitHub DOM

**Event Delegation Pattern:**

```javascript
// ✓ Good: Single listener, handles all future elements
document.body.addEventListener("click", (e) => {
  if (e.target.matches(".ghflex-gif-btn")) {
    handleGifButtonClick(e.target);
  }
});

// ✗ Bad: Must re-bind on every DOM change
document.querySelectorAll(".ghflex-gif-btn").forEach(btn => {
  btn.addEventListener("click", handleGifButtonClick);
});
```

**MutationObserver for SPA Navigation:**

```javascript
this.observer = new MutationObserver((mutations) => {
  // GitHub's SPA changed the DOM
  clearTimeout(this.debounceTimer);
  this.debounceTimer = setTimeout(() => {
    this.processNewElements(); // Re-scan and initialize
  }, 100);
});

this.observer.observe(document.body, {
  childList: true,  // Watch for added/removed nodes
  subtree: true,    // Watch entire tree, not just direct children
});
```

**Why Not popstate Event?** GitHub's SPA uses pushState without firing popstate. MutationObserver is more reliable.

## Security Architecture

### Threat Model

**In Scope:**
- XSS via unsanitized user input (GIF titles, search queries)
- MITM on GIF API requests (enforced HTTPS)
- Malicious URLs in generated markdown (domain whitelist)

**Out of Scope:**
- GitHub account compromise (extension has no auth)
- Browser/OS vulnerabilities (Chrome's responsibility)
- Phishing (extension doesn't collect credentials)

### Defense Layers

#### 1. Content Security Policy
```
Default Manifest V3 CSP (no overrides):
- script-src 'self'
- object-src 'none'
- No eval(), no inline scripts, no remote code
```

#### 2. Input Validation (GIF Picker)

**URL Whitelist:**
```javascript
const ALLOWED_HOSTS = [
  "giphy.com",
  "media.giphy.com",
  "media0.giphy.com",
  // ... media1-4.giphy.com
];

function isValidGifUrl(url) {
  const parsed = new URL(url); // Throws if invalid
  return ALLOWED_HOSTS.some(host =>
    parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
  );
}
```

**Why Whitelist Over Blacklist?** Blacklists can be bypassed (`evil.giphy.com.evil.com`). Whitelist explicitly allows only known-good domains.

**Markdown Sanitization:**
```javascript
function escapeMarkdown(text) {
  return text.replace(/[[\]()]/g, "\\$&");
}

// Before: "Title with [link](http://evil.com)"
// After:  "Title with \[link\]\(http://evil.com\)"
```

**Why These Characters?** Brackets and parentheses are markdown syntax. Escaping prevents injecting malicious links.

#### 3. API Proxy (Cloudflare Worker)

**Direct Giphy API Call (Insecure):**
```javascript
// ✗ API key exposed in extension source
fetch(`https://api.giphy.com/v1/gifs/search?api_key=SECRET&q=${query}`);
```

**Proxied Through Worker (Secure):**
```javascript
// ✓ API key stored in Cloudflare Worker environment variable
fetch(`https://github-gifs.aldilaff6545.workers.dev?search=${query}`);
```

**Worker Responsibilities:**
- Store API key securely (not in client code)
- Rate limit requests (prevent abuse)
- Validate responses (filter inappropriate content if needed)
- Add CORS headers (allow extension origin)

#### 4. Permissions Minimization

**Requested Permissions:**
```json
{
  "permissions": ["storage"],
  "host_permissions": ["https://github.com/*", "https://gist.github.com/*"]
}
```

**Not Requested:**
- `tabs`: Don't need tab information
- `activeTab`: Only inject on GitHub, not all tabs
- `webRequest`: Don't intercept network traffic
- `cookies`: Don't access GitHub session
- `<all_urls>`: Limit to GitHub domains only

### Attack Surface Analysis

| Attack Vector            | Risk     | Mitigation                                   |
| ------------------------ | -------- | -------------------------------------------- |
| XSS via GIF title        | Medium   | Escape markdown syntax                       |
| Malicious GIF URL        | Medium   | Whitelist giphy.com domains                  |
| MITM on API              | Low      | HTTPS enforced, certificate validation       |
| Extension update hijack  | Low      | Chrome Web Store signed updates              |
| localStorage poisoning   | Low      | Validate/sanitize on read, graceful fallback |
| chrome.storage quota DoS | Very Low | We use <1% of quota                          |

## Performance Architecture

### Bundle Optimization

**Entry Points:** 2 (content, popup)
**Output:** IIFE format (no global pollution)
**Minification:** Production only (dev uses unminified for debugging)

**Current Sizes:**
- content/main.js: ~15KB minified
- popup/popup.js: ~3KB minified
- Total CSS: ~8KB uncompressed

**Why Not Code Splitting?** Extension is small enough (<50KB total). Code splitting overhead would exceed benefits.

### Runtime Optimization

#### Lazy Initialization
```javascript
// ✓ Features only activate when enabled
for (const [key, feature] of Object.entries(features)) {
  if (settings[key]) {
    feature.enable(); // Conditional activation
  }
}

// ✗ All features initialize regardless of settings
features.forEach(feature => feature.initialize());
```

#### Debounced DOM Processing
```javascript
// ✓ Batch multiple mutations into single process
this.observer = new MutationObserver(() => {
  clearTimeout(this.timer);
  this.timer = setTimeout(() => this.process(), 100);
});

// ✗ Process on every mutation (expensive)
this.observer = new MutationObserver(() => this.process());
```

#### Event Delegation
```javascript
// ✓ One listener for all current + future elements
document.body.addEventListener("click", handler);

// ✗ N listeners for N elements (memory leak on SPA nav)
elements.forEach(el => el.addEventListener("click", handler));
```

#### Cached Settings
```javascript
let cachedSettings = null;

export async function getSettings() {
  if (cachedSettings) return cachedSettings; // ← Cache hit

  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  cachedSettings = { ...SETTINGS_DEFAULTS, ...result.settings };
  return cachedSettings;
}
```

**Why Cache?** chrome.storage API is async and relatively slow. Cache prevents repeated reads on every feature toggle.

### Memory Management

#### Cleanup on disable()
```javascript
disable() {
  // Remove listeners
  document.removeEventListener("keydown", this.boundHandler);
  this.boundHandler = null; // ← Prevent memory leak

  // Disconnect observer
  this.observer?.disconnect();
  this.observer = null;

  // Remove injected DOM
  this.modal?.remove();
  this.modal = null;

  // Clear timers
  clearTimeout(this.debounceTimer);
}
```

**Why Nullify?** Breaking references allows garbage collection. Especially important in long-lived tabs.

## Error Handling Strategy

### Principle: Fail Gracefully

**User-Facing Errors:**
```javascript
// API failure → Show message, don't crash
try {
  const gifs = await fetchGifs(query);
  renderResults(gifs);
} catch (error) {
  console.error("[GitHub Flex] API failed:", error);
  showError("Failed to load GIFs. Please try again.");
}
```

**Internal Errors:**
```javascript
// State corruption → Fallback to defaults
try {
  const state = JSON.parse(localStorage.getItem(KEY));
  this.state = state;
} catch (error) {
  console.error("[GitHub Flex] Corrupt state:", error);
  this.state = DEFAULT_STATE;
}
```

**No Uncaught Exceptions:** Every async operation wrapped in try/catch. Extension should never crash GitHub page.

### Logging Strategy

**Format:** `[GitHub Flex] {message}`
**Levels:**
- `console.log`: Successful initialization
- `console.warn`: Non-critical issues (feature disabled due to missing DOM)
- `console.error`: Failures that affect functionality

**No Telemetry:** All errors logged locally only. No data sent to external services.

## Build Architecture

### esbuild Pipeline

```
Source Files (src/)
        ↓
    [esbuild]
        ├─► Bundle: src/content/main.js → dist/content/main.js
        ├─► Bundle: src/popup/popup.js → dist/popup/popup.js
        └─► Options: { format: "iife", target: "chrome88", minify: true }
        ↓
Static Files (copy)
        ├─► src/popup/popup.html → dist/popup/popup.html
        ├─► src/popup/popup.css → dist/popup/popup.css
        ├─► src/content/styles/*.css → dist/content/styles/*.css
        ├─► src/background/service-worker.js → dist/background/service-worker.js
        ├─► icons/* → dist/icons/*
        └─► _locales/* → dist/_locales/*
        ↓
Manifest Processing
        ├─► Read: manifest.json
        ├─► Modify paths: "src/..." → "..."
        └─► Write: dist/manifest.json
        ↓
    dist/ (ready to load in Chrome)
```

### Watch Mode

```bash
pnpm dev  # Starts file watcher
```

**Watched Paths:**
- `src/**/*`
- `manifest.json`
- `scripts/build.js` (rebuild on build script change)

**Debouncing:** 100ms delay after last file change before rebuild.

**Hot Reload:** Manual (reload extension at chrome://extensions/ or refresh GitHub page).

## Testing Architecture

### Test Framework

**Runner:** Vitest (Vite-based, fast)
**Coverage:** @vitest/coverage-v8 (Istanbul-compatible)

### Test Structure
```
src/features/gif-picker.js
src/features/gif-picker.test.js  ← Colocated tests
```

**Why Colocated?** Easier to find tests, encourages writing them, clear ownership.

### Test Patterns

**Unit Tests (current priority):**
- Storage utilities (`getSettings`, `saveSettings`)
- URL validation (`isValidGifUrl`)
- Markdown sanitization (`escapeMarkdown`)
- Vietnamese normalization (`normalizeVietnamese`)

**Integration Tests (future):**
- Feature enable/disable lifecycle
- MutationObserver behavior
- Event delegation

**E2E Tests (out of scope for v1):**
- Selenium/Puppeteer on actual GitHub pages
- Too brittle (GitHub DOM changes frequently)

## Deployment Architecture

### Distribution

**Current:** Manual sideloading
**Future:** Chrome Web Store

#### Sideload Process
1. Build: `pnpm build`
2. Open: `chrome://extensions/`
3. Enable: Developer mode
4. Load: "Load unpacked" → select `dist/`

#### Chrome Web Store Process (future)
1. Build: `pnpm build`
2. Zip: `dist/` folder
3. Upload: Chrome Developer Dashboard
4. Review: Google approval (1-3 days)
5. Publish: Available to users

### Version Management

**Semantic Versioning:**
- MAJOR: Breaking changes (manifest updates, feature removal)
- MINOR: New features (new enhancement)
- PATCH: Bug fixes (no new functionality)

**Example:**
- `1.0.0`: Initial release
- `1.1.0`: Add new feature (e.g., code folding)
- `1.0.1`: Fix GIF picker bug

## Scalability Considerations

### Current Constraints

**Not Issues Yet (v1.0):**
- Performance on pages with >100 tables
- Memory usage in tabs open for >1 hour
- API rate limits (Cloudflare Worker has limits)

### Future Scaling Strategies

**If Performance Degrades:**
1. **Intersection Observer:** Only process visible tables, lazy-load others
2. **Virtual Scrolling:** For GIF picker results (>100 GIFs)
3. **Throttled Observers:** Increase debounce delay on large pages

**If API Limits Hit:**
1. **Client-Side Caching:** Cache GIF search results (localStorage)
2. **Request Batching:** Send fewer, larger requests
3. **CDN:** Host popular GIFs directly (avoid API calls)

## Extension Lifecycle

### Installation Flow
```
User installs extension
        ↓
Chrome extracts dist/ contents
        ↓
Validates manifest.json
        ↓
Registers content scripts, service worker, popup
        ↓
Grants permissions (storage, github.com hosts)
        ↓
Service worker fires: chrome.runtime.onInstalled
        ↓
Logs: "[GitHub Flex] Extension installed"
        ↓
User navigates to github.com
        ↓
Chrome injects: dist/content/main.js at document_idle
        ↓
Content script initializes features
```

### Update Flow
```
Chrome detects new version in Web Store
        ↓
Downloads new dist/
        ↓
Service worker fires: chrome.runtime.onInstalled (reason: "update")
        ↓
Reloads extension (all tabs reload content scripts on next navigation)
        ↓
Users see new features/fixes without manual action
```

### Uninstallation
```
User removes extension
        ↓
Chrome removes all extension files
        ↓
Clears chrome.storage.sync data (settings lost)
        ↓
localStorage data persists (ghflex-* keys remain)
        ↓
No cleanup needed (pure client-side, no server state)
```

## Monitoring & Observability

### No Built-In Telemetry

**Privacy First:** Zero data collection, no analytics, no tracking.

**Debugging:**
- Users check: Browser console (F12 on GitHub page)
- Logs prefixed: `[GitHub Flex]`
- Errors logged: console.error with stack traces

**Issue Reporting:**
- GitHub Issues: https://github.com/lamngockhuong/github-flex/issues
- Include: Browser version, console logs, reproduction steps

## Future Architecture Enhancements

### Planned (v1.1)
- **Configurable Shortcuts:** Allow users to customize keyboard shortcuts
- **Settings Export/Import:** JSON file for sharing configurations
- **Performance Dashboard:** Show memory/CPU usage in popup

### Considered (v2.0)
- **Firefox Support:** Port to Manifest V2 (Firefox doesn't fully support V3)
- **GitHub Enterprise:** Add host_permissions for custom domains
- **Theme Sync:** Detect GitHub theme (light/dark) and adjust extension styles

### Out of Scope
- **Backend Services:** Extension remains fully client-side
- **GitHub API Integration:** DOM manipulation only, no authenticated requests
- **Mobile Support:** Chrome Android doesn't support extensions
