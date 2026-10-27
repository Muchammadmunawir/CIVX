import Link from "next/link";
import { PressureBadge } from "@/components/data/pressure-badge";
import { getPublishedContext } from "@/lib/civx/coverage";
import { compareRegions, type RegionComparison } from "@/lib/civx/comparison";
import { release } from "@/lib/civx/data";
import { decimal, displayedDifference, signed } from "./comparison-format";
import { ComparisonIndicator } from "./comparison-indicator";
import styles from "./comparison.module.css";

function RegionSummary({ region, side, position, count, median }: {
  region: Extract<RegionComparison, { eligible: true }>["a"];
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
        <strong>{decimal.format(region.civicIndex.score)}</strong>
        <span>/ 100 · Civic Index</span>
      </div>
      <PressureBadge category={region.category} />
      <dl className={styles.contextList}>
        <div><dt>Published position</dt><dd>{position} of {count}</dd></div>
        <div><dt>From median ({decimal.format(median)})</dt><dd>{signed(displayedDifference(region.civicIndex.score, median))} points</dd></div>
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
  const options = [...release.regions].sort((a, b) => a.name.localeCompare(b.name));
  const hasA = options.some((region) => region.id === selectedA);
  const hasB = options.some((region) => region.id === selectedB);
  const aId = comparison.eligible ? comparison.a.id : null;
  const context = aId !== null ? getPublishedContext(release.regions.filter((region) =>
    region.id === aId || compareRegions(release, aId, region.id).eligible
  )) : null;
  const difference = comparison.eligible
    ? displayedDifference(comparison.a.civicIndex.score, comparison.b.civicIndex.score)
    : null;

  return (
    <main className={`civx-container ${styles.page}`}>
      <Link className="civx-text-link" href="/explore">← Explore regions</Link>
      <header className={styles.intro}>
        <div><h1>Compare regions</h1><p>Jawa Barat · {release.period} published release</p></div>
        <p>Two regions, one fixed method. Compare relative modeled pressure—not an official BPS ranking or evidence of causes.</p>
      </header>

      <section className={styles.selector} aria-labelledby="selection-heading">
        <div className={styles.sectionHead}>
          <h2 id="selection-heading">Choose your pair</h2>
          <p id="selection-help">Choose two different regions. Both must have compatible published records.</p>
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

      {comparison.eligible && context && context.median !== null && difference !== null && (
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
              <RegionSummary region={comparison.a} side="A" position={context.positionById.get(comparison.a.id)!} count={context.ordered.length} median={context.median} />
              <RegionSummary region={comparison.b} side="B" position={context.positionById.get(comparison.b.id)!} count={context.ordered.length} median={context.median} />
            </div>
            <p className={styles.note}>Positions run from higher to lower modeled pressure; tied released scores share a position. Positions and median cover compatible published CIVX records only. Differences subtract the two displayed figures.</p>
          </section>

          <section className={styles.breakdown} aria-labelledby="indicators-heading">
            <div className={styles.sectionHead}>
              <h2 id="indicators-heading">Indicator comparison</h2>
              <p>Read raw values in their original units. Bars show weighted contributions on the same weight-derived scale for A and B.</p>
            </div>
            <div className={styles.indicatorList}>
              {release.methodology.indicators.map((indicator) => (
                <ComparisonIndicator
                  key={indicator.id}
                  a={comparison.a.civicIndex.components.find((item) => item.indicatorId === indicator.id)!}
                  b={comparison.b.civicIndex.components.find((item) => item.indicatorId === indicator.id)!}
                  aName={comparison.a.name}
                  bName={comparison.b.name}
                />
              ))}
            </div>
            <p className={styles.note}>A positive difference means A is numerically higher; raw-value direction varies by indicator. Display rounding can make contribution differences differ slightly from the total score difference. No difference establishes statistical significance or causation.</p>
          </section>
          <p className={styles.releaseMeta}>{release.period} · {release.methodology.methodologyVersion} · {release.referenceSetId}</p>
        </>
      )}
      <nav className={styles.bottomLinks} aria-label="Further reading">
        <Link className="civx-text-link" href="/explore">Explore all regions ↗</Link>
        <Link className="civx-text-link" href="/methodology">Read methodology ↗</Link>
        <Link className="civx-text-link" href="/sources">View BPS sources ↗</Link>
      </nav>
    </main>
  );
}
