import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { assertContextAudits2023, assertNoContextCredentials2023, prepareContextDataset2023 } from "../src/lib/civx/contextual-data-2023.ts";

const root = new URL("../", import.meta.url);
const protocolPath = "data/raw/contextual-audit-2023/protocol.json";
const catalogPath = "data/processed/contextual-data-catalog-2023.json";
const args = process.argv.slice(2);
assert(args.every((argument) => argument === "--check"), "Only --check is supported");
const check = args.includes("--check");
const bytes = (path) => readFileSync(new URL(path, root));
const load = (path) => JSON.parse(bytes(path));
const hash = (value) => createHash("sha256").update(value).digest("hex");
const receipt = (path) => {
  const content = bytes(path);
  return { path, sha256: hash(content), bytes: content.length };
};
const protocol = load(protocolPath);
assert.equal(protocol.auditId, "civx-contextual-data-audit-2023");
assert.equal(protocol.scope, "CONTEXT");
assert.equal(protocol.version, 1);
assert.deepEqual(protocol.domainOrder, ["traffic", "transport", "crime", "air_pollution"]);
assert.deepEqual(protocol.domainAuditPaths, protocol.domainOrder.map((domain) => `data/raw/contextual-audit-2023/${domain}.json`));
assert.equal(protocol.policies.coreScoreAffected, false);
assert.equal(protocol.policies.coreInsightsModified, false);
for (const key of ["imputationAllowed", "contextNormalizationApplied", "crossDatasetRankingAllowed", "unknownYearSubstitutionAllowed"]) assert.equal(protocol.policies[key], false);
const verifiedCore = protocol.coreFingerprints.map((expected) => {
  const actual = receipt(expected.path);
  assert.equal(actual.sha256, expected.sha256, `CORE_CHANGED: ${expected.path}`);
  return actual;
});
assert.equal(new Set(verifiedCore.map(({ path }) => path)).size, 16, "CORE_PROTECTION_MEMBERSHIP_CHANGED");
assert.equal(verifiedCore.find(({ path }) => path === "data/processed/civx-scores-2023.json")?.sha256, "47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5");
assert.equal(verifiedCore.find(({ path }) => path === "data/processed/civx-insights-2023.json")?.sha256, "ffd92543c6387c981d2647c8ed55bd3abb7f7c4e9b5b91d4a74fab81999d6345");
assert.equal(protocol.registry.path, "data/processed/civx-scores-2023.json");
assert.equal(protocol.registry.pointer, "/model/regions");
const registry = load(protocol.registry.path).model.regions;
const audits = protocol.domainAuditPaths.map(load);
assert.deepEqual(audits.map(({ domain }) => domain), protocol.domainOrder, "AUDIT_DOMAIN_ORDER_CHANGED");
const inputSnapshot = JSON.stringify(audits);
assertContextAudits2023(audits, registry);
const sourceManifest = [protocolPath, ...protocol.domainAuditPaths].map(receipt);
const computationManifest = ["scripts/audit-contextual-data-2023.mjs", "src/lib/civx/contextual-data-2023.ts"].map(receipt);
const sources = audits.flatMap(({ sources: values }) => values);
const datasets = [];
const candidates = [];
for (const [auditIndex, audit] of audits.entries()) {
  const rawAuditPath = protocol.domainAuditPaths[auditIndex];
  for (const [candidateIndex, candidate] of audit.candidates.entries()) {
    const artifactPath = candidate.decision === "REJECT" ? null : `data/processed/context/${candidate.datasetId}.json`;
    const { observations, ...metadata } = candidate;
    candidates.push({
      ...metadata,
      observationCount: observations.length,
      sourceMappedRegionCount: new Set(candidate.regionsAvailable.filter(({ regionId }) => regionId !== null).map(({ regionId }) => regionId)).size,
      artifactPath,
      rawAuditPath,
      evidencePointer: `/candidates/${candidateIndex}`,
    });
    if (artifactPath !== null) {
      const dataset = prepareContextDataset2023(candidate, audit, registry, rawAuditPath, candidateIndex);
      assert.equal(dataset.records.length, 27);
      assert.deepEqual(dataset.records.map(({ regionId }) => regionId), registry.map(({ id }) => id));
      assert.equal(new Set(dataset.records.map(({ regionId }) => regionId)).size, 27);
      assert.equal(dataset.coverage.regionCount, candidate.coverageCount);
      for (const record of dataset.records) {
        assert(record.value === null || (typeof record.value === "number" && Number.isFinite(record.value)), "INVALID_REGIONAL_VALUE");
        if (record.valueStatus !== "published_region_value") assert.equal(record.value, null, "SITE_OR_MISSING_VALUE_MUST_BE_NULL");
        if (record.observations.length === 0) assert.equal(record.valueStatus, "missing");
        for (const observation of record.observations) {
          const original = observation.evidencePointer.slice(1).split("/").reduce((value, key) => value[key], audit);
          const { evidencePointer, ...copied } = observation;
          void evidencePointer;
          assert.deepEqual(copied, original, "CONTEXT_OBSERVATION_COPY_CHANGED");
        }
      }
      const repeated = prepareContextDataset2023(candidate, audit, registry, rawAuditPath, candidateIndex);
      assert.equal(JSON.stringify(dataset), JSON.stringify(repeated), "NONDETERMINISTIC_CONTEXT_DATASET");
      datasets.push({ path: artifactPath, data: { ...dataset, provenance: { sourceManifest: [sourceManifest[auditIndex + 1]], computationManifest, reproductionScope: "Offline replay of attributed audited source transcriptions; not a new live-source acquisition or a claim of a blanket original-publication redistribution licence." } } });
    }
  }
}
assert.equal(JSON.stringify(audits), inputSnapshot, "AUDIT_INPUT_MUTATED");
const summary = {
  candidateDatasets: candidates.length,
  acceptedDatasets: candidates.filter(({ decision }) => decision === "ACCEPT_CONTEXT").length,
  partialDatasets: candidates.filter(({ decision }) => decision === "PARTIAL_CONTEXT").length,
  rejectedDatasets: candidates.filter(({ decision }) => decision === "REJECT").length,
  preparedDatasets: datasets.length,
  observations: datasets.reduce((total, { data }) => total + data.coverage.observationCount, 0),
  domains: protocol.domainOrder.map((domain) => ({ domain, candidates: candidates.filter((candidate) => candidate.domain === domain).map(({ datasetId, decision, coverageCount, referencePeriod, artifactPath }) => ({ datasetId, decision, coverageCount, referencePeriod, artifactPath })) })),
};
const catalog = {
  catalogId: "civx-contextual-data-catalog-2023",
  version: 1,
  scope: "CONTEXT",
  status: "AUDITED_CONTEXT_NOT_INTEGRATED",
  preferredReferenceYear: 2023,
  accessedAt: protocol.accessedAt,
  coreScoreAffected: false,
  coreInsightsModified: false,
  normalizationApplied: false,
  crossDatasetRankingGenerated: false,
  totalCivxRegions: 27,
  coverageDefinition: "coverageCount counts CIVX regions with retained verified usable observations. regionsAvailable and sourceMappedRegionCount describe inspected source geography separately; they do not imply usable numeric coverage or whole-region representativeness.",
  interpretation: "Contextual observations retain their own dates, definitions, units, geography and coverage. Site or police observations are not silently interpreted as whole administrative-region measures. No contextual value enters CIVX scoring or CORE insights.",
  sourceManifest,
  computationManifest,
  protectedCoreManifest: verifiedCore,
  sources,
  candidates,
  summary,
  validation: { validBpsRegistry: true, uniqueDatasetIds: true, finiteObservedValues: true, explicitMissingRegionalValues: true, coverageVerifiedFromObservations: true, sourceReferencesResolve: true, originalUnitsPreserved: true, coreFingerprintsUnchanged: true, deterministicReplayIdentical: true, credentialLikePatternsDetected: 0 },
};
const outputs = [...datasets, { path: catalogPath, data: catalog }].map(({ path, data }) => ({ path, serialized: `${JSON.stringify(data, null, 2)}\n` }));
for (const path of [protocolPath, ...protocol.domainAuditPaths]) assertNoContextCredentials2023(bytes(path).toString("utf8"));
for (const { serialized } of outputs) assertNoContextCredentials2023(serialized);
for (const entry of [...verifiedCore, ...sourceManifest, ...computationManifest]) assert.equal(hash(bytes(entry.path)), entry.sha256, `SOURCE_CHANGED_DURING_AUDIT: ${entry.path}`);
// Do not silently leave a stale dataset after an explicit source/decision cutover.
let existing = [];
try { existing = readdirSync(new URL("data/processed/context/", root)).filter((name) => name.endsWith(".json")); } catch (error) { if (error.code !== "ENOENT") throw error; }
const expectedNames = new Set(datasets.map(({ path }) => path.split("/").at(-1)));
assert(existing.every((name) => expectedNames.has(name)), "STALE_CONTEXT_ARTIFACT: review and remove only the obsolete contextual artifact before regeneration");
if (check) {
  for (const output of outputs) assert.equal(bytes(output.path).toString("utf8"), output.serialized, `CONTEXT_OUTPUT_DRIFT: ${output.path}`);
} else {
  if (datasets.length > 0) mkdirSync(new URL("data/processed/context/", root), { recursive: true });
  for (const output of outputs) writeFileSync(new URL(output.path, root), output.serialized);
}
console.log(`${check ? "Verified" : "Generated"} ${catalogPath}: ${summary.candidateDatasets} candidates; ${summary.acceptedDatasets} accepted, ${summary.partialDatasets} partial, ${summary.rejectedDatasets} rejected; ${summary.observations} observations; all 16 CORE fingerprints unchanged; credential scan passed.`);
