import "./render-ui.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
const { selectComparison } = await import("../src/components/compare/comparison-selection.ts");
const { ComparisonPage } = await import("../src/components/compare/comparison-page.tsx");
const { formatDifference, formatRaw, formatScore } = await import("../src/components/product/format.ts");
const { getComparisonProductView2023, getExploreRegionsProduct2023 } = await import("../src/lib/civx/product-2023.ts");

const regions = getExploreRegionsProduct2023();
const render = selection => renderToStaticMarkup(createElement(ComparisonPage, { regions, ...selection }));
const escape = value => renderToStaticMarkup(createElement("span", null, String(value))).slice(6, -7);
const text = html => html.replace(/<[^>]*>/g, "");

function assertComparisonOutput(selection) {
  const { comparison } = selection;
  const html = render(selection);
  assert.doesNotMatch(html, /role="alert"/);
  for (const [side, region, score] of [
    ["A", comparison.regionA, comparison.core.overall.regionAScore],
    ["B", comparison.regionB, comparison.core.overall.regionBScore],
  ]) {
    const article = html.match(new RegExp(`<article[^>]*data-side="${side}"[^>]*>([\\s\\S]*?)</article>`))?.[1];
    assert.ok(article, `Region ${side} summary`);
    assert.ok(article.includes(`<h3>${escape(region.name)}</h3>`));
    assert.ok(article.includes(`${escape(formatScore(score))} <small>/ 100</small>`));
  }
  const overall = html.split('aria-labelledby="results-heading"')[1]?.split("</section>")[0];
  assert.ok(overall?.includes(`<strong>${escape(formatDifference(comparison.core.overall.delta))} <span>poin</span></strong>`));
  assert.ok(overall.includes(escape(comparison.presentation.relationLabels[comparison.core.overall.relation])));

  const dimensions = html.split('aria-labelledby="dimensions-heading"')[1]?.split("</section>")[0];
  assert.equal((dimensions.match(/<h3>/g) ?? []).length, 6);
  for (const dimension of comparison.core.dimensions) {
    const row = dimensions.split(`<h3>${escape(dimension.dimensionName)}</h3>`)[1]?.split("<h3>")[0];
    assert.ok(row, dimension.dimensionId);
    assert.ok(row.includes(`${escape(formatDifference(dimension.delta))} poin`));
    const values = [...row.matchAll(/<strong>(.*?)<\/strong>/g)].slice(0, 2).map(match => match[1]);
    assert.deepEqual(values, [formatScore(dimension.regionAScore), formatScore(dimension.regionBScore)].map(escape));
  }

  const tables = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/g)].map(match => match[1]);
  assert.equal(tables.length, 18);
  for (const [index, indicator] of comparison.core.indicators.entries()) {
    const table = tables[index];
    assert.ok(table.match(/<caption>([\s\S]*?)<\/caption>/)?.[1].includes(escape(indicator.indicatorName)));
    const rows = [...table.matchAll(/<tbody>([\s\S]*?)<\/tbody>/g)][0][1];
    const cells = [...rows.matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/g)].map(match => text(match[1]));
    assert.deepEqual(cells, [
      `A · ${comparison.regionA.name}`, formatRaw(indicator.rawValueA, indicator.unit), formatScore(indicator.normalizedPressureA),
      `B · ${comparison.regionB.name}`, formatRaw(indicator.rawValueB, indicator.unit), formatScore(indicator.normalizedPressureB),
    ].map(escape));
    const summary = [...html.matchAll(/<summary>([\s\S]*?)<\/summary>/g)]
      .find(match => match[1].includes(escape(indicator.indicatorName)))?.[1];
    assert.ok(summary?.includes(`<strong>${escape(formatDifference(indicator.delta))}</strong>`));
  }
  return html;
}

test("invalid URL selections show an alert and never substitute comparison results", () => {
  for (const [a, b] of [
    ["unknown", "3273"], ["3201", "unknown"], ["", "3273"], ["3201", ""],
    [["3201"], "3273"], ["3201", ["3273"]], [["3201", "3202"], "3273"],
    [undefined, "3273"], [" 3201", "3273"], ["3201", "3273 "],
  ]) {
    const selection = selectComparison(a, b);
    assert.equal(selection.comparison, null, JSON.stringify([a, b]));
    assert.ok(selection.error);
    const html = render(selection);
    assert.match(html, /role="alert"/);
    assert.doesNotMatch(html, /data-side="[AB]"|aria-labelledby="results-heading"|<tbody>/);
    for (const [side, value] of [["a", a], ["b", b]]) {
      const select = html.match(new RegExp(`<select[^>]*name="${side}"[^>]*>([\\s\\S]*?)</select>`))[1];
      const selected = select.match(/<option value="([^"]*)"[^>]*selected=""/)[1];
      assert.equal(selected, typeof value === "string" && regions.some(view => view.region.id === value) ? value : "");
    }
  }
});

test("swapping selected regions preserves API values and reverses every rendered A-minus-B difference", () => {
  const forward = selectComparison("3201", "3273");
  const reverse = selectComparison("3273", "3201");
  assert.deepEqual(forward.comparison, getComparisonProductView2023("3201", "3273"));
  assert.deepEqual(reverse.comparison, getComparisonProductView2023("3273", "3201"));
  assert.notEqual(forward.comparison.core.overall.delta, 0);
  for (const [first, second] of [
    [forward.comparison.core.overall, reverse.comparison.core.overall],
    ...forward.comparison.core.dimensions.map((value, index) => [value, reverse.comparison.core.dimensions[index]]),
    ...forward.comparison.core.indicators.map((value, index) => [value, reverse.comparison.core.indicators[index]]),
  ]) assert.equal(first.delta + second.delta, 0);
  assertComparisonOutput(forward);
  assertComparisonOutput(reverse);
});

test("same-region selection renders exact ties and retains all tied dimension and indicator highlights", () => {
  const selection = selectComparison("3273", "3273");
  const expected = getComparisonProductView2023("3273", "3273");
  assert.deepEqual(selection.comparison, expected);
  assert.ok([expected.core.overall, ...expected.core.dimensions, ...expected.core.indicators].every(value => value.delta === 0));
  const html = assertComparisonOutput(selection);
  const highlights = html.split('aria-labelledby="highlights-heading"')[1].split("</section>")[0];
  const items = [...highlights.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(match => match[1]);
  const expectedHighlights = [...expected.core.highlights.largestDimensionDifferences, ...expected.core.highlights.largestNormalizedPressureDifferences];
  assert.equal(items.length, 24);
  assert.equal(expectedHighlights.length, 24);
  for (const [index, highlight] of expectedHighlights.entries()) {
    assert.ok(items[index].includes(escape(highlight.dimensionName ?? highlight.indicatorName)));
    assert.ok(items[index].includes(escape(expected.presentation.relationLabels[highlight.relation])));
    assert.ok(items[index].includes(`${escape(formatDifference(highlight.delta))} poin`));
  }
});
