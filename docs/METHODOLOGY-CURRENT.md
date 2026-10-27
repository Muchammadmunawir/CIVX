# CIVX — Jawa Barat 2023: current methodology

This is the current single-product analytical contract. It supersedes the separate product model and historical four-/five-input scoring decisions for production UI, not their archived results. CIVX is a project-defined relative-pressure model, not an official government ranking, causal assessment, prediction or comprehensive measure of regional worth. Independent source/method review remains outstanding.

## Eligibility and common cohort

All **27** Jawa Barat kabupaten/kota use exactly the same **eight** core indicators, definitions, reference year, fixed normalization endpoints and weights. Core admission requires an official source, 2023-compatible reference period, administrative geography, 27/27 coverage, consistent unit, clear definition, defensible pressure direction and traceable evidence. No fabricated observation, silent imputation, clipping, per-region indicator removal or per-region reweighting is allowed. Any failed core input withholds the complete score.

The BPS code convention remains Peraturan BPS No. 3 Tahun 2019. Annual source windows differ; this is not a same-month measurement. Approximate 2020 map outlines are orientation geometry, not certified 2023 boundaries or an analytical input.

## Core and weights

| Dimension | Dimension weight | Indicator | Within dimension | Effective overall weight | Higher raw value means |
| --- | ---: | --- | ---: | ---: | --- |
| Socioeconomic | 25% | Poverty | 25% | 6.25% | More pressure |
| Socioeconomic | 25% | Open unemployment | 50% | 12.50% | More pressure |
| Socioeconomic | 25% | Human Development Index | 25% | 6.25% | Less pressure |
| Basic services | 25% | Improved sanitation | 1/3 | 8⅓% | Less pressure |
| Basic services | 25% | Improved drinking-water source | 1/3 | 8⅓% | Less pressure |
| Basic services | 25% | Puskesmas availability per 100,000 residents | 1/3 | 8⅓% | Less pressure |
| Public health | 25% | Published DBD incidence per 100,000 residents | 100% | 25% | More pressure |
| Resilience | 25% | Indeks Risiko Bencana | 100% | 25% | More pressure |

The policy stores thirds at full floating-point precision; displayed percentages are not a second weighting contract. Dimension weights sum to one. Internal indicator weights sum to one within each dimension. Effective overall weights also sum to one.

Equal dimension budgets are an explicit conceptual balance, not equal indicator importance or empirically estimated coefficients. They prevent the three-input dimensions from gaining weight merely through indicator count. Poverty and HDI share a capped deprivation allocation because HDI already includes health, education and expenditure. Unemployment retains half the socioeconomic budget. Three service proxies share their budget equally rather than letting facility availability dominate household-service coverage.

Public health and resilience each have one indicator, so each carries its entire dimension budget. This is an important limitation: their 25% effective weights are not a claim that a single observed rate or risk index precisely measures an entire dimension. Sensitivity compares alternative budgets and service allocations before retaining the transparent baseline. Infrastructure has no score or map layer because road eligibility fails; it does not receive zero or a hidden redistributed region-specific weight.

## Sources and transformations

### Existing foundation

[BPS, *Provinsi Jawa Barat Dalam Angka 2024*](https://jabar.bps.go.id/id/publication/2024/02/28/35ffe2d35104b39feb577e8f/provinsi-jawa-barat-dalam-angka-2024.html), revised 29 February 2024:

- Poverty: table 4.6.2, printed 307 / PDF 383; percentage of population, Susenas 2023.
- Open unemployment: table 3.2.16, printed 147 / PDF 223; percentage of labour force aged 15+, August Sakernas 2023.
- HDI: table 4.6.5, printed 311 / PDF 387; 2023 index, LF SP2020 life-expectancy basis.
- Improved sanitation: table 4.3.8, printed 261 / PDF 337; percentage of households, Susenas 2023.
- Improved drinking-water source: table 4.3.9, printed 262 / PDF 338; percentage of households, Susenas 2023.

Improved sanitation/water do not establish safely managed services, continuous availability, quality or affordability. Existing observations are retained without revision.

### Puskesmas availability

Numerator: official 2023 total Puskesmas, BPS table 4.2.7, printed 235–237 / PDF 311–313, originating from Dinas Kesehatan. The total inventory comprises inpatient and non-inpatient Puskesmas; it excludes satellite/mobile units, private clinics and hospitals. All 27 explicit totals sum to 1,106.

Denominator: exact 2023 resident population in [Dinas Kesehatan, *Profil Kesehatan Jawa Barat Tahun 2023*](https://app-diskes.jabarprov.go.id/drive/s/TyZTzEqnm5TfrM4/download/Profil%20Kesehatan%20Jawa%20Barat%20Tahun%202023.pdf), appendix table 1 / PDF 180. All 27 counts match the rounded BPS SP2020-based projection series; total 49,860,330 residents. Do not substitute the profile's different narrative population series.

`availability = published total Puskesmas / exact 2023 population × 100000`

The pipeline generates this rate, retaining raw numerator, denominator, formula, original subcategory symbols and both source locators. This BPS book's symbol legend, PDF 73, defines a dash as **negligible**, while zero is separately `0`. Dashes remain original symbols with null numeric subcategory values; the explicit published total remains the numerator. No ambiguous dash is silently imputed as zero or allowed to erase a valid total.

Lower availability models greater facility-supply pressure. This is **not measured healthcare access**: staffing, catchments, distance, opening hours, quality, private substitutes and cross-boundary use are unmeasured. Rural and urban service needs differ. The direction is a declared supply proxy, not a municipal-performance judgment.

### Published DBD incidence

BPS table 4.2.6, printed 233–234 / PDF 309–310, explicitly publishes 2023 DBD incidence per 100,000 residents for all 27 regions, originating from Dinas Kesehatan. Use that official rate unchanged, not raw cases or a newly derived ratio. Higher reported incidence models greater public-health burden.

The prior audit could not reproduce every published rate using separate case and population tables. The current decision accepts the common official reported-incidence series, not the assertion that those alternative denominators reconcile. Population vintage and source rounding remain unresolved limitations. Surveillance, diagnosis and reporting intensity also affect incidence. Higher incidence is not proof of worse governance or weaker detection capacity. The denominator definition and unresolved source base remain attached to provenance.

### Disaster risk

[BNPB, *Indeks Risiko Bencana Indonesia Tahun 2023*](https://inarisk.bnpb.go.id/pdf/BUKU%20IRBI%202023.pdf), Jawa Barat table on printed/PDF page 101, supplies all 27 official regional 2023 index values. Methodology: printed/PDF 17 and 20–21. Higher risk means greater modeled resilience pressure.

IRBI combines hazard, vulnerability and capacity; the 2023 edition retains older hazard/vulnerability baselines while capacity updates through IKD. It is the official **2023 risk index**, not 2023 observed losses, event counts, unique people affected or actual disaster impact. No population conversion is applied. Its source baseline and modeling assumptions remain explicit.

## Road-condition decision

Road condition remains **Context / not comparable**, not a ninth core input. The audited UPTD records track provincial managed roads located within each region, not all roads or a consistent kabupaten/kota-owned road network. The condition table lacks an explicit government-authority field; inspected BPS authority/condition totals and a Subang check do not establish a common denominator. Do not sum incompatible networks or fabricate a damaged-road percentage. No infrastructure score, contribution or map layer is published.

Actual disaster-impact counts likewise remain separate context because outcome overlap, repeated people, revisions and cross-source totals do not reconcile. IRBI admission does not validate those impact counts.

## Normalization, aggregation and rounding

For raw value `x`, fixed minimum `a`, maximum `b`:

- Higher means more pressure: `p = 100 × (x − a) / (b − a)`.
- Higher means less pressure: `p = 100 × (b − x) / (b − a)`.
- Dimension score: `D = Σ(within-dimension weight × p)`.
- Civic Index: `C = Σ(dimension weight × D)`.
- Indicator contribution: `dimension weight × within-dimension weight × p`.

The current JSON policy records exact all-27 endpoints and extremum regions. Filters never refit them. Nonfinite/out-of-range values, wrong units/year/geography, missing or unverifiable sources and incomplete core coverage withhold the entire result.

Arithmetic uses full precision through aggregation. Published normalized values, contributions, dimensions and overall score round independently to two decimals. Rounded contributions can differ from the rounded overall result by a few centipoints; never recompute the total from displayed parts.

Descriptive categories remain lower below 33.33, moderate from 33.33 to below 66.67, and higher from 66.67 upward. These are model-relative bands, not policy thresholds or statistically significant differences.

## Sensitivity and interpretation

The current sensitivity artifact compares plausible dimension budgets, alternative basic-service allocations, equal socioeconomic weights, equal indicator weights and poverty-only/HDI-only diagnostic representations. Each scenario stores weights, per-region score changes, tied-rank movement, Spearman correlation, pairwise reversals and category changes. Correlations document potential overlap, not causality or proof of redundancy.

Ten full-precision scenarios produced the following diagnostics. Order movement counts places among the 27 regions, with tied ranks averaged.

| Alternative | Maximum score change | Maximum order movement | Spearman | Category changes |
| --- | ---: | ---: | ---: | ---: |
| Socioeconomic 40%, others 20% | 7.26 | 5 | 0.971917 | 0 |
| Basic services 40%, others 20% | 7.80 | 6 | 0.946886 | 1 |
| Public health 40%, others 20% | 12.19 | 8 | 0.909646 | 5 |
| Resilience 40%, others 20% | 10.30 | 8 | 0.924908 | 2 |
| Equal socioeconomic inputs | 3.18 | 4 | 0.976190 | 1 |
| Facilities half of basic services | 3.95 | 2 | 0.989011 | 0 |
| Household services 80% of basic services | 3.16 | 3 | 0.989621 | 1 |
| Eight equal indicators | 10.65 | 7 | 0.896215 | 4 |
| Poverty-only deprivation diagnostic | 2.65 | 2 | 0.991453 | 0 |
| HDI-only deprivation diagnostic | 2.65 | 3 | 0.985958 | 0 |

These changes are material, particularly for singleton health/risk domains. The review rejected indicator-count weighting and privileged single-domain budgets, retaining four equal conceptual budgets rather than optimizing regional order. Equal service shares avoid privileging an unvalidated access proxy. Poverty/HDI overlap remains capped, not eliminated. Neither the selected weights nor descriptive categories establish a robust fine ranking.

The selected baseline follows conceptual dimension balance and bounded deprivation overlap, not a preferred regional order. Fine ordering can change materially under plausible weights. Use the index as a pressure profile and investigation starting point, not a precise league table. The method does not estimate sampling uncertainty, validate additive compensation or claim independent expert approval. Diagnostic indicator omissions are never production missing-data rules.

## Non-scoring evidence and disclosure

Context retains density, population, traffic/congestion, mobility, crime, partial transit/terminal/rail evidence, road condition, disaster impacts and healthcare availability. Actual years, partial coverage, incompatible geography and unavailability remain visible. Density is not an automatic penalty; police-jurisdiction crime is not mapped into administrative regions. No incompatible 2023 province-wide congestion metric enters the score.

Regional Advantages retain verified Whoosh in Bandung Barat, Kertajati in Majalengka and Cisumdawu in Sumedang. Other transport, airport, healthcare and digital capabilities remain optional evidence. Missing evidence means **No comparable verified data**, never no advantage, zero or a score penalty. Positives never reduce pressure. A dated capability does not prove continuous current service, region-wide access or service quality.

## Release history and reproducibility

Production reads only `data/processed/civx-jabar-2023-current.json` through `src/lib/civx/current.ts`. Version IDs remain internal metadata, release history and provenance; users never choose competing products.

- Original four-input raw, policy, output and `METHODOLOGY.md` remain unchanged under `data/releases/civx-v1-integrity.json`.
- Five-input raw audits, policy, processed release, sensitivity and historical methodology remain archived.
- Current raw records, policy, source fingerprints, sensitivity and processed output have their own versioned paths.
- Strict `npm run data:build` verifies original artifacts and never silently falls back. Explicit `npm run data:replay` checks frozen audited-input/policy fingerprints and available original artifacts without claiming unavailable remote originals were reacquired. Normal web builds consume committed processed data.

Whole BPS, health-profile and IRBI publications are not redistributed. Publication/reuse rights, independent review, certified effective-boundary compatibility, uncertainty estimates and optional evidence completeness remain open limitations.

The current release was generated by explicit audited-input replay. Original BPS, IRBI and local capability snapshot bytes were checked; the health-profile original could not be reacquired after source failures. Its already-audited, unchanged population observations remain traceable to the archived source fingerprint. `sourceVerification` records each artifact's exact build-verification state, and Sources displays it. This is not a new original-byte verification of the health publication.
