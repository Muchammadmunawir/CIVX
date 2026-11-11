import Link from "next/link";
import Form from "next/form";
import { ComparisonPressureChart, PressureDifferenceChart } from "@/components/charts/comparison-charts";
import { PressureSeriesMark } from "@/components/charts/pressure-plot";
import { comparisonPressureData2023, pressureDimensionLabel2023 } from "@/lib/civx/visualization-2023";
import { formatDifference, formatScore, regionType } from "@/components/product/format";
import { PageHeading, ResultsNotice } from "@/components/product/product-ui";
import { SectionReveals } from "@/components/product/section-reveals";
import type {
  CivxComparisonProductView2023,
  CivxExploreRegionProduct2023,
  CivxRegionProductHeader2023,
} from "@/lib/civx/product-view-types-2023";
import styles from "./comparison.module.css";

type ComparisonView = CivxComparisonProductView2023;

export interface ComparisonPageProps {
  comparison: ComparisonView | null;
  regions: readonly CivxExploreRegionProduct2023[];
  selectedA: string;
  selectedB: string;
  error?: string;
}

function RegionSummary({ region, pressure, side }: {
  region: CivxRegionProductHeader2023;
  pressure: number;
  side: "A" | "B";
}) {
  return <article className={`product-card ${styles.regionSummary}`} data-side={side} data-reveal data-reveal-order={side === "B" ? "1" : undefined}>
    <p className={styles.regionIdentity}><PressureSeriesMark slot={side === "A" ? "a" : "b"} /> {side} · {regionType(region.type)} · {region.province}</p>
    <h3>{region.name}</h3>
    <p className={styles.bigScore}><strong>{formatScore(pressure)}</strong> <small>/ 100</small></p>
    <p className={styles.scoreNote}>Tekanan relatif CIVX · semakin tinggi, semakin tinggi tekanan relatif.</p>
  </article>;
}

function Attention({ comparison }: { comparison: ComparisonView }) {
  return <section className={`product-card ${styles.attention}`} aria-labelledby="attention-heading" data-reveal data-reveal-order="1">
    <h2 className="product-section-title" id="attention-heading">Batas pembacaan</h2>
    <span className={styles.readingTag}>Cara membaca</span>
    <h3>Tekanan relatif, bukan penilaian kualitas wilayah.</h3>
    <p>{comparison.core.overall.absoluteDifference === 0
      ? "Skor keseluruhan kedua pilihan sama. Jarak absolut dan selisih bertanda A dikurangi B sama-sama nol."
      : "Jarak absolut menunjukkan besar perbedaan tanpa arah. Selisih bertanda A dikurangi B menunjukkan arah perbedaan tekanan relatif, bukan keunggulan wilayah."}</p>
    <Link className={`civx-button civx-button-secondary ${styles.outlineButton}`} href="/methodology#keterbatasan">Pahami keterbatasan <span aria-hidden="true">›</span></Link>
  </section>;
}

function ComparisonResults({ comparison }: { comparison: ComparisonView }) {
  const { core, regionA, regionB } = comparison;
  const chartData = comparisonPressureData2023(comparison);

  return <>
    <section className={styles.results} aria-labelledby="results-heading">
      <h2 className="civx-sr-only" id="results-heading">Tekanan relatif dua wilayah</h2>
      <div className={styles.summaryGrid}>
        <RegionSummary region={regionA} pressure={core.overall.regionAScore} side="A" />
        <RegionSummary region={regionB} pressure={core.overall.regionBScore} side="B" />
      </div>
      <div className={styles.difference} data-reveal>
        <strong>{formatScore(core.overall.absoluteDifference)} <span>poin</span></strong>
        <div>
          <h3>Jarak absolut skor tekanan relatif</h3>
          <p>{regionA.name} {formatScore(core.overall.regionAScore)}; {regionB.name} {formatScore(core.overall.regionBScore)}. Selisih bertanda A dikurangi B: <strong>{formatDifference(core.overall.delta)}</strong> poin. Selisih ini tidak menjelaskan penyebab perbedaan.</p>
        </div>
      </div>
    </section>

    <div className={styles.analysisGrid}>
      <div data-reveal><ComparisonPressureChart data={chartData} /></div>
      <div data-reveal data-reveal-order="1"><PressureDifferenceChart data={chartData} /></div>
    </div>

    <details className={styles.detailDisclosure} data-reveal>
      <summary>Lihat tabel perbandingan dimensi</summary>
    <section className="product-section" aria-labelledby="detail-heading" data-reveal>
      <div className={styles.sectionHead}>
        <h2 className="product-section-title" id="detail-heading">Rincian perbandingan</h2>
        <p className="product-caption">Tekanan relatif 0–100 · semakin tinggi, semakin tinggi tekanan relatif</p>
      </div>
      <div className="product-table-wrap" role="region" aria-label="Tabel rincian perbandingan wilayah" tabIndex={0}>
        <table className={`product-table ${styles.detailTable}`}>
          <caption className="civx-sr-only">Rincian tekanan relatif {regionA.name} dan {regionB.name} per dimensi</caption>
          <thead><tr><th scope="col">Dimensi</th><th scope="col">{regionA.name}</th><th scope="col">{regionB.name}</th><th scope="col">Jarak absolut (poin)</th></tr></thead>
          <tbody>
            {core.dimensions.map(dimension => <tr key={dimension.dimensionId}>
              <th scope="row">{pressureDimensionLabel2023(dimension.dimensionId)}</th>
              <td className={styles.valueA}>{formatScore(dimension.regionAScore)}</td>
              <td>{formatScore(dimension.regionBScore)}</td>
              <td>{formatScore(dimension.absoluteDifference)}</td>
            </tr>)}
            <tr>
              <th scope="row">Tekanan relatif keseluruhan<sup>1</sup></th>
              <td className={styles.valueA}>{formatScore(core.overall.regionAScore)}</td>
              <td>{formatScore(core.overall.regionBScore)}</td>
              <td>{formatScore(core.overall.absoluteDifference)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className={`product-caption ${styles.footnote}`}><sup>1</sup> Skor keseluruhan dan keenam dimensi CORE memakai perhitungan CIVX {comparison.referenceYear} yang sama dengan Beranda. Angka dibulatkan hanya untuk tampilan; posisi, panjang batang, dan selisih memakai nilai penuh.</p>
    </section>
    </details>

    <div className="product-section"><Attention comparison={comparison} /></div>

    <nav className={styles.bottomBar} aria-label="Langkah berikutnya">
      <p>Telusuri konteks tiap wilayah sebelum menarik kesimpulan.</p>
      <div>
        <Link className={`civx-button civx-button-secondary ${styles.outlineButton}`} href={`/regions/${regionA.id}`}>Detail {regionA.name} <span aria-hidden="true">›</span></Link>
        <Link className={`civx-button civx-button-secondary ${styles.outlineButton}`} href="/explore">Jelajah wilayah lain <span aria-hidden="true">›</span></Link>
      </div>
    </nav>
  </>;
}

export function ComparisonPage({ comparison, regions, selectedA, selectedB, error }: ComparisonPageProps) {
  const hasA = regions.some(({ region }) => region.id === selectedA);
  const hasB = regions.some(({ region }) => region.id === selectedB);
  const selectionError = error || (comparison === null ? "Perbandingan belum tersedia. Pilih wilayah pertama dan pembanding dari daftar 27 kabupaten/kota Jawa Barat." : undefined);

  return <SectionReveals className={`civx-container product-page ${styles.page}`}>
    <ResultsNotice />
    <PageHeading title="Bandingkan wilayah" breadcrumb="Bandingkan" description="Lihat dua wilayah dalam satu pandangan untuk memahami perbedaan tekanan relatif." />
    <section className={`product-card ${styles.selector}`} aria-label="Pilih wilayah perbandingan">
      <Form action="/compare" scroll={false} className={styles.form} aria-describedby={selectionError ? "selection-error" : undefined}>
        <div className={styles.field}><label htmlFor="compare-a">Wilayah pertama</label><select key={`a-${selectedA}`} id="compare-a" name="a" defaultValue={hasA ? selectedA : ""} required>
          <option value="" disabled>Pilih wilayah</option>
          {regions.map(({ region }) => <option key={region.id} value={region.id}>{region.name}</option>)}
        </select></div>
        <div className={styles.field}><label htmlFor="compare-b">Wilayah pembanding</label><select key={`b-${selectedB}`} id="compare-b" name="b" defaultValue={hasB ? selectedB : ""} required>
          <option value="" disabled>Pilih wilayah</option>
          {regions.map(({ region }) => <option key={region.id} value={region.id}>{region.name}</option>)}
        </select></div>
        <div className={styles.field}><label htmlFor="compare-period">Periode yang sama</label><select id="compare-period" defaultValue="2023">
          <option value="2023">Periode 2023</option>
        </select></div>
        <button type="submit" className="civx-button civx-button-primary">Tampilkan perbandingan</button>
      </Form>
      {selectionError && <div id="selection-error" role="alert" className={styles.error}><strong>Pilihan belum dapat ditampilkan</strong><p>{selectionError}</p><p>Pilih ulang wilayah pada daftar di atas. Pilihan yang tidak dikenal dibiarkan kosong, bukan diganti otomatis.</p></div>}
    </section>
    {comparison !== null && !selectionError && <ComparisonResults comparison={comparison} />}
  </SectionReveals>;
}
