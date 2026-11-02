import "./render-ui.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime.js";
const { LandingPage } = await import("../src/components/landing/landing-page.tsx");
const { ExploreBrowser } = await import("../src/components/explore/explore-browser.tsx");
const { MethodologyPage } = await import("../src/components/methodology/methodology-page.tsx");
const { SourcesPage } = await import("../src/components/sources/sources-page.tsx");
const { getExploreRegionsProduct2023, getRegionProductView2023 } = await import("../src/lib/civx/product-2023.ts");

const regions = getExploreRegionsProduct2023();
// Server rendering does not navigate; the real map still requires its router context.
const render = (Component, props) => renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: {} }, createElement(Component, props)));
const text = html => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const escape = value => renderToStaticMarkup(createElement("span", null, String(value))).slice(6, -7);
const tableIds = html => [...html.matchAll(/<th scope="row"><a href="\/regions\/(\d+)"/g)].map(match => match[1]);
const visibleMapIds = html => [...html.matchAll(/<a[^>]*href="\/regions\/(\d+)"[^>]*data-visible="true"/g)].map(match => match[1]);

test("Home shows province average, lowest/highest pressure regions with shapes, and the linked map", () => {
  const html = render(LandingPage);
  const summary = html.split('aria-labelledby="home-title"')[1].split("</section>")[0];
  const sorted = [...regions].sort((a, b) => a.core.overallScore - b.core.overallScore);
  const best = sorted[0], priority = sorted[sorted.length - 1];
  const fmt = value => new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
  const avgIndex = 100 - regions.reduce((sum, view) => sum + view.core.overallScore, 0) / regions.length;
  assert.match(text(summary), new RegExp(`Rata-rata Indeks Provinsi ${fmt(avgIndex)} / 100`));
  assert.match(text(summary), new RegExp(`Wilayah Performa Terbaik ${escape(best.region.name)} ${fmt(100 - best.core.overallScore)}`));
  assert.match(text(summary), new RegExp(`Wilayah Butuh Prioritas ${escape(priority.region.name)} ${fmt(100 - priority.core.overallScore)}`));
  assert.match(summary, new RegExp(`href="/regions/${best.region.id}"`));
  assert.match(summary, new RegExp(`href="/regions/${priority.region.id}"`));
  assert.equal((summary.match(/<svg\b/g) ?? []).length, 2);
  assert.equal(visibleMapIds(html).length, 27);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});

// Descriptive cohort order: lowest pressure (highest index) first, ties keep BPS order.
const rankedIds = list => list.map((view, order) => ({ view, order }))
  .sort((a, b) => a.view.core.overallScore - b.view.core.overallScore || a.order - b.order)
  .map(({ view }) => view.region.id);

test("Explore paginates ranked table rows by eight while the map retains all 27 filtered identities", () => {
  const html = render(ExploreBrowser, { regions });
  assert.deepEqual(tableIds(html), rankedIds(regions).slice(0, 8));
  assert.deepEqual(visibleMapIds(html), regions.map(view => view.region.id));
  assert.match(html, /aria-label="Halaman 1" aria-current="page"/);
  assert.equal((html.match(/aria-label="Halaman \d+"/g) ?? []).length, 4);
  assert.match(text(html), /1–8 dari 27/);
  assert.match(html, /aria-sort="descending"/);
  const headers = text(html.match(/<thead>([\s\S]*?)<\/thead>/)[1]);
  assert.equal(headers, "Peringkat Wilayah Jenis Indeks ↓ Status Keterangan Aksi");
  const firstRow = html.match(/<tbody>[\s\S]*?<tr>([\s\S]*?)<\/tr>/)[1];
  assert.match(text(firstRow), /^01 /);
  assert.match(text(html), /bukan peringkat resmi/);
});

test("Explore initial query filters map and table together and preserves empty-result recovery", () => {
  const html = render(ExploreBrowser, { regions, initialSearch: " bAnDuNg " });
  const matching = regions.filter(view => view.region.name.toLowerCase().includes("bandung"));
  assert.deepEqual(tableIds(html), rankedIds(matching));
  assert.deepEqual(visibleMapIds(html), matching.map(view => view.region.id));
  const empty = render(ExploreBrowser, { regions, initialSearch: "wilayah-tidak-ada" });
  assert.deepEqual(tableIds(empty), []);
  assert.deepEqual(visibleMapIds(empty), []);
  assert.match(text(empty), /Tidak ada wilayah yang cocok/);
  assert.match(text(empty), /Atur ulang pencarian/);
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
