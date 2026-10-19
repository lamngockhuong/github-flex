---
name: github-live-test
description: Test the GitHub Flex extension against live github.com in a logged-in Playwright Chromium, to debug or verify a feature that broke because GitHub changed its DOM or CSS class names. Use when a feature "stopped working on GitHub", when selectors in src/content need fixing, or to prove a content-script fix on real pages before opening a PR. Triggers on: "tính năng X không hoạt động", "github đổi giao diện", "test trên github thật", "verify on github", "wide layout broken", "edit history broken", "selector no longer matches".
---

# Live GitHub Test

Unit tests run in Node with no DOM, so they cannot catch GitHub DOM changes. This skill drives a
real Chromium with `dist/chrome` loaded, logged in to GitHub, over CDP on port 9333
(`GHFLEX_CDP_PORT` to change it). Scripts live in `scripts/` next to this file; run them from the
repo root with `node .claude/skills/github-live-test/scripts/<name>.mjs`.

## Setup (once per machine)

```bash
pnpm install
pnpm exec playwright install chromium
```

The browser profile lives in `.playwright-profile/` (gitignored), so the GitHub login survives restarts.

**Session safety.** While the browser runs, any local process can drive the logged-in session
through the CDP port, so run `close-browser.mjs` when done. Dumped HTML can hold tokens or private
content: write it to the scratchpad or `plans/reports/` (gitignored), never to tracked paths or a PR.

## Workflow

1. **Build and launch.** `pnpm build:chrome`, then run `launch-browser.mjs [url]` **in the
   background** (it stays alive until the browser closes). It prints `READY` plus
   `LOGGED_IN as <user>` or `NOT_LOGGED_IN`.
2. **Login, if needed.** On `NOT_LOGGED_IN`, stop and ask the user to sign in in the open window
   and tell you when done. Never type credentials yourself.
3. **Enable the feature under test.** Features default per `SETTINGS_DEFAULTS` in
   `src/shared/constants.js`; a stored setting overrides it. Run `set-settings.mjs` to see the stored
   and effective settings, `set-settings.mjs <key>=true` to enable (unknown keys are rejected), `--clear` to simulate a fresh install. Rule out
   "the feature was just off" before blaming selectors.
4. **Find what no longer matches.**
   - Layout caps (Wide Layout): `probe-capped-widths.mjs --chain <urls...>` lists elements still
     limited by `max-width`, with their ancestor chain. `--css file.css` tries a candidate stylesheet
     without rebuilding.
   - Feature DOM (dialogs, buttons): `dump-element-classes.mjs <url> <selector> [out.html]` prints the
     class names inside an element. For elements that only exist after clicks, copy the pattern in
     `check-edit-history.mjs` (open the UI, then dump `outerHTML`). Prefer `[class*="..."]`: on Windows a `^`
     in a command-line selector gets dropped before it reaches Node.
5. **Fix, rebuild, restart.** After `pnpm build:chrome`, run `close-browser.mjs` and launch again.
   `chrome.runtime.reload()` does **not** bring an unpacked `--load-extension` back.
6. **Prove it.** Show before/after, not just after:
   - `git stash`, build, restart, run the check: it must fail.
   - `git stash pop`, build, restart, run the check: it must pass.
   - Wide Layout: `probe-capped-widths.mjs --toggle <urls>` shows caps return when disabled.
   - Edit History: `check-edit-history.mjs [issueUrl]` exits non-zero on failure.
7. Run `pnpm lint` and `pnpm test`, then report the before/after numbers in the PR.

## Pages worth probing

Repo home, `/blob/main/README.md`, `/tree/main/src`, `/pull/<n>`, `/pull/<n>/files`, `/issues`,
`/pulls`, `/commits/main`, `/commit/<sha>`, `/tags`, `/releases`, `/actions`, an issue such as
`https://github.com/microsoft/vscode/issues/1`, `/issues/new`, a discussion, `https://gist.github.com/`.
`https://github.com/lamngockhuong/github-flex/issues/1` has edit history.

## GitHub DOM patterns seen so far

- CSS module classes flip between `Component-module__name__hash` and `name__hash`. Match the
  stable part with `[class*="name"]`, never the `-module__` prefix.
- Some pages (repo home, code view) render in `main#ui-service-main-content` without
  `.application-main`. Scope rules to `:is(.application-main, #ui-service-main-content)`.
- Primer classes keep the `prc-<Component>-<Part>-<hash>` shape; `[class*="prc-PageLayout-Content-"]` is stable.
- Dialogs are now `[role="dialog"]` Primer dialogs, not `.Box--overlay`.

When you hit a new pattern, add it to this list.
