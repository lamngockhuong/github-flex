# Project Changelog

Release history remains in the auto-generated [root changelog](../CHANGELOG.md). This file records completed project changes before their next release entry is generated.

## Unreleased - 2026-09-29

### Security

- Edit-history preview no longer copies `id`, `class`, or `name` from comment HTML, so another user's comment cannot pick up the extension's fixed full-viewport styles and paint over the real UI.
- Table state stores are prototype-less, so a header named `__proto__` or `constructor` no longer reads an inherited value.
- Service-worker proxies no longer trust redirects: the GIF API fetch refuses them, and GIPHY image fetches re-check the final URL.
- Website deploy workflow grants Pages write and OIDC only to the deploy job; Renovate now pins GitHub Actions to commit digests.

## Unreleased - 2026-08-18

### Changed

- Refreshed Vietnamese wording in the README, extension locale, landing page, and Chrome/Firefox store-listing docs for a more natural and consistent voice.
- Localized Unikorn.vn and J2TEAM Launch badge alt text in English, Vietnamese, and Japanese, removing the hard-coded Vietnamese text from shared markup.
- Corrected Vietnamese descriptions of Termote and Specpin, and kept GitHub domain nouns (repository, issue, pull request) untranslated for developer readability.
- Added the edit history feature to the Japanese landing-page meta and hero copy so all three locales describe the same feature set.
