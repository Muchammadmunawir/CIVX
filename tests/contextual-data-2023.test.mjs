import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { assertContextAudits2023, assertNoContextCredentials2023, prepareContextDataset2023 } from "../src/lib/civx/contextual-data-2023.ts";

const root = new URL("../", import.meta.url);
const load = path => JSON.parse(readFileSync(new URL(path, root), "utf8"));
const registry = load("data/processed/civx-scores-2023.json").model.regions;

// Synthetic validation fixtures only. Never written to audited contextual artifacts.
function fixture() {
  const source = {
    sourceId: "traffic_test_source", url: "https://example.gov.id/public-table", publisher: "Synthetic test publisher",
    title: "Synthetic test source", accessedAt: "2026-10-29", publicationDate: null, httpStatus: 200,
    representation: "Synthetic test fixture", evidence: "Deterministic test-only evidence", excerpts: [], retrievalMethod: "test fixture", contentSha256: null,
  };
  const observation = {
    observationId: "traffic_test_1", regionId: registry[0].id, regionName: registry[0].name, geographicLevel: "road_segment",
    siteId: "test_segment", siteName: "Synthetic road segment", period: "2023", value: 12.5, unit: "km/h", sourceRef: source.sourceId,
    sourceLocator: "Synthetic table row 1", sourceValue: 12.5, transformation: "none", limitations: ["Not regional speed"],
  };
  const candidate = {
    datasetId: "context_test_traffic_2023", domain: "traffic", title: "Synthetic test speeds", publisher: source.publisher, sourceUrl: source.url,
    sourceType: "official_agency", referencePeriod: "2023", publicationDate: null, geographicLevel: "road_segment",
    regionsAvailable: [{ sourceRegionId: "test_segment", sourceRegionName: "Synthetic road segment", regionId: registry[0].id, regionName: registry[0].name, mappingStatus: "site_association" }],
    coverageCount: 1, coveragePercent: 100 / 27, unit: "km/h", definition: "Synthetic speed observation", numerator: null, denominator: null,
    measurementMethod: "Synthetic test measurement", missingness: "26 regions have no observation", updateFrequency: null,
    licenseOrUsageNotes: "Synthetic test data only", machineReadable: true, reproducible: true,
    comparability: { status: "within_source_partial", reason: "Site observations only", comparisonPermitted: false },
    knownBiases: ["Site selection"], limitations: ["Not representative of the region"], recommendedUse: "Test validation only",
    decision: "PARTIAL_CONTEXT", decisionReason: "Synthetic road observations", safeStatements: ["Site speed at the stated period"],
    unsafeStatements: ["Region-wide speed"], statementTemplates: ["Kecepatan pada ruas {siteName} tercatat {value} {unit} pada {period}."],
    temporalWarning: "Source period only, not current conditions", sourceRefs: [source.sourceId], regionalAggregation: "none", observations: [observation],
  };
  return { auditId: "context-test", domain: "traffic", accessedAt: "2026-10-29", sources: [source], candidates: [candidate] };
}
function reject(change) {
  const audit = fixture();
  change(audit, audit.candidates[0], audit.candidates[0].observations[0]);
  assert.throws(() => assertContextAudits2023([audit], registry));
}

test("site observations remain nested and never become regional means or missing-region zeros", () => {
  const audit = fixture();
  assertContextAudits2023([audit], registry);
  const output = prepareContextDataset2023(audit.candidates[0], audit, registry, "test-only.json", 0);
  assert.equal(output.scope, "CONTEXT");
  assert.equal(output.coreScoreAffected, false);
  assert.equal(output.normalizationApplied, false);
  assert.equal(output.records.length, 27);
  assert.equal(new Set(output.records.map(record => record.regionId)).size, 27);
  assert.equal(output.records[0].value, null);
  assert.equal(output.records[0].valueStatus, "site_observations_only");
  assert.equal(output.records[0].observations[0].value, 12.5);
  for (const record of output.records.slice(1)) {
    assert.equal(record.value, null);
    assert.equal(record.valueStatus, "missing");
    assert.equal(record.observations.length, 0);
    assert.ok(record.missingReason);
  }
  assert.deepEqual(output.coverage.coveredRegionIds, [registry[0].id]);
  assert.equal(output.coverage.regionWideValueCount, 0);
});

test("multiple sites stay separate without duplicate regional records", () => {
  const audit = fixture();
  const candidate = audit.candidates[0];
  candidate.observations.push({ ...candidate.observations[0], observationId: "traffic_test_2", siteId: "test_segment_2", siteName: "Second synthetic segment", value: 15, sourceValue: 15 });
  assertContextAudits2023([audit], registry);
  const output = prepareContextDataset2023(candidate, audit, registry, "test-only.json", 0);
  assert.equal(output.coverage.regionCount, 1);
  assert.equal(output.coverage.observationCount, 2);
  assert.equal(output.records[0].value, null);
  assert.deepEqual(output.records[0].observations.map(item => item.value), [12.5, 15]);
});

test("published administrative values preserve original units and genuine zero observations", () => {
  const audit = fixture();
  const candidate = audit.candidates[0];
  candidate.regionalAggregation = "source_published_region_value";
  candidate.regionsAvailable[0].mappingStatus = "exact";
  candidate.geographicLevel = "kabupaten/kota";
  candidate.observations[0].geographicLevel = "kabupaten/kota";
  candidate.observations[0].value = 0;
  candidate.observations[0].sourceValue = 0;
  assertContextAudits2023([audit], registry);
  const output = prepareContextDataset2023(candidate, audit, registry, "test-only.json", 0);
  assert.equal(output.records[0].value, 0);
  assert.equal(output.records[0].valueStatus, "published_region_value");
  assert.equal(output.records[1].value, null);
  assert.equal(output.unit, "km/h");
});

test("duplicate dataset, source and observation IDs cannot silently overwrite evidence", () => {
  reject(audit => audit.candidates.push(structuredClone(audit.candidates[0])));
  reject(audit => audit.sources.push(structuredClone(audit.sources[0])));
  reject((audit, candidate) => candidate.observations.push(structuredClone(candidate.observations[0])));
});

test("duplicate region IDs are rejected in a scalar regional panel", () => {
  reject((audit, candidate, observation) => {
    candidate.regionalAggregation = "source_published_region_value";
    candidate.regionsAvailable[0].mappingStatus = "exact";
    candidate.observations.push({ ...observation, observationId: "another_observation" });
  });
});

test("unknown IDs, wrong names and unresolved geography cannot enter accepted observations", () => {
  reject((audit, candidate, observation) => { observation.regionId = "3200"; });
  reject((audit, candidate, observation) => { observation.regionName = "Kota Bogor"; });
  reject((audit, candidate) => { candidate.regionsAvailable[0].mappingStatus = "unresolved"; });
  reject((audit, candidate) => { candidate.regionsAvailable[0].regionId = null; });
  reject((audit, candidate) => { candidate.regionalAggregation = "source_published_region_value"; });
  reject((audit, candidate, observation) => {
    delete candidate.regionsAvailable[0].regionId;
    delete candidate.regionsAvailable[0].regionName;
    delete observation.regionId;
    delete observation.regionName;
  });
});

test("coverage uses verified observations, not catalog totals or implied regional availability", () => {
  reject((audit, candidate) => { candidate.coverageCount = 27; });
  reject((audit, candidate) => { candidate.coveragePercent = 100; });
  reject((audit, candidate) => { candidate.decision = "ACCEPT_CONTEXT"; });
});

test("accepted numeric values must be finite and units consistent", () => {
  for (const value of [null, undefined, NaN, Infinity, -Infinity, "12.5"]) reject((audit, candidate, observation) => { observation.value = value; });
  reject((audit, candidate, observation) => { observation.unit = "m/s"; });
  reject((audit, candidate, observation) => { observation.sourceValue = 15; });
});

test("every accepted value needs a source, locator, original token and actual reference period", () => {
  reject((audit, candidate, observation) => { observation.sourceRef = "missing_source"; });
  reject((audit, candidate, observation) => { observation.sourceLocator = ""; });
  reject((audit, candidate, observation) => { observation.sourceValue = ""; });
  reject((audit, candidate, observation) => { observation.period = ""; });
  reject((audit, candidate) => { candidate.referencePeriod = null; });
  reject((audit, candidate) => { candidate.unit = null; });
  reject((audit, candidate) => { candidate.reproducible = false; });
});

test("rejected candidates never emit a fake dataset and cannot retain published measurements", () => {
  const audit = fixture();
  audit.candidates[0].decision = "REJECT";
  assert.throws(() => prepareContextDataset2023(audit.candidates[0], audit, registry, "test-only.json", 0));
  assert.throws(() => assertContextAudits2023([audit], registry));
  audit.candidates[0].observations = [];
  audit.candidates[0].coverageCount = 0;
  audit.candidates[0].coveragePercent = 0;
  assertContextAudits2023([audit], registry);
});

test("incomparable data cannot request comparative rankings", () => {
  reject((audit, candidate) => { candidate.comparability.status = "not_comparable"; candidate.comparability.comparisonPermitted = true; });
});

test("preparation is deterministic and does not mutate audited observations or source metadata", () => {
  const audit = fixture();
  const snapshot = JSON.stringify(audit);
  const first = prepareContextDataset2023(audit.candidates[0], audit, registry, "test-only.json", 0);
  assert.equal(JSON.stringify(first), JSON.stringify(prepareContextDataset2023(audit.candidates[0], audit, registry, "test-only.json", 0)));
  first.records[0].observations[0].limitations.push("Output-only mutation");
  first.sources[0].excerpts.push("Output-only excerpt");
  assert.equal(JSON.stringify(audit), snapshot);
});

test("credential scan rejects provider keys, auth material, private keys and signed queries without echoing matches", () => {
  const examples = [
    "ghp_" + "A".repeat(30), "github_pat_" + "A".repeat(30), "AKIA" + "A".repeat(16),
    "AIza" + "A".repeat(35), "sk-" + "A".repeat(30), "-----BEGIN " + "PRIVATE KEY-----",
    '{"authorization":"' + "Bearer " + "x".repeat(25) + '"}',
    "https://example.gov.id/api?access_token=" + "not-a-real-token",
    "https://example.gov.id/file?X-Amz-Signature=" + "not-a-real-signature",
  ];
  for (const content of examples) {
    assert.throws(() => assertNoContextCredentials2023(content), error => {
      assert.match(error.message, /credential-like material detected/);
      assert.equal(error.message.includes(content), false);
      return true;
    });
  }
  assertNoContextCredentials2023('{"url":"https://example.gov.id/data?year=2023","value":12.5,"contentSha256":"' + "a".repeat(64) + '"}');
});

test("real audited catalog retains source references, explicit missingness and frozen CORE isolation", () => {
  const protocol = load("data/raw/contextual-audit-2023/protocol.json");
  const audits = protocol.domainAuditPaths.map(load);
  assertContextAudits2023(audits, registry);
  const catalog = load("data/processed/contextual-data-catalog-2023.json");
  assert.equal(catalog.scope, "CONTEXT");
  assert.equal(catalog.coreScoreAffected, false);
  assert.equal(catalog.coreInsightsModified, false);
  assert.equal(catalog.normalizationApplied, false);
  assert.equal(catalog.crossDatasetRankingGenerated, false);
  for (const candidate of catalog.candidates) {
    if (candidate.decision === "REJECT") {
      assert.equal(candidate.artifactPath, null);
      continue;
    }
    const dataset = load(candidate.artifactPath);
    assert.equal(dataset.records.length, 27);
    assert.deepEqual(dataset.records.map(record => record.regionId), registry.map(region => region.id));
    assert.equal(dataset.coverage.regionCount, candidate.coverageCount);
    assert.equal(dataset.coverage.observationCount, candidate.observationCount);
    const audit = audits.find(item => item.domain === candidate.domain);
    for (const record of dataset.records) {
      for (const observation of record.observations) {
        const raw = observation.evidencePointer.slice(1).split("/").reduce((value, key) => value[key], audit);
        const { evidencePointer, ...copied } = observation;
        assert.ok(evidencePointer);
        assert.deepEqual(copied, raw);
        assert.ok(dataset.sources.some(source => source.sourceId === observation.sourceRef));
      }
      if (record.valueStatus !== "published_region_value") assert.equal(record.value, null);
    }
  }
});
