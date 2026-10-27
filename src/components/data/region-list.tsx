import Link from "next/link";
import { PressureBadge } from "@/components/data/pressure-badge";
import type { RegionalData } from "@/lib/civx/types";
import styles from "@/components/explore/explore.module.css";

const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const scoreFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
    <ul className={styles.regionList} aria-label="Regional Civic Index results">
      {regions.map((region) => {
        const result = region.civicIndex;
        const position = positionById.get(region.id);
        const preview = result.status === "available"
          ? result.components.reduce<(typeof result.components)[number] | undefined>(
            (highest, component) => !highest || component.score > highest.score ? component : highest,
            undefined,
          )
          : undefined;
        return (
          <li id={`region-${region.id}`} key={region.id}>
            <Link className={styles.regionCard} href={`/regions/${region.id}`} scroll={false}>
              <article>
                <div className={styles.cardTop}>
                  <span className={styles.cardId}>ID {region.id} · {region.period}</span>
                  <span className={styles.positionNote}>
                    {position !== undefined ? `Position ${position} / ${publishedCount}` : "No release position"}
                  </span>
                </div>
                <div className={styles.cardHeading}>
                  <div>
                    <h3>{region.name}</h3>
                    <PressureBadge category={region.category} />
                  </div>
                  <div className={styles.cardScore}>
                    {result.status === "available"
                      ? <strong>{scoreFormat.format(result.score)}</strong>
                      : <span className={styles.unavailableScore}>—</span>}
                    <span>{result.status === "available" ? "CIVX / 100" : "Score unavailable"}</span>
                  </div>
                </div>
                {preview ? (
                  <div className={styles.indicatorPreview}>
                    <span className={styles.previewLabel}>Highest indicator pressure</span>
                    <div>
                      <span>{preview.label}</span>
                      <strong>{decimal.format(preview.value)} {preview.unit}</strong>
                    </div>
                    <p>Normalized pressure {scoreFormat.format(preview.score)}/100</p>
                  </div>
                ) : result.status === "unavailable" ? (
                  <p className={styles.missingReason}>{result.reason}</p>
                ) : null}
                <div className={styles.cardFoot}>
                  <span>Open record &amp; sources</span>
                  <span aria-hidden="true">↗</span>
                </div>
              </article>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
