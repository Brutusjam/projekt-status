import Link from "next/link";
import { AdminProjectTabs } from "@/components/admin/admin-project-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { listAdminProjects } from "@/lib/domain/projects/admin-queries";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [active, archived] = await Promise.all([
    listAdminProjects(prisma, false),
    listAdminProjects(prisma, true),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader
          eyebrow="Administration"
          title="Projekte verwalten"
          description="Projekte anlegen, bearbeiten, Updates publizieren und archivieren."
        />
        <Button render={<Link href="/admin/projekte/neu" />}>Neues Projekt</Button>
      </div>

      <AdminProjectTabs active={active} archived={archived} />
    </div>
  );
}
