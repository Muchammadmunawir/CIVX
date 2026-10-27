import type { RegionalData } from "./types";

/** Descriptive context for this published release, never a replacement for fixed reference bounds. */
export function getPublishedContext(regions: readonly RegionalData[]): {
  ordered: RegionalData[];
  median: number | null;
  positionById: Map<string, number>;
} {
  const ordered = regions
    .filter((region) => region.civicIndex.status === "available")
    .sort((a, b) => {
      if (a.civicIndex.status !== "available" || b.civicIndex.status !== "available") return 0;
      return b.civicIndex.score - a.civicIndex.score || a.name.localeCompare(b.name);
    });
  const positionById = new Map<string, number>();
  ordered.forEach((region, index) => {
    const previous = ordered[index - 1];
    const tied = previous?.civicIndex.status === "available" && region.civicIndex.status === "available" &&
      previous.civicIndex.score === region.civicIndex.score;
    positionById.set(region.id, tied ? positionById.get(previous.id)! : index + 1);
  });
  const middle = Math.floor(ordered.length / 2);
  const scoreAt = (index: number) => {
    const result = ordered[index].civicIndex;
    if (result.status !== "available") throw new Error("Published context requires available scores.");
    return result.score;
  };
  const median = ordered.length === 0 ? null : ordered.length % 2
    ? scoreAt(middle)
    : (scoreAt(middle - 1) + scoreAt(middle)) / 2;
  return { ordered, median, positionById };
}
