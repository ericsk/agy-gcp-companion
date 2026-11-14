import { lstatSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const targetLink = join(homedir(), ".gemini", "config", "plugins", "agy-gcp-companion");

try {
  lstatSync(targetLink);
  rmSync(targetLink, { recursive: true, force: true });
  console.log(`Removed global Antigravity plugin at ${targetLink}`);
} catch {
  console.log(`No global plugin found at ${targetLink}`);
}
