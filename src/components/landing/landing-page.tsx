import Link from "next/link";
import { WestJavaMap } from "@/components/explore/west-java-map";
import { SectionReveals } from "@/components/product/section-reveals";
import { ResultsNotice } from "@/components/product/product-ui";
import { getExploreRegionsProduct2023, getProductMethodology2023, getRegionProductView2023 } from "@/lib/civx/product-2023";
import styles from "./landing.module.css";

export function LandingPage() {
  const regions = getExploreRegionsProduct2023();
  const methodology = getProductMethodology2023();
  const profile = getRegionProductView2023(regions[0].region.id);
  if (!profile) throw new Error("CIVX home: canonical 2023 profile unavailable");

  const cards = [
    { label: "Kerangka CIVX", title: `${profile.core.dimensions.length} dimensi`, href: "/methodology", action: "Metodologi" },
    { label: "Landasan data", title: `${profile.core.indicators.length} indikator`, href: "/sources", action: "Sumber data" },
  ];
  const scenarios = [
    { title: "Jelajahi tekanan pendidikan", description: "Baca perbedaan tekanan pendidikan dalam kohort Jawa Barat 2023 melalui lapisan peta yang sama.", href: "/explore?layer=education", action: "Jelajahi pendidikan" },
    { title: "Bandingkan dua wilayah", description: "Pilih dua kabupaten atau kota untuk membaca tekanan relatif dan perbedaan pada enam dimensi CORE.", href: `/compare?a=${profile.region.id}&b=3273`, action: "Buka perbandingan" },
    { title: "Periksa bukti wilayah", description: `Buka profil ${profile.region.name}, lalu telusuri definisi, periode, dan sumber asli setiap indikator.`, href: `/regions/${profile.region.id}`, action: "Telusuri profil" },
  ];

  return <SectionReveals className={`civx-container ${styles.page}`}>
    <ResultsNotice />
    <div className={styles.layout}>
      <section className={styles.summary} aria-labelledby="home-title">
        <h1 id="home-title" data-reveal>Dashboard Regional CIVX<span>.</span></h1>
        <p className={styles.subtitle} data-reveal data-reveal-order="1">Cakupan wilayah dan kerangka pengukuran Jawa Barat</p>

        <div className={styles.average} data-reveal data-reveal-order="2">
          <h2>Cakupan Jawa Barat</h2>
          <p className={styles.averageScore}>{regions.length} wilayah</p>
          <p className={styles.referenceYear}>Tahun acuan {methodology.referenceYear}</p>
        </div>

        {cards.map((card, cardIndex) => (
          <Link key={card.href} href={card.href} className={styles.referenceCard} data-reveal data-reveal-order={cardIndex + 3}>
            <div className={styles.cardInfo}>
              <p className={styles.cardLabel}>{card.label}</p>
              <h3>{card.title}</h3>
              <span className={styles.cardAction}>{card.action} <span aria-hidden="true">↗</span></span>
            </div>
          </Link>
        ))}

        <p className={styles.note}>Cakupan kabupaten/kota, bukan agregat skor provinsi atau peringkat wilayah.</p>
      </section>
      <div className={styles.mapReveal} data-reveal data-reveal-order="1"><WestJavaMap regions={regions} home /></div>
    </div>
    <section className={styles.usage} id="cara-menggunakan" aria-labelledby="usage-title">
      <h2 id="usage-title" data-reveal>Cara Menggunakan CIVX</h2>
      <p className="product-caption" data-reveal>Mulai dari pertanyaan Anda. Baca pola tekanan relatif, lalu periksa data yang mendasarinya.</p>
      <ul className={styles.usageList}>{scenarios.map((scenario, index) => <li key={scenario.href} data-reveal data-reveal-order={index}>
        <Link className={styles.usageLink} href={scenario.href}>
          <h3>{scenario.title}</h3>
          <p>{scenario.description}</p>
          <span className={`civx-text-link ${styles.usageAction}`}>{scenario.action} <span aria-hidden="true">↗</span></span>
        </Link>
      </li>)}</ul>
    </section>
    <section className={styles.explanation} aria-labelledby="reading-title"><h2 id="reading-title" data-reveal>Baca angka bersama konteksnya.</h2><p data-reveal data-reveal-order="1">Skor CIVX lebih tinggi berarti tekanan relatif lebih tinggi dalam kohort {methodology.referenceYear}. Skor bukan penilaian absolut kualitas wilayah.</p><Link className="civx-text-link" href="/methodology" data-reveal data-reveal-order="2">Pahami metodologi <span aria-hidden="true">↗</span></Link></section>
  </SectionReveals>;
}
