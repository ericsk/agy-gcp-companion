import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { CompanionStore } from "../src/core/store.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("Compiled Stdio MCP Server (dist/mcp-server.mjs)", () => {
  let tmpDir: string;

  before(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "agy-mcp-test-"));
    const store = new CompanionStore(tmpDir);
    store.savePreferences({
      pinnedProjects: ["acme-ai-assistant-prod"],
      billingExportTables: {},
      cacheTtlMs: 6 * 3_600_000,
      maskEmails: true,
      gcloudPathOverride: null,
      quotaProjectOverride: null,
      demoMode: true,
    });
  });

  after(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("handles initialize, tools/list, resources/read, and tools/call over Stdio", async () => {
    const proc = spawn(process.execPath, [join(ROOT, "dist", "mcp-server.mjs")], {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        AGY_GCP_COMPANION_STORE_DIR: tmpDir,
      },
    });

    const responses = new Map<number, Record<string, unknown>>();
    let lineBuffer = "";

    proc.stdout.on("data", (chunk: Buffer) => {
      lineBuffer += chunk.toString("utf-8");
      let idx: number;
      while ((idx = lineBuffer.indexOf("\n")) !== -1) {
        const line = lineBuffer.slice(0, idx).trim();
        lineBuffer = lineBuffer.slice(idx + 1);
        if (line) {
          const parsed = JSON.parse(line) as { id?: number } & Record<string, unknown>;
          if (typeof parsed.id === "number") {
            responses.set(parsed.id, parsed);
          }
        }
      }
    });

    const sendRpc = (id: number, method: string, params?: Record<string, unknown>) => {
      proc.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
    };

    const waitForId = async (id: number): Promise<Record<string, unknown>> => {
      for (let i = 0; i < 100; i++) {
        const hit = responses.get(id);
        if (hit) return hit;
        await new Promise((r) => setTimeout(r, 20));
      }
      throw new Error(`Timed out waiting for MCP response id=${id}`);
    };

    try {
      sendRpc(1, "initialize", {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" },
      });
      const initRes = (await waitForId(1)) as {
        result: { protocolVersion: string; serverInfo: { name: string; version: string } };
      };
      assert.equal(initRes.result.protocolVersion, "2025-03-26");
      assert.equal(initRes.result.serverInfo.name, "agy-gcp-companion");
      assert.equal(initRes.result.serverInfo.version, "1.2.0");

      // Notification without id should not produce a response
      proc.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`);

      sendRpc(2, "tools/list");
      const listRes = (await waitForId(2)) as {
        result: { tools: Array<{ name: string; annotations?: { destructiveHint?: boolean } }> };
      };
      const toolNames = listRes.result.tools.map((t) => t.name);
      assert.ok(toolNames.includes("gcp_companion_status"));
      assert.ok(toolNames.includes("gcp_list_projects"));
      assert.ok(toolNames.includes("gcp_get_billing_summary"));
      assert.ok(toolNames.includes("gcp_get_project_cost_breakdown"));
      assert.ok(toolNames.includes("gcp_set_active_project"));
      assert.ok(toolNames.includes("gcp_set_project_billing_account"));
      const billingTool = listRes.result.tools.find((t) => t.name === "gcp_set_project_billing_account");
      assert.equal(billingTool?.annotations?.destructiveHint, true);

      sendRpc(3, "tools/call", {
        name: "gcp_get_billing_summary",
        arguments: {},
      });
      const summaryRes = (await waitForId(3)) as {
        result: { isError: boolean; content: Array<{ text: string }> };
      };
      assert.equal(summaryRes.result.isError, false);
      const summaryData = JSON.parse(summaryRes.result.content[0].text) as {
        configured: boolean;
        totalsByCurrency: Array<{ currency: string; currentMonthNetCost: number }>;
      };
      assert.equal(summaryData.configured, true);
      assert.ok(summaryData.totalsByCurrency[0].currentMonthNetCost > 0);

      sendRpc(4, "tools/call", {
        name: "gcp_get_project_cost_breakdown",
        arguments: { projectId: "acme-ai-assistant-prod" },
      });
      const breakdownRes = (await waitForId(4)) as {
        result: { isError: boolean; content: Array<{ text: string }> };
      };
      assert.equal(breakdownRes.result.isError, false);
      const breakdownData = JSON.parse(breakdownRes.result.content[0].text) as {
        spend: { topServices: Array<{ serviceName: string }> };
      };
      assert.equal(breakdownData.spend.topServices[0].serviceName, "Vertex AI");

      // Invalid project ID should return graceful tool error (isError: true) without crashing MCP process
      sendRpc(5, "tools/call", {
        name: "gcp_set_active_project",
        arguments: { projectId: "--malicious-flag" },
      });
      const errRes = (await waitForId(5)) as {
        result: { isError: boolean; content: Array<{ text: string }> };
      };
      assert.equal(errRes.result.isError, true);

      sendRpc(6, "resources/read", { uri: "gcp-companion://overview" });
      const resRead = (await waitForId(6)) as {
        result: { contents: Array<{ text: string }> };
      };
      const overviewResource = JSON.parse(resRead.result.contents[0].text) as {
        auth: { activeAccount: string };
      };
      // Verify PII masking is respected in MCP output too when maskEmails is enabled
      assert.ok(overviewResource.auth.activeAccount.includes("***"));

      // Two-step billing account switch: Step 1 (no confirm) returns read-only preview
      sendRpc(7, "tools/call", {
        name: "gcp_set_project_billing_account",
        arguments: {
          projectId: "legacy-hackathon-2025",
          billingAccountId: "01F4D9-22B801-55CA09",
        },
      });
      const previewRes = (await waitForId(7)) as {
        result: { isError: boolean; content: Array<{ text: string }> };
      };
      assert.equal(previewRes.result.isError, false);
      const previewData = JSON.parse(previewRes.result.content[0].text) as {
        status: string;
        currentBillingAccount: { id: string | null };
        targetBillingAccount: { id: string; displayName: string };
      };
      assert.equal(previewData.status, "confirmation_required");
      assert.equal(previewData.currentBillingAccount.id, null);
      assert.equal(previewData.targetBillingAccount.id, "01F4D9-22B801-55CA09");

      // Step 2: confirm: true applies the change and updates project list
      sendRpc(8, "tools/call", {
        name: "gcp_set_project_billing_account",
        arguments: {
          projectId: "legacy-hackathon-2025",
          billingAccountId: "01F4D9-22B801-55CA09",
          confirm: true,
        },
      });
      const applyRes = (await waitForId(8)) as {
        result: { isError: boolean; content: Array<{ text: string }> };
      };
      assert.equal(applyRes.result.isError, false);
      const applyData = JSON.parse(applyRes.result.content[0].text) as {
        applied: boolean;
        billingAccountId: string;
        billingEnabled: boolean;
        consoleBillingUrl: string;
      };
      assert.equal(applyData.applied, true);
      assert.equal(applyData.billingAccountId, "01F4D9-22B801-55CA09");
      assert.equal(applyData.billingEnabled, true);
      assert.ok(applyData.consoleBillingUrl.includes("01F4D9-22B801-55CA09"));

      // Step 3: Unlinking via empty string is blocked cleanly
      sendRpc(9, "tools/call", {
        name: "gcp_set_project_billing_account",
        arguments: {
          projectId: "legacy-hackathon-2025",
          billingAccountId: "",
          confirm: true,
        },
      });
      const unlinkErrRes = (await waitForId(9)) as {
        result: { isError: boolean; content: Array<{ text: string }> };
      };
      assert.equal(unlinkErrRes.result.isError, true);
    } finally {
      proc.stdin.end();
      proc.kill("SIGTERM");
    }
  });

  it("supports Content-Length framed JSON-RPC messages over Stdio", async () => {
    const proc = spawn(process.execPath, [join(ROOT, "dist", "mcp-server.mjs")], {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        AGY_GCP_COMPANION_STORE_DIR: tmpDir,
      },
    });

    try {
      const clPayload = JSON.stringify({ jsonrpc: "2.0", id: 77, method: "ping" });
      const clFrame = `Content-Length: ${Buffer.byteLength(clPayload, "utf-8")}\r\n\r\n${clPayload}`;
      let rawStdout = "";
      proc.stdout.on("data", (c: Buffer) => {
        rawStdout += c.toString("utf-8");
      });
      proc.stdin.write(clFrame);
      for (let i = 0; i < 60 && !rawStdout.includes('"id":77'); i++) {
        await new Promise((r) => setTimeout(r, 20));
      }
      assert.ok(rawStdout.startsWith("Content-Length:"));
      assert.ok(rawStdout.includes('"id":77'));
    } finally {
      proc.stdin.end();
      proc.kill("SIGTERM");
    }
  });
});
