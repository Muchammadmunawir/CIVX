"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import geometry from "../../../data/geography/jabar-adm2-2020.json";
import type { CivxExploreRegionProduct2023 } from "@/lib/civx/product-view-types-2023";
import { formatScore, regionType } from "@/components/product/format";
import styles from "./map.module.css";

const pathsById = new Map(geometry.regions.map(shape => [shape.id, shape.path]));

export function WestJavaMap({ regions, visibleIds, home = false }: {
  regions: readonly CivxExploreRegionProduct2023[]; visibleIds?: readonly string[]; home?: boolean;
}) {
  const router = useRouter();
  const id = useId();
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const visible = regions.filter(view => !visibleIds || visibleIds.includes(view.region.id));
  const active = visible.find(view => view.region.id === inspectedId) ?? visible[0];
  return <section className={`${styles.section} ${home ? styles.home : ""}`} aria-labelledby={`${id}-title`}>
    <div className={styles.heading}><h2 id={`${id}-title`}>{home ? <>Peta wilayah <strong>Jawa Barat</strong></> : "Peta Jawa Barat"}</h2>{!home && <span className="product-tag">{visible.length} kabupaten / kota</span>}</div>
    <div className={styles.grid}>
      <div className={styles.mapArea}>
        <svg viewBox={geometry.viewBox} className={styles.svg} role="group" aria-label="Peta interaktif 27 kabupaten/kota Jawa Barat">
          <title>Jawa Barat · CIVX 2023</title>
          <desc>Batas perkiraan 2020 untuk orientasi. Setiap wilayah membuka detail CIVX 2023. Pilihan wilayah dan daftar Jelajah menyediakan akses tanpa peta.</desc>
          {regions.map(view => {
            const path = pathsById.get(view.region.id);
            if (!path) return null;
            const shown = !visibleIds || visibleIds.includes(view.region.id);
            return <a key={view.region.id} href={`/regions/${view.region.id}`} className={styles.region} data-active={active?.region.id === view.region.id} data-visible={shown} tabIndex={shown ? 0 : -1} aria-hidden={!shown} aria-label={`${view.region.name}, Skor CIVX 2023 ${formatScore(view.core.overallScore)} dari 100. Buka detail wilayah.`}
              onFocus={() => setInspectedId(view.region.id)} onMouseEnter={() => { if (shown) setInspectedId(view.region.id); }}
              onClick={event => {
                if (!shown || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault(); router.push(`/regions/${view.region.id}`);
              }}>
              <title>{`${view.region.name} · CIVX ${formatScore(view.core.overallScore)}`}</title>
              <path d={path} fillRule="evenodd" vectorEffect="non-scaling-stroke" />
            </a>;
          })}
        </svg>
        {!visible.length && <p className={styles.empty}>Tidak ada wilayah yang cocok. Atur ulang pencarian.</p>}
        <p className={styles.legend}><span aria-hidden="true" />Batas wilayah · warna tidak menunjukkan kategori tekanan.</p>
      </div>
      <aside className={styles.inspection} aria-label="Ringkasan wilayah pada peta">
        <label htmlFor={`${id}-select`}>Pilih wilayah</label>
        <select id={`${id}-select`} value={active?.region.id ?? ""} disabled={!visible.length} onChange={event => setInspectedId(event.target.value)}>
          {!visible.length && <option value="">Tidak ada wilayah</option>}
          {visible.map(view => <option value={view.region.id} key={view.region.id}>{view.region.name}</option>)}
        </select>
        {active && <div className={styles.record}>
          <p className="product-caption">{regionType(active.region.type)} · Jawa Barat</p>
          <h3>{active.region.name}</h3>
          <span className={styles.score}>{formatScore(active.core.overallScore)} <small>/ 100</small></span>
          <p className="product-caption">Skor CIVX 2023 · tekanan relatif dalam kohort Jawa Barat.</p>
          <Link className="civx-button civx-button-primary" href={`/regions/${active.region.id}`}>Lihat detail wilayah <span aria-hidden="true">↗</span></Link>
        </div>}
        {!home && <div className={styles.note}>Skor lebih tinggi berarti tekanan relatif lebih tinggi, bukan penilaian absolut kualitas wilayah.</div>}
      </aside>
    </div>
    <details className={styles.credits}><summary>Batas perkiraan 2020 · sumber dan lisensi peta</summary><p>Geometri adaptasi untuk orientasi, bukan batas resmi 2023 atau masukan skor CIVX. BPS, WFP, dan OCHA ROAP melalui <a className="civx-text-link" href="https://www.geoboundaries.org/api/current/gbOpen/IDN/ADM2/" target="_blank" rel="noopener noreferrer">geoBoundaries</a> · <a className="civx-text-link" href="https://creativecommons.org/licenses/by/3.0/igo/" target="_blank" rel="noopener noreferrer">{geometry.source.license}</a>. Tidak menyiratkan dukungan pemerintah.</p><Link className="civx-text-link" href="/explore#region-results">Akses semua wilayah melalui daftar</Link></details>
  </section>;
}
