import { getComparisonProductView2023, getExploreRegionsProduct2023 } from "@/lib/civx/product-2023";
import type { CivxComparisonProductView2023 } from "@/lib/civx/product-view-types-2023";

type QueryValue = string | string[] | undefined;
interface ComparisonSelection {
  comparison: CivxComparisonProductView2023 | null;
  selectedA: string;
  selectedB: string;
  error?: string;
}

/** Resolve URL selection only. All numerical comparison belongs to the reviewed API. */
export function selectComparison(a: QueryValue, b: QueryValue): ComparisonSelection {
  const regions = getExploreRegionsProduct2023();
  const selectedA = a === undefined && b === undefined ? regions[0].region.id : typeof a === "string" ? a : "";
  const selectedB = b === undefined && regions.some(view => view.region.id === selectedA)
    ? regions.find(view => view.region.id !== selectedA)!.region.id
    : typeof b === "string" ? b : "";
  if (!regions.some(view => view.region.id === selectedA) || !regions.some(view => view.region.id === selectedB)) {
    return { comparison: null, selectedA, selectedB, error: "Pilih satu kode wilayah yang dikenal untuk masing-masing sisi. Parameter kosong, berulang, atau tidak dikenal tidak dapat dibandingkan." };
  }
  return { comparison: getComparisonProductView2023(selectedA, selectedB), selectedA, selectedB };
}
