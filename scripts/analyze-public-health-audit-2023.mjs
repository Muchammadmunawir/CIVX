import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

// Research-only pipeline. This script never imports or writes a production release or scorer.
const root = new URL("../", import.meta.url);
const rawDirectory = "data/raw/public-health-audit-2023/";
const files = ["dbd", "general-health", "infectious", "nutrition", "maternal-child", "ncd", "recovery"];
const load = (path) => JSON.parse(readFileSync(new URL(path, root), "utf8"));
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const sources = files.map((name) => ({ path: `${rawDirectory}${name}.json`, data: load(`${rawDirectory}${name}.json`) }));
const protocol = sources.find(({ data }) => data.method)?.data;
assert(protocol, "Missing audit protocol");
const regions = load("data/raw/civx-jabar-2023.json").regions;
const regionIds = regions.map(({ id }) => id);
const regionNames = new Map(regions.map(({ id, name }) => [id, name]));
assert.equal(regionIds.length, 27);
const expectedCore = protocol.method.coreIds;
const artifacts = new Map();
const series = new Map();
const investigations = [];
const inputHashes = [];

for (const { path, data } of sources) {
  assert.equal(data.scope.referenceYear ?? data.scope.year, 2023, path);
  inputHashes.push({ path, sha256: sha(readFileSync(new URL(path, root))) });
  for (const artifact of data.artifacts) {
    assert(!artifacts.has(artifact.id), `Duplicate artifact ${artifact.id}`);
    assert.equal(typeof artifact.content, "string", artifact.id);
    assert.equal(sha(Buffer.from(artifact.content)), artifact.sha256, `${artifact.id}: evidence hash`);
    if (artifact.bytes !== undefined) assert.equal(Buffer.byteLength(artifact.content), artifact.bytes, artifact.id);
    artifacts.set(artifact.id, { ...artifact, sourceFile: path });
  }
  for (const item of data.series) {
    assert(!series.has(item.id), `Duplicate indicator ${item.id}`);
    assert.equal(item.year, 2023, item.id);
    assert.deepEqual(item.observations.map(({ regionId }) => regionId), regionIds, `${item.id}: geographic cohort`);
    for (const observation of item.observations) {
      assert(observation.value === null || Number.isFinite(observation.value), `${item.id}: nonfinite value`);
      assert(observation.value !== null || observation.status !== "observed", `${item.id}: hidden missingness`);
      assert(observation.sourceRecord?.artifactId, `${item.id}: missing row receipt`);
    }
    series.set(item.id, { ...item, sourceFile: path });
  }
  for (const item of data.investigations) investigations.push({ ...item, sourceFile: path });
}
for (const item of series.values()) {
  assert(artifacts.has(item.source.artifactId), `${item.id}: missing source artifact`);
  for (const observation of item.observations) {
    assert(artifacts.has(observation.sourceRecord.artifactId), `${item.id}: missing row artifact`);
    if (item.rawOrDerived !== "derived_rate" || observation.value === null) continue;
    assert(Number.isFinite(observation.numerator), `${item.id}: invalid numerator`);
    assert(observation.denominator > 0, `${item.id}: invalid denominator`);
    assert(artifacts.has(observation.denominatorSourceArtifactId), `${item.id}: missing denominator provenance`);
    const multiplier = Number(item.formula.match(/\*\s*(\d+(?:\.\d+)?)/)?.[1]);
    assert(Number.isFinite(multiplier), `${item.id}: undeclared rate multiplier`);
    const derived = observation.numerator / observation.denominator * multiplier;
    assert(Math.abs(derived - observation.value) <= 1e-10 * Math.max(1, Math.abs(derived)), `${item.id}: formula mismatch`);
  }
}
for (const [path, fingerprint] of Object.entries(protocol.productionProtection.sha256BeforeAudit)) {
  assert.equal(sha(readFileSync(new URL(path, root))), fingerprint, `${path}: protected production file changed`);
}
for (const [path, fingerprint] of Object.entries(protocol.productionProtection.additionalBeforeAudit)) {
  assert.equal(sha(readFileSync(new URL(path, root))), fingerprint, `${path}: protected input changed`);
}

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
function quantile(sorted, probability) {
  if (!sorted.length) return null;
  const index = (sorted.length - 1) * probability;
  const lower = Math.floor(index);
  return sorted[lower] + (sorted[Math.ceil(index)] - sorted[lower]) * (index - lower);
}
function describe(item) {
  const observations = item.observations.filter(({ value }) => value !== null);
  const values = observations.map(({ value }) => value).sort((a, b) => a - b);
  assert(values.length > 0, `${item.id}: no acquired observations`);
  const average = mean(values);
  const standardDeviation = Math.sqrt(mean(values.map((value) => (value - average) ** 2)));
  const q1 = quantile(values, 0.25);
  const q3 = quantile(values, 0.75);
  const iqr = q3 - q1;
  const frequencies = new Map();
  for (const value of values) frequencies.set(value, (frequencies.get(value) ?? 0) + 1);
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const cv = average > 0 ? standardDeviation / average : null;
  const isPercent = /percent|%/i.test(item.unit);
  return {
    observationCount: values.length,
    expectedCount: 27,
    missingCount: 27 - values.length,
    missing: item.observations.filter(({ value }) => value === null).map(({ regionId, rawValue, status, missingReason }) => ({ regionId, rawValue, status, reason: missingReason ?? "Source missing/ambiguous; no imputation" })),
    uniqueValues: frequencies.size,
    minimum: values[0], maximum: values.at(-1), mean: average,
    median: quantile(values, 0.5), standardDeviation, coefficientOfVariation: cv,
    cvInterpretation: "Population SD / mean; descriptive ratio, not measurement uncertainty. Small life-expectancy CV is not proof of no meaningful absolute variation.",
    q1, q3, iqr, lowerFence, upperFence,
    minimumRegions: observations.filter(({ value }) => value === values[0]).map(({ regionId }) => regionId),
    maximumRegions: observations.filter(({ value }) => value === values.at(-1)).map(({ regionId }) => regionId),
    outliers: observations.filter(({ value }) => value < lowerFence || value > upperFence).map(({ regionId, value }) => ({ regionId, name: regionNames.get(regionId), value })),
    repeatedValues: [...frequencies].filter(([, count]) => count > 1).map(([value, count]) => ({ value, count })),
    zeroCount: values.filter((value) => value === 0).length,
    hundredCount: isPercent ? values.filter((value) => value === 100).length : null,
    outsidePercentBounds: isPercent ? observations.filter(({ value }) => value < 0 || value > 100).map(({ regionId, value }) => ({ regionId, value })) : [],
    negativeValues: observations.filter(({ value }) => value < 0).map(({ regionId, value }) => ({ regionId, value })),
    lowVariationDiagnostic: frequencies.size <= 2 || (cv !== null && cv < 0.01),
    lowVariationRule: "At most two unique values or CV below0.01. Diagnostic flag only; never an automatic admission/rejection threshold.",
    precisionWarnings: item.observations.filter(({ uncertainty }) => uncertainty?.rseGreaterThan25Percent || uncertainty?.relativeStandardErrorPercent > 25).map(({ regionId, uncertainty }) => ({ regionId, uncertainty })),
    uncertainty: item.uncertainty,
  };
}
function pearson(a, b) {
  const ma = mean(a), mb = mean(b);
  let numerator = 0, va = 0, vb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i] - ma, y = b[i] - mb;
    numerator += x * y; va += x * x; vb += y * y;
  }
  return va === 0 || vb === 0 ? null : numerator / Math.sqrt(va * vb);
}
function ranks(values) {
  const order = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const result = Array(values.length);
  for (let start = 0; start < order.length;) {
    let end = start + 1;
    while (end < order.length && order[end].value === order[start].value) end++;
    const rank = (start + 1 + end) / 2;
    for (let i = start; i < end; i++) result[order[i].index] = rank;
    start = end;
  }
  return result;
}
const statistics = Object.fromEntries([...series].map(([id, item]) => [id, describe(item)]));
const correlationItems = [...series.values()].filter((item) => item.correlationEligible && statistics[item.id].missingCount === 0);
const correlations = [];
for (let i = 0; i < correlationItems.length; i++) {
  const a = correlationItems[i];
  for (const b of correlationItems.slice(i + 1)) {
    const av = a.observations.map(({ value }) => value);
    const bv = b.observations.map(({ value }) => value);
    const p = pearson(av, bv), s = pearson(ranks(av), ranks(bv));
    correlations.push({
      a: a.id, b: b.id, observationCount: 27, pearson: p, spearman: s,
      pearsonRedundancyFlag: p !== null && Math.abs(p) >= 0.85,
      spearmanRedundancyFlag: s !== null && Math.abs(s) >= 0.85,
      possibleRedundancy: (p !== null && Math.abs(p) >= 0.85) || (s !== null && Math.abs(s) >= 0.85),
      interpretation: expectedCore.includes(a.id) && expectedCore.includes(b.id)
        ? "Two recommended CORE outcomes. Descriptive ecological association, not proof of causal or individual independence."
        : "Context/source-edition/operational diagnostic. No admission or rejection follows from this correlation alone.",
    });
  }
}
const coreIds = [...series.values()].filter(({ recommendation }) => recommendation.status === "CORE").map(({ id }) => id);
assert.deepEqual([...coreIds].sort(), [...expectedCore].sort(), "CORE decision differs from explicit audit protocol");
const admission = {};
for (const item of series.values()) {
  const s = statistics[item.id];
  const core = coreIds.includes(item.id);
  const gates = Object.fromEntries(protocol.method.admissionGates.map((gate) => [gate, { pass: core ? true : null, evidence: core ? item.recommendation.reason : "See source-specific decision, numerator/denominator, detection bias and caveats; a numeric panel is not automatic admission." }]));
  gates.official_source = { pass: true, evidence: item.source.publisher + "; " + item.source.url };
  gates.reference_2023 = { pass: item.year === 2023, evidence: "Published2023 reference; retrospective survey windows remain separately declared." };
  gates.coverage_27 = { pass: s.observationCount === 27, evidence: `${s.observationCount}/27 usable cells` };
  gates.no_unresolved_missing = { pass: s.missingCount === 0, evidence: `${s.missingCount} unresolved cells; raw symbols retained.` };
  gates.comparable_unit = { pass: true, evidence: item.unit };
  gates.compatible_geography = { pass: true, evidence: "Canonical BPS27 administrative codes; this does not establish residence/catchment equivalence of administrative events." };
  gates.adequate_variation = { pass: s.uniqueValues > 1, evidence: `${s.uniqueValues} unique values; range${s.maximum - s.minimum}; low-variation diagnostic=${s.lowVariationDiagnostic}; substantive selection still required.` };
  if (core) {
    gates.comparable_definition.evidence = item.concept;
    gates.defensible_direction.evidence = item.direction;
    gates.meaningful_numerator_denominator.evidence = JSON.stringify({ numerator: item.numerator, denominator: item.denominator });
    gates.detection_bias_acceptable.evidence = item.detectionBias;
    gates.no_severe_unnecessary_redundancy.evidence = "Different chronic growth, acute thinness, short-term functional morbidity and broad survival concepts. CORE pairs checked; no automatic equal weighting or production change.";
    assert(Object.values(gates).every(({ pass }) => pass === true), item.id);
  }
  admission[item.id] = { recommendation: item.recommendation, gates, coreConditionalOn: item.id === "life_expectancy_lfsp2020" ? "Aggregate IPM absent from next methodology; never stack this component beside production IPM." : null };
}
const rawCountAudit = [...series.values()].filter(({ rawOrDerived }) => rawOrDerived === "published_count").map((item) => {
  const derived = [...series.values()].filter(({ numerator }) => numerator?.seriesId === item.id).map(({ id, formula, numerator, denominator, recommendation }) => ({ id, formula, numerator, denominator, recommendation }));
  return {
    id: item.id, name: item.name, numerator: item.numerator,
    canTransform: derived.length > 0 ? "Yes, only as the explicitly labelled diagnostic construct below, not true incidence/prevalence." : "No new comparable burden rate established in this audit.",
    derived, noRateReason: derived.length > 0 ? null : item.recommendation.reason + " " + JSON.stringify(item.denominator),
  };
});
const outputs = {
  auditId: "civx-public-health-jabar-2023", version: protocol.method.version, accessedAt: "2026-10-29",
  researchOnly: true, productionChanged: false, weightsAssigned: false, scoringCutover: false,
  method: protocol.method, inputHashes,
  counts: {
    sourceArtifacts: artifacts.size, acquiredPanels: series.size,
    regionalRecords: [...series.values()].reduce((n, { observations }) => n + observations.length, 0),
    numericObservations: Object.values(statistics).reduce((n, s) => n + s.observationCount, 0),
    missingObservations: Object.values(statistics).reduce((n, s) => n + s.missingCount, 0),
    completePanels: Object.values(statistics).filter(({ missingCount }) => missingCount === 0).length,
    investigatedWithoutAdmittedPanel: investigations.length,
    correlationEligiblePanels: correlationItems.length, correlationPairs: correlations.length,
    redundancyFlags: correlations.filter(({ possibleRedundancy }) => possibleRedundancy).length,
    recommendedCore: coreIds.length,
  },
  coreIds, statistics, admission, correlations,
  highCorrelations: correlations.filter(({ possibleRedundancy }) => possibleRedundancy),
  rawCountAudit, investigations,
  artifactManifest: [...artifacts.values()].map(({ id, title, url, publisher, sha256, bytes, representation, sourceFile }) => ({ id, title, url, publisher, sha256, bytes, representation, sourceFile })),
  productionProtection: { verifiedFileCount: Object.keys(protocol.productionProtection.sha256BeforeAudit).length, additionalProtectedInputs: Object.keys(protocol.productionProtection.additionalBeforeAudit).length, matched: true },
};
const observations = {
  auditId: outputs.auditId, version: outputs.version, researchOnly: true, referenceYear: 2023,
  regions: regions.map(({ id, name, type, province, boundaryReference }) => ({ id, name, type, province, boundaryReference })),
  indicators: [...series.values()].map(({ observations: rows, ...item }) => ({ ...item, statisticsId: item.id, observationCount: rows.filter(({ value }) => value !== null).length })),
  observations: [...series.values()].flatMap((item) => item.observations.map((row) => ({ ...row, indicatorId: item.id, year: item.year, unit: item.unit, statisticType: item.statisticType, rawOrDerived: item.rawOrDerived, sourceFile: item.sourceFile, recommendation: item.recommendation.status }))),
};
const explain = (value) => value === null || value === undefined ? "Not established" : typeof value === "string" ? value : JSON.stringify(value);
const headers = ["Indicator", "Health concept", "Official source", "Year", "Coverage", "Unit", "Raw/Derived", "Numerator", "Denominator", "Direction", "Detection-bias risk", "Variation", "Redundancy risk", "Recommendation", "Reason"];
const registerRows = [...series.values()].map((item) => {
  const s = statistics[item.id];
  const flags = correlations.filter(({ a, b, possibleRedundancy }) => possibleRedundancy && (a === item.id || b === item.id));
  return [
    `${item.name} (${item.id})`, item.concept,
    `${item.source.publisher}; ${item.source.title}; ${item.source.table}; ${item.source.url}`,
    item.year, `${s.observationCount}/27; missing${s.missingCount}`, item.unit, item.rawOrDerived,
    explain(item.numerator), explain(item.denominator), item.direction, item.detectionBias,
    `n=${s.observationCount}; unique=${s.uniqueValues}; min=${s.minimum}; max=${s.maximum}; mean=${s.mean}; SD=${s.standardDeviation}; CV=${s.coefficientOfVariation}`,
    flags.length ? flags.map(({ a, b, pearson: p, spearman: r }) => `${a === item.id ? b : a}: Pearson${p},Spearman${r}`).join("; ") : "No high full-cohort coefficient found among eligible pairs; conceptual nesting/source duplication still requires review.",
    item.recommendation.status, item.recommendation.reason,
  ];
});
for (const item of investigations) {
  registerRows.push([item.indicator, item.concept, explain(item.source), explain(item.year), explain(item.coverage), explain(item.unit), explain(item.rawOrDerived), explain(item.numerator), explain(item.denominator), explain(item.direction), explain(item.detectionBias), "No admitted27-region panel; no statistics fabricated", "Not statistically tested without a compatible full panel", item.recommendation.status, item.recommendation.reason]);
}
const csv = [headers, ...registerRows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n") + "\n";
const destinations = [
  ["data/processed/public-health-audit-2023-statistics.json", JSON.stringify(outputs, null, 2) + "\n"],
  ["data/processed/public-health-audit-2023-observations.json", JSON.stringify(observations, null, 2) + "\n"],
  ["data/processed/public-health-audit-2023-candidate-register.csv", csv],
];
const check = process.argv.includes("--check");
for (const [path, content] of destinations) {
  if (check) assert.equal(readFileSync(new URL(path, root), "utf8"), content, `${path}: stale audit output`);
  else writeFileSync(new URL(path, root), content);
}
console.log(JSON.stringify({ mode: check ? "check" : "generate", ...outputs.counts, protectedProductionFilesMatched: true }, null, 2));
