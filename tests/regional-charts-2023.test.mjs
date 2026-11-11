import "./render-ui.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Register the TSX/CSS loader before loading the real components and their imports.
const { SimilarPressureChart, CohortPressureChart } = await import("../src/components/charts/regional-profile-charts.tsx");
const { similarPressureData2023, cohortPressureData2023, PRESSURE_DIMENSIONS_2023 } = await import("../src/lib/civx/visualization-2023.ts");
const { getExploreRegionsProduct2023 } = await import("../src/lib/civx/product-2023.ts");
const { getSimilarRegions2023 } = await import("../src/lib/civx/similar-regions-2023.ts");
const { formatScore } = await import("../src/components/product/format.ts");

const regions = getExploreRegionsProduct2023();
const render = (Component, data) => renderToStaticMarkup(createElement(Component, { data }));
const escape = value => renderToStaticMarkup(createElement("span", null, String(value))).slice(6, -7);
const text = html => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const exactValues = html => [...html.matchAll(/<data\b[^>]*value="([^"]+)"[^>]*>([\s\S]*?)<\/data>/g)].map(match => ({ value: Number(match[1]), label: text(match[2]) }));
const markers = html => [...html.matchAll(/<span\b([^>]*data-region-id="([^"]+)"[^>]*)>/g)].map(match => ({
  id: match[2],
  score: Number(match[1].match(/data-score="([^"]+)"/)[1]),
  slot: match[1].match(/data-series="([^"]+)"/)[1],
  selected: match[1].includes('data-selected="true"'),
  attributes: match[1],
}));
function plotRows(html) {
  const graph = html.split("<details")[0];
  const starts = [...graph.matchAll(/<div\b[^>]*data-dimension-id="([^"]+)"[^>]*>/g)];
  return starts.map((match, index) => ({ id: match[1], attributes: match[0], html: graph.slice(match.index, starts[index + 1]?.index ?? graph.length) }));
}
function tableRows(html) {
  const body = html.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1];
  assert.ok(body, "A semantic table must expose every supplied value");
  return [...body.matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/g)].map(match => ({
    dimensionId: match[1].match(/data-dimension-id="([^"]+)"/)[1],
    regionId: match[1].match(/data-region-id="([^"]+)"/)[1],
    html: match[2],
  }));
}

for (const selectedId of ["3273"]) {
  for (const peerCount of [0, 1, 3]) {
    test(`similar profile ${selectedId} preserves six dimensions and ${peerCount} existing peers`, () => {
      const selected = regions.find(view => view.region.id === selectedId);
      const peers = getSimilarRegions2023(selectedId).slice(0, peerCount);
      const data = similarPressureData2023(selected, peers);
      const html = render(SimilarPressureChart, data);
      const rows = plotRows(html);
      assert.deepEqual(rows.map(row => row.id), PRESSURE_DIMENSIONS_2023.map(dimension => dimension.id));
      const buttons = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
      assert.equal(buttons.length, data.series.length);
      const valuesId = buttons[0][1].match(/aria-controls="([^"]+)"/)[1];
      assert.ok(html.includes(`id="${valuesId}"`));
      for (const [index, button] of buttons.entries()) {
        const series = data.series[index];
        assert.ok(button[1].includes(`aria-label="${escape(series.region.name)}"`));
        assert.ok(button[1].includes(`aria-pressed="${index === 0}"`));
        assert.ok(button[1].includes('type="button"'));
        assert.ok(button[2].includes(`data-series="${series.slot}"`));
        assert.ok(button[2].includes(escape(series.region.name)));
      }
      for (const [index, row] of rows.entries()) {
        const dimension = data.dimensions[index];
        assert.ok(row.html.includes(escape(dimension.label)));
        assert.deepEqual(markers(row.html).map(point => [point.id, point.score, point.slot, point.selected]), data.series.map((series, seriesIndex) => [series.region.id, dimension.scores[seriesIndex], series.slot, seriesIndex === 0]));
        assert.deepEqual(exactValues(row.html), [{ value: dimension.scores[0], label: escape(formatScore(dimension.scores[0])) }]);
        assert.ok(row.html.includes(`${escape(selected.region.name)}, ${escape(dimension.label)}: ${escape(formatScore(dimension.scores[0]))} dari 100`));
      }
      const equivalent = tableRows(html);
      assert.equal(equivalent.length, data.series.length * 6);
      for (const [dimensionIndex, dimension] of data.dimensions.entries()) {
        for (const [seriesIndex, series] of data.series.entries()) {
          const row = equivalent[dimensionIndex * data.series.length + seriesIndex];
          assert.equal(row.dimensionId, dimension.id);
          assert.equal(row.regionId, series.region.id);
          assert.ok(row.html.includes(`<th scope="row">${escape(dimension.label)}</th>`));
          assert.ok(row.html.includes(escape(series.region.name)));
          assert.deepEqual(exactValues(row.html), [{ value: dimension.scores[seriesIndex], label: escape(formatScore(dimension.scores[seriesIndex])) }]);
        }
      }
      assert.match(html, /<details\b[^>]*><summary>/);
      assert.doesNotMatch(html, /<details\b[^>]*\bopen=/);
      assert.doesNotMatch(html, /<h2|<section|data-rank/);
    });
  }
}

for (const selectedId of ["3273"]) {
  test(`cohort ${selectedId} draws every exact point and supplied median with selected point last`, () => {
    const data = cohortPressureData2023(regions, selectedId);
    const html = render(CohortPressureChart, data);
    const rows = plotRows(html);
    assert.deepEqual(rows.map(row => row.id), PRESSURE_DIMENSIONS_2023.map(dimension => dimension.id));
    for (const [index, row] of rows.entries()) {
      const dimension = data.dimensions[index];
      const points = markers(row.html);
      assert.equal(points.length, 27);
      assert.equal(new Set(points.map(point => point.id)).size, 27);
      assert.deepEqual(points.map(point => point.id), [...dimension.points.filter(point => point.region.id !== selectedId), ...dimension.points.filter(point => point.region.id === selectedId)].map(point => point.region.id));
      assert.equal(points.at(-1).id, selectedId);
      assert.equal(points.at(-1).selected, true);
      assert.equal(points.at(-1).slot, "a");
      assert.equal(points.filter(point => point.selected).length, 1);
      for (const point of points) {
        const supplied = dimension.points.find(candidate => candidate.region.id === point.id);
        assert.equal(point.score, supplied.score);
        assert.ok(point.attributes.includes(`left:${supplied.score}%`));
        assert.doesNotMatch(point.attributes, /tabindex|role="button"/);
      }
      assert.ok(row.html.includes(`data-median="${dimension.median}"`));
      assert.deepEqual(exactValues(row.html), [
        { value: dimension.selectedScore, label: escape(formatScore(dimension.selectedScore)) },
        { value: dimension.median, label: escape(formatScore(dimension.median)) },
      ]);
      assert.ok(row.attributes.includes('role="group"'));
      assert.ok(row.attributes.includes('tabindex="0"'));
      for (const attribute of ["aria-labelledby", "aria-describedby"]) {
        const id = row.attributes.match(new RegExp(`${attribute}="([^"]+)"`))[1];
        assert.ok(row.html.includes(`id="${id}"`));
      }
      assert.ok(row.html.includes(escape(data.selected.name)));
      assert.ok(row.html.includes(escape(dimension.label)));
    }
    const equivalent = tableRows(html);
    assert.equal(equivalent.length, 27 * 6);
    for (const [dimensionIndex, dimension] of data.dimensions.entries()) {
      for (const [pointIndex, point] of dimension.points.entries()) {
        const row = equivalent[dimensionIndex * 27 + pointIndex];
        assert.equal(row.dimensionId, dimension.id);
        assert.equal(row.regionId, point.region.id);
        assert.ok(row.html.includes(escape(dimension.label)));
        assert.ok(row.html.includes(escape(point.region.name)));
        assert.deepEqual(exactValues(row.html), [{ value: point.score, label: escape(formatScore(point.score)) }]);
      }
    }
    assert.equal([...html.matchAll(/tabindex="0"/g)].length, 6);
    assert.doesNotMatch(html, /<button|data-rank|<details\b[^>]*\bopen=/);
    const titleId = html.match(/<section\b[^>]*aria-labelledby="([^"]+)"/)[1];
    assert.ok(html.includes(`<h2 class="product-section-title" id="${titleId}">`));
  });
}

test("cohort captions distinguish exact equality from differences hidden by display rounding", () => {
  const base = cohortPressureData2023(regions, "3273");
  // Synthetic values test consumer fidelity only; these are not production observations.
  const scores = [50.00001, 49.99999, 50, 0, 100, 50];
  const medians = [50, 50, 50, 0, 100, 33.123456789];
  const data = { ...base, dimensions: base.dimensions.map((dimension, index) => ({
    ...dimension,
    selectedScore: scores[index],
    median: medians[index],
    points: dimension.points.map(point => point.region.id === base.selected.id ? { ...point, score: scores[index] } : point),
  })) };
  const rows = plotRows(render(CohortPressureChart, data));
  assert.equal(formatScore(scores[0]), formatScore(medians[0]));
  assert.equal(formatScore(scores[1]), formatScore(medians[1]));
  assert.match(text(rows[0].html), /Di atas median kohort/);
  assert.match(text(rows[1].html), /Di bawah median kohort/);
  for (const index of [2, 3, 4]) assert.match(text(rows[index].html), /Sama dengan median kohort/);
  assert.match(text(rows[5].html), /Di atas median kohort/);
  for (const [index, row] of rows.entries()) {
    assert.deepEqual(exactValues(row.html).map(item => item.value), [scores[index], medians[index]]);
    assert.equal(markers(row.html).at(-1).score, scores[index]);
  }
});

test("similar profile consumes supplied score precision without rounding plot positions", () => {
  const selected = regions.find(view => view.region.id === "3273");
  const base = similarPressureData2023(selected, getSimilarRegions2023(selected.region.id));
  // Synthetic endpoints and near-equality exercise rendering, not source/scoring logic.
  const values = [0, 100, 50.000001, 50];
  const data = { ...base, dimensions: base.dimensions.map(dimension => ({ ...dimension, scores: values })) };
  const html = render(SimilarPressureChart, data);
  for (const row of plotRows(html)) {
    assert.deepEqual(markers(row.html).map(point => point.score), values);
    for (const point of markers(row.html)) assert.ok(point.attributes.includes(`left:${point.score}%`));
  }
  assert.deepEqual(tableRows(html).map(row => exactValues(row.html)[0].value), data.dimensions.flatMap(() => values));
});
