# Code Standards

## Overview

GitHub Flex follows minimalist conventions prioritizing readability and maintainability over rigid style enforcement. These standards reflect actual patterns in the codebase.

## File Organization

### Naming Conventions

**JavaScript Files:**
- Pattern: `kebab-case.js`
- Examples: `wide-layout.js`, `gif-picker.js`, `service-worker.js`
- Rationale: Matches CSS class naming, readable in URLs

**CSS Files:**
- Pattern: `kebab-case.css`
- Examples: `wide-layout.css`, `table-expand.css`
- Match corresponding JS feature file

**Directories:**
- Pattern: `lowercase` (no separators needed for single words)
- Examples: `features/`, `shared/`, `background/`

### File Size Limits

**Hard Limit:** 600 LOC per file
**Target:** 200 LOC per file
**Current Range:** 13-575 LOC

**Splitting Strategy:**
- When file exceeds 400 LOC, evaluate for extraction opportunities
- Extract reusable utilities to `shared/`
- Keep feature files self-contained (don't split unless >600 LOC)

**Current Outlier:**
- `gif-picker.js` (575 LOC) - acceptable due to high cohesion (API, UI, state in single feature)

### Directory Structure

```
src/
├── background/       # Service worker only
├── content/
│   ├── main.js       # Entry point
│   ├── features/     # Feature modules
│   └── styles/       # Feature stylesheets
├── popup/            # Extension popup UI
└── shared/           # Utilities used by multiple features
```

**Rules:**
- Features never import from other features (no cross-dependencies)
- All features import from `shared/` for utilities
- `shared/` never imports from features (unidirectional)

## JavaScript Conventions

### Module System

**ES Modules only:**
```javascript
// ✓ Good
import { getSettings } from "../shared/storage.js";
export const featureName = { ... };

// ✗ Bad
const storage = require("../shared/storage");
module.exports = featureName;
```

**File Extensions:**
- Always include `.js` in imports (required for ES modules)

### Code Style

**Indentation:** 2 spaces (no tabs)

**Quotes:** Double quotes preferred
```javascript
// ✓ Good
const styleId = "ghflex-wide-layout-styles";

// ✓ Also acceptable (for avoiding escapes)
const html = '<button class="btn">Click</button>';
```

**Semicolons:** Always use
```javascript
// ✓ Good
const value = 42;
doSomething();

// ✗ Bad (ASI can cause bugs)
const value = 42
doSomething()
```

**Line Length:** 100 characters (soft limit, not enforced)

**Trailing Commas:** Use in multiline structures
```javascript
// ✓ Good
const config = {
  foo: 1,
  bar: 2,
};

// ✗ Bad
const config = {
  foo: 1,
  bar: 2
};
```

### Naming Conventions

**Variables and Functions:** camelCase
```javascript
const currentImage = null;
function processTables() { ... }
```

**Constants:** UPPER_SNAKE_CASE
```javascript
const STYLE_ID = "ghflex-feature-styles";
const API_URL = "https://api.example.com";
```

**Classes/Constructors:** PascalCase (if ever needed)
```javascript
class FeatureManager { ... }
```

**Private/Internal:** Prefix with underscore (convention, not enforced)
```javascript
function _internalHelper() { ... }
```

**Boolean Variables:** Use `is`, `has`, `should` prefixes
```javascript
const isExpanded = true;
const hasObserver = false;
const shouldDebounce = true;
```

### Feature Module Pattern

Every feature exports an object with this interface:

```javascript
export const featureName = {
  enabled: false,          // Required: current state
  observer: null,          // Optional: MutationObserver reference
  // ... other state properties

  enable() {
    if (this.enabled) return;
    // 1. Inject styles
    // 2. Add event listeners
    // 3. Setup observers
    // 4. Process existing DOM
    this.enabled = true;
  },

  disable() {
    if (!this.enabled) return;
    // 1. Remove styles
    // 2. Remove event listeners
    // 3. Disconnect observers
    // 4. Clean up DOM
    this.enabled = false;
  },

  // Optional helper methods (not exposed to main.js)
  _helperMethod() { ... },
};
```

**Rules:**
- `enabled` flag prevents double-enable/disable
- `enable()` is idempotent (safe to call multiple times)
- `disable()` cleans up all side effects
- Helper methods prefixed with `_` (internal only)

### State Management

**Feature-Local State:**
- Store in feature object properties
- Example: `{ currentImage: null, scale: 1, position: { x: 0, y: 0 } }`

**Per-Page State (ephemeral):**
- Use `localStorage`
- Keys prefixed with `ghflex-`
- Example: `localStorage.getItem("ghflex-zen-hidden")`

**Global Settings (persistent):**
- Use `chrome.storage.sync` via `shared/storage.js`
- Centralized in `SETTINGS_DEFAULTS` constant

**Cache Pattern:**
```javascript
let cachedSettings = null;

export async function getSettings() {
  if (cachedSettings) return cachedSettings;
  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  cachedSettings = { ...SETTINGS_DEFAULTS, ...result.settings };
  return cachedSettings;
}
```

### Event Handling

**Listener Binding:**
```javascript
// ✓ Good (store bound reference for cleanup)
this.boundToggle = () => this.toggle();
document.addEventListener("keydown", this.boundToggle);

// In disable():
document.removeEventListener("keydown", this.boundToggle);

// ✗ Bad (can't remove listener)
document.addEventListener("keydown", () => this.toggle());
```

**Event Delegation:**
```javascript
// ✓ Good (single listener for multiple elements)
document.body.addEventListener("click", (e) => {
  if (e.target.matches(".ghflex-gif-btn")) {
    this.openModal(e.target);
  }
});

// ✗ Bad (listener per element, memory leak risk)
document.querySelectorAll(".ghflex-gif-btn").forEach(btn => {
  btn.addEventListener("click", () => this.openModal(btn));
});
```

**Debouncing:**
```javascript
// ✓ Good (prevents excessive calls)
this.observer = new MutationObserver(() => {
  clearTimeout(this.processTimeout);
  this.processTimeout = setTimeout(() => this.process(), 100);
});

// ✗ Bad (called on every mutation)
this.observer = new MutationObserver(() => {
  this.process(); // Expensive!
});
```

### DOM Manipulation

**Element Creation:**
```javascript
// ✓ Good (explicit)
const button = document.createElement("button");
button.className = "ghflex-btn";
button.textContent = "Click me";
button.addEventListener("click", handler);

// ✗ Avoid (innerHTML with user input)
button.innerHTML = userInput; // XSS risk
```

**Class Management:**
```javascript
// ✓ Good (classList API)
element.classList.add("ghflex-active");
element.classList.remove("ghflex-hidden");
element.classList.toggle("ghflex-expanded");

// ✗ Avoid (string manipulation, error-prone)
element.className += " ghflex-active";
```

**Querying:**
```javascript
// ✓ Good (specific selectors)
document.querySelector(".markdown-body table");
document.querySelectorAll(".js-comment-field");

// ✗ Bad (too generic, fragile)
document.querySelector("table");
document.querySelectorAll("textarea");
```

### CSS Injection

**Pattern:**
```javascript
injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("content/styles/feature.css");
  document.head.appendChild(link);
}

removeStyles() {
  document.getElementById(STYLE_ID)?.remove();
}
```

**Rules:**
- Use `<link>` tags, not inline `<style>` (CSP compliance)
- Always set unique `id` for cleanup
- Check existence before injecting (idempotent)

### Error Handling

**Silent Failures with Logging:**
```javascript
// ✓ Good (non-critical features)
try {
  const data = JSON.parse(localStorage.getItem(KEY));
  this.state = data;
} catch (error) {
  console.error("[GitHub Flex] Failed to load state:", error);
  this.state = {};
}

// ✗ Bad (uncaught exceptions crash feature)
const data = JSON.parse(localStorage.getItem(KEY));
this.state = data;
```

**User-Facing Errors:**
```javascript
// ✓ Good (API failures)
try {
  const response = await fetch(API_URL);
  const data = await response.json();
  return data;
} catch (error) {
  console.error("[GitHub Flex] API failed:", error);
  this.showError("Failed to load GIFs. Please try again.");
  return null;
}
```

**Console Logging:**
- Prefix: `[GitHub Flex]`
- Success: `console.log("[GitHub Flex] Initialized")`
- Errors: `console.error("[GitHub Flex] Failed to...", error)`

### Async/Await

**Preferred over Promises:**
```javascript
// ✓ Good
async function init() {
  const settings = await getSettings();
  for (const [key, feature] of Object.entries(features)) {
    if (settings[key]) feature.enable();
  }
}

// ✗ Avoid (harder to read)
function init() {
  return getSettings().then(settings => {
    Object.entries(features).forEach(([key, feature]) => {
      if (settings[key]) feature.enable();
    });
  });
}
```

**Error Handling:**
```javascript
// ✓ Good
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error("Failed:", error);
  return null;
}

// ✗ Bad (unhandled rejection)
const result = await riskyOperation(); // Can crash extension
```

### Comments

**When to Comment:**
- Complex algorithms (zoom calculations, Vietnamese normalization)
- Non-obvious workarounds (GitHub DOM quirks)
- Security considerations (URL validation, sanitization)

**When Not to Comment:**
```javascript
// ✗ Bad (obvious)
// Set enabled to true
this.enabled = true;

// ✓ Good (self-documenting)
this.enabled = true; // No comment needed
```

**Block Comments for Sections:**
```javascript
// ========================================
// Event Handlers
// ========================================

handleClick() { ... }
handleKeydown() { ... }
```

**Inline Comments for Clarification:**
```javascript
// GitHub's SPA navigation doesn't fire popstate, use MutationObserver
this.observer = new MutationObserver(() => this.process());
```

## CSS Conventions

### Class Naming

**Pattern:** BEM-inspired with `ghflex-` prefix

```css
/* Block */
.ghflex-table-wrapper { ... }

/* Element */
.ghflex-table-btn-group { ... }
.ghflex-table-expand-btn { ... }

/* Modifier */
.ghflex-table-expanded { ... }
.ghflex-sidebar-hidden { ... }
```

**Rules:**
- Always prefix with `ghflex-` (namespace to avoid conflicts)
- Use kebab-case
- Be specific (avoid generic names like `.button`)

### Specificity

**Minimize Specificity:**
```css
/* ✓ Good (low specificity, easy to override) */
.ghflex-btn { ... }

/* ✗ Bad (high specificity, hard to override) */
div.ghflex-wrapper > button.ghflex-btn { ... }
```

**Override GitHub Styles:**
```css
/* ✓ Good (specific enough to override) */
.ghflex-wide-layout .container-xl {
  max-width: none !important;
}

/* ✗ Bad (may not override GitHub's styles) */
.container-xl {
  max-width: none;
}
```

### Layout

**Flexbox Preferred:**
```css
/* ✓ Good */
.ghflex-modal-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ✗ Avoid (outdated) */
.ghflex-modal-content {
  display: table;
}
```

**Positioning:**
```css
/* Overlays */
position: fixed; /* For modals, lightboxes */

/* Relative positioning */
position: relative; /* For absolute children */

/* Avoid */
position: absolute; /* Unless relative parent exists */
```

### Units

**Spacing:** `rem` for scalability
```css
padding: 1rem;
margin: 0.5rem;
gap: 1.5rem;
```

**Borders:** `px` for precision
```css
border: 1px solid #ccc;
border-radius: 4px;
```

**Dimensions:**
- Width/Height: `%` for fluid, `px` for fixed
- Font sizes: `rem` (relative to root)

### Z-Index Scale

```css
/* Define scale in constants */
z-index: 1;     /* Slightly above normal content */
z-index: 10;    /* Dropdowns, tooltips */
z-index: 100;   /* Modals */
z-index: 1000;  /* Overlays (lightbox, fullscreen) */
z-index: 9999;  /* Top-most (if needed) */
```

**Current Usage:**
- Table fullscreen: `z-index: 9999`
- GIF picker modal: `z-index: 10000`
- Image lightbox: `z-index: 10000`

### Transitions

**Keep Subtle:**
```css
/* ✓ Good (smooth but fast) */
transition: opacity 0.2s ease, transform 0.2s ease;

/* ✗ Bad (too slow, annoying) */
transition: all 1s ease-in-out;
```

## Chrome Extension Patterns

### Manifest V3 Rules

**Service Worker:**
- No DOM access
- No long-running tasks (30s timeout)
- ES modules only (`"type": "module"`)

**Content Scripts:**
- Run in isolated world (can access DOM, not page JavaScript)
- Import ES modules
- Use `chrome.runtime.getURL()` for resources

**Permissions:**
- Request minimal permissions
- Justify each in `manifest.json` comments

### Storage API

**chrome.storage.sync:**
```javascript
// ✓ Good (use wrapper)
import { getSettings, saveSettings } from "./shared/storage.js";

// ✗ Bad (direct access, no caching)
chrome.storage.sync.get("settings", (result) => { ... });
```

**localStorage:**
```javascript
// ✓ Good (per-page state)
localStorage.setItem("ghflex-zen-hidden", "true");

// ✗ Bad (global settings, should use chrome.storage)
localStorage.setItem("settings", JSON.stringify(settings));
```

### Message Passing

**Not currently used** (all features in content script), but pattern:

```javascript
// Background → Content
chrome.tabs.sendMessage(tabId, { action: "toggleFeature" });

// Content → Background
chrome.runtime.sendMessage({ action: "getSettings" });
```

## Security Standards

### Input Validation

**URL Validation:**
```javascript
// ✓ Good (whitelist domains)
function isValidGifUrl(url) {
  try {
    const parsed = new URL(url);
    return ["giphy.com", "media.giphy.com"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

// ✗ Bad (accepts any URL)
function isValidGifUrl(url) {
  return url.startsWith("https://");
}
```

**Markdown Sanitization:**
```javascript
// ✓ Good (escape special characters)
function escapeMarkdown(text) {
  return text.replace(/[[\]()]/g, "\\$&");
}

const markdown = `![${escapeMarkdown(title)}](${validatedUrl})`;

// ✗ Bad (injection risk)
const markdown = `![${title}](${url})`;
```

### DOM Security

**Never Use:**
- `eval()`
- `Function()` constructor
- `innerHTML` with user input
- `document.write()`

**Safe Alternatives:**
```javascript
// ✓ Good
element.textContent = userInput;
element.setAttribute("data-value", userInput);

// ✗ Bad
element.innerHTML = userInput; // XSS risk
```

### Content Security Policy

**No Overrides Needed:**
- Default Manifest V3 CSP is sufficient
- All scripts bundled at build time
- No remote code loading

## Testing Standards

### File Organization

```
src/features/gif-picker.js
src/features/gif-picker.test.js  ← Test file next to implementation
```

### Test Structure

```javascript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { gifPicker } from "./gif-picker.js";

describe("GIF Picker", () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it("should validate GIF URLs", () => {
    expect(isValidGifUrl("https://giphy.com/test.gif")).toBe(true);
    expect(isValidGifUrl("https://evil.com/test.gif")).toBe(false);
  });
});
```

### Coverage Targets

- **Critical Paths:** 100% (security, data persistence)
- **Feature Logic:** 80%
- **UI Interactions:** 60%
- **Overall:** 70%

## Build Standards

### esbuild Configuration

```javascript
{
  bundle: true,           // Combine modules
  format: "iife",         // Immediately invoked function
  target: "chrome88",     // Manifest V3 baseline
  minify: true,           // Production only
}
```

### Output Structure

```
dist/
├── background/
│   └── service-worker.js    # Copied (no bundling needed)
├── content/
│   ├── main.js              # Bundled
│   └── styles/              # Copied
├── popup/
│   ├── popup.html           # Copied
│   ├── popup.css            # Copied
│   └── popup.js             # Bundled
├── icons/                   # Copied
├── _locales/                # Copied
└── manifest.json            # Modified (paths updated)
```

### Build Commands

```bash
pnpm build      # Production (minified)
pnpm dev        # Watch mode (unminified, faster rebuilds)
```

## Documentation Standards

### Inline Documentation

**File Headers:**
```javascript
// Feature Name - brief description
//
// Optional: Additional context, limitations, dependencies
```

**Function Documentation:**
```javascript
// Brief description of what function does
// @param {Type} name - description
// @returns {Type} description
function doSomething(name) { ... }
```

**No JSDoc Required:**
- Use only when type annotations add clarity
- Self-documenting code preferred

### README Structure

1. Brief description (1-2 sentences)
2. Features list
3. Installation instructions
4. Development setup
5. Tech stack
6. License

### Changelog Format

```markdown
## [Version] - YYYY-MM-DD

### Added
- New feature description

### Changed
- Modified feature description

### Fixed
- Bug fix description
```

## Git Standards

### Commit Messages

**Format:** Conventional Commits

```
type(scope): subject

body (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, whitespace
- `refactor`: Code restructure (no behavior change)
- `test`: Add/update tests
- `chore`: Build, dependencies, tooling

**Examples:**
```
feat(gif-picker): add Vietnamese text normalization
fix(table-expand): prevent state loss on navigation
docs: update installation instructions
refactor(storage): simplify cache logic
```

### Branch Strategy

**Main Branch:** `main`
- Always deployable
- Protected (require PR)

**Feature Branches:**
- Pattern: `feature/{name}`
- Example: `feature/gif-picker`

**Bug Fixes:**
- Pattern: `fix/{issue}`
- Example: `fix/table-state-loss`

### Pull Request Guidelines

1. Title matches commit message format
2. Description includes:
   - What changed
   - Why it changed
   - Testing done
3. Link to related issue (if any)
4. Screenshots for UI changes

## Performance Guidelines

### Bundle Size

**Target:** <100KB total
**Current:** ~50KB

**Monitor:**
- content/main.js should stay <20KB
- Each feature CSS <3KB

### Runtime Performance

**Avoid:**
- Synchronous layout thrashing (read → write → read DOM)
- Unthrottled scroll/resize listeners
- Large DOM queries in tight loops

**Optimize:**
```javascript
// ✓ Good (batch DOM reads)
const heights = elements.map(el => el.offsetHeight);
elements.forEach((el, i) => el.style.height = heights[i] + "px");

// ✗ Bad (layout thrashing)
elements.forEach(el => {
  const height = el.offsetHeight; // Read
  el.style.height = height + "px"; // Write
});
```

### Memory Management

**Clean Up Listeners:**
```javascript
disable() {
  this.observer?.disconnect();
  document.removeEventListener("keydown", this.boundHandler);
  this.boundHandler = null;
}
```

**Avoid Leaks:**
- Remove event listeners when feature disabled
- Clear intervals/timeouts
- Nullify references to DOM elements

## Accessibility

**Not Currently Prioritized** (v1.0), but future considerations:

- ARIA labels for icon buttons
- Keyboard navigation for modals
- Focus management (trap focus in modal)
- Screen reader announcements for state changes

## Localization

**Current:** English only (`_locales/en/messages.json`)

**Future Pattern:**
```json
{
  "extName": { "message": "GitHub Flex" },
  "extDescription": { "message": "Enhance GitHub interface" }
}
```

**Usage:**
```javascript
// manifest.json
"name": "__MSG_extName__"

// JavaScript
chrome.i18n.getMessage("extName");
```

## Code Review Checklist

- [ ] Follows feature module pattern
- [ ] Includes enable/disable methods
- [ ] Cleans up all side effects in disable()
- [ ] Uses chrome.runtime.getURL for CSS
- [ ] Validates external input (URLs, user data)
- [ ] Handles errors gracefully (no uncaught exceptions)
- [ ] Debounces expensive operations
- [ ] Prefixes CSS classes with `ghflex-`
- [ ] Sets unique ID for injected styles
- [ ] Logs errors with `[GitHub Flex]` prefix
- [ ] No hardcoded GitHub selectors (use semantic classes)
- [ ] Includes tests for critical paths
- [ ] Updates documentation if behavior changes

## Anti-Patterns to Avoid

### JavaScript

```javascript
// ✗ Global variables
window.myFeature = { ... };

// ✗ Modifying native prototypes
Array.prototype.myMethod = function() { ... };

// ✗ Synchronous XHR
const xhr = new XMLHttpRequest();
xhr.open("GET", url, false);

// ✗ Polling instead of events
setInterval(() => checkSomething(), 100);

// ✗ Magic numbers
setTimeout(callback, 300); // What is 300?

// ✓ Named constants
const DEBOUNCE_DELAY = 300;
setTimeout(callback, DEBOUNCE_DELAY);
```

### CSS

```css
/* ✗ !important overuse */
.ghflex-btn {
  color: blue !important;
  font-size: 14px !important;
}

/* ✗ Overly specific selectors */
body > div > div > table.markdown { ... }

/* ✗ Universal selector */
* { box-sizing: border-box; }

/* ✗ Fixed heights */
.ghflex-modal { height: 500px; } /* Doesn't scale */
```

## Enforcement

### Automated

- **Linting:** Biome checks on `pnpm lint`
- **Formatting:** Biome formats on `pnpm format`
- **Testing:** Vitest runs on `pnpm test`

### Manual

- Code review (PR approval required)
- Manual testing on GitHub
- Chrome extension validation

## Exceptions

These standards are guidelines, not absolute rules. Deviate when:
- Performance critically impacted
- External API requires different approach
- GitHub's DOM structure forces workaround
- User experience significantly improved

**Document Exceptions:**
```javascript
// NOTE: Using !important here because GitHub's inline styles have higher specificity
// and we need to override without increasing selector complexity
.ghflex-override {
  display: block !important;
}
```
