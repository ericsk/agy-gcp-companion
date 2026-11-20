import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walkFiles(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

describe("Frontend Security Static Audit & Plugin Packaging Verification", () => {
  it("contains zero unsafe DOM sinks, inline styles, storage tokens, or blocking dialogs in src/web", () => {
    const webSrcDir = join(ROOT, "src", "web");
    const files = walkFiles(webSrcDir).filter((f) => f.endsWith(".ts") || f.endsWith(".html"));
    assert.ok(files.length >= 10);

    const forbiddenPatterns: Array<{ name: string; regex: RegExp }> = [
      { name: "innerHTML", regex: /\.innerHTML\b/ },
      { name: "outerHTML", regex: /\.outerHTML\b/ },
      { name: "insertAdjacentHTML", regex: /\binsertAdjacentHTML\b/ },
      { name: "document.write", regex: /\bdocument\.write\b/ },
      { name: "eval", regex: /\beval\s*\(/ },
      { name: "new Function", regex: /\bnew\s+Function\s*\(/ },
      { name: "localStorage", regex: /\blocalStorage\b/ },
      { name: "sessionStorage", regex: /\bsessionStorage\b/ },
      { name: "window.alert", regex: /\balert\s*\(/ },
      { name: "window.confirm", regex: /\bconfirm\s*\(/ },
      { name: "window.prompt", regex: /\bprompt\s*\(/ },
      { name: "CSP-violating inline style mutation", regex: /\.style\./ },
      { name: "CSP-violating style cssText", regex: /\.cssText\b/ },
      { name: "CSP-violating setAttribute style", regex: /setAttribute\s*\(\s*["']style["']/ },
      { name: "CSP-violating inline style attribute", regex: /\bstyle\s*=/ },
    ];

    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      const rel = relative(webSrcDir, file);
      for (const rule of forbiddenPatterns) {
        assert.equal(
          rule.regex.test(content),
          false,
          `Forbidden pattern '${rule.name}' detected in src/web/${rel}`
        );
      }
    }
  });

  it("compiles valid browser ES modules and Node sidecar/MCP bundles", () => {
    const distWebDir = join(ROOT, "dist", "web");
    const jsFiles = walkFiles(distWebDir).filter((f) => f.endsWith(".js"));
    assert.ok(jsFiles.length >= 10);

    for (const file of jsFiles) {
      execFileSync(process.execPath, ["--check", file]);
    }
    execFileSync(process.execPath, ["--check", join(ROOT, "dist", "sidecar.mjs")]);
    execFileSync(process.execPath, ["--check", join(ROOT, "dist", "mcp-server.mjs")]);
  });

  it("packages valid Antigravity plugin manifests in root and .agents/plugins/agy-gcp-companion", () => {
    for (const base of [ROOT, join(ROOT, ".agents", "plugins", "agy-gcp-companion")]) {
      const pluginJson = JSON.parse(readFileSync(join(base, "plugin.json"), "utf-8")) as {
        name: string;
        version: string;
        logo: string;
      };
      assert.equal(pluginJson.name, "agy-gcp-companion");
      assert.equal(pluginJson.version, "1.3.0");
      assert.ok(existsSync(join(base, pluginJson.logo)));
      assert.ok(existsSync(join(base, "LICENSE")));

      const mcpJson = JSON.parse(readFileSync(join(base, "mcp_config.json"), "utf-8")) as {
        mcpServers: Record<string, { command: string; args: string[]; cwd: string }>;
      };
      assert.equal(mcpJson.mcpServers["gcp-companion"].command, "node");
      assert.equal(mcpJson.mcpServers["gcp-companion"].cwd, "${PLUGIN_ROOT}");
      assert.ok(existsSync(join(base, "dist", "mcp-server.mjs")));

      const sidecarDir = join(base, "sidecars", "gcp-companion");
      const sidecarJson = JSON.parse(readFileSync(join(sidecarDir, "sidecar.json"), "utf-8")) as {
        command: string;
        args: string[];
        has_web_ui: boolean;
        ui_config: { views: Array<{ entrypoint: string }> };
      };
      assert.equal(sidecarJson.has_web_ui, true);
      assert.equal(
        sidecarJson.ui_config.views[0].entrypoint,
        "SIDECAR_UI_ENTRYPOINT_AUX_PANE"
      );
      assert.ok(existsSync(resolve(sidecarDir, sidecarJson.args[0])));
      assert.ok(existsSync(join(base, "skills", "gcp-companion", "SKILL.md")));
    }
  });
});
