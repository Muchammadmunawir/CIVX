import Link from "next/link";
import { ObservationEvidence } from "@/components/regions/evidence";
import type { PressureComponent, V2IndicatorPolicy, V2Observation } from "@/lib/civx/v2/types";
import { decimal, displayedDifference, signed } from "./comparison-format";
import styles from "./comparison.module.css";

function IndicatorSide({ component, observation, name, side }: {
  component: PressureComponent;
  observation: V2Observation;
  name: string;
  side: "A" | "B";
}) {
  const maximum = component.effectiveWeight * 100;
  return (
    <div className={styles.indicatorSide} data-side={side}>
      <p className={styles.sideName}>
        <span className={styles.sideMarker} aria-label={`Region ${side}`}>{side}</span>
        <span>{name}</span>
      </p>
      <dl className={styles.indicatorMetrics}>
        <div><dt>Raw value</dt><dd>{observation.value === null ? "Unavailable" : decimal.format(observation.value)} <span>{observation.unit}</span></dd></div>
        <div><dt>Normalized pressure</dt><dd>{decimal.format(component.score)} <span>/ 100</span></dd></div>
        <div><dt>Weighted contribution</dt><dd>{decimal.format(component.contribution)} <span>/ {decimal.format(maximum)} points</span></dd></div>
      </dl>
      <div className={styles.track} aria-hidden="true"><span style={{ width: `${component.contribution / maximum * 100}%` }} /></div>
      <p className={styles.scale} aria-hidden="true"><span>0</span><span>{decimal.format(maximum)} contribution points</span></p>
      <details className={styles.evidence}>
        <summary>Source and raw evidence · {side}</summary>
        <ObservationEvidence observation={observation} />
      </details>
    </div>
  );
}

export function ComparisonIndicator({ indicator, a, b, aObservation, bObservation, aName, bName }: {
  indicator: V2IndicatorPolicy;
  a: PressureComponent;
  b: PressureComponent;
  aObservation: V2Observation;
  bObservation: V2Observation;
  aName: string;
  bName: string;
}) {
  return (
    <article className={styles.indicator} aria-labelledby={`compare-${indicator.id}`}>
      <header className={styles.indicatorHeading}>
        <div>
          <h3 id={`compare-${indicator.id}`}>{indicator.label}</h3>
          <p>{indicator.direction === "higher" ? "Higher" : "Lower"} raw values map to more modeled pressure. Effective weight: {decimal.format(a.effectiveWeight * 100)}% of CIVX; {decimal.format(indicator.withinDimensionWeight * 100)}% within its dimension.</p>
        </div>
        <Link className="civx-text-link" href={`/sources#source-${indicator.sourceId}`}>Source record ↗</Link>
      </header>
      <p className={styles.period}>Observation periods · A: {aObservation.period} · B: {bObservation.period}. Expand each side for official sources and raw references.</p>
      <div className={styles.indicatorPair}>
        <IndicatorSide component={a} observation={aObservation} name={aName} side="A" />
        <IndicatorSide component={b} observation={bObservation} name={bName} side="B" />
      </div>
      <div className={styles.indicatorDifference}>
        <p>Difference <span>A − B</span></p>
        <dl>
          <div><dt>Raw value</dt><dd>{aObservation.value !== null && bObservation.value !== null ? signed(displayedDifference(aObservation.value, bObservation.value)) : "Unavailable"} {indicator.unit === "%" ? "percentage points" : indicator.unit}</dd></div>
          <div><dt>Normalized pressure</dt><dd>{signed(displayedDifference(a.score, b.score))} points</dd></div>
          <div><dt>Weighted contribution</dt><dd>{signed(displayedDifference(a.contribution, b.contribution))} points</dd></div>
        </dl>
      </div>
    </article>
  );
}
