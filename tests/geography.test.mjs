import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const map = JSON.parse(readFileSync(new URL("../data/geography/jabar-adm2-2020.json", import.meta.url), "utf8"));
const release = JSON.parse(readFileSync(new URL("../data/processed/civx-jabar-2023.json", import.meta.url), "utf8"));

test("each published region maps to exactly one distinct display shape", () => {
  const published = release.regions.filter((region) => region.civicIndex.status === "available");
  assert.equal(map.regions.length, published.length);
  assert.deepEqual(new Set(map.regions.map((shape) => shape.id)), new Set(published.map((region) => region.id)));
  assert.equal(new Set(map.regions.map((shape) => shape.shapeId)).size, published.length);
});

