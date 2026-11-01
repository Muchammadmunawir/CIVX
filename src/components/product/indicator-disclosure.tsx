import type { CivxIndicatorProduct2023, CivxProductSource2023, CivxProductUncertainty2023 } from "@/lib/civx/product-view-types-2023";
import { formatRaw, formatScore } from "./format";
import { SourceLink } from "./product-ui";
import styles from "./indicator-disclosure.module.css";

export function SourceEvidence({ source, label = "Sumber utama" }: { source: CivxProductSource2023; label?: string }) {
  return <div className={styles.source}>
    <p><strong>{label}</strong><br /><SourceLink source={source} /></p>
    <dl className={styles.metadata}>
      <div><dt>Penerbit</dt><dd>{source.publisher}</dd></div>
      <div><dt>Lokasi dalam sumber</dt><dd>{source.locator ?? "Tidak dicantumkan dalam metadata sumber."}</dd></div>
      <div><dt>Tanggal publikasi</dt><dd>{source.publicationDate ?? "Tidak dicantumkan dalam metadata sumber."}</dd></div>
      <div><dt>Diakses</dt><dd>{source.accessedAt ?? "Tidak dicantumkan dalam metadata sumber."}</dd></div>
    </dl>
  </div>;
}

function Uncertainty({ uncertainty, unit }: { uncertainty: CivxProductUncertainty2023; unit: string }) {
  const absent = "Tidak dicantumkan sumber.";
  return <div>
    <p>{uncertainty.note ?? "Catatan ketidakpastian tidak dicantumkan sumber."}</p>
    <dl className={styles.metadata}>
      <div><dt>Denominator tertimbang</dt><dd>{uncertainty.weightedDenominator === null ? absent : formatRaw(uncertainty.weightedDenominator, "").trim()}<small>Denominator tertimbang bukan ukuran sampel tanpa pembobotan.</small></dd></div>
      <div><dt>Ukuran sampel tanpa pembobotan</dt><dd>{uncertainty.unweightedSampleSize === null ? absent : formatRaw(uncertainty.unweightedSampleSize, "").trim()}</dd></div>
      <div><dt>Interval kepercayaan</dt><dd>{uncertainty.confidenceInterval === null ? absent : <>{formatRaw(uncertainty.confidenceInterval.confidenceLevel * 100, "%")}: {formatRaw(uncertainty.confidenceInterval.lower, unit)} – {formatRaw(uncertainty.confidenceInterval.upper, unit)}</>}</dd></div>
      <div><dt>Standard error</dt><dd>{uncertainty.standardErrorPercentagePoints === null ? absent : formatRaw(uncertainty.standardErrorPercentagePoints, "poin persentase")}</dd></div>
      <div><dt>Relative standard error (RSE)</dt><dd>{uncertainty.relativeStandardErrorPercent === null ? absent : formatRaw(uncertainty.relativeStandardErrorPercent, "%")}</dd></div>
      <div><dt>Penanda sumber: RSE di atas 25%</dt><dd>{uncertainty.rseGreaterThan25Percent === null ? absent : uncertainty.rseGreaterThan25Percent ? "Ya" : "Tidak"}</dd></div>
      <div><dt>Lokasi bukti ketidakpastian</dt><dd>{uncertainty.sourceLocator ?? absent}</dd></div>
    </dl>
  </div>;
}

export function IndicatorDisclosure({ indicator }: { indicator: CivxIndicatorProduct2023 }) {
  const { disclosure } = indicator;
  return <details className={styles.indicator}>
    <summary>
      <span className={styles.identity}><strong>{indicator.displayName}</strong><span>Periode rujukan: {indicator.referencePeriod}</span></span>
      <span className={styles.values}><span>Nilai asli<strong>{formatRaw(indicator.rawValue, indicator.unit)}</strong></span><span>Tekanan ternormalisasi<strong>{formatScore(indicator.normalizedPressure)} / 100</strong></span></span>
      <span className={styles.toggle} aria-hidden="true">+</span>
    </summary>
    <div className={styles.content}>
      <dl className={styles.metadata}>
        <div><dt>Definisi</dt><dd>{disclosure.definition}</dd></div>
        <div><dt>Pembilang</dt><dd>{disclosure.numerator}</dd></div>
        <div><dt>Penyebut</dt><dd>{disclosure.denominator}</dd></div>
        <div><dt>Dimensi</dt><dd>{indicator.dimensionName}</dd></div>
        <div><dt>Arah tekanan</dt><dd>{indicator.pressureDirection === "higher_raw_higher_pressure" ? "Nilai asli lebih tinggi berarti tekanan relatif lebih tinggi." : "Nilai asli lebih tinggi berarti tekanan relatif lebih rendah."}</dd></div>
      </dl>
      <SourceEvidence source={disclosure.source} />
      {disclosure.numeratorSource && <SourceEvidence source={disclosure.numeratorSource} label="Sumber pembilang" />}
      {disclosure.denominatorSource && <SourceEvidence source={disclosure.denominatorSource} label="Sumber penyebut" />}
      <details className={styles.secondary}>
        <summary>Keterbatasan dan ketidakpastian</summary>
        <ul className={styles.notes}>{disclosure.limitations.map((limitation, index) => <li key={index}>{limitation}</li>)}</ul>
        <Uncertainty uncertainty={disclosure.uncertainty} unit={indicator.unit} />
      </details>
    </div>
  </details>;
}
