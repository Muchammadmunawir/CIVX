import geometry from "../../../data/geography/jabar-adm2-2020.json";
import styles from "./region-silhouette.module.css";

const shapesById = new Map(geometry.regions.map(shape => [shape.id, shape]));

/** The geographic helper emits absolute M/L polygon vertices, including every island and ring. */
export function tightViewBox(path: string): string | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of path.matchAll(/[ML](-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g)) {
    const x = Number(point[1]);
    const y = Number(point[2]);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  const width = maxX - minX;
  const height = maxY - minY;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  const padding = Math.max(width, height) * 0.04;
  return `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;
}

export function RegionSilhouette({ regionId, regionName }: { regionId: string; regionName: string }) {
  const shape = shapesById.get(regionId);
  const viewBox = shape ? tightViewBox(shape.path) : null;
  if (!shape || !viewBox) return <p className={styles.unavailable}>Bentuk wilayah belum tersedia.</p>;

  return <figure className={styles.silhouette}>
    <svg viewBox={viewBox} className={styles.svg} aria-hidden="true" focusable="false">
      <path d={shape.path} fillRule="evenodd" vectorEffect="non-scaling-stroke" />
    </svg>
    <figcaption>
      <span><span className="civx-sr-only">{regionName} · </span>Batas perkiraan 2020, untuk orientasi.</span>
      <details className={styles.credits}>
        <summary>Sumber peta</summary>
        <p>BPS, WFP, OCHA ROAP melalui <a href="https://www.geoboundaries.org/api/current/gbOpen/IDN/ADM2/" target="_blank" rel="noopener noreferrer">geoBoundaries<span className="civx-sr-only"> (buka tab baru)</span></a> · <a href="https://creativecommons.org/licenses/by/3.0/igo/" target="_blank" rel="noopener noreferrer">{geometry.source.license}<span className="civx-sr-only"> (buka tab baru)</span></a>. Geometri bukan masukan skor atau batas resmi 2023.</p>
      </details>
    </figcaption>
  </figure>;
}
