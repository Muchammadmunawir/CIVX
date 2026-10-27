"use client";

import { useState } from "react";
import { RegionList } from "@/components/data/region-list";
import { RegionDiscovery, type SortOrder } from "@/components/explore/region-discovery";
import { getPublishedContext } from "@/lib/civx/coverage";
import type { RegionalData } from "@/lib/civx/types";
import styles from "./explore.module.css";

const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const categories = [
  { key: "lower", label: "Lower" },
  { key: "moderate", label: "Moderate" },
  { key: "higher", label: "Higher" },
] as const;

export function ExploreBrowser({ regions }: { regions: RegionalData[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOrder>("score-desc");
  const { ordered, median, positionById } = getPublishedContext(regions);
  const query = search.trim().toLocaleLowerCase();
  const filteredRegions = ordered.filter((region) =>
    !query || region.name.toLocaleLowerCase().includes(query) || region.id.includes(query),
  );
  if (sort === "name") {
    filteredRegions.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "score-asc") {
    filteredRegions.sort((a, b) => {
      if (a.civicIndex.status !== "available" || b.civicIndex.status !== "available") return 0;
      return a.civicIndex.score - b.civicIndex.score || a.name.localeCompare(b.name);
    });
  }

  return (
    <section className={`civx-container ${styles.results}`} aria-labelledby="regions-title">
      <div className={styles.resultsHeading}>
        <div>
          <span className="civx-eyebrow">Published / {ordered.length} records</span>
          <h2 id="regions-title">Regional results</h2>
        </div>
        <p>Select a card to examine the observations, calculation and BPS evidence. Positions are within published CIVX model scores, not a BPS ranking.</p>
      </div>
      {ordered.length >= 3 && median !== null && (
        <section className={styles.distribution} aria-label="Published CIVX relative pressure distribution">
          <div className={styles.distributionIntro}>
            <span className="civx-eyebrow">Published-score context</span>
            <p>Median CIVX score <strong>{decimal.format(median)}/100</strong> across {ordered.length} published regions. Counts describe published CIVX model categories, not official BPS classifications or rankings.</p>
          </div>
          <ul className={styles.distributionList}>
            {categories.map(({ key, label }) => {
              const count = ordered.filter((region) => region.category === key).length;
              return (
                <li key={key}>
                  <div className={styles.distributionLabel}><span>{label} relative pressure</span><strong>{count}</strong></div>
                  <span className={styles.distributionTrack} aria-hidden="true"><span style={{ width: `${count / ordered.length * 100}%` }} /></span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <RegionDiscovery
        totalCount={ordered.length}
        filteredCount={filteredRegions.length}
        search={search}
        sort={sort}
        onSearchChange={setSearch}
        onSortChange={setSort}
      />
      <div id="region-results">
        {filteredRegions.length ? (
          <RegionList regions={filteredRegions} positionById={positionById} publishedCount={ordered.length} />
        ) : (
          <div className={styles.emptyState}>
            <span className="civx-eyebrow">No results</span>
            <h3>{ordered.length ? `No published region matches “${search.trim()}”.` : "No regional scores are published yet."}</h3>
            <p>{ordered.length ? "Search by a region name or its four-digit ID, or clear your search to see the published records." : "Regions will appear here when their four required indicator inputs are eligible for publication."}</p>
            {ordered.length > 0 && <button type="button" onClick={() => setSearch("")}>Clear search</button>}
          </div>
        )}
      </div>
    </section>
  );
}
