import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { Duplex } from "node:stream";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { CompanionService } from "../src/core/companion-service.ts";
import { CompanionStore } from "../src/core/store.ts";
import {
  createSidecarHttpServer,
  startSidecarServer,
} from "../src/sidecar/server.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

interface RawHttpResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

/**
 * Drives Node's real HTTP/1.1 parser & Sidecar `http.Server` over an in-memory Duplex socket
 * so tests run hermetically even inside network-isolated sandboxes.
 */
function sendRawHttpRequest(
  server: Server,
  options: {
    method?: string;
    path: string;
    headers?: Record<string, string>;
    body?: string;
  }
): Promise<RawHttpResponse> {
  return new Promise((resolveRes, rejectRes) => {
    const method = options.method ?? "GET";
    const bodyBuf = options.body ? Buffer.from(options.body, "utf-8") : Buffer.alloc(0);
    const hdrs: Record<string, string> = {
      Host: "127.0.0.1",
      Connection: "close",
      ...(options.headers ?? {}),
    };
    if (bodyBuf.length > 0 && !hdrs["Content-Length"]) {
      hdrs["Content-Length"] = String(bodyBuf.length);
    }

    const reqHead =
      `${method} ${options.path} HTTP/1.1\r\n` +
      Object.entries(hdrs)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\r\n") +
      "\r\n\r\n";

    const outChunks: Buffer[] = [];
    let requestSent = false;

    const fakeSocket = new Duplex({
      allowHalfOpen: true,
      read() {
        if (!requestSent) {
          requestSent = true;
          this.push(Buffer.concat([Buffer.from(reqHead, "utf-8"), bodyBuf]));
        }
      },
      write(chunk, _encoding, callback) {
        outChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        callback();
      },
      final(callback) {
        callback();
        this.push(null);
        parseRawHttp();
      },
    });

    Object.assign(fakeSocket, {
      remoteAddress: "127.0.0.1",
      writable: true,
      readable: true,
      setTimeout: () => fakeSocket,
      setNoDelay: () => fakeSocket,
      setKeepAlive: () => fakeSocket,
    });

    function parseRawHttp() {
      const raw = Buffer.concat(outChunks).toString("utf-8");
      const sepIdx = raw.indexOf("\r\n\r\n");
      if (sepIdx === -1) {
        rejectRes(new Error(`Malformed HTTP response: ${raw}`));
        return;
      }
      const headLines = raw.slice(0, sepIdx).split("\r\n");
      const statusMatch = /^HTTP\/1\.\d\s+(\d{3})/.exec(headLines[0] || "");
      const status = statusMatch ? Number(statusMatch[1]) : 0;
      const headers: Record<string, string> = {};
      for (const line of headLines.slice(1)) {
        const colon = line.indexOf(":");
        if (colon > 0) {
          const k = line.slice(0, colon).trim().toLowerCase();
          const v = line.slice(colon + 1).trim();
          headers[k] = headers[k] ? `${headers[k]}; ${v}` : v;
        }
      }
      let body = raw.slice(sepIdx + 4);
      if (headers["transfer-encoding"]?.includes("chunked")) {
        // Decode HTTP/1.1 chunked body
        let decoded = "";
        let rest = body;
        while (rest.length > 0) {
          const crlf = rest.indexOf("\r\n");
          if (crlf === -1) break;
          const size = parseInt(rest.slice(0, crlf), 16);
          if (!size || Number.isNaN(size)) break;
          decoded += rest.slice(crlf + 2, crlf + 2 + size);
          rest = rest.slice(crlf + 2 + size + 2);
        }
        body = decoded;
      }
      resolveRes({ status, headers, body });
    }

    server.emit("connection", fakeSocket);
  });
}

describe("Sidecar HTTP Server Security & API Integration", () => {
  let tmpDir: string;
  let server: Server;

  before(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "agy-sidecar-test-"));
    const store = new CompanionStore(tmpDir);
    store.savePreferences({
      pinnedProjects: ["acme-ai-assistant-prod"],
      billingExportTables: {},
      cacheTtlMs: 6 * 3_600_000,
      maskEmails: false,
      gcloudPathOverride: null,
      quotaProjectOverride: null,
      demoMode: true,
    });
    const service = new CompanionService({ store });
    server = createSidecarHttpServer({ service, rateLimitMax: 50 });
  });

  after(() => {
    server.close();
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("binds exclusively to 127.0.0.1 loopback and serves hardened security headers", async () => {
    const live = await startSidecarServer(0, {
      service: new CompanionService({ store: new CompanionStore(tmpDir) }),
    });
    try {
      const addr = live.server.address();
      assert.ok(addr && typeof addr === "object");
      assert.equal(addr.address, "127.0.0.1");
      assert.ok(live.port > 0);
    } finally {
      await live.close();
    }

    const res = await sendRawHttpRequest(server, { path: "/" });
    assert.equal(res.status, 200);
    const csp = res.headers["content-security-policy"] || "";
    assert.ok(csp.includes("script-src 'self'"));
    assert.ok(csp.includes("style-src 'self'"));
    assert.ok(!csp.includes("unsafe-inline"));
    assert.ok(!csp.includes("unsafe-eval"));
    assert.equal(res.headers["x-content-type-options"], "nosniff");
    assert.equal(res.headers["cache-control"], "no-store");

    // Proxy subpath asset & SPA mount resolution check (with and without trailing slash)
    const jsRes = await sendRawHttpRequest(server, {
      path: "/sidecar/gcp-companion/bundle.js",
    });
    assert.equal(jsRes.status, 200);
    assert.ok((jsRes.headers["content-type"] || "").includes("javascript"));

    const subpathHtml = await sendRawHttpRequest(server, {
      path: "/sidecar/gcp-companion",
    });
    assert.equal(subpathHtml.status, 200);
    assert.ok(subpathHtml.body.includes("<script nonce="));
    assert.ok(subpathHtml.body.includes("<style nonce="));
  });

  it("blocks path traversal, disallowed HTTP methods, and untrusted Origins", async () => {
    const traversal = await sendRawHttpRequest(server, {
      path: "/..%2f..%2fpackage.json",
    });
    assert.equal(traversal.status, 404);

    const putRes = await sendRawHttpRequest(server, {
      method: "PUT",
      path: "/api/overview",
    });
    assert.equal(putRes.status, 405);

    const evilOrigin = await sendRawHttpRequest(server, {
      path: "/api/overview",
      headers: { Origin: "https://evil-attacker.example" },
    });
    assert.equal(evilOrigin.status, 403);

    const pluginOrigin = await sendRawHttpRequest(server, {
      path: "/api/overview",
      headers: { Origin: "plugin://agy-gcp-companion" },
    });
    assert.equal(pluginOrigin.status, 200);
    assert.equal(pluginOrigin.headers["access-control-allow-origin"], "plugin://agy-gcp-companion");

    const optionsPreflight = await sendRawHttpRequest(server, {
      method: "OPTIONS",
      path: "/api/pin-project",
      headers: { Origin: "null" },
    });
    assert.equal(optionsPreflight.status, 204);
    assert.equal(optionsPreflight.headers["access-control-allow-origin"], "null");
    assert.ok((optionsPreflight.headers["access-control-allow-headers"] || "").includes("X-AGY-Companion"));
  });

  it("enforces synchronizer CSRF tokens, X-AGY-Companion headers, and rate limits on POST endpoints", async () => {
    // 1. Missing X-AGY-Companion header -> 403
    const noHeader = await sendRawHttpRequest(server, {
      method: "POST",
      path: "/api/pin-project",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: "acme-web-portal", pinned: true }),
    });
    assert.equal(noHeader.status, 403);

    // 2. Forged CSRF token -> 403
    const badCsrf = await sendRawHttpRequest(server, {
      method: "POST",
      path: "/api/pin-project",
      headers: {
        "Content-Type": "application/json",
        "X-AGY-Companion": "1",
        "X-CSRF-Token": "9999999999999.deadbeef.badsignature",
      },
      body: JSON.stringify({ projectId: "acme-web-portal", pinned: true }),
    });
    assert.equal(badCsrf.status, 403);

    // 3. Valid session cookie + synchronizer CSRF token -> 200
    const sessionRes = await sendRawHttpRequest(server, { path: "/api/session" });
    assert.equal(sessionRes.status, 200);
    const setCookie = sessionRes.headers["set-cookie"] || "";
    assert.ok(setCookie.includes("HttpOnly"));
    assert.ok(setCookie.includes("SameSite=Strict"));
    const cookiePair = setCookie.split(";")[0];
    const sessionData = JSON.parse(sessionRes.body) as {
      csrfToken: string;
      proxyCsrfToken: string;
    };

    const validPost = await sendRawHttpRequest(server, {
      method: "POST",
      path: "/api/pin-project",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookiePair,
        "X-AGY-Companion": "1",
        "X-CSRF-Token": sessionData.csrfToken,
      },
      body: JSON.stringify({ projectId: "acme-web-portal", pinned: true }),
    });
    assert.equal(validPost.status, 200);
    const pinJson = JSON.parse(validPost.body) as {
      overview: { preferences: { pinnedProjects: string[] } };
    };
    assert.ok(pinJson.overview.preferences.pinnedProjects.includes("acme-web-portal"));

    // 4. Cookie-stripped custom `plugin://` proxy fallback using X-CSRF-Proxy-Token -> 200
    const proxyPost = await sendRawHttpRequest(server, {
      method: "POST",
      path: "/api/active-project",
      headers: {
        Origin: "plugin://agy-gcp-companion",
        "Content-Type": "application/json",
        "X-AGY-Companion": "1",
        "X-CSRF-Proxy-Token": sessionData.proxyCsrfToken,
      },
      body: JSON.stringify({ projectId: "acme-data-platform" }),
    });
    assert.equal(proxyPost.status, 200);
    const activeJson = JSON.parse(proxyPost.body) as { activeProject: string };
    assert.equal(activeJson.activeProject, "acme-data-platform");

    // 4b. Service enablement allowlist check: rejects arbitrary APIs, accepts cloudbilling.googleapis.com
    const disallowedApi = await sendRawHttpRequest(server, {
      method: "POST",
      path: "/api/enable-service",
      headers: {
        Origin: "plugin://agy-gcp-companion",
        "Content-Type": "application/json",
        "X-AGY-Companion": "1",
        "X-CSRF-Proxy-Token": sessionData.proxyCsrfToken,
      },
      body: JSON.stringify({
        projectId: "acme-data-platform",
        serviceName: "compute.googleapis.com",
      }),
    });
    assert.equal(disallowedApi.status, 400);

    const allowedApi = await sendRawHttpRequest(server, {
      method: "POST",
      path: "/api/enable-service",
      headers: {
        Origin: "plugin://agy-gcp-companion",
        "Content-Type": "application/json",
        "X-AGY-Companion": "1",
        "X-CSRF-Proxy-Token": sessionData.proxyCsrfToken,
      },
      body: JSON.stringify({
        projectId: "acme-data-platform",
        serviceName: "cloudbilling.googleapis.com",
      }),
    });
    assert.equal(allowedApi.status, 200);

    // 5. Project cost breakdown endpoint -> 200
    const breakdownRes = await sendRawHttpRequest(server, {
      path: "/api/project-breakdown?projectId=acme-ai-assistant-prod",
    });
    assert.equal(breakdownRes.status, 200);
    const breakdown = JSON.parse(breakdownRes.body) as {
      spend: { topServices: Array<{ serviceName: string }> };
      consoleLinks: { dashboard: string };
    };
    assert.equal(breakdown.spend.topServices[0].serviceName, "Vertex AI");
    assert.ok(breakdown.consoleLinks.dashboard.startsWith("https://console.cloud.google.com/"));

    // 6. Rate limiting (429 Too Many Requests) when burst exceeds configured limit
    const tightServer = createSidecarHttpServer({
      service: new CompanionService({ store: new CompanionStore(tmpDir) }),
      rateLimitMax: 3,
    });
    try {
      await sendRawHttpRequest(tightServer, { path: "/api/session" });
      await sendRawHttpRequest(tightServer, { path: "/api/session" });
      await sendRawHttpRequest(tightServer, { path: "/api/session" });
      const fourth = await sendRawHttpRequest(tightServer, { path: "/api/session" });
      assert.equal(fourth.status, 429);
    } finally {
      tightServer.close();
    }
  });

  it("launches dist/sidecar.mjs cleanly with fixed ANTIGRAVITY_SIDECAR_WEB_PORT without EADDRINUSE", async () => {
    // Allocate a free ephemeral port first, release it, then pass it via ANTIGRAVITY_SIDECAR_WEB_PORT
    const freePort = await new Promise<number>((resolvePort, rejectPort) => {
      const probe = createServer();
      probe.once("error", rejectPort);
      probe.listen(0, "127.0.0.1", () => {
        const addr = probe.address();
        const port = typeof addr === "object" && addr ? addr.port : 0;
        probe.close(() => resolvePort(port));
      });
    });

    const sidecarCwd = join(ROOT, "sidecars", "gcp-companion");
    const proc = spawn(process.execPath, ["../../dist/sidecar.mjs"], {
      cwd: sidecarCwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        ANTIGRAVITY_SIDECAR_WEB_PORT: String(freePort),
        AGY_GCP_COMPANION_STORE_DIR: tmpDir,
      },
    });

    let stderrText = "";
    proc.stderr.on("data", (chunk: Buffer) => {
      stderrText += chunk.toString("utf-8");
    });

    let earlyExitCode: number | null = null;
    proc.on("exit", (code) => {
      earlyExitCode = code;
    });

    try {
      for (let i = 0; i < 60 && !stderrText.includes("GCP Companion listening"); i++) {
        if (earlyExitCode !== null) {
          throw new Error(`dist/sidecar.mjs exited prematurely (${earlyExitCode}): ${stderrText}`);
        }
        await new Promise((r) => setTimeout(r, 25));
      }
      // Wait an extra tick to ensure no duplicate listen() causes delayed EADDRINUSE crash
      await new Promise((r) => setTimeout(r, 80));
      assert.equal(earlyExitCode, null, `Sidecar crashed after listen: ${stderrText}`);
      const listenMatches = stderrText.match(/GCP Companion listening on http:\/\/127\.0\.0\.1:\d+/g) ?? [];
      assert.equal(listenMatches.length, 1, `Expected exactly 1 server listen banner, got: ${stderrText}`);
      assert.ok(stderrText.includes(`127.0.0.1:${freePort}`));
    } finally {
      proc.kill("SIGTERM");
      const closeCode = await new Promise<number | null>((r) => proc.once("close", (code) => r(code)));
      assert.equal(closeCode, 0);
    }
  });
});
