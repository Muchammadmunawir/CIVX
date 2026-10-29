import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const root = new URL("../", import.meta.url);
const scoringPath = "data/processed/civx-scores-2023.json";
const outputPath = "data/processed/civx-insights-2023.json";
const generatorPath = "scripts/generate-civx-insights-2023.mjs";
const enginePath = "src/lib/civx/insights-2023.ts";
const scoring = JSON.parse(readFileSync(new URL(scoringPath, root), "utf8"));
const sourcePaths = [
  generatorPath, enginePath,
  "src/lib/civx/cohort-comparison-2023.ts",
  "src/lib/civx/insight-input-2023.ts",
  "src/lib/civx/insight-templates-2023.ts",
];
const hash = bytes => createHash("sha256").update(bytes).digest("hex");

function workspace(t) {
  const directory = mkdtempSync(join(tmpdir(), "civx-insights-2023-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const paths = new Set([
    scoringPath, ...sourcePaths,
    ...scoring.provenance.sourceManifest.map(({ path }) => path),
    ...scoring.provenance.verifiedEvidenceManifest.map(({ path }) => path),
    ...scoring.provenance.computationManifest.map(({ path }) => path),
  ]);
  for (const path of paths) {
    const destination = join(directory, path);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(new URL(path, root), destination);
  }
  writeFileSync(join(directory, "package.json"), '{"type":"module"}\n');
  return directory;
}
function run(directory, ...args) {
  // Deliberately run outside the fixture root: CLI must resolve from import.meta.url.
  return spawnSync(process.execPath, [join(directory, generatorPath), ...args], {
    cwd: tmpdir(), encoding: "utf8", maxBuffer: 16 * 1024 * 1024,
  });
}
function succeeds(result) {
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
}
function fails(result, pattern) {
  assert.ifError(result.error);
  assert.notEqual(result.status, 0, "CLI unexpectedly succeeded");
  assert.match(result.stderr, pattern);
}
function alteredEngine(directory, body, prelude = "") {
  const source = readFileSync(join(directory, enginePath), "utf8");
  const renamed = source.replace("export function generateInsights2023(", "function originalGenerateInsights2023(");
  assert.notEqual(renamed, source, "test must wrap the actual engine export");
  writeFileSync(join(directory, enginePath), `${renamed}\n${prelude}\nexport function generateInsights2023(input) {\nconst result = originalGenerateInsights2023(input);\n${body}\nreturn result;\n}\n`);
}

test("offline CLI deterministically generates and checks only its isolated output", t => {
  const directory = workspace(t);
  const sourceHashes = new Map([scoringPath, ...scoring.provenance.verifiedEvidenceManifest.map(({ path }) => path), ...scoring.provenance.computationManifest.map(({ path }) => path), ...sourcePaths].map(path => [path, hash(readFileSync(join(directory, path)))]));
  const generated = run(directory);
  succeeds(generated);
  assert.match(generated.stdout, /Generated .*27 regions, \d+ CORE insights/);
  const first = readFileSync(join(directory, outputPath));
  const output = JSON.parse(first);
  assert.equal(output.regions.length, 27);
  assert.equal(output.provenance.scoringPath, scoringPath);
  assert.equal(output.provenance.upstreamProvenancePointer, "/provenance");
  assert.deepEqual(output.provenance.sourceManifest, [{ path: scoringPath, sha256: "47b4813abd59bc452556e9d057596511f95e17acd81a4994589bc87460d9f6d5", bytes: readFileSync(join(directory, scoringPath)).length }]);
  assert.deepEqual(output.provenance.computationManifest.map(({ path }) => path), sourcePaths);
  for (const entry of output.provenance.computationManifest) {
    const bytes = readFileSync(join(directory, entry.path));
    assert.equal(entry.sha256, hash(bytes));
    assert.equal(entry.bytes, bytes.length);
  }
  const checked = run(directory, "--check");
  succeeds(checked);
  assert.match(checked.stdout, /Verified .*27 regions, \d+ CORE insights/);
  assert.deepEqual(readFileSync(join(directory, outputPath)), first);
  succeeds(run(directory));
  assert.deepEqual(readFileSync(join(directory, outputPath)), first);
  for (const [path, expected] of sourceHashes) assert.equal(hash(readFileSync(join(directory, path))), expected, `${path} mutated`);
});

test("check rejects output drift without replacing the output", t => {
  const directory = workspace(t);
  succeeds(run(directory));
  const drift = `${readFileSync(join(directory, outputPath), "utf8")}\n`;
  writeFileSync(join(directory, outputPath), drift);
  fails(run(directory, "--check"), /INSIGHT_OUTPUT_DRIFT/);
  assert.equal(readFileSync(join(directory, outputPath), "utf8"), drift);
});

test("check rejects computation source drift through receipt changes", t => {
  const directory = workspace(t);
  succeeds(run(directory));
  const output = readFileSync(join(directory, outputPath));
  writeFileSync(join(directory, enginePath), `${readFileSync(join(directory, enginePath), "utf8")}\n// Isolated test-only computation-source drift.\n`);
  fails(run(directory, "--check"), /INSIGHT_OUTPUT_DRIFT/);
  assert.deepEqual(readFileSync(join(directory, outputPath)), output);
});

test("CLI rejects pinned score drift before writing", t => {
  const directory = workspace(t);
  writeFileSync(join(directory, scoringPath), `${readFileSync(join(directory, scoringPath), "utf8")}\n`);
  fails(run(directory), /PINNED_SCORING_CHANGED/);
  assert.equal(existsSync(join(directory, outputPath)), false);
});

test("CLI rejects changed upstream evidence and scorer source receipts", async t => {
  for (const path of [scoring.provenance.verifiedEvidenceManifest[6].path, "src/lib/civx/scoring-2023.ts"]) {
    await t.test(path, child => {
      const directory = workspace(child);
      writeFileSync(join(directory, path), `${readFileSync(join(directory, path), "utf8")}\n`);
      fails(run(directory), /PINNED_EVIDENCE_CHANGED/);
      assert.equal(existsSync(join(directory, outputPath)), false);
    });
  }
});

test("CLI rejects unknown flags and check never creates missing output", t => {
  const directory = workspace(t);
  fails(run(directory, "--release"), /Only --check is supported/);
  assert.equal(existsSync(join(directory, outputPath)), false);
  fails(run(directory, "--check"), /ENOENT/);
  assert.equal(existsSync(join(directory, outputPath)), false);
});

for (const [label, body, pattern, prelude] of [
  ["raw-score copy drift", "result.regions[0].indicators[0].rawValue += 0.01;", /SCORING_RECORD_COPY_CHANGED/],
  ["dimension copy drift", "result.regions[0].dimensions[0].contributionToOverall += 0.01;", /SCORING_RECORD_COPY_CHANGED/],
  ["evidence pointer drift", 'result.regions[0].insights[0].evidence.overall.scoringPointer = "/regions/1/overallPressureScore";', /OVERALL_EVIDENCE_POINTER_CHANGED/],
  ["invalid percentile", "result.regions[0].overallProfile.percentile = Infinity;", /INVALID_COMPARISON_percentile/],
  ["unknown indicator", 'result.regions[0].indicators[0].indicatorId = "unknown";', /SCORING_RECORD_COPY_CHANGED/],
  ["empty message", 'result.regions[0].insights[0].message = " ";', /EMPTY_INSIGHT_MESSAGE/],
  ["input mutation", 'input.regions[0].province = "Changed";', /SCORING_INPUT_MUTATED/],
  ["nondeterministic generation", "result.regions[0].insights[0].message += String(++testCounter);", /NONDETERMINISTIC_INSIGHTS/, "let testCounter = 0;"],
]) {
  test(`CLI rejects ${label} before writing`, t => {
    const directory = workspace(t);
    alteredEngine(directory, body, prelude);
    fails(run(directory), pattern);
    assert.equal(existsSync(join(directory, outputPath)), false);
  });
}
