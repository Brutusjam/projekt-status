import { notFound } from "next/navigation";
import { ProjectDetailView } from "@/components/projekte/project-detail-view";
import { getProjectDetail } from "@/lib/domain/projects/queries";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjektDetailPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = Number(id);

  if (Number.isNaN(projectId)) {
    notFound();
  }

  const project = await getProjectDetail(prisma, projectId);
  if (!project) {
    notFound();
  }

  const previewNotice =
    project.updates.length === 0
      ? "Noch keine publizierten Updates zu diesem Projekt."
      : null;

  return (
    <ProjectDetailView
      project={project}
      backHref="/"
      previewNotice={previewNotice}
    />
  );
}
