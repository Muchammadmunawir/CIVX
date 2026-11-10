import "./render-ui.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { prepareLocalAnalyticalReport2023 } from "../scripts/reporting/report-data-2023.ts";
import { renderLocalAnalyticalHtml2023 } from "../scripts/reporting/analytical-html-2023.ts";

const report = prepareLocalAnalyticalReport2023("3273", { q: "  Bandung  ", type: "kota" });
const decode = value => value.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => ({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" })[entity]);
const text = html => decode(html.replace(/<[^>]*>/g, ""));
const fields = html => new Map([...html.matchAll(/<dt>([\s\S]*?)<\/dt><dd>([\s\S]*?)<\/dd>/g)].map(([, label, value]) => [text(label), text(value)]));
const articles = html => [...html.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(([, content]) => content);
const numericValues = html => [...html.matchAll(/<data value="([^"]+)">([\s\S]*?)<\/data>|<data value="([^"]+)" title="[^"]*">([\s\S]*?)<\/data>/g)].map(match => ({ exact: Number(match[1] ?? match[3]), displayed: Number(text(match[2] ?? match[4]).replace(",", ".")) }));

function sourceFields(source) {
  return new Map([
    ["ID sumber", source.sourceId], ["Penerbit", source.publisher], ["Judul sumber", source.title],
    ["URL sumber", source.url], ["Lokasi tabel / halaman", source.locator],
    ["Tanggal publikasi", source.publicationDate], ["Tanggal akses", source.accessedAt],
  ]);
}

function assertNullableField(actual, label, expected) {
  assert.ok(actual.has(label), label);
  if (expected === null) assert.ok(Number.isNaN(Number(actual.get(label))), `${label}: absent metadata must not become a numeric value`);
  else assert.equal(actual.get(label), String(expected), label);
}

function assertSource(record, expected) {
  const actual = fields(record);
  for (const [key, value] of sourceFields(expected)) {
    assertNullableField(actual, key, value);
  }
  assert.ok([...record.matchAll(/href="([^"]*)"/g)].some(([, url]) => decode(url) === expected.url));
}

test("selected region identity, active filters and all six facade dimension values stay associated", () => {
  const html = renderLocalAnalyticalHtml2023(report);
  const header = html.match(/<header>([\s\S]*?)<\/header>/)[1];
  const identity = fields(header);
  const { region, core, methodology } = report.selected;
  for (const [label, value] of [
    ["Wilayah", region.name], ["Kode BPS", region.id], ["Jenis wilayah", region.type], ["Provinsi", region.province],
    ["Tahun acuan", String(region.referenceYear)], ["Filter pencarian", report.filters.q], ["Filter jenis wilayah", report.filters.type],
    ["ID model", methodology.modelId], ["Versi model", String(methodology.modelVersion)],
    ["Status skor", methodology.scoreStatus], ["Status insight", methodology.insightStatus],
    ["Integrasi produksi diizinkan", "false"], ["SHA-256 artefak skor", methodology.sources.scoreArtifact.sha256],
  ]) assert.equal(identity.get(label), value, label);
  assert.ok(text(header).includes(report.scope));
  assert.ok(text(html.match(/<h1>([\s\S]*?)<\/h1>/)[1]).includes(region.name));
  const overall = html.match(/<section aria-labelledby="overall-heading">([\s\S]*?)<\/section>/)[1];
  assert.deepEqual(numericValues(overall), [{ exact: core.overallScore, displayed: Number(core.overallScore.toFixed(1)) }]);
  const rows = [...html.match(/<tbody>([\s\S]*?)<\/tbody>/)[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)];
  assert.equal(rows.length, 6);
  for (const [index, [, row]] of rows.entries()) {
    const dimension = core.dimensions[index];
    assert.equal(text(row.match(/<th scope="row">([\s\S]*?)<\/th>/)[1]), dimension.displayName);
    assert.deepEqual(numericValues(row), [{ exact: dimension.score, displayed: Number(dimension.score.toFixed(1)) }]);
  }
});

test("all 18 indicators preserve values, definitions, periods, limitations and their three source roles", () => {
  const html = renderLocalAnalyticalHtml2023(report);
  const rendered = articles(html);
  assert.equal(rendered.length, 18);
  const bibliography = new Map([...html.matchAll(/<li id="(source-\d+)" class="source">([\s\S]*?)<\/li>/g)].map(([, id, record]) => [id, record]));
  for (const [index, indicator] of report.selected.core.indicators.entries()) {
    const article = rendered[index];
    const actual = fields(article);
    assert.equal(text(article.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)[1]), indicator.displayName);
    for (const [label, value] of [
      ["ID indikator", indicator.indicatorId], ["Dimensi", indicator.dimensionName], ["Nilai asli", String(indicator.rawValue)], ["Satuan", indicator.unit],
      ["Arah tekanan", indicator.pressureDirection], ["Periode rujukan", indicator.referencePeriod],
      ["Definisi", indicator.disclosure.definition], ["Pembilang", indicator.disclosure.numerator], ["Penyebut", indicator.disclosure.denominator],
    ]) assert.equal(actual.get(label), value, `${indicator.indicatorId}/${label}`);
    assert.deepEqual(numericValues(article), [
      { exact: indicator.rawValue, displayed: indicator.rawValue },
      { exact: indicator.normalizedPressure, displayed: Number(indicator.normalizedPressure.toFixed(1)) },
    ]);
    for (const limitation of indicator.disclosure.limitations) assert.ok(text(article).includes(limitation));
    const uncertainty = indicator.disclosure.uncertainty;
    for (const [label, value] of [
      ["Catatan ketidakpastian", uncertainty.note], ["Lokasi bukti ketidakpastian", uncertainty.sourceLocator],
      ["Penyebut tertimbang", uncertainty.weightedDenominator], ["Ukuran sampel tanpa bobot", uncertainty.unweightedSampleSize],
      ["Galat baku (poin persentase)", uncertainty.standardErrorPercentagePoints], ["Galat baku relatif (%)", uncertainty.relativeStandardErrorPercent],
    ]) assertNullableField(actual, label, value);
    if (uncertainty.rseGreaterThan25Percent === null) assertNullableField(actual, "RSE lebih dari 25%", null);
    else assert.equal(actual.get("RSE lebih dari 25%"), uncertainty.rseGreaterThan25Percent ? "Ya" : "Tidak");
    const interval = uncertainty.confidenceInterval;
    if (interval === null) assertNullableField(actual, "Interval kepercayaan", null);
    else assert.equal(actual.get("Interval kepercayaan"), `${interval.lower} hingga ${interval.upper}; tingkat kepercayaan ${interval.confidenceLevel} (proporsi)`);
    const roleLinks = new Map([...article.matchAll(/<dt>(Sumber (?:utama|pembilang|penyebut))<\/dt><dd>([\s\S]*?)<\/dd>/g)].map(([, role, content]) => [role, content]));
    for (const [role, source] of [
      ["Sumber utama", indicator.disclosure.source], ["Sumber pembilang", indicator.disclosure.numeratorSource], ["Sumber penyebut", indicator.disclosure.denominatorSource],
    ]) {
      const citation = roleLinks.get(role);
      if (source === null) assert.doesNotMatch(citation, /href=/);
      else {
        const target = citation.match(/href="#([^"]+)"/)[1];
        assert.ok(bibliography.has(target), `${indicator.indicatorId}/${role} resolves`);
        assertSource(bibliography.get(target), source);
      }
    }
  }
});

test("bibliography keeps distinct locators and dates for documents sharing URL or source ID", () => {
  // Synthetic clone stresses provenance identity; it is never used as report data outside this test.
  const synthetic = structuredClone(report);
  const source = synthetic.selected.core.indicators[0].disclosure.source;
  const changed = { ...source, locator: "Synthetic table: numerator", publicationDate: "2023-11-01", accessedAt: "2026-11-01" };
  synthetic.selected.core.indicators[0].disclosure.numeratorSource = changed;
  const denominator = { ...changed, locator: "Synthetic table: denominator", accessedAt: "2026-11-02" };
  synthetic.selected.core.indicators[0].disclosure.denominatorSource = denominator;
  const html = renderLocalAnalyticalHtml2023(synthetic);
  const bibliography = [...html.matchAll(/<li id="source-\d+" class="source">([\s\S]*?)<\/li>/g)].map(([, record]) => record);
  for (const expected of [source, changed, denominator]) {
    const matching = bibliography.find(record => fields(record).get("Lokasi tabel / halaman") === expected.locator && fields(record).get("Tanggal akses") === expected.accessedAt);
    assert.ok(matching);
    assertSource(matching, expected);
  }
});

test("null uncertainty stays unavailable while explicit zero and false remain distinct", () => {
  // Synthetic clone only: source absence and a published zero are intentionally different cases.
  const synthetic = structuredClone(report);
  const first = synthetic.selected.core.indicators[0];
  first.rawValue = 0;
  first.normalizedPressure = 0;
  first.disclosure.uncertainty = {
    note: null, sourceLocator: null, weightedDenominator: null, unweightedSampleSize: null, confidenceInterval: null,
    standardErrorPercentagePoints: null, relativeStandardErrorPercent: null, rseGreaterThan25Percent: null,
  };
  const absent = fields(articles(renderLocalAnalyticalHtml2023(synthetic))[0]);
  for (const label of ["Catatan ketidakpastian", "Lokasi bukti ketidakpastian", "Penyebut tertimbang", "Ukuran sampel tanpa bobot", "Interval kepercayaan", "Galat baku (poin persentase)", "Galat baku relatif (%)", "RSE lebih dari 25%"]) {
    assertNullableField(absent, label, null);
  }
  assert.equal(absent.get("Nilai asli"), "0");
  first.disclosure.uncertainty = {
    note: "Synthetic precision record", sourceLocator: "Synthetic table", weightedDenominator: 0, unweightedSampleSize: 0,
    confidenceInterval: { confidenceLevel: 0.95, lower: 0, upper: 0 }, standardErrorPercentagePoints: 0,
    relativeStandardErrorPercent: 0, rseGreaterThan25Percent: false,
  };
  const present = fields(articles(renderLocalAnalyticalHtml2023(synthetic))[0]);
  for (const label of ["Penyebut tertimbang", "Ukuran sampel tanpa bobot", "Galat baku (poin persentase)", "Galat baku relatif (%)"]) assert.equal(present.get(label), "0");
  assert.equal(present.get("RSE lebih dari 25%"), "Tidak");
  assert.equal(present.get("Interval kepercayaan"), "0 hingga 0; tingkat kepercayaan 0.95 (proporsi)");
  assert.equal(present.get("Catatan ketidakpastian"), "Synthetic precision record");
});

test("rendering neither mutates input nor reads excluded insight, CONTEXT, comparison or unselected payloads", () => {
  const before = structuredClone(report);
  const forbidden = () => { throw new Error("Excluded payload read"); };
  const core = { ...report.selected.core, get insights() { return forbidden(); } };
  const selected = { ...report.selected, core, get context() { return forbidden(); }, get similarity() { return forbidden(); }, get comparison() { return forbidden(); } };
  const guarded = { ...report, selected, get regions() { return forbidden(); }, get insights() { return forbidden(); } };
  renderLocalAnalyticalHtml2023(guarded);
  assert.deepEqual(report, before);
});

test("untrusted visible text and URL attributes cannot create markup, event handlers or script", () => {
  // Synthetic clone only: adversarial text deliberately crosses every rendered metadata group.
  const synthetic = structuredClone(report);
  const payload = '</dd><img src=x onerror="bad()"><script>bad()</script>&\'';
  const { selected } = synthetic;
  selected.region.name = payload;
  selected.region.province = payload;
  selected.methodology.modelId = payload;
  selected.methodology.notes = [payload];
  selected.methodology.interpretation = payload;
  synthetic.filters.q = payload;
  const indicator = selected.core.indicators[0];
  for (const key of ["displayName", "dimensionName", "unit", "referencePeriod", "pressureDirection"]) indicator[key] = payload;
  for (const key of ["definition", "numerator", "denominator"]) indicator.disclosure[key] = payload;
  indicator.disclosure.limitations = [payload];
  indicator.disclosure.uncertainty.note = payload;
  indicator.disclosure.uncertainty.sourceLocator = payload;
  for (const key of ["sourceId", "publisher", "title", "locator", "publicationDate", "accessedAt"]) indicator.disclosure.source[key] = payload;
  const url = 'https://example.test/?q=" onmouseover="bad()&x=<test>';
  indicator.disclosure.source.url = url;
  synthetic.references.methodologyUrl = url;
  const html = renderLocalAnalyticalHtml2023(synthetic);
  assert.equal(fields(html.match(/<header>([\s\S]*?)<\/header>/)[1]).get("Wilayah"), payload);
  const first = articles(html)[0];
  for (const key of ["Satuan", "Periode rujukan", "Definisi", "Pembilang", "Penyebut", "Catatan ketidakpastian", "Lokasi bukti ketidakpastian"]) assert.equal(fields(first).get(key), payload);
  assert.doesNotMatch(html, /<img\b|<svg\b|<iframe\b/i);
  assert.equal([...html.matchAll(/<script\b/g)].length, 1);
  assert.ok([...html.matchAll(/href="([^"]*)"/g)].some(([, href]) => decode(href) === url));
  for (const [, attributes] of html.matchAll(/<[a-z][a-z0-9]*\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi)) {
    const withoutQuotedValues = attributes.replace(/"[^"]*"|'[^']*'/g, '""');
    assert.doesNotMatch(withoutQuotedValues, /\son[a-z]+\s*=/i);
  }
});

test("non-HTTP source, operand and reference URLs fail closed", () => {
  for (const url of ["javascript:alert(1)", "java\nscript:alert(1)", "data:text/html,bad", "file:///tmp/private", "ftp://example.test/a", "//example.test/a", "/relative", "not a URL"]) {
    for (const role of ["source", "numeratorSource", "denominatorSource", "methodologyUrl", "sourcesUrl", "reportingUrl"]) {
      const synthetic = structuredClone(report);
      if (role.endsWith("Url")) synthetic.references[role] = url;
      else synthetic.selected.core.indicators[0].disclosure[role] = { ...synthetic.selected.core.indicators[0].disclosure.source, url };
      assert.throws(() => renderLocalAnalyticalHtml2023(synthetic), TypeError, `${role}: ${url}`);
    }
  }
});

test("local document allows only its hashed print script and no fetched executable assets", () => {
  const html = renderLocalAnalyticalHtml2023(report);
  const csp = decode(html.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/)[1]);
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(([, script]) => script);
  assert.equal(scripts.length, 1);
  const allowedScripts = csp.match(/script-src ([^;]+)/)[1];
  assert.doesNotMatch(allowedScripts, /unsafe-inline|https?:|\*/);
  assert.ok(csp.includes("default-src 'none'"));
  for (const script of scripts) {
    const hash = createHash("sha256").update(script).digest("base64");
    assert.ok(allowedScripts.includes(`'sha256-${hash}'`));
  }
  assert.doesNotMatch(html, /<(?:link|img|iframe|object|embed)\b|<script\b[^>]+src=/i);
});

test("non-numeric raw observations and out-of-scale pressures cannot become active attributes or fake data", () => {
  for (const value of [null, undefined, NaN, Infinity, '0%; color:red']) {
    const synthetic = structuredClone(report);
    synthetic.selected.core.indicators[0].rawValue = value;
    assert.throws(() => renderLocalAnalyticalHtml2023(synthetic), TypeError);
  }
  for (const value of [-1, 101]) {
    const synthetic = structuredClone(report);
    synthetic.selected.core.dimensions[0].score = value;
    assert.throws(() => renderLocalAnalyticalHtml2023(synthetic), RangeError);
  }
});
