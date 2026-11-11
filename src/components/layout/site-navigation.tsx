"use client";

import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { NavigationLinks } from "./navigation-links";

const mobileQuery = "(max-width: 760px)";
const getMobileSnapshot = () => window.matchMedia(mobileQuery).matches;
const getServerSnapshot = () => false;

function ActiveNavigationLinks() {
  return <NavigationLinks pathname={usePathname()} />;
}

export function SiteNavigation() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const subscribeToBreakpoint = useCallback((onChange: () => void) => {
    const media = window.matchMedia(mobileQuery);
    const handleChange = () => {
      const triggerFocused = document.activeElement === toggle.current;
      const linkFocused = panel.current?.contains(document.activeElement);
      setOpen(false);
      onChange();
      if (media.matches && linkFocused) toggle.current?.focus();
      if (!media.matches && triggerFocused) {
        requestAnimationFrame(() => panel.current?.querySelector<HTMLAnchorElement>("a[href]")?.focus());
      }
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);
  const mobile = useSyncExternalStore(subscribeToBreakpoint, getMobileSnapshot, getServerSnapshot);
  const expanded = mobile && open;

  useEffect(() => {
    if (!expanded) return;
    const dismissOutside = (event: Event) => {
      if (!(event.target instanceof Node) || root.current?.contains(event.target)) return;
      setOpen(false);
      if (event.type === "pointerdown" && panel.current?.contains(document.activeElement)) {
        toggle.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
    };
  }, [expanded]);

  return <div ref={root} className="civx-navigation" data-open={expanded} onKeyDown={event => {
    if (expanded && event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      toggle.current?.focus();
    }
  }}>
    <button ref={toggle} className="civx-menu-toggle" type="button" aria-label={expanded ? "Tutup navigasi" : "Buka navigasi"} aria-expanded={expanded} aria-controls="site-navigation" onClick={() => setOpen(value => !value)}>
      <span className="civx-menu-icon" aria-hidden="true"><span /><span /><span /></span>
    </button>
    <div ref={panel} id="site-navigation" inert={mobile && !open} aria-hidden={mobile && !open ? true : undefined} onClick={event => {
      if (mobile && (event.target as HTMLElement).closest("a")) {
        setOpen(false);
        toggle.current?.focus();
      }
    }}><Suspense fallback={<NavigationLinks />}><ActiveNavigationLinks /></Suspense></div>
  </div>;
}
