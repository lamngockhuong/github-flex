# Project Roadmap

## Current Status

**Version:** 1.0.0
**Phase:** Documentation & Testing
**Target Release:** Q2 2026

## Project Milestones

### Phase 1: Core Features ✓ (Complete)
**Timeline:** Jan 2026 - Mar 2026
**Status:** 100% Complete

#### Delivered Features
- [x] Wide Layout - Full viewport expansion (36 LOC)
- [x] Table Expand - Expandable tables with fullscreen (211 LOC)
- [x] Image Lightbox - Click-to-zoom with pan (316 LOC)
- [x] GIF Picker - Search and insert GIFs (575 LOC)
- [x] Zen Mode - Sidebar toggle with Alt+M (295 LOC)

#### Technical Achievements
- [x] Chrome Manifest V3 architecture
- [x] Feature toggle pattern (enable/disable without reload)
- [x] MutationObserver for SPA navigation
- [x] chrome.storage.sync for cross-device settings
- [x] localStorage for per-page state persistence
- [x] Build system (esbuild with watch mode)
- [x] Linting/formatting (Biome)
- [x] Test framework setup (Vitest)

#### External Services
- [x] Cloudflare Worker GIF API proxy deployed
- [x] Vietnamese text normalization (50+ mappings)
- [x] URL validation and markdown sanitization

### Phase 2: Polish & Release 🔄 (Current)
**Timeline:** Apr 2026 - May 2026
**Status:** 40% Complete

#### Documentation
- [x] Project overview and PDR (`project-overview-pdr.md`)
- [x] Codebase summary (`codebase-summary.md`)
- [x] Code standards (`code-standards.md`)
- [x] System architecture (`system-architecture.md`)
- [x] Project roadmap (`project-roadmap.md`)
- [ ] User guide with screenshots
- [ ] Troubleshooting FAQ
- [ ] Contributor guidelines

#### Testing
- [ ] Unit tests for storage utilities
- [ ] Unit tests for GIF picker (URL validation, sanitization)
- [ ] Unit tests for table expand state persistence
- [ ] Integration tests for feature lifecycle
- [ ] Manual testing on top 20 GitHub repos
- [ ] Edge case testing (large tables, many images, slow network)
- [ ] Target: 70% code coverage

#### Quality Assurance
- [ ] Cross-browser testing (Chrome 88+, latest stable)
- [ ] Performance profiling (memory, CPU on active pages)
- [ ] Accessibility audit (keyboard navigation, ARIA)
- [ ] Security review (input validation, CSP compliance)
- [ ] Code review checklist finalization

#### Packaging
- [ ] Icon design (16/48/128px)
- [ ] Promo images (1400x560, 440x280, 920x680, 640x400)
- [ ] Screenshot capture (5 images showing features)
- [ ] Privacy policy (even though no data collection)
- [ ] Chrome Web Store listing draft

#### Release Preparation
- [ ] Version bump to 1.0.0
- [ ] Changelog finalization
- [ ] Build production bundle (`pnpm build`)
- [ ] Zip dist/ for Web Store upload
- [ ] Test sideloaded production build

### Phase 3: Chrome Web Store Launch 📅 (Planned)
**Timeline:** May 2026
**Status:** 0% Complete

#### Pre-Launch Checklist
- [ ] Developer account registration ($5 one-time fee)
- [ ] Verify all manifest requirements met
- [ ] Prepare store listing:
  - [ ] Title: "GitHub Flex - Interface Enhancements"
  - [ ] Short description (132 chars max)
  - [ ] Detailed description (with feature bullets)
  - [ ] Category: Productivity
  - [ ] Language: English
- [ ] Upload screenshots and promo images
- [ ] Set visibility: Public
- [ ] Submit for review

#### Launch Activities
- [ ] Monitor review status (1-3 days typical)
- [ ] Address any rejection feedback
- [ ] Announce on:
  - [ ] GitHub repository README
  - [ ] Personal blog/portfolio
  - [ ] Relevant subreddits (r/chrome, r/github)
  - [ ] Twitter/X (if applicable)

#### Post-Launch Monitoring
- [ ] Track install count (Chrome Developer Dashboard)
- [ ] Monitor user reviews
- [ ] Address critical bugs within 24 hours
- [ ] Collect feature requests (GitHub Issues)

### Phase 4: Enhancements & Community 📅 (Planned)
**Timeline:** Jun 2026 - Q3 2026
**Status:** 0% Complete

#### High-Priority Features
- [ ] Keyboard shortcuts configuration UI
- [ ] Settings export/import (JSON file)
- [ ] Theme support (detect GitHub dark mode, adjust styles)
- [ ] Markdown table of contents generator
- [ ] Code block expand/collapse
- [ ] File tree pinning (sticky file navigation)

#### Performance Optimizations
- [ ] Intersection Observer for lazy feature activation
- [ ] Virtual scrolling for GIF picker results
- [ ] Throttled MutationObserver on large pages
- [ ] Cached GIF search results (localStorage)
- [ ] Compressed CSS (minification)

#### Developer Experience
- [ ] Automated E2E tests (Puppeteer/Playwright)
- [ ] CI/CD pipeline (GitHub Actions)
  - [ ] Lint on PR
  - [ ] Test on PR
  - [ ] Build on release tag
  - [ ] Auto-publish to Web Store (via API)
- [ ] Development guide for contributors
- [ ] Issue templates (bug report, feature request)

#### Community Building
- [ ] Publish on Product Hunt
- [ ] Create demo video (YouTube)
- [ ] Write blog post: "Building a Chrome Extension in 2026"
- [ ] Engage with users (respond to issues within 48 hours)
- [ ] Consider sponsorships/donations (GitHub Sponsors)

### Phase 5: Platform Expansion 📅 (Future)
**Timeline:** Q4 2026+
**Status:** 0% Complete

#### Firefox Support
- [ ] Port to Manifest V2 (Firefox doesn't fully support V3)
- [ ] Test on Firefox Developer Edition
- [ ] Submit to Firefox Add-ons
- [ ] Maintain parity between Chrome/Firefox versions

#### Safari Support (if feasible)
- [ ] Evaluate Safari Extension requirements
- [ ] Convert manifest format
- [ ] Test on Safari Technology Preview
- [ ] Submit to App Store (requires Apple Developer account)

#### GitHub Enterprise
- [ ] Add host_permissions configuration UI
- [ ] Allow users to specify custom GitHub domains
- [ ] Test on GitHub Enterprise demo
- [ ] Document enterprise setup

#### Mobile (low priority)
- [ ] Investigate Chrome Android extension support
- [ ] If supported: port and test
- [ ] If not: consider bookmarklet alternative

## Version History

### v1.0.0 (Target: May 2026)
**First Public Release**

Features:
- Wide Layout
- Table Expand with fullscreen
- Image Lightbox with zoom/pan
- GIF Picker with Vietnamese normalization
- Zen Mode with Alt+M shortcut

Technical:
- Chrome Manifest V3
- Vanilla JavaScript (zero runtime dependencies)
- Feature toggle architecture
- Cloudflare Worker GIF API proxy

### v0.1.0 (Mar 2026)
**Internal Alpha**

- Initial feature implementations
- Basic build system
- Manual testing on personal repositories

## Feature Backlog

### Under Consideration
| Feature          | Priority | Complexity | Est. LOC | Notes                           |
| ---------------- | -------- | ---------- | -------- | ------------------------------- |
| Code folding     | High     | Medium     | ~150     | Collapse long code blocks       |
| Sticky file tree | High     | Low        | ~80      | Pin navigation during scroll    |
| TOC generator    | Medium   | Medium     | ~200     | Auto-generate table of contents |
| Custom shortcuts | Medium   | High       | ~300     | Configurable keyboard bindings  |
| Diff expand      | Medium   | Low        | ~100     | Expand wide diffs in PRs        |
| Issue templates  | Low      | Medium     | ~250     | Quick issue creation            |
| Emoji picker     | Low      | Low        | ~150     | Similar to GIF picker           |
| Link preview     | Low      | High       | ~400     | Hover to preview linked issues  |

### Rejected Features
| Feature                         | Reason                               |
| ------------------------------- | ------------------------------------ |
| GitHub API integration          | Requires auth, increases complexity  |
| Real-time collaboration         | Out of scope (GitHub has this)       |
| AI-powered code review          | Too resource-intensive for extension |
| Custom themes beyond dark/light | Too much maintenance burden          |
| Notification system             | GitHub already provides this         |

## Success Metrics

### v1.0 Launch Goals (3 months post-release)
- **Installs:** 100+ weekly active users
- **Rating:** 4.0+ stars on Chrome Web Store
- **Reviews:** 10+ positive reviews
- **Issues:** <5 open bugs
- **Performance:** <5% CPU usage on active GitHub pages
- **Crash Rate:** <0.1% sessions

### v1.1 Growth Goals (6 months post-release)
- **Installs:** 500+ weekly active users
- **Rating:** 4.5+ stars
- **Contributions:** 3+ external contributors
- **Feature Requests:** Prioritized backlog of 20+ items
- **Documentation:** Complete user guide with video tutorials

### Long-Term Vision (1+ year)
- **Installs:** 5,000+ weekly active users
- **Platforms:** Chrome, Firefox, Safari
- **Community:** Active GitHub Discussions or Discord
- **Sustainability:** Sponsorships covering hosting costs (GIF API)
- **Recognition:** Featured on Chrome Web Store, GitHub blog, or developer communities

## Risk Management

### Technical Risks

| Risk                                  | Likelihood | Impact   | Mitigation                                                       |
| ------------------------------------- | ---------- | -------- | ---------------------------------------------------------------- |
| GitHub DOM changes break features     | High       | High     | Regular testing, semantic selectors, feature detection           |
| Chrome Web Store rejection            | Medium     | High     | Follow all guidelines, minimal permissions, clear privacy policy |
| GIF API proxy downtime                | Medium     | Low      | Monitor uptime, show user-friendly error, consider fallback API  |
| Performance regression on large pages | Medium     | Medium   | Performance profiling, lazy loading, throttling                  |
| Security vulnerability discovered     | Low        | Critical | Rapid patch release, security advisory, version deprecation      |

### Operational Risks

| Risk                           | Likelihood | Impact | Mitigation                                                         |
| ------------------------------ | ---------- | ------ | ------------------------------------------------------------------ |
| Sole maintainer burnout        | Medium     | High   | Document everything, encourage contributors, set boundaries        |
| User support overwhelming      | Low        | Medium | Clear docs, FAQ, issue templates, community moderation             |
| API costs exceed budget        | Low        | Medium | Monitor usage, implement rate limits, consider sponsorships        |
| Legal issues (trademark, DMCA) | Very Low   | High   | Use generic name, respect GitHub ToS, respond promptly to requests |

## Dependencies

### Critical External Services
- **Cloudflare Worker:** GIF API proxy
  - Uptime: 99.9% (Cloudflare SLA)
  - Cost: Free tier (100k requests/day)
  - Backup: None (feature degrades gracefully)

### Development Tools
- **esbuild:** Bundler (MIT license)
- **Biome:** Linter/formatter (MIT license)
- **Vitest:** Test framework (MIT license)
- **pnpm:** Package manager (MIT license)

### Platform Dependencies
- **Chrome:** Browser engine (frequent updates, breaking changes possible)
- **GitHub:** Host platform (DOM structure changes frequently)
- **Chrome Web Store:** Distribution platform (review process, policies)

## Communication Plan

### Release Announcements
- **GitHub Releases:** Detailed changelog with links
- **Chrome Web Store:** "What's New" section
- **Repository README:** Version badge and feature list
- **Social Media:** Twitter/X, LinkedIn, Reddit (if appropriate)

### User Feedback Channels
- **Primary:** GitHub Issues (bug reports, feature requests)
- **Secondary:** Chrome Web Store reviews (monitor and respond)
- **Future:** GitHub Discussions or Discord (community support)

### Developer Updates
- **Changelog:** Updated with every release (`docs/project-changelog.md`)
- **Commit Messages:** Conventional Commits format
- **PRs:** Require description, linked issue, screenshots (if UI change)

## Maintenance Commitment

### Active Development (Current - Q3 2026)
- **Frequency:** Weekly updates
- **Bug Fixes:** Within 48 hours for critical, 1 week for non-critical
- **Feature Requests:** Triage within 1 week, implement based on priority
- **Support:** Respond to issues within 24 hours

### Maintenance Mode (Q4 2026+)
- **Frequency:** Monthly or as-needed updates
- **Bug Fixes:** Within 1 week for critical, best-effort for non-critical
- **Feature Requests:** Community contributions welcome, slower review
- **Support:** Best-effort response within 1 week

### Long-Term Sustainability
- **Open Source:** MIT license, forks encouraged
- **Documentation:** Comprehensive guides for contributors
- **Succession Plan:** Identify co-maintainers by end of 2026
- **Archival:** If abandoned, archive repository with clear notice

## Lessons Learned (Ongoing)

### What Worked Well
- **Feature Toggle Pattern:** Easy to enable/disable without reload
- **Vanilla JavaScript:** Zero dependencies, minimal bundle size
- **MutationObserver:** Reliable SPA navigation detection
- **Colocated Tests:** Easy to find and maintain
- **Biome:** Fast linting/formatting, better than ESLint+Prettier

### Challenges Faced
- **GitHub DOM Changes:** Frequent updates require regular testing
- **GIF Picker Complexity:** 575 LOC for single feature (too large?)
- **Vietnamese Normalization:** Manual mapping tedious, consider library
- **Testing Content Scripts:** Hard to mock Chrome APIs, manual testing heavy
- **Documentation Timing:** Should have written docs during development, not after

### Future Improvements
- **Automated Testing:** Invest in E2E tests early
- **Incremental Documentation:** Update docs with each feature
- **Modular GIF Picker:** Split into API, UI, state modules
- **Vietnamese Library:** Use external normalization library if exists
- **Feature Flags:** Add debug mode for easier troubleshooting

## Contributing

### How to Contribute
Currently in pre-release phase. Contributions welcome after v1.0 launch.

**Future Contribution Areas:**
- Bug fixes (always welcome)
- Performance improvements
- New features (discuss in issue first)
- Documentation improvements
- Translations (i18n - currently English, Japanese, Vietnamese)

**Contributor Expectations:**
- Follow code standards in `docs/code-standards.md`
- Write tests for new features
- Update documentation
- Use conventional commit messages
- Respond to code review feedback

## Contact

**Maintainer:** Lam Ngoc Khuong
**Repository:** https://github.com/lamngockhuong/github-flex
**Issues:** https://github.com/lamngockhuong/github-flex/issues
**License:** MIT

## Changelog

See `docs/project-changelog.md` for detailed version history.

## Appendix: Technical Debt

### Known Issues (Non-Blocking)
- GIF Picker module too large (575 LOC) - consider splitting
- No E2E tests - manual testing only
- Vietnamese normalization hardcoded - investigate libraries
- No accessibility features - keyboard nav, ARIA labels
- CSS not minified - bundle size could be smaller

### Improvement Opportunities
- Use Intersection Observer for performance (lazy feature activation)
- Cache GIF search results (reduce API calls)
- Implement virtual scrolling for large result sets
- Add debug mode for easier troubleshooting
- Create performance benchmarks for regression detection

### Technical Choices to Revisit
- localStorage for state - consider chrome.storage.local for sync issues
- MutationObserver debounce timing - tune based on user feedback
- GIF API proxy - evaluate alternatives if Cloudflare limits hit
- Feature module pattern - consider class-based if complexity grows
- Build system - evaluate Vite if esbuild becomes limiting

---

**Last Updated:** 2026-04-08
**Next Review:** 2026-05-01 (post-documentation phase)
