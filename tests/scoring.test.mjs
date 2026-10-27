import test from "node:test";
import assert from "node:assert/strict";
import { scoreCivicIndex, pressureCategory } from "../src/lib/civx/scoring.ts";

// Synthetic inputs exist only in this test; they are never a published CIVX release.
const policy = {
  status: "approved",
  releaseId: "synthetic-test-release",
  methodologyVersion: "synthetic-test-method",
  referenceSetId: "synthetic-test-reference",
  period: "2023",
  indicators: [
    { id: "a", label: "Synthetic A", unit: "%", direction: "higher", minimum: 0, maximum: 100, minimumRegion: "Test Min", maximumRegion: "Test Max", sourceId: "test-a", weight: 3 },
    { id: "b", label: "Synthetic B", unit: "%", direction: "lower", minimum: 0, maximum: 100, minimumRegion: "Test Min", maximumRegion: "Test Max", sourceId: "test-b", weight: 1 },
  ],
};
const source = (id) => ({ id, publisher: "Synthetic test source", title: "Test only", url: "https://example.test/fixture", table: "test", page: "test", dataYear: 2023, referencePeriod: "2023 test", artifactId: `sha256:${"a".repeat(64)}`, accessedAt: "2023-01-01" });
const observations = [
  { indicatorId: "a", value: 80, unit: "%", period: "2023", sources: [source("test-a")] },
  { indicatorId: "b", value: 25, unit: "%", period: "2023", sources: [source("test-b")] },
];

test("normalizes directions and reports weighted indicator contributions", () => {
  const result = scoreCivicIndex(observations, policy);
  assert.equal(result.status, "available");
  assert.equal(result.score, 78.75);
  assert.deepEqual(result.components.map(({ score, contribution }) => [score, contribution]), [[80, 60], [75, 18.75]]);
  assert.equal(result.components[0].sources[0].artifactId, `sha256:${"a".repeat(64)}`);
});

test("withholds incomplete or untraceable scores without reweighting", () => {
  const missing = scoreCivicIndex([observations[0], { ...observations[1], value: null, missingReason: "not published" }], policy);
  assert.equal(missing.status, "unavailable");
  assert.match(missing.reason, /not published.*not reweighted/);
  const untraceable = scoreCivicIndex([observations[0], { ...observations[1], sources: [{ ...source("test-b"), artifactId: "" }] }], policy);
  assert.equal(untraceable.status, "unavailable");
  const otherPeriod = scoreCivicIndex([observations[0], { ...observations[1], period: "2022" }], policy);
  assert.equal(otherPeriod.status, "unavailable");
});

test("requires approved method and an in-range comparable reference", () => {
  assert.equal(scoreCivicIndex(observations, { ...policy, status: "provisional" }).status, "unavailable");
  assert.equal(scoreCivicIndex([observations[0], { ...observations[1], value: 101 }], policy).status, "unavailable");
  assert.throws(() => scoreCivicIndex(observations, { ...policy, indicators: policy.indicators.slice(0, 1) }), /at least two/);
  assert.throws(() => scoreCivicIndex([observations[0], observations[0]], policy), /Duplicate observation/);
});

test("category thresholds and source identity remain explicit", () => {
  assert.equal(pressureCategory(33.32), "lower");
  assert.equal(pressureCategory(33.33), "moderate");
  assert.equal(pressureCategory(66.67), "higher");
  assert.throws(() => pressureCategory(101), /between 0 and 100/);
  assert.equal(scoreCivicIndex([observations[0], { ...observations[1], sources: [source("wrong-id")] }], policy).status, "unavailable");
});
