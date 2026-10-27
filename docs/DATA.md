# CIVX Data

**Status:** All 27 Jawa Barat kabupaten/kota have complete 2023 records in the four-indicator project release; external review and rights confirmation remain outstanding
**Geographic unit:** `kabupaten/kota` (Indonesian regencies and cities)

## 1. Data policy

CIVX may use public data only when its publisher, definition, geography, period, unit, access path, revision behavior, and usage terms can be documented. The four selected 2023 inputs are reviewed in §8; other candidate sources below are not approved production inputs.

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

The current index deliberately uses four documented indicators rather than maximizing the number of dimensions.

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

The 2023 release requires all four comparable observations per region, with no partial result; alternative coverage thresholds remain open for future releases.

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
