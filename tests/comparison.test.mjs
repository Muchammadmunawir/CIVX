import test from "node:test";
import assert from "node:assert/strict";
import { compareRegions, comparisonForRegion, defaultComparison } from "../src/lib/civx/comparison.ts";

// Synthetic fixtures only; no test observation enters the published CIVX release.
const indicators = ["poverty", "unemployment", "hdi", "sanitation"].map((id) => ({
  id, label: id, unit: "%", direction: "higher", minimum: 0, maximum: 100,
  minimumRegion: "A", maximumRegion: "B", sourceId: `bps-${id}`, weight: 0.25,
}));
const sources = indicators.map(({ sourceId }) => ({
  id: sourceId, publisher: "Test", title: "Test", url: "https://example.test", table: "1", page: "1",
  dataYear: 2023, referencePeriod: "2023 survey", artifactId: "test-artifact", accessedAt: "2024-01-01",
}));
function region(id) {
  const observations = indicators.map((indicator, index) => ({
    indicatorId: indicator.id, value: index + 1, unit: indicator.unit, period: "2023", sources: [sources[index]],
  }));
  return {
    id, name: `Test ${id}`, province: "Jawa Barat", type: "kota", period: "2023", boundaryReference: "test-boundary",
    observations, category: "moderate", interpretation: null,
    civicIndex: {
      status: "available", releaseId: "test-release", methodologyVersion: "test-method", referenceSetId: "test-reference", period: "2023",
      score: 50, components: indicators.map((indicator, index) => ({
        indicatorId: indicator.id, label: indicator.label, value: index + 1, unit: indicator.unit,
        period: "2023", score: 50, weight: indicator.weight, contribution: 12.5,
        direction: indicator.direction, sources: [sources[index]],
      })),
    },
  };
}
function fixture() {
  return {
    releaseId: "test-release", period: "2023", referenceSetId: "test-reference",
    artifact: { id: "test-artifact" }, sources,
    methodology: {
      status: "approved", releaseId: "test-release", methodologyVersion: "test-method", referenceSetId: "test-reference",
      period: "2023", indicators: indicators.map((indicator) => ({ ...indicator })),
    },
    regions: [region("A"), region("B"), region("C")], limitations: [],
  };
}

test("published pair uses the same approved 2023 method and picks distinct default records", () => {
  const release = fixture();
  const result = compareRegions(release, "A", "B");
  assert.equal(result.eligible, true);
  assert.equal(defaultComparison(release).eligible, true);
  assert.deepEqual([defaultComparison(release).a.id, defaultComparison(release).b.id], ["A", "B"]);
});

test("region-record handoff retains Region A and selects the first compatible published counterpart", () => {
  const release = fixture();
  assert.deepEqual([comparisonForRegion(release, "C").a.id, comparisonForRegion(release, "C").b.id], ["C", "A"]);
  release.regions[1].civicIndex = { status: "unavailable", reason: "missing" };
  const pair = comparisonForRegion(release, "A");
  assert.equal(pair.eligible, true);
  assert.deepEqual([pair.a.id, pair.b.id], ["A", "C"]);
  assert.equal(comparisonForRegion(release, "unknown").eligible, false);
  assert.equal(comparisonForRegion(release, "B").eligible, false);
  assert.equal(compareRegions(release, "A", "A").eligible, false);
  release.regions[2].civicIndex = { status: "unavailable", reason: "missing" };
  assert.equal(comparisonForRegion(release, "A").eligible, false);
});

test("rejects repeated, unknown, and unpublished selections without substituting another region", () => {
  const release = fixture();
  assert.equal(compareRegions(release, "A", "A").eligible, false);
  assert.equal(compareRegions(release, "A", "bogus").eligible, false);
  release.regions[1].civicIndex = { status: "unavailable", reason: "missing" };
  assert.equal(compareRegions(release, "A", "B").eligible, false);
  assert.deepEqual([defaultComparison(release).a.id, defaultComparison(release).b.id], ["A", "C"]);
  release.regions[2].civicIndex = { status: "unavailable", reason: "missing" };
  assert.equal(defaultComparison(release).eligible, false);
});

test("rejects mismatched methodology, geography, indicator units and source periods", () => {
  for (const alter of [
    (release) => { release.regions[1].civicIndex.methodologyVersion = "another-method"; },
    (release) => { release.regions[1].boundaryReference = "another-boundary"; },
    (release) => { release.regions[1].civicIndex.components[0].direction = "lower"; },
    (release) => { release.regions[1].civicIndex.components[0].unit = "people"; },
    (release) => { release.regions[1].civicIndex.components[0].sources[0] = { ...sources[0], referencePeriod: "another survey" }; },
    (release) => { release.regions[1].observations[0].sources[0] = { ...sources[0], table: "2" }; },
    (release) => { release.regions[1].civicIndex.referenceSetId = "another-reference"; },
    (release) => { release.methodology.indicators[0] = { ...indicators[0], weight: 0.5 }; },
    (release) => { release.regions[1].observations[0].period = "2022"; },
  ]) {
    const release = fixture();
    alter(release);
    assert.equal(compareRegions(release, "A", "B").eligible, false);
  }
});
