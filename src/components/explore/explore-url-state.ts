export type ExploreRegionType = "all" | "kabupaten" | "kota";

export interface ExploreUrlState {
  readonly q: string;
  readonly type: ExploreRegionType;
  readonly layer: string;
}

type ExploreQuery = URLSearchParams | Readonly<Record<string, string | string[] | undefined>>;

/** Repeated owned parameters are ambiguous and use the same defaults as invalid values. */
export function readExploreUrlState(query: ExploreQuery, layerIds: readonly string[]): ExploreUrlState {
  const single = (key: string): string => {
    const value = query instanceof URLSearchParams ? query.getAll(key) : query[key];
    return typeof value === "string" ? value : value?.length === 1 ? value[0] : "";
  };
  const q = single("q");
  const type = single("type");
  const layer = single("layer");
  return {
    q: q.trim() ? q : "",
    type: type === "kabupaten" || type === "kota" ? type : "all",
    layer: layerIds.includes(layer) ? layer : "",
  };
}

/** Change only Explore state; keep unrelated parameters and the current fragment. */
export function updateExploreUrl(href: string, patch: Partial<ExploreUrlState>, layerIds: readonly string[]): string {
  const url = new URL(href);
  const state = readExploreUrlState({ ...readExploreUrlState(url.searchParams, layerIds), ...patch }, layerIds);
  for (const key of ["q", "type", "layer"] as const) {
    const value = state[key];
    if (!value || (key === "type" && value === "all")) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
