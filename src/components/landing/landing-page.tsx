import Link from "next/link";
import { PressureBadge } from "@/components/data/pressure-badge";
import { IndicatorSystem } from "@/components/landing/indicator-system";
import { LandingHero } from "@/components/landing/landing-hero";
import { getPublishedContext } from "@/lib/civx/coverage";
import { regionalData, release } from "@/lib/civx/data";
import styles from "./landing.module.css";

export function LandingPage() {
  const { ordered: published, median } = getPublishedContext(regionalData);
  const sample = published.length <= 3
    ? published
    : [published[0], published[Math.floor(published.length / 2)], published[published.length - 1]];
  return (
    <main className={styles.page}>
      <LandingHero published={published} median={median} />
      <section className={`civx-container ${styles.previewSection}`} aria-labelledby="preview-title">
        <div className={styles.sectionHeading}>
          <div><span className="civx-eyebrow">Open a regional record</span><h2 id="preview-title">Across the published release</h2></div>
          <Link className="civx-text-link" href="/explore">Explore all {published.length} scored regions ↗</Link>
        </div>
        <p className={styles.previewIntro}>{published.length > 3 ? "Three records spanning the published score range. Open a record to inspect the observations behind its score." : "Open a scored record to inspect its observations and sources."}</p>
        <div className={styles.previewGrid}>
          {sample.map((region) => (
            <Link className={styles.previewCard} href={`/regions/${region.id}`} key={region.id}>
              <span className="civx-eyebrow">{region.period} / {region.province}</span>
              <h3>{region.name}</h3>
              <div className={styles.previewResult}>
                <strong>{region.civicIndex.status === "available" ? region.civicIndex.score.toFixed(2) : "—"} <small>/ 100</small></strong>
                <PressureBadge category={region.category ?? undefined} />
              </div>
              <span className={styles.previewLink}>View regional record <span aria-hidden="true">↗</span></span>
            </Link>
          ))}
        </div>
      </section>
      <section className={`civx-container ${styles.section} ${styles.inputsSection}`} aria-labelledby="indicators-title">
        <div className={styles.sectionHeading}>
          <div><span className="civx-eyebrow">How the index works</span><h2 id="indicators-title">{release.methodology.indicators.length} inputs. One inspectable score.</h2></div>
          <p>Each BPS observation is direction-adjusted and normalized to fixed {release.period} Jawa Barat kabupaten/kota reference ranges.</p>
        </div>
        <IndicatorSystem indicators={release.methodology.indicators} />
      </section>
      <div className={`civx-container ${styles.closingGrid}`}>
        <section className={styles.closingPanel} aria-labelledby="methodology-title">
          <span className="civx-eyebrow">Calculation / transparency</span>
          <h2 id="methodology-title">See how a score is made.</h2>
          <p>Every result keeps the raw observation beside its normalized score, weighted contribution, source table, and period. Missing or incomparable evidence withholds the index; it never becomes zero or a partial mean.</p>
          <Link className="civx-text-link" href="/methodology">Read the methodology <span aria-hidden="true">↗</span></Link>
        </section>
        <section className={styles.closingPanel} aria-labelledby="sources-title">
          <span className="civx-eyebrow">Source transparency</span>
          <h2 id="sources-title">Follow the BPS tables.</h2>
          <p>The {release.period} observations come from BPS Jawa Barat yearbook tables. Check source periods and limitations before interpreting a score.</p>
          <Link className="civx-text-link" href="/sources">Browse the source directory <span aria-hidden="true">↗</span></Link>
          <ul className={styles.sourceList} aria-label="BPS source tables">
            {release.sources.map((source) => (
              <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">
                <span><strong>{source.title}</strong><small>Table {source.table} · data year {source.dataYear}</small></span><span aria-hidden="true">↗</span>
              </a></li>
            ))}
          </ul>
          <span className={`civx-mono ${styles.releaseId}`}>{release.releaseId}</span>
        </section>
      </div>
    </main>
  );
}
