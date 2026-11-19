import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CompanionService } from "../core/companion-service.mjs";
import { sanitizeErrorMessage } from "../core/security.mjs";
import { getPluginVersion } from "../core/updater.mjs";

                                 
                 
                              
                 
                                   
 

                                  
                 
                             
                   
           
                 
                    
    
 

const TOOL_DEFINITIONS = [
  {
    name: "gcp_companion_status",
    description:
      "Get the current local Google Cloud authentication state, active gcloud account and default project, pinned projects, BigQuery Billing Export mappings, and cache freshness.",
    inputSchema: {
      type: "object",
      properties: {
        forceRefresh: {
          type: "boolean",
          description: "Set true to bypass the 6-hour local cache and refresh from GCP.",
        },
      },
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: "gcp_list_projects",
    description:
      "List Google Cloud projects visible to the active account, enriched with linked Cloud Billing Account info, pin status, and month-to-date net spend (when BigQuery export is configured).",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Optional case-insensitive filter matching project name, ID, number, or label.",
        },
        billingAccountId: {
          type: "string",
          description: "Optional Billing Account ID (e.g. 01ABCD-234567-89EFGH) to filter linked projects.",
        },
        pinnedOnly: {
          type: "boolean",
          description: "Return only projects pinned in the GCP Companion panel.",
        },
        unbilledOnly: {
          type: "boolean",
          description: "Return only projects that do not have active Cloud Billing enabled.",
        },
        forceRefresh: {
          type: "boolean",
          description: "Bypass local cache and re-query GCP APIs.",
        },
      },
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: "gcp_list_billing_accounts",
    description:
      "List Google Cloud Billing Accounts, open/closed status, linked project counts, configured budget alert thresholds, and month-to-date net/gross/credits spend.",
    inputSchema: {
      type: "object",
      properties: {
        forceRefresh: {
          type: "boolean",
          description: "Bypass local cache and re-query Cloud Billing & BigQuery.",
        },
      },
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: "gcp_get_billing_summary",
    description:
      "Get Month-to-Date net spend (after credits/free tier), gross cost, credits total, comparison against previous month same day, daily spend series, and top spending projects.",
    inputSchema: {
      type: "object",
      properties: {
        forceRefresh: {
          type: "boolean",
          description: "Set true to run a fresh partition-pruned BigQuery spend query.",
        },
      },
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: "gcp_get_project_cost_breakdown",
    description:
      "Get per-service GCP cost breakdown (Cloud Run, Vertex AI, BigQuery, etc.), daily spend trend, credits, and Console deep links for a specific project.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "The Google Cloud project ID to inspect.",
        },
        forceRefresh: {
          type: "boolean",
          description: "Set true to refresh cached cloud and BigQuery data first.",
        },
      },
      required: ["projectId"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: "gcp_set_active_project",
    description:
      "Switch the local default gcloud project (`gcloud config set project <projectId>`) and synchronize with the GCP Companion panel.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "Target GCP project ID to set as active.",
        },
        pinProject: {
          type: "boolean",
          description: "Optionally also pin this project in the GCP Companion panel.",
        },
      },
      required: ["projectId"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: "gcp_set_active_account",
    description:
      "Switch the active local gcloud account (`gcloud config set account <email>`) among accounts already authenticated on this machine.",
    inputSchema: {
      type: "object",
      properties: {
        account: {
          type: "string",
          description: "Authenticated Google account email to activate.",
        },
      },
      required: ["account"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: "gcp_configure_billing_export",
    description:
      "Auto-discover `gcp_billing_export_*` tables inside a BigQuery host project, or bind/remove a BigQuery Cloud Billing Export table (`project.dataset.table`) for spend tracking.",
    inputSchema: {
      type: "object",
      properties: {
        discoverOnly: {
          type: "boolean",
          description:
            "If true, scans `hostProjectId` datasets for `gcp_billing_export_*` tables without modifying settings.",
        },
        hostProjectId: {
          type: "string",
          description: "GCP project ID hosting the BigQuery billing export dataset.",
        },
        billingAccountId: {
          type: "string",
          description:
            "Billing Account ID (XXXXXX-XXXXXX-XXXXXX) or '*' for a shared export table.",
        },
        tableId: {
          type: "string",
          description: "Full BigQuery table reference: `project.dataset.table`.",
        },
        remove: {
          type: "boolean",
          description: "Set true to unlink the configured export table for `billingAccountId`.",
        },
      },
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
]         ;

const RESOURCE_DEFINITIONS = [
  {
    uri: "gcp-companion://overview",
    name: "GCP Companion Overview",
    description: "Current gcloud status, summary counts, and month-to-date spend totals.",
    mimeType: "application/json",
  },
  {
    uri: "gcp-companion://projects",
    name: "GCP Projects & Linked Billing",
    description: "Active GCP projects with billing account links and month-to-date net costs.",
    mimeType: "application/json",
  },
  {
    uri: "gcp-companion://billing",
    name: "GCP Billing Accounts & Spend",
    description: "Cloud Billing accounts, configured budgets, and BigQuery spend breakdown.",
    mimeType: "application/json",
  },
]         ;

export class GcpCompanionMcpHandler {
           service                  ;

  constructor(service                   = new CompanionService()) {
    this.service = service;
  }

  async handleMessage(msg                )                                  {
    // Notifications do not carry an `id` and must not receive a response
    if (msg.id === undefined) {
      return null;
    }

    const id = msg.id;
    try {
      switch (msg.method) {
        case "initialize": {
          const requestedVersion =
            typeof msg.params?.protocolVersion === "string"
              ? msg.params.protocolVersion
              : "2024-11-05";
          return {
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: requestedVersion,
              capabilities: {
                tools: {},
                resources: {},
              },
              serverInfo: {
                name: "agy-gcp-companion",
                version: getPluginVersion(),
              },
            },
          };
        }

        case "ping":
          return { jsonrpc: "2.0", id, result: {} };

        case "tools/list":
          return {
            jsonrpc: "2.0",
            id,
            result: { tools: TOOL_DEFINITIONS },
          };

        case "prompts/list":
          return {
            jsonrpc: "2.0",
            id,
            result: { prompts: [] },
          };

        case "resources/list":
          return {
            jsonrpc: "2.0",
            id,
            result: { resources: RESOURCE_DEFINITIONS },
          };

        case "resources/read": {
          const uri = String(msg.params?.uri ?? "");
          const content = await this.readResource(uri);
          return {
            jsonrpc: "2.0",
            id,
            result: {
              contents: [
                {
                  uri,
                  mimeType: "application/json",
                  text: JSON.stringify(content, null, 2),
                },
              ],
            },
          };
        }

        case "tools/call": {
          const toolName = String(msg.params?.name ?? "");
          const rawArgs =
            msg.params?.arguments && typeof msg.params.arguments === "object"
              ? (msg.params.arguments                           )
              : {};
          try {
            const output = await this.executeTool(toolName, rawArgs);
            return {
              jsonrpc: "2.0",
              id,
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(output, null, 2),
                  },
                ],
                isError: false,
              },
            };
          } catch (toolErr) {
            return {
              jsonrpc: "2.0",
              id,
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(
                      { error: sanitizeErrorMessage(toolErr) },
                      null,
                      2
                    ),
                  },
                ],
                isError: true,
              },
            };
          }
        }

        default:
          return {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32601,
              message: `Method not found: ${msg.method}`,
            },
          };
      }
    } catch (err) {
      return {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32603,
          message: sanitizeErrorMessage(err),
        },
      };
    }
  }

          async readResource(uri        )                   {
    const overview = await this.service.getOverview({ forceRefresh: false });
    if (uri === "gcp-companion://overview") {
      return {
        auth: {
          authenticated: overview.auth.authenticated,
          source: overview.auth.source,
          activeAccount: overview.preferences.maskEmails
            ? overview.auth.maskedActiveAccount
            : overview.auth.activeAccount,
          activeProject: overview.auth.activeProject,
        },
        summary: overview.summary,
        cache: overview.cache,
        totalsByCurrency: overview.spend.totalsByCurrency,
      };
    }
    if (uri === "gcp-companion://projects") {
      return overview.projects.map((p) => ({
        ...p,
        currentMonthNetCost: overview.spend.byProject[p.projectId]?.currentMonthNetCost ?? null,
        currency: overview.spend.byProject[p.projectId]?.currency ?? null,
      }));
    }
    if (uri === "gcp-companion://billing") {
      return {
        billingAccounts: overview.billingAccounts,
        spendByBillingAccount: overview.spend.byBillingAccount,
      };
    }
    throw new Error(`Unknown resource URI: ${uri}`);
  }

          async executeTool(
    name        ,
    args                         
  )                   {
    switch (name) {
      case "gcp_companion_status": {
        const overview = await this.service.getOverview({
          forceRefresh: Boolean(args.forceRefresh),
        });
        const onboarding = !overview.auth.authenticated
          ? !overview.auth.gcloudInstalled
            ? {
                actionRequired: "install_gcloud_cli",
                installUrl: "https://cloud.google.com/sdk/docs/install",
                macosBrewCommand: "brew install --cask gcloud-cli",
                nextStepCommand: "gcloud auth login",
                message:
                  "Google Cloud CLI (`gcloud`) is not installed on this machine. Guide the user to install it from https://cloud.google.com/sdk/docs/install (or `brew install --cask gcloud-cli` on macOS), then run `gcloud auth login`.",
              }
            : {
                actionRequired: "login_gcloud_account",
                loginCommand: "gcloud auth login",
                message:
                  "Google Cloud CLI (`gcloud`) is installed, but no active Google account is signed in yet. Guide the user to run `gcloud auth login` or click 'Sign in with Browser' inside the GCP Companion panel.",
              }
          : !overview.auth.gcloudInstalled
            ? {
                actionRequired: "optional_install_gcloud_cli",
                installUrl: "https://cloud.google.com/sdk/docs/install",
                message:
                  "Authenticated via Application Default Credentials, but `gcloud` CLI is not installed. Recommend installing `gcloud` if the user wants multi-account or default project switching.",
              }
            : null;
        return {
          authenticated: overview.auth.authenticated,
          source: overview.auth.source,
          gcloudInstalled: overview.auth.gcloudInstalled,
          gcloudBinaryPath: overview.auth.gcloudBinaryPath,
          activeAccount: overview.preferences.maskEmails
            ? overview.auth.maskedActiveAccount
            : overview.auth.activeAccount,
          activeProject: overview.auth.activeProject,
          setupHint: overview.auth.setupHint,
          onboarding,
          pinnedProjects: overview.preferences.pinnedProjects,
          billingExportTables: overview.preferences.billingExportTables,
          cache: overview.cache,
          summary: overview.summary,
          warnings: overview.warnings,
        };
      }

      case "gcp_list_projects": {
        const overview = await this.service.getOverview({
          forceRefresh: Boolean(args.forceRefresh),
        });
        if (!overview.auth.authenticated) {
          return {
            authenticated: false,
            gcloudInstalled: overview.auth.gcloudInstalled,
            onboardingMessage: !overview.auth.gcloudInstalled
              ? "Google Cloud CLI (`gcloud`) is not installed. Ask the user to install Google Cloud SDK (https://cloud.google.com/sdk/docs/install or `brew install --cask gcloud-cli`), then sign in with `gcloud auth login`."
              : "No Google Cloud account is signed in yet. Ask the user to run `gcloud auth login` or click 'Sign in with Browser' in the GCP Companion panel.",
            count: 0,
            activeProject: null,
            spendConfigured: false,
            projects: [],
          };
        }
        const q = typeof args.query === "string" ? args.query.trim().toLowerCase() : "";
        const baFilter =
          typeof args.billingAccountId === "string" ? args.billingAccountId.trim().toUpperCase() : "";
        const pinnedOnly = Boolean(args.pinnedOnly);
        const unbilledOnly = Boolean(args.unbilledOnly);

        const items = overview.projects
          .filter((p) => {
            if (pinnedOnly && !p.pinned) return false;
            if (unbilledOnly && p.billingEnabled) return false;
            if (baFilter && (p.billingAccountId || "").toUpperCase() !== baFilter) return false;
            if (!q) return true;
            const labelsText = p.labels
              ? Object.entries(p.labels)
                  .map(([k, v]) => `${k}:${v}`)
                  .join(" ")
                  .toLowerCase()
              : "";
            return (
              p.projectId.toLowerCase().includes(q) ||
              p.name.toLowerCase().includes(q) ||
              p.projectNumber.includes(q) ||
              labelsText.includes(q)
            );
          })
          .map((p) => {
            const ps = overview.spend.byProject[p.projectId];
            return {
              projectId: p.projectId,
              name: p.name,
              projectNumber: p.projectNumber,
              isActiveProject: p.isActiveProject,
              pinned: p.pinned,
              billingEnabled: p.billingEnabled,
              billingAccountId: p.billingAccountId,
              billingAccountName: p.billingAccountName,
              labels: p.labels ?? {},
              monthToDateNetCost: ps?.currentMonthNetCost ?? null,
              currency: ps?.currency ?? null,
              topService: ps?.topServices[0]?.serviceName ?? null,
            };
          });

        return {
          count: items.length,
          activeProject: overview.auth.activeProject,
          spendConfigured: overview.spend.configured,
          projects: items,
        };
      }

      case "gcp_list_billing_accounts": {
        const overview = await this.service.getOverview({
          forceRefresh: Boolean(args.forceRefresh),
        });
        if (!overview.auth.authenticated) {
          return {
            authenticated: false,
            gcloudInstalled: overview.auth.gcloudInstalled,
            onboardingMessage: !overview.auth.gcloudInstalled
              ? "Google Cloud CLI (`gcloud`) is not installed. Ask the user to install Google Cloud SDK (https://cloud.google.com/sdk/docs/install or `brew install --cask gcloud-cli`), then sign in with `gcloud auth login`."
              : "No Google Cloud account is signed in yet. Ask the user to run `gcloud auth login` or click 'Sign in with Browser' in the GCP Companion panel.",
            count: 0,
            spendConfigured: false,
            billingAccounts: [],
          };
        }
        return {
          count: overview.billingAccounts.length,
          spendConfigured: overview.spend.configured,
          billingAccounts: overview.billingAccounts.map((ba) => ({
            ...ba,
            spend: overview.spend.byBillingAccount[ba.id] ?? null,
            consoleReportUrl: overview.auth.activeProject
              ? `https://console.cloud.google.com/billing/${encodeURIComponent(ba.id)}/reports?project=${encodeURIComponent(overview.auth.activeProject)}`
              : `https://console.cloud.google.com/billing/${encodeURIComponent(ba.id)}/reports`,
          })),
        };
      }

      case "gcp_get_billing_summary": {
        const overview = await this.service.getOverview({
          forceRefresh: Boolean(args.forceRefresh),
        });
        if (!overview.spend.configured) {
          return {
            configured: false,
            message:
              "BigQuery Billing Export is not linked yet. Ask the user which GCP project hosts their `gcp_billing_export_*` dataset and run `gcp_configure_billing_export` with `discoverOnly: true`, or open the GCP Companion panel -> Billing tab.",
            billingAccounts: overview.billingAccounts.map((ba) => ({
              id: ba.id,
              displayName: ba.displayName,
              open: ba.open,
              linkedProjectCount: ba.linkedProjectCount,
              budgets: ba.budgets,
            })),
          };
        }

        const topProjects = Object.values(overview.spend.byProject)
          .sort((a, b) => b.currentMonthNetCost - a.currentMonthNetCost)
          .slice(0, 10);

        return {
          configured: true,
          invoiceMonth: overview.spend.invoiceMonth,
          previousInvoiceMonth: overview.spend.previousInvoiceMonth,
          queriedTables: overview.spend.queriedTables,
          cache: overview.cache,
          totalsByCurrency: overview.spend.totalsByCurrency,
          byBillingAccount: overview.spend.byBillingAccount,
          topProjects,
        };
      }

      case "gcp_get_project_cost_breakdown": {
        const projectId = String(args.projectId ?? "");
        return this.service.getProjectCostBreakdown(projectId, Boolean(args.forceRefresh));
      }

      case "gcp_set_active_project": {
        const projectId = String(args.projectId ?? "");
        const res = await this.service.setActiveProject(projectId);
        if (args.pinProject) {
          this.service.setPinnedProject(projectId, true);
        }
        return {
          ...res,
          pinned: Boolean(args.pinProject),
        };
      }

      case "gcp_set_active_account": {
        const account = String(args.account ?? "");
        return this.service.setActiveAccount(account);
      }

      case "gcp_configure_billing_export": {
        if (args.discoverOnly) {
          const hostProjectId = String(args.hostProjectId ?? "");
          if (!hostProjectId) {
            throw new Error("`hostProjectId` is required when `discoverOnly` is true.");
          }
          const tables = await this.service.discoverExportTables(hostProjectId);
          return { hostProjectId, discoveredTables: tables };
        }

        const billingAccountId = String(args.billingAccountId ?? "*");
        const updatedOverview = await this.service.configureExportTable({
          billingAccountId,
          tableId: typeof args.tableId === "string" ? args.tableId : undefined,
          hostProjectId:
            typeof args.hostProjectId === "string" ? args.hostProjectId : undefined,
          remove: Boolean(args.remove),
        });
        return {
          configured: updatedOverview.spend.configured,
          billingExportTables: updatedOverview.preferences.billingExportTables,
          totalsByCurrency: updatedOverview.spend.totalsByCurrency,
          warnings: updatedOverview.warnings,
        };
      }

      default:
        throw new Error(`Unknown MCP tool: ${name}`);
    }
  }
}

/**
 * Starts the Stdio MCP server supporting standard newline-delimited JSON-RPC 2.0
 * as well as optional Content-Length framed messages.
 */
export function startMcpStdioServer(
  handler                         = new GcpCompanionMcpHandler()
)       {
  let buffer = Buffer.alloc(0);

  const writeResponse = (res                 , useContentLength         ) => {
    const json = JSON.stringify(res);
    if (useContentLength) {
      const byteLen = Buffer.byteLength(json, "utf-8");
      process.stdout.write(`Content-Length: ${byteLen}\r\n\r\n${json}`);
    } else {
      process.stdout.write(`${json}\n`);
    }
  };

  const dispatchParsed = (rawJson        , useContentLength         ) => {
    const trimmed = rawJson.trim();
    if (!trimmed) return;
    let parsed                ;
    try {
      parsed = JSON.parse(trimmed)                  ;
    } catch {
      writeResponse(
        {
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Parse error" },
        },
        useContentLength
      );
      return;
    }
    void handler.handleMessage(parsed).then((res) => {
      if (res) {
        writeResponse(res, useContentLength);
      }
    });
  };

  const drainBuffer = () => {
    while (buffer.length > 0) {
      const preview = buffer.subarray(0, Math.min(buffer.length, 32)).toString("utf-8");
      if (preview.startsWith("Content-Length:")) {
        const headerEnd = buffer.indexOf("\r\n\r\n");
        if (headerEnd === -1) return;
        const headerStr = buffer.subarray(0, headerEnd).toString("utf-8");
        const match = /Content-Length:\s*(\d+)/i.exec(headerStr);
        const contentLen = match ? Number(match[1]) : 0;
        const totalFrameLen = headerEnd + 4 + contentLen;
        if (buffer.length < totalFrameLen) return;
        const bodyStr = buffer.subarray(headerEnd + 4, totalFrameLen).toString("utf-8");
        buffer = buffer.subarray(totalFrameLen);
        dispatchParsed(bodyStr, true);
      } else {
        const newlineIdx = buffer.indexOf(0x0a); // '\n'
        if (newlineIdx === -1) return;
        const lineStr = buffer.subarray(0, newlineIdx).toString("utf-8");
        buffer = buffer.subarray(newlineIdx + 1);
        dispatchParsed(lineStr, false);
      }
    }
  };

  process.stdin.on("data", (chunk        ) => {
    buffer = Buffer.concat([buffer, chunk]);
    drainBuffer();
  });

  process.stdin.on("end", () => {
    process.exit(0);
  });
}

const isMain = (() => {
  try {
    const entry = process.argv[1] ? resolve(process.argv[1]) : "";
    const self = resolve(fileURLToPath(import.meta.url));
    return entry === self;
  } catch {
    return false;
  }
})();

if (isMain) {
  startMcpStdioServer();
}
