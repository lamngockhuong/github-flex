# Contributing to GitHub Flex

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/<your-username>/github-flex.git
   cd github-flex
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Create a branch:

   ```bash
   git checkout -b feat/your-feature
   ```

## Development

```bash
pnpm dev        # Build with watch mode
pnpm lint       # Check code style
pnpm lint:fix   # Auto-fix issues
pnpm test       # Run tests
pnpm build      # Production build
```

### Loading the Extension

1. Run `pnpm build`
2. Open `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `dist/` folder

## Adding a New Feature

1. Create `src/content/features/{name}.js` with `enable()` and `disable()` methods
2. Create `src/content/styles/{name}.css` if needed
3. Add default setting to `SETTINGS_DEFAULTS` in `src/shared/constants.js`
4. Register in `src/content/main.js` features object
5. Add toggle in `src/popup/popup.html` with matching ID
6. Add key to `SETTING_KEYS` in `src/popup/popup.js`

## Code Style

- Vanilla JavaScript (ES Modules)
- Follow existing patterns in the codebase
- Run `pnpm lint` before committing
- See `docs/code-standards.md` for details

## Commit Messages

Use [conventional commits](https://www.conventionalcommits.org/):

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `refactor:` code refactoring
- `test:` adding or updating tests
- `chore:` maintenance tasks

## Pull Requests

1. Ensure `pnpm lint` and `pnpm test` pass
2. Test the extension on `github.com`
3. Fill out the PR template
4. Keep PRs focused on a single change

## Reporting Issues

- Use the **Bug Report** template for bugs
- Use the **Feature Request** template for suggestions
- Include browser version, extension version, and steps to reproduce

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
