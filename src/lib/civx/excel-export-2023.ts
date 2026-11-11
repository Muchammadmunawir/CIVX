import writeExcelFile, { type CellObject, type Feature, type Row, type SheetData } from "write-excel-file/universal";
import { findElement, getOrderOfSiblings, insertElementMarkupAccordingToOrderOfSiblings } from "write-excel-file/utility";
import type { CivxRegionProductHeader2023 } from "./product-view-types-2023.ts";
import { EXPLORE_IDENTITY_HEADERS_2023, getExploreIdentityRows2023, REPORTING_INTERPRETATION_2023, REPORTING_RESTRICTION_2023, REPORTING_SCOPE_2023 } from "./export-2023.ts";

// Portable references verified against the existing development-branch documentation and publisher.
const DOCUMENTATION_ROOT = "https://github.com/Muchammadmunawir/CIVX/blob/Muchammadmunawir/frontend-integration-figma/docs";
const BPS_PUBLICATION_URL = "https://jabar.bps.go.id/id/publication/2024/02/28/35ffe2d35104b39feb577e8f/provinsi-jawa-barat-dalam-angka-2024.html";
const COLORS = { primary: "#2B0AB5", orange: "#F45A19", soft: "#F0ECFF", text: "#27272B", border: "#E5E3EB", surface: "#FFFFFF" } as const;
const HEADER_ROW = 4;

export interface ExploreExportFilters2023 {
  readonly q: string;
  readonly type: "all" | "kabupaten" | "kota";
}

function text(value: string, style: Omit<CellObject, "value" | "type"> = {}): CellObject {
  // Explicit string typing prevents formula interpretation without changing the original identity.
  return { value, type: String, format: "@", alignVertical: "center", textColor: COLORS.text, ...style };
}

function heading(value: string): CellObject {
  return text(value, { fontWeight: "bold", backgroundColor: COLORS.primary, textColor: COLORS.surface, wrap: true, height: 30 });
}

function title(value: string, columns: number): Row {
  return [text(value, { fontSize: 18, fontWeight: "bold", textColor: COLORS.primary, height: 34, columnSpan: columns }), ...Array<null>(columns - 1).fill(null)];
}

/** Adds the required filter through the writer's supported feature API, in OOXML element order. */
function identityAutoFilter(lastRow: number): Feature<Blob> {
  return { files: { transform: { "xl/worksheets/sheet{id}.xml": {
    transform(xml, _options, { sheetIndex }) {
      if (sheetIndex !== 0) return xml;
      const order = getOrderOfSiblings("xl/worksheets/sheet{id}.xml", "worksheet");
      if (!order) throw new Error("Urutan elemen lembar Excel tidak tersedia.");
      return insertElementMarkupAccordingToOrderOfSiblings(xml, `<autoFilter ref="A${HEADER_ROW}:F${lastRow}"/>`, order, "worksheet");
    },
  } } } };
}

// The writer omits named default styles; declare Normal for consistent spreadsheet-reader behavior.
const defaultWorkbookStyle: Feature<Blob> = { files: { transform: { "xl/styles.xml": {
  transform(xml) {
    const order = getOrderOfSiblings("xl/styles.xml", "styleSheet");
    if (!order) throw new Error("Urutan gaya Excel tidak tersedia.");
    if (!findElement(xml, "cellStyleXfs")) {
      xml = insertElementMarkupAccordingToOrderOfSiblings(xml, '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>', order, "styleSheet");
    }
    if (!findElement(xml, "cellStyles")) {
      xml = insertElementMarkupAccordingToOrderOfSiblings(xml, '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>', order, "styleSheet");
    }
    return xml;
  },
} } } };

/** Identity-only workbook. No facade data lookup, score option, formula, or private-report import. */
export async function createExploreExcel2023(regions: readonly CivxRegionProductHeader2023[], filters: ExploreExportFilters2023): Promise<{ content: Blob; filename: string }> {
  const rows = getExploreIdentityRows2023(regions);
  const data: SheetData = [
    title("CIVX — Data Wilayah", 6),
    [text("Jawa Barat · Tahun acuan 2023 · Identitas wilayah, tanpa nilai analitis", { columnSpan: 6, height: 28, wrap: true, bottomBorderColor: COLORS.orange, bottomBorderStyle: "medium" }), null, null, null, null, null],
    [],
    EXPLORE_IDENTITY_HEADERS_2023.map(heading),
    ...rows.map((row, index) => row.map((value, column) => {
      const style: Omit<CellObject, "value" | "type"> = { height: 24, wrap: true, backgroundColor: index % 2 ? COLORS.soft : COLORS.surface, bottomBorderColor: COLORS.border, bottomBorderStyle: "hair" };
      return column === 4
        ? { ...style, value, type: Number, format: "0", align: "center" as const, alignVertical: "center" as const }
        : text(String(value), style);
    })),
  ];
  const information: [string, string | number][] = [
    ["Cakupan ekspor", REPORTING_SCOPE_2023],
    ["Tahun acuan", 2023],
    ["Cakupan wilayah", "Kohort tetap 27 kabupaten/kota Jawa Barat pada 2023. Berkas mengikuti seluruh hasil filter, bukan halaman tabel atau lapisan peta."],
    ["Jumlah wilayah diekspor", rows.length],
    ["Filter pencarian", filters.q.trim() || "Tanpa filter pencarian"],
    ["Filter jenis wilayah", filters.type === "all" ? "Semua jenis" : filters.type === "kabupaten" ? "Kabupaten" : "Kota"],
    ["Atribusi identitas", "Identitas dan kode wilayah: Badan Pusat Statistik (BPS), melalui facade produk CIVX 2023. CIVX bukan produk resmi BPS."],
    ["Status data", REPORTING_RESTRICTION_2023],
    ["Batas interpretasi", REPORTING_INTERPRETATION_2023],
    ["Batas metodologi", "Tahun model tidak menyamakan periode survei atau tanggal publikasi sumber. Tabel ini hanya memuat identitas, bukan skor, peringkat, indikator, atau hasil analisis."],
    ["Penggunaan sumber", "Rujukan penerbit bukan izin redistribusi dokumen atau persetujuan publikasi model. Buku sumber tidak disertakan. Hak sumber dan persetujuan rilis numerik belum tuntas."],
    ["Publikasi BPS", BPS_PUBLICATION_URL],
    ["Dokumentasi sumber", `${DOCUMENTATION_ROOT}/DATA.md`],
    ["Metodologi model", `${DOCUMENTATION_ROOT}/SCORING-ENGINE-2023.md`],
    ["Ketentuan ekspor", `${DOCUMENTATION_ROOT}/ANALYTICAL-REPORTING-2023.md`],
  ];
  const infoData: SheetData = [
    title("CIVX — Informasi Data", 2),
    [text("Jawa Barat · Tahun acuan 2023", { columnSpan: 2, height: 26, bottomBorderColor: COLORS.orange, bottomBorderStyle: "medium" }), null],
    [],
    [heading("Informasi"), heading("Keterangan")],
    ...information.map(([label, value]): Row => [
      text(label, { fontWeight: "bold", wrap: true, alignVertical: "top", height: typeof value === "number" ? 28 : Math.max(32, Math.ceil(value.length / 90) * 17 + 12) }),
      typeof value === "number" ? { value, type: Number, format: "0", alignVertical: "top" } : text(value, { wrap: true, alignVertical: "top" }),
    ]),
  ];
  const content = await writeExcelFile([
    { sheet: "Data Wilayah", data, columns: [12, 38, 18, 20, 16, 22].map(width => ({ width })), stickyRowsCount: HEADER_ROW, showGridLines: false },
    { sheet: "Informasi Data", data: infoData, columns: [{ width: 29 }, { width: 110 }], stickyRowsCount: HEADER_ROW, showGridLines: false },
  ], { fontFamily: "Arial", fontSize: 11, features: [defaultWorkbookStyle, identityAutoFilter(HEADER_ROW + rows.length)] }).toBlob();
  return { content, filename: `civx-jawa-barat-2023-identitas-${rows.length}-wilayah.xlsx` };
}
