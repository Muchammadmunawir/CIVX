import "./render-ui.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readExploreUrlState, updateExploreUrl } from "../src/components/explore/explore-url-state.ts";
import { getExploreRegionsProduct2023 } from "../src/lib/civx/product-2023.ts";

const layerIds = getExploreRegionsProduct2023()[0].core.dimensions.map(dimension => dimension.dimensionId);
const defaults = { q: "", type: "all", layer: "" };
const origin = "https://civx.example";
const read = href => readExploreUrlState(new URL(href, origin).searchParams, layerIds);

test("Explore accepts all current facade layers and both region types on direct entry", () => {
  for (const layer of ["", ...layerIds]) {
    for (const type of ["all", "kabupaten", "kota"]) {
      const query = { q: " bAnDuNg ", type, layer };
      assert.deepEqual(readExploreUrlState(query, layerIds), query);
      assert.deepEqual(readExploreUrlState(new URLSearchParams(query), layerIds), query);
    }
  }
});

test("Explore rejects unknown, wrong-case and repeated URL values without choosing a dataset", () => {
  for (const query of [
    "type=province&layer=context&q=%20%20",
    "type=Kota&layer=Education",
    "q=bandung&q=bogor&type=kota&type=kabupaten&layer=education&layer=education",
  ]) {
    const parameters = new URLSearchParams(query);
    assert.deepEqual(readExploreUrlState(parameters, layerIds), defaults);
    const serverQuery = Object.fromEntries([...new Set(parameters.keys())].map(key => {
      const values = parameters.getAll(key);
      return [key, values.length === 1 ? values[0] : values];
    }));
    assert.deepEqual(readExploreUrlState(serverQuery, layerIds), defaults);
  }
  assert.deepEqual(readExploreUrlState({}, layerIds), defaults);
});

test("Explore URL edits preserve unrelated repeated params, route and fragment", () => {
  const href = `${origin}/explore?campaign=home&campaign=education&year=2023#region-results`;
  const updated = updateExploreUrl(href, { q: "Kota Bandung & Bogor", type: "kota", layer: "education" }, layerIds);
  const parsed = new URL(updated, origin);
  assert.equal(parsed.pathname, "/explore");
  assert.equal(parsed.hash, "#region-results");
  assert.deepEqual(parsed.searchParams.getAll("campaign"), ["home", "education"]);
  assert.equal(parsed.searchParams.get("year"), "2023");
  assert.deepEqual(read(updated), { q: "Kota Bandung & Bogor", type: "kota", layer: "education" });
  assert.equal(parsed.searchParams.getAll("q").length, 1);
});

test("Explore filter reset removes only search/type and retains the current map layer", () => {
  const href = `${origin}/explore?q=bandung&type=kota&layer=education&campaign=home#region-results`;
  const reset = updateExploreUrl(href, { q: "", type: "all" }, layerIds);
  const parsed = new URL(reset, origin);
  assert.equal(parsed.searchParams.has("q"), false);
  assert.equal(parsed.searchParams.has("type"), false);
  assert.equal(parsed.searchParams.get("layer"), "education");
  assert.equal(parsed.searchParams.get("campaign"), "home");
  assert.equal(parsed.hash, "#region-results");
  assert.deepEqual(read(reset), { ...defaults, layer: "education" });
  const overall = updateExploreUrl(parsed.href, { layer: "" }, layerIds);
  assert.equal(new URL(overall, origin).searchParams.has("layer"), false);
});

test("Explore search and layer changes keep each other's state through reloadable URLs", () => {
  const start = `${origin}/explore?type=kabupaten&layer=education`;
  const searched = updateExploreUrl(start, { q: "Bogor" }, layerIds);
  assert.deepEqual(read(searched), { q: "Bogor", type: "kabupaten", layer: "education" });
  const switched = updateExploreUrl(new URL(searched, origin).href, { layer: layerIds.find(id => id !== "education") }, layerIds);
  assert.deepEqual(read(switched), { q: "Bogor", type: "kabupaten", layer: layerIds.find(id => id !== "education") });
  assert.deepEqual(read(searched), { q: "Bogor", type: "kabupaten", layer: "education" });
  assert.deepEqual(read(start), { ...defaults, type: "kabupaten", layer: "education" });
});
