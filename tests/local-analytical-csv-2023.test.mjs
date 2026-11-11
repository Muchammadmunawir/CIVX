import "./render-ui.mjs";
import test from "node:test";
import assert from "node:assert/strict";

const { createLocalAnalyticalCsv2023 } = await import("../scripts/reporting/analytical-csv-2023.ts");
const { prepareLocalAnalyticalReport2023 } = await import("../scripts/reporting/report-data-2023.ts");
const { getExploreRegionsProduct2023, getRegionProductView2023 } = await import("../src/lib/civx/product-2023.ts");

// Decode independently from the exporter. Quoted newlines are cell data, not records.
function decodeCsv(content) {
  assert.deepEqual([...Buffer.from(content).subarray(0, 3)], [0xef, 0xbb, 0xbf]);
  const records = [];
  let record = [];
  let value = "";
  let state = "start";
  for (let index = 1; index < content.length; index += 1) {
    const char = content[index];
    if (state === "quoted") {
      if (char !== '"') value += char;
      else if (content[index + 1] === '"') {
        value += '"';
        index += 1;
      } else state = "closed";
    } else if (char === "," || char === "\r") {
      record.push(value);
      value = "";
      state = "start";
      if (char === "\r") {
        assert.equal(content[++index], "\n", "CSV records use CRLF");
        records.push(record);
        record = [];
      }
    } else if (char === '"' && state === "start") state = "quoted";
    else {
      assert.notEqual(state, "closed", "Closing quotes must precede a delimiter");
      assert.notEqual(char, '"', "Quotes must begin a quoted cell");
      assert.notEqual(char, "\n", "Bare LF must remain inside quoted cells");
      state = "unquoted";
      value += char;
    }
  }
  assert.equal(state, "start", "Final record ends with CRLF");
  assert.deepEqual(record, []);
  assert.equal(value, "");
  return records;
}

function exported(report) {
  const result = createLocalAnalyticalCsv2023(report);
  const [columns, ...values] = decodeCsv(result.content);
  assert.equal(new Set(columns).size, columns.length, "CSV columns must be unique");
  assert.ok(values.every(row => row.length === columns.length), "Each region needs every column");
  return { ...result, columns, rows: values.map(row => Object.fromEntries(columns.map((column, index) => [column, row[index]]))) };
}

const all = prepareLocalAnalyticalReport2023("3201");
const suffixes = [
  "nilai_asli", "satuan", "status_nilai", "periode_rujukan", "tekanan_ternormalisasi", "arah_tekanan",
  "definisi", "pembilang", "penyebut", "sumber_json", "ketidakpastian_json", "keterbatasan_json",
];

// All mutations and invented values below are test-only, never source/facade changes.
function singleRegionFixture() {
  const report = structuredClone(all);
  report.regions = [report.selected];
  return report;
}

function checkFacadeRows(report) {
  const result = exported(report);
  assert.deepEqual(result.rows.map(row => row.kode_bps), report.regions.map(item => item.region.id));
  for (const row of result.rows) {
    const view = getRegionProductView2023(row.kode_bps);
    assert.ok(view);
    const { region, core, methodology } = view;
    assert.equal(row.nama_wilayah, region.name);
    assert.equal(row.jenis_wilayah, region.type);
    assert.equal(row.provinsi, region.province);
    assert.equal(row.tahun_acuan, String(region.referenceYear));
    assert.equal(row.skor_civx, String(core.overallScore));
    assert.equal(Number(row.skor_civx), core.overallScore);
    for (const dimension of core.dimensions) {
      assert.equal(row[`skor_dimensi_${dimension.dimensionId}`], String(dimension.score));
      assert.equal(Number(row[`skor_dimensi_${dimension.dimensionId}`]), dimension.score);
    }
    assert.equal(row.filter_pencarian, report.filters.q);
    assert.equal(row.filter_jenis_wilayah, report.filters.type);
    assert.equal(row.cakupan_distribusi, "LOCAL_RESTRICTED_REVIEW");
    assert.equal(row.status_skor, methodology.scoreStatus);
    assert.equal(row.status_insight, methodology.insightStatus);
    assert.equal(row.integrasi_produksi_diizinkan, "false");
    assert.equal(row.id_model, methodology.modelId);
    assert.equal(row.versi_model, String(methodology.modelVersion));
    assert.equal(row.sha256_artefak_skor, methodology.sources.scoreArtifact.sha256);
    assert.equal(row.rujukan_metodologi, report.references.methodologyUrl);
    assert.equal(row.rujukan_sumber, report.references.sourcesUrl);
    assert.equal(row.ketentuan_pelaporan, report.references.reportingUrl);
    for (const indicator of core.indicators) {
      const field = suffix => row[`${indicator.indicatorId}__${suffix}`];
      assert.equal(field("nilai_asli"), String(indicator.rawValue));
      assert.equal(Number(field("nilai_asli")), indicator.rawValue);
      assert.equal(field("tekanan_ternormalisasi"), String(indicator.normalizedPressure));
      assert.equal(Number(field("tekanan_ternormalisasi")), indicator.normalizedPressure);
      assert.equal(field("satuan"), indicator.unit);
      assert.equal(field("periode_rujukan"), indicator.referencePeriod);
      assert.equal(field("status_nilai"), "TERSEDIA");
      assert.equal(field("arah_tekanan"), indicator.pressureDirection);
      for (const [suffix, key] of [["definisi", "definition"], ["pembilang", "numerator"], ["penyebut", "denominator"]]) {
        assert.equal(field(suffix), indicator.disclosure[key]);
      }
      assert.deepEqual(JSON.parse(field("sumber_json")), {
        source: indicator.disclosure.source,
        numeratorSource: indicator.disclosure.numeratorSource,
        denominatorSource: indicator.disclosure.denominatorSource,
      });
      assert.deepEqual(JSON.parse(field("ketidakpastian_json")), indicator.disclosure.uncertainty);
      assert.deepEqual(JSON.parse(field("keterbatasan_json")), indicator.disclosure.limitations);
    }
  }
  return result;
}

test("wide local CSV preserves every facade number and disclosure for all 27 regions", () => {
  assert.equal(getExploreRegionsProduct2023().length, 27);
  assert.equal(all.regions.length, 27);
  const result = checkFacadeRows(all);
  const canonical = getRegionProductView2023("3201");
  assert.equal(result.rows.length, 27);
  assert.deepEqual(result.columns, [
    "kode_bps", "nama_wilayah", "jenis_wilayah", "provinsi", "tahun_acuan", "skor_civx",
    ...canonical.core.dimensions.map(item => `skor_dimensi_${item.dimensionId}`),
    "filter_pencarian", "filter_jenis_wilayah", "cakupan_distribusi", "status_skor", "status_insight", "integrasi_produksi_diizinkan",
    "id_model", "versi_model", "sha256_artefak_skor", "rujukan_metodologi", "rujukan_sumber", "ketentuan_pelaporan",
    ...canonical.core.indicators.flatMap(item => suffixes.map(suffix => `${item.indicatorId}__${suffix}`)),
  ]);
  assert.equal(result.columns.length, 240);
  assert.match(result.filename, /analitis-lokal-27-wilayah\.csv$/);
  assert.equal(result.rows[0].kode_bps, "3201");
  assert.equal(result.rows.at(-1).kode_bps, "3279");
});

test("CSV exports full filtered selection in facade order and preserves meaningful original query text", () => {
  for (const filters of [
    { q: "  bAnDuNg  ", type: "all" },
    { q: "", type: "kota" },
    { q: "", type: "kabupaten" },
    { q: "  BOGOR  ", type: "kota" },
  ]) {
    const expected = getExploreRegionsProduct2023().filter(({ region }) =>
      region.name.toLocaleLowerCase("id").includes(filters.q.trim().toLocaleLowerCase("id")) && (filters.type === "all" || region.type === filters.type));
    const selected = expected.at(-1).region.id;
    const report = prepareLocalAnalyticalReport2023(selected, filters);
    const result = checkFacadeRows(report);
    assert.deepEqual(result.rows.map(row => row.kode_bps), expected.map(item => item.region.id));
    assert.equal(result.rows.length, expected.length, "Selected region must not reduce CSV to one row or one page");
    assert.equal(result.rows.at(-1).kode_bps, selected);
  }
});

test("numeric zero, full precision, negative numbers and null uncertainty remain distinct", () => {
  const report = singleRegionFixture();
  const { core } = report.selected;
  core.overallScore = 0;
  core.dimensions[0].score = 0;
  const indicator = core.indicators[0];
  indicator.rawValue = 0;
  indicator.normalizedPressure = 0;
  indicator.disclosure.uncertainty = {
    note: null, sourceLocator: null, weightedDenominator: 0, unweightedSampleSize: null,
    confidenceInterval: { confidenceLevel: 0, lower: 0, upper: 0 },
    standardErrorPercentagePoints: 0, relativeStandardErrorPercent: null, rseGreaterThan25Percent: false,
  };
  indicator.disclosure.source.title = null;
  indicator.disclosure.source.locator = "0";
  indicator.disclosure.numeratorSource = null;
  indicator.disclosure.denominatorSource = { ...indicator.disclosure.source, title: "" };
  core.indicators[1].rawValue = -42.12345678901234;
  core.indicators[2].normalizedPressure = 0.12345678901234568;
  const [row] = exported(report).rows;
  assert.equal(row.skor_civx, "0");
  assert.equal(row[`skor_dimensi_${core.dimensions[0].dimensionId}`], "0");
  assert.equal(row[`${indicator.indicatorId}__nilai_asli`], "0");
  assert.equal(row[`${indicator.indicatorId}__tekanan_ternormalisasi`], "0");
  assert.equal(row[`${indicator.indicatorId}__status_nilai`], "TERSEDIA");
  assert.equal(row[`${core.indicators[1].indicatorId}__nilai_asli`], "-42.12345678901234");
  assert.equal(row[`${core.indicators[2].indicatorId}__tekanan_ternormalisasi`], "0.12345678901234568");
  const uncertainty = JSON.parse(row[`${indicator.indicatorId}__ketidakpastian_json`]);
  assert.deepEqual(uncertainty, indicator.disclosure.uncertainty);
  assert.notEqual(uncertainty.weightedDenominator, uncertainty.unweightedSampleSize);
  const sources = JSON.parse(row[`${indicator.indicatorId}__sumber_json`]);
  assert.equal(sources.source.title, null);
  assert.equal(sources.source.locator, "0");
  assert.equal(sources.numeratorSource, null);
  assert.equal(sources.denominatorSource.title, "");
});

test("CSV safely roundtrips quotes, commas, multilingual text, multiline metadata and JSON", () => {
  const report = singleRegionFixture();
  const payload = 'Nama, "kutipan" — café 中文 🌿\nBaris dua\r\nBaris tiga\rBaris empat';
  report.selected.region.name = payload;
  const indicator = report.selected.core.indicators[0];
  indicator.unit = payload;
  indicator.referencePeriod = payload;
  indicator.disclosure.definition = payload;
  indicator.disclosure.numerator = payload;
  indicator.disclosure.denominator = payload;
  indicator.disclosure.source.title = payload;
  indicator.disclosure.uncertainty.note = payload;
  indicator.disclosure.limitations = [payload, "", "=SUM(1,2)"];
  report.references.sourcesUrl = 'https://example.invalid/sumber?judul="a,b"';
  const [row] = exported(report).rows;
  assert.equal(row.nama_wilayah, payload);
  for (const suffix of ["satuan", "periode_rujukan", "definisi", "pembilang", "penyebut"]) {
    assert.equal(row[`${indicator.indicatorId}__${suffix}`], payload);
  }
  assert.equal(JSON.parse(row[`${indicator.indicatorId}__sumber_json`]).source.title, payload);
  assert.equal(JSON.parse(row[`${indicator.indicatorId}__ketidakpastian_json`]).note, payload);
  assert.deepEqual(JSON.parse(row[`${indicator.indicatorId}__keterbatasan_json`]), indicator.disclosure.limitations);
  assert.equal(row.rujukan_sumber, report.references.sourcesUrl);
});

test("local CSV neutralizes formulas after whitespace, controls and Unicode format characters", () => {
  const prefixes = ["", " ", "\t", "\r", "\n", "\u0000", "\u001f", "\u00a0", "\u200b", "\u200e", "\ufeff", " \t\u0000\u200b"];
  for (const prefix of prefixes) {
    const report = singleRegionFixture();
    const indicator = report.selected.core.indicators[0];
    report.selected.region.name = `${prefix}=1+1`;
    indicator.unit = `${prefix}+SUM(1,2)`;
    indicator.disclosure.definition = `${prefix}-42`;
    report.references.methodologyUrl = `${prefix}@SUM(1,2)`;
    indicator.disclosure.source.title = `${prefix}=SUM(1,2)`;
    const [row] = exported(report).rows;
    assert.equal(row.nama_wilayah, `'${report.selected.region.name}`);
    assert.equal(row[`${indicator.indicatorId}__satuan`], `'${indicator.unit}`);
    assert.equal(row[`${indicator.indicatorId}__definisi`], `'${indicator.disclosure.definition}`);
    assert.equal(row.rujukan_metodologi, `'${report.references.methodologyUrl}`);
    assert.equal(JSON.parse(row[`${indicator.indicatorId}__sumber_json`]).source.title, indicator.disclosure.source.title);
  }
});

test("export leaves caller data and frozen facade data unchanged", () => {
  const before = structuredClone(all);
  createLocalAnalyticalCsv2023(all);
  assert.deepEqual(all, before);
  const mutable = singleRegionFixture();
  const snapshot = structuredClone(mutable);
  createLocalAnalyticalCsv2023(mutable);
  assert.deepEqual(mutable, snapshot);
});

test("nonfinite required numbers and uncertainty fail instead of becoming missing JSON values", () => {
  const targets = [
    report => [report.selected.core, "overallScore"],
    report => [report.selected.core.dimensions[0], "score"],
    report => [report.selected.core.indicators[0], "rawValue"],
    report => [report.selected.core.indicators[0], "normalizedPressure"],
    report => [report.selected.methodology, "modelVersion"],
    ...["weightedDenominator", "unweightedSampleSize", "standardErrorPercentagePoints", "relativeStandardErrorPercent"].map(key => report => [report.selected.core.indicators[0].disclosure.uncertainty, key]),
    ...["confidenceLevel", "lower", "upper"].map(key => report => {
      const uncertainty = report.selected.core.indicators[0].disclosure.uncertainty;
      uncertainty.confidenceInterval = { confidenceLevel: 0.95, lower: 0, upper: 1 };
      return [uncertainty.confidenceInterval, key];
    }),
  ];
  for (const value of [NaN, Infinity, -Infinity]) {
    for (const target of targets) {
      const report = singleRegionFixture();
      const [object, key] = target(report);
      object[key] = value;
      assert.throws(() => createLocalAnalyticalCsv2023(report), TypeError, `${key}: ${value}`);
    }
  }
});

test("invalid or incomplete payloads fail without header-only output, partial scores or imputation", () => {
  const changes = [
    report => { report.regions = []; },
    report => { report.scope = "PUBLIC"; },
    report => { report.filters.type = "semua"; },
    report => { report.filters.q = null; },
    report => { report.filters.q = "tidak cocok"; },
    report => { report.selected = { region: { id: "9999" } }; },
    report => { report.regions.push(report.selected); },
    report => { report.selected.core.scope = "CONTEXT"; },
    report => { report.selected.core.dimensions.pop(); },
    report => { report.selected.core.dimensions.reverse(); },
    report => { report.selected.core.indicators.pop(); },
    report => { report.selected.core.indicators.reverse(); },
    report => { report.selected.core.indicators[0].indicatorId = "unknown_core_indicator"; },
    report => { delete report.selected.core.indicators[0]; },
    report => { report.selected.core.indicators[1].indicatorId = report.selected.core.indicators[0].indicatorId; },
    report => { report.selected.core.indicators[0].scope = "CONTEXT"; },
    report => { report.selected.core.indicators[0].rawValue = null; },
    report => { report.selected.core.indicators[0].rawValue = "0"; },
    report => { report.selected.core.indicators[0].normalizedPressure = undefined; },
    report => { report.selected.core.indicators[0].normalizedPressure = 101; },
    report => { report.selected.core.overallScore = -1; },
    report => { delete report.selected.core.indicators[0].disclosure.source.title; },
    report => { delete report.selected.core.indicators[0].disclosure.numeratorSource; },
    report => { delete report.selected.core.indicators[0].disclosure.uncertainty.weightedDenominator; },
    report => { report.selected.core.indicators[0].disclosure.limitations = [null]; },
    report => { report.selected.methodology.productionIntegrationAuthorized = true; },
    report => { report.references = null; },
  ];
  assert.throws(() => createLocalAnalyticalCsv2023(null), TypeError);
  for (const change of changes) {
    const report = singleRegionFixture();
    change(report);
    assert.throws(() => createLocalAnalyticalCsv2023(report), TypeError);
  }
  const unordered = structuredClone(all);
  unordered.regions.reverse();
  assert.throws(() => createLocalAnalyticalCsv2023(unordered), TypeError);
  const mismatched = structuredClone(all);
  mismatched.regions[1].core.indicators.reverse();
  assert.throws(() => createLocalAnalyticalCsv2023(mismatched), TypeError);
});

test("excluded scopes, insights, classifications, source books and internal pointers never enter CSV", () => {
  const report = singleRegionFixture();
  const baseline = createLocalAnalyticalCsv2023(report).content;
  const marker = "PRIVATE_EXCLUDED_PAYLOAD";
  report.context = [{ scope: "CONTEXT", value: marker }];
  report.similarity = marker;
  report.selected.context = [{ scope: "CONTEXT", value: marker }];
  report.selected.core.insights = [{ text: marker }];
  report.selected.core.rank = marker;
  report.selected.core.classification = marker;
  report.selected.methodology.sources.insightArtifact.path = marker;
  report.selected.methodology.sources.freezePath = marker;
  const indicator = report.selected.core.indicators[0];
  indicator.disclosure.scoringPointer = marker;
  indicator.disclosure.frozenIndicatorPointer = marker;
  indicator.disclosure.frozenValuePointer = marker;
  indicator.disclosure.normalizationValuePointer = marker;
  indicator.disclosure.rawBooks = [{ content: marker }];
  indicator.disclosure.source.context = marker;
  indicator.disclosure.uncertainty.insights = marker;
  const result = createLocalAnalyticalCsv2023(report);
  assert.equal(result.content, baseline);
  assert.doesNotMatch(result.content, /PRIVATE_EXCLUDED_PAYLOAD|scoringPointer|frozenValuePointer|normalizationValuePointer/);
});
