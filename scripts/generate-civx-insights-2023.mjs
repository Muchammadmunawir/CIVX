import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { assertScoringDataset2023 } from "../src/lib/civx/insight-input-2023.ts";
import { generateInsights2023 } from "../src/lib/civx/insights-2023.ts";

// Offline CORE artifact only. No scorer, network request, release input or UI integration.
const root = new URL("../", import.meta.url);
const scoringPath = "data/processed/civx-scores-2023.json";
const outputPath = "data/processed/civx-insights-2023.json";
const scoringSha256 = "47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5";
const args = process.argv.slice(2);
assert(args.every((arg) => arg === "--check"), "Only --check is supported");
const hash = (content) => createHash("sha256").update(content).digest("hex");
const bytes = (path) => readFileSync(new URL(path, root));
const receipt = (path) => {
  assert(typeof path === "string" && /^(?:data|docs|scripts|src)\/[A-Za-z0-9_./-]+$/.test(path) && !path.split("/").includes(".."), "INVALID_RECEIPT_PATH");
  const content = bytes(path);
  return { path, sha256: hash(content), bytes: content.length };
};
const scoringReceipt = receipt(scoringPath);
assert.equal(scoringReceipt.sha256, scoringSha256, `PINNED_SCORING_CHANGED: ${scoringPath}; explicit reviewed revision required`);
const input = JSON.parse(bytes(scoringPath));
const inputSnapshot = JSON.stringify(input);
assertScoringDataset2023(input);
const verifiedFiles = new Map([[scoringPath, scoringReceipt]]);
for (const manifest of [input.provenance.sourceManifest, input.provenance.verifiedEvidenceManifest, input.provenance.computationManifest]) {
  assert(Array.isArray(manifest) && manifest.length > 0, "MISSING_UPSTREAM_MANIFEST");
  for (const entry of manifest) {
    const actual = verifiedFiles.get(entry.path) ?? receipt(entry.path);
    assert.equal(actual.sha256, entry.sha256, `PINNED_EVIDENCE_CHANGED: ${entry.path}`);
    if (entry.bytes !== undefined) assert.equal(actual.bytes, entry.bytes, `EVIDENCE_SIZE_CHANGED: ${entry.path}`);
    verifiedFiles.set(entry.path, actual);
  }
}
const computationManifest = [
  "scripts/generate-civx-insights-2023.mjs",
  "src/lib/civx/insights-2023.ts",
  "src/lib/civx/cohort-comparison-2023.ts",
  "src/lib/civx/insight-input-2023.ts",
  "src/lib/civx/insight-templates-2023.ts",
].map(receipt);
for (const entry of computationManifest) verifiedFiles.set(entry.path, entry);

const finite = (value, code) => assert(typeof value === "number" && Number.isFinite(value), code);
const text = (value, code) => assert(typeof value === "string" && value.trim().length > 0, code);
const pointer = (path) => {
  assert(typeof path === "string" && path.startsWith("/"), "INVALID_SCORING_POINTER");
  return path.slice(1).split("/").reduce((value, token) => {
    const key = token.replace(/~1/g, "/").replace(/~0/g, "~");
    assert(value !== null && typeof value === "object" && Object.hasOwn(value, key), `UNRESOLVED_SCORING_POINTER: ${path}`);
    return value[key];
  }, input);
};
function comparison(value, expectedScore) {
  for (const key of ["value", "percentile", "midrank", "cohortMedian", "differenceFromMedian", "regionsBelow", "regionsAbove", "tiedRegionCount", "cohortSize"]) finite(value[key], `INVALID_COMPARISON_${key}`);
  assert.equal(value.value, expectedScore, "COMPARISON_SCORE_CHANGED");
  assert(value.percentile >= 0 && value.percentile <= 100, "INVALID_PERCENTILE");
  assert.equal(value.cohortSize, 27, "COMPARISON_COHORT_CHANGED");
  assert(value.midrank >= 1 && value.midrank <= 27, "INVALID_MIDRANK");
  for (const key of ["regionsBelow", "regionsAbove", "tiedRegionCount"]) assert(Number.isInteger(value[key]) && value[key] >= (key === "tiedRegionCount" ? 1 : 0), "INVALID_COHORT_COUNTS");
  assert.equal(value.regionsBelow + value.regionsAbove + value.tiedRegionCount, 27, "COHORT_COUNT_IDENTITY");
  const classes = ["relatively_low", "lower_middle", "middle", "higher_middle", "relatively_high"];
  assert.equal(value.classification, classes[Math.min(4, Math.floor(value.percentile / 20))], "COMPARISON_CLASS_CHANGED");
}
function copiedRecord(record, original, expectedPointer, scoreField) {
  assert.equal(record.scoringPointer, expectedPointer, "SCORING_POINTER_CHANGED");
  assert.strictEqual(pointer(record.scoringPointer), original, "SCORING_POINTER_TARGET_CHANGED");
  const { comparison: profile, scoringPointer: ignoredPointer, ...copied } = record;
  void ignoredPointer;
  assert.deepEqual(copied, original, "SCORING_RECORD_COPY_CHANGED");
  comparison(profile, original[scoreField]);
}
function uniqueIds(items, key, code) {
  assert.equal(new Set(items.map((item) => item[key])).size, items.length, code);
}
function validateOutput(output) {
  for (const [key, expected] of Object.entries({ datasetId: "civx-jabar-2023-core-insights", version: 1, status: "INSIGHTS_NOT_RELEASED", referenceYear: 2023, locale: "id", scope: "CORE", modelId: input.model.modelId, modelVersion: input.model.modelVersion, engineId: "civx-insights-2023", engineVersion: 1, publicRankingGenerated: false, productionIntegrationAuthorized: false })) assert.equal(output[key], expected, `OUTPUT_METADATA_CHANGED: ${key}`);
  text(output.interpretation, "EMPTY_INTERPRETATION");
  assert(output.analysisPolicy !== null && typeof output.analysisPolicy === "object", "MISSING_ANALYSIS_POLICY");
  assert.equal(output.regions.length, 27, "OUTPUT_REGION_MEMBERSHIP_CHANGED");
  const insightIds = new Set();
  for (const [r, region] of output.regions.entries()) {
    const original = input.regions[r];
    const regionPointer = `/regions/${r}`;
    for (const key of ["regionId", "regionName", "referenceYear", "province", "type", "boundaryReference", "modelId", "modelVersion", "overallPressureScore"]) assert.equal(region[key], original[key], `REGION_COPY_CHANGED: ${key}`);
    assert.equal(region.engineVersion, 1, "REGION_ENGINE_VERSION_CHANGED");
    assert.equal(region.scoringPointer, regionPointer, "REGION_POINTER_CHANGED");
    assert.strictEqual(pointer(region.scoringPointer), original, "REGION_POINTER_TARGET_CHANGED");
    comparison(region.overallProfile, original.overallPressureScore);
    assert.equal(region.dimensions.length, 6, "OUTPUT_DIMENSION_MEMBERSHIP_CHANGED");
    assert.equal(region.indicators.length, 18, "OUTPUT_INDICATOR_MEMBERSHIP_CHANGED");
    for (const [d, dimension] of region.dimensions.entries()) copiedRecord(dimension, original.dimensions[d], `${regionPointer}/dimensions/${d}`, "score");
    for (const [i, indicator] of region.indicators.entries()) copiedRecord(indicator, original.indicators[i], `${regionPointer}/indicators/${i}`, "normalizedPressure");
    const dimensions = new Map(region.dimensions.map((record) => [record.dimensionId, record]));
    const indicators = new Map(region.indicators.map((record) => [record.indicatorId, record]));
    for (const key of ["mainPressureDimensionIds", "lowerPressureDimensionIds"]) {
      const ids = region.selection[key];
      assert(Array.isArray(ids) && ids.every((id) => dimensions.has(id)) && new Set(ids).size === ids.length, "UNKNOWN_OR_DUPLICATE_SELECTED_DIMENSION");
    }
    finite(region.selection.regionalDimensionMedian, "INVALID_REGIONAL_MEDIAN");
    finite(region.selection.topDimensionGap, "INVALID_TOP_DIMENSION_GAP");
    assert(region.insights.length >= 1 && region.insights.length <= 6, "INVALID_INSIGHT_COUNT");
    assert.equal(region.insights.filter(({ type }) => type === "overall_profile").length, 1, "MISSING_OR_DUPLICATE_OVERALL_PROFILE");
    assert.equal(new Set(region.insights.map(({ message }) => message)).size, region.insights.length, "DUPLICATE_INSIGHT_MESSAGE");
    for (const insight of region.insights) {
      text(insight.insightId, "EMPTY_INSIGHT_ID");
      assert(!insightIds.has(insight.insightId), "DUPLICATE_INSIGHT_ID");
      insightIds.add(insight.insightId);
      assert.equal(insight.regionId, region.regionId, "INSIGHT_REGION_CHANGED");
      assert.equal(insight.scope, "CORE", "INSIGHT_SCOPE_CHANGED");
      assert(["overall_profile", "main_pressure", "relative_strength", "standout_indicator"].includes(insight.type), "UNKNOWN_INSIGHT_TYPE");
      assert.equal(insight.templateKey, insight.type, "INSIGHT_TEMPLATE_CHANGED");
      assert(["neutral", "higher_relative_pressure", "lower_relative_pressure"].includes(insight.severity), "UNKNOWN_INSIGHT_SEVERITY");
      assert(Number.isInteger(insight.priority) && insight.priority > 0, "INVALID_INSIGHT_PRIORITY");
      text(insight.title, "EMPTY_INSIGHT_TITLE");
      text(insight.message, "EMPTY_INSIGHT_MESSAGE");
      text(insight.evidence.comparisonTextKey, "EMPTY_COMPARISON_TEXT_KEY");
      assert(Array.isArray(insight.evidence.dimensions) && Array.isArray(insight.evidence.indicators), "INVALID_INSIGHT_EVIDENCE");
      uniqueIds(insight.evidence.dimensions, "dimensionId", "DUPLICATE_DIMENSION_EVIDENCE");
      uniqueIds(insight.evidence.indicators, "indicatorId", "DUPLICATE_INDICATOR_EVIDENCE");
      if (insight.evidence.overall !== undefined) {
        const evidence = insight.evidence.overall;
        assert.equal(evidence.scoringPointer, `${regionPointer}/overallPressureScore`, "OVERALL_EVIDENCE_POINTER_CHANGED");
        assert.equal(evidence.score, pointer(evidence.scoringPointer), "OVERALL_EVIDENCE_COPY_CHANGED");
        assert.deepEqual(evidence.comparison, region.overallProfile, "OVERALL_EVIDENCE_COMPARISON_CHANGED");
      }
      if (insight.type === "overall_profile") assert(insight.evidence.overall !== undefined, "MISSING_OVERALL_EVIDENCE");
      for (const evidence of insight.evidence.dimensions) {
        assert(dimensions.has(evidence.dimensionId), "UNKNOWN_DIMENSION_EVIDENCE");
        assert.deepEqual(evidence, dimensions.get(evidence.dimensionId), "DIMENSION_EVIDENCE_COPY_CHANGED");
        assert.strictEqual(pointer(evidence.scoringPointer), original.dimensions[region.dimensions.findIndex(({ dimensionId }) => dimensionId === evidence.dimensionId)], "DIMENSION_EVIDENCE_POINTER_CHANGED");
      }
      for (const evidence of insight.evidence.indicators) {
        assert(indicators.has(evidence.indicatorId), "UNKNOWN_INDICATOR_EVIDENCE");
        assert.deepEqual(evidence, indicators.get(evidence.indicatorId), "INDICATOR_EVIDENCE_COPY_CHANGED");
        assert.strictEqual(pointer(evidence.scoringPointer), original.indicators[region.indicators.findIndex(({ indicatorId }) => indicatorId === evidence.indicatorId)], "INDICATOR_EVIDENCE_POINTER_CHANGED");
      }
      assert(insight.evidence.overall !== undefined || insight.evidence.dimensions.length > 0 || insight.evidence.indicators.length > 0, "EMPTY_SCORE_EVIDENCE");
    }
  }
}
const result = generateInsights2023(input);
assert.equal(JSON.stringify(input), inputSnapshot, "SCORING_INPUT_MUTATED");
validateOutput(result);
const resultSnapshot = JSON.stringify(result);
const repeated = generateInsights2023(input);
assert.equal(JSON.stringify(input), inputSnapshot, "SCORING_INPUT_MUTATED");
assert.equal(JSON.stringify(repeated), resultSnapshot, "NONDETERMINISTIC_INSIGHTS");
assert.equal(JSON.stringify(result), resultSnapshot, "FIRST_INSIGHT_RESULT_MUTATED");
for (const entry of verifiedFiles.values()) assert.equal(hash(bytes(entry.path)), entry.sha256, `SOURCE_CHANGED_DURING_RUN: ${entry.path}`);
const output = {
  ...result,
  provenance: {
    scoringPath,
    sourceManifest: [scoringReceipt],
    computationManifest,
    upstreamProvenancePointer: "/provenance",
    evidenceVerificationScope: "Pinned scoring artifact and its recorded repository source, evidence and computation receipts verified offline. Original remote publications are not reacquired or newly byte-verified. Scores and contributions are copied, never recalculated.",
  },
};
const serialized = `${JSON.stringify(output, null, 2)}\n`;
if (args.includes("--check")) {
  assert.equal(bytes(outputPath).toString("utf8"), serialized, "INSIGHT_OUTPUT_DRIFT: regenerate and review the insight artifact");
} else {
  writeFileSync(new URL(outputPath, root), serialized);
}
const insightCount = result.regions.reduce((total, region) => total + region.insights.length, 0);
console.log(`${args.includes("--check") ? "Verified" : "Generated"} ${outputPath}: ${result.regions.length} regions, ${insightCount} CORE insights.`);
