// Shared utilities for table feature modules

export function getTableKey(table) {
  const headers = table.querySelectorAll("thead th");
  if (headers.length === 0) return null;
  return [...headers].map((th) => th.textContent.trim()).join("|");
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
