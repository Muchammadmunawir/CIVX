import type { Metadata } from "next";
import { ExplorePage } from "@/components/explore/explore-page";

export const metadata: Metadata = {
  title: "Explore",
  description: "Explore current Jawa Barat Civic Index scores, validated pressure dimensions, Context Signals, Regional Advantages and public source evidence.",
};

export default function ExploreRoute() {
  return <ExplorePage />;
}
