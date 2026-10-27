import test from "node:test";
import assert from "node:assert/strict";
import { getPublishedContext } from "../src/lib/civx/coverage.ts";

// Synthetic records only: no values from this test enter a CIVX release.
const region = (id, score) => ({
  id,
  name: `Test ${id}`,
  civicIndex: score === null ? { status: "unavailable", reason: "missing" } : { status: "available", score },
});

test("published context excludes unavailable records, orders scores, and shares tied positions", () => {
  const context = getPublishedContext([
    region("low", 20), region("missing", null), region("top-b", 80), region("top-a", 80), region("middle", 40),
  ]);
  assert.deepEqual(context.ordered.map(({ id }) => id), ["top-a", "top-b", "middle", "low"]);
  assert.deepEqual([...context.positionById], [["top-a", 1], ["top-b", 1], ["middle", 3], ["low", 4]]);
  assert.equal(context.positionById.has("missing"), false);
  assert.equal(context.median, 60);
});

test("published median handles odd-sized and empty releases", () => {
  assert.equal(getPublishedContext([region("low", 1), region("high", 99), region("mid", 12)]).median, 12);
  const empty = getPublishedContext([region("missing", null)]);
  assert.equal(empty.median, null);
  assert.equal(empty.ordered.length, 0);
});
