import test from "node:test";
import assert from "node:assert/strict";
import { findSimilarRegions2023, getSimilarRegions2023 } from "../src/lib/civx/similar-regions-2023.ts";
import { getExploreRegionsProduct2023 } from "../src/lib/civx/product-2023.ts";

// Synthetic test-only vectors. These values are not production observations.
const dimensionIds = ["socioeconomic", "education", "basic_services", "public_health", "disaster_pressure", "environment"];
function fixture(id, scores = [10, 10, 10, 10, 10, 10]) {
  return {
    region: { id, name: `Test-only ${id}`, type: id.startsWith("327") ? "kota" : "kabupaten", province: "Jawa Barat", referenceYear: 2023 },
    core: {
      scope: "CORE",
      dimensions: dimensionIds.map((dimensionId, index) => ({ dimensionId, displayName: dimensionId, scope: "CORE", score: scores[index] })),
    },
  };
}
const peerValues = peers => peers.map(peer => [peer.region.id, peer.distance]);

// Independent 3/4/5 triangles also distinguish Euclidean distance from Manhattan distance.
test("nearest peers use unrounded six-dimensional Euclidean distance, excluding selected identity and capping at three", () => {
  const cohort = [
    fixture("3201"), fixture("3205", [10, 10, 10, 10, 10, 16]),
    fixture("3204", [10, 10, 13, 14, 10, 10]), fixture("3203", [10, 14, 10, 10, 10, 10]),
    fixture("3202", [13, 10, 10, 10, 10, 10]),
  ];
  assert.deepEqual(peerValues(findSimilarRegions2023(cohort, "3201")), [["3202", 3], ["3203", 4], ["3204", 5]]);
  const allDimensions = findSimilarRegions2023([fixture("3201"), fixture("3202", [11, 12, 13, 14, 15, 16])], "3201");
  assert.equal(allDimensions[0].distance, Math.sqrt(91));
  const fractional = findSimilarRegions2023([
    fixture("3201"), fixture("3202", [10.004, 10, 10, 10, 10, 10]), fixture("3203", [10.003, 10, 10, 10, 10, 10]),
  ], "3201");
  assert.deepEqual(fractional.map(peer => peer.region.id), ["3203", "3202"]);
  assert.equal(fractional[0].distance, 10.003 - 10);
});

test("zero distance and valid scale endpoints remain recorded values", () => {
  const cohort = [fixture("3201", [0, 0, 0, 0, 0, 0]), fixture("3202", [0, 0, 0, 0, 0, 0]), fixture("3203", [100, 100, 100, 100, 100, 100])];
  assert.deepEqual(peerValues(findSimilarRegions2023(cohort, "3201")), [["3202", 0], ["3203", Math.sqrt(60000)]]);
});

test("exact-distance ties use canonical BPS ID order, never input order", () => {
  const cohort = [fixture("3271", [11, 10, 10, 10, 10, 10]), fixture("3201"), fixture("3218", [10, 11, 10, 10, 10, 10]), fixture("3202", [10, 10, 11, 10, 10, 10])];
  assert.deepEqual(peerValues(findSimilarRegions2023(cohort, "3201")), [["3202", 1], ["3218", 1], ["3271", 1]]);
});

test("up to three means no padding, while absent selected IDs return undefined", () => {
  const cohort = [fixture("3201"), fixture("3202"), fixture("3203"), fixture("3204"), fixture("3205")];
  for (let size = 1; size <= cohort.length; size += 1) {
    assert.equal(findSimilarRegions2023(cohort.slice(0, size), "3201").length, Math.min(3, size - 1));
  }
  assert.equal(findSimilarRegions2023([], "3201"), undefined);
  for (const id of ["unknown", "", "3201 ", " 3201", "3279"]) {
    assert.equal(findSimilarRegions2023(cohort, id), undefined);
  }
  assert.equal(getSimilarRegions2023("unknown"), undefined);
});

const invalidDimensions = [
  ["missing dimension", core => { core.dimensions.pop(); }],
  ["missing vector", core => { delete core.dimensions; }],
  ["missing score", core => { delete core.dimensions[0].score; }],
  ["null score", core => { core.dimensions[0].score = null; }],
  ["numeric string", core => { core.dimensions[0].score = "10"; }],
  ["duplicate dimension", core => { core.dimensions[1] = { ...core.dimensions[0] }; }],
  ["unknown dimension", core => { core.dimensions[0].dimensionId = "unknown"; }],
  ["extra dimension", core => { core.dimensions.push({ ...core.dimensions[0] }); }],
  ["missing dimension record", core => { core.dimensions[0] = undefined; }],
  ["non-CORE vector", core => { core.scope = "CONTEXT"; }],
  ["non-CORE dimension", core => { core.dimensions[0].scope = "CONTEXT"; }],
  ...[NaN, Infinity, -Infinity, -0.01, 100.01].map(score => [`invalid score ${score}`, core => { core.dimensions[0].score = score; }]),
];
for (const [label, invalidate] of invalidDimensions) {
  test(`rejects ${label} on selected regions and every candidate, without skipping or imputing`, () => {
    const invalid = fixture("3205", [100, 100, 100, 100, 100, 100]);
    invalidate(invalid.core);
    const cohort = [fixture("3201"), fixture("3202"), fixture("3203"), fixture("3204"), invalid];
    assert.throws(() => findSimilarRegions2023(cohort, "3201"), TypeError);
    assert.throws(() => findSimilarRegions2023(cohort, "3205"), TypeError);
    assert.throws(() => findSimilarRegions2023(cohort, "unknown"), TypeError);
  });
}

for (const [field, value] of [["referenceYear", 2024], ["province", "Jawa Tengah"], ["type", "province"], ["id", "3301"], ["id", "3299"]]) {
  test(`rejects incompatible cohort metadata: ${field}=${value}`, () => {
    const invalid = fixture("3202");
    invalid.region[field] = value;
    assert.throws(() => findSimilarRegions2023([fixture("3201"), invalid], "3201"), TypeError);
  });
}
test("duplicate region identities cannot displace a real peer", () => {
  assert.throws(() => findSimilarRegions2023([fixture("3201"), fixture("3202"), fixture("3202")], "3201"), TypeError);
});

test("cohort and dimension permutations leave distances, tie order, and canonical output dimensions unchanged", () => {
  const cohort = [fixture("3201"), fixture("3202", [11, 12, 13, 14, 15, 16]), fixture("3203", [11, 10, 10, 10, 10, 10]), fixture("3204", [10, 11, 10, 10, 10, 10]), fixture("3205", [11, 11, 11, 11, 11, 11])];
  const expected = findSimilarRegions2023(cohort, "3201");
  for (let offset = 0; offset < cohort.length; offset += 1) {
    const permuted = [...cohort.slice(offset), ...cohort.slice(0, offset)].reverse().map(view => ({
      ...view, core: { ...view.core, dimensions: [...view.core.dimensions].reverse() },
    }));
    assert.deepEqual(findSimilarRegions2023(permuted, "3201"), expected);
  }
  for (const peer of expected) assert.deepEqual(peer.dimensions.map(dimension => dimension.dimensionId), dimensionIds);
});

test("overall scores and CONTEXT are never read or used by the derived metric", () => {
  const forbidden = () => { throw new Error("Unrelated authoritative value accessed"); };
  const cohort = [fixture("3201"), fixture("3202", [13, 10, 10, 10, 10, 10])].map(view => ({
    ...view,
    get context() { return forbidden(); },
    core: { ...view.core, get overallScore() { return forbidden(); } },
  }));
  assert.deepEqual(peerValues(findSimilarRegions2023(cohort, "3201")), [["3202", 3]]);
});

test("mutable fixture inputs remain unchanged and unfrozen", () => {
  const cohort = [fixture("3201"), fixture("3202")];
  const before = structuredClone(cohort);
  findSimilarRegions2023(cohort, "3201");
  assert.deepEqual(cohort, before);
  assert.equal(Object.isFrozen(cohort), false);
  assert.equal(Object.isFrozen(cohort[1].region), false);
  assert.equal(Object.isFrozen(cohort[1].core.dimensions), false);
});

test("production wrapper derives three peers for every region without mutating frozen facade records", () => {
  const cohort = getExploreRegionsProduct2023();
  const before = JSON.stringify(cohort);
  assert.ok(Object.isFrozen(cohort));
  for (const view of cohort) {
    const peers = getSimilarRegions2023(view.region.id);
    assert.equal(peers.length, 3);
    assert.ok(peers.every(peer => peer.region.id !== view.region.id));
    for (const peer of peers) {
      const original = cohort.find(item => item.region.id === peer.region.id);
      assert.equal(peer.region, original.region);
      assert.ok(Object.isFrozen(original.region));
      assert.ok(Object.isFrozen(original.core.dimensions));
      assert.ok(peer.dimensions.every(dimension => Object.isFrozen(dimension) && original.core.dimensions.includes(dimension)));
    }
  }
  assert.equal(JSON.stringify(cohort), before);
});
