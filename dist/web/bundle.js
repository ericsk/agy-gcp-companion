(() => {
  "use strict";
  if (typeof window !== "undefined") {
    if (window.__AGY_COMPANION_BOOTED__) return;
    window.__AGY_COMPANION_BOOTED__ = true;
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
    return new Intl.NumberFormat(undefined, {
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
  if (ageMs === null) return "Not synced";
  const sec = Math.floor(ageMs / 1000);
  const suffix = stale ? " (offline cache)" : "";
  if (sec < 15) return `Just now${suffix}`;
  if (sec < 60) return `${sec}s ago${suffix}`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago${suffix}`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m ago${suffix}`;
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
    return h("div", { className: "sparkline-empty" }, "No daily usage rows for this month yet");
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
      "aria-label": `Daily net spend trend (${series.length} days)`,
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
      h("span", null, `Peak ${formatMoney(peakCost, currency)}/d`),
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
    return h("div", { className: "muted-note" }, "No billable service usage recorded this month.");
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
                  title: `Gross ${formatMoney(svc.grossCost, currency)}, Credits ${formatMoney(svc.creditsAmount, currency)}`,
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

async function fetchEndpoint(endpoint        , init             )                    {
  const candidates = resolveEndpointCandidates(endpoint);
  let lastRes                  = null;
  for (let i = 0; i < candidates.length; i++) {
    const res = await fetch(candidates[i], {
      ...init,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
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

async function apiPost   (path        , body                         , retried = false)             {
  const session = await ensureSession(false);
  const res = await fetchEndpoint(path, {
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
  });

  if (res.status === 403 && !retried) {
    // Server may have restarted and rotated its ephemeral instance secret; re-handshake once
    await ensureSession(true);
    return apiPost   (path, body, true);
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


// --- app.js ---




                                                     
                                                                  
                                                  

                   
                                             
                   
                      
                       
                       
                                      
                        
                                                                     
                               
                                  
                              
                             
                                                    
                                 
                        
                              
                       
 

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
  expandedProjectIds: new Set        (),
  discoverHostProject: "",
  discoveringTables: false,
  discoveredTables: null,
  manualBillingAccountId: "*",
  manualTableId: "",
  enableTargetProject: "",
  enablingApi: false,
};

function showToast(message        , kind                               = "info")       {
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
    if (!state.discoverHostProject && data.auth.activeProject) {
      state.discoverHostProject = data.auth.activeProject;
    }
    if (!state.enableTargetProject) {
      const validActive = data.projects.some((p) => p.projectId === data.auth.activeProject)
        ? data.auth.activeProject
        : null;
      state.enableTargetProject = validActive || data.projects[0]?.projectId || "";
    }
    if (
      state.manualBillingAccountId === "*" &&
      data.billingAccounts.length === 1
    ) {
      state.manualBillingAccountId = data.billingAccounts[0].id;
    }
    if (forceRefresh) {
      showToast("Google Cloud data refreshed", "success");
    }
  } catch (err) {
    state.error = err instanceof Error ? err.message : "Failed to load data";
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

function renderBillingApiSetupPrompt(overview                           )                     {
  if (!isCloudBillingApiDisabled(overview)) {
    return null;
  }

  const activeValid = overview.projects.some((p) => p.projectId === overview.auth.activeProject)
    ? overview.auth.activeProject
    : null;
  const selectedProj =
    state.enableTargetProject ||
    overview.preferences.quotaProjectOverride ||
    activeValid ||
    overview.projects[0]?.projectId ||
    "";

  const consoleUrl = selectedProj
    ? `https://console.cloud.google.com/apis/library/cloudbilling.googleapis.com?project=${encodeURIComponent(
        selectedProj
      )}`
    : "https://console.cloud.google.com/apis/library/cloudbilling.googleapis.com";

  return h(
    "section",
    { className: "card api-setup-card" },
    h(
      "div",
      { className: "api-setup-header" },
      h("span", { className: "badge badge-warn" }, "ACTION NEEDED"),
      h("h3", { className: "section-title" }, "Enable Cloud Billing API")
    ),
    h(
      "p",
      { className: "card-desc" },
      "To display your Cloud Billing Accounts and project billing status, Google Cloud requires the free Cloud Billing API (cloudbilling.googleapis.com) to be enabled on a quota project."
    ),
    overview.projects.length > 0
      ? h(
          "label",
          { className: "field-label api-setup-field" },
          "Quota Project to Enable API On",
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
                  showToast(`Enabling Cloud Billing API on ${selectedProj}…`, "info");
                  state.overview = await enableGcpServiceApi(
                    selectedProj,
                    "cloudbilling.googleapis.com"
                  );
                  showToast("Cloud Billing API enabled! Billing accounts refreshed.", "success");
                } catch (err) {
                  showToast(
                    err instanceof Error ? err.message : "Failed to enable Cloud Billing API",
                    "error"
                  );
                } finally {
                  state.enablingApi = false;
                  renderApp();
                }
              },
            },
            state.enablingApi
              ? "Enabling Cloud Billing API (~10s)…"
              : `⚡ Enable Cloud Billing API on ${selectedProj}`
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
        "Open GCP Console ↗"
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
        "↻ Refresh"
      )
    )
  );
}

function renderDeltaBadge(delta               )              {
  if (delta === null || !Number.isFinite(delta)) {
    return h("span", { className: "badge badge-neutral" }, "No prior MTD baseline");
  }
  const sign = delta > 0 ? "+" : "";
  const cls =
    delta > 10
      ? "badge badge-warn"
      : delta < -2
        ? "badge badge-good"
        : "badge badge-neutral";
  return h("span", { className: cls }, `${sign}${delta.toFixed(1)}% vs prev MTD`);
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
            h("span", { className: "context-label" }, "Account"),
            h(
              "select",
              {
                className: "compact-select",
                ariaLabel: "Active Google Cloud Account",
                disabled: state.refreshing || overview.preferences.demoMode,
                onChange: async (ev) => {
                  const target = ev.target                     ;
                  const nextAcct = target.value;
                  if (!nextAcct || nextAcct === overview.auth.activeAccount) return;
                  try {
                    state.refreshing = true;
                    renderApp();
                    state.overview = await switchActiveAccount(nextAcct);
                    showToast("Switched active gcloud account", "success");
                  } catch (err) {
                    showToast(
                      err instanceof Error ? err.message : "Failed to switch account",
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
                title: mask ? "Show full email" : "Mask email (PII protection)",
                ariaLabel: mask ? "Show full email" : "Mask email",
                onClick: async () => {
                  try {
                    state.overview = await updateCompanionPreferences({ maskEmails: !mask });
                    renderApp();
                  } catch (err) {
                    showToast(
                      err instanceof Error ? err.message : "Failed to update preference",
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
            h("span", { className: "context-label" }, "Active Project"),
            overview.auth.activeProject
              ? h(
                  "button",
                  {
                    type: "button",
                    className: "project-pill-btn",
                    title: "Click to copy active gcloud project ID",
                    onClick: async () => {
                      if (!overview.auth.activeProject) return;
                      const ok = await copyToClipboard(overview.auth.activeProject);
                      showToast(
                        ok
                          ? `Copied ${overview.auth.activeProject}`
                          : overview.auth.activeProject,
                        "info"
                      );
                    },
                  },
                  overview.auth.activeProject
                )
              : h("span", { className: "muted-inline" }, "(unset)")
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
                title: "Click to exit Demo Mode and return to live gcloud data",
                onClick: async () => {
                  state.overview = await updateCompanionPreferences({ demoMode: false });
                  renderApp();
                  showToast("Exited Demo Mode", "info");
                },
              },
              "DEMO ×"
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
            title: "Force refresh from Google Cloud & BigQuery",
            onClick: () => {
              void loadData(true);
            },
          },
          state.refreshing ? "Syncing…" : "↻ Refresh"
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

function renderUnauthenticatedView(overview                           )              {
  const loginCmd = "gcloud auth login";
  return h(
    "section",
    { className: "card onboarding-card" },
    h("h2", { className: "card-title" }, "Connect Your Google Cloud Account"),
    h(
      "p",
      { className: "card-desc" },
      overview.auth.gcloudInstalled
        ? "Google Cloud CLI (`gcloud`) was found, but no active authenticated account is currently signed in."
        : "No local `gcloud` session or Application Default Credentials were detected yet."
    ),
    overview.auth.setupHint
      ? h("div", { className: "callout callout-info" }, overview.auth.setupHint)
      : null,
    h(
      "div",
      { className: "cmd-box" },
      h("code", null, loginCmd),
      h(
        "button",
        {
          type: "button",
          className: "btn btn-sm",
          onClick: async () => {
            const ok = await copyToClipboard(loginCmd);
            showToast(ok ? "Copied `gcloud auth login`" : loginCmd, "info");
          },
        },
        "Copy"
      )
    ),
    h(
      "div",
      { className: "action-row" },
      h(
        "button",
        {
          type: "button",
          className: "btn btn-primary",
          onClick: () => {
            void loadData(true);
          },
        },
        "Check Login Again"
      ),
      h(
        "button",
        {
          type: "button",
          className: "btn",
          onClick: async () => {
            state.overview = await updateCompanionPreferences({ demoMode: true });
            renderApp();
            showToast("Demo Preview Mode enabled", "info");
          },
        },
        "Preview Demo Dashboard"
      )
    ),
    renderSettingsDetails(overview)
  );
}

function renderTabNav(overview                           )              {
  const tabs                                                          = [
    { id: "overview", label: "Overview" },
    { id: "projects", label: "Projects", count: overview.summary.totalProjects },
    { id: "billing", label: "Billing", count: overview.summary.totalBillingAccounts },
  ];

  return h(
    "nav",
    { className: "tab-bar", role: "tablist", ariaLabel: "GCP Companion Sections" },
    ...tabs.map((t) =>
      h(
        "button",
        {
          type: "button",
          role: "tab",
          ariaSelected: String(state.activeTab === t.id),
          className: state.activeTab === t.id ? "tab-btn tab-btn-active" : "tab-btn",
          onClick: () => {
            state.activeTab = t.id;
            renderApp();
          },
        },
        t.label,
        t.count !== undefined ? h("span", { className: "tab-count" }, String(t.count)) : null
      )
    )
  );
}

function renderOverviewTab(overview                           )              {
  const spend = overview.spend;
  const sections                = [];

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
              `Month-to-Date Net Spend (${spend.invoiceMonth.slice(0, 4)}-${spend.invoiceMonth.slice(4)})`
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
              `Gross: ${formatMoney(total.currentMonthGrossCost, total.currency)}`
            ),
            h(
              "span",
              { className: "submetric submetric-credit" },
              `Credits: ${formatMoney(total.currentMonthCredits, total.currency)}`
            ),
            h(
              "span",
              { className: "submetric" },
              `Last mo total: ${formatMoney(total.prevMonthTotalNetCost, total.currency)}`
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
          h("h3", { className: "section-title" }, "Current Spend Breakdown"),
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
              "By Project"
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
              "By Account"
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
              "By Service"
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
                            `Top: ${ps.topServices[0].serviceName}`
                          )
                        : null
                    )
                  );
                })
              )
            : h("div", { className: "muted-note" }, "No per-project costs recorded this month.")
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
                      `${ba.id} · ${ba.linkedProjectCount} projects`
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
                      : h("span", { className: "muted-micro" }, "No BQ rows"),
                    h(
                      "span",
                      { className: ba.open ? "status-dot-open" : "status-dot-closed" },
                      ba.open ? "OPEN" : "CLOSED"
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
          h("span", { className: "kpi-label" }, "Active Projects")
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
            billingOff ? "Billing API Off" : "Open Billing Accts"
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
            billingOff ? "Enable API Below" : "Unbilled / Sandbox"
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
          spend.configured
            ? "BigQuery Connected — Waiting for Usage Rows"
            : "Unlock Month-to-Date Spend Tracking"
        ),
        h(
          "p",
          { className: "card-desc" },
          spend.configured
            ? `Queried ${spend.queriedTables.join(", ")}, which currently has no rows for ${spend.invoiceMonth} / ${spend.previousInvoiceMonth}.`
            : "GCP's REST API lists projects, billing accounts, and budget rules immediately. Connect a BigQuery Billing Export table to see exact net spend, credits, and per-service breakdowns."
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
            spend.configured ? "Manage Export Tables →" : "Connect BigQuery Export →"
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
                    showToast("Showing sample spend data", "info");
                  },
                },
                "Preview Sample Spend"
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
        h("h3", { className: "section-title" }, "Pinned & Active Projects"),
        h(
          "button",
          {
            type: "button",
            className: "link-btn",
            onClick: () => {
              state.activeTab = "projects";
              renderApp();
            },
          },
          `View all (${overview.projects.length}) →`
        )
      ),
      quickProjects.length > 0
        ? h(
            "div",
            { className: "compact-list" },
            ...quickProjects.map((proj) => renderQuickProjectItem(proj, overview))
          )
        : h(
            "div",
            { className: "muted-note" },
            "Star ★ your favorite projects in the Projects tab to pin them here for 1-click switching."
          )
    )
  );

  // Warnings Banner (non-fatal API permissions or stale fallback notes)
  const remainingWarnings = getNonBillingApiWarnings(overview);
  if (remainingWarnings.length > 0) {
    sections.push(
      h(
        "section",
        { className: "card warning-card" },
        h("h3", { className: "section-title" }, "Diagnostics & Notes"),
        ...remainingWarnings.map((w) => renderWarningLine(w))
      )
    );
  }

  return h("div", { className: "tab-panel" }, ...sections);
}

function renderWarningLine(warningText        )              {
  const urlMatch = /(https:\/\/console\.(?:cloud|developers)\.google\.com\/[^\s)]+)/.exec(
    warningText
  );
  if (!urlMatch) {
    return h("p", { className: "warning-line" }, warningText);
  }
  const consoleUrl = urlMatch[1];
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
        "Enable API in GCP Console ↗"
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
          ? h("span", { className: "badge badge-active" }, "Active")
          : null
      ),
      h(
        "span",
        { className: "row-mono" },
        `${proj.projectId}${proj.billingAccountName ? ` · ${proj.billingAccountName}` : " · Unbilled"}`
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
              title: `Run gcloud config set project ${proj.projectId}`,
              onClick: async () => {
                try {
                  state.overview = await switchActiveProject(proj.projectId);
                  renderApp();
                  showToast(`Active project set to ${proj.projectId}`, "success");
                } catch (err) {
                  showToast(
                    err instanceof Error ? err.message : "Failed to switch project",
                    "error"
                  );
                }
              },
            },
            "Set Active"
          )
        : null,
      h(
        "a",
        {
          className: "icon-link",
          href: `https://console.cloud.google.com/home/dashboard?project=${encodeURIComponent(proj.projectId)}`,
          target: "_blank",
          rel: "noopener noreferrer",
          title: "Open in Google Cloud Console",
        },
        "↗"
      )
    )
  );
}

function getFilteredAndSortedProjects(overview                           )               {
  const searchLower = state.projectSearch.trim().toLowerCase();

  const filtered = overview.projects.filter((p) => {
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
  const filtered = getFilteredAndSortedProjects(overview);

  const filterChips                                        = [
    { key: "all", label: `All (${overview.projects.length})` },
    { key: "pinned", label: `Pinned ★ (${overview.summary.pinnedProjectsCount})` },
    { key: "unbilled", label: `Unbilled (${overview.summary.unbilledProjects})` },
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
          placeholder: "Search project name, ID, number, label…",
          value: state.projectSearch,
          ariaLabel: "Search GCP Projects",
          onInput: (ev) => {
            state.projectSearch = (ev.target                    ).value;
            renderProjectsListOnly();
          },
        }),
        h(
          "select",
          {
            className: "compact-select",
            ariaLabel: "Sort projects",
            onChange: (ev) => {
              state.projectSort = (ev.target                     ).value                   ;
              renderApp();
            },
          },
          h("option", { value: "smart", selected: state.projectSort === "smart" }, "Sort: Smart"),
          h(
            "option",
            { value: "spend", selected: state.projectSort === "spend" },
            "Sort: Spend ↓"
          ),
          h("option", { value: "name", selected: state.projectSort === "name" }, "Sort: Name A–Z")
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
      ...buildProjectCards(filtered, overview)
    )
  );
}

function renderProjectsListOnly()       {
  const container = document.getElementById("projects-results-container");
  if (!container || !state.overview) return;
  const filtered = getFilteredAndSortedProjects(state.overview);
  clearElement(container);
  for (const node of buildProjectCards(filtered, state.overview)) {
    container.appendChild(node);
  }
}

function buildProjectCards(
  projects                       ,
  overview                           
)                {
  if (projects.length === 0) {
    return [
      h("div", { className: "card muted-note" }, "No GCP projects match the current filter."),
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
            title: proj.pinned ? "Unpin project" : "Pin project to Overview",
            ariaLabel: proj.pinned ? `Unpin ${proj.projectId}` : `Pin ${proj.projectId}`,
            onClick: async (ev) => {
              ev.stopPropagation();
              try {
                state.overview = await togglePinProject(proj.projectId, !proj.pinned);
                renderApp();
              } catch (err) {
                showToast(
                  err instanceof Error ? err.message : "Failed to update pin",
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
              ? h("span", { className: "badge badge-active" }, "Active")
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
                title: "Copy Project ID",
                onClick: async (ev) => {
                  ev.stopPropagation();
                  const ok = await copyToClipboard(proj.projectId);
                  showToast(ok ? `Copied ${proj.projectId}` : proj.projectId, "info");
                },
              },
              `${proj.projectId} ⧉`
            ),
            proj.billingEnabled && proj.billingAccountName
              ? h("span", { className: "billing-tag" }, proj.billingAccountName)
              : h("span", { className: "billing-tag billing-tag-off" }, "No Billing")
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
                        state.overview = await switchActiveProject(proj.projectId);
                        renderApp();
                        showToast(`Switched active project to ${proj.projectId}`, "success");
                      } catch (err) {
                        showToast(
                          err instanceof Error ? err.message : "Failed to switch project",
                          "error"
                        );
                      }
                    },
                  },
                  "Set Active"
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
              expanded ? "Hide ▴" : "Details ▾"
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
              h("span", { className: "muted-micro" }, `Project # ${proj.projectNumber || "—"}`),
              proj.billingAccountId
                ? h("span", { className: "muted-micro" }, `Billing ID: ${proj.billingAccountId}`)
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
                      `Gross: ${formatMoney(ps.currentMonthGrossCost, ps.currency)}`
                    ),
                    h(
                      "span",
                      { className: "submetric-credit" },
                      `Credits: ${formatMoney(ps.currentMonthCredits, ps.currency)}`
                    ),
                    renderDeltaBadge(ps.deltaPercentVsPrevSameDay)
                  ),
                  renderServiceBreakdownList(ps.topServices, ps.currency)
                )
              : h(
                  "div",
                  { className: "muted-note" },
                  overview.spend.configured
                    ? "No BigQuery cost entries recorded for this project in the current month."
                    : "Connect BigQuery Billing Export in the Billing tab to view per-service costs here."
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
                "Dashboard ↗"
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
                "Billing Report ↗"
              ),
              h(
                "a",
                {
                  className: "console-chip",
                  href: `https://console.cloud.google.com/run?project=${encodedId}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                "Cloud Run ↗"
              ),
              h(
                "a",
                {
                  className: "console-chip",
                  href: `https://console.cloud.google.com/bigquery?project=${encodedId}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                "BigQuery ↗"
              ),
              h(
                "a",
                {
                  className: "console-chip",
                  href: `https://console.cloud.google.com/logs/query?project=${encodedId}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                "Logs ↗"
              )
            )
          )
        : null
    );
  });
}

function renderBillingAccountCard(
  ba                ,
  overview                           
)              {
  const bs = overview.spend.byBillingAccount[ba.id];

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
          h(
            "span",
            { className: ba.open ? "badge badge-active" : "badge badge-neutral" },
            ba.open ? "OPEN" : "CLOSED"
          )
        ),
        h(
          "div",
          { className: "project-meta-line" },
          h(
            "button",
            {
              type: "button",
              className: "mono-copy-btn",
              title: "Copy Billing Account ID",
              onClick: async () => {
                const ok = await copyToClipboard(ba.id);
                showToast(ok ? `Copied ${ba.id}` : ba.id, "info");
              },
            },
            `${ba.id} ⧉`
          ),
          h(
            "button",
            {
              type: "button",
              className: "link-btn",
              onClick: () => {
                state.activeTab = "projects";
                state.projectFilter = `ba:${ba.id}`;
                renderApp();
              },
            },
            `${ba.linkedProjectCount} linked projects →`
          )
        )
      ),
      h(
        "a",
        {
          className: "btn btn-xs",
          href: `https://console.cloud.google.com/billing/${encodeURIComponent(ba.id)}/reports`,
          target: "_blank",
          rel: "noopener noreferrer",
        },
        "Console Report ↗"
      )
    ),
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
              h("div", { className: "eyebrow" }, "Month-to-Date Net"),
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
            h("span", null, `Gross: ${formatMoney(bs.currentMonthGrossCost, bs.currency)}`),
            h(
              "span",
              { className: "submetric-credit" },
              `Credits: ${formatMoney(bs.currentMonthCredits, bs.currency)}`
            ),
            h("span", null, `Last mo: ${formatMoney(bs.prevMonthTotalNetCost, bs.currency)}`)
          ),
          renderDailySparkline(bs.dailySeries, bs.currency),
          renderServiceBreakdownList(bs.topServices.slice(0, 4), bs.currency)
        )
      : h(
          "div",
          { className: "muted-note" },
          ba.exportTableId
            ? `Bound to ${ba.exportTableId} (no rows for current month yet).`
            : "Link a BigQuery Billing Export table below to display spend for this billing account."
        ),
    ba.budgets.length > 0
      ? h(
          "div",
          { className: "budgets-block" },
          h("div", { className: "eyebrow" }, `Configured Budgets (${ba.budgets.length})`),
          ...ba.budgets.map((b) => {
            const targetText =
              b.amountUnits !== null
                ? formatMoney(b.amountUnits, b.currencyCode || bs?.currency || "USD")
                : b.lastPeriodAmount
                  ? "100% of last period"
                  : "Custom target";
            const rulesText =
              b.thresholds.length > 0
                ? b.thresholds
                    .map((t) => `${Math.round(t.thresholdPercent * 100)}%`)
                    .join(" · ")
                : "No threshold rules";
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
      "All Billing Accounts (* shared export)"
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
    h("h3", { className: "section-title" }, "BigQuery Billing Export Connection"),
    h(
      "p",
      { className: "card-desc" },
      "Queries are cached locally (default 6h TTL) and strictly pruned by `_PARTITIONTIME` so only current & previous month partitions are scanned."
    ),
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
                    ? "Shared Export (*)"
                    : `Billing Account ${m.billingAccountId}`
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
                      showToast("Removed export table mapping", "info");
                    } catch (err) {
                      showToast(
                        err instanceof Error ? err.message : "Failed to remove mapping",
                        "error"
                      );
                    }
                  },
                },
                "Unlink"
              )
            )
          )
        )
      : null,

    // Step 1: Auto-Detect in a Host Project
    h(
      "div",
      { className: "setup-subbox" },
      h("div", { className: "eyebrow" }, "Auto-Detect Export Tables in Project"),
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
          placeholder: "Select or type host project ID…",
          value: state.discoverHostProject,
          ariaLabel: "Billing Export Host Project ID",
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
                showToast("Select or enter a host project ID first", "error");
                return;
              }
              try {
                state.discoveringTables = true;
                renderApp();
                state.discoveredTables = await discoverExportTablesApi(host);
                if (state.discoveredTables.length === 0) {
                  showToast(`No gcp_billing_export_* tables found in ${host}`, "info");
                } else {
                  showToast(
                    `Found ${state.discoveredTables.length} billing export table(s)`,
                    "success"
                  );
                }
              } catch (err) {
                showToast(
                  err instanceof Error ? err.message : "Discovery failed",
                  "error"
                );
              } finally {
                state.discoveringTables = false;
                renderApp();
              }
            },
          },
          state.discoveringTables ? "Scanning…" : "Scan Datasets"
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
                      ? `Matches Billing ID: ${tbl.inferredBillingAccountId}`
                      : "Shared / Custom Export"
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
                        showToast("Connected BigQuery Billing Export!", "success");
                      } catch (err) {
                        showToast(
                          err instanceof Error ? err.message : "Failed to connect table",
                          "error"
                        );
                      } finally {
                        state.refreshing = false;
                        renderApp();
                      }
                    },
                  },
                  "Link & Query"
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
            showToast("Enter project.dataset.table first", "error");
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
            showToast("Saved BigQuery export table & loaded spend", "success");
          } catch (err) {
            showToast(err instanceof Error ? err.message : "Invalid table reference", "error");
          } finally {
            state.refreshing = false;
            renderApp();
          }
        },
      },
      h("div", { className: "eyebrow" }, "Or Bind Table ID Manually"),
      h(
        "select",
        {
          className: "compact-select full-width",
          ariaLabel: "Target Billing Account",
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
          "Save"
        )
      )
    ),

    h(
      "details",
      { className: "help-details" },
      h("summary", null, "How do I enable BigQuery Billing Export in GCP?"),
      h(
        "ol",
        { className: "guide-steps" },
        h("li", null, "Open Google Cloud Console → Billing → Billing export."),
        h("li", null, "Choose a project & BigQuery dataset to store billing records."),
        h("li", null, "Enable 'Standard usage cost' export (recommended, lightweight)."),
        h("li", null, "Return here and click 'Scan Datasets' on that project.")
      ),
      h(
        "a",
        {
          className: "link-external",
          href: "https://console.cloud.google.com/billing",
          target: "_blank",
          rel: "noopener noreferrer",
        },
        "Open GCP Billing Console ↗"
      )
    )
  );
}

function renderSettingsDetails(overview                           )              {
  const currentHours = overview.preferences.cacheTtlHours;
  let quotaInputVal = overview.preferences.quotaProjectOverride || "";
  let gcloudPathVal = overview.preferences.gcloudPathOverride || "";

  return h(
    "details",
    { className: "card settings-details" },
    h("summary", { className: "settings-summary" }, "Companion Preferences & Cache Settings"),
    h(
      "div",
      { className: "settings-body" },
      h(
        "label",
        { className: "field-label" },
        "Local Cache TTL (avoids repeated BigQuery scans)",
        h(
          "select",
          {
            className: "compact-select full-width",
            onChange: async (ev) => {
              const hrs = Number((ev.target                     ).value);
              state.overview = await updateCompanionPreferences({ cacheTtlHours: hrs });
              renderApp();
              showToast(`Cache TTL set to ${hrs}h`, "success");
            },
          },
          ...[1, 6, 12, 24].map((hr) =>
            h(
              "option",
              { value: String(hr), selected: Math.round(currentHours) === hr },
              hr === 6 ? "6 hours (Recommended)" : `${hr} hour${hr > 1 ? "s" : ""}`
            )
          )
        )
      ),
      h(
        "label",
        { className: "field-label" },
        "Quota Project Override (x-goog-user-project)",
        h("input", {
          type: "text",
          className: "text-input full-width",
          placeholder: "Defaults to active gcloud project",
          value: quotaInputVal,
          onInput: (ev) => {
            quotaInputVal = (ev.target                    ).value;
          },
        })
      ),
      h(
        "label",
        { className: "field-label" },
        "Custom gcloud Binary Path (optional)",
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
            className: "btn btn-sm",
            onClick: async () => {
              try {
                state.overview = await updateCompanionPreferences({
                  quotaProjectOverride: quotaInputVal.trim() || null,
                  gcloudPathOverride: gcloudPathVal.trim() || null,
                });
                renderApp();
                showToast("Saved companion settings", "success");
              } catch (err) {
                showToast(
                  err instanceof Error ? err.message : "Invalid settings input",
                  "error"
                );
              }
            },
          },
          "Apply Settings"
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn btn-sm btn-ghost",
            onClick: async () => {
              const nextDemo = !overview.preferences.demoMode;
              state.overview = await updateCompanionPreferences({ demoMode: nextDemo });
              renderApp();
              showToast(nextDemo ? "Demo Mode ON" : "Demo Mode OFF (Live gcloud)", "info");
            },
          },
          overview.preferences.demoMode ? "Switch to Live gcloud Data" : "Enable Demo Preview Mode"
        )
      )
    )
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
          h("h3", { className: "section-title" }, "Billing API Diagnostics"),
          ...otherWarnings.map((w) => renderWarningLine(w))
        )
      : null;

  return h(
    "div",
    { className: "tab-panel" },
    billingApiPrompt,
    warningSection,
    overview.billingAccounts.length > 0
      ? h(
          "div",
          { className: "stack-list" },
          ...overview.billingAccounts.map((ba) => renderBillingAccountCard(ba, overview))
        )
      : billingApiPrompt
        ? null
        : h(
            "div",
            { className: "card muted-note" },
            "No Cloud Billing accounts visible to the active Google account (requires `billing.accounts.get` or `billing.accounts.list`)."
          ),
    renderBillingExportSetupCard(overview),
    renderSettingsDetails(overview)
  );
}

function renderApp()       {
  const root = document.getElementById("app");
  if (!root) return;
  clearElement(root);

  if (state.loading && !state.overview) {
    root.appendChild(
      h(
        "div",
        { className: "boot-loading" },
        h("div", { className: "spinner" }),
        h("div", null, "Connecting to Google Cloud Companion…")
      )
    );
    return;
  }

  if (!state.overview) {
    root.appendChild(
      h(
        "div",
        { className: "card error-card" },
        h("h2", { className: "card-title" }, "Unable to Load GCP Companion"),
        h("p", { className: "card-desc" }, state.error || "Unknown connection error."),
        h(
          "button",
          {
            type: "button",
            className: "btn btn-primary",
            onClick: () => {
              void loadData(true);
            },
          },
          "Retry"
        )
      )
    );
    return;
  }

  const overview = state.overview;
  root.appendChild(renderHeader(overview));

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

void loadData(false);

})();
