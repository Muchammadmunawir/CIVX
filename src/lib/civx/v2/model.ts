import type {
  ExploreLayer, V2Artifact, V2Observation, V2Policy, V2Pressure, V2Release, V2Region, V2Source,
} from "./types";

const checksum = /^sha256:[a-f0-9]{64}$/;
const closeToOne = (n: number) => Number.isFinite(n) && Math.abs(n - 1) < 1e-10;
const round = (n: number) => Math.round(n * 100) / 100;
const bounded = (n: number) => Number.isFinite(n) && n >= 0 && n <= 100;

export function assertPolicy(policy: V2Policy): void {
  if (policy.modelVersion !== "CIVX v2" || !policy.releaseId || !policy.methodologyVersion ||
    !policy.referenceSetId || !/^\d{4}$/.test(policy.period) || !policy.boundaryReference ||
    policy.normalization !== "fixed_min_max" || policy.rounding !== "full_precision_then_two_decimals" ||
    !Array.isArray(policy.referenceRegionIds) || policy.referenceRegionIds.length < 2 ||
    new Set(policy.referenceRegionIds).size !== policy.referenceRegionIds.length ||
    !Array.isArray(policy.dimensions) || policy.dimensions.length < 1 ||
    !["draft", "project_validated"].includes(policy.status)) throw new Error("Invalid v2 policy metadata.");
  const dimensions = new Set<string>();
  const indicators = new Set<string>();
  let total = 0;
  for (const dimension of policy.dimensions) {
    if (dimensions.has(dimension.id) || !dimension.label || !Number.isFinite(dimension.weight) ||
      dimension.weight <= 0 || !dimension.indicators.length) throw new Error("Invalid or duplicate dimension.");
    dimensions.add(dimension.id);
    total += dimension.weight;
    let withinTotal = 0;
    for (const indicator of dimension.indicators) {
      if (!indicator.id || indicators.has(indicator.id) || !indicator.label || !indicator.unit || !indicator.sourceId ||
        !Number.isFinite(indicator.minimum) || !Number.isFinite(indicator.maximum) || indicator.minimum >= indicator.maximum ||
        !indicator.minimumRegion || !indicator.maximumRegion || !["higher", "lower"].includes(indicator.direction) ||
        !Number.isFinite(indicator.withinDimensionWeight) || indicator.withinDimensionWeight <= 0) {
        throw new Error(`Invalid or duplicate indicator policy: ${indicator.id}.`);
      }
      indicators.add(indicator.id);
      withinTotal += indicator.withinDimensionWeight;
    }
    if (!closeToOne(withinTotal)) throw new Error(`Indicator weights must sum to one within ${dimension.id}.`);
  }
  if (!closeToOne(total)) throw new Error("Dimension weights must sum to one.");
  for (const dimension of policy.unsupportedDimensions) {
    if (dimensions.has(dimension.id) || !dimension.reason) throw new Error("Unsupported dimension overlaps scored dimensions.");
    dimensions.add(dimension.id);
  }
}

function provenanceProblem(observation: V2Observation, sources: readonly V2Source[], artifacts: readonly V2Artifact[]): string | null {
  if (!observation.provenance.length) return "Missing provenance.";
  const sourceIds = new Set<string>();
  for (const reference of observation.provenance) {
    const source = sources.find(item => item.id === reference.sourceId);
    const artifact = artifacts.find(item => item.id === reference.artifactId);
    if (!source || !artifact || sourceIds.has(source.id) || !source.publisher || !source.title ||
      !/^https:\/\//.test(source.url) || (source.table !== null && !source.table) || !source.page || !source.referencePeriod ||
      !source.accessedAt || !source.revision || source.dataYear !== Number(observation.period) ||
      !checksum.test(artifact.id) || source.artifactId !== artifact.id || !reference.locator ||
      !Number.isInteger(artifact.bytes) || artifact.bytes <= 0 || !artifact.retrievedAt || !artifact.redistribution) {
      return "Unverifiable source, artifact, year or locator.";
    }
    sourceIds.add(source.id);
  }
  const denominator = observation.denominator;
  if (denominator && !denominator.definition) return "Missing denominator definition.";
  if (denominator?.value !== undefined && (!Number.isFinite(denominator.value) || denominator.value <= 0 ||
    denominator.period !== observation.period || !denominator.unit || !denominator.locator ||
    !denominator.sourceId || !sourceIds.has(denominator.sourceId))) return "Unverifiable denominator provenance.";
  return null;
}

/** Optional evidence may have a different year, but must retain that year explicitly. */
export function observationProblem(
  observation: V2Observation, policy: V2Policy, sources: readonly V2Source[], artifacts: readonly V2Artifact[], regionId: string,
): string | null {
  if (!observation.id || !observation.indicatorId || observation.releaseId !== policy.releaseId ||
    observation.regionId !== regionId || !policy.referenceRegionIds.includes(regionId)) return "Observation release or region mismatch.";
  if (!observation.geography || observation.geography.code !== regionId ||
    !observation.geography.boundaryReference || !observation.unit || observation.confidence !== "not_assessed" ||
    !["core_score_indicator", "context_indicator", "advantage_signal"].includes(observation.kind) ||
    !["available", "unavailable", "historical", "partial_coverage"].includes(observation.coverageStatus) ||
    !["comparable", "incompatible_geography", "not_comparable"].includes(observation.comparabilityStatus) ||
    !["verified", "unverified", "failed"].includes(observation.verificationState) ||
    !Array.isArray(observation.provenance) || (observation.value !== null && !Number.isFinite(observation.value))) return "Invalid observation metadata or value.";
  if (observation.kind === "advantage_signal") {
    if (!["verified_present", "verified_absent", "no_comparable_data", "not_applicable"].includes(observation.presence)) return "Invalid advantage presence state.";
    if (["verified_present", "verified_absent"].includes(observation.presence) &&
      (observation.verificationState !== "verified" || !observation.whyAssigned?.trim() ||
        observation.coverageStatus === "unavailable" || observation.comparabilityStatus !== "comparable" ||
        observation.geography.level !== "kabupaten_kota" || observation.geography.boundaryReference !== policy.boundaryReference)) {
      return "Advantage presence or absence requires verified, geographically mapped evidence and a reason.";
    }
  }
  if (observation.verificationState !== "verified") {
    if (!observation.missingReason || observation.value !== null || observation.provenance.length) return "Unverified evidence must remain explicitly missing.";
    return null;
  }
  if (!observation.period || !/^\d{4}$/.test(observation.period)) return "Verified evidence needs its actual year.";
  if (observation.period !== policy.period && observation.coverageStatus !== "historical") return "Different-year evidence must be historical.";
  if (observation.coverageStatus === "unavailable") return "Verified evidence cannot claim unavailable coverage.";
  if (observation.kind !== "advantage_signal" && observation.value === null) return "Verified numeric observation has no value.";
  return provenanceProblem(observation, sources, artifacts);
}

function assertUniqueObservations(observations: readonly V2Observation[]): void {
  const ids = new Set<string>();
  const keys = new Set<string>();
  for (const observation of observations) {
    const key = `${observation.kind}/${observation.indicatorId}`;
    if (ids.has(observation.id) || keys.has(key)) throw new Error(`Duplicate observation: ${key}.`);
    ids.add(observation.id);
    keys.add(key);
  }
}

/** Only the configured core inputs can alter pressure. No optional evidence enters this sum. */
export function scorePressure(
  observations: readonly V2Observation[], policy: V2Policy, sources: readonly V2Source[], artifacts: readonly V2Artifact[], regionId: string,
): V2Pressure {
  assertPolicy(policy);
  assertUniqueObservations(observations);
  if (policy.status !== "project_validated") return { status: "unavailable", reason: "V2 methodology is not project-validated." };
  const core = new Map(observations.filter(o => o.kind === "core_score_indicator").map(o => [o.indicatorId, o]));
  const configured = new Set(policy.dimensions.flatMap(d => d.indicators.map(i => i.id)));
  for (const id of core.keys()) if (!configured.has(id)) throw new Error(`Unconfigured core observation: ${id}.`);
  let total = 0;
  const dimensions = [];
  for (const dimension of policy.dimensions) {
    let dimensionScore = 0;
    const components = [];
    for (const indicator of dimension.indicators) {
      const observation = core.get(indicator.id);
      if (!observation || observation.value === null) return { status: "unavailable", reason: `Missing core ${indicator.label}; no imputation or reweighting.` };
      const problem = observationProblem(observation, policy, sources, artifacts, regionId);
      if (problem || observation.verificationState !== "verified" || observation.coverageStatus !== "available" ||
        observation.comparabilityStatus !== "comparable" || observation.geography.level !== "kabupaten_kota" ||
        observation.geography.boundaryReference !== policy.boundaryReference || observation.period !== policy.period ||
        observation.unit !== indicator.unit || !observation.provenance.some(p => p.sourceId === indicator.sourceId) ||
        observation.value < indicator.minimum || observation.value > indicator.maximum) {
        return { status: "unavailable", reason: `Ineligible core ${indicator.label}: ${problem ?? "unit, period, geography, coverage, source or fixed-range mismatch"}; no score published.` };
      }
      const position = (observation.value - indicator.minimum) / (indicator.maximum - indicator.minimum);
      const normalized = 100 * (indicator.direction === "higher" ? position : 1 - position);
      const effectiveWeight = dimension.weight * indicator.withinDimensionWeight;
      dimensionScore += normalized * indicator.withinDimensionWeight;
      components.push({ indicatorId: indicator.id, observationId: observation.id, score: round(normalized),
        withinDimensionWeight: indicator.withinDimensionWeight, effectiveWeight, contribution: round(normalized * effectiveWeight) });
    }
    total += dimensionScore * dimension.weight;
    dimensions.push({ id: dimension.id, label: dimension.label, score: round(dimensionScore), weight: dimension.weight,
      contribution: round(dimensionScore * dimension.weight), components });
  }
  return { status: "available", releaseId: policy.releaseId, methodologyVersion: policy.methodologyVersion,
    referenceSetId: policy.referenceSetId, period: policy.period, score: round(total), dimensions };
}

export function verifiedAdvantages(
  observations: readonly V2Observation[], policy: V2Policy, sources: readonly V2Source[], artifacts: readonly V2Artifact[], regionId: string,
): Extract<V2Observation, { kind: "advantage_signal" }>[] {
  return observations.filter((observation): observation is Extract<V2Observation, { kind: "advantage_signal" }> =>
    observation.kind === "advantage_signal" && observation.presence === "verified_present" &&
    observationProblem(observation, policy, sources, artifacts, regionId) === null);
}

/** The contract permits future layers, but only complete validated pressure layers are registered here. */
export function pressureLayers(regions: readonly V2Region[], policy: V2Policy): ExploreLayer[] {
  if (regions.length !== policy.referenceRegionIds.length || new Set(regions.map(r => r.id)).size !== regions.length ||
    regions.some(r => !policy.referenceRegionIds.includes(r.id) || r.pressure.status !== "available")) return [];
  return [{ id: "overall" as const, label: "CIVX overall pressure" }, ...policy.dimensions.map(d => ({ id: d.id, label: d.label }))].map(layer => ({
    ...layer, kind: "core_score_indicator", releaseId: policy.releaseId, methodologyVersion: policy.methodologyVersion,
    referenceSetId: policy.referenceSetId, period: policy.period, unit: "index points", coverageStatus: "available", comparabilityStatus: "comparable",
    values: regions.map(region => {
      if (region.pressure.status !== "available") throw new Error("Unavailable layer value.");
      const value = layer.id === "overall" ? region.pressure.score : region.pressure.dimensions.find(d => d.id === layer.id)?.score;
      if (value === undefined) throw new Error("Missing pressure dimension.");
      return { regionId: region.id, value };
    }),
  }));
}

/** Read-boundary validation checks released values and metadata; it never recalculates scores in the UI. */
export function assertV2Release(release: V2Release): void {
  if (release.modelVersion !== "CIVX v2" || release.releaseId !== release.methodology?.releaseId ||
    release.period !== release.methodology.period || release.methodology.status !== "project_validated" ||
    release.sensitivity.referenceSetId !== release.methodology.referenceSetId) throw new Error("Invalid v2 release/version metadata.");
  assertPolicy(release.methodology);
  const sourceIds = new Set(release.sources.map(s => s.id));
  const artifactIds = new Set(release.artifacts.map(a => a.id));
  const candidateIds = new Set(release.candidates.map(c => c.id));
  if (sourceIds.size !== release.sources.length || artifactIds.size !== release.artifacts.length ||
    candidateIds.size !== release.candidates.length) throw new Error("Duplicate source, artifact or candidate.");
  const configuredCoreIds = new Set(release.methodology.dimensions.flatMap(dimension => dimension.indicators.map(indicator => indicator.id)));
  const auditedCoreIds = release.candidates.filter(candidate => candidate.classification === "core").map(candidate => candidate.id);
  if (auditedCoreIds.length !== configuredCoreIds.size || auditedCoreIds.some(id => !configuredCoreIds.has(id))) {
    throw new Error("Core source audit differs from configured indicator set.");
  }
  if (release.releaseId === "civx-jabar-2023-current") {
    const expected = ["3201", "3202", "3203", "3204", "3205", "3206", "3207", "3208", "3209", "3210", "3211", "3212", "3213", "3214", "3215", "3216", "3217", "3218", "3271", "3272", "3273", "3274", "3275", "3276", "3277", "3278", "3279"];
    if (release.period !== "2023" || release.methodology.referenceRegionIds.length !== expected.length ||
      expected.some(id => !release.methodology.referenceRegionIds.includes(id)) || configuredCoreIds.size !== 8 ||
      release.qualityAudit.scored !== 27 || release.qualityAudit.withheld.length !== 0) {
      throw new Error("Current release requires all 27 Jawa Barat regions and eight complete common inputs.");
    }
    const verification = release.sourceVerification;
    if (!verification || !["original_artifacts", "validated_transcriptions"].includes(verification.mode) ||
      verification.artifacts.length !== artifactIds.size ||
      new Set(verification.artifacts.map(record => record.artifactId)).size !== artifactIds.size ||
      verification.artifacts.some(record => !artifactIds.has(record.artifactId) ||
        !["bytes_verified", "fingerprinted_transcription_only"].includes(record.state) ||
        verification.mode === "original_artifacts" && record.state !== "bytes_verified" ||
        release.artifacts.some(artifact => artifact.id === record.artifactId && artifact.localPath !== null) && record.state !== "bytes_verified")) {
      throw new Error("Current release requires an honest verification receipt for every source artifact.");
    }
  }
  const regionIds = new Set<string>();
  let scored = 0;
  for (const region of release.regions) {
    if (regionIds.has(region.id) || !release.methodology.referenceRegionIds.includes(region.id) || !region.name ||
      region.province !== "Jawa Barat" || region.boundaryReference !== release.methodology.boundaryReference) throw new Error("Invalid v2 regional geography.");
    regionIds.add(region.id);
    assertUniqueObservations(region.observations);
    for (const observation of region.observations) {
      const problem = observationProblem(observation, release.methodology, release.sources, release.artifacts, region.id);
      const candidate = release.candidates.find(c => c.id === observation.indicatorId);
      const expectedKind = candidate?.classification === "core" ? "core_score_indicator"
        : candidate?.classification === "context" ? "context_indicator"
        : candidate?.classification === "advantage" ? "advantage_signal" : null;
      if (observation.kind !== expectedKind) throw new Error(`Observation classification differs from source audit: ${observation.id}.`);
      if (problem || !candidateIds.has(observation.indicatorId)) throw new Error(`Invalid released observation: ${observation.id}: ${problem ?? "unknown candidate"}`);
    }
    const pressure = region.pressure;
    if (pressure.status === "available") {
      scored++;
      const coreObservations = region.observations.filter(observation => observation.kind === "core_score_indicator");
      if (coreObservations.length !== configuredCoreIds.size ||
        coreObservations.some(observation => !configuredCoreIds.has(observation.indicatorId))) {
        throw new Error("Released region lacks the complete configured core contract.");
      }
      if (new Set(pressure.dimensions.map(dimension => dimension.id)).size !== pressure.dimensions.length) {
        throw new Error("Duplicate released pressure dimension.");
      }
      if (Math.abs(pressure.dimensions.reduce((sum, dimension) => sum + dimension.contribution, 0) - pressure.score) >
        0.005 * (pressure.dimensions.length + 1) + 1e-10) throw new Error("Released dimension contributions do not reconstruct total.");
      if (pressure.releaseId !== release.releaseId || pressure.period !== release.period ||
        pressure.methodologyVersion !== release.methodology.methodologyVersion || pressure.referenceSetId !== release.methodology.referenceSetId ||
        !bounded(pressure.score) || pressure.dimensions.length !== release.methodology.dimensions.length) throw new Error("Invalid pressure release/version.");
      for (const dimension of release.methodology.dimensions) {
        const result = pressure.dimensions.find(d => d.id === dimension.id);
        if (!result || result.label !== dimension.label || !bounded(result.score) || !bounded(result.contribution) || result.weight !== dimension.weight ||
          result.components.length !== dimension.indicators.length ||
          new Set(result.components.map(component => component.indicatorId)).size !== result.components.length ||
          Math.abs(result.score * result.weight - result.contribution) > 0.005 * (1 + result.weight) + 1e-10 ||
          Math.abs(result.components.reduce((sum, component) => sum + component.contribution, 0) - result.contribution) >
            0.005 * (result.components.length + 1) + 1e-10) throw new Error("Invalid released dimension.");
        for (const indicator of dimension.indicators) {
          const component = result.components.find(c => c.indicatorId === indicator.id);
          const observation = region.observations.find(o => o.id === component?.observationId);
          if (!component || !bounded(component.score) || !bounded(component.contribution) ||
            component.withinDimensionWeight !== indicator.withinDimensionWeight ||
            component.effectiveWeight !== dimension.weight * indicator.withinDimensionWeight ||
            Math.abs(component.score * component.effectiveWeight - component.contribution) > 0.005 * (1 + component.effectiveWeight) + 1e-10 ||
            !observation || observation.kind !== "core_score_indicator" || observation.value === null ||
            observation.verificationState !== "verified" || observation.period !== release.period ||
            observation.comparabilityStatus !== "comparable" || observation.coverageStatus !== "available" ||
            observation.geography.level !== "kabupaten_kota" || observation.unit !== indicator.unit ||
            observation.geography.boundaryReference !== release.methodology.boundaryReference ||
            !observation.provenance.some(p => p.sourceId === indicator.sourceId) ||
            observation.value < indicator.minimum || observation.value > indicator.maximum) throw new Error("Invalid released core component.");
        }
      }
    } else if (pressure.status !== "unavailable" || !pressure.reason) throw new Error("Invalid withheld pressure status.");
  }
  if (regionIds.size !== release.methodology.referenceRegionIds.length || release.qualityAudit.attempted !== regionIds.size ||
    release.qualityAudit.scored !== scored || release.qualityAudit.withheld.length !== regionIds.size - scored) throw new Error("Invalid v2 coverage audit.");
  const withheldIds = new Set(release.qualityAudit.withheld.map(item => item.regionId));
  if (withheldIds.size !== release.qualityAudit.withheld.length || release.qualityAudit.withheld.some(item =>
    !item.reason || !release.regions.some(region => region.id === item.regionId &&
      region.pressure.status === "unavailable" && region.pressure.reason === item.reason))) throw new Error("Withheld audit differs from regional status.");
  const layerIds = new Set<string>();
  for (const layer of release.exploreLayers) {
    if (layerIds.has(layer.id) || (layer.id !== "overall" && !release.methodology.dimensions.some(d => d.id === layer.id)) ||
      layer.releaseId !== release.releaseId || layer.methodologyVersion !== release.methodology.methodologyVersion ||
      layer.referenceSetId !== release.methodology.referenceSetId || layer.period !== release.period || layer.kind !== "core_score_indicator" ||
      layer.values.length !== regionIds.size || new Set(layer.values.map(v => v.regionId)).size !== regionIds.size ||
      layer.coverageStatus !== "available" || layer.comparabilityStatus !== "comparable" || layer.unit !== "index points" ||
      layer.values.some(value => {
        const region = release.regions.find(r => r.id === value.regionId);
        if (!region || region.pressure.status !== "available" || !bounded(value.value)) return true;
        const expected = layer.id === "overall" ? region.pressure.score
          : region.pressure.dimensions.find(d => d.id === layer.id)?.score;
        return value.value !== expected;
      })) throw new Error("Invalid or unsupported Explore layer.");
    layerIds.add(layer.id);
  }
  if (release.releaseId === "civx-jabar-2023-current" && layerIds.size !== release.methodology.dimensions.length + 1) {
    throw new Error("Current release requires every complete pressure layer.");
  }
}
