// Shared utilities for table feature modules

import { setTrustedHTML } from "../../shared/dom.js";

// Our own controls live inside the header cells - the column-hide button puts a
// "x" in every th. Counting those makes the key depend on WHEN it was taken:
// before the buttons exist it reads "No|Item", after them "Nox|Itemx". A key
// that drifts mid-session silently loses whatever was stored under the old one.
function isInjected(node) {
  return (
    node.nodeType === Node.ELEMENT_NODE &&
    [...node.classList].some((name) => name.startsWith("ghflex-"))
  );
}

export function getTableKey(table) {
  const headers = table.querySelectorAll("thead th");
  if (headers.length === 0) return null;
  return [...headers]
    .map((th) =>
      [...th.childNodes]
        .filter((node) => !isInjected(node))
        .map((node) => node.textContent)
        .join("")
        .trim(),
    )
    .join("|");
}

export function loadJsonStore(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

export function saveJsonStore(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function readTableEntry(storageKey, tableKey) {
  return tableKey ? loadJsonStore(storageKey)[tableKey] : undefined;
}

// Re-reads before writing on purpose: sibling tables on the same page share the
// store, so a cached copy would clobber their entries. undefined removes.
export function writeTableEntry(storageKey, tableKey, value) {
  if (!tableKey) return;
  const all = loadJsonStore(storageKey);
  if (value === undefined) delete all[tableKey];
  else all[tableKey] = value;
  saveJsonStore(storageKey, all);
}

export function createToolbarButton(icon, title, onClick) {
  const button = document.createElement("button");
  button.className = "ghflex-table-toggle";
  setTrustedHTML(button, icon);
  button.title = title;
  button.addEventListener("click", onClick);
  return button;
}
