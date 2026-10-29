"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "Projekte", match: ["/admin", "/admin/projekte"] },
  { href: "/admin/projektbericht", label: "Projektbericht", match: ["/admin/projektbericht"] },
];

const settingsNav = [
  { href: "/admin/export", label: "Import/Export" },
  { href: "/admin/benutzer", label: "Benutzer" },
];

const linkClass =
  "rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";
const activeClass = "bg-muted text-foreground";

function isActive(pathname: string, href: string, exact = false) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();
  const settingsActive = settingsNav.some((item) => isActive(pathname, item.href));

  return (
    <nav className="border-b border-border bg-muted/30" aria-label="Administration">
      <div className="ad-page-shell flex flex-wrap items-center gap-2 py-3">
        {adminNav.map((item) => {
          const active = item.match.some((href) => isActive(pathname, href, href === "/admin"));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(linkClass, active && activeClass)}
            >
              {item.label}
            </Link>
          );
        })}

        <Menu.Root>
          <Menu.Trigger
            aria-label="Einstellungen"
            title="Einstellungen"
            className={cn(
              linkClass,
              "inline-flex items-center px-2 data-[popup-open]:bg-muted data-[popup-open]:text-foreground",
              settingsActive && activeClass,
            )}
          >
            <SettingsIcon className="size-4" aria-hidden />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={6} align="start" className="z-50">
              <Menu.Popup className="min-w-44 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none">
                {settingsNav.map((item) => (
                  <Menu.LinkItem
                    key={item.href}
                    closeOnClick
                    render={<Link href={item.href} />}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-3 py-1.5 text-sm outline-none data-[highlighted]:bg-muted",
                      isActive(pathname, item.href) && "font-medium",
                    )}
                  >
                    {item.label}
                  </Menu.LinkItem>
                ))}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>

        <Link href="/" className={cn(linkClass, "ml-auto font-normal")}>
          Leseransicht
        </Link>
      </div>
    </nav>
  );
}
