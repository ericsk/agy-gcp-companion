# Changelog

All notable changes to **GCP Companion (`agy-gcp-companion`)** are documented in this file.

## [1.3.0] - 2026-11-20

### Added
- **Project Billing Account Switching (UI & MCP)**: Link unbilled GCP projects to open Cloud Billing Accounts or switch billing accounts via Cloud Billing REST API (`PUT /v1/projects/{projectId}/billingInfo`), featuring Before → After inline confirmation in the Projects drawer, a mandatory two-step `confirm: true` preview-then-apply safety gate in MCP (`gcp_set_project_billing_account`), Demo Mode simulation, and instant local cache reconciliation without redundant BigQuery rescans. Unlinking/disabling billing remains blocked to prevent accidental outages.
- **Guarded Project Deletion Flow (Web UI Only)**: Added a Danger Zone **Delete Project** flow inside the Projects drawer (`DELETE /v3/projects/{projectId}`) requiring exact `projectId` entry, dynamic impact warnings (active `gcloud` project, quota override project, BigQuery export host), actionable IAM (`403`) and Lien (`400`) guidance, automatic local preference/cache cleanup, and a dismissible 30-day Pending Deletion recovery banner. Intentionally excluded from MCP tools so AI agents can never delete projects.

### Changed
- **Active-Only Resource Filtering**: Automatically filters out closed Cloud Billing Accounts and non-active GCP projects (`DELETE_REQUESTED`, etc.) across live APIs, linked project counts, legacy cache snapshots, Web UI, and MCP outputs while preserving historical BigQuery spend reconciliation.

## [1.2.0] - 2026-11-19

### Added
- **Month-End Spend Forecast & Sparkline Projection**: Zero-extra-scan month-end cost projections blending recent 7-day run rate with partial-day exclusion, 100%-credit caution guards, and dashed projection curves on daily spend sparklines.
- **6-Month Historical Billing Archive**: Multi-month spend history and credit visibility with automatic settled-month freeze to prune unnecessary BigQuery partition scans, plus explicit `NT$` formatting in Traditional Chinese (`zh-TW`).
- **Progressive Instant-Shell UI Loading**: Dedicated fast `/api/bootstrap` and independent domain endpoints (`/api/projects`, `/api/billing`, `/api/budgets`, `/api/spend`) so fast GCP metadata renders immediately without waiting on BigQuery scans.
- **Interactive Skill Choice Guidance**: `gcp-companion` skill now prioritizes native `ask_question` interactive selection menus over plain-text numbered lists when guiding users through project/account/export choices.
- **Apache-2.0 `LICENSE` & Dynamic Version Sync**: Added root `LICENSE` file and unified runtime version reporting across `plugin.json`, MCP `initialize`, and Sidecar `/api/session`.

### Fixed
- **Cold-Start Timeout Protection**: Capped quota-project probing when `cloudbilling.googleapis.com` is not yet enabled (`SERVICE_DISABLED`), eliminating 45-second cold-start retry storms.

## [1.1.0] - 2026-11-16

### Added
- **Built-In Automatic & 1-Click Updates**: Periodic GitHub semantic version checks with 3-tier update engine (`git pull --ff-only`, `agy plugin install`, or atomic shallow clone) while safely skipping developer symlink directories.
- **7-Language Internationalization (`i18n`)**: Full parity across `en`, `es`, `fr`, `ja`, `ko`, `zh-CN`, and `zh-TW` with automatic locale detection and persistent Settings switcher.
- **Plugin Schema Manifest**: Added official `$schema`, `logo`, `suggestedPrompts`, and Marketplace metadata in `plugin.json`.

## [1.0.0] - 2026-11-14

### Added
- Initial release of **GCP Companion** for Google Antigravity, bundling the Auxiliary Side Panel (`SIDECAR_UI_ENTRYPOINT_AUX_PANE`), Stdio MCP Server (`8` tools + `3` resources), and `gcp-companion` Agent Skill with zero external runtime dependencies.
