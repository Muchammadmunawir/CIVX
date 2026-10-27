import type { CivicIndicatorPolicy } from "@/lib/civx/types";
import styles from "./landing.module.css";

export function IndicatorSystem({ indicators }: { indicators: readonly CivicIndicatorPolicy[] }) {
  return (
    <div className={styles.indicatorGrid} aria-label="CIVX indicator system">
      {indicators.map((indicator, index) => (
        <article className={styles.indicator} key={indicator.id}>
          <span className={styles.indicatorNumber}>{String(index + 1).padStart(2, "0")}</span>
          <div>
            <h3>{indicator.label}</h3>
            <p>{indicator.unit} · {indicator.direction === "lower" ? "Lower raw values add more pressure" : "Higher raw values add more pressure"}</p>
          </div>
          <span className={styles.indicatorWeight}>{indicator.weight * 100}%</span>
        </article>
      ))}
    </div>
  );
}
