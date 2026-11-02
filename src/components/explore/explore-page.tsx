import { ExploreBrowser } from "@/components/explore/explore-browser";
import { formatScore } from "@/components/product/format";
import { INDEX_STATUSES, indexStatus, rankRegions, toIndex } from "@/components/product/index-status";
import { PageHeading } from "@/components/product/product-ui";
import { getExploreRegionsProduct2023 } from "@/lib/civx/product-2023";
import styles from "./explore.module.css";

export function ExplorePage({ initialSearch = "" }: { initialSearch?: string }) {
  const regions = getExploreRegionsProduct2023();
  const ranked = rankRegions(regions);
  const average = toIndex(regions.reduce((sum, view) => sum + view.core.overallScore, 0) / regions.length);
  const summary = [
    { label: "Rata-rata Indeks Provinsi", value: `${formatScore(average)} / 100`, note: `Jawa Barat · Status ${indexStatus(average).label}` },
    ...INDEX_STATUSES.map(status => {
      const count = ranked.filter(row => row.status.id === status.id).length;
      return { label: status.label, value: `${count} Wilayah`, note: `${formatScore((count / regions.length) * 100)}% dari ${regions.length} wilayah` };
    }),
  ];
  return <main className="civx-container product-page">
    <PageHeading title="Jelajah wilayah" description="Temukan gambaran indeks kabupaten dan kota di Jawa Barat, dari peta hingga peringkat wilayah." />
    <div className={styles.summary} aria-label="Ringkasan indeks Jawa Barat">{summary.map(item => <div className="product-card" key={item.label}><p>{item.label}</p><strong>{item.value}</strong><span>{item.note}</span></div>)}</div>
    <ExploreBrowser regions={regions} initialSearch={initialSearch} />
  </main>;
}
