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
          <span className="civx-eyebrow">Explore / Jawa Barat / {release.period}</span>
          <h1 id="explore-title">Explore the Civic Index<span className={styles.titleAccent}>.</span></h1>
          <p>Compare {publishedCount} published regional {publishedCount === 1 ? "score" : "scores"} and their four 2023 indicator readings. Open each record to trace the calculation and BPS sources. CIVX is a relative pressure model, not a BPS ranking.</p>
        </div>
      </section>
      <section className={`civx-container ${styles.summary}`} aria-label="Release at a glance">
        <div className={styles.summaryItem}><strong>{publishedCount.toString().padStart(2, "0")}</strong><span>Published regional scores</span></div>
        <div className={styles.summaryItem}><strong>{release.period}</strong><span>Data period</span></div>
        <div className={styles.summaryItem}><strong>27</strong><span>Jawa Barat regions in the fixed reference set</span></div>
      </section>
      <ExploreBrowser regions={regionalData} />
      <section className={`civx-container ${styles.context}`} aria-labelledby="context-title">
        <div>
          <span className="civx-eyebrow">How to read this release</span>
          <h2 id="context-title">A comparison with context.</h2>
        </div>
        <div className={styles.contextCopy}>
          <p>Scores describe relative pressure against fixed {release.period} BPS reference ranges. When shown, the median and positions describe only published CIVX scores; neither is a BPS ranking or a measure of certainty. Missing inputs are never filled in.</p>
          <div className={styles.contextLinks}>
            <Link href="/methodology">Read the methodology <span aria-hidden="true">↗</span></Link>
            <Link href="/sources">Examine the sources <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
