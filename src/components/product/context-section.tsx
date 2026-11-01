import type { CivxContextProductItem2023, CivxContextProductObservation2023, CivxContextProductSection2023 } from "@/lib/civx/product-view-types-2023";
import { formatRaw } from "./format";
import { SourceEvidence } from "./indicator-disclosure";
import styles from "./context-section.module.css";

function Observation({ observation }: { observation: CivxContextProductObservation2023 }) {
  return <li className={styles.observation}>
    <div className={styles.observationHeading}>
      <strong>{observation.siteName ?? observation.geographicLevel}</strong>
      <span>{formatRaw(observation.value, observation.unit)}</span>
    </div>
    <p className={styles.period}>Periode observasi: {observation.period}</p>
    <details className={styles.metadataDisclosure}>
      <summary>Bukti observasi</summary>
      <dl className={styles.metadata}>
        <div><dt>ID observasi</dt><dd><code>{observation.observationId}</code></dd></div>
        <div><dt>Tingkat geografi</dt><dd>{observation.geographicLevel}</dd></div>
        {observation.siteId !== null && <div><dt>ID lokasi</dt><dd><code>{observation.siteId}</code></dd></div>}
        <div><dt>Nilai dalam sumber</dt><dd>{String(observation.sourceValue)}</dd></div>
        <div><dt>ID sumber</dt><dd><code>{observation.sourceId}</code></dd></div>
        <div><dt>Lokasi dalam sumber</dt><dd>{observation.sourceLocator}</dd></div>
        <div><dt>Jejak bukti</dt><dd><code>{observation.evidencePointer}</code></dd></div>
      </dl>
      {observation.limitations.length > 0 && <ul className={styles.notes}>{observation.limitations.map((note, index) => <li key={index}>{note}</li>)}</ul>}
    </details>
  </li>;
}

function ContextItem({ item }: { item: CivxContextProductItem2023 }) {
  return <details className={styles.item}>
    <summary>
      <span className={styles.itemHeading}><strong>{item.title}</strong><span>Periode rujukan: {item.referencePeriod}</span></span>
      <span className={styles.availability}>
        {item.availability === "AVAILABLE" ? <><strong>{formatRaw(item.value, item.unit)}</strong><span>Nilai tersedia dari sumber</span></> : item.availability === "NOT_COVERED" ? <><strong>Tidak tercakup oleh sumber ini</strong><span>{item.missingReason}</span></> : <><strong>Hanya observasi lokasi</strong><span>{item.observations.length} observasi · bukan nilai wilayah</span></>}
      </span>
      <span className={styles.toggle} aria-hidden="true">+</span>
    </summary>
    <div className={styles.itemBody}>
      <p>{item.definition}</p>
      {item.availability === "SITE_OBSERVATIONS_ONLY" && <div className={styles.siteNotice}><p>{item.missingReason}</p><p>Setiap nilai berlaku untuk lokasi dan waktu observasi yang tercantum, bukan rata-rata kabupaten/kota.</p></div>}
      <p className={styles.coverage}>Cakupan sumber: {item.coverage.coveredRegions} dari {item.coverage.totalRegions} kabupaten/kota CIVX.</p>
      <p className={styles.period}>{item.disclosure.temporalWarning}</p>
      {item.observations.length > 0 && <ul className={styles.observations} aria-label={item.availability === "SITE_OBSERVATIONS_ONLY" ? "Observasi per lokasi dan waktu" : "Observasi sumber"}>{item.observations.map(observation => <Observation key={observation.observationId} observation={observation} />)}</ul>}
      <details className={styles.metadataDisclosure}>
        <summary>Definisi, sumber, dan keterbatasan</summary>
        <dl className={styles.metadata}>
          <div><dt>Pembilang</dt><dd>{item.numerator ?? "Tidak berlaku atau tidak dicantumkan sumber."}</dd></div>
          <div><dt>Penyebut</dt><dd>{item.denominator ?? "Tidak berlaku atau tidak dicantumkan sumber."}</dd></div>
          <div><dt>Satuan</dt><dd>{item.unit}</dd></div>
          <div><dt>Tingkat geografi</dt><dd>{item.geographicLevel}</dd></div>
          <div><dt>Penggunaan dan lisensi</dt><dd>{item.disclosure.usageNotes}</dd></div>
          <div><dt>Batas perbandingan</dt><dd>{item.disclosure.comparisonReason}</dd></div>
        </dl>
        {item.sources.map(source => <SourceEvidence key={source.sourceId} source={source} label="Sumber data konteks" />)}
        <ul className={styles.notes}>{item.disclosure.limitations.map((note, index) => <li key={index}>{note}</li>)}</ul>
      </details>
      <details className={styles.metadataDisclosure}>
        <summary>Jejak data konteks</summary>
        <dl className={styles.metadata}>
          <div><dt>ID dataset</dt><dd><code>{item.datasetId}</code></dd></div>
          <div><dt>Artefak data</dt><dd><code>{item.disclosure.artifactPath}</code></dd></div>
          <div><dt>Audit sumber mentah</dt><dd><code>{item.disclosure.rawAuditPath}</code></dd></div>
          <div><dt>Jejak kandidat</dt><dd><code>{item.disclosure.candidatePointer}</code></dd></div>
        </dl>
      </details>
    </div>
  </details>;
}

export function ContextSection({ sections, idPrefix = "context", headingLevel = 2 }: {
  sections: readonly CivxContextProductSection2023[];
  idPrefix?: string;
  headingLevel?: 2 | 3 | 4;
}) {
  const Heading = headingLevel === 2 ? "h2" : headingLevel === 3 ? "h3" : "h4";
  const SectionHeading = headingLevel === 2 ? "h3" : headingLevel === 3 ? "h4" : "h5";
  return <section className={styles.context} id={`${idPrefix}-context`} aria-labelledby={`${idPrefix}-context-title`}>
    <div className={styles.heading}>
      <Heading id={`${idPrefix}-context-title`} className="product-section-title">Data Konteks</Heading>
      <p>Terpisah dari indikator inti dan tidak memengaruhi skor CIVX. Data konteks tidak digunakan untuk perbandingan skor, selisih, atau peringkat.</p>
      <p className={styles.period}>Nilai 0 yang tersedia bukan data hilang. Cakupan dan periode setiap sumber berbeda.</p>
    </div>
    <div className={styles.sections}>{sections.map(section => <section key={section.sectionId} aria-labelledby={`${idPrefix}-${section.sectionId}`} className={styles.section}>
      <SectionHeading id={`${idPrefix}-${section.sectionId}`}>{section.title}</SectionHeading>
      {section.items.map(item => <ContextItem key={item.datasetId} item={item} />)}
    </section>)}</div>
  </section>;
}
