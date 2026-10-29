# CIVX Jawa Barat 2023 — Weighting Design

**Decision: select equal dimension weights, then equal indicator weights within each dimension.** Preserve the frozen 18 indicators, six dimensions, 27-region cohort and directional min-max normalization. No input or normalization decision changes.

> CIVX gives equal importance to its six dimensions, then distributes each dimension's weight equally among its audited indicators.

This is a **normative, transparent budgeting choice**, not a claim that importance can be uniquely estimated from 27 observations. The analysis supports implementation of this contract, while documenting meaningful sensitivity. All scores and positions below are **provisional methodology diagnostics, not the final CIVX ranking**. Production scoring/configuration and frontend remain unchanged.

## 1. Authority and unchanged inputs

Read the [final indicator freeze](FINAL-INDICATOR-FREEZE-2023.md) together with the [normalization design](NORMALIZATION-DESIGN-2023.md). Their machine-readable contracts are:

- `data/processed/final-indicator-freeze-2023.json` — the exact 18 IDs, six dimension assignments, raw observations, source interpretation and accepted overlap.
- `data/processed/normalization-design-2023.json` — the authoritative normalized panels. **Only `normalizedPressure.min_max` is consumed**; z-score, percentile and winsorized comparison columns are not scoring inputs.

The weighting analyzer pins both JSON fingerprints, verifies the freeze's 24 underlying evidence files and the normalization's source manifest, and records four source-document/data fingerprints. Every consumed observation links to its frozen raw-value pointer and normalized min-max pointer.

All **486 raw values and 486 selected normalized values** are unchanged. Every scenario uses exactly the same 18 CORE indicators and all 27 kabupaten/kota, in frozen registry order. The accepted 2023-compatible vintage is retained; no new data, indicators, denominators, normalization anchors or source years are introduced.

## 2. Aggregation contract

For region `r`, indicator `j` in dimension `d`, let:

- `z_rj` be the existing normalized pressure value in `[0,100]`.
- `alpha_jd` be the indicator's within-dimension weight.
- `W_d` be the dimension weight.

### Indicator → Dimension

```text
D_rd = Σ_j(alpha_jd × z_rj)
Σ_j(alpha_jd) = 1 within each dimension
```

For the selected method, `alpha_jd = 1/n_d`, where `n_d` is the frozen indicator count of that dimension. For Disaster Pressure and Environmental Quality Pressure, `n_d=1`, so the dimension score equals the unchanged normalized IRBI or IKLH value.

### Dimension → CIVX pressure

```text
S_r = Σ_d(W_d × D_rd)
Σ_d(W_d) = 1
W_d = 1/6 for every dimension
Effective indicator weight_j = W_d × alpha_jd
```

The arithmetic aggregation is compensatory: lower pressure in one input can offset higher pressure in another. There is no hidden veto, bottleneck rule, interaction term, population weighting or additional source-composite weight.

All weights are positive and all normalized inputs share the pressure convention. Therefore:

```text
∂S_r / ∂z_rj = W_d × alpha_jd > 0
```

Holding other values fixed, a higher normalized indicator always raises overall pressure. Each dimension and overall score is mathematically a convex combination on **0–100**. An all-zero input vector yields zero; an all-100 vector yields 100, subject only to binary floating-point precision.

Use full stored pressure precision and full-precision weights. Exact fractions accompany normative shares. Display percentages below are rounded, so displayed totals can differ slightly from 100%; **never feed rounded percentages back into computation or alter the last share to hide rounding**. Budget checks use `1e-12`; floating score-identity checks use `1e-10`. No pressure score is clipped or rounded before provisional ordering.

## 3. Exact selected budgets

### Dimension budgets: count imbalance versus selected model

| Dimension | Frozen indicator count | A: equal-indicator total | B: selected dimension total |
| --- | ---: | ---: | ---: |
| Socioeconomic | 4 | 22.2222% | 16.6667% |
| Education | 3 | 16.6667% | 16.6667% |
| Basic Services | 5 | 27.7778% | 16.6667% |
| Public Health | 4 | 22.2222% | 16.6667% |
| Disaster Pressure | 1 | 5.5556% | 16.6667% |
| Environmental Quality Pressure | 1 | 5.5556% | 16.6667% |

A gives every indicator `1/18`, implying `W_d=n_d/18`. Basic Services consequently receives **five times** either singleton's budget solely because it has five indicators. This violates the dimension-independence principle and makes A a benchmark, not an admissible selection. Its simple formula or high correlation with B cannot repair that conceptual defect.

### Effective indicator weights under B

Exact IDs and memberships are unchanged. Every listed indicator appears exactly once.

| Frozen indicator ID | Within its dimension | Effective overall weight: exact; displayed |
| --- | --- | --- |
| `poverty` | 1/4 | 1/24; 4.1667% |
| `unemployment` | 1/4 | 1/24; 4.1667% |
| `gini_ratio` | 1/4 | 1/24; 4.1667% |
| `expenditure_per_capita` | 1/4 | 1/24; 4.1667% |
| `rls` | 1/3 | 1/18; 5.5556% |
| `hls` | 1/3 | 1/18; 5.5556% |
| `apm` | 1/3 | 1/18; 5.5556% |
| `sanitation` | 1/5 | 1/30; 3.3333% |
| `drinking_water` | 1/5 | 1/30; 3.3333% |
| `puskesmas_per_100k` | 1/5 | 1/30; 3.3333% |
| `household-floor-per-capita-le7-2` | 1/5 | 1/30; 3.3333% |
| `health_insurance_ownership` | 1/5 | 1/30; 3.3333% |
| `nutrition_ski2023_stunting` | 1/4 | 1/24; 4.1667% |
| `nutrition_ski2023_wasting` | 1/4 | 1/24; 4.1667% |
| `morbidity_activity_limiting` | 1/4 | 1/24; 4.1667% |
| `life_expectancy_lfsp2020` | 1/4 | 1/24; 4.1667% |
| `irbi_overall_2023` | 1 | 1/6; 16.6667% |
| `iklh_2023` | 1 | 1/6; 16.6667% |

The higher coefficient of a singleton is its full **dimension budget**, not an assertion that its measurement is more precise or that it should receive a bonus. IRBI and IKLH remain publisher composites; no subcomponents are added or reconstructed.

### Explicit treatment of the audited hierarchy

The selected two-level rule preserves the audited groupings while making their implied budgets explicit:

| Audited branch | Share inside its dimension | Effective overall budget |
| --- | ---: | ---: |
| Basic Services: Water & Sanitation | 40% | 6.6667% |
| Basic Services: Healthcare Service Access & Capacity | 40% | 6.6667% |
| Basic Services: Housing Crowding | 20% | 3.3333% |
| Public Health: Nutrition | 50% | 8.3333% |
| Public Health: General Population Health | 50% | 8.3333% |

This deliberately selects **equal indicators, not equal Basic Services subdimensions**. Equal thirds for its three branches would raise the single crowding coefficient relative to each of the four paired-branch indicators. That alternative is tested below rather than introduced silently. Public Health's two two-indicator branches already receive equal budgets under B.

## 4. Candidate and sensitivity specification

The script declares six main/conceptual schemes and twelve budget perturbations before evaluating their regional results. No weights are fitted to obtain a preferred region, desired ranking or external target.

| Scheme | Dimension rule | Within-dimension rule | Decision |
| --- | --- | --- | --- |
| A: equal indicators | `n_d/18` | `1/n_d`; effective `1/18` for all | Reject for selection: dimension importance follows indicator count |
| B: equal dimensions, equal indicators | `1/6` | `1/n_d` | **SELECT**: transparent equal-importance assumption with a fixed domain budget |
| Variance within dimensions | `1/6` | `v_j / Σ_j(v_j)` inside each dimension; `v_j` is population variance of the existing normalized values | Diagnostic only: heterogeneous point estimates are not automatically more important or reliable |
| Equal Basic subdimensions | `1/6` | Basic WASH/healthcare/crowding each 1/3; each paired branch splits equally; all other weights match B | Diagnostic only: no supplied normative evidence establishes that one crowding measure should have twice each paired indicator's coefficient |
| Poverty/expenditure joint budget | `1/6` | Inside Socioeconomic: poverty and expenditure each 1/6; unemployment and Gini each 1/3 | Conservative overlap test, not a finding that the pair is duplicate |
| RLS/HLS joint budget | `1/6` | Inside Education: RLS and HLS each 1/4; APM 1/2 | Conservative overlap test, not a promotion/removal of indicators |

For each of the six dimensions, additionally change its budget **±25% relative to `1/6`**:

- Down: target `1/8 = 12.5%`; each other dimension `7/40 = 17.5%`.
- Up: target `5/24 ≈ 20.8333%`; each other dimension `19/120 ≈ 15.8333%`.

Within-dimension weights stay at B in these twelve scenarios. These are explicit methodological perturbations, **not estimated confidence bounds, a probability distribution or recommended unequal budgets**.

All 18 schemes retain all 18 positive-weight indicators. The JSON records every scheme's six dimension weights, 18 within/effective weights, exact fractions where applicable, and their validation. PCA/entropy are not separately evaluated: they are optional, and the variance alternative supplies a focused data-driven diagnostic without adding dependencies or treating statistical complexity as evidence of policy importance.

The variance alternative illustrates the risk of letting distributional spread set importance: Puskesmas falls from **20% to 13.4453%** inside Basic Services, UHH from **25% to 15.0664%** inside Public Health, while RLS/HLS together rise from **66.6667% to 73.3340%** of Education. Those changes follow min-max distribution shape, not established civic relevance or measurement reliability. They do not justify replacing B despite high score correlation.

## 5. Provisional sensitivity findings

All results in this section use the **unchanged normalized min-max values**. The analysis generates provisional dimension scores and overall scores only to compare weighting choices. No production index or public ranking is issued.

Rank convention: **1 = higher provisional pressure**, descending unrounded score, with average ranks for exact ties. Output rows retain registry order, not league-table order. Spearman is Pearson correlation of these midranks. Score and rank correlations describe this 27-region cohort, not statistical significance or a population sampling guarantee.

### Alternatives relative to selected B

| Alternative | Pearson of provisional scores | Spearman of provisional positions | Max position displacement | Max absolute score difference |
| --- | ---: | ---: | ---: | ---: |
| A: equal indicators | 0.921482 | 0.909646 | 9 | 8.8569 |
| Variance within dimensions | 0.997620 | 0.995116 | 2 | 1.5630 |
| Equal Basic subdimensions | 0.998070 | 0.995726 | 2 | 1.4055 |
| Poverty/expenditure budget | 0.994731 | 0.985958 | 3 | 2.2080 |
| RLS/HLS budget | 0.997064 | 0.992674 | 3 | 1.5337 |
| Socioeconomic −25% | 0.998436 | 0.996947 | 1 | 1.6933 |
| Socioeconomic +25% | 0.998264 | 0.995116 | 2 | 1.6933 |
| Education −25% | 0.996861 | 0.994505 | 2 | 1.7290 |
| Education +25% | 0.997639 | 0.996337 | 2 | 1.7290 |
| Basic Services −25% | 0.996845 | 0.992674 | 2 | 2.1674 |
| Basic Services +25% | 0.996835 | 0.996947 | 2 | 2.1674 |
| Public Health −25% | 0.997927 | 0.997558 | 1 | 1.2876 |
| Public Health +25% | 0.997884 | 0.993284 | 3 | 1.2876 |
| Disaster Pressure −25% | 0.995625 | 0.990842 | 2 | 1.9266 |
| Disaster Pressure +25% | 0.996354 | 0.989621 | 3 | 1.9266 |
| Environmental Quality Pressure −25% | 0.991836 | 0.990232 | 3 | 2.9328 |
| Environmental Quality Pressure +25% | 0.988575 | 0.971917 | 4 | 2.9328 |

The four within-dimension alternatives remain close to B, with maximum displacement of three positions. The ±25% dimension-budget tests reach four positions. This supports **broad pattern stability under the stated alternatives**, not exact-position robustness or proof that B is uniquely correct.

A versus B is materially different: **42 of 351 regional pairs reverse ordering**, and the largest displacement is nine places. The script also compares **all 153 pairs of schemes**, not only favorable comparisons with B: minimum Spearman is **0.833944**, and maximum pairwise displacement is **12**. That wider envelope includes the count-imbalanced benchmark and opposite methodological stress scenarios. It is not a confidence interval.

### Regions most affected by A versus B

This is a sensitivity illustration, **not a final regional ranking**. Positions below refer only to the two provisional methods, with higher pressure first.

| Region | A provisional position | B provisional position | Absolute displacement |
| --- | ---: | ---: | ---: |
| Kabupaten Karawang (`3215`) | 14 | 5 | 9 |
| Kabupaten Ciamis (`3207`) | 17 | 23 | 6 |
| Kabupaten Garut (`3205`) | 1 | 6 | 5 |
| Kabupaten Kuningan (`3208`) | 13 | 18 | 5 |
| Kabupaten Subang (`3213`) | 16 | 12 | 4 |

A and B use identical within-dimension means, so differences are exactly attributable to changed dimension budgets. For Karawang, **B minus A** contributions are approximately:

- Disaster Pressure **+8.1134** points and Environmental Quality Pressure **+8.2766**.
- Socioeconomic **−3.4202**, Basic Services **−4.1915**, Public Health **−1.9031**.
- Education **0**, because its dimension budget is `1/6` under both A and B.

These sum to **+6.8753** provisional overall points. The singleton domains' restored budgets explain the large movement; no raw value or normalization changed. For Garut, A's much larger Basic Services budget adds about **8.8736** points relative to B from that dimension alone. This is why indicator-count-driven budgeting is substantively consequential.

Across all eighteen scenarios, Karawang spans provisional positions **2–14**, Ciamis **17–25**, and Garut **1–8**. These are scenario ranges, not uncertainty probabilities or published CIVX positions. JSON records every region's range across the eighteen scenarios. For each pair of schemes, it also records the most affected regions with signed dimension attribution.

## 6. Overlap, influence and concentration

### Accepted conceptual overlap receives no correlation bonus

- **Socioeconomic:** poverty and adjusted expenditure retain distinct lower-tail/mean-resource estimands. Their pressure-oriented correlation is **+0.717711**; the freeze's negative raw correlation changes sign because expenditure reverses direction. B deliberately gives the pair **50% of Socioeconomic / 8.3333% overall**, not a data-driven correlation boost. Reducing the pair to one-third of its dimension changes positions by at most three.
- **Education:** RLS/HLS correlation is **0.820162**; RLS/APM **0.578418** and HLS/APM **0.524022**. B explicitly gives RLS/HLS **two-thirds of Education / 11.1111% overall**. Their distinct stock/expectation interpretations remain authoritative. Reducing their joint budget to one-half changes positions by at most three. No parent IPM is restored.
- **Basic Services:** five indicators share a capped one-sixth domain budget. WASH, insurance, supply and literal crowding remain distinct. Group allocations are explicit in §3 rather than silently treating five inputs as five dimensions.
- **Public Health:** the largest of six within-domain pressure correlations is morbidity/UHH **0.404047**; stunting/wasting is **0.121191**. Nutrition and general-population health receive 50% each. There is no evidence here of a near-identical health pair dominating through duplicated source measurements; modest correlation is not independence or a causal claim.
- **IRBI / IKLH:** their accepted conceptual contact remains disclosed, but neither parent is decomposed, stacked with components or reweighted by its publisher's internal coefficients.

All 25 within-dimension normalized-pressure correlations are recorded in JSON. The freeze's cross-domain overlap decisions remain in force; no indicator is removed or downweighted automatically because it correlates with another.

### Nominal budget is not observed variance contribution

Equal dimension budgets do **not** guarantee equal realized influence on regional score dispersion. For each component `C`, the diagnostic is:

```text
variance share = weight_C × Cov(C, S) / Var(S)
```

These shares sum to one but can be negative or greater than one. They include covariance/cancellation and are **not replacement weights, causal effects, independent information shares or reliability measures**.

| Dimension under selected B | SD of provisional dimension scores | Covariance allocation of overall score variance |
| --- | ---: | ---: |
| Socioeconomic | 11.2672 | 7.9409% |
| Education | 25.7233 | 40.4512% |
| Basic Services | 16.9636 | 16.4010% |
| Public Health | 14.2807 | 14.9579% |
| Disaster Pressure | 23.7547 | 31.9364% |
| Environmental Quality Pressure | 26.0549 | −11.6873% |

**Education and IRBI disproportionately account for observed dispersion relative to their nominal one-sixth budgets.** The largest single-indicator covariance allocation is IRBI, **31.9364%**; HLS and RLS contribute approximately **16.0479%** and **14.3536%**. This concentration is disclosed and tested, not hidden behind “equal weights”.

Environment offsets part of the cohort pattern: its pressure score correlates **−0.243756** with the provisional total. That does **not** make its weight negative, make higher environmental pressure beneficial, or justify deleting/reversing the domain. A one-point increase in its normalized pressure, holding other indicators fixed, still increases the total by exactly `1/6` mathematically. All implemented pressure-direction probes confirm the positive partial effects.

Do not fit weights merely to equalize these realized variance shares: that would make normative importance depend on this cohort's covariance and could suppress legitimate distinct constructs. The overlap/hierarchy tests and parent-budget perturbations show that B is usable, while leaving substantive uncertainty and positional sensitivity explicit.

## 7. Carrying normalization sensitivity forward

No normalization method or panel is recomputed. For each indicator, multiply its **already-recorded** worst leave-one-out normalization shift by its effective B coefficient. This is a single-indicator, other-inputs-fixed propagation bound, not a new normalized dataset, joint shock, confidence interval or guarantee of rank stability.

| Indicator | Existing worst indicator shift | Effective coefficient | Overall shift bound |
| --- | ---: | --- | ---: |
| UHH | 37.1859 | 1/24 | 1.5494 |
| Overall IRBI | 7.5134 | 1/6 | 1.2522 |
| Puskesmas availability | 33.2266 | 1/30 | 1.1076 |
| Activity-limiting morbidity | 23.9114 | 1/24 | 0.9963 |
| TPT | 22.2222 | 1/24 | 0.9259 |

The four flagged normalization inputs remain visible, and the singleton IRBI also warrants attention after coefficient scaling. JSON records this diagnostic for every indicator under every scheme. Existing survey CIs, modeled estimates, source limitations and uncertainty remain attached to upstream evidence; this task does not propagate CIs or certify statistically significant rankings.

## 8. Implementation constraints and interpretation

The next scoring engine must:

1. Consume exactly the frozen 18 IDs and selected min-max values, with all 27 regions and the accepted 2023 vintage. Do not invert already pressure-oriented values again.
2. Apply the selected full-precision `1/6` and `1/n_d` coefficients. Do not use equal global `1/18`, rounding, learned coefficients or publisher-composite internals as substitutes.
3. Reject missing/duplicate/extra inputs, changed year/method, source drift, non-numeric/non-finite/out-of-range pressure and invalid weight plans. Require all 18 positive effective weights.
4. Require dimension weights, each within-dimension set and overall effective weights to sum to one within the stated tolerance. Do not silently renormalize an invalid plan, drop a region, zero-fill or redistribute weights by missingness.
5. Keep the two-level aggregation and source traceability explicit. Treat hierarchy/overlap and sensitivity metadata as interpretation, not hidden extra multipliers.
6. Preserve the pressure direction and relative meaning. Do not present the total as absolute quality of life, government performance, causal effect, a policy target, probability, or percent of residents experiencing pressure.

Readiness permits implementation of this declared contract only. It does **not** authorize production replacement, frontend/ranking publication, deployment, a freshness migration, contextual indicators or an Insight Engine. Independent model validation, release/rights review and release approval remain separate. There is no fatal weighting-contract blocker, but the reported concentration and sensitivity must not be replaced by claims of precise or uniquely correct positions.

## 9. Reproduction and exercised validation

Created files:

- `data/processed/weighting-design-2023.json` — selected contract and source pointers; all six/18 budgets under every scheme; 486 provisional overall and 2,916 dimension scores; 153 pairwise comparisons and signed most-affected-region attribution; covariance, overlap and normalization-sensitivity diagnostics.
- `data/processed/weighting-sensitivity-2023.csv` — 486 region-by-scheme rows, each explicitly labelled `SENSITIVITY_ONLY_NOT_FINAL_RANKING`, with provisional scores/positions and dimension contributions.
- `scripts/analyze-weighting-2023.mjs` — deterministic offline Node analysis, standard library only; no production scorer imports or dependency additions.

```sh
node scripts/analyze-weighting-2023.mjs
node scripts/analyze-weighting-2023.mjs --check
```

`--check` compares both generated files byte-for-byte, including input/generator fingerprints. Changed pinned sources require an explicit reviewed revision, not silent replacement.

Exercised checks:

- Exact **six dimensions, 18 unique frozen indicators, 27 regions and 486 raw/normalized input matches**; no extra/missing indicator or region.
- **144 budget-sum checks**, 108 dimension-effective-budget checks and 324 positive effective coefficients across 18 schemes passed. Dimension shares collectively, each within-dimension set, and all effective shares sum to one within machine tolerance. Each dimension's effective-indicator subtotal matches its declared dimension budget.
- All **486 provisional overall scores and 2,916 dimension scores** are finite and within `[0,100]`. Hierarchical and direct-effective aggregation agree within `1e-10`.
- **8,748 one-point perturbation smoke checks** exercise the actual aggregation helper on copied vectors and confirm positive pressure response. Original inputs are unchanged. Two additional throwaway all-zero/all-100 scenarios verify the convex endpoint contract.
- An independent Python standard-library implementation matched all input values/pointers, 144 budget sums, all provisional scores/positions, 153 Pearson/Spearman comparisons, 53,703 regional-pair ordering checks, 432 component variance shares and all 486 CSV rows.
- Fourteen throwaway invalid scenarios rejected before output: pinned normalized-source drift; raw mismatch; incomplete cohort; missing/non-finite/out-of-range pressure; changed normalization/year; missing/extra weight ID; invalid dimension/within sums; zero and non-finite weights. Test-only fixtures reached otherwise-pinned validation paths without changing repository sources. Temporary workspaces were removed.
- `npm run lint` passed without warnings/errors. `npm run build` passed compilation, TypeScript and generation of **37 pages**.
- All **174 pre-existing tracked files** retain their pre-task SHA-256 fingerprints, including frozen/normalized inputs, raw evidence, prior audits, existing production scorers/configuration, frontend and dependency files.
- No application tests were rerun because no application contract or production path changed. The new CLI, numerical outputs and rejection paths are the exercised changed surface. No permanent test or scaffold was added.

**Final decision:** select B's equal-dimension/equal-within-dimension contract. No input, normalization or production cutover is part of this change. No blocking weighting inconsistency remains; sensitivity and empirical concentration are documented limitations, not hidden weight adjustments.

READY FOR SCORING ENGINE IMPLEMENTATION
