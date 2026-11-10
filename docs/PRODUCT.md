# CIVX Product

**Status:** One CIVX frontend now consumes the reviewed **2023, 27-region, 18-indicator, six-dimension** product layer. The Figma integration decision in §12 supersedes older presentation contracts below.
**Release boundary:** Frontend integration is authorized; frozen model/insight release flags and publication-approval requirements remain unchanged.
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

## 12. Reviewed product-layer frontend integration

The user-authorized Figma integration supersedes the eight-input `current.ts` presentation and contextual-dialog flow. Canonical routes remain `/`, `/explore`, `/regions/[id]`, `/compare`, `/methodology`, and `/sources`. Both map and table links open the same standalone regional detail page.

All product surfaces use `src/lib/civx/product-2023.ts`: 27 regions, 18 CORE indicators, six equally weighted dimensions, and one complete 2023 model. Higher CIVX means higher relative pressure within that cohort. No public rank, score sort, policy status category, province average, year selector, or time trend is presented.

The six supplied Figma references define layout and visual style only. Structural summaries replace mock province/best/worst cards; six dimension bars replace the mock trend. Controlled insight records remain unchanged. Sources and Methodology disclose the actual evidence and model.

CORE and the seven audited CONTEXT datasets remain separate. Context availability, zeros, individual sites, actual dates, and non-comparison restrictions survive presentation. The earlier Regional Advantages contract is not part of this reviewed product facade and is not imported from the old model.

The integration does not release the frozen model, certify source rights, authorize new periods, or change source evidence. Implementation and verification details: [PRODUCT-INTEGRATION-2023.md](PRODUCT-INTEGRATION-2023.md#figma-frontend-integration).

## 13. Phase 2.1 presentation refinement

Home and Explore default to **Skor Keseluruhan CIVX** from the existing 2023 pressure scores. Explore retains the six CORE dimension layers, fixed 0–100 mapping, selection, filtering, and canonical detail navigation. The map introduces no categories, ranking, official classification, individual stress measurement, or policy recommendation.

The original light-mode palette, typography, and page structure remain authoritative. Map-specific semantic tokens adapt the existing indigo identity to each theme. A scoped accessible theme menu fixes option contrast. Progressive once-only entrances and restrained state transitions respect reduced motion and leave content accessible without JavaScript.

This phase preserves the latest team Home summary cards, including their inverted display index, province mean, and status/priority labels. Those pre-existing presentations still require separate methodology review before submission; the choropleth does not inherit them. No source, score, normalization, weight, CORE/CONTEXT separation, or release-authorization flag changes.

## 14. Phase 3 reporting and transparency

This phase supersedes the unresolved Home presentation note in §13. Home now shows model coverage and reference year instead of an inverted quality index, provincial aggregate, arbitrary 70/50 status thresholds, best-performing region, or policy priority. The model only defines relative pressure; these removed claims had no reviewed methodological basis. The pressure choropleth and existing animation behavior remain unchanged.

Explore provides **Unduh CSV** for the full name/type-filtered set, independent of pagination and map layer. Public scope is identity, year, attribution, interpretation, and reference links only. Scores, indicators, insights, CONTEXT observations, and source publications are excluded because public release and source rights remain unapproved. The UI, CSV, and methodology explain this restriction; absent score columns do not mean missing data or zero.

Region detail provides **Cetak / Simpan PDF** through browser-native print, with A4-specific styling. The report contains CIVX branding, identity, year, six dimension/indicator references, source bibliography, model/version, and explicit limitations. Unreleased numerical results are not printed. Both actions use existing styles, keyboard controls, accessible descriptions, and useful failure feedback.

Full numerical export remains blocked until a documented public-release and rights decision changes the reviewed contract. Existing frontend integration, a download click, or a print request does not grant that permission.

The existing team Compare presentation remained outside the Phase 3 Home correction. The Phase 4 cutover below supersedes this historical concern.


## 15. Phase 4 stabilization and release review

Compare now displays unchanged facade pressure scores for the overall result and all six CORE dimensions. Higher means higher relative pressure, consistently with Home, Explore, and Region Detail. The inverted quality index, provincial mean, arbitrary quality thresholds, proxy dimension names, and best/priority badges are removed. The engine supplies absolute distances and signed overall A-minus-B differences; the UI does not compute new scores or differences. Same-region ties and invalid-input recovery retain their existing contracts.

Every route carries a shared Indonesian preview notice with a link to model status. This is disclosure, not access control or release authorization. The unreleased score/insight flags, source-rights restrictions, identity-only CSV, and metadata-only regional A4 report remain unchanged.

The current numerical display still conflicts with public-release restrictions if deployed openly. Other pages can still be copied or printed with numerical content. Keep review local or access-controlled; do not deploy publicly, redistribute numerical outputs, or call the model approved until rights and release signoff are documented. No major feature is silently removed to conceal this governance gap.

