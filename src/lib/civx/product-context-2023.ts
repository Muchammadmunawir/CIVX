import type { CivxContextItem2023 } from "./product-types-2023.ts";
import type {
  CivxContextProductItem2023,
  CivxContextProductSection2023,
  CivxContextProductSectionId2023,
} from "./product-view-types-2023.ts";

interface ContextSectionDefinition2023 {
  readonly sectionId: CivxContextProductSectionId2023;
  readonly title: string;
  readonly slots: readonly { readonly datasetId: string; readonly title: string }[];
}

const sections: readonly ContextSectionDefinition2023[] = [
  {
    sectionId: "mobility_transport",
    title: "Konteks Mobilitas dan Transportasi",
    slots: [
      { datasetId: "context_traffic_bandung_2024_after_speed", title: "Observasi Kecepatan Ruas Jalan setelah Penanganan" },
      { datasetId: "context_traffic_bandung_2024_after_vc_ratio", title: "Observasi Rasio Volume/Kapasitas Ruas Jalan setelah Penanganan" },
      { datasetId: "context_transport_type_c_terminal_inventory_2023", title: "Inventaris Terminal Tipe C" },
      { datasetId: "context_transport_commuter_share_jabodetabek_2023", title: "Mobilitas Regional" },
    ],
  },
  {
    sectionId: "public_safety_context",
    title: "Konteks Keamanan",
    slots: [
      { datasetId: "context_crime_podes_theft_villages_jabar_2024", title: "Desa/Kelurahan dengan Kejadian Pencurian (Podes)" },
    ],
  },
  {
    sectionId: "environmental_context",
    title: "Konteks Lingkungan",
    slots: [
      { datasetId: "context_air_pollution_klh_site_ispu_20261029", title: "Observasi ISPU Keseluruhan di Stasiun Pemantauan" },
      { datasetId: "context_air_pollution_klh_site_pm25_ispu_20261029", title: "Observasi ISPU Komponen PM2.5 di Stasiun Pemantauan" },
    ],
  },
];

function buildItem(item: CivxContextItem2023, title: string): CivxContextProductItem2023 {
  const { dataset, record } = item;
  const base = {
    scope: item.scope,
    coreScoreAffected: dataset.coreScoreAffected,
    datasetId: dataset.datasetId,
    title,
    unit: dataset.unit,
    referencePeriod: record.referencePeriod,
    definition: dataset.definition,
    numerator: dataset.numerator,
    denominator: dataset.denominator,
    geographicLevel: dataset.geographicLevel,
    observations: record.observations.map((observation) => ({
      observationId: observation.observationId,
      geographicLevel: observation.geographicLevel,
      siteId: observation.siteId,
      siteName: observation.siteName,
      period: observation.period,
      value: observation.value,
      unit: observation.unit,
      sourceId: observation.sourceRef,
      sourceLocator: observation.sourceLocator,
      sourceValue: observation.sourceValue,
      limitations: observation.limitations,
      evidencePointer: observation.evidencePointer,
    })),
    sources: dataset.sources.map((source) => ({
      sourceId: source.sourceId,
      publisher: source.publisher,
      title: source.title,
      url: source.url,
      locator: null,
      publicationDate: source.publicationDate,
      accessedAt: source.accessedAt,
    })),
    coverage: {
      coveredRegions: dataset.coverage.regionCount,
      totalRegions: dataset.coverage.totalCivxRegions,
    },
    disclosure: {
      limitations: [...dataset.limitations, ...dataset.knownBiases],
      temporalWarning: dataset.temporalWarning,
      usageNotes: dataset.licenseOrUsageNotes,
      comparisonPermitted: false as const,
      comparisonReason: dataset.comparability.reason,
      artifactPath: dataset.artifactPath,
      rawAuditPath: dataset.rawAuditPath,
      candidatePointer: dataset.candidatePointer,
    },
  };

  if (record.valueStatus === "published_region_value") {
    if (record.value === null || record.missingReason !== null) {
      throw new Error(`CIVX 2023 product context: invalid published value for ${dataset.datasetId}`);
    }
    return { ...base, availability: "AVAILABLE", value: record.value, missingReason: null };
  }
  if (record.value !== null || record.missingReason === null) {
    throw new Error(`CIVX 2023 product context: invalid missing or site-only value for ${dataset.datasetId}`);
  }
  return {
    ...base,
    availability: record.valueStatus === "site_observations_only" ? "SITE_OBSERVATIONS_ONLY" : "NOT_COVERED",
    value: null,
    missingReason: record.missingReason,
  };
}

/** Present the seven reviewed context slots without aggregation, imputation, or scoring. */
export function buildContextProductSections2023(
  items: readonly CivxContextItem2023[],
): readonly CivxContextProductSection2023[] {
  return sections.map((section) => ({
    scope: "CONTEXT",
    coreScoreAffected: false,
    sectionId: section.sectionId,
    title: section.title,
    items: section.slots.map((slot) => {
      const item = items.find((candidate) => candidate.dataset.datasetId === slot.datasetId);
      if (!item) throw new Error(`CIVX 2023 product context: missing reviewed slot ${slot.datasetId}`);
      return buildItem(item, slot.title);
    }),
  }));
}
