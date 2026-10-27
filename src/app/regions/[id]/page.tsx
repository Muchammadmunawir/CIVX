import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPublishedContext } from "@/lib/civx/coverage";
import { getRegionDetail, regionalData, release } from "@/lib/civx/data";
import styles from "./page.module.css";

const decimal = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function generateStaticParams() {
  return regionalData.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const detail = getRegionDetail((await params).id);
  if (!detail) notFound();
  return {
    title: `${detail.region.name} | Civic Index`,
    description: `${detail.region.period} Civic Index result, indicator inputs, and sources for ${detail.region.name}.`,
  };
}

export default function RegionPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<main className={`civx-container ${styles.page}`}><p>Loading regional record…</p></main>}>
      <RegionRecord params={params} />
    </Suspense>
  );
}

async function RegionRecord({ params }: { params: Promise<{ id: string }> }) {
  const detail = getRegionDetail((await params).id);
  if (!detail) notFound();
  const { region, civicIndex } = detail;
  const { ordered: published, median, positionById } = getPublishedContext(regionalData);
  const position = positionById.get(region.id);
  const medianDelta = civicIndex.status === "available" && median !== null
    ? civicIndex.score - median
    : null;
  const largestContribution = civicIndex.status === "available"
    ? civicIndex.components.reduce((largest, component) =>
        component.contribution > largest.contribution ? component : largest)
    : undefined;

  return (
    <main className={`civx-container ${styles.page}`}>
      <Link className={`civx-text-link ${styles.back}`} href="/explore">← Explore regions</Link>
      <header className={styles.hero}>
        <div className={styles.identity}>
          <p className="civx-eyebrow">Regional record / Jawa Barat / {region.period}</p>
          <h1>{region.name}</h1>
          <p className={styles.identityMeta}>{region.type === "kabupaten" ? "Regency" : "City"} · BPS region {region.id}</p>
          <p className={styles.boundary}>Boundary reference: {region.boundaryReference}</p>
          <p className={styles.releaseNote}>{release.period} release · {published.length} published scores. CIVX is a modeled relative index, not an official BPS ranking or a causal measure.</p>
        </div>
        <div className={styles.result} aria-labelledby="index-status">
          <p className={styles.resultLabel}>Civic Index <span>· data year {region.period}</span></p>
          {civicIndex.status === "available" ? (
            <>
              {region.category && <p className={styles.category}>{region.category} modeled pressure</p>}
              <h2 className={styles.score} id="index-status">{decimal.format(civicIndex.score)}<span> / 100</span></h2>
              {region.interpretation && <p className={styles.interpretation}>{region.interpretation}</p>}
              <div className={styles.scale} role="img" aria-label={`${region.name}: ${decimal.format(civicIndex.score)} out of 100${median === null ? "" : `; published median: ${decimal.format(median)} out of 100`}. A higher result indicates more modeled pressure.`}>
                <div className={styles.scaleTrack}>
                  <span className={styles.scaleFill} style={{ width: `${civicIndex.score}%` }} />
                  {median !== null && <span className={styles.medianMarker} style={{ left: `${median}%` }} />}
                  <span className={styles.primaryMarker} style={{ left: `${civicIndex.score}%` }} />
                </div>
                <div className={styles.scaleTicks}><span>0 · lower</span><span>25</span><span>50</span><span>75</span><span>100 · higher</span></div>
              </div>
              <div className={styles.scaleLegend}>
                <span><i className={styles.primaryKey} aria-hidden="true" />{region.name}: <strong>{decimal.format(civicIndex.score)}</strong></span>
                {median !== null && <span><i className={styles.medianKey} aria-hidden="true" />Published median: <strong>{decimal.format(median)}</strong></span>}
              </div>
              <div className={styles.heroInsights}>
                {position !== undefined && (
                  <div className={styles.heroInsight}>
                    <span>Position among published CIVX scores</span>
                    <strong>Modeled order · tied scores share a position</strong>
                    <b className="civx-mono">{position} <small>of {published.length}</small></b>
                  </div>
                )}
                {medianDelta !== null && (
                  <div className={styles.heroInsight}>
                    <span>Difference from published median</span>
                    <strong>{medianDelta > 0 ? "Above" : medianDelta < 0 ? "Below" : "At"} the published median</strong>
                    <b className="civx-mono">{medianDelta > 0 ? "+" : ""}{decimal.format(medianDelta)} <small>index points</small></b>
                  </div>
                )}
                {largestContribution && (
                  <div className={styles.heroInsight}>
                    <span>Largest contribution to this index</span>
                    <strong>{largestContribution.label}</strong>
                    <b className="civx-mono">{decimal.format(largestContribution.contribution)} <small>index points</small></b>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className={styles.unavailable} id="index-status">Index unavailable</h2>
              <p className={styles.interpretation}>{civicIndex.reason}</p>
            </>
          )}
        </div>
      </header>

      {civicIndex.status === "available" && (
        <>

          <section className={styles.section} aria-labelledby="indicator-breakdown">
            <div className={styles.sectionHeading}>
              <div>
                <p className="civx-eyebrow">01 / Components</p>
                <h2 id="indicator-breakdown">Inside the score</h2>
              </div>
              <p>{civicIndex.components.length} indicators · published methodology weights</p>
            </div>
            <p className={styles.sectionIntro}>Observed BPS values, normalized pressure scores and weighted contributions are separate quantities. Each source below links to its BPS publication and identifies its table.</p>
            <details className={styles.readingGuide}>
              <summary>What do raw, normalized and contribution mean?</summary>
              <p><strong>Raw value</strong> is the observed BPS figure in its original unit. <strong>Normalized score</strong> places it on a 0–100 modeled pressure scale against the fixed {release.period} reference set. <strong>Contribution</strong> is its weighted share of the Civic Index; its maximum is the indicator weight × 100 points. These are different quantities.</p>
            </details>
            <div className={styles.indicators}>
              {civicIndex.components.map((component, index) => {
                const policy = release.methodology.indicators.find((indicator) => indicator.id === component.indicatorId);
                const potential = component.weight * 100;
                return (
                  <article className={styles.indicator} key={component.indicatorId} aria-labelledby={`indicator-${component.indicatorId}`}>
                    <div className={styles.indicatorTop}>
                      <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h3 id={`indicator-${component.indicatorId}`}>{component.label}</h3>
                        <p>{component.direction === "lower" ? "A lower raw value maps to more modeled pressure." : "A higher raw value maps to more modeled pressure."}</p>
                      </div>
                    </div>
                    <div className={styles.indicatorBody}>
                      <dl className={styles.metrics}>
                        <div><dt>Raw observed value · {component.period}</dt><dd>{decimal.format(component.value)} <small>{component.unit}</small></dd></div>
                        <div><dt>Normalized pressure score</dt><dd>{decimal.format(component.score)} <small>/ 100</small></dd></div>
                        <div><dt>Weighted index contribution</dt><dd>{decimal.format(component.contribution)} <small>/ {decimal.format(potential)} points</small></dd></div>
                      </dl>
                      <div className={styles.contribution}>
                        <div className={styles.barLabel}><span>Contribution to overall score</span><strong>{decimal.format(component.contribution)} / {decimal.format(potential)}</strong></div>
                        <div className={styles.barTrack} role="img" aria-label={`${component.label} contributes ${decimal.format(component.contribution)} of ${decimal.format(potential)} possible index points`}>
                          <span style={{ width: `${component.score}%` }} />
                        </div>
                        <div className={styles.barEnds}><span>0</span><span>{decimal.format(potential)} points</span></div>
                        {policy && <p className={styles.referenceRange}>{release.period} fixed reference range: {decimal.format(policy.minimum)}–{decimal.format(policy.maximum)} {component.unit} · {release.referenceSetId}.</p>}
                      </div>
                    </div>
                    <div className={styles.sources}>
                      <p>Source &amp; observation year · published BPS table</p>
                      <ul>
                        {component.sources.map((source) => (
                          <li key={source.id}>
                            <a className="civx-text-link" href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher} · {source.title} ↗</a>
                            <span>Table {source.table} · {source.page} · data year {source.dataYear} · {source.referencePeriod}</span>
                            <span className={styles.sourceId}>Source {source.id} · artifact {source.artifactId}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="context-heading">
            <div className={styles.sectionHeading}>
              <div>
                <p className="civx-eyebrow">02 / Release context</p>
                <h2 id="context-heading">Read the published context</h2>
              </div>
              <Link className="civx-text-link" href="/explore">Explore all published regions ↗</Link>
            </div>
            <p className={styles.sectionIntro}>Position and median compare only scores published in this {release.period} CIVX release. They are descriptive modeled values, not an official BPS ranking, a measure of statistical significance or an explanation of causes. Normalization uses the fixed {release.referenceSetId} reference set, not the published median.</p>
          </section>
        </>
      )}

      <aside className={styles.provenance} aria-labelledby="provenance-heading">
        <p className="civx-eyebrow">Record notes</p>
        <h2 id="provenance-heading">Method &amp; provenance</h2>
        {civicIndex.status === "available" && <p>Release {civicIndex.releaseId} · reference set {civicIndex.referenceSetId} · methodology {civicIndex.methodologyVersion}. Source artifact {release.artifact.id} · {release.artifact.publication}, revised {release.artifact.revisedAt}. The BPS observation periods shown above need not refer to the same month.</p>}
        <p>Inspect the <Link className="civx-text-link" href="/methodology">methodology and limitations ↗</Link> and the <Link className="civx-text-link" href="/sources">source register ↗</Link> for table, artifact, and access details.</p>
      </aside>
    </main>
  );
}
