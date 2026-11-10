import type { Metadata } from "next";
import { Suspense } from "react";
import { ComparisonPage } from "@/components/compare/comparison-page";
import { selectComparison } from "@/components/compare/comparison-selection";
import { getExploreRegionsProduct2023 } from "@/lib/civx/product-2023";
import LoadingComparison from "./loading";

export const metadata: Metadata = {
  title: "Bandingkan",
  description: "Bandingkan tekanan relatif dua kabupaten/kota Jawa Barat melalui skor keseluruhan dan enam dimensi CORE model CIVX 2023.",
};

type SearchParams = Record<string, string | string[] | undefined>;
export default function CompareRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <Suspense fallback={<LoadingComparison />}><ComparisonContent searchParams={searchParams} /></Suspense>;
}

async function ComparisonContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { a, b } = await searchParams;
  return <ComparisonPage {...selectComparison(a, b)} regions={getExploreRegionsProduct2023()} />;
}
