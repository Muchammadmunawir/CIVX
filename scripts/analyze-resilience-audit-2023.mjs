import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

// Research only: no production builder, scorer, release, UI or prior audit is written.
const root = new URL("../", import.meta.url);
const directory = "data/raw/resilience-audit-2023/";
const names = ["protocol", "current-risk", "hazard-exposure", "realized-impact", "adaptive-capacity"];
const load = (path) => JSON.parse(readFileSync(new URL(path, root), "utf8"));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const inputs = names.map((name) => ({ path: `${directory}${name}.json`, data: load(`${directory}${name}.json`) }));
const protocol = inputs[0].data;
const regions = load("data/raw/civx-jabar-2023.json").regions;
const ids = regions.map(({ id }) => id);
const regionNames = new Map(regions.map(({ id, name }) => [id, name]));
assert.equal(ids.length, 27);
assert.deepEqual(protocol.scope.regionIds, ids);
const artifacts = new Map();
const series = new Map();
const investigations = [];

for (const { path, data } of inputs) {
  assert.equal(data.scope.referenceYear, 2023, path);
  assert.equal(data.scope.productionChanges, false, path);
  for (const artifact of data.artifacts) {
    assert(!artifacts.has(artifact.id), `Duplicate artifact: ${artifact.id}`);
    assert.equal(typeof artifact.content, "string", artifact.id);
    assert.equal(hash(Buffer.from(artifact.content)), artifact.sha256, `Artifact hash: ${artifact.id}`);
    assert.equal(Buffer.byteLength(artifact.content), artifact.bytes, `Artifact size: ${artifact.id}`);
    assert(artifact.url && artifact.publisher && artifact.representation, `Artifact provenance: ${artifact.id}`);
    artifacts.set(artifact.id, { ...artifact, sourceFile: path });
  }
  for (const item of data.series) {
    assert(!series.has(item.id), `Duplicate series: ${item.id}`);
    assert.equal(item.year, 2023, item.id);
    assert.deepEqual(item.observations.map(({ regionId }) => regionId), ids, `Cohort: ${item.id}`);
    assert(["CORE", "CONTEXT ONLY", "REJECTED"].includes(item.recommendation.status), item.id);
    assert(["higher_worse", "higher_better", "ambiguous", "not_scored"].includes(item.direction), item.id);
    for (const observation of item.observations) {
      assert(observation.value === null || Number.isFinite(observation.value), `Invalid value: ${item.id}`);
      assert(observation.value !== null || observation.status !== "observed", `Hidden missingness: ${item.id}`);
      assert(observation.sourceRecord?.artifactId, `Missing row receipt: ${item.id}`);
    }
    series.set(item.id, { ...item, sourceFile: path });
  }
  for (const item of data.investigations) {
    assert(["CORE", "CONTEXT ONLY", "REJECTED"].includes(item.recommendation.status), item.id);
    investigations.push({ ...item, sourceFile: path });
  }
}
for (const item of series.values()) {
  assert(artifacts.has(item.source.artifactId), `Missing source artifact: ${item.id}`);
  for (const observation of item.observations) {
    assert(artifacts.has(observation.sourceRecord.artifactId), `Missing row artifact: ${item.id}`);
    if (item.rawOrDerived !== "derived_rate" || observation.value === null) continue;
    assert(Number.isFinite(observation.numerator), `Missing numerator: ${item.id}`);
    assert(observation.denominator > 0, `Invalid denominator: ${item.id}`);
    assert(artifacts.has(observation.denominatorSourceArtifactId), `Missing denominator source: ${item.id}`);
    const multiplier = Number(item.formula?.match(/(?:\*|×)\s*(\d+(?:\.\d+)?)/)?.[1]);
    assert(Number.isFinite(multiplier), `Undeclared rate multiplier: ${item.id}`);
    const derived = observation.numerator / observation.denominator * multiplier;
    assert(Math.abs(derived - observation.value) <= 1e-10 * Math.max(1, Math.abs(derived)), `Rate mismatch: ${item.id}`);
  }
}
for (const [path, before] of Object.entries(protocol.productionProtection.sha256BeforeAudit)) {
  assert.equal(hash(readFileSync(new URL(path, root))), before, `Protected file changed: ${path}`);
}

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
function quantile(sorted, probability) {
  if (!sorted.length) return null;
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  return sorted[lower] + (sorted[Math.ceil(position)] - sorted[lower]) * (position - lower);
}
function describe(item) {
  const present = item.observations.filter(({ value }) => value !== null);
  const values = present.map(({ value }) => value).sort((a, b) => a - b);
  assert(values.length, `Empty series must be an investigation: ${item.id}`);
  const average = mean(values);
  const sd = Math.sqrt(mean(values.map((value) => (value - average) ** 2)));
  const q1 = quantile(values, 0.25), q3 = quantile(values, 0.75), iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr, upperFence = q3 + 1.5 * iqr;
  const frequencies = new Map();
  for (const value of values) frequencies.set(value, (frequencies.get(value) ?? 0) + 1);
  const identified = (rows) => rows.map(({ regionId, value }) => ({ regionId, regionName: regionNames.get(regionId), value }));
  const outsideBounds = present.filter(({ value }) => (item.bounds?.min != null && value < item.bounds.min) || (item.bounds?.max != null && value > item.bounds.max));
  return {
    count: values.length, expected: 27, missing: 27 - values.length, unique: frequencies.size,
    ambiguousNumeric: present.filter(({ status }) => status !== "observed").length,
    min: values[0], max: values.at(-1), mean: average, median: quantile(values, 0.5),
    populationStandardDeviation: sd,
    coefficientOfVariationPercent: item.cvMeaningful && average > 0 ? 100 * sd / average : null,
    cvReason: item.cvMeaningful ? (average > 0 ? "100 × population SD / mean; dispersion, not uncertainty." : "Undefined at a zero/nonpositive mean.") : "Not interpreted for composite/ordinal indices with an arbitrary zero.",
    q1, q3, iqr, lowerFence, upperFence,
    minimumRegions: identified(present.filter(({ value }) => value === values[0])),
    maximumRegions: identified(present.filter(({ value }) => value === values.at(-1))),
    outliers: identified(present.filter(({ value }) => value < lowerFence || value > upperFence)),
    outsideBounds: identified(outsideBounds),
    zeros: identified(present.filter(({ value }) => value === 0)),
    repeatedValues: [...frequencies].filter(([, count]) => count > 1).map(([value, count]) => ({ value, count })),
    floorCount: item.bounds?.min == null ? null : values.filter((value) => value === item.bounds.min).length,
    ceilingCount: item.bounds?.max == null ? null : values.filter((value) => value === item.bounds.max).length,
    lowVariationDiagnostic: frequencies.size <= 2 || (item.cvMeaningful && average > 0 && sd / average < 0.01),
    missingRegions: item.observations.filter(({ value }) => value === null).map(({ regionId, rawValue, status, missingReason }) => ({ regionId, rawValue, status, reason: missingReason ?? "Missing/ambiguous source value; no imputation." })),
    interpretation: "Equal-weight regional description, not a population-weighted provincial statistic. Outliers remain unchanged. Repeated values are ties, not duplicate regional rows.",
  };
}
function pearson(a, b) {
  const ma = mean(a), mb = mean(b);
  let covariance = 0, va = 0, vb = 0;
  for (let index = 0; index < a.length; index++) {
    const da = a[index] - ma, db = b[index] - mb;
    covariance += da * db; va += da * da; vb += db * db;
  }
  return va === 0 || vb === 0 ? null : covariance / Math.sqrt(va * vb);
}
function ranks(values) {
  const ordered = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const result = Array(values.length);
  for (let start = 0; start < ordered.length;) {
    let end = start + 1;
    while (end < ordered.length && ordered[end].value === ordered[start].value) end++;
    const rank = (start + 1 + end) / 2;
    for (let index = start; index < end; index++) result[ordered[index].index] = rank;
    start = end;
  }
  return result;
}
const statistics = Object.fromEntries([...series].map(([id, item]) => [id, describe(item)]));
const eligible = [...series.values()].filter((item) => item.correlationGroup && statistics[item.id].missing === 0 && statistics[item.id].ambiguousNumeric === 0 && item.concept !== "supporting_denominator");
const correlations = [];
for (let index = 0; index < eligible.length; index++) {
  const a = eligible[index];
  for (const b of eligible.slice(index + 1)) {
    const av = a.observations.map(({ value }) => value), bv = b.observations.map(({ value }) => value);
    const p = pearson(av, bv), s = pearson(ranks(av), ranks(bv));
    const group = a.correlationGroup === b.correlationGroup ? a.correlationGroup : "cross_construct_context";
    correlations.push({
      a: a.id, b: b.id, count: 27, group, pearson: p, spearman: s,
      possibleRedundancy: (p !== null && Math.abs(p) >= 0.85) || (s !== null && Math.abs(s) >= 0.85),
      interpretation: group === "cross_construct_context"
        ? "Exploratory ecological relation across distinct constructs/vintages; not a capacity effect, outcome validation or grounds for additive scoring."
        : "Descriptive same-cohort diagnostic; nested composites and common size/reporting effects require conceptual review regardless of correlation.",
    });
  }
}
const core = [...series.values()].filter(({ recommendation }) => recommendation.status === "CORE").map(({ id }) => id);
assert.deepEqual([...core].sort(), [...protocol.method.coreIds].sort());
const admission = {};
for (const item of series.values()) {
  const stats = statistics[item.id];
  const gates = Object.fromEntries(protocol.method.admissionGates.map((gate) => [gate, { pass: null, evidence: item.recommendation.reason }]));
  gates.official_source = { pass: true, evidence: `${item.source.publisher}; ${item.source.url}` };
  gates.reference_2023 = { pass: item.year === 2023, evidence: item.source.referencePeriod };
  gates.coverage_27 = { pass: stats.count === 27, evidence: `${stats.count}/27 numeric observations` };
  gates.comparable_unit = { pass: true, evidence: item.unit };
  gates.no_unresolved_missing = { pass: stats.missing === 0 && stats.ambiguousNumeric === 0, evidence: `${stats.missing} missing cells; ${stats.ambiguousNumeric} numeric cells with unresolved interpretation` };
  gates.sufficient_variation = { pass: stats.unique > 1, evidence: `${stats.unique} unique; range ${stats.max - stats.min}; low-variation diagnostic ${stats.lowVariationDiagnostic}` };
  gates.clear_natural_direction = { pass: ["higher_worse", "higher_better"].includes(item.direction), evidence: item.directionExplanation };
  gates.comparable_definition.evidence = item.comparability;
  gates.compatible_geography.evidence = item.comparability;
  gates.clear_resilience_construct.evidence = item.concept;
  gates.defensible_denominator_if_rate = { pass: item.rawOrDerived !== "derived_rate" ? null : true, evidence: JSON.stringify({ numerator: item.numerator, denominator: item.denominator, formula: item.formula, note: "Not applicable to an unconverted index/count; raw counts still lack a size-comparable scoring interpretation." }) };
  gates.not_primarily_reporting_intensity.evidence = item.reportingBias;
  gates.no_severe_unnecessary_redundancy.evidence = item.redundancy;
  gates.no_embedded_component_double_count.evidence = item.redundancy;
  if (core.includes(item.id)) {
    for (const gate of protocol.method.admissionGates) gates[gate].pass = true;
    gates.defensible_denominator_if_rate.evidence = "Not a rate: published composite index retained unchanged; no population division.";
    assert.equal(stats.missing, 0, item.id);
    assert(stats.unique > 1 && stats.outsideBounds.length === 0, item.id);
  }
  admission[item.id] = { decision: item.recommendation, gates, note: "Null means not admitted/not resolved/not applicable. Only CORE has an affirmative complete admission finding; numeric availability does not override source caveats." };
}
const inputHashes = inputs.map(({ path }) => ({ path, sha256: hash(readFileSync(new URL(path, root))) }));
const evidence = [...artifacts.values()].map((artifact) => {
  const metadata = { ...artifact };
  delete metadata.content;
  return metadata;
});
const observations = {
  auditId: protocol.auditId, accessedAt: protocol.accessedAt, scope: protocol.scope,
  productionScoringCutover: false, regions, inputHashes, evidence,
  series: [...series.values()], investigations,
};
const results = {
  auditId: protocol.auditId, accessedAt: protocol.accessedAt, methodology: protocol.method,
  construct: protocol.construct, inputHashes,
  script: { path: "scripts/analyze-resilience-audit-2023.mjs", sha256: hash(readFileSync(new URL(import.meta.url))) },
  totals: {
    artifacts: artifacts.size, series: series.size, expectedRegionalRecords: series.size * 27,
    numericObservations: Object.values(statistics).reduce((total, stats) => total + stats.count, 0),
    ambiguousNumeric: Object.values(statistics).reduce((total, stats) => total + stats.ambiguousNumeric, 0),
    missing: Object.values(statistics).reduce((total, stats) => total + stats.missing, 0),
    completePanels: Object.values(statistics).filter(({ missing }) => missing === 0).length,
    investigations: investigations.length, correlations: correlations.length,
    definedCorrelationPairs: correlations.filter(({ pearson }) => pearson !== null).length,
    undefinedConstantPairs: correlations.filter(({ pearson }) => pearson === null).length,
    redundancyFlags: correlations.filter(({ possibleRedundancy }) => possibleRedundancy).length,
    protectedExistingFiles: Object.keys(protocol.productionProtection.sha256BeforeAudit).length,
  },
  decisions: { core, context: [...series.values()].filter(({ recommendation }) => recommendation.status === "CONTEXT ONLY").map(({ id }) => id), rejected: [...series.values()].filter(({ recommendation }) => recommendation.status === "REJECTED").map(({ id }) => id) },
  statistics, admission, correlations, evidence,
    correlationExclusions: [...series.values()].filter((item) => !eligible.includes(item)).map(({ id }) => ({ id, reason: statistics[id].missing ? "Incomplete cohort; no pairwise deletion or imputation." : statistics[id].ambiguousNumeric ? "Source heading/edition/definition ambiguity; numerical resemblance cannot validate it." : "Supporting denominator or no comparable correlation group." })),
  protection: { passed: true, sha256BeforeAudit: protocol.productionProtection.sha256BeforeAudit },
};
const headers = ["id", "indicator", "concept", "publisher", "official_url", "table", "year", "coverage", "unit", "raw_derived_composite", "numerator", "denominator", "formula", "natural_direction", "direction_explanation", "reporting_bias", "variation", "redundancy_risk", "recommendation", "reason", "source_file", "caveats"];
const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const rows = [...series.values()].map((item) => {
  const s = statistics[item.id];
  return [item.id, item.name, item.concept, item.source.publisher, item.source.url, item.source.table, item.year, `${s.count}/27 numeric; missing ${s.missing}; ambiguous ${s.ambiguousNumeric}`, item.unit, item.rawOrDerived, item.numerator, item.denominator, item.formula, item.direction, item.directionExplanation, item.reportingBias, `${s.unique} unique; min ${s.min}; max ${s.max}; SD ${s.populationStandardDeviation}`, item.redundancy, item.recommendation.status, item.recommendation.reason, item.sourceFile, JSON.stringify(item.caveats)];
});
for (const item of investigations) rows.push([item.id, item.name, item.concept, item.publisher, item.url, item.table, item.year, item.coverage, item.unit, item.rawOrDerived, item.numerator, item.denominator, item.formula, item.direction, item.directionExplanation, item.reportingBias, item.variation, item.redundancy, item.recommendation.status, item.recommendation.reason, item.sourceFile, JSON.stringify(item.gaps)]);
const outputs = new Map([
  ["data/processed/resilience-audit-2023-statistics.json", JSON.stringify(results, null, 2) + "\n"],
  ["data/processed/resilience-audit-2023-observations.json", JSON.stringify(observations, null, 2) + "\n"],
  ["data/processed/resilience-audit-2023-candidate-register.csv", [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n") + "\n"],
]);
for (const [path, content] of outputs) {
  if (process.argv.includes("--check")) assert.equal(readFileSync(new URL(path, root), "utf8"), content, `Stale audit output: ${path}`);
  else writeFileSync(new URL(path, root), content);
}
console.log(JSON.stringify({ mode: process.argv.includes("--check") ? "check" : "generate", ...results.totals, core }, null, 2));
