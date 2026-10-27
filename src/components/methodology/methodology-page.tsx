import Link from "next/link";
import { civicRelease, coreIndicators, currentRegions, dimensions } from "@/lib/civx/current";
import styles from "./methodology-page.module.css";

const sections = [
  ["method-steps", "Calculation"],
  ["method-why", "Indicators"],
  ["method-direction", "Direction"],
  ["method-normalization", "Formulas"],
  ["method-weights", "Weights"],
  ["method-missing", "Common core"],
  ["method-sensitivity", "Sensitivity"],
  ["method-limits", "Limits"],
  ["method-release", "Release record"],
] as const;

const percent = (weight: number) => `${(weight * 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;

export function MethodologyPage() {
  const { methodology, sensitivity, qualityAudit } = civicRelease;

  return (
    <main className={`civx-container ${styles.page}`}>
      <header className={styles.intro}>
        <div className={styles.introCopy}>
          <span className="civx-eyebrow">CIVX / Jawa Barat / {civicRelease.period} / Methodology</span>
          <h1>How the index is made</h1>
          <p className={styles.lead}>{coreIndicators.length} common-core indicators across {dimensions.length} dimensions become one 0–100 relative pressure score. Follow the path from cited observations to the Civic Index.</p>
          <p className={styles.release}>Release {civicRelease.releaseId} <span aria-hidden="true">·</span> Method {methodology.methodologyVersion}</p>
        </div>
        <div className={styles.introAside}>
          <span className={styles.asideLabel}>{civicRelease.period} release / at a glance</span>
          <div className={styles.introMetrics}>
            <div><strong className="civx-mono">{coreIndicators.length.toString().padStart(2, "0")}</strong><span>Core indicators</span></div>
            <div><strong className="civx-mono">{methodology.referenceRegionIds.length}</strong><span>Reference regions</span></div>
            <div><strong className="civx-mono">{qualityAudit.scored}</strong><span>Published scores</span></div>
          </div>
          <p className={styles.disclaimer}>CIVX is a project-defined analytical index using cited institutional evidence. It is not an official government index or an endorsement by its source institutions.</p>
        </div>
      </header>
      <nav className={styles.contents} aria-label="On this page">
        <span>On this page</span>
        <ul>{sections.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ul>
      </nav>

      <section className={styles.section} aria-labelledby="method-steps">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">01 / The calculation</span>
          <h2 id="method-steps">Five steps, one index</h2>
          <p>The same declared common core applies to all {currentRegions.length} released regions.</p>
        </div>
        <ol className={styles.steps}>
          <li><span className={styles.stepNumber}>01 / Input</span><h3>Verify observations</h3><p>Require all {coreIndicators.length} configured inputs with source, artifact, year, unit, geography, and coverage checks.</p></li>
          <li><span className={styles.stepNumber}>02 / Align</span><h3>Direction adjustment</h3><p>Declare whether higher or lower raw values represent more modeled pressure.</p></li>
          <li><span className={styles.stepNumber}>03 / Scale</span><h3>Fixed normalization</h3><p>Use the released {civicRelease.period} reference bounds, never the currently selected comparison set.</p></li>
          <li><span className={styles.stepNumber}>04 / Combine</span><h3>Dimension budgets</h3><p>Weight indicators within each dimension, then apply each dimension’s declared budget.</p></li>
          <li><span className={styles.stepNumber}>05 / Result</span><h3>Civic Index 0–100</h3><p>Sum the weighted dimensions at full precision, then publish two-decimal results.</p></li>
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="method-why">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">02 / The inputs</span>
          <h2 id="method-why">{coreIndicators.length} inputs, one shared reference</h2>
          <p>Only these configured indicators enter pressure. Context indicators and advantage signals remain separate evidence; neither adds to nor offsets the score.</p>
        </div>
        <div className={styles.indicatorGrid}>
          {dimensions.flatMap((dimension) => dimension.indicators.map((indicator) => (
            <article className={styles.indicator} key={indicator.id}>
              <span className={styles.indicatorNumber}>{dimension.label} / {percent(dimension.weight)} dimension budget</span>
              <h3>{indicator.label}</h3>
              <p>{indicator.direction === "higher" ? "Higher raw value → more pressure" : "Lower raw value → more pressure"}</p>
              <div className={styles.range}>
                <span>Fixed {civicRelease.period} bounds</span>
                <strong className="civx-mono">{indicator.minimum}–{indicator.maximum} {indicator.unit}</strong>
              </div>
              <p className={styles.extrema}>Min {indicator.minimumRegion} <span aria-hidden="true">·</span> Max {indicator.maximumRegion}</p>
              <p className={styles.extrema}>Within dimension: {percent(indicator.withinDimensionWeight)} <span aria-hidden="true">·</span> Effective index weight: {percent(dimension.weight * indicator.withinDimensionWeight)}</p>
              <Link className={styles.indicatorSource} href={`/sources#source-${indicator.sourceId}`}>Inspect source evidence <span aria-hidden="true">↗</span></Link>
            </article>
          )))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.compactSection}`} aria-labelledby="method-direction">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">03 / Direction</span>
          <h2 id="method-direction">First, agree on what more means</h2>
          <p>Direction is a declared modeling choice, not a change to raw observations. Original values, units, and definitions remain in the source records.</p>
        </div>
        <div className={styles.directionPair} aria-label="Direction of modeled pressure">
          {(["higher", "lower"] as const).map((direction) => (
            <div key={direction}><span>{direction === "higher" ? "Higher" : "Lower"} value → more pressure</span><strong>{coreIndicators.filter((indicator) => indicator.direction === direction).map((indicator) => indicator.label).join(" · ") || "No configured indicators"}</strong></div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="method-normalization">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">04 / The math</span>
          <h2 id="method-normalization">One fixed reference for every region</h2>
          <p>Each indicator uses published bounds for the {methodology.referenceRegionIds.length}-region reference set. Filtering the map or choosing regions never recalibrates the scale. Values outside those bounds are ineligible, not clipped.</p>
        </div>
        <div className={styles.formulaBlock} aria-label="Normalization and index formulas">
          <div><strong>Higher means more pressure</strong><code>sᵢ = 100 × (valueᵢ − minimumᵢ) ÷ (maximumᵢ − minimumᵢ)</code></div>
          <div><strong>Lower means more pressure</strong><code>sᵢ = 100 × (maximumᵢ − valueᵢ) ÷ (maximumᵢ − minimumᵢ)</code></div>
          <div><strong>Dimension score</strong><code>Dⱼ = Σᵢ (sᵢ × within-dimension weightᵢⱼ)</code></div>
          <div><strong>Effective indicator weight</strong><code>eᵢ = dimension budgetⱼ × within-dimension weightᵢⱼ</code></div>
          <div><strong>Civic Index</strong><code>CIVX = Σⱼ (Dⱼ × dimension budgetⱼ) = Σᵢ (sᵢ × eᵢ)</code></div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="method-weights">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">05 / The contribution</span>
          <h2 id="method-weights">Declared dimension budgets</h2>
          <p>Dimension budgets sum to 100%. Indicator weights sum to 100% within each dimension. Compute with full precision before rounding displayed scores and contributions to two decimals; displayed parts may not sum exactly.</p>
        </div>
        <div className={styles.weightStrip} aria-label="Released dimension budgets">
          {dimensions.map((dimension) => <div key={dimension.id}><span>{dimension.label} · {dimension.indicators.length} indicators</span><strong className="civx-mono">{percent(dimension.weight)}</strong></div>)}
        </div>
        <p className={styles.disclaimer}>{methodology.weightDecision}</p>
      </section>

      <section className={styles.section} aria-labelledby="method-missing">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">06 / Complete common core</span>
          <h2 id="method-missing">No complete record, no score</h2>
          <p>Every region needs all {coreIndicators.length} configured indicators, verified and comparable for {methodology.period}, with matching units, civil-region codes, boundary reference, cited source, artifact, and row locator. Denominators must retain their definitions and, when numeric, same-period source evidence.</p>
        </div>
        <div className={styles.limitGrid}>
          <div><h3>No substitution or reweighting</h3><p>Missing, unverified, incompatible, wrong-period, wrong-unit, or out-of-range core evidence withholds the whole score. No imputation, zero filling, regional weight changes, optional-data substitution, or silent denominator replacement.</p></div>
          <div><h3>Optional evidence stays optional</h3><p>Context and advantages never enter scoring. Missing optional evidence does not withhold a complete core score. No comparable advantage data means unknown, not verified absence. Historical evidence keeps its actual year.</p></div>
          <div><h3>Release coverage</h3><p>{qualityAudit.attempted} regions assessed; {qualityAudit.scored} scored; {qualityAudit.withheld.length} withheld.</p>{qualityAudit.withheld.length > 0 && <ul>{qualityAudit.withheld.map((entry) => <li key={entry.regionId}>{currentRegions.find((region) => region.id === entry.regionId)?.name ?? entry.regionId}: {entry.reason}</li>)}</ul>}</div>
          {methodology.unsupportedDimensions.map((dimension) => <div key={dimension.id}><h3>{dimension.label}: unscored</h3><p>{dimension.reason}</p></div>)}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="method-sensitivity">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">07 / Sensitivity</span>
          <h2 id="method-sensitivity">How much do modeling choices matter?</h2>
          <p>Baseline: {sensitivity.baseline}. The release records {sensitivity.scenarios.length} diagnostic scenarios against the same fixed reference.</p>
        </div>
        <p className={styles.disclaimer}>{sensitivity.decision}</p>
        <ul className={styles.evidenceList}>{sensitivity.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
        <div className={styles.indicatorGrid}>
          {sensitivity.scenarios.map((scenario) => (
            <article className={styles.indicator} key={scenario.id}>
              <h3>{scenario.label}</h3>
              <p>Maximum score change: {scenario.maxAbsoluteScoreChange.toFixed(2)} points. Mean absolute change: {scenario.meanAbsoluteScoreChange.toFixed(2)} points.</p>
              <p>Maximum order movement: {scenario.maxOrderMovement}. Order reversals: {scenario.orderReversals}. Category changes: {scenario.categoryChanges}. Spearman correlation: {scenario.spearman}.</p>
              <details className={styles.details}>
                <summary>Scenario weights and regional results</summary>
                <h4>Dimension budgets</h4>
                <ul>{Object.entries(scenario.dimensionWeights).map(([id, weight]) => <li key={id}>{dimensions.find((dimension) => dimension.id === id)?.label ?? id}: {percent(weight)}</li>)}</ul>
                <h4>Within-dimension weights</h4>
                <ul>{coreIndicators.map((indicator) => <li key={indicator.id}>{indicator.label}: {percent(scenario.indicatorWeights[indicator.id] ?? 0)}</li>)}</ul>
                <p>Omitted inputs have zero weight in this diagnostic only, never in production missing-data handling.</p>
                <ul>{scenario.regions.map((region) => <li key={region.regionId}>{currentRegions.find((entry) => entry.id === region.regionId)?.name ?? region.regionId}: score {region.score.toFixed(2)}; change {region.change}; order movement {region.orderMovement}.</li>)}</ul>
              </details>
            </article>
          ))}
        </div>
        <details className={styles.details}>
          <summary>Indicator correlations ({sensitivity.correlations.length} pairs)</summary>
          <ul>{sensitivity.correlations.map((pair) => <li key={`${pair.a}-${pair.b}`}>{coreIndicators.find((indicator) => indicator.id === pair.a)?.label ?? pair.a} / {coreIndicators.find((indicator) => indicator.id === pair.b)?.label ?? pair.b}: Pearson {pair.pearson}</li>)}</ul>
        </details>
      </section>

      <section className={styles.section} aria-labelledby="method-limits">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">08 / Current limits</span>
          <h2 id="method-limits">Read the score in context</h2>
          <p>Below 33.33 means lower relative pressure; 33.33 to below 66.67 means moderate; 66.67 and above means higher. These project-defined bands are not government thresholds, causal findings, or a precise league table.</p>
        </div>
        <ul className={styles.evidenceList}>{civicRelease.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
      </section>

      <section className={styles.section} aria-labelledby="method-release">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">09 / Reproducible release record</span>
          <h2 id="method-release">One product, traceable release history</h2>
          <p>This page describes only the current Jawa Barat {civicRelease.period} release. Historical identifiers in evidence and raw-input paths preserve lineage, not alternate products. A changed source, method, bound, or reference set requires a distinct release record; do not mix scores across incompatible releases or infer a time trend.</p>
        </div>
        <dl className={styles.metadata}>
          <div><dt>Release</dt><dd>{civicRelease.releaseId}</dd></div>
          <div><dt>Methodology</dt><dd>{methodology.methodologyVersion}</dd></div>
          <div><dt>Reference set</dt><dd>{methodology.referenceSetId}</dd></div>
          <div><dt>Period</dt><dd>{methodology.period}</dd></div>
          <div><dt>Boundary reference</dt><dd>{methodology.boundaryReference}</dd></div>
          <div><dt>Review state</dt><dd>{methodology.status === "project_validated" ? "Project-validated; not independent certification" : "Draft"}</dd></div>
          <div><dt>Normalization</dt><dd>{methodology.normalization}</dd></div>
          <div><dt>Rounding</dt><dd>{methodology.rounding}</dd></div>
          <div><dt>Reference region codes</dt><dd>{methodology.referenceRegionIds.join(", ")}</dd></div>
        </dl>
        <p className={styles.disclaimer}>Reproduce this release using its raw-input paths and SHA-256 fingerprints, then inspect cited artifacts, row locators, and denominator evidence. Source access and redistribution restrictions still apply.</p>
        <nav className={styles.nextLinks} aria-label="Continue exploring CIVX">
          <Link className="civx-text-link" href="/sources#source-input-heading">Inspect release inputs <span aria-hidden="true">↗</span></Link>
          <Link className="civx-text-link" href="/sources">Examine all source institutions <span aria-hidden="true">↗</span></Link>
          <Link className="civx-text-link" href="/explore">Explore regional results <span aria-hidden="true">↗</span></Link>
        </nav>
      </section>
    </main>
  );
}
