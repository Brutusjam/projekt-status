import { AppHeader } from "@/components/layout/AppHeader";
import { AppNav } from "@/components/layout/AppNav";

export const dynamic = "force-dynamic";

export default function LeserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppHeader />
      <AppNav />
      <main className="ad-page-shell flex-1 py-10">
        {children}
      </main>
    </>
  );
}
