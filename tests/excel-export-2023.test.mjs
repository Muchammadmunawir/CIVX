import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { findElement, getChildElements, getMarkupInsideElement } from "write-excel-file/utility";
import { createExploreExcel2023 } from "../src/lib/civx/excel-export-2023.ts";
import { getExploreRegionsProduct2023 } from "../src/lib/civx/product-2023.ts";

// Unpack with the writer's installed ZIP codec, then inspect the emitted OOXML document.
// Independent openpyxl compatibility and font-fit checks run separately during browser QA.
const { unzipSync } = createRequire(import.meta.resolve("write-excel-file/universal"))("fflate");
const regions = getExploreRegionsProduct2023().map(view => view.region);
const noFilters = { q: "", type: "all" };

function decodeXml(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number(entity.slice(1)));
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[entity];
  });
}

async function readWorkbook(selected = regions, filters = noFilters) {
  const result = await createExploreExcel2023(selected, filters);
  const files = unzipSync(new Uint8Array(await result.content.arrayBuffer()));
  const xml = name => new TextDecoder().decode(files[name]);
  const stringsXml = xml("xl/sharedStrings.xml");
  const strings = getChildElements(stringsXml, findElement(stringsXml, "sst")).map(item => {
    const element = findElement(getMarkupInsideElement(stringsXml, item), "t");
    return decodeXml(getMarkupInsideElement(getMarkupInsideElement(stringsXml, item), element));
  });
  const workbookXml = xml("xl/workbook.xml");
  const sheets = getChildElements(workbookXml, findElement(workbookXml, "sheets")).map((sheet, index) => {
    const content = xml(`xl/worksheets/sheet${index + 1}.xml`);
    const rows = getChildElements(content, findElement(content, "sheetData")).map(row => ({
      number: Number(row.openingTagAttributes.r),
      cells: getChildElements(content, row).map(cell => {
        const valueElement = findElement(getMarkupInsideElement(content, cell), "v");
        const raw = valueElement ? getMarkupInsideElement(getMarkupInsideElement(content, cell), valueElement) : "";
        return { address: cell.openingTagAttributes.r, type: cell.openingTagAttributes.t, value: cell.openingTagAttributes.t === "s" ? strings[Number(raw)] : Number(raw), formula: Boolean(findElement(getMarkupInsideElement(content, cell), "f")) };
      }),
    }));
    // The utility's attribute parser omits whitespace-containing values, including sheet names.
    const openingTag = workbookXml.slice(sheet.openingTagStartIndex, sheet.openingTagEndIndex + 1);
    return { name: decodeXml(/\bname="([^"]*)"/.exec(openingTag)[1]), content, rows };
  });
  const data = sheets[0];
  const headerIndex = data.rows.findIndex(row => row.cells[0]?.value === "Kode BPS");
  return { result, files, sheets, data, header: data.rows[headerIndex], identities: data.rows.slice(headerIndex + 1), strings };
}

function identity(region) {
  return [region.id, region.name, region.type === "kabupaten" ? "Kabupaten" : "Kota", region.province, region.referenceYear, "BPS"];
}

const values = row => row.cells.map(cell => cell.value);

test("Excel contains all 27 canonical identity records with text BPS codes and numeric years", async () => {
  const workbook = await readWorkbook();
  assert.deepEqual(workbook.sheets.map(sheet => sheet.name), ["Data Wilayah", "Informasi Data"]);
  assert.equal(workbook.identities.length, 27);
  assert.deepEqual(workbook.identities.map(values), regions.map(identity));
  for (const row of workbook.identities) {
    assert.equal(row.cells[0].type, "s");
    assert.equal(typeof row.cells[4].value, "number");
    assert.equal(row.cells[4].value, 2023);
    assert.equal(row.cells.length, 6);
  }
});

test("Excel exports the full selected subset and records search and region type separately", async () => {
  const selected = regions.filter(region => region.type === "kota" && region.name.includes("Bandung"));
  const workbook = await readWorkbook(selected, { q: "Bandung", type: "kota" });
  assert.deepEqual(workbook.identities.map(values), selected.map(identity));
  const information = workbook.sheets[1].rows.flatMap(values);
  assert.ok(information.includes("Bandung"));
  assert.ok(information.includes("Kota"));
  assert.ok(information.includes(selected.length));
});

test("Excel keeps the actual table header frozen and filters every exported identity, not title rows", async () => {
  for (const selected of [regions, regions.filter(region => region.type === "kota")]) {
    const workbook = await readWorkbook(selected);
    const pane = findElement(workbook.data.content, "pane").openingTagAttributes;
    assert.equal(Number(pane.ySplit), workbook.header.number);
    assert.equal(pane.topLeftCell, `A${workbook.header.number + 1}`);
    assert.equal(pane.state, "frozen");
    assert.equal(findElement(workbook.data.content, "autoFilter").openingTagAttributes.ref, `A${workbook.header.number}:F${workbook.header.number + selected.length}`);
    const columns = getChildElements(workbook.data.content, findElement(workbook.data.content, "cols"));
    assert.equal(columns.length, 6);
    assert.ok(Number(columns[1].openingTagAttributes.width) > Math.max(...selected.map(region => region.name.length)));
    assert.equal(findElement(workbook.sheets[1].content, "autoFilter"), undefined);
  }
});

test("Excel preserves leading-zero identifiers and formula-like text without creating formulas", async () => {
  // Deliberately synthetic identities; never production records.
  const names = ["=1+1", "+SUM(1,2)", "-42", "@SUM(1,2)", "\t=1+1", "\u200b=1+1", 'Wilayah, "uji" & <teks> — 中文'];
  const synthetic = names.map((name, index) => ({ ...regions[0], id: `00${index}`, name }));
  const workbook = await readWorkbook(synthetic, { q: "=HYPERLINK(\"https://example.invalid\")", type: "all" });
  assert.deepEqual(workbook.identities.map(row => row.cells[0].value), synthetic.map(region => region.id));
  assert.deepEqual(workbook.identities.map(row => row.cells[1].value), names);
  assert.ok(workbook.sheets.flatMap(sheet => sheet.rows).flatMap(row => row.cells).every(cell => !cell.formula));
});

test("Excel cannot read extra analytical payloads or mutate the authoritative input", async () => {
  const before = JSON.stringify(regions);
  const poisoned = regions.map(region => Object.defineProperties({ ...region }, Object.fromEntries(
    ["core", "context", "insights", "sourcePath", "productionIntegrationAuthorized"].map(key => [key, { get() { throw new Error(`Forbidden payload read: ${key}`); } }]),
  )));
  const workbook = await readWorkbook(poisoned);
  assert.deepEqual(workbook.identities.map(values), regions.map(identity));
  assert.equal(JSON.stringify(regions), before);
});

test("Excel keeps external references on the information sheet and never embeds a local deployment address", async () => {
  const workbook = await readWorkbook();
  const identityValues = workbook.data.rows.flatMap(values);
  assert.ok(identityValues.every(value => typeof value !== "string" || !value.includes("https://")));
  const urls = workbook.sheets[1].rows.flatMap(values).filter(value => typeof value === "string" && value.startsWith("https://"));
  assert.equal(urls.length, 4);
  assert.ok(urls.some(value => new URL(value).hostname === "jabar.bps.go.id"));
  assert.ok(urls.every(value => ["github.com", "jabar.bps.go.id"].includes(new URL(value).hostname)));
  for (const file of Object.values(workbook.files)) assert.doesNotMatch(new TextDecoder().decode(file), /localhost|127\.0\.0\.1|LOCAL_RESTRICTED_REVIEW|skor_dimensi_|PRIVATE_/);
});

test("Excel rejects an empty selection instead of producing an empty analytical-looking workbook", async () => {
  await assert.rejects(createExploreExcel2023([], noFilters), Error);
});

test("Excel declares a valid default named style instead of relying on reader repair", async () => {
  const workbook = await readWorkbook();
  const xml = new TextDecoder().decode(workbook.files["xl/styles.xml"]);
  const namedStyles = getChildElements(xml, findElement(xml, "cellStyles"));
  const normal = namedStyles.find(style => style.openingTagAttributes.builtinId === "0");
  assert.equal(normal.openingTagAttributes.name, "Normal");
  const styleDefinitions = getChildElements(xml, findElement(xml, "cellStyleXfs"));
  const defaultStyleIndex = Number(normal.openingTagAttributes.xfId);
  assert.ok(Number.isInteger(defaultStyleIndex) && defaultStyleIndex >= 0 && defaultStyleIndex < styleDefinitions.length, "Normal must reference a declared style definition");
  const definition = styleDefinitions[defaultStyleIndex];
  const fonts = getChildElements(xml, findElement(xml, "fonts"));
  const defaultFontIndex = Number(definition.openingTagAttributes.fontId);
  assert.ok(Number.isInteger(defaultFontIndex) && defaultFontIndex >= 0 && defaultFontIndex < fonts.length, "Default style must reference a declared font");
});
