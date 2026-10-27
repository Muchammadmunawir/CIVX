import type { Metadata } from "next";
import { ComparisonPage } from "@/components/compare/comparison-page";
import { selectComparison } from "@/components/compare/comparison-selection";
import { civicRelease } from "@/lib/civx/current";

export const metadata: Metadata = {
  title: "Compare regions | Civic Index",
  description: `Compare ${civicRelease.period} Jawa Barat CIVX scores, dimensions, core observations and official source evidence.`,
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function CompareRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { a, b } = await searchParams;
  const comparison = selectComparison(a, b);

  return (
    <ComparisonPage
      comparison={comparison}
      selectedA={typeof a === "string" ? a : comparison.eligible ? comparison.a.id : ""}
      selectedB={typeof b === "string" ? b : comparison.eligible ? comparison.b.id : ""}
    />
  );
}
