import Link from "next/link";
import { categoryForScore, civicRelease, coreIndicators, dimensions } from "@/lib/civx/current";
import type { V2Region } from "@/lib/civx/v2/types";
import styles from "./landing.module.css";

const scoreFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function LandingHero({ published, median }: { published: readonly V2Region[]; median: number | null }) {
  const lowest = published.at(-1);
  const highest = published[0];
  const categoryCounts = { lower: 0, moderate: 0, higher: 0 };
  for (const region of published) if (region.pressure.status === "available") categoryCounts[categoryForScore(region.pressure.score)] += 1;
  return (
    <section className={`civx-container ${styles.hero}`} aria-labelledby="civx-title">
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <span className="civx-eyebrow">Civic Index / Public evidence</span>
          <h1 id="civx-title">CIVX · Jawa Barat</h1>
          <p>{civicRelease.period} · {civicRelease.regions.length} regions · {coreIndicators.length} validated core indicators across {dimensions.length} pressure dimensions.</p>
          <p className={styles.heroDescription}>One inspectable Civic Index brings verified regional observations onto a fixed 0–100 relative pressure scale. Context Signals and Regional Advantages tell the wider story without changing the score.</p>
          <p className={styles.heroInterpretation}>Higher means more modeled pressure, not better performance. CIVX is a project model, not an official government ranking.</p>
          <div className={styles.heroActions}>
            <Link className="civx-button civx-button-primary" href="/explore">Explore regions <span aria-hidden="true">→</span></Link>
            <Link className="civx-button civx-button-secondary" href="/compare">Compare regions <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.visualHeader}><div><span className="civx-eyebrow">Current release / {civicRelease.period}</span><h2>Published release snapshot</h2></div><span className={styles.visualPeriod}>{civicRelease.period} / 0–100</span></div>
          <div className={styles.visualStats} aria-label="Release overview">
            <div><span>Published</span><strong>{published.length}</strong><small>regions</small></div>
            <div><span>Core indicators</span><strong>{coreIndicators.length}</strong><small>validated inputs</small></div>
            <div><span>Dimensions</span><strong>{dimensions.length}</strong><small>pressure budgets</small></div>
          </div>
          <div className={styles.visualRange}><span>Published score range</span>{highest?.pressure.status === "available" && lowest?.pressure.status === "available" ? <strong>{scoreFormat.format(lowest.pressure.score)}–{scoreFormat.format(highest.pressure.score)} <small>/ 100</small></strong> : <strong>Unavailable</strong>}<span>Median of published scores: {median === null ? "unavailable" : scoreFormat.format(median)}</span></div>
          <div className={styles.distribution}>
            <span className={styles.distributionTitle}>Published pressure categories</span>
            <div className={styles.distributionTrack} aria-hidden="true">{(["lower", "moderate", "higher"] as const).map(category => <span className={styles[`distribution${category[0].toUpperCase()}${category.slice(1)}`]} style={{ width: `${published.length ? categoryCounts[category] / published.length * 100 : 0}%` }} key={category} />)}</div>
            <ul className={styles.distributionLegend}><li><i className={styles.distributionLower} aria-hidden="true" />Lower <strong>{categoryCounts.lower}</strong></li><li><i className={styles.distributionModerate} aria-hidden="true" />Moderate <strong>{categoryCounts.moderate}</strong></li><li><i className={styles.distributionHigher} aria-hidden="true" />Higher <strong>{categoryCounts.higher}</strong></li></ul>
          </div>
          <p className={styles.visualNote}>Every region shares the complete core contract. Normalization uses the fixed {civicRelease.period} reference of {civicRelease.methodology.referenceRegionIds.length} Jawa Barat kabupaten/kota, never the current filters.</p>
        </div>
      </div>
    </section>
  );
}
