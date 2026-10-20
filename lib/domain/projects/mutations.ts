import type { PrismaClient } from "@/app/generated/prisma/client";
import { NotFoundError, ValidationError } from "@/lib/domain/errors";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/domain/schemas/project";
import { projectHasPublishedUpdates } from "@/lib/domain/visibility";
import { deletePdfFileIfPresent } from "@/lib/domain/updates/attachments";

export async function createProject(
  db: PrismaClient,
  input: CreateProjectInput,
) {
  return db.projekt.create({
    data: {
      titel: input.titel,
      abteilung: input.abteilung,
      ansprechperson: input.ansprechperson,
      status: input.status,
      startdatum: input.startdatum,
      naechsterTermin: input.naechsterTermin,
      naechsterTerminLabel: input.naechsterTerminLabel,
      kurzbeschrieb: input.kurzbeschrieb,
      wirkung: input.wirkung,
    },
  });
}

export async function updateProject(
  db: PrismaClient,
  id: number,
  input: UpdateProjectInput,
) {
  const existing = await db.projekt.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError("Projekt nicht gefunden");
  }

  return db.projekt.update({
    where: { id },
    data: {
      titel: input.titel,
      abteilung: input.abteilung,
      ansprechperson: input.ansprechperson,
      status: input.status,
      startdatum: input.startdatum,
      naechsterTermin: input.naechsterTermin,
      naechsterTerminLabel: input.naechsterTerminLabel,
      kurzbeschrieb: input.kurzbeschrieb,
      wirkung: input.wirkung,
    },
  });
}

export async function archiveProject(db: PrismaClient, id: number) {
  const existing = await db.projekt.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError("Projekt nicht gefunden");
  }

  return db.projekt.update({
    where: { id },
    data: { archiviert: true },
  });
}

export async function unarchiveProject(db: PrismaClient, id: number) {
  const existing = await db.projekt.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError("Projekt nicht gefunden");
  }

  return db.projekt.update({
    where: { id },
    data: { archiviert: false },
  });
}

export async function hardDeleteProject(db: PrismaClient, id: number) {
  const project = await db.projekt.findUnique({
    where: { id },
    include: { updates: { select: { id: true, status: true } } },
  });

  if (!project) {
    throw new NotFoundError("Projekt nicht gefunden");
  }

  if (projectHasPublishedUpdates(project.updates)) {
    throw new ValidationError(
      "Projekte mit publizierten Updates können nicht gelöscht werden. Bitte archiviere das Projekt.",
    );
  }

  for (const update of project.updates) {
    deletePdfFileIfPresent(update.id);
  }

  await db.projekt.delete({ where: { id } });
}
