import { getTableKey, readTableEntry, writeTableEntry } from "./table-utils.js";

const STORAGE_KEY = "ghflex-table-col-widths";
const MIN_COL_WIDTH = 50;

let activeDragCleanup = null;

// Collapsed and expanded are two reading modes with very different available
// width, so each keeps its own column widths. Sharing one set meant widths
// dragged while expanded were restored onto the collapsed table, which then
// opened as wide as the expanded one. Fullscreen counts as expanded.
function stateOf(table) {
  if (table.classList.contains("ghflex-table-fullscreen-table")) {
    return "expanded";
  }
  const container = table.closest(".ghflex-table-container");
  return container?.classList.contains("ghflex-table-expanded")
    ? "expanded"
    : "collapsed";
}

function readWidths(table, tableKey) {
  const stored = readTableEntry(STORAGE_KEY, tableKey);
  if (!stored) return null;
  // a bare array predates per-state widths - honour it for either state
  if (Array.isArray(stored)) return stored;
  return stored[stateOf(table)] ?? null;
}

function saveWidths(table, tableKey, widths) {
  const stored = readTableEntry(STORAGE_KEY, tableKey);
  // migrate a legacy array by seeding both states before overwriting one
  const entry = Array.isArray(stored)
    ? { collapsed: stored, expanded: stored }
    : { ...stored };
  entry[stateOf(table)] = widths;
  writeTableEntry(STORAGE_KEY, tableKey, entry);
}

function clearWidths(table, headerCells) {
  table.style.tableLayout = "";
  table.style.width = "";
  table.style.removeProperty("max-width");
  headerCells.forEach((th) => {
    th.style.width = "";
  });
}

function applyWidths(table, headerCells, widths) {
  table.style.tableLayout = "fixed";
  // GitHub caps .markdown-body table at max-width:100%, which would swallow any
  // drag that widens the table past its container - resizing would only appear
  // to work in expanded mode, where a CSS rule already lifts the cap. The
  // container scrolls horizontally, so releasing the cap is safe here.
  table.style.setProperty("max-width", "none", "important");
  table.style.width = `${widths.reduce((sum, w) => sum + w, 0)}px`;
  headerCells.forEach((th, i) => {
    th.style.width = `${widths[i]}px`;
  });
}

function startResize(e, table, headerCells, colIndex, tableKey) {
  e.preventDefault();
  e.stopPropagation();

  if (table.style.tableLayout !== "fixed") {
    const currentWidths = [...headerCells].map(
      (th) => th.getBoundingClientRect().width,
    );
    applyWidths(table, headerCells, currentWidths);
  }

  const startX = e.pageX;
  const startWidth = parseFloat(headerCells[colIndex].style.width);

  table.classList.add("ghflex-table-resizing");
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";

  const onMouseMove = (moveEvent) => {
    const newWidth = Math.max(
      MIN_COL_WIDTH,
      startWidth + moveEvent.pageX - startX,
    );
    headerCells[colIndex].style.width = `${newWidth}px`;
    // Use specified (style.width) not rendered (getBoundingClientRect) widths
    // to avoid table-layout:fixed constraining the calculation
    const total = [...headerCells].reduce(
      (sum, th) => sum + parseFloat(th.style.width),
      0,
    );
    table.style.width = `${total}px`;
  };

  const cleanup = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", cleanup);
    table.classList.remove("ghflex-table-resizing");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    activeDragCleanup = null;

    if (tableKey) {
      const widths = [...headerCells].map((th) =>
        Math.round(parseFloat(th.style.width)),
      );
      saveWidths(table, tableKey, widths);
    }
  };

  activeDragCleanup = cleanup;
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", cleanup);
}

export function addResizeHandles(table) {
  if (table.dataset.ghflexResizable) return;

  const headerCells = table.querySelectorAll("thead th");
  if (headerCells.length < 2) return;

  table.dataset.ghflexResizable = "true";

  const tableKey = getTableKey(table);
  const saved = readWidths(table, tableKey);

  if (saved && saved.length === headerCells.length) {
    applyWidths(table, headerCells, saved);
  }

  headerCells.forEach((th, i) => {
    th.style.position = "relative";

    const handle = document.createElement("div");
    handle.className = "ghflex-col-resize-handle";
    handle.addEventListener("mousedown", (e) =>
      startResize(e, table, headerCells, i, tableKey),
    );
    th.appendChild(handle);
  });
}

export function removeResizeHandles(table) {
  if (!table?.dataset.ghflexResizable) return;
  if (activeDragCleanup) activeDragCleanup();
  delete table.dataset.ghflexResizable;
  const headerCells = table.querySelectorAll("thead th");
  clearWidths(table, headerCells);
  table.classList.remove("ghflex-table-resizing");
  for (const h of table.querySelectorAll(".ghflex-col-resize-handle")) {
    h.remove();
  }
  headerCells.forEach((th) => {
    th.style.position = "";
  });
}

// Expand/collapse swaps which stored width set applies, so the caller must
// re-apply after toggling. No widths saved for the new state means reverting to
// the browser's own column sizing rather than carrying the other state's over.
export function refreshColumnWidths(table) {
  if (!table?.dataset.ghflexResizable) return;
  const headerCells = table.querySelectorAll("thead th");
  const widths = readWidths(table, getTableKey(table));
  if (widths && widths.length === headerCells.length) {
    applyWidths(table, headerCells, widths);
  } else {
    clearWidths(table, headerCells);
  }
}

export function removeAllResizeHandles() {
  document
    .querySelectorAll("table[data-ghflex-resizable]")
    .forEach(removeResizeHandles);
}
