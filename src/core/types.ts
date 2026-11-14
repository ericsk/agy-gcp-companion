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

export interface ProjectSpendSummary {
  projectId: string;
  billingAccountId: string;
  currency: string;
  currentMonthGrossCost: number;
  currentMonthCredits: number;
  currentMonthNetCost: number;
  prevMonthSameDayNetCost: number;
  prevMonthTotalNetCost: number;
  deltaPercentVsPrevSameDay: number | null;
  topServices: ServiceCostItem[];
  dailySeries: DailySpendPoint[];
}

export interface BillingAccountSpendSummary {
  billingAccountId: string;
  currency: string;
  currentMonthGrossCost: number;
  currentMonthCredits: number;
  currentMonthNetCost: number;
  prevMonthSameDayNetCost: number;
  prevMonthTotalNetCost: number;
  deltaPercentVsPrevSameDay: number | null;
  topServices: ServiceCostItem[];
  dailySeries: DailySpendPoint[];
}

export interface CurrencyTotalSummary {
  currency: string;
  currentMonthGrossCost: number;
  currentMonthCredits: number;
  currentMonthNetCost: number;
  prevMonthSameDayNetCost: number;
  prevMonthTotalNetCost: number;
  deltaPercentVsPrevSameDay: number | null;
  topServices: ServiceCostItem[];
  dailySeries: DailySpendPoint[];
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
  };
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
