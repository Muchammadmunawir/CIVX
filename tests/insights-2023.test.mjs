import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateInsights2023 } from "../src/lib/civx/insights-2023.ts";
import { scoreRegion2023 } from "../src/lib/civx/scoring-2023.ts";

const scoring = JSON.parse(readFileSync(new URL("../data/processed/civx-scores-2023.json", import.meta.url), "utf8"));
const original = JSON.stringify(scoring);
function deepFreeze(value) {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}
deepFreeze(scoring);
const output = generateInsights2023(scoring);
const resolve = pointer => pointer.slice(1).split("/").reduce((value, key) => value[key], scoring);
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);

// These deliberately synthetic cohorts exercise selection boundaries. They never
// enter generated artifacts. Existing scorer keeps all test records coherent.
function syntheticCohort(target, others = {}, indicatorOverrides = {}) {
  const input = structuredClone(scoring);
  input.regions = input.regions.map((region, index) => {
    const dimensions = index === 0 ? target : others;
    const indicators = region.indicators.map(indicator => {
      const pressure = index === 0 && Object.hasOwn(indicatorOverrides, indicator.indicatorId)
        ? indicatorOverrides[indicator.indicatorId]
        : dimensions[indicator.dimensionId] ?? 40;
      const rawValue = indicator.pressureDirection === "higher_raw_higher_pressure"
        ? indicator.minimum + pressure / 100 * (indicator.maximum - indicator.minimum)
        : indicator.maximum - pressure / 100 * (indicator.maximum - indicator.minimum);
      return { ...indicator, rawValue, normalizedPressure: pressure };
    });
    const scored = scoreRegion2023({ ...region, indicators }, input.model);
    return { ...region, ...scored };
  });
  return generateInsights2023(input).regions[0];
}

test("all frozen regions retain complete score, geography, model and comparison records", () => {
  assert.equal(output.regions.length, 27);
  assert.deepEqual(output.regions.map(region => region.regionId), scoring.regions.map(region => region.regionId));
  for (const [index, region] of output.regions.entries()) {
    const source = scoring.regions[index];
    assert.equal(region.regionName, source.regionName);
    assert.equal(region.province, source.province);
    assert.equal(region.type, source.type);
    assert.equal(region.boundaryReference, source.boundaryReference);
    assert.equal(region.modelId, source.modelId);
    assert.equal(region.modelVersion, source.modelVersion);
    assert.equal(region.referenceYear, 2023);
    assert.equal(region.overallPressureScore, source.overallPressureScore);
    assert.equal(region.dimensions.length, 6);
    assert.equal(region.indicators.length, 18);
    for (const [i, dimension] of region.dimensions.entries()) {
      const { comparison, scoringPointer, ...copied } = dimension;
      assert.deepEqual(copied, source.dimensions[i]);
      assert.deepEqual(resolve(scoringPointer), copied);
      assert.equal(comparison.value, copied.score);
    }
    for (const [i, indicator] of region.indicators.entries()) {
      const { comparison, scoringPointer, ...copied } = indicator;
      assert.deepEqual(copied, source.indicators[i]);
      assert.deepEqual(resolve(scoringPointer), copied);
      assert.equal(comparison.value, copied.normalizedPressure);
    }
  }
});

test("all 675 comparisons agree with independent below/equal counts and medians", () => {
  const panels = [
    output.regions.map(region => region.overallProfile),
    ...Array.from({ length: 6 }, (_, index) => output.regions.map(region => region.dimensions[index].comparison)),
    ...Array.from({ length: 18 }, (_, index) => output.regions.map(region => region.indicators[index].comparison)),
  ];
  for (const panel of panels) {
    const sorted = panel.map(item => item.value).sort((a, b) => a - b);
    for (const item of panel) {
      const below = panel.filter(other => other.value < item.value).length;
      const equal = panel.filter(other => other.value === item.value).length;
      const above = 27 - below - equal;
      assert.equal(item.regionsBelow, below);
      assert.equal(item.regionsAbove, above);
      assert.equal(item.tiedRegionCount, equal);
      assert.equal(item.cohortSize, 27);
      assert.equal(item.cohortMedian, sorted[13]);
      assert.equal(item.differenceFromMedian, item.value - sorted[13]);
      assert.equal(item.midrank, below + (equal + 1) / 2);
      near(item.percentile, 100 * (below + (equal - 1) / 2) / 26);
      assert.ok(Number.isFinite(item.percentile) && item.percentile >= 0 && item.percentile <= 100);
    }
  }
});

test("manually verifiable Bogor uses frozen scores and observed cohort position", () => {
  const bogor = output.regions.find(region => region.regionId === "3201");
  assert.equal(bogor.overallPressureScore, 54.65001885184166);
  assert.equal(bogor.overallProfile.regionsBelow, 16);
  assert.equal(bogor.overallProfile.regionsAbove, 10);
  near(bogor.overallProfile.percentile, 100 * 16 / 26);
  assert.equal(bogor.overallProfile.classification, "higher_middle");
  const education = bogor.dimensions.find(dimension => dimension.dimensionId === "education");
  near(education.score, (100 * 329 / 472 + 100 * 165 / 238 + 100 * 2082 / 2106) / 3);
  assert.ok(bogor.selection.mainPressureDimensionIds.includes("education"));
  const apm = bogor.indicators.find(indicator => indicator.indicatorId === "apm");
  assert.equal(apm.comparison.regionsBelow, 25);
  assert.equal(apm.comparison.regionsAbove, 1);
  near(apm.contributionToDimension, (100 * 2082 / 2106) / 3);
  near(apm.contributionToOverall, (100 * 2082 / 2106) / 18);
  const insight = bogor.insights.find(item => item.type === "standout_indicator" && item.evidence.indicators.some(indicator => indicator.indicatorId === "apm"));
  assert.ok(insight);
});

test("high dimension requires cohort elevation, not numerical maximum alone", () => {
  const region = syntheticCohort({ education: 90, public_health: 70 }, { education: 95, public_health: 40 });
  assert.equal(region.selection.mainPressureDimensionIds.includes("education"), false);
  assert.deepEqual(region.selection.mainPressureDimensionIds, ["public_health"]);
});

test("close high dimensions share one insight without selecting an artificial winner", () => {
  const region = syntheticCohort({ education: 80, public_health: 79, basic_services: 77 });
  const main = region.insights.filter(item => item.type === "main_pressure");
  assert.equal(main.length, 1);
  assert.deepEqual(main[0].evidence.dimensions.map(item => item.dimensionId), ["education", "basic_services", "public_health"]);
  near(region.selection.topDimensionGap, 1);
});

test("exact dimension and indicator ties retain every co-leader", () => {
  const region = syntheticCohort({ education: 80, public_health: 80 });
  const main = region.insights.find(item => item.type === "main_pressure");
  assert.deepEqual(main.evidence.dimensions.map(item => item.dimensionId), ["education", "public_health"]);
  const education = region.insights.find(item => item.type === "standout_indicator" && item.evidence.dimensions[0].dimensionId === "education");
  assert.deepEqual(education.evidence.indicators.map(item => item.indicatorId), ["rls", "hls", "apm"]);
  assert.equal(region.selection.topDimensionGap, 0);
});

test("additional top-quintile dimension can stand out below the leading score cluster", () => {
  const region = syntheticCohort({ disaster_pressure: 90, education: 70 });
  assert.equal(region.insights.filter(item => item.type === "main_pressure").length, 2);
  assert.deepEqual(region.selection.mainPressureDimensionIds, ["disaster_pressure", "education"]);
});

test("lower pressure requires both cohort and within-region evidence and preserves close ties", () => {
  const region = syntheticCohort({ education: 10, public_health: 12 });
  const lower = region.insights.find(item => item.type === "relative_strength");
  assert.deepEqual(lower.evidence.dimensions.map(item => item.dimensionId), ["education", "public_health"]);
  for (const dimension of lower.evidence.dimensions) {
    assert.ok(dimension.comparison.percentile < 40);
    assert.ok(dimension.comparison.differenceFromMedian <= -5);
    assert.ok(dimension.score <= region.selection.regionalDimensionMedian - 5);
  }
  const notLowInCohort = syntheticCohort({ education: 10 }, { education: 0 });
  assert.equal(notLowInCohort.selection.lowerPressureDimensionIds.includes("education"), false);
});

test("small median gaps and flat cohorts do not manufacture pressure or strength claims", () => {
  const tiny = syntheticCohort({ education: 44, public_health: 36 });
  assert.deepEqual(tiny.selection.mainPressureDimensionIds, []);
  assert.deepEqual(tiny.selection.lowerPressureDimensionIds, []);
  assert.deepEqual(tiny.insights.map(item => item.type), ["overall_profile"]);
  const flat = syntheticCohort({});
  assert.equal(flat.overallProfile.percentile, 50);
  assert.deepEqual(flat.insights.map(item => item.type), ["overall_profile"]);
});

test("indicator attribution preserves normalized pressure and both distinct contribution levels", () => {
  for (const region of output.regions) {
    for (const insight of region.insights.filter(item => item.type === "standout_indicator")) {
      const dimension = insight.evidence.dimensions[0];
      const members = region.indicators.filter(item => item.dimensionId === dimension.dimensionId);
      assert.ok(members.length > 1);
      assert.ok(region.selection.mainPressureDimensionIds.includes(dimension.dimensionId));
      for (const indicator of insight.evidence.indicators) {
        assert.equal(indicator.dimensionId, dimension.dimensionId);
        assert.ok(indicator.comparison.percentile >= 80);
        assert.ok(indicator.contributionToDimension >= dimension.score / members.length - 1e-10);
        near(indicator.contributionToDimension, indicator.normalizedPressure * indicator.withinDimensionWeight);
        near(indicator.contributionToOverall, indicator.normalizedPressure * indicator.effectiveWeight);
        assert.notEqual(indicator.normalizedPressure, indicator.contributionToOverall);
        assert.notEqual(indicator.contributionToDimension, indicator.contributionToOverall);
      }
    }
  }
});

test("high normalized pressure alone does not guarantee a standout indicator insight", () => {
  const region = syntheticCohort({ education: 80 }, {}, { rls: 95, hls: 80, apm: 65 });
  const insight = region.insights.find(item => item.type === "standout_indicator");
  assert.deepEqual(insight.evidence.indicators.map(item => item.indicatorId), ["rls"]);
  const apm = region.indicators.find(item => item.indicatorId === "apm");
  assert.equal(apm.comparison.percentile, 100);
  assert.ok(apm.contributionToDimension < insight.evidence.dimensions[0].score / 3);
});

test("singleton coefficients remain explicit without duplicate indicator paragraphs", () => {
  const region = syntheticCohort({ disaster_pressure: 90, environment: 89 });
  const main = region.insights.find(item => item.type === "main_pressure");
  assert.deepEqual(main.evidence.indicators.map(item => item.indicatorId), ["irbi_overall_2023", "iklh_2023"]);
  for (const indicator of main.evidence.indicators) {
    assert.equal(indicator.effectiveWeight, 1 / 6);
    assert.equal(indicator.withinDimensionWeight, 1);
  }
  assert.equal(region.insights.some(item => item.type === "standout_indicator"), false);
});

test("every insight resolves to actual scored evidence with no unsupported IDs", () => {
  for (const region of output.regions) {
    const source = resolve(region.scoringPointer);
    assert.equal(source.regionId, region.regionId);
    const ids = new Set();
    const messages = new Set();
    for (const [index, insight] of region.insights.entries()) {
      assert.equal(insight.regionId, region.regionId);
      assert.equal(insight.scope, "CORE");
      assert.equal(insight.priority, index + 1);
      assert.ok(!ids.has(insight.insightId));
      ids.add(insight.insightId);
      assert.ok(insight.title.trim());
      assert.ok(insight.message.trim());
      assert.ok(!messages.has(insight.message));
      messages.add(insight.message);
      if (insight.evidence.overall) {
        assert.equal(resolve(insight.evidence.overall.scoringPointer), source.overallPressureScore);
        assert.deepEqual(insight.evidence.overall.comparison, region.overallProfile);
      }
      for (const dimension of insight.evidence.dimensions) {
        assert.deepEqual(dimension, region.dimensions.find(item => item.dimensionId === dimension.dimensionId));
        assert.equal(resolve(dimension.scoringPointer).dimensionId, dimension.dimensionId);
      }
      for (const indicator of insight.evidence.indicators) {
        assert.deepEqual(indicator, region.indicators.find(item => item.indicatorId === indicator.indicatorId));
        assert.equal(resolve(indicator.scoringPointer).indicatorId, indicator.indicatorId);
        assert.ok(insight.evidence.dimensions.some(item => item.dimensionId === indicator.dimensionId));
      }
    }
    assert.ok(region.insights.length <= 6);
    assert.equal(region.insights[0].type, "overall_profile");
  }
});

test("generated primary language contains no unsupported absolute, causal, policy, or contextual claims", () => {
  const prohibited = /\b(best region|worst region|safe|unsafe|healthy|unhealthy|successful government|failed government|causes|will cause|citizens are stressed|residents are unhappy|terbaik|terburuk|aman|tidak aman|kota sehat|kota tidak sehat|pemerintah berhasil|pemerintah gagal|menyebabkan|akan menyebabkan|warga stres|warga tidak bahagia|harus|sebaiknya|kemacetan|kriminalitas|lalu lintas)\b/i;
  for (const region of output.regions) {
    for (const insight of region.insights) assert.doesNotMatch(`${insight.title} ${insight.message}`, prohibited);
  }
  assert.equal(output.locale, "id");
  assert.equal(output.scope, "CORE");
  assert.equal(output.publicRankingGenerated, false);
  assert.equal(output.productionIntegrationAuthorized, false);
});

test("repeated generation is byte-identical and never mutates frozen scoring records", () => {
  assert.equal(JSON.stringify(generateInsights2023(scoring)), JSON.stringify(output));
  assert.equal(JSON.stringify(scoring), original);
});

test("output metadata does not alias mutable input metadata", () => {
  const input = structuredClone(scoring);
  const result = generateInsights2023(input);
  result.regions[0].indicators[0].expectedBounds.minimum = -100;
  assert.equal(input.regions[0].indicators[0].expectedBounds.minimum, 0);
});
