# CIVX Jawa Barat 2023 — Deterministic Insight Engine

## Purpose and scope

The engine turns the verified frozen scoring artifact into structured evidence and Indonesian regional explanations. It answers what stands out, what is relatively lower-pressure, which indicators explain model contributions, and how the same measure compares across the 27-region cohort. It does not change CIVX scoring.

**Insight language describes relative positions within the frozen Jawa Barat 2023 cohort and must not be interpreted as an absolute judgment, causal explanation, or policy recommendation.**

The [indicator freeze](FINAL-INDICATOR-FREEZE-2023.md), [normalization design](NORMALIZATION-DESIGN-2023.md), [weighting design](WEIGHTING-DESIGN-2023.md), and [scoring engine](SCORING-ENGINE-2023.md) remain authoritative and unchanged. The result is `INSIGHTS_NOT_RELEASED`: no public league table, frontend cutover, publication approval, or deployment is implied.

## Architecture

```text
civx-scores-2023.json (pinned, verified scoring records)
  → strict input/model/identity/contribution validation
  → overall, dimension and indicator cohort comparisons
  → deterministic evidence selection and prioritization
  → controlled Indonesian templates
  → civx-insights-2023.json (CORE only)
```

| File | Responsibility |
| --- | --- |
| `src/lib/civx/insight-input-2023.ts` | Typed scoring-artifact boundary and frozen-contract checks |
| `src/lib/civx/cohort-comparison-2023.ts` | Reusable midrank percentiles, medians, differences, counts and classifications |
| `src/lib/civx/insights-2023.ts` | Pure selection, evidence, prioritization and output contracts |
| `src/lib/civx/insight-templates-2023.ts` | Indonesian terminology and controlled rendering, separate from numerical analysis |
| `scripts/generate-civx-insights-2023.mjs` | Offline authenticity checks, output validation, generation and byte comparison |
| `data/processed/civx-insights-2023.json` | Generated regional insight dataset; never edit manually |
| `tests/*insight*2023.test.mjs`, `tests/cohort-comparison-2023.test.mjs` | Consumer-visible numerical, selection, evidence and failure behavior |

`generateInsights2023(input)` is a pure data-layer API. `compareCohort2023(values)` is independently reusable for later region details, Compare, and badges. The generic comparison helper preserves input order and accepts any nonempty finite numeric cohort; this engine separately requires the frozen 27 regions. Neither function performs network access, uses an AI API, uses randomness, or reads wall-clock time. No package was added.

## Input contract and score preservation

The generator consumes only `data/processed/civx-scores-2023.json`, pinned to SHA-256:

```text
47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5
```

Required identity: dataset `civx-jabar-2023-pressure-scores`, version `1`, status `SCORED_NOT_RELEASED`, year `2023`, model `civx-jabar-2023-frozen-pressure` version `1`, selected `min_max` normalization, and `equal_dimension_equal_indicator` weighting.

All 27 BPS regions must appear once in frozen order, each with exactly six dimensions and 18 indicators in frozen model order. The boundary checks identities, geography, metadata, bounds, pointers, finite numbers, recorded contribution identities, and structured scoring facts. Invalid, missing, duplicate or unknown records fail; there is no imputation, clipping, coercion, reweighting, or subset calibration.

Overall scores, dimension scores, raw observations, normalized pressure, weights and contribution fields are copied at full stored precision. The engine does not call a scorer to produce replacement scores or normalize raw observations again. Checking recorded contribution identities is validation, not a new score. Authenticity is the generator's pinned-input responsibility; the pure API checks structural and numerical consistency, not whether arbitrary coherent caller-supplied values are original source observations.

The generator retains the scoring-artifact receipt, verifies recorded upstream receipts, and records computation fingerprints. JSON Pointers in every regional comparison and insight resolve in the pinned scoring artifact. Indicator records retain `frozenIndicatorPointer`, `frozenValuePointer` and `normalizationValuePointer`. Follow the scoring artifact's provenance to frozen definitions, original observations, units, periods, denominators, revisions, missingness, uncertainty and source receipts. This offline stage does not newly acquire or certify remote publication bytes.

The existing eight-input production model, `current.ts`, frontend contracts and routes are intentionally unchanged. The new artifact must not be cast to `V2Release` or mixed with its pressure bands. Future frontend integration must explicitly adopt this typed 18-indicator boundary.

## Cohort-relative classifications

Compare each measure only with the same measure in the frozen cohort:

- overall CIVX against the 27 overall scores;
- each dimension against that dimension's 27 scores;
- each indicator against that indicator's 27 already-normalized pressure values.

For a value with `b` strictly lower values and `t` exact equal values, including itself:

```text
ascending midrank = b + (t + 1) / 2
percentile = 100 * (midrank - 1) / (n - 1)
```

The generic helper returns percentile `50` for a singleton. All-equal cohorts also return `50`. Ties use exact unrounded equality; no jitter, rounding, epsilon tie buckets or arbitrary tie-breaking occurs. A tied minimum or maximum can therefore lie inside 0 or 100. Percentiles are descriptive ordinal positions, not probabilities or confidence estimates.

The median is the middle sorted value for odd cohorts and the mean of the middle pair for even cohorts. `differenceFromMedian` uses original score points. `regionsBelow` and `regionsAbove` exclude ties; `tiedRegionCount` includes the region itself. Thus `regionsBelow + regionsAbove + tiedRegionCount = cohortSize`. For production, other-region comparisons concern **26 other regions within a 27-region cohort**, not 27 other regions.

| Percentile interval | Classification key | Indonesian overall wording |
| --- | --- | --- |
| `[0, 20)` | `relatively_low` | relatif rendah |
| `[20, 40)` | `lower_middle` | kelompok menengah bawah |
| `[40, 60)` | `middle` | di sekitar tengah kelompok pembanding |
| `[60, 80)` | `higher_middle` | kelompok menengah atas |
| `[80, 100]` | `relatively_high` | relatif tinggi |

Boundaries are left-inclusive; 20, 40, 60 and 80 enter the next interval. These are **percentile**, not raw-score boundaries. With only 27 observations and exact ties, quintile bands need not contain exactly 20% of regions. No score of 60 is inherently high in an absolute real-world sense.

These classifications do not replace min-max scoring, alter weights, establish policy thresholds, or provide a public league table. Regional output retains the frozen registry order.

## Dimension pressure detection

Selection uses full precision and three distinct pieces of evidence: score level within the regional profile, cohort position for the same dimension, and distance from that dimension's cohort median.

1. Calculate the median of the region's six dimension scores.
2. A main-pressure candidate requires percentile **at least 60**, score **at least five points above its own cohort median**, and score **at least the regional dimension median**.
3. Find the highest score among those qualified candidates. All qualified candidates within **five score points**, inclusive, form one co-leading group. The group gets one insight; all members remain in its evidence.
4. Optionally include one further qualified dimension in the **top quintile**, percentile at least 80, outside that leading cluster. Choose highest percentile; break an exact percentile tie by descending dimension score, then frozen order. This gets a second main-pressure insight.
5. Store the unrounded difference between the region's two highest dimension scores as `topDimensionGap`, even if neither qualifies for a pressure insight.

The numerical maximum alone is insufficient. A dimension can be high in score points but ordinary for that dimension's cohort. Close or exactly tied qualified dimensions share an explanation; the engine never claims one statistically dominant dimension. More than two co-leaders are retained together rather than silently discarded.

Five-point gaps are conservative, versioned **editorial salience rules**, not measurement-error bounds, significance tests or changes to methodology. They suppress small numerical differences without certifying the remaining differences as statistically significant. Threshold changes require an engine-version decision and artifact regeneration.

## Relative lower-pressure detection

A candidate requires all of:

- percentile **below 40** for its dimension;
- score **at least five points below its dimension's cohort median**;
- score **at least five points below the region's dimension median**.

Choose the lowest candidate score, then retain all qualifying candidates within five points of it as one lower-pressure insight. Members retain frozen dimension order. No candidate means no forced strength claim. The template explicitly states that lower pressure does not mean no problem.

## Standout indicators and contribution attribution

Indicators can explain selected main-pressure dimensions only. An indicator qualifies when its normalized-pressure percentile is **at least 80** and its recorded contribution to its dimension is **at least that dimension's score divided by its indicator count**. The latter requires at least an equal-share contribution in that regional dimension; it is not an independent importance or confidence weight.

For each selected non-singleton dimension:

1. Choose the qualified indicator with highest recorded `contributionToDimension`.
2. Retain every qualified indicator within **five normalized-pressure points** of that leader, inclusive, as one group.
3. Keep grouped indicators in frozen indicator order.
4. Prioritize at most two groups by their largest recorded `contributionToOverall`; exact ties retain frozen dimension order.

This distinguishes three concepts:

| Field | Meaning |
| --- | --- |
| `normalizedPressure` and its cohort percentile | Pressure-oriented indicator level and its position among the same indicator's 27 observations |
| `contributionToDimension` | Recorded score points contributed within that dimension |
| `contributionToOverall` | Recorded score points contributed to overall CIVX under the approved effective coefficient |

A high normalized percentile alone does not establish a leading contribution. Contributions are not percentages of residents, causal effects, information independence, sampling precision, or statistical certainty.

The equal-share contribution comparison permits `1e-10` score points of binary floating-point roundoff, matching scoring's contribution-identity tolerance. For example, `80 × (1/3)` is `26.666666666666664`, while an aggregated dimension score of `80` divided by `3` is `26.666666666666668`. This tolerance preserves mathematically equal contributors; it does not merge percentile ties, round stored scores, or provide a statistical uncertainty margin.

IRBI and IKLH each represent an entire singleton dimension and therefore have effective coefficient `1/6`. Their main-pressure insight includes the indicator evidence and explains the literal construct. They never receive a second standalone indicator paragraph that repeats the same result. Larger coefficients reflect the approved dimension budgets, not greater certainty or objective importance.

## Prioritization, evidence and localization

Ordered insight categories:

1. one `overall_profile` with overall cohort classification;
2. zero to two `main_pressure` groups;
3. zero or one `relative_strength` group;
4. zero to two `standout_indicator` groups.

Maximum six insights; fewer are intentional when no evidence satisfies the rules. Cohort comparison is embedded in each insight and the complete comparison metadata, not emitted as a redundant extra paragraph. All 18 indicator comparisons remain available without generating 18 narrative paragraphs.

Every insight contains a deterministic ID, region ID, `scope: CORE`, type, priority, descriptive severity, `templateKey`, title, message and evidence. Severity identifies relative descriptive attention, not danger or confidence. Evidence contains relevant original scores/contributions, comparison objects, dimension and indicator IDs, scoring JSON Pointers, and `comparisonTextKey`. No frontend needs to select pressures, compute percentiles or infer contributions.

Per-region output also includes identity/geography/year, exact overall score, `overallProfile`, six dimension comparisons, 18 indicator comparisons, selection diagnostics, model/version fields and the original scoring-record pointer. The artifact includes engine/version, locale, interpretation, analysis-policy and provenance metadata.

Indonesian dictionaries and `renderInsightIndonesian2023` are separate from selection. English can later render the same facts and template keys without changing comparisons, IDs, evidence or scoring. Controlled templates interpolate approved labels and classifications only; they do not accept free-form model-generated claims.

Allowed descriptions include relative pressure, dimensions that stand out, associated indicators, model-score contributions, and comparison within the frozen cohort. Prohibited claims include best/worst regions, safe/unsafe cities, successful/failed governments, individual stress or happiness, causal explanations, forecasts and policy recommendations. The engine never infers local access from Puskesmas supply, active benefits from insurance ownership, actual disaster losses from IRBI, or personal pollution exposure from IKLH.

## CORE versus future context

Only frozen CORE records enter this implementation. Traffic, congestion, crime, transport, detailed pollution and other contextual observations are not acquired, inferred, or inserted as placeholders. `scope: CORE` makes the present boundary explicit.

A future contextual engine may return separately identified, source-backed contextual insight records beside these CORE records. Such a stage needs approved data, geography, actual periods, coverage, definitions, provenance and templates. It must not mutate the CORE score or reuse a CORE indicator ID for unrelated contextual evidence. This task adds no empty contextual implementation or fake fallback.

## Reproduction and validation

Use installed repository dependencies and the existing Node runtime:

```sh
npm run data:insights:2023
npm run data:insights:2023:check
npm test
npm run lint
npm run build
```

The generator resolves paths relative to its own module. `--check` recomputes and compares the entire committed artifact byte-for-byte without writing. Unsupported flags and pinned input/output drift fail. No current timestamps, randomness, absolute workspace paths or machine-specific values enter serialized output. Numerical output remains full precision; display rounding belongs to later presentation.

Validation checks exactly 27/6/18 membership, all 27 overall and 162 dimension scores, all 486 raw/normalized indicator records and contribution metadata, 675 finite comparisons, valid evidence resolution, unique nonempty insight messages and IDs, bounded prioritization, repeatable bytes and unchanged source objects. Test-only synthetic cohorts cover ties, close dimensions, weak signals, contribution filtering, singleton diversity and rejection boundaries. They never enter generated production data.

### Exercised validation results

| Check | Observed result |
| --- | --- |
| Frozen regional records | 27, each with exactly six dimensions and 18 indicators |
| Exact original overall / dimension / indicator records | 27 / 162 / 486, with no score or contribution drift |
| Cohort comparisons | 675 finite positions, independently checked against below/equal counts and medians |
| Generated CORE insights | 112: 27 overall profiles, 35 main-pressure groups, 25 lower-pressure groups and 25 indicator groups |
| Insights per region | Three to six; seven regions have three because additional indicator or lower-pressure claims did not qualify |
| Repeated CLI generation and `--check` | Byte-identical artifact |
| Offline runtime smoke | Replay succeeded with Node network and child-process permissions denied, including invocation from an unrelated working directory |
| Invalid-input and drift behavior | Tests rejected pinned scoring/upstream/computation drift, copied-score drift, invalid evidence, unknown IDs, invalid percentiles, empty messages, mutation and nondeterminism |
| `npm test` | 185 passed, zero failed; includes 108 new insight/comparison tests and existing 77 tests |
| `npm run lint` | Passed without warnings or errors |
| `npm run build` | Passed compilation, strict TypeScript and generation of 37 pages |
| Original scoring artifact SHA-256 | Unchanged: `47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5` |

The synthetic exact-tie regression exposed a floating-point equal-share exclusion and now passes with the documented contribution tolerance. The production artifact remains based solely on original frozen scoring observations. The actual changed surface is the offline generation/read contract; no frontend surface changed, so no new browser verification is claimed.

### Manually verifiable region

Kabupaten Bogor (`3201`) retains overall score **54.65001885184166**. Sixteen regions have lower overall pressure, ten have higher pressure, and its tie count is one. Thus its overall percentile is `100 × 16 / 26 = 61.53846153846154`, in `higher_middle`.

Its Education score is independently checkable from frozen ratios:

```text
RLS pressure = 100 × 329 / 472
HLS pressure = 100 × 165 / 238
APM pressure = 100 × 2082 / 2106
Education = (RLS pressure + HLS pressure + APM pressure) / 3
APM contribution to Education = APM pressure / 3
APM contribution to CIVX = APM pressure / 18
```

Twenty-five regions have lower normalized APM pressure and one has higher pressure. This explains why APM can appear in the Education insight without any new raw observation, score or causal claim.

## Limitations and release boundary

Interpretation inherits all scoring limitations: endpoint sensitivity, accepted indicator overlap, compensatory aggregation, survey uncertainty, administrative coverage, modeled estimates, mixed reference windows, publisher-composite limitations and geography qualifications. Percentiles discard distance information; retain original score differences and medians beside them. Small-cohort positions can move with revisions. Exact numeric ties do not imply equal underlying conditions, and separate point estimates do not prove statistically different conditions.

No uncertainty interval propagation, policy threshold, individual psychological measurement, causal analysis, intervention recommendation or longitudinal comparison is added. The artifact is prepared for later contextual-data and frontend integration, not authorization to publish or deploy. Independent source/method review, publication rights, effective-boundary review and release approval remain separate governance gates.
