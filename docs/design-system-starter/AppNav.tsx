import Link from "next/link";
import type { ReactNode } from "react";

export type NavItem = {
  href: string;
  label: string;
};

type AppNavProps = {
  items: NavItem[];
  /** Optional: rechte Seite (Auth, Admin-Link usw.) */
  trailing?: ReactNode;
};

/**
 * Hauptnavigation unter dem App-Header.
 * Navigation-Items pro Projekt anpassen.
 */
export function AppNav({ items, trailing }: AppNavProps) {
  return (
    <nav className="ad-app-nav" aria-label="Hauptnavigation">
      <div className="ad-page-shell ad-app-nav__inner">
        <div className="flex items-center gap-1">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="ad-app-nav__link">
              {item.label}
            </Link>
          ))}
        </div>
        {trailing}
      </div>
    </nav>
  );
}
