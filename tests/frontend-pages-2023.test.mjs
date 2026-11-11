import "./render-ui.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime.js";
import { SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime.js";
const { LandingPage } = await import("../src/components/landing/landing-page.tsx");
const { ExploreBrowser } = await import("../src/components/explore/explore-browser.tsx");
const { ExplorePage } = await import("../src/components/explore/explore-page.tsx");
const { WestJavaMap } = await import("../src/components/explore/west-java-map.tsx");
const { MethodologyPage } = await import("../src/components/methodology/methodology-page.tsx");
const { SourcesPage } = await import("../src/components/sources/sources-page.tsx");
const { getExploreRegionsProduct2023, getRegionProductView2023 } = await import("../src/lib/civx/product-2023.ts");
const { formatScore } = await import("../src/components/product/format.ts");

const regions = getExploreRegionsProduct2023();
// Server rendering does not navigate; the real map still requires its router context.
const render = (Component, props, query = null) => renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: {} },
  createElement(SearchParamsContext.Provider, { value: query }, createElement(Component, props))));
const text = html => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const escape = value => renderToStaticMarkup(createElement("span", null, String(value))).slice(6, -7);
const tableIds = html => [...html.matchAll(/<th scope="row"><a href="\/regions\/(\d+)"/g)].map(match => match[1]);
const visibleMapIds = html => [...html.matchAll(/<a[^>]*href="\/regions\/(\d+)"[^>]*data-visible="true"/g)].map(match => match[1]);

test("Explore paginates only canonical table rows while map retains all 27 filtered identities", () => {
  const html = render(ExploreBrowser, { regions });
  assert.deepEqual(tableIds(html), regions.slice(0, 9).map(view => view.region.id));
  assert.deepEqual(visibleMapIds(html), regions.map(view => view.region.id));
  assert.match(html, /aria-label="Halaman 1" aria-current="page"/);
  assert.match(text(html), /1–9 dari 27/);
  assert.doesNotMatch(html, /aria-sort|data-rank|name="sort"/);
});

test("Explore initial query filters map and table together and preserves empty-result recovery", () => {
  const html = render(ExploreBrowser, { regions, initialState: { q: " bAnDuNg ", type: "all", layer: "" } });
  const expected = regions.filter(view => view.region.name.toLowerCase().includes("bandung")).map(view => view.region.id);
  assert.deepEqual(tableIds(html), expected);
  assert.deepEqual(visibleMapIds(html), expected);
  const empty = render(ExploreBrowser, { regions, initialState: { q: "wilayah-tidak-ada", type: "all", layer: "" } });
  assert.deepEqual(tableIds(empty), []);
  assert.deepEqual(visibleMapIds(empty), []);
  assert.match(text(empty), /Tidak ada wilayah yang cocok/);
});

test("Explore server entry combines query, type and layer without changing map/table identities", () => {
  const html = render(ExplorePage, { initialQuery: { q: "bandung", type: "kota", layer: "education" } });
  const expected = regions.filter(view => view.region.type === "kota" && view.region.name.toLowerCase().includes("bandung"));
  assert.deepEqual(tableIds(html), expected.map(view => view.region.id));
  assert.deepEqual(visibleMapIds(html), expected.map(view => view.region.id));
  const links = mapLinks(html);
  for (const [index, link] of links.entries()) {
    const score = regions[index].core.dimensions.find(dimension => dimension.dimensionId === "education").score;
    assert.ok(link.attributes.includes(`style="--map-pressure:${score}%"`));
  }
});

test("Explore consumes current router URL instead of stale initial filters", () => {
  const html = render(ExploreBrowser, {
    regions,
    initialState: { q: "bogor", type: "kabupaten", layer: "" },
  }, new URLSearchParams("q=bandung&type=kota&layer=education"));
  const expected = regions.filter(view => view.region.type === "kota" && view.region.name.toLowerCase().includes("bandung"));
  assert.deepEqual(tableIds(html), expected.map(view => view.region.id));
  assert.deepEqual(visibleMapIds(html), expected.map(view => view.region.id));
  assert.ok(mapLinks(html).every(link => link.attributes.includes('data-layer="dimension"')));
});

const mapLinks = html => [...html.match(/<svg\b[^>]*role="group"[^>]*>([\s\S]*?)<\/svg>/)[1].matchAll(/<a\b([^>]*href="\/regions\/(\d+)"[^>]*)>([\s\S]*?)<\/a>/g)]
  .filter(match => match[3].includes("<path "))
  .map(match => ({ id: match[2], attributes: match[1], body: match[3] }));

for (const dimension of regions[0].core.dimensions) {
  test(`map ${dimension.dimensionId} uses fixed facade scores for all 27 regions, including scale endpoints`, () => {
    const html = render(WestJavaMap, { regions, dimensionId: dimension.dimensionId });
    const links = mapLinks(html);
    assert.deepEqual(links.map(link => link.id), regions.map(view => view.region.id));
    for (const [index, link] of links.entries()) {
      const view = regions[index];
      const score = view.core.dimensions.find(item => item.dimensionId === dimension.dimensionId).score;
      assert.ok(link.attributes.includes(`style="--map-pressure:${score}%"`), view.region.id);
      assert.ok(link.attributes.includes('data-unavailable="false"'), view.region.id);
      assert.ok(link.attributes.includes(`${escape(dimension.displayName)} 2023 ${escape(formatScore(score))} dari 100`), view.region.id);
      assert.ok(link.body.includes(`${escape(dimension.displayName)} 2023 ${escape(formatScore(score))} dari 100`), view.region.id);
    }
    const summary = html.match(/<aside\b[^>]*>([\s\S]*?)<\/aside>/)[1];
    assert.ok(summary.includes(`${escape(formatScore(regions[0].core.dimensions.find(item => item.dimensionId === dimension.dimensionId).score))} <small>/ 100</small>`));
  });
}

test("map filtering keeps the full-cohort color scale and removes excluded regions from keyboard navigation", () => {
  const dimensionId = "education";
  const full = mapLinks(render(WestJavaMap, { regions, dimensionId }));
  const selected = regions.find(view => view.region.id === "3273");
  const html = render(WestJavaMap, { regions, dimensionId, visibleIds: [selected.region.id] });
  const filtered = mapLinks(html);
  for (const link of filtered) {
    assert.equal(link.attributes.match(/style="([^"]+)"/)[1], full.find(item => item.id === link.id).attributes.match(/style="([^"]+)"/)[1]);
    if (link.id === selected.region.id) {
      assert.match(link.attributes, /data-visible="true"/);
      assert.match(link.attributes, /tabindex="0" aria-hidden="false"/);
    } else {
      assert.match(link.attributes, /data-visible="false"/);
      assert.match(link.attributes, /tabindex="-1" aria-hidden="true"/);
    }
  }
  const summary = html.match(/<aside\b[^>]*>([\s\S]*?)<\/aside>/)[1];
  assert.ok(summary.includes(`<h3>${escape(selected.region.name)}</h3>`));
  const score = selected.core.dimensions.find(item => item.dimensionId === dimensionId).score;
  assert.ok(summary.includes(`${escape(formatScore(score))} <small>/ 100</small>`));
  const empty = render(WestJavaMap, { regions, dimensionId, visibleIds: [] });
  assert.ok(mapLinks(empty).every(link => link.attributes.includes('tabindex="-1" aria-hidden="true"')));
  assert.match(empty, /<select[^>]*disabled=""/);
  assert.doesNotMatch(empty, /<h3>/);
});

test("Home and Explore default maps encode the same full-precision overall pressure without refitting filters", () => {
  const home = mapLinks(render(LandingPage));
  const explore = mapLinks(render(ExploreBrowser, { regions }));
  const selected = regions.find(view => view.region.id === "3273");
  const filtered = mapLinks(render(WestJavaMap, { regions, visibleIds: [selected.region.id] }));
  for (const links of [home, explore, filtered]) {
    assert.deepEqual(links.map(link => link.id), regions.map(view => view.region.id));
    for (const [index, link] of links.entries()) {
      const score = regions[index].core.overallScore;
      assert.ok(link.attributes.includes('data-layer="overall"'));
      assert.ok(link.attributes.includes(`style="--map-pressure:${score}%"`), link.id);
      assert.ok(link.attributes.includes(`2023 ${escape(formatScore(score))} dari 100`), link.id);
    }
  }
});

test("map distinguishes an unavailable dimension from a recorded zero without substituting the overall score", () => {
  const dimensionId = "disaster_pressure";
  const zero = regions.find(view => view.core.dimensions.find(item => item.dimensionId === dimensionId).score === 0);
  const missing = regions.find(view => view.region.id !== zero.region.id && view.region.id !== regions[0].region.id);
  // Presentation-only missing-score fixture; production facade data stays complete and frozen.
  const fixture = regions.map(view => view === missing ? {
    ...view,
    core: { ...view.core, dimensions: view.core.dimensions.filter(item => item.dimensionId !== dimensionId) },
  } : view);
  const html = render(WestJavaMap, { regions: fixture, dimensionId, visibleIds: [zero.region.id, missing.region.id] });
  const links = mapLinks(html);
  const zeroLink = links.find(link => link.id === zero.region.id);
  const missingLink = links.find(link => link.id === missing.region.id);
  assert.ok(zeroLink.attributes.includes('style="--map-pressure:0%"'));
  assert.ok(zeroLink.attributes.includes('data-unavailable="false"'));
  assert.ok(zeroLink.attributes.includes(`${escape(formatScore(0))} dari 100`));
  assert.ok(missingLink.attributes.includes('data-unavailable="true"'));
  assert.doesNotMatch(missingLink.attributes, /--map-pressure/);
  assert.ok(missingLink.attributes.includes("tidak tersedia"));
  assert.doesNotMatch(missingLink.attributes, /dari 100/);
  const inspected = render(WestJavaMap, { regions: fixture, dimensionId, visibleIds: [missing.region.id] });
  const summary = inspected.match(/<aside\b[^>]*>([\s\S]*?)<\/aside>/)[1];
  assert.ok(text(summary).includes("Tidak tersedia"));
  assert.doesNotMatch(summary, /<small>\/ 100<\/small>/);
});


test("Methodology shows all six dimensions, 18 indicators, exact weights and both direction formulas", () => {
  const html = render(MethodologyPage);
  const table = html.match(/<tbody>([\s\S]*?)<\/tbody>/)[1];
  const profile = getRegionProductView2023("3273");
  assert.equal((table.match(/<tr>/g) ?? []).length, 6);
  assert.equal((table.match(/<li>/g) ?? []).length, 18);
  assert.equal((text(table).match(/1\/6/g) ?? []).length, 6);
  for (const indicator of profile.core.indicators) assert.ok(table.includes(escape(indicator.displayName)));
  assert.ok(text(html).includes("s = 100 × ((x − a) / (b − a))"));
  assert.ok(text(html).includes("s = 100 × ((b − x) / (b − a))"));
  assert.doesNotMatch(text(html), /25%|empat dimensi|4 dimensi|SCORED_NOT_RELEASED|INSIGHTS_NOT_RELEASED/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});

test("Sources retains 18 CORE and seven CONTEXT records with original publisher links", () => {
  const html = render(SourcesPage);
  const profile = getRegionProductView2023("3273");
  const core = profile.core.indicators;
  const context = profile.context.flatMap(section => section.items);
  const cards = [...html.matchAll(/<article\b[^>]*id="source-([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(cards, [...core.map(item => item.indicatorId), ...context.map(item => item.datasetId)]);
  assert.equal(cards.length, 25);
  for (const item of core) assert.ok(html.includes(`href="${escape(item.disclosure.source.url)}"`));
  for (const item of context) for (const source of item.sources) assert.ok(html.includes(`href="${escape(source.url)}"`));
  assert.doesNotMatch(html, /SCORED_NOT_RELEASED|INSIGHTS_NOT_RELEASED|productionIntegrationAuthorized|data\/processed\//);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});
