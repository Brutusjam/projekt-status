import { AppHeader } from "@/components/layout/AppHeader";
import { AppNav } from "@/components/layout/AppNav";

/**
 * Beispiel-Layout für eingeloggte App-Ansichten.
 * Als app/(app)/layout.tsx oder ähnlich verwenden.
 */
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppHeader eyebrow="Gemeinde Altdorf" title="Meine Anwendung" />
      <AppNav
        items={[
          { href: "/", label: "Start" },
          { href: "/uebersicht", label: "Übersicht" },
        ]}
      />
      <main className="ad-page-shell flex-1 py-10">{children}</main>
    </>
  );
}
