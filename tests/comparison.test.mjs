import "./render-ui.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
const { selectComparison } = await import("../src/components/compare/comparison-selection.ts");
const { ComparisonPage } = await import("../src/components/compare/comparison-page.tsx");
const { formatDifference, formatScore } = await import("../src/components/product/format.ts");
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
    assert.ok(article.includes(`<strong>${escape(formatScore(score))}</strong> <small>/ 100</small>`));
  }
  const overall = html.split('aria-labelledby="results-heading"')[1]?.split("</section>")[0];
  assert.ok(overall?.includes(`<strong>${escape(formatScore(comparison.core.overall.absoluteDifference))} <span>poin</span></strong>`));
  assert.ok(overall?.includes(`<strong>${escape(formatDifference(comparison.core.overall.delta))}</strong> poin`));

  const bodies = [...html.matchAll(/<tbody>([\s\S]*?)<\/tbody>/g)].map(match => match[1]);
  const body = bodies.find(value => [...value.matchAll(/<tr\b/g)].length === 7);
  assert.ok(body, "Six dimensions and overall score retain a semantic table equivalent");
  const numericRows = [...body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)]
    .map(match => [...match[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(cell => text(cell[1])));
  assert.deepEqual(numericRows, [...comparison.core.dimensions, comparison.core.overall].map(row =>
    [row.regionAScore, row.regionBScore, row.absoluteDifference].map(value => escape(formatScore(value)))));
  return html;
}

function selectedOption(html, side) {
  const select = html.match(new RegExp(`<select[^>]*name="${side}"[^>]*>([\\s\\S]*?)</select>`))?.[1];
  assert.ok(select, `Selection ${side}`);
  assert.equal((select.match(/<option value="[^"]+"/g) ?? []).length, regions.length);
  return select.match(/<option value="([^"]*)"[^>]*selected=""/)?.[1];
}

test("distinct-region comparison preserves facade pressure values and selected identities", () => {
  const selection = selectComparison("3276", "3202");
  assert.deepEqual(selection.comparison, getComparisonProductView2023("3276", "3202"));
  const html = assertComparisonOutput(selection);
  assert.equal(selectedOption(html, "a"), "3276");
  assert.equal(selectedOption(html, "b"), "3202");
});

test("omitted URL selections keep the existing distinct default comparison", () => {
  const selection = selectComparison(undefined, undefined);
  assert.ok(regions.some(({ region }) => region.id === selection.selectedA));
  assert.ok(regions.some(({ region }) => region.id === selection.selectedB));
  assert.notEqual(selection.selectedA, selection.selectedB);
  assert.deepEqual(selection.comparison, getComparisonProductView2023(selection.selectedA, selection.selectedB));
  const html = assertComparisonOutput(selection);
  assert.equal(selectedOption(html, "a"), selection.selectedA);
  assert.equal(selectedOption(html, "b"), selection.selectedB);
});

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
      assert.equal(selectedOption(html, side), typeof value === "string" && regions.some(view => view.region.id === value) ? value : "");
    }
  }
});

test("pair swaps render facade A/B values, unchanged absolute distances and reversed signed overall differences", () => {
  const forward = selectComparison("3201", "3273");
  const reverse = selectComparison("3273", "3201");
  assert.deepEqual(forward.comparison, getComparisonProductView2023("3201", "3273"));
  assert.deepEqual(reverse.comparison, getComparisonProductView2023("3273", "3201"));
  assert.notEqual(forward.comparison.core.overall.delta, 0);
  for (const [first, second] of [
    [forward.comparison.core.overall, reverse.comparison.core.overall],
    ...forward.comparison.core.dimensions.map((value, index) => [value, reverse.comparison.core.dimensions[index]]),
  ]) {
    assert.equal(first.regionAScore, second.regionBScore);
    assert.equal(first.regionBScore, second.regionAScore);
    assert.equal(first.absoluteDifference, second.absoluteDifference);
    assert.equal(first.delta + second.delta, 0);
  }
  assertComparisonOutput(forward);
  assertComparisonOutput(reverse);
});

test("same-region selection remains valid with identical scores and exact zero differences", () => {
  const selection = selectComparison("3273", "3273");
  const expected = getComparisonProductView2023("3273", "3273");
  assert.deepEqual(selection.comparison, expected);
  assert.ok([expected.core.overall, ...expected.core.dimensions].every(value =>
    value.regionAScore === value.regionBScore && value.delta === 0 && value.absoluteDifference === 0));
  const html = assertComparisonOutput(selection);
  assert.equal(selectedOption(html, "a"), "3273");
  assert.equal(selectedOption(html, "b"), "3273");
});
