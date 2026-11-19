import { execFile } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
} from "node:fs";
import { homedir } from "node:os";
import { delimiter, dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
                                             
import { sanitizeErrorMessage } from "./security.mjs";
                                                     

export const PLUGIN_ID = "agy-gcp-companion";
export const REMOTE_PLUGIN_MANIFEST_URL =
  "https://raw.githubusercontent.com/ericsk/agy-gcp-companion/main/plugin.json";
export const GITHUB_REPO_URL = "https://github.com/ericsk/agy-gcp-companion";
export const GITHUB_CLONE_URL = "https://github.com/ericsk/agy-gcp-companion.git";
export const DEFAULT_UPDATE_CHECK_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

                          
                 
                          
                    
                                                 

function defaultExecRunner(
  binary        ,
  args                   ,
  timeoutMs = 60_000
)                                              {
  return new Promise((resolveExec, rejectExec) => {
    const child = execFile(
      binary,
      [...args],
      {
        timeout: timeoutMs,
        maxBuffer: 4 * 1024 * 1024,
        windowsHide: true,
        shell: false,
      },
      (err, stdout, stderr) => {
        if (err) {
          rejectExec(new Error(stderr?.trim() || err.message));
          return;
        }
        resolveExec({ stdout: String(stdout ?? ""), stderr: String(stderr ?? "") });
      }
    );
    child.stdin?.end();
  });
}

export function parseSemver(version                           )                                  {
  if (!version || typeof version !== "string") return null;
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version.trim());
  if (!match) return null;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  if (!Number.isSafeInteger(major) || !Number.isSafeInteger(minor) || !Number.isSafeInteger(patch)) {
    return null;
  }
  return [major, minor, patch];
}

export function compareSemver(a        , b        )         {
  const va = parseSemver(a);
  const vb = parseSemver(b);
  if (!va || !vb) return 0;
  for (let i = 0; i < 3; i++) {
    if (va[i] > vb[i]) return 1;
    if (va[i] < vb[i]) return -1;
  }
  return 0;
}

function resolveDefaultPluginRoot()         {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(here, "..", ".."),
    resolve(here, ".."),
  ];
  return (
    candidates.find((dir) => existsSync(join(dir, "plugin.json"))) ??
    candidates[0]
  );
}

function readManifestVersion(dir        )                {
  try {
    const manifestPath = join(dir, "plugin.json");
    if (!existsSync(manifestPath)) return null;
    const raw = JSON.parse(readFileSync(manifestPath, "utf-8"))     
                     
                        
     ;
    if (raw.name && raw.name !== PLUGIN_ID) return null;
    if (typeof raw.version === "string" && parseSemver(raw.version)) {
      return raw.version.trim();
    }
    return null;
  } catch {
    return null;
  }
}

export function getPluginVersion(pluginRootDir         )         {
  return readManifestVersion(resolve(pluginRootDir ?? resolveDefaultPluginRoot())) ?? "1.2.0";
}

function findExecutable(binaryName        , extraDirs                   )                {
  const isWin = process.platform === "win32";
  const suffixes = isWin ? [".exe", ".cmd", ""] : [""];
  const pathDirs = (process.env.PATH || "").split(delimiter).filter(Boolean);
  for (const dir of [...pathDirs, ...extraDirs]) {
    for (const ext of suffixes) {
      const candidate = join(dir, `${binaryName}${ext}`);
      try {
        if (existsSync(candidate) && !lstatSync(candidate).isDirectory()) {
          return candidate;
        }
      } catch {
        // Ignore inaccessible PATH entries
      }
    }
  }
  return null;
}

                                       
                         
                            
                      
                      
                     
                      
                                
                                
 

export class PluginUpdater {
                   pluginRootDir        ;
                   globalPluginsDir        ;
                   fetchFn           ;
                   execFn            ;
                   nowFn            ;
                   checkTtlMs        ;
                   agyBinaryOverride                           ;
                   gitBinaryOverride                           ;

                   bootVersion        ;
          latestVersion                = null;
          updatedToVersion                = null;
          lastCheckedAt                = null;
          lastError                = null;
          checkInFlight                                     = null;
          updateInFlight                                     = null;

  constructor(options                       = {}) {
    this.pluginRootDir = resolve(options.pluginRootDir ?? resolveDefaultPluginRoot());
    this.globalPluginsDir = resolve(
      options.globalPluginsDir ?? join(homedir(), ".gemini", "config", "plugins")
    );
    this.fetchFn = options.fetchFn ?? globalThis.fetch;
    this.execFn = options.execFn ?? defaultExecRunner;
    this.nowFn = options.nowFn ?? (() => new Date());
    this.checkTtlMs = options.checkTtlMs ?? DEFAULT_UPDATE_CHECK_TTL_MS;
    this.agyBinaryOverride = options.agyBinaryPath;
    this.gitBinaryOverride = options.gitBinaryPath;
    this.bootVersion = readManifestVersion(this.pluginRootDir) ?? "1.2.0";
  }

          getTargetInstallDir()         {
    const target = resolve(this.globalPluginsDir, PLUGIN_ID);
    const boundary = this.globalPluginsDir.endsWith(sep)
      ? this.globalPluginsDir
      : this.globalPluginsDir + sep;
    if (!target.startsWith(boundary)) {
      throw new Error("Invalid global plugin target directory.");
    }
    return target;
  }

          getEffectiveInstalledVersion()         {
    if (this.updatedToVersion) {
      return this.updatedToVersion;
    }
    const targetDir = this.getTargetInstallDir();
    const diskVer = readManifestVersion(targetDir);
    if (diskVer && compareSemver(diskVer, this.bootVersion) > 0) {
      return diskVer;
    }
    return this.bootVersion;
  }

  getStatus(autoUpdate         )                     {
    const effectiveVersion = this.getEffectiveInstalledVersion();
    const restartRequired = compareSemver(effectiveVersion, this.bootVersion) > 0;
    const updateAvailable =
      Boolean(this.latestVersion) &&
      compareSemver(this.latestVersion , effectiveVersion) > 0;

    return {
      currentVersion: this.bootVersion,
      latestVersion: this.latestVersion,
      updateAvailable,
      updatedToVersion: restartRequired ? effectiveVersion : this.updatedToVersion,
      restartRequired,
      autoUpdate,
      lastCheckedAt: this.lastCheckedAt,
      releaseUrl: GITHUB_REPO_URL,
      error: this.lastError,
    };
  }

  isCheckStale()          {
    if (!this.lastCheckedAt) return true;
    const age = this.nowFn().getTime() - new Date(this.lastCheckedAt).getTime();
    return age >= this.checkTtlMs;
  }

  async checkForUpdates(options   
                    
                         
                             
    = {})                              {
    const autoUpdate = options.autoUpdate ?? true;
    if (!options.force && !this.isCheckStale()) {
      return this.getStatus(autoUpdate);
    }
    if (this.checkInFlight) {
      return this.checkInFlight;
    }

    this.checkInFlight = (async () => {
      try {
        const res = await this.fetchFn(REMOTE_PLUGIN_MANIFEST_URL, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(8_000),
        });
        if (!res.ok) {
          throw new Error(`GitHub version check returned HTTP ${res.status}.`);
        }
        const raw = (await res.json())                                         ;
        if (raw.name !== PLUGIN_ID || typeof raw.version !== "string" || !parseSemver(raw.version)) {
          throw new Error("Remote plugin.json did not contain a valid version.");
        }

        this.latestVersion = raw.version.trim();
        this.lastCheckedAt = this.nowFn().toISOString();
        this.lastError = null;

        const effectiveVersion = this.getEffectiveInstalledVersion();
        const hasNewer = compareSemver(this.latestVersion, effectiveVersion) > 0;

        if (hasNewer && autoUpdate && options.allowAutoApply !== false) {
          const targetDir = this.getTargetInstallDir();
          // Auto-apply only when an actual non-symlinked global installation exists on disk
          if (existsSync(targetDir) && !lstatSync(targetDir).isSymbolicLink()) {
            await this.applyUpdate(autoUpdate, true);
          }
        }
      } catch (err) {
        this.lastCheckedAt = this.nowFn().toISOString();
        this.lastError = sanitizeErrorMessage(err);
      } finally {
        this.checkInFlight = null;
      }
      return this.getStatus(autoUpdate);
    })();

    return this.checkInFlight;
  }

  async applyUpdate(autoUpdate = true, isAutomatic = false)                              {
    if (this.updateInFlight) {
      return this.updateInFlight;
    }

    this.updateInFlight = (async () => {
      try {
        const targetDir = this.getTargetInstallDir();
        if (existsSync(targetDir) && lstatSync(targetDir).isSymbolicLink()) {
          if (isAutomatic) {
            return this.getStatus(autoUpdate);
          }
          throw new Error(
            "Plugin directory is a development symlink. Run `git pull && npm run build` in your source repository instead."
          );
        }

        const home = homedir();
        const agyBin =
          this.agyBinaryOverride !== undefined
            ? this.agyBinaryOverride
            : findExecutable("agy", [
                "/opt/homebrew/bin",
                "/usr/local/bin",
                join(home, "homebrew", "bin"),
                join(home, ".local", "bin"),
                join(home, ".antigravity", "bin"),
              ]);

        const gitBin =
          this.gitBinaryOverride !== undefined
            ? this.gitBinaryOverride
            : findExecutable("git", ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin"]);

        // Strategy 1: If target directory is a clean git clone, fast-forward pull directly
        if (existsSync(join(targetDir, ".git")) && gitBin) {
          const statusOut = await this.execFn(gitBin, ["-C", targetDir, "status", "--porcelain"], 15_000);
          if (statusOut.stdout.trim().length > 0) {
            throw new Error(
              "Local plugin directory has uncommitted changes; skipping overwrite."
            );
          }
          await this.execFn(gitBin, ["-C", targetDir, "pull", "--ff-only", "origin", "main"], 45_000);
        } else if (agyBin) {
          // Strategy 2: Official Antigravity CLI installer
          await this.execFn(agyBin, ["plugin", "install", GITHUB_REPO_URL], 60_000);
        } else if (gitBin) {
          // Strategy 3: Atomic shallow clone & swap when `agy` is not on GUI PATH
          mkdirSync(this.globalPluginsDir, { recursive: true });
          const suffix = `${process.pid}-${Date.now()}`;
          const stagingDir = resolve(this.globalPluginsDir, `.${PLUGIN_ID}-stage-${suffix}`);
          const backupDir = resolve(this.globalPluginsDir, `.${PLUGIN_ID}-bak-${suffix}`);
          const boundary = this.globalPluginsDir.endsWith(sep)
            ? this.globalPluginsDir
            : this.globalPluginsDir + sep;
          if (!stagingDir.startsWith(boundary) || !backupDir.startsWith(boundary)) {
            throw new Error("Invalid staging directory boundary.");
          }

          try {
            await this.execFn(
              gitBin,
              ["clone", "--depth", "1", "--branch", "main", GITHUB_CLONE_URL, stagingDir],
              60_000
            );
            const stagedVer = readManifestVersion(stagingDir);
            if (!stagedVer || !existsSync(join(stagingDir, "dist", "sidecar.mjs"))) {
              throw new Error("Downloaded plugin bundle failed integrity verification.");
            }
            const hadTarget = existsSync(targetDir);
            if (hadTarget) {
              renameSync(targetDir, backupDir);
            }
            try {
              renameSync(stagingDir, targetDir);
              if (hadTarget) {
                rmSync(backupDir, { recursive: true, force: true });
              }
            } catch (swapErr) {
              if (hadTarget && existsSync(backupDir) && !existsSync(targetDir)) {
                renameSync(backupDir, targetDir);
              }
              throw swapErr;
            }
          } finally {
            if (existsSync(stagingDir)) {
              rmSync(stagingDir, { recursive: true, force: true });
            }
          }
        } else {
          throw new Error("Neither `agy` nor `git` binary was found to install the update.");
        }

        const diskVer = readManifestVersion(targetDir) ?? this.latestVersion ?? this.bootVersion;
        this.updatedToVersion = diskVer;
        if (!this.latestVersion || compareSemver(diskVer, this.latestVersion) > 0) {
          this.latestVersion = diskVer;
        }
        this.lastCheckedAt = this.nowFn().toISOString();
        this.lastError = null;
      } catch (err) {
        this.lastError = sanitizeErrorMessage(err);
        if (!isAutomatic) {
          throw new Error(this.lastError);
        }
      } finally {
        this.updateInFlight = null;
      }

      return this.getStatus(autoUpdate);
    })();

    return this.updateInFlight;
  }
}
