import registryArtifact from "../../../data/raw/civx-jabar-2023.json" with { type: "json" };
import frozenArtifact from "../../../data/processed/final-indicator-freeze-2023.json" with { type: "json" };
import scoreArtifact from "../../../data/processed/civx-scores-2023.json" with { type: "json" };
import insightArtifact from "../../../data/processed/civx-insights-2023.json" with { type: "json" };
import { assertScoringDataset2023 } from "./insight-input-2023.ts";
import type { ScoringDataset2023 } from "./insight-input-2023.ts";
import type { CohortComparison2023 } from "./cohort-comparison-2023.ts";
import type { DimensionComparison2023, IndicatorComparison2023, InsightDataset2023 } from "./insights-2023.ts";
import type { DimensionScore2023, IndicatorScore2023 } from "./scoring-2023.ts";
import { buildRegionContext2023 } from "./repository-context-2023.ts";
import type {
  CivxContextItem2023,
  CivxDimensionProfile2023,
  CivxIndicatorProfile2023,
  CivxInsight2023,
  CivxModelMetadata2023,
  CivxRegionProfile2023,
  CivxRegionSummary2023,
  CivxScore2023,
} from "./product-types-2023.ts";

function requireArtifact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`CIVX repository 2023: ${message}`);
}

/** Freeze once at ingress; accessors share immutable records without per-call copying. */
function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

// JSON imports widen literal unions. These ingress assertions reuse the existing
// score contract and validate recorded insight fields below, never rerunning engines.
const scores = scoreArtifact as ScoringDataset2023;
const insights = insightArtifact as Omit<InsightDataset2023, "analysisPolicy">;
assertScoringDataset2023(scores);
requireArtifact(scoreArtifact.productionIntegrationAuthorized === false && scoreArtifact.publicRankingGenerated === false, "score release authorization changed");
requireArtifact(scoreArtifact.higherIsHigherRelativePressure === true && scoreArtifact.pressureScale.length === 2 && scoreArtifact.pressureScale[0] === 0 && scoreArtifact.pressureScale[1] === 100, "pressure interpretation changed");
requireArtifact(frozenArtifact.contractId === "civx-jabar-2023-final-indicator-freeze" && frozenArtifact.version === 1 && frozenArtifact.referenceYear === 2023 && frozenArtifact.status === "FROZEN_SCORING_INPUTS_ONLY", "indicator freeze identity changed");
requireArtifact(registryArtifact.regions.length === 27 && frozenArtifact.geography.regions.length === 27 && frozenArtifact.indicators.length === 18, "registry or frozen indicator coverage changed");
requireArtifact(scoreArtifact.geography.registry === "data/raw/civx-jabar-2023.json" && frozenArtifact.geography.registry === scoreArtifact.geography.registry, "registry provenance changed");
requireArtifact(insights.datasetId === "civx-jabar-2023-core-insights" && insights.version === 1 && insights.status === "INSIGHTS_NOT_RELEASED" && insights.referenceYear === 2023 && insights.scope === "CORE" && insights.locale === "id", "insight dataset identity changed");
requireArtifact(insights.modelId === scores.model.modelId && insights.modelVersion === scores.model.modelVersion && insights.engineId === "civx-insights-2023" && insights.engineVersion === 1, "insight model or engine changed");
requireArtifact(insights.productionIntegrationAuthorized === false && insights.publicRankingGenerated === false && insights.regions.length === 27, "insight authorization or coverage changed");
requireArtifact(insightArtifact.provenance.scoringPath === "data/processed/civx-scores-2023.json", "insight scoring provenance changed");
const scoreFingerprint = insightArtifact.provenance.sourceManifest[0];
requireArtifact(scoreFingerprint.path === insightArtifact.provenance.scoringPath && scoreFingerprint.sha256 === "47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5", "insights reference a different score artifact");

function validateComparison(comparison: CohortComparison2023, value: number): void {
  requireArtifact(comparison.value === value && comparison.cohortSize === 27, "insight comparison value or cohort changed");
  requireArtifact(Object.values(comparison).every((item) => typeof item !== "number" || Number.isFinite(item)), "nonfinite insight comparison");
  requireArtifact(comparison.percentile >= 0 && comparison.percentile <= 100 && comparison.midrank >= 1 && comparison.midrank <= 27, "invalid recorded insight position");
  requireArtifact(["relatively_low", "lower_middle", "middle", "higher_middle", "relatively_high"].includes(comparison.classification), "unknown insight classification");
}

function validateRecordedComponent(
  actual: DimensionComparison2023 | IndicatorComparison2023,
  expected: DimensionScore2023 | IndicatorScore2023 | undefined,
  pointer: string,
): void {
  requireArtifact(expected !== undefined, "insight references an unknown CORE component");
  const { comparison, scoringPointer, ...recorded } = actual;
  // Both artifacts retain the scorer's field order. Compare stored fields only;
  // do not derive replacement scores, contributions, percentiles, or classifications.
  requireArtifact(scoringPointer === pointer && JSON.stringify(recorded) === JSON.stringify(expected), "insight component differs from its scoring record");
  validateComparison(comparison, "score" in expected ? expected.score : expected.normalizedPressure);
}

const summaries = scores.regions.map((source, regionIndex): CivxRegionSummary2023 => {
  const registry = registryArtifact.regions[regionIndex];
  const frozenRegion = frozenArtifact.geography.regions[regionIndex];
  requireArtifact(registry.id === source.regionId && registry.name === source.regionName && frozenRegion.id === registry.id && frozenRegion.name === registry.name, "canonical registry identity or order changed");
  requireArtifact(registry.province === "Jawa Barat" && (registry.type === "kabupaten" || registry.type === "kota") && source.type === registry.type && source.boundaryReference === registry.boundaryReference, "canonical geography changed");
  const insightRegion = insights.regions[regionIndex];
  requireArtifact(insightRegion.regionId === source.regionId && insightRegion.regionName === source.regionName && insightRegion.referenceYear === 2023 && insightRegion.province === source.province && insightRegion.type === source.type && insightRegion.boundaryReference === source.boundaryReference, "insight regional identity or order changed");
  requireArtifact(insightRegion.modelId === source.modelId && insightRegion.modelVersion === source.modelVersion && insightRegion.engineVersion === 1 && insightRegion.scoringPointer === `/regions/${regionIndex}` && insightRegion.overallPressureScore === source.overallPressureScore, "insight regional score or provenance changed");
  requireArtifact(insightRegion.dimensions.length === 6 && insightRegion.indicators.length === 18 && insightRegion.insights.length >= 1 && insightRegion.insights.length <= 6, "incomplete CORE insight collection");
  validateComparison(insightRegion.overallProfile, source.overallPressureScore);
  for (const [index, dimension] of insightRegion.dimensions.entries()) validateRecordedComponent(dimension, source.dimensions[index], `/regions/${regionIndex}/dimensions/${index}`);
  for (const [index, indicator] of insightRegion.indicators.entries()) validateRecordedComponent(indicator, source.indicators[index], `/regions/${regionIndex}/indicators/${index}`);
  const insightIds = new Set<string>();
  for (const insight of insightRegion.insights) {
    requireArtifact(insight.regionId === source.regionId && insight.scope === "CORE" && !insightIds.has(insight.insightId), "insight identity or scope changed");
    insightIds.add(insight.insightId);
    requireArtifact(["overall_profile", "main_pressure", "relative_strength", "standout_indicator"].includes(insight.type) && insight.type === insight.templateKey, "unknown insight template");
    requireArtifact(["neutral", "higher_relative_pressure", "lower_relative_pressure"].includes(insight.severity) && Number.isInteger(insight.priority) && insight.title.length > 0 && insight.message.length > 0, "invalid recorded insight");
    if (insight.evidence.overall !== undefined) {
      requireArtifact(insight.evidence.overall.score === source.overallPressureScore && insight.evidence.overall.scoringPointer === `/regions/${regionIndex}/overallPressureScore`, "overall insight evidence drift");
      validateComparison(insight.evidence.overall.comparison, source.overallPressureScore);
    }
    for (const dimension of insight.evidence.dimensions) {
      const index = source.dimensions.findIndex((item) => item.dimensionId === dimension.dimensionId);
      validateRecordedComponent(dimension, source.dimensions[index], `/regions/${regionIndex}/dimensions/${index}`);
    }
    for (const indicator of insight.evidence.indicators) {
      const index = source.indicators.findIndex((item) => item.indicatorId === indicator.indicatorId);
      validateRecordedComponent(indicator, source.indicators[index], `/regions/${regionIndex}/indicators/${index}`);
    }
  }
  return {
    id: registry.id,
    name: registry.name,
    province: registry.province,
    type: registry.type,
    referenceYear: 2023,
    boundaryReference: registry.boundaryReference,
    registryPointer: source.registryPointer,
  };
});

const indicatorEvidence = frozenArtifact.indicators.map(({ observations, ...indicator }, index) => {
  requireArtifact(indicator.indicatorId === scores.model.indicators[index].indicatorId && indicator.classification === "CORE" && indicator.frozenStatus === "FROZEN" && indicator.year === 2023 && observations.length === 27, "frozen indicator identity or coverage changed");
  return { indicator, observations };
});
const contextById = buildRegionContext2023(scores.model.regions);
const metadata: CivxModelMetadata2023 = deepFreeze({
  referenceYear: 2023,
  cohortSize: 27,
  modelId: scores.model.modelId,
  modelVersion: scores.model.modelVersion,
  normalizationMethod: scores.model.normalizationMethod,
  weightingSchemeId: scores.model.weightingSchemeId,
  scoreDatasetId: "civx-jabar-2023-pressure-scores",
  scoreStatus: "SCORED_NOT_RELEASED",
  insightDatasetId: insights.datasetId,
  insightStatus: insights.status,
  insightEngineId: insights.engineId,
  insightEngineVersion: insights.engineVersion,
  locale: insights.locale,
  pressureScale: [0, 100],
  higherIsHigherRelativePressure: true,
  interpretation: scoreArtifact.interpretation,
  insightInterpretation: insights.interpretation,
  referencePolicy: frozenArtifact.referencePolicy,
  missingPolicy: frozenArtifact.missingPolicy,
  productionIntegrationAuthorized: insights.productionIntegrationAuthorized,
  publicRankingGenerated: insights.publicRankingGenerated,
  geography: scoreArtifact.geography,
  provenance: scoreArtifact.provenance,
  insightProvenance: insightArtifact.provenance,
  scoreArtifact: scoreFingerprint,
  insightArtifact: {
    path: "data/processed/civx-insights-2023.json",
    sha256: "ffd92543c6387c981d2647c8ed55bd3abb7f7c4e9b5b91d4a74fab81999d6345",
    bytes: 1516134,
  },
});

const regions: readonly CivxRegionSummary2023[] = deepFreeze(summaries);
const regionsById = new Map(regions.map((region) => [region.id, region]));
const scoresById = new Map<string, CivxScore2023>();
const profilesById = new Map<string, CivxRegionProfile2023>();
for (const [regionIndex, region] of regions.entries()) {
  const source = scores.regions[regionIndex];
  const score: CivxScore2023 = deepFreeze({
    scope: "CORE",
    overallScore: source.overallPressureScore,
    dimensions: source.dimensions.map((dimension): CivxDimensionProfile2023 => ({ ...dimension, scope: "CORE" })),
    indicators: source.indicators.map((indicator, index): CivxIndicatorProfile2023 => {
      const evidence = indicatorEvidence[index];
      const observation = evidence.observations[regionIndex];
      requireArtifact(observation.regionId === region.id && (!("regionName" in observation) || observation.regionName === region.name) && observation.value === indicator.rawValue, "frozen observation differs from score input");
      return {
        ...indicator,
        scope: "CORE",
        evidence: { indicator: evidence.indicator, observation, scoringPointer: `/regions/${regionIndex}/indicators/${index}` },
      };
    }),
  });
  const context = contextById.get(region.id);
  requireArtifact(context !== undefined, "regional context slots missing");
  scoresById.set(region.id, score);
  profilesById.set(region.id, deepFreeze({
    region,
    core: { ...score, insights: insights.regions[regionIndex].insights },
    context,
    metadata,
  }));
}

/** Canonical BPS order; identity only, not score order or a regional ranking. */
export function getRegions2023(): readonly CivxRegionSummary2023[] {
  return regions;
}

/** Exact canonical ID lookup. Unknown IDs return undefined without trimming or guessing. */
export function getRegion2023(regionId: string): CivxRegionSummary2023 | undefined {
  return regionsById.get(regionId);
}

export function getRegionScore2023(regionId: string): CivxScore2023 | undefined {
  return scoresById.get(regionId);
}

export function getRegionInsights2023(regionId: string): readonly CivxInsight2023[] | undefined {
  return profilesById.get(regionId)?.core.insights;
}

export function getRegionContext2023(regionId: string): readonly CivxContextItem2023[] | undefined {
  return profilesById.get(regionId)?.context;
}

export function getRegionProfile2023(regionId: string): CivxRegionProfile2023 | undefined {
  return profilesById.get(regionId);
}
