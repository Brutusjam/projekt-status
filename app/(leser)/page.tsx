import { Suspense } from "react";
import type { ProjektStatus } from "@/app/generated/prisma/client";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectCard } from "@/components/projekte/project-card";
import { ProjectFilters } from "@/components/projekte/project-filters";
import { ProjectListItem } from "@/components/projekte/project-list-item";
import { StatusChips } from "@/components/projekte/status-chips";
import { ViewToggle } from "@/components/projekte/view-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  listAbteilungen,
  listArchivedProjects,
  listVisibleProjects,
} from "@/lib/domain/projects/queries";
import type { ProjectSummary } from "@/lib/domain/types";
import { PROJEKT_STATUS_LABELS } from "@/lib/labels";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams: Promise<{
    abteilung?: string;
    status?: string;
    ansicht?: string;
  }>;
};

function parseStatus(value: string | undefined): ProjektStatus | undefined {
  if (!value) {
    return undefined;
  }

  return value in PROJEKT_STATUS_LABELS
    ? (value as ProjektStatus)
    : undefined;
}

function emptyStatusCounts(): Record<ProjektStatus, number> {
  return {
    IDEE: 0,
    IN_ABKLAERUNG: 0,
    IN_UMSETZUNG: 0,
    PILOTBETRIEB: 0,
    ABGESCHLOSSEN: 0,
    PAUSIERT: 0,
  };
}

function countByStatus(
  projects: ProjectSummary[],
): Record<ProjektStatus, number> {
  const counts = emptyStatusCounts();
  for (const project of projects) {
    counts[project.status] += 1;
  }
  return counts;
}

function ProjectCollection({
  projects,
  ansicht,
}: {
  projects: ProjectSummary[];
  ansicht: "karten" | "liste";
}) {
  if (projects.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-muted-foreground">
        Keine sichtbaren Projekte für die gewählten Filter.
      </p>
    );
  }

  if (ansicht === "liste") {
    return (
      <div className="flex flex-col gap-3">
        {projects.map((project) => (
          <ProjectListItem key={project.id} project={project} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const abteilung = params.abteilung;
  const status = parseStatus(params.status);
  const ansicht = params.ansicht === "karten" ? "karten" : "liste";

  const [projectsForFilters, archivedProjects, abteilungen] = await Promise.all(
    [
      listVisibleProjects(prisma, { abteilung }),
      listArchivedProjects(prisma),
      listAbteilungen(prisma),
    ],
  );

  const statusCounts = countByStatus(projectsForFilters);
  const projects = status
    ? projectsForFilters.filter((project) => project.status === status)
    : projectsForFilters;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Dashboard"
        title="Projektübersicht"
        description="Alle aktiven Projekte. Filter nach Abteilung und Status. In der Timeline erscheinen nur publizierte Updates."
      />

      <Tabs defaultValue="aktiv">
        <TabsList>
          <TabsTrigger value="aktiv">Aktiv ({projects.length})</TabsTrigger>
          <TabsTrigger value="archiv">
            Archiv ({archivedProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="aktiv" className="space-y-8 pt-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <Suspense
                fallback={
                  <p className="text-sm text-muted-foreground">
                    Filter werden geladen…
                  </p>
                }
              >
                <ProjectFilters abteilungen={abteilungen} />
              </Suspense>
              <Suspense fallback={null}>
                <ViewToggle />
              </Suspense>
            </div>

            <Suspense
              fallback={
                <p className="text-sm text-muted-foreground">
                  Statusfilter werden geladen…
                </p>
              }
            >
              <StatusChips
                counts={statusCounts}
                total={projectsForFilters.length}
              />
            </Suspense>
          </div>

          <ProjectCollection projects={projects} ansicht={ansicht} />
        </TabsContent>

        <TabsContent value="archiv" className="space-y-8 pt-6">
          <div className="flex justify-end">
            <Suspense fallback={null}>
              <ViewToggle />
            </Suspense>
          </div>

          {archivedProjects.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-muted-foreground">
              Keine archivierten Projekte.
            </p>
          ) : (
            <ProjectCollection
              projects={archivedProjects}
              ansicht={ansicht}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
