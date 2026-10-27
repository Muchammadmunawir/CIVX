import type { RegionType, SourceReference } from "../types";

export type AnalyticalKind = "core_score_indicator" | "context_indicator" | "advantage_signal";
export type CoverageStatus = "available" | "unavailable" | "historical" | "partial_coverage";
export type ComparabilityStatus = "comparable" | "incompatible_geography" | "not_comparable";
export type AdvantagePresence = "verified_present" | "verified_absent" | "no_comparable_data" | "not_applicable";
export type DimensionId = "socioeconomic" | "basic_services" | "health" | "infrastructure" | "resilience";

export interface CandidateAudit {
  id: string;
  label: string;
  institution: string;
  sourceUrl: string;
  years: number[];
  coverage: string;
  classification: "core" | "context" | "advantage" | "rejected";
  status: CoverageStatus | "incompatible_geography" | "not_comparable";
  unit: string;
  definition: string;
  reason: string;
  limitations: string[];
  evidence: string[];
}

export interface V2Source extends Omit<SourceReference, "table"> {
  table: string | null;
  revision: string;
}

export interface V2Artifact {
  id: string;
  localPath: string | null;
  bytes: number;
  url: string;
  retrievedAt: string;
  redistribution: string;
}

export interface Provenance {
  sourceId: string;
  artifactId: string;
  locator: string;
}

export interface Denominator {
  definition: string;
  value?: number;
  unit?: string;
  period?: string;
  sourceId?: string;
  locator?: string;
}

interface ObservationBase {
  id: string;
  releaseId: string;
  indicatorId: string;
  regionId: string;
  geography: { level: "kabupaten_kota" | "police_jurisdiction" | "other"; code: string; boundaryReference: string };
  period: string | null;
  unit: string;
  value: number | null;
  coverageStatus: CoverageStatus;
  comparabilityStatus: ComparabilityStatus;
  verificationState: "verified" | "unverified" | "failed";
  confidence: "not_assessed";
  missingReason: string | null;
  provenance: Provenance[];
  denominator: Denominator | null;
  derivation: Record<string, string | number> | null;
}

export type V2Observation = ObservationBase & (
  | { kind: "core_score_indicator" }
  | { kind: "context_indicator" }
  | { kind: "advantage_signal"; presence: AdvantagePresence; whyAssigned: string | null }
);

export interface V2IndicatorPolicy {
  id: string;
  label: string;
  unit: string;
  sourceId: string;
  direction: "higher" | "lower";
  minimum: number;
  maximum: number;
  minimumRegion: string;
  maximumRegion: string;
  withinDimensionWeight: number;
}

export interface DimensionPolicy {
  id: DimensionId;
  label: string;
  weight: number;
  indicators: V2IndicatorPolicy[];
}

export interface V2Policy {
  modelVersion: "CIVX v2";
  releaseId: string;
  methodologyVersion: string;
  referenceSetId: string;
  period: string;
  boundaryReference: string;
  referenceRegionIds: string[];
  status: "draft" | "project_validated";
  normalization: "fixed_min_max";
  rounding: "full_precision_then_two_decimals";
  dimensions: DimensionPolicy[];
  unsupportedDimensions: { id: DimensionId; label: string; reason: string }[];
  weightDecision: string;
}

export interface PressureComponent {
  indicatorId: string;
  observationId: string;
  score: number;
  withinDimensionWeight: number;
  effectiveWeight: number;
  contribution: number;
}

export interface PressureDimension {
  id: DimensionId;
  label: string;
  score: number;
  weight: number;
  contribution: number;
  components: PressureComponent[];
}

export type V2Pressure = { status: "unavailable"; reason: string } | {
  status: "available";
  releaseId: string;
  methodologyVersion: string;
  referenceSetId: string;
  period: string;
  score: number;
  dimensions: PressureDimension[];
};

export interface V2Region {
  id: string;
  name: string;
  type: RegionType;
  province: string;
  boundaryReference: string;
  observations: V2Observation[];
  pressure: V2Pressure;
}

export interface ExploreLayer {
  id: "overall" | DimensionId | "density" | "mobility";
  kind: "core_score_indicator" | "context_indicator";
  label: string;
  releaseId: string;
  methodologyVersion: string;
  referenceSetId: string;
  period: string;
  unit: string;
  coverageStatus: "available";
  comparabilityStatus: "comparable";
  values: { regionId: string; value: number }[];
}

export interface SensitivityScenario {
  id: string;
  label: string;
  dimensionWeights: Record<string, number>;
  indicatorWeights: Record<string, number>;
  maxAbsoluteScoreChange: number;
  meanAbsoluteScoreChange: number;
  maxOrderMovement: number;
  spearman: number;
  orderReversals: number;
  categoryChanges: number;
  regions: { regionId: string; score: number; change: number; orderMovement: number; baselineRank?: number; rank?: number }[];
}

export interface SourceVerification {
  mode: "original_artifacts" | "validated_transcriptions";
  artifacts: {
    artifactId: string;
    state: "bytes_verified" | "fingerprinted_transcription_only";
  }[];
}

export interface SensitivityReport {
  baseline: string;
  referenceSetId: string;
  scenarios: SensitivityScenario[];
  correlations: { a: string; b: string; pearson: number }[];
  decision: string;
  limitations: string[];
  coreDataFingerprint?: string;
  sourceVerification?: SourceVerification;
}

export interface V2Release {
  modelVersion: "CIVX v2";
  releaseId: string;
  period: string;
  methodology: V2Policy;
  sources: V2Source[];
  artifacts: V2Artifact[];
  candidates: CandidateAudit[];
  regions: V2Region[];
  exploreLayers: ExploreLayer[];
  sensitivity: SensitivityReport;
  qualityAudit: { attempted: number; scored: number; withheld: { regionId: string; reason: string }[] };
  inputs: { path: string; sha256: string }[];
  sourceVerification?: SourceVerification;
  limitations: string[];
}
