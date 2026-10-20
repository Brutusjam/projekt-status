import type { PrismaClient } from "@/app/generated/prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { NotFoundError, ValidationError } from "@/lib/domain/errors";
import type { CreateUserInput } from "@/lib/domain/schemas/user";

export async function createUser(db: PrismaClient, input: CreateUserInput) {
  const existing = await db.benutzer.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new ValidationError("E-Mail ist bereits vergeben.");
  }

  const passwortHash = await hashPassword(input.initialPassword);

  return db.benutzer.create({
    data: {
      name: input.name,
      email: input.email,
      rolle: input.rolle,
      passwortHash,
      mustChangePassword: true,
      mailAbo: input.rolle === "LESER",
      aktiv: true,
    },
  });
}

export async function deactivateUser(db: PrismaClient, id: number) {
  const user = await db.benutzer.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundError("Benutzer nicht gefunden");
  }

  if (user.rolle === "ADMIN") {
    const adminCount = await db.benutzer.count({
      where: { rolle: "ADMIN", aktiv: true },
    });
    if (adminCount <= 1) {
      throw new ValidationError("Der letzte aktive Admin kann nicht deaktiviert werden.");
    }
  }

  return db.benutzer.update({
    where: { id },
    data: { aktiv: false },
  });
}

export async function activateUser(db: PrismaClient, id: number) {
  const user = await db.benutzer.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundError("Benutzer nicht gefunden");
  }

  return db.benutzer.update({
    where: { id },
    data: { aktiv: true },
  });
}

export async function changeUserPassword(
  db: PrismaClient,
  userId: number,
  newPassword: string,
  clearMustChange = true,
) {
  const passwortHash = await hashPassword(newPassword);

  return db.benutzer.update({
    where: { id: userId },
    data: {
      passwortHash,
      ...(clearMustChange ? { mustChangePassword: false } : {}),
    },
  });
}

export async function setMailAbo(
  db: PrismaClient,
  id: number,
  mailAbo: boolean,
) {
  const user = await db.benutzer.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundError("Benutzer nicht gefunden");
  }

  return db.benutzer.update({
    where: { id },
    data: { mailAbo },
  });
}

export async function deleteUser(db: PrismaClient, id: number) {
  const user = await db.benutzer.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundError("Benutzer nicht gefunden");
  }

  if (user.rolle === "ADMIN") {
    const adminCount = await db.benutzer.count({
      where: { rolle: "ADMIN", aktiv: true },
    });
    if (user.aktiv && adminCount <= 1) {
      throw new ValidationError(
        "Der letzte aktive Admin kann nicht gelöscht werden.",
      );
    }
  }

  return db.benutzer.delete({ where: { id } });
}
