import type { Metadata } from "next";
import { Suspense } from "react";
import { ComparisonPage } from "@/components/compare/comparison-page";
import { selectComparison } from "@/components/compare/comparison-selection";
import { getExploreRegionsProduct2023 } from "@/lib/civx/product-2023";

export const metadata: Metadata = {
  title: "Bandingkan",
  description: "Bandingkan indeks dua wilayah Jawa Barat pada model CIVX 2023 dalam empat dimensi: pendidikan, kesehatan, ekonomi, dan infrastruktur.",
};

type SearchParams = Record<string, string | string[] | undefined>;
export default function CompareRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <Suspense fallback={<main className="civx-container civx-state"><p role="status">Memuat perbandingan wilayah…</p></main>}><ComparisonContent searchParams={searchParams} /></Suspense>;
}

async function ComparisonContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { a, b } = await searchParams;
  return <ComparisonPage {...selectComparison(a, b)} regions={getExploreRegionsProduct2023()} />;
}
