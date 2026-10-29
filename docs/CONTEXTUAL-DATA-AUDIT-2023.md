# CIVX Contextual Data Audit — 2023 profiles

## Executive result

**Context only. No contextual observation affects a CIVX score or the CORE Insight Engine.** The audit prefers 2023 but retains actual source periods rather than relabelling nearby-year evidence.

| Domain | Decision and usable evidence |
| --- | --- |
| Traffic / congestion | `PARTIAL_CONTEXT`: two distinct metrics for eight selected Kota Bandung road sites in the 2024 accountability report. **No defensible all-27 regional congestion panel was established.** |
| Transport / mobility | `PARTIAL_CONTEXT`: 2023 Type C terminal inventory for 25 regions and October 2023 commuter shares for five Jabodetabek residence regions. Neither is a universal accessibility or congestion measure. |
| Crime / public-safety context | `ACCEPT_CONTEXT`: BPS Podes village/kelurahan theft-occurrence counts for all 27 civil regions, referring to the year preceding May 2024 enumeration. **Not calendar-2023 crime incidents or resident risk.** Police-recorded 2023 counts/rates are rejected for unresolved jurisdiction and denominator issues. |
| Detailed air pollution | `PARTIAL_CONTEXT`: dated KLH/BPLH station ISPU and PM2.5-component index snapshots at 29 October 2026, 16:00 source-local time, associated with five regions. **No accepted 2023 PM concentration panel or regional exposure estimate.** |

The [frozen indicator contract](FINAL-INDICATOR-FREEZE-2023.md), [normalization](NORMALIZATION-DESIGN-2023.md), [weighting](WEIGHTING-DESIGN-2023.md), [scoring](SCORING-ENGINE-2023.md) and [CORE insights](INSIGHT-ENGINE-2023.md) remain unchanged. This is `AUDITED_CONTEXT_NOT_INTEGRATED`, not frontend integration, a new scoring release, public ranking, deployment, or rights clearance for reproducing entire publications.

**27 candidate metrics investigated; 1 `ACCEPT_CONTEXT`, 6 `PARTIAL_CONTEXT`, 20 `REJECT`.** Seven prepared metric artifacts retain 84 observations and 43 source receipts. Paired traffic and air metrics share source cohorts; they are not independent regional datasets or additive signals.

## 1. Research and decision method

Access date: **29 October 2026**. Research began with existing repository contextual findings, then inspected original official catalogues, public tables, publication methods, actual PDF cells, current usage terms and selected live/historical interfaces. Search results located sources; search snippets were not quantitative evidence. News was not used as a dataset source.

Priority was traffic/congestion, then transport, crime and detailed air context. No unrelated fifth domain was added merely to fill coverage. Official agencies and BPS take precedence. Commercial traffic products were investigated only with their methodology and usage restrictions.

Each candidate in `data/processed/contextual-data-catalog-2023.json` records:

- ID, domain, title, publisher, exact public URL and source type;
- actual reference period and publication date when known;
- geographic level, inspected source regions, source identifiers, BPS mappings and coverage;
- unit, literal definition, numerator, denominator and measurement method;
- missingness, update frequency, machine readability and reproducibility;
- usage notes, comparability, biases, limitations, recommended use and decision reason;
- safe/unsafe interpretations, controlled statement templates and temporal warnings;
- source references, raw evidence pointer and prepared-artifact path, or explicit null for a rejected candidate.

Only `ACCEPT_CONTEXT`, `PARTIAL_CONTEXT` and `REJECT` are valid decisions. Acceptance requires reproducible observations, useful geography, actual period, interpretable unit/definition and no unresolved fatal comparison or rights issue for the proposed narrow use. Partial acceptance is a restriction, not a lower-quality substitute for missing regions. Rejections retain audit findings but emit no numeric dataset.

**Coverage semantics:** `coverageCount` counts CIVX regions with retained verified usable observations. `regionsAvailable` and `sourceMappedRegionCount` separately describe inspected source geography. A catalogue claiming 27 rows, a restricted table, or an empty historical endpoint does not establish 27 usable observations. Site association counts where observations are located, not how much of that region they represent.

“Reproducible” means another developer can re-extract the identified published values and replay the audited transcriptions. It does not mean the field survey can be repeated independently, every original publication is redistributable, or a live endpoint is guaranteed to remain available. Retrieval methods and actual fetched-byte hashes distinguish those cases.

## 2. Traffic / congestion — highest-priority findings

### Prepared narrow evidence

Source: [Laporan Capaian Akuntabilitas Kinerja Pemerintah Kota Bandung Tahun 2024](https://ppid.bandung.go.id/storage/ppid_utama/tXhODbnLeFY8sEMGZj4ytTxPpQEPf9e3UYsTCaKV.pdf), Table 2.49, printed p. 129 / PDF p. 136; adjacent discussion printed p. 130 / PDF p. 137. Publisher: Pemerintah Kota Bandung, measurements attributed to Dinas Perhubungan. The [official PPID listing](https://ppid.bandung.go.id/informasi-publik) links the report.

Two **separate** prepared datasets retain only the table's `Sesudah` columns:

| Dataset ID | Original unit | Coverage | Literal measure |
| --- | --- | --- | --- |
| `context_traffic_bandung_2024_after_speed` | km/jam | Eight road sites associated with Kota Bandung `3273`; 26 other regions missing | Reported mean speed after handling |
| `context_traffic_bandung_2024_after_vc_ratio` | Dimensionless ratio | Same selected sites; no regional mean | Reported traffic volume/capacity ratio after handling |

Sites: Buah Batu, Braga, Naripan, WR. Supratman, Cihampelas, Cikutra Barat, Surya Sumantri and Ciwastra. Exact table labels and row locators remain in each observation. There is no road-network coverage estimate, population exposure estimate, annual-city average, percentile or rank. The two metrics are not mixed into one number.

**Period:** 2024 reporting year, measurements following handling; exact survey dates, hours, durations, direction, instrument, sample size and averaging protocol are not stated. The report year is not treated as continuous annual monitoring. Before-handling values are not imported because their exact dates are unspecified. PDF creation/modification metadata in 2025 are neither survey dates nor asserted release dates; publication date remains null.

**Source inconsistencies remain visible:** the report's later “all eight” clearance prose conflicts with its earlier six-road account and two table rows. Buah Batu segment bounds differ between narrative and table. This audit retains table-specific facts only, excludes clearance classifications, does not extend a measurement to the whole road, and makes no causal treatment-effect claim.

**Safe:** “The 2024 report lists the stated post-handling speed or V/C for this selected road row; survey dates are unspecified.”

**Unsafe:** “Bandung's annual congestion is X%,” “all eight roads were cleared,” “handling caused this improvement,” or comparisons with cities measured by another provider.

Suggested deterministic templates are retained per metric. For speed:

> Dalam laporan kinerja2024, Dinas Perhubungan Kota Bandung mencantumkan kecepatan rata-rata sesudah penanganan untuk {siteName} sebesar {value} km/jam. Tanggal dan jam survei tidak dirinci; angka ini bukan rata-rata kota.

Recommended frontend treatment: a clearly dated **selected road observations** disclosure, with site labels, original units, source link and method warning. The regional scalar stays null. Do not use a city congestion badge, map choropleth or cross-region comparison.

### Investigated traffic alternatives

| Candidate suffix under `context_traffic_` | Decision | Observed reason |
| --- | --- | --- |
| `bogor_kedung_halang_segment` | `REJECT` | Official catalogue shows road/day-type rows, but current terms restrict personal/noncommercial and nontransferable use. Volume/capacity wording also conflicts; 2023 field dates were not recovered. |
| `bandung_2023_mixed_labels` | `REJECT` | Actual 2023 report table has stale 2022 summary labels; newer retrospective baseline differs. Do not invent a reconciliation. |
| `bandung_renja2025_undated_measurements` | `REJECT` | Workplan road values have no established measurement year. A 2025 document title is not a survey date. |
| `bandung_counting_register_only` | `REJECT` | Public-information register identifies a traffic-counting dataset, not observed traffic rows or a 2023 sampling window. |
| `binamarga_its_historical` | `REJECT` | Actual historical UI queries for a Bekasi site/date in 2023 and Karawang site/date in 2024 returned HTTP 200 empty objects. Empty is not zero; two failed queries do not establish that every historical date is unavailable. |
| `tomtom_bandung_historical` | `REJECT` | Current primary page is 2025, historical 2023 values were not established, functional City/Metro geography is not certified BPS geography, and usage policy restricts copying/distribution/scraping. |
| `waze_holiday_article` | `REJECT` | Prior 2019–2021 holiday-analysis discovery; current primary URL yields no recovered observations. No 2023 panel. |
| `bandung_regency_missing_catalog` | `REJECT` | Primary SDI catalogue URL returned 404; no verified period, unit, method or values. |

Primary alternatives include [Bogor's segment catalogue](https://opendata.kotabogor.go.id/dataset/volume-lalu-lintas-segmen-i-berdasarkan-hari-operasionaldi-jalan-raya-pemda-kedung-halang-di-kota-bogor), [Bogor terms](https://opendata.kotabogor.go.id/ketentuan-penggunaan), [Bina Marga traffic statistics](https://its.binamarga.pu.go.id/statistics/trafficStatistics), [TomTom Bandung](https://www.tomtom.com/traffic-index/city/bandung/), [TomTom methods](https://www.tomtom.com/traffic-index/about/) and [TomTom usage policy](https://www.tomtom.com/en-us/legal/acceptable-use-policy/). All exact URLs, access findings and limitations are preserved in the catalogue and raw traffic receipt.

## 3. Transport / mobility

### Type C terminal inventory — `PARTIAL_CONTEXT`

Dataset: `context_transport_type_c_terminal_inventory_2023`.

Source: [Provinsi Jawa Barat Dalam Angka 2024](https://jabar.bps.go.id/id/publication/2024/02/28/35ffe2d35104b39feb577e8f/provinsi-jawa-barat-dalam-angka-2024.html), Table 9.1.5, printed p. 612 / PDF p. 688. Publisher BPS Provinsi Jawa Barat; original producer Dinas Perhubungan. Actual table heading states 2022 and 2023 despite an inconsistent contents-page heading. Only the terminal-count 2023 column is retained.

**Coverage:** 25 numeric regional values. Missing: Kabupaten Cirebon `3209` and Kabupaten Subang `3213`, whose cells contain dashes. The source's general notes call dash “negligible”; the audit does not turn that symbol into numeric zero. Kota Banjar `3279` has an explicit numeric zero and retains zero. The other 25 regional records are not proof of operating routes or terminal service quality.

**Definition:** administrative inventory of Type C terminals, original unit `terminal`. Exact inventory date and current operating status are unspecified. No population, area or travel-time denominator is invented.

**Safe:** reported Type C terminal count in the stated 2023 inventory.

**Unsafe:** more terminals means better accessibility; zero means no public transport; counts establish capacity, frequency, proximity or service adequacy.

Frontend: inventory fact with year, category, source and scope warning. Missing cells stay null. No service-access grade or ranking.

### Commuter share — `PARTIAL_CONTEXT`

Dataset: `context_transport_commuter_share_jabodetabek_2023`.

Source: [Statistik Komuter Jabodetabek Hasil Survei Komuter Jabodetabek 2023](https://www.bps.go.id/id/publication/2024/03/28/33b6bef825944e576e7ea3ba/statistik-komuter-jabodetabek-hasil-survei-komuter-jabodetabek-2023.html), Table 1, printed p. 11 / PDF p. 71; BPS, published 28 March 2024. The survey collected data in October 2023 and asks about routine travel during the previous month.

**Exact CIVX coverage:** Kabupaten Bogor `3201`, Kabupaten Bekasi `3216`, Kota Bogor `3271`, Kota Bekasi `3275` and Kota Depok `3276`. The other 22 regions are outside the source frame, not zero-commuting regions.

The denominator is residents aged five years and above, not all ages, workers only, trips or public-transport passengers. Commuters routinely cross a kabupaten/kota boundary for work, school or courses and return the same day. All modes are included. Published one-decimal percentages are retained without recalculation. Two-stage sample-survey design and published uncertainty prevent treating these as exact census rates or fine-rank evidence.

The custom-font table required rendered-page inspection. OCR assisted locating cells; all five retained percentage cells were directly checked against the rendered primary table. Decimal commas become decimal points only; no percentage scaling or 0–100 pressure normalization occurs.

**Safe:** BPS's estimated routine cross-boundary commuter share among residents aged 5+ for the stated survey.

**Unsafe:** this is public-transit ridership, the fraction of all trips, proof of good access, or a congestion measure.

Frontend: dated metropolitan survey card with the age denominator and all-mode definition visible. No all-27 comparison or missing-region substitution.

### Investigated transport alternatives

| Candidate suffix under `context_transport_` | Decision | Reason |
| --- | --- | --- |
| `galura_public_passengers_rejected` | `REJECT` | Current metadata still conflicts between all passengers and Type C terminal movements; explicit usage restrictions independently bar retention. |
| `bandung_tmb_ridership_rejected` | `REJECT` | Promising official month/corridor data including 2023, but current municipal terms expressly restrict reuse/transfer. No numeric rows retained. |
| `type_c_passenger_movements_rejected` | `REJECT` | Entry/exit movement protocol and double-counting limits remain unresolved; not unique users or modal share. |
| `bps_mode_counts_rejected` | `REJECT` | Labelled mode counts do not establish active fleet, routes, frequency or accessibility. |
| `bps_provincial_rail_rejected` | `REJECT` | Monthly province-level passenger totals have no defensible regional residence/station allocation. |
| `kci_station_ridership_unverified` | `REJECT` | Primary operator release fetch returned 403; snippets cannot supply source-resolved annual station observations. |

Current [Galura terms](https://galura.jabarprov.go.id/ketentuan-penggunaan) and [Bandung terms](https://opendata.bandung.go.id/ketentuan-penggunaan) were inspected, not inferred from “open data” branding. Full candidate URLs and metadata-only findings remain in the raw transport receipt.

## 4. Crime / public-safety context

### Village theft occurrence — `ACCEPT_CONTEXT`

Dataset: `context_crime_podes_theft_villages_jabar_2024`.

Source: [Statistik Potensi Desa Provinsi Jawa Barat 2024](https://jabar.bps.go.id/id/publication/2024/12/27/1f6b4fbd4df3649dad58ac22/statistik-potensi-desa-provinsi-jawa-barat-2024.html), BPS Provinsi Jawa Barat, publication 32000.24074, released 27 December 2024. Table 18.4, printed p. 187 / PDF p. 215, column (2) `Pencurian`. General methods printed xxiv–xxv / PDF pp. 26–27 explicitly assign this table to the preceding-year period.

**Coverage:** all BPS regions `3201`–`3218` and `3271`–`3279`, with unambiguous regency/city labels and civil census scope. The 27 published counts sum to the published province total of 3,225. The provincial total is a cross-check, not an additional regional observation.

**Actual reference period:** the year preceding May 2024 enumeration. Exact day-level endpoints are not specified. This is not relabelled as calendar 2023 or “2024 annual crime.”

**Literal construct:** number of desa/kelurahan in which theft occurred. Podes uses trained-personnel interviews with knowledgeable responsible local informants and related documents. This is not incident count, reported police cases, victims, residents exposed, a crime probability, or a rate per population. The separate robbery column is not added. Counts also depend on numbers/sizes of villages and local knowledge/reporting; comparisons and rankings remain disabled despite complete administrative coverage.

**Safe:** the source records the stated number of villages/kelurahan with theft occurrence during its specific recall period.

**Unsafe:** a city is dangerous; all actual crime was measured; residents face the stated risk; a larger count proves worse safety; 2023 police crime rose or fell.

Frontend: use a **village-reported occurrence** label, actual recall period, original unit and source. Never present as a police-recorded crime rate, danger badge or safety rank. A denominator or share would require a separately reviewed source; none is constructed here.

### Police-recorded 2023 counts and rates — `REJECT`

Candidates: `context_crime_police_reports_jabar_2023` and `context_crime_police_report_rate_jabar_2023`.

The actual [BPS 2023 table](https://jabar.bps.go.id/id/statistics-table/3/VlVneFlXOVJOSFpNUzNKcU4zVlFla2syVEZjd1VUMDkjMyMzMjAw/jumlah-kejahatan-yang-dilaporkan-risiko-penduduk-terkena-kejahatan-per-100-000-penduduk-persentase-penyelesaian-kejahatan-dan-selang-waktu-terjadinya-kejahatan-menurut-kabupaten-kota-di-provinsi-jawa-barat.html?year=2023) was read after rendering. Its rows are `Satuan Wilayah Hukum`, with 23 named resort units, a Polda row and further unavailable/blank units, not a verified 27-unit civil panel. The source describes online police reports through DORS.

Website notes make contradictory combinations, including assigning Bekasi/Depok areas to Polresta Bandung and combining Ciamis/Pangandaran while listing Pangandaran separately. The official police jurisdiction profile places Bekasi and Depok under Metro Jaya. The BPS yearbook's Table 4.4.1 explicitly uses police resorts and supplies no complete civil crosswalk. These contradictions are retained, not repaired by name matching.

The rate additionally lacks an audited denominator population, reference date and geography. No population denominator is reverse-engineered from rounded rates. Missing police records are not zero crime. Reporting propensity, detection, enforcement and legal definitions would limit comparison even after geography was resolved.

## 5. Detailed air-pollution context

### Dated station snapshots — `PARTIAL_CONTEXT`

Datasets:

- `context_air_pollution_klh_site_ispu_20261029`: six station observations associated with five regions.
- `context_air_pollution_klh_site_pm25_ispu_20261029`: five PM2.5-component observations associated with the same five regions.

Source: [KLH/BPLH public ISPU application](https://ispu.kemenlh.go.id/app/#/stasiun), with each station's direct public route and address preserved in its receipt. Actual source-displayed timestamp: **29 October 2026, 16:00:00**. The detail card does not explicitly print a timezone; no UTC offset is invented.

Exact CIVX associations: Kabupaten Bogor `3201`, Kabupaten Sukabumi `3202`, Kabupaten Indramayu `3212`, Kabupaten Purwakarta `3214` and Kabupaten Bekasi `3216`. Sites are Bogor Leuwiliang, Bogor Tegar Beriman, Sukabumi Pelabuhanratu, Indramayu Margadadi, Purwakarta Purnawarman and Bekasi Sukamahi. Explicit station names/addresses distinguish regencies from identically named cities. Coverage is site association only; the other 22 regional records are missing, and every regional scalar remains null.

ISPU and the PM2.5-specific component are **dimensionless source indices**, not PM mass concentrations in µg/m³ and not CIVX scores. The [official explanation](https://ppmu.kemenlh.go.id/portal/read/indeks-standar-pencemar-udara-ispu-sebagai-informasi-mutu-udara-ambien-di-indonesia) describes local ambient-air information and hourly PM2.5 publication. [Permen LHK 14/2020](https://peraturan.bpk.go.id/Details/163466/permen-lhk-no-14-tahun-2020) establishes conversion/monitoring requirements; those requirements do not certify actual valid hours, calibration or completeness of a particular live reading.

The overall index is not interchangeable with its PM2.5 component. Leuwiliang's overall reading is driven by O3; Sukamahi's by PM10. Tegar Beriman's overall available-pollutant reading is driven by SO2; its zero particulate components have unresolved validity and are **not** admitted as clean-air measurements. The PM2.5 dataset's missingness notes identify that excluded site reading. Blank components are not zero-filled, and rounded indices are not inverted into concentrations.

Normal public browser navigation supplied visible station cards. An unauthenticated direct endpoint returned application-level `Unauthorized`; no keys, tokens or authorization values were extracted or replayed. Station-route reloads and correct-name checks avoided stale detail-card assignment. Only selected attributed readings and short receipts are stored, not application scripts or network headers.

**Temporal limit:** these are 2026 snapshots, not 2023 observations, annual means, continuous-monitoring completeness, trends or present-day guarantees. Live URLs may later show different readings. Offline replay reproduces the preserved transcription; it is not a claim that the historical source snapshot remains queryable. The source's printed timestamp is retained without inventing the exact start of a rolling monitoring window.

**Safe:** the named station reported the stated overall or pollutant-specific index at the stated source time.

**Unsafe:** the region's population had that exposure, air was safe/unsafe for every resident, the number is µg/m³, a 2023 pressure increased, or all stations monitored every pollutant successfully.

Frontend: an optional separately dated station disclosure, preferably archived rather than placed on the 2023 headline profile. Keep overall and component readings explicitly named; show source timestamp, site name, unknown quality/completeness and no regional value. Do not compute a district mean, public regional rank, health-causation claim or Environment-score adjustment.

### Investigated pollution alternatives

| Candidate suffix under `context_air_pollution_` | Decision | Observed reason |
| --- | --- | --- |
| `official_pm_concentrations_2023` | `REJECT` | Inspected BMKG/KLH/local interfaces did not jointly establish a dated, quality-checked 2023 concentration series, station coverage and annual completeness. Current BMKG access succeeded but did not supply this target panel. |
| `bandung_daytime_study_2023` | `REJECT` | Accessible CC BY-SA research sampled selected wet-season daytime periods; exact dates/QA/completeness are unresolved and PM2.5 summary text is inconsistent. Daytime samples do not establish 24-hour or annual standards. |
| `bps_spm_station_2023` | `REJECT` | SPM/TSP is not PM2.5 or PM10; ambiguous station mapping and valid sample counts remain unresolved. No fraction conversion or name-only regional assignment. |
| `acag_pm25_grid_2023` | `REJECT` | CC BY 4.0 permits reuse, but no validated BPS-boundary overlay or reviewed area-versus-population exposure estimand was produced. Approximate 2020 display polygons are not silently promoted into analytical boundaries. |

Sources include [BMKG PM2.5](https://www.bmkg.go.id/kualitas-udara/pm25), [official Bandung AQMS documentation](https://opendatabdg.gitbook.io/dokumentasi/produk/pengembangan-portal-data/arimbi/aqms), the [Bandung research article](https://ejournal.undip.ac.id/index.php/jkli/article/download/57595/25426), [BPS environmental statistics](https://www.bps.go.id/id/publication/2024/11/29/f24c83748852c605dd2c73cb/statistik-lingkungan-hidup-indonesia-2024.html) and [ACAG SatPM2.5 methods/licence](https://sites.wustl.edu/acag/surface-pm2-5/). ACAG's published model uses satellite/chemical-transport/monitor calibration; this audit runs no such model and performs no raster extraction. Existing IKLH and its CORE Environment score remain unchanged.

## 6. Separate contextual data contract

Raw domain audit files under `data/raw/contextual-audit-2023/` retain researcher-authored receipts, attributed short metadata/method excerpts and selected factual transcriptions. They do not mirror entire pages, PDFs, scripts, request headers or restricted API payloads.

`src/lib/civx/contextual-data-2023.ts` defines strictly typed candidate, source, observation and prepared-dataset contracts. `scripts/audit-contextual-data-2023.mjs` validates and prepares the catalogue and non-rejected datasets. Neither imports a CORE scorer or CORE Insight Engine.

Each prepared artifact has `scope: CONTEXT`, `coreScoreAffected: false`, `normalizationApplied: false`, the actual reference period, original unit/definition/method, coverage, source receipts, safe/unsafe statements and deterministic statement templates. Every observation retains:

- canonical BPS region identity and exact observational geography;
- site identifier/name when relevant;
- actual period, finite numeric value, original source token and documented parsing;
- source ID, publication/table/page/row or API locator;
- raw-audit JSON Pointer, original limitations and source receipt.

There is exactly one outer regional record for each of the 27 CIVX regions. Multiple site/segment measurements are nested under the associated region, never emitted as duplicate regional rows. `valueStatus` distinguishes a source-published regional value, site-only observations and missing observations. A regional scalar is **null for site-only data**, even when finite site values exist. Missing regions have explicit nulls and explanations; a verified source numeric zero remains zero. No averaging, imputation, nearest-year substitution, normalization or unsupported rank is performed.

The catalogue stores every candidate, including rejected candidates with `artifactPath: null`. Prepared artifacts exist only for non-rejected candidates. Current datasets disable comparative ranking; future comparison metadata requires a separately defensible within-source panel and must never be called CIVX pressure normalization.

## 7. Provenance, rights and credential safety

Canonical public URLs, precise source locators, access dates, publication dates when known, retrieval methods and actual fetched-file hashes support re-extraction. A hash is not a licence or evidence that a later live response is unchanged. Source publication years, revision dates, report years and field periods are kept distinct.

[BPS current terms §13](https://jabar.bps.go.id/id/term-of-use) explicitly permit commercial/noncommercial statistical-data use, distribution and extraction with attribution, direct original links and no false endorsement. The older publication PDFs also contain commercial book-reproduction restrictions. Both notices remain visible. This audit uses narrow attributed factual numerical transcriptions under the website extraction grant; it does not reproduce publication pages/layouts or claim a blanket book licence. Downstream bulk/commercial publication reuse should review the notice conflict.

Bogor, Bandung open-data and Galura portals have current express personal/noncommercial/nontransferable restrictions. Restricted numeric rows are not retained. TomTom usage restrictions also block importing its numerical observations. Public visibility and “open data” branding are not treated as permission.

Bandung PPID report facts are narrow attributed transcriptions; no express bar on that narrow use was found in the inspected source/listing. No affirmative open-data licence or permission to mirror the report is invented.

No secrets, private credentials, authorization/cookie headers, session data, embedded service keys, opaque BPS download URLs or signed query strings are intentionally captured. The generator scans all new raw captures and generated outputs for credential-like patterns, without echoing a potential secret. Tests cover provider-key shapes, private keys, authorization values and signed queries. Pattern scanning is a practical safeguard, not proof that every possible credential format can be detected. GitHub secret protection must never be bypassed.

## 8. CORE immutability and reproduction

`protocol.json` records 16 pre-audit SHA-256 fingerprints: frozen inputs/designs, scoring/insight artifacts, model/scoring/comparison/insight code and five authoritative methodology/engine documents. Generation verifies them before preparing output and again before writing. CORE score and insight hashes are also independently fixed in the audit script.

```text
civx-scores-2023.json
47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5

civx-insights-2023.json
ffd92543c6387c981d2647c8ed55bd3abb7f7c4e9b5b91d4a74fab81999d6345
```

Offline commands:

```sh
npm run data:context:audit:2023
npm run data:context:audit:2023:check
npm test
npm run lint
npm run build
```

`--check` compares complete expected bytes and never writes. Source/audit code receipts enter generated provenance; no current timestamp, random identifier or machine-specific path enters output. Paths resolve from the script, not the caller's working directory. The generator uses audited transcriptions and local receipts; online re-acquisition is a separate research action, not silently claimed by replay. Unknown flags, invalid evidence, CORE drift, output drift and stale unreviewed contextual artifacts stop generation.

### Exercised validation results

| Check | Observed result |
| --- | --- |
| Candidate decisions | 27 candidates: one accepted, six partial, 20 rejected |
| Prepared metric artifacts / source receipts | Seven / 43 |
| Retained finite observations | 84, with source tokens, actual periods, units, source IDs and resolving raw-evidence pointers |
| Regional records | Exactly 27 unique BPS slots per prepared dataset; site observations nested without duplicate regional records |
| Missingness and genuine zero | Cirebon/Subang terminal symbols remain null; explicit Banjar terminal zero remains zero; site-only regional values remain null |
| Unsupported comparisons | No cross-dataset rankings, regional site means, imputation, pressure normalization or CORE integration |
| Offline generation and `--check` | Byte-identical catalogue and all seven metric artifacts |
| Runtime smoke | Audit replay passed from an unrelated working directory with Node network and child-process access denied |
| Credential-pattern scan | No matches in all new raw captures, catalogue, processed contextual data or audit documentation; generator scanning also passed |
| CORE preservation | All 16 fingerprints unchanged, including both score/insight hashes above |
| `npm test` | 205 passed, zero failed; all 185 pre-existing tests preserved plus 20 contextual validation/CLI tests |
| `npm run lint` | Passed without warnings/errors |
| `npm run build` | Passed strict TypeScript and generated 37 pages |

Behavioral tests exercise duplicate IDs, invalid/missing BPS identities, unit mismatches, finite values, source/period requirements, missing-versus-zero handling, site-versus-region separation, invalid decisions/coverage, input immutability, credential rejection, deterministic CLI replay, every protected CORE-file drift, output drift, unsupported flags and stale artifacts. Temporary fixtures are synthetic and isolated; none enters published audit data. The five commuter percentage cells were visually checked in the original rendered table. No new browser UI verification is claimed because no frontend changed.

## 9. Recommended product treatment

Keep contextual content below a visually separate **Context — does not affect CIVX** heading. Show source, actual date/period, unit, coverage and limitations next to every fact. A 2024 or site-level observation must not inherit a “2023 regional pressure” heading from the surrounding CORE card.

Integrate the October 2023 commuter-share context first for its five eligible residence regions: it has the clearest mobility construct and denominator. Next, add Type C terminal inventory only as a dated inventory fact and village theft occurrence only with its literal village unit and May 2024 recall warning. Bandung road facts are an optional detailed disclosure, not a headline city congestion metric. Do not force unsupported comparison badges.

The later Contextual Insight Layer may render the supplied deterministic templates with this metadata. This audit does not render new insights, import context into CORE, redesign the frontend, run What-if simulation, deploy or recommend policies.
