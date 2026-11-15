import { spawn } from "node:child_process";
import { accessSync, constants, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, isAbsolute, join, resolve } from "node:path";
import {
  maskEmail,
  sanitizeErrorMessage,
  validateAccountEmail,
  validateProjectId,
} from "./security.mjs";
                                                            

                          
               
                          
                    
                                                 

                                                

const ALLOWED_ENABLEABLE_SERVICES = new Set([
  "cloudbilling.googleapis.com",
  "billingbudgets.googleapis.com",
  "bigquery.googleapis.com",
]);
const IS_WINDOWS = process.platform === "win32";
const TOKEN_TTL_MS = 45 * 60 * 1000; // Refresh cached access token every 45m
const AUTH_STATUS_TTL_MS = 30 * 1000; // Avoid re-spawning gcloud CLI on rapid consecutive UI/MCP reads
const MAX_EXEC_BYTES = 8 * 1024 * 1024;

export function defaultExecFile(
  file        ,
  args                   ,
  timeoutMs = 8_000
)                                              {
  return new Promise((resolvePromise, rejectPromise) => {
    let settled = false;
    let stdoutLen = 0;
    let stderrLen = 0;
    const outChunks           = [];
    const errChunks           = [];

    const finish = (err              ) => {
      if (settled) return;
      settled = true;
      clearTimeout(hardTimer);
      if (err) {
        rejectPromise(err);
      } else {
        resolvePromise({
          stdout: Buffer.concat(outChunks).toString("utf-8"),
          stderr: Buffer.concat(errChunks).toString("utf-8"),
        });
      }
    };

    const child = spawn(file, [...args], {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      env: {
        ...process.env,
        CLOUDSDK_CORE_DISABLE_PROMPTS: "1",
      },
    });

    // Hard deadline: destroy stdio pipes immediately on timeout so background grandchildren cannot hang the promise
    const hardTimer = setTimeout(() => {
      child.stdout?.destroy();
      child.stderr?.destroy();
      try {
        child.kill("SIGKILL");
      } catch {
        // Ignore kill errors
      }
      finish(new Error(`Command timed out after ${timeoutMs}ms: ${file}`));
    }, timeoutMs);

    child.stdout?.on("data", (chunk        ) => {
      stdoutLen += chunk.length;
      if (stdoutLen <= MAX_EXEC_BYTES) {
        outChunks.push(chunk);
      }
    });

    child.stderr?.on("data", (chunk        ) => {
      stderrLen += chunk.length;
      if (stderrLen <= MAX_EXEC_BYTES) {
        errChunks.push(chunk);
      }
    });

    child.on("error", (err) => {
      finish(err);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        const errText = Buffer.concat(errChunks).toString("utf-8").trim();
        finish(new Error(errText || `Process exited with code ${code}`));
        return;
      }
      finish(null);
    });
  });
}

function isExecutableFile(filePath        )          {
  try {
    if (!existsSync(filePath)) return false;
    accessSync(filePath, IS_WINDOWS ? constants.F_OK : constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export function getCandidateGcloudPaths(overridePath                )           {
  const candidates           = [];
  if (overridePath && overridePath.trim()) {
    const resolved = isAbsolute(overridePath.trim())
      ? resolve(overridePath.trim())
      : overridePath.trim();
    candidates.push(resolved);
  }

  const binName = IS_WINDOWS ? "gcloud.cmd" : "gcloud";
  const pathEntries = (process.env.PATH ?? "").split(delimiter).filter(Boolean);
  for (const dir of pathEntries) {
    candidates.push(join(dir, binName));
  }

  const home = homedir();
  if (IS_WINDOWS) {
    const localAppData = process.env.LOCALAPPDATA || join(home, "AppData", "Local");
    const programFiles = process.env.ProgramFiles || "C:\\Program Files (x86)";
    candidates.push(
      join(localAppData, "Google", "Cloud SDK", "google-cloud-sdk", "bin", "gcloud.cmd"),
      join(programFiles, "Google", "Cloud SDK", "google-cloud-sdk", "bin", "gcloud.cmd"),
      join(home, "google-cloud-sdk", "bin", "gcloud.cmd")
    );
  } else {
    candidates.push(
      "/opt/homebrew/bin/gcloud",
      "/opt/homebrew/share/google-cloud-sdk/bin/gcloud",
      "/opt/homebrew/Caskroom/gcloud-cli/latest/google-cloud-sdk/bin/gcloud",
      "/opt/homebrew/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/bin/gcloud",
      "/usr/local/bin/gcloud",
      "/usr/local/share/google-cloud-sdk/bin/gcloud",
      "/usr/local/Caskroom/gcloud-cli/latest/google-cloud-sdk/bin/gcloud",
      "/usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/bin/gcloud",
      join(home, "homebrew", "bin", "gcloud"),
      join(home, "homebrew", "share", "google-cloud-sdk", "bin", "gcloud"),
      join(home, "homebrew", "Caskroom", "gcloud-cli", "latest", "google-cloud-sdk", "bin", "gcloud"),
      join(home, "homebrew", "Caskroom", "google-cloud-sdk", "latest", "google-cloud-sdk", "bin", "gcloud"),
      join(home, "google-cloud-sdk", "bin", "gcloud"),
      join(home, ".local", "bin", "gcloud"),
      join(home, "Downloads", "google-cloud-sdk", "bin", "gcloud"),
      "/snap/bin/gcloud",
      "/usr/bin/gcloud"
    );
    for (const rcFile of [".zshrc", ".zprofile", ".bashrc", ".bash_profile"]) {
      try {
        const rcPath = join(home, rcFile);
        if (!existsSync(rcPath)) continue;
        const content = readFileSync(rcPath, "utf-8");
        const matches = content.matchAll(/([/~][^\s"':;#]*google-cloud-sdk)/g);
        for (const m of matches) {
          const sdkDir = m[1].startsWith("~/") ? join(home, m[1].slice(2)) : m[1];
          candidates.push(join(sdkDir, "bin", "gcloud"));
        }
      } catch {
        // Ignore unreadable shell startup files
      }
    }
  }

  return Array.from(new Set(candidates));
}

                                      
                      
                      
                           
 

                       
                     
                      
                    
 

                      
                      
                     
                    
 

export class GcloudClient {
                   execFn            ;
                   fetchFn           ;
                   gcloudConfigDir        ;
          resolvedBinaryCache                                                      = null;
          cachedToken                     = null;
          cachedAuth                    = null;

  constructor(options                      = {}) {
    this.execFn = options.execFn ?? defaultExecFile;
    this.fetchFn = options.fetchFn ?? globalThis.fetch;
    this.gcloudConfigDir =
      options.gcloudConfigDir ??
      process.env.CLOUDSDK_CONFIG ??
      (IS_WINDOWS
        ? join(process.env.APPDATA || join(homedir(), "AppData", "Roaming"), "gcloud")
        : join(homedir(), ".config", "gcloud"));
  }

  invalidateTokenCache()       {
    this.cachedToken = null;
    this.cachedAuth = null;
    this.resolvedBinaryCache = null;
  }

          resolveGcloudBinarySync(overridePath                )                {
    const overrideKey = overridePath?.trim() || "";
    if (overrideKey) {
      if (overrideKey.startsWith("-")) {
        throw new Error("Invalid gcloud binary override path.");
      }
      if (isExecutableFile(overrideKey)) {
        return overrideKey;
      }
    }
    for (const candidate of getCandidateGcloudPaths(overridePath)) {
      if (isExecutableFile(candidate)) {
        return candidate;
      }
    }
    return null;
  }

  async resolveGcloudBinary(overridePath                )                         {
    const overrideKey = overridePath?.trim() || "";
    if (
      this.resolvedBinaryCache &&
      this.resolvedBinaryCache.overrideKey === overrideKey &&
      this.resolvedBinaryCache.path !== null &&
      isExecutableFile(this.resolvedBinaryCache.path)
    ) {
      return this.resolvedBinaryCache.path;
    }

    const syncHit = this.resolveGcloudBinarySync(overridePath);
    if (syncHit) {
      this.resolvedBinaryCache = { overrideKey, path: syncHit };
      return syncHit;
    }

    // Fallback: ask login shell for user PATH entries (useful when launched from macOS GUI Dock)
    if (!IS_WINDOWS) {
      for (const shell of ["/bin/zsh", "/bin/bash"]) {
        if (!isExecutableFile(shell)) continue;
        try {
          const { stdout } = await this.execFn(shell, ["-lc", "command -v gcloud"], 2_500);
          const firstLine = stdout.trim().split(/\r?\n/)[0]?.trim();
          if (firstLine && isAbsolute(firstLine) && isExecutableFile(firstLine)) {
            this.resolvedBinaryCache = { overrideKey, path: firstLine };
            return firstLine;
          }
        } catch {
          // Ignore shell lookup errors
        }
      }
    }

    this.resolvedBinaryCache = { overrideKey, path: null };
    return null;
  }

          readLegacyCredentialsAccounts()           {
    try {
      const legacyDir = join(this.gcloudConfigDir, "legacy_credentials");
      if (!existsSync(legacyDir)) return [];
      const entries = readdirSync(legacyDir);
      const valid           = [];
      for (const entry of entries) {
        if (!entry.includes("@")) continue;
        const full = join(legacyDir, entry);
        try {
          if (statSync(full).isDirectory() && existsSync(join(full, "adc.json"))) {
            valid.push(entry);
          }
        } catch {
          // Ignore inaccessible entries
        }
      }
      return valid.sort();
    } catch {
      return [];
    }
  }

          getLegacyAdcFilePath(account                           )                {
    if (!account || !account.includes("@")) return null;
    try {
      const validAcct = validateAccountEmail(account);
      const candidate = join(this.gcloudConfigDir, "legacy_credentials", validAcct, "adc.json");
      return existsSync(candidate) ? candidate : null;
    } catch {
      return null;
    }
  }

  /**
   * Reads gcloud's first-party OAuth credentials (`32555940559...`) directly from `~/.config/gcloud/credentials.db`
   * using Node's built-in `node:sqlite` module when available (< 1ms, zero subprocesses, and no user quota project required for Cloud Billing API).
   */
          async readSqliteCredentialJson(
    targetAccount                
  )                                                                 {
    const dbPath = join(this.gcloudConfigDir, "credentials.db");
    if (!existsSync(dbPath)) {
      return { accounts: [], credentialJson: null };
    }
    try {
      const sqliteMod = (await import("node:sqlite"))     
                           
                       
                                          
              
                                                                                  
                            
          
       ;
      const db = new sqliteMod.DatabaseSync(dbPath, { readOnly: true });
      try {
        const rows = db.prepare("SELECT account_id, value FROM credentials").all();
        const accounts           = [];
        let matchedValue                = null;
        let firstValue                = null;
        for (const row of rows) {
          const acct = typeof row.account_id === "string" ? row.account_id.trim() : "";
          const val = typeof row.value === "string" ? row.value : null;
          if (acct && acct.includes("@")) {
            accounts.push(acct);
            if (!firstValue && val) firstValue = val;
            if (targetAccount && acct.toLowerCase() === targetAccount.toLowerCase() && val) {
              matchedValue = val;
            }
          }
        }
        return {
          accounts: accounts.sort(),
          credentialJson: matchedValue ?? firstValue,
        };
      } finally {
        db.close();
      }
    } catch {
      return { accounts: [], credentialJson: null };
    }
  }

          readLocalConfigValues()                                                     {
    try {
      const activeConfigPath = join(this.gcloudConfigDir, "active_config");
      const activeName = existsSync(activeConfigPath)
        ? readFileSync(activeConfigPath, "utf-8").trim() || "default"
        : "default";
      if (!/^[a-zA-Z0-9_-]{1,64}$/.test(activeName)) {
        return { account: null, project: null };
      }
      const cfgFile = join(this.gcloudConfigDir, "configurations", `config_${activeName}`);
      if (!existsSync(cfgFile)) {
        return { account: null, project: null };
      }
      const content = readFileSync(cfgFile, "utf-8");
      const accountMatch = /^\s*account\s*=\s*(.+)\s*$/m.exec(content);
      const projectMatch = /^\s*project\s*=\s*(.+)\s*$/m.exec(content);
      return {
        account: accountMatch?.[1]?.trim() || null,
        project: projectMatch?.[1]?.trim() || null,
      };
    } catch {
      return { account: null, project: null };
    }
  }

          getAdcFilePath()                {
    const envAdc = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
    if (envAdc && existsSync(envAdc)) {
      return envAdc;
    }
    const defaultAdc = join(this.gcloudConfigDir, "application_default_credentials.json");
    if (existsSync(defaultAdc)) {
      return defaultAdc;
    }
    return null;
  }

  async getAuthStatus(overridePath                , forceRefresh = false)                      {
    const overrideKey = overridePath?.trim() || "";
    if (forceRefresh) {
      this.cachedAuth = null;
      if (this.resolvedBinaryCache?.path === null) {
        this.resolvedBinaryCache = null;
      }
    }
    if (
      !forceRefresh &&
      this.cachedAuth &&
      this.cachedAuth.overrideKey === overrideKey &&
      Date.now() < this.cachedAuth.expiresAt
    ) {
      return this.cachedAuth.status;
    }

    const cacheAndReturn = (status            )             => {
      this.cachedAuth = {
        overrideKey,
        status,
        expiresAt: Date.now() + AUTH_STATUS_TTL_MS,
      };
      return status;
    };

    const localCfg = this.readLocalConfigValues();

    // Ultra-fast zero-subprocess path: read ~/.config/gcloud/legacy_credentials or credentials.db + active config (< 1ms)
    let fastAccounts = this.readLegacyCredentialsAccounts();
    if (fastAccounts.length === 0) {
      const sqliteData = await this.readSqliteCredentialJson(localCfg.account);
      fastAccounts = sqliteData.accounts;
    }
    if (fastAccounts.length > 0) {
      const preferred =
        localCfg.account && fastAccounts.includes(localCfg.account)
          ? localCfg.account
          : fastAccounts[0];
      const detectedBin =
        this.resolveGcloudBinarySync(overridePath) ??
        (await this.resolveGcloudBinary(overridePath));
      const accounts                  = fastAccounts.map((acct) => ({
        account: acct,
        maskedAccount: maskEmail(acct) ?? acct,
        active: acct === preferred,
      }));
      return cacheAndReturn({
        authenticated: true,
        source: "gcloud",
        gcloudInstalled: Boolean(detectedBin),
        gcloudBinaryPath: detectedBin,
        activeAccount: preferred,
        maskedActiveAccount: maskEmail(preferred) ?? preferred,
        activeProject: localCfg.project || null,
        accounts,
        setupHint: detectedBin
          ? null
          : "Authenticated via saved credentials, but `gcloud` CLI binary was not found in PATH.",
      });
    }

    const binary = await this.resolveGcloudBinary(overridePath);

    if (binary) {
      try {
        const [authListRes, projectRes] = await Promise.all([
          this.execFn(binary, ["auth", "list", "--format=json", "--quiet"], 6_000),
          this.execFn(binary, ["config", "get-value", "project", "--quiet"], 4_000).catch(() => ({
            stdout: "",
            stderr: "",
          })),
        ]);

        const rawAccounts = JSON.parse(authListRes.stdout || "[]")           
                           
                          
          ;
        const accounts                  = rawAccounts
          .filter((item) => typeof item.account === "string" && item.account.length > 0)
          .map((item) => {
            const acct = String(item.account);
            return {
              account: acct,
              maskedAccount: maskEmail(acct) ?? acct,
              active: String(item.status || "").toUpperCase() === "ACTIVE",
            };
          });

        const activeEntry = accounts.find((a) => a.active) ?? accounts[0] ?? null;
        const rawProj = projectRes.stdout.trim();
        const activeProject =
          rawProj && rawProj !== "(unset)" ? rawProj : localCfg.project;

        if (activeEntry) {
          return cacheAndReturn({
            authenticated: true,
            source: "gcloud",
            gcloudInstalled: true,
            gcloudBinaryPath: binary,
            activeAccount: activeEntry.account,
            maskedActiveAccount: activeEntry.maskedAccount,
            activeProject: activeProject || null,
            accounts,
            setupHint: null,
          });
        }

        // gcloud is installed, check if ADC exists even if `gcloud auth list` is empty
        const adcPath = this.getAdcFilePath();
        if (adcPath) {
          const fallbackAccount = localCfg.account || "adc-credentials@local";
          return cacheAndReturn({
            authenticated: true,
            source: "adc",
            gcloudInstalled: true,
            gcloudBinaryPath: binary,
            activeAccount: fallbackAccount,
            maskedActiveAccount: maskEmail(fallbackAccount),
            activeProject: activeProject || null,
            accounts: [
              {
                account: fallbackAccount,
                maskedAccount: maskEmail(fallbackAccount) ?? fallbackAccount,
                active: true,
              },
            ],
            setupHint: null,
          });
        }

        return cacheAndReturn({
          authenticated: false,
          source: "none",
          gcloudInstalled: true,
          gcloudBinaryPath: binary,
          activeAccount: null,
          maskedActiveAccount: null,
          activeProject: activeProject || null,
          accounts: [],
          setupHint: "Run `gcloud auth login` in your terminal, then click Refresh.",
        });
      } catch (err) {
        return cacheAndReturn({
          authenticated: false,
          source: "none",
          gcloudInstalled: true,
          gcloudBinaryPath: binary,
          activeAccount: null,
          maskedActiveAccount: null,
          activeProject: localCfg.project,
          accounts: [],
          setupHint: `gcloud error: ${sanitizeErrorMessage(err)}`,
        });
      }
    }

    // No gcloud binary found; check Application Default Credentials directly
    const adcPath = this.getAdcFilePath();
    if (adcPath) {
      const fallbackAccount = localCfg.account || "adc-credentials@local";
      return cacheAndReturn({
        authenticated: true,
        source: "adc",
        gcloudInstalled: false,
        gcloudBinaryPath: null,
        activeAccount: fallbackAccount,
        maskedActiveAccount: maskEmail(fallbackAccount),
        activeProject: localCfg.project,
        accounts: [
          {
            account: fallbackAccount,
            maskedAccount: maskEmail(fallbackAccount) ?? fallbackAccount,
            active: true,
          },
        ],
        setupHint: null,
      });
    }

    return cacheAndReturn({
      authenticated: false,
      source: "none",
      gcloudInstalled: false,
      gcloudBinaryPath: null,
      activeAccount: null,
      maskedActiveAccount: null,
      activeProject: null,
      accounts: [],
      setupHint:
        "Install Google Cloud SDK (`gcloud`) and run `gcloud auth login`, or configure `gcloud auth application-default login`.",
    });
  }

  async getAccessToken(overridePath                , accountHint                )                  {
    const cacheKey = `${overridePath ?? ""}::${accountHint ?? ""}`;
    if (
      this.cachedToken &&
      this.cachedToken.accountKey === cacheKey &&
      Date.now() < this.cachedToken.expiresAt
    ) {
      return this.cachedToken.accessToken;
    }

    const targetAccount = accountHint || this.readLocalConfigValues().account;

    // 1. Best fast path: exchange first-party gcloud OAuth credential from credentials.db (~80ms, no quota project needed for Cloud Billing)
    const sqliteCred = await this.readSqliteCredentialJson(targetAccount);
    if (sqliteCred.credentialJson) {
      try {
        const token = await this.exchangeOAuthCredentialJson(sqliteCred.credentialJson);
        this.cachedToken = {
          accountKey: cacheKey,
          accessToken: token,
          expiresAt: Date.now() + TOKEN_TTL_MS,
        };
        return token;
      } catch {
        // Fall through to gcloud CLI / ADC if SQLite credential refresh fails
      }
    }

    // 2. CLI path: `gcloud auth print-access-token` (also returns first-party gcloud OAuth token)
    const binary = await this.resolveGcloudBinary(overridePath);
    if (binary) {
      try {
        const args = ["auth", "print-access-token", "--quiet"];
        if (accountHint && accountHint !== "adc-credentials@local") {
          const validAcct = validateAccountEmail(accountHint);
          args.push(`--account=${validAcct}`);
        }
        const { stdout } = await this.execFn(binary, args, 6_000);
        const token = stdout.trim();
        if (token) {
          this.cachedToken = {
            accountKey: cacheKey,
            accessToken: token,
            expiresAt: Date.now() + TOKEN_TTL_MS,
          };
          return token;
        }
      } catch {
        // Fall through to legacy_credentials / ADC token exchange
      }
    }

    // 3. Legacy ADC per-account file (`~/.config/gcloud/legacy_credentials/<account>/adc.json`)
    const legacyAdc = this.getLegacyAdcFilePath(targetAccount);
    if (legacyAdc) {
      try {
        const token = await this.exchangeAdcRefreshToken(legacyAdc);
        this.cachedToken = {
          accountKey: cacheKey,
          accessToken: token,
          expiresAt: Date.now() + TOKEN_TTL_MS,
        };
        return token;
      } catch {
        // Fall through to default ADC file
      }
    }

    // 4. Default ADC file (`~/.config/gcloud/application_default_credentials.json`)
    const adcPath = this.getAdcFilePath();
    if (adcPath) {
      const token = await this.exchangeAdcRefreshToken(adcPath);
      this.cachedToken = {
        accountKey: cacheKey,
        accessToken: token,
        expiresAt: Date.now() + TOKEN_TTL_MS,
      };
      return token;
    }

    throw new Error(
      "Unable to obtain Google Cloud access token. Please run `gcloud auth login`."
    );
  }

          async exchangeAdcRefreshToken(adcPath        )                  {
    return this.exchangeOAuthCredentialJson(readFileSync(adcPath, "utf-8"));
  }

          async exchangeOAuthCredentialJson(rawJson        )                  {
    const raw = JSON.parse(rawJson)     
                    
                         
                             
                             
     ;
    if (!raw.client_id || !raw.client_secret || !raw.refresh_token) {
      throw new Error(
        "Unsupported OAuth credential format. Run `gcloud auth login` or `gcloud auth application-default login`."
      );
    }

    const body = new URLSearchParams({
      client_id: raw.client_id,
      client_secret: raw.client_secret,
      refresh_token: raw.refresh_token,
      grant_type: "refresh_token",
    });

    const response = await this.fetchFn("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`ADC token refresh failed with HTTP ${response.status}.`);
    }

    const data = (await response.json())                             ;
    if (!data.access_token) {
      throw new Error("ADC token endpoint returned an empty access_token.");
    }
    return data.access_token;
  }

          updateActiveConfigProperty(key                       , value        )          {
    try {
      const activeConfigPath = join(this.gcloudConfigDir, "active_config");
      const activeName = existsSync(activeConfigPath)
        ? readFileSync(activeConfigPath, "utf-8").trim() || "default"
        : "default";
      if (!/^[a-zA-Z0-9_-]{1,64}$/.test(activeName)) {
        return false;
      }
      const cfgFile = join(this.gcloudConfigDir, "configurations", `config_${activeName}`);
      if (!existsSync(cfgFile)) {
        return false;
      }
      const existing = readFileSync(cfgFile, "utf-8");
      const propRe = new RegExp(`^\\s*${key}\\s*=.*$`, "m");
      const updated = propRe.test(existing)
        ? existing.replace(propRe, `${key} = ${value}`)
        : existing.includes("[core]")
          ? existing.replace("[core]", `[core]\n${key} = ${value}`)
          : `[core]\n${key} = ${value}\n${existing}`;
      writeFileSync(cfgFile, updated, { encoding: "utf-8", mode: 0o600 });
      return true;
    } catch {
      return false;
    }
  }

  async setActiveProject(projectId        , overridePath                )                {
    const validId = validateProjectId(projectId);
    this.cachedAuth = null;
    if (this.updateActiveConfigProperty("project", validId)) {
      return;
    }
    const binary = await this.resolveGcloudBinary(overridePath);
    if (binary) {
      await this.execFn(binary, ["config", "set", "project", validId, "--quiet"], 6_000);
      this.cachedAuth = null;
      return;
    }
    throw new Error("gcloud CLI is not installed; cannot switch active project.");
  }

  async setActiveAccount(account        , overridePath                )                {
    const validAccount = validateAccountEmail(account);
    this.invalidateTokenCache();
    if (this.updateActiveConfigProperty("account", validAccount)) {
      return;
    }
    const binary = await this.resolveGcloudBinary(overridePath);
    if (!binary) {
      throw new Error("gcloud CLI is required to switch active Google accounts.");
    }
    await this.execFn(binary, ["config", "set", "account", validAccount, "--quiet"], 6_000);
    this.invalidateTokenCache();
  }

  async enableProjectService(
    projectId        ,
    serviceName        ,
    overridePath                
  )                {
    const validId = validateProjectId(projectId);
    const cleanService = serviceName.trim().toLowerCase();
    if (!ALLOWED_ENABLEABLE_SERVICES.has(cleanService)) {
      throw new Error(`Service "${cleanService}" is not in the Companion enablement allowlist.`);
    }

    // Prefer `gcloud services enable` when gcloud CLI is installed (works even on brand-new projects)
    const binary = await this.resolveGcloudBinary(overridePath);
    if (binary) {
      await this.execFn(
        binary,
        ["services", "enable", cleanService, `--project=${validId}`, "--quiet"],
        35_000
      );
      return;
    }

    // Fallback: Service Usage REST API (`serviceusage.googleapis.com`)
    const auth = await this.getAuthStatus(overridePath);
    const token = await this.getAccessToken(overridePath, auth.activeAccount);
    const enableUrl = `https://serviceusage.googleapis.com/v1/projects/${encodeURIComponent(
      validId
    )}/services/${encodeURIComponent(cleanService)}:enable`;

    const res = await this.fetchFn(enableUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-goog-user-project": validId,
      },
      body: "{}",
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const errBody = (await res.json())                                    ;
        if (errBody?.error?.message) detail = `${detail}: ${errBody.error.message}`;
      } catch {
        // Ignore non-JSON error
      }
      throw new Error(`Failed to enable ${cleanService}: ${sanitizeErrorMessage(detail)}`);
    }

    const op = (await res.json().catch(() => ({})))                                     ;
      if (op.name && !op.done && op.name !== "operations/noop.DONE_OPERATION") {
        const pollUrl = `https://serviceusage.googleapis.com/v1/${op.name.replace(/^\/+/, "")}`;
        for (let i = 0; i < 10; i++) {
          await new Promise((r) => setTimeout(r, 1_200));
          const pollRes = await this.fetchFn(pollUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "x-goog-user-project": validId,
            },
            signal: AbortSignal.timeout(10_000),
          });
          if (!pollRes.ok) break;
          const pollData = (await pollRes.json().catch(() => ({})))                      ;
          if (pollData.done) break;
        }
      }
  }

  /**
   * Launches interactive browser OAuth sign-in (`gcloud auth login --quiet`), which opens the user's
   * default browser to Google Sign-In and populates `~/.config/gcloud/` upon completion.
   */
  async triggerInteractiveLogin(overridePath                )                      {
    this.invalidateTokenCache();
    const binary = await this.resolveGcloudBinary(overridePath);
    if (!binary) {
      throw new Error(
        "Google Cloud CLI (`gcloud`) is not installed yet. Install it from https://cloud.google.com/sdk/docs/install first."
      );
    }
    await this.execFn(binary, ["auth", "login", "--quiet"], 120_000);
    this.invalidateTokenCache();
    return this.getAuthStatus(overridePath, true);
  }
}
