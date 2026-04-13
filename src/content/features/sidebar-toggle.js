// Sidebar Toggle feature - hide/show sidebar
import browser from "webextension-polyfill";
import { setTrustedHTML } from "../../shared/dom.js";
import { ICONS } from "../../shared/icons.js";

const STORAGE_KEY = "ghflex-sidebar-hidden";
const TOGGLE_ID = "ghflex-sidebar-toggle";
const HIDDEN_CLASS = "ghflex-sidebar-hidden";
const STYLE_ID = "ghflex-sidebar-toggle-styles";

// Sidebar selectors for different GitHub layouts
const SIDEBAR_SELECTORS = [
  '[class*="prc-PageLayout-PaneWrapper"]', // PageLayout (React)
  '[data-testid="issue-viewer-metadata-container"]', // New UI
  ".Layout-sidebar", // Old UI
  "#partial-discussion-sidebar", // Discussion
];

class SidebarToggle {
  constructor() {
    this.enabled = false;
    this.sidebar = null;
    this.toggleButton = null;
    this.observer = null;
    this.isHidden = false;
    // Event handler references for cleanup
    this.keydownHandler = null;
    this.popstateHandler = null;
    this.originalPushState = null;
    this.originalReplaceState = null;
    // Debounce/timeout tracking
    this.initTimeoutId = null;
    this.observerDebounceId = null;
  }

  /**
   * Find sidebar element on current page
   */
  findSidebar() {
    for (const selector of SIDEBAR_SELECTORS) {
      const element = document.querySelector(selector);
      if (element) {
        // Skip .Layout-sidebar if it's a left navigation sidebar (not metadata)
        if (selector === ".Layout-sidebar") {
          const parent = element.closest(".Layout");
          if (parent?.classList.contains("Layout--sidebarPosition-start")) {
            continue; // Skip left-positioned sidebars (navigation)
          }
        }
        return element;
      }
    }
    return null;
  }

  /**
   * Create toggle button
   */
  createToggleButton() {
    const button = document.createElement("button");
    button.id = TOGGLE_ID;
    button.type = "button";
    button.setAttribute("aria-label", "Toggle sidebar visibility");
    setTrustedHTML(
      button,
      this.isHidden ? ICONS.showSidebar : ICONS.hideSidebar,
    );
    button.addEventListener("click", () => this.toggle());
    return button;
  }

  /**
   * Update toggle button icon
   */
  updateToggleIcon() {
    if (this.toggleButton) {
      setTrustedHTML(
        this.toggleButton,
        this.isHidden ? ICONS.showSidebar : ICONS.hideSidebar,
      );
      this.toggleButton.setAttribute(
        "aria-label",
        this.isHidden ? "Show sidebar" : "Hide sidebar",
      );
    }
  }

  /**
   * Toggle sidebar visibility
   */
  toggle() {
    this.isHidden = !this.isHidden;
    this.applyState();
    this.updateToggleIcon();
    this.saveState();
  }

  /**
   * Apply hidden/visible state to sidebar
   */
  applyState() {
    if (!this.sidebar) return;
    this.sidebar.classList.toggle(HIDDEN_CLASS, this.isHidden);
  }

  /**
   * Save state to localStorage
   */
  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.isHidden));
    } catch (error) {
      console.error("Failed to save sidebar state:", error);
    }
  }

  /**
   * Load state from localStorage
   */
  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        this.isHidden = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load sidebar state:", error);
      this.isHidden = false;
    }
  }

  /**
   * Setup keyboard shortcut (Alt+M)
   */
  setupKeyboardShortcut() {
    this.keydownHandler = (event) => {
      if (event.altKey && event.key === "m") {
        event.preventDefault();
        if (this.sidebar && this.enabled) {
          this.toggle();
        }
      }
    };
    document.addEventListener("keydown", this.keydownHandler);
  }

  /**
   * Setup MutationObserver for SPA navigation (debounced)
   */
  setupObserver() {
    this.observer = new MutationObserver(() => {
      // Debounce rapid mutations
      clearTimeout(this.observerDebounceId);
      this.observerDebounceId = setTimeout(() => {
        // Check if sidebar still exists
        if (this.sidebar && !document.body.contains(this.sidebar)) {
          this.sidebar = null;
          this.init();
          return;
        }
        // Check if toggle button still exists
        if (this.toggleButton && !document.body.contains(this.toggleButton)) {
          this.toggleButton = null;
          this.init();
          return;
        }
        // Check if sidebar appeared (wasn't found before but now exists)
        if (!this.sidebar && this.findSidebar()) {
          this.init();
        }
      }, 100);
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Initialize zen mode on current page
   */
  init() {
    // Find sidebar
    this.sidebar = this.findSidebar();

    // Only proceed if sidebar exists
    if (!this.sidebar) {
      // Remove toggle button if no sidebar
      if (this.toggleButton?.parentNode) {
        this.toggleButton.remove();
        this.toggleButton = null;
      }
      return;
    }

    // Create toggle button if it doesn't exist
    if (!this.toggleButton || !document.body.contains(this.toggleButton)) {
      this.toggleButton = this.createToggleButton();
      document.body.appendChild(this.toggleButton);
    }

    // Apply saved state (without animation)
    this.applyState();
    this.updateToggleIcon();

    // Enable transitions after initial state is set (next frame)
    requestAnimationFrame(() => {
      this.sidebar?.classList.add("ghflex-sidebar-ready");
    });
  }

  /**
   * Inject CSS styles
   */
  injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const link = document.createElement("link");
    link.id = STYLE_ID;
    link.rel = "stylesheet";
    link.href = browser.runtime.getURL("content/styles/sidebar-toggle.css");
    document.head.appendChild(link);
  }

  /**
   * Remove CSS styles
   */
  removeStyles() {
    document.getElementById(STYLE_ID)?.remove();
  }

  /**
   * Enable sidebar toggle feature
   */
  enable() {
    if (this.enabled) return;

    this.enabled = true;
    this.injectStyles();
    this.loadState();
    this.setupKeyboardShortcut();
    this.setupObserver();
    this.init();

    // Re-init on popstate (browser back/forward)
    this.popstateHandler = () => {
      clearTimeout(this.initTimeoutId);
      this.initTimeoutId = setTimeout(() => this.init(), 100);
    };
    window.addEventListener("popstate", this.popstateHandler);

    // Re-init on pushstate/replacestate (SPA navigation)
    this.originalPushState = history.pushState;
    this.originalReplaceState = history.replaceState;

    const self = this;
    history.pushState = function (...args) {
      self.originalPushState.apply(this, args);
      clearTimeout(self.initTimeoutId);
      self.initTimeoutId = setTimeout(() => self.init(), 100);
    };

    history.replaceState = function (...args) {
      self.originalReplaceState.apply(this, args);
      clearTimeout(self.initTimeoutId);
      self.initTimeoutId = setTimeout(() => self.init(), 100);
    };
  }

  /**
   * Disable sidebar toggle feature
   */
  disable() {
    if (!this.enabled) return;

    this.enabled = false;

    // Clear pending timeouts
    clearTimeout(this.initTimeoutId);
    clearTimeout(this.observerDebounceId);

    // Remove toggle button
    if (this.toggleButton?.parentNode) {
      this.toggleButton.remove();
      this.toggleButton = null;
    }

    // Remove classes from sidebar
    if (this.sidebar) {
      this.sidebar.classList.remove(HIDDEN_CLASS);
      this.sidebar.classList.remove("ghflex-sidebar-ready");
      this.sidebar = null;
    }

    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Remove keyboard shortcut listener
    if (this.keydownHandler) {
      document.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = null;
    }

    // Remove popstate listener
    if (this.popstateHandler) {
      window.removeEventListener("popstate", this.popstateHandler);
      this.popstateHandler = null;
    }

    // Restore original history methods
    if (this.originalPushState) {
      history.pushState = this.originalPushState;
      this.originalPushState = null;
    }
    if (this.originalReplaceState) {
      history.replaceState = this.originalReplaceState;
      this.originalReplaceState = null;
    }

    // Remove styles
    this.removeStyles();
  }
}

// Export singleton instance
export const sidebarToggle = new SidebarToggle();
