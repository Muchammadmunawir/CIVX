import Link from "next/link";
import { release } from "@/lib/civx/data";
import type { RegionalData } from "@/lib/civx/types";
import styles from "./landing.module.css";

const scoreFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function LandingHero({ published, median }: { published: readonly RegionalData[]; median: number | null }) {
  const lowest = published.at(-1);
  const highest = published[0];
  const categoryCounts = {
    lower: published.filter((region) => region.category === "lower").length,
    moderate: published.filter((region) => region.category === "moderate").length,
    higher: published.filter((region) => region.category === "higher").length,
  };
  return (
    <section className={`civx-container ${styles.hero}`} aria-labelledby="civx-title">
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <span className="civx-eyebrow">CIVX / Civic Index / {release.period}</span>
          <h1 id="civx-title">Jawa Barat,<br />in context.</h1>
          <p className={styles.heroDescription}>
            Compare regional conditions through {release.methodology.indicators.length} public BPS indicators.
            CIVX brings poverty, unemployment, human development, and sanitation access onto one inspectable 0–100 pressure scale.
          </p>
          <p className={styles.heroInterpretation}>Higher means more modeled pressure, not better performance. CIVX is not an official BPS ranking.</p>
          <div className={styles.heroActions}>
            <Link className="civx-button civx-button-primary" href="/explore">Explore regions <span aria-hidden="true">→</span></Link>
            <Link className="civx-button civx-button-secondary" href="/compare">Compare regions <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.visualHeader}>
            <div><span className="civx-eyebrow">Current release / {release.period}</span><h2>Published release snapshot</h2></div>
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
          <div className={styles.distribution}>
            <span className={styles.distributionTitle}>Published pressure categories</span>
            <div className={styles.distributionTrack} aria-hidden="true">
              <span className={styles.distributionLower} style={{ width: `${published.length ? categoryCounts.lower / published.length * 100 : 0}%` }} />
              <span className={styles.distributionModerate} style={{ width: `${published.length ? categoryCounts.moderate / published.length * 100 : 0}%` }} />
              <span className={styles.distributionHigher} style={{ width: `${published.length ? categoryCounts.higher / published.length * 100 : 0}%` }} />
            </div>
            <ul className={styles.distributionLegend}>
              <li><i className={styles.distributionLower} aria-hidden="true" />Lower <strong>{categoryCounts.lower}</strong></li>
              <li><i className={styles.distributionModerate} aria-hidden="true" />Moderate <strong>{categoryCounts.moderate}</strong></li>
              <li><i className={styles.distributionHigher} aria-hidden="true" />Higher <strong>{categoryCounts.higher}</strong></li>
            </ul>
          </div>
          <p className={styles.visualNote}>Counts, range, and median describe the published records. Normalization uses the fixed {release.period} reference for all 27 Jawa Barat kabupaten/kota.</p>
        </div>
      </div>
    </section>
  );
}
