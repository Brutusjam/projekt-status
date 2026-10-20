import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminUpdateItem } from "@/components/admin/admin-update-item";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/projekte/status-badge";
import { Button } from "@/components/ui/button";
import { getAdminProjectDetail } from "@/lib/domain/projects/admin-queries";
import { prisma } from "@/lib/prisma";
import type { ProjektStatus } from "@/app/generated/prisma/client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminProjectUpdatesPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = Number(id);
  if (Number.isNaN(projectId)) {
    notFound();
  }

  const project = await getAdminProjectDetail(prisma, projectId);
  if (!project) {
    notFound();
  }

  const mailSentByUpdate = await Promise.all(
    project.updates.map(async (update) => {
      const count = await prisma.mailversand.count({
        where: { updateId: update.id, status: "GESENDET" },
      });
      return { updateId: update.id, sent: count > 0 };
    }),
  );

  const mailSentMap = new Map(
    mailSentByUpdate.map((item) => [item.updateId, item.sent]),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <PageHeader
            eyebrow={project.titel}
            title="Updates erfassen"
            description={`${project.abteilung} · Updates als Entwurf speichern, bearbeiten und publizieren.`}
          />
          <StatusBadge status={project.status as ProjektStatus} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link href="/admin" />}>
            Zurück zur Liste
          </Button>
          <Button
            variant="outline"
            render={<Link href={`/admin/projekte/${projectId}`} />}
          >
            Projekt bearbeiten
          </Button>
          <Button render={<Link href={`/admin/projekte/${projectId}/updates/neu`} />}>
            Neues Update
          </Button>
        </div>
      </div>

      {project.updates.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-muted-foreground">
          Noch keine Updates vorhanden.{" "}
          <Link
            href={`/admin/projekte/${projectId}/updates/neu`}
            className="font-medium text-primary hover:underline"
          >
            Erstes Update erfassen
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {project.updates.map((update) => (
            <AdminUpdateItem
              key={update.id}
              projectId={projectId}
              update={update}
              mailSent={mailSentMap.get(update.id) ?? false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
