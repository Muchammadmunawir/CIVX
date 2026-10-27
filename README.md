# CIVX — Jawa Barat 2023

One Civic Index for **27 kabupaten/kota**, using **eight validated common core indicators across four pressure dimensions**. Every published region uses the same 2023 analytical contract. CIVX is a transparent project-defined relative-pressure model, not an official government ranking, causal assessment or comprehensive measure of regional worth.

## Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Before shipping:

```bash
npm run data:build
npm test
npm run lint
npm run build
```

Normal tests and web builds use committed processed data without downloading restricted publications. Data regeneration requires the fingerprint-matched original source artifacts. No dependencies were added for this cutover.

## One product, three evidence layers

- **Civic Index:** poverty, open unemployment, HDI, improved sanitation, improved drinking-water source, Puskesmas availability per 100,000 residents, published DBD incidence per 100,000 residents, and official BNPB disaster risk index.
- **Context Signals:** useful non-scoring evidence, including density, population, traffic, mobility, crime, roads and partial sector observations. Actual year, coverage and geography remain visible. Density is not an automatic penalty.
- **Regional Advantages:** verified positive capabilities. Whoosh in Bandung Barat, Kertajati in Majalengka and Cisumdawu in Sumedang retain dated evidence and assignment reasons. Missing optional evidence means **No comparable verified data**, never no advantage or zero.

Socioeconomic, Basic services, Public health and Resilience each receive 25%. Poverty/unemployment/HDI use 25/50/25 within Socioeconomic. Sanitation/water/Puskesmas share Basic services equally. DBD and disaster risk each represent their singleton dimension. Road condition fails network/denominator comparability and remains Context; no infrastructure score or map layer is fabricated. Full policy, source decisions and sensitivity: [current methodology](docs/METHODOLOGY-CURRENT.md).

## Routes and read boundary

- `/` — current release introduction, dynamic methodology facts and regional entry points.
- `/explore` — current Civic Index map/list, search/filter/sort, optional validated dimension layers and equivalent non-map access.
- `/regions/[id]` — Civic Index/category, dimensions, core observations, Context Signals, Regional Advantages and provenance. Opening from Explore uses the preserved contextual dialog; direct access stays standalone.
- `/compare` — two current regions, explicit score differences, dimension differences and raw/normalized/contribution differences. Unknown or identical selections are not silently substituted.
- `/methodology` — current definitions, weights, normalization, missing-data policy, sensitivity, limitations and internal release history.
- `/sources` — current source directory, observation locators, artifacts, provenance and candidate decisions.

There is no competing methodology-product switch. Internal version identifiers remain in release metadata, provenance and history, not product navigation.

`src/lib/civx/current.ts` validates and exposes `data/processed/civx-jabar-2023-current.json`. All production surfaces read this boundary. Counts, dimensions, indicator explanations and supported map layers derive from release configuration, not hardcoded React data. UI components never normalize or score observations.

## Data pipeline and rebuilding

**Raw source artifacts → validated observations → methodology → processed release → UI**

Current transcriptions/audits live in `data/raw/current/`; current methodology lives in `data/methodology/civx-jabar-2023-current.json`. The builder generates Puskesmas rates from raw facility totals and exact 2023 population, retaining numerator, denominator, formula and both source references. Published DBD incidence is not replaced with a case/population calculation. IRBI is modeled disaster risk, not observed disaster impact.

The ignored BPS artifact must be at `data/raw/bps-jabar-dalam-angka-2024.pdf` with SHA-256 `500e82ecd02b081be83d884add8408fccc8fb1d57665f5b3e62a17ebc9f55f81` (11,915,084 bytes). The source manifest links the original official download. Health-profile and IRBI originals are separately fingerprinted and are not redistributed. Strict data regeneration checks original bytes and never silently bypasses a missing or changed source.

```bash
npm run data:sensitivity
npm run data:build
```

If a restricted remote original is unavailable, explicitly replay the already-audited frozen transcriptions instead:

```bash
npm run data:sensitivity:replay
npm run data:replay
```

Replay verifies frozen source/policy hashes and all available local original artifacts. It is not a substitute claim of fresh original-byte verification. `CIVX_V2_HEALTH_PDF` and `CIVX_IRBI_PDF` may point to locally acquired originals outside the repository; supplied originals must pass the same size/SHA-256 checks. The processed release retains per-artifact verification receipts, visible on Sources.

For this release, BPS and IRBI originals and local capability snapshots were verified. The unavailable health-profile original uses its unchanged, previously audited transcription and source fingerprint. Strict `npm run data:build` did not complete because the health-source fetch timed out; explicit replay generated all 27 current scores successfully.

Sensitivity reports alternative budgets/allocations, regional score and order changes, correlations, category changes and limitations. Existing published output must reproduce exactly; changed observations or methods require a new release decision, not an invisible overwrite.

The original four-input release remains byte-identical under `data/releases/civx-v1-integrity.json`, including its raw data, policy, output and [historical methodology](docs/METHODOLOGY.md). The five-input release, its [methodology](docs/METHODOLOGY-V2.md), [source audit](docs/V2-SOURCE-AUDIT.md) and regeneration scripts also remain archived. These are reproducibility records, not alternative current products.

## Theme, map and interaction

Semantic tokens in `src/app/globals.css` define Light, Dark and System themes. Preference persists when storage permits and System follows OS changes. Theme, map, modal and motion behavior use existing dependencies only.

Explore retains the App Router parallel/intercepting region detail flow. Native dialog behavior preserves focus, Escape dismissal, scroll locking and Back/Forward context. Progressive disclosure keeps detailed sources and optional evidence below the primary score/dimensions. Reduced-motion preferences retain every action without travel.

The map uses separately licensed **approximate 2020 geoBoundaries ADM2 display geometry**, not certified 2023 boundaries or a scoring input. Its [CC BY 3.0 IGO](https://creativecommons.org/licenses/by/3.0/igo/) attribution, source fingerprint and adaptation are documented in [DATA.md §9](docs/DATA.md#9-geographic-display-geometry-separate-from-scoring). Regeneration remains `node scripts/build-jabar-map.mjs`; normal web builds use committed geometry without network access.

## Limits

Weight sensitivity can move fine regional ordering materially. Scores and categories are descriptive model outputs, not statistical significance or policy thresholds. Puskesmas availability does not measure travel, staffing or actual access. Published DBD denominator vintage cannot be reconciled with separate available case/population tables. IRBI uses older hazard/vulnerability baselines and updated capacity, not actual 2023 losses.

Independent source/method review, publication/reuse rights, certified effective-boundary compatibility, formal accessibility review, sampling uncertainty and optional evidence completeness remain unresolved. Whole source publications are not redistributed. Current implementation and exercised verification are recorded in [TASKS.md](docs/TASKS.md).

## Verification for the unified release

All **41 tests**, lint and the production build pass; the build generates 37 pages. Explicit audited-input replay produces 27 complete current scores and ten sensitivity scenarios. Strict source regeneration remains blocked by the unavailable health-profile original, not bypassed.

Managed Chromium verifies Home, Explore/map, regional detail, Compare, Methodology and Sources at 1440, 768, 390 and 320px in both themes: 48 combinations without document overflow or hydration errors. Interaction smoke covers layers, empty-result recovery, derived-source disclosure, the three retained advantages, comparison swap/rejection, source receipts and contextual dialog focus/history/reload. This is not formal accessibility certification.
