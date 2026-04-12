import * as esbuild from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, cpSync, watch, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const isWatch = process.argv.includes("--watch");

const ENTRY_POINTS = [
  { entry: "src/content/main.js", out: "content/main.js" },
  { entry: "src/content/early-inject.js", out: "content/early-inject.js" },
  { entry: "src/popup/popup.js", out: "popup/popup.js" },
  { entry: "src/background/service-worker.js", out: "background/service-worker.js" },
];

const BASE_CONFIG = {
  bundle: true,
  format: "iife",
  target: "chrome88",
};

const LOCALES = ["en", "ja", "vi"];
const ICON_SIZES = [16, 48, 128];

async function bundleAll(minify = true) {
  await Promise.all(
    ENTRY_POINTS.map(({ entry, out }) =>
      esbuild.build({
        ...BASE_CONFIG,
        entryPoints: [join(ROOT, entry)],
        outfile: join(DIST, out),
        minify,
      })
    )
  );
}

async function processCSS(srcPath, destPath, minify) {
  const css = readFileSync(srcPath, "utf8");
  if (minify) {
    const result = await esbuild.transform(css, { loader: "css", minify: true });
    writeFileSync(destPath, result.code);
  } else {
    writeFileSync(destPath, css);
  }
}

function minifyHTML(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function copyStaticFiles(minify = true) {
  mkdirSync(join(DIST, "popup"), { recursive: true });
  mkdirSync(join(DIST, "background"), { recursive: true });

  let html = readFileSync(join(ROOT, "src/popup/popup.html"), "utf8");
  if (minify) html = minifyHTML(html);
  writeFileSync(join(DIST, "popup/popup.html"), html);

  await processCSS(join(ROOT, "src/popup/popup.css"), join(DIST, "popup/popup.css"), minify);

  mkdirSync(join(DIST, "content/styles"), { recursive: true });
  const cssFiles = readdirSync(join(ROOT, "src/content/styles")).filter((f) => f.endsWith(".css"));
  await Promise.all(
    cssFiles.map((file) =>
      processCSS(join(ROOT, "src/content/styles", file), join(DIST, "content/styles", file), minify)
    )
  );
}

function copyAssets(minify = true) {
  const jsonFormat = minify ? undefined : 2;

  for (const locale of LOCALES) {
    const srcPath = join(ROOT, "_locales", locale, "messages.json");
    const destDir = join(DIST, "_locales", locale);
    mkdirSync(destDir, { recursive: true });
    const json = JSON.parse(readFileSync(srcPath, "utf8"));
    writeFileSync(join(destDir, "messages.json"), JSON.stringify(json, null, jsonFormat));
  }

  mkdirSync(join(DIST, "icons"), { recursive: true });
  for (const size of ICON_SIZES) {
    cpSync(join(ROOT, `icons/icon-${size}.png`), join(DIST, `icons/icon-${size}.png`));
  }

  const manifest = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));
  manifest.background.service_worker = "background/service-worker.js";
  manifest.action.default_popup = "popup/popup.html";
  manifest.content_scripts[0].css = ["content/styles/wide-layout.css"];
  manifest.content_scripts[0].js = ["content/early-inject.js"];
  manifest.content_scripts[1].js = ["content/main.js"];
  manifest.web_accessible_resources[0].resources = ["content/styles/*.css"];
  writeFileSync(join(DIST, "manifest.json"), JSON.stringify(manifest, null, jsonFormat));
}

mkdirSync(DIST, { recursive: true });

const minify = !isWatch;
await Promise.all([bundleAll(minify), copyStaticFiles(minify)]);
copyAssets(minify);
console.log("Build complete: dist/");

if (isWatch) {
  console.log("Watching for changes...");

  let debounceTimer;
  const rebuild = async () => {
    try {
      await Promise.all([bundleAll(false), copyStaticFiles(false)]);
      console.log(`[${new Date().toLocaleTimeString()}] Rebuilt`);
    } catch (e) {
      console.error("Build error:", e);
    }
  };

  const watcher = watch(join(ROOT, "src"), { recursive: true }, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(rebuild, 100);
  });

  process.on("SIGINT", () => {
    watcher.close();
    process.exit(0);
  });
}
