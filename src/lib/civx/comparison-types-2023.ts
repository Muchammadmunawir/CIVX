import type {
  CivxArtifactFingerprint2023,
  CivxIndicatorProfile2023,
  CivxRegionSummary2023,
} from "./product-types-2023.ts";

/** Higher means higher relative pressure, never better/worse regional performance. */
export type CivxComparisonRelation2023 = "A_HIGHER" | "B_HIGHER" | "EQUAL";

export interface CivxPressureDifference2023 {
  /** Always value A minus value B, using unrounded recorded pressure values. */
  readonly delta: number;
  readonly absoluteDifference: number;
  readonly relation: CivxComparisonRelation2023;
}

export interface CivxOverallComparison2023 extends CivxPressureDifference2023 {
  readonly regionAScore: number;
  readonly regionBScore: number;
}

export interface CivxDimensionComparisonResult2023 extends CivxOverallComparison2023 {
  readonly dimensionId: string;
  readonly dimensionName: string;
}

export interface CivxIndicatorComparisonResult2023 extends CivxPressureDifference2023 {
  readonly indicatorId: string;
  readonly indicatorName: string;
  readonly dimensionId: string;
  readonly pressureDirection: CivxIndicatorProfile2023["pressureDirection"];
  readonly unit: string;
  readonly referencePeriod: string;
  readonly rawValueA: number;
  readonly rawValueB: number;
  readonly normalizedPressureA: number;
  readonly normalizedPressureB: number;
  readonly scoringPointerA: string;
  readonly scoringPointerB: string;
}

export interface CivxComparisonMetadata2023 {
  readonly modelId: string;
  readonly modelVersion: number;
  readonly cohortSize: 27;
  readonly deltaConvention: "A_MINUS_B";
  readonly indicatorDifferenceMetric: "normalized_pressure";
  readonly equalityPolicy: "exact_recorded_value";
  readonly interpretation: string;
  readonly scoreArtifact: CivxArtifactFingerprint2023;
}

export interface CivxRegionComparison2023 {
  readonly referenceYear: 2023;
  readonly scope: "CORE";
  readonly regionA: CivxRegionSummary2023;
  readonly regionB: CivxRegionSummary2023;
  readonly overall: CivxOverallComparison2023;
  readonly dimensions: readonly CivxDimensionComparisonResult2023[];
  readonly indicators: readonly CivxIndicatorComparisonResult2023[];
  readonly highlights: {
    readonly largestDimensionDifferences: readonly CivxDimensionComparisonResult2023[];
    /** Within-indicator cohort-scale gaps, not causal importance or policy priorities. */
    readonly largestNormalizedPressureDifferences: readonly CivxIndicatorComparisonResult2023[];
  };
  readonly metadata: CivxComparisonMetadata2023;
}
