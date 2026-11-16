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
  "spend.lastMonthShort": "Last mo: {amount}",
  "chart.noDailyUsage": "No daily usage rows for this month yet",
  "chart.dailyTrendAria": "Daily net spend trend ({days} days)",
  "chart.peakPerDay": "Peak {amount}/d",
  "chart.noBillableServices": "No billable service usage recorded this month.",
  "chart.grossCreditsHint": "Gross {gross}, Credits {credits}",

  // Overview Tab
  "overview.cliRecommendedBadge": "CLI RECOMMENDED",
  "overview.cliNotFoundTitle": "Google Cloud CLI (`gcloud`) Not Found",
  "overview.cliNotFoundDesc":
    "Connected using saved Application Default Credentials, but `gcloud` CLI was not found on your computer. Install `gcloud` to enable account switching and CLI project sync.",
  "overview.installCliBtn": "Install gcloud CLI ↗",
  "overview.mtdNetSpend": "Month-to-Date Net Spend ({month})",
  "overview.spendBreakdownTitle": "Current Spend Breakdown",
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
  "project.noBqCostThisMonth": "No BigQuery cost entries recorded for this project in the current month.",
  "project.connectBqForCosts":
    "Connect BigQuery Billing Export in the Billing tab to view per-service costs here.",
  "project.linkDashboard": "Dashboard ↗",
  "project.linkBillingReport": "Billing Report ↗",
  "project.linkCloudRun": "Cloud Run ↗",
  "project.linkBigQuery": "BigQuery ↗",
  "project.linkLogs": "Logs ↗",

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
  "billing.closedAccountsSummary": "Closed / Inactive Billing Accounts ({count})",
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
}         ;

                                                      
                                                                


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
  "spend.lastMonthShort": "前月: {amount}",
  "chart.noDailyUsage": "今月の日別利用データはまだありません",
  "chart.dailyTrendAria": "日別純支出トレンド（{days}日間）",
  "chart.peakPerDay": "最大 {amount}/日",
  "chart.noBillableServices": "今月記録された課金対象サービスの利用はありません。",
  "chart.grossCreditsHint": "割引前 {gross}、クレジット {credits}",

  // Overview Tab
  "overview.cliRecommendedBadge": "CLI 推奨",
  "overview.cliNotFoundTitle": "Google Cloud CLI (`gcloud`) が見つかりません",
  "overview.cliNotFoundDesc":
    "保存済みのアプリケーションのデフォルト認証情報 (ADC) で接続していますが、`gcloud` CLI が見つかりません。アカウント切り替えや CLI プロジェクト同期を使うには `gcloud` をインストールしてください。",
  "overview.installCliBtn": "gcloud CLI をインストール ↗",
  "overview.mtdNetSpend": "今月の純支出（月初来・{month}）",
  "overview.spendBreakdownTitle": "今月の支出内訳",
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
  "project.noBqCostThisMonth": "今月このプロジェクトの BigQuery コスト明細は記録されていません。",
  "project.connectBqForCosts":
    "サービス別のコストを表示するには、「請求」タブで BigQuery 課金データエクスポートを連携してください。",
  "project.linkDashboard": "ダッシュボード ↗",
  "project.linkBillingReport": "課金レポート ↗",
  "project.linkCloudRun": "Cloud Run ↗",
  "project.linkBigQuery": "BigQuery ↗",
  "project.linkLogs": "ログ ↗",

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
  "billing.closedAccountsSummary": "閉鎖・非アクティブな請求先アカウント ({count})",
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
  "spend.lastMonthShort": "전월: {amount}",
  "chart.noDailyUsage": "이번 달 일별 사용량 데이터가 아직 없습니다",
  "chart.dailyTrendAria": "일별 순지출 추이 ({days}일)",
  "chart.peakPerDay": "최고 {amount}/일",
  "chart.noBillableServices": "이번 달 기록된 청구 대상 서비스 사용량이 없습니다.",
  "chart.grossCreditsHint": "총비용 {gross}, 크레딧 {credits}",

  // Overview Tab
  "overview.cliRecommendedBadge": "CLI 권장",
  "overview.cliNotFoundTitle": "Google Cloud CLI (`gcloud`)를 찾을 수 없음",
  "overview.cliNotFoundDesc":
    "저장된 애플리케이션 기본 사용자 인증 정보(ADC)로 연결되었으나 컴퓨터에서 `gcloud` CLI를 찾을 수 없습니다. 계정 전환 및 CLI 프로젝트 동기화를 사용하려면 `gcloud`를 설치하세요.",
  "overview.installCliBtn": "gcloud CLI 설치 ↗",
  "overview.mtdNetSpend": "이번 달 누적 순지출 ({month})",
  "overview.spendBreakdownTitle": "이번 달 지출 내역",
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
  "project.noBqCostThisMonth": "이번 달 이 프로젝트에 기록된 BigQuery 비용 내역이 없습니다.",
  "project.connectBqForCosts":
    "서비스별 비용을 확인하려면 결제 탭에서 BigQuery 결제 데이터 내보내기를 연결하세요.",
  "project.linkDashboard": "대시보드 ↗",
  "project.linkBillingReport": "결제 보고서 ↗",
  "project.linkCloudRun": "Cloud Run ↗",
  "project.linkBigQuery": "BigQuery ↗",
  "project.linkLogs": "로그 ↗",

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
  "billing.closedAccountsSummary": "종료됨 / 비활성 결제 계정 ({count})",
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
  "spend.lastMonthShort": "上月: {amount}",
  "chart.noDailyUsage": "本月暂无每日用量记录",
  "chart.dailyTrendAria": "每日净支出趋势（{days} 天）",
  "chart.peakPerDay": "峰值 {amount}/天",
  "chart.noBillableServices": "本月暂无产生费用的服务记录。",
  "chart.grossCreditsHint": "毛费用 {gross}，抵扣额 {credits}",

  // Overview Tab
  "overview.cliRecommendedBadge": "建议安装 CLI",
  "overview.cliNotFoundTitle": "未找到 Google Cloud CLI (`gcloud`)",
  "overview.cliNotFoundDesc":
    "当前通过已保存的应用默认凭据 (ADC) 连接，但未在电脑上找到 `gcloud` CLI。安装 `gcloud` 后即可切换账号并同步 CLI 项目。",
  "overview.installCliBtn": "安装 gcloud CLI ↗",
  "overview.mtdNetSpend": "本月至今净支出 ({month})",
  "overview.spendBreakdownTitle": "本月支出明细",
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
  "project.noBqCostThisMonth": "本月暂无此项目的 BigQuery 费用记录。",
  "project.connectBqForCosts": "在“结算”标签页连接 BigQuery 结算数据导出表后，即可在此查看各服务费用。",
  "project.linkDashboard": "信息中心 ↗",
  "project.linkBillingReport": "结算报告 ↗",
  "project.linkCloudRun": "Cloud Run ↗",
  "project.linkBigQuery": "BigQuery ↗",
  "project.linkLogs": "日志 ↗",

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
  "billing.closedAccountsSummary": "已关闭 / 非活跃结算账号 ({count})",
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
  "spend.lastMonthShort": "上月: {amount}",
  "chart.noDailyUsage": "本月尚無每日用量紀錄",
  "chart.dailyTrendAria": "每日淨支出趨勢（{days} 天）",
  "chart.peakPerDay": "最高 {amount}/日",
  "chart.noBillableServices": "本月尚無計費服務用量紀錄。",
  "chart.grossCreditsHint": "未折抵 {gross}，抵免額 {credits}",

  // Overview Tab
  "overview.cliRecommendedBadge": "建議安裝 CLI",
  "overview.cliNotFoundTitle": "找不到 Google Cloud CLI (`gcloud`)",
  "overview.cliNotFoundDesc":
    "目前已透過應用程式預設憑證 (ADC) 連線，但在電腦上找不到 `gcloud` CLI。安裝 `gcloud` 後即可切換帳號並同步 CLI 專案。",
  "overview.installCliBtn": "安裝 gcloud CLI ↗",
  "overview.mtdNetSpend": "本月至今淨支出 ({month})",
  "overview.spendBreakdownTitle": "本月支出明細",
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
  "project.noBqCostThisMonth": "本月尚無此專案的 BigQuery 費用紀錄。",
  "project.connectBqForCosts": "請至「帳單」分頁連結 BigQuery 帳單匯出資料表，以檢視各服務費用。",
  "project.linkDashboard": "資訊主頁 ↗",
  "project.linkBillingReport": "帳單報表 ↗",
  "project.linkCloudRun": "Cloud Run ↗",
  "project.linkBigQuery": "BigQuery ↗",
  "project.linkLogs": "紀錄 (Logs) ↗",

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
  "billing.closedAccountsSummary": "已關閉 / 非作用中帳單帳戶 ({count})",
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
};


// --- i18n/index.js ---
const SUPPORTED_LOCALES                              = [
  { code: "en", nativeName: "English", shortName: "🌐 EN" },
  { code: "ja", nativeName: "日本語", shortName: "🌐 日本語" },
  { code: "ko", nativeName: "한국어", shortName: "🌐 한국어" },
  { code: "zh-CN", nativeName: "简体中文", shortName: "🌐 简体" },
  { code: "zh-TW", nativeName: "繁體中文", shortName: "🌐 繁體" },
];
const TRANSLATION_CATALOGS                                         = {
  en: EN_MESSAGES,
  ja: JA_MESSAGES,
  ko: KO_MESSAGES,
  "zh-CN": ZH_CN_MESSAGES,
  "zh-TW": ZH_TW_MESSAGES,
};

let currentLocalePreference                   = "auto";
function isSupportedLocaleCode(value        )                      {
  return (
    value === "en" ||
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
  try {
    return new Intl.NumberFormat(getActiveLocale(), {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: Math.abs(amount) < 10 && amount !== 0 ? 2 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${safeCurrency} ${amount.toFixed(2)}`;
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
  currency        
)              {
  if (series.length === 0) {
    return h("div", { className: "sparkline-empty" }, t("chart.noDailyUsage"));
  }

  const width = 320;
  const height = 68;
  const padX = 6;
  const padTop = 8;
  const padBottom = 10;
  const values = series.map((d) => Math.max(0, d.netCost));
  const maxVal = Math.max(...values, 0.01);
  const minVal = 0;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;

  const points = series.map((pt, idx) => {
    const x =
      series.length === 1
        ? width / 2
        : padX + (idx / (series.length - 1)) * innerW;
    const ratio = (Math.max(0, pt.netCost) - minVal) / (maxVal - minVal || 1);
    const y = padTop + innerH - ratio * innerH;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, pt };
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
    children.push(
      svgEl("circle", {
        cx: last.x,
        cy: last.y,
        r: 3.2,
        fill: "currentColor",
      })
    );
  }

  const svg = svgEl(
    "svg",
    {
      viewBox: `0 0 ${width} ${height}`,
      class: "sparkline-svg",
      role: "img",
      "aria-label": t("chart.dailyTrendAria", { days: series.length }),
    },
    ...children
  );

  const firstDate = series[0]?.date.slice(5) ?? "";
  const lastDate = series[series.length - 1]?.date.slice(5) ?? "";
  const peakCost = Math.max(...values);

  return h(
    "div",
    { className: "sparkline-wrap" },
    svg,
    h(
      "div",
      { className: "sparkline-caption" },
      h("span", null, firstDate),
      h("span", null, t("chart.peakPerDay", { amount: formatMoney(peakCost, currency) })),
      h("span", null, lastDate)
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
          svc.creditsAmount < -0.005
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


// --- app.js ---





                                                     
                                                                  
                                                  

const PROJECT_PAGE_SIZE = 6;
const LINKED_PROJECTS_PREVIEW_LIMIT = 5;

                   
                                             
                   
                      
                       
                       
                                      
                        
                                                                    
                               
                           
                                  
                                        
                              
                             
                                                    
                                 
                        
                              
                       
                            
                            
 

const state          = {
  overview: null,
  loading: true,
  refreshing: false,
  error: null,
  activeTab: "overview",
  overviewMode: "projects",
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
};

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

async function loadData(forceRefresh = false)                {
  if (forceRefresh) {
    state.refreshing = true;
  } else if (!state.overview) {
    state.loading = true;
  }
  state.error = null;
  renderApp();

  try {
    const data = await fetchOverview(forceRefresh);
    state.overview = data;
    if (data.preferences.locale) {
      setLocalePreference(data.preferences.locale);
    }
    if (!state.discoverHostProject && data.auth.activeProject) {
      state.discoverHostProject = data.auth.activeProject;
    }
    if (
      state.enableTargetProject &&
      !data.projects.some((p) => p.projectId === state.enableTargetProject)
    ) {
      state.enableTargetProject = "";
    }
    if (
      state.manualBillingAccountId === "*" &&
      data.billingAccounts.length === 1
    ) {
      state.manualBillingAccountId = data.billingAccounts[0].id;
    }
    if (forceRefresh) {
      showToast(t("toast.refreshed"), "success");
    }
  } catch (err) {
    state.error = err instanceof Error ? err.message : t("toast.loadFailed");
    showToast(state.error, "error");
  } finally {
    state.loading = false;
    state.refreshing = false;
    renderApp();
  }
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
                  state.overview = await enableGcpServiceApi(
                    selectedProj,
                    "cloudbilling.googleapis.com"
                  );
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

function renderLanguageGrid()              {
  const currentPref = getLocalePreference();
  const options                                                                        = [
    { code: "auto", label: t("locale.autoFull"), fullWidth: true },
    ...SUPPORTED_LOCALES.map((loc) => ({ code: loc.code, label: loc.nativeName })),
  ];

  return h(
    "div",
    { className: "lang-grid", role: "radiogroup", ariaLabel: t("settings.languageLabel") },
    ...options.map((opt) => {
      const selected = currentPref === opt.code;
      const cls = [
        "lang-option-btn",
        selected ? "lang-option-btn-active" : "",
        opt.fullWidth ? "lang-option-full" : "",
      ]
        .filter(Boolean)
        .join(" ");
      return h(
        "button",
        {
          type: "button",
          role: "radio",
          className: cls,
          onClick: async () => {
            if (opt.code === currentPref) return;
            setLocalePreference(opt.code);
            renderApp();
            try {
              state.overview = await updateCompanionPreferences({ locale: opt.code });
              if (state.overview.preferences.locale) {
                setLocalePreference(state.overview.preferences.locale);
              }
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
        h("span", { className: "lang-option-text" }, opt.label),
        selected ? h("span", { className: "lang-option-check" }, "✓") : null
      );
    })
  );
}

function renderHeader(overview                           )              {
  const mask = overview.preferences.maskEmails;
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

  const accountBar =
    overview.auth.accounts.length > 0
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
                    state.refreshing = true;
                    renderApp();
                    state.overview = await switchActiveAccount(nextAcct);
                    showToast(t("toast.switchedAccount"), "success");
                  } catch (err) {
                    showToast(
                      err instanceof Error ? err.message : t("toast.switchAccountFailed"),
                      "error"
                    );
                  } finally {
                    state.refreshing = false;
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
                  try {
                    state.overview = await updateCompanionPreferences({ maskEmails: !mask });
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
        overview.preferences.demoMode
          ? h(
              "button",
              {
                type: "button",
                className: "badge badge-demo",
                title: t("header.demoExitTitle"),
                onClick: async () => {
                  state.overview = await updateCompanionPreferences({ demoMode: false });
                  renderApp();
                  showToast(t("toast.exitedDemo"), "info");
                },
              },
              t("header.demoBadge")
            )
          : null
      ),
      h(
        "div",
        { className: "brand-right" },
        h(
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
            onClick: async () => {
              state.overview = await updateCompanionPreferences({ demoMode: true });
              renderApp();
              showToast(t("toast.demoEnabled"), "info");
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
              state.overview = await startBrowserLoginApi();
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
          onClick: async () => {
            state.overview = await updateCompanionPreferences({ demoMode: true });
            renderApp();
            showToast(t("toast.demoEnabled"), "info");
          },
        },
        t("onboard.previewDemoBtn")
      )
    ),
    renderSettingsDetails(overview)
  );
}

function renderTabNav(overview                           )              {
  const tabs                                                          = [
    { id: "overview", label: t("tabs.overview") },
    { id: "projects", label: t("tabs.projects"), count: overview.summary.totalProjects },
    { id: "billing", label: t("tabs.billing"), count: overview.summary.totalBillingAccounts },
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
        tab.count !== undefined ? h("span", { className: "tab-count" }, String(tab.count)) : null
      )
    )
  );
}

function formatLinkedProjectCount(count        )         {
  return count === 1
    ? t("billing.projectCountOne")
    : t("billing.projectCountMany", { count });
}

function renderOverviewTab(overview                           )              {
  const spend = overview.spend;
  const sections                = [];

  if (!overview.preferences.demoMode && !overview.auth.gcloudInstalled) {
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

  if (spend.configured && spend.totalsByCurrency.length > 0) {
    for (const total of spend.totalsByCurrency) {
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
              t("overview.mtdNetSpend", {
                month: `${spend.invoiceMonth.slice(0, 4)}-${spend.invoiceMonth.slice(4)}`,
              })
            ),
            renderDeltaBadge(total.deltaPercentVsPrevSameDay)
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
              t("spend.lastMonthTotal", {
                amount: formatMoney(total.prevMonthTotalNetCost, total.currency),
              })
            )
          ),
          renderDailySparkline(total.dailySeries, total.currency)
        )
      );
    }

    // Breakdown toggle: By Project vs By Billing Account
    const topProjects = [...overview.projects]
      .filter((p) => spend.byProject[p.projectId])
      .sort(
        (a, b) =>
          (spend.byProject[b.projectId]?.currentMonthNetCost ?? 0) -
          (spend.byProject[a.projectId]?.currentMonthNetCost ?? 0)
      )
      .slice(0, 5);

    sections.push(
      h(
        "section",
        { className: "card" },
        h(
          "div",
          { className: "section-header-row" },
          h("h3", { className: "section-title" }, t("overview.spendBreakdownTitle")),
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
          ? topProjects.length > 0
            ? h(
                "div",
                { className: "compact-list" },
                ...topProjects.map((proj) => {
                  const ps = spend.byProject[proj.projectId];
                  return h(
                    "div",
                    {
                      className: "compact-row clickable-row",
                      onClick: () => {
                        state.activeTab = "projects";
                        state.expandedProjectIds.add(proj.projectId);
                        renderApp();
                      },
                    },
                    h(
                      "div",
                      { className: "compact-row-main" },
                      h("span", { className: "row-primary-text" }, proj.name),
                      h("span", { className: "row-mono" }, proj.projectId)
                    ),
                    h(
                      "div",
                      { className: "compact-row-right" },
                      h(
                        "span",
                        { className: "amount-strong" },
                        formatMoney(ps.currentMonthNetCost, ps.currency)
                      ),
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
            : h(
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
                    h(
                      "span",
                      { className: ba.open ? "status-dot-open" : "status-dot-closed" },
                      ba.open ? t("billing.statusOpen") : t("billing.statusClosed")
                    )
                  )
                );
              })
            )
      )
    );
  } else {
    const billingOff = isCloudBillingApiDisabled(overview);
    const billingApiPrompt = renderBillingApiSetupPrompt(overview);
    // Progressive Base Mode card when BigQuery export isn't linked yet (or returned 0 rows)
    sections.push(
      h(
        "section",
        { className: "card kpi-strip" },
        h(
          "div",
          { className: "kpi-cell" },
          h("span", { className: "kpi-num" }, String(overview.summary.totalProjects)),
          h("span", { className: "kpi-label" }, t("overview.kpiActiveProjects"))
        ),
        h(
          "div",
          { className: "kpi-cell" },
          h(
            "span",
            { className: "kpi-num" },
            billingOff ? "—" : String(overview.summary.openBillingAccounts)
          ),
          h(
            "span",
            { className: "kpi-label" },
            billingOff ? t("overview.kpiBillingApiOff") : t("overview.kpiOpenBillingAccts")
          )
        ),
        h(
          "div",
          { className: "kpi-cell" },
          h(
            "span",
            { className: "kpi-num" },
            billingOff ? "—" : String(overview.summary.unbilledProjects)
          ),
          h(
            "span",
            { className: "kpi-label" },
            billingOff ? t("overview.kpiEnableApiBelow") : t("overview.kpiUnbilledSandbox")
          )
        )
      )
    );
    if (billingApiPrompt) {
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
                  onClick: async () => {
                    state.overview = await updateCompanionPreferences({ demoMode: true });
                    renderApp();
                    showToast(t("toast.showingSampleSpend"), "info");
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
        h(
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
      quickProjects.length > 0
        ? h(
            "div",
            { className: "compact-list" },
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
  const ps = overview.spend.byProject[proj.projectId];
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
      h(
        "span",
        { className: "row-mono" },
        `${proj.projectId}${proj.billingAccountName ? ` · ${proj.billingAccountName}` : ` · ${t("project.unbilledTag")}`}`
      )
    ),
    h(
      "div",
      { className: "compact-row-actions" },
      ps
        ? h(
            "span",
            { className: "amount-strong" },
            formatMoney(ps.currentMonthNetCost, ps.currency)
          )
        : null,
      !proj.isActiveProject
        ? h(
            "button",
            {
              type: "button",
              className: "btn btn-xs",
              title: t("project.setActiveCmdTitle", { project: proj.projectId }),
              onClick: async () => {
                try {
                  state.enableTargetProject = "";
                  state.overview = await switchActiveProject(proj.projectId);
                  renderApp();
                  showToast(t("toast.activeProjectSet", { project: proj.projectId }), "success");
                } catch (err) {
                  showToast(
                    err instanceof Error ? err.message : t("toast.switchProjectFailed"),
                    "error"
                  );
                }
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

  return [...filtered].sort((a, b) => {
    if (state.projectSort === "spend") {
      const sa = overview.spend.byProject[a.projectId]?.currentMonthNetCost ?? -1;
      const sb = overview.spend.byProject[b.projectId]?.currentMonthNetCost ?? -1;
      if (sa !== sb) return sb - sa;
      return a.projectId.localeCompare(b.projectId);
    }
    if (state.projectSort === "name") {
      return a.name.localeCompare(b.name);
    }
    if (a.isActiveProject !== b.isActiveProject) return a.isActiveProject ? -1 : 1;
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const sa = overview.spend.byProject[a.projectId]?.currentMonthNetCost ?? -1;
    const sb = overview.spend.byProject[b.projectId]?.currentMonthNetCost ?? -1;
    if (sa !== sb) return sb - sa;
    return a.projectId.localeCompare(b.projectId);
  });
}

function renderProjectsTab(overview                           )              {
  const focusCount = overview.projects.filter((p) => p.isActiveProject || p.pinned).length;

  const filterChips                                        = [
    { key: "all", label: t("projects.filterAll", { count: overview.projects.length }) },
    { key: "unbilled", label: t("projects.filterUnbilled", { count: overview.summary.unbilledProjects }) },
    { key: "focus", label: t("projects.filterFocus", { count: focusCount }) },
  ];

  if (state.projectFilter.startsWith("ba:")) {
    const baId = state.projectFilter.slice(3);
    const matchedBa = overview.billingAccounts.find((b) => b.id === baId);
    const baLabel = matchedBa
      ? `${matchedBa.displayName} (${matchedBa.linkedProjectCount}) ×`
      : `${baId} ×`;
    filterChips.push({ key: state.projectFilter, label: baLabel });
  }

  return h(
    "div",
    { className: "tab-panel" },
    h(
      "section",
      { className: "card filter-toolbar" },
      h(
        "div",
        { className: "search-sort-row" },
        h("input", {
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
  if (!container || !state.overview) return;
  clearElement(container);
  for (const node of buildProjectResultsNodes(state.overview)) {
    container.appendChild(node);
  }
}

function buildProjectResultsNodes(overview                           )                {
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

function buildProjectCards(
  projects                       ,
  overview                           
)                {
  if (projects.length === 0) {
    return [
      h("div", { className: "card muted-note" }, t("projects.emptyFilter")),
    ];
  }

  return projects.map((proj) => {
    const expanded = state.expandedProjectIds.has(proj.projectId);
    const ps = overview.spend.byProject[proj.projectId];
    const encodedId = encodeURIComponent(proj.projectId);

    const toggleExpand = () => {
      if (state.expandedProjectIds.has(proj.projectId)) {
        state.expandedProjectIds.delete(proj.projectId);
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
            onClick: async (ev) => {
              ev.stopPropagation();
              try {
                state.overview = await togglePinProject(proj.projectId, !proj.pinned);
                renderApp();
              } catch (err) {
                showToast(
                  err instanceof Error ? err.message : t("toast.pinUpdateFailed"),
                  "error"
                );
              }
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
            proj.billingEnabled && proj.billingAccountName
              ? h("span", { className: "billing-tag" }, proj.billingAccountName)
              : h("span", { className: "billing-tag billing-tag-off" }, t("project.noBillingTag"))
          )
        ),
        h(
          "div",
          { className: "project-right-col" },
          ps
            ? h(
                "span",
                { className: "amount-strong" },
                formatMoney(ps.currentMonthNetCost, ps.currency)
              )
            : overview.spend.configured
              ? h("span", { className: "muted-micro" }, formatMoney(0, "USD"))
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
                    onClick: async (ev) => {
                      ev.stopPropagation();
                      try {
                        state.enableTargetProject = "";
                        state.overview = await switchActiveProject(proj.projectId);
                        renderApp();
                        showToast(t("toast.switchedProject", { project: proj.projectId }), "success");
                      } catch (err) {
                        showToast(
                          err instanceof Error ? err.message : t("toast.switchProjectFailed"),
                          "error"
                        );
                      }
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
            )
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

  const rows = visibleProjectIds.map((projId) => {
    const proj = projectMap.get(projId);
    const ps = overview.spend.byProject[projId];
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
              "span",
              { className: "amount-strong" },
              formatMoney(ps.currentMonthNetCost, ps.currency)
            )
          : null,
        !isActive
          ? h(
              "button",
              {
                type: "button",
                className: "btn btn-xs",
                title: t("billing.setActiveTitle", { project: projId }),
                onClick: async () => {
                  try {
                    state.enableTargetProject = "";
                    state.overview = await switchActiveProject(projId);
                    renderApp();
                    showToast(t("toast.activeProjectSet", { project: projId }), "success");
                  } catch (err) {
                    showToast(
                      err instanceof Error ? err.message : t("toast.switchProjectFailed"),
                      "error"
                    );
                  }
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
  const bs = overview.spend.byBillingAccount[ba.id];

  return h(
    "article",
    { className: ba.open ? "card billing-card" : "card billing-card billing-card-closed" },
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
          h(
            "span",
            { className: ba.open ? "badge badge-active" : "badge badge-neutral" },
            ba.open ? t("billing.statusOpen") : t("billing.statusClosed")
          ),
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
              h("div", { className: "eyebrow" }, t("billing.mtdNetLabel")),
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
          renderDailySparkline(bs.dailySeries, bs.currency),
          renderServiceBreakdownList(bs.topServices.slice(0, 4), bs.currency)
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
                      state.overview = await configureExportTableApi({
                        billingAccountId: m.billingAccountId,
                        remove: true,
                      });
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
                        state.overview = await configureExportTableApi({
                          billingAccountId: tbl.inferredBillingAccountId || "*",
                          tableId: tbl.tableId,
                          hostProjectId: tbl.hostProjectId,
                        });
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
            state.overview = await configureExportTableApi({
              billingAccountId: state.manualBillingAccountId || "*",
              tableId,
            });
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

function renderSettingsBodyContent(overview                           )                {
  const currentHours = overview.preferences.cacheTtlHours;
  const mask = overview.preferences.maskEmails;
  let quotaInputVal = overview.preferences.quotaProjectOverride || "";
  let gcloudPathVal = overview.preferences.gcloudPathOverride || "";

  return [
    h(
      "div",
      { className: "settings-section" },
      h("div", { className: "eyebrow" }, t("settings.languageLabel")),
      renderLanguageGrid()
    ),
    h(
      "div",
      { className: "settings-section" },
      h("div", { className: "eyebrow" }, t("settings.cacheTtlLabel")),
      h(
        "div",
        { className: "ttl-pill-grid" },
        ...[1, 6, 12, 24].map((hr) => {
          const active = Math.round(currentHours) === hr;
          return h(
            "button",
            {
              type: "button",
              className: active ? "lang-option-btn lang-option-btn-active" : "lang-option-btn",
              onClick: async () => {
                if (active) return;
                state.overview = await updateCompanionPreferences({ cacheTtlHours: hr });
                renderApp();
                showToast(t("toast.cacheTtlSet", { hours: hr }), "success");
              },
            },
            `${hr}h`
          );
        })
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
              state.overview = await updateCompanionPreferences({ maskEmails: nextMask });
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
          onClick: async () => {
            const nextDemo = !overview.preferences.demoMode;
            state.overview = await updateCompanionPreferences({ demoMode: nextDemo });
            renderApp();
            showToast(nextDemo ? t("toast.demoOn") : t("toast.demoOff"), "info");
          },
        },
        overview.preferences.demoMode ? t("settings.switchToLiveBtn") : t("settings.enableDemoBtn")
      )
    ),
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
            type: "text",
            className: "text-input full-width",
            placeholder: t("settings.quotaProjectPlaceholder"),
            value: quotaInputVal,
            onInput: (ev) => {
              quotaInputVal = (ev.target                    ).value;
            },
          })
        ),
        h(
          "label",
          { className: "field-label" },
          t("settings.gcloudPathLabel"),
          h("input", {
            type: "text",
            className: "text-input full-width",
            placeholder: "/opt/homebrew/bin/gcloud",
            value: gcloudPathVal,
            onInput: (ev) => {
              gcloudPathVal = (ev.target                    ).value;
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
                  state.overview = await updateCompanionPreferences({
                    quotaProjectOverride: quotaInputVal.trim() || null,
                    gcloudPathOverride: gcloudPathVal.trim() || null,
                  });
                  renderApp();
                  showToast(t("toast.savedSettings"), "success");
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
  const billingApiPrompt = renderBillingApiSetupPrompt(overview);
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

  const primaryAccounts = overview.billingAccounts.filter(
    (ba) => ba.open || ba.linkedProjectCount > 0 || Boolean(overview.spend.byBillingAccount[ba.id])
  );
  const inactiveClosedAccounts = overview.billingAccounts.filter(
    (ba) => !ba.open && ba.linkedProjectCount === 0 && !overview.spend.byBillingAccount[ba.id]
  );

  return h(
    "div",
    { className: "tab-panel" },
    billingApiPrompt,
    warningSection,
    overview.billingAccounts.length > 0
      ? h(
           "div",
          { className: "stack-list" },
          ...primaryAccounts.map((ba) => renderBillingAccountCard(ba, overview)),
          inactiveClosedAccounts.length > 0
            ? h(
                "details",
                {
                  className: "card closed-accounts-details",
                  ...(primaryAccounts.length === 0 ? { open: "open" } : {}),
                }                           ,
                h(
                  "summary",
                  { className: "settings-summary" },
                  t("billing.closedAccountsSummary", { count: inactiveClosedAccounts.length })
                ),
                h(
                  "div",
                  { className: "stack-list closed-accounts-list" },
                  ...inactiveClosedAccounts.map((ba) => renderBillingAccountCard(ba, overview))
                )
              )
            : null
        )
      : billingApiPrompt
        ? null
        : h("div", { className: "card muted-note" }, t("billing.noAccountsVisible")),
    renderBillingExportSetupCard(overview),
    renderSettingsDetails(overview)
  );
}

function renderApp()       {
  if (typeof document === "undefined" || !document) return;
  if (document.documentElement) {
    document.documentElement.lang = getActiveLocale();
  }

  const root = document.getElementById("app");
  if (!root) return;
  clearElement(root);

  if (state.loading && !state.overview) {
    root.appendChild(
      h(
        "div",
        { className: "boot-loading" },
        h("div", { className: "spinner" }),
        h("div", null, t("boot.connecting"))
      )
    );
    return;
  }

  if (!state.overview) {
    root.appendChild(
      h(
        "div",
        { className: "card error-card" },
        h("h2", { className: "card-title" }, t("boot.errorTitle")),
        h("p", { className: "card-desc" }, state.error || t("boot.unknownError")),
        h(
          "button",
          {
            type: "button",
            className: "btn btn-primary",
            onClick: () => {
              void loadData(true);
            },
          },
          t("boot.retry")
        )
      )
    );
    return;
  }

  const overview = state.overview;
  root.appendChild(renderHeader(overview));
  const settingsOverlay = renderSettingsMenuOverlay(overview);
  if (settingsOverlay) {
    root.appendChild(settingsOverlay);
  }

  if (!overview.auth.authenticated && !overview.preferences.demoMode) {
    root.appendChild(h("main", { className: "main-body" }, renderUnauthenticatedView(overview)));
    bindLogoSources(root);
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

  root.appendChild(h("main", { className: "main-body" }, activeContent));
  bindLogoSources(root);
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
