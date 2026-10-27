# CIVX Architecture

**Status:** 2023 Jawa Barat four-indicator release covers 27 complete regional records; source traceability and derived relative context available; map and historical expansion deferred

## 1. Existing project baseline

The repository is a small Next.js + TypeScript starter project:

- Next `16.4.2`;
- React `19.3.0` and React DOM `19.3.0`;
- TypeScript with `strict: true`, `noEmit: true`, and the `@/*` path alias to `src/*`;
- Tailwind CSS and ESLint already present;
- starter files under `src/app/`, with no CIVX data pipeline or Python code yet.

No packages are added by this foundation work. The target architecture below is a plan, not an assertion that the proposed directories or services already exist.

## 2. Architectural decisions

1. **Next.js is the web application boundary.** It owns routes, rendering, interaction, loading/error states, and presentation of released results.
2. **TypeScript is strict at the web boundary.** Data contracts should be typed and validated at ingress; UI code must not recalculate index rules.
3. **Python is a future data-processing boundary.** It owns acquisition, normalization, validation, scoring, release manifests, and reproducible batch outputs. It is not installed or implemented in this phase.
4. **The published data release is the source of truth for scores.** The web layer reads versioned derived artifacts or an API backed by them.
5. **Raw, processed, and published data remain distinct.** Each derived value retains provenance to its input artifact, configuration, methodology, and computation version.
6. **The pipeline is release-oriented before it is scheduled.** Manual, reviewable releases are acceptable before automated refresh is designed.

## 3. Target data flow

```mermaid
flowchart LR
  S[Approved public sources] --> A[Python acquisition]
  A --> RAW[Immutable raw artifacts]
  RAW --> N[Normalize and validate]
  N --> P[Processed canonical observations]
  P --> C[Python scoring and diagnostics]
  C --> R[Versioned release artifacts]
  R --> B[Next.js server/read boundary]
  B --> W[Typed web experience]
```

A result must be traceable through this chain: region and period → source observation → processed observation → normalization/scoring configuration → methodology version → published release.

## 4. Next.js and TypeScript responsibilities

### Frontend responsibilities

- render release, region, period, dimension, indicator, source, confidence, and limitation information;
- provide filters and navigation only over comparable released results;
- show unavailable, partial, low-confidence, revised, and non-comparable states explicitly;
- provide accessible loading, error, empty, and data-quality states;
- keep presentational and interaction components reusable;
- consume typed result contracts from the server/read boundary;
- avoid embedding indicator weights, normalization formulas, or source-specific parsing.

### Server/read boundary responsibilities

- select the requested approved release and methodology version;
- enforce allowed region/period/release combinations;
- return aggregate results together with components, provenance, confidence, and warnings;
- prevent accidental mixing of incompatible releases;
- keep secrets and source credentials out of client code, if credentials are ever needed.

The web application should not fetch arbitrary source files at render time or recalculate a score in a React component.

## 5. Python/data-processing responsibilities

A future Python package or job boundary should own:

- source acquisition and raw artifact preservation;
- source adapters and metadata extraction;
- region, indicator, and period normalization;
- schema, range, duplicate, coverage, and comparability validation;
- normalization, weighting, aggregation, confidence, and sensitivity calculations;
- release manifests, checksums, exclusion reports, and reproducibility metadata;
- deterministic generation of derived result artifacts.

Python is a planned responsibility, not a current dependency. Its package choice, environment, storage, and execution platform require a separate decision before implementation.

## 6. Pipeline stages

1. **Discover and approve:** register candidate sources, definitions, licensing, and owners.
2. **Acquire:** fetch approved sources and preserve raw files/responses with retrieval metadata.
3. **Normalize:** map source observations to official `kabupaten/kota`, indicator, unit, and period identifiers.
4. **Validate:** reject or flag invalid, incomplete, revised, or non-comparable observations.
5. **Score:** apply the approved methodology configuration and produce components, aggregate, confidence, and diagnostics.
6. **Review:** inspect validation results, exclusions, sensitivity, and source attribution.
7. **Publish:** create an immutable versioned release manifest and derived artifacts.
8. **Serve:** expose the approved release to Next.js through a stable typed boundary.

No failed acquisition may be silently replaced with a fabricated or stale value.

## 7. Proposed folder structure

The actual release uses versioned raw transcription and methodology files, a locally acquired BPS PDF artifact, a reproducible processing script, and the `src/lib/civx/` typed data/scoring boundary. The directory plan below remains a future expansion guide.
```text
docs/
  PRODUCT.md
  DATA.md
  METHODOLOGY.md
  ARCHITECTURE.md
  TASKS.md

src/
  app/                    # Next.js routes and layouts
  components/             # reusable presentation components
  features/               # product features: overview, region, compare, map
  lib/                    # typed read clients and pure UI utilities
  types/                  # shared web-facing contracts

python/
  civx_data/
    sources/              # source adapters
    normalize/            # canonicalization and geography mapping
    validate/             # data-quality rules
    score/                # methodology implementation
    releases/             # manifests and publication helpers
  scripts/                # explicit pipeline entrypoints

data/                     # location to be decided; raw/processed/release artifacts
  raw/                     # immutable acquired inputs
  processed/              # canonical observations and validation outputs
  releases/               # approved derived artifacts and manifests

tests/                    # contract, data-quality, and methodology tests
```

Whether `data/` lives in this repository, object storage, a database, or a separate pipeline repository is unresolved. The project must maintain one authoritative source of truth.

## 8. Future scalability

Start with versioned files and a small number of regions if that satisfies the first release. Scale only when evidence requires it:

- separate ingestion jobs from web deployment;
- move raw artifacts to object storage with checksums and retention policy;
- use a database for indexed release queries when file-based reads become insufficient;
- add caching for immutable release responses;
- partition processing by source, period, or region while preserving deterministic release manifests;
- add scheduled refreshes, monitoring, and failure alerts after manual release review is reliable;
- introduce API versioning when multiple consumers need stable contracts.

Scalability must not weaken provenance, reproducibility, or release review.

## 9. Security and operations

- Treat downloaded source content as untrusted input.
- Keep credentials and secrets outside source control and client bundles.
- Bound resource use during acquisition and validate file formats.
- Record failures with enough context to rerun without exposing secrets.
- Define retention, backup, disaster recovery, licensing, and attribution before production dependence.
- Do not publish raw data that has usage restrictions without a licensing decision.

## 10. Decisions requiring approval

- Location and ownership of raw, processed, and release artifacts.
- Python environment, package policy, execution platform, and repository boundary.
- Storage engine: versioned files, database, or a combination.
- API/read contract and release endpoint versioning.
- Manual versus scheduled publication workflow.
- Deployment target, caching, observability, and retention policy.
- Exact folder split between the Next.js repository and data pipeline.

## 11. Current 2023 release

- `data/raw/civx-jabar-2023.json` holds 27 kabupaten/kota's four official 2023 BPS table values, per-table attribution, and a PDF checksum/size manifest. The full book remains in an ignored local path and is not redistributed.
- `data/methodology/civx-jabar-2023.json` fixes the all-27 2023 reference extrema, directions, and four equal weights. Expanding coverage did not change this policy.
- `scripts/build-civic-release.mjs` checks artifact integrity, all 27 BPS geographic identities, source linkage, units, periods, and complete observations; it applies the shared scorer and writes `data/processed/civx-jabar-2023.json` with publication and exclusion counts.
- `src/lib/civx/types.ts` defines release, source, observation, policy, component, and result contracts; `src/lib/civx/scoring.ts` handles normalization, missingness, provenance, and aggregation; `src/lib/civx/data.ts` validates the read boundary. `src/lib/civx/coverage.ts` describes published score ordering and median without refitting score ranges. UI components never calculate scores.
- `/explore` searches and sorts published records and shows score context; `/regions/[id]` exposes the source-backed Civic Index, component breakdown, position and median among published records. `/methodology` and `/sources` explain calculation limits and citations. No map or added indicator is implied.

All 27 have complete released scores; no exclusion is recorded for this dataset. External transcription/methodology review and permission assessment remain pending before a formal public release.
