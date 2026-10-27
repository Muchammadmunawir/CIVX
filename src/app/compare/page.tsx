import type { Metadata } from "next";
import { ComparisonPage } from "@/components/compare/comparison-page";
import { compareRegions, comparisonForRegion, defaultComparison } from "@/lib/civx/comparison";
import { release } from "@/lib/civx/data";

export const metadata: Metadata = {
  title: "Compare regions | Civic Index",
  description: "Compare two compatible 2023 Jawa Barat CIVX published records and their BPS observations.",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function CompareRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { a, b } = await searchParams;
  const noSelection = a === undefined && b === undefined;
  const defaultPair = noSelection ? defaultComparison(release) : undefined;
  const comparison = defaultPair ?? (
    typeof a !== "string" || !a
      ? { eligible: false as const, reason: "Select a valid Region A. Repeated or missing URL values cannot be compared." }
      : b === undefined
        ? comparisonForRegion(release, a)
        : typeof b !== "string" || !b
          ? { eligible: false as const, reason: "Select a valid Region B. Repeated or empty URL values cannot be compared." }
          : compareRegions(release, a, b)
  );

  return (
    <ComparisonPage
      comparison={comparison}
      selectedA={typeof a === "string" ? a : defaultPair?.eligible ? defaultPair.a.id : ""}
      selectedB={typeof b === "string" ? b : comparison.eligible ? comparison.b.id : ""}
    />
  );
}
