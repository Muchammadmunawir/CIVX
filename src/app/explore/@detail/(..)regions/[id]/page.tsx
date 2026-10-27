import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RegionDetail } from "@/components/regions/region-detail";
import { RegionOverlay } from "@/components/regions/region-overlay";
import { getCurrentRegion } from "@/lib/civx/current";

export default function ContextualRegionPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <ContextualRecord params={params} />
    </Suspense>
  );
}

async function ContextualRecord({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getCurrentRegion(id)) notFound();
  return <RegionOverlay id={id}><RegionDetail id={id} contextual /></RegionOverlay>;
}
