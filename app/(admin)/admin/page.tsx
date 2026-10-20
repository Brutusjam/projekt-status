import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/projekte/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listAdminProjects } from "@/lib/domain/projects/admin-queries";
import { prisma } from "@/lib/prisma";
import type { ProjektStatus } from "@/app/generated/prisma/client";

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

      <Tabs defaultValue="aktiv">
        <TabsList>
          <TabsTrigger value="aktiv">Aktiv ({active.length})</TabsTrigger>
          <TabsTrigger value="archiv">Archiv ({archived.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="aktiv" className="pt-6">
          <ProjectTable projects={active} />
        </TabsContent>
        <TabsContent value="archiv" className="pt-6">
          <ProjectTable projects={archived} archived />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProjectTable({
  projects,
  archived = false,
}: {
  projects: Awaited<ReturnType<typeof listAdminProjects>>;
  archived?: boolean;
}) {
  if (projects.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-muted-foreground">
        {archived ? "Keine archivierten Projekte." : "Noch keine Projekte vorhanden."}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Titel</th>
            <th className="px-4 py-3 font-medium">Abteilung</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Updates</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-t border-border">
              <td className="px-4 py-3 font-medium">{project.titel}</td>
              <td className="px-4 py-3 text-muted-foreground">{project.abteilung}</td>
              <td className="px-4 py-3">
                <StatusBadge status={project.status as ProjektStatus} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {project.publiziertCount} publiziert, {project.entwurfCount} Entwürfe
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex flex-wrap justify-end gap-x-4 gap-y-1">
                  <Link
                    href={`/admin/projekte/${project.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    Projekt bearbeiten
                  </Link>
                  <Link
                    href={`/admin/projekte/${project.id}/updates`}
                    className="font-medium text-primary hover:underline"
                  >
                    Updates erfassen
                  </Link>
                  <Link
                    href={`/projekte/${project.id}`}
                    className="font-medium text-primary hover:underline"
                    target="_blank"
                  >
                    Leseransicht
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
