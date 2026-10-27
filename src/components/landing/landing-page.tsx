import Link from "next/link";
import { PressureBadge } from "@/components/data/pressure-badge";
import { IndicatorSystem } from "@/components/landing/indicator-system";
import { LandingHero } from "@/components/landing/landing-hero";
import { categoryForScore, civicRelease, coreIndicators, currentRegions, dimensions } from "@/lib/civx/current";
import styles from "./landing.module.css";

export function LandingPage() {
  const published = currentRegions.filter(region => region.pressure.status === "available").sort((a, b) => (b.pressure.status === "available" ? b.pressure.score : 0) - (a.pressure.status === "available" ? a.pressure.score : 0));
  const scores = published.flatMap(region => region.pressure.status === "available" ? [region.pressure.score] : []);
  const middle = Math.floor(scores.length / 2);
  const median = scores.length ? scores.length % 2 ? scores[middle] : (scores[middle - 1] + scores[middle]) / 2 : null;
  const sample = published.length <= 3 ? published : [published[0], published[middle], published[published.length - 1]];
  return (
    <main className={styles.page}>
      <LandingHero published={published} median={median} />
      <section className={`civx-container ${styles.previewSection}`} aria-labelledby="preview-title">
        <div className={styles.sectionHeading}><div><span className="civx-eyebrow">Open a regional record</span><h2 id="preview-title">Across the published release</h2></div><Link className="civx-text-link" href="/explore">Explore all {currentRegions.length} regions ↗</Link></div>
        <p className={styles.previewIntro}>Records spanning the published score range. Open a region to inspect dimensions, core observations and the wider evidence.</p>
        <div className={styles.previewGrid}>{sample.map(region => <Link className={styles.previewCard} href={`/regions/${region.id}`} key={region.id}><span className="civx-eyebrow">{civicRelease.period} / {region.province}</span><h3>{region.name}</h3><div className={styles.previewResult}><strong>{region.pressure.status === "available" ? region.pressure.score.toFixed(2) : "—"} <small>/ 100</small></strong><PressureBadge category={region.pressure.status === "available" ? categoryForScore(region.pressure.score) : undefined} /></div><span className={styles.previewLink}>View regional record <span aria-hidden="true">↗</span></span></Link>)}</div>
      </section>
      <section className={`civx-container ${styles.section} ${styles.inputsSection}`} aria-labelledby="pressure-title">
        <div className={styles.sectionHeading}><div><span className="civx-eyebrow">The common core</span><h2 id="pressure-title">What affects pressure</h2></div><p>{coreIndicators.length} validated inputs across {dimensions.length} dimensions. Every region uses the same complete contract.</p></div>
        <div className={styles.previewGrid}>{dimensions.map(dimension => <article className={styles.previewCard} key={dimension.id}><span className="civx-eyebrow">{(dimension.weight * 100).toFixed(2)}% of Civic Index</span><h3>{dimension.label}</h3><p>{dimension.indicators.map(indicator => indicator.label).join(" · ")}</p></article>)}</div>
        <details><summary>Inspect all core indicators and effective weights</summary><IndicatorSystem /></details>
        {civicRelease.methodology.unsupportedDimensions.length > 0 && <details><summary>Why other dimensions have no score</summary><ul>{civicRelease.methodology.unsupportedDimensions.map(dimension => <li key={dimension.id}><strong>{dimension.label}:</strong> {dimension.reason}</li>)}</ul></details>}
      </section>
      <div className={`civx-container ${styles.closingGrid}`}>
        <section className={styles.closingPanel} aria-labelledby="context-title"><span className="civx-eyebrow">Beyond the score</span><h2 id="context-title">Context Signals</h2><p>Population, density, service supply and other context remain source-backed evidence, not score inputs. Available, Historical, Partial, Incompatible geography and Unavailable records keep their distinct meanings.</p><p>Density never scores. High density does not mean poor performance.</p><Link className="civx-text-link" href="/explore">Read context in a regional record ↗</Link></section>
        <section className={styles.closingPanel} aria-labelledby="advantages-title"><span className="civx-eyebrow">Capabilities, not bonuses</span><h2 id="advantages-title">Regional Advantages</h2><p>Verified 2023 evidence records Whoosh in Bandung Barat (3217), Kertajati flights in Majalengka (3210), and Cisumdawu in Sumedang (3211).</p><p>Other records show “No comparable verified data” where evidence is unknown. Unknown never means zero or no advantage.</p><div className={styles.heroActions}><Link className="civx-text-link" href="/regions/3217">Whoosh ↗</Link><Link className="civx-text-link" href="/regions/3210">Kertajati ↗</Link><Link className="civx-text-link" href="/regions/3211">Cisumdawu ↗</Link></div></section>
        <section className={styles.closingPanel} aria-labelledby="methodology-title"><span className="civx-eyebrow">Calculation / transparency</span><h2 id="methodology-title">See how a score is made.</h2><p>Every result keeps raw observations, normalized pressure, contributions and sources. Missing or incomparable core evidence withholds the whole index; it never becomes zero or a reweighted mean.</p><Link className="civx-text-link" href="/methodology">Methodology &amp; sensitivity ↗</Link></section>
        <section className={styles.closingPanel} aria-labelledby="sources-title"><span className="civx-eyebrow">Source transparency</span><h2 id="sources-title">Follow the public evidence.</h2><p>{civicRelease.sources.length} source records retain institutional attribution, reference periods, raw artifacts and limitations, including optional context and capability evidence.</p><Link className="civx-text-link" href="/sources">Browse all sources ↗</Link><details><summary>Current source register</summary><ul className={styles.sourceList}>{civicRelease.sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer"><span><strong>{source.title}</strong><small>{source.publisher} · {source.table ? `Table ${source.table} · ` : ""}{source.referencePeriod}</small></span><span aria-hidden="true">↗</span></a></li>)}</ul><span className={`civx-mono ${styles.releaseId}`}>{civicRelease.releaseId}</span></details></section>
      </div>
    </main>
  );
}
