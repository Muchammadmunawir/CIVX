import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { scorePressure, assertPolicy, assertV2Release, verifiedAdvantages } from "../src/lib/civx/v2/model.ts";

const release = JSON.parse(readFileSync(new URL("../data/processed/civx-jabar-2023-current.json", import.meta.url), "utf8"));
const policy = release.methodology;
const indicators = policy.dimensions.flatMap(dimension => dimension.indicators);
const score = (region, observations = region.observations, sources = release.sources) =>
  scorePressure(observations, policy, sources, release.artifacts, region.id);
const near = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);

test("current publication uses one complete contract for exactly 27 Jawa Barat regions", () => {
  assertV2Release(release);
  const expectedIds = [...Array.from({ length: 18 }, (_, index) => String(3201 + index)), ...Array.from({ length: 9 }, (_, index) => String(3271 + index))];
  assert.deepEqual(release.regions.map(region => region.id).sort(), expectedIds.sort());
  assert.equal(release.qualityAudit.scored, 27);
  assert.deepEqual(release.qualityAudit.withheld, []);
  assert.ok(indicators.length > 4);
  const common = indicators.map(indicator => indicator.id).sort();
  for (const region of release.regions) {
    const core = region.observations.filter(observation => observation.kind === "core_score_indicator");
    assert.deepEqual(core.map(observation => observation.indicatorId).sort(), common, region.id);
    assert.ok(core.every(observation => Number.isFinite(observation.value) && observation.period === "2023"));
    assert.deepEqual(score(region), region.pressure);
  }
});

test("read boundary rejects missing core observations and duplicated scoring components", () => {
  for (const mutate of [
    region => { region.observations = region.observations.filter(observation => observation.indicatorId !== indicators[0].id); },
    region => { region.pressure.dimensions[0].components[1] = structuredClone(region.pressure.dimensions[0].components[0]); },
    region => { region.pressure.dimensions[1] = structuredClone(region.pressure.dimensions[0]); },
  ]) {
    const invalid = structuredClone(release);
    mutate(invalid.regions[0]);
    assert.throws(() => assertV2Release(invalid));
  }
});

test("artifact receipts cannot present audited-input replay as full original-byte verification", () => {
  const invalid = structuredClone(release);
  invalid.sourceVerification.mode = "original_artifacts";
  invalid.sourceVerification.artifacts[0].state = "fingerprinted_transcription_only";
  assert.throws(() => assertV2Release(invalid));
  invalid.sourceVerification = undefined;
  assert.throws(() => assertV2Release(invalid));
});

test("dimension budgets and effective core weights each sum to one", () => {
  near(policy.dimensions.reduce((total, dimension) => total + dimension.weight, 0), 1);
  let effective = 0;
  for (const dimension of policy.dimensions) {
    near(dimension.indicators.reduce((total, indicator) => total + indicator.withinDimensionWeight, 0), 1);
    effective += dimension.indicators.reduce((total, indicator) => total + dimension.weight * indicator.withinDimensionWeight, 0);
  }
  near(effective, 1);
  const invalid = structuredClone(policy);
  invalid.dimensions[0].weight += 0.01;
  assert.throws(() => assertPolicy(invalid), /weights/i);
});

test("every missing core input withholds the whole current index without silent reweighting", () => {
  const region = release.regions[0];
  for (const indicator of indicators) {
    const missing = region.observations.filter(observation => observation.indicatorId !== indicator.id);
    assert.equal(score(region, missing).status, "unavailable", indicator.id);
    const nullValue = structuredClone(region.observations);
    nullValue.find(observation => observation.indicatorId === indicator.id).value = null;
    assert.equal(score(region, nullValue).status, "unavailable", indicator.id);
  }
});

test("Puskesmas availability preserves exact population, numerator and published rate formula", () => {
  for (const region of release.regions) {
    const rate = region.observations.find(observation => observation.indicatorId === "puskesmas_per_100k");
    const count = region.observations.find(observation => observation.indicatorId === "puskesmas_count");
    const population = region.observations.find(observation => observation.indicatorId === "population");
    assert.equal(rate.kind, "core_score_indicator");
    assert.equal(rate.denominator.value, population.value);
    assert.equal(rate.derivation.numeratorValue, count.value);
    assert.ok(Number.isInteger(count.value) && count.value >= 0);
    assert.ok(Number.isInteger(population.value) && population.value > 0);
    near(rate.value, count.value / population.value * 100000);
    assert.ok(rate.provenance.some(reference => reference.sourceId === rate.denominator.sourceId));
    assert.ok(rate.derivation.formula);
  }
  assert.equal(indicators.find(indicator => indicator.id === "puskesmas_per_100k").direction, "lower");
});

test("published DBD incidence remains official rate, not replacement case/population ratio", () => {
  const bogor = release.regions.find(region => region.id === "3201");
  const incidence = bogor.observations.find(observation => observation.indicatorId === "dbd_incidence");
  assert.equal(incidence.kind, "core_score_indicator");
  assert.equal(incidence.value, 31);
  assert.equal(incidence.derivation, null);
  assert.equal(indicators.find(indicator => indicator.id === "dbd_incidence").direction, "higher");
  const original = JSON.parse(readFileSync(new URL("../data/raw/v2/services-observations.json", import.meta.url), "utf8"));
  for (const region of release.regions) {
    const published = original.observations.find(observation => observation.regionId === region.id && observation.indicatorId === "dbd_incidence");
    assert.equal(region.observations.find(observation => observation.indicatorId === "dbd_incidence").value, published.value);
  }
});

test("facility subcategory dashes do not silently become zero or missing total facilities", () => {
  const raw = JSON.parse(readFileSync(new URL("../data/raw/current/services-observations.json", import.meta.url), "utf8"));
  assert.equal(raw.facilityBreakdown.length, 27);
  let total = 0;
  for (const row of raw.facilityBreakdown) {
    const observation = release.regions.find(region => region.id === row.regionId).observations.find(item => item.indicatorId === "puskesmas_count");
    assert.equal(observation.value, row.total);
    total += row.total;
    if (row.inpatient.published === "-") {
      assert.equal(row.inpatient.value, null);
      assert.equal(row.nonInpatient.value, row.total);
    } else {
      assert.equal(row.inpatient.value + row.nonInpatient.value, row.total);
    }
  }
  assert.equal(total, 1106);
});

test("higher official disaster risk raises modeled resilience pressure", () => {
  const dimension = policy.dimensions.find(item => item.id === "resilience");
  const risk = dimension.indicators.find(indicator => indicator.id === "disaster_risk");
  assert.equal(risk.direction, "higher");
  const region = release.regions[0];
  const observations = structuredClone(region.observations);
  const observation = observations.find(item => item.indicatorId === risk.id);
  observation.value = risk.minimum;
  const minimum = score(region, observations);
  observation.value = risk.maximum;
  const maximum = score(region, observations);
  assert.equal(minimum.dimensions.find(item => item.id === "resilience").score, 0);
  assert.equal(maximum.dimensions.find(item => item.id === "resilience").score, 100);
  assert.ok(maximum.score > minimum.score);
});

test("road condition stays context when network or denominator comparability fails", () => {
  const road = release.candidates.find(candidate => candidate.id === "road_condition");
  assert.equal(road.classification, "context");
  assert.notEqual(road.status, "available");
  assert.equal(indicators.some(indicator => indicator.id === road.id), false);
  assert.equal(release.exploreLayers.some(layer => layer.id === "infrastructure"), false);
  const region = release.regions[0];
  const altered = structuredClone(region.observations);
  altered.find(observation => observation.indicatorId === road.id).value = 100;
  assert.deepEqual(score(region, altered), region.pressure);
});

test("source years, units and administrative geography cannot silently drift in current core", () => {
  const region = release.regions[0];
  for (const change of [{ period: "2022" }, { unit: "raw cases" }, { comparabilityStatus: "incompatible_geography" }]) {
    const observations = structuredClone(region.observations);
    Object.assign(observations.find(observation => observation.kind === "core_score_indicator"), change);
    assert.equal(score(region, observations).status, "unavailable");
  }
  const sources = structuredClone(release.sources);
  const sourceId = indicators[0].sourceId;
  sources.find(source => source.id === sourceId).dataYear = 2024;
  assert.equal(score(region, region.observations, sources).status, "unavailable");
});

test("full precision contributions reconstruct Civic Index before independent publication rounding", () => {
  for (const region of release.regions) {
    let total = 0;
    for (const dimension of policy.dimensions) {
      let dimensionScore = 0;
      for (const indicator of dimension.indicators) {
        const raw = region.observations.find(observation => observation.indicatorId === indicator.id).value;
        const position = (raw - indicator.minimum) / (indicator.maximum - indicator.minimum);
        dimensionScore += 100 * (indicator.direction === "higher" ? position : 1 - position) * indicator.withinDimensionWeight;
      }
      total += dimensionScore * dimension.weight;
      const released = region.pressure.dimensions.find(item => item.id === dimension.id);
      near(released.score, Math.round(dimensionScore * 100) / 100);
      near(released.components.reduce((sum, component) => sum + component.contribution, 0), released.contribution, dimension.indicators.length * 0.005 + 0.005 + 1e-10);
    }
    near(region.pressure.score, Math.round(total * 100) / 100);
    near(region.pressure.dimensions.reduce((sum, dimension) => sum + dimension.contribution, 0), region.pressure.score, policy.dimensions.length * 0.005 + 0.005 + 1e-10);
  }
});

test("context and verified capabilities remain non-scoring evidence, not absence penalties", () => {
  const positives = [];
  for (const region of release.regions) {
    assert.deepEqual(score(region, region.observations.filter(observation => observation.kind === "core_score_indicator")), region.pressure);
    positives.push(...verifiedAdvantages(region.observations, policy, release.sources, release.artifacts, region.id).map(observation => [region.id, observation.indicatorId]));
    const density = region.observations.find(observation => observation.indicatorId === "population_density");
    assert.equal(density.kind, "context_indicator");
    for (const advantage of region.observations.filter(observation => observation.kind === "advantage_signal" && observation.presence === "no_comparable_data")) {
      assert.equal(advantage.value, null);
      assert.equal(advantage.verificationState, "unverified");
    }
  }
  assert.deepEqual(positives.sort(), [["3210", "operational_airport"], ["3211", "toll_road"], ["3217", "high_speed_rail"]]);
});
