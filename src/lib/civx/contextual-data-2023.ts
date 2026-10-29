export type ContextDomain2023 = "traffic" | "transport" | "crime" | "air_pollution";
export type ContextDecision2023 = "ACCEPT_CONTEXT" | "PARTIAL_CONTEXT" | "REJECT";

export interface ContextRegion2023 {
  readonly id: string;
  readonly name: string;
}

export interface ContextSource2023 {
  readonly sourceId: string;
  readonly url: string;
  readonly publisher: string;
  readonly title: string;
  readonly accessedAt: string;
  readonly publicationDate: string | null;
  readonly httpStatus: number | null;
  readonly representation: string;
  readonly evidence: string;
  readonly excerpts: readonly string[];
  readonly retrievalMethod: string;
  readonly contentSha256: string | null;
}

export interface ContextGeography2023 {
  readonly sourceRegionId: string | null;
  readonly sourceRegionName: string;
  readonly regionId: string | null;
  readonly regionName: string | null;
  readonly mappingStatus: "exact" | "site_association" | "unresolved";
}

export interface ContextObservation2023 {
  readonly observationId: string;
  readonly regionId: string;
  readonly regionName: string;
  readonly geographicLevel: string;
  readonly siteId: string | null;
  readonly siteName: string | null;
  readonly period: string;
  readonly value: number;
  readonly unit: string;
  readonly sourceRef: string;
  readonly sourceLocator: string;
  readonly sourceValue: number | string;
  readonly transformation: string;
  readonly limitations: readonly string[];
}

export interface ContextCandidate2023 {
  readonly datasetId: string;
  readonly domain: ContextDomain2023;
  readonly title: string;
  readonly publisher: string;
  readonly sourceUrl: string;
  readonly sourceType: "official_open_data" | "official_statistics" | "official_agency" | "research" | "commercial" | "crowdsourced";
  readonly referencePeriod: string | null;
  readonly publicationDate: string | null;
  readonly geographicLevel: string;
  readonly regionsAvailable: readonly ContextGeography2023[];
  readonly coverageCount: number;
  readonly coveragePercent: number;
  readonly unit: string | null;
  readonly definition: string;
  readonly numerator: string | null;
  readonly denominator: string | null;
  readonly measurementMethod: string;
  readonly missingness: string;
  readonly updateFrequency: string | null;
  readonly licenseOrUsageNotes: string;
  readonly machineReadable: boolean;
  readonly reproducible: boolean;
  readonly comparability: {
    readonly status: "comparable_admin_panel" | "within_source_partial" | "not_comparable";
    readonly reason: string;
    readonly comparisonPermitted: boolean;
  };
  readonly knownBiases: readonly string[];
  readonly limitations: readonly string[];
  readonly recommendedUse: string;
  readonly decision: ContextDecision2023;
  readonly decisionReason: string;
  readonly safeStatements: readonly string[];
  readonly unsafeStatements: readonly string[];
  readonly statementTemplates: readonly string[];
  readonly temporalWarning: string;
  readonly sourceRefs: readonly string[];
  readonly regionalAggregation: "source_published_region_value" | "none";
  readonly observations: readonly ContextObservation2023[];
}

export interface ContextDomainAudit2023 {
  readonly auditId: string;
  readonly domain: ContextDomain2023;
  readonly accessedAt: string;
  readonly sources: readonly ContextSource2023[];
  readonly candidates: readonly ContextCandidate2023[];
}

export interface PreparedContextObservation2023 extends ContextObservation2023 {
  readonly evidencePointer: string;
}

export interface ContextRecord2023 {
  readonly regionId: string;
  readonly regionName: string;
  readonly referencePeriod: string;
  readonly value: number | null;
  readonly valueStatus: "published_region_value" | "site_observations_only" | "missing";
  readonly missingReason: string | null;
  readonly observations: readonly PreparedContextObservation2023[];
}

export interface ContextDataset2023 {
  readonly datasetId: string;
  readonly version: 1;
  readonly scope: "CONTEXT";
  readonly coreScoreAffected: false;
  readonly normalizationApplied: false;
  readonly domain: ContextDomain2023;
  readonly title: string;
  readonly publisher: string;
  readonly sourceUrl: string;
  readonly referencePeriod: string;
  readonly publicationDate: string | null;
  readonly sourceType: ContextCandidate2023["sourceType"];
  readonly updateFrequency: string | null;
  readonly missingness: string;
  readonly machineReadable: boolean;
  readonly reproducible: boolean;
  readonly geographicLevel: string;
  readonly unit: string;
  readonly definition: string;
  readonly numerator: string | null;
  readonly denominator: string | null;
  readonly measurementMethod: string;
  readonly licenseOrUsageNotes: string;
  readonly decision: Exclude<ContextDecision2023, "REJECT">;
  readonly regionalAggregation: ContextCandidate2023["regionalAggregation"];
  readonly comparability: ContextCandidate2023["comparability"];
  readonly temporalWarning: string;
  readonly limitations: readonly string[];
  readonly knownBiases: readonly string[];
  readonly safeStatements: readonly string[];
  readonly unsafeStatements: readonly string[];
  readonly statementTemplates: readonly string[];
  readonly coverage: {
    readonly regionCount: number;
    readonly totalCivxRegions: 27;
    readonly coveragePercent: number;
    readonly coveredRegionIds: readonly string[];
    readonly missingRegionIds: readonly string[];
    readonly observationCount: number;
    readonly regionWideValueCount: number;
  };
  readonly sources: readonly ContextSource2023[];
  readonly records: readonly ContextRecord2023[];
  readonly rawAuditPath: string;
  readonly candidatePointer: string;
}

function requireContext(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`CIVX context audit: ${message}`);
}
function text(value: unknown, label: string): asserts value is string {
  requireContext(typeof value === "string" && value.trim().length > 0, `${label} must be nonempty text`);
}
function array(value: unknown, label: string): void {
  requireContext(Array.isArray(value), `${label} must be an array`);
}
function texts(values: readonly string[], label: string): void {
  array(values, label);
  for (const value of values) text(value, label);
}
function nullableText(value: unknown, label: string): void {
  if (value !== null) text(value, label);
}
function unique(values: readonly string[], label: string): void {
  requireContext(new Set(values).size === values.length, `duplicate ${label}`);
}

/** Reject credential-shaped captures without printing a potentially sensitive match. */
export function assertNoContextCredentials2023(content: string): void {
  const patterns = [
    /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
    /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
    /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
    /\bAIza[A-Za-z0-9_-]{30,}\b/,
    /\bsk-[A-Za-z0-9_-]{20,}\b/,
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\beyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\b/,
    /[?&](?:access_token|api_key|apikey|auth_token|session_token|signature|x-amz-signature)=[^\s&#"\\]+/i,
    /["'](?:authorization|cookie|set-cookie|access_token|refresh_token|api_key|client_secret|password)["']\s*:\s*["'][^"']+/i,
  ];
  requireContext(!patterns.some((pattern) => pattern.test(content)), "credential-like material detected; remove captured secret before generation or commit");
}

function sourceUrl(value: string): void {
  text(value, "source URL");
  const url = new URL(value);
  requireContext(["https:", "http:"].includes(url.protocol) && url.username === "" && url.password === "", "source must use a public HTTP(S) URL without credentials");
}

/** Validate audit decisions and evidence. This module never imports a CORE scorer or insight engine. */
export function assertContextAudits2023(audits: readonly ContextDomainAudit2023[], regions: readonly ContextRegion2023[]): void {
  array(audits, "domain audits");
  requireContext(regions.length === 27, "exactly 27 registry regions required");
  const expectedIds = [...Array.from({ length: 18 }, (_, index) => String(3201 + index)), ...Array.from({ length: 9 }, (_, index) => String(3271 + index))];
  requireContext(regions.every((region, index) => region.id === expectedIds[index]), "frozen BPS registry order required");
  const registry = new Map(regions.map((region) => [region.id, region.name]));
  const datasetIds: string[] = [];
  const sourceIds: string[] = [];
  unique(audits.map((audit) => audit.domain), "audit domain");
  for (const audit of audits) {
    text(audit.auditId, "audit ID");
    requireContext(["traffic", "transport", "crime", "air_pollution"].includes(audit.domain), "unknown contextual domain");
    text(audit.accessedAt, "audit access date");
    array(audit.sources, "sources");
    array(audit.candidates, "candidates");
    const sources = new Map(audit.sources.map((source) => [source.sourceId, source]));
    for (const source of audit.sources) {
      sourceIds.push(source.sourceId);
      for (const key of ["sourceId", "publisher", "title", "accessedAt", "representation", "evidence", "retrievalMethod"] as const) text(source[key], `source ${key}`);
      sourceUrl(source.url);
      nullableText(source.publicationDate, "source publication date");
      requireContext(source.httpStatus === null || (Number.isInteger(source.httpStatus) && source.httpStatus >= 100 && source.httpStatus <= 599), "invalid source HTTP status");
      requireContext(source.contentSha256 === null || /^[a-f0-9]{64}$/.test(source.contentSha256), "invalid source hash");
      texts(source.excerpts, "source excerpts");
    }
    for (const candidate of audit.candidates) {
      datasetIds.push(candidate.datasetId);
      requireContext(/^context_[a-z0-9_]+$/.test(candidate.datasetId), "invalid contextual dataset ID");
      requireContext(candidate.domain === audit.domain, "candidate domain mismatch");
      for (const key of ["title", "publisher", "geographicLevel", "definition", "measurementMethod", "missingness", "licenseOrUsageNotes", "recommendedUse", "decisionReason", "temporalWarning"] as const) text(candidate[key], `candidate ${key}`);
      sourceUrl(candidate.sourceUrl);
      requireContext(["official_open_data", "official_statistics", "official_agency", "research", "commercial", "crowdsourced"].includes(candidate.sourceType), "unknown source type");
      for (const key of ["referencePeriod", "publicationDate", "unit", "numerator", "denominator", "updateFrequency"] as const) nullableText(candidate[key], key);
      for (const key of ["knownBiases", "limitations", "safeStatements", "unsafeStatements", "statementTemplates", "sourceRefs"] as const) texts(candidate[key], key);
      requireContext(candidate.sourceRefs.length > 0 && candidate.sourceRefs.every((id) => sources.has(id)), "unresolved candidate source reference");
      requireContext(typeof candidate.machineReadable === "boolean" && typeof candidate.reproducible === "boolean", "invalid reproducibility flags");
      requireContext(["ACCEPT_CONTEXT", "PARTIAL_CONTEXT", "REJECT"].includes(candidate.decision), "unknown candidate decision");
      requireContext(["source_published_region_value", "none"].includes(candidate.regionalAggregation), "unknown regional aggregation");
      requireContext(["comparable_admin_panel", "within_source_partial", "not_comparable"].includes(candidate.comparability.status), "unknown comparability status");
      text(candidate.comparability.reason, "comparability reason");
      requireContext(typeof candidate.comparability.comparisonPermitted === "boolean", "invalid comparison flag");
      requireContext(candidate.comparability.status !== "not_comparable" || !candidate.comparability.comparisonPermitted, "incomparable panel cannot permit comparisons");
      array(candidate.regionsAvailable, "source geography");
      const mappedRegions = new Set<string>();
      for (const geography of candidate.regionsAvailable) {
        text(geography.sourceRegionName, "source geography name");
        nullableText(geography.sourceRegionId, "source geography ID");
        requireContext(["exact", "site_association", "unresolved"].includes(geography.mappingStatus), "unknown geography mapping status");
        if (geography.mappingStatus === "unresolved") {
          requireContext(geography.regionId === null && geography.regionName === null, "unresolved geography must not invent a BPS mapping");
        } else {
          requireContext(typeof geography.regionId === "string" && registry.has(geography.regionId) && registry.get(geography.regionId) === geography.regionName, "invalid BPS source geography mapping");
          mappedRegions.add(geography.regionId);
          requireContext(candidate.regionalAggregation !== "source_published_region_value" || geography.mappingStatus === "exact", "site association is not regional representation");
        }
      }
      array(candidate.observations, "observations");
      unique(candidate.observations.map((observation) => observation.observationId), "observation ID");
      const observedRegions = new Set<string>();
      for (const observation of candidate.observations) {
        for (const key of ["observationId", "geographicLevel", "period", "unit", "sourceRef", "sourceLocator", "transformation"] as const) text(observation[key], `observation ${key}`);
        requireContext(typeof observation.regionId === "string" && registry.has(observation.regionId) && registry.get(observation.regionId) === observation.regionName && mappedRegions.has(observation.regionId), "unknown or unmapped observation region");
        requireContext(typeof observation.value === "number" && Number.isFinite(observation.value), "accepted observations must be finite numbers, never null or symbols");
        requireContext(observation.unit === candidate.unit, "mixed observation units");
        requireContext(sources.has(observation.sourceRef) && candidate.sourceRefs.includes(observation.sourceRef), "unresolved observation source reference");
        requireContext(typeof observation.sourceValue === "number" ? Number.isFinite(observation.sourceValue) : typeof observation.sourceValue === "string" && observation.sourceValue.trim().length > 0, "missing original source value");
        if (observation.transformation === "none") requireContext(Number(observation.sourceValue) === observation.value, "untransformed value differs from source value");
        nullableText(observation.siteId, "site ID");
        nullableText(observation.siteName, "site name");
        texts(observation.limitations, "observation limitations");
        requireContext(candidate.regionalAggregation !== "source_published_region_value" || !observedRegions.has(observation.regionId), "duplicate region in regional panel");
        observedRegions.add(observation.regionId);
      }
      requireContext(candidate.coverageCount === observedRegions.size, "coverage count differs from verified observations");
      requireContext(candidate.coveragePercent === 100 * observedRegions.size / 27, "coverage percentage differs from verified observations");
      if (candidate.decision === "REJECT") {
        requireContext(candidate.observations.length === 0, "rejected candidate must not publish observations");
      } else {
        text(candidate.referencePeriod, "accepted reference period");
        text(candidate.unit, "accepted unit");
        requireContext(candidate.reproducible && candidate.observations.length > 0, "accepted dataset needs reproducible observations");
        requireContext(candidate.safeStatements.length > 0 && candidate.unsafeStatements.length > 0 && candidate.statementTemplates.length > 0, "accepted dataset needs safe/unsafe uses and statement templates");
        if (candidate.decision === "ACCEPT_CONTEXT") requireContext(observedRegions.size === 27 && candidate.regionalAggregation === "source_published_region_value" && candidate.comparability.status === "comparable_admin_panel", "full context requires a complete defensible administrative panel");
      }
    }
  }
  unique(datasetIds, "dataset ID");
  unique(sourceIds, "source ID");
}

/** Prepare all 27 regional slots without inventing missing observations or regional means. */
export function prepareContextDataset2023(
  candidate: ContextCandidate2023,
  audit: ContextDomainAudit2023,
  regions: readonly ContextRegion2023[],
  rawAuditPath: string,
  candidateIndex: number,
): ContextDataset2023 {
  requireContext(candidate.decision !== "REJECT" && candidate.referencePeriod !== null && candidate.unit !== null, "cannot prepare a rejected or incomplete candidate");
  const candidatePointer = `/candidates/${candidateIndex}`;
  const records = regions.map((region): ContextRecord2023 => {
    const observations = candidate.observations.flatMap((observation, index) => observation.regionId === region.id ? [{
      ...observation,
      limitations: [...observation.limitations],
      evidencePointer: `${candidatePointer}/observations/${index}`,
    }] : []);
    const hasRegionalValue = candidate.regionalAggregation === "source_published_region_value" && observations.length === 1;
    return {
      regionId: region.id,
      regionName: region.name,
      referencePeriod: candidate.referencePeriod!,
      value: hasRegionalValue ? observations[0].value : null,
      valueStatus: hasRegionalValue ? "published_region_value" : observations.length > 0 ? "site_observations_only" : "missing",
      missingReason: hasRegionalValue ? null : observations.length > 0
        ? "No representative kabupaten/kota value is asserted; use the source site/segment observations only."
        : "No verified usable observation for this region in this dataset; not zero or proof of absence.",
      observations,
    };
  });
  const coveredRegionIds = records.filter((record) => record.observations.length > 0).map((record) => record.regionId);
  return {
    datasetId: candidate.datasetId,
    version: 1,
    scope: "CONTEXT",
    coreScoreAffected: false,
    normalizationApplied: false,
    domain: candidate.domain,
    title: candidate.title,
    publisher: candidate.publisher,
    sourceUrl: candidate.sourceUrl,
    referencePeriod: candidate.referencePeriod,
    publicationDate: candidate.publicationDate,
    sourceType: candidate.sourceType,
    updateFrequency: candidate.updateFrequency,
    missingness: candidate.missingness,
    machineReadable: candidate.machineReadable,
    reproducible: candidate.reproducible,
    geographicLevel: candidate.geographicLevel,
    unit: candidate.unit,
    definition: candidate.definition,
    numerator: candidate.numerator,
    denominator: candidate.denominator,
    measurementMethod: candidate.measurementMethod,
    licenseOrUsageNotes: candidate.licenseOrUsageNotes,
    decision: candidate.decision,
    regionalAggregation: candidate.regionalAggregation,
    comparability: { ...candidate.comparability },
    temporalWarning: candidate.temporalWarning,
    limitations: [...candidate.limitations],
    knownBiases: [...candidate.knownBiases],
    safeStatements: [...candidate.safeStatements],
    unsafeStatements: [...candidate.unsafeStatements],
    statementTemplates: [...candidate.statementTemplates],
    coverage: {
      regionCount: coveredRegionIds.length,
      totalCivxRegions: 27,
      coveragePercent: 100 * coveredRegionIds.length / 27,
      coveredRegionIds,
      missingRegionIds: records.filter((record) => record.observations.length === 0).map((record) => record.regionId),
      observationCount: candidate.observations.length,
      regionWideValueCount: records.filter((record) => record.valueStatus === "published_region_value").length,
    },
    sources: audit.sources.filter((source) => candidate.sourceRefs.includes(source.sourceId)).map((source) => ({ ...source, excerpts: [...source.excerpts] })),
    records,
    rawAuditPath,
    candidatePointer,
  };
}
