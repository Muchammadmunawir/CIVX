import Link from "next/link";
import { ExploreBrowser } from "@/components/explore/explore-browser";
import { release, regionalData } from "@/lib/civx/data";
import { getPublishedContext } from "@/lib/civx/coverage";
import styles from "./explore.module.css";

export function ExplorePage() {
  const publishedCount = getPublishedContext(regionalData).ordered.length;

  return (
    <main className={styles.page}>
      <section className={`civx-container ${styles.intro}`} aria-labelledby="explore-title">
        <div className={styles.introHeading}>
          <h1 id="explore-title">Explore Jawa Barat</h1>
          <p>Find a region, read its relative pressure, then trace the BPS evidence.</p>
        </div>
      </section>
      <section className={`civx-container ${styles.summary}`} aria-label="Release at a glance">
        <div className={styles.summaryItem}><strong>{release.period}</strong><span>Jawa Barat release</span></div>
        <div className={styles.summaryItem}><strong>{publishedCount}</strong><span>Published regional scores</span></div>
        <div className={styles.summaryItem}><strong>{release.methodology.indicators.length}</strong><span>BPS indicators · equal weights</span></div>
      </section>
      <ExploreBrowser regions={regionalData} />
      <section className={`civx-container ${styles.context}`} aria-labelledby="context-title">
        <div>
          <h2 id="context-title">Read the model in context</h2>
        </div>
        <div className={styles.contextCopy}>
          <p>CIVX describes modeled relative pressure, not an official BPS ranking. Scores use fixed {release.period} reference ranges. Release positions run from higher to lower published scores; missing inputs are never filled in.</p>
          <div className={styles.contextLinks}>
            <Link href="/methodology">Read the methodology <span aria-hidden="true">↗</span></Link>
            <Link href="/sources">Examine the sources <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
