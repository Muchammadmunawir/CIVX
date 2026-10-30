import { getRegions2023, getRegionProfile2023 } from "./repository-2023.ts";
import { compareRegions2023, CivxComparisonRegionNotFoundError2023 } from "./comparison-2023.ts";
import { buildContextProductSections2023 } from "./product-context-2023.ts";
import type { CivxIndicatorProfile2023, CivxRegionProfile2023 } from "./product-types-2023.ts";
import type {
  CivxComparisonProductView2023,
  CivxDimensionProduct2023,
  CivxExploreRegionProduct2023,
  CivxIndicatorProduct2023,
  CivxProductMethodology2023,
  CivxProductSource2023,
  CivxProductUncertainty2023,
  CivxRegionProductView2023,
} from "./product-view-types-2023.ts";

/** Match repository immutability without copying already-frozen authoritative data. */
function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

const profiles = getRegions2023().map(({ id }): CivxRegionProfile2023 => {
  const profile = getRegionProfile2023(id);
  if (profile === undefined) throw new Error(`CIVX product 2023: canonical region ${id} has no profile`);
  return profile;
});
const model = profiles[0].metadata;
const methodology = deepFreeze<CivxProductMethodology2023>({
  referenceYear: model.referenceYear,
  cohortSize: model.cohortSize,
  province: model.geography.province,
  geographicLevel: model.geography.level,
  modelId: model.modelId,
  modelVersion: model.modelVersion,
  pressureScale: model.pressureScale,
  higherIsHigherRelativePressure: model.higherIsHigherRelativePressure,
  zeroMeansNoPressure: false,
  hundredMeansTheoreticalMaximumHarm: false,
  contextAffectsCore: false,
  interpretation: model.interpretation,
  notes: [
    "Skor CIVX menunjukkan tekanan relatif dalam kelompok 27 kabupaten/kota Jawa Barat tahun 2023.",
    "Skor lebih tinggi berarti tekanan relatif lebih tinggi.",
    "Nilai 0 bukan berarti tanpa tekanan; nilai 100 bukan batas teoretis terburuk.",
    "Data konteks tidak memengaruhi skor CIVX.",
  ],
  scoreStatus: model.scoreStatus,
  insightStatus: model.insightStatus,
  productionIntegrationAuthorized: model.productionIntegrationAuthorized,
  publicRankingGenerated: model.publicRankingGenerated,
  sources: {
    scoreArtifact: model.scoreArtifact,
    insightArtifact: model.insightArtifact,
    freezePath: model.provenance.freezePath,
    normalizationPath: model.provenance.normalizationPath,
    weightingPath: model.provenance.weightingPath,
    registryPath: model.geography.registry,
  },
});

interface ProductSourceInput2023 {
  readonly artifactId: string;
  readonly publisher: string;
  readonly title?: string;
  readonly url: string;
  readonly table: string;
  readonly publicationDate?: string;
  readonly accessedAt?: string;
}

function productSource(source: ProductSourceInput2023): CivxProductSource2023 {
  return {
    sourceId: source.artifactId,
    publisher: source.publisher,
    title: source.title ?? null,
    url: source.url,
    locator: source.table,
    publicationDate: source.publicationDate ?? null,
    accessedAt: source.accessedAt ?? null,
  };
}

function productUncertainty(indicator: CivxIndicatorProfile2023): CivxProductUncertainty2023 {
  const metadata = indicator.evidence.indicator.uncertainty;
  const observation = indicator.evidence.observation;
  const published = "uncertainty" in observation ? observation.uncertainty : null;
  const precision = "precision" in observation ? observation.precision : null;
  const denominator = "denominator" in observation ? observation.denominator : null;
  const metadataNote = typeof metadata === "string" ? metadata : metadata === null ? null : metadata.type;
  let confidenceInterval: CivxProductUncertainty2023["confidenceInterval"] = null;
  let standardErrorPercentagePoints: number | null = null;
  let relativeStandardErrorPercent: number | null = null;
  let rseGreaterThan25Percent: boolean | null = null;
  let sourceLocator: string | null = null;

  if (published !== null) {
    confidenceInterval = { confidenceLevel: published.confidenceLevel, lower: published.lower, upper: published.upper };
    if ("standardErrorPercentagePoints" in published) standardErrorPercentagePoints = published.standardErrorPercentagePoints;
    if ("relativeStandardErrorPercent" in published) relativeStandardErrorPercent = published.relativeStandardErrorPercent;
    if ("rseGreaterThan25Percent" in published) rseGreaterThan25Percent = published.rseGreaterThan25Percent;
    if ("locator" in published) sourceLocator = published.locator;
  } else if (precision !== null) {
    sourceLocator = `Table ${"table" in precision ? precision.table : precision.sourceTable}; PDF ${precision.pdfPage}`;
    if ("confidenceInterval95" in precision) {
      confidenceInterval = { confidenceLevel: 0.95, lower: precision.confidenceInterval95[0], upper: precision.confidenceInterval95[1] };
    }
    standardErrorPercentagePoints = "standardErrorPercentagePoints" in precision
      ? precision.standardErrorPercentagePoints : precision.derivedAnyCoverageStandardErrorPercentagePoints;
    if ("relativeStandardErrorPercent" in precision) relativeStandardErrorPercent = precision.relativeStandardErrorPercent;
  }

  return {
    note: metadataNote ?? (precision !== null && "note" in precision ? precision.note : null),
    sourceLocator,
    weightedDenominator: denominator === null ? null : denominator.weightedN,
    unweightedSampleSize: denominator === null ? null : denominator.unweightedN,
    confidenceInterval,
    standardErrorPercentagePoints,
    relativeStandardErrorPercent,
    rseGreaterThan25Percent,
  };
}

const dimensionNames = new Map(profiles[0].core.dimensions.map((dimension) => [dimension.dimensionId, dimension.displayName]));
const views = profiles.map((profile): CivxRegionProductView2023 => {
  return deepFreeze<CivxRegionProductView2023>({
    region: {
      id: profile.region.id,
      name: profile.region.name,
      type: profile.region.type,
      province: profile.region.province,
      referenceYear: profile.region.referenceYear,
    },
    core: {
      scope: "CORE",
      label: "Tekanan Relatif CIVX",
      overallScore: profile.core.overallScore,
      dimensions: profile.core.dimensions.map((dimension): CivxDimensionProduct2023 => ({
        scope: dimension.scope,
        dimensionId: dimension.dimensionId,
        displayName: dimension.displayName,
        score: dimension.score,
      })),
      indicators: profile.core.indicators.map((indicator): CivxIndicatorProduct2023 => {
        const frozen = indicator.evidence.indicator;
        const source = frozen.sourceReference;
        const dimensionName = dimensionNames.get(indicator.dimensionId);
        if (dimensionName === undefined) throw new Error(`CIVX product 2023: unknown dimension ${indicator.dimensionId}`);
        return {
          scope: indicator.scope,
          indicatorId: indicator.indicatorId,
          displayName: indicator.displayName,
          dimensionId: indicator.dimensionId,
          dimensionName,
          rawValue: indicator.rawValue,
          unit: indicator.unit,
          normalizedPressure: indicator.normalizedPressure,
          pressureDirection: indicator.pressureDirection,
          referencePeriod: frozen.referencePeriod,
          disclosure: {
            definition: frozen.definition,
            numerator: frozen.numerator.definition,
            denominator: frozen.denominator.definition,
            source: productSource(source),
            numeratorSource: "source" in frozen.numerator && typeof frozen.numerator.source === "object" ? productSource(frozen.numerator.source) : null,
            denominatorSource: "source" in frozen.denominator && typeof frozen.denominator.source === "object" ? productSource(frozen.denominator.source) : null,
            limitations: frozen.limitations,
            uncertainty: productUncertainty(indicator),
            scoringPointer: indicator.evidence.scoringPointer,
            frozenIndicatorPointer: indicator.frozenIndicatorPointer,
            frozenValuePointer: indicator.frozenValuePointer,
            normalizationValuePointer: indicator.normalizationValuePointer,
          },
        };
      }),
      insights: profile.core.insights,
    },
    context: buildContextProductSections2023(profile.context),
    methodology,
  });
});
const viewsById = new Map(views.map((view) => [view.region.id, view]));
const explore = deepFreeze<readonly CivxExploreRegionProduct2023[]>(views.map((view) => ({
  region: view.region,
  core: { scope: "CORE", overallScore: view.core.overallScore, dimensions: view.core.dimensions },
})));
const comparisonPresentation = deepFreeze<CivxComparisonProductView2023["presentation"]>({
  overallLabel: "Selisih Tekanan Relatif CIVX",
  dimensionDifferenceLabel: "Selisih Skor Dimensi",
  indicatorDifferenceLabel: "Selisih Tekanan Ternormalisasi",
  indicatorHighlightNote: "Selisih menunjukkan jarak pada skala masing-masing indikator, bukan dampak kausal atau prioritas kebijakan.",
  relationLabels: {
    A_HIGHER: "Tekanan relatif A lebih tinggi",
    B_HIGHER: "Tekanan relatif B lebih tinggi",
    EQUAL: "Nilai tekanan tercatat sama",
  },
});

/** Exact ID lookup; unavailable IDs follow repository behavior and return undefined. */
export function getRegionProductView2023(regionId: string): CivxRegionProductView2023 | undefined {
  return viewsById.get(regionId);
}

/** Identity and frozen scores only, in canonical BPS order rather than score order. */
export function getExploreRegionsProduct2023(): readonly CivxExploreRegionProduct2023[] {
  return explore;
}

/** Shared compact disclosure for Explore or any consumer that does not need a profile. */
export function getProductMethodology2023(): CivxProductMethodology2023 {
  return methodology;
}

function requireProductView(regionId: string, side: "A" | "B"): CivxRegionProductView2023 {
  const view = getRegionProductView2023(regionId);
  if (view === undefined) throw new CivxComparisonRegionNotFoundError2023(regionId, side);
  return view;
}

/** Delegate every CORE comparison to the reviewed engine; context is display-only. */
export function getComparisonProductView2023(regionAId: string, regionBId: string): CivxComparisonProductView2023 {
  const comparison = compareRegions2023(regionAId, regionBId);
  const regionA = requireProductView(comparison.regionA.id, "A");
  const regionB = requireProductView(comparison.regionB.id, "B");
  return deepFreeze<CivxComparisonProductView2023>({
    referenceYear: comparison.referenceYear,
    regionA: regionA.region,
    regionB: regionB.region,
    core: {
      scope: comparison.scope,
      overall: comparison.overall,
      dimensions: comparison.dimensions,
      indicators: comparison.indicators,
      highlights: comparison.highlights,
      metadata: comparison.metadata,
    },
    context: {
      scope: "CONTEXT",
      comparisonPermitted: false,
      regionA: regionA.context,
      regionB: regionB.context,
    },
    presentation: comparisonPresentation,
    methodology,
  });
}
