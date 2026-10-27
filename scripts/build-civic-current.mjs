import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { assertPolicy, assertV2Release, observationProblem, pressureLayers, scorePressure } from "../src/lib/civx/v2/model.ts";

const root = new URL("../", import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), "utf8"));
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const check = (condition, message) => { if (!condition) throw new Error(message); };
const round = value => Math.round(value * 100) / 100;
const args = new Set(process.argv.slice(2));
check([...args].every(arg => ["--sensitivity", "--with-archive", "--from-validated-inputs"].includes(arg)), "Use --sensitivity for analysis, --with-archive for strict archive rebuilding, or explicit --from-validated-inputs for audited-transcription replay.");
const mode = args.has("--sensitivity") ? "--sensitivity" : args.has("--with-archive") ? "--with-archive" : undefined;
const replay = args.has("--from-validated-inputs");
check(!(replay && mode === "--with-archive"), "Validated-transcription replay cannot replace strict archive rebuilding.");
if (mode === "--with-archive" && existsSync(new URL("data/processed/civx-jabar-2023-v2.json", root))) {
  const archive = spawnSync(process.execPath, ["scripts/build-civic-v2.mjs"], { cwd: root, stdio: "inherit", env: process.env });
  check(archive.status === 0, "Archived dimensional release failed reproducibility checks.");
}
const policyPath = "data/methodology/civx-jabar-2023-current.json";
const inputPaths = ["data/raw/current/source-audit.json", "data/raw/current/services-observations.json", "data/raw/current/risk-observations.json", "data/raw/v2/context-advantages-observations.json", "data/raw/civx-jabar-2023.json", policyPath, "data/releases/civx-current-inputs-integrity.json"];
const policy = read(policyPath);
assertPolicy(policy);
const baseline = read("data/releases/civx-v1-integrity.json");
for (const [path, hash] of Object.entries(baseline.files)) check(digest(readFileSync(new URL(path, root))) === hash, `Protected archive changed: ${path}`);
const original = read("data/raw/civx-jabar-2023.json");
const service = read("data/raw/current/services-observations.json");
const risk = read("data/raw/current/risk-observations.json");
const dimensionalArchive = read("data/releases/civx-archives-integrity.json");
for (const [path, hash] of Object.entries(dimensionalArchive.files)) check(digest(readFileSync(new URL(path, root))) === hash, `Protected dimensional archive changed: ${path}`);
const frozenInputs = read("data/releases/civx-current-inputs-integrity.json");
for (const [path, hash] of Object.entries(frozenInputs.files)) check(digest(readFileSync(new URL(path, root))) === hash, `Audited current transcription changed: ${path}`);
const advantages = read("data/raw/v2/context-advantages-observations.json");
const candidates = read(inputPaths[0]).candidates;
const candidateById = new Map(candidates.map(candidate => [candidate.id, candidate]));
check(candidateById.size === candidates.length, "Duplicate candidate IDs.");
const sources = [...service.sources, ...risk.sources, ...advantages.sources].map(source => ({ ...source, revision: source.artifactId === original.artifact.id ? "BPS publication revised 2024-02-29; fixed fingerprint" : "Source revision date not stated; fingerprint fixes inspected edition" }));
const sourceById = new Map(sources.map(source => [source.id, source]));
const artifacts = [...service.artifacts, ...risk.artifacts, ...advantages.artifacts];
check(sourceById.size === sources.length && new Set(artifacts.map(artifact => artifact.id)).size === artifacts.length, "Duplicate source or artifact IDs.");
const expectedRegions = ["3201", "3202", "3203", "3204", "3205", "3206", "3207", "3208", "3209", "3210", "3211", "3212", "3213", "3214", "3215", "3216", "3217", "3218", "3271", "3272", "3273", "3274", "3275", "3276", "3277", "3278", "3279"];
check(original.regions.length === 27 && JSON.stringify([...policy.referenceRegionIds].sort()) === JSON.stringify(expectedRegions) && original.regions.every(region => expectedRegions.includes(region.id)), "Current requires the exact complete 27-region cohort.");

// Replay is explicit and separately receipted. It never claims unavailable remote originals were rechecked.
const sourceVerification = { mode: replay ? "validated_transcriptions" : "original_artifacts", artifacts: [] };
for (const artifact of artifacts) {
  let bytes;
  const override = artifact.id === risk.artifacts[0].id ? process.env.CIVX_IRBI_PDF : artifact.id === service.artifacts.find(item => !item.localPath)?.id ? process.env.CIVX_V2_HEALTH_PDF : undefined;
  if (replay && !artifact.localPath && !override) {
    sourceVerification.artifacts.push({ artifactId: artifact.id, state: "fingerprinted_transcription_only" });
    console.log(`Explicit replay: prior audited transcription retained; remote original not reverified: ${artifact.url}`);
    continue;
  }
  if (artifact.localPath) bytes = readFileSync(new URL(artifact.localPath, root));
  else if (override) bytes = readFileSync(override);
  else {
    const response = await fetch(artifact.url);
    check(response.ok, `Source acquisition failed: HTTP ${response.status}: ${artifact.url}`);
    bytes = Buffer.from(await response.arrayBuffer());
  }
  check(bytes.length === artifact.bytes && `sha256:${digest(bytes)}` === artifact.id, `Original source bytes/checksum mismatch: ${artifact.url}`);
  sourceVerification.artifacts.push({ artifactId: artifact.id, state: "bytes_verified" });
}

const raw = [...service.observations, ...risk.observations, ...advantages.observations];
check(!raw.some(row => row.indicatorId === "puskesmas_per_100k"), "Current raw input must not copy precomputed Puskesmas rates.");
for (const regionId of policy.referenceRegionIds) {
  const numerator = raw.find(row => row.regionId === regionId && row.indicatorId === "puskesmas_count");
  const population = raw.find(row => row.regionId === regionId && row.indicatorId === "population");
  const breakdown = service.facilityBreakdown.find(row => row.regionId === regionId);
  check(numerator && population && Number.isInteger(numerator.value) && numerator.value >= 0 && Number.isInteger(population.value) && population.value > 0 && numerator.period === policy.period && population.period === policy.period && numerator.unit === "facilities" && population.unit === "persons", `Invalid facility numerator/population: ${regionId}`);
  check(breakdown && breakdown.total === numerator.value && breakdown.period === policy.period && breakdown.sourceId === numerator.sourceId && breakdown.symbolRule, `Missing facility inventory audit: ${regionId}`);
  for (const category of [breakdown.inpatient, breakdown.nonInpatient]) {
    check(category.locator && (category.published === "-" ? category.value === null : Number.isInteger(category.value) && category.value >= 0 && Number(category.published) === category.value), `Facility symbol interpretation changed: ${regionId}`);
  }
  if (breakdown.inpatient.value !== null && breakdown.nonInpatient.value !== null) check(breakdown.inpatient.value + breakdown.nonInpatient.value === numerator.value, `Facility category/total mismatch: ${regionId}`);
  raw.push({
    regionId, indicatorId: "puskesmas_per_100k", value: numerator.value / population.value * 100000,
    period: policy.period, unit: "facilities per 100,000 population", sourceId: numerator.sourceId,
    locator: `${numerator.locator}; derived with ${population.locator}`,
    denominator: { definition: "Exact-person annual population from health-profile appendix table 1; corroborates the rounded SP2020-based BPS projection. Not the conflicting narrative population or a patient catchment.", value: population.value, unit: population.unit, period: population.period, sourceId: population.sourceId, locator: population.locator },
    derivation: { formula: "puskesmas_count / population * 100000", numeratorIndicatorId: numerator.indicatorId, numeratorValue: numerator.value, denominatorIndicatorId: population.indicatorId, denominatorValue: population.value, scale: 100000 },
  });
}
const rawKeys = new Set();
for (const row of raw) {
  const key = `${row.regionId}/${row.indicatorId}`;
  check(!rawKeys.has(key), `Duplicate raw observation: ${key}`);
  rawKeys.add(key);
  check(policy.referenceRegionIds.includes(row.regionId) && candidateById.has(row.indicatorId), `Unknown raw observation: ${key}`);
  check(sourceById.has(row.sourceId) && /^\d{4}$/.test(row.period) && row.unit, `Untraceable raw observation: ${key}`);
}
const coreIds = policy.dimensions.flatMap(dimension => dimension.indicators.map(indicator => indicator.id));
check(coreIds.length === 8 && candidates.filter(candidate => candidate.classification === "core").length === 8 && coreIds.every(id => candidateById.get(id)?.classification === "core"), "Current requires eight audited core inputs.");
for (const dimension of policy.dimensions) for (const indicator of dimension.indicators) {
  const rows = raw.filter(row => row.indicatorId === indicator.id);
  check(rows.length === 27 && new Set(rows.map(row => row.regionId)).size === 27 && rows.every(row => row.period === policy.period && row.unit === indicator.unit && row.sourceId === indicator.sourceId && Number.isFinite(row.value)), `Incomplete or incomparable core: ${indicator.id}`);
  check(Math.min(...rows.map(row => row.value)) === indicator.minimum && Math.max(...rows.map(row => row.value)) === indicator.maximum, `Fixed extrema changed: ${indicator.id}`);
  for (const [extreme, name] of [[indicator.minimum, indicator.minimumRegion], [indicator.maximum, indicator.maximumRegion]]) check(rows.some(row => row.value === extreme && original.regions.find(region => region.id === row.regionId)?.name === name), `Extremum geography changed: ${indicator.id}`);
}
for (const region of original.regions) for (const observation of region.observations) {
  const row = raw.find(item => item.regionId === region.id && item.indicatorId === observation.indicatorId);
  check(row?.value === observation.value && row.unit === observation.unit && row.period === observation.period && row.sourceId === observation.sourceId, `Original observation changed: ${region.id}/${observation.indicatorId}`);
}
function provenance(sourceId, locator) {
  const source = sourceById.get(sourceId);
  check(source, `Unknown provenance source ${sourceId}`);
  return { sourceId, artifactId: source.artifactId, locator };
}
const regions = original.regions.map(region => ({
  id: region.id, name: region.name, type: region.type, province: region.province, boundaryReference: region.boundaryReference,
  observations: candidates.filter(candidate => candidate.classification !== "rejected").map(candidate => {
    const row = raw.find(item => item.regionId === region.id && item.indicatorId === candidate.id);
    const kind = candidate.classification === "core" ? "core_score_indicator" : candidate.classification === "advantage" ? "advantage_signal" : "context_indicator";
    const refs = row ? [provenance(row.sourceId, row.locator), ...(row.supportingProvenance ?? []).map(ref => provenance(ref.sourceId, ref.locator))] : [];
    if (row?.denominator?.sourceId && !refs.some(ref => ref.sourceId === row.denominator.sourceId)) refs.push(provenance(row.denominator.sourceId, row.denominator.locator));
    const observation = {
      id: `${policy.releaseId}/${region.id}/${candidate.id}`, releaseId: policy.releaseId, indicatorId: candidate.id, regionId: region.id,
      geography: { level: "kabupaten_kota", code: region.id, boundaryReference: region.boundaryReference }, kind,
      period: row?.period ?? null, unit: row?.unit ?? candidate.unit, value: row?.value ?? null,
      coverageStatus: row ? row.period !== policy.period ? "historical" : kind === "advantage_signal" ? "partial_coverage" : "available" : "unavailable",
      comparabilityStatus: candidate.status === "incompatible_geography" ? "incompatible_geography" : candidate.status === "not_comparable" || !row ? "not_comparable" : "comparable",
      verificationState: row ? "verified" : "unverified", confidence: "not_assessed",
      missingReason: row ? null : `No validated regional observation in this release. ${candidate.reason}`,
      provenance: refs, denominator: row?.denominator ?? null, derivation: row?.derivation ?? null,
      ...(kind === "advantage_signal" ? { presence: row?.presence ?? "no_comparable_data", whyAssigned: row?.whyAssigned ?? null } : {}),
    };
    const problem = observationProblem(observation, policy, sources, artifacts, region.id);
    check(!problem, `${observation.id}: ${problem}`);
    return observation;
  }),
}));

function pearson(a, b) {
  const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
  const ma = mean(a), mb = mean(b);
  const covariance = a.reduce((sum, value, i) => sum + (value - ma) * (b[i] - mb), 0);
  const spread = Math.sqrt(a.reduce((sum, value) => sum + (value - ma) ** 2, 0) * b.reduce((sum, value) => sum + (value - mb) ** 2, 0));
  check(spread > 0, "Constant sensitivity series.");
  return covariance / spread;
}
function ranks(values) {
  const sorted = [...values].sort((a, b) => b - a);
  return values.map(value => (sorted.indexOf(value) + sorted.lastIndexOf(value)) / 2 + 1);
}
const category = value => value < 33.33 ? "lower" : value < 66.67 ? "moderate" : "higher";
function calculate(candidatePolicy) {
  return regions.map(region => {
    const allowed = new Set(candidatePolicy.dimensions.flatMap(dimension => dimension.indicators.map(indicator => indicator.id)));
    const result = scorePressure(region.observations.filter(observation => observation.kind !== "core_score_indicator" || allowed.has(observation.indicatorId)), { ...candidatePolicy, status: "project_validated" }, sources, artifacts, region.id);
    check(result.status === "available", `Ineligible sensitivity input ${region.id}: ${result.reason}`);
    // Sensitivity ranks and changes use the same full-precision additive formula, not rounded component scores.
    return candidatePolicy.dimensions.reduce((total, dimension) => total + dimension.weight * dimension.indicators.reduce((sum, indicator) => {
      const value = region.observations.find(observation => observation.indicatorId === indicator.id).value;
      const position = (value - indicator.minimum) / (indicator.maximum - indicator.minimum);
      return sum + 100 * (indicator.direction === "higher" ? position : 1 - position) * indicator.withinDimensionWeight;
    }, 0), 0);
  });
}
const baselineScores = calculate(policy), baselineRanks = ranks(baselineScores);
const definitions = [
  { id: "socioeconomic_40", label: "Socioeconomic 40%, other domains 20%", weights: [.4, .2, .2, .2] },
  { id: "services_40", label: "Basic services 40%, other domains 20%", weights: [.2, .4, .2, .2] },
  { id: "health_40", label: "Public health 40%, other domains 20%", weights: [.2, .2, .4, .2] },
  { id: "resilience_40", label: "Resilience 40%, other domains 20%", weights: [.2, .2, .2, .4] },
  { id: "equal_socioeconomic", label: "Equal socioeconomic inputs", equalSocio: true },
  { id: "facility_half_services", label: "Facilities half of basic services; sanitation and water one quarter each", services: [.25, .25, .5] },
  { id: "household_services_80", label: "Household water and sanitation 80% of basic services", services: [.4, .4, .2] },
  { id: "eight_equal_indicators", label: "Eight equal indicators (diagnostic, not selected)", weights: [.375, .375, .125, .125], equalSocio: true },
  { id: "without_hdi", label: "Deprivation represented by poverty only", omit: "hdi" },
  { id: "without_poverty", label: "Deprivation represented by HDI only", omit: "poverty" },
];
const scenarios = definitions.map(scenario => {
  const alternative = structuredClone(policy);
  if (scenario.weights) alternative.dimensions.forEach((dimension, i) => { dimension.weight = scenario.weights[i]; });
  const socio = alternative.dimensions.find(dimension => dimension.id === "socioeconomic");
  if (scenario.equalSocio) socio.indicators.forEach(indicator => { indicator.withinDimensionWeight = 1 / 3; });
  if (scenario.services) alternative.dimensions.find(dimension => dimension.id === "basic_services").indicators.forEach((indicator, i) => { indicator.withinDimensionWeight = scenario.services[i]; });
  if (scenario.omit) {
    socio.indicators = socio.indicators.filter(indicator => indicator.id !== scenario.omit);
    socio.indicators.forEach(indicator => { indicator.withinDimensionWeight = .5; });
  }
  const scores = calculate(alternative), order = ranks(scores);
  const changes = scores.map((value, i) => Math.abs(value - baselineScores[i]));
  let reversals = 0;
  for (let i = 0; i < scores.length; i++) for (let j = i + 1; j < scores.length; j++) if ((scores[i] - scores[j]) * (baselineScores[i] - baselineScores[j]) < 0) reversals++;
  return {
    id: scenario.id, label: scenario.label,
    dimensionWeights: Object.fromEntries(alternative.dimensions.map(dimension => [dimension.id, dimension.weight])),
    indicatorWeights: Object.fromEntries(alternative.dimensions.flatMap(dimension => dimension.indicators.map(indicator => [indicator.id, indicator.withinDimensionWeight]))),
    maxAbsoluteScoreChange: round(Math.max(...changes)), meanAbsoluteScoreChange: round(changes.reduce((sum, value) => sum + value, 0) / changes.length),
    maxOrderMovement: Math.max(...order.map((value, i) => Math.abs(value - baselineRanks[i]))), spearman: Number(pearson(baselineRanks, order).toFixed(6)),
    orderReversals: reversals, categoryChanges: scores.filter((value, i) => category(round(value)) !== category(round(baselineScores[i]))).length,
    regions: scores.map((value, i) => ({ regionId: regions[i].id, score: round(value), change: round(value - baselineScores[i]), baselineRank: baselineRanks[i], rank: order[i], orderMovement: order[i] - baselineRanks[i] })),
  };
});
const correlations = coreIds.flatMap((a, i) => coreIds.slice(i + 1).map(b => ({ a, b, pearson: Number(pearson(regions.map(region => region.observations.find(observation => observation.indicatorId === a).value), regions.map(region => region.observations.find(observation => observation.indicatorId === b).value)).toFixed(6)) })));
const sensitivity = {
  baseline: "Four equal domain budgets; capped poverty/HDI allocation; equal basic-service inputs", referenceSetId: policy.referenceSetId,
  scenarios, correlations, decision: policy.weightDecision,
  sourceVerification,
  limitations: ["27-region descriptive sensitivity, not confidence intervals, sampling uncertainty, causal validation or independent review.", "Scores aggregate full precision before rounding to two decimals; sensitivity ranks use unrounded scores and average tied ranks. Rank 1 means highest modeled pressure, not a product league table.", "Singleton DBD and IRBI dimensions receive whole domain budgets; this is a conceptual choice, not higher source reliability. Public-health reporting and risk-model baselines remain limitations.", "Leave-one-input-out cases are explicit diagnostics only, never production missing-data reweighting.", "Correlations describe raw regional inputs; negative HDI/poverty correlation is directional overlap, not proof of causal independence."] ,
  coreDataFingerprint: `sha256:${digest(JSON.stringify(raw.filter(row => coreIds.includes(row.indicatorId))))}`,
};
function writeOutput(path, value) { writeFileSync(new URL(path, root), `${JSON.stringify(value, null, 2)}\n`); }
writeOutput("data/processed/civx-jabar-2023-current-sensitivity.json", sensitivity);
console.table(scenarios.map(({ id, maxAbsoluteScoreChange, meanAbsoluteScoreChange, maxOrderMovement, spearman, orderReversals, categoryChanges }) => ({ id, maxAbsoluteScoreChange, meanAbsoluteScoreChange, maxOrderMovement, spearman, orderReversals, categoryChanges })));
console.table(correlations);
if (mode === "--sensitivity") console.log("Sensitivity only: no regional release written.");
else {
  check(policy.status === "project_validated", "Review sensitivity and finalize current policy before generating release.");
  const scoredRegions = regions.map(region => ({ ...region, pressure: scorePressure(region.observations, policy, sources, artifacts, region.id) }));
  check(scoredRegions.every(region => region.pressure.status === "available"), "Incomplete core contract: withhold whole current release, never publish partial regional scores.");
  const release = {
    modelVersion: "CIVX v2", releaseId: policy.releaseId, period: policy.period, methodology: policy, sources, artifacts, candidates,
    regions: scoredRegions, exploreLayers: pressureLayers(scoredRegions, policy), sensitivity,
    sourceVerification,
    qualityAudit: { attempted: regions.length, scored: regions.length, withheld: [] },
    inputs: inputPaths.map(path => ({ path, sha256: digest(readFileSync(new URL(path, root))) })),
    limitations: ["Eight common 2023 inputs, four explicit domain budgets, 27/27 complete regions. Infrastructure remains Context because administrative road networks and denominators do not reconcile.", "Project-validated, not independently reviewed, government-endorsed, causal or comprehensive. Fine ranks are weight-sensitive; categories are descriptive relative pressure, not validated adequacy thresholds.", "Puskesmas measures per-resident inventory availability, not actual access, quality, staffing, capacity, utilization or distance. Lower availability is an explicit proxy direction.", "DBD uses the official common BPS reported-rate series, not recomputed cases divided by an alternate population. Underlying case/population bases remain unresolved and surveillance can vary.", "IRBI is modeled multi-hazard risk, not annual impacts. Hazard/vulnerability baselines and capacity updates differ in vintage; constant capacity can preserve old index values.", "Household service shares, labour-force rates, population shares and modeled indices have distinct denominators. Annual labels do not imply synchronized within-year measurement.", "Context and three verified positive advantages never change pressure. Unknown evidence means no comparable verified data, never absence or a negative score.", "Original restricted publications are fingerprinted and inspected in memory, not redistributed. Galura numeric observations are excluded; copyright/permission and independently certified boundaries remain unresolved."] ,
  };
  assertV2Release(release);
  writeOutput("data/processed/civx-jabar-2023-current.json", release);
  console.log(`${release.releaseId}: ${release.qualityAudit.scored}/27 scored; ${coreIds.length} complete core inputs; ${policy.dimensions.length} dimensions; ${advantages.observations.length} verified advantages.`);
}
