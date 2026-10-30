import type {
  CivxArtifactFingerprint2023,
  CivxDimensionProfile2023,
  CivxIndicatorProfile2023,
  CivxInsight2023,
  CivxRegionSummary2023,
} from "./product-types-2023.ts";
import type { CivxComparisonRelation2023, CivxRegionComparison2023 } from "./comparison-types-2023.ts";

export type CivxRegionProductHeader2023 = Pick<CivxRegionSummary2023, "id" | "name" | "type" | "province" | "referenceYear">;
export type CivxDimensionProduct2023 = Pick<CivxDimensionProfile2023, "scope" | "dimensionId" | "displayName" | "score">;
export type CivxProductAvailability2023 = "AVAILABLE" | "NOT_COVERED" | "SITE_OBSERVATIONS_ONLY";
export type CivxContextProductSectionId2023 = "mobility_transport" | "public_safety_context" | "environmental_context";

export interface CivxProductSource2023 {
  readonly sourceId: string;
  readonly publisher: string;
  readonly title: string | null;
  readonly url: string;
  readonly locator: string | null;
  readonly publicationDate: string | null;
  readonly accessedAt: string | null;
}

export interface CivxProductUncertainty2023 {
  readonly note: string | null;
  readonly sourceLocator: string | null;
  readonly weightedDenominator: number | null;
  readonly unweightedSampleSize: number | null;
  readonly confidenceInterval: {
    readonly confidenceLevel: number;
    readonly lower: number;
    readonly upper: number;
  } | null;
  readonly standardErrorPercentagePoints: number | null;
  readonly relativeStandardErrorPercent: number | null;
  readonly rseGreaterThan25Percent: boolean | null;
}

export interface CivxIndicatorProduct2023 {
  readonly scope: "CORE";
  readonly indicatorId: string;
  readonly displayName: string;
  readonly dimensionId: string;
  readonly dimensionName: string;
  readonly rawValue: number;
  readonly unit: string;
  readonly normalizedPressure: number;
  readonly pressureDirection: CivxIndicatorProfile2023["pressureDirection"];
  readonly referencePeriod: string;
  readonly disclosure: {
    readonly definition: string;
    readonly numerator: string;
    readonly denominator: string;
    readonly source: CivxProductSource2023;
    readonly numeratorSource: CivxProductSource2023 | null;
    readonly denominatorSource: CivxProductSource2023 | null;
    readonly limitations: readonly string[];
    readonly uncertainty: CivxProductUncertainty2023;
    readonly scoringPointer: string;
    readonly frozenIndicatorPointer: string;
    readonly frozenValuePointer: string;
    readonly normalizationValuePointer: string;
  };
}

export interface CivxCoreProduct2023 {
  readonly scope: "CORE";
  readonly label: "Tekanan Relatif CIVX";
  readonly overallScore: number;
  readonly dimensions: readonly CivxDimensionProduct2023[];
  readonly indicators: readonly CivxIndicatorProduct2023[];
  readonly insights: readonly CivxInsight2023[];
}

export interface CivxContextProductObservation2023 {
  readonly observationId: string;
  readonly geographicLevel: string;
  readonly siteId: string | null;
  readonly siteName: string | null;
  readonly period: string;
  readonly value: number;
  readonly unit: string;
  readonly sourceId: string;
  readonly sourceLocator: string;
  readonly sourceValue: number | string;
  readonly limitations: readonly string[];
  readonly evidencePointer: string;
}

interface CivxContextProductItemBase2023 {
  readonly scope: "CONTEXT";
  readonly coreScoreAffected: false;
  readonly datasetId: string;
  readonly title: string;
  readonly unit: string;
  readonly referencePeriod: string;
  readonly definition: string;
  readonly numerator: string | null;
  readonly denominator: string | null;
  readonly geographicLevel: string;
  readonly observations: readonly CivxContextProductObservation2023[];
  readonly sources: readonly CivxProductSource2023[];
  readonly coverage: {
    readonly coveredRegions: number;
    readonly totalRegions: 27;
  };
  readonly disclosure: {
    readonly limitations: readonly string[];
    readonly temporalWarning: string;
    readonly usageNotes: string;
    readonly comparisonPermitted: false;
    readonly comparisonReason: string;
    readonly artifactPath: string;
    readonly rawAuditPath: string;
    readonly candidatePointer: string;
  };
}

/** Availability narrows the scalar: missing and site-only data can never be numeric. */
export type CivxContextProductItem2023 = CivxContextProductItemBase2023 & (
  | { readonly availability: "AVAILABLE"; readonly value: number; readonly missingReason: null }
  | { readonly availability: "NOT_COVERED"; readonly value: null; readonly missingReason: string }
  | { readonly availability: "SITE_OBSERVATIONS_ONLY"; readonly value: null; readonly missingReason: string }
);

export interface CivxContextProductSection2023 {
  readonly scope: "CONTEXT";
  readonly coreScoreAffected: false;
  readonly sectionId: CivxContextProductSectionId2023;
  readonly title: string;
  readonly items: readonly CivxContextProductItem2023[];
}

export interface CivxProductMethodology2023 {
  readonly referenceYear: 2023;
  readonly cohortSize: 27;
  readonly province: string;
  readonly geographicLevel: string;
  readonly modelId: string;
  readonly modelVersion: number;
  readonly pressureScale: readonly [0, 100];
  readonly higherIsHigherRelativePressure: true;
  readonly zeroMeansNoPressure: false;
  readonly hundredMeansTheoreticalMaximumHarm: false;
  readonly contextAffectsCore: false;
  readonly interpretation: string;
  readonly notes: readonly string[];
  readonly scoreStatus: "SCORED_NOT_RELEASED";
  readonly insightStatus: "INSIGHTS_NOT_RELEASED";
  readonly productionIntegrationAuthorized: false;
  readonly publicRankingGenerated: false;
  readonly sources: {
    readonly scoreArtifact: CivxArtifactFingerprint2023;
    readonly insightArtifact: CivxArtifactFingerprint2023;
    readonly freezePath: string;
    readonly normalizationPath: string;
    readonly weightingPath: string;
    readonly registryPath: string;
  };
}

export interface CivxRegionProductView2023 {
  readonly region: CivxRegionProductHeader2023;
  readonly core: CivxCoreProduct2023;
  readonly context: readonly CivxContextProductSection2023[];
  readonly methodology: CivxProductMethodology2023;
}

export interface CivxExploreRegionProduct2023 {
  readonly region: CivxRegionProductHeader2023;
  readonly core: {
    readonly scope: "CORE";
    readonly overallScore: number;
    readonly dimensions: readonly CivxDimensionProduct2023[];
  };
}

export interface CivxComparisonProductView2023 {
  readonly referenceYear: 2023;
  readonly regionA: CivxRegionProductHeader2023;
  readonly regionB: CivxRegionProductHeader2023;
  readonly core: Pick<CivxRegionComparison2023, "scope" | "overall" | "dimensions" | "indicators" | "highlights" | "metadata">;
  readonly context: {
    readonly scope: "CONTEXT";
    readonly comparisonPermitted: false;
    readonly regionA: readonly CivxContextProductSection2023[];
    readonly regionB: readonly CivxContextProductSection2023[];
  };
  readonly presentation: {
    readonly overallLabel: string;
    readonly dimensionDifferenceLabel: string;
    readonly indicatorDifferenceLabel: string;
    readonly indicatorHighlightNote: string;
    readonly relationLabels: Readonly<Record<CivxComparisonRelation2023, string>>;
  };
  readonly methodology: CivxProductMethodology2023;
}
