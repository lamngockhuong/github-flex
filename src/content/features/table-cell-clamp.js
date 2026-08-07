import { setTrustedHTML } from "../../shared/dom.js";
import { ICONS } from "../../shared/icons.js";
import {
  createToolbarButton,
  getTableKey,
  readTableEntry,
  writeTableEntry,
} from "./table-utils.js";

const STORAGE_KEY = "ghflex-table-cells-unclamped";
const UNCLAMPED_CLASS = "ghflex-cells-unclamped";
const DETECT_DEBOUNCE = 100;

// Content that grows after wrapping - an image finishing load, a <details>
// opening - changes cell height only, which the width observer ignores by
// design. These events do not bubble but do run the capture phase, so one
// listener per table covers every descendant, including nodes added later.
const CONTENT_EVENTS = ["load", "error", "toggle"];

const lastWidths = new WeakMap();
const detectTimers = new WeakMap();

// Narrowing a column changes what overflows. One shared observer catches column
// drag, window resize, wide layout and column hide alike.
const widthObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const width = entry.contentRect.width;
    // height changes (a cell opening) must not re-trigger detection
    if (Math.abs(width - (lastWidths.get(entry.target) ?? -1)) < 1) continue;
    lastWidths.set(entry.target, width);
    scheduleDetect(entry.target);
  }
});

// Move (never clone) the cell's children into the wrapper, so listeners bound
// by other features - image-lightbox in particular - survive the wrap.
function wrapCells(table) {
  for (const td of table.querySelectorAll("tbody td")) {
    if (td.querySelector(":scope > .ghflex-cell-clamp")) continue;
    const wrapper = document.createElement("div");
    wrapper.className = "ghflex-cell-clamp";
    wrapper.append(...td.childNodes);
    td.appendChild(wrapper);
  }
}

// Mark only the cells that genuinely overflow. Guarded so a deferred callback
// that outlived teardown - a late image load, a pending timer - stays inert.
function detectOverflow(table) {
  if (!table?.dataset.ghflexCellClamp) return;
  // measuring while unclamped is meaningless (max-height is none); the toggle
  // re-runs detection the moment clamping comes back on
  if (table.classList.contains(UNCLAMPED_CLASS)) return;

  // Batch the passes: interleaving class writes with geometry reads forces a
  // synchronous reflow per cell. Strip open state, read every height, then
  // write the results back - only the first read costs a layout.
  const wrappers = [...table.querySelectorAll(".ghflex-cell-clamp")];
  const wasOpen = wrappers.map((w) => w.classList.contains("ghflex-cell-open"));
  for (const w of wrappers) w.classList.remove("ghflex-cell-open");
  // +1 tolerance: scrollHeight is off-by-one on fractional line heights
  const overflows = wrappers.map((w) => w.scrollHeight > w.clientHeight + 1);

  wrappers.forEach((w, i) => {
    w.classList.toggle("ghflex-cell-clamped", overflows[i]);
    w.classList.toggle("ghflex-cell-open", wasOpen[i]);
  });
}

function scheduleDetect(table) {
  clearTimeout(detectTimers.get(table));
  detectTimers.set(
    table,
    setTimeout(() => detectOverflow(table), DETECT_DEBOUNCE),
  );
}

// One delegated listener per table, not one per cell.
function onTableClick(e) {
  if (e.target.closest("a, button, img, input, select, textarea, summary")) {
    return;
  }
  const wrapper = e.target.closest(".ghflex-cell-clamp.ghflex-cell-clamped");
  if (!wrapper) return;

  // a click that ends a text selection in this cell must not collapse it
  const selection = window.getSelection();
  if (
    selection &&
    !selection.isCollapsed &&
    wrapper.contains(selection.anchorNode)
  ) {
    return;
  }
  wrapper.classList.toggle("ghflex-cell-open");
}

function onCellContentSettled(e) {
  scheduleDetect(e.currentTarget);
}

function createToggleButton(table, tableKey) {
  const button = createToolbarButton(
    ICONS.unfoldRows,
    "Show full cells",
    () => {
      const unclamped = table.classList.toggle(UNCLAMPED_CLASS);
      writeTableEntry(STORAGE_KEY, tableKey, unclamped || undefined);
      syncUI();
      detectOverflow(table);
    },
  );
  button.classList.add("ghflex-cells-toggle");

  const syncUI = () => {
    const unclamped = table.classList.contains(UNCLAMPED_CLASS);
    setTrustedHTML(button, unclamped ? ICONS.foldRows : ICONS.unfoldRows);
    button.title = unclamped ? "Clamp tall cells" : "Show full cells";
  };

  syncUI();
  return button;
}

export function addCellClamps(table, btnGroup) {
  if (table.dataset.ghflexCellClamp) return;
  if (!table.querySelector("tbody td")) return;

  table.dataset.ghflexCellClamp = "true";
  wrapCells(table);

  const tableKey = getTableKey(table);
  if (readTableEntry(STORAGE_KEY, tableKey)) {
    table.classList.add(UNCLAMPED_CLASS);
  }

  detectOverflow(table);
  table.addEventListener("click", onTableClick);
  for (const type of CONTENT_EVENTS) {
    table.addEventListener(type, onCellContentSettled, true);
  }
  widthObserver.observe(table);
  btnGroup.appendChild(createToggleButton(table, tableKey));
}

// The feature stylesheet is injected as a <link> and loads asynchronously, so
// the first detection pass can run before max-height exists - measuring every
// cell as fitting. table-expand re-runs detection once the sheet lands.
export function refreshAllCellClamps() {
  document
    .querySelectorAll("table[data-ghflex-cell-clamp]")
    .forEach(detectOverflow);
}

export function removeCellClamps(table) {
  if (!table?.dataset.ghflexCellClamp) return;
  delete table.dataset.ghflexCellClamp;

  table.removeEventListener("click", onTableClick);
  for (const type of CONTENT_EVENTS) {
    table.removeEventListener(type, onCellContentSettled, true);
  }
  widthObserver.unobserve(table);
  lastWidths.delete(table);
  clearTimeout(detectTimers.get(table));
  detectTimers.delete(table);

  // Restore the original DOM exactly: move children back, drop the wrapper.
  for (const wrapper of table.querySelectorAll(".ghflex-cell-clamp")) {
    wrapper.parentNode?.append(...wrapper.childNodes);
    wrapper.remove();
  }
  table.classList.remove(UNCLAMPED_CLASS);
}

export function removeAllCellClamps() {
  document
    .querySelectorAll("table[data-ghflex-cell-clamp]")
    .forEach(removeCellClamps);
  for (const btn of document.querySelectorAll(".ghflex-cells-toggle")) {
    btn.remove();
  }
}
