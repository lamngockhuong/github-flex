// Read or change the extension's stored settings (chrome.storage.sync).
// Usage:
//   node set-settings.mjs                    print stored and effective settings
//   node set-settings.mjs editHistory=true   merge keys into stored settings
//   node set-settings.mjs --clear            wipe storage (fresh-install defaults)
// Content scripts read settings at page load: reload the tab afterwards.
import {
  SETTINGS_DEFAULTS,
  STORAGE_KEYS,
} from "../../../../src/shared/constants.js";
import { connect, extensionWorker } from "./browser-lib.mjs";

function fail(message) {
  console.error(message);
  process.exit(1);
}

const args = process.argv.slice(2);
const clear = args.includes("--clear");
const updates = {};
for (const arg of args.filter((a) => a.includes("="))) {
  const eq = arg.indexOf("=");
  const key = arg.slice(0, eq);
  const raw = arg.slice(eq + 1);
  if (!Object.hasOwn(SETTINGS_DEFAULTS, key)) {
    fail(
      `Unknown setting "${key}". Known: ${Object.keys(SETTINGS_DEFAULTS).join(", ")}`,
    );
  }
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    value = raw;
  }
  // A typo like "treu" would be stored as a truthy string and enable the feature.
  if (typeof value !== typeof SETTINGS_DEFAULTS[key]) {
    fail(`"${key}" expects a ${typeof SETTINGS_DEFAULTS[key]}, got "${raw}"`);
  }
  updates[key] = value;
}

const { context } = await connect();
const worker = await extensionWorker(context);
const stored = await worker.evaluate(
  async ({ clear, updates, key }) => {
    if (clear) await chrome.storage.sync.clear();
    const current = (await chrome.storage.sync.get(key))[key] || {};
    if (Object.keys(updates).length) {
      await chrome.storage.sync.set({ [key]: { ...current, ...updates } });
    }
    return (await chrome.storage.sync.get(key))[key] || {};
  },
  { clear, updates, key: STORAGE_KEYS.SETTINGS },
);
console.log(`stored:    ${JSON.stringify(stored)}`);
console.log(
  `effective: ${JSON.stringify({ ...SETTINGS_DEFAULTS, ...stored })}`,
);
process.exit(0);
