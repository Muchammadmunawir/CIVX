import { getExploreRegionsProduct2023 } from "./product-2023.ts";
import type { CivxDimensionProduct2023, CivxExploreRegionProduct2023, CivxRegionProductHeader2023 } from "./product-view-types-2023.ts";

const canonicalRegionIds = new Set(getExploreRegionsProduct2023().map(view => view.region.id));

/** Fixed CORE order keeps summation independent of input and presentation order. */
export const SIMILARITY_DIMENSION_IDS_2023 = Object.freeze([
  "socioeconomic",
  "education",
  "basic_services",
  "public_health",
  "disaster_pressure",
  "environment",
] as const);

/** Only normalized CORE dimensions and comparable region identity enter this metric. */
export interface CivxSimilarityRegion2023 {
  readonly region: CivxRegionProductHeader2023;
  readonly core: Pick<CivxExploreRegionProduct2023["core"], "scope" | "dimensions">;
}

/** Derived exploratory distance, not an authoritative CIVX score or classification. */
export interface CivxSimilarRegion2023 {
  readonly region: CivxRegionProductHeader2023;
  readonly dimensions: readonly CivxDimensionProduct2023[];
  readonly distance: number;
}

function validatedDimensions(view: CivxSimilarityRegion2023): readonly CivxDimensionProduct2023[] {
  const { region, core } = view;
  if (region?.referenceYear !== 2023 || region.province !== "Jawa Barat"
    || !canonicalRegionIds.has(region.id) || (region.type !== "kabupaten" && region.type !== "kota")) {
    throw new TypeError("CIVX similar regions 2023: incompatible West Java region metadata");
  }
  if (core?.scope !== "CORE" || !Array.isArray(core.dimensions)
    || core.dimensions.length !== SIMILARITY_DIMENSION_IDS_2023.length) {
    throw new TypeError(`CIVX similar regions 2023: ${region.id} requires six CORE dimensions`);
  }
  const byId = new Map<string, CivxDimensionProduct2023>();
  for (const dimension of core.dimensions) {
    if (!dimension || dimension.scope !== "CORE"
      || !SIMILARITY_DIMENSION_IDS_2023.some(id => id === dimension.dimensionId)
      || byId.has(dimension.dimensionId)
      || !Number.isFinite(dimension.score) || dimension.score < 0 || dimension.score > 100) {
      throw new TypeError(`CIVX similar regions 2023: ${region.id} has invalid CORE dimension data`);
    }
    byId.set(dimension.dimensionId, dimension);
  }
  return Object.freeze(SIMILARITY_DIMENSION_IDS_2023.map(id => byId.get(id)!));
}

/**
 * Validate the entire cohort before deriving up to three nearest peers.
 * Unknown selected IDs return undefined, matching the product facade.
 * Invalid cohort data throws TypeError, including candidates outside the nearest three.
 * Inputs are never sorted, frozen, changed, or supplemented with missing values.
 */
export function findSimilarRegions2023(
  cohort: readonly CivxSimilarityRegion2023[],
  selectedId: string,
): readonly CivxSimilarRegion2023[] | undefined {
  const seen = new Set<string>();
  const profiles = cohort.map(view => {
    const dimensions = validatedDimensions(view);
    if (seen.has(view.region.id)) throw new TypeError(`CIVX similar regions 2023: duplicate region ${view.region.id}`);
    seen.add(view.region.id);
    return { region: view.region, dimensions };
  });
  const selected = profiles.find(profile => profile.region.id === selectedId);
  if (!selected) return undefined;

  const peers = profiles.filter(profile => profile.region.id !== selectedId).map(profile => {
    let squaredDistance = 0;
    for (let index = 0; index < SIMILARITY_DIMENSION_IDS_2023.length; index += 1) {
      const difference = selected.dimensions[index].score - profile.dimensions[index].score;
      squaredDistance += difference * difference;
    }
    return Object.freeze<CivxSimilarRegion2023>({ ...profile, distance: Math.sqrt(squaredDistance) });
  });
  peers.sort((a, b) => a.distance - b.distance || (a.region.id < b.region.id ? -1 : a.region.id > b.region.id ? 1 : 0));
  return Object.freeze(peers.slice(0, 3));
}

/** Production input comes exclusively from existing frozen product-facade records. */
export function getSimilarRegions2023(selectedId: string): readonly CivxSimilarRegion2023[] | undefined {
  return findSimilarRegions2023(getExploreRegionsProduct2023(), selectedId);
}
