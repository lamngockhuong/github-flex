import browser from "webextension-polyfill";
import { STYLE_IDS } from "../../shared/constants.js";
import { findDialog, parseDiff, parseMeta } from "./edit-history-parser.js";
import { createOverlay, destroyOverlay } from "./edit-history-ui.js";

const STYLE_ID = STYLE_IDS.EDIT_HISTORY;
const MAX_DIFF_SIZE = 100_000;
const BUTTON_ID = "ghflex-eh-enhance-btn";

export const editHistory = {
  enabled: false,
  observer: null,
  pollTimer: null,

  enable() {
    if (this.enabled) return;
    this.injectStyles();
    this.setupObserver();
    this.enabled = true;
  },

  disable() {
    if (!this.enabled) return;
    this.observer?.disconnect();
    this.observer = null;
    clearTimeout(this.pollTimer);
    this.pollTimer = null;
    destroyOverlay();
    this.removeStyles();
    this.enabled = false;
  },

  setupObserver() {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          if (node.matches?.("[data-portal-root]") || findDialog()) {
            this.waitForDialogContent();
            return;
          }
        }
      }
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
  },

  waitForDialogContent(attempt = 0) {
    if (!this.enabled || attempt > 15) return;
    const dialog = findDialog();
    if (dialog?.querySelector('[class*="EditHistoryDialogHeader-module"]')) {
      this.injectButton(dialog);
    } else {
      this.pollTimer = setTimeout(
        () => this.waitForDialogContent(attempt + 1),
        200,
      );
    }
  },

  injectButton(dialog) {
    if (!dialog || dialog.querySelector(`#${BUTTON_ID}`)) return;

    const header = dialog.querySelector(
      '[class*="EditHistoryDialogHeader-module"]',
    );
    if (!header) return;

    const btn = document.createElement("button");
    btn.id = BUTTON_ID;
    btn.className = "ghflex-eh-enhance-btn";
    btn.title = "Open enhanced diff viewer";
    btn.textContent = "Split View";
    btn.addEventListener("click", () => this.openEnhancedView(dialog));
    header.appendChild(btn);
  },

  openEnhancedView(dialog) {
    const diffData = parseDiff(dialog);
    if (!diffData) return;

    const totalSize = diffData.oldText.length + diffData.newText.length;
    if (totalSize > MAX_DIFF_SIZE) return;

    const meta = parseMeta(dialog);
    createOverlay(diffData.oldText, diffData.newText, meta);
  },

  injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const link = document.createElement("link");
    link.id = STYLE_ID;
    link.rel = "stylesheet";
    link.href = browser.runtime.getURL("content/styles/edit-history.css");
    document.head.appendChild(link);
  },

  removeStyles() {
    document.getElementById(STYLE_ID)?.remove();
  },
};
