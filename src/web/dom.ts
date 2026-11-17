import { getActiveLocale, t } from "./i18n/index.ts";

export type ChildNodeSpec = Node | string | number | boolean | null | undefined;

export interface ElementAttrs {
  className?: string;
  id?: string;
  title?: string;
  href?: string;
  target?: string;
  rel?: string;
  type?: string;
  value?: string;
  placeholder?: string;
  list?: string;
  disabled?: boolean;
  checked?: boolean;
  selected?: boolean;
  role?: string;
  tabIndex?: number;
  ariaLabel?: string;
  ariaSelected?: string;
  ariaExpanded?: string;
  ariaBusy?: string;
  ariaHidden?: string;
  dataset?: Record<string, string>;
  onClick?: (ev: MouseEvent) => void;
  onInput?: (ev: Event) => void;
  onChange?: (ev: Event) => void;
  onSubmit?: (ev: SubmitEvent) => void;
}

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Safe DOM element builder using `document.createElement` and `textContent` exclusively.
 * Never uses `innerHTML`, preventing DOM XSS by construction.
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: ElementAttrs | null,
  ...children: ChildNodeSpec[]
): HTMLElementTagNameMap[K] {
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
    if (attrs.ariaBusy) el.setAttribute("aria-busy", attrs.ariaBusy);
    if (attrs.ariaHidden) el.setAttribute("aria-hidden", attrs.ariaHidden);

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
      (el as HTMLButtonElement | HTMLInputElement | HTMLSelectElement).disabled = Boolean(
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
        attrs.onSubmit?.(ev as SubmitEvent);
      });
    }
  }

  appendChildren(el, children);
  return el;
}

export function appendChildren(parent: Element, children: readonly ChildNodeSpec[]): void {
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
  tag: string,
  attrs?: Record<string, string | number>,
  ...children: SVGElement[]
): SVGElement {
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

export function clearElement(el: Element): void {
  el.replaceChildren();
}

export function formatMoney(amount: number, currency = "USD"): string {
  const safeCurrency = /^[A-Z]{3}$/.test(currency) ? currency : "USD";
  const normalizedAmount = Math.abs(amount) < 0.005 ? 0 : amount;
  try {
    const formatter = new Intl.NumberFormat(getActiveLocale(), {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (safeCurrency === "TWD" && typeof formatter.formatToParts === "function") {
      return formatter
        .formatToParts(normalizedAmount)
        .map((part) => (part.type === "currency" && part.value === "$" ? "NT$" : part.value))
        .join("");
    }
    return formatter.format(normalizedAmount);
  } catch {
    return `${safeCurrency} ${normalizedAmount.toFixed(2)}`;
  }
}

export function formatRelativeAge(ageMs: number | null, stale: boolean): string {
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

export async function copyToClipboard(text: string): Promise<boolean> {
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
