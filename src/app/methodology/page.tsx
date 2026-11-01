import type { Metadata } from "next";
import { MethodologyPage } from "@/components/methodology/methodology-page";

export const metadata: Metadata = {
  title: "Metodologi",
  description: "Model CIVX 2023: 27 wilayah, 18 indikator, enam dimensi, normalisasi min–max sesuai arah tekanan, dan bobot dimensi setara.",
};

export default function MethodologyRoute() {
  return <MethodologyPage />;
}
