import Link from "next/link";
import { notFound } from "next/navigation";
import { NewUpdateForm } from "@/components/admin/new-update-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewUpdatePage({ params }: PageProps) {
  const { id } = await params;
  const projectId = Number(id);
  if (Number.isNaN(projectId)) {
    notFound();
  }

  const project = await prisma.projekt.findUnique({
    where: { id: projectId },
    select: { titel: true },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <PageHeader
          eyebrow={project.titel}
          title="Neues Update"
          description="Update als Entwurf speichern und später publizieren."
        />
        <Button variant="outline" render={<Link href={`/admin/projekte/${projectId}/updates`} />}>
          Zurück
        </Button>
      </div>
      <NewUpdateForm projectId={projectId} />
    </div>
  );
}
