# GitHub Flex

[![Version](https://img.shields.io/github/v/release/lamngockhuong/github-flex)](https://github.com/lamngockhuong/github-flex/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Install-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/github-flex/ckoaleikkahfopnnggfnhmlgekgihdgj)

A Chrome extension that enhances GitHub's interface with productivity features.

<p align="center">
  <img src="assets/promo-banner-1280x800.svg" alt="GitHub Flex" width="640" />
</p>

## Features

- **Wide Layout** - Expands GitHub to full viewport width
- **Table Expand** - Expandable tables with persistent state
- **Image Lightbox** - Click images to view in fullscreen overlay
- **GIF Picker** - Insert GIFs in comments and issues
- **Sidebar Toggle** - Hide/show sidebar with button or `Alt+M` shortcut

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

Install directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/github-flex/ckoaleikkahfopnnggfnhmlgekgihdgj).

### From Source

```bash
git clone https://github.com/lamngockhuong/github-flex.git
cd github-flex
pnpm install
pnpm build
```

Then load in Chrome:

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder

## Development

```bash
pnpm dev        # Build with watch mode
pnpm lint       # Check code style
pnpm lint:fix   # Auto-fix issues
pnpm test       # Run tests
```

## Languages

- English (default)
- Vietnamese (Tiếng Việt)
- Japanese (日本語)

The extension automatically displays in the browser's language if supported.

## Tech Stack

- Chrome Manifest V3
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
