import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { assertNoContextCredentials2023 as assertNoCapturedCredentials } from "../src/lib/civx/contextual-data-2023.ts";

const root = new URL("../", import.meta.url);
const protocolPath = "data/raw/freshness-audit-2024-2026/protocol.json";
const conclusionPath = "data/raw/freshness-audit-2024-2026/conclusion.json";
const jsonPath = "data/processed/freshness-audit-2024-2026.json";
const csvPath = "data/processed/freshness-audit-2024-2026.csv";
export const FRESHNESS_STATUSES = ["COMPATIBLE_CANDIDATE", "COMPATIBLE_WITH_CAVEAT", "PARTIAL", "NOT_COMPARABLE", "NOT_VERIFIED", "NOT_FOUND"];
const years = [2024, 2025, 2026];
const compatible = status => status === "COMPATIBLE_CANDIDATE" || status === "COMPATIBLE_WITH_CAVEAT";
const finite = value => typeof value === "number" && Number.isFinite(value);
function text(value, label) {
  assert(typeof value === "string" && value.trim().length > 0, `${label}: nonempty text required`);
}
function nullableText(value, label) {
  if (value !== null) text(value, label);
}
function texts(value, label) {
  assert(Array.isArray(value), `${label}: array required`);
  value.forEach(item => text(item, label));
}
function unique(values, label) {
  assert.equal(new Set(values).size, values.length, `DUPLICATE_${label}`);
}
function sourceNumberMatches(sourceValue, value, source) {
  if (finite(sourceValue)) return sourceValue === value;
  if (typeof sourceValue !== "string" || sourceValue.trim() === "") return false;
  const token = sourceValue.trim().replace(/[\s\u00a0]/g, "");
  if (value === 0 && source?.symbolDefinitions?.zero?.includes(token)) {
    text(source.symbolDefinitions.zeroLocator, "publisher zero-symbol definition");
    return true;
  }
  const grouped = /^-?[1-9]\d{0,2}(?:\.\d{3})+(?:,\d+)?$/;
  if (source?.numberFormat === "decimal_comma_dot_thousands") {
    if (!/^-?\d+(?:,\d+)?$/.test(token) && !grouped.test(token)) return false;
    return Number(token.replaceAll(".", "").replace(",", ".")) === value;
  }
  // A single dot followed by three digits is ambiguous without a declared source format.
  if (grouped.test(token) && !token.includes(",") && token.indexOf(".") === token.lastIndexOf(".")) return false;
  if (/^-?\d+(?:\.\d+)?$/.test(token) && Number(token) === value) return true;
  if (/^-?\d+(?:,\d+)?$/.test(token) && Number(token.replace(",", ".")) === value) return true;
  if (/^-?[1-9]\d{0,2}(?:\.\d{3})+(?:,\d+)?$/.test(token) && Number(token.replaceAll(".", "").replace(",", ".")) === value) return true;
  return false;
}
function validateComponent(component, sources, candidate) {
  assert(component && typeof component === "object", "MISSING_DERIVATION_COMPONENT");
  assert(finite(component.value), "NONFINITE_DERIVATION_COMPONENT");
  assert(sourceNumberMatches(component.sourceValue, component.value, sources.get(component.sourceRef)), "DERIVATION_SOURCE_TOKEN_MISMATCH");
  text(component.unit, "component unit");
  assert(Number.isInteger(component.referenceYear), "INVALID_COMPONENT_REFERENCE_YEAR");
  assert(sources.has(component.sourceRef) && candidate.sourceRefs.includes(component.sourceRef), "UNRESOLVED_COMPONENT_SOURCE");
  text(component.sourceLocator, "component locator");
  if (compatible(candidate.status)) assert.equal(component.referenceYear, candidate.candidateYear, "MIXED_YEAR_DERIVATION_NOT_COMMON_YEAR");
}

/** Validate researched candidate panels. No normalization, weights or score calculation occurs. */
export function validateFreshnessAudits(audits, frozen) {
  assert(Array.isArray(audits) && audits.length > 0, "MISSING_FRESHNESS_AUDITS");
  const registry = frozen.geography.regions;
  const indicatorIds = frozen.indicators.map(indicator => indicator.indicatorId);
  assert.equal(registry.length, 27);
  assert.equal(indicatorIds.length, 18);
  const expectedRegionIds = [...Array.from({ length: 18 }, (_, index) => String(3201 + index)), ...Array.from({ length: 9 }, (_, index) => String(3271 + index))];
  assert.deepEqual(registry.map(region => region.id), expectedRegionIds, "FROZEN_REGISTRY_CHANGED");
  const claimedIndicators = [];
  const sourceIds = [];
  const candidateIds = [];
  const selected = new Map();
  for (const audit of audits) {
    text(audit.auditId, "audit ID");
    text(audit.accessedAt, "audit access date");
    texts(audit.indicatorIds, "assigned indicators");
    claimedIndicators.push(...audit.indicatorIds);
    assert(audit.indicatorIds.every(id => indicatorIds.includes(id)), "UNKNOWN_ASSIGNED_INDICATOR");
    assert(Array.isArray(audit.sources) && Array.isArray(audit.searchLog) && Array.isArray(audit.candidates), "INCOMPLETE_AUDIT_COLLECTIONS");
    const sources = new Map(audit.sources.map(source => [source.sourceId, source]));
    for (const source of audit.sources) {
      sourceIds.push(source.sourceId);
      for (const key of ["sourceId", "agency", "title", "url", "accessedAt", "retrievalMethod", "evidence", "rightsNotes"]) text(source[key], `source ${key}`);
      const url = new URL(source.url);
      assert(["https:", "http:"].includes(url.protocol) && !url.username && !url.password, "INVALID_PUBLIC_SOURCE_URL");
      assertNoCapturedCredentials(source.url);
      assert(!/web-?api\.bps\.go\.id\/(?:download|cover)\.php\?f=/i.test(source.url), "OPAQUE_BPS_DOWNLOAD_URL_NOT_PERMITTED");
      nullableText(source.publicationDate, "publication date");
      assert(source.releaseYear === null || Number.isInteger(source.releaseYear), "INVALID_RELEASE_YEAR");
      assert(["publication", "table", "api", "methodology", "search_receipt"].includes(source.kind), "UNKNOWN_SOURCE_KIND");
      texts(source.excerpts, "source excerpts");
      assert(source.contentSha256 === null || /^[a-f0-9]{64}$/.test(source.contentSha256), "INVALID_SOURCE_HASH");
    }
    for (const search of audit.searchLog) {
      texts(search.indicatorIds, "search indicators");
      assert(search.indicatorIds.every(id => audit.indicatorIds.includes(id)), "SEARCH_INDICATOR_OUTSIDE_SLICE");
      assert(Array.isArray(search.candidateYears) && search.candidateYears.length > 0 && search.candidateYears.every(year => years.includes(year)), "INVALID_SEARCH_YEARS");
      text(search.queryOrUrl, "search query/URL");
      text(search.outcome, "search outcome");
      texts(search.sourceRefs, "search source references");
      assert(search.sourceRefs.every(id => sources.has(id)), "UNRESOLVED_SEARCH_SOURCE");
    }
    for (const candidate of audit.candidates) {
      candidateIds.push(candidate.candidateId);
      assert(/^[a-z0-9_]+$/.test(candidate.candidateId), "INVALID_CANDIDATE_ID");
      assert(audit.indicatorIds.includes(candidate.indicatorId), "UNKNOWN_CANDIDATE_INDICATOR");
      assert(years.includes(candidate.candidateYear), "INVALID_CANDIDATE_YEAR");
      assert(FRESHNESS_STATUSES.includes(candidate.status), "INVALID_FRESHNESS_STATUS");
      assert(typeof candidate.selectedForYear === "boolean" && typeof candidate.availabilityVerified === "boolean" && typeof candidate.latestContextCandidate === "boolean", "INVALID_CANDIDATE_FLAGS");
      for (const key of ["sourceAgency", "geographicLevel", "methodologyNotes", "comparabilityNotes", "recommendation"]) text(candidate[key], `candidate ${key}`);
      for (const key of ["sourceTitle", "sourceUrlOrLocator", "referencePeriod", "enumerationPeriod", "publicationDate", "unit", "denominator", "numerator", "definition"]) nullableText(candidate[key], key);
      assert(candidate.releaseYear === null || Number.isInteger(candidate.releaseYear), "INVALID_CANDIDATE_RELEASE_YEAR");
      texts(candidate.sourceRefs, "candidate source references");
      assert(candidate.sourceRefs.length > 0 && candidate.sourceRefs.every(id => sources.has(id)), "UNRESOLVED_CANDIDATE_SOURCE");
      texts(candidate.caveats, "candidate caveats");
      texts(candidate.alternativesRejected, "rejected alternatives");
      assert(candidate.reportedCoverageCount === null || (Number.isInteger(candidate.reportedCoverageCount) && candidate.reportedCoverageCount >= 0), "INVALID_REPORTED_COVERAGE");
      const checks = candidate.methodologyChecks;
      assert(checks && typeof checks === "object", "MISSING_METHODOLOGY_CHECKS");
      for (const key of ["constructEquivalent", "denominatorCompatible", "methodContinuity", "geographyCompatible"]) assert(checks[key] === null || typeof checks[key] === "boolean", `INVALID_METHODOLOGY_CHECK_${key}`);
      for (const key of ["referencePeriodVerified", "unitVerified", "sourceReproducible"]) assert(typeof checks[key] === "boolean", `INVALID_METHODOLOGY_CHECK_${key}`);
      assert(candidate.derivation && ["none", "puskesmas_per_100k", "insurance_complement"].includes(candidate.derivation.kind), "INVALID_DERIVATION_KIND");
      nullableText(candidate.derivation.formula, "derivation formula");
      if (candidate.componentAudit !== undefined) {
        assert.equal(candidate.indicatorId, "puskesmas_per_100k", "UNEXPECTED_COMPONENT_AUDIT");
        for (const [kind, panel] of Object.entries(candidate.componentAudit)) {
          assert(["numerator", "denominator"].includes(kind), "UNKNOWN_COMPONENT_PANEL");
          assert.equal(panel.referenceYear, candidate.candidateYear, "COMPONENT_PANEL_YEAR_MISMATCH");
          assert.equal(panel.unit, kind === "numerator" ? "main Puskesmas facilities" : "persons", "COMPONENT_PANEL_UNIT_MISMATCH");
          assert(sources.has(panel.sourceRef) && candidate.sourceRefs.includes(panel.sourceRef), "UNRESOLVED_COMPONENT_PANEL_SOURCE");
          text(panel.sourceLocator, "component panel locator");
          text(panel.definition, "component panel definition");
          assert.equal(panel.observations.length, 27, "COMPONENT_PANEL_REQUIRES_27_SLOTS");
          unique(panel.observations.map(observation => observation.regionId), "COMPONENT_REGION_ID");
          let componentCoverage = 0;
          for (const [index, observation] of panel.observations.entries()) {
            assert.equal(observation.regionId, registry[index].id, "INVALID_COMPONENT_BPS_REGION");
            assert.equal(observation.regionName, registry[index].name, "INVALID_COMPONENT_BPS_NAME");
            if (observation.value === null) {
              text(observation.missingReason, "missing component reason");
              for (const key of ["sourceValue", "sourceRef", "sourceLocator", "components"]) assert.equal(observation[key], null, "MISSING_COMPONENT_MUST_BE_EXPLICIT_NULL");
            } else {
              componentCoverage++;
              assert(Number.isInteger(observation.value) && observation.value >= (kind === "denominator" ? 1 : 0), "INVALID_EXACT_COMPONENT_VALUE");
              assert.equal(observation.sourceRef, panel.sourceRef, "COMPONENT_PANEL_SOURCE_MISMATCH");
              assert(sourceNumberMatches(observation.sourceValue, observation.value, sources.get(panel.sourceRef)), "COMPONENT_PANEL_SOURCE_TOKEN_MISMATCH");
              text(observation.sourceLocator, "component observation locator");
              assert.equal(observation.missingReason, null, "OBSERVED_COMPONENT_HAS_MISSING_REASON");
            }
          }
          assert.equal(panel.coverageCount, componentCoverage, "COMPONENT_COVERAGE_COUNT_MISMATCH");
        }
        assert(candidate.componentAudit.numerator && candidate.componentAudit.denominator, "BOTH_COMPONENT_PANELS_REQUIRED");
      }
      assert(Array.isArray(candidate.observations) && candidate.observations.length === 27, "EXACTLY_27_REGION_SLOTS_REQUIRED");
      unique(candidate.observations.map(observation => observation.regionId), "REGION_ID");
      let coverage = 0;
      for (const [index, observation] of candidate.observations.entries()) {
        assert.equal(observation.regionId, registry[index].id, "INVALID_BPS_REGION_OR_ORDER");
        assert.equal(observation.regionName, registry[index].name, "INVALID_BPS_REGION_NAME");
        assert([null, "direct", "SAE", "published_estimate", "not_applicable"].includes(observation.estimationMethod), "INVALID_ESTIMATION_METHOD");
        if (observation.uncertainty !== null) {
          text(observation.uncertainty.description, "uncertainty description");
          for (const key of ["lower", "upper", "standardError", "relativeStandardError"]) assert(observation.uncertainty[key] === null || finite(observation.uncertainty[key]), "INVALID_UNCERTAINTY_VALUE");
        }
        if (observation.value === null) {
          text(observation.missingReason, "missing observation reason");
          assert.equal(observation.sourceValue, null, "MISSING_VALUE_MUST_NOT_HAVE_NUMERIC_TOKEN");
          assert.equal(observation.sourceRef, null, "MISSING_OBSERVATION_SOURCE_MUST_BE_NULL");
          assert.equal(observation.sourceLocator, null, "MISSING_OBSERVATION_LOCATOR_MUST_BE_NULL");
          assert.equal(observation.components, null, "MISSING_DERIVED_VALUE_MUST_NOT_HIDE_PARTIAL_COMPONENTS");
          continue;
        }
        coverage++;
        assert(finite(observation.value), "NONFINITE_CANDIDATE_VALUE");
        assert.equal(observation.missingReason, null, "OBSERVED_VALUE_HAS_MISSING_REASON");
        assert(sources.has(observation.sourceRef) && candidate.sourceRefs.includes(observation.sourceRef), "UNRESOLVED_OBSERVATION_SOURCE");
        text(observation.sourceLocator, "observation locator");
        if (candidate.derivation.kind === "none") {
          assert(sourceNumberMatches(observation.sourceValue, observation.value, sources.get(observation.sourceRef)), "OBSERVATION_SOURCE_TOKEN_MISMATCH");
          assert.equal(observation.components, null, "UNEXPECTED_DERIVATION_COMPONENTS");
        } else {
          const components = observation.components;
          assert(components && typeof components === "object", "MISSING_DERIVATION_COMPONENTS");
          validateComponent(components.numerator, sources, candidate);
          validateComponent(components.denominator, sources, candidate);
          if (candidate.derivation.kind === "puskesmas_per_100k") {
            assert.equal(candidate.indicatorId, "puskesmas_per_100k");
            assert(Number.isInteger(components.numerator.value) && components.numerator.value >= 0, "INVALID_MAIN_PUSKESMAS_COUNT");
            assert(Number.isInteger(components.denominator.value) && components.denominator.value > 0, "EXACT_PERSON_POPULATION_REQUIRED");
            const expected = components.numerator.value / components.denominator.value * 100000;
            assert(Math.abs(observation.value - expected) <= 1e-12 * Math.max(1, Math.abs(expected)), "PUSKESMAS_RATE_COMPONENT_MISMATCH");
          } else {
            assert.equal(candidate.indicatorId, "health_insurance_ownership");
            assert(components.numerator.value >= 0 && components.numerator.value <= 100, "INVALID_NO_INSURANCE_PERCENT");
            assert.equal(components.denominator.value, 100, "INSURANCE_COMPLEMENT_CONSTANT_CHANGED");
            // Source precision is preserved; tolerate only binary representation of the complement.
            assert(Math.abs(observation.value - (100 - components.numerator.value)) <= 1e-10, "INSURANCE_COMPLEMENT_MISMATCH");
          }
        }
      }
      assert.equal(candidate.coverageCount, coverage, "COVERAGE_COUNT_MISMATCH");
      if (compatible(candidate.status) || candidate.status === "PARTIAL") {
        assert(candidate.availabilityVerified, "COMPATIBLE_AVAILABILITY_NOT_VERIFIED");
        for (const key of ["sourceTitle", "sourceUrlOrLocator", "referencePeriod", "unit", "denominator", "definition"]) text(candidate[key], `verified ${key}`);
        for (const key of ["referencePeriodVerified", "unitVerified", "sourceReproducible", "geographyCompatible"]) assert.equal(checks[key], true, `VERIFIED_CANDIDATE_CHECK_FAILED_${key}`);
      }
      if (compatible(candidate.status)) {
        assert.equal(coverage, 27, "FULL_COMPATIBILITY_REQUIRES_27_OBSERVATIONS");
        assert.equal(checks.constructEquivalent, true, "CONSTRUCT_NOT_COMPATIBLE");
        assert.equal(checks.denominatorCompatible, true, "DENOMINATOR_NOT_COMPATIBLE");
        assert.equal(candidate.unit, frozen.indicators.find(indicator => indicator.indicatorId === candidate.indicatorId).unit, "COMPATIBLE_UNIT_CHANGED");
        if (candidate.status === "COMPATIBLE_CANDIDATE") assert.equal(checks.methodContinuity, true, "STRICT_COMPATIBILITY_REQUIRES_METHOD_CONTINUITY");
        else assert(candidate.caveats.length > 0, "CAVEAT_STATUS_WITHOUT_CAVEAT");
      }
      if (candidate.status === "PARTIAL") assert(coverage > 0 && coverage < 27, "PARTIAL_REQUIRES_1_TO_26_OBSERVATIONS");
      if (candidate.status === "NOT_FOUND") {
        assert.equal(coverage, 0, "NOT_FOUND_HAS_OBSERVATIONS");
        assert.equal(candidate.availabilityVerified, false, "NOT_FOUND_HAS_VERIFIED_AVAILABILITY");
        assert(audit.searchLog.some(search => search.indicatorIds.includes(candidate.indicatorId) && search.candidateYears.includes(candidate.candidateYear)), "NOT_FOUND_WITHOUT_SEARCH_EVIDENCE");
      }
      if (candidate.selectedForYear) {
        const key = `${candidate.indicatorId}:${candidate.candidateYear}`;
        assert(!selected.has(key), "DUPLICATE_SELECTED_INDICATOR_YEAR");
        selected.set(key, candidate);
      }
    }
    for (const id of audit.indicatorIds) for (const year of years) assert(selected.has(`${id}:${year}`), "MISSING_SELECTED_INDICATOR_YEAR");
  }
  unique(claimedIndicators, "ASSIGNED_INDICATOR");
  unique(sourceIds, "SOURCE_ID");
  unique(candidateIds, "CANDIDATE_ID");
  assert.deepEqual([...claimedIndicators].sort(), [...indicatorIds].sort(), "ALL_18_INDICATORS_REQUIRED");
  return indicatorIds.flatMap(id => years.map(year => selected.get(`${id}:${year}`)));
}

export function assessCommonYears(selected) {
  return years.map(year => {
    const rows = selected.filter(candidate => candidate.candidateYear === year);
    assert.equal(rows.length, 18, "COMMON_YEAR_REQUIRES_18_SELECTED_ROWS");
    const strict = rows.filter(candidate => candidate.status === "COMPATIBLE_CANDIDATE");
    const caveat = rows.filter(candidate => candidate.status === "COMPATIBLE_WITH_CAVEAT");
    const full = [...strict, ...caveat];
    return {
      year,
      totalIndicators: 18,
      fullCompatibleIndicators: strict.length,
      fullCompatibleWithCaveatIndicators: caveat.length,
      defensibleFullCoverageIndicators: full.length,
      strictCompatibleRegionObservations: strict.reduce((sum, row) => sum + row.coverageCount, 0),
      fullCoverageRegionObservationsIncludingCaveats: full.reduce((sum, row) => sum + row.coverageCount, 0),
      retainedCandidateObservations: rows.reduce((sum, row) => sum + row.coverageCount, 0),
      missingCandidateRegionSlots: rows.reduce((sum, row) => sum + 27 - row.coverageCount, 0),
      minimumOtherYearIndicatorsIfUsingFrozen2023ForEveryGap: 18 - full.length,
      compatibleIndicatorIds: strict.map(row => row.indicatorId),
      caveatIndicatorIds: caveat.map(row => row.indicatorId),
      blockers: rows.filter(row => !compatible(row.status)).map(row => ({ indicatorId: row.indicatorId, status: row.status, coverageCount: row.coverageCount, reason: row.comparabilityNotes })),
      statusCounts: Object.fromEntries(FRESHNESS_STATUSES.map(status => [status, rows.filter(row => row.status === status).length])),
      interpretation: "Coverage is audit evidence, not model approval. The other-year count is a hypothetical minimum fallback count, not a generated mixed-year dataset or a claim that any hybrid is methodologically valid.",
    };
  });
}

function csvCell(value) {
  const text = value === null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
export function serializeFreshnessCsv(matrix) {
  const columns = ["dimension", "indicator_id", "indicator_name", "frozen_reference_year", "candidate_year", "status", "coverage_count", "coverage_total", "unit", "denominator", "source_agency", "source_title", "source_url_or_locator", "reference_period", "enumeration_period", "publication_date", "release_year", "methodology_notes", "comparability_notes", "missing_regions", "recommendation"];
  return `${columns.join(",")}\n${matrix.map(row => columns.map(column => csvCell(row[column])).join(",")).join("\n")}\n`;
}

/** Offline reproduction of an audit, not acquisition, normalization or a new CIVX model. */
export function runFreshnessAudit(args = process.argv.slice(2)) {
  assert(args.every(argument => argument === "--check"), "Only --check is supported");
  const bytes = path => readFileSync(new URL(path, root));
  const hash = content => createHash("sha256").update(content).digest("hex");
  const load = path => JSON.parse(bytes(path));
  const receipt = path => { const content = bytes(path); return { path, sha256: hash(content), bytes: content.length }; };
  const protocol = load(protocolPath);
  assert.equal(protocol.auditId, "civx-freshness-audit-2024-2026");
  assert.equal(protocol.scope, "RESEARCH_AUDIT_ONLY");
  assert.deepEqual(protocol.candidateYears, years);
  for (const key of ["createNewScores", "changeNormalization", "changeWeighting", "modify2023Insights", "modifyContextualArtifacts", "frontendIntegration", "imputation", "interpolation", "syntheticObservations"]) assert.equal(protocol.policy[key], false);
  const protectedManifest = protocol.baselineManifest.map(expected => {
    const actual = receipt(expected.path);
    assert.equal(actual.sha256, expected.sha256, `BASELINE_CHANGED: ${expected.path}`);
    assert.equal(actual.bytes, expected.bytes, `BASELINE_SIZE_CHANGED: ${expected.path}`);
    return actual;
  });
  unique(protectedManifest.map(entry => entry.path), "BASELINE_PATH");
  const score = protectedManifest.find(entry => entry.path === "data/processed/civx-scores-2023.json");
  const insights = protectedManifest.find(entry => entry.path === "data/processed/civx-insights-2023.json");
  assert.equal(score?.sha256, "47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5");
  assert.equal(insights?.sha256, "ffd92543c6387c981d2647c8ed55bd3abb7f7c4e9b5b91d4a74fab81999d6345");
  const frozen = load(protocol.frozenContractPath);
  const audits = protocol.rawAuditPaths.map(load);
  const rawSnapshot = JSON.stringify(audits);
  const selected = validateFreshnessAudits(audits, frozen);
  const commonYearAssessment = assessCommonYears(selected);
  const conclusion = load(conclusionPath);
  assert(["RECOMMEND_2024_CANDIDATE_MODEL", "RECOMMEND_2025_CANDIDATE_MODEL", "KEEP_2023_AS_ONLY_FULL_MODEL", "MORE_AUDIT_REQUIRED"].includes(conclusion.recommendation), "INVALID_COMMON_YEAR_RECOMMENDATION");
  text(conclusion.rationale, "conclusion rationale");
  texts(conclusion.nextSteps, "conclusion next steps");
  if (conclusion.recommendation.startsWith("RECOMMEND_")) {
    const year = conclusion.recommendation.includes("2024") ? 2024 : 2025;
    assert.equal(commonYearAssessment.find(item => item.year === year).defensibleFullCoverageIndicators, 18, "RECOMMENDED_YEAR_NOT_COMPLETE");
  }
  const matrix = selected.map(candidate => {
    const baseline = frozen.indicators.find(indicator => indicator.indicatorId === candidate.indicatorId);
    return {
      dimension: baseline.dimensionId, indicator_id: baseline.indicatorId, indicator_name: baseline.displayName,
      frozen_reference_year: 2023, candidate_year: candidate.candidateYear, status: candidate.status,
      coverage_count: candidate.coverageCount, coverage_total: 27, unit: candidate.unit, denominator: candidate.denominator,
      source_agency: candidate.sourceAgency, source_title: candidate.sourceTitle, source_url_or_locator: candidate.sourceUrlOrLocator,
      reference_period: candidate.referencePeriod, enumeration_period: candidate.enumerationPeriod, publication_date: candidate.publicationDate,
      release_year: candidate.releaseYear, methodology_notes: candidate.methodologyNotes, comparability_notes: candidate.comparabilityNotes,
      missing_regions: candidate.observations.filter(observation => observation.value === null).map(observation => observation.regionId),
      recommendation: candidate.recommendation, candidate_id: candidate.candidateId,
    };
  });
  const candidates = audits.flatMap(audit => audit.candidates);
  const sourceManifest = [protocolPath, ...protocol.rawAuditPaths, conclusionPath].map(receipt);
  const computationManifest = ["scripts/audit-freshness-2024-2026.mjs"].map(receipt);
  const output = {
    auditId: protocol.auditId, version: 1, scope: "RESEARCH_AUDIT_ONLY", accessedAt: protocol.accessedAt,
    frozenReferenceYear: 2023, candidateYears: years, coreModified: false, contextModified: false, frontendModified: false,
    newScoreGenerated: false, normalizationApplied: false, weightsAssigned: false,
    interpretation: "Newer observations, compatible candidate panels and an approved common-year model are different states. This audit does not create a scoring model, change the frozen baseline or integrate any candidate into production.",
    registry: frozen.geography.regions, frozenIndicators: frozen.indicators.map(indicator => ({ indicatorId: indicator.indicatorId, dimensionId: indicator.dimensionId, displayName: indicator.displayName, referenceYear: indicator.year, unit: indicator.unit, definition: indicator.definition, denominator: indicator.denominator, pressureDirection: indicator.civxPressureDirection })),
    sources: audits.flatMap(audit => audit.sources), searchLog: audits.flatMap(audit => audit.searchLog), candidates, coverageMatrix: matrix,
    latestByIndicator: frozen.indicators.map(indicator => {
      const rows = selected.filter(candidate => candidate.indicatorId === indicator.indicatorId);
      const verified = [...rows].reverse().find(candidate => candidate.availabilityVerified);
      const full = [...rows].reverse().find(candidate => compatible(candidate.status));
      return { indicatorId: indicator.indicatorId, newestVerifiedCandidate: verified ? { year: verified.candidateYear, candidateId: verified.candidateId, status: verified.status, coverageCount: verified.coverageCount, constructEquivalent: verified.methodologyChecks.constructEquivalent } : null, newestDefensibleFullCoverageYear: full?.candidateYear ?? null };
    }),
    commonYearAssessment, conclusion,
    summary: { indicators: 18, dimensions: 6, targetRegions: 27, selectedIndicatorYearRows: selected.length, investigatedCandidates: candidates.length, sourceReceipts: audits.reduce((sum, audit) => sum + audit.sources.length, 0), searchActions: audits.reduce((sum, audit) => sum + audit.searchLog.length, 0), retainedCandidateObservations: candidates.reduce((sum, candidate) => sum + candidate.coverageCount, 0), protectedExistingFiles: protectedManifest.length },
    provenance: { sourceManifest, computationManifest, protectedBaselineManifest: protectedManifest, reproductionScope: "Offline replay of attributed audited transcriptions and research decisions; not new remote-publication acquisition or an independent replication of the publishers' survey estimates." },
  };
  assert.equal(JSON.stringify(audits), rawSnapshot, "FRESHNESS_INPUT_MUTATED");
  const serialized = `${JSON.stringify(output, null, 2)}\n`;
  const csv = serializeFreshnessCsv(matrix);
  for (const path of [protocolPath, ...protocol.rawAuditPaths, conclusionPath]) assertNoCapturedCredentials(bytes(path).toString("utf8"));
  assertNoCapturedCredentials(serialized);
  assertNoCapturedCredentials(csv);
  for (const entry of [...protectedManifest, ...sourceManifest, ...computationManifest]) assert.equal(hash(bytes(entry.path)), entry.sha256, `SOURCE_CHANGED_DURING_AUDIT: ${entry.path}`);
  if (args.includes("--check")) {
    assert.equal(bytes(jsonPath).toString("utf8"), serialized, "FRESHNESS_JSON_DRIFT");
    assert.equal(bytes(csvPath).toString("utf8"), csv, "FRESHNESS_CSV_DRIFT");
  } else {
    writeFileSync(new URL(jsonPath, root), serialized);
    writeFileSync(new URL(csvPath, root), csv);
  }
  console.log(`${args.includes("--check") ? "Verified" : "Generated"} freshness audit: ${selected.length} selected indicator/year rows, ${candidates.length} candidates, ${output.summary.retainedCandidateObservations} retained observations; ${protectedManifest.length} existing files unchanged; ${conclusion.recommendation}.`);
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) runFreshnessAudit();
