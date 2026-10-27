import Link from "next/link";

const navigation = [
  { label: "Explore", href: "/explore" },
  { label: "Compare", href: "/compare" },
  { label: "Methodology", href: "/methodology" },
  { label: "Sources", href: "/sources" },
];

export function NavigationLinks({ pathname = "" }: { pathname?: string }) {
  return (
    <nav className="civx-nav" aria-label="Primary navigation">
      {navigation.map((item) => {
        const active = pathname === item.href || (item.href === "/explore" && pathname.startsWith("/regions/"));
        return <Link className={`civx-nav-link${active ? " civx-nav-active" : ""}`} href={item.href} aria-current={active ? "page" : undefined} key={item.href}>{item.label}</Link>;
      })}
    </nav>
  );
}
