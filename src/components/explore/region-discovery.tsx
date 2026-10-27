import styles from "./explore.module.css";

export type SortOrder = "score-desc" | "score-asc" | "name";

interface RegionDiscoveryProps {
  totalCount: number;
  filteredCount: number;
  search: string;
  sort: SortOrder;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: SortOrder) => void;
}

export function RegionDiscovery({
  totalCount,
  filteredCount,
  search,
  sort,
  onSearchChange,
  onSortChange,
}: RegionDiscoveryProps) {
  return (
    <div className={styles.toolbar} role="search" aria-label="Find released regions">
      <div className={styles.controls}>
        <div className={styles.control}>
          <label htmlFor="region-search">Search by name or ID</label>
          <input
            id="region-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="e.g. Bogor or 3201"
            aria-controls="region-results"
          />
        </div>
        <div className={`${styles.control} ${styles.sortControl}`}>
          <label htmlFor="region-sort">Sort by</label>
          <select
            id="region-sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortOrder)}
            aria-controls="region-results"
          >
            <option value="score-desc">Highest score first</option>
            <option value="score-asc">Lowest score first</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>
      <p className={styles.resultCount} role="status" aria-live="polite" aria-atomic="true">
        Showing <strong>{filteredCount}</strong> of {totalCount} published {totalCount === 1 ? "region" : "regions"}
      </p>
    </div>
  );
}
