# CIVX · Civic Index

CIVX is a public-data decision-support interface for relative regional pressure. The **2023 Jawa Barat release** draws four observations per published kabupaten/kota from four official BPS tables. The fixed min–max bounds use all 27 Jawa Barat kabupaten/kota; incomplete or unverifiable regions are excluded. It is a project-defined modeled index, not an official BPS ranking or nationwide coverage.

## Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Run `npm test`, `npm run lint`, and `npm run build` before shipping.

To regenerate `data/processed/civx-jabar-2023.json`, download the original BPS PDF linked in `docs/DATA.md` into the ignored `data/raw/bps-jabar-dalam-angka-2024.pdf`, then use Node 26 and run `npm run data:build`. The script refuses a missing or changed PDF and compares its SHA-256 against the source manifest. The committed processed release permits building the web app without redistributing the PDF.

## Routes and data boundary

- `/` — a compact CIVX introduction, real 2023 score preview, release facts, and clickable regional summaries.
- `/explore` — search and score/name sorting across published regions, compact indicator previews, and relative release context.
- `/regions/[id]` — modeled score, position and median among published regions, category, sourced raw/normalized/contribution breakdown.
- `/methodology` — the five-step scoring pipeline, fixed reference ranges, formula, missing-data policy, and limits.
- `/sources` — an indicator-by-indicator BPS provenance catalog with publication, period, table/page, original link, and source-artifact fingerprint.

`data/raw/civx-jabar-2023.json` holds reviewed transcribed observations and artifact references; `data/methodology/civx-jabar-2023.json` defines fixed 2023 bounds and equal weights. `scripts/build-civic-release.mjs` verifies the source PDF and writes `data/processed/civx-jabar-2023.json`. `src/lib/civx/scoring.ts` performs scoring; `src/lib/civx/data.ts` exposes the validated release to pages without scoring in UI components. Details and limits: `docs/DATA.md` and `docs/METHODOLOGY.md`.

The interface uses semantic headings, keyboard-accessible links, labelled search and sort controls, visible focus, reduced-motion handling, and responsive layouts. Relative positions describe this release only, not statistical significance or an official BPS ranking. The four indicator definitions, fixed 2023 reference bounds, directions, and equal weights remain unchanged. Independent transcription/methodology review and publication-rights confirmation remain outstanding before a formal public release.
