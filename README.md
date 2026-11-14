# agy-gcp-companion

**GCP Companion** is a Google Antigravity plugin that adds an interactive **Auxiliary Side Panel** and **MCP Server + Agent Skill** for inspecting your Google Cloud **Projects**, **Billing Accounts**, **Budgets**, and **BigQuery Month-to-Date Spend**.

## Highlights

- **Auxiliary Side Pane UI (`GCP Companion`)**:
  - **Sticky Context Header**: View/switch your active `gcloud` account (with 1-click PII email masking) and copy/switch your default `gcloud` project.
  - **Overview Tab**: Month-to-date net spend (after credits & free-tier discounts), gross vs. credits breakdown, comparison vs. previous month same-day spend, daily SVG spend sparkline, breakdown toggle (**By Project** / **By Billing Account**), and pinned projects.
  - **Projects Tab**: Search by name, project ID, project number, or label; filter by Billing Account, Pinned, or Unbilled; expand any project to inspect top GCP Services (`Vertex AI`, `Cloud Run`, `BigQuery`, etc.) and jump directly to Console dashboards.
  - **Billing Tab**: Inspect open/closed Cloud Billing Accounts, configured Budget alert thresholds, and connect **BigQuery Cloud Billing Export** tables via 1-click dataset auto-discovery or manual `project.dataset.table` binding.
- **Agent Chat Integration (`mcp_config.json` + `SKILL.md`)**:
  - Exposes 8 structured MCP tools (`gcp_companion_status`, `gcp_list_projects`, `gcp_list_billing_accounts`, `gcp_get_billing_summary`, `gcp_get_project_cost_breakdown`, `gcp_set_active_project`, `gcp_set_active_account`, `gcp_configure_billing_export`) sharing the same 6-hour local cache (`~/.gemini/agy-gcp-companion/`) as the panel.
- **Zero External Runtime Dependencies**:
  - Pre-compiled to pure ES Modules (`dist/`) that run directly on Antigravity's bundled Node.js runtime without requiring `npm install`.

## Quick Start

### 1. Build & Run Tests

```bash
npm test
```

### 2. Use in Antigravity

- **Workspace-Scoped (Automatic)**: Opening this repository in Antigravity automatically discovers `.agents/plugins/agy-gcp-companion`.
- **Global Installation (All Workspaces)**:
  ```bash
  npm run install:global
  ```
  Or install directly via the Antigravity CLI (from GitHub or a local clone):
  ```bash
  agy plugin install https://github.com/ericsk/agy-gcp-companion
  # or from a local clone:
  agy plugin install .
  ```

### 3. Local Standalone Preview

```bash
npm run dev:sidecar
# Open http://127.0.0.1:8787
```

## Security Design

- **Loopback-Only Binding**: Sidecar binds strictly to `127.0.0.1` and never `0.0.0.0`.
- **Strict CSP & Zero `innerHTML`**: Served with `script-src 'self'; style-src 'self'; object-src 'none'`. All UI elements and SVG charts are constructed via `document.createElement` / `createElementNS` and `textContent`.
- **Synchronizer CSRF & Origin Guard**: All `POST` endpoints validate `Origin`, custom preflight-gated `X-AGY-Companion` header, and HMAC-signed session CSRF tokens.
- **Read-Only Cloud Posture & Partition Pruning**: Cloud billing attachments are read-only; BigQuery queries use named parameters and `_PARTITIONTIME` pruning with a 6-hour local cache (`0600` permissions).
