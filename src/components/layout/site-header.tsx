import Link from "next/link";
import { Suspense } from "react";
import { NavigationLinks } from "./navigation-links";
import { SiteNavigation } from "./site-navigation";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="civx-header">
      <div className="civx-container civx-header-inner">
        <Link className="civx-wordmark" href="/" aria-label="CIVX Civic Index home">
          <span>CIV<span className="civx-wordmark-x">X</span></span>
          <span className="civx-brand-name">Jawa Barat</span>
        </Link>
        <Suspense fallback={<NavigationLinks />}><SiteNavigation /></Suspense>
        <ThemeToggle />
      </div>
    </header>
  );
}
