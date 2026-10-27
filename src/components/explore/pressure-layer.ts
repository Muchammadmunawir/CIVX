import type { DimensionId, V2Region } from "@/lib/civx/v2/types";

export type PressureLayerId = "overall" | DimensionId;

export function scoreForLayer(region: V2Region, layer: PressureLayerId): number | undefined {
  if (region.pressure.status !== "available") return undefined;
  return layer === "overall" ? region.pressure.score : region.pressure.dimensions.find(dimension => dimension.id === layer)?.score;
}
