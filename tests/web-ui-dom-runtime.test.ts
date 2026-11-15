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

    let simulateBillingApiDisabled = false;
    let simulatedAuthMode: "normal" | "no_cli" | "no_login" = "normal";
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
        getElementById: (id: string) => {
          if (id === "app") return appRoot;
          if (id === "toast-root") return toastRoot;
          let found: MockElement | null = null;
          const search = (node: MockNode) => {
            if (found) return;
            if (node instanceof MockElement && node.id === id) {
              found = node;
              return;
            }
            for (const c of node.childNodes) search(c);
          };
          search(appRoot);
          return found;
        },
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
        if (url.includes("/api/enable-service")) {
          simulateBillingApiDisabled = false;
          const overview = await service.getOverview();
          return new Response(JSON.stringify({ overview }), { status: 200 });
        }
        if (url.includes("/api/auth-login")) {
          simulatedAuthMode = "normal";
          const overview = await service.getOverview();
          return new Response(JSON.stringify({ overview }), { status: 200 });
        }
        if (url.includes("/api/overview")) {
          const overview = await service.getOverview();
          if (simulatedAuthMode === "no_cli") {
            return new Response(
              JSON.stringify({
                ...overview,
                preferences: { ...overview.preferences, demoMode: false },
                auth: {
                  authenticated: false,
                  source: "none",
                  gcloudInstalled: false,
                  gcloudBinaryPath: null,
                  activeAccount: null,
                  maskedActiveAccount: null,
                  activeProject: null,
                  accounts: [],
                  setupHint: "Install Google Cloud SDK (`gcloud`) and run `gcloud auth login`.",
                },
              }),
              { status: 200 }
            );
          }
          if (simulatedAuthMode === "no_login") {
            return new Response(
              JSON.stringify({
                ...overview,
                preferences: { ...overview.preferences, demoMode: false },
                auth: {
                  authenticated: false,
                  source: "none",
                  gcloudInstalled: true,
                  gcloudBinaryPath: "/opt/homebrew/bin/gcloud",
                  activeAccount: null,
                  maskedActiveAccount: null,
                  activeProject: null,
                  accounts: [],
                  setupHint: "Run `gcloud auth login` in your terminal, then click Refresh.",
                },
              }),
              { status: 200 }
            );
          }
          if (simulateBillingApiDisabled) {
            return new Response(
              JSON.stringify({
                ...overview,
                billingAccounts: [],
                summary: { ...overview.summary, totalBillingAccounts: 0, openBillingAccounts: 0 },
                warnings: [
                  "Cloud Billing Accounts list warning: HTTP 403: Cloud Billing API has not been used in project acme-ai-assistant-prod before or it is disabled.",
                ],
              }),
              { status: 200 }
            );
          }
          return new Response(JSON.stringify(overview), { status: 200 });
        }
        if (url.includes("/api/preferences")) {
          const overview = await service.getOverview();
          return new Response(JSON.stringify({ overview }), { status: 200 });
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

      // 2. Switch to Projects Tab: verify compact default (only Active/Pinned shown, not all projects)
      const projectsTabBtn = appRoot.findButtonsByText("Projects")[0];
      assert.ok(projectsTabBtn);
      projectsTabBtn.click();
      assert.ok(appRoot.allText.includes("Acme AI Assistant (Prod)"));
      assert.ok(
        !appRoot.allText.includes("Legacy Hackathon Prototype"),
        "Expected unpinned projects to stay hidden by default so panel stays compact"
      );

      // Typing in search box searches across ALL projects immediately without needing to switch filter chips
      const searchInputs = (appRoot.querySelectorAll("input") as MockInputElement[]).filter(
        (inp) => inp.type === "search"
      );
      assert.equal(searchInputs.length, 1);
      searchInputs[0].value = "legacy";
      for (const fn of searchInputs[0].listeners.input ?? []) {
        fn({ target: searchInputs[0] });
      }
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

      // 4. Simulate Cloud Billing API disabled -> verify "Enable Cloud Billing API" setup card & 1-click enablement
      simulateBillingApiDisabled = true;
      const refreshBtn = appRoot.findButtonsByText("Refresh")[0];
      assert.ok(refreshBtn);
      refreshBtn.click();
      for (let i = 0; i < 40 && !appRoot.allText.includes("Enable Cloud Billing API"); i++) {
        await new Promise((r) => setTimeout(r, 15));
      }
      assert.ok(appRoot.allText.includes("ACTION NEEDED"));
      assert.ok(appRoot.allText.includes("Enable Cloud Billing API"));
      assert.ok(!appRoot.allText.includes("No Cloud Billing accounts visible"));

      // Verify Console link uses `/apis/api/.../overview?project=<id>` so GCP Console never drops `project=` on redirect
      const anchors = appRoot.querySelectorAll("a") as MockAnchorElement[];
      const enableConsoleLink = anchors.find((a) =>
        a.href.includes("cloudbilling.googleapis.com")
      );
      assert.ok(enableConsoleLink, "Expected Console enablement link");
      assert.equal(
        enableConsoleLink.href,
        "https://console.cloud.google.com/apis/api/cloudbilling.googleapis.com/overview?project=acme-ai-assistant-prod"
      );

      const enableBtn = appRoot.findButtonsByText("Enable Cloud Billing API on")[0];
      assert.ok(enableBtn, "Expected 1-click Enable Cloud Billing API button");
      enableBtn.click();
      for (let i = 0; i < 40 && !appRoot.allText.includes("Acme Cloud Production Billing"); i++) {
        await new Promise((r) => setTimeout(r, 15));
      }
      assert.ok(appRoot.allText.includes("Acme Cloud Production Billing"));

      // 5. Simulate missing `gcloud` CLI -> verify installation prompt & official install link
      simulatedAuthMode = "no_cli";
      appRoot.findButtonsByText("Refresh")[0].click();
      for (let i = 0; i < 40 && !appRoot.allText.includes("Install Google Cloud CLI"); i++) {
        await new Promise((r) => setTimeout(r, 15));
      }
      assert.ok(appRoot.allText.includes("STEP 1 OF 2 · CLI REQUIRED"));
      assert.ok(appRoot.allText.includes("Install Google Cloud CLI (gcloud)"));
      assert.ok(appRoot.allText.includes("brew install --cask gcloud-cli"));
      const installLinks = appRoot.querySelectorAll("a") as MockAnchorElement[];
      assert.ok(
        installLinks.some((a) => a.href === "https://cloud.google.com/sdk/docs/install"),
        "Expected official Google Cloud SDK install link"
      );

      // 6. Simulate `gcloud` installed but NOT signed in -> verify browser sign-in guide & 1-click login
      simulatedAuthMode = "no_login";
      appRoot.findButtonsByText("Re-check gcloud Installation")[0].click();
      for (
        let i = 0;
        i < 40 && !appRoot.allText.includes("Sign in to Your Google Cloud Account");
        i++
      ) {
        await new Promise((r) => setTimeout(r, 15));
      }
      assert.ok(appRoot.allText.includes("STEP 2 OF 2 · SIGN IN REQUIRED"));
      assert.ok(appRoot.allText.includes("Google Cloud CLI Detected"));
      assert.ok(appRoot.allText.includes("/opt/homebrew/bin/gcloud"));

      const browserLoginBtn = appRoot.findButtonsByText("Sign in with Browser")[0];
      assert.ok(browserLoginBtn, "Expected interactive browser sign-in button");
      browserLoginBtn.click();
      for (let i = 0; i < 40 && !appRoot.allText.includes("Acme Cloud Production Billing"); i++) {
        await new Promise((r) => setTimeout(r, 15));
      }
      assert.ok(appRoot.allText.includes("Acme Cloud Production Billing"));

      // 7. Live Language Switching across Japanese, Korean, Simplified Chinese, Traditional Chinese, and English
      const switchHeaderLocale = async (localeValue: string) => {
        const selects = appRoot.querySelectorAll("select") as MockSelectElement[];
        const langSelect = selects.find((s) =>
          s.childNodes.some((opt) => opt instanceof MockOptionElement && opt.value === "zh-TW")
        );
        assert.ok(langSelect, "Expected header language switcher <select>");
        langSelect.value = localeValue;
        service.updateSettings({ locale: localeValue as "en" | "ja" | "ko" | "zh-CN" | "zh-TW" });
        await Promise.all(
          (langSelect.listeners.change ?? []).map((fn) => Promise.resolve(fn({ target: langSelect })))
        );
      };

      await switchHeaderLocale("ja");
      assert.ok(appRoot.allText.includes("概要"), "Expected Japanese Overview tab");
      assert.ok(appRoot.allText.includes("請求"), "Expected Japanese Billing tab");

      await switchHeaderLocale("ko");
      assert.ok(appRoot.allText.includes("개요"), "Expected Korean Overview tab");
      assert.ok(appRoot.allText.includes("결제"), "Expected Korean Billing tab");

      await switchHeaderLocale("zh-CN");
      assert.ok(appRoot.allText.includes("概览"), "Expected Simplified Chinese Overview tab");
      assert.ok(appRoot.allText.includes("结算"), "Expected Simplified Chinese Billing tab");

      await switchHeaderLocale("zh-TW");
      assert.ok(appRoot.allText.includes("總覽"), "Expected Traditional Chinese Overview tab");
      assert.ok(appRoot.allText.includes("帳單"), "Expected Traditional Chinese Billing tab");

      await switchHeaderLocale("en");
      assert.ok(appRoot.allText.includes("Overview"), "Expected English Overview tab");
      assert.ok(appRoot.allText.includes("Billing"), "Expected English Billing tab");
    } finally {
      Object.assign(globalThis, prevGlobals);
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
