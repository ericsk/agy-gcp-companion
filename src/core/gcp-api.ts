import {
  normalizeBillingAccountId,
  sanitizeErrorMessage,
  validateBillingAccountId,
  validateProjectId,
} from "./security.ts";
import type { BudgetInfo, BudgetThresholdRule, ProjectBillingLinkInfo } from "./types.ts";
import type { FetchLike } from "./gcloud.ts";

export function isQuotaOrApiDisabledMessage(msg: string): boolean {
  return /requires a quota project|has not been used in project|SERVICE_DISABLED|has been deleted|USER_PROJECT_DENIED|permission to use project/i.test(
    msg
  );
}

export interface RawGcpProject {
  projectId: string;
  projectNumber: string;
  name: string;
  lifecycleState: string;
  createTime?: string;
  labels?: Record<string, string>;
  billingAccountId: string | null;
  billingEnabled: boolean;
}

export interface RawBillingAccount {
  id: string;
  resourceName: string;
  displayName: string;
  open: boolean;
  masterBillingAccount?: string;
  currencyCode?: string;
  linkedProjectIds: string[];
  budgets: BudgetInfo[];
}

export class GcpHttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function gcpGetJson<T>(
  url: string,
  accessToken: string,
  quotaProject?: string | null,
  fetchFn: FetchLike = globalThis.fetch
): Promise<T> {
  const doFetch = async (qp?: string | null) => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    };
    if (qp) {
      headers["x-goog-user-project"] = qp;
    }
    return fetchFn(url, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(15_000),
    });
  };

  let res = await doFetch(quotaProject);

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body?.error?.message) {
        detail = `${detail}: ${body.error.message}`;
      }
    } catch {
      // Ignore non-JSON error body
    }

    // If the quota project was deleted or lacks service enablement, retry once without x-goog-user-project
    // (skip retrying null for Cloud Billing / Budgets APIs on SERVICE_DISABLED because user OAuth credentials
    // always require an enabled quota project on those endpoints).
    const requiresQuotaProject =
      url.startsWith("https://cloudbilling.googleapis.com/") ||
      url.startsWith("https://billingbudgets.googleapis.com/");
    if (
      quotaProject &&
      (res.status === 403 || res.status === 400) &&
      (/has been deleted|USER_PROJECT_DENIED/i.test(detail) ||
        (!requiresQuotaProject && /has not been used in project|SERVICE_DISABLED/i.test(detail)))
    ) {
      const retryRes = await doFetch(null);
      if (retryRes.ok) {
        return (await retryRes.json()) as T;
      }
    }

    throw new GcpHttpError(res.status, sanitizeErrorMessage(detail));
  }

  return (await res.json()) as T;
}

export async function runWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
  return results;
}

export async function fetchAllProjects(
  accessToken: string,
  fetchFn: FetchLike = globalThis.fetch
): Promise<RawGcpProject[]> {
  const projects: RawGcpProject[] = [];
  let pageToken = "";
  let pageCount = 0;

  while (pageCount < 20) {
    pageCount++;
    const params = new URLSearchParams({
      filter: "lifecycleState:ACTIVE",
      pageSize: "500",
    });
    if (pageToken) {
      params.set("pageToken", pageToken);
    }
    const url = `https://cloudresourcemanager.googleapis.com/v1/projects?${params.toString()}`;
    const data = await gcpGetJson<{
      projects?: Array<{
        projectId?: string;
        projectNumber?: string;
        name?: string;
        lifecycleState?: string;
        createTime?: string;
        labels?: Record<string, string>;
      }>;
      nextPageToken?: string;
    }>(url, accessToken, null, fetchFn);

    for (const p of data.projects ?? []) {
      if (!p.projectId) continue;
      projects.push({
        projectId: p.projectId,
        projectNumber: String(p.projectNumber ?? ""),
        name: p.name || p.projectId,
        lifecycleState: p.lifecycleState || "ACTIVE",
        createTime: p.createTime,
        labels: p.labels,
        billingAccountId: null,
        billingEnabled: false,
      });
    }

    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }

  return projects;
}

export async function fetchBillingAccountsCore(
  accessToken: string,
  initialProjects: RawGcpProject[],
  quotaProject?: string | null,
  fetchFn: FetchLike = globalThis.fetch,
  verifiedFallbackQuotaProject?: string | null,
  lazyProjectsLoader?: () => Promise<RawGcpProject[]>
): Promise<{
  billingAccounts: RawBillingAccount[];
  projectBillingLinks: Record<string, ProjectBillingLinkInfo>;
  warnings: string[];
  usedQuotaProject: string | null;
}> {
  const warnings: string[] = [];
  const rawAccounts: RawBillingAccount[] = [];
  const projectBillingLinks: Record<string, ProjectBillingLinkInfo> = {};

  let loadedProjects = initialProjects;
  let lazyLoaded = initialProjects.length > 0 || !lazyProjectsLoader;
  const ensureProjects = async (): Promise<RawGcpProject[]> => {
    if (!lazyLoaded && lazyProjectsLoader) {
      lazyLoaded = true;
      try {
        loadedProjects = await lazyProjectsLoader();
      } catch {
        loadedProjects = [];
      }
    }
    return loadedProjects;
  };

  if (!quotaProject && !verifiedFallbackQuotaProject && loadedProjects.length === 0 && lazyProjectsLoader) {
    await ensureProjects();
  }

  // Try `targetQuotaProject` (user's Active Project / override) first, then `verifiedFallbackQuotaProject`
  // (a project previously confirmed to have Cloud Billing API enabled so switching Active Project never loses
  // Billing Accounts), and finally `null` (no header). Any diagnostic error strictly reports `targetQuotaProject`.
  const targetQuotaProject = quotaProject || loadedProjects[0]?.projectId || null;
  let resolvedQuotaProj: string | null | undefined = undefined;
  let resolvedQuotaConfirmed = false;
  let billingApiDisabledOnAllCandidates = false;

  const billingGetJson = async <T>(url: string): Promise<T> => {
    if (resolvedQuotaProj !== undefined) {
      const res = await gcpGetJson<T>(url, accessToken, resolvedQuotaProj, fetchFn);
      resolvedQuotaConfirmed = true;
      return res;
    }

    const primaryCandidates: Array<string | null> = [];
    const pushUnique = (list: Array<string | null>, id: string | null | undefined) => {
      if (id === undefined) return;
      if (!list.includes(id)) list.push(id);
    };

    pushUnique(primaryCandidates, targetQuotaProject);
    if (
      verifiedFallbackQuotaProject &&
      (loadedProjects.length === 0 ||
        loadedProjects.some((p) => p.projectId === verifiedFallbackQuotaProject))
    ) {
      pushUnique(primaryCandidates, verifiedFallbackQuotaProject);
    }

    let preferredErr: unknown = null;
    let allCandidatesQuotaOrDisabled = true;

    const tryCandidate = async (candidate: string | null): Promise<{ hit: true; value: T } | { hit: false }> => {
      try {
        const res = await gcpGetJson<T>(url, accessToken, candidate, fetchFn);
        resolvedQuotaProj = candidate;
        resolvedQuotaConfirmed = true;
        return { hit: true, value: res };
      } catch (err) {
        if (candidate === targetQuotaProject || !preferredErr) {
          preferredErr = err;
        }
        const msg = err instanceof Error ? err.message : String(err);
        const isQuotaOrDisabled = isQuotaOrApiDisabledMessage(msg);
        if (!isQuotaOrDisabled) {
          allCandidatesQuotaOrDisabled = false;
        }
        // If this was `targetQuotaProject` and failed due to user lacking `billing.accounts.list` IAM permission
        // (not a quota/service-disabled issue), cache `targetQuotaProject` so fallback `billingInfo` calls reuse it
        // directly instead of repeating the candidate probe.
        if (candidate === targetQuotaProject && !isQuotaOrDisabled) {
          resolvedQuotaProj = targetQuotaProject;
          throw preferredErr;
        }
        return { hit: false };
      }
    };

    for (const candidate of primaryCandidates) {
      const attempt = await tryCandidate(candidate);
      if (attempt.hit) return attempt.value;
    }

    // Lazily await projects only if primary quota candidates failed with quota/disabled errors
    const fallbackProjects = await ensureProjects();
    const extraCandidates: Array<string | null> = [];
    let extraFallbackCount = 0;
    for (const p of fallbackProjects) {
      if (extraFallbackCount >= 2) break;
      if (!primaryCandidates.includes(p.projectId) && !extraCandidates.includes(p.projectId)) {
        extraCandidates.push(p.projectId);
        extraFallbackCount++;
      }
    }
    if (!primaryCandidates.includes(null)) {
      pushUnique(extraCandidates, null);
    }

    for (const candidate of extraCandidates) {
      const attempt = await tryCandidate(candidate);
      if (attempt.hit) return attempt.value;
    }

    // Only skip the project/*/billingInfo fallback loop when every candidate failed with a quota/disabled error
    // (avoiding skipping fallback on transient 5xx or network timeouts).
    billingApiDisabledOnAllCandidates = allCandidatesQuotaOrDisabled;
    resolvedQuotaProj = allCandidatesQuotaOrDisabled ? null : targetQuotaProject;
    throw preferredErr ?? new Error("Unable to query Cloud Billing API.");
  };

  try {
    let pageToken = "";
    let pages = 0;
    while (pages < 10) {
      pages++;
      const params = new URLSearchParams({ pageSize: "100" });
      if (pageToken) params.set("pageToken", pageToken);
      const url = `https://cloudbilling.googleapis.com/v1/billingAccounts?${params.toString()}`;
      const data = await billingGetJson<{
        billingAccounts?: Array<{
          name?: string;
          displayName?: string;
          open?: boolean;
          masterBillingAccount?: string;
          currencyCode?: string;
        }>;
        nextPageToken?: string;
      }>(url);

      for (const acct of data.billingAccounts ?? []) {
        if (!acct.name) continue;
        try {
          const id = normalizeBillingAccountId(acct.name);
          rawAccounts.push({
            id,
            resourceName: `billingAccounts/${id}`,
            displayName: acct.displayName || id,
            open: Boolean(acct.open),
            masterBillingAccount: acct.masterBillingAccount || undefined,
            currencyCode: acct.currencyCode || undefined,
            linkedProjectIds: [],
            budgets: [],
          });
        } catch {
          // Skip malformed billing account IDs
        }
      }

      if (!data.nextPageToken) break;
      pageToken = data.nextPageToken;
    }
  } catch (err) {
    warnings.push(`Cloud Billing Accounts list warning: ${sanitizeErrorMessage(err)}`);
  }

  const projectById = new Map<string, RawGcpProject>();
  for (const p of loadedProjects) {
    projectById.set(p.projectId, p);
  }

  // Fast batch path: list projects linked to each billing account
  await runWithConcurrency(rawAccounts, 5, async (acct) => {
    try {
      let pageToken = "";
      let pages = 0;
      while (pages < 10) {
        pages++;
        const params = new URLSearchParams({ pageSize: "200" });
        if (pageToken) params.set("pageToken", pageToken);
        const url = `https://cloudbilling.googleapis.com/v1/${acct.resourceName}/projects?${params.toString()}`;
        const data = await billingGetJson<{
          projectBillingInfo?: Array<{
            projectId?: string;
            billingAccountName?: string;
            billingEnabled?: boolean;
          }>;
          nextPageToken?: string;
        }>(url);

        for (const info of data.projectBillingInfo ?? []) {
          if (!info.projectId) continue;
          const enabled = Boolean(info.billingEnabled);
          if (enabled) {
            acct.linkedProjectIds.push(info.projectId);
          }
          projectBillingLinks[info.projectId] = {
            billingAccountId: acct.id,
            billingEnabled: enabled,
          };
          const proj = projectById.get(info.projectId);
          if (proj) {
            proj.billingAccountId = acct.id;
            proj.billingEnabled = enabled;
          }
        }
        if (!data.nextPageToken) break;
        pageToken = data.nextPageToken;
      }
    } catch (err) {
      warnings.push(
        `Could not list linked projects for billing account ${acct.displayName} (${acct.id}): ${sanitizeErrorMessage(err)}`
      );
    }
  });

  // Fallback path: if user lacks org-level billingAccounts.list permission, check project-level billingInfo
  // Skip when Cloud Billing API failed across all quota project candidates, as project/*/billingInfo hits the same disabled API.
  if (rawAccounts.length === 0 && !billingApiDisabledOnAllCandidates) {
    const fallbackProjects = await ensureProjects();
    if (fallbackProjects.length > 0) {
      const discoveredAccountMap = new Map<string, RawBillingAccount>();
      const sampleProjects = fallbackProjects.slice(0, 25);
      await runWithConcurrency(sampleProjects, 5, async (proj) => {
        try {
          const url = `https://cloudbilling.googleapis.com/v1/projects/${encodeURIComponent(proj.projectId)}/billingInfo`;
          const info = await billingGetJson<{
            billingAccountName?: string;
            billingEnabled?: boolean;
          }>(url);
          if (info.billingAccountName) {
            const id = normalizeBillingAccountId(info.billingAccountName);
            const enabled = Boolean(info.billingEnabled);
            proj.billingAccountId = id;
            proj.billingEnabled = enabled;
            projectBillingLinks[proj.projectId] = {
              billingAccountId: id,
              billingEnabled: enabled,
            };
            let acct = discoveredAccountMap.get(id);
            if (!acct) {
              acct = {
                id,
                resourceName: `billingAccounts/${id}`,
                displayName: `Billing Account (${id})`,
                open: enabled,
                linkedProjectIds: [],
                budgets: [],
              };
              discoveredAccountMap.set(id, acct);
            }
            if (enabled) {
              acct.linkedProjectIds.push(proj.projectId);
            }
          }
        } catch {
          // Ignore per-project permission denials
        }
      });
      rawAccounts.push(...discoveredAccountMap.values());
    }
  }

  return {
    billingAccounts: rawAccounts,
    projectBillingLinks,
    warnings,
    usedQuotaProject: resolvedQuotaConfirmed ? (resolvedQuotaProj ?? null) : null,
  };
}

export async function fetchBudgetsForBillingAccounts(
  accessToken: string,
  billingAccounts: RawBillingAccount[],
  quotaProject?: string | null,
  fetchFn: FetchLike = globalThis.fetch
): Promise<{
  budgetsByAccount: Record<string, BudgetInfo[]>;
  warnings: string[];
}> {
  const budgetsByAccount: Record<string, BudgetInfo[]> = {};
  const warnings: string[] = [];

  if (billingAccounts.length === 0) {
    return { budgetsByAccount, warnings };
  }

  await runWithConcurrency(billingAccounts, 4, async (acct) => {
    try {
      const url = `https://billingbudgets.googleapis.com/v1/${acct.resourceName}/budgets?pageSize=50`;
      const data = await gcpGetJson<{
        budgets?: Array<{
          name?: string;
          displayName?: string;
          budgetFilter?: { projects?: string[] };
          amount?: {
            specifiedAmount?: { currencyCode?: string; units?: string; nanos?: number };
            lastPeriodAmount?: Record<string, unknown>;
          };
          thresholdRules?: Array<{ thresholdPercent?: number; spendBasis?: string }>;
        }>;
      }>(url, accessToken, quotaProject, fetchFn);

      const parsed = (data.budgets ?? []).map((b): BudgetInfo => {
        const specified = b.amount?.specifiedAmount;
        const units = specified
          ? Number(specified.units || 0) + Number(specified.nanos || 0) / 1e9
          : null;
        const thresholds: BudgetThresholdRule[] = (b.thresholdRules ?? []).map((r) => ({
          thresholdPercent: Number(r.thresholdPercent ?? 0),
          spendBasis: r.spendBasis || "CURRENT_SPEND",
        }));
        return {
          name: b.name || "",
          displayName: b.displayName || "Unnamed Budget",
          billingAccountId: acct.id,
          amountUnits: Number.isFinite(units) ? units : null,
          currencyCode: specified?.currencyCode || acct.currencyCode || null,
          lastPeriodAmount: Boolean(b.amount?.lastPeriodAmount),
          projectFilterIds: b.budgetFilter?.projects ?? [],
          thresholds,
        };
      });
      acct.budgets = parsed;
      budgetsByAccount[acct.id] = parsed;
    } catch (err) {
      budgetsByAccount[acct.id] = [];
      // Budgets API requires a quota project or billing.budgets.list; silently skip 403/404 without breaking UX
      if (!(err instanceof GcpHttpError && (err.status === 403 || err.status === 404))) {
        warnings.push(
          `Budgets lookup skipped for ${acct.displayName}: ${sanitizeErrorMessage(err)}`
        );
      }
    }
  });

  return { budgetsByAccount, warnings };
}

export async function fetchBillingAccountsAndProjectLinks(
  accessToken: string,
  projects: RawGcpProject[],
  quotaProject?: string | null,
  fetchFn: FetchLike = globalThis.fetch,
  verifiedFallbackQuotaProject?: string | null
): Promise<{
  billingAccounts: RawBillingAccount[];
  warnings: string[];
  usedQuotaProject: string | null;
}> {
  const core = await fetchBillingAccountsCore(
    accessToken,
    projects,
    quotaProject,
    fetchFn,
    verifiedFallbackQuotaProject
  );
  const budgetsRes = await fetchBudgetsForBillingAccounts(
    accessToken,
    core.billingAccounts,
    core.usedQuotaProject ?? quotaProject,
    fetchFn
  );
  return {
    billingAccounts: core.billingAccounts,
    warnings: [...core.warnings, ...budgetsRes.warnings],
    usedQuotaProject: core.usedQuotaProject,
  };
}

async function gcpPutJson<T>(
  url: string,
  accessToken: string,
  body: Record<string, unknown>,
  quotaProject?: string | null,
  fetchFn: FetchLike = globalThis.fetch
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (quotaProject) {
    headers["x-goog-user-project"] = quotaProject;
  }

  const res = await fetchFn(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const errBody = (await res.json()) as { error?: { message?: string } };
      if (errBody?.error?.message) {
        detail = `${detail}: ${errBody.error.message}`;
      }
    } catch {
      // Ignore non-JSON error body
    }
    throw new GcpHttpError(res.status, sanitizeErrorMessage(detail));
  }

  return (await res.json()) as T;
}

export async function updateProjectBillingInfo(
  accessToken: string,
  projectId: string,
  billingAccountId: string,
  quotaProject?: string | null,
  fetchFn: FetchLike = globalThis.fetch,
  verifiedFallbackQuotaProject?: string | null
): Promise<{
  projectId: string;
  billingAccountId: string;
  billingEnabled: boolean;
  usedQuotaProject: string | null;
}> {
  const validProjectId = validateProjectId(projectId);
  const validBillingAccountId = validateBillingAccountId(billingAccountId);
  const resourceName = `billingAccounts/${validBillingAccountId}`;
  const url = `https://cloudbilling.googleapis.com/v1/projects/${encodeURIComponent(validProjectId)}/billingInfo`;

  const candidates: Array<string | null> = [];
  const pushUnique = (id: string | null | undefined) => {
    if (id === undefined) return;
    if (!candidates.includes(id)) candidates.push(id);
  };
  pushUnique(quotaProject || null);
  if (verifiedFallbackQuotaProject) {
    pushUnique(verifiedFallbackQuotaProject);
  }
  pushUnique(validProjectId);
  pushUnique(null);

  let preferredErr: unknown = null;
  for (const candidate of candidates) {
    try {
      const info = await gcpPutJson<{
        projectId?: string;
        billingAccountName?: string;
        billingEnabled?: boolean;
      }>(url, accessToken, { billingAccountName: resourceName }, candidate, fetchFn);

      const resolvedId = info.billingAccountName
        ? validateBillingAccountId(info.billingAccountName)
        : validBillingAccountId;
      return {
        projectId: info.projectId || validProjectId,
        billingAccountId: resolvedId,
        billingEnabled: Boolean(info.billingEnabled),
        usedQuotaProject: candidate,
      };
    } catch (err) {
      if (!preferredErr) {
        preferredErr = err;
      }
      const msg = err instanceof Error ? err.message : String(err);
      // Only retry alternate quota projects on quota/service-disabled errors;
      // fail fast on genuine IAM 403, invalid/closed billing account 400, or 404.
      if (!isQuotaOrApiDisabledMessage(msg)) {
        throw err;
      }
    }
  }

  throw preferredErr ?? new Error("Unable to update project billing info.");
}

export async function fetchBillingAccountMetadata(
  accessToken: string,
  billingAccountId: string,
  quotaProject?: string | null,
  fetchFn: FetchLike = globalThis.fetch
): Promise<{
  id: string;
  resourceName: string;
  displayName: string;
  open: boolean;
  masterBillingAccount?: string;
  currencyCode?: string;
} | null> {
  try {
    const validId = validateBillingAccountId(billingAccountId);
    const url = `https://cloudbilling.googleapis.com/v1/billingAccounts/${encodeURIComponent(validId)}`;
    const acct = await gcpGetJson<{
      name?: string;
      displayName?: string;
      open?: boolean;
      masterBillingAccount?: string;
      currencyCode?: string;
    }>(url, accessToken, quotaProject, fetchFn);
    const normalizedId = acct.name ? validateBillingAccountId(acct.name) : validId;
    return {
      id: normalizedId,
      resourceName: `billingAccounts/${normalizedId}`,
      displayName: acct.displayName || normalizedId,
      open: Boolean(acct.open),
      masterBillingAccount: acct.masterBillingAccount || undefined,
      currencyCode: acct.currencyCode || undefined,
    };
  } catch {
    return null;
  }
}
