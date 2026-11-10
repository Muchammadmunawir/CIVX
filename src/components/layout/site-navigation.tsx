"use client";

import { usePathname } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { NavigationLinks } from "./navigation-links";

function ActiveNavigationLinks() {
  return <NavigationLinks pathname={usePathname()} />;
}

export function SiteNavigation() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return <div className="civx-navigation" data-open={open} onKeyDown={event => {
    if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
  }}>
    <button ref={toggle} className="civx-menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>Menu <span aria-hidden="true">{open ? "−" : "+"}</span></button>
    <div id="site-navigation" onClick={event => { if ((event.target as HTMLElement).closest("a")) { setOpen(false); toggle.current?.focus(); } }}><Suspense fallback={<NavigationLinks />}><ActiveNavigationLinks /></Suspense></div>
  </div>;
}
