import type { PressureDimension } from "@/lib/civx/v2/types";
import { decimal, displayedDifference, signed } from "./comparison-format";
import styles from "./comparison.module.css";

function DimensionSide({ dimension, name, side }: {
  dimension: PressureDimension;
  name: string;
  side: "A" | "B";
}) {
  const maximum = dimension.weight * 100;
  return (
    <div className={styles.indicatorSide} data-side={side}>
      <p className={styles.sideName}>
        <span className={styles.sideMarker} aria-label={`Region ${side}`}>{side}</span>
        <span>{name}</span>
      </p>
      <dl className={styles.indicatorMetrics}>
        <div><dt>Dimension score</dt><dd>{decimal.format(dimension.score)} <span>/ 100</span></dd></div>
        <div><dt>Weighted contribution</dt><dd>{decimal.format(dimension.contribution)} <span>/ {decimal.format(maximum)} points</span></dd></div>
      </dl>
      <div className={styles.track} aria-hidden="true"><span style={{ width: `${dimension.contribution / maximum * 100}%` }} /></div>
      <p className={styles.scale} aria-hidden="true"><span>0</span><span>{decimal.format(maximum)} contribution points</span></p>
    </div>
  );
}

export function ComparisonDimension({ a, b, aName, bName }: {
  a: PressureDimension;
  b: PressureDimension;
  aName: string;
  bName: string;
}) {
  return (
    <article className={styles.indicator} aria-labelledby={`dimension-${a.id}`}>
      <header className={styles.indicatorHeading}>
        <div>
          <h3 id={`dimension-${a.id}`}>{a.label}</h3>
          <p>Dimension weight: {decimal.format(a.weight * 100)}% of CIVX.</p>
        </div>
      </header>
      <div className={styles.indicatorPair}>
        <DimensionSide dimension={a} name={aName} side="A" />
        <DimensionSide dimension={b} name={bName} side="B" />
      </div>
      <div className={styles.indicatorDifference}>
        <p>Difference <span>A − B</span></p>
        <dl>
          <div><dt>Dimension score</dt><dd>{signed(displayedDifference(a.score, b.score))} points</dd></div>
          <div><dt>Weighted contribution</dt><dd>{signed(displayedDifference(a.contribution, b.contribution))} points</dd></div>
        </dl>
      </div>
    </article>
  );
}
