import { existsSync, lstatSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginsDir = join(homedir(), ".gemini", "config", "plugins");
const targetLink = join(pluginsDir, "agy-gcp-companion");

mkdirSync(pluginsDir, { recursive: true });

try {
  const st = lstatSync(targetLink);
  if (st.isSymbolicLink() || st.isDirectory() || st.isFile()) {
    rmSync(targetLink, { recursive: true, force: true });
  }
} catch {
  // Target does not exist yet
}

if (!existsSync(join(ROOT, "dist", "sidecar.mjs"))) {
  console.error("dist/ not found. Run `npm run build` first.");
  process.exit(1);
}

symlinkSync(ROOT, targetLink, process.platform === "win32" ? "junction" : "dir");
console.log(`Linked global Antigravity plugin: ${targetLink} -> ${ROOT}`);
console.log("Restart or reload Antigravity Customizations to see 'GCP Companion' across all workspaces.");
