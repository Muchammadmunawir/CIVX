import type { CivicIndexResult, CivicIndicatorPolicy, ProcessedCivicRelease, RegionalData, SourceReference } from "./types";

type PublishedRegion = RegionalData & {
  civicIndex: Extract<CivicIndexResult, { status: "available" }>;
  category: NonNullable<RegionalData["category"]>;
};

export type RegionComparison =
  | { eligible: false; reason: string }
  | { eligible: true; a: PublishedRegion; b: PublishedRegion };

function matchingSource(
  sources: readonly SourceReference[],
  expected: SourceReference | undefined,
  indicator: CivicIndicatorPolicy,
): boolean {
  return !!expected && sources.length === 1 && sources[0].id === indicator.sourceId &&
    sources[0].dataYear === expected.dataYear &&
    sources[0].referencePeriod === expected.referencePeriod &&
    sources[0].artifactId === expected.artifactId &&
    sources[0].publisher === expected.publisher && sources[0].title === expected.title &&
    sources[0].url === expected.url && sources[0].table === expected.table &&
    sources[0].page === expected.page;
}

function isPublishedForRelease(region: RegionalData, release: ProcessedCivicRelease): region is PublishedRegion {
  const result = region.civicIndex;
  if (result.status !== "available" || !region.category ||
    region.period !== release.period || result.period !== release.period ||
    result.releaseId !== release.releaseId ||
    result.referenceSetId !== release.referenceSetId ||
    result.methodologyVersion !== release.methodology.methodologyVersion ||
    !region.boundaryReference || region.province !== "Jawa Barat" ||
    !Number.isFinite(result.score) || result.score < 0 || result.score > 100 ||
    result.components.length !== release.methodology.indicators.length ||
    region.observations.length !== release.methodology.indicators.length) return false;

  const componentIds = new Set<string>();
  const observationIds = new Set<string>();
  for (const indicator of release.methodology.indicators) {
    const component = result.components.find((item) => item.indicatorId === indicator.id);
    const observation = region.observations.find((item) => item.indicatorId === indicator.id);
    const expectedSource = release.sources.find((source) =>
      source.id === indicator.sourceId && source.artifactId === release.artifact.id &&
      source.dataYear === Number(release.period));
    if (!component || !observation || componentIds.has(component.indicatorId) ||
      observationIds.has(observation.indicatorId) ||
      component.label !== indicator.label || component.unit !== indicator.unit ||
      observation.unit !== indicator.unit || component.direction !== indicator.direction ||
      component.weight !== indicator.weight || component.period !== release.period ||
      observation.period !== release.period || observation.value !== component.value ||
      !Number.isFinite(component.value) || !Number.isFinite(component.score) ||
      component.score < 0 || component.score > 100 ||
      !Number.isFinite(component.contribution) || component.contribution < 0 ||
      component.contribution > indicator.weight * 100 ||
      !matchingSource(component.sources, expectedSource, indicator) ||
      !matchingSource(observation.sources, expectedSource, indicator)) return false;
    componentIds.add(component.indicatorId);
    observationIds.add(observation.indicatorId);
  }
  return true;
}

/** Compare only unmodified published outputs against the same approved release contract. */
export function compareRegions(release: ProcessedCivicRelease, aId: string, bId: string): RegionComparison {
  if (aId === bId) return { eligible: false, reason: "Choose two different regions to compare." };
  const a = release.regions.find((region) => region.id === aId);
  const b = release.regions.find((region) => region.id === bId);
  if (!a || !b) return { eligible: false, reason: "One or both region IDs are not part of this release." };
  const policy = release.methodology;
  if (release.period !== "2023" || !release.releaseId || !release.referenceSetId ||
    policy.status !== "approved" || policy.releaseId !== release.releaseId ||
    policy.period !== release.period || policy.referenceSetId !== release.referenceSetId ||
    policy.indicators.length !== 4 || policy.indicators.some((indicator) => indicator.weight !== 0.25)) {
    return { eligible: false, reason: "This release does not have a comparable approved four-indicator method." };
  }
  if (!isPublishedForRelease(a, release) || !isPublishedForRelease(b, release)) {
    return { eligible: false, reason: "One or both records are unpublished or do not match this release's method and sources." };
  }
  if (a.province !== b.province || a.boundaryReference !== b.boundaryReference ||
    policy.indicators.some((indicator) => {
      const aSource = a.civicIndex.components.find((item) => item.indicatorId === indicator.id)!.sources[0];
      const bSource = b.civicIndex.components.find((item) => item.indicatorId === indicator.id)!.sources[0];
      return aSource.id !== bSource.id || aSource.dataYear !== bSource.dataYear ||
        aSource.referencePeriod !== bSource.referencePeriod || aSource.artifactId !== bSource.artifactId;
    })) {
    return { eligible: false, reason: "These records have different geographic or indicator source references." };
  }
  return { eligible: true, a, b };
}

/** Follow a published record into the first distinct comparable record in release order. */
export function comparisonForRegion(release: ProcessedCivicRelease, aId: string): RegionComparison {
  const selected = release.regions.find((region) => region.id === aId);
  if (!selected) return { eligible: false, reason: "Region A is not part of this release." };
  if (!isPublishedForRelease(selected, release)) {
    return { eligible: false, reason: "Region A is not a compatible published record in this release." };
  }
  for (const region of release.regions) {
    if (region.id === aId) continue;
    const pair = compareRegions(release, aId, region.id);
    if (pair.eligible) return pair;
  }
  return { eligible: false, reason: "No distinct compatible published counterpart is available for Region A." };
}

/** No default is invented when this release contains fewer than two comparable records. */
export function defaultComparison(release: ProcessedCivicRelease): RegionComparison {
  for (let i = 0; i < release.regions.length; i++) {
    for (let j = i + 1; j < release.regions.length; j++) {
      const pair = compareRegions(release, release.regions[i].id, release.regions[j].id);
      if (pair.eligible) return pair;
    }
  }
  return { eligible: false, reason: "No two compatible published records are available in this release." };
}
