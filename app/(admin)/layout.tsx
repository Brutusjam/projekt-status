import { AdminNav } from "@/components/layout/AdminNav";
import { AppHeader } from "@/components/layout/AppHeader";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AppHeader />
      <AdminNav />
      <main className="ad-page-shell flex-1 space-y-8 py-10">
        {children}
      </main>
    </>
  );
}
