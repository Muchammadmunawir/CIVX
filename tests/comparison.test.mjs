import "./render-ui.mjs";
import test from "node:test";
import assert from "node:assert/strict";
const { selectComparison } = await import("../src/components/compare/comparison-selection.ts");
const { displayedDifference, signed } = await import("../src/components/compare/comparison-format.ts");
const { currentRegions } = await import("../src/lib/civx/current.ts");

const [a, b] = currentRegions;

test("all distinct published region pairs use the same current analytical contract", () => {
  for (let first = 0; first < currentRegions.length; first++) {
    for (let second = first + 1; second < currentRegions.length; second++) {
      const pair = selectComparison(currentRegions[first].id, currentRegions[second].id);
      assert.equal(pair.eligible, true);
      assert.equal(pair.a.pressure.methodologyVersion, pair.b.pressure.methodologyVersion);
      assert.deepEqual(pair.a.pressure.dimensions.flatMap(dimension => dimension.components.map(component => component.indicatorId)), pair.b.pressure.dimensions.flatMap(dimension => dimension.components.map(component => component.indicatorId)));
    }
  }
});

test("comparison defaults and region-detail handoff keep Region A with a distinct counterpart", () => {
  const defaults = selectComparison(undefined, undefined);
  assert.equal(defaults.eligible, true);
  assert.notEqual(defaults.a.id, defaults.b.id);
  const preselected = selectComparison(b.id, undefined);
  assert.equal(preselected.eligible, true);
  assert.equal(preselected.a.id, b.id);
  assert.notEqual(preselected.b.id, b.id);
  const swapped = selectComparison(b.id, a.id);
  assert.equal(swapped.eligible, true);
  assert.deepEqual([swapped.a.id, swapped.b.id], [b.id, a.id]);
});

test("unknown, identical, repeated and empty selections fail without silent substitution", () => {
  for (const [first, second] of [[a.id, a.id], ["unknown", b.id], [a.id, "unknown"], [[a.id, b.id], b.id], [a.id, [b.id]], ["", b.id], [a.id, ""], [undefined, b.id]]) {
    assert.equal(selectComparison(first, second).eligible, false);
  }
});

test("incomplete or incompatible released records cannot be compared", () => {
  const original = b.pressure;
  const boundary = b.boundaryReference;
  try {
    for (const change of [{ releaseId: "another-release" }, { methodologyVersion: "another-method" }, { referenceSetId: "another-reference" }, { period: "2022" }, { status: "unavailable", reason: "Missing required input" }]) {
      b.pressure = { ...original, ...change };
      assert.equal(selectComparison(a.id, b.id).eligible, false);
    }
    b.pressure = original;
    b.boundaryReference = "another-boundary";
    assert.equal(selectComparison(a.id, b.id).eligible, false);
  } finally {
    b.pressure = original;
    b.boundaryReference = boundary;
  }
});

test("comparison differences use displayed precision, retain direction and handle ties", () => {
  assert.equal(signed(displayedDifference(12.345, 10.111)), "+2.24");
  assert.equal(signed(displayedDifference(10.111, 12.345)), "-2.24");
  assert.equal(signed(displayedDifference(1234.567, 1200.002)), "+34.57");
  assert.equal(signed(displayedDifference(1.004, 1.001)), "0.00");
});
