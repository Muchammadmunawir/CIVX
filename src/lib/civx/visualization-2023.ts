import type { CivxComparisonProductView2023, CivxDimensionProduct2023, CivxExploreRegionProduct2023, CivxRegionProductHeader2023 } from "./product-view-types-2023.ts";
import type { CivxSimilarRegion2023 } from "./similar-regions-2023.ts";
import type { CivxComparisonRelation2023 } from "./comparison-types-2023.ts";

/** Presentation order and Indonesian labels; never a scoring configuration. */
export const PRESSURE_DIMENSIONS_2023 = [
  { id: "socioeconomic", label: "Sosial ekonomi" },
  { id: "education", label: "Pendidikan" },
  { id: "basic_services", label: "Layanan dasar" },
  { id: "public_health", label: "Kesehatan publik" },
  { id: "disaster_pressure", label: "Risiko bencana" },
  { id: "environment", label: "Tekanan kualitas lingkungan" },
] as const;

const indicatorLabels = [
  ["poverty", "Persentase penduduk miskin", "socioeconomic"],
  ["unemployment", "Tingkat pengangguran terbuka usia 15+", "socioeconomic"],
  ["gini_ratio", "Rasio Gini pengeluaran", "socioeconomic"],
  ["expenditure_per_capita", "Pengeluaran riil tahunan per kapita yang disesuaikan", "socioeconomic"],
  ["rls", "Rata-rata lama sekolah usia 25+", "education"],
  ["hls", "Harapan lama sekolah", "education"],
  ["apm", "Angka partisipasi murni SMA/sederajat usia 16–18", "education"],
  ["sanitation", "Akses sanitasi layak rumah tangga", "basic_services"],
  ["drinking_water", "Akses sumber air minum layak rumah tangga", "basic_services"],
  ["puskesmas_per_100k", "Ketersediaan Puskesmas per 100.000 penduduk", "basic_services"],
  ["household-floor-per-capita-le7-2", "Rumah tangga dengan luas lantai ≤7,2 m² per orang", "basic_services"],
  ["health_insurance_ownership", "Penduduk yang memiliki jaminan kesehatan", "basic_services"],
  ["nutrition_ski2023_stunting", "Prevalensi stunting usia 0–59 bulan (SKI 2023)", "public_health"],
  ["nutrition_ski2023_wasting", "Prevalensi wasting usia 0–59 bulan (SKI 2023)", "public_health"],
  ["morbidity_activity_limiting", "Angka kesakitan yang mengganggu aktivitas", "public_health"],
  ["life_expectancy_lfsp2020", "Umur harapan hidup saat lahir (basis LFSP2020)", "public_health"],
  ["irbi_overall_2023", "Indeks risiko bencana IRBI 2023", "disaster_pressure"],
  ["iklh_2023", "Indeks kualitas lingkungan hidup IKLH 2023", "environment"],
] as const;

export type PressureSeries2023 = "a" | "b" | "c" | "d";
export interface PressureComparisonRow2023 {
  readonly id: string;
  readonly label: string;
  readonly dimensionId: string;
  readonly dimensionLabel: string;
  readonly scoreA: number;
  readonly scoreB: number;
  readonly delta: number;
  readonly absoluteDifference: number;
  readonly relation: CivxComparisonRelation2023;
}
export interface PressureComparisonData2023 {
  readonly regionA: CivxRegionProductHeader2023;
  readonly regionB: CivxRegionProductHeader2023;
  readonly dimensions: readonly PressureComparisonRow2023[];
  readonly indicators: readonly PressureComparisonRow2023[];
}
export interface SimilarPressureData2023 {
  readonly series: readonly { readonly region: CivxRegionProductHeader2023; readonly slot: PressureSeries2023; readonly distance: number | null }[];
  readonly dimensions: readonly { readonly id: string; readonly label: string; readonly scores: readonly number[] }[];
}
export interface CohortPressureData2023 {
  readonly selected: CivxRegionProductHeader2023;
  readonly dimensions: readonly {
    readonly id: string;
    readonly label: string;
    readonly selectedScore: number;
    readonly median: number;
    readonly points: readonly { readonly region: CivxRegionProductHeader2023; readonly score: number; readonly lane: number }[];
  }[];
}

function pressure(value: number): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) throw new TypeError("Tekanan CORE harus lengkap, hingga, dan berada pada skala 0–100.");
}
function regionHeader(region: CivxRegionProductHeader2023): void {
  if (!region || !/^32(?:0[1-9]|1[0-8]|7[1-9])$/.test(region.id) || region.referenceYear !== 2023 || region.province !== "Jawa Barat" || region.type !== (region.id.startsWith("327") ? "kota" : "kabupaten")) {
    throw new TypeError("Visualisasi hanya menerima identitas kohort Jawa Barat 2023 yang sah.");
  }
}
export function pressureDimensionLabel2023(id: string): string {
  const dimension = PRESSURE_DIMENSIONS_2023.find(item => item.id === id);
  if (!dimension) throw new TypeError("Dimensi CORE tidak dikenal.");
  return dimension.label;
}
export function orderedPressureDimensions2023(dimensions: readonly CivxDimensionProduct2023[]): readonly CivxDimensionProduct2023[] {
  if (!Array.isArray(dimensions) || dimensions.length !== 6 || new Set(dimensions.map(dimension => dimension?.dimensionId)).size !== 6) throw new TypeError("Profil memerlukan tepat enam dimensi CORE.");
  return PRESSURE_DIMENSIONS_2023.map(({ id }) => {
    const dimension = dimensions.find(item => item?.dimensionId === id);
    if (!dimension || dimension.scope !== "CORE") throw new TypeError("Dimensi CORE tidak lengkap atau tidak sah.");
    pressure(dimension.score);
    return dimension;
  });
}
function comparisonRow(id: string, label: string, dimensionId: string, scoreA: number, scoreB: number, difference: { delta: number; absoluteDifference: number; relation: CivxComparisonRelation2023 }): PressureComparisonRow2023 {
  pressure(scoreA); pressure(scoreB);
  const { delta, absoluteDifference, relation } = difference;
  if (!Number.isFinite(delta) || delta < -100 || delta > 100 || !Number.isFinite(absoluteDifference) || absoluteDifference < 0 || absoluteDifference > 100
    || absoluteDifference !== Math.abs(delta) || (scoreA > scoreB) !== (delta > 0)
    || relation !== (delta > 0 ? "A_HIGHER" : delta < 0 ? "B_HIGHER" : "EQUAL") || (scoreA === scoreB) !== (delta === 0)) throw new TypeError("Selisih tekanan dari mesin perbandingan tidak sah.");
  return { id, label, dimensionId, dimensionLabel: pressureDimensionLabel2023(dimensionId), scoreA, scoreB, delta, absoluteDifference, relation };
}

/** Project the engine's already-recorded differences; never subtract rounded or raw indicator values. */
export function comparisonPressureData2023(view: CivxComparisonProductView2023): PressureComparisonData2023 {
  regionHeader(view.regionA); regionHeader(view.regionB);
  const { core } = view;
  if (view.referenceYear !== 2023 || core.scope !== "CORE" || core.metadata.cohortSize !== 27 || core.metadata.equalityPolicy !== "exact_recorded_value" || core.metadata.deltaConvention !== "A_MINUS_B" || core.metadata.indicatorDifferenceMetric !== "normalized_pressure"
    || core.dimensions.length !== 6 || new Set(core.dimensions.map(row => row.dimensionId)).size !== 6
    || core.indicators.length !== 18 || new Set(core.indicators.map(row => row.indicatorId)).size !== 18) throw new TypeError("Kontrak perbandingan CORE 2023 tidak lengkap.");
  const dimensions = PRESSURE_DIMENSIONS_2023.map(({ id, label }) => {
    const row = core.dimensions.find(item => item.dimensionId === id);
    if (!row) throw new TypeError("Perbandingan dimensi tidak lengkap.");
    return comparisonRow(id, label, id, row.regionAScore, row.regionBScore, row);
  });
  const indicators = indicatorLabels.map(([id, label, dimensionId]) => {
    const row = core.indicators.find(item => item.indicatorId === id);
    if (!row || row.dimensionId !== dimensionId) throw new TypeError("Perbandingan indikator tidak lengkap atau salah dimensi.");
    return comparisonRow(id, label, dimensionId, row.normalizedPressureA, row.normalizedPressureB, row);
  });
  return { regionA: view.regionA, regionB: view.regionB, dimensions, indicators };
}

/** Uses existing similarity outputs, including their exact distances and peer order. */
export function similarPressureData2023(selected: Pick<CivxExploreRegionProduct2023, "region" | "core">, peers: readonly CivxSimilarRegion2023[]): SimilarPressureData2023 {
  regionHeader(selected.region);
  if (selected.core.scope !== "CORE" || !Array.isArray(peers) || peers.length > 3) throw new TypeError("Profil serupa memerlukan CORE dan maksimal tiga wilayah pembanding.");
  const seen = new Set([selected.region.id]);
  const profiles = [orderedPressureDimensions2023(selected.core.dimensions), ...peers.map(peer => {
    regionHeader(peer.region);
    if (seen.has(peer.region.id) || !Number.isFinite(peer.distance) || peer.distance < 0) throw new TypeError("Identitas atau jarak profil serupa tidak sah.");
    seen.add(peer.region.id);
    return orderedPressureDimensions2023(peer.dimensions);
  })];
  const slots = ["a", "b", "c", "d"] as const;
  return {
    series: [{ region: selected.region, slot: "a", distance: null }, ...peers.map((peer, index) => ({ region: peer.region, slot: slots[index + 1], distance: peer.distance }))],
    dimensions: PRESSURE_DIMENSIONS_2023.map(({ id, label }, index) => ({ id, label, scores: profiles.map(profile => profile[index].score) })),
  };
}

/** Descriptive median only: the 14th ordered score in the complete fixed cohort, never a rank/classification. */
export function cohortPressureData2023(cohort: readonly CivxExploreRegionProduct2023[], selectedId: string): CohortPressureData2023 {
  if (!Array.isArray(cohort) || cohort.length !== 27 || new Set(cohort.map(view => view?.region?.id)).size !== 27) throw new TypeError("Sebaran memerlukan tepat 27 identitas kohort yang unik.");
  const profiles = cohort.map(view => {
    regionHeader(view.region);
    if (view.core.scope !== "CORE") throw new TypeError("Sebaran hanya menerima dimensi CORE.");
    return { region: view.region, dimensions: orderedPressureDimensions2023(view.core.dimensions) };
  }).sort((a, b) => a.region.id.localeCompare(b.region.id));
  const selected = profiles.find(profile => profile.region.id === selectedId);
  if (!selected) throw new RangeError("Wilayah terpilih tidak ditemukan dalam kohort.");
  return {
    selected: selected.region,
    dimensions: PRESSURE_DIMENSIONS_2023.map(({ id, label }, dimensionIndex) => {
      const points = profiles.map((profile, index) => ({ region: profile.region, score: profile.dimensions[dimensionIndex].score, lane: index % 5 }));
      const orderedScores = points.map(point => point.score).sort((a, b) => a - b);
      return { id, label, selectedScore: selected.dimensions[dimensionIndex].score, median: orderedScores[13], points };
    }),
  };
}
