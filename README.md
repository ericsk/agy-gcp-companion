# agy-gcp-companion

**GCP Companion** is a Google Antigravity plugin that adds an interactive **Auxiliary Side Panel** and **MCP Server + Agent Skill** for inspecting your Google Cloud **Projects**, **Billing Accounts**, **Budgets**, and **BigQuery Month-to-Date Spend**.

## Highlights

- **Auxiliary Side Pane UI (`GCP Companion`)**:
  - **Sticky Context Header**: View/switch your active `gcloud` account (with 1-click PII email masking) and copy/switch your default `gcloud` project.
  - **Overview Tab**: Month-to-date net spend (after credits & free-tier discounts), gross vs. credits breakdown, comparison vs. previous month same-day spend, daily SVG spend sparkline, breakdown toggle (**By Project** / **By Billing Account**), and pinned projects.
  - **Projects Tab**: Search by name, project ID, project number, or label; filter by Billing Account, Pinned, or Unbilled; expand any project to inspect top GCP Services (`Vertex AI`, `Cloud Run`, `BigQuery`, etc.) and jump directly to Console dashboards.
  - **Billing Tab**: Inspect open/closed Cloud Billing Accounts, configured Budget alert thresholds, and connect **BigQuery Cloud Billing Export** tables via 1-click dataset auto-discovery or manual `project.dataset.table` binding.
  - **Multi-Language Support (`i18n`)**: Automatic system/browser locale detection plus 1-click switching in **⚙ Settings** between **English (`en`)**, **Español (`es`)**, **Français (`fr`)**, **日本語 (`ja`)**, **한국어 (`ko`)**, **简体中文 (`zh-CN`)**, and **繁體中文 (`zh-TW`)**, persisted locally across sessions.
- **Agent Chat Integration (`mcp_config.json` + `SKILL.md`)**:
  - Exposes 8 structured MCP tools (`gcp_companion_status`, `gcp_list_projects`, `gcp_list_billing_accounts`, `gcp_get_billing_summary`, `gcp_get_project_cost_breakdown`, `gcp_set_active_project`, `gcp_set_active_account`, `gcp_configure_billing_export`) sharing the same 6-hour local cache (`~/.gemini/agy-gcp-companion/`) as the panel.
- **Zero External Runtime Dependencies**:
  - Pre-compiled to pure ES Modules (`dist/`) that run directly on Antigravity's bundled Node.js runtime without requiring `npm install`.

## Installation (For Antigravity Users)

Because `dist/` is pre-compiled with **zero external runtime dependencies**, no `npm install` or build step is required.

### Option A: One-Line Install via Antigravity CLI (`agy`)

```bash
agy plugin install https://github.com/ericsk/agy-gcp-companion
```

### Option B: Direct Git Clone (If `agy` CLI is not in your `PATH`)

**macOS / Linux:**
```bash
mkdir -p ~/.gemini/config/plugins
git clone https://github.com/ericsk/agy-gcp-companion.git ~/.gemini/config/plugins/agy-gcp-companion
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.gemini\config\plugins" | Out-Null
git clone https://github.com/ericsk/agy-gcp-companion.git "$HOME\.gemini\config\plugins\agy-gcp-companion"
```

### Opening & First-Time Setup in Antigravity

1. **Restart or Reload Antigravity** so the newly installed plugin and background sidecar register.
2. *(Optional check)* Open **Customizations → Installed** in the left sidebar to confirm **GCP Companion** is enabled.
3. Inside any conversation, open the **Plugins / Auxiliary Side Pane (`+`)** at the top-right and select **GCP Companion**.
4. **Guided Onboarding Inside the Panel**:
   - **No `gcloud` CLI installed yet?** The panel will prompt you with official Google Cloud SDK / Homebrew installation links.
   - **Not signed in yet?** Click **🔑 Sign in with Browser (`gcloud auth login`)** right inside the panel to authenticate your Google account.
   - **Cloud Billing API not enabled yet?** Click **⚡ Enable Cloud Billing API** inside the panel (free GCP API) to load all your Billing Accounts and mapped projects.
   - **Want exact dollar spend & service breakdowns?** Go to the **Billing** tab → **BigQuery Billing Export Connection** to auto-discover or link your `gcp_billing_export_*` table.

---

## Local Development

### 1. Build & Run Tests

```bash
npm test
```

### 2. Symlink Global Dev Install

```bash
npm run install:global
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
