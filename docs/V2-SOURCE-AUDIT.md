# CIVX v2 source audit

**Archived source audit, 27 October 2026.** This records the five-input release's eligibility decisions, not current product navigation or independent approval. [METHODOLOGY-CURRENT.md](METHODOLOGY-CURRENT.md) supersedes healthcare availability, published DBD incidence and disaster-risk eligibility for the unified product. Existing findings and source discrepancies below remain part of the historical evidence.

## Evidence boundary

The 34 candidate concepts below are source-discovery and eligibility findings, not 34 released regional measurements. Catalogue years, reported row counts and inspected samples never establish an exhaustive annual regional panel. A source's `available` audit status is not itself a published score. Audit reasons saying “no scoring applied” describe acquisition, before the separate v2 scorer ran.

Exact definitions, units, limitations, source locators, retrieval diagnostics and provenance remain in the linked JSON audits. The report cites sources and findings rather than reproducing whole copyrighted datasets. “All 27” means the 18 kabupaten and nine kota, retaining distinct BPS identifiers.

## Candidate register

Each entry preserves the audit's actual discovered year window and coverage caveats. Empty years mean no defensible dated observation, not a zero value.

### Services and socioeconomic inputs — 10 concepts

Detailed evidence: [`services-audit.json`](../data/raw/v2/services-audit.json).

#### `poverty` — Persentase penduduk miskin

- **Official source/institution:** [Badan Pusat Statistik Provinsi Jawa Barat](https://jabar.bps.go.id/id/publication/2024/02/28/35ffe2d35104b39feb577e8f/provinsi-jawa-barat-dalam-angka-2024.html).
- **Actual years/window:** 2023.
- **Actual coverage:** All 27 Jawa Barat kabupaten/kota: 18 kabupaten (3201–3218) and nine kota (3271–3279); 27 actual 2023 values inspected, with kabupaten and kota kept distinct.
- **Classification / status:** `core` / `available`.
- **Decision/reason:** All 27 existing v1 percentages independently matched to table 4.6.2. Higher poverty denotes greater basic-needs deprivation; no scoring applied.

#### `unemployment` — Tingkat Pengangguran Terbuka (TPT)

- **Official source/institution:** [Badan Pusat Statistik Provinsi Jawa Barat](https://jabar.bps.go.id/id/publication/2024/02/28/35ffe2d35104b39feb577e8f/provinsi-jawa-barat-dalam-angka-2024.html).
- **Actual years/window:** 2023.
- **Actual coverage:** All 27 Jawa Barat kabupaten/kota: 18 kabupaten (3201–3218) and nine kota (3271–3279); 27 actual 2023 values inspected, with kabupaten and kota kept distinct.
- **Classification / status:** `core` / `available`.
- **Decision/reason:** All 27 existing v1 TPT values independently matched to table 3.2.16, 2023 TPT column. Higher TPT denotes greater open-unemployment burden; no scoring applied.

#### `hdi` — Indeks Pembangunan Manusia (IPM)

- **Official source/institution:** [Badan Pusat Statistik Provinsi Jawa Barat](https://jabar.bps.go.id/id/publication/2024/02/28/35ffe2d35104b39feb577e8f/provinsi-jawa-barat-dalam-angka-2024.html).
- **Actual years/window:** 2023.
- **Actual coverage:** All 27 Jawa Barat kabupaten/kota: 18 kabupaten (3201–3218) and nine kota (3271–3279); 27 actual 2023 values inspected, with kabupaten and kota kept distinct.
- **Classification / status:** `core` / `available`.
- **Decision/reason:** All 27 existing v1 IPM values independently matched to table 4.6.5. Lower IPM indicates greater human-development shortfall; no scoring applied.

#### `sanitation` — Akses rumah tangga terhadap sanitasi layak

- **Official source/institution:** [Badan Pusat Statistik Provinsi Jawa Barat](https://jabar.bps.go.id/id/publication/2024/02/28/35ffe2d35104b39feb577e8f/provinsi-jawa-barat-dalam-angka-2024.html).
- **Actual years/window:** 2023.
- **Actual coverage:** All 27 Jawa Barat kabupaten/kota: 18 kabupaten (3201–3218) and nine kota (3271–3279); 27 actual 2023 values inspected, with kabupaten and kota kept distinct.
- **Classification / status:** `core` / `available`.
- **Decision/reason:** All 27 existing v1 values independently matched to table 4.3.8. Lower improved-sanitation coverage indicates greater household-service shortfall; no scoring applied.

#### `drinking_water` — Akses rumah tangga terhadap sumber air minum layak

- **Official source/institution:** [Badan Pusat Statistik Provinsi Jawa Barat](https://jabar.bps.go.id/id/publication/2024/02/28/35ffe2d35104b39feb577e8f/provinsi-jawa-barat-dalam-angka-2024.html).
- **Actual years/window:** 2023.
- **Actual coverage:** All 27 Jawa Barat kabupaten/kota: 18 kabupaten (3201–3218) and nine kota (3271–3279); 27 actual 2023 values inspected, with kabupaten and kota kept distinct.
- **Classification / status:** `core` / `available`.
- **Decision/reason:** All 27 official 2023 values transcribed from table 4.3.9, 2023 column (5). Lower improved-source coverage indicates greater basic-service shortfall; no scoring applied.

#### `puskesmas_count` — Jumlah Puskesmas

- **Official source/institution:** [Dinas Kesehatan Provinsi Jawa Barat, reproduced by Badan Pusat Statistik Provinsi Jawa Barat](https://jabar.bps.go.id/id/publication/2024/02/28/35ffe2d35104b39feb577e8f/provinsi-jawa-barat-dalam-angka-2024.html).
- **Actual years/window:** 2023.
- **Actual coverage:** All 27 Jawa Barat kabupaten/kota: 18 kabupaten (3201–3218) and nine kota (3271–3279); 27 actual 2023 values inspected, with kabupaten and kota kept distinct.
- **Classification / status:** `context` / `available`.
- **Decision/reason:** All 27 published total counts verified; sum is 1,106, matching the provincial total. Raw counts support the separately documented per-population ratio but do not measure actual access.

#### `puskesmas_per_100k` — Ketersediaan Puskesmas per 100.000 penduduk

- **Official source/institution:** [Dinas Kesehatan Provinsi Jawa Barat, reproduced by Badan Pusat Statistik Provinsi Jawa Barat](https://jabar.bps.go.id/id/publication/2024/02/28/35ffe2d35104b39feb577e8f/provinsi-jawa-barat-dalam-angka-2024.html).
- **Actual years/window:** 2023.
- **Actual coverage:** All 27 Jawa Barat kabupaten/kota: 18 kabupaten (3201–3218) and nine kota (3271–3279); 27 actual 2023 values inspected, with kabupaten and kota kept distinct.
- **Classification / status:** `context` / `available`.
- **Decision/reason:** Both numerator and denominator have all 27 regions and year 2023. Every derived row identifies the exact denominator and source. Keep as context: facility availability is not observed primary-healthcare access, and a single deprivation direction ignores catchment geography and other providers.

#### `dbd_incidence` — Angka kesakitan DBD per 100.000 penduduk

- **Official source/institution:** [Dinas Kesehatan Provinsi Jawa Barat, reproduced by Badan Pusat Statistik Provinsi Jawa Barat](https://jabar.bps.go.id/id/publication/2024/02/28/35ffe2d35104b39feb577e8f/provinsi-jawa-barat-dalam-angka-2024.html).
- **Actual years/window:** 2023.
- **Actual coverage:** All 27 Jawa Barat kabupaten/kota: 18 kabupaten (3201–3218) and nine kota (3271–3279); 27 actual 2023 values inspected, with kabupaten and kota kept distinct.
- **Classification / status:** `context` / `not_comparable`.
- **Decision/reason:** All 27 published rates exist and their units are explicit, but core comparability fails: the population base cannot be reconciled with official 2023 cases and available population counts. Preserve rates only as published context; do not compute or score a replacement rate.

#### `population` — Penduduk sebagai penyebut dan konteks

- **Official source/institution:** [Badan Pusat Statistik Provinsi Jawa Barat; exact counts reproduced in Dinas Kesehatan appendix](https://app-diskes.jabarprov.go.id/drive/s/TyZTzEqnm5TfrM4/download/Profil%20Kesehatan%20Jawa%20Barat%20Tahun%202023.pdf).
- **Actual years/window:** 2023.
- **Actual coverage:** All 27 Jawa Barat kabupaten/kota: 18 kabupaten (3201–3218) and nine kota (3271–3279); 27 actual 2023 values inspected, with kabupaten and kota kept distinct.
- **Classification / status:** `context` / `available`.
- **Decision/reason:** All 27 exact counts acquired; total is 49,860,330. Retain this explicit projection-series denominator for Puskesmas availability. Population size alone is neither civic deprivation nor advantage.

#### `population_density` — Kepadatan penduduk

- **Official source/institution:** [Badan Pusat Statistik Provinsi Jawa Barat](https://jabar.bps.go.id/id/publication/2024/02/28/35ffe2d35104b39feb577e8f/provinsi-jawa-barat-dalam-angka-2024.html).
- **Actual years/window:** 2023.
- **Actual coverage:** All 27 Jawa Barat kabupaten/kota: 18 kabupaten (3201–3218) and nine kota (3271–3279); 27 actual 2023 values inspected, with kabupaten and kota kept distinct.
- **Classification / status:** `context` / `available`.
- **Decision/reason:** All 27 published 2023 densities acquired directly. Keep as settlement context: high density can support efficient services and create congestion or exposure; no single deprivation direction is defensible.

### Infrastructure and disaster — 2 concepts

Detailed evidence: [`infrastructure-audit.json`](../data/raw/v2/infrastructure-audit.json).

#### `road_condition` — Tekanan kondisi jalan: persentase panjang jalan tidak mantap/rusak

- **Official source/institution:** [Dinas Bina Marga dan Penataan Ruang Provinsi Jawa Barat; Badan Pusat Statistik Provinsi Jawa Barat](https://galura.jabarprov.go.id/dataset/panjang-ruas-jalan-berdasarkan-wilayah-uptd-kategori-jalan-kondisi-jalan-dan-kabupatenkota-di-jawa-barat).
- **Actual years/window:** 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025.
- **Actual coverage:** Galura response contained 864 records across 2018–2025. Actual 2023 inspection covered all 27 Jawa Barat kabupaten/kota: 18 kabupaten (3201–3218) and nine kota (3271–3279), with 108 records, exactly four conditions per region. Geographic presence is complete, but this UPTD-managed network is not a comparable measure of all district/city roads. BPS 2024 yearbook tables 9.1.1 and 9.1.4 also display all 27 regions; their authority and condition lengths do not reconcile consistently. Coverage of every other year was not independently audited region by region.
- **Classification / status:** `context` / `not_comparable`.
- **Decision/reason:** Actual records exist for all 27 regions, but eligibility fails on road-network scope and denominator comparability, not data absence. UPTD condition lengths track the provincial managed network rather than the district/city network. A checked Subang discrepancy and inconsistent BPS authority-versus-condition totals prevent a defensible common denominator. Retain source metadata and quality findings only; do not score, merge national/provincial/district roads, or publish a fabricated damaged-road percentage.

#### `disaster_impact` — Dampak bencana per 100.000 penduduk

- **Official source/institution:** [Badan Penanggulangan Bencana Daerah Provinsi Jawa Barat; Badan Nasional Penanggulangan Bencana; Badan Pusat Statistik Provinsi Jawa Barat](https://galura.jabarprov.go.id/dataset/jumlah-korban-jiwa-akibat-bencana-berdasarkan-kondisi-di-jawa-barat).
- **Actual years/window:** 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025.
- **Actual coverage:** Galura response contained 1890 records across 2012–2025. Actual 2023 inspection covered all 27 Jawa Barat kabupaten/kota: 18 kabupaten (3201–3218) and nine kota (3271–3279), with 135 records, five outcome categories per region. BPS table 4.5.7 displays all 27 regions by disaster type for 2023. The BNPB book's inspected appendix supplies provincial comparisons; a separate all-27 BNPB machine-readable series was not acquired. Coverage of every other Galura year was not independently audited region by region.
- **Classification / status:** `context` / `not_comparable`.
- **Decision/reason:** Actual all-27 BPBD data are available, but cross-source outcome totals differ materially and metadata does not resolve repeated persons, overlap among outcomes, event inclusion, reporting completeness, or revision cutoffs. Dividing by population would not repair those problems. Retain contextual metadata and the source-quality audit; do not sum incompatible outcomes or publish a synthetic per-100000 pressure score.

### Context and capabilities — 22 concepts

Detailed evidence: [`context-advantages-audit.json`](../data/raw/v2/context-advantages-audit.json).

#### `traffic_congestion` — Kemacetan lalu lintas / historical Waze

- **Official source/institution:** [Open Data Jawa Barat; historical Waze analysis](https://opendata.jabarprov.go.id/en/article/menilik-tren-mudik-sebelum-dan-ketika-pandemi).
- **Actual years/window:** 2019, 2020, 2021.
- **Actual coverage:** Historical holiday analysis discovered through indexed article; no comparable 2023 kabupaten/kota Waze panel recovered.
- **Classification / status:** `context` / `historical`.
- **Decision/reason:** Retain historical context only. The old article now redirected to a JavaScript shell; no raw traffic observations were recovered.

#### `mobility_intensity` — Intensitas mobilitas / traffic activity

- **Official source/institution:** [Dinas Perhubungan Provinsi Jawa Barat / Galura Data](https://galura.jabarprov.go.id/dataset/jumlah-penumpang-angkutan-umum-berdasarkan-kabupatenkota-di-jawa-barat).
- **Actual years/window:** 2022, 2023, 2024, 2025.
- **Actual coverage:** Passenger-count catalogue claims kabupaten/kota 2022–2025; no general trip-intensity or origin-destination panel established.
- **Classification / status:** `context` / `not_comparable`.
- **Decision/reason:** Available transport proxies do not measure a consistent region-wide mobility intensity.

#### `reported_crime` — Tindak pidana / reported crime

- **Official source/institution:** [BPS Provinsi Jawa Barat; originating police administrative statistics](https://jabar.bps.go.id/id/statistics-table/3/VlVneFlXOVJOSFpNUzNKcU4zVlFla2syVEZjd1VUMDkjMyMzMjAw/jumlah-kejahatan-yang-dilaporkan-risiko-penduduk-terkena-kejahatan-per-100-000-penduduk-persentase-penyelesaian-kejahatan-dan-selang-waktu-terjadinya-kejahatan-menurut-kabupaten-kota-di-provinsi-jawa-barat.html?year=2023).
- **Actual years/window:** 2023.
- **Actual coverage:** 2023 statistical-table heading recovered; numeric rows and complete matching of police jurisdiction to all 27 civil regions not recovered.
- **Classification / status:** `context` / `incompatible_geography`.
- **Decision/reason:** The recovered heading mixes Kepolisian Daerah and kabupaten/kota; jurisdiction and coverage must be reconciled before any regional comparison.

#### `public_transport_passengers` — Penumpang angkutan umum

- **Official source/institution:** [Dinas Perhubungan Provinsi Jawa Barat / Galura Data](https://galura.jabarprov.go.id/dataset/jumlah-penumpang-angkutan-umum-berdasarkan-kabupatenkota-di-jawa-barat).
- **Actual years/window:** 2022, 2023, 2024, 2025.
- **Actual coverage:** 108 total rows reported; first displayed year 2022; kabupaten/kota codes present in sample. Complete annual regional coverage not established.
- **Classification / status:** `context` / `not_comparable`.
- **Decision/reason:** Unresolved scope conflict prevents treating this as all public transit usage.

#### `terminal_passengers` — Penumpang masuk dan keluar terminal tipe C

- **Official source/institution:** [Dinas Perhubungan Provinsi Jawa Barat / Galura Data](https://galura.jabarprov.go.id/dataset/jumlah-penumpang-masuk-dan-keluar-melalui-terminal-tipe-c-berdasarkan-kabupatenkota-di-jawa-barat).
- **Actual years/window:** 2020, 2021, 2022, 2023, 2024, 2025.
- **Actual coverage:** 162 total rows reported; first displayed year 2020; regional codes in samples only.
- **Classification / status:** `context` / `partial_coverage`.
- **Decision/reason:** Terminal-specific usage can provide context only after coverage, counting method and redistribution permission are resolved.

#### `public_transport_modes` — Moda dan armada angkutan umum

- **Official source/institution:** [Dinas Perhubungan Provinsi Jawa Barat / Galura Data](https://galura.jabarprov.go.id/dataset/jumlah-moda-transportasi-angkutan-kota-dalam-provinsi-berdasarkan-kabupatenkota-di-jawa-barat).
- **Actual years/window:** 2022, 2023, 2024, 2025.
- **Actual coverage:** AKDP and urban/rural mode tables each report 108 rows; first two regional samples inspected.
- **Classification / status:** `context` / `not_comparable`.
- **Decision/reason:** Sample equality across differently named concepts and inconsistent descriptions prevent a defensible combined mode-supply measure.

#### `akdp` — Angkutan AKDP / provincial road transit

- **Official source/institution:** [Dinas Perhubungan Provinsi Jawa Barat / Galura Data](https://galura.jabarprov.go.id/dataset/jumlah-moda-transportasi-angkutan-kota-dalam-provinsi-berdasarkan-kabupatenkota-di-jawa-barat).
- **Actual years/window:** 2022, 2023, 2024, 2025.
- **Actual coverage:** 108 rows reported; first sample year 2022; sampled field uses kode_kabupaten, unlike metadata kode_kabupaten_kota.
- **Classification / status:** `context` / `not_comparable`.
- **Decision/reason:** First two sampled region-year counts exactly match urban/rural table samples; underlying source semantics require producer confirmation.

#### `urban_transit` — Angkutan kota/desa / urban transit

- **Official source/institution:** [Dinas Perhubungan Provinsi Jawa Barat / Galura Data](https://galura.jabarprov.go.id/dataset/jumlah-moda-transportasi-angkutan-kotadesa-berdasarkan-kabupatenkota-di-jawa-barat).
- **Actual years/window:** 2022, 2023, 2024, 2025.
- **Actual coverage:** 108 rows reported; first sample year 2022; sampled regional codes present.
- **Classification / status:** `context` / `not_comparable`.
- **Decision/reason:** First two regional samples equal AKDP samples. Unit description still refers to goods transport despite the passenger-mode title.

#### `railway` — Layanan kereta api

- **Official source/institution:** [Dinas Perhubungan Provinsi Jawa Barat / Galura Data; Pemerintah Provinsi Jawa Barat](https://galura.jabarprov.go.id/dataset/jumlah-penumpang-kereta-api-jarak-jauh-daop-2-berdasarkan--stasiun-di-jawa-barat-).
- **Actual years/window:** 2021, 2022, 2023, 2024, 2025.
- **Actual coverage:** 2021 station register; 2022–2025 DAOP 1/2/3 long-distance passenger catalogues. DAOP 2 probe reported 68 rows, first year 2022. Feeder operation dated 2023 separately documented.
- **Classification / status:** `context` / `partial_coverage`.
- **Decision/reason:** Station status, long-distance use, feeder and commuter service are separate concepts and years.

#### `commuter_rail` — KRL / commuter rail / LRT

- **Official source/institution:** [KAI Commuter; Sekretariat Kabinet Republik Indonesia](https://setkab.go.id/presiden-jokowi-resmikan-lrt-terintegrasi-jabodebek/).
- **Actual years/window:** 2023.
- **Actual coverage:** Official LRT inauguration and listed stations in Jabodebek, 28 August 2023; no audited 27-region KRL panel. KRL article direct fetch failed after redirect.
- **Classification / status:** `advantage` / `partial_coverage`.
- **Decision/reason:** Official LRT statement confirms operation but does not itself provide an unambiguous civil-region code for every station; no code-level KRL/LRT observation assigned.

#### `brt` — BRT / Trans Metro Pasundan / Metro Jabar Trans

- **Official source/institution:** [PPID Provinsi Jawa Barat; Dinas Perhubungan](https://ppid.jabarprov.go.id/pages/berita/149).
- **Actual years/window:** 2024.
- **Actual coverage:** Official statement dates rebranding to Metro Jabar Trans on 31 December 2024 in Kota Bandung and refers to five existing corridors; no 2023 region-by-region operation evidence recovered.
- **Classification / status:** `advantage` / `partial_coverage`.
- **Decision/reason:** Keep verified statement in its actual 2024 period. Do not backdate MJT rebranding or count all Bandung Raya as served in 2023.

#### `major_terminals` — Terminal besar / intercity bus terminals

- **Official source/institution:** [Dinas Perhubungan Provinsi Jawa Barat / Galura Data; Sekretariat Kabinet Republik Indonesia](https://galura.jabarprov.go.id/dataset/daftar-terminal-berdasarkan-tipe-di-jawa-barat).
- **Actual years/window:** 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2024.
- **Actual coverage:** Galura terminal register reports 186 rows, first year 2016, catalogue 2016–2022. Separate Setkab statement explicitly locates Leuwipanjang in Kota Bandung and Banjar terminal in Kota Banjar on 3 February 2024.
- **Classification / status:** `advantage` / `partial_coverage`.
- **Decision/reason:** Historical inventory is not a current operational register. Official terminal revitalization statement provides specific 2024 evidence, not a 2023 inventory.

#### `toll_road` — Jalan tol operasional

- **Official source/institution:** [Badan Pengatur Jalan Tol, Kementerian PUPR; Sekretariat Kabinet Republik Indonesia](https://bpjt.pu.go.id/cek-tarif-terbaru-jalan-tol-cisumdawu-seksi-4-hingga-6-mulai-bertarif/).
- **Actual years/window:** 2023.
- **Actual coverage:** Verified Cisumdawu infrastructure in Kabupaten Sumedang (3211); no exhaustive inventory for all 27 regions.
- **Classification / status:** `advantage` / `partial_coverage`.
- **Decision/reason:** Setkab explicitly locates the road inauguration/tunnels in Sumedang; BPJT confirms operation before tariffs began on 14 August 2023.

#### `public_wifi` — WiFi publik

- **Official source/institution:** [Dinas Komunikasi dan Informatika Provinsi Jawa Barat / Galura Data](https://galura.jabarprov.go.id/dataset/jumlah-titik-layanan-akses-internet-publik-wifi-berdasarkan-kabupatenkota-di-jawa-barat).
- **Actual years/window:** 2019, 2020, 2021, 2022, 2023.
- **Actual coverage:** 134 total rows reported across catalogue 2019–2023; first displayed year 2019. No verified complete 27-by-5 panel.
- **Classification / status:** `advantage` / `partial_coverage`.
- **Decision/reason:** Potential local asset only. Numeric rows withheld under terms; active service and annual completeness need further evidence.

#### `digital_infrastructure` — Infrastruktur digital / internet desa

- **Official source/institution:** [Dinas Komunikasi dan Informatika Provinsi Jawa Barat / Galura Data](https://galura.jabarprov.go.id/dataset/status-desa-yang-memiliki-akses-internet-berdasarkan-desakelurahan-di-jawa-barat).
- **Actual years/window:** 2019, 2020, 2021, 2022, 2023.
- **Actual coverage:** Village-status internet catalogues report 2019–2023; annual regional aggregation and service quality not inspected. Separate government intranet register catalogue is 2022 only.
- **Classification / status:** `advantage` / `partial_coverage`.
- **Decision/reason:** Catalogue discovery identifies possible assets but no verified code-level production presence is assigned.

#### `internet_programs` — Program Desa Digital / internet deployment

- **Official source/institution:** [Dinas Komunikasi dan Informatika Provinsi Jawa Barat](https://desadigital.jabarprov.go.id/desadigital-level1).
- **Actual years/window:** Undated; no verified observation year.
- **Actual coverage:** Programme overview and eligibility criteria read; no dated region-by-region completion/uptime list recovered.
- **Classification / status:** `advantage` / `partial_coverage`.
- **Decision/reason:** Official programme description supports programme existence, not an actual-year kabupaten/kota advantage record.

#### `healthcare_availability` — Ketersediaan rumah sakit / high healthcare availability

- **Official source/institution:** [Dinas Kesehatan Provinsi Jawa Barat / Galura Data](https://galura.jabarprov.go.id/dataset/daftar-rumah-sakit-berdasarkan-jenis-dan-kelas-di-jawa-barat).
- **Actual years/window:** 2019, 2020, 2021, 2022, 2023.
- **Actual coverage:** Hospital register reports 1,917 rows across catalogue 2019–2023; first displayed year 2019. Regional codes, class and type present in samples.
- **Classification / status:** `context` / `partial_coverage`.
- **Decision/reason:** A hospital register alone cannot establish unusually high healthcare availability or adequate provision per resident.

#### `referral_hospitals` — Rumah sakit rujukan tersier

- **Official source/institution:** [RSUP Dr. Hasan Sadikin; Kementerian Kesehatan](https://ppid.rshs.go.id/profil/).
- **Actual years/window:** Undated; no verified observation year.
- **Actual coverage:** Official undated profile explicitly describes a top tertiary referral hospital and its location in Kota Bandung. A separate 2023 commemoration article does not date the profile service claims.
- **Classification / status:** `advantage` / `partial_coverage`.
- **Decision/reason:** Profile supports institutional role and geography but not a defensible actual-year service observation. No artificial 2023 date assigned.

#### `operational_airport` — Bandara dengan penerbangan aktual

- **Official source/institution:** [Sekretariat Kabinet Republik Indonesia](https://setkab.go.id/en/press-statement-of-president-of-the-republic-of-indonesia-after-inspection-to-west-java-international-airport-bijb-of-kertajati-majalengka-city-west-java-province-july-11-2023/).
- **Actual years/window:** 2023.
- **Actual coverage:** Verified Kertajati in Kabupaten Majalengka (3210), 11 July 2023; not a province-wide airport or route inventory.
- **Classification / status:** `advantage` / `partial_coverage`.
- **Decision/reason:** Presidential statement explicitly describes existing Hajj, Umrah and Kuala Lumpur flights. Contemporaneous Setkab article explicitly places Kertajati in Majalengka regency.

#### `major_stations` — Stasiun besar / active station access

- **Official source/institution:** [Dinas Perhubungan Provinsi Jawa Barat / Galura Data; Sekretariat Kabinet Republik Indonesia](https://galura.jabarprov.go.id/dataset/daftar-stasiun-berdasarkan-kabupatenkota-di-jawa-barat).
- **Actual years/window:** 2021, 2023.
- **Actual coverage:** 2021 registry reports 141 station rows and operational-status field. Independent official 2 October 2023 statement verifies Padalarang in Kabupaten Bandung Barat.
- **Classification / status:** `advantage` / `partial_coverage`.
- **Decision/reason:** 2021 catalogue is historical. Padalarang has separate 2023 operational evidence and appears once as high_speed_rail, not as a duplicate additive advantage.

#### `interregional_connections` — Konektivitas antardaerah

- **Official source/institution:** [Sekretariat Kabinet Republik Indonesia; BPJT; Pemerintah Provinsi Jawa Barat](https://setkab.go.id/en/president-jokowi-officiates-operation-of-whoosh-high-speed-train/).
- **Actual years/window:** 2023.
- **Actual coverage:** Targeted evidence: Whoosh Padalarang, operational Kertajati flights, Cisumdawu. Separate feeder report describes Bandung–Padalarang operation from 3 October 2023 and stops at Cimahi.
- **Classification / status:** `advantage` / `partial_coverage`.
- **Decision/reason:** Official sources support specific connections; no province-wide connectivity score, full network matrix or inferred absence.

#### `high_speed_rail` — Kereta cepat Whoosh

- **Official source/institution:** [Sekretariat Kabinet Republik Indonesia](https://setkab.go.id/en/president-jokowi-officiates-operation-of-whoosh-high-speed-train/).
- **Actual years/window:** 2023.
- **Actual coverage:** Verified Padalarang Station within Kabupaten Bandung Barat (3217) on 2 October 2023. Other stops named, but no extra regional codes assigned without explicit local geography evidence.
- **Classification / status:** `advantage` / `partial_coverage`.
- **Decision/reason:** Official statement both commences operation and explicitly names Padalarang, West Bandung regency; one qualitative observation assigned.

## Released regional evidence and exclusions

Five core inputs cover all 27 regions in 2023: poverty, unemployment, HDI, improved sanitation and improved drinking-water source. The socioeconomic dimension receives 50% overall, with internal weights 25% poverty, 50% unemployment and 25% HDI. Basic services receives 50% overall, split equally between sanitation and water. The shared deprivation budget caps poverty/HDI overlap; this is not five equal weights. Improved sources do not establish safely managed water or sanitation.

Healthcare access, DBD, road condition and disaster impact are **not core inputs**. Puskesmas availability is not observed access. DBD denominators remain unresolved. Road jurisdictions/lengths and disaster definitions/totals do not reconcile. Density has no penalty and cannot alter pressure. Waze is historical 2019–2021 discovery, with no recovered regional observations; it is never relabelled 2023. Police jurisdictions do not establish administrative-region comparability. Terminal passengers do not mean total transit use. AKDP and urban/rural samples have suspicious identical values and conflicting descriptions; producer clarification and Galura reuse permission remain unresolved. Digital catalogues/programmes produce **no verified regional positives**.

Only three targeted advantages are released, all `verified_present`:

| Region | Dated official evidence | Scope |
| --- | --- | --- |
| Kabupaten Bandung Barat `3217` | [Sekretariat Kabinet, 2 October 2023](https://setkab.go.id/en/president-jokowi-officiates-operation-of-whoosh-high-speed-train/) | Whoosh operation; Padalarang explicitly located in West Bandung regency. |
| Kabupaten Majalengka `3210` | [Presidential statement / Sekretariat Kabinet, 11 July 2023](https://setkab.go.id/en/press-statement-of-president-of-the-republic-of-indonesia-after-inspection-to-west-java-international-airport-bijb-of-kertajati-majalengka-city-west-java-province-july-11-2023/) | Kertajati existing Hajj, Umrah and Kuala Lumpur flights; supporting official geography retained in evidence. |
| Kabupaten Sumedang `3211` | [Sekretariat Kabinet, 11 July 2023](https://setkab.go.id/en/president-jokowi-inaugurates-cisumdawu-toll-road/) | Cisumdawu inauguration; separate BPJT evidence confirms operation before tariffs began 14 August 2023. |

[Released advantage observations](../data/raw/v2/context-advantages-observations.json) retain exact sources and assignment reasons. Named `context-evidence-*.json` snapshots retain brief official excerpts and metadata findings. These dates establish presence then, not full-year frequency, service quality, region-wide access or service today. No exhaustive transport inventory, duplicated additive station benefit or connectivity score is inferred. Missing optional evidence means `no_comparable_data`, not absence or disadvantage. `verified_absent` requires its own evidence; no absence is fabricated. Advantages never reduce pressure.

## Release, precision and sensitivity

- Policy: [`data/methodology/civx-jabar-2023-v2.json`](../data/methodology/civx-jabar-2023-v2.json).
- Core/context observations: [`services-observations.json`](../data/raw/v2/services-observations.json).
- Release: [`civx-jabar-2023-v2.json`](../data/processed/civx-jabar-2023-v2.json), 27 scored regions.
- Sensitivity: [`civx-jabar-2023-v2-sensitivity.json`](../data/processed/civx-jabar-2023-v2-sensitivity.json), six alternative scenarios and regional changes.
- Regenerate sensitivity with `node scripts/build-civic-v2.mjs --sensitivity`, then release with `node scripts/build-civic-v2.mjs`.

Arithmetic uses full precision before components, dimensions, contributions and totals independently round to two decimals. Rounded contributions need not sum exactly to the rounded total. Six alternatives test 60/40 dimensions, 40/60 dimensions, equal socioeconomic weights, five equal indicators, poverty-only deprivation and HDI-only deprivation. Mean absolute changes are respectively 2.96, 2.96, 2.58, 3.72, 1.95 and 1.95 points; maximum ordering movements are 8, 5, 5, 7, 5 and 4. The selected 50/50 dimension budget and shared deprivation allocation preserve conceptual balance, not a preferred order. See the methodology's complete result table and caveats. Sensitivity is descriptive, not a formal uncertainty estimate, independent review or validation of additive compensation.

## Acquisition, rights and remaining limits

The original health PDF was acquired only through a temporary/environment-supplied artifact; its provenance fingerprint and locators remain in observations. It is not a committed redistribution. The restricted BPS book stays in the ignored local acquisition path. Galura source discovery and inspected diagnostics do not grant reuse rights; numeric source rows remain withheld where permission is unresolved. Normal builds use the committed derived release, not a downloaded book.

Independent transcription/method review, BPS rights, Galura permissions, effective-boundary certification, source revision governance, sampling uncertainty and complete optional coverage remain unresolved. Source windows differ within 2023. The separately licensed approximate 2020 display geometry does not certify 2023 boundaries. Only overall, socioeconomic and basic-services layer descriptors exist; no v2 map is released. Five inputs do not provide a comprehensive civic assessment.

## Completion evidence and changed files

Before this continuation, repository/v1 inspection, the v1 integrity manifest, service-source audit and 270 numeric observations were already present. Infrastructure/transport/capability investigations had run but stopped before their final audit files were saved. This continuation recovered that evidence rather than repeating completed research.

Completed now: the remaining audits and three dated positive capability records; isolated v2 typed contracts, eligibility/scoring/read-boundary guards; versioned policy and six-scenario sensitivity; 27-region output; progressive version-aware UI; planning/method/source documentation; and 16 additional behavioral regressions. Three read-boundary gaps found during review were reproduced and fixed: promotion of context to advantage, mismatched core boundary references, and map-layer values detached from released pressure.

Changed existing files:

- `README.md`, `package.json`.
- `docs/DATA.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/TASKS.md`.
- `src/app/sources/page.tsx`.
- `src/components/explore/explore-page.tsx`.
- `src/components/methodology/methodology-page.tsx`.
- `src/components/regions/region-detail.tsx`.

New data/method files:

- `data/raw/v2/infrastructure-audit.json`.
- `data/raw/v2/context-advantages-audit.json`, `data/raw/v2/context-advantages-observations.json`.
- `data/raw/v2/context-evidence-whoosh-2023.json`, `context-evidence-kertajati-2023.json`, `context-evidence-cisumdawu-2023.json`, `context-evidence-cisumdawu-tariff-2023.json`, `context-evidence-metadata-findings.json`.
- `data/methodology/civx-jabar-2023-v2.json`.
- `data/processed/civx-jabar-2023-v2.json`, `data/processed/civx-jabar-2023-v2-sensitivity.json`.

New implementation/evidence files:

- `src/lib/civx/v2/types.ts`, `model.ts`, `data.ts`.
- `scripts/build-civic-v2.mjs`, `tests/v2.test.mjs`.
- `src/components/data/release-switcher.tsx`, `release-switcher.module.css`.
- `src/components/v2/release-overview.tsx`, `region-register.tsx`, `region-detail.tsx`, `evidence.tsx`, `v2.module.css`.
- `src/app/v2/page.tsx`, `src/app/v2/regions/[id]/page.tsx`.
- `docs/METHODOLOGY-V2.md`, `docs/V2-SOURCE-AUDIT.md`.
- `.taste-skill/v2/direction.json`, `browser-checks.json`, `critique.md`.

Protected v1 artifacts and the earlier `services-audit.json` / `services-observations.json` were not rewritten. No dependencies were added.

| Check | Observed result |
| --- | --- |
| `npm test` | 27 passed, zero failed; all 11 prior tests preserved |
| `npm run lint` | Passed |
| `npm run build` | Passed; TypeScript and 66-page static generation completed |
| `CIVX_V2_HEALTH_PDF=... npm run data:build:v2` | Passed; 27/27 scores; immutable output reproduced exactly |
| Taste source lint | 0 FAIL, 0 WARN |
| Production-browser smoke | Version switching, disclosure, three positives, missing capabilities, invalid region and preserved routes exercised |
| Responsive/contrast measurements | Two new surfaces × four widths × two themes; no document overflow or computed text-contrast failure |
| Standalone taste inspector | Could not launch because executable discovery found no local Chrome; no pass claimed |

Managed Chromium screenshots were reviewed at 1440, 768 and 390px; additional measurements covered 320px and both themes. The app-screen critique records the retained brand, direction seed, redraw reason and known visual-testing limit. Browser smoke is not formal accessibility certification.
