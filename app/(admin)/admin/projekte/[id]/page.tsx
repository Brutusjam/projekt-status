import Link from "next/link";
import { notFound } from "next/navigation";
import {
  archiveProjectFormAction,
  deleteProjectFormAction,
  unarchiveProjectFormAction,
} from "@/app/(admin)/admin/actions/form-wrappers";
import { EditProjectForm } from "@/components/admin/edit-project-form";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectDetailView } from "@/components/projekte/project-detail-view";
import { StatusBadge } from "@/components/projekte/status-badge";
import { Button } from "@/components/ui/button";
import { getAdminProjectDetail } from "@/lib/domain/projects/admin-queries";
import { getProjectDetailPreview } from "@/lib/domain/projects/queries";
import { prisma } from "@/lib/prisma";
import type { ProjektStatus } from "@/app/generated/prisma/client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = Number(id);
  if (Number.isNaN(projectId)) {
    notFound();
  }

  const project = await getAdminProjectDetail(prisma, projectId);
  if (!project) {
    notFound();
  }

  const readerPreview = await getProjectDetailPreview(prisma, projectId);
  const previewNotice =
    readerPreview && !readerPreview.visibleToReaders
      ? "Noch keine publizierten Updates. Leser sehen das Projekt in der Übersicht, die Timeline bleibt leer."
      : null;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <PageHeader
            eyebrow="Administration"
            title={project.titel}
            description={`${project.abteilung} · ${project.ansprechperson}`}
          />
          <StatusBadge status={project.status as ProjektStatus} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link href="/admin" />}>
            Zurück
          </Button>
          <Button
            variant="outline"
            render={<Link href={`/projekte/${projectId}`} target="_blank" />}
          >
            Leseransicht
          </Button>
          <Button
            render={<Link href={`/admin/projekte/${projectId}/updates`} />}
          >
            Updates erfassen
          </Button>
          <Button
            variant="outline"
            render={<Link href={`/api/admin/pdf/projekt/${projectId}`} target="_blank" />}
          >
            PDF exportieren
          </Button>
          {project.archiviert ? (
            <form action={unarchiveProjectFormAction}>
              <input type="hidden" name="projectId" value={projectId} />
              <Button type="submit" variant="secondary">
                Reaktivieren
              </Button>
            </form>
          ) : (
            <form action={archiveProjectFormAction}>
              <input type="hidden" name="projectId" value={projectId} />
              <Button type="submit" variant="secondary">
                Archivieren
              </Button>
            </form>
          )}
          <form action={deleteProjectFormAction}>
            <input type="hidden" name="projectId" value={projectId} />
            <Button type="submit" variant="destructive">
              Projekt löschen
            </Button>
          </form>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Projektdaten</h2>
        <EditProjectForm
          projectId={projectId}
          formKey={`${project.status}-${project.updatedAt.toISOString()}`}
          initial={{
            titel: project.titel,
            abteilung: project.abteilung,
            ansprechperson: project.ansprechperson,
            status: project.status as ProjektStatus,
            startdatum: project.startdatum,
            naechsterTermin: project.naechsterTermin,
            naechsterTerminLabel: project.naechsterTerminLabel,
            kurzbeschrieb: project.kurzbeschrieb,
            wirkung: project.wirkung,
          }}
        />
      </section>

      {readerPreview ? (
        <section className="space-y-4 border-t border-border pt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Vorschau</p>
              <h2 className="text-lg font-semibold">So sehen es Leser</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/projekte/${projectId}`} target="_blank" />}
            >
              In Leseransicht öffnen
            </Button>
          </div>
          <div className="rounded-2xl border border-border bg-background p-6">
            <ProjectDetailView
              project={readerPreview}
              previewNotice={previewNotice}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
