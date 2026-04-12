// Service worker for GitHub Flex
import browser from "webextension-polyfill";
import { MESSAGE_ACTIONS } from "../shared/constants.js";

const ALLOWED_IMAGE_HOSTS = ["giphy.com", "giphycdn.com"];

function isAllowedImageUrl(url) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      ALLOWED_IMAGE_HOSTS.some((h) => parsed.hostname.endsWith(h))
    );
  } catch {
    return false;
  }
}

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("[GitHub Flex] Installed");
  } else if (details.reason === "update") {
    console.log(
      "[GitHub Flex] Updated to",
      browser.runtime.getManifest().version,
    );
  }
});

// Proxy image fetches to bypass page CSP restrictions.
// Uses base64 encoding to avoid the ~300% overhead of JSON number arrays.
// Returns a Promise (required by webextension-polyfill, works on both Chrome and Firefox).
browser.runtime.onMessage.addListener((message, _sender) => {
  if (message.action !== MESSAGE_ACTIONS.FETCH_IMAGE) return;

  if (!isAllowedImageUrl(message.url)) {
    return Promise.resolve({ error: "URL not allowed" });
  }

  return fetch(message.url)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.arrayBuffer();
    })
    .then((buffer) => {
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return { data: btoa(binary) };
    })
    .catch((error) => {
      return { error: error.message };
    });
});
