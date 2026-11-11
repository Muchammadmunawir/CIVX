import { getComparisonProductView2023, getExploreRegionsProduct2023, getRegionProductView2023 } from "../../src/lib/civx/product-2023.ts";
import type { CsvReferences2023 } from "../../src/lib/civx/export-2023.ts";
import type { CivxComparisonProductView2023, CivxCoreProduct2023, CivxProductMethodology2023, CivxRegionProductHeader2023 } from "../../src/lib/civx/product-view-types-2023.ts";
import { comparisonPressureData2023, type PressureComparisonData2023 } from "../../src/lib/civx/visualization-2023.ts";

export const LOCAL_REPORT_SCOPE_2023 = "LOCAL_RESTRICTED_REVIEW" as const;
export const LOCAL_REPORT_NOTICE_2023 = "Laporan analitis untuk peninjauan lokal terbatas. Skor dan nilai indikator belum diizinkan untuk redistribusi atau rilis publik. Pemberitahuan ini bukan izin publikasi.";

export interface LocalReportFilters2023 {
  readonly q: string;
  readonly type: "all" | "kabupaten" | "kota";
}

export interface LocalReportRegion2023 {
  readonly region: CivxRegionProductHeader2023;
  readonly core: Pick<CivxCoreProduct2023, "scope" | "overallScore" | "dimensions" | "indicators">;
  readonly methodology: CivxProductMethodology2023;
}

export interface LocalAnalyticalReport2023 {
  readonly scope: typeof LOCAL_REPORT_SCOPE_2023;
  readonly filters: LocalReportFilters2023;
  readonly regions: readonly LocalReportRegion2023[];
  readonly selected: LocalReportRegion2023;
  readonly references: CsvReferences2023;
}

/** Offline-only input projection. No public route or client module imports this file. */
export function prepareLocalAnalyticalReport2023(
  selectedId: string,
  filters: LocalReportFilters2023 = { q: "", type: "all" },
): LocalAnalyticalReport2023 {
  if (typeof filters.q !== "string" || !["all", "kabupaten", "kota"].includes(filters.type)) {
    throw new TypeError("Filter laporan tidak sah. Gunakan pencarian teks dan jenis all, kabupaten, atau kota.");
  }
  if (!getRegionProductView2023(selectedId)) throw new RangeError("Kode BPS wilayah laporan tidak dikenal.");
  const query = filters.q.trim().toLocaleLowerCase("id");
  const regions = getExploreRegionsProduct2023()
    .filter(({ region }) => (filters.type === "all" || region.type === filters.type) && region.name.toLocaleLowerCase("id").includes(query))
    .map(({ region }): LocalReportRegion2023 => {
      const view = getRegionProductView2023(region.id);
      if (!view) throw new Error("Profil facade tidak tersedia untuk identitas yang dikenal.");
      return Object.freeze({
        region: view.region,
        core: Object.freeze({ scope: view.core.scope, overallScore: view.core.overallScore, dimensions: view.core.dimensions, indicators: view.core.indicators }),
        methodology: view.methodology,
      });
    });
  if (!regions.length) throw new RangeError("Tidak ada wilayah yang sesuai dengan filter laporan.");
  const selected = regions.find(({ region }) => region.id === selectedId);
  if (!selected) throw new RangeError("Wilayah laporan tidak termasuk hasil pencarian dan filter jenis saat ini.");
  return Object.freeze({
    scope: LOCAL_REPORT_SCOPE_2023,
    filters: Object.freeze({ q: query ? filters.q : "", type: filters.type }),
    regions: Object.freeze(regions),
    selected,
    references: Object.freeze({
      methodologyUrl: "http://localhost:3000/methodology",
      sourcesUrl: "http://localhost:3000/sources",
      reportingUrl: "http://localhost:3000/methodology#ekspor-dan-laporan",
    }),
  });
}

export interface LocalComparisonReport2023 {
  readonly scope: typeof LOCAL_REPORT_SCOPE_2023;
  readonly regionA: LocalReportRegion2023;
  readonly regionB: LocalReportRegion2023;
  readonly comparison: PressureComparisonData2023;
  readonly overall: CivxComparisonProductView2023["core"]["overall"];
  readonly references: CsvReferences2023;
}

/** Additional local document only; the explicit peer is independent of CSV filters. */
export function prepareLocalComparisonReport2023(report: LocalAnalyticalReport2023, peerId: string): LocalComparisonReport2023 {
  const peer = getRegionProductView2023(peerId);
  if (!peer) throw new RangeError("Kode BPS wilayah pembanding tidak dikenal.");
  const view = getComparisonProductView2023(report.selected.region.id, peerId);
  return Object.freeze({
    scope: LOCAL_REPORT_SCOPE_2023,
    regionA: report.selected,
    regionB: Object.freeze({
      region: peer.region,
      core: Object.freeze({ scope: peer.core.scope, overallScore: peer.core.overallScore, dimensions: peer.core.dimensions, indicators: peer.core.indicators }),
      methodology: peer.methodology,
    }),
    comparison: comparisonPressureData2023(view),
    overall: view.core.overall,
    references: report.references,
  });
}
