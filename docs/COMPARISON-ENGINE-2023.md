# CIVX 2023 Comparison Engine

## Purpose and architecture

`src/lib/civx/comparison-2023.ts` performs deterministic pairwise comparison of two regions from the frozen Jawa Barat 2023 cohort. It consumes `getRegionProfile2023()` from the reviewed [Data Access Layer](DATA-ACCESS-LAYER-2023.md), reading identity, CORE values and model metadata only. It never imports generated JSON directly or runs a normalization, weighting, scoring or insight engine.

`comparison-types-2023.ts` defines readonly difference, relation, overall, dimension, indicator, metadata and result contracts. The only new computation is subtraction, absolute difference, relation selection and ordering of pairwise gaps. Existing repository, artifacts, frontend and historical comparison UI remain unchanged.

No database, API route, standalone server, network call, dependency or frontend integration is introduced. This engine does not change release/publication authorization.

## Public API

```ts
import {
  compareRegions2023,
  CivxComparisonRegionNotFoundError2023,
} from "@/lib/civx/comparison-2023";

const comparison = compareRegions2023("3273", "3276");
```

Exported function:

```ts
compareRegions2023(
  regionAId: string,
  regionBId: string,
): CivxRegionComparison2023
```

The result contains:

- `referenceYear: 2023`, `scope: "CORE"`, and canonical `regionA`/`regionB` summaries.
- `overall`: exact repository `regionAScore` and `regionBScore`, signed `delta`, `absoluteDifference` and `relation`.
- `dimensions`: all six dimensions in repository order, with identity, both recorded scores and differences. Scores are not reconstructed from indicators.
- `indicators`: all 18 CORE indicators in repository order, preserving identity, dimension, unit, pressure direction, reference period, raw values, normalized pressures and both scoring pointers. There is no generic raw-value delta.
- `highlights`: three `largestDimensionDifferences` and five `largestNormalizedPressureDifferences`.
- `metadata`: model ID/version, cohort size, sign/metric/equality conventions, source interpretation and score artifact fingerprint. Indicator scoring pointers resolve in this score artifact; further evidence remains accessible through the repository.

No context, insights, new region rank or UI prose is generated in the result.

## Delta convention and relations

Every signed difference uses **A minus B**, without rounding or tolerance:

```text
overall delta   = overallScoreA - overallScoreB
dimension delta = dimensionScoreA - dimensionScoreB
indicator delta = normalizedPressureA - normalizedPressureB
absoluteDifference = Math.abs(delta)
```

| Delta | Relation | Meaning |
| --- | --- | --- |
| Positive | `A_HIGHER` | A has higher relative pressure on this component |
| Negative | `B_HIGHER` | B has higher relative pressure on this component |
| Zero | `EQUAL` | Equal recorded pressure value, not proven substantive equivalence |

Raw values retain their original unit and direction. For a `higher_raw_lower_pressure` indicator, a lower raw value can correspond to higher normalized pressure. The engine always compares the already-normalized pressures; it never reverses direction again.

## Highlights and interpretation

Highlights sort by absolute gap descending. Stable sorting preserves canonical dimension/indicator order for exact ties, including ties at the cutoff. The full collections remain in canonical order. Zero gaps are retained when needed, so same-region comparisons still return three and five deterministic highlights. Reversing A/B reverses signs and relations, not gap magnitudes or highlight order.

Indicator highlights identify **largest normalized-pressure differences within each indicator's frozen cohort scale**. Each indicator has its own normalization anchors. These gaps do not establish absolute substantive magnitude, causal importance, measurement certainty or policy priority. Indicator gaps are not weighted contributions and must not be added to reconstruct an overall difference.

CIVX describes relative pressure within the frozen 27-region Jawa Barat 2023 cohort. It does not measure psychological stress, happiness, government performance, safety, absolute wellbeing or causal effects. Zero does not mean no pressure; 100 does not mean a theoretical worst. Small recorded differences may reflect rounding or source uncertainty; `EQUAL` is an exact-data relation, not an uncertainty test.

## Errors, identity and immutability

Identical valid IDs are allowed. All 25 components have zero gaps and `EQUAL` relations; highlights use canonical order.

Unknown IDs throw `CivxComparisonRegionNotFoundError2023`, with `code: "REGION_NOT_FOUND"`, the original `regionId`, and `side: "A" | "B"`. A is resolved first; if both IDs are invalid, the error identifies A. Names, province `3200`, padded IDs and unsupported codes are not trimmed, guessed or substituted. No partial result is returned.

Results, nested rows, arrays, highlights and metadata are frozen. Shared identity/fingerprint records are already frozen by the repository. Each call returns equivalent immutable data without a mutable result cache. No clock, randomness, environment lookup, network or database state influences comparison.

## Excluded comparisons

CONTEXT has different periods, units, coverage and observational levels. Commuter share, terminal inventories, Podes occurrences, road sites and air stations therefore remain untouched and excluded from automatic differences. Missing context never becomes zero or affects CORE.

Only the explicitly supported 2023 boundary is available. The freshness decision remains `KEEP_2023_AS_ONLY_FULL_MODEL`; no year parameter, 2024/2025 model or trend logic exists. Pairwise highlights are not a ranking of the 27 regions.

## Verification

```sh
node --test tests/comparison-2023.test.mjs
npm test
npm run lint
npm run build
```

Focused tests exercise all 702 distinct ordered pairs plus 27 same-region pairs, exact arithmetic and source values, normalized direction, canonical ordering, highlights/ties, reverse symmetry, invalid IDs, determinism, immutability, CORE separation and frozen score/insight fingerprints. Direct Node smoke exercises a real pair, reversal, same-region equality and typed errors.
