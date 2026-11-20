import { createHash } from "node:crypto";
import { basename, resolve, sep } from "node:path";

/**
 * Validates a Google Cloud Project ID.
 * Rejects leading dashes (preventing CLI flag injection) and shell/URL metacharacters.
 */
const PROJECT_ID_REGEX = /^[a-z0-9][a-z0-9.:-]{2,62}[a-z0-9]$/i;

/**
 * Validates an email/service-account identifier used by gcloud auth.
 */
const ACCOUNT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/;

/**
 * Validates a Cloud Billing Account ID (e.g. "01ABCD-234567-89EFGH" or "billingAccounts/01ABCD-234567-89EFGH").
 */
const BILLING_ACCOUNT_ID_REGEX = /^(?:billingAccounts\/)?([A-Z0-9]{6}-[A-Z0-9]{6}-[A-Z0-9]{6})$/i;

/**
 * Strictly validates a BigQuery table reference: project.dataset.table
 * Prevents SQL injection when quoting table names in FROM `project.dataset.table`.
 */
const BIGQUERY_TABLE_ID_REGEX =
  /^([a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127})\.([a-zA-Z0-9_]{1,128})\.([a-zA-Z0-9_]{1,256})$/;

export function validateProjectId(input: unknown): string {
  if (typeof input !== "string") {
    throw new Error("Invalid GCP Project ID: expected string.");
  }
  const trimmed = input.trim();
  if (trimmed.startsWith("-") || !PROJECT_ID_REGEX.test(trimmed)) {
    throw new Error("Invalid GCP Project ID format.");
  }
  return trimmed;
}

export function validateAccountEmail(input: unknown): string {
  if (typeof input !== "string") {
    throw new Error("Invalid account email: expected string.");
  }
  const trimmed = input.trim();
  if (trimmed.length > 254 || trimmed.startsWith("-") || !ACCOUNT_EMAIL_REGEX.test(trimmed)) {
    throw new Error("Invalid Google account email format.");
  }
  return trimmed;
}

export function normalizeBillingAccountId(input: unknown): string {
  if (typeof input !== "string") {
    throw new Error("Invalid Billing Account ID: expected string.");
  }
  const trimmed = input.trim();
  if (trimmed === "*") {
    return "*";
  }
  const match = BILLING_ACCOUNT_ID_REGEX.exec(trimmed);
  if (!match) {
    throw new Error("Invalid Billing Account ID format (expected XXXXXX-XXXXXX-XXXXXX).");
  }
  return match[1].toUpperCase();
}

/**
 * Strictly validates a concrete Cloud Billing Account ID for project billing linkage.
 * Explicitly rejects empty strings (unlinking/disabling billing) and "*" wildcards.
 */
export function validateBillingAccountId(input: unknown): string {
  if (typeof input !== "string") {
    throw new Error("Invalid Billing Account ID: expected string.");
  }
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error(
      "Billing Account ID is required. Unlinking or disabling billing is not supported."
    );
  }
  if (trimmed === "*") {
    throw new Error("Wildcard '*' is not a valid Billing Account ID for linking a project.");
  }
  const match = BILLING_ACCOUNT_ID_REGEX.exec(trimmed);
  if (!match) {
    throw new Error("Invalid Billing Account ID format (expected XXXXXX-XXXXXX-XXXXXX).");
  }
  return match[1].toUpperCase();
}

export interface ParsedBigQueryTable {
  fullTableId: string;
  projectId: string;
  datasetId: string;
  tableName: string;
}

export function validateBigQueryTableId(input: unknown): ParsedBigQueryTable {
  if (typeof input !== "string") {
    throw new Error("Invalid BigQuery table ID: expected string.");
  }
  // Allow users to paste `project:dataset.table` or backtick-wrapped `` `project.dataset.table` ``
  const cleaned = input.trim().replace(/^`+|`+$/g, "");
  // Convert legacy `project:dataset.table` colon separator only on the project/dataset boundary if needed
  const normalized = normalizeColonTableRef(cleaned);
  const match = BIGQUERY_TABLE_ID_REGEX.exec(normalized);
  if (!match) {
    throw new Error(
      "Invalid BigQuery table reference. Expected format: project_id.dataset_id.table_name"
    );
  }
  const [, projectId, datasetId, tableName] = match;
  if (projectId.startsWith("-")) {
    throw new Error("Invalid project ID in BigQuery table reference.");
  }
  return {
    fullTableId: `${projectId}.${datasetId}.${tableName}`,
    projectId,
    datasetId,
    tableName,
  };
}

function normalizeColonTableRef(ref: string): string {
  const lastDot = ref.lastIndexOf(".");
  if (lastDot <= 0) return ref;
  const prefix = ref.slice(0, lastDot);
  const table = ref.slice(lastDot + 1);
  const lastColon = prefix.lastIndexOf(":");
  if (lastColon > prefix.lastIndexOf(".")) {
    const proj = prefix.slice(0, lastColon);
    const dataset = prefix.slice(lastColon + 1);
    return `${proj}.${dataset}.${table}`;
  }
  return ref;
}

/**
 * Masks an email address for UI PII protection (e.g., "ericsk@example.com" -> "er***k@example.com").
 */
export function maskEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return "***";
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  let maskedLocal: string;
  if (local.length <= 2) {
    maskedLocal = `${local[0] ?? "*"}***`;
  } else if (local.length <= 4) {
    maskedLocal = `${local[0]}***${local[local.length - 1]}`;
  } else {
    maskedLocal = `${local.slice(0, 2)}***${local[local.length - 1]}`;
  }
  return `${maskedLocal}@${domain}`;
}

/**
 * Produces a deterministic, filesystem-safe cache filename key without exposing PII in filenames.
 */
export function hashAccountKey(account: string): string {
  return createHash("sha256").update(account.toLowerCase().trim()).digest("hex").slice(0, 24);
}

/**
 * Strictly confines file operations to `storeDir` using `path.basename` + boundary prefix verification.
 */
export function safeStoreFilePath(storeDir: string, filename: string): string {
  const resolvedBase = resolve(storeDir);
  const cleanName = basename(filename);
  if (!cleanName || cleanName === "." || cleanName === "..") {
    throw new Error("Unsafe store filename rejected.");
  }
  const resolvedTarget = resolve(resolvedBase, cleanName);
  if (!resolvedTarget.startsWith(resolvedBase + sep)) {
    throw new Error("Path traversal attempt blocked.");
  }
  return resolvedTarget;
}

/**
 * Strips sensitive tokens, credentials, or verbose internals from error messages before surfacing to clients.
 */
export function sanitizeErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? "Unknown error");
  return raw
    .replace(/ya29\.[A-Za-z0-9._-]+/g, "[REDACTED_TOKEN]")
    .replace(/1\/\/[A-Za-z0-9._-]+/g, "[REDACTED_REFRESH_TOKEN]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]")
    .replace(/"client_secret"\s*:\s*"[^"]*"/gi, '"client_secret":"[REDACTED]"')
    .replace(/"refresh_token"\s*:\s*"[^"]*"/gi, '"refresh_token":"[REDACTED]"')
    .slice(0, 600);
}
