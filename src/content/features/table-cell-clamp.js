import { setTrustedHTML } from "../../shared/dom.js";
import { ICONS } from "../../shared/icons.js";
import {
  createToolbarButton,
  getTableKey,
  readTableEntry,
  writeTableEntry,
} from "./table-utils.js";

const STORAGE_KEY = "ghflex-table-cells-unclamped";
// Container-level state carries a name; cell-level markers stay literal, as
// the rest of the file has them.
const UNCLAMPED_CLASS = "ghflex-cells-unclamped";
const ROW_OPEN_CLASS = "ghflex-row-open";
const SOURCE_CLASS = "ghflex-cell-source";
const ROW_HEIGHT_VAR = "--ghflex-row-height";
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

// Clamping is suspended for the whole table by the toggle button. While it is,
// measuring is meaningless and clicks must not toggle state nothing can show.
const isClamping = (table) => !table.classList.contains(UNCLAMPED_CLASS);

// Move (never clone) the cell's children into the wrapper, so listeners bound
// by other features - image-lightbox in particular - survive the wrap.
function wrapCells(table) {
  for (const td of table.querySelectorAll("tbody td")) {
    // once wrapped, the wrapper is the cell's only child
    if (td.firstElementChild?.classList.contains("ghflex-cell-clamp")) continue;
    const wrapper = document.createElement("div");
    wrapper.className = "ghflex-cell-clamp";
    wrapper.append(...td.childNodes);
    td.appendChild(wrapper);
  }
}

// Expanding is a row operation, not a cell one: the clicked cell decides the
// height and every other cell in the row is released up to it, so lines that
// belong to the same record stay side by side instead of being uncovered one
// cell at a time. The height rides an inline custom property on the row, which
// the cells' own max-height reads as its fallback - the same inheritance the
// row-striped fade colour uses, so no extra rule and no specificity to juggle.
//
// Only the row keeps state that outlives an unwrap, so clearing it is split out
// for teardown, which would otherwise touch cells it destroys moments later.
function clearRowState(row) {
  row.classList.remove(ROW_OPEN_CLASS);
  row.style.removeProperty(ROW_HEIGHT_VAR);
}

function collapseRow(row) {
  if (!row) return;
  clearRowState(row);
  for (const w of row.querySelectorAll(".ghflex-cell-clamp")) {
    w.classList.remove("ghflex-cell-open", SOURCE_CLASS);
  }
}

// heightOf is an optional wrapper -> scrollHeight map from a caller that has
// already measured the table, so rebuilding a row costs no further layout.
function expandRow(row, source, heightOf) {
  if (!row) return;

  const wrappers = [...row.querySelectorAll(".ghflex-cell-clamp")];
  // Read every height before the first class write - scrollHeight is the full
  // content height regardless of the cap, so one layout serves the whole row.
  const measure = (w) => heightOf?.get(w) ?? w.scrollHeight;
  const heights = wrappers.map(measure);
  const height = measure(source);

  row.style.setProperty(ROW_HEIGHT_VAR, `${height}px`);
  row.classList.add(ROW_OPEN_CLASS);
  wrappers.forEach((w, i) => {
    w.classList.toggle(SOURCE_CLASS, w === source);
    // A cell that fits inside the row height has nothing left to reveal, so it
    // is opened outright and loses its fade. +1 for fractional line heights.
    w.classList.toggle("ghflex-cell-open", heights[i] <= height + 1);
  });
}

// Mark only the cells that genuinely overflow. Guarded so a deferred callback
// that outlived teardown - a late image load, a pending timer - stays inert.
function detectOverflow(table) {
  if (!table?.dataset.ghflexCellClamp) return;
  // the toggle re-runs detection the moment clamping comes back on
  if (!isClamping(table)) return;

  // Open rows are torn down before measuring so every cell is judged against
  // the base clamp, then rebuilt from the same source cell. The stored pixel
  // height cannot simply be put back: the width change that triggered this pass
  // is what changed the content height that height was derived from.
  const sources = [...table.querySelectorAll(`.${SOURCE_CLASS}`)];
  const openRows = sources.map((source) => source.closest("tr"));
  for (const row of openRows) collapseRow(row);

  // Batch the passes: interleaving class writes with geometry reads forces a
  // synchronous reflow per cell. Read every height, then write the results
  // back - only the first read costs a layout. The measurements carry over to
  // expandRow too, so rebuilding the open rows adds no further layout.
  const wrappers = [...table.querySelectorAll(".ghflex-cell-clamp")];
  const heightOf = new Map(wrappers.map((w) => [w, w.scrollHeight]));
  // +1 tolerance: scrollHeight is off-by-one on fractional line heights
  const overflows = wrappers.map((w) => heightOf.get(w) > w.clientHeight + 1);
  wrappers.forEach((w, i) => {
    w.classList.toggle("ghflex-cell-clamped", overflows[i]);
  });

  for (const [i, row] of openRows.entries()) {
    expandRow(row, sources[i], heightOf);
  }
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
  // detectOverflow leaves the clamped markers stale while unclamped, so without
  // this the click would toggle open state that nothing renders - and that
  // phantom state comes back the moment clamping is switched on again.
  if (!isClamping(e.currentTarget)) return;
  if (e.target.closest("a, button, img, input, select, textarea, summary")) {
    return;
  }
  const wrapper = e.target.closest(".ghflex-cell-clamp");
  if (!wrapper) return;

  // A cut cell expands its row to itself - including a second cell of a row
  // that is already open, which just re-measures. Anything else closes the row,
  // so a fully shown cell reads as "click again to collapse".
  // Cut off means a click still has something to show. A cell can overflow the
  // base clamp and yet be fully visible inside an open row.
  const row = wrapper.closest("tr");
  const cut =
    wrapper.classList.contains("ghflex-cell-clamped") &&
    !wrapper.classList.contains("ghflex-cell-open");
  if (!cut && !row?.classList.contains(ROW_OPEN_CLASS)) return;

  // a click that ends a text selection in this cell must not collapse it
  const selection = window.getSelection();
  if (
    selection &&
    !selection.isCollapsed &&
    wrapper.contains(selection.anchorNode)
  ) {
    return;
  }

  if (cut) expandRow(row, wrapper);
  else collapseRow(row);
}

function onCellContentSettled(e) {
  scheduleDetect(e.currentTarget);
}

function createToggleButton(table, tableKey) {
  const syncUI = () => {
    const clamping = isClamping(table);
    setTrustedHTML(button, clamping ? ICONS.unfoldRows : ICONS.foldRows);
    button.title = clamping ? "Show full cells" : "Clamp tall cells";
  };

  const button = createToolbarButton(
    ICONS.unfoldRows,
    "Show full cells",
    () => {
      const unclamped = table.classList.toggle(UNCLAMPED_CLASS);
      // undefined removes the entry - only the non-default state is stored
      writeTableEntry(STORAGE_KEY, tableKey, unclamped ? true : undefined);
      syncUI();
      detectOverflow(table);
    },
  );
  button.classList.add("ghflex-cells-toggle");

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
  // Seed the baseline before observing: a fresh observation always fires one
  // callback, which would otherwise clear the deadband and queue a second,
  // identical detection pass 100ms later.
  lastWidths.set(table, table.clientWidth);
  widthObserver.observe(table);
  btnGroup.appendChild(createToggleButton(table, tableKey));
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

  // Rows outlive the unwrap below, so their state is cleared; the cell markers
  // go with the wrappers that are about to be destroyed.
  for (const row of table.querySelectorAll(`tr.${ROW_OPEN_CLASS}`)) {
    clearRowState(row);
  }

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
