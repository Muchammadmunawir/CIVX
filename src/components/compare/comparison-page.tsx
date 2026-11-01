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

/**
 * The four comparison aspects map one-to-one onto CORE dimensions.
 * Disaster and environment pressure still enter the overall index (see footnote).
 */
const ASPECTS = [
  { dimensionId: "education", label: "Pendidikan" },
  { dimensionId: "public_health", label: "Kesehatan" },
  { dimensionId: "socioeconomic", label: "Ekonomi" },
  { dimensionId: "basic_services", label: "Infrastruktur" },
] as const;

/** Same reading as Beranda: index = 100 − relative pressure, so higher reads as better. */
const toIndex = (pressure: number) => 100 - pressure;

interface Badge { label: string; tone: "good" | "warning" | "bad" }

function badgeFor(regionId: string, index: number, bestId: string, priorityId: string): Badge {
  if (regionId === bestId) return { label: "Performa terbaik", tone: "good" };
  if (regionId === priorityId) return { label: "Butuh prioritas", tone: "bad" };
  if (index >= 70) return { label: "Baik", tone: "good" };
  if (index >= 50) return { label: "Cukup", tone: "warning" };
  return { label: "Perlu perhatian", tone: "bad" };
}

function RegionSummary({ region, pressure, side, average, badge }: {
  region: CivxRegionProductHeader2023;
  pressure: number;
  side: "A" | "B";
  average: number;
  badge: Badge;
}) {
  const index = toIndex(pressure);
  const gap = index - average;
  return <article className={`product-card ${styles.regionSummary}`} data-side={side}>
    <div className={styles.regionTop}>
      <p className={styles.regionIdentity}>{regionType(region.type)} · {region.province}</p>
      <span className={styles.badge} data-tone={badge.tone}>{badge.label}</span>
    </div>
    <h3>{region.name}</h3>
    <p className={styles.bigScore}><strong>{formatScore(index)}</strong> <small>/ 100</small></p>
    <p className={styles.scoreNote}>Skor dari Beranda · tekanan relatif CIVX {formatScore(pressure)}</p>
    <p className={styles.averageRow}>
      <span>Selisih dari rata-rata provinsi {formatScore(average)}</span>
      <strong data-tone={gap >= 0 ? "good" : "bad"}>{formatDifference(gap)} poin</strong>
    </p>
  </article>;
}

function aspectRows(comparison: ComparisonView) {
  return ASPECTS.flatMap(aspect => {
    const dimension = comparison.core.dimensions.find(item => item.dimensionId === aspect.dimensionId);
    if (!dimension) return [];
    return [{
      ...aspect,
      a: toIndex(dimension.regionAScore),
      b: toIndex(dimension.regionBScore),
      gap: dimension.absoluteDifference,
    }];
  });
}

function DimensionComparison({ comparison, rows }: { comparison: ComparisonView; rows: ReturnType<typeof aspectRows> }) {
  return <section className={`product-card ${styles.dimensions}`} aria-labelledby="dimensions-heading">
    <h2 className="product-section-title" id="dimensions-heading">Perbandingan per dimensi</h2>
    <p className={styles.legend}>
      <span data-side="A"><i aria-hidden="true" />{comparison.regionA.name}</span>
      <span data-side="B"><i aria-hidden="true" />{comparison.regionB.name}</span>
    </p>
    <div className={styles.dimensionList}>{rows.map(row => <div className={styles.dimensionRow} key={row.dimensionId}>
      <div className={styles.dimensionHeading}>
        <h3>{row.label}</h3>
        <span className={styles.pair}><strong>{formatScore(row.a)}</strong> / <b>{formatScore(row.b)}</b></span>
      </div>
      <div className={styles.track} data-side="A" aria-hidden="true"><span style={{ width: `${row.a}%` }} /></div>
      <div className={styles.track} data-side="B" aria-hidden="true"><span style={{ width: `${row.b}%` }} /></div>
    </div>)}</div>
    <p className="product-caption">Skala sama: 0–100 · semakin tinggi semakin baik.</p>
  </section>;
}

function Attention({ comparison, rows }: { comparison: ComparisonView; rows: ReturnType<typeof aspectRows> }) {
  const largest = rows.reduce((top, row) => (row.gap > top.gap ? row : top), rows[0]);
  const same = comparison.regionA.id === comparison.regionB.id;
  return <section className={`product-card ${styles.attention}`} aria-labelledby="attention-heading">
    <h2 className="product-section-title" id="attention-heading">Yang perlu diperhatikan</h2>
    <span className={styles.readingTag}>Cara membaca</span>
    <h3>Melihat kesenjangan, bukan sekadar peringkat.</h3>
    <p>{same || !largest || largest.gap === 0
      ? "Kedua pilihan memiliki skor yang sama pada keempat dimensi, sehingga tidak ada kesenjangan untuk dibaca."
      : `Selisih terbesar ada pada dimensi ${largest.label.toLowerCase()}, yaitu ${formatScore(largest.gap)} poin. Skor yang lebih rendah mengajak kita menelusuri kebutuhan layanan, bukan memberi label pada masyarakatnya.`}</p>
    <hr />
    <p className={styles.muted}>Bandingkan wilayah dengan mempertimbangkan karakter kota/kabupaten, sebaran penduduk, dan kelengkapan data.</p>
    <Link className={`civx-button civx-button-secondary ${styles.outlineButton}`} href="/methodology">Pahami keterbatasan <span aria-hidden="true">›</span></Link>
  </section>;
}

function ComparisonResults({ comparison, regions }: { comparison: ComparisonView; regions: readonly CivxExploreRegionProduct2023[] }) {
  const { core, regionA, regionB } = comparison;
  const average = toIndex(regions.reduce((sum, view) => sum + view.core.overallScore, 0) / regions.length);
  const sorted = [...regions].sort((x, y) => x.core.overallScore - y.core.overallScore);
  const bestId = sorted[0].region.id;
  const priorityId = sorted[sorted.length - 1].region.id;
  const indexA = toIndex(core.overall.regionAScore);
  const indexB = toIndex(core.overall.regionBScore);
  const rows = aspectRows(comparison);

  return <>
    <section className={styles.results} aria-labelledby="results-heading">
      <h2 className="civx-sr-only" id="results-heading">Indeks dua wilayah</h2>
      <div className={styles.summaryGrid}>
        <RegionSummary region={regionA} pressure={core.overall.regionAScore} side="A" average={average} badge={badgeFor(regionA.id, indexA, bestId, priorityId)} />
        <RegionSummary region={regionB} pressure={core.overall.regionBScore} side="B" average={average} badge={badgeFor(regionB.id, indexB, bestId, priorityId)} />
      </div>
      <div className={styles.difference}>
        <strong>{formatScore(core.overall.absoluteDifference)} <span>poin</span></strong>
        <div>
          <h3>Selisih indeks antardua wilayah</h3>
          <p>{regionA.name} {formatScore(indexA)} – {regionB.name} {formatScore(indexB)}. Selisih ini tidak menjelaskan penyebab perbedaan.</p>
        </div>
      </div>
    </section>

    <div className={styles.analysisGrid}>
      <DimensionComparison comparison={comparison} rows={rows} />
      <Attention comparison={comparison} rows={rows} />
    </div>

    <section className="product-section" aria-labelledby="detail-heading">
      <div className={styles.sectionHead}>
        <h2 className="product-section-title" id="detail-heading">Rincian perbandingan</h2>
        <p className="product-caption">Indeks 0–100 · semakin tinggi semakin baik</p>
      </div>
      <div className="product-table-wrap">
        <table className={`product-table ${styles.detailTable}`}>
          <caption className="civx-sr-only">Rincian indeks {regionA.name} dan {regionB.name} per dimensi</caption>
          <thead><tr><th scope="col">Dimensi</th><th scope="col">{regionA.name}</th><th scope="col">{regionB.name}</th><th scope="col">Selisih poin</th></tr></thead>
          <tbody>
            {rows.map(row => <tr key={row.dimensionId}>
              <th scope="row">{row.label}</th>
              <td className={styles.valueA}>{formatScore(row.a)}</td>
              <td>{formatScore(row.b)}</td>
              <td>{formatScore(row.gap)}</td>
            </tr>)}
            <tr>
              <th scope="row">Indeks keseluruhan<sup>1</sup></th>
              <td className={styles.valueA}>{formatScore(indexA)}</td>
              <td>{formatScore(indexB)}</td>
              <td>{formatScore(core.overall.absoluteDifference)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className={`product-caption ${styles.footnote}`}><sup>1</sup> Indeks keseluruhan sama dengan di Beranda dan dihitung dari keenam dimensi CIVX {comparison.referenceYear} (termasuk tekanan bencana dan lingkungan), sehingga bukan rata-rata empat dimensi di atas.</p>
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
    <PageHeading title="Bandingkan wilayah" breadcrumb="Bandingkan" description="Lihat dua wilayah dalam satu pandangan untuk memahami perbedaan capaian dan prioritas." />
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
    <div className={styles.snapshotNotice}><Notice>Skor utama mengikuti Beranda: indeks = 100 − skor tekanan relatif CIVX 2023, sehingga semakin tinggi semakin baik. Empat dimensi di bawah diambil dari dimensi Pendidikan, Kesehatan Masyarakat, Sosial-Ekonomi, dan Layanan Dasar.</Notice></div>
    {comparison !== null && !selectionError && <ComparisonResults comparison={comparison} regions={regions} />}
  </main>;
}
