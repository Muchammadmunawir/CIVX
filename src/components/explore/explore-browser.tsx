"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { CivxExploreRegionProduct2023 } from "@/lib/civx/product-view-types-2023";
import { formatScore, regionType } from "@/components/product/format";
import { INDEX_STATUSES, rankRegions, type RankedRegion } from "@/components/product/index-status";
import { WestJavaMap } from "./west-java-map";
import styles from "./explore.module.css";

const PAGE_SIZE = 8;

export function RegionTable({ rows, descending = true, onToggleSort }: {
  rows: readonly RankedRegion[]; descending?: boolean; onToggleSort?: () => void;
}) {
  return <div className="product-table-wrap" role="region" aria-label="Tabel peringkat wilayah" tabIndex={0}><table className={`product-table ${styles.table}`}>
    <caption className="civx-sr-only">Peringkat deskriptif wilayah berdasarkan indeks CIVX 2023</caption>
    <thead><tr>
      <th scope="col">Peringkat</th>
      <th scope="col">Wilayah</th>
      <th scope="col">Jenis</th>
      <th scope="col" aria-sort={descending ? "descending" : "ascending"}>
        <button type="button" className={styles.sortButton} onClick={onToggleSort} aria-label={`Urutkan indeks ${descending ? "dari terendah" : "dari tertinggi"}`}>Indeks <span aria-hidden="true">{descending ? "↓" : "↑"}</span></button>
      </th>
      <th scope="col">Status</th>
      <th scope="col">Keterangan</th>
      <th scope="col"><span className="civx-sr-only">Aksi</span></th>
    </tr></thead>
    <tbody>{rows.map(row => <tr key={row.view.region.id}>
      <td className={styles.rank}>{String(row.rank).padStart(2, "0")}</td>
      <th scope="row"><Link href={`/regions/${row.view.region.id}`}>{row.view.region.name}</Link></th>
      <td className={styles.muted}>{regionType(row.view.region.type)}</td>
      <td className={styles.score}>{formatScore(row.index)}</td>
      <td><span className={styles.statusPill} data-tone={row.status.tone}>{row.status.label}</span></td>
      <td className={styles.muted}>{row.challenge ? `Tantangan: ${row.challenge}` : "—"}</td>
      <td><Link className={styles.chevron} href={`/regions/${row.view.region.id}`} aria-label={`Detail ${row.view.region.name}`}><span aria-hidden="true">›</span></Link></td>
    </tr>)}</tbody>
  </table></div>;
}

function HighlightCard({ row, label, tone, description, action }: {
  row: RankedRegion; label: string; tone: "good" | "bad"; description: string; action: ReactNode;
}) {
  return <article className={`product-card ${styles.highlight}`}>
    <span className={styles.highlightTag} data-tone={tone}>{label}</span>
    <h3>{row.view.region.name}</h3>
    <p className={styles.highlightScore}><strong>{formatScore(row.index)}</strong> <small>/ 100</small></p>
    <p className={styles.highlightText}>{description}</p>
    {action}
  </article>;
}

export function ExploreBrowser({ regions, initialSearch = "" }: { regions: readonly CivxExploreRegionProduct2023[]; initialSearch?: string }) {
  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [descending, setDescending] = useState(true);
  const [page, setPage] = useState(1);

  const ranked = rankRegions(regions);
  const best = ranked[0];
  const priority = ranked[ranked.length - 1];
  const query = search.trim().toLocaleLowerCase("id");
  const matches = ranked.filter(row =>
    (type === "all" || row.view.region.type === type)
    && (status === "all" || row.status.id === status)
    && row.view.region.name.toLocaleLowerCase("id").includes(query));
  const ordered = descending ? matches : [...matches].reverse();
  const pageCount = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = ordered.slice(start, start + PAGE_SIZE);
  const clear = () => { setSearch(""); setType("all"); setStatus("all"); setPage(1); };
  const indexLabel = (view: CivxExploreRegionProduct2023) => `Indeks ${formatScore(100 - view.core.overallScore)} dari 100`;

  return <>
    <div className={styles.filters} role="search" aria-label="Filter wilayah">
      <div className={styles.search}><label className="civx-sr-only" htmlFor="explore-query">Cari kabupaten atau kota</label><input id="explore-query" type="search" placeholder="Cari kabupaten atau kota…" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} aria-controls="region-results" /></div>
      <div><label className="civx-sr-only" htmlFor="explore-type">Jenis wilayah</label><select id="explore-type" value={type} onChange={event => { setType(event.target.value); setPage(1); }} aria-controls="region-results"><option value="all">Semua jenis</option><option value="kabupaten">Kabupaten</option><option value="kota">Kota</option></select></div>
      <div><label className="civx-sr-only" htmlFor="explore-status">Status wilayah</label><select id="explore-status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} aria-controls="region-results"><option value="all">Semua status</option>{INDEX_STATUSES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
      <div><label className="civx-sr-only" htmlFor="explore-period">Periode</label><select id="explore-period" defaultValue="2023"><option value="2023">Periode 2023</option></select></div>
      <button type="button" className={styles.reset} onClick={clear}>Atur ulang</button>
    </div>

    <div className={styles.mapGrid}>
      <section className={`product-card ${styles.mapCard}`} aria-labelledby="explore-map-title">
        <div className={styles.mapHead}>
          <h2 className="product-section-title" id="explore-map-title">Peta Jawa Barat</h2>
          <span className="product-tag">{matches.length} kabupaten / kota</span>
        </div>
        <p className={styles.mapCaption}>Pilih wilayah untuk melihat ringkasan dan rincian indeks.</p>
        <WestJavaMap regions={regions} visibleIds={matches.map(row => row.view.region.id)} bare labelFor={indexLabel} />
        <p className={styles.legend}><span aria-hidden="true" />Batas wilayah · warna tidak menunjukkan kategori indeks</p>
      </section>
      <div className={styles.side}>
        <HighlightCard row={best} label="Performa terbaik" tone="good" description="Wilayah dengan indeks tertinggi di Jawa Barat."
          action={<Link className="civx-button civx-button-primary" href={`/regions/${best.view.region.id}`}>Lihat detail wilayah</Link>} />
        <HighlightCard row={priority} label="Butuh prioritas" tone="bad" description="Mulai penelusuran untuk memahami indikator yang perlu diperhatikan."
          action={<Link className={`civx-button civx-button-secondary ${styles.outlineButton}`} href={{ pathname: "/compare", query: { a: best.view.region.id, b: priority.view.region.id } }}>Bandingkan wilayah <span aria-hidden="true">›</span></Link>} />
        <div className={styles.mapNotice}><span aria-hidden="true">i</span><p>Peta memakai batas perkiraan 2020 untuk orientasi, bukan batas resmi 2023. Sumber: <a href="https://www.geoboundaries.org/api/current/gbOpen/IDN/ADM2/" target="_blank" rel="noopener noreferrer">geoBoundaries</a> · <a href="https://creativecommons.org/licenses/by/3.0/igo/" target="_blank" rel="noopener noreferrer">CC BY 3.0 IGO</a>.</p></div>
      </div>
    </div>

    <section className="product-section" id="region-results" aria-labelledby="regions-title">
      <div className={styles.resultsHeading}>
        <h2 className="product-section-title" id="regions-title">Peringkat wilayah</h2>
        <p className="product-caption" role="status">{ordered.length ? `${start + 1}–${start + pageRows.length} dari ${ordered.length}` : "0"} wilayah · indeks {descending ? "tertinggi" : "terendah"} lebih dulu</p>
      </div>
      {ordered.length ? <div className={styles.tableCard}>
        <RegionTable rows={pageRows} descending={descending} onToggleSort={() => { setDescending(!descending); setPage(1); }} />
        <nav className={styles.pagination} aria-label="Halaman peringkat wilayah">
          <div>{Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} type="button" aria-label={`Halaman ${number}`} aria-current={number === currentPage ? "page" : undefined} aria-controls="region-results" onClick={() => setPage(number)}>{number}</button>)}</div>
          {currentPage > 1 && <button type="button" className={styles.pageStep} onClick={() => setPage(currentPage - 1)} aria-controls="region-results"><span aria-hidden="true">‹</span> Sebelumnya</button>}
          <button type="button" className={styles.pageStep} disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} aria-controls="region-results">Selanjutnya <span aria-hidden="true">›</span></button>
        </nav>
      </div> : <div className="product-card"><h3>Tidak ada wilayah yang cocok</h3><p>Coba nama lain atau hapus filter jenis dan status.</p><button className="civx-button civx-button-secondary" type="button" onClick={clear}>Atur ulang pencarian</button></div>}
      <p className={`product-caption ${styles.rankNote}`}>Peringkat bersifat deskriptif dalam kohort 27 wilayah tahun 2023, bukan peringkat resmi pemerintah. Indeks = 100 − skor tekanan relatif CIVX.</p>
    </section>
  </>;
}
