import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { assessCommonYears, validateFreshnessAudits } from "../scripts/audit-freshness-2024-2026.mjs";

const root = new URL("../", import.meta.url);
const scriptPath = "scripts/audit-freshness-2024-2026.mjs";
const protocolPath = "data/raw/freshness-audit-2024-2026/protocol.json";
const conclusionPath = "data/raw/freshness-audit-2024-2026/conclusion.json";
const jsonPath = "data/processed/freshness-audit-2024-2026.json";
const csvPath = "data/processed/freshness-audit-2024-2026.csv";
const load = path => JSON.parse(readFileSync(new URL(path, root), "utf8"));
const protocol = load(protocolPath);
const frozen = load(protocol.frozenContractPath);
const audits = protocol.rawAuditPaths.map(load);
const hash = content => createHash("sha256").update(content).digest("hex");
const candidate = (data, id, year = 2024) => data.flatMap(audit => audit.candidates).find(row => row.indicatorId === id && row.candidateYear === year);
const auditFor = (data, id) => data.find(audit => audit.indicatorIds.includes(id));
const missing = (region, reason = "Unavailable test observation; no imputation.") => ({
  regionId: region.regionId, regionName: region.regionName, value: null, sourceValue: null,
  sourceRef: null, sourceLocator: null, missingReason: reason, estimationMethod: null, components: null, uncertainty: null,
});
function rejects(change, pattern) {
  const data = structuredClone(audits);
  change(data);
  assert.throws(() => validateFreshnessAudits(data, frozen), pattern);
}

// A hypothetical rate panel exercises validation only. It never enters an audit artifact or model.
function rateFixture() {
  const data = structuredClone(audits);
  const row = candidate(data, "puskesmas_per_100k");
  const numerator = row.componentAudit.numerator;
  row.status = "COMPATIBLE_CANDIDATE";
  row.availabilityVerified = true;
  row.referencePeriod = "Synthetic 2024 validation fixture";
  row.coverageCount = 27;
  row.methodologyChecks = Object.fromEntries(Object.keys(row.methodologyChecks).map(key => [key, true]));
  row.observations = numerator.observations.map(observation => ({
    ...observation,
    value: observation.value / 1000000 * 100000,
    sourceValue: null,
    components: {
      numerator: { value: observation.value, sourceValue: observation.sourceValue, unit: "main facilities", referenceYear: 2024, sourceRef: numerator.sourceRef, sourceLocator: observation.sourceLocator },
      denominator: { value: 1000000, sourceValue: "1.000.000", unit: "persons", referenceYear: 2024, sourceRef: row.sourceRefs[0], sourceLocator: "Synthetic exact-person denominator; test only" },
    },
  }));
  delete row.componentAudit;
  return data;
}

function workspace(t) {
  const directory = mkdtempSync(join(tmpdir(), "civx-freshness-audit-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const paths = new Set([protocolPath, conclusionPath, ...protocol.rawAuditPaths, ...protocol.baselineManifest.map(entry => entry.path), scriptPath]);
  for (const path of paths) {
    const destination = join(directory, path);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(new URL(path, root), destination);
  }
  return directory;
}
function run(directory, ...args) {
  return spawnSync(process.execPath, ["--permission", `--allow-fs-read=${directory}`, `--allow-fs-write=${directory}`, join(directory, scriptPath), ...args], {
    cwd: tmpdir(), encoding: "utf8", maxBuffer: 4 * 1024 * 1024,
  });
}
function succeeds(result) {
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
}
function fails(result, pattern) {
  assert.ifError(result.error);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, pattern);
}

test("common-year feasibility excludes numerically complete but incompatible constructs", () => {
  const before = JSON.stringify(audits);
  const selected = validateFreshnessAudits(audits, frozen);
  const years = assessCommonYears(selected);
  assert.deepEqual(years.map(year => [year.year, year.fullCompatibleIndicators, year.fullCompatibleWithCaveatIndicators, year.defensibleFullCoverageIndicators]), [
    [2024, 13, 2, 15], [2025, 11, 0, 11], [2026, 0, 0, 0],
  ]);
  assert.deepEqual(years.map(year => year.minimumOtherYearIndicatorsIfUsingFrozen2023ForEveryGap), [3, 7, 18]);
  assert.equal(candidate(audits, "nutrition_ski2023_wasting").coverageCount, 27);
  assert.ok(years[0].blockers.some(row => row.indicatorId === "nutrition_ski2023_wasting"));
  assert.equal(JSON.stringify(audits), before);
});

test("SSGI total stunting is retained without substituting moderate-only wasting or inferring SAE labels", () => {
  const stunting = candidate(audits, "nutrition_ski2023_stunting");
  const wasting = candidate(audits, "nutrition_ski2023_wasting");
  assert.equal(stunting.status, "COMPATIBLE_WITH_CAVEAT");
  assert.equal(stunting.observations[0].value, 18.9);
  assert.deepEqual([stunting.observations[0].uncertainty.lower, stunting.observations[0].uncertainty.upper], [10.2, 27.6]);
  assert.equal(stunting.observations[0].estimationMethod, "published_estimate");
  assert.equal(wasting.observations[0].value, 4.8);
  assert.equal(wasting.methodologyChecks.constructEquivalent, false);
  rejects(data => { candidate(data, "nutrition_ski2023_wasting").status = "COMPATIBLE_CANDIDATE"; }, /CONSTRUCT_NOT_COMPATIBLE/);
});

test("partial regional evidence cannot be promoted through publisher coverage claims", () => {
  const data = structuredClone(audits);
  const row = candidate(data, "poverty");
  row.observations[0] = missing(row.observations[0]);
  row.coverageCount = 26;
  row.reportedCoverageCount = 27;
  row.status = "PARTIAL";
  assert.equal(assessCommonYears(validateFreshnessAudits(data, frozen))[0].defensibleFullCoverageIndicators, 14);
  row.status = "COMPATIBLE_CANDIDATE";
  assert.throws(() => validateFreshnessAudits(data, frozen), /FULL_COMPATIBILITY_REQUIRES_27_OBSERVATIONS/);
});

test("duplicate or non-cohort geography and unknown indicator IDs are rejected", () => {
  rejects(data => { candidate(data, "poverty").observations[1].regionId = "3201"; }, /DUPLICATE_REGION_ID/);
  rejects(data => { candidate(data, "poverty").observations[0].regionId = "3200"; }, /INVALID_BPS_REGION_OR_ORDER/);
  rejects(data => { candidate(data, "poverty").observations[0].regionName = "Kota Bogor"; }, /INVALID_BPS_REGION_NAME/);
  rejects(data => { candidate(data, "poverty").indicatorId = "traffic"; }, /UNKNOWN_CANDIDATE_INDICATOR/);
  rejects(data => { candidate(data, "poverty").observations.pop(); }, /EXACTLY_27_REGION_SLOTS_REQUIRED/);
});

test("observed values must be finite and match original source precision", () => {
  for (const value of [NaN, Infinity, -Infinity, "7.05", undefined]) {
    rejects(data => { candidate(data, "poverty").observations[0].value = value; }, /NONFINITE_CANDIDATE_VALUE/);
  }
  rejects(data => { candidate(data, "expenditure_per_capita").observations[0].value = 11.563; }, /OBSERVATION_SOURCE_TOKEN_MISMATCH/);
  rejects(data => { candidate(data, "poverty").observations[0].sourceValue = "7,50"; }, /OBSERVATION_SOURCE_TOKEN_MISMATCH/);
});

test("NA stays null while dash becomes zero only under the publisher's explicit symbol definition", () => {
  const floor = candidate(audits, "household-floor-per-capita-le7-2");
  assert.equal(floor.observations.find(row => row.regionId === "3203").value, 0);
  assert.equal(floor.observations.find(row => row.regionId === "3218").value, null);
  rejects(data => {
    const row = candidate(data, "household-floor-per-capita-le7-2");
    const source = auditFor(data, row.indicatorId).sources.find(source => source.sourceId === row.sourceRefs[0]);
    delete source.symbolDefinitions;
  }, /OBSERVATION_SOURCE_TOKEN_MISMATCH/);
  rejects(data => { candidate(data, "household-floor-per-capita-le7-2").observations[17].sourceValue = 0; }, /MISSING_VALUE_MUST_NOT_HAVE_NUMERIC_TOKEN/);
  rejects(data => { candidate(data, "household-floor-per-capita-le7-2").observations[17].missingReason = ""; }, /nonempty text required/);
});

test("every retained value requires a resolvable source and locator and every compatible panel requires its original unit and period", () => {
  rejects(data => { candidate(data, "poverty").observations[0].sourceRef = "unknown"; }, /UNRESOLVED_OBSERVATION_SOURCE/);
  rejects(data => { candidate(data, "poverty").observations[0].sourceLocator = ""; }, /nonempty text required/);
  rejects(data => { candidate(data, "poverty").referencePeriod = null; }, /nonempty text required/);
  rejects(data => { candidate(data, "poverty").denominator = null; }, /nonempty text required/);
  rejects(data => { candidate(data, "poverty").unit = "persons"; }, /COMPATIBLE_UNIT_CHANGED/);
  rejects(data => { candidate(data, "poverty").methodologyChecks.geographyCompatible = false; }, /VERIFIED_CANDIDATE_CHECK_FAILED_geographyCompatible/);
});

test("compatibility, caveat and absence statuses cannot contradict the retained evidence", () => {
  rejects(data => { candidate(data, "poverty").methodologyChecks.methodContinuity = false; }, /STRICT_COMPATIBILITY_REQUIRES_METHOD_CONTINUITY/);
  rejects(data => { candidate(data, "nutrition_ski2023_stunting").caveats = []; }, /CAVEAT_STATUS_WITHOUT_CAVEAT/);
  rejects(data => { candidate(data, "poverty").status = "NOT_FOUND"; }, /NOT_FOUND_HAS_OBSERVATIONS/);
  rejects(data => { candidate(data, "poverty").status = "LATEST_CONTEXT_CANDIDATE"; }, /INVALID_FRESHNESS_STATUS/);
  rejects(data => { data[0].candidates.push(structuredClone(data[0].candidates[0])); }, /DUPLICATE_SELECTED_INDICATOR_YEAR/);
  rejects(data => { data[0].sources.push(structuredClone(data[0].sources[0])); }, /DUPLICATE_SOURCE_ID/);
});

test("separately audited Puskesmas components cannot hide invalid geography, years, units or rounded population", () => {
  rejects(data => { candidate(data, "puskesmas_per_100k").componentAudit.numerator.observations[1].regionId = "3201"; }, /DUPLICATE_COMPONENT_REGION_ID/);
  rejects(data => { candidate(data, "puskesmas_per_100k").componentAudit.numerator.referenceYear = 2023; }, /COMPONENT_PANEL_YEAR_MISMATCH/);
  rejects(data => { candidate(data, "puskesmas_per_100k").componentAudit.denominator.unit = "thousand persons"; }, /COMPONENT_PANEL_UNIT_MISMATCH/);
  rejects(data => { candidate(data, "puskesmas_per_100k").componentAudit.denominator.observations[0].value = 6412.53; }, /INVALID_EXACT_COMPONENT_VALUE/);
  rejects(data => { candidate(data, "puskesmas_per_100k").componentAudit.numerator.coverageCount = 26; }, /COMPONENT_COVERAGE_COUNT_MISMATCH/);
});

test("a proposed Puskesmas rate needs exact same-year components and the unchanged formula", () => {
  for (const [change, pattern] of [
    [row => { row.observations[0].components.denominator.referenceYear = 2023; }, /MIXED_YEAR_DERIVATION_NOT_COMMON_YEAR/],
    [row => { row.observations[0].components.denominator.value = 1000.5; row.observations[0].components.denominator.sourceValue = 1000.5; }, /EXACT_PERSON_POPULATION_REQUIRED/],
    [row => { row.observations[0].value *= 100; }, /PUSKESMAS_RATE_COMPONENT_MISMATCH/],
    [row => { row.observations[0].components.numerator.value = -1; row.observations[0].components.numerator.sourceValue = -1; }, /INVALID_MAIN_PUSKESMAS_COUNT/],
  ]) {
    const data = rateFixture();
    change(candidate(data, "puskesmas_per_100k"));
    assert.throws(() => validateFreshnessAudits(data, frozen), pattern);
  }
});

test("insurance ownership retains the no-insurance complement rather than category sums or administrative membership", () => {
  const row = candidate(audits, "health_insurance_ownership");
  assert.equal(row.observations[0].components.numerator.value, 27.71);
  assert.equal(row.observations[0].value, 72.29);
  rejects(data => { candidate(data, "health_insurance_ownership").observations[0].value = 68.09; }, /INSURANCE_COMPLEMENT_MISMATCH/);
  rejects(data => { candidate(data, "health_insurance_ownership").observations[0].components.denominator.value = 99; candidate(data, "health_insurance_ownership").observations[0].components.denominator.sourceValue = 99; }, /INSURANCE_COMPLEMENT_CONSTANT_CHANGED/);
  rejects(data => { candidate(data, "health_insurance_ownership").observations[0].components.numerator.referenceYear = 2025; }, /MIXED_YEAR_DERIVATION_NOT_COMMON_YEAR/);
});

test("offline CLI reproduces both artifacts byte-for-byte from another working directory without baseline writes", t => {
  const directory = workspace(t);
  succeeds(run(directory));
  const first = new Map([jsonPath, csvPath].map(path => [path, readFileSync(join(directory, path))]));
  succeeds(run(directory));
  succeeds(run(directory, "--check"));
  for (const [path, bytes] of first) assert.deepEqual(readFileSync(join(directory, path)), bytes);
  for (const entry of protocol.baselineManifest) assert.equal(hash(readFileSync(join(directory, entry.path))), entry.sha256, entry.path);
});

test("baseline score, insight, engine, methodology, context and frontend drift fail before outputs are created", t => {
  const directory = workspace(t);
  const frontend = protocol.baselineManifest.find(entry => entry.path.startsWith("src/app/")).path;
  for (const path of ["data/processed/civx-scores-2023.json", "data/processed/civx-insights-2023.json", "src/lib/civx/scoring-2023.ts", "src/lib/civx/insights-2023.ts", "docs/NORMALIZATION-DESIGN-2023.md", "data/processed/contextual-data-catalog-2023.json", frontend]) {
    const absolute = join(directory, path);
    const original = readFileSync(absolute);
    writeFileSync(absolute, Buffer.concat([original, Buffer.from("\n")]));
    fails(run(directory), /BASELINE_CHANGED/);
    assert.equal(existsSync(join(directory, jsonPath)), false);
    writeFileSync(absolute, original);
  }
});

test("check detects JSON and CSV drift without repairing or overwriting the audited output", t => {
  const directory = workspace(t);
  succeeds(run(directory));
  for (const path of [jsonPath, csvPath]) {
    const absolute = join(directory, path);
    const original = readFileSync(absolute);
    const drifted = Buffer.concat([original, Buffer.from("\n")]);
    writeFileSync(absolute, drifted);
    fails(run(directory, "--check"), /FRESHNESS_(?:JSON|CSV)_DRIFT/);
    assert.deepEqual(readFileSync(absolute), drifted);
    writeFileSync(absolute, original);
  }
});

test("an incomplete year cannot be recommended by changing only the conclusion", t => {
  const directory = workspace(t);
  const path = join(directory, conclusionPath);
  const conclusion = JSON.parse(readFileSync(path, "utf8"));
  conclusion.recommendation = "RECOMMEND_2024_CANDIDATE_MODEL";
  writeFileSync(path, JSON.stringify(conclusion));
  fails(run(directory), /RECOMMENDED_YEAR_NOT_COMPLETE/);
  assert.equal(existsSync(join(directory, jsonPath)), false);
});

test("credential-shaped source capture and opaque BPS download locators never enter generated artifacts", t => {
  const directory = workspace(t);
  const path = join(directory, protocol.rawAuditPaths[0]);
  const original = readFileSync(path);
  const data = JSON.parse(original);
  data.sources[0].evidence += " ghp_" + "A".repeat(30);
  writeFileSync(path, JSON.stringify(data));
  fails(run(directory), /credential-like material detected/);
  assert.equal(existsSync(join(directory, jsonPath)), false);
  const opaque = JSON.parse(original);
  opaque.sources[0].url = "https://webapi.bps.go.id/download.php?f=opaque-public-download";
  writeFileSync(path, JSON.stringify(opaque));
  fails(run(directory), /OPAQUE_BPS_DOWNLOAD_URL_NOT_PERMITTED/);
  assert.equal(existsSync(join(directory, jsonPath)), false);
});

test("unsupported CLI arguments and absent check outputs never create audit artifacts", t => {
  const directory = workspace(t);
  fails(run(directory, "--publish"), /Only --check is supported/);
  fails(run(directory, "--check"), /ENOENT/);
  assert.equal(existsSync(join(directory, jsonPath)), false);
  assert.equal(existsSync(join(directory, csvPath)), false);
});
