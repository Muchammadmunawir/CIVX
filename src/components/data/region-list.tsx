import Link from "next/link";
import type { RegionalData } from "@/lib/civx/types";
import styles from "@/components/explore/explore.module.css";

const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function RegionList({
  regions,
  positionById,
  publishedCount,
}: {
  regions: RegionalData[];
  positionById: ReadonlyMap<string, number>;
  publishedCount: number;
}) {
  return (
    <ul className={styles.regionList} aria-label="Published regional Civic Index results">
      {regions.map((region) => (
        <li id={`region-${region.id}`} key={region.id}>
          <Link className={styles.regionCard} href={`/regions/${region.id}`} aria-label={`Open ${region.name} regional record`}>
            <article>
              <div className={styles.cardTop}>
                <span className={styles.cardEyebrow}>{region.province} <span aria-hidden="true">/</span> ID {region.id}</span>
                <span className={styles.cardYear}>{region.period}</span>
              </div>
              <div className={styles.cardHeading}>
                <div>
                  <h3>{region.name}</h3>
                  <span className={styles.category}>{region.category ? `${region.category} relative pressure` : "Score unavailable"}</span>
                </div>
                <div className={styles.cardScore}>
                  <strong>{region.civicIndex.status === "available" ? decimal.format(region.civicIndex.score) : "—"}</strong>
                  <span>CIVX score / 100</span>
                </div>
              </div>
              {region.civicIndex.status === "available" ? (
                <>
                  <div className={styles.scoreContext}>
                    <span className={styles.scoreTrack} aria-hidden="true"><span style={{ width: `${region.civicIndex.score}%` }} /></span>
                    {publishedCount >= 3 && positionById.has(region.id) && (
                      <span className={styles.positionNote}>CIVX model position {positionById.get(region.id)} of {publishedCount} published scores</span>
                    )}
                  </div>
                  <div className={styles.indicators}>
                    <div className={styles.indicatorsHeading}>
                      <span>2023 indicator preview</span>
                      <span>Observation / normalized pressure</span>
                    </div>
                    <ul className={styles.indicatorList} aria-label={`Indicators for ${region.name}`}>
                      {region.civicIndex.components.map((component) => (
                        <li className={styles.indicator} key={component.indicatorId}>
                          <span className={styles.indicatorLabel}>{component.label}</span>
                          <span className={styles.indicatorValue}>{decimal.format(component.value)} {component.unit}</span>
                          <span className={styles.indicatorScore}>{decimal.format(component.score)}/100</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className={styles.missingReason}>{region.civicIndex.reason}</p>
              )}
              <div className={styles.cardFoot}>
                <span>View record, calculation &amp; BPS sources</span>
                <span aria-hidden="true">↗</span>
              </div>
            </article>
          </Link>
        </li>
      ))}
    </ul>
  );
}
