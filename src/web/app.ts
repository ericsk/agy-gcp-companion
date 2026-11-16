import type {
  BillingAccount,
  CompanionOverviewResponse,
  DiscoveredBillingTable,
  GcpProject,
  LocalePreference,
} from "../core/types.ts";
import {
  configureExportTableApi,
  discoverExportTablesApi,
  enableGcpServiceApi,
  fetchOverview,
  startBrowserLoginApi,
  switchActiveAccount,
  switchActiveProject,
  togglePinProject,
  updateCompanionPreferences,
} from "./api.ts";
import { renderDailySparkline, renderServiceBreakdownList } from "./charts.ts";
import {
  clearElement,
  copyToClipboard,
  formatMoney,
  formatRelativeAge,
  h,
} from "./dom.ts";
import {
  SUPPORTED_LOCALES,
  getActiveLocale,
  getLocalePreference,
  localizeSetupHint,
  setLocalePreference,
  t,
} from "./i18n/index.ts";

type ActiveTab = "overview" | "projects" | "billing";
type OverviewBreakdownMode = "projects" | "accounts" | "services";
type ProjectSortMode = "smart" | "spend" | "name";

const PROJECT_PAGE_SIZE = 6;
const LINKED_PROJECTS_PREVIEW_LIMIT = 5;

interface UiState {
  overview: CompanionOverviewResponse | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  activeTab: ActiveTab;
  overviewMode: OverviewBreakdownMode;
  projectSearch: string;
  projectFilter: string; // "focus" | "all" | "unbilled" | "ba:<ID>"
  projectSort: ProjectSortMode;
  projectPageLimit: number;
  expandedProjectIds: Set<string>;
  expandedBillingLinkedIds: Set<string>;
  discoverHostProject: string;
  discoveringTables: boolean;
  discoveredTables: DiscoveredBillingTable[] | null;
  manualBillingAccountId: string;
  manualTableId: string;
  enableTargetProject: string;
  enablingApi: boolean;
  signingInBrowser: boolean;
  settingsMenuOpen: boolean;
}

const state: UiState = {
  overview: null,
  loading: true,
  refreshing: false,
  error: null,
  activeTab: "overview",
  overviewMode: "projects",
  projectSearch: "",
  projectFilter: "focus",
  projectSort: "smart",
  projectPageLimit: PROJECT_PAGE_SIZE,
  expandedProjectIds: new Set<string>(),
  expandedBillingLinkedIds: new Set<string>(),
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

function showToast(message: string, kind: "info" | "success" | "error" = "info"): void {
  if (typeof document === "undefined" || !document) return;
  const root = document.getElementById("toast-root");
  if (!root) return;
  const item = h("div", { className: `toast toast-${kind}` }, message);
  root.appendChild(item);
  window.setTimeout(() => {
    item.remove();
  }, 3200);
}

async function loadData(forceRefresh = false): Promise<void> {
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

function isCloudBillingApiDisabled(overview: CompanionOverviewResponse): boolean {
  return (
    overview.billingAccounts.length === 0 &&
    overview.warnings.some((w) =>
      /cloudbilling\.googleapis\.com|Cloud Billing API has not been used|requires a quota project/i.test(
        w
      )
    )
  );
}

function getNonBillingApiWarnings(overview: CompanionOverviewResponse): string[] {
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

function getPreferredConsoleProject(overview: CompanionOverviewResponse): string {
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

function withConsoleProject(url: string, projectId: string | null | undefined): string {
  if (!projectId) return url;
  if (/[?&]project=/.test(url)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}project=${encodeURIComponent(projectId)}`;
}

function renderBillingApiSetupPrompt(overview: CompanionOverviewResponse): HTMLElement | null {
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
                state.enableTargetProject = (ev.target as HTMLSelectElement).value;
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

function renderDeltaBadge(delta: number | null): HTMLElement {
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

function renderLanguageGrid(): HTMLElement {
  const currentPref = getLocalePreference();
  const options: Array<{ code: LocalePreference; label: string; fullWidth?: boolean }> = [
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

function renderHeader(overview: CompanionOverviewResponse): HTMLElement {
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
                  const target = ev.target as HTMLSelectElement;
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

function bindLogoSources(container: HTMLElement): void {
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

function renderCopyCommandBox(label: string, command: string): HTMLElement {
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

function renderUnauthenticatedView(overview: CompanionOverviewResponse): HTMLElement {
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

function renderTabNav(overview: CompanionOverviewResponse): HTMLElement {
  const tabs: Array<{ id: ActiveTab; label: string; count?: number }> = [
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

function formatLinkedProjectCount(count: number): string {
  return count === 1
    ? t("billing.projectCountOne")
    : t("billing.projectCountMany", { count });
}

function renderOverviewTab(overview: CompanionOverviewResponse): HTMLElement {
  const spend = overview.spend;
  const sections: HTMLElement[] = [];

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

function renderWarningLine(warningText: string, fallbackProjectId?: string): HTMLElement {
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
  proj: GcpProject,
  overview: CompanionOverviewResponse
): HTMLElement {
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

function getFilteredAndSortedProjects(overview: CompanionOverviewResponse): GcpProject[] {
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

function renderProjectsTab(overview: CompanionOverviewResponse): HTMLElement {
  const focusCount = overview.projects.filter((p) => p.isActiveProject || p.pinned).length;

  const filterChips: Array<{ key: string; label: string }> = [
    { key: "focus", label: t("projects.filterFocus", { count: focusCount }) },
    { key: "all", label: t("projects.filterAll", { count: overview.projects.length }) },
    { key: "unbilled", label: t("projects.filterUnbilled", { count: overview.summary.unbilledProjects }) },
    ...overview.billingAccounts.map((ba) => ({
      key: `ba:${ba.id}`,
      label: `${ba.displayName} (${ba.linkedProjectCount})`,
    })),
  ];

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
            state.projectSearch = (ev.target as HTMLInputElement).value;
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
              state.projectSort = (ev.target as HTMLSelectElement).value as ProjectSortMode;
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
                state.projectFilter = chip.key;
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

function renderProjectsListOnly(): void {
  const container = document.getElementById("projects-results-container");
  if (!container || !state.overview) return;
  clearElement(container);
  for (const node of buildProjectResultsNodes(state.overview)) {
    container.appendChild(node);
  }
}

function buildProjectResultsNodes(overview: CompanionOverviewResponse): HTMLElement[] {
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
  } else if (remainingInFilter > 0 || (state.projectFilter === "all" && totalProjects > 0)) {
    const actionButtons: HTMLElement[] = [];
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
    if (state.projectFilter === "all" && !state.projectSearch.trim()) {
      actionButtons.push(
        h(
          "button",
          {
            type: "button",
            className: "btn btn-xs btn-ghost",
            onClick: () => {
              state.projectFilter = "focus";
              state.projectPageLimit = PROJECT_PAGE_SIZE;
              renderApp();
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
  projects: readonly GcpProject[],
  overview: CompanionOverviewResponse
): HTMLElement[] {
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
  ba: BillingAccount,
  overview: CompanionOverviewResponse
): HTMLElement {
  if (ba.linkedProjectIds.length === 0) {
    return h(
      "div",
      { className: "linked-projects-empty muted-micro" },
      t("billing.noLinkedProjects")
    );
  }

  const projectMap = new Map<string, GcpProject>();
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
  ba: BillingAccount,
  overview: CompanionOverviewResponse
): HTMLElement {
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

function renderBillingExportSetupCard(overview: CompanionOverviewResponse): HTMLElement {
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
            state.discoverHostProject = (ev.target as HTMLInputElement).value;
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
            state.manualBillingAccountId = (ev.target as HTMLSelectElement).value;
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
            state.manualTableId = (ev.target as HTMLInputElement).value;
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

function renderSettingsBodyContent(overview: CompanionOverviewResponse): HTMLElement[] {
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
            const nextMask = (ev.target as HTMLInputElement).checked;
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
              quotaInputVal = (ev.target as HTMLInputElement).value;
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
              gcloudPathVal = (ev.target as HTMLInputElement).value;
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

function renderSettingsMenuOverlay(overview: CompanionOverviewResponse): HTMLElement | null {
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

function renderSettingsDetails(overview: CompanionOverviewResponse): HTMLElement {
  return h(
    "details",
    { className: "card settings-details" },
    h("summary", { className: "settings-summary" }, t("settings.summary")),
    h("div", { className: "settings-body" }, ...renderSettingsBodyContent(overview))
  );
}

function renderBillingTab(overview: CompanionOverviewResponse): HTMLElement {
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
                } as Record<string, unknown>,
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

function renderApp(): void {
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

  let activeContent: HTMLElement;
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
  window.addEventListener("keydown", (ev: KeyboardEvent) => {
    if (ev.key === "Escape" && state.settingsMenuOpen) {
      state.settingsMenuOpen = false;
      renderApp();
    }
  });
}

void loadData(false);
