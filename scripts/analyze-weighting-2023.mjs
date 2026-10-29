import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

// Design-only sensitivity analysis. Never import/replace a production scorer or write release/UI/config files.
const root = new URL("../", import.meta.url);
const freezePath = "data/processed/final-indicator-freeze-2023.json";
const normalizationPath = "data/processed/normalization-design-2023.json";
const outputPath = "data/processed/weighting-design-2023.json";
const csvPath = "data/processed/weighting-sensitivity-2023.csv";
const inputPins = {
  [freezePath]: "8d72727f93c393a331582e83c8250d758abffca4fb2fc8920797b9ff3fe4d7ac",
  [normalizationPath]: "1f6735060ee421b6e71212eec908d377a7928bc4e5c9999c3582267fecb374f4",
};
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const bytes = (path) => readFileSync(new URL(path, root));
const load = (path) => JSON.parse(bytes(path));
const sum = (values) => values.reduce((total, value) => total + value, 0);
const mean = (values) => sum(values) / values.length;
const weightTolerance = 1e-12;
const scoreTolerance = 1e-10;
assert(process.argv.slice(2).every((arg) => arg === "--check"), "Only --check is supported");
for (const [path, sha256] of Object.entries(inputPins)) assert.equal(hash(bytes(path)), sha256, `PINNED_INPUT_CHANGED: ${path}`);
const frozen = load(freezePath);
const normalized = load(normalizationPath);
assert.equal(frozen.referenceYear, 2023);
assert.equal(normalized.referenceYear, 2023);
assert.equal(frozen.totalCoreIndicators, 18); assert.equal(frozen.indicators.length, 18);
assert.equal(frozen.totalDimensions, 6); assert.equal(frozen.dimensions.length, 6);
assert.equal(normalized.indicators.length, 18);
assert.equal(normalized.recommendation.methodId, "min_max", "NORMALIZATION_CHANGED");
assert.deepEqual(normalized.methods.filter(({ selected }) => selected).map(({ id }) => id), ["min_max"]);
assert.equal(normalized.input.sha256, inputPins[freezePath]);
for (const entry of [...frozen.evidenceManifest, ...normalized.input.sourceManifest]) {
  const content = bytes(entry.path);
  assert.equal(hash(content), entry.sha256, `Pinned upstream evidence changed: ${entry.path}`);
  assert.equal(content.length, entry.bytes, entry.path);
}
const originalFreezeHash = hash(JSON.stringify(frozen));
const originalNormalizationHash = hash(JSON.stringify(normalized));
const dimensions = frozen.dimensions;
const dimensionIds = dimensions.map(({ dimensionId }) => dimensionId);
const indicatorIds = frozen.indicators.map(({ indicatorId }) => indicatorId);
assert.equal(new Set(dimensionIds).size, 6); assert.equal(new Set(indicatorIds).size, 18);
assert.deepEqual(normalized.indicators.map(({ indicatorId }) => indicatorId), indicatorIds);
assert.deepEqual(normalized.input.indicatorIds, indicatorIds);
assert.deepEqual(normalized.input.dimensionIds, dimensionIds);
const regions = frozen.geography.regions;
const regionIds = regions.map(({ id }) => id);
assert.equal(regionIds.length, 27); assert.equal(new Set(regionIds).size, 27);
assert.deepEqual(normalized.input.regions, regions);
const indicatorIndex = new Map(indicatorIds.map((id, index) => [id, index]));
const panelValues = new Map();
const inputPanels = frozen.indicators.map((item, i) => {
  const source = normalized.indicators[i];
  assert.equal(item.year, 2023); assert.equal(source.year, 2023);
  assert.equal(item.classification, "CORE"); assert.equal(item.frozenStatus, "FROZEN");
  assert.equal(source.dimensionId, item.dimensionId);
  assert.equal(source.pressureDirection, item.civxPressureDirection);
  assert.deepEqual(source.observations.map(({ regionId }) => regionId), regionIds, `INCOMPLETE_COHORT: ${item.indicatorId}`);
  assert.deepEqual(item.observations.map(({ regionId }) => regionId), regionIds);
  const observations = source.observations.map((row, r) => {
    assert.equal(row.rawValue, item.observations[r].value, `RAW_VALUE_CHANGED: ${item.indicatorId}/${row.regionId}`);
    const pressure = row.normalizedPressure.min_max;
    assert(typeof pressure === "number" && Number.isFinite(pressure), `NON_FINITE_PRESSURE: ${item.indicatorId}/${row.regionId}`);
    assert(pressure >= 0 && pressure <= 100, `PRESSURE_BOUNDS: ${item.indicatorId}/${row.regionId}`);
    return { regionId: row.regionId, rawValue: row.rawValue, normalizedPressure: pressure,
      normalizationValuePointer: `/indicators/${i}/observations/${r}/normalizedPressure/min_max`, frozenValuePointer: `/indicators/${i}/observations/${r}/value` };
  });
  panelValues.set(item.indicatorId, observations.map(({ normalizedPressure }) => normalizedPressure));
  return { indicatorId: item.indicatorId, dimensionId: item.dimensionId, displayName: item.displayName, year: 2023, unit: item.unit, pressureDirection: item.civxPressureDirection, observations };
});
for (const dimension of dimensions) {
  assert.deepEqual(inputPanels.filter(({ dimensionId }) => dimensionId === dimension.dimensionId).map(({ indicatorId }) => indicatorId), dimension.indicatorIds);
  assert.equal(dimension.indicatorCount, dimension.indicatorIds.length);
}
assert.deepEqual(dimensions.flatMap(({ indicatorIds: ids }) => ids), indicatorIds);
const regionVectors = regions.map((_, r) => indicatorIds.map((id) => panelValues.get(id)[r]));
function covariance(a, b) {
  const ma = mean(a); const mb = mean(b);
  let total = 0;
  for (let i = 0; i < a.length; i++) total += (a[i] - ma) * (b[i] - mb);
  return total / a.length;
}
const variance = (values) => covariance(values, values);
function pearson(a, b) {
  const value = covariance(a, b) / Math.sqrt(variance(a) * variance(b));
  assert(Number.isFinite(value) && Math.abs(value) <= 1 + weightTolerance, "COMPARISON_UNAVAILABLE: degenerate correlation");
  return Math.max(-1, Math.min(1, value)); // Correlation roundoff only; pressure scores are never clipped.
}
function ranksDescending(values) {
  const sorted = values.map((value, index) => ({ value, index })).sort((a, b) => b.value - a.value);
  const ranks = Array(values.length);
  for (let start = 0; start < sorted.length;) {
    let end = start + 1;
    while (end < sorted.length && sorted[end].value === sorted[start].value) end++;
    for (let i = start; i < end; i++) ranks[sorted[i].index] = (start + 1 + end) / 2;
    start = end;
  }
  return ranks;
}
const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
function fraction(numerator, denominator = 1) {
  assert(Number.isSafeInteger(numerator) && Number.isSafeInteger(denominator) && denominator > 0 && numerator > 0);
  const divisor = gcd(numerator, denominator);
  return { value: numerator / denominator, numerator: numerator / divisor, denominator: denominator / divisor, exact: `${numerator / divisor}/${denominator / divisor}` };
}
function productExact(a, b) {
  return a.exact && b.exact ? fraction(a.numerator * b.numerator, a.denominator * b.denominator).exact : null;
}
const normalizedVariances = Object.fromEntries(indicatorIds.map((id) => [id, variance(panelValues.get(id))]));
assert(Object.values(normalizedVariances).every((value) => Number.isFinite(value) && value > 0), "VARIANCE_ALTERNATIVE_UNAVAILABLE");
const equalDimensions = Object.fromEntries(dimensionIds.map((id) => [id, fraction(1, 6)]));
const equalWithin = Object.fromEntries(dimensions.flatMap((d) => d.indicatorIds.map((id) => [id, fraction(1, d.indicatorIds.length)])));
const varianceWithin = Object.fromEntries(dimensions.flatMap((d) => {
  const total = sum(d.indicatorIds.map((id) => normalizedVariances[id]));
  return d.indicatorIds.map((id) => [id, { value: normalizedVariances[id] / total, exact: null }]);
}));
const selectedId = "equal_dimension_equal_indicator";
// Fixed alternatives are specified without fitting weights to a desired regional ordering.
const specifications = [
  { id: "equal_indicator", name: "A: equal weight for all 18 indicators", kind: "count_imbalanced_benchmark", admissible: false,
    rationale: "Global 1/18 coefficients imply dimension budgets n_d/18 and violate dimension independence from indicator count.", dimension: Object.fromEntries(dimensions.map((d) => [d.dimensionId, fraction(d.indicatorIds.length, 18)])), within: equalWithin },
  { id: selectedId, name: "B: equal dimensions, equal indicators within each", kind: "preferred_normative_contract", admissible: true,
    rationale: "Equal importance for six dimensions; equal shares among the distinct audited indicators within each dimension.", dimension: equalDimensions, within: equalWithin },
  { id: "variance_within_equal_dimensions", name: "Normalized-variance shares within equal dimensions", kind: "data_driven_diagnostic", admissible: true,
    rationale: "Population normalized variance / sum of variances inside each dimension. Diagnostic only: dispersion is not importance, reliability or civic relevance.", dimension: equalDimensions, within: varianceWithin },
  { id: "equal_basic_subdimensions", name: "Equal Basic Services subdimension budgets", kind: "hierarchy_sensitivity", admissible: true,
    rationale: "Basic Services gives 1/3 each to WASH, healthcare, and crowding; two indicators split each paired branch. Other within weights unchanged.", dimension: equalDimensions,
    within: { ...equalWithin, sanitation: fraction(1, 6), drinking_water: fraction(1, 6), puskesmas_per_100k: fraction(1, 6), health_insurance_ownership: fraction(1, 6), "household-floor-per-capita-le7-2": fraction(1, 3) } },
  { id: "material_pair_budget", name: "Conservative poverty/expenditure joint-budget test", kind: "overlap_sensitivity", admissible: true,
    rationale: "Poverty/expenditure share 1/3 of Socioeconomic; unemployment and Gini each receive 1/3. This tests a budget choice, not a finding that the pair is duplicate.", dimension: equalDimensions,
    within: { ...equalWithin, poverty: fraction(1, 6), expenditure_per_capita: fraction(1, 6), unemployment: fraction(1, 3), gini_ratio: fraction(1, 3) } },
  { id: "education_pair_budget", name: "Conservative RLS/HLS joint-budget test", kind: "overlap_sensitivity", admissible: true,
    rationale: "RLS/HLS share 1/2 of Education, each 1/4; APM gets 1/2. Tests accepted educational overlap without deleting an indicator.", dimension: equalDimensions,
    within: { ...equalWithin, rls: fraction(1, 4), hls: fraction(1, 4), apm: fraction(1, 2) } },
];
for (const id of dimensionIds) for (const [direction, target, other] of [["down25", fraction(1, 8), fraction(7, 40)], ["up25", fraction(5, 24), fraction(19, 120)]]) {
  specifications.push({ id: `dimension_${direction}_${id}`, name: `${id}: dimension budget ${direction}`, kind: "dimension_budget_stress", admissible: true,
    rationale: "Change the target dimension budget by exactly ±25% relative to 1/6 (to 1/8 or 5/24); divide remaining budget equally across the other five. Not an uncertainty interval or recommended weight.",
    dimension: Object.fromEntries(dimensionIds.map((key) => [key, key === id ? target : other])), within: equalWithin });
}
assert.equal(specifications.length, 18);
assert.equal(new Set(specifications.map(({ id }) => id)).size, 18);
let budgetSumChecks = 0; let monotonicitySmokeChecks = 0;
function makePlan(spec) {
  assert.deepEqual(Object.keys(spec.dimension).sort(), [...dimensionIds].sort(), "DIMENSION_MEMBERSHIP_CHANGED");
  assert.deepEqual(Object.keys(spec.within).sort(), [...indicatorIds].sort(), "INDICATOR_MEMBERSHIP_CHANGED");
  for (const weight of [...Object.values(spec.dimension), ...Object.values(spec.within)]) assert(Number.isFinite(weight.value) && weight.value > 0 && weight.value <= 1, "INVALID_WEIGHT: all frozen inputs require positive finite shares");
  assert(Math.abs(sum(Object.values(spec.dimension).map(({ value }) => value)) - 1) < weightTolerance, "DIMENSION_WEIGHT_SUM"); budgetSumChecks++;
  const indicatorWeights = dimensions.flatMap((d) => {
    const withinSum = sum(d.indicatorIds.map((id) => spec.within[id].value));
    assert(Math.abs(withinSum - 1) < weightTolerance, `WITHIN_WEIGHT_SUM: ${d.dimensionId}`); budgetSumChecks++;
    return d.indicatorIds.map((id) => ({ indicatorId: id, dimensionId: d.dimensionId, withinDimensionWeight: spec.within[id].value, dimensionWeight: spec.dimension[d.dimensionId].value,
      effectiveWeight: spec.within[id].value * spec.dimension[d.dimensionId].value, exactWithinFraction: spec.within[id].exact, exactDimensionFraction: spec.dimension[d.dimensionId].exact,
      exactEffectiveFraction: productExact(spec.within[id], spec.dimension[d.dimensionId]), normalizedPopulationVariance: normalizedVariances[id] }));
  });
  assert.equal(indicatorWeights.length, 18); assert.deepEqual(indicatorWeights.map(({ indicatorId }) => indicatorId), indicatorIds);
  assert(Math.abs(sum(indicatorWeights.map(({ effectiveWeight }) => effectiveWeight)) - 1) < weightTolerance, "EFFECTIVE_WEIGHT_SUM"); budgetSumChecks++;
  const dimensionWeights = dimensions.map((d) => {
    const effectiveTotal = sum(indicatorWeights.filter(({ dimensionId }) => dimensionId === d.dimensionId).map(({ effectiveWeight }) => effectiveWeight));
    assert(Math.abs(effectiveTotal - spec.dimension[d.dimensionId].value) < weightTolerance, "DIMENSION_EFFECTIVE_BUDGET");
    return { dimensionId: d.dimensionId, displayName: d.displayName, indicatorIds: d.indicatorIds, weight: spec.dimension[d.dimensionId].value, exactFraction: spec.dimension[d.dimensionId].exact, effectiveIndicatorWeightTotal: effectiveTotal };
  });
  return { dimensionWeights, indicatorWeights };
}
function aggregate(values, plan) {
  assert.equal(values.length, 18, "INCOMPLETE_PRESSURE_VECTOR");
  assert(values.every((value) => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100), "INVALID_PRESSURE_VECTOR");
  const dimensionScores = Object.fromEntries(plan.dimensionWeights.map((d) => [d.dimensionId, sum(d.indicatorIds.map((id) => values[indicatorIndex.get(id)] * plan.indicatorWeights[indicatorIndex.get(id)].withinDimensionWeight))]));
  const dimensionContributions = Object.fromEntries(plan.dimensionWeights.map((d) => [d.dimensionId, dimensionScores[d.dimensionId] * d.weight]));
  const overall = sum(Object.values(dimensionContributions));
  const direct = sum(plan.indicatorWeights.map(({ effectiveWeight }, i) => values[i] * effectiveWeight));
  assert(Number.isFinite(overall) && Math.abs(overall - direct) < scoreTolerance, "HIERARCHICAL_DIRECT_DISAGREEMENT");
  assert(overall >= -scoreTolerance && overall <= 100 + scoreTolerance);
  return { dimensionScores, dimensionContributions, provisionalOverallPressureScore: overall };
}
const schemes = specifications.map((spec) => {
  const plan = makePlan(spec);
  const provisional = regionVectors.map((values) => aggregate(values, plan));
  const scores = provisional.map(({ provisionalOverallPressureScore: score }) => score);
  const ranks = ranksDescending(scores);
  assert(scores.every((value) => value >= 0 && value <= 100));
  for (let r = 0; r < 27; r++) {
    assert(Object.values(provisional[r].dimensionScores).every((value) => Number.isFinite(value) && value >= 0 && value <= 100));
    for (let i = 0; i < 18; i++) {
      const shifted = [...regionVectors[r]]; const delta = shifted[i] <= 99 ? 1 : -1; shifted[i] += delta;
      const probe = aggregate(shifted, plan).provisionalOverallPressureScore;
      assert(Math.abs(probe - scores[r] - delta * plan.indicatorWeights[i].effectiveWeight) < scoreTolerance, "PRESSURE_MONOTONICITY");
      assert(Math.sign(probe - scores[r]) === Math.sign(delta), "PRESSURE_DIRECTION_REVERSED"); monotonicitySmokeChecks++;
    }
  }
  const scoreVariance = variance(scores); assert(scoreVariance > 0, "COMPARISON_UNAVAILABLE: constant provisional scores");
  const dimensionDiagnostics = plan.dimensionWeights.map((d) => {
    const values = provisional.map((row) => row.dimensionScores[d.dimensionId]);
    const covShare = d.weight * covariance(values, scores) / scoreVariance;
    return { dimensionId: d.dimensionId, nominalWeight: d.weight, minimumScore: Math.min(...values), maximumScore: Math.max(...values), populationSd: Math.sqrt(variance(values)), correlationWithOverall: pearson(values, scores),
      covarianceVarianceShare: covShare, maximumTheoreticalPointSwing: 100 * d.weight };
  });
  const indicatorDiagnostics = plan.indicatorWeights.map((w) => {
    const values = panelValues.get(w.indicatorId); const dimension = provisional.map((row) => row.dimensionScores[w.dimensionId]);
    return { indicatorId: w.indicatorId, effectiveWeight: w.effectiveWeight, maximumTheoreticalPointSwing: 100 * w.effectiveWeight, covarianceVarianceShare: w.effectiveWeight * covariance(values, scores) / scoreVariance,
      covarianceShareWithinDimension: w.withinDimensionWeight * covariance(values, dimension) / variance(dimension),
      normalizationAnchorDiagnostic: { sourcePointer: `/indicators/${indicatorIndex.get(w.indicatorId)}/statistics/outlierDiagnostics/leaveOneOut/maxRetainedShiftPoints`,
        maxRetainedIndicatorShift: normalized.indicators[indicatorIndex.get(w.indicatorId)].statistics.outlierDiagnostics.leaveOneOut.maxRetainedShiftPoints,
        singleIndicatorOverallShiftBound: w.effectiveWeight * normalized.indicators[indicatorIndex.get(w.indicatorId)].statistics.outlierDiagnostics.leaveOneOut.maxRetainedShiftPoints,
        interpretation: "Coefficient times an existing normalization diagnostic, holding other indicators fixed; not a changed normalized dataset, joint shock, confidence interval or final-rank guarantee" } };
  });
  assert(Math.abs(sum(dimensionDiagnostics.map(({ covarianceVarianceShare }) => covarianceVarianceShare)) - 1) < scoreTolerance);
  assert(Math.abs(sum(indicatorDiagnostics.map(({ covarianceVarianceShare }) => covarianceVarianceShare)) - 1) < scoreTolerance);
  for (const d of dimensions) assert(Math.abs(sum(indicatorDiagnostics.filter(({ indicatorId: id }) => d.indicatorIds.includes(id)).map(({ covarianceShareWithinDimension }) => covarianceShareWithinDimension)) - 1) < scoreTolerance);
  return { schemeId: spec.id, name: spec.name, kind: spec.kind, selected: spec.id === selectedId, passesIndicatorCountIndependence: spec.admissible, rationale: spec.rationale, allScoresProvisional: true,
    ...plan, regionResults: regions.map((region, r) => ({ regionId: region.id, regionName: region.name, ...provisional[r], provisionalRank: ranks[r] })),
    diagnostics: { scoreMinimum: Math.min(...scores), scoreMaximum: Math.max(...scores), scoreMean: mean(scores), scorePopulationSd: Math.sqrt(scoreVariance), dimensionDiagnostics, indicatorDiagnostics,
      covarianceInterpretation: "w*Cov(component,S)/Var(S) sums to one, may be negative or exceed one, and is a cohort-dependent variance decomposition, not normative weights, causal importance, reliability or a sign reversal" } };
});
assert.equal(budgetSumChecks, 144); assert.equal(monotonicitySmokeChecks, 8748);
const selected = schemes.find(({ schemeId }) => schemeId === selectedId);
const comparisons = [];
for (let a = 0; a < schemes.length; a++) for (let b = a + 1; b < schemes.length; b++) {
  const sa = schemes[a]; const sb = schemes[b];
  const scoresA = sa.regionResults.map(({ provisionalOverallPressureScore: s }) => s); const scoresB = sb.regionResults.map(({ provisionalOverallPressureScore: s }) => s);
  const ranksA = sa.regionResults.map(({ provisionalRank }) => provisionalRank); const ranksB = sb.regionResults.map(({ provisionalRank }) => provisionalRank);
  const rankChanges = ranksB.map((value, r) => value - ranksA[r]);
  const maxDisplacement = Math.max(...rankChanges.map(Math.abs));
  let reversedPairs = 0;
  for (let i = 0; i < 27; i++) for (let j = i + 1; j < 27; j++) if ((scoresA[i] - scoresA[j]) * (scoresB[i] - scoresB[j]) < 0) reversedPairs++;
  const affected = regions.flatMap((region, r) => {
    if (Math.abs(rankChanges[r]) !== maxDisplacement) return [];
    const contributionDeltas = Object.fromEntries(dimensionIds.map((id) => [id, sb.regionResults[r].dimensionContributions[id] - sa.regionResults[r].dimensionContributions[id]]));
    const scoreDelta = scoresB[r] - scoresA[r]; assert(Math.abs(sum(Object.values(contributionDeltas)) - scoreDelta) < scoreTolerance);
    return [{ regionId: region.id, regionName: region.name, provisionalRankA: ranksA[r], provisionalRankB: ranksB[r], rankChangeBMinusA: rankChanges[r], scoreDeltaBMinusA: scoreDelta, dimensionContributionDeltasBMinusA: contributionDeltas }];
  });
  comparisons.push({ comparisonId: `${sa.schemeId}|${sb.schemeId}`, schemeA: sa.schemeId, schemeB: sb.schemeId, regionCount: 27, pearsonOverallScores: pearson(scoresA, scoresB), spearmanProvisionalRanks: pearson(ranksA, ranksB),
    maxAbsoluteRankDisplacement: maxDisplacement, meanAbsoluteRankDisplacement: mean(rankChanges.map(Math.abs)), maximumAbsoluteScoreDifference: Math.max(...scoresB.map((value, r) => Math.abs(value - scoresA[r]))), pairwiseOrderingReversals: reversedPairs, mostAffectedRegions: affected });
}
assert.equal(comparisons.length, 153);
const selectedComparisons = comparisons.filter(({ schemeA, schemeB }) => schemeA === selectedId || schemeB === selectedId);
assert.equal(selectedComparisons.length, 17);
const allPairRankChecks = comparisons.length * 27 * 26 / 2;
const withinDimensionCorrelations = dimensions.flatMap((d) => d.indicatorIds.flatMap((a, i) => d.indicatorIds.slice(i + 1).map((b) => ({ dimensionId: d.dimensionId, indicatorA: a, indicatorB: b, pearsonNormalizedPressure: pearson(panelValues.get(a), panelValues.get(b)) }))));
assert.equal(withinDimensionCorrelations.length, 25);
const subdimensionBudgets = [...frozen.safeguards.retainedServicesHierarchy.map((group) => ({ dimensionId: "basic_services", ...group })), ...frozen.safeguards.publicHealthHierarchy.map((group) => ({ dimensionId: "public_health", ...group }))].map((group) => ({
  dimensionId: group.dimensionId, subdimension: group.subdimension, indicatorIds: group.core,
  withinDimensionBudget: sum(selected.indicatorWeights.filter(({ indicatorId }) => group.core.includes(indicatorId)).map(({ withinDimensionWeight }) => withinDimensionWeight)),
  effectiveOverallBudget: sum(selected.indicatorWeights.filter(({ indicatorId }) => group.core.includes(indicatorId)).map(({ effectiveWeight }) => effectiveWeight)),
}));
const primary = comparisons.find(({ schemeA, schemeB }) => schemeA === "equal_indicator" && schemeB === selectedId);
const sourceManifest = [freezePath, normalizationPath, "docs/FINAL-INDICATOR-FREEZE-2023.md", "docs/NORMALIZATION-DESIGN-2023.md"].map((path) => { const content = bytes(path); return { path, sha256: hash(content), bytes: content.length }; });
if (existsSync(new URL(outputPath, root))) assert.deepEqual(load(outputPath).input.sourceManifest, sourceManifest, "PINNED_SOURCE_MANIFEST_CHANGED: reviewed design revision required");
assert.equal(hash(JSON.stringify(frozen)), originalFreezeHash, "Frozen input mutated in memory");
assert.equal(hash(JSON.stringify(normalized)), originalNormalizationHash, "Normalized input mutated in memory");
for (const [path, sha256] of Object.entries(inputPins)) assert.equal(hash(bytes(path)), sha256, `Input changed during analysis: ${path}`);
const output = {
  designId: "civx-jabar-2023-weighting-design", version: 1, status: "READY_FOR_SCORING_ENGINE_IMPLEMENTATION", referenceYear: 2023, selectedSchemeId: selectedId,
  judgeExplanation: "CIVX gives equal importance to its six dimensions, then distributes each dimension's weight equally among its audited indicators.",
  input: { freezePath, normalizationPath, normalizationMethod: "min_max", sourceManifest, verifiedUnderlyingFreezeEvidenceFiles: frozen.evidenceManifest.length, regionIds, dimensionIds, indicatorIds, panels: inputPanels },
  aggregationContract: {
    indicatorToDimension: "D_rd = sum_j(alpha_jd * normalizedPressure_rj); within each dimension sum(alpha_jd)=1",
    dimensionToOverall: "S_r = sum_d(W_d * D_rd); sum(W_d)=1; effectiveIndicatorWeight_j = W_d * alpha_jd",
    selectedRule: "W_d=1/6 for every dimension; alpha_jd=1/n_d for every frozen indicator in that dimension",
    singletonRule: "For overall IRBI and district IKLH, alpha=1 and dimension score equals the unchanged normalized indicator; no publisher-composite decomposition",
    pressureScale: [0, 100], higherIsHigherRelativePressure: true, compensability: "Arithmetic aggregation allows lower pressure on one input to offset higher pressure elsewhere; no bottleneck, veto or causal interpretation",
    missingOrInvalidInput: "Fail the whole run on missing/non-numeric/non-finite/out-of-range pressure, changed membership/year/method or source drift. No omission, zero-fill, per-region weight redistribution, clipping or source replacement",
    invalidWeightPolicy: "Require positive finite weights for all 18 frozen inputs, exact membership and budget sums within tolerance. Reject bad/zero/negative weights; never silently renormalize an invalid plan",
    precisionPolicy: "Full stored pressure and full-precision rational/cohort-variance shares; round only display. Sum weights within 1e-12; compare floating score identities within 1e-10. No score clipping or pre-ranking rounding",
    provisionalRankPolicy: "Rank 1 = highest provisional pressure; average descending ranks for exactly equal unrounded scores. Region results stay in frozen registry order, not sorted as a public league table",
    interpretation: "Relative 27-region 2023 pressure under declared normative budgets; not absolute quality of life, government performance, causal effect or a policy target",
    productionIntegrationAuthorized: false, publicRankingAuthorized: false,
  },
  decision: { selected: selectedId, rationale: ["Dimension importance is independent of indicator count, unlike the global 1/18 benchmark.", "No elicited expert/policy or external calibration evidence justifies unequal normative dimension budgets.", "Within-dimension variance is dispersion, not social importance or reliability; data-driven reweighting is diagnostic only.", "Hierarchy and accepted-overlap budget alternatives show limited displacement without establishing that any audited input is duplicate.", "Weighting is not uniquely identified by these data; material sensitivity and covariance concentration remain disclosed rather than optimized away."],
    readyForScoringEngineImplementation: true, releaseApprovalGranted: false, indicatorMembershipChanged: false, normalizationChanged: false, productionScorerReplaced: false, frontendChanged: false,
  },
  schemes, comparisons,
  sensitivitySummary: { primaryComparisonId: primary.comparisonId, selectedComparisonIds: selectedComparisons.map(({ comparisonId }) => comparisonId),
    maximumSelectedComparisonDisplacement: Math.max(...selectedComparisons.map(({ maxAbsoluteRankDisplacement }) => maxAbsoluteRankDisplacement)),
    minimumSelectedComparisonSpearman: Math.min(...selectedComparisons.map(({ spearmanProvisionalRanks }) => spearmanProvisionalRanks)),
    maximumAllPairDisplacement: Math.max(...comparisons.map(({ maxAbsoluteRankDisplacement }) => maxAbsoluteRankDisplacement)),
    minimumAllPairSpearman: Math.min(...comparisons.map(({ spearmanProvisionalRanks }) => spearmanProvisionalRanks)),
    regionalScenarioRanges: regions.map((region, r) => ({ regionId: region.id, regionName: region.name,
      minimumProvisionalRank: Math.min(...schemes.map((s) => s.regionResults[r].provisionalRank)), maximumProvisionalRank: Math.max(...schemes.map((s) => s.regionResults[r].provisionalRank)),
      maximumDisplacementFromSelected: Math.max(...schemes.map((s) => Math.abs(s.regionResults[r].provisionalRank - selected.regionResults[r].provisionalRank))),
      interpretation: "Ranges across specified methodological scenarios, not a confidence interval, probability distribution or final ranking" })),
  },
  conceptualDiagnostics: { withinDimensionCorrelations, selectedSubdimensionBudgets: subdimensionBudgets,
    povertyExpenditureSelectedWithinBudget: 1 / 2, rlsHlsSelectedWithinBudget: 2 / 3,
    overlapPolicy: "Retain the freeze's distinct estimands and accepted overlap. No automatic correlation bonus, duplicate parent, inverse-correlation weight rule or source-composite component is added.",
    varianceConcentrationPolicy: "Equal normative dimension budgets do not imply equal observed variance contribution. Negative covariance shares are cancellation, not negative weights or beneficial pressure. Do not fit budgets to equalize this cohort's variance or desired ranks.",
  },
  verification: { dimensions: 6, indicators: 18, regions: 27, sourceRawValuesVerified: 486, unchangedSelectedNormalizedValues: 486, weightingSchemes: 18, provisionalOverallScores: 486, provisionalDimensionScores: 2916,
    budgetSumChecks, dimensionEffectiveBudgetChecks: 108, positiveEffectiveWeights: 324, monotonicitySmokeChecks, pairwiseSchemeComparisons: comparisons.length, rankPairChecks: allPairRankChecks,
    allProvisionalScoresFiniteAndWithin0And100: true, normalizedSourceValuesChanged: false, rawSourceValuesChanged: false,
    scoresAreSensitivityOnly: true, finalPublicCivicIndexPublished: false, publicRankingsGenerated: false, productionScorerReplaced: false, frontendModified: false,
  },
  limitations: ["Weights express a transparent normative equal-importance assumption, not uniquely estimated truth or stakeholder consensus.", "The 27-region cohort is small; high score correlation does not guarantee stable individual positions or statistically significant ranks.", "Education and IRBI account for more of observed score variance than their nominal shares; Environment offsets some common regional pattern. These are ecological covariance facts, not grounds to reverse direction or discard a domain.", "The normalization's endpoint sensitivity and survey/model uncertainty remain; coefficient-scaled diagnostics are not propagated confidence intervals.", "All provisional scores/ranks exist only to validate weighting choices. Production cutover, independent validation, rights and release approval remain separate."],
  generator: { path: "scripts/analyze-weighting-2023.mjs", sha256: hash(readFileSync(new URL(import.meta.url))) },
};
const cell = (value) => `"${String(value).replaceAll('"', '""')}"`;
const csv = [
  ["status", "scheme_id", "selected_scheme", "region_id", "region_name", "year", "provisional_pressure_score", "provisional_rank_1_is_higher_pressure", ...dimensionIds.map((id) => `dimension_score_${id}`), ...dimensionIds.map((id) => `weighted_contribution_${id}`)],
  ...schemes.flatMap((scheme) => scheme.regionResults.map((row) => ["SENSITIVITY_ONLY_NOT_FINAL_RANKING", scheme.schemeId, scheme.selected, row.regionId, row.regionName, 2023, row.provisionalOverallPressureScore, row.provisionalRank, ...dimensionIds.map((id) => row.dimensionScores[id]), ...dimensionIds.map((id) => row.dimensionContributions[id])])),
].map((row) => row.map(cell).join(",")).join("\n") + "\n";
for (const [path, content] of [[outputPath, JSON.stringify(output, null, 2) + "\n"], [csvPath, csv]]) {
  if (process.argv.includes("--check")) assert.equal(bytes(path).toString("utf8"), content, `Weighting output differs: ${path}`);
  else writeFileSync(new URL(path, root), content);
}
console.log(JSON.stringify({ mode: process.argv.includes("--check") ? "check" : "analysis", status: output.status, selectedSchemeId: selectedId, ...output.verification,
  primaryComparison: { pearson: primary.pearsonOverallScores, spearman: primary.spearmanProvisionalRanks, maxRankDisplacement: primary.maxAbsoluteRankDisplacement },
  allPairMaximumDisplacement: output.sensitivitySummary.maximumAllPairDisplacement, productionIntegration: false }, null, 2));
