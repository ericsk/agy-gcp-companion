import { normalizeBillingAccountId, sanitizeErrorMessage } from "./security.mjs";
                                                                  
                                             

                                
                    
                        
               
                         
                      
                                  
                                  
                          
 

                                    
             
                       
                      
                
                                
                        
                             
                        
 

export class GcpHttpError extends Error {
           status        ;
  constructor(status        , message        ) {
    super(message);
    this.status = status;
  }
}

async function gcpGetJson   (
  url        ,
  accessToken        ,
  quotaProject                ,
  fetchFn            = globalThis.fetch
)             {
  const doFetch = async (qp                ) => {
    const headers                         = {
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
      const body = (await res.json())                                    ;
      if (body?.error?.message) {
        detail = `${detail}: ${body.error.message}`;
      }
    } catch {
      // Ignore non-JSON error body
    }

    // If the quota project was deleted or lacks service enablement, retry once without x-goog-user-project
    if (
      quotaProject &&
      (res.status === 403 || res.status === 400) &&
      /has been deleted|USER_PROJECT_DENIED|has not been used in project|SERVICE_DISABLED/i.test(
        detail
      )
    ) {
      const retryRes = await doFetch(null);
      if (retryRes.ok) {
        return (await retryRes.json())     ;
      }
    }

    throw new GcpHttpError(res.status, sanitizeErrorMessage(detail));
  }

  return (await res.json())     ;
}

export async function runWithConcurrency      (
  items              ,
  limit        ,
  worker                                        
)               {
  const results      = new Array(items.length);
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
  accessToken        ,
  fetchFn            = globalThis.fetch
)                           {
  const projects                  = [];
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
    const data = await gcpGetJson  
                        
                           
                               
                      
                                
                            
                                        
         
                             
      (url, accessToken, null, fetchFn);

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

export async function fetchBillingAccountsAndProjectLinks(
  accessToken        ,
  projects                 ,
  quotaProject                ,
  fetchFn            = globalThis.fetch
)                                                                        {
  const warnings           = [];
  const rawAccounts                      = [];

  // Try without `x-goog-user-project` first (succeeds immediately for first-party gcloud CLI tokens
  // even when Cloud Billing API is not enabled on any user project). If using ADC (which requires a quota
  // project), automatically probe quotaProject + sample active projects to find one with Cloud Billing API enabled.
  const fallbackProjects = Array.from(
    new Set(
      [quotaProject, ...projects.slice(0, 10).map((p) => p.projectId)].filter(
        (id)               => Boolean(id)
      )
    )
  );
  let resolvedQuotaProj                            = undefined;

  const billingGetJson = async    (url        )             => {
    if (resolvedQuotaProj !== undefined) {
      return gcpGetJson   (url, accessToken, resolvedQuotaProj, fetchFn);
    }

    const candidates                       = [null, ...fallbackProjects];
    let preferredErr          = null;

    for (const candidate of candidates) {
      try {
        const res = await gcpGetJson   (url, accessToken, candidate, fetchFn);
        resolvedQuotaProj = candidate;
        return res;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Save the error from the user's active quotaProject as the most actionable diagnostic
        if (candidate === quotaProject || !preferredErr) {
          preferredErr = err;
        }
        // Only continue probing other quota projects on quota/API-disabled 403s
        const isQuotaOrDisabled =
          /requires a quota project|has not been used in project|SERVICE_DISABLED|has been deleted|USER_PROJECT_DENIED/i.test(
            msg
          );
        if (!isQuotaOrDisabled) {
          throw err;
        }
      }
    }
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
      const data = await billingGetJson  
                                 
                        
                               
                         
                                        
                                
           
                               
        (url);

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

  const projectById = new Map                       ();
  for (const p of projects) {
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
        const data = await billingGetJson  
                                      
                               
                                        
                                     
             
                                 
          (url);

        for (const info of data.projectBillingInfo ?? []) {
          if (!info.projectId) continue;
          const enabled = Boolean(info.billingEnabled);
          if (enabled) {
            acct.linkedProjectIds.push(info.projectId);
          }
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
  if (rawAccounts.length === 0 && projects.length > 0) {
    const discoveredAccountMap = new Map                           ();
    const sampleProjects = projects.slice(0, 25);
    await runWithConcurrency(sampleProjects, 5, async (proj) => {
      try {
        const url = `https://cloudbilling.googleapis.com/v1/projects/${encodeURIComponent(proj.projectId)}/billingInfo`;
        const info = await billingGetJson  
                                      
                                   
          (url);
        if (info.billingAccountName) {
          const id = normalizeBillingAccountId(info.billingAccountName);
          proj.billingAccountId = id;
          proj.billingEnabled = Boolean(info.billingEnabled);
          let acct = discoveredAccountMap.get(id);
          if (!acct) {
            acct = {
              id,
              resourceName: `billingAccounts/${id}`,
              displayName: `Billing Account (${id})`,
              open: Boolean(info.billingEnabled),
              linkedProjectIds: [],
              budgets: [],
            };
            discoveredAccountMap.set(id, acct);
          }
          if (proj.billingEnabled) {
            acct.linkedProjectIds.push(proj.projectId);
          }
        }
      } catch {
        // Ignore per-project permission denials
      }
    });
    rawAccounts.push(...discoveredAccountMap.values());
  }

  // Optional enrichment: Cloud Billing Budgets API
  if (rawAccounts.length > 0) {
    await runWithConcurrency(rawAccounts, 4, async (acct) => {
      try {
        const url = `https://billingbudgets.googleapis.com/v1/${acct.resourceName}/budgets?pageSize=50`;
        const data = await gcpGetJson  
                           
                          
                                 
                                                   
                      
                                                                                          
                                                         
              
                                                                                       
             
          (url, accessToken, resolvedQuotaProj ?? quotaProject, fetchFn);

        acct.budgets = (data.budgets ?? []).map((b)             => {
          const specified = b.amount?.specifiedAmount;
          const units = specified
            ? Number(specified.units || 0) + Number(specified.nanos || 0) / 1e9
            : null;
          const thresholds                        = (b.thresholdRules ?? []).map((r) => ({
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
      } catch (err) {
        // Budgets API requires a quota project or billing.budgets.list; silently skip 403/404 without breaking UX
        if (!(err instanceof GcpHttpError && (err.status === 403 || err.status === 404))) {
          warnings.push(
            `Budgets lookup skipped for ${acct.displayName}: ${sanitizeErrorMessage(err)}`
          );
        }
      }
    });
  }

  return { billingAccounts: rawAccounts, warnings };
}
