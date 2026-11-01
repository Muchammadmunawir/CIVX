import Link from "next/link";

const navigation = [
  { label: "Beranda", href: "/" },
  { label: "Jelajah", href: "/explore" },
  { label: "Bandingkan", href: "/compare" },
  { label: "Metodologi", href: "/methodology" },
  { label: "Sumber Data", href: "/sources" },
];

export function NavigationLinks({ pathname = "" }: { pathname?: string }) {
  return (
    <nav className="civx-nav" aria-label="Navigasi utama">
      {navigation.map((item) => {
        const active = pathname === item.href || (item.href === "/explore" && pathname.startsWith("/regions/"));
        return <Link className={`civx-nav-link${active ? " civx-nav-active" : ""}`} href={item.href} aria-current={active ? "page" : undefined} key={item.href}>{item.label}</Link>;
      })}
    </nav>
  );
}
