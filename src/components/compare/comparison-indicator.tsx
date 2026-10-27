import Link from "next/link";
import type { CivicIndexComponent } from "@/lib/civx/types";
import { decimal, displayedDifference, signed } from "./comparison-format";
import styles from "./comparison.module.css";

function IndicatorSide({ component, name, side }: {
  component: CivicIndexComponent;
  name: string;
  side: "A" | "B";
}) {
  const maximum = component.weight * 100;
  return (
    <div className={styles.indicatorSide} data-side={side}>
      <p className={styles.sideName}>
        <span className={styles.sideMarker} aria-label={`Region ${side}`}>{side}</span>
        <span>{name}</span>
      </p>
      <dl className={styles.indicatorMetrics}>
        <div><dt>Raw value</dt><dd>{decimal.format(component.value)} <span>{component.unit}</span></dd></div>
        <div><dt>Normalized pressure</dt><dd>{decimal.format(component.score)} <span>/ 100</span></dd></div>
        <div><dt>Weighted contribution</dt><dd>{decimal.format(component.contribution)} <span>/ {decimal.format(maximum)} points</span></dd></div>
      </dl>
      <div className={styles.track} aria-hidden="true">
        <span style={{ width: `${component.contribution / maximum * 100}%` }} />
      </div>
      <p className={styles.scale} aria-hidden="true"><span>0</span><span>{decimal.format(maximum)} contribution points</span></p>
    </div>
  );
}

export function ComparisonIndicator({ a, b, aName, bName }: {
  a: CivicIndexComponent;
  b: CivicIndexComponent;
  aName: string;
  bName: string;
}) {
  const source = a.sources[0];
  return (
    <article className={styles.indicator} aria-labelledby={`compare-${a.indicatorId}`}>
      <header className={styles.indicatorHeading}>
        <div>
          <h3 id={`compare-${a.indicatorId}`}>{a.label}</h3>
          <p>{a.direction === "higher" ? "Higher" : "Lower"} raw values map to more modeled pressure. Weight: {decimal.format(a.weight * 100)}%.</p>
        </div>
        <Link className="civx-text-link" href={`/sources#source-${a.indicatorId}`}>Source record ↗</Link>
      </header>
      <p className={styles.period}>BPS source for A and B: {source.referencePeriod} · Table {source.table} · Page {source.page}</p>
      <div className={styles.indicatorPair}>
        <IndicatorSide component={a} name={aName} side="A" />
        <IndicatorSide component={b} name={bName} side="B" />
      </div>
      <div className={styles.indicatorDifference}>
        <p>Difference <span>A − B</span></p>
        <dl>
          <div><dt>Raw value</dt><dd>{signed(displayedDifference(a.value, b.value))} {a.unit === "%" ? "percentage points" : a.unit}</dd></div>
          <div><dt>Normalized pressure</dt><dd>{signed(displayedDifference(a.score, b.score))} points</dd></div>
          <div><dt>Weighted contribution</dt><dd>{signed(displayedDifference(a.contribution, b.contribution))} points</dd></div>
        </dl>
      </div>
    </article>
  );
}
