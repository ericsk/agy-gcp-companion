import { runWithConcurrency } from "./gcp-api.ts";
import type { FetchLike } from "./gcloud.ts";
import {
  normalizeBillingAccountId,
  sanitizeErrorMessage,
  validateBigQueryTableId,
  validateProjectId,
} from "./security.ts";
import type {
  BillingAccountSpendSummary,
  BillingExportMapping,
  CurrencyTotalSummary,
  DailySpendPoint,
  DiscoveredBillingTable,
  MonthlySpendSnapshot,
  ProjectSpendSummary,
  ServiceCostItem,
  SpendReport,
} from "./types.ts";

const STANDARD_EXPORT_PREFIX = "gcp_billing_export_v1_";
const DETAILED_EXPORT_PREFIX = "gcp_billing_export_resource_v1_";

export function inferBillingAccountFromTableName(
  tableName: string
): { billingAccountId: string | null; exportType: "standard" | "detailed" } | null {
  const lower = tableName.toLowerCase();
  let rawSuffix = "";
  let exportType: "standard" | "detailed" = "standard";

  if (lower.startsWith(DETAILED_EXPORT_PREFIX)) {
    exportType = "detailed";
    rawSuffix = tableName.slice(DETAILED_EXPORT_PREFIX.length);
  } else if (lower.startsWith(STANDARD_EXPORT_PREFIX)) {
    exportType = "standard";
    rawSuffix = tableName.slice(STANDARD_EXPORT_PREFIX.length);
  } else {
    return null;
  }

  const candidate = rawSuffix.replace(/_/g, "-").toUpperCase();
  try {
    return {
      billingAccountId: normalizeBillingAccountId(candidate),
      exportType,
    };
  } catch {
    return { billingAccountId: null, exportType };
  }
}

export async function discoverBillingExportTables(
  accessToken: string,
  hostProjectId: string,
  quotaProject?: string | null,
  fetchFn: FetchLike = globalThis.fetch
): Promise<DiscoveredBillingTable[]> {
  const validProject = validateProjectId(hostProjectId);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "x-goog-user-project": quotaProject || validProject,
  };

  const dsUrl = `https://bigquery.googleapis.com/bigquery/v2/projects/${encodeURIComponent(validProject)}/datasets?maxResults=200`;
  const dsRes = await fetchFn(dsUrl, {
    method: "GET",
    headers,
    signal: AbortSignal.timeout(15_000),
  });
  if (!dsRes.ok) {
    let detail = `HTTP ${dsRes.status}`;
    try {
      const errBody = (await dsRes.json()) as { error?: { message?: string } };
      if (errBody?.error?.message) detail = `${detail}: ${errBody.error.message}`;
    } catch {
      // Ignore
    }
    throw new Error(`Failed to list BigQuery datasets in ${validProject} (${sanitizeErrorMessage(detail)})`);
  }

  const dsJson = (await dsRes.json()) as {
    datasets?: Array<{ datasetReference?: { datasetId?: string } }>;
  };
  const datasetIds = (dsJson.datasets ?? [])
    .map((d) => d.datasetReference?.datasetId)
    .filter((id): id is string => Boolean(id));

  const discovered: DiscoveredBillingTable[] = [];

  await runWithConcurrency(datasetIds, 5, async (datasetId) => {
    const tblUrl = `https://bigquery.googleapis.com/bigquery/v2/projects/${encodeURIComponent(validProject)}/datasets/${encodeURIComponent(datasetId)}/tables?maxResults=500`;
    const tblRes = await fetchFn(tblUrl, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(15_000),
    });
    if (!tblRes.ok) return;
    const tblJson = (await tblRes.json()) as {
      tables?: Array<{
        tableReference?: { tableId?: string };
        creationTime?: string;
      }>;
    };
    for (const t of tblJson.tables ?? []) {
      const tableName = t.tableReference?.tableId;
      if (!tableName) continue;
      const inferred = inferBillingAccountFromTableName(tableName);
      if (!inferred) continue;
      discovered.push({
        tableId: `${validProject}.${datasetId}.${tableName}`,
        hostProjectId: validProject,
        datasetId,
        tableName,
        inferredBillingAccountId: inferred.billingAccountId,
        exportType: inferred.exportType,
        creationTime: t.creationTime,
      });
    }
  });

  // Prefer Standard export (lighter & faster scan) over Detailed resource export
  discovered.sort((a, b) => {
    if (a.exportType !== b.exportType) {
      return a.exportType === "standard" ? -1 : 1;
    }
    return a.tableId.localeCompare(b.tableId);
  });

  return discovered;
}

export interface DateWindowContext {
  currentInvoiceMonth: string; // YYYYMM
  previousInvoiceMonth: string; // YYYYMM
  recentInvoiceMonths: string[]; // descending: newest 6 months (e.g. ["202611", ..., "202606"])
  minInvoiceMonth: string; // oldest in recentInvoiceMonths
  partitionStartTimestamp: string; // YYYY-MM-01T00:00:00Z (first day of minInvoiceMonth)
  dayOfMonthCutoff: number; // 1..31 for fair Month-to-Date vs Prev-Month-Same-Day comparison
}

export function getDaysInInvoiceMonth(yyyymm: string): number {
  const year = Number(yyyymm.slice(0, 4));
  const monthIndex = Number(yyyymm.slice(4, 6)) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return 30;
  }
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function shiftInvoiceMonth(yyyymm: string, deltaMonths: number): string {
  const year = Number(yyyymm.slice(0, 4));
  const monthIndex = Number(yyyymm.slice(4, 6)) - 1;
  const shifted = new Date(Date.UTC(year, monthIndex + deltaMonths, 1));
  return `${shifted.getUTCFullYear()}${String(shifted.getUTCMonth() + 1).padStart(2, "0")}`;
}

function isHistoricalMonthSettled(
  targetMonth: string,
  currentInvoiceMonth: string,
  hasRows: boolean,
  coveredDays: number,
  sameMonthMaxDay: number,
  laterMonthCoveredDays: number
): boolean {
  if (targetMonth >= currentInvoiceMonth || !hasRows) {
    return false;
  }
  if (coveredDays < 25 && sameMonthMaxDay < 28) {
    return false;
  }
  if (laterMonthCoveredDays < 1) {
    return false;
  }
  const immediatePrevMonth = shiftInvoiceMonth(currentInvoiceMonth, -1);
  if (targetMonth === immediatePrevMonth && laterMonthCoveredDays < 2) {
    return false;
  }
  return true;
}

export function computeBillingDateWindow(referenceDate: Date = new Date()): DateWindowContext {
  const year = referenceDate.getUTCFullYear();
  const monthIndex = referenceDate.getUTCMonth(); // 0..11
  const dayOfMonth = referenceDate.getUTCDate();

  const currentInvoiceMonth = `${year}${String(monthIndex + 1).padStart(2, "0")}`;
  const recentInvoiceMonths = Array.from({ length: 6 }, (_, offset) =>
    shiftInvoiceMonth(currentInvoiceMonth, -offset)
  );
  const previousInvoiceMonth = recentInvoiceMonths[1];
  const minInvoiceMonth = recentInvoiceMonths[recentInvoiceMonths.length - 1];
  const partitionStartTimestamp = `${minInvoiceMonth.slice(0, 4)}-${minInvoiceMonth.slice(4, 6)}-01T00:00:00Z`;

  return {
    currentInvoiceMonth,
    previousInvoiceMonth,
    recentInvoiceMonths,
    minInvoiceMonth,
    partitionStartTimestamp,
    dayOfMonthCutoff: dayOfMonth,
  };
}

/**
 * Builds a strictly validated, partition-pruned, parameterized BigQuery SQL query.
 * Table identifier is validated with `validateBigQueryTableId` prior to backtick quoting;
 * dynamic filter values are passed exclusively as BigQuery queryParameters.
 */
export function buildBillingExportSql(
  tableId: string,
  includePartitionPseudoColumn = true
): {
  fullTableId: string;
  hostProjectId: string;
  sql: string;
} {
  const parsed = validateBigQueryTableId(tableId);
  const whereClauses = includePartitionPseudoColumn
    ? [
        "WHERE _PARTITIONTIME >= TIMESTAMP(@partitionStart)",
        "  AND usage_start_time >= TIMESTAMP(@partitionStart)",
        "  AND (invoice.month IN (@currentMonth, @prevMonth) OR invoice.month >= @minInvoiceMonth)",
      ]
    : [
        "WHERE usage_start_time >= TIMESTAMP(@partitionStart)",
        "  AND (invoice.month IN (@currentMonth, @prevMonth) OR invoice.month >= @minInvoiceMonth)",
      ];

  const sql = [
    "SELECT",
    "  invoice.month AS invoice_month,",
    "  IFNULL(billing_account_id, '') AS billing_account_id,",
    "  IFNULL(project.id, '_unassigned_') AS project_id,",
    "  IFNULL(service.description, 'Other') AS service_name,",
    "  FORMAT_DATE('%Y-%m-%d', DATE(usage_start_time)) AS usage_date,",
    "  IFNULL(currency, 'USD') AS currency,",
    "  SUM(cost) AS gross_cost,",
    "  SUM(IFNULL((SELECT SUM(c.amount) FROM UNNEST(credits) c), 0)) AS credits_amount,",
    "  SUM(cost) + SUM(IFNULL((SELECT SUM(c.amount) FROM UNNEST(credits) c), 0)) AS net_cost",
    `FROM \`${parsed.fullTableId}\``,
    ...whereClauses,
    "GROUP BY 1, 2, 3, 4, 5, 6",
  ].join("\n");

  return {
    fullTableId: parsed.fullTableId,
    hostProjectId: parsed.projectId,
    sql,
  };
}

export interface RawSpendRow {
  invoiceMonth: string;
  billingAccountId: string;
  projectId: string;
  serviceName: string;
  usageDate: string; // YYYY-MM-DD
  currency: string;
  grossCost: number;
  creditsAmount: number;
  netCost: number;
}

interface BigQueryQueryPage {
  jobComplete?: boolean;
  jobReference?: { projectId?: string; jobId?: string; location?: string };
  pageToken?: string;
  rows?: Array<{ f?: Array<{ v?: string | null }> }>;
}

async function executeBigQuerySql(
  accessToken: string,
  jobProject: string,
  sql: string,
  windowCtx: DateWindowContext,
  fetchFn: FetchLike
): Promise<Array<{ f?: Array<{ v?: string | null }> }>> {
  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${encodeURIComponent(jobProject)}/queries`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-goog-user-project": jobProject,
  };
  const requestBody = {
    query: sql,
    useLegacySql: false,
    parameterMode: "NAMED",
    timeoutMs: 20_000,
    maxResults: 20_000,
    queryParameters: [
      {
        name: "partitionStart",
        parameterType: { type: "STRING" },
        parameterValue: { value: windowCtx.partitionStartTimestamp },
      },
      {
        name: "currentMonth",
        parameterType: { type: "STRING" },
        parameterValue: { value: windowCtx.currentInvoiceMonth },
      },
      {
        name: "prevMonth",
        parameterType: { type: "STRING" },
        parameterValue: { value: windowCtx.previousInvoiceMonth },
      },
      {
        name: "minInvoiceMonth",
        parameterType: { type: "STRING" },
        parameterValue: { value: windowCtx.minInvoiceMonth },
      },
    ],
  };

  const res = await fetchFn(url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(25_000),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const errJson = (await res.json()) as { error?: { message?: string } };
      if (errJson?.error?.message) detail = `${detail}: ${errJson.error.message}`;
    } catch {
      // Ignore
    }
    throw new Error(detail);
  }

  let page = (await res.json()) as BigQueryQueryPage;
  const jobId = page.jobReference?.jobId;
  const location = page.jobReference?.location;

  // Poll up to 3 times if BigQuery job is still completing cold slot allocation
  let pollAttempts = 0;
  while (page.jobComplete === false && jobId && pollAttempts < 3) {
    pollAttempts++;
    const pollParams = new URLSearchParams({ timeoutMs: "10000", maxResults: "20000" });
    if (location) pollParams.set("location", location);
    const pollUrl = `https://bigquery.googleapis.com/bigquery/v2/projects/${encodeURIComponent(jobProject)}/queries/${encodeURIComponent(jobId)}?${pollParams.toString()}`;
    const pollRes = await fetchFn(pollUrl, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(15_000),
    });
    if (!pollRes.ok) {
      throw new Error(`HTTP ${pollRes.status} while polling BigQuery job.`);
    }
    page = (await pollRes.json()) as BigQueryQueryPage;
  }

  if (page.jobComplete === false) {
    throw new Error("BigQuery spend query timed out before completion.");
  }

  const allRawRows = [...(page.rows ?? [])];
  let nextToken = page.pageToken;
  let extraPages = 0;
  while (nextToken && jobId && extraPages < 5) {
    extraPages++;
    const pageParams = new URLSearchParams({
      pageToken: nextToken,
      maxResults: "20000",
    });
    if (location) pageParams.set("location", location);
    const nextUrl = `https://bigquery.googleapis.com/bigquery/v2/projects/${encodeURIComponent(jobProject)}/queries/${encodeURIComponent(jobId)}?${pageParams.toString()}`;
    const nextRes = await fetchFn(nextUrl, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(15_000),
    });
    if (!nextRes.ok) break;
    const nextPage = (await nextRes.json()) as BigQueryQueryPage;
    allRawRows.push(...(nextPage.rows ?? []));
    nextToken = nextPage.pageToken;
  }

  return allRawRows;
}

async function runSingleTableSpendQuery(
  accessToken: string,
  mapping: BillingExportMapping,
  windowCtx: DateWindowContext,
  quotaProject?: string | null,
  fetchFn: FetchLike = globalThis.fetch
): Promise<RawSpendRow[]> {
  const primary = buildBillingExportSql(mapping.tableId, true);
  const jobProject = quotaProject || mapping.hostProjectId || primary.hostProjectId;
  validateProjectId(jobProject);

  let rawRows: Array<{ f?: Array<{ v?: string | null }> }>;
  try {
    rawRows = await executeBigQuerySql(
      accessToken,
      jobProject,
      primary.sql,
      windowCtx,
      fetchFn
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Automatic fallback for custom BigQuery Views or non-ingestion-partitioned tables lacking _PARTITIONTIME
    if (msg.includes("_PARTITIONTIME")) {
      const fallback = buildBillingExportSql(mapping.tableId, false);
      try {
        rawRows = await executeBigQuerySql(
          accessToken,
          jobProject,
          fallback.sql,
          windowCtx,
          fetchFn
        );
      } catch (fallbackErr) {
        throw new Error(
          `BigQuery spend query failed on ${mapping.tableId} (${sanitizeErrorMessage(fallbackErr)})`
        );
      }
    } else if (
      /HTTP 404\b/i.test(msg) &&
      /Not found:\s*Table\b/i.test(msg) &&
      /\.gcp_billing_export_(?:resource_)?v1_/i.test(mapping.tableId)
    ) {
      // Standard/Detailed GCP Billing Export tables are created asynchronously after enabling export;
      // return empty rows so the localized "Waiting for usage rows" card renders without raw 404 noise.
      return [];
    } else {
      throw new Error(
        `BigQuery spend query failed on ${mapping.tableId} (${sanitizeErrorMessage(err)})`
      );
    }
  }

  const rows: RawSpendRow[] = [];
  for (const row of rawRows) {
    const cells = row.f ?? [];
    const invoiceMonth = String(cells[0]?.v ?? "");
    const rawBa = String(cells[1]?.v ?? "");
    let normalizedBa = mapping.billingAccountId !== "*" ? mapping.billingAccountId : rawBa;
    if (rawBa) {
      try {
        normalizedBa = normalizeBillingAccountId(rawBa);
      } catch {
        normalizedBa = rawBa;
      }
    }
    rows.push({
      invoiceMonth,
      billingAccountId: normalizedBa,
      projectId: String(cells[2]?.v ?? "_unassigned_"),
      serviceName: String(cells[3]?.v ?? "Other"),
      usageDate: String(cells[4]?.v ?? ""),
      currency: String(cells[5]?.v ?? "USD"),
      grossCost: Number(cells[6]?.v ?? 0) || 0,
      creditsAmount: Number(cells[7]?.v ?? 0) || 0,
      netCost: Number(cells[8]?.v ?? 0) || 0,
    });
  }
  return rows;
}

function roundMoney(n: number): number {
  return Math.round(n * 10_000) / 10_000;
}

export function computeDeltaPercent(current: number, previous: number): number | null {
  if (current <= 0.005 && previous <= 0.005) {
    return null;
  }
  if (Math.abs(previous) < 0.005) {
    return current > 0.005 ? 100 : null;
  }
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}

function finalizeDailySeries(map: Map<string, DailySpendPoint>): DailySpendPoint[] {
  return Array.from(map.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((pt) => ({
      date: pt.date,
      grossCost: roundMoney(pt.grossCost),
      creditsAmount: roundMoney(pt.creditsAmount),
      netCost: roundMoney(pt.netCost),
    }));
}

function finalizeTopServices(
  serviceMap: Map<string, { grossCost: number; creditsAmount: number; netCost: number }>,
  totalNet: number,
  totalGross: number
): ServiceCostItem[] {
  const useGrossBasis = totalNet <= 0.005 && totalGross > 0.005;
  const shareBase = useGrossBasis ? Math.max(totalGross, 0.0001) : Math.max(totalNet, 0.0001);
  const items = Array.from(serviceMap.entries())
    .map(([serviceName, vals]) => {
      const numerator = useGrossBasis ? vals.grossCost : vals.netCost;
      const pct =
        numerator > 0 && shareBase > 0
          ? Math.min(100, Math.round((numerator / shareBase) * 1000) / 10)
          : 0;
      return {
        serviceName,
        grossCost: roundMoney(vals.grossCost),
        creditsAmount: roundMoney(vals.creditsAmount),
        netCost: roundMoney(vals.netCost),
        sharePercent: pct,
      };
    })
    .sort((a, b) => {
      const aNet = useGrossBasis && Math.abs(a.netCost) < 0.005 ? 0 : a.netCost;
      const bNet = useGrossBasis && Math.abs(b.netCost) < 0.005 ? 0 : b.netCost;
      return bNet - aNet || b.grossCost - a.grossCost;
    });
  return items.slice(0, 12);
}

function aggregateSingleMonthSnapshot(
  rows: readonly RawSpendRow[],
  targetMonth: string,
  prevMonth: string,
  dayOfMonthCutoff: number,
  currentInvoiceMonth: string = targetMonth
): MonthlySpendSnapshot {
  interface BucketAccumulator {
    id: string;
    billingAccountId: string;
    currency: string;
    currGross: number;
    currCredits: number;
    currNet: number;
    prevSameDayNet: number;
    prevTotalNet: number;
    prevGross: number;
    prevCredits: number;
    services: Map<string, { grossCost: number; creditsAmount: number; netCost: number }>;
    daily: Map<string, DailySpendPoint>;
  }

  const currencyMap = new Map<string, BucketAccumulator>();
  const accountMap = new Map<string, BucketAccumulator>();
  const projectMap = new Map<string, BucketAccumulator>();

  const ensureBucket = (
    map: Map<string, BucketAccumulator>,
    key: string,
    billingAccountId: string,
    currency: string
  ): BucketAccumulator => {
    let b = map.get(key);
    if (!b) {
      b = {
        id: key,
        billingAccountId,
        currency,
        currGross: 0,
        currCredits: 0,
        currNet: 0,
        prevSameDayNet: 0,
        prevTotalNet: 0,
        prevGross: 0,
        prevCredits: 0,
        services: new Map(),
        daily: new Map(),
      };
      map.set(key, b);
    }
    return b;
  };

  const addRowToBucket = (b: BucketAccumulator, row: RawSpendRow, isCurrent: boolean, dayNum: number) => {
    if (isCurrent) {
      b.currGross += row.grossCost;
      b.currCredits += row.creditsAmount;
      b.currNet += row.netCost;

      const svc = b.services.get(row.serviceName) ?? {
        grossCost: 0,
        creditsAmount: 0,
        netCost: 0,
      };
      svc.grossCost += row.grossCost;
      svc.creditsAmount += row.creditsAmount;
      svc.netCost += row.netCost;
      b.services.set(row.serviceName, svc);

      if (row.usageDate) {
        const pt = b.daily.get(row.usageDate) ?? {
          date: row.usageDate,
          grossCost: 0,
          creditsAmount: 0,
          netCost: 0,
        };
        pt.grossCost += row.grossCost;
        pt.creditsAmount += row.creditsAmount;
        pt.netCost += row.netCost;
        b.daily.set(row.usageDate, pt);
      }
    } else {
      b.prevTotalNet += row.netCost;
      b.prevGross += row.grossCost;
      b.prevCredits += row.creditsAmount;
      if (dayNum > 0 && dayNum <= dayOfMonthCutoff) {
        b.prevSameDayNet += row.netCost;
      }
    }
  };

  const sameMonthPrefix = `${targetMonth.slice(0, 4)}-${targetMonth.slice(4, 6)}-`;
  const distinctUsageDates = new Set<string>();
  const laterMonthDates = new Set<string>();
  let sameMonthMaxDay = 0;
  let rowCount = 0;
  for (const row of rows) {
    if (row.invoiceMonth > targetMonth && row.usageDate) {
      laterMonthDates.add(row.usageDate);
    }
    const isCurrent = row.invoiceMonth === targetMonth;
    const isPrev = row.invoiceMonth === prevMonth;
    if (!isCurrent && !isPrev) continue;
    if (isCurrent) {
      rowCount++;
      if (row.usageDate) {
        distinctUsageDates.add(row.usageDate);
        if (row.usageDate.startsWith(sameMonthPrefix)) {
          const sameMonthDay = Number(row.usageDate.slice(8, 10)) || 0;
          if (sameMonthDay > sameMonthMaxDay) sameMonthMaxDay = sameMonthDay;
        }
      }
    }

    const dayPart = Number(row.usageDate.split("-")[2] ?? "0") || 0;

    const currBucket = ensureBucket(currencyMap, row.currency, "", row.currency);
    addRowToBucket(currBucket, row, isCurrent, dayPart);

    if (row.billingAccountId) {
      const baBucket = ensureBucket(
        accountMap,
        row.billingAccountId,
        row.billingAccountId,
        row.currency
      );
      addRowToBucket(baBucket, row, isCurrent, dayPart);
    }

    if (row.projectId && row.projectId !== "_unassigned_") {
      const projBucket = ensureBucket(
        projectMap,
        row.projectId,
        row.billingAccountId,
        row.currency
      );
      addRowToBucket(projBucket, row, isCurrent, dayPart);
    }
  }

  const totalsByCurrency: CurrencyTotalSummary[] = Array.from(currencyMap.values())
    .sort((a, b) => a.currency.localeCompare(b.currency))
    .map((b) => ({
      currency: b.currency,
      currentMonthGrossCost: roundMoney(b.currGross),
      currentMonthCredits: roundMoney(b.currCredits),
      currentMonthNetCost: roundMoney(b.currNet),
      prevMonthSameDayNetCost: roundMoney(b.prevSameDayNet),
      prevMonthTotalNetCost: roundMoney(b.prevTotalNet),
      prevMonthGrossCost: roundMoney(b.prevGross),
      prevMonthCredits: roundMoney(b.prevCredits),
      deltaPercentVsPrevSameDay: computeDeltaPercent(b.currNet, b.prevSameDayNet),
      topServices: finalizeTopServices(b.services, b.currNet, b.currGross),
      dailySeries: finalizeDailySeries(b.daily),
    }));

  const byBillingAccount: Record<string, BillingAccountSpendSummary> = {};
  for (const [baId, b] of accountMap.entries()) {
    byBillingAccount[baId] = {
      billingAccountId: baId,
      currency: b.currency,
      currentMonthGrossCost: roundMoney(b.currGross),
      currentMonthCredits: roundMoney(b.currCredits),
      currentMonthNetCost: roundMoney(b.currNet),
      prevMonthSameDayNetCost: roundMoney(b.prevSameDayNet),
      prevMonthTotalNetCost: roundMoney(b.prevTotalNet),
      prevMonthGrossCost: roundMoney(b.prevGross),
      prevMonthCredits: roundMoney(b.prevCredits),
      deltaPercentVsPrevSameDay: computeDeltaPercent(b.currNet, b.prevSameDayNet),
      topServices: finalizeTopServices(b.services, b.currNet, b.currGross),
      dailySeries: finalizeDailySeries(b.daily),
    };
  }

  const byProject: Record<string, ProjectSpendSummary> = {};
  for (const [projId, b] of projectMap.entries()) {
    byProject[projId] = {
      projectId: projId,
      billingAccountId: b.billingAccountId,
      currency: b.currency,
      currentMonthGrossCost: roundMoney(b.currGross),
      currentMonthCredits: roundMoney(b.currCredits),
      currentMonthNetCost: roundMoney(b.currNet),
      prevMonthSameDayNetCost: roundMoney(b.prevSameDayNet),
      prevMonthTotalNetCost: roundMoney(b.prevTotalNet),
      prevMonthGrossCost: roundMoney(b.prevGross),
      prevMonthCredits: roundMoney(b.prevCredits),
      deltaPercentVsPrevSameDay: computeDeltaPercent(b.currNet, b.prevSameDayNet),
      topServices: finalizeTopServices(b.services, b.currNet, b.currGross),
      dailySeries: finalizeDailySeries(b.daily),
    };
  }

  const coveredDays = distinctUsageDates.size;
  const hasRows = rowCount > 0;
  const settled = isHistoricalMonthSettled(
    targetMonth,
    currentInvoiceMonth,
    hasRows,
    coveredDays,
    sameMonthMaxDay,
    laterMonthDates.size
  );

  return {
    invoiceMonth: targetMonth,
    previousInvoiceMonth: prevMonth,
    hasRows,
    rowCount,
    coveredDays,
    settled,
    totalsByCurrency,
    byBillingAccount,
    byProject,
  };
}

function sumSameDayNet(dailySeries: readonly DailySpendPoint[], dayCutoff: number): number {
  let sum = 0;
  for (const pt of dailySeries) {
    const dayNum = Number(pt.date.split("-")[2] ?? "0") || 0;
    if (dayNum > 0 && dayNum <= dayCutoff) {
      sum += pt.netCost;
    }
  }
  return roundMoney(sum);
}

function mergePreviousEntityBaseline<
  T extends {
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
  },
>(
  targetRecord: Record<string, T>,
  prevRecord: Record<string, T>,
  dayCutoff: number,
  createZeroEntry: (id: string, prev: T) => T
): Record<string, T> {
  const next: Record<string, T> = {};
  for (const [id, item] of Object.entries(targetRecord)) {
    next[id] = { ...item };
  }
  for (const [id, prev] of Object.entries(prevRecord)) {
    const prevSameDay = sumSameDayNet(prev.dailySeries, dayCutoff);
    const existing = next[id];
    if (existing) {
      existing.prevMonthSameDayNetCost = prevSameDay;
      existing.prevMonthTotalNetCost = roundMoney(prev.currentMonthNetCost);
      existing.prevMonthGrossCost = roundMoney(prev.currentMonthGrossCost);
      existing.prevMonthCredits = roundMoney(prev.currentMonthCredits);
      existing.deltaPercentVsPrevSameDay = computeDeltaPercent(existing.currentMonthNetCost, prevSameDay);
    } else {
      next[id] = {
        ...createZeroEntry(id, prev),
        prevMonthSameDayNetCost: prevSameDay,
        prevMonthTotalNetCost: roundMoney(prev.currentMonthNetCost),
        prevMonthGrossCost: roundMoney(prev.currentMonthGrossCost),
        prevMonthCredits: roundMoney(prev.currentMonthCredits),
        deltaPercentVsPrevSameDay: computeDeltaPercent(0, prevSameDay),
      };
    }
  }
  return next;
}

function applyFrozenPreviousBaseline(
  targetSnap: MonthlySpendSnapshot,
  frozenPrevSnap: MonthlySpendSnapshot,
  dayCutoff: number
): MonthlySpendSnapshot {
  const targetCurrencyMap: Record<string, CurrencyTotalSummary> = {};
  for (const c of targetSnap.totalsByCurrency) {
    targetCurrencyMap[c.currency] = c;
  }
  const prevCurrencyMap: Record<string, CurrencyTotalSummary> = {};
  for (const c of frozenPrevSnap.totalsByCurrency) {
    prevCurrencyMap[c.currency] = c;
  }
  const mergedCurrencies = Object.values(
    mergePreviousEntityBaseline(targetCurrencyMap, prevCurrencyMap, dayCutoff, (currency) => ({
      currency,
      currentMonthGrossCost: 0,
      currentMonthCredits: 0,
      currentMonthNetCost: 0,
      prevMonthSameDayNetCost: 0,
      prevMonthTotalNetCost: 0,
      deltaPercentVsPrevSameDay: null,
      topServices: [],
      dailySeries: [],
    }))
  ).sort((a, b) => a.currency.localeCompare(b.currency));

  const mergedAccounts = mergePreviousEntityBaseline(
    targetSnap.byBillingAccount,
    frozenPrevSnap.byBillingAccount,
    dayCutoff,
    (billingAccountId, prev) => ({
      billingAccountId,
      currency: prev.currency,
      currentMonthGrossCost: 0,
      currentMonthCredits: 0,
      currentMonthNetCost: 0,
      prevMonthSameDayNetCost: 0,
      prevMonthTotalNetCost: 0,
      deltaPercentVsPrevSameDay: null,
      topServices: [],
      dailySeries: [],
    })
  );

  const mergedProjects = mergePreviousEntityBaseline(
    targetSnap.byProject,
    frozenPrevSnap.byProject,
    dayCutoff,
    (projectId, prev) => ({
      projectId,
      billingAccountId: prev.billingAccountId,
      currency: prev.currency,
      currentMonthGrossCost: 0,
      currentMonthCredits: 0,
      currentMonthNetCost: 0,
      prevMonthSameDayNetCost: 0,
      prevMonthTotalNetCost: 0,
      deltaPercentVsPrevSameDay: null,
      topServices: [],
      dailySeries: [],
    })
  );

  return {
    ...targetSnap,
    totalsByCurrency: mergedCurrencies,
    byBillingAccount: mergedAccounts,
    byProject: mergedProjects,
  };
}

export function aggregateSpendRows(
  rows: readonly RawSpendRow[],
  queriedTables: readonly string[],
  windowCtx: DateWindowContext,
  queriedAt: string = new Date().toISOString()
): SpendReport {
  const currentSnapshot = aggregateSingleMonthSnapshot(
    rows,
    windowCtx.currentInvoiceMonth,
    windowCtx.previousInvoiceMonth,
    windowCtx.dayOfMonthCutoff,
    windowCtx.currentInvoiceMonth
  );

  const recentSet = new Set(windowCtx.recentInvoiceMonths);
  const monthsWithRows = new Set<string>();
  for (const row of rows) {
    if (recentSet.has(row.invoiceMonth)) {
      monthsWithRows.add(row.invoiceMonth);
    }
  }

  const availableMonths: string[] = [];
  const byMonth: Record<string, MonthlySpendSnapshot> = {};

  if (monthsWithRows.size > 0) {
    const orderedMonths = windowCtx.recentInvoiceMonths.filter(
      (m) => m === windowCtx.currentInvoiceMonth || monthsWithRows.has(m)
    );
    for (const month of orderedMonths) {
      availableMonths.push(month);
      if (month === windowCtx.currentInvoiceMonth) {
        byMonth[month] = currentSnapshot;
      } else {
        byMonth[month] = aggregateSingleMonthSnapshot(
          rows,
          month,
          shiftInvoiceMonth(month, -1),
          31,
          windowCtx.currentInvoiceMonth
        );
      }
    }
  }

  return {
    configured: queriedTables.length > 0,
    invoiceMonth: windowCtx.currentInvoiceMonth,
    previousInvoiceMonth: windowCtx.previousInvoiceMonth,
    queriedTables: [...queriedTables],
    queriedAt,
    totalsByCurrency: currentSnapshot.totalsByCurrency,
    byBillingAccount: currentSnapshot.byBillingAccount,
    byProject: currentSnapshot.byProject,
    availableMonths,
    byMonth,
  };
}

export function createEmptySpendReport(referenceDate: Date = new Date()): SpendReport {
  const windowCtx = computeBillingDateWindow(referenceDate);
  return {
    configured: false,
    invoiceMonth: windowCtx.currentInvoiceMonth,
    previousInvoiceMonth: windowCtx.previousInvoiceMonth,
    queriedTables: [],
    queriedAt: referenceDate.toISOString(),
    totalsByCurrency: [],
    byBillingAccount: {},
    byProject: {},
    availableMonths: [],
    byMonth: {},
  };
}

export async function queryBillingExportSpend(
  accessToken: string,
  mappings: Record<string, BillingExportMapping>,
  quotaProject?: string | null,
  referenceDate: Date = new Date(),
  fetchFn: FetchLike = globalThis.fetch,
  cachedSpendReport?: SpendReport | null
): Promise<{ report: SpendReport; warnings: string[] }> {
  const entries = Object.values(mappings);
  if (entries.length === 0) {
    return { report: createEmptySpendReport(referenceDate), warnings: [] };
  }

  // Deduplicate identical tableIds so a shared export table is queried only once
  const uniqueByTable = new Map<string, BillingExportMapping>();
  for (const m of entries) {
    const clean = validateBigQueryTableId(m.tableId).fullTableId;
    if (!uniqueByTable.has(clean)) {
      uniqueByTable.set(clean, { ...m, tableId: clean });
    }
  }

  const fullWindowCtx = computeBillingDateWindow(referenceDate);
  const warnings: string[] = [];
  const allRows: RawSpendRow[] = [];
  const uniqueMappings = Array.from(uniqueByTable.values());
  const sortedTables = uniqueMappings.map((m) => m.tableId).sort();
  const cachedTables = [...(cachedSpendReport?.queriedTables ?? [])].sort();
  const canReuseArchive =
    Boolean(cachedSpendReport?.configured) &&
    Boolean(cachedSpendReport?.byMonth) &&
    sortedTables.length === cachedTables.length &&
    sortedTables.every((t, idx) => t === cachedTables[idx]);

  const frozenMonths = new Map<string, MonthlySpendSnapshot>();
  if (canReuseArchive && cachedSpendReport?.byMonth) {
    for (const month of fullWindowCtx.recentInvoiceMonths) {
      if (month >= fullWindowCtx.currentInvoiceMonth) continue;
      const snap = cachedSpendReport.byMonth[month];
      if (snap && snap.settled === true && snap.hasRows && Array.isArray(snap.totalsByCurrency)) {
        frozenMonths.set(month, snap);
      }
    }
  }

  let queryWindowCtx = fullWindowCtx;
  if (frozenMonths.size > 0) {
    const recentAsc = [...fullWindowCtx.recentInvoiceMonths].reverse();
    const firstKnownIdx = recentAsc.findIndex(
      (m) => frozenMonths.has(m) || Boolean(cachedSpendReport?.byMonth?.[m]?.hasRows)
    );
    if (firstKnownIdx >= 0) {
      let earliestUnfrozen = fullWindowCtx.currentInvoiceMonth;
      for (let i = firstKnownIdx; i < recentAsc.length; i++) {
        const candidate = recentAsc[i];
        if (!frozenMonths.has(candidate)) {
          earliestUnfrozen = candidate;
          break;
        }
      }
      if (earliestUnfrozen !== fullWindowCtx.minInvoiceMonth) {
        queryWindowCtx = {
          ...fullWindowCtx,
          minInvoiceMonth: earliestUnfrozen,
          partitionStartTimestamp: `${earliestUnfrozen.slice(0, 4)}-${earliestUnfrozen.slice(4, 6)}-01T00:00:00Z`,
        };
      }
    }
  }

  await runWithConcurrency(uniqueMappings, 3, async (mapping) => {
    try {
      const rows = await runSingleTableSpendQuery(
        accessToken,
        mapping,
        queryWindowCtx,
        quotaProject,
        fetchFn
      );
      allRows.push(...rows);
    } catch (err) {
      warnings.push(sanitizeErrorMessage(err));
    }
  });

  const freshReport = aggregateSpendRows(
    allRows,
    uniqueMappings.map((m) => m.tableId),
    fullWindowCtx,
    referenceDate.toISOString()
  );

  // Never freeze partial/failed query results as settled
  if (warnings.length > 0 && freshReport.byMonth) {
    for (const [m, snap] of Object.entries(freshReport.byMonth)) {
      if (!frozenMonths.has(m)) {
        freshReport.byMonth[m] = { ...snap, settled: false };
      }
    }
  }

  if (frozenMonths.size === 0) {
    return { report: freshReport, warnings };
  }

  const mergedByMonth: Record<string, MonthlySpendSnapshot> = {
    ...(freshReport.byMonth ?? {}),
  };
  for (const [m, frozenSnap] of frozenMonths.entries()) {
    mergedByMonth[m] = frozenSnap;
  }

  if (!mergedByMonth[fullWindowCtx.currentInvoiceMonth]) {
    mergedByMonth[fullWindowCtx.currentInvoiceMonth] = aggregateSingleMonthSnapshot(
      allRows,
      fullWindowCtx.currentInvoiceMonth,
      fullWindowCtx.previousInvoiceMonth,
      fullWindowCtx.dayOfMonthCutoff,
      fullWindowCtx.currentInvoiceMonth
    );
  }

  const mergedAvailableMonths = fullWindowCtx.recentInvoiceMonths.filter(
    (m) => m === fullWindowCtx.currentInvoiceMonth || Boolean(mergedByMonth[m]?.hasRows)
  );

  // Re-evaluate sequential backfill guard across merged fresh + frozen months
  if (warnings.length === 0) {
    for (const m of mergedAvailableMonths) {
      if (frozenMonths.has(m) || m >= fullWindowCtx.currentInvoiceMonth) continue;
      const snap = mergedByMonth[m];
      if (!snap || !snap.hasRows) continue;
      const prefix = `${m.slice(0, 4)}-${m.slice(4, 6)}-`;
      let snapMaxDay = 0;
      for (const curr of snap.totalsByCurrency) {
        for (const pt of curr.dailySeries) {
          if (pt.date.startsWith(prefix)) {
            const d = Number(pt.date.slice(8, 10)) || 0;
            if (d > snapMaxDay) snapMaxDay = d;
          }
        }
      }
      const laterDates = new Set<string>();
      let fallbackLaterDays = 0;
      for (const [laterM, laterSnap] of Object.entries(mergedByMonth)) {
        if (laterM <= m || !laterSnap?.hasRows) continue;
        let hasSeriesDates = false;
        for (const curr of laterSnap.totalsByCurrency) {
          for (const pt of curr.dailySeries) {
            if (pt.date) {
              laterDates.add(pt.date);
              hasSeriesDates = true;
            }
          }
        }
        if (!hasSeriesDates && laterSnap.coveredDays) {
          fallbackLaterDays += laterSnap.coveredDays;
        }
      }
      const laterCovered = Math.max(laterDates.size, fallbackLaterDays);
      mergedByMonth[m] = {
        ...snap,
        settled: isHistoricalMonthSettled(
          m,
          fullWindowCtx.currentInvoiceMonth,
          snap.hasRows,
          snap.coveredDays ?? 0,
          snapMaxDay,
          laterCovered
        ),
      };
    }
  }

  // Inherit previous-month comparison baselines when a frozen previous month was skipped in SQL
  for (const m of [...mergedAvailableMonths].reverse()) {
    if (frozenMonths.has(m)) continue;
    const snap = mergedByMonth[m];
    if (!snap) continue;
    const frozenPrev = frozenMonths.get(snap.previousInvoiceMonth);
    if (frozenPrev) {
      const dayCutoff =
        m === fullWindowCtx.currentInvoiceMonth ? fullWindowCtx.dayOfMonthCutoff : 31;
      mergedByMonth[m] = applyFrozenPreviousBaseline(snap, frozenPrev, dayCutoff);
    }
  }

  const currentMerged = mergedByMonth[fullWindowCtx.currentInvoiceMonth];
  const mergedReport: SpendReport = {
    ...freshReport,
    totalsByCurrency: currentMerged?.totalsByCurrency ?? freshReport.totalsByCurrency,
    byBillingAccount: currentMerged?.byBillingAccount ?? freshReport.byBillingAccount,
    byProject: currentMerged?.byProject ?? freshReport.byProject,
    availableMonths: mergedAvailableMonths,
    byMonth: mergedByMonth,
  };

  return { report: mergedReport, warnings };
}
