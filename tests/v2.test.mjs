import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { scorePressure, verifiedAdvantages, observationProblem, assertPolicy, assertV2Release } from "../src/lib/civx/v2/model.ts";
import { scoreCivicIndex } from "../src/lib/civx/scoring.ts";

const json = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
// Synthetic observations below exist only in tests, never in a released dataset.
function fixture() {
  const artifact = { id: `sha256:${"a".repeat(64)}`, localPath: null, bytes: 10, url: "https://example.test/artifact", retrievedAt: "2026-10-27", redistribution: "Test only" };
  const sources = ["a", "b", "c", "optional"].map(id => ({ id, publisher: "Synthetic source", title: "Test evidence", url: "https://example.test", table: "1", page: "1", dataYear: 2023, referencePeriod: "2023 synthetic annual observation", artifactId: artifact.id, accessedAt: "2026-10-27", revision: "Test only" }));
  const indicator = (id, weight, direction = "higher") => ({ id, label: id, unit: "%", sourceId: id, direction, minimum: 0, maximum: 100, minimumRegion: "A", maximumRegion: "B", withinDimensionWeight: weight });
  const policy = { modelVersion: "CIVX v2", releaseId: "synthetic-v2", methodologyVersion: "test-method-v2", referenceSetId: "test-reference", period: "2023", boundaryReference: "test-boundary", referenceRegionIds: ["A", "B"], status: "project_validated", normalization: "fixed_min_max", rounding: "full_precision_then_two_decimals", dimensions: [{ id: "socioeconomic", label: "Socioeconomic", weight: 0.6, indicators: [indicator("a", 0.75), indicator("b", 0.25, "lower")] }, { id: "basic_services", label: "Basic services", weight: 0.4, indicators: [indicator("c", 1)] }], unsupportedDimensions: [], weightDecision: "Synthetic test weights" };
  const observation = (id, value, kind = "core_score_indicator") => ({ id: `synthetic-v2/A/${id}`, releaseId: policy.releaseId, indicatorId: id, regionId: "A", geography: { level: "kabupaten_kota", code: "A", boundaryReference: policy.boundaryReference }, period: "2023", unit: "%", value, kind, coverageStatus: "available", comparabilityStatus: "comparable", verificationState: "verified", confidence: "not_assessed", missingReason: null, provenance: [{ sourceId: id, artifactId: artifact.id, locator: `Table 1, region A, ${id}` }], denominator: { definition: "Synthetic test denominator" }, derivation: null });
  return { policy, sources, artifacts: [artifact], observations: [observation("a", 80), observation("b", 25), observation("c", 20)], observation };
}
const score = (f) => scorePressure(f.observations, f.policy, f.sources, f.artifacts, "A");

test("v1 artifacts and all 27 original scores remain unchanged and reproducible", () => {
  const baseline = json("data/releases/civx-v1-integrity.json");
  for (const [path, expected] of Object.entries(baseline.files)) {
    assert.equal(createHash("sha256").update(readFileSync(new URL(`../${path}`, import.meta.url))).digest("hex"), expected, path);
  }
  const release = json("data/processed/civx-jabar-2023.json");
  assert.equal(release.releaseId, baseline.releaseId);
  for (const region of release.regions) assert.deepEqual(scoreCivicIndex(region.observations, release.methodology), region.civicIndex);
});

test("superseded dimensional release inputs and outputs remain byte-identical", () => {
  const archived = json("data/releases/civx-archives-integrity.json");
  for (const [path, expected] of Object.entries(archived.files)) {
    assert.equal(createHash("sha256").update(readFileSync(new URL(`../${path}`, import.meta.url))).digest("hex"), expected, path);
  }
});

test("dimensions, not indicator counts, determine pressure contributions", () => {
  const result = score(fixture());
  assert.equal(result.status, "available");
  assert.equal(result.score, 55.25);
  assert.deepEqual(result.dimensions.map(d => [d.score, d.contribution]), [[78.75, 47.25], [20, 8]]);
  assert.deepEqual(result.dimensions[0].components.map(c => [c.score, c.contribution]), [[80, 36], [75, 11.25]]);
  assert.ok(Math.abs(result.dimensions[0].components[0].effectiveWeight - 0.45) < 1e-12);
  assert.ok(Math.abs(result.dimensions[0].components[1].effectiveWeight - 0.15) < 1e-12);
});

test("normalization respects both directions, endpoints, fixed bounds and rounding", () => {
  const f = fixture();
  f.observations[0].value = 0;
  f.observations[1].value = 100;
  f.observations[2].value = 0;
  assert.equal(score(f).score, 0);
  f.observations[0].value = 100;
  f.observations[1].value = 0;
  f.observations[2].value = 100;
  assert.equal(score(f).score, 100);
  f.observations[0].value = 100.01;
  assert.equal(score(f).status, "unavailable");
  f.observations[0].value = NaN;
  assert.equal(score(f).status, "unavailable");
  f.observations[0].value = 33.333333;
  f.observations[1].value = 66.666667;
  f.observations[2].value = 33.333333;
  assert.equal(score(f).score, 33.33);
});

test("missing core observation withholds whole index without reweighting", () => {
  const f = fixture();
  f.observations.pop();
  assert.equal(score(f).status, "unavailable");
  f.observations[0].value = null;
  f.observations[0].missingReason = "Not published";
  assert.equal(score(f).status, "unavailable");
});

test("missing context is not zero and cannot change pressure", () => {
  const f = fixture();
  const before = score(f);
  const context = { ...f.observation("optional", null, "context_indicator"), period: null, provenance: [], coverageStatus: "unavailable", verificationState: "unverified", missingReason: "No observation acquired" };
  f.observations.push(context);
  assert.deepEqual(score(f), before);
  assert.equal(context.value, null);
  assert.equal(observationProblem(context, f.policy, f.sources, f.artifacts, "A"), null);
});

test("optional advantage absence never becomes a penalty or verified presence", () => {
  const f = fixture();
  const before = score(f);
  for (const presence of ["no_comparable_data", "not_applicable", "verified_absent"]) {
    const signal = { ...f.observation("optional", null, "advantage_signal"), presence, whyAssigned: presence === "verified_absent" ? "Synthetic explicit absence evidence" : null };
    assert.deepEqual(verifiedAdvantages([signal], f.policy, f.sources, f.artifacts, "A"), []);
    assert.deepEqual(scorePressure([...f.observations, signal], f.policy, f.sources, f.artifacts, "A"), before);
  }
});

test("verified advantage requires positive evidence, mapped geography and assignment reason", () => {
  const f = fixture();
  const signal = { ...f.observation("optional", null, "advantage_signal"), presence: "verified_present", whyAssigned: "Official synthetic evidence explicitly identifies operating service in A" };
  assert.deepEqual(verifiedAdvantages([signal], f.policy, f.sources, f.artifacts, "A"), [signal]);
  for (const change of [{ whyAssigned: "" }, { provenance: [] }, { verificationState: "unverified" }, { geography: { ...signal.geography, level: "police_jurisdiction" } }]) {
    assert.deepEqual(verifiedAdvantages([{ ...signal, ...change }], f.policy, f.sources, f.artifacts, "A"), []);
  }
});

test("incompatible geography, units and observation years block core scoring", () => {
  for (const change of [{ geography: { level: "police_jurisdiction", code: "A", boundaryReference: "test-boundary" } }, { comparabilityStatus: "incompatible_geography" }, { period: "2022" }, { unit: "persons" }, { regionId: "B" }]) {
    const f = fixture();
    f.observations[0] = { ...f.observations[0], ...change };
    assert.equal(score(f).status, "unavailable");
  }
});

test("historical optional evidence retains its actual year without entering 2023 pressure", () => {
  const f = fixture();
  f.sources.find(s => s.id === "optional").dataYear = 2019;
  const historical = { ...f.observation("optional", 12, "context_indicator"), period: "2019", coverageStatus: "historical" };
  assert.equal(observationProblem(historical, f.policy, f.sources, f.artifacts, "A"), null);
  assert.deepEqual(scorePressure([...f.observations, historical], f.policy, f.sources, f.artifacts, "A"), score(f));
  historical.coverageStatus = "available";
  assert.match(observationProblem(historical, f.policy, f.sources, f.artifacts, "A"), /historical/);
});

test("v2 rejects mixed releases and unvalidated or malformed dimension policies", () => {
  const f = fixture();
  f.observations[0].releaseId = "civx-jabar-2023-v1";
  assert.equal(score(f).status, "unavailable");
  f.policy.status = "draft";
  assert.equal(score(f).status, "unavailable");
  for (const mutate of [p => { p.dimensions[0].weight = 0.7; }, p => { p.dimensions[0].indicators[0].withinDimensionWeight = 1; }, p => { p.dimensions[1].indicators[0].id = "a"; }, p => { p.dimensions[0].weight = -0.6; }, p => { p.dimensions[0].indicators[0].maximum = 0; }]) {
    const { policy } = fixture();
    mutate(policy);
    assert.throws(() => assertPolicy(policy));
  }
});

test("duplicate observations cannot silently overwrite or double-count inputs", () => {
  const f = fixture();
  f.observations.push({ ...f.observations[0], id: "another-id", value: 0 });
  assert.throws(() => score(f), /Duplicate/);
});

test("provenance requires matching source, artifact, locator, year and denominator evidence", () => {
  for (const mutate of [f => { f.observations[0].provenance = []; }, f => { f.observations[0].provenance[0].locator = ""; }, f => { f.observations[0].provenance[0].artifactId = `sha256:${"b".repeat(64)}`; }, f => { f.sources[0].dataYear = 2022; }, f => { f.sources[0].id = "wrong"; }, f => { f.observations[0].denominator = { definition: "Derived denominator", value: 100, unit: "persons", period: "2023", sourceId: "missing", locator: "Table 2" }; }]) {
    const f = fixture();
    mutate(f);
    assert.equal(score(f).status, "unavailable");
  }
});

test("published v2 isolates versions, core coverage and optional evidence", () => {
  const release = json("data/processed/civx-jabar-2023-v2.json");
  assertV2Release(release);
  assert.equal(release.releaseId, "civx-jabar-2023-v2");
  assert.equal(release.qualityAudit.scored, 27);
  assert.deepEqual(release.methodology.dimensions.map(d => d.id), ["socioeconomic", "basic_services"]);
  assert.deepEqual(release.exploreLayers.map(l => l.id), ["overall", "socioeconomic", "basic_services"]);
  for (const region of release.regions) {
    assert.deepEqual(scorePressure(region.observations, release.methodology, release.sources, release.artifacts, region.id), region.pressure);
    const coreOnly = region.observations.filter(o => o.kind === "core_score_indicator");
    assert.deepEqual(scorePressure(coreOnly, release.methodology, release.sources, release.artifacts, region.id), region.pressure);
  }
  const mixed = structuredClone(release);
  mixed.regions[0].pressure.releaseId = "civx-jabar-2023-v1";
  assert.throws(() => assertV2Release(mixed), /release|version/i);
});

test("read boundary cannot promote audited context into a regional advantage", () => {
  const release = json("data/processed/civx-jabar-2023-v2.json");
  const observation = release.regions[0].observations.find(o => o.indicatorId === "population_density");
  observation.kind = "advantage_signal";
  observation.presence = "verified_present";
  observation.whyAssigned = "Unaudited reinterpretation of density";
  assert.throws(() => assertV2Release(release), /classification/);
});

test("read boundary rejects a core observation from a different boundary reference", () => {
  const release = json("data/processed/civx-jabar-2023-v2.json");
  release.regions[0].observations.find(o => o.kind === "core_score_indicator").geography.boundaryReference = "another boundary";
  assert.throws(() => assertV2Release(release), /core/);
});

test("read boundary rejects unrelated layer values and withheld regional layer data", () => {
  const release = json("data/processed/civx-jabar-2023-v2.json");
  release.exploreLayers[0].values[0].value = 99;
  assert.throws(() => assertV2Release(release), /layer/i);
  const withheld = json("data/processed/civx-jabar-2023-v2.json");
  withheld.regions[0].pressure = { status: "unavailable", reason: "Missing core input" };
  withheld.qualityAudit.scored--;
  withheld.qualityAudit.withheld.push({ regionId: withheld.regions[0].id, reason: "Missing core input" });
  assert.throws(() => assertV2Release(withheld), /layer/i);
});
