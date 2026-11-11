import "./render-ui.mjs";
import test from "node:test";
import assert from "node:assert/strict";

const { encodeCsv2023, createExploreCsv2023 } = await import("../src/lib/civx/export-2023.ts");
const { getExploreRegionsProduct2023 } = await import("../src/lib/civx/product-2023.ts");

// Independent parser: record delimiters must be CRLF, including the final record.
// Newlines inside quoted cells remain data, not record delimiters.
function parseCsv(content) {
  assert.equal(content.codePointAt(0), 0xfeff, "Spreadsheet downloads need a UTF-8 BOM");
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  let closed = false;
  let started = false;
  for (let index = 1; index < content.length; index += 1) {
    const char = content[index];
    if (quoted) {
      if (char !== '"') {
        cell += char;
      } else if (content[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = false;
        closed = true;
      }
      continue;
    }
    if (char === ",") {
      row.push(cell);
      cell = "";
      closed = false;
      started = false;
    } else if (char === "\r") {
      assert.equal(content[index + 1], "\n", "Records must end with CRLF");
      index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      closed = false;
      started = false;
    } else if (char === '"') {
      assert.equal(started || closed, false, "Opening quote must begin a cell");
      quoted = true;
      started = true;
    } else {
      assert.notEqual(char, "\n", "Bare LF is not a record delimiter");
      assert.equal(closed, false, "Only a delimiter may follow a closing quote");
      cell += char;
      started = true;
    }
  }
  assert.equal(quoted, false, "Quoted cells must close");
  assert.equal(row.length, 0, "Final record must end with CRLF");
  assert.equal(started || closed, false, "Final cell must end with CRLF");
  return rows;
}


function identityCells(region) {
  return [region.id, region.name, region.type === "kabupaten" ? "Kabupaten" : "Kota", region.province, String(region.referenceYear)];
}

function dataRows(regions) {
  const rows = parseCsv(createExploreCsv2023(regions).content);
  assert.equal(rows.length, regions.length + 1, "Every selected identity needs one record, plus a header");
  assert.deepEqual(rows[0], ["Kode BPS", "Nama wilayah", "Jenis wilayah", "Provinsi", "Tahun acuan", "Sumber identitas"]);
  assert.ok(rows.every(row => row.length === 6), "Public export contains five identity cells and compact attribution only");
  return rows.slice(1);
}

test("CSV roundtrips commas, escaped quotes, multiline Unicode, and empty text without corrupting records", () => {
  const cells = [
    "Kabupaten, contoh",
    'Nama "wilayah"',
    "Baris satu\nBaris dua\r\nBaris tiga\rBaris empat",
    "Jawa Barat — café 中文 🌿",
    "",
    "teks biasa",
  ];
  const content = encodeCsv2023([cells, ["rekaman kedua", "", "akhir"]]);
  assert.deepEqual([...Buffer.from(content, "utf8").subarray(0, 3)], [0xef, 0xbb, 0xbf]);
  assert.deepEqual(parseCsv(content), [cells, ["rekaman kedua", "", "akhir"]]);
});

test("CSV neutralizes formula text after whitespace, control, and Unicode format prefixes", () => {
  const prefixes = ["", " ", "\t", "\r", "\n", "\u0000", "\u001f", "\u00a0", "\u200b", "\u200e", "\ufeff", " \t\u0000\u200b"];
  const formulas = prefixes.flatMap(prefix => ["=1+1", "+SUM(1,2)", "-42", "@SUM(1,2)"].map(formula => `${prefix}${formula}`));
  const [actual] = parseCsv(encodeCsv2023([formulas]));
  assert.deepEqual(actual, formulas.map(value => `'${value}`));
});

test("CSV protects leading tab and newline text while leaving benign text unchanged", () => {
  const unsafe = ["\tidentitas", "\ridentitas", "\nidentitas"];
  const safe = ["Bandung", "  Bandung", "wilayah=1", "2023", "'sudah teks", "Bogor\nJawa Barat"];
  assert.deepEqual(parseCsv(encodeCsv2023([[...unsafe, ...safe]])), [[...unsafe.map(value => `'${value}`), ...safe]]);
});

test("CSV preserves finite numeric precision, signed numbers, zero, and missing cells distinctly", () => {
  const numbers = [0, -42.125, 0.12345678901234568, Number.MAX_SAFE_INTEGER, Number.MIN_VALUE, Number.MAX_VALUE, 1e-20];
  const missing = [, null, undefined, ""];
  const [row] = parseCsv(encodeCsv2023([[...numbers, ...missing]]));
  assert.deepEqual(row.slice(0, numbers.length), numbers.map(String));
  assert.deepEqual(row.slice(numbers.length), ["", "", "", ""]);
  numbers.forEach((value, index) => assert.equal(Number(row[index]), value));
  assert.equal(row[0], "0");
  assert.equal(row[1], "-42.125", "Negative numeric values must not become apostrophe-prefixed text");
  assert.deepEqual(parseCsv(encodeCsv2023([[-42.125, "-42.125"]])), [["-42.125", "'-42.125"]]);
});

test("CSV rejects nonfinite numbers instead of publishing misleading numeric cells", () => {
  for (const value of [NaN, Infinity, -Infinity]) {
    assert.throws(() => encodeCsv2023([["wilayah", 0], [value]]), Error);
  }
});

test("Explore export preserves every canonical facade identity and reference year without score columns", () => {
  const regions = getExploreRegionsProduct2023().map(item => item.region);
  assert.equal(regions.length, 27);
  const rows = dataRows(regions);
  assert.deepEqual(rows, regions.map(region => [...identityCells(region), "BPS"]));
  assert.equal(new Set(rows.map(row => row[0])).size, regions.length);
  assert.ok(rows.every(row => row[4] === "2023"));
});

test("Explore export respects a selected name/type subset and its displayed order", () => {
  const selected = getExploreRegionsProduct2023()
    .map(item => item.region)
    .filter(region => region.type === "kota" && /Bogor|Bandung/.test(region.name))
    .reverse();
  assert.equal(selected.length, 2, "Fixture must select multiple cities with distinct names");
  assert.deepEqual(dataRows(selected).map(row => row.slice(0, 5)), selected.map(identityCells));
});


test("Explore export cannot leak extra CORE, CONTEXT, insight, raw-book, hash, or internal-path payloads", () => {
  const regions = getExploreRegionsProduct2023().map(item => item.region);
  const privatePayload = {
    core: { overallScore: 98.76543219876, dimensions: [{ score: 87.65432198765 }], indicators: [{ rawValue: "PRIVATE_RAW_VALUE" }] },
    context: [{ scope: "CONTEXT", value: "PRIVATE_CONTEXT_VALUE" }],
    insights: [{ text: "PRIVATE_INSIGHT_VALUE" }],
    rawBooks: [{ filename: "PRIVATE_BOOK.xlsx", content: "PRIVATE_BOOK_CONTENT" }],
    internalHash: "deadbeef1234567890PRIVATE_HASH",
    sourcePath: "/private/raw/PRIVATE_SOURCE.csv",
    frozenValuePointer: "/private/internal/PRIVATE_POINTER.json#/observations/0",
    scoreStatus: "RELEASED",
    insightStatus: "RELEASED",
    productionIntegrationAuthorized: true,
  };
  const poisoned = regions.map(region => ({ ...region, ...privatePayload }));
  const cleanRows = dataRows(regions);
  const exported = createExploreCsv2023(poisoned);
  assert.deepEqual(parseCsv(exported.content).slice(1), cleanRows);
  assert.doesNotMatch(exported.content, /PRIVATE_|98\.76543219876|87\.65432198765|deadbeef1234567890|\/private\//);
});

test("Explore export rejects an empty selection rather than downloading a header-only file", () => {
  assert.throws(() => createExploreCsv2023([]), Error);
});
