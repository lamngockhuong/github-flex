// Service worker for GitHub Flex
import browser from "webextension-polyfill";
import {
  BRAND_COLOR,
  CONTEXT_MENU_ITEMS,
  EXT_LINKS,
  MESSAGE_ACTIONS,
} from "../shared/constants.js";
import { fetchGifApi, fetchGiphyImage } from "./proxy-fetch.js";

function createContextMenus() {
  browser.contextMenus.removeAll().then(() => {
    for (const { key, title } of CONTEXT_MENU_ITEMS) {
      browser.contextMenus.create({
        id: `github-flex-${key}`,
        title,
        contexts: ["action"],
      });
    }
  });
}

browser.runtime.onInstalled.addListener((details) => {
  createContextMenus();

  if (details.reason === "install") {
    console.log("[GitHub Flex] Installed");
  } else if (details.reason === "update") {
    const version = browser.runtime.getManifest().version;
    console.log("[GitHub Flex] Updated to", version);
    browser.action.setBadgeText({ text: "Up!" });
    browser.action.setBadgeBackgroundColor({ color: BRAND_COLOR });
  }
});

browser.contextMenus.onClicked.addListener((info) => {
  const key = info.menuItemId.replace("github-flex-", "");
  const url = EXT_LINKS[key];
  if (url) {
    browser.tabs.create({ url });
  }
});

// Proxy fetches to bypass page CSP restrictions on Firefox.
// Firefox content scripts are subject to the page's CSP, unlike Chrome.
// Returns a Promise (required by webextension-polyfill, works on both browsers).
browser.runtime.onMessage.addListener((message, _sender) => {
  if (message.action === MESSAGE_ACTIONS.CLEAR_BADGE) {
    return browser.action.setBadgeText({ text: "" });
  }
  if (message.action === MESSAGE_ACTIONS.FETCH_GIFS) {
    return fetchGifApi(message.url);
  }
  if (message.action !== MESSAGE_ACTIONS.FETCH_IMAGE) return;

  return fetchGiphyImage(message.url);
});
