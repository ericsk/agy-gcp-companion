import {
  createEmptySpendReport,
  discoverBillingExportTables,
  inferBillingAccountFromTableName,
  queryBillingExportSpend,
} from "./bigquery-billing.mjs";
import { buildDemoOverview } from "./demo-data.mjs";
import {
  GcpHttpError,
                         
                     
  deleteGcpProject,
  fetchAllProjects,
  fetchBillingAccountMetadata,
  fetchBillingAccountsAndProjectLinks,
  fetchBillingAccountsCore,
  fetchBudgetsForBillingAccounts,
  isQuotaOrApiDisabledMessage,
  updateProjectBillingInfo,
} from "./gcp-api.mjs";
import { GcloudClient,                } from "./gcloud.mjs";
import {
  normalizeBillingAccountId,
  sanitizeErrorMessage,
  validateAccountEmail,
  validateBigQueryTableId,
  validateBillingAccountId,
  validateProjectId,
} from "./security.mjs";
import { CompanionStore, VALID_LOCALE_PREFERENCES, normalizeLocalePreference } from "./store.mjs";
import { PluginUpdater } from "./updater.mjs";
             
             
                 
                       
             
                      
                           
                             
                           
                            
                       
                            
                         
                         
             
                   
                              
                         
                             
                      
                      
                    

                                          
                         
                        
                          
                      
                     
 

                               
                              
                            
 

function createSingleFlightSlot   ()                      {
  return { unforced: null, forced: null };
}

function clearSingleFlightSlot   (slot                     )       {
  slot.unforced = null;
  slot.forced = null;
}

function runSingleFlight   (
  slot                     ,
  forced         ,
  worker                                       
)             {
  if (forced) {
    if (slot.forced) {
      return slot.forced;
    }
    const pending = worker(true).finally(() => {
      if (slot.forced === pending) {
        slot.forced = null;
      }
    });
    slot.forced = pending;
    return pending;
  }

  // Unforced callers can safely share an already-running forced refresh,
  // while forced callers never reuse an unforced promise.
  if (slot.forced) {
    return slot.forced;
  }
  if (slot.unforced) {
    return slot.unforced;
  }
  const pending = worker(false).finally(() => {
    if (slot.unforced === pending) {
      slot.unforced = null;
    }
  });
  slot.unforced = pending;
  return pending;
}

export class CompanionService {
           store                ;
           gcloud              ;
           updater               ;
                   fetchFn           ;
                   nowFn            ;
          demoActiveProject                = null;
          demoProjectBillingOverrides                         = {};
          demoDeletedProjects = new Set        ();
                   overviewSlot = createSingleFlightSlot                           ();
                   rawProjectsSlot = createSingleFlightSlot                 ();
                   projectsSlot = createSingleFlightSlot                           ();
                   billingSlot = createSingleFlightSlot                          ();
                   budgetsSlot = createSingleFlightSlot                          ();
                   spendSlot = createSingleFlightSlot                        ();

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

          invalidateOverviewOnly()       {
    clearSingleFlightSlot(this.overviewSlot);
  }

          invalidateInFlightOverview()       {
    clearSingleFlightSlot(this.overviewSlot);
    clearSingleFlightSlot(this.rawProjectsSlot);
    clearSingleFlightSlot(this.projectsSlot);
    clearSingleFlightSlot(this.billingSlot);
    clearSingleFlightSlot(this.budgetsSlot);
    clearSingleFlightSlot(this.spendSlot);
  }

          hasActiveDomainFetches()          {
    return Boolean(
      this.projectsSlot.unforced ||
        this.projectsSlot.forced ||
        this.billingSlot.unforced ||
        this.billingSlot.forced ||
        this.budgetsSlot.unforced ||
        this.budgetsSlot.forced ||
        this.spendSlot.unforced ||
        this.spendSlot.forced
    );
  }

          isSnapshotComplete(snapshot                     )          {
    if (!snapshot.sectionsFetchedAt) {
      return true;
    }
    return Boolean(
      snapshot.sectionsFetchedAt.projects &&
        snapshot.sectionsFetchedAt.billing &&
        snapshot.sectionsFetchedAt.spend
    );
  }

          getSectionTimestamp(
    snapshot                     ,
    section                                              
  )                {
    if (!snapshot.sectionsFetchedAt) {
      return snapshot.fetchedAt;
    }
    return snapshot.sectionsFetchedAt[section] ?? null;
  }

          doSpendTablesMatch(
    snapshot                     ,
    prefs                      
  )          {
    const configuredTables = Array.from(
      new Set(Object.values(prefs.billingExportTables).map((m) => m.tableId))
    ).sort();
    const cachedTables = [...(snapshot.spendReport?.queriedTables ?? [])].sort();
    return (
      configuredTables.length === cachedTables.length &&
      configuredTables.every((t, i) => t === cachedTables[i])
    );
  }

          isSectionFresh(
    snapshot                     ,
    section                                              ,
    prefs                      ,
    now      
  )          {
    const ts = this.getSectionTimestamp(snapshot, section);
    if (!ts) return false;
    const ageMs = Math.max(0, now.getTime() - new Date(ts).getTime());
    if (ageMs > prefs.cacheTtlMs) return false;
    if (section === "spend" && !this.doSpendTablesMatch(snapshot, prefs)) {
      return false;
    }
    return true;
  }

          getClosedBillingAccountMap(
    snapshot                                        
  )                         {
    const map                         = {};
    if (!snapshot) return map;
    if (snapshot.closedBillingAccounts) {
      for (const [id, displayName] of Object.entries(snapshot.closedBillingAccounts)) {
        map[id] = displayName || id;
      }
    }
    for (const ba of snapshot.billingAccounts) {
      if (!ba.open) {
        map[ba.id] = ba.displayName || ba.id;
      }
    }
    return map;
  }

          extractBillingLinksFromSnapshot(
    snapshot                     
  )                                         {
    const closedMap = this.getClosedBillingAccountMap(snapshot);
    const links                                         = {};
    if (snapshot.projectBillingLinks) {
      for (const [pid, info] of Object.entries(snapshot.projectBillingLinks)) {
        if (closedMap[info.billingAccountId]) continue;
        links[pid] = { ...info };
      }
      return links;
    }
    for (const p of snapshot.projects) {
      if (p.billingAccountId && !closedMap[p.billingAccountId]) {
        links[p.projectId] = {
          billingAccountId: p.billingAccountId,
          billingEnabled: p.billingEnabled,
        };
      }
    }
    for (const ba of snapshot.billingAccounts) {
      if (!ba.open) continue;
      for (const pid of ba.linkedProjectIds) {
        links[pid] = {
          billingAccountId: ba.id,
          billingEnabled: true,
        };
      }
    }
    return links;
  }

          applyBillingLinksToRawProjects(
    rawProjects                 ,
    links                                        ,
    closedBaMap                         = {}
  )                  {
    return rawProjects.map((p) => {
      const link = links[p.projectId];
      const fallbackId =
        p.billingAccountId && !closedBaMap[p.billingAccountId] ? p.billingAccountId : null;
      const fallbackEnabled = fallbackId ? p.billingEnabled : false;
      if (link && !closedBaMap[link.billingAccountId]) {
        return {
          ...p,
          billingAccountId: link.billingAccountId,
          billingEnabled: link.billingEnabled,
        };
      }
      return {
        ...p,
        billingAccountId: fallbackId,
        billingEnabled: fallbackEnabled,
      };
    });
  }

          updateSnapshotSection(
    activeAccount        ,
    nowIso        ,
    mutator           
                                
                                           
                                                    
                                                      
                                                                               
                                                                  
                                                                           
              
  )                      {
    const prev = this.store.loadSnapshot(activeAccount);
    const sectionsFetchedAt                                                        = prev
      ? prev.sectionsFetchedAt
        ? { ...prev.sectionsFetchedAt }
        : {
            projects: prev.fetchedAt,
            billing: prev.fetchedAt,
            budgets: prev.fetchedAt,
            spend: prev.fetchedAt,
          }
      : {};

    const sectionWarnings                                                      = prev
      ? prev.sectionWarnings
        ? { ...prev.sectionWarnings }
        : { billing: [...prev.warnings] }
      : {};

    const draft = {
      projects: prev
        ? prev.projects
            .filter((p) => (p.lifecycleState || "ACTIVE").toUpperCase() === "ACTIVE")
            .map((p) => ({ ...p }))
        : [],
      billingAccounts: prev
        ? prev.billingAccounts
            .filter((ba) => ba.open)
            .map((ba) => ({
              ...ba,
              linkedProjectIds: [...ba.linkedProjectIds],
              budgets: [...(ba.budgets ?? [])],
            }))
        : [],
      closedBillingAccounts: this.getClosedBillingAccountMap(prev),
      spendReport: prev?.spendReport ?? null,
      sectionsFetchedAt,
      projectBillingLinks: prev ? this.extractBillingLinksFromSnapshot(prev) : {},
      sectionWarnings,
    };

    mutator(draft);

    draft.projects = this.applyBillingLinksToRawProjects(
      draft.projects.filter((p) => (p.lifecycleState || "ACTIVE").toUpperCase() === "ACTIVE"),
      draft.projectBillingLinks,
      draft.closedBillingAccounts
    );
    draft.billingAccounts = draft.billingAccounts.filter((ba) => ba.open);

    const combinedWarnings = [
      ...(draft.sectionWarnings.projects ?? []),
      ...(draft.sectionWarnings.billing ?? []),
      ...(draft.sectionWarnings.budgets ?? []),
      ...(draft.sectionWarnings.spend ?? []),
    ];

    const coreTimestamps = [
      draft.sectionsFetchedAt.projects,
      draft.sectionsFetchedAt.billing,
      draft.sectionsFetchedAt.spend,
    ];
    const allCoreReady = coreTimestamps.every((t)              => Boolean(t));
    const effectiveFetchedAt = allCoreReady
      ? coreTimestamps.reduce((oldest, curr) =>
          new Date(curr).getTime() < new Date(oldest).getTime() ? curr : oldest
        )
      : (prev?.fetchedAt ?? nowIso);

    return this.store.saveSnapshot(activeAccount, {
      fetchedAt: effectiveFetchedAt,
      projects: draft.projects,
      billingAccounts: draft.billingAccounts,
      closedBillingAccounts: draft.closedBillingAccounts,
      spendReport: draft.spendReport,
      warnings: combinedWarnings,
      sectionsFetchedAt: draft.sectionsFetchedAt,
      projectBillingLinks: draft.projectBillingLinks,
      sectionWarnings: draft.sectionWarnings,
    });
  }

          isAuthExpiredError(errMsg        )          {
    return /Unable to obtain Google Cloud access token|ADC token refresh failed|invalid_grant|HTTP 401\b/i.test(
      errMsg
    );
  }

          buildExpiredAuthStatus(auth            )             {
    return {
      ...auth,
      authenticated: false,
      activeAccount: null,
      maskedActiveAccount: null,
      setupHint:
        "Your Google Cloud session has expired or been revoked. Please sign in again with `gcloud auth login`.",
    };
  }

          maybeTriggerBackgroundUpdateCheck(prefs                      )       {
    const autoUpdate = prefs.autoUpdatePlugin !== false;
    if (this.fetchFn === globalThis.fetch && this.updater.isCheckStale()) {
      void this.updater.checkForUpdates({ force: false, autoUpdate }).catch(() => {});
    }
  }

          getRawProjectsShared(
    auth            ,
    prefs                      ,
    forced         
  )                           {
    return runSingleFlight(this.rawProjectsSlot, forced, async () => {
      if (!auth.activeAccount) return [];
      const token = await this.gcloud.getAccessToken(prefs.gcloudPathOverride, auth.activeAccount);
      return fetchAllProjects(token, this.fetchFn);
    });
  }

  async getBootstrap(options                             = {})                                      {
    const prefs = this.store.loadPreferences();
    const now = this.nowFn();
    const autoUpdate = prefs.autoUpdatePlugin !== false;
    this.maybeTriggerBackgroundUpdateCheck(prefs);

    if (prefs.demoMode) {
      const demo = buildDemoOverview(
        prefs,
        now,
        this.demoActiveProject,
        this.demoProjectBillingOverrides,
        this.demoDeletedProjects
      );
      return {
        auth: demo.auth,
        preferences: demo.preferences,
        pluginUpdate: this.updater.getStatus(autoUpdate),
        spendConfigured: true,
        cachedOverview: null,
      };
    }

    const auth = await this.gcloud.getAuthStatus(
      prefs.gcloudPathOverride,
      Boolean(options.forceRefresh)
    );
    const spendConfigured = Object.keys(prefs.billingExportTables).length > 0;
    let cachedOverview                                   = null;

    if (!options.forceRefresh && auth.authenticated && auth.activeAccount) {
      const cached = this.store.loadSnapshot(auth.activeAccount);
      if (cached && this.isSnapshotComplete(cached)) {
        const ageMs = Math.max(0, now.getTime() - new Date(cached.fetchedAt).getTime());
        const isExpired = ageMs > prefs.cacheTtlMs || !this.doSpendTablesMatch(cached, prefs);
        if (isExpired) {
          cachedOverview = this.assembleOverviewResponse(auth, prefs, cached, {
            hit: true,
            stale: true,
            ageMs,
          });
        }
      }
    }

    return {
      auth,
      preferences: this.formatPublicPreferences(prefs),
      pluginUpdate: this.updater.getStatus(autoUpdate),
      spendConfigured,
      cachedOverview,
    };
  }

  getProjectsSection(options                             = {})                                     {
    const forced = Boolean(options.forceRefresh);
    return runSingleFlight(this.projectsSlot, forced, async (forceRefresh) => {
      const prefs = this.store.loadPreferences();
      const now = this.nowFn();

      if (prefs.demoMode) {
        const demo = buildDemoOverview(
          prefs,
          now,
          this.demoActiveProject,
          this.demoProjectBillingOverrides,
          this.demoDeletedProjects
        );
        return {
          authenticated: true,
          projects: demo.projects,
          cache: demo.cache,
          warnings: demo.warnings,
        };
      }

      const auth = await this.gcloud.getAuthStatus(prefs.gcloudPathOverride, forceRefresh);
      if (!auth.authenticated || !auth.activeAccount) {
        return {
          authenticated: false,
          auth,
          projects: [],
          cache: {
            hit: false,
            stale: false,
            fetchedAt: null,
            ageMs: null,
            ttlMs: prefs.cacheTtlMs,
          },
          warnings: [],
        };
      }

      const activeAccount = auth.activeAccount;
      const cached = this.store.loadSnapshot(activeAccount);
      if (!forceRefresh && cached && this.isSectionFresh(cached, "projects", prefs, now)) {
        const ts = this.getSectionTimestamp(cached, "projects") ?? cached.fetchedAt;
        const ageMs = Math.max(0, now.getTime() - new Date(ts).getTime());
        const assembled = this.assembleOverviewResponse(auth, prefs, cached, {
          hit: true,
          stale: false,
          ageMs,
        });
        return {
          authenticated: true,
          projects: assembled.projects,
          cache: assembled.cache,
          warnings: cached.sectionWarnings?.projects ?? [],
        };
      }

      try {
        const rawProjects = await this.getRawProjectsShared(auth, prefs, forceRefresh);
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

        const nowIso = now.toISOString();
        const updatedSnapshot = this.updateSnapshotSection(activeAccount, nowIso, (draft) => {
          draft.projects = rawProjects;
          draft.sectionsFetchedAt.projects = nowIso;
          draft.sectionWarnings.projects = staleProjectWarnings;
        });

        const assembled = this.assembleOverviewResponse(auth, prefs, updatedSnapshot, {
          hit: false,
          stale: false,
          ageMs: 0,
        });
        return {
          authenticated: true,
          projects: assembled.projects,
          cache: {
            hit: false,
            stale: false,
            fetchedAt: nowIso,
            ageMs: 0,
            ttlMs: prefs.cacheTtlMs,
          },
          warnings: staleProjectWarnings,
        };
      } catch (err) {
        const errMsg = sanitizeErrorMessage(err);
        if (this.isAuthExpiredError(errMsg)) {
          this.gcloud.invalidateTokenCache();
          return {
            authenticated: false,
            authExpired: true,
            auth: this.buildExpiredAuthStatus(auth),
            projects: [],
            cache: {
              hit: false,
              stale: false,
              fetchedAt: null,
              ageMs: null,
              ttlMs: prefs.cacheTtlMs,
            },
            warnings: [],
          };
        }
        if (cached && this.getSectionTimestamp(cached, "projects")) {
          const ts = this.getSectionTimestamp(cached, "projects") ;
          const ageMs = Math.max(0, now.getTime() - new Date(ts).getTime());
          const assembled = this.assembleOverviewResponse(auth, prefs, cached, {
            hit: true,
            stale: true,
            ageMs,
          });
          return {
            authenticated: true,
            projects: assembled.projects,
            cache: assembled.cache,
            warnings: [
              `Live projects refresh failed (${errMsg}); showing cached projects.`,
              ...(cached.sectionWarnings?.projects ?? []),
            ],
          };
        }
        throw new Error(`Failed to fetch Google Cloud projects: ${errMsg}`);
      }
    });
  }

  getBillingSection(options                             = {})                                    {
    const forced = Boolean(options.forceRefresh);
    return runSingleFlight(this.billingSlot, forced, async (forceRefresh) => {
      const prefs = this.store.loadPreferences();
      const now = this.nowFn();

      if (prefs.demoMode) {
        const demo = buildDemoOverview(
          prefs,
          now,
          this.demoActiveProject,
          this.demoProjectBillingOverrides,
          this.demoDeletedProjects
        );
        const demoLinks                                         = {};
        for (const p of demo.projects) {
          if (p.billingAccountId) {
            demoLinks[p.projectId] = {
              billingAccountId: p.billingAccountId,
              billingEnabled: p.billingEnabled,
            };
          }
        }
        return {
          authenticated: true,
          billingAccounts: demo.billingAccounts,
          projectBillingLinks: demoLinks,
          budgetsLoaded: true,
          cache: demo.cache,
          warnings: [],
        };
      }

      const auth = await this.gcloud.getAuthStatus(prefs.gcloudPathOverride, forceRefresh);
      if (!auth.authenticated || !auth.activeAccount) {
        return {
          authenticated: false,
          auth,
          billingAccounts: [],
          projectBillingLinks: {},
          budgetsLoaded: true,
          cache: {
            hit: false,
            stale: false,
            fetchedAt: null,
            ageMs: null,
            ttlMs: prefs.cacheTtlMs,
          },
          warnings: [],
        };
      }

      const activeAccount = auth.activeAccount;
      const cached = this.store.loadSnapshot(activeAccount);
      if (!forceRefresh && cached && this.isSectionFresh(cached, "billing", prefs, now)) {
        const ts = this.getSectionTimestamp(cached, "billing") ?? cached.fetchedAt;
        const ageMs = Math.max(0, now.getTime() - new Date(ts).getTime());
        const assembled = this.assembleOverviewResponse(auth, prefs, cached, {
          hit: true,
          stale: false,
          ageMs,
        });
        return {
          authenticated: true,
          billingAccounts: assembled.billingAccounts,
          projectBillingLinks: this.extractBillingLinksFromSnapshot(cached),
          budgetsLoaded: this.isSectionFresh(cached, "budgets", prefs, now),
          cache: assembled.cache,
          warnings: cached.sectionWarnings?.billing ?? cached.warnings,
        };
      }

      try {
        const token = await this.gcloud.getAccessToken(prefs.gcloudPathOverride, activeAccount);
        const quotaProject = prefs.quotaProjectOverride || auth.activeProject || null;

        const {
          billingAccounts: rawBillingAccounts,
          closedBillingAccounts,
          projectBillingLinks,
          warnings,
          usedQuotaProject,
        } = await fetchBillingAccountsCore(
          token,
          [],
          quotaProject,
          this.fetchFn,
          prefs.lastWorkingQuotaProject,
          () => this.getRawProjectsShared(auth, prefs, forceRefresh)
        );

        if (usedQuotaProject && usedQuotaProject !== prefs.lastWorkingQuotaProject) {
          this.store.updatePreferences((curr) => ({
            ...curr,
            lastWorkingQuotaProject: usedQuotaProject,
          }));
        }

        const reuseBudgets = Boolean(
          !forceRefresh && cached && this.isSectionFresh(cached, "budgets", prefs, now)
        );
        if (reuseBudgets && cached) {
          const prevBudgets = new Map                      ();
          for (const prevBa of cached.billingAccounts) {
            prevBudgets.set(prevBa.id, prevBa.budgets ?? []);
          }
          for (const acct of rawBillingAccounts) {
            acct.budgets = prevBudgets.get(acct.id) ?? [];
          }
        }

        const nowIso = now.toISOString();
        const updatedSnapshot = this.updateSnapshotSection(activeAccount, nowIso, (draft) => {
          draft.billingAccounts = rawBillingAccounts;
          draft.closedBillingAccounts = closedBillingAccounts;
          draft.projectBillingLinks = projectBillingLinks;
          draft.sectionsFetchedAt.billing = nowIso;
          if (!reuseBudgets) {
            delete draft.sectionsFetchedAt.budgets;
            delete draft.sectionWarnings.budgets;
          }
          draft.sectionWarnings.billing = warnings;
        });

        const assembled = this.assembleOverviewResponse(auth, prefs, updatedSnapshot, {
          hit: false,
          stale: false,
          ageMs: 0,
        });
        return {
          authenticated: true,
          billingAccounts: assembled.billingAccounts,
          projectBillingLinks,
          budgetsLoaded: reuseBudgets || rawBillingAccounts.length === 0,
          cache: {
            hit: false,
            stale: false,
            fetchedAt: nowIso,
            ageMs: 0,
            ttlMs: prefs.cacheTtlMs,
          },
          warnings,
        };
      } catch (err) {
        const errMsg = sanitizeErrorMessage(err);
        if (this.isAuthExpiredError(errMsg)) {
          this.gcloud.invalidateTokenCache();
          return {
            authenticated: false,
            authExpired: true,
            auth: this.buildExpiredAuthStatus(auth),
            billingAccounts: [],
            projectBillingLinks: {},
            budgetsLoaded: true,
            cache: {
              hit: false,
              stale: false,
              fetchedAt: null,
              ageMs: null,
              ttlMs: prefs.cacheTtlMs,
            },
            warnings: [],
          };
        }
        if (cached && this.getSectionTimestamp(cached, "billing")) {
          const ts = this.getSectionTimestamp(cached, "billing") ;
          const ageMs = Math.max(0, now.getTime() - new Date(ts).getTime());
          const assembled = this.assembleOverviewResponse(auth, prefs, cached, {
            hit: true,
            stale: true,
            ageMs,
          });
          return {
            authenticated: true,
            billingAccounts: assembled.billingAccounts,
            projectBillingLinks: this.extractBillingLinksFromSnapshot(cached),
            budgetsLoaded: true,
            cache: assembled.cache,
            warnings: [
              `Live billing refresh failed (${errMsg}); showing cached billing accounts.`,
              ...(cached.sectionWarnings?.billing ?? []),
            ],
          };
        }
        throw new Error(`Failed to fetch Cloud Billing accounts: ${errMsg}`);
      }
    });
  }

  getBudgetsSection(options                             = {})                                    {
    const forced = Boolean(options.forceRefresh);
    return runSingleFlight(this.budgetsSlot, forced, async (forceRefresh) => {
      const prefs = this.store.loadPreferences();
      const now = this.nowFn();

      if (prefs.demoMode) {
        const demo = buildDemoOverview(
          prefs,
          now,
          this.demoActiveProject,
          this.demoProjectBillingOverrides,
          this.demoDeletedProjects
        );
        const budgetsByAccount                               = {};
        for (const ba of demo.billingAccounts) {
          budgetsByAccount[ba.id] = ba.budgets;
        }
        return {
          authenticated: true,
          budgetsByAccount,
          warnings: [],
        };
      }

      const auth = await this.gcloud.getAuthStatus(prefs.gcloudPathOverride, false);
      if (!auth.authenticated || !auth.activeAccount) {
        return { authenticated: false, budgetsByAccount: {}, warnings: [] };
      }

      const activeAccount = auth.activeAccount;
      let cached = this.store.loadSnapshot(activeAccount);
      if (!forceRefresh && cached && this.isSectionFresh(cached, "budgets", prefs, now)) {
        const budgetsByAccount                               = {};
        for (const ba of cached.billingAccounts) {
          if (!ba.open) continue;
          budgetsByAccount[ba.id] = ba.budgets ?? [];
        }
        return {
          authenticated: true,
          budgetsByAccount,
          warnings: cached.sectionWarnings?.budgets ?? [],
        };
      }

      // Ensure billing accounts are loaded first
      if (!cached || !this.isSectionFresh(cached, "billing", prefs, now)) {
        await this.getBillingSection({ forceRefresh });
        cached = this.store.loadSnapshot(activeAccount);
      }

      const targetAccounts                      = (cached?.billingAccounts ?? [])
        .filter((ba) => ba.open)
        .map((ba) => ({
          ...ba,
          linkedProjectIds: [...ba.linkedProjectIds],
          budgets: [...(ba.budgets ?? [])],
        }));

      const nowIso = now.toISOString();
      if (targetAccounts.length === 0) {
        this.updateSnapshotSection(activeAccount, nowIso, (draft) => {
          draft.sectionsFetchedAt.budgets = nowIso;
          draft.sectionWarnings.budgets = [];
        });
        return { authenticated: true, budgetsByAccount: {}, warnings: [] };
      }

      const latestPrefs = this.store.loadPreferences();
      const token = await this.gcloud.getAccessToken(
        latestPrefs.gcloudPathOverride,
        activeAccount
      );
      const quotaProject =
        latestPrefs.quotaProjectOverride ||
        latestPrefs.lastWorkingQuotaProject ||
        auth.activeProject ||
        null;

      const { budgetsByAccount, warnings } = await fetchBudgetsForBillingAccounts(
        token,
        targetAccounts,
        quotaProject,
        this.fetchFn
      );

      this.updateSnapshotSection(activeAccount, nowIso, (draft) => {
        for (const ba of draft.billingAccounts) {
          if (budgetsByAccount[ba.id] !== undefined) {
            ba.budgets = budgetsByAccount[ba.id];
          }
        }
        draft.sectionsFetchedAt.budgets = nowIso;
        draft.sectionWarnings.budgets = warnings;
      });

      return {
        authenticated: true,
        budgetsByAccount,
        warnings,
      };
    });
  }

  getSpendSection(options                             = {})                                  {
    const forced = Boolean(options.forceRefresh);
    return runSingleFlight(this.spendSlot, forced, async (forceRefresh) => {
      const prefs = this.store.loadPreferences();
      const now = this.nowFn();

      if (prefs.demoMode) {
        const demo = buildDemoOverview(
          prefs,
          now,
          this.demoActiveProject,
          this.demoProjectBillingOverrides,
          this.demoDeletedProjects
        );
        return {
          authenticated: true,
          spend: demo.spend,
          cache: demo.cache,
          warnings: [],
        };
      }

      const auth = await this.gcloud.getAuthStatus(prefs.gcloudPathOverride, forceRefresh);
      if (!auth.authenticated || !auth.activeAccount) {
        return {
          authenticated: false,
          auth,
          spend: createEmptySpendReport(now),
          cache: {
            hit: false,
            stale: false,
            fetchedAt: null,
            ageMs: null,
            ttlMs: prefs.cacheTtlMs,
          },
          warnings: [],
        };
      }

      const activeAccount = auth.activeAccount;
      const nowIso = now.toISOString();

      // Fast path when no BigQuery Billing Export table is configured yet
      if (Object.keys(prefs.billingExportTables).length === 0) {
        const emptySpend = createEmptySpendReport(now);
        this.updateSnapshotSection(activeAccount, nowIso, (draft) => {
          draft.spendReport = emptySpend;
          draft.sectionsFetchedAt.spend = nowIso;
          draft.sectionWarnings.spend = [];
        });
        return {
          authenticated: true,
          spend: emptySpend,
          cache: {
            hit: false,
            stale: false,
            fetchedAt: nowIso,
            ageMs: 0,
            ttlMs: prefs.cacheTtlMs,
          },
          warnings: [],
        };
      }

      const cached = this.store.loadSnapshot(activeAccount);
      if (!forceRefresh && cached && this.isSectionFresh(cached, "spend", prefs, now)) {
        const ts = this.getSectionTimestamp(cached, "spend") ?? cached.fetchedAt;
        const ageMs = Math.max(0, now.getTime() - new Date(ts).getTime());
        return {
          authenticated: true,
          spend: cached.spendReport ?? createEmptySpendReport(now),
          cache: {
            hit: true,
            stale: false,
            fetchedAt: ts,
            ageMs,
            ttlMs: prefs.cacheTtlMs,
          },
          warnings: cached.sectionWarnings?.spend ?? [],
        };
      }

      try {
        const token = await this.gcloud.getAccessToken(prefs.gcloudPathOverride, activeAccount);
        const quotaProject =
          prefs.quotaProjectOverride ||
          auth.activeProject ||
          prefs.lastWorkingQuotaProject ||
          null;

        const { report: spendReport, warnings: spendWarnings } = await queryBillingExportSpend(
          token,
          prefs.billingExportTables,
          quotaProject,
          now,
          this.fetchFn,
          cached?.spendReport ?? null
        );

        this.updateSnapshotSection(activeAccount, nowIso, (draft) => {
          draft.spendReport = spendReport;
          draft.sectionsFetchedAt.spend = nowIso;
          draft.sectionWarnings.spend = spendWarnings;
        });

        return {
          authenticated: true,
          spend: spendReport,
          cache: {
            hit: false,
            stale: false,
            fetchedAt: nowIso,
            ageMs: 0,
            ttlMs: prefs.cacheTtlMs,
          },
          warnings: spendWarnings,
        };
      } catch (err) {
        const errMsg = sanitizeErrorMessage(err);
        if (this.isAuthExpiredError(errMsg)) {
          this.gcloud.invalidateTokenCache();
          return {
            authenticated: false,
            authExpired: true,
            auth: this.buildExpiredAuthStatus(auth),
            spend: createEmptySpendReport(now),
            cache: {
              hit: false,
              stale: false,
              fetchedAt: null,
              ageMs: null,
              ttlMs: prefs.cacheTtlMs,
            },
            warnings: [],
          };
        }
        if (cached?.spendReport && this.getSectionTimestamp(cached, "spend")) {
          const ts = this.getSectionTimestamp(cached, "spend") ;
          const ageMs = Math.max(0, now.getTime() - new Date(ts).getTime());
          return {
            authenticated: true,
            spend: cached.spendReport,
            cache: {
              hit: true,
              stale: true,
              fetchedAt: ts,
              ageMs,
              ttlMs: prefs.cacheTtlMs,
            },
            warnings: [
              `Live BigQuery spend refresh failed (${errMsg}); showing cached spend.`,
              ...(cached.sectionWarnings?.spend ?? []),
            ],
          };
        }
        throw new Error(`Failed to query BigQuery billing export: ${errMsg}`);
      }
    });
  }

  /**
   * Returns an immediate overview assembled from local disk cache (even if partial while progressive
   * background fetches are still running), avoiding blocking fast local mutations (like pinning a project
   * or switching display language) on upstream GCP / BigQuery calls.
   */
  async getFastOverviewAfterLocalMutation()                                     {
    const prefs = this.store.loadPreferences();
    const now = this.nowFn();
    const autoUpdate = prefs.autoUpdatePlugin !== false;

    if (prefs.demoMode) {
      return {
        ...buildDemoOverview(
          prefs,
          now,
          this.demoActiveProject,
          this.demoProjectBillingOverrides,
          this.demoDeletedProjects
        ),
        pluginUpdate: this.updater.getStatus(autoUpdate),
      };
    }

    const auth = await this.gcloud.getAuthStatus(prefs.gcloudPathOverride, false);
    if (!auth.authenticated || !auth.activeAccount) {
      return this.buildUnauthenticatedOverview(auth, prefs, now);
    }

    const cached = this.store.loadSnapshot(auth.activeAccount);
    if (cached) {
      const ageMs = Math.max(0, now.getTime() - new Date(cached.fetchedAt).getTime());
      return this.assembleOverviewResponse(auth, prefs, cached, {
        hit: true,
        stale: ageMs > prefs.cacheTtlMs,
        ageMs,
      });
    }

    if (this.hasActiveDomainFetches()) {
      return this.buildUnauthenticatedOverview(auth, prefs, now);
    }

    return this.getOverview({ forceRefresh: false });
  }

  getOverview(options                             = {})                                     {
    const forced = Boolean(options.forceRefresh);
    return runSingleFlight(this.overviewSlot, forced, (forceRefresh) =>
      this.loadOverviewInternal({ forceRefresh })
    );
  }

          async loadOverviewInternal(
    options                             = {}
  )                                     {
    const prefs = this.store.loadPreferences();
    const now = this.nowFn();
    const autoUpdate = prefs.autoUpdatePlugin !== false;

    if (this.fetchFn === globalThis.fetch && this.updater.isCheckStale()) {
      void this.updater.checkForUpdates({ force: false, autoUpdate }).catch(() => {});
    }

    if (prefs.demoMode) {
      return {
        ...buildDemoOverview(
          prefs,
          now,
          this.demoActiveProject,
          this.demoProjectBillingOverrides,
          this.demoDeletedProjects
        ),
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

    if (cached && !options.forceRefresh && this.isSnapshotComplete(cached)) {
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
        closedBillingAccounts,
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
        this.fetchFn,
        cached?.spendReport ?? null
      );

      const combinedWarnings = [...staleProjectWarnings, ...warnings, ...spendWarnings];
      const saved = this.store.saveSnapshot(activeAccount, {
        fetchedAt: now.toISOString(),
        projects: rawProjects,
        billingAccounts: rawBillingAccounts,
        closedBillingAccounts,
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
    const activeRawProjects = snapshot.projects.filter(
      (p) => (p.lifecycleState || "ACTIVE").toUpperCase() === "ACTIVE"
    );
    const activeProjectIdSet = new Set(activeRawProjects.map((p) => p.projectId));
    const hasProjectsContext =
      !snapshot.sectionsFetchedAt ||
      Boolean(snapshot.sectionsFetchedAt.projects) ||
      activeRawProjects.length > 0;

    const closedBaMap = this.getClosedBillingAccountMap(snapshot);
    const openRawBillingAccounts = snapshot.billingAccounts.filter((ba) => ba.open);
    const baDisplayMap = new Map                ();
    for (const ba of openRawBillingAccounts) {
      baDisplayMap.set(ba.id, ba.displayName);
    }

    const globalExport = prefs.billingExportTables["*"]?.tableId ?? null;
    const spend = snapshot.spendReport ?? createEmptySpendReport(this.nowFn());

    const billingAccounts                   = openRawBillingAccounts.map((ba) => {
      const linkedProjectIds = hasProjectsContext
        ? ba.linkedProjectIds.filter((pid) => activeProjectIdSet.has(pid))
        : [...ba.linkedProjectIds];
      return {
        id: ba.id,
        resourceName: ba.resourceName,
        displayName: ba.displayName,
        open: true,
        masterBillingAccount: ba.masterBillingAccount,
        currencyCode: ba.currencyCode,
        linkedProjectCount: linkedProjectIds.length,
        linkedProjectIds,
        budgets: ba.budgets ?? [],
        exportTableId: prefs.billingExportTables[ba.id]?.tableId ?? globalExport,
      };
    });

    // Sort: Linked project count desc -> Spend desc -> Alphabetical
    billingAccounts.sort((a, b) => {
      if (a.linkedProjectCount !== b.linkedProjectCount) {
        return b.linkedProjectCount - a.linkedProjectCount;
      }
      const spendA = spend.byBillingAccount[a.id]?.currentMonthNetCost ?? -1;
      const spendB = spend.byBillingAccount[b.id]?.currentMonthNetCost ?? -1;
      if (spendA !== spendB) return spendB - spendA;
      return a.displayName.localeCompare(b.displayName);
    });

    const projects               = activeRawProjects.map((p) => {
      const isClosedBa = Boolean(p.billingAccountId && closedBaMap[p.billingAccountId]);
      const effectiveBaId = isClosedBa ? null : p.billingAccountId;
      const effectiveBillingEnabled = isClosedBa ? false : p.billingEnabled;
      return {
        projectId: p.projectId,
        projectNumber: p.projectNumber,
        name: p.name,
        lifecycleState: p.lifecycleState || "ACTIVE",
        createTime: p.createTime,
        labels: p.labels,
        billingAccountId: effectiveBaId,
        billingAccountName: effectiveBaId ? (baDisplayMap.get(effectiveBaId) ?? effectiveBaId) : null,
        billingEnabled: effectiveBillingEnabled,
        pinned: pinnedSet.has(p.projectId),
        isActiveProject: auth.activeProject === p.projectId,
      };
    });

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
        openBillingAccounts: billingAccounts.length,
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
    let clearedBillingSnapshot = false;
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
          clearedBillingSnapshot = true;
        }
      }
    }
    if (clearedBillingSnapshot) {
      this.invalidateInFlightOverview();
    } else {
      this.invalidateOverviewOnly();
    }
    return { activeProject: validId };
  }

  async setActiveAccount(account        )                                     {
    const validAccount = validateAccountEmail(account);
    const prefs = this.store.loadPreferences();
    if (!prefs.demoMode) {
      await this.gcloud.setActiveAccount(validAccount, prefs.gcloudPathOverride);
    }
    this.invalidateInFlightOverview();
    return { activeAccount: validAccount };
  }

  async previewProjectBillingAccountChange(
    projectId        ,
    billingAccountId        
  )                                       {
    const validProjectId = validateProjectId(projectId);
    const validBillingAccountId = validateBillingAccountId(billingAccountId);
    const overview = await this.getOverview({ forceRefresh: false });

    if (!overview.auth.authenticated) {
      throw new Error("Not authenticated with gcloud. Run `gcloud auth login` first.");
    }

    const project = overview.projects.find((p) => p.projectId === validProjectId) ?? null;
    const targetBa =
      overview.billingAccounts.find((ba) => ba.id === validBillingAccountId) ?? null;

    const cachedSnapshot =
      !overview.preferences.demoMode && overview.auth.activeAccount
        ? this.store.loadSnapshot(overview.auth.activeAccount)
        : null;
    const closedBaName = this.getClosedBillingAccountMap(cachedSnapshot)[validBillingAccountId];
    if (closedBaName || (targetBa && !targetBa.open)) {
      const displayName = closedBaName || targetBa?.displayName || validBillingAccountId;
      throw new Error(
        `Billing account "${displayName}" (${validBillingAccountId}) is closed and cannot be linked to a project.`
      );
    }

    const currentId = project?.billingAccountId ?? null;
    const currentName = project?.billingAccountName ?? null;
    const currentEnabled = Boolean(project?.billingEnabled);
    const unchanged = currentId === validBillingAccountId && currentEnabled;

    const warnings           = [];
    if (!project) {
      warnings.push(
        `Project "${validProjectId}" was not found in the cached project list; verify the project ID before confirming.`
      );
    }
    if (!targetBa) {
      warnings.push(
        `Billing account ${validBillingAccountId} is not in the visible billing accounts list (possibly due to restricted billing.accounts.list IAM permissions). Verify the ID is open and accessible.`
      );
    }
    if (currentId && currentId !== validBillingAccountId) {
      warnings.push(
        "Historical BigQuery spend already recorded under the previous billing account will remain there; new usage will be billed to the target billing account."
      );
    }
    if (unchanged) {
      warnings.push(
        `Project "${validProjectId}" is already linked to billing account ${validBillingAccountId}.`
      );
    }

    return {
      status: "confirmation_required",
      projectId: validProjectId,
      projectName: project?.name ?? validProjectId,
      currentBillingAccount: {
        id: currentId,
        displayName: currentName,
        billingEnabled: currentEnabled,
      },
      targetBillingAccount: {
        id: validBillingAccountId,
        displayName: targetBa?.displayName ?? `Billing Account (${validBillingAccountId})`,
        open: targetBa ? targetBa.open : null,
        currencyCode: targetBa?.currencyCode,
        foundInCache: Boolean(targetBa),
      },
      unchanged,
      warnings,
      nextStep:
        "Confirm this project billing account change with the user (showing projectId, current billing account, and target billing account), then call `gcp_set_project_billing_account` again with `confirm: true`.",
    };
  }

  async setProjectBillingAccount(
    projectId        ,
    billingAccountId        
  )                                      {
    const validProjectId = validateProjectId(projectId);
    const validBillingAccountId = validateBillingAccountId(billingAccountId);
    const prefs = this.store.loadPreferences();
    const now = this.nowFn();

    if (prefs.demoMode) {
      const currentDemo = buildDemoOverview(
        prefs,
        now,
        this.demoActiveProject,
        this.demoProjectBillingOverrides,
        this.demoDeletedProjects
      );
      const proj = currentDemo.projects.find((p) => p.projectId === validProjectId);
      if (!proj) {
        throw new Error(`Demo project "${validProjectId}" was not found.`);
      }
      const existingTarget = currentDemo.billingAccounts.find(
        (ba) => ba.id === validBillingAccountId
      );
      if (existingTarget && !existingTarget.open) {
        throw new Error(
          `Billing account "${existingTarget.displayName}" (${validBillingAccountId}) is closed and cannot be linked to a project.`
        );
      }
      const prevId = proj.billingAccountId;
      const prevName = proj.billingAccountName;
      const unchanged = prevId === validBillingAccountId && proj.billingEnabled;
      this.demoProjectBillingOverrides[validProjectId] = validBillingAccountId;
      this.invalidateOverviewOnly();
      return {
        projectId: validProjectId,
        previousBillingAccountId: prevId,
        previousBillingAccountName: prevName,
        billingAccountId: validBillingAccountId,
        billingAccountName:
          existingTarget?.displayName ?? `Billing Account (${validBillingAccountId})`,
        billingEnabled: true,
        unchanged,
      };
    }

    const auth = await this.gcloud.getAuthStatus(prefs.gcloudPathOverride);
    if (!auth.authenticated || !auth.activeAccount) {
      throw new Error("Not authenticated with gcloud. Run `gcloud auth login` first.");
    }

    const activeAccount = auth.activeAccount;
    const prevSnapshot = this.store.loadSnapshot(activeAccount);
    const prevLinks = prevSnapshot ? this.extractBillingLinksFromSnapshot(prevSnapshot) : {};
    const prevProj = prevSnapshot?.projects.find((p) => p.projectId === validProjectId);
    const prevId = prevLinks[validProjectId]?.billingAccountId ?? prevProj?.billingAccountId ?? null;
    const prevEnabled =
      prevLinks[validProjectId]?.billingEnabled ?? prevProj?.billingEnabled ?? false;
    const prevBa = prevId
      ? prevSnapshot?.billingAccounts.find((ba) => ba.id === prevId) ?? null
      : null;
    const prevName = prevBa?.displayName ?? prevId;

    const existingTargetBa =
      prevSnapshot?.billingAccounts.find((ba) => ba.id === validBillingAccountId) ?? null;
    const closedBaName = this.getClosedBillingAccountMap(prevSnapshot)[validBillingAccountId];
    if (closedBaName || (existingTargetBa && !existingTargetBa.open)) {
      const displayName = closedBaName || existingTargetBa?.displayName || validBillingAccountId;
      throw new Error(
        `Billing account "${displayName}" (${validBillingAccountId}) is closed and cannot be linked to a project.`
      );
    }

    const token = await this.gcloud.getAccessToken(prefs.gcloudPathOverride, activeAccount);
    const quotaProject = prefs.quotaProjectOverride || auth.activeProject || null;

    let updated   
                        
                               
                              
                                      
     ;
    try {
      updated = await updateProjectBillingInfo(
        token,
        validProjectId,
        validBillingAccountId,
        quotaProject,
        this.fetchFn,
        prefs.lastWorkingQuotaProject
      );
    } catch (err) {
      if (err instanceof GcpHttpError && err.status === 403 && !isQuotaOrApiDisabledMessage(err.message)) {
        throw new Error(
          `Permission denied linking project "${validProjectId}" to billing account ${validBillingAccountId}. ` +
            `Requires "Billing Account User" (billing.resourceAssociations.create) on the target billing account ` +
            `and "Project Billing Manager" or "Owner" (resourcemanager.projects.createBillingAssignment) on the project. (${err.message})`
        );
      }
      throw err;
    }

    if (updated.usedQuotaProject && updated.usedQuotaProject !== prefs.lastWorkingQuotaProject) {
      this.store.updatePreferences((curr) => ({
        ...curr,
        lastWorkingQuotaProject: updated.usedQuotaProject,
      }));
    }

    // Best-effort metadata lookup when linking to a manual Billing Account ID not yet in local cache
    let targetMeta   
                 
                           
                          
                    
                                    
                            
             = existingTargetBa
      ? {
          id: existingTargetBa.id,
          resourceName: existingTargetBa.resourceName,
          displayName: existingTargetBa.displayName,
          open: existingTargetBa.open,
          masterBillingAccount: existingTargetBa.masterBillingAccount,
          currencyCode: existingTargetBa.currencyCode,
        }
      : null;

    if (!targetMeta) {
      targetMeta = await fetchBillingAccountMetadata(
        token,
        updated.billingAccountId,
        updated.usedQuotaProject ?? quotaProject,
        this.fetchFn
      );
    }

    const resolvedDisplayName =
      targetMeta?.displayName ?? `Billing Account (${updated.billingAccountId})`;

    if (prevSnapshot) {
      const nowIso = now.toISOString();
      this.updateSnapshotSection(activeAccount, nowIso, (draft) => {
        draft.projectBillingLinks[validProjectId] = {
          billingAccountId: updated.billingAccountId,
          billingEnabled: updated.billingEnabled,
        };
        for (const ba of draft.billingAccounts) {
          if (ba.id !== updated.billingAccountId) {
            ba.linkedProjectIds = ba.linkedProjectIds.filter((id) => id !== validProjectId);
          }
        }
        const isOpenTarget = targetMeta?.open ?? updated.billingEnabled;
        if (isOpenTarget) {
          delete draft.closedBillingAccounts[updated.billingAccountId];
        }
        let targetEntry = draft.billingAccounts.find((ba) => ba.id === updated.billingAccountId);
        if (!targetEntry) {
          targetEntry = {
            id: updated.billingAccountId,
            resourceName: `billingAccounts/${updated.billingAccountId}`,
            displayName: resolvedDisplayName,
            open: isOpenTarget,
            masterBillingAccount: targetMeta?.masterBillingAccount,
            currencyCode: targetMeta?.currencyCode,
            linkedProjectIds: [],
            budgets: [],
          };
          draft.billingAccounts.push(targetEntry);
        }
        if (updated.billingEnabled && !targetEntry.linkedProjectIds.includes(validProjectId)) {
          targetEntry.linkedProjectIds.push(validProjectId);
        }
      });
    }

    this.invalidateOverviewOnly();

    return {
      projectId: validProjectId,
      previousBillingAccountId: prevId,
      previousBillingAccountName: prevName,
      billingAccountId: updated.billingAccountId,
      billingAccountName: resolvedDisplayName,
      billingEnabled: updated.billingEnabled,
      unchanged: prevId === updated.billingAccountId && prevEnabled && updated.billingEnabled,
    };
  }

  async deleteProject(projectId        , confirmProjectId        )                               {
    const validProjectId = validateProjectId(projectId);
    const trimmedConfirm = typeof confirmProjectId === "string" ? confirmProjectId.trim() : "";
    if (trimmedConfirm !== validProjectId) {
      throw new Error(
        `Project ID confirmation mismatch. Type "${validProjectId}" exactly to confirm deletion.`
      );
    }

    const prefs = this.store.loadPreferences();
    const now = this.nowFn();
    const pendingDeletionConsoleUrl =
      "https://console.cloud.google.com/cloud-resource-manager?pendingDeletion=true";

    const cleanupLocalProjectRefs = () => {
      this.store.updatePreferences((curr) => {
        const nextPinned = curr.pinnedProjects.filter((id) => id !== validProjectId);
        const nextQuota =
          curr.quotaProjectOverride === validProjectId ? null : curr.quotaProjectOverride;
        const nextLastQuota =
          curr.lastWorkingQuotaProject === validProjectId ? null : curr.lastWorkingQuotaProject;
        if (
          nextPinned.length === curr.pinnedProjects.length &&
          nextQuota === curr.quotaProjectOverride &&
          nextLastQuota === curr.lastWorkingQuotaProject
        ) {
          return curr;
        }
        return {
          ...curr,
          pinnedProjects: nextPinned,
          quotaProjectOverride: nextQuota,
          lastWorkingQuotaProject: nextLastQuota,
        };
      });
    };

    if (prefs.demoMode) {
      const currentDemo = buildDemoOverview(
        prefs,
        now,
        this.demoActiveProject,
        this.demoProjectBillingOverrides,
        this.demoDeletedProjects
      );
      const proj = currentDemo.projects.find((p) => p.projectId === validProjectId);
      if (!proj) {
        throw new Error(`Demo project "${validProjectId}" was not found.`);
      }
      this.demoDeletedProjects.add(validProjectId);
      delete this.demoProjectBillingOverrides[validProjectId];
      cleanupLocalProjectRefs();
      this.invalidateOverviewOnly();
      return {
        projectId: validProjectId,
        projectName: proj.name,
        wasActiveProject: proj.isActiveProject,
        hadBillingEnabled: proj.billingEnabled,
        demoSimulated: true,
        pendingDeletionConsoleUrl,
      };
    }

    const auth = await this.gcloud.getAuthStatus(prefs.gcloudPathOverride);
    if (!auth.authenticated || !auth.activeAccount) {
      throw new Error("Not authenticated with gcloud. Run `gcloud auth login` first.");
    }

    const activeAccount = auth.activeAccount;
    const prevSnapshot = this.store.loadSnapshot(activeAccount);
    const prevProj = prevSnapshot?.projects.find((p) => p.projectId === validProjectId) ?? null;
    const prevLinks = prevSnapshot ? this.extractBillingLinksFromSnapshot(prevSnapshot) : {};
    const hadBillingEnabled = Boolean(
      prevLinks[validProjectId]?.billingEnabled ?? prevProj?.billingEnabled
    );
    const wasActiveProject = auth.activeProject === validProjectId;
    const projectName = prevProj?.name || validProjectId;

    const token = await this.gcloud.getAccessToken(prefs.gcloudPathOverride, activeAccount);
    const quotaProject = prefs.quotaProjectOverride || auth.activeProject || null;

    try {
      await deleteGcpProject(
        token,
        validProjectId,
        quotaProject,
        this.fetchFn,
        prefs.lastWorkingQuotaProject
      );
    } catch (err) {
      if (err instanceof GcpHttpError) {
        if (err.status === 401) {
          this.gcloud.invalidateTokenCache();
          throw new Error(
            "Your Google Cloud session has expired or been revoked. Please sign in again with `gcloud auth login`."
          );
        }
        if (err.status === 403 && !isQuotaOrApiDisabledMessage(err.message)) {
          throw new Error(
            `Permission denied deleting project "${validProjectId}". ` +
              `Requires the "Project Deleter" or "Owner" role (resourcemanager.projects.delete). (${err.message})`
          );
        }
        if (err.status === 400 && /lien|FAILED_PRECONDITION/i.test(err.message)) {
          throw new Error(
            `Project "${validProjectId}" cannot be deleted because it has an active project lien (e.g. App Engine or custom protection). ` +
              `Remove the lien in Google Cloud Console or via \`gcloud alpha resource-manager liens list --project=${validProjectId}\` first. (${err.message})`
          );
        }
        if (err.status === 404) {
          throw new Error(
            `Project "${validProjectId}" was not found or has already been deleted. (${err.message})`
          );
        }
      }
      throw err;
    }

    cleanupLocalProjectRefs();

    if (prevSnapshot) {
      const nowIso = now.toISOString();
      this.updateSnapshotSection(activeAccount, nowIso, (draft) => {
        draft.projects = draft.projects.filter((p) => p.projectId !== validProjectId);
        delete draft.projectBillingLinks[validProjectId];
        for (const ba of draft.billingAccounts) {
          ba.linkedProjectIds = ba.linkedProjectIds.filter((id) => id !== validProjectId);
        }
        if (wasActiveProject) {
          const staleWarn = `Active gcloud project "${validProjectId}" is deleted or inaccessible. Consider switching to an active project.`;
          const existing = draft.sectionWarnings.projects ?? [];
          if (!existing.includes(staleWarn)) {
            draft.sectionWarnings.projects = [...existing, staleWarn];
          }
        }
      });
    }

    this.invalidateOverviewOnly();

    return {
      projectId: validProjectId,
      projectName,
      wasActiveProject,
      hadBillingEnabled,
      demoSimulated: false,
      pendingDeletionConsoleUrl,
    };
  }

  setPinnedProject(projectId        , pinned         )                       {
    const validId = validateProjectId(projectId);
    const updated = this.store.updatePreferences((curr) => {
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
    this.invalidateOverviewOnly();
    return updated;
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

    const updated = this.store.updatePreferences((curr) => ({
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
    const cloudContextChanged =
      input.demoMode !== undefined ||
      input.gcloudPathOverride !== undefined ||
      input.quotaProjectOverride !== undefined;
    if (input.demoMode !== undefined) {
      this.demoDeletedProjects.clear();
    }
    if (cloudContextChanged) {
      this.invalidateInFlightOverview();
    } else {
      this.invalidateOverviewOnly();
    }
    return updated;
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
      this.invalidateInFlightOverview();
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

    this.invalidateInFlightOverview();
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

    this.invalidateInFlightOverview();
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
    this.invalidateInFlightOverview();
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
