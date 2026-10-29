# CIVX Jawa Barat 2023 — Deterministic Scoring Engine

**Status: implemented and exercised offline for all 27 regions, 18 frozen CORE indicators and six dimensions.** The scoring artifact is `SCORED_NOT_RELEASED`. This stage does not replace the current frontend release, authorize publication/deployment, or generate natural-language insights.

The [final indicator freeze](FINAL-INDICATOR-FREEZE-2023.md), [normalization design](NORMALIZATION-DESIGN-2023.md), and [weighting design](WEIGHTING-DESIGN-2023.md) remain unchanged. This is an implementation of their decisions, not a new methodology.

## 1. Inputs and authority

All inputs are repository files. Generation requires no network, live API, original-publication download, randomness, current timestamp, or LLM call.

| Authoritative processed input | Contract version | Pinned SHA-256 |
| --- | --- | --- |
| `data/processed/final-indicator-freeze-2023.json` | Freeze v1 | `8d72727f93c393a331582e83c8250d758abffca4fb2fc8920797b9ff3fe4d7ac` |
| `data/processed/normalization-design-2023.json` | Normalization design v1 | `1f6735060ee421b6e71212eec908d377a7928bc4e5c9999c3582267fecb374f4` |
| `data/processed/weighting-design-2023.json` | Weighting design v1 | `c8966d3a2fa4bc6721061e48995e05a4167de63f7cd77a6a8a3c524c36982131` |

The generator also pins all three authoritative methodology documents. It verifies the freeze's 24 evidence-file fingerprints, the prior stages' source manifests, and their three generator fingerprints. The output records 33 unique verified upstream files and the three scoring code fingerprints. Any source drift stops generation before output is written; an input correction requires explicit, versioned methodology review.

`data/raw/civx-jabar-2023.json`, already pinned by the freeze, supplies existing region type, province and boundary-reference metadata. BPS IDs remain `3201`–`3218` and `3271`–`3279`, distinguishing kabupaten from kota. The province aggregate is excluded. Source observation rows may omit a display name; identity uses their checked BPS ID and the frozen registry name. No observation is filled or repaired.

Only `normalizedPressure.min_max` enters scoring. Other normalization panels and alternative weighting schemes remain diagnostics. The scorer independently recomputes each selected pressure value from the frozen raw observation and locked anchors, then checks it against the existing selected panel. It never refits on a subset or inverts pressure-oriented values twice.

## 2. Code boundaries and API

| File | Responsibility |
| --- | --- |
| `src/lib/civx/model-2023.ts` | Strict types, frozen membership/direction contract, physical bounds, model preparation, normalization, model/weight validation |
| `src/lib/civx/scoring-2023.ts` | Pure within-dimension and overall aggregation, regional/cohort validation, contribution facts |
| `scripts/generate-civx-scores-2023.mjs` | Offline fingerprint verification, generation, cohort-wide numerical validation and byte-for-byte replay |
| `data/processed/civx-scores-2023.json` | Complete generated dataset; never edit manually |
| `tests/scoring-2023.test.mjs` | Automated consumer-visible arithmetic, boundary, rejection, determinism and explainability tests |

Public calculation API:

- `prepareModel2023(frozen, normalized, weighting)` returns a validated `model` and all regional inputs.
- `assertModel2023(model)` checks the fixed model, anchors, directions, membership and approved budgets.
- `normalizePressure2023(rawValue, indicator)` applies the approved directional transformation with explicit failure rules.
- `aggregateNormalized2023(indicators, model)` aggregates a complete 18-indicator pressure vector.
- `scoreRegion2023(input, model)` validates and scores one identified region.
- `scoreCohort2023(inputs, model)` requires all 27 unique regions and returns frozen registry order.

The model ID is `civx-jabar-2023-frozen-pressure`, model version `1`. Calculation code contains no file reads, frontend imports or source acquisitions. File authenticity belongs to the generator; pure APIs enforce mathematical/structural consistency. The model's small `calibrationEvidence` records validated extrema and pointers, not a duplicate raw observation panel or an authenticity signature.

The existing production scorers have different contracts and published rounding. They remain untouched rather than being reused with incompatible rounding or source semantics. Native Node TypeScript imports use `.ts`; `allowImportingTsExtensions` is enabled with `strict: true` and `noEmit: true` preserved. No dependency was added.

## 3. Unchanged normalization contract

For raw observation `x`, frozen cohort minimum `a`, and maximum `b`:

```text
higher_raw_higher_pressure: z = 100 * ((x - a) / (b - a))
higher_raw_lower_pressure:  z = 100 * ((b - x) / (b - a))
```

Division precedes multiplication, matching the selected panel's numerical convention. All 18 indicators share **higher normalized value = higher relative civic pressure**.

- Anchors come from the entire frozen 27-region 2023 cohort and must match the normalization artifact.
- Equal raw values receive equal pressure values; distinct values retain their pressure ordering.
- No clipping, winsorization, extrapolation, rounding, imputation, year substitution or silent recalibration occurs.
- Missing, non-numeric, non-finite, out-of-bounds and outside-calibration observations fail the whole run.
- Constant series fail with `CONSTANT_SERIES`; outside anchors fail with `OUTSIDE_CALIBRATION_RANGE`.
- Percentages and IKLH require physical bounds `[0,100]`; Gini `[0,1]`; remaining inputs are nonnegative with no invented upper bound.
- Overall IRBI and district IKLH remain published raw composites. IKLH pressure is **not** simply `100 - IKLH`.

For each indicator, **0 and 100 represent its lower- and higher-pressure observed positions within the frozen Jawa Barat 2023 cohort, not theoretical real-world bounds**. Zero does not mean no pressure. A value of 50 is halfway between the indicator's raw cohort endpoints, not a policy threshold, probability or cohort median.

## 4. Unchanged weighting and aggregation

For indicator `j` within dimension `d`:

```text
alpha_jd = 1 / n_d
W_d = 1 / 6
D_rd = sum_j(z_rj * alpha_jd)
CIVX_r = sum_d(D_rd * W_d)
effective_weight_j = alpha_jd * W_d
```

| Dimension | Frozen indicators | Dimension weight | Within-indicator weight | Effective indicator weight |
| --- | ---: | --- | --- | --- |
| Socioeconomic | 4 | 1/6 | 1/4 | 1/24 |
| Education | 3 | 1/6 | 1/3 | 1/18 |
| Basic Services | 5 | 1/6 | 1/5 | 1/30 |
| Public Health | 4 | 1/6 | 1/4 | 1/24 |
| Disaster Pressure | 1 | 1/6 | 1 | 1/6 |
| Environmental Quality Pressure | 1 | 1/6 | 1 | 1/6 |

The singleton scores equal normalized IRBI and IKLH respectively. All weights are positive. Holding other inputs fixed, increasing any normalized indicator raises overall pressure by its effective coefficient. Indicator count never increases a dimension's budget. The engine rejects alternative weights even when they still sum to one; it does not silently renormalize a bad plan.

Aggregation is compensatory: lower pressure in one input can offset higher pressure elsewhere. The engine does not add population weights, interactions, publisher-composite coefficients, context, traffic, or regional adjustments. Dimension and overall scores are convex combinations on the approved 0–100 scale. There is **no second min-max transformation of the overall score**, so actual regional totals need not reach 0 or 100.

## 5. Generated records and traceability

Each regional record contains:

- `regionId`, `regionName`, `referenceYear`, `province`, `type`, `boundaryReference`, and a registry pointer;
- `modelId`, `modelVersion`, and full-precision `overallPressureScore`;
- six dimension records with scores, weights, exact fractions and overall score-point contributions;
- 18 indicator records with unchanged raw values, normalized pressure, direction, unit, anchors, bounds, within/dimension/effective weights and exact fractions;
- frozen-indicator, frozen-value and selected-normalization JSON Pointers;
- indicator contribution to its dimension and to the overall score;
- deterministic structured `facts` for later insight processing.

The dataset's provenance declares the file in which each pointer resolves. Following the frozen indicator and observation pointers retains source publisher/artifact, audit receipt, definition, period, geography, unit, numerator/denominator, revision, uncertainty, missingness and interpretation limitations. Such metadata are not rewritten, dropped or treated as additional scoring multipliers. The output's evidence receipt verifies repository transcriptions and audit files; it does **not** claim new verification of unavailable original remote publication bytes.

Contribution fields distinguish score levels:

```text
indicator.contributionToDimension = normalizedPressure * withinDimensionWeight
indicator.contributionToOverall = normalizedPressure * effectiveWeight
dimension.contributionToOverall = dimensionScore * dimensionWeight
```

Contributions use score points. They are not percentages of people, independent information shares or causal effects.

## 6. Explainability, ordering and precision

No natural-language insight or regional rank is generated. Structured facts provide:

- `highestPressureDimensionIds`: all dimensions tied at the exact unrounded maximum;
- `lowestPressureDimensionIds`: all dimensions tied at the exact unrounded minimum;
- `indicatorIdsByDescendingPressure`: all 18 IDs sorted by unrounded normalized pressure, descending.

Dimension ties retain frozen dimension order. Equal indicator pressures retain frozen indicator order. Regional records always retain frozen BPS registry order, never pressure order. These orderings do not enter score calculations.

Calculations and JSON preserve full JavaScript IEEE-754 double precision. No intermediate or stored score rounding occurs. Later presentation may round for display only. Weight sums use `1e-12` tolerance; floating score identities and raw/normalized recomputation comparisons use `1e-10`. Normalized inputs must be strictly within `[0,100]`; aggregate checks permit only boundary roundoff within `1e-10`, without clipping. All actual generated scores are strictly within `[0,100]`.

Exact fractions accompany binary weights. The observed binary dimension-weight sum is `0.9999999999999999`, and the effective-weight sum is `0.9999999999999998`; every within-dimension sum is `1`. These satisfy the approved tolerance. No final share is changed to hide floating-point representation.

## 7. Offline reproduction

Use the repository's Node 26 runtime and installed existing dependencies. From the repository root:

```sh
npm run data:score:2023
npm run data:score:2023:check
npm test
npm run lint
npm run build
```

Equivalent direct generation/replay commands:

```sh
node scripts/generate-civx-scores-2023.mjs
node scripts/generate-civx-scores-2023.mjs --check
```

Paths resolve relative to the script, not the shell's working directory. `--check` computes the complete artifact and compares bytes without writing. Code fingerprints are deterministic provenance: a scoring-code edit requires regeneration and review even if numerical results do not change. No timestamp, absolute workspace path, random ID or machine-specific runtime version enters the dataset.

## 8. Exercised validation results

| Check | Observed result |
| --- | --- |
| Exact cohort / indicators / dimensions | 27 / 18 / 6 |
| Raw values verified unchanged | 486 |
| Selected min-max values verified unchanged | 486 |
| Dimension / overall scores | 162 / 27 |
| Missing, duplicate, unexpected or non-finite scored inputs | 0 |
| Selected normalization pairwise direction checks | 6,318 passed |
| Positive-effective-weight score-change probes | 486 passed |
| Dimension, within-dimension and effective weight sums | Passed approved tolerance |
| Complete selected-weighting diagnostic result comparison | All 27 totals and 162 dimension scores agree |
| Independent 50-digit Decimal arithmetic smoke | All 486 pressures, 162 dimensions, 27 totals, contributions, pointers and facts passed |
| Repeated CLI generation | Byte-identical output, including from an unrelated working directory |
| Drift/failure smoke | Unsupported flag, five upstream file drifts and generated-output drift rejected; prior output preserved |
| `npm test` | 77 passed, 0 failed; includes 36 new scoring tests |
| `npm run lint` | Passed, no warnings/errors |
| `npm run build` | Passed compilation, strict TypeScript and generation of 37 pages |

The new tests cover manual Bogor arithmetic for all 18 inputs, directional normalization, within/overall aggregation, singletons, endpoints/ranges, invalid values, missing/unknown/duplicate indicators, exact cohort processing, deterministic input permutations, immutability, methodology drift, provenance, contribution identities and exact/near ties. Synthetic vectors exist only in explicitly labelled tests and never enter the generated dataset.

Observed overall score minimum: **27.95580303802617**, Kota Depok (`3276`). Maximum: **63.56162926354473**, Kabupaten Sukabumi (`3202`). These describe the artifact's range, not a public ranking. The manually verified Kabupaten Bogor (`3201`) total is **54.65001885184166**.

## 9. Interpretation, limitations and frontend boundary

Higher CIVX means higher **relative civic pressure in this frozen cohort**; lower means lower relative pressure. The score is not an absolute quality-of-life measure, government-performance grade, probability, causal explanation, policy recommendation or longitudinal progress measure.

The normalization design's endpoint sensitivity remains, especially UHH, Puskesmas, TPT and morbidity. Equal normative budgets do not guarantee equal empirical influence: Education and IRBI contribute disproportionately to cohort dispersion. Accepted indicator overlap, survey precision, modeled estimates, administrative coverage, different reference windows and the publishers' composite limitations remain unchanged. No confidence interval propagation or statistical-significance claim is added.

`src/lib/civx/current.ts` still reads `data/processed/civx-jabar-2023-current.json` using existing `V2Release`/`V2Region` contracts. Home, Explore/map, regional records, Compare, Methodology and Sources consume that boundary. The new dataset deliberately does not satisfy or replace that older eight-input release contract. Later integration must explicitly adapt its typed read boundary, dimension/indicator rendering, provenance and methodology presentation. No current UI, route, scorer, current dataset or archived release was removed or changed here.

This implementation is ready for the next Insight Engine and frontend integration work. Independent model review, source/publication rights, effective-boundary review and release approval remain separate governance gates before public release. This stage performs no integration, deployment, source-year migration, contextual-data promotion or insight generation.
