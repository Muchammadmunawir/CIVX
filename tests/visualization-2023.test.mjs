import test from "node:test";
import assert from "node:assert/strict";
import { comparisonPressureData2023, similarPressureData2023, cohortPressureData2023 } from "../src/lib/civx/visualization-2023.ts";
import { getComparisonProductView2023, getExploreRegionsProduct2023 } from "../src/lib/civx/product-2023.ts";
import { getSimilarRegions2023 } from "../src/lib/civx/similar-regions-2023.ts";

const cohort = getExploreRegionsProduct2023();
const dimensionIds = ["socioeconomic", "education", "basic_services", "public_health", "disaster_pressure", "environment"];

for (const pair of [["3201", "3273"], ["3273", "3201"], ["3273", "3273"]]) {
  test(`comparison chart projection preserves full-precision dimension and normalized-indicator values for ${pair.join("/")}`, () => {
    const view = getComparisonProductView2023(...pair);
    const before = JSON.stringify(view);
    const result = comparisonPressureData2023(view);
    assert.deepEqual(result.dimensions.map(row => row.id), dimensionIds);
    assert.deepEqual(result.indicators.map(row => row.id), view.core.indicators.map(row => row.indicatorId));
    for (const [projected, original] of [[result.dimensions, view.core.dimensions], [result.indicators, view.core.indicators]]) {
      for (const [index, row] of projected.entries()) {
        const source = original[index];
        assert.equal(row.scoreA, source.regionAScore ?? source.normalizedPressureA);
        assert.equal(row.scoreB, source.regionBScore ?? source.normalizedPressureB);
        assert.equal(row.delta, source.delta);
        assert.equal(row.absoluteDifference, source.absoluteDifference);
        assert.equal(row.relation, source.relation);
      }
    }
    assert.equal(JSON.stringify(view), before);
    assert.equal("context" in result, false);
    assert.ok(result.indicators.every(row => !("rawValueA" in row) && !("rawValueB" in row)));
  });
}

test("chart projections canonicalize shuffled six-dimension and 18-indicator input without mutating it", () => {
  const view = structuredClone(getComparisonProductView2023("3201", "3273"));
  const expected = comparisonPressureData2023(view);
  view.core.dimensions.reverse();
  view.core.indicators.reverse();
  const before = JSON.stringify(view);
  assert.deepEqual(comparisonPressureData2023(view), expected);
  assert.equal(JSON.stringify(view), before);
});

test("comparison projection rejects missing, duplicate, nonfinite, out-of-scale or inconsistent CORE records", () => {
  const original = getComparisonProductView2023("3201", "3273");
  for (const change of [
    view => view.core.dimensions.pop(),
    view => view.core.dimensions[1] = view.core.dimensions[0],
    view => view.core.dimensions[0].regionAScore = NaN,
    view => view.core.dimensions[0].regionBScore = null,
    view => view.core.dimensions[0].regionAScore = 101,
    view => view.core.dimensions[0].delta = Infinity,
    view => view.core.dimensions[0].absoluteDifference = 99,
    view => view.core.dimensions[0].relation = "EQUAL",
    view => view.core.indicators.pop(),
    view => view.core.indicators[0].normalizedPressureB = undefined,
    view => view.core.indicators[0].dimensionId = "education",
    view => view.core.metadata.indicatorDifferenceMetric = "raw_value",
    view => view.core.metadata.cohortSize = 26,
    view => view.regionA.id = "9999",
  ]) {
    const fixture = structuredClone(original);
    change(fixture);
    assert.throws(() => comparisonPressureData2023(fixture), Error);
  }
});

test("raw indicator values do not enter the normalized-pressure chart contract", () => {
  const original = getComparisonProductView2023("3201", "3273");
  const fixture = structuredClone(original);
  for (const indicator of fixture.core.indicators) {
    Object.defineProperty(indicator, "rawValueA", { get() { throw new Error("Raw observations are not chart differences"); } });
    Object.defineProperty(indicator, "rawValueB", { get() { throw new Error("Raw observations are not chart differences"); } });
  }
  assert.deepEqual(comparisonPressureData2023(fixture), comparisonPressureData2023(original));
});

for (const selectedId of ["3201", "3273", "3279"]) {
  test(`similar-profile chart retains selected/peer identities, exact distances and six values for ${selectedId}`, () => {
    const selected = cohort.find(view => view.region.id === selectedId);
    const peers = getSimilarRegions2023(selectedId);
    const before = JSON.stringify({ selected, peers });
    const result = similarPressureData2023(selected, peers);
    assert.deepEqual(result.series.map(series => series.region.id), [selectedId, ...peers.map(peer => peer.region.id)]);
    assert.deepEqual(result.series.map(series => series.distance), [null, ...peers.map(peer => peer.distance)]);
    assert.deepEqual(result.dimensions.map(row => row.id), dimensionIds);
    for (const [index, row] of result.dimensions.entries()) {
      assert.deepEqual(row.scores, [selected.core.dimensions[index].score, ...peers.map(peer => peer.dimensions[index].score)]);
    }
    assert.equal(JSON.stringify({ selected, peers }), before);
  });
}

test("similar-profile graph allows fewer peers but never imputes missing dimensions or invalid distances", () => {
  const selected = cohort[0];
  const peers = getSimilarRegions2023(selected.region.id);
  assert.deepEqual(similarPressureData2023(selected, []).series.map(series => series.region.id), [selected.region.id]);
  for (const change of [
    items => items[0].dimensions.pop(),
    items => items[0].dimensions[0].score = Infinity,
    items => items[0].distance = -1,
    items => items[0].region.id = selected.region.id,
    items => items.push(items[0]),
  ]) {
    const fixture = structuredClone(peers);
    change(fixture);
    assert.throws(() => similarPressureData2023(selected, fixture), Error);
  }
});

test("cohort distribution retains every canonical point, exact selected scores and the observed 27-region median", () => {
  const before = JSON.stringify(cohort);
  const result = cohortPressureData2023(cohort, "3273");
  assert.deepEqual(result.dimensions.map(row => row.id), dimensionIds);
  for (const row of result.dimensions) {
    assert.deepEqual(row.points.map(point => point.region.id), cohort.map(view => view.region.id));
    assert.deepEqual(row.points.map(point => point.score), cohort.map(view => view.core.dimensions.find(dimension => dimension.dimensionId === row.id).score));
    assert.equal(row.selectedScore, row.points.find(point => point.region.id === "3273").score);
    const lower = row.points.filter(point => point.score < row.median).length;
    const upper = row.points.filter(point => point.score > row.median).length;
    assert.ok(lower <= 13 && upper <= 13, "Median must split the complete cohort without dropping tied records");
    assert.equal("percentile" in row, false);
    assert.equal("classification" in row, false);
    assert.equal("rank" in row, false);
  }
  assert.deepEqual(cohortPressureData2023([...cohort].reverse(), "3273"), result);
  assert.equal(JSON.stringify(cohort), before);
});

test("descriptive cohort median handles known ordered scores, exact ties and zero without mutating records", () => {
  // Synthetic scores exercise descriptive statistics only; never production observations.
  const synthetic = structuredClone(cohort);
  synthetic.forEach((view, index) => view.core.dimensions.forEach((dimension, offset) => { dimension.score = index * 3 + offset; }));
  const result = cohortPressureData2023(synthetic, synthetic[0].region.id);
  assert.deepEqual(result.dimensions.map(row => row.median), [39,40,41,42,43,44]);
  assert.equal(result.dimensions[0].selectedScore, 0);
  for (const value of [0, 100]) {
    synthetic.forEach(view => view.core.dimensions.forEach(dimension => { dimension.score = value; }));
    const equal = cohortPressureData2023(synthetic, synthetic[0].region.id);
    assert.ok(equal.dimensions.every(row => row.median === value && row.selectedScore === value && row.points.every(point => point.score === value)));
  }
});

test("distribution rejects partial cohorts, duplicate/unknown geography, missing CORE and invalid unused candidates", () => {
  for (const change of [
    fixture => fixture.pop(),
    fixture => fixture[1] = fixture[0],
    fixture => fixture[26].region.id = "9999",
    fixture => fixture[26].core.scope = "CONTEXT",
    fixture => fixture[26].core.dimensions.pop(),
    fixture => fixture[26].core.dimensions[0].score = NaN,
    fixture => fixture[26].core.dimensions[0].score = null,
    fixture => fixture[26].core.dimensions[0].score = -1,
  ]) {
    const fixture = structuredClone(cohort);
    change(fixture);
    assert.throws(() => cohortPressureData2023(fixture, "3201"), Error);
  }
  assert.throws(() => cohortPressureData2023(cohort, "unknown"), RangeError);
});
