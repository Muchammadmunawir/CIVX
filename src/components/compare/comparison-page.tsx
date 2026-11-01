import Link from "next/link";
import { ContextSection } from "@/components/product/context-section";
import { formatDifference, formatRaw, formatScore, regionType } from "@/components/product/format";
import { Notice, PageHeading, ScoreDisplay } from "@/components/product/product-ui";
import type { CivxIndicatorComparisonResult2023 } from "@/lib/civx/comparison-types-2023";
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

function RegionSummary({ region, score, side }: {
  region: CivxRegionProductHeader2023;
  score: number;
  side: "A" | "B";
}) {
  return <article className={`product-card ${styles.regionSummary}`} data-side={side}>
    <p className={styles.regionIdentity}><span className={styles.sideMarker}>{side}</span>{regionType(region.type)} · {region.province}</p>
    <h3>{region.name}</h3>
    <ScoreDisplay score={score} label="Tekanan Relatif CIVX · 2023" />
    <p className="product-caption">Skala 0–100 · lebih tinggi berarti tekanan relatif lebih tinggi.</p>
    <Link className="civx-text-link" href={`/regions/${region.id}`}>Detail {region.name} <span aria-hidden="true">→</span></Link>
  </article>;
}

function DimensionComparison({ comparison }: { comparison: ComparisonView }) {
  return <section className={`product-card ${styles.dimensions}`} aria-labelledby="dimensions-heading">
    <h2 className="product-section-title" id="dimensions-heading">Perbandingan per dimensi</h2>
    <p className="product-caption">Skala bersama 0–100. A: {comparison.regionA.name}; B: {comparison.regionB.name}.</p>
    <div className={styles.dimensionList}>{comparison.core.dimensions.map(dimension => <div className={styles.dimensionRow} key={dimension.dimensionId}>
      <div className={styles.dimensionHeading}><h3>{dimension.dimensionName}</h3><span>{formatDifference(dimension.delta)} poin <small>A − B</small></span></div>
      <div className={styles.barRow} data-side="A"><span>A</span><div className={styles.track} aria-hidden="true"><span style={{ width: `${dimension.regionAScore}%` }} /></div><strong>{formatScore(dimension.regionAScore)}</strong></div>
      <div className={styles.barRow} data-side="B"><span>B</span><div className={styles.track} aria-hidden="true"><span style={{ width: `${dimension.regionBScore}%` }} /></div><strong>{formatScore(dimension.regionBScore)}</strong></div>
    </div>)}</div>
    <p className="product-caption">0 dan 100 adalah batas skala relatif, bukan tanpa tekanan atau dampak maksimum teoretis.</p>
  </section>;
}

function ComparisonHighlights({ comparison }: { comparison: ComparisonView }) {
  const { highlights } = comparison.core;
  const { presentation } = comparison;
  return <section className={`product-card ${styles.highlights}`} aria-labelledby="highlights-heading">
    <h2 className="product-section-title" id="highlights-heading">Selisih terbesar</h2>
    <p className="product-caption">Seluruh nilai yang seri tetap ditampilkan. Ini bukan urutan wilayah atau penentu prioritas kebijakan.</p>
    <h3>Dimensi</h3>
    <ul className={styles.highlightList}>{highlights.largestDimensionDifferences.map(dimension => <li key={dimension.dimensionId}>
      <div><strong>{dimension.dimensionName}</strong><span>{presentation.relationLabels[dimension.relation]}</span></div>
      <span className={styles.highlightValue}>{formatDifference(dimension.delta)} poin</span>
    </li>)}</ul>
    <h3>Indikator · tekanan ternormalisasi</h3>
    <ul className={styles.highlightList}>{highlights.largestNormalizedPressureDifferences.map(indicator => <li key={indicator.indicatorId}>
      <div><strong>{indicator.indicatorName}</strong><span>{presentation.relationLabels[indicator.relation]}</span></div>
      <span className={styles.highlightValue}>{formatDifference(indicator.delta)} poin</span>
    </li>)}</ul>
    <p className="product-caption">{presentation.indicatorHighlightNote}</p>
    <Link className="civx-text-link" href="/methodology">Pahami metode dan keterbatasan <span aria-hidden="true">→</span></Link>
  </section>;
}

function IndicatorComparison({ indicator, comparison }: {
  indicator: CivxIndicatorComparisonResult2023;
  comparison: ComparisonView;
}) {
  return <details className={styles.indicator}>
    <summary>
      <span className={styles.indicatorTitle}>{indicator.indicatorName}<small>{comparison.core.dimensions.find(dimension => dimension.dimensionId === indicator.dimensionId)?.dimensionName}</small></span>
      <span className={styles.indicatorNumbers}>
        <span><small>A</small><strong>{formatScore(indicator.normalizedPressureA)}</strong></span>
        <span><small>B</small><strong>{formatScore(indicator.normalizedPressureB)}</strong></span>
        <span><small>A − B</small><strong>{formatDifference(indicator.delta)}</strong></span>
      </span>
    </summary>
    <div className={styles.indicatorBody}>
      <p>{comparison.presentation.relationLabels[indicator.relation]} pada indikator ini.</p>
      <p className="product-caption">Periode referensi: {indicator.referencePeriod}. Nilai mentah memakai satuan asli; arahnya tidak selalu searah dengan tekanan ternormalisasi.</p>
      <div className="product-table-wrap"><table className={`product-table ${styles.rawTable}`}>
        <caption>Nilai mentah dan tekanan ternormalisasi · {indicator.indicatorName}</caption>
        <thead><tr><th scope="col">Wilayah</th><th scope="col">Nilai mentah</th><th scope="col">Tekanan 0–100</th></tr></thead>
        <tbody>
          <tr><th scope="row">A · {comparison.regionA.name}</th><td>{formatRaw(indicator.rawValueA, indicator.unit)}</td><td>{formatScore(indicator.normalizedPressureA)}</td></tr>
          <tr><th scope="row">B · {comparison.regionB.name}</th><td>{formatRaw(indicator.rawValueB, indicator.unit)}</td><td>{formatScore(indicator.normalizedPressureB)}</td></tr>
        </tbody>
      </table></div>
      <details className={styles.disclosure}><summary>Presisi tercatat dan penunjuk bukti</summary>
        <p className="product-caption">Nilai berikut dipertahankan tanpa pembulatan tampilan. Penunjuk bukti merujuk rekaman perhitungan, bukan URL sumber.</p>
        <pre>{JSON.stringify(indicator, null, 2)}</pre>
      </details>
    </div>
  </details>;
}

function ComparisonResults({ comparison }: { comparison: ComparisonView }) {
  const { core, regionA, regionB, presentation } = comparison;
  return <>
    <section className="product-section" aria-labelledby="results-heading">
      <div className={styles.sectionHead}><h2 className="product-section-title" id="results-heading">Tekanan relatif dua wilayah</h2>
        <Link className="civx-text-link" href={{ pathname: "/compare", query: { a: regionB.id, b: regionA.id } }}>Tukar A dan B <span aria-hidden="true">⇄</span></Link>
      </div>
      <div className={styles.summaryGrid}>
        <RegionSummary region={regionA} score={core.overall.regionAScore} side="A" />
        <RegionSummary region={regionB} score={core.overall.regionBScore} side="B" />
      </div>
      <div className={styles.difference}>
        <strong>{formatDifference(core.overall.delta)} <span>poin</span></strong>
        <div><h3>{presentation.overallLabel} · A − B</h3><p>{presentation.relationLabels[core.overall.relation]}</p></div>
      </div>
      <p className={`product-caption ${styles.roundingNote}`}>Selisih selalu A dikurangi B, dihitung dari nilai tercatat sebelum pembulatan. Skor dan selisih dibulatkan sendiri-sendiri untuk tampilan; hasil pengurangan angka tampilan dapat berbeda. Tidak ada pemenang atau penilaian lebih baik/buruk.</p>
    </section>
    <div className={styles.analysisGrid}>
      <DimensionComparison comparison={comparison} />
      <ComparisonHighlights comparison={comparison} />
    </div>
    <section className="product-section" aria-labelledby="indicators-heading">
      <div className={styles.sectionHead}><h2 className="product-section-title" id="indicators-heading">Rincian {core.indicators.length} indikator</h2><p className="product-caption">{presentation.indicatorDifferenceLabel} · poin A − B</p></div>
      <p className="product-caption">A: {regionA.name} · B: {regionB.name}. Buka setiap baris untuk nilai mentah, satuan, periode, dan presisi tercatat.</p>
      <div className={styles.indicatorList}>{core.indicators.map(indicator => <IndicatorComparison key={indicator.indicatorId} indicator={indicator} comparison={comparison} />)}</div>
    </section>
    <section className="product-section" aria-labelledby="comparison-context-heading">
      <h2 className="product-section-title" id="comparison-context-heading">Konteks wilayah · bukan skor</h2>
      <Notice>Data konteks tidak memengaruhi skor CORE. Cakupan, periode, dan tingkat geografis dapat berbeda; tidak dihitung selisih antardaerah.</Notice>
      <div className={styles.contextGrid}>
        <div className={styles.contextColumn}><h3>A · {regionA.name}</h3><ContextSection sections={comparison.context.regionA} idPrefix={`compare-a-${regionA.id}`} headingLevel={4} /></div>
        <div className={styles.contextColumn}><h3>B · {regionB.name}</h3><ContextSection sections={comparison.context.regionB} idPrefix={`compare-b-${regionB.id}`} headingLevel={4} /></div>
      </div>
    </section>
    <details className={`product-card ${styles.disclosure} ${styles.methodDisclosure}`}>
      <summary>Metode, metadata, dan presisi skor perbandingan</summary>
      <p>{core.metadata.interpretation}</p>
      <p className="product-caption">Rekaman asli berikut mempertahankan presisi skor, konvensi selisih, aturan kesamaan, sidik artefak, dan status rilis.</p>
      <pre>{JSON.stringify({ overall: core.overall, dimensions: core.dimensions, metadata: core.metadata, methodology: comparison.methodology }, null, 2)}</pre>
    </details>
  </>;
}

export function ComparisonPage({ comparison, regions, selectedA, selectedB, error }: ComparisonPageProps) {
  const hasA = regions.some(({ region }) => region.id === selectedA);
  const hasB = regions.some(({ region }) => region.id === selectedB);
  const selectionError = error || (comparison === null ? "Perbandingan belum tersedia. Pilih wilayah A dan B dari daftar 27 kabupaten/kota Jawa Barat." : undefined);

  return <main className={`civx-container product-page ${styles.page}`}>
    <PageHeading title="Bandingkan wilayah" breadcrumb="Bandingkan" description="Baca perbedaan tekanan relatif dua wilayah Jawa Barat pada snapshot 2023, bukan peringkat kinerja." />
    <section className={`product-card ${styles.selector}`} aria-label="Pilih wilayah perbandingan">
      <form action="/compare" method="get" className={styles.form} key={`${selectedA}:${selectedB}`} aria-describedby={selectionError ? "selection-help selection-error" : "selection-help"}>
        <div className={styles.field}><label htmlFor="compare-a">Wilayah A</label><select id="compare-a" name="a" defaultValue={hasA ? selectedA : ""} required>
          <option value="" disabled>Pilih wilayah A</option>
          {regions.map(({ region }) => <option key={region.id} value={region.id}>{region.name}</option>)}
        </select></div>
        <div className={styles.field}><label htmlFor="compare-b">Wilayah B</label><select id="compare-b" name="b" defaultValue={hasB ? selectedB : ""} required>
          <option value="" disabled>Pilih wilayah B</option>
          {regions.map(({ region }) => <option key={region.id} value={region.id}>{region.name}</option>)}
        </select></div>
        <p className={styles.period}>Periode referensi<strong>2023</strong></p>
        <button type="submit" className="civx-button civx-button-primary">Tampilkan perbandingan</button>
      </form>
      <p className="product-caption" id="selection-help">Daftar mengikuti urutan kode BPS, bukan skor. Wilayah yang sama boleh dipilih pada kedua sisi.</p>
      {selectionError && <div id="selection-error" role="alert" className={styles.error}><strong>Pilihan belum dapat ditampilkan</strong><p>{selectionError}</p><p>Pilih ulang wilayah pada daftar di atas. Pilihan yang tidak dikenal dibiarkan kosong, bukan diganti otomatis.</p></div>}
    </section>
    <div className={styles.snapshotNotice}><Notice>Snapshot 2023 · enam dimensi CORE dan 18 indikator. Skor serta insight masih berstatus belum dirilis publik. Nilai lebih tinggi berarti tekanan relatif lebih tinggi; bukan bukti sebab-akibat.</Notice></div>
    {comparison !== null && !selectionError && <ComparisonResults comparison={comparison} />}
    <nav className={styles.bottomLinks} aria-label="Bacaan terkait"><Link className="civx-text-link" href="/explore">Jelajahi wilayah lain <span aria-hidden="true">→</span></Link><Link className="civx-text-link" href="/methodology">Metodologi <span aria-hidden="true">→</span></Link><Link className="civx-text-link" href="/sources">Sumber data <span aria-hidden="true">→</span></Link></nav>
  </main>;
}
