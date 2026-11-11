import "./render-ui.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Register the existing TSX/CSS loader before importing component dependencies.
const { ComparisonPressureChart, ComparisonDimensionPlot, PressureDifferenceChart } = await import("../src/components/charts/comparison-charts.tsx");
const { comparisonPressureData2023, PRESSURE_DIMENSIONS_2023 } = await import("../src/lib/civx/visualization-2023.ts");
const { getComparisonProductView2023 } = await import("../src/lib/civx/product-2023.ts");
const { formatDifference, formatScore } = await import("../src/components/product/format.ts");

const render = (Component, props) => renderToStaticMarkup(createElement(Component, props));
const escape = value => renderToStaticMarkup(createElement("span", null, String(value))).slice(6, -7);
const text = html => html.replace(/<[^>]*>/g, "");
const dimensionRows = html => [...html.matchAll(/<li\b[^>]*data-dimension-id="([^"]+)"[^>]*>([\s\S]*?)<\/li>/g)].map(match => ({ id: match[1], html: match[0] }));
const values = html => [...html.matchAll(/<data value="([^"]+)">([^<]*)<\/data>/g)].map(match => ({ value: Number(match[1]), display: match[2] }));
const projected = (a, b) => comparisonPressureData2023(getComparisonProductView2023(a, b));

function assertNumericRow(html, row, differenceFirst = false) {
  assert.ok(html.includes(`<h3 id="`));
  assert.ok(html.includes(`>${escape(row.label)}</h3>`), `${row.id} heading identifies values`);
  const expected = [
    { value: row.scoreA, display: escape(formatScore(row.scoreA)) },
    { value: row.scoreB, display: escape(formatScore(row.scoreB)) },
    { value: row.delta, display: escape(formatDifference(row.delta)) },
  ];
  assert.deepEqual(values(html), differenceFirst ? [expected[2]] : expected, `${row.id} numeric bindings retain full precision`);
  assert.ok(html.includes(`data-relation="${row.relation}"`));
  const group = html.match(/<div\b[^>]*role="group"[^>]*>/)?.[0];
  assert.ok(group?.includes('tabindex="0"'), "Whole row is keyboard focusable, not tiny points");
  for (const attribute of ["aria-labelledby", "aria-describedby"]) {
    const references = group.match(new RegExp(`${attribute}="([^"]+)"`))?.[1].split(" ");
    assert.ok(references?.length);
    for (const id of references) assert.ok(html.includes(`id="${id}"`), `${attribute} resolves inside row`);
  }
}

function assertDirection(html, row) {
  const content = text(html);
  if (row.relation === "EQUAL") {
    assert.match(content, /kedua wilayah sama/);
  } else {
    const side = row.relation === "A_HIGHER" ? "A" : "B";
    assert.ok(content.includes(`Tekanan relatif ${side} lebih tinggi`));
    assert.doesNotMatch(content, /kedua wilayah sama/);
  }
}

function assertDimensionView(data, view) {
  const html = render(ComparisonDimensionPlot, { data, view });
  assert.ok(html.includes(`data-comparison-view="${view}"`));
  const rows = dimensionRows(html);
  assert.deepEqual(rows.map(row => row.id), PRESSURE_DIMENSIONS_2023.map(row => row.id));
  assert.equal(rows.length, 6);
  for (const [index, rendered] of rows.entries()) {
    const row = data.dimensions[index];
    assertNumericRow(rendered.html, row);
    assertDirection(rendered.html, row, data);
    if (view === "points") {
      const points = [...rendered.html.matchAll(/<span\b[^>]*data-region-id="([^"]+)"[^>]*data-score="([^"]+)"[^>]*data-series="([^"]+)"[^>]*style="([^"]+)"/g)];
      assert.deepEqual(points.map(match => [match[1], Number(match[2]), match[3]]), [
        [data.regionA.id, row.scoreA, "a"], [data.regionB.id, row.scoreB, "b"],
      ]);
      assert.ok(points[0][4].includes(`left:${row.scoreA}%`));
      assert.ok(points[1][4].includes(`left:${row.scoreB}%`));
      assert.ok(rendered.html.includes(`style="left:${Math.min(row.scoreA, row.scoreB)}%;width:${row.absoluteDifference}%"`));
      assert.doesNotMatch(rendered.html, /data-side="[AB]"/);
    } else {
      for (const [side, score] of [["A", row.scoreA], ["B", row.scoreB]]) {
        assert.ok(rendered.html.includes(`data-side="${side}"><span style="width:${score}%"`));
      }
      assert.doesNotMatch(rendered.html, /data-region-id=/);
    }
  }
  return html;
}

function assertDifferenceOutput(data) {
  const html = render(PressureDifferenceChart, { data });
  const rows = dimensionRows(html);
  assert.deepEqual(rows.map(row => row.id), PRESSURE_DIMENSIONS_2023.map(row => row.id));
  assert.equal(rows.length, 6);
  for (const [index, rendered] of rows.entries()) {
    const row = data.dimensions[index];
    assertNumericRow(rendered.html, row, true);
    assertDirection(rendered.html, row, data);
    const endpoint = 50 + row.delta / 2;
    assert.ok(rendered.html.includes(`data-delta="${row.delta}"`));
    assert.ok(rendered.html.includes(`style="left:${Math.min(50, endpoint)}%;width:${Math.abs(row.delta) / 2}%"`));
    assert.ok(rendered.html.includes(`style="left:${endpoint}%"`));
  }
  assert.match(text(html), /−100.*\+100/);
  const details = html.match(/<details\b([^>]*)>([\s\S]*?)<\/details>/);
  assert.ok(details, "Indicator detail uses native disclosure");
  assert.doesNotMatch(details[1], /\bopen\b/, "All 18 indicators start collapsed");
  assert.match(details[2], /<summary>Lihat Perbedaan per Indikator<\/summary>/);
  const table = details[2].match(/<table\b[^>]*>([\s\S]*?)<\/table>/)?.[1];
  assert.ok(table, "Indicator details are semantic tabular numeric equivalents");
  assert.match(table, /<caption>/);
  assert.equal((table.match(/scope="col"/g) ?? []).length, 6);
  assert.ok(table.includes(escape(data.regionA.name)));
  assert.ok(table.includes(escape(data.regionB.name)));
  const indicators = [...table.matchAll(/<tr\b[^>]*data-indicator-id="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/g)];
  assert.deepEqual(indicators.map(match => match[1]), data.indicators.map(row => row.id));
  assert.equal(indicators.length, 18);
  for (const [index, indicator] of indicators.entries()) {
    const row = data.indicators[index];
    const cells = [...indicator[2].matchAll(/<(th|td)\b([^>]*)>([\s\S]*?)<\/(?:th|td)>/g)];
    assert.equal(cells[0][1], "th");
    assert.ok(cells[0][2].includes('scope="row"'));
    assert.equal(text(cells[0][3]), escape(row.label));
    assert.equal(text(cells[1][3]), escape(row.dimensionLabel));
    assert.deepEqual(values(indicator[2]), [
      { value: row.scoreA, display: escape(formatScore(row.scoreA)) },
      { value: row.scoreB, display: escape(formatScore(row.scoreB)) },
      { value: row.delta, display: escape(formatDifference(row.delta)) },
    ]);
    assertDirection(indicator[2], row, data);
  }
  return html;
}

test("comparison exposes one initial six-row point view, native view controls and named region legend", () => {
  const data = projected("3273", "3276");
  const html = render(ComparisonPressureChart, { data });
  assert.equal((html.match(/data-comparison-view=/g) ?? []).length, 1);
  assert.ok(html.includes('data-comparison-view="points"'));
  assert.equal(dimensionRows(html).length, 6);
  const buttons = [...html.matchAll(/<button\b([^>]*)>([^<]+)<\/button>/g)];
  assert.deepEqual(buttons.map(match => match[2]), ["Titik Perbandingan", "Batang Perbandingan"]);
  assert.ok(buttons[0][1].includes('aria-pressed="true"'));
  assert.ok(buttons[1][1].includes('aria-pressed="false"'));
  for (const button of buttons) {
    assert.ok(button[1].includes('type="button"'));
    const controlled = button[1].match(/aria-controls="([^"]+)"/)?.[1];
    assert.ok(controlled && html.includes(`id="${controlled}"`));
  }
  for (const region of [data.regionA, data.regionB]) assert.ok(html.includes(escape(region.name)));
  const labelled = html.match(/<section[^>]*aria-labelledby="([^"]+)"/)?.[1];
  const headings = [...html.matchAll(/<h2\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)];
  assert.ok(headings.some(heading => heading[1] === labelled && text(heading[2]).length > 0));
  assert.doesNotMatch(html, /<table|data-side="[AB]"/);
});

for (const [a, b] of [["3273", "3276"], ["3276", "3273"]]) {
  test(`both comparison modes and divergence consume exact facade projection ${a}/${b}`, () => {
    const data = projected(a, b);
    assertDimensionView(data, "points");
    assertDimensionView(data, "bars");
    assertDifferenceOutput(data);
  });
}

test("same-region comparison keeps both region markers and exact equality across dimensions and indicators", () => {
  const data = projected("3273", "3273");
  assertDimensionView(data, "points");
  assertDimensionView(data, "bars");
  assertDifferenceOutput(data);
});

test("test-only projected edges preserve endpoints, exact equality and tiny nonzero engine deltas", () => {
  const source = projected("3273", "3276");
  // Synthetic consumer inputs only. Recorded deltas intentionally stay authoritative;
  // subtracting these binary floating-point scores would produce different values.
  const edges = [
    [100, 0, 100, "A_HIGHER"], [0, 100, -100, "B_HIGHER"],
    [100, 100, 0, "EQUAL"], [50.00001, 50, 0.00001, "A_HIGHER"],
    [50, 50.00001, -0.00001, "B_HIGHER"], [0, 0, 0, "EQUAL"],
  ];
  const edgeRow = (row, index) => {
    const [scoreA, scoreB, delta, relation] = edges[index % edges.length];
    return { ...row, scoreA, scoreB, delta, absoluteDifference: Math.abs(delta), relation };
  };
  const data = { ...source, dimensions: source.dimensions.map(edgeRow), indicators: source.indicators.map(edgeRow) };
  assertDimensionView(data, "points");
  assertDimensionView(data, "bars");
  assertDifferenceOutput(data);
  for (const index of [3, 4]) {
    const row = data.dimensions[index];
    assert.equal(formatScore(row.scoreA), formatScore(row.scoreB));
    assert.notEqual(row.delta, row.scoreA - row.scoreB);
    assert.notEqual(formatDifference(row.delta), formatDifference(0));
  }
});
