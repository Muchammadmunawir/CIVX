# CIVX — Jawa Barat 2023

CIVX describes **relative regional pressure** across **27 kabupaten/kota**, **18 CORE indicators**, and **six equally weighted dimensions**. A higher score means higher relative pressure within the fixed 2023 cohort, not better or worse regional quality, a causal explanation, or a policy priority.

The frontend follows six supplied Figma references while replacing their illustrative values and methodology with the reviewed product layer. Frontend integration does not authorize a public model release. The frozen `SCORED_NOT_RELEASED`, `INSIGHTS_NOT_RELEASED`, and production-authorization flags remain unchanged.

## Run locally

```sh
npm install
npm run dev
```

Open `http://localhost:3000`. Validate with:

```sh
npm test
npm run lint
npm run build
npm start
```

Development and production builds explicitly use webpack. Next 16.4.2 Turbopack reserializes some imported JSON numbers: for example, `3.7037037037037037` becomes `3.703703703703704`, failing exact contextual coverage validation. Webpack preserves the reviewed values. Validation and model data are not weakened or rewritten to accommodate the bundler.

No dependencies, credentials, external map services, database, or API server were added. Styling uses existing CSS modules and semantic global CSS tokens. The unused Tailwind import and Turbopack-only CSS rule were removed; installed packages remain unchanged. Poppins uses the existing `next/font` loader and is self-hosted after its build-time download.

## Routes

| Route | Behavior |
| --- | --- |
| `/` | Model coverage summaries (27 regions, six dimensions, 18 indicators, reference year 2023) and the unchanged overall CIVX pressure choropleth. No inverted quality index, policy status, or regional priority claim. |
| `/explore` | All 27 regions in canonical BPS order, name search, kabupaten/kota filter, overall CIVX plus six CORE map layers, and nine-row table pages. “Unduh CSV” exports all filtered identities and references, never unreleased values. `?q=` supports search-form navigation. |
| `/regions/[id]` | Standalone detail with score, silhouette, six dimensions, controlled insights, 18 indicator disclosures, and separate context. “Cetak / Simpan PDF” prints an A4 identity/reference report without unreleased values. Unknown IDs use Next's not-found boundary. |
| `/compare?a=3201&b=3273` | Existing team comparison selectors, regional summaries, four displayed aspects, and overall difference. Same-region selection remains valid; invalid selections show an error. **Known methodology risk:** the existing presentation still inverts pressure, computes a provincial mean, and assigns quality/priority badges. Phase 3 does not change this comparison implementation. |
| `/methodology` | Direction-aware min–max formulas, exact equal-dimension weights, equal weights within each dimension, source limitations, and model status. |
| `/sources` | Searchable evidence for all 18 CORE indicators and seven contextual datasets. Filter by CORE/CONTEXT and by CORE dimension; browse original publishers, links, periods, units, coverage, and limitations. |

Header search uses only the 27 known regions. Navigation, footer, active indicators, light/dark/system preference, disclosure controls, and responsive layouts share one application shell. Explore has no score sort, public regional ranking, status threshold, province average, year selector, or time-series chart.

## Product boundary

Every product surface uses `src/lib/civx/product-2023.ts`:

- `getExploreRegionsProduct2023()`
- `getRegionProductView2023(regionId)`
- `getComparisonProductView2023(regionAId, regionBId)`
- `getProductMethodology2023()`

React does not normalize, score, weight, regenerate insights, or calculate comparison differences. Display helpers round scores to one decimal in Indonesian number formatting while retaining full internal precision. Source values keep their units. Comparison deltas use the engine's unrounded A-minus-B values; independently rounded display numbers can differ slightly when subtracted.

The former `current.ts` product is no longer imported by frontend routes or components. Historical domain/data files and tests remain available; obsolete frontend consumers and intercepted region dialogs were removed. The current flow opens a full region page from both maps and lists.

See [product integration](docs/PRODUCT-INTEGRATION-2023.md), [data access](docs/DATA-ACCESS-LAYER-2023.md), [comparison](docs/COMPARISON-ENGINE-2023.md), and [frozen scoring](docs/SCORING-ENGINE-2023.md). Historical four/eight-input documentation and regeneration commands do not define the newly integrated frontend model. Do not regenerate historical releases to build the frontend.

## CORE and CONTEXT

The six CORE dimensions retain their repository display names: Socioeconomic, Education, Basic Services, Public Health, Disaster Pressure, and Environment. Each receives exactly 1/6 of the overall score. Indicators share their dimension's weight equally. Only the complete 2023 model is available.

CONTEXT is visually separate and never changes CIVX:

- Commuter shares cover five regions; other regions remain unavailable, not zero.
- Type C terminals preserve missing Cirebon/Subang observations and Banjar's explicit zero.
- Podes records villages/kelurahan with theft occurrence, not a crime rate or safety score.
- Bandung road observations retain individual sites, not a city average.
- ISPU and PM2.5-component ISPU retain station observations and their actual timestamp, not regional averages or annual exposure.

Expanded disclosures retain definitions, denominators, source limitations, uncertainty, and published source locators. Internal evidence pointers, artifact paths, hashes, raw release flags, and debug JSON remain in domain records and engineering documentation, not product pages. Weighted denominators are not unweighted sample sizes. Missing uncertainty is not evidence of certainty. Available regional values and site observations appear before compact, collapsed missing-source groups.

## Map and accessibility

The existing SVG implementation uses `data/geography/jabar-adm2-2020.json`, with its established BPS-code associations. Home and Explore default to **Skor Keseluruhan CIVX**, using unchanged full-precision overall pressure scores. Explore also offers all six CORE dimensions using their exact facade names. Both maps share a fixed 0–100 sequential scale, derived from the original CIVX indigo accent and adapted through semantic theme tokens. Higher pressure has stronger color intensity in both themes; filters never refit the scale. The legend identifies the fixed 27-region 2023 cohort, non-absolute endpoints, and non-official/non-policy interpretation. Hover/focus emphasizes boundaries without replacing score colors. Titles and the inspection panel expose the active layer and score; missing scores use hatching rather than zero, while excluded regions remain gray. Native links open detail. On Explore mobile, the regional selector and information panel precede the SVG in reading and visual order. Controls remain at least 44 px tall. Fill transitions take 300 ms and honor reduced motion.

Phase 3 reviewed Home's `100 − pressure`, provincial mean, 70/50 status thresholds, and best/priority labels. The reviewed model defines relative pressure, not an inverse quality index, population-weighted provincial measure, or automatic priority. Those unsupported summaries are replaced by model coverage facts; the map still uses unchanged full-precision pressure.

Geometry represents approximate **2020 geoBoundaries ADM2 boundaries**, not certified 2023 boundaries or a scoring input. Attribution: BPS, WFP, and OCHA ROAP via [geoBoundaries](https://www.geoboundaries.org/api/current/gbOpen/IDN/ADM2/), adapted under [CC BY 3.0 IGO](https://creativecommons.org/licenses/by/3.0/igo/). Provenance remains in [DATA.md §9](docs/DATA.md#9-geographic-display-geometry-separate-from-scoring).

Small screens collapse navigation, stack grids and comparison cards, and scroll tables within their own frame. Semantic headings, labels, native buttons/links/details, visible focus, skip navigation, Escape dismissal, and reduced-motion support remain available. Browser smoke is not formal accessibility certification.

Home and Explore use once-only 520 ms section entrances with 16 px travel and 70 ms stagger. Content stays readable without JavaScript or observer support; interactive targets remain opaque, and focus/pointer interaction cancels travel. Reduced motion removes all nonessential animation. The scoped theme menu uses opaque existing surface/text tokens, radio-menu semantics, arrows/Home/End, Enter/Space, Escape, Tab, and outside dismissal. Theme initialization, persistence, and System tracking remain unchanged.

## Limits and governance

Independent source/method review, source reuse rights, effective-boundary certification, formal accessibility review, and model release approval remain separate gates. Whole restricted publications are not redistributed. No deployment, new model year, trend, policy simulation, or context comparison is authorized by this integration. Verification evidence is recorded in [TASKS.md](docs/TASKS.md).

## CSV and printable reports

**Public numerical export is blocked by existing governance.** The model remains `SCORED_NOT_RELEASED`, insights remain `INSIGHTS_NOT_RELEASED`, and `productionIntegrationAuthorized` remains `false`. Existing frontend display is not redistribution approval. No public score/indicator/context export or numerical PDF is enabled.

Explore's **Unduh CSV** exports BPS code, name, region type, province, 2023 reference year, scope/restriction, identity attribution, interpretation, and absolute source/methodology/reporting links. Search and region type select the entire export; table pagination and map layer do not limit or change it. Empty results disable the action and explain why. A browser failure produces live feedback. Filenames identify CIVX, Jawa Barat, 2023, identity-only scope, and region count.

Files use comma-delimited RFC 4180 records, CRLF, and a UTF-8 BOM for spreadsheets. Quotes, commas, newlines, and Unicode remain intact. Formula-like text receives an apostrophe, including after leading whitespace/control/format characters. The serializer retains finite numeric precision and distinguishes zero from empty missing cells, but the permitted public schema contains **no score columns**. Withheld values are not silently presented as missing or zero.

Region detail's **Cetak / Simpan PDF** invokes the browser print dialog. Select A4 and a printer or Save as PDF; disable browser-generated headers/footers if unwanted. The report contains CIVX branding, regional identity, six dimension/indicator references, bibliographic source URLs and table locators (including numerator/denominator sources), model/version, and limitations. Navigation, controls, scores, observations, insights, and CONTEXT are excluded. Print styles apply only while an active regional report is present, including ordinary Ctrl/Cmd+P, and force readable black-on-white output regardless of theme. Reports retained under Next.js Activity's hidden ancestors do not change other routes' print styles.

User-facing rules live at `/methodology#ekspor-dan-laporan`; source metadata stays at `/sources`. Unrestricted numerical exports require a documented rights/release decision and a reviewed contract change, not a client flag or query parameter. No PDF library, dependency, deployment, or scoring change is introduced.

**Remaining comparison concern:** `src/components/compare/comparison-page.tsx` still contains `toIndex = 100 - pressure`, 70/50 status thresholds, best/priority labels, and an inverted provincial mean. Its references to “Skor dari Beranda” no longer describe the corrected Home. This inherited presentation needs a separate comparison cutover/review before submission; passing regression tests does not validate those methodological claims. The Phase 3 corrective request targets Home, and no comparison result or teammate implementation is silently rewritten.
