# CIVX Environment data and methodology audit — Jawa Barat 2023

**Decision:** recommend **Environmental Quality Pressure / Tekanan Kualitas Lingkungan**, represented by **one CORE indicator: the published 2023 kabupaten/kota Indeks Kualitas Lingkungan Hidup (IKLH)**. Higher published quality means lower pressure. One strong indicator is acceptable; do not add weak indicators for dimensional symmetry.

**Scope:** research and admission audit only; all 27 Jawa Barat kabupaten/kota, reference year 2023. No production indicator, normalization, weight, score, ranking, frontend, release or previously finalized dimension changes. This recommendation does not enact a scoring cutover.

**Evidence accessed:** 29 October 2026. Retrieval date and publication date are not observation year. Earlier completed indices, waste and air bundles were reused. The interrupted land/water investigation was recovered from its retained retrieval recipes and classifications; its unpersisted response bodies were reacquired. No new indicator research branch was opened during recovery.

## 1. Construct definition

Environment measures **relative degradation of ambient environmental media and persistent land/ecosystem condition affecting shared living conditions**. The admitted operational measure is narrower: comparison of official annual administrative environmental-quality summaries, not a complete measurement of environmental harm or resident exposure.

| Concept | Meaning for this audit | Treatment |
| --- | --- | --- |
| Environmental quality | State of ambient air, surface water and land/ecosystems | Primary construct; the published district IKLH summarizes these media |
| Pollution pressure | Pollutant loads or concentrations affecting environmental media | Relevant candidates, but require compatible geography, measurement and aggregation |
| Waste pressure | Generation, residual unmanaged mass and disposal burdens | Distinct load construct; neither generation nor collection alone proves ambient quality |
| Ecosystem / land pressure | Persistent cover loss, degradation and ecological condition | Distinguish actual condition from legal designation, hectares of planting and natural ecosystem opportunity |
| Environmental service conditions | Waste collection, reduction, processing and safe final disposal | Potential supporting subdomain, not admitted without valid accounting and reporting completeness |
| Climate/environmental exposure | Climatic conditions or population contact with pollutants | Separate estimand; no automatic direction or substitution for measured environmental quality |

A high reported waste tonnage can reflect population, commerce, measurement or reporting. A high planting area can reflect restoration effort or greater prior damage. Neither has an unconditional environmental-pressure interpretation. Monitoring capacity and participation are not pollution outcomes.

## 2. Domain boundaries and overlap

- **Basic Services:** household drinking-water and sanitation access remain there. Ambient river chemistry is not drinking-water access, safety or continuity. Waste evidence previously inspected in Basic Services is reused without changing that audit's decisions.
- **Public Health:** disease incidence and health outcomes do not enter Environment. Pollutant concentration is an environmental measure, not an inferred disease burden.
- **Socioeconomic and Education:** poverty, unemployment, deprivation, education and social vulnerability are not added as environmental proxies.
- **Disaster Pressure:** hazards, IRBI, exposed disaster assets, annual disaster impacts and institutional disaster capacity remain outside Environment. Rainfall is not converted into flood/drought risk here.
- **Unavoidable conceptual contact:** [BNPB IRBI methodology, page 20](https://inarisk.bnpb.go.id/IRBI-2023/files/basic-html/page20.html) and [page 21](https://inarisk.bnpb.go.id/IRBI-2023/files/basic-html/page21.html) include environmental damage in hectares within vulnerability/consequence parameters. Environmental condition and environmental assets exposed to hazards are not the same estimand. IKLH itself is not a retained IRBI input. No explicit IRBI component is added, and independence of the dimensions is not claimed.
- **Within Environment:** never score IKLH alongside its IKA, IKU and IKL constituents or renamed land-cover variants. Media components may explain the composite without creating extra additive inputs.

Dense cities and large rural regencies have different ecological opportunity and land-use structures. This dimension must not be described as a like-for-like ranking of municipal environmental management.

## 3. Source inventory and provenance

The machine-readable [provenance file](../data/processed/environment-audit-2023-provenance.json) records exact URLs, acquisition state, representations, byte counts, SHA-256 hashes, original-publication fingerprints and extraction locators. Raw bundles retain actual responses or explicitly labelled excerpts/diagnostics. Search results locate sources; they are not measurement evidence.

| Source | Verified evidence and locator | Audit use |
| --- | --- | --- |
| DLH Jawa Barat / Galura dataset **20488** | [Metadata](https://galura.jabarprov.go.id/api/datasets/indeks-kualitas-lingkungan-hidup-berdasarkan-kabupatenkota-di-jawa-barat); [explicit 2023 records](https://galura.jabarprov.go.id/api/bigdata/indeks-kualitas-lingkungan-hidup-berdasarkan-kabupatenkota-di-jawa-barat?per_page=1000&where=%7B%22tahun%22%3A2023%7D). Table `dlh.od_20488_indeks_kualitas_lingkungan_hidup__kabupatenkota_v1`, source row IDs 136–162 | Sole CORE panel; one producer, index definition and district code convention |
| KLHK, Permen LHK **27/2021** | [Official DLHK-hosted copy](https://dlhk.jogjaprov.go.id/wp-content/uploads/2024/08/2021pmlhk027_menlhk_12312021144624.pdf), PDF pages 6–10, 21, 27–29, 36–41, 55–58, 69, 74–75; [legal status](https://peraturan.go.id/eng/permen-lhk-no-27-tahun-2021) | The methodology applicable to 2023; distinguish district and provincial formulas. Later repeal in 2025 does not justify changing the 2023 vintage |
| DLH Jawa Barat **LKIP 2023** | [Official report index](https://dlh.jabarprov.go.id/datae-sakip); [linked PDF](https://drive.google.com/uc?export=download&id=1iIAzNg5y1caKbzc3eqjigeKDg7R0UQMq). PDF 28–29 / printed 22–23: parameters; PDF 32 / printed 26: monitored rivers; PDF 41 / printed 35: air monitoring; PDF 43–44 / printed 37–38: parks and water records | Implementation evidence and qualified province-level context, not a replacement district table |
| DLH / Galura dataset **15335** | [2023 province component records](https://galura.jabarprov.go.id/api/bigdata/indeks-lingkungan-hidup-berdasarkan-indikator-di-jawa-barat?per_page=1000&where=%7B%22tahun%22%3A2023%7D) | Five provincial rows; not five district panels. Preserve the provincial IKU source conflict |
| Disperkim / Galura waste datasets | IDs **18375**, **16985**, **18378**, **18366**, **16984**: per-capita generation, daily generation, transport to TPA, published service percentage and handling. Exact metadata and year-filtered URLs are in `waste.json` | Published administrative context and accounting diagnostics; not a verified reporting-complete waste performance panel |
| BPS *Provinsi Jawa Barat Dalam Angka 2024* | [Publication 32000.24001](https://jabar.bps.go.id/id/publication/2024/02/28/35ffe2d35104b39feb577e8f/provinsi-jawa-barat-dalam-angka-2024.html), revised 29 February 2024. Table 4.5.11, PDF 372 / printed 296: 2023 waste columns 6–9. Table 3.1.1, PDF 187 / printed 111: rounded population comparison. Table 5.4.1, PDF 551–552 / printed 475–476: provisional legal forest/water designation | Cross-source waste reconciliation and qualified land context. Original book SHA-256 `500e82ecd02b081be83d884add8408fccc8fb1d57665f5b3e62a17ebc9f55f81`, 11,915,084 bytes. Existing original freshly extracted, not claimed freshly downloaded |
| SIPSN / Ministry environment systems | [Legacy 2023-capable route](https://sipsn.menlhk.go.id/sipsn/public/data/capaian); [current official platform](https://sampahnasional.kemenlh.go.id/) | Legacy DNS failure and relocated historical-route 404s retained. Current dashboard explicitly concerns 2026; no substitute 2023 reporting roster acquired |
| BPS / BMKG air observations | [*Statistik Lingkungan Hidup Indonesia 2024*](https://www.bps.go.id/id/publication/2024/11/29/f24c83748852c605dd2c73cb/statistik-lingkungan-hidup-indonesia-2024.html), table 2.1.23, PDF 125–126 / printed 97–98; original download and fingerprint in `air-exposure.json` | Three named 2023 SPM/TSP station summaries, not PM2.5/PM10 or district-wide exposure |
| KLH/BPLH ISPU | [Public application](https://ispu.kemenlh.go.id/); [station API](https://ispu.kemenlh.go.id/apiweb/stasiun); Permen LHK 14/2020 retained in air bundle | Definition and current monitoring diagnostic only; acquired records carry 2026 timestamps |
| ACAG, Washington University | [Methods and products](https://sites.wustl.edu/acag/surface-pm2-5/); [2023-capable Asia annual product listing](https://wustl.app.box.com/s/y143mciw7jz7ft2qe3hccjw65m3xe8f2/folder/327762666641) | Clearly secondary/modelled satellite–model–monitor-fused estimates; no district aggregation performed |
| Dishut / DPMD / DSDA / Galura | IDs **15083**, **15074**, **16193**, plus wrong-year, provincial, local RTH/chemistry and rainfall leads. Exact URLs and retained records are in `land-water.json` | Response activity, partial forest stock, reported village pollution and actual-geography context; not additional CORE |

The final source bundle contains **127 artifacts**, including 12 final locator receipts. Artifacts are not distinct datasets or independent indicators. HTTP 200 SPA shells are only locator evidence; failed requests are not observations. Full restricted BPS and other source books are not redistributed. Publication/reuse rights require release-owner review; portal visibility is not a blanket licence.

## 4. Candidate register and decision rule

The complete [55-entry candidate register](../data/processed/environment-audit-2023-candidate-register.csv), [observations and investigations](../data/processed/environment-audit-2023-observations.json), and [decisions with admission gates](../data/processed/environment-audit-2023-decisions.json) are the detailed register. `target_year` is the requested year; actual source years, wrong-year findings and geometry remain explicit. The register contains source variants and methodology/reporting investigations, not 55 proposed independent indicators.

| Candidate family / register entries | Final class | Reason |
| --- | --- | --- |
| `iklh_2023` | **CORE** | Common official 2023 district environmental-quality summary; 27 valid observations; direction and variation pass |
| `ika_component`, `iku_component`, `ikl_component`, `ikal_component` | CONTEXT ONLY | Acquired common component table is provincial. First three are nested in district IKLH; marine quality is not universal district geography |
| `iklh_plus_components` | REJECT | Exact additive composite/component double counting |
| Five published Disperkim waste panels, four BPS waste variants, village collection count and Sarimukti inflow | CONTEXT ONLY | Useful records remain available; incomplete reporting assurance, definitions, denominators or geographic scope block CORE |
| `waste-derived-managed-unmanaged-share` | REJECT | Three managed/handled numerators exceed generation; no defensible residual or bounded performance share |
| `waste-village-proxy-eligibility` | REJECT | A 19-region desa universe is not household collection prevalence across 27 districts |
| `waste-candidate-34328`, `waste-candidate-34329` | REJECT | Actual inspected source coverage is 2025; 2023 filters are empty |
| Six `waste-sipsn-*` investigations | PARKED / insufficient evidence | Historical reporting roster, completeness flags and compatible 2023 accounting were not recovered |
| `air-ground-pm25-2023`, `air-ground-pm10-2023`, `air-ispu-2023` | PARKED / insufficient evidence | No validated, representative 2023 annual all-district panel recovered |
| `air-spm-2023` | CONTEXT ONLY | Genuine 2023 station summaries; SPM/TSP is not PM2.5 or PM10 |
| `air-current-station-coverage` | CONTEXT ONLY | Explicitly 2026 acquisition diagnostic; not a 2023 indicator or historical station census |
| `air-gas-concentrations-bps` | REJECT | Inspected SO2/NO2 table concerns 2021–2022 province summaries and lacks a Jawa Barat row |
| `air-modelled-pm25-acag-v6`, `air-modelled-pm25-acag-v5` | PARKED / insufficient evidence | Credible model alternatives, but no approved district geometry, aggregation estimand, completeness or uncertainty audit |
| `landwater-tree-planting-area-2023` | CONTEXT ONLY | Complete activity panel, but restoration activity has ambiguous pressure direction and does not measure residual condition |
| `landwater-community-forest-area-2023` | CONTEXT ONLY | 26 districts; subset of forest stock, no common eligible-area denominator or complete physical-cover definition |
| `landwater-villages-reporting-water-pollution-2023` | CONTEXT ONLY | 19 districts; reported occurrence, not laboratory quality or common monitoring coverage |
| `landwater-designated-forest-water-area-2023` | CONTEXT ONLY | 22 numeric provisional totals; legal designation, five unresolved dashes and conflicting scope footnote |
| Land investigations **17961**, **18245**, **15073**, **18292**, **17678** | REJECT | Respectively: critical land only through 2020; older rehabilitation through 2016; conformity through 2022; mangroves through 2020; marine DO only 2025. Definitions also differ from general environmental state |
| `landwater-national-physical-cover-wrong-year` | REJECT | Acquired national cover book explicitly uses 2024 imagery; no migration to 2024 |
| `landwater-public-space-not-green-cover` | REJECT | Free public open-space availability is not measured vegetation/green area; failed API calls do not establish zero |
| `landwater-investigation-15077`, `landwater-village-microdata-receipt` | PARKED / insufficient evidence | Provincial forest values are null; village microdata has unresolved year/serialization conflicts |
| `landwater-federated-local-rth`, `landwater-federated-local-chemistry`, `landwater-federated-physical-cover` | PARKED / insufficient evidence | Local source leads do not establish common definitions, geometry, denominators or all-27 2023 measurements |
| `landwater-dlh-surface-water-chemistry`, `landwater-kehati-parks`, `landwater-investigation-17313` | CONTEXT ONLY | Provincial COD, partial managed-park inventory and two rainfall stations remain at actual scope; no district extrapolation |
| `landwater-structural-bias-irbi-overlap` | CONTEXT ONLY | Methodological boundary finding, not a numerical indicator |

Totals: **1 CORE; 25 CONTEXT ONLY; 13 REJECT; 16 PARKED / insufficient evidence**. Classification is not a claim that rejected sources have no other legitimate use.

## 5. Coverage and data-quality findings

### 5.1 Published IKLH: what is and is not validated

The retained response contains exactly the expected **18 kabupaten and nine kota**, using BPS 2019 identifiers. All 27 source names and codes match the existing CIVX registry. Province aggregates are excluded. Each row has `tahun=2023`, unit `POIN`, one finite value and a unique district identity. There are no unresolved missing values, zeros, out-of-range values or duplicate district rows.

Permen LHK 27/2021, Annex VII, PDF page 74 defines the district composite:

`IKLH kabupaten/kota = 0.376 × IKA + 0.405 × IKU + 0.219 × IKL`

These are **publisher methodology coefficients, not new CIVX weights**. The provincial formula also includes marine quality and differs from this formula. Do not calculate a district value from provincial averages. Preserve the published district result unchanged.

The regulation defines water sampling across seasons, air-location classes and sampling/validation procedures. Its air parameters are **SO2 and NO2**, not PM2.5. PDF pages 6–9 distinguish passive, active and permanent monitoring methods. Land imagery can precede the calculation year under the regulation. Thus 2023 is the **official annual index vintage**, not proof that every input was continuously measured during calendar 2023.

Implementation evidence strengthens the reporting gate: LKIP 2023 PDF page 41 reports passive-sampler monitoring in **27 kabupaten/kota and four location categories**: transport, offices, settlements and industry. PDF page 44 reports **1,351 verified water-monitoring records**, sourced from KLHK and provincial/district DLH. This is evidence of a shared monitoring and validation framework, not a participation-count proxy.

**Admission limit:** this audit validates the published administrative summary and its source contract. It does **not** independently reproduce IKLH from original media measurements, certify each district's sampling log or establish representative population exposure. The 1,351 records are not 1,351 unique sites or proof of equal water sampling in each district. Statutory requirements alone do not prove every individual sample complied. These limits must remain attached to the indicator.

A source conflict remains visible: the provincial component API reports **IKU 80.39**, while LKIP PDF page 40 narrative reports **81.39**. Neither is silently corrected or used to reconstruct the district panel. Exact district component tables and producer calculation records would be needed for that reconciliation.

### 5.2 Waste: publication completeness is not reporting completeness

- Per-capita generation, transport to TPA, published service percentage and handled mass each have 27 numeric API cells. API daily generation has **22/27**, with five explicit nulls. The BPS waste table has 27 numeric generation cells. These are separate preserved editions, not a merged panel with filled gaps.
- Published per-capita generation lacks a verified common population/catchment and estimation protocol. Multiplying a coefficient by unrelated whole-region population does not establish a valid denominator. The retained implied-population calculation is a diagnostic, not an official population estimate or replacement rate.
- Published service percentage is not assumed to equal safely processed, managed, reduced or household-collected share. Transport to a TPA does not prove safe final treatment. Do not sum overlapping waste-system stages.
- BPS uses a managed-waste heading where the API uses handled-waste terminology. Values are almost identical, but labels and some cells differ. Kabupaten Pangandaran is **87.88 ton/day** in the BPS managed column and **87.87 ton/day** in the API handled panel. Small edition differences do not resolve the larger accounting problem.
- The SIPSN historical reporting status is **unknown for all 27 districts in this audit**, not zero participation and not zero unmanaged waste. Legacy DNS/route failures and the current 2026 dashboard cannot identify 2023 non-reporters. No apparent all-27 provincial publication is admitted as proof of common underlying reporting completeness.

Diagnostic arithmetic, not admissible rates:

| District | BPS managed ton/day | BPS generation ton/day | Managed / generation × 100 |
| --- | ---: | ---: | ---: |
| Kabupaten Majalengka (3210) | 534.00 | 227.01 | 235.231928% |
| Kabupaten Pangandaran (3218) | 87.88 | 57.31 | 153.341476% |
| Kota Tasikmalaya (3278) | 554.11 | 308.48 | 179.625908% |

A common bounded managed share cannot exceed 100%. The observed conflicts may reflect different catchments, definitions, timing or source errors; this audit does not invent the explanation. Do not clip values, subtract to create unmanaged mass or relabel the residual as a valid pressure indicator.

Sarimukti dataset **34324** contains 48 monthly 2023 rows: 12 months for Kabupaten Bandung, Bandung Barat, Kota Bandung and Cimahi. The four annual facility-flow sums are retained as **4/27 partial-scope context**. The other 23 cells remain null. This is not a province-wide disposal measure, not receiving-district pollution attribution and not proof of complete generation accounting.

### 5.3 Air: administrative index, station observation and modelled exposure differ

- **IKU:** an SO2/NO2 administrative quality component within IKLH. The common provincial component table is not a retrieved district concentration panel. It does not establish PM2.5 exposure.
- **Ground monitoring / ISPU:** the acquired current API contains 110 national station rows, including six Jawa Barat stations across five explicitly label-matched districts. Two Kabupaten Bogor stations do not cover Kota Bogor; Kabupaten Bekasi does not cover Kota Bekasi. Records are dated 2026. Neither commissioning dates nor 2023 annual completeness are established.
- **Suspicious current zeros:** one Kabupaten Bogor station returns literal PM10/PM2.5 zeros. Their instrument/missing-value semantics are unresolved. They remain acquisition diagnostics, never evidence of clean 2023 air.
- **SPM/TSP:** BPS/BMKG publishes 2023 station means of 115.7 µg/m³ at Bandung, 63.7 at Cibeureum and 195.7 at Dramaga. The three means have minimum 63.7, maximum 195.7, mean 125.033333, median 115.7 and population SD 54.291395; all three are unique, nonzero and nonnegative, with no Tukey outlier. These are station summaries, **not three representative district observations**. SPM/TSP cannot be converted into PM10 or PM2.5 using an invented fraction.
- **ISPU:** a short-term station-based pollutant index, including a maximum/critical-pollutant presentation. Averaging nonlinear multipollutant ISPU does not yield annual PM2.5 concentration.
- **Modelled PM2.5:** the ACAG V6 listing contains `V6GL02.04.CNNPM25.AS.202301-202312.nc`. File availability does not establish district estimates. No raster aggregation, approved 2023 boundary crosswalk, land mask, valid-area coverage, population weighting or uncertainty assessment was performed. The retrospective model is explicitly secondary, not an official district observation table. V5 is a documented alternative, not a second selected indicator.

### 5.4 Land, open space and surface water

- Tree planting / critical-land rehabilitation has 27 published rows, but measures **response activity**. Six explicit zeros occur in Kota Bogor, Sukabumi, Bekasi, Depok, Cimahi and Tasikmalaya. Zero reported planting does not mean no forest or good/bad ecosystem condition. There is no validated survival, repeat-treatment, eligible-degraded-area or resulting-cover denominator.
- Community forest area has 26/27 observations; Kota Bandung has no row, not zero. Community forest, legal forest designation, actual canopy, plantations, mangroves and urban green space are different classes. Do not sum them or divide them by an unrelated area table.
- BPS provisional legal forest/water designation totals have 22 numeric cells and five dashes. Dashes remain null here because structural absence versus unavailable quantity is unresolved. The table's 2021 decree basis is not a new observation-year replacement. The footnote says only provincial availability despite district rows; this unresolved scope note blocks scoring.
- Village water-pollution reporting covers all 18 kabupaten plus Kota Banjar, not the other eight cities. The two categories total 5,312 reporting villages. This is a reporting-frame total, not an independently reconciled denominator for all desa/kelurahan, residents or water bodies. Occurrence counts omit pollutant, concentration, severity and standard.
- LKIP describes 11 monitored rivers, including four cross-district rivers, and a provincial 2023 COD mean of 25.00 mg/L from the verified records. No district allocation, sampling-season balance or common waterbody aggregation is supplied. Programme target achievement of 100% is not 100% pollutant removal or proof of healthy rivers.
- LKIP reports 25 KEHATI parks, 270.50 hectares, across 15 named districts. No district areas are supplied. Neither the total nor a zero is assigned to unlisted districts.
- Federated local RTH and chemistry leads mix kelurahan inventories, city totals, planning targets, treated areas, pollutant/site records and incompatible denominators. Public open space need not be vegetated. The inspected rainfall series has two Citarum-network stations, not 27 district exposure estimates.

## 6. Statistical and redundancy analysis

The [statistics output](../data/processed/environment-audit-2023-statistics.json) describes every numerically viable regional panel, including contextual and rejected diagnostic quantities. There are **16 panels, 432 expected district cells, 382 numeric cells and 50 unresolved/absent cells**. Ten panels have complete numeric coverage; only one passes substantive admission. Statistics do not convert contextual records into CORE.

Conventions: equal-region means; population SD; median and linear R7 quartiles; Tukey 1.5-IQR flags. Missing values are excluded only from descriptive calculations and remain explicit. No imputation, clipping, deletion of outliers or winsorization occurs. These are not population-weighted provincial estimates or uncertainty intervals. Units below remain source-specific.

| Panel | Numeric / 27 | Missing | Unique | Min | Max | Mean | Median | Population SD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| IKLH, points | 27 | 0 | 27 | 44.65 | 71.11 | 58.900741 | 59.76 | 6.894139 |
| API waste per capita, kg/person/day | 27 | 0 | 18 | 0.27 | 0.68 | 0.432804 | 0.40 | 0.120325 |
| API generation, ton/day | 22 | 5 | 22 | 57.31 | 968.27 | 361.586364 | 321.83 | 213.568803 |
| API transported to TPA, ton/day | 27 | 0 | 27 | 53.76 | 1,444.34 | 418.077407 | 268.00 | 387.269606 |
| API published service, percent | 27 | 0 | 27 | 37.88 | 95.92 | 74.637407 | 77.23 | 15.617316 |
| API handled, ton/day | 27 | 0 | 27 | 1.20 | 554.11 | 175.825852 | 72.78 | 177.575430 |
| Villages with collected-bin disposal, villages | 19 | 8 | 19 | 5 | 230 | 101.105263 | 86 | 59.432310 |
| BPS waste per capita, kg/person/day | 27 | 0 | 16 | 0.27 | 0.68 | 0.432593 | 0.40 | 0.120542 |
| BPS generation, ton/day | 27 | 0 | 27 | 57.31 | 2,287.57 | 597.988889 | 399.88 | 561.795887 |
| BPS managed, ton/day | 27 | 0 | 27 | 1.20 | 554.11 | 175.827037 | 72.78 | 177.575006 |
| BPS service, percent | 27 | 0 | 27 | 37.89 | 95.92 | 74.643704 | 77.24 | 15.616909 |
| Sarimukti annual inflow, tons/year | 4 | 23 | 4 | 50,513.596 | 400,146.544 | 146,566.8025 | 67,803.535 | 147,042.207762 |
| Tree planting/rehabilitation, ha | 27 | 0 | 22 | 0 | 9,543.27 | 841.892963 | 321.90 | 1,822.271903 |
| Community forest, ha | 26 | 1 | 26 | 4.44 | 155,428.14 | 32,929.798077 | 9,932.18 | 41,572.476737 |
| Villages reporting water pollution, villages | 19 | 8 | 17 | 1 | 58 | 31.00 | 34 | 17.776389 |
| Designated forest/water, ha | 22 | 5 | 22 | 2.88 | 111,517.92 | 36,119.185455 | 27,406.13 | 33,214.009435 |

No observed regional panel value violates its declared numeric bounds. This does **not** validate the separately rejected mass-share construction, which exceeds 100% in three districts. Full zero, missing-region, extremum and outlier lists are in the statistics file. IKLH has no Tukey outliers. Waste tonnage flags often identify large districts/cities; low service flags identify Bandung, Garut and Bandung Barat. They remain unchanged. Large rehabilitation and forest-area flags require definition/size review rather than automatic removal.

The script computes **117 Pearson/Spearman pairs** on aligned, nonmissing, source-resolved observations, using average tied ranks. Pair sizes are explicit; incomplete pairs are not all-27 results. An absolute coefficient of 0.85 flags possible redundancy; 14 pairs trigger a flag. Three pairs have fewer than three aligned observations and are omitted. Small facility-only samples are especially unstable and do not support generalization.

| Diagnostic pair | Paired n | Pearson | Spearman | Interpretation |
| --- | ---: | ---: | ---: | --- |
| API / BPS per-capita waste | 27 | 0.999974 | 0.999382 | Source variants, not independent constructs |
| API / BPS generation | 22 | 1.000000 | 1.000000 | Agreement where API values exist; does not fill five API nulls |
| API / BPS service | 27 | 1.000000 | 1.000000 | Near-identical editions; not two indicators |
| API handled / BPS managed | 27 | 1.000000 | 1.000000 | Numeric similarity does not resolve accounting semantics |
| TPA transport / BPS generation | 27 | 0.967930 | 0.941392 | Shared scale and waste-system relationships; size is a confounder |
| IKLH / published API service | 27 | 0.195786 | 0.346154 | Modest correlation does not cure service/reporting failures |
| IKLH / community forest area | 26 | 0.663817 | 0.807179 | Conceptual land overlap remains even below the flag threshold |

Most reported near-one Pearson values are not exactly one; full precision is retained in JSON. Correlation is diagnostic, never the admission rule. IKLH plus its components is redundant by construction even without recovered district component correlations. Similarly, raw hectares can duplicate land concepts while mostly tracking region size.

An interpretational diagnostic gives mean IKLH **61.249444** across 18 kabupaten and **54.203333** across nine kota. This ecological contrast is not a causal effect, a management-performance finding or permission to fit separate normalization ranges. Urban/rural structural sensitivity belongs in the next joint-method review.

## 7. Smallest defensible CORE and fourteen-gate finding

**Select only `iklh_2023`: the unchanged published district IKLH 2023.** Do not derive a new index, reconstruct it from provincial components, divide it by population or area, or add a waste input to make the set larger.

| Gate | Finding for the admitted published-index construct |
| --- | --- |
| 1. Source | Official DLH producer and Galura dataset; source metadata, approval history and raw records retained |
| 2. 2023 vintage | Every district row explicitly says 2023; annual index vintage and underlying sampling limits disclosed |
| 3. All 27 | Exact expected district code/name set, one source record per region |
| 4. Definition | Common DLH district IKLH panel, interpreted under the applicable district-index framework; not mixed with provincial or later formulas |
| 5. Unit | Uniform published index points; no concentration/percentage mixing |
| 6. Geography | Same BPS 2019 administrative-code convention as CIVX; no station interpolation or polygon-derived denominator |
| 7. Construct | Ambient air/surface-water/land quality is relevant to shared civic environmental conditions |
| 8. Direction | Higher quality means less pressure; not asserted to measure government effort or causal responsibility |
| 9. Missingness | Zero unresolved numeric cells; no filled or substituted values |
| 10. Variation | 27 unique values, span 26.46 points and population SD 6.894139 |
| 11. Unnecessary redundancy | Singleton CORE; nested media and alternative source variants remain non-additive |
| 12. Denominator | No CIVX-derived rate; the publisher's composite is retained intact. No invented population/area denominator |
| 13. Reporting artifact | Published state summary, not participation count; common regulated design plus explicit all-27 air-monitoring and verified water-record evidence. This admission does not certify identical physical sampling or population exposure |
| 14. Double counting | No explicit input already selected elsewhere is added. IKLH is not an IRBI value; the unavoidable conceptual land/environmental-vulnerability contact remains disclosed |

The reporting and comparability findings are specific to **published administrative environmental quality**. They must not be generalized into claims that all 27 have equivalent continuous sensors, equally complete laboratory records or measured PM2.5 exposure. Such broader constructs have not passed the gates.

## 8. CONTEXT retained for later regional detail

Retain the waste publications and their original missingness, selected facility flows, partial forest stock, planting activity, qualitative village pollution, legal designation, actual-geography chemistry and park inventories. Preserve units, denominator uncertainty and reporting limits beside values.

Province media indices remain province context until district records are verified; they must not be copied into 27 regional records. Component explanations are non-additive. Station SPM remains station context, and the 2026 station inventory is **audit context only**, not a historical region-detail metric. Rainfall remains site/climate context with no natural environmental-quality penalty. Context presence is not a scoring benefit; unavailable context is not zero.

## 9. Rejected and parked candidates

The register in §4 provides each terminal decision and reason. The principal exclusions are substantive, not a shortage of indicator slots:

- Reject nested composite stacks, unsupported managed/unmanaged residuals, village-to-household coverage conversions and raw activity as an environmental-state score.
- Reject the inspected wrong-year critical-land, mangrove, marine-DO, forest-cover and processed-waste products **for 2023 admission only**. Do not silently substitute 2024/2025 or interpolate from 2020.
- Park historical SIPSN until the reporting roster, annual generation/reduction/handling definitions, revisions and district completeness are auditable.
- Park annual PM2.5/PM10/ISPU until actual 2023 measurements, quality-control/completeness rules and a defensible all-district spatial design exist.
- Park modelled PM2.5 until the district aggregation estimand, approved boundary crosswalk, mask, valid-area coverage and uncertainty treatment are established. Do not mix model versions or fill unmonitored districts with a second definition.
- Park federated RTH, chemistry and physical cover until actual rows, common definitions and denominators can be harmonized. A title, planning target or successful SPA request is not a measurement.

These are bounded evidence findings, not assertions that no other official source exists anywhere. No further low-yield search is required to defend the singleton recommendation under this deadline.

## 10. Known limitations and freeze risks

1. **Administrative summary, not original-measurement replication.** District component tables, exact site/sample logs, laboratory records and land-image dates were not independently recovered. There is no sampling uncertainty estimate or fine-order significance claim.
2. **Reference vintage.** The official 2023 index may use statutory prior-year land imagery and seasonal rather than continuous sampling. The release owner must accept this annual-index interpretation explicitly; it is not a freshness migration.
3. **Source edition conflict.** Provincial IKU 80.39 versus 81.39 remains unresolved. Keep that component qualified and do not rebuild or revise the district values from it.
4. **Structural and cross-domain overlap.** Land opportunity and urbanization influence the index. Environmental assets also contact IRBI vulnerability concepts. Do not claim dimension independence or add nested land inputs. Joint-model sensitivity must examine this contact without reopening finalized source decisions here.
5. **Waste reporting and mass balance.** No affirmative all-27 reporting-completeness result was established. Invalid shares cannot be repaired by clipping, zero filling or invented denominators.
6. **Geometry.** BPS code/name compatibility does not certify a polygon crosswalk. CIVX's approximate 2020 display map is not a validated 2023 analytical area or raster-aggregation denominator.
7. **Revision, reuse and approval.** Freeze the acquired bytes and hashes. Provider revisions require explicit versioning. Resolve redistribution rights and obtain named method-owner acceptance before an external release; no government endorsement is implied.

**Required freeze decision:** accept the narrow published-index construct and its urban/rural, sampling and overlap limitations. If judges or the method owner require continuous population exposure or independent field-sample equivalence instead, this audit does not provide that evidence; do not broaden the claim or substitute a weak second indicator.

## 11. Recommendation for the next methodology stage

Carry forward **one candidate contract**, not a new production score: `iklh_2023`, official district IKLH 2023, points, higher-is-better quality / lower pressure. Preserve the common 27-region cohort, source row IDs, raw values, fingerprints and limitations.

After named admission approval, evaluate normalization, dimension budgeting, weighting, cross-domain sensitivity and validation together. Do not let a singleton receive an accidental indicator-count or dimension-weight premium. Do not optimize weights to preferred rankings. Those decisions and any frontend integration are expressly outside this audit; existing production remains unchanged.

## 12. Reproduction and verification

Created raw bundles:

- `data/raw/environment-audit-2023/protocol.json`
- `data/raw/environment-audit-2023/indices.json`
- `data/raw/environment-audit-2023/waste.json`
- `data/raw/environment-audit-2023/air-exposure.json`
- `data/raw/environment-audit-2023/land-water.json`
- `data/raw/environment-audit-2023/locator-verification.json`

Created processed outputs, all with prefix `data/processed/environment-audit-2023-`:

- `candidate-register.csv`
- `observations.json`
- `statistics.json`
- `provenance.json`
- `decisions.json`

Research-only command:

```sh
node scripts/analyze-environment-audit-2023.mjs
node scripts/analyze-environment-audit-2023.mjs --check
```

The analyzer checks raw artifact hashes/bytes, all referenced source artifacts and candidate URL receipts, exact 27-region identity/order, year and raw source cells. It independently replays **253 API cells**, **135 PDF cells** and **four complete twelve-month facility sums**. These cell counts include explicit nulls/dashes; they are not counts of numeric observations. No numeric panel relies on an unchecked text receipt. Waste diagnostic operands and arithmetic are checked separately. The two recovered BNPB HTML responses had UTF-8 BOMs removed by the decoder; normalized text and exactly reconstructible original fingerprints are both recorded and verified.

`--check` compares every generated output byte-for-byte. A separate Python standard-library verification independently checked all 16 panels' coverage/descriptives, 117 Pearson/Spearman pairs, suspicious-zero membership and the 55 unique CSV decisions. No prior completed numerical panel was replaced during recovery. No new permanent test or dependency was added.

Repository checks: `npm run lint` passed without warnings/errors; `npm run build` passed compilation, TypeScript and generation of 37 pages. Existing application tests were not rerun because no application source, scoring input, policy or release contract changed. The audit CLI is the exercised changed surface. All **153 previously tracked files** match pre-audit fingerprints, including prior audits and production files. Final staged diff inspection found only the 13 new audit files; whitespace validation passed, with no unrelated or unstaged changes.

## Appendix A. Published CORE observations, BPS registry order

These are **official quality index values**, not normalized CIVX pressure scores or a new ranking. Source: dataset 20488, row IDs 136–162 in corresponding order.

| BPS code | Kabupaten/kota | IKLH 2023 |
| --- | --- | ---: |
| 3201 | Kabupaten Bogor | 60.61 |
| 3202 | Kabupaten Sukabumi | 64.68 |
| 3203 | Kabupaten Cianjur | 67.86 |
| 3204 | Kabupaten Bandung | 56.45 |
| 3205 | Kabupaten Garut | 66.89 |
| 3206 | Kabupaten Tasikmalaya | 63.73 |
| 3207 | Kabupaten Ciamis | 70.76 |
| 3208 | Kabupaten Kuningan | 71.11 |
| 3209 | Kabupaten Cirebon | 56.96 |
| 3210 | Kabupaten Majalengka | 60.98 |
| 3211 | Kabupaten Sumedang | 65.02 |
| 3212 | Kabupaten Indramayu | 59.76 |
| 3213 | Kabupaten Subang | 60.47 |
| 3214 | Kabupaten Purwakarta | 58.41 |
| 3215 | Kabupaten Karawang | 51.40 |
| 3216 | Kabupaten Bekasi | 47.49 |
| 3217 | Kabupaten Bandung Barat | 55.79 |
| 3218 | Kabupaten Pangandaran | 64.12 |
| 3271 | Kota Bogor | 58.00 |
| 3272 | Kota Sukabumi | 60.00 |
| 3273 | Kota Bandung | 56.32 |
| 3274 | Kota Cirebon | 50.04 |
| 3275 | Kota Bekasi | 45.81 |
| 3276 | Kota Depok | 53.27 |
| 3277 | Kota Cimahi | 44.65 |
| 3278 | Kota Tasikmalaya | 57.02 |
| 3279 | Kota Banjar | 62.72 |
