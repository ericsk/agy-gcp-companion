import { getActiveLocale, t } from "./i18n/index.js";

                                                                                

                               
                     
              
                 
                
                  
               
                
                 
                       
                
                     
                    
                     
                
                    
                     
                        
                        
                                   
                                     
                                
                                 
                                       
 

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Safe DOM element builder using `document.createElement` and `textContent` exclusively.
 * Never uses `innerHTML`, preventing DOM XSS by construction.
 */
export function h                                       (
  tag   ,
  attrs                      ,
  ...children                 
)                           {
  const el = document.createElement(tag);
  if (attrs) {
    if (attrs.className) el.className = attrs.className;
    if (attrs.id) el.id = attrs.id;
    if (attrs.title) el.title = attrs.title;
    if (attrs.role) el.setAttribute("role", attrs.role);
    if (attrs.tabIndex !== undefined) el.tabIndex = attrs.tabIndex;
    if (attrs.ariaLabel) el.setAttribute("aria-label", attrs.ariaLabel);
    if (attrs.ariaSelected) el.setAttribute("aria-selected", attrs.ariaSelected);
    if (attrs.ariaExpanded) el.setAttribute("aria-expanded", attrs.ariaExpanded);

    if (attrs.href !== undefined && el instanceof HTMLAnchorElement) {
      // Only allow https:// external links or relative internal anchors
      if (attrs.href.startsWith("https://") || attrs.href.startsWith("./") || attrs.href.startsWith("#")) {
        el.href = attrs.href;
      }
    }
    if (attrs.target && el instanceof HTMLAnchorElement) el.target = attrs.target;
    if (attrs.rel && el instanceof HTMLAnchorElement) el.rel = attrs.rel;

    if (attrs.type && (el instanceof HTMLInputElement || el instanceof HTMLButtonElement)) {
      el.type = attrs.type;
    }
    if (attrs.placeholder && el instanceof HTMLInputElement) {
      el.placeholder = attrs.placeholder;
    }
    if (attrs.list && el instanceof HTMLInputElement) {
      el.setAttribute("list", attrs.list);
    }
    if (attrs.disabled !== undefined && "disabled" in el) {
      (el                                                            ).disabled = Boolean(
        attrs.disabled
      );
    }
    if (attrs.checked !== undefined && el instanceof HTMLInputElement) {
      el.checked = Boolean(attrs.checked);
    }
    if (attrs.selected !== undefined && el instanceof HTMLOptionElement) {
      el.selected = Boolean(attrs.selected);
    }
    if (attrs.value !== undefined) {
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLOptionElement ||
        el instanceof HTMLSelectElement
      ) {
        el.value = attrs.value;
      }
    }
    if (attrs.dataset) {
      for (const [k, v] of Object.entries(attrs.dataset)) {
        el.dataset[k] = v;
      }
    }
    if (attrs.onClick) el.addEventListener("click", attrs.onClick);
    if (attrs.onInput) el.addEventListener("input", attrs.onInput);
    if (attrs.onChange) el.addEventListener("change", attrs.onChange);
    if (attrs.onSubmit) {
      el.addEventListener("submit", (ev) => {
        ev.preventDefault();
        attrs.onSubmit?.(ev               );
      });
    }
  }

  appendChildren(el, children);
  return el;
}

export function appendChildren(parent         , children                          )       {
  for (const child of children) {
    if (child === null || child === undefined || typeof child === "boolean") continue;
    if (child instanceof Node) {
      parent.appendChild(child);
    } else {
      parent.appendChild(document.createTextNode(String(child)));
    }
  }
}

export function svgEl(
  tag        ,
  attrs                                  ,
  ...children              
)             {
  const el = document.createElementNS(SVG_NS, tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, String(v));
    }
  }
  for (const child of children) {
    el.appendChild(child);
  }
  return el;
}

export function clearElement(el         )       {
  el.replaceChildren();
}

export function formatMoney(amount        , currency = "USD")         {
  const safeCurrency = /^[A-Z]{3}$/.test(currency) ? currency : "USD";
  try {
    return new Intl.NumberFormat(getActiveLocale(), {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: Math.abs(amount) < 10 && amount !== 0 ? 2 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${safeCurrency} ${amount.toFixed(2)}`;
  }
}

export function formatRelativeAge(ageMs               , stale         )         {
  if (ageMs === null) return t("age.notSynced");
  const sec = Math.floor(ageMs / 1000);
  const suffix = stale ? t("age.offlineCacheSuffix") : "";
  if (sec < 15) return t("age.justNow", { suffix });
  if (sec < 60) return t("age.secondsAgo", { n: sec, suffix });
  const min = Math.floor(sec / 60);
  if (min < 60) return t("age.minutesAgo", { n: min, suffix });
  const hr = Math.floor(min / 60);
  return t("age.hoursMinutesAgo", { h: hr, m: min % 60, suffix });
}

export async function copyToClipboard(text        )                   {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
