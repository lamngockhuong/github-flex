// Shared helpers for driving the logged-in test browser over CDP.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
export const PROFILE_DIR = path.join(REPO_ROOT, ".playwright-profile");
export const EXT_DIR = path.join(REPO_ROOT, "dist", "chrome");
export const CDP_PORT = Number(process.env.GHFLEX_CDP_PORT || 9333);
export const CDP_URL = `http://127.0.0.1:${CDP_PORT}`;

// GitHub hydrates React views after DOMContentLoaded and has no single
// "ready" signal, so layout probes wait a fixed time.
const SETTLE_MS = 4000;

export async function isBrowserUp() {
  try {
    const res = await fetch(`${CDP_URL}/json/version`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function connect() {
  if (!(await isBrowserUp())) {
    throw new Error(
      `No test browser on ${CDP_URL}. Start it with launch-browser.mjs first.`,
    );
  }
  const browser = await chromium.connectOverCDP(CDP_URL);
  return { browser, context: browser.contexts()[0] };
}

// Opens a fresh tab at a fixed desktop size so widths are comparable.
export async function newPage(context, width = 1920, height = 1000) {
  const page = await context.newPage();
  await page.setViewportSize({ width, height });
  return page;
}

export async function gotoSettled(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(SETTLE_MS);
}

export async function extensionWorker(context) {
  const worker = context.serviceWorkers()[0];
  if (worker) return worker;
  try {
    return await context.waitForEvent("serviceworker", { timeout: 10000 });
  } catch {
    throw new Error(
      "Extension service worker not found. Is dist/chrome built and loaded? Restart with close-browser.mjs + launch-browser.mjs.",
    );
  }
}

// Closes the tab even when the script body throws, so tabs do not pile up
// in the long-lived logged-in browser.
export async function withPage(context, run, width, height) {
  const page = await newPage(context, width, height);
  try {
    return await run(page);
  } finally {
    await page.close();
  }
}
