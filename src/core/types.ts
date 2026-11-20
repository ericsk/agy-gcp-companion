export interface GcloudAccount {
  account: string;
  maskedAccount: string;
  active: boolean;
}

export interface AuthStatus {
  authenticated: boolean;
  source: "gcloud" | "adc" | "demo" | "none";
  gcloudInstalled: boolean;
  gcloudBinaryPath: string | null;
  activeAccount: string | null;
  maskedActiveAccount: string | null;
  activeProject: string | null;
  accounts: GcloudAccount[];
  setupHint: string | null;
}

export interface GcpProject {
  projectId: string;
  projectNumber: string;
  name: string;
  lifecycleState: string;
  createTime?: string;
  labels?: Record<string, string>;
  billingAccountId: string | null;
  billingAccountName: string | null;
  billingEnabled: boolean;
  pinned: boolean;
  isActiveProject: boolean;
}

export interface BudgetThresholdRule {
  thresholdPercent: number;
  spendBasis: string;
}

export interface BudgetInfo {
  name: string;
  displayName: string;
  billingAccountId: string;
  amountUnits: number | null;
  currencyCode: string | null;
  lastPeriodAmount: boolean;
  projectFilterIds: string[];
  thresholds: BudgetThresholdRule[];
}

export interface BillingAccount {
  id: string; // e.g. "01ABCD-234567-89EFGH"
  resourceName: string; // e.g. "billingAccounts/01ABCD-234567-89EFGH"
  displayName: string;
  open: boolean;
  masterBillingAccount?: string;
  currencyCode?: string;
  linkedProjectCount: number;
  linkedProjectIds: string[];
  budgets: BudgetInfo[];
  exportTableId: string | null;
}

export interface BillingExportMapping {
  billingAccountId: string; // normalized ID or "*" for shared export table
  tableId: string; // project.dataset.table
  hostProjectId: string;
  exportType: "standard" | "detailed" | "custom";
  addedAt: string;
}

export interface DiscoveredBillingTable {
  tableId: string;
  hostProjectId: string;
  datasetId: string;
  tableName: string;
  inferredBillingAccountId: string | null;
  exportType: "standard" | "detailed";
  creationTime?: string;
}

export interface DailySpendPoint {
  date: string; // YYYY-MM-DD
  grossCost: number;
  creditsAmount: number;
  netCost: number;
}

export interface ServiceCostItem {
  serviceName: string;
  grossCost: number;
  creditsAmount: number;
  netCost: number;
  sharePercent: number;
}

export type SpendForecastWarning =
  | "partial-day-excluded"
  | "sparse-series"
  | "stale-data"
  | "credits-not-guaranteed"
  | "negative-adjustments"
  | "cross-month-usage";

export interface SpendForecastSummary {
  invoiceMonth: string; // YYYYMM
  method: "calendar-day-run-rate-v1";
  dateBasis: "utc-usage-date-within-invoice-month";
  status: "estimated" | "insufficient-data" | "no-current-month-data" | "historical";
  daysInMonth: number;
  elapsedCalendarDays: number;
  observedDays: number;
  rateThroughDate: string | null;
  excludedTodayUtc: boolean;
  grossDailyRunRate: number | null;
  netDailyRunRate: number | null;
  monthEndGrossCost: number | null;
  monthEndNetCost: number | null;
  creditsNotGuaranteed: boolean;
  warnings: SpendForecastWarning[];
}

export interface PriorMonthRunRateReference {
  sourceInvoiceMonth: string; // YYYYMM
  currency: string;
  coveredDays: number;
  grossPerCoveredDay: number;
  netPerCoveredDay: number;
}

export interface ProjectSpendSummary {
  projectId: string;
  billingAccountId: string;
  currency: string;
  currentMonthGrossCost: number;
  currentMonthCredits: number;
  currentMonthNetCost: number;
  prevMonthSameDayNetCost: number;
  prevMonthTotalNetCost: number;
  prevMonthGrossCost?: number;
  prevMonthCredits?: number;
  deltaPercentVsPrevSameDay: number | null;
  topServices: ServiceCostItem[];
  dailySeries: DailySpendPoint[];
  forecast?: SpendForecastSummary;
  priorMonthRunRateReference?: PriorMonthRunRateReference;
}

export interface BillingAccountSpendSummary {
  billingAccountId: string;
  currency: string;
  currentMonthGrossCost: number;
  currentMonthCredits: number;
  currentMonthNetCost: number;
  prevMonthSameDayNetCost: number;
  prevMonthTotalNetCost: number;
  prevMonthGrossCost?: number;
  prevMonthCredits?: number;
  deltaPercentVsPrevSameDay: number | null;
  topServices: ServiceCostItem[];
  dailySeries: DailySpendPoint[];
  forecast?: SpendForecastSummary;
  priorMonthRunRateReference?: PriorMonthRunRateReference;
}

export interface CurrencyTotalSummary {
  currency: string;
  currentMonthGrossCost: number;
  currentMonthCredits: number;
  currentMonthNetCost: number;
  prevMonthSameDayNetCost: number;
  prevMonthTotalNetCost: number;
  prevMonthGrossCost?: number;
  prevMonthCredits?: number;
  deltaPercentVsPrevSameDay: number | null;
  topServices: ServiceCostItem[];
  dailySeries: DailySpendPoint[];
  forecast?: SpendForecastSummary;
  priorMonthRunRateReference?: PriorMonthRunRateReference;
}

export interface MonthlySpendSnapshot {
  invoiceMonth: string; // YYYYMM
  previousInvoiceMonth: string; // YYYYMM
  hasRows: boolean;
  rowCount: number;
  settled?: boolean;
  coveredDays?: number;
  totalsByCurrency: CurrencyTotalSummary[];
  byBillingAccount: Record<string, BillingAccountSpendSummary>;
  byProject: Record<string, ProjectSpendSummary>;
}

export interface SpendReport {
  configured: boolean;
  invoiceMonth: string; // YYYYMM
  previousInvoiceMonth: string; // YYYYMM
  queriedTables: string[];
  queriedAt: string;
  totalsByCurrency: CurrencyTotalSummary[];
  byBillingAccount: Record<string, BillingAccountSpendSummary>;
  byProject: Record<string, ProjectSpendSummary>;
  availableMonths?: string[];
  byMonth?: Record<string, MonthlySpendSnapshot>;
}

export type LocaleCode = "en" | "es" | "fr" | "ja" | "ko" | "zh-CN" | "zh-TW";
export type LocalePreference = "auto" | LocaleCode;

export interface PluginUpdateStatus {
  currentVersion: string;
  latestVersion: string | null;
  updateAvailable: boolean;
  updatedToVersion: string | null;
  restartRequired: boolean;
  autoUpdate: boolean;
  lastCheckedAt: string | null;
  releaseUrl: string;
  error: string | null;
}

export interface CompanionPreferences {
  pinnedProjects: string[];
  billingExportTables: Record<string, BillingExportMapping>;
  cacheTtlMs: number;
  maskEmails: boolean;
  gcloudPathOverride: string | null;
  quotaProjectOverride: string | null;
  lastWorkingQuotaProject?: string | null;
  demoMode: boolean;
  locale?: LocalePreference;
  autoUpdatePlugin?: boolean;
}

export interface ProjectBillingLinkInfo {
  billingAccountId: string;
  billingEnabled: boolean;
}

export interface ProjectBillingUpdateResult {
  projectId: string;
  previousBillingAccountId: string | null;
  previousBillingAccountName: string | null;
  billingAccountId: string;
  billingAccountName: string;
  billingEnabled: boolean;
  unchanged: boolean;
}

export interface ProjectDeleteResult {
  projectId: string;
  projectName: string;
  wasActiveProject: boolean;
  hadBillingEnabled: boolean;
  demoSimulated: boolean;
  pendingDeletionConsoleUrl: string;
}

export interface ProjectBillingChangePreview {
  status: "confirmation_required";
  projectId: string;
  projectName: string;
  currentBillingAccount: {
    id: string | null;
    displayName: string | null;
    billingEnabled: boolean;
  };
  targetBillingAccount: {
    id: string;
    displayName: string;
    open: boolean | null;
    currencyCode?: string;
    foundInCache: boolean;
  };
  unchanged: boolean;
  warnings: string[];
  nextStep: string;
}

export interface CachedCloudSnapshot {
  version: number;
  accountKey: string;
  fetchedAt: string;
  projects: Array<{
    projectId: string;
    projectNumber: string;
    name: string;
    lifecycleState: string;
    createTime?: string;
    labels?: Record<string, string>;
    billingAccountId: string | null;
    billingEnabled: boolean;
  }>;
  billingAccounts: Array<{
    id: string;
    resourceName: string;
    displayName: string;
    open: boolean;
    masterBillingAccount?: string;
    currencyCode?: string;
    linkedProjectIds: string[];
    budgets: BudgetInfo[];
  }>;
  spendReport: SpendReport | null;
  warnings: string[];
  sectionsFetchedAt?: {
    projects?: string;
    billing?: string;
    budgets?: string;
    spend?: string;
  };
  projectBillingLinks?: Record<string, ProjectBillingLinkInfo>;
  closedBillingAccounts?: Record<string, string>;
  sectionWarnings?: {
    projects?: string[];
    billing?: string[];
    budgets?: string[];
    spend?: string[];
  };
}

export interface CompanionOverviewResponse {
  auth: AuthStatus;
  preferences: {
    pinnedProjects: string[];
    billingExportTables: Record<string, BillingExportMapping>;
    cacheTtlHours: number;
    maskEmails: boolean;
    gcloudPathOverride: string | null;
    quotaProjectOverride: string | null;
    demoMode: boolean;
    locale: LocalePreference;
    autoUpdatePlugin: boolean;
  };
  pluginUpdate?: PluginUpdateStatus;
  cache: {
    hit: boolean;
    stale: boolean;
    fetchedAt: string | null;
    ageMs: number | null;
    ttlMs: number;
  };
  summary: {
    totalProjects: number;
    billedProjects: number;
    unbilledProjects: number;
    pinnedProjectsCount: number;
    totalBillingAccounts: number;
    openBillingAccounts: number;
    spendConfigured: boolean;
  };
  projects: GcpProject[];
  billingAccounts: BillingAccount[];
  spend: SpendReport;
  warnings: string[];
}

export interface CompanionBootstrapResponse {
  auth: AuthStatus;
  preferences: CompanionOverviewResponse["preferences"];
  pluginUpdate?: PluginUpdateStatus;
  spendConfigured: boolean;
  cachedOverview: CompanionOverviewResponse | null;
}

export interface CompanionProjectsResponse {
  authenticated: boolean;
  authExpired?: boolean;
  auth?: AuthStatus;
  projects: GcpProject[];
  cache: CompanionOverviewResponse["cache"];
  warnings: string[];
}

export interface CompanionBillingResponse {
  authenticated: boolean;
  authExpired?: boolean;
  auth?: AuthStatus;
  billingAccounts: BillingAccount[];
  projectBillingLinks: Record<string, ProjectBillingLinkInfo>;
  budgetsLoaded: boolean;
  cache: CompanionOverviewResponse["cache"];
  warnings: string[];
}

export interface CompanionBudgetsResponse {
  authenticated: boolean;
  budgetsByAccount: Record<string, BudgetInfo[]>;
  warnings: string[];
}

export interface CompanionSpendResponse {
  authenticated: boolean;
  authExpired?: boolean;
  auth?: AuthStatus;
  spend: SpendReport;
  cache: CompanionOverviewResponse["cache"];
  warnings: string[];
}
