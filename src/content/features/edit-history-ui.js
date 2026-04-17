import { setTrustedHTML } from "../../shared/dom.js";
import { ICONS } from "../../shared/icons.js";
import {
  buildSideBySide,
  buildUnified,
  computeStats,
  computeWordDiff,
} from "./edit-history-diff.js";
import { renderMarkdown } from "./edit-history-markdown.js";

const OVERLAY_ID = "ghflex-edit-history";
let overlay = null;
let state = {
  oldText: "",
  newText: "",
  meta: null,
  viewMode: "side",
  parts: null,
};
let keyHandler = null;

export function createOverlay(oldText, newText, meta) {
  destroyOverlay();
  const parts = computeWordDiff(oldText, newText);
  state = { oldText, newText, meta, viewMode: "side", parts };

  overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.classList.add("active");

  const backdrop = document.createElement("div");
  backdrop.className = "ghflex-eh-backdrop";
  backdrop.addEventListener("click", destroyOverlay);

  const panel = document.createElement("div");
  panel.className = "ghflex-eh-panel";

  panel.appendChild(buildHeader(meta));
  panel.appendChild(buildBody());
  panel.appendChild(buildFooter(parts));

  overlay.appendChild(backdrop);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  keyHandler = (e) => {
    if (e.key === "Escape") destroyOverlay();
  };
  document.addEventListener("keydown", keyHandler);

  renderDiff();
}

export function destroyOverlay() {
  if (keyHandler) {
    document.removeEventListener("keydown", keyHandler);
    keyHandler = null;
  }
  if (overlay) {
    overlay.remove();
    overlay = null;
    document.body.style.overflow = "";
  }
}

function buildHeader(meta) {
  const header = document.createElement("div");
  header.className = "ghflex-eh-header";

  const left = document.createElement("div");
  left.className = "ghflex-eh-header-left";

  const title = document.createElement("h2");
  title.className = "ghflex-eh-title";
  title.textContent = "Edit History";
  left.appendChild(title);

  if (meta?.author) {
    const metaEl = document.createElement("span");
    metaEl.className = "ghflex-eh-meta";
    const isGitHubAvatar = meta.avatarUrl?.startsWith(
      "https://avatars.githubusercontent.com",
    );
    if (isGitHubAvatar) {
      const avatar = document.createElement("img");
      avatar.className = "ghflex-eh-avatar";
      avatar.src = meta.avatarUrl;
      avatar.alt = `@${meta.author}`;
      avatar.width = 20;
      avatar.height = 20;
      metaEl.appendChild(avatar);
    }
    const authorSpan = document.createElement("strong");
    authorSpan.textContent = meta.author;
    metaEl.appendChild(authorSpan);
    const timeSpan = document.createElement("span");
    timeSpan.className = "ghflex-eh-time";
    timeSpan.textContent = ` edited ${meta.displayTime}`;
    metaEl.appendChild(timeSpan);
    left.appendChild(metaEl);
  }

  const controls = document.createElement("div");
  controls.className = "ghflex-eh-controls";

  const toggleGroup = document.createElement("div");
  toggleGroup.className = "ghflex-eh-toggle-group";

  const allBtns = [];
  const sideBtn = createToggleBtn("Split", "side", true);
  const unifiedBtn = createToggleBtn("Unified", "unified", false);
  const previewBtn = createToggleBtn("Preview", "preview", false);
  allBtns.push(sideBtn, unifiedBtn, previewBtn);
  for (const btn of allBtns) {
    btn.addEventListener("click", () => switchView(btn.dataset.mode, allBtns));
    toggleGroup.appendChild(btn);
  }
  controls.appendChild(toggleGroup);

  const closeBtn = document.createElement("button");
  closeBtn.className = "ghflex-eh-close";
  closeBtn.title = "Close (Esc)";
  setTrustedHTML(closeBtn, ICONS.close);
  closeBtn.addEventListener("click", destroyOverlay);
  controls.appendChild(closeBtn);

  header.appendChild(left);
  header.appendChild(controls);
  return header;
}

function createToggleBtn(label, mode, active) {
  const btn = document.createElement("button");
  btn.className = `ghflex-eh-toggle-btn${active ? " active" : ""}`;
  btn.dataset.mode = mode;
  btn.textContent = label;
  return btn;
}

function switchView(mode, allBtns) {
  if (state.viewMode === mode) return;
  state.viewMode = mode;
  for (const b of allBtns) {
    b.classList.toggle("active", b.dataset.mode === mode);
  }
  renderDiff();
}

function buildBody() {
  const body = document.createElement("div");
  body.className = "ghflex-eh-body";
  return body;
}

function buildFooter(parts) {
  const footer = document.createElement("div");
  footer.className = "ghflex-eh-footer";
  const stats = document.createElement("span");
  stats.className = "ghflex-eh-stats";
  const { added, removed } = computeStats(parts);
  stats.textContent = `+${added} −${removed} words`;
  footer.appendChild(stats);
  const hint = document.createElement("span");
  hint.className = "ghflex-eh-hint";
  hint.textContent = "Esc to close";
  footer.appendChild(hint);
  return footer;
}

function renderDiff() {
  if (!overlay) return;
  const body = overlay.querySelector(".ghflex-eh-body");
  if (!body) return;
  body.replaceChildren();

  const { parts } = state;

  if (state.viewMode === "preview") {
    renderPreview(body, parts);
  } else if (state.viewMode === "side") {
    renderSideBySide(body, parts);
  } else {
    renderUnified(body, parts);
  }
}

function createSideBySideLayout(body) {
  const container = document.createElement("div");
  container.className = "ghflex-eh-side-container";

  const leftPane = createDiffPane("ghflex-eh-diff-left", "Old");
  const divider = document.createElement("div");
  divider.className = "ghflex-eh-divider";
  const rightPane = createDiffPane("ghflex-eh-diff-right", "New");

  container.appendChild(leftPane);
  container.appendChild(divider);
  container.appendChild(rightPane);
  body.appendChild(container);

  const leftContent = leftPane.querySelector(".ghflex-eh-diff-content");
  const rightContent = rightPane.querySelector(".ghflex-eh-diff-content");
  syncScroll(leftContent, rightContent);

  return { leftContent, rightContent };
}

function renderSideBySide(body, parts) {
  const { oldSegments, newSegments } = buildSideBySide(parts);
  const { leftContent, rightContent } = createSideBySideLayout(body);
  renderSegments(leftContent, oldSegments);
  renderSegments(rightContent, newSegments);
}

function createDiffPane(className, label) {
  const pane = document.createElement("div");
  pane.className = className;
  const paneHeader = document.createElement("div");
  paneHeader.className = "ghflex-eh-pane-header";
  paneHeader.textContent = label;
  const content = document.createElement("div");
  content.className = "ghflex-eh-diff-content";
  pane.appendChild(paneHeader);
  pane.appendChild(content);
  return pane;
}

function renderUnified(body, parts) {
  const segments = buildUnified(parts);
  const container = document.createElement("div");
  container.className = "ghflex-eh-unified-container";
  const content = document.createElement("div");
  content.className = "ghflex-eh-diff-content";
  renderSegments(content, segments);
  container.appendChild(content);
  body.appendChild(container);
}

const MARK_START = "\x01";
const MARK_END = "\x02";

function buildAnnotatedTexts(parts) {
  let oldText = "";
  let newText = "";
  for (const part of parts) {
    if (part.added) {
      newText += MARK_START + part.value + MARK_END;
    } else if (part.removed) {
      oldText += MARK_START + part.value + MARK_END;
    } else {
      oldText += part.value;
      newText += part.value;
    }
  }
  return { oldText, newText };
}

function highlightMarkers(container, className) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    if (walker.currentNode.textContent.includes(MARK_START)) {
      nodes.push(walker.currentNode);
    }
  }
  for (const node of nodes) {
    const frag = document.createDocumentFragment();
    let rest = node.textContent;
    while (rest.length > 0) {
      const si = rest.indexOf(MARK_START);
      if (si === -1) {
        frag.appendChild(document.createTextNode(rest));
        break;
      }
      if (si > 0) frag.appendChild(document.createTextNode(rest.slice(0, si)));
      const ei = rest.indexOf(MARK_END, si);
      if (ei === -1) {
        const span = document.createElement("span");
        span.className = className;
        span.textContent = rest.slice(si + 1);
        frag.appendChild(span);
        break;
      }
      const span = document.createElement("span");
      span.className = className;
      span.textContent = rest.slice(si + 1, ei);
      frag.appendChild(span);
      rest = rest.slice(ei + 1);
    }
    node.parentNode.replaceChild(frag, node);
  }
}

function cleanMarkerAttrs(container) {
  for (const el of container.querySelectorAll("[src], [href]")) {
    for (const attr of ["src", "href"]) {
      const val = el.getAttribute(attr);
      if (val?.includes(MARK_START) || val?.includes(MARK_END)) {
        el.setAttribute(
          attr,
          val.replaceAll(MARK_START, "").replaceAll(MARK_END, ""),
        );
      }
    }
  }
}

function renderPreview(body, parts) {
  const { leftContent, rightContent } = createSideBySideLayout(body);
  leftContent.classList.add("ghflex-eh-preview", "markdown-body");
  rightContent.classList.add("ghflex-eh-preview", "markdown-body");

  const { oldText, newText } = buildAnnotatedTexts(parts);
  renderMarkdown(leftContent, oldText);
  renderMarkdown(rightContent, newText);
  cleanMarkerAttrs(leftContent);
  cleanMarkerAttrs(rightContent);
  highlightMarkers(leftContent, "ghflex-eh-word-removed");
  highlightMarkers(rightContent, "ghflex-eh-word-added");
}

function renderSegments(container, segments) {
  for (const seg of segments) {
    const span = document.createElement("span");
    span.className = `ghflex-eh-word-${seg.type}`;
    span.textContent = seg.text;
    container.appendChild(span);
  }
}

function syncScroll(left, right) {
  if (!left || !right) return;
  let scrolling = false;
  left.addEventListener("scroll", () => {
    if (scrolling) return;
    scrolling = true;
    right.scrollTop = left.scrollTop;
    right.scrollLeft = left.scrollLeft;
    scrolling = false;
  });
  right.addEventListener("scroll", () => {
    if (scrolling) return;
    scrolling = true;
    left.scrollTop = right.scrollTop;
    left.scrollLeft = right.scrollLeft;
    scrolling = false;
  });
}
