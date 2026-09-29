// Fetch proxies used by the service worker to bypass page CSP restrictions.
// Kept free of extension APIs so the URL checks can be unit-tested.
import { safeGiphyUrl } from "../shared/url-safety.js";

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
export function fetchGifApi(url) {
  if (!isAllowedApiUrl(url)) {
    return Promise.resolve({ error: "URL not allowed" });
  }

  // The allowlist only vets the URL we request, so a redirect from the API
  // host could send this fetch anywhere. The API answers JSON directly and
  // never needs to redirect, so refuse any.
  return fetch(url, { redirect: "error" })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => ({ data: data.data || [] }))
    .catch((error) => ({ error: error.message }));
}

// Fetch a GIPHY image and return it base64-encoded
export function fetchGiphyImage(url) {
  // Fetch the validated URL, not the raw one the content script sent
  const imageUrl = safeGiphyUrl(url);
  if (!imageUrl) {
    return Promise.resolve({ error: "URL not allowed" });
  }

  // GIPHY's CDN may legitimately redirect between its own hosts, so follow
  // redirects but re-check where we ended up before handing back any bytes.
  return fetch(imageUrl)
    .then((response) => {
      if (!safeGiphyUrl(response.url)) throw new Error("URL not allowed");
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
    .catch((error) => ({ error: error.message }));
}
