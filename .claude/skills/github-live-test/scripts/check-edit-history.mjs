// End-to-end check for the Edit History feature on a real edited issue.
// Opens the "edited" menu, picks its first revision, then checks the
// injected Split View button, the widened dialog and the enhanced overlay.
// Usage: node check-edit-history.mjs [issueUrl]
// Requires editHistory enabled (set-settings.mjs editHistory=true).
import { EXT_LINKS } from "../../../../src/shared/constants.js";
import { connect, withPage } from "./browser-lib.mjs";

// Issue #1 of this repo has several revisions.
const url = process.argv[2] || `${EXT_LINKS.issues}/1`;
const WAIT = { timeout: 10000 };

const appears = (locator) =>
  locator
    .waitFor(WAIT)
    .then(() => true)
    .catch(() => false);

const { context } = await connect();
const report = await withPage(
  context,
  async (page) => {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    // Locator clicks wait for their target, so no fixed sleeps are needed.
    await page.locator('button:has-text("edited")').first().click(WAIT);
    await page.getByRole("menuitem").first().click(WAIT);

    const dialog = page.locator('[role="dialog"]').first();
    const button = page.locator("#ghflex-eh-enhance-btn");
    await dialog.waitFor(WAIT);
    const result = {
      splitViewButton: await appears(button),
      dialogWidth: Math.round((await dialog.boundingBox())?.width || 0),
    };
    if (result.splitViewButton) {
      await button.click();
      result.overlayOpened = await appears(page.locator(".ghflex-eh-body"));
      result.paneTextLengths = (
        await page.locator(".ghflex-eh-diff-content").allInnerTexts()
      ).map((text) => text.length);
    }
    return result;
  },
  1600,
  1000,
);

console.log(JSON.stringify(report, null, 2));
process.exit(report.overlayOpened ? 0 : 1);
