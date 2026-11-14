import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { CompanionService } from "../src/core/companion-service.ts";
import { CompanionStore } from "../src/core/store.ts";

// Minimal DOM classes sufficient to execute dist/web/app.js, dom.js, charts.js, and api.js end-to-end
class MockNode {
  nodeType = 1;
  textContent = "";
  parentNode: MockNode | null = null;
  childNodes: MockNode[] = [];

  appendChild<T extends MockNode>(child: T): T {
    child.parentNode = this;
    this.childNodes.push(child);
    return child;
  }

  replaceChildren(...nodes: MockNode[]): void {
    for (const c of this.childNodes) c.parentNode = null;
    this.childNodes = [];
    for (const n of nodes) this.appendChild(n);
  }

  remove(): void {
    if (!this.parentNode) return;
    this.parentNode.childNodes = this.parentNode.childNodes.filter((n) => n !== this);
    this.parentNode = null;
  }

  get allText(): string {
    if (this.nodeType === 3) return this.textContent;
    return this.childNodes.map((c) => c.allText).join(" ");
  }
}

class MockTextNode extends MockNode {
  constructor(text: string) {
    super();
    this.nodeType = 3;
    this.textContent = text;
  }
}

class MockElement extends MockNode {
  readonly tagName: string;
  className = "";
  id = "";
  title = "";
  tabIndex = 0;
  dataset: Record<string, string> = {};
  attributes: Record<string, string> = {};
  listeners: Record<string, Array<(ev: unknown) => void>> = {};

  constructor(tagName: string) {
    super();
    this.tagName = tagName.toUpperCase();
  }

  setAttribute(k: string, v: string): void {
    this.attributes[k] = v;
    if (k === "id") this.id = v;
    if (k === "class") this.className = v;
  }

  getAttribute(k: string): string | null {
    return this.attributes[k] ?? null;
  }

  addEventListener(type: string, fn: (ev: unknown) => void): void {
    this.listeners[type] = this.listeners[type] ?? [];
    this.listeners[type].push(fn);
  }

  click(): void {
    for (const fn of this.listeners.click ?? []) {
      fn({ stopPropagation: () => {}, preventDefault: () => {}, target: this });
    }
  }

  querySelectorAll(selector: string): MockElement[] {
    const out: MockElement[] = [];
    const visit = (node: MockNode) => {
      if (node instanceof MockElement) {
        if (selector === "img.brand-logo") {
          if (node.tagName === "IMG" && node.className.split(/\s+/).includes("brand-logo")) {
            out.push(node);
          }
        } else if (node.tagName.toLowerCase() === selector.toLowerCase()) {
          out.push(node);
        }
      }
      for (const c of node.childNodes) visit(c);
    };
    visit(this);
    return out;
  }

  findButtonsByText(substring: string): MockElement[] {
    const out: MockElement[] = [];
    const visit = (node: MockNode) => {
      if (node instanceof MockElement && node.tagName === "BUTTON" && node.allText.includes(substring)) {
        out.push(node);
      }
      for (const c of node.childNodes) visit(c);
    };
    visit(this);
    return out;
  }
}

class MockAnchorElement extends MockElement {
  href = "";
  target = "";
  rel = "";
}
class MockInputElement extends MockElement {
  type = "text";
  value = "";
  placeholder = "";
  disabled = false;
  checked = false;
}
class MockButtonElement extends MockElement {
  type = "button";
  disabled = false;
}
class MockSelectElement extends MockElement {
  value = "";
  disabled = false;
}
class MockOptionElement extends MockElement {
  value = "";
  selected = false;
}
class MockImageElement extends MockElement {
  src = "";
  alt = "";
  width = 0;
  height = 0;
}

describe("Browser UI Runtime Execution (dist/web/app.js)", () => {
  it("renders Overview, Projects, and Billing tabs and handles interactive clicks cleanly", async () => {
    const tmpDir = mkdtempSync(join(tmpdir(), "agy-web-dom-test-"));
    const store = new CompanionStore(tmpDir);
    store.savePreferences({
      pinnedProjects: ["acme-ai-assistant-prod"],
      billingExportTables: {},
      cacheTtlMs: 6 * 3_600_000,
      maskEmails: false,
      gcloudPathOverride: null,
      quotaProjectOverride: null,
      demoMode: true,
    });
    const service = new CompanionService({ store });

    const appRoot = new MockElement("div");
    appRoot.id = "app";
    const toastRoot = new MockElement("div");
    toastRoot.id = "toast-root";

    const createEl = (tag: string): MockElement => {
      const lower = tag.toLowerCase();
      if (lower === "a") return new MockAnchorElement("a");
      if (lower === "input") return new MockInputElement("input");
      if (lower === "button") return new MockButtonElement("button");
      if (lower === "select") return new MockSelectElement("select");
      if (lower === "option") return new MockOptionElement("option");
      if (lower === "img") return new MockImageElement("img");
      return new MockElement(lower);
    };

    const prevGlobals = {
      document: (globalThis as Record<string, unknown>).document,
      window: (globalThis as Record<string, unknown>).window,
      Node: (globalThis as Record<string, unknown>).Node,
      HTMLAnchorElement: (globalThis as Record<string, unknown>).HTMLAnchorElement,
      HTMLInputElement: (globalThis as Record<string, unknown>).HTMLInputElement,
      HTMLButtonElement: (globalThis as Record<string, unknown>).HTMLButtonElement,
      HTMLSelectElement: (globalThis as Record<string, unknown>).HTMLSelectElement,
      HTMLOptionElement: (globalThis as Record<string, unknown>).HTMLOptionElement,
      HTMLImageElement: (globalThis as Record<string, unknown>).HTMLImageElement,
      fetch: globalThis.fetch,
    };

    Object.assign(globalThis, {
      Node: MockNode,
      HTMLAnchorElement: MockAnchorElement,
      HTMLInputElement: MockInputElement,
      HTMLButtonElement: MockButtonElement,
      HTMLSelectElement: MockSelectElement,
      HTMLOptionElement: MockOptionElement,
      HTMLImageElement: MockImageElement,
      window: {
        setTimeout: (fn: () => void) => setTimeout(fn, 5),
      },
      document: {
        getElementById: (id: string) =>
          id === "app" ? appRoot : id === "toast-root" ? toastRoot : null,
        createElement: (tag: string) => createEl(tag),
        createElementNS: (_ns: string, tag: string) => new MockElement(tag),
        createTextNode: (txt: string) => new MockTextNode(txt),
      },
      fetch: async (input: string | URL | Request) => {
        const url = String(input);
        if (url.includes("/api/session")) {
          return new Response(
            JSON.stringify({
              csrfToken: "t1",
              proxyCsrfToken: "t2",
              expiresInMs: 1800000,
            }),
            { status: 200 }
          );
        }
        if (url.includes("/api/overview")) {
          const overview = await service.getOverview();
          return new Response(JSON.stringify(overview), { status: 200 });
        }
        return new Response("{}", { status: 200 });
      },
    });

    try {
      await import("../dist/web/app.js");
      // Wait for initial async loadData(false) to settle
      for (let i = 0; i < 40 && !appRoot.allText.includes("Month-to-Date Net Spend"); i++) {
        await new Promise((r) => setTimeout(r, 15));
      }

      // 1. Verify Overview Tab rendered Spend Hero, Sparkline SVG, and Pinned Projects
      assert.ok(appRoot.allText.includes("GCP Companion"));
      assert.ok(appRoot.allText.includes("Month-to-Date Net Spend"));
      assert.ok(appRoot.allText.includes("Acme AI Assistant (Prod)"));
      assert.ok(appRoot.querySelectorAll("svg").length >= 1);

      // Switch Overview Breakdown to "By Service"
      const byServiceBtn = appRoot.findButtonsByText("By Service")[0];
      assert.ok(byServiceBtn, "Expected 'By Service' breakdown button");
      byServiceBtn.click();
      assert.ok(appRoot.allText.includes("Vertex AI"));

      // 2. Switch to Projects Tab and expand a project drawer
      const projectsTabBtn = appRoot.findButtonsByText("Projects")[0];
      assert.ok(projectsTabBtn);
      projectsTabBtn.click();
      assert.ok(appRoot.allText.includes("Legacy Hackathon Prototype"));

      const detailsBtn = appRoot.findButtonsByText("Details")[0];
      assert.ok(detailsBtn);
      detailsBtn.click();
      assert.ok(appRoot.allText.includes("Dashboard ↗"));
      assert.ok(appRoot.allText.includes("Cloud Run ↗"));

      // 3. Switch to Billing Tab and verify Billing Accounts, Budgets, and BigQuery Export wizard
      const billingTabBtn = appRoot.findButtonsByText("Billing")[0];
      assert.ok(billingTabBtn);
      billingTabBtn.click();
      assert.ok(appRoot.allText.includes("Acme Cloud Production Billing"));
      assert.ok(appRoot.allText.includes("Monthly Prod Spend Alert"));
      assert.ok(appRoot.allText.includes("BigQuery Billing Export Connection"));
    } finally {
      Object.assign(globalThis, prevGlobals);
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
