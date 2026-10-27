# CIVX Methodology

**Status:** Jawa Barat 2023 project scoring release; original four-indicator method unchanged as regional coverage expands

## 1. Concept of the CIVX Index

The CIVX Index is a transparent composite signal of **relative regional pressure** across selected indicators for comparable kabupaten/kota and periods. It is intended to help users decide where to investigate further. It is not a measure of a region's intrinsic worth, a causal explanation, a forecast, or a complete measure of welfare.

The index must expose its parts: observed values, transformed values, weights, missingness, sources, and methodology version. An aggregate must never be the only available explanation. No numeric confidence score is published in this release.

## 2. Calculation stages

An expanded future release may execute additional versioned stages. The actual 2023 competition calculation is defined in §11.

1. **Eligibility:** select observations that pass source, geography, period, definition, and quality rules.
2. **Direction:** define whether higher raw values mean more or less pressure; record any reversal.
3. **Unit handling:** convert units only with documented and auditable rules.
4. **Normalization:** map eligible indicators onto a common scale.
5. **Indicator aggregation:** combine indicators within a dimension.
6. **Dimension aggregation:** produce an overall index only when evidence coverage is sufficient.
7. **Confidence and diagnostics:** calculate evidence quality, coverage, sensitivity, and warnings.
8. **Publication:** attach data-release, methodology, and computation versions.

No stage may silently treat missing data as zero, silently drop a region, or silently change the comparison population.

## 3. Normalization approach

Raw indicators use incompatible units, so each eligible indicator needs a documented transformation.

### 2023 release method

The Jawa Barat 2023 release uses fixed **min–max** endpoints from all 27 kabupaten/kota in the same year's BPS tables, not percentile/rank normalization and not endpoints fitted to the published subset. See §11 for indicators, directions, extrema, and out-of-range handling. A new period or reference population requires a new methodology version.

Normalization must not be fitted separately to each region or to an undisclosed comparison population.

## 4. Weighting and aggregation

For the 2023 release each of four indicators carries 25% weight. The index is the sum of normalized indicator scores multiplied by 0.25; no separate dimension score or learned weight is used. Equal weighting is a declared project modeling choice, not evidence of equal substantive importance. Future alternative weights require a new version and sensitivity review.

## 5. Missing-data handling

- Missing must not be converted to zero.
- Missingness reasons must be retained: not published, not applicable, withheld, failed acquisition, incompatible geography, failed validation, or other documented status.
- Component scores should be withheld or labeled partial when required coverage is not met.
- This release requires all four inputs, their 2023 evidence, and their source artifact IDs. Any failure withholds the whole score: no partial result, imputation, or reweighting.
- A future partial-coverage policy needs its own version and explicit approval.

## 6. Confidence scoring

Confidence is an evidence-quality diagnostic, not an adjustment that makes a weak result appear stronger and not a causal probability. The 2023 competition release publishes **no confidence score or labels**; failed eligibility is instead an unavailable index.

### Proposed confidence dimensions for a future release

Each index result can receive documented sub-scores for:

- **source authority:** primary official source versus secondary or contextual source;
- **definition clarity:** completeness and stability of indicator metadata;
- **coverage:** proportion of required components present and valid;
- **comparability:** alignment of geography, period, unit, denominator, and definition;
- **recency/revision status:** age, publication status, and known source revisions;
- **validation stability:** duplicate, range, discontinuity, and integrity checks.

### Confidence design remains future work

Any future diagnostic would need a documented rubric, review, and published reasons. No provisional 0–100 confidence arithmetic is part of the 2023 Civic Index.

Confidence should be published with a label such as high, medium, low, or unavailable only after thresholds and label definitions are approved. Confidence must not override a failed eligibility rule.

## 7. Comparability and revisions

A comparison is valid only when the observations share compatible:

- indicator definition, unit, and direction;
- kabupaten/kota type and boundary/reference version;
- period and temporal meaning;
- denominator and population basis;
- source quality and revision status.

Boundary changes, breaks in series, revised definitions, and non-equivalent reporting must produce a warning or block comparison. A revised source creates a new data release; historical results must not change invisibly.

## 8. Limitations

- Public data may omit lived experience, informal conditions, or unmeasured dimensions.
- Survey, administrative, and modeled sources may not be directly comparable.
- Regional averages can hide within-region inequality.
- A composite score depends on indicator selection, normalization, weights, reference set, and missingness rules.
- Rankings can exaggerate small differences and should not be treated as exact orderings without stability analysis.
- Data revisions and boundary changes can alter historical comparability.
- A pressure association does not establish cause or identify a policy solution.
- Coverage-based selection may underrepresent regions with weaker data systems.

## 9. Methodology governance

The 2023 release has a project-defined versioned method and traceable BPS inputs; it has not undergone external expert review or sensitivity analysis. Those reviews, named sign-off, and a revision policy are required before presenting a broader or official-grade release. Any change to definitions, normalization, reference set, weights, missingness, confidence, or geography treatment requires a new methodology version.

## 10. Decisions for broader releases

Coverage expansion, later years, revised sources or boundaries, confidence metrics, other indicators, and alternative weighting remain separate decisions. The approved project calculation and its current full-coverage rule are specified in §11.

## 11. Competition release decision — Jawa Barat 2023

**Scope:** the four approved 2023 indicator definitions apply to every fully verified Jawa Barat kabupaten/kota; the reference population for normalization remains **all 27 kabupaten/kota in Jawa Barat in 2023**, regardless of how many are published. All four indicators and their 27-region extrema come from the same revised BPS publication, *Provinsi Jawa Barat Dalam Angka 2024* (publication 32000.24001, released 28 February 2024, revised 29 February 2024). The source PDF was acquired locally as `data/raw/bps-jabar-dalam-angka-2024.pdf` (SHA-256 `500e82ecd02b081be83d884add8408fccc8fb1d57665f5b3e62a17ebc9f55f81`); its full text is not redistributed in the repository. The coverage expansion does not change this version's formula, direction rules, bounds, weights, or periods. This is a project-defined **relative pressure model**, not an official BPS index or a claim of causal relationships.

| Indicator (2023 observation) | BPS source table; period; unit | Higher raw value | Fixed 2023 all-Jawa-Barat reference minimum–maximum | Weight |
| --- | --- | --- | --- | ---: |
| Poor residents (%) | Table 4.6.2, printed p. 307 / PDF p. 383; Susenas poverty measurement, 2023 (March indicated in provincial companion table); percent of population | More pressure | 2.38 (Kota Depok) – 12.13 (Kabupaten Indramayu) | 25% |
| Open unemployment rate (TPT) | Table 3.2.16, printed p. 147 / PDF p. 223; August 2023 Sakernas; percent of labor force | More pressure | 1.52 (Kabupaten Pangandaran) – 10.52 (Kota Cimahi) | 25% |
| Human Development Index (IPM) | Table 4.6.5, printed p. 311 / PDF p. 387; 2023, LF SP2020 life-expectancy basis; index points, 0–100 | **Less** pressure | 68.18 (Kabupaten Cianjur) – 83.29 (Kota Bandung) | 25% |
| Households with improved sanitation access | Table 4.3.8, printed p. 261 / PDF p. 337; Susenas 2023; percent of households | **Less** pressure | 44.76 (Kota Sukabumi) – 98.52 (Kota Bekasi) | 25% |

For every eligible indicator, `position = (raw − reference minimum) / (reference maximum − reference minimum)`. Its pressure score is `100 × position` when higher means more pressure, or `100 × (1 − position)` when lower means more pressure. The 0–100 Civic Index is the equally weighted arithmetic mean of the four indicator scores; component contributions are `indicator score × 0.25`. Round indicator scores and the final index to two decimals. The reference endpoints are fixed to the cited 2023 provincial tables: selecting fewer display regions never refits them. Values outside those endpoints, wrong years or units, missing observations, unverifiable source artifacts, or missing required components **withhold the entire Civic Index**; there is no imputation or reweighting.

Interpretation bands, chosen for this release's relative 0–100 scale: **lower relative pressure** below 33.33, **moderate** from 33.33 through 66.66, **higher** from 66.67 upward. These bands are descriptive model categories, not policy thresholds, objective welfare levels, or fine-grained ranks. Poverty references 2023 Susenas (provincial companion table identifies March), TPT August, IPM calendar 2023, and sanitation Susenas 2023: source reference windows differ **within** a year; do not infer simultaneous conditions. Comparing observations from different **years** is not permitted by this release.
