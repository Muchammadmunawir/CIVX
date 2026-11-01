import Link from "next/link";
import { Suspense } from "react";
import { NavigationLinks } from "./navigation-links";
import { SiteNavigation } from "./site-navigation";
import { ThemeToggle } from "./theme-toggle";
import { getExploreRegionsProduct2023 } from "@/lib/civx/product-2023";
import { RegionSearch } from "./region-search";

export function SiteHeader() {
  return (
    <header className="civx-header">
      <div className="civx-container civx-header-inner">
        <Link className="civx-wordmark" href="/" aria-label="CIVX · Beranda">
          <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M21 4H8a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4v-9l-5 5v3H9V9h10V4Z" fill="currentColor"/><path d="m17 9 7-5v6l-7 5Z" fill="currentColor"/></svg>
          <span>CIV<span className="civx-wordmark-x">X</span></span>
        </Link>
        <Suspense fallback={<NavigationLinks />}><SiteNavigation /></Suspense>
        <RegionSearch regions={getExploreRegionsProduct2023().map(({ region }) => region)} />
        <ThemeToggle />
      </div>
    </header>
  );
}
