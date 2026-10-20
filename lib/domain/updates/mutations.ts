import type { PrismaClient } from "@/app/generated/prisma/client";
import { NotFoundError } from "@/lib/domain/errors";
import type { CreateUpdateInput, UpdateUpdateInput } from "@/lib/domain/schemas/update";
import { deletePdfFileIfPresent } from "@/lib/domain/updates/attachments";

export async function createUpdate(
  db: PrismaClient,
  projektId: number,
  input: CreateUpdateInput,
) {
  const project = await db.projekt.findUnique({ where: { id: projektId } });
  if (!project) {
    throw new NotFoundError("Projekt nicht gefunden");
  }

  return db.update.create({
    data: {
      projektId,
      datum: input.datum,
      kurztitel: input.kurztitel,
      detailtext: input.detailtext,
      status: "ENTWURF",
    },
  });
}

export async function updateUpdate(
  db: PrismaClient,
  id: number,
  input: UpdateUpdateInput,
) {
  const existing = await db.update.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError("Update nicht gefunden");
  }

  return db.update.update({
    where: { id },
    data: {
      datum: input.datum,
      kurztitel: input.kurztitel,
      detailtext: input.detailtext,
    },
  });
}

export async function publishUpdate(db: PrismaClient, id: number) {
  const existing = await db.update.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError("Update nicht gefunden");
  }

  const now = new Date();

  return db.update.update({
    where: { id },
    data: {
      status: "PUBLIZIERT",
      publiziertAm: existing.publiziertAm ?? now,
    },
  });
}

export async function hardDeleteUpdate(db: PrismaClient, id: number) {
  const update = await db.update.findUnique({ where: { id } });
  if (!update) {
    throw new NotFoundError("Update nicht gefunden");
  }

  deletePdfFileIfPresent(id);
  await db.update.delete({ where: { id } });
}
