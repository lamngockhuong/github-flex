// Table Expand feature - expandable tables with fullscreen option
import browser from "webextension-polyfill";
import { ICONS } from "../../shared/icons.js";

const STYLE_ID = "ghflex-table-expand-styles";
const STORAGE_KEY = "ghflex-table-expand-state";

export const tableExpand = {
  enabled: false,
  observer: null,
  expandedState: {},
  fullscreenTable: null,

  enable() {
    if (this.enabled) return;
    this.loadState();
    this.injectStyles();
    this.processTables();
    this.setupObserver();
    this.setupEscapeHandler();
    this.enabled = true;
  },

  disable() {
    if (!this.enabled) return;
    clearTimeout(this.processTimeout);
    this.observer?.disconnect();
    this.exitFullscreen();
    this.removeEscapeHandler();
    this.removeAllToggles();
    this.removeStyles();
    this.enabled = false;
  },

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      this.expandedState = stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("[GitHub Flex] Failed to load table expand state:", error);
      this.expandedState = {};
    }
  },

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.expandedState));
    } catch (error) {
      console.error("[GitHub Flex] Failed to save table expand state:", error);
    }
  },

  getStateKey(index) {
    return `${window.location.pathname}:${index}`;
  },

  processTables() {
    const tables = document.querySelectorAll(".markdown-body table");
    tables.forEach((table, index) => {
      if (table.closest(".ghflex-table-wrapper")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "ghflex-table-wrapper";

      const container = document.createElement("div");
      container.className = "ghflex-table-container";

      const stateKey = this.getStateKey(`table-${index}`);
      const isExpanded = this.expandedState[stateKey] || false;

      if (isExpanded) {
        container.classList.add("ghflex-table-expanded");
      }

      // Button group
      const btnGroup = document.createElement("div");
      btnGroup.className = "ghflex-table-btn-group";

      // Expand button
      const expandBtn = this.createButton(
        isExpanded ? ICONS.unlock : ICONS.lock,
        isExpanded ? "Collapse" : "Expand",
        () => {
          container.classList.toggle("ghflex-table-expanded");
          const nowExpanded = container.classList.contains(
            "ghflex-table-expanded",
          );
          this.expandedState[stateKey] = nowExpanded;
          this.saveState();
          expandBtn.innerHTML = nowExpanded ? ICONS.unlock : ICONS.lock;
          expandBtn.title = nowExpanded ? "Collapse" : "Expand";
        },
      );

      // Fullscreen button
      const fullscreenBtn = this.createButton(
        ICONS.fullscreen,
        "Fullscreen",
        () => this.openFullscreen(table),
      );

      btnGroup.appendChild(expandBtn);
      btnGroup.appendChild(fullscreenBtn);

      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(btnGroup);
      wrapper.appendChild(container);
      container.appendChild(table);
    });
  },

  createButton(icon, title, onClick) {
    const button = document.createElement("button");
    button.className = "ghflex-table-toggle";
    button.innerHTML = icon;
    button.title = title;
    button.addEventListener("click", onClick);
    return button;
  },

  // Fullscreen mode
  openFullscreen(table) {
    if (this.fullscreenTable) return;

    const overlay = document.createElement("div");
    overlay.className = "ghflex-table-fullscreen-overlay";

    const content = document.createElement("div");
    content.className = "ghflex-table-fullscreen-content";

    const closeBtn = document.createElement("button");
    closeBtn.className = "ghflex-table-fullscreen-close";
    closeBtn.innerHTML = ICONS.exitFullscreen;
    closeBtn.title = "Exit Fullscreen (Esc)";
    closeBtn.addEventListener("click", () => this.exitFullscreen());

    // Clone table for fullscreen
    const tableClone = table.cloneNode(true);
    tableClone.className = "ghflex-table-fullscreen-table";

    content.appendChild(closeBtn);
    content.appendChild(tableClone);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    this.fullscreenTable = overlay;
  },

  exitFullscreen() {
    if (!this.fullscreenTable) return;
    this.fullscreenTable.remove();
    this.fullscreenTable = null;
    document.body.style.overflow = "";
  },

  setupEscapeHandler() {
    this.escapeHandler = (e) => {
      if (e.key === "Escape" && this.fullscreenTable) {
        this.exitFullscreen();
      }
    };
    document.addEventListener("keydown", this.escapeHandler);
  },

  removeEscapeHandler() {
    if (this.escapeHandler) {
      document.removeEventListener("keydown", this.escapeHandler);
    }
  },

  setupObserver() {
    this.observer = new MutationObserver((mutations) => {
      let shouldProcess = false;
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          shouldProcess = true;
          break;
        }
      }
      if (shouldProcess) {
        clearTimeout(this.processTimeout);
        this.processTimeout = setTimeout(() => this.processTables(), 300);
      }
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
  },

  removeAllToggles() {
    document.querySelectorAll(".ghflex-table-wrapper").forEach((wrapper) => {
      const table = wrapper.querySelector("table");
      if (table) {
        wrapper.parentNode.insertBefore(table, wrapper);
      }
      wrapper.remove();
    });
  },

  injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const link = document.createElement("link");
    link.id = STYLE_ID;
    link.rel = "stylesheet";
    link.href = browser.runtime.getURL("content/styles/table-expand.css");
    document.head.appendChild(link);
  },

  removeStyles() {
    document.getElementById(STYLE_ID)?.remove();
  },
};
