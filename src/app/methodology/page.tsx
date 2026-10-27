import type { Metadata } from "next";
import { MethodologyPage } from "@/components/methodology/methodology-page";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How the current CIVX Jawa Barat release uses fixed bounds, dimension budgets, a complete common core, and declared sensitivity diagnostics.",
};

export default function MethodologyRoute() {
  return <MethodologyPage />;
}
