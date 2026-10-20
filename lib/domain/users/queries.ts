import type { PrismaClient, Rolle } from "@/app/generated/prisma/client";

export type UserSummary = {
  id: number;
  name: string;
  email: string;
  rolle: Rolle;
  aktiv: boolean;
  mailAbo: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
};

export async function listUsers(db: PrismaClient): Promise<UserSummary[]> {
  return db.benutzer.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      rolle: true,
      aktiv: true,
      mailAbo: true,
      mustChangePassword: true,
      createdAt: true,
    },
    orderBy: [{ rolle: "asc" }, { name: "asc" }],
  });
}

export async function getUserById(db: PrismaClient, id: number) {
  return db.benutzer.findUnique({ where: { id } });
}

export async function listMailRecipients(db: PrismaClient) {
  return db.benutzer.findMany({
    where: { rolle: "LESER", aktiv: true, mailAbo: true },
    select: { id: true, email: true, name: true },
  });
}
