import Link from "next/link";
import { PressureBadge } from "./pressure-badge";
import { categoryForScore, civicRelease } from "@/lib/civx/current";
import type { V2Region } from "@/lib/civx/v2/types";
import { scoreForLayer, type PressureLayerId } from "@/components/explore/pressure-layer";
import styles from "@/components/explore/explore.module.css";

const scoreFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function RegionList({ regions, layer, layerLabel }: { regions: V2Region[]; layer: PressureLayerId; layerLabel: string }) {
  return <ul className={styles.regionList} aria-label="Regional Civic Index results">{regions.map(region => {
    const score = scoreForLayer(region, layer);
    const pressure = region.pressure;
    const preview = pressure.status === "available" ? pressure.dimensions.reduce<(typeof pressure.dimensions)[number] | undefined>((highest, dimension) => !highest || dimension.contribution > highest.contribution ? dimension : highest, undefined) : undefined;
    return <li id={`region-${region.id}`} key={region.id}><Link className={styles.regionCard} href={`/regions/${region.id}`} scroll={false}><article>
      <div className={styles.cardTop}><span className={styles.cardId}>ID {region.id} · {civicRelease.period}</span><span className={styles.positionNote}>{region.type === "kota" ? "City" : "Regency"}</span></div>
      <div className={styles.cardHeading}><div><h3>{region.name}</h3><PressureBadge category={score === undefined ? undefined : categoryForScore(score)} /></div><div className={styles.cardScore}>{score === undefined ? <span className={styles.unavailableScore}>—</span> : <strong>{scoreFormat.format(score)}</strong>}<span>{score === undefined ? "Score unavailable" : `${layerLabel} / 100`}</span></div></div>
      {layer !== "overall" && pressure.status === "available" && <p>Civic Index: {scoreFormat.format(pressure.score)} / 100</p>}
      {preview ? <div className={styles.indicatorPreview}><span className={styles.previewLabel}>Largest dimension contribution</span><div><span>{preview.label}</span><strong>{scoreFormat.format(preview.contribution)} points</strong></div><p>Context and advantages remain outside the score.</p></div> : pressure.status === "unavailable" ? <p className={styles.missingReason}>{pressure.reason}</p> : null}
      <div className={styles.cardFoot}><span>Open dimensions, context &amp; sources</span><span aria-hidden="true">↗</span></div>
    </article></Link></li>;
  })}</ul>;
}
