// Wide Layout feature - expands GitHub to full viewport width

const STYLE_ID = "ghflex-wide-layout-styles";
const CLASS_NAME = "ghflex-wide-layout";

export const wideLayout = {
  enabled: false,

  enable() {
    if (this.enabled) return;
    document.documentElement.classList.add(CLASS_NAME);
    this.injectStyles();
    this.enabled = true;
  },

  disable() {
    if (!this.enabled) return;
    document.documentElement.classList.remove(CLASS_NAME);
    this.removeStyles();
    this.enabled = false;
  },

  injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const link = document.createElement("link");
    link.id = STYLE_ID;
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("content/styles/wide-layout.css");
    document.head.appendChild(link);
  },

  removeStyles() {
    document.getElementById(STYLE_ID)?.remove();
  },
};
