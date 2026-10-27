import { civicRelease, currentRegions, getCurrentRegion } from "@/lib/civx/current";
import type { V2Pressure, V2Region } from "@/lib/civx/v2/types";

export type PublishedRegion = V2Region & {
  pressure: Extract<V2Pressure, { status: "available" }>;
};

export type RegionComparison =
  | { eligible: false; reason: string }
  | { eligible: true; a: PublishedRegion; b: PublishedRegion };

export function isPublishedRegion(region: V2Region): region is PublishedRegion {
  return region.pressure.status === "available";
}

function compareCurrentRegions(aId: string, bId: string): RegionComparison {
  const a = getCurrentRegion(aId);
  const b = getCurrentRegion(bId);
  if (!a || !b) return { eligible: false, reason: "One or both region IDs are not part of the current release." };
  if (aId === bId) return { eligible: false, reason: "Choose two different regions to compare." };
  if (!isPublishedRegion(a) || !isPublishedRegion(b)) {
    return { eligible: false, reason: "One or both regions have no complete published score. Missing core inputs are not imputed or reweighted." };
  }
  if (a.boundaryReference !== b.boundaryReference ||
    a.pressure.releaseId !== b.pressure.releaseId ||
    a.pressure.methodologyVersion !== b.pressure.methodologyVersion ||
    a.pressure.referenceSetId !== b.pressure.referenceSetId ||
    a.pressure.period !== b.pressure.period) {
    return { eligible: false, reason: "These records do not share the same release, method, period and geographic reference." };
  }
  return { eligible: true, a, b };
}

function counterpartFor(aId: string): RegionComparison {
  const a = getCurrentRegion(aId);
  if (!a) return { eligible: false, reason: "Region A is not part of the current release." };
  if (!isPublishedRegion(a)) {
    return { eligible: false, reason: "Region A has no complete published score. Missing core inputs are not imputed or reweighted." };
  }
  for (const region of currentRegions) {
    if (region.id === aId) continue;
    const pair = compareCurrentRegions(aId, region.id);
    if (pair.eligible) return pair;
  }
  return { eligible: false, reason: "No distinct compatible published counterpart is available for Region A." };
}

export function selectComparison(a: string | string[] | undefined, b: string | string[] | undefined): RegionComparison {
  if (a === undefined && b === undefined) {
    for (const region of currentRegions) {
      const pair = counterpartFor(region.id);
      if (pair.eligible) return pair;
    }
    return { eligible: false, reason: `No compatible pair has complete published scores for ${civicRelease.period}.` };
  }
  if (typeof a !== "string" || !a) {
    return { eligible: false, reason: "Select a valid Region A. Repeated, empty or missing URL values cannot be compared." };
  }
  if (b === undefined) return counterpartFor(a);
  if (typeof b !== "string" || !b) {
    return { eligible: false, reason: "Select a valid Region B. Repeated or empty URL values cannot be compared." };
  }
  return compareCurrentRegions(a, b);
}
