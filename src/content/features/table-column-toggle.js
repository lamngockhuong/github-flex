import { ICONS } from "../../shared/icons.js";
import {
  createToolbarButton,
  getTableKey,
  readTableEntry,
  writeTableEntry,
} from "./table-utils.js";

const STORAGE_KEY = "ghflex-table-hidden-cols";

function setColumnVisibility(table, colIndex, visible) {
  const display = visible ? "" : "none";
  for (const row of table.rows) {
    if (row.cells[colIndex]) {
      row.cells[colIndex].style.display = display;
    }
  }
  if (table.style.tableLayout === "fixed") {
    const total = [...table.querySelectorAll("thead th")].reduce((sum, th) => {
      if (th.style.display === "none") return sum;
      const w = parseFloat(th.style.width);
      return sum + (Number.isNaN(w) ? 0 : w);
    }, 0);
    if (total > 0) table.style.width = `${total}px`;
  }
}

function updateUI(table, hiddenSet, restoreBtn) {
  const headers = table.querySelectorAll("thead th");
  const visibleCount = headers.length - hiddenSet.size;

  restoreBtn.style.display = hiddenSet.size > 0 ? "" : "none";
  restoreBtn.title = `Show ${hiddenSet.size} hidden column${hiddenSet.size > 1 ? "s" : ""}`;

  table.querySelectorAll(".ghflex-col-hide-btn").forEach((btn, i) => {
    btn.style.display = hiddenSet.has(i) || visibleCount <= 1 ? "none" : "";
  });
}

export function addColumnToggles(table, btnGroup) {
  if (table.dataset.ghflexColToggle) return;

  const headerCells = table.querySelectorAll("thead th");
  if (headerCells.length < 2) return;

  table.dataset.ghflexColToggle = "true";

  const tableKey = getTableKey(table);
  const hiddenSet = new Set(readTableEntry(STORAGE_KEY, tableKey) || []);

  const restoreBtn = createToolbarButton(ICONS.eye, "", () => {
    for (const idx of hiddenSet) {
      setColumnVisibility(table, idx, true);
    }
    hiddenSet.clear();
    writeTableEntry(STORAGE_KEY, tableKey, undefined);
    updateUI(table, hiddenSet, restoreBtn);
  });
  restoreBtn.classList.add("ghflex-table-restore-btn");
  restoreBtn.style.display = "none";
  btnGroup.appendChild(restoreBtn);

  headerCells.forEach((th, i) => {
    const hideBtn = document.createElement("button");
    hideBtn.className = "ghflex-col-hide-btn";
    hideBtn.title = "Hide column";
    hideBtn.textContent = "×";
    hideBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setColumnVisibility(table, i, false);
      hiddenSet.add(i);
      writeTableEntry(STORAGE_KEY, tableKey, [...hiddenSet]);
      updateUI(table, hiddenSet, restoreBtn);
    });
    th.appendChild(hideBtn);
  });

  for (const idx of hiddenSet) {
    setColumnVisibility(table, idx, false);
  }
  updateUI(table, hiddenSet, restoreBtn);
}

export function removeColumnToggles(table) {
  if (!table?.dataset.ghflexColToggle) return;
  delete table.dataset.ghflexColToggle;
  for (const row of table.rows) {
    for (const cell of row.cells) {
      if (cell.style.display === "none") cell.style.display = "";
    }
  }
  for (const btn of table.querySelectorAll(".ghflex-col-hide-btn")) {
    btn.remove();
  }
}

export function removeAllColumnToggles() {
  document
    .querySelectorAll("table[data-ghflex-col-toggle]")
    .forEach(removeColumnToggles);
  for (const btn of document.querySelectorAll(".ghflex-table-restore-btn")) {
    btn.remove();
  }
}
