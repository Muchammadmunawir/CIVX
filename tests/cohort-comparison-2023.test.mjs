import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyPercentile2023,
  compareCohort2023,
} from "../src/lib/civx/cohort-comparison-2023.ts";

// All vectors are synthetic arithmetic fixtures, not regional observations.
test("hand-computable cohort preserves input order and exposes exact comparison facts", () => {
  const actual = compareCohort2023([50, 10, 30, 20, 40]);
  const expected = [
    [50, 100, 5, 20, 4, 0, "relatively_high"],
    [10, 0, 1, -20, 0, 4, "relatively_low"],
    [30, 50, 3, 0, 2, 2, "middle"],
    [20, 25, 2, -10, 1, 3, "lower_middle"],
    [40, 75, 4, 10, 3, 1, "higher_middle"],
  ].map(([value, percentile, midrank, differenceFromMedian, regionsBelow, regionsAbove, classification]) => ({
    value,
    percentile,
    midrank,
    cohortMedian: 30,
    differenceFromMedian,
    regionsBelow,
    regionsAbove,
    tiedRegionCount: 1,
    cohortSize: 5,
    classification,
  }));
  assert.deepEqual(actual, expected);
});

test("ties at both extrema and the interior receive ascending average ranks", () => {
  const actual = compareCohort2023([9, 1, 4, 9, 1, 4, 4]);
  const byValue = new Map([
    [1, { midrank: 1.5, percentile: 100 / 12, below: 0, above: 5, ties: 2 }],
    [4, { midrank: 4, percentile: 50, below: 2, above: 2, ties: 3 }],
    [9, { midrank: 6.5, percentile: 550 / 6, below: 5, above: 0, ties: 2 }],
  ]);
  for (const result of actual) {
    const expected = byValue.get(result.value);
    assert.equal(result.midrank, expected.midrank);
    assert.equal(result.percentile, expected.percentile);
    assert.equal(result.cohortMedian, 4);
    assert.equal(result.differenceFromMedian, result.value - 4);
    assert.equal(result.regionsBelow, expected.below);
    assert.equal(result.regionsAbove, expected.above);
    assert.equal(result.tiedRegionCount, expected.ties);
    assert.equal(result.regionsBelow + result.regionsAbove + result.tiedRegionCount, 7);
  }
  assert.deepEqual(actual[0], actual[3]);
  assert.notEqual(actual[0], actual[3]);
});

test("singleton and all-equal cohorts have midpoint percentile and count every tie", () => {
  for (const size of [1, 2, 5, 27]) {
    const actual = compareCohort2023(Array(size).fill(17));
    assert.equal(actual.length, size);
    for (const result of actual) {
      assert.deepEqual(result, {
        value: 17,
        percentile: 50,
        midrank: (size + 1) / 2,
        cohortMedian: 17,
        differenceFromMedian: 0,
        regionsBelow: 0,
        regionsAbove: 0,
        tiedRegionCount: size,
        cohortSize: size,
        classification: "middle",
      });
    }
  }
});

test("ordinary even median averages central observations without aggregating scores", () => {
  const actual = compareCohort2023([1000, -10, 5, 1]);
  assert.deepEqual(actual.map(result => result.cohortMedian), [3, 3, 3, 3]);
  assert.deepEqual(actual.map(result => result.differenceFromMedian), [997, -13, 2, -2]);
  assert.deepEqual(actual.map(result => result.midrank), [4, 1, 3, 2]);
  assert.deepEqual(actual.map(result => result.percentile), [100, 0, 200 / 3, 100 / 3]);
});

test("median remains finite for large finite central observations", () => {
  const maximum = Number.MAX_VALUE;
  for (const values of [[maximum / 2, maximum], [-maximum, -maximum / 2]]) {
    const result = compareCohort2023(values);
    assert.equal(result[0].cohortMedian, Math.sign(values[0]) * (maximum / 2 + maximum / 4));
    assert.ok(Number.isFinite(result[0].cohortMedian));
  }
  assert.equal(compareCohort2023([-maximum, maximum])[0].cohortMedian, 0);
});

test("quintile boundaries belong to the interval starting at that boundary", () => {
  const cases = [
    [0, "relatively_low"],
    [19.999999999, "relatively_low"],
    [20, "lower_middle"],
    [39.999999999, "lower_middle"],
    [40, "middle"],
    [59.999999999, "middle"],
    [60, "higher_middle"],
    [79.999999999, "higher_middle"],
    [80, "relatively_high"],
    [100, "relatively_high"],
  ];
  for (const [percentile, classification] of cases) {
    assert.equal(classifyPercentile2023(percentile), classification);
  }
  const actual = compareCohort2023([0, 1, 2, 3, 4, 5]);
  assert.deepEqual(actual.map(result => result.percentile), [0, 20, 40, 60, 80, 100]);
  assert.deepEqual(actual.map(result => result.classification), [
    "relatively_low", "lower_middle", "middle", "higher_middle", "relatively_high", "relatively_high",
  ]);
});

test("exact equality alone determines ties, not rounding or tolerances", () => {
  const actual = compareCohort2023([1, 1 + Number.EPSILON, 2]);
  assert.deepEqual(actual.map(result => result.tiedRegionCount), [1, 1, 1]);
  assert.deepEqual(actual.map(result => result.midrank), [1, 2, 3]);
  assert.deepEqual(actual.map(result => result.percentile), [0, 50, 100]);
  const zeroes = compareCohort2023([-0, 0]);
  assert.deepEqual(zeroes.map(result => result.tiedRegionCount), [2, 2]);
  assert.deepEqual(zeroes.map(result => result.percentile), [50, 50]);
  assert.ok(Object.is(zeroes[0].value, -0));
  assert.ok(Object.is(zeroes[1].value, 0));
});

test("comparisons do not mutate input and remain deterministic under reorderings", () => {
  const values = Object.freeze([30, 10, 20, 10, 50, 40]);
  const before = [...values];
  const original = compareCohort2023(values);
  assert.deepEqual(values, before);
  assert.deepEqual(compareCohort2023(values), original);
  for (const order of [[5, 4, 3, 2, 1, 0], [3, 0, 5, 1, 4, 2], [1, 2, 3, 4, 5, 0]]) {
    const reordered = compareCohort2023(Object.freeze(order.map(index => values[index])));
    assert.deepEqual(reordered, order.map(index => original[index]));
  }
  for (const result of original) {
    assert.ok(Number.isFinite(result.percentile));
    assert.ok(result.percentile >= 0 && result.percentile <= 100);
  }
});

test("cohort rejects empty, non-array, sparse, nonnumeric, and nonfinite inputs", () => {
  for (const input of [[], null, undefined, {}, "123", new Float64Array([1, 2]), [1, , 3]]) {
    assert.throws(() => compareCohort2023(input), Error);
  }
  for (const value of [NaN, Infinity, -Infinity, "2", null, undefined, true, {}, [], 2n]) {
    assert.throws(() => compareCohort2023([1, value, 3]), Error);
  }
});

test("percentile classifier rejects values outside its finite numeric domain", () => {
  for (const value of [-Number.EPSILON, 100.000000001, NaN, Infinity, -Infinity, "20", null, undefined, true, {}, [], 20n]) {
    assert.throws(() => classifyPercentile2023(value), Error);
  }
});
