export type RegionType = "kabupaten" | "kota";
export type PressureCategory = "lower" | "moderate" | "higher";

export interface SourceReference {
  id: string;
  publisher: string;
  title: string;
  url: string;
  table: string;
  page: string;
  dataYear: number;
  referencePeriod: string;
  artifactId: string;
  accessedAt: string;
}

export interface CivicIndexInput {
  indicatorId: string;
  value: number | null;
  unit: string;
  period: string;
  sources: readonly SourceReference[];
  missingReason?: string;
}

export interface CivicIndicatorPolicy {
  id: string;
  label: string;
  unit: string;
  direction: "higher" | "lower";
  minimum: number;
  maximum: number;
  minimumRegion: string;
  maximumRegion: string;
  sourceId: string;
  weight: number;
}

export interface CivicIndexPolicy {
  status: "approved" | "provisional";
  releaseId: string;
  methodologyVersion: string;
  referenceSetId: string;
  period: string;
  indicators: readonly CivicIndicatorPolicy[];
}

export interface CivicIndexComponent {
  indicatorId: string;
  label: string;
  value: number;
  unit: string;
  period: string;
  score: number;
  weight: number;
  contribution: number;
  direction: CivicIndicatorPolicy["direction"];
  sources: readonly SourceReference[];
}

export type CivicIndexResult =
  | { status: "unavailable"; reason: string }
  | {
      status: "available";
      score: number;
      components: CivicIndexComponent[];
      releaseId: string;
      methodologyVersion: string;
      referenceSetId: string;
      period: string;
    };

export interface RegionalData {
  id: string;
  name: string;
  province: string;
  type: RegionType;
  period: string;
  boundaryReference: string;
  observations: CivicIndexInput[];
  civicIndex: CivicIndexResult;
  category: PressureCategory | null;
  interpretation: string | null;
}

export interface RawArtifact {
  id: string;
  localPath: string;
  bytes: number;
  publicationUrl: string;
  downloadUrl: string;
  publication: string;
  publicationNumber: string;
  releasedAt: string;
  revisedAt: string;
  retrievedAt: string;
  redistribution: string;
}

export interface ProcessedCivicRelease {
  releaseId: string;
  period: string;
  referenceSetId: string;
  artifact: RawArtifact;
  methodology: CivicIndexPolicy;
  sources: SourceReference[];
  regions: RegionalData[];
  limitations: string[];
}
