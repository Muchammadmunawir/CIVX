import { assertModel2023 } from "./model-2023.ts";
import type { Model2023 } from "./model-2023.ts";
import type { RegionScore2023 } from "./scoring-2023.ts";

export interface InsightScoringRegion2023 extends RegionScore2023 {
  readonly province: string;
  readonly type: string;
  readonly boundaryReference: string;
  readonly registryPointer: string;
}

export interface ScoringDataset2023 {
  readonly datasetId: string;
  readonly version: number;
  readonly status: string;
  readonly referenceYear: number;
  readonly model: Model2023;
  readonly regions: readonly InsightScoringRegion2023[];
}

const SCORE_TOLERANCE = 1e-10;

function requireInput(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`CIVX 2023 insight input: ${message}`);
}

function finite(value: unknown, label: string): asserts value is number {
  requireInput(typeof value === "number" && Number.isFinite(value), `${label} must be finite`);
}

function score(value: unknown, label: string): asserts value is number {
  finite(value, label);
  requireInput(value >= 0 && value <= 100, `${label} must be between 0 and 100`);
}

function contribution(value: unknown, label: string): asserts value is number {
  finite(value, label);
  requireInput(value >= 0, `${label} must be nonnegative`);
}

function identity(actual: number, expected: number, label: string): void {
  requireInput(Math.abs(actual - expected) <= SCORE_TOLERANCE, `${label} contribution identity changed`);
}

function orderedIds(actual: readonly string[], expected: readonly string[], label: string): void {
  requireInput(Array.isArray(actual) && actual.length === expected.length && actual.every((id, index) => id === expected[index]), `${label} membership or order changed`);
}

function requireArrayLength(value: unknown, length: number, message: string): void {
  requireInput(Array.isArray(value) && value.length === length, message);
}

/** Consume verified score records, without normalizing observations or running a scorer. */
export function assertScoringDataset2023(input: ScoringDataset2023): void {
  requireInput(input !== null && typeof input === "object", "dataset must be an object");
  requireInput(input.datasetId === "civx-jabar-2023-pressure-scores" && input.version === 1 && input.status === "SCORED_NOT_RELEASED" && input.referenceYear === 2023, "dataset identity, version, status or year changed");
  assertModel2023(input.model);
  const model = input.model;
  requireArrayLength(input.regions, 27, "expected exactly 27 regions");
  const dimensionIds = model.dimensions.map(({ dimensionId }) => dimensionId);
  const indicatorIds = model.indicators.map(({ indicatorId }) => indicatorId);
  orderedIds(input.regions.map(({ regionId }) => regionId), model.regions.map(({ id }) => id), "regions");

  for (const [regionIndex, region] of input.regions.entries()) {
    const label = region.regionId;
    requireInput(region.regionName === model.regions[regionIndex].name && region.referenceYear === 2023 && region.modelId === model.modelId && region.modelVersion === model.modelVersion, `${label} identity, model or year changed`);
    requireInput(region.province === "Jawa Barat" && region.type === (regionIndex < 18 ? "kabupaten" : "kota"), `${label} geography changed`);
    requireInput(region.boundaryReference === "BPS kabupaten/kota code, Peraturan BPS No. 3 Tahun 2019" && region.registryPointer === `/regions/${regionIndex}`, `${label} registry provenance changed`);
    score(region.overallPressureScore, `${label} overall pressure`);
    requireArrayLength(region.dimensions, 6, `${label} expected exactly six dimensions`);
    requireArrayLength(region.indicators, 18, `${label} expected exactly 18 indicators`);
    orderedIds(region.dimensions.map(({ dimensionId }) => dimensionId), dimensionIds, `${label} dimensions`);
    orderedIds(region.indicators.map(({ indicatorId }) => indicatorId), indicatorIds, `${label} indicators`);

    for (const [index, dimension] of region.dimensions.entries()) {
      const expected = model.dimensions[index];
      requireInput(dimension.displayName === expected.displayName && dimension.weight === expected.weight && dimension.exactFraction === expected.exactFraction, `${label}/${dimension.dimensionId} model fields changed`);
      score(dimension.score, `${label}/${dimension.dimensionId} score`);
      contribution(dimension.contributionToOverall, `${label}/${dimension.dimensionId} contribution`);
      identity(dimension.contributionToOverall, dimension.score * dimension.weight, `${label}/${dimension.dimensionId}`);
    }
    for (const [index, indicator] of region.indicators.entries()) {
      const expected = model.indicators[index];
      const indicatorLabel = `${label}/${indicator.indicatorId}`;
      for (const key of ["indicatorId", "dimensionId", "displayName", "unit", "pressureDirection", "minimum", "maximum", "frozenIndicatorPointer", "withinDimensionWeight", "dimensionWeight", "effectiveWeight", "exactWithinFraction", "exactDimensionFraction", "exactEffectiveFraction"] as const) {
        requireInput(indicator[key] === expected[key], `${indicatorLabel} ${key} differs from model`);
      }
      requireInput(indicator.expectedBounds?.minimum === expected.expectedBounds.minimum && indicator.expectedBounds?.maximum === expected.expectedBounds.maximum, `${indicatorLabel} expected bounds differ from model`);
      finite(indicator.rawValue, `${indicatorLabel} raw value`);
      requireInput(indicator.rawValue >= expected.expectedBounds.minimum && (expected.expectedBounds.maximum === null || indicator.rawValue <= expected.expectedBounds.maximum), `${indicatorLabel} raw value exceeds physical bounds`);
      requireInput(indicator.rawValue >= expected.minimum && indicator.rawValue <= expected.maximum, `${indicatorLabel} raw value exceeds frozen anchors`);
      score(indicator.normalizedPressure, `${indicatorLabel} normalized pressure`);
      contribution(indicator.contributionToDimension, `${indicatorLabel} dimension contribution`);
      contribution(indicator.contributionToOverall, `${indicatorLabel} overall contribution`);
      identity(indicator.contributionToDimension, indicator.normalizedPressure * indicator.withinDimensionWeight, indicatorLabel);
      identity(indicator.contributionToOverall, indicator.normalizedPressure * indicator.effectiveWeight, indicatorLabel);
      const observationPointer = `/indicators/${index}/observations/${regionIndex}`;
      requireInput(indicator.frozenValuePointer === `${observationPointer}/value` && indicator.normalizationValuePointer === `${observationPointer}/normalizedPressure/min_max`, `${indicatorLabel} observation provenance changed`);
    }

    // Check recorded contribution identities; do not derive replacement scores.
    identity(region.dimensions.reduce((total, item) => total + item.contributionToOverall, 0), region.overallPressureScore, `${label} dimension total`);
    identity(region.indicators.reduce((total, item) => total + item.contributionToOverall, 0), region.overallPressureScore, `${label} indicator total`);
    for (const dimension of region.dimensions) {
      identity(region.indicators.filter(({ dimensionId }) => dimensionId === dimension.dimensionId).reduce((total, item) => total + item.contributionToDimension, 0), dimension.score, `${label}/${dimension.dimensionId} indicator total`);
    }
    const highest = Math.max(...region.dimensions.map(({ score: value }) => value));
    const lowest = Math.min(...region.dimensions.map(({ score: value }) => value));
    orderedIds(region.facts.highestPressureDimensionIds, region.dimensions.filter(({ score: value }) => value === highest).map(({ dimensionId }) => dimensionId), `${label} highest dimensions`);
    orderedIds(region.facts.lowestPressureDimensionIds, region.dimensions.filter(({ score: value }) => value === lowest).map(({ dimensionId }) => dimensionId), `${label} lowest dimensions`);
    const descending = region.indicators.map((indicator, index) => ({ indicator, index })).sort((left, right) => right.indicator.normalizedPressure - left.indicator.normalizedPressure || left.index - right.index);
    orderedIds(region.facts.indicatorIdsByDescendingPressure, descending.map(({ indicator }) => indicator.indicatorId), `${label} pressure facts`);
  }
}
