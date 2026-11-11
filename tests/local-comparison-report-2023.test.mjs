import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { prepareLocalAnalyticalReport2023, prepareLocalComparisonReport2023 } from "../scripts/reporting/report-data-2023.ts";
import { renderLocalAnalyticalHtml2023 } from "../scripts/reporting/analytical-html-2023.ts";
import { renderLocalComparisonHtml2023 } from "../scripts/reporting/comparison-html-2023.ts";
import { getComparisonProductView2023, getExploreRegionsProduct2023 } from "../src/lib/civx/product-2023.ts";
import { formatDifference } from "../src/components/product/format.ts";

const selected = prepareLocalAnalyticalReport2023("3273", { q: "Bandung", type: "kota" });
const dataValues = html => [...html.matchAll(/<data value="([^"]+)"[^>]*>/g)].map(match => Number(match[1]));
const decode = value => value.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => ({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" })[entity]);
const text = html => decode(html.replace(/<[^>]*>/g, ""));

test("local profile chart preserves all six authoritative scores and has a numeric table equivalent", () => {
  const html = renderLocalAnalyticalHtml2023(selected);
  const plotted = [...html.matchAll(/<g data-dimension-id="([^"]+)" data-score="([^"]+)"/g)].map(match => [match[1], Number(match[2])]);
  assert.deepEqual(plotted, selected.selected.core.dimensions.map(row => [row.dimensionId, row.score]));
  const profile = html.match(/<section aria-labelledby="dimensions-heading">([\s\S]*?)<\/section>/)[1];
  assert.deepEqual(dataValues(profile), selected.selected.core.dimensions.map(row => row.score));
  const svg = profile.match(/<svg[^>]*aria-labelledby="([^"]+)"/)[1];
  for (const id of svg.split(" ")) assert.ok(profile.includes(`id="${id}"`));
});

for (const [a, b] of [["3273", "3201"], ["3201", "3273"], ["3273", "3273"]]) {
  test(`private comparison ${a}/${b} preserves engine values, signed differences and source associations`, () => {
    const before = JSON.stringify(getExploreRegionsProduct2023());
    const base = a === "3273" ? selected : prepareLocalAnalyticalReport2023(a);
    const report = prepareLocalComparisonReport2023(base, b);
    const engine = getComparisonProductView2023(a, b);
    const html = renderLocalComparisonHtml2023(report);
    assert.equal(report.regionA.region.id, a);
    assert.equal(report.regionB.region.id, b);
    assert.equal("context" in report.regionB, false);
    assert.equal("insights" in report.regionB.core, false);
    assert.deepEqual(report.overall, engine.core.overall);
    assert.deepEqual(dataValues(html), [engine.core.overall.regionAScore, engine.core.overall.regionBScore, engine.core.overall.delta,
      ...engine.core.dimensions.flatMap(row => [row.regionAScore, row.regionBScore, row.delta]),
      ...engine.core.indicators.flatMap(row => [row.normalizedPressureA, row.normalizedPressureB, row.delta])]);
    const plotted = [...html.matchAll(/<g data-dimension-id="([^"]+)" data-score-a="([^"]+)" data-score-b="([^"]+)"/g)].map(match => [match[1], Number(match[2]), Number(match[3])]);
    assert.deepEqual(plotted, engine.core.dimensions.map(row => [row.dimensionId, row.regionAScore, row.regionBScore]));
    const bibliography = new Map([...html.matchAll(/<li class="source" id="(source-\d+)">([\s\S]*?)<\/li>/g)].map(match => [match[1], match[2]]));
    for (const region of [report.regionA, report.regionB]) {
      for (const indicator of region.core.indicators) {
        const row = html.match(new RegExp(`<tr data-indicator-id="${indicator.indicatorId}">([\\s\\S]*?)<\\/tr>`))[1];
        for (const source of [indicator.disclosure.source, indicator.disclosure.numeratorSource, indicator.disclosure.denominatorSource].filter(Boolean)) {
          const record = [...row.matchAll(/href="#(source-\d+)"/g)].map(match => bibliography.get(match[1])).find(value => value && text(value).includes(source.sourceId) && text(value).includes(source.locator ?? "Tidak tersedia pada facade.") && [...value.matchAll(/href="([^"]+)"/g)].some(match => decode(match[1]) === source.url));
          assert.ok(record, `${region.region.id}/${indicator.indicatorId}: source and locator stay traceable`);
        }
        for (const limitation of indicator.disclosure.limitations) assert.ok(text(html).includes(limitation));
      }
      assert.equal(region.methodology.productionIntegrationAuthorized, false);
      assert.equal(region.methodology.scoreStatus, "SCORED_NOT_RELEASED");
      assert.equal(region.methodology.insightStatus, "INSIGHTS_NOT_RELEASED");
    }
    assert.equal(JSON.stringify(getExploreRegionsProduct2023()), before);
  });
}

test("explicit comparison peer does not inherit CSV filters and unknown peers fail without fallback", () => {
  assert.deepEqual(selected.regions.map(view => view.region.id), ["3273"]);
  assert.equal(prepareLocalComparisonReport2023(selected, "3201").regionB.region.id, "3201");
  for (const id of ["", "unknown", "32", "3273 ", "../3273"]) assert.throws(() => prepareLocalComparisonReport2023(selected, id), RangeError);
});

test("comparison document escapes metadata, rejects executable URLs and permits only its hashed offline print script", () => {
  const report = structuredClone(prepareLocalComparisonReport2023(selected, "3201"));
  const payload = '</td><img src=x onerror="bad()"><script>bad()</script>';
  report.regionA.region.name = payload;
  report.regionB.core.indicators[0].disclosure.source.title = payload;
  report.comparison.dimensions[0].label = payload;
  const html = renderLocalComparisonHtml2023(report);
  assert.doesNotMatch(html, /<img|<iframe|<script>bad/);
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  assert.equal(scripts.length, 1);
  const csp = decode(html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1]);
  assert.ok(csp.includes(`script-src 'sha256-${createHash("sha256").update(scripts[0]).digest("base64")}'`));
  assert.ok(csp.includes("connect-src 'none'"));
  report.regionB.core.indicators[0].disclosure.source.url = "javascript:bad()";
  assert.throws(() => renderLocalComparisonHtml2023(report), TypeError);
});

test("small signed differences never acquire a displayed zero and signed zero stays neutral", () => {
  assert.equal(formatDifference(0.00001), "+0,00001");
  assert.equal(formatDifference(-0.00001), "-0,00001");
  assert.equal(formatDifference(-0), "0,0");
});
