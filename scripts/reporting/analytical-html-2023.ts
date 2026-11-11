import type { CivxIndicatorProduct2023, CivxProductSource2023, CivxProductUncertainty2023 } from "../../src/lib/civx/product-view-types-2023.ts";
import { LOCAL_REPORT_NOTICE_2023, type LocalAnalyticalReport2023 } from "./report-data-2023.ts";
import { pressureDimensionLabel2023 } from "../../src/lib/civx/visualization-2023.ts";
import { renderPressureProfileSvg2023 } from "./report-charts-2023.ts";
import { escapeHtml, link, number, pressure, PRINT_SCRIPT, REPORT_CSP } from "./report-markup-2023.ts";

const UNAVAILABLE = "Tidak tersedia pada facade.";

function field(label: string, value: string): string {
  return `<div><dt>${escapeHtml(label)}</dt><dd>${value}</dd></div>`;
}

function optionalText(value: string | null): string {
  return escapeHtml(value === null ? UNAVAILABLE : value);
}

function optionalNumber(value: number | null): string {
  return value === null ? UNAVAILABLE : number(value);
}

function uncertaintyDetails(value: CivxProductUncertainty2023): string {
  const interval = value.confidenceInterval;
  return `<dl class="details uncertainty">${[
    field("Catatan ketidakpastian", optionalText(value.note)),
    field("Lokasi bukti ketidakpastian", optionalText(value.sourceLocator)),
    field("Penyebut tertimbang", optionalNumber(value.weightedDenominator)),
    field("Ukuran sampel tanpa bobot", optionalNumber(value.unweightedSampleSize)),
    field("Interval kepercayaan", interval === null ? UNAVAILABLE : `${number(interval.lower)} hingga ${number(interval.upper)}; tingkat kepercayaan ${number(interval.confidenceLevel)} (proporsi)`),
    field("Galat baku (poin persentase)", optionalNumber(value.standardErrorPercentagePoints)),
    field("Galat baku relatif (%)", optionalNumber(value.relativeStandardErrorPercent)),
    field("RSE lebih dari 25%", value.rseGreaterThan25Percent === null ? UNAVAILABLE : value.rseGreaterThan25Percent ? "Ya" : "Tidak"),
  ].join("")}</dl>`;
}

function sourceKey(source: CivxProductSource2023): string {
  return JSON.stringify([source.sourceId, source.publisher, source.title, source.url, source.locator, source.publicationDate, source.accessedAt]);
}

function sourceRoles(indicator: CivxIndicatorProduct2023): readonly (readonly [string, CivxProductSource2023 | null])[] {
  return [["Sumber utama", indicator.disclosure.source], ["Sumber pembilang", indicator.disclosure.numeratorSource], ["Sumber penyebut", indicator.disclosure.denominatorSource]];
}

export const LOCAL_REPORT_STYLES_2023 = `
:root { color-scheme: light; --background:#fafafa; --surface:#ffffff; --foreground:#27272b; --muted:#65636e; --border:#e5e3eb; --accent:#2b0ab5; --accent-hover:#200483; --accent-soft:#f0ecff; --accent-contrast:#ffffff; --orange:#f45a19; }
* { box-sizing:border-box; }
body { margin:0; background:var(--background); color:var(--foreground); font:14px/1.6 Arial,Helvetica,sans-serif; }
main { max-width:1000px; margin:auto; padding:32px; background:var(--surface); }
header { margin-bottom:32px; }
.wordmark { color:var(--accent); font-size:26px; font-weight:800; letter-spacing:-.04em; margin:0; }
.wordmark span { color:var(--orange); }
h1,h2,h3,h4 { line-height:1.3; letter-spacing:-.02em; break-after:avoid; page-break-after:avoid; }
h1 { font-size:30px; margin:16px 0; }
h2 { font-size:22px; margin:0 0 16px; }
h3 { font-size:18px; margin:0 0 12px; }
h4 { font-size:15px; margin:20px 0 8px; }
p { margin:0 0 12px; }
a { color:var(--accent); text-decoration:underline; text-underline-offset:3px; overflow-wrap:anywhere; }
a:hover { color:var(--accent-hover); }
:focus-visible { outline:3px solid var(--accent); outline-offset:4px; }
button { min-height:44px; padding:10px 16px; border:0; border-radius:6px; background:var(--accent); color:var(--accent-contrast); font:inherit; cursor:pointer; }
button:hover { background:var(--accent-hover); }
.controls { display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin:20px 0; }
.controls p { margin:0; }
.notice { padding:16px; background:var(--accent-soft); margin:16px 0; }
.notice p:last-child { margin:0; }
section { margin-top:32px; }
.details { margin:0; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px 24px; }
.details > div { min-width:0; }
dt { font-weight:600; }
dd { margin:2px 0 0; white-space:pre-wrap; overflow-wrap:anywhere; }
.score { font-size:42px; line-height:1.2; font-weight:700; color:var(--accent); font-variant-numeric:tabular-nums; }
.score small { font-size:16px; font-weight:400; color:var(--muted); }
.track { height:8px; background:var(--accent-soft); overflow:hidden; margin:8px 0; }
.track span { display:block; height:100%; background:var(--accent); }
.table-scroll { overflow-x:auto; }
table { width:100%; min-width:440px; border-collapse:collapse; text-align:left; }
caption { text-align:left; margin-bottom:12px; }
th,td { padding:12px; border-bottom:1px solid var(--border); vertical-align:top; }
thead th { background:var(--accent-soft); }
tbody th { font-weight:600; width:42%; }
.numeric { font-variant-numeric:tabular-nums; }
.indicator { margin:24px 0; padding:20px 0; border-top:1px solid var(--border); }
.indicator > .details { padding:16px; background:var(--background); }
.indicator h3,.source h3 { overflow-wrap:anywhere; }
ul,ol { padding-left:24px; }
li { margin-bottom:8px; }
.bibliography { margin:0; padding-left:24px; }
.source { padding:16px 0; break-inside:avoid; page-break-inside:avoid; }
.muted { color:var(--muted); }
.pressure-chart { display:block; width:100%; min-width:640px; height:auto; }
.chart-scroll { break-inside:avoid; page-break-inside:avoid; margin:12px 0; }
.artifact-hash { grid-column:1 / -1; }
footer { margin-top:32px; padding-top:16px; border-top:1px solid var(--border); }
@media (max-width:600px) {
  main { padding:20px 16px; }
  h1 { font-size:26px; }
  .details { grid-template-columns:minmax(0,1fr); }
  .controls { align-items:stretch; flex-direction:column; }
  .table-scroll { margin-inline:-4px; }
}
@page { size:A4; margin:16mm 15mm; }
@media print {
  body,main { background:var(--surface); }
  body { font-size:9pt; line-height:1.4; }
  main { max-width:none; padding:0; }
  .controls,noscript { display:none !important; }
  header { margin-bottom:12pt; }
  section { margin-top:16pt; }
  p { margin-bottom:6pt; }
  h1 { font-size:20pt; margin:10pt 0; }
  h2 { font-size:15pt; margin:0 0 6pt; }
  h3 { font-size:12pt; margin:0 0 6pt; }
  h4 { font-size:10pt; margin:8pt 0 4pt; }
  .notice { padding:8pt; margin:8pt 0; }
  .details { grid-template-columns:repeat(2,minmax(0,1fr)); gap:4pt 12pt; }
  header .details { grid-template-columns:repeat(3,minmax(0,1fr)); }
  .details dt,.details dd { display:inline; }
  .details dt::after { content:": "; }
  dd { margin-top:1pt; }
  .indicator > .details { padding:6pt; }
  .score { font-size:30pt; }
  th,td { padding:3pt 6pt; }
  section[aria-labelledby="dimensions-heading"] { break-inside:avoid; page-break-inside:avoid; }
  .table-scroll { overflow:visible; }
  table { min-width:0; }
  .pressure-chart { min-width:0; }
  thead { display:table-header-group; }
  tr,.notice,.details > div { break-inside:avoid; page-break-inside:avoid; }
  .indicator { break-before:auto; page-break-before:auto; margin:12pt 0; padding:8pt 0 0; }
  .new-page { break-before:page; page-break-before:always; }
  p,li,dd { orphans:3; widows:3; }
  .track,.notice,thead th { print-color-adjust:exact; -webkit-print-color-adjust:exact; }
}
`;

/** Standalone offline document. Consumes only the prepared selected CORE projection. */
export function renderLocalAnalyticalHtml2023(report: LocalAnalyticalReport2023): string {
  const { region, core, methodology } = report.selected;
  const sources: CivxProductSource2023[] = [];
  const sourceNumbers = new Map<string, number>();
  for (const indicator of core.indicators) {
    for (const [, source] of sourceRoles(indicator)) {
      if (source === null) continue;
      const key = sourceKey(source);
      if (!sourceNumbers.has(key)) {
        sourceNumbers.set(key, sources.length + 1);
        sources.push(source);
      }
    }
  }
  const citation = (source: CivxProductSource2023 | null): string => {
    if (source === null) return "Tidak dicantumkan secara terpisah pada facade; lihat sumber utama dan definisi operand.";
    const index = sourceNumbers.get(sourceKey(source))!;
    return `<a href="#source-${index}">[${index}] ${escapeHtml(source.publisher)} — ${escapeHtml(source.sourceId)}</a>`;
  };
  const indicators = core.indicators.map((indicator, index) => `<article class="indicator" aria-labelledby="indicator-${index + 1}">
<h3 id="indicator-${index + 1}">${escapeHtml(indicator.displayName)}</h3>
<dl class="details">${[
    field("ID indikator", escapeHtml(indicator.indicatorId)),
    field("Dimensi", escapeHtml(indicator.dimensionName)),
    field("Nilai asli", `<data value="${number(indicator.rawValue)}">${number(indicator.rawValue)}</data>`),
    field("Satuan", escapeHtml(indicator.unit)),
    field("Tekanan ternormalisasi (0–100)", pressure(indicator.normalizedPressure)),
    field("Arah tekanan", escapeHtml(indicator.pressureDirection)),
    field("Periode rujukan", escapeHtml(indicator.referencePeriod)),
    field("Status nilai", "TERSEDIA"),
  ].join("")}</dl>
<h4>Definisi dan operand</h4>
<dl class="details">${field("Definisi", escapeHtml(indicator.disclosure.definition))}${field("Pembilang", escapeHtml(indicator.disclosure.numerator))}${field("Penyebut", escapeHtml(indicator.disclosure.denominator))}</dl>
<h4>Rujukan bukti</h4><dl class="details">${sourceRoles(indicator).map(([role, source]) => field(role, citation(source))).join("")}</dl>
<h4>Keterbatasan sumber</h4>${indicator.disclosure.limitations.length ? `<ul>${indicator.disclosure.limitations.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "<p>Tidak ada catatan keterbatasan yang dicantumkan pada facade; ini bukan bukti ketiadaan keterbatasan.</p>"}
<h4>Ketidakpastian yang tersedia</h4>${uncertaintyDetails(indicator.disclosure.uncertainty)}
</article>`).join("");
  const bibliography = sources.map((source, index) => `<li id="source-${index + 1}" class="source"><h3>${escapeHtml(source.title ?? source.sourceId)}</h3><dl class="details">${[
    field("ID sumber", escapeHtml(source.sourceId)), field("Penerbit", escapeHtml(source.publisher)),
    field("Judul sumber", optionalText(source.title)), field("URL sumber", link(source.url)),
    field("Lokasi tabel / halaman", optionalText(source.locator)), field("Tanggal publikasi", optionalText(source.publicationDate)),
    field("Tanggal akses", optionalText(source.accessedAt)),
  ].join("")}</dl></li>`).join("");
  const csp = REPORT_CSP;
  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${escapeHtml(csp)}"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><title>${escapeHtml(region.name)} — Laporan analitis lokal CIVX ${escapeHtml(region.referenceYear)}</title><style>${LOCAL_REPORT_STYLES_2023}</style></head>
<body><main>
<header><p class="wordmark">CIV<span>X</span></p><h1>Laporan analitis ${escapeHtml(region.name)}</h1>
<p>Tekanan relatif CIVX · Tahun acuan ${escapeHtml(region.referenceYear)}</p>
<div class="notice"><p><strong>Peninjauan lokal terbatas · ${escapeHtml(report.scope)}</strong></p><p>${escapeHtml(LOCAL_REPORT_NOTICE_2023)}</p></div>
<div class="controls"><button id="print-report" type="button" aria-describedby="print-help">Cetak / Simpan PDF lokal</button><p id="print-help">Gunakan dialog cetak peramban untuk menyimpan PDF di lingkungan terkontrol.</p></div>
<noscript><p>JavaScript tidak aktif. Gunakan menu cetak peramban atau Ctrl+P / Command+P untuk menyimpan PDF lokal.</p></noscript>
<dl class="details">${[
    field("Wilayah", escapeHtml(region.name)), field("Kode BPS", escapeHtml(region.id)),
    field("Jenis wilayah", escapeHtml(region.type)), field("Provinsi", escapeHtml(region.province)),
    field("Tahun acuan", escapeHtml(region.referenceYear)), field("Filter pencarian", escapeHtml(report.filters.q || "Tanpa filter pencarian")),
    field("Filter jenis wilayah", escapeHtml(report.filters.type)), field("ID model", escapeHtml(methodology.modelId)),
    field("Versi model", escapeHtml(methodology.modelVersion)), field("Status skor", escapeHtml(methodology.scoreStatus)),
    field("Status insight", escapeHtml(methodology.insightStatus)), field("Integrasi produksi diizinkan", escapeHtml(methodology.productionIntegrationAuthorized)),
    `<div class="artifact-hash"><dt>SHA-256 artefak skor</dt><dd>${escapeHtml(methodology.sources.scoreArtifact.sha256)}</dd></div>`,
  ].join("")}</dl></header>
<section aria-labelledby="overall-heading"><h2 id="overall-heading">Skor keseluruhan</h2><p class="score">${pressure(core.overallScore)} <small>/ 100</small></p><div class="track" aria-hidden="true"><span style="width:${number(core.overallScore)}%"></span></div><p>Tekanan relatif pada kohort tetap 27 kabupaten/kota Jawa Barat 2023, bukan kualitas wilayah atau hubungan kausal. Tampilan dibulatkan satu desimal; grafik dan elemen data memakai nilai penuh. Nilai asli indikator tidak dibulatkan ulang.</p></section>
<section aria-labelledby="dimensions-heading"><h2 id="dimensions-heading">Profil enam dimensi</h2>${renderPressureProfileSvg2023(core.dimensions)}<div class="table-scroll" role="region" aria-labelledby="dimensions-heading" tabindex="0"><table><caption>Tekanan relatif pada skala tetap 0–100; angka lebih tinggi berarti tekanan relatif lebih tinggi.</caption><thead><tr><th scope="col">Dimensi</th><th scope="col">Skor tekanan / 100</th></tr></thead><tbody>${core.dimensions.map(dimension => `<tr><th scope="row">${escapeHtml(pressureDimensionLabel2023(dimension.dimensionId))}</th><td class="numeric">${pressure(dimension.score)}</td></tr>`).join("")}</tbody></table></div></section>
<section aria-labelledby="indicators-heading"><h2 id="indicators-heading">Seluruh indikator CORE</h2><p>Setiap nilai berikut berasal dari facade untuk wilayah terpilih. Periode, satuan, dan operand dipertahankan sesuai sumber.</p>${indicators}</section>
<section class="new-page" aria-labelledby="sources-heading"><h2 id="sources-heading">Bibliografi sumber</h2><p>Nomor rujukan menghubungkan setiap indikator dengan sumber utama, pembilang, dan penyebutnya. Catatan dengan lokasi atau tanggal berbeda dipertahankan terpisah.</p><ol class="bibliography">${bibliography}</ol></section>
<section class="new-page" aria-labelledby="method-heading"><h2 id="method-heading">Metodologi dan batas interpretasi</h2>
<p>Kohort model tetap ${escapeHtml(methodology.cohortSize)} ${escapeHtml(methodology.geographicLevel)} di ${escapeHtml(methodology.province)}, tahun ${escapeHtml(methodology.referenceYear)}. Filter hanya menentukan pemilihan laporan; filter tidak mengubah kohort atau kalibrasi model.</p>
<p>Model memakai normalisasi min–max berarah terhadap kohort tetap 2023. Batas indikator 0 dan 100 bersifat relatif terhadap kohort, bukan batas teoretis dunia nyata. Enam dimensi berbobot sama; indikator dalam setiap dimensi berbobot sama. Laporan memakai nilai facade tanpa normalisasi, pembobotan, atau penghitungan skor ulang.</p>
<ul>${methodology.notes.map(note => `<li>${escapeHtml(note)}</li>`).join("")}</ul>
<p>Skor adalah tekanan relatif, bukan indeks kualitas hidup, ukuran kinerja pemerintah, probabilitas, klasifikasi resmi pemerintah, atau besaran kerugian absolut. Hubungan antarindikator tidak membuktikan kausalitas. Laporan bukan prediksi, rekomendasi kebijakan, atau dasar keputusan otomatis.</p>
<p>Ketidakpastian hanya disajikan bila tersedia pada sumber. Metadata yang tidak tersedia bukan nol dan bukan bukti kepastian. Interval, ukuran sampel, dan galat sumber tidak dipropagasikan menjadi interval skor CIVX. Perbedaan periode, definisi, penyebut, dan cakupan membatasi perbandingan; lihat setiap indikator.</p>
<p>Hak penggunaan dan redistribusi sumber serta persetujuan rilis model belum tuntas. Akses ke sumber tidak otomatis memberi izin publikasi ulang. Pembuatan HTML atau PDF lokal tidak mengubah status rilis. Jangan unggah laporan ke repository, lampiran publik, aset aplikasi, atau penyimpanan publik.</p>
<dl class="details">${field("Rujukan metodologi", link(report.references.methodologyUrl))}${field("Rujukan sumber", link(report.references.sourcesUrl))}${field("Ketentuan pelaporan", link(report.references.reportingUrl))}${field("Artefak skor", escapeHtml(methodology.sources.scoreArtifact.path))}${field("Rancangan normalisasi", escapeHtml(methodology.sources.normalizationPath))}${field("Rancangan bobot", escapeHtml(methodology.sources.weightingPath))}</dl></section>
<footer><p><strong>CIVX · Peninjauan lokal terbatas</strong></p><p>${escapeHtml(LOCAL_REPORT_NOTICE_2023)}</p></footer>
</main><script>${PRINT_SCRIPT}</script></body></html>`;
}
