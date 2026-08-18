import { setTrustedHTML } from "../../shared/dom.js";
import { ICONS } from "../../shared/icons.js";
import { imageLightbox } from "./image-lightbox.js";
import {
  addCellClamps,
  removeAllCellClamps,
  removeCellClamps,
} from "./table-cell-clamp.js";
import {
  addResizeHandles,
  refreshColumnWidths,
  removeAllResizeHandles,
  removeResizeHandles,
} from "./table-column-resize.js";
import {
  addColumnToggles,
  removeAllColumnToggles,
  removeColumnToggles,
} from "./table-column-toggle.js";
import {
  createToolbarButton,
  loadJsonStore,
  saveJsonStore,
} from "./table-utils.js";

const STORAGE_KEY = "ghflex-table-expand-state";

export const tableExpand = {
  enabled: false,
  observer: null,
  expandedState: {},
  fullscreenTable: null,

  enable() {
    if (this.enabled) return;
    this.loadState();
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
    removeAllColumnToggles();
    removeAllResizeHandles();
    removeAllCellClamps();
    this.removeAllToggles();
    this.enabled = false;
  },

  loadState() {
    this.expandedState = loadJsonStore(STORAGE_KEY);
  },

  saveState() {
    saveJsonStore(STORAGE_KEY, this.expandedState);
  },

  getStateKey(index) {
    return `${window.location.pathname}:${index}`;
  },

  processTables() {
    const tables = document.querySelectorAll(".markdown-body table");
    tables.forEach((table, index) => {
      if (table.closest(".ghflex-table-wrapper")) return;
      if (table.closest(".ghflex-table-fullscreen-overlay")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "ghflex-table-wrapper";

      const container = document.createElement("div");
      container.className = "ghflex-table-container";

      const stateKey = this.getStateKey(`table-${index}`);
      const isExpanded = this.expandedState[stateKey] || false;

      if (isExpanded) {
        container.classList.add("ghflex-table-expanded");
      }

      const btnGroup = document.createElement("div");
      btnGroup.className = "ghflex-table-btn-group";

      const expandBtn = createToolbarButton(
        isExpanded ? ICONS.unlock : ICONS.lock,
        isExpanded ? "Collapse" : "Expand",
        () => {
          container.classList.toggle("ghflex-table-expanded");
          const nowExpanded = container.classList.contains(
            "ghflex-table-expanded",
          );
          this.expandedState[stateKey] = nowExpanded;
          this.saveState();
          // each state keeps its own column widths - swap to the new set
          refreshColumnWidths(table);
          setTrustedHTML(expandBtn, nowExpanded ? ICONS.unlock : ICONS.lock);
          expandBtn.title = nowExpanded ? "Collapse" : "Expand";
        },
      );

      const fullscreenBtn = createToolbarButton(
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
      addResizeHandles(table);
      addColumnToggles(table, btnGroup);
      addCellClamps(table, btnGroup);
    });
  },

  openFullscreen(table) {
    if (this.fullscreenTable) return;

    const overlay = document.createElement("div");
    overlay.className = "ghflex-table-fullscreen-overlay";

    const content = document.createElement("div");
    content.className = "ghflex-table-fullscreen-content markdown-body";

    const closeBtn = document.createElement("button");
    closeBtn.className = "ghflex-table-fullscreen-close";
    setTrustedHTML(closeBtn, ICONS.exitFullscreen);
    closeBtn.title = "Exit Fullscreen (Esc)";
    closeBtn.addEventListener("click", () => this.exitFullscreen());

    const tableClone = table.cloneNode(true);
    tableClone.className = "ghflex-table-fullscreen-table";

    tableClone.querySelectorAll("img[data-ghflex-lightbox]").forEach((img) => {
      delete img.dataset.ghflexLightbox;
      img.classList.remove("ghflex-lightbox-trigger");
    });

    const fsBtnGroup = document.createElement("div");
    fsBtnGroup.className = "ghflex-table-fullscreen-btn-group";

    content.appendChild(closeBtn);
    content.appendChild(fsBtnGroup);
    content.appendChild(tableClone);
    overlay.appendChild(content);

    const parentDialog = table.closest("dialog[open]");
    (parentDialog || document.body).appendChild(overlay);
    document.body.style.overflow = "hidden";

    removeResizeHandles(tableClone);
    addResizeHandles(tableClone);
    removeColumnToggles(tableClone);
    addColumnToggles(tableClone, fsBtnGroup);
    // Fullscreen is where a wide table needs clamping most - a spec table with
    // long cells is unreadable at full row height. Same mechanism, same
    // persisted per-table choice, own toggle button.
    //
    // Unlike its two siblings above this clears the guard flag by hand instead
    // of calling removeCellClamps: that would unwrap the cells and clear the
    // open-row classes the clone inherited, so a row you had expanded on the
    // page would collapse on entering fullscreen. Reading continues where it
    // left off.
    delete tableClone.dataset.ghflexCellClamp;
    addCellClamps(tableClone, fsBtnGroup);

    if (imageLightbox.enabled) {
      imageLightbox.processImages(content);
    }

    this.fullscreenTable = overlay;
  },

  exitFullscreen() {
    if (!this.fullscreenTable) return;
    if (imageLightbox.enabled) {
      imageLightbox.removeImageTriggers(this.fullscreenTable);
    }
    const clone = this.fullscreenTable.querySelector(
      ".ghflex-table-fullscreen-table",
    );
    // Detach first: teardown unwraps every cell, and doing that to a live tree
    // costs a style and layout pass on a table that is about to disappear.
    this.fullscreenTable.remove();
    // The shared ResizeObserver holds its targets strongly, so the clone would
    // be pinned for the page's lifetime without this.
    removeCellClamps(clone);
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
};
