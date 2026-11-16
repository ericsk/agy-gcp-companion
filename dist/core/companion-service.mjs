import {
  createEmptySpendReport,
  discoverBillingExportTables,
  inferBillingAccountFromTableName,
  queryBillingExportSpend,
} from "./bigquery-billing.mjs";
import { buildDemoOverview } from "./demo-data.mjs";
import { fetchAllProjects, fetchBillingAccountsAndProjectLinks } from "./gcp-api.mjs";
import { GcloudClient,                } from "./gcloud.mjs";
import {
  normalizeBillingAccountId,
  sanitizeErrorMessage,
  validateAccountEmail,
  validateBigQueryTableId,
  validateProjectId,
} from "./security.mjs";
import { CompanionStore, VALID_LOCALE_PREFERENCES, normalizeLocalePreference } from "./store.mjs";
import { PluginUpdater } from "./updater.mjs";
             
                 
                       
                      
                            
                       
                         
             
                   
                      
                    

                                          
                         
                        
                          
                      
                     
 

export class CompanionService {
           store                ;
           gcloud              ;
           updater               ;
                   fetchFn           ;
                   nowFn            ;
          demoActiveProject                = null;

  constructor(options                          = {}) {
    this.store = options.store ?? new CompanionStore();
    this.gcloud = options.gcloud ?? new GcloudClient({ fetchFn: options.fetchFn });
    this.fetchFn = options.fetchFn ?? globalThis.fetch;
    this.nowFn = options.nowFn ?? (() => new Date());
    this.updater =
      options.updater ??
      new PluginUpdater({
        fetchFn: this.fetchFn,
        nowFn: this.nowFn,
      });
  }

  async getOverview(options                             = {})                                     {
    const prefs = this.store.loadPreferences();
    const now = this.nowFn();
    const autoUpdate = prefs.autoUpdatePlugin !== false;

    if (this.fetchFn === globalThis.fetch && this.updater.isCheckStale()) {
      void this.updater.checkForUpdates({ force: false, autoUpdate }).catch(() => {});
    }

    if (prefs.demoMode) {
      return {
        ...buildDemoOverview(prefs, now, this.demoActiveProject),
        pluginUpdate: this.updater.getStatus(autoUpdate),
      };
    }

    const auth = await this.gcloud.getAuthStatus(
      prefs.gcloudPathOverride,
      Boolean(options.forceRefresh)
    );
    if (!auth.authenticated || !auth.activeAccount) {
      return this.buildUnauthenticatedOverview(auth, prefs, now);
    }

    const activeAccount = auth.activeAccount;
    const cached = this.store.loadSnapshot(activeAccount);
    const configuredTables = Array.from(
      new Set(Object.values(prefs.billingExportTables).map((m) => m.tableId))
    ).sort();

    if (cached && !options.forceRefresh) {
      const ageMs = Math.max(0, now.getTime() - new Date(cached.fetchedAt).getTime());
      const cachedTables = [...(cached.spendReport?.queriedTables ?? [])].sort();
      const tablesMatch =
        configuredTables.length === cachedTables.length &&
        configuredTables.every((t, i) => t === cachedTables[i]);

      if (ageMs <= prefs.cacheTtlMs && tablesMatch) {
        return this.assembleOverviewResponse(auth, prefs, cached, {
          hit: true,
          stale: false,
          ageMs,
        });
      }
    }

    // Perform live fetch from GCP REST APIs + BigQuery (if configured)
    try {
      const token = await this.gcloud.getAccessToken(prefs.gcloudPathOverride, activeAccount);
      const rawProjects = await fetchAllProjects(token, this.fetchFn);
      const activeProjectExists =
        !auth.activeProject ||
        rawProjects.length === 0 ||
        rawProjects.some((p) => p.projectId === auth.activeProject);
      const staleProjectWarnings =
        auth.activeProject && !activeProjectExists
          ? [
              `Active gcloud project "${auth.activeProject}" is deleted or inaccessible. Consider switching to an active project.`,
            ]
          : [];
      const quotaProject =
        prefs.quotaProjectOverride || (activeProjectExists ? auth.activeProject : null) || null;

      const {
        billingAccounts: rawBillingAccounts,
        warnings,
        usedQuotaProject,
      } = await fetchBillingAccountsAndProjectLinks(
        token,
        rawProjects,
        quotaProject,
        this.fetchFn,
        prefs.lastWorkingQuotaProject
      );

      if (usedQuotaProject && usedQuotaProject !== prefs.lastWorkingQuotaProject) {
        this.store.updatePreferences((curr) => ({
          ...curr,
          lastWorkingQuotaProject: usedQuotaProject,
        }));
      }

      const { report: spendReport, warnings: spendWarnings } = await queryBillingExportSpend(
        token,
        prefs.billingExportTables,
        quotaProject,
        now,
        this.fetchFn
      );

      const combinedWarnings = [...staleProjectWarnings, ...warnings, ...spendWarnings];
      const saved = this.store.saveSnapshot(activeAccount, {
        fetchedAt: now.toISOString(),
        projects: rawProjects,
        billingAccounts: rawBillingAccounts,
        spendReport,
        warnings: combinedWarnings,
      });

      return this.assembleOverviewResponse(auth, prefs, saved, {
        hit: false,
        stale: false,
        ageMs: 0,
      });
    } catch (err) {
      const errMsg = sanitizeErrorMessage(err);
      const isAuthExpiredOrRevoked =
        /Unable to obtain Google Cloud access token|ADC token refresh failed|invalid_grant|HTTP 401\b/i.test(
          errMsg
        );
      if (isAuthExpiredOrRevoked) {
        this.gcloud.invalidateTokenCache();
        return this.buildUnauthenticatedOverview(
          {
            ...auth,
            authenticated: false,
            activeAccount: null,
            maskedActiveAccount: null,
            setupHint:
              "Your Google Cloud session has expired or been revoked. Please sign in again with `gcloud auth login`.",
          },
          prefs,
          now
        );
      }

      // Fail resiliently: if we have a previous snapshot on disk, return it marked stale with warning
      if (cached) {
        const ageMs = Math.max(0, now.getTime() - new Date(cached.fetchedAt).getTime());
        const fallbackSnapshot                      = {
          ...cached,
          warnings: [`Live refresh failed (${errMsg}); showing cached data.`, ...cached.warnings],
        };
        return this.assembleOverviewResponse(auth, prefs, fallbackSnapshot, {
          hit: true,
          stale: true,
          ageMs,
        });
      }
      throw new Error(`Failed to fetch Google Cloud data: ${errMsg}`);
    }
  }

          buildUnauthenticatedOverview(
    auth                                   ,
    prefs                      ,
    now      
  )                            {
    const emptySpend = createEmptySpendReport(now);
    return {
      auth,
      preferences: this.formatPublicPreferences(prefs),
      pluginUpdate: this.updater.getStatus(prefs.autoUpdatePlugin !== false),
      cache: {
        hit: false,
        stale: false,
        fetchedAt: null,
        ageMs: null,
        ttlMs: prefs.cacheTtlMs,
      },
      summary: {
        totalProjects: 0,
        billedProjects: 0,
        unbilledProjects: 0,
        pinnedProjectsCount: prefs.pinnedProjects.length,
        totalBillingAccounts: 0,
        openBillingAccounts: 0,
        spendConfigured: Object.keys(prefs.billingExportTables).length > 0,
      },
      projects: [],
      billingAccounts: [],
      spend: emptySpend,
      warnings: [],
    };
  }

          formatPublicPreferences(prefs                      ) {
    return {
      pinnedProjects: [...prefs.pinnedProjects],
      billingExportTables: { ...prefs.billingExportTables },
      cacheTtlHours: Math.round((prefs.cacheTtlMs / 3_600_000) * 100) / 100,
      maskEmails: prefs.maskEmails,
      gcloudPathOverride: prefs.gcloudPathOverride,
      quotaProjectOverride: prefs.quotaProjectOverride,
      demoMode: prefs.demoMode,
      locale: normalizeLocalePreference(prefs.locale),
      autoUpdatePlugin: prefs.autoUpdatePlugin !== false,
    };
  }

          assembleOverviewResponse(
    auth                                   ,
    prefs                      ,
    snapshot                     ,
    cacheMeta                                                 
  )                            {
    const pinnedSet = new Set(prefs.pinnedProjects);
    const baDisplayMap = new Map                ();
    for (const ba of snapshot.billingAccounts) {
      baDisplayMap.set(ba.id, ba.displayName);
    }

    const globalExport = prefs.billingExportTables["*"]?.tableId ?? null;
    const spend = snapshot.spendReport ?? createEmptySpendReport(this.nowFn());

    const billingAccounts                   = snapshot.billingAccounts.map((ba) => ({
      id: ba.id,
      resourceName: ba.resourceName,
      displayName: ba.displayName,
      open: ba.open,
      masterBillingAccount: ba.masterBillingAccount,
      currencyCode: ba.currencyCode,
      linkedProjectCount: ba.linkedProjectIds.length,
      linkedProjectIds: [...ba.linkedProjectIds],
      budgets: ba.budgets ?? [],
      exportTableId: prefs.billingExportTables[ba.id]?.tableId ?? globalExport,
    }));

    // Sort: OPEN accounts first -> Linked project count desc -> Spend desc -> Alphabetical
    billingAccounts.sort((a, b) => {
      if (a.open !== b.open) return a.open ? -1 : 1;
      if (a.linkedProjectCount !== b.linkedProjectCount) {
        return b.linkedProjectCount - a.linkedProjectCount;
      }
      const spendA = spend.byBillingAccount[a.id]?.currentMonthNetCost ?? -1;
      const spendB = spend.byBillingAccount[b.id]?.currentMonthNetCost ?? -1;
      if (spendA !== spendB) return spendB - spendA;
      return a.displayName.localeCompare(b.displayName);
    });

    const projects               = snapshot.projects.map((p) => ({
      projectId: p.projectId,
      projectNumber: p.projectNumber,
      name: p.name,
      lifecycleState: p.lifecycleState,
      createTime: p.createTime,
      labels: p.labels,
      billingAccountId: p.billingAccountId,
      billingAccountName: p.billingAccountId ? (baDisplayMap.get(p.billingAccountId) ?? p.billingAccountId) : null,
      billingEnabled: p.billingEnabled,
      pinned: pinnedSet.has(p.projectId),
      isActiveProject: auth.activeProject === p.projectId,
    }));

    // Sort: Active first -> Pinned -> Higher spend -> Alphabetical
    projects.sort((a, b) => {
      if (a.isActiveProject !== b.isActiveProject) return a.isActiveProject ? -1 : 1;
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const spendA = spend.byProject[a.projectId]?.currentMonthNetCost ?? -1;
      const spendB = spend.byProject[b.projectId]?.currentMonthNetCost ?? -1;
      if (spendA !== spendB) return spendB - spendA;
      return a.projectId.localeCompare(b.projectId);
    });

    return {
      auth,
      preferences: this.formatPublicPreferences(prefs),
      pluginUpdate: this.updater.getStatus(prefs.autoUpdatePlugin !== false),
      cache: {
        hit: cacheMeta.hit,
        stale: cacheMeta.stale,
        fetchedAt: snapshot.fetchedAt,
        ageMs: cacheMeta.ageMs,
        ttlMs: prefs.cacheTtlMs,
      },
      summary: {
        totalProjects: projects.length,
        billedProjects: projects.filter((p) => p.billingEnabled).length,
        unbilledProjects: projects.filter((p) => !p.billingEnabled).length,
        pinnedProjectsCount: projects.filter((p) => p.pinned).length,
        totalBillingAccounts: billingAccounts.length,
        openBillingAccounts: billingAccounts.filter((b) => b.open).length,
        spendConfigured: spend.configured,
      },
      projects,
      billingAccounts,
      spend,
      warnings: snapshot.warnings ?? [],
    };
  }

  async setActiveProject(projectId        )                                     {
    const validId = validateProjectId(projectId);
    const prefs = this.store.loadPreferences();
    if (prefs.demoMode) {
      this.demoActiveProject = validId;
    } else {
      await this.gcloud.setActiveProject(validId, prefs.gcloudPathOverride);
      // If previous snapshot had 0 billing accounts due to a quota/API warning on the old project, invalidate cache so the new project is queried cleanly
      const auth = await this.gcloud.getAuthStatus(prefs.gcloudPathOverride);
      if (auth.activeAccount) {
        const prev = this.store.loadSnapshot(auth.activeAccount);
        if (prev && prev.billingAccounts.length === 0 && prev.warnings.length > 0) {
          this.store.clearSnapshot(auth.activeAccount);
        }
      }
    }
    return { activeProject: validId };
  }

  async setActiveAccount(account        )                                     {
    const validAccount = validateAccountEmail(account);
    const prefs = this.store.loadPreferences();
    if (!prefs.demoMode) {
      await this.gcloud.setActiveAccount(validAccount, prefs.gcloudPathOverride);
    }
    return { activeAccount: validAccount };
  }

  setPinnedProject(projectId        , pinned         )                       {
    const validId = validateProjectId(projectId);
    return this.store.updatePreferences((curr) => {
      const next = new Set(curr.pinnedProjects);
      if (pinned) {
        next.add(validId);
      } else {
        next.delete(validId);
      }
      return {
        ...curr,
        pinnedProjects: Array.from(next),
      };
    });
  }

  updateSettings(input   
                         
                           
                                       
                                         
                       
                              
                               
   )                       {
    let validQuotaProj                            = undefined;
    if (input.quotaProjectOverride !== undefined) {
      validQuotaProj =
        input.quotaProjectOverride && input.quotaProjectOverride.trim()
          ? validateProjectId(input.quotaProjectOverride)
          : null;
    }

    if (
      input.gcloudPathOverride !== undefined &&
      input.gcloudPathOverride &&
      input.gcloudPathOverride.trim().startsWith("-")
    ) {
      throw new Error("Invalid gcloud binary path override.");
    }

    if (input.locale !== undefined && !VALID_LOCALE_PREFERENCES.has(input.locale)) {
      throw new Error("Unsupported locale preference.");
    }

    return this.store.updatePreferences((curr) => ({
      ...curr,
      maskEmails: input.maskEmails !== undefined ? Boolean(input.maskEmails) : curr.maskEmails,
      cacheTtlMs:
        typeof input.cacheTtlHours === "number" && Number.isFinite(input.cacheTtlHours)
          ? Math.round(input.cacheTtlHours * 3_600_000)
          : curr.cacheTtlMs,
      gcloudPathOverride:
        input.gcloudPathOverride !== undefined
          ? input.gcloudPathOverride?.trim() || null
          : curr.gcloudPathOverride,
      quotaProjectOverride:
        validQuotaProj !== undefined ? validQuotaProj : curr.quotaProjectOverride,
      demoMode: input.demoMode !== undefined ? Boolean(input.demoMode) : curr.demoMode,
      locale: input.locale !== undefined ? input.locale : normalizeLocalePreference(curr.locale),
      autoUpdatePlugin:
        input.autoUpdatePlugin !== undefined
          ? Boolean(input.autoUpdatePlugin)
          : curr.autoUpdatePlugin !== false,
    }));
  }

  async discoverExportTables(hostProjectId        )                                    {
    const validHost = validateProjectId(hostProjectId);
    const prefs = this.store.loadPreferences();

    if (prefs.demoMode) {
      return [
        {
          tableId: `${validHost}.billing_export.gcp_billing_export_v1_01A8F2_94C110_77EB31`,
          hostProjectId: validHost,
          datasetId: "billing_export",
          tableName: "gcp_billing_export_v1_01A8F2_94C110_77EB31",
          inferredBillingAccountId: "01A8F2-94C110-77EB31",
          exportType: "standard",
        },
        {
          tableId: `${validHost}.billing_export.gcp_billing_export_v1_01F4D9_22B801_55CA09`,
          hostProjectId: validHost,
          datasetId: "billing_export",
          tableName: "gcp_billing_export_v1_01F4D9_22B801_55CA09",
          inferredBillingAccountId: "01F4D9-22B801-55CA09",
          exportType: "standard",
        },
      ];
    }

    const auth = await this.gcloud.getAuthStatus(prefs.gcloudPathOverride);
    if (!auth.authenticated || !auth.activeAccount) {
      throw new Error("Not authenticated with gcloud. Run `gcloud auth login` first.");
    }
    const token = await this.gcloud.getAccessToken(prefs.gcloudPathOverride, auth.activeAccount);
    const quotaProject = prefs.quotaProjectOverride || validHost;
    return discoverBillingExportTables(token, validHost, quotaProject, this.fetchFn);
  }

  async configureExportTable(params   
                             
                     
                           
                     
   )                                     {
    const key = normalizeBillingAccountId(params.billingAccountId);

    if (params.remove) {
      this.store.updatePreferences((curr) => {
        const nextTables = { ...curr.billingExportTables };
        delete nextTables[key];
        return { ...curr, billingExportTables: nextTables };
      });
      return this.getOverview({ forceRefresh: true });
    }

    if (!params.tableId) {
      throw new Error("tableId is required when configuring BigQuery Billing Export.");
    }
    const parsed = validateBigQueryTableId(params.tableId);
    const hostProject = params.hostProjectId
      ? validateProjectId(params.hostProjectId)
      : parsed.projectId;
    const inferred = inferBillingAccountFromTableName(parsed.tableName);

    const mapping                       = {
      billingAccountId: key,
      tableId: parsed.fullTableId,
      hostProjectId: hostProject,
      exportType: inferred?.exportType ?? "custom",
      addedAt: this.nowFn().toISOString(),
    };

    this.store.updatePreferences((curr) => ({
      ...curr,
      billingExportTables: {
        ...curr.billingExportTables,
        [key]: mapping,
      },
    }));

    return this.getOverview({ forceRefresh: true });
  }

  async getProjectCostBreakdown(
    projectId        ,
    forceRefresh = false
  )           
                               
                                      
                                         
                             
     {
    const validId = validateProjectId(projectId);
    const overview = await this.getOverview({ forceRefresh });
    const project = overview.projects.find((p) => p.projectId === validId) ?? null;
    const spend = overview.spend.byProject[validId] ?? null;
    const encoded = encodeURIComponent(validId);

    const consoleLinks                         = {
      dashboard: `https://console.cloud.google.com/home/dashboard?project=${encoded}`,
      billing: project?.billingAccountId
        ? `https://console.cloud.google.com/billing/${encodeURIComponent(project.billingAccountId)}/reports;projects=${encoded}`
        : `https://console.cloud.google.com/billing?project=${encoded}`,
      cloudRun: `https://console.cloud.google.com/run?project=${encoded}`,
      bigquery: `https://console.cloud.google.com/bigquery?project=${encoded}`,
      logs: `https://console.cloud.google.com/logs/query?project=${encoded}`,
    };

    return {
      project,
      spend,
      consoleLinks,
      spendConfigured: overview.spend.configured,
    };
  }

  async enableServiceApi(
    projectId        ,
    serviceName        
  )                                     {
    const validProj = validateProjectId(projectId);
    const cleanSvc = serviceName.trim().toLowerCase();
    if (
      cleanSvc !== "cloudbilling.googleapis.com" &&
      cleanSvc !== "billingbudgets.googleapis.com" &&
      cleanSvc !== "bigquery.googleapis.com"
    ) {
      throw new Error(`Service "${cleanSvc}" is not in the Companion enablement allowlist.`);
    }
    const prefs = this.store.loadPreferences();
    if (prefs.demoMode) {
      return this.getOverview({ forceRefresh: false });
    }

    await this.gcloud.enableProjectService(validProj, cleanSvc, prefs.gcloudPathOverride);

    // Record the newly API-enabled project as `lastWorkingQuotaProject` without mutating user-facing `quotaProjectOverride`
    const auth = await this.gcloud.getAuthStatus(prefs.gcloudPathOverride);
    this.store.updatePreferences((curr) => ({
      ...curr,
      lastWorkingQuotaProject: validProj,
    }));
    if (auth.activeAccount) {
      this.store.clearSnapshot(auth.activeAccount);
    }

    // Brief propagation pause on real network calls so GCP Service Usage takes effect before re-querying
    if (this.fetchFn === globalThis.fetch) {
      await new Promise((r) => setTimeout(r, 2_500));
    }

    return this.getOverview({ forceRefresh: true });
  }

  async startInteractiveLogin()                                     {
    const prefs = this.store.loadPreferences();
    if (prefs.demoMode) {
      this.store.updatePreferences((curr) => ({ ...curr, demoMode: false }));
    }
    const newAuth = await this.gcloud.triggerInteractiveLogin(prefs.gcloudPathOverride);
    if (newAuth.activeAccount) {
      this.store.clearSnapshot(newAuth.activeAccount);
    }
    return this.getOverview({ forceRefresh: true });
  }

  async checkPluginUpdate(force = true)                                     {
    const prefs = this.store.loadPreferences();
    await this.updater.checkForUpdates({
      force,
      autoUpdate: prefs.autoUpdatePlugin !== false,
    });
    return this.getOverview({ forceRefresh: false });
  }

  async applyPluginUpdate()                                     {
    const prefs = this.store.loadPreferences();
    await this.updater.applyUpdate(prefs.autoUpdatePlugin !== false, false);
    return this.getOverview({ forceRefresh: false });
  }
}
