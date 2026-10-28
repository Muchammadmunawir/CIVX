# CIVX Data

**Status:** The current CIVX release uses one complete 2023 core contract across all 27 Jawa Barat kabupaten/kota. §10 supersedes the historical four- and five-input release descriptions.
**Geographic unit:** `kabupaten/kota` (Indonesian regencies and cities)

## 1. Data policy

CIVX may use public data only when its publisher, definition, geography, period, unit, access path, revision behavior, and usage terms can be documented. Current eligibility decisions are in §10 and [METHODOLOGY-CURRENT.md](METHODOLOGY-CURRENT.md); §8 preserves the original source review.

CIVX must never fabricate, silently interpolate, silently substitute, or present an unverified value as a production observation. Synthetic fixtures may be used later for software tests only when clearly labeled and excluded from production releases.

A source's availability does not establish that it is comparable or suitable for index input.

## 2. Proposed indicator groups

The following are **other candidate indicators** for future assessment; the four selected release inputs are in §8. Listing candidates does not imply comparable kabupaten/kota coverage.

| Candidate group | Example indicators to assess | Main comparability questions |
| --- | --- | --- |
| Economic and household pressure | poverty rate, depth/severity measures, expenditure or income measures, food-price context | Same poverty line/definition, survey method, price basis, period, and denominator? |
| Employment | unemployment rate, labor-force participation, informal employment, vulnerable employment | Same working-age definition, labor concept, survey coverage, and period? |
| Education | school participation, completion, literacy, student-teacher or facility access measures | Same age cohort, education level, denominator, and reporting completeness? |
| Health | health-facility access, selected morbidity or nutrition measures, maternal/child indicators | Same case definition, population basis, facility coverage, and publication method? |
| Basic services and infrastructure | drinking-water, sanitation, electricity, internet, road or transport access | Same service definition, household/unit basis, and urban/rural coverage? |
| Demographic and environmental context | population density, dependency context, disaster or environmental exposure where suitable | Same boundary, reference date, event definition, and exposure denominator? |

Indicator count follows validation, not a target. Only a complete common core enters the current release; other observations remain context, advantages or rejected candidates.

## 3. Candidate public data sources

These are source classes and candidate publishers to investigate. Every production source requires a source review record.

| Candidate source | Possible role | Required verification |
| --- | --- | --- |
| BPS / Statistics Indonesia publications and official access channels | Core social, economic, demographic, labor, education, health, and poverty statistics | Indicator definition, table metadata, kabupaten/kota coverage, revision status, access terms, and period meaning |
| Satu Data Indonesia and government data catalogs | Discovery and possible cross-agency datasets | Original publisher, authoritative version, update history, license, and reproducibility |
| Relevant ministry and national-agency portals | Sector-specific administrative indicators | Collection method, reporting completeness, geography codes, denominator, and change history |
| Provincial and kabupaten/kota open-data portals | Local detail or corroboration | Publisher authority, consistent definitions, update schedule, and boundary basis |
| Official administrative/geospatial references, including relevant government boundary sources | Region registry and boundary/reference metadata | Official codes, effective dates, splits/mergers, geometry/version, and legal or usage terms |
| Research or civil-society publications | Context, validation, or candidate indicators | Primary source, methodology, licensing, and whether the measure is suitable for index input |

A secondary source may help locate data, but the primary publisher is preferred for production input whenever available.

## 4. Coverage eligibility rules

A region-indicator-period observation is eligible only when all applicable checks pass:

1. The source and dataset have an identified publisher and stable locator.
2. The observation is published for a recognized `kabupaten` or `kota` identifier.
3. The geography and boundary/reference version match the CIVX region registry.
4. The period and granularity match the approved release window.
5. The definition, unit, denominator, and direction are documented.
6. The value passes type, range, duplicate, and referential-integrity checks.
7. The observation is comparable with the selected comparison set.
8. The source's revision and publication status are recorded.
9. The region meets the release's minimum indicator coverage threshold.

“Not available,” “not applicable,” “withheld,” “incompatible,” and “failed validation” must remain distinct statuses. Missing must never become zero.

The current release requires every configured core observation for every one of the 27 regions. An invalid or missing core input withholds the whole score; no partial result or per-region reweighting is permitted.

## 5. Data quality and confidence inputs

Data quality is assessed separately from the CIVX pressure value. The data release should record at least:

- source authority and primary/secondary status;
- definition and unit clarity;
- geographic and temporal comparability;
- completeness and missingness reason;
- recency and publication/revision state;
- validation results and known breaks;
- denominator and population-basis integrity;
- acquisition reproducibility.

These inputs can support a future confidence diagnostic; the 2023 release intentionally publishes no numeric confidence score or labels. Failed eligibility withholds the index.

## 6. Raw versus processed data strategy

### Raw layer

Preserve the source response or file as acquired, with:

- source and dataset identifiers;
- locator and access method;
- retrieval timestamp;
- publisher release/update date;
- checksum or equivalent immutable reference where practical;
- license and attribution notes;
- acquisition status and failure details.

Raw artifacts are immutable within a release. A corrected or revised source creates a new release record.

### Processed layer

Normalize raw observations into a canonical model while retaining a link to the raw artifact. Processed records should contain:

- `source_id`, dataset/release ID, and source locator;
- `indicator_id`, definition, unit, and direction;
- `region_id`, region type, province, and boundary/reference version;
- period and period granularity;
- raw value, normalized value where applicable, and derived-status metadata;
- quality status, missingness reason, and validation results;
- data-release, methodology, and computation versions.

Processing must be reproducible from raw artifacts, versioned configuration, and code. Raw values must not be overwritten by normalized or scored values.

### Publication layer

Publish only approved, versioned derived outputs. A published score must link back through processed records to the raw source artifact. Retain exclusions and validation results so an analyst can understand why a value is absent.

## 7. Data decisions for broader releases

- Expand reviewed geographic coverage only after auditing each region's complete rows and boundaries.
- Establish a refresh/revision protocol and independent review of reference extrema and input transcriptions.
- Resolve the BPS book's reproduction restriction before any redistribution of the full PDF.
- Consider whether a future release should support partial coverage; this one requires four of four.


## 8. Jawa Barat 2023 competition release source review

The release covers **all 27 Jawa Barat kabupaten/kota**. All observations are transcribed from the 2023 columns of four BPS tables in [*Provinsi Jawa Barat Dalam Angka 2024*](https://jabar.bps.go.id/id/publication/2024/02/28/35ffe2d35104b39feb577e8f/provinsi-jawa-barat-dalam-angka-2024.html), publication 32000.24001, revised 29 February 2024. [Original PDF download](https://webapi.bps.go.id/download.php?f=AQADdxpu9GSSGVFQgng5pYyTGigK3q-V5Io_qhChet4CMxry7bE7Kv4VzCn64iAiIj4MgQlS_myNdpmSwEDTfk3ejH1RPMhmIHuWViDP5-DDP5E09Fw4On73vdACtMkpg6SZlaLWhDE8fDMc6rVCyiVOdcrr8IrzPdNXcLci2LqsOnBq4MaArWKf0Qq84UKw7X6Mg3ISxJErC8TGrO6VI2xFX2v3ycG0_8qUAZCl663iKionLUi6AHZpfLHid6v3UUNlLnPNCQMqrwElvXMolsZyGM_FtrjX958Eh_7rwP8f); retrieved 26 October 2026; 11,915,084 bytes; SHA-256 `500e82ecd02b081be83d884add8408fccc8fb1d57665f5b3e62a17ebc9f55f81`. A raw copy is retained locally for verification but **must not be distributed with this repository**: the book's copyright notice prohibits commercial reproduction without BPS permission. [BPS website terms](https://jabar.bps.go.id/id/term-of-use) allow attributed data use; their relation to the book's separate restriction needs legal/manual review. Cite publication title, access date, and original URL when publishing derived observations.

| BPS table (printed/PDF page; sample of 27 verified records) | 2023 Kabupaten Bogor | 2023 Kabupaten Bandung | Unit, source, timing |
| --- | ---: | ---: | --- |
| 4.6.2 poor residents (307/383) | 7.27 | 6.40 | % of population; BPS Susenas, 2023 (provincial companion table points to March) |
| 3.2.16 open unemployment (147/223) | 8.47 | 6.52 | % of labor force; BPS August Sakernas 2023 |
| 4.6.5 IPM (311/387) | 73.02 | 74.03 | 0–100 index points; BPS 2023 LF SP2020 basis |
| 4.3.8 households with improved sanitation (261/337) | 71.49 | 66.67 | % of households; BPS Susenas 2023 |

No values are borrowed from the retired density pilot. All 27 regions have been cross-checked row by row across the same four source tables, distinguishing the 18 kabupaten from the nine kota where names repeat. Each has four valid 2023 observations; **27 attempted, 27 published, zero excluded and zero validation failures**. The 2023 source windows differ between poverty, unemployment, IPM, and sanitation; cross-indicator use is a declared annual snapshot, **not** a same-month measurement. A revision, missing row, mismatched year/unit, unknown region, or failed raw-artifact checksum prevents publication rather than silently substituting data.

`data/raw/civx-jabar-2023.json` contains the audited numeric transcription and source manifest; `data/methodology/civx-jabar-2023.json` fixes scoring rules and reference extrema; `scripts/build-civic-release.mjs` verifies the locally acquired PDF size/checksum, checks region identity and observations, and writes `data/processed/civx-jabar-2023.json` with published records and an exclusion summary. With the BPS PDF downloaded to the ignored path `data/raw/bps-jabar-dalam-angka-2024.pdf`, run `npm run data:build` using Node 26. The committed processed release permits normal web builds without the copyrighted PDF; regeneration requires the original source artifact. Independent source transcription/methodology review and confirmation of publication/redistribution rights remain open before any formal public release.

## 9. Geographic display geometry (separate from scoring)

The Explore map uses **2020-represented ADM2 boundaries**, not inferred 2023 statistical boundaries. Source: [geoBoundaries gbOpen Indonesia ADM2 metadata](https://www.geoboundaries.org/api/current/gbOpen/IDN/ADM2/) (`IDN-ADM2-22746128`, build 12 December 2023, source data updated 19 January 2023), attributed there to BPS, World Food Programme and OCHA ROAP. Its stated [CC BY 3.0 IGO license](https://creativecommons.org/licenses/by/3.0/igo/) permits attributed sharing and adaptation. CIVX does not claim government endorsement.

`scripts/build-jabar-map.mjs` reads the commit-pinned [simplified source GeoJSON](https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09/releaseData/gbOpen/IDN/ADM2/geoBoundaries-IDN-ADM2_simplified.geojson) (SHA-256 `146653d488331086ddc43d159a261b01ea6dd08c7ed422e34a9886c3c690430c`), checks its checksum, uniquely matches the published BPS-coded names to source `shapeID`s, and projects only the 27 shapes into `data/geography/jabar-adm2-2020.json`. The local file is **adapted display geometry**, not an input to validation, normalization or scoring. It is rendered as lightweight SVG without a mapping package or runtime source fetch.

The geometry's represented year (2020) and the CIVX observations' period (2023) differ. The map is for approximate regional orientation only: coastlines, district boundaries and tiny city shapes may not match a certified 2023 boundary register. Matching names and 2019 BPS identifiers does **not** establish a formally approved 2023 crosswalk; review effective boundaries before using the map for area measurements or official administrative claims. The regional list remains the equivalent non-map access path.

## 10. Unified current release

One production release, `data/processed/civx-jabar-2023-current.json`, powers every application surface through `src/lib/civx/current.ts`. Historical four- and five-input releases remain reproducible artifacts, not selectable products. Their audit decisions apply to those releases; current decisions explicitly supersede them.

The common core retains poverty, unemployment, HDI, improved sanitation and improved drinking water, and adds Puskesmas availability per 100,000 residents, published DBD incidence per 100,000 residents and the official BNPB 2023 disaster risk index. All eight have 27 administrative-region observations. The exact configuration, weights, extrema and provenance are versioned, never embedded in React.

New source evidence:

- BPS *Provinsi Jawa Barat Dalam Angka 2024*, table 4.2.7, printed 235–237 / PDF 311–313: total Puskesmas, originating from Dinas Kesehatan. Explicit published totals are the numerator. Subcategory dashes mean **negligible** under this book's legend, not automatically missing or zero; original symbols remain recorded. The pipeline does not impute them.
- Dinas Kesehatan [*Profil Kesehatan Jawa Barat Tahun 2023*](https://app-diskes.jabarprov.go.id/drive/s/TyZTzEqnm5TfrM4/download/Profil%20Kesehatan%20Jawa%20Barat%20Tahun%202023.pdf), appendix table 1 / PDF 180: exact 2023 population. These counts agree with the rounded BPS SP2020-based projection series. The pipeline records numerator, denominator, formula, derived rate and both source references.
- BPS table 4.2.6, printed 233–234 / PDF 309–310: the publisher's **DBD incidence**, not raw cases or a replacement rate. All 27 share the same table, year, unit and indicator definition. Different case/population tables do not reproduce every rate; their unresolved population vintage remains a visible limitation, not a fabricated denominator.
- BNPB [*IRBI 2023*](https://inarisk.bnpb.go.id/pdf/BUKU%20IRBI%202023.pdf), PDF/printed page 101: all 27 Jawa Barat regional risk indices. This measures modeled **disaster risk**, not actual disaster impact. Source methodology and source-artifact fingerprint remain linked to the release.

Road condition remains Context. The audited UPTD series represents the provincial managed road network located within regions, not a universal measure of kabupaten/kota-owned or all roads. Network/authority definitions and denominator totals conflict across inspected sources; 27 place labels alone do not establish comparability. No damaged-road proportion or infrastructure score is fabricated.

`data/raw/current/` holds current raw transcriptions and eligibility findings. The current builder validates the common cohort, observations, reference endpoints and derived rates before scoring. Strict `npm run data:build` verifies original source bytes; explicit `npm run data:replay` verifies frozen audited-input/policy hashes and all available original artifacts, recording unavailable original re-verification honestly. The current release uses replay because the health-profile original could not be reacquired. BPS, IRBI and local capability snapshots were byte-verified; the unchanged prior health-profile transcription remains linked to its archived fingerprint. Sources exposes every artifact's build-verification receipt. Restricted originals remain outside redistributed outputs.

Context and Regional Advantages reuse the existing dated evidence and classifications. Density never carries a deprivation direction. Historical traffic keeps its real period; police-jurisdiction crime remains incompatible geography; partial mobility/transit/digital/healthcare evidence stays non-scoring. Whoosh `3217`, Kertajati `3210` and Cisumdawu `3211` remain the three verified positives. Missing optional evidence means no comparable verified data, not absence.

Earlier raw/methodology/processed files remain archived. `data/releases/civx-v1-integrity.json` pins the original four-input artifacts, including `docs/METHODOLOGY.md`; they remain unchanged. The five-input audit and method are retained in [V2-SOURCE-AUDIT.md](V2-SOURCE-AUDIT.md) and [METHODOLOGY-V2.md](METHODOLOGY-V2.md). Rights clearance, independent review and certified effective-boundary compatibility remain unresolved.

## 11. Socioeconomic and Education audit — proposed next model

The [2023 evidence audit](SOCIOECONOMIC-EDUCATION-AUDIT-2023.md), accessed 28 October 2026, verifies all ten requested candidates against actual records for all 27 Jawa Barat kabupaten/kota. Raw evidence lives in `data/raw/audit-jabar-2023/`; descriptive statistics, all within-dimension correlations and input fingerprints live in `data/processed/audit-jabar-2023-statistics.json`. These files are audit-only and are not production inputs.

The proposed HDI-free Socioeconomic set is poverty, TPT, expenditure Gini and real purchasing-power-adjusted annual expenditure per capita. The proposed Education set is RLS25+, HLS and upper-secondary APM. TPAK, matching APK, AMH15+ and nominal monthly expenditure remain context. Full IPM should become context rather than a direct scoring input in that next model. These recommendations do not change the current release, weights, normalization, frontend or scoring implementation.

All candidates have 27/27 numeric 2023 records and no missing values. No within-dimension candidate pair reaches absolute Pearson r of 0.85; RLS–HLS reaches 0.820162. Literacy shows ceiling compression. The report preserves the live enrollment unit-label defect, Gini revision-history limit, provincial TPAK discrepancy, within-year reference-period differences and missing district uncertainty estimates. Admission and future weighting must not hide those qualifications.

## 12. Basic Services audit — proposed next model

The [2023 Basic Services evidence and methodology audit](BASIC-SERVICES-AUDIT-2023.md), accessed 28 October 2026, resumes the interrupted research from its saved evidence. It preserves 91 source/diagnostic series, 88 complete 27-region panels and 51 failed or qualified investigations. Raw observations and source receipts live in `data/raw/basic-services-audit-2023/`; descriptives, ten admission gates, 903 correlations and input fingerprints live in `data/processed/basic-services-audit-2023-statistics.json`. None is a production input.

The proposed hierarchy retains improved sanitation, improved drinking-water-source access and main Puskesmas per 100,000 residents. It adds the published household crowding band **≤7.2 m²/person** and **any health-insurance ownership**, computed as 100 minus the explicit no-insurance share. All five have 27/27 official 2023 observations, no missing values and no pair with absolute Pearson r ≥0.85. The recommended subdimensions are Water & Sanitation, Healthcare Service Access & Capacity, and Housing Crowding. No weights are assigned.

Puskesmas is a supply proxy, not observed travel access or service quality. Its current formula and all 27 numerator/denominator pairs were verified without rebuilding production. The original health-profile PDF was successfully reacquired during this audit and matched its archived fingerprint; this does not rewrite the current release's historical replay receipt described in §10.

Electrical lighting is saturated. Personal internet use is not household broadband access. Adequate housing directly nests water, sanitation and crowding, so it remains an alternative context bundle rather than an extra independent score. Hospital/staff alternatives, water-quality labels and administrative waste percentages retain source-definition and denominator caveats. Three incomplete diagnostic panels retain 21 expected gaps; no gap is filled with zero or another year.

The report records every recommendation, failed acquisition, source conflict, uncertainty limit and explicit user question. The current frontend, scoring implementation, production indicators, methodology configuration and weights remain unchanged. Independent review, rights, uncertainty, effective geography and final release decisions remain separate gates.

## 13. Public Health audit — proposed next model

The [2023 Public Health data and methodology audit](PUBLIC-HEALTH-AUDIT-2023.md), accessed 29 October 2026, continues the same worktree and recovers the completed infectious-disease, nutrition, maternal/child and NCD investigations without restarting their research. Seven evidence/protocol files live in `data/raw/public-health-audit-2023/`. The independent research script `scripts/analyze-public-health-audit-2023.mjs` generates processed observations, descriptive statistics, twelve-gate admission records, 210 Pearson/Spearman pairs and the full fifteen-column candidate register under `data/processed/public-health-audit-2023-*`.

The audit preserves 70 source/diagnostic panels, 64 complete panels, 1,858 numeric observations and 32 explicit missing/ambiguous cells. These are not 70 proposed scoring indicators. The recommended next-model CORE set is SKI 2023 stunting, SKI 2023 wasting, Susenas March 2023 activity-limiting morbidity, and BPS 2023 life expectancy at birth on the LFSP2020 basis. All four have 27/27 observations with no missing cells; no CORE pair reaches absolute Pearson or Spearman correlation of 0.85. Standalone life expectancy assumes the earlier audit's HDI-free next methodology and must not be stacked beside aggregate production IPM.

Current published DBD receives **REVIEW**: retain it unchanged in production, but recommend **CONTEXT ONLY pending matched-case/population reconciliation** for the next model. BPS exact 2023 population and Dinkes reported cases do not reproduce most published rates; the separately derived reporting diagnostic is not a correction or production replacement. TB/HIV/AIDS/leprosy, pneumonia and other infectious reports retain detection, age, geography and denominator caveats. Maternal/infant registered-event ratios use live births, never general population, but unresolved registration and domicile exclusions prevent true-mortality CORE admission. No trustworthy 2023 27-region NCD outcome panel was admitted from the inspected sources.

The proposed admitted subdimensions are Nutrition and General Population Health. Infectious Disease and Maternal & Child Outcomes remain explicit context domains, not zero scores. Immunization and preventive service delivery belong primarily in Basic Services / Health System Performance. No final weights, scoring cutover, new production indicator, frontend change or recommendation-engine change is authorized. The generator, independent numerical smoke, deterministic `--check`, `npm run lint` and `npm run build` passed; the build generated 37 pages. Independent review, source-definition repairs, uncertainty, rights, effective geography and release approval remain separate gates.

## 14. Resilience audit — proposed Disaster Pressure construct

The [2023 Resilience data and methodology audit](RESILIENCE-AUDIT-2023.md), accessed 29 October 2026, distinguishes hazard, exposure, vulnerability, realized impact and adaptive capacity. It recommends **Disaster Pressure / Tekanan Bencana**, explained as modeled disaster risk, rather than claiming comprehensive regional resilience or silently inverting capacity. This is a research recommendation, not a production name or scoring change.

Retain the overall BNPB IRBI 2023 index as the smallest defensible CORE. Its 27 official values were independently checked against both the original PDF and official HTML, with no difference from production observations. Hazard/vulnerability retain the disclosed IRBI 2013 / KRB 2011 baseline; capacity enters through IKD. Overall risk is not a new 2023 hazard census, an annual loss rate or inverse capacity alone.

Raw evidence, source receipts, acquisition limits and protocol live in `data/raw/resilience-audit-2023/`. `scripts/analyze-resilience-audit-2023.mjs` generates the research observations, full candidate register, fourteen-gate admission findings, descriptive statistics and Pearson/Spearman diagnostics under `data/processed/resilience-audit-2023-*`. These outputs do not feed production.

Annual events and impact reports remain non-scoring context. More recorded disasters does not establish worse resilience. Resident-population normalization cannot repair ambiguous person-event numerators, and damaged dwellings require a defensible housing/exposure denominator. IKD, hazard-specific risk and vulnerability/exposure components must not be stacked beside overall IRBI as independent CORE indicators. No final weights, new indicators, scoring cutover, UI change, Public Health decision or recommendation feature is authorized.
