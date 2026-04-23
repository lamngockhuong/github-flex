# Project Overview & Product Development Requirements

## Project Identity

**Name:** GitHub Flex
**Type:** Cross-browser Extension (Manifest V3 - Chrome & Firefox) + Landing Page
**Version:** 0.0.9
**License:** MIT
**Repository:** <https://github.com/lamngockhuong/github-flex>
**Website:** <https://github-flex.ohnice.app>

## Product Vision

Enhance GitHub's web interface with productivity features while maintaining native look and feel. Target power users who spend significant time reviewing code, reading documentation, and managing issues.

## Core Value Propositions

1. **Workspace Optimization** - Remove artificial width constraints, utilize full viewport
2. **Content Expansion** - Expand tables/images without navigation disruption
3. **Media Integration** - Streamline GIF insertion in comments/discussions
4. **Focus Enhancement** - Toggle UI elements for distraction-free reading

## Target Users

- Developers reviewing large diffs or wide code tables
- Technical writers working with markdown documentation
- Issue/PR triagers managing high volumes
- OSS maintainers spending 4+ hours daily on GitHub

## Product Requirements

### Functional Requirements

#### FR1: Wide Layout

- **Description:** Expand GitHub to full viewport width
- **Scope:** Repository files, issues, PRs, discussions, gists
- **Trigger:** User enables in settings
- **Constraint:** Must not break GitHub's responsive breakpoints
- **Success Metric:** Content utilizes >90% viewport width on 1920px+ displays

#### FR2: Table Expand

- **Description:** Add expand/collapse controls and column resize to markdown tables
- **Features:**
  - Inline expand (removes horizontal scroll)
  - Fullscreen mode with Esc key exit
  - Persistent expand state per-page (localStorage)
  - Drag-to-resize column widths via header border handles
  - Column widths persisted by header structure (shared across pages with identical columns)
- **Scope:** All `.markdown-body table` elements
- **Success Metric:** Tables >1200px wide become readable without horizontal scroll; column widths customizable and persistent

#### FR3: Image Lightbox

- **Description:** Click images for fullscreen overlay with zoom/pan
- **Features:**
  - Mouse wheel zoom (0.1x - 10x range)
  - Click-drag pan when zoomed
  - Click overlay to close
- **Scope:** Images in markdown bodies, comments, descriptions
- **Success Metric:** Images viewable at actual resolution without new tab

#### FR4: GIF Picker

- **Description:** Search and insert GIFs into comments
- **Features:**
  - Modal triggered by GIF button in comment toolbars
  - Search via Cloudflare Worker proxy (<https://github-gifs.aldilaff6545.workers.dev>)
  - Vietnamese text normalization (tieng viet → tiếng việt)
  - Markdown injection sanitization
  - Service worker proxy bypasses GitHub CSP for image display
- **Scope:** Comment textareas, issue/PR descriptions, GitHub Issues (React-based editors)
- **Security:** Service worker validates URLs (giphy.com/giphycdn.com only), content script validates again, CSP enforced via blob: URLs only
- **Success Metric:** GIF insertion <5 seconds from search to markdown output
- **CSP Bypass:** Service worker fetches images with base64 encoding; content script creates blob: URLs (allowed by CSP)

#### FR5: Sidebar Toggle

- **Description:** Toggle sidebar visibility for focused reading
- **Features:**
  - Alt+M keyboard shortcut
  - Persistent state per-page (localStorage)
  - Button toggle in repository navigation
- **Scope:** Repository pages with sidebar
- **Success Metric:** Content area expands to 100% width when sidebar hidden

#### FR6: Edit History

- **Description:** Enhanced diff viewer for comment/issue/PR description edits
- **Features:**
  - Widens GitHub's native edit history modal (90vw, max 1400px)
  - "Split View" button injected into edit history dialog header
  - Three view modes: Split (side-by-side), Unified (inline), Preview (rendered markdown)
  - Word-level diff highlighting (added/removed/unchanged)
  - Synced scrolling between panes in split view
  - Markdown preview with diff annotations
  - Word count statistics (+N −N words)
  - Esc key / backdrop click to close
- **Scope:** GitHub's edit history dialogs (comments, issues, PRs, discussions)
- **Constraint:** Relies on GitHub's internal CSS class names; may break on GitHub updates
- **Default:** Disabled (opt-in via settings)
- **Success Metric:** Users can compare edits with word-level precision in <2 seconds
- **Dependencies:** `diff` library (runtime) for word-level diff computation

### Non-Functional Requirements

#### NFR1: Performance

- **Page Load Impact:** <100ms delay to document_idle
- **Feature Activation:** <50ms per feature enable/disable
- **Memory Footprint:** <5MB extension overhead
- **GIF Search:** <1s latency for API responses

#### NFR2: Compatibility

- **Chrome Version:** 88+ (Manifest V3 baseline)
- **Firefox Version:** 112+ (Manifest V3 support)
- **GitHub:** github.com and gist.github.com
- **Conflict Handling:** Graceful degradation if GitHub updates DOM structure
- **Cross-browser API:** webextension-polyfill abstracts browser-specific APIs

#### NFR3: Reliability

- **Error Handling:** Silent failure with console logging
- **State Recovery:** localStorage fallback if corrupt
- **API Failures:** Show error message in GIF picker, don't crash

#### NFR4: Security

- **Permissions:** Minimal scope (storage + github.com hosts only)
- **Content Security:** No eval(), no inline scripts
- **URL Validation:** Strict whitelist for external media
- **Sanitization:** Escape user input in markdown generation

#### NFR5: Maintainability

- **Code Size:** Individual files <200 LOC target (current: 20-349 range; Edit History split across 5 files)
- **Dependencies:** One runtime dependency (`diff`); dev-only: esbuild, biome, vitest
- **Build Time:** <2s full rebuild
- **Test Coverage:** Critical paths (GIF sanitization, table state persistence)

## Technical Constraints

### Browser APIs

- Manifest V3 for Chrome 88+ and Firefox 112+
- Chrome: service_worker background model; Firefox: background scripts
- browser.storage.sync for cross-device settings (via webextension-polyfill)
- localStorage for per-page ephemeral state

### GitHub Integration

- SPA navigation (MutationObserver required)
- Dynamic DOM (feature detection, not hardcoded selectors)
- No GitHub API usage (pure DOM manipulation)

### External Services

- GIF API: Cloudflare Worker proxy at <https://github-gifs.aldilaff6545.workers.dev>
- No analytics, tracking, or telemetry
- Offline mode: All features work except GIF search

## Architecture Decisions

### AD1: Vanilla JavaScript

**Decision:** No framework dependencies
**Rationale:** Minimize bundle size, reduce API surface for breaking changes
**Trade-off:** Manual DOM management vs framework abstractions

### AD2: Feature Toggle Architecture

**Decision:** Each feature = `{ enabled, enable(), disable() }` interface
**Rationale:** Hot enable/disable without page reload, clear ownership boundaries
**Trade-off:** More boilerplate vs monolithic approach

### AD3: CSS Injection via chrome.runtime.getURL

**Decision:** Link external stylesheets, not inline `<style>`
**Rationale:** CSP compliance, easier feature cleanup
**Trade-off:** Extra file reads vs inline performance

### AD4: localStorage for Per-Page State

**Decision:** Store table expand/zen mode state per-pathname
**Rationale:** Ephemeral state shouldn't sync across devices
**Trade-off:** Lost on clear browsing data vs chrome.storage.local

### AD5: Cloudflare Worker Proxy for GIF API

**Decision:** Don't call Giphy API directly from extension
**Rationale:** Avoid exposing API keys in source, rate limit control
**Trade-off:** Single point of failure vs distributed clients

## Success Criteria

### Launch Criteria (v1.0)

- [ ] All 6 features functional on github.com and gist.github.com
- [ ] Settings UI in popup toggles features without reload
- [ ] Zero console errors on top 10 GitHub repos
- [x] Chrome Web Store listing approved
- [ ] README with installation instructions

### Post-Launch Metrics (v1.1+)

- User count: 100+ weekly active users within 3 months
- Performance: <5% CPU usage during idle
- Crash rate: <0.1% sessions
- GitHub compatibility: Update required <2x per year

## Out of Scope (v1.0)

- Safari support (Manifest V3 limited to Chrome/Firefox)
- GitHub Enterprise compatibility
- Offline GIF library
- Settings import/export
- Telemetry/analytics
- Auto-updates via Web Store (manual sideloading only)

## Roadmap

### Phase 1: Core Features (Complete)

- Wide Layout ✓
- Table Expand ✓
- Image Lightbox ✓
- GIF Picker ✓
- Sidebar Toggle ✓
- Edit History ✓

### Phase 2: Polish (Current)

- Documentation
- Test coverage
- Chrome Web Store submission
- Landing page (Astro + i18n) ✓

### Phase 3: Enhancements (Future)

- Keyboard shortcuts configuration
- Export/import settings
- Theme support (dark mode adjustments)
- Additional markdown tools (table of contents, etc.)

## Dependencies

### Build-time

- esbuild 0.28.0 (bundler)
- @biomejs/biome 2.4.10 (linter/formatter)
- vitest 4.1.3 + @vitest/coverage-v8 (testing)

### Runtime

- Chrome 88+ or Firefox 112+ (Manifest V3)
- webextension-polyfill 0.12.0+
- diff (word-level diff computation for Edit History)
- Cloudflare Worker at <https://github-gifs.aldilaff6545.workers.dev>

### Website (Landing Page)

- Astro 5.x (SSG framework)
- Tailwind CSS 4.x (styling)
- GitHub Pages (hosting)

### System

- Node.js 18+
- pnpm 10.33.0+

## Risk Assessment

| Risk                                    | Likelihood | Impact | Mitigation                                                 |
| --------------------------------------- | ---------- | ------ | ---------------------------------------------------------- |
| GitHub DOM changes break features       | High       | High   | Use semantic selectors, regular testing, feature detection |
| Edit History dialog selectors change    | High       | Medium | Feature disabled by default; relies on CSS module classes  |
| GIF API proxy downtime                  | Medium     | Low    | Show error message, feature degrades gracefully            |
| Chrome Web Store rejection              | Low        | High   | Follow all manifest V3 guidelines, minimal permissions     |
| Performance regression on large pages   | Medium     | Medium | Lazy initialization, debounced observers                   |
| Security vulnerability in GIF insertion | Low        | High   | Strict URL validation, markdown escaping                   |
| Large diff overflows memory             | Low        | Medium | Edit History enforces 100KB max diff size limit            |

## Compliance & Security

### Chrome Web Store Policy

- Single purpose: GitHub interface enhancement
- Minimal permissions (storage + github.com hosts)
- No remote code execution
- Privacy policy not required (no data collection)

### Content Security Policy

- No eval() or inline scripts
- All resources bundled or loaded via chrome.runtime.getURL
- External requests only to whitelisted GIF API

### Data Handling

- Settings stored in chrome.storage.sync (user-controlled)
- Per-page state in localStorage (ephemeral)
- No data sent to third parties except GIF search queries
- No analytics or tracking

## Documentation Standards

All docs in `./docs/` follow these rules:

- Max 800 LOC per file
- Markdown format
- Code references verified against actual implementation
- Internal links use relative paths `./filename.md`
- No assumptions about unverified code behavior

## Acceptance Criteria

A feature is considered complete when:

1. Implemented per functional requirements
2. Passes all relevant tests
3. No console errors in normal operation
4. Enable/disable works without page reload
5. Settings persist across browser sessions
6. Compatible with latest GitHub stable release
7. Documented in relevant docs files
