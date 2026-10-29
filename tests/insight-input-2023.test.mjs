import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { assertScoringDataset2023 } from "../src/lib/civx/insight-input-2023.ts";

const scoring = JSON.parse(readFileSync(new URL("../data/processed/civx-scores-2023.json", import.meta.url), "utf8"));
function deepFreeze(value) {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}
function reject(mutate) {
  const input = structuredClone(scoring);
  mutate(input);
  assert.throws(() => assertScoringDataset2023(input), Error);
}

test("verified frozen score dataset validates without changing deeply frozen records", () => {
  const input = deepFreeze(structuredClone(scoring));
  const before = JSON.stringify(input);
  assert.equal(assertScoringDataset2023(input), undefined);
  assert.equal(JSON.stringify(input), before);
  assert.equal(assertScoringDataset2023(input), undefined);
});

for (const [field, value] of [["datasetId", "other"], ["version", 2], ["status", "RELEASED"], ["referenceYear", 2024]]) {
  test(`rejects changed dataset ${field}`, () => reject(input => { input[field] = value; }));
}
for (const [field, value] of [["modelId", "other"], ["modelVersion", 2], ["referenceYear", 2024], ["normalizationMethod", "z_score"], ["weightingSchemeId", "other"]]) {
  test(`rejects changed model ${field}`, () => reject(input => { input.model[field] = value; }));
}
for (const [label, mutate] of [
  ["missing region", input => input.regions.pop()],
  ["extra region", input => input.regions.push(structuredClone(input.regions[0]))],
  ["region order", input => input.regions.reverse()],
  ["duplicate region", input => { input.regions[1] = structuredClone(input.regions[0]); }],
  ["region identity", input => { input.regions[0].regionName = "Other"; }],
  ["region model", input => { input.regions[0].modelVersion = 2; }],
  ["region year", input => { input.regions[0].referenceYear = 2024; }],
  ["province", input => { input.regions[0].province = "Other"; }],
  ["region type", input => { input.regions[0].type = "kota"; }],
  ["boundary reference", input => { input.regions[0].boundaryReference = "Other"; }],
  ["registry pointer", input => { input.regions[0].registryPointer = "/regions/1"; }],
  ["dimension order", input => input.regions[0].dimensions.reverse()],
  ["missing dimension", input => input.regions[0].dimensions.pop()],
  ["unknown dimension", input => { input.regions[0].dimensions[0].dimensionId = "unknown"; }],
  ["indicator order", input => input.regions[0].indicators.reverse()],
  ["missing indicator", input => input.regions[0].indicators.pop()],
  ["duplicate indicator", input => { input.regions[0].indicators[1] = structuredClone(input.regions[0].indicators[0]); }],
  ["frozen pointer", input => { input.regions[0].indicators[0].frozenValuePointer = "/indicators/0/observations/1/value"; }],
  ["normalization pointer", input => { input.regions[0].indicators[0].normalizationValuePointer = "/indicators/0/observations/0/normalizedPressure/z_score"; }],
  ["overall contribution identity", input => { input.regions[0].overallPressureScore += 1; }],
  ["dimension contribution identity", input => { input.regions[0].dimensions[0].contributionToOverall += 1; }],
  ["indicator dimension contribution identity", input => { input.regions[0].indicators[0].contributionToDimension += 1; }],
  ["indicator overall contribution identity", input => { input.regions[0].indicators[0].contributionToOverall += 1; }],
  ["facts membership", input => { input.regions[0].facts.highestPressureDimensionIds = ["unknown"]; }],
  ["facts ordering", input => input.regions[0].facts.indicatorIdsByDescendingPressure.reverse()],
]) {
  test(`rejects ${label} drift`, () => reject(mutate));
}
for (const value of [NaN, Infinity, -Infinity, "50", null, -0.01, 100.01]) {
  test(`rejects invalid scores ${String(value)}`, () => {
    reject(input => { input.regions[0].overallPressureScore = value; });
    reject(input => { input.regions[0].dimensions[0].score = value; });
    reject(input => { input.regions[0].indicators[0].normalizedPressure = value; });
  });
}
for (const value of [NaN, Infinity, -Infinity, "5", null, -1]) {
  test(`rejects invalid contribution ${String(value)}`, () => {
    reject(input => { input.regions[0].dimensions[0].contributionToOverall = value; });
    reject(input => { input.regions[0].indicators[0].contributionToDimension = value; });
    reject(input => { input.regions[0].indicators[0].contributionToOverall = value; });
  });
}
for (const field of ["dimensionId", "displayName", "unit", "pressureDirection", "minimum", "maximum", "frozenIndicatorPointer", "withinDimensionWeight", "dimensionWeight", "effectiveWeight", "exactWithinFraction", "exactDimensionFraction", "exactEffectiveFraction"]) {
  test(`rejects indicator model field ${field} drift`, () => reject(input => {
    const record = input.regions[0].indicators[0];
    record[field] = typeof record[field] === "number" ? record[field] + 1 : "changed";
  }));
}
for (const field of ["displayName", "weight", "exactFraction"]) {
  test(`rejects dimension model field ${field} drift`, () => reject(input => {
    const record = input.regions[0].dimensions[0];
    record[field] = typeof record[field] === "number" ? record[field] + 1 : "changed";
  }));
}

test("rejects invalid raw values and copied physical bounds", () => {
  for (const value of [NaN, Infinity, -Infinity, "7", null, -1, 101]) reject(input => { input.regions[0].indicators[0].rawValue = value; });
  reject(input => { input.regions[0].indicators[0].expectedBounds.minimum = -1; });
  reject(input => { input.regions[0].indicators[0].expectedBounds.maximum = 101; });
});

test("validator consumes recorded normalization instead of recalculating it", () => {
  // Test-only change proves this boundary does not normalize raw observations.
  // The offline generator separately authenticates the complete scoring file by SHA256.
  const input = structuredClone(scoring);
  input.regions[0].indicators[0].rawValue += 0.01;
  assert.equal(assertScoringDataset2023(input), undefined);
});
