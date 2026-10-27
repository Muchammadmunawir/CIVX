import type { Metadata } from "next";
import { MethodologyPage } from "@/components/methodology/methodology-page";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How the 2023 Civic Index normalizes and weights four indicators against fixed Jawa Barat reference ranges.",
};

export default function MethodologyRoute() {
  return <MethodologyPage />;
}
