import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "src");
const DIST_DIR = join(ROOT, "dist");
const WORKSPACE_PLUGIN_DIR = join(ROOT, ".agents", "plugins", "agy-gcp-companion");

function walkFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walkFiles(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function rewriteRelativeTsSpecifiers(jsCode, targetExt) {
  // Rewrite ESM import/export specifiers ending in .ts -> .mjs or .js
  return jsCode
    .replace(/(from\s+["'])(\.\.?\/[^"']+?)\.ts(["'])/g, `$1$2${targetExt}$3`)
    .replace(/(import\s*\(\s*["'])(\.\.?\/[^"']+?)\.ts(["']\s*\))/g, `$1$2${targetExt}$3`);
}

function stripModuleSyntaxForIife(jsSource) {
  // Strip top-level ESM `import ... from "...";` statements and `export ` keywords so modules concatenate cleanly into a single IIFE
  return jsSource
    .replace(/^\s*import\s+(?:[\w*{}\s,]+from\s+)?["'][^"']+["']\s*;?/gm, "")
    .replace(/^\s*export\s+(?=(?:async\s+)?function\b|const\b|let\b|class\b)/gm, "");
}

function buildWebBundle(distWebDir) {
  const orderedModules = [
    "i18n/en.js",
    "i18n/es.js",
    "i18n/fr.js",
    "i18n/ja.js",
    "i18n/ko.js",
    "i18n/zh-CN.js",
    "i18n/zh-TW.js",
    "i18n/index.js",
    "dom.js",
    "charts.js",
    "api.js",
    "app.js",
  ];
  const chunks = orderedModules.map((file) => {
    const raw = readFileSync(join(distWebDir, file), "utf-8");
    return `// --- ${file} ---\n${stripModuleSyntaxForIife(raw)}`;
  });
  const iife =
    "(() => {\n" +
    '  "use strict";\n' +
    "  if (typeof window !== \"undefined\") {\n" +
    "    if (window.__AGY_COMPANION_BOOTED__) return;\n" +
    "    window.__AGY_COMPANION_BOOTED__ = true;\n" +
    "  }\n" +
    chunks.join("\n\n") +
    "\n})();\n";
  writeFileSync(join(distWebDir, "bundle.js"), iife, "utf-8");
}

function build() {
  rmSync(DIST_DIR, { recursive: true, force: true });
  mkdirSync(DIST_DIR, { recursive: true });

  const allSrcFiles = walkFiles(SRC_DIR);
  let compiledCount = 0;

  for (const srcFile of allSrcFiles) {
    const relPath = relative(SRC_DIR, srcFile);
    const isWeb = relPath.startsWith("web/") || relPath.startsWith("web\\");
    const ext = extname(srcFile);

    if (ext === ".ts") {
      const tsSource = readFileSync(srcFile, "utf-8");
      const stripped = stripTypeScriptTypes(tsSource);
      const targetExt = isWeb ? ".js" : ".mjs";
      const jsCode = rewriteRelativeTsSpecifiers(stripped, targetExt);

      if (isWeb && /from\s+["']node:|from\s+["'](?:\.\.\/)+core\//.test(jsCode)) {
        throw new Error(`Forbidden server/Node runtime import leaked into browser bundle: ${relPath}`);
      }

      const outRel = relPath.replace(/\.ts$/, targetExt);
      const outPath = join(DIST_DIR, outRel);
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, jsCode, "utf-8");
      compiledCount++;
    } else {
      const outPath = join(DIST_DIR, relPath);
      mkdirSync(dirname(outPath), { recursive: true });
      cpSync(srcFile, outPath);
    }
  }

  // Copy logo.svg into dist/web/logo.svg so relative `./logo.svg` always resolves directly too
  const rootLogo = join(ROOT, "assets", "logo.svg");
  if (existsSync(rootLogo)) {
    cpSync(rootLogo, join(DIST_DIR, "web", "logo.svg"));
  }

  // Build self-contained classic script bundle (dist/web/bundle.js) to avoid ESM CORS / subpath waterfall issues in sidecar webviews
  buildWebBundle(join(DIST_DIR, "web"));

  // Create root entry shims expected by sidecar.json and mcp_config.json
  writeFileSync(
    join(DIST_DIR, "sidecar.mjs"),
    'import { startSidecarServer } from "./sidecar/server.mjs";\n' +
      "startSidecarServer()\n" +
      "  .then((running) => {\n" +
      '    for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {\n' +
      "      process.on(sig, () => { running.close().finally(() => process.exit(0)); });\n" +
      "    }\n" +
      "  })\n" +
      "  .catch((err) => {\n" +
      '    console.error("GCP Companion sidecar failed to start:", err);\n' +
      "    process.exit(1);\n" +
      "  });\n",
    "utf-8"
  );

  writeFileSync(
    join(DIST_DIR, "mcp-server.mjs"),
    'import { startMcpStdioServer } from "./mcp/server.mjs";\nstartMcpStdioServer();\n',
    "utf-8"
  );

  // Stage workspace-local plugin copy under .agents/plugins/agy-gcp-companion for instant workspace discovery
  rmSync(WORKSPACE_PLUGIN_DIR, { recursive: true, force: true });
  mkdirSync(WORKSPACE_PLUGIN_DIR, { recursive: true });
  for (const item of ["plugin.json", "mcp_config.json", "LICENSE", "README.md", "assets", "sidecars", "skills", "dist"]) {
    const srcItem = join(ROOT, item);
    if (existsSync(srcItem)) {
      cpSync(srcItem, join(WORKSPACE_PLUGIN_DIR, item), { recursive: true });
    }
  }

  console.log(
    `[agy-gcp-companion] Built ${compiledCount} TypeScript modules -> dist/ & staged workspace plugin (.agents/plugins/agy-gcp-companion)`
  );
}

build();
