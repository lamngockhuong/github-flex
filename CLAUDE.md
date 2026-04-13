# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitHub Flex is a cross-browser Manifest V3 extension (Chrome & Firefox) that enhances GitHub's interface with features like wide layout, table expansion, image lightbox, GIF picker, and sidebar toggle. Uses webextension-polyfill for cross-browser API compatibility.

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Build with watch mode (unminified, both browsers)
pnpm build            # Production build (minified to dist/chrome/ and dist/firefox/)
pnpm build:chrome     # Build Chrome only
pnpm build:firefox    # Build Firefox only
pnpm lint             # Check linting with Biome
pnpm lint:firefox     # Lint Firefox build with web-ext
pnpm lint:fix         # Auto-fix linting issues
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode

# Website (landing page)
cd website
pnpm install          # Install website dependencies
pnpm dev              # Dev server at localhost:4321
pnpm build            # Production build → dist/
pnpm preview          # Preview production build
```

## Loading the Extension

### Chrome

1. Run `pnpm build:chrome`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" → select the `dist/chrome/` folder

### Firefox

1. Run `pnpm build:firefox`
2. Open `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select any file in the `dist/firefox/` folder (e.g., `manifest.json`)

## Architecture

### Extension Structure

- **Content Script** (`src/content/main.js`): Entry point injected into GitHub pages. Loads settings and initializes enabled features.
- **Service Worker / Background Script** (`src/background/service-worker.js`): Background script for install/update events (service_worker in Chrome, scripts in Firefox).
- **Popup** (`src/popup/`): Settings UI with toggle switches for each feature.
- **Shared** (`src/shared/`): Constants, storage utilities, and icons shared across contexts.

### Feature Pattern

Each feature in `src/content/features/` follows this interface:

```javascript
export const featureName = {
  enabled: false,
  enable() {
    /* inject styles, add listeners */
  },
  disable() {
    /* cleanup */
  },
};
```

Features are registered in `main.js` and toggled based on user settings stored in `browser.storage.sync` (webextension-polyfill abstracts chrome._to browser._).

### Build System

Custom esbuild script (`scripts/build.js`) bundles content script and popup JS to IIFE format targeting Chrome 88+ and Firefox 112+. Produces separate dist folders: `dist/chrome/` and `dist/firefox/` with browser-specific manifest configurations. Use `--chrome`, `--firefox` flags to build single browser, or both by default.

### Key Files

- `manifest.json`: Extension manifest (source, paths updated in dist)
- `src/shared/constants.js`: Default settings, storage keys, CSS IDs
- `src/shared/storage.js`: Cached settings getter/setter with sync storage

### Website (Landing Page)

- **Framework:** Astro 5.x + Tailwind CSS 4.x
- **i18n:** Static routes (`/`, `/ja/`, `/vi/`) with `useTranslations()` helper
- **Components:** `website/src/components/` (Header, Footer, LandingPage, etc.)
- **Hosting:** Cloudflare Pages at https://github-flex.khuong.dev
- **Constants:** `website/src/constants.ts` (store URLs, GitHub URL)

## Adding a New Feature

1. Create `src/content/features/{name}.js` with enable/disable methods
2. Create `src/content/styles/{name}.css` if needed
3. Add default to `SETTINGS_DEFAULTS` in `src/shared/constants.js`
4. Register in `src/content/main.js` features object
5. Add toggle in `src/popup/popup.html` with matching ID
6. Add key to `SETTING_KEYS` in `src/popup/popup.js`
