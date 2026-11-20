import { aggregateSpendRows, computeBillingDateWindow,                  } from "./bigquery-billing.mjs";
import { maskEmail } from "./security.mjs";
             
             
                 
                            
                       
             
                    

export function buildDemoOverview(
  prefs                      ,
  referenceDate       = new Date(),
  activeProjectOverride                ,
  projectBillingOverrides                         
)                            {
  const demoAccount = "developer@example-corp.com";
  const activeProject = activeProjectOverride || "acme-ai-assistant-prod";
  const pinnedSet = new Set(
    prefs.pinnedProjects.length > 0
      ? prefs.pinnedProjects
      : ["acme-ai-assistant-prod", "acme-data-platform"]
  );

  const auth             = {
    authenticated: true,
    source: "demo",
    gcloudInstalled: true,
    gcloudBinaryPath: "/opt/homebrew/bin/gcloud",
    activeAccount: demoAccount,
    maskedActiveAccount: maskEmail(demoAccount),
    activeProject,
    accounts: [
      {
        account: demoAccount,
        maskedAccount: maskEmail(demoAccount) ?? demoAccount,
        active: true,
      },
      {
        account: "personal-lab@gmail.com",
        maskedAccount: maskEmail("personal-lab@gmail.com") ?? "p***b@gmail.com",
        active: false,
      },
    ],
    setupHint: "Demo Preview Mode is active. Switch off Demo Mode in Billing -> Settings to use live gcloud data.",
  };

  const baProd = "01A8F2-94C110-77EB31";
  const baSandbox = "01F4D9-22B801-55CA09";

  const billingAccounts                   = [
    {
      id: baProd,
      resourceName: `billingAccounts/${baProd}`,
      displayName: "Acme Cloud Production Billing",
      open: true,
      currencyCode: "USD",
      linkedProjectCount: 3,
      linkedProjectIds: ["acme-ai-assistant-prod", "acme-data-platform", "acme-web-portal"],
      exportTableId: `acme-billing-admin.billing_export.gcp_billing_export_v1_01A8F2_94C110_77EB31`,
      budgets: [
        {
          name: `billingAccounts/${baProd}/budgets/monthly-prod-cap`,
          displayName: "Monthly Prod Spend Alert",
          billingAccountId: baProd,
          amountUnits: 800,
          currencyCode: "USD",
          lastPeriodAmount: false,
          projectFilterIds: [],
          thresholds: [
            { thresholdPercent: 0.5, spendBasis: "CURRENT_SPEND" },
            { thresholdPercent: 0.9, spendBasis: "CURRENT_SPEND" },
            { thresholdPercent: 1.0, spendBasis: "FORECASTED_SPEND" },
          ],
        },
      ],
    },
    {
      id: baSandbox,
      resourceName: `billingAccounts/${baSandbox}`,
      displayName: "R&D Credits & Prototyping",
      open: true,
      currencyCode: "USD",
      linkedProjectCount: 1,
      linkedProjectIds: ["agy-agent-experiments"],
      exportTableId: `acme-billing-admin.billing_export.gcp_billing_export_v1_01F4D9_22B801_55CA09`,
      budgets: [
        {
          name: `billingAccounts/${baSandbox}/budgets/rd-alert`,
          displayName: "R&D Sandbox Cap",
          billingAccountId: baSandbox,
          amountUnits: 150,
          currencyCode: "USD",
          lastPeriodAmount: false,
          projectFilterIds: [],
          thresholds: [{ thresholdPercent: 0.8, spendBasis: "CURRENT_SPEND" }],
        },
      ],
    },
  ];

  const projects               = [
    {
      projectId: "acme-ai-assistant-prod",
      projectNumber: "482910384712",
      name: "Acme AI Assistant (Prod)",
      lifecycleState: "ACTIVE",
      labels: { env: "prod", team: "ai" },
      billingAccountId: baProd,
      billingAccountName: "Acme Cloud Production Billing",
      billingEnabled: true,
      pinned: pinnedSet.has("acme-ai-assistant-prod"),
      isActiveProject: activeProject === "acme-ai-assistant-prod",
    },
    {
      projectId: "acme-data-platform",
      projectNumber: "739104827165",
      name: "Acme Data & BigQuery Hub",
      lifecycleState: "ACTIVE",
      labels: { env: "prod", team: "data" },
      billingAccountId: baProd,
      billingAccountName: "Acme Cloud Production Billing",
      billingEnabled: true,
      pinned: pinnedSet.has("acme-data-platform"),
      isActiveProject: activeProject === "acme-data-platform",
    },
    {
      projectId: "acme-web-portal",
      projectNumber: "194827561029",
      name: "Acme Customer Web Portal",
      lifecycleState: "ACTIVE",
      labels: { env: "prod", team: "web" },
      billingAccountId: baProd,
      billingAccountName: "Acme Cloud Production Billing",
      billingEnabled: true,
      pinned: pinnedSet.has("acme-web-portal"),
      isActiveProject: activeProject === "acme-web-portal",
    },
    {
      projectId: "agy-agent-experiments",
      projectNumber: "918273645019",
      name: "Antigravity Agent Experiments",
      lifecycleState: "ACTIVE",
      labels: { env: "dev", team: "ai" },
      billingAccountId: baSandbox,
      billingAccountName: "R&D Credits & Prototyping",
      billingEnabled: true,
      pinned: pinnedSet.has("agy-agent-experiments"),
      isActiveProject: activeProject === "agy-agent-experiments",
    },
    {
      projectId: "legacy-hackathon-2025",
      projectNumber: "554433221100",
      name: "Legacy Hackathon Prototype",
      lifecycleState: "ACTIVE",
      labels: { env: "archive" },
      billingAccountId: null,
      billingAccountName: null,
      billingEnabled: false,
      pinned: pinnedSet.has("legacy-hackathon-2025"),
      isActiveProject: activeProject === "legacy-hackathon-2025",
    },
  ];

  // Apply in-memory Demo Mode billing account overrides so switching billing can be previewed cleanly
  if (projectBillingOverrides && Object.keys(projectBillingOverrides).length > 0) {
    const baMap = new Map                        (billingAccounts.map((ba) => [ba.id, ba]));
    for (const [projId, targetBaId] of Object.entries(projectBillingOverrides)) {
      const proj = projects.find((p) => p.projectId === projId);
      if (!proj) continue;
      let targetBa = baMap.get(targetBaId);
      if (!targetBa) {
        targetBa = {
          id: targetBaId,
          resourceName: `billingAccounts/${targetBaId}`,
          displayName: `Billing Account (${targetBaId})`,
          open: true,
          currencyCode: "USD",
          linkedProjectCount: 0,
          linkedProjectIds: [],
          exportTableId: null,
          budgets: [],
        };
        billingAccounts.push(targetBa);
        baMap.set(targetBaId, targetBa);
      }
      for (const ba of billingAccounts) {
        if (ba.id !== targetBaId) {
          ba.linkedProjectIds = ba.linkedProjectIds.filter((id) => id !== projId);
          ba.linkedProjectCount = ba.linkedProjectIds.length;
        }
      }
      if (!targetBa.linkedProjectIds.includes(projId)) {
        targetBa.linkedProjectIds.push(projId);
        targetBa.linkedProjectCount = targetBa.linkedProjectIds.length;
      }
      proj.billingAccountId = targetBa.id;
      proj.billingAccountName = targetBa.displayName;
      proj.billingEnabled = targetBa.open;
    }
  }

  const windowCtx = computeBillingDateWindow(referenceDate);
  const year = referenceDate.getUTCFullYear();
  const month = String(referenceDate.getUTCMonth() + 1).padStart(2, "0");
  const prevDate = new Date(Date.UTC(year, referenceDate.getUTCMonth() - 1, 1));
  const prevYear = prevDate.getUTCFullYear();
  const prevMonth = String(prevDate.getUTCMonth() + 1).padStart(2, "0");
  const prev2Date = new Date(Date.UTC(year, referenceDate.getUTCMonth() - 2, 1));
  const prev2Year = prev2Date.getUTCFullYear();
  const prev2Month = String(prev2Date.getUTCMonth() + 1).padStart(2, "0");
  const prev2InvoiceMonth = `${prev2Year}${prev2Month}`;
  const maxDay = Math.max(windowCtx.dayOfMonthCutoff, 12);

  const rows                = [];
  for (let d = 1; d <= maxDay; d++) {
    const dayStr = String(d).padStart(2, "0");
    const wave = 1 + Math.sin(d * 0.6) * 0.18;

    // Current month rows
    rows.push(
      {
        invoiceMonth: windowCtx.currentInvoiceMonth,
        billingAccountId: baProd,
        projectId: "acme-ai-assistant-prod",
        serviceName: "Vertex AI",
        usageDate: `${year}-${month}-${dayStr}`,
        currency: "USD",
        grossCost: 18.5 * wave,
        creditsAmount: -2.1 * wave,
        netCost: 16.4 * wave,
      },
      {
        invoiceMonth: windowCtx.currentInvoiceMonth,
        billingAccountId: baProd,
        projectId: "acme-ai-assistant-prod",
        serviceName: "Cloud Run",
        usageDate: `${year}-${month}-${dayStr}`,
        currency: "USD",
        grossCost: 6.2 * wave,
        creditsAmount: -0.8 * wave,
        netCost: 5.4 * wave,
      },
      {
        invoiceMonth: windowCtx.currentInvoiceMonth,
        billingAccountId: baProd,
        projectId: "acme-ai-assistant-prod",
        serviceName: "Cloud Logging",
        usageDate: `${year}-${month}-${dayStr}`,
        currency: "USD",
        grossCost: 1.9,
        creditsAmount: -0.4,
        netCost: 1.5,
      },
      {
        invoiceMonth: windowCtx.currentInvoiceMonth,
        billingAccountId: baProd,
        projectId: "acme-data-platform",
        serviceName: "BigQuery",
        usageDate: `${year}-${month}-${dayStr}`,
        currency: "USD",
        grossCost: 11.4 * wave,
        creditsAmount: -1.2 * wave,
        netCost: 10.2 * wave,
      },
      {
        invoiceMonth: windowCtx.currentInvoiceMonth,
        billingAccountId: baProd,
        projectId: "acme-data-platform",
        serviceName: "Cloud Storage",
        usageDate: `${year}-${month}-${dayStr}`,
        currency: "USD",
        grossCost: 3.1,
        creditsAmount: 0,
        netCost: 3.1,
      },
      {
        invoiceMonth: windowCtx.currentInvoiceMonth,
        billingAccountId: baProd,
        projectId: "acme-web-portal",
        serviceName: "Cloud Run",
        usageDate: `${year}-${month}-${dayStr}`,
        currency: "USD",
        grossCost: 2.8,
        creditsAmount: -0.5,
        netCost: 2.3,
      },
      {
        invoiceMonth: windowCtx.currentInvoiceMonth,
        billingAccountId: baSandbox,
        projectId: "agy-agent-experiments",
        serviceName: "Gemini API / Vertex AI",
        usageDate: `${year}-${month}-${dayStr}`,
        currency: "USD",
        grossCost: 7.5 * wave,
        creditsAmount: -5.0 * wave,
        netCost: 2.5 * wave,
      }
    );
  }

  // Previous month rows (28 days)
  for (let d = 1; d <= 28; d++) {
    const dayStr = String(d).padStart(2, "0");
    rows.push(
      {
        invoiceMonth: windowCtx.previousInvoiceMonth,
        billingAccountId: baProd,
        projectId: "acme-ai-assistant-prod",
        serviceName: "Vertex AI",
        usageDate: `${prevYear}-${prevMonth}-${dayStr}`,
        currency: "USD",
        grossCost: 21.0,
        creditsAmount: -1.5,
        netCost: 19.5,
      },
      {
        invoiceMonth: windowCtx.previousInvoiceMonth,
        billingAccountId: baProd,
        projectId: "acme-data-platform",
        serviceName: "BigQuery",
        usageDate: `${prevYear}-${prevMonth}-${dayStr}`,
        currency: "USD",
        grossCost: 12.0,
        creditsAmount: -1.0,
        netCost: 11.0,
      },
      {
        invoiceMonth: windowCtx.previousInvoiceMonth,
        billingAccountId: baProd,
        projectId: "acme-web-portal",
        serviceName: "Cloud Run",
        usageDate: `${prevYear}-${prevMonth}-${dayStr}`,
        currency: "USD",
        grossCost: 2.4,
        creditsAmount: -0.4,
        netCost: 2.0,
      },
      {
        invoiceMonth: windowCtx.previousInvoiceMonth,
        billingAccountId: baSandbox,
        projectId: "agy-agent-experiments",
        serviceName: "Gemini API / Vertex AI",
        usageDate: `${prevYear}-${prevMonth}-${dayStr}`,
        currency: "USD",
        grossCost: 6.0,
        creditsAmount: -4.0,
        netCost: 2.0,
      }
    );
  }

  // Two months ago rows (28 days) so Demo mode demonstrates 3 switchable months
  for (let d = 1; d <= 28; d++) {
    const dayStr = String(d).padStart(2, "0");
    rows.push(
      {
        invoiceMonth: prev2InvoiceMonth,
        billingAccountId: baProd,
        projectId: "acme-ai-assistant-prod",
        serviceName: "Vertex AI",
        usageDate: `${prev2Year}-${prev2Month}-${dayStr}`,
        currency: "USD",
        grossCost: 16.5,
        creditsAmount: -1.5,
        netCost: 15.0,
      },
      {
        invoiceMonth: prev2InvoiceMonth,
        billingAccountId: baProd,
        projectId: "acme-data-platform",
        serviceName: "BigQuery",
        usageDate: `${prev2Year}-${prev2Month}-${dayStr}`,
        currency: "USD",
        grossCost: 9.5,
        creditsAmount: -0.5,
        netCost: 9.0,
      },
      {
        invoiceMonth: prev2InvoiceMonth,
        billingAccountId: baSandbox,
        projectId: "agy-agent-experiments",
        serviceName: "Gemini API / Vertex AI",
        usageDate: `${prev2Year}-${prev2Month}-${dayStr}`,
        currency: "USD",
        grossCost: 5.0,
        creditsAmount: -5.0,
        netCost: 0,
      }
    );
  }

  const spend = aggregateSpendRows(
    rows,
    billingAccounts.map((b) => b.exportTableId ).filter(Boolean),
    windowCtx,
    referenceDate.toISOString()
  );

  return {
    auth,
    preferences: {
      pinnedProjects: Array.from(pinnedSet),
      billingExportTables: prefs.billingExportTables,
      cacheTtlHours: Math.round((prefs.cacheTtlMs / 3_600_000) * 10) / 10,
      maskEmails: prefs.maskEmails,
      gcloudPathOverride: prefs.gcloudPathOverride,
      quotaProjectOverride: prefs.quotaProjectOverride,
      demoMode: true,
      locale: prefs.locale ?? "auto",
      autoUpdatePlugin: prefs.autoUpdatePlugin !== false,
    },
    cache: {
      hit: false,
      stale: false,
      fetchedAt: referenceDate.toISOString(),
      ageMs: 0,
      ttlMs: prefs.cacheTtlMs,
    },
    summary: {
      totalProjects: projects.length,
      billedProjects: projects.filter((p) => p.billingEnabled).length,
      unbilledProjects: projects.filter((p) => !p.billingEnabled).length,
      pinnedProjectsCount: projects.filter((p) => p.pinned).length,
      totalBillingAccounts: billingAccounts.length,
      openBillingAccounts: billingAccounts.filter((b) => b.open).length,
      spendConfigured: true,
    },
    projects,
    billingAccounts,
    spend,
    warnings: [],
  };
}
