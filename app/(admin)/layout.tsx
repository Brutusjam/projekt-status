import { AppHeader } from "@/components/layout/AppHeader";
import Link from "next/link";

export const dynamic = "force-dynamic";

const adminNav = [
  { href: "/admin", label: "Projekte" },
  { href: "/admin/benutzer", label: "Benutzer" },
  { href: "/admin/export", label: "Export/Import" },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AppHeader />
      <nav className="border-b border-border bg-muted/30" aria-label="Administration">
        <div className="ad-page-shell flex flex-wrap items-center gap-2 py-3">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            className="ml-auto rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Leseransicht
          </Link>
        </div>
      </nav>
      <main className="ad-page-shell flex-1 space-y-8 py-10">
        {children}
      </main>
    </>
  );
}
