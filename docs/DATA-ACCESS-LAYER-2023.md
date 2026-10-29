# CIVX 2023 Data Access Layer

## Purpose

`src/lib/civx/repository-2023.ts` gives product/server-side code one typed read boundary for the frozen 27-region, 18-indicator, six-dimension model. It reads committed artifacts, not a database or network service. No database, API server/routes, authentication, cache service or dependencies are justified at this scale.

This is not a frontend cutover or release approval. `current.ts` and all frontend consumers remain unchanged. Source statuses remain `SCORED_NOT_RELEASED` and `INSIGHTS_NOT_RELEASED`; `productionIntegrationAuthorized` remains `false`. The freshness decision remains `KEEP_2023_AS_ONLY_FULL_MODEL`. Later-dated context is not a newer CORE model.

## Authority and modules

| Authoritative artifact | Responsibility |
| --- | --- |
| `data/raw/civx-jabar-2023.json` | Canonical BPS identity, region type, province and boundary reference; not the frozen model's observation panel |
| `data/processed/final-indicator-freeze-2023.json` | Definitions, actual periods, denominators, limitations, uncertainty, source records and audit provenance |
| `data/processed/civx-scores-2023.json` | Model, normalized pressures, weights, contributions, dimension and overall scores |
| `data/processed/civx-insights-2023.json` | Original CORE insight records, messages, evidence and recorded comparisons |
| `data/processed/contextual-data-catalog-2023.json` and seven `data/processed/context/*.json` files | Audited acceptance/order, prepared contextual records and source receipts |

Three modules implement the boundary:

- `product-types-2023.ts`: readonly product contracts, reusing existing domain types and retaining source-specific evidence fields.
- `repository-2023.ts`: CORE ingress validation, region indexing, immutable composition and public accessors.
- `repository-context-2023.ts`: internal contextual validation and regional slots, with shared dataset metadata rather than duplicated all-region panels.

Static JSON imports load once. Existing score validation checks membership and recorded arithmetic identities. Other checks validate registry joins, frozen observations, insight copies/pointers, contextual coverage, missingness and provenance. The layer never runs normalization, scoring, weighting, percentile calculation, insight selection or prose generation.

Runtime checks validate contract consistency, not original-publication authenticity. Tests pin original artifact bytes. Metadata preserves upstream manifests and evidence-verification limits.

```text
civx-scores-2023.json
47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5

civx-insights-2023.json
ffd92543c6387c981d2647c8ed55bd3abb7f7c4e9b5b91d4a74fab81999d6345
```

## Public API

Import values from `@/lib/civx/repository-2023` and types from `@/lib/civx/product-types-2023`. All functions are synchronous.

| Export | Return type |
| --- | --- |
| `getRegions2023()` | `readonly CivxRegionSummary2023[]` |
| `getRegion2023(regionId: string)` | `CivxRegionSummary2023 \| undefined` |
| `getRegionScore2023(regionId: string)` | `CivxScore2023 \| undefined` |
| `getRegionInsights2023(regionId: string)` | `readonly CivxInsight2023[] \| undefined` |
| `getRegionContext2023(regionId: string)` | `readonly CivxContextItem2023[] \| undefined` |
| `getRegionProfile2023(regionId: string)` | `CivxRegionProfile2023 \| undefined` |

```ts
const profile = getRegionProfile2023("3273");
if (profile !== undefined) {
  const score = profile.core.overallScore;
  const observations = profile.context;
}
```

`getRegions2023()` returns identity-only summaries, not detailed profiles or score ranks. Regions retain canonical BPS order: kabupaten `3201`–`3218`, then kota `3271`–`3279`. All dimension, indicator, insight and site-observation arrays retain source order.

All singular accessors return `undefined` for unknown IDs, province `3200`, names or whitespace-padded IDs. No trimming, coercion or fuzzy guessing occurs. Invalid artifact contracts fail during initialization with repository/validator errors, never substitute or partial results.

## Profile contract

- `region`: canonical identity, province/type/year and registry/boundary provenance.
- `core`: `scope: "CORE"`, `overallScore` copied exactly from `overallPressureScore`, six dimensions, 18 indicators and unchanged generated insights. No rounding, ranking or recalculation occurs.
- `context`: seven items, each with `scope: "CONTEXT"`, shared `dataset` metadata and one regional `record`. Context has no CORE pressure, weighting or contribution fields.
- `metadata`: year/cohort/model/version, interpretation, geography, source manifests, artifact fingerprints, reference/missingness policies and unchanged release authorization.

Each CORE indicator includes `evidence.indicator` (frozen metadata), `evidence.observation` (exact source record) and `evidence.scoringPointer`. Existing frozen pointers resolve against `metadata.provenance.freezePath`; normalization pointers resolve against `normalizationPath`. Frozen audit pointers and source locators preserve the remaining traceability chain. No missing metadata or confidence scores are invented.

CIVX measures relative pressure within the frozen 27-region 2023 cohort. Zero does not mean no pressure; 100 is not a theoretical worst. It is not psychological stress, citizen happiness or government performance. Actual source periods remain explicit, not assumed simultaneous.

## CONTEXT and missingness

Every region receives all seven accepted/partial datasets in catalog order; rejected candidates are excluded. Dataset coverage lists covered/missing IDs and distinguishes observations from regional scalar values.

| `record.valueStatus` | Regional `value` | Meaning |
| --- | --- | --- |
| `published_region_value` | Source number, including explicit `0` | One source-published regional value |
| `site_observations_only` | `null` | Read individual `observations`; no regional mean exists |
| `missing` | `null` | No verified usable observation; retain `missingReason` |

| Context | Preserved limit |
| --- | --- |
| Commuter share | Five regions: `3201`, `3216`, `3271`, `3275`, `3276`; other 22 remain missing/null. Routine cross-boundary commuting among residents aged 5+, not transport quality, congestion or transit use. |
| Type C terminals | Inventory only. Cirebon `3209` and Subang `3213` remain missing; Banjar `3279` retains zero. No access, quality, passenger or frequency inference. |
| Podes theft occurrence | Counts of desa/kelurahan where theft occurred, with year-before-May-2024 recall period. Not crimes, police cases, victims, rates or danger rankings. Dataset and observation geography descriptions remain distinct. |
| Bandung roads | Eight separate sites per speed and V/C metric from the 2024 report. No regional average or congestion score. |
| Station air | Overall ISPU and PM2.5-component ISPU remain distinct dimensionless indices, dated `2026-10-29 16:00:00` in source-local time. No invented timezone, mass concentration, annual exposure or Environment score. |

Source receipts, publication/access dates, observation periods, original tokens, site identities, locators, raw-audit pointers, rights notes and safe/unsafe-use caveats remain intact. Context never changes CORE scores, insights, weights or ordering. Current context comparisons/rankings remain disabled; paired metrics are not additive independent signals.

## Mutability, integration and versioning

Readonly types and one-time recursive freezing protect every exposed nested object/array. Accessors share immutable records without per-call deep copies or proxies. Clone explicitly for editable working data.

Calls use no clock, randomness, environment lookup, network or runtime filesystem reads. Prefer future server-side imports and send only needed fields to client components: this module eagerly loads the complete frozen model. This stage changes no page or route.

Explicit `2023` names let a separately reviewed future model coexist. No arbitrary-year accessor, fake 2024/2025 support, comparison engine, trends or policy simulations exist.

## Verification

```sh
node --test tests/repository-2023.test.mjs
npm test
npm run lint
npm run build
```

Focused tests cover canonical identity, exact CORE scores/insights, evidence, context separation/coverage/missingness, zeros, site/timestamp semantics, invalid IDs, determinism, nested mutation resistance and frozen fingerprints. Direct Node retrieval also exercises complete profiles for all 27 regions.
