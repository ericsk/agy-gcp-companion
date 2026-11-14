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
  partitionStartTimestamp: string; // YYYY-MM-01T00:00:00Z (first day of previous month)
  dayOfMonthCutoff: number; // 1..31 for fair Month-to-Date vs Prev-Month-Same-Day comparison
}

export function computeBillingDateWindow(referenceDate: Date = new Date()): DateWindowContext {
  const year = referenceDate.getUTCFullYear();
  const monthIndex = referenceDate.getUTCMonth(); // 0..11
  const dayOfMonth = referenceDate.getUTCDate();

  const currentInvoiceMonth = `${year}${String(monthIndex + 1).padStart(2, "0")}`;
  const prevDate = new Date(Date.UTC(year, monthIndex - 1, 1));
  const prevYear = prevDate.getUTCFullYear();
  const prevMonth = prevDate.getUTCMonth() + 1;
  const previousInvoiceMonth = `${prevYear}${String(prevMonth).padStart(2, "0")}`;
  const partitionStartTimestamp = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01T00:00:00Z`;

  return {
    currentInvoiceMonth,
    previousInvoiceMonth,
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
        "  AND invoice.month IN (@currentMonth, @prevMonth)",
      ]
    : [
        "WHERE usage_start_time >= TIMESTAMP(@partitionStart)",
        "  AND invoice.month IN (@currentMonth, @prevMonth)",
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

function computeDeltaPercent(current: number, previous: number): number | null {
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
  totalNet: number
): ServiceCostItem[] {
  const items = Array.from(serviceMap.entries())
    .map(([serviceName, vals]) => {
      const shareBase = Math.max(totalNet, 0.0001);
      const pct =
        vals.netCost > 0 && totalNet > 0
          ? Math.min(100, Math.round((vals.netCost / shareBase) * 1000) / 10)
          : 0;
      return {
        serviceName,
        grossCost: roundMoney(vals.grossCost),
        creditsAmount: roundMoney(vals.creditsAmount),
        netCost: roundMoney(vals.netCost),
        sharePercent: pct,
      };
    })
    .sort((a, b) => b.netCost - a.netCost || b.grossCost - a.grossCost);
  return items.slice(0, 12);
}

export function aggregateSpendRows(
  rows: readonly RawSpendRow[],
  queriedTables: readonly string[],
  windowCtx: DateWindowContext,
  queriedAt: string = new Date().toISOString()
): SpendReport {
  interface BucketAccumulator {
    id: string;
    billingAccountId: string;
    currency: string;
    currGross: number;
    currCredits: number;
    currNet: number;
    prevSameDayNet: number;
    prevTotalNet: number;
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
      if (dayNum > 0 && dayNum <= windowCtx.dayOfMonthCutoff) {
        b.prevSameDayNet += row.netCost;
      }
    }
  };

  for (const row of rows) {
    const isCurrent = row.invoiceMonth === windowCtx.currentInvoiceMonth;
    const isPrev = row.invoiceMonth === windowCtx.previousInvoiceMonth;
    if (!isCurrent && !isPrev) continue;

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
      deltaPercentVsPrevSameDay: computeDeltaPercent(b.currNet, b.prevSameDayNet),
      topServices: finalizeTopServices(b.services, b.currNet),
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
      deltaPercentVsPrevSameDay: computeDeltaPercent(b.currNet, b.prevSameDayNet),
      topServices: finalizeTopServices(b.services, b.currNet),
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
      deltaPercentVsPrevSameDay: computeDeltaPercent(b.currNet, b.prevSameDayNet),
      topServices: finalizeTopServices(b.services, b.currNet),
      dailySeries: finalizeDailySeries(b.daily),
    };
  }

  return {
    configured: queriedTables.length > 0,
    invoiceMonth: windowCtx.currentInvoiceMonth,
    previousInvoiceMonth: windowCtx.previousInvoiceMonth,
    queriedTables: [...queriedTables],
    queriedAt,
    totalsByCurrency,
    byBillingAccount,
    byProject,
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
  };
}

export async function queryBillingExportSpend(
  accessToken: string,
  mappings: Record<string, BillingExportMapping>,
  quotaProject?: string | null,
  referenceDate: Date = new Date(),
  fetchFn: FetchLike = globalThis.fetch
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

  const windowCtx = computeBillingDateWindow(referenceDate);
  const warnings: string[] = [];
  const allRows: RawSpendRow[] = [];
  const uniqueMappings = Array.from(uniqueByTable.values());

  await runWithConcurrency(uniqueMappings, 3, async (mapping) => {
    try {
      const rows = await runSingleTableSpendQuery(
        accessToken,
        mapping,
        windowCtx,
        quotaProject,
        fetchFn
      );
      allRows.push(...rows);
    } catch (err) {
      warnings.push(sanitizeErrorMessage(err));
    }
  });

  const report = aggregateSpendRows(
    allRows,
    uniqueMappings.map((m) => m.tableId),
    windowCtx,
    referenceDate.toISOString()
  );
  return { report, warnings };
}
