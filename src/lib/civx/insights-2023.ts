import { compareCohort2023 } from "./cohort-comparison-2023.ts";
import type { CohortComparison2023 } from "./cohort-comparison-2023.ts";
import { assertScoringDataset2023 } from "./insight-input-2023.ts";
import type { ScoringDataset2023 } from "./insight-input-2023.ts";
import { renderInsightIndonesian2023 } from "./insight-templates-2023.ts";
import type { InsightTemplateKey2023 } from "./insight-templates-2023.ts";
import type { DimensionScore2023, IndicatorScore2023 } from "./scoring-2023.ts";

export interface DimensionComparison2023 extends DimensionScore2023 {
  readonly comparison: CohortComparison2023;
  /** JSON Pointer in the pinned scoring artifact, not in this insight artifact. */
  readonly scoringPointer: string;
}

export interface IndicatorComparison2023 extends IndicatorScore2023 {
  readonly comparison: CohortComparison2023;
  readonly scoringPointer: string;
}

export interface InsightEvidence2023 {
  readonly overall?: {
    readonly score: number;
    readonly comparison: CohortComparison2023;
    readonly scoringPointer: string;
  };
  readonly dimensions: readonly DimensionComparison2023[];
  readonly indicators: readonly IndicatorComparison2023[];
  readonly comparisonTextKey: string;
}

export interface CoreInsight2023 {
  readonly insightId: string;
  readonly regionId: string;
  readonly scope: "CORE";
  readonly type: InsightTemplateKey2023;
  readonly priority: number;
  /** Relative descriptive attention only; not a hazard threshold or confidence level. */
  readonly severity: "neutral" | "higher_relative_pressure" | "lower_relative_pressure";
  readonly templateKey: InsightTemplateKey2023;
  readonly title: string;
  readonly message: string;
  readonly evidence: InsightEvidence2023;
}

export interface RegionInsights2023 {
  readonly regionId: string;
  readonly regionName: string;
  readonly referenceYear: 2023;
  readonly province: string;
  readonly type: string;
  readonly boundaryReference: string;
  readonly modelId: string;
  readonly modelVersion: number;
  readonly engineVersion: 1;
  readonly scoringPointer: string;
  readonly overallPressureScore: number;
  readonly overallProfile: CohortComparison2023;
  readonly dimensions: readonly DimensionComparison2023[];
  readonly indicators: readonly IndicatorComparison2023[];
  readonly selection: {
    readonly regionalDimensionMedian: number;
    readonly mainPressureDimensionIds: readonly string[];
    readonly lowerPressureDimensionIds: readonly string[];
    readonly topDimensionGap: number;
  };
  readonly insights: readonly CoreInsight2023[];
}

export const INSIGHT_ANALYSIS_POLICY_2023 = {
  percentile: "100 * (ascending exact-tie midrank - 1) / (cohort size - 1); singleton = 50",
  classificationBoundaries: [0, 20, 40, 60, 80, 100],
  classificationIntervals: "[0,20), [20,40), [40,60), [60,80), [80,100]",
  mainPressureMinimumPercentile: 60,
  dimensionMinimumMedianDifference: 5,
  coLeadingDimensionScoreGap: 5,
  lowerPressureMaximumPercentileExclusive: 40,
  lowerPressureMinimumRegionalMedianGap: 5,
  indicatorMinimumPercentile: 80,
  coLeadingIndicatorNormalizedGap: 5,
  contributionComparisonTolerance: 1e-10,
  maximumPressureGroups: 2,
  maximumIndicatorGroups: 2,
  maximumInsights: 6,
  contributionMeaning: "Score points copied from scoring records, not causal effects, measurement certainty, or shares of residents. Singleton coefficients represent an entire dimension budget.",
} as const;

export interface InsightDataset2023 {
  readonly datasetId: "civx-jabar-2023-core-insights";
  readonly version: 1;
  readonly status: "INSIGHTS_NOT_RELEASED";
  readonly referenceYear: 2023;
  readonly locale: "id";
  readonly scope: "CORE";
  readonly modelId: string;
  readonly modelVersion: number;
  readonly engineId: "civx-insights-2023";
  readonly engineVersion: 1;
  readonly publicRankingGenerated: false;
  readonly productionIntegrationAuthorized: false;
  readonly interpretation: string;
  readonly analysisPolicy: typeof INSIGHT_ANALYSIS_POLICY_2023;
  readonly regions: readonly RegionInsights2023[];
}

function descending<T>(items: readonly T[], value: (item: T) => number): T[] {
  // Stable sort preserves the frozen model order for exact ties.
  return [...items].sort((left, right) => value(right) - value(left));
}

function selectDimensions(dimensions: readonly DimensionComparison2023[]) {
  const ordered = descending(dimensions, (dimension) => dimension.score);
  const regionalMedian = (ordered[2].score + ordered[3].score) / 2;
  const policy = INSIGHT_ANALYSIS_POLICY_2023;
  const qualified = ordered.filter((dimension) =>
    dimension.comparison.percentile >= policy.mainPressureMinimumPercentile &&
    dimension.comparison.differenceFromMedian >= policy.dimensionMinimumMedianDifference &&
    dimension.score >= regionalMedian,
  );
  const pressureGroups: DimensionComparison2023[][] = [];
  if (qualified.length > 0) {
    const leading = qualified.filter((dimension) => qualified[0].score - dimension.score <= policy.coLeadingDimensionScoreGap);
    pressureGroups.push(leading);
    const additional = descending(
      qualified.filter((dimension) => !leading.includes(dimension) && dimension.comparison.percentile >= 80),
      (dimension) => dimension.comparison.percentile,
    )[0];
    if (additional !== undefined) pressureGroups.push([additional]);
  }
  const lower = [...ordered].reverse().filter((dimension) =>
    dimension.comparison.percentile < policy.lowerPressureMaximumPercentileExclusive &&
    dimension.comparison.differenceFromMedian <= -policy.dimensionMinimumMedianDifference &&
    dimension.score <= regionalMedian - policy.lowerPressureMinimumRegionalMedianGap,
  );
  // Return exact/near ties in frozen dimension order, not a fabricated internal rank.
  const lowerIds = new Set(lower.filter((dimension) => dimension.score - lower[0].score <= policy.coLeadingDimensionScoreGap).map((dimension) => dimension.dimensionId));
  return {
    pressureGroups: pressureGroups.map((group) => dimensions.filter((dimension) => group.includes(dimension))),
    lower: dimensions.filter((dimension) => lowerIds.has(dimension.dimensionId)),
    regionalMedian,
    topDimensionGap: ordered[0].score - ordered[1].score,
  };
}

function selectIndicatorGroups(
  dimensions: readonly DimensionComparison2023[],
  indicators: readonly IndicatorComparison2023[],
  pressureDimensionIds: ReadonlySet<string>,
): IndicatorComparison2023[][] {
  const groups: IndicatorComparison2023[][] = [];
  for (const dimension of dimensions) {
    if (!pressureDimensionIds.has(dimension.dimensionId)) continue;
    const members = indicators.filter((indicator) => indicator.dimensionId === dimension.dimensionId);
    // IRBI/IKLH already explain their entire dimension. A separate insight repeats it.
    if (members.length === 1) continue;
    const qualified = descending(members.filter((indicator) =>
      indicator.comparison.percentile >= INSIGHT_ANALYSIS_POLICY_2023.indicatorMinimumPercentile &&
      indicator.contributionToDimension + INSIGHT_ANALYSIS_POLICY_2023.contributionComparisonTolerance >= dimension.score / members.length,
    ), (indicator) => indicator.contributionToDimension);
    if (qualified.length === 0) continue;
    const ids = new Set(qualified.filter((indicator) =>
      qualified[0].normalizedPressure - indicator.normalizedPressure <= INSIGHT_ANALYSIS_POLICY_2023.coLeadingIndicatorNormalizedGap,
    ).map((indicator) => indicator.indicatorId));
    groups.push(members.filter((indicator) => ids.has(indicator.indicatorId)));
  }
  return descending(groups, (group) => Math.max(...group.map((indicator) => indicator.contributionToOverall)))
    .slice(0, INSIGHT_ANALYSIS_POLICY_2023.maximumIndicatorGroups);
}

/** Pure comparison of verified score records. Never calls a scorer or refits normalization. */
export function generateInsights2023(input: ScoringDataset2023): InsightDataset2023 {
  assertScoringDataset2023(input);
  const overall = compareCohort2023(input.regions.map((region) => region.overallPressureScore));
  const dimensionPanels = input.model.dimensions.map((_, index) => compareCohort2023(input.regions.map((region) => region.dimensions[index].score)));
  const indicatorPanels = input.model.indicators.map((_, index) => compareCohort2023(input.regions.map((region) => region.indicators[index].normalizedPressure)));
  const regions: RegionInsights2023[] = input.regions.map((region, regionIndex) => {
    const scoringPointer = `/regions/${regionIndex}`;
    const dimensions = region.dimensions.map((dimension, index): DimensionComparison2023 => ({
      ...dimension,
      comparison: dimensionPanels[index][regionIndex],
      scoringPointer: `${scoringPointer}/dimensions/${index}`,
    }));
    const indicators = region.indicators.map((indicator, index): IndicatorComparison2023 => ({
      ...indicator,
      expectedBounds: { ...indicator.expectedBounds },
      comparison: indicatorPanels[index][regionIndex],
      scoringPointer: `${scoringPointer}/indicators/${index}`,
    }));
    const selected = selectDimensions(dimensions);
    const pressureIds = new Set(selected.pressureGroups.flat().map((dimension) => dimension.dimensionId));
    const insights: CoreInsight2023[] = [];
    function add(
      type: InsightTemplateKey2023,
      evidenceDimensions: readonly DimensionComparison2023[],
      evidenceIndicators: readonly IndicatorComparison2023[],
    ): void {
      const comparison = type === "overall_profile" ? overall[regionIndex]
        : type === "standout_indicator" ? evidenceIndicators[0].comparison
          : evidenceDimensions[0].comparison;
      const rendered = renderInsightIndonesian2023({
        templateKey: type,
        classification: comparison.classification,
        dimensionIds: evidenceDimensions.map((dimension) => dimension.dimensionId),
        indicatorIds: evidenceIndicators.map((indicator) => indicator.indicatorId),
      });
      const suffix = type === "overall_profile" ? "overall" : evidenceDimensions.map((dimension) => dimension.dimensionId).join("+");
      insights.push({
        insightId: `${region.regionId}:${type}:${suffix}`,
        regionId: region.regionId,
        scope: "CORE",
        type,
        priority: insights.length + 1,
        severity: type === "overall_profile" ? "neutral" : type === "relative_strength" ? "lower_relative_pressure" : "higher_relative_pressure",
        templateKey: type,
        ...rendered,
        evidence: {
          ...(type === "overall_profile" ? { overall: { score: region.overallPressureScore, comparison: overall[regionIndex], scoringPointer: `${scoringPointer}/overallPressureScore` } } : {}),
          dimensions: evidenceDimensions,
          indicators: evidenceIndicators,
          comparisonTextKey: type === "overall_profile" ? comparison.classification : type === "main_pressure" ? "higher_cohort_and_local_profile" : type === "relative_strength" ? "lower_cohort_and_local_profile" : "high_cohort_and_dimension_contribution",
        },
      });
    }
    add("overall_profile", [], []);
    for (const group of selected.pressureGroups) {
      // Include full support in the same paragraph, even when a singleton is the whole dimension.
      const ids = new Set(group.map((dimension) => dimension.dimensionId));
      add("main_pressure", group, indicators.filter((indicator) => ids.has(indicator.dimensionId)));
    }
    if (selected.lower.length > 0) {
      const ids = new Set(selected.lower.map((dimension) => dimension.dimensionId));
      add("relative_strength", selected.lower, indicators.filter((indicator) => ids.has(indicator.dimensionId)));
    }
    for (const group of selectIndicatorGroups(dimensions, indicators, pressureIds)) {
      add("standout_indicator", dimensions.filter((dimension) => dimension.dimensionId === group[0].dimensionId), group);
    }
    return {
      regionId: region.regionId,
      regionName: region.regionName,
      referenceYear: region.referenceYear,
      province: region.province,
      type: region.type,
      boundaryReference: region.boundaryReference,
      modelId: region.modelId,
      modelVersion: region.modelVersion,
      engineVersion: 1,
      scoringPointer,
      overallPressureScore: region.overallPressureScore,
      overallProfile: overall[regionIndex],
      dimensions,
      indicators,
      selection: {
        regionalDimensionMedian: selected.regionalMedian,
        mainPressureDimensionIds: [...pressureIds],
        lowerPressureDimensionIds: selected.lower.map((dimension) => dimension.dimensionId),
        topDimensionGap: selected.topDimensionGap,
      },
      insights,
    };
  });
  return {
    datasetId: "civx-jabar-2023-core-insights",
    version: 1,
    status: "INSIGHTS_NOT_RELEASED",
    referenceYear: 2023,
    locale: "id",
    scope: "CORE",
    modelId: input.model.modelId,
    modelVersion: input.model.modelVersion,
    engineId: "civx-insights-2023",
    engineVersion: 1,
    publicRankingGenerated: false,
    productionIntegrationAuthorized: false,
    interpretation: "Insight language describes relative positions within the frozen Jawa Barat 2023 cohort and must not be interpreted as an absolute judgment, causal explanation, or policy recommendation.",
    analysisPolicy: { ...INSIGHT_ANALYSIS_POLICY_2023, classificationBoundaries: [...INSIGHT_ANALYSIS_POLICY_2023.classificationBoundaries] },
    regions,
  };
}
