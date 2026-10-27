import Link from "next/link";
import { PressureBadge } from "@/components/data/pressure-badge";
import { categoryForScore, civicRelease, coreIndicators, currentRegions, dimensions } from "@/lib/civx/current";
import { decimal, displayedDifference, signed } from "./comparison-format";
import { ComparisonDimension } from "./comparison-dimension";
import { ComparisonIndicator } from "./comparison-indicator";
import { isPublishedRegion, type PublishedRegion, type RegionComparison } from "./comparison-selection";
import styles from "./comparison.module.css";

function RegionSummary({ region, side, position, count, median }: {
  region: PublishedRegion;
  side: "A" | "B";
  position: number;
  count: number;
  median: number;
}) {
  return (
    <article className={styles.regionSummary} data-side={side}>
      <div className={styles.regionIdentity}>
        <span className={styles.sideMarker} aria-label={`Region ${side}`}>{side}</span>
        <span>{region.type === "kota" ? "City" : "Regency"} · BPS {region.id}</span>
      </div>
      <h3>{region.name}</h3>
      <div className={styles.score}>
        <strong>{decimal.format(region.pressure.score)}</strong>
        <span>/ 100 · CIVX</span>
      </div>
      <PressureBadge category={categoryForScore(region.pressure.score)} />
      <dl className={styles.contextList}>
        <div><dt>Published position</dt><dd>{position} of {count}</dd></div>
        <div><dt>From median ({decimal.format(median)})</dt><dd>{signed(displayedDifference(region.pressure.score, median))} points</dd></div>
      </dl>
      <Link className="civx-text-link" href={`/regions/${region.id}`}>View {region.name} record ↗</Link>
    </article>
  );
}

export function ComparisonPage({ comparison, selectedA, selectedB }: {
  comparison: RegionComparison;
  selectedA: string;
  selectedB: string;
}) {
  const options = [...currentRegions].sort((a, b) => a.name.localeCompare(b.name));
  const hasA = options.some((region) => region.id === selectedA);
  const hasB = options.some((region) => region.id === selectedB);
  const published = currentRegions.filter(isPublishedRegion).sort((a, b) => b.pressure.score - a.pressure.score);
  const middle = Math.floor(published.length / 2);
  const median = published.length === 0 ? null : published.length % 2
    ? published[middle].pressure.score
    : (published[middle - 1].pressure.score + published[middle].pressure.score) / 2;
  const difference = comparison.eligible
    ? displayedDifference(comparison.a.pressure.score, comparison.b.pressure.score)
    : null;
  const aComponents = comparison.eligible ? comparison.a.pressure.dimensions.flatMap(dimension => dimension.components) : [];
  const bComponents = comparison.eligible ? comparison.b.pressure.dimensions.flatMap(dimension => dimension.components) : [];
  const maxOrderMovement = Math.max(0, ...civicRelease.sensitivity.scenarios.map(scenario => scenario.maxOrderMovement));

  return (
    <main className={`civx-container ${styles.page}`}>
      <Link className="civx-text-link" href="/explore">← Explore regions</Link>
      <header className={styles.intro}>
        <div><h1>Compare regions</h1><p>Jawa Barat · {civicRelease.period} published release</p></div>
        <p>One fixed method across {currentRegions.length} regions. Compare relative modeled pressure—not an official government ranking or evidence of causes.</p>
      </header>

      <section className={styles.selector} aria-labelledby="selection-heading">
        <div className={styles.sectionHead}>
          <h2 id="selection-heading">Choose your pair</h2>
          <p id="selection-help">Choose different regions with complete published scores from this release.</p>
        </div>
        <form action="/compare" method="get" className={styles.form} key={`${selectedA}:${selectedB}`} aria-describedby="selection-help">
          <div className={styles.field}>
            <label htmlFor="compare-a">Region A</label>
            <select id="compare-a" name="a" defaultValue={hasA ? selectedA : ""} required>
              <option value="" disabled>Choose Region A</option>
              {options.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
            </select>
          </div>
          <span className={styles.versus} aria-hidden="true">versus</span>
          <div className={styles.field}>
            <label htmlFor="compare-b">Region B</label>
            <select id="compare-b" name="b" defaultValue={hasB ? selectedB : ""} required>
              <option value="" disabled>Choose Region B</option>
              {options.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
            </select>
          </div>
          <button type="submit" className="civx-button civx-button-primary">Compare regions</button>
        </form>
        {!comparison.eligible && (
          <div role="alert" className={styles.error}>
            <h3>This pair cannot be compared</h3>
            <p>{comparison.reason}</p>
            <p>Choose a different pair above, or <Link className="civx-text-link" href="/compare">reset to the default compatible pair</Link>. Unknown selections are left blank.</p>
          </div>
        )}
      </section>

      {comparison.eligible && median !== null && difference !== null && (
        <>
          <section className={styles.results} aria-labelledby="results-heading">
            <div className={styles.sectionHead}>
              <h2 id="results-heading">A versus B</h2>
              <Link
                className={styles.swap}
                href={{ pathname: "/compare", query: { a: comparison.b.id, b: comparison.a.id } }}
                scroll={false}
                aria-label={`Swap regions: ${comparison.b.name} as A and ${comparison.a.name} as B`}
              >Swap A and B <span aria-hidden="true">⇄</span></Link>
            </div>
            <div className={styles.difference}>
              <div>
                <p>CIVX score difference · A − B</p>
                <strong>{signed(difference)} <span>points</span></strong>
              </div>
              <p>{difference === 0
                ? `${comparison.a.name} and ${comparison.b.name} have the same displayed CIVX score.`
                : `${comparison.a.name} has a ${decimal.format(Math.abs(difference))}-point ${difference > 0 ? "higher" : "lower"} modeled pressure score than ${comparison.b.name}.`}</p>
            </div>
            <div className={styles.summaryGrid}>
              <RegionSummary region={comparison.a} side="A" position={published.filter(region => region.pressure.score > comparison.a.pressure.score).length + 1} count={published.length} median={median} />
              <RegionSummary region={comparison.b} side="B" position={published.filter(region => region.pressure.score > comparison.b.pressure.score).length + 1} count={published.length} median={median} />
            </div>
            <p className={styles.note}>Positions run from higher to lower modeled pressure; tied released scores share a position. Positions and median cover complete published scores in this release. Differences subtract the displayed figures.</p>
            <p className={styles.note}>Plausible weighting choices move regional positions by up to {maxOrderMovement} places. Read dimension differences rather than treating fine positions as stable ranks. <Link className="civx-text-link" href="/methodology#method-sensitivity">Inspect weight sensitivity ↗</Link></p>
          </section>

          <section className={styles.breakdown} aria-labelledby="dimensions-heading">
            <div className={styles.sectionHead}>
              <h2 id="dimensions-heading">Dimension comparison · {dimensions.length} dimensions</h2>
              <p>Compare dimension scores and their weighted contributions to CIVX before reading individual inputs.</p>
            </div>
            <div className={styles.indicatorList}>
              {dimensions.map(dimension => (
                <ComparisonDimension
                  key={dimension.id}
                  a={comparison.a.pressure.dimensions.find(item => item.id === dimension.id)!}
                  b={comparison.b.pressure.dimensions.find(item => item.id === dimension.id)!}
                  aName={comparison.a.name}
                  bName={comparison.b.name}
                />
              ))}
            </div>
          </section>

          <section className={styles.breakdown} aria-labelledby="indicators-heading">
            <div className={styles.sectionHead}>
              <h2 id="indicators-heading">Core indicator comparison · {coreIndicators.length} inputs</h2>
              <p>Read raw values in their original units. Bars share each indicator’s weight-derived contribution scale.</p>
            </div>
            <div className={styles.indicatorList}>
              {coreIndicators.map(indicator => {
                const a = aComponents.find(item => item.indicatorId === indicator.id)!;
                const b = bComponents.find(item => item.indicatorId === indicator.id)!;
                return (
                  <ComparisonIndicator
                    key={indicator.id}
                    indicator={indicator}
                    a={a}
                    b={b}
                    aObservation={comparison.a.observations.find(item => item.id === a.observationId)!}
                    bObservation={comparison.b.observations.find(item => item.id === b.observationId)!}
                    aName={comparison.a.name}
                    bName={comparison.b.name}
                  />
                );
              })}
            </div>
            <p className={styles.note}>A positive difference means A is numerically higher; raw-value direction varies by indicator. Display rounding can make contribution differences differ slightly from the total score difference. Context and advantage evidence never changes scores. Missing core inputs are not imputed or reweighted. No difference establishes statistical significance or causation.</p>
          </section>
          <p className={styles.releaseMeta}>{civicRelease.period} · Fixed current release and methodology · Same geographic reference set</p>
        </>
      )}
      <nav className={styles.bottomLinks} aria-label="Further reading">
        <Link className="civx-text-link" href="/explore">Explore all regions ↗</Link>
        <Link className="civx-text-link" href="/methodology">Read methodology ↗</Link>
        <Link className="civx-text-link" href="/sources">View official sources ↗</Link>
      </nav>
    </main>
  );
}
