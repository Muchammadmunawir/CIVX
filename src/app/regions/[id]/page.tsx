import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getRegionDetail, regionalData } from "@/lib/civx/data";
import { RegionDetail } from "@/components/regions/region-detail";

export function generateStaticParams() {
  return regionalData.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const detail = getRegionDetail((await params).id);
  if (!detail) notFound();
  return {
    title: `${detail.region.name} | Civic Index`,
    description: `${detail.region.period} Civic Index result, indicator inputs, and sources for ${detail.region.name}.`,
  };
}

export default function RegionPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<main className="civx-container civx-state" aria-busy="true"><p role="status">Loading regional record…</p><div className="civx-skeleton" /></main>}>
      <RegionRecord params={params} />
    </Suspense>
  );
}

async function RegionRecord({ params }: { params: Promise<{ id: string }> }) {
  return <main><RegionDetail id={(await params).id} /></main>;
}
