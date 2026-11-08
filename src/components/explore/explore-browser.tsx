"use client";

import Link from "next/link";
import { useState } from "react";
import type { CivxExploreRegionProduct2023 } from "@/lib/civx/product-view-types-2023";
import { formatScore, regionType } from "@/components/product/format";
import { WestJavaMap } from "./west-java-map";
import styles from "./explore.module.css";

const PAGE_SIZE = 9;

export function RegionTable({ regions }: { regions: readonly CivxExploreRegionProduct2023[] }) {
  return <div className="product-table-wrap" role="region" aria-label="Tabel daftar wilayah" tabIndex={0}><table className={`product-table ${styles.table}`}>
    <caption className="civx-sr-only">Daftar wilayah CIVX 2023 dalam urutan kode BPS</caption>
    <thead><tr><th scope="col">Wilayah</th><th scope="col">Jenis</th><th scope="col" className="numeric">Skor CIVX</th><th scope="col">Tekanan relatif</th><th scope="col">Aksi</th></tr></thead>
    <tbody>{regions.map(view => <tr key={view.region.id}>
      <th scope="row"><Link href={`/regions/${view.region.id}`}>{view.region.name}</Link></th>
      <td>{regionType(view.region.type)}</td>
      <td className={`numeric ${styles.score}`}>{formatScore(view.core.overallScore)}</td>
      <td><div className={styles.pressure} aria-hidden="true"><span style={{width:`${view.core.overallScore}%`}} /></div><span className="product-caption">Kohort Jawa Barat 2023</span></td>
      <td><Link className={styles.detailLink} href={`/regions/${view.region.id}`} aria-label={`Detail ${view.region.name}`}>Detail <span aria-hidden="true">↗</span></Link></td>
    </tr>)}</tbody>
  </table></div>;
}

export function ExploreBrowser({ regions, initialSearch = "" }: { regions: readonly CivxExploreRegionProduct2023[]; initialSearch?: string }) {
  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [dimensionId, setDimensionId] = useState("");
  const query = search.trim().toLocaleLowerCase("id");
  const filtered = regions.filter(view => (type === "all" || view.region.type === type) && view.region.name.toLocaleLowerCase("id").includes(query));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRegions = filtered.slice(start, start + PAGE_SIZE);
  const clear = () => { setSearch(""); setType("all"); setPage(1); };
  return <>
    <div className={styles.filters} role="search" aria-label="Filter daftar wilayah">
      <div className={styles.search}><label className="civx-sr-only" htmlFor="explore-query">Cari kabupaten atau kota</label><input id="explore-query" type="search" placeholder="Cari kabupaten atau kota…" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} aria-controls="region-results" /></div>
      <div><label className="civx-sr-only" htmlFor="explore-type">Jenis wilayah</label><select id="explore-type" value={type} onChange={event => { setType(event.target.value); setPage(1); }} aria-controls="region-results"><option value="all">Semua jenis</option><option value="kabupaten">Kabupaten</option><option value="kota">Kota</option></select></div>
      <button type="button" onClick={clear}>Atur ulang</button>
    </div>
    <WestJavaMap regions={regions} visibleIds={filtered.map(view => view.region.id)} dimensionId={dimensionId} onDimensionChangeAction={setDimensionId} />
    <section className="product-section" id="region-results" aria-labelledby="regions-title">
      <div className={styles.resultsHeading}><h2 className="product-section-title" id="regions-title">Daftar wilayah</h2><p className="product-caption" role="status">{filtered.length ? `${start + 1}–${start + pageRegions.length} dari ${filtered.length}` : "0"} wilayah · {regions.length} wilayah dalam model · urutan kode BPS</p></div>
      {filtered.length ? <>
        <RegionTable regions={pageRegions} />
        <nav className={styles.pagination} aria-label="Halaman daftar wilayah">
          <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-controls="region-results">Sebelumnya</button>
          <div>{Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} type="button" aria-label={`Halaman ${number}`} aria-current={number === currentPage ? "page" : undefined} aria-controls="region-results" onClick={() => setPage(number)}>{number}</button>)}</div>
          <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} aria-controls="region-results">Berikutnya</button>
        </nav>
      </> : <div className="product-card"><h3>Tidak ada wilayah yang cocok</h3><p>Coba nama lain atau hapus filter jenis wilayah.</p><button className="civx-button civx-button-secondary" type="button" onClick={clear}>Atur ulang pencarian</button></div>}
    </section>
  </>;
}
