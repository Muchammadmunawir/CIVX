import catalog from "../../../data/processed/contextual-data-catalog-2023.json" with { type: "json" };
import speed from "../../../data/processed/context/context_traffic_bandung_2024_after_speed.json" with { type: "json" };
import ratio from "../../../data/processed/context/context_traffic_bandung_2024_after_vc_ratio.json" with { type: "json" };
import terminals from "../../../data/processed/context/context_transport_type_c_terminal_inventory_2023.json" with { type: "json" };
import commuter from "../../../data/processed/context/context_transport_commuter_share_jabodetabek_2023.json" with { type: "json" };
import crime from "../../../data/processed/context/context_crime_podes_theft_villages_jabar_2024.json" with { type: "json" };
import ispu from "../../../data/processed/context/context_air_pollution_klh_site_ispu_20261029.json" with { type: "json" };
import pm25 from "../../../data/processed/context/context_air_pollution_klh_site_pm25_ispu_20261029.json" with { type: "json" };
import type { ContextDataset2023 } from "./contextual-data-2023.ts";
import type { CivxContextDataset2023, CivxContextItem2023 } from "./product-types-2023.ts";
import type { RegionIdentity2023 } from "./model-2023.ts";

type PreparedDataset = ContextDataset2023 & Pick<CivxContextDataset2023, "provenance">;
type ObjectValue = Record<string, unknown>;

const artifacts: ReadonlyMap<string, unknown> = new Map<string, unknown>([
  ["context_traffic_bandung_2024_after_speed", speed],
  ["context_traffic_bandung_2024_after_vc_ratio", ratio],
  ["context_transport_type_c_terminal_inventory_2023", terminals],
  ["context_transport_commuter_share_jabodetabek_2023", commuter],
  ["context_crime_podes_theft_villages_jabar_2024", crime],
  ["context_air_pollution_klh_site_ispu_20261029", ispu],
  ["context_air_pollution_klh_site_pm25_ispu_20261029", pm25],
]);
const canonicalIds = [
  "3201", "3202", "3203", "3204", "3205", "3206", "3207", "3208", "3209",
  "3210", "3211", "3212", "3213", "3214", "3215", "3216", "3217", "3218",
  "3271", "3272", "3273", "3274", "3275", "3276", "3277", "3278", "3279",
];

function requireContext(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`CIVX 2023 context repository: ${message}`);
}
function object(value: unknown, label: string): asserts value is ObjectValue {
  requireContext(typeof value === "object" && value !== null && !Array.isArray(value), `${label} must be an object`);
}
function array(value: unknown, label: string): asserts value is unknown[] {
  requireContext(Array.isArray(value), `${label} must be an array`);
}
function text(value: unknown, label: string): asserts value is string {
  requireContext(typeof value === "string" && value.trim().length > 0, `${label} must be nonempty text`);
}
function nullableText(value: unknown, label: string): void {
  if (value !== null) text(value, label);
}
function texts(value: unknown, label: string): asserts value is string[] {
  array(value, label);
  value.forEach((entry) => text(entry, label));
}
function finite(value: unknown, label: string): asserts value is number {
  requireContext(typeof value === "number" && Number.isFinite(value), `${label} must be finite`);
}
function sameIds(actual: unknown, expected: readonly string[], label: string): void {
  texts(actual, label);
  requireContext(actual.length === expected.length && actual.every((id, index) => id === expected[index]), `${label} must match canonical order`);
}
function manifest(value: unknown, label: string): asserts value is unknown[] {
  array(value, label);
  requireContext(value.length > 0, `${label} must not be empty`);
  const paths = new Set<string>();
  for (const entry of value) {
    object(entry, label);
    text(entry.path, `${label} path`);
    text(entry.sha256, `${label} sha256`);
    requireContext(/^[a-f0-9]{64}$/.test(entry.sha256), `${label} invalid sha256`);
    requireContext(typeof entry.bytes === "number" && Number.isSafeInteger(entry.bytes) && entry.bytes > 0, `${label} invalid byte count`);
    requireContext(!paths.has(entry.path), `${label} duplicate path`);
    paths.add(entry.path);
  }
}

function validateDataset(value: unknown, regions: readonly RegionIdentity2023[]): asserts value is PreparedDataset {
  object(value, "dataset");
  text(value.datasetId, "datasetId");
  const label = value.datasetId;
  requireContext(value.version === 1 && value.scope === "CONTEXT" && value.coreScoreAffected === false && value.normalizationApplied === false, `${label} invalid context scope flags`);
  requireContext(value.decision === "ACCEPT_CONTEXT" || value.decision === "PARTIAL_CONTEXT", `${label} is not accepted context`);
  requireContext(["traffic", "transport", "crime", "air_pollution"].includes(String(value.domain)), `${label} invalid domain`);
  requireContext(["official_open_data", "official_statistics", "official_agency", "research", "commercial", "crowdsourced"].includes(String(value.sourceType)), `${label} invalid source type`);
  for (const key of ["title", "publisher", "sourceUrl", "referencePeriod", "missingness", "geographicLevel", "unit", "definition", "measurementMethod", "licenseOrUsageNotes", "temporalWarning", "rawAuditPath", "candidatePointer"]) text(value[key], `${label}.${key}`);
  for (const key of ["publicationDate", "updateFrequency", "numerator", "denominator"]) nullableText(value[key], `${label}.${key}`);
  for (const key of ["limitations", "knownBiases", "safeStatements", "unsafeStatements", "statementTemplates"]) texts(value[key], `${label}.${key}`);
  requireContext(typeof value.machineReadable === "boolean" && typeof value.reproducible === "boolean", `${label} invalid reproducibility metadata`);
  requireContext(value.regionalAggregation === "none" || value.regionalAggregation === "source_published_region_value", `${label} invalid aggregation`);
  object(value.comparability, `${label}.comparability`);
  requireContext(["comparable_admin_panel", "within_source_partial", "not_comparable"].includes(String(value.comparability.status)) && value.comparability.comparisonPermitted === false, `${label} comparisons must remain disabled`);
  text(value.comparability.reason, `${label}.comparability.reason`);
  object(value.provenance, `${label}.provenance`);
  manifest(value.provenance.sourceManifest, `${label}.sourceManifest`);
  manifest(value.provenance.computationManifest, `${label}.computationManifest`);
  text(value.provenance.reproductionScope, `${label}.reproductionScope`);
  const sourceManifest = value.provenance.sourceManifest;
  requireContext(sourceManifest.some((entry) => {
    object(entry, `${label}.sourceManifest entry`);
    return entry.path === value.rawAuditPath;
  }), `${label} raw audit missing from provenance`);
  for (const [entries, expected] of [[sourceManifest, catalog.sourceManifest], [value.provenance.computationManifest, catalog.computationManifest]] as const) {
    for (const entry of entries) {
      object(entry, `${label} manifest entry`);
      requireContext(expected.some((item) => item.path === entry.path && item.sha256 === entry.sha256 && item.bytes === entry.bytes), `${label} provenance does not resolve to catalog manifest`);
    }
  }
  requireContext(typeof value.candidatePointer === "string" && /^\/candidates\/\d+$/.test(value.candidatePointer), `${label} invalid candidate pointer`);
  array(value.sources, `${label}.sources`);
  const sourceIds = new Set<string>();
  for (const source of value.sources) {
    object(source, `${label} source`);
    for (const key of ["sourceId", "url", "publisher", "title", "accessedAt", "representation", "evidence", "retrievalMethod"]) text(source[key], `${label}.source.${key}`);
    text(source.sourceId, `${label} sourceId`);
    requireContext(!sourceIds.has(source.sourceId), `${label} duplicate sourceId`);
    sourceIds.add(source.sourceId);
    texts(source.excerpts, `${label}.source.excerpts`);
    nullableText(source.publicationDate, `${label}.source.publicationDate`);
    requireContext(source.httpStatus === null || (typeof source.httpStatus === "number" && Number.isInteger(source.httpStatus) && source.httpStatus >= 100 && source.httpStatus <= 599), `${label} invalid HTTP status`);
    requireContext(source.contentSha256 === null || (typeof source.contentSha256 === "string" && /^[a-f0-9]{64}$/.test(source.contentSha256)), `${label} invalid source hash`);
    requireContext(catalog.sources.some((entry) => JSON.stringify(entry) === JSON.stringify(source)), `${label} source receipt differs from catalog`);
  }
  requireContext(sourceIds.size > 0, `${label} missing source receipts`);
  array(value.records, `${label}.records`);
  requireContext(value.records.length === 27, `${label} must contain 27 regional slots`);
  const covered: string[] = [];
  const missing: string[] = [];
  const observationIds = new Set<string>();
  const evidencePointers = new Set<string>();
  let observationCount = 0;
  let regionWideValueCount = 0;
  for (const [index, record] of value.records.entries()) {
    object(record, `${label} record`);
    const region = regions[index];
    requireContext(record.regionId === region.id && record.regionName === region.name, `${label} record ${index} does not match canonical region identity/order`);
    requireContext(record.referencePeriod === value.referencePeriod, `${label} inconsistent record reference period`);
    array(record.observations, `${label} observations`);
    if (record.observations.length === 0) {
      requireContext(record.valueStatus === "missing" && record.value === null, `${label}/${region.id} missing observation must remain null/missing`);
      text(record.missingReason, `${label}/${region.id} missing reason`);
      missing.push(region.id);
    } else {
      covered.push(region.id);
      if (value.regionalAggregation === "none") {
        requireContext(record.valueStatus === "site_observations_only" && record.value === null, `${label}/${region.id} site observations must not become regional values`);
        text(record.missingReason, `${label}/${region.id} site-only reason`);
      } else {
        requireContext(record.valueStatus === "published_region_value" && record.missingReason === null && record.observations.length === 1, `${label}/${region.id} invalid published regional value`);
        finite(record.value, `${label}/${region.id} regional value`);
        object(record.observations[0], `${label} regional observation`);
        requireContext(record.value === record.observations[0].value, `${label}/${region.id} regional value must equal source observation`);
        regionWideValueCount++;
      }
    }
    for (const observation of record.observations) {
      object(observation, `${label} observation`);
      requireContext(observation.regionId === region.id && observation.regionName === region.name, `${label} observation region mismatch`);
      for (const key of ["observationId", "geographicLevel", "period", "unit", "sourceRef", "sourceLocator", "transformation", "evidencePointer"]) text(observation[key], `${label}.observation.${key}`);
      for (const key of ["siteId", "siteName"]) nullableText(observation[key], `${label}.observation.${key}`);
      finite(observation.value, `${label} observed value`);
      if (typeof observation.sourceValue === "number") finite(observation.sourceValue, `${label} source value`);
      else text(observation.sourceValue, `${label} source value`);
      texts(observation.limitations, `${label} observation limitations`);
      text(observation.observationId, `${label} observationId`);
      text(observation.sourceRef, `${label} sourceRef`);
      text(observation.evidencePointer, `${label} evidencePointer`);
      requireContext(sourceIds.has(observation.sourceRef), `${label} unresolved observation sourceRef`);
      // Dataset coverage and observation geography can use different audited descriptions.
      requireContext(observation.unit === value.unit, `${label} inconsistent observation unit`);
      requireContext(!observationIds.has(observation.observationId), `${label} duplicate observation ID`);
      requireContext(observation.evidencePointer.startsWith(`${value.candidatePointer}/observations/`) && /^\/candidates\/\d+\/observations\/\d+$/.test(observation.evidencePointer) && !evidencePointers.has(observation.evidencePointer), `${label} invalid or duplicate observation evidence pointer`);
      if (value.regionalAggregation === "none") requireContext(observation.siteId !== null && observation.siteName !== null, `${label} missing site identity`);
      else requireContext(observation.siteId === null && observation.siteName === null, `${label} unexpected site-level regional scalar`);
      observationIds.add(observation.observationId);
      evidencePointers.add(observation.evidencePointer);
      observationCount++;
    }
  }
  object(value.coverage, `${label}.coverage`);
  sameIds(value.coverage.coveredRegionIds, covered, `${label} covered regions`);
  sameIds(value.coverage.missingRegionIds, missing, `${label} missing regions`);
  requireContext(value.coverage.totalCivxRegions === 27 && value.coverage.regionCount === covered.length && value.coverage.coveragePercent === 100 * covered.length / 27 && value.coverage.observationCount === observationCount && value.coverage.regionWideValueCount === regionWideValueCount, `${label} inconsistent coverage counts`);
  for (let index = 0; index < observationCount; index++) requireContext(evidencePointers.has(`${value.candidatePointer}/observations/${index}`), `${label} incomplete evidence pointer sequence`);
}

/** Load only frozen audited context; never prepare data, aggregate values, or invoke CORE. */
export function buildRegionContext2023(regions: readonly RegionIdentity2023[]): ReadonlyMap<string, readonly CivxContextItem2023[]> {
  sameIds(regions.map((region) => region.id), canonicalIds, "registry IDs");
  requireContext(catalog.version === 1 && catalog.scope === "CONTEXT" && catalog.status === "AUDITED_CONTEXT_NOT_INTEGRATED" && catalog.totalCivxRegions === 27 && catalog.coreScoreAffected === false && catalog.coreInsightsModified === false && catalog.normalizationApplied === false && catalog.crossDatasetRankingGenerated === false, "invalid catalog boundary metadata");
  const accepted = catalog.summary.domains.flatMap((domain) => domain.candidates.filter((candidate) => candidate.decision !== "REJECT"));
  sameIds(accepted.map((candidate) => candidate.datasetId), [...artifacts.keys()], "accepted dataset IDs");
  requireContext(catalog.summary.preparedDatasets === 7 && catalog.summary.acceptedDatasets === 1 && catalog.summary.partialDatasets === 6, "invalid catalog accepted counts");
  const result = new Map<string, CivxContextItem2023[]>(regions.map((region) => [region.id, []]));
  let totalObservations = 0;
  for (const candidate of accepted) {
    const artifact = artifacts.get(candidate.datasetId);
    validateDataset(artifact, regions);
    const artifactPath = `data/processed/context/${artifact.datasetId}.json`;
    const catalogCandidate = catalog.candidates.find((entry) => entry.datasetId === artifact.datasetId);
    requireContext(candidate.artifactPath === artifactPath && catalogCandidate?.artifactPath === artifactPath, `${artifact.datasetId} artifact path mismatch`);
    requireContext(candidate.decision === artifact.decision && candidate.referencePeriod === artifact.referencePeriod && candidate.coverageCount === artifact.coverage.regionCount, `${artifact.datasetId} catalog summary mismatch`);
    requireContext(catalogCandidate !== undefined && catalogCandidate.rawAuditPath === artifact.rawAuditPath && catalogCandidate.evidencePointer === artifact.candidatePointer && catalogCandidate.observationCount === artifact.coverage.observationCount, `${artifact.datasetId} catalog evidence mismatch`);
    for (const key of ["domain", "title", "publisher", "sourceUrl", "referencePeriod", "publicationDate", "sourceType", "updateFrequency", "missingness", "machineReadable", "reproducible", "geographicLevel", "unit", "definition", "numerator", "denominator", "measurementMethod", "licenseOrUsageNotes", "decision", "regionalAggregation", "comparability", "temporalWarning", "limitations", "knownBiases", "safeStatements", "unsafeStatements", "statementTemplates"] as const) {
      requireContext(JSON.stringify(artifact[key]) === JSON.stringify(catalogCandidate[key]), `${artifact.datasetId} metadata differs from catalog: ${key}`);
    }
    requireContext(artifact.sources.length === catalogCandidate.sourceRefs.length && artifact.sources.every((source) => catalogCandidate.sourceRefs.includes(source.sourceId)), `${artifact.datasetId} source references differ from catalog`);
    const { records, ...metadata } = artifact;
    const dataset: CivxContextDataset2023 = { ...metadata, artifactPath };
    for (const record of records) {
      const items = result.get(record.regionId);
      requireContext(items !== undefined, `${artifact.datasetId} unknown region`);
      items.push({ scope: "CONTEXT", dataset, record });
    }
    totalObservations += artifact.coverage.observationCount;
  }
  requireContext(totalObservations === catalog.summary.observations, "catalog observation total mismatch");
  return result;
}
