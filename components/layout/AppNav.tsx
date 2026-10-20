import Link from "next/link";
import { AppNavAuth } from "@/components/layout/AppNavAuth";

const navItems = [
  { href: "/", label: "Projekte" },
  { href: "/was-ist-neu", label: "Was ist neu" },
];

export function AppNav() {
  return (
    <nav className="ad-app-nav" aria-label="Hauptnavigation">
      <div className="ad-page-shell ad-app-nav__inner">
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="ad-app-nav__link">
              {item.label}
            </Link>
          ))}
        </div>
        <AppNavAuth />
      </div>
    </nav>
  );
}
