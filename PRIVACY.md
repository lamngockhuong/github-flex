# Privacy Policy

**GitHub Flex** is a Chrome extension that enhances GitHub's interface. Your privacy matters — here's what you need to know.

## Data Collection

GitHub Flex does **not** collect, store, or transmit any personal data. Specifically:

- No personal information is collected
- No browsing history is tracked
- No analytics or telemetry is sent
- No cookies are set by the extension
- No user accounts or sign-ins are required

## Data Storage

The extension stores only your **feature toggle preferences** (e.g., wide layout on/off) using `chrome.storage.sync`. This data:

- Contains only boolean settings (true/false for each feature)
- Is stored locally on your device and synced via your Chrome profile
- Is never sent to any external server
- Can be cleared at any time by uninstalling the extension

## Network Requests

The extension makes **no network requests** except when using the **GIF Picker** feature:

- GIF search queries are sent to a Cloudflare Workers proxy, which fetches results from the Giphy API
- Only the search query text is transmitted — no user identifiers, tokens, or personal data
- GIF image data is fetched to bypass GitHub's Content Security Policy

No other feature makes any external network request.

## Permissions

| Permission | Purpose |
|---|---|
| `storage` | Save and sync user preferences (feature toggles) |
| `host_permissions` (github.com, gist.github.com) | Inject content scripts to modify GitHub's interface; fetch GIF images in background |

## Third-Party Services

- **Giphy** (via Cloudflare Workers proxy): Used solely for GIF search in the GIF Picker feature. Subject to [Giphy's Privacy Policy](https://support.giphy.com/hc/en-us/articles/360032872931-GIPHY-Privacy-Policy).

## Changes

If this policy changes, updates will be posted in this file and included in the release notes.

## Contact

Questions or concerns? Open an issue at [github.com/lamngockhuong/github-flex/issues](https://github.com/lamngockhuong/github-flex/issues).
