# CIVX 2023 Product Integration Layer

## Purpose and architecture

`src/lib/civx/product-2023.ts` prepares typed, immutable product data for future Next.js consumers. It reads only the reviewed [repository](DATA-ACCESS-LAYER-2023.md) and [comparison engine](COMPARISON-ENGINE-2023.md). It does not import generated JSON, rescore observations, normalize values or regenerate insights.

The modules are deliberately small:

- `product-view-types-2023.ts`: readonly region, Explore, comparison, context, source and methodology contracts.
- `product-2023.ts`: CORE projection, compact disclosures, canonical Explore summaries and comparison composition.
- `product-context-2023.ts`: controlled context labels, grouping and explicit availability mapping.

The initial product-layer stage left existing domain modules, frozen artifacts, contextual audits, and frontend files unchanged. The subsequent Figma frontend integration below now replaces presentation consumers of `current.ts`; it does not alter source release statuses or `productionIntegrationAuthorized: false`.

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

No database/API is needed for this frozen local cohort. The freshness decision remains `KEEP_2023_AS_ONLY_FULL_MODEL`; no newer CORE year, trend, policy simulation, or what-if scoring is exposed. Frontend integration is now implemented as described below; public release remains a separate approval.

## Verification

```sh
node --test tests/product-2023.test.mjs
npm test
npm run lint
npm run build
```

Focused coverage includes all 27 region views, canonical Explore summaries, seven contextual datasets, source uncertainty/provenance, all 729 ordered comparison pairs, errors, deterministic highlights, side-by-side context restrictions, nested immutability and pinned score/insight fingerprints. Direct Node smoke exercises actual product retrieval and precision/missingness boundaries.

## Figma frontend integration

The six routes `/`, `/explore`, `/regions/[id]`, `/compare`, `/methodology`, and `/sources` now consume this reviewed product facade. The supplied Figma screens govern composition, typography, spacing, navigation, and the blue-purple/orange/lavender visual language, not numerical values or analytical claims.

- Home uses structural summaries and the existing 27-region SVG map instead of a province average or best/worst cards.
- Explore keeps canonical BPS order, name search, type filtering, and a neutral region table. Nine-row client-side pagination affects only the table; the map retains the complete filtered set. Search, type changes, and reset return to the first page. No score sorting or ranking is introduced.
- Region detail is a standalone page, replacing the old intercepted dialog. A small silhouette reuses the selected BPS-mapped SVG path and derives tight display bounds from its vertices. Six dimension bars replace the prototype trend. All 18 indicators expose raw values, units, normalized pressure, periods, and source/uncertainty disclosures. CORE insight titles and messages remain unchanged.
- Compare resolves URL selection without numerical logic, then delegates to the reviewed comparison API. It displays the engine's selected highlights, all six dimensions, and all 18 indicators. Same-region ties are valid; invalid, empty, and repeated parameters do not produce substituted results.
- Methodology shows direction-aware cohort min–max formulas and exact 1/6 dimension weights, with equal weights within each dimension. There are no policy categories, absolute endpoints, or comparable score histories.
- Sources groups the existing evidence into 18 CORE indicator records and seven CONTEXT dataset records. Client-side title/publisher/dimension search, CORE/CONTEXT scope, optional CORE-dimension selection, empty states, and reset browse server-rendered evidence cards. Scope changes clear dimension selection. Publisher URLs, locators, actual source periods, units, coverage, limitations, and uncertainty remain intact.

Shared context disclosures preserve `AVAILABLE`, `NOT_COVERED`, and `SITE_OBSERVATIONS_ONLY`. Available values and site observations appear first within their original groups. Missing datasets remain accessible under compact collapsed groups with their truthful reasons. Banjar's explicit zero stays visible, Cirebon/Subang gaps stay unavailable, commuting retains its five-region frame, and road/station observations retain their sites and actual dates. No context difference, aggregate, ranking, or winner is computed.

Map geometry remains the existing approximate 2020 geoBoundaries ADM2 subset, with BPS-code mapping and CC BY 3.0 IGO attribution. Uniform blue is not a score category; hover/focus changes indicate inspection only. Selectors and the full table provide non-map access. No dependency, credential, or external map service was added.

UI scores use one-decimal Indonesian formatting. Source values keep their original unit. Comparison differences use full-precision API values and are rounded independently for display; they are not recomputed from rounded scores.

Product pages prioritize definitions, source links, reference periods, units, limitations, and uncertainty. Internal artifact hashes/paths, release flags, authorization booleans, insight templates, and evidence pointers remain unchanged in the product records but are not rendered. Compare replaces raw JSON dumps with concise methodology links while preserving all reviewed differences and highlight selections.

### Bundler and audit boundaries

Next 16.4.2 Turbopack changes some imported JSON floating-point literals, including contextual coverage `3.7037037037037037` to `3.703703703703704`. The exact repository validator correctly rejects that mutation. `npm run dev` and `npm run build` now select webpack, preserving the reviewed numerical values without changing validation, scoring, or frozen artifacts. Native CSS modules/global tokens replace the unused Tailwind import and Turbopack-only stylesheet loader.

The historical freshness audit protocol includes the pre-integration frontend's file hashes. Its protocol, generator, and generated evidence remain unchanged; replaying that exact historical audit still requires its original presentation snapshot. CLI domain tests now create an isolated analytical fixture that omits superseded presentation-file locks. They retain pinned analytical inputs, offline reproducibility, no-write guarantees, drift rejection, source validation, and the common-year decision. No repository evidence is repinned for frontend convenience.

Frontend render tests cover canonical region identities, real detail/404 behavior, six dimensions, 18 indicators, reviewed comparison values and ties, and missing/zero/site-only context. Actual browser smoke covers navigation, search, filters, map access, disclosures, and responsive layouts. Formal accessibility certification and public model release remain separate gates.
