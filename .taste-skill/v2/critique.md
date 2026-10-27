# CIVX v2 app-screen critique

## Direction and scope

Achromatic ledger, seed `1154698388`. One shell redraw replaced the dealt icon rail with “No sidebar”: CIVX already has a working text navigation shell, which this analytical expansion must preserve. Palette and type remain the existing CIVX brand. The retained navy dark theme is an existing brand constraint, not a new palette choice.

Inventory: 27 BPS-coded regions; 18 kabupaten and nine kota; fixed 2023 inputs; four unchanged v1 indicators; one validated additional water input; two scored dimensions; three unsupported dimensions; actual source years; source-artifact fingerprints; explicit optional missingness; three targeted positive 2023 capabilities; two model versions that must never blend.

Question: What evidence supports a region's pressure score, and which evidence does not affect it?

Face: CIVX's blue is reserved for pressure data in the register; positive green marks only verified capability presence. Signature: the source-backed separation between pressure dimensions, Context Signals and Regional Advantages, with explicit version links and a per-observation evidence trail. The subject's 27-region reference set becomes the ledger's administrative-order register, not a leaderboard.

Live action: open a region and disclose its actual observation, denominator, dated source and fingerprint. Native details work without client-side state; version links retain the same BPS region.

No photographs, illustrations, invented sample content, external assets or dependencies were added. This is an app/report screen, not a marketing page; the page imagery/motion floor does not apply. Motion remains existing control feedback only.

## Final seven-question critique

1. **Hierarchy:** the region's Core Pressure Score leads, followed by dimensions, context and advantages. The overview leads with the actual regional register and explicit release scope.
2. **Frame:** one centered ledger, equal outer gutters, compact peer panels, no stretched evidence cards. The initial register shows five rows; a native disclosure exposes the remaining 22 without duplicating records. Tablet and phone stack the same fields.
3. **Colour:** pressure numbers carry CIVX blue; only verified positives carry restrained green. No score bonus, coloured trophy, gradient, sparkline or fabricated trend appears.
4. **Arithmetic:** all displayed scores and contributions come from the released artifact. Dimension weights and effective indicator weights remain distinct. Rounding caveats stay explicit; v1 and v2 are not shown as a time trend.
5. **Missingness:** missing numeric values remain a dash. Missing capabilities say no comparable data, never verified absent. Bogor's empty positive-evidence state was exercised in the browser.
6. **Marks:** no chart or legend duplicates the register. The positive check is a small inline SVG next to an explicit verified-presence label. A block-level checkmark found in the first visual round was fixed.
7. **Phone:** all fields remain readable at 320 and 390px; long provenance wraps. Shortened overview navigation and intro bring the first regional row to 483px at 390×844 and 504px at 320×844, inside the top 60% of the viewport. Native disclosures retain keyboard access and visible focus.

## Observed verification

- Final production screenshots viewed at 1440, 768 and 390px for overview and regional detail; dark desktop screenshots also viewed.
- Both pages measured at 1440/768/390/320px in Light and Dark: 16 combinations, no document overflow, one h1 each, zero computed text-contrast failures. Minimum observed text contrast: 5.98:1 Light; 7.46:1 overview Dark and 8.02:1 detail Dark.
- Opened all 27 regional links through the remaining-record disclosure.
- Exercised keyboard Enter/focus-visible, core source disclosure, all three positive capability cases, no-positive-evidence state, v1/v2 same-region navigation, invalid region recovery, and preserved Explore/Compare/Methodology/Sources routes.
- No browser error entries observed during smoke.
- Taste source lint: 0 FAIL, 0 WARN.
- Standalone `inspect.mjs --app` could not launch: its executable discovery found no local Chrome/Edge/Chromium. Managed Chromium browser tooling provided the real screenshots and measurements above. No standalone inspector pass is claimed.

This is a project smoke and visual review, not formal assistive-technology certification. The inherited shell is intentionally preserved; optional evidence remains incomplete and source/method rights/review gates remain visible.
