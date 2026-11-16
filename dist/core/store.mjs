import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { hashAccountKey, safeStoreFilePath } from "./security.mjs";
                                                                                              

const DEFAULT_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const MIN_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SNAPSHOT_SCHEMA_VERSION = 5;

export const VALID_LOCALE_PREFERENCES                                = new Set                  ([
  "auto",
  "en",
  "es",
  "fr",
  "ja",
  "ko",
  "zh-CN",
  "zh-TW",
]);

export function normalizeLocalePreference(value         )                   {
  if (typeof value === "string" && VALID_LOCALE_PREFERENCES.has(value                    )) {
    return value                    ;
  }
  return "auto";
}

export function getDefaultStoreDir()         {
  if (process.env.AGY_GCP_COMPANION_STORE_DIR) {
    return process.env.AGY_GCP_COMPANION_STORE_DIR;
  }
  return join(homedir(), ".gemini", "agy-gcp-companion");
}

export const DEFAULT_PREFERENCES                       = {
  pinnedProjects: [],
  billingExportTables: {},
  cacheTtlMs: DEFAULT_TTL_MS,
  maskEmails: false,
  gcloudPathOverride: null,
  quotaProjectOverride: null,
  demoMode: false,
  locale: "auto",
};

export class CompanionStore {
           storeDir        ;

  constructor(storeDir         = getDefaultStoreDir()) {
    this.storeDir = storeDir;
  }

          ensureDir()       {
    if (!existsSync(this.storeDir)) {
      mkdirSync(this.storeDir, { recursive: true, mode: 0o700 });
    }
  }

          writeJsonAtomic(filename        , data         )       {
    this.ensureDir();
    const targetPath = safeStoreFilePath(this.storeDir, filename);
    const tmpPath = safeStoreFilePath(
      this.storeDir,
      `${filename}.tmp.${process.pid}.${Date.now()}`
    );
    const payload = JSON.stringify(data, null, 2);
    writeFileSync(tmpPath, payload, { encoding: "utf-8", mode: 0o600 });
    renameSync(tmpPath, targetPath);
  }

  loadPreferences()                       {
    try {
      const filePath = safeStoreFilePath(this.storeDir, "preferences.json");
      if (!existsSync(filePath)) {
        return { ...DEFAULT_PREFERENCES, billingExportTables: {}, pinnedProjects: [] };
      }
      const raw = JSON.parse(readFileSync(filePath, "utf-8"))                                 ;
      const ttl =
        typeof raw.cacheTtlMs === "number" && Number.isFinite(raw.cacheTtlMs)
          ? Math.min(MAX_TTL_MS, Math.max(MIN_TTL_MS, raw.cacheTtlMs))
          : DEFAULT_TTL_MS;
      return {
        pinnedProjects: Array.isArray(raw.pinnedProjects)
          ? raw.pinnedProjects.filter((x)              => typeof x === "string")
          : [],
        billingExportTables:
          raw.billingExportTables && typeof raw.billingExportTables === "object"
            ? { ...raw.billingExportTables }
            : {},
        cacheTtlMs: ttl,
        maskEmails: Boolean(raw.maskEmails),
        gcloudPathOverride:
          typeof raw.gcloudPathOverride === "string" && raw.gcloudPathOverride.trim()
            ? raw.gcloudPathOverride.trim()
            : null,
        quotaProjectOverride:
          typeof raw.quotaProjectOverride === "string" && raw.quotaProjectOverride.trim()
            ? raw.quotaProjectOverride.trim()
            : null,
        lastWorkingQuotaProject:
          typeof raw.lastWorkingQuotaProject === "string" && raw.lastWorkingQuotaProject.trim()
            ? raw.lastWorkingQuotaProject.trim()
            : null,
        demoMode: Boolean(raw.demoMode),
        locale: normalizeLocalePreference(raw.locale),
      };
    } catch {
      return { ...DEFAULT_PREFERENCES, billingExportTables: {}, pinnedProjects: [] };
    }
  }

  savePreferences(prefs                      )                       {
    const normalized                       = {
      pinnedProjects: Array.from(new Set(prefs.pinnedProjects)),
      billingExportTables: { ...prefs.billingExportTables },
      cacheTtlMs: Math.min(MAX_TTL_MS, Math.max(MIN_TTL_MS, prefs.cacheTtlMs)),
      maskEmails: Boolean(prefs.maskEmails),
      gcloudPathOverride: prefs.gcloudPathOverride?.trim() || null,
      quotaProjectOverride: prefs.quotaProjectOverride?.trim() || null,
      lastWorkingQuotaProject: prefs.lastWorkingQuotaProject?.trim() || null,
      demoMode: Boolean(prefs.demoMode),
      locale: normalizeLocalePreference(prefs.locale),
    };
    this.writeJsonAtomic("preferences.json", normalized);
    return normalized;
  }

  updatePreferences(updater                                                         )                       {
    const current = this.loadPreferences();
    const updated = updater(current);
    return this.savePreferences(updated);
  }

  loadSnapshot(account        )                             {
    if (!account) return null;
    try {
      const key = hashAccountKey(account);
      const filePath = safeStoreFilePath(this.storeDir, `cache-${key}.json`);
      if (!existsSync(filePath)) return null;
      const parsed = JSON.parse(readFileSync(filePath, "utf-8"))                       ;
      if (parsed.version !== SNAPSHOT_SCHEMA_VERSION || parsed.accountKey !== key) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  saveSnapshot(account        , snapshot                                                     )                      {
    const key = hashAccountKey(account);
    const full                      = {
      version: SNAPSHOT_SCHEMA_VERSION,
      accountKey: key,
      ...snapshot,
    };
    this.writeJsonAtomic(`cache-${key}.json`, full);
    return full;
  }

  clearSnapshot(account        )       {
    if (!account) return;
    try {
      const key = hashAccountKey(account);
      const filePath = safeStoreFilePath(this.storeDir, `cache-${key}.json`);
      if (existsSync(filePath)) {
        rmSync(filePath, { force: true });
      }
    } catch {
      // Ignore cleanup failures
    }
  }
}
