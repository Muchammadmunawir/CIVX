"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Explore", href: "/explore" },
  { label: "Methodology", href: "/methodology" },
  { label: "Sources", href: "/sources" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="civx-header">
      <div className="civx-container civx-header-inner">
        <Link className="civx-wordmark" href="/" aria-label="CIVX Civic Index home" aria-current={pathname === "/" ? "page" : undefined}>
          <span>CIV<span className="civx-wordmark-x">X</span></span>
          <span className="civx-brand-name">Civic Index</span>
        </Link>
        <nav className="civx-nav" aria-label="Primary navigation">
          {navigation.map((item) => {
            const active = pathname === item.href || (item.href === "/explore" && pathname.startsWith("/regions/"));
            return (
              <Link
                className={`civx-nav-link${active ? " civx-nav-active" : ""}${item.href === "/explore" ? " civx-nav-primary" : ""}`}
                href={item.href}
                aria-current={active ? "page" : undefined}
                key={item.label}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
