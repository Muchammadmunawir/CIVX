import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

// Research only. No production builder, score, policy, previous audit or UI is written.
const root = new URL("../", import.meta.url);
const directory = "data/raw/environment-audit-2023/";
const load = (path) => JSON.parse(readFileSync(new URL(path, root), "utf8"));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const protocol = load(`${directory}protocol.json`);
const regions = load(protocol.scope.regionRegistry).regions.map(({ id, name }) => ({ id, name }));
const ids = regions.map(({ id }) => id);
const names = new Map(regions.map(({ id, name }) => [id, name]));
assert.equal(ids.length, 27);
assert.equal(new Set(ids).size, 27);
assert.deepEqual(protocol.scope.regionIds, ids);
const inputs = ["protocol", "indices", "waste", "air-exposure", "land-water", "locator-verification"].map((name) => ({
  path: `${directory}${name}.json`, data: load(`${directory}${name}.json`),
}));
const artifacts = new Map();
const series = new Map();
const investigations = [];
const statuses = ["CORE", "CONTEXT ONLY", "REJECT", "PARKED / insufficient evidence"];
for (const { path, data } of inputs) {
  assert.equal(data.scope.referenceYear, 2023, path);
  assert.equal(data.scope.productionChanges, false, path);
  for (const artifact of data.artifacts ?? []) {
    assert(!artifacts.has(artifact.id), `Duplicate artifact: ${artifact.id}`);
    assert.equal(typeof artifact.content, "string", artifact.id);
    assert.equal(hash(Buffer.from(artifact.content)), artifact.sha256, `Artifact hash: ${artifact.id}`);
    assert.equal(Buffer.byteLength(artifact.content), artifact.bytes, `Artifact bytes: ${artifact.id}`);
    if (artifact.originalResponseSha256) {
      assert.equal(hash(Buffer.from("\uFEFF" + artifact.content)), artifact.originalResponseSha256, `Original BOM fingerprint: ${artifact.id}`);
      assert.equal(Buffer.byteLength("\uFEFF" + artifact.content), artifact.originalResponseBytes);
    }
    assert(artifact.url && artifact.publisher && artifact.representation, `Provenance: ${artifact.id}`);
    artifacts.set(artifact.id, { ...artifact, sourceFile: path });
  }
  for (const item of data.series ?? []) {
    assert(!series.has(item.id), `Duplicate series: ${item.id}`);
    assert.equal(item.year, 2023, item.id);
    assert(statuses.includes(item.recommendation.status), item.id);
    assert.deepEqual(item.observations.map(({ regionId }) => regionId), ids, `Cohort: ${item.id}`);
    series.set(item.id, { ...item, sourceFile: path });
  }
  for (const item of data.investigations ?? []) {
    assert(statuses.includes(item.recommendation.status), item.id);
    investigations.push({ ...item, sourceFile: path });
  }
}
assert.equal(new Set([...series.keys(), ...investigations.map(({ id }) => id)]).size, series.size + investigations.length);
for (const [path, expected] of Object.entries(protocol.productionProtection.sha256BeforeAudit)) {
  assert.equal(hash(readFileSync(new URL(path, root))), expected, `Protected existing file changed: ${path}`);
}

function number(value) {
  if (value === null || value === undefined || value === "" || value === "-") return null;
  if (typeof value === "number") return value;
  const text = String(value).trim();
  if (/^-?\d{1,3}(?:\.\d{3})+,\d+$/.test(text)) return Number(text.replaceAll(".", "").replace(",", "."));
  if (/^-?\d+(?:,\d+)?$/.test(text)) return Number(text.replace(",", "."));
  if (/^-?\d+(?:\.\d+)?$/.test(text)) return Number(text);
  throw new Error(`Unresolved numeric representation: ${JSON.stringify(value)}`);
}
function pdfCells(artifact, field) {
  const extraction = artifact.extraction;
  const band = extraction.columnXBands?.[field] ?? extraction.xBand;
  const yBand = extraction.numericRowYRange ?? extraction.yBand;
  assert(band && yBand, `PDF extraction bands: ${artifact.id}/${field}`);
  const words = [...artifact.content.matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)"[^>]*>([^<]+)<\/word>/g)]
    .map((match) => ({ x: Number(match[1]), y: Number(match[2]), token: match[3] }));
  const cells = words.filter(({ x, y, token }) => x >= band[0] && x <= band[1] && y >= yBand[0] && y <= yBand[1] && /^-?[\d.,]+$/.test(token))
    .sort((a, b) => a.y - b.y);
  assert.equal(cells.length, 27, `PDF district column: ${artifact.id}/${field}`);
  for (const [index, cell] of cells.entries()) {
    const label = words.filter(({ x, y }) => x >= 44 && x < 110 && Math.abs(y - cell.y) < 0.02)
      .sort((a, b) => a.x - b.x).map(({ token }) => token).join(" ");
    assert.equal(label, names.get(ids[index]).replace(/^(Kabupaten|Kota) /, ""), `PDF row identity: ${artifact.id}/${ids[index]}`);
  }
  return cells;
}
const pdfCache = new Map();
function pdfCell(artifact, field, regionId) {
  const key = `${artifact.id}/${field}`;
  if (!pdfCache.has(key)) pdfCache.set(key, pdfCells(artifact, field));
  return pdfCache.get(key)[ids.indexOf(regionId)];
}
for (const item of investigations) {
  for (const id of item.sourceArtifactIds ?? []) assert(artifacts.has(id), `Investigation evidence: ${item.id}/${id}`);
}
const verifiedLocators = new Set([...artifacts.values()].map(({ url }) => url));
for (const item of [...series.values(), ...investigations]) {
  assert(verifiedLocators.has(item.source?.url ?? item.url), `Unverified candidate locator: ${item.id}`);
}
let replayedApiCells = 0;
let replayedDerivedCells = 0;
let replayedPdfCells = 0;
const nonApiReceipts = [];
for (const item of series.values()) {
  assert(artifacts.has(item.source.artifactId), `Series artifact: ${item.id}`);
  for (const observation of item.observations) {
    const receipt = observation.sourceRecord;
    assert(receipt?.artifactId && artifacts.has(receipt.artifactId), `Row artifact: ${item.id}`);
    assert(observation.value === null || Number.isFinite(observation.value), `Numeric value: ${item.id}`);
    assert(observation.value !== null || observation.status !== "observed", `Hidden missingness: ${item.id}`);
    const artifact = artifacts.get(receipt.artifactId);
    let sourceRows;
    try { sourceRows = JSON.parse(artifact.content).data; } catch { /* Text/PDF receipt, not an API. */ }
    const field = receipt.valueField ?? receipt.field ?? item.valueField;
    if (Array.isArray(sourceRows) && field && receipt.operation === "sum") {
      const matched = sourceRows.filter((row) => String(row.kode_kabupaten_kota) === observation.regionId)
        .sort((a, b) => Number(a.kode_bulan) - Number(b.kode_bulan));
      if (observation.value === null) {
        assert(matched.length !== 12, `Unexplained missing annual sum: ${item.id}`);
        continue;
      }
      assert.deepEqual(matched.map((row) => Number(row.kode_bulan)), Array.from({ length: 12 }, (_, i) => i + 1));
      assert.deepEqual(matched.map((row) => row.id), receipt.rowIds);
      assert(matched.every((row) => Number(row.tahun) === 2023));
      const values = matched.map((row) => number(row[field]));
      assert(values.every((value) => value !== null));
      assert.deepEqual(values, observation.rawValue);
      assert(Math.abs(values.reduce((sum, value) => sum + value, 0) - observation.value) < 1e-8, `Annual sum replay: ${item.id}`);
      replayedDerivedCells++;
    } else if (Array.isArray(sourceRows) && field) {
      const matched = sourceRows.filter((row) => receipt.rowId !== undefined
        ? String(row.id) === String(receipt.rowId)
        : String(row.kode_kabupaten_kota) === observation.regionId);
      if (matched.length === 0 && observation.value === null) continue;
      assert.equal(matched.length, 1, `Unique source row: ${item.id}/${observation.regionId}`);
      const row = matched[0];
      assert.equal(String(row.kode_kabupaten_kota), observation.regionId, `Source geography: ${item.id}`);
      assert.equal(Number(row.tahun), 2023, `Source year: ${item.id}`);
      assert.equal(row.nama_kabupaten_kota?.toUpperCase(), names.get(observation.regionId).toUpperCase(), `Source name: ${item.id}`);
      assert.equal(number(row[field]), observation.value, `API replay: ${item.id}/${observation.regionId}`);
      assert.deepEqual(row[field], observation.rawValue, `Raw cell replay: ${item.id}/${observation.regionId}`);
      replayedApiCells++;
    } else if (artifact.representation.includes("pdftotext -bbox")) {
      const cell = pdfCell(artifact, field, observation.regionId);
      assert.equal(cell.token, observation.rawValue, `PDF raw cell: ${item.id}`);
      assert.equal(number(cell.token), observation.value, `PDF value replay: ${item.id}`);
      replayedPdfCells++;
    } else if (receipt.rowText && receipt.rowOrdinal) {
      assert.equal(receipt.pdfPage, 552, `Designated forest page: ${item.id}`);
      const tableRows = artifact.content.split("\f")[1].split("\n").filter((line) => /\s2021\s/.test(line));
      assert.equal(tableRows.length, 27, `Designated forest cohort: ${item.id}`);
      const line = tableRows[receipt.rowOrdinal - 1];
      assert.equal(line, receipt.rowText, `PDF row replay: ${item.id}`);
      assert.equal(line.trim().split(/\s+2021\s+/)[0], names.get(observation.regionId).replace(/^(Kabupaten|Kota) /, ""), `PDF row name: ${item.id}`);
      const token = line.trim().split(/\s+/).at(-1);
      assert.equal(token, observation.rawValue, `PDF raw token: ${item.id}`);
      assert.equal(number(token), observation.value, `PDF designation value: ${item.id}`);
      replayedPdfCells++;
    } else if (observation.value !== null && observation.numerator !== undefined && observation.denominator !== undefined) {
      assert(observation.denominator > 0, `Rate denominator: ${item.id}`);
      const multiplier = item.multiplier ?? observation.multiplier;
      assert(Number.isFinite(multiplier), `Explicit rate multiplier: ${item.id}`);
      assert(Math.abs(observation.numerator / observation.denominator * multiplier - observation.value) < 1e-9, `Rate replay: ${item.id}`);
      replayedDerivedCells++;
    } else if (observation.value !== null) {
      assert(receipt.page || receipt.pdfPage || receipt.locator || receipt.line || receipt.excerpt, `Text source locator: ${item.id}`);
      nonApiReceipts.push({ id: item.id, regionId: observation.regionId, receipt });
    }
  }
}
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
function quantile(sorted, probability) {
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  return sorted[lower] + (sorted[Math.ceil(position)] - sorted[lower]) * (position - lower);
}
function describe(item) {
  const present = item.observations.filter(({ value }) => value !== null);
  const values = present.map(({ value }) => value).sort((a, b) => a - b);
  assert(values.length > 0, `Empty panel belongs in investigations: ${item.id}`);
  const average = mean(values);
  const q1 = quantile(values, 0.25), q3 = quantile(values, 0.75);
  const iqr = q3 - q1, lowerFence = q1 - 1.5 * iqr, upperFence = q3 + 1.5 * iqr;
  const identify = (rows) => rows.map(({ regionId, value }) => ({ regionId, regionName: names.get(regionId), value }));
  return {
    expected: 27, count: present.length, missing: 27 - present.length,
    unique: new Set(values).size, min: values[0], max: values.at(-1),
    mean: average, median: quantile(values, 0.5),
    populationStandardDeviation: Math.sqrt(mean(values.map((value) => (value - average) ** 2))),
    q1, q3, iqr, lowerFence, upperFence,
    ambiguousNumeric: present.filter(({ status }) => status !== "observed").length,
    zeros: identify(present.filter(({ value }) => value === 0)),
    outsideBounds: identify(present.filter(({ value }) => (item.bounds?.min != null && value < item.bounds.min) || (item.bounds?.max != null && value > item.bounds.max))),
    outliers: identify(present.filter(({ value }) => value < lowerFence || value > upperFence)),
    minimumRegions: identify(present.filter(({ value }) => value === values[0])),
    maximumRegions: identify(present.filter(({ value }) => value === values.at(-1))),
    missingRegions: item.observations.filter(({ value }) => value === null).map(({ regionId, missingReason }) => ({ regionId, reason: missingReason ?? "No resolved source observation; never imputed." })),
    interpretation: "Equal-region description, not a population-weighted province estimate. Tukey flags are diagnostics, not deletions or winsorization. Zero is retained only when explicitly published; see source interpretation.",
  };
}
function pearson(a, b) {
  const ma = mean(a), mb = mean(b);
  let cross = 0, va = 0, vb = 0;
  for (let i = 0; i < a.length; i++) {
    const da = a[i] - ma, db = b[i] - mb;
    cross += da * db; va += da * da; vb += db * db;
  }
  return va === 0 || vb === 0 ? null : cross / Math.sqrt(va * vb);
}
function ranks(values) {
  const sorted = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const result = Array(values.length);
  for (let start = 0; start < sorted.length;) {
    let end = start + 1;
    while (end < sorted.length && sorted[end].value === sorted[start].value) end++;
    for (let i = start; i < end; i++) result[sorted[i].index] = (start + 1 + end) / 2;
    start = end;
  }
  return result;
}
const diagnosticStatistics = {};
const wasteDiagnostic = investigations.find(({ id }) => id === "waste-derived-managed-unmanaged-share");
if (wasteDiagnostic) {
  const rows = wasteDiagnostic.findings.diagnostics;
  assert.deepEqual(rows.map(({ regionId }) => regionId), ids);
  for (const row of rows) {
    for (const cell of Object.values(row)) {
      if (!cell || typeof cell !== "object" || !cell.sourceRecord) continue;
      const receipt = cell.sourceRecord, artifact = artifacts.get(receipt.artifactId);
      assert(artifact, `Diagnostic source: ${receipt.artifactId}`);
      if (artifact.representation.includes("pdftotext -bbox")) {
        const token = pdfCell(artifact, receipt.valueField, row.regionId).token;
        const multiplier = receipt.valueField === "populationThousand" ? 1000 : 1;
        assert(Math.abs(number(token) * multiplier - cell.value) < 1e-7);
        assert.equal(token, receipt.sourceToken);
      } else {
        const sourceRows = JSON.parse(artifact.content).data;
        const source = sourceRows.find((source) => String(source.id) === String(receipt.rowId));
        assert(source && String(source.kode_kabupaten_kota) === row.regionId && Number(source.tahun) === 2023);
        assert.equal(number(source[receipt.valueField]), cell.value);
      }
    }
    for (const field of ["transportOverGenerationDiagnostic", "handledOverGenerationDiagnostic", "managedBookOverGenerationDiagnostic"]) {
      const cell = row[field];
      assert(cell.denominator.value > 0);
      assert(Math.abs(100 * cell.numerator.value / cell.denominator.value - cell.value) < 1e-9);
    }
    assert(Math.abs(row.serviceApiMinusBook.left.value - row.serviceApiMinusBook.right.value - row.serviceApiMinusBook.value) < 1e-9);
    assert(Math.abs(1000 * row.generationBook.value / row.publishedPerCapitaBook.value - row.impliedPopulationDiagnostic.value) < 1e-7);
  }
  for (const field of ["transportOverGenerationDiagnostic", "handledOverGenerationDiagnostic", "managedBookOverGenerationDiagnostic"]) {
    diagnosticStatistics[field] = { diagnosticOnly: true, admissibleRate: false, ...describe({
      id: field, bounds: { min: 0, max: 100 },
      observations: rows.map((row) => ({ regionId: row.regionId, value: row[field].value, status: "observed" })),
    }) };
  }
}
const sourceLevelStatistics = {};
const spm = investigations.find(({ id }) => id === "air-spm-2023");
if (spm) {
  const rows = spm.findings.stationRecords;
  const text = artifacts.get("air-bps-2024-air-tables").content;
  for (const row of rows) {
    const line = text.split("\n").find((line) => line.includes(row.station) && line.includes(row.rawMean));
    assert(line && line.includes(row.rawMin) && line.includes(row.rawMax.normalize("NFKC")), `SPM source receipt: ${row.station}`);
    assert.equal(number(row.rawMean), row.mean);
    assert.equal(number(row.rawMin), row.min);
    assert.equal(number(row.rawMax.replace(/\p{No}/gu, "")), row.max);
  }
  const values = rows.map(({ mean }) => mean).sort((a, b) => a - b);
  const average = mean(values);
  const q1 = quantile(values, 0.25), q3 = quantile(values, 0.75);
  const lower = q1 - 1.5 * (q3 - q1), upper = q3 + 1.5 * (q3 - q1);
  sourceLevelStatistics[spm.id] = { count: values.length, unique: new Set(values).size,
    min: values[0], max: values.at(-1), mean: average, median: quantile(values, 0.5),
    populationStandardDeviation: Math.sqrt(mean(values.map((value) => (value - average) ** 2))),
    zeros: rows.filter(({ mean }) => mean === 0), impossibleNegativeValues: rows.filter(({ mean }) => mean < 0),
    outliers: rows.filter(({ mean }) => mean < lower || mean > upper),
    districtCoverage: "0/27 representative annual district estimates established; three station summaries are not three district observations.",
  };
}
const currentStations = JSON.parse(artifacts.get("air-klh-stations").content).rows.filter(({ provinsi }) => provinsi === "Jawa Barat");
sourceLevelStatistics.currentStationInventory = {
  observedYears: [...new Set(currentStations.map(({ waktu }) => Number(waktu.slice(0, 4))))],
  stationRows: currentStations.length,
  distinctDistrictLabels: new Set(currentStations.map(({ nama }) => nama.match(/^Kabupaten \S+/)?.[0])).size,
  interpretation: "2026 endpoint inventory diagnostic only; not a 2023 all-station census or district exposure panel.",
};
const statistics = Object.fromEntries([...series].map(([id, item]) => [id, describe(item)]));
const urbanRuralDiagnostic = Object.fromEntries([...series].map(([id, item]) => [id,
  Object.fromEntries([["kabupaten", "32", false], ["kota", "327", true]].map(([label, prefix, city]) => {
    const values = item.observations.filter(({ regionId, value }) => value !== null && regionId.startsWith(prefix) && (city || !regionId.startsWith("327"))).map(({ value }) => value);
    return [label, { count: values.length, mean: values.length ? mean(values) : null }];
  })),
]));
const correlations = [];
const panels = [...series.values()];
for (let i = 0; i < panels.length; i++) {
  for (const b of panels.slice(i + 1)) {
    const a = panels[i];
    const pairs = a.observations.map((row, index) => [row, b.observations[index]])
      .filter(([x, y]) => x.value !== null && y.value !== null && x.status === "observed" && y.status === "observed");
    if (pairs.length < 3) continue;
    const av = pairs.map(([x]) => x.value), bv = pairs.map(([, y]) => y.value);
    const p = pearson(av, bv), s = pearson(ranks(av), ranks(bv));
    correlations.push({ a: a.id, b: b.id, count: pairs.length,
      completeCohort: pairs.length === 27, pearson: p, spearman: s,
      possibleRedundancy: (p !== null && Math.abs(p) >= protocol.method.correlationFlag) || (s !== null && Math.abs(s) >= protocol.method.correlationFlag),
      interpretation: "Exploratory raw-value association on explicitly paired nonmissing resolved observations; incomplete pairs are not admission evidence. Size, shared denominators, embedded components and reporting bias require conceptual review regardless of correlation.",
    });
  }
}
const core = panels.filter(({ recommendation }) => recommendation.status === "CORE").map(({ id }) => id);
assert.deepEqual(core, protocol.method.coreIds);
const coreEvidence = {
  official_source: "DLH Jawa Barat, official Galura dataset20488 with producer, approval history and immutable retained2023 response.",
  reference_2023: "All27 source rows explicitly tahun=2023. Annual administrative index vintage, not a claim of continuous2023 sensing; statutory land sampling can precede calculation year.",
  coverage_27: "Exact unique expected district-code/name set;27 numeric rows; no province row or kabupaten/kota collision.",
  comparable_definition: "Single DLH district index panel, Permen27/2021 AnnexVII common district composite. Do not apply different province or2025 formulas.",
  comparable_unit: "One index-point scale; unchanged published values, not percentages or concentrations.",
  compatible_geography: "DLH metadata expressly uses BPS2019 district identifiers, matching CIVX registry. No station-to-district assignment or polygon-derived denominator.",
  environmental_civic_pressure: "Ambient surface-water/air/land condition affects shared environmental living conditions; narrow administrative environmental-quality state proxy.",
  clear_natural_direction: "Higher environmental quality means lower pressure, not greater hazard, disease or administrative activity.",
  no_unresolved_missing: "27 finite observed cells, all within0–100. No imputation or substituted years.",
  sufficient_variation: "See programmatic count, unique values, extrema and population SD; not constant or near-floor repetition.",
  no_severe_unnecessary_redundancy: "Only one Environment CORE; all embedded media variants are non-additive context or rejected stacks.",
  valid_denominator_if_rate: "Not a CIVX-derived rate. Published index retained intact; statutory component denominators belong to producer method. No population/area ratio invented.",
  not_primarily_reporting_intensity: "State index, not reporting-participation count. LKIP2023 PDF41 reports all27 districts monitored across four air-site categories, and PDF44 reports1351 verified water records. Statutory sampling/validation framework provides common basis; this does not independently certify each local sampling log or equal physical exposure representativeness.",
  not_embedded_in_selected_composite_or_dimension: "IKLH itself is not an input of retained IRBI or another audited dimension. No water/sanitation access, disease, poverty or IRBI component is added. Land state shares conceptual drivers with IRBI environmental vulnerability; independence is not claimed.",
};
const admission = Object.fromEntries(panels.map((item) => {
  const s = statistics[item.id];
  const isCore = core.includes(item.id);
  const gates = Object.fromEntries(protocol.method.admissionGates.map((gate) => [gate, {
    pass: isCore ? true : null,
    evidence: isCore ? coreEvidence[gate] : item.recommendation.reason,
  }]));
  for (const [gate, pass, evidence] of [
    ["coverage_27", s.count === 27, `${s.count}/27 numeric cells`],
    ["no_unresolved_missing", s.missing === 0 && s.ambiguousNumeric === 0, `${s.missing} missing; ${s.ambiguousNumeric} unresolved numeric cells`],
    ["sufficient_variation", s.unique > 1, `${s.unique} unique; SD ${s.populationStandardDeviation}`],
    ["clear_natural_direction", ["higher_better", "higher_worse"].includes(item.direction), item.directionExplanation],
  ]) gates[gate] = { pass, evidence };
  if (isCore) {
    assert.equal(s.count, 27); assert.equal(s.ambiguousNumeric, 0);
    assert(s.unique > 1 && s.outsideBounds.length === 0);
    assert(Object.values(gates).every(({ pass }) => pass === true));
  }
  return [item.id, { decision: item.recommendation, gates,
    note: "CORE admission is for the published administrative index construct only. Null on non-core means not established/not applicable, never an affirmative pass." }];
}));
const evidence = [...artifacts.values()].map((artifact) => {
  const { content: _content, ...metadata } = artifact;
  void _content;
  return metadata;
});
const inputHashes = inputs.map(({ path }) => ({ path, sha256: hash(readFileSync(new URL(path, root))) }));
const provenance = { auditId: protocol.auditId, accessedAt: protocol.accessedAt, inputHashes,
  analyzer: { path: "scripts/analyze-environment-audit-2023.mjs", sha256: hash(readFileSync(new URL(import.meta.url))) },
  artifacts: evidence, productionProtection: { passed: true, protectedFiles: Object.keys(protocol.productionProtection.sha256BeforeAudit).length },
  replay: { apiCells: replayedApiCells, pdfCells: replayedPdfCells, derivedCells: replayedDerivedCells, nonApiReceipts },
  locators: { allCandidateUrlsHaveAcquisitionReceipts: true, uniqueUrls: verifiedLocators.size,
    note: "Receipt means an actual request was made, not that every URL succeeded. DNS failures, access blocks, wrong-year results, SPA shells and inherited publication fingerprints remain explicitly distinguished." },
};
const decisions = Object.fromEntries(statuses.map((status) => [status,
  [...panels, ...investigations].filter(({ recommendation }) => recommendation.status === status)
    .map(({ id, recommendation }) => ({ id, reason: recommendation.reason })),
]));
const totals = { artifacts: artifacts.size, series: series.size, investigations: investigations.length,
  candidates: series.size + investigations.length, expectedRegionalCells: series.size * 27,
  numericCells: Object.values(statistics).reduce((n, s) => n + s.count, 0),
  missingCells: Object.values(statistics).reduce((n, s) => n + s.missing, 0),
  completePanels: Object.values(statistics).filter(({ missing }) => missing === 0).length,
  correlationPairs: correlations.length, flaggedPairs: correlations.filter(({ possibleRedundancy }) => possibleRedundancy).length,
};
const csvCell = (value) => `"${(typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "")).replaceAll('"', '""')}"`;
const headers = ["id", "indicator", "construct", "target_year", "coverage_or_actual_vintage", "unit", "kind", "direction", "publisher", "url", "artifact", "decision", "reason", "comparability", "reporting_bias", "redundancy", "source_file"];
const findingSummary = (findings) => typeof findings === "string" ? findings
  : Array.isArray(findings) ? findings.join(" ")
    : `Structured findings retained in observations.json: ${Object.keys(findings ?? {}).join(", ")}.`;
const register = [...panels.map((item) => [item.id, item.name, item.concept, item.year,
  `${statistics[item.id].count}/27 numeric; ${statistics[item.id].ambiguousNumeric} unresolved`, item.unit, item.rawOrDerived, item.direction,
  item.source.publisher, item.source.url, item.source.artifactId, item.recommendation.status, item.recommendation.reason,
  item.comparability, item.reportingBias, item.redundancy, item.sourceFile]),
...investigations.map((item) => [item.id, item.name, item.concept, item.year, item.coverage, item.unit,
  "investigation", item.direction, item.publisher, item.url, item.sourceArtifactIds?.join(";"), item.recommendation.status,
  item.recommendation.reason, findingSummary(item.findings), "See evidence and gaps", "See decision", item.sourceFile])];
const outputs = new Map([
  ["observations.json", { auditId: protocol.auditId, scope: protocol.scope, regions, series: panels, investigations }],
  ["statistics.json", { auditId: protocol.auditId, method: protocol.method, totals, statistics, diagnosticStatistics, sourceLevelStatistics, urbanRuralDiagnostic, correlations }],
  ["provenance.json", provenance], ["decisions.json", { auditId: protocol.auditId, construct: protocol.construct, decisions, admission }],
]);
for (const [suffix, data] of outputs) outputs.set(suffix, JSON.stringify(data, null, 2) + "\n");
outputs.set("candidate-register.csv", [headers, ...register].map((row) => row.map(csvCell).join(",")).join("\n") + "\n");
for (const [suffix, content] of outputs) {
  const path = new URL(`data/processed/environment-audit-2023-${suffix}`, root);
  if (process.argv.includes("--check")) assert.equal(readFileSync(path, "utf8"), content, `Stale output: ${suffix}`);
  else writeFileSync(path, content);
}
console.log(JSON.stringify({ mode: process.argv.includes("--check") ? "check" : "generate", ...totals,
  replayedApiCells, replayedPdfCells, replayedDerivedCells, nonApiReceiptCount: nonApiReceipts.length, core,
  protectedExistingFiles: provenance.productionProtection.protectedFiles }, null, 2));
