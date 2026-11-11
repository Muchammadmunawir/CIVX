import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createPrivateReportDirectory2023 } from "../scripts/reporting/private-output-2023.ts";
import { prepareLocalAnalyticalReport2023 } from "../scripts/reporting/report-data-2023.ts";
import { getExploreRegionsProduct2023, getRegionProductView2023 } from "../src/lib/civx/product-2023.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const command = join(root, "scripts/prepare-analytical-report-2023.ts");
const temporary = t => {
  const path = mkdtempSync(join(tmpdir(), "civx-report-test-"));
  t.after(() => rmSync(path, { recursive: true, force: true }));
  return path;
};
const run = (base, args) => spawnSync(process.execPath, [command, ...args], {
  cwd: root, encoding: "utf8", env: { ...process.env, TMPDIR: base },
});

for (const filters of [{ q: "", type: "all" }, { q: " bAnDuNg ", type: "all" }, { q: "Bandung", type: "kota" }]) {
  test(`local reporting selection preserves the full filtered cohort for ${JSON.stringify(filters)}`, () => {
    const before = JSON.stringify(getExploreRegionsProduct2023());
    const report = prepareLocalAnalyticalReport2023("3273", filters);
    const expected = getExploreRegionsProduct2023().filter(({ region }) =>
      (filters.type === "all" || region.type === filters.type) && region.name.toLowerCase().includes(filters.q.trim().toLowerCase()));
    assert.deepEqual(report.regions.map(view => view.region.id), expected.map(view => view.region.id));
    assert.equal(report.selected.region.id, "3273");
    assert.deepEqual(report.filters, filters);
    assert.equal(report.scope, "LOCAL_RESTRICTED_REVIEW");
    for (const region of report.regions) {
      assert.equal("context" in region, false);
      assert.equal("insights" in region.core, false);
      assert.equal(region.methodology.productionIntegrationAuthorized, false);
    }
    assert.equal(JSON.stringify(getExploreRegionsProduct2023()), before);
  });
}

test("local output cannot be placed inside a repository, including through a symlink", t => {
  const base = temporary(t);
  const repository = join(base, "project");
  const assets = join(repository, "public");
  const alias = join(base, "assets-alias");
  mkdirSync(assets, { recursive: true });
  symlinkSync(assets, alias, "dir");
  for (const path of [repository, assets, alias]) assert.throws(() => createPrivateReportDirectory2023(repository, path));
  assert.deepEqual(readdirSync(assets), []);
  const allowed = createPrivateReportDirectory2023(repository, base);
  assert.ok(relative(repository, realpathSync(allowed)).startsWith(`..${sep}`));
  if (process.platform !== "win32") assert.equal(statSync(allowed).mode & 0o777, 0o700);
});

test("real local command writes private analytical CSV and printable HTML for the requested filtered region", t => {
  const base = temporary(t);
  const result = run(base, ["--region", "3273", "--q", "Bandung", "--type", "kota"]);
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.scope, "LOCAL_RESTRICTED_REVIEW");
  assert.equal(output.regions, 1);
  assert.equal(relative(base, output.directory).split(sep).length, 1);
  const htmlPath = fileURLToPath(output.html);
  for (const path of [output.csv, htmlPath]) {
    assert.equal(relative(output.directory, path).split(sep).length, 1);
    if (process.platform !== "win32") assert.equal(statSync(path).mode & 0o777, 0o600);
  }
  if (process.platform !== "win32") assert.equal(statSync(output.directory).mode & 0o777, 0o700);
  const csv = readFileSync(output.csv, "utf8");
  assert.equal(csv.codePointAt(0), 0xfeff);
  assert.ok(csv.split("\r\n")[0].includes('"skor_civx"'));
  assert.ok(csv.includes(String(getRegionProductView2023("3273").core.overallScore)));
  assert.deepEqual([...csv.matchAll(/\r\n"(\d{4})",/g)].map(match => match[1]), ["3273"]);
  const html = readFileSync(htmlPath, "utf8");
  assert.ok(html.includes("Kota Bandung"));
  assert.ok(html.includes("LOCAL_RESTRICTED_REVIEW"));
});

test("invalid or publication/output arguments create no report files and never substitute a region", t => {
  const base = temporary(t);
  const cases = [
    [], ["--region", "unknown"], ["--region", "3273", "--type", "kabupaten"],
    ["--region", "3273", "--q", "zz-not-found"], ["--region", "3273", "--type", "province"],
    ["--region", "3273", "--public", "true"], ["--region", "3273", "--out", "public/reports"],
    ["--region", "3273", "--region", "3201"],
    ["--region", "3273", "--compare-with", "unknown"], ["--region", "3273", "--compare-with", ""],
    ["--region", "3273", "--compare-with"], ["--region", "3273", "--compare-with", "3201", "--public", "true"],
  ];
  for (const args of cases) {
    const result = run(base, args);
    assert.notEqual(result.status, 0, JSON.stringify(args));
    assert.equal(result.stdout, "");
    assert.deepEqual(readdirSync(base), []);
  }
});

test("explicit peer creates only an additional private comparison document without changing filtered CSV scope", t => {
  const base = temporary(t);
  const result = run(base, ["--region", "3273", "--q", "Bandung", "--type", "kota", "--compare-with", "3201"]);
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  const comparisonPath = fileURLToPath(output.comparisonHtml);
  assert.equal(output.regions, 1);
  assert.equal(relative(output.directory, comparisonPath).split(sep).length, 1);
  if (process.platform !== "win32") assert.equal(statSync(comparisonPath).mode & 0o777, 0o600);
  const html = readFileSync(comparisonPath, "utf8");
  for (const id of ["3273", "3201"]) assert.ok(html.includes(`Kode BPS ${id}`));
  assert.equal([...html.matchAll(/<tr data-indicator-id=/g)].length, 18);
  assert.deepEqual([...readFileSync(output.csv, "utf8").matchAll(/\r\n"(\d{4})",/g)].map(match => match[1]), ["3273"]);
  assert.equal(readdirSync(output.directory).length, 3);
});
