// Service worker for GitHub Flex
import browser from "webextension-polyfill";
import { MESSAGE_ACTIONS } from "../shared/constants.js";

const ALLOWED_IMAGE_HOSTS = ["giphy.com", "giphycdn.com"];
const ALLOWED_API_HOST = "github-gifs.aldilaff6545.workers.dev";

function isAllowedApiUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === ALLOWED_API_HOST;
  } catch {
    return false;
  }
}

// Proxy GIF API requests to bypass page CSP connect-src restrictions
function fetchGifApi(url) {
  if (!isAllowedApiUrl(url)) {
    return Promise.resolve({ error: "URL not allowed" });
  }

  return fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => ({ data: data.data || [] }))
    .catch((error) => ({ error: error.message }));
}

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

// Proxy fetches to bypass page CSP restrictions on Firefox.
// Firefox content scripts are subject to the page's CSP, unlike Chrome.
// Returns a Promise (required by webextension-polyfill, works on both browsers).
browser.runtime.onMessage.addListener((message, _sender) => {
  if (message.action === MESSAGE_ACTIONS.FETCH_GIFS) {
    return fetchGifApi(message.url);
  }
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
