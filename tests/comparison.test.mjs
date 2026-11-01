import "./render-ui.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
const { selectComparison } = await import("../src/components/compare/comparison-selection.ts");
const { ComparisonPage } = await import("../src/components/compare/comparison-page.tsx");
const { formatScore } = await import("../src/components/product/format.ts");
const { getComparisonProductView2023, getExploreRegionsProduct2023 } = await import("../src/lib/civx/product-2023.ts");

const regions = getExploreRegionsProduct2023();
const render = selection => renderToStaticMarkup(createElement(ComparisonPage, { regions, ...selection }));
const escape = value => renderToStaticMarkup(createElement("span", null, String(value))).slice(6, -7);
const text = html => html.replace(/<[^>]*>/g, "");

const ASPECTS = [["education", "Pendidikan"], ["public_health", "Kesehatan"], ["socioeconomic", "Ekonomi"], ["basic_services", "Infrastruktur"]];
const index = pressure => 100 - pressure;

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
    assert.ok(article.includes(`<strong>${escape(formatScore(index(score)))}</strong> <small>/ 100</small>`));
  }
  const overall = html.split('aria-labelledby="results-heading"')[1]?.split("</section>")[0];
  assert.ok(overall?.includes(`<strong>${escape(formatScore(comparison.core.overall.absoluteDifference))} <span>poin</span></strong>`));

  const dimensions = html.split('aria-labelledby="dimensions-heading"')[1]?.split("</section>")[0];
  assert.equal((dimensions.match(/<h3>/g) ?? []).length, 4);
  const rows = ASPECTS.map(([id, label]) => {
    const dimension = comparison.core.dimensions.find(item => item.dimensionId === id);
    assert.ok(dimension, id);
    const row = dimensions.split(`<h3>${label}</h3>`)[1]?.split("<h3>")[0];
    assert.ok(row, label);
    const a = formatScore(index(dimension.regionAScore)), b = formatScore(index(dimension.regionBScore));
    assert.ok(row.includes(`<strong>${escape(a)}</strong> / <b>${escape(b)}</b>`), label);
    return [label, a, b, formatScore(dimension.absoluteDifference)];
  });

  const tables = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/g)].map(match => match[1]);
  assert.equal(tables.length, 1);
  const body = tables[0].match(/<tbody>([\s\S]*?)<\/tbody>/)[1];
  const cells = [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)]
    .map(match => [...match[1].matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/g)].map(cell => text(cell[1])));
  assert.deepEqual(cells, [...rows, [
    "Indeks keseluruhan1",
    formatScore(index(comparison.core.overall.regionAScore)),
    formatScore(index(comparison.core.overall.regionBScore)),
    formatScore(comparison.core.overall.absoluteDifference),
  ]].map(row => row.map(escape)));
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

test("same-region selection renders exact ties and a no-gap reading note", () => {
  const selection = selectComparison("3273", "3273");
  const expected = getComparisonProductView2023("3273", "3273");
  assert.deepEqual(selection.comparison, expected);
  assert.ok([expected.core.overall, ...expected.core.dimensions, ...expected.core.indicators].every(value => value.delta === 0));
  const html = assertComparisonOutput(selection);
  const attention = html.split('aria-labelledby="attention-heading"')[1].split("</section>")[0];
  assert.match(text(attention), /tidak ada kesenjangan/);
});

test("comparison names the largest aspect gap, links onward and contains no debug dump", () => {
  const selection = selectComparison("3273", "3276");
  const html = assertComparisonOutput(selection);
  const { comparison } = selection;
  const largest = ASPECTS
    .map(([id, label]) => [label, comparison.core.dimensions.find(item => item.dimensionId === id).absoluteDifference])
    .reduce((top, row) => (row[1] > top[1] ? row : top));
  const attention = html.split('aria-labelledby="attention-heading"')[1].split("</section>")[0];
  assert.ok(text(attention).includes(`dimensi ${largest[0].toLowerCase()}, yaitu ${formatScore(largest[1])} poin`));
  assert.doesNotMatch(html, /<pre\b|scoringPointer|SCORED_NOT_RELEASED|INSIGHTS_NOT_RELEASED|SHA-256|data\/processed\//);
  assert.match(html, /href="\/methodology"/);
  assert.match(html, new RegExp(`href="/regions/${comparison.regionA.id}"`));
  assert.match(html, /href="\/explore"/);
});
