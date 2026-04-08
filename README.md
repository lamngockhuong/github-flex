# GitHub Flex

A Chrome extension that enhances GitHub's interface with productivity features.

## Features

- **Wide Layout** - Expands GitHub to full viewport width
- **Table Expand** - Expandable tables with persistent state
- **Image Lightbox** - Click images to view in fullscreen overlay
- **GIF Picker** - Insert GIFs in comments and issues
- **Sidebar Toggle** - Hide/show sidebar with button or `Alt+M` shortcut

## Installation

### From Source

```bash
# Clone the repository
git clone https://github.com/lamngockhuong/github-flex.git
cd github-flex

# Install dependencies
pnpm install

# Build the extension
pnpm build
```

### Load in Chrome

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

## Tech Stack

- Chrome Manifest V3
- Vanilla JavaScript (ES Modules)
- esbuild (bundler)
- Biome (linter/formatter)
- Vitest (testing)

## License

MIT
