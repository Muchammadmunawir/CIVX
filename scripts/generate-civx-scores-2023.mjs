import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { prepareModel2023 } from "../src/lib/civx/model-2023.ts";
import { aggregateNormalized2023, scoreCohort2023 } from "../src/lib/civx/scoring-2023.ts";

// Offline next-model artifact only. This script never writes a production release or UI input.
const root = new URL("../", import.meta.url);
const freezePath = "data/processed/final-indicator-freeze-2023.json";
const normalizationPath = "data/processed/normalization-design-2023.json";
const weightingPath = "data/processed/weighting-design-2023.json";
const outputPath = "data/processed/civx-scores-2023.json";
const inputPins = {
  [freezePath]: "8d72727f93c393a331582e83c8250d758abffca4fb2fc8920797b9ff3fe4d7ac",
  [normalizationPath]: "1f6735060ee421b6e71212eec908d377a7928bc4e5c9999c3582267fecb374f4",
  [weightingPath]: "c8966d3a2fa4bc6721061e48995e05a4167de63f7cd77a6a8a3c524c36982131",
  "docs/FINAL-INDICATOR-FREEZE-2023.md": "1cea8eca26b9bd4146409c35f14e487b81e55c95e7ccd839c3552a91045039ff",
  "docs/NORMALIZATION-DESIGN-2023.md": "839fd3f5029f8ba3713022d3800c71a94ee478c131442616a78a2c7e9c3e1d46",
  "docs/WEIGHTING-DESIGN-2023.md": "569e05c2baa33b7dced1d959d0987f3d0511f1dd942491be15bd7ba7574e601d",
};
const args = process.argv.slice(2);
assert(args.every((arg) => arg === "--check"), "Only --check is supported");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const bytes = (path) => readFileSync(new URL(path, root));
const load = (path) => JSON.parse(bytes(path));
const receipt = (path) => {
  const content = bytes(path);
  return { path, sha256: hash(content), bytes: content.length };
};
const sourceManifest = Object.entries(inputPins).map(([path, expected]) => {
  const entry = receipt(path);
  assert.equal(entry.sha256, expected, `PINNED_INPUT_CHANGED: ${path}; explicit reviewed revision required`);
  return entry;
});
const frozen = load(freezePath);
const normalized = load(normalizationPath);
const weighting = load(weightingPath);
const sourceObjectsHash = hash(JSON.stringify([frozen, normalized, weighting]));
const verifiedFiles = new Map(sourceManifest.map((entry) => [entry.path, entry]));
for (const entry of [
  ...frozen.evidenceManifest,
  ...normalized.input.sourceManifest,
  ...weighting.input.sourceManifest,
  frozen.generator,
  normalized.generator,
  weighting.generator,
]) {
  const actual = verifiedFiles.get(entry.path) ?? receipt(entry.path);
  assert.equal(actual.sha256, entry.sha256, `PINNED_EVIDENCE_CHANGED: ${entry.path}`);
  if (entry.bytes !== undefined) assert.equal(actual.bytes, entry.bytes, `EVIDENCE_SIZE_CHANGED: ${entry.path}`);
  verifiedFiles.set(entry.path, actual);
}
assert.equal(frozen.evidenceManifest.length, 24, "FREEZE_EVIDENCE_MEMBERSHIP_CHANGED");
const { model, regions: inputs } = prepareModel2023(frozen, normalized, weighting);
const results = scoreCohort2023(inputs, model);
assert.equal(JSON.stringify(scoreCohort2023(inputs, model)), JSON.stringify(results), "NONDETERMINISTIC_SCORING");
const registry = load(frozen.geography.registry);
assert.deepEqual(registry.regions.map(({ id, name }) => ({ id, name })), frozen.geography.regions, "REGISTRY_IDENTITY_CHANGED");
const selected = weighting.schemes.find(({ selected }) => selected);
const sum = (values) => values.reduce((total, value) => total + value, 0);
const near = (actual, expected, code) => assert(Math.abs(actual - expected) <= 1e-10, code);
const inRange = (value) => assert(typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100, "INVALID_OUTPUT_PRESSURE");
let directionPairChecks = 0;
let monotonicityChecks = 0;
for (const [r, result] of results.entries()) {
  inRange(result.overallPressureScore);
  const prior = selected.regionResults[r];
  assert.equal(prior.regionId, result.regionId, "WEIGHTING_REGION_ORDER_CHANGED");
  near(result.overallPressureScore, prior.provisionalOverallPressureScore, "APPROVED_WEIGHTING_RESULT_CHANGED");
  near(sum(result.dimensions.map(({ contributionToOverall }) => contributionToOverall)), result.overallPressureScore, "DIMENSION_CONTRIBUTION_IDENTITY");
  near(sum(result.indicators.map(({ contributionToOverall }) => contributionToOverall)), result.overallPressureScore, "INDICATOR_CONTRIBUTION_IDENTITY");
  for (const dimension of result.dimensions) {
    inRange(dimension.score);
    near(dimension.score, prior.dimensionScores[dimension.dimensionId], "APPROVED_DIMENSION_RESULT_CHANGED");
    near(sum(result.indicators.filter(({ dimensionId }) => dimensionId === dimension.dimensionId).map(({ contributionToDimension }) => contributionToDimension)), dimension.score, "WITHIN_DIMENSION_CONTRIBUTION_IDENTITY");
  }
  for (const [i, indicator] of result.indicators.entries()) {
    inRange(indicator.normalizedPressure);
    assert.equal(indicator.rawValue, frozen.indicators[i].observations[r].value, "RAW_VALUE_CHANGED");
    assert.equal(indicator.normalizedPressure, normalized.indicators[i].observations[r].normalizedPressure.min_max, "NORMALIZATION_CHANGED");
    const delta = indicator.normalizedPressure <= 99 ? 1 : -1;
    const probe = result.indicators.map(({ indicatorId, normalizedPressure }, j) => ({ indicatorId, normalizedPressure: normalizedPressure + (j === i ? delta : 0) }));
    const changed = aggregateNormalized2023(probe, model).overallPressureScore;
    near(changed - result.overallPressureScore, delta * indicator.effectiveWeight, "PRESSURE_MONOTONICITY_IDENTITY");
    assert.equal(Math.sign(changed - result.overallPressureScore), Math.sign(delta), "PRESSURE_DIRECTION_REVERSED");
    monotonicityChecks++;
  }
}
for (const [i, indicator] of model.indicators.entries()) {
  const sign = indicator.pressureDirection === "higher_raw_higher_pressure" ? 1 : -1;
  for (let a = 0; a < results.length; a++) for (let b = a + 1; b < results.length; b++) {
    const left = results[a].indicators[i];
    const right = results[b].indicators[i];
    assert.equal(Math.sign(left.normalizedPressure - right.normalizedPressure), sign * Math.sign(left.rawValue - right.rawValue) || 0, "NORMALIZATION_DIRECTION_REVERSED");
    directionPairChecks++;
  }
}
assert.equal(monotonicityChecks, 486);
assert.equal(directionPairChecks, 6318);
assert.equal(hash(JSON.stringify([frozen, normalized, weighting])), sourceObjectsHash, "SOURCE_OBJECT_MUTATED");
for (const entry of verifiedFiles.values()) assert.equal(hash(bytes(entry.path)), entry.sha256, `SOURCE_CHANGED_DURING_RUN: ${entry.path}`);
const codeManifest = ["scripts/generate-civx-scores-2023.mjs", "src/lib/civx/model-2023.ts", "src/lib/civx/scoring-2023.ts"].map(receipt);
const scores = results.map(({ overallPressureScore }) => overallPressureScore);
const scoreMinimum = Math.min(...scores);
const scoreMaximum = Math.max(...scores);
const output = {
  datasetId: "civx-jabar-2023-pressure-scores",
  version: 1,
  status: "SCORED_NOT_RELEASED",
  referenceYear: 2023,
  pressureScale: [0, 100],
  higherIsHigherRelativePressure: true,
  interpretation: "Relative civic pressure within the frozen 27-region Jawa Barat 2023 cohort; not absolute quality of life, government performance, a probability or causal effect. Indicator endpoints 0 and 100 are cohort-relative, not theoretical real-world bounds.",
  productionIntegrationAuthorized: false,
  publicRankingGenerated: false,
  model,
  provenance: {
    freezePath,
    normalizationPath,
    weightingPath,
    normalizationContractPointer: "/contract",
    weightingContractPointer: "/aggregationContract",
    selectedWeightingSchemePointer: `/schemes/${weighting.schemes.indexOf(selected)}`,
    sourceManifest,
    verifiedEvidenceManifest: [...verifiedFiles.values()],
    evidenceVerificationScope: "Repository frozen audited inputs and source receipts verified by fingerprint. Original remote publications are not reacquired or newly byte-verified by this offline scorer.",
    computationManifest: codeManifest,
    sourceMetadataPolicy: "Each indicator's frozenIndicatorPointer and each observation's frozenValuePointer resolve in freezePath. Frozen indicator/observation records retain definitions, geography, periods, denominators, revisions, missingness, uncertainty, source artifacts and audit provenance. normalizationValuePointer resolves in normalizationPath.",
  },
  explainabilityPolicy: {
    dimensionExtrema: "All exact-equality highest/lowest dimension ties, in frozen dimension order; no rounding before comparisons.",
    indicatorPressureOrdering: "Descending unrounded normalized pressure, with frozen indicator order for exact ties. Ordering is not a weight or a causal attribution.",
    contributions: "Indicator-to-dimension = normalized pressure * within weight; dimension-to-overall = dimension score * dimension weight; indicator-to-overall = normalized pressure * effective weight. Units are score points, not shares of residents.",
  },
  regions: results.map((result, index) => ({
    ...result,
    province: registry.regions[index].province,
    type: registry.regions[index].type,
    boundaryReference: registry.regions[index].boundaryReference,
    registryPointer: `/regions/${index}`,
  })),
  geography: {
    province: frozen.geography.province,
    level: frozen.geography.level,
    registry: frozen.geography.registry,
    displayGeometryIsAnalyticalDenominator: false,
  },
  validation: {
    regions: results.length,
    indicators: model.indicators.length,
    dimensions: model.dimensions.length,
    rawValuesVerifiedUnchanged: results.reduce((count, region) => count + region.indicators.length, 0),
    selectedNormalizedValuesVerifiedUnchanged: 486,
    dimensionScores: results.reduce((count, region) => count + region.dimensions.length, 0),
    overallScores: results.length,
    verifiedUnderlyingFreezeEvidenceFiles: frozen.evidenceManifest.length,
    normalizationDirectionPairChecks: directionPairChecks,
    positiveEffectiveWeightMonotonicityChecks: monotonicityChecks,
    dimensionWeightSum: sum(model.dimensions.map(({ weight }) => weight)),
    withinDimensionWeightSums: Object.fromEntries(model.dimensions.map(({ dimensionId, indicatorIds }) => [dimensionId, sum(model.indicators.filter(({ indicatorId }) => indicatorIds.includes(indicatorId)).map(({ withinDimensionWeight }) => withinDimensionWeight))])),
    effectiveWeightSum: sum(model.indicators.map(({ effectiveWeight }) => effectiveWeight)),
    weightTolerance: 1e-12,
    scoreIdentityTolerance: 1e-10,
    allScoresFiniteAndWithin0And100: true,
    normalizationContractUnchanged: true,
    weightingContractUnchanged: true,
    rawSourceObjectsUnchanged: true,
    deterministicReplayIdentical: true,
    scoreMinimum,
    scoreMaximum,
    minimumRegionIds: results.filter(({ overallPressureScore }) => overallPressureScore === scoreMinimum).map(({ regionId }) => regionId),
    maximumRegionIds: results.filter(({ overallPressureScore }) => overallPressureScore === scoreMaximum).map(({ regionId }) => regionId),
  },
};
const serialized = `${JSON.stringify(output, null, 2)}\n`;
if (args.includes("--check")) {
  assert.equal(bytes(outputPath).toString("utf8"), serialized, "SCORING_OUTPUT_DRIFT: regenerate and review the scoring artifact");
} else {
  writeFileSync(new URL(outputPath, root), serialized);
}
console.log(`${args.includes("--check") ? "Verified" : "Generated"} ${outputPath}: ${results.length} regions, ${model.indicators.length} indicators, ${model.dimensions.length} dimensions; pressure range ${scoreMinimum}–${scoreMaximum}; ${directionPairChecks} direction checks, ${monotonicityChecks} positive-weight probes.`);
