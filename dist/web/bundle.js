(() => {
  "use strict";
  if (typeof window !== "undefined") {
    if (window.__AGY_COMPANION_BOOTED__) return;
    window.__AGY_COMPANION_BOOTED__ = true;
  }
// --- i18n/en.js ---
const EN_MESSAGES = {
  // Locale switcher
  "locale.autoShort": "🌐 Auto",
  "locale.autoFull": "Auto (System / Browser)",
  "header.languageAria": "Display Language",
  "header.languageTitle": "Switch display language",

  // Boot & Fatal Error
  "boot.connecting": "Connecting to Google Cloud Companion…",
  "boot.errorTitle": "Unable to Load GCP Companion",
  "boot.unknownError": "Unknown connection error.",
  "boot.retry": "Retry",
  "loading.projects": "Loading projects…",
  "loading.billing": "Loading billing accounts…",
  "loading.budgets": "Loading budgets…",
  "loading.spend": "Querying BigQuery spend…",
  "loading.billingStatus": "Checking billing…",
  "loading.sectionErrorRetry": "↻ Retry",

  // Relative sync age
  "age.notSynced": "Not synced",
  "age.offlineCacheSuffix": " (offline cache)",
  "age.justNow": "Just now{suffix}",
  "age.secondsAgo": "{n}s ago{suffix}",
  "age.minutesAgo": "{n}m ago{suffix}",
  "age.hoursMinutesAgo": "{h}h {m}m ago{suffix}",

  // Common controls
  "common.copy": "Copy",
  "common.checking": "Checking…",

  // Header
  "header.demoBadge": "DEMO ×",
  "header.demoExitTitle": "Click to exit Demo Mode and return to live gcloud data",
  "header.refreshTitle": "Force refresh from Google Cloud & BigQuery",
  "header.syncing": "Syncing…",
  "header.refresh": "↻ Refresh",
  "header.settingsBtn": "⚙ Settings",
  "header.settingsTitle": "Open settings & language menu",
  "header.account": "Account",
  "header.accountAria": "Active Google Cloud Account",
  "header.showEmailTitle": "Show full email",
  "header.maskEmailTitle": "Mask email (PII protection)",
  "header.showEmailAria": "Show full email",
  "header.maskEmailAria": "Mask email",
  "header.activeProject": "Active Project",
  "header.copyProjectTitle": "Click to copy active gcloud project ID",
  "header.unset": "(unset)",

  // Navigation Tabs
  "tabs.ariaLabel": "GCP Companion Sections",
  "tabs.overview": "Overview",
  "tabs.projects": "Projects",
  "tabs.billing": "Billing",

  // Onboarding — Step 1 (Install gcloud CLI)
  "onboard.step1Badge": "STEP 1 OF 2 · CLI REQUIRED",
  "onboard.step1Title": "Install Google Cloud CLI (gcloud)",
  "onboard.step1Desc":
    "Google Cloud CLI (`gcloud`) was not detected on your computer. Install it first, then sign in to inspect your GCP projects and billing accounts.",
  "onboard.step1Check1Title": "Install Google Cloud CLI (`gcloud`)",
  "onboard.step1Check1Desc":
    "Not found in PATH or standard SDK folders. Install via official installer or Homebrew.",
  "onboard.step1Check2Title": "Sign in to Google Cloud",
  "onboard.step1Check2Desc": "Run `gcloud auth login` after installation.",
  "onboard.downloadInstallBtn": "Download & Install gcloud CLI ↗",
  "onboard.homebrewLabel": "macOS Quick Install (Homebrew)",
  "onboard.signInAfterInstallLabel": "Step 2 — Sign In After Installing",
  "onboard.recheckCliBtn": "↻ Re-check gcloud Installation",
  "onboard.previewDemoBtn": "Preview Demo Dashboard",

  // Onboarding — Step 2 (Sign in with Google Account)
  "onboard.step2Badge": "STEP 2 OF 2 · SIGN IN REQUIRED",
  "onboard.step2Title": "Sign in to Your Google Cloud Account",
  "onboard.step2Desc":
    "Google Cloud CLI (`gcloud`) is installed on your computer, but no authenticated Google account is active yet. Sign in to view your projects and billing.",
  "onboard.cliDetectedTitle": "Google Cloud CLI Detected",
  "onboard.authAccountTitle": "Authenticate Google Account",
  "onboard.authAccountDesc":
    "Click below to launch Google Sign-In in your browser, or run `gcloud auth login` in a terminal.",
  "onboard.waitingBrowserBtn": "Waiting for Browser Sign-In…",
  "onboard.signInBrowserBtn": "🔑 Sign in with Browser (gcloud auth login)",
  "onboard.orRunInTerminal": "Or Run in Your Terminal",
  "onboard.signedInRefreshBtn": "↻ I Signed In — Refresh",

  // Known backend setup hints
  "hint.installCli": "Install Google Cloud SDK (`gcloud`) and run `gcloud auth login`.",
  "hint.runAuthLogin": "Run `gcloud auth login` in your terminal, then click Refresh.",
  "hint.sessionExpired":
    "Your Google Cloud session has expired or been revoked. Please sign in again with `gcloud auth login`.",
  "hint.demoActive":
    "Demo Preview Mode is active. Switch off Demo Mode in Billing -> Settings to use live gcloud data.",

  // Enable Cloud Billing API prompt
  "billingApi.badge": "ACTION NEEDED",
  "billingApi.title": "Enable Cloud Billing API",
  "billingApi.desc":
    "To display your Cloud Billing Accounts and project billing status, Google Cloud requires the free Cloud Billing API (cloudbilling.googleapis.com) to be enabled on a quota project.",
  "billingApi.quotaProjectLabel": "Quota Project to Enable API On",
  "billingApi.enablingBtn": "Enabling Cloud Billing API (~10s)…",
  "billingApi.enableBtn": "⚡ Enable Cloud Billing API on {project}",
  "billingApi.openConsoleProject": "Open GCP Console ({project}) ↗",
  "billingApi.openConsole": "Open GCP Console ↗",

  // Spend & Charts
  "spend.noBaseline": "No prior MTD baseline",
  "spend.vsPrevMtd": "{delta}% vs prev MTD",
  "spend.gross": "Gross: {amount}",
  "spend.credits": "Credits: {amount}",
  "spend.lastMonthTotal": "Last mo total: {amount}",
  "spend.monthTotalLabel": "{month} total: {amount}",
  "spend.settledBadge": "✓ Archived · No BQ rescan",
  "spend.backfillingBadge": "⏳ Backfilling ({days}d)",
  "spend.projectedNet": "Projected EOM Net: {amount}",
  "spend.projectedGross": "Projected Gross: {amount}",
  "spend.forecastBasis": "Based on {days}/{total} complete days (thru {date})",
  "spend.forecastExcludedToday": "excl. partial today",
  "spend.forecastCreditsCaution": "Linear pace estimate; credits exhaustion & EOM adjustments not included",
  "spend.forecastNegativeCaution": "Negative adjustments detected; net forecast paused",
  "spend.priorMonthRunRateRef":
    "Prior ({month}, {days}d exported) avg: {net}/day ({gross} gross/day) · Forecast enables after 2+ current-month days",
  "spend.lastMonthShort": "Last mo: {amount}",
  "chart.noDailyUsage": "No daily usage rows for this month yet",
  "chart.dailyTrendAria": "Daily net spend trend ({days} days)",
  "chart.dailyGrossTrendAria": "Daily gross usage trend ({days} days, covered by credits)",
  "chart.dailyTrendWithForecastAria": "Daily net spend trend ({days} days) with month-end linear forecast",
  "chart.dailyGrossTrendWithForecastAria": "Daily gross usage trend ({days} days) with month-end linear forecast",
  "chart.forecastCaption": "Dashed: {rate}/d pace → {monthEnd}",
  "chart.peakPerDay": "Peak {amount}/d",
  "chart.peakGrossPerDay": "Peak gross {amount}/d",
  "chart.noBillableServices": "No billable service usage recorded this month.",
  "chart.grossCreditsHint": "Gross {gross}, Credits {credits}",
  "chart.grossShort": "Gross {amount}",

  // Overview Tab
  "overview.cliRecommendedBadge": "CLI RECOMMENDED",
  "overview.cliNotFoundTitle": "Google Cloud CLI (`gcloud`) Not Found",
  "overview.cliNotFoundDesc":
    "Connected using saved Application Default Credentials, but `gcloud` CLI was not found on your computer. Install `gcloud` to enable account switching and CLI project sync.",
  "overview.installCliBtn": "Install gcloud CLI ↗",
  "overview.mtdNetSpend": "Month-to-Date Net Spend ({month})",
  "overview.monthlyNetSpend": "Monthly Net Spend ({month})",
  "overview.monthSelectorAria": "Select billing month",
  "overview.monthNoRowsYet":
    "No exported billing rows for {month} yet (GCP export or backfill may still be syncing).",
  "overview.spendBreakdownTitle": "Current Spend Breakdown",
  "overview.spendBreakdownTitleForMonth": "Spend Breakdown ({month})",
  "overview.byProject": "By Project",
  "overview.byAccount": "By Account",
  "overview.byService": "By Service",
  "overview.topService": "Top: {service}",
  "overview.noProjectCosts": "No per-project costs recorded this month.",
  "overview.noBqRows": "No BQ rows",
  "overview.kpiActiveProjects": "Active Projects",
  "overview.kpiBillingApiOff": "Billing API Off",
  "overview.kpiOpenBillingAccts": "Open Billing Accts",
  "overview.kpiEnableApiBelow": "Enable API Below",
  "overview.kpiUnbilledSandbox": "Unbilled / Sandbox",
  "overview.bqWaitingTitle": "BigQuery Connected — Waiting for Usage Rows",
  "overview.unlockSpendTitle": "Unlock Month-to-Date Spend Tracking",
  "overview.bqWaitingDesc":
    "Queried {tables}, which currently has no rows for {currentMonth} / {prevMonth}.",
  "overview.unlockSpendDesc":
    "GCP's REST API lists projects, billing accounts, and budget rules immediately. Connect a BigQuery Billing Export table to see exact net spend, credits, and per-service breakdowns.",
  "overview.manageExportBtn": "Manage Export Tables →",
  "overview.connectBqBtn": "Connect BigQuery Export →",
  "overview.previewSampleBtn": "Preview Sample Spend",
  "overview.pinnedAndActiveTitle": "Pinned & Active Projects",
  "overview.viewAllProjects": "View all ({count}) →",
  "overview.pinEmptyHint":
    "Star ★ your favorite projects in the Projects tab to pin them here for 1-click switching.",
  "overview.diagnosticsTitle": "Diagnostics & Notes",
  "warnings.openIamConsole": "Open IAM Permissions in GCP Console ↗",
  "warnings.enableApiConsole": "Enable API in GCP Console ↗",

  // Projects Tab & Cards
  "projects.filterFocus": "Active & Pinned ★ ({count})",
  "projects.filterAll": "All ({count})",
  "projects.filterPinned": "Pinned ★ ({count})",
  "projects.filterUnbilled": "Unbilled ({count})",
  "projects.searchPlaceholder": "Search project name, ID, number, label…",
  "projects.searchAria": "Search GCP Projects",
  "projects.sortAria": "Sort projects",
  "projects.sortSmart": "Sort: Smart",
  "projects.sortSpend": "Sort: Spend ↓",
  "projects.sortName": "Sort: Name A–Z",
  "projects.emptyFilter": "No GCP projects match the current filter.",
  "projects.focusEmptyPrompt":
    "Type in the search box above to find any of your {total} projects, or browse the list.",
  "projects.hiddenCompactHint":
    "Showing {shown} of {total} projects — type above to search all, or",
  "projects.browseAllBtn": "Browse projects ({total}) ▾",
  "projects.showMoreBtn": "Show more ({remaining} remaining) ▾",
  "projects.collapseListBtn": "Collapse list ▴",
  "project.activeBadge": "Active",
  "project.unbilledTag": "Unbilled",
  "project.noBillingTag": "No Billing",
  "project.setActiveBtn": "Set Active",
  "project.setActiveCmdTitle": "Run gcloud config set project {project}",
  "project.openConsoleTitle": "Open in Google Cloud Console",
  "project.unpinTitle": "Unpin project",
  "project.pinTitle": "Pin project to Overview",
  "project.unpinAria": "Unpin {project}",
  "project.pinAria": "Pin {project}",
  "project.copyIdTitle": "Copy Project ID",
  "project.hideBtn": "Hide ▴",
  "project.detailsBtn": "Details ▾",
  "project.projectNumber": "Project # {number}",
  "project.billingId": "Billing ID: {id}",
  "project.billingAccountLabel": "Billing Account",
  "project.changeBillingBtn": "Change",
  "project.linkBillingBtn": "Link Billing",
  "project.cancelBtn": "Cancel",
  "project.billingSelectAria": "Select target billing account",
  "project.billingSelectPlaceholder": "Select an open billing account…",
  "project.billingCurrentSuffix": "(Current)",
  "project.billingManualOption": "Enter Billing Account ID manually…",
  "project.billingManualPlaceholder": "01ABCD-234567-89EFGH",
  "project.billingManualAria": "Manual Billing Account ID",
  "project.billingManualFormatHint": "Format: XXXXXX-XXXXXX-XXXXXX (unlinking is not supported)",
  "project.billingAlreadyLinked": "This project is already linked to that billing account.",
  "project.billingClosedNotAllowed": "Closed billing accounts cannot be linked to a project.",
  "project.billingConfirmTitle": "Confirm Billing Account Change",
  "project.billingConfirmFrom": "From",
  "project.billingConfirmTo": "To",
  "project.billingConfirmNote":
    "New usage will be billed to the target account. Existing BigQuery historical spend stays on the previous account.",
  "project.billingConfirmSwitchBtn": "Confirm Switch",
  "project.billingConfirmLinkBtn": "Confirm Link",
  "project.billingSwitchingBtn": "Switching…",
  "project.billingOpenConsoleLink": "Open Billing in GCP Console ↗",
  "project.noBqCostThisMonth": "No BigQuery cost entries recorded for this project in the current month.",
  "project.connectBqForCosts":
    "Connect BigQuery Billing Export in the Billing tab to view per-service costs here.",
  "project.linkDashboard": "Dashboard ↗",
  "project.linkBillingReport": "Billing Report ↗",
  "project.linkCloudRun": "Cloud Run ↗",
  "project.linkBigQuery": "BigQuery ↗",
  "project.linkLogs": "Logs ↗",
  "project.dangerZoneLabel": "Danger Zone",
  "project.deleteBtn": "Delete Project",
  "project.deleteConfirmTitle": "Shut Down & Delete Project",
  "project.deleteConfirmDesc":
    "Deleting {project} immediately stops all services and billing. The project enters a 30-day recovery window in Google Cloud Console before permanent deletion.",
  "project.deleteWarnActive":
    "This is currently your active gcloud project. You will need to switch to another project after deletion.",
  "project.deleteWarnQuota":
    "This project is set as your Quota Project Override. The override will be cleared automatically.",
  "project.deleteWarnBqExport":
    "This project hosts a linked BigQuery Billing Export table. Spend queries using this project will stop working if it is deleted.",
  "project.deleteTypePrompt": "Type {project} to confirm deletion:",
  "project.deleteInputAria": "Confirm project ID to delete",
  "project.deleteConfirmSubmitBtn": "Shut Down & Delete",
  "project.deleteDeletingBtn": "Deleting…",
  "project.deleteOpenConsoleLink": "Open Project Settings in GCP Console ↗",
  "project.deletedBannerTitle": "Project {project} scheduled for deletion",
  "project.deletedBannerDesc":
    "You can restore this project within 30 days from Pending Deletion in Google Cloud Console.",
  "project.deletedBannerDemoDesc":
    "Demo Mode simulation only — no real Google Cloud project was affected. Toggle Demo Mode or restart to reset.",
  "project.deletedBannerConsoleLink": "Open Pending Deletion ↗",
  "project.dismissBannerAria": "Dismiss notification",

  // Billing Tab & Account Cards
  "billing.statusOpen": "OPEN",
  "billing.statusClosed": "CLOSED",
  "billing.activeUpperBadge": "ACTIVE",
  "billing.projectCountOne": "1 project",
  "billing.projectCountMany": "{count} projects",
  "billing.copyIdTitle": "Copy Billing Account ID",
  "billing.consoleReportBtn": "Console Report ↗",
  "billing.noLinkedProjects": "No active projects linked to this billing account.",
  "billing.setActiveTitle": "Set {project} as active gcloud project",
  "billing.openProjectConsoleTitle": "Open {project} in Google Cloud Console",
  "billing.linkedProjectsHeader": "Linked Projects ({count})",
  "billing.filterInProjectsBtn": "Filter in Projects tab →",
  "billing.showAllLinkedBtn": "Show all {count} linked projects ▾",
  "billing.mtdNetLabel": "Month-to-Date Net",
  "billing.boundNoRows": "Bound to {table} (no rows for current month yet).",
  "billing.linkExportHint":
    "Link a BigQuery Billing Export table below to display spend for this billing account.",
  "billing.configuredBudgets": "Configured Budgets ({count})",
  "billing.budgetLastPeriod": "100% of last period",
  "billing.budgetCustomTarget": "Custom target",
  "billing.budgetNoThresholds": "No threshold rules",
  "billing.diagnosticsTitle": "Billing API Diagnostics",
  "billing.noAccountsVisible":
    "No Cloud Billing accounts visible to the active Google account (requires `billing.accounts.get` or `billing.accounts.list`).",

  // BigQuery Export Connection Wizard
  "export.title": "BigQuery Billing Export Connection",
  "export.desc":
    "Queries are cached locally (default 6h TTL) and strictly pruned by `_PARTITIONTIME` so only current & previous month partitions are scanned.",
  "export.sharedMapping": "Shared Export (*)",
  "export.accountMapping": "Billing Account {id}",
  "export.unlinkBtn": "Unlink",
  "export.autoDetectLabel": "Auto-Detect Export Tables in Project",
  "export.hostProjectPlaceholder": "Select or type host project ID…",
  "export.hostProjectAria": "Billing Export Host Project ID",
  "export.scanningBtn": "Scanning…",
  "export.scanDatasetsBtn": "Scan Datasets",
  "export.matchesBillingId": "Matches Billing ID: {id}",
  "export.sharedCustomExport": "Shared / Custom Export",
  "export.linkAndQueryBtn": "Link & Query",
  "export.manualBindLabel": "Or Bind Table ID Manually",
  "export.targetAccountAria": "Target Billing Account",
  "export.allAccountsOption": "All Billing Accounts (* shared export)",
  "export.saveBtn": "Save",
  "export.helpSummary": "How do I enable BigQuery Billing Export in GCP?",
  "export.helpStep1": "Open Google Cloud Console → Billing → Billing export.",
  "export.helpStep2": "Choose a project & BigQuery dataset to store billing records.",
  "export.helpStep3": "Enable 'Standard usage cost' export (recommended, lightweight).",
  "export.helpStep4": "Return here and click 'Scan Datasets' on that project.",
  "export.openBillingConsole": "Open GCP Billing Console ↗",

  // Preferences & Settings
  "settings.menuTitle": "Settings",
  "settings.closeBtnAria": "Close settings menu",
  "settings.summary": "Companion Preferences & Cache Settings",
  "settings.languageLabel": "Display Language",
  "settings.privacySection": "Privacy & Preview",
  "settings.maskEmailToggle": "Mask account email addresses",
  "settings.advancedSummary": "Advanced CLI & Quota Settings",
  "settings.cacheTtlLabel": "Local Cache TTL (avoids repeated BigQuery scans)",
  "settings.hoursRecommended": "6 hours (Recommended)",
  "settings.hourOne": "1 hour",
  "settings.hoursMany": "{hours} hours",
  "settings.quotaProjectLabel": "Quota Project Override (x-goog-user-project)",
  "settings.quotaProjectPlaceholder": "Defaults to active gcloud project",
  "settings.gcloudPathLabel": "Custom gcloud Binary Path (optional)",
  "settings.applyBtn": "Apply Settings",
  "settings.switchToLiveBtn": "Switch to Live gcloud Data",
  "settings.enableDemoBtn": "Enable Demo Preview Mode",

  // Toast Notifications
  "toast.refreshed": "Google Cloud data refreshed",
  "toast.loadFailed": "Failed to load data",
  "toast.enablingBillingApi": "Enabling Cloud Billing API on {project}…",
  "toast.enabledBillingApi": "Cloud Billing API enabled! Billing accounts refreshed.",
  "toast.enableBillingApiFailed": "Failed to enable Cloud Billing API",
  "toast.switchedAccount": "Switched active gcloud account",
  "toast.switchAccountFailed": "Failed to switch account",
  "toast.prefUpdateFailed": "Failed to update preference",
  "toast.copied": "Copied {value}",
  "toast.exitedDemo": "Exited Demo Mode",
  "toast.demoEnabled": "Demo Preview Mode enabled",
  "toast.openingBrowserSignIn": "Opening Google Sign-In in your browser…",
  "toast.signedInSuccess": "Signed in to Google Cloud!",
  "toast.signInIncomplete": "Browser sign-in did not complete",
  "toast.showingSampleSpend": "Showing sample spend data",
  "toast.activeProjectSet": "Active project set to {project}",
  "toast.switchedProject": "Switched active project to {project}",
  "toast.switchProjectFailed": "Failed to switch project",
  "toast.switchedBillingAccount": "Linked {project} to {account}",
  "toast.switchBillingFailed": "Failed to switch billing account",
  "toast.deletedProject": "Project {project} scheduled for deletion",
  "toast.deletedProjectDemo": "Demo Mode: simulated deletion of {project}",
  "toast.deleteProjectFailed": "Failed to delete project",
  "toast.pinUpdateFailed": "Failed to update pin",
  "toast.removedExportMapping": "Removed export table mapping",
  "toast.removeExportFailed": "Failed to remove mapping",
  "toast.enterHostProject": "Select or enter a host project ID first",
  "toast.noExportTablesFound": "No gcp_billing_export_* tables found in {project}",
  "toast.foundExportTables": "Found {count} billing export table(s)",
  "toast.discoveryFailed": "Discovery failed",
  "toast.connectedExport": "Connected BigQuery Billing Export!",
  "toast.connectExportFailed": "Failed to connect table",
  "toast.enterTableId": "Enter project.dataset.table first",
  "toast.savedExportTable": "Saved BigQuery export table & loaded spend",
  "toast.invalidTableRef": "Invalid table reference",
  "toast.languageUpdated": "Display language updated",
  "toast.cacheTtlSet": "Cache TTL set to {hours}h",
  "toast.savedSettings": "Saved companion settings",
  "toast.invalidSettings": "Invalid settings input",
  "toast.demoOn": "Demo Mode ON",
  "toast.demoOff": "Demo Mode OFF (Live gcloud)",

  // Plugin Updater
  "update.headerBadgeAvailable": "⬆ v{version}",
  "update.headerBadgeTitle": "Plugin update v{version} is available — click to update",
  "update.headerUpdatedBadge": "✓ v{version}",
  "update.headerUpdatedTitle":
    "Updated to v{version} — reload Antigravity to restart background sidecar",
  "update.sectionTitle": "Plugin Version & Updates",
  "update.currentVersionLabel": "Current v{version}",
  "update.statusUpToDate": "Up to date",
  "update.statusAvailable": "v{version} available on GitHub",
  "update.statusUpdatedRestart": "Updated to v{version} (reload to apply)",
  "update.autoUpdateToggle": "Automatically install plugin updates from GitHub",
  "update.checkBtn": "↻ Check for Updates",
  "update.checkingBtn": "Checking GitHub…",
  "update.installBtn": "⬆ Update to v{version}",
  "update.installingBtn": "Updating plugin…",
  "toast.upToDate": "GCP Companion is up to date (v{version})",
  "toast.updateAvailable": "New version v{version} is available!",
  "toast.updateInstalled": "Updated GCP Companion to v{version}! Reload Antigravity to complete.",
  "toast.updateFailed": "Plugin update failed",
}         ;

                                                      
                                                                


// --- i18n/es.js ---
const ES_MESSAGES                     = {
  // Locale switcher
  "locale.autoShort": "🌐 Auto",
  "locale.autoFull": "Automático (sistema / navegador)",
  "header.languageAria": "Idioma de visualización",
  "header.languageTitle": "Cambiar idioma de visualización",

  // Boot & Fatal Error
  "boot.connecting": "Conectando con Google Cloud Companion…",
  "boot.errorTitle": "No se pudo cargar GCP Companion",
  "boot.unknownError": "Error de conexión desconocido.",
  "boot.retry": "Reintentar",
  "loading.projects": "Cargando proyectos…",
  "loading.billing": "Cargando cuentas de facturación…",
  "loading.budgets": "Cargando presupuestos…",
  "loading.spend": "Consultando gasto en BigQuery…",
  "loading.billingStatus": "Comprobando facturación…",
  "loading.sectionErrorRetry": "↻ Reintentar",

  // Relative sync age
  "age.notSynced": "Sin sincronizar",
  "age.offlineCacheSuffix": " (caché sin conexión)",
  "age.justNow": "Justo ahora{suffix}",
  "age.secondsAgo": "hace {n} s{suffix}",
  "age.minutesAgo": "hace {n} min{suffix}",
  "age.hoursMinutesAgo": "hace {h} h {m} min{suffix}",

  // Common controls
  "common.copy": "Copiar",
  "common.checking": "Comprobando…",

  // Header
  "header.demoBadge": "DEMO ×",
  "header.demoExitTitle": "Haz clic para salir del modo demo y volver a los datos reales de gcloud",
  "header.refreshTitle": "Forzar actualización desde Google Cloud y BigQuery",
  "header.syncing": "Sincronizando…",
  "header.refresh": "↻ Actualizar",
  "header.settingsBtn": "⚙ Ajustes",
  "header.settingsTitle": "Abrir menú de ajustes e idioma",
  "header.account": "Cuenta",
  "header.accountAria": "Cuenta activa de Google Cloud",
  "header.showEmailTitle": "Mostrar correo completo",
  "header.maskEmailTitle": "Ocultar correo (protección de privacidad)",
  "header.showEmailAria": "Mostrar correo completo",
  "header.maskEmailAria": "Ocultar correo",
  "header.activeProject": "Proyecto activo",
  "header.copyProjectTitle": "Haz clic para copiar el ID del proyecto activo de gcloud",
  "header.unset": "(sin definir)",

  // Navigation Tabs
  "tabs.ariaLabel": "Secciones de GCP Companion",
  "tabs.overview": "Resumen",
  "tabs.projects": "Proyectos",
  "tabs.billing": "Facturación",

  // Onboarding — Step 1 (Install gcloud CLI)
  "onboard.step1Badge": "PASO 1 DE 2 · SE REQUIERE CLI",
  "onboard.step1Title": "Instalar Google Cloud CLI (gcloud)",
  "onboard.step1Desc":
    "No se detectó Google Cloud CLI (`gcloud`) en tu equipo. Instálalo primero e inicia sesión para consultar tus proyectos de GCP y cuentas de facturación.",
  "onboard.step1Check1Title": "Instalar Google Cloud CLI (`gcloud`)",
  "onboard.step1Check1Desc":
    "No se encontró en PATH ni en las carpetas estándar del SDK. Instálalo mediante el instalador oficial o Homebrew.",
  "onboard.step1Check2Title": "Iniciar sesión en Google Cloud",
  "onboard.step1Check2Desc": "Ejecuta `gcloud auth login` después de la instalación.",
  "onboard.downloadInstallBtn": "Descargar e instalar gcloud CLI ↗",
  "onboard.homebrewLabel": "Instalación rápida en macOS (Homebrew)",
  "onboard.signInAfterInstallLabel": "Paso 2 — Iniciar sesión tras instalar",
  "onboard.recheckCliBtn": "↻ Volver a comprobar gcloud",
  "onboard.previewDemoBtn": "Ver panel de demostración",

  // Onboarding — Step 2 (Sign in with Google Account)
  "onboard.step2Badge": "PASO 2 DE 2 · INICIO DE SESIÓN REQUERIDO",
  "onboard.step2Title": "Inicia sesión en tu cuenta de Google Cloud",
  "onboard.step2Desc":
    "Google Cloud CLI (`gcloud`) está instalado en tu equipo, pero aún no hay ninguna cuenta de Google autenticada. Inicia sesión para ver tus proyectos y facturación.",
  "onboard.cliDetectedTitle": "Google Cloud CLI detectado",
  "onboard.authAccountTitle": "Autenticar cuenta de Google",
  "onboard.authAccountDesc":
    "Haz clic abajo para abrir el inicio de sesión de Google en tu navegador o ejecuta `gcloud auth login` en una terminal.",
  "onboard.waitingBrowserBtn": "Esperando inicio de sesión en el navegador…",
  "onboard.signInBrowserBtn": "🔑 Iniciar sesión con el navegador (gcloud auth login)",
  "onboard.orRunInTerminal": "O ejecutar en tu terminal",
  "onboard.signedInRefreshBtn": "↻ Ya inicié sesión — Actualizar",

  // Known backend setup hints
  "hint.installCli": "Instala Google Cloud SDK (`gcloud`) y ejecuta `gcloud auth login`.",
  "hint.runAuthLogin": "Ejecuta `gcloud auth login` en tu terminal y luego haz clic en Actualizar.",
  "hint.sessionExpired":
    "Tu sesión de Google Cloud ha caducado o fue revocada. Vuelve a iniciar sesión con `gcloud auth login`.",
  "hint.demoActive":
    "El modo de vista previa demo está activo. Desactívalo en Ajustes para usar datos reales de gcloud.",

  // Enable Cloud Billing API prompt
  "billingApi.badge": "ACCIÓN REQUERIDA",
  "billingApi.title": "Habilitar Cloud Billing API",
  "billingApi.desc":
    "Para mostrar tus cuentas de facturación de Cloud y el estado de facturación de los proyectos, Google Cloud requiere habilitar la API gratuita Cloud Billing API (cloudbilling.googleapis.com) en un proyecto de cuota.",
  "billingApi.quotaProjectLabel": "Proyecto de cuota donde habilitar la API",
  "billingApi.enablingBtn": "Habilitando Cloud Billing API (~10 s)…",
  "billingApi.enableBtn": "⚡ Habilitar Cloud Billing API en {project}",
  "billingApi.openConsoleProject": "Abrir consola de GCP ({project}) ↗",
  "billingApi.openConsole": "Abrir consola de GCP ↗",

  // Spend & Charts
  "spend.noBaseline": "Sin referencia del mes anterior",
  "spend.vsPrevMtd": "{delta}% vs. mes ant.",
  "spend.gross": "Bruto: {amount}",
  "spend.credits": "Créditos: {amount}",
  "spend.lastMonthTotal": "Total mes ant.: {amount}",
  "spend.monthTotalLabel": "Total de {month}: {amount}",
  "spend.settledBadge": "✓ Archivado · Sin reescaneo BQ",
  "spend.backfillingBadge": "⏳ Rellenando ({days} d)",
  "spend.projectedNet": "Neto proyectado fin de mes: {amount}",
  "spend.projectedGross": "Bruto proyectado: {amount}",
  "spend.forecastBasis": "Basado en {days}/{total} días completos (hasta {date})",
  "spend.forecastExcludedToday": "excl. día parcial de hoy",
  "spend.forecastCreditsCaution": "Estimación lineal; no incluye agotamiento de créditos ni ajustes de fin de mes",
  "spend.forecastNegativeCaution": "Ajustes negativos detectados; proyección lineal pausada",
  "spend.priorMonthRunRateRef":
    "Ref. mes ant. ({month}, {days} d exportados): {net}/día neto ({gross}/día bruto) · La proyección inicia con 2+ días del mes actual",
  "spend.lastMonthShort": "Mes ant.: {amount}",
  "chart.noDailyUsage": "Aún no hay registros de uso diario este mes",
  "chart.dailyTrendAria": "Tendencia de gasto neto diario ({days} días)",
  "chart.dailyGrossTrendAria": "Tendencia de uso bruto diario ({days} días, cubierto por créditos)",
  "chart.dailyTrendWithForecastAria": "Tendencia de gasto neto diario ({days} días) con proyección lineal de fin de mes",
  "chart.dailyGrossTrendWithForecastAria": "Tendencia de uso bruto diario ({days} días) con proyección lineal de fin de mes",
  "chart.forecastCaption": "Punteado: ritmo {rate}/d → {monthEnd}",
  "chart.peakPerDay": "Máx. {amount}/día",
  "chart.peakGrossPerDay": "Máx. bruto {amount}/día",
  "chart.noBillableServices": "No se registró uso de servicios facturables este mes.",
  "chart.grossCreditsHint": "Bruto {gross}, Créditos {credits}",
  "chart.grossShort": "Bruto {amount}",

  // Overview Tab
  "overview.cliRecommendedBadge": "CLI RECOMENDADO",
  "overview.cliNotFoundTitle": "No se encontró Google Cloud CLI (`gcloud`)",
  "overview.cliNotFoundDesc":
    "Conectado mediante credenciales predeterminadas de aplicación (ADC), pero no se encontró `gcloud` en tu equipo. Instala `gcloud` para cambiar de cuenta y sincronizar proyectos.",
  "overview.installCliBtn": "Instalar gcloud CLI ↗",
  "overview.mtdNetSpend": "Gasto neto del mes hasta la fecha ({month})",
  "overview.monthlyNetSpend": "Gasto neto mensual ({month})",
  "overview.monthSelectorAria": "Seleccionar mes de facturación",
  "overview.monthNoRowsYet":
    "Aún no hay filas exportadas para {month} (la exportación o relleno de GCP puede seguir sincronizándose).",
  "overview.spendBreakdownTitle": "Desglose del gasto actual",
  "overview.spendBreakdownTitleForMonth": "Desglose del gasto ({month})",
  "overview.byProject": "Por proyecto",
  "overview.byAccount": "Por cuenta",
  "overview.byService": "Por servicio",
  "overview.topService": "Principal: {service}",
  "overview.noProjectCosts": "No se registraron costos por proyecto este mes.",
  "overview.noBqRows": "Sin filas BQ",
  "overview.kpiActiveProjects": "Proyectos activos",
  "overview.kpiBillingApiOff": "API de facturación inactiva",
  "overview.kpiOpenBillingAccts": "Cuentas de facturación abiertas",
  "overview.kpiEnableApiBelow": "Habilita la API abajo",
  "overview.kpiUnbilledSandbox": "Sin facturación / Sandbox",
  "overview.bqWaitingTitle": "BigQuery conectado — Esperando datos de uso",
  "overview.unlockSpendTitle": "Activa el seguimiento de gastos del mes",
  "overview.bqWaitingDesc":
    "Se consultó {tables}, que aún no tiene filas para {currentMonth} / {prevMonth}.",
  "overview.unlockSpendDesc":
    "La API REST de GCP muestra proyectos, cuentas de facturación y presupuestos al instante. Conecta una tabla de exportación de facturación en BigQuery para ver el gasto neto exacto, créditos y costos por servicio.",
  "overview.manageExportBtn": "Gestionar tablas de exportación →",
  "overview.connectBqBtn": "Conectar exportación de BigQuery →",
  "overview.previewSampleBtn": "Ver gasto de ejemplo",
  "overview.pinnedAndActiveTitle": "Proyectos fijados y activo",
  "overview.viewAllProjects": "Ver todos ({count}) →",
  "overview.pinEmptyHint":
    "Marca con ★ tus proyectos favoritos en la pestaña Proyectos para fijarlos aquí y cambiar con un clic.",
  "overview.diagnosticsTitle": "Diagnóstico y notas",
  "warnings.openIamConsole": "Abrir permisos de IAM en la consola de GCP ↗",
  "warnings.enableApiConsole": "Habilitar API en la consola de GCP ↗",

  // Projects Tab & Cards
  "projects.filterFocus": "Activo y fijados ★ ({count})",
  "projects.filterAll": "Todos ({count})",
  "projects.filterPinned": "Fijados ★ ({count})",
  "projects.filterUnbilled": "Sin facturación ({count})",
  "projects.searchPlaceholder": "Buscar por nombre, ID, número o etiqueta…",
  "projects.searchAria": "Buscar proyectos de GCP",
  "projects.sortAria": "Ordenar proyectos",
  "projects.sortSmart": "Orden: Inteligente",
  "projects.sortSpend": "Orden: Gasto ↓",
  "projects.sortName": "Orden: Nombre A–Z",
  "projects.emptyFilter": "Ningún proyecto de GCP coincide con el filtro actual.",
  "projects.focusEmptyPrompt":
    "Escribe en el cuadro de búsqueda para encontrar cualquiera de tus {total} proyectos o explora la lista.",
  "projects.hiddenCompactHint":
    "Mostrando {shown} de {total} proyectos — escribe arriba para buscar en todos o",
  "projects.browseAllBtn": "Explorar proyectos ({total}) ▾",
  "projects.showMoreBtn": "Mostrar más ({remaining} restantes) ▾",
  "projects.collapseListBtn": "Contraer lista ▴",
  "project.activeBadge": "Activo",
  "project.unbilledTag": "Sin facturación",
  "project.noBillingTag": "Sin facturación",
  "project.setActiveBtn": "Activar",
  "project.setActiveCmdTitle": "Ejecutar gcloud config set project {project}",
  "project.openConsoleTitle": "Abrir en la consola de Google Cloud",
  "project.unpinTitle": "Desfijar proyecto",
  "project.pinTitle": "Fijar proyecto en Resumen",
  "project.unpinAria": "Desfijar {project}",
  "project.pinAria": "Fijar {project}",
  "project.copyIdTitle": "Copiar ID del proyecto",
  "project.hideBtn": "Ocultar ▴",
  "project.detailsBtn": "Detalles ▾",
  "project.projectNumber": "Proyecto n.º {number}",
  "project.billingId": "ID de facturación: {id}",
  "project.billingAccountLabel": "Cuenta de facturación",
  "project.changeBillingBtn": "Cambiar",
  "project.linkBillingBtn": "Vincular facturación",
  "project.cancelBtn": "Cancelar",
  "project.billingSelectAria": "Seleccionar cuenta de facturación de destino",
  "project.billingSelectPlaceholder": "Selecciona una cuenta de facturación abierta…",
  "project.billingCurrentSuffix": "(Actual)",
  "project.billingManualOption": "Escribir ID de cuenta de facturación manualmente…",
  "project.billingManualPlaceholder": "01ABCD-234567-89EFGH",
  "project.billingManualAria": "ID de cuenta de facturación manual",
  "project.billingManualFormatHint": "Formato: XXXXXX-XXXXXX-XXXXXX (no se admite desvincular)",
  "project.billingAlreadyLinked": "Este proyecto ya está vinculado a esa cuenta de facturación.",
  "project.billingClosedNotAllowed": "No se pueden vincular cuentas de facturación cerradas a un proyecto.",
  "project.billingConfirmTitle": "Confirmar cambio de cuenta de facturación",
  "project.billingConfirmFrom": "Desde",
  "project.billingConfirmTo": "Hacia",
  "project.billingConfirmNote":
    "El nuevo uso se facturará a la cuenta de destino. El gasto histórico de BigQuery permanece en la cuenta anterior.",
  "project.billingConfirmSwitchBtn": "Confirmar cambio",
  "project.billingConfirmLinkBtn": "Confirmar vinculación",
  "project.billingSwitchingBtn": "Cambiando…",
  "project.billingOpenConsoleLink": "Abrir facturación en GCP Console ↗",
  "project.noBqCostThisMonth":
    "No hay costos registrados en BigQuery para este proyecto en el mes actual.",
  "project.connectBqForCosts":
    "Conecta la exportación de facturación de BigQuery en la pestaña Facturación para ver costos por servicio.",
  "project.linkDashboard": "Panel ↗",
  "project.linkBillingReport": "Informe de facturación ↗",
  "project.linkCloudRun": "Cloud Run ↗",
  "project.linkBigQuery": "BigQuery ↗",
  "project.linkLogs": "Registros ↗",
  "project.dangerZoneLabel": "Zona de peligro",
  "project.deleteBtn": "Eliminar proyecto",
  "project.deleteConfirmTitle": "Cerrar y eliminar proyecto",
  "project.deleteConfirmDesc":
    "Eliminar {project} detiene de inmediato todos los servicios y la facturación. El proyecto entra en un período de recuperación de 30 días en Google Cloud Console antes de su eliminación permanente.",
  "project.deleteWarnActive":
    "Este es actualmente tu proyecto activo de gcloud. Deberás cambiar a otro proyecto después de eliminarlo.",
  "project.deleteWarnQuota":
    "Este proyecto está configurado como Quota Project Override y se limpiará automáticamente.",
  "project.deleteWarnBqExport":
    "Este proyecto aloja una tabla vinculada de exportación de facturación de BigQuery. Las consultas de gasto dejarán de funcionar si se elimina.",
  "project.deleteTypePrompt": "Escribe {project} para confirmar la eliminación:",
  "project.deleteInputAria": "Confirmar ID del proyecto a eliminar",
  "project.deleteConfirmSubmitBtn": "Cerrar y eliminar",
  "project.deleteDeletingBtn": "Eliminando…",
  "project.deleteOpenConsoleLink": "Abrir configuración del proyecto en GCP Console ↗",
  "project.deletedBannerTitle": "Proyecto {project} programado para eliminación",
  "project.deletedBannerDesc":
    "Puedes restaurar este proyecto dentro de los próximos 30 días desde Recursos pendientes de eliminación en Google Cloud Console.",
  "project.deletedBannerDemoDesc":
    "Simulación en modo demostración: no se afectó ningún proyecto real de GCP. Cambia el modo o reinicia para restablecer.",
  "project.deletedBannerConsoleLink": "Abrir pendientes de eliminación ↗",
  "project.dismissBannerAria": "Descartar notificación",

  // Billing Tab & Account Cards
  "billing.statusOpen": "ABIERTA",
  "billing.statusClosed": "CERRADA",
  "billing.activeUpperBadge": "ACTIVO",
  "billing.projectCountOne": "1 proyecto",
  "billing.projectCountMany": "{count} proyectos",
  "billing.copyIdTitle": "Copiar ID de cuenta de facturación",
  "billing.consoleReportBtn": "Informe en consola ↗",
  "billing.noLinkedProjects": "No hay proyectos activos vinculados a esta cuenta de facturación.",
  "billing.setActiveTitle": "Definir {project} como proyecto activo de gcloud",
  "billing.openProjectConsoleTitle": "Abrir {project} en la consola de Google Cloud",
  "billing.linkedProjectsHeader": "Proyectos vinculados ({count})",
  "billing.filterInProjectsBtn": "Filtrar en Proyectos →",
  "billing.showAllLinkedBtn": "Mostrar los {count} proyectos vinculados ▾",
  "billing.mtdNetLabel": "Gasto neto del mes",
  "billing.boundNoRows": "Vinculado a {table} (sin filas para el mes actual aún).",
  "billing.linkExportHint":
    "Vincula una tabla de exportación de BigQuery abajo para mostrar el gasto de esta cuenta.",
  "billing.configuredBudgets": "Presupuestos configurados ({count})",
  "billing.budgetLastPeriod": "100% del período anterior",
  "billing.budgetCustomTarget": "Objetivo personalizado",
  "billing.budgetNoThresholds": "Sin reglas de umbral",
  "billing.diagnosticsTitle": "Diagnóstico de Billing API",
  "billing.noAccountsVisible":
    "No hay cuentas de facturación de Cloud visibles para la cuenta activa (requiere `billing.accounts.get` o `billing.accounts.list`).",

  // BigQuery Export Connection Wizard
  "export.title": "Conexión de exportación de facturación en BigQuery",
  "export.desc":
    "Las consultas se almacenan en caché local (TTL de 6 h por defecto) y se filtran por `_PARTITIONTIME` para escanear solo el mes actual y el anterior.",
  "export.sharedMapping": "Exportación compartida (*)",
  "export.accountMapping": "Cuenta de facturación {id}",
  "export.unlinkBtn": "Desvincular",
  "export.autoDetectLabel": "Detectar tablas de exportación en el proyecto",
  "export.hostProjectPlaceholder": "Selecciona o escribe el ID del proyecto host…",
  "export.hostProjectAria": "ID del proyecto host de exportación de facturación",
  "export.scanningBtn": "Escaneando…",
  "export.scanDatasetsBtn": "Escanear datasets",
  "export.matchesBillingId": "Coincide con ID de facturación: {id}",
  "export.sharedCustomExport": "Exportación compartida / personalizada",
  "export.linkAndQueryBtn": "Vincular y consultar",
  "export.manualBindLabel": "O vincular ID de tabla manualmente",
  "export.targetAccountAria": "Cuenta de facturación de destino",
  "export.allAccountsOption": "Todas las cuentas de facturación (* exportación compartida)",
  "export.saveBtn": "Guardar",
  "export.helpSummary": "¿Cómo habilito la exportación de facturación a BigQuery en GCP?",
  "export.helpStep1": "Abre Google Cloud Console → Facturación → Exportación de facturación.",
  "export.helpStep2": "Elige un proyecto y un dataset de BigQuery para guardar los registros.",
  "export.helpStep3": "Habilita la exportación de 'Costo de uso estándar' (recomendado).",
  "export.helpStep4": "Vuelve aquí y haz clic en 'Escanear datasets' en ese proyecto.",
  "export.openBillingConsole": "Abrir consola de facturación de GCP ↗",

  // Preferences & Settings
  "settings.menuTitle": "Ajustes",
  "settings.closeBtnAria": "Cerrar menú de ajustes",
  "settings.summary": "Preferencias y caché de Companion",
  "settings.languageLabel": "Idioma de visualización",
  "settings.privacySection": "Privacidad y vista previa",
  "settings.maskEmailToggle": "Ocultar direcciones de correo de las cuentas",
  "settings.advancedSummary": "Ajustes avanzados de CLI y cuota",
  "settings.cacheTtlLabel": "TTL de caché local (evita escaneos repetidos en BigQuery)",
  "settings.hoursRecommended": "6 horas (recomendado)",
  "settings.hourOne": "1 hora",
  "settings.hoursMany": "{hours} horas",
  "settings.quotaProjectLabel": "Proyecto de cuota personalizado (x-goog-user-project)",
  "settings.quotaProjectPlaceholder": "Por defecto usa el proyecto activo de gcloud",
  "settings.gcloudPathLabel": "Ruta personalizada del binario gcloud (opcional)",
  "settings.applyBtn": "Aplicar ajustes",
  "settings.switchToLiveBtn": "Cambiar a datos reales de gcloud",
  "settings.enableDemoBtn": "Activar modo de vista previa demo",

  // Toast Notifications
  "toast.refreshed": "Datos de Google Cloud actualizados",
  "toast.loadFailed": "Error al cargar los datos",
  "toast.enablingBillingApi": "Habilitando Cloud Billing API en {project}…",
  "toast.enabledBillingApi": "¡Cloud Billing API habilitada! Cuentas de facturación actualizadas.",
  "toast.enableBillingApiFailed": "No se pudo habilitar Cloud Billing API",
  "toast.switchedAccount": "Cuenta activa de gcloud cambiada",
  "toast.switchAccountFailed": "Error al cambiar de cuenta",
  "toast.prefUpdateFailed": "Error al actualizar la preferencia",
  "toast.copied": "Copiado: {value}",
  "toast.exitedDemo": "Saliste del modo demo",
  "toast.demoEnabled": "Modo de vista previa demo activado",
  "toast.openingBrowserSignIn": "Abriendo el inicio de sesión de Google en tu navegador…",
  "toast.signedInSuccess": "¡Sesión iniciada en Google Cloud!",
  "toast.signInIncomplete": "El inicio de sesión en el navegador no se completó",
  "toast.showingSampleSpend": "Mostrando datos de gasto de ejemplo",
  "toast.activeProjectSet": "Proyecto activo definido en {project}",
  "toast.switchedProject": "Proyecto activo cambiado a {project}",
  "toast.switchProjectFailed": "Error al cambiar de proyecto",
  "toast.switchedBillingAccount": "{project} vinculado a {account}",
  "toast.switchBillingFailed": "Error al cambiar la cuenta de facturación",
  "toast.deletedProject": "Proyecto {project} programado para eliminación",
  "toast.deletedProjectDemo": "Modo demostración: eliminación simulada de {project}",
  "toast.deleteProjectFailed": "Error al eliminar el proyecto",
  "toast.pinUpdateFailed": "Error al actualizar fijación",
  "toast.removedExportMapping": "Vinculación de tabla de exportación eliminada",
  "toast.removeExportFailed": "Error al eliminar la vinculación",
  "toast.enterHostProject": "Selecciona o escribe primero un ID de proyecto host",
  "toast.noExportTablesFound": "No se encontraron tablas gcp_billing_export_* en {project}",
  "toast.foundExportTables": "Se encontraron {count} tabla(s) de exportación de facturación",
  "toast.discoveryFailed": "Error al buscar tablas",
  "toast.connectedExport": "¡Exportación de facturación de BigQuery conectada!",
  "toast.connectExportFailed": "Error al conectar la tabla",
  "toast.enterTableId": "Escribe primero project.dataset.table",
  "toast.savedExportTable": "Tabla de BigQuery guardada y gasto cargado",
  "toast.invalidTableRef": "Referencia de tabla no válida",
  "toast.languageUpdated": "Idioma de visualización actualizado",
  "toast.cacheTtlSet": "TTL de caché definido en {hours} h",
  "toast.savedSettings": "Ajustes de Companion guardados",
  "toast.invalidSettings": "Entrada de ajustes no válida",
  "toast.demoOn": "Modo demo ACTIVADO",
  "toast.demoOff": "Modo demo DESACTIVADO (gcloud en vivo)",

  // Plugin Updater
  "update.headerBadgeAvailable": "⬆ v{version}",
  "update.headerBadgeTitle": "Actualización v{version} disponible — haz clic para actualizar",
  "update.headerUpdatedBadge": "✓ v{version}",
  "update.headerUpdatedTitle":
    "Actualizado a v{version} — recarga Antigravity para reiniciar el sidecar",
  "update.sectionTitle": "Versión y actualizaciones del plugin",
  "update.currentVersionLabel": "Actual v{version}",
  "update.statusUpToDate": "Actualizado",
  "update.statusAvailable": "v{version} disponible en GitHub",
  "update.statusUpdatedRestart": "Actualizado a v{version} (recarga para aplicar)",
  "update.autoUpdateToggle": "Instalar automáticamente actualizaciones desde GitHub",
  "update.checkBtn": "↻ Buscar actualizaciones",
  "update.checkingBtn": "Consultando GitHub…",
  "update.installBtn": "⬆ Actualizar a v{version}",
  "update.installingBtn": "Actualizando plugin…",
  "toast.upToDate": "GCP Companion está actualizado (v{version})",
  "toast.updateAvailable": "¡Nueva versión v{version} disponible!",
  "toast.updateInstalled":
    "¡GCP Companion actualizado a v{version}! Recarga Antigravity para completar.",
  "toast.updateFailed": "Error al actualizar el plugin",
};


// --- i18n/fr.js ---
const FR_MESSAGES                     = {
  // Locale switcher
  "locale.autoShort": "🌐 Auto",
  "locale.autoFull": "Automatique (système / navigateur)",
  "header.languageAria": "Langue d'affichage",
  "header.languageTitle": "Changer la langue d'affichage",

  // Boot & Fatal Error
  "boot.connecting": "Connexion à Google Cloud Companion…",
  "boot.errorTitle": "Impossible de charger GCP Companion",
  "boot.unknownError": "Erreur de connexion inconnue.",
  "boot.retry": "Réessayer",
  "loading.projects": "Chargement des projets…",
  "loading.billing": "Chargement des comptes de facturation…",
  "loading.budgets": "Chargement des budgets…",
  "loading.spend": "Requête des dépenses BigQuery…",
  "loading.billingStatus": "Vérification de la facturation…",
  "loading.sectionErrorRetry": "↻ Réessayer",

  // Relative sync age
  "age.notSynced": "Non synchronisé",
  "age.offlineCacheSuffix": " (cache hors ligne)",
  "age.justNow": "À l'instant{suffix}",
  "age.secondsAgo": "il y a {n} s{suffix}",
  "age.minutesAgo": "il y a {n} min{suffix}",
  "age.hoursMinutesAgo": "il y a {h} h {m} min{suffix}",

  // Common controls
  "common.copy": "Copier",
  "common.checking": "Vérification…",

  // Header
  "header.demoBadge": "DÉMO ×",
  "header.demoExitTitle": "Cliquer pour quitter le mode démo et revenir aux données gcloud réelles",
  "header.refreshTitle": "Forcer l'actualisation depuis Google Cloud et BigQuery",
  "header.syncing": "Synchronisation…",
  "header.refresh": "↻ Actualiser",
  "header.settingsBtn": "⚙ Paramètres",
  "header.settingsTitle": "Ouvrir le menu des paramètres et de la langue",
  "header.account": "Compte",
  "header.accountAria": "Compte Google Cloud actif",
  "header.showEmailTitle": "Afficher l'adresse e-mail complète",
  "header.maskEmailTitle": "Masquer l'e-mail (protection des données)",
  "header.showEmailAria": "Afficher l'adresse e-mail complète",
  "header.maskEmailAria": "Masquer l'e-mail",
  "header.activeProject": "Projet actif",
  "header.copyProjectTitle": "Cliquer pour copier l'ID du projet gcloud actif",
  "header.unset": "(non défini)",

  // Navigation Tabs
  "tabs.ariaLabel": "Sections GCP Companion",
  "tabs.overview": "Aperçu",
  "tabs.projects": "Projets",
  "tabs.billing": "Facturation",

  // Onboarding — Step 1 (Install gcloud CLI)
  "onboard.step1Badge": "ÉTAPE 1 SUR 2 · CLI REQUISE",
  "onboard.step1Title": "Installer Google Cloud CLI (gcloud)",
  "onboard.step1Desc":
    "Google Cloud CLI (`gcloud`) n'a pas été détectée sur votre ordinateur. Installez-la d'abord, puis connectez-vous pour consulter vos projets GCP et comptes de facturation.",
  "onboard.step1Check1Title": "Installer Google Cloud CLI (`gcloud`)",
  "onboard.step1Check1Desc":
    "Introuvable dans le PATH ou les dossiers SDK standards. Installez-la via l'installateur officiel ou Homebrew.",
  "onboard.step1Check2Title": "Se connecter à Google Cloud",
  "onboard.step1Check2Desc": "Exécutez `gcloud auth login` après l'installation.",
  "onboard.downloadInstallBtn": "Télécharger et installer gcloud CLI ↗",
  "onboard.homebrewLabel": "Installation rapide macOS (Homebrew)",
  "onboard.signInAfterInstallLabel": "Étape 2 — Se connecter après l'installation",
  "onboard.recheckCliBtn": "↻ Revérifier l'installation de gcloud",
  "onboard.previewDemoBtn": "Aperçu du tableau de bord démo",

  // Onboarding — Step 2 (Sign in with Google Account)
  "onboard.step2Badge": "ÉTAPE 2 SUR 2 · CONNEXION REQUISE",
  "onboard.step2Title": "Connectez-vous à votre compte Google Cloud",
  "onboard.step2Desc":
    "Google Cloud CLI (`gcloud`) est installée sur votre ordinateur, mais aucun compte Google authentifié n'est actif. Connectez-vous pour voir vos projets et votre facturation.",
  "onboard.cliDetectedTitle": "Google Cloud CLI détectée",
  "onboard.authAccountTitle": "Authentifier un compte Google",
  "onboard.authAccountDesc":
    "Cliquez ci-dessous pour lancer la connexion Google dans votre navigateur, ou exécutez `gcloud auth login` dans un terminal.",
  "onboard.waitingBrowserBtn": "En attente de connexion dans le navigateur…",
  "onboard.signInBrowserBtn": "🔑 Se connecter via le navigateur (gcloud auth login)",
  "onboard.orRunInTerminal": "Ou exécuter dans votre terminal",
  "onboard.signedInRefreshBtn": "↻ Je suis connecté — Actualiser",

  // Known backend setup hints
  "hint.installCli": "Installez Google Cloud SDK (`gcloud`) et exécutez `gcloud auth login`.",
  "hint.runAuthLogin": "Exécutez `gcloud auth login` dans votre terminal, puis cliquez sur Actualiser.",
  "hint.sessionExpired":
    "Votre session Google Cloud a expiré ou a été révoquée. Veuillez vous reconnecter avec `gcloud auth login`.",
  "hint.demoActive":
    "Le mode aperçu démo est actif. Désactivez-le dans Paramètres pour utiliser les données gcloud réelles.",

  // Enable Cloud Billing API prompt
  "billingApi.badge": "ACTION REQUISE",
  "billingApi.title": "Activer l'API Cloud Billing",
  "billingApi.desc":
    "Pour afficher vos comptes de facturation Cloud et l'état de facturation des projets, Google Cloud requiert l'activation de l'API gratuite Cloud Billing (cloudbilling.googleapis.com) sur un projet de quota.",
  "billingApi.quotaProjectLabel": "Projet de quota sur lequel activer l'API",
  "billingApi.enablingBtn": "Activation de l'API Cloud Billing (~10 s)…",
  "billingApi.enableBtn": "⚡ Activer l'API Cloud Billing sur {project}",
  "billingApi.openConsoleProject": "Ouvrir la console GCP ({project}) ↗",
  "billingApi.openConsole": "Ouvrir la console GCP ↗",

  // Spend & Charts
  "spend.noBaseline": "Aucune référence mois préc.",
  "spend.vsPrevMtd": "{delta}% vs mois préc.",
  "spend.gross": "Brut : {amount}",
  "spend.credits": "Crédits : {amount}",
  "spend.lastMonthTotal": "Total mois dern. : {amount}",
  "spend.monthTotalLabel": "Total {month} : {amount}",
  "spend.settledBadge": "✓ Archivé · Sans réanalyse BQ",
  "spend.backfillingBadge": "⏳ Synchronisation ({days} j)",
  "spend.projectedNet": "Net prévu fin de mois : {amount}",
  "spend.projectedGross": "Brut prévu : {amount}",
  "spend.forecastBasis": "Basé sur {days}/{total} jours complets (au {date})",
  "spend.forecastExcludedToday": "hors journée partielle",
  "spend.forecastCreditsCaution": "Estimation linéaire ; n'inclut pas l'épuisement des crédits ni les ajustements",
  "spend.forecastNegativeCaution": "Ajustements négatifs détectés ; prévision en pause",
  "spend.priorMonthRunRateRef":
    "Réf. mois préc. ({month}, {days} j exportés) : {net}/j net ({gross}/j brut) · Prévision active après 2+ jours du mois en cours",
  "spend.lastMonthShort": "Mois dern. : {amount}",
  "chart.noDailyUsage": "Aucune donnée d'utilisation quotidienne ce mois-ci",
  "chart.dailyTrendAria": "Tendance des dépenses nettes quotidiennes ({days} jours)",
  "chart.dailyGrossTrendAria": "Tendance d'utilisation brute quotidienne ({days} jours, couverte par crédits)",
  "chart.dailyTrendWithForecastAria": "Tendance des dépenses nettes quotidiennes ({days} jours) avec prévision linéaire de fin de mois",
  "chart.dailyGrossTrendWithForecastAria": "Tendance d'utilisation brute quotidienne ({days} jours) avec prévision linéaire de fin de mois",
  "chart.forecastCaption": "Pointillés : rythme {rate}/j → {monthEnd}",
  "chart.peakPerDay": "Pic {amount}/j",
  "chart.peakGrossPerDay": "Pic brut {amount}/j",
  "chart.noBillableServices": "Aucune utilisation de service facturable enregistrée ce mois-ci.",
  "chart.grossCreditsHint": "Brut {gross}, Crédits {credits}",
  "chart.grossShort": "Brut {amount}",

  // Overview Tab
  "overview.cliRecommendedBadge": "CLI RECOMMANDÉE",
  "overview.cliNotFoundTitle": "Google Cloud CLI (`gcloud`) introuvable",
  "overview.cliNotFoundDesc":
    "Connecté via les identifiants par défaut de l'application (ADC), mais `gcloud` est introuvable sur votre ordinateur. Installez `gcloud` pour changer de compte et synchroniser les projets.",
  "overview.installCliBtn": "Installer gcloud CLI ↗",
  "overview.mtdNetSpend": "Dépenses nettes du mois en cours ({month})",
  "overview.monthlyNetSpend": "Dépenses nettes mensuelles ({month})",
  "overview.monthSelectorAria": "Sélectionner le mois de facturation",
  "overview.monthNoRowsYet":
    "Aucune ligne de facturation exportée pour {month} pour l'instant (l'exportation ou le remplissage GCP est peut-être en cours).",
  "overview.spendBreakdownTitle": "Répartition des dépenses actuelles",
  "overview.spendBreakdownTitleForMonth": "Répartition des dépenses ({month})",
  "overview.byProject": "Par projet",
  "overview.byAccount": "Par compte",
  "overview.byService": "Par service",
  "overview.topService": "Principal : {service}",
  "overview.noProjectCosts": "Aucun coût par projet enregistré ce mois-ci.",
  "overview.noBqRows": "Aucune ligne BQ",
  "overview.kpiActiveProjects": "Projets actifs",
  "overview.kpiBillingApiOff": "API Facturation désactivée",
  "overview.kpiOpenBillingAccts": "Comptes de facturation ouverts",
  "overview.kpiEnableApiBelow": "Activer l'API ci-dessous",
  "overview.kpiUnbilledSandbox": "Sans facturation / Bac à sable",
  "overview.bqWaitingTitle": "BigQuery connecté — En attente de données",
  "overview.unlockSpendTitle": "Activer le suivi des dépenses du mois",
  "overview.bqWaitingDesc":
    "Requête effectuée sur {tables}, qui ne contient pas encore de lignes pour {currentMonth} / {prevMonth}.",
  "overview.unlockSpendDesc":
    "L'API REST de GCP liste immédiatement les projets, comptes de facturation et budgets. Connectez une table d'exportation de facturation BigQuery pour voir les dépenses nettes exactes, les crédits et le détail par service.",
  "overview.manageExportBtn": "Gérer les tables d'exportation →",
  "overview.connectBqBtn": "Connecter l'exportation BigQuery →",
  "overview.previewSampleBtn": "Voir un exemple de dépenses",
  "overview.pinnedAndActiveTitle": "Projets épinglés et actif",
  "overview.viewAllProjects": "Tout voir ({count}) →",
  "overview.pinEmptyHint":
    "Ajoutez une étoile ★ à vos projets favoris dans l'onglet Projets pour les épingler ici et basculer en un clic.",
  "overview.diagnosticsTitle": "Diagnostics et remarques",
  "warnings.openIamConsole": "Ouvrir les autorisations IAM dans la console GCP ↗",
  "warnings.enableApiConsole": "Activer l'API dans la console GCP ↗",

  // Projects Tab & Cards
  "projects.filterFocus": "Actif et épinglés ★ ({count})",
  "projects.filterAll": "Tous ({count})",
  "projects.filterPinned": "Épinglés ★ ({count})",
  "projects.filterUnbilled": "Non facturés ({count})",
  "projects.searchPlaceholder": "Rechercher par nom, ID, numéro, libellé…",
  "projects.searchAria": "Rechercher des projets GCP",
  "projects.sortAria": "Trier les projets",
  "projects.sortSmart": "Tri : Intelligent",
  "projects.sortSpend": "Tri : Dépenses ↓",
  "projects.sortName": "Tri : Nom A–Z",
  "projects.emptyFilter": "Aucun projet GCP ne correspond au filtre actuel.",
  "projects.focusEmptyPrompt":
    "Saisissez un terme ci-dessus pour rechercher parmi vos {total} projets ou parcourez la liste.",
  "projects.hiddenCompactHint":
    "Affichage de {shown} projets sur {total} — recherchez ci-dessus ou",
  "projects.browseAllBtn": "Parcourir les projets ({total}) ▾",
  "projects.showMoreBtn": "Afficher plus ({remaining} restants) ▾",
  "projects.collapseListBtn": "Réduire la liste ▴",
  "project.activeBadge": "Actif",
  "project.unbilledTag": "Non facturé",
  "project.noBillingTag": "Sans facturation",
  "project.setActiveBtn": "Définir actif",
  "project.setActiveCmdTitle": "Exécuter gcloud config set project {project}",
  "project.openConsoleTitle": "Ouvrir dans la console Google Cloud",
  "project.unpinTitle": "Désépingler le projet",
  "project.pinTitle": "Épingler le projet dans l'Aperçu",
  "project.unpinAria": "Désépingler {project}",
  "project.pinAria": "Épingler {project}",
  "project.copyIdTitle": "Copier l'ID du projet",
  "project.hideBtn": "Masquer ▴",
  "project.detailsBtn": "Détails ▾",
  "project.projectNumber": "Projet n° {number}",
  "project.billingId": "ID de facturation : {id}",
  "project.billingAccountLabel": "Compte de facturation",
  "project.changeBillingBtn": "Modifier",
  "project.linkBillingBtn": "Associer un compte",
  "project.cancelBtn": "Annuler",
  "project.billingSelectAria": "Sélectionner le compte de facturation cible",
  "project.billingSelectPlaceholder": "Sélectionner un compte de facturation ouvert…",
  "project.billingCurrentSuffix": "(Actuel)",
  "project.billingManualOption": "Saisir l'ID du compte de facturation manuellement…",
  "project.billingManualPlaceholder": "01ABCD-234567-89EFGH",
  "project.billingManualAria": "ID du compte de facturation manuel",
  "project.billingManualFormatHint": "Format : XXXXXX-XXXXXX-XXXXXX (la dissociation n'est pas prise en charge)",
  "project.billingAlreadyLinked": "Ce projet est déjà associé à ce compte de facturation.",
  "project.billingClosedNotAllowed": "Impossible d'associer un compte de facturation fermé à un projet.",
  "project.billingConfirmTitle": "Confirmer le changement de compte de facturation",
  "project.billingConfirmFrom": "De",
  "project.billingConfirmTo": "Vers",
  "project.billingConfirmNote":
    "La nouvelle consommation sera facturée sur le compte cible. L'historique BigQuery reste sur l'ancien compte.",
  "project.billingConfirmSwitchBtn": "Confirmer le changement",
  "project.billingConfirmLinkBtn": "Confirmer l'association",
  "project.billingSwitchingBtn": "Changement en cours…",
  "project.billingOpenConsoleLink": "Ouvrir la facturation dans GCP Console ↗",
  "project.noBqCostThisMonth":
    "Aucune entrée de coût BigQuery enregistrée pour ce projet ce mois-ci.",
  "project.connectBqForCosts":
    "Connectez l'exportation de facturation BigQuery dans l'onglet Facturation pour voir les coûts par service.",
  "project.linkDashboard": "Tableau de bord ↗",
  "project.linkBillingReport": "Rapport de facturation ↗",
  "project.linkCloudRun": "Cloud Run ↗",
  "project.linkBigQuery": "BigQuery ↗",
  "project.linkLogs": "Journaux ↗",
  "project.dangerZoneLabel": "Zone de danger",
  "project.deleteBtn": "Supprimer le projet",
  "project.deleteConfirmTitle": "Arrêter et supprimer le projet",
  "project.deleteConfirmDesc":
    "La suppression de {project} arrête immédiatement tous les services et la facturation. Le projet dispose d'une période de récupération de 30 jours dans Google Cloud Console avant suppression définitive.",
  "project.deleteWarnActive":
    "C'est actuellement votre projet gcloud actif. Vous devrez basculer vers un autre projet après la suppression.",
  "project.deleteWarnQuota":
    "Ce projet est défini comme Quota Project Override et sera effacé automatiquement.",
  "project.deleteWarnBqExport":
    "Ce projet héberge une table d'exportation de facturation BigQuery liée. Les requêtes de dépenses cesseront de fonctionner s'il est supprimé.",
  "project.deleteTypePrompt": "Saisissez {project} pour confirmer la suppression :",
  "project.deleteInputAria": "Confirmer l'ID du projet à supprimer",
  "project.deleteConfirmSubmitBtn": "Arrêter et supprimer",
  "project.deleteDeletingBtn": "Suppression…",
  "project.deleteOpenConsoleLink": "Ouvrir les paramètres du projet dans GCP Console ↗",
  "project.deletedBannerTitle": "Suppression programmée pour le projet {project}",
  "project.deletedBannerDesc":
    "Vous pouvez restaurer ce projet sous 30 jours depuis les ressources en attente de suppression dans Google Cloud Console.",
  "project.deletedBannerDemoDesc":
    "Simulation en mode démo uniquement : aucun projet GCP réel n'a été affecté. Basculez le mode ou redémarrez pour réinitialiser.",
  "project.deletedBannerConsoleLink": "Ouvrir les suppressions en attente ↗",
  "project.dismissBannerAria": "Fermer la notification",

  // Billing Tab & Account Cards
  "billing.statusOpen": "OUVERT",
  "billing.statusClosed": "FERMÉ",
  "billing.activeUpperBadge": "ACTIF",
  "billing.projectCountOne": "1 projet",
  "billing.projectCountMany": "{count} projets",
  "billing.copyIdTitle": "Copier l'ID du compte de facturation",
  "billing.consoleReportBtn": "Rapport console ↗",
  "billing.noLinkedProjects": "Aucun projet actif associé à ce compte de facturation.",
  "billing.setActiveTitle": "Définir {project} comme projet gcloud actif",
  "billing.openProjectConsoleTitle": "Ouvrir {project} dans la console Google Cloud",
  "billing.linkedProjectsHeader": "Projets associés ({count})",
  "billing.filterInProjectsBtn": "Filtrer dans Projets →",
  "billing.showAllLinkedBtn": "Afficher les {count} projets associés ▾",
  "billing.mtdNetLabel": "Dépenses nettes du mois",
  "billing.boundNoRows": "Associé à {table} (aucune ligne pour le mois en cours).",
  "billing.linkExportHint":
    "Associez une table d'exportation BigQuery ci-dessous pour afficher les dépenses de ce compte.",
  "billing.configuredBudgets": "Budgets configurés ({count})",
  "billing.budgetLastPeriod": "100 % de la période précédente",
  "billing.budgetCustomTarget": "Cible personnalisée",
  "billing.budgetNoThresholds": "Aucune règle de seuil",
  "billing.diagnosticsTitle": "Diagnostics de l'API Billing",
  "billing.noAccountsVisible":
    "Aucun compte de facturation Cloud visible pour le compte actif (autorisation `billing.accounts.get` ou `billing.accounts.list` requise).",

  // BigQuery Export Connection Wizard
  "export.title": "Connexion à l'exportation de facturation BigQuery",
  "export.desc":
    "Les requêtes sont mises en cache localement (TTL de 6 h par défaut) et filtrées par `_PARTITIONTIME` afin de n'analyser que le mois en cours et le mois précédent.",
  "export.sharedMapping": "Exportation partagée (*)",
  "export.accountMapping": "Compte de facturation {id}",
  "export.unlinkBtn": "Dissocier",
  "export.autoDetectLabel": "Détecter automatiquement les tables d'exportation",
  "export.hostProjectPlaceholder": "Sélectionnez ou saisissez l'ID du projet hôte…",
  "export.hostProjectAria": "ID du projet hôte d'exportation de facturation",
  "export.scanningBtn": "Analyse…",
  "export.scanDatasetsBtn": "Analyser les datasets",
  "export.matchesBillingId": "Correspond à l'ID de facturation : {id}",
  "export.sharedCustomExport": "Exportation partagée / personnalisée",
  "export.linkAndQueryBtn": "Associer et interroger",
  "export.manualBindLabel": "Ou associer manuellement un ID de table",
  "export.targetAccountAria": "Compte de facturation cible",
  "export.allAccountsOption": "Tous les comptes de facturation (* exportation partagée)",
  "export.saveBtn": "Enregistrer",
  "export.helpSummary": "Comment activer l'exportation de facturation BigQuery dans GCP ?",
  "export.helpStep1": "Ouvrez Google Cloud Console → Facturation → Exportation de la facturation.",
  "export.helpStep2": "Choisissez un projet et un ensemble de données BigQuery pour stocker les relevés.",
  "export.helpStep3": "Activez l'exportation « Coût d'utilisation standard » (recommandé, léger).",
  "export.helpStep4": "Revenez ici et cliquez sur « Analyser les datasets » sur ce projet.",
  "export.openBillingConsole": "Ouvrir la console de facturation GCP ↗",

  // Preferences & Settings
  "settings.menuTitle": "Paramètres",
  "settings.closeBtnAria": "Fermer le menu des paramètres",
  "settings.summary": "Préférences Companion et paramètres du cache",
  "settings.languageLabel": "Langue d'affichage",
  "settings.privacySection": "Confidentialité et aperçu",
  "settings.maskEmailToggle": "Masquer les adresses e-mail des comptes",
  "settings.advancedSummary": "Paramètres avancés CLI et projet de quota",
  "settings.cacheTtlLabel": "Durée du cache local (évite les analyses BigQuery répétées)",
  "settings.hoursRecommended": "6 heures (recommandé)",
  "settings.hourOne": "1 heure",
  "settings.hoursMany": "{hours} heures",
  "settings.quotaProjectLabel": "Remplacement du projet de quota (x-goog-user-project)",
  "settings.quotaProjectPlaceholder": "Utilise par défaut le projet gcloud actif",
  "settings.gcloudPathLabel": "Chemin personnalisé du binaire gcloud (facultatif)",
  "settings.applyBtn": "Appliquer les paramètres",
  "settings.switchToLiveBtn": "Passer aux données gcloud réelles",
  "settings.enableDemoBtn": "Activer le mode aperçu démo",

  // Toast Notifications
  "toast.refreshed": "Données Google Cloud actualisées",
  "toast.loadFailed": "Échec du chargement des données",
  "toast.enablingBillingApi": "Activation de l'API Cloud Billing sur {project}…",
  "toast.enabledBillingApi": "API Cloud Billing activée ! Comptes de facturation actualisés.",
  "toast.enableBillingApiFailed": "Échec de l'activation de l'API Cloud Billing",
  "toast.switchedAccount": "Compte gcloud actif modifié",
  "toast.switchAccountFailed": "Échec du changement de compte",
  "toast.prefUpdateFailed": "Échec de la mise à jour des préférences",
  "toast.copied": "{value} copié",
  "toast.exitedDemo": "Mode démo quitté",
  "toast.demoEnabled": "Mode aperçu démo activé",
  "toast.openingBrowserSignIn": "Ouverture de la connexion Google dans votre navigateur…",
  "toast.signedInSuccess": "Connecté à Google Cloud !",
  "toast.signInIncomplete": "La connexion dans le navigateur n'a pas abouti",
  "toast.showingSampleSpend": "Affichage des exemples de dépenses",
  "toast.activeProjectSet": "Projet actif défini sur {project}",
  "toast.switchedProject": "Projet actif basculé vers {project}",
  "toast.switchProjectFailed": "Échec du changement de projet",
  "toast.switchedBillingAccount": "{project} associé à {account}",
  "toast.switchBillingFailed": "Échec du changement de compte de facturation",
  "toast.deletedProject": "Suppression programmée pour le projet {project}",
  "toast.deletedProjectDemo": "Mode démo : suppression simulée de {project}",
  "toast.deleteProjectFailed": "Échec de la suppression du projet",
  "toast.pinUpdateFailed": "Échec de la mise à jour de l'épingle",
  "toast.removedExportMapping": "Association de table d'exportation supprimée",
  "toast.removeExportFailed": "Échec de la suppression de l'association",
  "toast.enterHostProject": "Sélectionnez ou saisissez d'abord un ID de projet hôte",
  "toast.noExportTablesFound": "Aucune table gcp_billing_export_* trouvée dans {project}",
  "toast.foundExportTables": "{count} table(s) d'exportation de facturation trouvée(s)",
  "toast.discoveryFailed": "Échec de la détection",
  "toast.connectedExport": "Exportation de facturation BigQuery connectée !",
  "toast.connectExportFailed": "Échec de la connexion à la table",
  "toast.enterTableId": "Saisissez d'abord project.dataset.table",
  "toast.savedExportTable": "Table BigQuery enregistrée et dépenses chargées",
  "toast.invalidTableRef": "Référence de table non valide",
  "toast.languageUpdated": "Langue d'affichage mise à jour",
  "toast.cacheTtlSet": "Cache TTL défini sur {hours} h",
  "toast.savedSettings": "Paramètres Companion enregistrés",
  "toast.invalidSettings": "Saisie de paramètres non valide",
  "toast.demoOn": "Mode démo ACTIVÉ",
  "toast.demoOff": "Mode démo DÉSACTIVÉ (gcloud réel)",

  // Plugin Updater
  "update.headerBadgeAvailable": "⬆ v{version}",
  "update.headerBadgeTitle": "Mise à jour v{version} disponible — cliquer pour mettre à jour",
  "update.headerUpdatedBadge": "✓ v{version}",
  "update.headerUpdatedTitle":
    "Mis à jour vers v{version} — rechargez Antigravity pour redémarrer le sidecar",
  "update.sectionTitle": "Version et mises à jour du plugin",
  "update.currentVersionLabel": "Actuelle v{version}",
  "update.statusUpToDate": "À jour",
  "update.statusAvailable": "v{version} disponible sur GitHub",
  "update.statusUpdatedRestart": "Mis à jour vers v{version} (recharger pour appliquer)",
  "update.autoUpdateToggle": "Installer automatiquement les mises à jour depuis GitHub",
  "update.checkBtn": "↻ Vérifier les mises à jour",
  "update.checkingBtn": "Vérification sur GitHub…",
  "update.installBtn": "⬆ Mettre à jour vers v{version}",
  "update.installingBtn": "Mise à jour en cours…",
  "toast.upToDate": "GCP Companion est à jour (v{version})",
  "toast.updateAvailable": "Nouvelle version v{version} disponible !",
  "toast.updateInstalled":
    "GCP Companion mis à jour vers v{version} ! Rechargez Antigravity pour terminer.",
  "toast.updateFailed": "Échec de la mise à jour du plugin",
};


// --- i18n/ja.js ---
const JA_MESSAGES                     = {
  // Locale switcher
  "locale.autoShort": "🌐 自動",
  "locale.autoFull": "自動（システム／ブラウザ設定）",
  "header.languageAria": "表示言語",
  "header.languageTitle": "表示言語を切り替え",

  // Boot & Fatal Error
  "boot.connecting": "Google Cloud Companion に接続しています…",
  "boot.errorTitle": "GCP Companion を読み込めませんでした",
  "boot.unknownError": "不明な接続エラーが発生しました。",
  "boot.retry": "再試行",
  "loading.projects": "プロジェクトを読み込み中…",
  "loading.billing": "請求先アカウントを読み込み中…",
  "loading.budgets": "予算ルールを読み込み中…",
  "loading.spend": "BigQuery 支出データを集計中…",
  "loading.billingStatus": "課金状態を確認中…",
  "loading.sectionErrorRetry": "↻ 再試行",

  // Relative sync age
  "age.notSynced": "未同期",
  "age.offlineCacheSuffix": "（オフラインキャッシュ）",
  "age.justNow": "たった今{suffix}",
  "age.secondsAgo": "{n}秒前{suffix}",
  "age.minutesAgo": "{n}分前{suffix}",
  "age.hoursMinutesAgo": "{h}時間{m}分前{suffix}",

  // Common controls
  "common.copy": "コピー",
  "common.checking": "確認中…",

  // Header
  "header.demoBadge": "デモ ×",
  "header.demoExitTitle": "クリックしてデモモードを終了し、実際の gcloud データに戻ります",
  "header.refreshTitle": "Google Cloud と BigQuery から強制更新",
  "header.syncing": "同期中…",
  "header.refresh": "↻ 更新",
  "header.settingsBtn": "⚙ 設定",
  "header.settingsTitle": "設定と言語メニューを開く",
  "header.account": "アカウント",
  "header.accountAria": "有効な Google Cloud アカウント",
  "header.showEmailTitle": "メールアドレス全体を表示",
  "header.maskEmailTitle": "メールアドレスをマスク（個人情報保護）",
  "header.showEmailAria": "メールアドレス全体を表示",
  "header.maskEmailAria": "メールアドレスをマスク",
  "header.activeProject": "現在のプロジェクト",
  "header.copyProjectTitle": "クリックして現在の gcloud プロジェクト ID をコピー",
  "header.unset": "(未設定)",

  // Navigation Tabs
  "tabs.ariaLabel": "GCP Companion セクション",
  "tabs.overview": "概要",
  "tabs.projects": "プロジェクト",
  "tabs.billing": "請求",

  // Onboarding — Step 1 (Install gcloud CLI)
  "onboard.step1Badge": "ステップ 1 / 2 · CLI が必要",
  "onboard.step1Title": "Google Cloud CLI (gcloud) のインストール",
  "onboard.step1Desc":
    "お使いのコンピュータで Google Cloud CLI (`gcloud`) が検出されませんでした。先にインストールしてからログインすると、GCP プロジェクトと請求先アカウントを確認できます。",
  "onboard.step1Check1Title": "Google Cloud CLI (`gcloud`) をインストール",
  "onboard.step1Check1Desc":
    "PATH または標準 SDK フォルダに見つかりません。公式インストーラまたは Homebrew でインストールしてください。",
  "onboard.step1Check2Title": "Google Cloud にログイン",
  "onboard.step1Check2Desc": "インストール後に `gcloud auth login` を実行します。",
  "onboard.downloadInstallBtn": "gcloud CLI をダウンロードしてインストール ↗",
  "onboard.homebrewLabel": "macOS クイックインストール (Homebrew)",
  "onboard.signInAfterInstallLabel": "ステップ 2 — インストール後にログイン",
  "onboard.recheckCliBtn": "↻ gcloud のインストールを再確認",
  "onboard.previewDemoBtn": "デモダッシュボードを表示",

  // Onboarding — Step 2 (Sign in with Google Account)
  "onboard.step2Badge": "ステップ 2 / 2 · ログインが必要",
  "onboard.step2Title": "Google Cloud アカウントにログイン",
  "onboard.step2Desc":
    "Google Cloud CLI (`gcloud`) はインストール済みですが、認証済みの Google アカウントがありません。ログインしてプロジェクトと請求情報を表示してください。",
  "onboard.cliDetectedTitle": "Google Cloud CLI 検出済み",
  "onboard.authAccountTitle": "Google アカウントで認証",
  "onboard.authAccountDesc":
    "下のボタンをクリックしてブラウザで Google ログインを開くか、ターミナルで `gcloud auth login` を実行してください。",
  "onboard.waitingBrowserBtn": "ブラウザでのログインを待機中…",
  "onboard.signInBrowserBtn": "🔑 ブラウザでログイン (gcloud auth login)",
  "onboard.orRunInTerminal": "またはターミナルで実行",
  "onboard.signedInRefreshBtn": "↻ ログイン完了 — 更新",

  // Known backend setup hints
  "hint.installCli": "Google Cloud SDK (`gcloud`) をインストールし、`gcloud auth login` を実行してください。",
  "hint.runAuthLogin": "ターミナルで `gcloud auth login` を実行してから「更新」をクリックしてください。",
  "hint.sessionExpired":
    "Google Cloud セッションの有効期限が切れたか取り消されました。`gcloud auth login` で再ログインしてください。",
  "hint.demoActive":
    "デモプレビューモードが有効です。実際の gcloud データを使用するには「請求」→「設定」でデモモードをオフにしてください。",

  // Enable Cloud Billing API prompt
  "billingApi.badge": "要対応",
  "billingApi.title": "Cloud Billing API を有効化",
  "billingApi.desc":
    "Cloud 請求先アカウントとプロジェクトの課金ステータスを表示するには、割り当てプロジェクトで無料の Cloud Billing API (cloudbilling.googleapis.com) を有効にする必要があります。",
  "billingApi.quotaProjectLabel": "API を有効化する割り当てプロジェクト",
  "billingApi.enablingBtn": "Cloud Billing API を有効化中 (~10秒)…",
  "billingApi.enableBtn": "⚡ {project} で Cloud Billing API を有効化",
  "billingApi.openConsoleProject": "GCP コンソールを開く ({project}) ↗",
  "billingApi.openConsole": "GCP コンソールを開く ↗",

  // Spend & Charts
  "spend.noBaseline": "前月同日の比較データなし",
  "spend.vsPrevMtd": "前月同日比 {delta}%",
  "spend.gross": "割引前: {amount}",
  "spend.credits": "クレジット: {amount}",
  "spend.lastMonthTotal": "前月合計: {amount}",
  "spend.monthTotalLabel": "{month} 合計: {amount}",
  "spend.settledBadge": "✓ アーカイブ済み · BQ 再スキャン不要",
  "spend.backfillingBadge": "⏳ バックフィル同期中 ({days}日)",
  "spend.projectedNet": "月末予測純支出: {amount}",
  "spend.projectedGross": "予測割引前金額: {amount}",
  "spend.forecastBasis": "完了日 {days}/{total} 日基準（{date} まで）",
  "spend.forecastExcludedToday": "本日の未確定分を除外",
  "spend.forecastCreditsCaution": "現行ペースによる推計（クレジット上限超過や月末調整は未反映）",
  "spend.forecastNegativeCaution": "マイナス調整を検出したため線形予測を停止しました",
  "spend.priorMonthRunRateRef":
    "前月 ({month}・{days}日分) 日次平均参考: 純支出 {net}/日（割引前 {gross}/日）· 当月データが2日以上揃うと予測が有効になります",
  "spend.lastMonthShort": "前月: {amount}",
  "chart.noDailyUsage": "今月の日別利用データはまだありません",
  "chart.dailyTrendAria": "日別純支出トレンド（{days}日間）",
  "chart.dailyGrossTrendAria": "日別割引前利用トレンド（{days}日間・クレジット相殺済み）",
  "chart.dailyTrendWithForecastAria": "日別純支出トレンド（{days}日間）と月末線形予測",
  "chart.dailyGrossTrendWithForecastAria": "日別割引前利用トレンド（{days}日間）と月末線形予測",
  "chart.forecastCaption": "破線: {rate}/日ペース → {monthEnd}",
  "chart.peakPerDay": "最大 {amount}/日",
  "chart.peakGrossPerDay": "割引前最大 {amount}/日",
  "chart.noBillableServices": "今月記録された課金対象サービスの利用はありません。",
  "chart.grossCreditsHint": "割引前 {gross}、クレジット {credits}",
  "chart.grossShort": "割引前 {amount}",

  // Overview Tab
  "overview.cliRecommendedBadge": "CLI 推奨",
  "overview.cliNotFoundTitle": "Google Cloud CLI (`gcloud`) が見つかりません",
  "overview.cliNotFoundDesc":
    "保存済みのアプリケーションのデフォルト認証情報 (ADC) で接続していますが、`gcloud` CLI が見つかりません。アカウント切り替えや CLI プロジェクト同期を使うには `gcloud` をインストールしてください。",
  "overview.installCliBtn": "gcloud CLI をインストール ↗",
  "overview.mtdNetSpend": "今月の純支出（月初来・{month}）",
  "overview.monthlyNetSpend": "月次純支出 ({month})",
  "overview.monthSelectorAria": "請求対象月を選択",
  "overview.monthNoRowsYet":
    "{month} のエクスポート済み請求データはまだありません（GCP のエクスポートやバックフィルが同期中の可能性があります）。",
  "overview.spendBreakdownTitle": "今月の支出内訳",
  "overview.spendBreakdownTitleForMonth": "支出内訳 ({month})",
  "overview.byProject": "プロジェクト別",
  "overview.byAccount": "請求先別",
  "overview.byService": "サービス別",
  "overview.topService": "最大: {service}",
  "overview.noProjectCosts": "今月のプロジェクト別コストはまだ記録されていません。",
  "overview.noBqRows": "BQ データなし",
  "overview.kpiActiveProjects": "有効なプロジェクト",
  "overview.kpiBillingApiOff": "Billing API 無効",
  "overview.kpiOpenBillingAccts": "有効な請求先アカウント",
  "overview.kpiEnableApiBelow": "下で API を有効化",
  "overview.kpiUnbilledSandbox": "課金未設定 / サンドボックス",
  "overview.bqWaitingTitle": "BigQuery 接続済み — 利用データ待機中",
  "overview.unlockSpendTitle": "月初来の支出トラッキングを有効化",
  "overview.bqWaitingDesc":
    "{tables} をクエリしましたが、現在 {currentMonth} / {prevMonth} の行がありません。",
  "overview.unlockSpendDesc":
    "GCP REST API でプロジェクト・請求先アカウント・予算ルールを即座に一覧表示できます。BigQuery 課金データエクスポートのテーブルを連携すると、正確な純支出、クレジット、サービス別内訳を表示できます。",
  "overview.manageExportBtn": "エクスポートテーブルを管理 →",
  "overview.connectBqBtn": "BigQuery エクスポートを連携 →",
  "overview.previewSampleBtn": "サンプル支出をプレビュー",
  "overview.pinnedAndActiveTitle": "ピン留め・現在のプロジェクト",
  "overview.viewAllProjects": "すべて表示 ({count}) →",
  "overview.pinEmptyHint":
    "「プロジェクト」タブでよく使うプロジェクトに ★ を付けると、ここに固定してワンクリックで切り替えられます。",
  "overview.diagnosticsTitle": "診断情報と注意事項",
  "warnings.openIamConsole": "GCP コンソールで IAM 権限を開く ↗",
  "warnings.enableApiConsole": "GCP コンソールで API を有効化 ↗",

  // Projects Tab & Cards
  "projects.filterFocus": "現在・ピン留め ★ ({count})",
  "projects.filterAll": "すべて ({count})",
  "projects.filterPinned": "ピン留め ★ ({count})",
  "projects.filterUnbilled": "課金なし ({count})",
  "projects.searchPlaceholder": "プロジェクト名、ID、番号、ラベルを検索…",
  "projects.searchAria": "GCP プロジェクトを検索",
  "projects.sortAria": "プロジェクトの並び替え",
  "projects.sortSmart": "並び順: スマート",
  "projects.sortSpend": "並び順: 支出順 ↓",
  "projects.sortName": "並び順: 名前 A–Z",
  "projects.emptyFilter": "現在のフィルタに一致する GCP プロジェクトはありません。",
  "projects.focusEmptyPrompt":
    "上の検索ボックスに入力して全 {total} 件のプロジェクトから検索するか、一覧を表示してください。",
  "projects.hiddenCompactHint":
    "{total} 件中 {shown} 件を表示中 — 上の検索欄から全件検索、または",
  "projects.browseAllBtn": "プロジェクト一覧を表示 ({total}) ▾",
  "projects.showMoreBtn": "さらに表示（残り {remaining} 件）▾",
  "projects.collapseListBtn": "リストを折りたたむ ▴",
  "project.activeBadge": "選択中",
  "project.unbilledTag": "課金なし",
  "project.noBillingTag": "課金未設定",
  "project.setActiveBtn": "選択",
  "project.setActiveCmdTitle": "gcloud config set project {project} を実行",
  "project.openConsoleTitle": "Google Cloud コンソールで開く",
  "project.unpinTitle": "ピン留めを解除",
  "project.pinTitle": "概要タブにピン留め",
  "project.unpinAria": "{project} のピン留めを解除",
  "project.pinAria": "{project} をピン留め",
  "project.copyIdTitle": "プロジェクト ID をコピー",
  "project.hideBtn": "閉じる ▴",
  "project.detailsBtn": "詳細 ▾",
  "project.projectNumber": "プロジェクト番号 # {number}",
  "project.billingId": "請求先 ID: {id}",
  "project.billingAccountLabel": "請求先アカウント",
  "project.changeBillingBtn": "変更",
  "project.linkBillingBtn": "請求先をリンク",
  "project.cancelBtn": "キャンセル",
  "project.billingSelectAria": "変更先の請求先アカウントを選択",
  "project.billingSelectPlaceholder": "有効な請求先アカウントを選択…",
  "project.billingCurrentSuffix": "（現在）",
  "project.billingManualOption": "請求先アカウント ID を手動入力…",
  "project.billingManualPlaceholder": "01ABCD-234567-89EFGH",
  "project.billingManualAria": "請求先アカウント ID（手動入力）",
  "project.billingManualFormatHint": "形式: XXXXXX-XXXXXX-XXXXXX（リンク解除は非対応）",
  "project.billingAlreadyLinked": "このプロジェクトは既にその請求先アカウントにリンクされています。",
  "project.billingClosedNotAllowed": "閉鎖された請求先アカウントはプロジェクトにリンクできません。",
  "project.billingConfirmTitle": "請求先アカウントの変更を確認",
  "project.billingConfirmFrom": "変更前",
  "project.billingConfirmTo": "変更後",
  "project.billingConfirmNote":
    "新しい使用量は変更先のアカウントに請求されます。BigQuery の過去データは変更前のアカウントに残ります。",
  "project.billingConfirmSwitchBtn": "変更を確定",
  "project.billingConfirmLinkBtn": "リンクを確定",
  "project.billingSwitchingBtn": "変更中…",
  "project.billingOpenConsoleLink": "GCP コンソールで請求設定を開く ↗",
  "project.noBqCostThisMonth": "今月このプロジェクトの BigQuery コスト明細は記録されていません。",
  "project.connectBqForCosts":
    "サービス別のコストを表示するには、「請求」タブで BigQuery 課金データエクスポートを連携してください。",
  "project.linkDashboard": "ダッシュボード ↗",
  "project.linkBillingReport": "課金レポート ↗",
  "project.linkCloudRun": "Cloud Run ↗",
  "project.linkBigQuery": "BigQuery ↗",
  "project.linkLogs": "ログ ↗",
  "project.dangerZoneLabel": "危険な操作",
  "project.deleteBtn": "プロジェクトを削除",
  "project.deleteConfirmTitle": "プロジェクトのシャットダウンと削除",
  "project.deleteConfirmDesc":
    "{project} を削除すると、すべてのサービスと課金が直ちに停止されます。完全削除まで Google Cloud コンソールで 30 日間の復元猶予期間があります。",
  "project.deleteWarnActive":
    "これは現在アクティブな gcloud プロジェクトです。削除後は別のプロジェクトに切り替える必要があります。",
  "project.deleteWarnQuota":
    "このプロジェクトは Quota Project Override に設定されています。削除後に設定は自動クリアされます。",
  "project.deleteWarnBqExport":
    "このプロジェクトには連携済みの BigQuery 請求エクスポートテーブルがあります。削除すると支出クエリが動作しなくなります。",
  "project.deleteTypePrompt": "削除を確認するには {project} と入力してください：",
  "project.deleteInputAria": "削除確認用のプロジェクト ID を入力",
  "project.deleteConfirmSubmitBtn": "シャットダウンして削除",
  "project.deleteDeletingBtn": "削除中…",
  "project.deleteOpenConsoleLink": "GCP コンソールでプロジェクト設定を開く ↗",
  "project.deletedBannerTitle": "プロジェクト {project} の削除を予約しました",
  "project.deletedBannerDesc":
    "30 日以内であれば、Google Cloud コンソールの「削除保留中のリソース」から復元できます。",
  "project.deletedBannerDemoDesc":
    "デモモードのシミュレーションです（実際の GCP プロジェクトには影響しません）。デモモードの切替または再起動で復元されます。",
  "project.deletedBannerConsoleLink": "削除保留中ページを開く ↗",
  "project.dismissBannerAria": "通知を閉じる",

  // Billing Tab & Account Cards
  "billing.statusOpen": "有効",
  "billing.statusClosed": "閉鎖",
  "billing.activeUpperBadge": "選択中",
  "billing.projectCountOne": "1 件のプロジェクト",
  "billing.projectCountMany": "{count} 件のプロジェクト",
  "billing.copyIdTitle": "請求先アカウント ID をコピー",
  "billing.consoleReportBtn": "課金レポート ↗",
  "billing.noLinkedProjects": "この請求先アカウントにリンクされた有効なプロジェクトはありません。",
  "billing.setActiveTitle": "{project} を現在の gcloud プロジェクトに設定",
  "billing.openProjectConsoleTitle": "{project} を Google Cloud コンソールで開く",
  "billing.linkedProjectsHeader": "リンクされたプロジェクト ({count})",
  "billing.filterInProjectsBtn": "プロジェクトタブで絞り込む →",
  "billing.showAllLinkedBtn": "リンクされた全 {count} 件を表示 ▾",
  "billing.mtdNetLabel": "今月の純支出（月初来）",
  "billing.boundNoRows": "{table} に連携済み（今月のデータはまだありません）。",
  "billing.linkExportHint":
    "この請求先アカウントの支出を表示するには、下の BigQuery 課金データエクスポートを連携してください。",
  "billing.configuredBudgets": "設定済みの予算 ({count})",
  "billing.budgetLastPeriod": "前期間の 100%",
  "billing.budgetCustomTarget": "カスタム目標",
  "billing.budgetNoThresholds": "しきい値ルールなし",
  "billing.diagnosticsTitle": "Billing API 診断情報",
  "billing.noAccountsVisible":
    "現在の Google アカウントで表示できる Cloud 請求先アカウントがありません（`billing.accounts.get` または `billing.accounts.list` 権限が必要です）。",

  // BigQuery Export Connection Wizard
  "export.title": "BigQuery 課金データエクスポート連携",
  "export.desc":
    "クエリ結果はローカルにキャッシュされ（既定 TTL 6時間）、`_PARTITIONTIME` で厳密に絞り込まれるため当月・前月パーティションのみスキャンします。",
  "export.sharedMapping": "共通エクスポート (*)",
  "export.accountMapping": "請求先アカウント {id}",
  "export.unlinkBtn": "連携解除",
  "export.autoDetectLabel": "プロジェクト内のエクスポートテーブルを自動検出",
  "export.hostProjectPlaceholder": "ホストプロジェクト ID を選択または入力…",
  "export.hostProjectAria": "課金エクスポートのホストプロジェクト ID",
  "export.scanningBtn": "スキャン中…",
  "export.scanDatasetsBtn": "データセットをスキャン",
  "export.matchesBillingId": "一致する請求先 ID: {id}",
  "export.sharedCustomExport": "共通 / カスタムエクスポート",
  "export.linkAndQueryBtn": "連携してクエリ",
  "export.manualBindLabel": "またはテーブル ID を手動指定",
  "export.targetAccountAria": "対象の請求先アカウント",
  "export.allAccountsOption": "すべての請求先アカウント (* 共通エクスポート)",
  "export.saveBtn": "保存",
  "export.helpSummary": "GCP で BigQuery 課金データエクスポートを有効にするには？",
  "export.helpStep1": "Google Cloud コンソール →「お支払い」→「課金データのエクスポート」を開きます。",
  "export.helpStep2": "課金レコードを保存するプロジェクトと BigQuery データセットを選択します。",
  "export.helpStep3": "「標準の使用料金」エクスポートを有効にします（推奨・軽量）。",
  "export.helpStep4": "ここに戻り、そのプロジェクトで「データセットをスキャン」をクリックします。",
  "export.openBillingConsole": "GCP 課金コンソールを開く ↗",

  // Preferences & Settings
  "settings.menuTitle": "設定",
  "settings.closeBtnAria": "設定メニューを閉じる",
  "settings.summary": "Companion 設定とキャッシュ管理",
  "settings.languageLabel": "表示言語",
  "settings.privacySection": "プライバシーとプレビュー",
  "settings.maskEmailToggle": "アカウントのメールアドレスをマスク",
  "settings.advancedSummary": "CLI・割り当てプロジェクトの詳細設定",
  "settings.cacheTtlLabel": "ローカルキャッシュ有効期間（BigQuery の重複スキャンを防止）",
  "settings.hoursRecommended": "6時間（推奨）",
  "settings.hourOne": "1時間",
  "settings.hoursMany": "{hours}時間",
  "settings.quotaProjectLabel": "割り当てプロジェクトの上書き (x-goog-user-project)",
  "settings.quotaProjectPlaceholder": "既定では現在の gcloud プロジェクトを使用",
  "settings.gcloudPathLabel": "カスタム gcloud バイナリパス（任意）",
  "settings.applyBtn": "設定を適用",
  "settings.switchToLiveBtn": "実際の gcloud データに切り替え",
  "settings.enableDemoBtn": "デモプレビューモードを有効化",

  // Toast Notifications
  "toast.refreshed": "Google Cloud データを更新しました",
  "toast.loadFailed": "データの読み込みに失敗しました",
  "toast.enablingBillingApi": "{project} で Cloud Billing API を有効化しています…",
  "toast.enabledBillingApi": "Cloud Billing API を有効化しました！請求先アカウントを更新しました。",
  "toast.enableBillingApiFailed": "Cloud Billing API の有効化に失敗しました",
  "toast.switchedAccount": "gcloud アカウントを切り替えました",
  "toast.switchAccountFailed": "アカウントの切り替えに失敗しました",
  "toast.prefUpdateFailed": "設定の更新に失敗しました",
  "toast.copied": "{value} をコピーしました",
  "toast.exitedDemo": "デモモードを終了しました",
  "toast.demoEnabled": "デモプレビューモードを有効にしました",
  "toast.openingBrowserSignIn": "ブラウザで Google ログインを開いています…",
  "toast.signedInSuccess": "Google Cloud にログインしました！",
  "toast.signInIncomplete": "ブラウザでのログインが完了しませんでした",
  "toast.showingSampleSpend": "サンプル支出データを表示しています",
  "toast.activeProjectSet": "現在のプロジェクトを {project} に設定しました",
  "toast.switchedProject": "現在のプロジェクトを {project} に切り替えました",
  "toast.switchProjectFailed": "プロジェクトの切り替えに失敗しました",
  "toast.switchedBillingAccount": "{project} を {account} にリンクしました",
  "toast.switchBillingFailed": "請求先アカウントの変更に失敗しました",
  "toast.deletedProject": "プロジェクト {project} の削除を予約しました",
  "toast.deletedProjectDemo": "デモモード：{project} の削除をシミュレートしました",
  "toast.deleteProjectFailed": "プロジェクトの削除に失敗しました",
  "toast.pinUpdateFailed": "ピン留めの更新に失敗しました",
  "toast.removedExportMapping": "エクスポートテーブル連携を解除しました",
  "toast.removeExportFailed": "連携の解除に失敗しました",
  "toast.enterHostProject": "先にホストプロジェクト ID を選択または入力してください",
  "toast.noExportTablesFound": "{project} に gcp_billing_export_* テーブルが見つかりませんでした",
  "toast.foundExportTables": "{count} 件の課金エクスポートテーブルが見つかりました",
  "toast.discoveryFailed": "テーブルの検出に失敗しました",
  "toast.connectedExport": "BigQuery 課金データエクスポートを連携しました！",
  "toast.connectExportFailed": "テーブルの連携に失敗しました",
  "toast.enterTableId": "先に project.dataset.table を入力してください",
  "toast.savedExportTable": "BigQuery エクスポートテーブルを保存し、支出を読み込みました",
  "toast.invalidTableRef": "無効なテーブル参照です",
  "toast.languageUpdated": "表示言語を変更しました",
  "toast.cacheTtlSet": "キャッシュ TTL を {hours} 時間に設定しました",
  "toast.savedSettings": "Companion 設定を保存しました",
  "toast.invalidSettings": "設定の入力内容が無効です",
  "toast.demoOn": "デモモード ON",
  "toast.demoOff": "デモモード OFF（実際の gcloud）",

  // Plugin Updater
  "update.headerBadgeAvailable": "⬆ v{version}",
  "update.headerBadgeTitle": "アップデート v{version} が利用可能です — クリックして更新",
  "update.headerUpdatedBadge": "✓ v{version}",
  "update.headerUpdatedTitle":
    "v{version} に更新済み — Antigravity を再読み込みすると反映されます",
  "update.sectionTitle": "プラグインのバージョンと自動更新",
  "update.currentVersionLabel": "現在 v{version}",
  "update.statusUpToDate": "最新です",
  "update.statusAvailable": "GitHub に新バージョン v{version} があります",
  "update.statusUpdatedRestart": "v{version} に更新済み（再読み込みで反映）",
  "update.autoUpdateToggle": "GitHub からプラグインを自動的に更新する",
  "update.checkBtn": "↻ アップデートを確認",
  "update.checkingBtn": "GitHub を確認中…",
  "update.installBtn": "⬆ v{version} に今すぐ更新",
  "update.installingBtn": "プラグインを更新中…",
  "toast.upToDate": "GCP Companion は最新バージョンです (v{version})",
  "toast.updateAvailable": "新しいバージョン v{version} が利用可能です！",
  "toast.updateInstalled":
    "GCP Companion を v{version} に更新しました！Antigravity を再読み込みしてください。",
  "toast.updateFailed": "プラグインの更新に失敗しました",
};


// --- i18n/ko.js ---
const KO_MESSAGES                     = {
  // Locale switcher
  "locale.autoShort": "🌐 자동",
  "locale.autoFull": "자동 (시스템 / 브라우저 기본값)",
  "header.languageAria": "표시 언어",
  "header.languageTitle": "표시 언어 변경",

  // Boot & Fatal Error
  "boot.connecting": "Google Cloud Companion에 연결하는 중…",
  "boot.errorTitle": "GCP Companion을 불러올 수 없습니다",
  "boot.unknownError": "알 수 없는 연결 오류가 발생했습니다.",
  "boot.retry": "다시 시도",
  "loading.projects": "프로젝트 불러오는 중…",
  "loading.billing": "결제 계정 불러오는 중…",
  "loading.budgets": "예산 규칙 불러오는 중…",
  "loading.spend": "BigQuery 지출 조회 중…",
  "loading.billingStatus": "결제 상태 확인 중…",
  "loading.sectionErrorRetry": "↻ 다시 시도",

  // Relative sync age
  "age.notSynced": "동기화 안 됨",
  "age.offlineCacheSuffix": " (오프라인 캐시)",
  "age.justNow": "방금 전{suffix}",
  "age.secondsAgo": "{n}초 전{suffix}",
  "age.minutesAgo": "{n}분 전{suffix}",
  "age.hoursMinutesAgo": "{h}시간 {m}분 전{suffix}",

  // Common controls
  "common.copy": "복사",
  "common.checking": "확인 중…",

  // Header
  "header.demoBadge": "데모 ×",
  "header.demoExitTitle": "클릭하여 데모 모드를 종료하고 실제 gcloud 데이터로 돌아갑니다",
  "header.refreshTitle": "Google Cloud 및 BigQuery에서 강제 새로고침",
  "header.syncing": "동기화 중…",
  "header.refresh": "↻ 새로고침",
  "header.settingsBtn": "⚙ 설정",
  "header.settingsTitle": "설정 및 언어 메뉴 열기",
  "header.account": "계정",
  "header.accountAria": "활성 Google Cloud 계정",
  "header.showEmailTitle": "전체 이메일 표시",
  "header.maskEmailTitle": "이메일 마스킹 (개인정보 보호)",
  "header.showEmailAria": "전체 이메일 표시",
  "header.maskEmailAria": "이메일 마스킹",
  "header.activeProject": "활성 프로젝트",
  "header.copyProjectTitle": "클릭하여 활성 gcloud 프로젝트 ID 복사",
  "header.unset": "(미설정)",

  // Navigation Tabs
  "tabs.ariaLabel": "GCP Companion 섹션",
  "tabs.overview": "개요",
  "tabs.projects": "프로젝트",
  "tabs.billing": "결제",

  // Onboarding — Step 1 (Install gcloud CLI)
  "onboard.step1Badge": "1 / 2단계 · CLI 필요",
  "onboard.step1Title": "Google Cloud CLI (gcloud) 설치",
  "onboard.step1Desc":
    "컴퓨터에서 Google Cloud CLI(`gcloud`)가 감지되지 않았습니다. 먼저 설치한 후 로그인하여 GCP 프로젝트와 결제 계정을 확인하세요.",
  "onboard.step1Check1Title": "Google Cloud CLI (`gcloud`) 설치",
  "onboard.step1Check1Desc":
    "PATH 또는 기본 SDK 경로에서 찾을 수 없습니다. 공식 설치 프로그램이나 Homebrew로 설치하세요.",
  "onboard.step1Check2Title": "Google Cloud 로그인",
  "onboard.step1Check2Desc": "설치 후 `gcloud auth login`을 실행하세요.",
  "onboard.downloadInstallBtn": "gcloud CLI 다운로드 및 설치 ↗",
  "onboard.homebrewLabel": "macOS 빠른 설치 (Homebrew)",
  "onboard.signInAfterInstallLabel": "2단계 — 설치 후 로그인",
  "onboard.recheckCliBtn": "↻ gcloud 설치 다시 확인",
  "onboard.previewDemoBtn": "데모 대시보드 미리보기",

  // Onboarding — Step 2 (Sign in with Google Account)
  "onboard.step2Badge": "2 / 2단계 · 로그인 필요",
  "onboard.step2Title": "Google Cloud 계정에 로그인",
  "onboard.step2Desc":
    "Google Cloud CLI(`gcloud`)가 설치되어 있지만 인증된 활성 Google 계정이 없습니다. 프로젝트와 결제 정보를 보려면 로그인하세요.",
  "onboard.cliDetectedTitle": "Google Cloud CLI 감지됨",
  "onboard.authAccountTitle": "Google 계정 인증",
  "onboard.authAccountDesc":
    "아래 버튼을 눌러 브라우저에서 Google 로그인을 실행하거나 터미널에서 `gcloud auth login`을 실행하세요.",
  "onboard.waitingBrowserBtn": "브라우저 로그인 대기 중…",
  "onboard.signInBrowserBtn": "🔑 브라우저로 로그인 (gcloud auth login)",
  "onboard.orRunInTerminal": "또는 터미널에서 실행",
  "onboard.signedInRefreshBtn": "↻ 로그인 완료 — 새로고침",

  // Known backend setup hints
  "hint.installCli": "Google Cloud SDK(`gcloud`)를 설치하고 `gcloud auth login`을 실행하세요.",
  "hint.runAuthLogin": "터미널에서 `gcloud auth login`을 실행한 후 새로고침을 클릭하세요.",
  "hint.sessionExpired":
    "Google Cloud 세션이 만료되었거나 취소되었습니다. `gcloud auth login`으로 다시 로그인해 주세요.",
  "hint.demoActive":
    "데모 미리보기 모드가 활성화되어 있습니다. 실제 gcloud 데이터를 사용하려면 결제 -> 설정에서 데모 모드를 끄세요.",

  // Enable Cloud Billing API prompt
  "billingApi.badge": "조치 필요",
  "billingApi.title": "Cloud Billing API 사용 설정",
  "billingApi.desc":
    "Cloud 결제 계정과 프로젝트 결제 상태를 표시하려면 할당량 프로젝트에서 무료 Cloud Billing API(cloudbilling.googleapis.com)를 사용 설정해야 합니다.",
  "billingApi.quotaProjectLabel": "API를 사용 설정할 할당량 프로젝트",
  "billingApi.enablingBtn": "Cloud Billing API 사용 설정 중 (~10초)…",
  "billingApi.enableBtn": "⚡ {project}에서 Cloud Billing API 사용 설정",
  "billingApi.openConsoleProject": "GCP 콘솔 열기 ({project}) ↗",
  "billingApi.openConsole": "GCP 콘솔 열기 ↗",

  // Spend & Charts
  "spend.noBaseline": "전월 동일 기간 기준 없음",
  "spend.vsPrevMtd": "전월 동기 대비 {delta}%",
  "spend.gross": "총비용: {amount}",
  "spend.credits": "크레딧: {amount}",
  "spend.lastMonthTotal": "전월 합계: {amount}",
  "spend.monthTotalLabel": "{month} 합계: {amount}",
  "spend.settledBadge": "✓ 보관됨 · BQ 재스캔 생략",
  "spend.backfillingBadge": "⏳ 백필 동기화 중 ({days}일)",
  "spend.projectedNet": "월말 예상 순지출: {amount}",
  "spend.projectedGross": "예상 총비용: {amount}",
  "spend.forecastBasis": "완료된 {days}/{total}일 기준 ({date}까지)",
  "spend.forecastExcludedToday": "금일 부분 집계 제외",
  "spend.forecastCreditsCaution": "선형 추세 추정치 (크레딧 소진 및 월말 조정 미반영)",
  "spend.forecastNegativeCaution": "음수 조정이 감지되어 순지출 예측을 중지했습니다",
  "spend.priorMonthRunRateRef":
    "전월 ({month}, {days}일 내보내기) 일평균 참고: 순지출 {net}/일 (총비용 {gross}/일) · 당월 2일 이상 수집 후 월말 예측 자동 활성화",
  "spend.lastMonthShort": "전월: {amount}",
  "chart.noDailyUsage": "이번 달 일별 사용량 데이터가 아직 없습니다",
  "chart.dailyTrendAria": "일별 순지출 추이 ({days}일)",
  "chart.dailyGrossTrendAria": "일별 총사용량 추이 ({days}일, 크레딧으로 상쇄됨)",
  "chart.dailyTrendWithForecastAria": "일별 순지출 추이 ({days}일) 및 월말 선형 예측",
  "chart.dailyGrossTrendWithForecastAria": "일별 총사용량 추이 ({days}일) 및 월말 선형 예측",
  "chart.forecastCaption": "점선: 일평균 {rate}/일 → {monthEnd}",
  "chart.peakPerDay": "최고 {amount}/일",
  "chart.peakGrossPerDay": "총비용 최고 {amount}/일",
  "chart.noBillableServices": "이번 달 기록된 청구 대상 서비스 사용량이 없습니다.",
  "chart.grossCreditsHint": "총비용 {gross}, 크레딧 {credits}",
  "chart.grossShort": "총비용 {amount}",

  // Overview Tab
  "overview.cliRecommendedBadge": "CLI 권장",
  "overview.cliNotFoundTitle": "Google Cloud CLI (`gcloud`)를 찾을 수 없음",
  "overview.cliNotFoundDesc":
    "저장된 애플리케이션 기본 사용자 인증 정보(ADC)로 연결되었으나 컴퓨터에서 `gcloud` CLI를 찾을 수 없습니다. 계정 전환 및 CLI 프로젝트 동기화를 사용하려면 `gcloud`를 설치하세요.",
  "overview.installCliBtn": "gcloud CLI 설치 ↗",
  "overview.mtdNetSpend": "이번 달 누적 순지출 ({month})",
  "overview.monthlyNetSpend": "월별 순지출 ({month})",
  "overview.monthSelectorAria": "청구 월 선택",
  "overview.monthNoRowsYet":
    "{month}에 내보낸 결제 데이터가 아직 없습니다 (GCP 내보내기 또는 백필 동기화가 진행 중일 수 있습니다).",
  "overview.spendBreakdownTitle": "이번 달 지출 내역",
  "overview.spendBreakdownTitleForMonth": "지출 내역 ({month})",
  "overview.byProject": "프로젝트별",
  "overview.byAccount": "결제 계정별",
  "overview.byService": "서비스별",
  "overview.topService": "최다: {service}",
  "overview.noProjectCosts": "이번 달 기록된 프로젝트별 비용이 없습니다.",
  "overview.noBqRows": "BQ 데이터 없음",
  "overview.kpiActiveProjects": "활성 프로젝트",
  "overview.kpiBillingApiOff": "Billing API 꺼짐",
  "overview.kpiOpenBillingAccts": "활성 결제 계정",
  "overview.kpiEnableApiBelow": "아래에서 API 활성화",
  "overview.kpiUnbilledSandbox": "결제 미연결 / 샌드박스",
  "overview.bqWaitingTitle": "BigQuery 연결됨 — 사용량 데이터 대기 중",
  "overview.unlockSpendTitle": "이번 달 누적 지출 추적 활성화",
  "overview.bqWaitingDesc":
    "{tables} 테이블을 조회했으나 현재 {currentMonth} / {prevMonth} 데이터가 없습니다.",
  "overview.unlockSpendDesc":
    "GCP REST API는 프로젝트, 결제 계정, 예산 규칙을 즉시 불러옵니다. BigQuery 결제 데이터 내보내기 테이블을 연결하면 정확한 순지출, 크레딧 및 서비스별 비용 내역을 확인할 수 있습니다.",
  "overview.manageExportBtn": "내보내기 테이블 관리 →",
  "overview.connectBqBtn": "BigQuery 내보내기 연결 →",
  "overview.previewSampleBtn": "샘플 지출 미리보기",
  "overview.pinnedAndActiveTitle": "고정 및 활성 프로젝트",
  "overview.viewAllProjects": "전체 보기 ({count}) →",
  "overview.pinEmptyHint":
    "프로젝트 탭에서 자주 쓰는 프로젝트에 ★ 표시를 하면 여기에 고정되어 원클릭으로 전환할 수 있습니다.",
  "overview.diagnosticsTitle": "진단 및 참고사항",
  "warnings.openIamConsole": "GCP 콘솔에서 IAM 권한 열기 ↗",
  "warnings.enableApiConsole": "GCP 콘솔에서 API 사용 설정 ↗",

  // Projects Tab & Cards
  "projects.filterFocus": "활성 및 고정 ★ ({count})",
  "projects.filterAll": "전체 ({count})",
  "projects.filterPinned": "고정됨 ★ ({count})",
  "projects.filterUnbilled": "결제 미연결 ({count})",
  "projects.searchPlaceholder": "프로젝트 이름, ID, 번호, 라벨 검색…",
  "projects.searchAria": "GCP 프로젝트 검색",
  "projects.sortAria": "프로젝트 정렬",
  "projects.sortSmart": "정렬: 스마트",
  "projects.sortSpend": "정렬: 지출순 ↓",
  "projects.sortName": "정렬: 이름 A–Z",
  "projects.emptyFilter": "현재 필터와 일치하는 GCP 프로젝트가 없습니다.",
  "projects.focusEmptyPrompt":
    "위 검색창에 입력하여 {total}개 프로젝트를 검색하거나 목록을 펼쳐 보세요.",
  "projects.hiddenCompactHint":
    "전체 {total}개 중 {shown}개 표시 중 — 위 검색창에서 전체 검색 또는",
  "projects.browseAllBtn": "프로젝트 목록 보기 ({total}) ▾",
  "projects.showMoreBtn": "더보기 ({remaining}개 남음) ▾",
  "projects.collapseListBtn": "목록 접기 ▴",
  "project.activeBadge": "활성",
  "project.unbilledTag": "결제 미연결",
  "project.noBillingTag": "결제 없음",
  "project.setActiveBtn": "활성으로 설정",
  "project.setActiveCmdTitle": "gcloud config set project {project} 실행",
  "project.openConsoleTitle": "Google Cloud 콘솔에서 열기",
  "project.unpinTitle": "프로젝트 고정 해제",
  "project.pinTitle": "개요 탭에 프로젝트 고정",
  "project.unpinAria": "{project} 고정 해제",
  "project.pinAria": "{project} 고정",
  "project.copyIdTitle": "프로젝트 ID 복사",
  "project.hideBtn": "접기 ▴",
  "project.detailsBtn": "상세 ▾",
  "project.projectNumber": "프로젝트 번호 # {number}",
  "project.billingId": "결제 ID: {id}",
  "project.billingAccountLabel": "결제 계정",
  "project.changeBillingBtn": "변경",
  "project.linkBillingBtn": "결제 연결",
  "project.cancelBtn": "취소",
  "project.billingSelectAria": "대상 결제 계정 선택",
  "project.billingSelectPlaceholder": "사용 가능한 결제 계정 선택…",
  "project.billingCurrentSuffix": "(현재)",
  "project.billingManualOption": "결제 계정 ID 직접 입력…",
  "project.billingManualPlaceholder": "01ABCD-234567-89EFGH",
  "project.billingManualAria": "결제 계정 ID 직접 입력",
  "project.billingManualFormatHint": "형식: XXXXXX-XXXXXX-XXXXXX (연결 해제는 지원되지 않음)",
  "project.billingAlreadyLinked": "이 프로젝트는 이미 해당 결제 계정에 연결되어 있습니다.",
  "project.billingClosedNotAllowed": "종료된 결제 계정은 프로젝트에 연결할 수 없습니다.",
  "project.billingConfirmTitle": "결제 계정 변경 확인",
  "project.billingConfirmFrom": "이전",
  "project.billingConfirmTo": "변경 후",
  "project.billingConfirmNote":
    "새 사용량은 대상 계정에 청구됩니다. 기존 BigQuery 과거 지출 기록은 이전 계정에 유지됩니다.",
  "project.billingConfirmSwitchBtn": "변경 확인",
  "project.billingConfirmLinkBtn": "연결 확인",
  "project.billingSwitchingBtn": "변경 중…",
  "project.billingOpenConsoleLink": "GCP 콘솔에서 결제 설정 열기 ↗",
  "project.noBqCostThisMonth": "이번 달 이 프로젝트에 기록된 BigQuery 비용 내역이 없습니다.",
  "project.connectBqForCosts":
    "서비스별 비용을 확인하려면 결제 탭에서 BigQuery 결제 데이터 내보내기를 연결하세요.",
  "project.linkDashboard": "대시보드 ↗",
  "project.linkBillingReport": "결제 보고서 ↗",
  "project.linkCloudRun": "Cloud Run ↗",
  "project.linkBigQuery": "BigQuery ↗",
  "project.linkLogs": "로그 ↗",
  "project.dangerZoneLabel": "위험 작업",
  "project.deleteBtn": "프로젝트 삭제",
  "project.deleteConfirmTitle": "프로젝트 종료 및 삭제",
  "project.deleteConfirmDesc":
    "{project}을(를) 삭제하면 모든 서비스와 결제가 즉시 중지됩니다. 영구 삭제 전 Google Cloud 콘솔에서 30일 동안 복원할 수 있습니다.",
  "project.deleteWarnActive":
    "현재 활성 gcloud 프로젝트입니다. 삭제 후 다른 프로젝트로 전환해야 합니다.",
  "project.deleteWarnQuota":
    "이 프로젝트는 할당량 프로젝트 재정의(Quota Project Override)로 설정되어 있으며 삭제 후 자동으로 해제됩니다.",
  "project.deleteWarnBqExport":
    "이 프로젝트에는 연결된 BigQuery 결제 내보내기 테이블이 있습니다. 삭제 시 비용 조회가 중단됩니다.",
  "project.deleteTypePrompt": "삭제를 확인하려면 {project}을(를) 입력하세요:",
  "project.deleteInputAria": "삭제할 프로젝트 ID 확인 입력",
  "project.deleteConfirmSubmitBtn": "종료 및 삭제",
  "project.deleteDeletingBtn": "삭제 중…",
  "project.deleteOpenConsoleLink": "GCP 콘솔에서 프로젝트 설정 열기 ↗",
  "project.deletedBannerTitle": "프로젝트 {project} 삭제 예약됨",
  "project.deletedBannerDesc":
    "30일 이내에 Google Cloud 콘솔의 삭제 대기 중인 리소스에서 이 프로젝트를 복원할 수 있습니다.",
  "project.deletedBannerDemoDesc":
    "데모 모드 시뮬레이션이며 실제 GCP 프로젝트에는 영향을 주지 않습니다. 데모 모드를 전환하거나 재시작하면 초기화됩니다.",
  "project.deletedBannerConsoleLink": "삭제 대기 페이지 열기 ↗",
  "project.dismissBannerAria": "알림 닫기",

  // Billing Tab & Account Cards
  "billing.statusOpen": "사용 가능",
  "billing.statusClosed": "종료됨",
  "billing.activeUpperBadge": "활성",
  "billing.projectCountOne": "프로젝트 1개",
  "billing.projectCountMany": "프로젝트 {count}개",
  "billing.copyIdTitle": "결제 계정 ID 복사",
  "billing.consoleReportBtn": "콘솔 보고서 ↗",
  "billing.noLinkedProjects": "이 결제 계정에 연결된 활성 프로젝트가 없습니다.",
  "billing.setActiveTitle": "{project} 프로젝트를 활성 gcloud 프로젝트로 설정",
  "billing.openProjectConsoleTitle": "Google Cloud 콘솔에서 {project} 열기",
  "billing.linkedProjectsHeader": "연결된 프로젝트 ({count})",
  "billing.filterInProjectsBtn": "프로젝트 탭에서 필터링 →",
  "billing.showAllLinkedBtn": "연결된 프로젝트 {count}개 모두 보기 ▾",
  "billing.mtdNetLabel": "이번 달 누적 순지출",
  "billing.boundNoRows": "{table}에 연결됨 (아직 이번 달 데이터 없음).",
  "billing.linkExportHint":
    "이 결제 계정의 지출 내역을 표시하려면 아래에서 BigQuery 결제 데이터 내보내기 테이블을 연결하세요.",
  "billing.configuredBudgets": "설정된 예산 ({count})",
  "billing.budgetLastPeriod": "이전 기간의 100%",
  "billing.budgetCustomTarget": "맞춤 목표",
  "billing.budgetNoThresholds": "임계값 규칙 없음",
  "billing.diagnosticsTitle": "Billing API 진단",
  "billing.noAccountsVisible":
    "현재 Google 계정에서 볼 수 있는 Cloud 결제 계정이 없습니다 (`billing.accounts.get` 또는 `billing.accounts.list` 권한 필요).",

  // BigQuery Export Connection Wizard
  "export.title": "BigQuery 결제 데이터 내보내기 연결",
  "export.desc":
    "쿼리 결과는 로컬에 캐시되며(기본 6시간 TTL) `_PARTITIONTIME`으로 엄격히 필터링되어 당월 및 전월 파티션만 스캔합니다.",
  "export.sharedMapping": "공유 내보내기 (*)",
  "export.accountMapping": "결제 계정 {id}",
  "export.unlinkBtn": "연결 해제",
  "export.autoDetectLabel": "프로젝트에서 내보내기 테이블 자동 감지",
  "export.hostProjectPlaceholder": "호스트 프로젝트 ID 선택 또는 입력…",
  "export.hostProjectAria": "결제 내보내기 호스트 프로젝트 ID",
  "export.scanningBtn": "스캔 중…",
  "export.scanDatasetsBtn": "데이터세트 스캔",
  "export.matchesBillingId": "일치하는 결제 ID: {id}",
  "export.sharedCustomExport": "공유 / 맞춤 내보내기",
  "export.linkAndQueryBtn": "연결 및 조회",
  "export.manualBindLabel": "또는 테이블 ID 직접 입력",
  "export.targetAccountAria": "대상 결제 계정",
  "export.allAccountsOption": "모든 결제 계정 (* 공유 내보내기)",
  "export.saveBtn": "저장",
  "export.helpSummary": "GCP에서 BigQuery 결제 데이터 내보내기를 어떻게 활성화하나요?",
  "export.helpStep1": "Google Cloud 콘솔 → 결제 → 결제 데이터 내보내기를 엽니다.",
  "export.helpStep2": "결제 레코드를 저장할 프로젝트와 BigQuery 데이터세트를 선택합니다.",
  "export.helpStep3": "'표준 사용 비용' 내보내기를 사용 설정합니다(권장, 경량).",
  "export.helpStep4": "여기로 돌아와 해당 프로젝트에서 '데이터세트 스캔'을 클릭합니다.",
  "export.openBillingConsole": "GCP 결제 콘솔 열기 ↗",

  // Preferences & Settings
  "settings.menuTitle": "설정",
  "settings.closeBtnAria": "설정 메뉴 닫기",
  "settings.summary": "Companion 환경설정 및 캐시 설정",
  "settings.languageLabel": "표시 언어",
  "settings.privacySection": "개인정보 및 미리보기",
  "settings.maskEmailToggle": "계정 이메일 주소 마스킹",
  "settings.advancedSummary": "고급 CLI 및 할당량 설정",
  "settings.cacheTtlLabel": "로컬 캐시 유효 시간 (반복적인 BigQuery 스캔 방지)",
  "settings.hoursRecommended": "6시간 (권장)",
  "settings.hourOne": "1시간",
  "settings.hoursMany": "{hours}시간",
  "settings.quotaProjectLabel": "할당량 프로젝트 재정의 (x-goog-user-project)",
  "settings.quotaProjectPlaceholder": "기본값: 활성 gcloud 프로젝트",
  "settings.gcloudPathLabel": "사용자 지정 gcloud 실행 파일 경로 (선택사항)",
  "settings.applyBtn": "설정 적용",
  "settings.switchToLiveBtn": "실제 gcloud 데이터로 전환",
  "settings.enableDemoBtn": "데모 미리보기 모드 켜기",

  // Toast Notifications
  "toast.refreshed": "Google Cloud 데이터를 새로고침했습니다",
  "toast.loadFailed": "데이터를 불러오지 못했습니다",
  "toast.enablingBillingApi": "{project}에서 Cloud Billing API를 사용 설정하는 중…",
  "toast.enabledBillingApi": "Cloud Billing API가 활성화되었습니다! 결제 계정을 새로고침했습니다.",
  "toast.enableBillingApiFailed": "Cloud Billing API 사용 설정 실패",
  "toast.switchedAccount": "활성 gcloud 계정을 전환했습니다",
  "toast.switchAccountFailed": "계정 전환 실패",
  "toast.prefUpdateFailed": "환경설정 업데이트 실패",
  "toast.copied": "{value} 복사됨",
  "toast.exitedDemo": "데모 모드를 종료했습니다",
  "toast.demoEnabled": "데모 미리보기 모드가 켜졌습니다",
  "toast.openingBrowserSignIn": "브라우저에서 Google 로그인을 여는 중…",
  "toast.signedInSuccess": "Google Cloud에 로그인되었습니다!",
  "toast.signInIncomplete": "브라우저 로그인이 완료되지 않았습니다",
  "toast.showingSampleSpend": "샘플 지출 데이터를 표시합니다",
  "toast.activeProjectSet": "활성 프로젝트가 {project}(으)로 설정되었습니다",
  "toast.switchedProject": "활성 프로젝트를 {project}(으)로 전환했습니다",
  "toast.switchProjectFailed": "프로젝트 전환 실패",
  "toast.switchedBillingAccount": "{project} 프로젝트를 {account} 계정에 연결했습니다",
  "toast.switchBillingFailed": "결제 계정 변경 실패",
  "toast.deletedProject": "프로젝트 {project} 삭제가 예약되었습니다",
  "toast.deletedProjectDemo": "데모 모드: {project} 삭제를 시뮬레이션했습니다",
  "toast.deleteProjectFailed": "프로젝트 삭제 실패",
  "toast.pinUpdateFailed": "고정 상태 업데이트 실패",
  "toast.removedExportMapping": "내보내기 테이블 연결을 해제했습니다",
  "toast.removeExportFailed": "연결 해제 실패",
  "toast.enterHostProject": "먼저 호스트 프로젝트 ID를 선택하거나 입력하세요",
  "toast.noExportTablesFound": "{project}에서 gcp_billing_export_* 테이블을 찾지 못했습니다",
  "toast.foundExportTables": "결제 내보내기 테이블 {count}개를 찾았습니다",
  "toast.discoveryFailed": "테이블 검색 실패",
  "toast.connectedExport": "BigQuery 결제 데이터 내보내기가 연결되었습니다!",
  "toast.connectExportFailed": "테이블 연결 실패",
  "toast.enterTableId": "먼저 project.dataset.table을 입력하세요",
  "toast.savedExportTable": "BigQuery 내보내기 테이블을 저장하고 지출을 불러왔습니다",
  "toast.invalidTableRef": "유효하지 않은 테이블 참조입니다",
  "toast.languageUpdated": "표시 언어가 변경되었습니다",
  "toast.cacheTtlSet": "캐시 TTL이 {hours}시간으로 설정되었습니다",
  "toast.savedSettings": "Companion 설정을 저장했습니다",
  "toast.invalidSettings": "잘못된 설정 입력입니다",
  "toast.demoOn": "데모 모드 켜짐",
  "toast.demoOff": "데모 모드 꺼짐 (실제 gcloud)",

  // Plugin Updater
  "update.headerBadgeAvailable": "⬆ v{version}",
  "update.headerBadgeTitle": "플러그인 업데이트 v{version} 사용 가능 — 클릭하여 업데이트",
  "update.headerUpdatedBadge": "✓ v{version}",
  "update.headerUpdatedTitle":
    "v{version}(으)로 업데이트됨 — Antigravity를 새로고침하면 적용됩니다",
  "update.sectionTitle": "플러그인 버전 및 자동 업데이트",
  "update.currentVersionLabel": "현재 v{version}",
  "update.statusUpToDate": "최신 버전",
  "update.statusAvailable": "GitHub에 새 버전 v{version} 있음",
  "update.statusUpdatedRestart": "v{version} 업데이트 완료 (새로고침 필요)",
  "update.autoUpdateToggle": "GitHub에서 플러그인 자동 업데이트 설치",
  "update.checkBtn": "↻ 업데이트 확인",
  "update.checkingBtn": "GitHub 확인 중…",
  "update.installBtn": "⬆ v{version}(으)로 업데이트",
  "update.installingBtn": "플러그인 업데이트 중…",
  "toast.upToDate": "GCP Companion이 최신 버전입니다 (v{version})",
  "toast.updateAvailable": "새 버전 v{version}을(를) 사용할 수 있습니다!",
  "toast.updateInstalled":
    "GCP Companion이 v{version}(으)로 업데이트되었습니다! Antigravity를 새로고침하세요.",
  "toast.updateFailed": "플러그인 업데이트 실패",
};


// --- i18n/zh-CN.js ---
const ZH_CN_MESSAGES                     = {
  // Locale switcher
  "locale.autoShort": "🌐 自动",
  "locale.autoFull": "自动（跟随系统 / 浏览器）",
  "header.languageAria": "显示语言",
  "header.languageTitle": "切换显示语言",

  // Boot & Fatal Error
  "boot.connecting": "正在连接 Google Cloud Companion…",
  "boot.errorTitle": "无法加载 GCP Companion",
  "boot.unknownError": "未知连接错误。",
  "boot.retry": "重试",
  "loading.projects": "正在加载项目…",
  "loading.billing": "正在加载结算账户…",
  "loading.budgets": "正在加载预算规则…",
  "loading.spend": "正在查询 BigQuery 支出…",
  "loading.billingStatus": "查询计费状态…",
  "loading.sectionErrorRetry": "↻ 重试此区域",

  // Relative sync age
  "age.notSynced": "未同步",
  "age.offlineCacheSuffix": "（离线缓存）",
  "age.justNow": "刚刚{suffix}",
  "age.secondsAgo": "{n} 秒前{suffix}",
  "age.minutesAgo": "{n} 分钟前{suffix}",
  "age.hoursMinutesAgo": "{h} 小时 {m} 分钟前{suffix}",

  // Common controls
  "common.copy": "复制",
  "common.checking": "检查中…",

  // Header
  "header.demoBadge": "演示 ×",
  "header.demoExitTitle": "点击退出演示模式并返回实时 gcloud 数据",
  "header.refreshTitle": "从 Google Cloud 与 BigQuery 强制刷新",
  "header.syncing": "同步中…",
  "header.refresh": "↻ 刷新",
  "header.settingsBtn": "⚙ 设置",
  "header.settingsTitle": "打开设置与语言菜单",
  "header.account": "账号",
  "header.accountAria": "当前 Google Cloud 账号",
  "header.showEmailTitle": "显示完整邮箱",
  "header.maskEmailTitle": "隐藏邮箱（隐私保护）",
  "header.showEmailAria": "显示完整邮箱",
  "header.maskEmailAria": "隐藏邮箱",
  "header.activeProject": "当前项目",
  "header.copyProjectTitle": "点击复制当前 gcloud 项目 ID",
  "header.unset": "（未设置）",

  // Navigation Tabs
  "tabs.ariaLabel": "GCP Companion 分区",
  "tabs.overview": "概览",
  "tabs.projects": "项目",
  "tabs.billing": "结算",

  // Onboarding — Step 1 (Install gcloud CLI)
  "onboard.step1Badge": "第 1 / 2 步 · 需要 CLI",
  "onboard.step1Title": "安装 Google Cloud CLI (gcloud)",
  "onboard.step1Desc":
    "未在您的电脑上检测到 Google Cloud CLI (`gcloud`)。请先完成安装并登录，以查看您的 GCP 项目和结算账号。",
  "onboard.step1Check1Title": "安装 Google Cloud CLI (`gcloud`)",
  "onboard.step1Check1Desc": "在 PATH 或标准 SDK 目录中未找到。请通过官方安装程序或 Homebrew 安装。",
  "onboard.step1Check2Title": "登录 Google Cloud",
  "onboard.step1Check2Desc": "安装完成后运行 `gcloud auth login`。",
  "onboard.downloadInstallBtn": "下载并安装 gcloud CLI ↗",
  "onboard.homebrewLabel": "macOS 快速安装 (Homebrew)",
  "onboard.signInAfterInstallLabel": "第 2 步 — 安装后登录",
  "onboard.recheckCliBtn": "↻ 重新检测 gcloud 安装状态",
  "onboard.previewDemoBtn": "预览演示看板",

  // Onboarding — Step 2 (Sign in with Google Account)
  "onboard.step2Badge": "第 2 / 2 步 · 需要登录",
  "onboard.step2Title": "登录您的 Google Cloud 账号",
  "onboard.step2Desc":
    "已检测到 Google Cloud CLI (`gcloud`)，但当前没有已认证的 Google 账号。请登录以查看您的项目与结算信息。",
  "onboard.cliDetectedTitle": "已检测到 Google Cloud CLI",
  "onboard.authAccountTitle": "认证 Google 账号",
  "onboard.authAccountDesc":
    "点击下方按钮在浏览器中启动 Google 登录，或在终端运行 `gcloud auth login`。",
  "onboard.waitingBrowserBtn": "正在等待浏览器完成登录…",
  "onboard.signInBrowserBtn": "🔑 使用浏览器登录 (gcloud auth login)",
  "onboard.orRunInTerminal": "或在终端中运行",
  "onboard.signedInRefreshBtn": "↻ 我已完成登录 — 刷新",

  // Known backend setup hints
  "hint.installCli": "请安装 Google Cloud SDK (`gcloud`) 并运行 `gcloud auth login`。",
  "hint.runAuthLogin": "请在终端运行 `gcloud auth login`，然后点击“刷新”。",
  "hint.sessionExpired":
    "您的 Google Cloud 会话已过期或已撤销，请运行 `gcloud auth login` 重新登录。",
  "hint.demoActive": "演示预览模式已开启。如需使用实时 gcloud 数据，请在“结算 -> 设置”中关闭演示模式。",

  // Enable Cloud Billing API prompt
  "billingApi.badge": "需要操作",
  "billingApi.title": "启用 Cloud Billing API",
  "billingApi.desc":
    "要展示您的 Cloud 结算账号和项目结算状态，Google Cloud 要求在配额项目上启用免费的 Cloud Billing API (cloudbilling.googleapis.com)。",
  "billingApi.quotaProjectLabel": "用于启用 API 的配额项目",
  "billingApi.enablingBtn": "正在启用 Cloud Billing API（约 10 秒）…",
  "billingApi.enableBtn": "⚡ 在 {project} 上启用 Cloud Billing API",
  "billingApi.openConsoleProject": "打开 GCP 控制台 ({project}) ↗",
  "billingApi.openConsole": "打开 GCP 控制台 ↗",

  // Spend & Charts
  "spend.noBaseline": "暂无上月同期基线",
  "spend.vsPrevMtd": "较上月同期 {delta}%",
  "spend.gross": "毛费用: {amount}",
  "spend.credits": "抵扣额: {amount}",
  "spend.lastMonthTotal": "上月总计: {amount}",
  "spend.monthTotalLabel": "{month} 总计: {amount}",
  "spend.settledBadge": "✓ 已封存缓存 · 免重扫 BQ",
  "spend.backfillingBadge": "⏳ 回填同步中 ({days} 天)",
  "spend.projectedNet": "月底预估净支出: {amount}",
  "spend.projectedGross": "预估毛费用: {amount}",
  "spend.forecastBasis": "按前 {days}/{total} 个完整日历天推算（截至 {date}）",
  "spend.forecastExcludedToday": "已排除今日部分写入",
  "spend.forecastCreditsCaution": "按当前用量推算；未包含抵扣额度耗尽或月末调账风险",
  "spend.forecastNegativeCaution": "检测到负数调账或退款，暂停该项线性预估",
  "spend.priorMonthRunRateRef":
    "上月 ({month}) 已导出 {days} 天日均参考：净额 {net}/天（毛费用 {gross}/天）· 待本月数据进表满 2 天后自动启用月底预估",
  "spend.lastMonthShort": "上月: {amount}",
  "chart.noDailyUsage": "本月暂无每日用量记录",
  "chart.dailyTrendAria": "每日净支出趋势（{days} 天）",
  "chart.dailyGrossTrendAria": "每日毛用量趋势（{days} 天，已由抵扣额全额抵扣）",
  "chart.dailyTrendWithForecastAria": "每日净支出趋势（{days} 天）含月底线性预估虚线",
  "chart.dailyGrossTrendWithForecastAria": "每日毛用量趋势（{days} 天）含月底线性预估虚线",
  "chart.forecastCaption": "虚线: 日均 {rate}/天 → {monthEnd}",
  "chart.peakPerDay": "峰值 {amount}/天",
  "chart.peakGrossPerDay": "毛用量峰值 {amount}/天",
  "chart.noBillableServices": "本月暂无产生费用的服务记录。",
  "chart.grossCreditsHint": "毛费用 {gross}，抵扣额 {credits}",
  "chart.grossShort": "毛费用 {amount}",

  // Overview Tab
  "overview.cliRecommendedBadge": "建议安装 CLI",
  "overview.cliNotFoundTitle": "未找到 Google Cloud CLI (`gcloud`)",
  "overview.cliNotFoundDesc":
    "当前通过已保存的应用默认凭据 (ADC) 连接，但未在电脑上找到 `gcloud` CLI。安装 `gcloud` 后即可切换账号并同步 CLI 项目。",
  "overview.installCliBtn": "安装 gcloud CLI ↗",
  "overview.mtdNetSpend": "本月至今净支出 ({month})",
  "overview.monthlyNetSpend": "月份净支出 ({month})",
  "overview.monthSelectorAria": "选择账单月份",
  "overview.monthNoRowsYet":
    "尚无 {month} 的导出账单记录（GCP 导出或历史回填可能仍在同步中）。",
  "overview.spendBreakdownTitle": "本月支出明细",
  "overview.spendBreakdownTitleForMonth": "支出明细 ({month})",
  "overview.byProject": "按项目",
  "overview.byAccount": "按结算账号",
  "overview.byService": "按服务",
  "overview.topService": "最高: {service}",
  "overview.noProjectCosts": "本月暂无按项目统计的费用记录。",
  "overview.noBqRows": "无 BQ 数据",
  "overview.kpiActiveProjects": "有效项目",
  "overview.kpiBillingApiOff": "Billing API 未启用",
  "overview.kpiOpenBillingAccts": "有效结算账号",
  "overview.kpiEnableApiBelow": "请在下方启用 API",
  "overview.kpiUnbilledSandbox": "未绑定结算 / 沙盒",
  "overview.bqWaitingTitle": "已连接 BigQuery — 等待用量数据",
  "overview.unlockSpendTitle": "开启本月至今支出追踪",
  "overview.bqWaitingDesc":
    "已查询 {tables}，目前暂无 {currentMonth} / {prevMonth} 的账单记录。",
  "overview.unlockSpendDesc":
    "GCP REST API 可立即列出项目、结算账号和预算规则。绑定 BigQuery 结算数据导出表后，即可查看精确净支出、抵扣额及各项服务费用明细。",
  "overview.manageExportBtn": "管理导出表 →",
  "overview.connectBqBtn": "连接 BigQuery 导出表 →",
  "overview.previewSampleBtn": "预览示例支出",
  "overview.pinnedAndActiveTitle": "星标与当前项目",
  "overview.viewAllProjects": "查看全部 ({count}) →",
  "overview.pinEmptyHint": "在“项目”标签页为常用项目点亮 ★，即可固定在此处一键切换。",
  "overview.diagnosticsTitle": "诊断与提示",
  "warnings.openIamConsole": "在 GCP 控制台中打开 IAM 权限 ↗",
  "warnings.enableApiConsole": "在 GCP 控制台中启用 API ↗",

  // Projects Tab & Cards
  "projects.filterFocus": "当前与星标 ★ ({count})",
  "projects.filterAll": "全部 ({count})",
  "projects.filterPinned": "已星标 ★ ({count})",
  "projects.filterUnbilled": "未绑定结算 ({count})",
  "projects.searchPlaceholder": "搜索项目名称、ID、编号、标签…",
  "projects.searchAria": "搜索 GCP 项目",
  "projects.sortAria": "排序项目",
  "projects.sortSmart": "排序: 智能",
  "projects.sortSpend": "排序: 支出 ↓",
  "projects.sortName": "排序: 名称 A–Z",
  "projects.emptyFilter": "没有符合当前筛选条件的 GCP 项目。",
  "projects.focusEmptyPrompt":
    "在上方搜索框输入关键字即可查找全部 {total} 个项目，或展开浏览列表。",
  "projects.hiddenCompactHint":
    "当前仅显示 {shown} / {total} 个项目 — 在上方输入关键字可搜索全部，或",
  "projects.browseAllBtn": "浏览项目列表 ({total}) ▾",
  "projects.showMoreBtn": "显示更多（剩余 {remaining} 个）▾",
  "projects.collapseListBtn": "收起列表 ▴",
  "project.activeBadge": "当前",
  "project.unbilledTag": "未绑定结算",
  "project.noBillingTag": "无结算账号",
  "project.setActiveBtn": "设为当前",
  "project.setActiveCmdTitle": "执行 gcloud config set project {project}",
  "project.openConsoleTitle": "在 Google Cloud 控制台中打开",
  "project.unpinTitle": "取消固定",
  "project.pinTitle": "固定到概览页",
  "project.unpinAria": "取消固定 {project}",
  "project.pinAria": "固定 {project}",
  "project.copyIdTitle": "复制项目 ID",
  "project.hideBtn": "收起 ▴",
  "project.detailsBtn": "详情 ▾",
  "project.projectNumber": "项目编号 # {number}",
  "project.billingId": "结算 ID: {id}",
  "project.billingAccountLabel": "结算账号",
  "project.changeBillingBtn": "变更",
  "project.linkBillingBtn": "关联结算",
  "project.cancelBtn": "取消",
  "project.billingSelectAria": "选择目标结算账号",
  "project.billingSelectPlaceholder": "选择有效的结算账号…",
  "project.billingCurrentSuffix": "（当前）",
  "project.billingManualOption": "手动输入结算账号 ID…",
  "project.billingManualPlaceholder": "01ABCD-234567-89EFGH",
  "project.billingManualAria": "手动输入结算账号 ID",
  "project.billingManualFormatHint": "格式：XXXXXX-XXXXXX-XXXXXX（不支持取消结算关联）",
  "project.billingAlreadyLinked": "此项目当前已关联到该结算账号。",
  "project.billingClosedNotAllowed": "已关闭的结算账号无法关联到项目。",
  "project.billingConfirmTitle": "确认变更结算账号",
  "project.billingConfirmFrom": "原账号",
  "project.billingConfirmTo": "新账号",
  "project.billingConfirmNote":
    "切换后的新用量将计入目标结算账号；已有 BigQuery 历史费用记录仍保留在原账号。",
  "project.billingConfirmSwitchBtn": "确认切换",
  "project.billingConfirmLinkBtn": "确认关联",
  "project.billingSwitchingBtn": "切换中…",
  "project.billingOpenConsoleLink": "在 GCP 控制台打开结算设置 ↗",
  "project.noBqCostThisMonth": "本月暂无此项目的 BigQuery 费用记录。",
  "project.connectBqForCosts": "在“结算”标签页连接 BigQuery 结算数据导出表后，即可在此查看各服务费用。",
  "project.linkDashboard": "信息中心 ↗",
  "project.linkBillingReport": "结算报告 ↗",
  "project.linkCloudRun": "Cloud Run ↗",
  "project.linkBigQuery": "BigQuery ↗",
  "project.linkLogs": "日志 ↗",
  "project.dangerZoneLabel": "危险操作",
  "project.deleteBtn": "删除项目",
  "project.deleteConfirmTitle": "关停并删除项目",
  "project.deleteConfirmDesc":
    "删除 {project} 会立即停止所有服务和计费，并进入 30 天恢复期（可在 Google Cloud 控制台还原），期满后永久删除。",
  "project.deleteWarnActive":
    "此项目为当前使用的 gcloud 项目，删除后需切换到其他活跃项目。",
  "project.deleteWarnQuota":
    "此项目当前设为配额项目覆盖 (Quota Project Override)，删除后将自动清除该设置。",
  "project.deleteWarnBqExport":
    "此项目承载已关联的 BigQuery 账单导出表，删除后相关费用查询将停止工作。",
  "project.deleteTypePrompt": "请输入 {project} 以确认删除：",
  "project.deleteInputAria": "输入要删除的项目 ID 以确认",
  "project.deleteConfirmSubmitBtn": "确认关停并删除",
  "project.deleteDeletingBtn": "删除中…",
  "project.deleteOpenConsoleLink": "在 GCP 控制台打开项目设置 ↗",
  "project.deletedBannerTitle": "项目 {project} 已安排删除",
  "project.deletedBannerDesc":
    "您可以在 30 天内前往 Google Cloud 控制台的“待删除资源”恢复此项目。",
  "project.deletedBannerDemoDesc":
    "仅为演示模式模拟删除，不会影响真实 GCP 项目。切换演示模式或重启后即可重置。",
  "project.deletedBannerConsoleLink": "打开待删除资源页面 ↗",
  "project.dismissBannerAria": "关闭通知",

  // Billing Tab & Account Cards
  "billing.statusOpen": "有效",
  "billing.statusClosed": "已关闭",
  "billing.activeUpperBadge": "当前",
  "billing.projectCountOne": "1 个项目",
  "billing.projectCountMany": "{count} 个项目",
  "billing.copyIdTitle": "复制结算账号 ID",
  "billing.consoleReportBtn": "控制台报告 ↗",
  "billing.noLinkedProjects": "此结算账号下暂无关联的有效项目。",
  "billing.setActiveTitle": "将 {project} 设为当前 gcloud 项目",
  "billing.openProjectConsoleTitle": "在 Google Cloud 控制台中打开 {project}",
  "billing.linkedProjectsHeader": "关联项目 ({count})",
  "billing.filterInProjectsBtn": "在项目标签页筛选 →",
  "billing.showAllLinkedBtn": "展开全部 {count} 个关联项目 ▾",
  "billing.mtdNetLabel": "本月至今净支出",
  "billing.boundNoRows": "已绑定 {table}（本月暂无数据行）。",
  "billing.linkExportHint": "在下方关联 BigQuery 结算数据导出表，以展示此结算账号的支出。",
  "billing.configuredBudgets": "已配置的预算 ({count})",
  "billing.budgetLastPeriod": "上一周期的 100%",
  "billing.budgetCustomTarget": "自定义目标",
  "billing.budgetNoThresholds": "无阈值规则",
  "billing.diagnosticsTitle": "Billing API 诊断信息",
  "billing.noAccountsVisible":
    "当前 Google 账号下没有可见的 Cloud 结算账号（需要 `billing.accounts.get` 或 `billing.accounts.list` 权限）。",

  // BigQuery Export Connection Wizard
  "export.title": "BigQuery 结算数据导出连接",
  "export.desc":
    "查询结果缓存在本地（默认 TTL 6 小时），并严格按 `_PARTITIONTIME` 分区裁剪，仅扫描当月与上月分区。",
  "export.sharedMapping": "共享导出表 (*)",
  "export.accountMapping": "结算账号 {id}",
  "export.unlinkBtn": "解除绑定",
  "export.autoDetectLabel": "自动检测项目中的导出表",
  "export.hostProjectPlaceholder": "选择或输入宿主项目 ID…",
  "export.hostProjectAria": "结算导出表宿主项目 ID",
  "export.scanningBtn": "扫描中…",
  "export.scanDatasetsBtn": "扫描数据集",
  "export.matchesBillingId": "匹配结算 ID: {id}",
  "export.sharedCustomExport": "共享 / 自定义导出表",
  "export.linkAndQueryBtn": "绑定并查询",
  "export.manualBindLabel": "或手动绑定表 ID",
  "export.targetAccountAria": "目标结算账号",
  "export.allAccountsOption": "所有结算账号 (* 共享导出表)",
  "export.saveBtn": "保存",
  "export.helpSummary": "如何在 GCP 中开启 BigQuery 结算数据导出？",
  "export.helpStep1": "打开 Google Cloud 控制台 → 结算 → 结算数据导出。",
  "export.helpStep2": "选择用于存储账单记录的项目与 BigQuery 数据集。",
  "export.helpStep3": "启用“标准使用费”导出（推荐，轻量高效）。",
  "export.helpStep4": "返回此处，对该项目点击“扫描数据集”。",
  "export.openBillingConsole": "打开 GCP 结算控制台 ↗",

  // Preferences & Settings
  "settings.menuTitle": "设置",
  "settings.closeBtnAria": "关闭设置菜单",
  "settings.summary": "Companion 偏好与缓存设置",
  "settings.languageLabel": "显示语言",
  "settings.privacySection": "隐私与预览",
  "settings.maskEmailToggle": "隐藏账号电子邮箱地址",
  "settings.advancedSummary": "高级 CLI 与配额项目设置",
  "settings.cacheTtlLabel": "本地缓存有效期（避免重复扫描 BigQuery）",
  "settings.hoursRecommended": "6 小时（推荐）",
  "settings.hourOne": "1 小时",
  "settings.hoursMany": "{hours} 小时",
  "settings.quotaProjectLabel": "配额项目覆盖 (x-goog-user-project)",
  "settings.quotaProjectPlaceholder": "默认使用当前 gcloud 项目",
  "settings.gcloudPathLabel": "自定义 gcloud 可执行文件路径（可选）",
  "settings.applyBtn": "应用设置",
  "settings.switchToLiveBtn": "切换回实时 gcloud 数据",
  "settings.enableDemoBtn": "开启演示预览模式",

  // Toast Notifications
  "toast.refreshed": "已刷新 Google Cloud 数据",
  "toast.loadFailed": "加载数据失败",
  "toast.enablingBillingApi": "正在 {project} 上启用 Cloud Billing API…",
  "toast.enabledBillingApi": "Cloud Billing API 已启用！已刷新结算账号。",
  "toast.enableBillingApiFailed": "启用 Cloud Billing API 失败",
  "toast.switchedAccount": "已切换当前 gcloud 账号",
  "toast.switchAccountFailed": "切换账号失败",
  "toast.prefUpdateFailed": "更新偏好设置失败",
  "toast.copied": "已复制 {value}",
  "toast.exitedDemo": "已退出演示模式",
  "toast.demoEnabled": "已开启演示预览模式",
  "toast.openingBrowserSignIn": "正在浏览器中打开 Google 登录…",
  "toast.signedInSuccess": "已成功登录 Google Cloud！",
  "toast.signInIncomplete": "浏览器登录未完成",
  "toast.showingSampleSpend": "正在展示示例支出数据",
  "toast.activeProjectSet": "已将当前项目设为 {project}",
  "toast.switchedProject": "已将当前项目切换为 {project}",
  "toast.switchProjectFailed": "切换项目失败",
  "toast.switchedBillingAccount": "已将 {project} 关联至 {account}",
  "toast.switchBillingFailed": "切换结算账号失败",
  "toast.deletedProject": "已安排删除项目 {project}",
  "toast.deletedProjectDemo": "演示模式：已模拟删除项目 {project}",
  "toast.deleteProjectFailed": "删除项目失败",
  "toast.pinUpdateFailed": "更新星标状态失败",
  "toast.removedExportMapping": "已移除导出表绑定",
  "toast.removeExportFailed": "移除绑定失败",
  "toast.enterHostProject": "请先选择或输入宿主项目 ID",
  "toast.noExportTablesFound": "在 {project} 中未找到 gcp_billing_export_* 表",
  "toast.foundExportTables": "找到 {count} 个结算导出表",
  "toast.discoveryFailed": "扫描导出表失败",
  "toast.connectedExport": "已连接 BigQuery 结算数据导出！",
  "toast.connectExportFailed": "连接导出表失败",
  "toast.enterTableId": "请先输入 project.dataset.table",
  "toast.savedExportTable": "已保存 BigQuery 导出表并加载支出数据",
  "toast.invalidTableRef": "无效的表 ID 格式",
  "toast.languageUpdated": "显示语言已更新",
  "toast.cacheTtlSet": "缓存有效期已设为 {hours} 小时",
  "toast.savedSettings": "已保存 Companion 设置",
  "toast.invalidSettings": "设置输入无效",
  "toast.demoOn": "演示模式已开启",
  "toast.demoOff": "演示模式已关闭（实时 gcloud）",

  // Plugin Updater
  "update.headerBadgeAvailable": "⬆ v{version}",
  "update.headerBadgeTitle": "发现新版本 v{version} — 点击立即更新",
  "update.headerUpdatedBadge": "✓ v{version}",
  "update.headerUpdatedTitle": "已更新至 v{version} — 重新加载 Antigravity 后完全生效",
  "update.sectionTitle": "插件版本与自动更新",
  "update.currentVersionLabel": "当前版本 v{version}",
  "update.statusUpToDate": "已是最新版本",
  "update.statusAvailable": "GitHub 有新版本 v{version} 可用",
  "update.statusUpdatedRestart": "已更新至 v{version}（重新加载后生效）",
  "update.autoUpdateToggle": "自动从 GitHub 下载并安装插件更新",
  "update.checkBtn": "↻ 检查更新",
  "update.checkingBtn": "正在检查 GitHub…",
  "update.installBtn": "⬆ 立即更新至 v{version}",
  "update.installingBtn": "正在更新插件…",
  "toast.upToDate": "GCP Companion 已是最新版本 (v{version})",
  "toast.updateAvailable": "发现新版本 v{version}！",
  "toast.updateInstalled": "已更新至 v{version}！请重新加载 Antigravity 以完成生效。",
  "toast.updateFailed": "插件更新失败",
};


// --- i18n/zh-TW.js ---
const ZH_TW_MESSAGES                     = {
  // Locale switcher
  "locale.autoShort": "🌐 自動",
  "locale.autoFull": "自動（跟隨系統 / 瀏覽器）",
  "header.languageAria": "顯示語言",
  "header.languageTitle": "切換顯示語言",

  // Boot & Fatal Error
  "boot.connecting": "正在連線至 Google Cloud Companion…",
  "boot.errorTitle": "無法載入 GCP Companion",
  "boot.unknownError": "未知的連線錯誤。",
  "boot.retry": "重試",
  "loading.projects": "正在載入專案…",
  "loading.billing": "正在載入帳單帳戶…",
  "loading.budgets": "正在載入預算規則…",
  "loading.spend": "正在查詢 BigQuery 支出…",
  "loading.billingStatus": "查詢計費狀態…",
  "loading.sectionErrorRetry": "↻ 重試此區塊",

  // Relative sync age
  "age.notSynced": "尚未同步",
  "age.offlineCacheSuffix": "（離線快取）",
  "age.justNow": "剛剛{suffix}",
  "age.secondsAgo": "{n} 秒前{suffix}",
  "age.minutesAgo": "{n} 分鐘前{suffix}",
  "age.hoursMinutesAgo": "{h} 小時 {m} 分鐘前{suffix}",

  // Common controls
  "common.copy": "複製",
  "common.checking": "檢查中…",

  // Header
  "header.demoBadge": "展示 ×",
  "header.demoExitTitle": "點擊離開展示模式並返回即時 gcloud 資料",
  "header.refreshTitle": "強制從 Google Cloud 與 BigQuery 重新整理",
  "header.syncing": "同步中…",
  "header.refresh": "↻ 重新整理",
  "header.settingsBtn": "⚙ 設定",
  "header.settingsTitle": "開啟設定與語系選單",
  "header.account": "帳號",
  "header.accountAria": "作用中的 Google Cloud 帳號",
  "header.showEmailTitle": "顯示完整電子郵件",
  "header.maskEmailTitle": "遮罩電子郵件（保護個人資料）",
  "header.showEmailAria": "顯示完整電子郵件",
  "header.maskEmailAria": "遮罩電子郵件",
  "header.activeProject": "目前專案",
  "header.copyProjectTitle": "點擊複製目前 gcloud 專案 ID",
  "header.unset": "（未設定）",

  // Navigation Tabs
  "tabs.ariaLabel": "GCP Companion 分頁",
  "tabs.overview": "總覽",
  "tabs.projects": "專案",
  "tabs.billing": "帳單",

  // Onboarding — Step 1 (Install gcloud CLI)
  "onboard.step1Badge": "步驟 1 / 2 · 需要 CLI",
  "onboard.step1Title": "安裝 Google Cloud CLI (gcloud)",
  "onboard.step1Desc":
    "在您的電腦上找不到 Google Cloud CLI (`gcloud`)。請先完成安裝並登入，即可檢視您的 GCP 專案與帳單帳戶。",
  "onboard.step1Check1Title": "安裝 Google Cloud CLI (`gcloud`)",
  "onboard.step1Check1Desc": "在 PATH 或標準 SDK 資料夾中未找到，請透過官方安裝程式或 Homebrew 安裝。",
  "onboard.step1Check2Title": "登入 Google Cloud",
  "onboard.step1Check2Desc": "安裝完成後執行 `gcloud auth login`。",
  "onboard.downloadInstallBtn": "下載並安裝 gcloud CLI ↗",
  "onboard.homebrewLabel": "macOS 快速安裝 (Homebrew)",
  "onboard.signInAfterInstallLabel": "步驟 2 — 安裝後登入",
  "onboard.recheckCliBtn": "↻ 重新檢查 gcloud 安裝狀態",
  "onboard.previewDemoBtn": "預覽展示儀表板",

  // Onboarding — Step 2 (Sign in with Google Account)
  "onboard.step2Badge": "步驟 2 / 2 · 需要登入",
  "onboard.step2Title": "登入您的 Google Cloud 帳號",
  "onboard.step2Desc":
    "電腦上已安裝 Google Cloud CLI (`gcloud`)，但尚未有已驗證的 Google 帳號。請登入以檢視您的專案與帳單資訊。",
  "onboard.cliDetectedTitle": "已偵測到 Google Cloud CLI",
  "onboard.authAccountTitle": "驗證 Google 帳號",
  "onboard.authAccountDesc":
    "點擊下方按鈕在瀏覽器開啟 Google 登入，或在終端機執行 `gcloud auth login`。",
  "onboard.waitingBrowserBtn": "正在等待瀏覽器完成登入…",
  "onboard.signInBrowserBtn": "🔑 使用瀏覽器登入 (gcloud auth login)",
  "onboard.orRunInTerminal": "或在終端機中執行",
  "onboard.signedInRefreshBtn": "↻ 我已完成登入 — 重新整理",

  // Known backend setup hints
  "hint.installCli": "請安裝 Google Cloud SDK (`gcloud`) 並執行 `gcloud auth login`。",
  "hint.runAuthLogin": "請在終端機執行 `gcloud auth login`，完成後點擊「重新整理」。",
  "hint.sessionExpired":
    "您的 Google Cloud 登入階段已過期或已撤銷，請執行 `gcloud auth login` 重新登入。",
  "hint.demoActive":
    "展示預覽模式已啟用。若要使用即時 gcloud 資料，請至「帳單 -> 設定」關閉展示模式。",

  // Enable Cloud Billing API prompt
  "billingApi.badge": "需要處理",
  "billingApi.title": "啟用 Cloud Billing API",
  "billingApi.desc":
    "若要顯示您的 Cloud 帳單帳戶與專案計費狀態，Google Cloud 要求在配額專案上啟用免費的 Cloud Billing API (cloudbilling.googleapis.com)。",
  "billingApi.quotaProjectLabel": "要啟用 API 的配額專案",
  "billingApi.enablingBtn": "正在啟用 Cloud Billing API（約 10 秒）…",
  "billingApi.enableBtn": "⚡ 在 {project} 啟用 Cloud Billing API",
  "billingApi.openConsoleProject": "開啟 GCP 控制台 ({project}) ↗",
  "billingApi.openConsole": "開啟 GCP 控制台 ↗",

  // Spend & Charts
  "spend.noBaseline": "無上月同期基準",
  "spend.vsPrevMtd": "較上月同期 {delta}%",
  "spend.gross": "未折抵金額: {amount}",
  "spend.credits": "抵免額: {amount}",
  "spend.lastMonthTotal": "上月總計: {amount}",
  "spend.monthTotalLabel": "{month} 總計: {amount}",
  "spend.settledBadge": "✓ 已封存快取 · 免重掃 BQ",
  "spend.backfillingBadge": "⏳ 回填同步中 ({days} 天)",
  "spend.projectedNet": "月底預估淨支出: {amount}",
  "spend.projectedGross": "預估未折抵毛額: {amount}",
  "spend.forecastBasis": "依前 {days}/{total} 個完整日曆天推算（截至 {date}）",
  "spend.forecastExcludedToday": "已排除今日部分寫入",
  "spend.forecastCreditsCaution": "依目前用量推算；預估未計入未來抵免額可能用罄或月底調帳",
  "spend.forecastNegativeCaution": "偵測到負數調帳或退費，暫停該項線性預估",
  "spend.priorMonthRunRateRef":
    "上月 ({month}) 已匯出 {days} 天日均參考：淨額 {net}/日（未折抵 {gross}/日）· 待本月資料進表滿 2 天後自動啟用月底預估",
  "spend.lastMonthShort": "上月: {amount}",
  "chart.noDailyUsage": "本月尚無每日用量紀錄",
  "chart.dailyTrendAria": "每日淨支出趨勢（{days} 天）",
  "chart.dailyGrossTrendAria": "每日未折抵用量趨勢（{days} 天，已由抵免額折抵）",
  "chart.dailyTrendWithForecastAria": "每日淨支出趨勢（{days} 天）含月底線性預估虛線",
  "chart.dailyGrossTrendWithForecastAria": "每日未折抵用量趨勢（{days} 天）含月底線性預估虛線",
  "chart.forecastCaption": "虛線: 日均 {rate}/日 → {monthEnd}",
  "chart.peakPerDay": "最高 {amount}/日",
  "chart.peakGrossPerDay": "最高未折抵 {amount}/日",
  "chart.noBillableServices": "本月尚無計費服務用量紀錄。",
  "chart.grossCreditsHint": "未折抵 {gross}，抵免額 {credits}",
  "chart.grossShort": "未折抵 {amount}",

  // Overview Tab
  "overview.cliRecommendedBadge": "建議安裝 CLI",
  "overview.cliNotFoundTitle": "找不到 Google Cloud CLI (`gcloud`)",
  "overview.cliNotFoundDesc":
    "目前已透過應用程式預設憑證 (ADC) 連線，但在電腦上找不到 `gcloud` CLI。安裝 `gcloud` 後即可切換帳號並同步 CLI 專案。",
  "overview.installCliBtn": "安裝 gcloud CLI ↗",
  "overview.mtdNetSpend": "本月至今淨支出 ({month})",
  "overview.monthlyNetSpend": "月份淨支出 ({month})",
  "overview.monthSelectorAria": "選擇帳單月份",
  "overview.monthNoRowsYet":
    "尚無 {month} 的匯出帳單資料（GCP 匯出或歷史回填可能仍在同步中）。",
  "overview.spendBreakdownTitle": "本月支出明細",
  "overview.spendBreakdownTitleForMonth": "支出明細 ({month})",
  "overview.byProject": "依專案",
  "overview.byAccount": "依帳單帳戶",
  "overview.byService": "依服務",
  "overview.topService": "最高: {service}",
  "overview.noProjectCosts": "本月尚無個別專案費用紀錄。",
  "overview.noBqRows": "無 BQ 資料",
  "overview.kpiActiveProjects": "啟用中專案",
  "overview.kpiBillingApiOff": "Billing API 未啟用",
  "overview.kpiOpenBillingAccts": "啟用中帳單帳戶",
  "overview.kpiEnableApiBelow": "請於下方啟用 API",
  "overview.kpiUnbilledSandbox": "未連結帳單 / 沙盒",
  "overview.bqWaitingTitle": "已連結 BigQuery — 等待用量資料",
  "overview.unlockSpendTitle": "啟用本月至今支出追蹤",
  "overview.bqWaitingDesc":
    "已查詢 {tables}，目前尚無 {currentMonth} / {prevMonth} 的帳單資料列。",
  "overview.unlockSpendDesc":
    "GCP REST API 可立即列出專案、帳單帳戶與預算規則。連結 BigQuery 帳單匯出資料表後，即可檢視精確淨支出、抵免額與各項服務費用明細。",
  "overview.manageExportBtn": "管理匯出資料表 →",
  "overview.connectBqBtn": "連結 BigQuery 帳單匯出 →",
  "overview.previewSampleBtn": "預覽範例支出",
  "overview.pinnedAndActiveTitle": "釘選與目前專案",
  "overview.viewAllProjects": "檢視全部 ({count}) →",
  "overview.pinEmptyHint": "在「專案」分頁為常用專案點選 ★，即可釘選於此處一鍵切換。",
  "overview.diagnosticsTitle": "診斷與提示",
  "warnings.openIamConsole": "在 GCP 控制台開啟 IAM 權限 ↗",
  "warnings.enableApiConsole": "在 GCP 控制台啟用 API ↗",

  // Projects Tab & Cards
  "projects.filterFocus": "目前與釘選 ★ ({count})",
  "projects.filterAll": "全部 ({count})",
  "projects.filterPinned": "已釘選 ★ ({count})",
  "projects.filterUnbilled": "未計費 ({count})",
  "projects.searchPlaceholder": "搜尋專案名稱、ID、編號、標籤…",
  "projects.searchAria": "搜尋 GCP 專案",
  "projects.sortAria": "排序專案",
  "projects.sortSmart": "排序: 智慧",
  "projects.sortSpend": "排序: 支出 ↓",
  "projects.sortName": "排序: 名稱 A–Z",
  "projects.emptyFilter": "沒有符合目前篩選條件的 GCP 專案。",
  "projects.focusEmptyPrompt":
    "在上方搜尋框輸入關鍵字即可尋找全部 {total} 個專案，或展開瀏覽列表。",
  "projects.hiddenCompactHint":
    "目前僅顯示 {shown} / {total} 個專案 — 在上方輸入關鍵字可搜尋全部，或",
  "projects.browseAllBtn": "瀏覽專案列表 ({total}) ▾",
  "projects.showMoreBtn": "顯示更多（剩餘 {remaining} 個）▾",
  "projects.collapseListBtn": "收合列表 ▴",
  "project.activeBadge": "目前使用",
  "project.unbilledTag": "未計費",
  "project.noBillingTag": "無帳單帳戶",
  "project.setActiveBtn": "設為目前",
  "project.setActiveCmdTitle": "執行 gcloud config set project {project}",
  "project.openConsoleTitle": "在 Google Cloud 控制台中開啟",
  "project.unpinTitle": "取消釘選專案",
  "project.pinTitle": "釘選專案至總覽頁",
  "project.unpinAria": "取消釘選 {project}",
  "project.pinAria": "釘選 {project}",
  "project.copyIdTitle": "複製專案 ID",
  "project.hideBtn": "收合 ▴",
  "project.detailsBtn": "詳情 ▾",
  "project.projectNumber": "專案編號 # {number}",
  "project.billingId": "帳單 ID: {id}",
  "project.billingAccountLabel": "帳單帳戶",
  "project.changeBillingBtn": "變更",
  "project.linkBillingBtn": "連結帳單",
  "project.cancelBtn": "取消",
  "project.billingSelectAria": "選擇目標帳單帳戶",
  "project.billingSelectPlaceholder": "選擇啟用中的帳單帳戶…",
  "project.billingCurrentSuffix": "（目前使用）",
  "project.billingManualOption": "手動輸入帳單帳戶 ID…",
  "project.billingManualPlaceholder": "01ABCD-234567-89EFGH",
  "project.billingManualAria": "手動輸入帳單帳戶 ID",
  "project.billingManualFormatHint": "格式：XXXXXX-XXXXXX-XXXXXX（不支援解除帳單連結）",
  "project.billingAlreadyLinked": "此專案目前已連結至該帳單帳戶。",
  "project.billingClosedNotAllowed": "已關閉的帳單帳戶無法連結至專案。",
  "project.billingConfirmTitle": "確認變更帳單帳戶",
  "project.billingConfirmFrom": "原帳單",
  "project.billingConfirmTo": "新帳單",
  "project.billingConfirmNote":
    "切換後的新用量將計入目標帳單帳戶；既有 BigQuery 歷史帳單紀錄仍保留於原帳單帳戶。",
  "project.billingConfirmSwitchBtn": "確認切換",
  "project.billingConfirmLinkBtn": "確認連結",
  "project.billingSwitchingBtn": "切換中…",
  "project.billingOpenConsoleLink": "在 GCP 控制台開啟帳單設定 ↗",
  "project.noBqCostThisMonth": "本月尚無此專案的 BigQuery 費用紀錄。",
  "project.connectBqForCosts": "請至「帳單」分頁連結 BigQuery 帳單匯出資料表，以檢視各服務費用。",
  "project.linkDashboard": "資訊主頁 ↗",
  "project.linkBillingReport": "帳單報表 ↗",
  "project.linkCloudRun": "Cloud Run ↗",
  "project.linkBigQuery": "BigQuery ↗",
  "project.linkLogs": "紀錄 (Logs) ↗",
  "project.dangerZoneLabel": "危險操作",
  "project.deleteBtn": "刪除專案",
  "project.deleteConfirmTitle": "關閉並刪除專案",
  "project.deleteConfirmDesc":
    "刪除 {project} 會立即停用所有服務與計費，並進入 30 天緩衝期（可於 Google Cloud 控制台還原），期滿後永久刪除。",
  "project.deleteWarnActive":
    "此專案為目前使用中的 gcloud 專案，刪除後需切換至其他啟用中的專案。",
  "project.deleteWarnQuota":
    "此專案目前設為配額專案覆寫 (Quota Project Override)，刪除後將自動清除此設定。",
  "project.deleteWarnBqExport":
    "此專案承載已連結的 BigQuery 帳單匯出資料表，刪除後相關費用查詢將無法運作。",
  "project.deleteTypePrompt": "請輸入 {project} 以確認刪除：",
  "project.deleteInputAria": "輸入要刪除的專案 ID 以確認",
  "project.deleteConfirmSubmitBtn": "確認關閉並刪除",
  "project.deleteDeletingBtn": "刪除中…",
  "project.deleteOpenConsoleLink": "在 GCP 控制台開啟專案設定 ↗",
  "project.deletedBannerTitle": "專案 {project} 已排定刪除",
  "project.deletedBannerDesc":
    "您可以在 30 天內前往 Google Cloud 控制台的「待刪除資源」還原此專案。",
  "project.deletedBannerDemoDesc":
    "此為展示模式模擬刪除，不會影響真實 GCP 專案。切換模式或重啟後即自動恢復。",
  "project.deletedBannerConsoleLink": "開啟待刪除資源頁面 ↗",
  "project.dismissBannerAria": "關閉通知",

  // Billing Tab & Account Cards
  "billing.statusOpen": "啟用中",
  "billing.statusClosed": "已關閉",
  "billing.activeUpperBadge": "目前使用",
  "billing.projectCountOne": "1 個專案",
  "billing.projectCountMany": "{count} 個專案",
  "billing.copyIdTitle": "複製帳單帳戶 ID",
  "billing.consoleReportBtn": "控制台報表 ↗",
  "billing.noLinkedProjects": "此帳單帳戶目前沒有連結任何啟用中的專案。",
  "billing.setActiveTitle": "將 {project} 設為目前 gcloud 專案",
  "billing.openProjectConsoleTitle": "在 Google Cloud 控制台中開啟 {project}",
  "billing.linkedProjectsHeader": "連結的專案 ({count})",
  "billing.filterInProjectsBtn": "在專案分頁中篩選 →",
  "billing.showAllLinkedBtn": "展開全部 {count} 個連結專案 ▾",
  "billing.mtdNetLabel": "本月至今淨支出",
  "billing.boundNoRows": "已綁定 {table}（本月尚無資料列）。",
  "billing.linkExportHint": "請在下方連結 BigQuery 帳單匯出資料表，以顯示此帳單帳戶的支出。",
  "billing.configuredBudgets": "已設定的預算 ({count})",
  "billing.budgetLastPeriod": "上一期的 100%",
  "billing.budgetCustomTarget": "自訂目標",
  "billing.budgetNoThresholds": "無門檻規則",
  "billing.diagnosticsTitle": "Billing API 診斷資訊",
  "billing.noAccountsVisible":
    "目前 Google 帳號下沒有可見的 Cloud 帳單帳戶（需要 `billing.accounts.get` 或 `billing.accounts.list` 權限）。",

  // BigQuery Export Connection Wizard
  "export.title": "BigQuery 帳單匯出連結",
  "export.desc":
    "查詢結果會快取於本機（預設 TTL 6 小時），並嚴格依 `_PARTITIONTIME` 修剪分區，僅掃描當月與上月分區。",
  "export.sharedMapping": "共用匯出表 (*)",
  "export.accountMapping": "帳單帳戶 {id}",
  "export.unlinkBtn": "解除連結",
  "export.autoDetectLabel": "自動偵測專案中的匯出資料表",
  "export.hostProjectPlaceholder": "選擇或輸入主機專案 ID…",
  "export.hostProjectAria": "帳單匯出主機專案 ID",
  "export.scanningBtn": "掃描中…",
  "export.scanDatasetsBtn": "掃描資料集",
  "export.matchesBillingId": "對應帳單 ID: {id}",
  "export.sharedCustomExport": "共用 / 自訂匯出表",
  "export.linkAndQueryBtn": "連結並查詢",
  "export.manualBindLabel": "或手動綁定資料表 ID",
  "export.targetAccountAria": "目標帳單帳戶",
  "export.allAccountsOption": "所有帳單帳戶 (* 共用匯出表)",
  "export.saveBtn": "儲存",
  "export.helpSummary": "如何在 GCP 啟用 BigQuery 帳單匯出？",
  "export.helpStep1": "開啟 Google Cloud 控制台 → 帳單 (Billing) → 帳單匯出 (Billing export)。",
  "export.helpStep2": "選擇要儲存帳單紀錄的專案與 BigQuery 資料集。",
  "export.helpStep3": "啟用「標準使用費用 (Standard usage cost)」匯出（建議，輕量且快速）。",
  "export.helpStep4": "回到此處並對該專案點擊「掃描資料集」。",
  "export.openBillingConsole": "開啟 GCP 帳單控制台 ↗",

  // Preferences & Settings
  "settings.menuTitle": "設定",
  "settings.closeBtnAria": "關閉設定選單",
  "settings.summary": "Companion 偏好設定與快取管理",
  "settings.languageLabel": "顯示語言",
  "settings.privacySection": "隱私與預覽",
  "settings.maskEmailToggle": "遮罩帳號電子郵件地址",
  "settings.advancedSummary": "進階 CLI 與配額專案設定",
  "settings.cacheTtlLabel": "本機快取有效時間（避免重複掃描 BigQuery）",
  "settings.hoursRecommended": "6 小時（建議）",
  "settings.hourOne": "1 小時",
  "settings.hoursMany": "{hours} 小時",
  "settings.quotaProjectLabel": "配額專案覆寫 (x-goog-user-project)",
  "settings.quotaProjectPlaceholder": "預設使用目前 gcloud 專案",
  "settings.gcloudPathLabel": "自訂 gcloud 執行檔路徑（選填）",
  "settings.applyBtn": "套用設定",
  "settings.switchToLiveBtn": "切換回即時 gcloud 資料",
  "settings.enableDemoBtn": "啟用展示預覽模式",

  // Toast Notifications
  "toast.refreshed": "已重新整理 Google Cloud 資料",
  "toast.loadFailed": "載入資料失敗",
  "toast.enablingBillingApi": "正在 {project} 啟用 Cloud Billing API…",
  "toast.enabledBillingApi": "Cloud Billing API 已啟用！已更新帳單帳戶。",
  "toast.enableBillingApiFailed": "啟用 Cloud Billing API 失敗",
  "toast.switchedAccount": "已切換目前 gcloud 帳號",
  "toast.switchAccountFailed": "切換帳號失敗",
  "toast.prefUpdateFailed": "更新偏好設定失敗",
  "toast.copied": "已複製 {value}",
  "toast.exitedDemo": "已離開展示模式",
  "toast.demoEnabled": "已啟用展示預覽模式",
  "toast.openingBrowserSignIn": "正在瀏覽器開啟 Google 登入…",
  "toast.signedInSuccess": "已成功登入 Google Cloud！",
  "toast.signInIncomplete": "瀏覽器登入未完成",
  "toast.showingSampleSpend": "正在顯示範例支出資料",
  "toast.activeProjectSet": "已將目前專案設為 {project}",
  "toast.switchedProject": "已將目前專案切換為 {project}",
  "toast.switchProjectFailed": "切換專案失敗",
  "toast.switchedBillingAccount": "已將 {project} 連結至 {account}",
  "toast.switchBillingFailed": "切換帳單帳戶失敗",
  "toast.deletedProject": "已排定刪除專案 {project}",
  "toast.deletedProjectDemo": "展示模式：已模擬刪除專案 {project}",
  "toast.deleteProjectFailed": "刪除專案失敗",
  "toast.pinUpdateFailed": "更新釘選狀態失敗",
  "toast.removedExportMapping": "已移除匯出資料表連結",
  "toast.removeExportFailed": "移除連結失敗",
  "toast.enterHostProject": "請先選擇或輸入主機專案 ID",
  "toast.noExportTablesFound": "在 {project} 中找不到 gcp_billing_export_* 資料表",
  "toast.foundExportTables": "找到 {count} 個帳單匯出資料表",
  "toast.discoveryFailed": "掃描資料表失敗",
  "toast.connectedExport": "已連結 BigQuery 帳單匯出！",
  "toast.connectExportFailed": "連結資料表失敗",
  "toast.enterTableId": "請先輸入 project.dataset.table",
  "toast.savedExportTable": "已儲存 BigQuery 匯出資料表並載入支出",
  "toast.invalidTableRef": "無效的資料表參照格式",
  "toast.languageUpdated": "顯示語言已更新",
  "toast.cacheTtlSet": "快取有效時間已設為 {hours} 小時",
  "toast.savedSettings": "已儲存 Companion 設定",
  "toast.invalidSettings": "設定輸入無效",
  "toast.demoOn": "展示模式已開啟",
  "toast.demoOff": "展示模式已關閉（即時 gcloud）",

  // Plugin Updater
  "update.headerBadgeAvailable": "⬆ v{version}",
  "update.headerBadgeTitle": "有新版本 v{version} 可更新 — 點擊立即更新",
  "update.headerUpdatedBadge": "✓ v{version}",
  "update.headerUpdatedTitle": "已更新至 v{version} — 重新載入 Antigravity 後完全生效",
  "update.sectionTitle": "外掛版本與自動更新",
  "update.currentVersionLabel": "目前版本 v{version}",
  "update.statusUpToDate": "已是最新版本",
  "update.statusAvailable": "GitHub 有新版本 v{version} 可供更新",
  "update.statusUpdatedRestart": "已更新至 v{version}（重新載入後生效）",
  "update.autoUpdateToggle": "自動從 GitHub 下載並安裝外掛更新",
  "update.checkBtn": "↻ 檢查更新",
  "update.checkingBtn": "正在檢查 GitHub…",
  "update.installBtn": "⬆ 立即更新至 v{version}",
  "update.installingBtn": "正在更新外掛…",
  "toast.upToDate": "GCP Companion 已是最新版本 (v{version})",
  "toast.updateAvailable": "發現新版本 v{version}！",
  "toast.updateInstalled": "已更新至 v{version}！請重新載入 Antigravity 以完成生效。",
  "toast.updateFailed": "外掛更新失敗",
};


// --- i18n/index.js ---
const SUPPORTED_LOCALES                              = [
  { code: "en", nativeName: "English", shortName: "🌐 EN" },
  { code: "es", nativeName: "Español", shortName: "🌐 ES" },
  { code: "fr", nativeName: "Français", shortName: "🌐 FR" },
  { code: "ja", nativeName: "日本語", shortName: "🌐 日本語" },
  { code: "ko", nativeName: "한국어", shortName: "🌐 한국어" },
  { code: "zh-CN", nativeName: "简体中文", shortName: "🌐 简体" },
  { code: "zh-TW", nativeName: "繁體中文", shortName: "🌐 繁體" },
];
const TRANSLATION_CATALOGS                                         = {
  en: EN_MESSAGES,
  es: ES_MESSAGES,
  fr: FR_MESSAGES,
  ja: JA_MESSAGES,
  ko: KO_MESSAGES,
  "zh-CN": ZH_CN_MESSAGES,
  "zh-TW": ZH_TW_MESSAGES,
};

let currentLocalePreference                   = "auto";
function isSupportedLocaleCode(value        )                      {
  return (
    value === "en" ||
    value === "es" ||
    value === "fr" ||
    value === "ja" ||
    value === "ko" ||
    value === "zh-CN" ||
    value === "zh-TW"
  );
}
function matchLanguageTagToLocale(rawTag        )                    {
  const tag = rawTag.trim().toLowerCase().replace(/_/g, "-");
  if (!tag) return null;

  if (
    tag === "zh-tw" ||
    tag === "zh-hk" ||
    tag === "zh-mo" ||
    tag.startsWith("zh-hant")
  ) {
    return "zh-TW";
  }
  if (
    tag === "zh" ||
    tag === "zh-cn" ||
    tag === "zh-sg" ||
    tag === "zh-my" ||
    tag.startsWith("zh-hans") ||
    tag.startsWith("zh-")
  ) {
    return "zh-CN";
  }
  if (tag === "es" || tag.startsWith("es-")) {
    return "es";
  }
  if (tag === "fr" || tag.startsWith("fr-")) {
    return "fr";
  }
  if (tag === "ja" || tag.startsWith("ja-")) {
    return "ja";
  }
  if (tag === "ko" || tag.startsWith("ko-")) {
    return "ko";
  }
  if (tag === "en" || tag.startsWith("en-")) {
    return "en";
  }
  return null;
}
function detectBrowserLocale(explicitLanguages                    )             {
  const candidates           = [];
  if (explicitLanguages && explicitLanguages.length > 0) {
    candidates.push(...explicitLanguages);
  } else if (typeof window !== "undefined" && window.navigator) {
    if (Array.isArray(window.navigator.languages)) {
      candidates.push(...window.navigator.languages);
    }
    if (typeof window.navigator.language === "string" && window.navigator.language) {
      candidates.push(window.navigator.language);
    }
  }

  for (const tag of candidates) {
    const matched = matchLanguageTagToLocale(tag);
    if (matched) return matched;
  }
  return "en";
}
function resolveLocale(
  pref                  ,
  explicitLanguages                    
)             {
  if (pref !== "auto" && isSupportedLocaleCode(pref)) {
    return pref;
  }
  return detectBrowserLocale(explicitLanguages);
}
function setLocalePreference(pref                              )       {
  if (!pref || pref === "auto") {
    currentLocalePreference = "auto";
    return;
  }
  currentLocalePreference = isSupportedLocaleCode(pref) ? pref : "auto";
}
function getLocalePreference()                   {
  return currentLocalePreference;
}
function getActiveLocale()             {
  return resolveLocale(currentLocalePreference);
}
function t(
  key                ,
  params                                  
)         {
  const active = getActiveLocale();
  const catalog = TRANSLATION_CATALOGS[active] || EN_MESSAGES;
  const template = catalog[key] ?? EN_MESSAGES[key] ?? String(key);
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_match, paramName        ) => {
    const val = params[paramName];
    return val !== undefined && val !== null ? String(val) : "";
  });
}
function localizeSetupHint(hint               )                {
  if (!hint) return null;
  if (getActiveLocale() === "en") return hint;
  if (/Install Google Cloud SDK/i.test(hint)) {
    return t("hint.installCli");
  }
  if (/Run `gcloud auth login` in your terminal/i.test(hint)) {
    return t("hint.runAuthLogin");
  }
  if (/session has expired or been revoked/i.test(hint)) {
    return t("hint.sessionExpired");
  }
  if (/Demo Preview Mode is active/i.test(hint)) {
    return t("hint.demoActive");
  }
  return hint;
}


// --- dom.js ---


                                                                                

                               
                     
              
                 
                
                  
               
                
                 
                       
                
                        
                       
                     
                    
                     
                
                    
                     
                        
                        
                    
                      
                                   
                                     
                                
                                 
                                       
 

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Safe DOM element builder using `document.createElement` and `textContent` exclusively.
 * Never uses `innerHTML`, preventing DOM XSS by construction.
 */
function h                                       (
  tag   ,
  attrs                      ,
  ...children                 
)                           {
  const el = document.createElement(tag);
  if (attrs) {
    if (attrs.className) el.className = attrs.className;
    if (attrs.id) el.id = attrs.id;
    if (attrs.title) el.title = attrs.title;
    if (attrs.role) el.setAttribute("role", attrs.role);
    if (attrs.tabIndex !== undefined) el.tabIndex = attrs.tabIndex;
    if (attrs.ariaLabel) el.setAttribute("aria-label", attrs.ariaLabel);
    if (attrs.ariaSelected) el.setAttribute("aria-selected", attrs.ariaSelected);
    if (attrs.ariaExpanded) el.setAttribute("aria-expanded", attrs.ariaExpanded);
    if (attrs.ariaBusy) el.setAttribute("aria-busy", attrs.ariaBusy);
    if (attrs.ariaHidden) el.setAttribute("aria-hidden", attrs.ariaHidden);

    if (attrs.href !== undefined && el instanceof HTMLAnchorElement) {
      // Only allow https:// external links or relative internal anchors
      if (attrs.href.startsWith("https://") || attrs.href.startsWith("./") || attrs.href.startsWith("#")) {
        el.href = attrs.href;
      }
    }
    if (attrs.target && el instanceof HTMLAnchorElement) el.target = attrs.target;
    if (attrs.rel && el instanceof HTMLAnchorElement) el.rel = attrs.rel;

    if (attrs.type && (el instanceof HTMLInputElement || el instanceof HTMLButtonElement)) {
      el.type = attrs.type;
    }
    if (attrs.placeholder && el instanceof HTMLInputElement) {
      el.placeholder = attrs.placeholder;
    }
    if (attrs.list && el instanceof HTMLInputElement) {
      el.setAttribute("list", attrs.list);
    }
    if (attrs.autocomplete && el instanceof HTMLInputElement) {
      el.setAttribute("autocomplete", attrs.autocomplete);
    }
    if (attrs.spellcheck !== undefined && el instanceof HTMLInputElement) {
      el.spellcheck = Boolean(attrs.spellcheck);
    }
    if (attrs.disabled !== undefined && "disabled" in el) {
      (el                                                            ).disabled = Boolean(
        attrs.disabled
      );
    }
    if (attrs.checked !== undefined && el instanceof HTMLInputElement) {
      el.checked = Boolean(attrs.checked);
    }
    if (attrs.selected !== undefined && el instanceof HTMLOptionElement) {
      el.selected = Boolean(attrs.selected);
    }
    if (attrs.value !== undefined) {
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLOptionElement ||
        el instanceof HTMLSelectElement
      ) {
        el.value = attrs.value;
      }
    }
    if (attrs.dataset) {
      for (const [k, v] of Object.entries(attrs.dataset)) {
        el.dataset[k] = v;
      }
    }
    if (attrs.onClick) el.addEventListener("click", attrs.onClick);
    if (attrs.onInput) el.addEventListener("input", attrs.onInput);
    if (attrs.onChange) el.addEventListener("change", attrs.onChange);
    if (attrs.onSubmit) {
      el.addEventListener("submit", (ev) => {
        ev.preventDefault();
        attrs.onSubmit?.(ev               );
      });
    }
  }

  appendChildren(el, children);
  return el;
}
function appendChildren(parent         , children                          )       {
  for (const child of children) {
    if (child === null || child === undefined || typeof child === "boolean") continue;
    if (child instanceof Node) {
      parent.appendChild(child);
    } else {
      parent.appendChild(document.createTextNode(String(child)));
    }
  }
}
function svgEl(
  tag        ,
  attrs                                  ,
  ...children              
)             {
  const el = document.createElementNS(SVG_NS, tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, String(v));
    }
  }
  for (const child of children) {
    el.appendChild(child);
  }
  return el;
}
function clearElement(el         )       {
  el.replaceChildren();
}
function formatMoney(amount        , currency = "USD")         {
  const safeCurrency = /^[A-Z]{3}$/.test(currency) ? currency : "USD";
  const normalizedAmount = Math.abs(amount) < 0.005 ? 0 : amount;
  try {
    const formatter = new Intl.NumberFormat(getActiveLocale(), {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (safeCurrency === "TWD" && typeof formatter.formatToParts === "function") {
      return formatter
        .formatToParts(normalizedAmount)
        .map((part) => (part.type === "currency" && part.value === "$" ? "NT$" : part.value))
        .join("");
    }
    return formatter.format(normalizedAmount);
  } catch {
    return `${safeCurrency} ${normalizedAmount.toFixed(2)}`;
  }
}
function formatRelativeAge(ageMs               , stale         )         {
  if (ageMs === null) return t("age.notSynced");
  const sec = Math.floor(ageMs / 1000);
  const suffix = stale ? t("age.offlineCacheSuffix") : "";
  if (sec < 15) return t("age.justNow", { suffix });
  if (sec < 60) return t("age.secondsAgo", { n: sec, suffix });
  const min = Math.floor(sec / 60);
  if (min < 60) return t("age.minutesAgo", { n: min, suffix });
  const hr = Math.floor(min / 60);
  return t("age.hoursMinutesAgo", { h: hr, m: min % 60, suffix });
}
async function copyToClipboard(text        )                   {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}


// --- charts.js ---



/**
 * Renders a crisp, responsive SVG daily spend sparkline using `createElementNS`.
 */
function renderDailySparkline(
  series                            ,
  currency        ,
  emptyMessage         ,
  forecast                       
)              {
  if (series.length === 0) {
    return h("div", { className: "sparkline-empty" }, emptyMessage || t("chart.noDailyUsage"));
  }

  const width = 460;
  const height = 68;
  const padX = 6;
  const padTop = 8;
  const padBottom = 10;
  const netValues = series.map((d) => Math.max(0, d.netCost));
  const grossValues = series.map((d) => Math.max(0, d.grossCost));
  const maxNet = Math.max(...netValues, 0);
  const maxGross = Math.max(...grossValues, 0);
  const useGrossSeries = maxNet <= 0.005 && maxGross > 0.005;
  const values = useGrossSeries ? grossValues : netValues;
  const minVal = 0;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;

  const monthPrefix =
    forecast?.invoiceMonth?.length === 6
      ? `${forecast.invoiceMonth.slice(0, 4)}-${forecast.invoiceMonth.slice(4, 6)}-`
      : "";
  const lastActualDate = series[series.length - 1]?.date ?? "";
  const lastActualDay = Number(lastActualDate.slice(8, 10)) || series.length;
  const forecastRate =
    forecast && forecast.status === "estimated"
      ? useGrossSeries
        ? forecast.grossDailyRunRate
        : forecast.netDailyRunRate
      : null;
  const forecastEomTotal =
    forecast && forecast.status === "estimated"
      ? useGrossSeries
        ? forecast.monthEndGrossCost
        : forecast.monthEndNetCost
      : null;
  const hasForecastProjection = Boolean(
    forecast &&
      forecast.status === "estimated" &&
      forecast.daysInMonth > 1 &&
      monthPrefix &&
      lastActualDate.startsWith(monthPrefix) &&
      lastActualDay < forecast.daysInMonth &&
      forecastRate !== null &&
      forecastEomTotal !== null
  );

  const maxVal = Math.max(...values, hasForecastProjection ? Math.max(0, forecastRate ?? 0) : 0, 0.01);
  const dayToX = (dayNum        )         => {
    const totalDays = forecast?.daysInMonth ?? 30;
    const clamped = Math.max(1, Math.min(totalDays, dayNum));
    const ratio = totalDays > 1 ? (clamped - 1) / (totalDays - 1) : 0.5;
    return Math.round((padX + ratio * innerW) * 10) / 10;
  };
  const valToY = (rawVal        )         => {
    const ratio = (Math.max(0, rawVal) - minVal) / (maxVal - minVal || 1);
    return Math.round((padTop + innerH - ratio * innerH) * 10) / 10;
  };

  const points = series.map((pt, idx) => {
    const x = hasForecastProjection
      ? dayToX(Number(pt.date.slice(8, 10)) || idx + 1)
      : Math.round(
          (series.length === 1 ? width / 2 : padX + (idx / (series.length - 1)) * innerW) * 10
        ) / 10;
    const rawVal = useGrossSeries ? pt.grossCost : pt.netCost;
    const y = valToY(rawVal);
    return { x, y, pt };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
  const areaPath =
    points.length > 1
      ? `${linePath} L${points[points.length - 1].x},${height - padBottom} L${points[0].x},${height - padBottom} Z`
      : "";

  const gradId = `spark-grad-${currency.toLowerCase()}`;
  const defs = svgEl(
    "defs",
    {},
    svgEl(
      "linearGradient",
      { id: gradId, x1: "0", y1: "0", x2: "0", y2: "1" },
      svgEl("stop", { offset: "0%", "stop-color": "currentColor", "stop-opacity": "0.28" }),
      svgEl("stop", { offset: "100%", "stop-color": "currentColor", "stop-opacity": "0.0" })
    )
  );

  const children               = [defs];
  if (areaPath) {
    children.push(svgEl("path", { d: areaPath, fill: `url(#${gradId})` }));
  }
  children.push(
    svgEl("path", {
      d: linePath,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    })
  );

  const last = points[points.length - 1];
  if (last) {
    if (hasForecastProjection && forecast && forecastRate !== null) {
      const rateY = valToY(forecastRate);
      const nextX = dayToX(Math.min(forecast.daysInMonth, lastActualDay + 1));
      const endX = dayToX(forecast.daysInMonth);
      const forecastPath = `M${last.x},${last.y} L${nextX},${rateY} L${endX},${rateY}`;
      children.push(
        svgEl("path", {
          d: forecastPath,
          class: "sparkline-forecast",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2",
          "stroke-dasharray": "4 3",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        }),
        svgEl("circle", {
          cx: endX,
          cy: rateY,
          r: 2.6,
          class: "sparkline-forecast-dot",
          fill: "currentColor",
        })
      );
    }
    children.push(
      svgEl("circle", {
        cx: last.x,
        cy: last.y,
        r: 3.2,
        fill: "currentColor",
      })
    );
  }

  const ariaLabel = hasForecastProjection
    ? useGrossSeries
      ? t("chart.dailyGrossTrendWithForecastAria", { days: series.length })
      : t("chart.dailyTrendWithForecastAria", { days: series.length })
    : useGrossSeries
      ? t("chart.dailyGrossTrendAria", { days: series.length })
      : t("chart.dailyTrendAria", { days: series.length });

  const svg = svgEl(
    "svg",
    {
      viewBox: `0 0 ${width} ${height}`,
      class: "sparkline-svg",
      role: "img",
      "aria-label": ariaLabel,
    },
    ...children
  );

  const firstDate = series[0]?.date.slice(5) ?? "";
  const monthEndDate =
    hasForecastProjection && forecast
      ? `${forecast.invoiceMonth.slice(4)}-${String(forecast.daysInMonth).padStart(2, "0")}`
      : (series[series.length - 1]?.date.slice(5) ?? "");
  const peakCost = Math.max(...values);

  return h(
    "div",
    { className: "sparkline-wrap" },
    svg,
    h(
      "div",
      { className: "sparkline-caption" },
      h("span", null, firstDate),
      h(
        "span",
        null,
        hasForecastProjection && forecastRate !== null && forecastEomTotal !== null
          ? t("chart.forecastCaption", {
              rate: formatMoney(forecastRate, currency),
              monthEnd: formatMoney(forecastEomTotal, currency),
            })
          : useGrossSeries
            ? t("chart.peakGrossPerDay", { amount: formatMoney(peakCost, currency) })
            : t("chart.peakPerDay", { amount: formatMoney(peakCost, currency) })
      ),
      h("span", null, monthEndDate)
    )
  );
}

/**
 * Renders horizontal proportional cost bars for GCP services inside a project/billing card.
 */
function renderServiceBreakdownList(
  services                            ,
  currency        
)              {
  if (services.length === 0) {
    return h("div", { className: "muted-note" }, t("chart.noBillableServices"));
  }

  const rows = services.slice(0, 6).map((svc) => {
    const pct = Math.max(2, Math.min(100, svc.sharePercent || 0));
    const barSvg = svgEl(
      "svg",
      {
        viewBox: "0 0 100 6",
        preserveAspectRatio: "none",
        class: "svc-bar-svg",
        "aria-hidden": "true",
      },
      svgEl("rect", {
        x: 0,
        y: 0,
        width: 100,
        height: 6,
        rx: 3,
        class: "svc-bar-bg",
      }),
      svgEl("rect", {
        x: 0,
        y: 0,
        width: pct,
        height: 6,
        rx: 3,
        class: "svc-bar-fg",
      })
    );

    const isCreditOffsetZero = Math.abs(svc.netCost) < 0.005 && svc.grossCost >= 0.005;
    return h(
      "div",
      { className: "svc-row" },
      h(
        "div",
        { className: "svc-row-header" },
        h("span", { className: "svc-name", title: svc.serviceName }, svc.serviceName),
        h(
          "span",
          { className: "svc-amount" },
          formatMoney(svc.netCost, currency),
          isCreditOffsetZero
            ? h(
                "span",
                {
                  className: "svc-credit-hint",
                  title: t("chart.grossCreditsHint", {
                    gross: formatMoney(svc.grossCost, currency),
                    credits: formatMoney(svc.creditsAmount, currency),
                  }),
                },
                ` (${t("chart.grossShort", { amount: formatMoney(svc.grossCost, currency) })} · ${svc.sharePercent.toFixed(0)}%)`
              )
            : svc.creditsAmount < -0.005
              ? h(
                  "span",
                  {
                    className: "svc-credit-hint",
                    title: t("chart.grossCreditsHint", {
                      gross: formatMoney(svc.grossCost, currency),
                      credits: formatMoney(svc.creditsAmount, currency),
                    }),
                  },
                  ` (${svc.sharePercent.toFixed(0)}%)`
                )
              : ` (${svc.sharePercent.toFixed(0)}%)`
        )
      ),
      barSvg
    );
  });

  return h("div", { className: "svc-list" }, ...rows);
}


// --- api.js ---
             
                           
                             
                           
                            
                            
                         
                         
             
                   
                             
                      
                      
                          

                        
                    
                         
                    
 

// Held strictly in module memory closure (never persisted to browser storage)
let activeSession                      = null;
function clearClientSession()       {
  activeSession = null;
}

const FETCH_TIMEOUT_MS = 45_000;

function resolveEndpointCandidates(endpoint        )           {
  const clean = endpoint.replace(/^\.?\//, "");
  if (typeof window === "undefined" || !window.location) {
    return [`./${clean}`];
  }
  const pathname = window.location.pathname || "/";
  let baseDir = pathname;
  if (baseDir.endsWith("/index.html")) {
    baseDir = baseDir.slice(0, -"index.html".length);
  } else if (!baseDir.endsWith("/")) {
    baseDir = `${baseDir}/`;
  }
  const primary = `${baseDir}${clean}`;
  const rootFallback = `/${clean}`;
  return primary === rootFallback ? [primary] : [primary, rootFallback];
}

async function fetchEndpoint(
  endpoint        ,
  init             ,
  timeoutMs = FETCH_TIMEOUT_MS
)                    {
  const candidates = resolveEndpointCandidates(endpoint);
  let lastRes                  = null;
  for (let i = 0; i < candidates.length; i++) {
    const res = await fetch(candidates[i], {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
    });
    lastRes = res;
    if (res.status !== 404 || i === candidates.length - 1) {
      return res;
    }
  }
  return lastRes ;
}

async function ensureSession(forceNew = false)                        {
  if (!forceNew && activeSession && Date.now() < activeSession.expiresAt - 30_000) {
    return activeSession;
  }
  const res = await fetchEndpoint("api/session", {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!res.ok) {
    throw new Error(`Failed to initialize companion session (HTTP ${res.status}).`);
  }
  const data = (await res.json())     
                      
                           
                        
   ;
  activeSession = {
    csrfToken: data.csrfToken,
    proxyCsrfToken: data.proxyCsrfToken,
    expiresAt: Date.now() + Number(data.expiresInMs || 1_800_000),
  };
  return activeSession;
}

async function apiPost   (
  path        ,
  body                         ,
  retried = false,
  timeoutMs = FETCH_TIMEOUT_MS
)             {
  const session = await ensureSession(false);
  const res = await fetchEndpoint(
    path,
    {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-AGY-Companion": "1",
        "X-CSRF-Token": session.csrfToken,
        "X-CSRF-Proxy-Token": session.proxyCsrfToken,
      },
      body: JSON.stringify(body),
    },
    timeoutMs
  );

  if (res.status === 403 && !retried) {
    // Server may have restarted and rotated its ephemeral instance secret; re-handshake once
    await ensureSession(true);
    return apiPost   (path, body, true, timeoutMs);
  }

  const payload = (await res.json().catch(() => ({})))                          ;
  if (!res.ok) {
    throw new Error(payload.error || `Request failed (HTTP ${res.status})`);
  }
  return payload;
}
async function fetchBootstrap(
  forceRefresh = false
)                                      {
  const query = forceRefresh ? "?refresh=1" : "";
  const res = await fetchEndpoint(`api/bootstrap${query}`, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });
  if (res.status === 404) {
    // Graceful fallback if sidecar process has not restarted onto the progressive API routes yet
    return {}                              ;
  }
  const payload = (await res.json().catch(() => ({})))     
                   
                       
                            
                         
                                ;
  if (!res.ok) {
    throw new Error(payload.error || `Failed to initialize GCP Companion (HTTP ${res.status})`);
  }
  if (payload.csrfToken && payload.proxyCsrfToken) {
    activeSession = {
      csrfToken: payload.csrfToken,
      proxyCsrfToken: payload.proxyCsrfToken,
      expiresAt: Date.now() + Number(payload.expiresInMs || 1_800_000),
    };
  }
  return payload;
}
async function fetchProjectsSection(
  forceRefresh = false
)                                     {
  const query = forceRefresh ? "?refresh=1" : "";
  const res = await fetchEndpoint(`api/projects${query}`, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });
  if (res.status === 404) {
    return { authenticated: false, projects: [], cache: { hit: false, stale: false, fetchedAt: null, ageMs: null, ttlMs: 0 }, warnings: [] };
  }
  const payload = (await res.json().catch(() => ({})))     
                   
                               ;
  if (!res.ok) {
    throw new Error(payload.error || `Failed to load GCP projects (HTTP ${res.status})`);
  }
  return payload;
}
async function fetchBillingSection(
  forceRefresh = false
)                                    {
  const query = forceRefresh ? "?refresh=1" : "";
  const res = await fetchEndpoint(`api/billing${query}`, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });
  if (res.status === 404) {
    return {
      authenticated: false,
      billingAccounts: [],
      projectBillingLinks: {},
      budgetsLoaded: true,
      cache: { hit: false, stale: false, fetchedAt: null, ageMs: null, ttlMs: 0 },
      warnings: [],
    };
  }
  const payload = (await res.json().catch(() => ({})))     
                   
                              ;
  if (!res.ok) {
    throw new Error(payload.error || `Failed to load billing accounts (HTTP ${res.status})`);
  }
  return payload;
}
async function fetchBudgetsSection(
  forceRefresh = false
)                                    {
  const query = forceRefresh ? "?refresh=1" : "";
  const res = await fetchEndpoint(`api/budgets${query}`, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });
  if (res.status === 404) {
    return { authenticated: false, budgetsByAccount: {}, warnings: [] };
  }
  const payload = (await res.json().catch(() => ({})))     
                   
                              ;
  if (!res.ok) {
    throw new Error(payload.error || `Failed to load billing budgets (HTTP ${res.status})`);
  }
  return payload;
}
async function fetchSpendSection(
  forceRefresh = false
)                                  {
  const query = forceRefresh ? "?refresh=1" : "";
  const res = await fetchEndpoint(`api/spend${query}`, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });
  if (res.status === 404) {
    return {
      authenticated: false,
      spend: {
        configured: false,
        invoiceMonth: "",
        previousInvoiceMonth: "",
        queriedTables: [],
        queriedAt: "",
        totalsByCurrency: [],
        byBillingAccount: {},
        byProject: {},
      },
      cache: { hit: false, stale: false, fetchedAt: null, ageMs: null, ttlMs: 0 },
      warnings: [],
    };
  }
  const payload = (await res.json().catch(() => ({})))     
                   
                            ;
  if (!res.ok) {
    throw new Error(payload.error || `Failed to load BigQuery spend (HTTP ${res.status})`);
  }
  return payload;
}
async function switchActiveAccountProgressive(
  account        
)                                     {
  return apiPost                           ("./api/active-account", {
    account,
    progressive: true,
  });
}
async function updateCloudPreferencesProgressive(prefs   
                                     
                                       
                     
 )                                      {
  const data = await apiPost  
                                           
                                         
    ("./api/preferences", {
    ...prefs,
    progressive: true,
  });
  if (data.bootstrap) {
    return data.bootstrap;
  }
  if (data.overview) {
    return {
      auth: data.overview.auth,
      preferences: data.overview.preferences,
      pluginUpdate: data.overview.pluginUpdate,
      spendConfigured: data.overview.summary.spendConfigured,
      cachedOverview: data.overview,
    };
  }
  throw new Error("Unexpected response from preferences update.");
}
async function fetchOverview(forceRefresh = false)                                     {
  await ensureSession(false);
  const query = forceRefresh ? "?refresh=1" : "";
  const res = await fetchEndpoint(`api/overview${query}`, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });
  const payload = (await res.json().catch(() => ({})))                                                  ;
  if (!res.ok) {
    throw new Error(payload.error || `Failed to load GCP overview (HTTP ${res.status})`);
  }
  return payload;
}
async function switchActiveProject(projectId        )                                     {
  const data = await apiPost                                         ("./api/active-project", {
    projectId,
  });
  return data.overview;
}
async function switchActiveAccount(account        )                                     {
  const data = await apiPost                                         ("./api/active-account", {
    account,
  });
  return data.overview;
}
async function togglePinProject(
  projectId        ,
  pinned         
)                                     {
  const data = await apiPost                                         ("./api/pin-project", {
    projectId,
    pinned,
  });
  return data.overview;
}
async function setProjectBillingAccountApi(
  projectId        ,
  billingAccountId        
)                                                                                {
  return apiPost                                                                      (
    "./api/project-billing",
    {
      projectId,
      billingAccountId,
    }
  );
}
async function deleteProjectApi(
  projectId        ,
  confirmProjectId        
)                                                                         {
  return apiPost                                                               (
    "./api/delete-project",
    {
      projectId,
      confirmProjectId,
    }
  );
}
async function updateCompanionPreferences(prefs   
                       
                         
                                     
                                       
                     
                            
                             
 )                                     {
  const data = await apiPost                                         ("./api/preferences", prefs);
  return data.overview;
}
async function discoverExportTablesApi(
  hostProjectId        
)                                    {
  const data = await apiPost                                      (
    "./api/billing-export/discover",
    { hostProjectId }
  );
  return data.tables;
}
async function configureExportTableApi(params   
                           
                   
                         
                   
 )                                     {
  const data = await apiPost                                         (
    "./api/billing-export/configure",
    params
  );
  return data.overview;
}
async function fetchProjectBreakdownApi(projectId        )           
                             
                                    
                                       
                           
   {
  const res = await fetchEndpoint(
    `api/project-breakdown?projectId=${encodeURIComponent(projectId)}`,
    {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    }
  );
  const payload = (await res.json().catch(() => ({})))     
                   
                               
                                      
                                         
                             
   ;
  if (!res.ok) {
    throw new Error(payload.error || `Failed to load breakdown (HTTP ${res.status})`);
  }
  return payload;
}
async function enableGcpServiceApi(
  projectId        ,
  serviceName        
)                                     {
  const data = await apiPost                                         ("./api/enable-service", {
    projectId,
    serviceName,
  });
  return data.overview;
}
async function startBrowserLoginApi()                                     {
  const data = await apiPost                                         (
    "./api/auth-login",
    {},
    false,
    125_000
  );
  return data.overview;
}
async function checkPluginUpdateApi()                                     {
  const data = await apiPost                                         (
    "./api/plugin-update/check",
    {},
    false,
    20_000
  );
  return data.overview;
}
async function applyPluginUpdateApi()                                     {
  const data = await apiPost                                         (
    "./api/plugin-update/apply",
    {},
    false,
    75_000
  );
  return data.overview;
}


// --- app.js ---





                                                     
                                                                  
                                                  

const PROJECT_PAGE_SIZE = 6;
const LINKED_PROJECTS_PREVIEW_LIMIT = 5;

                       
                     
                    
                   
                   
                 
 

                            
                           
                          
                         
                         
                       
 

                                
                     
                    
                    
                  
 

function getCurrentYyyymm(now = new Date())         {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}${m}`;
}

function getPrevYyyymm(now = new Date())         {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}${m}`;
}

function createEmptyClientSpendReport()              {
  const now = new Date();
  return {
    configured: false,
    invoiceMonth: getCurrentYyyymm(now),
    previousInvoiceMonth: getPrevYyyymm(now),
    queriedTables: [],
    queriedAt: now.toISOString(),
    totalsByCurrency: [],
    byBillingAccount: {},
    byProject: {},
  };
}

function createInitialOverviewShell()                            {
  return {
    auth: {
      authenticated: true,
      source: "none",
      gcloudInstalled: true,
      gcloudBinaryPath: null,
      activeAccount: null,
      maskedActiveAccount: null,
      activeProject: null,
      accounts: [],
      setupHint: null,
    },
    preferences: {
      pinnedProjects: [],
      billingExportTables: {},
      cacheTtlHours: 6,
      maskEmails: false,
      gcloudPathOverride: null,
      quotaProjectOverride: null,
      demoMode: false,
      locale: "auto",
      autoUpdatePlugin: true,
    },
    cache: {
      hit: false,
      stale: false,
      fetchedAt: null,
      ageMs: null,
      ttlMs: 6 * 3_600_000,
    },
    summary: {
      totalProjects: 0,
      billedProjects: 0,
      unbilledProjects: 0,
      pinnedProjectsCount: 0,
      totalBillingAccounts: 0,
      openBillingAccounts: 0,
      spendConfigured: false,
    },
    projects: [],
    billingAccounts: [],
    spend: createEmptyClientSpendReport(),
    warnings: [],
  };
}

                   
                                      
                             
                            
                                 
                                        
                                                              
                      
                       
                                      
                               
                        
                                                                    
                               
                           
                                  
                                        
                              
                             
                                                    
                                 
                        
                              
                       
                            
                            
                                    
                                     
                                
                                
                                         
                             
                             
                                           
                                                                    
                                          
                             
                                   
                                                                    
                                  
                      
                        
                                      
                           
     
 

const BILLING_MANUAL_SENTINEL = "__manual__";
const CLIENT_BILLING_ACCOUNT_ID_RE =
  /^(?:billingAccounts\/)?([A-Z0-9]{6}-[A-Z0-9]{6}-[A-Z0-9]{6})$/i;

function normalizeClientBillingAccountId(raw        )                {
  const match = CLIENT_BILLING_ACCOUNT_ID_RE.exec(raw.trim());
  return match ? match[1].toUpperCase() : null;
}

let activeLoadSeq = 0;

const state          = {
  overview: createInitialOverviewShell(),
  domainLoading: {
    bootstrap: true,
    projects: true,
    billing: true,
    budgets: false,
    spend: true,
  },
  domainLoaded: {
    bootstrap: false,
    projects: false,
    billing: false,
    budgets: false,
    spend: false,
  },
  domainErrors: {
    bootstrap: null,
    projects: null,
    billing: null,
    budgets: null,
    spend: null,
  },
  sectionWarnings: {
    projects: [],
    billing: [],
    budgets: [],
    spend: [],
  },
  projectBillingLinks: {},
  refreshing: false,
  activeTab: "overview",
  overviewMode: "projects",
  selectedInvoiceMonth: "",
  projectSearch: "",
  projectFilter: "all",
  projectSort: "smart",
  projectPageLimit: PROJECT_PAGE_SIZE,
  expandedProjectIds: new Set        (),
  expandedBillingLinkedIds: new Set        (),
  discoverHostProject: "",
  discoveringTables: false,
  discoveredTables: null,
  manualBillingAccountId: "*",
  manualTableId: "",
  enableTargetProject: "",
  enablingApi: false,
  signingInBrowser: false,
  settingsMenuOpen: false,
  settingsQuotaDraft: null,
  settingsGcloudDraft: null,
  checkingPluginUpdate: false,
  applyingPluginUpdate: false,
  editingBillingProjectId: null,
  billingPickerValue: "",
  billingManualInput: "",
  switchingBillingProjectId: null,
  billingSwitchError: null,
  deletingConfirmProjectId: null,
  deleteConfirmInput: "",
  deletingProjectId: null,
  deleteProjectError: null,
  recentlyDeletedProjects: [],
};

function isSpendExpected(overview                           )          {
  return (
    overview.preferences.demoMode ||
    Object.keys(overview.preferences.billingExportTables).length > 0 ||
    overview.spend.configured
  );
}

function isAnyCoreDomainLoading()          {
  return (
    state.domainLoading.bootstrap ||
    state.domainLoading.projects ||
    state.domainLoading.billing ||
    (isSpendExpected(state.overview) && state.domainLoading.spend)
  );
}

function showToast(message        , kind                               = "info")       {
  if (typeof document === "undefined" || !document) return;
  const root = document.getElementById("toast-root");
  if (!root) return;
  const item = h("div", { className: `toast toast-${kind}` }, message);
  root.appendChild(item);
  window.setTimeout(() => {
    item.remove();
  }, 3200);
}

function reconcileSpendSelection(spend             )       {
  const availableMonths =
    spend.availableMonths && spend.availableMonths.length > 0
      ? spend.availableMonths
      : [spend.invoiceMonth];
  if (state.selectedInvoiceMonth && !availableMonths.includes(state.selectedInvoiceMonth)) {
    state.selectedInvoiceMonth = "";
  }
}

function recomputeDerivedOverview()       {
  const ov = state.overview;
  const pinnedSet = new Set(ov.preferences.pinnedProjects);
  const globalExport = ov.preferences.billingExportTables["*"]?.tableId ?? null;
  const activeSourceProjects = ov.projects.filter(
    (p) => (p.lifecycleState || "ACTIVE").toUpperCase() === "ACTIVE"
  );
  const activeProjectIdSet = new Set(activeSourceProjects.map((p) => p.projectId));
  const openSourceAccounts = ov.billingAccounts.filter((ba) => ba.open);
  const baDisplayMap = new Map                ();
  for (const ba of openSourceAccounts) {
    baDisplayMap.set(ba.id, ba.displayName);
  }

  const spend = ov.spend;
  const nextAccounts                   = openSourceAccounts.map((ba) => {
    const linkedProjectIds = state.domainLoaded.projects
      ? ba.linkedProjectIds.filter((pid) => activeProjectIdSet.has(pid))
      : [...ba.linkedProjectIds];
    return {
      ...ba,
      open: true,
      linkedProjectIds,
      linkedProjectCount: linkedProjectIds.length,
      exportTableId: ov.preferences.billingExportTables[ba.id]?.tableId ?? globalExport,
    };
  });
  nextAccounts.sort((a, b) => {
    if (a.linkedProjectCount !== b.linkedProjectCount) {
      return b.linkedProjectCount - a.linkedProjectCount;
    }
    const spendA = spend.byBillingAccount[a.id]?.currentMonthNetCost ?? -1;
    const spendB = spend.byBillingAccount[b.id]?.currentMonthNetCost ?? -1;
    if (spendA !== spendB) return spendB - spendA;
    return a.displayName.localeCompare(b.displayName);
  });

  const nextProjects               = activeSourceProjects.map((p) => {
    const link = state.domainLoaded.billing ? state.projectBillingLinks[p.projectId] : undefined;
    const billingAccountId = link !== undefined ? link.billingAccountId : p.billingAccountId;
    const billingEnabled = link !== undefined ? link.billingEnabled : p.billingEnabled;
    return {
      ...p,
      billingAccountId,
      billingAccountName: billingAccountId
        ? (baDisplayMap.get(billingAccountId) ?? p.billingAccountName ?? billingAccountId)
        : null,
      billingEnabled,
      pinned: pinnedSet.has(p.projectId),
      isActiveProject: ov.auth.activeProject === p.projectId,
    };
  });

  nextProjects.sort((a, b) => {
    if (a.isActiveProject !== b.isActiveProject) return a.isActiveProject ? -1 : 1;
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const spendA = spend.byProject[a.projectId]?.currentMonthNetCost ?? -1;
    const spendB = spend.byProject[b.projectId]?.currentMonthNetCost ?? -1;
    if (spendA !== spendB) return spendB - spendA;
    return a.projectId.localeCompare(b.projectId);
  });

  const spendConfigured =
    spend.configured ||
    ov.preferences.demoMode ||
    Object.keys(ov.preferences.billingExportTables).length > 0;

  const combinedWarnings = [
    ...state.sectionWarnings.projects,
    ...state.sectionWarnings.billing,
    ...state.sectionWarnings.budgets,
    ...state.sectionWarnings.spend,
  ];

  state.overview = {
    ...ov,
    projects: nextProjects,
    billingAccounts: nextAccounts,
    summary: {
      totalProjects: nextProjects.length,
      billedProjects: nextProjects.filter((p) => p.billingEnabled).length,
      unbilledProjects: nextProjects.filter((p) => !p.billingEnabled).length,
      pinnedProjectsCount: nextProjects.filter((p) => p.pinned).length,
      totalBillingAccounts: nextAccounts.length,
      openBillingAccounts: nextAccounts.length,
      spendConfigured,
    },
    warnings: combinedWarnings,
  };
}

function applyFullOverview(data                           )       {
  activeLoadSeq++;
  const links                                         = {};
  for (const p of data.projects) {
    if (p.billingAccountId) {
      links[p.projectId] = {
        billingAccountId: p.billingAccountId,
        billingEnabled: p.billingEnabled,
      };
    }
  }
  state.projectBillingLinks = links;
  state.sectionWarnings = {
    projects: [],
    billing: [...data.warnings],
    budgets: [],
    spend: [],
  };
  state.domainLoading = {
    bootstrap: false,
    projects: false,
    billing: false,
    budgets: false,
    spend: false,
  };
  state.domainLoaded = {
    bootstrap: true,
    projects: true,
    billing: true,
    budgets: true,
    spend: true,
  };
  state.domainErrors = {
    bootstrap: null,
    projects: null,
    billing: null,
    budgets: null,
    spend: null,
  };
  state.overview = data;
  recomputeDerivedOverview();
  reconcileSpendSelection(state.overview.spend);
  if (state.overview.preferences.locale) {
    setLocalePreference(state.overview.preferences.locale);
  }
  if (!state.discoverHostProject && state.overview.auth.activeProject) {
    state.discoverHostProject = state.overview.auth.activeProject;
  }
  if (
    state.enableTargetProject &&
    !state.overview.projects.some((p) => p.projectId === state.enableTargetProject)
  ) {
    state.enableTargetProject = "";
  }
  if (state.manualBillingAccountId === "*" && state.overview.billingAccounts.length === 1) {
    state.manualBillingAccountId = state.overview.billingAccounts[0].id;
  }
}

function applyLocalMutationOverview(data                           )       {
  state.overview = {
    ...state.overview,
    auth: data.auth,
    preferences: data.preferences,
    pluginUpdate: data.pluginUpdate ?? state.overview.pluginUpdate,
  };
  if (data.preferences.locale) {
    setLocalePreference(data.preferences.locale);
  }
  recomputeDerivedOverview();
}

function applyProjectBillingUpdate(
  res                                                                      
)       {
  state.projectBillingLinks[res.projectId] = {
    billingAccountId: res.billingAccountId,
    billingEnabled: res.billingEnabled,
  };
  const nextBillingAccounts =
    res.overview.billingAccounts.length > 0
      ? res.overview.billingAccounts
      : state.overview.billingAccounts;
  state.overview = {
    ...state.overview,
    auth: res.overview.auth,
    preferences: res.overview.preferences,
    billingAccounts: nextBillingAccounts,
    pluginUpdate: res.overview.pluginUpdate ?? state.overview.pluginUpdate,
  };
  recomputeDerivedOverview();
}

function applyProjectDeleteUpdate(
  res                                                               
)       {
  delete state.projectBillingLinks[res.projectId];
  state.expandedProjectIds.delete(res.projectId);
  if (state.editingBillingProjectId === res.projectId) {
    state.editingBillingProjectId = null;
    state.billingPickerValue = "";
    state.billingManualInput = "";
    state.billingSwitchError = null;
  }
  const remainingProjects = state.overview.projects.filter((p) => p.projectId !== res.projectId);
  const nextBillingAccounts =
    res.overview.billingAccounts.length > 0
      ? res.overview.billingAccounts
      : state.overview.billingAccounts.map((ba) => {
          const filteredLinked = ba.linkedProjectIds.filter((id) => id !== res.projectId);
          return {
            ...ba,
            linkedProjectIds: filteredLinked,
            linkedProjectCount: filteredLinked.length,
          };
        });
  if (res.wasActiveProject) {
    const staleWarn = `Active gcloud project "${res.projectId}" is deleted or inaccessible. Consider switching to an active project.`;
    if (!state.sectionWarnings.projects.includes(staleWarn)) {
      state.sectionWarnings.projects = [...state.sectionWarnings.projects, staleWarn];
    }
  }
  state.overview = {
    ...state.overview,
    auth: res.overview.auth,
    preferences: res.overview.preferences,
    projects: remainingProjects,
    billingAccounts: nextBillingAccounts,
    pluginUpdate: res.overview.pluginUpdate ?? state.overview.pluginUpdate,
  };
  recomputeDerivedOverview();
}

function handleDomainAuthExpired(expiredAuth            )       {
  activeLoadSeq++;
  state.overview = {
    ...createInitialOverviewShell(),
    auth: expiredAuth,
    preferences: state.overview.preferences,
    pluginUpdate: state.overview.pluginUpdate,
  };
  state.domainLoading = {
    bootstrap: false,
    projects: false,
    billing: false,
    budgets: false,
    spend: false,
  };
  state.domainLoaded = {
    bootstrap: true,
    projects: false,
    billing: false,
    budgets: false,
    spend: false,
  };
  state.refreshing = false;
  renderApp();
}

async function runBudgetsTask(seq        , forceRefresh         )                {
  state.domainLoading.budgets = true;
  state.domainErrors.budgets = null;
  renderApp();
  try {
    const res = await fetchBudgetsSection(forceRefresh);
    if (seq !== activeLoadSeq) return;
    if (res.authenticated) {
      state.overview = {
        ...state.overview,
        billingAccounts: state.overview.billingAccounts.map((ba) => ({
          ...ba,
          budgets: res.budgetsByAccount[ba.id] ?? ba.budgets ?? [],
        })),
      };
      state.sectionWarnings.budgets = res.warnings ?? [];
      state.domainLoaded.budgets = true;
    }
  } catch (err) {
    if (seq !== activeLoadSeq) return;
    state.domainErrors.budgets = err instanceof Error ? err.message : t("toast.loadFailed");
  } finally {
    if (seq === activeLoadSeq) {
      state.domainLoading.budgets = false;
      recomputeDerivedOverview();
      renderApp();
    }
  }
}

async function runProjectsTask(seq        , forceRefresh         )                {
  try {
    const res = await fetchProjectsSection(forceRefresh);
    if (seq !== activeLoadSeq) return;
    if (res.authExpired && res.auth) {
      handleDomainAuthExpired(res.auth);
      return;
    }
    if (res.authenticated && Array.isArray(res.projects)) {
      state.overview = {
        ...state.overview,
        projects: res.projects,
        cache: res.cache ?? state.overview.cache,
      };
      state.sectionWarnings.projects = res.warnings ?? [];
      if (
        state.enableTargetProject &&
        !res.projects.some((p) => p.projectId === state.enableTargetProject)
      ) {
        state.enableTargetProject = "";
      }
      state.domainLoaded.projects = true;
      state.domainErrors.projects = null;
    }
  } catch (err) {
    if (seq !== activeLoadSeq) return;
    state.domainErrors.projects = err instanceof Error ? err.message : t("toast.loadFailed");
  } finally {
    if (seq === activeLoadSeq) {
      state.domainLoading.projects = false;
      recomputeDerivedOverview();
      renderApp();
    }
  }
}

async function runBillingTask(seq        , forceRefresh         )                {
  try {
    const res = await fetchBillingSection(forceRefresh);
    if (seq !== activeLoadSeq) return;
    if (res.authExpired && res.auth) {
      handleDomainAuthExpired(res.auth);
      return;
    }
    if (res.authenticated && Array.isArray(res.billingAccounts)) {
      state.projectBillingLinks = res.projectBillingLinks ?? {};
      state.overview = {
        ...state.overview,
        billingAccounts: res.billingAccounts,
        cache: res.cache ?? state.overview.cache,
      };
      state.sectionWarnings.billing = res.warnings ?? [];
      if (state.manualBillingAccountId === "*" && res.billingAccounts.length === 1) {
        state.manualBillingAccountId = res.billingAccounts[0].id;
      }
      state.domainLoaded.billing = true;
      state.domainErrors.billing = null;

      if (res.billingAccounts.length > 0 && !res.budgetsLoaded) {
        void runBudgetsTask(seq, forceRefresh);
      } else {
        state.domainLoaded.budgets = true;
        state.domainLoading.budgets = false;
      }
    }
  } catch (err) {
    if (seq !== activeLoadSeq) return;
    state.domainErrors.billing = err instanceof Error ? err.message : t("toast.loadFailed");
  } finally {
    if (seq === activeLoadSeq) {
      state.domainLoading.billing = false;
      recomputeDerivedOverview();
      renderApp();
    }
  }
}

async function runSpendTask(seq        , forceRefresh         )                {
  try {
    const res = await fetchSpendSection(forceRefresh);
    if (seq !== activeLoadSeq) return;
    if (res.authExpired && res.auth) {
      handleDomainAuthExpired(res.auth);
      return;
    }
    if (res.authenticated && res.spend) {
      state.overview = {
        ...state.overview,
        spend: res.spend,
        cache: res.cache ?? state.overview.cache,
      };
      state.sectionWarnings.spend = res.warnings ?? [];
      reconcileSpendSelection(res.spend);
      state.domainLoaded.spend = true;
      state.domainErrors.spend = null;
    }
  } catch (err) {
    if (seq !== activeLoadSeq) return;
    state.domainErrors.spend = err instanceof Error ? err.message : t("toast.loadFailed");
  } finally {
    if (seq === activeLoadSeq) {
      state.domainLoading.spend = false;
      recomputeDerivedOverview();
      renderApp();
    }
  }
}

async function retryProjectsDomain()                {
  state.domainLoading.projects = true;
  state.domainErrors.projects = null;
  renderApp();
  await runProjectsTask(activeLoadSeq, true);
}

async function retryBillingDomain()                {
  state.domainLoading.billing = true;
  state.domainErrors.billing = null;
  renderApp();
  await runBillingTask(activeLoadSeq, true);
}

async function retrySpendDomain()                {
  state.domainLoading.spend = true;
  state.domainErrors.spend = null;
  renderApp();
  await runSpendTask(activeLoadSeq, true);
}

async function loadData(
  forceRefresh = false,
  options                              = {}
)                {
  const seq = ++activeLoadSeq;
  if (forceRefresh) {
    state.refreshing = true;
  }

  if (options.resetSections) {
    state.projectBillingLinks = {};
    state.sectionWarnings = { projects: [], billing: [], budgets: [], spend: [] };
    state.deletingConfirmProjectId = null;
    state.deleteConfirmInput = "";
    state.deletingProjectId = null;
    state.deleteProjectError = null;
    state.recentlyDeletedProjects = [];
    state.overview = {
      ...state.overview,
      projects: [],
      billingAccounts: [],
      spend: createEmptyClientSpendReport(),
      warnings: [],
    };
    state.domainLoaded = {
      bootstrap: state.domainLoaded.bootstrap,
      projects: false,
      billing: false,
      budgets: false,
      spend: false,
    };
    recomputeDerivedOverview();
  }

  state.domainLoading = {
    bootstrap: true,
    projects: true,
    billing: true,
    budgets: false,
    spend: true,
  };
  state.domainErrors = {
    bootstrap: null,
    projects: null,
    billing: null,
    budgets: null,
    spend: null,
  };
  renderApp();

  const pProjects = runProjectsTask(seq, forceRefresh);
  const pBilling = runBillingTask(seq, forceRefresh);
  const pSpend = runSpendTask(seq, forceRefresh);

  const pBootstrap = (async () => {
    try {
      const boot = await fetchBootstrap(forceRefresh);
      if (seq !== activeLoadSeq) return;

      // Fallback for mocked environments that only implement monolithic `/api/overview`
      if (!boot || !boot.auth || !boot.preferences) {
        const legacyOverview = await fetchOverview(forceRefresh);
        if (seq !== activeLoadSeq) return;
        applyFullOverview(legacyOverview);
        state.refreshing = false;
        if (forceRefresh) {
          showToast(t("toast.refreshed"), "success");
        }
        renderApp();
        return;
      }

      if (boot.preferences.locale) {
        setLocalePreference(boot.preferences.locale);
      }
      if (!state.discoverHostProject && boot.auth.activeProject) {
        state.discoverHostProject = boot.auth.activeProject;
      }

      // Stale-while-revalidate: pre-hydrate expired disk snapshot immediately while live section tasks finish
      if (!forceRefresh && boot.cachedOverview) {
        const stale = boot.cachedOverview;
        if (!state.domainLoaded.projects) {
          state.overview.projects = stale.projects;
          state.domainLoaded.projects = true;
        }
        if (!state.domainLoaded.billing) {
          const staleLinks                                         = {};
          for (const p of stale.projects) {
            if (p.billingAccountId) {
              staleLinks[p.projectId] = {
                billingAccountId: p.billingAccountId,
                billingEnabled: p.billingEnabled,
              };
            }
          }
          state.projectBillingLinks = staleLinks;
          state.overview.billingAccounts = stale.billingAccounts;
          state.domainLoaded.billing = true;
          state.domainLoaded.budgets = true;
        }
        if (!state.domainLoaded.spend) {
          state.overview.spend = stale.spend;
          reconcileSpendSelection(stale.spend);
          state.domainLoaded.spend = true;
        }
        state.overview.cache = stale.cache;
      }

      state.overview = {
        ...state.overview,
        auth: boot.auth,
        preferences: boot.preferences,
        pluginUpdate: boot.pluginUpdate ?? state.overview.pluginUpdate,
      };
      state.domainLoaded.bootstrap = true;
      state.domainLoading.bootstrap = false;

      if (!boot.auth.authenticated && !boot.preferences.demoMode) {
        state.domainLoading = {
          bootstrap: false,
          projects: false,
          billing: false,
          budgets: false,
          spend: false,
        };
      } else if (!boot.spendConfigured && !boot.preferences.demoMode) {
        state.domainLoaded.spend = true;
        state.domainLoading.spend = false;
      }

      recomputeDerivedOverview();
      renderApp();
    } catch (err) {
      if (seq !== activeLoadSeq) return;
      state.domainErrors.bootstrap = err instanceof Error ? err.message : t("toast.loadFailed");
      state.domainLoading = {
        bootstrap: false,
        projects: false,
        billing: false,
        budgets: false,
        spend: false,
      };
      showToast(state.domainErrors.bootstrap, "error");
      renderApp();
    }
  })();

  await Promise.allSettled([pBootstrap, pProjects, pBilling, pSpend]);
  if (seq === activeLoadSeq) {
    state.refreshing = false;
    const anyError =
      state.domainErrors.bootstrap ||
      state.domainErrors.projects ||
      state.domainErrors.billing ||
      state.domainErrors.spend;
    if (forceRefresh && !anyError) {
      showToast(t("toast.refreshed"), "success");
    }
    renderApp();
  }
}

function renderSectionLoadingPill(label        )              {
  return h(
    "span",
    { className: "section-loading-pill" },
    h("span", { className: "spinner-xs", ariaHidden: "true" }),
    h("span", null, label)
  );
}

function renderSectionErrorCard(message        , onRetry            )              {
  return h(
    "section",
    { className: "card warning-card" },
    h(
      "div",
      { className: "inline-error-row" },
      h("span", { className: "warning-line" }, message),
      h(
        "button",
        {
          type: "button",
          className: "btn btn-xs btn-primary",
          onClick: onRetry,
        },
        t("loading.sectionErrorRetry")
      )
    )
  );
}

function renderHeroSpendSkeletonCard(statusLabel         )              {
  return h(
    "section",
    { className: "card skeleton-card", ariaBusy: "true" },
    h(
      "div",
      { className: "hero-top-row" },
      h("span", { className: "skeleton sk-line-sm", ariaHidden: "true" }),
      statusLabel ? renderSectionLoadingPill(statusLabel) : null
    ),
    h("div", { className: "skeleton sk-hero-amt", ariaHidden: "true" }),
    h(
      "div",
      { className: "hero-submetrics", ariaHidden: "true" },
      h("span", { className: "skeleton sk-pill-md" }),
      h("span", { className: "skeleton sk-pill-sm" })
    ),
    h("div", { className: "skeleton sk-chart-box", ariaHidden: "true" })
  );
}

function renderBreakdownSkeletonCard()              {
  return h(
    "section",
    { className: "card skeleton-card", ariaBusy: "true", ariaHidden: "true" },
    h(
      "div",
      { className: "section-header-row" },
      h("span", { className: "skeleton sk-line-sm" }),
      h("span", { className: "skeleton sk-pill-md" })
    ),
    ...Array.from({ length: 3 }, () =>
      h(
        "div",
        { className: "skeleton-row" },
        h(
          "div",
          { className: "skeleton-stack" },
          h("span", { className: "skeleton sk-line-md" }),
          h("span", { className: "skeleton sk-line-xs" })
        ),
        h("span", { className: "skeleton sk-amt-sm" })
      )
    )
  );
}

function renderProjectCardsSkeleton(count = 4)                {
  return [
    h(
      "div",
      { className: "section-header-row" },
      renderSectionLoadingPill(t("loading.projects"))
    ),
    ...Array.from({ length: count }, () =>
      h(
        "article",
        { className: "card project-card skeleton-card", ariaBusy: "true", ariaHidden: "true" },
        h(
          "div",
          { className: "skeleton-row" },
          h(
            "div",
            { className: "skeleton-stack" },
            h("span", { className: "skeleton sk-line-md" }),
            h("span", { className: "skeleton sk-line-sm" })
          ),
          h("span", { className: "skeleton sk-amt-sm" })
        )
      )
    ),
  ];
}

function renderBillingCardsSkeleton(count = 2)              {
  return h(
    "div",
    { className: "stack-list", ariaBusy: "true" },
    h(
      "div",
      { className: "section-header-row" },
      renderSectionLoadingPill(t("loading.billing"))
    ),
    ...Array.from({ length: count }, () =>
      h(
        "article",
        { className: "card billing-card skeleton-card", ariaHidden: "true" },
        h(
          "div",
          { className: "skeleton-row" },
          h(
            "div",
            { className: "skeleton-stack" },
            h("span", { className: "skeleton sk-line-md" }),
            h("span", { className: "skeleton sk-line-xs" })
          ),
          h("span", { className: "skeleton sk-pill-sm" })
        ),
        h("div", { className: "skeleton sk-chart-box" })
      )
    )
  );
}

function isCloudBillingApiDisabled(overview                           )          {
  return (
    overview.billingAccounts.length === 0 &&
    overview.warnings.some((w) =>
      /cloudbilling\.googleapis\.com|Cloud Billing API has not been used|requires a quota project/i.test(
        w
      )
    )
  );
}

function getNonBillingApiWarnings(overview                           )           {
  if (!isCloudBillingApiDisabled(overview)) {
    return overview.warnings;
  }
  return overview.warnings.filter(
    (w) =>
      !/cloudbilling\.googleapis\.com|Cloud Billing API has not been used|requires a quota project/i.test(
        w
      )
  );
}

function getPreferredConsoleProject(overview                           )         {
  const activeValid = overview.projects.some((p) => p.projectId === overview.auth.activeProject)
    ? overview.auth.activeProject
    : null;
  return (
    state.enableTargetProject ||
    overview.preferences.quotaProjectOverride ||
    activeValid ||
    overview.auth.activeProject ||
    overview.projects[0]?.projectId ||
    ""
  );
}

function withConsoleProject(url        , projectId                           )         {
  if (!projectId) return url;
  if (/[?&]project=/.test(url)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}project=${encodeURIComponent(projectId)}`;
}

function renderBillingApiSetupPrompt(overview                           )                     {
  if (!isCloudBillingApiDisabled(overview)) {
    return null;
  }

  const selectedProj = getPreferredConsoleProject(overview);

  // Use `/apis/api/<service>/overview?project=...` rather than `/apis/library/...` because GCP Console's
  // `/apis/library/...` redirects to `/marketplace/product/...` and drops `project=`, falling back to the last-visited project.
  const consoleUrl = withConsoleProject(
    "https://console.cloud.google.com/apis/api/cloudbilling.googleapis.com/overview",
    selectedProj
  );

  return h(
    "section",
    { className: "card api-setup-card" },
    h(
      "div",
      { className: "api-setup-header" },
      h("span", { className: "badge badge-warn" }, t("billingApi.badge")),
      h("h3", { className: "section-title" }, t("billingApi.title"))
    ),
    h("p", { className: "card-desc" }, t("billingApi.desc")),
    overview.projects.length > 0
      ? h(
          "label",
          { className: "field-label api-setup-field" },
          t("billingApi.quotaProjectLabel"),
          h(
            "select",
            {
              className: "compact-select full-width",
              disabled: state.enablingApi,
              onChange: (ev) => {
                state.enableTargetProject = (ev.target                     ).value;
                renderApp();
              },
            },
            ...overview.projects.map((p) =>
              h(
                "option",
                {
                  value: p.projectId,
                  selected: p.projectId === selectedProj,
                },
                `${p.name} (${p.projectId})`
              )
            )
          )
        )
      : null,
    h(
      "div",
      { className: "action-row" },
      selectedProj
        ? h(
            "button",
            {
              type: "button",
              className: "btn btn-primary btn-sm",
              disabled: state.enablingApi,
              onClick: async () => {
                try {
                  state.enablingApi = true;
                  renderApp();
                  showToast(t("toast.enablingBillingApi", { project: selectedProj }), "info");
                  const updated = await enableGcpServiceApi(
                    selectedProj,
                    "cloudbilling.googleapis.com"
                  );
                  applyFullOverview(updated);
                  showToast(t("toast.enabledBillingApi"), "success");
                } catch (err) {
                  showToast(
                    err instanceof Error ? err.message : t("toast.enableBillingApiFailed"),
                    "error"
                  );
                } finally {
                  state.enablingApi = false;
                  renderApp();
                }
              },
            },
            state.enablingApi
              ? t("billingApi.enablingBtn")
              : t("billingApi.enableBtn", { project: selectedProj })
          )
        : null,
      h(
        "a",
        {
          className: "btn btn-sm",
          href: consoleUrl,
          target: "_blank",
          rel: "noopener noreferrer",
        },
        selectedProj
          ? t("billingApi.openConsoleProject", { project: selectedProj })
          : t("billingApi.openConsole")
      ),
      h(
        "button",
        {
          type: "button",
          className: "btn btn-sm",
          disabled: state.refreshing || state.enablingApi,
          onClick: () => {
            void loadData(true);
          },
        },
        t("header.refresh")
      )
    )
  );
}

function renderDeltaBadge(delta               )              {
  if (delta === null || !Number.isFinite(delta)) {
    return h("span", { className: "badge badge-neutral" }, t("spend.noBaseline"));
  }
  const sign = delta > 0 ? "+" : "";
  const cls =
    delta > 10
      ? "badge badge-warn"
      : delta < -2
        ? "badge badge-good"
        : "badge badge-neutral";
  return h("span", { className: cls }, t("spend.vsPrevMtd", { delta: `${sign}${delta.toFixed(1)}` }));
}

function renderLanguageSelect()              {
  const currentPref = getLocalePreference();
  return h(
    "select",
    {
      className: "compact-select full-width",
      ariaLabel: t("settings.languageLabel"),
      title: t("header.languageTitle"),
      onChange: async (ev) => {
        const nextPref = (ev.target                     ).value                    ;
        if (nextPref === currentPref) return;
        setLocalePreference(nextPref);
        renderApp();
        try {
          const updated = await updateCompanionPreferences({ locale: nextPref });
          applyLocalMutationOverview(updated);
          renderApp();
          showToast(t("toast.languageUpdated"), "success");
        } catch (err) {
          showToast(
            err instanceof Error ? err.message : t("toast.prefUpdateFailed"),
            "error"
          );
        }
      },
    },
    h("option", { value: "auto", selected: currentPref === "auto" }, t("locale.autoFull")),
    ...SUPPORTED_LOCALES.map((loc) =>
      h("option", { value: loc.code, selected: currentPref === loc.code }, loc.nativeName)
    )
  );
}

async function handleToggleDemoMode(nextDemo         , toastMessage        )                {
  try {
    state.selectedInvoiceMonth = "";
    state.overview = {
      ...state.overview,
      preferences: {
        ...state.overview.preferences,
        demoMode: nextDemo,
      },
    };
    const boot = await updateCloudPreferencesProgressive({ demoMode: nextDemo });
    state.overview = {
      ...state.overview,
      auth: boot.auth,
      preferences: boot.preferences,
      pluginUpdate: boot.pluginUpdate ?? state.overview.pluginUpdate,
    };
    showToast(toastMessage, "info");
    await loadData(false, { resetSections: true });
  } catch (err) {
    showToast(err instanceof Error ? err.message : t("toast.prefUpdateFailed"), "error");
    renderApp();
  }
}

async function handleInstallPluginUpdate()                {
  if (state.applyingPluginUpdate) return;
  try {
    state.applyingPluginUpdate = true;
    renderApp();
    const updated = await applyPluginUpdateApi();
    applyLocalMutationOverview(updated);
    const newVer =
      state.overview.pluginUpdate?.updatedToVersion ||
      state.overview.pluginUpdate?.latestVersion ||
      state.overview.pluginUpdate?.currentVersion ||
      "latest";
    showToast(t("toast.updateInstalled", { version: newVer }), "success");
  } catch (err) {
    showToast(err instanceof Error ? err.message : t("toast.updateFailed"), "error");
  } finally {
    state.applyingPluginUpdate = false;
    renderApp();
  }
}

async function handleCheckPluginUpdate()                {
  if (state.checkingPluginUpdate) return;
  try {
    state.checkingPluginUpdate = true;
    renderApp();
    const updated = await checkPluginUpdateApi();
    applyLocalMutationOverview(updated);
    const upd = state.overview.pluginUpdate;
    if (upd?.error) {
      showToast(upd.error, "error");
    } else if (upd?.restartRequired && upd.updatedToVersion) {
      showToast(t("toast.updateInstalled", { version: upd.updatedToVersion }), "success");
    } else if (upd?.updateAvailable && upd.latestVersion) {
      showToast(t("toast.updateAvailable", { version: upd.latestVersion }), "info");
    } else if (upd) {
      showToast(t("toast.upToDate", { version: upd.currentVersion }), "success");
    }
  } catch (err) {
    showToast(err instanceof Error ? err.message : t("toast.updateFailed"), "error");
  } finally {
    state.checkingPluginUpdate = false;
    renderApp();
  }
}

function renderHeaderUpdateBadge(overview                           )                     {
  const upd = overview.pluginUpdate;
  if (!upd) return null;

  if (upd.restartRequired && upd.updatedToVersion) {
    return h(
      "span",
      {
        className: "badge badge-good",
        title: t("update.headerUpdatedTitle", { version: upd.updatedToVersion }),
      },
      t("update.headerUpdatedBadge", { version: upd.updatedToVersion })
    );
  }

  if (upd.updateAvailable && upd.latestVersion) {
    return h(
      "button",
      {
        type: "button",
        className: "badge badge-update",
        disabled: state.applyingPluginUpdate,
        title: t("update.headerBadgeTitle", { version: upd.latestVersion }),
        onClick: () => handleInstallPluginUpdate(),
      },
      state.applyingPluginUpdate
        ? t("update.installingBtn")
        : t("update.headerBadgeAvailable", { version: upd.latestVersion })
    );
  }

  return null;
}

function renderHeader(overview                           )              {
  const mask = overview.preferences.maskEmails;
  const syncing = state.refreshing || isAnyCoreDomainLoading();
  const accountOptions = overview.auth.accounts.map((acct) =>
    h(
      "option",
      {
        value: acct.account,
        selected: acct.account === overview.auth.activeAccount,
      },
      mask ? acct.maskedAccount : acct.account
    )
  );

  const accountBar = !state.domainLoaded.bootstrap
    ? h(
        "div",
        { className: "context-row", ariaHidden: "true" },
        h(
          "div",
          { className: "context-item context-account" },
          h("span", { className: "context-label" }, t("header.account")),
          h("span", { className: "skeleton sk-pill-lg" })
        ),
        h(
          "div",
          { className: "context-item context-project" },
          h("span", { className: "context-label" }, t("header.activeProject")),
          h("span", { className: "skeleton sk-pill-md" })
        )
      )
    : overview.auth.accounts.length > 0
      ? h(
          "div",
          { className: "context-row" },
          h(
            "div",
            { className: "context-item context-account" },
            h("span", { className: "context-label" }, t("header.account")),
            h(
              "select",
              {
                className: "compact-select",
                ariaLabel: t("header.accountAria"),
                disabled: state.refreshing || overview.preferences.demoMode,
                onChange: async (ev) => {
                  const target = ev.target                     ;
                  const nextAcct = target.value;
                  if (!nextAcct || nextAcct === overview.auth.activeAccount) return;
                  try {
                    state.selectedInvoiceMonth = "";
                    await switchActiveAccountProgressive(nextAcct);
                    showToast(t("toast.switchedAccount"), "success");
                    await loadData(false, { resetSections: true });
                  } catch (err) {
                    showToast(
                      err instanceof Error ? err.message : t("toast.switchAccountFailed"),
                      "error"
                    );
                    renderApp();
                  }
                },
              },
              ...accountOptions
            ),
            h(
              "button",
              {
                type: "button",
                className: "icon-btn",
                title: mask ? t("header.showEmailTitle") : t("header.maskEmailTitle"),
                ariaLabel: mask ? t("header.showEmailAria") : t("header.maskEmailAria"),
                onClick: async () => {
                  const nextMask = !mask;
                  state.overview = {
                    ...state.overview,
                    preferences: { ...state.overview.preferences, maskEmails: nextMask },
                  };
                  renderApp();
                  try {
                    const updated = await updateCompanionPreferences({ maskEmails: nextMask });
                    applyLocalMutationOverview(updated);
                    renderApp();
                  } catch (err) {
                    showToast(
                      err instanceof Error ? err.message : t("toast.prefUpdateFailed"),
                      "error"
                    );
                  }
                },
              },
              mask ? "👁" : "🙈"
            )
          ),
          h(
            "div",
            { className: "context-item context-project" },
            h("span", { className: "context-label" }, t("header.activeProject")),
            overview.auth.activeProject
              ? h(
                  "button",
                  {
                    type: "button",
                    className: "project-pill-btn",
                    title: t("header.copyProjectTitle"),
                    onClick: async () => {
                      if (!overview.auth.activeProject) return;
                      const ok = await copyToClipboard(overview.auth.activeProject);
                      showToast(
                        ok
                          ? t("toast.copied", { value: overview.auth.activeProject })
                          : overview.auth.activeProject,
                        "info"
                      );
                    },
                  },
                  overview.auth.activeProject
                )
              : h("span", { className: "muted-inline" }, t("header.unset"))
          )
        )
      : null;

  return h(
    "header",
    { className: "top-header" },
    h(
      "div",
      { className: "brand-row" },
      h(
        "div",
        { className: "brand-left" },
        h("img", { className: "brand-logo" }),
        h("span", { className: "brand-title" }, "GCP Companion"),
        renderHeaderUpdateBadge(overview),
        overview.preferences.demoMode
          ? h(
              "button",
              {
                type: "button",
                className: "badge badge-demo",
                title: t("header.demoExitTitle"),
                onClick: () => {
                  void handleToggleDemoMode(false, t("toast.exitedDemo"));
                },
              },
              t("header.demoBadge")
            )
          : null
      ),
      h(
        "div",
        { className: "brand-right" },
        syncing
          ? renderSectionLoadingPill(t("header.syncing"))
          : h(
              "span",
              { className: "sync-age", title: overview.cache.fetchedAt || "" },
              formatRelativeAge(overview.cache.ageMs, overview.cache.stale)
            ),
        h(
          "button",
          {
            type: "button",
            className: state.refreshing ? "btn btn-sm btn-spinning" : "btn btn-sm",
            disabled: state.refreshing,
            title: t("header.refreshTitle"),
            onClick: () => {
              void loadData(true);
            },
          },
          state.refreshing ? t("header.syncing") : t("header.refresh")
        ),
        h(
          "button",
          {
            type: "button",
            className: state.settingsMenuOpen ? "btn btn-sm btn-settings-open" : "btn btn-sm",
            ariaExpanded: String(state.settingsMenuOpen),
            title: t("header.settingsTitle"),
            onClick: () => {
              state.settingsMenuOpen = !state.settingsMenuOpen;
              renderApp();
            },
          },
          t("header.settingsBtn")
        )
      )
    ),
    accountBar
  );
}

const LOGO_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none"><rect width="64" height="64" rx="16" fill="#1A73E8" fill-opacity="0.12"/><path d="M45.5 27.2C44.1 19.7 37.5 14 29.5 14C21.3 14 14.5 20 13.3 27.9C8.6 29.1 5.2 33.4 5.2 38.5C5.2 44.6 10.1 49.5 16.2 49.5H44.8C50.3 49.5 54.8 45 54.8 39.5C54.8 33.2 50.8 28.2 45.5 27.2Z" fill="#4285F4" fill-opacity="0.22" stroke="#4285F4" stroke-width="2.5" stroke-linejoin="round"/><rect x="20" y="33" width="5" height="11" rx="2" fill="#34A853"/><rect x="28.5" y="27" width="5" height="17" rx="2" fill="#FBBC04"/><rect x="37" y="22" width="5" height="22" rx="2" fill="#EA4335"/><path d="M19 25L27 21L34 23L42 16" stroke="#1A73E8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="42" cy="16" r="2.8" fill="#1A73E8"/></svg>'
  );

function bindLogoSources(container             )       {
  const imgs = container.querySelectorAll("img.brand-logo");
  imgs.forEach((node) => {
    if (node instanceof HTMLImageElement) {
      node.src = LOGO_DATA_URI;
      node.alt = "";
      node.width = 20;
      node.height = 20;
    }
  });
}

function renderCopyCommandBox(label        , command        )              {
  return h(
    "div",
    { className: "cmd-group" },
    h("div", { className: "eyebrow" }, label),
    h(
      "div",
      { className: "cmd-box" },
      h("code", null, command),
      h(
        "button",
        {
          type: "button",
          className: "btn btn-xs",
          onClick: async () => {
            const ok = await copyToClipboard(command);
            showToast(ok ? t("toast.copied", { value: `\`${command}\`` }) : command, "info");
          },
        },
        t("common.copy")
      )
    )
  );
}

function renderUnauthenticatedView(overview                           )              {
  const installDocsUrl = "https://cloud.google.com/sdk/docs/install";
  const brewInstallCmd = "brew install --cask gcloud-cli";
  const loginCmd = "gcloud auth login";
  const localizedHint = localizeSetupHint(overview.auth.setupHint);

  if (!overview.auth.gcloudInstalled) {
    return h(
      "section",
      { className: "card onboarding-card" },
      h(
        "div",
        { className: "api-setup-header" },
        h("span", { className: "badge badge-warn" }, t("onboard.step1Badge")),
        h("h2", { className: "card-title" }, t("onboard.step1Title"))
      ),
      h("p", { className: "card-desc" }, t("onboard.step1Desc")),
      h(
        "div",
        { className: "setup-checklist" },
        h(
          "div",
          { className: "setup-step setup-step-active" },
          h("span", { className: "step-pill step-pill-warn" }, "1"),
          h(
            "div",
            { className: "setup-step-body" },
            h("div", { className: "row-primary-text" }, t("onboard.step1Check1Title")),
            h("div", { className: "muted-micro" }, t("onboard.step1Check1Desc"))
          )
        ),
        h(
          "div",
          { className: "setup-step" },
          h("span", { className: "step-pill" }, "2"),
          h(
            "div",
            { className: "setup-step-body" },
            h("div", { className: "row-primary-text" }, t("onboard.step1Check2Title")),
            h("div", { className: "muted-micro" }, t("onboard.step1Check2Desc"))
          )
        )
      ),
      h(
        "div",
        { className: "action-row onboarding-links" },
        h(
          "a",
          {
            className: "btn btn-primary",
            href: installDocsUrl,
            target: "_blank",
            rel: "noopener noreferrer",
          },
          t("onboard.downloadInstallBtn")
        )
      ),
      renderCopyCommandBox(t("onboard.homebrewLabel"), brewInstallCmd),
      renderCopyCommandBox(t("onboard.signInAfterInstallLabel"), loginCmd),
      h(
        "div",
        { className: "action-row" },
        h(
          "button",
          {
            type: "button",
            className: "btn btn-primary",
            disabled: state.refreshing,
            onClick: () => {
              void loadData(true);
            },
          },
          state.refreshing ? t("common.checking") : t("onboard.recheckCliBtn")
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn",
            onClick: () => {
              void handleToggleDemoMode(true, t("toast.demoEnabled"));
            },
          },
          t("onboard.previewDemoBtn")
        )
      ),
      renderSettingsDetails(overview)
    );
  }

  // `gcloud` CLI is installed, but no active Google account is authenticated yet (or session expired)
  return h(
    "section",
    { className: "card onboarding-card" },
    h(
      "div",
      { className: "api-setup-header" },
      h("span", { className: "badge badge-warn" }, t("onboard.step2Badge")),
      h("h2", { className: "card-title" }, t("onboard.step2Title"))
    ),
    h("p", { className: "card-desc" }, t("onboard.step2Desc")),
    h(
      "div",
      { className: "setup-checklist" },
      h(
        "div",
        { className: "setup-step" },
        h("span", { className: "step-pill step-pill-done" }, "✓"),
        h(
          "div",
          { className: "setup-step-body" },
          h("div", { className: "row-primary-text" }, t("onboard.cliDetectedTitle")),
          h(
            "div",
            { className: "row-mono" },
            overview.auth.gcloudBinaryPath || "gcloud"
          )
        )
      ),
      h(
        "div",
        { className: "setup-step setup-step-active" },
        h("span", { className: "step-pill step-pill-warn" }, "2"),
        h(
          "div",
          { className: "setup-step-body" },
          h("div", { className: "row-primary-text" }, t("onboard.authAccountTitle")),
          h("div", { className: "muted-micro" }, t("onboard.authAccountDesc"))
        )
      )
    ),
    localizedHint ? h("div", { className: "callout callout-info" }, localizedHint) : null,
    h(
      "div",
      { className: "action-row onboarding-links" },
      h(
        "button",
        {
          type: "button",
          className: "btn btn-primary",
          disabled: state.signingInBrowser || state.refreshing,
          onClick: async () => {
            try {
              state.signingInBrowser = true;
              renderApp();
              showToast(t("toast.openingBrowserSignIn"), "info");
              const signedInOverview = await startBrowserLoginApi();
              applyFullOverview(signedInOverview);
              showToast(t("toast.signedInSuccess"), "success");
            } catch (err) {
              showToast(
                err instanceof Error ? err.message : t("toast.signInIncomplete"),
                "error"
              );
            } finally {
              state.signingInBrowser = false;
              renderApp();
            }
          },
        },
        state.signingInBrowser ? t("onboard.waitingBrowserBtn") : t("onboard.signInBrowserBtn")
      )
    ),
    renderCopyCommandBox(t("onboard.orRunInTerminal"), loginCmd),
    h(
      "div",
      { className: "action-row" },
      h(
        "button",
        {
          type: "button",
          className: "btn",
          disabled: state.refreshing || state.signingInBrowser,
          onClick: () => {
            void loadData(true);
          },
        },
        state.refreshing ? t("common.checking") : t("onboard.signedInRefreshBtn")
      ),
      h(
        "button",
        {
          type: "button",
          className: "btn",
          disabled: state.signingInBrowser,
          onClick: () => {
            void handleToggleDemoMode(true, t("toast.demoEnabled"));
          },
        },
        t("onboard.previewDemoBtn")
      )
    ),
    renderSettingsDetails(overview)
  );
}

function renderTabNav(overview                           )              {
  const tabs                                                                                  = [
    { id: "overview", label: t("tabs.overview") },
    {
      id: "projects",
      label: t("tabs.projects"),
      count: state.domainLoaded.projects ? overview.summary.totalProjects : undefined,
      loadingCount: !state.domainLoaded.projects && state.domainLoading.projects,
    },
    {
      id: "billing",
      label: t("tabs.billing"),
      count: state.domainLoaded.billing ? overview.summary.totalBillingAccounts : undefined,
      loadingCount: !state.domainLoaded.billing && state.domainLoading.billing,
    },
  ];

  return h(
    "nav",
    { className: "tab-bar", role: "tablist", ariaLabel: t("tabs.ariaLabel") },
    ...tabs.map((tab) =>
      h(
        "button",
        {
          type: "button",
          role: "tab",
          ariaSelected: String(state.activeTab === tab.id),
          className: state.activeTab === tab.id ? "tab-btn tab-btn-active" : "tab-btn",
          onClick: () => {
            state.activeTab = tab.id;
            renderApp();
          },
        },
        tab.label,
        tab.count !== undefined
          ? h("span", { className: "tab-count" }, String(tab.count))
          : tab.loadingCount
            ? h("span", { className: "skeleton sk-tab-badge", ariaHidden: "true" })
            : null
      )
    )
  );
}

function formatLinkedProjectCount(count        )         {
  return count === 1
    ? t("billing.projectCountOne")
    : t("billing.projectCountMany", { count });
}

                            
                   
                   
                      
                        
 

                                
                     
                        
                          
                            
                   
                           
                   
                      
                                              
 

function formatMonthLabel(yyyymm        )         {
  return yyyymm.length === 6 ? `${yyyymm.slice(0, 4)}-${yyyymm.slice(4)}` : yyyymm;
}

function formatCompactPillSummary(totals                                 )         {
  if (totals.length === 0) return "—";
  return totals
    .map((tot) => {
      const net = Math.abs(tot.currentMonthNetCost) < 0.005 ? 0 : tot.currentMonthNetCost;
      const netStr = formatMoney(net, tot.currency);
      if (net <= 0.005 && tot.currentMonthGrossCost >= 0.005) {
        return `${netStr} (${formatMoney(tot.currentMonthGrossCost, tot.currency)})`;
      }
      return netStr;
    })
    .join(" · ");
}

function renderHeroStatusBadge(
  active                      ,
  total                      
)              {
  if (active.isCurrentMonth) {
    return renderDeltaBadge(total.deltaPercentVsPrevSameDay);
  }
  const statusBadge = active.settled
    ? h("span", { className: "badge badge-good" }, t("spend.settledBadge"))
    : h(
        "span",
        { className: "badge badge-warn" },
        t("spend.backfillingBadge", {
          days: active.coveredDays || total.dailySeries.length || 0,
        })
      );
  if (
    active.settled &&
    total.deltaPercentVsPrevSameDay !== null &&
    Number.isFinite(total.deltaPercentVsPrevSameDay)
  ) {
    return h(
      "div",
      { className: "hero-badges-row" },
      statusBadge,
      renderDeltaBadge(total.deltaPercentVsPrevSameDay)
    );
  }
  return statusBadge;
}

function renderForecastSummaryBlock(
  forecast                                  ,
  currency        
)                     {
  if (!forecast || forecast.status !== "estimated") return null;
  const hasNeg = forecast.warnings.includes("negative-adjustments");
  const basisLabel = t("spend.forecastBasis", {
    days: forecast.elapsedCalendarDays,
    total: forecast.daysInMonth,
    date: forecast.rateThroughDate ? forecast.rateThroughDate.slice(5) : "—",
  });
  const basisFull = forecast.excludedTodayUtc
    ? `${basisLabel} · ${t("spend.forecastExcludedToday")}`
    : basisLabel;

  return h(
    "div",
    { className: "forecast-summary-strip" },
    h(
      "div",
      { className: "forecast-main-row" },
      h(
        "span",
        { className: "forecast-pill-metric" },
        t("spend.projectedNet", {
          amount:
            forecast.monthEndNetCost !== null
              ? formatMoney(forecast.monthEndNetCost, currency)
              : "—",
        })
      ),
      h(
        "span",
        { className: "forecast-pill-metric" },
        t("spend.projectedGross", {
          amount:
            forecast.monthEndGrossCost !== null
              ? formatMoney(forecast.monthEndGrossCost, currency)
              : "—",
        })
      )
    ),
    h("div", { className: "forecast-meta-line" }, basisFull),
    hasNeg || forecast.creditsNotGuaranteed
      ? h(
          "div",
          { className: "forecast-caution-line" },
          hasNeg ? t("spend.forecastNegativeCaution") : t("spend.forecastCreditsCaution")
        )
      : null
  );
}

function isCreditCoveredZeroNet(netCost        , grossCost        )          {
  return netCost <= 0.005 && grossCost >= 0.005;
}

function getProjectRankScore(ps                                 )         {
  if (!ps) return -Infinity;
  if (ps.currentMonthNetCost > 0.005) return ps.currentMonthNetCost;
  if (ps.currentMonthGrossCost >= 0.005) return ps.currentMonthGrossCost;
  return Math.abs(ps.currentMonthNetCost) < 0.005 ? 0 : ps.currentMonthNetCost;
}

function getActiveSpend(overview                           )                       {
  const baseSpend = overview.spend;
  const rawMonths =
    baseSpend.availableMonths && baseSpend.availableMonths.length > 0
      ? baseSpend.availableMonths
      : [baseSpend.invoiceMonth];
  const availableMonths = [...rawMonths];
  const byMonth = baseSpend.byMonth ?? {};
  const monthMeta                                   = {};
  let firstPopulatedMonth = "";

  for (const m of availableMonths) {
    const snap = byMonth[m];
    const mHasRows = snap
      ? snap.hasRows
      : m === baseSpend.invoiceMonth && baseSpend.totalsByCurrency.length > 0;
    const mTotals = snap
      ? snap.totalsByCurrency
      : m === baseSpend.invoiceMonth
        ? baseSpend.totalsByCurrency
        : [];
    const mSettled = Boolean(snap?.settled);
    const mCoveredDays = snap?.coveredDays ?? mTotals[0]?.dailySeries.length ?? 0;
    monthMeta[m] = {
      hasRows: mHasRows,
      settled: mSettled,
      coveredDays: mCoveredDays,
      amountPreview: mHasRows ? formatCompactPillSummary(mTotals) : "—",
    };
    if (mHasRows && !firstPopulatedMonth) {
      firstPopulatedMonth = m;
    }
  }

  let selectedMonth = state.selectedInvoiceMonth;
  if (!selectedMonth || !availableMonths.includes(selectedMonth)) {
    const currentSnap = byMonth[baseSpend.invoiceMonth];
    const currentHasRows = currentSnap
      ? currentSnap.hasRows
      : baseSpend.totalsByCurrency.length > 0;
    if (currentHasRows) {
      selectedMonth = baseSpend.invoiceMonth;
    } else if (firstPopulatedMonth) {
      selectedMonth = firstPopulatedMonth;
    } else {
      selectedMonth = availableMonths[0] ?? baseSpend.invoiceMonth;
    }
  }

  const activeSnap = byMonth[selectedMonth];
  const effectiveSpend              = activeSnap
    ? {
        ...baseSpend,
        invoiceMonth: activeSnap.invoiceMonth,
        previousInvoiceMonth: activeSnap.previousInvoiceMonth,
        totalsByCurrency: activeSnap.totalsByCurrency,
        byBillingAccount: activeSnap.byBillingAccount,
        byProject: activeSnap.byProject,
      }
    : baseSpend;

  const hasRows = activeSnap ? activeSnap.hasRows : effectiveSpend.totalsByCurrency.length > 0;
  const hasAnyMonthRows = Boolean(firstPopulatedMonth) || baseSpend.totalsByCurrency.length > 0;

  return {
    spend: effectiveSpend,
    selectedMonth,
    isCurrentMonth: selectedMonth === baseSpend.invoiceMonth,
    availableMonths,
    hasRows,
    hasAnyMonthRows,
    settled: Boolean(activeSnap?.settled),
    coveredDays:
      activeSnap?.coveredDays ?? effectiveSpend.totalsByCurrency[0]?.dailySeries.length ?? 0,
    monthMeta,
  };
}

function renderMonthSwitcher(active                      )                     {
  if (active.availableMonths.length <= 1) return null;
  return h(
    "div",
    {
      className: "month-switcher-bar",
      ariaLabel: t("overview.monthSelectorAria"),
    },
    ...active.availableMonths.map((ym) => {
      const selected = ym === active.selectedMonth;
      const meta = active.monthMeta[ym];
      const populated = Boolean(meta?.hasRows);
      const classes = ["month-pill"];
      if (selected) classes.push("month-pill-active");
      if (!populated) classes.push("month-pill-empty");
      return h(
        "button",
        {
          type: "button",
          className: classes.join(" "),
          ariaSelected: String(selected),
          onClick: () => {
            state.selectedInvoiceMonth = ym;
            renderApp();
          },
        },
        h(
          "span",
          { className: "month-pill-head" },
          meta?.settled ? `${formatMonthLabel(ym)} ✓` : formatMonthLabel(ym)
        ),
        h("span", { className: "month-pill-amt" }, meta?.amountPreview ?? "—")
      );
    })
  );
}

async function handleSwitchActiveProject(projectId        , toastKey                                                    )                {
  const prevActive = state.overview.auth.activeProject;
  state.enableTargetProject = "";
  state.overview = {
    ...state.overview,
    auth: {
      ...state.overview.auth,
      activeProject: projectId,
    },
  };
  recomputeDerivedOverview();
  renderApp();
  try {
    const updated = await switchActiveProject(projectId);
    applyLocalMutationOverview(updated);
    renderApp();
    showToast(t(toastKey, { project: projectId }), "success");
  } catch (err) {
    state.overview = {
      ...state.overview,
      auth: {
        ...state.overview.auth,
        activeProject: prevActive,
      },
    };
    recomputeDerivedOverview();
    renderApp();
    showToast(err instanceof Error ? err.message : t("toast.switchProjectFailed"), "error");
  }
}

async function handleTogglePinProject(projectId        , nextPinned         )                {
  const prevPinned = [...state.overview.preferences.pinnedProjects];
  const nextSet = new Set(prevPinned);
  if (nextPinned) {
    nextSet.add(projectId);
  } else {
    nextSet.delete(projectId);
  }
  state.overview = {
    ...state.overview,
    preferences: {
      ...state.overview.preferences,
      pinnedProjects: Array.from(nextSet),
    },
  };
  recomputeDerivedOverview();
  renderApp();
  try {
    const updated = await togglePinProject(projectId, nextPinned);
    applyLocalMutationOverview(updated);
    renderApp();
  } catch (err) {
    state.overview = {
      ...state.overview,
      preferences: {
        ...state.overview.preferences,
        pinnedProjects: prevPinned,
      },
    };
    recomputeDerivedOverview();
    renderApp();
    showToast(err instanceof Error ? err.message : t("toast.pinUpdateFailed"), "error");
  }
}

async function handleSwitchProjectBilling(
  projectId        ,
  targetBillingAccountId        
)                {
  if (state.switchingBillingProjectId) return;
  state.switchingBillingProjectId = projectId;
  state.billingSwitchError = null;
  renderApp();
  try {
    const res = await setProjectBillingAccountApi(projectId, targetBillingAccountId);
    applyProjectBillingUpdate(res);
    state.editingBillingProjectId = null;
    state.billingPickerValue = "";
    state.billingManualInput = "";
    state.billingSwitchError = null;
    showToast(
      t("toast.switchedBillingAccount", {
        project: res.projectId,
        account: res.billingAccountName || res.billingAccountId,
      }),
      "success"
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : t("toast.switchBillingFailed");
    state.billingSwitchError = { projectId, message };
    showToast(t("toast.switchBillingFailed"), "error");
  } finally {
    state.switchingBillingProjectId = null;
    renderApp();
  }
}

async function handleDeleteProject(
  projectId        ,
  confirmProjectId        
)                {
  if (state.deletingProjectId) return;
  state.deletingProjectId = projectId;
  state.deleteProjectError = null;
  renderApp();
  try {
    const res = await deleteProjectApi(projectId, confirmProjectId);
    applyProjectDeleteUpdate(res);
    state.deletingConfirmProjectId = null;
    state.deleteConfirmInput = "";
    state.deleteProjectError = null;
    state.recentlyDeletedProjects = [
      {
        projectId: res.projectId,
        projectName: res.projectName,
        pendingDeletionConsoleUrl: res.pendingDeletionConsoleUrl,
        demoSimulated: res.demoSimulated,
      },
      ...state.recentlyDeletedProjects.filter((item) => item.projectId !== res.projectId),
    ];
    showToast(
      t(res.demoSimulated ? "toast.deletedProjectDemo" : "toast.deletedProject", {
        project: res.projectId,
      }),
      "success"
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : t("toast.deleteProjectFailed");
    state.deleteProjectError = { projectId, message };
    showToast(t("toast.deleteProjectFailed"), "error");
  } finally {
    state.deletingProjectId = null;
    renderApp();
  }
}

function renderOverviewTab(overview                           )              {
  const active = getActiveSpend(overview);
  const spend = active.spend;
  const sections                = [];

  if (state.domainLoaded.bootstrap && !overview.preferences.demoMode && !overview.auth.gcloudInstalled) {
    sections.push(
      h(
        "section",
        { className: "card warning-card" },
        h(
          "div",
          { className: "api-setup-header" },
          h("span", { className: "badge badge-warn" }, t("overview.cliRecommendedBadge")),
          h("h3", { className: "section-title" }, t("overview.cliNotFoundTitle"))
        ),
        h("p", { className: "card-desc" }, t("overview.cliNotFoundDesc")),
        h(
          "div",
          { className: "action-row" },
          h(
            "a",
            {
              className: "btn btn-primary btn-sm",
              href: "https://cloud.google.com/sdk/docs/install",
              target: "_blank",
              rel: "noopener noreferrer",
            },
            t("overview.installCliBtn")
          )
        )
      )
    );
  }

  if (!state.domainLoaded.bootstrap) {
    sections.push(renderHeroSpendSkeletonCard());
  } else if (isSpendExpected(overview) && !state.domainLoaded.spend) {
    if (state.domainErrors.spend) {
      sections.push(
        renderSectionErrorCard(state.domainErrors.spend, () => {
          void retrySpendDomain();
        })
      );
    } else {
      sections.push(renderHeroSpendSkeletonCard(t("loading.spend")));
      sections.push(renderBreakdownSkeletonCard());
    }
  } else if (spend.configured && active.hasAnyMonthRows) {
    const switcher = renderMonthSwitcher(active);
    if (switcher) {
      sections.push(switcher);
    }

    if (active.hasRows && spend.totalsByCurrency.length > 0) {
      for (const total of spend.totalsByCurrency) {
        sections.push(
          h(
            "section",
            { className: "card hero-spend-card card-hydrated" },
            h(
              "div",
              { className: "hero-top-row" },
              h(
                "span",
                { className: "eyebrow" },
                active.isCurrentMonth
                  ? t("overview.mtdNetSpend", {
                      month: formatMonthLabel(spend.invoiceMonth),
                    })
                  : t("overview.monthlyNetSpend", {
                      month: formatMonthLabel(spend.invoiceMonth),
                    })
              ),
              h(
                "div",
                { className: "hero-badges-row" },
                state.domainLoading.spend ? renderSectionLoadingPill(t("loading.spend")) : null,
                renderHeroStatusBadge(active, total)
              )
            ),
            h(
              "div",
              { className: "hero-amount" },
              formatMoney(total.currentMonthNetCost, total.currency)
            ),
            h(
              "div",
              { className: "hero-submetrics" },
              h(
                "span",
                { className: "submetric" },
                t("spend.gross", { amount: formatMoney(total.currentMonthGrossCost, total.currency) })
              ),
              h(
                "span",
                { className: "submetric submetric-credit" },
                t("spend.credits", { amount: formatMoney(total.currentMonthCredits, total.currency) })
              ),
              h(
                "span",
                { className: "submetric" },
                spend.previousInvoiceMonth
                  ? t("spend.monthTotalLabel", {
                      month: formatMonthLabel(spend.previousInvoiceMonth),
                      amount: formatMoney(total.prevMonthTotalNetCost, total.currency),
                    })
                  : t("spend.lastMonthTotal", {
                      amount: formatMoney(total.prevMonthTotalNetCost, total.currency),
                    })
              )
            ),
            renderForecastSummaryBlock(total.forecast, total.currency),
            renderDailySparkline(total.dailySeries, total.currency, undefined, total.forecast)
          )
        );
      }

      // Breakdown toggle: By Project vs By Billing Account vs By Service
      const projectNameById = new Map                ();
      for (const p of overview.projects) {
        projectNameById.set(p.projectId, p.name);
      }
      const topProjectSummaries = Object.values(spend.byProject)
        .sort((a, b) => getProjectRankScore(b) - getProjectRankScore(a))
        .slice(0, 5);

      sections.push(
        h(
          "section",
          { className: "card card-hydrated" },
          h(
            "div",
            { className: "section-header-row" },
            h(
              "h3",
              { className: "section-title" },
              t("overview.spendBreakdownTitleForMonth", {
                month: formatMonthLabel(spend.invoiceMonth),
              })
            ),
            h(
              "div",
              { className: "segmented-mini" },
              h(
                "button",
                {
                  type: "button",
                  className:
                    state.overviewMode === "projects" ? "seg-btn seg-btn-active" : "seg-btn",
                  onClick: () => {
                    state.overviewMode = "projects";
                    renderApp();
                  },
                },
                t("overview.byProject")
              ),
              h(
                "button",
                {
                  type: "button",
                  className:
                    state.overviewMode === "accounts" ? "seg-btn seg-btn-active" : "seg-btn",
                  onClick: () => {
                    state.overviewMode = "accounts";
                    renderApp();
                  },
                },
                t("overview.byAccount")
              ),
              h(
                "button",
                {
                  type: "button",
                  className:
                    state.overviewMode === "services" ? "seg-btn seg-btn-active" : "seg-btn",
                  onClick: () => {
                    state.overviewMode = "services";
                    renderApp();
                  },
                },
                t("overview.byService")
              )
            )
          ),
          state.overviewMode === "projects"
            ? topProjectSummaries.length > 0
              ? h(
                  "div",
                  { className: "compact-list" },
                  ...topProjectSummaries.map((ps) => {
                    const displayName = projectNameById.get(ps.projectId) ?? ps.projectId;
                    return h(
                      "div",
                      {
                        className: "compact-row clickable-row",
                        onClick: () => {
                          state.activeTab = "projects";
                          state.expandedProjectIds.add(ps.projectId);
                          renderApp();
                        },
                      },
                      h(
                        "div",
                        { className: "compact-row-main" },
                        h("span", { className: "row-primary-text" }, displayName),
                        h("span", { className: "row-mono" }, ps.projectId)
                      ),
                      h(
                        "div",
                        { className: "compact-row-right" },
                        h(
                          "span",
                          { className: "amount-strong" },
                          formatMoney(ps.currentMonthNetCost, ps.currency)
                        ),
                        isCreditCoveredZeroNet(ps.currentMonthNetCost, ps.currentMonthGrossCost)
                          ? h(
                              "span",
                              { className: "muted-micro" },
                              t("chart.grossShort", {
                                amount: formatMoney(ps.currentMonthGrossCost, ps.currency),
                              })
                            )
                          : null,
                        ps.topServices[0]
                          ? h(
                              "span",
                              { className: "muted-micro" },
                              t("overview.topService", { service: ps.topServices[0].serviceName })
                            )
                          : null
                      )
                    );
                  })
                )
              : h("div", { className: "muted-note" }, t("overview.noProjectCosts"))
            : state.overviewMode === "services"
              ? renderServiceBreakdownList(
                  spend.totalsByCurrency[0]?.topServices ?? [],
                  spend.totalsByCurrency[0]?.currency ?? "USD"
                )
              : !state.domainLoaded.billing
                ? renderSectionLoadingPill(t("loading.billing"))
                : (() => {
                    const activeBaIds = new Set(overview.billingAccounts.map((ba) => ba.id));
                    const historicalSpendOnlyAccounts = Object.values(spend.byBillingAccount)
                      .filter((bs) => !activeBaIds.has(bs.billingAccountId))
                      .sort((a, b) => b.currentMonthNetCost - a.currentMonthNetCost);
                    return h(
                      "div",
                      { className: "compact-list" },
                      ...overview.billingAccounts.map((ba) => {
                        const bs = spend.byBillingAccount[ba.id];
                        return h(
                          "div",
                          {
                            className: "compact-row clickable-row",
                            onClick: () => {
                              state.activeTab = "billing";
                              renderApp();
                            },
                          },
                          h(
                            "div",
                            { className: "compact-row-main" },
                            h("span", { className: "row-primary-text" }, ba.displayName),
                            h(
                              "span",
                              { className: "row-mono" },
                              `${ba.id} · ${formatLinkedProjectCount(ba.linkedProjectCount)}`
                            )
                          ),
                          h(
                            "div",
                            { className: "compact-row-right" },
                            bs
                              ? h(
                                  "span",
                                  { className: "amount-strong" },
                                  formatMoney(bs.currentMonthNetCost, bs.currency)
                                )
                              : h("span", { className: "muted-micro" }, t("overview.noBqRows")),
                            bs && isCreditCoveredZeroNet(bs.currentMonthNetCost, bs.currentMonthGrossCost)
                              ? h(
                                  "span",
                                  { className: "muted-micro" },
                                  t("chart.grossShort", {
                                    amount: formatMoney(bs.currentMonthGrossCost, bs.currency),
                                  })
                                )
                              : null,
                            h("span", { className: "status-dot-open" }, t("billing.statusOpen"))
                          )
                        );
                      }),
                      ...historicalSpendOnlyAccounts.map((bs) =>
                        h(
                          "div",
                          { className: "compact-row" },
                          h(
                            "div",
                            { className: "compact-row-main" },
                            h("span", { className: "row-primary-text" }, bs.billingAccountId),
                            h("span", { className: "row-mono" }, bs.billingAccountId)
                          ),
                          h(
                            "div",
                            { className: "compact-row-right" },
                            h(
                              "span",
                              { className: "amount-strong" },
                              formatMoney(bs.currentMonthNetCost, bs.currency)
                            ),
                            isCreditCoveredZeroNet(bs.currentMonthNetCost, bs.currentMonthGrossCost)
                              ? h(
                                  "span",
                                  { className: "muted-micro" },
                                  t("chart.grossShort", {
                                    amount: formatMoney(bs.currentMonthGrossCost, bs.currency),
                                  })
                                )
                              : null,
                            h("span", { className: "status-dot-closed" }, t("billing.statusClosed"))
                          )
                        )
                      )
                    );
                  })()
        )
      );
    } else {
      const fallbackCurrency =
        overview.billingAccounts.find((b) => b.currencyCode)?.currencyCode || "USD";
      const priorRefs = active.isCurrentMonth
        ? spend.totalsByCurrency
            .map((item) => item.priorMonthRunRateReference)
            .filter((r)                                  => Boolean(r))
        : [];
      sections.push(
        h(
          "section",
          { className: "card hero-spend-card" },
          h(
            "div",
            { className: "hero-top-row" },
            h(
              "span",
              { className: "eyebrow" },
              active.isCurrentMonth
                ? t("overview.mtdNetSpend", {
                    month: formatMonthLabel(active.selectedMonth),
                  })
                : t("overview.monthlyNetSpend", {
                    month: formatMonthLabel(active.selectedMonth),
                  })
            )
          ),
          h("div", { className: "hero-amount" }, formatMoney(0, fallbackCurrency)),
          h(
            "p",
            { className: "month-no-rows-note" },
            t("overview.monthNoRowsYet", { month: formatMonthLabel(active.selectedMonth) })
          ),
          ...priorRefs.map((ref) =>
            h(
              "p",
              { className: "prior-month-ref-note" },
              t("spend.priorMonthRunRateRef", {
                month: formatMonthLabel(ref.sourceInvoiceMonth),
                days: ref.coveredDays,
                net: formatMoney(ref.netPerCoveredDay, ref.currency),
                gross: formatMoney(ref.grossPerCoveredDay, ref.currency),
              })
            )
          )
        )
      );
    }
  } else {
    const billingReady = state.domainLoaded.billing;
    const projectsReady = state.domainLoaded.projects;
    const billingOff = billingReady && isCloudBillingApiDisabled(overview);
    const billingApiPrompt = billingReady ? renderBillingApiSetupPrompt(overview) : null;
    // Progressive Base Mode card when BigQuery export isn't linked yet (or returned 0 rows)
    sections.push(
      h(
        "section",
        { className: "card kpi-strip" },
        h(
          "div",
          { className: "kpi-cell" },
          projectsReady
            ? h("span", { className: "kpi-num" }, String(overview.summary.totalProjects))
            : h("span", { className: "skeleton sk-kpi-num", ariaHidden: "true" }),
          h("span", { className: "kpi-label" }, t("overview.kpiActiveProjects"))
        ),
        h(
          "div",
          { className: "kpi-cell" },
          billingReady
            ? h(
                "span",
                { className: "kpi-num" },
                billingOff ? "—" : String(overview.summary.openBillingAccounts)
              )
            : h("span", { className: "skeleton sk-kpi-num", ariaHidden: "true" }),
          h(
            "span",
            { className: "kpi-label" },
            billingOff ? t("overview.kpiBillingApiOff") : t("overview.kpiOpenBillingAccts")
          )
        ),
        h(
          "div",
          { className: "kpi-cell" },
          projectsReady && billingReady
            ? h(
                "span",
                { className: "kpi-num" },
                billingOff ? "—" : String(overview.summary.unbilledProjects)
              )
            : h("span", { className: "skeleton sk-kpi-num", ariaHidden: "true" }),
          h(
            "span",
            { className: "kpi-label" },
            billingOff ? t("overview.kpiEnableApiBelow") : t("overview.kpiUnbilledSandbox")
          )
        )
      )
    );
    if (state.domainErrors.billing && !billingReady) {
      sections.push(
        renderSectionErrorCard(state.domainErrors.billing, () => {
          void retryBillingDomain();
        })
      );
    } else if (billingApiPrompt) {
      sections.push(billingApiPrompt);
    }
    sections.push(
      h(
        "section",
        { className: "card callout-card" },
        h(
          "h3",
          { className: "section-title" },
          spend.configured ? t("overview.bqWaitingTitle") : t("overview.unlockSpendTitle")
        ),
        h(
          "p",
          { className: "card-desc" },
          spend.configured
            ? t("overview.bqWaitingDesc", {
                tables: spend.queriedTables.join(", "),
                currentMonth: spend.invoiceMonth,
                prevMonth: spend.previousInvoiceMonth,
              })
            : t("overview.unlockSpendDesc")
        ),
        h(
          "div",
          { className: "action-row" },
          h(
            "button",
            {
              type: "button",
              className: "btn btn-primary btn-sm",
              onClick: () => {
                state.activeTab = "billing";
                renderApp();
              },
            },
            spend.configured ? t("overview.manageExportBtn") : t("overview.connectBqBtn")
          ),
          !overview.preferences.demoMode
            ? h(
                "button",
                {
                  type: "button",
                  className: "btn btn-sm",
                  onClick: () => {
                    void handleToggleDemoMode(true, t("toast.showingSampleSpend"));
                  },
                },
                t("overview.previewSampleBtn")
              )
            : null
        )
      )
    );
  }

  // Pinned & Active Projects Quick Access
  const quickProjects = overview.projects.filter((p) => p.pinned || p.isActiveProject);
  sections.push(
    h(
      "section",
      { className: "card" },
      h(
        "div",
        { className: "section-header-row" },
        h("h3", { className: "section-title" }, t("overview.pinnedAndActiveTitle")),
        !state.domainLoaded.projects && state.domainLoading.projects
          ? renderSectionLoadingPill(t("loading.projects"))
          : h(
              "button",
              {
                type: "button",
                className: "link-btn",
                onClick: () => {
                  state.activeTab = "projects";
                  state.projectFilter = "all";
                  state.projectPageLimit = PROJECT_PAGE_SIZE;
                  renderApp();
                },
              },
              t("overview.viewAllProjects", { count: overview.projects.length })
            )
      ),
      !state.domainLoaded.projects
        ? state.domainErrors.projects
          ? renderSectionErrorCard(state.domainErrors.projects, () => {
              void retryProjectsDomain();
            })
          : h(
              "div",
              { className: "compact-list", ariaBusy: "true", ariaHidden: "true" },
              ...Array.from({ length: 2 }, () =>
                h(
                  "div",
                  { className: "skeleton-row" },
                  h(
                    "div",
                    { className: "skeleton-stack" },
                    h("span", { className: "skeleton sk-line-md" }),
                    h("span", { className: "skeleton sk-line-sm" })
                  ),
                  h("span", { className: "skeleton sk-amt-sm" })
                )
              )
            )
        : quickProjects.length > 0
          ? h(
              "div",
              { className: "compact-list card-hydrated" },
              ...quickProjects.map((proj) => renderQuickProjectItem(proj, overview))
            )
          : h("div", { className: "muted-note" }, t("overview.pinEmptyHint"))
    )
  );

  // Warnings Banner (non-fatal API permissions or stale fallback notes)
  const remainingWarnings = getNonBillingApiWarnings(overview);
  const preferredProj = getPreferredConsoleProject(overview);
  if (remainingWarnings.length > 0) {
    sections.push(
      h(
        "section",
        { className: "card warning-card" },
        h("h3", { className: "section-title" }, t("overview.diagnosticsTitle")),
        ...remainingWarnings.map((w) => renderWarningLine(w, preferredProj))
      )
    );
  }

  return h("div", { className: "tab-panel" }, ...sections);
}

function renderWarningLine(warningText        , fallbackProjectId         )              {
  const urlMatch = /(https:\/\/console\.(?:cloud|developers)\.google\.com\/[^\s)]+)/.exec(
    warningText
  );
  if (!urlMatch) {
    return h("p", { className: "warning-line" }, warningText);
  }
  const consoleUrl = withConsoleProject(urlMatch[1], fallbackProjectId);
  const label = consoleUrl.includes("/iam-admin/")
    ? t("warnings.openIamConsole")
    : t("warnings.enableApiConsole");
  return h(
    "div",
    { className: "warning-line" },
    h("p", null, warningText),
    h(
      "div",
      { className: "action-row" },
      h(
        "a",
        {
          className: "btn btn-primary btn-sm",
          href: consoleUrl,
          target: "_blank",
          rel: "noopener noreferrer",
        },
        label
      )
    )
  );
}

function renderQuickProjectItem(
  proj            ,
  overview                           
)              {
  const ps = getActiveSpend(overview).spend.byProject[proj.projectId];
  const billingSubtext = !state.domainLoaded.billing
    ? t("loading.billingStatus")
    : proj.billingEnabled && proj.billingAccountName
      ? proj.billingAccountName
      : t("project.unbilledTag");
  const spendPending = !ps && isSpendExpected(overview) && !state.domainLoaded.spend;

  return h(
    "div",
    { className: "compact-row" },
    h(
      "div",
      { className: "compact-row-main" },
      h(
        "div",
        { className: "inline-badges" },
        proj.pinned ? h("span", { className: "star-active" }, "★") : null,
        h("span", { className: "row-primary-text" }, proj.name),
        proj.isActiveProject
          ? h("span", { className: "badge badge-active" }, t("project.activeBadge"))
          : null
      ),
      h("span", { className: "row-mono" }, `${proj.projectId} · ${billingSubtext}`)
    ),
    h(
      "div",
      { className: "compact-row-actions" },
      ps
        ? h(
            "div",
            { className: "project-spend-stack" },
            h(
              "span",
              { className: "amount-strong" },
              formatMoney(ps.currentMonthNetCost, ps.currency)
            ),
            isCreditCoveredZeroNet(ps.currentMonthNetCost, ps.currentMonthGrossCost)
              ? h(
                  "span",
                  { className: "muted-micro" },
                  t("chart.grossShort", {
                    amount: formatMoney(ps.currentMonthGrossCost, ps.currency),
                  })
                )
              : null
          )
        : spendPending
          ? h("span", { className: "skeleton sk-amt-sm", ariaHidden: "true" })
          : null,
      !proj.isActiveProject
        ? h(
            "button",
            {
              type: "button",
              className: "btn btn-xs",
              title: t("project.setActiveCmdTitle", { project: proj.projectId }),
              onClick: () => {
                void handleSwitchActiveProject(proj.projectId, "toast.activeProjectSet");
              },
            },
            t("project.setActiveBtn")
          )
        : null,
      h(
        "a",
        {
          className: "icon-link",
          href: `https://console.cloud.google.com/home/dashboard?project=${encodeURIComponent(proj.projectId)}`,
          target: "_blank",
          rel: "noopener noreferrer",
          title: t("project.openConsoleTitle"),
        },
        "↗"
      )
    )
  );
}

function getFilteredAndSortedProjects(overview                           )               {
  const searchLower = state.projectSearch.trim().toLowerCase();

  const filtered = overview.projects.filter((p) => {
    // In default "focus" mode without a search query, show only Active / Pinned / Expanded projects so the panel stays compact.
    // As soon as the user types in the search box, search across ALL projects automatically!
    if (state.projectFilter === "focus" && !searchLower) {
      return p.isActiveProject || p.pinned || state.expandedProjectIds.has(p.projectId);
    }
    if (state.projectFilter === "pinned" && !p.pinned) return false;
    if (state.projectFilter === "unbilled" && p.billingEnabled) return false;
    if (state.projectFilter.startsWith("ba:")) {
      const targetBa = state.projectFilter.slice(3);
      if (p.billingAccountId !== targetBa) return false;
    }
    if (!searchLower) return true;
    const labelStr = p.labels
      ? Object.entries(p.labels)
          .map(([k, v]) => `${k}:${v}`)
          .join(" ")
          .toLowerCase()
      : "";
    return (
      p.projectId.toLowerCase().includes(searchLower) ||
      p.name.toLowerCase().includes(searchLower) ||
      p.projectNumber.includes(searchLower) ||
      labelStr.includes(searchLower)
    );
  });

  const activeSpend = getActiveSpend(overview).spend;
  return [...filtered].sort((a, b) => {
    const psA = activeSpend.byProject[a.projectId];
    const psB = activeSpend.byProject[b.projectId];
    if (state.projectSort === "spend") {
      if (Boolean(psA) !== Boolean(psB)) return psA ? -1 : 1;
      const sa = getProjectRankScore(psA);
      const sb = getProjectRankScore(psB);
      if (sa !== sb) return sb - sa;
      return a.projectId.localeCompare(b.projectId);
    }
    if (state.projectSort === "name") {
      return a.name.localeCompare(b.name);
    }
    if (a.isActiveProject !== b.isActiveProject) return a.isActiveProject ? -1 : 1;
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (Boolean(psA) !== Boolean(psB)) return psA ? -1 : 1;
    const sa = getProjectRankScore(psA);
    const sb = getProjectRankScore(psB);
    if (sa !== sb) return sb - sa;
    return a.projectId.localeCompare(b.projectId);
  });
}

function renderProjectsTab(overview                           )              {
  const focusCount = overview.projects.filter((p) => p.isActiveProject || p.pinned).length;
  const projectsReady = state.domainLoaded.projects;
  const billingReady = state.domainLoaded.billing;

  const filterChips                                        = [
    {
      key: "all",
      label: t("projects.filterAll", { count: projectsReady ? overview.projects.length : "…" }),
    },
    {
      key: "unbilled",
      label: t("projects.filterUnbilled", {
        count: projectsReady && billingReady ? overview.summary.unbilledProjects : "…",
      }),
    },
    {
      key: "focus",
      label: t("projects.filterFocus", { count: projectsReady ? focusCount : "…" }),
    },
  ];

  if (state.projectFilter.startsWith("ba:")) {
    const baId = state.projectFilter.slice(3);
    const matchedBa = overview.billingAccounts.find((b) => b.id === baId);
    const baLabel = matchedBa
      ? `${matchedBa.displayName} (${matchedBa.linkedProjectCount}) ×`
      : `${baId} ×`;
    filterChips.push({ key: state.projectFilter, label: baLabel });
  }

  const active = getActiveSpend(overview);
  const monthSwitcher =
    active.spend.configured && active.hasAnyMonthRows ? renderMonthSwitcher(active) : null;

  const deletedBanners = state.recentlyDeletedProjects.map((entry) =>
    h(
      "section",
      {
        className: "card deleted-project-banner",
        role: "status",
      },
      h(
        "div",
        { className: "deleted-project-banner-body" },
        h(
          "div",
          { className: "deleted-project-banner-title" },
          t("project.deletedBannerTitle", { project: entry.projectId })
        ),
        h(
          "div",
          { className: "deleted-project-banner-desc" },
          entry.demoSimulated
            ? t("project.deletedBannerDemoDesc")
            : t("project.deletedBannerDesc")
        ),
        !entry.demoSimulated
          ? h(
              "div",
              { className: "deleted-project-banner-actions" },
              h(
                "a",
                {
                  className: "link-external",
                  href: entry.pendingDeletionConsoleUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                t("project.deletedBannerConsoleLink")
              )
            )
          : null
      ),
      h(
        "button",
        {
          type: "button",
          className: "icon-btn deleted-banner-dismiss-btn",
          ariaLabel: t("project.dismissBannerAria"),
          title: t("project.dismissBannerAria"),
          onClick: () => {
            state.recentlyDeletedProjects = state.recentlyDeletedProjects.filter(
              (item) => item.projectId !== entry.projectId
            );
            renderApp();
          },
        },
        "×"
      )
    )
  );

  return h(
    "div",
    { className: "tab-panel" },
    ...deletedBanners,
    monthSwitcher,
    h(
      "section",
      { className: "card filter-toolbar" },
      h(
        "div",
        { className: "search-sort-row" },
        h("input", {
          id: "project-search-input",
          type: "search",
          className: "search-input",
          placeholder: t("projects.searchPlaceholder"),
          value: state.projectSearch,
          ariaLabel: t("projects.searchAria"),
          onInput: (ev) => {
            state.projectSearch = (ev.target                    ).value;
            state.projectPageLimit = PROJECT_PAGE_SIZE;
            renderProjectsListOnly();
          },
        }),
        h(
          "select",
          {
            className: "compact-select",
            ariaLabel: t("projects.sortAria"),
            onChange: (ev) => {
              state.projectSort = (ev.target                     ).value                   ;
              renderApp();
            },
          },
          h("option", { value: "smart", selected: state.projectSort === "smart" }, t("projects.sortSmart")),
          h(
            "option",
            { value: "spend", selected: state.projectSort === "spend" },
            t("projects.sortSpend")
          ),
          h("option", { value: "name", selected: state.projectSort === "name" }, t("projects.sortName"))
        )
      ),
      h(
        "div",
        { className: "chip-row" },
        ...filterChips.map((chip) =>
          h(
            "button",
            {
              type: "button",
              className:
                state.projectFilter === chip.key ? "filter-chip filter-chip-active" : "filter-chip",
              onClick: () => {
                if (state.projectFilter === chip.key && chip.key.startsWith("ba:")) {
                  state.projectFilter = "all";
                } else {
                  state.projectFilter = chip.key;
                }
                state.projectPageLimit = PROJECT_PAGE_SIZE;
                renderApp();
              },
            },
            chip.label
          )
        )
      )
    ),
    h(
      "div",
      { id: "projects-results-container", className: "stack-list" },
      ...buildProjectResultsNodes(overview)
    )
  );
}

function renderProjectsListOnly()       {
  const container = document.getElementById("projects-results-container");
  if (!container) return;
  clearElement(container);
  for (const node of buildProjectResultsNodes(state.overview)) {
    container.appendChild(node);
  }
}

function buildProjectResultsNodes(overview                           )                {
  if (!state.domainLoaded.projects) {
    if (state.domainErrors.projects) {
      return [
        renderSectionErrorCard(state.domainErrors.projects, () => {
          void retryProjectsDomain();
        }),
      ];
    }
    return renderProjectCardsSkeleton(4);
  }

  const filtered = getFilteredAndSortedProjects(overview);
  const isCompactDefault = state.projectFilter === "focus" && !state.projectSearch.trim();
  const totalProjects = overview.projects.length;

  // Empty compact state (e.g. 0 pinned & no active project yet, while projects exist)
  if (isCompactDefault && filtered.length === 0 && totalProjects > 0) {
    return [
      h(
        "div",
        { className: "card projects-more-bar" },
        h("span", { className: "muted-note" }, t("projects.focusEmptyPrompt", { total: totalProjects })),
        h(
          "button",
          {
            type: "button",
            className: "btn btn-xs",
            onClick: () => {
              state.projectFilter = "all";
              state.projectPageLimit = PROJECT_PAGE_SIZE;
              renderApp();
            },
          },
          t("projects.browseAllBtn", { total: totalProjects })
        )
      ),
    ];
  }

  const visible = filtered.slice(0, state.projectPageLimit);
  const nodes = buildProjectCards(visible, overview);
  const remainingInFilter = Math.max(0, filtered.length - visible.length);

  if (isCompactDefault && totalProjects > visible.length) {
    nodes.push(
      h(
        "div",
        { className: "card projects-more-bar" },
        h(
          "span",
          { className: "muted-micro" },
          t("projects.hiddenCompactHint", { shown: visible.length, total: totalProjects })
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn btn-xs",
            onClick: () => {
              if (remainingInFilter > 0) {
                state.projectPageLimit += PROJECT_PAGE_SIZE;
                renderProjectsListOnly();
              } else {
                state.projectFilter = "all";
                state.projectPageLimit = PROJECT_PAGE_SIZE;
                renderApp();
              }
            },
          },
          remainingInFilter > 0
            ? t("projects.showMoreBtn", { remaining: remainingInFilter })
            : t("projects.browseAllBtn", { total: totalProjects })
        )
      )
    );
  } else if (remainingInFilter > 0 || state.projectPageLimit > PROJECT_PAGE_SIZE) {
    const actionButtons                = [];
    if (remainingInFilter > 0) {
      actionButtons.push(
        h(
          "button",
          {
            type: "button",
            className: "btn btn-xs",
            onClick: () => {
              state.projectPageLimit += PROJECT_PAGE_SIZE;
              renderProjectsListOnly();
            },
          },
          t("projects.showMoreBtn", { remaining: remainingInFilter })
        )
      );
    }
    if (state.projectPageLimit > PROJECT_PAGE_SIZE) {
      actionButtons.push(
        h(
          "button",
          {
            type: "button",
            className: "btn btn-xs btn-ghost",
            onClick: () => {
              state.projectPageLimit = PROJECT_PAGE_SIZE;
              renderProjectsListOnly();
            },
          },
          t("projects.collapseListBtn")
        )
      );
    }
    if (actionButtons.length > 0) {
      nodes.push(
        h(
          "div",
          { className: "card projects-more-bar" },
          h("span", { className: "muted-micro" }, `${visible.length} / ${filtered.length}`),
          h("div", { className: "action-row" }, ...actionButtons)
        )
      );
    }
  }

  return nodes;
}

function buildBillingConfirmSlotNodes(
  proj            ,
  overview                           
)                {
  const isManual = state.billingPickerValue === BILLING_MANUAL_SENTINEL;
  const rawCandidate = isManual ? state.billingManualInput : state.billingPickerValue;
  const trimmed = rawCandidate.trim();
  if (!trimmed) return [];

  const targetId = normalizeClientBillingAccountId(trimmed);
  if (!targetId) {
    return isManual
      ? [h("div", { className: "billing-switch-hint muted-micro" }, t("project.billingManualFormatHint"))]
      : [];
  }

  if (proj.billingEnabled && proj.billingAccountId === targetId) {
    return [
      h("div", { className: "billing-switch-hint muted-micro" }, t("project.billingAlreadyLinked")),
    ];
  }

  const matchedAccount = overview.billingAccounts.find((ba) => ba.id === targetId) ?? null;
  if (matchedAccount && !matchedAccount.open) {
    return [
      h("div", { className: "billing-switch-error-inline" }, t("project.billingClosedNotAllowed")),
    ];
  }

  const fromLabel =
    proj.billingEnabled && proj.billingAccountId
      ? proj.billingAccountName && proj.billingAccountName !== proj.billingAccountId
        ? `${proj.billingAccountName} (${proj.billingAccountId})`
        : proj.billingAccountId
      : t("project.noBillingTag");

  const toLabel = matchedAccount
    ? `${matchedAccount.displayName} (${matchedAccount.id})`
    : targetId;

  const isSubmitting = state.switchingBillingProjectId === proj.projectId;
  const confirmBtnText = isSubmitting
    ? t("project.billingSwitchingBtn")
    : proj.billingEnabled && proj.billingAccountId
      ? t("project.billingConfirmSwitchBtn")
      : t("project.billingConfirmLinkBtn");

  return [
    h(
      "div",
      { className: "billing-confirm-card" },
      h("div", { className: "billing-confirm-title" }, t("project.billingConfirmTitle")),
      h(
        "div",
        { className: "billing-diff-line" },
        h("span", { className: "billing-diff-label" }, t("project.billingConfirmFrom")),
        h("span", { className: "billing-diff-val" }, fromLabel)
      ),
      h(
        "div",
        { className: "billing-diff-line" },
        h("span", { className: "billing-diff-label" }, t("project.billingConfirmTo")),
        h("span", { className: "billing-diff-val billing-diff-val-target" }, toLabel)
      ),
      h("div", { className: "muted-micro billing-confirm-note" }, t("project.billingConfirmNote")),
      h(
        "div",
        { className: "action-row" },
        h(
          "button",
          {
            type: "button",
            className: "btn btn-xs btn-primary billing-confirm-submit-btn",
            disabled: Boolean(state.switchingBillingProjectId),
            onClick: (ev) => {
              ev.stopPropagation();
              void handleSwitchProjectBilling(proj.projectId, targetId);
            },
          },
          confirmBtnText
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn btn-xs btn-ghost",
            disabled: isSubmitting,
            onClick: (ev) => {
              ev.stopPropagation();
              state.editingBillingProjectId = null;
              state.billingPickerValue = "";
              state.billingManualInput = "";
              state.billingSwitchError = null;
              renderApp();
            },
          },
          t("project.cancelBtn")
        )
      )
    ),
  ];
}

function renderProjectBillingDrawerSection(
  proj            ,
  overview                           
)              {
  const isEditing = state.editingBillingProjectId === proj.projectId;
  const isSubmitting = state.switchingBillingProjectId === proj.projectId;
  const currentSummary = !state.domainLoaded.billing
    ? t("loading.billingStatus")
    : proj.billingEnabled && proj.billingAccountId
      ? proj.billingAccountName && proj.billingAccountName !== proj.billingAccountId
        ? `${proj.billingAccountName} (${proj.billingAccountId})`
        : proj.billingAccountId
      : t("project.noBillingTag");

  if (!isEditing) {
    return h(
      "div",
      { className: "drawer-billing-row" },
      h(
        "div",
        { className: "drawer-billing-summary" },
        h("span", { className: "muted-micro" }, `${t("project.billingAccountLabel")}:`),
        h(
          "span",
          {
            className:
              proj.billingEnabled && proj.billingAccountId
                ? "drawer-billing-val"
                : "drawer-billing-val drawer-billing-val-off",
          },
          currentSummary
        )
      ),
      h(
        "button",
        {
          type: "button",
          className: "btn btn-xs billing-edit-toggle-btn",
          disabled: !state.domainLoaded.billing || Boolean(state.switchingBillingProjectId) || Boolean(state.deletingProjectId),
          onClick: (ev) => {
            ev.stopPropagation();
            state.editingBillingProjectId = proj.projectId;
            state.billingPickerValue = "";
            state.billingManualInput = "";
            state.billingSwitchError = null;
            if (state.deletingConfirmProjectId === proj.projectId) {
              state.deletingConfirmProjectId = null;
              state.deleteConfirmInput = "";
              state.deleteProjectError = null;
            }
            renderApp();
          },
        },
        proj.billingEnabled && proj.billingAccountId
          ? t("project.changeBillingBtn")
          : t("project.linkBillingBtn")
      )
    );
  }

  const openAccounts = overview.billingAccounts.filter((ba) => ba.open);
  const confirmSlotId = `billing-confirm-slot-${proj.projectId}`;
  const encodedId = encodeURIComponent(proj.projectId);
  const switchError =
    state.billingSwitchError?.projectId === proj.projectId ? state.billingSwitchError.message : null;

  const refreshConfirmSlot = () => {
    const slot = document.getElementById(confirmSlotId);
    if (!slot) return;
    clearElement(slot);
    for (const node of buildBillingConfirmSlotNodes(proj, state.overview)) {
      slot.appendChild(node);
    }
  };

  return h(
    "div",
    {
      className: "billing-switch-box",
      onClick: (ev) => ev.stopPropagation(),
    },
    h(
      "div",
      { className: "billing-switch-header" },
      h("span", { className: "billing-switch-label" }, t("project.billingAccountLabel")),
      h(
        "button",
        {
          type: "button",
          className: "btn btn-xs btn-ghost",
          disabled: isSubmitting,
          onClick: (ev) => {
            ev.stopPropagation();
            state.editingBillingProjectId = null;
            state.billingPickerValue = "";
            state.billingManualInput = "";
            state.billingSwitchError = null;
            renderApp();
          },
        },
        t("project.cancelBtn")
      )
    ),
    h(
      "select",
      {
        className: "compact-select billing-account-select",
        ariaLabel: t("project.billingSelectAria"),
        value: state.billingPickerValue,
        disabled: isSubmitting,
        onChange: (ev) => {
          state.billingPickerValue = (ev.target                     ).value;
          state.billingSwitchError = null;
          if (state.billingPickerValue !== BILLING_MANUAL_SENTINEL) {
            state.billingManualInput = "";
          }
          renderApp();
        },
      },
      h(
        "option",
        { value: "", selected: state.billingPickerValue === "" },
        t("project.billingSelectPlaceholder")
      ),
      ...openAccounts.map((ba) => {
        const isCurrent = proj.billingEnabled && proj.billingAccountId === ba.id;
        const label = isCurrent
          ? `${ba.displayName} (${ba.id}) ${t("project.billingCurrentSuffix")}`
          : `${ba.displayName} (${ba.id})`;
        return h(
          "option",
          {
            value: ba.id,
            disabled: isCurrent,
            selected: state.billingPickerValue === ba.id,
          },
          label
        );
      }),
      h(
        "option",
        {
          value: BILLING_MANUAL_SENTINEL,
          selected: state.billingPickerValue === BILLING_MANUAL_SENTINEL,
        },
        t("project.billingManualOption")
      )
    ),
    state.billingPickerValue === BILLING_MANUAL_SENTINEL
      ? h(
          "div",
          { className: "billing-manual-input-wrap" },
          h("input", {
            type: "text",
            className: "text-input billing-manual-id-input",
            ariaLabel: t("project.billingManualAria"),
            placeholder: t("project.billingManualPlaceholder"),
            value: state.billingManualInput,
            disabled: isSubmitting,
            onInput: (ev) => {
              state.billingManualInput = (ev.target                    ).value;
              state.billingSwitchError = null;
              refreshConfirmSlot();
            },
          }),
          h("div", { className: "muted-micro" }, t("project.billingManualFormatHint"))
        )
      : null,
    h(
      "div",
      { id: confirmSlotId, className: "billing-confirm-slot" },
      ...buildBillingConfirmSlotNodes(proj, overview)
    ),
    switchError
      ? h(
          "div",
          { className: "billing-switch-error" },
          h("div", { className: "billing-switch-error-text" }, switchError),
          h(
            "a",
            {
              className: "link-external",
              href: `https://console.cloud.google.com/billing/linkedaccount?project=${encodedId}`,
              target: "_blank",
              rel: "noopener noreferrer",
            },
            t("project.billingOpenConsoleLink")
          )
        )
      : null
  );
}

function renderProjectDeleteDrawerSection(
  proj            ,
  overview                           
)              {
  const isConfirming = state.deletingConfirmProjectId === proj.projectId;
  const isDeleting = state.deletingProjectId === proj.projectId;

  if (!isConfirming) {
    return h(
      "div",
      {
        className: "drawer-danger-row",
        onClick: (ev) => ev.stopPropagation(),
      },
      h("span", { className: "muted-micro" }, t("project.dangerZoneLabel")),
      h(
        "button",
        {
          type: "button",
          className: "btn btn-xs btn-danger-outline project-delete-toggle-btn",
          disabled: Boolean(state.deletingProjectId) || Boolean(state.switchingBillingProjectId),
          onClick: (ev) => {
            ev.stopPropagation();
            state.deletingConfirmProjectId = proj.projectId;
            state.deleteConfirmInput = "";
            state.deleteProjectError = null;
            if (state.editingBillingProjectId === proj.projectId) {
              state.editingBillingProjectId = null;
              state.billingPickerValue = "";
              state.billingManualInput = "";
              state.billingSwitchError = null;
            }
            renderApp();
          },
        },
        t("project.deleteBtn")
      )
    );
  }

  const encodedId = encodeURIComponent(proj.projectId);
  const confirmBtnId = `project-delete-submit-${proj.projectId}`;
  const isMatched = state.deleteConfirmInput.trim() === proj.projectId;
  const deleteError =
    state.deleteProjectError?.projectId === proj.projectId ? state.deleteProjectError.message : null;

  const extraWarnings           = [];
  if (proj.isActiveProject) {
    extraWarnings.push(t("project.deleteWarnActive"));
  }
  if (overview.preferences.quotaProjectOverride === proj.projectId) {
    extraWarnings.push(t("project.deleteWarnQuota"));
  }
  const hostsBqExport = Object.values(overview.preferences.billingExportTables).some(
    (m) => m.hostProjectId === proj.projectId || m.tableId.startsWith(`${proj.projectId}.`)
  );
  if (hostsBqExport) {
    extraWarnings.push(t("project.deleteWarnBqExport"));
  }

  return h(
    "div",
    {
      className: "project-delete-box",
      onClick: (ev) => ev.stopPropagation(),
    },
    h(
      "div",
      { className: "project-delete-header" },
      h("span", { className: "project-delete-title" }, t("project.deleteConfirmTitle")),
      h(
        "button",
        {
          type: "button",
          className: "btn btn-xs btn-ghost",
          disabled: isDeleting,
          onClick: (ev) => {
            ev.stopPropagation();
            state.deletingConfirmProjectId = null;
            state.deleteConfirmInput = "";
            state.deleteProjectError = null;
            renderApp();
          },
        },
        t("project.cancelBtn")
      )
    ),
    h(
      "p",
      { className: "project-delete-desc" },
      t("project.deleteConfirmDesc", { project: proj.projectId })
    ),
    extraWarnings.length > 0
      ? h(
          "ul",
          { className: "project-delete-warnings" },
          ...extraWarnings.map((w) => h("li", null, w))
        )
      : null,
    h(
      "div",
      { className: "project-delete-prompt" },
      t("project.deleteTypePrompt", { project: proj.projectId })
    ),
    h("input", {
      type: "text",
      className: "text-input project-delete-input",
      ariaLabel: t("project.deleteInputAria"),
      placeholder: proj.projectId,
      value: state.deleteConfirmInput,
      autocomplete: "off",
      spellcheck: false,
      disabled: isDeleting,
      onInput: (ev) => {
        state.deleteConfirmInput = (ev.target                    ).value;
        state.deleteProjectError = null;
        const submitBtn = document.getElementById(confirmBtnId)                            ;
        if (submitBtn) {
          submitBtn.disabled =
            Boolean(state.deletingProjectId) ||
            state.deleteConfirmInput.trim() !== proj.projectId;
        }
      },
    }),
    h(
      "div",
      { className: "action-row" },
      h(
        "button",
        {
          id: confirmBtnId,
          type: "button",
          className: "btn btn-xs btn-danger-solid project-delete-submit-btn",
          disabled: Boolean(state.deletingProjectId) || !isMatched,
          onClick: (ev) => {
            ev.stopPropagation();
            void handleDeleteProject(proj.projectId, state.deleteConfirmInput);
          },
        },
        isDeleting ? t("project.deleteDeletingBtn") : t("project.deleteConfirmSubmitBtn")
      ),
      h(
        "button",
        {
          type: "button",
          className: "btn btn-xs btn-ghost",
          disabled: isDeleting,
          onClick: (ev) => {
            ev.stopPropagation();
            state.deletingConfirmProjectId = null;
            state.deleteConfirmInput = "";
            state.deleteProjectError = null;
            renderApp();
          },
        },
        t("project.cancelBtn")
      )
    ),
    deleteError
      ? h(
          "div",
          { className: "project-delete-error" },
          h("div", { className: "billing-switch-error-text" }, deleteError),
          h(
            "a",
            {
              className: "link-external",
              href: `https://console.cloud.google.com/iam-admin/settings?project=${encodedId}`,
              target: "_blank",
              rel: "noopener noreferrer",
            },
            t("project.deleteOpenConsoleLink")
          )
        )
      : null
  );
}

function buildProjectCards(
  projects                       ,
  overview                           
)                {
  if (projects.length === 0) {
    return [
      h("div", { className: "card muted-note" }, t("projects.emptyFilter")),
    ];
  }

  const activeSpend = getActiveSpend(overview).spend;
  const defaultCurrency =
    activeSpend.totalsByCurrency[0]?.currency ||
    overview.billingAccounts.find((b) => b.currencyCode)?.currencyCode ||
    "USD";

  return projects.map((proj) => {
    const expanded = state.expandedProjectIds.has(proj.projectId);
    const ps = activeSpend.byProject[proj.projectId];
    const encodedId = encodeURIComponent(proj.projectId);

    const toggleExpand = () => {
      if (state.expandedProjectIds.has(proj.projectId)) {
        state.expandedProjectIds.delete(proj.projectId);
        if (state.editingBillingProjectId === proj.projectId) {
          state.editingBillingProjectId = null;
          state.billingPickerValue = "";
          state.billingManualInput = "";
          state.billingSwitchError = null;
        }
        if (state.deletingConfirmProjectId === proj.projectId) {
          state.deletingConfirmProjectId = null;
          state.deleteConfirmInput = "";
          state.deleteProjectError = null;
        }
      } else {
        state.expandedProjectIds.add(proj.projectId);
      }
      renderApp();
    };

    const labelEntries = proj.labels ? Object.entries(proj.labels).slice(0, 6) : [];

    return h(
      "article",
      { className: proj.isActiveProject ? "card project-card project-card-active" : "card project-card" },
      h(
        "div",
        { className: "project-card-top" },
        h(
          "button",
          {
            type: "button",
            className: proj.pinned ? "pin-btn pin-btn-on" : "pin-btn",
            title: proj.pinned ? t("project.unpinTitle") : t("project.pinTitle"),
            ariaLabel: proj.pinned
              ? t("project.unpinAria", { project: proj.projectId })
              : t("project.pinAria", { project: proj.projectId }),
            onClick: (ev) => {
              ev.stopPropagation();
              void handleTogglePinProject(proj.projectId, !proj.pinned);
            },
          },
          proj.pinned ? "★" : "☆"
        ),
        h(
          "div",
          {
            className: "project-title-group",
            onClick: toggleExpand,
          },
          h(
            "div",
            { className: "inline-badges" },
            h("span", { className: "project-name" }, proj.name),
            proj.isActiveProject
              ? h("span", { className: "badge badge-active" }, t("project.activeBadge"))
              : null
          ),
          h(
            "div",
            { className: "project-meta-line" },
            h(
              "button",
              {
                type: "button",
                className: "mono-copy-btn",
                title: t("project.copyIdTitle"),
                onClick: async (ev) => {
                  ev.stopPropagation();
                  const ok = await copyToClipboard(proj.projectId);
                  showToast(ok ? t("toast.copied", { value: proj.projectId }) : proj.projectId, "info");
                },
              },
              `${proj.projectId} ⧉`
            ),
            !state.domainLoaded.billing
              ? h("span", { className: "billing-tag" }, t("loading.billingStatus"))
              : proj.billingEnabled && proj.billingAccountName
                ? h("span", { className: "billing-tag" }, proj.billingAccountName)
                : h("span", { className: "billing-tag billing-tag-off" }, t("project.noBillingTag"))
          )
        ),
        h(
          "div",
          { className: "project-right-col" },
          ps
            ? h(
                "div",
                { className: "project-spend-stack" },
                h(
                  "span",
                  { className: "amount-strong" },
                  formatMoney(ps.currentMonthNetCost, ps.currency)
                ),
                isCreditCoveredZeroNet(ps.currentMonthNetCost, ps.currentMonthGrossCost)
                  ? h(
                      "span",
                      { className: "muted-micro" },
                      t("chart.grossShort", {
                        amount: formatMoney(ps.currentMonthGrossCost, ps.currency),
                      })
                    )
                  : null
              )
            : isSpendExpected(overview) && !state.domainLoaded.spend
              ? h("span", { className: "skeleton sk-amt-sm", ariaHidden: "true" })
              : activeSpend.configured
                ? h("span", { className: "muted-micro" }, formatMoney(0, defaultCurrency))
                : null,
          h(
            "div",
            { className: "project-btn-group" },
            !proj.isActiveProject
              ? h(
                  "button",
                  {
                    type: "button",
                    className: "btn btn-xs",
                    onClick: (ev) => {
                      ev.stopPropagation();
                      void handleSwitchActiveProject(proj.projectId, "toast.switchedProject");
                    },
                  },
                  t("project.setActiveBtn")
                )
              : null,
            h(
              "button",
              {
                type: "button",
                className: "btn btn-xs btn-ghost",
                ariaExpanded: String(expanded),
                onClick: (ev) => {
                  ev.stopPropagation();
                  toggleExpand();
                },
              },
              expanded ? t("project.hideBtn") : t("project.detailsBtn")
            )
          )
        )
      ),
      expanded
        ? h(
            "div",
            { className: "project-drawer" },
            h(
              "div",
              { className: "drawer-meta-row" },
              h(
                "span",
                { className: "muted-micro" },
                t("project.projectNumber", { number: proj.projectNumber || "—" })
              ),
              proj.billingAccountId
                ? h(
                    "span",
                    { className: "muted-micro" },
                    t("project.billingId", { id: proj.billingAccountId })
                  )
                : null,
              ...labelEntries.map(([k, v]) =>
                h("span", { className: "label-chip" }, `${k}:${v}`)
              )
            ),
            renderProjectBillingDrawerSection(proj, overview),
            ps
              ? h(
                  "div",
                  { className: "drawer-spend-block" },
                  h(
                    "div",
                    { className: "drawer-spend-summary" },
                    h(
                      "span",
                      null,
                      t("spend.gross", { amount: formatMoney(ps.currentMonthGrossCost, ps.currency) })
                    ),
                    h(
                      "span",
                      { className: "submetric-credit" },
                      t("spend.credits", { amount: formatMoney(ps.currentMonthCredits, ps.currency) })
                    ),
                    renderDeltaBadge(ps.deltaPercentVsPrevSameDay)
                  ),
                  renderServiceBreakdownList(ps.topServices, ps.currency)
                )
              : isSpendExpected(overview) && !state.domainLoaded.spend
                ? renderSectionLoadingPill(t("loading.spend"))
                : h(
                    "div",
                    { className: "muted-note" },
                    overview.spend.configured
                      ? t("project.noBqCostThisMonth")
                      : t("project.connectBqForCosts")
                  ),
            h(
              "div",
              { className: "console-links-row" },
              h(
                "a",
                {
                  className: "console-chip",
                  href: `https://console.cloud.google.com/home/dashboard?project=${encodedId}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                t("project.linkDashboard")
              ),
              h(
                "a",
                {
                  className: "console-chip",
                  href: proj.billingAccountId
                    ? `https://console.cloud.google.com/billing/${encodeURIComponent(proj.billingAccountId)}/reports;projects=${encodedId}`
                    : `https://console.cloud.google.com/billing?project=${encodedId}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                t("project.linkBillingReport")
              ),
              h(
                "a",
                {
                  className: "console-chip",
                  href: `https://console.cloud.google.com/run?project=${encodedId}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                t("project.linkCloudRun")
              ),
              h(
                "a",
                {
                  className: "console-chip",
                  href: `https://console.cloud.google.com/bigquery?project=${encodedId}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                t("project.linkBigQuery")
              ),
              h(
                "a",
                {
                  className: "console-chip",
                  href: `https://console.cloud.google.com/logs/query?project=${encodedId}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                t("project.linkLogs")
              )
            ),
            renderProjectDeleteDrawerSection(proj, overview)
          )
        : null
    );
  });
}

function renderLinkedProjectsForBillingAccount(
  ba                ,
  overview                           
)              {
  if (ba.linkedProjectIds.length === 0) {
    return h(
      "div",
      { className: "linked-projects-empty muted-micro" },
      t("billing.noLinkedProjects")
    );
  }

  const projectMap = new Map                    ();
  for (const p of overview.projects) {
    projectMap.set(p.projectId, p);
  }

  const isLinkedExpanded = state.expandedBillingLinkedIds.has(ba.id);
  const visibleProjectIds = isLinkedExpanded
    ? ba.linkedProjectIds
    : ba.linkedProjectIds.slice(0, LINKED_PROJECTS_PREVIEW_LIMIT);

  const activeSpend = getActiveSpend(overview).spend;
  const rows = visibleProjectIds.map((projId) => {
    const proj = projectMap.get(projId);
    const ps = activeSpend.byProject[projId];
    const displayName = proj ? proj.name : projId;
    const isActive = proj ? proj.isActiveProject : overview.auth.activeProject === projId;

    return h(
      "div",
      { className: "compact-row linked-project-row" },
      h(
        "div",
        { className: "compact-row-main" },
        h(
          "div",
          { className: "inline-badges" },
          proj?.pinned ? h("span", { className: "star-active" }, "★") : null,
          h("span", { className: "row-primary-text" }, displayName),
          isActive ? h("span", { className: "badge badge-active" }, t("billing.activeUpperBadge")) : null
        ),
        h("span", { className: "row-mono" }, projId)
      ),
      h(
        "div",
        { className: "compact-row-actions" },
        ps
          ? h(
              "div",
              { className: "project-spend-stack" },
              h(
                "span",
                { className: "amount-strong" },
                formatMoney(ps.currentMonthNetCost, ps.currency)
              ),
              isCreditCoveredZeroNet(ps.currentMonthNetCost, ps.currentMonthGrossCost)
                ? h(
                    "span",
                    { className: "muted-micro" },
                    t("chart.grossShort", {
                      amount: formatMoney(ps.currentMonthGrossCost, ps.currency),
                    })
                  )
                : null
            )
          : isSpendExpected(overview) && !state.domainLoaded.spend
            ? h("span", { className: "skeleton sk-amt-sm", ariaHidden: "true" })
            : null,
        !isActive
          ? h(
              "button",
              {
                type: "button",
                className: "btn btn-xs",
                title: t("billing.setActiveTitle", { project: projId }),
                onClick: () => {
                  void handleSwitchActiveProject(projId, "toast.activeProjectSet");
                },
              },
              t("project.setActiveBtn")
            )
          : null,
        h(
          "a",
          {
            className: "icon-link",
            href: `https://console.cloud.google.com/home/dashboard?project=${encodeURIComponent(
              projId
            )}`,
            target: "_blank",
            rel: "noopener noreferrer",
            title: t("billing.openProjectConsoleTitle", { project: projId }),
          },
          "↗"
        )
      )
    );
  });

  return h(
    "div",
    { className: "linked-projects-block" },
    h(
      "div",
      { className: "linked-projects-header" },
      h(
        "span",
        { className: "eyebrow" },
        t("billing.linkedProjectsHeader", { count: ba.linkedProjectIds.length })
      ),
      h(
        "button",
        {
          type: "button",
          className: "link-btn",
        onClick: () => {
            state.activeTab = "projects";
            state.projectFilter = `ba:${ba.id}`;
            state.projectPageLimit = PROJECT_PAGE_SIZE;
            renderApp();
          },
        },
        t("billing.filterInProjectsBtn")
      )
    ),
    h("div", { className: "compact-list" }, ...rows),
    ba.linkedProjectIds.length > LINKED_PROJECTS_PREVIEW_LIMIT
      ? h(
          "button",
          {
            type: "button",
            className: "btn btn-xs btn-ghost linked-projects-more",
            onClick: () => {
              if (isLinkedExpanded) {
                state.expandedBillingLinkedIds.delete(ba.id);
              } else {
                state.expandedBillingLinkedIds.add(ba.id);
              }
              renderApp();
            },
          },
          isLinkedExpanded
            ? t("projects.collapseListBtn")
            : t("billing.showAllLinkedBtn", { count: ba.linkedProjectIds.length })
        )
      : null
  );
}

function renderBillingAccountCard(
  ba                ,
  overview                           
)              {
  const active = getActiveSpend(overview);
  const bs = active.spend.byBillingAccount[ba.id];

  return h(
    "article",
    { className: "card billing-card" },
    h(
      "div",
      { className: "billing-header-row" },
      h(
        "div",
        null,
        h(
          "div",
          { className: "inline-badges" },
          h("h3", { className: "section-title" }, ba.displayName),
          h("span", { className: "badge badge-active" }, t("billing.statusOpen")),
          ba.currencyCode
            ? h("span", { className: "badge badge-neutral" }, ba.currencyCode)
            : null
        ),
        h(
          "div",
          { className: "project-meta-line" },
          h(
            "button",
            {
              type: "button",
              className: "mono-copy-btn",
              title: t("billing.copyIdTitle"),
              onClick: async () => {
                const ok = await copyToClipboard(ba.id);
                showToast(ok ? t("toast.copied", { value: ba.id }) : ba.id, "info");
              },
            },
            `${ba.id} ⧉`
          ),
          h(
            "span",
            { className: "muted-micro" },
            formatLinkedProjectCount(ba.linkedProjectCount)
          )
        )
      ),
      h(
        "a",
        {
          className: "btn btn-xs",
          href: withConsoleProject(
            `https://console.cloud.google.com/billing/${encodeURIComponent(ba.id)}/reports`,
            ba.linkedProjectIds[0] || getPreferredConsoleProject(overview)
          ),
          target: "_blank",
          rel: "noopener noreferrer",
        },
        t("billing.consoleReportBtn")
      )
    ),
    renderLinkedProjectsForBillingAccount(ba, overview),
    bs
      ? h(
          "div",
          { className: "billing-spend-box" },
          h(
            "div",
            { className: "billing-spend-top" },
            h(
              "div",
              null,
              h(
                "div",
                { className: "eyebrow" },
                active.isCurrentMonth
                  ? t("billing.mtdNetLabel")
                  : t("overview.monthlyNetSpend", {
                      month: formatMonthLabel(active.selectedMonth),
                    })
              ),
              h(
                "div",
                { className: "billing-net-figure" },
                formatMoney(bs.currentMonthNetCost, bs.currency)
              )
            ),
            renderDeltaBadge(bs.deltaPercentVsPrevSameDay)
          ),
          h(
            "div",
            { className: "hero-submetrics" },
            h(
              "span",
              null,
              t("spend.gross", { amount: formatMoney(bs.currentMonthGrossCost, bs.currency) })
            ),
            h(
              "span",
              { className: "submetric-credit" },
              t("spend.credits", { amount: formatMoney(bs.currentMonthCredits, bs.currency) })
            ),
            h(
              "span",
              null,
              t("spend.lastMonthShort", {
                amount: formatMoney(bs.prevMonthTotalNetCost, bs.currency),
              })
            )
          ),
          renderDailySparkline(bs.dailySeries, bs.currency, undefined, bs.forecast),
          renderServiceBreakdownList(bs.topServices.slice(0, 4), bs.currency)
        )
      : ba.open && ba.exportTableId && !state.domainLoaded.spend && state.domainLoading.spend
        ? h(
            "div",
            { className: "billing-spend-box", ariaBusy: "true" },
            renderSectionLoadingPill(t("loading.spend")),
            h("div", { className: "skeleton sk-hero-amt", ariaHidden: "true" })
          )
        : ba.open
          ? h(
              "div",
              { className: "muted-note billing-export-hint" },
              ba.exportTableId
                ? t("billing.boundNoRows", { table: ba.exportTableId })
                : t("billing.linkExportHint")
            )
          : null,
    ba.budgets.length > 0
      ? h(
          "div",
          { className: "budgets-block" },
          h("div", { className: "eyebrow" }, t("billing.configuredBudgets", { count: ba.budgets.length })),
          ...ba.budgets.map((b) => {
            const targetText =
              b.amountUnits !== null
                ? formatMoney(b.amountUnits, b.currencyCode || bs?.currency || "USD")
                : b.lastPeriodAmount
                  ? t("billing.budgetLastPeriod")
                  : t("billing.budgetCustomTarget");
            const rulesText =
              b.thresholds.length > 0
                ? b.thresholds
                    .map((rule) => `${Math.round(rule.thresholdPercent * 100)}%`)
                    .join(" · ")
                : t("billing.budgetNoThresholds");
            return h(
              "div",
              { className: "budget-row" },
              h("span", { className: "budget-name" }, b.displayName),
              h("span", { className: "budget-meta" }, `${targetText} (${rulesText})`)
            );
          })
        )
      : ba.open && state.domainLoading.budgets && !state.domainLoaded.budgets
        ? h(
            "div",
            { className: "budgets-block" },
            renderSectionLoadingPill(t("loading.budgets"))
          )
        : null
  );
}

function renderBillingExportSetupCard(overview                           )              {
  const existingMappings = Object.values(overview.preferences.billingExportTables);

  const projectSuggestions = overview.projects.map((p) =>
    h(
      "option",
      {
        value: p.projectId,
        selected: p.projectId === state.discoverHostProject,
      },
      `${p.name} (${p.projectId})`
    )
  );

  const accountTargetOptions = [
    h(
      "option",
      { value: "*", selected: state.manualBillingAccountId === "*" },
      t("export.allAccountsOption")
    ),
    ...overview.billingAccounts.map((ba) =>
      h(
        "option",
        { value: ba.id, selected: state.manualBillingAccountId === ba.id },
        `${ba.displayName} (${ba.id})`
      )
    ),
  ];

  return h(
    "section",
    { className: "card" },
    h("h3", { className: "section-title" }, t("export.title")),
    h("p", { className: "card-desc" }, t("export.desc")),
    existingMappings.length > 0
      ? h(
          "div",
          { className: "mapped-tables-list" },
          ...existingMappings.map((m) =>
            h(
              "div",
              { className: "mapped-table-row" },
              h(
                "div",
                { className: "compact-row-main" },
                h(
                  "span",
                  { className: "row-primary-text" },
                  m.billingAccountId === "*"
                    ? t("export.sharedMapping")
                    : t("export.accountMapping", { id: m.billingAccountId })
                ),
                h("span", { className: "row-mono" }, m.tableId)
              ),
              h(
                "button",
                {
                  type: "button",
                  className: "btn btn-xs btn-danger-outline",
                  onClick: async () => {
                    try {
                      state.selectedInvoiceMonth = "";
                      const updated = await configureExportTableApi({
                        billingAccountId: m.billingAccountId,
                        remove: true,
                      });
                      applyFullOverview(updated);
                      renderApp();
                      showToast(t("toast.removedExportMapping"), "info");
                    } catch (err) {
                      showToast(
                        err instanceof Error ? err.message : t("toast.removeExportFailed"),
                        "error"
                      );
                    }
                  },
                },
                t("export.unlinkBtn")
              )
            )
          )
        )
      : null,

    // Step 1: Auto-Detect in a Host Project
    h(
      "div",
      { className: "setup-subbox" },
      h("div", { className: "eyebrow" }, t("export.autoDetectLabel")),
      overview.projects.length > 0
        ? h("datalist", { id: "host-projects-datalist" }, ...projectSuggestions)
        : null,
      h(
        "div",
        { className: "form-inline-row" },
        h("input", {
          id: "export-host-input",
          type: "text",
          list: overview.projects.length > 0 ? "host-projects-datalist" : undefined,
          className: "text-input flex-1",
          placeholder: t("export.hostProjectPlaceholder"),
          value: state.discoverHostProject,
          ariaLabel: t("export.hostProjectAria"),
          onInput: (ev) => {
            state.discoverHostProject = (ev.target                    ).value;
          },
        }),
        h(
          "button",
          {
            type: "button",
            className: "btn btn-sm",
            disabled: state.discoveringTables,
            onClick: async () => {
              const host = state.discoverHostProject.trim();
              if (!host) {
                showToast(t("toast.enterHostProject"), "error");
                return;
              }
              try {
                state.discoveringTables = true;
                renderApp();
                state.discoveredTables = await discoverExportTablesApi(host);
                if (state.discoveredTables.length === 0) {
                  showToast(t("toast.noExportTablesFound", { project: host }), "info");
                } else {
                  showToast(
                    t("toast.foundExportTables", { count: state.discoveredTables.length }),
                    "success"
                  );
                }
              } catch (err) {
                showToast(
                  err instanceof Error ? err.message : t("toast.discoveryFailed"),
                  "error"
                );
              } finally {
                state.discoveringTables = false;
                renderApp();
              }
            },
          },
          state.discoveringTables ? t("export.scanningBtn") : t("export.scanDatasetsBtn")
        )
      ),
      state.discoveredTables && state.discoveredTables.length > 0
        ? h(
            "div",
            { className: "discovered-list" },
            ...state.discoveredTables.map((tbl) =>
              h(
                "div",
                { className: "mapped-table-row" },
                h(
                  "div",
                  { className: "compact-row-main" },
                  h(
                    "span",
                    { className: "row-primary-text" },
                    `${tbl.datasetId}.${tbl.tableName} (${tbl.exportType})`
                  ),
                  h(
                    "span",
                    { className: "row-mono" },
                    tbl.inferredBillingAccountId
                      ? t("export.matchesBillingId", { id: tbl.inferredBillingAccountId })
                      : t("export.sharedCustomExport")
                  )
                ),
                h(
                  "button",
                  {
                    type: "button",
                    className: "btn btn-xs btn-primary",
                    onClick: async () => {
                      try {
                        state.refreshing = true;
                        renderApp();
                        state.selectedInvoiceMonth = "";
                        const updated = await configureExportTableApi({
                          billingAccountId: tbl.inferredBillingAccountId || "*",
                          tableId: tbl.tableId,
                          hostProjectId: tbl.hostProjectId,
                        });
                        applyFullOverview(updated);
                        showToast(t("toast.connectedExport"), "success");
                      } catch (err) {
                        showToast(
                          err instanceof Error ? err.message : t("toast.connectExportFailed"),
                          "error"
                        );
                      } finally {
                        state.refreshing = false;
                        renderApp();
                      }
                    },
                  },
                  t("export.linkAndQueryBtn")
                )
              )
            )
          )
        : null
    ),

    // Step 2: Manual Table Reference Input
    h(
      "form",
      {
        className: "setup-subbox",
        onSubmit: async () => {
          const tableId = state.manualTableId.trim();
          if (!tableId) {
            showToast(t("toast.enterTableId"), "error");
            return;
          }
          try {
            state.refreshing = true;
            renderApp();
            state.selectedInvoiceMonth = "";
            const updated = await configureExportTableApi({
              billingAccountId: state.manualBillingAccountId || "*",
              tableId,
            });
            applyFullOverview(updated);
            state.manualTableId = "";
            showToast(t("toast.savedExportTable"), "success");
          } catch (err) {
            showToast(err instanceof Error ? err.message : t("toast.invalidTableRef"), "error");
          } finally {
            state.refreshing = false;
            renderApp();
          }
        },
      },
      h("div", { className: "eyebrow" }, t("export.manualBindLabel")),
      h(
        "select",
        {
          className: "compact-select full-width",
          ariaLabel: t("export.targetAccountAria"),
          onChange: (ev) => {
            state.manualBillingAccountId = (ev.target                     ).value;
          },
        },
        ...accountTargetOptions
      ),
      h(
        "div",
        { className: "form-inline-row" },
        h("input", {
          id: "export-manual-table-input",
          type: "text",
          className: "text-input flex-1",
          placeholder: "project_id.dataset.gcp_billing_export_v1_XXXXXX_XXXXXX_XXXXXX",
          value: state.manualTableId,
          onInput: (ev) => {
            state.manualTableId = (ev.target                    ).value;
          },
        }),
        h(
          "button",
          { type: "submit", className: "btn btn-sm btn-primary", disabled: state.refreshing },
          t("export.saveBtn")
        )
      )
    ),

    h(
      "details",
      { className: "help-details" },
      h("summary", null, t("export.helpSummary")),
      h(
        "ol",
        { className: "guide-steps" },
        h("li", null, t("export.helpStep1")),
        h("li", null, t("export.helpStep2")),
        h("li", null, t("export.helpStep3")),
        h("li", null, t("export.helpStep4"))
      ),
      h(
        "a",
        {
          className: "link-external",
          href: withConsoleProject(
            "https://console.cloud.google.com/billing",
            state.discoverHostProject.trim() || getPreferredConsoleProject(overview)
          ),
          target: "_blank",
          rel: "noopener noreferrer",
        },
        t("export.openBillingConsole")
      )
    )
  );
}

function renderPluginUpdateSection(overview                           )              {
  const upd = overview.pluginUpdate;
  const currentVersion = upd?.currentVersion || "1.2.0";
  const autoUpdate = overview.preferences.autoUpdatePlugin !== false;

  const statusBadge =
    upd?.restartRequired && upd.updatedToVersion
      ? h(
          "span",
          { className: "badge badge-good" },
          t("update.statusUpdatedRestart", { version: upd.updatedToVersion })
        )
      : upd?.updateAvailable && upd.latestVersion
        ? h(
            "span",
            { className: "badge badge-warn" },
            t("update.statusAvailable", { version: upd.latestVersion })
          )
        : h("span", { className: "badge badge-neutral" }, t("update.statusUpToDate"));

  return h(
    "div",
    { className: "settings-section" },
    h("div", { className: "eyebrow" }, t("update.sectionTitle")),
    h(
      "div",
      { className: "update-status-box" },
      h(
        "div",
        { className: "update-status-row" },
        h(
          "span",
          { className: "row-mono" },
          t("update.currentVersionLabel", { version: currentVersion })
        ),
        statusBadge
      ),
      h(
        "label",
        { className: "settings-toggle-row" },
        h("span", null, t("update.autoUpdateToggle")),
        h("input", {
          type: "checkbox",
          checked: autoUpdate,
          onChange: async (ev) => {
            const nextAuto = (ev.target                    ).checked;
            try {
              const updated = await updateCompanionPreferences({ autoUpdatePlugin: nextAuto });
              applyLocalMutationOverview(updated);
              renderApp();
            } catch (err) {
              showToast(
                err instanceof Error ? err.message : t("toast.prefUpdateFailed"),
                "error"
              );
            }
          },
        })
      ),
      h(
        "div",
        { className: "action-row" },
        upd?.updateAvailable && upd.latestVersion && !upd.restartRequired
          ? h(
              "button",
              {
                type: "button",
                className: "btn btn-xs btn-primary",
                disabled: state.applyingPluginUpdate,
                onClick: () => handleInstallPluginUpdate(),
              },
              state.applyingPluginUpdate
                ? t("update.installingBtn")
                : t("update.installBtn", { version: upd.latestVersion })
            )
          : null,
        h(
          "button",
          {
            type: "button",
            className: "btn btn-xs",
            disabled: state.checkingPluginUpdate || state.applyingPluginUpdate,
            onClick: () => handleCheckPluginUpdate(),
          },
          state.checkingPluginUpdate ? t("update.checkingBtn") : t("update.checkBtn")
        )
      )
    )
  );
}

function renderSettingsBodyContent(overview                           )                {
  const currentHours = overview.preferences.cacheTtlHours;
  const mask = overview.preferences.maskEmails;
  const quotaInputVal =
    state.settingsQuotaDraft !== null
      ? state.settingsQuotaDraft
      : overview.preferences.quotaProjectOverride || "";
  const gcloudPathVal =
    state.settingsGcloudDraft !== null
      ? state.settingsGcloudDraft
      : overview.preferences.gcloudPathOverride || "";

  return [
    h(
      "label",
      { className: "field-label" },
      t("settings.languageLabel"),
      renderLanguageSelect()
    ),
    h(
      "label",
      { className: "field-label" },
      t("settings.cacheTtlLabel"),
      h(
        "select",
        {
          className: "compact-select full-width",
          onChange: async (ev) => {
            const hrs = Number((ev.target                     ).value);
            const updated = await updateCompanionPreferences({ cacheTtlHours: hrs });
            applyLocalMutationOverview(updated);
            renderApp();
            showToast(t("toast.cacheTtlSet", { hours: hrs }), "success");
          },
        },
        ...[1, 6, 12, 24].map((hr) =>
          h(
            "option",
            { value: String(hr), selected: Math.round(currentHours) === hr },
            hr === 6
              ? t("settings.hoursRecommended")
              : hr === 1
                ? t("settings.hourOne")
                : t("settings.hoursMany", { hours: hr })
          )
        )
      )
    ),
    h(
      "div",
      { className: "settings-section" },
      h("div", { className: "eyebrow" }, t("settings.privacySection")),
      h(
        "label",
        { className: "settings-toggle-row" },
        h("span", null, t("settings.maskEmailToggle")),
        h("input", {
          type: "checkbox",
          checked: mask,
          onChange: async (ev) => {
            const nextMask = (ev.target                    ).checked;
            try {
              const updated = await updateCompanionPreferences({ maskEmails: nextMask });
              applyLocalMutationOverview(updated);
              renderApp();
            } catch (err) {
              showToast(
                err instanceof Error ? err.message : t("toast.prefUpdateFailed"),
                "error"
              );
            }
          },
        })
      ),
      h(
        "button",
        {
          type: "button",
          className: "btn btn-sm full-width",
          onClick: () => {
            const nextDemo = !overview.preferences.demoMode;
            void handleToggleDemoMode(nextDemo, nextDemo ? t("toast.demoOn") : t("toast.demoOff"));
          },
        },
        overview.preferences.demoMode ? t("settings.switchToLiveBtn") : t("settings.enableDemoBtn")
      )
    ),
    renderPluginUpdateSection(overview),
    h(
      "details",
      { className: "settings-advanced-details" },
      h("summary", { className: "settings-summary" }, t("settings.advancedSummary")),
      h(
        "div",
        { className: "settings-body" },
        h(
          "label",
          { className: "field-label" },
          t("settings.quotaProjectLabel"),
          h("input", {
            id: "settings-quota-input",
            type: "text",
            className: "text-input full-width",
            placeholder: t("settings.quotaProjectPlaceholder"),
            value: quotaInputVal,
            onInput: (ev) => {
              state.settingsQuotaDraft = (ev.target                    ).value;
            },
          })
        ),
        h(
          "label",
          { className: "field-label" },
          t("settings.gcloudPathLabel"),
          h("input", {
            id: "settings-gcloud-input",
            type: "text",
            className: "text-input full-width",
            placeholder: "/opt/homebrew/bin/gcloud",
            value: gcloudPathVal,
            onInput: (ev) => {
              state.settingsGcloudDraft = (ev.target                    ).value;
            },
          })
        ),
        h(
          "div",
          { className: "action-row" },
          h(
            "button",
            {
              type: "button",
              className: "btn btn-sm btn-primary",
              onClick: async () => {
                try {
                  const nextQuota =
                    (state.settingsQuotaDraft !== null ? state.settingsQuotaDraft : quotaInputVal)
                      .trim() || null;
                  const nextGcloud =
                    (state.settingsGcloudDraft !== null ? state.settingsGcloudDraft : gcloudPathVal)
                      .trim() || null;
                  const boot = await updateCloudPreferencesProgressive({
                    quotaProjectOverride: nextQuota,
                    gcloudPathOverride: nextGcloud,
                  });
                  state.settingsQuotaDraft = null;
                  state.settingsGcloudDraft = null;
                  state.overview = {
                    ...state.overview,
                    auth: boot.auth,
                    preferences: boot.preferences,
                    pluginUpdate: boot.pluginUpdate ?? state.overview.pluginUpdate,
                  };
                  showToast(t("toast.savedSettings"), "success");
                  await loadData(false, { resetSections: true });
                } catch (err) {
                  showToast(
                    err instanceof Error ? err.message : t("toast.invalidSettings"),
                    "error"
                  );
                }
              },
            },
            t("settings.applyBtn")
          )
        )
      )
    ),
  ];
}

function renderSettingsMenuOverlay(overview                           )                     {
  if (!state.settingsMenuOpen) return null;

  return h(
    "div",
    {
      className: "settings-backdrop",
      onClick: (ev) => {
        if (ev.target === ev.currentTarget) {
          state.settingsMenuOpen = false;
          renderApp();
        }
      },
    },
    h(
      "section",
      {
        className: "settings-menu-panel",
        role: "dialog",
        ariaLabel: t("settings.menuTitle"),
      },
      h(
        "div",
        { className: "settings-menu-header" },
        h("h3", { className: "settings-menu-title" }, `⚙ ${t("settings.menuTitle")}`),
        h(
          "button",
          {
            type: "button",
            className: "icon-btn",
            ariaLabel: t("settings.closeBtnAria"),
            title: t("settings.closeBtnAria"),
            onClick: () => {
              state.settingsMenuOpen = false;
              renderApp();
            },
          },
          "✕"
        )
      ),
      ...renderSettingsBodyContent(overview)
    )
  );
}

function renderSettingsDetails(overview                           )              {
  return h(
    "details",
    { className: "card settings-details" },
    h("summary", { className: "settings-summary" }, t("settings.summary")),
    h("div", { className: "settings-body" }, ...renderSettingsBodyContent(overview))
  );
}

function renderBillingTab(overview                           )              {
  const billingReady = state.domainLoaded.billing;
  const billingApiPrompt = billingReady ? renderBillingApiSetupPrompt(overview) : null;
  const otherWarnings = getNonBillingApiWarnings(overview);
  const warningSection =
    otherWarnings.length > 0
      ? h(
          "section",
          { className: "card warning-card" },
          h("h3", { className: "section-title" }, t("billing.diagnosticsTitle")),
          ...otherWarnings.map((w) => renderWarningLine(w, getPreferredConsoleProject(overview)))
        )
      : null;

  const active = getActiveSpend(overview);
  const activeAccounts = overview.billingAccounts.filter((ba) => ba.open);

  return h(
    "div",
    { className: "tab-panel" },
    billingApiPrompt,
    warningSection,
    active.spend.configured && active.hasAnyMonthRows ? renderMonthSwitcher(active) : null,
    !billingReady
      ? state.domainErrors.billing
        ? renderSectionErrorCard(state.domainErrors.billing, () => {
            void retryBillingDomain();
          })
        : renderBillingCardsSkeleton(2)
      : activeAccounts.length > 0
        ? h(
            "div",
            { className: "stack-list card-hydrated" },
            ...activeAccounts.map((ba) => renderBillingAccountCard(ba, overview))
          )
        : billingApiPrompt
          ? null
          : h("div", { className: "card muted-note" }, t("billing.noAccountsVisible")),
    renderBillingExportSetupCard(overview),
    renderSettingsDetails(overview)
  );
}

                           
             
                                
                              
 

function captureFocusedInput()                         {
  if (typeof document === "undefined" || !document) return null;
  const active = (document                               ).activeElement;
  if (!active || !(active instanceof HTMLInputElement) || !active.id) {
    return null;
  }
  let selectionStart                = null;
  let selectionEnd                = null;
  try {
    selectionStart = typeof active.selectionStart === "number" ? active.selectionStart : null;
    selectionEnd = typeof active.selectionEnd === "number" ? active.selectionEnd : null;
  } catch {
    // Some input types (e.g. checkbox) do not support selectionStart
  }
  return { id: active.id, selectionStart, selectionEnd };
}

function restoreFocusedInput(saved                        )       {
  if (!saved || typeof document === "undefined" || !document) return;
  const next = document.getElementById(saved.id);
  if (!next || !(next instanceof HTMLInputElement)) return;
  if (typeof next.focus === "function") {
    try {
      next.focus({ preventScroll: true });
    } catch {
      next.focus();
    }
  }
  if (
    saved.selectionStart !== null &&
    saved.selectionEnd !== null &&
    typeof next.setSelectionRange === "function"
  ) {
    try {
      next.setSelectionRange(saved.selectionStart, saved.selectionEnd);
    } catch {
      // Ignore input types that disallow selection ranges
    }
  }
}

function renderApp()       {
  if (typeof document === "undefined" || !document) return;
  if (document.documentElement) {
    document.documentElement.lang = getActiveLocale();
  }

  const root = document.getElementById("app");
  if (!root) return;
  const savedFocus = captureFocusedInput();
  clearElement(root);

  const overview = state.overview;
  root.appendChild(renderHeader(overview));
  const settingsOverlay = renderSettingsMenuOverlay(overview);
  if (settingsOverlay) {
    root.appendChild(settingsOverlay);
  }

  if (state.domainErrors.bootstrap && !state.domainLoaded.bootstrap) {
    root.appendChild(
      h(
        "main",
        { className: "main-body" },
        h(
          "div",
          { className: "card error-card" },
          h("h2", { className: "card-title" }, t("boot.errorTitle")),
          h("p", { className: "card-desc" }, state.domainErrors.bootstrap || t("boot.unknownError")),
          h(
            "button",
            {
              type: "button",
              className: "btn btn-primary",
              onClick: () => {
                void loadData(false);
              },
            },
            t("boot.retry")
          )
        )
      )
    );
    bindLogoSources(root);
    restoreFocusedInput(savedFocus);
    return;
  }

  if (state.domainLoaded.bootstrap && !overview.auth.authenticated && !overview.preferences.demoMode) {
    root.appendChild(h("main", { className: "main-body" }, renderUnauthenticatedView(overview)));
    bindLogoSources(root);
    restoreFocusedInput(savedFocus);
    return;
  }

  root.appendChild(renderTabNav(overview));

  let activeContent             ;
  if (state.activeTab === "projects") {
    activeContent = renderProjectsTab(overview);
  } else if (state.activeTab === "billing") {
    activeContent = renderBillingTab(overview);
  } else {
    activeContent = renderOverviewTab(overview);
  }

  root.appendChild(
    h(
      "main",
      {
        className: "main-body",
        ariaBusy: isAnyCoreDomainLoading() ? "true" : undefined,
      },
      activeContent
    )
  );
  bindLogoSources(root);
  restoreFocusedInput(savedFocus);
}

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("keydown", (ev               ) => {
    if (ev.key === "Escape" && state.settingsMenuOpen) {
      state.settingsMenuOpen = false;
      renderApp();
    }
  });
}

void loadData(false);

})();
