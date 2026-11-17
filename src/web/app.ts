import type {
  AuthStatus,
  BillingAccount,
  CompanionOverviewResponse,
  CurrencyTotalSummary,
  DiscoveredBillingTable,
  GcpProject,
  LocalePreference,
  ProjectBillingLinkInfo,
  ProjectSpendSummary,
  SpendReport,
} from "../core/types.ts";
import {
  applyPluginUpdateApi,
  checkPluginUpdateApi,
  configureExportTableApi,
  discoverExportTablesApi,
  enableGcpServiceApi,
  fetchBillingSection,
  fetchBootstrap,
  fetchBudgetsSection,
  fetchOverview,
  fetchProjectsSection,
  fetchSpendSection,
  startBrowserLoginApi,
  switchActiveAccountProgressive,
  switchActiveProject,
  togglePinProject,
  updateCloudPreferencesProgressive,
  updateCompanionPreferences,
} from "./api.ts";
import { renderDailySparkline, renderServiceBreakdownList } from "./charts.ts";
import {
  clearElement,
  copyToClipboard,
  formatMoney,
  formatRelativeAge,
  h,
} from "./dom.ts";
import {
  SUPPORTED_LOCALES,
  getActiveLocale,
  getLocalePreference,
  localizeSetupHint,
  setLocalePreference,
  t,
} from "./i18n/index.ts";

type ActiveTab = "overview" | "projects" | "billing";
type OverviewBreakdownMode = "projects" | "accounts" | "services";
type ProjectSortMode = "smart" | "spend" | "name";

const PROJECT_PAGE_SIZE = 6;
const LINKED_PROJECTS_PREVIEW_LIMIT = 5;

interface DomainFlags {
  bootstrap: boolean;
  projects: boolean;
  billing: boolean;
  budgets: boolean;
  spend: boolean;
}

interface DomainErrorState {
  bootstrap: string | null;
  projects: string | null;
  billing: string | null;
  budgets: string | null;
  spend: string | null;
}

interface SectionWarningsState {
  projects: string[];
  billing: string[];
  budgets: string[];
  spend: string[];
}

function getCurrentYyyymm(now = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}${m}`;
}

function getPrevYyyymm(now = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}${m}`;
}

function createEmptyClientSpendReport(): SpendReport {
  const now = new Date();
  return {
    configured: false,
    invoiceMonth: getCurrentYyyymm(now),
    previousInvoiceMonth: getPrevYyyymm(now),
    queriedTables: [],
    queriedAt: now.toISOString(),
    totalsByCurrency: [],
    byBillingAccount: {},
    byProject: {},
  };
}

function createInitialOverviewShell(): CompanionOverviewResponse {
  return {
    auth: {
      authenticated: true,
      source: "none",
      gcloudInstalled: true,
      gcloudBinaryPath: null,
      activeAccount: null,
      maskedActiveAccount: null,
      activeProject: null,
      accounts: [],
      setupHint: null,
    },
    preferences: {
      pinnedProjects: [],
      billingExportTables: {},
      cacheTtlHours: 6,
      maskEmails: false,
      gcloudPathOverride: null,
      quotaProjectOverride: null,
      demoMode: false,
      locale: "auto",
      autoUpdatePlugin: true,
    },
    cache: {
      hit: false,
      stale: false,
      fetchedAt: null,
      ageMs: null,
      ttlMs: 6 * 3_600_000,
    },
    summary: {
      totalProjects: 0,
      billedProjects: 0,
      unbilledProjects: 0,
      pinnedProjectsCount: 0,
      totalBillingAccounts: 0,
      openBillingAccounts: 0,
      spendConfigured: false,
    },
    projects: [],
    billingAccounts: [],
    spend: createEmptyClientSpendReport(),
    warnings: [],
  };
}

interface UiState {
  overview: CompanionOverviewResponse;
  domainLoading: DomainFlags;
  domainLoaded: DomainFlags;
  domainErrors: DomainErrorState;
  sectionWarnings: SectionWarningsState;
  projectBillingLinks: Record<string, ProjectBillingLinkInfo>;
  refreshing: boolean;
  activeTab: ActiveTab;
  overviewMode: OverviewBreakdownMode;
  selectedInvoiceMonth: string;
  projectSearch: string;
  projectFilter: string; // "focus" | "all" | "unbilled" | "ba:<ID>"
  projectSort: ProjectSortMode;
  projectPageLimit: number;
  expandedProjectIds: Set<string>;
  expandedBillingLinkedIds: Set<string>;
  discoverHostProject: string;
  discoveringTables: boolean;
  discoveredTables: DiscoveredBillingTable[] | null;
  manualBillingAccountId: string;
  manualTableId: string;
  enableTargetProject: string;
  enablingApi: boolean;
  signingInBrowser: boolean;
  settingsMenuOpen: boolean;
  settingsQuotaDraft: string | null;
  settingsGcloudDraft: string | null;
  checkingPluginUpdate: boolean;
  applyingPluginUpdate: boolean;
}

let activeLoadSeq = 0;

const state: UiState = {
  overview: createInitialOverviewShell(),
  domainLoading: {
    bootstrap: true,
    projects: true,
    billing: true,
    budgets: false,
    spend: true,
  },
  domainLoaded: {
    bootstrap: false,
    projects: false,
    billing: false,
    budgets: false,
    spend: false,
  },
  domainErrors: {
    bootstrap: null,
    projects: null,
    billing: null,
    budgets: null,
    spend: null,
  },
  sectionWarnings: {
    projects: [],
    billing: [],
    budgets: [],
    spend: [],
  },
  projectBillingLinks: {},
  refreshing: false,
  activeTab: "overview",
  overviewMode: "projects",
  selectedInvoiceMonth: "",
  projectSearch: "",
  projectFilter: "all",
  projectSort: "smart",
  projectPageLimit: PROJECT_PAGE_SIZE,
  expandedProjectIds: new Set<string>(),
  expandedBillingLinkedIds: new Set<string>(),
  discoverHostProject: "",
  discoveringTables: false,
  discoveredTables: null,
  manualBillingAccountId: "*",
  manualTableId: "",
  enableTargetProject: "",
  enablingApi: false,
  signingInBrowser: false,
  settingsMenuOpen: false,
  settingsQuotaDraft: null,
  settingsGcloudDraft: null,
  checkingPluginUpdate: false,
  applyingPluginUpdate: false,
};

function isSpendExpected(overview: CompanionOverviewResponse): boolean {
  return (
    overview.preferences.demoMode ||
    Object.keys(overview.preferences.billingExportTables).length > 0 ||
    overview.spend.configured
  );
}

function isAnyCoreDomainLoading(): boolean {
  return (
    state.domainLoading.bootstrap ||
    state.domainLoading.projects ||
    state.domainLoading.billing ||
    (isSpendExpected(state.overview) && state.domainLoading.spend)
  );
}

function showToast(message: string, kind: "info" | "success" | "error" = "info"): void {
  if (typeof document === "undefined" || !document) return;
  const root = document.getElementById("toast-root");
  if (!root) return;
  const item = h("div", { className: `toast toast-${kind}` }, message);
  root.appendChild(item);
  window.setTimeout(() => {
    item.remove();
  }, 3200);
}

function reconcileSpendSelection(spend: SpendReport): void {
  const availableMonths =
    spend.availableMonths && spend.availableMonths.length > 0
      ? spend.availableMonths
      : [spend.invoiceMonth];
  if (state.selectedInvoiceMonth && !availableMonths.includes(state.selectedInvoiceMonth)) {
    state.selectedInvoiceMonth = "";
  }
}

function recomputeDerivedOverview(): void {
  const ov = state.overview;
  const pinnedSet = new Set(ov.preferences.pinnedProjects);
  const globalExport = ov.preferences.billingExportTables["*"]?.tableId ?? null;
  const baDisplayMap = new Map<string, string>();
  for (const ba of ov.billingAccounts) {
    baDisplayMap.set(ba.id, ba.displayName);
  }

  const spend = ov.spend;
  const nextAccounts: BillingAccount[] = ov.billingAccounts.map((ba) => ({
    ...ba,
    exportTableId: ov.preferences.billingExportTables[ba.id]?.tableId ?? globalExport,
  }));
  nextAccounts.sort((a, b) => {
    if (a.open !== b.open) return a.open ? -1 : 1;
    if (a.linkedProjectCount !== b.linkedProjectCount) {
      return b.linkedProjectCount - a.linkedProjectCount;
    }
    const spendA = spend.byBillingAccount[a.id]?.currentMonthNetCost ?? -1;
    const spendB = spend.byBillingAccount[b.id]?.currentMonthNetCost ?? -1;
    if (spendA !== spendB) return spendB - spendA;
    return a.displayName.localeCompare(b.displayName);
  });

  const nextProjects: GcpProject[] = ov.projects.map((p) => {
    const link = state.domainLoaded.billing ? state.projectBillingLinks[p.projectId] : undefined;
    const billingAccountId = link !== undefined ? link.billingAccountId : p.billingAccountId;
    const billingEnabled = link !== undefined ? link.billingEnabled : p.billingEnabled;
    return {
      ...p,
      billingAccountId,
      billingAccountName: billingAccountId
        ? (baDisplayMap.get(billingAccountId) ?? p.billingAccountName ?? billingAccountId)
        : null,
      billingEnabled,
      pinned: pinnedSet.has(p.projectId),
      isActiveProject: ov.auth.activeProject === p.projectId,
    };
  });

  nextProjects.sort((a, b) => {
    if (a.isActiveProject !== b.isActiveProject) return a.isActiveProject ? -1 : 1;
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const spendA = spend.byProject[a.projectId]?.currentMonthNetCost ?? -1;
    const spendB = spend.byProject[b.projectId]?.currentMonthNetCost ?? -1;
    if (spendA !== spendB) return spendB - spendA;
    return a.projectId.localeCompare(b.projectId);
  });

  const spendConfigured =
    spend.configured ||
    ov.preferences.demoMode ||
    Object.keys(ov.preferences.billingExportTables).length > 0;

  const combinedWarnings = [
    ...state.sectionWarnings.projects,
    ...state.sectionWarnings.billing,
    ...state.sectionWarnings.budgets,
    ...state.sectionWarnings.spend,
  ];

  state.overview = {
    ...ov,
    projects: nextProjects,
    billingAccounts: nextAccounts,
    summary: {
      totalProjects: nextProjects.length,
      billedProjects: nextProjects.filter((p) => p.billingEnabled).length,
      unbilledProjects: nextProjects.filter((p) => !p.billingEnabled).length,
      pinnedProjectsCount: nextProjects.filter((p) => p.pinned).length,
      totalBillingAccounts: nextAccounts.length,
      openBillingAccounts: nextAccounts.filter((b) => b.open).length,
      spendConfigured,
    },
    warnings: combinedWarnings,
  };
}

function applyFullOverview(data: CompanionOverviewResponse): void {
  activeLoadSeq++;
  const links: Record<string, ProjectBillingLinkInfo> = {};
  for (const p of data.projects) {
    if (p.billingAccountId) {
      links[p.projectId] = {
        billingAccountId: p.billingAccountId,
        billingEnabled: p.billingEnabled,
      };
    }
  }
  state.projectBillingLinks = links;
  state.sectionWarnings = {
    projects: [],
    billing: [...data.warnings],
    budgets: [],
    spend: [],
  };
  state.domainLoading = {
    bootstrap: false,
    projects: false,
    billing: false,
    budgets: false,
    spend: false,
  };
  state.domainLoaded = {
    bootstrap: true,
    projects: true,
    billing: true,
    budgets: true,
    spend: true,
  };
  state.domainErrors = {
    bootstrap: null,
    projects: null,
    billing: null,
    budgets: null,
    spend: null,
  };
  state.overview = data;
  reconcileSpendSelection(data.spend);
  if (data.preferences.locale) {
    setLocalePreference(data.preferences.locale);
  }
  if (!state.discoverHostProject && data.auth.activeProject) {
    state.discoverHostProject = data.auth.activeProject;
  }
  if (
    state.enableTargetProject &&
    !data.projects.some((p) => p.projectId === state.enableTargetProject)
  ) {
    state.enableTargetProject = "";
  }
  if (state.manualBillingAccountId === "*" && data.billingAccounts.length === 1) {
    state.manualBillingAccountId = data.billingAccounts[0].id;
  }
}

function applyLocalMutationOverview(data: CompanionOverviewResponse): void {
  state.overview = {
    ...state.overview,
    auth: data.auth,
    preferences: data.preferences,
    pluginUpdate: data.pluginUpdate ?? state.overview.pluginUpdate,
  };
  if (data.preferences.locale) {
    setLocalePreference(data.preferences.locale);
  }
  recomputeDerivedOverview();
}

function handleDomainAuthExpired(expiredAuth: AuthStatus): void {
  activeLoadSeq++;
  state.overview = {
    ...createInitialOverviewShell(),
    auth: expiredAuth,
    preferences: state.overview.preferences,
    pluginUpdate: state.overview.pluginUpdate,
  };
  state.domainLoading = {
    bootstrap: false,
    projects: false,
    billing: false,
    budgets: false,
    spend: false,
  };
  state.domainLoaded = {
    bootstrap: true,
    projects: false,
    billing: false,
    budgets: false,
    spend: false,
  };
  state.refreshing = false;
  renderApp();
}

async function runBudgetsTask(seq: number, forceRefresh: boolean): Promise<void> {
  state.domainLoading.budgets = true;
  state.domainErrors.budgets = null;
  renderApp();
  try {
    const res = await fetchBudgetsSection(forceRefresh);
    if (seq !== activeLoadSeq) return;
    if (res.authenticated) {
      state.overview = {
        ...state.overview,
        billingAccounts: state.overview.billingAccounts.map((ba) => ({
          ...ba,
          budgets: res.budgetsByAccount[ba.id] ?? ba.budgets ?? [],
        })),
      };
      state.sectionWarnings.budgets = res.warnings ?? [];
      state.domainLoaded.budgets = true;
    }
  } catch (err) {
    if (seq !== activeLoadSeq) return;
    state.domainErrors.budgets = err instanceof Error ? err.message : t("toast.loadFailed");
  } finally {
    if (seq === activeLoadSeq) {
      state.domainLoading.budgets = false;
      recomputeDerivedOverview();
      renderApp();
    }
  }
}

async function runProjectsTask(seq: number, forceRefresh: boolean): Promise<void> {
  try {
    const res = await fetchProjectsSection(forceRefresh);
    if (seq !== activeLoadSeq) return;
    if (res.authExpired && res.auth) {
      handleDomainAuthExpired(res.auth);
      return;
    }
    if (res.authenticated && Array.isArray(res.projects)) {
      state.overview = {
        ...state.overview,
        projects: res.projects,
        cache: res.cache ?? state.overview.cache,
      };
      state.sectionWarnings.projects = res.warnings ?? [];
      if (
        state.enableTargetProject &&
        !res.projects.some((p) => p.projectId === state.enableTargetProject)
      ) {
        state.enableTargetProject = "";
      }
      state.domainLoaded.projects = true;
      state.domainErrors.projects = null;
    }
  } catch (err) {
    if (seq !== activeLoadSeq) return;
    state.domainErrors.projects = err instanceof Error ? err.message : t("toast.loadFailed");
  } finally {
    if (seq === activeLoadSeq) {
      state.domainLoading.projects = false;
      recomputeDerivedOverview();
      renderApp();
    }
  }
}

async function runBillingTask(seq: number, forceRefresh: boolean): Promise<void> {
  try {
    const res = await fetchBillingSection(forceRefresh);
    if (seq !== activeLoadSeq) return;
    if (res.authExpired && res.auth) {
      handleDomainAuthExpired(res.auth);
      return;
    }
    if (res.authenticated && Array.isArray(res.billingAccounts)) {
      state.projectBillingLinks = res.projectBillingLinks ?? {};
      state.overview = {
        ...state.overview,
        billingAccounts: res.billingAccounts,
        cache: res.cache ?? state.overview.cache,
      };
      state.sectionWarnings.billing = res.warnings ?? [];
      if (state.manualBillingAccountId === "*" && res.billingAccounts.length === 1) {
        state.manualBillingAccountId = res.billingAccounts[0].id;
      }
      state.domainLoaded.billing = true;
      state.domainErrors.billing = null;

      if (res.billingAccounts.length > 0 && !res.budgetsLoaded) {
        void runBudgetsTask(seq, forceRefresh);
      } else {
        state.domainLoaded.budgets = true;
        state.domainLoading.budgets = false;
      }
    }
  } catch (err) {
    if (seq !== activeLoadSeq) return;
    state.domainErrors.billing = err instanceof Error ? err.message : t("toast.loadFailed");
  } finally {
    if (seq === activeLoadSeq) {
      state.domainLoading.billing = false;
      recomputeDerivedOverview();
      renderApp();
    }
  }
}

async function runSpendTask(seq: number, forceRefresh: boolean): Promise<void> {
  try {
    const res = await fetchSpendSection(forceRefresh);
    if (seq !== activeLoadSeq) return;
    if (res.authExpired && res.auth) {
      handleDomainAuthExpired(res.auth);
      return;
    }
    if (res.authenticated && res.spend) {
      state.overview = {
        ...state.overview,
        spend: res.spend,
        cache: res.cache ?? state.overview.cache,
      };
      state.sectionWarnings.spend = res.warnings ?? [];
      reconcileSpendSelection(res.spend);
      state.domainLoaded.spend = true;
      state.domainErrors.spend = null;
    }
  } catch (err) {
    if (seq !== activeLoadSeq) return;
    state.domainErrors.spend = err instanceof Error ? err.message : t("toast.loadFailed");
  } finally {
    if (seq === activeLoadSeq) {
      state.domainLoading.spend = false;
      recomputeDerivedOverview();
      renderApp();
    }
  }
}

async function retryProjectsDomain(): Promise<void> {
  state.domainLoading.projects = true;
  state.domainErrors.projects = null;
  renderApp();
  await runProjectsTask(activeLoadSeq, true);
}

async function retryBillingDomain(): Promise<void> {
  state.domainLoading.billing = true;
  state.domainErrors.billing = null;
  renderApp();
  await runBillingTask(activeLoadSeq, true);
}

async function retrySpendDomain(): Promise<void> {
  state.domainLoading.spend = true;
  state.domainErrors.spend = null;
  renderApp();
  await runSpendTask(activeLoadSeq, true);
}

async function loadData(
  forceRefresh = false,
  options: { resetSections?: boolean } = {}
): Promise<void> {
  const seq = ++activeLoadSeq;
  if (forceRefresh) {
    state.refreshing = true;
  }

  if (options.resetSections) {
    state.projectBillingLinks = {};
    state.sectionWarnings = { projects: [], billing: [], budgets: [], spend: [] };
    state.overview = {
      ...state.overview,
      projects: [],
      billingAccounts: [],
      spend: createEmptyClientSpendReport(),
      warnings: [],
    };
    state.domainLoaded = {
      bootstrap: state.domainLoaded.bootstrap,
      projects: false,
      billing: false,
      budgets: false,
      spend: false,
    };
    recomputeDerivedOverview();
  }

  state.domainLoading = {
    bootstrap: true,
    projects: true,
    billing: true,
    budgets: false,
    spend: true,
  };
  state.domainErrors = {
    bootstrap: null,
    projects: null,
    billing: null,
    budgets: null,
    spend: null,
  };
  renderApp();

  const pProjects = runProjectsTask(seq, forceRefresh);
  const pBilling = runBillingTask(seq, forceRefresh);
  const pSpend = runSpendTask(seq, forceRefresh);

  const pBootstrap = (async () => {
    try {
      const boot = await fetchBootstrap(forceRefresh);
      if (seq !== activeLoadSeq) return;

      // Fallback for mocked environments that only implement monolithic `/api/overview`
      if (!boot || !boot.auth || !boot.preferences) {
        const legacyOverview = await fetchOverview(forceRefresh);
        if (seq !== activeLoadSeq) return;
        applyFullOverview(legacyOverview);
        state.refreshing = false;
        if (forceRefresh) {
          showToast(t("toast.refreshed"), "success");
        }
        renderApp();
        return;
      }

      if (boot.preferences.locale) {
        setLocalePreference(boot.preferences.locale);
      }
      if (!state.discoverHostProject && boot.auth.activeProject) {
        state.discoverHostProject = boot.auth.activeProject;
      }

      // Stale-while-revalidate: pre-hydrate expired disk snapshot immediately while live section tasks finish
      if (!forceRefresh && boot.cachedOverview) {
        const stale = boot.cachedOverview;
        if (!state.domainLoaded.projects) {
          state.overview.projects = stale.projects;
          state.domainLoaded.projects = true;
        }
        if (!state.domainLoaded.billing) {
          const staleLinks: Record<string, ProjectBillingLinkInfo> = {};
          for (const p of stale.projects) {
            if (p.billingAccountId) {
              staleLinks[p.projectId] = {
                billingAccountId: p.billingAccountId,
                billingEnabled: p.billingEnabled,
              };
            }
          }
          state.projectBillingLinks = staleLinks;
          state.overview.billingAccounts = stale.billingAccounts;
          state.domainLoaded.billing = true;
          state.domainLoaded.budgets = true;
        }
        if (!state.domainLoaded.spend) {
          state.overview.spend = stale.spend;
          reconcileSpendSelection(stale.spend);
          state.domainLoaded.spend = true;
        }
        state.overview.cache = stale.cache;
      }

      state.overview = {
        ...state.overview,
        auth: boot.auth,
        preferences: boot.preferences,
        pluginUpdate: boot.pluginUpdate ?? state.overview.pluginUpdate,
      };
      state.domainLoaded.bootstrap = true;
      state.domainLoading.bootstrap = false;

      if (!boot.auth.authenticated && !boot.preferences.demoMode) {
        state.domainLoading = {
          bootstrap: false,
          projects: false,
          billing: false,
          budgets: false,
          spend: false,
        };
      } else if (!boot.spendConfigured && !boot.preferences.demoMode) {
        state.domainLoaded.spend = true;
        state.domainLoading.spend = false;
      }

      recomputeDerivedOverview();
      renderApp();
    } catch (err) {
      if (seq !== activeLoadSeq) return;
      state.domainErrors.bootstrap = err instanceof Error ? err.message : t("toast.loadFailed");
      state.domainLoading = {
        bootstrap: false,
        projects: false,
        billing: false,
        budgets: false,
        spend: false,
      };
      showToast(state.domainErrors.bootstrap, "error");
      renderApp();
    }
  })();

  await Promise.allSettled([pBootstrap, pProjects, pBilling, pSpend]);
  if (seq === activeLoadSeq) {
    state.refreshing = false;
    const anyError =
      state.domainErrors.bootstrap ||
      state.domainErrors.projects ||
      state.domainErrors.billing ||
      state.domainErrors.spend;
    if (forceRefresh && !anyError) {
      showToast(t("toast.refreshed"), "success");
    }
    renderApp();
  }
}

function renderSectionLoadingPill(label: string): HTMLElement {
  return h(
    "span",
    { className: "section-loading-pill" },
    h("span", { className: "spinner-xs", ariaHidden: "true" }),
    h("span", null, label)
  );
}

function renderSectionErrorCard(message: string, onRetry: () => void): HTMLElement {
  return h(
    "section",
    { className: "card warning-card" },
    h(
      "div",
      { className: "inline-error-row" },
      h("span", { className: "warning-line" }, message),
      h(
        "button",
        {
          type: "button",
          className: "btn btn-xs btn-primary",
          onClick: onRetry,
        },
        t("loading.sectionErrorRetry")
      )
    )
  );
}

function renderHeroSpendSkeletonCard(statusLabel?: string): HTMLElement {
  return h(
    "section",
    { className: "card skeleton-card", ariaBusy: "true" },
    h(
      "div",
      { className: "hero-top-row" },
      h("span", { className: "skeleton sk-line-sm", ariaHidden: "true" }),
      statusLabel ? renderSectionLoadingPill(statusLabel) : null
    ),
    h("div", { className: "skeleton sk-hero-amt", ariaHidden: "true" }),
    h(
      "div",
      { className: "hero-submetrics", ariaHidden: "true" },
      h("span", { className: "skeleton sk-pill-md" }),
      h("span", { className: "skeleton sk-pill-sm" })
    ),
    h("div", { className: "skeleton sk-chart-box", ariaHidden: "true" })
  );
}

function renderBreakdownSkeletonCard(): HTMLElement {
  return h(
    "section",
    { className: "card skeleton-card", ariaBusy: "true", ariaHidden: "true" },
    h(
      "div",
      { className: "section-header-row" },
      h("span", { className: "skeleton sk-line-sm" }),
      h("span", { className: "skeleton sk-pill-md" })
    ),
    ...Array.from({ length: 3 }, () =>
      h(
        "div",
        { className: "skeleton-row" },
        h(
          "div",
          { className: "skeleton-stack" },
          h("span", { className: "skeleton sk-line-md" }),
          h("span", { className: "skeleton sk-line-xs" })
        ),
        h("span", { className: "skeleton sk-amt-sm" })
      )
    )
  );
}

function renderProjectCardsSkeleton(count = 4): HTMLElement[] {
  return [
    h(
      "div",
      { className: "section-header-row" },
      renderSectionLoadingPill(t("loading.projects"))
    ),
    ...Array.from({ length: count }, () =>
      h(
        "article",
        { className: "card project-card skeleton-card", ariaBusy: "true", ariaHidden: "true" },
        h(
          "div",
          { className: "skeleton-row" },
          h(
            "div",
            { className: "skeleton-stack" },
            h("span", { className: "skeleton sk-line-md" }),
            h("span", { className: "skeleton sk-line-sm" })
          ),
          h("span", { className: "skeleton sk-amt-sm" })
        )
      )
    ),
  ];
}

function renderBillingCardsSkeleton(count = 2): HTMLElement {
  return h(
    "div",
    { className: "stack-list", ariaBusy: "true" },
    h(
      "div",
      { className: "section-header-row" },
      renderSectionLoadingPill(t("loading.billing"))
    ),
    ...Array.from({ length: count }, () =>
      h(
        "article",
        { className: "card billing-card skeleton-card", ariaHidden: "true" },
        h(
          "div",
          { className: "skeleton-row" },
          h(
            "div",
            { className: "skeleton-stack" },
            h("span", { className: "skeleton sk-line-md" }),
            h("span", { className: "skeleton sk-line-xs" })
          ),
          h("span", { className: "skeleton sk-pill-sm" })
        ),
        h("div", { className: "skeleton sk-chart-box" })
      )
    )
  );
}

function isCloudBillingApiDisabled(overview: CompanionOverviewResponse): boolean {
  return (
    overview.billingAccounts.length === 0 &&
    overview.warnings.some((w) =>
      /cloudbilling\.googleapis\.com|Cloud Billing API has not been used|requires a quota project/i.test(
        w
      )
    )
  );
}

function getNonBillingApiWarnings(overview: CompanionOverviewResponse): string[] {
  if (!isCloudBillingApiDisabled(overview)) {
    return overview.warnings;
  }
  return overview.warnings.filter(
    (w) =>
      !/cloudbilling\.googleapis\.com|Cloud Billing API has not been used|requires a quota project/i.test(
        w
      )
  );
}

function getPreferredConsoleProject(overview: CompanionOverviewResponse): string {
  const activeValid = overview.projects.some((p) => p.projectId === overview.auth.activeProject)
    ? overview.auth.activeProject
    : null;
  return (
    state.enableTargetProject ||
    overview.preferences.quotaProjectOverride ||
    activeValid ||
    overview.auth.activeProject ||
    overview.projects[0]?.projectId ||
    ""
  );
}

function withConsoleProject(url: string, projectId: string | null | undefined): string {
  if (!projectId) return url;
  if (/[?&]project=/.test(url)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}project=${encodeURIComponent(projectId)}`;
}

function renderBillingApiSetupPrompt(overview: CompanionOverviewResponse): HTMLElement | null {
  if (!isCloudBillingApiDisabled(overview)) {
    return null;
  }

  const selectedProj = getPreferredConsoleProject(overview);

  // Use `/apis/api/<service>/overview?project=...` rather than `/apis/library/...` because GCP Console's
  // `/apis/library/...` redirects to `/marketplace/product/...` and drops `project=`, falling back to the last-visited project.
  const consoleUrl = withConsoleProject(
    "https://console.cloud.google.com/apis/api/cloudbilling.googleapis.com/overview",
    selectedProj
  );

  return h(
    "section",
    { className: "card api-setup-card" },
    h(
      "div",
      { className: "api-setup-header" },
      h("span", { className: "badge badge-warn" }, t("billingApi.badge")),
      h("h3", { className: "section-title" }, t("billingApi.title"))
    ),
    h("p", { className: "card-desc" }, t("billingApi.desc")),
    overview.projects.length > 0
      ? h(
          "label",
          { className: "field-label api-setup-field" },
          t("billingApi.quotaProjectLabel"),
          h(
            "select",
            {
              className: "compact-select full-width",
              disabled: state.enablingApi,
              onChange: (ev) => {
                state.enableTargetProject = (ev.target as HTMLSelectElement).value;
                renderApp();
              },
            },
            ...overview.projects.map((p) =>
              h(
                "option",
                {
                  value: p.projectId,
                  selected: p.projectId === selectedProj,
                },
                `${p.name} (${p.projectId})`
              )
            )
          )
        )
      : null,
    h(
      "div",
      { className: "action-row" },
      selectedProj
        ? h(
            "button",
            {
              type: "button",
              className: "btn btn-primary btn-sm",
              disabled: state.enablingApi,
              onClick: async () => {
                try {
                  state.enablingApi = true;
                  renderApp();
                  showToast(t("toast.enablingBillingApi", { project: selectedProj }), "info");
                  const updated = await enableGcpServiceApi(
                    selectedProj,
                    "cloudbilling.googleapis.com"
                  );
                  applyFullOverview(updated);
                  showToast(t("toast.enabledBillingApi"), "success");
                } catch (err) {
                  showToast(
                    err instanceof Error ? err.message : t("toast.enableBillingApiFailed"),
                    "error"
                  );
                } finally {
                  state.enablingApi = false;
                  renderApp();
                }
              },
            },
            state.enablingApi
              ? t("billingApi.enablingBtn")
              : t("billingApi.enableBtn", { project: selectedProj })
          )
        : null,
      h(
        "a",
        {
          className: "btn btn-sm",
          href: consoleUrl,
          target: "_blank",
          rel: "noopener noreferrer",
        },
        selectedProj
          ? t("billingApi.openConsoleProject", { project: selectedProj })
          : t("billingApi.openConsole")
      ),
      h(
        "button",
        {
          type: "button",
          className: "btn btn-sm",
          disabled: state.refreshing || state.enablingApi,
          onClick: () => {
            void loadData(true);
          },
        },
        t("header.refresh")
      )
    )
  );
}

function renderDeltaBadge(delta: number | null): HTMLElement {
  if (delta === null || !Number.isFinite(delta)) {
    return h("span", { className: "badge badge-neutral" }, t("spend.noBaseline"));
  }
  const sign = delta > 0 ? "+" : "";
  const cls =
    delta > 10
      ? "badge badge-warn"
      : delta < -2
        ? "badge badge-good"
        : "badge badge-neutral";
  return h("span", { className: cls }, t("spend.vsPrevMtd", { delta: `${sign}${delta.toFixed(1)}` }));
}

function renderLanguageSelect(): HTMLElement {
  const currentPref = getLocalePreference();
  return h(
    "select",
    {
      className: "compact-select full-width",
      ariaLabel: t("settings.languageLabel"),
      title: t("header.languageTitle"),
      onChange: async (ev) => {
        const nextPref = (ev.target as HTMLSelectElement).value as LocalePreference;
        if (nextPref === currentPref) return;
        setLocalePreference(nextPref);
        renderApp();
        try {
          const updated = await updateCompanionPreferences({ locale: nextPref });
          applyLocalMutationOverview(updated);
          renderApp();
          showToast(t("toast.languageUpdated"), "success");
        } catch (err) {
          showToast(
            err instanceof Error ? err.message : t("toast.prefUpdateFailed"),
            "error"
          );
        }
      },
    },
    h("option", { value: "auto", selected: currentPref === "auto" }, t("locale.autoFull")),
    ...SUPPORTED_LOCALES.map((loc) =>
      h("option", { value: loc.code, selected: currentPref === loc.code }, loc.nativeName)
    )
  );
}

async function handleToggleDemoMode(nextDemo: boolean, toastMessage: string): Promise<void> {
  try {
    state.selectedInvoiceMonth = "";
    state.overview = {
      ...state.overview,
      preferences: {
        ...state.overview.preferences,
        demoMode: nextDemo,
      },
    };
    const boot = await updateCloudPreferencesProgressive({ demoMode: nextDemo });
    state.overview = {
      ...state.overview,
      auth: boot.auth,
      preferences: boot.preferences,
      pluginUpdate: boot.pluginUpdate ?? state.overview.pluginUpdate,
    };
    showToast(toastMessage, "info");
    await loadData(false, { resetSections: true });
  } catch (err) {
    showToast(err instanceof Error ? err.message : t("toast.prefUpdateFailed"), "error");
    renderApp();
  }
}

async function handleInstallPluginUpdate(): Promise<void> {
  if (state.applyingPluginUpdate) return;
  try {
    state.applyingPluginUpdate = true;
    renderApp();
    const updated = await applyPluginUpdateApi();
    applyLocalMutationOverview(updated);
    const newVer =
      state.overview.pluginUpdate?.updatedToVersion ||
      state.overview.pluginUpdate?.latestVersion ||
      state.overview.pluginUpdate?.currentVersion ||
      "latest";
    showToast(t("toast.updateInstalled", { version: newVer }), "success");
  } catch (err) {
    showToast(err instanceof Error ? err.message : t("toast.updateFailed"), "error");
  } finally {
    state.applyingPluginUpdate = false;
    renderApp();
  }
}

async function handleCheckPluginUpdate(): Promise<void> {
  if (state.checkingPluginUpdate) return;
  try {
    state.checkingPluginUpdate = true;
    renderApp();
    const updated = await checkPluginUpdateApi();
    applyLocalMutationOverview(updated);
    const upd = state.overview.pluginUpdate;
    if (upd?.error) {
      showToast(upd.error, "error");
    } else if (upd?.restartRequired && upd.updatedToVersion) {
      showToast(t("toast.updateInstalled", { version: upd.updatedToVersion }), "success");
    } else if (upd?.updateAvailable && upd.latestVersion) {
      showToast(t("toast.updateAvailable", { version: upd.latestVersion }), "info");
    } else if (upd) {
      showToast(t("toast.upToDate", { version: upd.currentVersion }), "success");
    }
  } catch (err) {
    showToast(err instanceof Error ? err.message : t("toast.updateFailed"), "error");
  } finally {
    state.checkingPluginUpdate = false;
    renderApp();
  }
}

function renderHeaderUpdateBadge(overview: CompanionOverviewResponse): HTMLElement | null {
  const upd = overview.pluginUpdate;
  if (!upd) return null;

  if (upd.restartRequired && upd.updatedToVersion) {
    return h(
      "span",
      {
        className: "badge badge-good",
        title: t("update.headerUpdatedTitle", { version: upd.updatedToVersion }),
      },
      t("update.headerUpdatedBadge", { version: upd.updatedToVersion })
    );
  }

  if (upd.updateAvailable && upd.latestVersion) {
    return h(
      "button",
      {
        type: "button",
        className: "badge badge-update",
        disabled: state.applyingPluginUpdate,
        title: t("update.headerBadgeTitle", { version: upd.latestVersion }),
        onClick: () => handleInstallPluginUpdate(),
      },
      state.applyingPluginUpdate
        ? t("update.installingBtn")
        : t("update.headerBadgeAvailable", { version: upd.latestVersion })
    );
  }

  return null;
}

function renderHeader(overview: CompanionOverviewResponse): HTMLElement {
  const mask = overview.preferences.maskEmails;
  const syncing = state.refreshing || isAnyCoreDomainLoading();
  const accountOptions = overview.auth.accounts.map((acct) =>
    h(
      "option",
      {
        value: acct.account,
        selected: acct.account === overview.auth.activeAccount,
      },
      mask ? acct.maskedAccount : acct.account
    )
  );

  const accountBar = !state.domainLoaded.bootstrap
    ? h(
        "div",
        { className: "context-row", ariaHidden: "true" },
        h(
          "div",
          { className: "context-item context-account" },
          h("span", { className: "context-label" }, t("header.account")),
          h("span", { className: "skeleton sk-pill-lg" })
        ),
        h(
          "div",
          { className: "context-item context-project" },
          h("span", { className: "context-label" }, t("header.activeProject")),
          h("span", { className: "skeleton sk-pill-md" })
        )
      )
    : overview.auth.accounts.length > 0
      ? h(
          "div",
          { className: "context-row" },
          h(
            "div",
            { className: "context-item context-account" },
            h("span", { className: "context-label" }, t("header.account")),
            h(
              "select",
              {
                className: "compact-select",
                ariaLabel: t("header.accountAria"),
                disabled: state.refreshing || overview.preferences.demoMode,
                onChange: async (ev) => {
                  const target = ev.target as HTMLSelectElement;
                  const nextAcct = target.value;
                  if (!nextAcct || nextAcct === overview.auth.activeAccount) return;
                  try {
                    state.selectedInvoiceMonth = "";
                    await switchActiveAccountProgressive(nextAcct);
                    showToast(t("toast.switchedAccount"), "success");
                    await loadData(false, { resetSections: true });
                  } catch (err) {
                    showToast(
                      err instanceof Error ? err.message : t("toast.switchAccountFailed"),
                      "error"
                    );
                    renderApp();
                  }
                },
              },
              ...accountOptions
            ),
            h(
              "button",
              {
                type: "button",
                className: "icon-btn",
                title: mask ? t("header.showEmailTitle") : t("header.maskEmailTitle"),
                ariaLabel: mask ? t("header.showEmailAria") : t("header.maskEmailAria"),
                onClick: async () => {
                  const nextMask = !mask;
                  state.overview = {
                    ...state.overview,
                    preferences: { ...state.overview.preferences, maskEmails: nextMask },
                  };
                  renderApp();
                  try {
                    const updated = await updateCompanionPreferences({ maskEmails: nextMask });
                    applyLocalMutationOverview(updated);
                    renderApp();
                  } catch (err) {
                    showToast(
                      err instanceof Error ? err.message : t("toast.prefUpdateFailed"),
                      "error"
                    );
                  }
                },
              },
              mask ? "👁" : "🙈"
            )
          ),
          h(
            "div",
            { className: "context-item context-project" },
            h("span", { className: "context-label" }, t("header.activeProject")),
            overview.auth.activeProject
              ? h(
                  "button",
                  {
                    type: "button",
                    className: "project-pill-btn",
                    title: t("header.copyProjectTitle"),
                    onClick: async () => {
                      if (!overview.auth.activeProject) return;
                      const ok = await copyToClipboard(overview.auth.activeProject);
                      showToast(
                        ok
                          ? t("toast.copied", { value: overview.auth.activeProject })
                          : overview.auth.activeProject,
                        "info"
                      );
                    },
                  },
                  overview.auth.activeProject
                )
              : h("span", { className: "muted-inline" }, t("header.unset"))
          )
        )
      : null;

  return h(
    "header",
    { className: "top-header" },
    h(
      "div",
      { className: "brand-row" },
      h(
        "div",
        { className: "brand-left" },
        h("img", { className: "brand-logo" }),
        h("span", { className: "brand-title" }, "GCP Companion"),
        renderHeaderUpdateBadge(overview),
        overview.preferences.demoMode
          ? h(
              "button",
              {
                type: "button",
                className: "badge badge-demo",
                title: t("header.demoExitTitle"),
                onClick: () => {
                  void handleToggleDemoMode(false, t("toast.exitedDemo"));
                },
              },
              t("header.demoBadge")
            )
          : null
      ),
      h(
        "div",
        { className: "brand-right" },
        syncing
          ? renderSectionLoadingPill(t("header.syncing"))
          : h(
              "span",
              { className: "sync-age", title: overview.cache.fetchedAt || "" },
              formatRelativeAge(overview.cache.ageMs, overview.cache.stale)
            ),
        h(
          "button",
          {
            type: "button",
            className: state.refreshing ? "btn btn-sm btn-spinning" : "btn btn-sm",
            disabled: state.refreshing,
            title: t("header.refreshTitle"),
            onClick: () => {
              void loadData(true);
            },
          },
          state.refreshing ? t("header.syncing") : t("header.refresh")
        ),
        h(
          "button",
          {
            type: "button",
            className: state.settingsMenuOpen ? "btn btn-sm btn-settings-open" : "btn btn-sm",
            ariaExpanded: String(state.settingsMenuOpen),
            title: t("header.settingsTitle"),
            onClick: () => {
              state.settingsMenuOpen = !state.settingsMenuOpen;
              renderApp();
            },
          },
          t("header.settingsBtn")
        )
      )
    ),
    accountBar
  );
}

const LOGO_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none"><rect width="64" height="64" rx="16" fill="#1A73E8" fill-opacity="0.12"/><path d="M45.5 27.2C44.1 19.7 37.5 14 29.5 14C21.3 14 14.5 20 13.3 27.9C8.6 29.1 5.2 33.4 5.2 38.5C5.2 44.6 10.1 49.5 16.2 49.5H44.8C50.3 49.5 54.8 45 54.8 39.5C54.8 33.2 50.8 28.2 45.5 27.2Z" fill="#4285F4" fill-opacity="0.22" stroke="#4285F4" stroke-width="2.5" stroke-linejoin="round"/><rect x="20" y="33" width="5" height="11" rx="2" fill="#34A853"/><rect x="28.5" y="27" width="5" height="17" rx="2" fill="#FBBC04"/><rect x="37" y="22" width="5" height="22" rx="2" fill="#EA4335"/><path d="M19 25L27 21L34 23L42 16" stroke="#1A73E8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="42" cy="16" r="2.8" fill="#1A73E8"/></svg>'
  );

function bindLogoSources(container: HTMLElement): void {
  const imgs = container.querySelectorAll("img.brand-logo");
  imgs.forEach((node) => {
    if (node instanceof HTMLImageElement) {
      node.src = LOGO_DATA_URI;
      node.alt = "";
      node.width = 20;
      node.height = 20;
    }
  });
}

function renderCopyCommandBox(label: string, command: string): HTMLElement {
  return h(
    "div",
    { className: "cmd-group" },
    h("div", { className: "eyebrow" }, label),
    h(
      "div",
      { className: "cmd-box" },
      h("code", null, command),
      h(
        "button",
        {
          type: "button",
          className: "btn btn-xs",
          onClick: async () => {
            const ok = await copyToClipboard(command);
            showToast(ok ? t("toast.copied", { value: `\`${command}\`` }) : command, "info");
          },
        },
        t("common.copy")
      )
    )
  );
}

function renderUnauthenticatedView(overview: CompanionOverviewResponse): HTMLElement {
  const installDocsUrl = "https://cloud.google.com/sdk/docs/install";
  const brewInstallCmd = "brew install --cask gcloud-cli";
  const loginCmd = "gcloud auth login";
  const localizedHint = localizeSetupHint(overview.auth.setupHint);

  if (!overview.auth.gcloudInstalled) {
    return h(
      "section",
      { className: "card onboarding-card" },
      h(
        "div",
        { className: "api-setup-header" },
        h("span", { className: "badge badge-warn" }, t("onboard.step1Badge")),
        h("h2", { className: "card-title" }, t("onboard.step1Title"))
      ),
      h("p", { className: "card-desc" }, t("onboard.step1Desc")),
      h(
        "div",
        { className: "setup-checklist" },
        h(
          "div",
          { className: "setup-step setup-step-active" },
          h("span", { className: "step-pill step-pill-warn" }, "1"),
          h(
            "div",
            { className: "setup-step-body" },
            h("div", { className: "row-primary-text" }, t("onboard.step1Check1Title")),
            h("div", { className: "muted-micro" }, t("onboard.step1Check1Desc"))
          )
        ),
        h(
          "div",
          { className: "setup-step" },
          h("span", { className: "step-pill" }, "2"),
          h(
            "div",
            { className: "setup-step-body" },
            h("div", { className: "row-primary-text" }, t("onboard.step1Check2Title")),
            h("div", { className: "muted-micro" }, t("onboard.step1Check2Desc"))
          )
        )
      ),
      h(
        "div",
        { className: "action-row onboarding-links" },
        h(
          "a",
          {
            className: "btn btn-primary",
            href: installDocsUrl,
            target: "_blank",
            rel: "noopener noreferrer",
          },
          t("onboard.downloadInstallBtn")
        )
      ),
      renderCopyCommandBox(t("onboard.homebrewLabel"), brewInstallCmd),
      renderCopyCommandBox(t("onboard.signInAfterInstallLabel"), loginCmd),
      h(
        "div",
        { className: "action-row" },
        h(
          "button",
          {
            type: "button",
            className: "btn btn-primary",
            disabled: state.refreshing,
            onClick: () => {
              void loadData(true);
            },
          },
          state.refreshing ? t("common.checking") : t("onboard.recheckCliBtn")
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn",
            onClick: () => {
              void handleToggleDemoMode(true, t("toast.demoEnabled"));
            },
          },
          t("onboard.previewDemoBtn")
        )
      ),
      renderSettingsDetails(overview)
    );
  }

  // `gcloud` CLI is installed, but no active Google account is authenticated yet (or session expired)
  return h(
    "section",
    { className: "card onboarding-card" },
    h(
      "div",
      { className: "api-setup-header" },
      h("span", { className: "badge badge-warn" }, t("onboard.step2Badge")),
      h("h2", { className: "card-title" }, t("onboard.step2Title"))
    ),
    h("p", { className: "card-desc" }, t("onboard.step2Desc")),
    h(
      "div",
      { className: "setup-checklist" },
      h(
        "div",
        { className: "setup-step" },
        h("span", { className: "step-pill step-pill-done" }, "✓"),
        h(
          "div",
          { className: "setup-step-body" },
          h("div", { className: "row-primary-text" }, t("onboard.cliDetectedTitle")),
          h(
            "div",
            { className: "row-mono" },
            overview.auth.gcloudBinaryPath || "gcloud"
          )
        )
      ),
      h(
        "div",
        { className: "setup-step setup-step-active" },
        h("span", { className: "step-pill step-pill-warn" }, "2"),
        h(
          "div",
          { className: "setup-step-body" },
          h("div", { className: "row-primary-text" }, t("onboard.authAccountTitle")),
          h("div", { className: "muted-micro" }, t("onboard.authAccountDesc"))
        )
      )
    ),
    localizedHint ? h("div", { className: "callout callout-info" }, localizedHint) : null,
    h(
      "div",
      { className: "action-row onboarding-links" },
      h(
        "button",
        {
          type: "button",
          className: "btn btn-primary",
          disabled: state.signingInBrowser || state.refreshing,
          onClick: async () => {
            try {
              state.signingInBrowser = true;
              renderApp();
              showToast(t("toast.openingBrowserSignIn"), "info");
              const signedInOverview = await startBrowserLoginApi();
              applyFullOverview(signedInOverview);
              showToast(t("toast.signedInSuccess"), "success");
            } catch (err) {
              showToast(
                err instanceof Error ? err.message : t("toast.signInIncomplete"),
                "error"
              );
            } finally {
              state.signingInBrowser = false;
              renderApp();
            }
          },
        },
        state.signingInBrowser ? t("onboard.waitingBrowserBtn") : t("onboard.signInBrowserBtn")
      )
    ),
    renderCopyCommandBox(t("onboard.orRunInTerminal"), loginCmd),
    h(
      "div",
      { className: "action-row" },
      h(
        "button",
        {
          type: "button",
          className: "btn",
          disabled: state.refreshing || state.signingInBrowser,
          onClick: () => {
            void loadData(true);
          },
        },
        state.refreshing ? t("common.checking") : t("onboard.signedInRefreshBtn")
      ),
      h(
        "button",
        {
          type: "button",
          className: "btn",
          disabled: state.signingInBrowser,
          onClick: () => {
            void handleToggleDemoMode(true, t("toast.demoEnabled"));
          },
        },
        t("onboard.previewDemoBtn")
      )
    ),
    renderSettingsDetails(overview)
  );
}

function renderTabNav(overview: CompanionOverviewResponse): HTMLElement {
  const tabs: Array<{ id: ActiveTab; label: string; count?: number; loadingCount?: boolean }> = [
    { id: "overview", label: t("tabs.overview") },
    {
      id: "projects",
      label: t("tabs.projects"),
      count: state.domainLoaded.projects ? overview.summary.totalProjects : undefined,
      loadingCount: !state.domainLoaded.projects && state.domainLoading.projects,
    },
    {
      id: "billing",
      label: t("tabs.billing"),
      count: state.domainLoaded.billing ? overview.summary.totalBillingAccounts : undefined,
      loadingCount: !state.domainLoaded.billing && state.domainLoading.billing,
    },
  ];

  return h(
    "nav",
    { className: "tab-bar", role: "tablist", ariaLabel: t("tabs.ariaLabel") },
    ...tabs.map((tab) =>
      h(
        "button",
        {
          type: "button",
          role: "tab",
          ariaSelected: String(state.activeTab === tab.id),
          className: state.activeTab === tab.id ? "tab-btn tab-btn-active" : "tab-btn",
          onClick: () => {
            state.activeTab = tab.id;
            renderApp();
          },
        },
        tab.label,
        tab.count !== undefined
          ? h("span", { className: "tab-count" }, String(tab.count))
          : tab.loadingCount
            ? h("span", { className: "skeleton sk-tab-badge", ariaHidden: "true" })
            : null
      )
    )
  );
}

function formatLinkedProjectCount(count: number): string {
  return count === 1
    ? t("billing.projectCountOne")
    : t("billing.projectCountMany", { count });
}

interface MonthPillSummary {
  hasRows: boolean;
  settled: boolean;
  coveredDays: number;
  amountPreview: string;
}

interface ActiveSpendSelection {
  spend: SpendReport;
  selectedMonth: string;
  isCurrentMonth: boolean;
  availableMonths: string[];
  hasRows: boolean;
  hasAnyMonthRows: boolean;
  settled: boolean;
  coveredDays: number;
  monthMeta: Record<string, MonthPillSummary>;
}

function formatMonthLabel(yyyymm: string): string {
  return yyyymm.length === 6 ? `${yyyymm.slice(0, 4)}-${yyyymm.slice(4)}` : yyyymm;
}

function formatCompactPillSummary(totals: readonly CurrencyTotalSummary[]): string {
  if (totals.length === 0) return "—";
  return totals
    .map((tot) => {
      const net = Math.abs(tot.currentMonthNetCost) < 0.005 ? 0 : tot.currentMonthNetCost;
      const netStr = formatMoney(net, tot.currency);
      if (net <= 0.005 && tot.currentMonthGrossCost >= 0.005) {
        return `${netStr} (${formatMoney(tot.currentMonthGrossCost, tot.currency)})`;
      }
      return netStr;
    })
    .join(" · ");
}

function renderHeroStatusBadge(
  active: ActiveSpendSelection,
  total: CurrencyTotalSummary
): HTMLElement {
  if (active.isCurrentMonth) {
    return renderDeltaBadge(total.deltaPercentVsPrevSameDay);
  }
  const statusBadge = active.settled
    ? h("span", { className: "badge badge-good" }, t("spend.settledBadge"))
    : h(
        "span",
        { className: "badge badge-warn" },
        t("spend.backfillingBadge", {
          days: active.coveredDays || total.dailySeries.length || 0,
        })
      );
  if (
    active.settled &&
    total.deltaPercentVsPrevSameDay !== null &&
    Number.isFinite(total.deltaPercentVsPrevSameDay)
  ) {
    return h(
      "div",
      { className: "hero-badges-row" },
      statusBadge,
      renderDeltaBadge(total.deltaPercentVsPrevSameDay)
    );
  }
  return statusBadge;
}

function isCreditCoveredZeroNet(netCost: number, grossCost: number): boolean {
  return netCost <= 0.005 && grossCost >= 0.005;
}

function getProjectRankScore(ps: ProjectSpendSummary | undefined): number {
  if (!ps) return -Infinity;
  if (ps.currentMonthNetCost > 0.005) return ps.currentMonthNetCost;
  if (ps.currentMonthGrossCost >= 0.005) return ps.currentMonthGrossCost;
  return Math.abs(ps.currentMonthNetCost) < 0.005 ? 0 : ps.currentMonthNetCost;
}

function getActiveSpend(overview: CompanionOverviewResponse): ActiveSpendSelection {
  const baseSpend = overview.spend;
  const rawMonths =
    baseSpend.availableMonths && baseSpend.availableMonths.length > 0
      ? baseSpend.availableMonths
      : [baseSpend.invoiceMonth];
  const availableMonths = [...rawMonths];
  const byMonth = baseSpend.byMonth ?? {};
  const monthMeta: Record<string, MonthPillSummary> = {};
  let firstPopulatedMonth = "";

  for (const m of availableMonths) {
    const snap = byMonth[m];
    const mHasRows = snap
      ? snap.hasRows
      : m === baseSpend.invoiceMonth && baseSpend.totalsByCurrency.length > 0;
    const mTotals = snap
      ? snap.totalsByCurrency
      : m === baseSpend.invoiceMonth
        ? baseSpend.totalsByCurrency
        : [];
    const mSettled = Boolean(snap?.settled);
    const mCoveredDays = snap?.coveredDays ?? mTotals[0]?.dailySeries.length ?? 0;
    monthMeta[m] = {
      hasRows: mHasRows,
      settled: mSettled,
      coveredDays: mCoveredDays,
      amountPreview: mHasRows ? formatCompactPillSummary(mTotals) : "—",
    };
    if (mHasRows && !firstPopulatedMonth) {
      firstPopulatedMonth = m;
    }
  }

  let selectedMonth = state.selectedInvoiceMonth;
  if (!selectedMonth || !availableMonths.includes(selectedMonth)) {
    const currentSnap = byMonth[baseSpend.invoiceMonth];
    const currentHasRows = currentSnap
      ? currentSnap.hasRows
      : baseSpend.totalsByCurrency.length > 0;
    if (currentHasRows) {
      selectedMonth = baseSpend.invoiceMonth;
    } else if (firstPopulatedMonth) {
      selectedMonth = firstPopulatedMonth;
    } else {
      selectedMonth = availableMonths[0] ?? baseSpend.invoiceMonth;
    }
  }

  const activeSnap = byMonth[selectedMonth];
  const effectiveSpend: SpendReport = activeSnap
    ? {
        ...baseSpend,
        invoiceMonth: activeSnap.invoiceMonth,
        previousInvoiceMonth: activeSnap.previousInvoiceMonth,
        totalsByCurrency: activeSnap.totalsByCurrency,
        byBillingAccount: activeSnap.byBillingAccount,
        byProject: activeSnap.byProject,
      }
    : baseSpend;

  const hasRows = activeSnap ? activeSnap.hasRows : effectiveSpend.totalsByCurrency.length > 0;
  const hasAnyMonthRows = Boolean(firstPopulatedMonth) || baseSpend.totalsByCurrency.length > 0;

  return {
    spend: effectiveSpend,
    selectedMonth,
    isCurrentMonth: selectedMonth === baseSpend.invoiceMonth,
    availableMonths,
    hasRows,
    hasAnyMonthRows,
    settled: Boolean(activeSnap?.settled),
    coveredDays:
      activeSnap?.coveredDays ?? effectiveSpend.totalsByCurrency[0]?.dailySeries.length ?? 0,
    monthMeta,
  };
}

function renderMonthSwitcher(active: ActiveSpendSelection): HTMLElement | null {
  if (active.availableMonths.length <= 1) return null;
  return h(
    "div",
    {
      className: "month-switcher-bar",
      ariaLabel: t("overview.monthSelectorAria"),
    },
    ...active.availableMonths.map((ym) => {
      const selected = ym === active.selectedMonth;
      const meta = active.monthMeta[ym];
      const populated = Boolean(meta?.hasRows);
      const classes = ["month-pill"];
      if (selected) classes.push("month-pill-active");
      if (!populated) classes.push("month-pill-empty");
      return h(
        "button",
        {
          type: "button",
          className: classes.join(" "),
          ariaSelected: String(selected),
          onClick: () => {
            state.selectedInvoiceMonth = ym;
            renderApp();
          },
        },
        h(
          "span",
          { className: "month-pill-head" },
          meta?.settled ? `${formatMonthLabel(ym)} ✓` : formatMonthLabel(ym)
        ),
        h("span", { className: "month-pill-amt" }, meta?.amountPreview ?? "—")
      );
    })
  );
}

async function handleSwitchActiveProject(projectId: string, toastKey: "toast.activeProjectSet" | "toast.switchedProject"): Promise<void> {
  const prevActive = state.overview.auth.activeProject;
  state.enableTargetProject = "";
  state.overview = {
    ...state.overview,
    auth: {
      ...state.overview.auth,
      activeProject: projectId,
    },
  };
  recomputeDerivedOverview();
  renderApp();
  try {
    const updated = await switchActiveProject(projectId);
    applyLocalMutationOverview(updated);
    renderApp();
    showToast(t(toastKey, { project: projectId }), "success");
  } catch (err) {
    state.overview = {
      ...state.overview,
      auth: {
        ...state.overview.auth,
        activeProject: prevActive,
      },
    };
    recomputeDerivedOverview();
    renderApp();
    showToast(err instanceof Error ? err.message : t("toast.switchProjectFailed"), "error");
  }
}

async function handleTogglePinProject(projectId: string, nextPinned: boolean): Promise<void> {
  const prevPinned = [...state.overview.preferences.pinnedProjects];
  const nextSet = new Set(prevPinned);
  if (nextPinned) {
    nextSet.add(projectId);
  } else {
    nextSet.delete(projectId);
  }
  state.overview = {
    ...state.overview,
    preferences: {
      ...state.overview.preferences,
      pinnedProjects: Array.from(nextSet),
    },
  };
  recomputeDerivedOverview();
  renderApp();
  try {
    const updated = await togglePinProject(projectId, nextPinned);
    applyLocalMutationOverview(updated);
    renderApp();
  } catch (err) {
    state.overview = {
      ...state.overview,
      preferences: {
        ...state.overview.preferences,
        pinnedProjects: prevPinned,
      },
    };
    recomputeDerivedOverview();
    renderApp();
    showToast(err instanceof Error ? err.message : t("toast.pinUpdateFailed"), "error");
  }
}

function renderOverviewTab(overview: CompanionOverviewResponse): HTMLElement {
  const active = getActiveSpend(overview);
  const spend = active.spend;
  const sections: HTMLElement[] = [];

  if (state.domainLoaded.bootstrap && !overview.preferences.demoMode && !overview.auth.gcloudInstalled) {
    sections.push(
      h(
        "section",
        { className: "card warning-card" },
        h(
          "div",
          { className: "api-setup-header" },
          h("span", { className: "badge badge-warn" }, t("overview.cliRecommendedBadge")),
          h("h3", { className: "section-title" }, t("overview.cliNotFoundTitle"))
        ),
        h("p", { className: "card-desc" }, t("overview.cliNotFoundDesc")),
        h(
          "div",
          { className: "action-row" },
          h(
            "a",
            {
              className: "btn btn-primary btn-sm",
              href: "https://cloud.google.com/sdk/docs/install",
              target: "_blank",
              rel: "noopener noreferrer",
            },
            t("overview.installCliBtn")
          )
        )
      )
    );
  }

  if (!state.domainLoaded.bootstrap) {
    sections.push(renderHeroSpendSkeletonCard());
  } else if (isSpendExpected(overview) && !state.domainLoaded.spend) {
    if (state.domainErrors.spend) {
      sections.push(
        renderSectionErrorCard(state.domainErrors.spend, () => {
          void retrySpendDomain();
        })
      );
    } else {
      sections.push(renderHeroSpendSkeletonCard(t("loading.spend")));
      sections.push(renderBreakdownSkeletonCard());
    }
  } else if (spend.configured && active.hasAnyMonthRows) {
    const switcher = renderMonthSwitcher(active);
    if (switcher) {
      sections.push(switcher);
    }

    if (active.hasRows && spend.totalsByCurrency.length > 0) {
      for (const total of spend.totalsByCurrency) {
        sections.push(
          h(
            "section",
            { className: "card hero-spend-card card-hydrated" },
            h(
              "div",
              { className: "hero-top-row" },
              h(
                "span",
                { className: "eyebrow" },
                active.isCurrentMonth
                  ? t("overview.mtdNetSpend", {
                      month: formatMonthLabel(spend.invoiceMonth),
                    })
                  : t("overview.monthlyNetSpend", {
                      month: formatMonthLabel(spend.invoiceMonth),
                    })
              ),
              h(
                "div",
                { className: "hero-badges-row" },
                state.domainLoading.spend ? renderSectionLoadingPill(t("loading.spend")) : null,
                renderHeroStatusBadge(active, total)
              )
            ),
            h(
              "div",
              { className: "hero-amount" },
              formatMoney(total.currentMonthNetCost, total.currency)
            ),
            h(
              "div",
              { className: "hero-submetrics" },
              h(
                "span",
                { className: "submetric" },
                t("spend.gross", { amount: formatMoney(total.currentMonthGrossCost, total.currency) })
              ),
              h(
                "span",
                { className: "submetric submetric-credit" },
                t("spend.credits", { amount: formatMoney(total.currentMonthCredits, total.currency) })
              ),
              h(
                "span",
                { className: "submetric" },
                spend.previousInvoiceMonth
                  ? t("spend.monthTotalLabel", {
                      month: formatMonthLabel(spend.previousInvoiceMonth),
                      amount: formatMoney(total.prevMonthTotalNetCost, total.currency),
                    })
                  : t("spend.lastMonthTotal", {
                      amount: formatMoney(total.prevMonthTotalNetCost, total.currency),
                    })
              )
            ),
            renderDailySparkline(total.dailySeries, total.currency)
          )
        );
      }

      // Breakdown toggle: By Project vs By Billing Account vs By Service
      const projectNameById = new Map<string, string>();
      for (const p of overview.projects) {
        projectNameById.set(p.projectId, p.name);
      }
      const topProjectSummaries = Object.values(spend.byProject)
        .sort((a, b) => getProjectRankScore(b) - getProjectRankScore(a))
        .slice(0, 5);

      sections.push(
        h(
          "section",
          { className: "card card-hydrated" },
          h(
            "div",
            { className: "section-header-row" },
            h(
              "h3",
              { className: "section-title" },
              t("overview.spendBreakdownTitleForMonth", {
                month: formatMonthLabel(spend.invoiceMonth),
              })
            ),
            h(
              "div",
              { className: "segmented-mini" },
              h(
                "button",
                {
                  type: "button",
                  className:
                    state.overviewMode === "projects" ? "seg-btn seg-btn-active" : "seg-btn",
                  onClick: () => {
                    state.overviewMode = "projects";
                    renderApp();
                  },
                },
                t("overview.byProject")
              ),
              h(
                "button",
                {
                  type: "button",
                  className:
                    state.overviewMode === "accounts" ? "seg-btn seg-btn-active" : "seg-btn",
                  onClick: () => {
                    state.overviewMode = "accounts";
                    renderApp();
                  },
                },
                t("overview.byAccount")
              ),
              h(
                "button",
                {
                  type: "button",
                  className:
                    state.overviewMode === "services" ? "seg-btn seg-btn-active" : "seg-btn",
                  onClick: () => {
                    state.overviewMode = "services";
                    renderApp();
                  },
                },
                t("overview.byService")
              )
            )
          ),
          state.overviewMode === "projects"
            ? topProjectSummaries.length > 0
              ? h(
                  "div",
                  { className: "compact-list" },
                  ...topProjectSummaries.map((ps) => {
                    const displayName = projectNameById.get(ps.projectId) ?? ps.projectId;
                    return h(
                      "div",
                      {
                        className: "compact-row clickable-row",
                        onClick: () => {
                          state.activeTab = "projects";
                          state.expandedProjectIds.add(ps.projectId);
                          renderApp();
                        },
                      },
                      h(
                        "div",
                        { className: "compact-row-main" },
                        h("span", { className: "row-primary-text" }, displayName),
                        h("span", { className: "row-mono" }, ps.projectId)
                      ),
                      h(
                        "div",
                        { className: "compact-row-right" },
                        h(
                          "span",
                          { className: "amount-strong" },
                          formatMoney(ps.currentMonthNetCost, ps.currency)
                        ),
                        isCreditCoveredZeroNet(ps.currentMonthNetCost, ps.currentMonthGrossCost)
                          ? h(
                              "span",
                              { className: "muted-micro" },
                              t("chart.grossShort", {
                                amount: formatMoney(ps.currentMonthGrossCost, ps.currency),
                              })
                            )
                          : null,
                        ps.topServices[0]
                          ? h(
                              "span",
                              { className: "muted-micro" },
                              t("overview.topService", { service: ps.topServices[0].serviceName })
                            )
                          : null
                      )
                    );
                  })
                )
              : h("div", { className: "muted-note" }, t("overview.noProjectCosts"))
            : state.overviewMode === "services"
              ? renderServiceBreakdownList(
                  spend.totalsByCurrency[0]?.topServices ?? [],
                  spend.totalsByCurrency[0]?.currency ?? "USD"
                )
              : !state.domainLoaded.billing
                ? renderSectionLoadingPill(t("loading.billing"))
                : h(
                    "div",
                    { className: "compact-list" },
                    ...overview.billingAccounts.map((ba) => {
                      const bs = spend.byBillingAccount[ba.id];
                      return h(
                        "div",
                        {
                          className: "compact-row clickable-row",
                          onClick: () => {
                            state.activeTab = "billing";
                            renderApp();
                          },
                        },
                        h(
                          "div",
                          { className: "compact-row-main" },
                          h("span", { className: "row-primary-text" }, ba.displayName),
                          h(
                            "span",
                            { className: "row-mono" },
                            `${ba.id} · ${formatLinkedProjectCount(ba.linkedProjectCount)}`
                          )
                        ),
                        h(
                          "div",
                          { className: "compact-row-right" },
                          bs
                            ? h(
                                "span",
                                { className: "amount-strong" },
                                formatMoney(bs.currentMonthNetCost, bs.currency)
                              )
                            : h("span", { className: "muted-micro" }, t("overview.noBqRows")),
                          bs && isCreditCoveredZeroNet(bs.currentMonthNetCost, bs.currentMonthGrossCost)
                            ? h(
                                "span",
                                { className: "muted-micro" },
                                t("chart.grossShort", {
                                  amount: formatMoney(bs.currentMonthGrossCost, bs.currency),
                                })
                              )
                            : null,
                          h(
                            "span",
                            { className: ba.open ? "status-dot-open" : "status-dot-closed" },
                            ba.open ? t("billing.statusOpen") : t("billing.statusClosed")
                          )
                        )
                      );
                    })
                  )
        )
      );
    } else {
      const fallbackCurrency =
        overview.billingAccounts.find((b) => b.currencyCode)?.currencyCode || "USD";
      sections.push(
        h(
          "section",
          { className: "card hero-spend-card" },
          h(
            "div",
            { className: "hero-top-row" },
            h(
              "span",
              { className: "eyebrow" },
              active.isCurrentMonth
                ? t("overview.mtdNetSpend", {
                    month: formatMonthLabel(active.selectedMonth),
                  })
                : t("overview.monthlyNetSpend", {
                    month: formatMonthLabel(active.selectedMonth),
                  })
            )
          ),
          h("div", { className: "hero-amount" }, formatMoney(0, fallbackCurrency)),
          h(
            "p",
            { className: "month-no-rows-note" },
            t("overview.monthNoRowsYet", { month: formatMonthLabel(active.selectedMonth) })
          )
        )
      );
    }
  } else {
    const billingReady = state.domainLoaded.billing;
    const projectsReady = state.domainLoaded.projects;
    const billingOff = billingReady && isCloudBillingApiDisabled(overview);
    const billingApiPrompt = billingReady ? renderBillingApiSetupPrompt(overview) : null;
    // Progressive Base Mode card when BigQuery export isn't linked yet (or returned 0 rows)
    sections.push(
      h(
        "section",
        { className: "card kpi-strip" },
        h(
          "div",
          { className: "kpi-cell" },
          projectsReady
            ? h("span", { className: "kpi-num" }, String(overview.summary.totalProjects))
            : h("span", { className: "skeleton sk-kpi-num", ariaHidden: "true" }),
          h("span", { className: "kpi-label" }, t("overview.kpiActiveProjects"))
        ),
        h(
          "div",
          { className: "kpi-cell" },
          billingReady
            ? h(
                "span",
                { className: "kpi-num" },
                billingOff ? "—" : String(overview.summary.openBillingAccounts)
              )
            : h("span", { className: "skeleton sk-kpi-num", ariaHidden: "true" }),
          h(
            "span",
            { className: "kpi-label" },
            billingOff ? t("overview.kpiBillingApiOff") : t("overview.kpiOpenBillingAccts")
          )
        ),
        h(
          "div",
          { className: "kpi-cell" },
          projectsReady && billingReady
            ? h(
                "span",
                { className: "kpi-num" },
                billingOff ? "—" : String(overview.summary.unbilledProjects)
              )
            : h("span", { className: "skeleton sk-kpi-num", ariaHidden: "true" }),
          h(
            "span",
            { className: "kpi-label" },
            billingOff ? t("overview.kpiEnableApiBelow") : t("overview.kpiUnbilledSandbox")
          )
        )
      )
    );
    if (state.domainErrors.billing && !billingReady) {
      sections.push(
        renderSectionErrorCard(state.domainErrors.billing, () => {
          void retryBillingDomain();
        })
      );
    } else if (billingApiPrompt) {
      sections.push(billingApiPrompt);
    }
    sections.push(
      h(
        "section",
        { className: "card callout-card" },
        h(
          "h3",
          { className: "section-title" },
          spend.configured ? t("overview.bqWaitingTitle") : t("overview.unlockSpendTitle")
        ),
        h(
          "p",
          { className: "card-desc" },
          spend.configured
            ? t("overview.bqWaitingDesc", {
                tables: spend.queriedTables.join(", "),
                currentMonth: spend.invoiceMonth,
                prevMonth: spend.previousInvoiceMonth,
              })
            : t("overview.unlockSpendDesc")
        ),
        h(
          "div",
          { className: "action-row" },
          h(
            "button",
            {
              type: "button",
              className: "btn btn-primary btn-sm",
              onClick: () => {
                state.activeTab = "billing";
                renderApp();
              },
            },
            spend.configured ? t("overview.manageExportBtn") : t("overview.connectBqBtn")
          ),
          !overview.preferences.demoMode
            ? h(
                "button",
                {
                  type: "button",
                  className: "btn btn-sm",
                  onClick: () => {
                    void handleToggleDemoMode(true, t("toast.showingSampleSpend"));
                  },
                },
                t("overview.previewSampleBtn")
              )
            : null
        )
      )
    );
  }

  // Pinned & Active Projects Quick Access
  const quickProjects = overview.projects.filter((p) => p.pinned || p.isActiveProject);
  sections.push(
    h(
      "section",
      { className: "card" },
      h(
        "div",
        { className: "section-header-row" },
        h("h3", { className: "section-title" }, t("overview.pinnedAndActiveTitle")),
        !state.domainLoaded.projects && state.domainLoading.projects
          ? renderSectionLoadingPill(t("loading.projects"))
          : h(
              "button",
              {
                type: "button",
                className: "link-btn",
                onClick: () => {
                  state.activeTab = "projects";
                  state.projectFilter = "all";
                  state.projectPageLimit = PROJECT_PAGE_SIZE;
                  renderApp();
                },
              },
              t("overview.viewAllProjects", { count: overview.projects.length })
            )
      ),
      !state.domainLoaded.projects
        ? state.domainErrors.projects
          ? renderSectionErrorCard(state.domainErrors.projects, () => {
              void retryProjectsDomain();
            })
          : h(
              "div",
              { className: "compact-list", ariaBusy: "true", ariaHidden: "true" },
              ...Array.from({ length: 2 }, () =>
                h(
                  "div",
                  { className: "skeleton-row" },
                  h(
                    "div",
                    { className: "skeleton-stack" },
                    h("span", { className: "skeleton sk-line-md" }),
                    h("span", { className: "skeleton sk-line-sm" })
                  ),
                  h("span", { className: "skeleton sk-amt-sm" })
                )
              )
            )
        : quickProjects.length > 0
          ? h(
              "div",
              { className: "compact-list card-hydrated" },
              ...quickProjects.map((proj) => renderQuickProjectItem(proj, overview))
            )
          : h("div", { className: "muted-note" }, t("overview.pinEmptyHint"))
    )
  );

  // Warnings Banner (non-fatal API permissions or stale fallback notes)
  const remainingWarnings = getNonBillingApiWarnings(overview);
  const preferredProj = getPreferredConsoleProject(overview);
  if (remainingWarnings.length > 0) {
    sections.push(
      h(
        "section",
        { className: "card warning-card" },
        h("h3", { className: "section-title" }, t("overview.diagnosticsTitle")),
        ...remainingWarnings.map((w) => renderWarningLine(w, preferredProj))
      )
    );
  }

  return h("div", { className: "tab-panel" }, ...sections);
}

function renderWarningLine(warningText: string, fallbackProjectId?: string): HTMLElement {
  const urlMatch = /(https:\/\/console\.(?:cloud|developers)\.google\.com\/[^\s)]+)/.exec(
    warningText
  );
  if (!urlMatch) {
    return h("p", { className: "warning-line" }, warningText);
  }
  const consoleUrl = withConsoleProject(urlMatch[1], fallbackProjectId);
  const label = consoleUrl.includes("/iam-admin/")
    ? t("warnings.openIamConsole")
    : t("warnings.enableApiConsole");
  return h(
    "div",
    { className: "warning-line" },
    h("p", null, warningText),
    h(
      "div",
      { className: "action-row" },
      h(
        "a",
        {
          className: "btn btn-primary btn-sm",
          href: consoleUrl,
          target: "_blank",
          rel: "noopener noreferrer",
        },
        label
      )
    )
  );
}

function renderQuickProjectItem(
  proj: GcpProject,
  overview: CompanionOverviewResponse
): HTMLElement {
  const ps = getActiveSpend(overview).spend.byProject[proj.projectId];
  const billingSubtext = !state.domainLoaded.billing
    ? t("loading.billingStatus")
    : proj.billingAccountName || t("project.unbilledTag");
  const spendPending = !ps && isSpendExpected(overview) && !state.domainLoaded.spend;

  return h(
    "div",
    { className: "compact-row" },
    h(
      "div",
      { className: "compact-row-main" },
      h(
        "div",
        { className: "inline-badges" },
        proj.pinned ? h("span", { className: "star-active" }, "★") : null,
        h("span", { className: "row-primary-text" }, proj.name),
        proj.isActiveProject
          ? h("span", { className: "badge badge-active" }, t("project.activeBadge"))
          : null
      ),
      h("span", { className: "row-mono" }, `${proj.projectId} · ${billingSubtext}`)
    ),
    h(
      "div",
      { className: "compact-row-actions" },
      ps
        ? h(
            "div",
            { className: "project-spend-stack" },
            h(
              "span",
              { className: "amount-strong" },
              formatMoney(ps.currentMonthNetCost, ps.currency)
            ),
            isCreditCoveredZeroNet(ps.currentMonthNetCost, ps.currentMonthGrossCost)
              ? h(
                  "span",
                  { className: "muted-micro" },
                  t("chart.grossShort", {
                    amount: formatMoney(ps.currentMonthGrossCost, ps.currency),
                  })
                )
              : null
          )
        : spendPending
          ? h("span", { className: "skeleton sk-amt-sm", ariaHidden: "true" })
          : null,
      !proj.isActiveProject
        ? h(
            "button",
            {
              type: "button",
              className: "btn btn-xs",
              title: t("project.setActiveCmdTitle", { project: proj.projectId }),
              onClick: () => {
                void handleSwitchActiveProject(proj.projectId, "toast.activeProjectSet");
              },
            },
            t("project.setActiveBtn")
          )
        : null,
      h(
        "a",
        {
          className: "icon-link",
          href: `https://console.cloud.google.com/home/dashboard?project=${encodeURIComponent(proj.projectId)}`,
          target: "_blank",
          rel: "noopener noreferrer",
          title: t("project.openConsoleTitle"),
        },
        "↗"
      )
    )
  );
}

function getFilteredAndSortedProjects(overview: CompanionOverviewResponse): GcpProject[] {
  const searchLower = state.projectSearch.trim().toLowerCase();

  const filtered = overview.projects.filter((p) => {
    // In default "focus" mode without a search query, show only Active / Pinned / Expanded projects so the panel stays compact.
    // As soon as the user types in the search box, search across ALL projects automatically!
    if (state.projectFilter === "focus" && !searchLower) {
      return p.isActiveProject || p.pinned || state.expandedProjectIds.has(p.projectId);
    }
    if (state.projectFilter === "pinned" && !p.pinned) return false;
    if (state.projectFilter === "unbilled" && p.billingEnabled) return false;
    if (state.projectFilter.startsWith("ba:")) {
      const targetBa = state.projectFilter.slice(3);
      if (p.billingAccountId !== targetBa) return false;
    }
    if (!searchLower) return true;
    const labelStr = p.labels
      ? Object.entries(p.labels)
          .map(([k, v]) => `${k}:${v}`)
          .join(" ")
          .toLowerCase()
      : "";
    return (
      p.projectId.toLowerCase().includes(searchLower) ||
      p.name.toLowerCase().includes(searchLower) ||
      p.projectNumber.includes(searchLower) ||
      labelStr.includes(searchLower)
    );
  });

  const activeSpend = getActiveSpend(overview).spend;
  return [...filtered].sort((a, b) => {
    const psA = activeSpend.byProject[a.projectId];
    const psB = activeSpend.byProject[b.projectId];
    if (state.projectSort === "spend") {
      if (Boolean(psA) !== Boolean(psB)) return psA ? -1 : 1;
      const sa = getProjectRankScore(psA);
      const sb = getProjectRankScore(psB);
      if (sa !== sb) return sb - sa;
      return a.projectId.localeCompare(b.projectId);
    }
    if (state.projectSort === "name") {
      return a.name.localeCompare(b.name);
    }
    if (a.isActiveProject !== b.isActiveProject) return a.isActiveProject ? -1 : 1;
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (Boolean(psA) !== Boolean(psB)) return psA ? -1 : 1;
    const sa = getProjectRankScore(psA);
    const sb = getProjectRankScore(psB);
    if (sa !== sb) return sb - sa;
    return a.projectId.localeCompare(b.projectId);
  });
}

function renderProjectsTab(overview: CompanionOverviewResponse): HTMLElement {
  const focusCount = overview.projects.filter((p) => p.isActiveProject || p.pinned).length;
  const projectsReady = state.domainLoaded.projects;
  const billingReady = state.domainLoaded.billing;

  const filterChips: Array<{ key: string; label: string }> = [
    {
      key: "all",
      label: t("projects.filterAll", { count: projectsReady ? overview.projects.length : "…" }),
    },
    {
      key: "unbilled",
      label: t("projects.filterUnbilled", {
        count: projectsReady && billingReady ? overview.summary.unbilledProjects : "…",
      }),
    },
    {
      key: "focus",
      label: t("projects.filterFocus", { count: projectsReady ? focusCount : "…" }),
    },
  ];

  if (state.projectFilter.startsWith("ba:")) {
    const baId = state.projectFilter.slice(3);
    const matchedBa = overview.billingAccounts.find((b) => b.id === baId);
    const baLabel = matchedBa
      ? `${matchedBa.displayName} (${matchedBa.linkedProjectCount}) ×`
      : `${baId} ×`;
    filterChips.push({ key: state.projectFilter, label: baLabel });
  }

  const active = getActiveSpend(overview);
  const monthSwitcher =
    active.spend.configured && active.hasAnyMonthRows ? renderMonthSwitcher(active) : null;

  return h(
    "div",
    { className: "tab-panel" },
    monthSwitcher,
    h(
      "section",
      { className: "card filter-toolbar" },
      h(
        "div",
        { className: "search-sort-row" },
        h("input", {
          id: "project-search-input",
          type: "search",
          className: "search-input",
          placeholder: t("projects.searchPlaceholder"),
          value: state.projectSearch,
          ariaLabel: t("projects.searchAria"),
          onInput: (ev) => {
            state.projectSearch = (ev.target as HTMLInputElement).value;
            state.projectPageLimit = PROJECT_PAGE_SIZE;
            renderProjectsListOnly();
          },
        }),
        h(
          "select",
          {
            className: "compact-select",
            ariaLabel: t("projects.sortAria"),
            onChange: (ev) => {
              state.projectSort = (ev.target as HTMLSelectElement).value as ProjectSortMode;
              renderApp();
            },
          },
          h("option", { value: "smart", selected: state.projectSort === "smart" }, t("projects.sortSmart")),
          h(
            "option",
            { value: "spend", selected: state.projectSort === "spend" },
            t("projects.sortSpend")
          ),
          h("option", { value: "name", selected: state.projectSort === "name" }, t("projects.sortName"))
        )
      ),
      h(
        "div",
        { className: "chip-row" },
        ...filterChips.map((chip) =>
          h(
            "button",
            {
              type: "button",
              className:
                state.projectFilter === chip.key ? "filter-chip filter-chip-active" : "filter-chip",
              onClick: () => {
                if (state.projectFilter === chip.key && chip.key.startsWith("ba:")) {
                  state.projectFilter = "all";
                } else {
                  state.projectFilter = chip.key;
                }
                state.projectPageLimit = PROJECT_PAGE_SIZE;
                renderApp();
              },
            },
            chip.label
          )
        )
      )
    ),
    h(
      "div",
      { id: "projects-results-container", className: "stack-list" },
      ...buildProjectResultsNodes(overview)
    )
  );
}

function renderProjectsListOnly(): void {
  const container = document.getElementById("projects-results-container");
  if (!container) return;
  clearElement(container);
  for (const node of buildProjectResultsNodes(state.overview)) {
    container.appendChild(node);
  }
}

function buildProjectResultsNodes(overview: CompanionOverviewResponse): HTMLElement[] {
  if (!state.domainLoaded.projects) {
    if (state.domainErrors.projects) {
      return [
        renderSectionErrorCard(state.domainErrors.projects, () => {
          void retryProjectsDomain();
        }),
      ];
    }
    return renderProjectCardsSkeleton(4);
  }

  const filtered = getFilteredAndSortedProjects(overview);
  const isCompactDefault = state.projectFilter === "focus" && !state.projectSearch.trim();
  const totalProjects = overview.projects.length;

  // Empty compact state (e.g. 0 pinned & no active project yet, while projects exist)
  if (isCompactDefault && filtered.length === 0 && totalProjects > 0) {
    return [
      h(
        "div",
        { className: "card projects-more-bar" },
        h("span", { className: "muted-note" }, t("projects.focusEmptyPrompt", { total: totalProjects })),
        h(
          "button",
          {
            type: "button",
            className: "btn btn-xs",
            onClick: () => {
              state.projectFilter = "all";
              state.projectPageLimit = PROJECT_PAGE_SIZE;
              renderApp();
            },
          },
          t("projects.browseAllBtn", { total: totalProjects })
        )
      ),
    ];
  }

  const visible = filtered.slice(0, state.projectPageLimit);
  const nodes = buildProjectCards(visible, overview);
  const remainingInFilter = Math.max(0, filtered.length - visible.length);

  if (isCompactDefault && totalProjects > visible.length) {
    nodes.push(
      h(
        "div",
        { className: "card projects-more-bar" },
        h(
          "span",
          { className: "muted-micro" },
          t("projects.hiddenCompactHint", { shown: visible.length, total: totalProjects })
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn btn-xs",
            onClick: () => {
              if (remainingInFilter > 0) {
                state.projectPageLimit += PROJECT_PAGE_SIZE;
                renderProjectsListOnly();
              } else {
                state.projectFilter = "all";
                state.projectPageLimit = PROJECT_PAGE_SIZE;
                renderApp();
              }
            },
          },
          remainingInFilter > 0
            ? t("projects.showMoreBtn", { remaining: remainingInFilter })
            : t("projects.browseAllBtn", { total: totalProjects })
        )
      )
    );
  } else if (remainingInFilter > 0 || state.projectPageLimit > PROJECT_PAGE_SIZE) {
    const actionButtons: HTMLElement[] = [];
    if (remainingInFilter > 0) {
      actionButtons.push(
        h(
          "button",
          {
            type: "button",
            className: "btn btn-xs",
            onClick: () => {
              state.projectPageLimit += PROJECT_PAGE_SIZE;
              renderProjectsListOnly();
            },
          },
          t("projects.showMoreBtn", { remaining: remainingInFilter })
        )
      );
    }
    if (state.projectPageLimit > PROJECT_PAGE_SIZE) {
      actionButtons.push(
        h(
          "button",
          {
            type: "button",
            className: "btn btn-xs btn-ghost",
            onClick: () => {
              state.projectPageLimit = PROJECT_PAGE_SIZE;
              renderProjectsListOnly();
            },
          },
          t("projects.collapseListBtn")
        )
      );
    }
    if (actionButtons.length > 0) {
      nodes.push(
        h(
          "div",
          { className: "card projects-more-bar" },
          h("span", { className: "muted-micro" }, `${visible.length} / ${filtered.length}`),
          h("div", { className: "action-row" }, ...actionButtons)
        )
      );
    }
  }

  return nodes;
}

function buildProjectCards(
  projects: readonly GcpProject[],
  overview: CompanionOverviewResponse
): HTMLElement[] {
  if (projects.length === 0) {
    return [
      h("div", { className: "card muted-note" }, t("projects.emptyFilter")),
    ];
  }

  const activeSpend = getActiveSpend(overview).spend;
  const defaultCurrency =
    activeSpend.totalsByCurrency[0]?.currency ||
    overview.billingAccounts.find((b) => b.currencyCode)?.currencyCode ||
    "USD";

  return projects.map((proj) => {
    const expanded = state.expandedProjectIds.has(proj.projectId);
    const ps = activeSpend.byProject[proj.projectId];
    const encodedId = encodeURIComponent(proj.projectId);

    const toggleExpand = () => {
      if (state.expandedProjectIds.has(proj.projectId)) {
        state.expandedProjectIds.delete(proj.projectId);
      } else {
        state.expandedProjectIds.add(proj.projectId);
      }
      renderApp();
    };

    const labelEntries = proj.labels ? Object.entries(proj.labels).slice(0, 6) : [];

    return h(
      "article",
      { className: proj.isActiveProject ? "card project-card project-card-active" : "card project-card" },
      h(
        "div",
        { className: "project-card-top" },
        h(
          "button",
          {
            type: "button",
            className: proj.pinned ? "pin-btn pin-btn-on" : "pin-btn",
            title: proj.pinned ? t("project.unpinTitle") : t("project.pinTitle"),
            ariaLabel: proj.pinned
              ? t("project.unpinAria", { project: proj.projectId })
              : t("project.pinAria", { project: proj.projectId }),
            onClick: (ev) => {
              ev.stopPropagation();
              void handleTogglePinProject(proj.projectId, !proj.pinned);
            },
          },
          proj.pinned ? "★" : "☆"
        ),
        h(
          "div",
          {
            className: "project-title-group",
            onClick: toggleExpand,
          },
          h(
            "div",
            { className: "inline-badges" },
            h("span", { className: "project-name" }, proj.name),
            proj.isActiveProject
              ? h("span", { className: "badge badge-active" }, t("project.activeBadge"))
              : null
          ),
          h(
            "div",
            { className: "project-meta-line" },
            h(
              "button",
              {
                type: "button",
                className: "mono-copy-btn",
                title: t("project.copyIdTitle"),
                onClick: async (ev) => {
                  ev.stopPropagation();
                  const ok = await copyToClipboard(proj.projectId);
                  showToast(ok ? t("toast.copied", { value: proj.projectId }) : proj.projectId, "info");
                },
              },
              `${proj.projectId} ⧉`
            ),
            !state.domainLoaded.billing
              ? h("span", { className: "billing-tag" }, t("loading.billingStatus"))
              : proj.billingEnabled && proj.billingAccountName
                ? h("span", { className: "billing-tag" }, proj.billingAccountName)
                : h("span", { className: "billing-tag billing-tag-off" }, t("project.noBillingTag"))
          )
        ),
        h(
          "div",
          { className: "project-right-col" },
          ps
            ? h(
                "div",
                { className: "project-spend-stack" },
                h(
                  "span",
                  { className: "amount-strong" },
                  formatMoney(ps.currentMonthNetCost, ps.currency)
                ),
                isCreditCoveredZeroNet(ps.currentMonthNetCost, ps.currentMonthGrossCost)
                  ? h(
                      "span",
                      { className: "muted-micro" },
                      t("chart.grossShort", {
                        amount: formatMoney(ps.currentMonthGrossCost, ps.currency),
                      })
                    )
                  : null
              )
            : isSpendExpected(overview) && !state.domainLoaded.spend
              ? h("span", { className: "skeleton sk-amt-sm", ariaHidden: "true" })
              : activeSpend.configured
                ? h("span", { className: "muted-micro" }, formatMoney(0, defaultCurrency))
                : null,
          h(
            "div",
            { className: "project-btn-group" },
            !proj.isActiveProject
              ? h(
                  "button",
                  {
                    type: "button",
                    className: "btn btn-xs",
                    onClick: (ev) => {
                      ev.stopPropagation();
                      void handleSwitchActiveProject(proj.projectId, "toast.switchedProject");
                    },
                  },
                  t("project.setActiveBtn")
                )
              : null,
            h(
              "button",
              {
                type: "button",
                className: "btn btn-xs btn-ghost",
                ariaExpanded: String(expanded),
                onClick: (ev) => {
                  ev.stopPropagation();
                  toggleExpand();
                },
              },
              expanded ? t("project.hideBtn") : t("project.detailsBtn")
            )
          )
        )
      ),
      expanded
        ? h(
            "div",
            { className: "project-drawer" },
            h(
              "div",
              { className: "drawer-meta-row" },
              h(
                "span",
                { className: "muted-micro" },
                t("project.projectNumber", { number: proj.projectNumber || "—" })
              ),
              proj.billingAccountId
                ? h(
                    "span",
                    { className: "muted-micro" },
                    t("project.billingId", { id: proj.billingAccountId })
                  )
                : null,
              ...labelEntries.map(([k, v]) =>
                h("span", { className: "label-chip" }, `${k}:${v}`)
              )
            ),
            ps
              ? h(
                  "div",
                  { className: "drawer-spend-block" },
                  h(
                    "div",
                    { className: "drawer-spend-summary" },
                    h(
                      "span",
                      null,
                      t("spend.gross", { amount: formatMoney(ps.currentMonthGrossCost, ps.currency) })
                    ),
                    h(
                      "span",
                      { className: "submetric-credit" },
                      t("spend.credits", { amount: formatMoney(ps.currentMonthCredits, ps.currency) })
                    ),
                    renderDeltaBadge(ps.deltaPercentVsPrevSameDay)
                  ),
                  renderServiceBreakdownList(ps.topServices, ps.currency)
                )
              : isSpendExpected(overview) && !state.domainLoaded.spend
                ? renderSectionLoadingPill(t("loading.spend"))
                : h(
                    "div",
                    { className: "muted-note" },
                    overview.spend.configured
                      ? t("project.noBqCostThisMonth")
                      : t("project.connectBqForCosts")
                  ),
            h(
              "div",
              { className: "console-links-row" },
              h(
                "a",
                {
                  className: "console-chip",
                  href: `https://console.cloud.google.com/home/dashboard?project=${encodedId}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                t("project.linkDashboard")
              ),
              h(
                "a",
                {
                  className: "console-chip",
                  href: proj.billingAccountId
                    ? `https://console.cloud.google.com/billing/${encodeURIComponent(proj.billingAccountId)}/reports;projects=${encodedId}`
                    : `https://console.cloud.google.com/billing?project=${encodedId}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                t("project.linkBillingReport")
              ),
              h(
                "a",
                {
                  className: "console-chip",
                  href: `https://console.cloud.google.com/run?project=${encodedId}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                t("project.linkCloudRun")
              ),
              h(
                "a",
                {
                  className: "console-chip",
                  href: `https://console.cloud.google.com/bigquery?project=${encodedId}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                t("project.linkBigQuery")
              ),
              h(
                "a",
                {
                  className: "console-chip",
                  href: `https://console.cloud.google.com/logs/query?project=${encodedId}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                t("project.linkLogs")
              )
            )
          )
        : null
    );
  });
}

function renderLinkedProjectsForBillingAccount(
  ba: BillingAccount,
  overview: CompanionOverviewResponse
): HTMLElement {
  if (ba.linkedProjectIds.length === 0) {
    return h(
      "div",
      { className: "linked-projects-empty muted-micro" },
      t("billing.noLinkedProjects")
    );
  }

  const projectMap = new Map<string, GcpProject>();
  for (const p of overview.projects) {
    projectMap.set(p.projectId, p);
  }

  const isLinkedExpanded = state.expandedBillingLinkedIds.has(ba.id);
  const visibleProjectIds = isLinkedExpanded
    ? ba.linkedProjectIds
    : ba.linkedProjectIds.slice(0, LINKED_PROJECTS_PREVIEW_LIMIT);

  const activeSpend = getActiveSpend(overview).spend;
  const rows = visibleProjectIds.map((projId) => {
    const proj = projectMap.get(projId);
    const ps = activeSpend.byProject[projId];
    const displayName = proj ? proj.name : projId;
    const isActive = proj ? proj.isActiveProject : overview.auth.activeProject === projId;

    return h(
      "div",
      { className: "compact-row linked-project-row" },
      h(
        "div",
        { className: "compact-row-main" },
        h(
          "div",
          { className: "inline-badges" },
          proj?.pinned ? h("span", { className: "star-active" }, "★") : null,
          h("span", { className: "row-primary-text" }, displayName),
          isActive ? h("span", { className: "badge badge-active" }, t("billing.activeUpperBadge")) : null
        ),
        h("span", { className: "row-mono" }, projId)
      ),
      h(
        "div",
        { className: "compact-row-actions" },
        ps
          ? h(
              "div",
              { className: "project-spend-stack" },
              h(
                "span",
                { className: "amount-strong" },
                formatMoney(ps.currentMonthNetCost, ps.currency)
              ),
              isCreditCoveredZeroNet(ps.currentMonthNetCost, ps.currentMonthGrossCost)
                ? h(
                    "span",
                    { className: "muted-micro" },
                    t("chart.grossShort", {
                      amount: formatMoney(ps.currentMonthGrossCost, ps.currency),
                    })
                  )
                : null
            )
          : isSpendExpected(overview) && !state.domainLoaded.spend
            ? h("span", { className: "skeleton sk-amt-sm", ariaHidden: "true" })
            : null,
        !isActive
          ? h(
              "button",
              {
                type: "button",
                className: "btn btn-xs",
                title: t("billing.setActiveTitle", { project: projId }),
                onClick: () => {
                  void handleSwitchActiveProject(projId, "toast.activeProjectSet");
                },
              },
              t("project.setActiveBtn")
            )
          : null,
        h(
          "a",
          {
            className: "icon-link",
            href: `https://console.cloud.google.com/home/dashboard?project=${encodeURIComponent(
              projId
            )}`,
            target: "_blank",
            rel: "noopener noreferrer",
            title: t("billing.openProjectConsoleTitle", { project: projId }),
          },
          "↗"
        )
      )
    );
  });

  return h(
    "div",
    { className: "linked-projects-block" },
    h(
      "div",
      { className: "linked-projects-header" },
      h(
        "span",
        { className: "eyebrow" },
        t("billing.linkedProjectsHeader", { count: ba.linkedProjectIds.length })
      ),
      h(
        "button",
        {
          type: "button",
          className: "link-btn",
        onClick: () => {
            state.activeTab = "projects";
            state.projectFilter = `ba:${ba.id}`;
            state.projectPageLimit = PROJECT_PAGE_SIZE;
            renderApp();
          },
        },
        t("billing.filterInProjectsBtn")
      )
    ),
    h("div", { className: "compact-list" }, ...rows),
    ba.linkedProjectIds.length > LINKED_PROJECTS_PREVIEW_LIMIT
      ? h(
          "button",
          {
            type: "button",
            className: "btn btn-xs btn-ghost linked-projects-more",
            onClick: () => {
              if (isLinkedExpanded) {
                state.expandedBillingLinkedIds.delete(ba.id);
              } else {
                state.expandedBillingLinkedIds.add(ba.id);
              }
              renderApp();
            },
          },
          isLinkedExpanded
            ? t("projects.collapseListBtn")
            : t("billing.showAllLinkedBtn", { count: ba.linkedProjectIds.length })
        )
      : null
  );
}

function renderBillingAccountCard(
  ba: BillingAccount,
  overview: CompanionOverviewResponse
): HTMLElement {
  const active = getActiveSpend(overview);
  const bs = active.spend.byBillingAccount[ba.id];

  return h(
    "article",
    { className: ba.open ? "card billing-card" : "card billing-card billing-card-closed" },
    h(
      "div",
      { className: "billing-header-row" },
      h(
        "div",
        null,
        h(
          "div",
          { className: "inline-badges" },
          h("h3", { className: "section-title" }, ba.displayName),
          h(
            "span",
            { className: ba.open ? "badge badge-active" : "badge badge-neutral" },
            ba.open ? t("billing.statusOpen") : t("billing.statusClosed")
          ),
          ba.currencyCode
            ? h("span", { className: "badge badge-neutral" }, ba.currencyCode)
            : null
        ),
        h(
          "div",
          { className: "project-meta-line" },
          h(
            "button",
            {
              type: "button",
              className: "mono-copy-btn",
              title: t("billing.copyIdTitle"),
              onClick: async () => {
                const ok = await copyToClipboard(ba.id);
                showToast(ok ? t("toast.copied", { value: ba.id }) : ba.id, "info");
              },
            },
            `${ba.id} ⧉`
          ),
          h(
            "span",
            { className: "muted-micro" },
            formatLinkedProjectCount(ba.linkedProjectCount)
          )
        )
      ),
      h(
        "a",
        {
          className: "btn btn-xs",
          href: withConsoleProject(
            `https://console.cloud.google.com/billing/${encodeURIComponent(ba.id)}/reports`,
            ba.linkedProjectIds[0] || getPreferredConsoleProject(overview)
          ),
          target: "_blank",
          rel: "noopener noreferrer",
        },
        t("billing.consoleReportBtn")
      )
    ),
    renderLinkedProjectsForBillingAccount(ba, overview),
    bs
      ? h(
          "div",
          { className: "billing-spend-box" },
          h(
            "div",
            { className: "billing-spend-top" },
            h(
              "div",
              null,
              h(
                "div",
                { className: "eyebrow" },
                active.isCurrentMonth
                  ? t("billing.mtdNetLabel")
                  : t("overview.monthlyNetSpend", {
                      month: formatMonthLabel(active.selectedMonth),
                    })
              ),
              h(
                "div",
                { className: "billing-net-figure" },
                formatMoney(bs.currentMonthNetCost, bs.currency)
              )
            ),
            renderDeltaBadge(bs.deltaPercentVsPrevSameDay)
          ),
          h(
            "div",
            { className: "hero-submetrics" },
            h(
              "span",
              null,
              t("spend.gross", { amount: formatMoney(bs.currentMonthGrossCost, bs.currency) })
            ),
            h(
              "span",
              { className: "submetric-credit" },
              t("spend.credits", { amount: formatMoney(bs.currentMonthCredits, bs.currency) })
            ),
            h(
              "span",
              null,
              t("spend.lastMonthShort", {
                amount: formatMoney(bs.prevMonthTotalNetCost, bs.currency),
              })
            )
          ),
          renderDailySparkline(bs.dailySeries, bs.currency),
          renderServiceBreakdownList(bs.topServices.slice(0, 4), bs.currency)
        )
      : ba.open && ba.exportTableId && !state.domainLoaded.spend && state.domainLoading.spend
        ? h(
            "div",
            { className: "billing-spend-box", ariaBusy: "true" },
            renderSectionLoadingPill(t("loading.spend")),
            h("div", { className: "skeleton sk-hero-amt", ariaHidden: "true" })
          )
        : ba.open
          ? h(
              "div",
              { className: "muted-note billing-export-hint" },
              ba.exportTableId
                ? t("billing.boundNoRows", { table: ba.exportTableId })
                : t("billing.linkExportHint")
            )
          : null,
    ba.budgets.length > 0
      ? h(
          "div",
          { className: "budgets-block" },
          h("div", { className: "eyebrow" }, t("billing.configuredBudgets", { count: ba.budgets.length })),
          ...ba.budgets.map((b) => {
            const targetText =
              b.amountUnits !== null
                ? formatMoney(b.amountUnits, b.currencyCode || bs?.currency || "USD")
                : b.lastPeriodAmount
                  ? t("billing.budgetLastPeriod")
                  : t("billing.budgetCustomTarget");
            const rulesText =
              b.thresholds.length > 0
                ? b.thresholds
                    .map((rule) => `${Math.round(rule.thresholdPercent * 100)}%`)
                    .join(" · ")
                : t("billing.budgetNoThresholds");
            return h(
              "div",
              { className: "budget-row" },
              h("span", { className: "budget-name" }, b.displayName),
              h("span", { className: "budget-meta" }, `${targetText} (${rulesText})`)
            );
          })
        )
      : ba.open && state.domainLoading.budgets && !state.domainLoaded.budgets
        ? h(
            "div",
            { className: "budgets-block" },
            renderSectionLoadingPill(t("loading.budgets"))
          )
        : null
  );
}

function renderBillingExportSetupCard(overview: CompanionOverviewResponse): HTMLElement {
  const existingMappings = Object.values(overview.preferences.billingExportTables);

  const projectSuggestions = overview.projects.map((p) =>
    h(
      "option",
      {
        value: p.projectId,
        selected: p.projectId === state.discoverHostProject,
      },
      `${p.name} (${p.projectId})`
    )
  );

  const accountTargetOptions = [
    h(
      "option",
      { value: "*", selected: state.manualBillingAccountId === "*" },
      t("export.allAccountsOption")
    ),
    ...overview.billingAccounts.map((ba) =>
      h(
        "option",
        { value: ba.id, selected: state.manualBillingAccountId === ba.id },
        `${ba.displayName} (${ba.id})`
      )
    ),
  ];

  return h(
    "section",
    { className: "card" },
    h("h3", { className: "section-title" }, t("export.title")),
    h("p", { className: "card-desc" }, t("export.desc")),
    existingMappings.length > 0
      ? h(
          "div",
          { className: "mapped-tables-list" },
          ...existingMappings.map((m) =>
            h(
              "div",
              { className: "mapped-table-row" },
              h(
                "div",
                { className: "compact-row-main" },
                h(
                  "span",
                  { className: "row-primary-text" },
                  m.billingAccountId === "*"
                    ? t("export.sharedMapping")
                    : t("export.accountMapping", { id: m.billingAccountId })
                ),
                h("span", { className: "row-mono" }, m.tableId)
              ),
              h(
                "button",
                {
                  type: "button",
                  className: "btn btn-xs btn-danger-outline",
                  onClick: async () => {
                    try {
                      state.selectedInvoiceMonth = "";
                      const updated = await configureExportTableApi({
                        billingAccountId: m.billingAccountId,
                        remove: true,
                      });
                      applyFullOverview(updated);
                      renderApp();
                      showToast(t("toast.removedExportMapping"), "info");
                    } catch (err) {
                      showToast(
                        err instanceof Error ? err.message : t("toast.removeExportFailed"),
                        "error"
                      );
                    }
                  },
                },
                t("export.unlinkBtn")
              )
            )
          )
        )
      : null,

    // Step 1: Auto-Detect in a Host Project
    h(
      "div",
      { className: "setup-subbox" },
      h("div", { className: "eyebrow" }, t("export.autoDetectLabel")),
      overview.projects.length > 0
        ? h("datalist", { id: "host-projects-datalist" }, ...projectSuggestions)
        : null,
      h(
        "div",
        { className: "form-inline-row" },
        h("input", {
          id: "export-host-input",
          type: "text",
          list: overview.projects.length > 0 ? "host-projects-datalist" : undefined,
          className: "text-input flex-1",
          placeholder: t("export.hostProjectPlaceholder"),
          value: state.discoverHostProject,
          ariaLabel: t("export.hostProjectAria"),
          onInput: (ev) => {
            state.discoverHostProject = (ev.target as HTMLInputElement).value;
          },
        }),
        h(
          "button",
          {
            type: "button",
            className: "btn btn-sm",
            disabled: state.discoveringTables,
            onClick: async () => {
              const host = state.discoverHostProject.trim();
              if (!host) {
                showToast(t("toast.enterHostProject"), "error");
                return;
              }
              try {
                state.discoveringTables = true;
                renderApp();
                state.discoveredTables = await discoverExportTablesApi(host);
                if (state.discoveredTables.length === 0) {
                  showToast(t("toast.noExportTablesFound", { project: host }), "info");
                } else {
                  showToast(
                    t("toast.foundExportTables", { count: state.discoveredTables.length }),
                    "success"
                  );
                }
              } catch (err) {
                showToast(
                  err instanceof Error ? err.message : t("toast.discoveryFailed"),
                  "error"
                );
              } finally {
                state.discoveringTables = false;
                renderApp();
              }
            },
          },
          state.discoveringTables ? t("export.scanningBtn") : t("export.scanDatasetsBtn")
        )
      ),
      state.discoveredTables && state.discoveredTables.length > 0
        ? h(
            "div",
            { className: "discovered-list" },
            ...state.discoveredTables.map((tbl) =>
              h(
                "div",
                { className: "mapped-table-row" },
                h(
                  "div",
                  { className: "compact-row-main" },
                  h(
                    "span",
                    { className: "row-primary-text" },
                    `${tbl.datasetId}.${tbl.tableName} (${tbl.exportType})`
                  ),
                  h(
                    "span",
                    { className: "row-mono" },
                    tbl.inferredBillingAccountId
                      ? t("export.matchesBillingId", { id: tbl.inferredBillingAccountId })
                      : t("export.sharedCustomExport")
                  )
                ),
                h(
                  "button",
                  {
                    type: "button",
                    className: "btn btn-xs btn-primary",
                    onClick: async () => {
                      try {
                        state.refreshing = true;
                        renderApp();
                        state.selectedInvoiceMonth = "";
                        const updated = await configureExportTableApi({
                          billingAccountId: tbl.inferredBillingAccountId || "*",
                          tableId: tbl.tableId,
                          hostProjectId: tbl.hostProjectId,
                        });
                        applyFullOverview(updated);
                        showToast(t("toast.connectedExport"), "success");
                      } catch (err) {
                        showToast(
                          err instanceof Error ? err.message : t("toast.connectExportFailed"),
                          "error"
                        );
                      } finally {
                        state.refreshing = false;
                        renderApp();
                      }
                    },
                  },
                  t("export.linkAndQueryBtn")
                )
              )
            )
          )
        : null
    ),

    // Step 2: Manual Table Reference Input
    h(
      "form",
      {
        className: "setup-subbox",
        onSubmit: async () => {
          const tableId = state.manualTableId.trim();
          if (!tableId) {
            showToast(t("toast.enterTableId"), "error");
            return;
          }
          try {
            state.refreshing = true;
            renderApp();
            state.selectedInvoiceMonth = "";
            const updated = await configureExportTableApi({
              billingAccountId: state.manualBillingAccountId || "*",
              tableId,
            });
            applyFullOverview(updated);
            state.manualTableId = "";
            showToast(t("toast.savedExportTable"), "success");
          } catch (err) {
            showToast(err instanceof Error ? err.message : t("toast.invalidTableRef"), "error");
          } finally {
            state.refreshing = false;
            renderApp();
          }
        },
      },
      h("div", { className: "eyebrow" }, t("export.manualBindLabel")),
      h(
        "select",
        {
          className: "compact-select full-width",
          ariaLabel: t("export.targetAccountAria"),
          onChange: (ev) => {
            state.manualBillingAccountId = (ev.target as HTMLSelectElement).value;
          },
        },
        ...accountTargetOptions
      ),
      h(
        "div",
        { className: "form-inline-row" },
        h("input", {
          id: "export-manual-table-input",
          type: "text",
          className: "text-input flex-1",
          placeholder: "project_id.dataset.gcp_billing_export_v1_XXXXXX_XXXXXX_XXXXXX",
          value: state.manualTableId,
          onInput: (ev) => {
            state.manualTableId = (ev.target as HTMLInputElement).value;
          },
        }),
        h(
          "button",
          { type: "submit", className: "btn btn-sm btn-primary", disabled: state.refreshing },
          t("export.saveBtn")
        )
      )
    ),

    h(
      "details",
      { className: "help-details" },
      h("summary", null, t("export.helpSummary")),
      h(
        "ol",
        { className: "guide-steps" },
        h("li", null, t("export.helpStep1")),
        h("li", null, t("export.helpStep2")),
        h("li", null, t("export.helpStep3")),
        h("li", null, t("export.helpStep4"))
      ),
      h(
        "a",
        {
          className: "link-external",
          href: withConsoleProject(
            "https://console.cloud.google.com/billing",
            state.discoverHostProject.trim() || getPreferredConsoleProject(overview)
          ),
          target: "_blank",
          rel: "noopener noreferrer",
        },
        t("export.openBillingConsole")
      )
    )
  );
}

function renderPluginUpdateSection(overview: CompanionOverviewResponse): HTMLElement {
  const upd = overview.pluginUpdate;
  const currentVersion = upd?.currentVersion || "1.1.0";
  const autoUpdate = overview.preferences.autoUpdatePlugin !== false;

  const statusBadge =
    upd?.restartRequired && upd.updatedToVersion
      ? h(
          "span",
          { className: "badge badge-good" },
          t("update.statusUpdatedRestart", { version: upd.updatedToVersion })
        )
      : upd?.updateAvailable && upd.latestVersion
        ? h(
            "span",
            { className: "badge badge-warn" },
            t("update.statusAvailable", { version: upd.latestVersion })
          )
        : h("span", { className: "badge badge-neutral" }, t("update.statusUpToDate"));

  return h(
    "div",
    { className: "settings-section" },
    h("div", { className: "eyebrow" }, t("update.sectionTitle")),
    h(
      "div",
      { className: "update-status-box" },
      h(
        "div",
        { className: "update-status-row" },
        h(
          "span",
          { className: "row-mono" },
          t("update.currentVersionLabel", { version: currentVersion })
        ),
        statusBadge
      ),
      h(
        "label",
        { className: "settings-toggle-row" },
        h("span", null, t("update.autoUpdateToggle")),
        h("input", {
          type: "checkbox",
          checked: autoUpdate,
          onChange: async (ev) => {
            const nextAuto = (ev.target as HTMLInputElement).checked;
            try {
              const updated = await updateCompanionPreferences({ autoUpdatePlugin: nextAuto });
              applyLocalMutationOverview(updated);
              renderApp();
            } catch (err) {
              showToast(
                err instanceof Error ? err.message : t("toast.prefUpdateFailed"),
                "error"
              );
            }
          },
        })
      ),
      h(
        "div",
        { className: "action-row" },
        upd?.updateAvailable && upd.latestVersion && !upd.restartRequired
          ? h(
              "button",
              {
                type: "button",
                className: "btn btn-xs btn-primary",
                disabled: state.applyingPluginUpdate,
                onClick: () => handleInstallPluginUpdate(),
              },
              state.applyingPluginUpdate
                ? t("update.installingBtn")
                : t("update.installBtn", { version: upd.latestVersion })
            )
          : null,
        h(
          "button",
          {
            type: "button",
            className: "btn btn-xs",
            disabled: state.checkingPluginUpdate || state.applyingPluginUpdate,
            onClick: () => handleCheckPluginUpdate(),
          },
          state.checkingPluginUpdate ? t("update.checkingBtn") : t("update.checkBtn")
        )
      )
    )
  );
}

function renderSettingsBodyContent(overview: CompanionOverviewResponse): HTMLElement[] {
  const currentHours = overview.preferences.cacheTtlHours;
  const mask = overview.preferences.maskEmails;
  const quotaInputVal =
    state.settingsQuotaDraft !== null
      ? state.settingsQuotaDraft
      : overview.preferences.quotaProjectOverride || "";
  const gcloudPathVal =
    state.settingsGcloudDraft !== null
      ? state.settingsGcloudDraft
      : overview.preferences.gcloudPathOverride || "";

  return [
    h(
      "label",
      { className: "field-label" },
      t("settings.languageLabel"),
      renderLanguageSelect()
    ),
    h(
      "label",
      { className: "field-label" },
      t("settings.cacheTtlLabel"),
      h(
        "select",
        {
          className: "compact-select full-width",
          onChange: async (ev) => {
            const hrs = Number((ev.target as HTMLSelectElement).value);
            const updated = await updateCompanionPreferences({ cacheTtlHours: hrs });
            applyLocalMutationOverview(updated);
            renderApp();
            showToast(t("toast.cacheTtlSet", { hours: hrs }), "success");
          },
        },
        ...[1, 6, 12, 24].map((hr) =>
          h(
            "option",
            { value: String(hr), selected: Math.round(currentHours) === hr },
            hr === 6
              ? t("settings.hoursRecommended")
              : hr === 1
                ? t("settings.hourOne")
                : t("settings.hoursMany", { hours: hr })
          )
        )
      )
    ),
    h(
      "div",
      { className: "settings-section" },
      h("div", { className: "eyebrow" }, t("settings.privacySection")),
      h(
        "label",
        { className: "settings-toggle-row" },
        h("span", null, t("settings.maskEmailToggle")),
        h("input", {
          type: "checkbox",
          checked: mask,
          onChange: async (ev) => {
            const nextMask = (ev.target as HTMLInputElement).checked;
            try {
              const updated = await updateCompanionPreferences({ maskEmails: nextMask });
              applyLocalMutationOverview(updated);
              renderApp();
            } catch (err) {
              showToast(
                err instanceof Error ? err.message : t("toast.prefUpdateFailed"),
                "error"
              );
            }
          },
        })
      ),
      h(
        "button",
        {
          type: "button",
          className: "btn btn-sm full-width",
          onClick: () => {
            const nextDemo = !overview.preferences.demoMode;
            void handleToggleDemoMode(nextDemo, nextDemo ? t("toast.demoOn") : t("toast.demoOff"));
          },
        },
        overview.preferences.demoMode ? t("settings.switchToLiveBtn") : t("settings.enableDemoBtn")
      )
    ),
    renderPluginUpdateSection(overview),
    h(
      "details",
      { className: "settings-advanced-details" },
      h("summary", { className: "settings-summary" }, t("settings.advancedSummary")),
      h(
        "div",
        { className: "settings-body" },
        h(
          "label",
          { className: "field-label" },
          t("settings.quotaProjectLabel"),
          h("input", {
            id: "settings-quota-input",
            type: "text",
            className: "text-input full-width",
            placeholder: t("settings.quotaProjectPlaceholder"),
            value: quotaInputVal,
            onInput: (ev) => {
              state.settingsQuotaDraft = (ev.target as HTMLInputElement).value;
            },
          })
        ),
        h(
          "label",
          { className: "field-label" },
          t("settings.gcloudPathLabel"),
          h("input", {
            id: "settings-gcloud-input",
            type: "text",
            className: "text-input full-width",
            placeholder: "/opt/homebrew/bin/gcloud",
            value: gcloudPathVal,
            onInput: (ev) => {
              state.settingsGcloudDraft = (ev.target as HTMLInputElement).value;
            },
          })
        ),
        h(
          "div",
          { className: "action-row" },
          h(
            "button",
            {
              type: "button",
              className: "btn btn-sm btn-primary",
              onClick: async () => {
                try {
                  const nextQuota =
                    (state.settingsQuotaDraft !== null ? state.settingsQuotaDraft : quotaInputVal)
                      .trim() || null;
                  const nextGcloud =
                    (state.settingsGcloudDraft !== null ? state.settingsGcloudDraft : gcloudPathVal)
                      .trim() || null;
                  const boot = await updateCloudPreferencesProgressive({
                    quotaProjectOverride: nextQuota,
                    gcloudPathOverride: nextGcloud,
                  });
                  state.settingsQuotaDraft = null;
                  state.settingsGcloudDraft = null;
                  state.overview = {
                    ...state.overview,
                    auth: boot.auth,
                    preferences: boot.preferences,
                    pluginUpdate: boot.pluginUpdate ?? state.overview.pluginUpdate,
                  };
                  showToast(t("toast.savedSettings"), "success");
                  await loadData(false, { resetSections: true });
                } catch (err) {
                  showToast(
                    err instanceof Error ? err.message : t("toast.invalidSettings"),
                    "error"
                  );
                }
              },
            },
            t("settings.applyBtn")
          )
        )
      )
    ),
  ];
}

function renderSettingsMenuOverlay(overview: CompanionOverviewResponse): HTMLElement | null {
  if (!state.settingsMenuOpen) return null;

  return h(
    "div",
    {
      className: "settings-backdrop",
      onClick: (ev) => {
        if (ev.target === ev.currentTarget) {
          state.settingsMenuOpen = false;
          renderApp();
        }
      },
    },
    h(
      "section",
      {
        className: "settings-menu-panel",
        role: "dialog",
        ariaLabel: t("settings.menuTitle"),
      },
      h(
        "div",
        { className: "settings-menu-header" },
        h("h3", { className: "settings-menu-title" }, `⚙ ${t("settings.menuTitle")}`),
        h(
          "button",
          {
            type: "button",
            className: "icon-btn",
            ariaLabel: t("settings.closeBtnAria"),
            title: t("settings.closeBtnAria"),
            onClick: () => {
              state.settingsMenuOpen = false;
              renderApp();
            },
          },
          "✕"
        )
      ),
      ...renderSettingsBodyContent(overview)
    )
  );
}

function renderSettingsDetails(overview: CompanionOverviewResponse): HTMLElement {
  return h(
    "details",
    { className: "card settings-details" },
    h("summary", { className: "settings-summary" }, t("settings.summary")),
    h("div", { className: "settings-body" }, ...renderSettingsBodyContent(overview))
  );
}

function renderBillingTab(overview: CompanionOverviewResponse): HTMLElement {
  const billingReady = state.domainLoaded.billing;
  const billingApiPrompt = billingReady ? renderBillingApiSetupPrompt(overview) : null;
  const otherWarnings = getNonBillingApiWarnings(overview);
  const warningSection =
    otherWarnings.length > 0
      ? h(
          "section",
          { className: "card warning-card" },
          h("h3", { className: "section-title" }, t("billing.diagnosticsTitle")),
          ...otherWarnings.map((w) => renderWarningLine(w, getPreferredConsoleProject(overview)))
        )
      : null;

  const active = getActiveSpend(overview);
  const primaryAccounts = overview.billingAccounts.filter(
    (ba) => ba.open || ba.linkedProjectCount > 0 || Boolean(active.spend.byBillingAccount[ba.id])
  );
  const inactiveClosedAccounts = overview.billingAccounts.filter(
    (ba) => !ba.open && ba.linkedProjectCount === 0 && !active.spend.byBillingAccount[ba.id]
  );

  return h(
    "div",
    { className: "tab-panel" },
    billingApiPrompt,
    warningSection,
    active.spend.configured && active.hasAnyMonthRows ? renderMonthSwitcher(active) : null,
    !billingReady
      ? state.domainErrors.billing
        ? renderSectionErrorCard(state.domainErrors.billing, () => {
            void retryBillingDomain();
          })
        : renderBillingCardsSkeleton(2)
      : overview.billingAccounts.length > 0
        ? h(
            "div",
            { className: "stack-list card-hydrated" },
            ...primaryAccounts.map((ba) => renderBillingAccountCard(ba, overview)),
            inactiveClosedAccounts.length > 0
              ? h(
                  "details",
                  {
                    className: "card closed-accounts-details",
                    ...(primaryAccounts.length === 0 ? { open: "open" } : {}),
                  } as Record<string, unknown>,
                  h(
                    "summary",
                    { className: "settings-summary" },
                    t("billing.closedAccountsSummary", { count: inactiveClosedAccounts.length })
                  ),
                  h(
                    "div",
                    { className: "stack-list closed-accounts-list" },
                    ...inactiveClosedAccounts.map((ba) => renderBillingAccountCard(ba, overview))
                  )
                )
              : null
          )
        : billingApiPrompt
          ? null
          : h("div", { className: "card muted-note" }, t("billing.noAccountsVisible")),
    renderBillingExportSetupCard(overview),
    renderSettingsDetails(overview)
  );
}

interface SavedInputFocus {
  id: string;
  selectionStart: number | null;
  selectionEnd: number | null;
}

function captureFocusedInput(): SavedInputFocus | null {
  if (typeof document === "undefined" || !document) return null;
  const active = (document as { activeElement?: unknown }).activeElement;
  if (!active || !(active instanceof HTMLInputElement) || !active.id) {
    return null;
  }
  let selectionStart: number | null = null;
  let selectionEnd: number | null = null;
  try {
    selectionStart = typeof active.selectionStart === "number" ? active.selectionStart : null;
    selectionEnd = typeof active.selectionEnd === "number" ? active.selectionEnd : null;
  } catch {
    // Some input types (e.g. checkbox) do not support selectionStart
  }
  return { id: active.id, selectionStart, selectionEnd };
}

function restoreFocusedInput(saved: SavedInputFocus | null): void {
  if (!saved || typeof document === "undefined" || !document) return;
  const next = document.getElementById(saved.id);
  if (!next || !(next instanceof HTMLInputElement)) return;
  if (typeof next.focus === "function") {
    try {
      next.focus({ preventScroll: true });
    } catch {
      next.focus();
    }
  }
  if (
    saved.selectionStart !== null &&
    saved.selectionEnd !== null &&
    typeof next.setSelectionRange === "function"
  ) {
    try {
      next.setSelectionRange(saved.selectionStart, saved.selectionEnd);
    } catch {
      // Ignore input types that disallow selection ranges
    }
  }
}

function renderApp(): void {
  if (typeof document === "undefined" || !document) return;
  if (document.documentElement) {
    document.documentElement.lang = getActiveLocale();
  }

  const root = document.getElementById("app");
  if (!root) return;
  const savedFocus = captureFocusedInput();
  clearElement(root);

  const overview = state.overview;
  root.appendChild(renderHeader(overview));
  const settingsOverlay = renderSettingsMenuOverlay(overview);
  if (settingsOverlay) {
    root.appendChild(settingsOverlay);
  }

  if (state.domainErrors.bootstrap && !state.domainLoaded.bootstrap) {
    root.appendChild(
      h(
        "main",
        { className: "main-body" },
        h(
          "div",
          { className: "card error-card" },
          h("h2", { className: "card-title" }, t("boot.errorTitle")),
          h("p", { className: "card-desc" }, state.domainErrors.bootstrap || t("boot.unknownError")),
          h(
            "button",
            {
              type: "button",
              className: "btn btn-primary",
              onClick: () => {
                void loadData(false);
              },
            },
            t("boot.retry")
          )
        )
      )
    );
    bindLogoSources(root);
    restoreFocusedInput(savedFocus);
    return;
  }

  if (state.domainLoaded.bootstrap && !overview.auth.authenticated && !overview.preferences.demoMode) {
    root.appendChild(h("main", { className: "main-body" }, renderUnauthenticatedView(overview)));
    bindLogoSources(root);
    restoreFocusedInput(savedFocus);
    return;
  }

  root.appendChild(renderTabNav(overview));

  let activeContent: HTMLElement;
  if (state.activeTab === "projects") {
    activeContent = renderProjectsTab(overview);
  } else if (state.activeTab === "billing") {
    activeContent = renderBillingTab(overview);
  } else {
    activeContent = renderOverviewTab(overview);
  }

  root.appendChild(
    h(
      "main",
      {
        className: "main-body",
        ariaBusy: isAnyCoreDomainLoading() ? "true" : undefined,
      },
      activeContent
    )
  );
  bindLogoSources(root);
  restoreFocusedInput(savedFocus);
}

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("keydown", (ev: KeyboardEvent) => {
    if (ev.key === "Escape" && state.settingsMenuOpen) {
      state.settingsMenuOpen = false;
      renderApp();
    }
  });
}

void loadData(false);
