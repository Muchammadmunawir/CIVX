import styles from "./explore.module.css";
import type { PressureCategory } from "@/lib/civx/types";

export type SortOrder = "score-desc" | "score-asc" | "name";
export type CategoryFilter = PressureCategory | "all";

interface RegionDiscoveryProps {
  totalCount: number;
  filteredCount: number;
  search: string;
  sort: SortOrder;
  category: CategoryFilter;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: SortOrder) => void;
  onCategoryChange: (category: CategoryFilter) => void;
  onClear: () => void;
}

export function RegionDiscovery({
  totalCount,
  filteredCount,
  search,
  sort,
  category,
  onSearchChange,
  onSortChange,
  onCategoryChange,
  onClear,
}: RegionDiscoveryProps) {
  return (
    <div className={styles.toolbar} role="search" aria-label="Find released regions">
      <div className={styles.controls}>
        <div className={styles.control}>
          <label htmlFor="region-search">Find a region</label>
          <input
            id="region-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="e.g. Bogor or 3201"
            aria-controls="region-results"
          />
        </div>
        <div className={styles.control}>
          <label htmlFor="region-sort">Sort by</label>
          <select
            id="region-sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortOrder)}
            aria-controls="region-results"
          >
            <option value="score-desc">Score: high to low</option>
            <option value="score-asc">Score: low to high</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
        <div className={styles.control}>
          <label htmlFor="region-category">Relative pressure</label>
          <select
            id="region-category"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value as CategoryFilter)}
            aria-controls="region-results"
          >
            <option value="all">All categories</option>
            <option value="lower">Lower</option>
            <option value="moderate">Moderate</option>
            <option value="higher">Higher</option>
          </select>
        </div>
      </div>
      <div className={styles.toolbarFoot}>
        <p className={styles.resultCount} role="status" aria-live="polite" aria-atomic="true">
          <strong>{filteredCount}</strong> of {totalCount} regions
        </p>
        {(search || category !== "all") && <button className={styles.clearFilters} type="button" onClick={onClear}>Clear filters</button>}
      </div>
    </div>
  );
}
