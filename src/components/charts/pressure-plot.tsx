import type { PressureSeries2023 } from "@/lib/civx/visualization-2023";
import styles from "./pressure-plot.module.css";

export interface PressurePlotPoint2023 {
  readonly id: string;
  readonly score: number;
  readonly slot: PressureSeries2023 | "cohort";
  readonly lane?: number;
  readonly selected?: boolean;
  readonly highlighted?: boolean;
}

export function PressureSeriesMark({ slot }: { slot: PressureSeries2023 | "median" | "cohort" }) {
  return <span className={styles.symbol} data-series={slot} aria-hidden="true" />;
}

export function PressureScale({ signed = false }: { signed?: boolean }) {
  return <div className={styles.scale} aria-hidden="true">{(signed ? ["−100", "−50", "0", "+50", "+100"] : ["0", "25", "50", "75", "100"]).map(tick => <span key={tick}>{tick}</span>)}</div>;
}

/** Marks have fixed pixel sizes; only horizontal position encodes the original score. */
export function PressurePlot({ points, connector, median }: {
  points: readonly PressurePlotPoint2023[];
  connector?: { readonly start: number; readonly length: number };
  median?: number;
}) {
  const lastLane = points.reduce((last, point) => Math.max(last, point.lane ?? 0), 0);
  return <div className={styles.plot} aria-hidden="true">
    <svg viewBox="0 0 100 64" preserveAspectRatio="none" focusable="false"><line x1="0" x2="100" y1="32" y2="32" className={styles.baseline} vectorEffect="non-scaling-stroke" />{[0,25,50,75,100].map(value => <line key={value} x1={value} x2={value} y1="4" y2="60" className={styles.gridline} vectorEffect="non-scaling-stroke" />)}</svg>
    {connector && <span className={styles.connector} style={{ left: `${connector.start}%`, width: `${connector.length}%` }} />}
    {median !== undefined && <span className={styles.median} data-median={median} style={{ left: `${median}%` }} />}
    {/* Keep role-bound points mounted during pair changes; cohort points retain BPS identity. */}
    {points.map(point => <span key={point.slot === "cohort" ? point.id : point.slot} className={styles.point} data-region-id={point.id} data-score={point.score} data-series={point.slot} data-selected={point.selected || undefined} data-highlighted={point.highlighted || undefined} data-overlap={points.length === 2 && points[0].score === points[1].score && points[0].lane === points[1].lane || undefined} style={{ left: `${point.score}%`, top: `${point.lane === undefined || lastLane === 0 ? 32 : 10 + 44 * point.lane / lastLane}px` }} />)}
  </div>;
}

