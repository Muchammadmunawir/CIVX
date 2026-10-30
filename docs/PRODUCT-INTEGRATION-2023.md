# CIVX 2023 Product Integration Layer

## Purpose and architecture

`src/lib/civx/product-2023.ts` prepares typed, immutable product data for future Next.js consumers. It reads only the reviewed [repository](DATA-ACCESS-LAYER-2023.md) and [comparison engine](COMPARISON-ENGINE-2023.md). It does not import generated JSON, rescore observations, normalize values or regenerate insights.

The modules are deliberately small:

- `product-view-types-2023.ts`: readonly region, Explore, comparison, context, source and methodology contracts.
- `product-2023.ts`: CORE projection, compact disclosures, canonical Explore summaries and comparison composition.
- `product-context-2023.ts`: controlled context labels, grouping and explicit availability mapping.

All existing domain modules, frozen artifacts, contextual audits and frontend files remain unchanged. This stage prepares data; it does not replace `current.ts`, wire pages/components, authorize publication or redesign the frontend. Source release statuses and `productionIntegrationAuthorized: false` remain visible.

## Public API

Import values from `@/lib/civx/product-2023` and types from `@/lib/civx/product-view-types-2023`.

| Function | Result |
| --- | --- |
| `getRegionProductView2023(regionId: string)` | `CivxRegionProductView2023 \| undefined` |
| `getExploreRegionsProduct2023()` | `readonly CivxExploreRegionProduct2023[]` |
| `getComparisonProductView2023(regionAId: string, regionBId: string)` | `CivxComparisonProductView2023` |
| `getProductMethodology2023()` | Shared `CivxProductMethodology2023` for lightweight consumers |

```ts
const region = getRegionProductView2023("3273");
const explore = getExploreRegionsProduct2023();
const comparison = getComparisonProductView2023("3273", "3276");
const methodology = getProductMethodology2023();
```

All functions are synchronous and explicitly limited to the approved 2023 model.

## Region and Explore views

A regional view contains:

- `region`: compact `id`, `name`, `type`, `province` and `referenceYear` header. No population, coordinates or new administrative facts are inferred.
- `core`: `scope: "CORE"`, the exact overall score, six ordered dimensions, 18 ordered indicators and unchanged controlled Indonesian insight records.
- `context`: three explicitly non-scoring product sections, described below.
- `methodology`: compact, shared model/reference/source disclosure.

Dimensions expose their existing identity, display name and score. Indicators expose raw value, unit, normalized pressure, pressure direction, actual reference period and dimension identity/name. Nothing is rounded or recalculated.

Indicator `disclosure` normalizes definitions, numerator/denominator descriptions, compact source attribution, limitations and evidence pointers. Published row confidence intervals, standard errors, RSE flags and weighted nutrition denominators survive projection. Missing uncertainty stays null. Published weighted N never becomes unweighted sample size. Insurance ownership preserves its recorded complement standard error; the no-insurance RSE is not relabelled as ownership RSE. Puskesmas retains distinct facility and exact-person population sources.

Explore returns 27 identity/score summaries in canonical BPS order (`3201`–`3218`, then `3271`–`3279`). Each contains the overall score and six dimensions, not indicator details, insights, context or full methodology. Use `getProductMethodology2023()` once for page-level disclosure. There is no implicit score sort or regional rank.

## CORE versus CONTEXT

CORE determines CIVX scores. Every context section and item has `scope: "CONTEXT"` and `coreScoreAffected: false`. Product grouping is not a new scoring dimension.

| Section ID | Contents in order |
| --- | --- |
| `mobility_transport` | Selected road speed, selected road V/C, Type C terminal inventory, commuter share |
| `public_safety_context` | Podes village/kelurahan theft occurrence |
| `environmental_context` | Station overall ISPU, station PM2.5-component ISPU |

All seven items remain present for every region, including unavailable slots. Titles are small controlled product labels, not copied audit titles or generated narratives. Definitions, periods and caveats retain audited source text.

### Availability and missingness

`CivxContextProductItem2023` is a discriminated union:

| Availability | Regional scalar | Meaning |
| --- | --- | --- |
| `AVAILABLE` | Original number, including explicit `0` | Source-published regional value |
| `NOT_COVERED` | `null` | No verified usable observation for this item and region |
| `SITE_OBSERVATIONS_ONLY` | `null` | Read individual observations; no representative regional value exists |

`NOT_COVERED` does not always mean outside the publisher's geographic frame. Read `missingReason` and the dataset limitations: a missing terminal table cell differs from a region outside the commuter survey frame.

- Commuter share covers only `3201`, `3216`, `3271`, `3275`, `3276`; the other 22 remain unavailable/null. “Mobilitas Regional” describes routine cross-boundary commuting, not transit quality, congestion or an automatically favorable direction.
- Type C terminals remain inventory only. Cirebon `3209` and Subang `3213` are unavailable; Banjar `3279` retains available zero. No service quality, accessibility, passenger or frequency inference is made.
- Podes retains counts of desa/kelurahan where theft occurred and the year-before-May-2024 recall period. It is not incidents, police cases, victims, a crime rate or a safety rating.
- Bandung road values remain eight individual sites per metric, without a city mean, congestion score or rank.
- Air values remain station ISPU observations at their actual `2026-10-29 16:00:00` source-local time. Overall ISPU and its PM2.5 component remain separate dimensionless indices. No timezone, mass concentration, annual exposure or CIVX Environment score is invented.

### Context disclosure

Each item exposes title, scalar/observations, unit, period, availability, definition/denominator, coverage counts and compact sources. Observations retain site identity, actual period, original numeric/token values, source locator, limitations and evidence pointer. `sourceId` resolves in the item's source list.

Disclosure preserves audited limitations/biases, temporal warnings, usage/rights notes and raw/processed provenance pointers. Full source receipts, excerpts, HTTP captures and audit manifests are intentionally excluded. This keeps presentation data compact without hiding interpretation or attribution limits.

## Comparison product view

`getComparisonProductView2023()` delegates CORE calculation entirely to `compareRegions2023()`. Its `core` contains the engine's exact overall, six dimensions, 18 indicators, deterministic highlights and comparison metadata. No delta, relation or highlight is recalculated.

Controlled `presentation` labels explain A/B relations and normalized-pressure differences. The engine's A-minus-B convention remains unchanged. Indicator gaps describe separation within each indicator's cohort scale, not causal importance, substantive impact or policy priority.

`context.regionA` and `context.regionB` expose the corresponding regional sections side by side. `context.comparisonPermitted` is false. No context delta, winner/loser relation, ranking or missing-to-zero subtraction exists. Different periods, coverage and site-versus-region semantics remain visible.

## Methodology, errors and mutability

Shared methodology preserves model/version, reference year, cohort, geography, scale, interpretation, endpoint flags and compact artifact paths/fingerprints. Short controlled notes state that higher values mean higher relative pressure, zero is not absence of pressure, 100 is not theoretical maximum harm, and context does not affect CORE. No long methodology documents or full upstream manifests are embedded in each view.

Region lookup returns `undefined` for unknown IDs, names or padded codes, matching the repository. Comparison preserves `CivxComparisonRegionNotFoundError2023` and its original ID/failing side. Same-region comparison remains valid. Neither API trims, guesses or substitutes.

Region/Explore views are composed once and recursively frozen. Comparison composes frozen domain results and existing context sections. Readonly types and runtime freezing protect authoritative state; clone explicitly for editable working data. Outputs are deterministic, with no clock, randomness, environment lookup, network, LLM or runtime filesystem reads.

No database/API is needed for this frozen local cohort. The freshness decision remains `KEEP_2023_AS_ONLY_FULL_MODEL`; no newer CORE year, trend, policy simulation or what-if scoring is exposed. Future frontend integration is a separate reviewed stage.

## Verification

```sh
node --test tests/product-2023.test.mjs
npm test
npm run lint
npm run build
```

Focused coverage includes all 27 region views, canonical Explore summaries, seven contextual datasets, source uncertainty/provenance, all 729 ordered comparison pairs, errors, deterministic highlights, side-by-side context restrictions, nested immutability and pinned score/insight fingerprints. Direct Node smoke exercises actual product retrieval and precision/missingness boundaries.
