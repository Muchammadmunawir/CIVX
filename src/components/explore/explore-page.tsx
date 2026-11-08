import Link from "next/link";
import { ExploreBrowser } from "@/components/explore/explore-browser";
import { Notice, PageHeading } from "@/components/product/product-ui";
import { SectionReveals } from "@/components/product/section-reveals";
import { getExploreRegionsProduct2023, getProductMethodology2023 } from "@/lib/civx/product-2023";
import styles from "./explore.module.css";

export function ExplorePage({ initialSearch = "" }: { initialSearch?: string }) {
  const regions = getExploreRegionsProduct2023();
  const methodology = getProductMethodology2023();
  const summary = [
    { label: "Cakupan Jawa Barat", value: `${regions.length} Wilayah`, note: "Kabupaten dan kota dalam satu kohort" },
    { label: "Kabupaten", value: `${regions.filter(view => view.region.type === "kabupaten").length} Wilayah`, note: "Identitas berdasarkan kode BPS" },
    { label: "Kota", value: `${regions.filter(view => view.region.type === "kota").length} Wilayah`, note: "Identitas berdasarkan kode BPS" },
    { label: "Tahun referensi", value: String(methodology.referenceYear), note: "Satu model lengkap yang tersedia" },
  ];
  return <SectionReveals className={`civx-container product-page ${styles.page}`} selector="[data-reveal], .product-heading h1, .product-heading p, .product-notice">
    <PageHeading title="Jelajah wilayah" description="Temukan profil tekanan relatif kabupaten dan kota di Jawa Barat, dari peta hingga indikator pembentuk skor." />
    <div className={styles.summary} aria-label="Cakupan model CIVX 2023">{summary.map((item, index) => <div className="product-card" key={item.label} data-reveal data-reveal-order={index}><p>{item.label}</p><strong>{item.value}</strong><span>{item.note}</span></div>)}</div>
    <ExploreBrowser regions={regions} initialSearch={initialSearch} />
    <Notice>Skor CIVX menunjukkan tekanan relatif dalam kohort {methodology.cohortSize} wilayah pada {methodology.referenceYear}, bukan penilaian absolut kualitas wilayah. Tidak ada kategori kebijakan atau urutan berdasarkan skor.</Notice>
    <div className={styles.links}><Link className="civx-text-link" href="/methodology" data-reveal>Pahami enam dimensi dan metode CIVX ↗</Link><Link className="civx-text-link" href="/sources" data-reveal data-reveal-order="1">Telusuri sumber data ↗</Link></div>
  </SectionReveals>;
}
