import * as esbuild from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, watch } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const isWatch = process.argv.includes("--watch");

// Shared build configurations
const ENTRY_POINTS = [
  { entry: "src/content/main.js", out: "content/main.js" },
  { entry: "src/popup/popup.js", out: "popup/popup.js" },
];

const BASE_CONFIG = {
  bundle: true,
  format: "iife",
  target: "chrome88",
};

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

function copyStaticFiles() {
  cpSync(join(ROOT, "src/popup/popup.html"), join(DIST, "popup/popup.html"));
  cpSync(join(ROOT, "src/popup/popup.css"), join(DIST, "popup/popup.css"));
  cpSync(join(ROOT, "src/content/styles"), join(DIST, "content/styles"), { recursive: true });
  cpSync(join(ROOT, "src/background/service-worker.js"), join(DIST, "background/service-worker.js"));
}

function updateManifest() {
  cpSync(join(ROOT, "_locales"), join(DIST, "_locales"), { recursive: true });
  cpSync(join(ROOT, "icons"), join(DIST, "icons"), { recursive: true });

  // Read from source, modify, write to dist (avoid redundant copy+read)
  const manifest = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));
  manifest.background.service_worker = "background/service-worker.js";
  manifest.action.default_popup = "popup/popup.html";
  manifest.content_scripts[0].js = ["content/main.js"];
  manifest.web_accessible_resources[0].resources = ["content/styles/*.css"];
  writeFileSync(join(DIST, "manifest.json"), JSON.stringify(manifest, null, 2));
}

// Ensure dist directory exists
if (!existsSync(DIST)) {
  mkdirSync(DIST, { recursive: true });
}

// Initial build
await bundleAll(!isWatch);
copyStaticFiles();
updateManifest();
console.log("Build complete: dist/");

// Watch mode
if (isWatch) {
  console.log("Watching for changes...");

  let debounceTimer;
  const rebuild = async () => {
    try {
      await bundleAll(false);
      copyStaticFiles();
      console.log(`[${new Date().toLocaleTimeString()}] Rebuilt`);
    } catch (e) {
      console.error("Build error:", e);
    }
  };

  const watcher = watch(join(ROOT, "src"), { recursive: true }, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(rebuild, 100);
  });

  // Cleanup on exit
  process.on("SIGINT", () => {
    watcher.close();
    process.exit(0);
  });
}
