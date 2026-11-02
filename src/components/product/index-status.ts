import type { CivxExploreRegionProduct2023 } from "@/lib/civx/product-view-types-2023";

/**
 * Display reading shared by Beranda, Jelajah and Bandingkan:
 * index = 100 − CIVX relative pressure, so a higher index reads as better.
 */
export const toIndex = (pressure: number): number => 100 - pressure;

export type IndexTone = "good" | "warning" | "bad";
export type IndexStatusId = "baik" | "sedang" | "kritis";
export interface IndexStatus { id: IndexStatusId; label: string; tone: IndexTone }

export const INDEX_STATUSES: readonly IndexStatus[] = [
  { id: "baik", label: "Baik", tone: "good" },
  { id: "sedang", label: "Sedang", tone: "warning" },
  { id: "kritis", label: "Kritis", tone: "bad" },
];

/** Display thresholds only; they never feed back into scoring. */
export function indexStatus(index: number): IndexStatus {
  if (index >= 70) return INDEX_STATUSES[0];
  if (index >= 50) return INDEX_STATUSES[1];
  return INDEX_STATUSES[2];
}

const DIMENSION_LABELS: Readonly<Record<string, string>> = {
  education: "Pendidikan",
  public_health: "Kesehatan",
  socioeconomic: "Ekonomi",
  basic_services: "Infrastruktur",
  disaster_pressure: "Kebencanaan",
  environment: "Lingkungan",
};

export function dimensionLabel(dimensionId: string, fallback: string): string {
  return DIMENSION_LABELS[dimensionId] ?? fallback;
}

export interface RankedRegion {
  view: CivxExploreRegionProduct2023;
  rank: number;
  index: number;
  status: IndexStatus;
  /** Dimension with the highest relative pressure, i.e. the main challenge. */
  challenge: string | null;
}

/** Descriptive order within the 2023 cohort (highest index first); ties keep BPS order. */
export function rankRegions(regions: readonly CivxExploreRegionProduct2023[]): RankedRegion[] {
  return [...regions]
    .map((view, order) => ({ view, order }))
    .sort((a, b) => a.view.core.overallScore - b.view.core.overallScore || a.order - b.order)
    .map(({ view }, position) => {
      const index = toIndex(view.core.overallScore);
      const top = view.core.dimensions.reduce<(typeof view.core.dimensions)[number] | null>(
        (max, dimension) => (max === null || dimension.score > max.score ? dimension : max), null);
      return {
        view,
        rank: position + 1,
        index,
        status: indexStatus(index),
        challenge: top ? dimensionLabel(top.dimensionId, top.displayName) : null,
      };
    });
}

