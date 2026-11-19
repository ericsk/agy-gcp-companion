# Changelog

All notable changes to **GCP Companion (`agy-gcp-companion`)** are documented in this file.

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
