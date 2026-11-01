import Link from "next/link";
import { getExploreRegionsProduct2023, getProductMethodology2023, getRegionProductView2023 } from "@/lib/civx/product-2023";
import type { CivxContextProductItem2023, CivxIndicatorProduct2023, CivxProductSource2023, CivxProductUncertainty2023, CivxRegionProductHeader2023 } from "@/lib/civx/product-view-types-2023";
import { Notice, PageHeading, SourceLink } from "@/components/product/product-ui";
import { formatRaw } from "@/components/product/format";
import { SourcesBrowser } from "./sources-browser";
import styles from "./sources-page.module.css";

type CoreEntry = { region: CivxRegionProductHeader2023; indicator: CivxIndicatorProduct2023 };
type ContextEntry = { region: CivxRegionProductHeader2023; item: CivxContextProductItem2023; sectionTitle: string };

function SourceMetadata({ source, label }: { source: CivxProductSource2023; label: string }) {
  return <div className={styles.source}>
    <p className={styles.sourceRole}>{label}</p>
    <p className={styles.publisher}>{source.publisher}</p>
    <SourceLink source={source} />
    <details className={styles.details}>
      <summary>Lokasi dan tanggal sumber</summary>
    <dl className={styles.metadata}>
      <div><dt>URL asli</dt><dd><a href={source.url} target="_blank" rel="noopener noreferrer">{source.url}<span className="civx-sr-only"> (buka tab baru)</span></a></dd></div>
      <div><dt>Lokasi tabel / halaman</dt><dd>{source.locator ?? "Tidak dicantumkan; lihat lokasi observasi bila tersedia."}</dd></div>
      <div><dt>Tanggal terbit</dt><dd>{source.publicationDate ?? "Tidak tersedia"}</dd></div>
      <div><dt>Tanggal akses</dt><dd>{source.accessedAt ?? "Tidak tersedia"}</dd></div>
    </dl>
    </details>
  </div>;
}

function Uncertainty({ uncertainty }: { uncertainty: CivxProductUncertainty2023 }) {
  const number = (value: number | null, unit = "") => value === null ? "Tidak tersedia" : formatRaw(value, unit);
  return <dl className={styles.metadata}>
    <div><dt>Catatan sumber</dt><dd>{uncertainty.note ?? "Tidak tersedia; bukan berarti tanpa ketidakpastian."}</dd></div>
    <div><dt>Lokasi ketidakpastian</dt><dd>{uncertainty.sourceLocator ?? "Tidak tersedia"}</dd></div>
    <div><dt>Penyebut tertimbang</dt><dd>{number(uncertainty.weightedDenominator)}</dd></div>
    <div><dt>Sampel tidak tertimbang</dt><dd>{number(uncertainty.unweightedSampleSize)}</dd></div>
    <div><dt>Interval kepercayaan</dt><dd>{uncertainty.confidenceInterval === null ? "Tidak tersedia" : <>{number(uncertainty.confidenceInterval.lower)}–{number(uncertainty.confidenceInterval.upper)}; tingkat kepercayaan {number(uncertainty.confidenceInterval.confidenceLevel * 100, "%")}</>}</dd></div>
    <div><dt>Standard error</dt><dd>{number(uncertainty.standardErrorPercentagePoints, "poin persentase")}</dd></div>
    <div><dt>Relative standard error (RSE)</dt><dd>{number(uncertainty.relativeStandardErrorPercent, "%")}</dd></div>
    <div><dt>Penanda RSE &gt; 25% dari sumber</dt><dd>{uncertainty.rseGreaterThan25Percent === null ? "Tidak tersedia" : uncertainty.rseGreaterThan25Percent ? "Ya" : "Tidak"}</dd></div>
  </dl>;
}

function CoreSourceCard({ entries }: { entries: readonly CoreEntry[] }) {
  const { indicator } = entries[0];
  const { disclosure } = indicator;
  return <article className={`product-card ${styles.card}`} id={`source-${indicator.indicatorId}`} aria-labelledby={`heading-${indicator.indicatorId}`}>
    <div className={styles.row}>
      <div className={styles.identity}>
        <h3 id={`heading-${indicator.indicatorId}`}>{indicator.displayName}</h3>
        <p>{indicator.dimensionName}</p>
        <span className="product-tag">CORE · masuk skor</span>
      </div>
      <SourceMetadata source={disclosure.source} label="Sumber indikator" />
      <dl className={styles.period}>
        <div><dt>Periode referensi</dt><dd>{indicator.referencePeriod}</dd></div>
        <div><dt>Satuan</dt><dd>{indicator.unit}</dd></div>
        <div><dt>Cakupan wilayah</dt><dd>{entries.length} kabupaten/kota</dd></div>
      </dl>
    </div>
    <details className={styles.details}>
      <summary>Definisi, pembilang, penyebut, dan keterbatasan</summary>
      <dl className={styles.metadata}>
        <div><dt>Definisi</dt><dd>{disclosure.definition}</dd></div>
        <div><dt>Pembilang</dt><dd>{disclosure.numerator}</dd></div>
        <div><dt>Penyebut</dt><dd>{disclosure.denominator}</dd></div>
      </dl>
      <div className={styles.supportingSources}>
        {disclosure.numeratorSource && <SourceMetadata source={disclosure.numeratorSource} label="Sumber pembilang" />}
        {disclosure.denominatorSource && <SourceMetadata source={disclosure.denominatorSource} label="Sumber penyebut" />}
      </div>
      <h4>Keterbatasan sumber</h4>
      <ul className={styles.notes}>{disclosure.limitations.map((note) => <li key={note}>{note}</li>)}</ul>
      <p className="product-caption">Catatan sumber dipertahankan dalam bahasa aslinya. Periode referensi tidak selalu sama dengan tahun publikasi.</p>
      <details className={styles.details}>
        <summary>Ketidakpastian per wilayah ({entries.length} wilayah)</summary>
        <p>Nilai ketidakpastian berlaku untuk masing-masing wilayah. Keterangan yang tidak tersedia bukan nol atau bukti kepastian.</p>
        <div className={styles.regionEvidence}>{entries.map((entry) => <details className={styles.details} key={entry.region.id}>
          <summary>{entry.region.name} · BPS {entry.region.id}</summary>
          <Uncertainty uncertainty={entry.indicator.disclosure.uncertainty} />
          <Link className="civx-text-link" href={`/regions/${entry.region.id}`}>Lihat profil dan nilai mentah wilayah</Link>
        </details>)}</div>
      </details>
    </details>
  </article>;
}

function ContextSourceCard({ entries }: { entries: readonly ContextEntry[] }) {
  const { item } = entries[0];
  const periods = [...new Set(entries.map((entry) => entry.item.referencePeriod))];
  return <article className={`product-card ${styles.card}`} id={`source-${item.datasetId}`} aria-labelledby={`heading-${item.datasetId}`}>
    <div className={styles.row}>
      <div className={styles.identity}>
        <h3 id={`heading-${item.datasetId}`}>{item.title}</h3>
        <p>{item.geographicLevel}</p>
        <span className="product-tag">CONTEXT · tidak masuk skor</span>
      </div>
      <div>{item.sources.map((source) => <SourceMetadata source={source} label="Sumber dataset" key={source.sourceId} />)}</div>
      <dl className={styles.period}>
        <div><dt>Periode aktual</dt><dd>{periods.join("; ")}</dd></div>
        <div><dt>Satuan</dt><dd>{item.unit}</dd></div>
        <div><dt>Cakupan dataset</dt><dd>{item.coverage.coveredRegions} / {item.coverage.totalRegions} wilayah</dd></div>
      </dl>
    </div>
    <p className={styles.warning}>{item.disclosure.temporalWarning}</p>
    <p className="product-caption">Cakupan menyatakan wilayah dengan bukti, bukan jaminan nilai agregat kabupaten/kota. Observasi lokasi tidak dirata-ratakan menjadi nilai wilayah.</p>
    <details className={styles.details}>
      <summary>Definisi, batas penggunaan, dan cakupan wilayah</summary>
      <dl className={styles.metadata}>
        <div><dt>Definisi</dt><dd>{item.definition}</dd></div>
        <div><dt>Pembilang</dt><dd>{item.numerator ?? "Tidak berlaku / tidak dicantumkan"}</dd></div>
        <div><dt>Penyebut</dt><dd>{item.denominator ?? "Tidak berlaku / tidak dicantumkan"}</dd></div>
        <div><dt>Hak dan penggunaan</dt><dd>{item.disclosure.usageNotes}</dd></div>
        <div><dt>Batas perbandingan</dt><dd>{item.disclosure.comparisonReason}</dd></div>
      </dl>
      <ul className={styles.notes}>{item.disclosure.limitations.map((note, index) => <li key={`${index}-${note}`}>{note}</li>)}</ul>
      <h4>Cakupan dan observasi asli</h4>
      <p>Data tidak tercakup bukan nol. Tanggal dan nama lokasi di bawah melekat pada observasi, bukan pada model CORE 2023.</p>
      {entries.map(({ region, item: regionalItem }) => <details className={styles.details} key={region.id}>
        <summary>{region.name} · {regionalItem.availability === "AVAILABLE" ? "Nilai wilayah tersedia" : regionalItem.availability === "SITE_OBSERVATIONS_ONLY" ? "Hanya observasi lokasi" : "Tidak tercakup"}</summary>
        {regionalItem.missingReason !== null && <p>{regionalItem.missingReason}</p>}
        {regionalItem.availability === "AVAILABLE" && <p>Nilai wilayah yang dipublikasikan: {formatRaw(regionalItem.value, regionalItem.unit)}. Bukan skor CIVX.</p>}
        {regionalItem.observations.map((observation) => <div className={styles.observation} key={observation.observationId}>
          <p className={styles.publisher}>{observation.siteName ?? region.name}{observation.siteId !== null ? ` · ${observation.siteId}` : ""}</p>
          <dl className={styles.metadata}>
            <div><dt>Tanggal / periode observasi</dt><dd>{observation.period}</dd></div>
            <div><dt>Nilai observasi</dt><dd>{formatRaw(observation.value, observation.unit)}</dd></div>
            <div><dt>Nilai sumber asli</dt><dd>{observation.sourceValue}</dd></div>
            <div><dt>Tingkat geografis</dt><dd>{observation.geographicLevel}</dd></div>
            <div><dt>Lokasi sumber</dt><dd>{observation.sourceLocator}</dd></div>
          </dl>
          <ul className={styles.notes}>{observation.limitations.map((note, index) => <li key={`${index}-${note}`}>{note}</li>)}</ul>
        </div>)}
      </details>)}
    </details>
  </article>;
}

export function SourcesPage() {
  const methodology = getProductMethodology2023();
  const regions = getExploreRegionsProduct2023();
  const core = new Map<string, CoreEntry[]>();
  const context = new Map<string, ContextEntry[]>();
  for (const { region } of regions) {
    const profile = getRegionProductView2023(region.id);
    if (!profile) throw new Error(`CIVX sources: canonical 2023 profile ${region.id} unavailable`);
    for (const indicator of profile.core.indicators) {
      const entries = core.get(indicator.indicatorId);
      if (entries) entries.push({ region, indicator });
      else core.set(indicator.indicatorId, [{ region, indicator }]);
    }
    for (const section of profile.context) for (const item of section.items) {
      const entries = context.get(item.datasetId);
      if (entries) entries.push({ region, item, sectionTitle: section.title });
      else context.set(item.datasetId, [{ region, item, sectionTitle: section.title }]);
    }
  }

  const dimensions = [...new Set([...core.values()].map(([entry]) => entry.indicator.dimensionName))];
  const sourceCards = [
    ...[...core].map(([id, entries]) => {
      const { indicator } = entries[0];
      const sources = [indicator.disclosure.source, indicator.disclosure.numeratorSource, indicator.disclosure.denominatorSource];
      return {
        id,
        scope: "CORE" as const,
        dimension: indicator.dimensionName,
        searchText: [indicator.displayName, indicator.dimensionName, ...sources.flatMap((source) => source ? [source.publisher, source.title ?? ""] : [])].join(" ").toLocaleLowerCase("id"),
        card: <CoreSourceCard entries={entries} />,
      };
    }),
    ...[...context].map(([id, entries]) => {
      const { item, sectionTitle } = entries[0];
      return {
        id,
        scope: "CONTEXT" as const,
        dimension: null,
        searchText: [item.title, sectionTitle, ...item.sources.flatMap((source) => [source.publisher, source.title ?? ""])].join(" ").toLocaleLowerCase("id"),
        card: <ContextSourceCard entries={entries} />,
      };
    }),
  ];

  return <main className={`civx-container product-page ${styles.page}`}>
    <PageHeading breadcrumb="Sumber Data" title="Sumber yang bisa ditelusuri" description="Telusuri sumber, periode, cakupan, dan keterbatasan data CIVX 2023." />
    <Notice>Pencantuman sumber bukan sertifikasi mutu atau izin redistribusi. Penggunaan ulang dan rilis publik tetap memerlukan peninjauan hak serta ketentuan setiap penerbit.</Notice>
    <dl className={styles.summary}>
      <div className="product-card"><dt>Indikator CORE</dt><dd>{core.size}</dd><dd className={styles.summaryNote}>Indikator yang masuk skor {methodology.referenceYear}. Satu penerbit dapat menjadi sumber beberapa indikator.</dd></div>
      <div className="product-card"><dt>Dataset CONTEXT</dt><dd>{context.size}</dd><dd className={styles.summaryNote}>Memberi konteks tambahan. Tidak memengaruhi skor.</dd></div>
      <div className="product-card"><dt>Cakupan CORE</dt><dd>{methodology.cohortSize} wilayah</dd><dd className={styles.summaryNote}>Kabupaten/kota {methodology.province}; cakupan CONTEXT berbeda per dataset.</dd></div>
    </dl>
    <SourcesBrowser sources={sourceCards} dimensions={dimensions} referenceYear={methodology.referenceYear} />
    <section className={`product-section product-card ${styles.governance}`} aria-labelledby="penggunaan-sumber">
      <h2 id="penggunaan-sumber" className="product-section-title">Penggunaan sumber</h2>
      <p>Daftar ini memuat penerbit, tautan asli, lokasi bukti, periode, dan catatan sumber. Tanggal atau ketidakpastian yang belum tersedia tidak diisi dengan nilai buatan.</p>
      <p>Hak penggunaan dan redistribusi belum dinyatakan tuntas. Tautan yang dapat dibuka tidak membuktikan izin penggunaan ulang. Ikuti catatan penggunaan setiap sumber.</p>
      <p>CORE mengacu pada {methodology.referenceYear}. Periode CONTEXT mengikuti masing-masing sumber, bukan seri perubahan skor dari tahun ke tahun.</p>
      <Link className="civx-button civx-button-primary" href="/methodology">Baca metodologi</Link>
    </section>
  </main>;
}
