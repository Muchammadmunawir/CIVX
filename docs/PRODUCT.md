# CIVX Product

**Status:** One current product: **CIVX — Jawa Barat 2023**, using a common complete analytical contract for all 27 kabupaten/kota.
**Current presentation:** Home, Explore/map, regional records, Compare, Methodology and Sources consume one current processed release. Context Signals and Regional Advantages remain separate, non-scoring evidence. Earlier release descriptions below are historical unless superseded by §11.
**Product:** CIVX (Civic Index)

## 1. Problem statement

Public data about Indonesian regions is spread across statistical publications, government portals, administrative datasets, and sector-specific reports. The data uses different units, definitions, geographic boundaries, reference periods, and update schedules. A person can find individual statistics but cannot easily determine whether regions are comparable or what evidence supports an apparent pattern.

CIVX addresses this problem by turning approved public observations into transparent, versioned regional pressure insights. The product must show the underlying indicators, source definitions, data coverage, transformations, and limitations rather than hiding them behind an unexplained rank.

CIVX is decision support. It is not an official government ranking, a causal model, a prediction system, or an automatic basis for funding, enforcement, eligibility, or individual-level decisions.

## 2. Target users

- **Researchers and civic analysts:** explore regional patterns and test hypotheses.
- **Journalists and investigators:** verify claims and trace results to primary sources.
- **Civil-society organizations:** identify regions or issues that warrant further investigation.
- **Public-sector and community stakeholders:** use a common evidence base while retaining local context and judgment.
- **Students and developers:** learn reproducible public-data engineering and transparent index design.

## 3. Value proposition

CIVX provides one place to:

1. compare selected kabupaten/kota using a documented and consistent method;
2. see which indicators and dimensions contribute to a regional pressure result;
3. distinguish observed source values from normalized and aggregated values;
4. check whether a comparison is supported by sufficient, comparable data;
5. reproduce or challenge a result using its source, release, and methodology versions.

The value is transparency and comparability, not an assertion that one score fully describes a region.

## 4. Core questions CIVX should answer

- Which selected kabupaten/kota show higher modeled pressure under the current release definitions?
- Which dimensions and indicators drive a region's result?
- How does a region compare with the approved comparison set and reference period?
- What source, definition, unit, geography, and transformation produced a value?
- How complete, current, and comparable is the evidence?
- How sensitive is the result to missing data, normalization, or weighting choices?
- What can the result support, and what can it not support?

## 5. Geographic scope

The initial target is **selected cities and regencies across Java**, represented as the Indonesian administrative unit **kabupaten/kota**:

- `kabupaten` means regency;
- `kota` means city;
- each included region must have a stable official identifier, type, province, boundary/reference version, and effective period;
- the first release is not assumed to cover every kabupaten/kota in Java;
- inclusion depends on public-data availability, definition quality, geographic alignment, temporal coverage, and comparability.

The selected region list and exclusion reasons must be published with each data release. Display names are not sufficient identifiers.

## 6. MVP features

The MVP is a small, inspectable read experience built only after the data and scoring decisions are approved. It should include:

1. **Release and scope context** — selected regions, period, data release, methodology version, and coverage notes.
2. **Regional pressure overview** — an aggregate result or explicit unavailable state, never a silently incomplete score.
3. **Dimension and indicator breakdown** — component values, direction, contribution, and source links.
4. **Comparable filtering** — filter by province, kabupaten/kota type, period, or approved release without mixing incompatible data.
5. **Data-quality indicators** — missingness, completeness, confidence, revisions, and comparability warnings.
6. **Methodology and provenance** — plain-language explanation of formulas, definitions, sources, and limitations.
7. **Basic region selection** — select a region and period for inspection; no policy recommendation is implied.

These are product requirements, not an instruction to build the UI in this documentation phase.

## 7. Future features

After the MVP has demonstrated reliable data and scoring:

- geographic exploration beyond the current Jawa Barat release, only after approved coverage and boundary review;
- region detail histories and source-change notes for approved comparable periods;
- comparison across additional approved periods; the current two-region same-release tool is already available;
- saved analytical views; current regional URLs and comparison pairs are already shareable;
- release-to-release change and revision explanations;
- richer uncertainty and sensitivity exploration;
- source update monitoring and data-quality alerts;
- documented scenario analysis, if a defensible scenario model is approved;
- formal accessibility evaluation, localization and broader approved geography coverage.

Future features must not expand coverage or visual polish before the underlying data and methodology are trustworthy.

## 8. Product principles

- **Evidence before coverage:** exclude weak evidence rather than conceal it.
- **Traceability by default:** every displayed result links to an observation, source, and transformation.
- **Comparability over convenience:** incompatible regions, periods, units, and definitions are not silently compared.
- **Observed versus derived:** source values, index values, interpretations, and policy judgments remain distinct.
- **Uncertainty is visible:** missingness, revisions, confidence, and sensitivity are product information.
- **Version everything that changes results:** sources, data releases, methodology, and computation.
- **Small milestones:** each phase should produce a reviewable artifact before the next phase begins.

## 9. Product decisions requiring approval

- First-release user priority: exploration, reporting, monitoring, or prioritization.
- Operational definition and dimensions of “regional pressure.”
- Initial region list and minimum coverage threshold.
- MVP indicator set and publication cadence.
- Whether the MVP shows an aggregate index, a dimension profile, or both.
- Language and labels for unavailable, partial, low-confidence, and non-comparable results.
- Product owner and methodology/data release approvers.

## 10. Current interaction model

Explore is the primary workspace. Its scope stays the 2023 Jawa Barat release: 27 published kabupaten/kota with the same validated core indicators, fixed reference ranges and explicit dimension weights. Counts, inputs and map layers derive from the current methodology. Search and category filtering affect the map and regional list, never normalization or weights.

Opening a region from Explore dims the existing workspace and presents a substantial accessible dialog, or a near-fullscreen sheet on mobile. Closing preserves filters and context. Back closes and Forward reopens; refresh or direct access shows the standalone record. Explicit close animates; browser history remains immediate. The native dialog and explicit Tab wrap retain focus, Escape dismisses, background scrolling is locked and focus returns to the originating control.

Theme preference is a compact header control, not a settings system. Light and Dark use intentional surface hierarchies and legible map boundaries; System follows OS changes. Preferences persist when local storage is permitted. Motion communicates inspection, selection, navigation and dismissal, not decorative scrolling; reduced motion preserves all actions without travel.

Home remains an introduction and release snapshot rather than a second exploration workspace. Compare emphasizes descriptive numerical differences, never causes or significance. Methodology and Sources remain the evidence layer, with readable formulas, source-period and artifact details, section anchors and links back to the workspace.

Remaining limits include approximate 2020 display boundaries, independent source/method review, publication rights and optional evidence coverage. Weight sensitivity describes fine-order instability, not sampling uncertainty. No confidence diagnostic, additional geography/year, authentication or recommendation system is introduced.


## 11. Unified current product contract

This decision supersedes the separate v1/v2 product and route model. Users see **CIVX**, one **Civic Index**, and its scored dimensions. No release tabs or competing version navigation remain.

Canonical routes are `/`, `/explore`, `/regions/[id]`, `/compare`, `/methodology` and `/sources`. The regional hierarchy is region name, Civic Index/category, pressure dimensions, complete common core indicators, Context Signals, Regional Advantages and sources/provenance. Native disclosure keeps detailed evidence below the first viewport.

Only complete, source-validated 2023 administrative-region indicators can affect every region's score. Dimension budgets prevent indicator-count dominance. Unsupported dimensions have no zero score or map layer. The current policy and sensitivity decision are documented in [METHODOLOGY-CURRENT.md](METHODOLOGY-CURRENT.md).

Context includes density, traffic, mobility, crime and partial sector evidence, with actual coverage and geography states. Density has no automatic performance direction. Police jurisdictions do not become administrative regions.

Verified positives remain Whoosh in Bandung Barat `3217`, Kertajati in Majalengka `3210`, and Cisumdawu in Sumedang `3211`. Missing optional evidence means **No comparable verified data**, never no advantage or zero score. Advantages do not offset pressure.

Internal release IDs, methodology versions, source manifests, hashes and archived outputs remain available for reproducibility. [METHODOLOGY.md](METHODOLOGY.md), [METHODOLOGY-V2.md](METHODOLOGY-V2.md) and [V2-SOURCE-AUDIT.md](V2-SOURCE-AUDIT.md) document historical decisions, not alternative current products.
