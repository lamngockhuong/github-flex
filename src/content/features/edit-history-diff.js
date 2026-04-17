// Diff computation using jsdiff library
import { diffWords } from "diff";

export function computeWordDiff(oldText, newText) {
  return diffWords(oldText, newText);
}

export function computeStats(parts) {
  let added = 0;
  let removed = 0;
  for (const part of parts) {
    const words = part.value.trim().split(/\s+/).filter(Boolean).length;
    if (part.added) added += words;
    else if (part.removed) removed += words;
  }
  return { added, removed };
}

export function buildSideBySide(parts) {
  const oldSegments = [];
  const newSegments = [];

  for (const part of parts) {
    if (part.added) {
      newSegments.push({ text: part.value, type: "added" });
    } else if (part.removed) {
      oldSegments.push({ text: part.value, type: "removed" });
    } else {
      oldSegments.push({ text: part.value, type: "unchanged" });
      newSegments.push({ text: part.value, type: "unchanged" });
    }
  }

  return { oldSegments, newSegments };
}

export function buildUnified(parts) {
  return parts.map((part) => {
    if (part.added) return { text: part.value, type: "added" };
    if (part.removed) return { text: part.value, type: "removed" };
    return { text: part.value, type: "unchanged" };
  });
}
