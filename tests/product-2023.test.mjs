import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  getRegionProductView2023,
  getExploreRegionsProduct2023,
  getComparisonProductView2023,
  getProductMethodology2023,
} from "../src/lib/civx/product-2023.ts";
import { getRegions2023, getRegionProfile2023 } from "../src/lib/civx/repository-2023.ts";
import { compareRegions2023, CivxComparisonRegionNotFoundError2023 } from "../src/lib/civx/comparison-2023.ts";

const ids = [
  ...Array.from({ length: 18 }, (_, index) => String(3201 + index)),
  ...Array.from({ length: 9 }, (_, index) => String(3271 + index)),
];
const dimensionIds = ["socioeconomic", "education", "basic_services", "public_health", "disaster_pressure", "environment"];
const indicatorIds = [
  "poverty", "unemployment", "gini_ratio", "expenditure_per_capita", "rls", "hls", "apm", "sanitation",
  "drinking_water", "puskesmas_per_100k", "household-floor-per-capita-le7-2", "health_insurance_ownership",
  "nutrition_ski2023_stunting", "nutrition_ski2023_wasting", "morbidity_activity_limiting",
  "life_expectancy_lfsp2020", "irbi_overall_2023", "iklh_2023",
];
const datasetIds = [
  "context_traffic_bandung_2024_after_speed",
  "context_traffic_bandung_2024_after_vc_ratio",
  "context_transport_type_c_terminal_inventory_2023",
  "context_transport_commuter_share_jabodetabek_2023",
  "context_crime_podes_theft_villages_jabar_2024",
  "context_air_pollution_klh_site_ispu_20261029",
  "context_air_pollution_klh_site_pm25_ispu_20261029",
];
const profiles = new Map(ids.map(id => [id, getRegionProfile2023(id)]));
const invalidIds = ["", "3200", "3219", "3270", "3280", "Bogor", "Kabupaten Bogor", "Kota Bandung", "Bandung", " ", "\t", " 3201", "3201 ", "\n3271", "03201", "2024"];

function header(region) {
  const { id, name, type, province, referenceYear } = region;
  return { id, name, type, province, referenceYear };
}

function dimension({ scope, dimensionId, displayName, score }) {
  return { scope, dimensionId, displayName, score };
}

function contextItems(id) {
  return getRegionProductView2023(id).context.flatMap(section => section.items);
}

function contextItem(id, datasetId) {
  const item = contextItems(id).find(item => item.datasetId === datasetId);
  assert.ok(item, `${id}: ${datasetId}`);
  return item;
}

function sourceContextItem(id, datasetId) {
  const item = profiles.get(id).context.find(item => item.dataset.datasetId === datasetId);
  assert.ok(item, `${id}: source ${datasetId}`);
  return item;
}

function comparisonCore({ scope, overall, dimensions, indicators, highlights, metadata }) {
  return { scope, overall, dimensions, indicators, highlights, metadata };
}

function visitObjects(value, inspect, seen = new WeakSet()) {
  if (value === null || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  inspect(value);
  for (const child of Object.values(value)) visitObjects(child, inspect, seen);
}

function assertDeepFrozen(value) {
  visitObjects(value, item => assert.ok(Object.isFrozen(item), "Every exposed object and array must be frozen"));
}

function assertNoContextComparison(value) {
  visitObjects(value, item => {
    for (const key of Object.keys(item)) {
      assert.doesNotMatch(key, /delta|difference|relation|winner|ranking|normalizedPressure|overallScore|contribution|weight/i,
        `Context must not expose comparison or scoring field ${key}`);
    }
  });
}

test("all 27 region views preserve canonical BPS identity and compact five-field headers", () => {
  assert.deepEqual(getRegions2023().map(region => region.id), ids);
  const views = ids.map(getRegionProductView2023);
  assert.equal(new Set(views.map(view => view.region.id)).size, 27);
  for (const [index, id] of ids.entries()) {
    assert.deepEqual(views[index].region, header(profiles.get(id).region));
  }
  for (const [county, city, name] of [
    ["3201", "3271", "Bogor"], ["3202", "3272", "Sukabumi"], ["3204", "3273", "Bandung"],
    ["3209", "3274", "Cirebon"], ["3216", "3275", "Bekasi"], ["3206", "3278", "Tasikmalaya"],
  ]) {
    assert.equal(getRegionProductView2023(county).region.name, `Kabupaten ${name}`);
    assert.equal(getRegionProductView2023(county).region.type, "kabupaten");
    assert.equal(getRegionProductView2023(city).region.name, `Kota ${name}`);
    assert.equal(getRegionProductView2023(city).region.type, "kota");
  }
});

test("region lookup rejects unknown, padded, named and non-string IDs without coercion", () => {
  for (const id of [...invalidIds, 3201, null, undefined]) {
    assert.equal(getRegionProductView2023(id), undefined, JSON.stringify(id));
  }
});

test("every CORE view preserves exact overall values, six dimensions, 18 indicators and original insight records", () => {
  for (const id of ids) {
    const actual = getRegionProductView2023(id).core;
    const source = profiles.get(id).core;
    assert.equal(actual.scope, "CORE");
    assert.equal(actual.overallScore, source.overallScore);
    assert.equal(actual.dimensions.length, 6);
    assert.equal(actual.indicators.length, 18);
    assert.deepEqual(actual.dimensions.map(item => item.dimensionId), dimensionIds);
    assert.deepEqual(actual.indicators.map(item => item.indicatorId), indicatorIds);
    assert.deepEqual(actual.dimensions, source.dimensions.map(dimension));
    for (const [index, indicator] of actual.indicators.entries()) {
      const original = source.indicators[index];
      for (const key of ["scope", "indicatorId", "displayName", "dimensionId", "rawValue", "unit", "normalizedPressure", "pressureDirection"]) {
        assert.equal(indicator[key], original[key], `${id}/${original.indicatorId}/${key}`);
      }
      assert.equal(indicator.dimensionName, source.dimensions.find(item => item.dimensionId === original.dimensionId).displayName);
      assert.equal(indicator.referencePeriod, original.evidence.indicator.referencePeriod);
    }
    assert.deepEqual(actual.insights, source.insights);
    assert.ok(actual.insights.every(insight => insight.scope === "CORE"));
  }
});

test("indicator disclosure retains definitions, source locators, limits and authoritative evidence pointers", () => {
  for (const id of ids) {
    const actual = getRegionProductView2023(id).core.indicators;
    for (const [index, source] of profiles.get(id).core.indicators.entries()) {
      const { indicator: frozen, scoringPointer } = source.evidence;
      const disclosure = actual[index].disclosure;
      assert.equal(disclosure.definition, frozen.definition);
      assert.equal(disclosure.numerator, frozen.numerator.definition);
      assert.equal(disclosure.denominator, frozen.denominator.definition);
      for (const limitation of frozen.limitations) assert.ok(disclosure.limitations.includes(limitation));
      assert.equal(disclosure.source.sourceId, frozen.sourceReference.artifactId);
      assert.equal(disclosure.source.publisher, frozen.sourceReference.publisher);
      assert.equal(disclosure.source.url, frozen.sourceReference.url);
      assert.equal(disclosure.source.title, frozen.sourceReference.title ?? null);
      assert.equal(disclosure.source.accessedAt, frozen.sourceReference.accessedAt ?? null);
      assert.ok(disclosure.source.locator.includes(frozen.sourceReference.table));
      assert.equal(disclosure.source.publicationDate, frozen.sourceReference.publicationDate ?? null);
      assert.equal(disclosure.scoringPointer, scoringPointer);
      for (const key of ["frozenIndicatorPointer", "frozenValuePointer", "normalizationValuePointer"]) {
        assert.equal(disclosure[key], source[key]);
      }
    }
  }
});

test("published row confidence intervals, standard errors and RSE flags survive normalized disclosure", () => {
  for (const id of ids) {
    const actual = getRegionProductView2023(id).core.indicators;
    for (const [index, source] of profiles.get(id).core.indicators.entries()) {
      const row = source.evidence.observation;
      const uncertainty = actual[index].disclosure.uncertainty;
      if (row.uncertainty) {
        const published = row.uncertainty;
        assert.deepEqual(uncertainty.confidenceInterval, {
          confidenceLevel: published.confidenceLevel,
          lower: published.lower,
          upper: published.upper,
        });
        assert.equal(uncertainty.standardErrorPercentagePoints, published.standardErrorPercentagePoints ?? null);
        assert.equal(uncertainty.relativeStandardErrorPercent, published.relativeStandardErrorPercent ?? null);
        assert.equal(uncertainty.rseGreaterThan25Percent, published.rseGreaterThan25Percent ?? null);
      } else if (row.precision) {
        const precision = row.precision;
        assert.equal(uncertainty.standardErrorPercentagePoints,
          precision.derivedAnyCoverageStandardErrorPercentagePoints ?? precision.standardErrorPercentagePoints ?? null);
        assert.equal(uncertainty.relativeStandardErrorPercent, precision.relativeStandardErrorPercent ?? null);
        assert.deepEqual(uncertainty.confidenceInterval, precision.confidenceInterval95 ? {
          confidenceLevel: 0.95,
          lower: precision.confidenceInterval95[0],
          upper: precision.confidenceInterval95[1],
        } : null);
      } else {
        assert.equal(uncertainty.confidenceInterval, null);
        assert.equal(uncertainty.standardErrorPercentagePoints, null);
        assert.equal(uncertainty.relativeStandardErrorPercent, null);
        assert.equal(uncertainty.rseGreaterThan25Percent, null);
      }
      const note = source.evidence.indicator.uncertainty;
      if (typeof note === "string") assert.equal(uncertainty.note, note);
      if (note && typeof note === "object") assert.ok(uncertainty.note.includes(note.type));
    }
  }
  const insurance = getRegionProductView2023("3201").core.indicators.find(item => item.indicatorId === "health_insurance_ownership");
  assert.equal(insurance.disclosure.uncertainty.standardErrorPercentagePoints, 1.68);
  assert.equal(insurance.disclosure.uncertainty.relativeStandardErrorPercent, null,
    "No-insurance RSE is not the complemented ownership estimate's RSE");
});

test("uncertainty keeps precision locators and weighted nutrition bases without inventing sample sizes", () => {
  for (const id of ids) {
    for (const source of profiles.get(id).core.indicators) {
      const actual = getRegionProductView2023(id).core.indicators.find(item => item.indicatorId === source.indicatorId).disclosure.uncertainty;
      const row = source.evidence.observation;
      assert.equal(actual.weightedDenominator, row.denominator?.weightedN ?? null);
      assert.equal(actual.unweightedSampleSize, row.denominator?.unweightedN ?? null);
      if (row.uncertainty?.locator) assert.ok(actual.sourceLocator.includes(row.uncertainty.locator));
      if (row.precision?.table) assert.ok(actual.sourceLocator.includes(row.precision.table));
      if (row.precision?.sourceTable) assert.ok(actual.sourceLocator.includes(row.precision.sourceTable));
      if (row.precision?.note) assert.ok(actual.note.includes(row.precision.note));
    }
  }
  for (const indicatorId of ["nutrition_ski2023_stunting", "nutrition_ski2023_wasting"]) {
    const actual = getRegionProductView2023("3201").core.indicators.find(item => item.indicatorId === indicatorId).disclosure.uncertainty;
    assert.equal(actual.weightedDenominator, 6093);
    assert.equal(actual.unweightedSampleSize, null, "Published N tertimbang is not an unweighted district sample size");
  }
});

test("Puskesmas disclosure retains distinct facility numerator and exact-person population denominator sources", () => {
  for (const id of ids) {
    const source = profiles.get(id).core.indicators.find(item => item.indicatorId === "puskesmas_per_100k").evidence.indicator;
    const actual = getRegionProductView2023(id).core.indicators.find(item => item.indicatorId === "puskesmas_per_100k").disclosure;
    for (const [key, original] of [["numeratorSource", source.numerator.source], ["denominatorSource", source.denominator.source]]) {
      assert.equal(actual[key].sourceId, original.artifactId);
      assert.equal(actual[key].publisher, original.publisher);
      assert.equal(actual[key].title, original.title);
      assert.equal(actual[key].url, original.url);
      assert.equal(actual[key].accessedAt, original.accessedAt);
      assert.ok(actual[key].locator.includes(original.table));
    }
    assert.notEqual(actual.numeratorSource.sourceId, actual.denominatorSource.sourceId);
  }
  const poverty = getRegionProductView2023("3201").core.indicators.find(item => item.indicatorId === "poverty").disclosure;
  assert.equal(poverty.numeratorSource, null);
  assert.equal(poverty.denominatorSource, null);
  const nutrition = getRegionProductView2023("3201").core.indicators.find(item => item.indicatorId === "nutrition_ski2023_stunting").disclosure;
  assert.equal(nutrition.denominatorSource, null, "A text-only table note is not a fabricated source receipt");
});

test("Explore returns 27 BPS-ordered lightweight summaries without detail, context or implicit rankings", () => {
  const actual = getExploreRegionsProduct2023();
  assert.equal(actual.length, 27);
  assert.deepEqual(actual.map(item => item.region.id), ids);
  assert.deepEqual(actual, ids.map(id => ({
    region: header(profiles.get(id).region),
    core: {
      scope: "CORE",
      overallScore: profiles.get(id).core.overallScore,
      dimensions: profiles.get(id).core.dimensions.map(dimension),
    },
  })));
  visitObjects(actual, item => {
    for (const key of Object.keys(item)) {
      assert.ok(!["rank", "ranking", "position", "indicators", "insights", "context", "disclosure", "evidence", "methodology", "metadata"].includes(key),
        `Explore must not carry ${key}`);
    }
  });
});

test("every region has seven context items grouped into three ordered sections outside CORE", () => {
  for (const id of ids) {
    const view = getRegionProductView2023(id);
    assert.deepEqual(view.context.map(section => section.sectionId), ["mobility_transport", "public_safety_context", "environmental_context"]);
    assert.deepEqual(view.context.map(section => section.items.map(item => item.datasetId)), [datasetIds.slice(0, 4), datasetIds.slice(4, 5), datasetIds.slice(5)]);
    for (const section of view.context) {
      assert.equal(section.scope, "CONTEXT");
      assert.equal(section.coreScoreAffected, false);
      for (const item of section.items) {
        assert.equal(item.scope, "CONTEXT");
        assert.equal(item.coreScoreAffected, false);
      }
    }
    assert.equal("context" in view.core, false);
    assertNoContextComparison(view.context);
  }
});

test("context availability, observations and compact source receipts preserve audited domain evidence", () => {
  const statuses = { published_region_value: "AVAILABLE", missing: "NOT_COVERED", site_observations_only: "SITE_OBSERVATIONS_ONLY" };
  for (const id of ids) {
    for (const item of contextItems(id)) {
      const { dataset, record } = sourceContextItem(id, item.datasetId);
      assert.equal(item.availability, statuses[record.valueStatus]);
      assert.equal(item.value, record.value);
      assert.equal(item.missingReason, record.missingReason);
      if (item.availability === "AVAILABLE") {
        assert.equal(typeof item.value, "number");
        assert.ok(Number.isFinite(item.value));
        assert.equal(item.missingReason, null);
      } else {
        assert.equal(item.value, null);
        assert.ok(item.missingReason.length > 0);
      }
      for (const key of ["unit", "definition", "numerator", "denominator", "geographicLevel"]) assert.equal(item[key], dataset[key]);
      assert.equal(item.referencePeriod, record.referencePeriod);
      assert.deepEqual(item.coverage, { coveredRegions: dataset.coverage.regionCount, totalRegions: 27 });
      assert.deepEqual(item.observations, record.observations.map(observation => ({
        observationId: observation.observationId,
        geographicLevel: observation.geographicLevel,
        siteId: observation.siteId,
        siteName: observation.siteName,
        period: observation.period,
        value: observation.value,
        unit: observation.unit,
        sourceId: observation.sourceRef,
        sourceLocator: observation.sourceLocator,
        sourceValue: observation.sourceValue,
        limitations: observation.limitations,
        evidencePointer: observation.evidencePointer,
      })));
      assert.deepEqual(item.sources.map(source => source.sourceId), dataset.sources.map(source => source.sourceId));
      for (const [index, source] of item.sources.entries()) {
        const original = dataset.sources[index];
        for (const key of ["sourceId", "publisher", "title", "url", "publicationDate", "accessedAt"]) assert.equal(source[key], original[key]);
        assert.ok(source.locator === null || typeof source.locator === "string");
      }
      for (const limitation of [...dataset.limitations, ...dataset.knownBiases]) {
        assert.ok(item.disclosure.limitations.includes(limitation), `${id}/${item.datasetId}: ${limitation}`);
      }
      assert.equal(item.disclosure.temporalWarning, dataset.temporalWarning);
      assert.equal(item.disclosure.usageNotes, dataset.licenseOrUsageNotes);
      assert.equal(item.disclosure.comparisonPermitted, false);
      assert.equal(item.disclosure.comparisonReason, dataset.comparability.reason);
      for (const key of ["artifactPath", "rawAuditPath", "candidatePointer"]) assert.equal(item.disclosure[key], dataset[key]);
      visitObjects(item, value => {
        assert.equal("sourceManifest" in value, false);
        assert.equal("computationManifest" in value, false);
      });
    }
  }
});

test("commuter context covers exactly five regions and leaves 22 unavailable shares null", () => {
  const covered = ["3201", "3216", "3271", "3275", "3276"];
  const available = [];
  const missing = [];
  for (const id of ids) {
    const actual = contextItem(id, datasetIds[3]);
    assert.equal(actual.coverage.coveredRegions, 5);
    if (covered.includes(id)) {
      available.push(id);
      assert.equal(actual.availability, "AVAILABLE");
      assert.equal(actual.value, sourceContextItem(id, datasetIds[3]).record.value);
    } else {
      missing.push(id);
      assert.equal(actual.availability, "NOT_COVERED");
      assert.equal(actual.value, null);
      assert.deepEqual(actual.observations, []);
    }
  }
  assert.deepEqual(available, covered);
  assert.equal(missing.length, 22);
});

test("Cirebon and Subang terminal gaps stay unavailable while Banjar published zero stays available", () => {
  for (const id of ["3209", "3213"]) {
    const actual = contextItem(id, datasetIds[2]);
    assert.equal(actual.availability, "NOT_COVERED");
    assert.equal(actual.value, null);
    assert.ok(actual.missingReason);
    assert.deepEqual(actual.observations, []);
  }
  const banjar = contextItem("3279", datasetIds[2]);
  assert.equal(banjar.availability, "AVAILABLE");
  assert.equal(banjar.value, 0);
  assert.equal(banjar.missingReason, null);
  assert.equal(banjar.observations[0].value, 0);
  assert.equal(banjar.observations[0].sourceValue, "0");
});

test("Podes discloses literal village occurrence counts and actual pre-May-2024 recall period", () => {
  for (const id of ids) {
    const actual = contextItem(id, datasetIds[4]);
    assert.equal(actual.unit, "desa/kelurahan");
    assert.equal(actual.referencePeriod, sourceContextItem(id, datasetIds[4]).record.referencePeriod);
    assert.equal(actual.availability, "AVAILABLE");
    assert.equal(actual.observations[0].period, actual.referencePeriod);
    assert.equal(actual.observations[0].unit, "desa/kelurahan");
    assert.equal(actual.observations[0].geographicLevel, "Civil kabupaten/kota");
    assert.equal(actual.disclosure.comparisonPermitted, false);
  }
  assert.equal(contextItem("3201", datasetIds[4]).value, 296);
});

test("Bandung traffic keeps eight ordered road sites per measure without creating a city mean", () => {
  for (const datasetId of datasetIds.slice(0, 2)) {
    const actual = contextItem("3273", datasetId);
    const source = sourceContextItem("3273", datasetId).record;
    assert.equal(actual.availability, "SITE_OBSERVATIONS_ONLY");
    assert.equal(actual.value, null);
    assert.equal(actual.observations.length, 8);
    assert.deepEqual(actual.observations.map(item => item.siteId), source.observations.map(item => item.siteId));
    assert.deepEqual(actual.observations.map(item => item.value), source.observations.map(item => item.value));
    assert.ok(actual.observations.every(item => item.siteId && item.siteName));
    assert.equal(contextItem("3204", datasetId).availability, "NOT_COVERED");
    assert.equal(contextItem("3204", datasetId).value, null);
    assertNoContextComparison(actual);
  }
});

test("air context preserves actual timestamps, unknown timezone, site values and dimensionless units", () => {
  for (const [datasetId, unit, bogorValue] of [
    [datasetIds[5], "ISPU (dimensionless)", 83],
    [datasetIds[6], "PM2.5 component ISPU (dimensionless)", 61],
  ]) {
    for (const id of ids) {
      const actual = contextItem(id, datasetId);
      assert.equal(actual.unit, unit);
      assert.equal(actual.referencePeriod, sourceContextItem(id, datasetId).record.referencePeriod);
      assert.equal(actual.value, null);
      for (const observation of actual.observations) {
        assert.equal(observation.unit, unit);
        assert.equal(observation.period, sourceContextItem(id, datasetId).record.observations.find(item => item.observationId === observation.observationId).period);
        assert.ok(observation.siteId);
        assert.ok(observation.siteName);
        assert.ok(observation.sourceLocator);
        assert.ok(actual.sources.some(source => source.sourceId === observation.sourceId));
      }
    }
    assert.equal(contextItem("3201", datasetId).availability, "SITE_OBSERVATIONS_ONLY");
    assert.equal(contextItem("3201", datasetId).observations[0].value, bogorValue);
    assert.equal(contextItem("3271", datasetId).availability, "NOT_COVERED");
  }
});

test("methodology preserves relative-cohort interpretation, release restrictions and compact source paths", () => {
  const actual = getProductMethodology2023();
  const source = profiles.get("3201").metadata;
  for (const key of ["referenceYear", "cohortSize", "modelId", "modelVersion", "higherIsHigherRelativePressure", "interpretation", "scoreStatus", "insightStatus", "productionIntegrationAuthorized", "publicRankingGenerated"]) {
    assert.equal(actual[key], source[key]);
  }
  assert.equal(actual.province, source.geography.province);
  assert.equal(actual.geographicLevel, source.geography.level);
  assert.deepEqual(actual.pressureScale, [0, 100]);
  assert.equal(actual.zeroMeansNoPressure, false);
  assert.equal(actual.hundredMeansTheoreticalMaximumHarm, false);
  assert.equal(actual.contextAffectsCore, false);
  assert.equal(actual.productionIntegrationAuthorized, false);
  assert.equal(actual.publicRankingGenerated, false);
  assert.deepEqual(actual.sources, {
    scoreArtifact: source.scoreArtifact,
    insightArtifact: source.insightArtifact,
    freezePath: source.provenance.freezePath,
    normalizationPath: source.provenance.normalizationPath,
    weightingPath: source.provenance.weightingPath,
    registryPath: source.geography.registry,
  });
  visitObjects(actual, value => {
    assert.equal("sourceManifest" in value, false);
    assert.equal("verifiedEvidenceManifest" in value, false);
    assert.equal("computationManifest" in value, false);
  });
});

test("all 702 ordered distinct comparisons preserve exact engine CORE values, order, metadata and highlights", () => {
  for (const a of ids) {
    for (const b of ids) {
      if (a === b) continue;
      const actual = getComparisonProductView2023(a, b);
      const expected = compareRegions2023(a, b);
      assert.equal(actual.referenceYear, 2023);
      assert.deepEqual(actual.regionA, header(profiles.get(a).region));
      assert.deepEqual(actual.regionB, header(profiles.get(b).region));
      assert.deepEqual(actual.core, comparisonCore(expected), `${a}/${b}`);
      assert.equal(actual.core.dimensions.length, 6);
      assert.equal(actual.core.indicators.length, 18);
      assert.deepEqual(actual.core.dimensions.map(item => item.dimensionId), dimensionIds);
      assert.deepEqual(actual.core.indicators.map(item => item.indicatorId), indicatorIds);
      assert.deepEqual(actual.methodology, getProductMethodology2023());
    }
  }
});

test("all 27 same-region comparisons stay valid with zero gaps and canonical tied highlights", () => {
  for (const id of ids) {
    const actual = getComparisonProductView2023(id, id);
    assert.deepEqual(actual.regionA, actual.regionB);
    assert.deepEqual(actual.core, comparisonCore(compareRegions2023(id, id)));
    for (const component of [actual.core.overall, ...actual.core.dimensions, ...actual.core.indicators]) {
      assert.equal(component.delta, 0);
      assert.equal(component.absoluteDifference, 0);
      assert.equal(component.relation, "EQUAL");
    }
    assert.deepEqual(actual.core.highlights.largestDimensionDifferences.map(item => item.dimensionId), dimensionIds.slice(0, 3));
    assert.deepEqual(actual.core.highlights.largestNormalizedPressureDifferences.map(item => item.indicatorId), indicatorIds.slice(0, 5));
    assert.deepEqual(actual.context.regionA, actual.context.regionB);
  }
});

test("invalid comparisons preserve typed errors, original ID and failing side", () => {
  for (const invalid of invalidIds) {
    for (const [a, b, side] of [[invalid, "3276", "A"], ["3273", invalid, "B"], [invalid, invalid, "A"]]) {
      assert.throws(() => getComparisonProductView2023(a, b), error => {
        assert.ok(error instanceof CivxComparisonRegionNotFoundError2023);
        assert.equal(error.code, "REGION_NOT_FOUND");
        assert.equal(error.regionId, invalid);
        assert.equal(error.side, side);
        return true;
      });
    }
  }
  assert.throws(() => getComparisonProductView2023("unknown-a", "unknown-b"), error => {
    assert.ok(error instanceof CivxComparisonRegionNotFoundError2023);
    assert.equal(error.side, "A");
    assert.equal(error.regionId, "unknown-a");
    return true;
  });
});

test("comparison context maps correct A/B regions side by side without deltas, relations or winners at any depth", () => {
  for (const [a, b] of [["3273", "3276"], ["3209", "3279"], ["3213", "3201"], ["3271", "3201"]]) {
    const actual = getComparisonProductView2023(a, b);
    const reverse = getComparisonProductView2023(b, a);
    assert.equal(actual.context.scope, "CONTEXT");
    assert.equal(actual.context.comparisonPermitted, false);
    assert.deepEqual(actual.context.regionA, getRegionProductView2023(a).context);
    assert.deepEqual(actual.context.regionB, getRegionProductView2023(b).context);
    assert.deepEqual(reverse.context.regionA, actual.context.regionB);
    assert.deepEqual(reverse.context.regionB, actual.context.regionA);
    assertNoContextComparison(actual.context);
    assert.equal("context" in actual.core, false);
  }
  const inventory = getComparisonProductView2023("3209", "3279").context;
  assert.equal(inventory.regionA[0].items[2].value, null);
  assert.equal(inventory.regionB[0].items[2].value, 0);
});


test("every region, Explore, methodology and nested comparison payload is deeply frozen", () => {
  for (const id of ids) assertDeepFrozen(getRegionProductView2023(id));
  assertDeepFrozen(getExploreRegionsProduct2023());
  assertDeepFrozen(getProductMethodology2023());
  assertDeepFrozen(getComparisonProductView2023("3273", "3276"));
  assertDeepFrozen(getComparisonProductView2023("3279", "3279"));
});

test("consumer mutation cannot alter later product results, repository profiles or engine comparisons", () => {
  const view = getRegionProductView2023("3273");
  const explore = getExploreRegionsProduct2023();
  const methodology = getProductMethodology2023();
  const comparison = getComparisonProductView2023("3273", "3276");
  const before = {
    view: structuredClone(view),
    explore: structuredClone(explore),
    methodology: structuredClone(methodology),
    comparison: structuredClone(comparison),
    repositoryA: structuredClone(getRegionProfile2023("3273")),
    repositoryB: structuredClone(getRegionProfile2023("3276")),
    engine: structuredClone(compareRegions2023("3273", "3276")),
  };
  const mutations = [
    () => { view.region.name = "Changed"; },
    () => { view.core.overallScore = 999; },
    () => { view.core.dimensions.reverse(); },
    () => { view.core.indicators[0].disclosure.source.url = "https://invalid.example"; },
    () => { view.core.indicators[0].disclosure.uncertainty.note = "Changed"; },
    () => { view.core.indicators[0].disclosure.limitations.push("Changed"); },
    () => { view.core.insights[0].message = "Changed"; },
    () => { view.context.reverse(); },
    () => { view.context[0].items[0].value = 99; },
    () => { view.context[0].items[0].observations[0].value = 99; },
    () => { view.context[0].items[0].sources[0].publisher = "Changed"; },
    () => { view.context[0].items[0].disclosure.limitations.pop(); },
    () => { explore.pop(); },
    () => { explore[0].region.id = "3279"; },
    () => { explore[0].core.dimensions[0].score = 999; },
    () => { methodology.pressureScale[0] = 1; },
    () => { methodology.sources.scoreArtifact.sha256 = "Changed"; },
    () => { methodology.notes.push("Changed"); },
    () => { comparison.regionB.id = "3201"; },
    () => { comparison.core.overall.delta = 999; },
    () => { comparison.core.indicators[0].normalizedPressureA = 999; },
    () => { comparison.core.highlights.largestDimensionDifferences.pop(); },
    () => { comparison.core.metadata.modelVersion = 999; },
    () => { comparison.context.regionA[0].items.pop(); },
    () => { comparison.presentation.relationLabels.EQUAL = "Winner"; },
  ];
  for (const mutate of mutations) assert.throws(mutate, TypeError);
  assert.deepEqual(getRegionProductView2023("3273"), before.view);
  assert.deepEqual(getExploreRegionsProduct2023(), before.explore);
  assert.deepEqual(getProductMethodology2023(), before.methodology);
  assert.deepEqual(getComparisonProductView2023("3273", "3276"), before.comparison);
  assert.deepEqual(getRegionProfile2023("3273"), before.repositoryA);
  assert.deepEqual(getRegionProfile2023("3276"), before.repositoryB);
  assert.deepEqual(compareRegions2023("3273", "3276"), before.engine);
});

test("repeated product calls remain deterministic across interleaved regions, reversed pairs and same-region pairs", () => {
  const region = structuredClone(getRegionProductView2023("3273"));
  const explore = structuredClone(getExploreRegionsProduct2023());
  const comparison = structuredClone(getComparisonProductView2023("3273", "3276"));
  const methodology = structuredClone(getProductMethodology2023());
  for (const id of ids) getRegionProductView2023(id);
  getComparisonProductView2023("3276", "3273");
  getComparisonProductView2023("3209", "3279");
  getComparisonProductView2023("3273", "3273");
  getExploreRegionsProduct2023();
  assert.deepEqual(getRegionProductView2023("3273"), region);
  assert.deepEqual(getExploreRegionsProduct2023(), explore);
  assert.deepEqual(getComparisonProductView2023("3273", "3276"), comparison);
  assert.deepEqual(getProductMethodology2023(), methodology);
});

test("score and insight bytes retain exact pinned SHA256 values and matching product fingerprints", () => {
  const methodology = getProductMethodology2023();
  for (const [key, path, sha256] of [
    ["scoreArtifact", "data/processed/civx-scores-2023.json", "47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5"],
    ["insightArtifact", "data/processed/civx-insights-2023.json", "ffd92543c6387c981d2647c8ed55bd3abb7f7c4e9b5b91d4a74fab81999d6345"],
  ]) {
    const bytes = readFileSync(new URL(`../${path}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), sha256, path);
    assert.deepEqual(methodology.sources[key], { path, sha256, bytes: bytes.length });
  }
});
