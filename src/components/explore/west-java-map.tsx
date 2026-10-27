"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PressureBadge } from "@/components/data/pressure-badge";
import geometry from "../../../data/geography/jabar-adm2-2020.json";
import type { RegionalData } from "@/lib/civx/types";
import styles from "./explore.module.css";

const pathsById = new Map(geometry.regions.map((shape) => [shape.id, shape]));
const scoreFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function WestJavaMap({ regions, visibleIds, positionById, publishedCount }: {
  regions: readonly RegionalData[];
  visibleIds: ReadonlySet<string>;
  positionById: ReadonlyMap<string, number>;
  publishedCount: number;
}) {
  const router = useRouter();
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const shown = useMemo(() => regions.filter((region) => visibleIds.has(region.id)), [regions, visibleIds]);
  const active = shown.find((region) => region.id === inspectedId)
    ?? shown.find((region) => region.id === selectedId)
    ?? shown[0];
  const missingGeometry = shown.filter((region) => !pathsById.has(region.id));
  const position = active ? positionById.get(active.id) : undefined;

  return (
    <section className={styles.geoSection} aria-labelledby="geography-title">
      <div className={styles.geoHeading}>
        <h2 id="geography-title">Jawa Barat map</h2>
        <p>{shown.length} matching {shown.length === 1 ? "region" : "regions"} · <a href="#region-results">Use the regional list <span aria-hidden="true">↓</span></a></p>
      </div>
      <div className={styles.geoGrid}>
        <div className={styles.mapSurface}>
          <svg className={styles.mapSvg} viewBox={geometry.viewBox} role="group" aria-label="Interactive Jawa Barat region map">
            <title>Jawa Barat regional CIVX scores</title>
            <desc>Approximate 2020 ADM2 boundaries. Each matching region links to its 2023 record. A region selector and the regional list provide keyboard and non-map alternatives.</desc>
            {regions.map((region) => {
              const shape = pathsById.get(region.id);
              if (!shape) return null;
              const result = region.civicIndex;
              const isVisible = visibleIds.has(region.id);
              const regionPosition = positionById.get(region.id);
              return (
                <a
                  key={region.id}
                  href={`/regions/${region.id}`}
                  aria-label={`${region.name}, ${result.status === "available" ? `CIVX ${scoreFormat.format(result.score)} of 100, ${region.category ?? "uncategorized"} relative pressure${regionPosition !== undefined ? `, release position ${regionPosition} of ${publishedCount}` : ""}` : "score unavailable"}. Open regional record`}
                  aria-hidden={!isVisible}
                  tabIndex={isVisible ? 0 : -1}
                  className={`${styles.mapRegion} ${result.status === "available" && region.category ? styles[`map${region.category}`] : styles.mapUnavailable} ${isVisible ? "" : styles.mapDimmed} ${active?.id === region.id ? styles.mapActive : ""} ${selectedId === region.id ? styles.mapSelected : ""}`}
                  onMouseEnter={() => { if (isVisible) setInspectedId(region.id); }}
                  onFocus={() => setInspectedId(region.id)}
                  onClick={(event) => {
                    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                    event.preventDefault();
                    event.currentTarget.focus({ preventScroll: true });
                    setSelectedId(region.id);
                    setInspectedId(region.id);
                    router.push(`/regions/${region.id}`, { scroll: false });
                  }}
                >
                  <path d={shape.path} fillRule="evenodd" vectorEffect="non-scaling-stroke" />
                </a>
              );
            })}
          </svg>
          {!shown.length && <p className={styles.mapEmpty}>No regions match. Clear the filters to restore the map.</p>}
        </div>
        <aside className={styles.mapContext} aria-label="Region map details">
          <div className={styles.control}>
            <label htmlFor="map-region">Inspect a region</label>
            <select
              id="map-region"
              value={active?.id ?? ""}
              disabled={!shown.length}
              onChange={(event) => { setSelectedId(event.target.value); setInspectedId(event.target.value); }}
            >
              {!shown.length && <option value="">No matching regions</option>}
              {shown.map((region) => <option value={region.id} key={region.id}>{region.name}</option>)}
            </select>
          </div>
          <div className={styles.mapRecord}>
            <h3>{active?.name ?? "No matching region"}</h3>
            {active && (
              <>
                <PressureBadge category={active.category} />
                {active.civicIndex.status === "available" ? (
                  <>
                    <strong className={styles.mapScore}>{scoreFormat.format(active.civicIndex.score)} <small>/ 100</small></strong>
                    {position !== undefined && <p>Release position {position} of {publishedCount}</p>}
                  </>
                ) : <p className={styles.missingReason}>Score unavailable. {active.civicIndex.reason}</p>}
                {!pathsById.has(active.id) && <p>Display outline unavailable. The regional record remains accessible.</p>}
                <Link className={styles.mapRecordLink} href={`/regions/${active.id}`} scroll={false}>Open regional record <span aria-hidden="true">↗</span></Link>
              </>
            )}
          </div>
          <ul className={styles.mapLegend} aria-label="Modeled relative pressure categories">
            <li><i className={styles.mapLowerKey} aria-hidden="true" />Lower</li>
            <li><i className={styles.mapModerateKey} aria-hidden="true" />Moderate</li>
            <li><i className={styles.mapHigherKey} aria-hidden="true" />Higher</li>
            {regions.some((region) => region.civicIndex.status !== "available") && <li><i className={styles.mapUnavailableKey} aria-hidden="true" />Unavailable</li>}
          </ul>
        </aside>
      </div>
      {missingGeometry.length > 0 && <p className={styles.geometryNotice}>{missingGeometry.length} matching {missingGeometry.length === 1 ? "region has" : "regions have"} no display outline. Use the selector or regional list to open every record.</p>}
      <details className={styles.mapNotes}>
        <summary>Approximate 2020 boundaries · Map source &amp; license</summary>
        <p>Approximate, simplified <strong>2020</strong> ADM2 outlines, not certified 2023 survey boundaries. Geometry is display-only: it is not an input to CIVX scores.</p>
        <p>Geometry: BPS, WFP and OCHA ROAP via <a href="https://www.geoboundaries.org/api/current/gbOpen/IDN/ADM2/" target="_blank" rel="noopener noreferrer">geoBoundaries IDN ADM2</a> · <a href="https://creativecommons.org/licenses/by/3.0/igo/" target="_blank" rel="noopener noreferrer">{geometry.source.license}</a>. Adapted and projected for display; no government endorsement.</p>
      </details>
    </section>
  );
}
