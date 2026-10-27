# CIVX · Civic Index

CIVX is a public-data decision-support interface for relative regional pressure. The **2023 Jawa Barat release** draws four observations per published kabupaten/kota from four official BPS tables. The fixed min–max bounds use all 27 Jawa Barat kabupaten/kota; incomplete or unverifiable regions are excluded. It is a project-defined modeled index, not an official BPS ranking or nationwide coverage.

## Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Run `npm test`, `npm run lint`, and `npm run build` before shipping. Run `npm run data:build` only when the original locally ignored BPS artifact is available; never bypass its checksum verification.

To regenerate `data/processed/civx-jabar-2023.json`, download the original BPS PDF linked in `docs/DATA.md` into the ignored `data/raw/bps-jabar-dalam-angka-2024.pdf`, then use Node 26 and run `npm run data:build`. The script refuses a missing or changed PDF and compares its SHA-256 against the source manifest. The committed processed release permits building the web app without redistributing the PDF.

The display map is generated separately from scoring: `node scripts/build-jabar-map.mjs` downloads a commit-pinned geoBoundaries ADM2 source, verifies its SHA-256, and projects the 27 matched regions to `data/geography/jabar-adm2-2020.json`. Normal builds use the committed geometry and need no network. See `docs/DATA.md` §9 for its CC BY 3.0 IGO attribution and 2020-versus-2023 boundary caveat.

## Routes and data boundary

- `/` — a compact CIVX introduction, real 2023 score preview, release facts, and clickable regional summaries.
- `/explore` — compact search, sort, category filtering, a theme-aware geographic map and a full regional-list alternative. Opening a region preserves this workspace in a contextual dialog.
- `/compare` — URL-backed compatible region selection and swap, a named score difference, release position/median context, and raw, normalized and contribution differences for all four indicators.
- `/regions/[id]` — one shared server-rendered regional record, shown above Explore on soft navigation or as a standalone page on direct access and refresh.
- `/methodology` — the five-step scoring pipeline, fixed reference ranges, formula, missing-data policy, and limits.
- `/sources` — an indicator-by-indicator BPS provenance catalog with publication, period, table/page, original link, and source-artifact fingerprint.

`data/raw/civx-jabar-2023.json` holds reviewed transcribed observations and artifact references; `data/methodology/civx-jabar-2023.json` defines fixed 2023 bounds and equal weights. `scripts/build-civic-release.mjs` verifies the source PDF and writes `data/processed/civx-jabar-2023.json`. `src/lib/civx/scoring.ts` performs scoring; `src/lib/civx/data.ts` exposes the validated release to pages without scoring in UI components. Details and limits: `docs/DATA.md` and `docs/METHODOLOGY.md`.

## Theme and interaction system

`src/app/globals.css` owns semantic light/dark color roles, spacing, radii, control heights and motion tokens. The compact header control offers **Light**, **Dark** and **System**. A synchronous bootstrap applies `data-theme` to `<html>` before visible content; `color-scheme` follows the resolved theme. Preferences persist in local storage, synchronize between tabs, and follow OS changes in System mode. Denied storage does not prevent switching themes.

Explore uses the App Router's parallel `@detail` slot and `(..)regions/[id]` interception. The URL remains `/regions/[id]`; Back closes the detail and Forward reopens it without clearing Explore filters or its scroll context. Direct links, refresh, and the dialog's Full page link render the standalone record. Both paths use `RegionDetail`; no analytical calculation is copied into the overlay.

The native dialog makes the background inert, locks page scrolling, cycles keyboard focus, supports Escape/backdrop/close-button dismissal and restores focus to the originating list or map link. It becomes a near-full-height sheet on mobile. Explicit dismissal uses a short exit transition; native browser history is not delayed for animation. Shared motion uses 140/200/300ms durations and honors reduced motion. No theme, modal, mapping or animation dependency was added.

## Verification and limits

The product-quality pass ran the source-verified data build, 11 automated tests, lint and production build. Managed Chromium smoke covered contextual history, focus cycling/restoration, map and filter interaction, comparison recovery/swap, direct detail/refresh, themes and reduced motion. Six routes were checked at 1920, 1440, 1024, 768, 390 and 320px without document-level horizontal overflow. Computed text-contrast checks passed on those routes in both themes; this is not a formal accessibility certification.

All committed records currently have a complete score and display outline. Unavailable-score and missing-outline branches remain explicit, but the production smoke cannot exercise absent production records. The map is approximate 2020 display geometry, not certified 2023 geography or a scoring input. Independent transcription/methodology review, publication rights and sensitivity review remain outstanding.


