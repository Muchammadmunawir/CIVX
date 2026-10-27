import Link from "next/link";
import { release, regionalData } from "@/lib/civx/data";
import styles from "./methodology-page.module.css";

export function MethodologyPage() {
  const { methodology } = release;

  return (
    <main className={`civx-container ${styles.page}`}>
      <header className={styles.intro}>
        <div className={styles.introCopy}>
          <span className="civx-eyebrow">Methodology / {release.period}</span>
          <h1>How the index is made<span className={styles.accent}>.</span></h1>
          <p className={styles.lead}>Four BPS observations become one 0–100 relative pressure score. See the path from published tables to the Civic Index.</p>
          <p className={styles.release}>Release {release.releaseId} <span aria-hidden="true">·</span> Method {methodology.methodologyVersion}</p>
        </div>
        <div className={styles.introAside}>
          <span className={styles.asideLabel}>{release.period} release / at a glance</span>
          <div className={styles.introMetrics}>
            <div><strong className="civx-mono">{methodology.indicators.length.toString().padStart(2, "0")}</strong><span>BPS inputs</span></div>
            <div><strong className="civx-mono">27</strong><span>Reference regions</span></div>
            <div><strong className="civx-mono">{regionalData.length.toString().padStart(2, "0")}</strong><span>Reviewed results</span></div>
          </div>
          <p className={styles.disclaimer}>CIVX is a project-defined analytical index using BPS observations. It is not an official BPS index.</p>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="method-steps">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">01 / The calculation</span>
          <h2 id="method-steps">Five steps, one index</h2>
          <p>The same declared rules apply to all {regionalData.length} published regions.</p>
        </div>
        <ol className={styles.steps}>
          <li><span className={styles.stepNumber}>01 / Input</span><h3>BPS observations</h3><p>Read four {release.period} values from cited BPS tables, keeping units and survey periods.</p></li>
          <li><span className={styles.stepNumber}>02 / Align</span><h3>Direction adjustment</h3><p>Set whether higher or lower values represent more modeled pressure.</p></li>
          <li><span className={styles.stepNumber}>03 / Scale</span><h3>Min–max normalization</h3><p>Scale each value against fixed {release.period} Jawa Barat bounds.</p></li>
          <li><span className={styles.stepNumber}>04 / Combine</span><h3>25% weighting</h3><p>Give each of the four normalized indicators equal weight.</p></li>
          <li><span className={styles.stepNumber}>05 / Result</span><h3>Civic Index 0–100</h3><p>Sum four contributions into one relative pressure score.</p></li>
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="method-why">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">02 / The inputs</span>
          <h2 id="method-why">Why these four indicators?</h2>
          <p>Poverty, employment, human development, and improved sanitation show different aspects of regional conditions—not a complete account of life in a region.</p>
        </div>
        <div className={styles.indicatorGrid}>
          {methodology.indicators.map((indicator, index) => (
            <article className={styles.indicator} key={indicator.id}>
              <span className={styles.indicatorNumber}>0{index + 1} / {methodology.indicators.length.toString().padStart(2, "0")}</span>
              <h3>{indicator.label}</h3>
              <p>{indicator.direction === "higher" ? "Higher raw value → more pressure" : "Lower raw value → more pressure"}</p>
              <div className={styles.range}>
                <span>Fixed {release.period} range</span>
                <strong className="civx-mono">{indicator.minimum}–{indicator.maximum} {indicator.unit}</strong>
              </div>
              <p className={styles.extrema}>Min {indicator.minimumRegion} <span aria-hidden="true">·</span> Max {indicator.maximumRegion}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.compactSection}`} aria-labelledby="method-direction">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">03 / Direction</span>
          <h2 id="method-direction">First, agree on what more means</h2>
          <p>More poverty or unemployment means more modeled pressure. For the Human Development Index and sanitation access, less means more modeled pressure. The raw values and units remain unchanged in the source records.</p>
        </div>
        <div className={styles.directionPair} aria-label="Direction of modeled pressure">
          <div><span>Higher value → more pressure</span><strong>Poverty · Unemployment</strong></div>
          <div><span>Lower value → more pressure</span><strong>Human development · Sanitation access</strong></div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="method-normalization">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">04 / The math</span>
          <h2 id="method-normalization">One fixed reference for every region</h2>
          <p>Each indicator&apos;s bounds come from all 27 Jawa Barat kabupaten/kota in the cited {release.period} BPS tables, not just the {regionalData.length} regions published here.</p>
        </div>
        <div className={styles.formulaBlock} aria-label="Normalization and index formulas">
          <div><strong>Higher means more pressure</strong><code>100 × (value − minimum) ÷ (maximum − minimum)</code></div>
          <div><strong>Lower means more pressure</strong><code>100 × (maximum − value) ÷ (maximum − minimum)</code></div>
          <div><strong>Civic Index</strong><code>Σ (indicator score × 0.25)</code></div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="method-weights">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">05 / The contribution</span>
          <h2 id="method-weights">One quarter each</h2>
          <p>Every normalized indicator contributes {methodology.indicators[0].weight * 100}% of the final 0–100 score. Indicator scores and the final index are rounded to two decimal places; each contribution is shown in index points.</p>
        </div>
        <div className={styles.weightStrip} aria-label="Four indicators, each weighted 25 percent">
          {methodology.indicators.map((indicator) => (
            <div key={indicator.id}><span>{indicator.label}</span><strong className="civx-mono">{indicator.weight * 100}%</strong></div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="method-missing">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">06 / Missing data</span>
          <h2 id="method-missing">No complete record, no score</h2>
          <p>If an input or its source is absent, has the wrong year or unit, or falls outside its fixed reference range, CIVX does not publish a score. Missing values are not imputed, zero-filled, or reweighted.</p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="method-limits">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">07 / Current limits</span>
          <h2 id="method-limits">Read the score in context</h2>
        </div>
        <div className={styles.limitGrid}>
          <div><h3>Relative, not absolute</h3><p>Scores below 33.33 are labeled lower relative pressure; 33.33 to below 66.67, moderate; 66.67 and above, higher. These are project-defined model bands, not government thresholds or a fine-grained ranking.</p></div>
          <div><h3>Different survey windows</h3><p>The BPS tables cover different windows within {release.period}. The observations are not measurements from the same month.</p></div>
          <div><h3>Published coverage</h3><p>{regionalData.length} verified Jawa Barat regions have released results here; fixed bounds still come from all 27. Regional averages can conceal inequalities within a region.</p></div>
          <div><h3>No causal claim</h3><p>The chosen indicators do not establish causes, forecasts, policy prescriptions, or a region&apos;s worth.</p></div>
        </div>
        <nav className={styles.nextLinks} aria-label="Continue exploring CIVX">
          <Link className="civx-text-link" href="/explore">Explore reviewed regions <span aria-hidden="true">↗</span></Link>
          <Link className="civx-text-link" href="/sources">Examine the BPS sources <span aria-hidden="true">↗</span></Link>
        </nav>
      </section>
    </main>
  );
}
