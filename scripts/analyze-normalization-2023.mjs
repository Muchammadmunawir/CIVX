import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

// Methodology analysis only: never import a scorer or write a production input, policy or UI file.
const root = new URL("../", import.meta.url);
const inputPath = "data/processed/final-indicator-freeze-2023.json";
const documentPath = "docs/FINAL-INDICATOR-FREEZE-2023.md";
const outputPath = "data/processed/normalization-design-2023.json";
const csvPath = "data/processed/normalization-design-2023.csv";
const frozenSha256 = "8d72727f93c393a331582e83c8250d758abffca4fb2fc8920797b9ff3fe4d7ac";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const bytes = (path) => readFileSync(new URL(path, root));
assert(process.argv.slice(2).every((arg) => arg === "--check"), "Only --check is supported");
const inputBytes = bytes(inputPath);
assert.equal(hash(inputBytes), frozenSha256, "FROZEN_INPUT_CHANGED: explicit reviewed revision required");
const frozen = JSON.parse(inputBytes);
assert.equal(frozen.contractId, "civx-jabar-2023-final-indicator-freeze");
assert.equal(frozen.referenceYear, 2023);
assert.equal(frozen.totalCoreIndicators, 18);
assert.equal(frozen.totalDimensions, 6);
assert.equal(frozen.indicators.length, 18);
assert.equal(frozen.dimensions.length, 6);
assert.equal(new Set(frozen.indicators.map(({ indicatorId }) => indicatorId)).size, 18);
for (const entry of frozen.evidenceManifest) {
  const content = bytes(entry.path);
  assert.equal(hash(content), entry.sha256, `Pinned freeze evidence changed: ${entry.path}`);
  assert.equal(content.length, entry.bytes, entry.path);
}
const regions = frozen.geography.regions;
const regionIds = regions.map(({ id }) => id);
assert.equal(regionIds.length, 27);
assert.equal(new Set(regionIds).size, 27);
const regionNames = new Map(regions.map(({ id, name }) => [id, name]));
const originalObservationsHash = hash(JSON.stringify(frozen.indicators.map(({ observations }) => observations)));
for (const dimension of frozen.dimensions) {
  const actual = frozen.indicators.filter(({ dimensionId }) => dimensionId === dimension.dimensionId).map(({ indicatorId }) => indicatorId);
  assert.deepEqual(actual, dimension.indicatorIds);
  assert.equal(actual.length, dimension.indicatorCount);
}

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
function quantile(sorted, p) {
  const position = (sorted.length - 1) * p;
  const i = Math.floor(position);
  return sorted[i] + (sorted[Math.min(i + 1, sorted.length - 1)] - sorted[i]) * (position - i);
}
function midranks(values) {
  const sorted = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const ranks = Array(values.length);
  for (let start = 0; start < sorted.length;) {
    let end = start + 1;
    while (end < sorted.length && sorted[end].value === sorted[start].value) end++;
    const rank = (start + 1 + end) / 2;
    for (let i = start; i < end; i++) ranks[sorted[i].index] = rank;
    start = end;
  }
  return ranks;
}
function pearson(a, b) {
  const ma = mean(a); const mb = mean(b);
  let cross = 0; let va = 0; let vb = 0;
  for (let i = 0; i < a.length; i++) {
    cross += (a[i] - ma) * (b[i] - mb);
    va += (a[i] - ma) ** 2;
    vb += (b[i] - mb) ** 2;
  }
  const r = cross / Math.sqrt(va * vb);
  assert(Number.isFinite(r) && Math.abs(r) <= 1 + 1e-12);
  // Bound correlation roundoff only; no selected normalized observation is clipped.
  return Math.max(-1, Math.min(1, r));
}
function minMax(value, low, high, sign) {
  assert([value, low, high].every(Number.isFinite), "NON_FINITE_VALUE: normalization stopped");
  assert(high > low, "CONSTANT_SERIES: no pressure score manufactured");
  assert(value >= low && value <= high, "OUTSIDE_CALIBRATION_RANGE: review version, do not clip");
  return 100 * ((sign === 1 ? value - low : high - value) / (high - low));
}
function expectedBounds(item) {
  if (item.unit.startsWith("percent ") || item.indicatorId === "iklh_2023") return { minimum: 0, maximum: 100, basis: "Published percentage or explicit IKLH 0–100 index domain" };
  if (item.indicatorId === "gini_ratio") return { minimum: 0, maximum: 1, basis: "Published expenditure Gini coefficient, not percent" };
  return { minimum: 0, maximum: null, basis: "Nonnegative years, adjusted expenditure, supply rate or overall IRBI; no invented upper bound" };
}
const methods = [
  { id: "min_max", name: "Directional cohort min-max", bounded: true, intendedRange: [0, 100], selected: true,
    formula: "higher-pressure: 100*(x-min)/(max-min); lower-pressure: 100*(max-x)/(max-min)",
    preservesMagnitudeRatiosWithinIndicator: true, clipsObservations: false },
  { id: "z_score", name: "Directional population-SD z-score", bounded: false, intendedRange: null, selected: false,
    formula: "sign*(x-mean)/populationSD, where sign=+1 for higher raw pressure, otherwise -1",
    preservesMagnitudeRatiosWithinIndicator: true, clipsObservations: false },
  { id: "percentile_midrank", name: "Directional endpoint-scaled percentile midrank", bounded: true, intendedRange: [0, 100], selected: false,
    formula: "higher-pressure: 100*(r-1)/(n-1); lower-pressure: 100*(n-r)/(n-1); r=one-based average raw-value rank",
    preservesMagnitudeRatiosWithinIndicator: false, clipsObservations: false },
  { id: "median_iqr", name: "Directional median/IQR scaling", bounded: false, intendedRange: null, selected: false,
    formula: "sign*(x-median)/(Q3-Q1)", preservesMagnitudeRatiosWithinIndicator: true, clipsObservations: false },
  { id: "winsorized_min_max_05_95", name: "Directional 5th/95th-percentile winsorized min-max", bounded: true, intendedRange: [0, 100], selected: false,
    formula: "min_max(clamp(x,Q05,Q95),Q05,Q95,sign); diagnostic candidate only",
    preservesMagnitudeRatiosWithinIndicator: false, clipsObservations: true },
];
const methodIds = methods.map(({ id }) => id);
const boundedMethods = new Set(methods.filter(({ bounded }) => bounded).map(({ id }) => id));
const attentionPolicy = {
  endpointShiftAbovePoints: 20, centralIqrSpanBelowPoints: 20,
  interpretation: "Disclosure heuristics only, not admission, error, deletion or clipping thresholds. Report continuous diagnostics for every indicator.",
};
let directionPairChecks = 0;
function ordering(a, b) {
  let reversals = 0; let tiedOnlyInA = 0; let tiedOnlyInB = 0;
  for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) {
    const sa = Math.sign(a[i] - a[j]); const sb = Math.sign(b[i] - b[j]);
    if (sa * sb < 0) reversals++;
    if (sa === 0 && sb !== 0) tiedOnlyInA++;
    if (sb === 0 && sa !== 0) tiedOnlyInB++;
  }
  return { pairCount: a.length * (a.length - 1) / 2, reversals, tiedOnlyInA, tiedOnlyInB, sameWeakOrdering: reversals === 0 && tiedOnlyInA === 0 && tiedOnlyInB === 0 };
}

const indicators = frozen.indicators.map((item, indicatorIndex) => {
  assert.equal(item.year, 2023, `Wrong year: ${item.indicatorId}`);
  assert.equal(item.classification, "CORE"); assert.equal(item.frozenStatus, "FROZEN");
  assert.deepEqual(item.observations.map(({ regionId }) => regionId), regionIds, `INCOMPLETE_COHORT: ${item.indicatorId}`);
  const bounds = expectedBounds(item);
  const values = item.observations.map((row) => {
    assert(row.value !== null && row.value !== undefined, `MISSING_VALUE: ${item.indicatorId}/${row.regionId}`);
    assert(typeof row.value === "number" && Number.isFinite(row.value), `NON_FINITE_VALUE: ${item.indicatorId}/${row.regionId}`);
    assert(row.value >= bounds.minimum && (bounds.maximum === null || row.value <= bounds.maximum), `EXPECTED_BOUNDS: ${item.indicatorId}/${row.regionId}`);
    return row.value;
  });
  const sorted = [...values].sort((a, b) => a - b);
  const n = values.length; const low = sorted[0]; const high = sorted[n - 1];
  assert(high > low, `CONSTANT_SERIES: ${item.indicatorId}; stop, never use 0 or 50`);
  const average = mean(values); const median = quantile(sorted, 0.5);
  const variance = mean(values.map((value) => (value - average) ** 2));
  const populationSd = Math.sqrt(variance); const sampleSd = Math.sqrt(variance * n / (n - 1));
  const q1 = quantile(sorted, 0.25); const q3 = quantile(sorted, 0.75); const iqr = q3 - q1;
  const q05 = quantile(sorted, 0.05); const q95 = quantile(sorted, 0.95);
  assert([average, median, populationSd, sampleSd, iqr, q05, q95].every(Number.isFinite), "NON_FINITE_STATISTIC: stop");
  assert(populationSd > 0 && iqr > 0 && q95 > q05, "ALTERNATIVE_SCALE_UNAVAILABLE: no robust scale fallback");
  const direction = item.civxPressureDirection;
  assert(["higher_raw_higher_pressure", "higher_raw_lower_pressure"].includes(direction), `Unknown direction: ${item.indicatorId}`);
  const sign = direction === "higher_raw_higher_pressure" ? 1 : -1;
  const ranks = midranks(values);
  const panels = {
    min_max: values.map((value) => minMax(value, low, high, sign)),
    z_score: values.map((value) => sign * (value - average) / populationSd),
    percentile_midrank: ranks.map((rank) => 100 * ((sign === 1 ? rank - 1 : n - rank) / (n - 1))),
    median_iqr: values.map((value) => sign * (value - median) / iqr),
    winsorized_min_max_05_95: values.map((value) => minMax(Math.max(q05, Math.min(q95, value)), q05, q95, sign)),
  };
  const candidateSummaries = {};
  for (const id of methodIds) {
    const panel = panels[id];
    assert(panel.every(Number.isFinite), `Non-finite normalized panel: ${item.indicatorId}/${id}`);
    if (boundedMethods.has(id)) assert(panel.every((value) => value >= 0 && value <= 100), `Wrong score range: ${item.indicatorId}/${id}`);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const rawOrder = sign * Math.sign(values[i] - values[j]); const scoreOrder = Math.sign(panel[i] - panel[j]);
      assert(rawOrder === 0 ? scoreOrder === 0 : (id === "winsorized_min_max_05_95" ? rawOrder * scoreOrder >= 0 : rawOrder === scoreOrder), `Wrong pressure direction: ${item.indicatorId}/${id}`);
      directionPairChecks++;
    }
    const ordered = [...panel].sort((a, b) => a - b);
    const panelMean = mean(panel);
    candidateSummaries[id] = { minimum: ordered[0], maximum: ordered[n - 1], mean: panelMean, median: quantile(ordered, 0.5), populationSd: Math.sqrt(mean(panel.map((value) => (value - panelMean) ** 2))), uniqueValues: new Set(panel).size };
  }
  assert.equal(Math.min(...panels.min_max), 0); assert.equal(Math.max(...panels.min_max), 100);
  const comparisons = [];
  for (let a = 0; a < methodIds.length; a++) for (let b = a + 1; b < methodIds.length; b++) {
    const methodA = methodIds[a]; const methodB = methodIds[b];
    const pa = panels[methodA]; const pb = panels[methodB];
    const sameBoundedScale = boundedMethods.has(methodA) && boundedMethods.has(methodB);
    const differences = sameBoundedScale ? pa.map((value, i) => Math.abs(value - pb[i])) : null;
    comparisons.push({ methodA, methodB, pearson: pearson(pa, pb), spearman: pearson(midranks(pa), midranks(pb)), ordering: ordering(pa, pb),
      sameBoundedScale, maxAbsoluteDifferencePoints: differences ? Math.max(...differences) : null, meanAbsoluteDifferencePoints: differences ? mean(differences) : null,
      differenceCaution: sameBoundedScale ? "Same 0–100 numerical range; percentile and distance estimands still differ" : "Point differences are not compared between SD/IQR units and a 0–100 scale",
    });
  }
  const scenarios = values.map((omittedValue, omittedIndex) => {
    const retained = values.filter((_, index) => index !== omittedIndex);
    const minimum = Math.min(...retained); const maximum = Math.max(...retained);
    const changes = values.flatMap((value, index) => index === omittedIndex ? [] : [Math.abs(minMax(value, minimum, maximum, sign) - panels.min_max[index])]);
    return { omittedRegionId: regionIds[omittedIndex], omittedRawValue: omittedValue, recalibratedMinimum: minimum, recalibratedMaximum: maximum, retainedCount: n - 1, maxRetainedShiftPoints: Math.max(...changes), meanRetainedShiftPoints: mean(changes) };
  });
  const maxRetainedShiftPoints = Math.max(...scenarios.map((entry) => entry.maxRetainedShiftPoints));
  const outliers = (multiplier) => {
    const lowerFence = q1 - multiplier * iqr; const upperFence = q3 + multiplier * iqr;
    return { multiplier, lowerFence, upperFence, observations: item.observations.filter(({ value }) => value < lowerFence || value > upperFence).map(({ regionId, value }) => ({ regionId, rawValue: value, side: value < lowerFence ? "low" : "high" })) };
  };
  const groups = new Map();
  for (const [index, value] of values.entries()) {
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(regionIds[index]);
  }
  const tiedValueGroups = [...groups].filter(([, ids]) => ids.length > 1).map(([value, ids]) => ({ value, regionIds: ids, count: ids.length }));
  const winsorizedSourceValues = item.observations.filter(({ value }) => value < q05 || value > q95).map(({ regionId, value }) => ({ regionId, rawValue: value, diagnosticClippedValue: value < q05 ? q05 : q95 }));
  const skewness = Math.sqrt(n * (n - 1)) / (n - 2) * mean(values.map((value) => ((value - average) / populationSd) ** 3));
  const iqrSpanMinMaxPoints = 100 * iqr / (high - low);
  return {
    indicatorId: item.indicatorId, dimensionId: item.dimensionId, displayName: item.displayName, year: 2023, unit: item.unit, pressureDirection: direction,
    frozenIndicatorPointer: `/indicators/${indicatorIndex}`, expectedBounds: bounds,
    statistics: { n, minimum: low, maximum: high, mean: average, median, populationSd, sampleSd, q1, q3, iqr, adjustedFisherPearsonSkewness: skewness,
      uniqueValues: groups.size, extraObservationsSharingValues: n - groups.size, zeroCount: values.filter((value) => value === 0).length, tiedValueGroups,
      outlierDiagnostics: { tukey1_5Iqr: outliers(1.5), tukey3Iqr: outliers(3), iqrSpanMinMaxPoints,
        lowerEndpointGapPoints: 100 * (sorted[1] - low) / (high - low), upperEndpointGapPoints: 100 * (high - sorted[n - 2]) / (high - low),
        endpointAttention: maxRetainedShiftPoints > attentionPolicy.endpointShiftAbovePoints, centralIqrAttention: iqrSpanMinMaxPoints < attentionPolicy.centralIqrSpanBelowPoints,
        leaveOneOut: { diagnosticOnly: true, selectedCohortStill27: true, interpretation: "Counterfactual 26-region recalibrations evaluated only on retained observations; not replacements for the selected 27-region panel", maxRetainedShiftPoints,
          mostInfluentialRegionIds: scenarios.filter((entry) => Math.abs(entry.maxRetainedShiftPoints - maxRetainedShiftPoints) < 1e-10).map(({ omittedRegionId }) => omittedRegionId), scenarios },
      },
    },
    calibration: { min_max: { minimum: low, maximum: high }, z_score: { mean: average, populationSd }, percentile_midrank: { n, ties: "One-based average raw-value rank; reverse rank direction where required" }, median_iqr: { median, q1, q3, iqr },
      winsorized_min_max_05_95: { lowProbability: 0.05, highProbability: 0.95, quantileMethod: "Type 7 linear interpolation at (n-1)*p", minimum: q05, maximum: q95, clippedObservationCount: winsorizedSourceValues.length, diagnosticChanges: winsorizedSourceValues },
    },
    candidateSummaries, sensitivity: { comparisons },
    observations: item.observations.map((row, index) => ({ regionId: row.regionId, regionName: regionNames.get(row.regionId), frozenObservationPointer: `/indicators/${indicatorIndex}/observations/${index}`, rawValue: row.value,
      normalizedPressure: Object.fromEntries(methodIds.map((id) => [id, panels[id][index]])),
    })),
  };
});
assert.equal(hash(JSON.stringify(frozen.indicators.map(({ observations }) => observations))), originalObservationsHash, "Raw observations mutated in memory");
assert.equal(indicators.reduce((sum, item) => sum + item.observations.length, 0), 486);
assert.equal(directionPairChecks, 18 * 5 * 351);
const comparisons = indicators.flatMap(({ indicatorId, sensitivity }) => sensitivity.comparisons.map((entry) => ({ indicatorId, ...entry })));
assert.equal(comparisons.length, 180);
assert(comparisons.every(({ ordering: result }) => result.reversals === 0));
const pairSummaries = [];
for (let a = 0; a < methodIds.length; a++) for (let b = a + 1; b < methodIds.length; b++) {
  const selected = comparisons.filter((entry) => entry.methodA === methodIds[a] && entry.methodB === methodIds[b]);
  pairSummaries.push({ methodA: methodIds[a], methodB: methodIds[b], indicatorsCompared: selected.length,
    minPearson: Math.min(...selected.map(({ pearson: r }) => r)), maxPearson: Math.max(...selected.map(({ pearson: r }) => r)), minSpearman: Math.min(...selected.map(({ spearman }) => spearman)), maxSpearman: Math.max(...selected.map(({ spearman }) => spearman)),
    totalPairReversals: selected.reduce((sum, entry) => sum + entry.ordering.reversals, 0), tiesOnlyInA: selected.reduce((sum, entry) => sum + entry.ordering.tiedOnlyInA, 0), tiesOnlyInB: selected.reduce((sum, entry) => sum + entry.ordering.tiedOnlyInB, 0),
    maxAbsoluteDifferencePoints: selected[0].sameBoundedScale ? Math.max(...selected.map(({ maxAbsoluteDifferencePoints: value }) => value)) : null,
  });
}
const strongestDifference = (methodB) => comparisons.filter((entry) => entry.methodA === "min_max" && entry.methodB === methodB).reduce((a, b) => a.maxAbsoluteDifferencePoints >= b.maxAbsoluteDifferencePoints ? a : b);
const sourceManifest = [inputPath, documentPath].map((path) => {
  const content = bytes(path);
  return { path, sha256: hash(content), bytes: content.length };
});
const output = {
  designId: "civx-jabar-2023-normalization-design", version: 1, status: "METHODOLOGY_DESIGN_ONLY", referenceYear: 2023,
  input: { path: inputPath, sha256: frozenSha256, contractId: frozen.contractId, sourceManifest, verifiedFrozenEvidenceFiles: frozen.evidenceManifest.length, regions, dimensionIds: frozen.dimensions.map(({ dimensionId }) => dimensionId), indicatorIds: indicators.map(({ indicatorId }) => indicatorId) },
  recommendation: { methodId: "min_max", name: "Directional min-max using the fixed 27-region 2023 cohort", intendedRange: [0, 100], readyForWeightingDesign: true,
    uniformlyEndpointRobust: false, clippingJustified: false,
    rationale: ["All 18 series vary, contain 27 valid observations and have positive SD/IQR. Central IQRs remain visible rather than collapsing to a few points.", "Preserve all audited magnitude differences with one affine, direction-aware transformation per indicator.", "Z-score and median/IQR retain exactly the same ordering and distribution shape but lack natural 0–100 endpoints; min-max rescaling of either is identical to ordinary min-max.", "Percentile midranks erase raw gap magnitudes; winsorization introduces artificial tail ties without evidence that the audited extremes are invalid.", "Material endpoint sensitivity is disclosed, especially UHH and Puskesmas. Fixed inputs/anchors provide reproducibility, not uncertainty elimination or a claim of universal robustness."],
  },
  contract: {
    comparisonCohort: "Exactly the frozen 27 Jawa Barat kabupaten/kota and 2023-compatible observations; no region/indicator/year substitution",
    directionRule: "Use frozen civxPressureDirection: higher_raw_higher_pressure => 100*(x-min)/(max-min); higher_raw_lower_pressure => 100*(max-x)/(max-min)",
    endpointInterpretation: "0 is the lower-pressure observed endpoint and 100 the higher-pressure observed endpoint of this indicator in this cohort; neither means no real-world pressure or a global maximum",
    outlierPolicy: "Retain every observation. Tukey fences and anchor-deletion diagnostics are flags, not data-error proofs. No selected winsorization, clipping, log transform or value deletion.",
    missingPolicy: "Stop the entire run on missing/non-numeric/non-finite values or incomplete cohort; no zero-fill, interpolation, per-region omission or implicit reweighting",
    constantPolicy: "If min=max, stop with CONSTANT_SERIES. Do not assign 0, 50 or an artificial denominator; require explicit methodology review before a new contract",
    expectedBoundsPolicy: "Reject values outside each documented physical/publisher bound before normalization. Do not confuse cohort extrema with physical limits; do not invent an upper bound for nonnegative years, rates, expenditure or IRBI",
    outsideCalibrationPolicy: "Stop if any value is outside locked calibration extrema; never silently extrapolate or clip to 0/100. A corrected observation or different cohort/year requires an explicit versioned design and input review",
    robustAlternativeDegeneracy: "The current 18 have positive IQR and Q95-Q05. If a future comparison has zero robust scale, this analyzer stops rather than manufacturing candidate values; ordinary min-max itself requires only a positive range",
    precisionPolicy: "Use full stored precision; do not round raw values or normalized values before later weighting. Display rounding must not feed computation",
    sourceCompositePolicy: "Treat overall IRBI and district IKLH as published raw observations; no decomposition, reconstruction or population division",
    weightingConstraint: frozen.safeguards.weightingConstraint,
    dimensionCountCreatesWeight: false, finalWeightsAssigned: false, finalCivicIndexCalculated: false, finalCivicRankingsGenerated: false, productionScorerChanged: false, frontendChanged: false,
  },
  statisticalConventions: { weighting: "Unweighted regional distribution diagnostics only, not dimension/indicator aggregation weights", quantiles: "Type 7 linear interpolation: sorted[(n-1)*p] with linear fractional position", zScoreSd: "Population SD with divisor n=27, the complete comparison cohort", additionalSd: "Sample SD with divisor n-1 also reported", skewness: "Adjusted Fisher-Pearson coefficient sqrt(n*(n-1))/(n-2) times the population third standardized moment", outliers: "Strictly outside Q1-1.5*IQR or Q3+1.5*IQR; severe diagnostic uses multiplier 3", percentile: "Average ranks for exact raw-value ties; tied extrema need not attain 0 or 100", attentionPolicy },
  methods, indicators,
  sensitivitySummary: { pairSummaries,
    iqrSpanMinMaxPoints: { minimum: Math.min(...indicators.map(({ statistics: s }) => s.outlierDiagnostics.iqrSpanMinMaxPoints)), maximum: Math.max(...indicators.map(({ statistics: s }) => s.outlierDiagnostics.iqrSpanMinMaxPoints)) },
    endpointAttention: indicators.filter(({ statistics: s }) => s.outlierDiagnostics.endpointAttention).map(({ indicatorId, statistics: s }) => ({ indicatorId, maxRetainedShiftPoints: s.outlierDiagnostics.leaveOneOut.maxRetainedShiftPoints, mostInfluentialRegionIds: s.outlierDiagnostics.leaveOneOut.mostInfluentialRegionIds })),
    tukeyOutlierObservations: indicators.reduce((sum, { statistics: s }) => sum + s.outlierDiagnostics.tukey1_5Iqr.observations.length, 0),
    severeTukeyOutlierObservations: indicators.reduce((sum, { statistics: s }) => sum + s.outlierDiagnostics.tukey3Iqr.observations.length, 0),
    winsorizedCandidateChangedValues: indicators.reduce((sum, item) => sum + item.calibration.winsorized_min_max_05_95.clippedObservationCount, 0),
    mostSensitiveMinMaxVsPercentile: strongestDifference("percentile_midrank"), mostSensitiveMinMaxVsWinsorized: strongestDifference("winsorized_min_max_05_95"),
    noOrderReversals: true, preservedOrderCaution: "Strict monotone methods cannot reverse within-indicator order. This does not imply equal distances, unchanged future weighted aggregates or precise statistically significant ranks.",
  },
  verification: { indicatorCount: 18, dimensions: 6, regionsPerIndicator: 27, rawValueCount: 486, unresolvedMissingValues: 0, candidateMethodCount: 5, finiteCandidateValues: 2430, boundedCandidateValues: 1458, selectedNormalizedValues: 486,
    allSelectedValuesBetween0And100: true, selectedPressureDirectionVerified: true, directionPairChecks, pairwiseMethodComparisons: comparisons.length, counterfactualCalibrationScenarios: 486,
    membershipChanged: false, rawObservationsChanged: false, weightingApplied: false, finalCivicIndexCalculated: false, finalCivicRankingsGenerated: false, productionIntegrationPerformed: false,
  },
  generator: { path: "scripts/analyze-normalization-2023.mjs", sha256: hash(readFileSync(new URL(import.meta.url))) },
};
const cell = (value) => `"${String(value).replaceAll('"', '""')}"`;
const csv = [
  ["indicator_id", "dimension_id", "region_id", "region_name", "year", "unit", "raw_value", "pressure_direction", ...methodIds, "frozen_observation_pointer"],
  ...indicators.flatMap((item) => item.observations.map((row) => [item.indicatorId, item.dimensionId, row.regionId, row.regionName, 2023, item.unit, row.rawValue, item.pressureDirection, ...methodIds.map((id) => row.normalizedPressure[id]), row.frozenObservationPointer])),
].map((row) => row.map(cell).join(",")).join("\n") + "\n";
for (const [path, content] of [[outputPath, JSON.stringify(output, null, 2) + "\n"], [csvPath, csv]]) {
  if (process.argv.includes("--check")) assert.equal(bytes(path).toString("utf8"), content, `Normalization design differs: ${path}`);
  else writeFileSync(new URL(path, root), content);
}
console.log(JSON.stringify({ mode: process.argv.includes("--check") ? "check" : "analysis", selectedMethod: output.recommendation.methodId, ...output.verification, iqrSpanMinMaxPoints: output.sensitivitySummary.iqrSpanMinMaxPoints, endpointAttention: output.sensitivitySummary.endpointAttention, winsorizedCandidateChangedValues: output.sensitivitySummary.winsorizedCandidateChangedValues, readyForWeightingDesign: true }, null, 2));
