# CIVX Jawa Barat 2023 — Final Indicator Freeze

**Status: FROZEN SCORING INPUTS ONLY.** Freeze **18 CORE indicators across exactly six dimensions**, with **486 usable observations: 18 × 27 kabupaten/kota**. No unresolved missing values or fatal cross-domain duplication were found. No audited indicator is removed or added.

**Ready for the normalization-design stage.** This decision does not select a normalization method, assign weights, invert or normalize values, calculate a Civic Index, generate rankings, or authorize production integration. Existing production remains unchanged.

Freeze date: **29 October 2026**. Reference vintage: **2023**, under each audit's explicit interpretation. No new indicator research or external source retrieval was performed for this consolidation.

## 1. Authority, reconciliation and scope

The following merged audits authorize the input set. Their final admission records, rather than preliminary wording or current production configuration, determine membership.

| Dimension | Authoritative audit | Audited CORE count | Freeze finding |
| --- | --- | ---: | --- |
| Socioeconomic | [Socioeconomic/Education audit](SOCIOECONOMIC-EDUCATION-AUDIT-2023.md), §§1, 3, 6 | 4 | Exact approved set retained; aggregate HDI/IPM absent |
| Education | [Socioeconomic/Education audit](SOCIOECONOMIC-EDUCATION-AUDIT-2023.md), §§2, 4, 6 | 3 | RLS age 25+, age-7 HLS and upper-secondary APM retained; APK/AMH not promoted |
| Basic Services | [Basic Services audit](BASIC-SERVICES-AUDIT-2023.md), §§D, F | 5 | Three retained inputs plus literal crowding and insurance ownership; definitions and derivations unchanged |
| Public Health | [Public Health audit](PUBLIC-HEALTH-AUDIT-2023.md), §§C, G | 4 | Four approved outcomes retained; UHH's HDI-free condition satisfied; DBD stays outside CORE |
| Disaster Pressure / modeled disaster risk | [Resilience audit](RESILIENCE-AUDIT-2023.md), §§A–B | 1 | Overall IRBI only; former broad Resilience label is not used for this contract |
| Environmental Quality Pressure / Tekanan Kualitas Lingkungan | [Environment audit](ENVIRONMENT-AUDIT-2023.md), §§1, 7 | 1 | District IKLH only, as an official administrative environmental-quality summary |
| **Total** | **Five documents covering six dimensions** | **18** | **No count discrepancy** |

The machine-readable authority is the audit outputs' final CORE lists and per-indicator CORE classifications. The freeze verifies both raw-audit classifications and final processed decisions. Conditional recommendations for expenditure, RLS, HLS and UHH become admissible together because **no full HDI/IPM indicator remains**.

### Separate from the current production model

[METHODOLOGY-CURRENT.md](METHODOLOGY-CURRENT.md) and the current production release still describe the existing eight-input model, including HDI/IPM and DBD. That is an intentional **production-versus-next-input-contract boundary**, not a contradiction between the authoritative audits. This task does not edit that document, production configuration, builders, release values, routes or frontend. The new contract is not imported into production.

All frozen IDs below are existing **audit IDs**. In particular, use `irbi_overall_2023` in this contract, not the production `disaster_risk` identifier. No compatibility alias or production migration is introduced.

## 2. Frozen list and direction contract

Every row has reference year **2023**, coverage **27/27**, missingness **0**, and frozen status **CORE / FROZEN**. The direction column describes what an increase in the unchanged raw observation means for the stated civic-pressure construct. It is not an executed transformation.

Source keys identify the already-audited sources in §3. Codes are only compact keys for the overlap matrix, not new indicator IDs.

| Dimension | Exact indicator ID / matrix code | Frozen measure and population | Unit | Source / reference window | Higher raw value means |
| --- | --- | --- | --- | --- | --- |
| Socioeconomic | `poverty` / PO | Poverty headcount rate / Persentase Penduduk Miskin, P0 | % residents | B1 table 4.6.2; March 2023 | **Higher pressure**: more lower-tail consumption deprivation |
| Socioeconomic | `unemployment` / UN | Open Unemployment Rate / TPT, labour force aged 15+ | % labour force aged 15+ | B1 table 3.2.16; August 2023 | **Higher pressure**: more labour-market exclusion |
| Socioeconomic | `gini_ratio` / GI | Expenditure Gini Ratio, not income/wealth Gini | Coefficient 0–1 | B2 variable 951; March 2023 historical snapshot | **Higher pressure**: more expenditure inequality |
| Socioeconomic | `expenditure_per_capita` / EX | Real adjusted annual expenditure per capita, BPS IPM-component definition | Thousand real PPP-adjusted rupiah/person/year | B1 table 4.6.6; annual 2023 | **Lower pressure**: greater mean material resources |
| Education | `rls` / RL | Average Years of Schooling / RLS, residents aged 25+ | Years | B3 appendix 4; 2023 | **Lower pressure**: more attained adult schooling |
| Education | `hls` / HL | Expected Years of Schooling / HLS, synthetic expectation starting at age 7 | Years | B3 appendix 3; 2023 | **Lower pressure**: greater expected schooling opportunity |
| Education | `apm` / AP | Upper-secondary APM; residents aged 16–18 attending SMA/SMK/MA/equivalent, including Paket C | % residents aged 16–18 | B4 selected 2023 SMA/MA/Paket C column; March basis corroborated | **Lower pressure**: greater age-appropriate upper-secondary participation |
| Basic Services | `sanitation` / SA | Private households with improved sanitation under BPS classification | % households | B1 table 4.3.8; March 2023 | **Lower pressure**: less sanitation-access deprivation |
| Basic Services | `drinking_water` / DW | Private households with an improved drinking-water source, including audited conditional bottled/refill rules | % households | B1 table 4.3.9; March 2023 | **Lower pressure**: less improved-source-access deprivation |
| Basic Services | `puskesmas_per_100k` / PC | Main Puskesmas availability per 100,000 exact 2023 residents | Main facilities/100,000 residents | B1 table 4.2.7 and H1 appendix 1; annual 2023 | **Lower pressure**: greater local primary-care supply intensity, not proven access |
| Basic Services | `household-floor-per-capita-le7-2` / CR | Private households in the published dwelling-floor-area band **≤7.2 m²/person** | % households | B5 table 6.4; March 2023 | **Higher pressure**: more literal household crowding |
| Basic Services | `health_insurance_ownership` / HI | Residents reporting any health-insurance ownership, all ages | % residents | B5 table 4.7, explicit “Tidak Punya” complement; March 2023 | **Lower pressure**: less formal insurance exclusion, not verified active benefits |
| Public Health | `nutrition_ski2023_stunting` / ST | Total stunting, measured children aged 0–59 months; height-for-age z-score <−2, including severe <−3 | % measured children aged 0–59 months | H2 table 15.12; SKI 2023 | **Higher pressure**: more chronic linear-growth deficit |
| Public Health | `nutrition_ski2023_wasting` / WA | Total wasting, measured children aged 0–59 months; weight-for-length/height z-score <−2, including severe <−3 | % measured children aged 0–59 months | H2 table 15.12; SKI 2023 | **Higher pressure**: more acute anthropometric deficit |
| Public Health | `morbidity_activity_limiting` / MO | Residents reporting health complaints disrupting work, school or usual activity in the preceding month | % residents | B5 table 4.2, both-sex column; month before March 2023 interview | **Higher pressure**: more reported functional illness |
| Public Health | `life_expectancy_lfsp2020` / LE | Life expectancy at birth / UHH, **LFSP2020 basis** | Years | B3 appendix 2; published 2023 estimate | **Lower pressure**: lower broad mortality-related health pressure |
| Disaster Pressure | `irbi_overall_2023` / IR | Official overall IRBI 2023; modeled residual disaster risk | Index points | D1, Jawa Barat table, PDF/printed 101; official 2023 index vintage | **Higher pressure**: greater modeled disaster risk |
| Environment | `iklh_2023` / EK | Official district IKLH 2023; ambient water/air/land environmental-quality summary | Index points, 0–100 | E1 dataset 20488; official 2023 annual administrative index | **Lower pressure**: better published environmental quality |

Machine direction values are `higher_raw_higher_pressure` and `higher_raw_lower_pressure`. No `100−x` pressure inversion, sign reversal, rescaling or normalization is applied. The insurance complement below is an already-audited **indicator definition**, not a pressure-direction transformation.

## 3. Exact source and denominator contract

Source URLs, producer names, original artifact identifiers, locators, source vintages and limitations are copied into each JSON indicator's `sourceReference`. Its `auditProvenance` identifies the exact raw panel and authoritative decision by file hash and JSON Pointer. Each retained observation keeps its source receipt and raw token/uncertainty where available.

| Source key | Publisher / already-audited source | Exact relevant locators |
| --- | --- | --- |
| B1 | BPS Provinsi Jawa Barat, *Provinsi Jawa Barat Dalam Angka 2024*, publication 32000.24001, revised 29 February 2024 | TPT: PDF 223 / printed 147; sanitation: 337/261; water: 338/262; poverty: 383/307; adjusted expenditure: 389/313; main Puskesmas total: PDF 312, column 11 |
| B2 | BPS Provinsi Jawa Barat, *Gini Ratio Kabupaten/Kota di Provinsi Jawa Barat*, variable 951 | Selected 2023 data, encoded source year 123. Historical table snapshot updated 17 December 2025; that update is not a 2025 observation substitution |
| B3 | BPS Provinsi Jawa Barat, *Indeks Pembangunan Manusia Provinsi Jawa Barat 2023* | UHH: appendix 2, PDF 86 / printed 72; HLS: appendix 3, 87/73; RLS: appendix 4, 88/74; annual expenditure corroboration: appendix 5, 89/75 |
| B4 | BPS Provinsi Jawa Barat, dynamic *Angka Partisipasi Murni*, indicator 97 | 2023 upper-secondary SMA/MA/Paket C column. Defective live unit heading is resolved by the audit's BPS ratio definitions/yearbook corroboration; values remain percentages without rescaling |
| B5 | BPS Provinsi Jawa Barat, *Statistik Kesejahteraan Rakyat Provinsi Jawa Barat 2023* | Morbidity: table 4.2, PDF 96 / printed 66, both-sex column 4; insurance: 4.7, PDF 101 / printed 71, column 6; crowding: 6.4, PDF 142 / printed 112, column 2. Precision references remain in original row receipts |
| H1 | Dinas Kesehatan Provinsi Jawa Barat, *Profil Kesehatan Provinsi Jawa Barat Tahun 2023* | Exact resident population: appendix 1, PDF 180, column 7; same chosen series for all 27 regions |
| H2 | BKPK Kementerian Kesehatan RI, *Survei Kesehatan Indonesia 2023 Dalam Angka* | Total stunting/wasting: table 15.12, PDF 953 / printed 914; definitions in 14.9. Probability-sample estimates, published CIs and weighted N retained |
| D1 | BNPB, *Indeks Risiko Bencana Indonesia Tahun 2023* | Common 2023 Jawa Barat index column, page 101; modeling/baseline interpretation from the Disaster Pressure audit |
| E1 | Dinas Lingkungan Hidup Jawa Barat / Galura, district IKLH dataset 20488 | Table `dlh.od_20488_indeks_kualitas_lingkungan_hidup__kabupatenkota_v1`, 2023 rows 136–162; common BPS district identifiers |

### The only two CIVX-derived inputs

1. **Puskesmas availability**

   `main_puskesmas_count / exact_2023_resident_population × 100000`

   The numerator includes main inpatient and non-inpatient Puskesmas only: **1,106 facilities** across the cohort. Do not include Puskesmas Pembantu, mobile units, clinics, Posyandu or hospitals. Use explicit published totals; do not reinterpret category dashes as zero.

   The denominator is the H1 exact-person 2023 resident series: **49,860,330 residents** across the same 27 regions. Do not substitute rounded BPS thousands, alternative health-profile population totals, facility catchments or patient visits. Each stored rate retains and checks both numeric operands and their source records. Values remain at audited full precision.

2. **Any health-insurance ownership**

   `100 − published_no_health_insurance_percent`

   Use B5 table 4.7's explicit **“Tidak Punya”** category, not a sum of overlapping insurer shares. The underlying denominator is all resident persons represented by the March 2023 survey, not households or active administrative JKN accounts. Preserve the audited two-decimal complement and original no-insurance input. Retain available no-insurance/complement standard errors and precision notes. Self-reported ownership does not establish active entitlement, reimbursement success, affordability or needed care received.

The generator **checks**, rather than replaces, all 54 audited formula results: 27 facility rates and 27 insurance complements.

### Published measures are not rebuilt

- Poverty uses poor residents divided by all residents under the common regional basic-needs concept. Different local poverty lines are part of that concept, not denominator incompatibility.
- TPT uses unemployed residents aged 15+ divided by the labour force aged 15+, not all working-age residents.
- Gini uses the expenditure distribution and is not a simple population rate. Keep its 0–1 coefficient scale.
- Adjusted expenditure remains the BPS annual real/PPP-adjusted measure, with 2012 real-price basis and the audited Rao/96-commodity adjustment. Do not multiply nominal monthly expenditure by 12 as a substitute.
- RLS is mean attained years among residents aged 25+. HLS is a corrected synthetic expectation starting at age 7, not observed attainment or an individual forecast. APM uses the same resident age band, 16–18, in numerator and denominator; no school-location administrative numerator is spliced in.
- Sanitation, water and crowding use weighted **private-household** survey denominators. No resident population is substituted. Crowding is the literal **≤7.2** band; it is not relabelled `<7.2` or treated as the exact complement of a composite's `≥7.2` sufficiency rule.
- Stunting and wasting use the relevant survey-weighted measured-child population, ages 0–59 months. Published `N tertimbang` is not district unweighted sample size or a reconstructed numerator. Severe subclasses are already included. Retained CIs do not authorize binomial error calculations from weighted N.
- Morbidity uses all survey-weighted residents and the previous-month functional-illness question, not all health complaints, diagnoses or clinic visits.
- UHH is a published synthetic life-table estimate, not cases divided by general population. The contract types it as `published_estimate`; the older audit's generic `published_rate` tag is retained separately as `auditValueType`. This clarifies machine type without changing definition or observations.
- IRBI and IKLH remain publisher composites with no new CIVX numerator, denominator or reconstruction. Their source coefficients are **not** CIVX weights.

## 4. Common geography, year and missingness

All 18 panels match exactly the existing registry's **18 kabupaten (`3201`–`3218`) and nine kota (`3271`–`3279`)**, in the same order. Shared place names never collapse kabupaten into kota. Province aggregate `3200` is excluded.

All **486 values** are finite and source-resolved. No selected panel has a missing cell or unresolved symbol, and none contains a numeric zero. All panels vary across regions. Values and available uncertainty are copied unchanged from their audited panels. There is no imputation, interpolation, winsorization, clipping, silent source merge, substituted denominator or per-region indicator removal.

“2023” means the audited reference interpretation, not one identical measurement date:

- Poverty, household services, insurance, schooling/survey inputs and morbidity preserve their March/preceding-month definitions. TPT preserves August Sakernas.
- Facility supply and expenditure preserve their annual interpretations; inventory dates are not asserted simultaneous with March surveys.
- SKI prevalence is the 2023 probability-survey estimate, not routine Posyandu reporting or a 2024/2025 replacement.
- LFSP2020 is UHH's mortality-estimation basis; the admitted observation is the published **2023 estimate**, not an observed birth cohort followed through life.
- IRBI is the official 2023 index with older fixed hazard/vulnerability baselines and capacity-assessment limits. No fresh 2023 hazard census is claimed.
- IKLH is the official 2023 administrative summary; statutory prior-year land imagery and seasonal monitoring limits remain disclosed. It is not continuous 2023 PM2.5 or population exposure.
- Retrieval/publication/revision dates in 2024–2026 remain provenance, not replacement observation years. Gini's 2025 update is an explicitly accepted historical snapshot qualification.

Administrative identity compatibility does not certify map polygons, patient catchments or spatial representativeness. The existing approximate 2020 display geometry is not a 2023 rate denominator or a raster-aggregation crosswalk.

## 5. Joint conceptual overlap matrix

The complete machine-readable review contains **all 153 unordered indicator pairs**, their rationale, audit references and raw-value Pearson diagnostic. The matrix below uses the codes from §2.

- `S`: accepted shared domain, distinct estimands.
- `P`: accepted possible cross-domain pathway or shared deprivation mechanism; **not an estimated causal effect**.
- `F`: distinct components of the former IPM parent, which is excluded.
- `V`: accepted conceptual contact with the disaster composite's vulnerability/environmental concepts; no explicit component duplication demonstrated.
- `.`: no direct component/complement or essentially identical estimand identified. This does **not** assert independence or absence of every possible pathway.
- `—`: self. No fatal duplication cell exists in the selected set.

| | PO | UN | GI | EX | RL | HL | AP | SA | DW | PC | CR | HI | ST | WA | MO | LE | IR | EK |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PO | — | . | S | S | . | . | . | . | . | . | P | . | . | . | . | . | V | . |
| UN | . | — | . | . | . | . | . | . | . | . | . | . | . | . | . | . | . | . |
| GI | S | . | — | S | . | . | . | . | . | . | P | . | . | . | . | . | . | . |
| EX | S | . | S | — | F | F | . | . | . | . | P | . | . | . | . | F | . | . |
| RL | . | . | . | F | — | S | S | . | . | . | . | . | . | . | . | F | . | . |
| HL | . | . | . | F | S | — | S | . | . | . | . | . | . | . | . | F | . | . |
| AP | . | . | . | . | S | S | — | . | . | . | . | . | . | . | . | . | . | . |
| SA | . | . | . | . | . | . | . | — | S | . | . | . | P | P | P | . | V | . |
| DW | . | . | . | . | . | . | . | S | — | . | . | . | P | P | P | . | V | . |
| PC | . | . | . | . | . | . | . | . | . | — | . | S | P | P | P | P | . | . |
| CR | P | . | P | P | . | . | . | . | . | . | — | . | P | P | P | . | V | . |
| HI | . | . | . | . | . | . | . | . | . | S | . | — | P | P | P | P | . | . |
| ST | . | . | . | . | . | . | . | P | P | P | P | P | — | S | . | . | . | . |
| WA | . | . | . | . | . | . | . | P | P | P | P | P | S | — | . | . | . | . |
| MO | . | . | . | . | . | . | . | P | P | P | P | P | . | . | — | S | . | . |
| LE | . | . | . | F | F | F | . | . | . | P | . | P | . | . | S | — | . | . |
| IR | V | . | . | . | . | . | . | V | V | . | V | . | . | . | . | . | — | V |
| EK | . | . | . | . | . | . | . | . | . | . | . | . | . | . | . | . | V | — |

### Required overlap decisions

| Relationship | Joint decision and constraint |
| --- | --- |
| Poverty / adjusted expenditure / Gini | Retain lower-tail deprivation, mean real resources and distributional inequality. Same consumption domain does not make the estimands identical. No claim of three independent experiments |
| RLS / HLS / APM | Retain adult attained stock, synthetic expectation and contemporary level-specific participation. HLS and APM share participation information, but neither is the complete other measure. Future Education budgeting must acknowledge overlap |
| Insurance / Public Health outcomes | Retain formal entitlement/ownership versus nutrition, morbidity and survival. Ownership is neither health status nor a measured treatment effect |
| Puskesmas / Public Health outcomes | Retain local supply intensity versus outcomes. Need-based allocation, catchments, cross-border use, age structure and confounding can affect association; do not infer causal service effectiveness |
| Crowding / Socioeconomic deprivation | Retain literal physical space per household occupant versus poverty, mean resources and inequality. The selected crowding value is not a monetary poverty component or a deterministic consumption transformation |
| UHH / former HDI structure | Retain UHH only because full IPM is absent. RLS, HLS, expenditure and UHH are distinct components, not four copies of the parent. Later correlation with IPM is not independent external validation |
| Stunting / wasting | Retain distinct chronic/acute anthropometric axes. They can co-occur in children; do not add the percentages as disjoint people or add severe subclasses beside totals |
| Morbidity / UHH | Retain short-term functional illness versus long-run modeled survival. Different periods and measurement processes; not complements |
| IKLH / IRBI | Retain ambient water/air/land quality versus hazard-conditioned residual disaster risk and exposed environmental damage/assets. The audits establish conceptual contact, not identity of the composites or proof of independence |
| WASH/crowding / health outcomes | Accept plausible condition–outcome pathways, not a repeated source measurement. Keep household conditions and survey health outcomes in their audited domains |
| IRBI / material and physical vulnerability concepts | Disclose implicit conceptual contact; do not add poverty/service/asset proxies again as extra Disaster Pressure inputs |

### Numerical diagnostic, not a removal rule

All 153 pairs use the same complete 27-region cohort, unchanged raw values and no pressure-direction reversal. There are **zero identical numeric vectors** and **zero pairs with absolute Pearson correlation ≥0.85**. The largest absolute coefficient is RLS/HLS, **0.820162**. These facts support the review but do not establish independence or validate aggregation.

Selected checks: poverty/expenditure `r = −0.717711`; HLS/APM `0.524022`; insurance/morbidity `−0.562129`; Puskesmas/UHH `0.073238`; stunting/wasting `0.121191`; IKLH/IRBI `0.453726`. No indicator is removed solely because of correlation. Even a weak correlation would not permit a mathematically nested parent/component stack.

## 6. Exclusions and fatal-consistency finding

**Fatal issue found: none.** The actual audit lists agree with 18, every admitted panel is usable for the common cohort, and all conditional HDI-free admissions are satisfied. No source decision is reopened.

| Excluded input or stack | Freeze safeguard |
| --- | --- |
| Full HDI/IPM beside UHH, RLS, HLS or adjusted expenditure | Aggregate absent from the frozen set; not imported through another identifier |
| DBD, TB/HIV and other notifications | DBD is not restored; notification/detection evidence remains at its audited context/rejected status |
| APK or adult literacy/AMH | Not promoted from Education context |
| Adequate-housing composite beside WASH/crowding | Composite absent; its nested service/space measurements are not scored twice |
| IRBI plus hazard-specific risk, exposure/vulnerability components or IKD | Only official overall IRBI admitted; no new Disaster Pressure component |
| IKLH plus IKA/IKU/IKL/IKAL | Only district IKLH admitted; media context is non-additive |
| Alternative source editions, nominal expenditure, raw counts or unsupported waste shares | No replacement, additive duplicate or silent promotion |

The old production model's HDI/DBD status is not copied into the next contract. Conversely, this freeze does not remove those inputs from production before a separately authorized cutover.

## 7. Dimension budgeting and unresolved methodology decisions

**Required weighting-stage constraint:** indicator count must not silently determine dimension importance. A singleton Disaster Pressure or Environment dimension must receive neither an automatic penalty nor premium because another dimension has five indicators. This is not an instruction to assign equal weights; **no final dimension, subdimension or indicator weight is assigned here**.

Preserve the audits' hierarchy for subsequent budgeting:

- Basic Services: **Water & Sanitation**; **Healthcare Service Access & Capacity**; **Housing Crowding**. Puskesmas is one supply proxy, not permission to stack hospitals, beds and staff alternatives. Insurance adds a distinct formal financial-access margin.
- Public Health: **Nutrition** and **General Population Health**. Unadmitted infectious/maternal-child domains are not zero-valued scored branches or a reason for hidden reweighting.
- Socioeconomic and Education must acknowledge the accepted material/education overlap. IRBI and IKLH remain single published composites, not new internally reconstructed CIVX submodels.

Next-stage tasks remain normalization design, explicit budgets and weights, uncertainty/overlap sensitivity, joint validation and eventual production integration. The freeze neither chooses a method nor certifies a weighted aggregate. Do not fit choices to preferred rankings. Independent expert review, redistribution rights and external release approval remain separate governance decisions, not fabricated numerical inputs.

## 8. Frozen limitations

The JSON retains each indicator's original limitations and available uncertainty, including per-region survey precision. Important cross-cutting qualifications are:

1. Consumption poverty, inequality and resources capture different margins, but share survey/material conditions. Equality can coexist with poverty; expenditure is not income or wealth.
2. Schooling duration is not learning quality. RLS is age 25+, HLS is synthetic, and APM is not completion or an exact out-of-school complement. Source heading/revision limitations remain attached.
3. Improved WASH does not establish safely managed, continuously available or affordable services. Puskesmas supply is not actual travel/catchment access. Insurance ownership is not verified active benefit coverage.
4. Crowding preserves the published equality boundary. Most selected schooling/housing cells lack matched district uncertainty; absence of an interval is not zero uncertainty.
5. SKI anthropometric estimates have overlapping CIs and weighted—not unweighted—bases. Morbidity depends on self/proxy report, awareness, recall and age composition. UHH is a slow-moving modeled survival measure with narrow spread and no district CIs in the cited appendix.
6. IRBI retains older baselines and annual capacity-assessment limitations; it is neither observed 2023 damage nor broad resilience capacity.
7. IKLH is an official administrative environmental-quality summary, not independently reproduced media measurements or PM2.5 exposure. District sample logs/land dates and the provincial IKU 80.39/81.39 source conflict remain as disclosed in the Environment audit; no district values are reconstructed from that conflict.
8. Code/name compatibility is not certified effective-year polygon equivalence. Ecological urban/rural structure and cross-boundary systems limit municipal-performance interpretations.

These limitations are accepted within the already-authorized literal constructs. They do not justify silent value changes, dropped regions, substituted years or an expanded exposure/causal claim.

## 9. Machine contract, reproducibility and verification

Deliverables:

- `data/processed/final-indicator-freeze-2023.json` — complete frozen contract, all 18 definitions/directions, source and audit references, **486 original observations**, uncertainty, derivation operands, evidence manifest and 153-pair overlap review.
- `data/processed/final-indicator-freeze-2023.csv` — compact 18-row register for inspection; JSON is authoritative for detailed operands and limitations.
- `scripts/freeze-final-indicators-2023.mjs` — offline generator/validator; no production imports, network calls or dependency additions.

```sh
node scripts/freeze-final-indicators-2023.mjs
node scripts/freeze-final-indicators-2023.mjs --check
```

Validation contract:

- Stop before writing a freeze if the authoritative count differs from 18, a dimension count differs, or the exact approved ID sets disagree.
- Require exactly six dimensions, unique IDs, 27 canonical region rows per indicator, source-resolved finite values, admitted 2023 scope and source/row-year consistency.
- Check every selected raw classification and final audit classification is CORE. Preserve HDI/DBD/context and nested-composite exclusions.
- Check raw-versus-processed equality for the six Health/Disaster/Environment panels with dedicated processed observation outputs. Other selected panels link directly to their authoritative audited raw panels; all values remain unchanged.
- Check all 27 Puskesmas numerator/denominator pairs and 27 insurance complement operands. No new unpublished numerator/denominator is estimated.
- Check all 153 numeric pairs for identical vectors, alongside the explicit conceptual matrix. Correlation is never a sole removal criterion.
- Pin **24 audit/registry evidence files** by SHA-256 and bytes. All selected source-reference objects and row receipts remain reachable. On rerun, a changed pinned input blocks regeneration pending an explicit reviewed freeze revision; it cannot silently replace a frozen source snapshot.
- `--check` requires byte-for-byte agreement of both committed processed outputs with the offline derivation and generator fingerprint.

### Exercised validation results

- Offline generation and deterministic `--check` passed: 18 CORE indicators, six dimensions, 486 usable observations, zero missing values, 54 formula checks, 153 pair checks and 24 pinned evidence files.
- An independent Python standard-library check matched all 486 source observations and source objects, authoritative CORE decision pointers, all 54 formulas, all 153 Pearson coefficients, all 324 matrix cells, the document matrix and the 18 CSV records. Every source panel retained its audited 2023 scope and original values.
- Four throwaway CLI scenarios rejected before writing: an authoritative total of 17; a CORE ID also marked CONTEXT; a 2024 source scope; and drift in a pinned audit snapshot. The existing frozen JSON/CSV remained unchanged. Temporary fixtures were removed.
- `npm run lint` passed without warnings/errors. `npm run build` passed compilation, TypeScript and generation of 37 pages.
- All **166 previously tracked files** match their pre-freeze SHA-256 fingerprints, including prior audits, production raw/processed inputs, scoring/configuration, frontend, dependencies and current methodology documentation.
- No application tests were rerun because no application/scoring/UI contract changed. The new offline freeze CLI and its rejection paths are the exercised changed surface. No new permanent test or dependency was added.

**Final decision:** the 18-input set is frozen and ready for normalization design. Accepted overlap remains explicit; no fatal issue or indicator removal is identified. Normalization method, weights, scoring, rankings and production cutover remain unselected and unperformed.
