import type { Metadata } from "next";
import { Suspense } from "react";
import { ExplorePage } from "@/components/explore/explore-page";

export const metadata: Metadata = {
  title: "Jelajah",
  description: "Jelajahi 27 kabupaten/kota Jawa Barat dalam urutan kode BPS. Baca skor CIVX 2023, enam dimensi, dan bukti indikator.",
};

export default function ExploreRoute({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <Suspense fallback={<main className="civx-container civx-state"><p role="status">Memuat daftar wilayah…</p></main>}><ExploreContent searchParams={searchParams} /></Suspense>;
}

async function ExploreContent({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { q } = await searchParams;
  return <ExplorePage initialSearch={typeof q === "string" ? q : ""} />;
}
