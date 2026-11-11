const scoreFormatter = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const rawFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 4 });
const smallDifferenceFormatter = new Intl.NumberFormat("id-ID", { maximumSignificantDigits: 3 });

/** Display rounding never changes the reviewed model values. */
export function formatScore(value: number): string {
  return scoreFormatter.format(value);
}

export function formatRaw(value: number, unit: string): string {
  return `${rawFormatter.format(value)}${unit === "%" ? "%" : ` ${unit}`}`;
}

export function formatDifference(value: number): string {
  if (value === 0) return formatScore(0);
  const formatted = Math.abs(value) < 0.05 ? smallDifferenceFormatter.format(value) : formatScore(value);
  return `${value > 0 ? "+" : ""}${formatted}`;
}

export function regionType(type: "kabupaten" | "kota"): string {
  return type === "kabupaten" ? "Kabupaten" : "Kota";
}
