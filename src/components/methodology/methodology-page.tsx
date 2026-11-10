import Link from "next/link";
import { getExploreRegionsProduct2023, getProductMethodology2023, getRegionProductView2023 } from "@/lib/civx/product-2023";
import { Notice, PageHeading } from "@/components/product/product-ui";
import { REPORTING_INTERPRETATION_2023, REPORTING_RESTRICTION_2023 } from "@/lib/civx/export-2023";
import styles from "./methodology-page.module.css";

const sections = [
  ["tentang-indeks", "Tentang indeks"],
  ["kerangka-indikator", "Kerangka indikator"],
  ["tahapan-perhitungan", "Tahapan perhitungan"],
  ["normalisasi", "Normalisasi & bobot"],
  ["interpretasi", "Cara membaca skor"],
  ["keterbatasan", "Keterbatasan"],
  ["status-model", "Status model"],
  ["ekspor-dan-laporan", "Ekspor & laporan"],
] as const;

export function MethodologyPage() {
  const methodology = getProductMethodology2023();
  const representative = getExploreRegionsProduct2023()[0];
  const profile = representative && getRegionProductView2023(representative.region.id);
  if (!profile) throw new Error("CIVX methodology: canonical 2023 profile unavailable");
  const { dimensions, indicators } = profile.core;

  return (
    <main className={`civx-container product-page ${styles.page}`}>
      <PageHeading breadcrumb="Metodologi" title="Di balik angka indeks" description="Pahami apa yang diukur, bagaimana skor dibentuk, dan batas penggunaannya." />
      <Notice>
        Model {methodology.referenceYear} telah dihitung, tetapi belum dirilis untuk publik. Persetujuan integrasi antarmuka tidak mengubah status skor dan insight.
      </Notice>
      <div className={styles.layout}>
        <nav className={styles.contents} aria-label="Dalam halaman ini">
          <p>Dalam halaman ini</p>
          <ul>{sections.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ul>
          <p className={styles.sidebarNote}>Satu model lengkap {methodology.referenceYear}. Bukan seri waktu atau indeks resmi pemerintah.</p>
        </nav>
        <div className={styles.body}>
          <section className={styles.section} aria-labelledby="tentang-indeks">
            <h2 id="tentang-indeks" className="product-section-title">Tentang indeks CIVX</h2>
            <p className={styles.lead}>Satu ringkasan untuk memulai pertanyaan yang lebih baik tentang wilayah.</p>
            <p>CIVX merangkum tekanan relatif kabupaten/kota di {methodology.province}. Skor membantu membaca pola, bukan menggantikan data rinci, pengalaman warga, atau penilaian lapangan.</p>
            <dl className={styles.summary}>
              <div><dt>Kabupaten/kota</dt><dd>{methodology.cohortSize}</dd></div>
              <div><dt>Indikator CORE</dt><dd>{indicators.length}</dd></div>
              <div><dt>Dimensi</dt><dd>{dimensions.length}</dd></div>
              <div><dt>Tahun model</dt><dd>{methodology.referenceYear}</dd></div>
            </dl>
            <p className="product-caption">Cakupan tetap mengikuti kode BPS, tanpa agregat provinsi. CORE masuk skor; CONTEXT hanya memberi konteks.</p>
          </section>

          <section className={styles.section} aria-labelledby="kerangka-indikator">
            <h2 id="kerangka-indikator" className="product-section-title">Kerangka indikator</h2>
            <p>Enam dimensi memiliki bobot setara. Di setiap dimensi, bobot terbagi rata di antara indikatornya.</p>
            <div className="product-table-wrap" role="region" aria-label="Kerangka enam dimensi" tabIndex={0}>
              <table className={`product-table ${styles.dimensions}`}>
                <caption className="civx-sr-only">Dimensi, indikator CORE, dan bobot model 2023</caption>
                <thead><tr><th scope="col">Dimensi</th><th scope="col">Indikator CORE</th><th scope="col">Bobot dimensi</th><th scope="col">Bobot tiap indikator dalam dimensi</th></tr></thead>
                <tbody>{dimensions.map((dimension) => {
                  const members = indicators.filter((indicator) => indicator.dimensionId === dimension.dimensionId);
                  return <tr key={dimension.dimensionId}>
                    <th scope="row">{dimension.displayName}</th>
                    <td><ul>{members.map((indicator) => <li key={indicator.indicatorId}>{indicator.displayName}</li>)}</ul></td>
                    <td className={styles.weight}>1/6 <span>≈ 16,7%</span></td>
                    <td>{members.length === 1 ? "1 (100%)" : `1/${members.length}`}</td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
            <p className="product-caption">Bobot tepat setiap dimensi adalah 1/6, bukan 16,7% dalam perhitungan. Enam pecahan tersebut berjumlah 1 (100%); persentase tampilan dibulatkan.</p>
          </section>

          <section className={styles.section} aria-labelledby="tahapan-perhitungan">
            <h2 id="tahapan-perhitungan" className="product-section-title">Tahapan perhitungan</h2>
            <ol className={styles.steps}>
              <li><h3>Siapkan bukti yang sebanding</h3><p>Samakan kode wilayah, definisi, unit, pembilang, penyebut, dan periode referensi. Pertahankan sumber serta lokasi baris atau tabel.</p></li>
              <li><h3>Normalisasi sesuai arah tekanan</h3><p>Gunakan arah tiap indikator dan batas minimum–maksimum tetap dari seluruh kohort {methodology.cohortSize} wilayah {methodology.referenceYear}, bukan dari pilihan wilayah di layar.</p></li>
              <li><h3>Gabungkan indikator dan dimensi</h3><p>Rata-ratakan tekanan indikator dalam dimensi, lalu gabungkan enam dimensi dengan bobot tepat 1/6. Tidak ada pembobotan penduduk atau normalisasi ulang skor gabungan.</p></li>
              <li><h3>Tinjau hasil dan batas pemakaian</h3><p>Periksa kelengkapan, jejak sumber, ketidakpastian, dan sensitivitas model. Perhitungan tidak otomatis berarti persetujuan rilis publik.</p></li>
            </ol>
          </section>

          <section className={styles.section} aria-labelledby="normalisasi">
            <h2 id="normalisasi" className="product-section-title">Normalisasi & bobot</h2>
            <div className={styles.formulas}>
              <h3>Nilai mentah lebih tinggi → tekanan lebih tinggi</h3>
              <p className={styles.formula}>s = 100 × ((x − a) / (b − a))</p>
              <h3>Nilai mentah lebih tinggi → tekanan lebih rendah</h3>
              <p className={styles.formula}>s = 100 × ((b − x) / (b − a))</p>
              <p>x adalah nilai mentah; a dan b adalah minimum dan maksimum indikator dalam kohort tetap. s adalah tekanan relatif pada skala 0–100.</p>
            </div>
            <p>Bobot efektif satu indikator adalah (1/6) × (1/n), dengan n jumlah indikator dalam dimensinya. Dimensi berindikator tunggal tetap mendapat 1/6, bukan bobot tambahan.</p>
            <p>Perhitungan memakai presisi penuh dari model yang dibekukan. Angka di antarmuka dibulatkan untuk pembacaan, bukan dihitung ulang dari angka tampilan.</p>
          </section>

          <section className={styles.section} aria-labelledby="interpretasi">
            <h2 id="interpretasi" className="product-section-title">Cara membaca skor</h2>
            <Notice>Skor lebih tinggi berarti tekanan relatif lebih tinggi, bukan wilayah lebih baik atau lebih buruk.</Notice>
            <ul className={styles.list}>
              <li>Pada indikator, 0 dan 100 adalah ujung tekanan yang teramati dalam kohort {methodology.cohortSize} wilayah {methodology.referenceYear}, bukan batas absolut kondisi nyata.</li>
              <li>Nol bukan berarti tanpa tekanan; 100 bukan dampak teoretis terburuk. Nilai 50 bukan ambang kebijakan, probabilitas, atau median kohort.</li>
              <li>Skor gabungan tidak harus mencapai 0 atau 100. Tekanan rendah pada satu indikator dapat mengimbangi tekanan tinggi pada indikator lain.</li>
              <li>Tidak ada kategori status, ambang baik/buruk, peringkat publik, atau rata-rata provinsi. Perbedaan skor bukan bukti sebab-akibat atau rekomendasi kebijakan.</li>
              <li>Hanya satu model lengkap {methodology.referenceYear} tersedia. Belum ada sejarah skor yang sebanding untuk menyimpulkan tren.</li>
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="keterbatasan">
            <h2 id="keterbatasan" className="product-section-title">Keterbatasan yang perlu dibaca</h2>
            <ul className={styles.list}>
              <li>Seluruh {indicators.length} indikator CORE wajib lengkap. Data hilang atau tidak sah menggagalkan perhitungan; tidak diisi nol, diimputasi, diganti tahun, atau ditutup dengan perubahan bobot.</li>
              <li>Deret konstan dan nilai di luar batas kalibrasi ditolak. Model tidak memotong pencilan atau menggeser batas secara diam-diam.</li>
              <li>Min–max peka pada titik ujung, terutama UHH dan rasio Puskesmas; TPT dan angka kesakitan juga memerlukan kehati-hatian. Selisih kecil tidak otomatis bermakna secara statistik.</li>
              <li>Ketidakpastian survei, definisi penyebut, tumpang tindih indikator, dan keterbatasan pelaporan sumber tetap berlaku. Bobot setara merupakan pilihan normatif, bukan kepentingan yang terbukti secara universal.</li>
              <li>Label model 2023 tidak menyamakan seluruh tanggal publikasi atau periode survei. Baca periode referensi, tanggal terbit, dan catatan masing-masing sumber.</li>
              <li>CONTEXT tidak memengaruhi skor. Data tidak tercakup berbeda dari nilai nol. Observasi stasiun atau ruas jalan tetap melekat pada lokasi dan tanggalnya, bukan rata-rata wilayah.</li>
              <li>CONTEXT dapat berasal dari 2024 atau snapshot bertanggal lain. Data tersebut tidak menggantikan CORE 2023 dan tidak mendukung selisih, peringkat, atau perbandingan skor konteks.</li>
            </ul>
            <Link href="/sources" className="civx-button civx-button-primary">Telusuri sumber data</Link>
          </section>

          <section className={styles.section} aria-labelledby="status-model">
            <h2 id="status-model" className="product-section-title">Status model & penggunaan</h2>
            <p>CIVX adalah indeks analitis yang ditetapkan proyek, bukan indeks resmi atau pengesahan lembaga sumber. Hak penggunaan dan redistribusi sumber belum dinyatakan tuntas.</p>
            <p>Model 2023 masih memerlukan persetujuan rilis publik. Baca definisi, periode rujukan, dan keterbatasan sumber sebelum menggunakan hasilnya.</p>
            <p>Tampilan angka pada antarmuka merupakan pratinjau peninjauan, bukan persetujuan publikasi. Hak penggunaan sumber dan persetujuan rilis harus dituntaskan sebelum penerapan publik. Pemberitahuan pratinjau bukan kontrol akses.</p>
            <p>Pembatasan CSV dan laporan wilayah tidak mencegah penyalinan tampilan atau pencetakan halaman lain melalui peramban. Gunakan lingkungan peninjauan terbatas; jangan menyebarkan hasil numerik sebelum persetujuan terdokumentasi.</p>
            <Link className="civx-text-link" href="/sources">Lihat sumber dan catatan penggunaannya <span aria-hidden="true">→</span></Link>
          </section>

          <section className={styles.section} aria-labelledby="ekspor-dan-laporan">
            <h2 id="ekspor-dan-laporan" className="product-section-title">Ketentuan ekspor & laporan</h2>
            <p>{REPORTING_RESTRICTION_2023}</p>
            <p>CSV Jelajah memuat kode BPS, nama, jenis wilayah, provinsi, tahun acuan 2023, atribusi identitas, serta tautan sumber dan metodologi. Unduhan mengikuti seluruh hasil pencarian dan filter jenis, bukan halaman tabel atau lapisan peta.</p>
            <p>Kolom skor sengaja tidak disertakan, bukan diisi nol atau dianggap data hilang. Nilai yang ditahan karena izin berbeda dari nilai yang tidak tersedia pada sumber. Ekspor lengkap memerlukan persetujuan rilis dan penuntasan hak penggunaan sumber.</p>
            <p>CSV memakai UTF-8 dengan BOM, pemisah koma, dan akhir baris CRLF. Teks berpetik mempertahankan koma, kutipan, dan baris baru. Teks yang dapat terbaca sebagai rumus spreadsheet diberi awalan apostrof; awalan ini merupakan pengamanan, bukan bagian nama asli.</p>
            <p>Untuk laporan wilayah, pilih “Cetak / Simpan PDF”, gunakan kertas A4, lalu pilih printer atau “Simpan sebagai PDF” pada dialog peramban. Laporan hanya memuat identitas dan referensi; skor, nilai indikator, serta insight tidak dicetak. Navigasi dan kontrol halaman disembunyikan. Nonaktifkan header dan footer bawaan peramban bila tidak diperlukan.</p>
            <p>{REPORTING_INTERPRETATION_2023}</p>
            <p>Rujukan penerbit bukan izin redistribusi dokumen. Buku sumber tidak disertakan. Periode, definisi, penyebut, dan ketidakpastian indikator tetap mengikuti katalog sumber, bukan disamakan dengan tahun model.</p>
            <Link className="civx-text-link" href="/sources">Buka atribusi dan keterbatasan setiap sumber <span aria-hidden="true">→</span></Link>
          </section>
        </div>
      </div>
    </main>
  );
}
