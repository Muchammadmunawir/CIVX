"use client";

import { useId, useState } from "react";
import { formatDifference, formatScore } from "@/components/product/format";
import type { PressureComparisonData2023, PressureComparisonRow2023 } from "@/lib/civx/visualization-2023";
import { PressurePlot, PressureScale, PressureSeriesMark } from "./pressure-plot";
import styles from "./comparison-charts.module.css";

type ComparisonView = "points" | "bars";

function differenceExplanation(row: PressureComparisonRow2023): string {
  if (row.relation === "EQUAL") return "Tekanan relatif kedua wilayah sama.";
  return `Tekanan relatif ${row.relation === "A_HIGHER" ? "A" : "B"} lebih tinggi.`;
}

function ComparisonLegend({ data }: { data: PressureComparisonData2023 }) {
  return <p className={styles.legend}>
    <span><PressureSeriesMark slot="a" /><strong>A</strong> {data.regionA.name}</span>
    <span><PressureSeriesMark slot="b" /><strong>B</strong> {data.regionB.name}</span>
  </p>;
}

function ScorePair({ row }: { row: PressureComparisonRow2023 }) {
  return <p className={styles.pair}>
    <span>A: <data value={row.scoreA}>{formatScore(row.scoreA)}</data></span>
    <span>B: <data value={row.scoreB}>{formatScore(row.scoreB)}</data></span>
  </p>;
}

/** Both views use the same projected rows and fixed 0–100 geometry. */
export function ComparisonDimensionPlot({ data, view }: { data: PressureComparisonData2023; view: ComparisonView }) {
  const id = useId();
  return <div data-comparison-view={view}>
    <div className={view === "bars" ? styles.barScale : undefined}><PressureScale /></div>
    <ol className={styles.rows}>
      {data.dimensions.map(row => <li className={styles.row} key={row.id} data-dimension-id={row.id} data-relation={row.relation}>
        <div className={styles.rowContent} role="group" tabIndex={0} aria-labelledby={`${id}-${row.id}-title`} aria-describedby={`${id}-${row.id}-values ${id}-${row.id}-difference`}>
          <div className={styles.rowHeading}>
            <h3 id={`${id}-${row.id}-title`}>{row.label}</h3>
            <div id={`${id}-${row.id}-values`}><ScorePair row={row} /></div>
          </div>
          {view === "points" ? <div>
            <PressurePlot points={[
              { id: data.regionA.id, score: row.scoreA, slot: "a" },
              { id: data.regionB.id, score: row.scoreB, slot: "b" },
            ]} connector={{ start: Math.min(row.scoreA, row.scoreB), length: row.absoluteDifference }} />
          </div> : <div className={styles.bars} aria-hidden="true">
            <div className={styles.barRow}><span>A</span><div className={styles.track} data-side="A"><span style={{ width: `${row.scoreA}%` }} /></div></div>
            <div className={styles.barRow}><span>B</span><div className={styles.track} data-side="B"><span style={{ width: `${row.scoreB}%` }} /></div></div>
          </div>}
          <p className={styles.readout} id={`${id}-${row.id}-difference`}>Selisih A − B: <data value={row.delta}>{formatDifference(row.delta)}</data> poin. {differenceExplanation(row)}</p>
        </div>
      </li>)}
    </ol>
    <div className={view === "bars" ? styles.barScale : undefined}><PressureScale /></div>
  </div>;
}

export function ComparisonPressureChart({ data }: { data: PressureComparisonData2023 }) {
  const id = useId();
  const [view, setView] = useState<ComparisonView>("points");
  return <section className={`product-card ${styles.section}`} aria-labelledby={`${id}-title`} aria-describedby={`${id}-scale`}>
    <h2 className="product-section-title" id={`${id}-title`}>Perbandingan Tekanan per Dimensi</h2>
    <p className={styles.description} id={`${id}-scale`}>Enam dimensi pada skala tetap 0–100. Semakin tinggi skor, semakin tinggi tekanan relatif dalam model CORE 2023.</p>
    <div className={styles.switcher} role="group" aria-label="Tampilan perbandingan tekanan">
      <button type="button" aria-pressed={view === "points"} aria-controls={`${id}-plot`} onClick={() => setView("points")}>Titik Perbandingan</button>
      <button type="button" aria-pressed={view === "bars"} aria-controls={`${id}-plot`} onClick={() => setView("bars")}>Batang Perbandingan</button>
    </div>
    <ComparisonLegend data={data} />
    <div key={view} id={`${id}-plot`} className={styles.viewEntry}><ComparisonDimensionPlot data={data} view={view} /></div>
    <p className={styles.note}>Angka ditampilkan dengan pembulatan; posisi dan selisih memakai nilai model berpresisi penuh. Nilai yang tampak sama setelah pembulatan belum tentu sama persis.</p>
  </section>;
}

function SignedDifferencePlot({ row }: { row: PressureComparisonRow2023 }) {
  const endpoint = 50 + row.delta / 2;
  return <div className={styles.signedPlot} aria-hidden="true" data-delta={row.delta}>
    <svg viewBox="0 0 100 64" preserveAspectRatio="none" focusable="false">
      {[0, 25, 50, 75, 100].map(value => <line key={value} x1={value} x2={value} y1="4" y2="60" className={value === 50 ? styles.zeroAxis : styles.gridline} vectorEffect="non-scaling-stroke" />)}
      <line x1="0" x2="100" y1="32" y2="32" className={styles.baseline} vectorEffect="non-scaling-stroke" />
    </svg>
    <span className={styles.deltaBar} data-relation={row.relation} style={{ left: `${Math.min(50, endpoint)}%`, width: `${Math.abs(row.delta) / 2}%` }} />
    <span className={styles.deltaEndpoint} style={{ left: `${endpoint}%` }}>
      {row.relation === "EQUAL" ? <span className={styles.equalMark} /> : <PressureSeriesMark slot={row.relation === "A_HIGHER" ? "a" : "b"} />}
    </span>
  </div>;
}

function IndicatorDifferences({ data }: { data: PressureComparisonData2023 }) {
  return <details className={styles.details}>
    <summary>Lihat Perbedaan per Indikator</summary>
    <p className={styles.description}>Seluruh 18 indikator memakai tekanan ternormalisasi 0–100, bukan selisih nilai atau satuan mentah. Selisih bertanda memakai A dikurangi B.</p>
    <div className={styles.tableWrap} role="region" aria-label="Rincian perbedaan 18 indikator" tabIndex={0}>
      <table className={styles.table}>
        <caption>Tekanan ternormalisasi indikator CORE 2023: A ({data.regionA.name}) dan B ({data.regionB.name})</caption>
        <thead><tr>
          <th scope="col">Indikator</th><th scope="col">Dimensi</th>
          <th scope="col">A · {data.regionA.name}</th><th scope="col">B · {data.regionB.name}</th>
          <th scope="col">Selisih A − B (poin)</th><th scope="col">Pembacaan</th>
        </tr></thead>
        <tbody>{data.indicators.map(row => <tr key={row.id} data-indicator-id={row.id} data-relation={row.relation}>
          <th scope="row">{row.label}</th><td>{row.dimensionLabel}</td>
          <td><data value={row.scoreA}>{formatScore(row.scoreA)}</data></td>
          <td><data value={row.scoreB}>{formatScore(row.scoreB)}</data></td>
          <td><data value={row.delta}>{formatDifference(row.delta)}</data></td>
          <td>{differenceExplanation(row)}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </details>;
}

export function PressureDifferenceChart({ data }: { data: PressureComparisonData2023 }) {
  const id = useId();
  return <section className={`product-card ${styles.section}`} aria-labelledby={`${id}-title`} aria-describedby={`${id}-scale`}>
    <h2 className="product-section-title" id={`${id}-title`}>Analisis Perbedaan Tekanan</h2>
    <p className={styles.description} id={`${id}-scale`}>Selisih A dikurangi B pada sumbu tetap −100 hingga +100 poin. Positif berarti tekanan A lebih tinggi; negatif berarti tekanan B lebih tinggi; nol berarti sama.</p>
    <ComparisonLegend data={data} />
    <div className={styles.directionLabels} aria-hidden="true"><span>← B lebih tinggi</span><span>A lebih tinggi →</span></div>
    <PressureScale signed />
    <ol className={styles.rows}>
      {data.dimensions.map(row => <li className={styles.row} key={row.id} data-dimension-id={row.id} data-relation={row.relation}>
        <div className={styles.rowContent} role="group" tabIndex={0} aria-labelledby={`${id}-${row.id}-title`} aria-describedby={`${id}-${row.id}-values ${id}-${row.id}-reading`}>
          <div className={styles.rowHeading}>
            <h3 id={`${id}-${row.id}-title`}>{row.label}</h3>
            <p className={styles.deltaValue} id={`${id}-${row.id}-values`}><data value={row.delta}>{formatDifference(row.delta)}</data> <span>poin</span></p>
          </div>
          <SignedDifferencePlot row={row} />
          <p className={styles.readout} id={`${id}-${row.id}-reading`}>{differenceExplanation(row)}</p>
        </div>
      </li>)}
    </ol>
    <PressureScale signed />
    <p className={styles.note}>Perbedaan ini hanya menggambarkan tekanan relatif dalam model tetap 2023, bukan penyebab, prioritas, keunggulan wilayah, atau signifikansi statistik. Pembulatan tampilan tidak menentukan kesamaan nilai.</p>
    <IndicatorDifferences data={data} />
  </section>;
}
