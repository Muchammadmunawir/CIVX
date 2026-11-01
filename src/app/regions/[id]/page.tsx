import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getExploreRegionsProduct2023, getRegionProductView2023 } from "@/lib/civx/product-2023";
import { RegionDetail } from "@/components/regions/region-detail";

export function generateStaticParams() {
  return getExploreRegionsProduct2023().map(({ region }) => ({ id: region.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const view = getRegionProductView2023((await params).id);
  if (!view) notFound();
  return { title: view.region.name, description: `Skor CIVX 2023, enam dimensi tekanan relatif, 18 indikator, dan data konteks ${view.region.name}.` };
}

export default function RegionPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<main className="civx-container civx-state" aria-busy="true"><p role="status">Memuat detail wilayah…</p><div className="civx-skeleton" /></main>}><RegionRecord params={params} /></Suspense>;
}

async function RegionRecord({ params }: { params: Promise<{ id: string }> }) {
  return <main><RegionDetail id={(await params).id} /></main>;
}
