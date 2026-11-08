import type { CivxRegionProductHeader2023 } from "./product-view-types-2023.ts";

export const REPORTING_SCOPE_2023 = "Identitas wilayah dan referensi saja";
export const REPORTING_RESTRICTION_2023 = "Skor CIVX, skor dimensi, nilai indikator, dan insight belum disetujui untuk rilis publik. Ekspor tidak menyertakan nilai tersebut, data konteks, atau dokumen sumber.";
export const REPORTING_INTERPRETATION_2023 = "CIVX menggambarkan tekanan relatif, bukan indeks kualitas wilayah, klasifikasi resmi pemerintah, atau rekomendasi kebijakan otomatis.";

export type CsvValue2023 = string | number | null | undefined;

/** RFC 4180 records, UTF-8 BOM for spreadsheets, and text-only formula protection. */
export function encodeCsv2023(rows: readonly (readonly CsvValue2023[])[]): string {
  const cell = (value: CsvValue2023): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "number") {
      if (!Number.isFinite(value)) throw new Error("Nilai angka CSV tidak valid.");
      return String(value);
    }
    // Ignore leading whitespace/control/format characters when detecting formulas.
    // Prefixing text with an apostrophe prevents spreadsheet execution, not just CSV parsing.
    const safe = /^[\s\p{Cc}\p{Cf}]*[=+\-@]|^[\t\r\n]/u.test(value) ? `'${value}` : value;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return `\uFEFF${rows.map(row => row.map(cell).join(",")).join("\r\n")}\r\n`;
}

export interface CsvReferences2023 {
  readonly methodologyUrl: string;
  readonly sourcesUrl: string;
  readonly reportingUrl: string;
}

/** Public exports deliberately accept identity headers, never CORE or CONTEXT payloads. */
export function createExploreCsv2023(regions: readonly CivxRegionProductHeader2023[], references: CsvReferences2023): { content: string; filename: string } {
  if (regions.length === 0) throw new Error("Tidak ada wilayah sesuai filter untuk diunduh.");
  const rows: CsvValue2023[][] = [[
    "Kode BPS", "Nama wilayah", "Jenis wilayah", "Provinsi", "Tahun acuan",
    "Cakupan ekspor", "Pembatasan publikasi", "Atribusi identitas", "Interpretasi CIVX",
    "Rujukan metodologi", "Rujukan sumber data", "Ketentuan ekspor",
  ]];
  for (const region of regions) {
    rows.push([
      region.id, region.name, region.type === "kabupaten" ? "Kabupaten" : "Kota", region.province, region.referenceYear,
      REPORTING_SCOPE_2023, REPORTING_RESTRICTION_2023, "Identitas kode wilayah BPS melalui facade produk CIVX 2023.", REPORTING_INTERPRETATION_2023,
      references.methodologyUrl, references.sourcesUrl, references.reportingUrl,
    ]);
  }
  return { content: encodeCsv2023(rows), filename: `civx-jawa-barat-2023-identitas-${regions.length}-wilayah.csv` };
}
