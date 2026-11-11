import type { CivxProductSource2023, CivxRegionProductView2023 } from "@/lib/civx/product-view-types-2023";
import { REPORTING_INTERPRETATION_2023, REPORTING_RESTRICTION_2023 } from "@/lib/civx/export-2023";
import { regionType } from "@/components/product/format";
import styles from "./regional-print-report.module.css";

/** Metadata-only public report. Do not project unreleased CORE/CONTEXT values or insights. */
export function RegionalPrintReport({ view }: { view: CivxRegionProductView2023 }) {
  const { region, core, methodology } = view;
  const sources = new Map<string, { source: CivxProductSource2023; locators: Set<string> }>();
  for (const indicator of core.indicators) {
    for (const source of [indicator.disclosure.source, indicator.disclosure.numeratorSource, indicator.disclosure.denominatorSource]) {
      if (!source) continue;
      const record = sources.get(source.url) ?? { source, locators: new Set<string>() };
      if (source.locator) record.locators.add(source.locator);
      sources.set(source.url, record);
    }
  }

  return <section className={styles.report} data-region-report aria-label={`Laporan identitas ${region.name}`}>
    <header className={styles.header}>
      <p className={styles.brand}>CIVX <span>— Civic Index</span></p>
      <p>Laporan identitas wilayah dan referensi · tahun acuan {region.referenceYear}</p>
      <p className={styles.title} role="heading" aria-level={1}>{region.name}</p>
      <p>Kode BPS {region.id} · {regionType(region.type)} · {region.province}</p>
    </header>
    <section className={styles.block} aria-labelledby="report-scope">
      <h2 id="report-scope">Cakupan dan status publikasi</h2>
      <p>{REPORTING_RESTRICTION_2023}</p>
      <p><strong>Skor keseluruhan CIVX: tidak disertakan karena belum disetujui untuk rilis publik.</strong> Ini bukan nilai nol atau data sumber yang hilang.</p>
      <p>{REPORTING_INTERPRETATION_2023}</p>
    </section>
    <section aria-labelledby="report-dimensions">
      <h2 id="report-dimensions">Enam dimensi CORE</h2>
      <table>
        <caption>Kerangka indikator, bukan hasil numerik wilayah. Semua nilai dimensi ditahan dari laporan publik.</caption>
        <thead><tr><th scope="col">Dimensi</th><th scope="col">Indikator yang dirujuk</th></tr></thead>
        <tbody>{core.dimensions.map(dimension => <tr key={dimension.dimensionId}>
          <th scope="row">{dimension.displayName}</th>
          <td>{core.indicators.filter(indicator => indicator.dimensionId === dimension.dimensionId).map(indicator => indicator.displayName).join("; ")}</td>
        </tr>)}</tbody>
      </table>
    </section>
    <section className={styles.block} aria-labelledby="report-limits">
      <h2 id="report-limits">Metode dan keterbatasan</h2>
      <ul>
        <li>Kohort tetap: {methodology.cohortSize} kabupaten/kota {methodology.province}, tahun {methodology.referenceYear}. Normalisasi min–max mengikuti arah indikator; bobot dimensi tepat 1/6, dengan bobot indikator setara dalam dimensinya.</li>
        <li>Nol bukan tanpa tekanan; 100 bukan batas dampak teoretis terburuk. Min–max peka pada titik ujung; selisih kecil tidak otomatis bermakna secara statistik.</li>
        <li>Periode, definisi penyebut, ketidakpastian survei, dan tumpang tindih indikator membatasi interpretasi. Model tidak membuktikan tren atau sebab-akibat.</li>
        <li>CONTEXT tidak memengaruhi skor. Hak penggunaan sumber dan persetujuan rilis belum tuntas.</li>
      </ul>
    </section>
    <section className={styles.sources} aria-labelledby="report-sources">
      <h2 id="report-sources">Referensi sumber dan metodologi</h2>
      <p>Identitas kode wilayah BPS melalui facade produk CIVX {region.referenceYear}. Sumber CORE berikut merupakan rujukan bibliografis, bukan redistribusi nilai atau dokumen.</p>
      <ol>{[...sources.values()].map(({ source, locators }) => <li key={source.url}>
        <strong>{source.publisher}</strong> · {source.title ?? "Sumber indikator CORE"}
        {locators.size > 0 && <p>Lokasi sumber: {[...locators].join("; ")}.</p>}
        <a href={source.url}>{source.url}</a>
      </li>)}</ol>
      <div className={styles.block}>
        <p><strong>Metodologi:</strong> CIVX {methodology.referenceYear} · model {methodology.modelId} · versi {methodology.modelVersion}.</p>
        <p><a href="/methodology">/methodology</a> · <a href="/methodology#ekspor-dan-laporan">/methodology#ekspor-dan-laporan</a> · <a href="/sources">/sources</a></p>
        <p>Katalog sumber memuat unit, periode asli, definisi, penyebut, serta catatan ketidakpastian. Tahun acuan model tidak menyamakan periode setiap sumber.</p>
      </div>
    </section>
  </section>;
}
