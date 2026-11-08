import Link from "next/link";
import geometry from "../../../data/geography/jabar-adm2-2020.json";
import { WestJavaMap } from "@/components/explore/west-java-map";
import { tightViewBox } from "@/components/regions/region-silhouette";
import { formatScore } from "@/components/product/format";
import { SectionReveals } from "@/components/product/section-reveals";
import { getExploreRegionsProduct2023, getProductMethodology2023 } from "@/lib/civx/product-2023";
import styles from "./landing.module.css";

const pathsById = new Map(geometry.regions.map(shape => [shape.id, shape.path]));

/**
 * CIVX scores are relative pressure (higher = more pressure).
 * The home cards display an inverted index (100 − pressure) so higher reads as better.
 */
function status(index: number): { label: string; tone: string } {
  if (index >= 70) return { label: "Baik", tone: styles.good };
  if (index >= 50) return { label: "Cukup", tone: styles.warning };
  return { label: "Perlu Perhatian", tone: styles.bad };
}

function RegionShape({ regionId, tone }: { regionId: string; tone: string }) {
  const path = pathsById.get(regionId);
  const viewBox = path ? tightViewBox(path) : null;
  if (!path || !viewBox) return null;
  return <svg viewBox={viewBox} className={`${styles.shape} ${tone}`} aria-hidden="true" focusable="false">
    <path d={path} fillRule="evenodd" vectorEffect="non-scaling-stroke" />
  </svg>;
}

export function LandingPage() {
  const regions = getExploreRegionsProduct2023();
  const methodology = getProductMethodology2023();

  const avgIndex = 100 - regions.reduce((sum, view) => sum + view.core.overallScore, 0) / regions.length;
  const provinceStatus = status(avgIndex);
  const sorted = [...regions].sort((a, b) => a.core.overallScore - b.core.overallScore);
  const best = sorted[0];
  const priority = sorted[sorted.length - 1];

  const cards = [
    { label: "Wilayah Performa Terbaik", view: best, tone: styles.good, arrow: "↗" },
    { label: "Wilayah Butuh Prioritas", view: priority, tone: styles.bad, arrow: "↘" },
  ];

  return <SectionReveals className={`civx-container ${styles.page}`}>
    <div className={styles.layout}>
      <section className={styles.summary} aria-labelledby="home-title">
        <h1 id="home-title" data-reveal>Dashboard Indeks Regional<span>.</span></h1>
        <p className={styles.subtitle} data-reveal data-reveal-order="1">Ringkasan indeks dan status wilayah di Jawa Barat</p>

        <div className={styles.average} data-reveal data-reveal-order="2">
          <h2>Rata-rata Indeks Provinsi</h2>
          <p className={styles.averageScore}>{formatScore(avgIndex)} / 100</p>
          <p className={styles.statusRow}>Status: {provinceStatus.label} <span className={`${styles.dot} ${provinceStatus.tone}`} aria-hidden="true" /></p>
        </div>

        {cards.map((card, cardIndex) => {
          const index = 100 - card.view.core.overallScore;
          return <Link key={card.label} href={`/regions/${card.view.region.id}`} className={styles.regionCard} data-reveal data-reveal-order={cardIndex + 3}>
            <div className={styles.regionInfo}>
              <p className={styles.regionLabel}>{card.label}</p>
              <h3>{card.view.region.name}</h3>
              <span className={`${styles.badge} ${card.tone}`}>{formatScore(index)} <span aria-hidden="true">{card.arrow}</span></span>
            </div>
            <RegionShape regionId={card.view.region.id} tone={card.tone} />
          </Link>;
        })}

        <p className={styles.note}>Indeks = 100 − skor tekanan CIVX {methodology.referenceYear}. Semakin tinggi semakin baik.</p>
      </section>
      <div className={styles.mapReveal} data-reveal data-reveal-order="1"><WestJavaMap regions={regions} home /></div>
    </div>
    <section className={styles.explanation} aria-labelledby="reading-title"><h2 id="reading-title" data-reveal>Baca angka bersama konteksnya.</h2><p data-reveal data-reveal-order="1">Skor CIVX lebih tinggi berarti tekanan relatif lebih tinggi dalam kohort {methodology.referenceYear}. Skor bukan penilaian absolut kualitas wilayah.</p><Link className="civx-text-link" href="/methodology" data-reveal data-reveal-order="2">Pahami metodologi <span aria-hidden="true">↗</span></Link></section>
  </SectionReveals>;
}
