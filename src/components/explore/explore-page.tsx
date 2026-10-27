import Link from "next/link";
import { ExploreBrowser } from "@/components/explore/explore-browser";
import { civicRelease, coreIndicators, currentRegions, dimensions } from "@/lib/civx/current";
import styles from "./explore.module.css";

export function ExplorePage() {
  const publishedCount = currentRegions.filter(region => region.pressure.status === "available").length;
  return (
    <main className={styles.page}>
      <section className={`civx-container ${styles.intro}`} aria-labelledby="explore-title"><div className={styles.introHeading}><h1 id="explore-title">Explore Jawa Barat</h1><p>{civicRelease.period} · {currentRegions.length} regions · {coreIndicators.length} validated core indicators across {dimensions.length} pressure dimensions.</p><p>Find a region, read its Civic Index, then trace dimensions, context and source evidence.</p></div></section>
      <section className={`civx-container ${styles.summary}`} aria-label="Release at a glance"><div className={styles.summaryItem}><strong>{civicRelease.period}</strong><span>Jawa Barat release</span></div><div className={styles.summaryItem}><strong>{publishedCount}</strong><span>Published Civic Index scores</span></div><div className={styles.summaryItem}><strong>{dimensions.length}</strong><span>Validated pressure dimensions</span></div></section>
      <ExploreBrowser regions={currentRegions} />
      <section className={`civx-container ${styles.context}`} aria-labelledby="context-title"><div><h2 id="context-title">Read the model in context</h2></div><div className={styles.contextCopy}><p>CIVX describes modeled relative pressure, not an official government ranking. Every region uses the same complete contract and fixed {civicRelease.period} bounds. Context Signals and Regional Advantages stay visible in regional records, but never change the score. Density never scores.</p><div className={styles.contextLinks}><Link href="/methodology">Read the methodology <span aria-hidden="true">↗</span></Link><Link href="/sources">Examine the sources <span aria-hidden="true">↗</span></Link></div></div></section>
    </main>
  );
}
