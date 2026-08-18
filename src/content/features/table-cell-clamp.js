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

// Mark only the cells that genuinely overflow. Guarded so a deferred callback
// that outlived teardown - a late image load, a pending timer - stays inert.
function detectOverflow(table) {
  if (!table?.dataset.ghflexCellClamp) return;
  // the toggle re-runs detection the moment clamping comes back on
  if (!isClamping(table)) return;

  // Cells of an open row are uncapped, so clientHeight equals scrollHeight and
  // every one of them would measure as fitting. Close the rows for the
  // measurement and put them straight back - there is no height to recompute,
  // only a class, so nothing here can go stale.
  const openRows = [...table.querySelectorAll(`tr.${ROW_OPEN_CLASS}`)];
  for (const row of openRows) row.classList.remove(ROW_OPEN_CLASS);

  // Batch the passes: interleaving class writes with geometry reads forces a
  // synchronous reflow per cell. Read every height, then write the results
  // back - only the first read costs a layout.
  const wrappers = [...table.querySelectorAll(".ghflex-cell-clamp")];
  // +1 tolerance: scrollHeight is off-by-one on fractional line heights
  const overflows = wrappers.map((w) => w.scrollHeight > w.clientHeight + 1);
  wrappers.forEach((w, i) => {
    w.classList.toggle("ghflex-cell-clamped", overflows[i]);
  });

  for (const row of openRows) row.classList.add(ROW_OPEN_CLASS);
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

  // Expanding is a row operation, not a cell one: one click releases every cell
  // of the row, so the lines of a single record can be read side by side instead
  // of being uncovered one cell at a time. Only a cell with something hidden can
  // open a row; once open, a click on any of its cells closes it again.
  const row = wrapper.closest("tr");
  if (!row) return;
  if (
    !row.classList.contains(ROW_OPEN_CLASS) &&
    !wrapper.classList.contains("ghflex-cell-clamped")
  ) {
    return;
  }

  // a click that ends a text selection in this cell must not collapse it
  const selection = window.getSelection();
  if (
    selection &&
    !selection.isCollapsed &&
    wrapper.contains(selection.anchorNode)
  ) {
    return;
  }

  row.classList.toggle(ROW_OPEN_CLASS);
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

  // Rows outlive the unwrap below, so their state is cleared by hand; the cell
  // markers go with the wrappers that are about to be destroyed.
  for (const row of table.querySelectorAll(`tr.${ROW_OPEN_CLASS}`)) {
    row.classList.remove(ROW_OPEN_CLASS);
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
