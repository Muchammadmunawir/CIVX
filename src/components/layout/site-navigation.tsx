"use client";

import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { NavigationLinks } from "./navigation-links";

export function SiteNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return <div className="civx-navigation" data-open={open} onKeyDown={event => {
    if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
  }}>
    <button ref={toggle} className="civx-menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>Menu <span aria-hidden="true">{open ? "−" : "+"}</span></button>
    <div id="site-navigation" onClick={event => { if ((event.target as HTMLElement).closest("a")) setOpen(false); }}><NavigationLinks pathname={pathname} /></div>
  </div>;
}
