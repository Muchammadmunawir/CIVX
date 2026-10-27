import { dimensions } from "@/lib/civx/current";
import styles from "./landing.module.css";

export function IndicatorSystem() {
  return (
    <div className={styles.indicatorGrid} aria-label="CIVX indicator system">
      {dimensions.flatMap(dimension => dimension.indicators).map((indicator, index) => (
        <article className={styles.indicator} key={indicator.id}>
          <span className={styles.indicatorNumber}>{String(index + 1).padStart(2, "0")}</span>
          <div>
            <h3>{indicator.label}</h3>
            <p>{indicator.unit} · {indicator.direction === "lower" ? "Lower raw values add more pressure" : "Higher raw values add more pressure"}</p>
          </div>
          <span className={styles.indicatorWeight}>{((dimensions.find(dimension => dimension.indicators.some(value => value.id === indicator.id))?.weight ?? 0) * indicator.withinDimensionWeight * 100).toFixed(2)}%</span>
        </article>
      ))}
    </div>
  );
}
