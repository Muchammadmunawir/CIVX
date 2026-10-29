import type frozenArtifact from "../../../data/processed/final-indicator-freeze-2023.json";
import type scoreArtifact from "../../../data/processed/civx-scores-2023.json";
import type insightArtifact from "../../../data/processed/civx-insights-2023.json";
import type { ContextDataset2023, ContextRecord2023 } from "./contextual-data-2023.ts";
import type { CoreInsight2023 } from "./insights-2023.ts";
import type { DimensionScore2023, IndicatorScore2023 } from "./scoring-2023.ts";

/** JSON contracts are immutable throughout the product boundary, including nested evidence. */
export type CivxReadonly2023<T> = T extends object
  ? { readonly [Key in keyof T]: CivxReadonly2023<T[Key]> }
  : T;

export interface CivxRegionSummary2023 {
  readonly id: string;
  readonly name: string;
  readonly province: "Jawa Barat";
  readonly type: "kabupaten" | "kota";
  readonly referenceYear: 2023;
  readonly boundaryReference: string;
  readonly registryPointer: string;
}

type FrozenIndicator = (typeof frozenArtifact)["indicators"][number];

/** Keep source-specific metadata intact rather than flattening different audited constructs. */
export interface CivxIndicatorEvidence2023 {
  readonly indicator: CivxReadonly2023<Omit<FrozenIndicator, "observations">>;
  readonly observation: CivxReadonly2023<FrozenIndicator["observations"][number]>;
  readonly scoringPointer: string;
}

export interface CivxDimensionProfile2023 extends DimensionScore2023 {
  readonly scope: "CORE";
}

export interface CivxIndicatorProfile2023 extends IndicatorScore2023 {
  readonly scope: "CORE";
  readonly evidence: CivxIndicatorEvidence2023;
}

export type CivxInsight2023 = CoreInsight2023;

export interface CivxScore2023 {
  readonly scope: "CORE";
  readonly overallScore: number;
  readonly dimensions: readonly CivxDimensionProfile2023[];
  readonly indicators: readonly CivxIndicatorProfile2023[];
}

export interface CivxArtifactFingerprint2023 {
  readonly path: string;
  readonly sha256: string;
  readonly bytes: number;
}

export interface CivxContextDataset2023 extends Omit<ContextDataset2023, "records"> {
  readonly artifactPath: string;
  readonly provenance: {
    readonly sourceManifest: readonly CivxArtifactFingerprint2023[];
    readonly computationManifest: readonly CivxArtifactFingerprint2023[];
    readonly reproductionScope: string;
  };
}

/** Context has no normalized pressure, score contribution, or weighting fields. */
export interface CivxContextItem2023 {
  readonly scope: "CONTEXT";
  readonly dataset: CivxContextDataset2023;
  readonly record: ContextRecord2023;
}

export interface CivxModelMetadata2023 {
  readonly referenceYear: 2023;
  readonly cohortSize: 27;
  readonly modelId: string;
  readonly modelVersion: number;
  readonly normalizationMethod: "min_max";
  readonly weightingSchemeId: "equal_dimension_equal_indicator";
  readonly scoreDatasetId: "civx-jabar-2023-pressure-scores";
  readonly scoreStatus: "SCORED_NOT_RELEASED";
  readonly insightDatasetId: "civx-jabar-2023-core-insights";
  readonly insightStatus: "INSIGHTS_NOT_RELEASED";
  readonly insightEngineId: "civx-insights-2023";
  readonly insightEngineVersion: 1;
  readonly locale: "id";
  readonly pressureScale: readonly [0, 100];
  readonly higherIsHigherRelativePressure: true;
  readonly interpretation: string;
  readonly insightInterpretation: string;
  readonly referencePolicy: string;
  readonly missingPolicy: string;
  /** Reading this boundary does not authorize the later UI cutover. */
  readonly productionIntegrationAuthorized: false;
  readonly publicRankingGenerated: false;
  readonly geography: CivxReadonly2023<(typeof scoreArtifact)["geography"]>;
  readonly provenance: CivxReadonly2023<(typeof scoreArtifact)["provenance"]>;
  readonly insightProvenance: CivxReadonly2023<(typeof insightArtifact)["provenance"]>;
  readonly scoreArtifact: CivxArtifactFingerprint2023;
  readonly insightArtifact: CivxArtifactFingerprint2023;
}

export interface CivxRegionProfile2023 {
  readonly region: CivxRegionSummary2023;
  readonly core: CivxScore2023 & { readonly insights: readonly CivxInsight2023[] };
  readonly context: readonly CivxContextItem2023[];
  readonly metadata: CivxModelMetadata2023;
}
