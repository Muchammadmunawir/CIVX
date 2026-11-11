import "./render-ui.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime.js";

const { RegionDetail } = await import("../src/components/regions/region-detail.tsx");
const { ComparisonPage } = await import("../src/components/compare/comparison-page.tsx");
const { selectComparison } = await import("../src/components/compare/comparison-selection.ts");
const { getSimilarRegions2023 } = await import("../src/lib/civx/similar-regions-2023.ts");
const { getExploreRegionsProduct2023 } = await import("../src/lib/civx/product-2023.ts");
const regions = getExploreRegionsProduct2023();
const render = (Component, props) => renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: {} }, createElement(Component, props)));
const escape = value => renderToStaticMarkup(createElement("span", null, String(value))).slice(6, -7);

for (const selectedId of ["3201", "3273", "3279"]) {
  test(`Region Detail ${selectedId} renders nearest-peer links that resolve through existing Compare pair semantics`, () => {
    const html = render(RegionDetail, { id: selectedId });
    const section = html.split(`aria-labelledby="region-${selectedId}-similar-title"`)[1]?.split("</section>")[0];
    assert.ok(section, "Region Detail must render its peer section");
    const peers = getSimilarRegions2023(selectedId);
    const links = [...section.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)]
      .map(match => new URL(match[1].replaceAll("&amp;", "&"), "https://civx.test"))
      .filter(url => url.pathname === "/compare");
    assert.equal(links.length, 3);
    assert.deepEqual(links.map(url => [url.searchParams.get("a"), url.searchParams.get("b")]), peers.map(peer => [selectedId, peer.region.id]));
    assert.deepEqual([...section.matchAll(/style="width:([^"]+)"/g)].map(match => match[1]), peers.flatMap(peer => peer.dimensions.map(dimension => `${dimension.score}%`)));
    for (const [index, url] of links.entries()) {
      const candidateId = peers[index].region.id;
      assert.ok(section.includes(`<h3>${escape(peers[index].region.name)}</h3>`));
      const selection = selectComparison(url.searchParams.get("a"), url.searchParams.get("b"));
      assert.equal(selection.error, undefined);
      assert.equal(selection.comparison.regionA.id, selectedId);
      assert.equal(selection.comparison.regionB.id, candidateId);
      const comparison = render(ComparisonPage, { regions, ...selection });
      for (const [side, id] of [["a", selectedId], ["b", candidateId]]) {
        const control = comparison.match(new RegExp(`<select[^>]*name="${side}"[^>]*>([\\s\\S]*?)</select>`))?.[1];
        assert.ok(control);
        assert.equal(control.match(/<option value="([^"]*)"[^>]*selected=""/)?.[1], id);
      }
    }
  });
}

