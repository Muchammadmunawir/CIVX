import { getRegionProfile2023 } from "./repository-2023.ts";
import type { CivxRegionProfile2023 } from "./product-types-2023.ts";
import type {
  CivxComparisonRelation2023,
  CivxDimensionComparisonResult2023,
  CivxIndicatorComparisonResult2023,
  CivxPressureDifference2023,
  CivxRegionComparison2023,
} from "./comparison-types-2023.ts";

export class CivxComparisonRegionNotFoundError2023 extends Error {
  readonly code = "REGION_NOT_FOUND";
  readonly regionId: string;
  readonly side: "A" | "B";

  constructor(regionId: string, side: "A" | "B") {
    super(`CIVX comparison 2023: unknown region ${side} ID ${JSON.stringify(regionId)}`);
    this.name = "CivxComparisonRegionNotFoundError2023";
    this.regionId = regionId;
    this.side = side;
  }
}

function requireRegion(regionId: string, side: "A" | "B"): CivxRegionProfile2023 {
  const region = getRegionProfile2023(regionId);
  if (region === undefined) throw new CivxComparisonRegionNotFoundError2023(regionId, side);
  return region;
}

function relation(delta: number): CivxComparisonRelation2023 {
  return delta > 0 ? "A_HIGHER" : delta < 0 ? "B_HIGHER" : "EQUAL";
}

function largestDifferences<T extends CivxPressureDifference2023>(items: readonly T[], count: number): readonly T[] {
  // ECMAScript's stable sort preserves canonical input order for exact gap ties.
  // Sort a copy so the complete dimension/indicator collections stay canonical.
  return Object.freeze([...items].sort((left, right) => right.absoluteDifference - left.absoluteDifference).slice(0, count));
}

/**
 * Compare only recorded CORE pressure values from the frozen 2023 repository.
 * Every delta is A minus B. Equality is exact; no rounding or tolerance applies.
 * Unknown IDs throw; identical IDs produce zero differences in canonical order.
 */
export function compareRegions2023(regionAId: string, regionBId: string): CivxRegionComparison2023 {
  const regionA = requireRegion(regionAId, "A");
  const regionB = regionAId === regionBId ? regionA : requireRegion(regionBId, "B");
  const coreA = regionA.core;
  const coreB = regionB.core;
  const overallDelta = coreA.overallScore - coreB.overallScore;

  // The validated versioned repository guarantees matching membership and order.
  const dimensions = Object.freeze(coreA.dimensions.map((dimensionA, index): CivxDimensionComparisonResult2023 => {
    const dimensionB = coreB.dimensions[index];
    const delta = dimensionA.score - dimensionB.score;
    return Object.freeze({
      dimensionId: dimensionA.dimensionId,
      dimensionName: dimensionA.displayName,
      regionAScore: dimensionA.score,
      regionBScore: dimensionB.score,
      delta,
      absoluteDifference: Math.abs(delta),
      relation: relation(delta),
    });
  }));

  const indicators = Object.freeze(coreA.indicators.map((indicatorA, index): CivxIndicatorComparisonResult2023 => {
    const indicatorB = coreB.indicators[index];
    const delta = indicatorA.normalizedPressure - indicatorB.normalizedPressure;
    return Object.freeze({
      indicatorId: indicatorA.indicatorId,
      indicatorName: indicatorA.displayName,
      dimensionId: indicatorA.dimensionId,
      pressureDirection: indicatorA.pressureDirection,
      unit: indicatorA.unit,
      referencePeriod: indicatorA.evidence.indicator.referencePeriod,
      rawValueA: indicatorA.rawValue,
      rawValueB: indicatorB.rawValue,
      normalizedPressureA: indicatorA.normalizedPressure,
      normalizedPressureB: indicatorB.normalizedPressure,
      scoringPointerA: indicatorA.evidence.scoringPointer,
      scoringPointerB: indicatorB.evidence.scoringPointer,
      delta,
      absoluteDifference: Math.abs(delta),
      relation: relation(delta),
    });
  }));

  return Object.freeze({
    referenceYear: regionA.metadata.referenceYear,
    scope: "CORE",
    regionA: regionA.region,
    regionB: regionB.region,
    overall: Object.freeze({
      regionAScore: coreA.overallScore,
      regionBScore: coreB.overallScore,
      delta: overallDelta,
      absoluteDifference: Math.abs(overallDelta),
      relation: relation(overallDelta),
    }),
    dimensions,
    indicators,
    highlights: Object.freeze({
      largestDimensionDifferences: largestDifferences(dimensions, 3),
      largestNormalizedPressureDifferences: largestDifferences(indicators, 5),
    }),
    metadata: Object.freeze({
      modelId: regionA.metadata.modelId,
      modelVersion: regionA.metadata.modelVersion,
      cohortSize: regionA.metadata.cohortSize,
      deltaConvention: "A_MINUS_B",
      indicatorDifferenceMetric: "normalized_pressure",
      equalityPolicy: "exact_recorded_value",
      interpretation: regionA.metadata.interpretation,
      scoreArtifact: regionA.metadata.scoreArtifact,
    }),
  });
}
