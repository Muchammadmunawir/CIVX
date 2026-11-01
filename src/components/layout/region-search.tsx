"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { CivxRegionProductHeader2023 } from "@/lib/civx/product-view-types-2023";

export function RegionSearch({ regions }: { regions: readonly CivxRegionProductHeader2023[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const id = useId();
  const matches = query.trim() ? regions.filter(region => region.name.toLocaleLowerCase("id").includes(query.trim().toLocaleLowerCase("id"))) : [];
  return <div className="region-search" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={event => { if (event.key === "Escape") setOpen(false); }}>
    <form action="/explore" role="search">
      <label className="civx-sr-only" htmlFor={id}>Cari wilayah</label>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg>
      <input id={id} name="q" type="search" placeholder="Cari wilayah…" autoComplete="off" value={query} onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setOpen(true); }} aria-describedby={open && query.trim() ? `${id}-results` : undefined} />
    </form>
    {open && query.trim() && <div className="region-search-results" id={`${id}-results`}>
      <p role="status">{matches.length ? `${matches.length} wilayah ditemukan` : "Tidak ada wilayah yang cocok"}</p>
      <ul>{matches.map(region => <li key={region.id}><Link href={`/regions/${region.id}`} onClick={() => { setOpen(false); setQuery(""); }}>{region.name}<span aria-hidden="true">↗</span></Link></li>)}</ul>
    </div>}
  </div>;
}
