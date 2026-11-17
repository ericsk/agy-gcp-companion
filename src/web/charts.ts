import type { DailySpendPoint, ServiceCostItem, SpendForecastSummary } from "../core/types.ts";
import { formatMoney, h, svgEl } from "./dom.ts";
import { t } from "./i18n/index.ts";

/**
 * Renders a crisp, responsive SVG daily spend sparkline using `createElementNS`.
 */
export function renderDailySparkline(
  series: readonly DailySpendPoint[],
  currency: string,
  emptyMessage?: string,
  forecast?: SpendForecastSummary
): HTMLElement {
  if (series.length === 0) {
    return h("div", { className: "sparkline-empty" }, emptyMessage || t("chart.noDailyUsage"));
  }

  const width = 460;
  const height = 68;
  const padX = 6;
  const padTop = 8;
  const padBottom = 10;
  const netValues = series.map((d) => Math.max(0, d.netCost));
  const grossValues = series.map((d) => Math.max(0, d.grossCost));
  const maxNet = Math.max(...netValues, 0);
  const maxGross = Math.max(...grossValues, 0);
  const useGrossSeries = maxNet <= 0.005 && maxGross > 0.005;
  const values = useGrossSeries ? grossValues : netValues;
  const minVal = 0;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;

  const monthPrefix =
    forecast?.invoiceMonth?.length === 6
      ? `${forecast.invoiceMonth.slice(0, 4)}-${forecast.invoiceMonth.slice(4, 6)}-`
      : "";
  const lastActualDate = series[series.length - 1]?.date ?? "";
  const lastActualDay = Number(lastActualDate.slice(8, 10)) || series.length;
  const forecastRate =
    forecast && forecast.status === "estimated"
      ? useGrossSeries
        ? forecast.grossDailyRunRate
        : forecast.netDailyRunRate
      : null;
  const forecastEomTotal =
    forecast && forecast.status === "estimated"
      ? useGrossSeries
        ? forecast.monthEndGrossCost
        : forecast.monthEndNetCost
      : null;
  const hasForecastProjection = Boolean(
    forecast &&
      forecast.status === "estimated" &&
      forecast.daysInMonth > 1 &&
      monthPrefix &&
      lastActualDate.startsWith(monthPrefix) &&
      lastActualDay < forecast.daysInMonth &&
      forecastRate !== null &&
      forecastEomTotal !== null
  );

  const maxVal = Math.max(...values, hasForecastProjection ? Math.max(0, forecastRate ?? 0) : 0, 0.01);
  const dayToX = (dayNum: number): number => {
    const totalDays = forecast?.daysInMonth ?? 30;
    const clamped = Math.max(1, Math.min(totalDays, dayNum));
    const ratio = totalDays > 1 ? (clamped - 1) / (totalDays - 1) : 0.5;
    return Math.round((padX + ratio * innerW) * 10) / 10;
  };
  const valToY = (rawVal: number): number => {
    const ratio = (Math.max(0, rawVal) - minVal) / (maxVal - minVal || 1);
    return Math.round((padTop + innerH - ratio * innerH) * 10) / 10;
  };

  const points = series.map((pt, idx) => {
    const x = hasForecastProjection
      ? dayToX(Number(pt.date.slice(8, 10)) || idx + 1)
      : Math.round(
          (series.length === 1 ? width / 2 : padX + (idx / (series.length - 1)) * innerW) * 10
        ) / 10;
    const rawVal = useGrossSeries ? pt.grossCost : pt.netCost;
    const y = valToY(rawVal);
    return { x, y, pt };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
  const areaPath =
    points.length > 1
      ? `${linePath} L${points[points.length - 1].x},${height - padBottom} L${points[0].x},${height - padBottom} Z`
      : "";

  const gradId = `spark-grad-${currency.toLowerCase()}`;
  const defs = svgEl(
    "defs",
    {},
    svgEl(
      "linearGradient",
      { id: gradId, x1: "0", y1: "0", x2: "0", y2: "1" },
      svgEl("stop", { offset: "0%", "stop-color": "currentColor", "stop-opacity": "0.28" }),
      svgEl("stop", { offset: "100%", "stop-color": "currentColor", "stop-opacity": "0.0" })
    )
  );

  const children: SVGElement[] = [defs];
  if (areaPath) {
    children.push(svgEl("path", { d: areaPath, fill: `url(#${gradId})` }));
  }
  children.push(
    svgEl("path", {
      d: linePath,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    })
  );

  const last = points[points.length - 1];
  if (last) {
    if (hasForecastProjection && forecast && forecastRate !== null) {
      const rateY = valToY(forecastRate);
      const nextX = dayToX(Math.min(forecast.daysInMonth, lastActualDay + 1));
      const endX = dayToX(forecast.daysInMonth);
      const forecastPath = `M${last.x},${last.y} L${nextX},${rateY} L${endX},${rateY}`;
      children.push(
        svgEl("path", {
          d: forecastPath,
          class: "sparkline-forecast",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2",
          "stroke-dasharray": "4 3",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        }),
        svgEl("circle", {
          cx: endX,
          cy: rateY,
          r: 2.6,
          class: "sparkline-forecast-dot",
          fill: "currentColor",
        })
      );
    }
    children.push(
      svgEl("circle", {
        cx: last.x,
        cy: last.y,
        r: 3.2,
        fill: "currentColor",
      })
    );
  }

  const ariaLabel = hasForecastProjection
    ? useGrossSeries
      ? t("chart.dailyGrossTrendWithForecastAria", { days: series.length })
      : t("chart.dailyTrendWithForecastAria", { days: series.length })
    : useGrossSeries
      ? t("chart.dailyGrossTrendAria", { days: series.length })
      : t("chart.dailyTrendAria", { days: series.length });

  const svg = svgEl(
    "svg",
    {
      viewBox: `0 0 ${width} ${height}`,
      class: "sparkline-svg",
      role: "img",
      "aria-label": ariaLabel,
    },
    ...children
  );

  const firstDate = series[0]?.date.slice(5) ?? "";
  const monthEndDate =
    hasForecastProjection && forecast
      ? `${forecast.invoiceMonth.slice(4)}-${String(forecast.daysInMonth).padStart(2, "0")}`
      : (series[series.length - 1]?.date.slice(5) ?? "");
  const peakCost = Math.max(...values);

  return h(
    "div",
    { className: "sparkline-wrap" },
    svg,
    h(
      "div",
      { className: "sparkline-caption" },
      h("span", null, firstDate),
      h(
        "span",
        null,
        hasForecastProjection && forecastRate !== null && forecastEomTotal !== null
          ? t("chart.forecastCaption", {
              rate: formatMoney(forecastRate, currency),
              monthEnd: formatMoney(forecastEomTotal, currency),
            })
          : useGrossSeries
            ? t("chart.peakGrossPerDay", { amount: formatMoney(peakCost, currency) })
            : t("chart.peakPerDay", { amount: formatMoney(peakCost, currency) })
      ),
      h("span", null, monthEndDate)
    )
  );
}

/**
 * Renders horizontal proportional cost bars for GCP services inside a project/billing card.
 */
export function renderServiceBreakdownList(
  services: readonly ServiceCostItem[],
  currency: string
): HTMLElement {
  if (services.length === 0) {
    return h("div", { className: "muted-note" }, t("chart.noBillableServices"));
  }

  const rows = services.slice(0, 6).map((svc) => {
    const pct = Math.max(2, Math.min(100, svc.sharePercent || 0));
    const barSvg = svgEl(
      "svg",
      {
        viewBox: "0 0 100 6",
        preserveAspectRatio: "none",
        class: "svc-bar-svg",
        "aria-hidden": "true",
      },
      svgEl("rect", {
        x: 0,
        y: 0,
        width: 100,
        height: 6,
        rx: 3,
        class: "svc-bar-bg",
      }),
      svgEl("rect", {
        x: 0,
        y: 0,
        width: pct,
        height: 6,
        rx: 3,
        class: "svc-bar-fg",
      })
    );

    const isCreditOffsetZero = Math.abs(svc.netCost) < 0.005 && svc.grossCost >= 0.005;
    return h(
      "div",
      { className: "svc-row" },
      h(
        "div",
        { className: "svc-row-header" },
        h("span", { className: "svc-name", title: svc.serviceName }, svc.serviceName),
        h(
          "span",
          { className: "svc-amount" },
          formatMoney(svc.netCost, currency),
          isCreditOffsetZero
            ? h(
                "span",
                {
                  className: "svc-credit-hint",
                  title: t("chart.grossCreditsHint", {
                    gross: formatMoney(svc.grossCost, currency),
                    credits: formatMoney(svc.creditsAmount, currency),
                  }),
                },
                ` (${t("chart.grossShort", { amount: formatMoney(svc.grossCost, currency) })} · ${svc.sharePercent.toFixed(0)}%)`
              )
            : svc.creditsAmount < -0.005
              ? h(
                  "span",
                  {
                    className: "svc-credit-hint",
                    title: t("chart.grossCreditsHint", {
                      gross: formatMoney(svc.grossCost, currency),
                      credits: formatMoney(svc.creditsAmount, currency),
                    }),
                  },
                  ` (${svc.sharePercent.toFixed(0)}%)`
                )
              : ` (${svc.sharePercent.toFixed(0)}%)`
        )
      ),
      barSvg
    );
  });

  return h("div", { className: "svc-list" }, ...rows);
}
