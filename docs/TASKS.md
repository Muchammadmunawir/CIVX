# CIVX Tasks

**Status:** 27-region Jawa Barat 2023 project release supports geographic orientation and same-release comparison; 2020 boundary crosswalk review, independent method review and rights clearance remain gated
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

