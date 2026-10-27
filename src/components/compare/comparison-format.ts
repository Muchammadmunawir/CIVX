export const decimal = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Differences use the same rounded figures readers see, not hidden precision.
export function displayedDifference(a: number, b: number): number {
  const shownA = Number(decimal.format(a).replaceAll(",", ""));
  const shownB = Number(decimal.format(b).replaceAll(",", ""));
  return shownA - shownB;
}

export function signed(value: number): string {
  return `${value > 0 ? "+" : ""}${decimal.format(value)}`;
}
