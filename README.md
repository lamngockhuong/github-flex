🇬🇧 **English** | 🇻🇳 [Tiếng Việt](README.vi.md) | 🇯🇵 [日本語](README.ja.md)

# GitHub Flex

<p align="center">
  <a href="https://chromewebstore.google.com/detail/github-flex/iechckkdnjmdnpbdohhnmojofcbfnemc">
    <img src="https://img.shields.io/chrome-web-store/v/iechckkdnjmdnpbdohhnmojofcbfnemc?label=chrome&style=flat-square&logo=googlechrome&logoColor=white&color=4285F4" alt="Chrome Web Store Version">
  </a>
  <a href="https://chromewebstore.google.com/detail/github-flex/iechckkdnjmdnpbdohhnmojofcbfnemc">
    <img src="https://img.shields.io/chrome-web-store/users/iechckkdnjmdnpbdohhnmojofcbfnemc?style=flat-square&color=6ee7b7" alt="Chrome Web Store Users">
  </a>
  <a href="https://chromewebstore.google.com/detail/github-flex/iechckkdnjmdnpbdohhnmojofcbfnemc">
    <img src="https://img.shields.io/chrome-web-store/rating/iechckkdnjmdnpbdohhnmojofcbfnemc?style=flat-square&color=facc15" alt="Chrome Web Store Rating">
  </a>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/github-flex/">
    <img src="https://img.shields.io/amo/v/github-flex?label=firefox&style=flat-square&logo=firefox&logoColor=white&color=FF7139" alt="Firefox Add-on Version">
  </a>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/github-flex/">
    <img src="https://img.shields.io/amo/users/github-flex?style=flat-square&color=6ee7b7" alt="Firefox Add-on Users">
  </a>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/github-flex/">
    <img src="https://img.shields.io/amo/rating/github-flex?style=flat-square&color=facc15" alt="Firefox Add-on Rating">
  </a>
  <a href="https://github.com/lamngockhuong/github-flex/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/lamngockhuong/github-flex/ci.yml?style=flat-square&label=CI&color=22c55e" alt="CI">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/lamngockhuong/github-flex?style=flat-square&color=60a5fa" alt="MIT License">
  </a>
  <a href="https://github.com/lamngockhuong/github-flex/stargazers">
    <img src="https://img.shields.io/github/stars/lamngockhuong/github-flex?style=flat-square&color=f59e0b" alt="GitHub Stars">
  </a>
</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/github-flex/iechckkdnjmdnpbdohhnmojofcbfnemc">
    <img src="https://img.shields.io/badge/Install_from-Chrome_Web_Store-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Install from Chrome Web Store">
  </a>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/github-flex/">
    <img src="https://img.shields.io/badge/Install_from-Firefox_Add--ons-FF7139?style=for-the-badge&logo=firefox&logoColor=white" alt="Install from Firefox Add-ons">
  </a>
  <a href="https://github-flex.ohnice.app">
    <img src="https://img.shields.io/badge/Visit-Website-8957e5?style=for-the-badge&logo=astro&logoColor=white" alt="Website">
  </a>
</p>

<p align="center">
  <a href="https://unikorn.vn/p/github-flex?ref=embed-github-flex" target="_blank"><img src="https://unikorn.vn/api/widgets/badge/github-flex?theme=light" alt="GitHub Flex on Unikorn.vn" style="width: 180px; height: 45px;" width="180" height="45" /></a>
  <a href="https://launch.j2team.dev/products/github-flex-enhance-your-github-experience?utm_source=badge-launched&utm_medium=badge&utm_campaign=badge-github-flex-enhance-your-github-experience" target="_blank"><img src="https://launch.j2team.dev/badge/github-flex-enhance-your-github-experience/light" alt="GitHub Flex - Launched on J2TEAM Launch" style="width: 180px; height: 45px;" width="180" height="45" /></a>
</p>

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

## Other Projects

- [Termote](https://github.com/lamngockhuong/termote) - Remote control CLI tools (Claude Code, GitHub Copilot, any terminal) from mobile/desktop via PWA
- [TabRest](https://github.com/lamngockhuong/tabrest) - Chrome extension that automatically unloads inactive tabs to free memory

## License

[MIT](LICENSE)
