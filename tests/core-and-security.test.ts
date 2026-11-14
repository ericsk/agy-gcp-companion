import assert from "node:assert/strict";
import { mkdtempSync, rmSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  aggregateSpendRows,
  buildBillingExportSql,
  computeBillingDateWindow,
  inferBillingAccountFromTableName,
} from "../src/core/bigquery-billing.ts";
import { CompanionService } from "../src/core/companion-service.ts";
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
});
