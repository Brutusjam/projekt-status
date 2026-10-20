import type { PrismaClient } from "@/app/generated/prisma/client";
import { filterPublished, projectHasPublishedUpdates } from "@/lib/domain/visibility";
import { getLatestUpdate, sortTimeline } from "@/lib/domain/timeline";
import type {
  ProjectDetail,
  ProjectDetailPreview,
  ProjectFilters,
  ProjectSummary,
  TimelineUpdate,
} from "@/lib/domain/types";

const projectSelect = {
  id: true,
  titel: true,
  abteilung: true,
  ansprechperson: true,
  status: true,
  startdatum: true,
  naechsterTermin: true,
  naechsterTerminLabel: true,
  kurzbeschrieb: true,
  wirkung: true,
  archiviert: true,
} as const;

const updateSelect = {
  id: true,
  projektId: true,
  datum: true,
  kurztitel: true,
  detailtext: true,
  status: true,
  createdAt: true,
  pdfDateiname: true,
  pdfMimeType: true,
  pdfGroesse: true,
  pdfGespeichertAm: true,
} as const;

function toProjectSummary(
  project: {
    id: number;
    titel: string;
    abteilung: string;
    ansprechperson: string;
    status: ProjectSummary["status"];
    startdatum: Date;
    naechsterTermin: Date | null;
    naechsterTerminLabel: string | null;
    kurzbeschrieb: string;
    wirkung: string;
    archiviert: boolean;
    updates: TimelineUpdate[];
  },
): ProjectSummary {
  const publishedUpdates = filterPublished(project.updates);
  const latest = getLatestUpdate(publishedUpdates);

  return {
    id: project.id,
    titel: project.titel,
    abteilung: project.abteilung,
    ansprechperson: project.ansprechperson,
    status: project.status,
    startdatum: project.startdatum,
    naechsterTermin: project.naechsterTermin,
    naechsterTerminLabel: project.naechsterTerminLabel,
    kurzbeschrieb: project.kurzbeschrieb,
    wirkung: project.wirkung,
    archiviert: project.archiviert,
    letztesUpdate: latest
      ? { datum: latest.datum, kurztitel: latest.kurztitel }
      : null,
  };
}

/** Absteigend nach letztem Update; ohne Update ans Ende; Gleichstand alphabetisch. */
export function sortProjectsByActivity(
  projects: ProjectSummary[],
): ProjectSummary[] {
  return [...projects].sort((a, b) => {
    const aTime = a.letztesUpdate?.datum.getTime() ?? 0;
    const bTime = b.letztesUpdate?.datum.getTime() ?? 0;

    if (aTime !== bTime) {
      return bTime - aTime;
    }

    return a.titel.localeCompare(b.titel, "de-CH");
  });
}

async function fetchProjectsWithUpdates(
  db: PrismaClient,
  archiviert: boolean,
) {
  return db.projekt.findMany({
    where: { archiviert },
    select: {
      ...projectSelect,
      updates: {
        select: {
          ...updateSelect,
        },
      },
    },
    orderBy: { titel: "asc" },
  });
}

export async function listVisibleProjects(
  db: PrismaClient,
  filters: ProjectFilters = {},
): Promise<ProjectSummary[]> {
  const projects = await fetchProjectsWithUpdates(db, false);

  // Bewusste Abweichung von R2 (Listenfilter): alle aktiven Projekte
  // erscheinen in der Übersicht. Timeline-Inhalte bleiben nur PUBLIZIERT.
  return sortProjectsByActivity(
    projects
      .filter((project) =>
        filters.abteilung ? project.abteilung === filters.abteilung : true,
      )
      .filter((project) =>
        filters.status ? project.status === filters.status : true,
      )
      .map(toProjectSummary),
  );
}

export async function listArchivedProjects(
  db: PrismaClient,
): Promise<ProjectSummary[]> {
  const projects = await fetchProjectsWithUpdates(db, true);
  return sortProjectsByActivity(projects.map(toProjectSummary));
}

export async function listAbteilungen(db: PrismaClient): Promise<string[]> {
  const rows = await db.projekt.findMany({
    where: { archiviert: false },
    select: { abteilung: true },
    distinct: ["abteilung"],
    orderBy: { abteilung: "asc" },
  });

  return rows.map((row) => row.abteilung);
}

export async function getProjectDetail(
  db: PrismaClient,
  id: number,
): Promise<ProjectDetail | null> {
  return getProjectDetailPreview(db, id);
}

export async function getProjectDetailPreview(
  db: PrismaClient,
  id: number,
): Promise<ProjectDetailPreview | null> {
  const project = await db.projekt.findUnique({
    where: { id },
    select: {
      ...projectSelect,
      updates: {
        select: updateSelect,
      },
    },
  });

  if (!project) {
    return null;
  }

  const summary = toProjectSummary(project);
  const publishedUpdates = sortTimeline(filterPublished(project.updates));
  // markiert, ob Timeline-Inhalt für Leser vorhanden ist (nicht Listen-Sichtbarkeit)
  const visibleToReaders = projectHasPublishedUpdates(project.updates);

  return {
    ...summary,
    updates: publishedUpdates,
    visibleToReaders,
  };
}
