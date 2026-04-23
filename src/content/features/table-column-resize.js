import { getTableKey, loadJsonStore, saveJsonStore } from "./table-utils.js";

const STORAGE_KEY = "ghflex-table-col-widths";
const MIN_COL_WIDTH = 50;

let activeDragCleanup = null;

function applyWidths(table, headerCells, widths) {
  table.style.tableLayout = "fixed";
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
      const all = loadJsonStore(STORAGE_KEY);
      all[tableKey] = widths;
      saveJsonStore(STORAGE_KEY, all);
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
  const saved = tableKey ? loadJsonStore(STORAGE_KEY)[tableKey] : null;

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
  table.style.tableLayout = "";
  table.style.width = "";
  table.classList.remove("ghflex-table-resizing");
  for (const h of table.querySelectorAll(".ghflex-col-resize-handle")) {
    h.remove();
  }
  table.querySelectorAll("thead th").forEach((th) => {
    th.style.width = "";
    th.style.position = "";
  });
}

export function removeAllResizeHandles() {
  document
    .querySelectorAll("table[data-ghflex-resizable]")
    .forEach(removeResizeHandles);
}
