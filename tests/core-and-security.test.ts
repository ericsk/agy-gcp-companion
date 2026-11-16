import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  aggregateSpendRows,
  buildBillingExportSql,
  computeBillingDateWindow,
  computeDeltaPercent,
  getDaysInInvoiceMonth,
  inferBillingAccountFromTableName,
  queryBillingExportSpend,
} from "../src/core/bigquery-billing.ts";
import { CompanionService } from "../src/core/companion-service.ts";
import { fetchBillingAccountsAndProjectLinks } from "../src/core/gcp-api.ts";
import { GcloudClient } from "../src/core/gcloud.ts";
import {
  maskEmail,
  normalizeBillingAccountId,
  safeStoreFilePath,
  sanitizeErrorMessage,
  validateAccountEmail,
  validateBigQueryTableId,
  validateProjectId,
} from "../src/core/security.ts";
import { CompanionStore } from "../src/core/store.ts";

describe("Security Validators & Sanitization", () => {
  it("validates GCP Project IDs and blocks CLI flag / command injection", () => {
    assert.equal(validateProjectId("my-gcp-project-123"), "my-gcp-project-123");
    assert.equal(validateProjectId("google.com:internal-proj"), "google.com:internal-proj");
    assert.throws(() => validateProjectId("--quiet"));
    assert.throws(() => validateProjectId("-project=evil"));
    assert.throws(() => validateProjectId("proj; rm -rf /"));
    assert.throws(() => validateProjectId("ab"));
  });

  it("validates Google account emails and rejects flag injection", () => {
    assert.equal(validateAccountEmail("dev@example.com"), "dev@example.com");
    assert.equal(
      validateAccountEmail("ci-runner@my-proj.iam.gserviceaccount.com"),
      "ci-runner@my-proj.iam.gserviceaccount.com"
    );
    assert.throws(() => validateAccountEmail("--account=evil@example.com"));
    assert.throws(() => validateAccountEmail("not-an-email"));
  });

  it("normalizes Cloud Billing Account IDs", () => {
    assert.equal(
      normalizeBillingAccountId("billingAccounts/01abcd-234567-89efgh"),
      "01ABCD-234567-89EFGH"
    );
    assert.equal(normalizeBillingAccountId("*"), "*");
    assert.throws(() => normalizeBillingAccountId("invalid-id"));
  });

  it("validates BigQuery table references and prevents SQL injection", () => {
    const parsed = validateBigQueryTableId(
      "`my-billing-host.billing_ds.gcp_billing_export_v1_01ABCD_234567_89EFGH`"
    );
    assert.equal(
      parsed.fullTableId,
      "my-billing-host.billing_ds.gcp_billing_export_v1_01ABCD_234567_89EFGH"
    );

    const domainScoped = validateBigQueryTableId("corp.com:admin-proj:billing_ds.export_tbl");
    assert.equal(domainScoped.projectId, "corp.com:admin-proj");
    assert.equal(domainScoped.datasetId, "billing_ds");
    assert.equal(domainScoped.tableName, "export_tbl");

    assert.throws(() =>
      validateBigQueryTableId("proj.ds.tbl` WHERE 1=1 UNION SELECT * FROM secrets --")
    );
    assert.throws(() => validateBigQueryTableId("only_two.parts"));
  });

  it("masks PII emails and redacts sensitive tokens from errors", () => {
    assert.equal(maskEmail("ericsk@example.com"), "er***k@example.com");
    assert.equal(maskEmail("ab@example.com"), "a***@example.com");

    const leaked =
      'Request failed with Bearer ya29.a0AfH6SMBxSecretToken123 and "refresh_token":"1//0gSecretRefresh"';
    const clean = sanitizeErrorMessage(leaked);
    assert.ok(!clean.includes("ya29."));
    assert.ok(!clean.includes("1//0gSecretRefresh"));
    assert.ok(clean.includes("[REDACTED"));
  });

  it("confines store file paths strictly within storeDir", () => {
    const dir = "/tmp/agy-store-test";
    const okPath = safeStoreFilePath(dir, "preferences.json");
    assert.equal(okPath, "/tmp/agy-store-test/preferences.json");
    // Traversal sequences are stripped by basename or rejected
    const stripped = safeStoreFilePath(dir, "../../etc/passwd");
    assert.equal(stripped, "/tmp/agy-store-test/passwd");
    assert.throws(() => safeStoreFilePath(dir, ".."));
  });
});

describe("CompanionStore & BigQuery Aggregation", () => {
  it("persists preferences with 0600 permissions and isolates per-account snapshots", () => {
    const tmpDir = mkdtempSync(join(tmpdir(), "agy-gcp-store-"));
    try {
      const store = new CompanionStore(tmpDir);
      store.savePreferences({
        pinnedProjects: ["proj-a", "proj-a", "proj-b"],
        billingExportTables: {},
        cacheTtlMs: 3_600_000,
        maskEmails: true,
        gcloudPathOverride: null,
        quotaProjectOverride: null,
        demoMode: false,
      });

      const loaded = store.loadPreferences();
      assert.deepEqual(loaded.pinnedProjects, ["proj-a", "proj-b"]);
      assert.equal(loaded.maskEmails, true);

      if (process.platform !== "win32") {
        const mode = statSync(join(tmpDir, "preferences.json")).mode & 0o777;
        assert.equal(mode, 0o600);
      }

      store.saveSnapshot("alice@example.com", {
        fetchedAt: "2026-11-14T00:00:00Z",
        projects: [],
        billingAccounts: [],
        spendReport: null,
        warnings: [],
      });
      assert.ok(store.loadSnapshot("alice@example.com") !== null);
      assert.equal(store.loadSnapshot("bob@example.com"), null);
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("infers Billing Account IDs from standard and resource export table names", () => {
    assert.deepEqual(
      inferBillingAccountFromTableName("gcp_billing_export_v1_01A8F2_94C110_77EB31"),
      { billingAccountId: "01A8F2-94C110-77EB31", exportType: "standard" }
    );
    assert.deepEqual(
      inferBillingAccountFromTableName("gcp_billing_export_resource_v1_01A8F2_94C110_77EB31"),
      { billingAccountId: "01A8F2-94C110-77EB31", exportType: "detailed" }
    );
    assert.equal(inferBillingAccountFromTableName("unrelated_table"), null);
  });

  it("generates partition-pruned parameterized SQL and computes Gross, Credits & Net MTD deltas", () => {
    const { sql } = buildBillingExportSql(
      "billing-host.finops.gcp_billing_export_v1_01A8F2_94C110_77EB31"
    );
    assert.ok(sql.includes("_PARTITIONTIME >= TIMESTAMP(@partitionStart)"));
    assert.ok(sql.includes("invoice.month IN (@currentMonth, @prevMonth)"));
    assert.ok(sql.includes("UNNEST(credits)"));

    const refDate = new Date("2026-11-14T08:00:00Z");
    const windowCtx = computeBillingDateWindow(refDate);
    assert.equal(windowCtx.currentInvoiceMonth, "202611");
    assert.equal(windowCtx.previousInvoiceMonth, "202610");
    assert.equal(windowCtx.dayOfMonthCutoff, 14);

    const report = aggregateSpendRows(
      [
        {
          invoiceMonth: "202611",
          billingAccountId: "01A8F2-94C110-77EB31",
          projectId: "proj-alpha",
          serviceName: "Vertex AI",
          usageDate: "2026-11-10",
          currency: "USD",
          grossCost: 120,
          creditsAmount: -20,
          netCost: 100,
        },
        {
          invoiceMonth: "202611",
          billingAccountId: "01A8F2-94C110-77EB31",
          projectId: "proj-alpha",
          serviceName: "Cloud Run",
          usageDate: "2026-11-12",
          currency: "USD",
          grossCost: 30,
          creditsAmount: -5,
          netCost: 25,
        },
        // Previous month before day 14 (included in same-day MTD comparison)
        {
          invoiceMonth: "202610",
          billingAccountId: "01A8F2-94C110-77EB31",
          projectId: "proj-alpha",
          serviceName: "Vertex AI",
          usageDate: "2026-10-10",
          currency: "USD",
          grossCost: 100,
          creditsAmount: 0,
          netCost: 100,
        },
        // Previous month after day 14 (included in prevMonthTotalNetCost only)
        {
          invoiceMonth: "202610",
          billingAccountId: "01A8F2-94C110-77EB31",
          projectId: "proj-alpha",
          serviceName: "Vertex AI",
          usageDate: "2026-10-25",
          currency: "USD",
          grossCost: 80,
          creditsAmount: 0,
          netCost: 80,
        },
      ],
      ["billing-host.finops.gcp_billing_export_v1_01A8F2_94C110_77EB31"],
      windowCtx,
      refDate.toISOString()
    );

    assert.equal(report.totalsByCurrency.length, 1);
    const usd = report.totalsByCurrency[0];
    assert.equal(usd.currentMonthGrossCost, 150);
    assert.equal(usd.currentMonthCredits, -25);
    assert.equal(usd.currentMonthNetCost, 125);
    assert.equal(usd.prevMonthSameDayNetCost, 100);
    assert.equal(usd.prevMonthTotalNetCost, 180);
    assert.equal(usd.deltaPercentVsPrevSameDay, 25);
    assert.equal(usd.topServices[0].serviceName, "Vertex AI");

    const alpha = report.byProject["proj-alpha"];
    assert.equal(alpha.topServices[0].serviceName, "Vertex AI");
    assert.equal(alpha.topServices[0].sharePercent, 80);
    assert.equal(alpha.topServices[1].serviceName, "Cloud Run");
    assert.equal(alpha.topServices[1].sharePercent, 20);
  });

  it("computes 6-month date window across year rollover and sends minInvoiceMonth query parameter", async () => {
    const windowCtx = computeBillingDateWindow(new Date("2026-01-15T12:00:00Z"));
    assert.equal(windowCtx.currentInvoiceMonth, "202601");
    assert.equal(windowCtx.previousInvoiceMonth, "202512");
    assert.equal(windowCtx.minInvoiceMonth, "202508");
    assert.equal(windowCtx.partitionStartTimestamp, "2025-08-01T00:00:00Z");
    assert.deepEqual(windowCtx.recentInvoiceMonths, [
      "202601",
      "202512",
      "202511",
      "202510",
      "202509",
      "202508",
    ]);

    const { sql } = buildBillingExportSql("host.ds.gcp_billing_export_v1_01A8F2_94C110_77EB31");
    assert.ok(sql.includes("invoice.month >= @minInvoiceMonth"));

    let capturedBody: { query?: string; queryParameters?: Array<{ name: string; parameterValue?: { value?: string } }> } | null = null;
    await queryBillingExportSpend(
      "fake-token",
      {
        "01A8F2-94C110-77EB31": {
          billingAccountId: "01A8F2-94C110-77EB31",
          tableId: "host.ds.gcp_billing_export_v1_01A8F2_94C110_77EB31",
        },
      },
      "host",
      new Date("2026-01-15T12:00:00Z"),
      async (_url, init) => {
        capturedBody = JSON.parse(String(init?.body ?? "{}"));
        return new Response(JSON.stringify({ jobComplete: true, rows: [] }), { status: 200 });
      }
    );

    assert.ok(capturedBody, "Expected BigQuery query request body");
    const params = Object.fromEntries(
      (capturedBody.queryParameters ?? []).map((p) => [p.name, p.parameterValue?.value])
    );
    assert.equal(params.currentMonth, "202601");
    assert.equal(params.prevMonth, "202512");
    assert.equal(params.minInvoiceMonth, "202508");
    assert.equal(params.partitionStart, "2025-08-01T00:00:00Z");
  });

  it("aggregates multi-month snapshots with 100% credit-covered Gross service ranking and previous gross totals", () => {
    const refDate = new Date("2026-11-16T08:00:00Z");
    const windowCtx = computeBillingDateWindow(refDate);
    const report = aggregateSpendRows(
      [
        {
          invoiceMonth: "202610",
          billingAccountId: "01A8F2-94C110-77EB31",
          projectId: "proj-gde",
          serviceName: "Cloud Logging",
          usageDate: "2026-10-01",
          currency: "TWD",
          grossCost: 0,
          creditsAmount: 0,
          netCost: 0,
        },
        {
          invoiceMonth: "202610",
          billingAccountId: "01A8F2-94C110-77EB31",
          projectId: "proj-gde",
          serviceName: "Compute Engine",
          usageDate: "2026-10-01",
          currency: "TWD",
          grossCost: 200,
          creditsAmount: -200,
          netCost: 0,
        },
        {
          invoiceMonth: "202610",
          billingAccountId: "01A8F2-94C110-77EB31",
          projectId: "proj-gde",
          serviceName: "Networking",
          usageDate: "2026-10-02",
          currency: "TWD",
          grossCost: 54.6649,
          creditsAmount: -54.6651,
          netCost: -0.0002,
        },
        {
          invoiceMonth: "202609",
          billingAccountId: "01A8F2-94C110-77EB31",
          projectId: "proj-gde",
          serviceName: "Compute Engine",
          usageDate: "2026-09-15",
          currency: "TWD",
          grossCost: 164.6601,
          creditsAmount: -164.8987,
          netCost: -0.2385,
        },
      ],
      ["host.billing_export.gcp_billing_export_v1_01A8F2_94C110_77EB31"],
      windowCtx,
      refDate.toISOString()
    );

    assert.deepEqual(report.availableMonths, ["202611", "202610", "202609"]);
    assert.equal(report.byMonth?.["202611"]?.hasRows, false);
    assert.equal(report.byMonth?.["202611"]?.rowCount, 0);
    assert.equal(report.byMonth?.["202611"]?.totalsByCurrency[0]?.prevMonthGrossCost, 254.6649);

    const oct = report.byMonth?.["202610"];
    assert.ok(oct && oct.hasRows);
    assert.equal(oct.totalsByCurrency.length, 1);
    const octTwd = oct.totalsByCurrency[0];
    assert.equal(octTwd.currentMonthGrossCost, 254.6649);
    assert.equal(octTwd.currentMonthCredits, -254.6651);
    assert.equal(octTwd.prevMonthGrossCost, 164.6601);
    assert.equal(octTwd.prevMonthCredits, -164.8987);
    assert.equal(octTwd.deltaPercentVsPrevSameDay, null);
    assert.equal(octTwd.topServices[0].serviceName, "Compute Engine");
    assert.ok(octTwd.topServices[0].sharePercent > 75);
    assert.equal(octTwd.topServices[1].serviceName, "Networking");
    assert.equal(octTwd.topServices[2].serviceName, "Cloud Logging");
  });

  it("returns null delta when both current and previous net spend are <= 0 and freezes settled historical months to prune BigQuery scans", async () => {
    assert.equal(computeDeltaPercent(-0.0002, -0.2385), null);
    assert.equal(computeDeltaPercent(0.005, 0.005), null);
    assert.equal(computeDeltaPercent(0.0051, 0), 100);
    assert.equal(computeDeltaPercent(125, 100), 25);

    const refDate = new Date("2026-11-16T08:00:00Z");
    const windowCtx = computeBillingDateWindow(refDate);

    const initialReport = aggregateSpendRows(
      [
        {
          invoiceMonth: "202609",
          billingAccountId: "01A8F2-94C110-77EB31",
          projectId: "proj-legacy",
          serviceName: "Cloud Run",
          usageDate: "2026-09-01",
          currency: "TWD",
          grossCost: 10,
          creditsAmount: -10,
          netCost: 0,
        },
        {
          invoiceMonth: "202609",
          billingAccountId: "01A8F2-94C110-77EB31",
          projectId: "proj-gde",
          serviceName: "Compute Engine",
          usageDate: "2026-09-30",
          currency: "TWD",
          grossCost: 100,
          creditsAmount: -100.2385,
          netCost: -0.2385,
        },
        {
          invoiceMonth: "202609",
          billingAccountId: "01A8F2-94C110-77EB31",
          projectId: "proj-gde",
          serviceName: "Compute Engine",
          usageDate: "2026-10-01",
          currency: "TWD",
          grossCost: 54.6601,
          creditsAmount: -54.6601,
          netCost: 0,
        },
        {
          invoiceMonth: "202610",
          billingAccountId: "01A8F2-94C110-77EB31",
          projectId: "proj-gde",
          serviceName: "Compute Engine",
          usageDate: "2026-10-01",
          currency: "TWD",
          grossCost: 254.6649,
          creditsAmount: -254.6651,
          netCost: -0.0002,
        },
      ],
      ["host.billing_export.gcp_billing_export_v1_01A8F2_94C110_77EB31"],
      windowCtx,
      refDate.toISOString()
    );

    assert.equal(initialReport.byMonth?.["202609"]?.settled, true);
    assert.equal(initialReport.byMonth?.["202609"]?.coveredDays, 3);
    assert.equal(initialReport.byMonth?.["202610"]?.settled, false);
    assert.equal(initialReport.byMonth?.["202610"]?.coveredDays, 1);

    const spilloverOnly = aggregateSpendRows(
      [
        {
          invoiceMonth: "202609",
          billingAccountId: "01A8F2-94C110-77EB31",
          projectId: "proj-gde",
          serviceName: "Compute Engine",
          usageDate: "2026-10-28",
          currency: "TWD",
          grossCost: 10,
          creditsAmount: 0,
          netCost: 10,
        },
        ...Array.from({ length: 28 }, (_, i) => ({
          invoiceMonth: "202611",
          billingAccountId: "01A8F2-94C110-77EB31",
          projectId: "proj-gde",
          serviceName: "Compute Engine",
          usageDate: `2026-11-${String(i + 1).padStart(2, "0")}`,
          currency: "TWD",
          grossCost: 1,
          creditsAmount: 0,
          netCost: 1,
        })),
      ],
      ["host.billing_export.gcp_billing_export_v1_01A8F2_94C110_77EB31"],
      windowCtx,
      refDate.toISOString()
    );
    assert.equal(spilloverOnly.byMonth?.["202609"]?.settled, false);
    assert.equal(spilloverOnly.byMonth?.["202611"]?.settled, false);

    let prunedBody: { queryParameters?: Array<{ name: string; parameterValue?: { value?: string } }> } | null = null;
    const prunedRes = await queryBillingExportSpend(
      "fake-token",
      {
        "01A8F2-94C110-77EB31": {
          billingAccountId: "01A8F2-94C110-77EB31",
          tableId: "host.billing_export.gcp_billing_export_v1_01A8F2_94C110_77EB31",
        },
      },
      "host",
      refDate,
      async (_url, init) => {
        prunedBody = JSON.parse(String(init?.body ?? "{}"));
        return new Response(
          JSON.stringify({
            jobComplete: true,
            rows: [
              {
                f: [
                  { v: "202610" },
                  { v: "01A8F2-94C110-77EB31" },
                  { v: "proj-gde" },
                  { v: "Compute Engine" },
                  { v: "2026-10-03" },
                  { v: "TWD" },
                  { v: "300.5" },
                  { v: "-300.5" },
                  { v: "0" },
                ],
              },
            ],
          }),
          { status: 200 }
        );
      },
      initialReport
    );

    assert.ok(prunedBody);
    const params = Object.fromEntries(
      (prunedBody.queryParameters ?? []).map((p) => [p.name, p.parameterValue?.value])
    );
    assert.equal(params.partitionStart, "2026-10-01T00:00:00Z");
    assert.equal(params.minInvoiceMonth, "202610");

    assert.deepEqual(prunedRes.report.availableMonths, ["202611", "202610", "202609"]);
    assert.equal(prunedRes.report.byMonth?.["202609"]?.settled, true);
    assert.equal(prunedRes.report.byMonth?.["202609"]?.totalsByCurrency[0]?.currentMonthGrossCost, 164.6601);
    const octMerged = prunedRes.report.byMonth?.["202610"];
    assert.ok(octMerged);
    assert.equal(octMerged.totalsByCurrency[0].prevMonthTotalNetCost, -0.2385);
    assert.equal(octMerged.totalsByCurrency[0].prevMonthGrossCost, 164.6601);
    assert.equal(octMerged.totalsByCurrency[0].prevMonthCredits, -164.8986);
    assert.equal(octMerged.totalsByCurrency[0].deltaPercentVsPrevSameDay, null);
    assert.equal(octMerged.byProject["proj-legacy"]?.prevMonthGrossCost, 10);
  });

  it("enforces sequential backfill guard before settling immediate previous month", () => {
    assert.equal(getDaysInInvoiceMonth("202402"), 29);
    assert.equal(getDaysInInvoiceMonth("202602"), 28);
    assert.equal(getDaysInInvoiceMonth("202610"), 31);
    assert.equal(getDaysInInvoiceMonth("202611"), 30);

    const refDate = new Date("2026-11-16T08:00:00Z");
    const windowCtx = computeBillingDateWindow(refDate);
    const fullOctRows = Array.from({ length: 31 }, (_, i) => ({
      invoiceMonth: "202610",
      billingAccountId: "01A8F2-94C110-77EB31",
      projectId: "proj-gde",
      serviceName: "Compute Engine",
      usageDate: `2026-10-${String(i + 1).padStart(2, "0")}`,
      currency: "TWD",
      grossCost: 100,
      creditsAmount: 0,
      netCost: 100,
    }));

    // Case 1: 202610 has all 31 days, 202611 has 0 rows -> 202610 MUST stay unsettled
    const nov0Report = aggregateSpendRows(
      fullOctRows,
      ["host.billing_export.gcp_billing_export_v1_01A8F2_94C110_77EB31"],
      windowCtx,
      refDate.toISOString()
    );
    assert.equal(nov0Report.byMonth?.["202610"]?.coveredDays, 31);
    assert.equal(nov0Report.byMonth?.["202610"]?.settled, false);

    // Case 2: 202610 has 31 days, 202611 has only 1 day (11-01) -> still unsettled
    const nov1Report = aggregateSpendRows(
      [
        ...fullOctRows,
        {
          invoiceMonth: "202611",
          billingAccountId: "01A8F2-94C110-77EB31",
          projectId: "proj-gde",
          serviceName: "Compute Engine",
          usageDate: "2026-11-01",
          currency: "TWD",
          grossCost: 100,
          creditsAmount: 0,
          netCost: 100,
        },
      ],
      ["host.billing_export.gcp_billing_export_v1_01A8F2_94C110_77EB31"],
      windowCtx,
      refDate.toISOString()
    );
    assert.equal(nov1Report.byMonth?.["202610"]?.settled, false);

    // Case 3: 202611 reaches 2 distinct days (11-01, 11-02) -> 202610 settles to true
    const nov2Report = aggregateSpendRows(
      [
        ...fullOctRows,
        {
          invoiceMonth: "202611",
          billingAccountId: "01A8F2-94C110-77EB31",
          projectId: "proj-gde",
          serviceName: "Compute Engine",
          usageDate: "2026-11-01",
          currency: "TWD",
          grossCost: 100,
          creditsAmount: 0,
          netCost: 100,
        },
        {
          invoiceMonth: "202611",
          billingAccountId: "01A8F2-94C110-77EB31",
          projectId: "proj-gde",
          serviceName: "Compute Engine",
          usageDate: "2026-11-02",
          currency: "TWD",
          grossCost: 100,
          creditsAmount: 0,
          netCost: 100,
        },
      ],
      ["host.billing_export.gcp_billing_export_v1_01A8F2_94C110_77EB31"],
      windowCtx,
      refDate.toISOString()
    );
    assert.equal(nov2Report.byMonth?.["202610"]?.settled, true);
    assert.equal(nov2Report.byMonth?.["202611"]?.settled, false);
  });

  it("bumps snapshot schema version to 7 and invalidates stale v6 cache snapshots", () => {
    const tmpDir = mkdtempSync(join(tmpdir(), "agy-store-v7-test-"));
    try {
      const store = new CompanionStore(tmpDir);
      const saved = store.saveSnapshot("dev@example.com", {
        fetchedAt: new Date().toISOString(),
        projects: [],
        billingAccounts: [],
        spendReport: null,
        warnings: [],
      });
      assert.equal(saved.version, 7);
      assert.ok(store.loadSnapshot("dev@example.com"));

      const cacheFile = readdirSync(tmpDir).find((f) => f.startsWith("cache-") && f.endsWith(".json"));
      assert.ok(cacheFile);
      const fullPath = join(tmpDir, cacheFile);
      const stale = JSON.parse(readFileSync(fullPath, "utf-8"));
      stale.version = 6;
      writeFileSync(fullPath, JSON.stringify(stale));

      assert.equal(store.loadSnapshot("dev@example.com"), null);
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe("CompanionService End-to-End Mocked Cloud & Cache Flow", () => {
  it("fetches Projects, Billing Accounts, Budgets & BigQuery Spend and serves 6h TTL cache", async () => {
    const tmpDir = mkdtempSync(join(tmpdir(), "agy-service-test-"));
    const fakeGcloudDir = join(tmpDir, "gcloud-cfg");
    mkdirSync(join(fakeGcloudDir, "configurations"), { recursive: true });
    writeFileSync(join(fakeGcloudDir, "active_config"), "default");
    writeFileSync(
      join(fakeGcloudDir, "configurations", "config_default"),
      "[core]\naccount = tester@example.com\nproject = app-prod\n"
    );
    writeFileSync(
      join(fakeGcloudDir, "application_default_credentials.json"),
      JSON.stringify({
        type: "authorized_user",
        client_id: "cid",
        client_secret: "csecret",
        refresh_token: "1//fake-refresh",
      })
    );

    let networkHits = 0;
    const mockFetch: typeof globalThis.fetch = async (input) => {
      networkHits++;
      const url = String(input);

      if (url === "https://oauth2.googleapis.com/token") {
        return new Response(JSON.stringify({ access_token: "ya29.mockToken" }), { status: 200 });
      }
      if (url.startsWith("https://cloudresourcemanager.googleapis.com/v1/projects")) {
        return new Response(
          JSON.stringify({
            projects: [
              {
                projectId: "app-prod",
                projectNumber: "1001",
                name: "App Production",
                lifecycleState: "ACTIVE",
              },
              {
                projectId: "sandbox-free",
                projectNumber: "1002",
                name: "Sandbox Free",
                lifecycleState: "ACTIVE",
              },
            ],
          }),
          { status: 200 }
        );
      }
      if (url.startsWith("https://cloudbilling.googleapis.com/v1/billingAccounts?")) {
        return new Response(
          JSON.stringify({
            billingAccounts: [
              {
                name: "billingAccounts/01AAAA-BBBBBB-CCCCCC",
                displayName: "Main Corp Billing",
                open: true,
                currencyCode: "USD",
              },
            ],
          }),
          { status: 200 }
        );
      }
      if (
        url.startsWith(
          "https://cloudbilling.googleapis.com/v1/billingAccounts/01AAAA-BBBBBB-CCCCCC/projects"
        )
      ) {
        return new Response(
          JSON.stringify({
            projectBillingInfo: [
              {
                projectId: "app-prod",
                billingAccountName: "billingAccounts/01AAAA-BBBBBB-CCCCCC",
                billingEnabled: true,
              },
            ],
          }),
          { status: 200 }
        );
      }
      if (url.includes("/budgets")) {
        return new Response(
          JSON.stringify({
            budgets: [
              {
                name: "b1",
                displayName: "Prod Cap",
                amount: { specifiedAmount: { currencyCode: "USD", units: "500" } },
                thresholdRules: [{ thresholdPercent: 0.8, spendBasis: "CURRENT_SPEND" }],
              },
            ],
          }),
          { status: 200 }
        );
      }
      if (url.includes("/bigquery/v2/projects/app-prod/datasets?")) {
        return new Response(
          JSON.stringify({
            datasets: [{ datasetReference: { datasetId: "billing_export" } }],
          }),
          { status: 200 }
        );
      }
      if (url.includes("/bigquery/v2/projects/app-prod/datasets/billing_export/tables")) {
        return new Response(
          JSON.stringify({
            tables: [
              {
                tableReference: {
                  tableId: "gcp_billing_export_v1_01AAAA_BBBBBB_CCCCCC",
                },
              },
            ],
          }),
          { status: 200 }
        );
      }
      if (url.includes("/bigquery/v2/projects/app-prod/queries")) {
        return new Response(
          JSON.stringify({
            jobComplete: true,
            rows: [
              {
                f: [
                  { v: "202611" },
                  { v: "01AAAA-BBBBBB-CCCCCC" },
                  { v: "app-prod" },
                  { v: "Cloud Run" },
                  { v: "2026-11-12" },
                  { v: "USD" },
                  { v: "52.5" },
                  { v: "-2.5" },
                  { v: "50.0" },
                ],
              },
            ],
          }),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify({ error: { message: `Unhandled ${url}` } }), {
        status: 404,
      });
    };

    try {
      const store = new CompanionStore(join(tmpDir, "store"));
      const gcloud = new GcloudClient({
        execFn: async () => {
          throw new Error("gcloud binary intentionally absent to test ADC fallback");
        },
        fetchFn: mockFetch,
        gcloudConfigDir: fakeGcloudDir,
      });

      let clock = new Date("2026-11-14T10:00:00Z");
      const service = new CompanionService({
        store,
        gcloud,
        fetchFn: mockFetch,
        nowFn: () => clock,
      });

      // 1. Base mode (no BQ export configured yet)
      const first = await service.getOverview();
      assert.equal(first.auth.authenticated, true);
      assert.equal(first.auth.source, "adc");
      assert.equal(first.summary.totalProjects, 2);
      assert.equal(first.summary.billedProjects, 1);
      assert.equal(first.summary.unbilledProjects, 1);
      assert.equal(first.billingAccounts[0].budgets[0].amountUnits, 500);
      assert.equal(first.cache.hit, false);

      const hitsAfterFirst = networkHits;

      // 2. Cached read 30 minutes later -> ZERO new network calls!
      clock = new Date("2026-11-14T10:30:00Z");
      const second = await service.getOverview();
      assert.equal(second.cache.hit, true);
      assert.equal(networkHits, hitsAfterFirst);

      // 3. Discover & bind BigQuery Billing Export -> unlocks spend!
      const discovered = await service.discoverExportTables("app-prod");
      assert.equal(discovered.length, 1);
      assert.equal(discovered[0].inferredBillingAccountId, "01AAAA-BBBBBB-CCCCCC");

      const withSpend = await service.configureExportTable({
        billingAccountId: discovered[0].inferredBillingAccountId!,
        tableId: discovered[0].tableId,
      });
      assert.equal(withSpend.spend.configured, true);
      assert.equal(withSpend.spend.totalsByCurrency[0].currentMonthNetCost, 50);
      assert.equal(withSpend.spend.byProject["app-prod"].currentMonthCredits, -2.5);
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("falls back automatically for custom BigQuery views without _PARTITIONTIME and polls pending jobs", async () => {
    const tmpDir = mkdtempSync(join(tmpdir(), "agy-bq-fallback-"));
    const fakeGcloudDir = join(tmpDir, "gcloud-cfg");
    mkdirSync(join(fakeGcloudDir, "configurations"), { recursive: true });
    writeFileSync(join(fakeGcloudDir, "active_config"), "default");
    writeFileSync(
      join(fakeGcloudDir, "configurations", "config_default"),
      "[core]\naccount = finops@example.com\nproject = finops-view-proj\n"
    );
    writeFileSync(
      join(fakeGcloudDir, "application_default_credentials.json"),
      JSON.stringify({
        type: "authorized_user",
        client_id: "cid",
        client_secret: "csecret",
        refresh_token: "1//fake",
      })
    );

    let bqAttempt = 0;
    const mockFetch: typeof globalThis.fetch = async (input, init) => {
      const url = String(input);
      if (url === "https://oauth2.googleapis.com/token") {
        return new Response(JSON.stringify({ access_token: "ya29.mock" }), { status: 200 });
      }
      if (url.startsWith("https://cloudresourcemanager.googleapis.com/v1/projects")) {
        return new Response(JSON.stringify({ projects: [] }), { status: 200 });
      }
      if (url.startsWith("https://cloudbilling.googleapis.com/v1/billingAccounts")) {
        return new Response(JSON.stringify({ billingAccounts: [] }), { status: 200 });
      }
      if (url.endsWith("/bigquery/v2/projects/finops-view-proj/queries")) {
        bqAttempt++;
        const bodyText = String(init?.body ?? "");
        if (bodyText.includes("_PARTITIONTIME")) {
          return new Response(
            JSON.stringify({
              error: { message: "Unrecognized name: _PARTITIONTIME at [11:7]" },
            }),
            { status: 400 }
          );
        }
        // Return jobComplete: false first to verify polling path
        return new Response(
          JSON.stringify({
            jobComplete: false,
            jobReference: { projectId: "finops-view-proj", jobId: "job_123", location: "US" },
          }),
          { status: 200 }
        );
      }
      if (url.includes("/bigquery/v2/projects/finops-view-proj/queries/job_123")) {
        return new Response(
          JSON.stringify({
            jobComplete: true,
            rows: [
              {
                f: [
                  { v: "202611" },
                  { v: "01AAAA-BBBBBB-CCCCCC" },
                  { v: "finops-view-proj" },
                  { v: "BigQuery" },
                  { v: "2026-11-10" },
                  { v: "USD" },
                  { v: "20" },
                  { v: "-5" },
                  { v: "15" },
                ],
              },
            ],
          }),
          { status: 200 }
        );
      }
      return new Response("{}", { status: 404 });
    };

    try {
      const store = new CompanionStore(join(tmpDir, "store"));
      const gcloud = new GcloudClient({
        execFn: async () => {
          throw new Error("no gcloud");
        },
        fetchFn: mockFetch,
        gcloudConfigDir: fakeGcloudDir,
      });
      const service = new CompanionService({
        store,
        gcloud,
        fetchFn: mockFetch,
        nowFn: () => new Date("2026-11-14T10:00:00Z"),
      });

      const res = await service.configureExportTable({
        billingAccountId: "*",
        tableId: "finops-view-proj.views.custom_billing_view",
      });
      assert.equal(bqAttempt, 2);
      assert.equal(res.spend.totalsByCurrency[0].currentMonthNetCost, 15);
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("scopes Cloud Billing API diagnostics strictly to active quotaProject without leaking unrelated project IAM errors", async () => {
    const seenQuotaProjects: Array<string | null> = [];
    const mockFetch: typeof globalThis.fetch = async (_input, init) => {
      const hdrs = (init?.headers ?? {}) as Record<string, string>;
      const qp = hdrs["x-goog-user-project"] ?? null;
      seenQuotaProjects.push(qp);
      if (qp === null) {
        return new Response(
          JSON.stringify({
            error: { message: "The cloudbilling.googleapis.com API requires a quota project." },
          }),
          { status: 403 }
        );
      }
      if (qp === "sk-dev-backyard") {
        return new Response(
          JSON.stringify({
            error: {
              message:
                "Cloud Billing API has not been used in project sk-dev-backyard before or it is disabled.",
            },
          }),
          { status: 403 }
        );
      }
      return new Response(
        JSON.stringify({
          error: {
            message: "Caller does not have required permission to use project beaming-light-336511.",
          },
        }),
        { status: 403 }
      );
    };

    const result = await fetchBillingAccountsAndProjectLinks(
      "ya29.mock",
      [
        {
          projectId: "beaming-light-336511",
          projectNumber: "1",
          name: "Other Shared Project",
          lifecycleState: "ACTIVE",
          billingAccountId: null,
          billingEnabled: false,
        },
        {
          projectId: "sk-dev-backyard",
          projectNumber: "2",
          name: "SK Dev Backyard",
          lifecycleState: "ACTIVE",
          billingAccountId: null,
          billingEnabled: false,
        },
      ],
      "sk-dev-backyard",
      mockFetch
    );

    assert.equal(result.billingAccounts.length, 0);
    assert.equal(result.warnings.length, 1);
    assert.ok(result.warnings[0].includes("sk-dev-backyard"));
    assert.ok(!result.warnings[0].includes("beaming-light-336511"));
    assert.ok(seenQuotaProjects.includes("beaming-light-336511"));
  });

  it("gracefully guides user to re-login when saved OAuth refresh token is expired or revoked", async () => {
    const tmpDir = mkdtempSync(join(tmpdir(), "agy-revoked-auth-"));
    const fakeGcloudDir = join(tmpDir, "gcloud-cfg");
    mkdirSync(join(fakeGcloudDir, "configurations"), { recursive: true });
    writeFileSync(join(fakeGcloudDir, "active_config"), "default");
    writeFileSync(
      join(fakeGcloudDir, "configurations", "config_default"),
      "[core]\naccount = expired@example.com\n"
    );
    writeFileSync(
      join(fakeGcloudDir, "application_default_credentials.json"),
      JSON.stringify({
        type: "authorized_user",
        client_id: "cid",
        client_secret: "csecret",
        refresh_token: "1//revoked-token",
      })
    );

    const mockFetch: typeof globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: "invalid_grant" }), { status: 400 });

    try {
      const store = new CompanionStore(join(tmpDir, "store"));
      const gcloud = new GcloudClient({
        execFn: async () => {
          throw new Error("no gcloud");
        },
        fetchFn: mockFetch,
        gcloudConfigDir: fakeGcloudDir,
      });
      const service = new CompanionService({ store, gcloud, fetchFn: mockFetch });
      const overview = await service.getOverview();
      assert.equal(overview.auth.authenticated, false);
      assert.ok((overview.auth.setupHint || "").includes("gcloud auth login"));
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("deduplicates concurrent getOverview calls without letting forceRefresh reuse an unforced promise", async () => {
    const tmpDir = mkdtempSync(join(tmpdir(), "agy-singleflight-"));
    const fakeGcloudDir = join(tmpDir, "gcloud-cfg");
    mkdirSync(join(fakeGcloudDir, "configurations"), { recursive: true });
    mkdirSync(join(fakeGcloudDir, "legacy_credentials", "tester@example.com"), {
      recursive: true,
    });
    writeFileSync(join(fakeGcloudDir, "active_config"), "default");
    writeFileSync(
      join(fakeGcloudDir, "configurations", "config_default"),
      "[core]\naccount = tester@example.com\nproject = app-prod\n"
    );
    writeFileSync(
      join(fakeGcloudDir, "legacy_credentials", "tester@example.com", "adc.json"),
      JSON.stringify({
        type: "authorized_user",
        client_id: "cid",
        client_secret: "csecret",
        refresh_token: "1//fake",
      })
    );

    const gates: Array<() => void> = [];
    let projectsFetchCount = 0;
    let shouldFailProjects = false;

    const mockFetch: typeof globalThis.fetch = async (input) => {
      const url = String(input);
      if (url === "https://oauth2.googleapis.com/token") {
        return new Response(JSON.stringify({ access_token: "ya29.mock" }), { status: 200 });
      }
      if (url.startsWith("https://cloudresourcemanager.googleapis.com/v1/projects")) {
        projectsFetchCount++;
        await new Promise<void>((resolveGate) => {
          gates.push(resolveGate);
        });
        if (shouldFailProjects) {
          return new Response(JSON.stringify({ error: { message: "Internal error" } }), {
            status: 500,
          });
        }
        return new Response(
          JSON.stringify({
            projects: [
              {
                projectId: "app-prod",
                projectNumber: "1001",
                name: "App Prod",
                lifecycleState: "ACTIVE",
              },
            ],
          }),
          { status: 200 }
        );
      }
      if (url.startsWith("https://cloudbilling.googleapis.com/v1/billingAccounts")) {
        return new Response(JSON.stringify({ billingAccounts: [] }), { status: 200 });
      }
      return new Response("{}", { status: 404 });
    };

    try {
      const store = new CompanionStore(join(tmpDir, "store"));
      const gcloud = new GcloudClient({
        execFn: async () => {
          throw new Error("no gcloud");
        },
        fetchFn: mockFetch,
        gcloudConfigDir: fakeGcloudDir,
      });
      const service = new CompanionService({ store, gcloud, fetchFn: mockFetch });

      // 0. Rejection clears the in-flight slot so the next call retries cleanly
      shouldFailProjects = true;
      const initialFailPromise = service.getOverview({ forceRefresh: true });
      for (let i = 0; i < 20 && gates.length < 1; i++) {
        await new Promise((r) => setTimeout(r, 5));
      }
      gates.shift()?.();
      await assert.rejects(initialFailPromise, /Failed to fetch Google Cloud data/);
      assert.equal(projectsFetchCount, 1);

      // 1. Start unforced live fetch and wait until it reaches upstream projects fetch
      shouldFailProjects = false;
      const unforcedPromise = service.getOverview({ forceRefresh: false });
      for (let i = 0; i < 20 && projectsFetchCount < 2; i++) {
        await new Promise((r) => setTimeout(r, 5));
      }
      assert.equal(projectsFetchCount, 2);

      // 2. Calling forceRefresh: true while unforced is in flight must NOT reuse unforcedPromise
      const forcedPromise = service.getOverview({ forceRefresh: true });
      assert.notEqual(forcedPromise, unforcedPromise);
      for (let i = 0; i < 20 && projectsFetchCount < 3; i++) {
        await new Promise((r) => setTimeout(r, 5));
      }
      assert.equal(projectsFetchCount, 3);

      // 3. Unforced caller arriving while forced is in flight shares the forced promise
      const unforcedJoiningForced = service.getOverview({ forceRefresh: false });
      assert.equal(unforcedJoiningForced, forcedPromise);
      assert.equal(projectsFetchCount, 3);

      // Release both gates
      while (gates.length > 0) {
        gates.shift()?.();
      }
      const [r1, r2, r3] = await Promise.all([
        unforcedPromise,
        forcedPromise,
        unforcedJoiningForced,
      ]);
      assert.equal(r1.summary.totalProjects, 1);
      assert.equal(r2.summary.totalProjects, 1);
      assert.equal(r3, r2);

      // 4. Subsequent forced refresh triggers a fresh upstream fetch after in-flight slot clears
      const followUpPromise = service.getOverview({ forceRefresh: true });
      for (let i = 0; i < 20 && gates.length < 1; i++) {
        await new Promise((r) => setTimeout(r, 5));
      }
      gates.shift()?.();
      const recovered = await followUpPromise;
      assert.equal(recovered.cache.stale, false);
      assert.equal(projectsFetchCount, 4);
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("caps quota-project probing on SERVICE_DISABLED and skips billingInfo storm while preserving 5xx fallback", async () => {
    const projects = Array.from({ length: 10 }, (_, idx) => ({
      projectId: `proj-${idx + 1}`,
      projectNumber: String(idx + 1),
      name: `Project ${idx + 1}`,
      lifecycleState: "ACTIVE",
      billingAccountId: null,
      billingEnabled: false,
    }));

    // Case A: All candidates fail with SERVICE_DISABLED / requires a quota project
    let disabledFetchCount = 0;
    let disabledBillingInfoHits = 0;
    const disabledFetch: typeof globalThis.fetch = async (input) => {
      disabledFetchCount++;
      const url = String(input);
      if (url.includes("/billingInfo")) {
        disabledBillingInfoHits++;
      }
      return new Response(
        JSON.stringify({
          error: {
            message: "Cloud Billing API has not been used in project before or it is disabled.",
          },
        }),
        { status: 403 }
      );
    };

    const disabledRes = await fetchBillingAccountsAndProjectLinks(
      "ya29.mock",
      projects,
      "proj-1",
      disabledFetch
    );
    assert.equal(disabledRes.billingAccounts.length, 0);
    assert.equal(disabledRes.usedQuotaProject, null);
    assert.equal(disabledBillingInfoHits, 0);
    // target (1) + 2 extra fallbacks + null (1) = 4 requests total (no per-candidate null retry, no billingInfo loop)
    assert.equal(disabledFetchCount, 4);

    // Case B: Transient 503 on billingAccounts.list preserves project-level billingInfo fallback
    let transientBillingInfoHits = 0;
    const transientFetch: typeof globalThis.fetch = async (input) => {
      const url = String(input);
      if (url.includes("/billingAccounts?")) {
        return new Response(JSON.stringify({ error: { message: "Backend Error" } }), {
          status: 503,
        });
      }
      if (url.includes("/projects/proj-1/billingInfo")) {
        transientBillingInfoHits++;
        return new Response(
          JSON.stringify({
            billingAccountName: "billingAccounts/01AAAA-BBBBBB-CCCCCC",
            billingEnabled: true,
          }),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify({}), { status: 200 });
    };

    const transientRes = await fetchBillingAccountsAndProjectLinks(
      "ya29.mock",
      projects.slice(0, 1),
      "proj-1",
      transientFetch
    );
    assert.equal(transientBillingInfoHits, 1);
    assert.equal(transientRes.billingAccounts.length, 1);
    assert.equal(transientRes.billingAccounts[0].id, "01AAAA-BBBBBB-CCCCCC");
  });

  it("treats pending BigQuery billing export 404 as empty rows while surfacing non-export table 404s", async () => {
    const mockFetch: typeof globalThis.fetch = async (_input, init) => {
      const body = String(init?.body ?? "");
      if (body.includes("gcp_billing_export_v1_")) {
        return new Response(
          JSON.stringify({
            error: {
              message:
                "Not found: Table host-proj:billing_ds.gcp_billing_export_v1_01AAAA_BBBBBB_CCCCCC",
            },
          }),
          { status: 404 }
        );
      }
      return new Response(
        JSON.stringify({
          error: { message: "Not found: Table host-proj:billing_ds.custom_table" },
        }),
        { status: 404 }
      );
    };

    const pendingRes = await queryBillingExportSpend(
      "ya29.mock",
      {
        "01AAAA-BBBBBB-CCCCCC": {
          billingAccountId: "01AAAA-BBBBBB-CCCCCC",
          tableId: "host-proj.billing_ds.gcp_billing_export_v1_01AAAA_BBBBBB_CCCCCC",
          hostProjectId: "host-proj",
          exportType: "standard",
          addedAt: "2026-11-16T00:00:00Z",
        },
      },
      "host-proj",
      new Date("2026-11-16T00:00:00Z"),
      mockFetch
    );
    assert.equal(pendingRes.warnings.length, 0);
    assert.equal(pendingRes.report.configured, true);
    assert.equal(pendingRes.report.totalsByCurrency.length, 0);

    const customMissingRes = await queryBillingExportSpend(
      "ya29.mock",
      {
        "*": {
          billingAccountId: "*",
          tableId: "host-proj.billing_ds.custom_table",
          hostProjectId: "host-proj",
          exportType: "custom",
          addedAt: "2026-11-16T00:00:00Z",
        },
      },
      "host-proj",
      new Date("2026-11-16T00:00:00Z"),
      mockFetch
    );
    assert.equal(customMissingRes.warnings.length, 1);
    assert.ok(customMissingRes.warnings[0].includes("404"));
  });
});
