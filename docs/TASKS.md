# CIVX Tasks

**Status:** One current CIVX — Jawa Barat 2023 product supersedes the separate methodology-product model. §18 records the current cutover; earlier milestones are historical.
**Learning rule:** Keep milestones small, reviewable, and ordered by dependency.

## 1. Foundation completed

- [x] Inspect the existing Next.js + TypeScript starter project.
- [x] Create the documentation set and establish project scope.
- [x] Define candidate data, provenance, geography, and quality rules.
- [x] Document the proposed index; the 2023 limited-release method was fixed later in `docs/METHODOLOGY.md`.
- [x] Document the Next.js/TypeScript and future Python responsibilities.
- [x] Add engineering constraints to `AGENTS.md`.

This foundation phase preceded the limited 2023 BPS release described below.

## 2. Priority order

Implementation should proceed in this order:

**Data → Scoring → Data Model → Basic UI → Map → Region Detail → Compare → Polish**

A later phase must not bypass the exit condition of an earlier phase.

## 3. Stage 1 — Data

Goal: prove that a small, honest dataset can be sourced and compared.

- [x] Select four indicator groups for a limited 2023 Jawa Barat release.
- [x] Inventory the BPS yearbook tables, periods, units, publication/revision metadata, and usage restrictions.
- [x] Identify and scope the two eligible BPS-coded regions; do not imply coverage of the remaining 25.
- [x] Acquire the original BPS PDF locally and record its immutable checksum; do not redistribute the book.
- [x] Record missingness and validation rules without filling gaps.
- [x] Document eligible 2023 regions and incomparable source windows.
**Deliverable:** a reviewed data-release candidate with raw/processed separation and no fabricated observations.

**Exit condition:** another person can identify the source and comparability basis for every included observation.

## 4. Stage 2 — Scoring

Goal: turn approved observations into inspectable components.

- [x] Define direction for each of the four 2023 indicators.
- [x] Fix min–max normalization and the all-27 provincial reference population for the limited release.
- [x] Define project release weights at 25% each; do not claim substantive parity.
- [x] Withhold incomplete or incomparable scores instead of producing partial results.
- [ ] Design an externally reviewed confidence rubric and labels for a future broader release; none are published now.
- [x] Generate traceable component contributions and release IDs; sensitivity analysis remains unreviewed.

**Deliverable:** a versioned scoring specification and reproducible output for the approved data release.

**Exit condition for this limited release:** each published score decomposes to raw observations, normalized components, weights, methodology version, source artifact, and explicit limitations. A numeric confidence diagnostic remains deferred.

## 5. Stage 3 — Data Model

Goal: establish stable contracts before building the application surface.

- [x] Define source, release, indicator, region, observation and decomposed Civic Index contracts.
- [ ] Define a reviewed confidence diagnostic and richer revision/warning records for a future release.
- [x] Use versioned files for the existing 2023 release; database choice remains a separate future decision.
- [x] Define the typed read contract consumed by Next.js.
- [x] Validate IDs, units, periods, region types, release versions and publication states in the existing pipeline.
- [x] Test missingness, source and period comparability, release references and comparison eligibility.
- [ ] Test source revision ingestion once a revision workflow exists.

**Deliverable:** documented canonical data model and sample contract based on approved data, not invented production statistics.

**Exit condition:** the web layer can consume one approved release without implementing scoring rules.

## 6. Stage 4 — Basic UI

Goal: provide the smallest useful read experience.

- [x] Create the app shell and accessible navigation.
- [x] Display release scope and methodology version; numeric confidence status is intentionally unpublished.
- [x] Display region overviews and explicitly withhold incomplete scores; no partial score is published.
- [x] Display indicator components with source links; separate dimension scores are not part of this method.
- [x] Show search-empty, loading, and incompatible-comparison states.
- [x] Keep data contracts and display components reusable and strictly typed.

**Deliverable:** a basic overview experience over a real approved release.

**Exit condition:** a user can inspect a result without confusing modeled values with observed values.

## 7. Stage 5 — Map

Goal: add geographic orientation without implying unsupported precision.

- [ ] Approve the geographic boundary crosswalk and effective-year fit for formal use. The displayed geoBoundaries ADM2 data represents 2020 and is CC BY 3.0 IGO; see `docs/DATA.md` §9.
- [x] Display only regions present in the selected 2023 release.
- [ ] Distinguish unavailable, non-comparable and low-confidence map regions when such records or diagnostics exist; none are published now.
- [x] Keep map and list on the same 2023 release; map search/category filters match the list, while sorting affects list order only.
- [x] Verify desktop/mobile map focus, hover and activation, category labels and full non-map access; tiny city shapes remain easier to select in the list.

**Deliverable:** a map view with provenance and accessible alternatives.

**Exit condition:** the map does not imply coverage or comparability where the release lacks it.

## 8. Stage 6 — Region Detail

Goal: explain one region over time and by component.

- [x] Show region identity, type, province, boundary/reference version, release context and modeled-relative position.
- [ ] Show indicator history only for comparable periods.
- [x] Show sourced raw observations, normalized scores, component contributions and publication revision context.
- [ ] Add confidence dimensions or comparable history only after separate approval; neither is published now.

**Deliverable:** a traceable region detail view.

**Exit condition:** a user can move from aggregate to raw source context and known limitations.

## 9. Stage 7 — Compare

Goal: support explicit, valid comparison.

- [x] Allow comparisons only across compatible published records, period, geography, source periods and methodology/reference set.
- [x] Show side-by-side raw observations, normalized scores and weighted contributions alongside the CIVX totals.
- [ ] Explain excluded indicators and non-comparable periods.
- [ ] Add sensitivity or stability context before emphasizing small differences.

**Deliverable:** a comparison flow that refuses or explains invalid comparisons.

**Exit condition:** comparisons cannot silently mix incompatible data.

## 10. Stage 8 — Polish

Goal: improve reliability and clarity after the analytical contract is stable.

- [x] Improve geographic/comparison hierarchy, keyboard access, responsive behavior and modeled-relative explanations; formal accessibility certification remains outside this milestone.
- [ ] Add release notes, revision history, and source attribution.
- [ ] Add performance improvements supported by measurement.
- [ ] Add monitoring and refresh workflows only after manual publication is reliable.
- [ ] Review privacy, licensing, security, and operational documentation.

**Deliverable:** a publishable first release with known limitations and reproducible artifacts.

## 11. Working rules

- Do not install packages without a written justification and approval.
- Do not create fake production data; synthetic fixtures must be clearly labeled and isolated.
- Do not implement dashboard UI before Data, Scoring, and Data Model exit conditions pass.
- Keep observed source values, processed values, derived scores, confidence, and interpretation distinct.
- Prefer the smallest change that advances the current stage.
- Update the relevant documentation when a decision changes scope, data, methodology, or architecture.

## 12. Unresolved decisions

- Geographic expansion beyond the 27 verified 2023 Jawa Barat kabupaten/kota; later-year and additional-indicator approvals.
- Future periods and reference populations after checking revised tables and boundaries.
- Alternative weighting or partial-coverage policies; the 2023 release fixes four equal weights and full coverage.
- Confidence rubric and labels.
- Raw/processed/release storage and Python execution boundary.
- Typed API/read contract and deployment target.
- Release ownership, review process, and refresh cadence.

## 13. Limited 2023 Civic Index competition milestone

- [x] Retire the density pilot from production pages and scoring.
- [x] Verify BPS Jawa Barat yearbook tables 4.6.2, 3.2.16, 4.6.5, and 4.3.8 for Kabupaten Bogor and Kabupaten Bandung (2023).
- [x] Fix 2023 reference extrema across all 27 provincial kabupaten/kota without publishing unreviewed regions as scored results.
- [x] Separate raw transcription, ignored copyrighted PDF, methodology policy, and processed versioned release.
- [x] Validate source fingerprint, per-indicator source, unit, period, missingness, range, and duplicate observations.
- [x] Normalize and direction-adjust four equal-weight indicators; withhold rather than reweight missing or incomparable data.
- [x] Expose Home → Explore → regional score/breakdown/interpretation → Methodology → Sources; refresh the UI with accessible search, score/name sort, evidence visualization, and same-release comparison without expanding the data release.
- [ ] Obtain independent source-transcription/methodology review and confirm publication/redistribution rights before a formal public release.
- [x] Review additional regions' complete 2023 indicator rows and match all 27 kabupaten/kota identities against the same four BPS tables before extending geographic claims.

At this earlier milestone, only two compatible regions were displayed. Geographic orientation and comparison arrived in §15; confidence scoring and additional periods remain deferred.

## 14. 2023 Jawa Barat regional coverage expansion

- [x] Verify four 2023 columns against the locally fingerprinted BPS PDF tables 4.6.2 (307/383), 3.2.16 (147/223), 4.6.5 (311/387), and 4.3.8 (261/337), separating identically named kabupaten and kota.
- [x] Attempt all 27 BPS-coded Jawa Barat regions; publish only 4/4-complete records and retain an exclusion summary. This dataset publishes 27; none excluded.
- [x] Reuse the exact fixed 2023 normalization bounds, original directions and weights, and existing scoring code without introducing a new method or source.
- [x] Give Explore compact release-wide search, sort, category, score, distribution, median and indicator previews; give region detail published-relative position, median comparison, component and source context.
- [x] Derive Home release facts and compact overview from the published release rather than a fixed two-record comparison.
- [ ] Obtain independent source-transcription/methodology review and confirm publication/redistribution rights before a formal external launch; no government endorsement is claimed.

Published-relative position and median describe the current CIVX model output, not an official BPS ranking; the 27-region normalization reference remains fixed regardless of display filtering.

## 15. Geographic exploration and comparison cutover

- [x] Render 27 named regions with a pinned, checksum-verified 2020-represented geoBoundaries ADM2 subset; source credit, CC BY 3.0 IGO license, adaptation and mismatch caveat appear in `docs/DATA.md` §9 and Explore.
- [x] Use an SVG category map with linked regions and a full regional-list alternative; name/ID search and category filtering affect both; score/name sorting affects list order.
- [x] Add `/compare` with two distinct same-release 2023 regions, guarded against period, method, reference, source and geographic mismatches.
- [x] Keep Home concise with release-derived median, counts and distribution; link region detail to a preselected comparison.
- [x] Run source-artifact data validation, 11 automated tests, lint and the production build; smoke Home, Explore, one detail record, Compare, Methodology and Sources at 1440, 768, 390 and 320px with no document-level horizontal overflow.
- [x] Exercise all 351 distinct production-region pairs through the comparison guard; refuse unknown and identical selections in the browser. Fix streamed comparison rendering and mobile source-fingerprint wrapping.
- [ ] Resolve formal 2020→2023 boundary compatibility, BPS publication rights, independent transcription/methodology review, and sensitivity work before official-grade claims.

Display shapes do not enter the scoring pipeline. CIVX positions, categories and pairwise differences are modeled release-relative descriptions, not official BPS rankings, statistical significance, or causal explanations.

## 16. Product-quality presentation cutover

- [x] Preserve the existing geographic Explore and compatible Compare work, source/license attribution, complete 27-region release and unchanged analytical contracts.
- [x] Centralize semantic color, spacing, radius, control-height, shadow and motion tokens; reuse a shared pressure label rather than build a component library.
- [x] Add persisted Light/Dark/System preferences, synchronous theme bootstrap, native color-scheme, OS changes and storage-denied behavior without dependencies.
- [x] Add Explore-scoped parallel/intercepting regional routes with one shared server-rendered record and canonical standalone URL behavior.
- [x] Support Escape, backdrop and close-button dismissal, Tab wrapping, focus restoration, scroll locking, Back/Forward and cached-route reactivation.
- [x] Add restrained dialog, map, card and control motion with reduced-motion support; keep browser-history dismissal immediate.
- [x] Refine Explore hierarchy, compact filters and clear action, fast-scanning cards, map boundary/inspection/selection states and selector/list alternatives.
- [x] Show Compare's named score difference, A/B swap, raw/normalized/contribution differences, shared-scale bars and invalid-selection recovery.
- [x] Refine Home's release snapshot and entry points, and Methodology/Sources reading anchors and mobile provenance layout.
- [x] Add responsive header/theme control, loading surfaces, not-found/error recovery and explicit empty/unavailable/missing-outline branches.
- [x] Run the verified local-artifact data build, 11 automated tests, clean lint and production build; confirm protected release, methodology, raw transcription, read-boundary and scoring fingerprints remain unchanged.
- [x] Exercise production routes and interactions in managed Chromium, including modal focus/history, filters, map, comparison, theme persistence/System and reduced-motion mobile scrolling.
- [x] Check all six primary surfaces at 1920/1440/1024/768/390/320px without page overflow, and computed text contrast in both themes without failures.
- [ ] Complete a formal assistive-technology/accessibility review. Browser smoke and computed contrast checks do not constitute certification.

The committed release has no unavailable scores or missing display outlines, so those branches are not represented by production observations. The §15 boundary, rights, independent review and sensitivity gates remain open. This cutover changes presentation and interaction only, not the 2023 release or methodology version.


## 17. Separate CIVX v2 analytical release

This additive record supersedes future-only v2 statements, not completed v1 work or its remaining review gates.

- [x] Audit 34 candidate concepts with official sources, actual year windows/coverage, classifications, eligibility reasons and detailed JSON diagnostics in `data/raw/v2`; summarize in `docs/V2-SOURCE-AUDIT.md`.
- [x] Release five complete 2023 inputs across all 27 regions, with separate policy, typed v2 boundary and processed release; retain protected v1 artifacts under `data/releases/civx-v1-integrity.json`.
- [x] Separate pressure, context and advantages. Keep density unscored; exclude healthcare access, DBD, road condition and disaster impact from core scoring.
- [x] Publish only three targeted dated positive advantages: Whoosh `3217`, Kertajati `3210`, Cisumdawu `3211`; retain provenance and assignment reasons without fabricated absence.
- [x] Store six sensitivity alternatives and regional results in `data/processed/civx-jabar-2023-v2-sensitivity.json`; document the 50/50 dimension decision and shared poverty/HDI deprivation budget in `docs/METHODOLOGY-V2.md`.
- [x] Record full-precision arithmetic followed by independent two-decimal publication rounding, rights/acquisition limits and unresolved formal review.
- [x] Pass 16 new behavioral regressions alongside all 11 existing tests: 27 total, zero failures. Cover v1 fingerprints/reproduction, v2 isolation, missingness, advantages, geography/year/unit mismatches, normalization, dimension weights, duplicates, provenance and read-boundary classification/layer integrity.
- [x] Integrate `/v2` overview and `/v2/regions/[id]` evidence hierarchy with explicit version navigation and progressive disclosure; keep v1 Explore/Compare default and publish no unsupported map.
- [x] Run final `npm test`, `npm run lint`, `npm run build`, source-verified immutable v2 regeneration and production-browser smoke. Check new pages at 1440/768/390/320px in both themes without document overflow or computed text-contrast failures. Exercise source/capability disclosure, missing evidence, keyboard focus, version switching and preserved routes. Taste source lint passes; standalone inspector cannot locate local Chrome, so managed Chromium supplies visual proof instead. See `.taste-skill/v2/critique.md`; no formal accessibility certification is claimed.
- [ ] Obtain independent transcription/methodology review, resolve publication/reuse rights, certify effective-boundary compatibility and assess uncertainty/optional coverage before official-grade claims.

Only overall, socioeconomic and basic-services layer descriptors exist. No v2 map is complete or released. Restricted source publications remain uncommitted: the BPS book stays ignored, and the original health PDF was acquired only through a temporary/environment-supplied artifact. Documentation and source discovery do not establish redistribution permission.

## 18. Unified CIVX current release

The explicit product decision is one **CIVX**, not separate methodology products. Current methodology: [METHODOLOGY-CURRENT.md](METHODOLOGY-CURRENT.md). The archived four-input methodology document remains byte-identical for reproducibility; this current decision supersedes it for production.

- [x] Reuse the five verified foundation indicators without changing their observations.
- [x] Verify all-27 official Puskesmas totals, exact population, published DBD incidence and BNPB IRBI 2023 observations; generate facility availability in the pipeline.
- [x] Withhold road condition from Core because road-network scope and denominator meaning are not comparable; publish no infrastructure score/layer.
- [x] Use explicit dimension budgets and a common complete scoring contract, with traceable raw numerators, denominators, formulas, sources and metadata.
- [x] Cut all production pages over to one current read boundary; remove product switching and competing version routes.
- [x] Derive indicator/dimension counts and pressure explanations from current configuration; expose only validated map layers.
- [x] Preserve progressive regional disclosure, Context Signals, verified Regional Advantages, direct/intercepted records and signed comparison differences.
- [x] Keep original release artifacts and scoring code available for archived reproduction; remove obsolete UI read boundaries and comparison helpers.
- [x] Review ten full-precision sensitivity scenarios and generate the current 27/27 release from frozen audited transcriptions. Retain equal 25% dimension budgets; report up to eight-place movement and reject fine-rank claims.
- [x] Pass all 41 tests, lint and the production build (37 generated pages). Explicit `data:replay` succeeds. Strict `data:build` rebuilds the foundational archive, then times out after 45 seconds while acquiring the health-profile original for the dimensional archive; do not claim full original-source regeneration.
- [x] Verify Home, Explore, map/layers, standalone/intercepted regional records, Compare, Methodology and Sources in managed Chromium. Check all six canonical surfaces at 1440/768/390/320px in Light and Dark: 48 combinations, no document overflow or hydration errors. Exercise empty-result recovery, map layers, signed swap, identical-pair rejection, positive advantages, derivation disclosure, source-verification receipts, modal focus wrap/restoration, Escape, Back/Forward and direct reload.

Browser smoke caught an SVG title hydration mismatch: separate static/dynamic title children did not survive browser parsing as React expected. A single title string fixed the cause; development and rebuilt production smoke passed. Temporary diagnostics were removed. No dependency was added and TypeScript remains `strict: true`, `noEmit: true`.

Remaining external gates: independent source/method review, publication/reuse rights, certified effective-boundary compatibility, uncertainty and formal accessibility review. DBD source population vintage remains unresolved; use the official reported-incidence series without inventing a replacement denominator. Puskesmas supply is not measured healthcare access; IRBI is modeled risk, not actual disaster impact. Missing optional evidence is not zero or verified absence.

## 19. Socioeconomic and Education evidence audit

This is a next-model source and methodology decision record, not a production scoring cutover. The current release in §18 remains unchanged.

- [x] Verify all five Socioeconomic and five Education candidates against official 2023 records for all 27 Jawa Barat kabupaten/kota; retain 270 candidate observations and 27 separate nominal-expenditure observations with source receipts.
- [x] Compute per-candidate extrema, mean, median, population standard deviation, CV, missingness, unique values, all 20 within-dimension correlations and explicit outlier/rounding flags without imputing or substituting values.
- [x] Document exact definitions, units, denominators, periods, official locators, acquisition dates, fingerprints, source conflicts and all eight requested report sections in [SOCIOECONOMIC-EDUCATION-AUDIT-2023.md](SOCIOECONOMIC-EDUCATION-AUDIT-2023.md).
- [x] Recommend poverty, TPT, expenditure Gini and real adjusted annual expenditure for an HDI-free Socioeconomic dimension; recommend RLS25+, HLS and upper-secondary APM for Education. Retain TPAK, APK, AMH and nominal expenditure as context; recommend IPM context-only in that next model.
- [x] Independently smoke-check all 270 candidate records, regional identity, descriptive statistics, 20 Pearson pairs, evidence hashes and unchanged production-input/policy/builder fingerprints. Pass `npm run lint` and `npm run build` with 37 generated pages.

No frontend, production indicators, scoring code, weights or methodology configuration changed. No dependency or permanent test was added. Future model weighting, normalization, uncertainty review, rights clearance and release approval remain separate decisions.

## 20. Basic Services evidence and methodology audit

This resumes the provider-interrupted audit from saved evidence. It is a research decision record, not a production scoring cutover. The current release in §18 and prior Socioeconomic/Education audit in §19 remain unchanged.

- [x] Recover completed healthcare, household, waste and other-service evidence; reconstruct unfinished water findings from the prior transcript and reacquire only four incomplete API panels plus metadata.
- [x] Re-audit all 27 improved-sanitation and improved-drinking-water records for 2023. Verify the actual Puskesmas formula, main-facility numerator and exact matching 2023 population without rebuilding production.
- [x] Audit electricity, healthcare facilities/beds/staff, adequate housing/materials/crowding, personal/household digital access, waste services, stronger water-service alternatives and other defensible essential services.
- [x] Preserve 91 source/diagnostic series, 2,449 regional records, 88 complete panels and 51 failed or qualified dataset investigations in `data/raw/basic-services-audit-2023/`. Preserve 21 expected gaps without zero-fill, interpolation, substitution or reweighting.
- [x] Compute every series' count, missingness, uniqueness, extrema, mean, median, population SD, CV, ties and IQR flags; retain 903 full-cohort Pearson/Spearman pairs and 55 possible-redundancy flags in `data/processed/basic-services-audit-2023-statistics.json`.
- [x] Apply all ten admission gates. Recommend retaining sanitation, drinking water and narrowly labelled Puskesmas supply, with standalone household crowding ≤7.2 m²/person and formal health-insurance ownership as next-model additions. Recommend three subdimensions with no weights.
- [x] Document conceptual nesting, saturation, source conflicts, uncertainty, every failed investigation, exact CORE provenance and all ten final questions in [BASIC-SERVICES-AUDIT-2023.md](BASIC-SERVICES-AUDIT-2023.md).
- [x] Independently smoke-check the saved statistics/correlations, 613 population-derived rates, 1,107 source row receipts, insurance/lighting/cooking derivations, all 81 current-indicator values, evidence hashes and five protected production fingerprints. Correct source-excerpt encoding metadata without changing numeric records.
- [x] Pass `npm run lint` and `npm run build`, including TypeScript and 37 generated pages. Keep all frontend, production scoring, indicators, weights, policy and release outputs unchanged; add no dependency, permanent test or recommendation feature.

No session audit task remains unfinished. Evidence gaps remain explicit: operational safe-water definitions and laboratory safety, household broadband/access, active insurance rather than ownership, workforce FTE/reporting, hospital catchments/operational beds, coherent waste-service denominators/historical access, and finer uncertainty. Electricity remains saturated context. The adequate-housing composite remains an alternative bundle, not an extra independent score beside its own WASH components. Independent review, rights, effective geography, future weights and release approval remain separate gates.

## 21. Public Health data and methodology audit

This continues the existing audit and current worktree after the provider interruption. It recovers completed research rather than starting another audit. The current release in §18 and the prior audits in §§19–20 remain unchanged.

- [x] Recover InfectiousAudit, NutritionAudit, MaternalChildAudit and NcdAudit source captures, official PDFs, retained reader artifacts and exact numeric transcriptions without repeating completed source searches.
- [x] Re-audit all 27 current published DBD values, exact BPS 2023 population and official Dinkes case counts. Recommend REVIEW / next-model CONTEXT ONLY until source bases reconcile; leave production DBD untouched.
- [x] Audit infectious disease, nutrition, maternal/neonatal/infant/child outcomes, immunization, reproductive history, NCDs, morbidity, life expectancy and disability; distinguish outcomes from detection, services, targets and wrong-year evidence.
- [x] Preserve 106 evidence artifacts, 70 source/diagnostic panels, 1,890 expected regional records, 1,858 numeric observations, 32 explicit gaps and 30 investigations without an admitted district panel. Keep raw symbols, source editions, numerator/denominator definitions and uncertainty.
- [x] Calculate all panels' count, missingness, uniqueness, extrema, mean, median, population SD, CV, Q1, Q3, IQR, outlier, tie, saturation and bounds diagnostics. Preserve 210 full-cohort Pearson/Spearman pairs and five possible-redundancy flags.
- [x] Apply twelve admission gates and recommend four next-model CORE outcomes: SKI stunting, SKI wasting, BPS activity-limiting morbidity and LFSP2020-based life expectancy. Keep life expectancy conditional on aggregate IPM exclusion; assign no weights.
- [x] Propose Nutrition and General Population Health as admitted subdimensions, with Infectious Disease and Maternal & Child Outcomes explicitly unadmitted for scoring. Keep immunization/service capacity outside the Public Health burden dimension.
- [x] Write the complete candidate register, CORE/CONTEXT/REJECTED decisions, raw-count transformations, detection-bias analysis, exact provenance, evidence gaps and twelve explicit answers in [PUBLIC-HEALTH-AUDIT-2023.md](PUBLIC-HEALTH-AUDIT-2023.md).
- [x] Run the independent audit generator and numerical smoke: reproduce every descriptive statistic and all 210 Pearson/Spearman pairs, verify 27 diarrhea planning identities, 108 CORE observations and protected production fingerprints. Pass deterministic `--check`, `npm run lint` and `npm run build` with TypeScript and 37 generated pages.

No frontend, production score, release, indicator, weight, methodology configuration or recommendation feature changed. No dependency or permanent test was added. Research deliverables are complete; unresolved DBD bases, surveillance/registration intensity, birth and measured-child denominators, district NCD evidence, uncertainty, rights, effective geography, expert review and release approval remain explicit evidence or governance gaps, not fabricated inputs.
