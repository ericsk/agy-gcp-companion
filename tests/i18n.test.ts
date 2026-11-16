import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { CompanionService } from "../src/core/companion-service.ts";
import { CompanionStore } from "../src/core/store.ts";
import type { LocaleCode } from "../src/core/types.ts";
import { formatMoney } from "../src/web/dom.ts";
import { EN_MESSAGES, type TranslationKey } from "../src/web/i18n/en.ts";
import {
  SUPPORTED_LOCALES,
  TRANSLATION_CATALOGS,
  detectBrowserLocale,
  getActiveLocale,
  matchLanguageTagToLocale,
  resolveLocale,
  setLocalePreference,
  t,
} from "../src/web/i18n/index.ts";

function extractPlaceholders(template: string): string[] {
  const matches = Array.from(template.matchAll(/\{(\w+)\}/g)).map((m) => m[1]);
  return Array.from(new Set(matches)).sort();
}

describe("Internationalization (i18n) Architecture & 7-Language Catalog Parity", () => {
  it("supports en, es, fr, ja, ko, zh-CN, and zh-TW with 100% key and placeholder parity", () => {
    const expectedCodes: LocaleCode[] = ["en", "es", "fr", "ja", "ko", "zh-CN", "zh-TW"];
    assert.deepEqual(
      SUPPORTED_LOCALES.map((l) => l.code),
      expectedCodes
    );

    const enKeys = Object.keys(EN_MESSAGES).sort() as TranslationKey[];
    assert.ok(enKeys.length >= 140, `Expected >= 140 UI translation keys, got ${enKeys.length}`);

    for (const code of expectedCodes) {
      const catalog = TRANSLATION_CATALOGS[code];
      assert.ok(catalog, `Missing catalog for ${code}`);
      const keys = Object.keys(catalog).sort();
      assert.deepEqual(keys, enKeys, `Key mismatch in ${code} catalog`);

      for (const key of enKeys) {
        const val = catalog[key];
        assert.equal(typeof val, "string");
        assert.ok(val.trim().length > 0, `Empty translation for '${key}' in '${code}'`);

        const enVars = extractPlaceholders(EN_MESSAGES[key]);
        const locVars = extractPlaceholders(val);
        assert.deepEqual(
          locVars,
          enVars,
          `Placeholder mismatch for '${key}' in '${code}': expected {${enVars.join(",")}}, got {${locVars.join(",")}}`
        );
      }
    }
  });

  it("maps browser BCP-47 language tags to the right supported locale with English fallback", () => {
    assert.equal(matchLanguageTagToLocale("zh-TW"), "zh-TW");
    assert.equal(matchLanguageTagToLocale("zh-HK"), "zh-TW");
    assert.equal(matchLanguageTagToLocale("zh-Hant-TW"), "zh-TW");
    assert.equal(matchLanguageTagToLocale("zh-CN"), "zh-CN");
    assert.equal(matchLanguageTagToLocale("zh-SG"), "zh-CN");
    assert.equal(matchLanguageTagToLocale("zh-Hans"), "zh-CN");
    assert.equal(matchLanguageTagToLocale("zh"), "zh-CN");
    assert.equal(matchLanguageTagToLocale("ja-JP"), "ja");
    assert.equal(matchLanguageTagToLocale("ko-KR"), "ko");
    assert.equal(matchLanguageTagToLocale("es-MX"), "es");
    assert.equal(matchLanguageTagToLocale("fr-FR"), "fr");
    assert.equal(matchLanguageTagToLocale("en-US"), "en");
    assert.equal(matchLanguageTagToLocale("de-DE"), null);

    assert.equal(detectBrowserLocale(["de-DE", "ja-JP", "en-US"]), "ja");
    assert.equal(detectBrowserLocale(["fr-CA", "en-US"]), "fr");
    assert.equal(detectBrowserLocale(["es-ES", "en-US"]), "es");
    assert.equal(detectBrowserLocale(["de-DE", "it-IT"]), "en");
    assert.equal(resolveLocale("auto", ["zh-Hant-HK"]), "zh-TW");
    assert.equal(resolveLocale("ko", ["zh-TW"]), "ko");
  });

  it("interpolates parameters across all 5 languages cleanly", () => {
    try {
      setLocalePreference("en");
      assert.equal(getActiveLocale(), "en");
      assert.equal(t("overview.mtdNetSpend", { month: "2026-11" }), "Month-to-Date Net Spend (2026-11)");

      setLocalePreference("es");
      assert.equal(t("tabs.overview"), "Resumen");
      assert.equal(t("tabs.billing"), "Facturación");

      setLocalePreference("fr");
      assert.equal(t("tabs.overview"), "Aperçu");
      assert.equal(t("tabs.billing"), "Facturation");

      setLocalePreference("ja");
      assert.equal(t("tabs.overview"), "概要");
      assert.equal(t("tabs.billing"), "請求");
      assert.ok(t("overview.mtdNetSpend", { month: "2026-11" }).includes("2026-11"));

      setLocalePreference("ko");
      assert.equal(t("tabs.overview"), "개요");
      assert.equal(t("tabs.billing"), "결제");

      setLocalePreference("zh-CN");
      assert.equal(t("tabs.overview"), "概览");
      assert.equal(t("tabs.billing"), "结算");

      setLocalePreference("zh-TW");
      assert.equal(t("tabs.overview"), "總覽");
      assert.equal(t("tabs.billing"), "帳單");
    } finally {
      setLocalePreference("auto");
    }
  });

  it("persists and validates locale preference in CompanionStore and CompanionService", async () => {
    const tmpDir = mkdtempSync(join(tmpdir(), "agy-i18n-store-test-"));
    try {
      const store = new CompanionStore(tmpDir);
      const service = new CompanionService({ store });

      assert.equal(store.loadPreferences().locale, "auto");

      service.updateSettings({ demoMode: true, locale: "zh-TW" });
      assert.equal(store.loadPreferences().locale, "zh-TW");
      const overviewTw = await service.getOverview();
      assert.equal(overviewTw.preferences.locale, "zh-TW");

      for (const code of ["en", "es", "fr", "ja", "ko", "zh-CN", "auto"] as const) {
        service.updateSettings({ locale: code });
        assert.equal((await service.getOverview()).preferences.locale, code);
      }

      assert.throws(() => {
        service.updateSettings({ locale: "invalid-locale" as unknown as LocaleCode });
      }, /Unsupported locale preference/);
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("formats TWD explicitly as NT$ in zh-TW and normalizes near-zero amounts", () => {
    try {
      setLocalePreference("zh-TW");
      assert.equal(formatMoney(0, "TWD"), "NT$0.00");
      assert.equal(formatMoney(-0.0002, "TWD"), "NT$0.00");
      assert.equal(formatMoney(254.6649, "TWD"), "NT$254.66");
      assert.equal(formatMoney(-164.9, "TWD"), "-NT$164.90");
      assert.ok(!formatMoney(0, "USD").includes("NT$"));

      for (const loc of ["en", "es", "fr", "ja", "ko", "zh-CN", "zh-TW"] as const) {
        setLocalePreference(loc);
        const formatted = formatMoney(-10.5, "TWD");
        assert.ok(
          formatted.includes("NT$") || formatted.includes("TWD"),
          `Expected unambiguous TWD indicator for locale ${loc}, got: ${formatted}`
        );
      }
    } finally {
      setLocalePreference("auto");
    }
  });
});
