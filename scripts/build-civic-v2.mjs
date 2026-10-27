import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { assertPolicy, assertV2Release, observationProblem, pressureLayers, scorePressure } from "../src/lib/civx/v2/model.ts";

const root = new URL("../", import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), "utf8"));
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const check = (condition, message) => { if (!condition) throw new Error(message); };
const round = value => Math.round(value * 100) / 100;
const mode = process.argv[2];
check(mode === undefined || mode === "--sensitivity", "Use no argument for release generation, or --sensitivity for analysis only.");
const policyPath = "data/methodology/civx-jabar-2023-v2.json";
const inputPaths = ["data/raw/v2/services-audit.json", "data/raw/v2/infrastructure-audit.json", "data/raw/v2/context-advantages-audit.json", "data/raw/v2/services-observations.json", "data/raw/v2/context-advantages-observations.json", policyPath];
const policy = read(policyPath);
assertPolicy(policy);
const baseline = read("data/releases/civx-v1-integrity.json");
for (const [path, hash] of Object.entries(baseline.files)) check(digest(readFileSync(new URL(path, root))) === hash, `Protected v1 artifact changed: ${path}`);
const v1 = read("data/raw/civx-jabar-2023.json");
const service = read("data/raw/v2/services-observations.json");
const advantages = read("data/raw/v2/context-advantages-observations.json");
const candidates = inputPaths.slice(0, 3).flatMap(path => read(path).candidates);
const candidateById = new Map(candidates.map(c => [c.id, c]));
check(candidateById.size === candidates.length, "Duplicate candidate IDs.");
const sources = [...service.sources, ...advantages.sources].map(source => ({ ...source, revision: source.artifactId === v1.artifact.id ? "BPS publication revised 2024-02-29; fixed fingerprint" : "Source revision date not stated; artifact fingerprint fixes inspected version" }));
const sourceById = new Map(sources.map(s => [s.id, s]));
const artifacts = [...service.artifacts, ...advantages.artifacts];
check(sourceById.size === sources.length && new Set(artifacts.map(a => a.id)).size === artifacts.length, "Duplicate source or artifact IDs.");
check(v1.regions.length === 27 && policy.referenceRegionIds.length === 27 && policy.referenceRegionIds.every(id => v1.regions.some(r => r.id === id)), "V2 requires the exact 27-region reference cohort.");

// Restricted originals are checked in memory, never copied into a distributable directory.
for (const artifact of artifacts) {
  let bytes;
  if (artifact.localPath) bytes = readFileSync(new URL(artifact.localPath, root));
  else if (process.env.CIVX_V2_HEALTH_PDF) bytes = readFileSync(process.env.CIVX_V2_HEALTH_PDF);
  else {
    const response = await fetch(artifact.url);
    check(response.ok, `Source acquisition failed: HTTP ${response.status}: ${artifact.url}`);
    bytes = Buffer.from(await response.arrayBuffer());
  }
  check(bytes.length === artifact.bytes && `sha256:${digest(bytes)}` === artifact.id, `Source bytes/checksum mismatch: ${artifact.url}`);
}

const raw = [...service.observations, ...advantages.observations];
const rawKeys = new Set();
for (const observation of raw) {
  const key = `${observation.regionId}/${observation.indicatorId}`;
  check(!rawKeys.has(key), `Duplicate raw observation: ${key}`);
  rawKeys.add(key);
  check(policy.referenceRegionIds.includes(observation.regionId) && candidateById.has(observation.indicatorId), `Unknown raw observation: ${key}`);
  check(sourceById.has(observation.sourceId) && /^\d{4}$/.test(observation.period) && observation.unit, `Untraceable raw observation: ${key}`);
}
const coreIds = policy.dimensions.flatMap(d => d.indicators.map(i => i.id));
check(candidates.filter(c => c.classification === "core").every(c => coreIds.includes(c.id)) && coreIds.every(id => candidateById.get(id)?.classification === "core"), "Core candidate audit and policy differ.");
for (const dimension of policy.dimensions) for (const indicator of dimension.indicators) {
  const rows = raw.filter(o => o.indicatorId === indicator.id);
  check(rows.length === 27 && new Set(rows.map(r => r.regionId)).size === 27 && rows.every(o => o.period === policy.period && o.unit === indicator.unit && o.sourceId === indicator.sourceId && Number.isFinite(o.value)), `Incomplete or incomparable core coverage: ${indicator.id}`);
  check(Math.min(...rows.map(o => o.value)) === indicator.minimum && Math.max(...rows.map(o => o.value)) === indicator.maximum, `Fixed reference extrema changed: ${indicator.id}`);
  const minimumRegion = v1.regions.find(r => r.name === indicator.minimumRegion);
  const maximumRegion = v1.regions.find(r => r.name === indicator.maximumRegion);
  check(rows.some(o => o.regionId === minimumRegion?.id && o.value === indicator.minimum) && rows.some(o => o.regionId === maximumRegion?.id && o.value === indicator.maximum), `Reference extrema geography mismatch: ${indicator.id}`);
}
// V2 reuses, rather than revises, every original v1 observation.
for (const region of v1.regions) for (const observation of region.observations) {
  const row = raw.find(o => o.regionId === region.id && o.indicatorId === observation.indicatorId);
  check(row?.value === observation.value && row.unit === observation.unit && row.period === observation.period && row.sourceId === observation.sourceId, `Original v1 value changed in v2: ${region.id}/${observation.indicatorId}`);
}

function provenance(sourceId, locator) {
  const source = sourceById.get(sourceId);
  check(source, `Unknown provenance source ${sourceId}`);
  return { sourceId, artifactId: source.artifactId, locator };
}
const regions = v1.regions.map(region => ({
  id: region.id, name: region.name, type: region.type, province: region.province, boundaryReference: region.boundaryReference,
  observations: candidates.filter(c => c.classification !== "rejected").map(candidate => {
    const row = raw.find(o => o.regionId === region.id && o.indicatorId === candidate.id);
    const kind = candidate.classification === "core" ? "core_score_indicator" : candidate.classification === "advantage" ? "advantage_signal" : "context_indicator";
    const refs = row ? [provenance(row.sourceId, row.locator), ...(row.supportingProvenance ?? []).map(p => provenance(p.sourceId, p.locator))] : [];
    if (row?.denominator?.sourceId && !refs.some(p => p.sourceId === row.denominator.sourceId)) refs.push(provenance(row.denominator.sourceId, row.denominator.locator));
    if (row?.derivation) {
      const numerator = raw.find(o => o.regionId === region.id && o.indicatorId === row.derivation.numeratorIndicatorId);
      const denominator = raw.find(o => o.regionId === region.id && o.indicatorId === row.derivation.denominatorIndicatorId);
      check(numerator?.value === row.derivation.numeratorValue && denominator?.value === row.denominator?.value && row.denominator.value > 0 && Math.abs(row.value - numerator.value / denominator.value * 100000) < 1e-12, `Derived ratio mismatch: ${region.id}/${candidate.id}`);
    }
    const observation = {
      id: `${policy.releaseId}/${region.id}/${candidate.id}`, releaseId: policy.releaseId, indicatorId: candidate.id, regionId: region.id,
      geography: { level: "kabupaten_kota", code: region.id, boundaryReference: region.boundaryReference },
      kind, period: row?.period ?? null, unit: row?.unit ?? candidate.unit, value: row?.value ?? null,
      coverageStatus: row ? row.period !== policy.period ? "historical" : candidate.classification === "advantage" ? "partial_coverage" : "available" : "unavailable",
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
  const mean = values => values.reduce((sum, n) => sum + n, 0) / values.length;
  const ma = mean(a), mb = mean(b);
  const covariance = a.reduce((sum, n, i) => sum + (n - ma) * (b[i] - mb), 0);
  const spread = Math.sqrt(a.reduce((sum, n) => sum + (n - ma) ** 2, 0) * b.reduce((sum, n) => sum + (n - mb) ** 2, 0));
  check(spread > 0, "Sensitivity correlation has a constant series.");
  return covariance / spread;
}
function ranks(values) {
  const sorted = [...values].sort((a, b) => b - a);
  return values.map(value => (sorted.indexOf(value) + sorted.lastIndexOf(value)) / 2 + 1);
}
const category = value => value < 33.33 ? "lower" : value < 66.67 ? "moderate" : "higher";
function calculate(candidatePolicy) {
  return regions.map(region => {
    const allowed = new Set(candidatePolicy.dimensions.flatMap(d => d.indicators.map(i => i.id)));
    const result = scorePressure(region.observations.filter(o => o.kind !== "core_score_indicator" || allowed.has(o.indicatorId)), { ...candidatePolicy, status: "project_validated" }, sources, artifacts, region.id);
    check(result.status === "available", `Sensitivity input ineligible: ${region.id}: ${result.reason}`);
    return result.score;
  });
}
const baselineScores = calculate(policy);
const baselineRanks = ranks(baselineScores);
const scenarios = [
  { id: "socioeconomic_60", label: "Socioeconomic 60% / basic services 40%", weights: [0.6, 0.4] },
  { id: "services_60", label: "Socioeconomic 40% / basic services 60%", weights: [0.4, 0.6] },
  { id: "equal_within_socioeconomic", label: "Equal socioeconomic inputs, equal dimension budgets", weights: [0.5, 0.5], equalSocio: true },
  { id: "five_equal_indicators", label: "Five equal indicators (diagnostic comparator, not selected)", weights: [0.6, 0.4], equalSocio: true },
  { id: "without_hdi", label: "Deprivation represented by poverty only", weights: [0.5, 0.5], omit: "hdi" },
  { id: "without_poverty", label: "Deprivation represented by HDI only", weights: [0.5, 0.5], omit: "poverty" },
].map(scenario => {
  const alternative = structuredClone(policy);
  alternative.dimensions.forEach((d, i) => { d.weight = scenario.weights[i]; });
  const socio = alternative.dimensions[0];
  if (scenario.equalSocio) socio.indicators.forEach(i => { i.withinDimensionWeight = 1 / 3; });
  if (scenario.omit) {
    socio.indicators = socio.indicators.filter(i => i.id !== scenario.omit);
    socio.indicators.forEach(i => { i.withinDimensionWeight = 0.5; });
  }
  const scores = calculate(alternative), order = ranks(scores);
  const changes = scores.map((value, i) => Math.abs(value - baselineScores[i]));
  let reversals = 0;
  for (let i = 0; i < scores.length; i++) for (let j = i + 1; j < scores.length; j++) {
    if ((scores[i] - scores[j]) * (baselineScores[i] - baselineScores[j]) < 0) reversals++;
  }
  return {
    id: scenario.id, label: scenario.label,
    dimensionWeights: Object.fromEntries(alternative.dimensions.map(d => [d.id, d.weight])),
    indicatorWeights: Object.fromEntries(alternative.dimensions.flatMap(d => d.indicators.map(i => [i.id, i.withinDimensionWeight]))),
    maxAbsoluteScoreChange: round(Math.max(...changes)), meanAbsoluteScoreChange: round(changes.reduce((s, n) => s + n, 0) / changes.length),
    maxOrderMovement: Math.max(...order.map((value, i) => Math.abs(value - baselineRanks[i]))), spearman: Number(pearson(baselineRanks, order).toFixed(6)),
    orderReversals: reversals, categoryChanges: scores.filter((value, i) => category(value) !== category(baselineScores[i])).length,
    regions: scores.map((value, i) => ({ regionId: regions[i].id, score: value, change: round(value - baselineScores[i]), orderMovement: order[i] - baselineRanks[i] })),
  };
});
const correlations = coreIds.flatMap((a, i) => coreIds.slice(i + 1).map(b => ({ a, b, pearson: Number(pearson(
  regions.map(r => r.observations.find(o => o.indicatorId === a).value), regions.map(r => r.observations.find(o => o.indicatorId === b).value),
).toFixed(6)) })));
const sensitivity = {
  baseline: "Equal dimension budgets with a capped poverty/HDI deprivation allocation", referenceSetId: policy.referenceSetId,
  scenarios, correlations,
  decision: "Equal dimension budgets prevent indicator-count dominance; the poverty/HDI pair shares one deprivation allocation. Alternative weights and single-indicator substitutions change scores and fine ordering, so no precise league-table interpretation is warranted. Weights remain explicit project trade-offs, not externally approved importance coefficients.",
  limitations: ["27-region descriptive sensitivity, not sampling uncertainty or causal validation.", "Comparisons use two-decimal released scores and average tied ranks; ties are not arbitrarily broken.", "Fixed min-max reference and additive aggregation remain modeling assumptions; this analysis does not claim full methodological robustness.", "Leave-one-indicator-out scenarios are declared diagnostics, never a missing-data production rule."],
  coreDataFingerprint: `sha256:${digest(JSON.stringify(service.observations.filter(o => coreIds.includes(o.indicatorId))))}`,
};
function writeReleaseFile(path, value) {
  const content = `${JSON.stringify(value, null, 2)}\n`, url = new URL(path, root);
  if (existsSync(url)) check(readFileSync(url, "utf8") === content, `Existing versioned artifact differs: ${path}. Create a new release/version rather than overwrite historical results.`);
  else writeFileSync(url, content);
}
const sensitivityPath = "data/processed/civx-jabar-2023-v2-sensitivity.json";
if (mode === "--sensitivity") {
  writeReleaseFile(sensitivityPath, sensitivity);
  console.table(scenarios.map(({ id, maxAbsoluteScoreChange, meanAbsoluteScoreChange, maxOrderMovement, spearman, orderReversals, categoryChanges }) => ({ id, maxAbsoluteScoreChange, meanAbsoluteScoreChange, maxOrderMovement, spearman, orderReversals, categoryChanges })));
  console.table(correlations);
  console.log("Sensitivity only: no regional release written.");
} else {
  check(policy.status === "project_validated", "Finalize the v2 weight decision after reviewing sensitivity before releasing scores.");
  check(JSON.stringify(read(sensitivityPath)) === JSON.stringify(sensitivity), "Sensitivity artifact is absent or does not match these inputs and policy.");
  const scoredRegions = regions.map(region => ({ ...region, pressure: scorePressure(region.observations, policy, sources, artifacts, region.id) }));
  const withheld = scoredRegions.filter(r => r.pressure.status === "unavailable").map(r => ({ regionId: r.id, reason: r.pressure.reason }));
  const release = {
    modelVersion: "CIVX v2", releaseId: policy.releaseId, period: policy.period, methodology: policy, sources, artifacts, candidates,
    regions: scoredRegions, exploreLayers: pressureLayers(scoredRegions, policy), sensitivity,
    qualityAudit: { attempted: regions.length, scored: regions.length - withheld.length, withheld },
    inputs: inputPaths.map(path => ({ path, sha256: digest(readFileSync(new URL(path, root))) })),
    limitations: [
      "Five comparable 2023 core inputs in two dimensions only; public health, infrastructure and resilience remain unscored.",
      "Project-validated, not independently reviewed, government-endorsed, causal or comprehensive.",
      "Source windows within 2023 differ; no monthly simultaneity or later-year comparability is claimed.",
      "Density is context, never a penalty. Puskesmas supply is not observed healthcare access. DBD population bases remain unresolved.",
      "Only three targeted positive capability records are verified; missing optional records mean no comparable data, not absence.",
      "Galura numeric source rows are not redistributed without permission; metadata and comparability findings remain in the audit.",
      "BPS publication rights, independent review and certified effective-boundary compatibility remain unresolved.",
      "Explore layer descriptors cover overall pressure and the two validated dimensions. No new v2 map or context map is published.",
    ],
  };
  assertV2Release(release);
  writeReleaseFile("data/processed/civx-jabar-2023-v2.json", release);
  console.log(`${release.releaseId}: ${release.qualityAudit.scored}/${regions.length} scored; ${coreIds.length} core indicators; ${policy.dimensions.length} dimensions; ${advantages.observations.length} verified positive evidence records.`);
}
