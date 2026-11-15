---
name: gcp-companion
description: >-
  Inspects Google Cloud (GCP) projects, Cloud Billing accounts, budget thresholds,
  and BigQuery month-to-date spend, and synchronizes with the GCP Companion side
  panel in Antigravity. Activate when the user asks about their GCP projects,
  billing accounts, current cloud spend/costs, service cost breakdown, or switching
  their active gcloud project/account.
---

# GCP Companion Skill

The **GCP Companion** plugin (`agy-gcp-companion`) provides both:

1. **Auxiliary Side Panel (`GCP Companion`)**: An interactive 3-tab UI (`Overview`, `Projects`, `Billing`) running as a managed Antigravity Web UI Sidecar.
2. **Bundled MCP Server (`gcp-companion`)**: Structured tools sharing the exact same local cache (`~/.gemini/agy-gcp-companion/`) and `gcloud` context as the UI panel.

## Progressive Dual-Mode Architecture

Google Cloud's REST API (`cloudresourcemanager` + `cloudbilling` + `billingbudgets`) exposes **Projects**, **Billing Accounts**, project-to-billing bindings, and **Budget threshold definitions** immediately without setup, **but does not provide a direct REST endpoint for current dollar spend**.

Actual dollar spend (`gross_cost`, `credits`, `net_cost`, daily trend, and per-service breakdown) is powered by **BigQuery Cloud Billing Export** (`gcp_billing_export_v1_*` or `gcp_billing_export_resource_v1_*`):

- **Base Mode (zero setup)**: Always works immediately once `gcloud` / ADC is signed in.
- **Spend Mode (BigQuery Export linked)**: Unlocks Month-to-Date Net Spend (after credits/free tier), comparison vs. previous month same day, daily spend sparklines, and per-project / per-service breakdowns. Queries are partition-pruned (`_PARTITIONTIME`) and cached locally (6-hour TTL by default).

## Preferred Workflow

0. **Environment & Login Pre-Flight Check**:
   - Always check `gcloudInstalled` and `authenticated` from `gcp_companion_status` (or any `gcp_*` tool response):
     - If `gcloudInstalled: false` and `authenticated: false`: Prompt the user to install **Google Cloud CLI (`gcloud`)** first (`https://cloud.google.com/sdk/docs/install`, or `brew install --cask gcloud-cli` on macOS), and then run `gcloud auth login`.
     - If `gcloudInstalled: true` and `authenticated: false`: Guide the user to sign in by clicking **Sign in with Browser (`gcloud auth login`)** inside the **GCP Companion** side panel, or running `gcloud auth login` in their terminal.
1. **Prefer MCP Tools over raw `gcloud` shell calls**:
   - Call `gcp_companion_status` to check active `gcloud` account, active project, pinned projects, and whether BigQuery spend tracking is configured.
   - Call `gcp_list_projects` (supports `query`, `billingAccountId`, `pinnedOnly`, `unbilledOnly`) to inspect projects and their linked billing accounts / MTD spend.
   - Call `gcp_list_billing_accounts` or `gcp_get_billing_summary` when asked about billing accounts, budgets, total cloud spend, or cost spikes.
   - Call `gcp_get_project_cost_breakdown` with `projectId` to see which GCP services (e.g., Vertex AI, Cloud Run, BigQuery) are driving costs in a project.
2. **Helping the User Connect BigQuery Spend**:
   - If `gcp_get_billing_summary` reports `configured: false`, ask the user which GCP project hosts their BigQuery Billing Export dataset (or offer to check candidate billing/admin projects using `gcp_configure_billing_export` with `discoverOnly: true` and `hostProjectId`).
   - Once a `gcp_billing_export_v1_*` table is found, bind it via `gcp_configure_billing_export` (`billingAccountId`, `tableId`) — this immediately updates the **GCP Companion** side panel as well!
3. **Switching Local Context Safely**:
   - Use `gcp_set_active_project` or `gcp_set_active_account` to switch the local `gcloud` default project or account.
   - Cloud billing bindings are intentionally read-only to prevent accidental service outages. Direct the user to the Console links returned by the tools if they want to modify billing account attachments or budget rules.
