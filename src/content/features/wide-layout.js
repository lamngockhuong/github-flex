// CSS injected via manifest at document_start to prevent FOUC
// This module toggles the disabled class for runtime control

const DISABLED_CLASS = "ghflex-wide-layout-disabled";

export const wideLayout = {
  enabled: false,

  enable() {
    if (this.enabled) return;
    document.documentElement.classList.remove(DISABLED_CLASS);
    this.enabled = true;
  },

  disable() {
    if (!this.enabled) return;
    document.documentElement.classList.add(DISABLED_CLASS);
    this.enabled = false;
  },
};
