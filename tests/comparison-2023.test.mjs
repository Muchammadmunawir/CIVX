import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { compareRegions2023, CivxComparisonRegionNotFoundError2023 } from "../src/lib/civx/comparison-2023.ts";
import { getRegions2023, getRegionProfile2023 } from "../src/lib/civx/repository-2023.ts";

const regions = getRegions2023();
const profiles = new Map(regions.map(({ id }) => [id, getRegionProfile2023(id)]));
const canonicalDimensions = profiles.get(regions[0].id).core.dimensions.map(item => item.dimensionId);
const canonicalIndicators = profiles.get(regions[0].id).core.indicators.map(item => item.indicatorId);

function assertDifference(actual, valueA, valueB) {
  assert.equal(actual.delta, valueA - valueB);
  assert.equal(actual.absoluteDifference, Math.abs(valueA - valueB));
  assert.equal(actual.relation, valueA === valueB ? "EQUAL" : valueA > valueB ? "A_HIGHER" : "B_HIGHER");
}

function assertHighlights(actual, components, key, count) {
  const expected = components.map((item, index) => ({ item, index }))
    .sort((left, right) => right.item.absoluteDifference - left.item.absoluteDifference || left.index - right.index)
    .slice(0, count)
    .map(({ item }) => item[key]);
  assert.equal(actual.length, count);
  assert.deepEqual(actual.map(item => item[key]), expected);
}

function assertPair(result, sourceA, sourceB) {
  assert.equal(result.regionA.id, sourceA.region.id);
  assert.equal(result.regionB.id, sourceB.region.id);
  assert.equal(result.overall.regionAScore, sourceA.core.overallScore);
  assert.equal(result.overall.regionBScore, sourceB.core.overallScore);
  assertDifference(result.overall, sourceA.core.overallScore, sourceB.core.overallScore);
  assert.equal(result.dimensions.length, 6);
  assert.equal(result.indicators.length, 18);
  assert.deepEqual(result.dimensions.map(item => item.dimensionId), canonicalDimensions);
  assert.deepEqual(result.indicators.map(item => item.indicatorId), canonicalIndicators);
  for (const [index, dimension] of result.dimensions.entries()) {
    const a = sourceA.core.dimensions[index], b = sourceB.core.dimensions[index];
    assert.equal(dimension.regionAScore, a.score);
    assert.equal(dimension.regionBScore, b.score);
    assertDifference(dimension, a.score, b.score);
  }
  for (const [index, indicator] of result.indicators.entries()) {
    const a = sourceA.core.indicators[index], b = sourceB.core.indicators[index];
    assert.equal(indicator.rawValueA, a.rawValue);
    assert.equal(indicator.rawValueB, b.rawValue);
    assert.equal(indicator.normalizedPressureA, a.normalizedPressure);
    assert.equal(indicator.normalizedPressureB, b.normalizedPressure);
    assertDifference(indicator, a.normalizedPressure, b.normalizedPressure);
  }
  assertHighlights(result.highlights.largestDimensionDifferences, result.dimensions, "dimensionId", 3);
  assertHighlights(result.highlights.largestNormalizedPressureDifferences, result.indicators, "indicatorId", 5);
}

function assertReverse(forward, reverse) {
  const opposite = { A_HIGHER: "B_HIGHER", B_HIGHER: "A_HIGHER", EQUAL: "EQUAL" };
  // Numeric equality treats +0 and -0 equally, as the public delta convention does.
  assert.ok(forward.delta === -reverse.delta);
  assert.equal(forward.absoluteDifference, reverse.absoluteDifference);
  assert.equal(reverse.relation, opposite[forward.relation]);
}

function assertFrozen(value) {
  if (value === null || typeof value !== "object") return;
  assert.ok(Object.isFrozen(value));
  for (const child of Object.values(value)) assertFrozen(child);
}

test("Bandung versus Depok preserves identity, model metadata and exact overall pressure", () => {
  const result = compareRegions2023("3273", "3276");
  assert.equal(result.regionA.name, "Kota Bandung");
  assert.equal(result.regionB.name, "Kota Depok");
  assert.equal(result.overall.regionAScore, 38.824593110361675);
  assert.equal(result.overall.regionBScore, 27.95580303802617);
  assert.equal(result.overall.delta, 10.868790072335507);
  assert.equal(result.overall.relation, "A_HIGHER");
  assert.equal(result.referenceYear, 2023);
  assert.equal(result.scope, "CORE");
  const metadata = profiles.get("3273").metadata;
  assert.equal(result.metadata.modelId, metadata.modelId);
  assert.equal(result.metadata.modelVersion, metadata.modelVersion);
  assert.equal(result.metadata.cohortSize, 27);
  assert.equal(result.metadata.deltaConvention, "A_MINUS_B");
  assert.equal(result.metadata.indicatorDifferenceMetric, "normalized_pressure");
  assert.equal(result.metadata.equalityPolicy, "exact_recorded_value");
  assert.equal(result.metadata.interpretation, metadata.interpretation);
  assert.deepEqual(result.metadata.scoreArtifact, metadata.scoreArtifact);
});

test("all 702 distinct ordered pairs preserve exact values, canonical components, highlights and reverse symmetry", () => {
  for (let first = 0; first < regions.length; first++) {
    for (let second = first + 1; second < regions.length; second++) {
      const a = profiles.get(regions[first].id), b = profiles.get(regions[second].id);
      const forward = compareRegions2023(a.region.id, b.region.id);
      const reverse = compareRegions2023(b.region.id, a.region.id);
      assertPair(forward, a, b);
      assertPair(reverse, b, a);
      assertReverse(forward.overall, reverse.overall);
      forward.dimensions.forEach((item, index) => assertReverse(item, reverse.dimensions[index]));
      forward.indicators.forEach((item, index) => assertReverse(item, reverse.indicators[index]));
      assert.deepEqual(forward.highlights.largestDimensionDifferences.map(item => item.dimensionId), reverse.highlights.largestDimensionDifferences.map(item => item.dimensionId));
      assert.deepEqual(forward.highlights.largestNormalizedPressureDifferences.map(item => item.indicatorId), reverse.highlights.largestNormalizedPressureDifferences.map(item => item.indicatorId));
    }
  }
});

test("all 27 same-region pairs have zero gaps and canonical tie-breaking at highlight cutoffs", () => {
  for (const { id } of regions) {
    const result = compareRegions2023(id, id);
    assert.equal(result.regionA.id, id);
    assert.equal(result.regionB.id, id);
    for (const component of [result.overall, ...result.dimensions, ...result.indicators]) {
      assert.equal(component.delta, 0);
      assert.equal(component.absoluteDifference, 0);
      assert.equal(component.relation, "EQUAL");
    }
    assert.deepEqual(result.highlights.largestDimensionDifferences.map(item => item.dimensionId), canonicalDimensions.slice(0, 3));
    assert.deepEqual(result.highlights.largestNormalizedPressureDifferences.map(item => item.indicatorId), canonicalIndicators.slice(0, 5));
  }
});

test("indicator gaps use normalized pressure rather than raw direction or raw numeric units", () => {
  const result = compareRegions2023("3201", "3276");
  for (const indicatorId of ["poverty", "rls"]) {
    const item = result.indicators.find(item => item.indicatorId === indicatorId);
    const sourceA = profiles.get("3201").core.indicators.find(item => item.indicatorId === indicatorId);
    const sourceB = profiles.get("3276").core.indicators.find(item => item.indicatorId === indicatorId);
    assert.equal(item.indicatorName, sourceA.displayName);
    assert.equal(item.dimensionId, sourceA.dimensionId);
    assert.equal(item.pressureDirection, sourceA.pressureDirection);
    assert.equal(item.unit, sourceA.unit);
    assert.equal(item.referencePeriod, sourceA.evidence.indicator.referencePeriod);
    assert.equal(item.scoringPointerA, sourceA.evidence.scoringPointer);
    assert.equal(item.scoringPointerB, sourceB.evidence.scoringPointer);
    assert.notEqual(item.delta, item.rawValueA - item.rawValueB);
  }
  const schooling = result.indicators.find(item => item.indicatorId === "rls");
  assert.equal(schooling.pressureDirection, "higher_raw_lower_pressure");
  assert.ok(schooling.rawValueA < schooling.rawValueB);
  assert.ok(schooling.normalizedPressureA > schooling.normalizedPressureB);
  assert.equal(schooling.relation, "A_HIGHER");
});

test("largest gaps select normalized-pressure separation without reordering complete collections", () => {
  const result = compareRegions2023("3273", "3276");
  assert.deepEqual(result.highlights.largestDimensionDifferences.map(item => item.dimensionId), ["basic_services", "disaster_pressure", "socioeconomic"]);
  assert.deepEqual(result.highlights.largestNormalizedPressureDifferences.map(item => item.indicatorId), [
    "household-floor-per-capita-le7-2", "sanitation", "gini_ratio", "morbidity_activity_limiting", "puskesmas_per_100k",
  ]);
  assert.deepEqual(result.dimensions.map(item => item.dimensionId), canonicalDimensions);
  assert.deepEqual(result.indicators.map(item => item.indicatorId), canonicalIndicators);
});

test("invalid IDs fail with explicit side and ID without trimming, guessing or substitution", () => {
  function expectUnknown(a, b, side, id) {
    assert.throws(() => compareRegions2023(a, b), error => {
      assert.ok(error instanceof CivxComparisonRegionNotFoundError2023);
      assert.equal(error.code, "REGION_NOT_FOUND");
      assert.equal(error.side, side);
      assert.equal(error.regionId, id);
      return true;
    });
  }
  for (const id of ["", "3200", "3219", "3270", "3280", "Bandung", "Kota Bandung", " 3273", "3273 ", "03273", "2024"]) {
    expectUnknown(id, "3276", "A", id);
    expectUnknown("3273", id, "B", id);
    expectUnknown(id, id, "A", id);
  }
  expectUnknown("unknown-a", "unknown-b", "A", "unknown-a");
});

test("repeated comparison stays equivalent across interleaved pairs and reversed calls", () => {
  const first = compareRegions2023("3273", "3276");
  compareRegions2023("3201", "3279");
  compareRegions2023("3276", "3273");
  compareRegions2023("3273", "3273");
  assert.deepEqual(compareRegions2023("3273", "3276"), first);
});

test("all exposed comparison objects and arrays are frozen", () => {
  assertFrozen(compareRegions2023("3273", "3276"));
});

test("consumer mutation cannot alter later comparisons or repository profiles", () => {
  const result = compareRegions2023("3273", "3276");
  const before = structuredClone(result);
  const profileA = structuredClone(getRegionProfile2023("3273"));
  const profileB = structuredClone(getRegionProfile2023("3276"));
  const mutations = [
    () => { result.regionA.id = "3201"; },
    () => { result.regionB.name = "Changed"; },
    () => { result.overall.delta = 999; },
    () => { result.dimensions.reverse(); },
    () => { result.dimensions[0].regionAScore = 999; },
    () => { result.indicators.pop(); },
    () => { result.indicators[0].rawValueA = 999; },
    () => { result.highlights.largestDimensionDifferences.pop(); },
    () => { result.highlights.largestDimensionDifferences[0].delta = 999; },
    () => { result.highlights.largestNormalizedPressureDifferences[0].normalizedPressureA = 999; },
    () => { result.metadata.modelVersion = 999; },
    () => { result.metadata.scoreArtifact.sha256 = "Changed"; },
    () => { result.scope = "CONTEXT"; },
  ];
  for (const mutate of mutations) assert.throws(mutate, TypeError);
  assert.deepEqual(result, before);
  assert.deepEqual(compareRegions2023("3273", "3276"), before);
  assert.deepEqual(getRegionProfile2023("3273"), profileA);
  assert.deepEqual(getRegionProfile2023("3276"), profileB);
});

test("missing and zero contextual inventories never become CORE comparison components", () => {
  const sourceA = profiles.get("3209"), sourceB = profiles.get("3279");
  const terminal = profile => profile.context.find(item => item.dataset.datasetId === "context_transport_type_c_terminal_inventory_2023").record;
  assert.equal(terminal(sourceA).value, null);
  assert.equal(terminal(sourceB).value, 0);
  const result = compareRegions2023("3209", "3279");
  assert.equal(result.scope, "CORE");
  assert.equal("context" in result, false);
  assert.deepEqual(result.indicators.map(item => item.indicatorId), canonicalIndicators);
  assertDifference(result.overall, sourceA.core.overallScore, sourceB.core.overallScore);
});

test("frozen score and insight artifacts retain exact SHA256 fingerprints", () => {
  for (const [path, expected] of [
    ["data/processed/civx-scores-2023.json", "47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5"],
    ["data/processed/civx-insights-2023.json", "ffd92543c6387c981d2647c8ed55bd3abb7f7c4e9b5b91d4a74fab81999d6345"],
  ]) {
    const bytes = readFileSync(new URL(`../${path}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), expected, path);
  }
});
