# CIVX Product

**Status:** Four-indicator 2023 Jawa Barat project release covers 27 complete kabupaten/kota records; independent review and publication-rights confirmation remain pending
**Current presentation:** Existing Home and Explore surfaces display release-derived counts, search/sort, compact scores, indicator previews, score distribution and published median; region detail preserves sourced observations and contributions. This is broader geographic coverage under the same methodology, not a new index or official BPS ranking.
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

- interactive Java map with explicit data-coverage and boundary states;
- region detail pages with trends, indicator histories, and source change notes;
- side-by-side comparison of comparable regions and periods;
- saved views and shareable release-specific links;
- release-to-release change and revision explanations;
- richer uncertainty and sensitivity exploration;
- source update monitoring and data-quality alerts;
- documented scenario analysis, if a defensible scenario model is approved;
- accessibility, localization, and broader geography coverage.

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
