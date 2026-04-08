// GIF Picker feature - insert GIFs into comments
import {
  GIF_API_URL,
  GIF_DEBOUNCE_DELAY,
  STYLE_IDS,
} from "../../shared/constants.js";

// Vietnamese diacritics to ASCII conversion map
const VIET_MAP = {
  à: "a",
  á: "a",
  ả: "a",
  ã: "a",
  ạ: "a",
  ă: "a",
  ằ: "a",
  ắ: "a",
  ẳ: "a",
  ẵ: "a",
  ặ: "a",
  â: "a",
  ầ: "a",
  ấ: "a",
  ẩ: "a",
  ẫ: "a",
  ậ: "a",
  đ: "d",
  è: "e",
  é: "e",
  ẻ: "e",
  ẽ: "e",
  ẹ: "e",
  ê: "e",
  ề: "e",
  ế: "e",
  ể: "e",
  ễ: "e",
  ệ: "e",
  ì: "i",
  í: "i",
  ỉ: "i",
  ĩ: "i",
  ị: "i",
  ò: "o",
  ó: "o",
  ỏ: "o",
  õ: "o",
  ọ: "o",
  ô: "o",
  ồ: "o",
  ố: "o",
  ổ: "o",
  ỗ: "o",
  ộ: "o",
  ơ: "o",
  ờ: "o",
  ớ: "o",
  ở: "o",
  ỡ: "o",
  ợ: "o",
  ù: "u",
  ú: "u",
  ủ: "u",
  ũ: "u",
  ụ: "u",
  ư: "u",
  ừ: "u",
  ứ: "u",
  ử: "u",
  ữ: "u",
  ự: "u",
  ỳ: "y",
  ý: "y",
  ỷ: "y",
  ỹ: "y",
  ỵ: "y",
  À: "A",
  Á: "A",
  Ả: "A",
  Ã: "A",
  Ạ: "A",
  Ă: "A",
  Ằ: "A",
  Ắ: "A",
  Ẳ: "A",
  Ẵ: "A",
  Ặ: "A",
  Â: "A",
  Ầ: "A",
  Ấ: "A",
  Ẩ: "A",
  Ẫ: "A",
  Ậ: "A",
  Đ: "D",
  È: "E",
  É: "E",
  Ẻ: "E",
  Ẽ: "E",
  Ẹ: "E",
  Ê: "E",
  Ề: "E",
  Ế: "E",
  Ể: "E",
  Ễ: "E",
  Ệ: "E",
  Ì: "I",
  Í: "I",
  Ỉ: "I",
  Ĩ: "I",
  Ị: "I",
  Ò: "O",
  Ó: "O",
  Ỏ: "O",
  Õ: "O",
  Ọ: "O",
  Ô: "O",
  Ồ: "O",
  Ố: "O",
  Ổ: "O",
  Ỗ: "O",
  Ộ: "O",
  Ơ: "O",
  Ờ: "O",
  Ớ: "O",
  Ở: "O",
  Ỡ: "O",
  Ợ: "O",
  Ù: "U",
  Ú: "U",
  Ủ: "U",
  Ũ: "U",
  Ụ: "U",
  Ư: "U",
  Ừ: "U",
  Ứ: "U",
  Ử: "U",
  Ữ: "U",
  Ự: "U",
  Ỳ: "Y",
  Ý: "Y",
  Ỷ: "Y",
  Ỹ: "Y",
  Ỵ: "Y",
};

// Textarea selectors for GitHub comment fields
const TEXTAREA_SELECTORS = [
  'textarea[name="comment[body]"]',
  'textarea[name="pull_request[body]"]',
  'textarea[name="issue[body]"]',
  "textarea.js-comment-field",
  'textarea[id^="new_comment_field"]',
  'textarea[placeholder="Leave a comment"]',
  'textarea[placeholder^="Type your description"]',
  'textarea[placeholder^="Use Markdown"]',
  'textarea[aria-label="Markdown value"]',
  'textarea[class*="prc-Textarea"]',
].join(", ");

// State
let currentTextarea = null;
let debounceTimer = null;
let observer = null;

// Normalize Vietnamese text to ASCII
function normalizeVietnamese(text) {
  return text
    .split("")
    .map((char) => VIET_MAP[char] || char)
    .join("");
}

// Debounce function
function debounce(func, delay) {
  return function (...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(this, args), delay);
  };
}

// Validate GIF URL (security: prevent javascript: URLs and non-GIPHY domains)
function isValidGifUrl(url) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname.endsWith("giphy.com") ||
        parsed.hostname.endsWith("giphycdn.com"))
    );
  } catch {
    return false;
  }
}

// Fetch GIFs from API
async function fetchGifs(query) {
  try {
    const normalizedQuery = normalizeVietnamese(query);
    const url = `${GIF_API_URL}?q=${encodeURIComponent(normalizedQuery)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("[GIF Picker] Failed to fetch GIFs:", error);
    return [];
  }
}

// Create GIF button for toolbar
function createGifButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ghflex-gif-btn";
  button.setAttribute("aria-label", "Add GIF");
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4.75 4.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5ZM5 7.75A.75.75 0 0 1 5.75 7h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 7.75ZM5.75 10a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z"/>
      <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2Zm2-.5a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5V2a.5.5 0 0 0-.5-.5H2Z"/>
    </svg>
    GIF
  `;

  return button;
}

// Create modal overlay and content
function createModal() {
  const overlay = document.createElement("div");
  overlay.className = "ghflex-gif-overlay";

  const modal = document.createElement("div");
  modal.className = "ghflex-gif-modal";

  modal.innerHTML = `
    <div class="ghflex-gif-header">
      <h3>Search GIFs</h3>
      <button class="ghflex-gif-close" aria-label="Close">&times;</button>
    </div>
    <div class="ghflex-gif-search">
      <input type="text" placeholder="Search for GIFs..." class="ghflex-gif-search-input" />
    </div>
    <div class="ghflex-gif-content"></div>
  `;

  overlay.appendChild(modal);

  return overlay;
}

// Insert GIF markdown into textarea
function insertGif(gifUrl, gifTitle) {
  if (!currentTextarea) return;

  // Security: Validate URL before insertion
  if (!isValidGifUrl(gifUrl)) {
    console.error("[GIF Picker] Invalid GIF URL rejected");
    return;
  }

  // Sanitize title to prevent markdown injection
  const safeTitle = (gifTitle || "GIF").replace(/[[\]()]/g, "");

  const start = currentTextarea.selectionStart;
  const end = currentTextarea.selectionEnd;
  const text = currentTextarea.value;

  const markdown = `![${safeTitle}](${gifUrl})`;
  const newText = text.substring(0, start) + markdown + text.substring(end);

  currentTextarea.value = newText;
  currentTextarea.setSelectionRange(
    start + markdown.length,
    start + markdown.length,
  );
  currentTextarea.focus();

  // Trigger input event for GitHub's auto-save
  currentTextarea.dispatchEvent(new Event("input", { bubbles: true }));

  closeModal();
}

// Copy GIF markdown to clipboard
async function copyGifMarkdown(gifUrl, gifTitle, button) {
  // Security: Validate URL before copying
  if (!isValidGifUrl(gifUrl)) {
    console.error("[GIF Picker] Invalid GIF URL rejected");
    return;
  }

  // Sanitize title to prevent markdown injection
  const safeTitle = (gifTitle || "GIF").replace(/[[\]()]/g, "");
  const markdown = `![${safeTitle}](${gifUrl})`;

  try {
    await navigator.clipboard.writeText(markdown);
    showCopyFeedback(button);
  } catch (error) {
    console.error("[GIF Picker] Failed to copy:", error);
  }
}

// Show "Copied!" feedback
function showCopyFeedback(button) {
  const originalText = button.textContent;
  button.textContent = "Copied!";
  button.classList.add("ghflex-gif-copied");

  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove("ghflex-gif-copied");
  }, 1500);
}

// Render GIFs in grid
function renderGifs(gifs) {
  const content = document.querySelector(".ghflex-gif-content");
  if (!content) return;

  content.innerHTML = "";

  if (gifs.length === 0) {
    const empty = document.createElement("div");
    empty.className = "ghflex-gif-empty";
    empty.textContent = "No GIFs found";
    content.appendChild(empty);
    return;
  }

  gifs.forEach((gif) => {
    const previewUrl =
      gif.images?.fixed_width_small?.url || gif.images?.original?.url;
    const fullUrl = gif.images?.original?.url;
    const title = gif.title || "GIF";

    // Security: Validate URLs before rendering
    if (!previewUrl || !fullUrl) return;
    if (!isValidGifUrl(previewUrl) || !isValidGifUrl(fullUrl)) return;

    // Build DOM safely (no innerHTML with external data)
    const item = document.createElement("div");
    item.className = "ghflex-gif-item";

    const img = document.createElement("img");
    img.src = previewUrl;
    img.alt = title;
    img.loading = "lazy";

    const overlay = document.createElement("div");
    overlay.className = "ghflex-gif-overlay-actions";

    const insertBtn = document.createElement("button");
    insertBtn.className = "ghflex-gif-insert-btn";
    insertBtn.textContent = "Insert";
    insertBtn.addEventListener("click", () => {
      insertGif(fullUrl, title);
    });

    const copyBtn = document.createElement("button");
    copyBtn.className = "ghflex-gif-copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      copyGifMarkdown(fullUrl, title, copyBtn);
    });

    overlay.appendChild(insertBtn);
    overlay.appendChild(copyBtn);
    item.appendChild(img);
    item.appendChild(overlay);
    content.appendChild(item);
  });
}

// Search GIFs with debounce
const searchGifs = debounce(async (query) => {
  if (!query.trim()) {
    renderGifs([]);
    return;
  }

  const gifs = await fetchGifs(query);
  renderGifs(gifs);
}, GIF_DEBOUNCE_DELAY);

// Open modal
function openModal(textarea) {
  currentTextarea = textarea;

  let overlay = document.querySelector(".ghflex-gif-overlay");

  if (!overlay) {
    overlay = createModal();
    document.body.appendChild(overlay);

    // Close button
    overlay
      .querySelector(".ghflex-gif-close")
      .addEventListener("click", closeModal);

    // Click outside to close
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });

    // Escape key to close
    document.addEventListener("keydown", handleEscapeKey);

    // Search input
    const searchInput = overlay.querySelector(".ghflex-gif-search-input");
    searchInput.addEventListener("input", (e) => {
      searchGifs(e.target.value);
    });

    // Load default GIFs
    fetchGifs("trending").then(renderGifs);
  }

  overlay.classList.add("ghflex-gif-active");
  overlay.querySelector(".ghflex-gif-search-input").focus();
}

// Close modal
function closeModal() {
  const overlay = document.querySelector(".ghflex-gif-overlay");
  if (overlay) {
    overlay.classList.remove("ghflex-gif-active");
  }
  currentTextarea = null;
}

// Handle Escape key
function handleEscapeKey(e) {
  if (e.key === "Escape") {
    closeModal();
  }
}

// Add GIF button to toolbar
function addGifButtonToToolbar(textarea) {
  // Check if button already exists
  const toolbar = textarea
    .closest("form")
    ?.querySelector('.toolbar, [role="toolbar"], markdown-toolbar');
  if (!toolbar) return;

  // Don't add if already exists
  if (toolbar.querySelector(".ghflex-gif-btn")) return;

  const gifButton = createGifButton();
  gifButton.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(textarea);
  });

  // Insert button before the first separator or at the end
  const separator = toolbar.querySelector(
    ".toolbar-separator, .v-align-middle",
  );
  if (separator) {
    separator.parentNode.insertBefore(gifButton, separator);
  } else {
    toolbar.appendChild(gifButton);
  }
}

// Initialize GIF buttons for all textareas
function initGifButtons() {
  const textareas = document.querySelectorAll(TEXTAREA_SELECTORS);
  textareas.forEach(addGifButtonToToolbar);
}

// Watch for new textareas (SPA navigation)
function startObserver() {
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        // Check if the node itself is a textarea
        if (node.matches?.(TEXTAREA_SELECTORS)) {
          addGifButtonToToolbar(node);
        }

        // Check descendants
        const textareas = node.querySelectorAll?.(TEXTAREA_SELECTORS);
        textareas?.forEach(addGifButtonToToolbar);
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Stop observer
function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

// Inject styles
function injectStyles() {
  if (document.getElementById(STYLE_IDS.GIF_PICKER)) return;

  const link = document.createElement("link");
  link.id = STYLE_IDS.GIF_PICKER;
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("content/styles/gif-picker.css");
  document.head.appendChild(link);
}

// Remove styles
function removeStyles() {
  const style = document.getElementById(STYLE_IDS.GIF_PICKER);
  if (style) {
    style.remove();
  }
}

// Remove all GIF buttons
function removeGifButtons() {
  document.querySelectorAll(".ghflex-gif-btn").forEach((btn) => {
    btn.remove();
  });
}

// Remove modal
function removeModal() {
  const overlay = document.querySelector(".ghflex-gif-overlay");
  if (overlay) {
    overlay.remove();
  }
  document.removeEventListener("keydown", handleEscapeKey);
}

// Public API
export const gifPicker = {
  enabled: false,

  enable() {
    if (this.enabled) return;
    this.enabled = true;

    injectStyles();
    initGifButtons();
    startObserver();

    console.log("[GIF Picker] Enabled");
  },

  disable() {
    if (!this.enabled) return;
    this.enabled = false;

    removeStyles();
    removeGifButtons();
    removeModal();
    stopObserver();

    console.log("[GIF Picker] Disabled");
  },
};
