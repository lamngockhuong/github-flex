# GitHub Flex

[![Version](https://img.shields.io/github/v/release/lamngockhuong/github-flex)](https://github.com/lamngockhuong/github-flex/releases)
[![CI](https://github.com/lamngockhuong/github-flex/actions/workflows/ci.yml/badge.svg)](https://github.com/lamngockhuong/github-flex/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Install-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/github-flex/iechckkdnjmdnpbdohhnmojofcbfnemc)
[![Firefox Add-ons](https://img.shields.io/badge/Firefox_Add--ons-Install-FF7139?logo=firefox&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/github-flex/)
[![Website](https://img.shields.io/badge/Website-github--flex.khuong.dev-8957e5?logo=astro&logoColor=white)](https://github-flex.khuong.dev)

<a href="https://unikorn.vn/p/github-flex?ref=embed-github-flex" target="_blank"><img src="https://unikorn.vn/api/widgets/badge/github-flex?theme=light" alt="GitHub Flex trên Unikorn.vn" style="width: 180px; height: 45px;" width="180" height="45" /></a>
<a href="https://launch.j2team.dev/products/github-flex-enhance-your-github-experience?utm_source=badge-launched&utm_medium=badge&utm_campaign=badge-github-flex-enhance-your-github-experience" target="_blank"><img src="https://launch.j2team.dev/badge/github-flex-enhance-your-github-experience/light" alt="GitHub Flex - Launched on J2TEAM Launch" style="width: 180px; height: 45px;" width="180" height="45" /></a>

A cross-browser extension (Chrome & Firefox) that enhances GitHub's interface with productivity features.

<p align="center">
  <img src="assets/promo-banner-1280x800.svg" alt="GitHub Flex" width="640" />
</p>

## Features

- **Wide Layout** - Expands GitHub to full viewport width
- **Table Expand** - Expandable tables with persistent state
- **Image Lightbox** - Click images to view in fullscreen overlay
- **GIF Picker** - Insert GIFs in comments and issues
- **Sidebar Toggle** - Hide/show sidebar with button or `Alt+M` shortcut
- **Edit History** - Enhanced diff viewer with split/unified/preview modes for comment edits

<p align="center">
  <img src="assets/promo-02-wide-layout-1280x800.svg" alt="Wide Layout" width="400" />
  <img src="assets/promo-03-lightbox-1280x800.svg" alt="Image Lightbox" width="400" />
</p>
<p align="center">
  <img src="assets/promo-04-gif-picker-1280x800.svg" alt="GIF Picker" width="400" />
  <img src="assets/promo-05-sidebar-toggle-1280x800.svg" alt="Sidebar Toggle" width="400" />
</p>

## Installation

### Chrome Web Store

Install directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/github-flex/iechckkdnjmdnpbdohhnmojofcbfnemc).

### Firefox Add-ons

Install directly from [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/github-flex/).

### From Source

```bash
git clone https://github.com/lamngockhuong/github-flex.git
cd github-flex
pnpm install
pnpm build
```

Then load in your browser:

**Chrome:**

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/chrome/` folder

**Firefox:**

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select any file in the `dist/firefox/` folder

## Development

```bash
pnpm dev              # Build both browsers with watch mode
pnpm build            # Production build for both browsers
pnpm build:chrome     # Build Chrome only
pnpm build:firefox    # Build Firefox only
pnpm lint             # Check code style
pnpm lint:fix         # Auto-fix issues
pnpm lint:firefox     # Lint Firefox build with web-ext
pnpm test             # Run tests
```

### Publishing to Firefox Add-ons

When submitting a new version to [Firefox Add-ons](https://addons.mozilla.org/), Mozilla requires source code upload because we use esbuild to bundle. Create the source zip with:

```bash
zip -r github-flex-source.zip src/ scripts/ package.json pnpm-lock.yaml biome.json README.md LICENSE manifest.json
```

## Languages

- English (default)
- Vietnamese (Tiếng Việt)
- Japanese (日本語)

The extension automatically displays in the browser's language if supported.

## Tech Stack

- Manifest V3 (Chrome 88+, Firefox 112+)
- webextension-polyfill (cross-browser API compatibility)
- Vanilla JavaScript (ES Modules)
- esbuild (bundler)
- Biome (linter/formatter)
- Vitest (testing)

## Sponsor

If you find this extension useful, consider supporting its development:

[![GitHub Sponsors](https://img.shields.io/badge/GitHub_Sponsors-Support-ea4aaa?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/lamngockhuong)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-Support-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/lamngockhuong)
[![MoMo](https://img.shields.io/badge/MoMo-Support-ae2070)](https://me.momo.vn/khuong)

## License

[MIT](LICENSE)
