"use client";

import { usePathname } from "next/navigation";
import { NavigationLinks } from "./navigation-links";

export function SiteNavigation() {
  return <NavigationLinks pathname={usePathname()} />;
}
