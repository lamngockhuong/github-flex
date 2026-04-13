import * as esbuild from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, cpSync, watch, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const isWatch = process.argv.includes("--watch");

const BROWSERS = ["chrome", "firefox"];
const BROWSER_TARGETS = {
  chrome: "chrome88",
  firefox: "firefox140",
};

// Allow building a single browser via --chrome or --firefox flags
const requestedBrowser = BROWSERS.find((b) => process.argv.includes(`--${b}`));
const activeBrowsers = requestedBrowser ? [requestedBrowser] : BROWSERS;

function getDistDir(browser) {
  return join(ROOT, "dist", browser);
}

const ENTRY_POINTS = [
  { entry: "src/content/main.js", out: "content/main.js" },
  { entry: "src/content/early-inject.js", out: "content/early-inject.js" },
  { entry: "src/popup/popup.js", out: "popup/popup.js" },
  { entry: "src/background/service-worker.js", out: "background/service-worker.js" },
];

const LOCALES = ["en", "ja", "vi"];
const ICON_SIZES = [16, 48, 128];

async function bundleAll(browser, minify = true) {
  const dist = getDistDir(browser);
  await Promise.all(
    ENTRY_POINTS.map(({ entry, out }) =>
      esbuild.build({
        bundle: true,
        format: "iife",
        target: BROWSER_TARGETS[browser],
        entryPoints: [join(ROOT, entry)],
        outfile: join(dist, out),
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

async function copyStaticFiles(browser, minify = true) {
  const dist = getDistDir(browser);
  mkdirSync(join(dist, "popup"), { recursive: true });
  mkdirSync(join(dist, "background"), { recursive: true });

  let html = readFileSync(join(ROOT, "src/popup/popup.html"), "utf8");
  if (minify) html = minifyHTML(html);
  writeFileSync(join(dist, "popup/popup.html"), html);

  await processCSS(join(ROOT, "src/popup/popup.css"), join(dist, "popup/popup.css"), minify);

  mkdirSync(join(dist, "content/styles"), { recursive: true });
  const cssFiles = readdirSync(join(ROOT, "src/content/styles")).filter((f) => f.endsWith(".css"));
  await Promise.all(
    cssFiles.map((file) =>
      processCSS(join(ROOT, "src/content/styles", file), join(dist, "content/styles", file), minify)
    )
  );
}

function copyAssets(browser, minify = true) {
  const dist = getDistDir(browser);
  const jsonFormat = minify ? undefined : 2;

  for (const locale of LOCALES) {
    const srcPath = join(ROOT, "_locales", locale, "messages.json");
    const destDir = join(dist, "_locales", locale);
    mkdirSync(destDir, { recursive: true });
    const json = JSON.parse(readFileSync(srcPath, "utf8"));
    writeFileSync(join(destDir, "messages.json"), JSON.stringify(json, null, jsonFormat));
  }

  mkdirSync(join(dist, "icons"), { recursive: true });
  for (const size of ICON_SIZES) {
    cpSync(join(ROOT, `icons/icon-${size}.png`), join(dist, `icons/icon-${size}.png`));
  }

  const manifest = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));

  // Common path rewrites
  manifest.action.default_popup = "popup/popup.html";
  manifest.content_scripts[0].css = ["content/styles/wide-layout.css"];
  manifest.content_scripts[0].js = ["content/early-inject.js"];
  manifest.content_scripts[1].js = ["content/main.js"];
  manifest.web_accessible_resources[0].resources = ["content/styles/*.css"];

  if (browser === "chrome") {
    manifest.background = {
      service_worker: "background/service-worker.js",
      type: "module",
    };
  } else if (browser === "firefox") {
    manifest.background = {
      scripts: ["background/service-worker.js"],
      type: "module",
    };
    manifest.browser_specific_settings = {
      gecko: {
        id: "github-flex@khuong.dev",
        strict_min_version: "142.0",
        data_collection_permissions: {
          required: ["none"],
          optional: [],
        },
      },
    };
  }

  writeFileSync(join(dist, "manifest.json"), JSON.stringify(manifest, null, jsonFormat));
}

async function buildAll(minify = true) {
  await Promise.all(
    activeBrowsers.map(async (browser) => {
      mkdirSync(getDistDir(browser), { recursive: true });
      await Promise.all([
        bundleAll(browser, minify),
        copyStaticFiles(browser, minify),
      ]);
      copyAssets(browser, minify);
    })
  );
}

const minify = !isWatch;
await buildAll(minify);
console.log(`Build complete: ${activeBrowsers.map((b) => `dist/${b}/`).join(", ")}`);

if (isWatch) {
  console.log("Watching for changes...");

  let debounceTimer;
  const rebuild = async () => {
    try {
      await buildAll(false);
      console.log(`[${new Date().toLocaleTimeString()}] Rebuilt (${activeBrowsers.join(" + ")})`);
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
