import type { Metadata } from "next";
import { ExplorePage } from "@/components/explore/explore-page";

export const metadata: Metadata = {
  title: "Explore",
  description: "Explore published 2023 Jawa Barat CIVX modeled regional results and their BPS source evidence.",
};

export default function ExploreRoute() {
  return <ExplorePage />;
}
