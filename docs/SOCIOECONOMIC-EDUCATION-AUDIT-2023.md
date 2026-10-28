# CIVX: Socioeconomic and Education evidence audit, Jawa Barat 2023

**Audit access date:** 28 October 2026. **Scope:** all 27 kabupaten/kota: 18 kabupaten (`3201`–`3218`) and nine kota (`3271`–`3279`).

**Decision:** recommend four Socioeconomic and three Education indicators for the **next, HDI-free model**. Retain TPAK, APK and adult literacy as context. Remove HDI/IPM from that model's direct scoring; retain it as context. These are indicator-admission recommendations, not approval of weights, normalization or a new production release.

**Change boundary:** no frontend, scoring implementation, weights, methodology configuration or production observations changed. The current release still uses HDI. This report does not silently change that contract.

Evidence files:

- [Socioeconomic observations and source receipts](../data/raw/audit-jabar-2023/socioeconomic.json).
- [Education observations and source receipts](../data/raw/audit-jabar-2023/education.json).
- [Computed statistics, all pairwise correlations, quality flags and input hashes](../data/processed/audit-jabar-2023-statistics.json).

All ten requested candidate series have **27/27 actual numeric 2023 records**, not merely advertised coverage. The evidence contains 270 candidate observations and 27 additional nominal-expenditure observations. Province totals were excluded, never copied into missing districts. Names were joined to canonical BPS identifiers; kabupaten and kota sharing names remain distinct. No missing values were filled, years substituted or weights changed.

## 1. Socioeconomic audit table

“Higher” describes the stated deprivation domain, not a causal claim about governance or all civic pressure. Exact titles and direct URLs appear in §8.

| Indicator | Source | Year | Coverage | Unit | Direction | Data quality | Redundancy risk | Recommendation | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Poverty / Persentase Penduduk Miskin (P0) | [BPS Jawa Barat yearbook][yearbook], table 4.6.2 | March 2023 | 27/27 | % of residents | Higher → higher pressure | Complete; same Susenas basic-needs concept; regional poverty lines vary by design | Related to adjusted expenditure, r = −0.718; not the same concept | **CORE** | Direct lower-tail consumption deprivation; not interchangeable with unemployment or inequality |
| Open unemployment / TPT | [BPS Jawa Barat yearbook][yearbook], table 3.2.16 | August 2023 | 27/27 | % of labour force aged 15+ | Higher → higher pressure | Complete; common Sakernas definition and SP2020-projection weights | Poverty r = −0.250; TPAK r = −0.553 | **CORE** | Distinct labour-market exclusion; low unemployment alone does not establish decent work |
| Gini Ratio | [BPS Jawa Barat district table][gini], variable 951, selected year 2023 | March 2023 | 27/27 | Coefficient 0–1 | Higher → higher inequality pressure | Complete; same series; 2023 source note verified; live table updated 17 December 2025 | Poverty r = −0.357; adjusted expenditure r = 0.581 | **CORE** | Adds distributional inequality, not average resources or poverty incidence; preserve snapshot vintage |
| Real adjusted expenditure per capita | [BPS Jawa Barat yearbook][yearbook], table 4.6.6, continuation | 2023 annual measure | 27/27 | Thousand real, purchasing-power-adjusted rupiah/person/year | Higher → lower material-living-standard pressure | Complete; official real/PPP-adjusted series, not nominal spending; dedicated IPM appendix agrees | Poverty r = −0.718; direct IPM component, so never score beside full IPM | **CORE**, next HDI-free model only | Adds average material resources beyond poverty's lower tail; price adjustment makes the direction defensible, with basket limitations |
| Labour-force participation / TPAK | [BPS Jawa Barat yearbook][yearbook], table 3.2.16 | August 2023 | 27/27 | % of residents aged 15+ | **Unclear/non-monotonic** | District cells agree across district tables; province summaries conflict | Shares labour-system context with TPT; not the same denominator | **CONTEXT ONLY** | High participation can reflect opportunity or necessity; low participation can reflect schooling, care or discouragement |

### Definitions and limits

- **Poverty:** a published rate, not a CIVX-normalized value or raw headcount. It counts people below the applicable regional food/non-food basic-needs poverty line. The common concept does not mean one identical nominal rupiah cutoff. It omits depth, vulnerability, debt and wealth.
- **TPT:** a published rate, not a CIVX score. Denominator is the labour force aged 15+, not all residents or all working-age residents. Informal, unpaid or low-hours employment can coexist with low TPT. People outside the labour force are not its denominator.
- **Gini:** an already bounded inequality coefficient, not a percentage and not a normalized CIVX score. BPS measures **expenditure inequality**, not income or wealth inequality. Equality can coexist with widespread poverty. The original [March 2023 inequality booklet][gini-booklet] confirms interpretation and scale, but does not provide a district revision history. The audited district snapshot is the official 2023 series accessed in 2026, not a claim that every cell is unchanged from first release.
- **Adjusted expenditure:** a published, already processed economic measure, not raw cash income and not a 0–100 score. [BPS methodology][ipm-method] makes annual expenditure real using a 2012 price base and adjusts purchasing power with a Rao-method basket of 96 commodities. This addresses the main spatial-price objection to nominal spending. It does not measure each household's actual cost of living, distribution or wealth. Never substitute nominal monthly spending multiplied by 12.
- **TPAK:** a published rate, not employment quality or employment-to-population ratio. Gender, age, schooling, unpaid care and economic necessity affect interpretation. Its ambiguous welfare direction independently blocks CORE admission.

## 2. Education audit table

| Indicator | Source | Year | Coverage | Unit | Direction | Data quality | Redundancy risk | Recommendation | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Average Years of Schooling / RLS, age 25+ | [BPS Jawa Barat IPM 2023][ipm-publication], appendix 4; yearbook table 4.6.6 cross-check | 2023 | 27/27 | Years | Higher → lower educational deprivation | Complete; all 27 cells independently match yearbook; common age 25+ definition | HLS r = 0.820; direct IPM component | **CORE**, next HDI-free model only | Accumulated adult attained schooling; distinct from current participation |
| Expected Years of Schooling / HLS | [BPS Jawa Barat IPM 2023][ipm-publication], appendix 3; yearbook table 4.6.6 cross-check | 2023 | 27/27 | Years | Higher → lower expected schooling shortfall | Complete; all 27 cells independently match yearbook; official synthetic expectation | RLS r = 0.820; APM r = 0.524; direct IPM component | **CORE**, next HDI-free model only | Current system-wide schooling expectation differs from attained adult stock |
| Net Enrollment Rate / APM, upper secondary | [BPS Jawa Barat “Angka Partisipasi Murni”][apm], 2023 SMA/MA/Paket C column | 2023; March basis corroborated | 27/27 | % of residents aged 16–18 | Higher → lower age-appropriate access deprivation | Complete; common table/year/level; percent unit corroborated despite defective live heading | RLS r = 0.578; HLS r = 0.524 | **CORE** | Adds specific contemporary upper-secondary access; not saturated like primary enrollment |
| Gross Enrollment Rate / APK, matching upper secondary | [BPS Jawa Barat “Angka Partisipasi Kasar”][apk], same year/level | 2023; March basis corroborated | 27/27 | Enrolled residents of all ages / residents aged 16–18 × 100 | **Conditional/unsuitable as an unqualified pressure direction** | Complete; 103.08% is permissible; same metadata caveat as APM | APM r = 0.757; HLS r = 0.748; same enrollment domain | **CONTEXT ONLY** | Adds age-grade-mismatch context but not an independent, monotonic welfare outcome |
| Literacy / AMH, age 15+ | [BPS Jawa Barat adult literacy table][amh], corroborated by [2023 static table][amh-static] | March 2023 | 27/27 | % of residents aged 15+ | Higher → lower basic literacy deprivation | Complete; all 27 values match independent official table; strong ceiling compression | Broad attainment overlap, but no pair reaches 0.85 | **CONTEXT ONLY** | 16/27 regions already reach 99%; weak broad discriminator, although local literacy gaps remain important |

### Definitions and incremental information

- **RLS:** official mean of completed formal-schooling years among adults aged **25+**. It is a duration measure, not an enrollment percentage, CIVX-normalized value or test of learning quality. Do not substitute the distinct age-15+ RLS in BPS national education publications. Migration and cohort replacement affect the adult stock.
- **HLS:** the official synthetic years-of-schooling expectation for a child starting at age **7**, built from current age-specific participation and a boarding-school correction. It is not realized schooling, an individual forecast or the mean observed schooling of all residents aged 7+. This official expectation is permitted source methodology, not a CIVX estimate or imputation.
- **RLS versus HLS:** Pearson r = **0.820162**, Spearman rho = **0.775199**. Neither triggers the requested absolute-r threshold of 0.85. The concepts remain different even though both reflect educational opportunity. Kabupaten Ciamis has HLS 14.29 years but RLS 8.09 years: current expectations need not match older cohorts' attainment. Keep both; future weighting must acknowledge their shared domain rather than treat them as independent experiments.
- **APM:** current upper-secondary enrollment among residents aged 16–18 divided by all residents aged 16–18. Scope is **SMA/SMK/MA/equivalent, including Paket C**, not SMP/MTs. The live column abbreviates this as `SMA/MA/Paket C`; official yearbook terminology corroborates the wider equivalent level. It adds a specific access margin not isolated by RLS or HLS. It is neither graduation nor annual entrants, transition, learning quality or the exact complement of out-of-school status. Delayed grades and accelerated progression affect it.
- **APK:** same level and resident age denominator, but numerator includes all enrolled ages. Above 100% is valid; no clipping is appropriate. The APK–APM difference is descriptive numerator-scope context, not an independently weighted pressure indicator or the percentage of over-age residents.
- **AMH:** any-script reading and writing among residents aged 15+, both sexes. Do not mix youth literacy, Latin-only literacy or the sum of overlapping script-specific rates. Saturation does not mean zero local literacy deprivation or established learning proficiency.

**Enrollment metadata qualification:** live APM/APK headings incorrectly say `Tidak Ada Satuan`. The ratio definitions and matching official yearbook 2023 provincial figures establish percent; values were not rescaled. Live tables do not repeat the survey month/design in every row. Contemporary BPS education/welfare publications support the March Susenas resident-survey interpretation, rather than an administrative school-location numerator. The missing live metadata is disclosed, not silently replaced. Ministry academic-year administrative observations were inspected but not mixed into these series.

## 3. Recommended final Socioeconomic structure

**SOCIOECONOMIC — proposed next model**

- Poverty rate / Persentase Penduduk Miskin.
- Open Unemployment Rate / TPT.
- Expenditure Gini Ratio.
- **Real adjusted annual expenditure per capita**, with the exact BPS IPM-component definition.

These represent lower-tail deprivation, labour exclusion, distributional inequality and average material resources. The expenditure measure qualifies only in its real/PPP-adjusted form. Its r = −0.718 with poverty warrants explicit overlap awareness, not automatic removal: average consumption and poverty incidence answer different questions, and no within-dimension candidate pair reaches 0.85.

Keep poverty and unemployment separate. Their r = −0.250 supplies no statistical basis for merging them, and their denominators and concepts differ. No weights or transformations are selected here. Do not add these components alongside the current full-IPM input.

## 4. Recommended final Education structure

**EDUCATION — proposed next model**

- RLS, resident population aged 25+.
- HLS, official expectation starting at age 7.
- Upper-secondary APM, SMA/SMK/MA/equivalent including Paket C, ages 16–18.

The dimension distinguishes adult attained stock, synthetic system-wide expectation and level-specific current access. None measures learning quality or completion directly. RLS/HLS conceptual overlap remains material; retaining both does not justify increasing Education's eventual weight by indicator count. APM adds only moderate correlations with both. This report approves no scoring budget or aggregation rule.

## 5. Indicators rejected or moved to context

| Indicator or variant | Disposition | Exact issue |
| --- | --- | --- |
| TPAK | **CONTEXT ONLY** | 27/27 coverage passes, but a single higher-is-better/worse pressure direction is indefensible. Province summary discrepancy is additional context, not missing district data. |
| Upper-secondary APK | **CONTEXT ONLY** | Complete data, but all-age enrollment combines access and age-grade mismatch; higher is not unconditionally better. It overlaps APM's level-specific participation domain. |
| AMH15+ | **CONTEXT ONLY** | Strong ceiling compression: mean 98.518%, population SD 1.738 percentage points, 16 regions ≥99%. Does not distinguish wider educational quality. Local lower-literacy values remain visible. |
| Nominal monthly expenditure, extra audited variant | **CONTEXT ONLY; rejected as a direct pressure input** | Higher nominal spending can reflect higher prices. Same nominal rupiah unit is not equal purchasing power. This is not the annual real-adjusted series recommended for CORE. |
| HDI/IPM | **REMOVE FROM CORE; CONTEXT ONLY** | Nested health/education/living-standard composite hides implicit overlap once separate dimensions use its components. See §6. |
| Province-only education tables | **REJECTED as district inputs** | Yearbook 4.1.13/4.1.14 and welfare table 3.6 do not contain all-27 district observations. Province rows cannot establish district coverage. Yearbook table 4.6.6 does separately contain regional RLS/HLS. |
| Ministry administrative enrollment variants | **REJECTED for this cohort** | Academic-year/cutoff and administrative numerator/population bases differ from the selected 2023 resident-survey series. They were not used to fill or replace observations. |
| Youth or script-specific literacy variants | **REJECTED as substitutes** | Different age or script scope. Script percentages overlap and cannot be summed into any-script literacy. |

No requested candidate was rejected for missing 2023 district coverage: all ten were collected. Context decisions reflect interpretation and usefulness, not availability alone.

## 6. HDI/IPM recommendation

**REMOVE FROM CORE. Retain as CONTEXT ONLY in the next model.**

The reasoning is methodologically sound. [BPS's method][ipm-method] constructs IPM from health, education and living-standard indices. Its education index averages normalized HLS and RLS; its expenditure component uses real adjusted expenditure. IPM then geometrically combines the three dimension indices.

Scoring full IPM alongside RLS/HLS and adjusted expenditure directly reuses those measurements and embeds undisclosed effective domain weights. Adding separate Public Health also creates conceptual health overlap, although life expectancy is **not the same measurement** as DBD incidence. That distinction matters: not every cross-domain association is literal duplication.

The observed IPM–RLS r = **0.953982** and IPM–adjusted-expenditure r = **0.922080** reinforce overlap concerns. IPM–HLS r = **0.843479** does not cross 0.85, but mathematical component reuse still exists. A correlation threshold cannot legalize nested duplicate inputs.

IPM remains useful as a familiar human-development reference with its own source vintage and LF-SP2020 life-expectancy basis. It must contribute **zero directly to the next Civic Index scoring model**. Agreement with IPM would not be independent validation when both models share component observations. The current code/configuration remains unchanged because this task authorizes an audit, not a scoring cutover.

## 7. Statistical findings

### Method

Statistics use the full 27-region cohort, original published precision and no population weighting. Means are regional means, **not published provincial rates**. SD divides by 27, not 26; it describes regional dispersion, not survey standard errors. CV is `100 × SD / mean`, used only for positive-mean ratio-scale measures. For near-ceiling percentages, inspect absolute range and saturation as well as CV.

Pearson correlations use raw published values joined by region ID; signs are not pressure-direction reversals. Spearman uses average ranks for ties. All 20 within-dimension pairs have n = 27. Possible redundancy is flagged at `|r| ≥ 0.85`; no causal or inferential-significance claims follow.

Quartiles use type-7 linear interpolation. Values outside 1.5 IQR fences are screening outliers; outside 3 IQR are extreme. The 1.5-IQR list includes extreme points. No flag led to deleting, winsorizing, clipping or imputing observations. A practical ceiling screen, CV <2% with mean ≥95% on a 0–100 measure, flags AMH; it is not a universal admission threshold.

### Candidate descriptive statistics

SD uses each row's stated unit; for rates it is percentage points. CV is percent. Missing counts refer to the expected 27 observations.

| Indicator | Unit | Min | Max | Mean | Median | Population SD | CV (%) | Missing | Unique values |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Poverty | % | 2.380 | 12.130 | 8.177 | 8.460 | 2.625 | 32.107 | 0 | 27 |
| TPT | % | 1.520 | 10.520 | 7.186 | 7.650 | 1.985 | 27.622 | 0 | 26 |
| Gini | 0–1 | 0.319000 | 0.468000 | 0.380407 | 0.369000 | 0.043596 | 11.460 | 0 | 26 |
| Adjusted annual expenditure | Thousand rupiah/person/year | 8,562.000 | 18,236.000 | 11,525.815 | 11,136.000 | 2,323.762 | 20.161 | 0 | 27 |
| TPAK | % | 61.950 | 80.150 | 66.967 | 66.970 | 3.560 | 5.317 | 0 | 27 |
| RLS25+ | Years | 6.940 | 11.660 | 8.870 | 8.230 | 1.429 | 16.111 | 0 | 25 |
| HLS | Years | 11.910 | 14.290 | 12.885 | 12.640 | 0.749 | 5.814 | 0 | 25 |
| APM upper secondary | % | 49.520 | 70.580 | 60.588 | 60.620 | 5.546 | 9.154 | 0 | 27 |
| APK upper secondary | % | 64.290 | 103.080 | 79.634 | 77.510 | 8.988 | 11.287 | 0 | 27 |
| AMH15+ | % | 92.520 | 99.870 | 98.518 | 99.190 | 1.738 | 1.764 | 0 | 24 |

Additional audited nominal-expenditure variant: min Rp1,039,588, max Rp2,733,270, mean Rp1,587,672.889, median Rp1,389,002, population SD Rp534,329.949 per person/month; CV 33.655%, missing 0, unique values 27. It is not mixed with the canonical expenditure candidate. Its full statistics and five within-Socioeconomic diagnostic correlations remain in the computed artifact.

### All within-dimension Pearson correlations

Upper triangles show each pair once. Full-precision Pearson and Spearman values remain in the computed artifact.

| Socioeconomic | TPT | Gini | Adjusted expenditure | TPAK |
| --- | ---: | ---: | ---: | ---: |
| Poverty | −0.250364 | −0.357112 | −0.717711 | 0.176507 |
| TPT | — | 0.432761 | 0.400065 | −0.553423 |
| Gini | — | — | 0.580726 | −0.403923 |
| Adjusted expenditure | — | — | — | −0.371198 |

| Education | HLS | APM | APK | AMH15+ |
| --- | ---: | ---: | ---: | ---: |
| RLS25+ | 0.820162 | 0.578418 | 0.674547 | 0.468721 |
| HLS | — | 0.524022 | 0.747941 | 0.419539 |
| APM | — | — | 0.756830 | 0.145755 |
| APK | — | — | — | 0.195243 |

**No requested candidate pair within either dimension reaches |r| ≥0.85.** RLS–HLS remains the strongest candidate-pair association and requires conceptual attention, not automatic removal. Adjusted expenditure–RLS across dimensions is 0.790355, also below the flag. The separate nested-IPM diagnostics above do trigger two redundancy flags.

### Low variance, extremes and suspicious records

- **AMH saturation:** 16/27 regions ≥99%; 21/27 ≥98%. Most of the cohort has limited remaining distance to the upper bound. Kabupaten Indramayu (92.52%) and Kabupaten Cirebon (93.70%) remain important exceptions; low CV is not evidence of no literacy problem.
- **HLS:** SD 0.749 years and range 2.38 years are not numerical collapse or ceiling saturation. RLS and APM also show meaningful observed dispersion. These are not claims that every small difference exceeds survey error.
- **TPT 1.5-IQR flags:** Kabupaten Ciamis 3.52% and Kabupaten Pangandaran 1.52%. Neither is beyond 3 IQR. Low open unemployment is compatible with subsistence/informal work; no replacement values were invented.
- **Adjusted expenditure 1.5-IQR flags:** Kota Bandung 18,236 and Kota Bekasi 16,479 thousand rupiah/person/year. Neither is a 3-IQR extreme. Both original cells were verified.
- **TPAK:** Kabupaten Pangandaran 80.15% is a **3-IQR extreme**, also in the 1.5-IQR list. The source publishes it; it remains context rather than being trimmed or converted into a welfare score.
- **APK:** Kota Bekasi 103.08% is a 1.5-IQR flag, not a 3-IQR extreme. Its all-age numerator permits values above 100%; this is not an invalid probability or a reason to clip.
- **AMH:** Kabupaten Cirebon 93.70% and Kabupaten Indramayu 92.52% exceed the lower 3-IQR fence in the compressed distribution. All 27 literacy cells independently agree across the official dynamic and static tables; these outliers are not evidence of transcription error.
- **Poverty, Gini, RLS and HLS:** no 1.5-IQR outliers. The extra nominal variant flags Kota Bogor and Kota Bekasi at 1.5 IQR, neither at 3 IQR.
- **Repeated rounded cells:** TPT 7.65 (Kabupaten Cirebon/Subang); Gini 0.361 (Kabupaten Garut/Cirebon); RLS 8.04 (Kabupaten Karawang/Pangandaran) and 10.37 (Kota Sukabumi/Cirebon); HLS 11.91 (Kabupaten Subang/Bandung Barat) and 12.26 (Kabupaten Kuningan/Majalengka); AMH 98.95 (Kabupaten Cianjur/Kota Banjar), 99.64 (Kota Sukabumi/Cimahi) and 99.81 (Kabupaten Bandung/Kota Tasikmalaya). These isolated published-precision ties do not establish copying. No two regions have identical ten-indicator vectors.
- **Missingness/identity:** zero missing candidate values, duplicate regional records, unexpected regions or name mismatches. No province row entered the district cohort.
- **Source inconsistency:** yearbook age-group table 3.2.1, printed 120/PDF196, reports provincial TPAK **66.51**, while district tables 3.2.2 and 3.2.16 report **66.49** and use different working-age totals. All 27 district TPAK cells agree between district tables. Inconsistent employment narrative totals were not used to derive a rate.
- **Metadata inconsistencies:** live APM/APK unit labels are deficient; IPM portal publication number `32000.24023` differs from PDF imprint `32000.2403`. Both were retained, not silently reconciled. Gini's district revision history is unavailable despite complete current 2023 values.
- **Timing/uncertainty:** poverty and Gini refer to March, TPT/TPAK to August, and the IPM component series to annual 2023 definitions. This is an annual reference-year panel, not a same-month observation. Selected district cells do not supply sampling errors/confidence intervals; observed variation and correlations do not certify precise regional ranks.

## 8. Data provenance

### Accepted indicator register

Every accepted indicator has reference year **2023** and audit access date **2026-10-28**. Publisher for every row is **Badan Pusat Statistik Provinsi Jawa Barat**. URLs are original official sources, not mirrors. “None” below means no new value calculation or CIVX normalization; published statistics themselves can be official survey estimates or source-defined transformations.

| Accepted indicator | Exact official dataset/table title and direct source URL | Exact locator / period | Transformation required |
| --- | --- | --- | --- |
| Poverty | [*Provinsi Jawa Barat Dalam Angka 2024*][yearbook] — “Jumlah dan Persentase Penduduk Miskin Menurut Kabupaten/Kota di Provinsi Jawa Barat, 2022 dan 2023” | Table 4.6.2, printed 307/PDF383; column (7), 2023 percentage; March Susenas corroborated by companion table | Parse decimal comma; select percentage, not poor-person count; retain %; map BPS region IDs; exclude province |
| TPT | [*Provinsi Jawa Barat Dalam Angka 2024*][yearbook] — “Tingkat Pengangguran Terbuka (TPT) dan Tingkat Partisipasi Angkatan Kerja (TPAK) Menurut Kabupaten/Kota di Provinsi Jawa Barat, 2021–2023” | Table 3.2.16, printed 147/PDF223; column (4), TPT 2023; August Sakernas | Parse decimal comma; select TPT rather than TPAK; retain %; map IDs; exclude province |
| Gini Ratio | [“Gini Ratio Kabupaten/Kota di Provinsi Jawa Barat”][gini] | BPS dynamic variable 951; year key `123` explicitly labels 2023; March Susenas note; `turvar=0`, `turtahun=0` | Parse official numeric cells; retain scale 0–1 and three-decimal source precision; map BPS IDs directly; exclude `3200`; no multiplication by 100 |
| Adjusted annual expenditure | [*Provinsi Jawa Barat Dalam Angka 2024*][yearbook] — “Komponen Indeks Pembangunan Manusia Menurut Kabupaten/Kota di Provinsi Jawa Barat, 2022–2023” | Table 4.6.6 continuation, printed 313/PDF389; column (9), 2023; independent [IPM appendix 5][ipm-publication], printed75/PDF89 | Parse Indonesian thousands separators: `11.153` means 11,153 **thousand** rupiah/person/year; retain source real/PPP adjustment and annual basis; no new deflation, annualization or normalization |
| RLS25+ | [*Indeks Pembangunan Manusia Provinsi Jawa Barat 2023*][ipm-publication] — “Rata-Rata Lama Sekolah (RLS) Menurut Kabupaten/Kota Tahun 2020–2023” | Appendix 4, printed74/PDF88; 2023 column (5). All 27 cells independently match yearbook4.6.6, printed312/PDF388, column(7) | Parse decimal comma; retain years and age25+; map IDs and preserve kabupaten/kota; no age-cohort substitution |
| HLS | [*Indeks Pembangunan Manusia Provinsi Jawa Barat 2023*][ipm-publication] — “Harapan Lama Sekolah (HLS) Menurut Kabupaten/Kota Tahun 2020–2023” | Appendix 3, printed73/PDF87; 2023 column (5). All 27 cells independently match yearbook4.6.6, printed312/PDF388, column(5) | Parse decimal comma; retain official synthetic years and starting-age7 meaning; no new forecast or estimation |
| Upper-secondary APM | [“Angka Partisipasi Murni”][apm] | BPS dynamic indicator97; explicit 2023 selection; `SMA/MA/Paket C` column; upper-secondary equivalent scope; table updated12September2025 | Parse decimal comma; retain percentage without rescaling; document defective live unit label and official corroboration; map names to IDs; no administrative numerator substitution |

### Other audited locators

- **TPAK:** same official yearbook table 3.2.16, column (7), printed147/PDF223.
- **Nominal monthly expenditure:** yearbook table 11.3, “Rata-rata Pengeluaran per Kapita Sebulan Makanan dan Bukan Makanan Menurut Kabupaten/Kota di Provinsi Jawa Barat (Rupiah), 2022 dan 2023”, printed681/PDF757, 2023 total column(7). The published total was retained rather than recalculated from independently rounded components.
- **APK:** [“Angka Partisipasi Kasar”][apk], indicator100, 2023 upper-secondary column; updated7November2025.
- **AMH15+:** [adult literacy dynamic table][amh], indicator956, selected2023, updated3March2026; independently matched against [“Angka Melek Huruf Menurut Kabupaten/Kota di Provinsi Jawa Barat 2023”][amh-static], updated8May2024. Static source explicitly states Susenas Maret2023.
- **IPM context:** yearbook4.6.5, printed311/PDF387, 2023 column(5); all27 existing archived observations independently matched original PDF cells. Its footnote specifies LF-SP2020 life expectancy. Historical booklet SP2010 life-expectancy text was not applied to 2023.
- **Definitions/survey corroboration:** [*Statistik Pendidikan 2023*, BPS RI][education-method] and [*Statistik Kesejahteraan Rakyat Provinsi Jawa Barat 2023*, BPS Jawa Barat][welfare-method]. The latter documents 26,040 sampled households across27 districts and the household survey design; this is not a census or a district precision guarantee.

### Artifact preservation and verification

- Existing yearbook: **11,915,084 bytes**, SHA-256 `500e82ecd02b081be83d884add8408fccc8fb1d57665f5b3e62a17ebc9f55f81`; first acquired26October2026, locally re-accessed and byte-verified28October2026. Publication released28February2024, revised29February2024. No fresh download is claimed for this reused artifact.
- Dedicated IPM2023 publication: **10,147,872 bytes**, SHA-256 `2400d561c711cd2aea83f5f3b8b6f1983774fa108aa06704b4837d3177a809c7`; acquired28October2026. Appendix2023 schooling cells were visually inspected and independently cross-checked against the local yearbook. The PDF was not added to the repository.
- Gini selected-year official response: **5,062 bytes** of decoded UTF-8 response text, SHA-256 `9e17a4025e47cded3002139ed07f0019c0a778af8f16b04e7e6585874e7944de`. The exact response text, request shape, year labels and each district's `datacontent` key are preserved inline in the raw evidence. This hash describes decoded response text, not compressed wire bytes.
- APM/APK/AMH official selected-year browser table text is preserved inline with representation-specific bytes and SHA-256 receipts. Those hashes identify captured hydrated table text, not unretained original HTTP documents. Each captured numeric district cell was reparsed and checked against the corresponding observation.
- Original PDF coordinate receipts independently verified135 socioeconomic/extra-variant cells. Another54 RLS/HLS cells matched the local yearbook,27 Gini response cells matched original keys,81 education browser-table cells matched captured records, and27 IPM context cells matched the original PDF. This verifies actual records rather than catalog promises.
- Restricted full publications are not redistributed. Source facts, selected table evidence, observation-level locators, original acquisition dates, audit dates and fingerprints remain traceable. Usage-rights clearance, independent expert review and statistical uncertainty assessment remain separate release gates.
- The computed artifact pins the two final raw evidence files by SHA-256 and records statistical formulas. It also records unchanged production-file hashes. No audit JSON is imported into production scoring or UI.

[yearbook]: https://jabar.bps.go.id/id/publication/2024/02/28/35ffe2d35104b39feb577e8f/provinsi-jawa-barat-dalam-angka-2024.html
[gini]: https://jabar.bps.go.id/id/statistics-table/2/OTUxIzI=/gini-ratio-kabupaten-kota-di-provinsi-jawa-barat.html
[gini-booklet]: https://jabar.bps.go.id/id/publication/2023/12/20/0489b78c74a7313cf2eebf9d/booklet-tingkat-ketimpangan-pengeluaran-penduduk-provinsi-jawa-barat-maret-2023.html
[ipm-publication]: https://jabar.bps.go.id/id/publication/2024/06/14/a2e7a86a8939c40c9d932c73/indeks-pembangunan-manusia-provinsi-jawa-barat-2023.html
[ipm-method]: https://searchengine.web.bps.go.id/filemenu/Booklet-IPM-Metode-Baru.pdf
[apm]: https://jabar.bps.go.id/id/statistics-table/2/OTcjMg==/angka-partisipasi-murni.html
[apk]: https://jabar.bps.go.id/id/statistics-table/2/MTAwIzI=/angka-partisipasi-kasar.html
[amh]: https://jabar.bps.go.id/id/statistics-table/2/OTU2IzI=/angka-melek-aksara-penduduk-umur-15-tahun-ke-atas-menurut-kabupaten-kota-di-provinsi-jawa-barat.html
[amh-static]: https://jabar.bps.go.id/id/statistics-table/1/NjkxIzE=/angka-melek-huruf-menurut-kabupaten-kota-di-provinsi-jawa-barat-2023.html
[education-method]: https://www.bps.go.id/id/publication/2023/11/24/54557f7c1bd32f187f3cdab5/statistik-pendidikan-2023.html
[welfare-method]: https://jabar.bps.go.id/id/publication/2023/12/28/8a2667bb40625076d8ee9c30/statistik-kesejahteraan-rakyat-provinsi-jawa-barat-2023.html

### Verification

- Independent Node smoke recomputed the ten candidates' descriptive statistics and all 20 Pearson correlations from the saved raw records. It checked 270 numeric observations, 27/27 identities per candidate, admission decisions, evidence SHA-256 receipts and unchanged production raw-input/policy/output/builder fingerprints.
- `npm run lint`: passed.
- `npm run build`: passed, including TypeScript checking and 37 generated pages.
- No UI changed, so no browser verification is claimed or needed for this audit deliverable. No production data regeneration or new scoring calculation was run.
