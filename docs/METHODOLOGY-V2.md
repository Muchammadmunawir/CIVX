# CIVX v2 methodology

**Archived methodology.** The current single-product contract is [METHODOLOGY-CURRENT.md](METHODOLOGY-CURRENT.md). This document records the historical five-input release for reproducibility; references below to separate products or default routes describe that archived state, not current navigation. It remains a project model without independent review or government endorsement. The original four-input contract remains in `METHODOLOGY.md`.

## Analytical contract

CIVX v2 separates three layers:

- **Core Pressure Score / Civic Index:** only comparable, complete, source-verified observations alter the score.
- **Context Signals:** observed conditions or explicitly unavailable evidence. These never alter pressure, including density, healthcare-facility availability and disease rates with unresolved denominators.
- **Regional Advantages:** positive capabilities verified by dated official evidence. These never reduce pressure or create a regional ranking.

Missing optional evidence is not zero, verified absence or a disadvantage. Advantage states are `verified_present`, `verified_absent`, `no_comparable_data`, and `not_applicable`. Only a verified positive with an assignment reason and provenance appears as an advantage. A verified absence also requires evidence; the release does not assume any absent capabilities.

## Source eligibility and scope

Reference cohort: all 27 BPS-coded Jawa Barat kabupaten/kota, year 2023, preserving the v1 administrative identifier/reference convention. Source windows within 2023 differ; this is not a same-month snapshot. The separately licensed approximate 2020 display geometry does not establish official 2023 boundary compatibility.

Five eligible inputs share the fingerprinted revised *Provinsi Jawa Barat Dalam Angka 2024* artifact. Source audit: `data/raw/v2/services-audit.json`. Detailed candidate and rights audits are kept separately from observations; discovery metadata is not proof of a regional value.

| Dimension | Indicator | Unit / denominator | Higher means | Fixed all-27 minimum–maximum |
| --- | --- | --- | --- | --- |
| Socioeconomic | Poverty | % of population, Susenas | More pressure | 2.38–12.13 |
| Socioeconomic | Open unemployment | % of labour force aged 15+, August Sakernas | More pressure | 1.52–10.52 |
| Socioeconomic | HDI / IPM | Index points, LF SP2020 basis | Less pressure | 68.18–83.29 |
| Basic services | Improved sanitation | % of households, Susenas | Less pressure | 44.76–98.52 |
| Basic services | Improved drinking-water source | % of households, Susenas | Less pressure | 81.13–99.61 |

Water is table 4.3.9, printed page 262 / PDF page 338. Improved source does not mean safely managed water, tested quality, continuous supply or affordability. Sanitation likewise does not establish safely managed sanitation. Exact definitions, survey timing, tables, row locators and denominator limitations remain attached to observations and the candidate audit.

No public-health, infrastructure or resilience dimension is scored in this release. Puskesmas counts/100,000 measure facility availability, not observed healthcare access. Published DBD rates cannot be reconciled with the available official case/population base. Road-network jurisdictions and lengths conflict. Disaster impact definitions, repeat-person counting and BPBD/BNPB totals do not reconcile. These gaps do not produce zero-valued dimensions or trigger per-region reweighting.

## Normalization and aggregation

The versioned policy fixes the reference set and endpoints before scoring. Display filters never refit them. For value x, bounds a and b, pressure is `100 * (x-a)/(b-a)` when higher means more pressure; otherwise `100 * (b-x)/(b-a)`. Out-of-range, nonfinite, missing, wrong-unit/year/geography or untraceable core observations withhold the whole score. No clipping, silent imputation, partial score or reweighting is permitted.

Dimension score is the weighted arithmetic mean of its normalized indicators. Overall pressure is the weighted arithmetic mean of dimension scores. Every dimension's weights sum to one; dimension weights also sum to one. Arithmetic uses full precision; published components, dimension scores, contributions and totals round to two decimals independently. Displayed rounded contributions can therefore differ from the rounded total by a centipoint. They are not used to recompute the total.

The finalized project v2 policy allocates 50% to socioeconomic and 50% to basic services, after the sensitivity review below. Within socioeconomic, poverty and HDI share a 50% deprivation allocation (25% each); unemployment receives 50%. Within basic services, sanitation and water receive 50% each. Effective overall weights are therefore 12.5%, 25%, 12.5%, 25%, 25% respectively. This is not five equal indicator weights and does not claim external expert approval.

The deprivation allocation caps poverty/HDI overlap rather than adding their importance independently. The existing 27-row data shows raw Pearson r = -0.776290 between poverty and HDI; reversing HDI's direction makes their pressure association positive. Correlation is descriptive, not causal, and does not establish redundancy. Both access measures remain inside one capped basic-services dimension. No PCA-learned weights are inferred from a small cohort.

## Sensitivity protocol and weight decision

Before generating the release, six alternatives were evaluated against the same 27-region cohort and fixed endpoints. Raw Pearson sanitation/water correlation is 0.404139; HDI/water is 0.613925. Poverty/HDI remains the strongest absolute pair at 0.776290. Dimension caps and the deprivation allocation limit duplicate emphasis; they do not statistically remove all shared information.

| Alternative to selected policy | Mean absolute score change | Maximum absolute change | Maximum order movement | Spearman | Pairwise order reversals | Category changes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Socioeconomic/basic services 60/40 | 2.96 | 6.69 | 8 | 0.943367 | 30 | 1 |
| Socioeconomic/basic services 40/60 | 2.96 | 6.70 | 5 | 0.982140 | 13 | 2 |
| Equal socioeconomic input weights, 50/50 dimensions | 2.58 | 6.37 | 5 | 0.956495 | 25 | 2 |
| Five equal indicators (not selected) | 3.72 | 10.51 | 7 | 0.931766 | 34 | 2 |
| Poverty-only deprivation allocation (omit HDI) | 1.95 | 5.30 | 5 | 0.968707 | 19 | 2 |
| HDI-only deprivation allocation (omit poverty) | 1.95 | 5.30 | 4 | 0.984583 | 15 | 0 |

Decision: retain 50/50 dimension budgets with the shared poverty/HDI deprivation allocation. The criterion is conceptual balance and bounded overlap, not producing a preferred regional order. Equal indicator weights would silently give the three-input dimension 60% of the index and give the correlated deprivation pair twice unemployment's budget. Alternative weights preserve broad association but shift scores and fine ordering materially. V2 therefore avoids emphasizing ranks or small differences. Descriptive bands use the v1 cutoffs (33.33 and 66.67); category changes above are sensitivity diagnostics, not clinical or policy thresholds.

`data/processed/civx-jabar-2023-v2-sensitivity.json` records every alternative's weights, per-region changes, full correlation matrix, tied-rank handling, source-data fingerprint and limitations. Reproduce with `node scripts/build-civic-v2.mjs --sensitivity`. Scores use full-precision arithmetic before two-decimal publication; sensitivity compares these released values and uses average ranks for ties. Leave-one-indicator-out scenarios are declared diagnostics, never production missing-data reweighting.

This descriptive sensitivity does not estimate sampling uncertainty, optimize weights, prove causality or validate additive compensation and min–max scaling. The [OECD/JRC composite indicator handbook](https://www.oecd.org/content/dam/oecd/en/publications/reports/2008/08/handbook-on-constructing-composite-indicators-methodology-and-user-guide_g1gh9301/9789264043466-en.pdf), sections 1.6–1.7, explains weighting, correlation/double-counting and robustness risks; it does not endorse CIVX or its chosen weights.

## Version isolation and provenance

V2 uses separate raw audit/observation files, methodology ID, release ID, processed output and typed contracts. V1 source manifests, raw transcription, normalization policy, processed scores, release IDs and methodology document remain byte-identical to `data/releases/civx-v1-integrity.json`.

Each v2 observation retains kind, release, region code, geography level and boundary reference, actual period (nullable only when unavailable), unit, denominator, coverage/comparability status, verification state, confidence assessment state, provenance locators and any derivation. Sources retain publisher, URL, reference year/window, artifact checksum, retrieval date and revision status. Derived ratios retain both numerator and denominator provenance. Unavailable optional records explicitly state why evidence is missing; they do not claim an observation occurred.

Official statements establish a capability at the stated date, not continuous service today, region-wide accessibility, service quality or province-wide completeness. No advantage count is added to or subtracted from pressure. Terminal passenger activity is not total public-transit use; rail, buses, terminals and airports are not merged into a fabricated mobility metric. Police jurisdictions cannot be silently relabelled as administrative regions. Historical Waze observations retain their actual period and coverage, never 2023 by substitution.

## Presentation and limitations

V1 remains the default Explore/Compare release. V2 has explicit versioned routes. Region detail presents Civic Index, pressure dimensions, context, then Regional Advantages, with evidence disclosed on demand. Unsupported dimensions say why they are unavailable. There is no v2 league table, medal, achievement score or government-endorsement claim.

The Explore layer contract can carry overall and individually validated pressure dimensions with release/reference/year metadata. It does not register unsupported dimensions, incomparable context or a density/mobility map merely because the type permits one. No new v2 map is published before data and geographic suitability are validated.

Unresolved: independent transcription/method review, BPS publication rights, Galura reuse permission, effective-boundary certification, uncertainty estimates, later-year comparability, source revision governance, incomplete optional capabilities, and several sector definitions. Five validated inputs do not constitute a comprehensive account of civic conditions.
