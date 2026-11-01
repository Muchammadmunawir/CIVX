import "./render-ui.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
const { RegionDetail } = await import("../src/components/regions/region-detail.tsx");
const { RegionSilhouette } = await import("../src/components/regions/region-silhouette.tsx");
const geometry = (await import("../data/geography/jabar-adm2-2020.json", { with: { type: "json" } })).default;
const { RegionTable } = await import("../src/components/explore/explore-browser.tsx");
const { ContextSection } = await import("../src/components/product/context-section.tsx");
const { formatRaw, formatScore } = await import("../src/components/product/format.ts");
const { getExploreRegionsProduct2023, getRegionProductView2023 } = await import("../src/lib/civx/product-2023.ts");

const render = (component, props) => renderToStaticMarkup(createElement(component, props));
const escape = value => render("span", { children: String(value) }).slice(6, -7);
const text = html => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

// Match balanced semantic elements, including nested sections and disclosures.
function elements(html, tag) {
  const stack = [];
  const result = [];
  for (const match of html.matchAll(new RegExp(`<(/?)${tag}\\b[^>]*>`, "g"))) {
    if (!match[1]) stack.push({ index: match.index, opening: match[0], start: match.index + match[0].length, depth: stack.length });
    else {
      const entry = stack.pop();
      assert.ok(entry, `Unbalanced ${tag}`);
      result.push({ ...entry, body: html.slice(entry.start, match.index) });
    }
  }
  assert.equal(stack.length, 0, `Unclosed ${tag}`);
  return result.sort((a, b) => a.index - b.index);
}

function section(html, attribute, value) {
  const found = elements(html, "section").find(element => element.opening.includes(`${attribute}="${value}"`));
  assert.ok(found, `${attribute}=${value}`);
  return found.body;
}

function contextItem(view, datasetId) {
  const item = view.context.flatMap(section => section.items).find(item => item.datasetId === datasetId);
  assert.ok(item, `${view.region.id}/${datasetId}`);
  return item;
}

function renderedContextItem(view, item) {
  const html = render(ContextSection, { sections: view.context });
  const detail = elements(html, "details").find(element =>
    element.body.match(/^<summary>([\s\S]*?)<\/summary>/)?.[1].includes(`<strong>${escape(item.title)}</strong>`));
  assert.ok(detail, `${view.region.id}/${item.datasetId}`);
  return { body: detail.body, summary: detail.body.match(/^<summary>([\s\S]*?)<\/summary>/)[1] };
}

test("Explore renders all 27 canonical BPS identities in order without numeric rank identities", () => {
  const regions = getExploreRegionsProduct2023();
  const html = render(RegionTable, { regions });
  const table = elements(html, "table");
  assert.equal(table.length, 1);
  const tbody = elements(table[0].body, "tbody")[0].body;
  const rows = elements(tbody, "tr");
  const ids = [...Array.from({ length: 18 }, (_, index) => String(3201 + index)), ...Array.from({ length: 9 }, (_, index) => String(3271 + index))];
  assert.equal(rows.length, 27);
  assert.deepEqual(rows.map(row => row.body.match(/<th\b[^>]*scope="row"[^>]*><a[^>]*href="\/regions\/(\d+)"/)[1]), ids);
  for (const [index, row] of rows.entries()) {
    const identity = elements(row.body, "th");
    assert.equal(identity.length, 1);
    assert.equal(text(identity[0].body), escape(regions[index].region.name));
    assert.ok(elements(row.body, "td").some(cell => text(cell.body) === escape(formatScore(regions[index].core.overallScore))));
    assert.doesNotMatch(row.opening, /aria-posinset|data-rank/);
  }
  const headers = elements(table[0].body, "thead")[0].body;
  assert.doesNotMatch(text(headers), /rank|peringkat|nomor|^no\.?\b/i);
});

test("RegionDetail renders six dimensions and all 18 real indicator values with source periods", () => {
  const view = getRegionProductView2023("3273");
  const html = render(RegionDetail, { id: view.region.id });
  assert.ok(elements(html, "h1")[0].body.includes(escape(view.region.name)));
  const overview = section(html, "aria-label", `${view.core.label} ${view.region.referenceYear}`);
  assert.ok(overview.includes(`${escape(formatScore(view.core.overallScore))} <small>/ 100</small>`));
  const dimensions = section(html, "aria-labelledby", `region-${view.region.id}-dimensions`);
  const widths = [...dimensions.matchAll(/style="width:([^%]+)%"/g)].map(match => Number(match[1]));
  assert.equal(widths.length, 6);
  assert.deepEqual(widths, view.core.dimensions.map(dimension => dimension.score));
  for (const dimension of view.core.dimensions) {
    assert.ok(dimensions.includes(`<span>${escape(dimension.displayName)}</span><strong>${escape(formatScore(dimension.score))}</strong>`));
  }
  const indicators = section(html, "id", `region-${view.region.id}-indicators`);
  const summaries = elements(indicators, "summary").map(element => element.body);
  const indicatorSummaries = summaries.filter(summary => view.core.indicators.some(indicator => summary.includes(`<strong>${escape(indicator.displayName)}</strong>`)));
  assert.equal(indicatorSummaries.length, 18);
  for (const [index, indicator] of view.core.indicators.entries()) {
    const summary = indicatorSummaries[index];
    assert.ok(summary.includes(`<strong>${escape(indicator.displayName)}</strong>`));
    assert.ok(summary.includes(escape(indicator.referencePeriod)));
    assert.ok(summary.includes(`<strong>${escape(formatRaw(indicator.rawValue, indicator.unit))}</strong>`));
    assert.ok(summary.includes(`<strong>${escape(formatScore(indicator.normalizedPressure))} / 100</strong>`));
  }
  assert.match(text(overview), /\b2023\b/);
});

test("invalid RegionDetail identity throws the real Next not-found boundary", () => {
  for (const id of ["unknown", "3219", " 3201", "Kabupaten Bogor"]) {
    assert.throws(() => render(RegionDetail, { id }), error => error.digest === "NEXT_HTTP_ERROR_FALLBACK;404");
  }
});

test("terminal context renders Banjar explicit zero but never fabricates zero for Cirebon or Subang gaps", () => {
  const datasetId = "context_transport_type_c_terminal_inventory_2023";
  const banjar = getRegionProductView2023("3279");
  const zero = contextItem(banjar, datasetId);
  assert.equal(zero.value, 0);
  const zeroOutput = renderedContextItem(banjar, zero);
  assert.ok(zeroOutput.summary.includes(`<strong>${escape(formatRaw(0, zero.unit))}</strong>`));
  for (const id of ["3209", "3213"]) {
    const view = getRegionProductView2023(id);
    const missing = contextItem(view, datasetId);
    const output = renderedContextItem(view, missing);
    assert.ok(output.body.includes(escape(missing.missingReason)));
    assert.ok(!output.summary.includes(`<strong>${escape(formatRaw(0, missing.unit))}</strong>`));
  }
});

test("commuter context renders five covered regions and keeps all other region shares missing", () => {
  const covered = new Set(["3201", "3216", "3271", "3275", "3276"]);
  for (const { region } of getExploreRegionsProduct2023()) {
    const view = getRegionProductView2023(region.id);
    const item = contextItem(view, "context_transport_commuter_share_jabodetabek_2023");
    const { summary, body } = renderedContextItem(view, item);
    if (covered.has(region.id)) {
      assert.ok(summary.includes(`<strong>${escape(formatRaw(item.value, item.unit))}</strong>`), region.id);
    } else {
      assert.ok(body.includes(escape(item.missingReason)), region.id);
      assert.ok(!summary.includes(`<strong>${escape(formatRaw(0, item.unit))}</strong>`), region.id);
    }
  }
});

test("site-only context renders actual observation sites and dates without a regional scalar", () => {
  const view = getRegionProductView2023("3273");
  const siteItems = view.context.flatMap(section => section.items).filter(item => item.availability === "SITE_OBSERVATIONS_ONLY");
  assert.ok(siteItems.length > 0);
  for (const item of siteItems) {
    const { summary, body } = renderedContextItem(view, item);
    assert.equal(item.value, null);
    assert.ok(body.includes(escape(item.missingReason)));
    const strongValues = elements(summary, "strong").map(element => text(element.body));
    assert.ok(strongValues.every(value => !/^[-+]?\d/.test(value)));
    const lists = elements(body, "ul").filter(element => element.opening.includes('aria-label="Observasi per lokasi dan waktu"'));
    assert.equal(lists.length, 1);
    const observations = elements(lists[0].body, "li").filter(element => element.depth === 0);
    assert.equal(observations.length, item.observations.length);
    for (const [index, observation] of item.observations.entries()) {
      assert.ok(observations[index].body.includes(`<strong>${escape(observation.siteName ?? observation.geographicLevel)}</strong>`));
      assert.ok(observations[index].body.includes(`<span>${escape(formatRaw(observation.value, observation.unit))}</span>`));
      assert.ok(observations[index].body.includes(escape(observation.period)));
      assert.ok(observations[index].body.includes(escape(observation.sourceLocator)));
    }
  }
});

test("RegionDetail keeps deterministic CORE insights and hides internal engineering metadata", () => {
  const view = getRegionProductView2023("3273");
  const html = render(RegionDetail, { id: view.region.id });
  for (const insight of view.core.insights) {
    assert.ok(html.includes(escape(insight.title)));
    assert.ok(html.includes(escape(insight.message)));
  }
  assert.doesNotMatch(html, /SHA-256|SCORED_NOT_RELEASED|INSIGHTS_NOT_RELEASED|productionIntegrationAuthorized|data\/processed\/|scoringPointer/);
  assert.equal(elements(html, "h1").length, 1);
  assert.doesNotMatch(elements(html, "nav").map(element => text(element.body)).join(" "), /tren indeks/i);
});

test("all 27 silhouettes keep the selected geometry visible inside a tight viewBox", () => {
  const [, , fullWidth, fullHeight] = geometry.viewBox.split(" ").map(Number);
  for (const shape of geometry.regions) {
    const html = render(RegionSilhouette, { regionId: shape.id, regionName: shape.name });
    const [x, y, width, height] = html.match(/viewBox="([^"]+)"/)[1].split(" ").map(Number);
    assert.ok([x, y, width, height].every(Number.isFinite), shape.id);
    assert.ok(width > 0 && width < fullWidth && height > 0 && height < fullHeight, shape.id);
    const renderedPath = html.match(/<path d="([^"]+)"/)[1];
    const points = renderedPath.replace(/[MLZ]/g, " ").trim().split(/\s+/).map(Number);
    for (let index = 0; index < points.length; index += 2) {
      assert.ok(points[index] >= x && points[index] <= x + width, `${shape.id} x`);
      assert.ok(points[index + 1] >= y && points[index + 1] <= y + height, `${shape.id} y`);
    }
    assert.match(html, /aria-hidden="true"/);
  }
  const missing = render(RegionSilhouette, { regionId: "unknown", regionName: "Tidak dikenal" });
  assert.doesNotMatch(missing, /<svg/);
  assert.match(text(missing), /Bentuk wilayah belum tersedia/);
});
