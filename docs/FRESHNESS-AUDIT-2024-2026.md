# CIVX CORE Freshness Audit 2024–2026

## Executive summary

**Recommendation: `KEEP_2023_AS_ONLY_FULL_MODEL`.**

Audit date: **29 October 2026**. Scope: research and compatibility audit of the existing 18 frozen CORE indicators, not a new scoring model.

The audit evaluates **54 indicator/year candidates**, retains **809 regional candidate observations** across 30 numerical panels, and records **25 source receipts covering 20 distinct official source URLs**. The search log contains 43 source-inspection/discovery entries, including recovered work from the interrupted run. A candidate row with no verified observations is an availability finding, not an invented dataset.

| Reference year | Compatible, full 27/27 | Compatible with caveat, full 27/27 | Defensible full panels, including caveats | Indicators still requiring another year or unresolved work |
| --- | ---: | ---: | ---: | ---: |
| 2024 | 13 | 2 | 15/18 | 3/18 |
| 2025 | 11 | 0 | 11/18 | 7/18 |
| 2026 | 0 | 0 | 0/18 verified | 18/18 |

2024 is the stronger **research candidate year**, but not a complete replacement model. Its blockers are the exact Puskesmas population denominator, the floor-area boundary, and total wasting. The two caveated 2024 panels are stunting and IKLH.

2025 additionally lacks verified regional APM, nutrition and IKLH panels, and its IRBI headline series has a material baseline break. No defensible 2026 regional panel was verified for any frozen construct. This is not a claim that newer observations do not exist.

**Newest available observation and newest defensible common-year model are different states.** This branch creates neither a 2024 nor a 2025 CIVX model.

## Frozen baseline and continuation

The final indicator freeze, normalization, weighting, scoring and CORE insight designs remain authoritative. All 18 indicator IDs and their pressure directions remain unchanged. An ID containing `2023` is still the frozen construct identifier; `candidateYear` separately describes the newer observation being audited.

The existing worktree contained only the audit protocol and an untracked validator when this continuation started. The earlier source research survived in saved tool transcripts. That evidence was recovered rather than restarting the audit. Where the transcript retained a PDF hash but omitted complete numeric tables, the same official BPS publications were restored in memory; their hashes matched the earlier receipts. Only unfinished definition/download checks were added.

The protocol protects **all 213 pre-existing tracked files**, not only the two headline artifacts. Protected layers include frozen inputs, designs, model/scoring/insight code, generated 2023 outputs, contextual audit artifacts, frontend files, dependency manifests and existing tests. No pre-existing tracked file is intentionally changed. The pre-existing untracked validator was extended for explicit source-defined zero symbols, independently audited rate components and compatible-unit checks.

Frozen SHA-256 values:

```text
civx-scores-2023.json
47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5

civx-insights-2023.json
ffd92543c6387c981d2647c8ed55bd3abb7f7c4e9b5b91d4a74fab81999d6345
```

No CORE recalculation, normalization, weighting, frontend integration, contextual integration, new dependencies or deployment occurs here.

## Method

### Geography

Every candidate has exactly 27 ordered observation slots using the frozen registry: kabupaten `3201`–`3218` and kota `3271`–`3279`. Numeric coverage counts only finite values actually retained, never a publisher's coverage claim. Province code `3200` is excluded.

BPS dynamic tables supply exact region codes. PDF labels were matched exactly against the canonical registry and their explicit kabupaten/kota sections. Coordinate-based extraction resolves printed columns; no geographic fuzzy matching, metropolitan crosswalk or province-to-district assignment is used.

### Source and period checks

For each candidate the raw audit records publisher, title, canonical URL, access date, publication/release metadata where known, actual reference period, enumeration period, unit, construct, numerator/denominator, method checks, coverage, missingness, caveats and recommendation.

A publication title or release year does not establish an observation year. In particular:

- *Jawa Barat Dalam Angka 2026* supplies the selected **2024 and 2025** district tables.
- *Statistik Pendidikan Provinsi Jawa Barat 2024*, released **31 December 2025**, uses **March 2024** Susenas.
- IPM 2025 methodology was published in **2026**, but describes **2025** indicators.
- SSGI's source reference is **2024**, although field collection ran **October 2024–February 2025** and results were released in **2025**.
- IRBI 2025's colophon identifies **January 2026**; its observations remain **2025**.

Unknown publication dates remain `null`. Search snippets locate sources but never supply retained numeric values. Inaccessible sources are identified as such; metadata or a file listing is not treated as an extracted regional dataset.

### Status rules

- `COMPATIBLE_CANDIDATE`: equivalent construct and denominator, clear unit/period, reproducible source, valid geography and all 27 retained observations, with sufficiently continuous methods.
- `COMPATIBLE_WITH_CAVEAT`: the same full-coverage requirements, but explicit survey, estimation or source-quality caveats require review before a new model.
- `PARTIAL`: 1–26 retained regional observations from a verified source/period. Partial coverage never becomes full through imputation. No selected candidate needs this as its primary status: the incomplete floor panel also has a construct break, so `NOT_COMPARABLE` takes precedence.
- `NOT_COMPARABLE`: a newer published measure exists but materially changes the frozen construct or method.
- `NOT_VERIFIED`: a possible source exists, but regional values, period, components or methodology were not reproducibly verified.
- `NOT_FOUND`: reasonable official-source investigation did not verify a candidate. This never means “data does not exist.”

`LATEST_CONTEXT_CANDIDATE` is an optional flag/recommendation, not a seventh compatibility status. It is used only to record the rebased 2025 IRBI series; nothing is integrated into contextual artifacts.

### Precision, missingness and transformations

Original source tokens accompany observed values. Indonesian decimal commas and grouped thousands are parsed without adding precision. For example, expenditure `11.563` means **11,563 thousand real PPP-adjusted rupiah/person/year**, not 11.563 rupiah.

Missing records use explicit JSON `null` values and reasons. `NA` remains null. BPS welfare section 1.5 explicitly defines the printed dash as absolute zero; only under that recorded source rule is a dash retained as zero. This is not inferred-zero imputation. The 2024 floor panel has one genuinely suppressed observation, Kabupaten Pangandaran (`3218`).

The only completed derived candidate is the frozen insurance complement:

```text
ownership_percent = 100 - published_no_health_insurance_percent
```

Both original percentage and constant are retained with provenance. The complement preserves the source's two-decimal precision. Insurance categories are not summed.

Puskesmas numerator panels are preserved separately from their unverified denominator panels. A verified count does not become a verified rate. No interpolation, synthetic observation, year substitution, province average, new CIVX pressure normalization or cross-dataset ranking is produced.

## Coverage matrix

Legend: **C** = `COMPATIBLE_CANDIDATE`; **CW** = `COMPATIBLE_WITH_CAVEAT`; **NC** = `NOT_COMPARABLE`; **NV** = `NOT_VERIFIED`; **NF** = `NOT_FOUND`. Parentheses show retained numeric region coverage, not compatibility. The frozen reference year for every row is 2023.

| Dimension | Frozen indicator ID | 2024 | 2025 | 2026 | Recommended research candidate |
| --- | --- | --- | --- | --- | --- |
| Socioeconomic | `poverty` | C (27/27) | C (27/27) | NV (0/27) | 2025, March |
| Socioeconomic | `unemployment` | C (27/27) | C (27/27) | NV (0/27) | 2025, August |
| Socioeconomic | `gini_ratio` | C (27/27) | C (27/27) | NF (0/27) | 2025, March |
| Socioeconomic | `expenditure_per_capita` | C (27/27) | C (27/27) | NF (0/27) | 2025, real annual IPM component |
| Education | `rls` | C (27/27) | C (27/27) | NF (0/27) | 2025, age 25+ |
| Education | `hls` | C (27/27) | C (27/27) | NF (0/27) | 2025, age 7+ |
| Education | `apm` | C (27/27) | NV (0/27) | NF (0/27) | 2024, upper-secondary only |
| Basic services | `sanitation` | C (27/27) | C (27/27) | NF (0/27) | 2025, household improved access |
| Basic services | `drinking_water` | C (27/27) | C (27/27) | NF (0/27) | 2025, household improved source |
| Basic services | `puskesmas_per_100k` | NV (0/27 rates) | NV (0/27 rates) | NF (0/27) | Neither rate admitted; counts verified |
| Basic services | `household-floor-per-capita-le7-2` | NC (26/27) | NC (27/27) | NF (0/27) | Neither: boundary differs |
| Basic services | `health_insurance_ownership` | C (27/27) | C (27/27) | NF (0/27) | 2025, explicit complement |
| Public health | `nutrition_ski2023_stunting` | CW (27/27) | NF (0/27) | NF (0/27) | Review SSGI 2024 |
| Public health | `nutrition_ski2023_wasting` | NC (27/27 moderate-only) | NF (0/27) | NF (0/27) | No equivalent total admitted |
| Public health | `morbidity_activity_limiting` | C (27/27) | C (27/27) | NF (0/27) | 2025, March recall window |
| Public health | `life_expectancy_lfsp2020` | C (27/27) | C (27/27) | NF (0/27) | 2025, LF SP2020 basis |
| Disaster | `irbi_overall_2023` | C (27/27) | NC (27/27) | NF (0/27) | 2024 for continuity; 2025 only separately flagged |
| Environment | `iklh_2023` | CW (27/27) | NV (0/27) | NF (0/27) | Review 2024 originating-source quality |

The machine-readable JSON and CSV contain all **54 expanded indicator/year rows**, including the required unit, denominator, source, period, methodology, comparability, missing-region and recommendation columns. JSON additionally includes complete candidate observations and source evidence. Blank nullable CSV metadata means unverified/unknown; JSON retains explicit `null` values.

## Indicator-by-indicator findings

### 1. Poverty

[BPS Jawa Barat Dalam Angka 2026](https://jabar.bps.go.id/id/publication/2026/02/27/2f027354da10870634aa1648/provinsi-jawa-barat-dalam-angka-2026.html), table 4.6.2, PDF 399 / printed 343, publishes 2024 and 2025 district headcount percentages. Use March Susenas observations, not provincial September releases, poverty counts, poverty gap or severity. Denominator remains all residents under the regional basic-needs poverty-line construct. Both years have 27/27 coverage. No 2026 district panel was verified.

### 2. Unemployment

The same yearbook, table 3.2.16, PDF 218 / printed 162, supplies **August** TPT for both years. District February cells are unavailable and are not substituted. Denominator is the labour force aged 15+, not all working-age residents. The table explicitly uses SP2020 projection weights. Both years have 27/27 coverage. No 2026 regional August panel was verified.

### 3. Gini ratio

The [official BPS district Gini table](https://jabar.bps.go.id/id/statistics-table/2/OTUxIzI=/gini-ratio-kabupaten-kota-di-provinsi-jawa-barat.html), variable 951, provides March Susenas 2024 and 2025 with exact BPS district codes. Values remain expenditure-distribution coefficients on 0–1, not income or wealth Gini. Province 3200 is omitted. The 2026 selector response contains no year/data cells. The last-update timestamp is metadata, not a new reference period.

### 4. Adjusted expenditure per capita

Yearbook table 4.6.6 continuation, PDF 405 / printed 349, supplies annual real expenditure for 2024 and 2025. Units remain **thousand real PPP-adjusted rupiah/person/year**. [IPM Jawa Barat 2025 methods](https://jabar.bps.go.id/id/publication/2026/04/24/0c2674c2c1c58efff303abc7/indeks-pembangunan-manusia-provinsi-jawa-barat-2025.html), PDF 33 / printed 19, confirm the annual PPP construct and 2012 reference. Nominal monthly consumption is not substituted. Both years have 27/27 coverage.

### 5. RLS

Yearbook table 4.6.6, PDF 404 / printed 348, supplies 2024/2025 district RLS. IPM 2025 methods, PDF 32–33, explicitly retain the **age 25+** population. This is not the separate age 15+ schooling series. Both years are compatible full panels.

### 6. HLS

The same table supplies 2024/2025 district HLS. IPM methods, PDF 31–32, retain the age 7+ construct and correction for boarding-school students outside ordinary household coverage. HLS is not current enrolment and does not guarantee a child's future schooling. Both years have 27/27 coverage.

### 7. Upper-secondary APM

The [BPS APM table](https://jabar.bps.go.id/id/statistics-table/2/OTcjMg==/angka-partisipasi-murni.html), variable 97 / variant 99 **SMA/MA/Paket C**, supplies all 27 districts for 2024. The percentage uses residents in the official upper-secondary age band, 16–18, in numerator and denominator. It is neither APK nor school-location pupil registrations.

[Statistik Pendidikan Jawa Barat 2024](https://jabar.bps.go.id/id/publication/2025/12/31/ea3de907c1903054419d8daa/statistik-pendidikan-provinsi-jawa-barat-2024.html), PDF 28 and table 3.19 / PDF 109, cross-checks the construct and reference year. Despite its December 2025 release, it contains March 2024 observations. Yearbook 2026 table 4.1.13 / PDF 273 contains **provincial**, not 27-district, 2025 APM. The district dynamic table returns no 2025 or 2026 cells. Thus 2025 is `NOT_VERIFIED`, not a province-imputed panel.

### 8. Sanitation

Yearbook table 4.3.8, PDF 343 / printed 287, supplies 27/27 household percentages for both years. [Statistik Perumahan Jawa Barat 2024](https://jabar.bps.go.id/id/publication/2025/08/01/32c703d14876751156f98240/statistik-perumahan-provinsi-jawa-barat-2024.html), PDF 58 and 68, confirms own/shared/communal swan-neck facilities, qualifying disposal and the **rural pit exception**. This matches the frozen improved-sanitation construct, not safely managed sewage treatment. The yearbook republishes the frozen 2023 series alongside the newer years without stating a definition change.

### 9. Drinking water

Yearbook table 4.3.9, PDF 344 / printed 288, supplies full 2024/2025 household percentages. Housing methods PDF 68 explicitly retain the conditional bottled/refill rule: another principal bathing/washing/other source must be protected. This is an improved-source classification, not laboratory-confirmed safety or continuous service. Older generic SIRUSA metadata associated with a 2002 survey excludes bottled water and was rejected as the definition for this modern series.

### 10. Puskesmas per 100,000 residents

The formula remains:

```text
main_puskesmas_count / exact_same_year_resident_population * 100000
```

Yearbook table 4.2.7, PDF 317 / printed 261, explicitly supplies all 27 **main inpatient + non-inpatient totals** for both 2024 and 2025. Auxiliary Puskesmas, clinics and Posyandu are excluded. The two numerator panels retain all 54 source counts separately.

The [Dinkes publication directory](https://diskes.jabarprov.go.id/profilkesehatan) lists both health profiles. The interrupted run recorded a 34,888,078-byte 2024 PDF, SHA-256 `4d36cb15263154fd0329e1ebed76b86f607c3d76f4188fac9b2e148e3283508a`, and appendix 1 / PDF 170's population header. The exact population rows were not saved or printed. The resumed [official 2024 share](https://app-diskes.jabarprov.go.id/drive/s/kcezxBnRbYEjp5J) timed out; the receipt does not justify inventing its cells.

The [2025 profile share](https://drive.jabarprov.go.id/index.php/s/87bqEdF4ewAPDj5) identifies an UPDATE4 PDF, but the inspected download paths returned HTML rather than the PDF. Exact-person values and release date were not verified.

Therefore denominator coverage and rate coverage are **0/27 in each year**, despite **27/27 numerator coverage**. These are audit retrieval/extraction gaps, not proof that the responsible agency lacks the data. Rounded yearbook population thousands and frozen 2023 denominators are not used.

### 11. Floor area per capita ≤7.2 m²

[Welfare Statistics 2024](https://jabar.bps.go.id/id/publication/2024/12/13/d9dc099d628ec6dd9ffc8d3b/statistik-kesejahteraan-rakyat-provinsi-jawa-barat-2024.html), table 6.4 / PDF 142, and [Welfare Statistics 2025](https://jabar.bps.go.id/id/publication/2025/11/28/5c47dbf83e4123e9a47090fe/statistik-kesejahteraan-rakyat-provinsi-jawa-barat-2025.html), table 6.4 / PDF 133, both print **`<7,2`**, verified visually from rendered headers. The frozen construct is **`≤7.2`**.

Equality is not interchangeable with strict inequality. No published equality mass allows the frozen band to be reconstructed. The 2024 table retains 26 observations plus Pangandaran's suppressed `NA`; 2025 retains all 27, including source-defined dash zeros. Both candidates are `NOT_COMPARABLE`, regardless of coverage. No baseline correction or new construct is made here.

### 12. Health insurance ownership

Welfare table 4.7, PDF 103 for 2024 and PDF 99 for 2025, provides an explicit **Tidak Punya / Tidak Memiliki** percentage for every district. Each ownership value is its exact decimal complement from 100. The denominator remains all resident persons in the Susenas household survey. Overlapping insurance categories are not summed, and active JKN or administrative membership is not substituted. Both years have 27/27 coverage.

### 13. Stunting

The [current BKPK-linked SSGI 2024 report](https://www.badankebijakan.kemkes.go.id/survei-status-gizi-indonesia-ssgi-2024/) has 27 district **total stunting** estimates in table 4.14 / PDF 50, printed 28. Definition remains height-for-age below −2, including severe stunting, ages 0–59 months. Published 95% confidence intervals are retained.

This is `COMPATIBLE_WITH_CAVEAT`: SKI changes to SSGI, fieldwork crosses October 2024–February 2025, and the report permits SAE when direct estimates fail precision/response/security/change criteria. PDF 35 and 41 describe RSE >25%, response <70%, security limitations and changes >10% relative to 2023. The final district table does **not** identify each row as direct or SAE. Its observations therefore retain `published_estimate`; no district method is guessed.

The [earlier launch PDF](https://kesprimkom.kemkes.go.id/assets/uploads/contents/others/SSGI_DALAM_ANGKA_LAUNCHING_250526_signed.pdf), table 4.54 / PDF 75, contained only 22 regional rows and separated moderate from severe stunting. It omitted Kabupaten Bogor, Ciamis, Cirebon, Bekasi and Kota Sukabumi pending further analysis. Omission is not zero and does not independently prove those five final rows use SAE. The [analysis guide](https://s.kemkes.go.id/PedomanAnalisisSSGI2024) was also inspected; no district-method crosswalk was verified. No defensible 2025/2026 SSGI district panel was verified.

### 14. Wasting

This audit found a separate construct trap in the same current SSGI table. Its **Wasting** column is **moderate-only**, `−3 ≤ weight-for-length/height z-score < −2`; severe wasting below −3 appears separately. The frozen SKI 2023 construct is **all below −2, including severe cases**.

All 27 moderate-only observations and their own confidence intervals are retained as `NOT_COMPARABLE`, not relabelled as total wasting. The audit does not silently sum rounded categories, and separate confidence limits cannot be added to create a total confidence interval. An official total or an explicitly reviewed component-based bridge remains necessary. No 2025/2026 equivalent total was verified.

### 15. Activity-limiting morbidity

Welfare table 4.2, PDF 98 for 2024 and PDF 94 for 2025, supplies male+female percentages for all 27 districts. Technical notes, PDF 95 and PDF 89 respectively, define complaints that interfere with work, school or daily activities. Denominator is all residents; reference window is the month before the March interview. Broader complaint prevalence, disease-specific administrative cases and annual incidence are not substitutes. No age-standardization is introduced.

### 16. Life expectancy, LF SP2020

Yearbook table 4.6.6 / PDF 404 supplies 2024/2025 district values. IPM 2025 methods PDF 31 explicitly say UHH uses **Long Form SP2020**, preserving the frozen demographic basis rather than substituting the older UHH series. Both years have 27/27 coverage. These are demographic estimates, not observed lifespans or proof of an individual's future longevity. No historical 2023 values are rewritten or a new retrospective series approved.

### 17. Overall IRBI

[BNPB IRBI 2024](https://inarisk.bnpb.go.id/pdf/BUKU%20IRBI%202024.pdf), Jawa Barat table / PDF 103, has 27 districts on the legacy baseline. Methods PDF 19 retain hazard/vulnerability based on IRBI 2013 and update capacity using the 71-indicator IKD. It is compatible with the frozen construct; it is not a count of that year's disasters.

[BNPB IRBI 2025](https://inarisk.bnpb.go.id/pdf/BUKU%20IRBI%202025.pdf) also has 27 districts, but PDF 16–17 changes hazard inputs to the 2021 basis, uses projected/dynamic vulnerability and adds two hazards. The publisher explicitly says old headline 2024 values cannot be compared directly. Unchanged internal 40/30/30 component weights do not remove that break.

Thus 2025 is `NOT_COMPARABLE` for direct frozen-series substitution. It is flagged only as a possible `LATEST_CONTEXT_CANDIDATE` with a series-break warning. The [public release/map index](https://inarisk.bnpb.go.id/irbi) inspected contains years through 2025, not a verified 2026 observation column. No contextual integration occurs.

### 18. IKLH

The [official Cirebon DLH 2024 accountability report](https://dlh.cirebonkota.go.id/storage/14/ppid/berkala/726cc244-0d86-42ab-b240-c37644602413.pdf), table 3.20 / PDF 59, printed 67, republishes all 27 district IKLH values for 2024. Its methods table 3.10 / PDF 47 explicitly uses `0.376 IKA + 0.405 IKU + 0.219 IKL` under Permen LHK 27/2021, compatible with the frozen district composite.

2024 is `COMPATIBLE_WITH_CAVEAT`, not an unconditional cutover. This is an official secondary republication, and two source-quality issues remain: Kabupaten Tasikmalaya's IKA is published as 0.00 without independently confirmed meaning; Cirebon's narrative IKU 81.70 differs from its table/formula 82.79. Published IKLH values **45.77** and **59.20** are retained without “repair,” recalculation or silent missingness inference. Originating provincial/ministry confirmation is recommended.

The [DLH provincial 2025 report directory](https://dlh.jabarprov.go.id/esakip2026) and linked public report were inspected, but did not yield a reproducibly retained 27-district 2025 panel. [Permen LH/BPLH 14/2025 metadata](https://peraturan.bpk.go.id/Details/345631/permen-lhbplh-no-14-tahun-2025) confirms repeal of 27/2021 effective 9 September 2025. That flags a required methodology-vintage check; it does not prove an unverified panel uses any particular new formula. No 2026 district IKLH observations were verified. Restricted portal rows were not copied to fill these gaps.

## Methodological changes and limitations

1. **Reference-year alignment:** annual IPM, March household indicators and August labour indicators are not same-month measurements even within a common reference year.
2. **Survey sampling:** repeated Susenas samples, non-sampling error and SP2020-based frames/weights remain relevant. Point-estimate differences do not prove significance or causal change.
3. **SSGI:** survey programme, cross-year collection, mixed direct/SAE methods and release revisions require explicit review. A 27-row final table is not evidence that every estimate is direct.
4. **Nutrition categories:** total stunting, moderate stunting, total wasting and moderate-only wasting must not be interchanged merely because column names look similar.
5. **Floor boundary:** `<7.2` cannot silently replace `≤7.2`; source-defined zeros cannot repair that construct break.
6. **Derived rates:** a numerator without a matched exact-person denominator remains an unverified rate. Facility supply is not proven accessibility or quality.
7. **IRBI:** the 2025 hazard/vulnerability rebasing breaks direct continuity, despite regional completeness.
8. **IKLH:** official republication and component anomalies limit confidence; the 2025 legal change requires a verified calculation vintage.
9. **Search/retrieval scope:** availability findings are bounded by sources accessed on the audit date. No inaccessible values, publication dates, direct/SAE assignments or missing years are invented.
10. **Rights/security:** only narrow attributed statistical extractions, public locators and method receipts are retained. Full HTML/PDF mirrors, signed BPS download URLs, cookies, private headers and credentials are excluded. BPS Terms of Use section 13 permits credited statistical use; document reproduction notices still apply.

## Candidate common year and gaps

The comparison engine counts compatible full panels separately from source observations:

| Reference year | Retained candidate region observations | Null candidate slots, out of 486 | Usable full-panel observations, including caveats | Minimum other-year indicator fallbacks if every gap used frozen 2023 |
| --- | ---: | ---: | ---: | ---: |
| 2024 | 458 | 28 | 405 | 3 |
| 2025 | 351 | 135 | 297 | 7 |
| 2026 | 0 | 486 | 0 | 18 |

“Retained” includes incompatible measures for audit evidence. It does **not** mean admitted to a model. For example, 2024 moderate-only wasting contributes 27 retained observations but zero compatible full panels. Numerator-only Puskesmas counts are separate and do not inflate the rate totals.

Using frozen 2023 values for every 2024 gap would require **3/18 indicators from another year**. For 2025 it would require **7/18**. Without accepting the two 2024 caveats, **5/18** indicators still need resolution or another year. These are hypothetical minimum fallback counts, not approval or generation of a mixed-year model. Such a hybrid must not be called an unqualified 2024 or 2025 model.

### Recommended next step

Keep the immutable 2023 model as the only complete CIVX model. Before any new-model design, seek:

1. Same-boundary official floor-area tabulations or a separately reviewed construct decision.
2. Official total wasting, or a reviewed severe-plus-moderate bridge that preserves precision and does not fabricate uncertainty.
3. Reproducible exact-person health-profile populations paired with each year's main Puskesmas count.
4. Region-specific SSGI estimation-method information and review of survey/fieldwork continuity.
5. Originating-agency confirmation of the 2024 IKLH panel and its component anomalies.
6. For a 2025 proposal, verified district APM, nutrition and IKLH panels, plus an explicit IRBI baseline decision.

These are source and human-review prerequisites, not unfinished scoring work. No newer score should be built in this audit branch.

## Files and architecture

```text
data/raw/freshness-audit-2024-2026/
  protocol.json
  socioeconomic.json
  education-life-expectancy.json
  basic-services.json
  nutrition-morbidity.json
  disaster-environment.json
  conclusion.json

scripts/audit-freshness-2024-2026.mjs
  -> offline validation and common-year assessment
  -> data/processed/freshness-audit-2024-2026.json
  -> data/processed/freshness-audit-2024-2026.csv

tests/freshness-audit-2024-2026.test.mjs
docs/FRESHNESS-AUDIT-2024-2026.md
```

The output contract keeps candidate evidence outside `src/lib/civx/` production contracts. JSON includes the frozen registry/construct metadata, source and computation manifests, candidate observations, expanded matrix, newest verified observation versus newest defensible full year, common-year assessments and a reviewed conclusion. Its offline replay does not re-estimate publisher surveys or reacquire remote data.

## Reproduction and validation

No package or dependency change is required. Run from the repository root:

```sh
node scripts/audit-freshness-2024-2026.mjs
node scripts/audit-freshness-2024-2026.mjs --check
npm test
npm run lint
npm run build
npm run data:score:2023:check
npm run data:insights:2023:check
npm run data:context:audit:2023:check
sha256sum data/processed/civx-scores-2023.json data/processed/civx-insights-2023.json
```

Generation and check require no network or AI API. The CLI validates 54 selected indicator/year rows, exact regional slots, finite values/source tokens, unique IDs, explicit missingness, metadata, component years/units, compatibility gates, credential-like capture and all 213 protected baseline fingerprints before writing. `--check` rejects byte drift without repairing outputs. An incomplete year cannot be approved merely by changing the conclusion.

The regression suite exercises construct traps, partial-coverage inflation, invalid geography, non-finite values, unit/period/source gaps, explicit source-defined zeros versus NA, exact component pairing, insurance complements, immutable CORE/context/frontend guards, credential rejection and deterministic JSON/CSV replay from another working directory under filesystem-only Node permissions.

### Validation results — 29 October 2026

- Offline generation and `--check`: passed; 54 selected indicator/year rows, 54 candidates and 809 retained observations.
- `npm test`: **222 passed, 0 failed, 0 skipped**. This includes all 205 pre-existing tests and 17 freshness-audit regression tests.
- `npm run lint`: passed without errors or warnings.
- `npm run build`: passed; Next.js compiled, completed TypeScript checking and generated all 37 static pages.
- `npm run data:score:2023:check`: passed for 27 regions, 18 indicators and 6 dimensions.
- `npm run data:insights:2023:check`: passed for 27 regions and 112 CORE insights.
- `npm run data:context:audit:2023:check`: passed; existing contextual artifacts and all 16 of that audit's CORE fingerprints remain unchanged.
- The freshness validator verified **all 213 pre-existing tracked files byte-for-byte unchanged**, including frontend and dependency files.
- Independent Python CSV/JSON consumer smoke: passed for 54 unique indicator/year rows, 27 canonical slots per candidate, numeric coverage and missing-region agreement.
- Deterministic replay: both generated files remained byte-identical across repeated offline runs from a separate working directory.
- Credential-pattern scan: passed across all 12 audit files, including raw evidence, generated artifacts, script, tests and documentation.
- Requested Git diff/worktree review: no tracked baseline changes; only the audit-specific files are untracked. No commit or push was made.
- Final direct SHA-256 checks matched both frozen fingerprints printed above exactly.

The precision regression first caught an ambiguity that could accept the source token `11.563` at the wrong scale. The validator now uses the BPS receipt's declared decimal-comma/dot-thousands format and rejects ambiguous unlabelled tokens. The failing-before/passing-after regression remains in the suite; no published candidate value or frozen value changed.
