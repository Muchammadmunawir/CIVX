"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import styles from "./sources-page.module.css";

type SourceScope = "CORE" | "CONTEXT";

type SourceCard = {
  id: string;
  scope: SourceScope;
  dimension: string | null;
  searchText: string;
  card: ReactNode;
};

export function SourcesBrowser({ sources, dimensions, referenceYear }: {
  sources: readonly SourceCard[];
  dimensions: readonly string[];
  referenceYear: number;
}) {
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<"all" | SourceScope>("all");
  const [dimension, setDimension] = useState("");
  const query = search.trim().toLocaleLowerCase("id");
  const filtered = sources.filter((source) =>
    (scope === "all" || source.scope === scope)
    && (scope !== "CORE" || dimension === "" || source.dimension === dimension)
    && source.searchText.includes(query),
  );
  const core = filtered.filter((source) => source.scope === "CORE");
  const context = filtered.filter((source) => source.scope === "CONTEXT");
  const reset = () => { setSearch(""); setScope("all"); setDimension(""); };

  return <>
    <section className={`product-section ${styles.browser}`} aria-labelledby="source-search-title" data-reveal>
      <h2 id="source-search-title" className="product-section-title">Telusuri sumber</h2>
      <div className={styles.filters} role="search" aria-label="Cari dan filter sumber data">
        <div className={styles.search}>
          <label htmlFor="source-query">Cari sumber</label>
          <input id="source-query" type="search" placeholder="Judul, penerbit, atau dimensi…" value={search} onChange={(event) => setSearch(event.target.value)} aria-describedby="source-search-hint" aria-controls="source-results" />
        </div>
        <div className={styles.filterField}>
          <label htmlFor="source-scope">Kelompok sumber</label>
          <select id="source-scope" value={scope} onChange={(event) => { setScope(event.target.value as "all" | SourceScope); setDimension(""); }} aria-controls="source-results">
            <option value="all">Semua</option>
            <option value="CORE">CORE</option>
            <option value="CONTEXT">CONTEXT</option>
          </select>
        </div>
        {scope === "CORE" && <div className={styles.filterField}>
          <label htmlFor="source-dimension">Dimensi CORE</label>
          <select id="source-dimension" value={dimension} onChange={(event) => setDimension(event.target.value)} aria-controls="source-results">
            <option value="">Semua dimensi</option>
            {dimensions.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>}
        <button className={`civx-button civx-button-secondary ${styles.reset}`} type="button" onClick={reset}>Atur ulang</button>
      </div>
      <p id="source-search-hint" className={styles.searchHint}>Cari judul indikator atau dataset, nama penerbit, maupun dimensi. Filter dimensi hanya berlaku untuk CORE.</p>
      <p className={styles.resultCount} role="status" aria-atomic="true">Menampilkan {filtered.length} dari {sources.length} sumber · {core.length} CORE · {context.length} CONTEXT</p>
      <nav className={styles.directory} aria-label="Kelompok katalog sumber">
        {core.length > 0 && <a href="#sumber-core">Sumber CORE ({core.length})</a>}
        {context.length > 0 && <a href="#sumber-context">Sumber CONTEXT ({context.length})</a>}
        <a href="#penggunaan-sumber">Penggunaan sumber</a>
      </nav>
    </section>
    <div id="source-results">
      {core.length > 0 && <section className="product-section" aria-labelledby="sumber-core" data-reveal>
        <h2 id="sumber-core" className="product-section-title">Sumber indikator CORE <span className={styles.headingCount}>({core.length})</span></h2>
        <p className={styles.sectionIntro}>Indikator yang membentuk skor CIVX {referenceYear}. Buka rincian untuk definisi, keterbatasan, dan ketidakpastian tiap wilayah. Tahun terbit sumber dapat berbeda dari periode datanya.</p>
        <div className={styles.catalog}>{core.map((source) => <div key={source.id}>{source.card}</div>)}</div>
      </section>}
      {context.length > 0 && <section className="product-section" aria-labelledby="sumber-context" data-reveal>
        <h2 id="sumber-context" className="product-section-title">Katalog sumber CONTEXT <span className={styles.headingCount}>({context.length})</span></h2>
        <p className={styles.sectionIntro}>Data tambahan yang tidak masuk skor. Setiap dataset ditampilkan sekali, beserta periode asli dan cakupan wilayahnya. Data ini tidak digunakan untuk selisih atau peringkat antarwilayah.</p>
        <div className={styles.catalog}>{context.map((source) => <div key={source.id}>{source.card}</div>)}</div>
      </section>}
      {filtered.length === 0 && <section className={`product-section product-card ${styles.empty}`} aria-labelledby="source-empty-title" data-reveal>
        <h2 id="source-empty-title">Tidak ada sumber yang cocok</h2>
        <p>Coba judul, penerbit, atau dimensi lain. Atur ulang untuk melihat seluruh katalog CORE dan CONTEXT.</p>
        <button className="civx-button civx-button-secondary" type="button" onClick={reset}>Atur ulang pencarian</button>
      </section>}
    </div>
  </>;
}
