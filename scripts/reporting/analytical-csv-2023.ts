import { encodeCsv2023, type CsvValue2023 } from "../../src/lib/civx/export-2023.ts";
import type { CivxIndicatorProduct2023, CivxProductSource2023, CivxProductUncertainty2023 } from "../../src/lib/civx/product-view-types-2023.ts";
import { LOCAL_REPORT_SCOPE_2023, type LocalAnalyticalReport2023 } from "./report-data-2023.ts";

const DIMENSION_IDS = ["socioeconomic", "education", "basic_services", "public_health", "disaster_pressure", "environment"] as const;
const INDICATOR_IDS = [
  "poverty", "unemployment", "gini_ratio", "expenditure_per_capita", "rls", "hls", "apm", "sanitation",
  "drinking_water", "puskesmas_per_100k", "household-floor-per-capita-le7-2", "health_insurance_ownership",
  "nutrition_ski2023_stunting", "nutrition_ski2023_wasting", "morbidity_activity_limiting", "life_expectancy_lfsp2020",
  "irbi_overall_2023", "iklh_2023",
] as const;
const INDICATOR_SUFFIXES = [
  "nilai_asli", "satuan", "status_nilai", "periode_rujukan", "tekanan_ternormalisasi", "arah_tekanan",
  "definisi", "pembilang", "penyebut", "sumber_json", "ketidakpastian_json", "keterbatasan_json",
] as const;

function requireValid(condition: unknown, field: string): asserts condition {
  if (!condition) throw new TypeError(`Data laporan analitis tidak sah atau tidak lengkap: ${field}.`);
}

function finite(value: unknown, field: string): asserts value is number {
  requireValid(typeof value === "number" && Number.isFinite(value), field);
}

function text(value: unknown, field: string): asserts value is string {
  requireValid(typeof value === "string", field);
}

function nullableText(value: unknown, field: string): void {
  if (value !== null) text(value, field);
}

function nullableNumber(value: unknown, field: string): void {
  if (value !== null) finite(value, field);
}

function pressure(value: unknown, field: string): void {
  finite(value, field);
  requireValid(value >= 0 && value <= 100, field);
}

/** Project only documented source fields; never serialize internal pointers or extra scopes. */
function sourceJsonValue(source: CivxProductSource2023): CivxProductSource2023 {
  requireValid(source && typeof source === "object", "sumber");
  for (const value of [source.sourceId, source.publisher, source.url]) text(value, "identitas sumber");
  for (const value of [source.title, source.locator, source.publicationDate, source.accessedAt]) nullableText(value, "metadata sumber");
  return {
    sourceId: source.sourceId,
    publisher: source.publisher,
    title: source.title,
    url: source.url,
    locator: source.locator,
    publicationDate: source.publicationDate,
    accessedAt: source.accessedAt,
  };
}

function uncertaintyJsonValue(value: CivxProductUncertainty2023): CivxProductUncertainty2023 {
  requireValid(value && typeof value === "object", "ketidakpastian");
  nullableText(value.note, "catatan ketidakpastian");
  nullableText(value.sourceLocator, "lokasi ketidakpastian");
  for (const number of [value.weightedDenominator, value.unweightedSampleSize, value.standardErrorPercentagePoints, value.relativeStandardErrorPercent]) {
    nullableNumber(number, "angka ketidakpastian");
  }
  requireValid(value.rseGreaterThan25Percent === null || typeof value.rseGreaterThan25Percent === "boolean", "status RSE");
  const interval = value.confidenceInterval;
  if (interval !== null) {
    requireValid(interval && typeof interval === "object", "interval kepercayaan");
    for (const number of [interval.confidenceLevel, interval.lower, interval.upper]) finite(number, "interval kepercayaan");
  }
  return {
    note: value.note,
    sourceLocator: value.sourceLocator,
    weightedDenominator: value.weightedDenominator,
    unweightedSampleSize: value.unweightedSampleSize,
    confidenceInterval: interval === null ? null : { confidenceLevel: interval.confidenceLevel, lower: interval.lower, upper: interval.upper },
    standardErrorPercentagePoints: value.standardErrorPercentagePoints,
    relativeStandardErrorPercent: value.relativeStandardErrorPercent,
    rseGreaterThan25Percent: value.rseGreaterThan25Percent,
  };
}

function indicatorCells(indicator: CivxIndicatorProduct2023, indicatorId: string): CsvValue2023[] {
  requireValid(indicator && indicator.scope === "CORE" && indicator.indicatorId === indicatorId, "identitas indikator CORE");
  finite(indicator.rawValue, `${indicatorId}: nilai asli`);
  pressure(indicator.normalizedPressure, `${indicatorId}: tekanan ternormalisasi`);
  requireValid(DIMENSION_IDS.some(id => id === indicator.dimensionId), `${indicatorId}: dimensi`);
  requireValid(["higher_raw_higher_pressure", "higher_raw_lower_pressure"].includes(indicator.pressureDirection), `${indicatorId}: arah tekanan`);
  const disclosure = indicator.disclosure;
  requireValid(disclosure && typeof disclosure === "object", `${indicatorId}: pengungkapan sumber`);
  for (const value of [indicator.unit, indicator.referencePeriod, disclosure.definition, disclosure.numerator, disclosure.denominator]) {
    text(value, `${indicatorId}: definisi dan satuan`);
  }
  requireValid(Array.isArray(disclosure.limitations), `${indicatorId}: keterbatasan`);
  for (const limitation of disclosure.limitations) text(limitation, `${indicatorId}: keterbatasan`);
  const sources = {
    source: sourceJsonValue(disclosure.source),
    numeratorSource: disclosure.numeratorSource === null ? null : sourceJsonValue(disclosure.numeratorSource),
    denominatorSource: disclosure.denominatorSource === null ? null : sourceJsonValue(disclosure.denominatorSource),
  };
  return [
    indicator.rawValue, indicator.unit, "TERSEDIA", indicator.referencePeriod, indicator.normalizedPressure, indicator.pressureDirection,
    disclosure.definition, disclosure.numerator, disclosure.denominator,
    JSON.stringify(sources), JSON.stringify(uncertaintyJsonValue(disclosure.uncertainty)), JSON.stringify(disclosure.limitations),
  ];
}

/** Offline restricted review only. This scope never authorizes public numeric reporting. */
export function createLocalAnalyticalCsv2023(report: LocalAnalyticalReport2023): { content: string; filename: string } {
  requireValid(report && report.scope === LOCAL_REPORT_SCOPE_2023, "cakupan distribusi");
  requireValid(report.filters && typeof report.filters.q === "string" && ["all", "kabupaten", "kota"].includes(report.filters.type), "filter");
  requireValid(Array.isArray(report.regions) && report.regions.length > 0 && report.regions.length <= 27, "pilihan wilayah");
  requireValid(report.references && typeof report.references === "object", "rujukan laporan");
  for (const reference of [report.references.methodologyUrl, report.references.sourcesUrl, report.references.reportingUrl]) text(reference, "rujukan laporan");
  requireValid(report.selected?.region && report.regions.some(item => item?.region?.id === report.selected.region.id), "wilayah terpilih");

  const rows: CsvValue2023[][] = [[
    "kode_bps", "nama_wilayah", "jenis_wilayah", "provinsi", "tahun_acuan", "skor_civx",
    ...DIMENSION_IDS.map(id => `skor_dimensi_${id}`),
    "filter_pencarian", "filter_jenis_wilayah", "cakupan_distribusi", "status_skor", "status_insight", "integrasi_produksi_diizinkan",
    "id_model", "versi_model", "sha256_artefak_skor", "rujukan_metodologi", "rujukan_sumber", "ketentuan_pelaporan",
    ...INDICATOR_IDS.flatMap(id => INDICATOR_SUFFIXES.map(suffix => `${id}__${suffix}`)),
  ]];
  const query = report.filters.q.trim().toLocaleLowerCase("id");
  let previousId = "";
  for (const item of report.regions) {
    requireValid(item?.region && item.core && item.methodology, "profil wilayah");
    const { region, core, methodology } = item;
    requireValid(typeof region.id === "string" && /^32\d{2}$/.test(region.id) && region.id > previousId, "urutan kode BPS");
    previousId = region.id;
    text(region.name, "nama wilayah");
    text(region.province, "provinsi");
    requireValid(region.referenceYear === 2023 && ["kabupaten", "kota"].includes(region.type), "identitas wilayah 2023");
    requireValid(region.name.toLocaleLowerCase("id").includes(query) && (report.filters.type === "all" || region.type === report.filters.type), "wilayah di luar filter");
    requireValid(core.scope === "CORE" && Array.isArray(core.dimensions) && core.dimensions.length === 6 && Array.isArray(core.indicators) && core.indicators.length === 18, "profil CORE lengkap");
    pressure(core.overallScore, "skor CIVX");
    const dimensions = DIMENSION_IDS.map((id, index) => {
      const dimension = core.dimensions[index];
      requireValid(dimension?.scope === "CORE" && dimension.dimensionId === id, "urutan dimensi CORE");
      pressure(dimension.score, `skor dimensi ${id}`);
      return dimension.score;
    });
    requireValid(methodology.referenceYear === 2023 && methodology.cohortSize === 27, "tahun dan kohort model");
    requireValid(methodology.scoreStatus === "SCORED_NOT_RELEASED" && methodology.insightStatus === "INSIGHTS_NOT_RELEASED" && methodology.productionIntegrationAuthorized === false, "status rilis terbatas");
    text(methodology.modelId, "ID model");
    finite(methodology.modelVersion, "versi model");
    requireValid(methodology.sources?.scoreArtifact && /^[a-f0-9]{64}$/.test(methodology.sources.scoreArtifact.sha256), "SHA-256 artefak skor");
    const indicators = INDICATOR_IDS.flatMap((id, index) => indicatorCells(core.indicators[index], id));
    rows.push([
      region.id, region.name, region.type, region.province, region.referenceYear, core.overallScore, ...dimensions,
      report.filters.q, report.filters.type, LOCAL_REPORT_SCOPE_2023, methodology.scoreStatus, methodology.insightStatus, String(methodology.productionIntegrationAuthorized),
      methodology.modelId, methodology.modelVersion, methodology.sources.scoreArtifact.sha256,
      report.references.methodologyUrl, report.references.sourcesUrl, report.references.reportingUrl, ...indicators,
    ]);
  }
  return { content: encodeCsv2023(rows), filename: `civx-jawa-barat-2023-analitis-lokal-${report.regions.length}-wilayah.csv` };
}
