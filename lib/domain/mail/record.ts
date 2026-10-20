import type { PrismaClient } from "@/app/generated/prisma/client";
import { NotFoundError, ValidationError } from "@/lib/domain/errors";

export async function hasMailBeenSent(
  db: PrismaClient,
  updateId: number,
): Promise<boolean> {
  const count = await db.mailversand.count({
    where: { updateId, status: "GESENDET" },
  });
  return count > 0;
}

export async function recordMailSend(
  db: PrismaClient,
  updateId: number,
  empfaenger: string,
  status: "GESENDET" | "FEHLGESCHLAGEN",
) {
  return db.mailversand.create({
    data: { updateId, empfaenger, status },
  });
}

export async function getPublishedUpdateForMail(
  db: PrismaClient,
  updateId: number,
) {
  const update = await db.update.findUnique({
    where: { id: updateId },
    include: {
      projekt: { select: { titel: true, archiviert: true } },
    },
  });

  if (!update) {
    throw new NotFoundError("Update nicht gefunden");
  }

  if (update.status !== "PUBLIZIERT") {
    throw new ValidationError("Nur publizierte Updates können benachrichtigt werden.");
  }

  if (update.projekt.archiviert) {
    throw new ValidationError("Archivierte Projekte können nicht benachrichtigt werden.");
  }

  return update;
}
