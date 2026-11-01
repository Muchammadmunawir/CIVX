import Link from "next/link";
import { WestJavaMap } from "@/components/explore/west-java-map";
import { getExploreRegionsProduct2023, getProductMethodology2023, getRegionProductView2023 } from "@/lib/civx/product-2023";
import styles from "./landing.module.css";

export function LandingPage() {
  const regions = getExploreRegionsProduct2023();
  const methodology = getProductMethodology2023();
  const profile = getRegionProductView2023(regions[0].region.id)!;
  return <main className={`civx-container ${styles.page}`}>
    <div className={styles.layout}>
      <section className={styles.summary} aria-labelledby="home-title">
        <h1 id="home-title">Dashboard tekanan regional<span>.</span></h1>
        <p className={styles.subtitle}>Gambaran tekanan relatif {regions.length} kabupaten/kota Jawa Barat berdasarkan model CIVX {methodology.referenceYear}.</p>
        <div className={styles.coverage}><p>Cakupan Jawa Barat</p><strong>{regions.length}<small>Wilayah</small></strong><span>{regions.filter(view => view.region.type === "kabupaten").length} kabupaten · {regions.filter(view => view.region.type === "kota").length} kota</span></div>
        <div className={styles.modelStats}>
          <div><p>Dimensi CORE</p><strong>{profile.core.dimensions.length}</strong><span>Profil tekanan wilayah</span></div>
          <div><p>Indikator CORE</p><strong>{profile.core.indicators.length}</strong><span>Definisi dan sumber terlacak</span></div>
        </div>
        <div className={styles.reference}><span>Tahun referensi</span><strong>{methodology.referenceYear}</strong><p>Satu model lengkap untuk satu kohort. Data konteks mempertahankan periode sumbernya sendiri.</p></div>
        <Link className="civx-button civx-button-primary" href="/explore">Jelajahi wilayah <span aria-hidden="true">↗</span></Link>
      </section>
      <WestJavaMap regions={regions} home />
    </div>
    <section className={styles.explanation} aria-labelledby="reading-title"><h2 id="reading-title">Baca angka bersama konteksnya.</h2><p>Skor lebih tinggi berarti tekanan relatif lebih tinggi dalam kohort 2023. Skor bukan penilaian absolut kualitas wilayah.</p><Link className="civx-text-link" href="/methodology">Pahami metodologi <span aria-hidden="true">↗</span></Link></section>
  </main>;
}
