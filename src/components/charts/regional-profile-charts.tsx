"use client";

import { useId, useState } from "react";
import { formatScore } from "@/components/product/format";
import type { CohortPressureData2023, SimilarPressureData2023 } from "@/lib/civx/visualization-2023";
import { PressurePlot, PressureScale, PressureSeriesMark } from "./pressure-plot";
import styles from "./regional-profile-charts.module.css";

export function SimilarPressureChart({ data }: { data: SimilarPressureData2023 }) {
  const prefix = useId();
  const [highlightedId, setHighlightedId] = useState(data.series[0].region.id);
  const activeIndex = Math.max(0, data.series.findIndex(series => series.region.id === highlightedId));
  const active = data.series[activeIndex];

  return <div className={styles.chart}>
    <p className={styles.description} id={`${prefix}-scale`}>Skala horizontal tekanan relatif 0–100. Posisi vertikal hanya memisahkan wilayah, bukan besaran lain.</p>
    <div className={styles.legendControls} role="group" aria-label="Sorot profil wilayah">
      {data.series.map((series, index) => <button
        key={series.region.id}
        type="button"
        className={styles.legendButton}
        aria-label={series.region.name}
        aria-pressed={index === activeIndex}
        aria-controls={`${prefix}-values`}
        onClick={() => setHighlightedId(series.region.id)}
      >
        <PressureSeriesMark slot={series.slot} />
        <span>{series.region.name}<small>{index === 0 ? "Wilayah terpilih" : "Profil pembanding"}</small></span>
        <span className={styles.highlightLabel} aria-hidden="true">Disorot</span>
      </button>)}
    </div>
    <p className={styles.activeHeading} aria-live="polite" aria-atomic="true">Nilai disorot: <strong>{active.region.name}</strong></p>
    <div className={styles.similarRows} id={`${prefix}-values`} aria-describedby={`${prefix}-scale`}>
      <div className={styles.axis}><PressureScale /></div>
      {data.dimensions.map(dimension => <div className={styles.similarRow} key={dimension.id} data-dimension-id={dimension.id}>
        <span className={styles.dimensionLabel}>{dimension.label}</span>
        <div className={styles.rowPlot}><PressurePlot points={data.series.map((series, index) => ({
          id: series.region.id,
          score: dimension.scores[index],
          slot: series.slot,
          lane: index,
          selected: index === 0,
          highlighted: index === activeIndex && index !== 0,
        }))} /></div>
        <data className={styles.activeValue} value={dimension.scores[activeIndex]} aria-label={`${active.region.name}, ${dimension.label}: ${formatScore(dimension.scores[activeIndex])} dari 100`}>
          <PressureSeriesMark slot={active.slot} />{formatScore(dimension.scores[activeIndex])}
        </data>
      </div>)}
    </div>
    <details className={styles.equivalent}>
      <summary>Lihat nilai seluruh profil</summary>
      <table className={styles.valueTable}>
        <caption>Tekanan relatif per dimensi dan wilayah, skala 0–100, tahun acuan 2023.</caption>
        <thead><tr><th scope="col">Dimensi</th><th scope="col">Wilayah</th><th scope="col">Tekanan</th></tr></thead>
        <tbody>{data.dimensions.flatMap(dimension => data.series.map((series, index) => <tr key={`${dimension.id}-${series.region.id}`} data-dimension-id={dimension.id} data-region-id={series.region.id}>
          <th scope="row">{dimension.label}</th><td>{series.region.name}{index === 0 && <span className={styles.tableNote}>Wilayah terpilih</span>}</td>
          <td><data value={dimension.scores[index]}>{formatScore(dimension.scores[index])}</data></td>
        </tr>))}</tbody>
      </table>
    </details>
  </div>;
}

export function CohortPressureChart({ data }: { data: CohortPressureData2023 }) {
  const prefix = useId();

  return <section className={`product-card ${styles.chart}`} aria-labelledby={`${prefix}-title`}>
    <h2 className="product-section-title" id={`${prefix}-title`}>Posisi Wilayah dalam Sebaran Data</h2>
    <p className={styles.description} id={`${prefix}-description`}>Setiap baris memuat 27 kabupaten/kota Jawa Barat pada kohort tetap 2023. Skala horizontal 0–100 menunjukkan tekanan relatif, bukan peringkat, klasifikasi, atau perubahan antarwaktu. Posisi vertikal hanya memisahkan titik.</p>
    <ul className={styles.legend} aria-label="Keterangan sebaran">
      <li><PressureSeriesMark slot="a" /><span>{data.selected.name} · wilayah terpilih</span></li>
      <li><PressureSeriesMark slot="cohort" /><span>Wilayah lain dalam kohort</span></li>
      <li><PressureSeriesMark slot="median" /><span>Median kohort · nilai tengah</span></li>
    </ul>
    <div className={styles.cohortRows} aria-describedby={`${prefix}-description`}>
      <div className={styles.axis}><PressureScale /></div>
      {data.dimensions.map(dimension => <div
        className={styles.cohortRow}
        key={dimension.id}
        data-dimension-id={dimension.id}
        role="group"
        tabIndex={0}
        aria-labelledby={`${prefix}-${dimension.id}-label`}
        aria-describedby={`${prefix}-${dimension.id}-values`}
      >
        <span className={styles.dimensionLabel} id={`${prefix}-${dimension.id}-label`}>{dimension.label}</span>
        <div className={styles.rowPlot}><PressurePlot median={dimension.median} points={[
          ...dimension.points.filter(point => point.region.id !== data.selected.id).map(point => ({ id: point.region.id, score: point.score, lane: point.lane, slot: "cohort" as const })),
          ...dimension.points.filter(point => point.region.id === data.selected.id).map(point => ({ id: point.region.id, score: point.score, lane: point.lane, slot: "a" as const, selected: true })),
        ]} /></div>
        <p className={styles.cohortValues} id={`${prefix}-${dimension.id}-values`}>
          <span><strong>{data.selected.name}</strong> <data value={dimension.selectedScore}>{formatScore(dimension.selectedScore)}</data></span>
          <span>Median kohort <data value={dimension.median}>{formatScore(dimension.median)}</data></span>
          <span className={styles.position}>{dimension.selectedScore > dimension.median ? "Di atas median kohort" : dimension.selectedScore < dimension.median ? "Di bawah median kohort" : "Sama dengan median kohort"}.</span>
        </p>
      </div>)}
    </div>
    <p className={styles.description}>Median merangkum nilai tengah kohort, bukan penyebab, keunggulan wilayah, atau prioritas kebijakan. Angka dibulatkan hanya untuk tampilan; posisi dan median memakai nilai penuh.</p>
    <details className={styles.equivalent}>
      <summary>Lihat nilai seluruh wilayah dalam sebaran</summary>
      <table className={styles.valueTable}>
        <caption>Nilai seluruh 27 kabupaten/kota untuk enam dimensi tekanan relatif, skala 0–100, tahun acuan 2023. Median tiap dimensi tercantum pada ringkasan di atas.</caption>
        <thead><tr><th scope="col">Dimensi</th><th scope="col">Wilayah</th><th scope="col">Tekanan</th></tr></thead>
        <tbody>{data.dimensions.flatMap(dimension => dimension.points.map(point => <tr key={`${dimension.id}-${point.region.id}`} data-dimension-id={dimension.id} data-region-id={point.region.id} data-selected={point.region.id === data.selected.id || undefined}>
          <th scope="row">{dimension.label}</th><td>{point.region.name}{point.region.id === data.selected.id && <span className={styles.tableNote}>Wilayah terpilih</span>}</td>
          <td><data value={point.score}>{formatScore(point.score)}</data></td>
        </tr>))}</tbody>
      </table>
    </details>
  </section>;
}
