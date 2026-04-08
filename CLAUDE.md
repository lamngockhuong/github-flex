# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitHub Flex is a Chrome Manifest V3 extension that enhances GitHub's interface with features like wide layout, table expansion, image lightbox, GIF picker, and sidebar toggle.

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Build with watch mode (unminified)
pnpm build            # Production build (minified to dist/)
pnpm lint             # Check linting with Biome
pnpm lint:fix         # Auto-fix linting issues
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
```

## Loading the Extension

1. Run `pnpm build`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" → select the `dist/` folder

## Architecture

### Extension Structure

- **Content Script** (`src/content/main.js`): Entry point injected into GitHub pages. Loads settings and initializes enabled features.
- **Service Worker** (`src/background/service-worker.js`): Minimal background script for install/update events.
- **Popup** (`src/popup/`): Settings UI with toggle switches for each feature.
- **Shared** (`src/shared/`): Constants, storage utilities, and icons shared across contexts.

### Feature Pattern

Each feature in `src/content/features/` follows this interface:

```javascript
export const featureName = {
  enabled: false,
  enable() { /* inject styles, add listeners */ },
  disable() { /* cleanup */ },
};
```

Features are registered in `main.js` and toggled based on user settings stored in `chrome.storage.sync`.

### Build System

Custom esbuild script (`scripts/build.js`) bundles content script and popup JS to IIFE format targeting Chrome 88+. Static files (HTML, CSS, manifest) are copied with path adjustments for dist structure.

### Key Files

- `manifest.json`: Extension manifest (source, paths updated in dist)
- `src/shared/constants.js`: Default settings, storage keys, CSS IDs
- `src/shared/storage.js`: Cached settings getter/setter with sync storage

## Adding a New Feature

1. Create `src/content/features/{name}.js` with enable/disable methods
2. Create `src/content/styles/{name}.css` if needed
3. Add default to `SETTINGS_DEFAULTS` in `src/shared/constants.js`
4. Register in `src/content/main.js` features object
5. Add toggle in `src/popup/popup.html` with matching ID
6. Add key to `SETTING_KEYS` in `src/popup/popup.js`
