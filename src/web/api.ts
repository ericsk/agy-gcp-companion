import type {
  CompanionOverviewResponse,
  DiscoveredBillingTable,
  GcpProject,
  ProjectSpendSummary,
} from "../core/types.ts";

interface SessionState {
  csrfToken: string;
  proxyCsrfToken: string;
  expiresAt: number;
}

// Held strictly in module memory closure (never persisted to browser storage)
let activeSession: SessionState | null = null;

export function clearClientSession(): void {
  activeSession = null;
}

const FETCH_TIMEOUT_MS = 45_000;

function resolveEndpointCandidates(endpoint: string): string[] {
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
  endpoint: string,
  init: RequestInit,
  timeoutMs = FETCH_TIMEOUT_MS
): Promise<Response> {
  const candidates = resolveEndpointCandidates(endpoint);
  let lastRes: Response | null = null;
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
  return lastRes!;
}

async function ensureSession(forceNew = false): Promise<SessionState> {
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
  const data = (await res.json()) as {
    csrfToken: string;
    proxyCsrfToken: string;
    expiresInMs: number;
  };
  activeSession = {
    csrfToken: data.csrfToken,
    proxyCsrfToken: data.proxyCsrfToken,
    expiresAt: Date.now() + Number(data.expiresInMs || 1_800_000),
  };
  return activeSession;
}

async function apiPost<T>(
  path: string,
  body: Record<string, unknown>,
  retried = false,
  timeoutMs = FETCH_TIMEOUT_MS
): Promise<T> {
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
    return apiPost<T>(path, body, true, timeoutMs);
  }

  const payload = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) {
    throw new Error(payload.error || `Request failed (HTTP ${res.status})`);
  }
  return payload;
}

export async function fetchOverview(forceRefresh = false): Promise<CompanionOverviewResponse> {
  await ensureSession(false);
  const query = forceRefresh ? "?refresh=1" : "";
  const res = await fetchEndpoint(`api/overview${query}`, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });
  const payload = (await res.json().catch(() => ({}))) as { error?: string } & CompanionOverviewResponse;
  if (!res.ok) {
    throw new Error(payload.error || `Failed to load GCP overview (HTTP ${res.status})`);
  }
  return payload;
}

export async function switchActiveProject(projectId: string): Promise<CompanionOverviewResponse> {
  const data = await apiPost<{ overview: CompanionOverviewResponse }>("./api/active-project", {
    projectId,
  });
  return data.overview;
}

export async function switchActiveAccount(account: string): Promise<CompanionOverviewResponse> {
  const data = await apiPost<{ overview: CompanionOverviewResponse }>("./api/active-account", {
    account,
  });
  return data.overview;
}

export async function togglePinProject(
  projectId: string,
  pinned: boolean
): Promise<CompanionOverviewResponse> {
  const data = await apiPost<{ overview: CompanionOverviewResponse }>("./api/pin-project", {
    projectId,
    pinned,
  });
  return data.overview;
}

export async function updateCompanionPreferences(prefs: {
  maskEmails?: boolean;
  cacheTtlHours?: number;
  gcloudPathOverride?: string | null;
  quotaProjectOverride?: string | null;
  demoMode?: boolean;
}): Promise<CompanionOverviewResponse> {
  const data = await apiPost<{ overview: CompanionOverviewResponse }>("./api/preferences", prefs);
  return data.overview;
}

export async function discoverExportTablesApi(
  hostProjectId: string
): Promise<DiscoveredBillingTable[]> {
  const data = await apiPost<{ tables: DiscoveredBillingTable[] }>(
    "./api/billing-export/discover",
    { hostProjectId }
  );
  return data.tables;
}

export async function configureExportTableApi(params: {
  billingAccountId: string;
  tableId?: string;
  hostProjectId?: string;
  remove?: boolean;
}): Promise<CompanionOverviewResponse> {
  const data = await apiPost<{ overview: CompanionOverviewResponse }>(
    "./api/billing-export/configure",
    params
  );
  return data.overview;
}

export async function fetchProjectBreakdownApi(projectId: string): Promise<{
  project: GcpProject | null;
  spend: ProjectSpendSummary | null;
  consoleLinks: Record<string, string>;
  spendConfigured: boolean;
}> {
  const res = await fetchEndpoint(
    `api/project-breakdown?projectId=${encodeURIComponent(projectId)}`,
    {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    }
  );
  const payload = (await res.json().catch(() => ({}))) as {
    error?: string;
    project: GcpProject | null;
    spend: ProjectSpendSummary | null;
    consoleLinks: Record<string, string>;
    spendConfigured: boolean;
  };
  if (!res.ok) {
    throw new Error(payload.error || `Failed to load breakdown (HTTP ${res.status})`);
  }
  return payload;
}

export async function enableGcpServiceApi(
  projectId: string,
  serviceName: string
): Promise<CompanionOverviewResponse> {
  const data = await apiPost<{ overview: CompanionOverviewResponse }>("./api/enable-service", {
    projectId,
    serviceName,
  });
  return data.overview;
}

export async function startBrowserLoginApi(): Promise<CompanionOverviewResponse> {
  const data = await apiPost<{ overview: CompanionOverviewResponse }>(
    "./api/auth-login",
    {},
    false,
    125_000
  );
  return data.overview;
}
