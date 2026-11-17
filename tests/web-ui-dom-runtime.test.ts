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
    let gateInitialBoot = true;
    let releaseBootGate!: () => void;
    let releaseProjectsGate!: () => void;
    let releaseBillingGate!: () => void;
    let releaseSpendGate!: () => void;
    const bootGate = new Promise<void>((r) => {
      releaseBootGate = r;
    });
    const projectsGate = new Promise<void>((r) => {
      releaseProjectsGate = r;
    });
    const billingGate = new Promise<void>((r) => {
      releaseBillingGate = r;
    });
    const spendGate = new Promise<void>((r) => {
      releaseSpendGate = r;
    });

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
        if (url.includes("/api/bootstrap")) {
          if (gateInitialBoot) await bootGate;
          const boot = await service.getBootstrap();
          if (simulatedAuthMode === "no_cli") {
            return new Response(
              JSON.stringify({
                ...boot,
                csrfToken: "t1",
                proxyCsrfToken: "t2",
                expiresInMs: 1800000,
                preferences: { ...boot.preferences, demoMode: false },
                spendConfigured: false,
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
                ...boot,
                csrfToken: "t1",
                proxyCsrfToken: "t2",
                expiresInMs: 1800000,
                preferences: { ...boot.preferences, demoMode: false },
                spendConfigured: false,
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
          return new Response(
            JSON.stringify({
              ...boot,
              csrfToken: "t1",
              proxyCsrfToken: "t2",
              expiresInMs: 1800000,
              spendConfigured: simulateBillingApiDisabled ? false : boot.spendConfigured,
              preferences: simulateBillingApiDisabled
                ? { ...boot.preferences, demoMode: false }
                : boot.preferences,
            }),
            { status: 200 }
          );
        }
        if (url.includes("/api/projects")) {
          if (gateInitialBoot) await projectsGate;
          if (simulatedAuthMode !== "normal") {
            return new Response(
              JSON.stringify({ authenticated: false, projects: [], warnings: [] }),
              { status: 200 }
            );
          }
          const projData = await service.getProjectsSection();
          return new Response(JSON.stringify(projData), { status: 200 });
        }
        if (url.includes("/api/billing") && !url.includes("/api/billing-export")) {
          if (gateInitialBoot) await billingGate;
          if (simulatedAuthMode !== "normal") {
            return new Response(
              JSON.stringify({
                authenticated: false,
                billingAccounts: [],
                projectBillingLinks: {},
                budgetsLoaded: true,
                warnings: [],
              }),
              { status: 200 }
            );
          }
          if (simulateBillingApiDisabled) {
            const billData = await service.getBillingSection();
            return new Response(
              JSON.stringify({
                ...billData,
                billingAccounts: [],
                projectBillingLinks: {},
                budgetsLoaded: true,
                warnings: [
                  "Cloud Billing Accounts list warning: HTTP 403: Cloud Billing API has not been used in project acme-ai-assistant-prod before or it is disabled.",
                ],
              }),
              { status: 200 }
            );
          }
          const billData = await service.getBillingSection();
          return new Response(JSON.stringify(billData), { status: 200 });
        }
        if (url.includes("/api/budgets")) {
          const budData = await service.getBudgetsSection();
          return new Response(JSON.stringify(budData), { status: 200 });
        }
        if (url.includes("/api/spend")) {
          if (gateInitialBoot) await spendGate;
          if (simulatedAuthMode !== "normal" || simulateBillingApiDisabled) {
            const overview = await service.getOverview();
            return new Response(
              JSON.stringify({
                authenticated: simulatedAuthMode === "normal",
                spend: { ...overview.spend, configured: false, totalsByCurrency: [], byProject: {}, byBillingAccount: {} },
                cache: overview.cache,
                warnings: [],
              }),
              { status: 200 }
            );
          }
          const spendData = await service.getSpendSection();
          return new Response(JSON.stringify(spendData), { status: 200 });
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
          return new Response(JSON.stringify(overview), { status: 200 });
        }
        if (url.includes("/api/plugin-update/check")) {
          const overview = await service.getOverview();
          return new Response(
            JSON.stringify({
              overview: {
                ...overview,
                pluginUpdate: {
                  currentVersion: "1.1.0",
                  latestVersion: "1.2.0",
                  updateAvailable: true,
                  updatedToVersion: null,
                  restartRequired: false,
                  autoUpdate: true,
                  lastCheckedAt: new Date().toISOString(),
                  releaseUrl: "https://github.com/ericsk/agy-gcp-companion",
                  error: null,
                },
              },
            }),
            { status: 200 }
          );
        }
        if (url.includes("/api/plugin-update/apply")) {
          const overview = await service.getOverview();
          return new Response(
            JSON.stringify({
              overview: {
                ...overview,
                pluginUpdate: {
                  currentVersion: "1.1.0",
                  latestVersion: "1.2.0",
                  updateAvailable: false,
                  updatedToVersion: "1.2.0",
                  restartRequired: true,
                  autoUpdate: true,
                  lastCheckedAt: new Date().toISOString(),
                  releaseUrl: "https://github.com/ericsk/agy-gcp-companion",
                  error: null,
                },
              },
            }),
            { status: 200 }
          );
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

      // 0a. Shell-first check: BEFORE any API response resolves, Header + Tabs + Settings button are already rendered!
      assert.ok(appRoot.allText.includes("GCP Companion"), "Expected Header title before data arrives");
      assert.ok(appRoot.findButtonsByText("Overview").length >= 1, "Expected Overview tab immediately");
      assert.ok(appRoot.findButtonsByText("Projects").length >= 1, "Expected Projects tab immediately");
      assert.ok(appRoot.findButtonsByText("Billing").length >= 1, "Expected Billing tab immediately");
      assert.ok(appRoot.findButtonsByText("⚙").length >= 1, "Expected Settings button immediately");

      // 0b. Bootstrap resolves -> Account & Active Project populate while Projects/Billing/Spend are still loading
      releaseBootGate();
      await new Promise((r) => setTimeout(r, 15));
      assert.ok(appRoot.allText.includes("acme-ai-assistant-prod"), "Expected Active Project from bootstrap");
      assert.ok(appRoot.allText.includes("Querying BigQuery spend"), "Expected independent BigQuery loading hint");
      assert.ok(appRoot.allText.includes("Loading projects"), "Expected independent Projects loading hint");

      // 0c. Projects resolves BEFORE Billing and BEFORE Spend -> Projects render immediately without waiting!
      releaseProjectsGate();
      await new Promise((r) => setTimeout(r, 15));
      assert.ok(
        appRoot.allText.includes("Acme AI Assistant (Prod)"),
        "Expected Pinned/Active projects to render before Billing & Spend finish"
      );
      assert.ok(
        appRoot.allText.includes("Checking billing"),
        "Expected neutral billing status check instead of false 'Unbilled' flash while Billing API is still loading"
      );

      // 0d. Billing resolves BEFORE Spend -> Billing account names enrich projects while Spend is still querying!
      releaseBillingGate();
      await new Promise((r) => setTimeout(r, 15));
      assert.ok(
        appRoot.allText.includes("Acme Cloud Production Billing"),
        "Expected Billing Account name on project before BigQuery Spend finishes"
      );

      // 0e. Spend resolves last -> Hero Spend & Sparkline hydrate smoothly
      gateInitialBoot = false;
      releaseSpendGate();
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

      // Switch between multi-month billing pills on Overview
      const monthPills = (appRoot.querySelectorAll("button") as MockButtonElement[]).filter((b) =>
        b.className.includes("month-pill")
      );
      assert.ok(monthPills.length >= 3, `Expected >= 3 demo month pills, got ${monthPills.length}`);
      assert.ok(monthPills[0].className.includes("month-pill-active"));
      assert.ok(!monthPills[0].allText.includes("✓"), "Expected current month pill not to be marked settled");
      assert.ok(monthPills[1].allText.includes("✓"), "Expected 28-day demo historical month pill to show settled ✓");
      assert.ok(monthPills[1].allText.includes("$"), "Expected compact currency preview inside month pill");
      monthPills[1].click();
      assert.ok(appRoot.allText.includes("Monthly Net Spend"), "Expected Monthly Net Spend heading when viewing historical month");
      assert.ok(appRoot.allText.includes("Archived"), "Expected settled archive badge when viewing settled historical month");
      const refreshedPills = (appRoot.querySelectorAll("button") as MockButtonElement[]).filter((b) =>
        b.className.includes("month-pill")
      );
      assert.ok(refreshedPills[1].className.includes("month-pill-active"));
      refreshedPills[0].click();
      assert.ok(appRoot.allText.includes("Month-to-Date Net Spend"), "Expected return to Month-to-Date Net Spend");

      // 2. Switch to Projects Tab: verify ONLY the 3 filter chips (All, Unbilled, Active & Pinned) are rendered (no Billing Account chip spam)
      const projectsTabBtn = appRoot.findButtonsByText("Projects")[0];
      assert.ok(projectsTabBtn);
      projectsTabBtn.click();
      const chipButtons = (appRoot.querySelectorAll("button") as MockButtonElement[]).filter((b) =>
        b.className.includes("filter-chip")
      );
      assert.equal(chipButtons.length, 3, "Expected strictly 3 filter chips (All, Unbilled, Active & Pinned)");
      assert.ok(appRoot.allText.includes("Legacy Hackathon Prototype"));

      // Clicking "Active & Pinned ★" filters down to active/pinned projects, while typing in search searches across all
      const focusChipBtn = appRoot.findButtonsByText("Active & Pinned")[0];
      assert.ok(focusChipBtn);
      focusChipBtn.click();
      assert.ok(!appRoot.allText.includes("Legacy Hackathon Prototype"));

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

      // 7. Open top-right Settings Menu (⚙ Settings) and switch languages via dropdown (<select>) across es, fr, ja, ko, zh-CN, zh-TW, and en
      const settingsBtn = appRoot.findButtonsByText("⚙")[0];
      assert.ok(settingsBtn, "Expected top-right ⚙ Settings button in header");
      settingsBtn.click();
      assert.ok(appRoot.allText.includes("Display Language"), "Expected Settings menu dialog to open");

      const switchSettingsLanguageDropdown = async (
        code: "en" | "es" | "fr" | "ja" | "ko" | "zh-CN" | "zh-TW"
      ) => {
        const selects = appRoot.querySelectorAll("select") as MockSelectElement[];
        const langSelect = selects.find((s) =>
          s.childNodes.some((opt) => opt instanceof MockOptionElement && opt.value === "es")
        );
        assert.ok(langSelect, "Expected Display Language <select> dropdown in Settings menu");
        langSelect.value = code;
        service.updateSettings({ locale: code });
        await Promise.all(
          (langSelect.listeners.change ?? []).map((fn) =>
            Promise.resolve(fn({ target: langSelect }))
          )
        );
      };

      await switchSettingsLanguageDropdown("es");
      assert.ok(appRoot.allText.includes("Resumen"), "Expected Spanish Overview tab");
      assert.ok(appRoot.allText.includes("Facturación"), "Expected Spanish Billing tab");

      await switchSettingsLanguageDropdown("fr");
      assert.ok(appRoot.allText.includes("Aperçu"), "Expected French Overview tab");
      assert.ok(appRoot.allText.includes("Facturation"), "Expected French Billing tab");

      await switchSettingsLanguageDropdown("ja");
      assert.ok(appRoot.allText.includes("概要"), "Expected Japanese Overview tab");
      assert.ok(appRoot.allText.includes("請求"), "Expected Japanese Billing tab");

      await switchSettingsLanguageDropdown("ko");
      assert.ok(appRoot.allText.includes("개요"), "Expected Korean Overview tab");
      assert.ok(appRoot.allText.includes("결제"), "Expected Korean Billing tab");

      await switchSettingsLanguageDropdown("zh-CN");
      assert.ok(appRoot.allText.includes("概览"), "Expected Simplified Chinese Overview tab");
      assert.ok(appRoot.allText.includes("结算"), "Expected Simplified Chinese Billing tab");

      await switchSettingsLanguageDropdown("zh-TW");
      assert.ok(appRoot.allText.includes("總覽"), "Expected Traditional Chinese Overview tab");
      assert.ok(appRoot.allText.includes("帳單"), "Expected Traditional Chinese Billing tab");

      await switchSettingsLanguageDropdown("en");
      assert.ok(appRoot.allText.includes("Overview"), "Expected English Overview tab");
      assert.ok(appRoot.allText.includes("Billing"), "Expected English Billing tab");

      // 8. Check for Plugin Updates & 1-Click Update inside Settings Menu
      const checkUpdateBtn = appRoot.findButtonsByText("Check for Updates")[0];
      assert.ok(checkUpdateBtn, "Expected Check for Updates button in Settings menu");
      await Promise.all(
        (checkUpdateBtn.listeners.click ?? []).map((fn) =>
          Promise.resolve(fn({ stopPropagation: () => {}, preventDefault: () => {}, target: checkUpdateBtn }))
        )
      );
      assert.ok(appRoot.allText.includes("1.2.0"), "Expected v1.2.0 update availability to render");

      const installUpdateBtn = appRoot.findButtonsByText("Update to v1.2.0")[0];
      assert.ok(installUpdateBtn, "Expected 1-click Update to v1.2.0 button");
      await Promise.all(
        (installUpdateBtn.listeners.click ?? []).map((fn) =>
          Promise.resolve(fn({ stopPropagation: () => {}, preventDefault: () => {}, target: installUpdateBtn }))
        )
      );
      assert.ok(appRoot.allText.includes("✓ v1.2.0"), "Expected Updated header badge after install");

      const closeSettingsBtn = appRoot.findButtonsByText("✕")[0];
      assert.ok(closeSettingsBtn, "Expected close button in Settings menu");
      closeSettingsBtn.click();
    } finally {
      Object.assign(globalThis, prevGlobals);
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
