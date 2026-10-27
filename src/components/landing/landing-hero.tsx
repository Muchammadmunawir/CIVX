import Link from "next/link";
import { release, regionalData } from "@/lib/civx/data";
import { getPublishedContext } from "@/lib/civx/coverage";
import styles from "./landing.module.css";

const scoreFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function LandingHero() {
  const { ordered: published, median } = getPublishedContext(regionalData);
  const lowest = published.at(-1);
  const highest = published[0];
  return (
    <section className={`civx-container ${styles.hero}`} aria-labelledby="civx-title">
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <span className="civx-eyebrow">CIVX / Civic intelligence / Jawa Barat</span>
          <p className={styles.heroKicker}>A clearer view of regional pressure.</p>
          <h1 id="civx-title">Measure the Pressure.<br />Understand the Place.</h1>
          <p className={styles.heroDescription}>
            A modeled relative Civic Index built from {release.methodology.indicators.length} public BPS indicators for {published.length} published regions.
            See the score, compare the evidence, and trace every input.
            <strong> Higher means more modeled pressure, not better performance or an official BPS ranking.</strong>
          </p>
          <div className={styles.heroActions}>
            <Link className="civx-button civx-button-primary" href="/explore">Explore regions <span aria-hidden="true">→</span></Link>
            <Link className="civx-button civx-button-secondary" href="/methodology">Methodology <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.visualHeader}>
            <div><span className="civx-eyebrow">{release.period} release snapshot</span><h2>One scale. Published context.</h2></div>
            <span className={styles.visualPeriod}>{release.period} / 0–100</span>
          </div>
          <div className={styles.visualStats} aria-label="Release overview">
            <div><span>Published</span><strong>{published.length}</strong><small>regions</small></div>
            <div><span>Indicators</span><strong>{release.methodology.indicators.length}</strong><small>equal-weight inputs</small></div>
            <div><span>Data year</span><strong>{release.period}</strong><small>Jawa Barat</small></div>
          </div>
          <div className={styles.visualRange}>
            <span>Published score range</span>
            {highest?.civicIndex.status === "available" && lowest?.civicIndex.status === "available" ? (
              <strong>{scoreFormat.format(lowest.civicIndex.score)}–{scoreFormat.format(highest.civicIndex.score)} <small>/ 100</small></strong>
            ) : <strong>Unavailable</strong>}
            <span>Median of published scores: {median === null ? "unavailable" : scoreFormat.format(median)}</span>
          </div>
          <p className={styles.visualNote}>CIVX is a modeled relative index, not an official BPS ranking. A higher score means more modeled pressure; the published median describes these records, not the normalization reference.</p>
          <Link className="civx-text-link" href="/explore">Explore all published records ↗</Link>
        </div>
      </div>
      <dl className={styles.facts} aria-label="CIVX release facts">
        <div><dt>Coverage</dt><dd>{published.length} <span>of {regionalData.length} release records scored</span></dd></div>
        <div><dt>Inputs</dt><dd>{release.methodology.indicators.length} <span>equally weighted</span></dd></div>
        <div><dt>Reference year</dt><dd>{release.period} <span>BPS Jawa Barat</span></dd></div>
        <div><dt>Score range</dt><dd>0–100 <span>higher = more pressure</span></dd></div>
      </dl>
    </section>
  );
}
