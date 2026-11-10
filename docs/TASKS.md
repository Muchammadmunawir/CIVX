# CIVX Tasks

**Status:** The Figma frontend integration in §26 now uses the reviewed 2023 product facade. It supersedes the older eight-input frontend in §18 without modifying frozen model or source artifacts.
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

## 22. Resilience data and methodology audit

This is a research-only next-methodology decision for all 27 Jawa Barat kabupaten/kota in 2023. The current release in §18 and completed audits in §§19–21 remain unchanged. Public Health disease-context evidence was not revisited or expanded.

- [x] Define hazard, exposure, vulnerability, realized impact and adaptive capacity separately; recommend **Disaster Pressure / Tekanan Bencana** rather than a broad resilience-capacity claim or silent inversion.
- [x] Independently reacquire the original BNPB IRBI 2023 PDF and official HTML; verify all 27 current values with zero differences, original fingerprint, composite construction, older baselines and direction.
- [x] Search official hazard-specific risk, exposure/vulnerability, annual events/impacts, IKD, TAGANA, Destana, early warning, evacuation, institutional resources, disruption/recovery and shock-support evidence. Preserve wrong-year, province-only, inaccessible and definition-conflicted results explicitly.
- [x] Preserve 111 artifacts, 95 source/diagnostic panels, 2,565 expected records, 2,424 numeric cells, 141 missing cells and 47 qualified/failed investigations. Distinguish 214 source-ambiguous numeric cells from validated observations and 82 numerically complete panels from scoring admission.
- [x] Generate the complete 142-row candidate register and fourteen-gate admission record. Calculate all panel descriptives, 3,081 pairwise diagnostics, 1,596 defined Pearson/Spearman pairs and 112 possible-redundancy flags; retain constant-series correlations as undefined.
- [x] Recommend the overall official IRBI as the single smallest defensible CORE under Structural Disaster Risk. Keep IKD and annual impacts non-additive context; reject additive composite stacks, raw-count resilience scores and unvalidated rates. Assign no weights.
- [x] Write [RESILIENCE-AUDIT-2023.md](RESILIENCE-AUDIT-2023.md), including construct, candidate decisions, source conflicts, exact provenance, proposed hierarchy, evidence gaps and twelve explicit answers.
- [x] Independently recompute all 95 panel statistics and 3,081 pair diagnostics; check 783 retained API rows, 185 original hazard-table values, 27 original overall IRBI values, 111 artifact hashes, 142 register IDs and 92 protected existing-file fingerprints.
- [x] Pass deterministic audit `--check`, `npm run lint` with zero warnings/errors, and `npm run build` with TypeScript and 37 generated pages. Keep frontend, production score, indicators, methodology configuration, weights, release, Public Health and recommendation features unchanged.

The original BPS symbol legend was visually inspected for this audit: a published dash means “Tidak ada atau nol,” not an absent row. BNPB-library dashes remain null without an established zero legend. No previous audit or production symbol treatment changed. Fresh hazard/exposure baselines, verified IKD item evidence, operational preparedness coverage, event/person/address deduplication, reconciled damage editions, uncertainty, rights and joint-model review remain explicit evidence/governance gaps, not invented observations.

## 23. Frozen 2023 scoring engine

This implements the completed [indicator freeze](FINAL-INDICATOR-FREEZE-2023.md), [normalization design](NORMALIZATION-DESIGN-2023.md), and [weighting design](WEIGHTING-DESIGN-2023.md). The existing production release in §18 remains unchanged.

- [x] Implement strictly typed, reusable model validation, directional min-max normalization, within-dimension aggregation and equal-dimension aggregation for exactly 27 regions, 18 CORE indicators and six dimensions.
- [x] Generate `data/processed/civx-scores-2023.json` from pinned repository inputs, preserving full precision, raw observations, approved weights, source pointers, region identity and model versions.
- [x] Expose structured dimension extrema, ordered normalized indicators and indicator/dimension score-point contributions without natural-language insights or regional rankings.
- [x] Reject missing, duplicate, unknown, non-finite, out-of-range, changed-method and changed-weight inputs without imputation, clipping, refitting or weight redistribution.
- [x] Pass 36 new scoring tests and all 77 application tests, independent Decimal arithmetic, byte-identical CLI replay, source/output-drift failure smoke, `npm run lint` and `npm run build` with 37 generated pages.
- [x] Document API, source verification scope, formulas, precision, reproducibility, validation results, interpretation, limitations and the unchanged frontend boundary in [SCORING-ENGINE-2023.md](SCORING-ENGINE-2023.md).

All 27 regions scored successfully. The artifact is calculated but not released. Insight Engine implementation and frontend integration are the next separate tasks; independent review, rights, effective-boundary review and release approval remain governance gates.

## 24. Frozen 2023 CORE Insight Engine

This implements deterministic explanations of the completed scoring stage in §23. The current production release in §18 remains unchanged. Design and validation: [INSIGHT-ENGINE-2023.md](INSIGHT-ENGINE-2023.md).

- [x] Consume the pinned 18-indicator scoring artifact without changing normalization, weights, observations, contributions, scores, model versions or reference year.
- [x] Add reusable exact-tie midrank comparisons, cohort medians, score differences, above/below/tie counts and percentile-based descriptive classifications.
- [x] Select cohort-supported pressure dimensions, close co-leaders, relative lower-pressure dimensions and contribution-supported indicators without forced maximum-only dominance.
- [x] Generate controlled Indonesian overall, main-pressure, lower-pressure and indicator insights with structured evidence and scoring-record JSON Pointers; avoid singleton repetition and causal, absolute or policy claims.
- [x] Generate `data/processed/civx-insights-2023.json`: 27 region records, six dimensions and 18 indicators per region, 675 comparisons and 112 prioritized CORE insights.
- [x] Pass 108 new insight/comparison tests and all 185 repository tests, generation/check replay, network-denied runtime smoke, `npm run lint` and `npm run build` with strict TypeScript and 37 generated pages.
- [x] Preserve the scoring artifact SHA-256 `47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5`, upstream evidence, production read boundary and frontend; add no dependency, contextual observations or AI/network service.

The insight artifact is calculated but not released. Future contextual data requires separate approval and remains outside CORE scoring. Frontend integration, independent model/source review, rights clearance, effective-boundary review and release approval remain separate stages. No deployment or public league table is authorized.

## 25. Contextual data audit for 2023 profiles

This audits the separate, non-scoring contextual path after the frozen CORE Insight Engine in §24. Findings and source links: [CONTEXTUAL-DATA-AUDIT-2023.md](CONTEXTUAL-DATA-AUDIT-2023.md).

- [x] Investigate 27 candidate metrics across traffic, transport, public-safety context and detailed air pollution using original official sources, inspected methods, actual values and current usage terms.
- [x] Record 43 source receipts and assign one `ACCEPT_CONTEXT`, six `PARTIAL_CONTEXT` and 20 `REJECT` decisions without forcing all-27 traffic or historical pollution coverage.
- [x] Prepare seven separate metric artifacts containing 84 finite source-resolved observations: Bandung 2024 road-site speed/V-C, 2023 Type C terminal inventory, October 2023 commuter shares, Podes preceding-May-2024 village theft occurrence and dated 2026 station ISPU/PM2.5-component snapshots.
- [x] Preserve original units, actual periods, definitions, missingness, limitations, rights notes, source locators and safe/unsafe deterministic statement templates; keep site observations nested and regional scalars null.
- [x] Reject unresolved police-to-civil jurisdiction/rate denominators, restricted portal/TomTom reuse, mixed/unknown traffic periods, unverified concentration archives and unsupported raster-to-region extraction.
- [x] Generate `data/processed/contextual-data-catalog-2023.json` and `data/processed/context/` deterministically from audited transcriptions, with offline check commands and credential-pattern scanning.
- [x] Pass all 205 tests, lint, strict production build with 37 pages, network-denied replay and all 16 CORE fingerprints unchanged.

Context does not affect any CIVX score or CORE insight. No frontend, simulation, deployment, normalization, new dependency, missing-value imputation or cross-dataset ranking was introduced. Integrate the five-region 2023 commuter shares first; other contexts require their literal units, dates, coverage and limitations, with rights/publication review separate from this audit.


## 26. Figma frontend integration

This user-authorized frontend cutover follows six supplied visual references while retaining the reviewed 2023 product API as data authority. It does not authorize public release, new periods, policy classes, rankings, or source-rights claims.

- [x] Audit old frontend consumers, reviewed contracts, planning documents, geographic assets, and all six references.
- [x] Create shared Indonesian navigation, responsive menu, functional local region search, footer, Poppins typography, semantic light/dark tokens, and reusable product disclosures.
- [x] Replace Home province/best/worst summaries with truthful 27-region, six-dimension, 18-indicator, and 2023 facts plus the existing SVG map.
- [x] Replace Explore score ordering/categories with canonical BPS order, name/type filters, all 27 region rows, matching map visibility, and empty-result recovery.
- [x] Integrate standalone regional detail, six dimension bars, unchanged controlled insights, 18 indicator disclosures, source uncertainty, and separate context. Remove obsolete intercepted dialogs.
- [x] Integrate comparison selectors and URL selection through the reviewed comparison API. Preserve exact A-minus-B values, engine-selected highlights, same-region ties, invalid selections, and non-comparable context.
- [x] Replace mock methodology with direction-aware cohort min–max, exact equal-dimension weights, equal within-dimension weights, actual scope, and interpretation limits.
- [x] Replace empty source catalog with evidence for 18 CORE indicators and seven CONTEXT datasets, retaining actual publishers, URLs, locators, periods, units, scope, and limitations.
- [x] Preserve commuter missingness, terminal missing/zero distinctions, literal Podes village occurrence, road-site observations, and dated station ISPU observations. Never compute context aggregates or deltas.
- [x] Remove obsolete frontend consumers and presentation helpers while retaining historical domain/data modules and all frozen evidence.
- [x] Add behavior-focused frontend coverage and migrate obsolete comparison tests. Delete navigation-wiring-only assertions. Keep analytical domain tests and source integrity checks.
- [x] Adapt freshness CLI test fixtures to the analytical baseline only, omitting superseded presentation locks without changing the historical protocol, generator, or generated artifacts.
- [x] Diagnose Turbopack floating-point JSON reserialization and select webpack for development/builds instead of weakening exact domain validation.

Map boundaries remain approximate 2020 geoBoundaries display geometry with established BPS-code associations and CC BY 3.0 IGO attribution. Uniform color carries no pressure classification. Native links, titles, selectors, and the full region table provide equivalent access.

The historical freshness audit still requires its original presentation snapshot for exact repository replay. Source rights, independent methodology/source review, certified boundaries, formal accessibility review, and public release remain separate governance gates. No dependency, external service, credential, frozen artifact, or scoring rule changed.

### Exercised verification

- `npm test`: 276 passed, zero failures or skipped tests. The focused frontend/comparison/freshness regression run also passed all 26 tests.
- `npm run lint`: passed without warnings or errors after the final responsive CSS changes.
- `npm run build`: passed with strict TypeScript and 36 generated pages using webpack.
- Managed Chromium inspected the production server on all six routes at 1440, 1024, 768, 390, and 320px. All 30 fully loaded route/width combinations had no viewport overflow and no unlabeled input/select controls.
- Production interaction smoke covered global search to detail, detail to comparison, GET selectors, same-region ties, invalid comparison, invalid region, name/type filtering, empty-result reset, SVG keyboard activation, mobile menu Enter/Escape, search Escape, indicator/source disclosures, context site observations, dark regional disclosures, and reduced motion.
- All 35 distinct internal URLs collected from the six surfaces returned HTTP 200 to HEAD requests. Same-page anchor inspection found no missing targets. External publisher availability was not re-audited.
- No JavaScript or hydration errors were observed in the production smoke. Reduced-motion emulation produced a zero-second button transition.
- Frozen score SHA-256 remains `47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5`; frozen insight SHA-256 remains `ffd92543c6387c981d2647c8ed55bd3abb7f7c4e9b5b91d4a74fab81999d6345`.

Visual review retained the references' restrained palette, orange active marker, rounded heading hierarchy, card borders, large map, paired comparisons, and methodology reading column. Deliberate differences are truthful structural summaries, neutral region lists/map color, six dimensions, no trend, and larger real evidence disclosures. Final narrow-screen polish keeps the 320px menu control in the first header row and opens navigation below the header rather than over its controls. Formal accessibility certification remains outside this smoke.

## 27. Frontend completion and review pass

- [x] Inspect the requested branch and preserve all eleven existing modified files. Fetch and merge `origin/main` without rewriting history; the merge completed without conflicts.
- [x] Retain all reviewed 2023 product capabilities and frozen domain/data contracts.
- [x] Refine Home's two-column proportions, map size, and summary spacing without introducing mock scores or categories.
- [x] Add keyboard-accessible nine-row Explore pagination, reset pagination on search/type changes, and keep the map on the full filtered result in BPS order.
- [x] Add real-path regional silhouettes, underline-style anchor navigation, concise unchanged CORE insights, all 18 indicators, and practical source disclosures.
- [x] Prioritize available/site-only context and group missing datasets compactly. Preserve explicit zero values, actual observation dates/sites, and every missing reason.
- [x] Remove engineering hashes, internal paths, release/authorization flags, evidence pointers, and raw comparison JSON from product pages without altering the underlying records.
- [x] Preserve overall/dimension/indicator comparisons, highlights, A/B selectors, swap, same-region ties, and non-comparative context.
- [x] Add Sources title/publisher/dimension search, CORE/CONTEXT scope, six CORE dimension choices, counts, empty state, and reset over the original 18/7 catalog.
- [x] Preserve real methodology and improve header Escape focus, ArrowDown result access, and mobile menu focus restoration.
- [x] Compare all six routes with the original supplied Figma exports and inspect production screenshots at 1440, 1024, 768, 390, and 320px.
- [x] Retain historical root image `-.png`: it predates this frontend branch and contains a source-table extract, not a temporary frontend screenshot. Remove no unrelated project artifacts. Keep review screenshots outside the repository.

### Verification for this pass

- Focused frontend tests: **17 passed, zero failed, cancelled, skipped, or pending**.
- `npm test`: **284 passed, zero failed, cancelled, skipped, or pending**.
- `npm run lint`: passed with no warnings or errors. Removed unsupported `aria-expanded` from the native search input; labels, result controls, keyboard access, and focus restoration remain.
- `npm run build`: passed strict TypeScript and generated **36 pages**, using webpack.
- Production Chromium checked the six requested routes at all five widths in both light and dark themes: **60 combinations**, with no document overflow, clipped heading/paragraph/summary text, missing input labels, broken same-page anchors, or duplicate primary headings/landmarks.
- Expanded all native disclosures at 768 and 320px in both themes: **24 additional combinations**, with no document overflow, heading-level skips, unnamed links/buttons, or table headers lacking scope.
- Exercised global search result selection, ArrowDown, Escape/focus restoration, empty results, and GET search to Explore. Exercised Explore search/type intersection, empty reset, keyboard pagination, page reset, and full-filter map retention.
- Exercised map hover, keyboard focus, and click navigation; regional indicator/context disclosures; Banjar's explicit zero; comparison selectors/swap/same-region equality; source title/publisher/dimension/scope filters, empty reset, and source disclosures.
- Exercised mobile menu open/close, Escape, focus restoration, and link dismissal. Dark preference survives reload; System follows emulated OS changes; reduced motion yields a zero-second button transition.
- All **36 distinct collected internal URLs** returned HTTP 200 to HEAD probes. Chromium recorded cancelled HEAD requests after receiving headers; no failed product navigation, JavaScript exception, hydration warning, missing-key warning, or console error was observed.
- Practical accessibility review covered meaningful single H1/main landmarks, heading order, labels, real links/buttons, table scope, native disclosure summaries, keyboard access, visible focus, skip navigation, and map alternatives. This is not formal accessibility certification.

The review keeps the supplied blue-purple/orange/lavender visual language and deliberate truthful departures from mock ranks, categories, years, trends, and methodology. Source rights, independent review, effective-boundary certification, formal accessibility evaluation, and public model release remain separate governance gates. No dependency, credential, map token, database, API server, or frozen model change is introduced by this pass.

## 28. Interactive CORE choropleth revision

This user-authorized incremental revision supersedes the neutral-only Explore map statements in §26–27. Home remains neutral; no other product feature or analytical contract changes.

- [x] Run baseline checks before editing: 284 tests passed, lint passed, and the strict webpack build generated 36 pages.
- [x] Preserve the existing SVG geometry, BPS identities, approximate 2020 boundary disclosure, attribution, native links, and canonical detail routes.
- [x] Add neutral plus the six facade-derived CORE dimension options on Explore, without CONTEXT layers or client-side scoring.
- [x] Use each full-precision dimension score directly for a fixed 0–100 sequential purple color scale; preserve the scale across search/type filtering.
- [x] Add a relative-pressure legend for the fixed 27-region 2023 cohort, non-absolute endpoints, and an explicit filtered-gray distinction from zero.
- [x] Keep dimension scores in inspection, accessible names, and native titles. Preserve hover, focus, region selection, keyboard/detail navigation, and neutral overall-score inspection.
- [x] Add 250 ms color transitions and remove them under reduced-motion preference. Keep the existing responsive layout and 44 px controls.
- [x] Add nine permanent map regressions covering all 162 facade dimension values, zero/100 endpoints, filter invariance, excluded keyboard targets, empty results, neutral inspection, and six CORE-only options.
- [x] Pass the 14-test focused page suite and `npm test`: 293 passed, zero failed, cancelled, or skipped. Pass `npm run lint` and `npm run build`, generating 36 pages.
- [x] Exercise the actual development and production maps in Chromium: all six layers, neutral reset, hover/focus, selection across layers, filter intersection, empty/reset, keyboard/detail navigation, and unchanged neutral Home.
- [x] Inspect production light/dark layouts at 320, 390, 768, 1024, and 1440 px with no viewport overflow or clipped map text. Observe a running 250 ms fill transition and a zero-second reduced-motion transition. Observe no application JavaScript or console errors.

No dataset, scoring rule, normalization, weight, methodology, governance flag, CORE/CONTEXT rule, or dependency changed. No CSV, PDF, heatmap, commit, push, or deployment was performed. Approximate boundaries, tiny city targets, source rights, independent review, formal accessibility certification, and public-release approval retain their existing limits. Browser verification covers Chromium and emulated viewport/media states, not physical mobile devices or every browser.

## 29. Phase 2 choropleth completion

- [x] Inspect the clean integration branch and fetch origin. Merge the latest team `origin/main` work (`f90c8fd`) into `Muchammadmunawir/frontend-integration-figma` without conflicts, preserving Home/Compare changes and leaving `main` unchanged.
- [x] Run the merged baseline: 293 tests passed with no failures or skipped tests.
- [x] Retain neutral plus six exact facade-named CORE dimensions, fixed 0–100 colors, full-precision scores, filtering invariance, canonical navigation, geometry attribution, and CORE/CONTEXT separation.
- [x] Move the layer control before the workspace. Put region selection/information before SVG links in DOM/keyboard order and above the graphic on mobile. Preserve the desktop map-left/panel-right layout and Home's visual arrangement.
- [x] Use the Indonesian label “Lapisan peta” and add an explicit non-official/non-policy disclaimer with a working methodology route.
- [x] Add a presentation-only missing-score regression that distinguishes unavailable from zero without mutating production data or substituting the overall score. The focused page suite passes all 15 tests.
- [x] Exercise all six layers, neutral reset, unchanged hover fills, selection retention, layer changes without table-page reset, type/name intersection, empty-result recovery, region-first keyboard access, and detail navigation.
- [x] Inspect light/dark maps at 320, 390, 768, 1024, and 1440 px without viewport overflow or clipped map text. Confirm that mobile information precedes the map. Observe a running 250 ms fill transition and zero-duration reduced motion.

### Final verification

- `npm test`: 294 passed, zero failed, cancelled, or skipped.
- `npm run lint`: passed with no warnings or errors.
- `npm run build`: passed strict TypeScript and generated 36 pages with webpack.
- Production Chromium verified all six layers across all 27 regions, light/dark layouts at five widths, mobile panel-first order, keyboard/SVG click navigation, touch activation of the detail link, the methodology link, and Home's preserved neutral map arrangement.
- A running fill transition measured 250 ms; reduced motion produced a zero-second transition. Minimum measured map-text contrast was 5.65:1 in light mode and 7.66:1 in dark mode.
- Production smoke recorded no application JavaScript or console errors. Touch verification used browser emulation, not a physical device. Cross-browser and formal screen-reader certification remain outside this pass.
- Frozen score/insight SHA-256 values remain `47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5` and `ffd92543c6387c981d2647c8ed55bd3abb7f7c4e9b5b91d4a74fab81999d6345`.

The latest team Home uses an inverted display index (`100 − pressure`), province mean, and status/priority labels. Phase 2 preserves that team work rather than silently rewriting it; these presentations need separate methodology review before competition submission. The map does not adopt those categories or invert pressure values. No dependency, dataset, scoring, normalization, weights, governance flag, API, database, CSV/PDF export, heatmap, or comparison feature is introduced by this completion pass.

## 30. Phase 2.1 — theme-aware overall choropleth and motion

- [x] Inspect the clean integration branch, fetch origin, and confirm the previous team integration and Phase 2 commits. Keep `main` unchanged and preserve the existing Home/Compare presentation.
- [x] Compare the light-mode tokens with integration commit `2e955be`. Preserve the original backgrounds, typography, surfaces, buttons, accents, navigation, and spacing conventions. Supplied screenshot/video references were not available; follow the written motion brief instead.
- [x] Replace neutral mode with **Skor Keseluruhan CIVX** on Home and Explore through the same existing map. Retain all six exact facade-named CORE dimensions and full-precision pressure scores.
- [x] Add map-specific semantic light/dark tokens derived from the existing indigo accent. Keep the fixed 0–100 domain, explicit gray filter exclusion, hatched unavailable scores, relative-cohort legend, methodological caveats, and source attribution.
- [x] Keep geographic paths mounted and stationary across layers, retain the inspected region and table page, update labels immediately, and animate fill for 300 ms without replacing score colors on hover.
- [x] Replace the OS-dependent theme select popup with a scoped accessible radio menu. Preserve theme bootstrap, storage, and System tracking; support arrows, Home/End, first-letter access, Enter/Space, Escape, Tab/Shift+Tab, and outside dismissal.
- [x] Add progressive once-only Home/Explore reveals: 520 ms, 16 px travel, and 70 ms stagger. Keep actions opaque, settle on interaction, retain no-JavaScript visibility, and disable nonessential motion under reduced motion.
- [x] Fix tablet Home card text collisions without changing their content or desktop/mobile hierarchy. Align the Home map selector without stretching its control height.
- [x] Reuse Explore's existing loading component for its request-time Suspense boundary and reserve a viewport of loading height, eliminating the observed footer shift.
- [x] Replace the obsolete neutral-map behavior regression with shared Home/Explore overall-score and filter-invariance coverage. Remove the selector-options-only wiring test rather than repinning its wording.
- [x] Update README and the product, data, architecture, and integration contracts. No source, model, normalization, weighting, CORE/CONTEXT, release flag, dependency, export, or deployment changes.

### Exercised verification

- `npm test`: **293 passed**, zero failed, cancelled, or skipped. The focused frontend page suite passed all **14** tests, including all 162 dimension scores, shared overall pressure, fixed filter mapping, unavailable-versus-zero handling, and equivalent region access.
- `npm run lint`: passed without warnings or errors.
- `npm run build`: passed strict TypeScript and generated **36 pages** with webpack.
- Production Chromium checked overall plus six CORE layers against all 27 full-precision facade records in both themes. Selected region `3273` survived every layer switch. Home and Explore pressure mappings matched.
- Browser interaction smoke exercised hover, keyboard focus/outline, SVG Enter navigation, selected-region detail, table-page retention across layers, name/type intersection, excluded keyboard targets, empty results, and reset.
- Touch emulation navigated from the inspection panel to `/regions/3273` and directly from a geographic path to `/regions/3201`. No physical device was used.
- Captured and visually reviewed Home/Explore light/dark screenshots at **320, 390, 768, 1024, and 1440 px**: **20 combinations**, with no document overflow or clipped visible heading/paragraph/label text. Explore retains panel-first mobile order.
- Theme menu keyboard, selected/focus states, Space activation, first-letter access, Escape focus return, Tab/Shift+Tab destinations, and outside dismissal worked. Measured option text contrast was at least **10.01:1** in light mode and **6.65:1** in dark mode. System followed emulated OS changes and survived reload.
- A running fill transition measured **300 ms**. SVG identity and path geometry stayed unchanged; sampled desktop inspection heights stayed equal across layers. Surface-relative scale intensity increased monotonically at 0/25/50/75/100 in both themes.
- Observed **nine Home** and **eleven Explore** reveal starts, each once despite scrolling away and back. Reduced motion produced no reveal starts, no hidden content, and a **0 s** fill transition. Enabling reduced motion during the session settled every target.
- No-JavaScript browser loads retained visible content and all 27 native map links on both pages.
- Layout-shift instrumentation identified the previous Explore fallback footer shift (**0.2315625**). After reserving loading height, the same normal/reduced-motion Home/Explore smoke recorded **0**. These are local smoke observations, not field-performance guarantees.
- No application JavaScript exception or console error was observed. Script requests cancelled during intentional no-JavaScript probes are not product navigation failures.
- Frozen score/insight SHA-256 values remain `47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5` and `ffd92543c6387c981d2647c8ed55bd3abb7f7c4e9b5b91d4a74fab81999d6345`.

Visual review retains the original light-mode base palette and existing dark-mode hierarchy. It accepts the compact legend, stronger selection boundary, and progressive movement without redesigning cards, navigation, or the page hierarchy. Browser coverage is Chromium only; Firefox/Safari, physical devices, and formal screen-reader certification remain unverified.

The pre-existing Home inverted index, province mean, and status/priority labels still require separate methodology review before competition submission. This phase does not extend those categories to the choropleth or authorize public model release, certified 2023 boundaries, deployment, or a policy recommendation.

## 31. Phase 3 — governance-limited export and reporting

### Inspection and scope decision

- [x] Read the repository instructions, README, planning/governance documents, product facade/contracts, source metadata, and installed Next.js server/client/CSS/Activity guidance before editing.
- [x] Inspect the clean `Muchammadmunawir/frontend-integration-figma` branch and fetch origin. Confirm teammate integration `f90c8fd`, mobile controls `5dcb4a2`, and Phase 2.1 `4340647`. The fetched main-only addition is merge `85252f2` of the integration branch; no unintegrated teammate implementation is missing.
- [x] Confirm no existing frontend CSV/download/print implementation. The offline freeze-register CSV is not a public regional-results export.
- [x] Enforce existing `SCORED_NOT_RELEASED`, `INSIGHTS_NOT_RELEASED`, and `productionIntegrationAuthorized: false`. Public numerical CSV/PDF and source redistribution remain blocked. Implement only existing identity/year/reference metadata, without changing flags or exposing a bypass.

### Delivered permitted scope

- [x] Add accessible **Unduh CSV** to Explore using the full name/type-filtered identities in BPS order. Pagination and map layers do not limit the export. Empty results disable the action with an explanation; preparation failures have live feedback.
- [x] Include descriptive Indonesian identity/disclosure columns, reference year 2023, BPS attribution, limitations, interpretation, and absolute Sources/Methodology/reporting links. Omit score columns entirely; withheld values are neither missing observations nor zero.
- [x] Add UTF-8 BOM, comma-delimited RFC 4180 quoting, CRLF, multiline/quote/Unicode handling, and formula-like text protection after whitespace/control/format prefixes. Preserve finite numeric precision and zero/missing distinctions in the serializer without exporting unreleased scores.
- [x] Add browser-native **Cetak / Simpan PDF** on region detail. The A4 report includes CIVX branding, exact identity/year, all six dimension/indicator references, original publisher URLs/table locators (including denominator sources), model/version, limitations, and non-official/non-policy interpretation. Scores, observations, uncertainty values, insights, CONTEXT, internal artifact pointers, and source books are excluded.
- [x] Keep the report available to ordinary keyboard/menu printing. Hide navigation and screen controls, keep summaries/table rows intact, and use high-contrast print text independent of theme.
- [x] Reproduce and fix cached-report print leakage: Next.js Activity retains old route DOM under display-none ancestors. Scope print chrome to reports without hidden ancestors; Compare keeps its own print surface after navigation, and Back restores regional print behavior.
- [x] Reproduce Home's incorrect quality reading in Chromium: Depok displayed inverted 72.0 while its map showed pressure 28.0; Sukabumi displayed 36.4 against pressure 63.6. The frozen definition does not authorize this inversion, a provincial index, quality thresholds, or policy priorities.
- [x] Replace only Home's unsupported summaries with facade-derived coverage/year/dimension/indicator counts. Keep its layout, map, theme tokens, and reveal behavior. Delete the obsolete test pinning inverted Home wording. No analytical formulas, datasets, weights, normalization, or release statuses change.
- [x] Update README, product/data/architecture/integration contracts, and the public `/methodology#ekspor-dan-laporan` reference. Add no dependencies or PDF library.

### Exercised verification

- `npm test`: **304 passed**, zero failed/cancelled/skipped. This includes ten new CSV security/missingness/governance tests and two report disclosure/provenance tests. Tests exercise finite precision, explicit zero versus missing, formula text, malicious extra payload exclusion, canonical identities, empty selections, protected numeric access traps, shared bibliography locators, and denominator attribution.
- `npm run lint`: passed without warnings/errors after the final print-scope fix.
- `npm run build`: passed strict TypeScript and generated **36 pages** with webpack after that fix.
- Chromium exercised actual native downloads, including **27 identities** and a final production keyboard download of **one Bandung city identity** (`civx-jawa-barat-2023-identitas-1-wilayah.csv`, 790 bytes). Browser Blob inspection confirmed BOM bytes `239,187,191`, exact filtered BPS IDs/year, reference links, and exclusion of internal pointers.
- Filter scenarios returned all nine cities, Bandung city `3273`, Bandung kabupaten `3204`/`3217`, and an empty disabled state. Exporting from table page 3 with Public Health selected still returned all 27 identities. An injected browser download failure produced useful feedback.
- Production Chromium checked **48 fully loaded route/width/theme combinations**: Home, Explore, Region Detail, and Compare at 320/390/768/1024/1440 px in light/dark; Sources and Methodology at 320/1440 in both themes. No document overflow, clipped visible heading/paragraph/label text, or unnamed input/select/button control was observed. Screen-reader-only clipped labels are intentionally excluded from the visual clipping probe.
- Visually reviewed desktop Home/Region Detail, mobile export/print controls, and both rasterized A4 report pages. Final production PDF for Bandung Barat has **two A4 pages**, `595.92 × 841.92 pt`; Bandung report also has two pages. Important dimension rows and summary/limitation blocks stay intact.
- Keyboard activation produced an actual CSV download and one native `beforeprint` event. Print media hid the shell/screen content and showed all six report rows. An injected print failure produced an accessible error. Production region → Compare → Back preserved the corrected active/cached print scope.
- Exercised overall plus six CORE map layers, SVG Enter navigation to region detail, indicator disclosure, same-region comparison, and invalid comparison rejection. No scoring result changes were observed; the existing domain regressions remain passing.
- Final production smoke observed no application JavaScript exception or console error. One RSC request was cancelled during intentional Back navigation; product navigation completed. Tooling-only smoke setup errors were corrected and are not application failures.
- Frozen score SHA-256 remains `47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5`; insight SHA-256 remains `ffd92543c6387c981d2647c8ed55bd3abb7f7c4e9b5b91d4a74fab81999d6345`.

### Unresolved before submission

Public score/indicator CSV and numerical regional PDF require documented source-rights and model-release approval. Existing frontend integration does not supply that approval. Independent source/method review, certified effective boundaries, formal accessibility evaluation, Firefox/Safari, physical-device testing, and a visible operating-system print-dialog review remain unverified. Chromium's actual native print event and PDF rendering were exercised, not every browser/printer.

The existing team Compare implementation remains unchanged and still contains `100 - pressure`, an inverted provincial mean, 70/50 quality thresholds, best/priority badges, and “Skor dari Beranda” wording that is stale after Home's correction (`comparison-page.tsx:32–42,119–124,173`). These are unresolved methodological claims outside the requested Home correction. Passing interaction/regression tests does not approve those claims; address them before presenting the entire platform as methodologically ready.

No main merge, force push, dependency change, model release, or production deployment is part of this phase.


## 32. Phase 4 final integration and submission review

### Integration and scope

- [x] Read repository guidance and planning records before editing. Initial development working tree was clean.
- [x] Fetch origin and compare the active `Muchammadmunawir/frontend-integration-figma` branch with `origin/main`: one main-only merge commit and four development-only commits.
- [x] Confirm Phase 2 (`5dcb4a2`), Phase 2.1 (`4340647`), and Phase 3 (`58d199d`) are ancestors of the candidate. Main-only `85252f2` records the earlier branch merge; merge it without conflicts or lost teammate changes.
- [x] Keep the development branch as the PR candidate. Do not merge into main, force push, reset, deploy, install dependencies, or change frozen analytical/source artifacts.
- [x] Inspect the remaining unmerged teammate branch `origin/jelajah`: commit `3fb1e12` has no PR and introduces `index-status.ts` with `100 - pressure`, 70/50 quality statuses, and regional ranking. Preserve the branch unchanged; do not merge those contradictory semantics into the stabilized candidate. Any reusable UI work needs a separate pressure-consistent review, not a blind merge.

### Critical fixes

- [x] Confirm Phase 3 already corrected Home: coverage/year/dimension/indicator facts replace the inverted quality index and unsupported best/priority/provincial summaries.
- [x] Reproduce Compare's remaining inversion in Chromium: Depok showed 72.0 against authoritative pressure 28.0; Kabupaten Sukabumi showed 36.4 against pressure 63.6. Both had unsupported quality/priority badges and an inverted provincial mean.
- [x] Cut Compare over to direct overall pressure and all six exact facade dimension names. Remove inversion, provincial averaging, proxy labels, thresholds, and quality/priority badges. Preserve selectors, valid same-region ties, invalid-input handling, layout, and links.
- [x] Distinguish engine-provided absolute distance from signed overall A-minus-B difference. Keep full-precision bar values and display-only rounding; do not recalculate scoring or deltas in React.
- [x] Reproduce severe dark-mode contrast failures: second-region dimension text 2.62:1 and reading label 1.92:1. Reuse existing semantic roles instead of changing global brand colors.
- [x] Add a shared Indonesian preview-status notice and explain the unresolved display/release contradiction in Methodology and documentation. This is disclosure, not access control or release approval.
- [x] Rewrite README for judges: purpose, problem, users, actual features, stack, local setup, sources/vintages, limitations, safe review, and linked technical/audit records. Publish no unverified demo URL.

### Automated verification

- `npm test`: **305 passed**, zero failed, cancelled, or skipped after the final CSS fix. Comparison regressions cover direct overall/dimension pressure, full-precision bars, reversed pair values/delta, absolute distance, same-region ties, and invalid selections.
- `npm run lint`: passed without warnings or errors.
- `npm run build`: passed webpack compilation and strict TypeScript; **36 pages** generated.
- Runtime: Node **v26.12.0**, npm **12.2.1**. No language server is configured; build-time TypeScript completed successfully.
- Frozen score SHA-256 remains `47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5`; insight SHA-256 remains `ffd92543c6387c981d2647c8ed55bd3abb7f7c4e9b5b91d4a74fab81999d6345`.

### Exercised production Chromium verification

- Check Home, Explore, Region Detail, Compare, Methodology, and Sources at **320/768/1440 px in both themes: 36 combinations**. No document overflow, unnamed visible input/select/button, broken same-page anchor, or missing preview notice was observed.
- After the contrast fix, recheck Compare at **320/768/1024/1440 px in both themes: eight combinations**. Second-region text measures **5.89:1 light / 8.56:1 dark**; reading label **12.86:1 / 12.98:1**; second-region bars against their track **3.29:1 / 5.99:1**. No document overflow. Visually review the corrected mobile dimension card.
- Load all six routes again against the final production build. No application JavaScript exception, console error, or hydration error was observed. Tool-only smoke-script selector/context errors were corrected; they are not application regressions.
- Confirm all **27 Home** overall values and all **189 Explore** overall/dimension map values match authoritative full-precision facade records. Layer changes preserve region `3273` and table page 3. Keyboard Enter on a map link opens the correct detail route.
- Exercise search/type intersection, full-filter map retention, pagination, empty disabled CSV, and reset. Actual native CSV downloads contain **27 identities** and one filtered Kota Bandung `3273` identity. The filtered action also works by keyboard.
- Inspect actual downloaded CSV bytes: BOM **239,187,191**, CRLF records, year/reference links, and no score columns. The 27-row download starts from table page 3 with Public Health selected, proving neither limits the export. Formula protection, quoting, Unicode, finite precision, and missing/zero distinctions remain covered by the existing CSV behavioral/security tests.
- Confirm Region Detail's overall pressure, all 18 primary indicator disclosures, source/definition expansion, canonical navigation, and Banjar's explicit **0 terminals**, distinct from unavailable context.
- Activate regional print by keyboard and observe a native `beforeprint` event. Generate and visually review both pages of the Kota Bandung A4 report: **595.92 × 841.92 pt**, two pages, identity/reference scope, six intact dimension rows, nine source references, denominator provenance, limitations, and no numerical results/insights/CONTEXT. Print media hides shell, preview notice, controls, and regional screen content.
- Exercise region → Compare → Back. Cached regional reports do not hide Compare's active content or leak a regional report into it. **Ordinary Compare printing still includes on-screen numbers**; record this governance gap rather than calling it a permitted numerical report.
- Exercise distinct pair selection, swapping A/B, same-region exact ties, and unknown-selection error recovery. Corrected Depok/Sukabumi cards show **28.0 / 63.6**, not **72.0 / 36.4**.
- Exercise Source search, CORE/CONTEXT filtering, Education filtering (**three CORE records**), empty recovery, reset (**25 records**), Methodology formulas/anchors, mobile menu Escape/focus return, global keyboard search, dark reload persistence, and System tracking emulated dark/light preferences.
- Reduced motion yields **0 s** map transitions and readable reveal content. Unknown regional IDs render the not-found boundary with `noindex`; streamed HTTP remains 200, as documented by installed Next.js guidance.
- Probe **34 collected internal URLs**: all return HTTP 200. Check **23 unique external source URLs**: 21 return HEAD 200; Galura rejects HEAD with 405 but GET returns 200 JSON; the Kementerian Kesehatan SKI PDF times out on both HEAD and a range GET. Preserve its audited URL and provenance; do not fabricate a replacement or claim current availability. These are reachability checks, not fresh source-content verification.

### Remaining blockers and safe submission checklist

- [ ] Document source reuse/publication rights and named model/insight release approval before public numerical publication or deployment. Frozen `SCORED_NOT_RELEASED`, `INSIGHTS_NOT_RELEASED`, and `productionIntegrationAuthorized: false` remain unchanged.
- [ ] Keep competition review local or access-controlled until that decision. The notice and metadata-only CSV/regional report do not prevent copying, screenshots, or printing other numerical screens. A public unrestricted demo remains inconsistent with current governance; no major feature or release restriction was silently removed.
- [ ] Obtain independent source/method review and effective-boundary review before official-grade claims. Approximate 2020 display geometry is not certified 2023 geography.
- [ ] Recheck the SKI publisher PDF before judging; retain the audited source locator if the publisher remains unavailable.
- [ ] Complete formal assistive-technology review and physical-device/Firefox/Safari checks. Chromium emulation is not certification. A native print event and rendered PDF were verified, not an operating-system print-dialog visual review or every printer.
- [ ] Review the development-to-main PR and its test/governance evidence. Do not merge or deploy without the owner's explicit approval.


## 33. Phase 4.5 — frontend polish and design consistency

### Audit and preserved scope

- [x] Inspect the clean development branch, fetch origin, read planning records, and confirm Phase 2 `5dcb4a2`, Phase 2.1 `4340647`, Phase 3 `58d199d`, and Phase 4 stabilization are present.
- [x] Review existing components, CSS modules, semantic tokens, motion utilities, installed Next.js CSS/server-client guidance, and previous visual decisions before editing.
- [x] Capture and review Home, Explore, Region Detail, Compare, Methodology, and Sources in light/dark at desktop/mobile widths: 24 baseline captures. Preserve Poppins, the original light palette, the existing dark hierarchy, routes, charts, map geometry, and analytical meaning.
- [x] Preserve all source/model artifacts, scoring, normalization, weights, CORE/CONTEXT separation, governance restrictions, CSV projection, and metadata-only regional reports. Add no dependency or animation library.

### Observed inconsistencies and fixes

- [x] Replace Compare's hardcoded dark SVG select arrow with native themed controls. Raise its roughly 40px selectors and 42px submit action to the shared 44px minimum.
- [x] Align Home reference cards with the coverage card; reuse 8px card radii and remove the separate coverage shadow. Replace oversized 20px action pills with compact 13px actions.
- [x] Introduce shared caption/small/body/section/title typography roles; raise affected 10–11px metadata to at least 12px. Preserve the font family and all original palette values.
- [x] Standardize buttons, field borders, disabled states, pagination, keyboard focus, and disclosure feedback. Add visible Explore filter labels and retain its full-result map and CSV behavior.
- [x] Right-align Compare numeric table columns and give its horizontally scrolling table a name and keyboard focus. Keep methodology tables intact while limiting running text to 75ch.
- [x] Reuse once-only section reveals on all six pages. Centralize 520ms duration, 16px travel, and 70ms stagger; register source groups remounted by filters. Keep actions opaque and settle motion on interaction.
- [x] Correct two observed cold-load shifts: the pathname Suspense fallback previously expanded the mobile header; Compare's separate short request fallback exposed a moving footer. Keep the shell stable and reuse the viewport-height route loader in both Compare loading paths.
- [x] Keep tablet search on one full row at 761–900px. All six 768px headers now measure 136px with the same search position.
- [x] Reproduce dark PDF page margins and override the root print color scheme, not just the body. Retain the original report content, A4 pagination, and active/cached-route print rules.
- [x] Correct stale Compare page metadata that still described four dimensions; it now describes the existing overall pressure and six CORE dimensions.

### Exercised verification

- `npm test`: **305 passed**, zero failed, cancelled, or skipped after the final code change.
- `npm run lint`: passed without warnings or errors.
- `npm run build`: passed webpack compilation and strict TypeScript; **36 pages** generated.
- Production Chromium checked all six pages at **320/390/768/1024/1440px in light/dark: 60 combinations**. No document overflow, clipped visible heading/paragraph/label/summary text, unnamed visible controls, sub-44px input/select/button controls, duplicate main/H1, or broken same-page anchors was observed.
- Local layout-shift instrumentation reproduced header movement of **0.2188574388671875** and Compare footer movement up to **0.25619140625**. Final collected matrix records **0**. Compare was rechecked in all ten theme/width combinations with browser cache disabled after the shared-fallback fix. These are local smoke observations, not field-performance guarantees.
- Captured 60 final full-page screenshots and reviewed contact sheets for all five widths in both themes. Evidence remains outside Git in `/tmp/civx-phase45/`, including before/after captures, measurement JSON, actual CSV downloads, and the A4 PDF.
- Exercised overall plus all six CORE map layers in both themes. Region `3273`, table page 3, all 27 paths, and SVG node identity survive switches. Observed 300ms fill and 140ms boundary transition declarations; SVG Enter activation opens the canonical regional route.
- Exercised Explore name/type intersection, one Kota Bandung result, empty/disabled CSV, and reset to all 27 regions. Actual native downloads contain 27 identities (15,963 bytes) and one identity (790 bytes); the filtered download works by keyboard. Byte inspection confirms UTF-8 BOM `239,187,191`, CRLF, year/reference fields, and no score columns.
- Exercised direct-pressure comparison, selector submission, reversed pairs, same-region zero distance, and invalid-selection recovery. Depok/Sukabumi remain **28.0 / 63.6**. All 18 regional indicator disclosures remain present; source expansion and Banjar's explicit **0 terminals** remain available.
- Exercised Sources CORE/Education filtering (three records), CONTEXT (seven), empty recovery, reset (25), source expansion, and registration of remounted reveal groups. Exercised Methodology's normalization anchor/formula and keyboard horizontal table scrolling.
- Exercised mobile Menu Enter/Escape/focus restoration, global search ArrowDown/Escape, dark reload persistence, and System following emulated light/dark preferences.
- Reduced-motion probes covered all six routes at 320/1440px: no reveal animations or opacity-hidden targets, and 0s map transitions. Enabling reduced motion during a session also settles active entrances. Scroll probes observed no repeated entrance on the same target.
- Keyboard printing emitted a native `beforeprint` event. The final production Kota Bandung PDF has **two A4 pages, 594.96 × 841.92pt**, six intact dimension rows, nine source references, white margins from a dark screen theme, no active animation, and unchanged metadata-only scope. Both rasterized report pages were visually reviewed.
- Region → Compare → Back retains active/cached report print isolation. Compare's ordinary numerical screen printing remains an existing governance limitation, not an approved numerical report.
- All six final canonical surface loads returned HTTP 200. Final JavaScript-enabled production smoke observed no application exception or console error. Tool-only browser/script setup errors were corrected separately.

### Remaining limits

- **P1 — No-JavaScript route rendering:** Home, Methodology, and Sources remain readable without JavaScript. Explore, Region Detail, and Compare can remain on streamed Suspense loading fallbacks. Reveal CSS introduces no hidden waiting state; the remaining hidden ancestors belong to React's streamed transport. Full no-JavaScript data-route support requires a separate rendering/cache decision, not an animation workaround.
- **P1 — Accessibility/browser QA:** Firefox, Safari, physical mobile devices, formal assistive-technology evaluation, and an operating-system print-dialog visual review remain unverified. Chromium viewport/media emulation is not certification.
- **P0 — Existing public-release gate:** source reuse rights and model/insight publication approval remain unresolved. Keep review restricted; do not deploy publicly or interpret this polish as release authorization.
- **P2 — Decorative effects:** no route choreography, continuous animation, new illustration, or extra decorative transition was added. Stability and meaningful feedback took priority.

Frontend is ready to enter final restricted QA with the explicit limits above. It is not a public-deployment approval. Development-branch commit/push is separate from any main merge or production deployment.

## 34. Compact governance disclosures

- [x] Audit the clean development branch and repeated rendered notices before editing. Home had one banner, Explore/Region/Compare/Sources had two, and Methodology had repeated release-status banners plus its separate interpretation note.
- [x] Replace the global layout banner and page-specific repeats with one shared server-rendered `ResultsNotice` on Home, Explore, Region Detail, and Compare. Reuse the existing notice styling and accessible links; do not change palette, fonts, tokens, or scoring.
- [x] Use the approved Indonesian main text: “Data CIVX 2023 masih dalam tahap peninjauan. Hasil analisis bukan indeks resmi atau rekomendasi kebijakan.” Use “Pelajari status dan batasan data” for the link to `/methodology#status-model`.
- [x] Remove duplicated prominent release/rights paragraphs from Methodology and Sources while retaining their substance at `/methodology#status-model`, `/methodology#ekspor-dan-laporan`, and `/sources#penggunaan-sumber`. Preserve methodological reading cues beside numerical data.
- [x] Remove Compare's repeated limitations paragraph; its action now links directly to `/methodology#keterbatasan`. Preserve the interpretation of absolute distance and signed differences.
- [x] Shorten CSV/print captions without weakening their identity/reference-only scope. Retain accessible descriptions, contextual terms links, error feedback, CSV payload disclosures, and all printed report restrictions.
- [x] Remove obsolete notice CSS and preserve the existing Compare section gap with a spacing token.
- [x] Remove three incidental exact-navigation assertions from the analytical comparison test after the new anchored Methodology link made one fail. Keep all pressure, dimension, precision, selector, tie, and invalid-input assertions; exercise disclosure navigation in the browser rather than re-pin the old link shape.

### Exercised verification

- `npm test`: **305 passed**, zero failures, cancelled, or skipped after the obsolete navigation assertions were removed. Lint and the strict webpack production build passed; the build generated **36 pages**.
- Production Chromium checked six routes in both themes at **320/390/768/1024/1440px: 60 combinations**. The four numerical surfaces each show exactly one identical named results notice; Methodology and Sources have no global results banner. No viewport overflow, clipped checked text, duplicate H1, or broken same-page anchor was observed.
- Visually reviewed mobile light Compare, mobile dark Region Detail, desktop light Sources, and desktop dark Methodology. Before/after captures and measurements remain outside Git at `/tmp/civx-notices/`.
- Keyboard activation of the compact notice opens model status with visible focus. Model status links to source rights; the print caption links to reporting terms. The retained text explicitly covers unreleased status, incomplete source rights, restricted review, and the fact that a notice is not access control.
- Reduced-motion emulation keeps the notice visible. The existing named landmark and native links remain accessible without an alert or modal.
- A real keyboard-triggered filtered CSV download contains Kota Bandung `3273`, remains **790 bytes**, retains publication restrictions, and has no score column. Regional print media hides the screen notice, keeps six report rows and the explicit withheld-score statement, and produces the existing A4 report.
- Final production smoke observed no application exception or console error.
- Frozen score/insight SHA-256 values remain `47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5` and `ffd92543c6387c981d2647c8ed55bd3abb7f7c4e9b5b91d4a74fab81999d6345`.

Publication restrictions are unchanged: `SCORED_NOT_RELEASED`, `INSIGHTS_NOT_RELEASED`, and `productionIntegrationAuthorized: false` still apply. Existing numerical screens would conflict with those restrictions if deployed publicly without documented rights and release approval. Notices do not authorize exposure, restrict access, or prevent copying/ordinary printing of other numerical pages. Keep review local or access-controlled. No live public deployment was authorized or performed by this change.

## 35. Approved results notice wording

- [x] Apply the exact approved main and link text through the existing shared `ResultsNotice`, retaining its styling and `/methodology#status-model` target. No scoring, governance flag, export rule, or other behavior changes.
- [x] Verify exact rendered copy, a single notice, and no document overflow on Home, Explore, Region Detail, and Compare at 320/1440px in both themes: 16 production Chromium checks. Visually review the narrow dark notice and exercise its link by keyboard; no application console error observed.
- [x] Pass `npm test` with all 305 tests, `npm run lint`, and `npm run build`, including strict TypeScript and 36 generated pages.

## 36. Mobile hamburger navigation

- [x] Inspect the existing navigation, header, links, global styles, and production behavior before editing. Keep the 760px mobile breakpoint, route ordering, active markers, and stable navigation shell.
- [x] Replace the visible Menu +/− label with three thin CSS strokes in a 44×44px button. Reuse semantic theme, spacing, radius, focus, and motion tokens without dependencies or desktop styling changes.
- [x] Animate hamburger/X transforms over 200ms. Add 8px downward menu travel over 200ms and a 140ms entrance/exit fade; keep links inert and aria-hidden throughout the closed state and exit.
- [x] Preserve Indonesian accessible labels and expanded/controls attributes. Verify Escape restores focus, outside clicks/focus close the menu, all five links close and navigate, native Tab leaves the non-modal dropdown, and resizing resets state with valid focus.
- [x] Check production Chromium at 320/375/390/430/768/1024px in both themes: 12 combinations without document overflow. Desktop link geometry, fonts, padding, and header heights match the baseline exactly. Exercise regional active indication, keyboard search to Kabupaten Bandung, and theme switching.
- [x] Check reduced motion at all four mobile widths in both themes: eight additional combinations with zero-duration transitions. Verify rapid toggles, the 760/761px boundary, and a scrollable 390×320px menu whose last link stays reachable. Review before/after mobile light/dark and desktop captures; local artifacts remain outside Git at `/tmp/civx-mobile-nav/`. Final route/keyboard smoke records no application console error or exception.
- [x] Pass `npm test` with all 305 tests, `npm run lint`, and `npm run build`, including strict TypeScript and 36 generated pages.

Scope remains navigation presentation and interaction only. No route, scoring, source data, governance flag, release restriction, or dependency changes. This work does not authorize public numerical publication, merge PR #19, or deploy production.

## 37. Final controlled product enhancement

### P0 review

- [x] Inspect the clean, fetched `Muchammadmunawir/frontend-integration-figma` branch at `954a13a` and existing draft PR #19. Preserve teammate work, completed hamburger navigation, the exact approved results notice, and all canonical routes.
- [x] Review all six production pages in both themes before editing. Existing coverage, maps, comparison, source disclosures, identity CSV, and regional reporting remain the implementation baseline; do not recreate working features.
- [x] Make the README introduction explicit about the problem, solution, audience, fixed 2023/27-region scope, capabilities, setup, walkthrough, and limitations. Include one actual local browser capture of usage scenarios with no unreleased analytical values. Preserve research/audit history and provide no unauthorized demo link.
- [ ] Public numerical release remains blocked. `SCORED_NOT_RELEASED`, `INSIGHTS_NOT_RELEASED`, `productionIntegrationAuthorized: false`, and incomplete source-rights/release signoff are unchanged. An anonymous check of the PR-linked preview redirected to Vercel login; this is not certification of every deployment URL or public-release permission. Keep numerical review local or access-controlled. A notice is not access control.

### P1 implementation

- [x] Add pure `findSimilarRegions2023` and facade-backed `getSimilarRegions2023`. Use only the six existing full-precision CORE dimension scores, canonical summation order, Euclidean distance, selected-region exclusion, a three-peer maximum, and ascending BPS-ID tie-breaking. Reject incomplete/nonfinite/out-of-range/non-CORE or incompatible data without imputation; unknown selected IDs return `undefined`.
- [x] Add “Wilayah dengan Profil Serupa” to Region Detail with compact Indonesian six-bar profiles, separate distance labels, a section shortcut, and actual selected/peer Compare links. Explain the fixed cohort and the absence of causal, predictive, policy, official-classification, or percentage-similarity meaning. Keep the preview inside the screen-only wrapper and outside all exports.
- [x] Add three Home usage scenarios: Education-layer exploration, two-region comparison, and indicator/source inspection. Shorten the Methodology entry explanation and use native disclosures for the full framework, formulas, and similarity derivation; retain substantive source, rights, and reporting disclosures.
- [x] Implement shareable Explore `q`/`type`/`layer` state, safe repeated/invalid-value defaults, grouped search history, discrete undoable actions, and current-URL synchronization for native history and same-route Next links. Preserve foreign parameters/hash, map DOM identity, inspected region, and layer context. Clarify search/type-only reset and expose active filters plus a mobile results shortcut.
- [x] Reuse palette, typography, spacing, controls, focus, and once-only reveal conventions. Browser review found the first peer-card iteration too tall; compact labels and a shared scale caption fix that density without changing values. Do not add decorative motion, dependencies, new models, or excluded dashboard features.
- [x] Add 40 behavioral regressions for similarity ordering/ties/invalid inputs/mutation boundaries, rendered peer-to-Compare consumption, URL boundaries, and server/router filter state. Remove incidental header/old-empty-copy assertions rather than re-pin wording. Retain numerical, filtering, provenance, and export contracts.

### Exercised verification

- `npm test`: **345 passed**, zero failures, skipped, cancelled, or todo. `npm run lint` and `npm run build` passed; strict TypeScript completed and the production build generated **36 pages**.
- Production Chromium checked six routes in both themes at **320/390/768/1024/1440px: 60 combinations**. No document overflow or unnamed visible controls. The four numerical surfaces retain exactly one notice with the exact approved text; new peer identities, links, and all six visual values match the derived/facade records.
- Independently calculate nearest peers with `Math.hypot` for all **27 regions / 81 selected-peer pairs** and compare the production API order/distances. The facade and methodology metadata remain unchanged before/after derivation.
- Verify all **189 Explore values** across overall and six dimension layers against full-precision facade scores. Layer changes retain selected Kota Bandung. Exercise grouped typing, three Back/Forward transitions, reset, layer/page preservation, focusable mobile list access, empty recovery, direct URL/reload, ambiguous query defaults, and same-route Next links without map remounting. CDP history entries confirm one search-session entry; `history.length` alone is capped by Chromium.
- Activate all three Home scenarios and three peer Compare links by keyboard. Exercise native comparison submission, reversed pairs, same-region six-dimension equality, unknown-ID recovery, indicator/source disclosure, the similarity-method link, all three Methodology disclosures at 320px, and source scope/search/original IRBI link/empty recovery.
- Download actual keyboard-triggered CSV files: **27 identities / 15,963 bytes** from table page two and **one identity / 790 bytes** after filtering. Both retain UTF-8 BOM and the identity/reference schema. The filtered file is byte-identical to the pre-change baseline; neither contains numerical or similarity columns.
- Trigger the native regional print path by keyboard and observe `beforeprint`. Print media hides the complete analytical screen and peer section while retaining six metadata rows. The resulting **two-page A4** PDF has the same extracted text as baseline, no model/similarity values, and the existing release restrictions.
- Check reduced motion on all six routes at 320px dark and 1440px light: **12 additional combinations**, visible content and no reveal animation. The Home usage targets remain done/opaque with zero running animations after scrolling away/back. Mobile Escape/focus restoration and actual theme-menu interaction still work.
- Measure buffered initial layout shifts with browser cache disabled on those same 12 route/theme/width combinations: **CLS 0** in each local observation. This is local Chromium evidence, not a cross-device performance guarantee.
- Visually review final compact profiles at phone/tablet/desktop widths, both profile themes, Home usage scenarios, active Explore controls, and Methodology disclosures. Local before/after numerical captures, CSVs, PDFs, and machine-readable probes remain at `/tmp/civx-final-product/`; only the non-analytical usage screenshot is committed.
- Final browser diagnostics contain no application console error, runtime exception, or hydration error. Frozen score and insight SHA-256 values match the pre-change baseline exactly.

### Remaining gates

Technical integration review and final submission QA can proceed on the development branch with local/access-controlled data. Public publication cannot proceed before documented source rights and model/insight release approval. Independent source/method review, effective-boundary certification, formal accessibility review, Firefox/Safari, physical-device testing, and visible OS print-dialog/printer review remain unverified owner/QA gates. No heatmap, new dataset/model, prediction, chatbot, multi-region comparison, authentication/database, radar chart, logo replacement, or complex animation is introduced. No new PR, merge into main, or production deployment is authorized by this work.

## 38. Complete reporting contract with offline numerical review

### Implemented scope

- Document the complete [analytical CSV/PDF contract](ANALYTICAL-REPORTING-2023.md), separate from the authorized public identity/reference contract. Public reporting remains metadata-only, not a complete numerical analytical export.
- Add a Node-only preparation command and pure reporting modules under `scripts/`. Read authoritative 2023 facade values without scoring again, retain original precision/missingness/uncertainty, exclude CONTEXT/insights/similarity, and never mutate frozen product records.
- Produce full-filter analytical CSV with 240 columns: 24 common fields and 18 indicator groups with 12 fields each. Preserve BPS identity, period, overall/six-dimension scores, raw/normalized indicators, units, operand definitions, evidence roles, source dates/locators, limitations, filter scope, and model provenance. Reuse existing UTF-8 BOM/CRLF/formula-safe CSV serialization.
- Produce selected-region standalone HTML with CIVX identity, all numerical evidence, bibliography, limitations, a CSP-hashed native print action, and a readable A4 layout. Browser Save as PDF completes the private numerical report; the CLI does not itself generate a PDF binary.
- Enforce local output outside the repository through realpath/symlink checks, private random directories (`0700`), and CLI-written CSV/HTML (`0600`). Expose no route, client authorization toggle, server port, public download, or output-path override. Operators must save browser-generated PDFs in a controlled location.
- Clarify public actions as **Unduh CSV identitas** and **Cetak identitas / PDF**, including the Methodology instruction. Do not change public serialization, print payloads, release flags, scoring, source datasets, dependencies, routes, or the approved shared notice.

### Exercised verification

- `npm test`: **369 passed**, zero failed/skipped/cancelled/todo; 24 new behavioral tests cover numerical fidelity, filters, zeros/nulls, full precision, formula injection, CSV parsing, malformed input, metadata/source roles, HTML injection/unsafe URLs, CSP, filesystem containment/permissions, and real CLI execution. `npm run lint` and `npm run build` pass, including strict TypeScript and **36 generated pages**.
- Run the actual CLI for all **27 regions** and a Kota Bandung search/type selection. Check `0700` directories and `0600` generated files outside the repository.
- Open the resulting standalone `file://` report in Chromium and verify **43 exact numerical data bindings** against the facade: one overall score, six dimensions, and raw/normalized values for all 18 indicators. Exercise the native print button by keyboard and observe `beforeprint`.
- Inspect report widths **320, 390, 768, 1024, and 1440px** with no horizontal overflow, 18 indicator sections, six dimension rows, and no loaded network assets or runtime/console errors.
- Generate and visually inspect a tagged **23-page A4** numerical PDF for Kota Bandung. Keep the full six-dimension summary on its first page, preserve all 18 raw indicator values in extracted text, and verify the `≤7.2 m²` source comparator visually. PDF text extraction can reorder comparison glyphs; visual rendering and source HTML retain the original comparator. No physical printer, visible OS save dialog, or formal PDF accessibility certification is claimed.
- Check public Explore, Region Detail, and Methodology reporting controls in light/dark themes at **320px and 1024px**: 12 combinations, no overflow or application errors. Download the actual filtered public CSV by keyboard; its **790 bytes match baseline exactly**. Public print still hides the complete analytical screen/peer section and retains six metadata rows; resulting PDF text matches baseline exactly.
- Confirm private-report module/scope/column markers are absent from built application assets, and requests for private scripts, analytical API/output names return **404**. Generated numerical CSV/HTML/PDF/screenshots stay outside the repository.
- Frozen score and insight SHA-256 values match the pre-change baseline: `47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5` and `ffd92543c6387c981d2647c8ed55bd3abb7f7c4e9b5b91d4a74fab81999d6345`.

### Remaining authorization and QA gates

Full numerical public CSV/PDF is **not authorized or available**. `SCORED_NOT_RELEASED`, `INSIGHTS_NOT_RELEASED`, and `productionIntegrationAuthorized: false` remain unchanged. Owners must document source-specific redistribution rights, release approval for the exact score model/artifact and CSV/PDF scope, a production-integration decision, and a reviewed server-side distribution contract. Insight approval remains separate; these reports exclude insights.

Existing on-screen numerical pages still require local/access-controlled review; disclaimers do not authorize open deployment or prevent copying/printing. Independent methodology/source and effective-boundary review remain project gates. Formal PDF accessibility, Firefox/Safari, physical devices/printers, and the visible OS save dialog remain unverified. No merge of PR #19, public deployment, or publication signoff is included.
