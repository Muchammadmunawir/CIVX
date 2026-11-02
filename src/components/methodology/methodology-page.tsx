import Link from "next/link";
import { formatScore } from "@/components/product/format";
import { dimensionLabel, toIndex } from "@/components/product/index-status";
import { Notice, PageHeading } from "@/components/product/product-ui";
import { getExploreRegionsProduct2023, getProductMethodology2023, getRegionProductView2023 } from "@/lib/civx/product-2023";
import styles from "./methodology-page.module.css";

const sections = [
  ["tentang-indeks", "Tentang indeks"],
  ["kerangka-indikator", "Kerangka indikator"],
  ["tahapan-perhitungan", "Tahapan perhitungan"],
  ["normalisasi", "Contoh perhitungan"],
  ["interpretasi", "Status & interpretasi"],
  ["keterbatasan", "Keterbatasan"],
] as const;

const PRINCIPLES = [
  { title: "Terbaca", description: "Skala 0–100 untuk memudahkan pembacaan." },
  { title: "Transparan", description: "Definisi, bobot, dan kekosongan data dijelaskan." },
  { title: "Kontekstual", description: "Perbedaan wilayah selalu perlu konteks." },
] as const;

const DIMENSION_META: Readonly<Record<string, { scope: string; direction: string }>> = {
  education: {
    scope: "Lama sekolah dan partisipasi pendidikan.",
    direction: "Lebih tinggi → lebih baik",
  },
  public_health: {
    scope: "Akses layanan gizi, kesakitan, dan usia harapan hidup.",
    direction: "Arah disesuaikan per indikator",
  },
  socioeconomic: {
    scope: "Kesempatan kerja, kemiskinan, ketimpangan, dan daya beli.",
    direction: "Arah disesuaikan per indikator",
  },
  basic_services: {
    scope: "Air minum, sanitasi, hunian, dan fasilitas layanan.",
    direction: "Arah disesuaikan per indikator",
  },
  disaster_pressure: {
    scope: "Risiko bencana wilayah terpadu (IRBI).",
    direction: "Lebih rendah → lebih baik",
  },
  environment: {
    scope: "Kualitas lingkungan hidup daerah (IKLH).",
    direction: "Lebih tinggi → lebih baik",
  },
};

const STEPS = [
  {
    number: "01",
    title: "Siapkan data",
    description: "Samakan wilayah, satuan, dan periode. Catat definisi indikator dan asal berkas sebelum digunakan.",
  },
  {
    number: "02",
    title: "Normalisasi",
    description: "Ubah setiap indikator menjadi skor 0–100. Balik arah indikator jika nilai rendah justru lebih baik.",
  },
  {
    number: "03",
    title: "Gabungkan dimensi",
    description: "Hitung skor dimensi dari indikator yang lolos validasi, lalu terapkan bobot yang transparan.",
  },
  {
    number: "04",
    title: "Tinjau & publikasikan",
    description: "Periksa kewajaran, cakupan, dan sensitivitas. Sertakan versi metode dan catatan keterbatasan.",
  },
] as const;

const STATUS_CARDS = [
  {
    tone: "good",
    label: "Baik",
    description: "Capaian relatif kuat (indeks ≥ 70); tetap periksa ketimpangan antarindikator.",
  },
  {
    tone: "warning",
    label: "Sedang",
    description: "Ada ruang perbaikan yang perlu ditelusuri (indeks 50–69,9).",
  },
  {
    tone: "bad",
    label: "Kritis",
    description: "Perlu perhatian dan peninjauan lebih lanjut (indeks < 50).",
  },
] as const;

export function MethodologyPage() {
  const methodology = getProductMethodology2023();
  const regions = getExploreRegionsProduct2023();
  const sample = getRegionProductView2023("3273") ?? getRegionProductView2023(regions[0].region.id);
  if (!sample) throw new Error("CIVX methodology: canonical 2023 profile unavailable");
  const { dimensions, indicators } = sample.core;
  const sampleDimensionIndices = dimensions.map(dimension => formatScore(toIndex(dimension.score))).join(" + ");
  const sampleOverallIndex = formatScore(toIndex(sample.core.overallScore));

  return (
    <main className={`civx-container product-page ${styles.page}`}>
      <PageHeading breadcrumb="Metodologi" title="Di balik angka indeks" description="Pahami apa yang diukur, bagaimana skor dibentuk, dan batas penggunaannya." />
      <Notice>
        Metodologi berikut merangkum mekanisme perhitungan model CIVX {methodology.referenceYear} untuk {methodology.cohortSize} kabupaten/kota di {methodology.province}. Angka indeks di Beranda dan Jelajah menggunakan skala terbalik (100 − tekanan relatif) dari hasil perhitungan terverifikasi ini.
      </Notice>

      <div className={styles.layout}>
        <nav className={styles.contents} aria-label="Dalam halaman ini">
          <p>DALAM HALAMAN INI</p>
          <ul>
            {sections.map(([id, label], index) => (
              <li key={id} data-active={index === 0 ? "true" : undefined}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ul>
          <div className={styles.sidebarNote}>
            <span aria-hidden="true">⚑</span>
            <p>Model {methodology.referenceYear} · {methodology.cohortSize} wilayah &amp; {indicators.length} indikator CORE terhubung ke sumber resmi.</p>
          </div>
        </nav>

        <div className={styles.body}>
          <section className={styles.section} aria-labelledby="tentang-indeks">
            <h2 id="tentang-indeks" className="product-section-title">Tentang indeks CIVX</h2>
            <p className={styles.lead}>Satu ringkasan untuk memulai pertanyaan yang lebih baik tentang wilayah.</p>
            <p>Indeks merangkum sejumlah indikator ke dalam satu skala. Ia membantu melihat pola dan membuka diskusi, tetapi tidak menggantikan data rinci, pengalaman warga, atau penilaian lapangan.</p>
            <div className={styles.principles}>
              {PRINCIPLES.map(item => (
                <div className={styles.principleCard} key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="kerangka-indikator">
            <h2 id="kerangka-indikator" className="product-section-title">Kerangka indikator</h2>
            <p>Enam dimensi dengan bobot setara pada kohort {methodology.cohortSize} wilayah {methodology.referenceYear}. Daftar indikator operasional, satuan, dan ambang normalisasi ditetapkan dari sumber publik yang telah diaudit.</p>
            <div className="product-table-wrap" role="region" aria-label="Kerangka enam dimensi" tabIndex={0}>
              <table className={`product-table ${styles.dimensions}`}>
                <caption className="civx-sr-only">Dimensi, indikator CORE, arah skor, dan bobot model 2023</caption>
                <thead>
                  <tr>
                    <th scope="col">Dimensi</th>
                    <th scope="col">Lingkup indikator</th>
                    <th scope="col">Arah skor</th>
                    <th scope="col">Bobot</th>
                  </tr>
                </thead>
                <tbody>
                  {dimensions.map(dimension => {
                    const members = indicators.filter(indicator => indicator.dimensionId === dimension.dimensionId);
                    const meta = DIMENSION_META[dimension.dimensionId];
                    return (
                      <tr key={dimension.dimensionId}>
                        <th scope="row">
                          <strong>{dimensionLabel(dimension.dimensionId, dimension.displayName)}</strong>
                          <span>{dimension.displayName}</span>
                        </th>
                        <td>
                          <p className={styles.scopeLead}>{meta?.scope ?? dimension.displayName}</p>
                          <ul>
                            {members.map(indicator => (
                              <li key={indicator.indicatorId}>{indicator.displayName}</li>
                            ))}
                          </ul>
                        </td>
                        <td className={styles.direction}>
                          <span>{meta?.direction ?? "Arah disesuaikan per indikator"}</span>
                          <small>Bobot indikator: {members.length === 1 ? "1 (100%)" : `1/${members.length}`}</small>
                        </td>
                        <td className={styles.weight}>
                          1/6 <span>≈ 16,7%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="product-caption">Total bobot 100% (enam dimensi × 1/6). Di setiap dimensi, bobot terbagi rata di antara indikatornya.</p>
          </section>

          <section className={styles.section} aria-labelledby="tahapan-perhitungan">
            <h2 id="tahapan-perhitungan" className="product-section-title">Tahapan perhitungan</h2>
            <ol className={styles.steps}>
              {STEPS.map(step => (
                <li key={step.number}>
                  <span className={styles.stepBadge} aria-hidden="true">{step.number}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={`${styles.section} ${styles.exampleBox}`} aria-labelledby="normalisasi">
            <h2 id="normalisasi" className="product-section-title">Contoh perhitungan</h2>
            <span className={styles.simTag}>Rumus model {methodology.referenceYear} · kohort {methodology.cohortSize} wilayah</span>
            <p className={styles.formula}>Skor positif = 100 × (x − batas bawah) / (batas atas − batas bawah)</p>
            <p className={styles.formulaCode}>
              s = 100 × ((x − a) / (b − a)) · arah terbalik: s = 100 × ((b − x) / (b − a))
            </p>
            <p className={styles.exampleNote}>
              Untuk indikator berarah negatif: 100 − skor positif (dengan x nilai mentah, a batas bawah, dan b batas atas). Skor dibatasi pada 0–100; batas bawah dan atas ditetapkan dari seluruh kohort sebelum analisis, bukan ditebak dari tampilan.
            </p>
            <hr />
            <p className={styles.formula}>({sampleDimensionIndices}) × 1/6 = {sampleOverallIndex}</p>
            <p className="product-caption">
              Contoh {sample.region.name} memakai indeks enam dimensi CIVX {methodology.referenceYear} (100 − tekanan dimensi). Bobot setara 1/6 menghasilkan indeks Beranda {sampleOverallIndex} (skor tekanan relatif {formatScore(sample.core.overallScore)}).
            </p>
          </section>

          <section className={styles.section} aria-labelledby="interpretasi">
            <h2 id="interpretasi" className="product-section-title">Status &amp; interpretasi</h2>
            <p>Status Baik, Sedang, dan Kritis mengikuti kategori indeks yang terlihat di Beranda dan Jelajah. Pada skor tekanan asli CIVX, nilai lebih tinggi berarti tekanan relatif lebih tinggi; pada tampilan Indeks (100 − tekanan), nilai lebih tinggi berarti kondisi relatif lebih baik.</p>
            <div className={styles.statusGrid}>
              {STATUS_CARDS.map(card => (
                <div className={styles.statusCard} key={card.label}>
                  <span className={styles.statusPill} data-tone={card.tone}>{card.label}</span>
                  <p>{card.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="keterbatasan">
            <h2 id="keterbatasan" className="product-section-title">Keterbatasan yang perlu dibaca</h2>
            <ul className={styles.list}>
              <li>Data kosong tidak sama dengan nol. Seluruh {indicators.length} indikator CORE wajib lengkap; jangan menerbitkan indeks jika cakupan minimum belum terpenuhi.</li>
              <li>Perubahan definisi, batas wilayah, atau periode dapat memengaruhi keterbandingan.</li>
              <li>Bobot dan normalisasi memengaruhi peringkat. Uji sensitivitas sebelum menarik kesimpulan.</li>
              <li>Indeks komposit tidak menunjukkan sebab-akibat dan tidak merangkum seluruh kondisi warga. Data CONTEXT disajikan terpisah dan tidak memengaruhi skor CORE.</li>
            </ul>
            <Link href="/sources" className="civx-button civx-button-primary">Lihat kesiapan sumber data</Link>
          </section>
        </div>
      </div>
    </main>
  );
}
