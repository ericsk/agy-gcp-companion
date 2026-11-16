                                                                        
import { EN_MESSAGES,                                              } from "./en.js";
import { ES_MESSAGES } from "./es.js";
import { FR_MESSAGES } from "./fr.js";
import { JA_MESSAGES } from "./ja.js";
import { KO_MESSAGES } from "./ko.js";
import { ZH_CN_MESSAGES } from "./zh-CN.js";
import { ZH_TW_MESSAGES } from "./zh-TW.js";

                                   
                            
                              
                             
 

export const SUPPORTED_LOCALES                              = [
  { code: "en", nativeName: "English", shortName: "🌐 EN" },
  { code: "es", nativeName: "Español", shortName: "🌐 ES" },
  { code: "fr", nativeName: "Français", shortName: "🌐 FR" },
  { code: "ja", nativeName: "日本語", shortName: "🌐 日本語" },
  { code: "ko", nativeName: "한국어", shortName: "🌐 한국어" },
  { code: "zh-CN", nativeName: "简体中文", shortName: "🌐 简体" },
  { code: "zh-TW", nativeName: "繁體中文", shortName: "🌐 繁體" },
];

export const TRANSLATION_CATALOGS                                         = {
  en: EN_MESSAGES,
  es: ES_MESSAGES,
  fr: FR_MESSAGES,
  ja: JA_MESSAGES,
  ko: KO_MESSAGES,
  "zh-CN": ZH_CN_MESSAGES,
  "zh-TW": ZH_TW_MESSAGES,
};

let currentLocalePreference                   = "auto";

export function isSupportedLocaleCode(value        )                      {
  return (
    value === "en" ||
    value === "es" ||
    value === "fr" ||
    value === "ja" ||
    value === "ko" ||
    value === "zh-CN" ||
    value === "zh-TW"
  );
}

export function matchLanguageTagToLocale(rawTag        )                    {
  const tag = rawTag.trim().toLowerCase().replace(/_/g, "-");
  if (!tag) return null;

  if (
    tag === "zh-tw" ||
    tag === "zh-hk" ||
    tag === "zh-mo" ||
    tag.startsWith("zh-hant")
  ) {
    return "zh-TW";
  }
  if (
    tag === "zh" ||
    tag === "zh-cn" ||
    tag === "zh-sg" ||
    tag === "zh-my" ||
    tag.startsWith("zh-hans") ||
    tag.startsWith("zh-")
  ) {
    return "zh-CN";
  }
  if (tag === "es" || tag.startsWith("es-")) {
    return "es";
  }
  if (tag === "fr" || tag.startsWith("fr-")) {
    return "fr";
  }
  if (tag === "ja" || tag.startsWith("ja-")) {
    return "ja";
  }
  if (tag === "ko" || tag.startsWith("ko-")) {
    return "ko";
  }
  if (tag === "en" || tag.startsWith("en-")) {
    return "en";
  }
  return null;
}

export function detectBrowserLocale(explicitLanguages                    )             {
  const candidates           = [];
  if (explicitLanguages && explicitLanguages.length > 0) {
    candidates.push(...explicitLanguages);
  } else if (typeof window !== "undefined" && window.navigator) {
    if (Array.isArray(window.navigator.languages)) {
      candidates.push(...window.navigator.languages);
    }
    if (typeof window.navigator.language === "string" && window.navigator.language) {
      candidates.push(window.navigator.language);
    }
  }

  for (const tag of candidates) {
    const matched = matchLanguageTagToLocale(tag);
    if (matched) return matched;
  }
  return "en";
}

export function resolveLocale(
  pref                  ,
  explicitLanguages                    
)             {
  if (pref !== "auto" && isSupportedLocaleCode(pref)) {
    return pref;
  }
  return detectBrowserLocale(explicitLanguages);
}

export function setLocalePreference(pref                              )       {
  if (!pref || pref === "auto") {
    currentLocalePreference = "auto";
    return;
  }
  currentLocalePreference = isSupportedLocaleCode(pref) ? pref : "auto";
}

export function getLocalePreference()                   {
  return currentLocalePreference;
}

export function getActiveLocale()             {
  return resolveLocale(currentLocalePreference);
}

export function t(
  key                ,
  params                                  
)         {
  const active = getActiveLocale();
  const catalog = TRANSLATION_CATALOGS[active] || EN_MESSAGES;
  const template = catalog[key] ?? EN_MESSAGES[key] ?? String(key);
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_match, paramName        ) => {
    const val = params[paramName];
    return val !== undefined && val !== null ? String(val) : "";
  });
}

export function localizeSetupHint(hint               )                {
  if (!hint) return null;
  if (getActiveLocale() === "en") return hint;
  if (/Install Google Cloud SDK/i.test(hint)) {
    return t("hint.installCli");
  }
  if (/Run `gcloud auth login` in your terminal/i.test(hint)) {
    return t("hint.runAuthLogin");
  }
  if (/session has expired or been revoked/i.test(hint)) {
    return t("hint.sessionExpired");
  }
  if (/Demo Preview Mode is active/i.test(hint)) {
    return t("hint.demoActive");
  }
  return hint;
}
