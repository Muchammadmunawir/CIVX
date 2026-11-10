import Link from "next/link";
import { formatDifference, formatScore, regionType } from "@/components/product/format";
import { Notice, PageHeading } from "@/components/product/product-ui";
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
  return <article className={`product-card ${styles.regionSummary}`} data-side={side}>
    <p className={styles.regionIdentity}>{side} · {regionType(region.type)} · {region.province}</p>
    <h3>{region.name}</h3>
    <p className={styles.bigScore}><strong>{formatScore(pressure)}</strong> <small>/ 100</small></p>
    <p className={styles.scoreNote}>Tekanan relatif CIVX · semakin tinggi, semakin tinggi tekanan relatif.</p>
  </article>;
}

function DimensionComparison({ comparison }: { comparison: ComparisonView }) {
  return <section className={`product-card ${styles.dimensions}`} aria-labelledby="dimensions-heading">
    <h2 className="product-section-title" id="dimensions-heading">Perbandingan per dimensi</h2>
    <p className={styles.legend}>
      <span data-side="A"><i aria-hidden="true" />{comparison.regionA.name}</span>
      <span data-side="B"><i aria-hidden="true" />{comparison.regionB.name}</span>
    </p>
    <div className={styles.dimensionList}>{comparison.core.dimensions.map(dimension => <div className={styles.dimensionRow} key={dimension.dimensionId}>
      <div className={styles.dimensionHeading}>
        <h3>{dimension.dimensionName}</h3>
        <span className={styles.pair}><strong>{formatScore(dimension.regionAScore)}</strong> / <b>{formatScore(dimension.regionBScore)}</b></span>
      </div>
      <div className={styles.track} data-side="A" aria-hidden="true"><span style={{ width: `${dimension.regionAScore}%` }} /></div>
      <div className={styles.track} data-side="B" aria-hidden="true"><span style={{ width: `${dimension.regionBScore}%` }} /></div>
    </div>)}</div>
    <p className="product-caption">Skala sama: 0–100 · semakin tinggi, semakin tinggi tekanan relatif.</p>
  </section>;
}

function Attention({ comparison }: { comparison: ComparisonView }) {
  return <section className={`product-card ${styles.attention}`} aria-labelledby="attention-heading">
    <h2 className="product-section-title" id="attention-heading">Batas pembacaan</h2>
    <span className={styles.readingTag}>Cara membaca</span>
    <h3>Tekanan relatif, bukan penilaian kualitas wilayah.</h3>
    <p>{comparison.core.overall.absoluteDifference === 0
      ? "Skor keseluruhan kedua pilihan sama. Jarak absolut dan selisih bertanda A dikurangi B sama-sama nol."
      : "Jarak absolut menunjukkan besar perbedaan tanpa arah. Selisih bertanda A dikurangi B menunjukkan arah perbedaan tekanan relatif, bukan keunggulan wilayah."}</p>
    <hr />
    <p className={styles.muted}>Selisih kecil bukan bukti signifikansi statistik. Skor ini bukan peringkat resmi, penilaian kualitas wilayah, atau rekomendasi kebijakan. Data CONTEXT tidak masuk skor CORE.</p>
    <Link className={`civx-button civx-button-secondary ${styles.outlineButton}`} href="/methodology">Pahami keterbatasan <span aria-hidden="true">›</span></Link>
  </section>;
}

function ComparisonResults({ comparison }: { comparison: ComparisonView }) {
  const { core, regionA, regionB } = comparison;

  return <>
    <section className={styles.results} aria-labelledby="results-heading">
      <h2 className="civx-sr-only" id="results-heading">Tekanan relatif dua wilayah</h2>
      <div className={styles.summaryGrid}>
        <RegionSummary region={regionA} pressure={core.overall.regionAScore} side="A" />
        <RegionSummary region={regionB} pressure={core.overall.regionBScore} side="B" />
      </div>
      <div className={styles.difference}>
        <strong>{formatScore(core.overall.absoluteDifference)} <span>poin</span></strong>
        <div>
          <h3>Jarak absolut skor tekanan relatif</h3>
          <p>{regionA.name} {formatScore(core.overall.regionAScore)}; {regionB.name} {formatScore(core.overall.regionBScore)}. Selisih bertanda A dikurangi B: <strong>{formatDifference(core.overall.delta)}</strong> poin. Selisih ini tidak menjelaskan penyebab perbedaan.</p>
        </div>
      </div>
    </section>

    <div className={styles.analysisGrid}>
      <DimensionComparison comparison={comparison} />
      <Attention comparison={comparison} />
    </div>

    <section className="product-section" aria-labelledby="detail-heading">
      <div className={styles.sectionHead}>
        <h2 className="product-section-title" id="detail-heading">Rincian perbandingan</h2>
        <p className="product-caption">Tekanan relatif 0–100 · semakin tinggi, semakin tinggi tekanan relatif</p>
      </div>
      <div className="product-table-wrap">
        <table className={`product-table ${styles.detailTable}`}>
          <caption className="civx-sr-only">Rincian tekanan relatif {regionA.name} dan {regionB.name} per dimensi</caption>
          <thead><tr><th scope="col">Dimensi</th><th scope="col">{regionA.name}</th><th scope="col">{regionB.name}</th><th scope="col">Jarak absolut (poin)</th></tr></thead>
          <tbody>
            {core.dimensions.map(dimension => <tr key={dimension.dimensionId}>
              <th scope="row">{dimension.dimensionName}</th>
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
      <p className={`product-caption ${styles.footnote}`}><sup>1</sup> Skor keseluruhan dan keenam dimensi CORE menggunakan perhitungan CIVX {comparison.referenceYear} yang sama dengan Beranda. Angka dibulatkan hanya untuk tampilan; panjang batang memakai nilai penuh.</p>
    </section>

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

  return <main className={`civx-container product-page ${styles.page}`}>
    <PageHeading title="Bandingkan wilayah" breadcrumb="Bandingkan" description="Lihat dua wilayah dalam satu pandangan untuk memahami perbedaan tekanan relatif." />
    <section className={`product-card ${styles.selector}`} aria-label="Pilih wilayah perbandingan">
      <form action="/compare" method="get" className={styles.form} key={`${selectedA}:${selectedB}`} aria-describedby={selectionError ? "selection-error" : undefined}>
        <div className={styles.field}><label htmlFor="compare-a">Wilayah pertama</label><select id="compare-a" name="a" defaultValue={hasA ? selectedA : ""} required>
          <option value="" disabled>Pilih wilayah</option>
          {regions.map(({ region }) => <option key={region.id} value={region.id}>{region.name}</option>)}
        </select></div>
        <div className={styles.field}><label htmlFor="compare-b">Wilayah pembanding</label><select id="compare-b" name="b" defaultValue={hasB ? selectedB : ""} required>
          <option value="" disabled>Pilih wilayah</option>
          {regions.map(({ region }) => <option key={region.id} value={region.id}>{region.name}</option>)}
        </select></div>
        <div className={styles.field}><label htmlFor="compare-period">Periode yang sama</label><select id="compare-period" defaultValue="2023">
          <option value="2023">Periode 2023</option>
        </select></div>
        <button type="submit" className="civx-button civx-button-primary">Tampilkan perbandingan</button>
      </form>
      {selectionError && <div id="selection-error" role="alert" className={styles.error}><strong>Pilihan belum dapat ditampilkan</strong><p>{selectionError}</p><p>Pilih ulang wilayah pada daftar di atas. Pilihan yang tidak dikenal dibiarkan kosong, bukan diganti otomatis.</p></div>}
    </section>
    <div className={styles.snapshotNotice}><Notice>Skor tekanan relatif CIVX 2023 membandingkan kohor tetap 27 kabupaten/kota Jawa Barat, bukan skala kualitas absolut. Semakin tinggi skor, semakin tinggi tekanan relatif. Skor ini bukan peringkat resmi atau rekomendasi kebijakan; data CONTEXT tidak masuk skor.</Notice></div>
    {comparison !== null && !selectionError && <ComparisonResults comparison={comparison} />}
  </main>;
}
