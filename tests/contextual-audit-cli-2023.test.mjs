import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const root = new URL("../", import.meta.url);
const scriptPath = "scripts/audit-contextual-data-2023.mjs";
const protocolPath = "data/raw/contextual-audit-2023/protocol.json";
const catalogPath = "data/processed/contextual-data-catalog-2023.json";
const protocol = JSON.parse(readFileSync(new URL(protocolPath, root), "utf8"));
const hash = content => createHash("sha256").update(content).digest("hex");
function workspace(t) {
  const directory = mkdtempSync(join(tmpdir(), "civx-context-audit-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  for (const path of [protocolPath, ...protocol.domainAuditPaths, ...protocol.coreFingerprints.map(item => item.path), scriptPath, "src/lib/civx/contextual-data-2023.ts"]) {
    const destination = join(directory, path);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(new URL(path, root), destination);
  }
  writeFileSync(join(directory, "package.json"), '{"type":"module"}\n');
  return directory;
}
function run(directory, ...args) {
  return spawnSync(process.execPath, ["--permission", `--allow-fs-read=${directory}`, `--allow-fs-write=${directory}`, join(directory, scriptPath), ...args], {
    cwd: tmpdir(), encoding: "utf8", maxBuffer: 4 * 1024 * 1024,
  });
}
function succeeds(result) {
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
}
function fails(result, pattern) {
  assert.ifError(result.error);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, pattern);
}

test("offline contextual audit generates byte-identical artifacts from another working directory without CORE writes", t => {
  const directory = workspace(t);
  succeeds(run(directory));
  const first = readFileSync(join(directory, catalogPath));
  const catalog = JSON.parse(first);
  const datasets = catalog.candidates.filter(item => item.artifactPath !== null).map(item => item.artifactPath);
  const datasetBytes = new Map(datasets.map(path => [path, readFileSync(join(directory, path))]));
  succeeds(run(directory));
  succeeds(run(directory, "--check"));
  assert.deepEqual(readFileSync(join(directory, catalogPath)), first);
  for (const path of datasets) assert.deepEqual(readFileSync(join(directory, path)), datasetBytes.get(path));
  for (const entry of protocol.coreFingerprints) assert.equal(hash(readFileSync(join(directory, entry.path))), entry.sha256);
});

test("all protected CORE data, code and methodology drift fails before catalog creation", t => {
  const directory = workspace(t);
  for (const entry of protocol.coreFingerprints) {
    const path = join(directory, entry.path);
    const original = readFileSync(path);
    writeFileSync(path, Buffer.concat([original, Buffer.from("\n")]));
    fails(run(directory), /CORE_CHANGED/);
    assert.equal(existsSync(join(directory, catalogPath)), false);
    writeFileSync(path, original);
  }
});

test("check detects catalog and dataset byte drift without replacing outputs", t => {
  const directory = workspace(t);
  succeeds(run(directory));
  const catalogFile = join(directory, catalogPath);
  const catalogBytes = readFileSync(catalogFile);
  const catalog = JSON.parse(catalogBytes);
  writeFileSync(catalogFile, Buffer.concat([catalogBytes, Buffer.from("\n")]));
  fails(run(directory, "--check"), /CONTEXT_OUTPUT_DRIFT/);
  assert.equal(readFileSync(catalogFile).length, catalogBytes.length + 1);
  writeFileSync(catalogFile, catalogBytes);
  const dataset = catalog.candidates.find(item => item.artifactPath !== null);
  assert.ok(dataset);
  const path = join(directory, dataset.artifactPath);
  const original = readFileSync(path);
  writeFileSync(path, Buffer.concat([original, Buffer.from("\n")]));
  fails(run(directory, "--check"), /CONTEXT_OUTPUT_DRIFT/);
  assert.equal(readFileSync(path).length, original.length + 1);
});

test("missing check outputs and unknown arguments never create a catalog", t => {
  const directory = workspace(t);
  fails(run(directory, "--publish"), /Only --check is supported/);
  assert.equal(existsSync(join(directory, catalogPath)), false);
  fails(run(directory, "--check"), /ENOENT/);
  assert.equal(existsSync(join(directory, catalogPath)), false);
});

test("credential-shaped raw capture fails before any contextual output is written", t => {
  const directory = workspace(t);
  const path = join(directory, protocol.domainAuditPaths[0]);
  const audit = JSON.parse(readFileSync(path, "utf8"));
  audit.sources[0].evidence += " ghp_" + "A".repeat(30);
  writeFileSync(path, JSON.stringify(audit));
  fails(run(directory), /credential-like material detected/);
  assert.equal(existsSync(join(directory, catalogPath)), false);
});

test("obsolete contextual artifacts require explicit reviewed removal, not silent retention or deletion", t => {
  const directory = workspace(t);
  const path = join(directory, "data/processed/context/obsolete-context.json");
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, "{}\n");
  fails(run(directory), /STALE_CONTEXT_ARTIFACT/);
  assert.equal(readFileSync(path, "utf8"), "{}\n");
  assert.equal(existsSync(join(directory, catalogPath)), false);
});
