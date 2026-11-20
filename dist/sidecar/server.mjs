import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createServer,                                                        } from "node:http";
import { dirname, extname, basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CompanionService } from "../core/companion-service.mjs";
import { sanitizeErrorMessage } from "../core/security.mjs";
                                                         
import { getPluginVersion } from "../core/updater.mjs";

const MAX_BODY_BYTES = 64 * 1024; // 64 KB max JSON payload
const SESSION_TTL_MS = 30 * 60 * 1000; // 30-minute CSRF/session lifetime
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 180;

const MIME_TYPES                         = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};

const TRUSTED_HOST_SOURCES =
  "http://127.0.0.1:* http://localhost:* https://*.antigravity.google plugin: vscode-webview: antigravity: jetski: app:";

function buildCspHeader(nonce         )         {
  const noncePart = nonce ? ` 'nonce-${nonce}'` : "";
  return [
    `default-src 'self' ${TRUSTED_HOST_SOURCES}`,
    `script-src 'self'${noncePart} ${TRUSTED_HOST_SOURCES}`,
    `style-src 'self'${noncePart} ${TRUSTED_HOST_SOURCES}`,
    `img-src 'self' data: blob: ${TRUSTED_HOST_SOURCES}`,
    `connect-src 'self' ${TRUSTED_HOST_SOURCES}`,
    `font-src 'self' data: ${TRUSTED_HOST_SOURCES}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors 'self' ${TRUSTED_HOST_SOURCES} file:`,
  ].join("; ");
}

                                       
                             
                      
                    
                        
 

                                       
                 
               
                             
 

function getDefaultWebDirs()                                           {
  const here = dirname(fileURLToPath(import.meta.url));
  // Supports running from dist/sidecar/server.mjs, dist/sidecar.mjs, or src/sidecar/server.ts
  const candidates = [
    resolve(here, "web"),
    resolve(here, "..", "web"),
    resolve(here, "..", "..", "dist", "web"),
    resolve(here, "..", "..", "src", "web"),
  ];
  const webRootDir =
    candidates.find((d) => existsSync(join(d, "index.html")) && existsSync(join(d, "app.js"))) ??
    candidates.find((d) => existsSync(join(d, "index.html"))) ??
    candidates[0];

  const logoCandidates = [
    resolve(here, "..", "assets", "logo.svg"),
    resolve(here, "..", "..", "assets", "logo.svg"),
    resolve(here, "assets", "logo.svg"),
  ];
  const logoPath = logoCandidates.find((p) => existsSync(p)) ?? logoCandidates[0];
  return { webRootDir, logoPath };
}

function isTrustedOrigin(originHeader                    )          {
  if (!originHeader) {
    // Same-origin non-CORS GETs or local CLI tools without Origin
    return true;
  }
  const lower = originHeader.toLowerCase();
  if (
    lower === "null" ||
    lower.startsWith("plugin://") ||
    lower.startsWith("vscode-webview://") ||
    lower.startsWith("vscode-file://") ||
    lower.startsWith("antigravity://") ||
    lower.startsWith("jetski://") ||
    lower.startsWith("app://") ||
    lower.startsWith("file://")
  ) {
    return true;
  }
  try {
    const parsed = new URL(originHeader);
    if (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      (parsed.hostname === "127.0.0.1" ||
        parsed.hostname === "localhost" ||
        parsed.hostname === "[::1]")
    ) {
      return true;
    }
    if (
      parsed.protocol === "https:" &&
      (parsed.hostname === "antigravity.google" ||
        parsed.hostname.endsWith(".antigravity.google"))
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function parseCookies(cookieHeader                    )                         {
  const out                         = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    const k = part.slice(0, eq).trim();
    const v = part.slice(eq + 1).trim();
    if (k) out[k] = v;
  }
  return out;
}

function setSecurityHeaders(res                , cspNonce         )       {
  res.setHeader("Content-Security-Policy", buildCspHeader(cspNonce));
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Cache-Control", "no-store");
}

function applyTrustedCorsHeaders(req                 , res                )       {
  const origin = req.headers.origin;
  if (origin && isTrustedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, X-AGY-Companion, X-CSRF-Token, X-CSRF-Proxy-Token"
    );
  }
}

function sendJson(res                , status        , payload         )       {
  setSecurityHeaders(res);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req                 )                                   {
  return new Promise((resolveBody, rejectBody) => {
    const chunks           = [];
    let total = 0;
    req.on("data", (chunk        ) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        rejectBody(new Error("Request payload too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (chunks.length === 0) {
        resolveBody({});
        return;
      }
      try {
        const raw = Buffer.concat(chunks).toString("utf-8");
        const parsed = JSON.parse(raw)           ;
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          rejectBody(new Error("JSON body must be an object."));
          return;
        }
        resolveBody(parsed                           );
      } catch {
        rejectBody(new Error("Malformed JSON request body."));
      }
    });
    req.on("error", (err) => rejectBody(err));
  });
}

export function createSidecarHttpServer(options                       = {})         {
  const service = options.service ?? new CompanionService();
  const defaults = getDefaultWebDirs();
  const webRootDir = resolve(options.webRootDir ?? defaults.webRootDir);
  const logoPath = resolve(options.logoPath ?? defaults.logoPath);
  const rateLimitMax = options.rateLimitMax ?? RATE_LIMIT_MAX_REQUESTS;

  // Ephemeral 256-bit per-instance secret used to sign synchronizer CSRF tokens (never logged or persisted)
  const instanceSecret = randomBytes(32);

  // Sliding-window rate limiter bucketed per client remote address
  const rateBuckets = new Map                  ();

  const checkRateLimit = (clientKey        )          => {
    const now = Date.now();
    const recent = (rateBuckets.get(clientKey) ?? []).filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW_MS
    );
    if (recent.length >= rateLimitMax) {
      rateBuckets.set(clientKey, recent);
      return false;
    }
    recent.push(now);
    rateBuckets.set(clientKey, recent);
    return true;
  };

  const mintCsrfToken = (sessionId        )         => {
    const expiresAt = Date.now() + SESSION_TTL_MS;
    const nonce = randomBytes(16).toString("hex");
    const payload = `${sessionId}.${expiresAt}.${nonce}`;
    const sig = createHmac("sha256", instanceSecret).update(payload).digest("hex");
    return `${expiresAt}.${nonce}.${sig}`;
  };

  const verifyCsrfToken = (tokenHeader                    , sessionIdFromCookie        )          => {
    if (!tokenHeader || typeof tokenHeader !== "string") return false;
    const parts = tokenHeader.split(".");
    if (parts.length !== 3) return false;
    const [expiresStr, nonce, providedSig] = parts;
    const expiresAt = Number(expiresStr);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
      return false;
    }
    if (!/^[a-f0-9]{32}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(providedSig)) {
      return false;
    }
    // Verify against cookie sessionId when present, or fallback "stateless" binding if host proxy strips cookies
    const candidateSessions = sessionIdFromCookie ? [sessionIdFromCookie] : ["proxy-session"];
    for (const sid of candidateSessions) {
      const expected = createHmac("sha256", instanceSecret)
        .update(`${sid}.${expiresStr}.${nonce}`)
        .digest("hex");
      const a = Buffer.from(providedSig, "hex");
      const b = Buffer.from(expected, "hex");
      if (a.length === b.length && timingSafeEqual(a, b)) {
        return true;
      }
    }
    return false;
  };

  return createServer(async (req, res) => {
    try {
      const method = req.method || "GET";
      if (method !== "GET" && method !== "POST" && method !== "OPTIONS") {
        sendJson(res, 405, { error: "Method Not Allowed" });
        return;
      }

      if (!isTrustedOrigin(req.headers.origin)) {
        sendJson(res, 403, { error: "Forbidden cross-origin request." });
        return;
      }

      applyTrustedCorsHeaders(req, res);

      if (method === "OPTIONS") {
        setSecurityHeaders(res);
        res.writeHead(204);
        res.end();
        return;
      }

      const clientIp = req.socket.remoteAddress || "127.0.0.1";
      if (!checkRateLimit(clientIp)) {
        sendJson(res, 429, { error: "Too many requests. Please wait a moment and try again." });
        return;
      }

      const parsedUrl = new URL(req.url || "/", "http://127.0.0.1");
      // Normalize optional proxy subpath prefixes while keeping exact suffix matching for /api/* and assets
      const pathname = parsedUrl.pathname;

      const issueSessionPayload = () => {
        const cookies = parseCookies(req.headers.cookie);
        const sid =
          cookies.agy_sid && /^[a-f0-9]{32}$/.test(cookies.agy_sid)
            ? cookies.agy_sid
            : randomBytes(16).toString("hex");
        // Issue both cookie-bound token and fallback proxy token if cookies are blocked by custom plugin:// scheme
        const csrfToken = mintCsrfToken(sid);
        const proxyCsrfToken = mintCsrfToken("proxy-session");
        // TODO(security): Sidecar runs strictly over HTTP 127.0.0.1 loopback (no TLS terminator), so HttpOnly + SameSite=Strict is set without Secure/__Host- unless proxied over HTTPS.
        res.setHeader(
          "Set-Cookie",
          `agy_sid=${sid}; HttpOnly; SameSite=Strict; Max-Age=1800; Path=/`
        );
        return {
          csrfToken,
          proxyCsrfToken,
          expiresInMs: SESSION_TTL_MS,
        };
      };

      // Session & CSRF bootstrap endpoint
      if (method === "GET" && pathname.endsWith("/api/session")) {
        sendJson(res, 200, {
          status: "ok",
          version: getPluginVersion(),
          ...issueSessionPayload(),
        });
        return;
      }

      // Fast local UI bootstrap endpoint (returns auth, preferences, plugin update status & CSRF session in 1 roundtrip)
      if (method === "GET" && pathname.endsWith("/api/bootstrap")) {
        const forceRefresh = parsedUrl.searchParams.get("refresh") === "1";
        const sessionPayload = issueSessionPayload();
        const bootstrap = await service.getBootstrap({ forceRefresh });
        sendJson(res, 200, {
          ...bootstrap,
          ...sessionPayload,
        });
        return;
      }

      // Require CSRF synchronizer token + custom header on all state-mutating POST requests
      if (method === "POST") {
        if (req.headers["x-agy-companion"] !== "1") {
          sendJson(res, 403, { error: "Missing required companion header." });
          return;
        }
        const cookies = parseCookies(req.headers.cookie);
        const sid = cookies.agy_sid || "";
        const csrfHeader =
          typeof req.headers["x-csrf-token"] === "string"
            ? req.headers["x-csrf-token"]
            : undefined;
        const proxyCsrfHeader =
          typeof req.headers["x-csrf-proxy-token"] === "string"
            ? req.headers["x-csrf-proxy-token"]
            : undefined;
        const tokenToCheck = sid ? csrfHeader : (proxyCsrfHeader ?? csrfHeader);
        if (!verifyCsrfToken(tokenToCheck, sid)) {
          sendJson(res, 403, { error: "Invalid or expired CSRF token." });
          return;
        }
      }

      // Independent Progressive Domain Routes
      if (method === "GET" && pathname.endsWith("/api/projects")) {
        const forceRefresh = parsedUrl.searchParams.get("refresh") === "1";
        const projectsData = await service.getProjectsSection({ forceRefresh });
        sendJson(res, 200, projectsData);
        return;
      }

      if (method === "GET" && pathname.endsWith("/api/billing")) {
        const forceRefresh = parsedUrl.searchParams.get("refresh") === "1";
        const billingData = await service.getBillingSection({ forceRefresh });
        sendJson(res, 200, billingData);
        return;
      }

      if (method === "GET" && pathname.endsWith("/api/budgets")) {
        const forceRefresh = parsedUrl.searchParams.get("refresh") === "1";
        const budgetsData = await service.getBudgetsSection({ forceRefresh });
        sendJson(res, 200, budgetsData);
        return;
      }

      if (method === "GET" && pathname.endsWith("/api/spend")) {
        const forceRefresh = parsedUrl.searchParams.get("refresh") === "1";
        const spendData = await service.getSpendSection({ forceRefresh });
        sendJson(res, 200, spendData);
        return;
      }

      // Monolithic Overview & Breakdown Routes (MCP / legacy compatibility)
      if (method === "GET" && pathname.endsWith("/api/overview")) {
        const forceRefresh = parsedUrl.searchParams.get("refresh") === "1";
        const overview = await service.getOverview({ forceRefresh });
        sendJson(res, 200, overview);
        return;
      }

      if (method === "GET" && pathname.endsWith("/api/project-breakdown")) {
        const projectId = parsedUrl.searchParams.get("projectId") || "";
        const breakdown = await service.getProjectCostBreakdown(projectId);
        sendJson(res, 200, breakdown);
        return;
      }

      if (method === "POST" && pathname.endsWith("/api/active-project")) {
        const body = await readJsonBody(req);
        const result = await service.setActiveProject(String(body.projectId ?? ""));
        const overview = await service.getFastOverviewAfterLocalMutation();
        sendJson(res, 200, { ...result, overview });
        return;
      }

      if (method === "POST" && pathname.endsWith("/api/active-account")) {
        const body = await readJsonBody(req);
        const result = await service.setActiveAccount(String(body.account ?? ""));
        if (body.progressive === true) {
          sendJson(res, 200, result);
          return;
        }
        const overview = await service.getOverview({ forceRefresh: false });
        sendJson(res, 200, { ...result, overview });
        return;
      }

      if (method === "POST" && pathname.endsWith("/api/pin-project")) {
        const body = await readJsonBody(req);
        service.setPinnedProject(String(body.projectId ?? ""), Boolean(body.pinned));
        const overview = await service.getFastOverviewAfterLocalMutation();
        sendJson(res, 200, { overview });
        return;
      }

      if (method === "POST" && pathname.endsWith("/api/project-billing")) {
        const body = await readJsonBody(req);
        const result = await service.setProjectBillingAccount(
          String(body.projectId ?? ""),
          String(body.billingAccountId ?? "")
        );
        const overview = await service.getFastOverviewAfterLocalMutation();
        sendJson(res, 200, { ...result, overview });
        return;
      }

      if (method === "POST" && pathname.endsWith("/api/delete-project")) {
        const body = await readJsonBody(req);
        const result = await service.deleteProject(
          String(body.projectId ?? ""),
          String(body.confirmProjectId ?? "")
        );
        const overview = await service.getFastOverviewAfterLocalMutation();
        sendJson(res, 200, { ...result, overview });
        return;
      }

      if (method === "POST" && pathname.endsWith("/api/preferences")) {
        const body = await readJsonBody(req);
        const cloudContextChanged =
          typeof body.demoMode === "boolean" ||
          body.gcloudPathOverride === null ||
          typeof body.gcloudPathOverride === "string" ||
          body.quotaProjectOverride === null ||
          typeof body.quotaProjectOverride === "string";
        service.updateSettings({
          maskEmails: typeof body.maskEmails === "boolean" ? body.maskEmails : undefined,
          cacheTtlHours: typeof body.cacheTtlHours === "number" ? body.cacheTtlHours : undefined,
          gcloudPathOverride:
            body.gcloudPathOverride === null || typeof body.gcloudPathOverride === "string"
              ? (body.gcloudPathOverride                 )
              : undefined,
          quotaProjectOverride:
            body.quotaProjectOverride === null || typeof body.quotaProjectOverride === "string"
              ? (body.quotaProjectOverride                 )
              : undefined,
          demoMode: typeof body.demoMode === "boolean" ? body.demoMode : undefined,
          locale: typeof body.locale === "string" ? (body.locale                    ) : undefined,
          autoUpdatePlugin:
            typeof body.autoUpdatePlugin === "boolean" ? body.autoUpdatePlugin : undefined,
        });
        if (body.progressive === true && cloudContextChanged) {
          const bootstrap = await service.getBootstrap({ forceRefresh: false });
          sendJson(res, 200, { bootstrap });
          return;
        }
        const overview = cloudContextChanged
          ? await service.getOverview({ forceRefresh: false })
          : await service.getFastOverviewAfterLocalMutation();
        sendJson(res, 200, { overview });
        return;
      }

      if (method === "POST" && pathname.endsWith("/api/billing-export/discover")) {
        const body = await readJsonBody(req);
        const tables = await service.discoverExportTables(String(body.hostProjectId ?? ""));
        sendJson(res, 200, { tables });
        return;
      }

      if (method === "POST" && pathname.endsWith("/api/billing-export/configure")) {
        const body = await readJsonBody(req);
        const overview = await service.configureExportTable({
          billingAccountId: String(body.billingAccountId ?? ""),
          tableId: typeof body.tableId === "string" ? body.tableId : undefined,
          hostProjectId: typeof body.hostProjectId === "string" ? body.hostProjectId : undefined,
          remove: Boolean(body.remove),
        });
        sendJson(res, 200, { overview });
        return;
      }

      if (method === "POST" && pathname.endsWith("/api/enable-service")) {
        const body = await readJsonBody(req);
        const overview = await service.enableServiceApi(
          String(body.projectId ?? ""),
          String(body.serviceName ?? "")
        );
        sendJson(res, 200, { overview });
        return;
      }

      if (method === "POST" && pathname.endsWith("/api/auth-login")) {
        await readJsonBody(req);
        const overview = await service.startInteractiveLogin();
        sendJson(res, 200, { overview });
        return;
      }

      if (method === "POST" && pathname.endsWith("/api/plugin-update/check")) {
        await readJsonBody(req);
        const overview = await service.checkPluginUpdate(true);
        sendJson(res, 200, { overview });
        return;
      }

      if (method === "POST" && pathname.endsWith("/api/plugin-update/apply")) {
        await readJsonBody(req);
        const overview = await service.applyPluginUpdate();
        sendJson(res, 200, { overview });
        return;
      }

      if (pathname.includes("/api/")) {
        sendJson(res, 404, { error: "API route not found." });
        return;
      }

      // Static Asset Serving (strictly confined inside webRootDir + logo.svg)
      if (method === "GET") {
        if (pathname.endsWith("/logo.svg")) {
          if (existsSync(logoPath)) {
            setSecurityHeaders(res);
            res.writeHead(200, { "Content-Type": "image/svg+xml" });
            res.end(readFileSync(logoPath));
            return;
          }
        }

        const relRequest =
          pathname === "/" || pathname.endsWith("/")
            ? "index.html"
            : pathname.replace(/^\/+/, "");
        let candidatePath = resolve(webRootDir, relRequest);
        if (!existsSync(candidatePath)) {
          const fallbackBase = basename(pathname);
          if (fallbackBase) {
            candidatePath = resolve(webRootDir, fallbackBase);
          }
          if (!existsSync(candidatePath) && !extname(pathname)) {
            candidatePath = resolve(webRootDir, "index.html");
          }
        }

        // Enforce directory boundary check with trailing path separator
        if (
          candidatePath.startsWith(webRootDir + "/") ||
          candidatePath.startsWith(webRootDir + "\\")
        ) {
          if (existsSync(candidatePath)) {
            const ext = extname(candidatePath).toLowerCase();
            if (ext === ".html") {
              const cspNonce = randomBytes(16).toString("base64");
              let html = readFileSync(candidatePath, "utf-8");
              const cssPath = resolve(webRootDir, "styles.css");
              const bundlePath = resolve(webRootDir, "bundle.js");
              if (existsSync(cssPath)) {
                const cssText = readFileSync(cssPath, "utf-8").replace(/<\/style/gi, "<\\/style");
                html = html.replace(
                  "</head>",
                  `  <style nonce="${cspNonce}">\n${cssText}\n</style>\n  </head>`
                );
              }
              if (existsSync(bundlePath)) {
                const bundleText = readFileSync(bundlePath, "utf-8").replace(
                  /<\/script/gi,
                  "<\\/script"
                );
                html = html.replace(
                  "</body>",
                  `    <script nonce="${cspNonce}">\n${bundleText}\n</script>\n  </body>`
                );
              }
              setSecurityHeaders(res, cspNonce);
              res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
              res.end(html);
              return;
            }

            const contentType = MIME_TYPES[ext] || "application/octet-stream";
            setSecurityHeaders(res);
            res.writeHead(200, { "Content-Type": contentType });
            res.end(readFileSync(candidatePath));
            return;
          }
        }

        sendJson(res, 404, { error: "Not Found" });
        return;
      }

      sendJson(res, 404, { error: "Not Found" });
    } catch (err) {
      sendJson(res, 400, { error: sanitizeErrorMessage(err) });
    }
  });
}

export function startSidecarServer(
  port = Number(process.env.ANTIGRAVITY_SIDECAR_WEB_PORT || process.env.PORT || 0),
  options                       = {}
)                                {
  const server = createSidecarHttpServer(options);
  return new Promise((resolveStart, rejectStart) => {
    server.once("error", rejectStart);
    server.listen(port, "127.0.0.1", () => {
      const addr = server.address();
      const boundPort = typeof addr === "object" && addr ? addr.port : port;
      console.error(`GCP Companion listening on http://127.0.0.1:${boundPort}`);
      resolveStart({
        server,
        port: boundPort,
        close: () =>
          new Promise      ((resClose) => {
            server.close(() => resClose());
            server.closeAllConnections?.();
          }),
      });
    });
  });
}

// Entrypoint check when invoked directly as `node src/sidecar/server.ts` or `node dist/sidecar/server.mjs`
// Note: `dist/sidecar.mjs` is its own wrapper shim that calls `startSidecarServer()`, so do NOT match `sidecar.mjs` here
// or `startSidecarServer()` will be called twice on `ANTIGRAVITY_SIDECAR_WEB_PORT` and fail with EADDRINUSE (exit status 1).
const isMain = (() => {
  try {
    const entry = process.argv[1] ? resolve(process.argv[1]) : "";
    const self = resolve(fileURLToPath(import.meta.url));
    return entry === self;
  } catch {
    return false;
  }
})();

if (isMain) {
  startSidecarServer()
    .then((running) => {
      for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]         ) {
        process.on(sig, () => {
          running.close().finally(() => process.exit(0));
        });
      }
    })
    .catch((err) => {
      console.error("GCP Companion sidecar failed to start:", err);
      process.exit(1);
    });
}
