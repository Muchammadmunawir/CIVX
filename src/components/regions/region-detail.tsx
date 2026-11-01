import Link from "next/link";
import { notFound } from "next/navigation";
import { ContextSection } from "@/components/product/context-section";
import { IndicatorDisclosure } from "@/components/product/indicator-disclosure";
import { formatRaw, regionType } from "@/components/product/format";
import { DimensionBars, Notice, PageHeading, ScoreDisplay } from "@/components/product/product-ui";
import { getRegionProductView2023 } from "@/lib/civx/product-2023";
import styles from "./region-detail.module.css";

export function RegionDetail({ id }: { id: string }) {
  const view = getRegionProductView2023(id);
  if (!view) notFound();
  const { region, core, context, methodology } = view;
  const prefix = `region-${region.id}`;

  return <article className={`civx-container product-page ${styles.page}`}>
    <nav className={styles.breadcrumb} aria-label="Jejak halaman">
      <Link href="/">Beranda</Link><span aria-hidden="true">/</span><Link href="/explore">Jelajah</Link><span aria-hidden="true">/</span><span aria-current="page">{region.name}</span>
    </nav>
    <PageHeading title={region.name} description="Lihat tekanan relatif wilayah, profil dimensi, serta bukti di balik setiap indikator."
      action={<Link className="civx-button civx-button-primary" href={`/compare?a=${region.id}`}>Bandingkan wilayah</Link>} />

    <div className={styles.overview}>
      <section className={`product-card ${styles.scoreCard}`} aria-label={`${core.label} ${region.referenceYear}`}>
        <ScoreDisplay score={core.overallScore} />
        <p className="product-caption">Skala 0–100 · tahun acuan {region.referenceYear}</p>
        <p className={styles.scoreNote}>Enam dimensi · {core.indicators.length} indikator inti</p>
      </section>
      <section className={`product-card ${styles.interpretation}`} aria-labelledby={`${prefix}-reading`}>
        <h2 id={`${prefix}-reading`}>Cara membaca skor</h2>
        <p>Skor lebih tinggi berarti tekanan relatif lebih tinggi, bukan capaian yang lebih baik atau lebih buruk.</p>
        <p className="product-caption">Relatif terhadap {methodology.cohortSize} kabupaten/kota {region.province} pada {region.referenceYear}. Bukan peringkat wilayah.</p>
      </section>
      <section className={`product-card ${styles.identity}`} aria-labelledby={`${prefix}-identity`}>
        <h2 id={`${prefix}-identity`}>Identitas wilayah</h2>
        <dl>
          <div><dt>Wilayah</dt><dd>{region.name}</dd></div>
          <div><dt>Jenis</dt><dd>{regionType(region.type)}</dd></div>
          <div><dt>Provinsi</dt><dd>{region.province}</dd></div>
          <div><dt>Kode BPS</dt><dd>{region.id}</dd></div>
        </dl>
      </section>
    </div>

    <div className={styles.notice}><Notice>Skor mengacu pada 2023. Setiap indikator tetap memakai periode rujukan sumbernya. Data konteks terpisah dan tidak memengaruhi skor.</Notice></div>

    <nav className={styles.anchors} aria-label="Bagian detail wilayah">
      <a href={`#${prefix}-profile`}>Profil dimensi</a>
      <a href={`#${prefix}-indicators`}>Rincian indikator</a>
      <a href={`#${prefix}-context`}>Data konteks</a>
      <a href={`#${prefix}-notes`}>Catatan data</a>
    </nav>

    <div className={`product-grid-two ${styles.profileGrid}`} id={`${prefix}-profile`}>
      <section className="product-card" aria-labelledby={`${prefix}-dimensions`}>
        <h2 className="product-section-title" id={`${prefix}-dimensions`}>Profil Dimensi CIVX 2023</h2>
        <p className="product-caption">Enam dimensi tekanan relatif pada tahun acuan 2023, bukan tren antarwaktu.</p>
        <DimensionBars dimensions={core.dimensions} />
      </section>
      <section className="product-card" aria-labelledby={`${prefix}-insights`}>
        <h2 className="product-section-title" id={`${prefix}-insights`}>Membaca tekanan relatif</h2>
        <p className="product-caption">Ringkasan deskriptif dari insight inti CIVX. Tidak menjelaskan sebab-akibat atau prioritas kebijakan.</p>
        <div className={styles.insights}>{core.insights.map(insight => <section className={styles.insight} key={insight.insightId}>
          <h3>{insight.title}</h3>
          <p>{insight.message}</p>
          <details className={styles.disclosure}>
            <summary>Jejak bukti insight</summary>
            <dl className={styles.metadata}>
              <div><dt>ID insight</dt><dd><code>{insight.insightId}</code></dd></div>
              <div><dt>Template</dt><dd><code>{insight.templateKey}</code></dd></div>
              <div><dt>Kunci teks perbandingan</dt><dd><code>{insight.evidence.comparisonTextKey}</code></dd></div>
              {insight.evidence.overall && <div><dt>Jejak skor keseluruhan</dt><dd><code>{insight.evidence.overall.scoringPointer}</code></dd></div>}
              {insight.evidence.dimensions.map(dimension => <div key={dimension.dimensionId}><dt>Jejak dimensi {dimension.displayName}</dt><dd><code>{dimension.scoringPointer}</code></dd></div>)}
              {insight.evidence.indicators.map(indicator => <div key={indicator.indicatorId}><dt>Jejak indikator {indicator.displayName}</dt><dd><code>{indicator.scoringPointer}</code></dd></div>)}
            </dl>
          </details>
        </section>)}</div>
      </section>
    </div>

    <section className={`product-section ${styles.section}`} id={`${prefix}-indicators`} aria-labelledby={`${prefix}-indicators-title`}>
      <div className={styles.sectionHeading}>
        <h2 className="product-section-title" id={`${prefix}-indicators-title`}>Rincian pembentuk skor</h2>
        <span className="product-caption">{core.indicators.length} indikator inti · {core.dimensions.length} dimensi</span>
      </div>
      <p className="product-caption">Nilai asli dan tekanan ternormalisasi adalah dua besaran berbeda. Buka indikator untuk definisi, sumber, dan keterbatasannya.</p>
      <div className={styles.indicatorGroups}>{core.dimensions.map(dimension => <section className={`product-card ${styles.indicatorGroup}`} key={dimension.dimensionId} aria-labelledby={`${prefix}-${dimension.dimensionId}`}>
        <h3 id={`${prefix}-${dimension.dimensionId}`}>{dimension.displayName}</h3>
        {core.indicators.filter(indicator => indicator.dimensionId === dimension.dimensionId).map(indicator => <IndicatorDisclosure key={indicator.indicatorId} indicator={indicator} />)}
      </section>)}</div>
    </section>

    <ContextSection sections={context} idPrefix={prefix} />

    <section className={`product-card product-section ${styles.section}`} id={`${prefix}-notes`} aria-labelledby={`${prefix}-notes-title`}>
      <h2 className="product-section-title" id={`${prefix}-notes-title`}>Catatan data</h2>
      <p className={styles.noteText}>Nilai 0 bukan berarti tanpa tekanan; nilai 100 bukan batas teoretis terburuk. Tidak ada tren atau rata-rata provinsi pada tampilan ini.</p>
      <details className={styles.disclosure}>
        <summary>Metodologi dan metadata artefak</summary>
        <p className={styles.noteText}>{methodology.interpretation}</p>
        <ul className={styles.notes}>{methodology.notes.map(note => <li key={note}>{note}</li>)}</ul>
        <dl className={styles.metadata}>
          <div><dt>Model</dt><dd><code>{methodology.modelId}</code> · versi {methodology.modelVersion}</dd></div>
          <div><dt>Geografi</dt><dd>{methodology.geographicLevel} · {methodology.province}</dd></div>
          <div><dt>Tahun acuan</dt><dd>{methodology.referenceYear}</dd></div>
          <div><dt>Status artefak skor</dt><dd><code>{methodology.scoreStatus}</code></dd></div>
          <div><dt>Status artefak insight</dt><dd><code>{methodology.insightStatus}</code></dd></div>
          <div><dt>Flag integrasi produksi artefak</dt><dd>{String(methodology.productionIntegrationAuthorized)} · tidak diubah oleh tampilan ini</dd></div>
          <div><dt>Peringkat publik dihasilkan</dt><dd>{String(methodology.publicRankingGenerated)}</dd></div>
          <div><dt>Artefak skor</dt><dd><code>{methodology.sources.scoreArtifact.path}</code><br />SHA-256: <code>{methodology.sources.scoreArtifact.sha256}</code><br />{formatRaw(methodology.sources.scoreArtifact.bytes, "byte")}</dd></div>
          <div><dt>Artefak insight</dt><dd><code>{methodology.sources.insightArtifact.path}</code><br />SHA-256: <code>{methodology.sources.insightArtifact.sha256}</code><br />{formatRaw(methodology.sources.insightArtifact.bytes, "byte")}</dd></div>
          <div><dt>Definisi indikator beku</dt><dd><code>{methodology.sources.freezePath}</code></dd></div>
          <div><dt>Normalisasi</dt><dd><code>{methodology.sources.normalizationPath}</code></dd></div>
          <div><dt>Pembobotan</dt><dd><code>{methodology.sources.weightingPath}</code></dd></div>
          <div><dt>Registri wilayah</dt><dd><code>{methodology.sources.registryPath}</code></dd></div>
        </dl>
      </details>
      <div className={styles.footerLinks}><Link className="civx-button civx-button-secondary" href="/methodology">Baca metodologi <span aria-hidden="true">→</span></Link><Link className="civx-text-link" href="/sources">Lihat sumber data <span aria-hidden="true">→</span></Link></div>
    </section>
  </article>;
}
