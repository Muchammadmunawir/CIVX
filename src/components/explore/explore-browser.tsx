"use client";

import { useMemo, useState } from "react";
import { RegionList } from "@/components/data/region-list";
import { RegionDiscovery, type CategoryFilter, type SortOrder } from "./region-discovery";
import { WestJavaMap } from "./west-java-map";
import { scoreForLayer, type PressureLayerId } from "./pressure-layer";
import { categoryForScore, civicRelease, dimensions } from "@/lib/civx/current";
import type { V2Region } from "@/lib/civx/v2/types";
import styles from "./explore.module.css";

const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const categories = [{ key: "lower", label: "Lower" }, { key: "moderate", label: "Moderate" }, { key: "higher", label: "Higher" }] as const;

export function ExploreBrowser({ regions }: { regions: V2Region[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOrder>("score-desc");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [layer, setLayer] = useState<PressureLayerId>("overall");
  const layers = useMemo(() => [
    { id: "overall" as const, label: "Overall Civic Index" },
    ...dimensions.filter(dimension => civicRelease.exploreLayers.some(registered => registered.id === dimension.id && registered.kind === "core_score_indicator") && regions.every(region => scoreForLayer(region, dimension.id) !== undefined)).map(dimension => ({ id: dimension.id, label: dimension.label })),
  ], [regions]);
  const layerLabel = layers.find(value => value.id === layer)?.label ?? "Overall Civic Index";
  const published = useMemo(() => regions.filter(region => scoreForLayer(region, layer) !== undefined), [regions, layer]);
  const scores = useMemo(() => published.map(region => scoreForLayer(region, layer)!).sort((a, b) => a - b), [published, layer]);
  const middle = Math.floor(scores.length / 2);
  const median = scores.length ? scores.length % 2 ? scores[middle] : (scores[middle - 1] + scores[middle]) / 2 : null;
  const filteredRegions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const filtered = regions.filter(region => {
      const score = scoreForLayer(region, layer);
      return (category === "all" || score !== undefined && categoryForScore(score) === category) && (!query || region.name.toLocaleLowerCase().includes(query) || region.id.includes(query));
    });
    filtered.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      const aScore = scoreForLayer(a, layer);
      const bScore = scoreForLayer(b, layer);
      if (aScore === undefined) return bScore === undefined ? a.name.localeCompare(b.name) : 1;
      if (bScore === undefined) return -1;
      return (sort === "score-asc" ? aScore - bScore : bScore - aScore) || a.name.localeCompare(b.name);
    });
    return filtered;
  }, [regions, category, search, sort, layer]);
  const visibleIds = useMemo(() => new Set(filteredRegions.map(region => region.id)), [filteredRegions]);
  const clearFilters = () => { setSearch(""); setCategory("all"); };
  return (
    <section className={`civx-container ${styles.results}`} aria-labelledby="regions-title">
      <div className={styles.control}><label htmlFor="pressure-layer">Pressure layer</label><select id="pressure-layer" value={layer} onChange={event => setLayer(event.target.value as PressureLayerId)} aria-describedby="layer-help" aria-controls="region-results">{layers.map(value => <option value={value.id} key={value.id}>{value.label}</option>)}</select><p id="layer-help">Only validated pressure dimensions are available. Layer selection changes the display, never the Civic Index formula or reference bounds.</p></div>
      <RegionDiscovery totalCount={regions.length} filteredCount={filteredRegions.length} search={search} sort={sort} category={category} onSearchChange={setSearch} onSortChange={setSort} onCategoryChange={setCategory} onClear={clearFilters} />
      <WestJavaMap regions={regions} visibleIds={visibleIds} layer={layer} layerLabel={layerLabel} />
      {median !== null && <section className={styles.distribution} aria-label={`${layerLabel} release distribution`}><div className={styles.distributionIntro}><h2>Release distribution</h2><p>{layerLabel} · Median <strong>{decimal.format(median)}/100</strong> · {published.length} published scores</p></div><ul className={styles.distributionList}>{categories.map(({ key, label }) => {
        const count = published.filter(region => categoryForScore(scoreForLayer(region, layer)!) === key).length;
        return <li className={styles[`distribution${key}`]} key={key}><div className={styles.distributionLabel}><span>{label}</span><strong>{count}</strong></div><span className={styles.distributionTrack} aria-hidden="true"><span style={{ width: `${count / published.length * 100}%` }} /></span></li>;
      })}</ul></section>}
      <div id="region-results"><div className={styles.resultsHeading}><div><h2 id="regions-title">Regional results</h2></div><p>{layerLabel}. Open a record for all core indicators, dimensions, Context Signals and Regional Advantages.</p></div>{filteredRegions.length ? <RegionList regions={filteredRegions} layer={layer} layerLabel={layerLabel} /> : <div className={styles.emptyState}><h3>No regions match these filters</h3><p>Try a region name or four-digit ID, choose another category, or clear filters.</p><button type="button" onClick={clearFilters}>Clear filters</button></div>}</div>
    </section>
  );
}
