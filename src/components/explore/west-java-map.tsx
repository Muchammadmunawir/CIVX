"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type CSSProperties } from "react";
import geometry from "../../../data/geography/jabar-adm2-2020.json";
import type { CivxExploreRegionProduct2023 } from "@/lib/civx/product-view-types-2023";
import { formatScore, regionType } from "@/components/product/format";
import styles from "./map.module.css";

const pathsById = new Map(geometry.regions.map(shape => [shape.id, shape.path]));
type MapStyle = CSSProperties & { "--map-pressure"?: string; "--map-missing"?: string };

export function WestJavaMap({ regions, visibleIds, home = false, dimensionId = "", onDimensionChangeAction }: {
  regions: readonly CivxExploreRegionProduct2023[]; visibleIds?: readonly string[]; home?: boolean;
  dimensionId?: string; onDimensionChangeAction?: (dimensionId: string) => void;
}) {
  const router = useRouter();
  const id = useId();
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const visible = regions.filter(view => !visibleIds || visibleIds.includes(view.region.id));
  const active = visible.find(view => view.region.id === inspectedId) ?? visible[0];
  const dimensions = regions[0]?.core.dimensions ?? [];
  const layer = dimensions.find(dimension => dimension.dimensionId === dimensionId);
  const activeDimension = active?.core.dimensions.find(dimension => dimension.dimensionId === dimensionId);
  const activeScore = dimensionId ? activeDimension?.score : active?.core.overallScore;
  const layerLabel = dimensionId ? layer?.displayName ?? "Dimensi tidak tersedia" : "Skor Keseluruhan CIVX";
  const scoreLabel = dimensionId ? `Skor ${layerLabel}` : layerLabel;
  return <section className={`${styles.section} ${home ? styles.home : ""}`} aria-labelledby={`${id}-title`}>
    <div className={styles.heading}><h2 id={`${id}-title`}>{home ? <>Peta wilayah <strong>Jawa Barat</strong></> : "Peta Jawa Barat"}</h2>{!home && <span className="product-tag">{visible.length} kabupaten / kota</span>}</div>
    {onDimensionChangeAction && <div className={styles.layerControl}>
      <label htmlFor={`${id}-layer`}>Lapisan peta</label>
      <select id={`${id}-layer`} value={dimensionId} onChange={event => onDimensionChangeAction(event.target.value)} aria-controls={`${id}-map`} aria-describedby={`${id}-legend`}>
        <option value="">Skor Keseluruhan CIVX</option>
        {dimensions.map(dimension => <option key={dimension.dimensionId} value={dimension.dimensionId}>{dimension.displayName}</option>)}
      </select>
    </div>}
    <div className={styles.grid}>
      <aside className={styles.inspection} aria-label="Ringkasan wilayah pada peta">
        <label htmlFor={`${id}-select`}>Pilih wilayah</label>
        <select id={`${id}-select`} value={active?.region.id ?? ""} disabled={!visible.length} onChange={event => setInspectedId(event.target.value)}>
          {!visible.length && <option value="">Tidak ada wilayah</option>}
          {visible.map(view => <option value={view.region.id} key={view.region.id}>{view.region.name}</option>)}
        </select>
        {active && <div className={styles.record}>
          <p className="product-caption">{regionType(active.region.type)} · Jawa Barat</p>
          <h3>{active.region.name}</h3>
          <span className={styles.score}>{activeScore === undefined ? "Tidak tersedia" : <>{formatScore(activeScore)} <small>/ 100</small></>}</span>
          <p className={`product-caption ${styles.scoreDescription}`} role="status">{scoreLabel} 2023<span className="civx-sr-only"> · {activeScore === undefined ? "Skor tidak tersedia" : `${formatScore(activeScore)} dari 100`}</span> · tekanan relatif dalam kohort Jawa Barat.</p>
          <Link className="civx-button civx-button-primary" href={`/regions/${active.region.id}`}>Lihat detail wilayah <span aria-hidden="true">↗</span></Link>
        </div>}
        {!home && <div className={styles.note}>Skor lebih tinggi berarti tekanan relatif lebih tinggi, bukan penilaian absolut kualitas wilayah.</div>}
      </aside>
      <div className={styles.mapArea}>
        <svg id={`${id}-map`} viewBox={geometry.viewBox} className={styles.svg} role="group" aria-label={`Peta interaktif 27 kabupaten/kota Jawa Barat · ${layerLabel} 2023`} aria-describedby={`${id}-legend`}>
          <title>{`Jawa Barat · ${layerLabel} 2023`}</title>
          <desc>Batas perkiraan 2020 untuk orientasi. Warna menunjukkan tekanan relatif pada skala tetap 0–100. Bukan klasifikasi resmi, ukuran stres individu, atau rekomendasi kebijakan. Setiap wilayah membuka detail CIVX 2023. Pilihan wilayah dan daftar Jelajah menyediakan akses tanpa peta.</desc>
          <defs><pattern id={`${id}-missing`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" className={styles.missingGround} /><line x1="0" y1="0" x2="0" y2="7" className={styles.missingStripe} /></pattern></defs>
          {regions.map(view => {
            const path = pathsById.get(view.region.id);
            if (!path) return null;
            const shown = !visibleIds || visibleIds.includes(view.region.id);
            const dimension = view.core.dimensions.find(item => item.dimensionId === dimensionId);
            const score = dimensionId ? dimension?.score : view.core.overallScore;
            const scoreDescription = score === undefined ? `${scoreLabel} tidak tersedia` : `${scoreLabel} 2023 ${formatScore(score)} dari 100`;
            return <a key={view.region.id} href={`/regions/${view.region.id}`} className={styles.region} data-active={active?.region.id === view.region.id} data-visible={shown} data-layer={dimensionId ? "dimension" : "overall"} data-unavailable={score === undefined} style={(score === undefined ? { "--map-missing": `url(#${id}-missing)` } : { "--map-pressure": `${score}%` }) as MapStyle} tabIndex={shown ? 0 : -1} aria-hidden={!shown} aria-label={`${view.region.name}, ${scoreDescription}. Buka detail wilayah.`}
              onFocus={() => setInspectedId(view.region.id)} onMouseEnter={() => { if (shown) setInspectedId(view.region.id); }}
              onClick={event => {
                if (!shown || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault(); router.push(`/regions/${view.region.id}`);
              }}>
              <title>{`${view.region.name} · ${scoreDescription}`}</title>
              <path d={path} fillRule="evenodd" vectorEffect="non-scaling-stroke" />
            </a>;
          })}
        </svg>
        {!visible.length && <p className={styles.empty}>Tidak ada wilayah yang cocok. Atur ulang pencarian.</p>}
        <div id={`${id}-legend`} className={styles.legend}>
          <strong>{layerLabel} · Tekanan relatif 2023</strong>
          <div className={styles.colorRamp} aria-hidden="true" />
          <div className={styles.scaleLabels}><span>0 · Lebih rendah</span><span>100 · Lebih tinggi</span></div>
          <p>Warna semakin kuat menunjukkan tekanan relatif lebih tinggi dalam kohort tetap 27 kabupaten/kota Jawa Barat tahun 2023.{!home && " Filter tidak mengubah skala."}</p>
          <p>0 bukan tanpa tekanan; 100 bukan maksimum dampak. Bukan klasifikasi resmi atau rekomendasi kebijakan. <Link className="civx-text-link" href="/methodology">Pahami metodologi CIVX</Link>.</p>
          {visible.length < regions.length && <p className={styles.excludedLegend}><span aria-hidden="true" />Abu-abu: wilayah di luar filter, bukan skor nol.</p>}
          {regions.some(view => dimensionId ? !view.core.dimensions.some(dimension => dimension.dimensionId === dimensionId) : view.core.overallScore === undefined) && <p className={styles.missingLegend}><span aria-hidden="true" />Arsir: skor tidak tersedia, bukan skor nol.</p>}
        </div>
      </div>
    </div>
    <details className={styles.credits}><summary>Batas perkiraan 2020 · sumber dan lisensi peta</summary><p>Geometri adaptasi untuk orientasi, bukan batas resmi 2023 atau masukan skor CIVX. BPS, WFP, dan OCHA ROAP melalui <a className="civx-text-link" href="https://www.geoboundaries.org/api/current/gbOpen/IDN/ADM2/" target="_blank" rel="noopener noreferrer">geoBoundaries</a> · <a className="civx-text-link" href="https://creativecommons.org/licenses/by/3.0/igo/" target="_blank" rel="noopener noreferrer">{geometry.source.license}</a>. Tidak menyiratkan dukungan pemerintah.</p><Link className="civx-text-link" href="/explore#region-results">Akses semua wilayah melalui daftar</Link></details>
  </section>;
}
