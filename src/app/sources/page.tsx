import type { Metadata } from "next";
import { SourcesPage } from "@/components/sources/sources-page";

export const metadata: Metadata = {
  title: "Sumber Data",
  description: "Telusuri penerbit, sumber, periode, dan keterbatasan 18 indikator CORE serta tujuh dataset CONTEXT CIVX.",
};

export default function SourcesRoute() {
  return <SourcesPage />;
}
