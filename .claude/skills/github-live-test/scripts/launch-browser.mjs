// Launch headed Chromium with dist/chrome loaded and CDP exposed.
// Usage: node launch-browser.mjs [url]   (run in background; stays alive)
import fs from "node:fs";
import { chromium } from "playwright";
import {
  CDP_PORT,
  CDP_URL,
  EXT_DIR,
  isBrowserUp,
  PROFILE_DIR,
} from "./browser-lib.mjs";

const url = process.argv[2] || "https://github.com/";

if (!fs.existsSync(`${EXT_DIR}/manifest.json`)) {
  console.error(`Missing ${EXT_DIR}. Run "pnpm build:chrome" first.`);
  process.exit(1);
}
if (await isBrowserUp()) {
  console.error(`A browser already listens on ${CDP_URL}. Close it first.`);
  process.exit(1);
}

const context = await chromium
  .launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: null,
    args: [
      `--disable-extensions-except=${EXT_DIR}`,
      `--load-extension=${EXT_DIR}`,
      `--remote-debugging-port=${CDP_PORT}`,
      "--window-size=1920,1080",
    ],
  })
  .catch((err) => {
    console.error(
      `Launch failed (profile may be in use by an orphan Chromium): ${err.message}`,
    );
    process.exit(1);
  });
const page = context.pages()[0] || (await context.newPage());
await page.goto(url);

// Logged-out pages may lack the meta tag: do not wait the default 30s.
const loggedIn = await page
  .locator('meta[name="user-login"]')
  .getAttribute("content", { timeout: 5000 })
  .catch(() => "");
console.log(`READY ${CDP_URL} profile=${PROFILE_DIR}`);
console.log(loggedIn ? `LOGGED_IN as ${loggedIn}` : "NOT_LOGGED_IN");

context.on("close", () => process.exit(0));
