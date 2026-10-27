import processed from "../../../data/processed/civx-jabar-2023-current.json";
import { assertV2Release } from "./v2/model";
import type { V2Release, V2Region } from "./v2/types";
import type { PressureCategory } from "./types";

// Internal release versions retain reproducibility; every product surface reads this one release.
export const civicRelease = processed as unknown as V2Release;
assertV2Release(civicRelease);
const requiredRegionIds = new Set([
  ...Array.from({ length: 18 }, (_, index) => String(3201 + index)),
  ...Array.from({ length: 9 }, (_, index) => String(3271 + index)),
]);
if (civicRelease.period !== "2023" || civicRelease.regions.length !== requiredRegionIds.size ||
  civicRelease.regions.some((region) => !requiredRegionIds.has(region.id) || region.pressure.status !== "available")) {
  throw new Error("Current CIVX requires all 27 Jawa Barat regions with complete 2023 scores.");
}
export const currentRegions: V2Region[] = civicRelease.regions;
export const dimensions = civicRelease.methodology.dimensions;
export const coreIndicators = dimensions.flatMap((dimension) => dimension.indicators);
const regionsById = new Map(currentRegions.map((region) => [region.id, region]));

export function getCurrentRegion(id: string): V2Region | undefined {
  return regionsById.get(id);
}

export function categoryForScore(score: number): PressureCategory {
  return score < 33.33 ? "lower" : score < 66.67 ? "moderate" : "higher";
}
