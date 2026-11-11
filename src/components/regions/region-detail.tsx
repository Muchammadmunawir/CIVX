import Link from "next/link";
import { notFound } from "next/navigation";
import { ContextSection } from "@/components/product/context-section";
import { IndicatorDisclosure } from "@/components/product/indicator-disclosure";
import { regionType } from "@/components/product/format";
import { DimensionBars, PageHeading, ResultsNotice, ScoreDisplay } from "@/components/product/product-ui";
import { SectionReveals } from "@/components/product/section-reveals";
import { getExploreRegionsProduct2023, getRegionProductView2023 } from "@/lib/civx/product-2023";
import { getSimilarRegions2023 } from "@/lib/civx/similar-regions-2023";
import { cohortPressureData2023, similarPressureData2023, pressureDimensionLabel2023 } from "@/lib/civx/visualization-2023";
import { CohortPressureChart, SimilarPressureChart } from "@/components/charts/regional-profile-charts";
import { PressureSeriesMark } from "@/components/charts/pressure-plot";
import { RegionSilhouette } from "./region-silhouette";
import { PrintReportButton } from "./print-report-button";
import { RegionalPrintReport } from "./regional-print-report";
import styles from "./region-detail.module.css";

const distanceFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

export function RegionDetail({ id }: { id: string }) {
  const view = getRegionProductView2023(id);
  if (!view) notFound();
  const { region, core, context, methodology } = view;
  const prefix = `region-${region.id}`;
  const similarRegions = getSimilarRegions2023(region.id);
  const distribution = cohortPressureData2023(getExploreRegionsProduct2023(), region.id);
  const similarProfiles = similarRegions ? similarPressureData2023({ region, core }, similarRegions) : undefined;

  return <SectionReveals as="article" className={`civx-container product-page ${styles.page}`} selector="[data-region-screen] [data-reveal]">
    <div data-region-screen>
    <ResultsNotice />
    <nav className={styles.breadcrumb} aria-label="Jejak halaman">
      <Link href="/">Beranda</Link><span aria-hidden="true">/</span><Link href="/explore">Jelajah</Link><span aria-hidden="true">/</span><span aria-current="page">{region.name}</span>
    </nav>
    <PageHeading title={region.name} description="Lihat tekanan relatif wilayah, profil dimensi, serta bukti di balik setiap indikator."
      action={<div className={styles.actions}><Link className="civx-button civx-button-primary" href={`/compare?a=${region.id}`}>Bandingkan wilayah</Link><PrintReportButton /></div>} />

    <div className={styles.overview}>
      <section className={`product-card ${styles.scoreCard}`} aria-label={`${core.label} ${region.referenceYear}`} data-reveal>
        <ScoreDisplay score={core.overallScore} />
        <p className="product-caption">Skala 0–100 · tahun acuan {region.referenceYear}</p>
        <p className={styles.scoreNote}>Enam dimensi · {core.indicators.length} indikator inti</p>
      </section>
      <section className={`product-card ${styles.interpretation}`} aria-labelledby={`${prefix}-reading`} data-reveal data-reveal-order="1">
        <h2 id={`${prefix}-reading`}>Cara membaca skor</h2>
        <p>Skor lebih tinggi berarti tekanan relatif lebih tinggi, bukan capaian yang lebih baik atau lebih buruk.</p>
        <p className="product-caption">Relatif terhadap {methodology.cohortSize} kabupaten/kota {region.province} pada {region.referenceYear}. Bukan peringkat wilayah.</p>
      </section>
      <section className={`product-card ${styles.identity}`} aria-labelledby={`${prefix}-identity`} data-reveal data-reveal-order="2">
        <h2 id={`${prefix}-identity`}>Identitas wilayah</h2>
        <div className={styles.identityRecord}>
        <RegionSilhouette regionId={region.id} regionName={region.name} />
        <dl>
          <div><dt>Wilayah</dt><dd>{region.name}</dd></div>
          <div><dt>Jenis</dt><dd>{regionType(region.type)}</dd></div>
          <div><dt>Provinsi</dt><dd>{region.province}</dd></div>
          <div><dt>Kode BPS</dt><dd>{region.id}</dd></div>
        </dl>
        </div>
      </section>
    </div>

    <nav className={styles.anchors} aria-label="Bagian detail wilayah">
      <a href={`#${prefix}-profile`}>Profil dimensi</a>
      <a href={`#${prefix}-distribution`}>Sebaran kohort</a>
      <a href={`#${prefix}-similar`}>Profil serupa</a>
      <a href={`#${prefix}-indicators`}>Rincian indikator</a>
      <a href={`#${prefix}-context`}>Data konteks</a>
      <a href={`#${prefix}-notes`}>Catatan data</a>
    </nav>

    <div className={`product-grid-two ${styles.profileGrid}`} id={`${prefix}-profile`}>
      <section className="product-card" aria-labelledby={`${prefix}-dimensions`} data-reveal>
        <h2 className="product-section-title" id={`${prefix}-dimensions`}>Profil Dimensi CIVX 2023</h2>
        <p className="product-caption">Enam dimensi tekanan relatif pada tahun acuan 2023, bukan tren antarwaktu.</p>
        <DimensionBars dimensions={core.dimensions} />
      </section>
      <section className="product-card" aria-labelledby={`${prefix}-insights`} data-reveal data-reveal-order="1">
        <h2 className="product-section-title" id={`${prefix}-insights`}>Membaca tekanan relatif</h2>
        <p className="product-caption">Ringkasan deskriptif dari insight inti CIVX. Tidak menjelaskan sebab-akibat atau prioritas kebijakan.</p>
        <div className={styles.insights}>{core.insights.map(insight => <section className={styles.insight} key={insight.insightId}>
          <h3>{insight.title}</h3>
          <p>{insight.message}</p>
        </section>)}</div>
      </section>
    </div>

    <div className={`product-section ${styles.section}`} id={`${prefix}-distribution`} data-reveal>
      <CohortPressureChart data={distribution} />
    </div>

    {similarRegions && similarRegions.length > 0 && <section className={`product-section ${styles.section}`} id={`${prefix}-similar`} aria-labelledby={`${prefix}-similar-title`} data-reveal>
      <h2 className="product-section-title" id={`${prefix}-similar-title`}>Wilayah dengan Profil Serupa</h2>
      <p className={styles.similarIntro}>Pratinjau analitis terbatas pada kohort tetap {methodology.cohortSize} kabupaten/kota Jawa Barat 2023. Jarak Euclidean lebih kecil berarti pola tekanan relatif enam dimensi CORE lebih dekat, bukan skor CIVX baru.</p>
      {similarProfiles && <SimilarPressureChart data={similarProfiles} />}
      <ul className={styles.similarGrid}>{similarRegions.map((peer, index) => <li className={`product-card ${styles.similarCard}`} key={peer.region.id}>
        <h3><PressureSeriesMark slot={index === 0 ? "b" : index === 1 ? "c" : "d"} /> <Link href={`/regions/${peer.region.id}`}>{peer.region.name}</Link></h3>
        <p className={styles.distance}>Jarak profil: <strong><data value={peer.distance}>{distanceFormatter.format(peer.distance)}</data></strong></p>
        <Link className="civx-button civx-button-secondary" href={`/compare?a=${region.id}&b=${peer.region.id}`} aria-label={`Bandingkan ${region.name} dengan ${peer.region.name}`}>Bandingkan profil <span aria-hidden="true">→</span></Link>
      </li>)}</ul>
      <p className="product-caption">Skala tekanan dimensi 0–100 · lebih tinggi berarti tekanan relatif lebih tinggi. Jarak profil bukan persentase kemiripan.</p>
      <p className="product-caption">Kemiripan pola tidak berarti kesamaan penyebab atau keadaan, bukan saran kebijakan, prediksi masa depan, atau klasifikasi resmi. Metrik turunan ini tidak disertakan dalam CSV atau cetak. <Link className="civx-text-link" href="/methodology#profil-serupa">Baca metode dan batasan profil serupa</Link>.</p>
    </section>}

    <section className={`product-section ${styles.section}`} id={`${prefix}-indicators`} aria-labelledby={`${prefix}-indicators-title`}>
      <div className={styles.sectionHeading}>
        <h2 className="product-section-title" id={`${prefix}-indicators-title`}>Rincian pembentuk skor</h2>
        <span className="product-caption">{core.indicators.length} indikator inti · {core.dimensions.length} dimensi</span>
      </div>
      <p className="product-caption">Nilai asli dan tekanan ternormalisasi adalah dua besaran berbeda. Buka indikator untuk definisi, sumber, dan keterbatasannya.</p>
      <div className={styles.indicatorGroups}>{core.dimensions.map(dimension => <section className={`product-card ${styles.indicatorGroup}`} key={dimension.dimensionId} aria-labelledby={`${prefix}-${dimension.dimensionId}`} data-reveal>
        <h3 id={`${prefix}-${dimension.dimensionId}`}>{pressureDimensionLabel2023(dimension.dimensionId)}</h3>
        {core.indicators.filter(indicator => indicator.dimensionId === dimension.dimensionId).map(indicator => <IndicatorDisclosure key={indicator.indicatorId} indicator={indicator} />)}
      </section>)}</div>
    </section>

    <ContextSection sections={context} idPrefix={prefix} />

    <section className={`product-card product-section ${styles.section}`} id={`${prefix}-notes`} aria-labelledby={`${prefix}-notes-title`} data-reveal>
      <h2 className="product-section-title" id={`${prefix}-notes-title`}>Catatan data</h2>
      <p className={styles.noteText}>Nilai 0 bukan berarti tanpa tekanan; nilai 100 bukan batas teoretis terburuk. Tidak ada tren atau rata-rata provinsi pada tampilan ini.</p>
      <p className={styles.noteText}>{methodology.interpretation}</p>
      <ul className={styles.notes}>
        <li>Skor membandingkan {methodology.cohortSize} kabupaten/kota {methodology.province} pada tahun acuan {methodology.referenceYear}, bukan perubahan antarwaktu.</li>
        <li>Nilai asli, satuan, dan periode rujukan tetap mengikuti sumber setiap indikator. Rincian sumber dan keterbatasan dapat dibuka pada setiap indikator.</li>
        <li>Data konteks memiliki cakupan berbeda dan tidak memengaruhi skor. Data yang tidak tercakup tidak diganti dengan nol.</li>
      </ul>
      <div className={styles.footerLinks}><Link className="civx-button civx-button-secondary" href="/methodology">Baca metodologi <span aria-hidden="true">→</span></Link><Link className="civx-text-link" href="/sources">Lihat sumber data <span aria-hidden="true">→</span></Link></div>
    </section>
    </div>
    <RegionalPrintReport view={view} />
  </SectionReveals>;
}
