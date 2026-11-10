# CIVX 2023 — Kontrak Pelaporan Analitis

## Status dan batas distribusi

**Pelaporan numerik publik belum diizinkan.** `SCORED_NOT_RELEASED`, `INSIGHTS_NOT_RELEASED`, dan `productionIntegrationAuthorized: false` tetap berlaku. Hak penggunaan dan redistribusi sumber serta persetujuan rilis model belum tuntas. Data yang dapat dibaca dari penerbit tidak otomatis boleh dipublikasikan ulang.

Kontrak ini memisahkan dua keluaran:

| Keluaran | Cakupan saat ini | Akses |
| --- | --- | --- |
| CSV Jelajah dan PDF regional pada aplikasi | Identitas, metadata, definisi, atribusi, dan referensi; tanpa hasil numerik | Perilaku publik lama dipertahankan |
| CSV analitis dan laporan A4 lokal | Skor keseluruhan, enam dimensi, serta 18 indikator CORE dari facade, beserta satuan dan bukti | CLI lokal di luar aplikasi; bukan unduhan atau rute publik |

Hasil numerik lokal diberi cakupan tetap `LOCAL_RESTRICTED_REVIEW`. Label ini bukan pengamanan: pemisahan berasal dari modul offline di `scripts/reporting/`, tidak adanya impor aplikasi/rute, serta direktori keluaran privat di luar repository. Tidak ada boolean klien, tombol tersembunyi, parameter URL, atau flag `includeScores` untuk melewati kontrak publik.

Simpan hasil lokal di lingkungan terkontrol. Jangan unggah ke repository, lampiran PR publik, `public/`, penyimpanan publik, atau layanan demo. Pembuatan laporan lokal tidak memberikan izin redistribusi.

## Sumber kebenaran dan seleksi

- Semua angka berasal dari `getExploreRegionsProduct2023()` dan `getRegionProductView2023()` dalam `src/lib/civx/product-2023.ts`.
- Tahun model tetap 2023; kohort tetap 27 kabupaten/kota Jawa Barat. Tidak ada normalisasi, pembobotan, atau scoring ulang.
- CSV memuat satu baris per wilayah dalam seluruh hasil filter, bukan hanya halaman tabel. Urutan tetap kode BPS; lapisan peta tidak mengubah cakupan ekspor.
- Filter `q` mengikuti pencocokan nama tanpa membedakan huruf besar/kecil dan mengabaikan spasi tepi untuk pencocokan. Teks filter asli yang bermakna tetap dicatat. `type` hanya `all`, `kabupaten`, atau `kota`.
- PDF berisi satu wilayah yang harus dikenal dan termasuk hasil filter yang dicatat. Pilihan tidak sah, hasil kosong, atau wilayah di luar filter ditolak; tidak diganti dengan wilayah pertama.
- CONTEXT, insight, kemiripan wilayah, peringkat, dan dokumen sumber tidak masuk kontrak analitis ini. Penahanan insight tidak boleh diartikan sebagai persetujuan untuk ekspor narasi tersebut.

## CSV analitis lokal

Format lebar: satu baris per wilayah. Kolom indikator memakai ID stabil agar berkas dapat digunakan kembali tanpa menyamakan besaran yang berbeda.

### Kolom bersama

`kode_bps`, `nama_wilayah`, `jenis_wilayah`, `provinsi`, `tahun_acuan`, `skor_civx`; enam kolom `skor_dimensi_<dimensionId>`; `filter_pencarian`, `filter_jenis_wilayah`, `cakupan_distribusi`, `status_skor`, `status_insight`, `integrasi_produksi_diizinkan`, `id_model`, `versi_model`, `sha256_artefak_skor`, `rujukan_metodologi`, `rujukan_sumber`, dan `ketentuan_pelaporan`.

Urutan dimensi mengikuti facade: `socioeconomic`, `education`, `basic_services`, `public_health`, `disaster_pressure`, `environment`. Skor keseluruhan dan dimensi adalah tekanan relatif 0–100, bukan kualitas atau probabilitas.

### Kolom setiap indikator

Untuk setiap ID indikator CORE, gunakan prefiks `<indicatorId>__`:

| Akhiran | Isi |
| --- | --- |
| `nilai_asli` | Nilai indikator dari facade, bukan hasil normalisasi |
| `satuan` | Satuan asli facade |
| `status_nilai` | `TERSEDIA` untuk observasi CORE yang tervalidasi, termasuk nol |
| `periode_rujukan` | Periode asli, tidak diganti dengan tahun model |
| `tekanan_ternormalisasi` | Tekanan indikator yang sudah dihitung oleh model |
| `arah_tekanan` | Arah tekanan yang dipertahankan dari facade |
| `definisi` | Definisi indikator |
| `pembilang` | Definisi pembilang |
| `penyebut` | Definisi penyebut |
| `sumber_json` | Objek sumber utama, pembilang, dan penyebut; identitas, penerbit, judul, URL, lokasi, serta tanggal tetap utuh |
| `ketidakpastian_json` | Metadata ketidakpastian facade, termasuk nilai null dan nol yang berbeda |
| `keterbatasan_json` | Daftar batasan asli sumber |

`JSON` di dalam sel tetap merupakan teks CSV berpetik, bukan ekspresi spreadsheet. Sumber publikasi asli dirujuk, tidak disalin sebagai dokumen.

### Presisi, missingness, dan keamanan spreadsheet

- UTF-8 dengan BOM; koma; akhir rekaman CRLF; escaping RFC 4180.
- Angka memakai representasi numerik presisi penuh dari facade. Tidak dihitung dari angka tampilan yang dibulatkan.
- Nol ditulis `0`. Tidak ada konversi data hilang atau nilai yang ditahan menjadi nol.
- Facade CORE saat ini hanya menerima profil lengkap. Jika CORE tidak lengkap/tidak sah, laporan analitis gagal; tidak membuat skor parsial atau mengisi sel skor kosong.
- Metadata ketidakpastian yang tidak dilaporkan tetap `null` dalam JSON dan dijelaskan sebagai tidak tersedia pada laporan. Ini bukan nol atau bukti kepastian.
- Penahanan karena izin berbeda dari missingness sumber. Ekspor publik saat ini tidak memiliki kolom analitis, bukan sel analitis kosong yang dapat disalahartikan.
- Teks yang dapat menjadi formula, termasuk setelah spasi/kontrol/format Unicode, diberi awalan apostrof. Angka negatif numerik tidak diubah menjadi teks. Gunakan serializer yang sudah diuji pada `export-2023.ts`.

## Laporan analitis lokal dan PDF

Dokumen HTML mandiri merupakan permukaan cetak A4 lokal. Pembaca dapat membuka berkas melalui `file://`, lalu memakai kontrol cetak atau dialog bawaan peramban untuk menyimpan PDF.

Isi wajib:

1. Branding CIVX, identitas/kode BPS/jenis/provinsi, tahun acuan, model/versi, filter, dan status peninjauan lokal.
2. Skor keseluruhan dan enam skor dimensi dengan profil batang pada skala tetap 0–100; panjang batang memakai skor facade, bukan angka tampilan.
3. Seluruh 18 indikator CORE: nama, deskripsi, nilai asli/satuan, tekanan ternormalisasi, periode, pembilang/penyebut, keterbatasan, dan ketidakpastian yang tersedia.
4. Bibliografi sumber utama serta kedua operand untuk indikator turunan; URL, lokasi tabel/halaman, dan tanggal tetap dipertahankan.
5. Metode dan keterbatasan: kohort 2023, makna tekanan relatif, min–max/bobot, keterbatasan ketidakpastian, tidak adanya kausalitas/prediksi/rekomendasi, serta larangan publikasi tanpa persetujuan.
6. A4, margin yang terbaca, pemenggalan halaman yang tidak memisahkan judul dari isi, dan kontrol yang tidak ikut tercetak. Tampilan layar tetap dapat dibaca dan dioperasikan dengan keyboard pada mobile.

HTML tidak memuat pustaka, font, atau aset jaringan. Teks dan atribut harus di-escape; tautan sumber hanya memakai protokol HTTP/HTTPS. Pembentukan angka dan pengambilan data tidak dilakukan di event handler UI. Seluruh laporan tetap terbaca tanpa animasi.

## Pengamanan alat lokal

CLI tidak membuka port HTTP dan tidak menulis ke `src/`, `public/`, `docs/`, `.next/`, atau direktori repository lainnya. Direktori sementara yang sudah di-resolve harus berada di luar repository; symlink tidak boleh melewati pemeriksaan ini. Gunakan direktori acak bermode `0700` dan berkas bermode `0600` pada POSIX. Jangan menambahkan opsi keluaran yang dapat mengarah ke aset web.

Izin berkas `0600` dijamin untuk CSV dan HTML yang ditulis CLI. PDF dibuat melalui dialog peramban, bukan oleh CLI; lokasi dan izinnya mengikuti pilihan operator serta sistem operasi. Simpan PDF di direktori privat yang sama dan periksa izin sebelum memindahkannya. Pengujian lokal menyimpan PDF di direktori tersebut dengan izin `0600`.

Pengamanan ini mengurangi risiko publikasi tidak sengaja, bukan DRM terhadap pemilik mesin. Pemilik mesin tetap harus menjaga hasil review. Pembatasan laporan publik juga tidak mencegah penyalinan/pencetakan halaman numerik lama; deployment terbuka tetap memerlukan persetujuan terpisah.

## Persetujuan sebelum fitur numerik publik

Pemilik proyek harus mendokumentasikan:

- Persetujuan rilis skor untuk model/versi/artefak tertentu dan tujuan distribusi CSV/PDF; tidak cukup mengubah string status.
- Hak penggunaan/redistribusi untuk setiap sumber dan nilai indikator yang akan dimuat, termasuk syarat atribusi, periode, cakupan, dan ketidakpastian.
- Keputusan integrasi/publikasi produksi yang menggantikan larangan saat ini melalui proses governance yang sah.
- Kontrak ekspor publik versi baru: kolom/nilai yang diizinkan, redaksi nilai yang belum diizinkan, dan perbedaan status missing/withheld.
- Peninjauan implementasi distribusi server dan akses yang sesuai. Tidak ada pengaktifan otomatis berdasarkan flag browser atau hasil pembuatan lokal.

Insight memerlukan persetujuan tersendiri hanya bila kemudian dimasukkan; kontrak ini mengecualikannya. Review metode/sumber independen dan batas geografis efektif tetap menjadi gate proyek. Dokumen ini tidak memberikan persetujuan tersebut.

## Pemakaian lokal yang tersedia

Gunakan Node.js 26.12.0 yang sudah dipakai proyek. Tidak ada paket tambahan atau layanan HTTP untuk alat ini.

```sh
node scripts/prepare-analytical-report-2023.ts --region 3273 --q Bandung --type kota
node scripts/prepare-analytical-report-2023.ts --region 3201
node scripts/prepare-analytical-report-2023.ts --help
```

Perintah pertama membuat CSV satu wilayah dan laporan Kota Bandung. Perintah kedua membuat CSV seluruh kohort dan laporan Kabupaten Bogor. `--region` wajib; `--q` dan `--type` bersifat opsional. Parameter berulang/tidak dikenal, pilihan tidak sah, hasil kosong, dan opsi publikasi/lokasi keluaran ditolak.

Keluaran terminal hanya memuat cakupan review, lokasi berkas, jumlah wilayah, dan petunjuk; bukan angka analitis. Buka URL `file://` HTML yang dikembalikan, pilih **Cetak / Simpan PDF lokal**, gunakan A4, dan simpan dalam direktori privat. Tanpa JavaScript, gunakan menu cetak atau Ctrl+P/Command+P. Rujukan Methodology/Sources memakai alamat lokal standar `http://localhost:3000`; laporan tetap memuat metode dan bibliografi tanpa memerlukan aset jaringan.

CSV lokal memiliki **240 kolom**: 24 kolom bersama dan 18 kelompok indikator × 12 kolom. Pengujian mencakup seluruh 27 wilayah serta hasil filter. Contoh PDF Kota Bandung memuat ringkasan skor/enam dimensi pada halaman pertama dan seluruh bukti indikator/bibliografi pada halaman berikutnya; banyaknya halaman mengikuti panjang bukti, bukan ringkasan dua halaman metadata publik.
