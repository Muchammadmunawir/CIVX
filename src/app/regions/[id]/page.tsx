import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { civicRelease, currentRegions, getCurrentRegion } from "@/lib/civx/current";
import { RegionDetail } from "@/components/regions/region-detail";

export function generateStaticParams() {
  return currentRegions.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const region = getCurrentRegion((await params).id);
  if (!region) notFound();
  return {
    title: `${region.name} | Civic Index`,
    description: `${civicRelease.period} Civic Index, pressure dimensions, core observations, Context Signals and Regional Advantages for ${region.name}.`,
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
