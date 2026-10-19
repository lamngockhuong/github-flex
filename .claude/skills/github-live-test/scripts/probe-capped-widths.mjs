// List elements still capped by max-width (what Wide Layout should remove).
// Usage: node probe-capped-widths.mjs [--chain] [--toggle] [--css file.css] url...
//   --chain     also print each element's ancestor chain (to write selectors)
//   --toggle    also list what gets capped with Wide Layout disabled
//   --css FILE  inject a candidate stylesheet before measuring
import fs from "node:fs";
import { parseArgs } from "node:util";
import { connect, gotoSettled, withPage } from "./browser-lib.mjs";

// Same class as DISABLED_CLASS in src/content/features/wide-layout.js.
const WIDE_LAYOUT_DISABLED_CLASS = "ghflex-wide-layout-disabled";
const MAX_RESULTS = 10;

const { values: opts, positionals: urls } = parseArgs({
  options: {
    chain: { type: "boolean" },
    toggle: { type: "boolean" },
    css: { type: "string" },
  },
  allowPositionals: true,
});
const css = opts.css ? fs.readFileSync(opts.css, "utf8") : null;

function listCapped(page) {
  return page.evaluate(
    ({ withChain, limit }) => {
      const describe = (el) => {
        const cls =
          typeof el.className === "string" && el.className.trim()
            ? `.${el.className.trim().split(/\s+/).join(".")}`
            : "";
        return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${cls}`;
      };
      const lines = [];
      for (const el of document.querySelectorAll("body *")) {
        // Wide, but clearly narrower than the viewport: a content cap.
        // Width first: it rejects most elements before the style lookup.
        const w = el.getBoundingClientRect().width;
        if (w <= 600 || w >= innerWidth - 400) continue;
        const { maxWidth } = getComputedStyle(el);
        if (maxWidth === "none" || maxWidth.endsWith("%")) continue;

        let line = `${describe(el)} max-width=${maxWidth} width=${Math.round(w)}`;
        if (withChain) {
          const up = [];
          for (
            let e = el.parentElement;
            e !== document.body;
            e = e.parentElement
          )
            up.push(describe(e));
          line += `\n      < ${up.join(" < ")}`;
        }
        lines.push(line);
        if (lines.length === limit) break;
      }
      return lines;
    },
    { withChain: Boolean(opts.chain), limit: MAX_RESULTS },
  );
}

function print(header, lines) {
  console.log(header);
  for (const line of lines) console.log(`   ${line}`);
}

if (!urls.length) {
  console.error(
    "Usage: node probe-capped-widths.mjs [--chain] [--toggle] [--css file.css] url...",
  );
  process.exit(1);
}

const { context } = await connect();
await withPage(context, async (page) => {
  for (const url of urls) {
    await gotoSettled(page, url);
    if (css) await page.addStyleTag({ content: css });
    const capped = await listCapped(page);
    print(`== ${url}${capped.length ? "" : "  OK (nothing capped)"}`, capped);

    if (opts.toggle) {
      await page.evaluate(
        (cls) => document.documentElement.classList.add(cls),
        WIDE_LAYOUT_DISABLED_CLASS,
      );
      const off = await listCapped(page);
      print(`   -- with Wide Layout disabled: ${off.length} capped`, off);
    }
  }
});
process.exit(0);
