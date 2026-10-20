import type { PrismaClient } from "@/app/generated/prisma/client";
import { sortTimeline } from "@/lib/domain/timeline";
import type { TimelineUpdate } from "@/lib/domain/types";

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
  createdAt: true,
  updatedAt: true,
} as const;

const updateSelect = {
  id: true,
  projektId: true,
  datum: true,
  kurztitel: true,
  detailtext: true,
  status: true,
  publiziertAm: true,
  createdAt: true,
  pdfDateiname: true,
  pdfMimeType: true,
  pdfGroesse: true,
  pdfGespeichertAm: true,
} as const;

export type AdminProjectSummary = {
  id: number;
  titel: string;
  abteilung: string;
  status: string;
  archiviert: boolean;
  entwurfCount: number;
  publiziertCount: number;
};

export type AdminProjectDetail = {
  id: number;
  titel: string;
  abteilung: string;
  ansprechperson: string;
  status: string;
  startdatum: Date;
  naechsterTermin: Date | null;
  naechsterTerminLabel: string | null;
  kurzbeschrieb: string;
  wirkung: string;
  archiviert: boolean;
  updatedAt: Date;
  updates: (TimelineUpdate & { publiziertAm: Date | null })[];
};

export async function listAdminProjects(
  db: PrismaClient,
  archiviert = false,
): Promise<AdminProjectSummary[]> {
  const projects = await db.projekt.findMany({
    where: { archiviert },
    select: {
      id: true,
      titel: true,
      abteilung: true,
      status: true,
      archiviert: true,
      updates: { select: { status: true } },
    },
    orderBy: { titel: "asc" },
  });

  return projects.map((p) => ({
    id: p.id,
    titel: p.titel,
    abteilung: p.abteilung,
    status: p.status,
    archiviert: p.archiviert,
    entwurfCount: p.updates.filter((u) => u.status === "ENTWURF").length,
    publiziertCount: p.updates.filter((u) => u.status === "PUBLIZIERT").length,
  }));
}

export async function getAdminProjectDetail(
  db: PrismaClient,
  id: number,
): Promise<AdminProjectDetail | null> {
  const project = await db.projekt.findUnique({
    where: { id },
    select: {
      ...projectSelect,
      updates: { select: updateSelect },
    },
  });

  if (!project) {
    return null;
  }

  return {
    ...project,
    updates: sortTimeline(project.updates),
  };
}
