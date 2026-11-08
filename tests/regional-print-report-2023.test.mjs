import "./render-ui.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const { RegionalPrintReport } = await import("../src/components/regions/regional-print-report.tsx");
const { getRegionProductView2023 } = await import("../src/lib/civx/product-2023.ts");
const view = getRegionProductView2023("3273");
const render = value => renderToStaticMarkup(createElement(RegionalPrintReport, { view: value }));

// Synthetic access traps prove that printing cannot read unreleased numeric payloads.
const forbidden = () => { throw new Error("Unreleased value accessed"); };
test("public regional report never reads scores, observed values, uncertainty, CONTEXT, or insights", () => {
  const restricted = {
    region: view.region,
    methodology: view.methodology,
    get context() { return forbidden(); },
    core: {
      get overallScore() { return forbidden(); },
      get insights() { return forbidden(); },
      dimensions: view.core.dimensions.map(({ dimensionId, displayName }) => ({ dimensionId, displayName, get score() { return forbidden(); } })),
      indicators: view.core.indicators.map(indicator => ({
        indicatorId: indicator.indicatorId,
        displayName: indicator.displayName,
        dimensionId: indicator.dimensionId,
        get rawValue() { return forbidden(); },
        get normalizedPressure() { return forbidden(); },
        disclosure: {
          source: indicator.disclosure.source,
          numeratorSource: indicator.disclosure.numeratorSource,
          denominatorSource: indicator.disclosure.denominatorSource,
          get uncertainty() { return forbidden(); },
        },
      })),
    },
  };
  const html = render(restricted);
  assert.match(html, /belum disetujui untuk rilis publik/);
  assert.match(html, /bukan indeks kualitas wilayah, klasifikasi resmi pemerintah, atau rekomendasi kebijakan otomatis/);
  assert.doesNotMatch(html, /SCORED_NOT_RELEASED|INSIGHTS_NOT_RELEASED|sha256:|data\/processed\//);
  assert.equal((html.match(/<tr>/g) ?? []).length, 7, "Six dimensions plus one table header must remain in the report");
});

test("report deduplicates source documents without losing table locators or denominator provenance", () => {
  const html = render(view);
  const bibliography = html.match(/<ol>([\s\S]*?)<\/ol>/)[1];
  const records = [...bibliography.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(match => match[1]);
  const expected = new Map();
  for (const indicator of view.core.indicators) {
    for (const source of [indicator.disclosure.source, indicator.disclosure.numeratorSource, indicator.disclosure.denominatorSource]) {
      if (!source) continue;
      const locators = expected.get(source.url) ?? new Set();
      if (source.locator) locators.add(source.locator);
      expected.set(source.url, locators);
    }
  }
  assert.equal(records.length, expected.size);
  const escaped = value => renderToStaticMarkup(createElement("span", null, value)).slice(6, -7);
  for (const [url, locators] of expected) {
    const record = records.find(item => item.includes(`href="${escaped(url)}"`));
    assert.ok(record, `Missing source ${url}`);
    for (const locator of locators) assert.ok(record.includes(escaped(locator)), `Missing locator ${locator}`);
  }
  const populationSource = view.core.indicators.find(item => item.indicatorId === "puskesmas_per_100k").disclosure.denominatorSource;
  assert.ok(bibliography.includes(escaped(populationSource.url)), "Derived facility rate must retain its population source");
});
