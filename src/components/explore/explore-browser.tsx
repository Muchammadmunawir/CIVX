"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { CivxExploreRegionProduct2023 } from "@/lib/civx/product-view-types-2023";
import { formatScore, regionType } from "@/components/product/format";
import { WestJavaMap } from "./west-java-map";
import { CsvDownload } from "./csv-download";
import { readExploreUrlState, updateExploreUrl, type ExploreUrlState } from "./explore-url-state";
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

export function ExploreBrowser({ regions, initialState = { q: "", type: "all", layer: "" } }: {
  regions: readonly CivxExploreRegionProduct2023[];
  initialState?: ExploreUrlState;
}) {
  const searchParams = useSearchParams();
  const queryString = searchParams?.toString();
  const [previousQuery, setPreviousQuery] = useState(queryString);
  const [browser, setBrowser] = useState(() => ({
    filters: searchParams ? readExploreUrlState(searchParams, regions[0]?.core.dimensions.map(dimension => dimension.dimensionId) ?? []) : initialState,
    page: 1,
  }));
  const editingSearch = useRef(false);
  // Adjust before rendering children, so native history and same-route Links share one URL source.
  if (queryString !== previousQuery) {
    setPreviousQuery(queryString);
    const filters = searchParams ? readExploreUrlState(searchParams, regions[0]?.core.dimensions.map(dimension => dimension.dimensionId) ?? []) : initialState;
    setBrowser(current => ({
      filters,
      page: filters.q !== current.filters.q || filters.type !== current.filters.type ? 1 : current.page,
    }));
  }
  useEffect(() => {
    const endSearchSession = () => { editingSearch.current = false; };
    window.addEventListener("popstate", endSearchSession);
    return () => window.removeEventListener("popstate", endSearchSession);
  }, []);

  const { q: search, type, layer: dimensionId } = browser.filters;
  const query = search.trim().toLocaleLowerCase("id");
  const filtered = regions.filter(view => (type === "all" || view.region.type === type) && view.region.name.toLocaleLowerCase("id").includes(query));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(browser.page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRegions = filtered.slice(start, start + PAGE_SIZE);
  const activeFilterCount = Number(Boolean(query)) + Number(type !== "all");
  const range = filtered.length ? `${start + 1}–${start + pageRegions.length} dari ${filtered.length}` : "0";

  const update = (patch: Partial<ExploreUrlState>, history: "push" | "replace" = "push") => {
    const layerIds = regions[0]?.core.dimensions.map(dimension => dimension.dimensionId) ?? [];
    const href = updateExploreUrl(window.location.href, patch, layerIds);
    const filters = readExploreUrlState(new URL(href, window.location.origin).searchParams, layerIds);
    setBrowser(current => ({
      filters,
      page: filters.q !== current.filters.q || filters.type !== current.filters.type ? 1 : current.page,
    }));
    if (href !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      if (history === "replace") window.history.replaceState(null, "", href);
      else window.history.pushState(null, "", href);
    }
  };
  const clear = () => { editingSearch.current = false; update({ q: "", type: "all" }); setBrowser(current => ({ ...current, page: 1 })); };
  const setPage = (page: number) => setBrowser(current => ({ ...current, page }));

  return <>
    <div className={styles.filters} role="search" aria-label="Filter daftar wilayah">
      <div className={styles.search}><label htmlFor="explore-query">Cari wilayah</label><input id="explore-query" type="search" placeholder="Cari kabupaten atau kota…" value={search} onChange={event => {
        // One undoable search session, not one history entry for every keystroke.
        update({ q: event.target.value }, editingSearch.current ? "replace" : "push");
        editingSearch.current = true;
      }} onBlur={() => { editingSearch.current = false; }} onKeyDown={event => { if (event.key === "Enter") editingSearch.current = false; }} aria-controls="region-results" /></div>
      <div><label htmlFor="explore-type">Jenis wilayah</label><select id="explore-type" value={type} onChange={event => { editingSearch.current = false; update({ type: event.target.value === "kabupaten" ? "kabupaten" : event.target.value === "kota" ? "kota" : "all" }); }} aria-controls="region-results"><option value="all">Semua jenis</option><option value="kabupaten">Kabupaten</option><option value="kota">Kota</option></select></div>
      <button className="civx-button civx-button-secondary" type="button" onClick={clear} aria-describedby="explore-reset-hint">Hapus filter</button>
    </div>
    <div className={styles.filterFeedback}>
      <div role="status" aria-atomic="true">
        <p className={styles.filterSummary}><strong>{activeFilterCount ? `${activeFilterCount} filter aktif` : "Tanpa filter pencarian atau jenis"}</strong>{query && <span className={styles.filterTag}>Pencarian: “{search.trim()}”</span>}{type !== "all" && <span className={styles.filterTag}>Jenis: {regionType(type)}</span>}</p>
        <p className="product-caption">{filtered.length} dari {regions.length} wilayah cocok · Peta dan daftar memakai filter yang sama. Daftar: {range} wilayah.</p>
      </div>
      <p className="product-caption" id="explore-reset-hint">Hapus filter hanya mengosongkan pencarian dan jenis wilayah. Lapisan peta dan pilihan wilayah tidak dihapus.</p>
      <a className={`civx-text-link ${styles.resultsShortcut}`} href="#region-results">Lihat daftar wilayah ({filtered.length}) <span aria-hidden="true">↓</span></a>
    </div>
    <div className={styles.mapReveal} data-reveal><WestJavaMap regions={regions} visibleIds={filtered.map(view => view.region.id)} dimensionId={dimensionId} onDimensionChangeAction={layer => { editingSearch.current = false; update({ layer }); }} /></div>
    <section className={`product-section ${styles.results}`} id="region-results" aria-labelledby="regions-title" tabIndex={-1} data-reveal>
      <div className={styles.resultsHeading}><h2 className="product-section-title" id="regions-title">Daftar wilayah</h2><p className="product-caption">{range} wilayah · {regions.length} wilayah dalam model · urutan kode BPS</p></div>
      <CsvDownload regions={filtered.map(view => view.region)} />
      {filtered.length ? <>
        <RegionTable regions={pageRegions} />
        <nav className={styles.pagination} aria-label="Halaman daftar wilayah">
          <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-controls="region-results">Sebelumnya</button>
          <div>{Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} type="button" aria-label={`Halaman ${number}`} aria-current={number === currentPage ? "page" : undefined} aria-controls="region-results" onClick={() => setPage(number)}>{number}</button>)}</div>
          <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} aria-controls="region-results">Berikutnya</button>
        </nav>
      </> : <div className="product-card"><h3>Tidak ada wilayah yang cocok</h3><p>Coba nama lain atau hapus filter pencarian dan jenis wilayah. Lapisan peta tetap dipertahankan.</p><button className="civx-button civx-button-secondary" type="button" onClick={clear}>Hapus filter</button></div>}
    </section>
  </>;
}
