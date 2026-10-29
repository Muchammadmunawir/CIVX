import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  assertModel2023,
  normalizePressure2023,
  prepareModel2023,
} from "../src/lib/civx/model-2023.ts";
import {
  aggregateNormalized2023,
  scoreCohort2023,
  scoreRegion2023,
} from "../src/lib/civx/scoring-2023.ts";

const load = name => JSON.parse(readFileSync(new URL(`../data/processed/${name}`, import.meta.url), "utf8"));
const frozen = load("final-indicator-freeze-2023.json");
const normalized = load("normalization-design-2023.json");
const weighting = load("weighting-design-2023.json");
const originalArtifacts = JSON.stringify([frozen, normalized, weighting]);

function deepFreeze(value) {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

deepFreeze(frozen);
deepFreeze(normalized);
deepFreeze(weighting);
const { model, regions } = prepareModel2023(frozen, normalized, weighting);
deepFreeze(model);
deepFreeze(regions);
const bogor = regions.find(region => region.regionId === "3201");
const expectedRegionIds = [
  ...Array.from({ length: 18 }, (_, index) => String(3201 + index)),
  ...Array.from({ length: 9 }, (_, index) => String(3271 + index)),
];
const membership = {
  socioeconomic: ["poverty", "unemployment", "gini_ratio", "expenditure_per_capita"],
  education: ["rls", "hls", "apm"],
  basic_services: [
    "sanitation", "drinking_water", "puskesmas_per_100k",
    "household-floor-per-capita-le7-2", "health_insurance_ownership",
  ],
  public_health: [
    "nutrition_ski2023_stunting", "nutrition_ski2023_wasting",
    "morbidity_activity_limiting", "life_expectancy_lfsp2020",
  ],
  disaster_pressure: ["irbi_overall_2023"],
  environment: ["iklh_2023"],
};
const expectedDimensionIds = Object.keys(membership);
const expectedIndicatorIds = Object.values(membership).flat();
const higherPressureIds = new Set([
  "poverty", "unemployment", "gini_ratio", "household-floor-per-capita-le7-2",
  "nutrition_ski2023_stunting", "nutrition_ski2023_wasting",
  "morbidity_activity_limiting", "irbi_overall_2023",
]);
const near = (actual, expected, label = "score", tolerance = 1e-10) => {
  assert.equal(typeof actual, "number", label);
  assert.ok(Number.isFinite(actual), label);
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} != ${expected}`);
};
const sum = values => values.reduce((total, value) => total + value, 0);
const selectedScheme = artifact => artifact.schemes.find(scheme => scheme.schemeId === "equal_dimension_equal_indicator");
const rejectPreparation = mutate => {
  const artifacts = [frozen, normalized, weighting].map(value => structuredClone(value));
  mutate(...artifacts);
  assert.throws(() => prepareModel2023(...artifacts), Error);
};
const resolvePointer = (document, pointer) => pointer.slice(1).split("/").reduce((value, key) => value[key], document);

// Independent arithmetic oracle: transcribed frozen Bogor raw values and cohort anchors.
// Integer ratios avoid copying the normalization implementation or provisional scores.
// Puskesmas uses the audited facility counts and exact resident denominators directly.
const supplyBogor = 101 / 5627021 * 100000;
const supplyMinimum = 51 / 3237420 * 100000;
const supplyMaximum = 22 / 341980 * 100000;
const bogorOracle = [
  ["poverty", 7.27, 2.38, 12.13, 100 * (489 / 975)],
  ["unemployment", 8.47, 1.52, 10.52, 100 * (695 / 900)],
  ["gini_ratio", 0.369, 0.319, 0.468, 100 * (50 / 149)],
  ["expenditure_per_capita", 11153, 8562, 18236, 100 * (7083 / 9674)],
  ["rls", 8.37, 6.94, 11.66, 100 * (329 / 472)],
  ["hls", 12.64, 11.91, 14.29, 100 * (165 / 238)],
  ["apm", 49.76, 49.52, 70.58, 100 * (2082 / 2106)],
  ["sanitation", 71.49, 44.76, 98.52, 100 * (2703 / 5376)],
  ["drinking_water", 91.9, 81.13, 99.61, 100 * (771 / 1848)],
  ["puskesmas_per_100k", supplyBogor, supplyMinimum, supplyMaximum,
    100 * ((supplyMaximum - supplyBogor) / (supplyMaximum - supplyMinimum))],
  ["household-floor-per-capita-le7-2", 8.53, 1.6, 23.55, 100 * (693 / 2195)],
  ["health_insurance_ownership", 66.5, 45.39, 92.24, 100 * (2574 / 4685)],
  ["nutrition_ski2023_stunting", 27.6, 10.3, 29.2, 100 * (173 / 189)],
  ["nutrition_ski2023_wasting", 8.5, 3.1, 10.7, 100 * (54 / 76)],
  ["morbidity_activity_limiting", 8.56, 6.75, 19.84, 100 * (181 / 1309)],
  ["life_expectancy_lfsp2020", 74.67, 73.87, 75.86, 100 * (119 / 199)],
  ["irbi_overall_2023", 107.93, 63.49, 185.14, 100 * (4444 / 12165)],
  ["iklh_2023", 60.61, 44.65, 71.11, 100 * (1050 / 2646)],
];
const bogorPressure = Object.fromEntries(bogorOracle.map(([id, , , , pressure]) => [id, pressure]));
const bogorDimensions = Object.fromEntries(Object.entries(membership).map(([id, ids]) => [
  id, sum(ids.map(indicatorId => bogorPressure[indicatorId])) / ids.length,
]));
const bogorOverall = sum(Object.values(bogorDimensions)) / 6;

// All fixture vectors below are synthetic, test-only inputs. They are not regional observations
// and are never written into a generated dataset or substituted for the frozen artifacts.
const syntheticVector = pressure => expectedIndicatorIds.map((indicatorId, index) => ({
  indicatorId,
  normalizedPressure: typeof pressure === "function" ? pressure(indicatorId, index) : pressure,
}));
function syntheticRegion(pressure) {
  const input = structuredClone(bogor);
  for (const value of input.indicators) {
    const indicator = model.indicators.find(item => item.indicatorId === value.indicatorId);
    const score = typeof pressure === "function" ? pressure(value.indicatorId) : pressure;
    const higher = indicator.pressureDirection === "higher_raw_higher_pressure";
    value.normalizedPressure = score;
    if (score === 0) value.rawValue = higher ? indicator.minimum : indicator.maximum;
    else if (score === 100) value.rawValue = higher ? indicator.maximum : indicator.minimum;
    else value.rawValue = higher
      ? indicator.minimum + score / 100 * (indicator.maximum - indicator.minimum)
      : indicator.maximum - score / 100 * (indicator.maximum - indicator.minimum);
  }
  return input;
}

test("frozen model has exactly the 27 regions, 18 CORE indicators and six memberships", () => {
  assertModel2023(model);
  assert.equal(model.referenceYear, 2023);
  assert.equal(model.normalizationMethod, "min_max");
  assert.equal(model.weightingSchemeId, "equal_dimension_equal_indicator");
  assert.equal(typeof model.modelId, "string");
  assert.ok(model.modelId.length > 0);
  assert.ok(Number.isInteger(model.modelVersion) && model.modelVersion > 0);
  assert.deepEqual(model.regions.map(region => region.id), expectedRegionIds);
  assert.deepEqual(regions.map(region => region.regionId), expectedRegionIds);
  assert.deepEqual(model.indicators.map(indicator => indicator.indicatorId), expectedIndicatorIds);
  assert.deepEqual(model.dimensions.map(dimension => dimension.dimensionId), expectedDimensionIds);
  for (const dimension of model.dimensions) {
    assert.deepEqual(dimension.indicatorIds, membership[dimension.dimensionId]);
  }
  for (const indicator of model.indicators) {
    assert.equal(indicator.pressureDirection, higherPressureIds.has(indicator.indicatorId)
      ? "higher_raw_higher_pressure" : "higher_raw_lower_pressure");
  }
  for (const input of regions) {
    assert.equal(input.referenceYear, 2023);
    assert.deepEqual(input.indicators.map(indicator => indicator.indicatorId), expectedIndicatorIds);
  }
});

test("selected exact weights follow six budgets, not an eighteen-indicator flat mean", () => {
  for (const dimension of model.dimensions) {
    const count = membership[dimension.dimensionId].length;
    near(dimension.weight, 1 / 6, dimension.dimensionId, 1e-12);
    assert.equal(dimension.exactFraction, "1/6");
    for (const indicator of model.indicators.filter(item => item.dimensionId === dimension.dimensionId)) {
      near(indicator.withinDimensionWeight, 1 / count, indicator.indicatorId, 1e-12);
      near(indicator.dimensionWeight, 1 / 6, indicator.indicatorId, 1e-12);
      near(indicator.effectiveWeight, 1 / (6 * count), indicator.indicatorId, 1e-12);
      assert.equal(indicator.exactWithinFraction, `1/${count}`);
      assert.equal(indicator.exactDimensionFraction, "1/6");
      assert.equal(indicator.exactEffectiveFraction, `1/${6 * count}`);
    }
  }
  near(sum(model.dimensions.map(item => item.weight)), 1, "dimension total", 1e-12);
  near(sum(model.indicators.map(item => item.effectiveWeight)), 1, "effective total", 1e-12);
});

test("Bogor eighteen pressures, six dimension means and overall match independent raw arithmetic", () => {
  const score = scoreRegion2023(bogor, model);
  assert.equal(score.regionId, "3201");
  assert.equal(score.regionName, "Kabupaten Bogor");
  assert.equal(score.referenceYear, 2023);
  assert.equal(score.modelId, model.modelId);
  assert.equal(score.modelVersion, model.modelVersion);
  for (const [id, raw, minimum, maximum, expected] of bogorOracle) {
    const indicator = model.indicators.find(item => item.indicatorId === id);
    const output = score.indicators.find(item => item.indicatorId === id);
    near(output.rawValue, raw, `${id} raw`);
    near(indicator.minimum, minimum, `${id} minimum`);
    near(indicator.maximum, maximum, `${id} maximum`);
    near(normalizePressure2023(raw, indicator), expected, `${id} normalized`);
    near(output.normalizedPressure, expected, `${id} output`);
  }
  for (const dimension of score.dimensions) {
    near(dimension.score, bogorDimensions[dimension.dimensionId], dimension.dimensionId);
  }
  near(score.overallPressureScore, bogorOverall, "Bogor overall");
  assert.notEqual(score.overallPressureScore, Math.round(score.overallPressureScore * 100) / 100);
  assert.ok(Math.abs(score.overallPressureScore - sum(Object.values(bogorPressure)) / 18) > 1);
});

test("published source composites stay raw, and IKLH reversal is cohort-normalized rather than 100 minus raw", () => {
  const output = scoreRegion2023(bogor, model);
  const irbi = output.indicators.find(item => item.indicatorId === "irbi_overall_2023");
  const iklh = output.indicators.find(item => item.indicatorId === "iklh_2023");
  assert.equal(irbi.rawValue, 107.93);
  assert.equal(iklh.rawValue, 60.61);
  near(irbi.normalizedPressure, 100 * (4444 / 12165));
  near(iklh.normalizedPressure, 100 * (1050 / 2646));
  assert.ok(Math.abs(iklh.normalizedPressure - (100 - iklh.rawValue)) > 0.1);
});

test("every indicator preserves the correct directional endpoints and strict monotonicity", () => {
  for (const indicator of model.indicators) {
    const { minimum, maximum, pressureDirection } = indicator;
    const midpoint = minimum + (maximum - minimum) / 2;
    const low = normalizePressure2023(minimum, indicator);
    const high = normalizePressure2023(maximum, indicator);
    near(normalizePressure2023(midpoint, indicator), 50, indicator.indicatorId);
    if (pressureDirection === "higher_raw_higher_pressure") {
      assert.equal(low, 0);
      assert.equal(high, 100);
      assert.ok(normalizePressure2023(midpoint, indicator) > low);
    } else {
      assert.equal(low, 100);
      assert.equal(high, 0);
      assert.ok(normalizePressure2023(midpoint, indicator) > high);
    }
  }
});

test("synthetic test-only calibration cannot admit raw values beyond documented physical bounds", () => {
  for (const [rawValue, maximum, bound] of [[150, 200, 100], [1.2, 2, 1]]) {
    assert.throws(() => normalizePressure2023(rawValue, {
      minimum: 0,
      maximum,
      pressureDirection: "higher_raw_higher_pressure",
      expectedBounds: { minimum: 0, maximum: bound },
    }), Error);
  }
  const irbi = model.indicators.find(indicator => indicator.indicatorId === "irbi_overall_2023");
  assert.ok(irbi.maximum > 100);
  assert.equal(normalizePressure2023(irbi.maximum, irbi), 100);
});

test("actual min-max panels, not diagnostic normalization alternatives, feed scoring", () => {
  const output = scoreRegion2023(bogor, model);
  const poverty = output.indicators.find(indicator => indicator.indicatorId === "poverty");
  const alternatives = normalized.indicators.find(indicator => indicator.indicatorId === "poverty")
    .observations.find(observation => observation.regionId === "3201").normalizedPressure;
  assert.equal(poverty.normalizedPressure, alternatives.min_max);
  for (const key of ["z_score", "percentile_midrank", "median_iqr", "winsorized_min_max_05_95"]) {
    assert.notEqual(poverty.normalizedPressure, alternatives[key], key);
  }
});

test("normalization rejects missing, coercible, nonfinite and negative raw values", () => {
  for (const value of [undefined, null, "7.27", "", true, NaN, Infinity, -Infinity, -1, {}, []]) {
    assert.throws(() => normalizePressure2023(value, model.indicators[0]), Error, String(value));
  }
});

test("normalization rejects values outside each fixed cohort instead of clipping or refitting", () => {
  for (const indicator of model.indicators) {
    const gap = (indicator.maximum - indicator.minimum) / 100;
    assert.throws(() => normalizePressure2023(indicator.minimum - gap, indicator), Error, indicator.indicatorId);
    assert.throws(() => normalizePressure2023(indicator.maximum + gap, indicator), Error, indicator.indicatorId);
  }
});

test("normalization rejects constant, inverted, missing and nonfinite anchors and invalid directions", () => {
  for (const change of [
    { minimum: 7.27, maximum: 7.27 },
    { minimum: 13, maximum: 2 },
    { minimum: undefined },
    { minimum: "2.38" },
    { minimum: NaN },
    { maximum: Infinity },
    { minimum: -1 },
    { pressureDirection: "higher" },
    { pressureDirection: undefined },
  ]) {
    assert.throws(() => normalizePressure2023(7.27, { ...model.indicators[0], ...change }), Error);
  }
});

test("synthetic test-only unequal vectors use within-dimension means and an equal six-dimension mean", () => {
  const values = [0, 20, 40, 80, 10, 40, 70, 0, 25, 50, 75, 100, 10, 30, 50, 90, 37.125, 63.875];
  const output = aggregateNormalized2023(syntheticVector((id, index) => values[index]).reverse(), model);
  const expected = [35, 40, 50, 45, 37.125, 63.875];
  assert.deepEqual(output.dimensions.map(dimension => dimension.dimensionId), expectedDimensionIds);
  output.dimensions.forEach((dimension, index) => {
    near(dimension.score, expected[index]);
    near(dimension.weight, 1 / 6);
    near(dimension.contributionToOverall, expected[index] / 6);
  });
  near(output.overallPressureScore, 271 / 6);
  assert.equal(output.dimensions[4].score, values[16]);
  assert.equal(output.dimensions[5].score, values[17]);
});

test("synthetic test-only all-zero, all-100 and interior vectors retain their convex scores", () => {
  for (const value of [0, 100, 1 / 7, 37.1234567890123, 99.9999999999]) {
    const output = aggregateNormalized2023(syntheticVector(value), model);
    near(output.overallPressureScore, value);
    for (const dimension of output.dimensions) near(dimension.score, value);
    assert.ok(output.overallPressureScore >= -1e-10 && output.overallPressureScore <= 100 + 1e-10);
  }
});

test("each synthetic test-only unit pulse has its exact effective coefficient and positive influence", () => {
  for (const [dimensionId, ids] of Object.entries(membership)) {
    for (const id of ids) {
      const output = aggregateNormalized2023(syntheticVector(candidate => candidate === id ? 100 : 0), model);
      near(output.overallPressureScore, 100 / (6 * ids.length), id);
      near(output.dimensions.find(item => item.dimensionId === dimensionId).score, 100 / ids.length, id);
      assert.ok(output.overallPressureScore > 0);
      for (const dimension of output.dimensions.filter(item => item.dimensionId !== dimensionId)) {
        assert.equal(dimension.score, 0);
      }
    }
  }
});

test("aggregation rejects nonnumeric, nonfinite and even slightly out-of-range pressure without coercion", () => {
  for (const value of [undefined, null, "50", true, NaN, Infinity, -Infinity, -Number.EPSILON, 100 + 1e-12]) {
    const input = syntheticVector(50);
    input[0].normalizedPressure = value;
    assert.throws(() => aggregateNormalized2023(input, model), Error, String(value));
  }
});

test("aggregation rejects every missing indicator instead of reweighting its dimension", () => {
  for (const id of expectedIndicatorIds) {
    assert.throws(() => aggregateNormalized2023(syntheticVector(50).filter(item => item.indicatorId !== id), model), Error, id);
  }
});

test("aggregation rejects unknown and duplicate indicators even when input length stays eighteen", () => {
  for (const change of [
    input => { input[0].indicatorId = "hdi"; },
    input => { input[0] = { ...input[1] }; },
    input => { input.push({ ...input[0] }); },
    input => { input.push({ indicatorId: "dbd_incidence", normalizedPressure: 50 }); },
  ]) {
    const input = syntheticVector(50);
    change(input);
    assert.throws(() => aggregateNormalized2023(input, model), Error);
  }
});

test("regional scoring rejects missing, unknown and duplicate indicator observations", () => {
  for (const id of expectedIndicatorIds) {
    const input = structuredClone(bogor);
    input.indicators = input.indicators.filter(item => item.indicatorId !== id);
    assert.throws(() => scoreRegion2023(input, model), Error, id);
  }
  for (const change of [
    input => { input.indicators[0].indicatorId = "hdi"; },
    input => { input.indicators[0] = { ...input.indicators[1] }; },
    input => { input.indicators.push({ ...input.indicators[0] }); },
  ]) {
    const input = structuredClone(bogor);
    change(input);
    assert.throws(() => scoreRegion2023(input, model), Error);
  }
});

test("regional scoring rejects invalid identity, reference year and raw/pressure disagreement", () => {
  for (const change of [
    input => { input.regionId = "9999"; },
    input => { input.regionId = 3201; },
    input => { input.regionName = "Kota Bogor"; },
    input => { input.referenceYear = 2022; },
    input => { input.referenceYear = "2023"; },
    input => { input.indicators[0].rawValue += 0.1; },
    input => { input.indicators[0].normalizedPressure += 0.01; },
  ]) {
    const input = structuredClone(bogor);
    change(input);
    assert.throws(() => scoreRegion2023(input, model), Error);
  }
});

test("regional scoring validates every raw and normalized observation rather than only the first", () => {
  for (const id of expectedIndicatorIds) {
    for (const field of ["rawValue", "normalizedPressure"]) {
      for (const value of [undefined, null, "50", NaN, Infinity, -Infinity, -1]) {
        const input = structuredClone(bogor);
        input.indicators.find(item => item.indicatorId === id)[field] = value;
        assert.throws(() => scoreRegion2023(input, model), Error, `${id}.${field}: ${String(value)}`);
      }
    }
  }
});

test("regional scoring rejects missing or cross-indicator/cross-region source pointers", () => {
  for (const field of ["frozenValuePointer", "normalizationValuePointer"]) {
    for (const value of [undefined, "", "/unknown", bogor.indicators[1][field], regions[1].indicators[0][field]]) {
      const input = structuredClone(bogor);
      input.indicators[0][field] = value;
      assert.throws(() => scoreRegion2023(input, model), Error, `${field}: ${value}`);
    }
  }
});

test("cohort scoring returns exactly 27 complete eighteen-indicator scores in registry order", () => {
  const scores = scoreCohort2023([...regions].reverse(), model);
  assert.deepEqual(scores.map(score => score.regionId), expectedRegionIds);
  assert.equal(scores.length, 27);
  for (const score of scores) {
    assert.deepEqual(score.indicators.map(item => item.indicatorId), expectedIndicatorIds);
    assert.deepEqual(score.dimensions.map(item => item.dimensionId), expectedDimensionIds);
    assert.ok(score.overallPressureScore >= -1e-10 && score.overallPressureScore <= 100 + 1e-10);
    const input = regions.find(item => item.regionId === score.regionId);
    assert.deepEqual(score, scoreRegion2023(input, model));
    for (const dimension of score.dimensions) assert.ok(dimension.score >= -1e-10 && dimension.score <= 100 + 1e-10);
  }
});

test("cohort scoring refuses missing, unknown, duplicate or extra regions and any malformed member", () => {
  for (const change of [
    inputs => { inputs.pop(); },
    inputs => { inputs[26] = structuredClone(inputs[0]); },
    inputs => { inputs[26].regionId = "9999"; },
    inputs => { inputs.push(structuredClone(inputs[0])); },
    inputs => { inputs[26].indicators.pop(); },
    inputs => { inputs[26].indicators[17].normalizedPressure = NaN; },
  ]) {
    const inputs = structuredClone(regions);
    change(inputs);
    assert.throws(() => scoreCohort2023(inputs, model), Error);
  }
});

test("repeated calls and input permutations produce identical ordered JSON", () => {
  const expected = JSON.stringify(scoreCohort2023(regions, model));
  assert.equal(JSON.stringify(scoreCohort2023(regions, model)), expected);
  const permuted = structuredClone(regions).reverse();
  for (const region of permuted) region.indicators.reverse();
  assert.equal(JSON.stringify(scoreCohort2023(permuted, model)), expected);
  assert.equal(JSON.stringify(scoreRegion2023(bogor, model)), JSON.stringify(scoreRegion2023(bogor, model)));
  assert.deepEqual(
    aggregateNormalized2023([...bogor.indicators].reverse(), model),
    aggregateNormalized2023(bogor.indicators, model),
  );
});

test("prepare and all scoring APIs accept deeply frozen sources without mutating input or model", () => {
  const before = JSON.stringify([model, regions]);
  scoreRegion2023(bogor, model);
  scoreCohort2023(regions, model);
  aggregateNormalized2023(bogor.indicators, model);
  for (const indicator of model.indicators) normalizePressure2023(indicator.minimum, indicator);
  assertModel2023(model);
  assert.equal(JSON.stringify([frozen, normalized, weighting]), originalArtifacts);
  assert.equal(JSON.stringify([model, regions]), before);
});


test("contributions, exact shares, metadata and evidence pointers explain every regional score", () => {
  for (const output of scoreCohort2023(regions, model)) {
    for (const indicator of output.indicators) {
      const definition = model.indicators.find(item => item.indicatorId === indicator.indicatorId);
      const count = membership[indicator.dimensionId].length;
      assert.equal(indicator.unit, definition.unit);
      near(indicator.withinDimensionWeight, 1 / count, indicator.indicatorId, 1e-12);
      near(indicator.dimensionWeight, 1 / 6, indicator.indicatorId, 1e-12);
      near(indicator.effectiveWeight, 1 / (6 * count), indicator.indicatorId, 1e-12);
      assert.equal(indicator.exactWithinFraction, `1/${count}`);
      assert.equal(indicator.exactDimensionFraction, "1/6");
      assert.equal(indicator.exactEffectiveFraction, `1/${6 * count}`);
      near(indicator.contributionToDimension, indicator.normalizedPressure / count);
      near(indicator.contributionToOverall, indicator.normalizedPressure / (6 * count));
      assert.equal(resolvePointer(frozen, indicator.frozenValuePointer), indicator.rawValue);
      assert.equal(resolvePointer(normalized, indicator.normalizationValuePointer), indicator.normalizedPressure);
      const frozenDefinition = resolvePointer(frozen, definition.frozenIndicatorPointer);
      assert.equal(frozenDefinition.indicatorId, indicator.indicatorId);
      assert.equal(frozenDefinition.dimensionId, indicator.dimensionId);
    }
    for (const dimension of output.dimensions) {
      const indicators = output.indicators.filter(item => item.dimensionId === dimension.dimensionId);
      near(sum(indicators.map(item => item.contributionToDimension)), dimension.score);
      near(sum(indicators.map(item => item.contributionToOverall)), dimension.contributionToOverall);
      near(dimension.contributionToOverall, dimension.score / 6);
    }
    near(sum(output.indicators.map(item => item.contributionToOverall)), output.overallPressureScore);
    near(sum(output.dimensions.map(item => item.contributionToOverall)), output.overallPressureScore);
  }
});

test("real structured facts identify exact extrema and stable unrounded descending indicator pressures", () => {
  for (const score of scoreCohort2023(regions, model)) {
    const high = Math.max(...score.dimensions.map(item => item.score));
    const low = Math.min(...score.dimensions.map(item => item.score));
    assert.deepEqual(score.facts.highestPressureDimensionIds,
      score.dimensions.filter(item => item.score === high).map(item => item.dimensionId));
    assert.deepEqual(score.facts.lowestPressureDimensionIds,
      score.dimensions.filter(item => item.score === low).map(item => item.dimensionId));
    const descending = [...score.indicators].sort((left, right) =>
      right.normalizedPressure - left.normalizedPressure
      || expectedIndicatorIds.indexOf(left.indicatorId) - expectedIndicatorIds.indexOf(right.indicatorId));
    assert.deepEqual(score.facts.indicatorIdsByDescendingPressure, descending.map(item => item.indicatorId));
    assert.equal("rank" in score, false);
    assert.equal("ranking" in score, false);
  }
  const bogorFacts = scoreRegion2023(bogor, model).facts;
  assert.deepEqual(bogorFacts.highestPressureDimensionIds, ["education"]);
  assert.deepEqual(bogorFacts.lowestPressureDimensionIds, ["disaster_pressure"]);
});

test("synthetic test-only all-zero facts include all six extreme ties and use frozen indicator order", () => {
  const input = syntheticRegion(0);
  input.indicators.reverse();
  const score = scoreRegion2023(input, model);
  assert.equal(score.overallPressureScore, 0);
  assert.deepEqual(score.facts.highestPressureDimensionIds, expectedDimensionIds);
  assert.deepEqual(score.facts.lowestPressureDimensionIds, expectedDimensionIds);
  assert.deepEqual(score.facts.indicatorIdsByDescendingPressure, expectedIndicatorIds);
});

test("synthetic test-only endpoint facts retain multiple highest and lowest ties", () => {
  const score = scoreRegion2023(syntheticRegion(id =>
    id === "irbi_overall_2023" || id === "iklh_2023" ? 100 : 0), model);
  near(score.overallPressureScore, 100 / 3);
  assert.deepEqual(score.facts.highestPressureDimensionIds, ["disaster_pressure", "environment"]);
  assert.deepEqual(score.facts.lowestPressureDimensionIds, ["socioeconomic", "education", "basic_services", "public_health"]);
  assert.deepEqual(score.facts.indicatorIdsByDescendingPressure,
    ["irbi_overall_2023", "iklh_2023", ...expectedIndicatorIds.slice(0, 16)]);
});

test("synthetic test-only near-equal pressures sort by full precision rather than displayed rounding", () => {
  const score = scoreRegion2023(syntheticRegion(id =>
    id === "poverty" ? 100 - 1e-9 : id === "unemployment" ? 100 : 0), model);
  assert.deepEqual(score.facts.indicatorIdsByDescendingPressure.slice(0, 2), ["unemployment", "poverty"]);
});

test("model rejects sum-preserving dimension and within-dimension weight substitutions", () => {
  const alternate = structuredClone(model);
  alternate.dimensions[0].weight += 0.01;
  alternate.dimensions[1].weight -= 0.01;
  for (const indicator of alternate.indicators) {
    indicator.dimensionWeight = alternate.dimensions.find(item => item.dimensionId === indicator.dimensionId).weight;
    indicator.effectiveWeight = indicator.dimensionWeight * indicator.withinDimensionWeight;
  }
  near(sum(alternate.dimensions.map(item => item.weight)), 1);
  near(sum(alternate.indicators.map(item => item.effectiveWeight)), 1);
  assert.throws(() => assertModel2023(alternate), Error);
  const unequalWithin = structuredClone(model);
  unequalWithin.indicators[0].withinDimensionWeight += 0.01;
  unequalWithin.indicators[1].withinDimensionWeight -= 0.01;
  for (const indicator of unequalWithin.indicators) {
    indicator.effectiveWeight = indicator.dimensionWeight * indicator.withinDimensionWeight;
  }
  near(sum(unequalWithin.indicators.filter(item => item.dimensionId === "socioeconomic").map(item => item.withinDimensionWeight)), 1);
  assert.throws(() => assertModel2023(unequalWithin), Error);
  assert.throws(() => aggregateNormalized2023(bogor.indicators, alternate), Error);
  assert.throws(() => scoreRegion2023(bogor, unequalWithin), Error);
  assert.throws(() => scoreCohort2023(regions, alternate), Error);
});

test("model rejects membership, direction, year, method, scheme, cohort, anchor and fraction drift", () => {
  for (const change of [
    value => { value.indicators.pop(); },
    value => { value.indicators[0].indicatorId = "hdi"; },
    value => { value.indicators[0].dimensionId = "education"; },
    value => { value.dimensions[0].indicatorIds[0] = "hdi"; },
    value => { value.indicators[0].pressureDirection = "higher_raw_lower_pressure"; },
    value => { value.referenceYear = 2024; },
    value => { value.normalizationMethod = "z_score"; },
    value => { value.weightingSchemeId = "equal_indicator"; },
    value => { value.regions.pop(); },
    value => { value.regions[0].id = "9999"; },
    value => { value.regions[0].name = "Kota Bogor"; },
    value => { value.indicators[0].minimum += 0.01; },
    value => { value.indicators[0].maximum += 0.01; },
    value => { value.indicators[0].effectiveWeight = NaN; },
    value => { value.dimensions[0].exactFraction = "1/5"; },
    value => { value.indicators[0].exactEffectiveFraction = "1/18"; },
  ]) {
    const invalid = structuredClone(model);
    change(invalid);
    assert.throws(() => assertModel2023(invalid), Error);
  }
});

test("preparation rejects frozen metadata, indicator membership, direction, year and cohort drift", () => {
  for (const change of [
    value => { value.version += 1; },
    value => { value.referenceYear = 2022; },
    value => { value.indicators.pop(); },
    value => { value.indicators[0].indicatorId = "hdi"; },
    value => { value.indicators[0] = structuredClone(value.indicators[1]); },
    value => { value.indicators[0].civxPressureDirection = "higher_raw_lower_pressure"; },
    value => { value.indicators[0].dimensionId = "education"; },
    value => { value.indicators[0].year = 2022; },
    value => { value.dimensions[0].indicatorIds[0] = "hdi"; },
    value => { value.geography.regions.pop(); },
    value => { value.geography.regions[0].id = "9999"; },
    value => { value.indicators[0].observations.pop(); },
    value => { value.indicators[0].observations[0] = structuredClone(value.indicators[0].observations[1]); },
    value => { value.indicators[0].observations[0].value = "7.27"; },
  ]) rejectPreparation(change);
});

test("preparation rejects changed normalization method, version, metadata, anchors and selected values", () => {
  for (const change of [
    value => { value.version += 1; },
    value => { value.referenceYear = 2022; },
    value => { value.recommendation.methodId = "percentile_midrank"; },
    value => { value.indicators.pop(); },
    value => { value.indicators[0].indicatorId = "hdi"; },
    value => { value.indicators[0].dimensionId = "education"; },
    value => { value.indicators[0].pressureDirection = "higher_raw_lower_pressure"; },
    value => { value.indicators[0].year = 2022; },
    value => { value.indicators[0].calibration.min_max.minimum += 0.01; },
    value => { value.indicators[0].calibration.min_max.maximum += 0.01; },
    value => { value.indicators[0].observations[0].rawValue += 0.01; },
    value => { value.indicators[0].observations[0].frozenObservationPointer = "/indicators/1/observations/0"; },
    value => { value.indicators[0].observations[0].normalizedPressure.min_max += 0.01; },
    value => { value.indicators[17].observations[26].normalizedPressure.min_max = NaN; },
    value => { value.indicators[17].observations[26].normalizedPressure.min_max = 101; },
    value => { value.indicators[0].observations.pop(); },
    value => { value.input.regions[0].id = "9999"; },
  ]) rejectPreparation((freeze, normalization) => change(normalization));
});

test("preparation rejects weighting version, method, selected scheme and exact membership drift", () => {
  for (const change of [
    value => { value.version += 1; },
    value => { value.referenceYear = 2022; },
    value => { value.input.normalizationMethod = "z_score"; },
    value => { value.selectedSchemeId = "equal_indicator"; },
    value => { value.input.regionIds.pop(); },
    value => { value.input.indicatorIds[0] = "hdi"; },
    value => { value.input.panels[0].pressureDirection = "higher_raw_lower_pressure"; },
    value => { value.input.panels[0].observations[0].rawValue += 0.01; },
    value => { value.input.panels[0].observations[0].normalizedPressure += 0.01; },
    value => { value.input.panels[0].observations[0].frozenValuePointer = "/indicators/1/observations/0/value"; },
    value => { value.input.panels[0].observations[0].normalizationValuePointer = "/indicators/0/observations/0/normalizedPressure/z_score"; },
    value => { selectedScheme(value).indicatorWeights.pop(); },
    value => { selectedScheme(value).dimensionWeights[0].indicatorIds[0] = "hdi"; },
    value => { selectedScheme(value).indicatorWeights[0].exactEffectiveFraction = "1/18"; },
  ]) rejectPreparation((freeze, normalization, weights) => change(weights));
});

test("preparation rejects sum-preserving selected weighting changes even with updated effective totals", () => {
  rejectPreparation((freeze, normalization, weights) => {
    const scheme = selectedScheme(weights);
    scheme.dimensionWeights[0].weight += 0.01;
    scheme.dimensionWeights[1].weight -= 0.01;
    for (const dimension of scheme.dimensionWeights) dimension.effectiveIndicatorWeightTotal = dimension.weight;
    for (const indicator of scheme.indicatorWeights) {
      indicator.dimensionWeight = scheme.dimensionWeights.find(item => item.dimensionId === indicator.dimensionId).weight;
      indicator.effectiveWeight = indicator.dimensionWeight * indicator.withinDimensionWeight;
    }
    near(sum(scheme.dimensionWeights.map(item => item.weight)), 1);
    near(sum(scheme.indicatorWeights.map(item => item.effectiveWeight)), 1);
  });
  rejectPreparation((freeze, normalization, weights) => {
    const scheme = selectedScheme(weights);
    scheme.indicatorWeights[0].withinDimensionWeight += 0.01;
    scheme.indicatorWeights[1].withinDimensionWeight -= 0.01;
    for (const indicator of scheme.indicatorWeights) {
      indicator.effectiveWeight = indicator.dimensionWeight * indicator.withinDimensionWeight;
    }
    near(sum(scheme.indicatorWeights.filter(item => item.dimensionId === "socioeconomic").map(item => item.withinDimensionWeight)), 1);
  });
});

test("synthetic test-only regional endpoint vectors retain 0 and 100 without score rounding", () => {
  for (const endpoint of [0, 100]) {
    const input = deepFreeze(syntheticRegion(endpoint));
    const output = scoreRegion2023(input, model);
    near(output.overallPressureScore, endpoint);
    for (const dimension of output.dimensions) near(dimension.score, endpoint);
    for (const indicator of output.indicators) assert.equal(indicator.normalizedPressure, endpoint);
  }
});
