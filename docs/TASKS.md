# CIVX Tasks

**Status:** 2023 Jawa Barat four-indicator project release expanded to 27 verified scores; external review, rights clearance, confidence expansion and new periods remain gated
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

- [ ] Define source, dataset, release, indicator, region, period, observation, score, confidence, and warning records.
- [ ] Decide whether the first release uses versioned files, a database, or both.
- [ ] Define the typed read contract consumed by Next.js.
- [ ] Add validation for IDs, units, periods, region types, release versions, and status fields.
- [ ] Write focused tests for missingness, comparability, revisions, and release boundaries.

**Deliverable:** documented canonical data model and sample contract based on approved data, not invented production statistics.

**Exit condition:** the web layer can consume one approved release without implementing scoring rules.

## 6. Stage 4 — Basic UI

Goal: provide the smallest useful read experience.

- [ ] Create the app shell and accessible navigation.
- [ ] Display release scope, methodology version, and data-quality status.
- [ ] Display a region overview with explicit unavailable/partial states.
- [ ] Display dimension and indicator components with source links.
- [ ] Add loading, error, empty, and no-comparable-data states.
- [ ] Keep data-fetching and display components reusable and strictly typed.

**Deliverable:** a basic overview experience over a real approved release.

**Exit condition:** a user can inspect a result without confusing modeled values with observed values.

## 7. Stage 5 — Map

Goal: add geographic orientation without implying unsupported precision.

- [ ] Approve boundary source, version, licensing, and rendering approach.
- [ ] Display only regions present in the selected release.
- [ ] Show unavailable, non-comparable, and low-confidence regions distinctly.
- [ ] Link map selection to the same release and period filters as the overview.
- [ ] Test keyboard, color, tooltip, and non-map alternatives.

**Deliverable:** a map view with provenance and accessible alternatives.

**Exit condition:** the map does not imply coverage or comparability where the release lacks it.

## 8. Stage 6 — Region Detail

Goal: explain one region over time and by component.

- [ ] Show region identity, type, province, boundary/reference version, and release context.
- [ ] Show indicator history only for comparable periods.
- [ ] Show component contributions, confidence dimensions, missingness, revisions, and source links.
- [ ] Explain changes without claiming causation.

**Deliverable:** a traceable region detail view.

**Exit condition:** a user can move from aggregate to raw source context and known limitations.

## 9. Stage 7 — Compare

Goal: support explicit, valid comparison.

- [ ] Allow comparison only across compatible release, period, geography, and indicator definitions.
- [ ] Show side-by-side components, not only aggregate ranks.
- [ ] Explain excluded indicators and non-comparable periods.
- [ ] Add sensitivity or stability context before emphasizing small differences.

**Deliverable:** a comparison flow that refuses or explains invalid comparisons.

**Exit condition:** comparisons cannot silently mix incompatible data.

## 10. Stage 8 — Polish

Goal: improve reliability and clarity after the analytical contract is stable.

- [ ] Improve accessibility, responsive behavior, and plain-language explanations.
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

At this earlier milestone, the project-defined index had no numeric confidence estimate or government endorsement, and a lightweight two-region comparison was available. The coverage and presentation cutover is documented in §14; map and confidence scoring remain deferred.

## 14. 2023 Jawa Barat regional coverage expansion

- [x] Verify four 2023 columns against the locally fingerprinted BPS PDF tables 4.6.2 (307/383), 3.2.16 (147/223), 4.6.5 (311/387), and 4.3.8 (261/337), separating identically named kabupaten and kota.
- [x] Attempt all 27 BPS-coded Jawa Barat regions; publish only 4/4-complete records and retain an exclusion summary. This dataset publishes 27; none excluded.
- [x] Reuse the exact fixed 2023 normalization bounds, original directions and weights, and existing scoring code without introducing a new method or source.
- [x] Give Explore compact release-wide search, sort, category, score, distribution, median and indicator previews; give region detail published-relative position, median comparison, component and source context.
- [x] Derive Home release facts and compact overview from the published release rather than a fixed two-record comparison.
- [ ] Obtain independent source-transcription/methodology review and confirm publication/redistribution rights before a formal external launch; no government endorsement is claimed.

Published-relative position and median describe the current CIVX model output, not an official BPS ranking; the 27-region normalization reference remains fixed regardless of display filtering.
