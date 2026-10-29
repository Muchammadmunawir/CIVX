export type RelativePressureClass2023 =
  | "relatively_low"
  | "lower_middle"
  | "middle"
  | "higher_middle"
  | "relatively_high";

export interface CohortComparison2023 {
  readonly value: number;
  readonly percentile: number;
  readonly midrank: number;
  readonly cohortMedian: number;
  readonly differenceFromMedian: number;
  readonly regionsBelow: number;
  readonly regionsAbove: number;
  readonly tiedRegionCount: number;
  readonly cohortSize: number;
  readonly classification: RelativePressureClass2023;
}

/** Classify an ascending cohort percentile using left-closed quintile intervals. */
export function classifyPercentile2023(percentile: number): RelativePressureClass2023 {
  if (typeof percentile !== "number" || !Number.isFinite(percentile) || percentile < 0 || percentile > 100) {
    throw new Error("CIVX 2023: percentile must be a finite number between 0 and 100");
  }
  if (percentile < 20) return "relatively_low";
  if (percentile < 40) return "lower_middle";
  if (percentile < 60) return "middle";
  if (percentile < 80) return "higher_middle";
  return "relatively_high";
}

/**
 * Compare supplied values without aggregating or modifying scores.
 * Exact ties share a one-based average rank; tiedRegionCount includes the region itself.
 * Percentiles use 100 * (midrank - 1) / (n - 1), with 50 for singleton/all-equal cohorts.
 * Results retain input order, and no particular cohort size or score range is assumed.
 */
export function compareCohort2023(values: readonly number[]): CohortComparison2023[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("CIVX 2023: cohort must be a nonempty array of finite numbers");
  }
  for (const value of values) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error("CIVX 2023: cohort values must be finite numbers");
    }
  }

  const cohortSize = values.length;
  const sortedIndices = Array.from({ length: cohortSize }, (_, index) => index);
  sortedIndices.sort((left, right) => values[left] - values[right]);
  const upperMiddle = Math.floor(cohortSize / 2);
  const upperValue = values[sortedIndices[upperMiddle]];
  const lowerValue = values[sortedIndices[upperMiddle - 1]];
  // Avoid overflowing the median of two finite values with the same sign.
  const cohortMedian = cohortSize % 2 === 1
    ? upperValue
    : Math.sign(lowerValue) === Math.sign(upperValue)
      ? lowerValue + (upperValue - lowerValue) / 2
      : (lowerValue + upperValue) / 2;
  const allEqual = values[sortedIndices[0]] === values[sortedIndices[cohortSize - 1]];
  const comparisons = new Array<CohortComparison2023>(cohortSize);

  for (let start = 0; start < cohortSize;) {
    const value = values[sortedIndices[start]];
    let end = start + 1;
    while (end < cohortSize && values[sortedIndices[end]] === value) end += 1;
    const midrank = (start + 1 + end) / 2;
    const percentile = allEqual ? 50 : 100 * (midrank - 1) / (cohortSize - 1);
    const classification = classifyPercentile2023(percentile);
    for (let position = start; position < end; position += 1) {
      const index = sortedIndices[position];
      comparisons[index] = {
        value: values[index],
        percentile,
        midrank,
        cohortMedian,
        differenceFromMedian: values[index] - cohortMedian,
        regionsBelow: start,
        regionsAbove: cohortSize - end,
        tiedRegionCount: end - start,
        cohortSize,
        classification,
      };
    }
    start = end;
  }
  return comparisons;
}
