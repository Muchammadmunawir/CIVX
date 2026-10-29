import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  getRegions2023,
  getRegion2023,
  getRegionScore2023,
  getRegionInsights2023,
  getRegionContext2023,
  getRegionProfile2023,
} from "../src/lib/civx/repository-2023.ts";

const root = new URL("../", import.meta.url);
const bytes = path => readFileSync(new URL(path, root));
const load = path => JSON.parse(bytes(path).toString("utf8"));
const scoring = load("data/processed/civx-scores-2023.json");
const insights = load("data/processed/civx-insights-2023.json");
const frozen = load("data/processed/final-indicator-freeze-2023.json");
const catalog = load("data/processed/contextual-data-catalog-2023.json");
const accepted = catalog.summary.domains.flatMap(domain => domain.candidates)
  .filter(candidate => candidate.decision !== "REJECT");
const datasets = accepted.map(candidate => ({ path: candidate.artifactPath, data: load(candidate.artifactPath) }));
const ids = [
  ...Array.from({ length: 18 }, (_, index) => String(3201 + index)),
  ...Array.from({ length: 9 }, (_, index) => String(3271 + index)),
];
const singularGetters = [getRegion2023, getRegionScore2023, getRegionInsights2023, getRegionContext2023, getRegionProfile2023];
const pinnedHashes = {
  "data/processed/civx-scores-2023.json": "47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5",
  "data/processed/civx-insights-2023.json": "ffd92543c6387c981d2647c8ed55bd3abb7f7c4e9b5b91d4a74fab81999d6345",
  "data/processed/contextual-data-catalog-2023.json": "f80b892a63d61fada9e0edce301cdd9015def90424d9fbeb22b53b8be7de1efc",
  "data/raw/contextual-audit-2023/protocol.json": "e72585c1e5b46ede592e649d488b8ad835b40e07cb09e7359760c06eaafba767",
  "data/raw/contextual-audit-2023/traffic.json": "ac073ed2ea799b02af3f067d2aadbdf94e494fdac0b0172dbb718f6d0587e82c",
  "data/raw/contextual-audit-2023/transport.json": "f71a0786e00173c6155113909f79826694fd22089fe9a325fb186fb8ec57a352",
  "data/raw/contextual-audit-2023/crime.json": "de0b991647e0a60ee8914643cb6bf55f1f5eb9c215b1992dc999d100650de4ae",
  "data/raw/contextual-audit-2023/air_pollution.json": "bba300991d4e38d88e3c2bdc7a08c5e95cdc1e0d8672a7e29195e2ed6351a8c6",
  "data/processed/context/context_traffic_bandung_2024_after_speed.json": "f06c8e57a93c7a2b9252dc6319af3ef4313cdcb3197dbcd9766731b4c491843f",
  "data/processed/context/context_traffic_bandung_2024_after_vc_ratio.json": "24323bfc12ba880a3705513c651a9e9357618e6418437962230bd8b4e2a6dbe1",
  "data/processed/context/context_transport_type_c_terminal_inventory_2023.json": "a4e4449799fc76a8eb5dc8dfb326642cda6c2539e0003e75d1d4557667e5d191",
  "data/processed/context/context_transport_commuter_share_jabodetabek_2023.json": "9cd0e13224d1a20f613de13f163c8ea3403ff9365ff70f691359538b36cde226",
  "data/processed/context/context_crime_podes_theft_villages_jabar_2024.json": "8d25872d78426933619187f0d62b7cdb07f861e8f441835992277bcf9013b40c",
  "data/processed/context/context_air_pollution_klh_site_ispu_20261029.json": "767090d379c9c7f1bbb68feb61cac1360a867fd494deb31ed87fb8115f7f6a51",
  "data/processed/context/context_air_pollution_klh_site_pm25_ispu_20261029.json": "150c5c0a2e520a59be7ff291237ce49b1be01f2774e18fc9409212d1a6a4bcb4",
};

function assertDeepFrozen(value, seen = new WeakSet()) {
  if (value === null || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  assert.ok(Object.isFrozen(value), "Every consumer-visible object and array must be frozen");
  for (const child of Object.values(value)) assertDeepFrozen(child, seen);
}

function contextItem(id, datasetId) {
  const item = getRegionContext2023(id).find(item => item.dataset.datasetId === datasetId);
  assert.ok(item, `${id}: ${datasetId}`);
  return item;
}

test("region summaries contain exactly 27 unique canonical IDs in frozen order", () => {
  const regions = getRegions2023();
  assert.equal(regions.length, 27);
  assert.equal(new Set(regions.map(region => region.id)).size, 27);
  assert.deepEqual(regions.map(region => region.id), ids);
  assert.deepEqual(regions, scoring.regions.map(source => ({
    id: source.regionId,
    name: source.regionName,
    province: source.province,
    type: source.type,
    boundaryReference: source.boundaryReference,
    registryPointer: source.registryPointer,
    referenceYear: 2023,
  })));
  for (const region of regions) assert.deepEqual(getRegion2023(region.id), region);
});

test("ID lookup distinguishes kabupaten and kota sharing place names", () => {
  for (const [countyId, cityId, name] of [
    ["3201", "3271", "Bogor"], ["3202", "3272", "Sukabumi"],
    ["3204", "3273", "Bandung"], ["3209", "3274", "Cirebon"],
    ["3216", "3275", "Bekasi"], ["3206", "3278", "Tasikmalaya"],
  ]) {
    assert.equal(getRegion2023(countyId).name, `Kabupaten ${name}`);
    assert.equal(getRegion2023(countyId).type, "kabupaten");
    assert.equal(getRegion2023(cityId).name, `Kota ${name}`);
    assert.equal(getRegion2023(cityId).type, "kota");
    assert.equal(getRegionProfile2023(countyId).region.id, countyId);
    assert.equal(getRegionProfile2023(cityId).region.id, cityId);
  }
});

test("all singular getters reject unknown IDs, names and whitespace without fuzzy resolution", () => {
  for (const id of ["", "3200", "3219", "Bogor", "Kabupaten Bogor", "Kota Bogor", "Bandung", " ", "\t", " 3201", "3201 ", "\n3271", "03201"]) {
    for (const getter of singularGetters) assert.equal(getter(id), undefined, `${getter.name}(${JSON.stringify(id)})`);
  }
});

test("all CORE scores preserve authoritative overall, dimension and indicator values and order", () => {
  for (const source of scoring.regions) {
    const score = getRegionScore2023(source.regionId);
    assert.equal(score.scope, "CORE");
    assert.equal(score.overallScore, source.overallPressureScore);
    assert.equal(score.dimensions.length, 6);
    assert.equal(score.indicators.length, 18);
    assert.deepEqual(score.dimensions.map(({ scope, ...dimension }) => {
      assert.equal(scope, "CORE");
      return dimension;
    }), source.dimensions);
    assert.deepEqual(score.indicators.map(({ scope, evidence, ...indicator }) => {
      assert.equal(scope, "CORE");
      assert.ok(evidence);
      return indicator;
    }), source.indicators);
  }
});

test("indicator evidence preserves frozen definitions, provenance and exact regional observations", () => {
  for (const [regionIndex, id] of ids.entries()) {
    for (const [indicatorIndex, indicator] of getRegionScore2023(id).indicators.entries()) {
      const source = frozen.indicators.find(source => source.indicatorId === indicator.indicatorId);
      const { observations, ...metadata } = source;
      assert.deepEqual(indicator.evidence.indicator, metadata);
      assert.deepEqual(indicator.evidence.observation, observations.find(observation => observation.regionId === id));
      assert.equal(indicator.evidence.scoringPointer, `/regions/${regionIndex}/indicators/${indicatorIndex}`);
    }
  }
});

test("CORE insights are the exact frozen records without rewritten evidence or comparisons", () => {
  for (const source of insights.regions) {
    const actual = getRegionInsights2023(source.regionId);
    assert.deepEqual(actual, source.insights);
    for (const insight of actual) assert.equal(insight.scope, "CORE");
  }
});

test("every region receives all seven CONTEXT datasets in accepted catalog order with complete provenance", () => {
  assert.equal(datasets.length, 7);
  assert.deepEqual(datasets.map(({ data }) => data.datasetId), [
    "context_traffic_bandung_2024_after_speed",
    "context_traffic_bandung_2024_after_vc_ratio",
    "context_transport_type_c_terminal_inventory_2023",
    "context_transport_commuter_share_jabodetabek_2023",
    "context_crime_podes_theft_villages_jabar_2024",
    "context_air_pollution_klh_site_ispu_20261029",
    "context_air_pollution_klh_site_pm25_ispu_20261029",
  ]);
  for (const id of ids) {
    const actual = getRegionContext2023(id);
    assert.equal(actual.length, 7);
    for (const [index, { path, data }] of datasets.entries()) {
      const { records, ...metadata } = data;
      assert.equal(actual[index].scope, "CONTEXT");
      assert.deepEqual(actual[index].dataset, { ...metadata, artifactPath: path });
      assert.deepEqual(actual[index].record, records.find(record => record.regionId === id));
      assert.equal(actual[index].dataset.coreScoreAffected, false);
      assert.equal(actual[index].dataset.normalizationApplied, false);
    }
  }
});

test("CONTEXT missingness stays distinct from explicitly published zero", () => {
  const terminals = "context_transport_type_c_terminal_inventory_2023";
  for (const id of ["3209", "3213"]) {
    const missing = contextItem(id, terminals).record;
    assert.equal(missing.value, null);
    assert.equal(missing.valueStatus, "missing");
    assert.ok(missing.missingReason);
    assert.deepEqual(missing.observations, []);
  }
  const zero = contextItem("3279", terminals).record;
  assert.equal(zero.value, 0);
  assert.equal(zero.valueStatus, "published_region_value");
  assert.equal(zero.missingReason, null);
  assert.equal(zero.observations[0].value, 0);
  assert.equal(zero.observations[0].sourceValue, "0");
  for (const id of ids) {
    for (const { record } of getRegionContext2023(id)) {
      if (record.valueStatus !== "missing") continue;
      assert.equal(record.value, null);
      assert.ok(record.missingReason);
      assert.deepEqual(record.observations, []);
    }
  }
});

test("commuter coverage excludes 22 regions without inventing zero shares", () => {
  const datasetId = "context_transport_commuter_share_jabodetabek_2023";
  const covered = ["3201", "3216", "3271", "3275", "3276"];
  assert.deepEqual(contextItem("3201", datasetId).dataset.coverage.coveredRegionIds, covered);
  for (const id of ids) {
    const { record } = contextItem(id, datasetId);
    if (covered.includes(id)) {
      assert.equal(record.valueStatus, "published_region_value");
      assert.equal(record.value, datasets.find(({ data }) => data.datasetId === datasetId).data.records.find(record => record.regionId === id).value);
    } else {
      assert.equal(record.value, null);
      assert.equal(record.valueStatus, "missing");
    }
  }
});

test("Podes retains village occurrence counts and distinct dataset/observation geography", () => {
  const { dataset, record } = contextItem("3201", "context_crime_podes_theft_villages_jabar_2024");
  assert.equal(dataset.geographicLevel, "Civil kabupaten/kota aggregation of desa/kelurahan occurrence reports");
  assert.equal(record.observations[0].geographicLevel, "Civil kabupaten/kota");
  assert.equal(dataset.unit, "desa/kelurahan");
  assert.equal(record.value, 296);
  assert.equal(record.observations[0].value, 296);
  assert.equal(record.referencePeriod, "Podes 2024: one year preceding May 2024 enumeration (not calendar 2023)");
  assert.equal(dataset.comparability.comparisonPermitted, false);
});

test("site observations remain separate and never become administrative-region means", () => {
  let siteRecords = 0;
  for (const id of ids) {
    for (const { dataset, record } of getRegionContext2023(id)) {
      if (dataset.regionalAggregation !== "none") continue;
      assert.equal(record.value, null);
      if (record.observations.length === 0) continue;
      siteRecords++;
      assert.equal(record.valueStatus, "site_observations_only");
      assert.ok(record.missingReason);
      assert.equal(dataset.coverage.regionWideValueCount, 0);
      for (const observation of record.observations) {
        assert.ok(observation.siteId);
        assert.ok(observation.siteName);
        assert.equal(observation.regionId, id);
        assert.ok(observation.sourceLocator);
        assert.ok(observation.evidencePointer);
        assert.ok(dataset.sources.some(source => source.sourceId === observation.sourceRef));
      }
    }
  }
  assert.ok(siteRecords > 0);
  assert.ok(contextItem("3273", "context_traffic_bandung_2024_after_speed").record.observations.length > 1);
});

test("air context retains actual 2026 timestamps, dimensionless units and original source locators", () => {
  for (const [datasetId, unit, value] of [
    ["context_air_pollution_klh_site_ispu_20261029", "ISPU (dimensionless)", 83],
    ["context_air_pollution_klh_site_pm25_ispu_20261029", "PM2.5 component ISPU (dimensionless)", 61],
  ]) {
    const { dataset, record } = contextItem("3201", datasetId);
    assert.match(dataset.referencePeriod, /2026-10-29 16:00:00/);
    assert.equal(dataset.unit, unit);
    assert.equal(record.referencePeriod, dataset.referencePeriod);
    assert.equal(record.value, null);
    assert.equal(record.observations[0].value, value);
    for (const observation of record.observations) {
      assert.match(observation.period, /2026-10-29 16:00:00/);
      assert.equal(observation.unit, unit);
      const source = dataset.sources.find(source => source.sourceId === observation.sourceRef);
      assert.ok(source.url);
      assert.ok(observation.sourceLocator);
      assert.ok(observation.sourceValue);
    }
    assert.equal(contextItem("3271", datasetId).record.valueStatus, "missing");
  }
});

test("profiles keep CONTEXT outside CORE and preserve model interpretation and artifact provenance", () => {
  for (const id of ids) {
    const profile = getRegionProfile2023(id);
    const source = scoring.regions.find(region => region.regionId === id);
    assert.equal(profile.region.id, id);
    assert.equal(profile.core.scope, "CORE");
    assert.equal(profile.core.overallScore, source.overallPressureScore);
    assert.deepEqual(profile.core.dimensions.map(item => item.dimensionId), scoring.model.dimensions.map(item => item.dimensionId));
    assert.deepEqual(profile.core.indicators.map(item => item.indicatorId), scoring.model.indicators.map(item => item.indicatorId));
    assert.deepEqual(profile.core.insights, insights.regions.find(region => region.regionId === id).insights);
    assert.deepEqual(profile.context.map(item => item.dataset.datasetId), datasets.map(({ data }) => data.datasetId));
    for (const item of profile.context) {
      assert.equal(item.scope, "CONTEXT");
      assert.equal(item.dataset.coreScoreAffected, false);
      assert.equal(item.dataset.normalizationApplied, false);
    }
    const metadata = profile.metadata;
    assert.equal(metadata.referenceYear, 2023);
    assert.equal(metadata.cohortSize, 27);
    assert.equal(metadata.modelId, scoring.model.modelId);
    assert.equal(metadata.modelVersion, scoring.model.modelVersion);
    assert.equal(metadata.normalizationMethod, scoring.model.normalizationMethod);
    assert.equal(metadata.weightingSchemeId, scoring.model.weightingSchemeId);
    assert.equal(metadata.scoreDatasetId, scoring.datasetId);
    assert.equal(metadata.scoreStatus, scoring.status);
    assert.equal(metadata.insightDatasetId, insights.datasetId);
    assert.equal(metadata.insightStatus, insights.status);
    assert.equal(metadata.insightEngineId, insights.engineId);
    assert.equal(metadata.insightEngineVersion, insights.engineVersion);
    assert.equal(metadata.locale, insights.locale);
    assert.deepEqual(metadata.pressureScale, scoring.pressureScale);
    assert.equal(metadata.higherIsHigherRelativePressure, scoring.higherIsHigherRelativePressure);
    assert.equal(metadata.interpretation, scoring.interpretation);
    assert.equal(metadata.insightInterpretation, insights.interpretation);
    assert.equal(metadata.referencePolicy, frozen.referencePolicy);
    assert.equal(metadata.missingPolicy, frozen.missingPolicy);
    assert.equal(metadata.productionIntegrationAuthorized, false);
    assert.equal(metadata.publicRankingGenerated, false);
    assert.deepEqual(metadata.geography, scoring.geography);
    assert.deepEqual(metadata.provenance, scoring.provenance);
    assert.deepEqual(metadata.insightProvenance, insights.provenance);
    for (const [fingerprint, path] of [
      [metadata.scoreArtifact, "data/processed/civx-scores-2023.json"],
      [metadata.insightArtifact, "data/processed/civx-insights-2023.json"],
    ]) assert.deepEqual(fingerprint, { path, sha256: pinnedHashes[path], bytes: bytes(path).length });
  }
});

test("repeated retrieval is deeply equivalent and the complete exposed graph is frozen", () => {
  assertDeepFrozen(getRegions2023());
  for (const id of ids) {
    for (const getter of singularGetters) {
      const first = getter(id);
      assert.deepEqual(first, getter(id));
      assertDeepFrozen(first);
    }
  }
});

test("nested mutation attempts cannot alter later reads from any public view", () => {
  const id = "3201";
  const before = structuredClone(getRegionProfile2023(id));
  const regionsBefore = structuredClone(getRegions2023());
  const scoreBefore = structuredClone(getRegionScore2023(id));
  const profile = getRegionProfile2023(id);
  const overall = profile.core.insights.find(insight => insight.type === "overall_profile");
  assert.ok(overall.evidence.overall.comparison);
  const air = contextItem(id, "context_air_pollution_klh_site_ispu_20261029");
  const mutations = [
    () => { getRegions2023().push(getRegion2023(id)); },
    () => { getRegions2023()[0].name = "Changed"; },
    () => { getRegion2023(id).id = "3271"; },
    () => { getRegionScore2023(id).overallScore = -1; },
    () => { profile.core.dimensions[0].score = -1; },
    () => { profile.core.indicators[0].expectedBounds.minimum = -1; },
    () => { profile.core.indicators[0].evidence.indicator.limitations.push("Changed"); },
    () => { profile.core.indicators[0].evidence.observation.value = -1; },
    () => { getRegionInsights2023(id).pop(); },
    () => { overall.evidence.overall.score = -1; },
    () => { overall.evidence.overall.comparison.percentile = -1; },
    () => { getRegionContext2023(id).pop(); },
    () => { air.dataset.sources[0].url = "https://invalid.example"; },
    () => { air.dataset.sources[0].excerpts.push("Changed"); },
    () => { air.record.observations[0].value = -1; },
    () => { air.record.observations[0].limitations.push("Changed"); },
    () => { air.dataset.coverage.coveredRegionIds.push("3200"); },
    () => { air.dataset.provenance.sourceManifest[0].sha256 = "Changed"; },
    () => { profile.metadata.modelVersion = -1; },
    () => { profile.metadata.pressureScale[0] = -1; },
    () => { profile.metadata.provenance.sourceManifest[0].sha256 = "Changed"; },
    () => { profile.metadata.scoreArtifact.sha256 = "Changed"; },
  ];
  for (const mutate of mutations) assert.throws(mutate, TypeError);
  assert.deepEqual(getRegions2023(), regionsBefore);
  assert.deepEqual(getRegionProfile2023(id), before);
  assert.deepEqual(getRegion2023(id), before.region);
  assert.deepEqual(getRegionScore2023(id), scoreBefore);
  assert.deepEqual(getRegionInsights2023(id), before.core.insights);
  assert.deepEqual(getRegionContext2023(id), before.context);
});

test("frozen score, insight, contextual audit and prepared artifacts retain pinned SHA256 hashes", () => {
  for (const [path, expected] of Object.entries(pinnedHashes)) {
    assert.equal(createHash("sha256").update(bytes(path)).digest("hex"), expected, path);
  }
});
