# CIVX Jawa Barat 2023 — Normalization Design

**Decision: select ordinary directional min-max normalization, separately anchored to each indicator's frozen 27-region 2023 cohort. Retain every observation; do not clip or winsorize.** The output convention is **0–100, higher = higher relative civic pressure**.

**Ready for weighting design, not production release.** No indicator, source year, raw observation, dimension membership, final weight, Civic Index, regional league table, frontend or production configuration changes in this task.

This recommendation is **not a certificate of uniform endpoint robustness**. UHH and Puskesmas are materially endpoint-sensitive; TPT and morbidity also exceed a 20-point disclosure flag. The choice preserves the audited magnitudes rather than replacing valid tails with ordinal gaps or arbitrary caps. These sensitivities must remain visible during weighting and joint validation.

## 1. Authority and fixed comparison cohort

The [final indicator freeze](FINAL-INDICATOR-FREEZE-2023.md) and `data/processed/final-indicator-freeze-2023.json` are authoritative. All **18 CORE indicators, six dimensions, 27 kabupaten/kota and 486 complete observations** are retained. No audit decision is reopened and no new indicator/source research is performed.

The analysis pins the frozen JSON's SHA-256:

```text
8d72727f93c393a331582e83c8250d758abffca4fb2fc8920797b9ff3fe4d7ac
```

It also verifies the freeze's **24 underlying evidence fingerprints**. Each analysis observation links to its exact frozen JSON Pointer; the frozen source then links to the original audit, artifact and observation receipt. The freeze document and JSON fingerprints are recorded in the output manifest.

The cohort is the same **18 kabupaten and nine kota**, in frozen BPS-ID order. It excludes the province aggregate. “2023” retains the audits' reference-vintage interpretations, including March/previous-month surveys, annual inventories, LFSP2020-based UHH and official IRBI/IKLH vintages. Nothing is replaced by 2024/2025 data.

## 2. Selected transformation and interpretation

For an indicator's unchanged raw value `x`, let `a = min(x)` and `b = max(x)` over **all 27 frozen regional observations**.

For `higher_raw_higher_pressure`:

```text
pressure = 100 × (x − a) / (b − a)
```

For `higher_raw_lower_pressure`:

```text
pressure = 100 × (b − x) / (b − a)
```

The implementation divides before multiplying by 100, preserving exact observed endpoints. It uses full stored precision and does not round before any subsequent methodology stage.

- **0** means the lower-pressure **observed endpoint for this indicator in this cohort**, not no environmental, social or health pressure.
- **100** means the higher-pressure **observed endpoint**, not the greatest physically possible pressure.
- **50** means halfway between those raw endpoints, not the median, a policy threshold or a 50% probability.
- Every selected indicator reaches 0 and 100. Equal raw values receive equal scores; all distinct values preserve their pressure ordering.
- The normalization is invariant to a positive affine change of measurement units. Units therefore cannot dominate a later aggregation simply through their numeric magnitude.
- Equal 0–100 ranges do **not** imply equal variance, substantive importance, uncertainty, or dimension weights.

Use the frozen `civxPressureDirection` directly. The eight higher-pressure-when-higher inputs are poverty, TPT, Gini, literal crowding, stunting, wasting, activity-limiting morbidity and overall IRBI. The other ten reverse direction. There is no sign inferred from a display label or correlation.

Treat **overall IRBI and district IKLH as published raw observations**. Do not decompose, reconstruct or population-divide them. In particular, IKLH pressure is cohort-normalized quality reversal, **not simply `100 − IKLH`**.

The calibration is cohort-specific. Scores are not externally benchmarked deprivation measures or automatically comparable longitudinal progress measures. Never silently refit on a subset, add regions, or reuse these anchors for another year.

## 3. Candidate methods evaluated

All five methods use all 486 frozen values. `s = +1` for higher-raw/higher-pressure and `s = −1` otherwise; `n = 27`. Quantiles use type-7 linear interpolation at zero-based position `(n − 1) × p`.

| Method | Exact candidate rule | Observed scale across all inputs | Decision |
| --- | --- | --- | --- |
| Directional min-max | Formulas in §2 | 0–100 | **SELECTED**: bounded, transparent and preserves within-indicator raw distance ratios |
| Directional z-score | `s × (x − mean) / populationSD` | −3.5598 to 3.0563 | Not selected: negative/unbounded SD units are less direct to explain as a pressure scale; no tail robustness gain |
| Percentile/midrank | Average one-based raw-value rank `r`; `100 × (r−1)/(n−1)` when higher is worse, otherwise `100 × (n−r)/(n−1)` | Within 0–100 | Not selected: preserves ordinal order but replaces meaningful magnitudes with rank spacing |
| Median/IQR | `s × (x − median) / (Q3−Q1)` | −3.7280 to 3.7739 | Not selected: robust center/scale, but unbounded output and unchanged affine distribution shape |
| Winsorized min-max | Clip a diagnostic copy to `[Q05,Q95]`, then apply directional min-max using those cutpoints | 0–100 | Not selected: changes 70 candidate values and creates 37 additional tied regional pairs without evidence of invalid source extremes |

Population SD uses divisor **27**, because this is the complete regional comparison cohort; sample SD with divisor 26 is additionally reported in JSON. Z-scoring itself does not require normally distributed raw observations. A Gaussian CDF mapping would add another transformation/assumption and is not used.

For percentile normalization, exact raw ties receive average ranks. Tied extrema can therefore lie inside 0/100 rather than at an endpoint. No jitter or artificial tie-breaking is introduced. Distinct singleton neighbors are separated by `100/26 ≈ 3.8462` percentile points regardless of their raw gap.

Z-score and median/IQR are positive affine transforms of pressure-oriented raw values. Their Pearson/Spearman correlations with min-max are effectively 1 for every indicator, with identical ordering. Applying a second min-max transformation to either would algebraically recover ordinary directional min-max; it would not make the result more robust.

The 5th/95th cutpoints are an **explicit diagnostic alternative, not an adopted outlier policy**. With 27 observations and ties, nominal 5%/95% cutpoints do not mean exactly 5% of observations change in each tail. Every altered diagnostic value and cutpoint is recorded separately; the raw-value field and selected min-max panel remain unchanged.

## 4. Actual frozen distributions

All rows have **n = 27**, zero unresolved missing values and positive SD/IQR. These are **unweighted distributions of regional point estimates**, not population-weighted provincial estimates or CIVX aggregation weights. SD below is population SD; skewness is the adjusted Fisher–Pearson coefficient. Quantiles and full-precision values are in JSON. Display rounding below does not feed calculations.

Raw units remain frozen: percentages for rates/shares; Gini coefficient 0–1; adjusted expenditure in thousand real PPP-adjusted rupiah/person/year; RLS/HLS/UHH in years; Puskesmas in main facilities/100,000 residents; IRBI/IKLH in publisher index points.

| Indicator | Min | Max | Mean | Median | SD | IQR | Skewness | Unique / 27 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Poverty | 2.38 | 12.13 | 8.1767 | 8.46 | 2.6253 | 3.715 | -0.3886 | 27 |
| TPT | 1.52 | 10.52 | 7.1859 | 7.65 | 1.9849 | 1.965 | -1.1099 | 26 |
| Expenditure Gini | 0.319 | 0.468 | 0.3804 | 0.369 | 0.0436 | 0.057 | 0.7107 | 26 |
| Adjusted expenditure | 8562 | 18236 | 11525.8148 | 11136 | 2323.7619 | 2568.5 | 1.3295 | 27 |
| RLS (25+) | 6.94 | 11.66 | 8.87 | 8.23 | 1.4291 | 2.105 | 0.7177 | 25 |
| HLS (age 7) | 11.91 | 14.29 | 12.8848 | 12.64 | 0.7491 | 1.21 | 0.5075 | 25 |
| Upper-secondary APM | 49.52 | 70.58 | 60.5881 | 60.62 | 5.5463 | 5.76 | -0.2906 | 27 |
| Improved sanitation | 44.76 | 98.52 | 75.0711 | 76.37 | 15.7125 | 28.66 | -0.2705 | 27 |
| Improved water source | 81.13 | 99.61 | 94.1322 | 95.84 | 5.437 | 6.23 | -1.0948 | 27 |
| Puskesmas/100,000 | 1.5753 | 6.4331 | 2.6404 | 2.387 | 1.0654 | 1.0853 | 2.0438 | 27 |
| Crowding ≤7.2 m²/person | 1.6 | 23.55 | 7.5622 | 6.36 | 5.2312 | 4.555 | 1.6165 | 27 |
| Any insurance | 45.39 | 92.24 | 69.2867 | 69.82 | 13.3246 | 20.1 | -0.0787 | 27 |
| SKI stunting | 10.3 | 29.2 | 21.5444 | 23.4 | 4.983 | 6.5 | -0.6883 | 26 |
| SKI wasting | 3.1 | 10.7 | 6.3259 | 6.2 | 2.0097 | 2.7 | 0.4691 | 23 |
| Activity-limiting morbidity | 6.75 | 19.84 | 12.1741 | 11.48 | 3.4045 | 5.725 | 0.2014 | 27 |
| UHH (LFSP2020) | 73.87 | 75.86 | 74.9315 | 74.89 | 0.3814 | 0.395 | 0.0894 | 24 |
| Overall IRBI | 63.49 | 185.14 | 123.16 | 120.84 | 28.8976 | 35.71 | 0.0267 | 27 |
| District IKLH | 44.65 | 71.11 | 58.9007 | 59.76 | 6.8941 | 7.87 | -0.3027 | 27 |

Seven indicators contain exact ties: TPT, Gini, RLS, HLS, stunting, wasting and UHH. JSON records every tied value and participating BPS ID. No value is rounded to create a tie. There are **no raw zeros**, no non-finite values and no violation of the documented physical/publisher bounds.

### Outlier evidence, not an error/deletion rule

Use strict Tukey fences `Q1 − 1.5×IQR`, `Q3 + 1.5×IQR`, and separately multiplier 3. These describe unusual values in this 27-region distribution; they are not evidence of miscoding, a hypothesis test, or a source-quality verdict.

| Indicator | Values outside 1.5-IQR fences; unchanged frozen BPS IDs | Outside 3-IQR fences |
| --- | --- | --- |
| TPT | 3207: 3.52; 3218: 1.52, both low | None |
| Adjusted expenditure | 3273: 18236; 3275: 16479, both high | None |
| Improved water source | 3205: 81.13, low | None |
| Puskesmas/100,000 | 3274: 6.433124744137084; 3279: 4.8190448653076965, high | 3274 |
| Crowding | 3204: 16.13; 3273: 23.55; 3277: 19.94, high | 3273 |
| UHH | 3206: 73.87, low; 3275: 75.86, high | None |

There are **12 flagged observations across six indicators**, including two severe-fence observations. All are retained. For example, Kota Cirebon's Puskesmas value remains the audited `22 / 341980 × 100000`, not an unexplained unit jump. Its interpretation remains local supply intensity, not proven patient access; the source's cross-border/catchment caveat is unchanged.

## 5. Sensitivity against actual regional observations

The analysis compares **all ten method pairs for every indicator: 180 Pearson/Spearman and ordering checks**. Scores in every panel remain aligned to the same 27-region order; no final Civic Index or regional ranking is calculated.

In the table:

- `r P` / `r W`: Pearson correlation of ordinary min-max with percentile / winsorized min-max.
- `Δ P` / `Δ W`: largest same-region absolute score difference from min-max, in 0–100 points. These compare different distance conventions, not an error against ground truth.
- `IQR span`: `100 × raw IQR / raw range`; how much of the min-max scale the central half occupies.
- `LOO Δ`: worst retained-observation score shift under an explicit leave-one-region-out **calibration diagnostic**. Each diagnostic fits 26 regions and evaluates only those retained 26. These counterfactuals never replace the selected 27-region cohort or its outputs.

| Indicator | r P | Δ P | r W | Δ W | IQR span | LOO Δ |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Poverty | 0.986941 | 19.3333 | 0.994030 | 16.4069 | 38.1026 | 16.2051 |
| TPT | 0.921235 | 35.6581 | 0.980123 | 22.2222 | 21.8333 | 22.2222 |
| Expenditure Gini | 0.965655 | 20.7796 | 0.999452 | 3.9691 | 38.255 | 2.6846 |
| Adjusted expenditure | 0.905130 | 43.7954 | 0.991562 | 18.4289 | 26.5505 | 18.1621 |
| RLS (25+) | 0.958803 | 23.5495 | 0.999108 | 6.4594 | 44.5975 | 5.9322 |
| HLS (age 7) | 0.976573 | 21.2993 | 0.999748 | 3.4228 | 50.8403 | 2.1008 |
| Upper-secondary APM | 0.966301 | 17.6638 | 0.999637 | 3.565 | 27.3504 | 1.8044 |
| Improved sanitation | 0.990875 | 14.901 | 0.996655 | 12.7986 | 53.311 | 12.221 |
| Improved water source | 0.923329 | 36.8673 | 0.996875 | 12.3077 | 33.7121 | 9.8485 |
| Puskesmas/100,000 | 0.850531 | 51.3443 | 0.962434 | 33.2266 | 22.3422 | 33.2266 |
| Crowding ≤7.2 m²/person | 0.883837 | 43.9583 | 0.990115 | 17.7822 | 20.7517 | 16.4465 |
| Any insurance | 0.991808 | 10.2931 | 0.998342 | 8.6534 | 42.9029 | 8.047 |
| SKI stunting | 0.963665 | 24.359 | 0.996051 | 8.8054 | 34.3915 | 8.4656 |
| SKI wasting | 0.979912 | 20.6478 | 0.995207 | 13.4906 | 35.5263 | 13.1579 |
| Activity-limiting morbidity | 0.984311 | 20.7263 | 0.984442 | 23.9354 | 43.7357 | 23.9114 |
| UHH (LFSP2020) | 0.913148 | 31.4167 | 0.924760 | 37.1859 | 19.8492 | 37.1859 |
| Overall IRBI | 0.971062 | 16.4782 | 0.995539 | 8.3235 | 29.3547 | 7.5134 |
| District IKLH | 0.977566 | 19.0244 | 0.998782 | 5.7451 | 29.743 | 4.384 |

### Ordering versus magnitude

Min-max, z-score, median/IQR and percentile preserve exactly the same within-indicator weak ordering, including original ties: Spearman is 1 throughout, with **zero pair reversals or additional ties**. That is a monotonicity property, not empirical proof that their distance conventions are interchangeable.

Winsorization also causes **zero reversals**, but creates **37 additional tied regional pairs** relative to min-max. Its minimum Spearman is 0.999083. A high correlation therefore does not mean no material change to values or tail distinctions.

Percentile replaces raw gap sizes. For Puskesmas, the gap between the two largest raw values is about 1.6141 facilities/100,000: **33.2266 min-max points but only 3.8462 percentile points**. A tiny gap between other singleton neighbors would receive the same percentile step. The greatest percentile/min-max disagreement is 51.3443 points for this indicator. Crowding and adjusted expenditure also have disagreements above 43 points. Rank scaling is not a neutral fix for skewness when the underlying audited measurements are quantitative.

No final aggregate ordering is compared: weights do not yet exist. Preserved within-indicator order does not guarantee identical future weighted Civic Index results. Method selection uses distribution, interpretability and magnitude preservation, not preferred regional winners.

### Endpoint stability: what is and is not defensible

The full table shows that ordinary min-max is **not uniformly robust to deleting a calibration endpoint**. Continuous diagnostics are retained for all 18 inputs. Round inspection cues—LOO shift above 20 points or IQR span below 20 points—are disclosure heuristics, **not a pass/fail validity threshold and not an instruction to clip**.

The most influential omissions are:

- UHH: Kabupaten Tasikmalaya (`3206`, 73.87), with 37.1859-point worst retained shift.
- Puskesmas: Kota Cirebon (`3274`, 6.433124744137084), with 33.2266-point shift.
- Morbidity: Kabupaten Ciamis (`3207`, 19.84), with 23.9114-point shift.
- TPT: Kabupaten Pangandaran (`3218`, 1.52), with 22.2222-point shift.

These are substantial calibration effects, not numerical errors. UHH has a **1.99-year raw range**; a 0.01-year difference maps to approximately 0.5025 points. No district CI in its source establishes that small differences are statistically meaningful. Its central IQR spans 19.8492 points. Puskesmas is positively skewed, and its large upper endpoint compresses the remaining cohort toward higher relative supply pressure.

Nevertheless, no panel's central half collapses to only a few points: IQR spans remain **19.8492–53.3110**. There is no audited evidence that the valid extremes should be discarded. Arbitrary 5th/95th caps materially alter these distributions, while percentile scaling discards their magnitude information. Z-score/median-IQR scaling alone does not remove a tail or supply a natural bounded pressure interpretation.

**Tradeoff accepted:** ordinary min-max preserves quantitative information and provides transparent fixed-cohort endpoints, while retaining material anchor sensitivity. Reproducibility of the pinned cohort does not remove measurement uncertainty. Do not describe the method as outlier-proof or use these results alone to certify final weighted-score stability.

## 6. Failure and outlier policy for the implementation contract

| Condition | Required behavior |
| --- | --- |
| Missing row/value, unresolved symbol or numeric string | Stop the entire run. Require the complete frozen cohort and explicit numeric observations; do not coerce symbols, zero-fill, interpolate, drop a region or implicitly redistribute weights |
| Non-finite value/statistic | Stop. Never serialize infinity/NaN as a legitimate score or manufacture a fallback |
| `min = max` | Stop with `CONSTANT_SERIES`; no 0, 50, artificial denominator or epsilon. Require explicit methodology review before any revised contract |
| Value outside physical/publisher bounds | Reject before normalization. Percentage inputs and IKLH require `[0,100]`; Gini requires `[0,1]`; remaining years, expenditure, supply and overall IRBI require nonnegative values, with no invented upper limit |
| Valid physical value outside locked calibration extrema | Stop with `OUTSIDE_CALIBRATION_RANGE`. Do not silently extrapolate, clamp or recalibrate. A correction, cohort/year change or anchor revision requires explicit versioned review |
| Statistical outlier inside valid bounds | Retain and flag; no selected clipping, winsorization, transformation or deletion. Inspect source meaning, not only statistical distance |
| Zero IQR or equal robust cutpoints in a future method comparison | Mark the robust alternative unavailable through an explicit failed comparison, not fabricated scores. This analyzer stops; min-max's own mathematical requirement remains a positive range |
| Unknown direction, changed input membership/year or pinned-source drift | Stop before writing outputs; require an explicitly reviewed input/design revision |

The current frozen 2023 data trigger none of the missing, constant, bounds or degenerate-scale failures. All percentile/midrank ties are intentional. Only the labelled winsorized **comparison copy** uses clipping; selected scores never do.

## 7. Weighting boundary and next-stage recommendation

Normalization operates on each indicator independently. It does **not** sum indicators, average dimensions, choose subdimension budgets, assign equal weights, or calculate a final Civic Index. No regional ranking or ranking optimization is performed.

Carry the freeze's constraint forward: **indicator count must not determine dimension importance**. Basic Services' five indicators and singleton Disaster Pressure/Environment dimensions receive neither automatic premiums nor penalties from this normalization. Preserve the audited hierarchy and accepted overlaps when designing budgets; min-max does not solve those decisions.

**Proceed to weighting design** using the selected 486 indicator pressure values, with these explicit constraints:

1. Choose dimension/subdimension/indicator budgets independently from indicator count; do not silently pool all 18 with equal coefficients.
2. Carry UHH/Puskesmas/TPT/morbidity endpoint sensitivity, quantitative-method sensitivity and the freeze's cross-domain overlap into subsequent weighting/joint-validation scenarios.
3. Preserve source survey uncertainty and interpretation limits. This task transforms point estimates only; no CI propagation, uncertainty elimination or significance claim is implied.
4. Keep production adoption and release approval separate. No normalization choice authorizes a scorer/frontend cutover, automatic yearly recalibration or a freshness migration.

## 8. Reproducibility, outputs and exercised validation

Created outputs:

- `data/processed/normalization-design-2023.json` — selected formula/policies, pinned input references, all 18 raw distribution diagnostics, all five candidate panels, tie/outlier receipts, all 180 method comparisons, 486 counterfactual calibration scenarios and validation metadata.
- `data/processed/normalization-design-2023.csv` — 486 observation rows in frozen indicator/region order, unchanged raw values and five clearly labelled candidate columns. Only `min_max` is selected. It is not a weighted-score/ranking file.
- `scripts/analyze-normalization-2023.mjs` — offline Node analysis, standard library only. It writes only the two design outputs, never imports a production scorer, and rejects a changed frozen input fingerprint.

```sh
node scripts/analyze-normalization-2023.mjs
node scripts/analyze-normalization-2023.mjs --check
```

`--check` reproduces JSON/CSV byte-for-byte, including source/generator fingerprints. The normalized observations retain exact frozen pointers; all computation uses the frozen full-precision numeric values.

Exercised validation:

- Actual CLI generation and deterministic replay passed for **18 indicators, six dimensions, 27 regions each and 486 unchanged raw values**.
- All **2,430 candidate values** are finite. The **1,458 values in the three bounded candidates** lie in `[0,100]`; selected min-max contributes 486 of these. Z-score and median/IQR are explicitly unbounded candidate scales, not failed 0–100 scores.
- An independent Python standard-library calculation matched every raw value/pointer, descriptive statistic, candidate value, 180 Pearson/Spearman comparisons, all 486 leave-one-out scenarios and all 486 CSV records.
- **31,590 pairwise pressure-direction checks** passed, including exact-tie handling and intentional winsorized flattening. No ordering reversal occurs.
- Eleven throwaway scenarios rejected before output: frozen-input drift; 17 indicators; a 2024 indicator year; a 26-region panel; missing value; non-finite numeric value; numeric string; percentage above 100; constant series; degenerate IQR/cutpoints; and a value outside locked calibration. Test-only fixtures permitted otherwise-blocked validation paths without altering repository inputs. Temporary workspaces were removed.
- `npm run lint` passed without warnings/errors. `npm run build` passed compilation, TypeScript and generation of **37 pages**.
- All **170 pre-existing tracked files** retain their pre-task SHA-256 fingerprints, including the frozen indicator contract, prior audits, raw observations, production scorer/configuration, frontend and dependency files.
- No application tests were rerun because no application contract or production path changed. The new offline CLI, mathematical outputs and explicit failure paths are the exercised changed surface. No permanent test, dependency or production integration was added.

**Final recommendation:** directional 27-region 2023 min-max, no clipping or imputation, fail on invalid/degenerate inputs, retain disclosed endpoint sensitivity, and proceed to explicit weighting design without changing the frozen indicator set.
