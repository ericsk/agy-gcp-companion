                                                                         
import { formatMoney, h, svgEl } from "./dom.js";
import { t } from "./i18n/index.js";

/**
 * Renders a crisp, responsive SVG daily spend sparkline using `createElementNS`.
 */
export function renderDailySparkline(
  series                            ,
  currency        
)              {
  if (series.length === 0) {
    return h("div", { className: "sparkline-empty" }, t("chart.noDailyUsage"));
  }

  const width = 320;
  const height = 68;
  const padX = 6;
  const padTop = 8;
  const padBottom = 10;
  const values = series.map((d) => Math.max(0, d.netCost));
  const maxVal = Math.max(...values, 0.01);
  const minVal = 0;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;

  const points = series.map((pt, idx) => {
    const x =
      series.length === 1
        ? width / 2
        : padX + (idx / (series.length - 1)) * innerW;
    const ratio = (Math.max(0, pt.netCost) - minVal) / (maxVal - minVal || 1);
    const y = padTop + innerH - ratio * innerH;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, pt };
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

  const children               = [defs];
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
    children.push(
      svgEl("circle", {
        cx: last.x,
        cy: last.y,
        r: 3.2,
        fill: "currentColor",
      })
    );
  }

  const svg = svgEl(
    "svg",
    {
      viewBox: `0 0 ${width} ${height}`,
      class: "sparkline-svg",
      role: "img",
      "aria-label": t("chart.dailyTrendAria", { days: series.length }),
    },
    ...children
  );

  const firstDate = series[0]?.date.slice(5) ?? "";
  const lastDate = series[series.length - 1]?.date.slice(5) ?? "";
  const peakCost = Math.max(...values);

  return h(
    "div",
    { className: "sparkline-wrap" },
    svg,
    h(
      "div",
      { className: "sparkline-caption" },
      h("span", null, firstDate),
      h("span", null, t("chart.peakPerDay", { amount: formatMoney(peakCost, currency) })),
      h("span", null, lastDate)
    )
  );
}

/**
 * Renders horizontal proportional cost bars for GCP services inside a project/billing card.
 */
export function renderServiceBreakdownList(
  services                            ,
  currency        
)              {
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
          svc.creditsAmount < -0.005
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
