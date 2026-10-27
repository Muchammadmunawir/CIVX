import processedRelease from "../../../data/processed/civx-jabar-2023.json";

import type { ProcessedCivicRelease, RegionalData } from "./types";

// Validate the fields consumed by the web boundary once; scoring happens offline.
function assertRelease(value: ProcessedCivicRelease): void {
  if (
    !value || !value.releaseId || !value.period || !value.referenceSetId ||
    value.methodology?.status !== "approved" ||
    value.methodology.releaseId !== value.releaseId ||
    value.methodology.period !== value.period ||
    value.methodology.referenceSetId !== value.referenceSetId ||
    !/^sha256:[a-f0-9]{64}$/.test(value.artifact?.id ?? "") ||
    !Array.isArray(value.sources) || !Array.isArray(value.regions)
  ) {
    throw new Error("Invalid Civic Index release manifest.");
  }
  const ids = new Set<string>();
  for (const region of value.regions) {
    if (!region?.id || ids.has(region.id) || !region.name ||
      region.period !== value.period || region.province !== "Jawa Barat" ||
      !region.boundaryReference || !Array.isArray(region.observations) ||
      !region.civicIndex) {
      throw new Error(`Invalid Civic Index region: ${region?.id ?? "unknown"}.`);
    }
    ids.add(region.id);
    if (region.civicIndex.status === "available" &&
      (region.civicIndex.releaseId !== value.releaseId ||
        region.civicIndex.methodologyVersion !== value.methodology.methodologyVersion ||
        region.civicIndex.components.length !== value.methodology.indicators.length ||
        !Number.isFinite(region.civicIndex.score) ||
        region.civicIndex.score < 0 || region.civicIndex.score > 100 ||
        !region.category)) {
      throw new Error(`Invalid score for ${region.id}.`);
    }
  }
}

export const release = processedRelease as ProcessedCivicRelease;
assertRelease(release);
export const regionalData: RegionalData[] = release.regions;

const regionsById = new Map(regionalData.map((region) => [region.id, region]));

export function getRegionDetail(id: string): { region: RegionalData; civicIndex: RegionalData["civicIndex"] } | undefined {
  const region = regionsById.get(id);
  return region ? { region, civicIndex: region.civicIndex } : undefined;
}
