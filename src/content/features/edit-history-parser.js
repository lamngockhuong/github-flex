const SELECTORS = {
  dialog: '[class*="EditHistoryDialog-module__EditHistoryDialogContainer"]',
  header: '[class*="EditHistoryDialogHeader-module"]',
  diffContainer: '[class*="GroupedTextDiffViewer-module__diffContainer"]',
  diffLine: '[class*="GroupedTextDiffViewer-module__diffLine"]',
  borderAdded: '[class*="borderStylingAdded"]',
  borderRemoved: '[class*="borderStylingRemoved"]',
  borderChanged: '[class*="borderStylingChanged"]',
  wordAdded: '[class*="wordStylingAdded"]',
  wordRemoved: '[class*="wordStylingRemoved"]',
  avatar: '[class*="userAvatar"],[data-component="Avatar"]',
  username: '[class*="usernameBold"], [class*="EditHistoryDialogHeader"] a',
  timestamp: "relative-time",
};

export function findDialog() {
  return document.querySelector(SELECTORS.dialog);
}

export function parseMeta(dialog) {
  const avatar = dialog.querySelector(SELECTORS.avatar);
  const username = dialog.querySelector(SELECTORS.username);
  const time = dialog.querySelector(SELECTORS.timestamp);
  return {
    avatarUrl: avatar?.src || "",
    author: username?.textContent?.trim() || "",
    displayTime: time?.textContent || "",
  };
}

export function parseDiff(dialog) {
  const container = dialog.querySelector(SELECTORS.diffContainer);
  if (!container) return null;

  const oldLines = [];
  const newLines = [];

  for (const row of container.children) {
    const lineEl = row.querySelector(SELECTORS.diffLine);
    if (!lineEl) continue;

    const isAdded = row.matches(SELECTORS.borderAdded);
    const isRemoved = row.matches(SELECTORS.borderRemoved);
    const isChanged = row.matches(SELECTORS.borderChanged);

    if (isChanged) {
      const { oldText, newText } = parseChangedLine(lineEl);
      oldLines.push(oldText);
      newLines.push(newText);
    } else if (isAdded) {
      newLines.push(getVisibleText(lineEl));
    } else if (isRemoved) {
      oldLines.push(getVisibleText(lineEl));
    } else {
      const text = getVisibleText(lineEl);
      oldLines.push(text);
      newLines.push(text);
    }
  }

  return { oldText: oldLines.join("\n"), newText: newLines.join("\n") };
}

function parseChangedLine(lineEl) {
  let oldText = "";
  let newText = "";

  for (const child of lineEl.children) {
    if (child.classList.contains("sr-only")) continue;
    const isWordAdded = child.matches(SELECTORS.wordAdded);
    const isWordRemoved = child.matches(SELECTORS.wordRemoved);

    if (isWordAdded) {
      newText += child.textContent;
    } else if (isWordRemoved) {
      oldText += child.textContent;
    } else {
      oldText += child.textContent;
      newText += child.textContent;
    }
  }

  return { oldText, newText };
}

function getVisibleText(lineEl) {
  let text = "";
  for (const child of lineEl.children) {
    if (child.classList.contains("sr-only")) continue;
    text += child.textContent;
  }
  return text;
}
