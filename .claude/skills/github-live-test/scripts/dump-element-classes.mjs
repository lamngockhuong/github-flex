// Dump an element's outerHTML and a class-name histogram, to rebuild selectors
// after GitHub renames its CSS module classes.
// Usage: node dump-element-classes.mjs url selector [out.html]
// The HTML comes from a logged-in session: write it outside tracked paths.
import fs from "node:fs";
import { connect, withPage } from "./browser-lib.mjs";

const [url, selector, out] = process.argv.slice(2);
if (!url || !selector) {
  console.error("Usage: node dump-element-classes.mjs url selector [out.html]");
  process.exit(1);
}

const { context } = await connect();
const result = await withPage(context, async (page) => {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(selector, { timeout: 15000 }).catch(() => {});
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const counts = {};
    for (const node of [el, ...el.querySelectorAll("[class]")]) {
      for (const cls of node.classList) counts[cls] = (counts[cls] || 0) + 1;
    }
    return { html: el.outerHTML, counts };
  }, selector);
});

if (!result) {
  console.error(`No element matches ${selector} on ${url}`);
  process.exit(1);
}
if (out) fs.writeFileSync(out, result.html);
const rows = Object.entries(result.counts).sort((a, b) => b[1] - a[1]);
for (const [cls, n] of rows) console.log(`${String(n).padStart(5)}  ${cls}`);
console.log(`(${result.html.length} chars${out ? ` written to ${out}` : ""})`);
process.exit(0);
