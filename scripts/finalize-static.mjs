// Post-build step for the static build.
// - Copies dist/client/_shell.html to dist/client/index.html so Apache/Hostinger
//   serves it as the SPA root document.
// - Zips dist/client into dist/site.zip for easy upload to Hostinger's File Manager.
import { existsSync, copyFileSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const clientDir = resolve("dist/client");
const shellHtml = resolve(clientDir, "_shell.html");
const indexHtml = resolve(clientDir, "index.html");
const zipPath = resolve("dist/site.zip");

if (!existsSync(clientDir)) {
  console.error("[finalize-static] dist/client not found — did the build fail?");
  process.exit(1);
}

if (existsSync(shellHtml) && !existsSync(indexHtml)) {
  copyFileSync(shellHtml, indexHtml);
  console.log("[finalize-static] Copied _shell.html -> index.html");
}

// Best-effort zip. If `zip` isn't available, skip silently.
try {
  execSync(`rm -f "${zipPath}" && cd "${clientDir}" && zip -qr "${zipPath}" .`, {
    stdio: "inherit",
  });
  const size = (statSync(zipPath).size / 1024 / 1024).toFixed(2);
  console.log(`[finalize-static] Created ${zipPath} (${size} MB)`);
  console.log("[finalize-static] Upload the contents of dist/client/ (or extract site.zip) into your Hostinger public_html folder.");
} catch (err) {
  console.warn("[finalize-static] Could not create zip (missing `zip` binary?). Upload dist/client/ manually.");
}