"use client";

import { useMemo, useState } from "react";
import { RegionList } from "@/components/data/region-list";
import { RegionDiscovery, type CategoryFilter, type SortOrder } from "@/components/explore/region-discovery";
import { WestJavaMap } from "@/components/explore/west-java-map";
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
  const [category, setCategory] = useState<CategoryFilter>("all");
  const { ordered, median, positionById } = useMemo(() => getPublishedContext(regions), [regions]);
  const allRegions = useMemo(() => [
    ...ordered,
    ...regions.filter((region) => region.civicIndex.status !== "available"),
  ], [ordered, regions]);
  const filteredRegions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const filtered = allRegions.filter((region) =>
      (category === "all" || region.category === category) &&
      (!query || region.name.toLocaleLowerCase().includes(query) || region.id.includes(query)),
    );
    if (sort === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "score-asc") {
      filtered.sort((a, b) => {
        if (a.civicIndex.status !== "available") return b.civicIndex.status !== "available" ? a.name.localeCompare(b.name) : 1;
        if (b.civicIndex.status !== "available") return -1;
        return a.civicIndex.score - b.civicIndex.score || a.name.localeCompare(b.name);
      });
    }
    return filtered;
  }, [allRegions, category, search, sort]);
  const visibleIds = useMemo(() => new Set(filteredRegions.map((region) => region.id)), [filteredRegions]);
  const clearFilters = () => { setSearch(""); setCategory("all"); };

  return (
    <section className={`civx-container ${styles.results}`} aria-labelledby="regions-title">
      <RegionDiscovery
        totalCount={allRegions.length}
        filteredCount={filteredRegions.length}
        search={search}
        sort={sort}
        category={category}
        onSearchChange={setSearch}
        onSortChange={setSort}
        onCategoryChange={setCategory}
        onClear={clearFilters}
      />
      <WestJavaMap regions={allRegions} visibleIds={visibleIds} positionById={positionById} publishedCount={ordered.length} />
      {ordered.length >= 3 && median !== null && (
        <section className={styles.distribution} aria-label="Published CIVX relative pressure distribution">
          <div className={styles.distributionIntro}>
            <h2>Release distribution</h2>
            <p>Median <strong>{decimal.format(median)}/100</strong> · {ordered.length} published scores</p>
          </div>
          <ul className={styles.distributionList}>
            {categories.map(({ key, label }) => {
              const count = ordered.filter((region) => region.category === key).length;
              return (
                <li key={key} className={styles[`distribution${key}`]}>
                  <div className={styles.distributionLabel}><span>{label}</span><strong>{count}</strong></div>
                  <span className={styles.distributionTrack} aria-hidden="true"><span style={{ width: `${count / ordered.length * 100}%` }} /></span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <div id="region-results">
        <div className={styles.resultsHeading}>
          <div>
            <h2 id="regions-title">Regional results</h2>
          </div>
          <p>Release positions stay fixed when you filter or sort. Open a record for all four indicators and sources.</p>
        </div>
        {filteredRegions.length ? (
          <RegionList regions={filteredRegions} positionById={positionById} publishedCount={ordered.length} />
        ) : (
          <div className={styles.emptyState}>
            <h3>{allRegions.length ? "No regions match these filters" : "No regional records are available"}</h3>
            <p>{allRegions.length ? "Try a region name or four-digit ID, choose another category, or clear the filters." : "This release has no regional records to display."}</p>
            {allRegions.length > 0 && <button type="button" onClick={clearFilters}>Clear filters</button>}
          </div>
        )}
      </div>
    </section>
  );
}
