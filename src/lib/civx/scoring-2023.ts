import { assertModel2023, normalizePressure2023 } from "./model-2023.ts";
import type { Indicator2023, IndicatorInput2023, Model2023, RegionInput2023 } from "./model-2023.ts";

export interface NormalizedIndicator2023 {
  readonly indicatorId: string;
  readonly normalizedPressure: number;
}

export interface DimensionScore2023 {
  readonly dimensionId: string;
  readonly displayName: string;
  readonly score: number;
  readonly weight: number;
  readonly exactFraction: string;
  readonly contributionToOverall: number;
}

export interface AggregatedScore2023 {
  readonly overallPressureScore: number;
  readonly dimensions: readonly DimensionScore2023[];
}

export interface IndicatorScore2023 extends Indicator2023, IndicatorInput2023 {
  readonly contributionToDimension: number;
  readonly contributionToOverall: number;
}

export interface ContributionFacts2023 {
  readonly highestPressureDimensionIds: readonly string[];
  readonly lowestPressureDimensionIds: readonly string[];
  readonly indicatorIdsByDescendingPressure: readonly string[];
}

export interface RegionScore2023 extends AggregatedScore2023 {
  readonly regionId: string;
  readonly regionName: string;
  readonly referenceYear: 2023;
  readonly modelId: string;
  readonly modelVersion: number;
  readonly indicators: readonly IndicatorScore2023[];
  readonly facts: ContributionFacts2023;
}

const SCORE_TOLERANCE = 1e-10;

function assertScore(value: unknown, label: string, tolerance = 0): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < -tolerance || value > 100 + tolerance) {
    throw new Error(`CIVX 2023: ${label} must be a finite number between 0 and 100`);
  }
}

function indexIndicators<T extends NormalizedIndicator2023>(
  indicators: readonly T[],
  model: Model2023,
): Map<string, T> {
  if (!Array.isArray(indicators) || indicators.length !== model.indicators.length) {
    throw new Error("CIVX 2023: exactly 18 indicator inputs are required");
  }
  const expected = new Set(model.indicators.map((indicator) => indicator.indicatorId));
  const indexed = new Map<string, T>();
  for (const indicator of indicators) {
    if (!expected.has(indicator.indicatorId)) {
      throw new Error(`CIVX 2023: unknown indicator ${indicator.indicatorId}`);
    }
    if (indexed.has(indicator.indicatorId)) {
      throw new Error(`CIVX 2023: duplicate indicator ${indicator.indicatorId}`);
    }
    assertScore(indicator.normalizedPressure, `${indicator.indicatorId} normalized pressure`);
    indexed.set(indicator.indicatorId, indicator);
  }
  return indexed;
}

function aggregateValidated(
  indexed: ReadonlyMap<string, NormalizedIndicator2023>,
  model: Model2023,
): AggregatedScore2023 {
  const indicatorModels = new Map(model.indicators.map((indicator) => [indicator.indicatorId, indicator]));
  const dimensions: DimensionScore2023[] = [];
  let overallPressureScore = 0;
  let indicatorContributionTotal = 0;
  for (const dimension of model.dimensions) {
    let score = 0;
    for (const indicatorId of dimension.indicatorIds) {
      const indicator = indicatorModels.get(indicatorId)!;
      const pressure = indexed.get(indicatorId)!.normalizedPressure;
      score += pressure * indicator.withinDimensionWeight;
      indicatorContributionTotal += pressure * indicator.effectiveWeight;
    }
    assertScore(score, `${dimension.dimensionId} dimension score`, SCORE_TOLERANCE);
    const contributionToOverall = score * dimension.weight;
    overallPressureScore += contributionToOverall;
    dimensions.push({
      dimensionId: dimension.dimensionId,
      displayName: dimension.displayName,
      score,
      weight: dimension.weight,
      exactFraction: dimension.exactFraction,
      contributionToOverall,
    });
  }
  assertScore(overallPressureScore, "overall pressure score", SCORE_TOLERANCE);
  if (Math.abs(indicatorContributionTotal - overallPressureScore) > SCORE_TOLERANCE) {
    throw new Error("CIVX 2023: indicator and dimension contribution sums disagree");
  }
  return { overallPressureScore, dimensions };
}

/** Pure arithmetic for complete, explicitly synthetic or observed normalized vectors. */
export function aggregateNormalized2023(
  indicators: readonly NormalizedIndicator2023[],
  model: Model2023,
): AggregatedScore2023 {
  assertModel2023(model);
  return aggregateValidated(indexIndicators(indicators, model), model);
}

function scoreValidated(input: RegionInput2023, model: Model2023): RegionScore2023 {
  const regionIndex = model.regions.findIndex((region) => region.id === input.regionId);
  if (regionIndex === -1 || model.regions[regionIndex].name !== input.regionName || input.referenceYear !== 2023) {
    throw new Error("CIVX 2023: region identity or reference year differs from the frozen cohort");
  }
  const indexed = indexIndicators(input.indicators, model);
  const indicators: IndicatorScore2023[] = model.indicators.map((indicator, index) => {
    const observation = indexed.get(indicator.indicatorId)!;
    const observationPointer = `/indicators/${index}/observations/${regionIndex}`;
    if (observation.frozenValuePointer !== `${observationPointer}/value` || observation.normalizationValuePointer !== `${observationPointer}/normalizedPressure/min_max`) {
      throw new Error(`CIVX 2023: ${indicator.indicatorId}/${input.regionId} provenance pointer mismatch`);
    }
    const recomputed = normalizePressure2023(observation.rawValue, indicator);
    if (Math.abs(recomputed - observation.normalizedPressure) > SCORE_TOLERANCE) {
      throw new Error(`CIVX 2023: ${indicator.indicatorId}/${input.regionId} raw and normalized pressure disagree`);
    }
    return {
      ...indicator,
      expectedBounds: { ...indicator.expectedBounds },
      indicatorId: observation.indicatorId,
      rawValue: observation.rawValue,
      normalizedPressure: observation.normalizedPressure,
      frozenValuePointer: observation.frozenValuePointer,
      normalizationValuePointer: observation.normalizationValuePointer,
      contributionToDimension: observation.normalizedPressure * indicator.withinDimensionWeight,
      contributionToOverall: observation.normalizedPressure * indicator.effectiveWeight,
    };
  });
  const aggregate = aggregateValidated(indexed, model);
  const maximumDimensionScore = Math.max(...aggregate.dimensions.map((dimension) => dimension.score));
  const minimumDimensionScore = Math.min(...aggregate.dimensions.map((dimension) => dimension.score));
  const descendingIndicators = indicators.map((indicator, index) => ({ indicator, index }));
  descendingIndicators.sort((left, right) => right.indicator.normalizedPressure - left.indicator.normalizedPressure || left.index - right.index);
  return {
    regionId: input.regionId,
    regionName: input.regionName,
    referenceYear: 2023,
    modelId: model.modelId,
    modelVersion: model.modelVersion,
    overallPressureScore: aggregate.overallPressureScore,
    dimensions: aggregate.dimensions,
    indicators,
    facts: {
      highestPressureDimensionIds: aggregate.dimensions.filter((dimension) => dimension.score === maximumDimensionScore).map((dimension) => dimension.dimensionId),
      lowestPressureDimensionIds: aggregate.dimensions.filter((dimension) => dimension.score === minimumDimensionScore).map((dimension) => dimension.dimensionId),
      indicatorIdsByDescendingPressure: descendingIndicators.map(({ indicator }) => indicator.indicatorId),
    },
  };
}

/** Validate a region's raw/pressure identity against the fixed model, without refitting anchors. */
export function scoreRegion2023(input: RegionInput2023, model: Model2023): RegionScore2023 {
  assertModel2023(model);
  return scoreValidated(input, model);
}

export function scoreCohort2023(inputs: readonly RegionInput2023[], model: Model2023): RegionScore2023[] {
  assertModel2023(model);
  if (!Array.isArray(inputs) || inputs.length !== model.regions.length) {
    throw new Error("CIVX 2023: exactly 27 region inputs are required");
  }
  const expected = new Set(model.regions.map((region) => region.id));
  const indexed = new Map<string, RegionInput2023>();
  for (const input of inputs) {
    if (!expected.has(input.regionId)) {
      throw new Error(`CIVX 2023: unknown region ${input.regionId}`);
    }
    if (indexed.has(input.regionId)) {
      throw new Error(`CIVX 2023: duplicate region ${input.regionId}`);
    }
    indexed.set(input.regionId, input);
  }
  return model.regions.map((region) => scoreValidated(indexed.get(region.id)!, model));
}
